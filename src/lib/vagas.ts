import { supabase } from './supabase'
import { Vaga, VagaFormData, VagaFilter } from '../types/database'

// Função para buscar todas as vagas
export async function getVagas(filter?: VagaFilter): Promise<Vaga[]> {
  try {
    let query = supabase
      .from('vagas')
      .select('*')
      .order('created_at', { ascending: false })

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
    const { data: vaga, error } = await supabase
      .from('vagas')
      .insert({
        ...vagaData,
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Disparar evento de atualização
    window.dispatchEvent(new CustomEvent('vaga-created', { detail: vaga }))

    return vaga
  } catch (error) {
    console.error('Erro ao criar vaga:', error)
    return null
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

// Função para buscar clientes únicos
export async function getClientes(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('cliente')
      .order('cliente')

    if (error) {
      throw new Error(error.message)
    }

    // Remover duplicatas e retornar array de strings
    const clientes = [...new Set(data?.map(item => item.cliente) || [])]
    return clientes
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return []
  }
}

// Função para buscar sites únicos
export async function getSites(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('site')
      .order('site')

    if (error) {
      throw new Error(error.message)
    }

    const sites = [...new Set(data?.map(item => item.site) || [])]
    return sites
  } catch (error) {
    console.error('Erro ao buscar sites:', error)
    return []
  }
}

// Função para buscar categorias únicas
export async function getCategorias(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('categoria')
      .order('categoria')

    if (error) {
      throw new Error(error.message)
    }

    const categorias = [...new Set(data?.map(item => item.categoria) || [])]
    return categorias
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return []
  }
}

// Função para buscar cargos únicos
export async function getCargos(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('cargo')
      .order('cargo')

    if (error) {
      throw new Error(error.message)
    }

    const cargos = [...new Set(data?.map(item => item.cargo) || [])]
    return cargos
  } catch (error) {
    console.error('Erro ao buscar cargos:', error)
    return []
  }
}

// Função para buscar células únicas
export async function getCelulas(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('celula')
      .order('celula')

    if (error) {
      throw new Error(error.message)
    }

    const celulas = [...new Set(data?.map(item => item.celula) || [])]
    return celulas
  } catch (error) {
    console.error('Erro ao buscar células:', error)
    return []
  }
}
