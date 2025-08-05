-- Inserir usuário de exemplo (apenas se não existir)
INSERT INTO users (id, email, name) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', 
  'usuario@exemplo.com', 
  'Usuário Exemplo'
)
ON CONFLICT (email) DO NOTHING;

-- Inserir configurações iniciais para o usuário de exemplo
INSERT INTO user_settings (user_id, initial_bankroll)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', 
  2000.00
)
ON CONFLICT (user_id) DO NOTHING;

-- Inserir apostas de exemplo
INSERT INTO bets (user_id, date, sport, match_name, bet_type, odds, stake, result, profit) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000', 
  '2024-01-15', 
  'Futebol', 
  'Flamengo vs Palmeiras', 
  'Vitória do Flamengo', 
  2.50, 
  100.00, 
  'won', 
  150.00
),
(
  '550e8400-e29b-41d4-a716-446655440000', 
  '2024-01-14', 
  'Basquete', 
  'Lakers vs Warriors', 
  'Over 220.5 pontos', 
  1.80, 
  50.00, 
  'lost', 
  -50.00
),
(
  '550e8400-e29b-41d4-a716-446655440000', 
  '2024-01-13', 
  'Tênis', 
  'Djokovic vs Nadal', 
  'Vitória Djokovic', 
  1.60, 
  200.00, 
  'pending', 
  0.00
),
(
  '550e8400-e29b-41d4-a716-446655440000', 
  '2024-01-12', 
  'Futebol', 
  'Real Madrid vs Barcelona', 
  'Ambas marcam', 
  1.75, 
  150.00, 
  'won', 
  112.50
),
(
  '550e8400-e29b-41d4-a716-446655440000', 
  '2024-01-11', 
  'UFC', 
  'Jones vs Miocic', 
  'Vitória Jones', 
  1.45, 
  300.00, 
  'won', 
  135.00
)
ON CONFLICT DO NOTHING;

-- Verificar os dados inseridos
SELECT 
  'Total de usuários' as info, 
  COUNT(*)::text as valor 
FROM users
UNION ALL
SELECT 
  'Total de configurações' as info, 
  COUNT(*)::text as valor 
FROM user_settings
UNION ALL
SELECT 
  'Total de apostas' as info, 
  COUNT(*)::text as valor 
FROM bets
UNION ALL
SELECT 
  'Apostas ganhas' as info, 
  COUNT(*)::text as valor 
FROM bets WHERE result = 'won'
UNION ALL
SELECT 
  'Apostas perdidas' as info, 
  COUNT(*)::text as valor 
FROM bets WHERE result = 'lost'
UNION ALL
SELECT 
  'Apostas pendentes' as info, 
  COUNT(*)::text as valor 
FROM bets WHERE result = 'pending';
