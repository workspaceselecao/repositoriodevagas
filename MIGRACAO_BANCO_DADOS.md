# 🗄️ Migração do Banco de Dados - Repositório de Vagas

## ❌ Problema Identificado

O sistema está apresentando erro ao salvar vagas:
```
null value in column "produto" of relation "vagas" violates not-null constraint
```

**Causa:** O banco de dados ainda possui a coluna `produto` em vez de `celula`.

## ✅ Solução

### Opção 1: Script Automático (Recomendado)

1. **Acesse o Supabase:**
   - Vá para [supabase.com](https://supabase.com)
   - Entre no seu projeto
   - Vá para **SQL Editor**

2. **Execute o Script:**
   ```sql
   -- Cole todo o conteúdo do arquivo scripts/fix-database-schema.sql
   ```
   
   **OU execute diretamente:**
   
   ```sql
   -- Script para corrigir automaticamente o esquema da tabela vagas
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
   ```

3. **Verifique o Resultado:**
   - O script mostrará mensagens de progresso
   - Verifique se apareceu "MIGRAÇÃO CONCLUÍDA COM SUCESSO!"

### Opção 2: Scripts Manuais

Se preferir executar passo a passo:

1. **Para migração simples:** `scripts/migrate-produto-to-celula.sql`
2. **Para diagnóstico completo:** `scripts/check-database-columns.sql`

## 🧪 Teste Pós-Migração

Após executar a migração:

1. **Volte para a aplicação**
2. **Clique em "Testar Conexão"** no formulário de Nova Vaga
3. **Verifique se aparece:** ✅ "Conexão com Supabase OK - Tudo funcionando!"
4. **Tente criar uma nova vaga** para confirmar que está funcionando

## 📋 Estrutura Esperada

Após a migração, a tabela `vagas` deve ter:

```sql
CREATE TABLE vagas (
  id UUID PRIMARY KEY,
  site VARCHAR(255) NOT NULL,
  categoria VARCHAR(255) NOT NULL,
  cargo VARCHAR(255) NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  titulo VARCHAR(255),           -- ✅ Adicionada
  celula VARCHAR(255) NOT NULL,  -- ✅ Migrada de 'produto'
  descricao_vaga TEXT,
  responsabilidades_atribuicoes TEXT,
  requisitos_qualificacoes TEXT,
  salario VARCHAR(255),
  horario_trabalho VARCHAR(255),
  jornada_trabalho VARCHAR(255),
  beneficios TEXT,
  local_trabalho TEXT,
  etapas_processo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);
```

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs** no Supabase SQL Editor
2. **Use o botão "Testar Conexão"** na aplicação
3. **Verifique se todas as colunas obrigatórias** estão preenchidas no formulário

---

**⚠️ IMPORTANTE:** Sempre faça backup dos dados antes de executar scripts de migração!
