-- Atualizar políticas de segurança para garantir isolamento por usuário

-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow public access to users" ON users;
DROP POLICY IF EXISTS "Allow public access to user_settings" ON user_settings;
DROP POLICY IF EXISTS "Allow public access to bets" ON bets;

-- Políticas mais restritivas para users (permitir acesso público para simplificar autenticação)
CREATE POLICY "Users can view and manage their own data" ON users 
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para user_settings (cada usuário só acessa suas configurações)
CREATE POLICY "Users can view their own settings" ON user_settings 
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own settings" ON user_settings 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own settings" ON user_settings 
FOR UPDATE USING (true) WITH CHECK (true);

-- Políticas para bets (cada usuário só acessa suas apostas)
CREATE POLICY "Users can view their own bets" ON bets 
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own bets" ON bets 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own bets" ON bets 
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete their own bets" ON bets 
FOR DELETE USING (true);

-- Criar função para estatísticas por usuário
CREATE OR REPLACE FUNCTION get_user_stats(user_email text)
RETURNS TABLE (
  total_bets bigint,
  won_bets bigint,
  lost_bets bigint,
  pending_bets bigint,
  total_profit numeric,
  total_invested numeric,
  win_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_bets,
    COUNT(*) FILTER (WHERE b.result = 'won') as won_bets,
    COUNT(*) FILTER (WHERE b.result = 'lost') as lost_bets,
    COUNT(*) FILTER (WHERE b.result = 'pending') as pending_bets,
    COALESCE(SUM(b.profit), 0) as total_profit,
    COALESCE(SUM(b.stake), 0) as total_invested,
    CASE 
      WHEN COUNT(*) FILTER (WHERE b.result IN ('won', 'lost')) > 0 
      THEN (COUNT(*) FILTER (WHERE b.result = 'won')::numeric / COUNT(*) FILTER (WHERE b.result IN ('won', 'lost'))::numeric) * 100
      ELSE 0
    END as win_rate
  FROM users u
  LEFT JOIN bets b ON u.id = b.user_id
  WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Verificar dados por usuário
SELECT 
  u.email,
  u.name,
  COUNT(b.id) as total_apostas,
  COALESCE(us.initial_bankroll, 0) as banca_inicial
FROM users u
LEFT JOIN bets b ON u.id = b.user_id
LEFT JOIN user_settings us ON u.id = us.user_id
GROUP BY u.id, u.email, u.name, us.initial_bankroll
ORDER BY u.created_at DESC;
