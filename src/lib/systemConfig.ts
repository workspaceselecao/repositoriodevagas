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
      // Se a tabela não existe ou há erro de permissão, retornar valor padrão
      if (error.code === 'PGRST116' || error.message.includes('relation "system_config" does not exist')) {
        console.warn('Tabela system_config não existe. Retornando valor padrão.')
        return getDefaultConfigValue(key)
      }
      return null
    }

    return data?.config_value || null
  } catch (error) {
    console.error('Erro ao buscar configuração:', error)
    return getDefaultConfigValue(key)
  }
}

// Função para obter valores padrão quando a tabela não existe
function getDefaultConfigValue(key: string): string {
  const defaults: Record<string, string> = {
    'rh_nova_vaga_enabled': 'false',
    'rh_edit_enabled': 'false',
    'rh_delete_enabled': 'false'
  }
  return defaults[key] || 'false'
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
    // Primeiro, verificar se a configuração já existe
    const { data: existingData, error: selectError } = await supabase
      .from('system_config')
      .select('id')
      .eq('config_key', key)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Erro ao verificar configuração existente:', selectError)
    }

    let error;
    if (existingData) {
      // Se existe, fazer UPDATE
      const { error: updateError } = await supabase
        .from('system_config')
        .update({
          config_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('config_key', key)
      
      error = updateError;
    } else {
      // Se não existe, fazer INSERT
      const { error: insertError } = await supabase
        .from('system_config')
        .insert({
          config_key: key,
          config_value: value,
          updated_at: new Date().toISOString()
        })
      
      error = insertError;
    }

    if (error) {
      console.error('Erro ao atualizar configuração:', error)
      // Se a tabela não existe, mostrar mensagem específica
      if (error.code === 'PGRST116' || error.message.includes('relation "system_config" does not exist')) {
        console.error('ERRO: Tabela system_config não existe. Execute a migração do banco de dados primeiro.')
        throw new Error('Tabela system_config não existe. Execute a migração do banco de dados primeiro.')
      }
      throw new Error(`Erro ao atualizar configuração: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error)
    throw error
  }
}

// Função para criar configuração se não existir
export async function createSystemConfigIfNotExist(key: string, defaultValue: string, description?: string): Promise<boolean> {
  try {
    // Verificar se já existe
    const { data: existingData, error: selectError } = await supabase
      .from('system_config')
      .select('id')
      .eq('config_key', key)
      .single()

    // Se não existe erro de "não encontrado", significa que não existe
    if (selectError && selectError.code === 'PGRST116') {
      // Inserir nova configuração
      const { error: insertError } = await supabase
        .from('system_config')
        .insert({
          config_key: key,
          config_value: defaultValue,
          description: description || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Erro ao criar configuração:', insertError)
        return false
      }
      
      console.log(`Configuração ${key} criada com valor padrão: ${defaultValue}`)
      return true
    } else if (selectError) {
      console.error('Erro ao verificar configuração existente:', selectError)
      return false
    } else {
      // Já existe, não fazer nada
      console.log(`Configuração ${key} já existe`)
      return true
    }
  } catch (error) {
    console.error('Erro ao criar configuração:', error)
    return false
  }
}

// Função específica para verificar se RH pode acessar Nova Oportunidade
export async function isRHNovaVagaEnabled(): Promise<boolean> {
  const value = await getSystemConfig('rh_nova_vaga_enabled')
  return value === 'true'
}

// Função específica para verificar se RH pode editar vagas
export async function isRHEditEnabled(): Promise<boolean> {
  const value = await getSystemConfig('rh_edit_enabled')
  return value === 'true'
}

// Função específica para verificar se RH pode deletar vagas
export async function isRHDeleteEnabled(): Promise<boolean> {
  const value = await getSystemConfig('rh_delete_enabled')
  return value === 'true'
}

// Função para habilitar/desabilitar acesso RH à Nova Oportunidade
export async function setRHNovaVagaAccess(enabled: boolean): Promise<boolean> {
  return await updateSystemConfig('rh_nova_vaga_enabled', enabled.toString())
}

// Função para habilitar/desabilitar edição RH
export async function setRHEditAccess(enabled: boolean): Promise<boolean> {
  return await updateSystemConfig('rh_edit_enabled', enabled.toString())
}

// Função para habilitar/desabilitar exclusão RH
export async function setRHDeleteAccess(enabled: boolean): Promise<boolean> {
  return await updateSystemConfig('rh_delete_enabled', enabled.toString())
}
