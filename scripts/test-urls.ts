// Teste de diferentes variações da URL do Supabase
async function testUrls() {
  console.log('🔍 Teste de URLs do Supabase')
  console.log('=' .repeat(40))
  
  const urls = [
    'https://rkcrazuegletgxoqfinc.supabase.co',
    'https://rkcrazuegletgxogflnc.supabase.co', // versão anterior
    'https://rkcrazuegletgxoqfinc.supabase.co/rest/v1/',
    'https://rkcrazuegletgxoqfinc.supabase.co/auth/v1/',
  ]
  
  for (const url of urls) {
    console.log(`\n🔄 Testando: ${url}`)
    
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // timeout de 5 segundos
      })
      
      console.log(`✅ Status: ${response.status}`)
      console.log(`📊 Headers: ${Object.keys(response.headers).length} headers`)
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`)
      
      if (error.message.includes('ENOTFOUND')) {
        console.log('   💡 DNS não consegue resolver este domínio')
      } else if (error.message.includes('timeout')) {
        console.log('   💡 Timeout - servidor pode estar lento')
      } else if (error.message.includes('fetch failed')) {
        console.log('   💡 Falha na requisição HTTP')
      }
    }
  }
  
  console.log('\n📋 Próximos passos:')
  console.log('1. Verifique se a URL está correta no Supabase Dashboard')
  console.log('2. Confirme se o projeto está ativo')
  console.log('3. Teste a conectividade de rede')
}

testUrls()
