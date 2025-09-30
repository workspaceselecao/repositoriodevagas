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
  console.log('🚀 [EmailJS] Iniciando envio de email...')
  console.log('📧 [EmailJS] Dados do email:', {
    nome: emailData.nome,
    email: emailData.email,
    assunto: emailData.assunto,
    destinatarios: emailData.destinatarios
  })
  console.log('⚙️ [EmailJS] Configuração:', {
    serviceId: config.serviceId,
    templateId: config.templateId,
    publicKey: config.publicKey ? `${config.publicKey.substring(0, 10)}...` : 'N/A'
  })

  try {
    // Validar configuração
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      console.error('❌ [EmailJS] Configuração incompleta:', {
        serviceId: !!config.serviceId,
        templateId: !!config.templateId,
        publicKey: !!config.publicKey
      })
      return {
        success: false,
        message: 'Configuração de email não encontrada. Entre em contato com o administrador.'
      }
    }

    console.log('✅ [EmailJS] Configuração válida, inicializando...')
    
    // Inicializar EmailJS se ainda não foi inicializado
    initEmailJS(config)
    console.log('🔧 [EmailJS] EmailJS inicializado')

    // IMPORTANTE: EmailJS não envia diretamente para destinatários externos
    // Ele envia para o email configurado no template do EmailJS
    // Para enviar para múltiplos destinatários, precisamos:
    // 1. Configurar o template no EmailJS para incluir os destinatários no corpo do email
    // 2. Ou enviar um email por destinatário (mais custoso)
    
    // Preparar dados do template
    const templateParams = {
      from_name: emailData.nome,
      from_email: emailData.email,
      phone: emailData.telefone || 'Não informado',
      subject: `[Contato - Repositório de Vagas] ${emailData.assunto}`,
      message: emailData.mensagem,
      // IMPORTANTE: to_email deve ser o email configurado no template do EmailJS
      // Os destinatários reais devem estar no corpo da mensagem
      to_email: 'roberio.gomes@atento.com', // Email configurado no template
      reply_to: emailData.email,
      // Adicionar destinatários no corpo da mensagem
      destinatarios: emailData.destinatarios.join(', '),
      destinatarios_count: emailData.destinatarios.length
    }

    console.log('📝 [EmailJS] Parâmetros do template:', templateParams)
    console.log('⚠️ [EmailJS] IMPORTANTE: Email será enviado para o email configurado no template do EmailJS')
    console.log('📧 [EmailJS] Destinatários reais serão incluídos no corpo do email:', emailData.destinatarios)

    // Enviar email
    console.log('📤 [EmailJS] Enviando email...')
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams
    )

    console.log('📨 [EmailJS] Resposta do EmailJS:', {
      status: response.status,
      text: response.text
    })

    if (response.status === 200) {
      console.log('✅ [EmailJS] Email enviado com sucesso!')
      return {
        success: true,
        message: `Email enviado com sucesso! Você receberá a mensagem na sua caixa de email configurada no EmailJS. Os destinatários (${emailData.destinatarios.join(', ')}) foram incluídos no corpo do email para você encaminhar.`
      }
    } else {
      console.error('❌ [EmailJS] Erro no status da resposta:', response.status)
      return {
        success: false,
        message: 'Erro ao enviar email. Tente novamente.'
      }
    }
  } catch (error: any) {
    console.error('💥 [EmailJS] Erro ao enviar email:', error)
    console.error('💥 [EmailJS] Detalhes do erro:', {
      message: error.message,
      text: error.text,
      status: error.status,
      statusText: error.statusText
    })
    
    // Tratar erros específicos
    if (error.text?.includes('Invalid email')) {
      console.error('❌ [EmailJS] Email inválido detectado')
      return {
        success: false,
        message: 'Email inválido. Verifique o endereço de email.'
      }
    }
    
    if (error.text?.includes('Template not found')) {
      console.error('❌ [EmailJS] Template não encontrado')
      return {
        success: false,
        message: 'Template de email não encontrado. Entre em contato com o administrador.'
      }
    }

    if (error.text?.includes('Service not found')) {
      console.error('❌ [EmailJS] Serviço não encontrado')
      return {
        success: false,
        message: 'Serviço de email não encontrado. Verifique a configuração.'
      }
    }

    if (error.text?.includes('Invalid public key')) {
      console.error('❌ [EmailJS] Chave pública inválida')
      return {
        success: false,
        message: 'Chave pública inválida. Verifique a configuração.'
      }
    }

    console.error('❌ [EmailJS] Erro não tratado:', error)
    return {
      success: false,
      message: `Erro ao enviar email: ${error.message || 'Erro desconhecido'}`
    }
  }
}

// Função para testar configuração de email
export async function testEmailConfig(config: EmailConfig): Promise<{ success: boolean; message: string }> {
  console.log('🧪 [EmailJS] Iniciando teste de configuração...')
  console.log('⚙️ [EmailJS] Configuração de teste:', {
    serviceId: config.serviceId,
    templateId: config.templateId,
    publicKey: config.publicKey ? `${config.publicKey.substring(0, 10)}...` : 'N/A'
  })

  try {
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      console.error('❌ [EmailJS] Configuração incompleta para teste')
      return {
        success: false,
        message: 'Configuração incompleta'
      }
    }

    console.log('✅ [EmailJS] Configuração válida para teste, inicializando...')
    initEmailJS(config)
    console.log('🔧 [EmailJS] EmailJS inicializado para teste')

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

    console.log('📝 [EmailJS] Parâmetros de teste:', testParams)
    console.log('📤 [EmailJS] Enviando email de teste...')

    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      testParams
    )

    console.log('📨 [EmailJS] Resposta do teste:', {
      status: response.status,
      text: response.text
    })

    const success = response.status === 200
    console.log(success ? '✅ [EmailJS] Teste bem-sucedido!' : '❌ [EmailJS] Teste falhou')

    return {
      success,
      message: success ? 'Configuração válida!' : 'Erro na configuração'
    }
  } catch (error: any) {
    console.error('💥 [EmailJS] Erro no teste:', error)
    console.error('💥 [EmailJS] Detalhes do erro no teste:', {
      message: error.message,
      text: error.text,
      status: error.status,
      statusText: error.statusText
    })
    
    return {
      success: false,
      message: `Erro no teste: ${error.message}`
    }
  }
}
