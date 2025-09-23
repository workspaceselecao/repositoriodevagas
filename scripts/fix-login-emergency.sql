-- Script de emergência para corrigir login
-- Execute no Supabase SQL Editor

-- 1. DESABILITAR RLS TEMPORARIAMENTE para permitir login
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vagas DISABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Allow user creation" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

DROP POLICY IF EXISTS "Authenticated users can view vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;

DROP POLICY IF EXISTS "Admin can manage backup logs" ON backup_logs;

-- 3. VERIFICAR SE EXISTE USUÁRIO ADMIN
SELECT 'Verificando usuários existentes...' as status;

SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. CRIAR USUÁRIO ADMIN SE NÃO EXISTIR
INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at)
SELECT 
  'admin-' || extract(epoch from now())::text,
  'admin@repositorio.com',
  'Administrador',
  'ADMIN',
  '',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE role = 'ADMIN'
);

-- 5. VERIFICAR STATUS FINAL
SELECT 'RLS desabilitado temporariamente - Login deve funcionar agora!' as status;
SELECT 'Execute o script fix-rls-safe.sql depois para reativar RLS com segurança' as next_step;
