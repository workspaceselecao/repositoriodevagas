// Script para testar políticas RLS e permissões específicas
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRLSPolicies() {
  console.log('🔍 Testando políticas RLS e permissões...')
  console.log('=' .repeat(60))
  
  try {
    // 1. Testar sem autenticação
    console.log('🔄 Teste 1: Sem autenticação')
    const { data: unauthenticatedData, error: unauthenticatedError } = await supabase
      .from('vagas')
      .select('count')
      .limit(1)
    
    console.log('   Resultado:', unauthenticatedError ? `❌ ${unauthenticatedError.message}` : `✅ ${unauthenticatedData?.length || 0} registros`)
    
    // 2. Fazer login
    console.log('🔄 Teste 2: Fazendo login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'roberio.gomes@atento.com',
      password: 'admin123'
    })
    
    if (authError) {
      console.error('❌ Erro no login:', authError.message)
      return
    }
    
    console.log('   ✅ Login realizado com sucesso')
    console.log('   👤 Usuário:', authData.user.email)
    console.log('   🆔 ID:', authData.user.id)
    
    // 3. Verificar sessão atual
    console.log('🔄 Teste 3: Verificando sessão atual...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError.message)
    } else if (session) {
      console.log('   ✅ Sessão ativa encontrada')
      console.log('   🔑 Token:', session.access_token.substring(0, 20) + '...')
    } else {
      console.log('   ⚠️ Nenhuma sessão ativa')
    }
    
    // 4. Testar consulta simples
    console.log('🔄 Teste 4: Consulta simples na tabela vagas...')
    const { data: simpleData, error: simpleError } = await supabase
      .from('vagas')
      .select('id, cliente, site, cargo')
      .limit(5)
    
    if (simpleError) {
      console.error('   ❌ Erro na consulta simples:', simpleError.message)
      console.error('   📋 Código do erro:', simpleError.code)
      console.error('   📋 Detalhes:', simpleError.details)
    } else {
      console.log(`   ✅ ${simpleData?.length || 0} registros retornados`)
      if (simpleData && simpleData.length > 0) {
        console.log('   📋 Primeiro registro:', simpleData[0])
      }
    }
    
    // 5. Testar consulta com count
    console.log('🔄 Teste 5: Consulta com count...')
    const { count, error: countError } = await supabase
      .from('vagas')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('   ❌ Erro no count:', countError.message)
    } else {
      console.log(`   ✅ Total de vagas: ${count}`)
    }
    
    // 6. Testar consulta para clientes únicos
    console.log('🔄 Teste 6: Consulta para clientes únicos...')
    const { data: clientesData, error: clientesError } = await supabase
      .from('vagas')
      .select('cliente')
      .not('cliente', 'is', null)
    
    if (clientesError) {
      console.error('   ❌ Erro na consulta de clientes:', clientesError.message)
    } else {
      const clientes = [...new Set(clientesData?.map(item => item.cliente).filter(Boolean) || [])]
      console.log(`   ✅ ${clientes.length} clientes únicos encontrados`)
      console.log('   📋 Clientes:', clientes.slice(0, 5).join(', '))
    }
    
    // 7. Testar consulta para sites únicos
    console.log('🔄 Teste 7: Consulta para sites únicos...')
    const { data: sitesData, error: sitesError } = await supabase
      .from('vagas')
      .select('site')
      .not('site', 'is', null)
    
    if (sitesError) {
      console.error('   ❌ Erro na consulta de sites:', sitesError.message)
    } else {
      const sites = [...new Set(sitesData?.map(item => item.site).filter(Boolean) || [])]
      console.log(`   ✅ ${sites.length} sites únicos encontrados`)
      console.log('   📋 Sites:', sites.slice(0, 5).join(', '))
    }
    
    // 8. Verificar políticas RLS
    console.log('🔄 Teste 8: Verificando políticas RLS...')
    const { data: policiesData, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'vagas' })
      .catch(() => {
        // Se a função não existir, tentar consulta direta
        return supabase
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'vagas')
      })
    
    if (policiesError) {
      console.log('   ⚠️ Não foi possível verificar políticas RLS:', policiesError.message)
    } else {
      console.log(`   ✅ ${policiesData?.length || 0} políticas encontradas`)
    }
    
    console.log('=' .repeat(60))
    console.log('✅ Teste de políticas RLS concluído!')
    
  } catch (error) {
    console.error('💥 Erro geral no teste:', error)
  }
}

testRLSPolicies()
