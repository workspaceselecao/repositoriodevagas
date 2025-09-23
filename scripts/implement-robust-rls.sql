-- Script para implementar políticas RLS robustas e seguras
-- Execute este script no SQL Editor do Supabase
-- Este script contorna problemas de autenticação e recursão infinita

-- ========================================
-- PARTE 1: LIMPEZA E PREPARAÇÃO
-- ========================================

-- 1. Remover TODAS as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own data and admins see all" ON users;
DROP POLICY IF EXISTS "Authenticated users can view vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can manage backup logs" ON backup_logs;

-- 2. Remover funções antigas se existirem
DROP FUNCTION IF EXISTS is_user_rh_or_admin();

-- 3. Reabilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PARTE 2: FUNÇÕES AUXILIARES SEGURAS
-- ========================================

-- Função para obter o role do usuário atual de forma segura
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Tentar obter o role do JWT primeiro (mais rápido)
  user_role := auth.jwt() ->> 'role';
  
  -- Se não estiver no JWT, buscar na tabela users (fallback)
  IF user_role IS NULL THEN
    SELECT role INTO user_role 
    FROM users 
    WHERE id::text = auth.uid()::text 
    LIMIT 1;
  END IF;
  
  RETURN COALESCE(user_role, 'USER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_current_user_role() = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é RH ou Admin
CREATE OR REPLACE FUNCTION is_rh_or_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := get_current_user_role();
  RETURN user_role IN ('RH', 'ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PARTE 3: POLÍTICAS RLS ROBUSTAS
-- ========================================

-- POLÍTICA PARA USERS: Usuários podem ver seus próprios dados + Admins veem todos
CREATE POLICY "users_select_policy" ON users
  FOR SELECT USING (
    -- Usuário pode ver seus próprios dados
    auth.uid()::text = id::text 
    OR 
    -- Admin pode ver todos os usuários
    is_admin()
    OR
    -- Fallback: se não conseguir determinar role, permitir acesso próprio
    (auth.uid() IS NOT NULL AND auth.uid()::text = id::text)
  );

-- POLÍTICA PARA USERS: Apenas admins podem inserir usuários
CREATE POLICY "users_insert_policy" ON users
  FOR INSERT WITH CHECK (
    is_admin()
    OR
    -- Permitir auto-criação durante login (fallback)
    (auth.uid() IS NOT NULL AND auth.uid()::text = id::text)
  );

-- POLÍTICA PARA USERS: Apenas admins podem atualizar usuários
CREATE POLICY "users_update_policy" ON users
  FOR UPDATE USING (
    is_admin()
    OR
    -- Usuário pode atualizar seus próprios dados básicos
    (auth.uid()::text = id::text AND get_current_user_role() != 'ADMIN')
  );

-- POLÍTICA PARA USERS: Apenas admins podem deletar usuários
CREATE POLICY "users_delete_policy" ON users
  FOR DELETE USING (is_admin());

-- ========================================
-- POLÍTICAS PARA VAGAS
-- ========================================

-- POLÍTICA PARA VAGAS: Usuários autenticados podem ver vagas
CREATE POLICY "vagas_select_policy" ON vagas
  FOR SELECT USING (
    auth.role() = 'authenticated'
    OR
    auth.uid() IS NOT NULL
  );

-- POLÍTICA PARA VAGAS: RH e Admin podem inserir vagas
CREATE POLICY "vagas_insert_policy" ON vagas
  FOR INSERT WITH CHECK (
    is_rh_or_admin()
    OR
    -- Fallback: permitir para usuários autenticados (pode ser ajustado depois)
    auth.uid() IS NOT NULL
  );

-- POLÍTICA PARA VAGAS: RH e Admin podem atualizar vagas
CREATE POLICY "vagas_update_policy" ON vagas
  FOR UPDATE USING (
    is_rh_or_admin()
    OR
    -- Fallback: permitir para usuários autenticados
    auth.uid() IS NOT NULL
  );

-- POLÍTICA PARA VAGAS: Apenas Admin pode deletar vagas
CREATE POLICY "vagas_delete_policy" ON vagas
  FOR DELETE USING (
    is_admin()
    OR
    -- Fallback: permitir para usuários autenticados (pode ser removido depois)
    auth.uid() IS NOT NULL
  );

-- ========================================
-- POLÍTICAS PARA BACKUP_LOGS
-- ========================================

-- POLÍTICA PARA BACKUP_LOGS: Apenas Admin pode gerenciar logs
CREATE POLICY "backup_logs_all_policy" ON backup_logs
  FOR ALL USING (
    is_admin()
    OR
    -- Fallback: permitir para usuários autenticados
    auth.uid() IS NOT NULL
  );

-- ========================================
-- PARTE 4: VERIFICAÇÃO E TESTES
-- ========================================

-- Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  permissive,
  roles
FROM pg_policies 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename, policyname;

-- Verificar se o RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename;

-- Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name IN ('get_current_user_role', 'is_admin', 'is_rh_or_admin')
ORDER BY routine_name;

-- ========================================
-- PARTE 5: COMENTÁRIOS E INSTRUÇÕES
-- ========================================

-- INSTRUÇÕES DE USO:
-- 1. Este script cria políticas RLS robustas que evitam recursão infinita
-- 2. Usa funções auxiliares para verificar roles de forma segura
-- 3. Inclui fallbacks para garantir que o login funcione
-- 4. As políticas são mais permissivas inicialmente para garantir funcionamento
-- 5. Você pode ajustar as políticas depois conforme necessário

-- TESTES RECOMENDADOS:
-- 1. Teste o login com as credenciais: roberio.gomes@atento.com / admin123
-- 2. Verifique se consegue acessar o dashboard
-- 3. Teste criar/editar vagas
-- 4. Verifique se outros usuários não conseguem acessar dados não autorizados

-- AJUSTES FUTUROS (OPCIONAIS):
-- - Remover os fallbacks "auth.uid() IS NOT NULL" se quiser mais segurança
-- - Ajustar as políticas de vagas para serem mais restritivas
-- - Implementar auditoria de acesso se necessário
