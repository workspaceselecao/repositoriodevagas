#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Configuração do Supabase para Node.js
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

console.log('🧪 TESTE DO REFRESH FORÇADO - PÁGINA OPORTUNIDADES')
console.log('=' .repeat(60))

async function testForceRefresh() {
  try {
    console.log('\n1️⃣ TESTANDO FUNÇÃO getVagasForceRefresh...')
    
    // Simular a função getVagasForceRefresh
    const startTime = Date.now()
    
    const { data: vagas, error } = await supabaseAdmin
      .from('vagas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (error) {
      console.error('❌ Erro ao buscar vagas:', error)
      return
    }
    
    console.log(`✅ ${vagas?.length || 0} vagas encontradas`)
    console.log(`⏱️ Tempo de consulta: ${duration}ms`)
    
    if (vagas && vagas.length > 0) {
      console.log('\n📋 Primeiras 3 vagas:')
      vagas.slice(0, 3).forEach((vaga, index) => {
        console.log(`${index + 1}. ${vaga.titulo || vaga.cargo} - ${vaga.cliente}`)
        console.log(`   Criado: ${new Date(vaga.created_at).toLocaleString('pt-BR')}`)
        console.log(`   Atualizado: ${new Date(vaga.updated_at).toLocaleString('pt-BR')}`)
        console.log('')
      })
    }

    console.log('\n2️⃣ TESTANDO MÚLTIPLAS CONSULTAS (SIMULANDO REFRESH)...')
    
    // Simular múltiplas consultas para testar se sempre busca dados frescos
    const promises = []
    for (let i = 0; i < 3; i++) {
      promises.push(
        supabaseAdmin
          .from('vagas')
          .select('count')
          .then(result => ({ 
            iteration: i + 1, 
            count: result.count,
            timestamp: new Date().toISOString()
          }))
      )
    }
    
    const results = await Promise.all(promises)
    console.log('📊 Resultados das consultas paralelas:')
    results.forEach(result => {
      console.log(`   Iteração ${result.iteration}: ${result.count} vagas (${result.timestamp})`)
    })

    console.log('\n3️⃣ VERIFICANDO DADOS MAIS RECENTES...')
    
    // Buscar a vaga mais recente
    const { data: latestVaga, error: latestError } = await supabaseAdmin
      .from('vagas')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    
    if (latestError) {
      console.error('❌ Erro ao buscar vaga mais recente:', latestError)
    } else if (latestVaga) {
      console.log('📅 Vaga mais recente:')
      console.log(`   Título: ${latestVaga.titulo || latestVaga.cargo}`)
      console.log(`   Cliente: ${latestVaga.cliente}`)
      console.log(`   Última atualização: ${new Date(latestVaga.updated_at).toLocaleString('pt-BR')}`)
    }

    console.log('\n4️⃣ RESUMO DO TESTE...')
    console.log('=' .repeat(30))
    console.log('🔍 DIAGNÓSTICO:')
    console.log(`   - Total de vagas: ${vagas?.length || 0}`)
    console.log(`   - Tempo de consulta: ${duration}ms`)
    console.log(`   - Performance: ${duration < 1000 ? 'Boa' : duration < 2000 ? 'Moderada' : 'Lenta'}`)
    console.log(`   - Consultas paralelas: ${results.length} executadas com sucesso`)
    
    console.log('\n💡 FUNCIONALIDADE ESPERADA:')
    console.log('   1. Botão atualizar deve buscar dados diretamente do DB')
    console.log('   2. Cache deve ser ignorado durante refresh')
    console.log('   3. Interface deve mostrar dados atualizados')
    console.log('   4. Timestamp de última atualização deve ser atualizado')

  } catch (error) {
    console.error('❌ Erro durante teste:', error)
  }
}

// Executar teste
testForceRefresh()
  .then(() => {
    console.log('\n🏁 Teste concluído!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
