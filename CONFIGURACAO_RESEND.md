# Configuração Resend - Sistema de Email Profissional

## 🚀 **Resend - Solução Profissional**

O Resend é um serviço moderno de email transacional que oferece:
- ✅ **Entrega garantida** - Não vai para spam
- ⚡ **Instantâneo** - Entrega em segundos  
- 🔒 **Confiável** - Usado por empresas grandes
- 💰 **Gratuito** - 3.000 emails/mês
- 🛠️ **Simples** - API REST simples
- 📊 **Analytics** - Relatórios de entrega

## 🔧 **Configuração Necessária**

### **1. Criar conta no Resend**
1. Acesse: https://resend.com
2. Crie uma conta gratuita
3. Verifique seu email

### **2. Obter API Key**
1. No dashboard do Resend
2. Vá em "API Keys"
3. Clique em "Create API Key"
4. Copie a chave gerada

### **3. Configurar Variáveis de Ambiente**

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Resend API Key (OBRIGATÓRIO)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Domínio verificado (opcional)
RESEND_DOMAIN=repositoriodevagas.com
```

**IMPORTANTE**: 
- O arquivo `.env.local` não deve ser commitado no Git
- Para produção, configure a variável no Vercel

### **4. Verificar Domínio (Opcional)**
Para emails mais confiáveis, verifique um domínio:
1. No Resend, vá em "Domains"
2. Adicione seu domínio
3. Configure os registros DNS
4. Use o domínio verificado no código

## 📧 **Como Funciona**

### **Fluxo de Envio:**
```
1. Usuário preenche formulário
   ↓
2. Frontend envia dados para /api/send-email
   ↓
3. API processa e envia via Resend
   ↓
4. Resend entrega para destinatários
   ↓
5. Usuário recebe confirmação
```

### **Vantagens sobre FormSubmit/EmailJS:**
- **Entrega garantida** - Não depende de terceiros
- **Múltiplos destinatários** - Envia para todos de uma vez
- **Templates HTML** - Emails mais bonitos
- **Analytics** - Relatórios de entrega
- **API confiável** - Sempre funciona

## 🧪 **Teste do Sistema**

### **Teste via Arquivo HTML:**
1. Abra `test-resend.html` no navegador
2. Preencha o formulário de teste
3. Clique em "Enviar Teste"
4. Verifique os logs no console

### **Teste via Interface Principal:**
1. Acesse `/dashboard/contato`
2. Preencha o formulário de contato
3. Envie a mensagem
4. Verifique os logs no console

### **Teste Manual (Console):**
```javascript
// No console do navegador
import { testEmailConfig } from './src/lib/emailService.js'
testEmailConfig()
```

## 📊 **Monitoramento**

### **Logs no Console:**
```
🚀 [Resend] Iniciando envio de email...
📧 [Resend] Dados do email: {...}
📤 [Resend] Enviando para: /api/send-email
📨 [Resend] Resposta: {...}
✅ [Resend] Email enviado com sucesso!
```

### **Dashboard Resend:**
- Acesse o dashboard do Resend
- Veja estatísticas de envio
- Monitore entregas
- Configure webhooks

## 🔄 **Deploy**

### **Vercel (Recomendado):**
1. Conecte o repositório ao Vercel
2. Configure a variável `RESEND_API_KEY`
3. Deploy automático

### **Outros Provedores:**
- Netlify Functions
- Railway
- Render
- Heroku

## 🚨 **Troubleshooting**

### **Erro: "API Key not found"**
- Verifique se `RESEND_API_KEY` está configurada
- Confirme se a chave está correta

### **Erro: "Domain not verified"**
- Use domínio verificado no Resend
- Ou use domínio padrão do Resend

### **Emails não chegam:**
- Verifique pasta de spam
- Confirme se destinatários estão corretos
- Veja logs no dashboard do Resend

## 📈 **Próximos Passos**

1. **Configurar Resend** ✅
2. **Testar envio** ✅
3. **Deploy em produção** ⏳
4. **Monitorar entregas** ⏳
5. **Configurar webhooks** ⏳

---

**✅ Resend configurado e pronto para uso!** 🚀
