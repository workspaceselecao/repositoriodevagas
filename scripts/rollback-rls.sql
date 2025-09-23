-- Script de rollback para desabilitar RLS em caso de problemas
-- Execute este script se as políticas RLS estiverem causando problemas

-- ========================================
-- ROLLBACK COMPLETO - DESABILITAR RLS
-- ========================================

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;
DROP POLICY IF EXISTS "vagas_select_policy" ON vagas;
DROP POLICY IF EXISTS "vagas_insert_policy" ON vagas;
DROP POLICY IF EXISTS "vagas_update_policy" ON vagas;
DROP POLICY IF EXISTS "vagas_delete_policy" ON vagas;
DROP POLICY IF EXISTS "backup_logs_all_policy" ON backup_logs;

-- 2. Remover funções auxiliares
DROP FUNCTION IF EXISTS get_current_user_role();
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_rh_or_admin();

-- 3. Desabilitar RLS completamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vagas DISABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se o rollback foi bem-sucedido
SELECT 
  'rollback_status' as info,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = false THEN '✅ RLS Desabilitado'
    ELSE '❌ RLS Ainda Ativo'
  END as status
FROM pg_tables 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename;

-- 5. Verificar se não há políticas restantes
SELECT 
  'remaining_policies' as info,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('users', 'vagas', 'backup_logs');

-- ========================================
-- INSTRUÇÕES PÓS-ROLLBACK
-- ========================================

/*
APÓS EXECUTAR ESTE ROLLBACK:

✅ O QUE FUNCIONA:
- Login deve funcionar normalmente
- Todas as operações de banco devem funcionar
- Não haverá erros de "infinite recursion"

❌ O QUE PERDE:
- Segurança de dados (qualquer usuário autenticado pode acessar tudo)
- Controle de acesso baseado em roles
- Proteção contra acesso não autorizado

🔄 PRÓXIMOS PASSOS:
1. Teste o login para confirmar que funciona
2. Se funcionar, você pode:
   - Deixar assim (menos seguro, mas funcional)
   - Tentar implementar as políticas novamente com ajustes
   - Implementar segurança apenas no frontend

⚠️ ATENÇÃO:
Este rollback remove TODA a segurança RLS. Use apenas se necessário.
*/
