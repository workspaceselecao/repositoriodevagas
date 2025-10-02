# Sistema de Reports de Oportunidades

## Visão Geral

O sistema de reports permite que usuários RH reportem problemas ou solicitem alterações em oportunidades de trabalho, direcionando essas solicitações para administradores que podem fazer as correções necessárias.

## Funcionalidades Implementadas

### Para Usuários RH

1. **Botão REPORTAR** na página Comparativo
   - Localizado ao lado do botão Editar nos cards de Cliente
   - Disponível apenas para usuários com role 'RH'
   - Ícone de alerta triangular (AlertTriangle)

2. **Modal de Reporte**
   - Lista suspensa com todos os administradores cadastrados
   - Lista suspensa com campos da Oportunidade:
     - Site, Categoria, Cargo, Cliente, Produto, Título
     - Descrição da vaga, Responsabilidades e atribuições
     - Requisitos e qualificações, Salário, Horário de Trabalho
     - Jornada de Trabalho, Benefícios, Local de Trabalho
     - Etapas do processo
   - Card mostrando o valor atual do campo selecionado
   - Campo de texto para descrever as alterações necessárias
   - Botões Reportar e Cancelar

### Para Administradores

1. **Notificações em Tempo Real**
   - Sistema de notificações no canto superior direito
   - Badge com contador de notificações
   - Atualização automática via Supabase Realtime

2. **Página de Edição Específica**
   - Acesso via `/dashboard/editar-report/:id`
   - Carregamento automático das informações da Oportunidade
   - Apenas o campo reportado é editável
   - Demais campos são apenas para visualização
   - Card com informações do report (valor atual, sugestões)
   - Botão para salvar alterações

3. **Lista de Reports**
   - Acesso via `/dashboard/reports`
   - Visualização de todos os reports
   - Filtros por status (Pendente, Em Andamento, Concluído, Rejeitado)
   - Estatísticas resumidas
   - Botão para editar reports pendentes

4. **Sistema de Redirecionamento**
   - Após salvar alterações, popup de confirmação
   - Redirecionamento automático para página Oportunidades
   - Atualização do status do report para 'completed'

## Estrutura do Banco de Dados

### Tabela `reports`

```sql
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vaga_id UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID NOT NULL REFERENCES users(id),
  field_name VARCHAR(100) NOT NULL,
  current_value TEXT,
  suggested_changes TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

### Políticas RLS (Row Level Security)

- Usuários podem ver reports onde são o reporter ou o assignee
- RH pode criar reports
- Admins podem atualizar e deletar reports

## Arquivos Criados/Modificados

### Novos Arquivos
- `scripts/create-reports-table.sql` - Script de migração do banco
- `scripts/migrate-reports.ts` - Script para executar migração
- `src/lib/reports.ts` - Funções de API para reports
- `src/hooks/useRealtimeReports.ts` - Hooks para comunicação em tempo real
- `src/components/ReportModal.tsx` - Modal de reporte
- `src/components/AdminNotifications.tsx` - Componente de notificações
- `src/components/EditarVagaFromReport.tsx` - Página de edição específica
- `src/components/ReportsList.tsx` - Lista de reports

### Arquivos Modificados
- `src/types/database.ts` - Tipos TypeScript para reports
- `src/components/ComparativoClientes.tsx` - Adicionado botão REPORTAR
- `src/components/DashboardLayout.tsx` - Adicionado notificações e menu
- `src/App.tsx` - Adicionadas rotas para reports
- `package.json` - Adicionado script de migração

## Como Usar

### Para RH
1. Acesse a página Comparativo
2. Clique no botão de alerta (⚠️) ao lado do botão Editar
3. Selecione o administrador responsável
4. Escolha o campo que deseja reportar
5. Descreva as alterações necessárias
6. Clique em Reportar

### Para Administradores
1. Receba notificação em tempo real
2. Acesse a página Reports para ver todos os reports
3. Clique em "Editar" para reports pendentes
4. Faça as alterações necessárias no campo reportado
5. Salve as alterações
6. Será redirecionado automaticamente para Oportunidades

## Instalação

1. Execute a migração do banco de dados:
```bash
npm run migrate-reports
```

2. Reinicie a aplicação:
```bash
npm run dev
```

## Tecnologias Utilizadas

- **Supabase Realtime** - Comunicação em tempo real
- **React Hooks** - Gerenciamento de estado
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de interface
- **PostgreSQL** - Banco de dados com RLS

## Segurança

- Row Level Security (RLS) implementado
- Validação de permissões por role
- Sanitização de dados de entrada
- Controle de acesso baseado em usuário

## Monitoramento

- Logs detalhados de operações
- Tratamento de erros robusto
- Feedback visual para usuários
- Sistema de notificações em tempo real
