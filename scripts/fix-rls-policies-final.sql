-- Script final para corrigir políticas RLS sem erros de tipo
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas problemáticas da tabela users
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins have full control over users" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_all_admin" ON users;
DROP POLICY IF EXISTS "users_select_own_optimized" ON users;
DROP POLICY IF EXISTS "users_select_admin_optimized" ON users;
DROP POLICY IF EXISTS "users_all_admin_optimized" ON users;

-- 2. Criar políticas RLS corrigidas para users (sem recursão)
-- Política para usuários verem seus próprios dados
DROP POLICY IF EXISTS "users_select_own_final" ON users;
CREATE POLICY "users_select_own_final" ON users
  FOR SELECT USING (auth.uid() = id);

-- Política para admins verem todos os usuários (usando auth.jwt() em vez de consultar users)
DROP POLICY IF EXISTS "users_select_admin_final" ON users;
CREATE POLICY "users_select_admin_final" ON users
  FOR SELECT USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Política para admins terem controle total (usando auth.jwt())
DROP POLICY IF EXISTS "users_all_admin_final" ON users;
CREATE POLICY "users_all_admin_final" ON users
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- 3. Corrigir políticas de outras tabelas que consultam users
-- Lista de políticas que precisam ser corrigidas
DROP POLICY IF EXISTS "Admins have full control over vagas" ON vagas;
DROP POLICY IF EXISTS "Admins have full control over backup_logs" ON backup_logs;
DROP POLICY IF EXISTS "Admins have full control over contact_email_config" ON contact_email_config;
DROP POLICY IF EXISTS "Admins have full control over emailjs_config" ON emailjs_config;
DROP POLICY IF EXISTS "Admins have full control over system_control" ON system_control;
DROP POLICY IF EXISTS "Admins have full control over admin_sovereignty" ON admin_sovereignty;
DROP POLICY IF EXISTS "Admins have full control over admin_audit_log" ON admin_audit_log;
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;
DROP POLICY IF EXISTS "RH can manage vagas" ON vagas;

-- Criar novas políticas otimizadas sem recursão
CREATE POLICY "Admins have full control over vagas" ON vagas
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over backup_logs" ON backup_logs
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over contact_email_config" ON contact_email_config
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over emailjs_config" ON emailjs_config
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over system_control" ON system_control
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over admin_sovereignty" ON admin_sovereignty
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins have full control over admin_audit_log" ON admin_audit_log
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- 4. Políticas para usuários RH (se necessário)
-- Permitir que usuários RH vejam e criem vagas
DROP POLICY IF EXISTS "RH can manage vagas" ON vagas;
CREATE POLICY "RH can manage vagas" ON vagas
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH') OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH')
  );

-- 5. Políticas para reports (se a tabela existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        DROP POLICY IF EXISTS "Users can view reports" ON reports;
        DROP POLICY IF EXISTS "Admins can manage reports" ON reports;

        CREATE POLICY "Users can view reports" ON reports
          FOR SELECT USING (
            reported_by::uuid = auth.uid() OR 
            assigned_to::uuid = auth.uid() OR
            (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
          );

        CREATE POLICY "Admins can manage reports" ON reports
          FOR ALL USING (
            (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
          );
    END IF;
END $$;

-- 6. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 7. Verificar se o usuário existe na tabela users
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'roberio.gomes@atento.com';

-- 8. Se o usuário não existir, criar (substitua o UUID pelo correto)
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
        RAISE NOTICE 'Usuário criado com sucesso';
    ELSE
        RAISE NOTICE 'Usuário já existe';
    END IF;
END $$;

-- 9. Atualizar user_metadata no Supabase Auth (se necessário)
-- NOTA: Execute este comando no Supabase Dashboard > Authentication > Users
-- UPDATE auth.users 
-- SET user_metadata = jsonb_set(user_metadata, '{role}', '"ADMIN"')
-- WHERE email = 'roberio.gomes@atento.com';

-- 10. Comentário final
COMMENT ON POLICY "users_select_admin_final" ON users IS 'Política otimizada para admins usando auth.jwt() sem recursão';
COMMENT ON POLICY "Admins have full control over vagas" ON vagas IS 'Política otimizada para admins usando auth.jwt() sem recursão';
