# Sistema de Controle de Acesso RH - Nova Oportunidade

## 📋 Resumo das Alterações

Este documento descreve as alterações implementadas para controlar o acesso de usuários RH à página "Nova Oportunidade".

## 🎯 Funcionalidades Implementadas

### 1. **Inativação da Página Nova Oportunidade para RH**
- Usuários RH não têm mais acesso direto à página Nova Oportunidade por padrão
- O menu "Nova Oportunidade" não aparece para usuários RH quando desabilitado
- Redirecionamento automático para o dashboard principal se tentarem acessar diretamente

### 2. **Sistema de Configuração Administrativa**
- Nova aba "Controle de Acesso" na página de Configurações (apenas para ADMIN)
- Toggle para habilitar/desabilitar acesso RH à página Nova Oportunidade
- Configuração persistida no banco de dados
- Aplicação imediata das alterações para todos os usuários RH

### 3. **Proteção de Rotas Inteligente**
- Novo componente `RHProtectedRoute` que verifica permissões dinamicamente
- Verificação em tempo real das configurações do sistema
- Administradores sempre têm acesso completo

## 🗄️ Estrutura do Banco de Dados

### Nova Tabela: `system_config`
```sql
CREATE TABLE system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Configuração Padrão
- **Chave**: `rh_nova_vaga_enabled`
- **Valor Padrão**: `false` (desabilitado)
- **Descrição**: "Habilita acesso à página Nova Oportunidade para usuários RH"

## 🔧 Arquivos Modificados/Criados

### Novos Arquivos:
- `src/lib/systemConfig.ts` - Funções para gerenciar configurações do sistema
- `src/hooks/useSystemConfig.ts` - Hooks para usar configurações
- `src/components/RHProtectedRoute.tsx` - Componente de proteção de rota
- `scripts/add-system-config.sql` - Script SQL para criar tabela
- `scripts/migrate-system-config.ts` - Script de migração

### Arquivos Modificados:
- `src/components/DashboardLayout.tsx` - Controle de visibilidade do menu
- `src/components/Configuracoes.tsx` - Nova aba de controle de acesso
- `src/App.tsx` - Proteção das rotas Nova Oportunidade
- `src/types/database.ts` - Novas interfaces TypeScript

## 🚀 Como Executar a Migração

### Opção 1: Script Automático
```bash
# Instalar dependências se necessário
npm install

# Executar migração
npx ts-node scripts/migrate-system-config.ts
```

### Opção 2: Execução Manual no Supabase
1. Acesse o painel do Supabase
2. Vá para SQL Editor
3. Execute o conteúdo do arquivo `scripts/add-system-config.sql`

## 🎮 Como Usar

### Para Administradores:
1. Faça login como usuário ADMIN
2. Acesse **Configurações** no menu lateral
3. Clique na aba **"Controle de Acesso"**
4. Use o toggle para habilitar/desabilitar acesso RH à Nova Oportunidade
5. As alterações são aplicadas imediatamente

### Para Usuários RH:
- **Acesso Desabilitado**: Não veem o menu "Nova Oportunidade" e são redirecionados se tentarem acessar diretamente
- **Acesso Habilitado**: Podem acessar normalmente a página Nova Oportunidade

## 🔒 Comportamento de Segurança

### Usuários ADMIN:
- ✅ Sempre têm acesso completo a todas as funcionalidades
- ✅ Podem configurar permissões de outros usuários
- ✅ Não são afetados pelas configurações de acesso RH

### Usuários RH:
- 🔒 Acesso controlado pela configuração administrativa
- 🔒 Redirecionamento automático se não tiverem permissão
- 🔒 Interface adaptada dinamicamente baseada nas permissões

## 🧪 Testando as Alterações

### Cenário 1: RH sem Acesso (Padrão)
1. Faça login como usuário RH
2. Verifique que o menu "Nova Oportunidade" não aparece
3. Tente acessar `/dashboard/nova-vaga` diretamente
4. Deve ser redirecionado para `/dashboard`

### Cenário 2: RH com Acesso Habilitado
1. Faça login como ADMIN
2. Vá em Configurações > Controle de Acesso
3. Habilite o toggle para RH
4. Faça login como usuário RH
5. Verifique que o menu "Nova Oportunidade" aparece
6. Acesse a página normalmente

### Cenário 3: ADMIN sempre tem Acesso
1. Faça login como ADMIN
2. Verifique que sempre tem acesso à página Nova Oportunidade
3. Independente das configurações de RH

## 📊 Monitoramento

### Logs Importantes:
- Verificação de permissões RH em tempo real
- Alterações de configuração pelo ADMIN
- Tentativas de acesso não autorizado

### Métricas Disponíveis:
- Status atual da configuração RH
- Última alteração da configuração
- Usuários afetados pelas mudanças

## 🔄 Próximos Passos Sugeridos

1. **Auditoria**: Implementar logs de auditoria para mudanças de configuração
2. **Notificações**: Avisar usuários RH quando permissões são alteradas
3. **Granularidade**: Expandir controle para outras funcionalidades
4. **Cache**: Implementar cache para melhorar performance das verificações

## ⚠️ Considerações Importantes

- As alterações são aplicadas imediatamente para todos os usuários RH
- Não há cache de sessão - as verificações são feitas em tempo real
- A configuração é persistida no banco de dados e sobrevive a reinicializações
- Usuários RH ativos serão afetados imediatamente pelas mudanças de configuração
