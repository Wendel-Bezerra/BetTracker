-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  initial_bankroll DECIMAL(10,2) DEFAULT 1000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Criar tabela de apostas
CREATE TABLE IF NOT EXISTS bets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sport VARCHAR(100) NOT NULL,
  match_name VARCHAR(255) NOT NULL,
  bet_type VARCHAR(255) NOT NULL,
  bookmaker VARCHAR(100) NOT NULL,
  odds DECIMAL(5,2) NOT NULL CHECK (odds > 0),
  stake DECIMAL(10,2) NOT NULL CHECK (stake > 0),
  result VARCHAR(20) CHECK (result IN ('pending', 'won', 'lost')) DEFAULT 'pending',
  profit DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_date ON bets(date DESC);
CREATE INDEX IF NOT EXISTS idx_bets_result ON bets(result);
CREATE INDEX IF NOT EXISTS idx_bets_sport ON bets(sport);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (permitir acesso público por enquanto para simplificar)
-- Em produção, você deve implementar autenticação adequada

-- Políticas para users
DROP POLICY IF EXISTS "Allow public access to users" ON users;
CREATE POLICY "Allow public access to users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Políticas para user_settings
DROP POLICY IF EXISTS "Allow public access to user_settings" ON user_settings;
CREATE POLICY "Allow public access to user_settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);

-- Políticas para bets
DROP POLICY IF EXISTS "Allow public access to bets" ON bets;
CREATE POLICY "Allow public access to bets" ON bets FOR ALL USING (true) WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela user_settings
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at na tabela bets
DROP TRIGGER IF EXISTS update_bets_updated_at ON bets;
CREATE TRIGGER update_bets_updated_at
    BEFORE UPDATE ON bets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar se as tabelas foram criadas
SELECT 
  'users' as table_name, 
  COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 
  'user_settings' as table_name, 
  COUNT(*) as record_count 
FROM user_settings
UNION ALL
SELECT 
  'bets' as table_name, 
  COUNT(*) as record_count 
FROM bets;
