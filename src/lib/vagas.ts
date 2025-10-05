import { supabase, supabaseAdmin } from './supabase'
import { Vaga, VagaFormData, VagaFilter } from '../types/database'
import { assertWriteAllowed } from './admin-control'

// Função ROBUSTA para buscar vagas FORÇANDO refresh
export async function getVagasForceRefresh(filter?: VagaFilter): Promise<Vaga[]> {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [getVagasForceRefresh] Tentativa ${attempt}/${maxRetries} - Buscando vagas diretamente do DB...`)
      
      // SEMPRE usar cliente admin para evitar problemas de RLS
      let query = supabaseAdmin
        .from('vagas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      // Aplicar filtros se fornecidos
      if (filter?.cliente) {
        query = query.eq('cliente', filter.cliente)
      }
      if (filter?.site) {
        query = query.eq('site', filter.site)
      }
      if (filter?.categoria) {
        query = query.eq('categoria', filter.categoria)
      }
      if (filter?.cargo) {
        query = query.eq('cargo', filter.cargo)
      }
      if (filter?.celula) {
        query = query.eq('celula', filter.celula)
      }

      const { data: vagas, error } = await query

      if (error) {
        throw new Error(`Erro do Supabase: ${error.message} (Código: ${error.code})`)
      }

      if (!vagas || !Array.isArray(vagas)) {
        throw new Error('Dados inválidos retornados do servidor')
      }

      console.log(`✅ [getVagasForceRefresh] ${vagas.length} vagas carregadas com sucesso na tentativa ${attempt}`)
      return vagas

    } catch (error) {
      lastError = error as Error
      console.error(`❌ [getVagasForceRefresh] Tentativa ${attempt} falhou:`, error)
      
      if (attempt < maxRetries) {
        const delay = attempt * 1000 // Delay progressivo: 1s, 2s, 3s
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // Se todas as tentativas falharam, retornar array vazio em vez de lançar erro
  console.error('💥 [getVagasForceRefresh] Todas as tentativas falharam, retornando array vazio')
  console.error('💥 [getVagasForceRefresh] Último erro:', lastError)
  return []
}

// Função otimizada para buscar todas as vagas
export async function getVagas(filter?: VagaFilter): Promise<Vaga[]> {
  try {
        let query = supabase
          .from('vagas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000) // Limite para evitar queries muito grandes

        // Aplicar filtros se fornecidos
        if (filter?.cliente) {
          query = query.eq('cliente', filter.cliente)
        }
        if (filter?.site) {
          query = query.eq('site', filter.site)
        }
        if (filter?.categoria) {
          query = query.eq('categoria', filter.categoria)
        }
        if (filter?.cargo) {
          query = query.eq('cargo', filter.cargo)
        }
        if (filter?.celula) {
          query = query.eq('celula', filter.celula)
        }

        const { data: vagas, error } = await query

        if (error) {
          console.warn('⚠️ Erro com cliente normal, tentando com cliente admin:', error.message)
          
          // Se falhar com cliente normal, tentar com cliente admin
          let adminQuery = supabaseAdmin
            .from('vagas')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000)

          // Aplicar filtros se fornecidos
          if (filter?.cliente) {
            adminQuery = adminQuery.eq('cliente', filter.cliente)
          }
          if (filter?.site) {
            adminQuery = adminQuery.eq('site', filter.site)
          }
          if (filter?.categoria) {
            adminQuery = adminQuery.eq('categoria', filter.categoria)
          }
          if (filter?.cargo) {
            adminQuery = adminQuery.eq('cargo', filter.cargo)
          }
          if (filter?.celula) {
            adminQuery = adminQuery.eq('celula', filter.celula)
          }

          const { data: adminVagas, error: adminError } = await adminQuery

          if (adminError) {
            throw new Error(`Erro com cliente admin: ${adminError.message}`)
          }

          console.log(`✅ ${adminVagas?.length || 0} vagas carregadas com cliente admin`)
          return adminVagas || []
        }

        console.log(`✅ ${vagas?.length || 0} vagas carregadas com cliente normal`)
        return vagas || []
  } catch (error) {
    console.error('Erro ao buscar vagas:', error)
    return []
  }
}

// Função para buscar uma vaga por ID
export async function getVagaById(id: string): Promise<Vaga | null> {
  try {
    const { data: vaga, error } = await supabase
      .from('vagas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return vaga
  } catch (error) {
    console.error('Erro ao buscar vaga:', error)
    return null
  }
}

// Função para criar uma nova vaga
export async function createVaga(vagaData: VagaFormData, userId: string): Promise<Vaga | null> {
  // Verificar se o sistema está bloqueado (com timeout)
  try {
    await Promise.race([
      assertWriteAllowed(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na verificação de bloqueio')), 5000)
      )
    ])
  } catch (error) {
    console.warn('⚠️ [createVaga] Timeout na verificação de bloqueio, continuando...', error)
  }
  
  const maxRetries = 5
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 [createVaga] Tentativa ${attempt}/${maxRetries} - Iniciando criação de vaga`)
      console.log('📊 [createVaga] Dados recebidos:', vagaData)
      console.log('👤 [createVaga] User ID:', userId)

      // Validar dados obrigatórios
      const requiredFields = ['site', 'categoria', 'cargo', 'cliente', 'celula']
      const missingFields = requiredFields.filter(field => !vagaData[field as keyof VagaFormData]?.trim())
      
      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
      }

      // Truncar campos que podem ser muito longos para evitar erro de tamanho
      const truncatedData = {
        ...vagaData,
        site: vagaData.site?.substring(0, 255) || '',
        categoria: vagaData.categoria?.substring(0, 255) || '',
        cargo: vagaData.cargo?.substring(0, 255) || '',
        cliente: vagaData.cliente?.substring(0, 255) || '',
        titulo: vagaData.titulo?.substring(0, 255) || '',
        celula: vagaData.celula?.substring(0, 255) || '',
        salario: vagaData.salario?.substring(0, 255) || '',
        horario_trabalho: vagaData.horario_trabalho?.substring(0, 255) || '',
        jornada_trabalho: vagaData.jornada_trabalho?.substring(0, 255) || '',
        local_trabalho: vagaData.local_trabalho?.substring(0, 500) || '',
        // Campos de texto podem ser maiores
        descricao_vaga: vagaData.descricao_vaga?.substring(0, 5000) || '',
        responsabilidades_atribuicoes: vagaData.responsabilidades_atribuicoes?.substring(0, 5000) || '',
        requisitos_qualificacoes: vagaData.requisitos_qualificacoes?.substring(0, 5000) || '',
        beneficios: vagaData.beneficios?.substring(0, 3000) || '',
        etapas_processo: vagaData.etapas_processo?.substring(0, 3000) || ''
      }

      const insertData = {
        ...truncatedData,
        created_by: userId,
        updated_by: userId
      }

      console.log('💾 [createVaga] Dados para inserção (truncados):', insertData)
      console.log('🌐 [createVaga] Iniciando inserção no Supabase...')

      const startTime = Date.now()
      
      // Usar cliente admin com timeout para evitar problemas de RLS e timeout
      const { data: vaga, error } = await Promise.race([
        supabaseAdmin
          .from('vagas')
          .insert(insertData)
          .select()
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Operação demorou muito para responder')), 30000)
        )
      ]) as any

      const endTime = Date.now()
      console.log(`⏱️ [createVaga] Operação concluída em ${endTime - startTime}ms`)

      if (error) {
        console.error('❌ [createVaga] Erro do Supabase:', error)
        console.error('❌ [createVaga] Código do erro:', error.code)
        console.error('❌ [createVaga] Detalhes do erro:', error.details)
        
        // Se for erro de timeout, tentar novamente
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          if (attempt < maxRetries) {
            console.log(`🔄 [createVaga] Timeout detectado, tentando novamente (${attempt + 1}/${maxRetries})...`)
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)) // Delay progressivo maior
            continue
          }
        }
        
        // Se for erro de RLS, tentar com cliente normal
        if (error.message.includes('permission') || error.message.includes('policy') || error.code === '42501') {
          console.log('🔄 [createVaga] Erro de RLS detectado, tentando com cliente normal...')
          try {
            const { data: vagaNormal, error: errorNormal } = await Promise.race([
              supabase
                .from('vagas')
                .insert(insertData)
                .select()
                .single(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout: Operação demorou muito para responder')), 30000)
              )
            ]) as any
            
            if (!errorNormal && vagaNormal) {
              console.log('✅ [createVaga] Vaga criada com cliente normal:', vagaNormal)
              window.dispatchEvent(new CustomEvent('vaga-created', { detail: vagaNormal }))
              return vagaNormal
            }
          } catch (normalError) {
            console.warn('⚠️ [createVaga] Cliente normal também falhou:', normalError)
          }
        }
        
        throw new Error(`Erro do banco de dados: ${error.message}`)
      }

      console.log('✅ [createVaga] Vaga criada com sucesso:', vaga)

      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('vaga-created', { detail: vaga }))

      return vaga
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`💥 [createVaga] Erro na tentativa ${attempt}:`, error)
      
      // Se for erro de timeout, tentar novamente
      if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('Timeout'))) {
        if (attempt < maxRetries) {
          console.log(`🔄 [createVaga] Timeout detectado, tentando novamente (${attempt + 1}/${maxRetries})...`)
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)) // Delay progressivo maior
          continue
        }
      }
      
      // Se não for timeout ou já esgotou as tentativas, quebrar o loop
      break
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  console.error('💥 [createVaga] Todas as tentativas falharam. Último erro:', lastError)
  throw lastError || new Error('Erro desconhecido ao criar vaga')
}

