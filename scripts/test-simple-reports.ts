#!/usr/bin/env tsx

import { supabase, supabaseAdmin } from '../src/lib/supabase'
import { createReport, getAllAdmins } from '../src/lib/reports'

console.log('🧪 TESTE SIMPLIFICADO DO SISTEMA DE REPORTS')
console.log('=' .repeat(50))

async function testReportsSystem() {
  try {
    console.log('\n1️⃣ Verificando conectividade...')
    
    // Testar conectividade básica
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erro de conectividade:', testError)
      return
    }
    
    console.log('✅ Conectividade OK')

    console.log('\n2️⃣ Verificando tabela reports...')
    
    const { data: reportsTable, error: reportsError } = await supabaseAdmin
      .from('reports')
      .select('count')
      .limit(1)
    
    if (reportsError) {
      console.error('❌ Tabela reports não existe:', reportsError)
      return
    }
    
    console.log('✅ Tabela reports OK')

    console.log('\n3️⃣ Buscando usuários...')
    
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
      return
    }
    
    const rhUsers = users?.filter(u => u.role === 'RH') || []
    const adminUsers = users?.filter(u => u.role === 'ADMIN') || []
    
    console.log(`👥 Usuários RH: ${rhUsers.length}`)
    console.log(`👑 Usuários ADMIN: ${adminUsers.length}`)
    
    if (rhUsers.length === 0 || adminUsers.length === 0) {
      console.log('⚠️ Usuários insuficientes para teste')
      return
    }

    console.log('\n4️⃣ Testando getAllAdmins...')
    
    try {
      const admins = await getAllAdmins()
      console.log(`✅ getAllAdmins OK - ${admins.length} admins`)
    } catch (error) {
      console.error('❌ Erro em getAllAdmins:', error)
      return
    }

    console.log('\n5️⃣ Buscando vaga para teste...')
    
    const { data: vagas, error: vagasError } = await supabaseAdmin
      .from('vagas')
      .select('id, titulo, cliente, cargo')
      .limit(1)
    
    if (vagasError || !vagas || vagas.length === 0) {
      console.log('⚠️ Nenhuma vaga encontrada')
      return
    }
    
    const testVaga = vagas[0]
    console.log(`✅ Vaga encontrada: ${testVaga.titulo} - ${testVaga.cliente}`)

    console.log('\n6️⃣ Testando criação de report...')
    
    const testRHUser = rhUsers[0]
    const testAdminUser = adminUsers[0]
    
    const testReportData = {
      vaga_id: testVaga.id,
      assigned_to: testAdminUser.id,
      field_name: 'titulo',
      suggested_changes: 'Teste do sistema simplificado de reports'
    }
    
    try {
      console.log('🚀 Criando report de teste...')
      const report = await createReport(testReportData, testRHUser.id)
      
      if (report) {
        console.log('✅ Report criado com sucesso!')
        console.log(`📝 ID: ${report.id}`)
        console.log(`📋 Status: ${report.status}`)
        
        // Limpar o report de teste
        await supabaseAdmin
          .from('reports')
          .delete()
          .eq('id', report.id)
        
        console.log('🧹 Report de teste removido')
      } else {
        console.log('❌ Report retornou null')
      }
    } catch (error) {
      console.error('❌ Erro ao criar report:', error)
      console.log('🔍 Detalhes:', {
        message: error.message,
        code: error.code
      })
    }

    console.log('\n✅ TESTE CONCLUÍDO!')
    console.log('O sistema de reports está funcionando corretamente.')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar teste
testReportsSystem()
  .then(() => {
    console.log('\n🏁 Teste finalizado!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
