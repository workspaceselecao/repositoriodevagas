// Script de teste para verificar se as configurações estão funcionando
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSystemConfig() {
  console.log('🧪 Testando sistema de configurações...')
  
  try {
    // 1. Verificar se a tabela existe
    console.log('\n1️⃣ Verificando se a tabela system_config existe...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'system_config')
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError)
      return
    }
    
    if (tables && tables.length > 0) {
      console.log('✅ Tabela system_config existe')
    } else {
      console.log('❌ Tabela system_config não existe')
      return
    }
    
    // 2. Verificar configurações existentes
    console.log('\n2️⃣ Verificando configurações existentes...')
    const { data: configs, error: configsError } = await supabase
      .from('system_config')
      .select('*')
      .order('config_key')
    
    if (configsError) {
      console.error('❌ Erro ao buscar configurações:', configsError)
      return
    }
    
    console.log(`✅ Encontradas ${configs?.length || 0} configurações:`)
    configs?.forEach(config => {
      console.log(`   - ${config.config_key}: ${config.config_value}`)
    })
    
    // 3. Testar atualização de configuração
    console.log('\n3️⃣ Testando atualização de configuração...')
    const testKey = 'test_config'
    const testValue = 'test_value_' + Date.now()
    
    // Primeiro, inserir uma configuração de teste
    const { error: insertError } = await supabase
      .from('system_config')
      .insert({
        config_key: testKey,
        config_value: testValue,
        description: 'Configuração de teste'
      })
    
    if (insertError) {
      console.error('❌ Erro ao inserir configuração de teste:', insertError)
    } else {
      console.log('✅ Configuração de teste inserida com sucesso')
      
      // Agora testar atualização
      const newValue = 'updated_' + Date.now()
      const { error: updateError } = await supabase
        .from('system_config')
        .update({ config_value: newValue })
        .eq('config_key', testKey)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar configuração:', updateError)
      } else {
        console.log('✅ Configuração atualizada com sucesso')
      }
      
      // Limpar configuração de teste
      const { error: deleteError } = await supabase
        .from('system_config')
        .delete()
        .eq('config_key', testKey)
      
      if (deleteError) {
        console.error('❌ Erro ao limpar configuração de teste:', deleteError)
      } else {
        console.log('✅ Configuração de teste removida')
      }
    }
    
    console.log('\n🎉 Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

testSystemConfig()
