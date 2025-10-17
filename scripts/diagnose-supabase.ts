// Script de diagnóstico completo do Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

async function diagnoseSupabase() {
  console.log('🔍 Diagnóstico Completo do Supabase')
  console.log('=' .repeat(50))

  try {
    // 1. Testar cliente anônimo
    console.log('\n📡 1. Testando cliente anônimo...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: testData, error: testError } = await supabase
      .from('vagas')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log(`❌ Erro com cliente anônimo: ${testError.message}`)
    } else {
      console.log('✅ Cliente anônimo funcionando')
    }

    // 2. Testar cliente admin
    console.log('\n🔑 2. Testando cliente admin...')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('vagas')
      .select('count')
      .limit(1)
    
    if (adminError) {
      console.log(`❌ Erro com cliente admin: ${adminError.message}`)
    } else {
      console.log('✅ Cliente admin funcionando')
    }

    // 3. Testar tabelas específicas
    console.log('\n📊 3. Testando tabelas específicas...')
    
    const tables = ['users', 'vagas', 'contact_email_config', 'backup_logs']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.log(`❌ Tabela ${table}: ${error.message}`)
        } else {
          console.log(`✅ Tabela ${table}: OK`)
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: ${err.message}`)
      }
    }

    // 4. Testar autenticação
    console.log('\n🔐 4. Testando autenticação...')
    
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log(`❌ Erro de autenticação: ${authError.message}`)
    } else {
      console.log(`✅ Autenticação: ${authData.session ? 'Sessão ativa' : 'Sem sessão'}`)
    }

    // 5. Testar políticas RLS
    console.log('\n🛡️ 5. Testando políticas RLS...')
    
    try {
      // Tentar inserir um registro de teste (deve falhar sem autenticação)
      const { data: insertData, error: insertError } = await supabase
        .from('vagas')
        .insert({
          site: 'TESTE',
          categoria: 'TESTE',
          cargo: 'TESTE',
          cliente: 'TESTE',
          celula: 'TESTE'
        })
      
      if (insertError) {
        console.log(`✅ RLS funcionando: ${insertError.message}`)
      } else {
        console.log('⚠️ RLS pode não estar funcionando corretamente')
      }
    } catch (err) {
      console.log(`✅ RLS funcionando: ${err.message}`)
    }

    // 6. Verificar configurações
    console.log('\n⚙️ 6. Verificando configurações...')
    console.log(`📡 URL: ${supabaseUrl}`)
    console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`)
    console.log(`🔑 Service Key: ${supabaseServiceKey.substring(0, 20)}...`)

    console.log('\n✅ Diagnóstico concluído!')

  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error)
  }
}

// Executar diagnóstico
diagnoseSupabase()
