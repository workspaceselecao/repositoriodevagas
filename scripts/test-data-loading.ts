// Script para testar o carregamento de dados da aplicação
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDataLoading() {
  console.log('🔍 Testando carregamento de dados da aplicação...')
  console.log('=' .repeat(50))
  
  try {
    // Testar carregamento de vagas
    console.log('🔄 Testando carregamento de vagas...')
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
    console.log('🔄 Testando carregamento de clientes...')
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
    console.log('🔄 Testando carregamento de sites...')
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
    
    // Testar carregamento de categorias
    console.log('🔄 Testando carregamento de categorias...')
    const { data: categoriasData, error: categoriasError } = await supabase
      .from('vagas')
      .select('categoria')
      .not('categoria', 'is', null)
      .order('categoria')
    
    if (categoriasError) {
      console.error('❌ Erro ao carregar categorias:', categoriasError)
    } else {
      const categorias = [...new Set(categoriasData?.map((item: any) => item.categoria).filter(Boolean) || [])] as string[]
      console.log(`✅ ${categorias.length} categorias únicas carregadas`)
    }
    
    // Testar carregamento de cargos
    console.log('🔄 Testando carregamento de cargos...')
    const { data: cargosData, error: cargosError } = await supabase
      .from('vagas')
      .select('cargo')
      .not('cargo', 'is', null)
      .order('cargo')
    
    if (cargosError) {
      console.error('❌ Erro ao carregar cargos:', cargosError)
    } else {
      const cargos = [...new Set(cargosData?.map((item: any) => item.cargo).filter(Boolean) || [])] as string[]
      console.log(`✅ ${cargos.length} cargos únicos carregados`)
    }
    
    // Testar carregamento de células
    console.log('🔄 Testando carregamento de células...')
    const { data: celulasData, error: celulasError } = await supabase
      .from('vagas')
      .select('celula')
      .not('celula', 'is', null)
      .order('celula')
    
    if (celulasError) {
      console.error('❌ Erro ao carregar células:', celulasError)
    } else {
      const celulas = [...new Set(celulasData?.map((item: any) => item.celula).filter(Boolean) || [])] as string[]
      console.log(`✅ ${celulas.length} células únicas carregadas`)
    }
    
    console.log('=' .repeat(50))
    console.log('✅ Teste de carregamento de dados concluído!')
    
  } catch (error) {
    console.error('💥 Erro geral no teste:', error)
  }
}

testDataLoading()
