# Repositório de Vagas

Sistema de gerenciamento e comparação de vagas de emprego desenvolvido com **React + Vite**, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

- **Autenticação**: Sistema de login com roles (ADMIN e RH)
- **Dashboard**: Interface responsiva com sidebar expansível/contrátil
- **Lista de Clientes**: Visualização de todas as vagas com filtros e busca
- **Comparativo de Clientes**: Comparação de vagas entre diferentes clientes
- **Gerenciamento de Vagas**: Criação, edição e exclusão de vagas
- **Configurações**: Gerenciamento de usuários e backups (apenas ADMIN)
- **Exportação**: Download de dados em Excel
- **Backup**: Sistema de backup manual, automático e exportação

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **Linguagem**: TypeScript
- **UI Components**: shadcn/ui, Radix UI
- **Estilização**: Tailwind CSS
- **Roteamento**: React Router DOM
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: bcryptjs
- **Exportação**: XLSX

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd repositoriodevagas
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   VITE_SUPABASE_URL=https://rkcrazuegletgxoqflnc.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrY3JhenVlZ2xldGd4b3FmbG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1OTM5NjMsImV4cCI6MjA3NDE2OTk2M30.EV-UhjfAqY2ggLbA1fYaVHVr2hv3dK3NR8c3RQiV2xI
   ```

4. **Configure o banco de dados**
   
   Execute o SQL do arquivo `database/schema.sql` no seu projeto Supabase para criar as tabelas.

5. **Popule o banco com dados iniciais**
   ```bash
   npm run populate-db
   ```

6. **Execute o projeto**
   ```bash
   npm run dev
   ```

   Acesse: http://localhost:3000

## 👤 Credenciais de Acesso

**Administrador:**
- Email: roberio.gomes@atento.com
- Senha: admin123

## 📊 Estrutura do Banco de Dados

### Tabela `users`
- `id`: UUID (chave primária)
- `email`: VARCHAR (único)
- `password_hash`: VARCHAR
- `name`: VARCHAR
- `role`: ENUM ('ADMIN', 'RH')
- `created_at`, `updated_at`: TIMESTAMP

### Tabela `vagas`
- `id`: UUID (chave primária)
- `site`, `categoria`, `cargo`, `cliente`, `produto`: VARCHAR
- `descricao_vaga`, `responsabilidades_atribuicoes`, `requisitos_qualificacoes`: TEXT
- `salario`, `horario_trabalho`, `jornada_trabalho`: VARCHAR
- `beneficios`, `local_trabalho`, `etapas_processo`: TEXT
- `created_at`, `updated_at`: TIMESTAMP
- `created_by`, `updated_by`: UUID (referência para users)

### Tabela `backup_logs`
- `id`: UUID (chave primária)
- `backup_type`: ENUM ('manual', 'automatic', 'export')
- `backup_data`: JSONB
- `file_path`: VARCHAR
- `status`: ENUM ('success', 'failed', 'pending')
- `created_by`: UUID (referência para users)
- `created_at`: TIMESTAMP

## 🔐 Sistema de Permissões

### ADMIN
- Acesso total ao sistema
- Gerenciamento de usuários
- Configurações do sistema
- Backup e exportação
- Exclusão de vagas

### RH (Recursos Humanos)
- Visualização de vagas
- Criação e edição de vagas
- Comparativo de clientes
- Exportação de dados
- **Não tem acesso** às configurações

## 🎨 Design System

O projeto utiliza:
- **Paleta de cores**: Tons pastéis com combinação fluida
- **Componentes**: shadcn/ui para consistência
- **Layout**: Desktop-first com responsividade
- **Tipografia**: Inter font family
- **Ícones**: Lucide React

## 📱 Funcionalidades Principais

### Lista de Clientes (Homepage)
- Cards com informações das vagas
- Busca por cliente, cargo, site ou produto
- Estatísticas resumidas
- Botões de edição e exclusão
- Exportação para Excel

### Comparativo de Clientes
- Filtros avançados por múltiplos critérios
- Seleção de até 3 clientes para comparação
- Cards expansíveis com informações detalhadas
- Sincronização de expansão entre cards similares

### Configurações (ADMIN)
- Cadastro de novos usuários
- Sistema de backup (manual, automático, exportação)
- Histórico de backups
- Gerenciamento de permissões

## 🚀 Scripts Disponíveis

```bash
npm run dev          # Executar em modo desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build de produção
npm run lint         # Executar linter
npm run populate-db  # Popular banco com dados do JSON
```

## 📁 Estrutura do Projeto

```
├── public/              # Arquivos estáticos
├── src/                 # Código fonte
│   ├── components/      # Componentes React
│   │   ├── ui/         # Componentes shadcn/ui
│   │   └── ...         # Componentes customizados
│   ├── contexts/       # Contextos React
│   ├── lib/            # Utilitários e configurações
│   ├── types/          # Definições TypeScript
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Ponto de entrada
├── database/           # Schema SQL
├── scripts/            # Scripts de automação
└── index.html          # HTML principal
```

## 🔧 Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o SQL do arquivo `database/schema.sql`
3. Configure as variáveis de ambiente
4. Execute o script de população do banco

## 📝 Notas de Desenvolvimento

- O sistema foi desenvolvido seguindo princípios de escalabilidade e manutenibilidade
- Componentes são reutilizáveis e modulares
- Autenticação segura com hash de senhas
- RLS (Row Level Security) implementado no Supabase
- Sistema de backup robusto com múltiplos formatos

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

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.