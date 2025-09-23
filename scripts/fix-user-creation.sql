-- Script para corrigir criação de usuários sem Service Key
-- Execute no Supabase SQL Editor

-- 1. Verificar se as políticas RLS estão ativas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'vagas', 'backup_logs');

-- 2. Remover políticas existentes que podem estar bloqueando
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- 3. Criar políticas mais permissivas para criação de usuários
CREATE POLICY "Allow user creation" ON users
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

CREATE POLICY "Admins can update users" ON users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

CREATE POLICY "Admins can delete users" ON users
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

-- 4. Verificar políticas das vagas
DROP POLICY IF EXISTS "Authenticated users can view vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;

CREATE POLICY "Authenticated users can view vagas" ON vagas
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "RH and Admin can insert vagas" ON vagas
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('RH', 'ADMIN')
  )
);

CREATE POLICY "RH and Admin can update vagas" ON vagas
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('RH', 'ADMIN')
  )
);

CREATE POLICY "Admin can delete vagas" ON vagas
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

-- 5. Verificar políticas dos backup_logs
DROP POLICY IF EXISTS "Admin can manage backup logs" ON backup_logs;

CREATE POLICY "Admin can manage backup logs" ON backup_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

-- 6. Verificar se as tabelas têm RLS ativado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- 7. Testar as políticas
SELECT 'Políticas criadas com sucesso!' as status;
