import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkVagas() {
  try {
    console.log('🔍 Verificando vagas no banco de dados...')
    
    // Buscar todas as vagas
    const { data: vagas, error } = await supabase
      .from('vagas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Erro ao buscar vagas: ${error.message}`)
    }
    
    console.log(`\n📊 RESUMO GERAL:`)
    console.log(`✅ Total de vagas: ${vagas?.length || 0}`)
    
    if (vagas && vagas.length > 0) {
      // Estatísticas por cliente
      const clientes = new Map()
      const sites = new Map()
      const cargos = new Map()
      
      vagas.forEach(vaga => {
        clientes.set(vaga.cliente, (clientes.get(vaga.cliente) || 0) + 1)
        sites.set(vaga.site, (sites.get(vaga.site) || 0) + 1)
        cargos.set(vaga.cargo, (cargos.get(vaga.cargo) || 0) + 1)
      })
      
      console.log(`\n📈 ESTATÍSTICAS:`)
      console.log(`🏢 Sites únicos: ${sites.size}`)
      console.log(`👥 Clientes únicos: ${clientes.size}`)
      console.log(`💼 Cargos únicos: ${cargos.size}`)
      
      console.log(`\n🏢 VAGAS POR SITE:`)
      Array.from(sites.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([site, count]) => {
          console.log(`  ${site}: ${count} vagas`)
        })
      
      console.log(`\n👥 VAGAS POR CLIENTE:`)
      Array.from(clientes.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([cliente, count]) => {
          console.log(`  ${cliente}: ${count} vagas`)
        })
      
      console.log(`\n💼 VAGAS POR CARGO:`)
      Array.from(cargos.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([cargo, count]) => {
          console.log(`  ${cargo}: ${count} vagas`)
        })
      
      console.log(`\n📋 ÚLTIMAS 5 VAGAS INSERIDAS:`)
      vagas.slice(0, 5).forEach((vaga, index) => {
        console.log(`\n${index + 1}. ${vaga.cargo} - ${vaga.cliente}`)
        console.log(`   Site: ${vaga.site}`)
        console.log(`   Produto: ${vaga.produto}`)
        console.log(`   Salário: ${vaga.salario || 'Não informado'}`)
        console.log(`   Criado em: ${new Date(vaga.created_at).toLocaleString('pt-BR')}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar vagas:', error)
    process.exit(1)
  }
}

// Executar o script
checkVagas()
