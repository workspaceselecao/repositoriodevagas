import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Configuração do Supabase
const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface VagaData {
  SITE: string
  CATEGORIA: string
  CARGO: string
  CLIENTE: string
  PRODUTO: string
  'Descrição da vaga'?: string
  'Responsabilidades e atribuições': string
  'Requisitos e qualificações': string
  'Salário'?: string
  'Horário de Trabalho'?: string
  'Jornada de Trabalho'?: string
  'Benefícios'?: string
  'Local de Trabalho'?: string
  'Etapas do processo'?: string
}

function truncateText(text: string | undefined, maxLength: number = 255): string | null {
  if (!text) return null
  return text.length > maxLength ? text.substring(0, maxLength) : text
}

function formatVagaForInsert(vaga: VagaData) {
  return {
    site: vaga.SITE,
    categoria: vaga.CATEGORIA,
    cargo: vaga.CARGO,
    cliente: vaga.CLIENTE,
    titulo: null, // Nova coluna - será preenchida posteriormente
    celula: vaga.PRODUTO, // Renomeado de produto para celula
    // Campos TEXT não devem ser truncados para preservar informações completas
    descricao_vaga: vaga['Descrição da vaga'] || null,
    responsabilidades_atribuicoes: vaga['Responsabilidades e atribuições'] || null,
    requisitos_qualificacoes: vaga['Requisitos e qualificações'] || null,
    beneficios: vaga['Benefícios'] || null,
    local_trabalho: vaga['Local de Trabalho'] || null,
    etapas_processo: vaga['Etapas do processo'] || null,
    // Campos VARCHAR podem ser truncados se necessário
    salario: truncateText(vaga['Salário']),
    horario_trabalho: truncateText(vaga['Horário de Trabalho']),
    jornada_trabalho: truncateText(vaga['Jornada de Trabalho']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

async function resetAndPopulateVagas() {
  try {
    console.log('🔄 Iniciando reset e população de vagas...')
    
    // 1. Verificar conectividade
    console.log('📡 Testando conectividade com Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('vagas')
      .select('count')
      .limit(1)
    
    if (testError) {
      throw new Error(`Erro de conectividade: ${testError.message}`)
    }
    console.log('✅ Conectividade confirmada')
    
    // 2. Ler arquivo REPOSITORIO.json
    console.log('📖 Lendo arquivo REPOSITORIO.json...')
    const jsonPath = path.join(process.cwd(), 'REPOSITORIO.json')
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error('Arquivo REPOSITORIO.json não encontrado')
    }
    
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
    const vagasData: VagaData[] = JSON.parse(jsonContent)
    
    console.log(`📊 Encontradas ${vagasData.length} vagas no arquivo`)
    
    // 3. Remover todas as vagas existentes
    console.log('🗑️ Removendo vagas existentes...')
    const { error: deleteError } = await supabase
      .from('vagas')
      .delete()
      .gte('created_at', '1900-01-01') // Remove todas as vagas usando uma condição que sempre será verdadeira
    
    if (deleteError) {
      throw new Error(`Erro ao remover vagas: ${deleteError.message}`)
    }
    console.log('✅ Vagas existentes removidas')
    
    // 4. Preparar dados para inserção
    console.log('🔄 Preparando dados para inserção...')
    const vagasToInsert = vagasData.map(formatVagaForInsert)
    
    // 5. Inserir vagas em lotes
    console.log('📝 Inserindo vagas em lotes...')
    const batchSize = 5
    let totalInserted = 0
    let totalErrors = 0
    
    for (let i = 0; i < vagasToInsert.length; i += batchSize) {
      const batch = vagasToInsert.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      
      console.log(`📦 Processando lote ${batchNumber} (${batch.length} vagas)...`)
      
      const { data, error } = await supabase
        .from('vagas')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`❌ Erro no lote ${batchNumber}:`, error.message)
        totalErrors++
        
        // Tentar inserir uma por uma para identificar problemas específicos
        for (const vaga of batch) {
          const { error: singleError } = await supabase
            .from('vagas')
            .insert([vaga])
          
          if (singleError) {
            console.error(`❌ Erro na vaga ${vaga.cargo} - ${vaga.cliente}:`, singleError.message)
          } else {
            totalInserted++
            console.log(`✅ Vaga ${vaga.cargo} - ${vaga.cliente} inserida com sucesso`)
          }
        }
      } else {
        totalInserted += batch.length
        console.log(`✅ Lote ${batchNumber} inserido com sucesso (${batch.length} vagas)`)
      }
    }
    
    // 6. Verificar resultado final
    console.log('📊 Verificando resultado final...')
    const { data: finalData, error: finalError } = await supabase
      .from('vagas')
      .select('*')
    
    if (finalError) {
      throw new Error(`Erro ao verificar resultado: ${finalError.message}`)
    }
    
    const totalVagas = finalData?.length || 0
    const clientesUnicos = new Set(finalData?.map(v => v.cliente) || []).size
    const sitesUnicos = new Set(finalData?.map(v => v.site) || []).size
    const categoriasUnicas = new Set(finalData?.map(v => v.categoria) || []).size
    
    console.log('\n🎉 RESULTADO FINAL:')
    console.log(`✅ Total de vagas inseridas: ${totalVagas}`)
    console.log(`📊 Total de clientes únicos: ${clientesUnicos}`)
    console.log(`🏢 Total de sites únicos: ${sitesUnicos}`)
    console.log(`📋 Total de categorias únicas: ${categoriasUnicas}`)
    console.log(`❌ Total de erros: ${totalErrors}`)
    
    if (totalVagas === vagasData.length) {
      console.log('🎯 Todas as vagas foram inseridas com sucesso!')
    } else {
      console.log(`⚠️ Apenas ${totalVagas} de ${vagasData.length} vagas foram inseridas`)
    }
    
  } catch (error) {
    console.error('❌ Erro durante o processo:', error)
    process.exit(1)
  }
}

// Executar o script
resetAndPopulateVagas()
