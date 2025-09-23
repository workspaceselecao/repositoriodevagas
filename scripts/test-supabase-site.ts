// Teste de conectividade com o site do Supabase
async function testSupabaseSite() {
  console.log('🔍 Teste de Conectividade com Supabase')
  console.log('=' .repeat(50))
  
  const tests = [
    {
      name: 'Site principal do Supabase',
      url: 'https://supabase.com',
      description: 'Testa se conseguimos acessar o site principal'
    },
    {
      name: 'Dashboard do Supabase',
      url: 'https://supabase.com/dashboard',
      description: 'Testa se conseguimos acessar o dashboard'
    },
    {
      name: 'Projeto específico',
      url: 'https://supabase.com/dashboard/project/rkcrazuegletgxoqfinc',
      description: 'Testa se conseguimos acessar o projeto específico'
    }
  ]
  
  for (const test of tests) {
    console.log(`\n🔄 ${test.name}`)
    console.log(`📡 ${test.url}`)
    console.log(`📝 ${test.description}`)
    
    try {
      const response = await fetch(test.url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(10000) // timeout de 10 segundos
      })
      
      console.log(`✅ Status: ${response.status}`)
      
      if (response.status === 200) {
        console.log('✅ Conectividade OK')
      } else if (response.status === 404) {
        console.log('⚠️ Página não encontrada (pode ser normal se não estiver logado)')
      } else {
        console.log(`⚠️ Status inesperado: ${response.status}`)
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`)
      
      if (error.message.includes('ENOTFOUND')) {
        console.log('   💡 Problema de DNS - verifique sua conexão com a internet')
      } else if (error.message.includes('timeout')) {
        console.log('   💡 Timeout - servidor pode estar lento')
      } else if (error.message.includes('fetch failed')) {
        console.log('   💡 Falha na requisição HTTP')
      }
    }
  }
  
  console.log('\n📋 Diagnóstico:')
  console.log('Se todos os testes falharam:')
  console.log('- Verifique sua conexão com a internet')
  console.log('- Verifique se há firewall bloqueando')
  console.log('- Teste em outro navegador/rede')
  console.log('')
  console.log('Se apenas o projeto específico falhou:')
  console.log('- O projeto pode não existir')
  console.log('- Você pode não ter acesso ao projeto')
  console.log('- O projeto pode estar pausado')
}

testSupabaseSite()
