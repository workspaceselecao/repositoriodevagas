-- Migration: Add SELECT policy for authenticated users on contact_email_config
-- Date: 2024
-- Description: Allows RH users to view contact emails while keeping INSERT/UPDATE/DELETE restricted to ADMINs only
-- Issue: RH users couldn't see contacts because only ADMINs had access via "Contact email admin all" policy

-- Adicionar política de SELECT para usuários autenticados (ADMIN e RH)
-- Isso permite que usuários RH vejam os contatos, mas apenas ADMINs podem gerenciar (INSERT/UPDATE/DELETE)

-- Criar política de SELECT para usuários autenticados
DROP POLICY IF EXISTS "Contact email authenticated select" ON contact_email_config;

CREATE POLICY "Contact email authenticated select" ON contact_email_config
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- A política "Contact email admin all" já existe e permite INSERT/UPDATE/DELETE apenas para ADMINs
-- Agora temos:
-- - SELECT: Qualquer usuário autenticado (ADMIN ou RH) pode ver os contatos
-- - INSERT/UPDATE/DELETE: Apenas ADMINs podem gerenciar os contatos
