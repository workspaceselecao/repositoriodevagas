-- Script de migração: Renomear coluna produto para celula e adicionar coluna titulo
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar nova coluna titulo
ALTER TABLE vagas ADD COLUMN IF NOT EXISTS titulo VARCHAR(255);

-- 2. Adicionar nova coluna celula
ALTER TABLE vagas ADD COLUMN IF NOT EXISTS celula VARCHAR(255);

-- 3. Copiar dados de produto para celula
UPDATE vagas SET celula = produto WHERE produto IS NOT NULL;

-- 4. Tornar celula NOT NULL (após copiar os dados)
ALTER TABLE vagas ALTER COLUMN celula SET NOT NULL;

-- 5. Remover coluna produto (opcional - comentado para segurança)
-- ALTER TABLE vagas DROP COLUMN produto;

-- 6. Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_vagas_celula ON vagas(celula);
CREATE INDEX IF NOT EXISTS idx_vagas_titulo ON vagas(titulo);

-- 7. Remover índice antigo (opcional - comentado para segurança)
-- DROP INDEX IF EXISTS idx_vagas_produto;

-- Verificar resultado
SELECT 
  COUNT(*) as total_vagas,
  COUNT(celula) as vagas_com_celula,
  COUNT(titulo) as vagas_com_titulo
FROM vagas;
