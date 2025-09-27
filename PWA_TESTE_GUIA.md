# 🧪 Guia de Teste PWA - Repositório de Vagas

## ⚠️ **Por que o ícone de instalação pode não aparecer**

### 1. **Localhost vs HTTPS**
- **Localhost**: Chrome permite PWA em localhost, mas pode ter comportamento inconsistente
- **HTTPS**: Necessário em produção para PWA funcionar corretamente
- **Solução**: Teste em produção ou use ngrok para HTTPS local

### 2. **Critérios do Chrome para mostrar ícone de instalação**
O Chrome só mostra o ícone quando:
- ✅ Site é servido via HTTPS (ou localhost)
- ✅ Manifest válido e acessível
- ✅ Service Worker registrado
- ✅ Ícones de pelo menos 192x192 e 512x512
- ✅ `display: "standalone"` no manifest
- ✅ Usuário interagiu com o site (não é bot)

### 3. **Verificações necessárias**

#### A) **DevTools → Application → Manifest**
- Verificar se o manifest carrega sem erros
- Conferir se todos os ícones estão acessíveis
- Verificar se `display` está como `standalone`

#### B) **DevTools → Application → Service Workers**
- Verificar se o service worker está registrado
- Status deve ser "activated and running"

#### C) **DevTools → Console**
- Verificar se não há erros de JavaScript
- Procurar por logs do service worker

## 🔧 **Como testar corretamente**

### **Método 1: Local com Debug**
1. Execute: `npm run preview`
2. Acesse: `http://localhost:4173`
3. Abra DevTools (F12)
4. Vá em **Application** → **Manifest**
5. Verifique se não há erros vermelhos
6. Vá em **Application** → **Service Workers**
7. Verifique se está registrado e ativo
8. Use o botão **"PWA Debug"** no canto inferior direito

### **Método 2: Deploy em Produção**
1. Faça deploy no Vercel/Netlify
2. Acesse o site em produção (HTTPS)
3. O ícone deve aparecer automaticamente
4. Teste a instalação

### **Método 3: ngrok para HTTPS local**
```bash
# Instalar ngrok
npm install -g ngrok

# Em outro terminal, expor localhost
ngrok http 4173

# Usar a URL HTTPS fornecida pelo ngrok
```

## 🎯 **Testando funcionalidades PWA**

### **1. Prompt de Instalação Automático**
- Deve aparecer após 3 segundos no primeiro acesso
- Botão "Instalar" deve funcionar
- Botão "Agora não" deve ocultar permanentemente

### **2. Funcionamento Offline**
- Desconecte a internet
- O app deve continuar funcionando
- Indicador amarelo deve aparecer no topo

### **3. Atualizações**
- Faça uma mudança no código
- Rebuild: `npm run build`
- Deve aparecer prompt de atualização

### **4. Instalação Manual**
- Chrome: Menu ⋮ → "Instalar Repositório de Vagas"
- Edge: Menu ⋯ → "Aplicativos" → "Instalar este site como um aplicativo"

## 🐛 **Solução de Problemas**

### **Problema: Ícone não aparece**
**Soluções:**
1. Verificar se está em HTTPS (ou localhost)
2. Limpar cache do navegador (Ctrl+Shift+R)
3. Verificar manifest em DevTools
4. Confirmar service worker ativo

### **Problema: Prompt não aparece**
**Soluções:**
1. Verificar se já foi rejeitado antes (limpar localStorage)
2. Confirmar se não está instalado já
3. Verificar console para erros JavaScript

### **Problema: Instalação falha**
**Soluções:**
1. Verificar todos os ícones existem
2. Confirmar manifest válido
3. Verificar service worker funcionando

## 📱 **Teste em Diferentes Dispositivos**

### **Desktop (Windows/macOS)**
- Chrome: Ícone na barra de endereços
- Edge: Ícone na barra de endereços
- Firefox: Menu ⋮ → "Instalar"

### **Mobile (Android/iOS)**
- Android: Prompt automático ou menu "Adicionar à tela inicial"
- iOS: Safari → Compartilhar → "Adicionar à Tela Inicial"

## ✅ **Checklist de Verificação**

- [ ] Manifest carrega sem erros
- [ ] Service Worker registrado e ativo
- [ ] Ícones 192x192 e 512x512 existem
- [ ] `display: "standalone"` no manifest
- [ ] Site acessível via HTTPS
- [ ] Prompt de instalação aparece
- [ ] Instalação funciona corretamente
- [ ] App funciona offline
- [ ] Atualizações funcionam

## 🚀 **Próximos Passos**

1. **Teste em produção**: Deploy e teste completo
2. **Monitoramento**: Use Analytics para acompanhar instalações
3. **Otimização**: Ajuste estratégias de cache conforme necessário
4. **Feedback**: Colete feedback dos usuários sobre a experiência

---

**Status Atual**: ✅ PWA configurado corretamente
**Próximo Teste**: Deploy em produção para teste completo
