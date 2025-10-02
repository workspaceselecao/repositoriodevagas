import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY são obrigatórias')
  console.error('💡 Crie um arquivo .env com essas variáveis ou execute o SQL diretamente no Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Iniciando migração para adicionar tabela de configurações do sistema...')

    // Ler o script SQL
    const sqlPath = path.join(__dirname, 'add-system-config.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Executar o script SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })

    if (error) {
      console.error('❌ Erro ao executar migração:', error)
      
      // Tentar executar comandos SQL individuais
      console.log('🔄 Tentando executar comandos SQL individuais...')
      
      // Criar tabela system_config
      const { error: createTableError } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS system_config (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            config_key VARCHAR(100) UNIQUE NOT NULL,
            config_value TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      if (createTableError) {
        console.error('❌ Erro ao criar tabela system_config:', createTableError)
        return false
      }

      // Inserir configuração padrão
      const { error: insertError } = await supabase.rpc('exec_sql', { 
        sql: `
          INSERT INTO system_config (config_key, config_value, description) 
          VALUES ('rh_nova_vaga_enabled', 'false', 'Habilita acesso à página Nova Oportunidade para usuários RH')
          ON CONFLICT (config_key) DO NOTHING;
        `
      })

      if (insertError) {
        console.error('❌ Erro ao inserir configuração padrão:', insertError)
        return false
      }

      // Criar índice
      const { error: indexError } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
        `
      })

      if (indexError) {
        console.error('❌ Erro ao criar índice:', indexError)
        return false
      }
    }

    console.log('✅ Migração executada com sucesso!')
    console.log('📋 Tabela system_config criada')
    console.log('⚙️ Configuração rh_nova_vaga_enabled inserida com valor padrão: false')
    console.log('🔍 Índice idx_system_config_key criado')
    
    return true
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    return false
  }
}

// Executar migração
runMigration().then(success => {
  if (success) {
    console.log('🎉 Migração concluída com sucesso!')
    process.exit(0)
  } else {
    console.log('💥 Migração falhou!')
    process.exit(1)
  }
})
