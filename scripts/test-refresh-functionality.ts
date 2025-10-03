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

console.log('🧪 TESTE DO BOTÃO ATUALIZAR - PÁGINA OPORTUNIDADES')
console.log('=' .repeat(60))

async function testRefreshFunctionality() {
  try {
    console.log('\n1️⃣ TESTANDO FUNÇÃO getVagas...')
    
    // Simular a função getVagas que é chamada pelo refreshVagas
    const { data: vagas, error } = await supabaseAdmin
      .from('vagas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar vagas:', error)
      return
    }
    
    console.log(`✅ ${vagas?.length || 0} vagas encontradas`)
    
    if (vagas && vagas.length > 0) {
      console.log('📋 Primeiras 3 vagas:')
      vagas.slice(0, 3).forEach((vaga, index) => {
        console.log(`${index + 1}. ${vaga.titulo || vaga.cargo} - ${vaga.cliente}`)
      })
    }

    console.log('\n2️⃣ TESTANDO PERFORMANCE DA CONSULTA...')
    
    const startTime = Date.now()
    const { data: vagasPerformance, error: perfError } = await supabaseAdmin
      .from('vagas')
      .select('id, titulo, cargo, cliente, site, created_at, updated_at')
      .order('updated_at', { ascending: false })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (perfError) {
      console.error('❌ Erro na consulta de performance:', perfError)
    } else {
      console.log(`✅ Consulta executada em ${duration}ms`)
      console.log(`📊 ${vagasPerformance?.length || 0} registros retornados`)
      
      if (duration > 2000) {
        console.log('⚠️ Consulta lenta - pode causar problemas de UX')
      } else if (duration > 1000) {
        console.log('⚠️ Consulta moderada - considerar otimização')
      } else {
        console.log('✅ Performance adequada')
      }
    }

    console.log('\n3️⃣ TESTANDO CACHE E ATUALIZAÇÃO...')
    
    // Simular múltiplas chamadas para testar cache
    const promises = []
    for (let i = 0; i < 3; i++) {
      promises.push(
        supabaseAdmin
          .from('vagas')
          .select('count')
          .then(result => ({ iteration: i + 1, count: result.count }))
      )
    }
    
    const results = await Promise.all(promises)
    console.log('📊 Resultados das consultas paralelas:')
    results.forEach(result => {
      console.log(`   Iteração ${result.iteration}: ${result.count} vagas`)
    })

    console.log('\n4️⃣ VERIFICANDO ESTRUTURA DOS DADOS...')
    
    if (vagas && vagas.length > 0) {
      const sampleVaga = vagas[0]
      console.log('📋 Estrutura de uma vaga:')
      console.log('   Campos disponíveis:', Object.keys(sampleVaga))
      
      // Verificar campos importantes
      const importantFields = ['id', 'titulo', 'cargo', 'cliente', 'site', 'created_at', 'updated_at']
      const missingFields = importantFields.filter(field => !(field in sampleVaga))
      
      if (missingFields.length > 0) {
        console.log('⚠️ Campos importantes ausentes:', missingFields)
      } else {
        console.log('✅ Todos os campos importantes estão presentes')
      }
    }

    console.log('\n5️⃣ RESUMO DO TESTE...')
    console.log('=' .repeat(30))
    console.log('🔍 DIAGNÓSTICO:')
    console.log(`   - Total de vagas: ${vagas?.length || 0}`)
    console.log(`   - Tempo de consulta: ${duration}ms`)
    console.log(`   - Performance: ${duration < 1000 ? 'Boa' : duration < 2000 ? 'Moderada' : 'Lenta'}`)
    console.log(`   - Estrutura: ${vagas && vagas.length > 0 ? 'OK' : 'Problema'}`)
    
    console.log('\n💡 POSSÍVEIS CAUSAS DO PROBLEMA:')
    console.log('   1. Consulta muito lenta (>2s)')
    console.log('   2. Erro na função getVagas')
    console.log('   3. Problema no CacheContext')
    console.log('   4. Estado de loading não sendo atualizado')
    console.log('   5. Hook useVagas não reagindo às mudanças')

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
