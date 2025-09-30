// FormSubmit - Alternativa simples ao EmailJS
export interface ContactEmailData {
  nome: string
  email: string
  telefone?: string
  assunto: string
  mensagem: string
  destinatarios: string[]
}

// Função para enviar email via FormSubmit
export async function sendContactEmail(
  emailData: ContactEmailData
): Promise<{ success: boolean; message: string }> {
  console.log('🚀 [FormSubmit] Iniciando envio de email...')
  console.log('📧 [FormSubmit] Dados do email:', {
    nome: emailData.nome,
    email: emailData.email,
    assunto: emailData.assunto,
    destinatarios: emailData.destinatarios
  })

  try {
    // FormSubmit é muito mais simples - só precisa do endpoint
    const formSubmitUrl = 'https://formsubmit.co/roberio.gomes@atento.com'
    
    // Criar FormData para envio
    const formDataToSend = new FormData()
    formDataToSend.append('name', emailData.nome)
    formDataToSend.append('email', emailData.email)
    formDataToSend.append('phone', emailData.telefone || 'Não informado')
    formDataToSend.append('subject', emailData.assunto)
    formDataToSend.append('message', emailData.mensagem)
    formDataToSend.append('destinatarios', emailData.destinatarios.join(', '))
    formDataToSend.append('destinatarios_count', emailData.destinatarios.length.toString())
    
    // Adicionar informações extras do FormSubmit
    formDataToSend.append('_subject', `[Contato - Repositório de Vagas] ${emailData.assunto}`)
    formDataToSend.append('_next', window.location.origin + '/dashboard/contato?success=true')
    formDataToSend.append('_captcha', 'false') // Desabilitar captcha para facilitar
    formDataToSend.append('_template', 'table') // Usar template de tabela para melhor formatação

    console.log('📤 [FormSubmit] Enviando para:', formSubmitUrl)

    // Enviar via fetch
    const response = await fetch(formSubmitUrl, {
      method: 'POST',
      body: formDataToSend,
    })

    console.log('📨 [FormSubmit] Resposta:', response.status, response.statusText)

    if (response.ok) {
      console.log('✅ [FormSubmit] Email enviado com sucesso!')
      return {
        success: true,
        message: 'Email enviado com sucesso! Você será redirecionado para a página de confirmação.',
      }
    } else {
      throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`)
    }

  } catch (error: any) {
    console.error('❌ [FormSubmit] Erro ao enviar email:', error)
    return {
      success: false,
      message: `Erro ao enviar email: ${error.message || 'Erro desconhecido'}`,
    }
  }
}

// Função para testar FormSubmit
export async function testEmailConfig(): Promise<{ success: boolean; message: string }> {
  console.log('🧪 [FormSubmit] Iniciando teste...')
  
  try {
    const testData: ContactEmailData = {
      nome: 'Teste do Sistema',
      email: 'teste@sistema.com',
      telefone: '11999999999',
      assunto: 'Teste de configuração FormSubmit',
      mensagem: 'Este é um email de teste para verificar se o FormSubmit está funcionando corretamente.',
      destinatarios: ['roberio.gomes@atento.com']
    }

    console.log('📤 [FormSubmit] Enviando email de teste...')
    const result = await sendContactEmail(testData)
    
    console.log('🧪 [FormSubmit] Resultado do teste:', result)
    return result
  } catch (error: any) {
    console.error('❌ [FormSubmit] Erro no teste:', error)
    return {
      success: false,
      message: `Erro no teste: ${error.message || 'Erro desconhecido'}`,
    }
  }
}
