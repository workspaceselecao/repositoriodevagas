-- ============================================================
-- SINCRONIZAR USUÁRIOS DO SUPABASE AUTH PARA TABELA USERS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- Inserir usuários do Supabase Auth na tabela users
-- Se já existir, não duplicar (ON CONFLICT DO NOTHING)

INSERT INTO public.users (id, email, name, role, password_hash)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', 'Usuário') as name,
  COALESCE(
    au.raw_app_meta_data->>'role',
    au.raw_user_meta_data->>'role',
    'RH'
  ) as role,
  '' as password_hash
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Verificar se os usuários foram inseridos corretamente
SELECT 
  'Usuários sincronizados com sucesso!' as status,
  COUNT(*) as total_users
FROM public.users;

-- Listar todos os usuários sincronizados
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM public.users
ORDER BY created_at;

