# Configuração do Supabase para Repositório de Vagas

## 📋 Passos para Configurar a Autenticação

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha:
   - **Name**: `repositorio-de-vagas`
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)

### 2. Obter Credenciais

Após criar o projeto, vá para **Settings** → **API**:

- **Project URL**: `https://mywaoaofatgwbbtyqfpd.supabase.co` ✅
- **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg` ✅
- **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U` ✅

### 3. Configurar Variáveis de Ambiente

#### Para Desenvolvimento Local (.env):
```env
VITE_SUPABASE_URL=https://mywaoaofatgwbbtyqfpd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U
```

#### Para Vercel (Environment Variables):
1. Acesse seu projeto no Vercel
2. Vá para **Settings** → **Environment Variables**
3. Adicione:
   - `VITE_SUPABASE_URL` = `https://mywaoaofatgwbbtyqfpd.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg`

### 4. Executar Schema do Banco

1. No Supabase, vá para **SQL Editor**
2. Copie todo o conteúdo de `database/schema.sql`
3. Cole e execute o script

### 5. Criar Usuário de Teste

Execute o script de criação de usuário:

```bash
# Instalar dependências se necessário
npm install dotenv

# Executar script
npx tsx scripts/create-test-user.ts
```

### 6. Configurar URLs de Redirecionamento

No Supabase, vá para **Authentication** → **URL Configuration**:

**Site URL**: `https://seu-dominio.vercel.app`

**Redirect URLs** (adicione todas):
- `https://seu-dominio.vercel.app/dashboard`
- `https://seu-dominio.vercel.app/login`
- `http://localhost:5173/dashboard` (para desenvolvimento)
- `http://localhost:5173/login` (para desenvolvimento)

### 7. Configurar Políticas de Segurança

As políticas RLS já estão configuradas no schema, mas verifique se estão ativas:

1. Vá para **Authentication** → **Policies**
2. Verifique se as políticas estão habilitadas para as tabelas:
   - `users`
   - `vagas`
   - `backup_logs`

## 🔧 Credenciais de Teste

Após executar o script de criação de usuário:

- **Email**: `roberio.gomes@atento.com`
- **Senha**: `admin123`
- **Role**: `ADMIN`

## 🚨 Troubleshooting

### Erro 500 no Login
- Verifique se as variáveis de ambiente estão configuradas corretamente
- Confirme se o projeto Supabase está ativo
- Verifique se as URLs de redirecionamento estão configuradas

### "Usuário não encontrado"
- Execute o script `create-test-user.ts`
- Verifique se o usuário existe tanto no Auth quanto na tabela `users`

### Problemas de CORS
- Adicione o domínio da Vercel nas URLs de redirecionamento
- Verifique se o Site URL está configurado corretamente

## 📝 Checklist de Configuração

- [ ] Projeto Supabase criado
- [ ] Credenciais obtidas (URL, anon key, service role key)
- [ ] Variáveis de ambiente configuradas
- [ ] Schema executado no banco
- [ ] Usuário de teste criado
- [ ] URLs de redirecionamento configuradas
- [ ] Políticas RLS verificadas
- [ ] Teste de login realizado com sucesso

## 🔗 Links Úteis

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Configuração de URLs](https://supabase.com/docs/guides/auth/url-configuration)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
