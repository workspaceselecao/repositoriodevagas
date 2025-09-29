import { supabase } from './supabase'

export interface ContactEmailConfig {
  id?: string
  email: string
  created_at?: string
  updated_at?: string
}

// Função para obter a configuração de email de contato
export async function getContactEmailConfig(): Promise<ContactEmailConfig | null> {
  try {
    const { data, error } = await supabase
      .from('contact_email_config')
      .select('*')
      .single()

    if (error) {
      console.error('Erro ao buscar configuração de email:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar configuração de email:', error)
    return null
  }
}

// Função para criar ou atualizar a configuração de email de contato
export async function setContactEmailConfig(email: string): Promise<ContactEmailConfig | null> {
  try {
    // Primeiro, verificar se já existe uma configuração
    const existingConfig = await getContactEmailConfig()
    
    if (existingConfig) {
      // Atualizar configuração existente
      const { data, error } = await supabase
        .from('contact_email_config')
        .update({ 
          email,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar configuração de email:', error)
        return null
      }

      return data
    } else {
      // Criar nova configuração
      const { data, error } = await supabase
        .from('contact_email_config')
        .insert({
          email,
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
    }
  } catch (error) {
    console.error('Erro ao definir configuração de email:', error)
    return null
  }
}

// Função para remover a configuração de email de contato
export async function removeContactEmailConfig(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contact_email_config')
      .delete()
      .neq('id', '') // Deletar todos os registros

    if (error) {
      console.error('Erro ao remover configuração de email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao remover configuração de email:', error)
    return false
  }
}
