-- Script para corrigir problemas no schema do banco de dados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela system_control existe e tem dados
SELECT 'Verificando system_control...' as status;

-- Inserir registro inicial se não existir
INSERT INTO system_control (id, is_blocked, created_at, updated_at) 
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verificar se foi inserido
SELECT id, is_blocked, created_at, updated_at FROM system_control;

-- 2. Verificar estrutura da tabela vagas
SELECT 'Verificando estrutura da tabela vagas...' as status;

-- Verificar se a coluna user_id existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vagas' 
AND column_name = 'user_id';

-- Se a coluna user_id não existir, vamos usar created_by
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vagas' 
AND column_name = 'created_by';

-- 3. Verificar políticas RLS ativas
SELECT 'Verificando políticas RLS...' as status;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('vagas', 'system_control', 'users')
ORDER BY tablename, policyname;

-- 4. Testar inserção com estrutura correta
SELECT 'Testando inserção...' as status;

-- Dados de teste usando created_by em vez de user_id
INSERT INTO vagas (
  site, 
  categoria, 
  cargo, 
  cliente, 
  celula,
  salario,
  beneficios,
  local_trabalho,
  etapas_processo,
  requisitos_qualificacoes,
  horario_trabalho,
  created_by
) VALUES (
  'TESTE_SCHEMA',
  'TESTE',
  'TESTE',
  'TESTE',
  'TESTE',
  'R$ 1.000,00',
  'Teste',
  'Teste',
  'Teste',
  'Teste',
  'Teste',
  '63b5dd5b-c5d1-4b28-921a-1936447da1c1'::uuid
) RETURNING id;

-- Limpar dados de teste
DELETE FROM vagas WHERE site = 'TESTE_SCHEMA';

SELECT 'Schema verificado e corrigido!' as status;
