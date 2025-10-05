-- Script para configurar role do usuário no Supabase Auth
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar usuário atual no Supabase Auth
SELECT 'Usuário atual no Supabase Auth:' as info;
SELECT id, email, email_confirmed_at, created_at, raw_user_meta_data, raw_app_meta_data
FROM auth.users 
WHERE email = 'roberio.gomes@atento.com';

-- 2. Atualizar raw_user_meta_data com role ADMIN
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb), 
    '{role}', 
    '"ADMIN"'::jsonb
)
WHERE email = 'roberio.gomes@atento.com';

-- 3. Atualizar raw_app_meta_data com role ADMIN (alternativa)
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb), 
    '{role}', 
    '"ADMIN"'::jsonb
)
WHERE email = 'roberio.gomes@atento.com';

-- 4. Verificar se a atualização foi bem-sucedida
SELECT 'Verificação após atualização:' as info;
SELECT id, email, raw_user_meta_data, raw_app_meta_data
FROM auth.users 
WHERE email = 'roberio.gomes@atento.com';

-- 5. Verificar se o usuário existe na tabela users
SELECT 'Verificação na tabela users:' as info;
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'roberio.gomes@atento.com';

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

-- 7. Verificação final
SELECT 'Verificação final:' as info;
SELECT 'Supabase Auth:' as source, raw_user_meta_data->>'role' as role FROM auth.users WHERE email = 'roberio.gomes@atento.com'
UNION ALL
SELECT 'Tabela users:' as source, role FROM users WHERE email = 'roberio.gomes@atento.com';

-- 8. Teste de JWT (simular auth.jwt())
SELECT 'Teste de JWT:' as info;
SELECT 
    auth.jwt() ->> 'sub' as user_id,
    auth.jwt() ->> 'email' as email,
    auth.jwt() ->> 'user_metadata' as user_metadata,
    auth.jwt() ->> 'app_metadata' as app_metadata;

-- 9. Instruções finais
SELECT 'INSTRUÇÕES FINAIS:' as info;
SELECT '1. Execute este script completo' as step1;
SELECT '2. Teste o login na aplicação' as step2;
SELECT '3. Tente criar uma nova vaga' as step3;
SELECT '4. Se ainda houver problemas, verifique as políticas RLS' as step4;
