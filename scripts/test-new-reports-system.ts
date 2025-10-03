#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testNewReportsSystem() {
  try {
    console.log('🧪 Testando novo sistema de reports...')
    
    // 1. Verificar usuários existentes
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('role')
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message)
      return
    }
    
    console.log(`✅ Encontrados ${users?.length || 0} usuários:`)
    users?.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role} - ID: ${user.id}`)
    })
    
    // 2. Verificar vagas existentes
    const { data: vagas, error: vagasError } = await supabase
      .from('vagas')
      .select('id, site, cargo, cliente')
      .limit(3)
    
    if (vagasError) {
      console.error('❌ Erro ao buscar vagas:', vagasError.message)
      return
    }
    
    console.log(`\n✅ Encontradas ${vagas?.length || 0} vagas:`)
    vagas?.forEach(vaga => {
      console.log(`  - ${vaga.cargo} - ${vaga.cliente} - ID: ${vaga.id}`)
    })
    
    // 3. Testar criação de report
    if (users && users.length >= 2 && vagas && vagas.length > 0) {
      const rhUser = users.find(u => u.role === 'RH')
      const adminUser = users.find(u => u.role === 'ADMIN')
      
      if (rhUser && adminUser) {
        console.log('\n🧪 Testando criação de report...')
        
        const testReport = {
          vaga_id: vagas[0].id,
          reported_by: rhUser.id,
          assigned_to: adminUser.id,
          field_name: 'site',
          suggested_changes: 'Teste do novo sistema de reports - pode ser deletado'
        }
        
        console.log('📋 Dados do report:', testReport)
        
        const { data, error } = await supabase
          .from('reports')
          .insert(testReport)
          .select('*')
          .single()
        
        if (error) {
          console.log('❌ Erro ao criar report:', error.message)
          console.log('🔍 Código:', error.code)
          console.log('🔍 Detalhes:', error.details)
          console.log('🔍 Hint:', error.hint)
          
          // Se for erro de foreign key, verificar se o usuário existe
          if (error.code === '23503') {
            console.log('\n🔍 Diagnóstico de Foreign Key:')
            console.log(`  - reported_by: ${testReport.reported_by}`)
            console.log(`  - assigned_to: ${testReport.assigned_to}`)
            
            const rhExists = users.find(u => u.id === testReport.reported_by)
            const adminExists = users.find(u => u.id === testReport.assigned_to)
            
            console.log(`  - RH existe: ${!!rhExists}`)
            console.log(`  - ADMIN existe: ${!!adminExists}`)
          }
        } else {
          console.log('✅ Report criado com sucesso!')
          console.log('📋 Report:', data)
          
          // Deletar o report de teste
          await supabase
            .from('reports')
            .delete()
            .eq('id', data.id)
          
          console.log('✅ Report de teste removido')
          console.log('🎉 Novo sistema de reports funcionando!')
        }
      } else {
        console.log('⚠️ É necessário ter pelo menos 1 usuário RH e 1 usuário ADMIN')
      }
    } else {
      console.log('⚠️ É necessário ter usuários e vagas para testar')
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error)
  }
}

// Executar teste
testNewReportsSystem()
