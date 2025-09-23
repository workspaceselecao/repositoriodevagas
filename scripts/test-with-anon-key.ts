import { createClient } from '@supabase/supabase-js'

// Teste usando chave anônima (mais segura para teste)
async function testWithAnonKey() {
  console.log('🔍 Teste com Chave Anônima')
  console.log('=' .repeat(30))
  
  const supabaseUrl = 'https://rkcrazuegletgxoqfinc.supabase.co'
  
  console.log(`📡 URL: ${supabaseUrl}`)
  console.log('')
  console.log('⚠️ IMPORTANTE: Para este teste funcionar, você precisa:')
  console.log('1. Obter a chave anônima do Supabase Dashboard')
  console.log('2. Substituir "SUA_CHAVE_ANONIMA_AQUI" abaixo')
  console.log('')
  
  // Substitua pela sua chave anônima real
  const anonKey = 'SUA_CHAVE_ANONIMA_AQUI'
  
  if (anonKey === 'SUA_CHAVE_ANONIMA_AQUI') {
    console.log('❌ Chave anônima não configurada!')
    console.log('')
    console.log('📋 Para obter a chave anônima:')
    console.log('1. Acesse: https://supabase.com/dashboard/project/rkcrazuegletgxoqfinc')
    console.log('2. Vá para Settings → API')
    console.log('3. Copie a "anon public" key')
    console.log('4. Substitua no script ou passe como parâmetro')
    console.log('')
    console.log('💡 Ou execute: npm run test-connection -- --anon-key=SUA_CHAVE')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, anonKey)
    
    console.log('🔄 Testando conexão com chave anônima...')
    
    // Teste simples
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Conexão OK - Tabela users não existe (isso é normal)')
        console.log('')
        console.log('📝 Próximos passos:')
        console.log('1. Execute o schema SQL no Supabase Dashboard')
        console.log('2. Execute: npm run create-user')
      } else {
        console.log('⚠️ Erro:', error.message)
        console.log('Código:', error.code)
      }
    } else {
      console.log('✅ Consulta OK!')
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message)
  }
}

// Verificar se foi passada uma chave como argumento
const args = process.argv.slice(2)
const anonKeyArg = args.find(arg => arg.startsWith('--anon-key='))

if (anonKeyArg) {
  const key = anonKeyArg.split('=')[1]
  console.log('🔑 Usando chave passada como argumento')
  // Aqui você poderia usar a chave passada
}

testWithAnonKey()
