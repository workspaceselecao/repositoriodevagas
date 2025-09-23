# 📋 Instruções de Execução - Repositório de Vagas (React + Vite)

## 🚀 Passos para Executar o Projeto

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Configuração do Banco de Dados (Supabase)

1. **Acesse o Supabase Dashboard**: https://supabase.com/dashboard
2. **Execute o SQL**: Copie e cole o conteúdo do arquivo `database/schema.sql` no SQL Editor do Supabase
3. **Execute a query** para criar todas as tabelas e configurações

### 3. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais fornecidas:

```env
VITE_SUPABASE_URL=https://rkcrazuegletgxoqflnc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrY3JhenVlZ2xldGd4b3FmbG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1OTM5NjMsImV4cCI6MjA3NDE2OTk2M30.EV-UhjfAqY2ggLbA1fYaVHVr2hv3dK3NR8c3RQiV2xI
```

### 4. População do Banco com Dados Iniciais

Execute o script para popular o banco com as vagas do arquivo JSON:

```bash
npm run populate-db
```

### 5. Executar o Projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

## 👤 Credenciais de Acesso

**Administrador (acesso total):**
- Email: `roberio.gomes@atento.com`
- Senha: `admin123`

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- Login com email e senha
- Roles: ADMIN e RH
- Proteção de rotas baseada em permissões

### ✅ Dashboard Responsivo
- Sidebar expansível/contrátil
- Navegação intuitiva com React Router
- Interface moderna com tons pastéis

### ✅ Lista de Clientes (Homepage)
- Cards com informações completas das vagas
- Busca por múltiplos critérios
- Estatísticas resumidas
- Botões de edição e exclusão
- Exportação para Excel

### ✅ Comparativo de Clientes
- Filtros avançados (Cliente, Site, Categoria, Cargo, Produto)
- Seleção de até 3 clientes para comparação
- Cards expansíveis organizados em 3 colunas
- Sincronização de expansão entre cards similares
- Funcionalidade de limpeza de filtros

### ✅ Gerenciamento de Vagas
- Formulário completo para criação de vagas
- Todos os campos editáveis conforme especificado
- Validação de dados

### ✅ Configurações (Apenas ADMIN)
- Cadastro de usuários (nome, email, senha provisória, role)
- Sistema de backup completo:
  - Backup manual com seleção de dados
  - Múltiplos formatos (Excel, JSON, CSV)
  - Histórico de backups

### ✅ Funcionalidades de Backup
- **Manual**: Usuário escolhe dados e formato
- **Automático**: Backup completo das vagas
- **Exportação**: Download direto em Excel
- Logs de todas as operações

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas:
1. **users** - Usuários do sistema (ADMIN/RH)
2. **vagas** - Todas as vagas com 13 campos conforme JSON
3. **backup_logs** - Logs de operações de backup

### Dados Populados:
- 1 usuário ADMIN padrão
- ~25 vagas do arquivo REPOSITORIO.json
- Todas as colunas mapeadas corretamente

## 🎨 Design e UX

- **Design System**: shadcn/ui com tons pastéis
- **Responsividade**: Desktop-first com adaptação mobile
- **Componentes**: Reutilizáveis e modulares
- **Animações**: Suaves e profissionais
- **Navegação**: Intuitiva com sidebar expansível

## 🔧 Comandos Úteis

```bash
npm run dev          # Desenvolvimento (Vite)
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Verificar código
npm run populate-db  # Popular banco
```

## 📊 Funcionalidades dos Cards Sincronizados

No Comparativo de Clientes:
- Quando um card específico (ex: "Descrição da Vaga") é expandido/contraído
- Todos os cards com o mesmo tipo nos outros clientes seguem a mesma ação
- Implementado com estado global de expansão
- Experiência fluida e intuitiva

## 🛡️ Segurança

- Autenticação com bcryptjs
- RLS (Row Level Security) no Supabase
- Proteção de rotas baseada em roles
- Validação de dados no frontend e backend

## 📱 Responsividade

- Layout otimizado para desktop
- Adaptação para tablets e mobile
- Sidebar colapsível para economizar espaço
- Cards responsivos com grid flexível

## 🌐 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Netlify
```bash
# Build do projeto
npm run build

# Upload da pasta dist/ para Netlify
```

### Outros
O projeto gera uma build estática na pasta `dist/` que pode ser hospedada em qualquer servidor web.

## 🔄 Principais Diferenças do Next.js

### Vantagens do React + Vite:
- **Performance**: Build mais rápido com Vite
- **Simplicidade**: Configuração mais simples
- **Bundle Size**: Menor tamanho do bundle final
- **Hot Reload**: Recarga instantânea em desenvolvimento
- **Flexibilidade**: Mais controle sobre a estrutura do projeto

### Mudanças Implementadas:
- ✅ Migração de Next.js para React + Vite
- ✅ Configuração de roteamento com React Router
- ✅ Ajuste das variáveis de ambiente (VITE_*)
- ✅ Reestruturação dos componentes
- ✅ Manutenção de toda funcionalidade original

O sistema está completamente funcional e pronto para uso! 🎉