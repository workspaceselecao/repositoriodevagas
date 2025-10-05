-- Script para verificar e corrigir autenticação do usuário
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o usuário existe na tabela users
SELECT 'Verificando usuário na tabela users:' as info;
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'roberio.gomes@atento.com';

-- 2. Verificar se o usuário existe no Supabase Auth
SELECT 'Verificando usuário no Supabase Auth:' as info;
SELECT id, email, email_confirmed_at, created_at, raw_user_meta_data
FROM auth.users 
WHERE email = 'roberio.gomes@atento.com';

-- 3. Verificar políticas RLS ativas
SELECT 'Políticas RLS ativas:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'vagas')
ORDER BY tablename, policyname;

-- 4. Testar acesso às tabelas (simular RLS)
SELECT 'Testando acesso à tabela users:' as info;
SELECT count(*) as total_users FROM users;

SELECT 'Testando acesso à tabela vagas:' as info;
SELECT count(*) as total_vagas FROM vagas;

-- 5. Verificar se o sistema está bloqueado
SELECT 'Verificando bloqueio do sistema:' as info;
SELECT is_blocked, blocked_by, blocked_at, reason
FROM system_control 
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- 6. Se o usuário não existir na tabela users, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'roberio.gomes@atento.com') THEN
        INSERT INTO users (id, email, name, role, password_hash) 
        VALUES (
            '63b5dd5b-c5d1-4b28-921a-1936447da1c1'::uuid, 
            'roberio.gomes@atento.com', 
            'Roberio Gomes', 
            'ADMIN',
            'dummy_hash'
        );
        RAISE NOTICE 'Usuário criado na tabela users';
    ELSE
        RAISE NOTICE 'Usuário já existe na tabela users';
    END IF;
END $$;

-- 7. Verificar novamente após criação
SELECT 'Verificação final do usuário:' as info;
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'roberio.gomes@atento.com';

-- 8. Instruções para atualizar user_metadata no Supabase Auth
SELECT 'INSTRUÇÕES:' as info;
SELECT 'Para completar a configuração:' as step1;
SELECT '1. Vá para Supabase Dashboard > Authentication > Users' as step2;
SELECT '2. Encontre o usuário roberio.gomes@atento.com' as step3;
SELECT '3. Edite o usuário e adicione em user_metadata: {"role": "ADMIN"}' as step4;
SELECT '4. Ou execute o comando SQL abaixo no SQL Editor:' as step5;

-- Comando para atualizar raw_user_meta_data (descomente se necessário)
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_set(
--     COALESCE(raw_user_meta_data, '{}'::jsonb), 
--     '{role}', 
--     '"ADMIN"'::jsonb
-- )
-- WHERE email = 'roberio.gomes@atento.com';
