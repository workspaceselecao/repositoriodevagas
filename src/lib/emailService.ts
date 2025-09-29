import emailjs from '@emailjs/browser'

export interface EmailConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

export interface ContactEmailData {
  nome: string
  email: string
  telefone?: string
  assunto: string
  mensagem: string
  destinatarios: string[]
}

// Função para inicializar EmailJS
export function initEmailJS(config: EmailConfig): void {
  emailjs.init(config.publicKey)
}

// Função para enviar email diretamente
export async function sendContactEmail(
  emailData: ContactEmailData,
  config: EmailConfig
): Promise<{ success: boolean; message: string }> {
  try {
    // Validar configuração
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      return {
        success: false,
        message: 'Configuração de email não encontrada. Entre em contato com o administrador.'
      }
    }

    // Inicializar EmailJS se ainda não foi inicializado
    initEmailJS(config)

    // Preparar dados do template
    const templateParams = {
      from_name: emailData.nome,
      from_email: emailData.email,
      phone: emailData.telefone || 'Não informado',
      subject: emailData.assunto,
      message: emailData.mensagem,
      to_email: emailData.destinatarios.join(', '), // Lista de destinatários
      reply_to: emailData.email
    }

    // Enviar email
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams
    )

    if (response.status === 200) {
      return {
        success: true,
        message: `Email enviado com sucesso para ${emailData.destinatarios.length} destinatário(s)!`
      }
    } else {
      return {
        success: false,
        message: 'Erro ao enviar email. Tente novamente.'
      }
    }
  } catch (error: any) {
    console.error('Erro ao enviar email:', error)
    
    // Tratar erros específicos
    if (error.text?.includes('Invalid email')) {
      return {
        success: false,
        message: 'Email inválido. Verifique o endereço de email.'
      }
    }
    
    if (error.text?.includes('Template not found')) {
      return {
        success: false,
        message: 'Template de email não encontrado. Entre em contato com o administrador.'
      }
    }

    return {
      success: false,
      message: `Erro ao enviar email: ${error.message || 'Erro desconhecido'}`
    }
  }
}

// Função para testar configuração de email
export async function testEmailConfig(config: EmailConfig): Promise<{ success: boolean; message: string }> {
  try {
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      return {
        success: false,
        message: 'Configuração incompleta'
      }
    }

    initEmailJS(config)

    // Enviar email de teste
    const testParams = {
      from_name: 'Sistema de Teste',
      from_email: 'teste@sistema.com',
      phone: 'Não informado',
      subject: 'Teste de Configuração',
      message: 'Este é um email de teste para verificar se a configuração está funcionando.',
      to_email: 'teste@exemplo.com',
      reply_to: 'teste@sistema.com'
    }

    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      testParams
    )

    return {
      success: response.status === 200,
      message: response.status === 200 ? 'Configuração válida!' : 'Erro na configuração'
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Erro no teste: ${error.message}`
    }
  }
}
