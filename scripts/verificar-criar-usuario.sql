-- Script para verificar e criar o usuário de teste
-- Execute este script no Supabase SQL Editor

-- ========================================
-- VERIFICAÇÃO DO USUÁRIO DE TESTE
-- ========================================

-- Verificar se o usuário existe na tabela users
SELECT 
  'user_check' as status,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Usuário existe na tabela users'
    ELSE '❌ Usuário não encontrado na tabela users'
  END as message,
  COUNT(*) as user_count
FROM users 
WHERE email = 'roberio.gomes@atento.com';

-- Se o usuário existir, mostrar detalhes
SELECT 
  'user_details' as status,
  id,
  email,
  name,
  role,
  created_at
FROM users 
WHERE email = 'roberio.gomes@atento.com'
LIMIT 1;

-- ========================================
-- INSTRUÇÕES PARA CRIAR USUÁRIO
-- ========================================

SELECT 
  'instructions' as status,
  'INSTRUÇÕES PARA CRIAR USUÁRIO DE TESTE:' as message;

SELECT 
  'step_1' as step,
  '1. Vá para Authentication → Users no Supabase Dashboard' as instruction;

SELECT 
  'step_2' as step,
  '2. Clique em "Add User" ou "Invite User"' as instruction;

SELECT 
  'step_3' as step,
  '3. Preencha os dados:' as instruction;

SELECT 
  'step_4' as step,
  '   Email: roberio.gomes@atento.com' as instruction;

SELECT 
  'step_5' as step,
  '   Password: admin123' as instruction;

SELECT 
  'step_6' as step,
  '   Email Confirm: true' as instruction;

SELECT 
  'step_7' as step,
  '4. Após criar no Auth, execute o comando abaixo para criar na tabela users' as instruction;

-- ========================================
-- COMANDO PARA CRIAR NA TABELA USERS
-- ========================================

-- IMPORTANTE: Execute este comando APENAS após criar o usuário no Supabase Auth
-- Substitua 'USER_ID_DO_AUTH' pelo ID real do usuário criado no Auth

/*
-- Descomente e execute este bloco após criar o usuário no Auth
-- Substitua 'USER_ID_DO_AUTH' pelo ID real

INSERT INTO users (id, email, name, role, password_hash)
VALUES (
  'USER_ID_DO_AUTH', -- Substitua pelo ID real do Auth
  'roberio.gomes@atento.com',
  'Robeiro Gomes',
  'ADMIN',
  '' -- Deixar vazio pois usamos Supabase Auth
);

-- Verificar se foi criado corretamente
SELECT 
  'user_created' as status,
  id,
  email,
  name,
  role
FROM users 
WHERE email = 'roberio.gomes@atento.com';
*/

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

SELECT 
  'final_check' as status,
  'Após criar o usuário, execute este script novamente para verificar' as message;

-- Verificar se há outros usuários na tabela
SELECT 
  'all_users' as status,
  COUNT(*) as total_users,
  'usuários na tabela users' as description
FROM users;

-- Verificar se o RLS está configurado
SELECT 
  'rls_check' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';
