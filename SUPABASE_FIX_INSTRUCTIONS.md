# 🔧 CORREÇÃO DOS ERROS DO SUPABASE - INSTRUÇÕES FINAIS

## ⚠️ **PROBLEMA CRÍTICO IDENTIFICADO**

As políticas RLS (Row Level Security) da tabela `vagas` não estão funcionando corretamente. As operações INSERT, UPDATE e DELETE não estão protegidas por segurança.

## 🎯 **SOLUÇÃO NECESSÁRIA**

### **Passo 1: Acessar o Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard
2. Faça login com suas credenciais
3. Selecione o projeto: `mywaoaofatgwbbtyqfpd`

### **Passo 2: Ir para o SQL Editor**

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### **Passo 3: Executar o SQL de Correção**

Cole e execute o seguinte SQL:

```sql
-- CORREÇÃO DAS POLÍTICAS RLS DA TABELA VAGAS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Habilitar RLS na tabela vagas
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes problemáticas
DROP POLICY IF EXISTS "Admins have full control over vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;
DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;
DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;
DROP POLICY IF EXISTS "RH can manage vagas" ON vagas;
DROP POLICY IF EXISTS "Users can view vagas" ON vagas;
DROP POLICY IF EXISTS "Anyone can view vagas" ON vagas;
DROP POLICY IF EXISTS "Authenticated users can insert vagas" ON vagas;
DROP POLICY IF EXISTS "Authenticated users can update vagas" ON vagas;
DROP POLICY IF EXISTS "Only admins can delete vagas" ON vagas;

-- 3. Criar políticas RLS corretas

-- Política para SELECT (todos podem ver vagas)
CREATE POLICY "vagas_select_policy" ON vagas
  FOR SELECT USING (true);

-- Política para INSERT (apenas usuários autenticados com role ADMIN ou RH)
CREATE POLICY "vagas_insert_policy" ON vagas
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('ADMIN', 'RH')
      )
    )
  );

-- Política para UPDATE (apenas usuários autenticados com role ADMIN ou RH)
CREATE POLICY "vagas_update_policy" ON vagas
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('ADMIN', 'RH')
      )
    )
  );

-- Política para DELETE (apenas usuários com role ADMIN)
CREATE POLICY "vagas_delete_policy" ON vagas
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'ADMIN'
      )
    )
  );

-- 4. Verificar políticas criadas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'vagas'
ORDER BY policyname;
```

### **Passo 4: Verificar o Resultado**

Após executar o SQL, você deve ver 4 políticas criadas:
- `vagas_select_policy` (SELECT)
- `vagas_insert_policy` (INSERT)
- `vagas_update_policy` (UPDATE)
- `vagas_delete_policy` (DELETE)

### **Passo 5: Testar a Correção**

Execute o seguinte comando no terminal do projeto:

```bash
npm run diagnose-vagas-rls
```

**Resultado Esperado**:
- ✅ SELECT: Funcionando
- ✅ INSERT: Protegido por RLS
- ✅ UPDATE: Protegido por RLS
- ✅ DELETE: Protegido por RLS

## 📋 **CORREÇÕES JÁ IMPLEMENTADAS**

### ✅ **Problemas Resolvidos**:

1. **URLs Inconsistentes**
   - Corrigido scripts para usar URL correta
   - Removidas referências às URLs antigas

2. **Dependências Desatualizadas**
   - @supabase/supabase-js atualizado para 2.75.1
   - Melhorias de compatibilidade

3. **Funcionalidades de Contato**
   - Links Teams corrigidos
   - Exclusão de emails funcionando
   - Logs detalhados implementados

4. **Conectividade**
   - Banco de dados funcionando perfeitamente
   - Todas as tabelas operacionais
   - 23 vagas carregadas com sucesso

## 🚨 **PROBLEMA CRÍTICO RESTANTE**

**Políticas RLS Inadequadas** - Este é o único problema que precisa ser corrigido manualmente no Supabase Dashboard.

## 📊 **STATUS ATUAL**

- ✅ **Supabase**: Funcionando perfeitamente
- ✅ **Conectividade**: OK
- ✅ **Dados**: Carregados corretamente
- ✅ **Funcionalidades**: Sistema de contatos funcionando
- ⚠️ **Segurança**: Necessita correção manual das políticas RLS

## 🎯 **PRÓXIMOS PASSOS**

1. **URGENTE**: Executar o SQL de correção no Supabase Dashboard
2. **Testar**: Verificar se as políticas foram aplicadas corretamente
3. **Monitorar**: Acompanhar logs de erro após a correção

## 📞 **SUPORTE**

Se houver problemas ao executar o SQL:
1. Verifique se você tem permissões de administrador no Supabase
2. Confirme se está no projeto correto (`mywaoaofatgwbbtyqfpd`)
3. Execute o SQL em partes menores se necessário

---
*Instruções geradas em: $(Get-Date)*
*Versão do sistema: 1.5.1*
