-- =============================================
-- CORREÇÃO DE ERROS DE RLS PARA SISTEMA DE REPORTS
-- =============================================
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Allow authenticated users to insert reports" ON reports;
DROP POLICY IF EXISTS "RH users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports;

-- 2. Criar políticas RLS corrigidas

-- Política: Usuários RH podem criar reports
CREATE POLICY "RH users can create reports" ON reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'RH'
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

-- 3. Verificar se a tabela users tem os dados corretos
-- Execute esta consulta para verificar os usuários e suas roles:
SELECT id, email, name, role FROM users ORDER BY role, name;

-- 4. Se necessário, atualizar a role de um usuário específico:
-- UPDATE users SET role = 'RH' WHERE email = 'seu-email@exemplo.com';
-- UPDATE users SET role = 'ADMIN' WHERE email = 'admin@exemplo.com';

-- =============================================
-- VERIFICAÇÃO DAS POLÍTICAS
-- =============================================
-- Execute estas consultas para verificar se as políticas foram criadas corretamente:

-- Verificar políticas RLS da tabela reports
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reports'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'reports';

-- =============================================
-- TESTE BÁSICO (OPCIONAL)
-- =============================================
-- Descomente as linhas abaixo para fazer um teste básico:

-- INSERT INTO reports (vaga_id, reported_by, assigned_to, field_name, suggested_changes)
-- SELECT 
--   (SELECT id FROM vagas LIMIT 1),
--   (SELECT id FROM users WHERE role = 'RH' LIMIT 1),
--   (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1),
--   'site',
--   'Teste de report após correção RLS';

-- SELECT * FROM reports WHERE suggested_changes = 'Teste de report após correção RLS';

-- DELETE FROM reports WHERE suggested_changes = 'Teste de report após correção RLS';
