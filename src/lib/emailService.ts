// Sistema Resend - Solução profissional de email
export interface ContactEmailData {
  nome: string
  email: string
  telefone?: string
  assunto: string
  mensagem: string
  destinatarios: string[]
}

// Configuração da API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://repositoriodevagas.vercel.app/api'
  : 'http://localhost:3001/api' // Servidor de teste local

// Função para enviar email via Resend (solução principal)
async function sendEmailViaResend(emailData: ContactEmailData): Promise<{ success: boolean; message: string }> {
  console.log('📧 [Resend] Tentando envio via Resend...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: emailData.nome,
        email: emailData.email,
        telefone: emailData.telefone,
        assunto: emailData.assunto,
        mensagem: emailData.mensagem,
        destinatarios: emailData.destinatarios
      })
    })

    console.log('📨 [Resend] Status da resposta:', response.status, response.statusText)
    
    // Verificar se a resposta é JSON válido
    let result
    try {
      const responseText = await response.text()
      console.log('📨 [Resend] Resposta bruta:', responseText.substring(0, 200) + '...')
      
      if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        result = JSON.parse(responseText)
      } else {
        throw new Error(`Resposta não é JSON válido: ${responseText.substring(0, 100)}`)
      }
    } catch (parseError) {
      console.error('❌ [Resend] Erro ao fazer parse da resposta:', parseError)
      throw new Error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`)
    }
    
    console.log('📨 [Resend] Resultado parseado:', result)

    if (response.ok && result.success) {
      console.log('✅ [Resend] Email enviado com sucesso!')
      return {
        success: true,
        message: 'Email enviado com sucesso! Você receberá uma confirmação em breve.',
      }
    } else {
      throw new Error(result.message || 'Erro desconhecido no Resend')
    }
  } catch (error: any) {
    console.error('❌ [Resend] Erro ao enviar email:', error)
    return {
      success: false,
      message: `Erro no Resend: ${error.message || 'Erro desconhecido'}`,
    }
  }
}

// Função principal para enviar email via Resend
export async function sendContactEmail(
  emailData: ContactEmailData
): Promise<{ success: boolean; message: string }> {
  console.log('🚀 [Resend] Iniciando envio de email...')
  console.log('📧 [Resend] Dados do email:', {
    nome: emailData.nome,
    email: emailData.email,
    assunto: emailData.assunto,
    destinatarios: emailData.destinatarios
  })

  // Usar Resend como solução principal
  return await sendEmailViaResend(emailData)
}

// Função para testar Resend
export async function testEmailConfig(): Promise<{ success: boolean; message: string }> {
  console.log('🧪 [Resend] Iniciando teste...')
  
  try {
    const testData: ContactEmailData = {
      nome: 'Teste do Sistema',
      email: 'teste@sistema.com',
      telefone: '11999999999',
      assunto: 'Teste de configuração Resend',
      mensagem: `Este é um email de teste para verificar se o Resend está funcionando corretamente.
      
Data do teste: ${new Date().toLocaleString('pt-BR')}
Sistema: Repositório de Vagas
Versão: 1.0.5`,
      destinatarios: ['roberio.gomes@atento.com']
    }

    console.log('📤 [Resend] Enviando email de teste...')
    const result = await sendContactEmail(testData)
    
    console.log('🧪 [Resend] Resultado do teste:', result)
    return result
  } catch (error: any) {
    console.error('❌ [Resend] Erro no teste:', error)
    return {
      success: false,
      message: `Erro no teste: ${error.message || 'Erro desconhecido'}`,
    }
  }
}

