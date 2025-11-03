import { createClient } from '@supabase/supabase-js'
import vagasData from '../REPOSITORIO.json'

// Credenciais do Supabase - usando Service Key para ignorar RLS
const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

interface VagaFromJSON {
  SITE: string
  CATEGORIA: string
  CARGO: string
  CLIENTE: string
  PRODUTO: string
  'Descrição da vaga'?: string
  'Responsabilidades e atribuições'?: string
  'Requisitos e qualificações'?: string
  'Salário'?: string
  'Horário de Trabalho'?: string
  'Jornada de Trabalho'?: string
  'Benefícios'?: string
  'Local de Trabalho'?: string
  'Etapas do processo'?: string
}

async function insertMissingVagas() {
  try {
    console.log('🔄 Iniciando inserção das vagas faltantes...')

    // Buscar vagas existentes
    const { data: existingVagas, error: fetchError } = await supabase
      .from('vagas')
      .select('site, cargo, cliente, celula')

    if (fetchError) {
      console.error('❌ Erro ao buscar vagas existentes:', fetchError)
      return
    }

    console.log(`📊 Vagas existentes no banco: ${existingVagas?.length || 0}`)

    // Criar uma chave única para cada vaga (site + cargo + cliente + celula)
    const existingKeys = new Set(
      existingVagas?.map(v => `${v.site}|${v.cargo}|${v.cliente}|${v.celula}`) || []
    )

    // Transformar dados do JSON e filtrar duplicatas
    const vagasToInsert = vagasData
      .map((vaga: VagaFromJSON) => ({
        site: vaga.SITE,
        categoria: vaga.CATEGORIA,
        cargo: vaga.CARGO,
        cliente: vaga.CLIENTE,
        titulo: null,
        celula: vaga.PRODUTO,
        descricao_vaga: vaga['Descrição da vaga'] || null,
        responsabilidades_atribuicoes: vaga['Responsabilidades e atribuições'] || null,
        requisitos_qualificacoes: vaga['Requisitos e qualificações'] || null,
        salario: vaga['Salário'] || null,
        horario_trabalho: vaga['Horário de Trabalho'] || null,
        jornada_trabalho: vaga['Jornada de Trabalho'] || null,
        beneficios: vaga['Benefícios'] || null,
        local_trabalho: vaga['Local de Trabalho'] || null,
        etapas_processo: vaga['Etapas do processo'] || null,
        key: `${vaga.SITE}|${vaga.CARGO}|${vaga.CLIENTE}|${vaga.PRODUTO}`
      }))
      .filter(v => !existingKeys.has(v.key))

    console.log(`📝 Vagas para inserir: ${vagasToInsert.length}`)

    if (vagasToInsert.length === 0) {
      console.log('✅ Todas as vagas já estão no banco de dados!')
      return
    }

    // Mostrar quais serão inseridas
    vagasToInsert.forEach(v => {
      console.log(`  - ${v.site} | ${v.cargo} | ${v.cliente} | ${v.celula}`)
    })

    // Inserir vagas em lotes
    const batchSize = 10
    let totalInserted = 0
    
    for (let i = 0; i < vagasToInsert.length; i += batchSize) {
      const batch = vagasToInsert.slice(i, i + batchSize)
      const batchData = batch.map(({ key, ...rest }) => rest) // Remove a chave antes de inserir
      
      const { data, error } = await supabase
        .from('vagas')
        .insert(batchData)
        .select()

      if (error) {
        console.error(`❌ Erro ao inserir lote ${Math.floor(i / batchSize) + 1}:`, error)
        continue
      }

      totalInserted += data?.length || 0
      console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} inserido: ${data?.length || 0} vagas`)
    }

    console.log(`\n🎉 Inserção concluída! ${totalInserted} novas vagas adicionadas ao banco.`)

  } catch (error) {
    console.error('💥 Erro durante a inserção:', error)
  }
}

// Executar
insertMissingVagas()

