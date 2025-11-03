import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Script para popular a tabela de vagas com dados do REPOSITORIO.json
async function populateVagas() {
  console.log('📋 Populando tabela de vagas...')
  console.log('=' .repeat(50))
  
  const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  
  try {
    // Ler arquivo JSON
    console.log('📖 Lendo arquivo REPOSITORIO.json...')
    const jsonPath = join(process.cwd(), 'REPOSITORIO.json')
    const jsonData = readFileSync(jsonPath, 'utf-8')
    const vagas = JSON.parse(jsonData)
    
    console.log(`📊 Encontradas ${vagas.length} vagas no arquivo`)
    
    // Verificar se já existem vagas
    const { data: existingVagas, error: checkError } = await supabase
      .from('vagas')
      .select('count')
      .limit(1)
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('⚠️ Erro ao verificar vagas existentes:', checkError.message)
    } else if (existingVagas) {
      console.log('⚠️ Já existem vagas na tabela. Deseja continuar? (y/n)')
      // Em um script automatizado, vamos continuar
    }
    
    // Preparar dados para inserção
    const vagasToInsert = vagas.map((vaga: any) => ({
      site: vaga.SITE || null,
      categoria: vaga.CATEGORIA || null,
      cargo: vaga.CARGO || null,
      cliente: vaga.CLIENTE || null,
      titulo: null, // Campo opcional
      celula: vaga.PRODUTO || null, // Mapeia PRODUTO para celula
      descricao_vaga: vaga['Descrição da vaga'] || null,
      responsabilidades_atribuicoes: vaga['Responsabilidades e atribuições'] || null,
      requisitos_qualificacoes: vaga['Requisitos e qualificações'] || null,
      salario: vaga.Salário || null,
      horario_trabalho: vaga['Horário de Trabalho'] || null,
      jornada_trabalho: vaga['Jornada de Trabalho'] || null,
      beneficios: vaga.Benefícios || null,
      local_trabalho: vaga['Local de Trabalho'] || null,
      etapas_processo: vaga['Etapas do processo'] || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    console.log('🔄 Inserindo vagas no banco de dados...')
    
    // Inserir em lotes de 5 para evitar timeout
    const batchSize = 5
    let insertedCount = 0
    
    for (let i = 0; i < vagasToInsert.length; i += batchSize) {
      const batch = vagasToInsert.slice(i, i + batchSize)
      
      console.log(`📝 Inserindo lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(vagasToInsert.length/batchSize)}...`)
      
      const { data, error } = await supabase
        .from('vagas')
        .insert(batch)
        .select()
      
      if (error) {
        console.log(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}:`, error.message)
        // Continuar com o próximo lote
        continue
      }
      
      insertedCount += data?.length || 0
      console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} inserido com sucesso (${data?.length || 0} vagas)`)
    }
    
    console.log('')
    console.log('🎉 População concluída!')
    console.log(`📊 Total de vagas inseridas: ${insertedCount}`)
    
    // Verificar resultado final
    const { data: finalCount, error: finalError } = await supabase
      .from('vagas')
      .select('count')
      .limit(1)
    
    if (!finalError) {
      console.log(`📈 Total de vagas na tabela: ${finalCount?.[0]?.count || 0}`)
    }
    
    // Estatísticas
    const { data: stats } = await supabase
      .from('vagas')
      .select('cliente, site, categoria')
    
    if (stats) {
      const clientes = [...new Set(stats.map(v => v.cliente))].length
      const sites = [...new Set(stats.map(v => v.site))].length
      const categorias = [...new Set(stats.map(v => v.categoria))].length
      
      console.log('')
      console.log('📊 Estatísticas:')
      console.log(`   Clientes únicos: ${clientes}`)
      console.log(`   Sites únicos: ${sites}`)
      console.log(`   Categorias únicas: ${categorias}`)
    }
    
  } catch (error) {
    console.log('❌ Erro ao popular vagas:', error.message)
    console.log('')
    console.log('💡 Solução alternativa:')
    console.log('1. Execute o arquivo SQL: scripts/insert-all-vagas.sql')
    console.log('2. No Supabase Dashboard, vá para SQL Editor')
    console.log('3. Cole e execute o conteúdo do arquivo')
  }
}

populateVagas()
