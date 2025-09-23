// Teste específico dos endpoints da API do projeto
async function testApiEndpoints() {
  console.log('🔍 Teste de Endpoints da API do Projeto')
  console.log('=' .repeat(50))
  
  const baseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'
  
  const endpoints = [
    {
      name: 'REST API Base',
      url: `${baseUrl}/rest/v1/`,
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Auth API Base',
      url: `${baseUrl}/auth/v1/`,
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'REST API sem headers',
      url: `${baseUrl}/rest/v1/`,
      headers: {}
    },
    {
      name: 'Health Check',
      url: `${baseUrl}/health`,
      headers: {}
    }
  ]
  
  for (const endpoint of endpoints) {
    console.log(`\n🔄 ${endpoint.name}`)
    console.log(`📡 ${endpoint.url}`)
    
    try {
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: endpoint.headers,
        signal: AbortSignal.timeout(10000)
      })
      
      console.log(`✅ Status: ${response.status}`)
      
      if (response.status === 200) {
        console.log('✅ Endpoint acessível!')
        const text = await response.text()
        if (text.length > 0) {
          console.log(`📄 Resposta: ${text.substring(0, 100)}...`)
        }
      } else if (response.status === 401) {
        console.log('🔐 Não autorizado - verifique as chaves de API')
      } else if (response.status === 404) {
        console.log('❌ Endpoint não encontrado')
      } else {
        console.log(`⚠️ Status inesperado: ${response.status}`)
        const text = await response.text()
        if (text.length > 0) {
          console.log(`📄 Resposta: ${text.substring(0, 200)}...`)
        }
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`)
      
      if (error.message.includes('ENOTFOUND')) {
        console.log('   💡 DNS não consegue resolver o domínio do projeto')
        console.log('   💡 O projeto pode não estar ativo ou a URL estar incorreta')
      } else if (error.message.includes('timeout')) {
        console.log('   💡 Timeout - servidor pode estar lento')
      } else if (error.message.includes('fetch failed')) {
        console.log('   💡 Falha na requisição HTTP')
      }
    }
  }
  
  console.log('\n📋 Próximos passos:')
  console.log('1. Verifique se o projeto está ativo no Supabase Dashboard')
  console.log('2. Confirme se a URL do projeto está correta')
  console.log('3. Verifique se as chaves de API estão corretas')
  console.log('4. Teste criar um novo projeto se necessário')
}

testApiEndpoints()
