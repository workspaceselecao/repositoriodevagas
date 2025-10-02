-- =====================================================
-- SCRIPT DE MIGRAÇÃO PARA CONTROLE DE ACESSO RH
-- =====================================================
-- Execute este script diretamente no SQL Editor do Supabase
-- para criar a tabela de configurações do sistema

-- 1. Criar tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir configuração padrão para habilitação de Nova Oportunidade para RH
INSERT INTO system_config (config_key, config_value, description) 
VALUES ('rh_nova_vaga_enabled', 'false', 'Habilita acesso à página Nova Oportunidade para usuários RH')
ON CONFLICT (config_key) DO NOTHING;

-- 3. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);

-- 4. Verificar se a migração foi executada com sucesso
SELECT 
  'Migração executada com sucesso!' as status,
  config_key,
  config_value,
  description
FROM system_config 
WHERE config_key = 'rh_nova_vaga_enabled';

-- =====================================================
-- INSTRUÇÕES:
-- =====================================================
-- 1. Copie todo este script
-- 2. Acesse o painel do Supabase (https://supabase.com/dashboard)
-- 3. Vá para o seu projeto
-- 4. Clique em "SQL Editor" no menu lateral
-- 5. Cole o script e clique em "Run"
-- 6. Verifique se a mensagem "Migração executada com sucesso!" aparece
-- =====================================================
