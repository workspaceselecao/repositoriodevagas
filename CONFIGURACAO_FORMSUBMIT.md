# 📧 Configuração FormSubmit - Sistema de Contato

## 🚀 **FormSubmit - Alternativa Simples ao EmailJS**

O FormSubmit é uma alternativa muito mais simples e eficiente ao EmailJS para envio de emails diretos do formulário de contato.

## ✅ **Vantagens do FormSubmit:**

- **🎯 Zero configuração**: Não precisa de Service ID, Template ID ou Public Key
- **⚡ Mais rápido**: Envio direto via HTTP POST
- **🔒 Mais seguro**: Não expõe chaves de API no frontend
- **💰 Gratuito**: 50 envios/mês no plano gratuito
- **🛠️ Mais simples**: Apenas uma URL endpoint

## 🔧 **Como Funciona:**

### **1. Endpoint Automático**
```
https://formsubmit.co/roberio.gomes@atento.com
```

### **2. Dados Enviados**
O formulário envia automaticamente:
- **Nome**: Nome do usuário
- **Email**: Email do usuário (para resposta)
- **Telefone**: Telefone (opcional)
- **Assunto**: Assunto da mensagem
- **Mensagem**: Conteúdo da mensagem
- **Destinatários**: Lista de emails configurados pelos admins
- **Contagem**: Quantidade de destinatários

### **3. Configurações Automáticas**
- **Subject**: `[Contato - Repositório de Vagas] {assunto}`
- **Template**: Tabela formatada para melhor visualização
- **Captcha**: Desabilitado para facilitar uso
- **Redirect**: Retorna para página de sucesso

## 📋 **Configuração no Sistema:**

### **1. Emails Destinatários**
Os administradores podem configurar múltiplos emails destinatários através de:
- **Página**: Configurações > Configuração Geral > Emails de Contato
- **Função**: Adicionar/editar/remover emails
- **Status**: Ativar/desativar emails

### **2. Envio Automático**
- **Usuário preenche**: Formulário de contato
- **Sistema envia**: Via FormSubmit para `roberio.gomes@atento.com`
- **Email inclui**: Todos os destinatários configurados no corpo da mensagem
- **Admin recebe**: Email com informações completas para encaminhar

## 🎯 **Fluxo de Funcionamento:**

```
1. Usuário preenche formulário
   ↓
2. Sistema valida dados
   ↓
3. Envia via FormSubmit para roberio.gomes@atento.com
   ↓
4. FormSubmit processa e envia email
   ↓
5. Admin recebe email com:
   - Dados do usuário
   - Mensagem completa
   - Lista de destinatários para encaminhar
   ↓
6. Admin encaminha para destinatários finais
```

## 📧 **Formato do Email Recebido:**

```
Assunto: [Contato - Repositório de Vagas] Dúvida sobre vagas

Nome: João Silva
Email: joao@exemplo.com
Telefone: (11) 99999-9999
Assunto: Dúvida sobre vagas

Mensagem:
Olá, gostaria de saber mais informações sobre...

Destinatários para Encaminhar:
roberio.gomes@atento.com, admin@empresa.com

Total: 2 destinatário(s)
```

## 🔧 **Configuração Técnica:**

### **Arquivo**: `src/lib/emailService.ts`
```typescript
export async function sendContactEmail(emailData: ContactEmailData) {
  const formSubmitUrl = 'https://formsubmit.co/roberio.gomes@atento.com'
  
  const formDataToSend = new FormData()
  formDataToSend.append('name', emailData.nome)
  formDataToSend.append('email', emailData.email)
  formDataToSend.append('phone', emailData.telefone || 'Não informado')
  formDataToSend.append('subject', emailData.assunto)
  formDataToSend.append('message', emailData.mensagem)
  formDataToSend.append('destinatarios', emailData.destinatarios.join(', '))
  formDataToSend.append('destinatarios_count', emailData.destinatarios.length.toString())
  
  // Configurações FormSubmit
  formDataToSend.append('_subject', `[Contato - Repositório de Vagas] ${emailData.assunto}`)
  formDataToSend.append('_next', window.location.origin + '/dashboard/contato?success=true')
  formDataToSend.append('_captcha', 'false')
  formDataToSend.append('_template', 'table')

  const response = await fetch(formSubmitUrl, {
    method: 'POST',
    body: formDataToSend,
  })

  return response.ok ? { success: true, message: 'Email enviado!' } : { success: false, message: 'Erro no envio' }
}
```

## 🧪 **Teste do Sistema:**

### **Função de Teste**
```typescript
export async function testEmailConfig() {
  const testData = {
    nome: 'Teste do Sistema',
    email: 'teste@sistema.com',
    telefone: '11999999999',
    assunto: 'Teste de configuração FormSubmit',
    mensagem: 'Este é um email de teste.',
    destinatarios: ['roberio.gomes@atento.com']
  }

  return await sendContactEmail(testData)
}
```

## 📊 **Monitoramento:**

### **Logs no Console**
- `🚀 [FormSubmit] Iniciando envio de email...`
- `📧 [FormSubmit] Dados do email: {...}`
- `📤 [FormSubmit] Enviando para: https://formsubmit.co/...`
- `📨 [FormSubmit] Resposta: 200 OK`
- `✅ [FormSubmit] Email enviado com sucesso!`

## 🔄 **Migração do EmailJS:**

### **Removido:**
- ❌ Configurações EmailJS (Service ID, Template ID, Public Key)
- ❌ Templates complexos
- ❌ Validações de configuração
- ❌ Interface de configuração EmailJS

### **Adicionado:**
- ✅ Envio direto via FormSubmit
- ✅ Configuração automática
- ✅ Logs detalhados
- ✅ Interface simplificada

## 🎉 **Resultado Final:**

- **🎯 Simplicidade**: Zero configuração necessária
- **⚡ Performance**: Envio mais rápido e confiável
- **🔒 Segurança**: Sem exposição de chaves de API
- **💰 Custo**: Gratuito até 50 envios/mês
- **🛠️ Manutenção**: Muito mais fácil de manter

## 📞 **Suporte:**

Se houver problemas com o FormSubmit:
1. Verificar logs no console do navegador
2. Testar com função `testEmailConfig()`
3. Verificar se o email `roberio.gomes@atento.com` está correto
4. Confirmar se os destinatários estão configurados corretamente

---

**✅ FormSubmit configurado e funcionando!** 🚀

