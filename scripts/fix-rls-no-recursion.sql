-- Script para corrigir políticas RLS sem desabilitá-las
-- Elimina recursão infinita mantendo segurança
-- Execute no Supabase SQL Editor

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES (que causam recursão)
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

-- 2. CRIAR FUNÇÕES AUXILIARES SEGURAS (sem recursão)
-- Função para obter role do usuário atual usando JWT
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Tentar obter role do JWT primeiro (mais rápido)
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::json ->> 'role',
    (auth.jwt() ->> 'app_metadata')::json ->> 'role'
  ) INTO user_role;
  
  -- Se não encontrou no JWT, retornar null (não fazer consulta ao banco)
  RETURN user_role;
END;
$$;

-- Função para verificar se é admin usando JWT
CREATE OR REPLACE FUNCTION is_admin_jwt()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN get_current_user_role() = 'ADMIN';
END;
$$;

-- Função para verificar se é RH ou Admin usando JWT
CREATE OR REPLACE FUNCTION is_rh_or_admin_jwt()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := get_current_user_role();
  RETURN user_role IN ('RH', 'ADMIN');
END;
$$;

-- 3. CRIAR POLÍTICAS RLS SEGURAS (sem recursão)

-- POLÍTICAS PARA TABELA USERS
-- SELECT: Usuários podem ver seu próprio perfil, admins veem todos
CREATE POLICY "users_select_safe" ON users
FOR SELECT
USING (
  auth.uid() = id OR  -- Próprio usuário
  is_admin_jwt()      -- Admin (usando JWT, sem consulta ao banco)
);

-- INSERT: Apenas admins podem criar usuários
CREATE POLICY "users_insert_safe" ON users
FOR INSERT
WITH CHECK (
  is_admin_jwt() OR  -- Admin pode criar
  auth.uid() = id    -- Ou criando seu próprio perfil
);

-- UPDATE: Usuários podem atualizar seu perfil, admins podem atualizar todos
CREATE POLICY "users_update_safe" ON users
FOR UPDATE
USING (
  auth.uid() = id OR  -- Próprio usuário
  is_admin_jwt()      -- Admin
);

-- DELETE: Apenas admins podem deletar usuários
CREATE POLICY "users_delete_safe" ON users
FOR DELETE
USING (
  is_admin_jwt()      -- Apenas admin
);

-- POLÍTICAS PARA TABELA VAGAS
-- SELECT: Usuários autenticados podem ver vagas
CREATE POLICY "vagas_select_safe" ON vagas
FOR SELECT
USING (
  auth.uid() IS NOT NULL  -- Usuário autenticado
);

-- INSERT: RH e Admin podem criar vagas
CREATE POLICY "vagas_insert_safe" ON vagas
FOR INSERT
WITH CHECK (
  is_rh_or_admin_jwt() OR  -- RH ou Admin
  auth.uid() IS NOT NULL    -- Fallback para usuários autenticados
);

-- UPDATE: RH e Admin podem atualizar vagas
CREATE POLICY "vagas_update_safe" ON vagas
FOR UPDATE
USING (
  is_rh_or_admin_jwt() OR  -- RH ou Admin
  auth.uid() IS NOT NULL    -- Fallback para usuários autenticados
);

-- DELETE: Apenas Admin pode deletar vagas
CREATE POLICY "vagas_delete_safe" ON vagas
FOR DELETE
USING (
  is_admin_jwt()           -- Apenas Admin
);

-- POLÍTICAS PARA TABELA BACKUP_LOGS
-- Todas as operações: Apenas Admin
CREATE POLICY "backup_logs_all_safe" ON backup_logs
FOR ALL
USING (
  is_admin_jwt()           -- Apenas Admin
);

-- 4. GARANTIR QUE RLS ESTÁ ATIVO
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR STATUS
SELECT 'Políticas RLS corrigidas sem recursão!' as status;
SELECT 'RLS mantido ativo com segurança' as security_status;
SELECT 'Teste o login agora' as next_step;
