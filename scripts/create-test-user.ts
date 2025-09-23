import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

console.log('🔍 Verificando configuração do Supabase...')
console.log(`📡 URL: ${supabaseUrl}`)
console.log(`🔑 Service Key: ${supabaseServiceKey.substring(0, 20)}...`)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuração do Supabase não encontrada!')
  process.exit(1)
}

// Criar cliente com service role key para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  try {
    console.log('🚀 Criando usuário de teste...')
    
    // Primeiro, vamos testar a conectividade
    console.log('🔍 Testando conectividade com o Supabase...')
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      if (error && error.code !== 'PGRST116') { // PGRST116 é erro de tabela não encontrada, que é esperado
        console.error('❌ Erro de conectividade:', error.message)
        console.log('💡 Verifique se:')
        console.log('   - O projeto Supabase existe e está ativo')
        console.log('   - A URL está correta')
        console.log('   - A service role key está correta')
        return
      }
      console.log('✅ Conectividade com Supabase OK')
    } catch (connectError) {
      console.error('❌ Erro de conectividade:', connectError)
      console.log('💡 Possíveis causas:')
      console.log('   - Projeto Supabase não existe ou não está ativo')
      console.log('   - URL incorreta')
      console.log('   - Problemas de rede')
      return
    }
    
    const email = 'roberio.gomes@atento.com'
    const password = 'admin123'
    const name = 'Roberio Gomes'
    const role = 'ADMIN'

    // 1. Criar usuário no Supabase Auth
    console.log('📝 Criando usuário no Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role
      }
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário no Auth:', authError.message)
      return
    }

    if (!authData.user) {
      console.error('❌ Usuário não foi criado no Auth')
      return
    }

    console.log('✅ Usuário criado no Supabase Auth:', authData.user.id)

    // 2. Criar registro na tabela users
    console.log('📝 Criando registro na tabela users...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        password_hash: '' // Não precisamos mais do hash com Supabase Auth
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ Erro ao criar usuário na tabela:', userError.message)
      
      // Tentar remover o usuário do Auth se falhou na tabela
      console.log('🧹 Removendo usuário do Auth...')
      await supabase.auth.admin.deleteUser(authData.user.id)
      return
    }

    console.log('✅ Usuário criado com sucesso!')
    console.log('📋 Detalhes do usuário:')
    console.log(`   ID: ${userData.id}`)
    console.log(`   Email: ${userData.email}`)
    console.log(`   Nome: ${userData.name}`)
    console.log(`   Role: ${userData.role}`)
    console.log('')
    console.log('🎉 Usuário de teste criado com sucesso!')
    console.log('📧 Email: roberio.gomes@atento.com')
    console.log('🔑 Senha: admin123')

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar o script
createTestUser()
