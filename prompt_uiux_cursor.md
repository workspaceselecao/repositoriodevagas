# 🎨 Prompt UI/UX Exclusivo para o Cursor

**Contexto:**  
Você é um **frontend designer premiado**, especialista em UI/UX, utilizando **React 18, Vite, TypeScript, Tailwind, shadcn/ui, Radix UI e Lucide React**.  
Seu objetivo é criar uma **aplicação web SPA** (Repositório de Vagas) com uma experiência **moderna, responsiva, acessível e visualmente impactante**, atendendo padrões **WCAG 2.1 AA**.  

---

## 🔑 Diretrizes Globais
- **Design System:**  
  - **Claro e Escuro** como temas principais.  
  - **Subtemas alternativos** (perfis de cor):  
    1. **Corporate** (azul + cinza, mais sério)  
    2. **Vibrant** (gradientes neon e contrastes ousados)  
    3. **Pastel Soft** (cores suaves, mais humanizado)  
    4. **Dark Glassmorphism** (fundo blur + transparências elegantes)  
    5. **Minimal White** (super clean, bordas sutis, quase “Apple-like”)  

- **Componentes base:** usar `shadcn/ui` e `Radix UI` com **animações suaves do framer-motion**.  
- **Interatividade:** sempre aplicar **hover states, active states e transitions de 150–250ms**.  
- **Ícones:** `lucide-react`, estilizados conforme tema ativo.  
- **Responsividade:** mobile-first, adaptando grid e cards fluidamente.  

---

## 📌 Telas e Experiência

### **1. Tela de Login**
- Layout centralizado, com **card de vidro (glassmorphism)**.  
- Input fields com **borda glow sutil no foco**.  
- Botão principal animado com gradiente fluido.  
- Opção “lembrar sessão” estilizada como toggle moderno.  
- Erros exibidos com microanimações (shake leve).  

### **2. Dashboard Principal**
- **Header fixo** com breadcrumbs e avatar do usuário.  
- **Sidebar expansível** com ícones + labels, animação smooth.  
- Cards principais: métricas em **3D hover effect** (leve).  
- **Mural de Notícias** com tabs coloridas (info, alerta, anúncio).  
- **Charts interativos** (recharts) minimalistas com tooltips suaves.  

### **3. Gestão de Vagas**
- Formulário dividido em **steps/tabs** com progress bar animada.  
- Validações em tempo real com feedback visual (verde/vermelho).  
- Visualização em **cards expansíveis**, responsivos.  
- Opção de **impressão** com CSS clean.  

### **4. Comparativo de Clientes**
- Layout em 3 colunas, responsivo.  
- Cards expansíveis com **sincronização animada**.  
- Scroll paralelo sincronizado.  
- Destaque de diferenças com **background animado (pulse suave)**.  

### **5. Lista de Clientes**
- Grid com **cards interativos**.  
- Hover com **elevação e sombra projetada**.  
- Paginação elegante com animações de entrada/saída.  
- Busca em tempo real com highlight em texto.  

### **6. Gestão de Usuários**
- Tabela interativa com sticky header.  
- Bulk actions exibidas em toolbar flutuante.  
- Status do usuário mostrado com badges coloridos + ícones.  

### **7. Sistema de Notícias**
- Editor rico dentro de modal clean.  
- Prioridades exibidas com **barras de cor lateral**.  
- Transição animada ao abrir/fechar notícias.  

---

## ✨ Microinterações e Detalhes
- Skeleton loaders em todos os carregamentos.  
- Empty states com ilustrações leves e texto simpático.  
- Toasters contextuais (shadcn/ui) com cores e ícones específicos.  
- Tooltips elegantes no hover de ícones.  
- Motion: fade + slide suave em navegação entre páginas.  

---

## 📂 Estrutura do Código
- Usar **layout components** (`<MainLayout>`, `<AuthLayout>`) para consistência.  
- Centralizar temas e perfis de cores em `theme.config.ts`.  
- Componentizar tudo: `CardMetric`, `ClientComparisonCard`, `JobFormStepper`.  
- Tipagem completa em TypeScript.  

---

👉 **Tarefa para o Cursor:**  
Gerar toda a interface com base nessas diretrizes, incluindo **componentes estilizados**, **temas principais e subtemas**, **responsividade total** e **microinterações visuais**.  
