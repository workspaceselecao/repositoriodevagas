-- Script para corrigir políticas RLS que causam recursão infinita
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas problemáticas da tabela users
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins have full control over users" ON users;

-- 2. Criar políticas RLS corrigidas para users
-- Política para usuários verem seus próprios dados (sem recursão)
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Política para admins verem todos os usuários (usando auth.jwt() em vez de consultar users)
CREATE POLICY "users_select_admin" ON users
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Política para admins terem controle total (usando auth.jwt())
CREATE POLICY "users_all_admin" ON users
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
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

-- Criar novas políticas sem recursão
CREATE POLICY "Admins have full control over vagas" ON vagas
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over backup_logs" ON backup_logs
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over contact_email_config" ON contact_email_config
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over emailjs_config" ON emailjs_config
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over system_control" ON system_control
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over admin_sovereignty" ON admin_sovereignty
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over admin_audit_log" ON admin_audit_log
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- 4. Corrigir políticas específicas de vagas
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;

CREATE POLICY "RH and Admin can insert vagas" ON vagas
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('RH', 'ADMIN') OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('RH', 'ADMIN')
  );

CREATE POLICY "RH and Admin can update vagas" ON vagas
  FOR UPDATE USING (
    auth.jwt() ->> 'role' IN ('RH', 'ADMIN') OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('RH', 'ADMIN')
  );

CREATE POLICY "Admin can delete vagas" ON vagas
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- 5. Corrigir política de backup_logs
DROP POLICY IF EXISTS "Admin can manage backup logs" ON backup_logs;

CREATE POLICY "Admin can manage backup logs" ON backup_logs
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- 6. Corrigir políticas de configuração
DROP POLICY IF EXISTS "Admin can manage contact email config" ON contact_email_config;
DROP POLICY IF EXISTS "Admin can manage emailjs config" ON emailjs_config;
DROP POLICY IF EXISTS "Admin can manage system control" ON system_control;

CREATE POLICY "Admin can manage contact email config" ON contact_email_config
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admin can manage emailjs config" ON emailjs_config
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admin can manage system control" ON system_control
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('users', 'vagas', 'backup_logs', 'contact_email_config', 'emailjs_config', 'system_control', 'admin_sovereignty', 'admin_audit_log')
ORDER BY tablename, policyname;
