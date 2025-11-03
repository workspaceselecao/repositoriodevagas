-- ===========================================
-- CORREÇÃO CRÍTICA: PERMITIR VISUALIZAÇÃO DE VAGAS SEM AUTENTICAÇÃO
-- ===========================================
-- Este script corrige o problema de vagas não aparecerem na aplicação
-- Problema: A política RLS atual exige autenticação para visualizar vagas
-- Solução: Permitir que qualquer pessoa (autenticada ou não) possa visualizar vagas

-- 1. Habilitar RLS na tabela vagas
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;

-- 2. Remover política de visualização existente (restringida)
DROP POLICY IF EXISTS "Authenticated users can view vagas" ON vagas;

-- 3. Criar política que PERMITE visualização para TODOS (autenticados e não-autenticados)
CREATE POLICY "Anyone can view vagas" ON vagas
  FOR SELECT USING (true);

-- 4. Verificar se a política foi criada corretamente
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies
WHERE tablename = 'vagas'
  AND cmd = 'SELECT';

-- ===========================================
-- RESULTADO ESPERADO:
-- Uma linha com policyname = "Anyone can view vagas"
-- e qual = "true"
-- ===========================================

