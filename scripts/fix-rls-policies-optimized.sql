-- Script para corrigir políticas RLS otimizadas
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas problemáticas da tabela users
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins have full control over users" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_all_admin" ON users;

-- 2. Criar políticas RLS otimizadas para users (sem recursão)
-- Política para usuários verem seus próprios dados
CREATE POLICY "users_select_own_optimized" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Política para admins verem todos os usuários (usando auth.jwt() em vez de consultar users)
CREATE POLICY "users_select_admin_optimized" ON users
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Política para admins terem controle total (usando auth.jwt())
CREATE POLICY "users_all_admin_optimized" ON users
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- 3. Corrigir políticas de outras tabelas que consultam users
-- Lista de políticas que precisam ser corrigidas
DROP POLICY IF EXISTS "Admins have full control over vagas" ON vagas;
DROP POLICY IF EXISTS "Admins have full control over backup_logs" ON backup_logs;
DROP POLICY IF EXISTS "Admins have full control over contact_email_config" ON contact_email_config;
DROP POLICY IF EXISTS "Admins have full control over emailjs_config" ON emailjs_config;
DROP POLICY IF EXISTS "Admins have full control over system_control" ON system_control;
DROP POLICY IF EXISTS "Admins have full control over admin_sovereignty" ON admin_sovereignty;
DROP POLICY IF EXISTS "Admins have full control over admin_audit_log" ON admin_audit_log;

-- Criar novas políticas otimizadas sem recursão
CREATE POLICY "Admins have full control over vagas" ON vagas
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over backup_logs" ON backup_logs
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over contact_email_config" ON contact_email_config
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over emailjs_config" ON emailjs_config
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over system_control" ON system_control
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over admin_sovereignty" ON admin_sovereignty
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over admin_audit_log" ON admin_audit_log
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- 4. Políticas para usuários RH (se necessário)
-- Permitir que usuários RH vejam e criem vagas
CREATE POLICY "RH can manage vagas" ON vagas
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH')
  );

-- 5. Políticas para reports (se a tabela existir)
DROP POLICY IF EXISTS "Users can view reports" ON reports;
DROP POLICY IF EXISTS "Admins can manage reports" ON reports;

CREATE POLICY "Users can view reports" ON reports
  FOR SELECT USING (
    reported_by = auth.uid()::text OR 
    assigned_to = auth.uid()::text OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins can manage reports" ON reports
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- 6. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 7. Comentário final
COMMENT ON POLICY "users_select_admin_optimized" ON users IS 'Política otimizada para admins usando auth.jwt() sem recursão';
COMMENT ON POLICY "Admins have full control over vagas" ON vagas IS 'Política otimizada para admins usando auth.jwt() sem recursão';
