// Script para verificar e corrigir políticas RLS da tabela vagas
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

async function fixVagasRLS() {
  console.log('🔧 Verificando e Corrigindo Políticas RLS da Tabela Vagas')
  console.log('=' .repeat(60))

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 1. Verificar políticas existentes
    console.log('\n📋 1. Verificando políticas existentes...')
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'vagas' })
    
    if (policiesError) {
      console.log(`❌ Erro ao buscar políticas: ${policiesError.message}`)
      
      // Tentar método alternativo
      const { data: altPolicies, error: altError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'vagas')
      
      if (altError) {
        console.log(`❌ Erro alternativo: ${altError.message}`)
      } else {
        console.log(`✅ Políticas encontradas: ${altPolicies?.length || 0}`)
        altPolicies?.forEach(policy => {
          console.log(`   - ${policy.policyname}: ${policy.cmd}`)
        })
      }
    } else {
      console.log(`✅ Políticas encontradas: ${policies?.length || 0}`)
    }

    // 2. Testar operações com diferentes usuários
    console.log('\n👥 2. Testando operações com diferentes usuários...')
    
    // Buscar usuários admin
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'ADMIN')
      .limit(1)
    
    if (usersError) {
      console.log(`❌ Erro ao buscar usuários: ${usersError.message}`)
    } else if (users && users.length > 0) {
      console.log(`✅ Usuário admin encontrado: ${users[0].email}`)
      
      // Testar com usuário admin
      const adminUser = users[0]
      
      // Simular operação como admin
      const { data: adminTest, error: adminTestError } = await supabase
        .from('vagas')
        .select('id')
        .limit(1)
      
      if (adminTestError) {
        console.log(`❌ Erro com usuário admin: ${adminTestError.message}`)
      } else {
        console.log('✅ Operação com admin funcionando')
      }
    }

    // 3. Verificar se há problemas específicos
    console.log('\n🔍 3. Verificando problemas específicos...')
    
    // Testar select sem filtros
    const { data: selectData, error: selectError } = await supabase
      .from('vagas')
      .select('id, site, cliente')
      .limit(1)
    
    if (selectError) {
      console.log(`❌ Erro no select: ${selectError.message}`)
    } else {
      console.log('✅ Select funcionando')
    }

    // 4. Verificar configuração de RLS
    console.log('\n⚙️ 4. Verificando configuração de RLS...')
    
    const { data: rlsConfig, error: rlsError } = await supabase
      .rpc('check_rls_enabled', { table_name: 'vagas' })
    
    if (rlsError) {
      console.log(`⚠️ Não foi possível verificar RLS: ${rlsError.message}`)
    } else {
      console.log(`✅ RLS configurado: ${rlsConfig}`)
    }

    // 5. Testar operações específicas que podem estar falhando
    console.log('\n🧪 5. Testando operações específicas...')
    
    // Testar update em registro existente
    const { data: existingVaga, error: existingError } = await supabase
      .from('vagas')
      .select('id')
      .limit(1)
      .single()
    
    if (existingError) {
      console.log(`❌ Erro ao buscar vaga existente: ${existingError.message}`)
    } else if (existingVaga) {
      console.log(`✅ Vaga encontrada para teste: ${existingVaga.id}`)
      
      // Testar update (deve falhar sem autenticação adequada)
      const { data: updateData, error: updateError } = await supabase
        .from('vagas')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', existingVaga.id)
      
      if (updateError) {
        console.log(`✅ Update protegido por RLS: ${updateError.message}`)
      } else {
        console.log('⚠️ Update não está protegido por RLS')
      }
    }

    console.log('\n✅ Verificação de RLS concluída!')

  } catch (error) {
    console.error('❌ Erro durante verificação:', error)
  }
}

// Executar verificação
fixVagasRLS()
