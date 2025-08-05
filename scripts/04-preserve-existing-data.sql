-- Script para verificar e preservar dados existentes

-- Verificar se existem dados no banco
SELECT 
  'Usuários existentes' as tipo,
  COUNT(*) as quantidade
FROM users
UNION ALL
SELECT 
  'Apostas existentes' as tipo,
  COUNT(*) as quantidade
FROM bets
UNION ALL
SELECT 
  'Configurações existentes' as tipo,
  COUNT(*) as quantidade
FROM user_settings;

-- Mostrar dados detalhados por usuário
SELECT 
  u.email,
  u.name,
  u.created_at as usuario_criado_em,
  COUNT(b.id) as total_apostas,
  COALESCE(SUM(b.stake), 0) as total_investido,
  COALESCE(SUM(b.profit), 0) as lucro_total,
  us.initial_bankroll as banca_inicial
FROM users u
LEFT JOIN bets b ON u.id = b.user_id
LEFT JOIN user_settings us ON u.id = us.user_id
GROUP BY u.id, u.email, u.name, u.created_at, us.initial_bankroll
ORDER BY u.created_at DESC;

-- Verificar apostas por resultado
SELECT 
  u.email,
  b.result,
  COUNT(*) as quantidade,
  SUM(b.stake) as valor_total,
  SUM(b.profit) as lucro_total
FROM users u
JOIN bets b ON u.id = b.user_id
GROUP BY u.email, b.result
ORDER BY u.email, b.result;

-- Função para backup de dados de um usuário
CREATE OR REPLACE FUNCTION backup_user_data(user_email text)
RETURNS json AS $$
DECLARE
  user_data json;
BEGIN
  SELECT json_build_object(
    'user', json_build_object(
      'email', u.email,
      'name', u.name,
      'created_at', u.created_at
    ),
    'settings', json_build_object(
      'initial_bankroll', us.initial_bankroll,
      'created_at', us.created_at,
      'updated_at', us.updated_at
    ),
    'bets', json_agg(
      json_build_object(
        'id', b.id,
        'date', b.date,
        'sport', b.sport,
        'match_name', b.match_name,
        'bet_type', b.bet_type,
        'odds', b.odds,
        'stake', b.stake,
        'result', b.result,
        'profit', b.profit,
        'created_at', b.created_at,
        'updated_at', b.updated_at
      )
    )
  ) INTO user_data
  FROM users u
  LEFT JOIN user_settings us ON u.id = us.user_id
  LEFT JOIN bets b ON u.id = b.user_id
  WHERE u.email = user_email
  GROUP BY u.id, u.email, u.name, u.created_at, us.initial_bankroll, us.created_at, us.updated_at;
  
  RETURN user_data;
END;
$$ LANGUAGE plpgsql;

-- Exemplo de uso da função de backup (descomente para usar):
-- SELECT backup_user_data('seu@email.com');
