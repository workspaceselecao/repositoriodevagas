# 🚀 Roteiro de Implementação – Mitigação de Loop Infinito no F5

## 📌 Contexto
De acordo com o **PRD - Repositório de Vagas**, a aplicação roda com:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind + shadcn/ui  
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)  
- **Infra**: Vercel (deploy, CDN, SSL)  

Problema atual:  
➡️ Ao pressionar **F5**, a aplicação recarrega e entra em **loop infinito de requisições** no fluxo de login e dashboard.  

Objetivo deste roteiro:  
✅ Persistir sessão do usuário  
✅ Evitar múltiplos disparos de requisições  
✅ Garantir boot suave da aplicação  

---

## 🗂️ Arquitetura de Pastas (sugestão)

```plaintext
/src
 ├── context
 │    └── AuthContext.tsx
 ├── hooks
 │    └── useJobs.ts
 ├── lib
 │    └── supabaseClient.ts
 ├── pages
 │    ├── Dashboard.tsx
 │    └── Login.tsx
 ├── App.tsx
 └── main.tsx
```

---

## 1. 🔑 Configurar Supabase Client (persistência de sessão)

📌 Arquivo: `src/lib/supabaseClient.ts`

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // mantém sessão após refresh
    autoRefreshToken: true, // renova automaticamente
  },
});
```

---

## 2. 👤 Criar Contexto de Autenticação

📌 Arquivo: `src/context/AuthContext.tsx`

```tsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
      setLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

---

## 3. 📦 Hook de Vagas com Controle de Loop

📌 Arquivo: `src/hooks/useJobs.ts`

```tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchJobs() {
    if (loading) return; // evita loop
    setLoading(true);

    const { data, error } = await supabase.from("vagas").select("*");
    if (!error) setJobs(data || []);

    setLoading(false);
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  return { jobs, loading };
}
```

---

## 4. 🖥️ Proteção de Rotas no App

📌 Arquivo: `src/App.tsx`

```tsx
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function Routes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-center">Carregando...</div>;

  return user ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## 5. ⚡ (Opcional) React Query para Cache Inteligente

📌 Instalação:

```bash
npm install @tanstack/react-query
```

📌 Arquivo: `src/main.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

📌 Substituindo `useJobs.ts` por React Query:

```tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export function useJobs() {
  return useQuery(["jobs"], async () => {
    const { data, error } = await supabase.from("vagas").select("*");
    if (error) throw error;
    return data;
  });
}
```

---

## ✅ Checklist Final

- [x] Sessão persistente ativada no **Supabase Client**  
- [x] **AuthContext** garante restauração de usuário após F5  
- [x] **Hook de vagas** com flag anti-loop implementado  
- [x] Tela de **loading** no boot da aplicação  
- [x] (Opcional) **React Query** para cache e deduplicação  

---

🔥 Com isso, o **F5 não causa loop infinito** e o boot da aplicação fica estável e fluido.
