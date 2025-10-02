import { supabase } from './supabase'

export interface SystemConfig {
  id: string
  config_key: string
  config_value: string
  description?: string
  created_at: string
  updated_at: string
}

// Função para obter uma configuração específica
export async function getSystemConfig(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('config_value')
      .eq('config_key', key)
      .single()

    if (error) {
      console.error('Erro ao buscar configuração:', error)
      return null
    }

    return data?.config_value || null
  } catch (error) {
    console.error('Erro ao buscar configuração:', error)
    return null
  }
}

// Função para obter todas as configurações
export async function getAllSystemConfigs(): Promise<SystemConfig[]> {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .order('config_key')

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return []
  }
}

// Função para atualizar uma configuração
export async function updateSystemConfig(key: string, value: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_config')
      .upsert({
        config_key: key,
        config_value: value,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Erro ao atualizar configuração:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error)
    return false
  }
}

// Função específica para verificar se RH pode acessar Nova Oportunidade
export async function isRHNovaVagaEnabled(): Promise<boolean> {
  const value = await getSystemConfig('rh_nova_vaga_enabled')
  return value === 'true'
}

// Função para habilitar/desabilitar acesso RH à Nova Oportunidade
export async function setRHNovaVagaAccess(enabled: boolean): Promise<boolean> {
  return await updateSystemConfig('rh_nova_vaga_enabled', enabled.toString())
}
