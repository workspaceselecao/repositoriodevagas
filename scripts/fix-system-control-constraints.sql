-- Script para corrigir constraints da tabela system_control
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há registros problemáticos
SELECT 'Verificando registros problemáticos...' as status;

SELECT * FROM system_control 
WHERE blocked_by = '00000000-0000-0000-0000-000000000000' 
   OR unblocked_by = '00000000-0000-0000-0000-000000000000';

-- 2. Corrigir registros problemáticos (substituir UUID inválido por NULL)
SELECT 'Corrigindo registros problemáticos...' as status;

UPDATE system_control 
SET 
  blocked_by = NULL,
  updated_at = NOW()
WHERE blocked_by = '00000000-0000-0000-0000-000000000000';

UPDATE system_control 
SET 
  unblocked_by = NULL,
  updated_at = NOW()
WHERE unblocked_by = '00000000-0000-0000-0000-000000000000';

-- 3. Verificar se a correção foi aplicada
SELECT 'Verificando correção...' as status;

SELECT * FROM system_control 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 4. Testar inserção/atualização com NULL
SELECT 'Testando atualização com NULL...' as status;

UPDATE system_control 
SET 
  is_blocked = true,
  blocked_by = NULL,
  blocked_at = NOW(),
  updated_at = NOW(),
  reason = 'Teste com NULL'
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Estado após teste com NULL:' as status;
SELECT * FROM system_control 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 5. Testar com UUID de usuário válido (se existir)
SELECT 'Testando com UUID de usuário válido...' as status;

-- Verificar se existe usuário na tabela
SELECT id, email, role FROM users LIMIT 1;

-- Se existir usuário, testar com seu UUID
UPDATE system_control 
SET 
  is_blocked = false,
  unblocked_by = (SELECT id FROM users LIMIT 1),
  unblocked_at = NOW(),
  updated_at = NOW(),
  reason = 'Teste com UUID válido'
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Estado final:' as status;
SELECT * FROM system_control 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 6. Resetar para estado padrão
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
