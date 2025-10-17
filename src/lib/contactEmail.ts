import { supabase } from './supabase'
import { ContactEmailConfig, ContactEmailFormData } from '../types/database'

// Função para obter todos os emails de contato ativos
export async function getContactEmailConfigs(): Promise<ContactEmailConfig[]> {
  try {
    const { data, error } = await supabase
      .from('contact_email_config')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar configurações de email:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar configurações de email:', error)
    return []
  }
}

// Função para obter todos os emails de contato (incluindo inativos) - apenas para admins
export async function getAllContactEmailConfigs(): Promise<ContactEmailConfig[]> {
  try {
    const { data, error } = await supabase
      .from('contact_email_config')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar todas as configurações de email:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar todas as configurações de email:', error)
    return []
  }
}

// Função para criar uma nova configuração de email de contato
export async function createContactEmailConfig(config: ContactEmailFormData): Promise<ContactEmailConfig | null> {
  try {
    const { data, error } = await supabase
      .from('contact_email_config')
      .insert({
        email: config.email,
        nome: config.nome || null,
        teams_contact: config.teams_contact || null,
        ativo: config.ativo !== false, // Padrão true
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar configuração de email:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao criar configuração de email:', error)
    return null
  }
}

// Função para atualizar uma configuração de email de contato
export async function updateContactEmailConfig(id: string, config: ContactEmailFormData): Promise<ContactEmailConfig | null> {
  try {
    const { data, error } = await supabase
      .from('contact_email_config')
      .update({
        email: config.email,
        nome: config.nome || null,
        teams_contact: config.teams_contact || null,
        ativo: config.ativo !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar configuração de email:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao atualizar configuração de email:', error)
    return null
  }
}

// Função para remover uma configuração de email de contato
export async function deleteContactEmailConfig(id: string): Promise<boolean> {
  try {
    console.log('🗑️ [ContactEmail] Iniciando exclusão do email com ID:', id)
    
    // Primeiro, verificar se o registro existe
    const { data: existingData, error: fetchError } = await supabase
      .from('contact_email_config')
      .select('id, email, nome')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('❌ [ContactEmail] Erro ao buscar registro para exclusão:', fetchError)
      throw new Error(`Registro não encontrado: ${fetchError.message}`)
    }

    if (!existingData) {
      console.error('❌ [ContactEmail] Registro não encontrado para exclusão')
      throw new Error('Registro não encontrado')
    }

    console.log('📋 [ContactEmail] Registro encontrado:', existingData)

    // Executar a exclusão
    const { error } = await supabase
      .from('contact_email_config')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ [ContactEmail] Erro ao executar exclusão:', error)
      throw new Error(`Erro ao excluir: ${error.message}`)
    }

    console.log('✅ [ContactEmail] Email excluído com sucesso:', existingData.email)
    return true
  } catch (error) {
    console.error('❌ [ContactEmail] Erro geral na exclusão:', error)
    throw error
  }
}

// Função para alternar status ativo/inativo de uma configuração
export async function toggleContactEmailConfigStatus(id: string): Promise<ContactEmailConfig | null> {
  try {
    // Primeiro buscar o status atual
    const { data: currentData, error: fetchError } = await supabase
      .from('contact_email_config')
      .select('ativo')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar status atual:', fetchError)
      return null
    }

    // Alternar o status
    const { data, error } = await supabase
      .from('contact_email_config')
      .update({
        ativo: !currentData.ativo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao alternar status:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao alternar status:', error)
    return null
  }
}

// Função para obter emails destinatários para envio (apenas ativos)
export async function getRecipientEmails(): Promise<string[]> {
  try {
    const configs = await getContactEmailConfigs()
    return configs.map(config => config.email)
  } catch (error) {
    console.error('Erro ao obter emails destinatários:', error)
    return ['roberio.gomes@atento.com'] // Fallback para email padrão
  }
}
