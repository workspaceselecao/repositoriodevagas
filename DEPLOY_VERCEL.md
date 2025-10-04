# 🚀 Deploy na Vercel - Repositório de Vagas

## 📋 Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Vercel CLI instalada**: `npm install -g vercel`
3. **Projeto configurado**: Supabase configurado

## 🔧 Passos para Deploy

### 1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

### 2. **Login na Vercel**
```bash
vercel login
```

### 3. **Configurar Variáveis de Ambiente**

No dashboard da Vercel, vá em **Settings > Environment Variables** e adicione:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://mywaoaofatgwbbtyqfpd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg

# Supabase Service Role Key
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImiYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U

# Bloqueio de carregamento (produção)
VITE_BLOCK_DB_LOADING=false

# URLs de redirecionamento (atualizar com seu domínio)
VITE_SUPABASE_REDIRECT_URL=https://your-app-name.vercel.app
VITE_SUPABASE_SITE_URL=https://your-app-name.vercel.app
```

### 4. **Deploy Inicial**
```bash
vercel
```

### 5. **Deploy de Produção**
```bash
vercel --prod
```

## ⚙️ Configuração Automática

O projeto já possui `vercel.json` configurado:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🔄 Deploy Automático

Após o primeiro deploy, a Vercel irá:
- ✅ Fazer deploy automático a cada push no `main`
- ✅ Fazer deploy de preview em outras branches
- ✅ Configurar HTTPS automaticamente
- ✅ Otimizar assets automaticamente

## 📱 PWA no Deploy

O projeto possui PWA configurado:
- ✅ Service Worker ativo
- ✅ Manifest configurado
- ✅ Ícones otimizados
- ✅ Cache inteligente

## 🔐 Configurações de Segurança

### **Super Admin Oculto**
- ✅ Usuário `robgomez.sir@live.com` será invisível
- ✅ Não aparecerá em listas, backups ou relatórios
- ✅ Apenas ele pode acessar `/admin/control-panel`

### **Variáveis Sensíveis**
- ✅ Service Key deve ser mantida em segredo
- ✅ URLs de redirecionamento devem ser atualizadas
- ✅ Bloqueio de dados deve ser `false` em produção

## 🧪 Teste Pós-Deploy

Após o deploy, teste:

1. **Acesso à aplicação**: Verificar se carrega corretamente
2. **Login**: Testar com usuários existentes
3. **Super Admin**: Criar usuário `robgomez.sir@live.com`
4. **Painel de Controle**: Acessar `/admin/control-panel`
5. **PWA**: Testar instalação no mobile
6. **Funcionalidades**: Testar todas as features

## 🔧 Comandos Úteis

```bash
# Ver status do deploy
vercel ls

# Ver logs
vercel logs

# Fazer deploy de desenvolvimento
vercel

# Fazer deploy de produção
vercel --prod

# Remover deploy
vercel rm <deployment-url>
```

## 📊 Monitoramento

A Vercel oferece:
- ✅ Analytics automático
- ✅ Logs de erro
- ✅ Métricas de performance
- ✅ Uptime monitoring

## 🚨 Troubleshooting

### **Erro de Build**
```bash
# Verificar se build funciona localmente
npm run build

# Verificar logs na Vercel
vercel logs
```

### **Erro de Variáveis de Ambiente**
- Verificar se todas as variáveis estão configuradas
- Verificar se os valores estão corretos
- Fazer redeploy após alterações

### **Erro de Supabase**
- Verificar se as chaves estão corretas
- Verificar se o projeto Supabase está ativo
- Verificar configurações de RLS

## 🎯 Próximos Passos

1. **Configurar domínio personalizado** (opcional)
2. **Configurar CI/CD** (automático com GitHub)
3. **Monitorar performance**
4. **Configurar backups automáticos**
5. **Implementar monitoring avançado**

## 📞 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Projeto**: Repositório de Vagas v1.0.6
