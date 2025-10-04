-- =============================================
-- SETUP SISTEMA DE CONTROLE DE BLOQUEIO
-- =============================================
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Criar tabela de controle do sistema
CREATE TABLE IF NOT EXISTS system_control (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_blocked BOOLEAN DEFAULT false NOT NULL,
  blocked_by UUID REFERENCES users(id),
  blocked_at TIMESTAMP WITH TIME ZONE,
  unblocked_by UUID REFERENCES users(id),
  unblocked_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_control_record CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- 2. Habilitar RLS na tabela
ALTER TABLE system_control ENABLE ROW LEVEL SECURITY;

-- 3. Criar política RLS para admins
DROP POLICY IF EXISTS "Admin can manage system control" ON system_control;
CREATE POLICY "Admin can manage system control" ON system_control
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- 4. Inserir registro inicial
INSERT INTO system_control (id, is_blocked, created_at, updated_at) 
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Verificar se foi criado corretamente
SELECT * FROM system_control;

-- 6. Testar bloqueio (opcional)
-- UPDATE system_control 
-- SET is_blocked = true, 
--     blocked_by = (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1),
--     blocked_at = NOW(),
--     updated_at = NOW()
-- WHERE id = '00000000-0000-0000-0000-000000000001';

-- 7. Verificar estado após teste
-- SELECT * FROM system_control;

-- =============================================
-- INSTRUÇÕES:
-- =============================================
-- 1. Execute este script no Supabase Dashboard > SQL Editor
-- 2. Verifique se a tabela foi criada corretamente
-- 3. Teste o sistema de bloqueio através do painel administrativo
-- 4. O bloqueio agora será persistente no banco de dados
-- =============================================
