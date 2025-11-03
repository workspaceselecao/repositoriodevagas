# 🔒 HABILITAR PROTEÇÃO CONTRA SENHAS VAZADAS

## ⚠️ **AÇÃO MANUAL NECESSÁRIA**

Para habilitar a proteção contra senhas vazadas, siga estes passos:

### **Passos no Dashboard do Supabase:**

1. **Acesse o Dashboard do Supabase**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto: `repositorio-de-vagas`

2. **Navegue para Authentication**
   - No menu lateral, clique em **"Authentication"**
   - Clique em **"Settings"**

3. **Configure Password Protection**
   - Encontre a seção **"Password Protection"**
   - Habilite **"Leaked password protection"**
   - Esta opção verifica senhas contra o banco de dados HaveIBeenPwned.org

4. **Salve as configurações**
   - Clique em **"Save"** para aplicar as mudanças

### **Benefícios:**
- ✅ Previne uso de senhas comprometidas
- ✅ Melhora a segurança geral do sistema
- ✅ Protege contra ataques de força bruta
- ✅ Conformidade com melhores práticas de segurança

### **Nota:**
Esta configuração não pode ser aplicada via código/SQL, pois é uma configuração específica do Supabase Auth que deve ser feita através do Dashboard.

---
*Configuração necessária para resolver o warning: "Leaked password protection is currently disabled"*
