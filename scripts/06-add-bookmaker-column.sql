-- Script para adicionar coluna bookmaker em tabelas existentes
-- Execute este script se você já tem dados existentes

-- Adicionar coluna bookmaker na tabela bets se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bets' 
        AND column_name = 'bookmaker'
    ) THEN
        ALTER TABLE bets ADD COLUMN bookmaker VARCHAR(100) NOT NULL DEFAULT 'Outras';
    END IF;
END $$;

-- Verificar se a coluna foi adicionada
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'bets' 
AND column_name = 'bookmaker'; 