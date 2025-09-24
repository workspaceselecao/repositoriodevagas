# Migração: Produto → Célula + Nova Coluna Título

## 📋 Resumo das Alterações

Esta migração implementa as seguintes mudanças solicitadas:

1. **Renomeação**: Coluna `produto` → `celula`
2. **Nova coluna**: `titulo` (VARCHAR(255), opcional)
3. **Reordenação**: Filtros na página Comparativo (Célula, Cargo, Site, Categoria)
4. **Layout**: Cards mostram Título, Cliente e Célula na ordem especificada

## 🗂️ Arquivos Modificados

### Schema do Banco de Dados
- `database/schema.sql` - Atualizado com nova estrutura

### Tipos TypeScript
- `src/types/database.ts` - Interfaces atualizadas:
  - `Vaga`: `produto` → `celula`, adicionado `titulo`
  - `VagaFormData`: `produto` → `celula`, adicionado `titulo`
  - `VagaFilter`: `produto` → `celula`

### Componentes React
- `src/components/VagaTemplate.tsx` - Layout atualizado para mostrar Título, Cliente, Célula
- `src/components/ComparativoClientes.tsx` - Filtros reordenados e referências atualizadas
- `src/components/NovaVagaForm.tsx` - Formulário com novos campos
- `src/components/EditarVagaForm.tsx` - Formulário de edição atualizado
- `src/components/ListaClientes.tsx` - Busca atualizada para incluir título

### Funções de Banco
- `src/lib/vagas.ts` - `getProdutos()` → `getCelulas()`, filtros atualizados

### Scripts
- `scripts/reset-and-populate-vagas.ts` - Atualizado para nova estrutura
- `scripts/migrate-produto-to-celula.sql` - Script SQL de migração
- `scripts/migrate-database.ts` - Script TypeScript de migração

## 🚀 Como Executar a Migração

### Opção 1: Script SQL (Recomendado)
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: scripts/migrate-produto-to-celula.sql
```

### Opção 2: Script TypeScript
```bash
# Configure as variáveis de ambiente
export VITE_SUPABASE_URL="sua_url"
export SUPABASE_SERVICE_ROLE_KEY="sua_chave"

# Execute o script
npx tsx scripts/migrate-database.ts
```

## 📊 Estrutura Final da Tabela

```sql
CREATE TABLE vagas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site VARCHAR(255) NOT NULL,
  categoria VARCHAR(255) NOT NULL,
  cargo VARCHAR(255) NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  titulo VARCHAR(255),           -- NOVA COLUNA
  celula VARCHAR(255) NOT NULL,  -- RENOMEADA DE produto
  -- ... outros campos
);
```

## 🎯 Ordem dos Campos nos Cards

1. **Título da Vaga** (se disponível, senão usa cargo)
2. **Cliente**
3. **Célula** (anteriormente produto)

## 🔍 Ordem dos Filtros na Página Comparativo

1. **Célula** (primeiro)
2. **Cargo**
3. **Site**
4. **Categoria** (último)

## ⚠️ Notas Importantes

- A coluna `produto` original **NÃO foi removida** por segurança
- Todos os dados existentes foram copiados de `produto` para `celula`
- A nova coluna `titulo` inicia vazia e pode ser preenchida posteriormente
- Índices foram criados para otimizar consultas nas novas colunas

## 🧪 Testes Realizados

- ✅ Compilação TypeScript sem erros
- ✅ Linting sem problemas
- ✅ Estrutura de tipos atualizada
- ✅ Componentes atualizados
- ✅ Scripts de migração criados

## 📝 Próximos Passos

1. Executar a migração no banco de dados
2. Testar a aplicação em desenvolvimento
3. Preencher títulos das vagas existentes
4. Remover coluna `produto` (opcional, após confirmação)
