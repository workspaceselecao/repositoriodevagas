-- Script para corrigir políticas RLS da tabela vagas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se RLS está habilitado
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes problemáticas
DROP POLICY IF EXISTS "Admins have full control over vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;
DROP POLICY IF EXISTS "RH can manage vagas" ON vagas;
DROP POLICY IF EXISTS "Users can view vagas" ON vagas;

-- 3. Criar políticas RLS corretas usando auth.jwt() para evitar recursão

-- Política para SELECT (todos podem ver vagas)
CREATE POLICY "Anyone can view vagas" ON vagas
  FOR SELECT USING (true);

-- Política para INSERT (apenas usuários autenticados com role ADMIN ou RH)
CREATE POLICY "Authenticated users can insert vagas" ON vagas
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH') OR
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH')
    )
  );

-- Política para UPDATE (apenas usuários autenticados com role ADMIN ou RH)
CREATE POLICY "Authenticated users can update vagas" ON vagas
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH') OR
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH')
    )
  );

-- Política para DELETE (apenas usuários com role ADMIN)
CREATE POLICY "Only admins can delete vagas" ON vagas
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (
      (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
    )
  );

-- 4. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'vagas'
ORDER BY policyname;

-- 5. Comentários para documentação
COMMENT ON POLICY "Anyone can view vagas" ON vagas IS 'Permite que qualquer pessoa veja as vagas';
COMMENT ON POLICY "Authenticated users can insert vagas" ON vagas IS 'Permite inserção apenas para usuários autenticados com role ADMIN ou RH';
COMMENT ON POLICY "Authenticated users can update vagas" ON vagas IS 'Permite atualização apenas para usuários autenticados com role ADMIN ou RH';
COMMENT ON POLICY "Only admins can delete vagas" ON vagas IS 'Permite exclusão apenas para usuários com role ADMIN';
