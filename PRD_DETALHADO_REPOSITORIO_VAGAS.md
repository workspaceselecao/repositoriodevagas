# PRD - Repositório de Vagas
## Product Requirements Document

---

## 1. Visão Geral do Produto

### 1.1 Propósito
O **Repositório de Vagas** é uma aplicação web desenvolvida para gerenciar, comparar e analisar vagas de emprego de diferentes clientes. O sistema permite que equipes de Recursos Humanos organizem informações de vagas de forma centralizada, facilitando a comparação entre diferentes oportunidades e clientes.

### 1.2 Objetivos de Negócio
- Centralizar informações de vagas de diferentes clientes
- Facilitar comparação entre oportunidades de emprego
- Melhorar eficiência na gestão de vagas pela equipe de RH
- Prover ferramentas de análise e exportação de dados
- Garantir controle de acesso baseado em roles (ADMIN/RH)

### 1.3 Público-Alvo
- **Usuários ADMIN**: Gestores com acesso total ao sistema
- **Usuários RH**: Profissionais de Recursos Humanos com acesso limitado às funcionalidades operacionais

---

## 2. Arquitetura e Tecnologias

### 2.1 Stack Tecnológico
- **Frontend**: React 18 + Vite + TypeScript
- **UI Framework**: shadcn/ui + Radix UI + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth + bcryptjs
- **Email**: Resend API
- **Exportação**: XLSX
- **Deploy**: Vercel (recomendado)

### 2.2 Arquitetura do Sistema
```
Frontend (React + Vite)
    ↓
Supabase (PostgreSQL + Auth + RLS)
    ↓
External APIs (Resend, EmailJS)
```

### 2.3 Estrutura do Banco de Dados
- **users**: Gestão de usuários com roles (ADMIN/RH)
- **vagas**: Dados principais das vagas de emprego
- **backup_logs**: Logs de operações de backup
- **contact_email_config**: Configuração de emails de contato
- **emailjs_config**: Configuração do EmailJS
- **reports**: Sistema de relatórios (funcionalidade adicional)

---

## 3. Funcionalidades Principais

### 3.1 Sistema de Autenticação
**Descrição**: Sistema seguro de login com controle de acesso baseado em roles.

**Funcionalidades**:
- Login com email e senha
- Recuperação de senha via email
- Controle de sessão persistente
- Logout seguro
- Verificação de conectividade

**Fluxo de Usuário**:
1. Usuário acessa `/login`
2. Insere credenciais (email/senha)
3. Sistema valida credenciais no Supabase
4. Redirecionamento para dashboard baseado no role
5. Sessão mantida até logout ou expiração

**Critérios de Aceitação**:
- ✅ Login deve ser realizado em menos de 3 segundos
- ✅ Senhas devem ser hasheadas com bcryptjs
- ✅ Sessões devem ser válidas por 24 horas
- ✅ Recuperação de senha deve enviar email em menos de 30 segundos

### 3.2 Dashboard Principal
**Descrição**: Interface central com navegação e visão geral do sistema.

**Funcionalidades**:
- Sidebar expansível/contrátil
- Navegação por páginas principais
- Informações do usuário logado
- Toggle de tema (claro/escuro)
- Notificações de atualização
- Menu responsivo para mobile

**Componentes**:
- `DashboardLayout`: Layout principal com sidebar
- `Sidebar`: Navegação lateral
- `ThemeToggle`: Alternância de tema
- `UpdateNotification`: Notificações de atualização

### 3.3 Gestão de Vagas
**Descrição**: Sistema completo para criação, edição, visualização e exclusão de vagas.

#### 3.3.1 Lista de Vagas (ListaClientes)
**Funcionalidades**:
- Visualização em cards das vagas
- Busca por cliente, cargo, site ou produto
- Paginação (10, 25, 50 itens por página)
- Filtros avançados
- Estatísticas resumidas
- Exportação para Excel
- Visualização detalhada em modal

**Campos da Vaga**:
- Site, Categoria, Cargo, Cliente
- Título, Célula
- Descrição da vaga
- Responsabilidades e Atribuições
- Requisitos e Qualificações
- Salário, Horário, Jornada de trabalho
- Benefícios, Local de trabalho
- Etapas do processo

#### 3.3.2 Criação de Vagas (NovaVagaForm)
**Funcionalidades**:
- Formulário completo de criação
- Validação de campos obrigatórios
- Sistema de scraping automático (opcional)
- Preview da vaga antes de salvar
- Upload de informações via URL

**Permissões**:
- ADMIN: Acesso total
- RH: Acesso baseado em configuração do sistema

#### 3.3.3 Edição de Vagas
**Funcionalidades**:
- Edição inline de campos
- Histórico de alterações
- Validação de dados
- Preview das mudanças

### 3.4 Comparativo de Clientes
**Descrição**: Ferramenta para comparar vagas entre diferentes clientes.

**Funcionalidades**:
- Seleção de até 3 clientes
- Filtros por múltiplos critérios
- Cards expansíveis com informações detalhadas
- Sincronização de expansão entre cards similares
- Comparação lado a lado
- Exportação de comparações

