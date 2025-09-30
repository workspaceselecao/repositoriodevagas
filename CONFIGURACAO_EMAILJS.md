# 📧 Configuração do EmailJS - Guia Completo

## 🔍 **Como o EmailJS Funciona**

O EmailJS **NÃO envia emails diretamente para destinatários externos**. Ele funciona como um proxy:

1. **Recebe dados** do formulário da sua aplicação
2. **Envia para o email configurado** no template do EmailJS (seu email)
3. **Você recebe** na sua caixa de email (Gmail, Outlook, etc.)
4. **Você encaminha** para os destinatários finais

## ⚙️ **Configuração Necessária no EmailJS**

### **1. Template de Email**
No painel do EmailJS, configure o template com:

```
Assunto: {{subject}}

De: {{from_name}} ({{from_email}})
Telefone: {{phone}}

Mensagem:
{{message}}

---
DESTINATÁRIOS PARA ENCAMINHAR:
{{destinatarios}}

Total de destinatários: {{destinatarios_count}}
```

### **2. Configuração do Serviço**
- **Service ID**: `service_s11wbnf`
- **Template ID**: `template_jy5w2jr`
- **Public Key**: `kWj62IRZMn_r93G21`

### **3. Email de Destino**
Configure no EmailJS para enviar para: `roberio.gomes@atento.com`

## 🔄 **Fluxo de Funcionamento**

1. **Usuário preenche** o formulário de contato
2. **Sistema envia** via EmailJS para `roberio.gomes@atento.com`
3. **Você recebe** o email com os destinatários no corpo
4. **Você encaminha** para os destinatários reais

## 🛠️ **Alternativas para Envio Direto**

### **Opção 1: Servidor Backend (Recomendado)**
Criar um endpoint no backend que use SMTP para envio direto.

### **Opção 2: Serviços de Email Transacional**
- SendGrid
- Mailgun
- Amazon SES
- Resend

### **Opção 3: Configurar EmailJS para Múltiplos Destinatários**
Modificar o template para incluir BCC ou CC com os destinatários.

## 📋 **Checklist de Configuração**

- [ ] Template configurado no EmailJS
- [ ] Email de destino configurado
- [ ] Service ID, Template ID e Public Key corretos
- [ ] Template inclui variáveis: `{{destinatarios}}` e `{{destinatarios_count}}`
- [ ] Teste realizado e funcionando

## 🚨 **Limitações do EmailJS**

- **Não envia** para múltiplos destinatários externos
- **Limite** de 200 emails/mês (plano gratuito)
- **Depende** da configuração do template
- **Requer** encaminhamento manual

## 💡 **Recomendação**

Para um sistema profissional, considere implementar um backend com SMTP ou usar um serviço de email transacional como SendGrid ou Resend.
