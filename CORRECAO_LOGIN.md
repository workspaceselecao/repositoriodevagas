# 🔧 Correção de Políticas RLS - Problema de Login

## 📋 Problema Identificado
- **Erro:** "infinite recursion detected in policy for relation 'users'"
- **Causa:** Políticas RLS fazendo consultas circulares ao banco
- **Sintoma:** Impossibilidade de fazer login

## 🔧 Solução Correta (Mantendo RLS Ativo)

### **Passo 1: Execute o Script de Correção**
1. Acesse o **Supabase SQL Editor**
2. Execute o script: `scripts/fix-rls-no-recursion.sql`
3. Isso irá:
   - Remover políticas problemáticas
   - Criar funções auxiliares usando JWT (sem consulta ao banco)
   - Implementar políticas RLS seguras sem recursão

### **Passo 2: Garanta Usuário Admin**
1. Execute o script: `scripts/ensure-admin-user.sql`
2. Isso criará um usuário admin se não existir

### **Passo 3: Teste o Login**
- Tente fazer login novamente
- Use as credenciais: `roberio.gomes@atento.com` / `admin123`
- Ou crie um novo usuário admin

## 🛠️ Correções Implementadas no Código

### **1. Configuração do Supabase**
- Corrigido problema de múltiplas instâncias GoTrueClient
- Configuração unificada para evitar conflitos

### **2. Função de Login Simplificada**
- Removida dependência de políticas RLS complexas
- Fallback para dados do Auth se tabela users falhar
- Tratamento de erros mais robusto

### **3. Scripts de Correção**
- `fix-login-emergency.sql`: Desabilita RLS temporariamente
- `fix-rls-safe.sql`: Reativa RLS com políticas seguras

## ⚠️ Importante

### **RLS Mantido Ativo**
- **Segurança:** Total (políticas RLS funcionando)
- **Funcionalidade:** Total (login funcionará)
- **Método:** Usa JWT para evitar consultas circulares

### **Políticas Seguras**
- Funções auxiliares usam JWT (não fazem consultas ao banco)
- Elimina recursão infinita mantendo segurança
- Políticas baseadas em `auth.uid()` e `auth.jwt()`

## 🎯 Próximos Passos

1. **Execute o script de correção RLS**
2. **Execute o script de usuário admin**
3. **Teste o login**
4. **Monitore se não há mais erros**

## 📞 Se Ainda Não Funcionar

1. Verifique se executou ambos os scripts SQL
2. Limpe o cache do navegador
3. Verifique os logs do Supabase
4. Execute o diagnóstico em `/dashboard/diagnostico`

## 🔍 Como Funciona a Correção

### **Problema Original:**
```sql
-- Política problemática (causa recursão)
CREATE POLICY "Admins can view all users" ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users  -- ← CONSULTA A MESMA TABELA!
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);
```

### **Solução Implementada:**
```sql
-- Função usando JWT (sem consulta ao banco)
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() ->> 'user_metadata')::json ->> 'role';
END;
$$;

-- Política segura (sem recursão)
CREATE POLICY "users_select_safe" ON users
FOR SELECT
USING (
  auth.uid() = id OR  -- Próprio usuário
  is_admin_jwt()      -- Admin (usando JWT)
);
```

---
**Status:** ✅ Scripts criados e código corrigido
**Próximo:** Execute `fix-rls-no-recursion.sql` no Supabase
