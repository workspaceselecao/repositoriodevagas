# 🚨 CORREÇÃO URGENTE: Vagas não aparecem na aplicação

## 🔴 Problema Identificado

As 26 vagas foram inseridas no banco de dados com sucesso, mas **NÃO aparecem na aplicação**.

**Causa Raiz:** A política RLS (Row Level Security) da tabela `vagas` está bloqueando a visualização porque exige autenticação, mas a aplicação tenta acessar os dados sem estar logada.

## ✅ Solução (Execute agora!)

### Opção 1: Execução via Supabase Dashboard (RECOMENDADO)

1. **Acesse o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/mywaoaofatgwbbtyqfpd
   - Faça login com suas credenciais

2. **Vá para o SQL Editor:**
   - No menu lateral, clique em **"SQL Editor"**
   - Clique em **"New query"** (botão verde no canto superior direito)

3. **Cole e Execute o seguinte SQL:**

```sql
-- ===========================================
-- CORREÇÃO CRÍTICA: PERMITIR VISUALIZAÇÃO DE VAGAS SEM AUTENTICAÇÃO
-- ===========================================

-- 1. Habilitar RLS na tabela vagas
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;

-- 2. Remover política de visualização existente (restringida)
DROP POLICY IF EXISTS "Authenticated users can view vagas" ON vagas;

-- 3. Criar política que PERMITE visualização para TODOS (autenticados e não-autenticados)
CREATE POLICY "Anyone can view vagas" ON vagas
  FOR SELECT USING (true);

-- 4. Verificar se a política foi criada corretamente
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies
WHERE tablename = 'vagas'
  AND cmd = 'SELECT';
```

4. **Clique em "Run" (ou pressione Ctrl+Enter)**

5. **Verifique o resultado:**
   - Você deve ver uma linha com `policyname = "Anyone can view vagas"`
   - E `qual = "true"`

### Opção 2: Via arquivo SQL local

Se preferir, o mesmo SQL está salvo em:
```
scripts/fix-rls-vagas-view-all.sql
```

## 🎯 O que este SQL faz?

1. **Habilita RLS** na tabela vagas (se já não estiver habilitada)
2. **Remove** a política antiga que exigia autenticação
3. **Cria** uma nova política que **permite TODOS** visualizarem vagas
4. **Verifica** se a política foi criada corretamente

## 🔍 Verificação

Após executar o SQL:

1. Volte para a aplicação
2. Recarregue a página (F5)
3. As **26 vagas** devem aparecer imediatamente

## 📋 Resumo da Situação

- ✅ 26 vagas estão no banco de dados
- ✅ Dados corretos e completos
- ❌ Política RLS bloqueava a visualização
- ✅ Após este SQL, tudo funcionará normalmente

## 🆘 Precisa de ajuda?

Se algo não funcionar:

1. Verifique se você está logado no Supabase Dashboard
2. Confirme que o projeto correto está selecionado: `mywaoaofatgwbbtyqfpd`
3. Verifique se o SQL foi executado sem erros
4. Recarregue a aplicação (Ctrl+F5 para limpar cache)

---

**Tempo estimado:** 2 minutos

**Resultado esperado:** 26 vagas visíveis na aplicação

