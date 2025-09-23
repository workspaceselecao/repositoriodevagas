# 🔧 Configuração Local - Repositório de Vagas

## ⚠️ IMPORTANTE: Segurança da Service Role Key

A service role key foi adicionada ao projeto, mas **NUNCA** deve ser commitada no git. Ela está protegida pelos seguintes mecanismos:

- ✅ Arquivo `.env` está no `.gitignore`
- ✅ Arquivo `.env.local` está no `.gitignore`
- ✅ Service role key está apenas no script `create-test-user.ts` (que não é executado em produção)

## 🚀 Configuração Rápida

### 1. Criar arquivo `.env` na raiz do projeto:

```bash
# Na raiz do projeto, crie o arquivo .env com:
VITE_SUPABASE_URL=https://mywaoaofatgwbbtyqfpd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U
```

### 2. Obter a chave anônima do Supabase:

1. Acesse: https://supabase.com/dashboard/project/mywaoaofatgwbbtyqfpd
2. Vá para **Settings** → **API**
3. Copie a **anon public** key
4. Substitua `sua_chave_anonima_aqui` no arquivo `.env`

### 3. Executar schema do banco:

1. No Supabase Dashboard, vá para **SQL Editor**
2. Copie todo o conteúdo de `database/schema.sql`
3. Cole e execute o script

### 4. Criar usuário de teste:

```bash
npm run create-user
```

### 5. Testar a aplicação:

```bash
npm run dev
```

## 🔐 Configuração para Vercel

### Environment Variables na Vercel:

1. Acesse seu projeto no Vercel
2. Vá para **Settings** → **Environment Variables**
3. Adicione:
   - `VITE_SUPABASE_URL` = `https://mywaoaofatgwbbtyqfpd.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `[sua_chave_anonima_do_supabase]`

**⚠️ NÃO adicione a service role key na Vercel** - ela só é necessária para scripts administrativos locais.

## 🎯 Credenciais de Teste

Após executar `npm run create-user`:

- **Email**: `roberio.gomes@atento.com`
- **Senha**: `admin123`
- **Role**: `ADMIN`

## 🚨 Troubleshooting

### Erro "Invalid API key"
- Verifique se a chave anônima está correta
- Confirme se o projeto Supabase está ativo

### Erro "User not found"
- Execute `npm run create-user` para criar o usuário de teste
- Verifique se o schema foi executado no banco

### Erro 500 no login
- Verifique se as variáveis de ambiente estão configuradas
- Confirme se as URLs de redirecionamento estão configuradas no Supabase

## 📝 Checklist Final

- [ ] Arquivo `.env` criado com as credenciais
- [ ] Chave anônima obtida do Supabase
- [ ] Schema executado no banco
- [ ] Usuário de teste criado (`npm run create-user`)
- [ ] URLs de redirecionamento configuradas no Supabase
- [ ] Teste de login realizado com sucesso
- [ ] Deploy na Vercel com environment variables configuradas
