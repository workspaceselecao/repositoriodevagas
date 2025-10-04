-- Teste para verificar se o sistema de bloqueio está funcionando corretamente
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela system_control existe e tem o registro padrão
SELECT 'Verificando tabela system_control...' as status;

SELECT * FROM system_control 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 2. Inserir registro padrão se não existir
INSERT INTO system_control (id, is_blocked, created_at, updated_at) 
VALUES ('00000000-0000-0000-0000-000000000001', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Testar atualização de estado (bloqueio)
SELECT 'Testando bloqueio do sistema...' as status;

UPDATE system_control 
SET 
  is_blocked = true,
  blocked_by = '00000000-0000-0000-0000-000000000000',
  blocked_at = NOW(),
  updated_at = NOW(),
  reason = 'Teste de bloqueio'
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Estado após bloqueio:' as status;
SELECT * FROM system_control 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 4. Testar desbloqueio
SELECT 'Testando desbloqueio do sistema...' as status;

UPDATE system_control 
SET 
  is_blocked = false,
  unblocked_by = '00000000-0000-0000-0000-000000000000',
  unblocked_at = NOW(),
  updated_at = NOW(),
  reason = 'Teste de desbloqueio'
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Estado após desbloqueio:' as status;
SELECT * FROM system_control 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 5. Verificar políticas RLS
SELECT 'Verificando políticas RLS...' as status;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'system_control'
ORDER BY policyname;

-- 6. Testar com UUID válido (simulando usuário real)
SELECT 'Testando com UUID de usuário válido...' as status;

-- Primeiro, vamos ver se existe algum usuário na tabela users
SELECT id, email, role FROM users LIMIT 1;

-- Se existir um usuário, usar seu UUID para o teste
-- Caso contrário, usar o UUID de teste
UPDATE system_control 
SET 
  is_blocked = true,
  blocked_by = COALESCE((SELECT id FROM users LIMIT 1), '00000000-0000-0000-0000-000000000000'),
  blocked_at = NOW(),
  updated_at = NOW(),
  reason = 'Teste com UUID de usuário'
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Estado final:' as status;
SELECT * FROM system_control 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 7. Resetar para estado padrão
UPDATE system_control 
SET 
  is_blocked = false,
  blocked_by = NULL,
  blocked_at = NULL,
  unblocked_by = NULL,
  unblocked_at = NULL,
  updated_at = NOW(),
  reason = NULL
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Sistema resetado para estado padrão' as status;
SELECT * FROM system_control 
WHERE id = '00000000-0000-0000-0000-000000000001';
