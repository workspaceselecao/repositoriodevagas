// API endpoint para envio de emails via Resend
// Deploy: Vercel Functions

const { Resend } = require('resend')

// Inicializar Resend (você precisa da API key)
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { nome, email, telefone, assunto, mensagem, destinatarios } = req.body

    // Validação básica
    if (!nome || !email || !assunto || !mensagem) {
      return res.status(400).json({ 
        success: false, 
        message: 'Campos obrigatórios não preenchidos' 
      })
    }

    console.log('📧 [Resend] Enviando email para:', destinatarios)

    // Preparar dados do email
    const emailData = {
      from: 'Repositório de Vagas <noreply@repositoriodevagas.com>',
      to: destinatarios,
      replyTo: email,
      subject: `[Contato - Repositório de Vagas] ${assunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">📧 Nova Mensagem de Contato</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">👤 Dados do Usuário</h3>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
            <p><strong>Assunto:</strong> ${assunto}</p>
          </div>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">💬 Mensagem</h3>
            <p style="white-space: pre-wrap;">${mensagem}</p>
          </div>

          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #059669; margin-top: 0;">📋 Destinatários Configurados</h4>
            <p><strong>Total:</strong> ${destinatarios.length} destinatário(s)</p>
            <ul>
              ${destinatarios.map(dest => `<li>${dest}</li>`).join('')}
            </ul>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #d97706; margin-top: 0;">⚠️ Ação Necessária</h4>
            <p>Este email foi enviado automaticamente pelo sistema. Você pode responder diretamente para <strong>${email}</strong>.</p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            Enviado automaticamente pelo Repositório de Vagas<br>
            Data: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      `,
      text: `
Nova Mensagem de Contato - Repositório de Vagas

DADOS DO USUÁRIO:
Nome: ${nome}
Email: ${email}
Telefone: ${telefone || 'Não informado'}
Assunto: ${assunto}

MENSAGEM:
${mensagem}

DESTINATÁRIOS CONFIGURADOS:
${destinatarios.map(dest => `- ${dest}`).join('\n')}
Total: ${destinatarios.length} destinatário(s)

---
Enviado automaticamente pelo Repositório de Vagas
Data: ${new Date().toLocaleString('pt-BR')}
      `
    }

    // Enviar email via Resend
    const result = await resend.emails.send(emailData)

    console.log('✅ [Resend] Email enviado com sucesso:', result)

    return res.status(200).json({
      success: true,
      message: 'Email enviado com sucesso!',
      data: result
    })

  } catch (error) {
    console.error('❌ [Resend] Erro ao enviar email:', error)
    
    return res.status(500).json({
      success: false,
      message: `Erro ao enviar email: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
