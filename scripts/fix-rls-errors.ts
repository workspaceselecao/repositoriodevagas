#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLSPolicies() {
  try {
    console.log('🔧 Corrigindo políticas RLS para sistema de reports...')
    
    // Verificar se a tabela reports existe
    const { data: tableExists, error: tableError } = await supabase
      .from('reports')
      .select('id')
      .limit(1)
    
    if (tableError && tableError.code === 'PGRST116') {
      console.log('❌ Tabela reports não existe!')
      console.log('📋 Execute primeiro: npm run migrate-reports')
      process.exit(1)
    }
    
    console.log('✅ Tabela reports existe')
    
    // Verificar usuários RH
    const { data: rhUsers, error: rhError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('role', 'RH')
    
    if (rhError) {
      console.error('❌ Erro ao verificar usuários RH:', rhError.message)
      process.exit(1)
    }
    
    console.log(`✅ Encontrados ${rhUsers?.length || 0} usuários RH`)
    
    // Verificar usuários ADMIN
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('role', 'ADMIN')
    
    if (adminError) {
      console.error('❌ Erro ao verificar usuários ADMIN:', adminError.message)
      process.exit(1)
    }
    
    console.log(`✅ Encontrados ${adminUsers?.length || 0} usuários ADMIN`)
    
    // Testar criação de report (simulação)
    if (rhUsers && rhUsers.length > 0 && adminUsers && adminUsers.length > 0) {
      console.log('🧪 Testando criação de report...')
      
      try {
        const testReport = {
          vaga_id: (await supabase.from('vagas').select('id').limit(1).single()).data?.id,
          reported_by: rhUsers[0].id,
          assigned_to: adminUsers[0].id,
          field_name: 'site',
          suggested_changes: 'Teste de report - pode ser deletado'
        }
        
        if (testReport.vaga_id) {
          const { data, error } = await supabase
            .from('reports')
            .insert(testReport)
            .select()
          
          if (error) {
            console.log('❌ Erro ao criar report de teste:', error.message)
            console.log('\n📋 INSTRUÇÕES PARA CORRIGIR:')
            console.log('1. Acesse o Supabase Dashboard: https://supabase.com/dashboard')
            console.log('2. Vá para o seu projeto')
            console.log('3. Clique em "SQL Editor" no menu lateral')
            console.log('4. Copie e cole o conteúdo do arquivo: scripts/fix-rls-policies.sql')
            console.log('5. Execute o script')
            console.log('\n🔧 O problema é com as políticas RLS da tabela reports')
          } else {
            console.log('✅ Report de teste criado com sucesso!')
            
            // Deletar o report de teste
            await supabase
              .from('reports')
              .delete()
              .eq('suggested_changes', 'Teste de report - pode ser deletado')
            
            console.log('✅ Report de teste removido')
            console.log('🎉 Sistema de reports está funcionando corretamente!')
          }
        } else {
          console.log('⚠️ Nenhuma vaga encontrada para teste')
        }
      } catch (testError) {
        console.error('❌ Erro durante teste:', testError)
      }
    } else {
      console.log('⚠️ É necessário ter pelo menos 1 usuário RH e 1 usuário ADMIN para testar')
    }
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error)
    console.log('\n📋 INSTRUÇÕES PARA CORRIGIR:')
    console.log('1. Acesse o Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Vá para o seu projeto')
    console.log('3. Clique em "SQL Editor" no menu lateral')
    console.log('4. Copie e cole o conteúdo do arquivo: scripts/fix-rls-policies.sql')
    console.log('5. Execute o script')
    process.exit(1)
  }
}

// Executar correção
fixRLSPolicies()
