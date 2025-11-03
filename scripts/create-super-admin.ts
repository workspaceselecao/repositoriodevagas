import { createClient } from '@supabase/supabase-js'

// Email do administrador oculto
const SUPER_ADMIN_EMAIL = 'roberio.gomes@atento.com'

// Script para criar o administrador oculto específico
async function createSuperAdmin() {
  console.log('🔐 Criando Administrador Oculto')
  console.log('=' .repeat(40))
  
  const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  
  try {
    const superAdminEmail = SUPER_ADMIN_EMAIL
    const superAdminPassword = 'admintotal'
    const superAdminName = 'Administrador'
    
    console.log(`📧 Email: ${superAdminEmail}`)
    console.log(`🔑 Senha: ${superAdminPassword}`)
    console.log(`👤 Nome: ${superAdminName}`)
    console.log('')
    
    // Verificar se o usuário já existe
    console.log('🔍 Verificando se o usuário já existe...')
    
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', superAdminEmail)
      .single()
    
    if (existingUser && !checkError) {
      console.log('✅ Usuário já existe!')
      console.log(`   ID: ${existingUser.id}`)
      console.log(`   Nome: ${existingUser.name}`)
      console.log(`   Role: ${existingUser.role}`)
      console.log(`   Criado em: ${existingUser.created_at}`)
      
      // Verificar se já é admin
      if (existingUser.role === 'ADMIN') {
        console.log('✅ Usuário já é administrador!')
        console.log('')
        console.log('🎯 Acesso ao Painel de Controle:')
        console.log(`   URL: http://localhost:5173/admin/control-panel`)
        console.log(`   Email: ${superAdminEmail}`)
        console.log(`   Senha: ${superAdminPassword}`)
        return
      } else {
        console.log('⚠️ Usuário existe mas não é admin. Atualizando role...')
        
        // Atualizar role para ADMIN
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'ADMIN', updated_at: new Date().toISOString() })
          .eq('id', existingUser.id)
        
        if (updateError) {
          throw new Error(`Erro ao atualizar role: ${updateError.message}`)
        }
        
        console.log('✅ Role atualizado para ADMIN!')
        console.log('')
        console.log('🎯 Acesso ao Painel de Controle:')
        console.log(`   URL: http://localhost:5173/admin/control-panel`)
        console.log(`   Email: ${superAdminEmail}`)
        console.log(`   Senha: ${superAdminPassword}`)
        return
      }
    }
    
    // Se não existe, criar o usuário
    console.log('👤 Criando novo administrador...')
    
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: superAdminEmail,
      password: superAdminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: superAdminName,
        role: 'ADMIN'
      }
    })

    if (authError) {
      throw new Error(`Erro ao criar usuário no Auth: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário no Auth')
    }

    console.log('✅ Usuário criado no Supabase Auth!')
    console.log(`   ID: ${authData.user.id}`)
    
    // Criar registro na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: superAdminEmail,
        name: superAdminName,
        role: 'ADMIN',
        password_hash: '', // Não usado com Supabase Auth
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      throw new Error(`Erro ao criar usuário na tabela: ${userError.message}`)
    }

    console.log('✅ Usuário criado na tabela users!')
    console.log(`   ID: ${userData.id}`)
    console.log(`   Nome: ${userData.name}`)
    console.log(`   Role: ${userData.role}`)
    
    console.log('')
    console.log('🎉 Administrador criado com sucesso!')
    console.log('')
    console.log('🎯 Acesso ao Painel de Controle:')
    console.log(`   URL: http://localhost:5173/admin/control-panel`)
    console.log(`   Email: ${superAdminEmail}`)
    console.log(`   Senha: ${superAdminPassword}`)
    console.log('')
    console.log('📋 Funcionalidades disponíveis:')
    console.log('   • Bloquear/liberar carregamento de dados do banco')
    console.log('   • Controle total do sistema')
    console.log('   • Acesso exclusivo ao painel administrativo')
    console.log('')
    console.log('⚠️ IMPORTANTE:')
    console.log('   • Mantenha essas credenciais seguras')
    console.log('   • Apenas este usuário pode acessar o painel de controle')
    console.log('   • Use com cuidado em ambiente de produção')
    
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error)
    console.log('')
    console.log('💡 Possíveis soluções:')
    console.log('1. Verifique se o Supabase está acessível')
    console.log('2. Confirme se as credenciais estão corretas')
    console.log('3. Verifique se a tabela users existe')
    console.log('4. Execute: npm run setup-database')
  }
}

// Executar o script
createSuperAdmin()
