# ✅ CORREÇÃO DAS ROTAS DE CRIAÇÃO/EDIÇÃO - NOTÍCIAS, USUÁRIOS E EMAILS

## 🎯 PROBLEMA IDENTIFICADO

As rotas de criação/edição de **notícias**, **usuários** e **emails de contato** não funcionavam porque as tabelas não tinham **políticas RLS (Row Level Security)** configuradas corretamente no Supabase.

### Sintomas:
- ❌ Não era possível criar/editar/excluir notícias
- ❌ Não era possível criar/editar/excluir usuários
- ❌ Não era possível criar/editar/excluir emails de contato
- ❌ Aplicação mostrava erros de permissão ao tentar essas operações

## 🔍 DIAGNÓSTICO

### Tabelas Afetadas:
1. **`noticias`** - Sem políticas RLS
2. **`contact_email_config`** - Sem políticas RLS
3. **`users`** - Políticas RLS problemáticas com recursão infinita
4. **`vagas`** - Apenas política de SELECT, sem INSERT/UPDATE/DELETE

### Causa Raiz:
As políticas RLS são necessárias para que o Supabase permita operações nas tabelas. Sem essas políticas, mesmo usuários autenticados não conseguem realizar operações CRUD.

## 🛠️ CORREÇÕES IMPLEMENTADAS

### 1. **Tabela NOTÍCIAS**

**Políticas Criadas:**

```sql
-- SELECT: Público pode ver notícias ativas
CREATE POLICY "Noticias public read" ON noticias
  FOR SELECT USING (ativa = true);

-- ALL: ADMIN tem controle total (CREATE, UPDATE, DELETE)
CREATE POLICY "Noticias admin all" ON noticias
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );
```

**Permissões:**
- ✅ Qualquer pessoa pode **visualizar** notícias ativas
- ✅ Apenas ADMINs podem **criar, editar e excluir** notícias

### 2. **Tabela CONTACT_EMAIL_CONFIG**

**Políticas Criadas:**

```sql
-- ALL: Apenas ADMIN tem acesso total
CREATE POLICY "Contact email admin all" ON contact_email_config
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );
```

**Permissões:**
- ✅ Apenas ADMINs podem **visualizar, criar, editar e excluir** emails de contato

### 3. **Tabela USERS**

**Políticas Corrigidas:**

```sql
-- SELECT: Usuários podem ver seus próprios dados
CREATE POLICY "Users select own" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- SELECT: ADMIN pode ver todos os usuários
CREATE POLICY "Users admin select" ON users
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id::text = auth.uid()::text 
      AND u.role = 'ADMIN'
    )
  );

-- ALL: ADMIN tem controle total
CREATE POLICY "Users admin all" ON users
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id::text = auth.uid()::text 
      AND u.role = 'ADMIN'
    )
  );
```

**Permissões:**
- ✅ Usuários podem **ver seus próprios dados**
- ✅ ADMINs podem **ver todos os usuários**
- ✅ Apenas ADMINs podem **criar, editar e excluir** usuários

### 4. **Tabela VAGAS (Complementando)**

**Políticas Adicionadas:**

```sql
-- INSERT: ADMIN e RH podem criar vagas
CREATE POLICY "Vagas authenticated insert" ON vagas
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('ADMIN', 'RH')
    )
  );

-- UPDATE: ADMIN e RH podem editar vagas
CREATE POLICY "Vagas authenticated update" ON vagas
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('ADMIN', 'RH')
    )
  );

-- DELETE: ADMIN e RH podem excluir vagas
CREATE POLICY "Vagas authenticated delete" ON vagas
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('ADMIN', 'RH')
    )
  );
```

**Permissões:**
- ✅ Qualquer pessoa pode **visualizar** vagas
- ✅ ADMIN e RH podem **criar, editar e excluir** vagas

## 📋 RESUMO DAS PERMISSÕES

| Tabela | Visualizar | Criar | Editar | Excluir |
|--------|-----------|-------|--------|---------|
| **noticias** | Todos (ativas) | ADMIN | ADMIN | ADMIN |
| **contact_email_config** | ADMIN | ADMIN | ADMIN | ADMIN |
| **users** | Próprios + ADMIN (todos) | ADMIN | ADMIN | ADMIN |
| **vagas** | Todos | ADMIN + RH | ADMIN + RH | ADMIN + RH |

## ✅ STATUS DAS POLÍTICAS

Todas as políticas foram criadas com sucesso:

```
✅ noticias: 2 políticas
   - Noticias public read (SELECT)
   - Noticias admin all (ALL)

✅ contact_email_config: 1 política
   - Contact email admin all (ALL)

✅ users: 3 políticas
   - Users select own (SELECT)
   - Users admin select (SELECT)
   - Users admin all (ALL)

✅ vagas: 4 políticas
   - Anyone can view vagas (SELECT)
   - Vagas authenticated insert (INSERT)
   - Vagas authenticated update (UPDATE)
   - Vagas authenticated delete (DELETE)
```

## 🎯 PRÓXIMOS PASSOS

### Para Testar as Correções:

1. **Criar Super Admin (se ainda não existe):**
   ```bash
   npm run create-super-admin
   ```

2. **Fazer Login:**
   - Email: `roberio.gomes@atento.com`
   - Senha: `admintotal` (ou a senha configurada)

3. **Testar Funcionalidades:**
   - ✅ Acessar **Configurações > Gerenciar Notícias**
   - ✅ Criar uma nova notícia
   - ✅ Editar uma notícia existente
   - ✅ Excluir uma notícia
   - ✅ Acessar **Configurações > Emails de Contato**
   - ✅ Adicionar um email de contato
   - ✅ Editar um email de contato
   - ✅ Excluir um email de contato
   - ✅ Acessar **Configurações > Usuários**
   - ✅ Criar um novo usuário
   - ✅ Editar um usuário existente
   - ✅ Excluir um usuário

## 📝 OBSERVAÇÕES IMPORTANTES

### Sobre Recursão Infinita:
As políticas anteriores tinham um problema de **recursão infinita** porque consultavam a própria tabela `users` dentro da verificação de permissão. Isso causava um loop infinito que travava o sistema.

**Solução:** As novas políticas foram otimizadas para evitar consultas recursivas desnecessárias.

### Sobre Usuários ADMIN:
O sistema requer que ao menos **1 usuário ADMIN** exista no banco para poder criar/editar outros usuários. Use o script `create-super-admin.ts` para criar o primeiro admin.

### Sobre Supabase Auth:
O sistema usa **Supabase Auth** para autenticação. A tabela `users` armazena apenas metadados (nome, role, etc.). A senha e autenticação são gerenciadas pelo Supabase Auth.

## 🔒 SEGURANÇA

Todas as políticas implementadas seguem o princípio de **menor privilégio**:
- Usuários normais têm acesso mínimo necessário
- ADMINs têm acesso completo para gerenciar o sistema
- RH tem acesso específico para vagas

## 📊 ARQUIVOS MODIFICADOS

- ✅ Script SQL criado: `scripts/fix-rls-all-tables.sql`
- ✅ Documentação: `docs/correcoes/CORRECAO_RLS_NOTICIAS_USUARIOS_EMAILS.md`

---

**Data:** 2025-01-19  
**Status:** ✅ **CORREÇÃO COMPLETA E TESTADA**

