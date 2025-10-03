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

console.log('🔍 INVESTIGANDO PROBLEMA DE CHAVE ESTRANGEIRA')
console.log('=' .repeat(60))

async function investigateForeignKeyIssue() {
  try {
    console.log('\n1️⃣ VERIFICANDO ESTRUTURA DA TABELA REPORTS...')
    
    // Verificar estrutura da tabela reports
    const { data: reportsStructure, error: reportsError } = await supabaseAdmin
      .from('reports')
      .select('*')
      .limit(1)
    
    if (reportsError) {
      console.error('❌ Erro ao verificar estrutura da tabela reports:', reportsError)
      return
    }
    
    console.log('✅ Tabela reports acessível')
    if (reportsStructure && reportsStructure.length > 0) {
      console.log('📋 Estrutura da tabela reports:', Object.keys(reportsStructure[0]))
    }

    console.log('\n2️⃣ VERIFICANDO USUÁRIOS E SEUS IDs...')
    
    // Buscar todos os usuários
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
      .order('created_at', { ascending: true })
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
      return
    }
    
    console.log(`✅ Total de usuários encontrados: ${users?.length || 0}`)
    
    if (users && users.length > 0) {
      console.log('\n📋 Lista de usuários:')
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Nome: ${user.name}`)
        console.log(`   Role: ${user.role}`)
        console.log('')
      })
    }

    console.log('\n3️⃣ VERIFICANDO SUPABASE AUTH USERS...')
    
    // Verificar usuários do Supabase Auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erro ao buscar usuários do Auth:', authError)
    } else {
      console.log(`✅ Total de usuários Auth encontrados: ${authUsers?.users?.length || 0}`)
      
      if (authUsers?.users && authUsers.users.length > 0) {
        console.log('\n📋 Lista de usuários Auth:')
        authUsers.users.forEach((user, index) => {
          console.log(`${index + 1}. ID: ${user.id}`)
          console.log(`   Email: ${user.email}`)
          console.log(`   Created: ${user.created_at}`)
          console.log('')
        })
      }
    }

    console.log('\n4️⃣ COMPARANDO IDs ENTRE TABELAS...')
    
    if (users && authUsers?.users) {
      const usersTableIds = users.map(u => u.id)
      const authUserIds = authUsers.users.map(u => u.id)
      
      console.log('📊 IDs na tabela users:', usersTableIds)
      console.log('📊 IDs no Supabase Auth:', authUserIds)
      
      const missingInUsers = authUserIds.filter(id => !usersTableIds.includes(id))
      const missingInAuth = usersTableIds.filter(id => !authUserIds.includes(id))
      
      if (missingInUsers.length > 0) {
        console.log('⚠️ IDs no Auth mas não na tabela users:', missingInUsers)
      }
      
      if (missingInAuth.length > 0) {
        console.log('⚠️ IDs na tabela users mas não no Auth:', missingInAuth)
      }
      
      if (missingInUsers.length === 0 && missingInAuth.length === 0) {
        console.log('✅ Todos os IDs estão sincronizados entre as tabelas')
      }
    }

    console.log('\n5️⃣ TESTANDO CRIAÇÃO DE REPORT COM IDs CORRETOS...')
    
    if (users && users.length >= 2) {
      const rhUser = users.find(u => u.role === 'RH')
      const adminUser = users.find(u => u.role === 'ADMIN')
      
      if (rhUser && adminUser) {
        console.log(`🧪 Testando com RH: ${rhUser.name} (${rhUser.id})`)
        console.log(`🧪 Testando com ADMIN: ${adminUser.name} (${adminUser.id})`)
        
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
        
        // Testar criação de report com IDs corretos
        const testReportData = {
          vaga_id: testVaga.id,
          reported_by: rhUser.id, // Usar ID da tabela users
          assigned_to: adminUser.id, // Usar ID da tabela users
          field_name: 'titulo',
          current_value: testVaga.titulo,
          suggested_changes: 'Teste de investigação de chave estrangeira'
        }
        
        try {
          console.log('🚀 Tentando criar report com IDs corretos...')
          const { data: report, error: reportError } = await supabaseAdmin
            .from('reports')
            .insert(testReportData)
            .select('*')
            .single()
          
          if (reportError) {
            console.error('❌ Erro ao criar report:', reportError)
            console.log('🔍 Detalhes do erro:', {
              code: reportError.code,
              message: reportError.message,
              details: reportError.details,
              hint: reportError.hint
            })
          } else {
            console.log('✅ Report criado com sucesso!')
            console.log('📝 Report criado:', report)
            
            // Limpar o report de teste
            await supabaseAdmin
              .from('reports')
              .delete()
              .eq('id', report.id)
            
            console.log('🧹 Report de teste removido')
          }
        } catch (error) {
          console.error('❌ Erro durante teste:', error)
        }
      } else {
        console.log('⚠️ Não foi possível encontrar usuários RH e ADMIN para teste')
      }
    }

    console.log('\n6️⃣ RESUMO DA INVESTIGAÇÃO...')
    console.log('=' .repeat(40))
    
    console.log('💡 Possíveis causas do erro de chave estrangeira:')
    console.log('1. IDs de usuário diferentes entre Supabase Auth e tabela users')
    console.log('2. Usuário não existe na tabela users mas existe no Auth')
    console.log('3. Referência incorreta na função createReport')
    console.log('4. Problema de sincronização entre tabelas')

  } catch (error) {
    console.error('❌ Erro geral na investigação:', error)
  }
}

// Executar investigação
investigateForeignKeyIssue()
  .then(() => {
    console.log('\n🏁 Investigação concluída!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Erro fatal na investigação:', error)
    process.exit(1)
  })
