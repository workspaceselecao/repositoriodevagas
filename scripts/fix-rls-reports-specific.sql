-- =============================================
-- CORREÇÃO ESPECÍFICA PARA ERRO RLS DE REPORTS
-- =============================================
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Verificar políticas existentes
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reports'
ORDER BY policyname;

-- 2. Remover TODAS as políticas existentes da tabela reports
DROP POLICY IF EXISTS "RH users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports;
DROP POLICY IF EXISTS "Allow authenticated users to insert reports" ON reports;
DROP POLICY IF EXISTS "Allow RH users to insert reports" ON reports;

-- 3. Criar políticas RLS corrigidas e funcionais

-- Política: Usuários RH podem criar reports (POLÍTICA PRINCIPAL)
CREATE POLICY "RH users can create reports" ON reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'RH'
    )
  );

-- Política: Usuários podem ver reports onde são o reporter ou o assignee
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (
    auth.uid() = reported_by OR 
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

-- Política: Admins podem atualizar reports
CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

-- Política: Admins podem deletar reports
CREATE POLICY "Admins can delete reports" ON reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

-- 4. Verificar se RLS está habilitado na tabela
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'reports';

-- 5. Habilitar RLS se não estiver habilitado
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 6. Verificar se as políticas foram criadas corretamente
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reports'
ORDER BY policyname;

-- 7. Teste básico (opcional - descomente para testar)
-- INSERT INTO reports (vaga_id, reported_by, assigned_to, field_name, suggested_changes)
-- SELECT 
--   (SELECT id FROM vagas LIMIT 1),
--   (SELECT id FROM users WHERE role = 'RH' LIMIT 1),
--   (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1),
--   'site',
--   'Teste de report após correção RLS';

-- SELECT * FROM reports WHERE suggested_changes = 'Teste de report após correção RLS';

-- DELETE FROM reports WHERE suggested_changes = 'Teste de report após correção RLS';