// Função para atualizar lista de vagas
export async function refreshVagasList(): Promise<Vaga[]> {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    // Disparar evento de atualização
    window.dispatchEvent(new CustomEvent('vagas-updated', { detail: data || [] }))

    return data || []
  } catch (error) {
    console.error('Erro ao atualizar vagas:', error)
    return []
  }
}

// Função para atualizar uma vaga
export async function updateVaga(id: string, vagaData: Partial<VagaFormData>, userId: string): Promise<Vaga | null> {
  // Verificar se o sistema está bloqueado
  await assertWriteAllowed()
  
  try {
    const { data: vaga, error } = await supabase
      .from('vagas')
      .update({
        ...vagaData,
        updated_by: userId
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return vaga
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error)
    return null
  }
}

// Função para excluir uma vaga
export async function deleteVaga(id: string): Promise<boolean> {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🗑️ [deleteVaga] Tentativa ${attempt}/${maxRetries} - Excluindo vaga ${id}`)
      
      // Verificar se o sistema está bloqueado (com timeout)
      await Promise.race([
        assertWriteAllowed(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na verificação de bloqueio')), 5000)
        )
      ])
      
      // Usar cliente admin para evitar problemas de RLS
      const { error } = await supabaseAdmin
        .from('vagas')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }

      console.log(`✅ [deleteVaga] Vaga ${id} excluída com sucesso na tentativa ${attempt}`)
      return true
      
    } catch (error) {
      lastError = error as Error
      console.error(`❌ [deleteVaga] Tentativa ${attempt} falhou:`, error)
      
      if (attempt < maxRetries) {
        const delay = attempt * 1000 // Delay progressivo: 1s, 2s, 3s
        console.log(`🔄 [deleteVaga] Aguardando ${delay}ms antes da próxima tentativa...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // Se todas as tentativas falharam
  console.error('💥 [deleteVaga] Todas as tentativas falharam:', lastError)
  return false
}

// Função otimizada para buscar clientes únicos
export async function getClientes(): Promise<string[]> {
  try {
        const { data, error } = await supabase
          .from('vagas')
          .select('cliente')
          .not('cliente', 'is', null)
          .order('cliente')

        if (error) {
          console.warn('⚠️ Erro com cliente normal para clientes, tentando com cliente admin:', error.message)
          
          // Se falhar com cliente normal, tentar com cliente admin
          const { data: adminData, error: adminError } = await supabaseAdmin
            .from('vagas')
            .select('cliente')
            .not('cliente', 'is', null)
            .order('cliente')

          if (adminError) {
            throw new Error(`Erro com cliente admin: ${adminError.message}`)
          }

          const clientes = [...new Set(adminData?.map((item: any) => item.cliente).filter(Boolean) || [])] as string[]
          console.log(`✅ ${clientes.length} clientes carregados com cliente admin`)
          return clientes
        }

        // Remover duplicatas e valores nulos de forma mais eficiente
        const clientes = [...new Set(data?.map((item: any) => item.cliente).filter(Boolean) || [])] as string[]
        console.log(`✅ ${clientes.length} clientes carregados com cliente normal`)
        return clientes
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return []
  }
}

// Função otimizada para buscar sites únicos
export async function getSites(): Promise<string[]> {
  try {
        const { data, error } = await supabase
          .from('vagas')
          .select('site')
          .not('site', 'is', null)
          .order('site')

        if (error) {
          console.warn('⚠️ Erro com cliente normal para sites, tentando com cliente admin:', error.message)
          
          // Se falhar com cliente normal, tentar com cliente admin
          const { data: adminData, error: adminError } = await supabaseAdmin
            .from('vagas')
            .select('site')
            .not('site', 'is', null)
            .order('site')

          if (adminError) {
            throw new Error(`Erro com cliente admin: ${adminError.message}`)
          }

          const sites = [...new Set(adminData?.map((item: any) => item.site).filter(Boolean) || [])] as string[]
          console.log(`✅ ${sites.length} sites carregados com cliente admin`)
          return sites
        }

        const sites = [...new Set(data?.map((item: any) => item.site).filter(Boolean) || [])] as string[]
        console.log(`✅ ${sites.length} sites carregados com cliente normal`)
        return sites
  } catch (error) {
    console.error('Erro ao buscar sites:', error)
    return []
  }
}

// Função otimizada para buscar categorias únicas
export async function getCategorias(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('categoria')
      .not('categoria', 'is', null)
      .order('categoria')

    if (error) {
      throw new Error(error.message)
    }

    const categorias = [...new Set(data?.map((item: any) => item.categoria).filter(Boolean) || [])] as string[]
    return categorias
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return []
  }
}

// Função otimizada para buscar cargos únicos
export async function getCargos(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('cargo')
      .not('cargo', 'is', null)
      .order('cargo')

    if (error) {
      throw new Error(error.message)
    }

    const cargos = [...new Set(data?.map((item: any) => item.cargo).filter(Boolean) || [])] as string[]
    return cargos
  } catch (error) {
    console.error('Erro ao buscar cargos:', error)
    return []
  }
}

// Função otimizada para buscar células únicas
export async function getCelulas(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('celula')
      .not('celula', 'is', null)
      .order('celula')

    if (error) {
      throw new Error(error.message)
    }

    const celulas = [...new Set(data?.map((item: any) => item.celula).filter(Boolean) || [])] as string[]
    return celulas
  } catch (error) {
    console.error('Erro ao buscar células:', error)
    return []
  }
}
