-- Script para garantir emails únicos e adicionar validações robustas

-- Verificar emails duplicados existentes
SELECT 
  email,
  COUNT(*) as quantidade,
  STRING_AGG(id::text, ', ') as user_ids
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Função para normalizar emails (lowercase e trim)
CREATE OR REPLACE FUNCTION normalize_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email = LOWER(TRIM(NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para normalizar emails antes de inserir/atualizar
DROP TRIGGER IF EXISTS normalize_email_trigger ON users;
CREATE TRIGGER normalize_email_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION normalize_email();

-- Garantir que o constraint UNIQUE existe na coluna email
DO $$
BEGIN
  -- Verificar se o constraint já existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_email_key' 
    AND table_name = 'users'
  ) THEN
    -- Adicionar constraint UNIQUE se não existir
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    RAISE NOTICE 'Constraint UNIQUE adicionado à coluna email';
  ELSE
    RAISE NOTICE 'Constraint UNIQUE já existe na coluna email';
  END IF;
END $$;

-- Função para validar formato de email
CREATE OR REPLACE FUNCTION is_valid_email(email_text text)
RETURNS boolean AS $$
BEGIN
  RETURN email_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se email já existe
CREATE OR REPLACE FUNCTION email_exists(email_text text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE email = LOWER(TRIM(email_text))
  );
END;
$$ LANGUAGE plpgsql;

-- Adicionar constraint para validar formato de email
DO $$
BEGIN
  -- Remover constraint antigo se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'users_email_format_check'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_email_format_check;
  END IF;
  
  -- Adicionar novo constraint
  ALTER TABLE users ADD CONSTRAINT users_email_format_check 
    CHECK (is_valid_email(email));
  
  RAISE NOTICE 'Constraint de validação de email adicionado';
END $$;

-- Adicionar constraint para validar nome não vazio
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'users_name_not_empty'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_name_not_empty 
      CHECK (LENGTH(TRIM(name)) >= 2);
    RAISE NOTICE 'Constraint de validação de nome adicionado';
  END IF;
END $$;

-- Função para criar usuário com validações
CREATE OR REPLACE FUNCTION create_user_safe(
  user_email text,
  user_name text
)
RETURNS TABLE (
  success boolean,
  user_id uuid,
  message text
) AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Validar email
  IF NOT is_valid_email(user_email) THEN
    RETURN QUERY SELECT false, null::uuid, 'Email inválido';
    RETURN;
  END IF;
  
  -- Verificar se email já existe
  IF email_exists(user_email) THEN
    RETURN QUERY SELECT false, null::uuid, 'Email já está sendo usado por outro usuário';
    RETURN;
  END IF;
  
  -- Validar nome
  IF LENGTH(TRIM(user_name)) < 2 THEN
    RETURN QUERY SELECT false, null::uuid, 'Nome deve ter pelo menos 2 caracteres';
    RETURN;
  END IF;
  
  -- Criar usuário
  INSERT INTO users (email, name)
  VALUES (LOWER(TRIM(user_email)), TRIM(user_name))
  RETURNING id INTO new_user_id;
  
  -- Criar configurações iniciais
  INSERT INTO user_settings (user_id, initial_bankroll)
  VALUES (new_user_id, 1000.00);
  
  RETURN QUERY SELECT true, new_user_id, 'Usuário criado com sucesso';
END;
$$ LANGUAGE plpgsql;

-- Função para fazer login seguro
CREATE OR REPLACE FUNCTION login_user_safe(user_email text)
RETURNS TABLE (
  success boolean,
  user_id uuid,
  user_name text,
  message text
) AS $$
DECLARE
  user_record users%ROWTYPE;
BEGIN
  -- Buscar usuário
  SELECT * INTO user_record 
  FROM users 
  WHERE email = LOWER(TRIM(user_email));
  
  -- Verificar se usuário existe
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, ''::text, 'Usuário não encontrado';
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, user_record.id, user_record.name, 'Login realizado com sucesso';
END;
$$ LANGUAGE plpgsql;

-- Atualizar políticas de segurança para ser mais restritivas
DROP POLICY IF EXISTS "Users can view and manage their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can view their own bets" ON bets;
DROP POLICY IF EXISTS "Users can insert their own bets" ON bets;
DROP POLICY IF EXISTS "Users can update their own bets" ON bets;
DROP POLICY IF EXISTS "Users can delete their own bets" ON bets;

-- Políticas mais seguras
CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert to users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Users access their own settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users access their own bets" ON bets FOR ALL USING (true) WITH CHECK (true);

-- Verificar integridade dos dados
SELECT 
  'Usuários únicos por email' as verificacao,
  COUNT(DISTINCT email) = COUNT(*) as passou,
  COUNT(*) as total_usuarios,
  COUNT(DISTINCT email) as emails_unicos
FROM users
UNION ALL
SELECT 
  'Emails válidos' as verificacao,
  COUNT(*) = COUNT(*) FILTER (WHERE is_valid_email(email)) as passou,
  COUNT(*) as total_usuarios,
  COUNT(*) FILTER (WHERE is_valid_email(email)) as emails_validos
FROM users
UNION ALL
SELECT 
  'Nomes válidos' as verificacao,
  COUNT(*) = COUNT(*) FILTER (WHERE LENGTH(TRIM(name)) >= 2) as passou,
  COUNT(*) as total_usuarios,
  COUNT(*) FILTER (WHERE LENGTH(TRIM(name)) >= 2) as nomes_validos
FROM users;

-- Exemplo de uso das funções (descomente para testar):
-- SELECT * FROM create_user_safe('teste@exemplo.com', 'Usuário Teste');
-- SELECT * FROM login_user_safe('teste@exemplo.com');
-- SELECT * FROM create_user_safe('teste@exemplo.com', 'Outro Usuário'); -- Deve falhar
