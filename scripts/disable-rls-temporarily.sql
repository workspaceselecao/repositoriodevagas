-- Script para desabilitar temporariamente o RLS e permitir login
-- Execute este script no SQL Editor do Supabase para resolver o problema imediatamente

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Authenticated users can view vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can manage backup logs" ON backup_logs;

-- 2. Desabilitar RLS temporariamente para permitir login
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vagas DISABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se o RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename;

-- IMPORTANTE: 
-- Este script resolve o problema de login imediatamente, mas remove a segurança RLS.
-- Após testar o login, você deve executar o script 'fix-rls-policies.sql' para 
-- restaurar a segurança com políticas corrigidas.
