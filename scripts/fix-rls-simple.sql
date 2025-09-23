-- Script simplificado para corrigir políticas RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Remover TODAS as políticas existentes (incluindo as que podem estar causando conflito)
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

-- 3. Verificar status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename;

-- 4. Verificar se não há políticas restantes
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename, policyname;
