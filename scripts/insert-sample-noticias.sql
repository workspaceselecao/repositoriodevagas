-- ============================================================
-- NOTÍCIAS DE EXEMPLO - SISTEMA REPOSITÓRIO DE VAGAS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- Notícia 1: Lançamento Oficial
INSERT INTO noticias (titulo, conteudo, tipo, ativa, prioridade, created_by, created_at, updated_at)
VALUES (
  '🎉 Sistema Repositório de Vagas - Lançamento Oficial',
  'É com grande satisfação que anunciamos o lançamento oficial do Sistema Repositório de Vagas! Esta plataforma foi desenvolvida para centralizar e gerenciar todas as oportunidades de emprego de nossos clientes em um único lugar.

Principais funcionalidades disponíveis:
• Visualização de vagas por cliente, site, categoria e cargo
• Comparação lado a lado de até 3 clientes simultaneamente
• Filtros avançados para busca rápida e precisa
• Interface intuitiva e responsiva
• Exportação de dados em Excel e CSV
• Sistema de backup automático
• Painel administrativo completo

Explore todas as funcionalidades e aproveite ao máximo esta ferramenta que facilitará seu dia a dia!',
  'anuncio',
  true,
  'alta',
  (SELECT id FROM users WHERE email = 'roberio.gomes@atento.com' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Notícia 2: Sistema de Comparação
INSERT INTO noticias (titulo, conteudo, tipo, ativa, prioridade, created_by, created_at, updated_at)
VALUES (
  '📊 Sistema de Comparação de Vagas - Como Utilizar',
  'A funcionalidade de Comparação de Vagas permite analisar oportunidades de emprego de múltiplos clientes simultaneamente de forma eficiente e organizada.

Como usar:
1. Acesse a seção "Comparar Vagas" no menu principal
2. Selecione até 3 clientes diferentes para comparação
3. Aplique filtros específicos (categoria, cargo, site, etc.)
4. Visualize as vagas lado a lado e identifique oportunidades

Dicas importantes:
• Use os filtros para refinar sua busca
• Compare benefícios e requisitos entre diferentes posições
• Exporte os resultados para análise posterior
• Mantenha os filtros salvos para acesso rápido

Esta ferramenta foi desenvolvida para facilitar sua tomada de decisão!',
  'info',
  true,
  'media',
  (SELECT id FROM users WHERE email = 'roberio.gomes@atento.com' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Notícia 3: Segurança e Privacidade
INSERT INTO noticias (titulo, conteudo, tipo, ativa, prioridade, created_by, created_at, updated_at)
VALUES (
  '🔒 Segurança e Privacidade - Nossos Compromissos',
  'A segurança dos dados e a privacidade dos usuários são nossas principais prioridades. O Sistema Repositório de Vagas implementa as melhores práticas de segurança da informação.

Medidas de segurança implementadas:
• Autenticação robusta via Supabase Auth
• Políticas Row Level Security (RLS) para proteção de dados
• Criptografia de dados em trânsito e em repouso
• Backup automático diário de todas as informações
• Logs de auditoria para rastreamento de atividades
• Controle de acesso baseado em roles (ADMIN e RH)

Boas práticas recomendadas:
✓ Use senhas fortes e únicas
✓ Não compartilhe suas credenciais
✓ Faça logout ao sair do sistema
✓ Reporte qualquer atividade suspeita

Juntos, mantemos o sistema seguro e protegido!',
  'info',
  true,
  'alta',
  (SELECT id FROM users WHERE email = 'roberio.gomes@atento.com' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Notícia 4: Instalação do Aplicativo
INSERT INTO noticias (titulo, conteudo, tipo, ativa, prioridade, created_by, created_at, updated_at)
VALUES (
  '📱 Instalação e Acesso ao Aplicativo',
  'O Sistema Repositório de Vagas está disponível como aplicativo web responsivo, podendo ser acessado de qualquer dispositivo com conexão à internet.

Como instalar (Modo Web App):
1. Acesse o sistema através do navegador web
2. No Chrome/Edge: Menu → Instalar App ou "Adicionar à tela inicial"
3. No Firefox: Menu → Instalar como Aplicativo
4. No Safari: Compartilhar → Adicionar à Tela de Início

Requisitos do sistema:
• Navegador atualizado (Chrome, Edge, Firefox ou Safari)
• Conexão com internet
• JavaScript habilitado

Vantagens da instalação:
✅ Acesso rápido direto da tela inicial
✅ Funciona offline para consultas recentes
✅ Notificações push (em breve)
✅ Melhor desempenho e experiência

Tenha o Repositório de Vagas sempre à mão!',
  'info',
  true,
  'media',
  (SELECT id FROM users WHERE email = 'roberio.gomes@atento.com' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verificar notícias criadas
SELECT 
  id,
  titulo,
  tipo,
  prioridade,
  ativa,
  created_at
FROM noticias
WHERE created_at >= NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

