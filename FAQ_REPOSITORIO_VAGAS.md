# ❓ FAQ - Repositório de Vagas

## Índice
1. [Geral](#geral)
2. [Autenticação e Acesso](#autenticação-e-acesso)
3. [Gestão de Vagas](#gestão-de-vagas)
4. [Comparativo de Clientes](#comparativo-de-clientes)
5. [Sistema de Configurações](#sistema-de-configurações)
6. [Relatórios e Notificações](#relatórios-e-notificações)
7. [Backup e Exportação](#backup-e-exportação)
8. [Problemas Técnicos](#problemas-técnicos)
9. [Interface e Usabilidade](#interface-e-usabilidade)
10. [Segurança e Permissões](#segurança-e-permissões)

---

## Geral

### ❓ O que é o Repositório de Vagas?
O Repositório de Vagas é uma aplicação web desenvolvida para gerenciar, comparar e analisar vagas de emprego de diferentes clientes. O sistema permite que equipes de Recursos Humanos organizem informações de vagas de forma centralizada.

### ❓ Quem pode usar o sistema?
O sistema é destinado a:
- **Usuários ADMIN**: Gestores com acesso total ao sistema
- **Usuários RH**: Profissionais de Recursos Humanos com acesso limitado às funcionalidades operacionais

### ❓ Como acessar o sistema?
1. Acesse a URL da aplicação no seu navegador
2. Insira suas credenciais de acesso
3. Após o login, você será redirecionado para o dashboard principal

### ❓ Quais navegadores são suportados?
O sistema é compatível com:
- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (limitado)

### ❓ O sistema funciona em dispositivos móveis?
Sim! O sistema é totalmente responsivo e funciona em:
- 📱 Smartphones
- 📱 Tablets
- 💻 Desktops
- 💻 Laptops

---

## Autenticação e Acesso

### ❓ Esqueci minha senha. Como recuperar?
1. Na página de login, clique em "Esqueci minha senha"
2. Insira seu email cadastrado
3. Clique em "Enviar link de recuperação"
4. Verifique sua caixa de email
5. Clique no link recebido
6. Defina uma nova senha

### ❓ Não recebi o email de recuperação de senha. O que fazer?
- Verifique sua caixa de spam/lixo eletrônico
- Aguarde alguns minutos (pode demorar até 5 minutos)
- Tente novamente após alguns minutos
- Entre em contato com o administrador do sistema

### ❓ Posso alterar minha senha após o login?
Sim! No canto superior direito, clique no seu nome/avatar e selecione "Alterar Senha".

### ❓ Qual a diferença entre usuário ADMIN e RH?
**ADMIN:**
- ✅ Acesso total ao sistema
- ✅ Gestão de usuários
- ✅ Configurações do sistema
- ✅ Backup e exportação
- ✅ Exclusão de vagas

**RH:**
- ✅ Visualização de vagas
- ✅ Criação e edição de vagas (baseado em configuração)
- ✅ Comparativo de clientes
- ✅ Exportação de dados
- ❌ Configurações do sistema
- ❌ Gestão de usuários

### ❓ Como solicitar acesso ao sistema?
Entre em contato com o administrador do sistema ou com a equipe de TI.

### ❓ Minha sessão expira automaticamente?
Sim, por motivos de segurança, a sessão expira após 24 horas de inatividade.

---

## Gestão de Vagas

### ❓ Como criar uma nova vaga?
1. Acesse "Nova Vaga" no menu lateral
2. Preencha todas as informações obrigatórias
3. Clique em "Criar Oportunidade"
4. Confirme as informações

### ❓ Quais campos são obrigatórios ao criar uma vaga?
- Site
- Categoria
- Cargo
- Cliente
- Descrição da vaga

### ❓ Como editar uma vaga existente?
1. Na lista de vagas, clique no ícone "Editar" (✏️)
2. Modifique os campos desejados
3. Clique em "Salvar alterações"
4. Confirme a operação

### ❓ Posso excluir uma vaga?
- **ADMIN**: Sim, pode excluir qualquer vaga
- **RH**: Depende da configuração do sistema (geralmente não)

### ❓ Como funciona o sistema de scraping?
O sistema pode extrair automaticamente informações de vagas de URLs:
1. Cole a URL da vaga no campo apropriado
2. Clique em "Extrair Informações"
3. Revise e ajuste as informações extraídas
4. Salve a vaga

### ❓ Quantas vagas posso criar?
Não há limite específico, mas o sistema é otimizado para até 10.000 vagas.

### ❓ Como buscar vagas específicas?
Use o campo de busca na página de oportunidades para procurar por:
- Cliente
- Cargo
- Site
- Célula
- Título

### ❓ Posso exportar a lista de vagas?
Sim! Na página de oportunidades, clique em "Exportar" para baixar em Excel.

---

## Comparativo de Clientes

### ❓ Como comparar vagas entre clientes?
1. Acesse "Comparativo" no menu lateral
2. Selecione até 3 clientes para comparação
3. Aplique filtros conforme necessário
4. Visualize a comparação lado a lado

### ❓ Quantos clientes posso comparar simultaneamente?
O sistema permite comparar até 3 clientes ao mesmo tempo.

### ❓ Como funcionam os filtros no comparativo?
Os filtros são condicionais:
- **Célula**: Filtro principal
- **Cargo**: Depende da célula selecionada
- **Site**: Depende de célula e cargo
- **Categoria**: Depende dos filtros anteriores

### ❓ Posso expandir detalhes das vagas durante a comparação?
Sim! Clique em qualquer seção para expandir e ver detalhes completos.

### ❓ Como reportar problemas em vagas durante a comparação?
1. Clique no ícone de alerta (⚠️) na vaga com problema
2. Preencha o formulário de reporte
3. Clique em "Enviar Reporte"

---

## Sistema de Configurações

### ❓ Quem pode acessar as configurações?
Apenas usuários ADMIN têm acesso às configurações do sistema.

### ❓ Como fazer backup dos dados?
1. Acesse "Configurações" > "Backup e Exportação"
2. Configure quais dados incluir
3. Clique em "Criar Backup"
4. Baixe o arquivo gerado

### ❓ Com que frequência devo fazer backup?
Recomendamos backup semanal para dados importantes e backup mensal completo.

### ❓ Como configurar emails de contato?
1. Acesse "Configurações" > "Configurações de Email"
2. Clique em "Adicionar Email"
3. Preencha as informações
4. Teste a configuração

### ❓ Como criar notícias internas?
1. Acesse "Configurações" > "Sistema de Notícias"
2. Clique em "Criar Notícia"
3. Escolha o tipo (Info, Warning, Success)
4. Escreva o conteúdo
5. Ative a notícia

### ❓ Como alterar o tema da aplicação?
1. Acesse "Configurações" > "Temas e Interface"
2. Escolha o tema desejado
3. Selecione o perfil de cor
4. A alteração é aplicada imediatamente

---

## Relatórios e Notificações

### ❓ O que são relatórios no sistema?
Relatórios são solicitações de correção ou melhoria que podem ser criadas durante o uso do sistema.

### ❓ Como criar um relatório?
1. Durante a comparação de clientes, clique no ícone de alerta
2. Preencha o formulário com:
   - Título do problema
   - Descrição detalhada
   - Tipo de problema
   - Prioridade
3. Clique em "Enviar Reporte"

### ❓ Quais tipos de relatórios posso criar?
- **Problema Técnico**: Erros no sistema
- **Erro de Dados**: Informações incorretas
- **Sugestão**: Melhorias sugeridas
- **Outros**: Outros tipos de problemas

### ❓ Como acompanhar o status dos meus relatórios?
Acesse "Relatórios" no menu lateral para ver todos os relatórios criados e seus status.

### ❓ Recebo notificações quando meus relatórios são resolvidos?
Sim! O sistema envia notificações em tempo real sobre atualizações nos relatórios.

### ❓ Posso editar um relatório após enviá-lo?
Depende do status do relatório. Relatórios pendentes podem ser editados, mas relatórios em processamento ou concluídos não.

---

## Backup e Exportação

### ❓ Que tipos de backup posso fazer?
- **Backup Manual**: Executado sob demanda
- **Backup Automático**: Agendado periodicamente
- **Export Específico**: Exportação de dados selecionados

### ❓ Que dados são incluídos no backup?
Por padrão, apenas as vagas são incluídas. Opcionalmente, você pode incluir:
- Usuários
- Logs de backup
- Notícias

### ❓ Em que formatos posso exportar os dados?
- **Excel (.xlsx)**: Formato recomendado
- **CSV**: Para integração com outros sistemas
- **JSON**: Para desenvolvimento e análise

### ❓ Como restaurar dados de um backup?
Entre em contato com o administrador do sistema para restauração de dados.

### ❓ Os backups são seguros?
Sim! Os backups são criptografados e armazenados de forma segura.

---

## Problemas Técnicos

### ❓ A aplicação está lenta. O que fazer?
- Verifique sua conexão com a internet
- Recarregue a página
- Feche outras abas desnecessárias
- Entre em contato com o administrador se o problema persistir

### ❓ Não consigo acessar o sistema. O que pode ser?
- Verifique se você está online
- Confirme se a URL está correta
- Recarregue a página
- Tente em outro navegador
- Verifique se o sistema não está em manutenção

### ❓ Perdi dados que havia inserido. Como recuperar?
- Verifique se não há backup automático disponível
- Entre em contato com o administrador do sistema
- Verifique se os dados não estão em outro local do sistema

### ❓ O sistema está mostrando erros. O que fazer?
1. Anote a mensagem de erro exata
2. Tente recarregar a página
3. Limpe o cache do navegador
4. Se o problema persistir, crie um relatório através do sistema

### ❓ Como reportar bugs técnicos?
Use o sistema de relatórios:
1. Clique no ícone de alerta durante o uso
2. Selecione "Problema Técnico"
3. Descreva o problema detalhadamente
4. Inclua passos para reproduzir o erro

---

## Interface e Usabilidade

### ❓ Como alternar entre tema claro e escuro?
1. Acesse "Configurações" > "Temas e Interface"
2. Escolha o tema desejado
3. Ou use o botão de tema na barra lateral

### ❓ A barra lateral está muito larga/estreita. Como ajustar?
Clique no ícone de seta na parte superior da barra lateral para expandir ou contrair.

### ❓ Como navegar no sistema usando apenas o teclado?
- Use `Tab` para navegar entre elementos
- Use `Enter` para confirmar ações
- Use `Escape` para fechar modais
- Use as setas para navegar entre cards

### ❓ Posso personalizar a interface?
Atualmente, você pode alterar:
- Tema (claro/escuro)
- Perfil de cores
- Configurações de exibição

### ❓ O sistema funciona offline?
O sistema tem funcionalidades básicas offline quando instalado como PWA, mas para uso completo é necessária conexão com a internet.

---

## Segurança e Permissões

### ❓ Meus dados estão seguros?
Sim! O sistema utiliza:
- Criptografia de dados
- Autenticação segura
- Controle de acesso baseado em roles
- Backup automático

### ❓ Como são controladas as permissões?
O sistema usa Row Level Security (RLS) para garantir que cada usuário acesse apenas os dados permitidos para seu nível de permissão.

### ❓ Posso compartilhar minha conta com outros usuários?
Não! Cada usuário deve ter sua própria conta por questões de segurança e auditoria.

### ❓ Como é feita a auditoria de ações?
O sistema registra todas as ações importantes:
- Criação de vagas
- Edições realizadas
- Exclusões
- Logins e logouts

### ❓ O que acontece se suspeitar de uso indevido?
Entre em contato imediatamente com o administrador do sistema para investigação.

---

## Perguntas Frequentes Adicionais

### ❓ Posso usar o sistema em vários dispositivos?
Sim! Você pode acessar o sistema de qualquer dispositivo com internet e navegador compatível.

### ❓ Há limite de vagas que posso visualizar por página?
Sim, você pode escolher entre 10, 25 ou 50 vagas por página para otimizar a performance.

### ❓ Como atualizar o sistema?
O sistema verifica atualizações automaticamente e notifica quando há uma nova versão disponível.

### ❓ Posso instalar o sistema no meu computador?
Sim! O sistema é uma PWA (Progressive Web App) e pode ser instalado como aplicativo.

### ❓ O sistema funciona em tablets?
Sim! O sistema é totalmente responsivo e funciona perfeitamente em tablets.

### ❓ Como entrar em contato com suporte?
Use o sistema de relatórios integrado ou entre em contato com o administrador do sistema.

---

## Glossário de Termos

- **ADMIN**: Usuário com permissões administrativas completas
- **RH**: Usuário com permissões de Recursos Humanos
- **PWA**: Progressive Web App - aplicativo web que pode ser instalado
- **RLS**: Row Level Security - sistema de segurança no nível de linha
- **Scraping**: Extração automática de dados de websites
- **Performance**: Sistema otimizado para melhor performance

---

*FAQ atualizado em Janeiro 2025 - Versão 1.0*

**Para mais informações, consulte o [Manual do Usuário](MANUAL_USUARIO_DETALHADO.md)**
