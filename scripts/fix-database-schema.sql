-- Script para corrigir automaticamente o esquema da tabela vagas
-- Execute este script no Supabase SQL Editor

DO $$
DECLARE
    column_exists_produto BOOLEAN;
    column_exists_celula BOOLEAN;
    column_exists_titulo BOOLEAN;
    vaga_count INTEGER;
BEGIN
    -- Verificar se a coluna 'produto' existe
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vagas' 
        AND column_name = 'produto'
        AND table_schema = 'public'
    ) INTO column_exists_produto;

    -- Verificar se a coluna 'celula' existe
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vagas' 
        AND column_name = 'celula'
        AND table_schema = 'public'
    ) INTO column_exists_celula;

    -- Verificar se a coluna 'titulo' existe
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vagas' 
        AND column_name = 'titulo'
        AND table_schema = 'public'
    ) INTO column_exists_titulo;

    -- Contar vagas existentes
    SELECT COUNT(*) INTO vaga_count FROM vagas;

    RAISE NOTICE '=== DIAGNÓSTICO DO BANCO DE DADOS ===';
    RAISE NOTICE 'Vagas existentes: %', vaga_count;
    RAISE NOTICE 'Coluna "produto" existe: %', column_exists_produto;
    RAISE NOTICE 'Coluna "celula" existe: %', column_exists_celula;
    RAISE NOTICE 'Coluna "titulo" existe: %', column_exists_titulo;

    -- Cenário 1: Apenas 'produto' existe (migração necessária)
    IF column_exists_produto AND NOT column_exists_celula THEN
        RAISE NOTICE '=== INICIANDO MIGRAÇÃO: produto → celula ===';
        
        -- 1. Adicionar coluna celula
        ALTER TABLE vagas ADD COLUMN celula VARCHAR(255);
        RAISE NOTICE '✓ Coluna "celula" adicionada';
        
        -- 2. Copiar dados de produto para celula
        UPDATE vagas SET celula = produto WHERE produto IS NOT NULL;
        RAISE NOTICE '✓ Dados copiados de "produto" para "celula"';
        
        -- 3. Tornar celula NOT NULL (após copiar os dados)
        ALTER TABLE vagas ALTER COLUMN celula SET NOT NULL;
        RAISE NOTICE '✓ Coluna "celula" definida como NOT NULL';
        
        -- 4. Adicionar coluna titulo se não existir
        IF NOT column_exists_titulo THEN
            ALTER TABLE vagas ADD COLUMN titulo VARCHAR(255);
            RAISE NOTICE '✓ Coluna "titulo" adicionada';
        END IF;
        
        -- 5. Remover coluna produto
        ALTER TABLE vagas DROP COLUMN produto;
        RAISE NOTICE '✓ Coluna "produto" removida';
        
        -- 6. Criar índices
        CREATE INDEX IF NOT EXISTS idx_vagas_celula ON vagas(celula);
        CREATE INDEX IF NOT EXISTS idx_vagas_titulo ON vagas(titulo);
        RAISE NOTICE '✓ Índices criados';
        
        RAISE NOTICE '=== MIGRAÇÃO CONCLUÍDA COM SUCESSO! ===';

    -- Cenário 2: Ambas as colunas existem (limpeza necessária)
    ELSIF column_exists_produto AND column_exists_celula THEN
        RAISE NOTICE '=== LIMPANDO COLUNA DUPLICADA: produto ===';
        
        -- Verificar se há dados em produto que não estão em celula
        IF EXISTS (SELECT 1 FROM vagas WHERE produto IS NOT NULL AND celula IS NULL) THEN
            UPDATE vagas SET celula = produto WHERE produto IS NOT NULL AND celula IS NULL;
            RAISE NOTICE '✓ Dados restantes de "produto" copiados para "celula"';
        END IF;
        
        -- Remover coluna produto
        ALTER TABLE vagas DROP COLUMN produto;
        RAISE NOTICE '✓ Coluna "produto" removida';
        
        -- Adicionar coluna titulo se não existir
        IF NOT column_exists_titulo THEN
            ALTER TABLE vagas ADD COLUMN titulo VARCHAR(255);
            RAISE NOTICE '✓ Coluna "titulo" adicionada';
        END IF;
        
        -- Criar índices se não existirem
        CREATE INDEX IF NOT EXISTS idx_vagas_celula ON vagas(celula);
        CREATE INDEX IF NOT EXISTS idx_vagas_titulo ON vagas(titulo);
        RAISE NOTICE '✓ Índices verificados/criados';
        
        RAISE NOTICE '=== LIMPEZA CONCLUÍDA COM SUCESSO! ===';

    -- Cenário 3: Apenas 'celula' existe (tudo ok)
    ELSIF column_exists_celula AND NOT column_exists_produto THEN
        RAISE NOTICE '=== SCHEMA JÁ ESTÁ CORRETO ===';
        
        -- Garantir que titulo existe
        IF NOT column_exists_titulo THEN
            ALTER TABLE vagas ADD COLUMN titulo VARCHAR(255);
            RAISE NOTICE '✓ Coluna "titulo" adicionada';
        END IF;
        
        -- Garantir que celula é NOT NULL
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'vagas' 
            AND column_name = 'celula'
            AND is_nullable = 'YES'
        ) THEN
            ALTER TABLE vagas ALTER COLUMN celula SET NOT NULL;
            RAISE NOTICE '✓ Coluna "celula" definida como NOT NULL';
        END IF;
        
        -- Criar índices se não existirem
        CREATE INDEX IF NOT EXISTS idx_vagas_celula ON vagas(celula);
        CREATE INDEX IF NOT EXISTS idx_vagas_titulo ON vagas(titulo);
        RAISE NOTICE '✓ Índices verificados/criados';
        
        RAISE NOTICE '=== VERIFICAÇÃO CONCLUÍDA - TUDO OK! ===';

    -- Cenário 4: Nenhuma das colunas existe (erro crítico)
    ELSE
        RAISE NOTICE '=== ERRO CRÍTICO: NENHUMA COLUNA ENCONTRADA ===';
        RAISE NOTICE 'Execute o script completo: database/schema.sql';
        RAISE EXCEPTION 'Schema da tabela vagas está incorreto';
    END IF;

END $$;

-- Relatório final
SELECT 
    'RELATÓRIO FINAL' as status,
    COUNT(*) as total_vagas,
    COUNT(celula) as vagas_com_celula,
    COUNT(titulo) as vagas_com_titulo
FROM vagas;

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'vagas' 
AND table_schema = 'public'
AND column_name IN ('produto', 'celula', 'titulo')
ORDER BY ordinal_position;
