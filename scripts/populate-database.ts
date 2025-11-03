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

async function populateDatabase() {
  try {
    console.log('Iniciando população do banco de dados...')

    // Verificar se já existem dados
    const { data: existingVagas, error: checkError } = await supabase
      .from('vagas')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('Erro ao verificar dados existentes:', checkError)
      return
    }

    if (existingVagas && existingVagas.length > 0) {
      console.log('Banco de dados já contém vagas. Pulando população...')
      return
    }

    // Transformar dados do JSON para o formato do banco
    const vagasToInsert = vagasData.map((vaga: VagaFromJSON) => ({
      site: vaga.SITE,
      categoria: vaga.CATEGORIA,
      cargo: vaga.CARGO,
      cliente: vaga.CLIENTE,
      titulo: null, // Campo opcional
      celula: vaga.PRODUTO, // Mapeia PRODUTO para celula
      descricao_vaga: vaga['Descrição da vaga'] || null,
      responsabilidades_atribuicoes: vaga['Responsabilidades e atribuições'] || null,
      requisitos_qualificacoes: vaga['Requisitos e qualificações'] || null,
      salario: vaga['Salário'] || null,
      horario_trabalho: vaga['Horário de Trabalho'] || null,
      jornada_trabalho: vaga['Jornada de Trabalho'] || null,
      beneficios: vaga['Benefícios'] || null,
      local_trabalho: vaga['Local de Trabalho'] || null,
      etapas_processo: vaga['Etapas do processo'] || null
    }))

    // Inserir vagas em lotes
    const batchSize = 10
    for (let i = 0; i < vagasToInsert.length; i += batchSize) {
      const batch = vagasToInsert.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('vagas')
        .insert(batch)

      if (error) {
        console.error(`Erro ao inserir lote ${Math.floor(i / batchSize) + 1}:`, error)
        continue
      }

      console.log(`Lote ${Math.floor(i / batchSize) + 1} inserido com sucesso`)
    }

    console.log(`População concluída! ${vagasToInsert.length} vagas inseridas.`)

  } catch (error) {
    console.error('Erro durante a população do banco:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  populateDatabase()
}

export default populateDatabase
