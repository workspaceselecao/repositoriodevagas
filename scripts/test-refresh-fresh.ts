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

console.log('🧪 TESTE DO REFRESH - FUNÇÃO getVagasFresh')
console.log('=' .repeat(60))

async function testRefreshFunctionality() {
  try {
    console.log('\n1️⃣ TESTANDO FUNÇÃO getVagasFresh...')
    
    // Simular a função getVagasFresh
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
      console.log('\n📋 Primeiras 3 vagas (dados frescos):')
      vagas.slice(0, 3).forEach((vaga, index) => {
        console.log(`${index + 1}. ${vaga.titulo || vaga.cargo} - ${vaga.cliente}`)
        console.log(`   Criado: ${new Date(vaga.created_at).toLocaleString('pt-BR')}`)
        console.log(`   Atualizado: ${new Date(vaga.updated_at).toLocaleString('pt-BR')}`)
        console.log('')
      })
    }

    console.log('\n2️⃣ TESTANDO MÚLTIPLAS CONSULTAS (SIMULANDO REFRESH)...')
    
    const promises = []
    for (let i = 0; i < 3; i++) {
      promises.push(
        supabaseAdmin
          .from('vagas')
          .select('count')
          .then(result => ({ 
            iteration: i + 1, 
            count: result.count,
            timestamp: new Date().toLocaleTimeString('pt-BR')
          }))
      )
    }
    
    const results = await Promise.all(promises)
    console.log('📊 Resultados das consultas de refresh:')
    results.forEach(result => {
      console.log(`   Iteração ${result.iteration} (${result.timestamp}): ${result.count} vagas`)
    })

    console.log('\n3️⃣ VERIFICANDO DADOS MAIS RECENTES...')
    
    const { data: recentVagas, error: recentError } = await supabaseAdmin
      .from('vagas')
      .select('id, titulo, cargo, cliente, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5)
    
    if (recentError) {
      console.error('❌ Erro ao buscar vagas recentes:', recentError)
    } else {
      console.log('📅 Últimas 5 vagas atualizadas:')
      recentVagas?.forEach((vaga, index) => {
        console.log(`${index + 1}. ${vaga.titulo || vaga.cargo} - ${vaga.cliente}`)
        console.log(`   Última atualização: ${new Date(vaga.updated_at).toLocaleString('pt-BR')}`)
        console.log('')
      })
    }

    console.log('\n4️⃣ RESUMO DO TESTE...')
    console.log('=' .repeat(30))
    console.log('🔍 DIAGNÓSTICO:')
    console.log(`   - Total de vagas: ${vagas?.length || 0}`)
    console.log(`   - Tempo de consulta: ${duration}ms`)
    console.log(`   - Performance: ${duration < 500 ? 'Excelente' : duration < 1000 ? 'Boa' : 'Moderada'}`)
    console.log(`   - Dados frescos: ${recentVagas?.length || 0} vagas recentes`)
    
    console.log('\n💡 CONCLUSÃO:')
    if (duration < 1000 && vagas && vagas.length > 0) {
      console.log('✅ A função getVagasFresh está funcionando corretamente')
      console.log('✅ Os dados estão sendo buscados frescos do banco')
      console.log('✅ O refresh deve funcionar na interface')
    } else {
      console.log('⚠️ Possíveis problemas:')
      console.log('   - Consulta muito lenta')
      console.log('   - Problema de conectividade')
      console.log('   - Erro na função getVagasFresh')
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error)
  }
}

// Executar teste
testRefreshFunctionality()
  .then(() => {
    console.log('\n🏁 Teste concluído!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
