# 📚 Manual do Usuário - Repositório de Vagas

## Índice
1. [Introdução](#introdução)
2. [Primeiros Passos](#primeiros-passos)
3. [Sistema de Autenticação](#sistema-de-autenticação)
4. [Dashboard Principal](#dashboard-principal)
5. [Gestão de Oportunidades](#gestão-de-oportunidades)
6. [Comparativo de Clientes](#comparativo-de-clientes)
7. [Sistema de Configurações](#sistema-de-configurações)
8. [Sistema de Relatórios](#sistema-de-relatórios)
9. [Sistema de Contato](#sistema-de-contato)
10. [Funcionalidades Avançadas](#funcionalidades-avançadas)

---

## Introdução

O **Repositório de Vagas** é uma aplicação web desenvolvida para gerenciar, comparar e analisar vagas de emprego de diferentes clientes. O sistema permite que equipes de Recursos Humanos organizem informações de vagas de forma centralizada, facilitando a comparação entre diferentes oportunidades.

### Características Principais
- ✅ Interface moderna e responsiva
- ✅ Sistema de autenticação seguro
- ✅ Gestão completa de vagas
- ✅ Comparativo entre clientes
- ✅ Sistema de relatórios
- ✅ Backup automático
- ✅ Temas claro/escuro
- ✅ PWA (Progressive Web App)

---

## Primeiros Passos

### Acesso à Aplicação
1. Acesse a URL da aplicação no seu navegador
2. Você será direcionado para a página de login
3. Insira suas credenciais de acesso
4. Após o login, você será redirecionado para o dashboard principal

### Credenciais de Teste
**Administrador:**
- Email: `roberio.gomes@atento.com`
- Senha: `admin123`

---

## Sistema de Autenticação

### Login
1. Na página de login, insira seu email e senha
2. Clique em "Entrar"
3. Aguarde a validação das credenciais
4. Você será redirecionado automaticamente para o dashboard

### Recuperação de Senha
1. Na página de login, clique em "Esqueci minha senha"
2. Insira seu email cadastrado
3. Clique em "Enviar link de recuperação"
4. Verifique sua caixa de email
5. Clique no link recebido
6. Defina uma nova senha

### Logout
1. No canto superior direito, clique no seu nome/avatar
2. Selecione "Sair"
3. Você será redirecionado para a página de login

---

## Dashboard Principal

O dashboard é a página principal da aplicação, onde você encontrará:

### Barra Lateral (Sidebar)
A barra lateral contém a navegação principal:

#### 📊 **Repo Comunica**
- Página inicial com visão geral do sistema
- Estatísticas resumidas
- Acesso rápido às funcionalidades principais

#### 🏢 **Oportunidades**
- Lista completa de todas as vagas cadastradas
- Filtros e busca avançada
- Visualização em cards ou lista

#### 📈 **Comparativo**
- Ferramenta para comparar vagas entre clientes
- Seleção de até 3 clientes
- Filtros personalizados

#### ➕ **Nova Vaga** (apenas RH/ADMIN)
- Formulário para criação de novas vagas
- Sistema de scraping automático
- Preview antes de salvar

#### 👥 **Usuários** (apenas ADMIN)
- Gestão de usuários do sistema
- Criação, edição e exclusão de contas
- Controle de permissões

#### ⚙️ **Configurações** (apenas ADMIN)
- Configurações do sistema
- Backup e exportação
- Configurações de email
- Sistema de notícias

#### 📧 **Contato**
- Envio de emails para equipe
- Templates pré-configurados
- Integração com Microsoft Teams

#### 📋 **Relatórios**
- Visualização de relatórios criados
- Histórico de reportes
- Status de processamento

### Funcionalidades da Barra Lateral
- **Expansão/Contração**: Clique no ícone de seta para expandir ou contrair
- **Tema**: Alternar entre tema claro e escuro
- **Responsivo**: Em dispositivos móveis, a barra lateral se transforma em menu hambúrguer

### Notificações
O sistema possui notificações em tempo real para:
- Novos relatórios pendentes
- Atualizações de status
- Alertas importantes

---

## Gestão de Oportunidades

### Lista de Oportunidades

A página de oportunidades permite visualizar e gerenciar todas as vagas cadastradas no sistema.

#### Funcionalidades Principais
- **Visualização em Cards**: Cada vaga é exibida em um card com informações resumidas
- **Busca**: Campo de busca por cliente, cargo, site ou célula
- **Filtros**: Filtros avançados por múltiplos critérios
- **Paginação**: Navegação por páginas (10, 25 ou 50 itens por página)
- **Estatísticas**: Resumo de vagas por cliente e categoria

#### Ações Disponíveis
- **👁️ Visualizar**: Abrir detalhes completos da vaga
- **✏️ Editar**: Modificar informações da vaga (apenas RH/ADMIN)
- **🗑️ Excluir**: Remover vaga do sistema (apenas ADMIN)
- **📊 Exportar**: Baixar lista em Excel

#### Campos da Vaga
Cada vaga contém as seguintes informações:
- **Básicas**: Site, Categoria, Cargo, Cliente, Título, Célula
- **Detalhadas**: Descrição, Responsabilidades, Requisitos
- **Condições**: Salário, Horário, Jornada, Benefícios
- **Localização**: Local de trabalho, Etapas do processo

### Criação de Nova Vaga

#### Acesso
- **RH**: Baseado em configuração do sistema
- **ADMIN**: Acesso total

#### Formulário de Criação
O formulário está organizado em seções:

1. **Informações Básicas**
   - Site (ex: São Bento, Casa)
   - Categoria (ex: Operações)
   - Cargo (ex: Especialista I)
   - Cliente
   - Título da vaga
   - Célula

2. **Descrição Detalhada**
   - Descrição da vaga
   - Responsabilidades e atribuições
   - Requisitos e qualificações

3. **Condições de Trabalho**
   - Salário
   - Horário de trabalho
   - Jornada de trabalho
   - Benefícios

4. **Informações Adicionais**
   - Local de trabalho
   - Etapas do processo seletivo

#### Sistema de Scraping
- **Upload por URL**: Cole a URL de uma vaga e o sistema extrairá automaticamente as informações
- **Validação**: Revise as informações extraídas antes de salvar
- **Edição**: Ajuste manualmente os campos conforme necessário

### Edição de Vagas

#### Permissões
- **RH**: Pode editar vagas baseado em configuração
- **ADMIN**: Pode editar qualquer vaga

#### Processo de Edição
1. Na lista de vagas, clique no ícone "Editar"
2. Modifique os campos desejados
3. Clique em "Salvar alterações"
4. Confirme a operação

#### Histórico de Alterações
O sistema mantém um histórico de todas as alterações realizadas nas vagas.

---

## Comparativo de Clientes

A ferramenta de comparativo permite analisar vagas entre diferentes clientes de forma simultânea.

### Funcionamento

#### 1. Seleção de Clientes
- Selecione até 3 clientes para comparação
- Use o dropdown para escolher entre os clientes disponíveis
- Clique em "Adicionar Cliente" para incluir na comparação

#### 2. Aplicação de Filtros
Cada cliente pode ter filtros independentes:
- **Célula**: Filtro principal que afeta outros filtros
- **Cargo**: Filtro secundário dependente da célula
- **Site**: Filtro terciário dependente de célula e cargo
- **Categoria**: Filtro quaternário dependente dos anteriores

#### 3. Visualização da Comparação
- **Cards Paralelos**: Vagas exibidas lado a lado
- **Seções Expansíveis**: Clique para expandir detalhes
- **Sincronização**: Expansão sincronizada entre cards similares
- **Rolagem Inteligente**: Navegação otimizada entre seções

#### 4. Navegação
- **Botão "Ir para Comparativo"**: Rola automaticamente para a área de comparação
- **Setas de Navegação**: Navegue entre diferentes seções
- **Filtros Rápidos**: Aplicar filtros comuns rapidamente

### Recursos Avançados

#### Filtros Inteligentes
- Os filtros são condicionais: selecionar uma célula atualiza as opções de cargo
- Filtros são aplicados em cascata para resultados mais precisos
- Possibilidade de limpar filtros individualmente ou todos de uma vez

#### Reporte de Vagas
- Durante a comparação, você pode reportar vagas com problemas
- Clique no ícone de alerta para abrir o modal de reporte
- Preencha as informações do problema encontrado

---

## Sistema de Configurações

⚠️ **Acesso Restrito**: Apenas usuários ADMIN podem acessar as configurações.

### Abas de Configuração

#### 1. Backup e Exportação
- **Backup Manual**: Criar backup sob demanda
- **Configurações de Backup**: Escolher quais dados incluir
- **Histórico de Backups**: Visualizar backups realizados
- **Download**: Baixar backups em Excel ou CSV

#### 2. Sistema de Notícias
- **Criar Notícias**: Adicionar notícias internas
- **Tipos**: Info, Warning, Success
- **Status**: Ativar/desativar notícias
- **Edição**: Modificar notícias existentes

#### 3. Configurações de Email
- **Emails de Contato**: Configurar destinatários
- **Templates**: Gerenciar templates de email
- **Teste**: Testar configurações de email
- **Status**: Ativar/desativar emails

#### 4. Temas e Interface
- **Seletor de Tema**: Alternar entre temas disponíveis
- **Perfis de Cor**: Múltiplas combinações de cores
- **Preview**: Visualizar mudanças antes de aplicar

#### 5. Métricas de Cache
- **Performance**: Visualizar métricas de cache
- **Limpeza**: Limpar cache quando necessário
- **Otimização**: Configurações de otimização

#### 6. Configurações de Acesso RH
- **Nova Vaga**: Controlar acesso do RH para criar vagas
- **Edição**: Controlar permissões de edição
- **Exclusão**: Controlar permissões de exclusão

### Backup e Exportação

#### Tipos de Backup
- **Manual**: Executado sob demanda
- **Automático**: Agendado periodicamente
- **Export**: Exportação específica de dados

#### Dados Incluídos
- ✅ Vagas (padrão)
- ⚪ Usuários (opcional)
- ⚪ Logs de backup (opcional)
- ⚪ Notícias (opcional)

#### Formatos Disponíveis
- **Excel (.xlsx)**: Formato recomendado
- **CSV**: Para integração com outros sistemas
- **JSON**: Para desenvolvimento e análise

---

## Sistema de Relatórios

O sistema de relatórios permite criar e gerenciar relatórios sobre as vagas e atividades do sistema.

### Funcionalidades

#### Visualização de Relatórios
- **Lista de Relatórios**: Todos os relatórios criados
- **Status**: Pendente, Processando, Concluído, Erro
- **Data de Criação**: Quando o relatório foi solicitado
- **Ações**: Visualizar, editar, excluir

#### Criação de Relatórios
- **Modal de Reporte**: Abrir durante comparação de clientes
- **Campos Obrigatórios**: Título, descrição, tipo
- **Categorias**: Problema técnico, erro de dados, sugestão
- **Prioridade**: Baixa, Média, Alta, Crítica

#### Status dos Relatórios
- **🟡 Pendente**: Aguardando processamento
- **🟠 Processando**: Em análise
- **🟢 Concluído**: Resolvido
- **🔴 Erro**: Problema na criação

### Notificações em Tempo Real

O sistema possui notificações automáticas para:
- Novos relatórios criados
- Atualizações de status
- Relatórios resolvidos
- Problemas críticos

---

## Sistema de Contato

O sistema de contato permite comunicação interna via email.

### Funcionalidades

#### Envio de Emails
- **Destinatários**: Selecionar múltiplos destinatários
- **Assunto**: Definir assunto do email
- **Mensagem**: Escrever conteúdo da mensagem
- **Templates**: Usar templates pré-configurados

#### Configurações de Email
- **Destinatários Padrão**: Configurar emails frequentes
- **Templates**: Criar e gerenciar templates
- **Assinatura**: Adicionar assinatura padrão

#### Integração com Microsoft Teams
- **Links Diretos**: Acesso rápido ao Teams
- **Notificações**: Integração com canais do Teams

---

## Funcionalidades Avançadas

### Sistema de Temas

#### Temas Disponíveis
- **Claro**: Tema padrão com cores suaves
- **Escuro**: Tema escuro para uso noturno

#### Perfis de Cor
- **Padrão**: Cores originais do sistema
- **Alternativo**: Combinações alternativas
- **Personalizado**: Cores customizadas (futuro)

### PWA (Progressive Web App)

#### Funcionalidades PWA
- **Instalação**: Instalar como app no dispositivo
- **Offline**: Funcionalidade básica offline
- **Notificações**: Notificações push (futuro)
- **Atualizações**: Atualizações automáticas

#### Como Instalar
1. No navegador, clique no ícone de instalação
2. Confirme a instalação
3. O app será adicionado à sua tela inicial

### Sistema de Atualizações

#### Verificação Automática
- **Intervalo**: Verificação a cada 30 minutos
- **Notificação**: Aviso quando há atualizações
- **Aplicação**: Atualização com um clique

#### Controle Manual
- **Verificar Agora**: Forçar verificação de atualizações
- **Histórico**: Visualizar versões anteriores
- **Rollback**: Voltar para versão anterior (se necessário)

### Responsividade

#### Dispositivos Suportados
- **Desktop**: Experiência completa
- **Tablet**: Interface adaptada
- **Mobile**: Menu hambúrguer e layout otimizado

#### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## Dicas e Truques

### Navegação Rápida
- Use `Ctrl + F` para buscar em qualquer página
- Use as setas do teclado para navegar entre cards
- Clique duas vezes em um card para expandir detalhes

### Atalhos de Teclado
- `Escape`: Fechar modais
- `Enter`: Confirmar ações
- `Tab`: Navegar entre campos

### Otimização de Performance
- Use filtros para reduzir o número de vagas exibidas
- Limpe o cache periodicamente se necessário
- Use a paginação para navegar em grandes volumes de dados

### Backup e Segurança
- Faça backup regularmente dos dados importantes
- Mantenha suas credenciais seguras
- Reporte problemas através do sistema de relatórios

---

## Suporte e Contato

### Para Dúvidas
1. Consulte este manual
2. Use o sistema de relatórios para reportar problemas
3. Entre em contato com o administrador do sistema

### Informações do Sistema
- **Versão Atual**: 1.0.6
- **Última Atualização**: Janeiro 2025
- **Suporte**: Sistema de relatórios integrado

---

*Manual criado em Janeiro 2025 - Versão 1.0*
