import { createClient } from '@supabase/supabase-js'

// Script para testar o sistema de bloqueio
async function testBlockingSystem() {
  console.log('🧪 Testando Sistema de Bloqueio')
  console.log('=' .repeat(40))
  
  const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  
  try {
    // 1. Verificar se a tabela system_control existe
    console.log('1️⃣ Verificando se a tabela system_control existe...')
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('system_control')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Tabela system_control não existe ou não é acessível:', tableError.message)
      console.log('💡 Execute o script scripts/setup-system-control.sql primeiro')
      return
    }
    
    console.log('✅ Tabela system_control encontrada')
    
    // 2. Verificar estado atual
    console.log('\n2️⃣ Verificando estado atual do controle...')
    
    const { data: currentState, error: stateError } = await supabase
      .from('system_control')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()
    
    if (stateError) {
      console.error('❌ Erro ao buscar estado atual:', stateError.message)
      return
    }
    
    console.log('📊 Estado atual:', {
      isBlocked: currentState.is_blocked,
      blockedBy: currentState.blocked_by,
      blockedAt: currentState.blocked_at,
      updatedAt: currentState.updated_at
    })
    
    // 3. Testar bloqueio
    console.log('\n3️⃣ Testando bloqueio do sistema...')
    
    const { data: blockedState, error: blockError } = await supabase
      .from('system_control')
      .update({
        is_blocked: true,
        blocked_by: '00000000-0000-0000-0000-000000000001', // ID fictício para teste
        blocked_at: new Date().toISOString(),
        reason: 'Teste de bloqueio automático',
        updated_at: new Date().toISOString()
      })
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .select()
      .single()
    
    if (blockError) {
      console.error('❌ Erro ao bloquear sistema:', blockError.message)
      return
    }
    
    console.log('✅ Sistema bloqueado com sucesso')
    console.log('📊 Estado após bloqueio:', {
      isBlocked: blockedState.is_blocked,
      blockedBy: blockedState.blocked_by,
      blockedAt: blockedState.blocked_at,
      reason: blockedState.reason
    })
    
    // 4. Aguardar um momento
    console.log('\n⏳ Aguardando 2 segundos...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 5. Testar desbloqueio
    console.log('\n4️⃣ Testando desbloqueio do sistema...')
    
    const { data: unblockedState, error: unblockError } = await supabase
      .from('system_control')
      .update({
        is_blocked: false,
        unblocked_by: '00000000-0000-0000-0000-000000000001', // ID fictício para teste
        unblocked_at: new Date().toISOString(),
        reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .select()
      .single()
    
    if (unblockError) {
      console.error('❌ Erro ao desbloquear sistema:', unblockError.message)
      return
    }
    
    console.log('✅ Sistema desbloqueado com sucesso')
    console.log('📊 Estado após desbloqueio:', {
      isBlocked: unblockedState.is_blocked,
      unblockedBy: unblockedState.unblocked_by,
      unblockedAt: unblockedState.unblocked_at
    })
    
    // 6. Testar persistência
    console.log('\n5️⃣ Testando persistência do estado...')
    
    const { data: finalState, error: finalError } = await supabase
      .from('system_control')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()
    
    if (finalError) {
      console.error('❌ Erro ao verificar estado final:', finalError.message)
      return
    }
    
    console.log('✅ Estado final verificado:', {
      isBlocked: finalState.is_blocked,
      updatedAt: finalState.updated_at
    })
    
    console.log('\n🎉 Teste do sistema de bloqueio concluído com sucesso!')
    console.log('')
    console.log('📋 Resumo dos testes:')
    console.log('   ✅ Tabela system_control existe e é acessível')
    console.log('   ✅ Estado atual pode ser consultado')
    console.log('   ✅ Sistema pode ser bloqueado')
    console.log('   ✅ Sistema pode ser desbloqueado')
    console.log('   ✅ Estado persiste no banco de dados')
    console.log('')
    console.log('💡 Próximos passos:')
    console.log('   1. Teste o painel administrativo em /admin/control-panel')
    console.log('   2. Verifique se operações de escrita são bloqueadas quando ativo')
    console.log('   3. Confirme que o bloqueio persiste após refresh da página')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
    console.log('')
    console.log('💡 Possíveis soluções:')
    console.log('1. Verifique se o Supabase está acessível')
    console.log('2. Confirme se as credenciais estão corretas')
    console.log('3. Execute o script scripts/setup-system-control.sql primeiro')
    console.log('4. Verifique se a tabela system_control foi criada')
  }
}

// Executar o teste
testBlockingSystem()
