-- Script básico para fazer o login funcionar
-- Execute este script no Supabase SQL Editor

-- ========================================
-- CONFIGURAÇÃO BÁSICA PARA LOGIN
-- ========================================

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own data and admins see all" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;
DROP POLICY IF EXISTS "Authenticated users can view vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;
DROP POLICY IF EXISTS "vagas_select_policy" ON vagas;
DROP POLICY IF EXISTS "vagas_insert_policy" ON vagas;
DROP POLICY IF EXISTS "vagas_update_policy" ON vagas;
DROP POLICY IF EXISTS "vagas_delete_policy" ON vagas;
DROP POLICY IF EXISTS "Admin can manage backup logs" ON backup_logs;
DROP POLICY IF EXISTS "backup_logs_all_policy" ON backup_logs;

-- 2. Remover funções antigas
DROP FUNCTION IF EXISTS get_current_user_role();
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_rh_or_admin();
DROP FUNCTION IF EXISTS is_user_rh_or_admin();

-- 3. Configurar RLS de forma básica
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas básicas e simples
-- Política para users: permitir acesso para usuários autenticados
CREATE POLICY "users_basic_access" ON users
  FOR ALL USING (auth.role() = 'authenticated');

-- Política para vagas: permitir acesso para usuários autenticados
CREATE POLICY "vagas_basic_access" ON vagas
  FOR ALL USING (auth.role() = 'authenticated');

-- Política para backup_logs: permitir acesso para usuários autenticados
CREATE POLICY "backup_logs_basic_access" ON backup_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- VERIFICAÇÃO
-- ========================================

-- Verificar se as políticas foram criadas
SELECT 
  'policies_created' as status,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename, policyname;

-- Verificar se o RLS está ativo
SELECT 
  'rls_status' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename;

-- Testar acesso básico
SELECT 
  'access_test' as status,
  'users' as table_name,
  COUNT(*) as record_count
FROM users;

SELECT 
  'access_test' as status,
  'vagas' as table_name,
  COUNT(*) as record_count
FROM vagas;

-- ========================================
-- INSTRUÇÕES
-- ========================================

SELECT 
  'setup_complete' as status,
  'Configuração básica concluída' as message,
  'Teste o login no Vercel agora' as next_step;
