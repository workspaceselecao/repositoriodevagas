import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  console.error('Necessário: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateDatabase() {
  try {
    console.log('🔄 Iniciando migração do banco de dados...')
    
    // 1. Adicionar nova coluna titulo
    console.log('📝 Adicionando coluna titulo...')
    const { error: tituloError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS titulo VARCHAR(255);'
    })
    
    if (tituloError) {
      console.error('❌ Erro ao adicionar coluna titulo:', tituloError)
    } else {
      console.log('✅ Coluna titulo adicionada com sucesso')
    }
    
    // 2. Adicionar nova coluna celula
    console.log('📝 Adicionando coluna celula...')
    const { error: celulaError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS celula VARCHAR(255);'
    })
    
    if (celulaError) {
      console.error('❌ Erro ao adicionar coluna celula:', celulaError)
    } else {
      console.log('✅ Coluna celula adicionada com sucesso')
    }
    
    // 3. Copiar dados de produto para celula
    console.log('📋 Copiando dados de produto para celula...')
    const { error: copyError } = await supabase.rpc('exec_sql', {
      sql: 'UPDATE vagas SET celula = produto WHERE produto IS NOT NULL;'
    })
    
    if (copyError) {
      console.error('❌ Erro ao copiar dados:', copyError)
    } else {
      console.log('✅ Dados copiados com sucesso')
    }
    
    // 4. Tornar celula NOT NULL
    console.log('🔒 Tornando celula NOT NULL...')
    const { error: notNullError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE vagas ALTER COLUMN celula SET NOT NULL;'
    })
    
    if (notNullError) {
      console.error('❌ Erro ao tornar celula NOT NULL:', notNullError)
    } else {
      console.log('✅ Coluna celula configurada como NOT NULL')
    }
    
    // 5. Criar índices
    console.log('📊 Criando índices...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_vagas_celula ON vagas(celula);
        CREATE INDEX IF NOT EXISTS idx_vagas_titulo ON vagas(titulo);
      `
    })
    
    if (indexError) {
      console.error('❌ Erro ao criar índices:', indexError)
    } else {
      console.log('✅ Índices criados com sucesso')
    }
    
    // 6. Verificar resultado
    console.log('🔍 Verificando resultado...')
    const { data: result, error: checkError } = await supabase
      .from('vagas')
      .select('id, cliente, produto, celula, titulo')
      .limit(5)
    
    if (checkError) {
      console.error('❌ Erro ao verificar dados:', checkError)
    } else {
      console.log('📋 Amostra dos dados migrados:')
      result?.forEach(vaga => {
        console.log(`  - ${vaga.cliente}: ${vaga.produto} → ${vaga.celula} (Título: ${vaga.titulo || 'N/A'})`)
      })
    }
    
    console.log('🎉 Migração concluída com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    process.exit(1)
  }
}

// Executar migração
migrateDatabase()
