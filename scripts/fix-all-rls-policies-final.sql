-- ============================================================
-- CORREÇÃO COMPLETA E DEFINITIVA DAS POLÍTICAS RLS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- USERS: Corrigir políticas RLS (REMOVER RECURSÃO INFINITA)
-- ============================================================

-- Remover TODAS as políticas existentes da tabela users
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins have full control over users" ON users;
DROP POLICY IF EXISTS "Users select own" ON users;
DROP POLICY IF EXISTS "Users admin select" ON users;
DROP POLICY IF EXISTS "Users admin all" ON users;

-- Criar política para usuários verem seus próprios dados
CREATE POLICY "Users select own" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Criar política para ADMIN ver todos os usuários (SEM RECURSÃO - usa auth.jwt())
CREATE POLICY "Users admin select" ON users
  FOR SELECT USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Criar política para ADMIN controle total (SEM RECURSÃO - usa auth.jwt())
CREATE POLICY "Users admin all" ON users
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- ============================================================
-- SYSTEM_CONFIG: Criar políticas RLS se não existir
-- ============================================================

DROP POLICY IF EXISTS "System config select" ON system_config;
DROP POLICY IF EXISTS "System config admin all" ON system_config;

-- SELECT para usuários autenticados
CREATE POLICY "System config select" ON system_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- ALL para admins
CREATE POLICY "System config admin all" ON system_config
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- ============================================================
-- NOTÍCIAS: Criar políticas RLS
-- ============================================================

DROP POLICY IF EXISTS "Noticias public read" ON noticias;
DROP POLICY IF EXISTS "Noticias admin all" ON noticias;

-- SELECT: Público pode ver notícias ativas
CREATE POLICY "Noticias public read" ON noticias
  FOR SELECT USING (ativa = true);

-- ALL: ADMIN tem controle total
CREATE POLICY "Noticias admin all" ON noticias
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- ============================================================
-- CONTACT_EMAIL_CONFIG: Criar políticas RLS
-- ============================================================

DROP POLICY IF EXISTS "Contact email admin all" ON contact_email_config;

-- ALL: Apenas ADMIN tem acesso total
CREATE POLICY "Contact email admin all" ON contact_email_config
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- ============================================================
-- VAGAS: Garantir políticas completas
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view vagas" ON vagas;
DROP POLICY IF EXISTS "Vagas authenticated insert" ON vagas;
DROP POLICY IF EXISTS "Vagas authenticated update" ON vagas;
DROP POLICY IF EXISTS "Vagas authenticated delete" ON vagas;

-- SELECT: Todos podem visualizar
CREATE POLICY "Anyone can view vagas" ON vagas
  FOR SELECT USING (true);

-- INSERT: ADMIN e RH podem criar
CREATE POLICY "Vagas authenticated insert" ON vagas
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH') OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH')
  );

-- UPDATE: ADMIN e RH podem editar
CREATE POLICY "Vagas authenticated update" ON vagas
  FOR UPDATE USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH') OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH')
  );

-- DELETE: ADMIN e RH podem excluir
CREATE POLICY "Vagas authenticated delete" ON vagas
  FOR DELETE USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH') OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH')
  );

-- ============================================================
-- Verificar todas as políticas criadas
-- ============================================================

SELECT 
  tablename, 
  policyname, 
  cmd,
  LEFT(qual, 100) as qual_preview
FROM pg_policies
WHERE tablename IN ('users', 'system_config', 'noticias', 'contact_email_config', 'vagas')
ORDER BY tablename, cmd;

-- ============================================================
-- RESUMO
-- ============================================================

SELECT 
  '✅ Correção RLS concluída:' as status,
  'Removida recursão infinita em policies da tabela users' as details;

