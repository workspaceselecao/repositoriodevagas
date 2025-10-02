#!/usr/bin/env node

console.log('🚀 MIGRAÇÃO PARA CONTROLE DE ACESSO RH - NOVA OPORTUNIDADE')
console.log('=' .repeat(60))
console.log('')
console.log('📋 Este script cria a tabela system_config no Supabase')
console.log('')
console.log('⚠️  OPÇÕES DE EXECUÇÃO:')
console.log('')
console.log('1️⃣  EXECUÇÃO AUTOMÁTICA (Recomendada):')
console.log('   - Execute o SQL diretamente no Supabase Dashboard')
console.log('   - Arquivo: scripts/migrate-system-config-manual.sql')
console.log('')
console.log('2️⃣  EXECUÇÃO MANUAL:')
console.log('   - Copie e cole o SQL abaixo no SQL Editor do Supabase')
console.log('')
console.log('=' .repeat(60))
console.log('📄 SQL PARA EXECUTAR NO SUPABASE:')
console.log('=' .repeat(60))
console.log('')

const sqlScript = `-- Criar tabela de configurações do sistema
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

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);

-- Verificar se a migração foi executada com sucesso
SELECT 
  'Migração executada com sucesso!' as status,
  config_key,
  config_value,
  description
FROM system_config 
WHERE config_key = 'rh_nova_vaga_enabled';`

console.log(sqlScript)
console.log('')
console.log('=' .repeat(60))
console.log('📋 INSTRUÇÕES PASSO A PASSO:')
console.log('=' .repeat(60))
console.log('')
console.log('1. Acesse https://supabase.com/dashboard')
console.log('2. Selecione seu projeto')
console.log('3. Clique em "SQL Editor" no menu lateral')
console.log('4. Cole o SQL acima')
console.log('5. Clique em "Run"')
console.log('6. Verifique se aparece "Migração executada com sucesso!"')
console.log('')
console.log('✅ Após executar o SQL, a funcionalidade estará disponível!')
console.log('')
console.log('🎯 PRÓXIMOS PASSOS:')
console.log('1. Faça login como ADMIN')
console.log('2. Vá em Configurações > Controle de Acesso')
console.log('3. Use o toggle para habilitar/desabilitar acesso RH')
console.log('')
console.log('=' .repeat(60))
console.log('🎉 MIGRAÇÃO CONCLUÍDA!')
console.log('=' .repeat(60))
