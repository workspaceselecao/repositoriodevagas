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

console.log('🧪 TESTE SIMULANDO PROBLEMA DA INTERFACE')
console.log('=' .repeat(50))

async function testInterfaceProblem() {
  try {
    console.log('\n1️⃣ SIMULANDO LOGIN DO USUÁRIO RH...')
    
    // Simular login do usuário RH
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'robgomez.sir@gmail.com',
      password: 'admin123' // Assumindo que a senha é a mesma
    })
    
    if (authError) {
      console.log('⚠️ Não foi possível fazer login (normal em script)')
      console.log('💡 Vamos simular o problema diretamente...')
    } else {
      console.log('✅ Login simulado:', authData.user?.email)
    }

    console.log('\n2️⃣ SIMULANDO PROBLEMA ORIGINAL (Auth ID)...')
    
    // Simular o problema original usando Auth ID
    const authUserId = '8541ed5b-e34e-475c-b568-24dac0869adc' // Auth ID do RH
    const adminUserId = '63b5dd5b-c5d1-4b28-921a-1936447da1c1' // Admin ID
    
    console.log(`🧪 Tentando criar report com Auth ID: ${authUserId}`)
    
    const { data: vaga, error: vagaError } = await supabaseAdmin
      .from('vagas')
      .select('id, titulo, cliente')
      .limit(1)
      .single()
    
    if (vagaError) {
      console.error('❌ Erro ao buscar vaga:', vagaError)
      return
    }
    
    // Tentar criar report com Auth ID (deve falhar)
    const { data: reportFail, error: reportError } = await supabaseAdmin
      .from('reports')
      .insert({
        vaga_id: vaga.id,
        reported_by: authUserId, // Auth ID - deve causar erro de FK
        assigned_to: adminUserId,
        field_name: 'titulo',
        current_value: vaga.titulo,
        suggested_changes: 'Teste simulando problema da interface'
      })
      .select('*')
      .single()
    
    if (reportError) {
      console.log('❌ ERRO ESPERADO (problema original):', reportError.message)
      console.log('🔍 Detalhes:', {
        code: reportError.code,
        details: reportError.details,
        hint: reportError.hint
      })
    } else {
      console.log('⚠️ Report criado (não deveria acontecer)')
    }

    console.log('\n3️⃣ TESTANDO SOLUÇÃO CORRIGIDA...')
    
    // Buscar o ID correto na tabela users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', 'robgomez.sir@gmail.com')
      .single()
    
    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError)
      return
    }
    
    const correctUserId = userData.id
    console.log(`✅ ID correto encontrado: ${correctUserId}`)
    
    // Tentar criar report com ID correto (deve funcionar)
    const { data: reportSuccess, error: reportSuccessError } = await supabaseAdmin
      .from('reports')
      .insert({
        vaga_id: vaga.id,
        reported_by: correctUserId, // ID correto da tabela users
        assigned_to: adminUserId,
        field_name: 'titulo',
        current_value: vaga.titulo,
        suggested_changes: 'Teste com solução corrigida'
      })
      .select('*')
      .single()
    
    if (reportSuccessError) {
      console.error('❌ Erro inesperado:', reportSuccessError)
    } else {
      console.log('✅ SUCESSO! Report criado com ID correto:', reportSuccess.id)
      
      // Limpar o report de teste
      await supabaseAdmin
        .from('reports')
        .delete()
        .eq('id', reportSuccess.id)
      
      console.log('🧹 Report de teste removido')
    }

    console.log('\n4️⃣ RESUMO DA CORREÇÃO...')
    console.log('=' .repeat(30))
    console.log('🔧 PROBLEMA IDENTIFICADO:')
    console.log('   - Frontend usava Auth ID do Supabase')
    console.log('   - Backend esperava Users Table ID')
    console.log('   - IDs diferentes causavam erro de FK')
    console.log('')
    console.log('✅ SOLUÇÃO IMPLEMENTADA:')
    console.log('   - Função createReport busca ID correto por email')
    console.log('   - Usa ID da tabela users em vez do Auth ID')
    console.log('   - Mantém compatibilidade com ambos os sistemas')

  } catch (error) {
    console.error('❌ Erro durante teste:', error)
  }
}

// Executar teste
testInterfaceProblem()
  .then(() => {
    console.log('\n🏁 Teste concluído!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