**Fluxo de Usuário**:
1. Acessar página de comparativo
2. Selecionar clientes para comparação
3. Aplicar filtros desejados
4. Visualizar comparação em cards
5. Expandir detalhes conforme necessário
6. Exportar resultado (opcional)

### 3.5 Sistema de Configurações (ADMIN)
**Descrição**: Painel administrativo para configuração do sistema.

#### 3.5.1 Gestão de Usuários
**Funcionalidades**:
- Criação de novos usuários
- Edição de informações de usuários
- Alteração de roles (ADMIN/RH)
- Exclusão de usuários
- Reset de senhas

#### 3.5.2 Sistema de Backup
**Funcionalidades**:
- Backup manual de dados
- Backup automático agendado
- Exportação em múltiplos formatos (Excel, JSON)
- Histórico de backups
- Restauração de dados

**Tipos de Backup**:
- **Manual**: Executado sob demanda pelo ADMIN
- **Automático**: Agendado periodicamente
- **Export**: Exportação específica de dados

#### 3.5.3 Configurações de Email
**Funcionalidades**:
- Configuração de destinatários de contato
- Configuração do EmailJS
- Teste de configurações
- Gerenciamento de templates

#### 3.5.4 Sistema de Notícias
**Funcionalidades**:
- Criação de notícias internas
- Diferentes tipos (info, warning, success)
- Controle de ativação/desativação
- Exibição no dashboard

### 3.6 Sistema de Relatórios
**Descrição**: Funcionalidade adicional para criação e gerenciamento de relatórios.

**Funcionalidades**:
- Criação de relatórios personalizados
- Filtros avançados
- Exportação de relatórios
- Histórico de relatórios criados
- Compartilhamento de relatórios

### 3.7 Sistema de Contato
**Descrição**: Ferramenta para comunicação interna via email.

**Funcionalidades**:
- Envio de emails para múltiplos destinatários
- Templates pré-configurados
- Integração com Microsoft Teams
- Histórico de comunicações

---

## 4. Controle de Acesso e Permissões

### 4.1 Roles do Sistema

#### ADMIN
**Permissões Completas**:
- ✅ Acesso total ao sistema
- ✅ Gestão de usuários
- ✅ Configurações do sistema
- ✅ Backup e exportação
- ✅ Exclusão de vagas
- ✅ Sistema de relatórios
- ✅ Configurações de email
- ✅ Sistema de notícias

#### RH (Recursos Humanos)
**Permissões Limitadas**:
- ✅ Visualização de vagas
- ✅ Criação e edição de vagas (baseado em configuração)
- ✅ Comparativo de clientes
- ✅ Exportação de dados
- ✅ Sistema de contato
- ❌ Configurações do sistema
- ❌ Gestão de usuários
- ❌ Sistema de backup
- ❌ Exclusão de vagas (configurável)

### 4.2 Row Level Security (RLS)
**Implementação**: Políticas de segurança no nível de linha no Supabase

**Políticas Implementadas**:
- Usuários podem visualizar apenas seus próprios dados
- ADMINs podem visualizar todos os usuários
- Usuários autenticados podem visualizar vagas
- RH e ADMIN podem inserir/atualizar vagas
- Apenas ADMIN pode excluir vagas
- ADMIN tem controle total sobre logs de backup e configurações

---

## 5. Experiência do Usuário (UX/UI)

### 5.1 Design System
**Framework**: shadcn/ui + Tailwind CSS

**Elementos Visuais**:
- **Paleta de cores**: Tons pastéis com combinação fluida
- **Tipografia**: Inter font family
- **Ícones**: Lucide React
- **Layout**: Desktop-first com responsividade completa
- **Componentes**: Reutilizáveis e modulares

### 5.2 Responsividade
**Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Adaptações**:
- Sidebar colapsível em mobile
- Menu hambúrguer para navegação
- Cards adaptáveis ao tamanho da tela
- Formulários otimizados para touch

### 5.3 Acessibilidade
**Implementações**:
- Navegação por teclado
- Contraste adequado de cores
- Labels descritivos
- Tooltips informativos
- Estados de loading claros

### 5.4 Temas
**Modos Disponíveis**:
- **Claro**: Tema padrão com cores suaves
- **Escuro**: Tema escuro para uso noturno
- **Perfis de Cor**: Múltiplas combinações de cores

---

## 6. Performance e Escalabilidade

### 6.1 Otimizações de Performance
**Frontend**:
- Lazy loading de componentes
- Cache de dados com React Context
- Paginação para grandes volumes de dados
- Debounce em buscas
- Memoização de componentes pesados

**Backend**:
- Índices otimizados no banco de dados
- Row Level Security eficiente
- Queries otimizadas
- Cache de sessões

### 6.2 Sistema de Cache
**Implementação**: Context API + localStorage

**Estratégias**:
- Cache de dados de vagas
- Cache de configurações do usuário
- Cache de temas
- Invalidação inteligente de cache

