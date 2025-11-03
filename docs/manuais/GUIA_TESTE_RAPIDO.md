# Guia Rápido de Teste - Correção de Loops Infinitos

## ✅ Testes Essenciais

### 1. Teste de F5 (Refresh) - 2 minutos
**Problema anterior**: Loop infinito ao pressionar F5

**Como testar**:
1. Abra a aplicação: `npm run dev`
2. Faça login
3. Pressione F5 (ou Ctrl+R) 3-4 vezes seguidas
4. Verifique o console do navegador (F12)

**✅ Resultado esperado**:
- Aplicação recarrega normalmente
- Você vê no console: `[RefreshHandler] Lock de refresh criado`
- Não há carregamentos infinitos
- Dados aparecem corretamente

**❌ Problema se**:
- Console mostra múltiplos `[DataProvider] Carregando dados...` sem parar
- Página fica em branco ou loading infinito

---

### 2. Teste de Aplicação Aberta - 3 minutos
**Problema anterior**: Loop após ficar muito tempo aberta

**Como testar**:
1. Abra a aplicação e faça login
2. Deixe aberta por 3+ minutos
3. Observe o console a cada minuto

**✅ Resultado esperado**:
- Console mostra logs espaçados (não contínuos)
- Você vê: `[useAutoRefresh] Configurando auto-refresh com intervalo de 300s`
- A cada 5 minutos: `[useAutoRefresh] Refresh automático concluído`
- Aplicação continua responsiva

**❌ Problema se**:
- Logs de carregamento aparecem continuamente
- Aplicação trava ou fica lenta

---

### 3. Teste de Fechar/Reabrir - 1 minuto
**Solução nova**: Limpeza de cache ao fechar

**Como testar**:
1. Abra a aplicação e faça login
2. Navegue por algumas páginas
3. Feche COMPLETAMENTE o navegador (não apenas a aba)
4. Reabra o navegador e acesse a aplicação

**✅ Resultado esperado**:
- No console (ao fechar), você vê: `[useCleanup] Limpando recursos...`
- Ao reabrir, login funciona normalmente
- Não há dados cached problemáticos

---

### 4. Teste de Inatividade - 2 minutos
**Solução nova**: Refresh automático ao voltar

**Como testar**:
1. Abra a aplicação e faça login
2. Minimize o navegador ou mude de aba
3. Espere 2 minutos
4. Volte para a aplicação

**✅ Resultado esperado**:
- Console mostra: `[useCleanup] Página ficou invisível...`
- Ao voltar: `[useAutoRefresh] Página voltou a ficar visível, fazendo refresh...`
- Dados são recarregados automaticamente

---

## 🔍 Verificação Rápida no Console

Abra o Console do Navegador (F12) e procure por:

### ✅ Sinais de Funcionamento Normal:
```
[App] Aplicação inicializada com sucesso
[DataProvider] 152 vagas carregadas
[DataProvider] 12 clientes carregados
[DataProvider] ✅ Canal de vagas subscrito com sucesso
[useAutoRefresh] Configurando auto-refresh com intervalo de 300s
```

### ❌ Sinais de Problema:
```
LOOP INFINITO DETECTADO!
[DataProvider] Carregando dados... (aparecendo repetidamente)
CHANNEL_ERROR (aparecendo continuamente)
```

---

## 🚨 Teste de Detecção de Loop (Opcional)

**Para testar se a proteção funciona**:

1. Abra a aplicação
2. Pressione F5 rapidamente 6-7 vezes em menos de 30 segundos
3. Observe o que acontece

**✅ Resultado esperado**:
- Alert aparece: "Detectamos um problema com o carregamento da aplicação..."
- Console mostra: `[RefreshHandler] ⚠️ LOOP INFINITO DETECTADO!`
- Cache é limpo automaticamente

---

## 📊 Verificação de Performance

### Antes das Mudanças:
- ❌ 10+ requisições por segundo ao dar F5
- ❌ Memory leaks com listeners não removidos
- ❌ Cache crescendo indefinidamente

### Depois das Mudanças:
- ✅ 1-2 requisições normais ao dar F5
- ✅ Listeners limpos adequadamente
- ✅ Cache limpo ao fechar aplicação
- ✅ Auto-refresh controlado (a cada 5 minutos)

---

## 🐛 Se Encontrar Problemas

1. **Limpe o cache manualmente**:
   ```javascript
   // No console do navegador:
   sessionStorage.clear()
   localStorage.clear()
   ```

2. **Verifique as dependências**:
   ```bash
   npm install
   ```

3. **Veja os logs detalhados**:
   - Abra DevTools (F12)
   - Aba Console
   - Filtre por `[DataProvider]`, `[useAutoRefresh]`, ou `[RefreshHandler]`

4. **Reporte o problema** com:
   - Screenshot do console
   - Passos para reproduzir
   - Comportamento esperado vs obtido

---

## ✨ Melhorias Implementadas

| Problema | Solução | Arquivo |
|----------|---------|---------|
| Loop infinito no DataContext | Refs + limite de retries | `src/contexts/DataContext.tsx` |
| Cache não limpo | Sistema de limpeza automática | `src/hooks/useCleanup.ts` |
| Sem refresh automático | Hook de auto-refresh | `src/hooks/useAutoRefresh.ts` |
| Sem detecção de loops | Sistema de detecção | `src/lib/refresh-handler.ts` |
| F5 causando problemas | Lock de refresh | `src/lib/refresh-handler.ts` |

---

## 📝 Comandos Úteis

```bash
# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Próximos Passos

Após validar que tudo funciona:

1. ✅ Commit das mudanças
2. ✅ Deploy em ambiente de teste
3. ✅ Monitorar por 24h
4. ✅ Deploy em produção

---

**Estimativa de tempo total de testes**: ~10 minutos
**Prioridade**: 🔴 Alta - Testes críticos para estabilidade

