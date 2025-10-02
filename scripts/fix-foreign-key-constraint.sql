-- =============================================
-- CORREÇÃO ESPECÍFICA PARA FOREIGN KEY CONSTRAINT
-- =============================================
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Verificar se a foreign key constraint existe e está correta
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='reports';

-- 2. Verificar se o usuário existe na tabela users
SELECT id, email, name, role FROM users 
WHERE id = '8541ed5b-e34e-475c-b568-24dac0869adc';

-- 3. Se o usuário não existir, criar ou atualizar
-- (Descomente e ajuste conforme necessário)
-- INSERT INTO users (id, email, name, role) 
-- VALUES ('8541ed5b-e34e-475c-b568-24dac0869adc', 'usuario@exemplo.com', 'Usuário Teste', 'RH')
-- ON CONFLICT (id) DO UPDATE SET 
--   email = EXCLUDED.email,
--   name = EXCLUDED.name,
--   role = EXCLUDED.role;

-- 4. Recriar a foreign key constraint com CASCADE para evitar problemas
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reported_by_fkey;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_assigned_to_fkey;

-- Recriar com CASCADE para permitir operações administrativas
ALTER TABLE reports 
ADD CONSTRAINT reports_reported_by_fkey 
FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE reports 
ADD CONSTRAINT reports_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Verificar se as constraints foram criadas corretamente
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='reports';

-- 6. Atualizar políticas RLS para permitir operações administrativas
DROP POLICY IF EXISTS "RH users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports;

-- Política mais permissiva para criação (inclui bypass para service role)
CREATE POLICY "Allow report creation" ON reports
  FOR INSERT WITH CHECK (
    -- Usuários RH podem criar reports
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'RH'
    )
    OR
    -- Service role pode criar reports (bypass RLS)
    auth.role() = 'service_role'
  );

-- Política para visualização
CREATE POLICY "Allow report viewing" ON reports
  FOR SELECT USING (
    auth.uid() = reported_by OR 
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
    OR
    auth.role() = 'service_role'
  );

-- Política para atualização
CREATE POLICY "Allow report updates" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
    OR
    auth.role() = 'service_role'
  );

-- Política para exclusão
CREATE POLICY "Allow report deletion" ON reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
    OR
    auth.role() = 'service_role'
  );

-- 7. Verificar políticas criadas
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reports'
ORDER BY policyname;
