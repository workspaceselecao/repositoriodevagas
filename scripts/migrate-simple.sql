-- =====================================================
-- MIGRAÇÃO SIMPLES PARA CONTROLE DE ACESSO RH
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela system_config (se não existir)
CREATE TABLE IF NOT EXISTS system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir configurações padrão
INSERT INTO system_config (config_key, config_value, description) VALUES
('rh_nova_vaga_enabled', 'false', 'Habilita acesso à página Nova Oportunidade para usuários RH'),
('rh_edit_enabled', 'false', 'Habilita funcionalidade de edição de vagas para usuários RH'),
('rh_delete_enabled', 'false', 'Habilita funcionalidade de exclusão de vagas para usuários RH')
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);

-- 4. Verificar se funcionou
SELECT 
  '✅ Migração executada com sucesso!' as status,
  config_key,
  config_value,
  description
FROM system_config 
WHERE config_key IN ('rh_nova_vaga_enabled', 'rh_edit_enabled', 'rh_delete_enabled')
ORDER BY config_key;
