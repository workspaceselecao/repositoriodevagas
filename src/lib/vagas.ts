import { supabase } from './supabase'
import { Vaga, VagaFormData, VagaFilter } from '../types/database'
import { sessionCacheUtils } from './session-cache'

// Função otimizada para buscar todas as vagas com cache de sessão
export async function getVagas(filter?: VagaFilter): Promise<Vaga[]> {
  const cacheKey = sessionCacheUtils.generateKey('vagas', filter)
  
  return sessionCacheUtils.withBackgroundRefresh(
    cacheKey,
    async () => {
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
          throw new Error(error.message)
        }

        return vagas || []
      } catch (error) {
        console.error('Erro ao buscar vagas:', error)
        return []
      }
    },
    15 * 60 * 1000, // 15 minutos de cache
    0.7 // Refresh quando 70% do TTL passou
  )
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
  try {
    console.log('🔍 [createVaga] Iniciando criação de vaga')
    console.log('📊 [createVaga] Dados recebidos:', vagaData)
    console.log('👤 [createVaga] User ID:', userId)

    // Validar dados obrigatórios
    const requiredFields = ['site', 'categoria', 'cargo', 'cliente', 'celula']
    const missingFields = requiredFields.filter(field => !vagaData[field as keyof VagaFormData]?.trim())
    
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
    }

    const insertData = {
      ...vagaData,
      created_by: userId,
      updated_by: userId
    }

    console.log('💾 [createVaga] Dados para inserção:', insertData)
    console.log('🌐 [createVaga] Iniciando inserção no Supabase...')

    const startTime = Date.now()
    
    const { data: vaga, error } = await supabase
      .from('vagas')
      .insert(insertData)
      .select()
      .single()

    const endTime = Date.now()
    console.log(`⏱️ [createVaga] Operação concluída em ${endTime - startTime}ms`)

    if (error) {
      console.error('❌ [createVaga] Erro do Supabase:', error)
      console.error('❌ [createVaga] Código do erro:', error.code)
      console.error('❌ [createVaga] Detalhes do erro:', error.details)
      throw new Error(`Erro do banco de dados: ${error.message}`)
    }

    console.log('✅ [createVaga] Vaga criada com sucesso:', vaga)

    // Disparar evento de atualização
    window.dispatchEvent(new CustomEvent('vaga-created', { detail: vaga }))

    return vaga
  } catch (error) {
    console.error('💥 [createVaga] Erro geral:', error)
    throw error // Re-throw para que o componente possa tratar
  }
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
  try {
    const { error } = await supabase
      .from('vagas')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    return true
  } catch (error) {
    console.error('Erro ao excluir vaga:', error)
    return false
  }
}

// Função otimizada para buscar clientes únicos com cache de sessão
export async function getClientes(): Promise<string[]> {
  return sessionCacheUtils.withBackgroundRefresh(
    'clientes',
    async () => {
      try {
        const { data, error } = await supabase
          .from('vagas')
          .select('cliente')
          .not('cliente', 'is', null)
          .order('cliente')

        if (error) {
          throw new Error(error.message)
        }

        // Remover duplicatas e valores nulos de forma mais eficiente
        const clientes = [...new Set(data?.map((item: any) => item.cliente).filter(Boolean) || [])] as string[]
        return clientes
      } catch (error) {
        console.error('Erro ao buscar clientes:', error)
        return []
      }
    },
    20 * 60 * 1000, // 20 minutos de cache (clientes mudam menos)
    0.8 // Refresh quando 80% do TTL passou
  )
}

// Função otimizada para buscar sites únicos com cache de sessão
export async function getSites(): Promise<string[]> {
  return sessionCacheUtils.withBackgroundRefresh(
    'sites',
    async () => {
      try {
        const { data, error } = await supabase
          .from('vagas')
          .select('site')
          .not('site', 'is', null)
          .order('site')

        if (error) {
          throw new Error(error.message)
        }

        const sites = [...new Set(data?.map((item: any) => item.site).filter(Boolean) || [])] as string[]
        return sites
      } catch (error) {
        console.error('Erro ao buscar sites:', error)
        return []
      }
    },
    20 * 60 * 1000, // 20 minutos de cache
    0.8
  )
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
