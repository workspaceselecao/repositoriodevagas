import { createClient } from '@supabase/supabase-js'

// Script para configurar e testar conexão com Supabase
async function setupSupabase() {
  console.log('🔧 Configuração do Supabase - Repositório de Vagas')
  console.log('=' .repeat(50))
  
  console.log('')
  console.log('📋 Para configurar o Supabase, você precisa:')
  console.log('')
  console.log('1. 🌐 Acessar: https://supabase.com')
  console.log('2. 🔐 Fazer login na sua conta')
  console.log('3. ➕ Criar um novo projeto (se não tiver)')
  console.log('4. 📊 Ir para Settings → API')
  console.log('5. 📋 Copiar as credenciais:')
  console.log('   - Project URL')
  console.log('   - anon public key')
  console.log('   - service_role key')
  console.log('')
  
  // Testar com a URL atual
  const currentUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
  const currentServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'
  
  console.log('🔍 Testando conexão com as credenciais atuais...')
  console.log(`📡 URL: ${currentUrl}`)
  
  try {
    const supabase = createClient(currentUrl, currentServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    // Tentar uma operação simples
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Conexão OK - Tabela users não existe ainda (isso é normal)')
        console.log('')
        console.log('📝 Próximos passos:')
        console.log('1. Execute o schema SQL no Supabase Dashboard')
        console.log('2. Execute: npm run create-user')
      } else {
        console.log('❌ Erro:', error.message)
        console.log('💡 Verifique se o projeto existe e está ativo')
      }
    } else {
      console.log('✅ Conexão OK - Projeto ativo')
    }
    
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message)
    console.log('')
    console.log('🚨 O projeto Supabase não está acessível!')
    console.log('')
    console.log('💡 Possíveis soluções:')
    console.log('1. 🔗 Verifique se a URL está correta')
    console.log('2. 🌐 Confirme se o projeto existe em: https://supabase.com/dashboard')
    console.log('3. 🔄 Crie um novo projeto se necessário')
    console.log('4. 📋 Atualize as credenciais no script create-test-user.ts')
    console.log('')
    console.log('📖 Instruções detalhadas em: CONFIGURACAO_SUPABASE.md')
  }
  
  console.log('')
  console.log('🔗 Links úteis:')
  console.log('- Supabase Dashboard: https://supabase.com/dashboard')
  console.log('- Documentação: https://supabase.com/docs')
  console.log('- Suporte: https://supabase.com/support')
}

setupSupabase()
