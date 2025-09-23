-- Script de diagnóstico completo para identificar problemas de RLS
-- Execute este script no Supabase SQL Editor

-- ========================================
-- DIAGNÓSTICO 1: VERIFICAÇÃO DE AUTENTICAÇÃO
-- ========================================

-- Verificar se o usuário está autenticado
SELECT 
  'auth_status' as categoria,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Usuário não autenticado'
    WHEN auth.uid() IS NOT NULL THEN '✅ Usuário autenticado'
  END as status,
  auth.uid() as user_id,
  auth.role() as auth_role;

-- Verificar informações do JWT
SELECT 
  'jwt_info' as categoria,
  auth.jwt() ->> 'role' as jwt_role,
  auth.jwt() ->> 'email' as jwt_email,
  auth.jwt() ->> 'sub' as jwt_user_id;

-- ========================================
-- DIAGNÓSTICO 2: VERIFICAÇÃO DE FUNÇÕES
-- ========================================

-- Verificar se as funções existem
SELECT 
  'functions_check' as categoria,
  routine_name,
  routine_type,
  data_type as return_type,
  CASE 
    WHEN routine_name IS NOT NULL THEN '✅ Função existe'
    ELSE '❌ Função não encontrada'
  END as status
FROM information_schema.routines 
WHERE routine_name IN ('get_current_user_role', 'is_admin', 'is_rh_or_admin')
ORDER BY routine_name;

-- Testar as funções se existirem
DO $$
BEGIN
  -- Tentar executar as funções
  BEGIN
    PERFORM get_current_user_role();
    RAISE NOTICE '✅ get_current_user_role() funcionou';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ get_current_user_role() falhou: %', SQLERRM;
  END;

  BEGIN
    PERFORM is_admin();
    RAISE NOTICE '✅ is_admin() funcionou';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ is_admin() falhou: %', SQLERRM;
  END;

  BEGIN
    PERFORM is_rh_or_admin();
    RAISE NOTICE '✅ is_rh_or_admin() funcionou';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ is_rh_or_admin() falhou: %', SQLERRM;
  END;
END $$;

-- ========================================
-- DIAGNÓSTICO 3: VERIFICAÇÃO DE TABELAS
-- ========================================

-- Verificar se as tabelas existem
SELECT 
  'tables_check' as categoria,
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ Tabela existe'
    ELSE '❌ Tabela não encontrada'
  END as status
FROM information_schema.tables 
WHERE table_name IN ('users', 'vagas', 'backup_logs')
ORDER BY table_name;

-- Verificar status do RLS
SELECT 
  'rls_status' as categoria,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Habilitado'
    WHEN rowsecurity = false THEN '❌ RLS Desabilitado'
  END as status
FROM pg_tables 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename;

-- ========================================
-- DIAGNÓSTICO 4: VERIFICAÇÃO DE POLÍTICAS
-- ========================================

-- Verificar políticas existentes
SELECT 
  'policies_check' as categoria,
  tablename,
  policyname,
  cmd as operation,
  permissive,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ Política existe'
    ELSE '❌ Nenhuma política encontrada'
  END as status
FROM pg_policies 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename, policyname;

-- ========================================
-- DIAGNÓSTICO 5: TESTE DE ACESSO A DADOS
-- ========================================

-- Testar acesso à tabela users
SELECT 
  'users_access' as categoria,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Acesso permitido'
    ELSE '❌ Acesso negado'
  END as status,
  COUNT(*) as user_count
FROM users;

-- Testar acesso à tabela vagas
SELECT 
  'vagas_access' as categoria,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Acesso permitido'
    ELSE '❌ Acesso negado'
  END as status,
  COUNT(*) as vagas_count
FROM vagas;

-- ========================================
-- DIAGNÓSTICO 6: VERIFICAÇÃO DE USUÁRIO ESPECÍFICO
-- ========================================

-- Verificar se o usuário de teste existe
SELECT 
  'test_user_check' as categoria,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Usuário de teste existe'
    ELSE '❌ Usuário de teste não encontrado'
  END as status,
  COUNT(*) as user_count
FROM users 
WHERE email = 'roberio.gomes@atento.com';

-- Se o usuário existir, mostrar detalhes
SELECT 
  'test_user_details' as categoria,
  id,
  email,
  name,
  role,
  created_at
FROM users 
WHERE email = 'roberio.gomes@atento.com'
LIMIT 1;

-- ========================================
-- DIAGNÓSTICO 7: VERIFICAÇÃO DE PERMISSÕES
-- ========================================

-- Verificar permissões do usuário atual
SELECT 
  'permissions_check' as categoria,
  'Verificando permissões do usuário atual' as info;

-- Tentar inserir um registro de teste (será revertido)
DO $$
BEGIN
  -- Tentar inserir um usuário de teste temporário
  BEGIN
    INSERT INTO users (id, email, name, role, password_hash)
    VALUES (
      gen_random_uuid(),
      'teste_temp_' || extract(epoch from now())::text || '@exemplo.com',
      'Usuário Teste Temporário',
      'RH',
      ''
    );
    RAISE NOTICE '✅ Permissão de INSERT funcionou';
    
    -- Remover o registro de teste
    DELETE FROM users WHERE email LIKE 'teste_temp_%';
    RAISE NOTICE '✅ Registro de teste removido';
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Permissão de INSERT falhou: %', SQLERRM;
  END;
END $$;

-- ========================================
-- RESUMO DO DIAGNÓSTICO
-- ========================================

SELECT 
  'diagnostico_completo' as categoria,
  'Execute este script e verifique os resultados acima' as instrucao,
  'Se houver erros, execute o script de rollback: scripts/rollback-rls.sql' as solucao;
