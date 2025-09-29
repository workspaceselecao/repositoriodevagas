import { supabase } from './supabase'
import { EmailJSConfig, EmailJSFormData } from '../types/database'

// Função para obter a configuração do EmailJS
export async function getEmailJSConfig(): Promise<EmailJSConfig | null> {
  try {
    const { data, error } = await supabase
      .from('emailjs_config')
      .select('*')
      .eq('ativo', true)
      .single()

    if (error) {
      console.error('Erro ao buscar configuração do EmailJS:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar configuração do EmailJS:', error)
    return null
  }
}

// Função para obter todas as configurações do EmailJS (incluindo inativas) - apenas para admins
export async function getAllEmailJSConfigs(): Promise<EmailJSConfig[]> {
  try {
    const { data, error } = await supabase
      .from('emailjs_config')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar todas as configurações do EmailJS:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar todas as configurações do EmailJS:', error)
    return []
  }
}

// Função para criar uma nova configuração do EmailJS
export async function createEmailJSConfig(config: EmailJSFormData): Promise<EmailJSConfig | null> {
  try {
    // Desativar outras configurações se esta for ativa
    if (config.ativo !== false) {
      await supabase
        .from('emailjs_config')
        .update({ ativo: false })
        .neq('id', '')
    }

    const { data, error } = await supabase
      .from('emailjs_config')
      .insert({
        service_id: config.service_id,
        template_id: config.template_id,
        public_key: config.public_key,
        ativo: config.ativo !== false, // Padrão true
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar configuração do EmailJS:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao criar configuração do EmailJS:', error)
    return null
  }
}

// Função para atualizar uma configuração do EmailJS
export async function updateEmailJSConfig(id: string, config: EmailJSFormData): Promise<EmailJSConfig | null> {
  try {
    // Se esta configuração for ativada, desativar outras
    if (config.ativo !== false) {
      await supabase
        .from('emailjs_config')
        .update({ ativo: false })
        .neq('id', id)
    }

    const { data, error } = await supabase
      .from('emailjs_config')
      .update({
        service_id: config.service_id,
        template_id: config.template_id,
        public_key: config.public_key,
        ativo: config.ativo !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar configuração do EmailJS:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao atualizar configuração do EmailJS:', error)
    return null
  }
}

// Função para remover uma configuração do EmailJS
export async function deleteEmailJSConfig(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('emailjs_config')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao remover configuração do EmailJS:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao remover configuração do EmailJS:', error)
    return false
  }
}

// Função para alternar status ativo/inativo de uma configuração
export async function toggleEmailJSConfigStatus(id: string): Promise<EmailJSConfig | null> {
  try {
    // Primeiro buscar o status atual
    const { data: currentData, error: fetchError } = await supabase
      .from('emailjs_config')
      .select('ativo')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar status atual:', fetchError)
      return null
    }

    // Se estiver ativando, desativar outras configurações
    if (!currentData.ativo) {
      await supabase
        .from('emailjs_config')
        .update({ ativo: false })
        .neq('id', id)
    }

    // Alternar o status
    const { data, error } = await supabase
      .from('emailjs_config')
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
