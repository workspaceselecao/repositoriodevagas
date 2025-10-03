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

// Funções auxiliares para reports
async function getAllAdmins() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, role')
    .eq('role', 'ADMIN')
  
  if (error) throw error
  return data || []
}

async function createReport(reportData: any, reportedBy: string) {
  const { data, error } = await supabaseAdmin
    .from('reports')
    .insert({
      ...reportData,
      reported_by: reportedBy
    })
    .select('*')
    .single()
  
  if (error) throw error
  return data
}

console.log('🔍 DIAGNÓSTICO COMPLETO DO SISTEMA DE REPORTS')
console.log('=' .repeat(60))

async function diagnoseReportsSystem() {
  try {
    console.log('\n1️⃣ VERIFICANDO CONECTIVIDADE COM SUPABASE...')
    
    // Testar conectividade básica
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erro de conectividade:', testError)
      return
    }
    
    console.log('✅ Conectividade com Supabase OK')

    console.log('\n2️⃣ VERIFICANDO TABELA REPORTS...')
    
    // Verificar se a tabela reports existe
    const { data: reportsTable, error: reportsError } = await supabaseAdmin
      .from('reports')
      .select('count')
      .limit(1)
    
    if (reportsError) {
      console.error('❌ Tabela reports não existe ou erro de acesso:', reportsError)
      console.log('💡 Execute o script SQL manual para criar a tabela')
      return
    }
    
    console.log('✅ Tabela reports existe e é acessível')

    console.log('\n3️⃣ VERIFICANDO USUÁRIOS E ROLES...')
    
    // Buscar todos os usuários
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
      return
    }
    
    console.log(`✅ Total de usuários encontrados: ${users?.length || 0}`)
    
    const rhUsers = users?.filter(u => u.role === 'RH') || []
    const adminUsers = users?.filter(u => u.role === 'ADMIN') || []
    
    console.log(`👥 Usuários RH: ${rhUsers.length}`)
    console.log(`👑 Usuários ADMIN: ${adminUsers.length}`)
    
    if (rhUsers.length === 0) {
      console.log('⚠️ Nenhum usuário RH encontrado!')
    }
    
    if (adminUsers.length === 0) {
      console.log('⚠️ Nenhum usuário ADMIN encontrado!')
    }

    console.log('\n4️⃣ TESTANDO FUNÇÃO getAllAdmins...')
    
    try {
      const admins = await getAllAdmins()
      console.log(`✅ getAllAdmins funcionando - ${admins.length} admins encontrados`)
      
      if (admins.length > 0) {
        console.log('📋 Admins disponíveis:')
        admins.forEach(admin => {
          console.log(`   - ${admin.name} (${admin.email})`)
        })
      }
    } catch (error) {
      console.error('❌ Erro em getAllAdmins:', error)
    }

    console.log('\n5️⃣ VERIFICANDO POLÍTICAS RLS...')
    
    // Verificar políticas RLS da tabela reports
    try {
      const { data: policies, error: policiesError } = await supabaseAdmin
        .rpc('get_table_policies', { table_name: 'reports' })
      
      if (policiesError) {
        console.log('⚠️ Não foi possível verificar políticas RLS automaticamente')
        console.log('💡 Verifique manualmente no Supabase Dashboard')
      } else {
        console.log('✅ Políticas RLS verificadas')
      }
    } catch (error) {
      console.log('⚠️ Função RPC não disponível - verificando políticas manualmente')
      console.log('💡 Verifique manualmente no Supabase Dashboard > Authentication > Policies')
    }

    console.log('\n6️⃣ TESTANDO CRIAÇÃO DE REPORT (SIMULAÇÃO)...')
    
    if (rhUsers.length > 0 && adminUsers.length > 0) {
      const testRHUser = rhUsers[0]
      const testAdminUser = adminUsers[0]
      
      console.log(`🧪 Testando com usuário RH: ${testRHUser.name} (${testRHUser.email})`)
      console.log(`🧪 Admin selecionado: ${testAdminUser.name} (${testAdminUser.email})`)
      
      // Buscar uma vaga para teste
      const { data: vagas, error: vagasError } = await supabaseAdmin
        .from('vagas')
        .select('id, titulo, cliente, cargo')
        .limit(1)
      
      if (vagasError || !vagas || vagas.length === 0) {
        console.log('⚠️ Nenhuma vaga encontrada para teste')
        return
      }
      
      const testVaga = vagas[0]
      console.log(`📋 Vaga de teste: ${testVaga.titulo} - ${testVaga.cliente}`)
      
      // Simular criação de report
      const testReportData = {
        vaga_id: testVaga.id,
        assigned_to: testAdminUser.id,
        field_name: 'titulo',
        suggested_changes: 'Teste de diagnóstico do sistema de reports'
      }
      
      try {
        console.log('🚀 Tentando criar report de teste...')
        const report = await createReport(testReportData, testRHUser.id)
        
        if (report) {
          console.log('✅ Report criado com sucesso!')
          console.log(`📝 ID do report: ${report.id}`)
          
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
        console.error('❌ Erro ao criar report de teste:', error)
        console.log('🔍 Detalhes do erro:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
      }
    } else {
      console.log('⚠️ Não é possível testar criação de report - usuários insuficientes')
    }

    console.log('\n7️⃣ VERIFICANDO COMUNICAÇÃO EM TEMPO REAL...')
    
    // Verificar se o Realtime está habilitado
    const { data: realtimeStatus, error: realtimeError } = await supabaseAdmin
      .from('reports')
      .select('id')
      .limit(1)
    
    if (realtimeError) {
      console.error('❌ Erro ao verificar Realtime:', realtimeError)
    } else {
      console.log('✅ Realtime parece estar funcionando')
    }

    console.log('\n8️⃣ RESUMO DO DIAGNÓSTICO...')
    console.log('=' .repeat(40))
    
    const issues = []
    
    if (users?.length === 0) issues.push('Nenhum usuário encontrado')
    if (rhUsers.length === 0) issues.push('Nenhum usuário RH encontrado')
    if (adminUsers.length === 0) issues.push('Nenhum usuário ADMIN encontrado')
    
    if (issues.length === 0) {
      console.log('✅ Sistema parece estar funcionando corretamente!')
      console.log('💡 Se ainda há problemas, verifique:')
      console.log('   - Conexão com internet')
      console.log('   - Configurações do Supabase')
      console.log('   - Políticas RLS no dashboard')
      console.log('   - Logs do navegador')
    } else {
      console.log('⚠️ Problemas identificados:')
      issues.forEach(issue => console.log(`   - ${issue}`))
    }

  } catch (error) {
    console.error('❌ Erro geral no diagnóstico:', error)
  }
}

// Executar diagnóstico
diagnoseReportsSystem()
  .then(() => {
    console.log('\n🏁 Diagnóstico concluído!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Erro fatal no diagnóstico:', error)
    process.exit(1)
  })