### 6.3 Monitoramento
**Métricas Implementadas**:
- Tempo de carregamento de páginas
- Performance de queries
- Uso de memória
- Erros de aplicação

---

## 7. Segurança

### 7.1 Autenticação e Autorização
**Implementações**:
- Hash de senhas com bcryptjs
- JWT tokens seguros via Supabase
- Row Level Security (RLS)
- Controle de sessão
- Timeout de sessão

### 7.2 Proteção de Dados
**Medidas**:
- Criptografia de dados sensíveis
- Validação de entrada
- Sanitização de dados
- HTTPS obrigatório
- Headers de segurança

### 7.3 Auditoria
**Logs Implementados**:
- Logs de autenticação
- Logs de operações de backup
- Logs de alterações de dados
- Logs de erros do sistema

---

## 8. Integrações

### 8.1 Supabase
**Serviços Utilizados**:
- PostgreSQL Database
- Authentication
- Row Level Security
- Real-time subscriptions
- Storage (futuro)

### 8.2 Email Services
**Provedores**:
- **Resend**: Para emails transacionais
- **EmailJS**: Para formulários de contato

### 8.3 Microsoft Teams
**Integração**:
- Links diretos para contato
- Notificações via Teams (futuro)

---

## 9. Deployment e DevOps

### 9.1 Ambientes
**Desenvolvimento**:
- Local com Vite dev server
- Hot reload habilitado
- Debug tools ativos

**Produção**:
- Build otimizado
- Minificação de assets
- Service Worker para PWA

### 9.2 Deploy
**Plataforma Recomendada**: Vercel

**Processo**:
1. Build automático via Git
2. Deploy automático em produção
3. Rollback automático em caso de erro
4. Preview deployments para branches

### 9.3 CI/CD
**Automações**:
- Lint automático
- Testes automatizados
- Build de produção
- Deploy automático

---

## 10. Manutenção e Suporte

### 10.1 Versionamento
**Sistema**: Semantic Versioning (SemVer)

**Versão Atual**: 1.0.6

**Estrutura**:
- Major: Mudanças incompatíveis
- Minor: Novas funcionalidades compatíveis
- Patch: Correções de bugs

### 10.2 Backup e Recuperação
**Estratégias**:
- Backup automático diário
- Backup manual sob demanda
- Exportação de dados
- Restauração pontual

### 10.3 Monitoramento
**Ferramentas**:
- Logs de aplicação
- Métricas de performance
- Alertas de erro
- Dashboard de saúde do sistema

---

## 11. Roadmap e Melhorias Futuras

### 11.1 Funcionalidades Planejadas
**Curto Prazo** (1-3 meses):
- Sistema de notificações push
- Melhorias na interface mobile
- Filtros avançados adicionais
- Relatórios customizados

**Médio Prazo** (3-6 meses):
- API pública para integrações
- Sistema de workflows
- Integração com LinkedIn
- Analytics avançados

**Longo Prazo** (6+ meses):
- Machine Learning para matching
- Sistema de candidatos
- Integração com ATS
- Mobile app nativo

### 11.2 Melhorias Técnicas
- Migração para React 19
- Implementação de GraphQL
- Microserviços
- Containerização com Docker

---

## 12. Critérios de Sucesso

### 12.1 Métricas de Performance
- **Tempo de carregamento**: < 2 segundos
- **Disponibilidade**: 99.9%
- **Uptime**: > 99.5%
- **Tempo de resposta**: < 500ms

### 12.2 Métricas de Usuário
- **Satisfação**: > 4.5/5
- **Adoção**: 100% da equipe RH
- **Retenção**: > 95% mensal
- **Engajamento**: > 80% uso diário

### 12.3 Métricas de Negócio
- **Eficiência**: 50% redução no tempo de gestão de vagas
- **Produtividade**: 30% aumento na velocidade de comparação
- **Qualidade**: 90% redução em erros de dados
- **ROI**: Payback em 6 meses

---

## 13. Riscos e Mitigações

### 13.1 Riscos Técnicos
**Risco**: Falha no Supabase
**Mitigação**: Backup local + múltiplos provedores

**Risco**: Perda de dados
**Mitigação**: Backup automático + versionamento

**Risco**: Problemas de performance
**Mitigação**: Cache + otimizações + monitoramento

### 13.2 Riscos de Negócio
**Risco**: Resistência à mudança
**Mitigação**: Treinamento + suporte + demonstrações

**Risco**: Dependência de terceiros
**Mitigação**: Contratos SLA + planos de contingência

---

## 14. Conclusão

O **Repositório de Vagas** é uma aplicação robusta e escalável que atende às necessidades de gestão de vagas de equipes de RH. Com arquitetura moderna, segurança robusta e experiência de usuário otimizada, o sistema está preparado para crescer e evoluir conforme as necessidades do negócio.

A implementação atual já demonstra excelente qualidade técnica e funcional, com potencial para expansão e melhorias contínuas que manterão o sistema relevante e eficiente para os usuários.

---

**Documento criado em**: Janeiro 2025  
**Versão**: 1.0  
**Autor**: Sistema de Análise Automática  
**Revisão**: Pendente
