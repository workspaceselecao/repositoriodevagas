// Script para testar login com credenciais corretas
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('🔍 Testando login com credenciais corretas...')
  console.log('=' .repeat(50))
  
  try {
    // Tentar fazer login com as credenciais corretas
    console.log('🔄 Tentando fazer login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'roberio.gomes@atento.com',
      password: 'admin123'
    })
    
    if (authError) {
      console.error('❌ Erro ao fazer login:', authError.message)
      return
    }
    
    if (!authData.user) {
      console.error('❌ Usuário não encontrado')
      return
    }
    
    console.log('✅ Login realizado com sucesso!')
    console.log(`👤 Usuário: ${authData.user.email}`)
    console.log(`🆔 ID: ${authData.user.id}`)
    
    // Agora testar carregamento de dados com sessão ativa
    console.log('🔄 Testando carregamento de vagas com sessão ativa...')
    const { data: vagas, error: vagasError } = await supabase
      .from('vagas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000)
    
    if (vagasError) {
      console.error('❌ Erro ao carregar vagas:', vagasError)
    } else {
      console.log(`✅ ${vagas?.length || 0} vagas carregadas`)
    }
    
    // Testar carregamento de clientes
    console.log('🔄 Testando carregamento de clientes com sessão ativa...')
    const { data: clientesData, error: clientesError } = await supabase
      .from('vagas')
      .select('cliente')
      .not('cliente', 'is', null)
      .order('cliente')
    
    if (clientesError) {
      console.error('❌ Erro ao carregar clientes:', clientesError)
    } else {
      const clientes = [...new Set(clientesData?.map((item: any) => item.cliente).filter(Boolean) || [])] as string[]
      console.log(`✅ ${clientes.length} clientes únicos carregados`)
    }
    
    // Testar carregamento de sites
    console.log('🔄 Testando carregamento de sites com sessão ativa...')
    const { data: sitesData, error: sitesError } = await supabase
      .from('vagas')
      .select('site')
      .not('site', 'is', null)
      .order('site')
    
    if (sitesError) {
      console.error('❌ Erro ao carregar sites:', sitesError)
    } else {
      const sites = [...new Set(sitesData?.map((item: any) => item.site).filter(Boolean) || [])] as string[]
      console.log(`✅ ${sites.length} sites únicos carregados`)
    }
    
    console.log('=' .repeat(50))
    console.log('✅ Teste de login e carregamento concluído!')
    
  } catch (error) {
    console.error('💥 Erro geral no teste:', error)
  }
}

testLogin()
