-- =============================================
-- SCRIPT DE MIGRAÇÃO PARA SISTEMA DE REPORTS
-- =============================================
-- Execute este script no Supabase Dashboard > SQL Editor
-- ou através de qualquer cliente PostgreSQL conectado ao Supabase

-- 1. Criar tabela de reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vaga_id UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID NOT NULL REFERENCES users(id),
  field_name VARCHAR(100) NOT NULL,
  current_value TEXT,
  suggested_changes TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_reports_vaga_id ON reports(vaga_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- 3. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_reports_updated_at ON reports;
CREATE TRIGGER trigger_update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS

-- Política: Usuários podem ver reports onde são o reporter ou o assignee
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (
    auth.uid() = reported_by OR 
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

-- Política: Usuários RH podem criar reports
CREATE POLICY "RH users can create reports" ON reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'RH'
    )
  );

-- Política: Admins podem atualizar reports
CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

-- Política: Admins podem deletar reports
CREATE POLICY "Admins can delete reports" ON reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

-- =============================================
-- VERIFICAÇÃO
-- =============================================
-- Execute estas consultas para verificar se tudo foi criado corretamente:

-- Verificar se a tabela foi criada
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reports' 
ORDER BY ordinal_position;

-- Verificar se os índices foram criados
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'reports';

-- Verificar se as políticas RLS foram criadas
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reports';

-- Verificar se o trigger foi criado
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'reports';

-- =============================================
-- TESTE BÁSICO (OPCIONAL)
-- =============================================
-- Descomente as linhas abaixo para fazer um teste básico:

-- INSERT INTO reports (vaga_id, reported_by, assigned_to, field_name, suggested_changes)
-- SELECT 
--   (SELECT id FROM vagas LIMIT 1),
--   (SELECT id FROM users WHERE role = 'RH' LIMIT 1),
--   (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1),
--   'site',
--   'Teste de report';

-- SELECT * FROM reports WHERE suggested_changes = 'Teste de report';

-- DELETE FROM reports WHERE suggested_changes = 'Teste de report';
