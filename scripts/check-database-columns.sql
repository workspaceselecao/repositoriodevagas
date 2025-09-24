-- Script para verificar e corrigir colunas da tabela vagas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela vagas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'vagas' 
ORDER BY ordinal_position;

-- 2. Verificar se existe coluna produto
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vagas' 
    AND column_name = 'produto'
) as has_produto_column;

-- 3. Verificar se existe coluna celula
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vagas' 
    AND column_name = 'celula'
) as has_celula_column;

-- 4. Se existe produto mas não celula, fazer migração
DO $$
BEGIN
    -- Verificar se existe coluna produto e não existe celula
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vagas' 
        AND column_name = 'produto'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vagas' 
        AND column_name = 'celula'
    ) THEN
        -- Adicionar coluna celula
        ALTER TABLE vagas ADD COLUMN celula VARCHAR(255);
        
        -- Copiar dados de produto para celula
        UPDATE vagas SET celula = produto WHERE produto IS NOT NULL;
        
        -- Tornar celula NOT NULL
        ALTER TABLE vagas ALTER COLUMN celula SET NOT NULL;
        
        -- Criar índice
        CREATE INDEX IF NOT EXISTS idx_vagas_celula ON vagas(celula);
        
        RAISE NOTICE 'Migração concluída: coluna produto -> celula';
    ELSE
        RAISE NOTICE 'Migração não necessária ou já concluída';
    END IF;
END $$;

-- 5. Verificar resultado final
SELECT 
    COUNT(*) as total_vagas,
    COUNT(CASE WHEN celula IS NOT NULL THEN 1 END) as vagas_com_celula,
    COUNT(CASE WHEN produto IS NOT NULL THEN 1 END) as vagas_com_produto
FROM vagas;
