-- Script para garantir que existe um usuário admin funcional
-- Execute APÓS o fix-rls-no-recursion.sql

-- 1. VERIFICAR USUÁRIOS EXISTENTES
SELECT 'Usuários existentes:' as info;
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. VERIFICAR SE EXISTE ADMIN
SELECT 'Verificando se existe admin...' as status;

-- 3. CRIAR USUÁRIO ADMIN SE NÃO EXISTIR
-- Primeiro, criar no Supabase Auth (isso precisa ser feito manualmente ou via API)
-- Depois, criar registro na tabela users

-- Verificar se já existe um admin
DO $$
DECLARE
  admin_exists BOOLEAN;
  admin_id TEXT;
BEGIN
  -- Verificar se existe admin na tabela users
  SELECT EXISTS(SELECT 1 FROM users WHERE role = 'ADMIN') INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Criar um ID temporário para admin
    admin_id := 'admin-' || extract(epoch from now())::text;
    
    -- Inserir admin na tabela users
    INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at)
    VALUES (
      admin_id,
      'admin@repositorio.com',
      'Administrador do Sistema',
      'ADMIN',
      '',
      now(),
      now()
    );
    
    RAISE NOTICE 'Usuário admin criado com ID: %', admin_id;
  ELSE
    RAISE NOTICE 'Usuário admin já existe';
  END IF;
END $$;

-- 4. VERIFICAR USUÁRIOS FINAIS
SELECT 'Usuários após verificação:' as info;
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- 5. TESTAR POLÍTICAS
SELECT 'Testando políticas RLS...' as status;

-- Testar se consegue ver usuários (deve funcionar para admin)
SELECT 'Teste de SELECT em users:' as test;
SELECT COUNT(*) as total_users FROM users;

-- Teste de SELECT em vagas (deve funcionar para usuários autenticados)
SELECT 'Teste de SELECT em vagas:' as test;
SELECT COUNT(*) as total_vagas FROM vagas;

SELECT 'Verificação concluída!' as status;
SELECT 'Se houver erros, verifique as políticas RLS' as note;
