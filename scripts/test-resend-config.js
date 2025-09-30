#!/usr/bin/env node

/**
 * Script de Teste Resend
 * Verifica se a configuração está correta
 */

import { config } from 'dotenv'
import { Resend } from 'resend'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

async function testResendConfig() {
  console.log('🧪 Testando configuração do Resend...\n')

  // Verificar se a API key está configurada
  const apiKey = process.env.RESEND_API_KEY
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY não encontrada!')
    console.log('📝 Crie o arquivo .env.local com:')
    console.log('RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    process.exit(1)
  }

  if (!apiKey.startsWith('re_')) {
    console.error('❌ RESEND_API_KEY inválida!')
    console.log('📝 A chave deve começar com "re_"')
    process.exit(1)
  }

  console.log('✅ RESEND_API_KEY encontrada')

  try {
    // Testar conexão com Resend
    const resend = new Resend(apiKey)
    
    console.log('📤 Testando envio de email...')
    
    const result = await resend.emails.send({
      from: 'test@resend.dev',
      to: ['roberio.gomes@atento.com'],
      subject: 'Teste de Configuração Resend',
      html: `
        <h2>🧪 Teste de Configuração</h2>
        <p>Este é um email de teste para verificar se o Resend está funcionando corretamente.</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Sistema:</strong> Repositório de Vagas</p>
        <p><strong>Versão:</strong> 1.0.5</p>
      `
    })

    console.log('✅ Email enviado com sucesso!')
    console.log('📧 ID do email:', result.data?.id)
    console.log('📨 Verifique sua caixa de entrada em alguns segundos.\n')

    console.log('🎉 Configuração do Resend está funcionando!')
    console.log('📝 Próximos passos:')
    console.log('   1. Teste via interface: http://localhost:3002/dashboard/contato')
    console.log('   2. Teste via arquivo: http://localhost:3002/test-resend.html')
    console.log('   3. Configure no Vercel para produção')

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message)
    
    if (error.message.includes('API key')) {
      console.log('📝 Verifique se a API key está correta')
    } else if (error.message.includes('domain')) {
      console.log('📝 Configure um domínio verificado no Resend')
    }
    
    process.exit(1)
  }
}

// Executar teste
testResendConfig().catch(console.error)
