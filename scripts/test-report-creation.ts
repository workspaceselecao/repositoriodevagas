#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testReportCreation() {
  try {
    console.log('🧪 Testando criação de report...')
    
    // Buscar usuários RH e ADMIN
    const { data: rhUsers, error: rhError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('role', 'RH')
      .limit(1)
    
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('role', 'ADMIN')
      .limit(1)
    
    if (rhError || adminError || !rhUsers?.length || !adminUsers?.length) {
      console.error('❌ Erro ao buscar usuários:', { rhError, adminError })
      return
    }
    
    // Buscar uma vaga para testar
    const { data: vagas, error: vagasError } = await supabase
      .from('vagas')
      .select('id, site, cargo, cliente')
      .limit(1)
    
    if (vagasError || !vagas?.length) {
      console.error('❌ Erro ao buscar vagas:', vagasError)
      return
    }
    
    console.log('👤 Usuário RH:', rhUsers[0])
    console.log('👤 Usuário ADMIN:', adminUsers[0])
    console.log('💼 Vaga:', vagas[0])
    
    // Testar criação de report
    const testReport = {
      vaga_id: vagas[0].id,
      reported_by: rhUsers[0].id,
      assigned_to: adminUsers[0].id,
      field_name: 'site',
      suggested_changes: 'Teste de report - pode ser deletado'
    }
    
    console.log('📝 Criando report de teste:', testReport)
    
    const { data, error } = await supabase
      .from('reports')
      .insert(testReport)
      .select('*')
      .single()
    
    if (error) {
      console.error('❌ Erro ao criar report:', error)
      console.log('🔍 Detalhes do erro:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
    } else {
      console.log('✅ Report criado com sucesso!')
      console.log('📋 Report criado:', data)
      
      // Deletar o report de teste
      const { error: deleteError } = await supabase
        .from('reports')
        .delete()
        .eq('id', data.id)
      
      if (deleteError) {
        console.log('⚠️ Erro ao deletar report de teste:', deleteError)
      } else {
        console.log('✅ Report de teste removido')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error)
  }
}

// Executar teste
testReportCreation()
