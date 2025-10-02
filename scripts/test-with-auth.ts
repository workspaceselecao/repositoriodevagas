// Script para testar carregamento de dados com autenticação
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testWithAuth() {
  console.log('🔍 Testando carregamento de dados com autenticação...')
  console.log('=' .repeat(50))
  
  try {
    // Primeiro, verificar se há uma sessão ativa
    console.log('🔄 Verificando sessão atual...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError)
      return
    }
    
    if (!session) {
      console.log('⚠️ Nenhuma sessão ativa encontrada')
      console.log('🔄 Tentando fazer login com usuário de teste...')
      
      // Tentar fazer login com um usuário de teste
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@repovagas.com',
        password: 'admin123'
      })
      
      if (authError) {
        console.error('❌ Erro ao fazer login:', authError.message)
        console.log('💡 Criando usuário de teste...')
        
        // Tentar criar usuário de teste
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'admin@repovagas.com',
          password: 'admin123',
          options: {
            data: {
              full_name: 'Administrador',
              role: 'ADMIN'
            }
          }
        })
        
        if (signUpError) {
          console.error('❌ Erro ao criar usuário:', signUpError.message)
          return
        }
        
        console.log('✅ Usuário criado com sucesso!')
        console.log('🔄 Tentando fazer login novamente...')
        
        const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signInWithPassword({
          email: 'admin@repovagas.com',
          password: 'admin123'
        })
        
        if (retryAuthError) {
          console.error('❌ Erro ao fazer login após criação:', retryAuthError.message)
          return
        }
        
        console.log('✅ Login realizado com sucesso!')
      } else {
        console.log('✅ Login realizado com sucesso!')
      }
    } else {
      console.log('✅ Sessão ativa encontrada para:', session.user.email)
    }
    
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
    console.log('✅ Teste com autenticação concluído!')
    
  } catch (error) {
    console.error('💥 Erro geral no teste:', error)
  }
}

testWithAuth()
