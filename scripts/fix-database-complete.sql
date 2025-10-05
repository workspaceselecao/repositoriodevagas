-- Script completo para corrigir problemas no banco de dados
-- Execute este script no Supabase SQL Editor

-- 1. Inserir registro inicial na tabela system_control
INSERT INTO system_control (id, is_blocked, created_at, updated_at) 
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Verificar se o registro foi inserido
SELECT 'system_control' as tabela, id, is_blocked, created_at FROM system_control;

-- 3. Remover políticas RLS problemáticas (que causam recursão)
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins have full control over users" ON users;
DROP POLICY IF EXISTS "Admins have full control over vagas" ON vagas;
DROP POLICY IF EXISTS "Admins have full control over backup_logs" ON backup_logs;
DROP POLICY IF EXISTS "Admins have full control over contact_email_config" ON contact_email_config;
DROP POLICY IF EXISTS "Admins have full control over emailjs_config" ON emailjs_config;
DROP POLICY IF EXISTS "Admins have full control over system_control" ON system_control;
DROP POLICY IF EXISTS "Admins have full control over admin_sovereignty" ON admin_sovereignty;
DROP POLICY IF EXISTS "Admins have full control over admin_audit_log" ON admin_audit_log;
DROP POLICY IF EXISTS "Authenticated users can view vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can manage backup logs" ON backup_logs;
DROP POLICY IF EXISTS "Admin can manage contact email config" ON contact_email_config;
DROP POLICY IF EXISTS "Admin can manage emailjs config" ON emailjs_config;
DROP POLICY IF EXISTS "Admin can manage system control" ON system_control;

-- 4. Criar políticas RLS simplificadas (sem recursão)
-- Política para system_control (liberar acesso para admins)
CREATE POLICY "system_control_admin_access" ON system_control
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Política para vagas (permitir inserção para admins)
CREATE POLICY "vagas_admin_insert" ON vagas
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Política para vagas (permitir visualização para todos autenticados)
CREATE POLICY "vagas_select_all" ON vagas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para vagas (permitir update para admins)
CREATE POLICY "vagas_admin_update" ON vagas
  FOR UPDATE USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Política para vagas (permitir delete para admins)
CREATE POLICY "vagas_admin_delete" ON vagas
  FOR DELETE USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Política para users (permitir visualização para admins)
CREATE POLICY "users_admin_select" ON users
  FOR SELECT USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Política para users (permitir todos os operações para admins)
CREATE POLICY "users_admin_all" ON users
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- 5. Verificar políticas criadas
SELECT 'Políticas RLS criadas:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('vagas', 'system_control', 'users')
ORDER BY tablename, policyname;

-- 6. Testar inserção
SELECT 'Testando inserção...' as status;

-- Inserir uma vaga de teste
INSERT INTO vagas (
  site, 
  categoria, 
  cargo, 
  cliente, 
  celula,
  salario,
  beneficios,
  local_trabalho,
  etapas_processo,
  requisitos_qualificacoes,
  horario_trabalho,
  created_by
) VALUES (
  'TESTE_FIX',
  'TESTE',
  'TESTE',
  'TESTE',
  'TESTE',
  'R$ 1.000,00',
  'Teste',
  'Teste',
  'Teste',
  'Teste',
  'Teste',
  '63b5dd5b-c5d1-4b28-921a-1936447da1c1'::uuid
) RETURNING id;

-- Limpar dados de teste
DELETE FROM vagas WHERE site = 'TESTE_FIX';

SELECT 'Banco de dados corrigido com sucesso!' as status;
