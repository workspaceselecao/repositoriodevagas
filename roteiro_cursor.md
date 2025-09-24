# 🚀 Roteiro Automático de Correção com Cursor

Este roteiro deve ser usado dentro do **Cursor** para automatizar a correção dos problemas de loop infinito, cache e atualização da aplicação.

---

## 1. Ajustar `useEffect` que causam loops
**Prompt para Cursor:**
```bash
Procure em todo o código React/Next.js por `useEffect` que não possuem array de dependências.
Se encontrar `useEffect(() => {...})` sem `[],` adicione `[]` no final para executar apenas uma vez.
Exemplo: 
ANTES:
useEffect(() => {
   fetchData();
});
DEPOIS:
useEffect(() => {
   fetchData();
}, []);
```

---

## 2. Garantir `isLoading` ou `hasFetched`
**Prompt para Cursor:**
```bash
Identifique chamadas assíncronas dentro de useEffect que atualizam state diretamente.
Crie uma flag de controle chamada `isMounted` ou `hasFetched` para impedir loops.

ANTES:
useEffect(() => {
   const load = async () => {
      const data = await fetchData();
      setState(data);
   };
   load();
});

DEPOIS:
useEffect(() => {
   let isMounted = true;
   const load = async () => {
      const data = await fetchData();
      if (isMounted) setState(data);
   };
   load();
   return () => { isMounted = false; };
}, []);
```

---

## 3. Configurar **cache-control** no `next.config.js`
**Prompt para Cursor:**
```bash
Abra o arquivo next.config.js e insira a seguinte configuração:

module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};
```

---

## 4. Forçar fetch sem cache (Supabase/Fetch API)
**Prompt para Cursor:**
```bash
Procure por todas as chamadas fetch ou Supabase que não possuem configuração de cache.
Adicione `cache: "no-store"` nas opções.

ANTES:
const res = await fetch("/api/data");

DEPOIS:
const res = await fetch("/api/data", { cache: "no-store" });
```

---

## 5. Corrigir Service Worker (se PWA ativo)
**Prompt para Cursor:**
```bash
Se houver service worker (service-worker.js ou sw.js), adicione:
self.addEventListener("install", event => {
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  clients.claim();
});
```
Isso garante que a versão nova substitua a antiga imediatamente.
```

---

## 6. Adicionar versão no frontend (opcional)
**Prompt para Cursor:**
```bash
Crie um arquivo src/version.js com:
export const APP_VERSION = "1.0.0";

Importe esse valor no layout principal e exiba no rodapé.
Depois, implemente uma checagem para comparar a versão atual com a versão mais recente no servidor.
Se houver diferença, force reload automático com `window.location.reload(true)`.
```

---

## ✅ Resultado esperado
- Sem loops infinitos (efeitos corrigidos).  
- Sem cache velho (CDN da Vercel + navegador sempre puxando versão nova).  
- Atualização automática quando houver nova versão.  
