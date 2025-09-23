import { createClient } from '@supabase/supabase-js'

// Teste simples de conectividade
async function testConnection() {
  console.log('🔍 Teste de Conectividade Supabase')
  console.log('=' .repeat(40))
  
  const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'
  
  console.log(`📡 URL: ${supabaseUrl}`)
  console.log(`🔑 Service Key: ${supabaseServiceKey.substring(0, 30)}...`)
  console.log('')
  
  try {
    // Criar cliente
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    console.log('🔄 Testando conexão...')
    
    // Teste 1: Verificar se o projeto responde
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    })
    
    console.log(`📊 Status HTTP: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ Projeto Supabase está acessível!')
      
      // Teste 2: Tentar uma consulta simples
      console.log('🔄 Testando consulta...')
      const { data, error } = await supabase.from('users').select('count').limit(1)
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('✅ Conexão OK - Tabela users não existe (isso é normal)')
          console.log('')
          console.log('📝 Próximos passos:')
          console.log('1. Execute o schema SQL no Supabase Dashboard')
          console.log('2. Execute: npm run create-user')
        } else {
          console.log('⚠️ Erro na consulta:', error.message)
        }
      } else {
        console.log('✅ Consulta OK - Projeto funcionando!')
      }
      
    } else {
      console.log('❌ Projeto não está respondendo corretamente')
      console.log(`Status: ${response.status}`)
      const text = await response.text()
      console.log('Resposta:', text.substring(0, 200))
    }
    
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message)
    console.log('')
    console.log('💡 Possíveis causas:')
    console.log('1. URL incorreta')
    console.log('2. Service key incorreta')
    console.log('3. Projeto não existe ou não está ativo')
    console.log('4. Problemas de rede')
  }
}

testConnection()
