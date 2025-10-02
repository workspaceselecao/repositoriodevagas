#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixForeignKeyConstraint() {
  try {
    console.log('🔧 Corrigindo problema de foreign key constraint...')
    
    // Verificar usuários na tabela users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .order('role')
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message)
      return
    }
    
    console.log(`✅ Encontrados ${users?.length || 0} usuários na tabela users:`)
    users?.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role} - ID: ${user.id}`)
    })
    
    // Verificar se há usuários autenticados no Supabase Auth que não estão na tabela users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erro ao buscar usuários do Auth:', authError.message)
      return
    }
    
    console.log(`\n🔍 Verificando usuários do Supabase Auth (${authUsers.users.length} usuários):`)
    
    const missingUsers = []
    authUsers.users.forEach(authUser => {
      const existsInUsers = users?.find(u => u.id === authUser.id)
      if (!existsInUsers) {
        missingUsers.push(authUser)
        console.log(`  ⚠️ Usuário Auth não encontrado na tabela users: ${authUser.email} (${authUser.id})`)
      }
    })
    
    if (missingUsers.length > 0) {
      console.log(`\n📝 ${missingUsers.length} usuários precisam ser adicionados à tabela users:`)
      
      for (const authUser of missingUsers) {
        console.log(`\n🔧 Adicionando usuário: ${authUser.email}`)
        
        // Determinar role baseado no email ou outros critérios
        let role = 'RH' // Default
        if (authUser.email?.includes('admin') || authUser.email?.includes('roberio.gomes')) {
          role = 'ADMIN'
        }
        
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
            role: role
          })
          .select()
          .single()
        
        if (insertError) {
          console.error(`❌ Erro ao adicionar usuário ${authUser.email}:`, insertError.message)
        } else {
          console.log(`✅ Usuário adicionado: ${newUser.name} (${newUser.role})`)
        }
      }
    } else {
      console.log('✅ Todos os usuários do Auth estão na tabela users')
    }
    
    // Testar criação de report após correções
    console.log('\n🧪 Testando criação de report após correções...')
    
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
    
    if (rhUsers?.length > 0 && adminUsers?.length > 0) {
      const { data: vagas, error: vagasError } = await supabase
        .from('vagas')
        .select('id')
        .limit(1)
      
      if (vagas?.length > 0) {
        const testReport = {
          vaga_id: vagas[0].id,
          reported_by: rhUsers[0].id,
          assigned_to: adminUsers[0].id,
          field_name: 'site',
          suggested_changes: 'Teste após correção FK - pode ser deletado'
        }
        
        const { data, error } = await supabase
          .from('reports')
          .insert(testReport)
          .select('*')
          .single()
        
        if (error) {
          console.log('❌ Erro ao criar report de teste:', error.message)
          console.log('🔍 Código:', error.code)
          console.log('🔍 Detalhes:', error.details)
        } else {
          console.log('✅ Report de teste criado com sucesso!')
          
          // Deletar o report de teste
          await supabase
            .from('reports')
            .delete()
            .eq('suggested_changes', 'Teste após correção FK - pode ser deletado')
          
          console.log('✅ Report de teste removido')
          console.log('🎉 Problema de foreign key constraint resolvido!')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error)
  }
}

// Executar correção
fixForeignKeyConstraint()
