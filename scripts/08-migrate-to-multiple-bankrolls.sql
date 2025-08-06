-- Script para migrar dados existentes para suportar múltiplas bankrolls
-- Execute este script para atualizar a estrutura do banco

-- 1. Adicionar colunas na tabela user_settings
DO $$ 
BEGIN
    -- Adicionar coluna bankroll_name se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'bankroll_name'
    ) THEN
        ALTER TABLE user_settings ADD COLUMN bankroll_name TEXT NOT NULL DEFAULT 'Banca Principal';
    END IF;

    -- Adicionar coluna is_premium se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'is_premium'
    ) THEN
        ALTER TABLE user_settings ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Adicionar coluna bankroll_id na tabela bets
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bets' 
        AND column_name = 'bankroll_id'
    ) THEN
        ALTER TABLE bets ADD COLUMN bankroll_id TEXT;
        
        -- Atualizar apostas existentes para usar a bankroll principal
        UPDATE bets 
        SET bankroll_id = (
            SELECT id 
            FROM user_settings 
            WHERE user_settings.user_id = bets.user_id 
            LIMIT 1
        );
        
        -- Tornar a coluna NOT NULL após atualizar os dados
        ALTER TABLE bets ALTER COLUMN bankroll_id SET NOT NULL;
        
        -- Adicionar foreign key
        ALTER TABLE bets ADD CONSTRAINT fk_bets_bankroll 
        FOREIGN KEY (bankroll_id) REFERENCES user_settings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Verificar se a migração foi bem-sucedida
SELECT 
    'user_settings' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN bankroll_name IS NOT NULL THEN 1 END) as with_bankroll_name,
    COUNT(CASE WHEN is_premium IS NOT NULL THEN 1 END) as with_premium_status
FROM user_settings
UNION ALL
SELECT 
    'bets' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN bankroll_id IS NOT NULL THEN 1 END) as with_bankroll_id,
    0 as with_premium_status
FROM bets;

-- 4. Mostrar algumas bankrolls para verificar
SELECT 
    id,
    user_id,
    bankroll_name,
    initial_bankroll,
    is_premium,
    created_at
FROM user_settings 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Mostrar algumas apostas com bankroll_id
SELECT 
    id,
    user_id,
    bankroll_id,
    date,
    sport,
    match_name,
    bookmaker
FROM bets 
ORDER BY created_at DESC 
LIMIT 5; 