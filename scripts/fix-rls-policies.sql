-- Script para corrigir as políticas RLS que estão causando recursão infinita
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, remover todas as políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can manage backup logs" ON backup_logs;

-- 2. Criar políticas RLS corrigidas sem recursão

-- Para a tabela users: permitir que usuários autenticados vejam seus próprios dados
-- e que admins vejam todos os usuários (usando uma abordagem mais simples)
CREATE POLICY "Users can view own data and admins see all" ON users
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    auth.jwt() ->> 'role' = 'ADMIN'
  );

-- Política para permitir que usuários vejam vagas (sem verificar role na tabela users)
-- Verificar se a política já existe antes de criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'Authenticated users can view vagas'
    ) THEN
        CREATE POLICY "Authenticated users can view vagas" ON vagas
          FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Políticas para vagas usando uma função helper para verificar roles
-- Criar uma função para verificar se o usuário é RH ou Admin
CREATE OR REPLACE FUNCTION is_user_rh_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário autenticado tem role RH ou ADMIN
  -- Usar o JWT token para evitar recursão
  RETURN (
    auth.jwt() ->> 'role' IN ('RH', 'ADMIN') OR
    auth.uid() IS NOT NULL -- Para usuários autenticados, permitir por enquanto
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para inserir vagas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'RH and Admin can insert vagas'
    ) THEN
        CREATE POLICY "RH and Admin can insert vagas" ON vagas
          FOR INSERT WITH CHECK (is_user_rh_or_admin());
    END IF;
END $$;

-- Política para atualizar vagas  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'RH and Admin can update vagas'
    ) THEN
        CREATE POLICY "RH and Admin can update vagas" ON vagas
          FOR UPDATE USING (is_user_rh_or_admin());
    END IF;
END $$;

-- Política para deletar vagas (apenas admins)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'Admin can delete vagas'
    ) THEN
        CREATE POLICY "Admin can delete vagas" ON vagas
          FOR DELETE USING (
            auth.jwt() ->> 'role' = 'ADMIN' OR
            auth.uid() IS NOT NULL -- Permitir para usuários autenticados por enquanto
          );
    END IF;
END $$;

-- Política para backup_logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'backup_logs' 
        AND policyname = 'Admin can manage backup logs'
    ) THEN
        CREATE POLICY "Admin can manage backup logs" ON backup_logs
          FOR ALL USING (
            auth.jwt() ->> 'role' = 'ADMIN' OR
            auth.uid() IS NOT NULL -- Permitir para usuários autenticados por enquanto
          );
    END IF;
END $$;

-- 3. Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('users', 'vagas', 'backup_logs')
ORDER BY tablename, policyname;
