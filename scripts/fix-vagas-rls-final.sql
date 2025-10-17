-- Script SQL para corrigir políticas RLS da tabela vagas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Habilitar RLS na tabela vagas
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Admins have full control over vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;
DROP POLICY IF EXISTS "RH can manage vagas" ON vagas;
DROP POLICY IF EXISTS "Users can view vagas" ON vagas;
DROP POLICY IF EXISTS "Anyone can view vagas" ON vagas;
DROP POLICY IF EXISTS "Authenticated users can insert vagas" ON vagas;
DROP POLICY IF EXISTS "Authenticated users can update vagas" ON vagas;
DROP POLICY IF EXISTS "Only admins can delete vagas" ON vagas;

-- 3. Criar políticas RLS corretas

-- Política para SELECT (todos podem ver vagas)
CREATE POLICY "vagas_select_policy" ON vagas
  FOR SELECT USING (true);

-- Política para INSERT (apenas usuários autenticados com role ADMIN ou RH)
CREATE POLICY "vagas_insert_policy" ON vagas
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('ADMIN', 'RH')
      )
    )
  );

-- Política para UPDATE (apenas usuários autenticados com role ADMIN ou RH)
CREATE POLICY "vagas_update_policy" ON vagas
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('ADMIN', 'RH')
      )
    )
  );

-- Política para DELETE (apenas usuários com role ADMIN)
CREATE POLICY "vagas_delete_policy" ON vagas
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'ADMIN'
      )
    )
  );

-- 4. Verificar se as políticas foram criadas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'vagas'
ORDER BY policyname;

-- 5. Comentários para documentação
COMMENT ON POLICY "vagas_select_policy" ON vagas IS 'Permite que qualquer pessoa veja as vagas';
COMMENT ON POLICY "vagas_insert_policy" ON vagas IS 'Permite inserção apenas para usuários autenticados com role ADMIN ou RH';
COMMENT ON POLICY "vagas_update_policy" ON vagas IS 'Permite atualização apenas para usuários autenticados com role ADMIN ou RH';
COMMENT ON POLICY "vagas_delete_policy" ON vagas IS 'Permite exclusão apenas para usuários com role ADMIN';
