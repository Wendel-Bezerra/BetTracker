-- Script para migrar apostas existentes adicionando a coluna bookmaker
-- Execute este script se você já tem apostas existentes sem o campo bookmaker

-- Verificar se a coluna bookmaker existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bets' 
        AND column_name = 'bookmaker'
    ) THEN
        -- Adicionar coluna bookmaker com valor padrão 'Outras'
        ALTER TABLE bets ADD COLUMN bookmaker VARCHAR(100) NOT NULL DEFAULT 'Outras';
        
        -- Atualizar registros existentes que possam ter NULL
        UPDATE bets SET bookmaker = 'Outras' WHERE bookmaker IS NULL;
        
        RAISE NOTICE 'Coluna bookmaker adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna bookmaker já existe!';
    END IF;
END $$;

-- Verificar o resultado da migração
SELECT 
    COUNT(*) as total_bets,
    COUNT(CASE WHEN bookmaker IS NOT NULL THEN 1 END) as bets_with_bookmaker,
    COUNT(CASE WHEN bookmaker IS NULL THEN 1 END) as bets_without_bookmaker
FROM bets;

-- Mostrar algumas apostas para verificar
SELECT 
    id,
    date,
    sport,
    match_name,
    bet_type,
    bookmaker,
    odds,
    stake,
    result
FROM bets 
ORDER BY created_at DESC 
LIMIT 5; 