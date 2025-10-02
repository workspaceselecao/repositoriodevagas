-- Script para adicionar tabela de configurações do sistema
-- Execute este script para adicionar a funcionalidade de configuração de acesso RH

-- Tabela para configurações do sistema
CREATE TABLE IF NOT EXISTS system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração padrão para habilitação de Nova Oportunidade para RH
INSERT INTO system_config (config_key, config_value, description) 
VALUES ('rh_nova_vaga_enabled', 'false', 'Habilita acesso à página Nova Oportunidade para usuários RH')
ON CONFLICT (config_key) DO NOTHING;

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
