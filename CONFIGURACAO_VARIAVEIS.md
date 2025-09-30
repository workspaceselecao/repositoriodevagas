# Configuração Resend - Variáveis de Ambiente

## 🔧 **Configuração Necessária**

### **1. Criar arquivo .env.local**
Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Resend API Key (OBRIGATÓRIO)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Domínio verificado no Resend (OPCIONAL)
RESEND_DOMAIN=repositoriodevagas.com
```

### **2. Obter API Key do Resend**
1. Acesse: https://resend.com
2. Crie uma conta gratuita
3. Vá em "API Keys"
4. Clique em "Create API Key"
5. Copie a chave gerada
6. Cole no arquivo `.env.local`

### **3. Configurar no Vercel (Produção)**
1. Acesse o dashboard do Vercel
2. Vá em "Settings" > "Environment Variables"
3. Adicione:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Deploy novamente

## 🧪 **Teste da Configuração**

### **Teste Local:**
```bash
# 1. Criar .env.local com RESEND_API_KEY
# 2. Rodar servidor
npm run dev

# 3. Testar em: http://localhost:3002/test-resend.html
```

### **Teste Produção:**
```bash
# 1. Configurar variável no Vercel
# 2. Deploy
# 3. Testar em: https://repositoriodevagas.vercel.app/test-resend.html
```

## 📊 **Verificação**

### **Logs Esperados:**
```
🚀 [Resend] Iniciando envio de email...
📧 [Resend] Dados do email: {...}
📤 [Resend] Enviando para: /api/send-email
📨 [Resend] Resposta: {...}
✅ [Resend] Email enviado com sucesso!
```

### **Erro Comum:**
```
❌ [Resend] Erro: API Key not found
```
**Solução**: Verificar se `RESEND_API_KEY` está configurada corretamente.

## 🔒 **Segurança**

- ✅ **Nunca** commite a API key no Git
- ✅ **Use** `.env.local` para desenvolvimento
- ✅ **Configure** variáveis no Vercel para produção
- ✅ **Mantenha** a API key privada

---

**✅ Configure a RESEND_API_KEY para usar o sistema!** 🚀
