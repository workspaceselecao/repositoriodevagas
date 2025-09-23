-- Script para testar as políticas RLS implementadas
-- Execute este script no SQL Editor do Supabase após implementar as políticas

-- ========================================
-- TESTES DE FUNÇÕES AUXILIARES
-- ========================================

-- Teste 1: Verificar se as funções foram criadas corretamente
SELECT 
  'get_current_user_role' as function_name,
  get_current_user_role() as result;

SELECT 
  'is_admin' as function_name,
  is_admin() as result;

SELECT 
  'is_rh_or_admin' as function_name,
  is_rh_or_admin() as result;

-- ========================================
-- TESTES DE POLÍTICAS
-- ========================================

-- Teste 2: Verificar se consegue acessar a tabela users
-- (Este teste deve funcionar para o usuário atual)
SELECT 
  'users_table_access' as test,
  COUNT(*) as user_count
FROM users;

-- Teste 3: Verificar se consegue acessar a tabela vagas
SELECT 
  'vagas_table_access' as test,
  COUNT(*) as vagas_count
FROM vagas;

-- Teste 4: Verificar informações do usuário atual
SELECT 
  'current_user_info' as test,
  auth.uid() as user_id,
  auth.role() as auth_role,
  auth.jwt() ->> 'role' as jwt_role;

-- ========================================
-- VERIFICAÇÃO DE POLÍTICAS ATIVAS
-- ========================================

-- Teste 5: Listar todas as políticas ativas
SELECT 
  'active_policies' as info,
  tablename,
  policyname,
  cmd as operation,
  permissive
FROM pg_policies 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename, policyname;

-- Teste 6: Verificar status do RLS
SELECT 
  'rls_status' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename;

-- ========================================
-- TESTES DE PERMISSÕES ESPECÍFICAS
-- ========================================

-- Teste 7: Tentar inserir um usuário (deve funcionar se for admin)
-- CUIDADO: Este teste pode falhar se não for admin
/*
INSERT INTO users (id, email, name, role, password_hash)
VALUES (
  gen_random_uuid(),
  'teste@exemplo.com',
  'Usuário Teste',
  'RH',
  ''
);
*/

-- Teste 8: Verificar se consegue ver dados específicos
SELECT 
  'user_data_access' as test,
  id,
  email,
  name,
  role
FROM users 
WHERE email = 'roberio.gomes@atento.com'
LIMIT 1;

-- ========================================
-- DIAGNÓSTICO DE PROBLEMAS
-- ========================================

-- Teste 9: Verificar logs de erro recentes (se disponível)
SELECT 
  'error_check' as info,
  'Verifique o console do navegador para erros de autenticação' as message;

-- Teste 10: Verificar configuração de autenticação
SELECT 
  'auth_config' as info,
  'Verifique se as URLs de redirecionamento estão configuradas no Supabase' as message;

-- ========================================
-- INSTRUÇÕES DE INTERPRETAÇÃO
-- ========================================

/*
INTERPRETAÇÃO DOS RESULTADOS:

✅ SUCESSO se:
- Todas as funções retornam valores válidos
- Consegue acessar as tabelas users e vagas
- auth.uid() retorna um UUID válido
- auth.role() retorna 'authenticated'
- RLS está habilitado (rowsecurity = true)

❌ PROBLEMA se:
- Funções retornam NULL ou erro
- Não consegue acessar as tabelas
- auth.uid() retorna NULL
- auth.role() retorna 'anon'
- RLS está desabilitado (rowsecurity = false)

🔧 AÇÕES CORRETIVAS:
- Se auth.uid() for NULL: problema de autenticação
- Se auth.role() for 'anon': usuário não está logado
- Se não conseguir acessar tabelas: políticas muito restritivas
- Se RLS estiver desabilitado: executar script novamente
*/
