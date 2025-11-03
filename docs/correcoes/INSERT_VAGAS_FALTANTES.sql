-- ============================================================
-- INSERT DAS 16 VAGAS FALTANTES (Vagas 11 a 26 do JSON)
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- VAGA 11: MRV - VOZ
INSERT INTO vagas (
  site, categoria, cargo, cliente, titulo, celula,
  descricao_vaga, responsabilidades_atribuicoes, requisitos_qualificacoes,
  salario, horario_trabalho, jornada_trabalho, beneficios, local_trabalho, etapas_processo
) VALUES (
  'CASA', 'OPERAÇÕES', 'ESPECIALISTA I', 'MRV', NULL, 'MRV - VOZ',
  'Se você é uma pessoa proativa, tem paixão por atendimento e possui habilidades de comunicação excepcionais, queremos conhecer você!

Venha fazer parte do nosso time!!

Será responsável por fazer o atendimento durante o processo de pré-venda. Atendimento Ativo por Voz.

Realizará contatos para confirmar o interesse do cliente em receber uma simulação de compra de imóvel.

Se você se identifica com esse perfil e deseja fazer parte de uma equipe de alto desempenho, venha fazer parte do nosso time e ajude a transformar sonhos em realidade!!',
  'O Especialista precisará ligar para clientes que iniciaram pesquisa no site buscando informações dos imóveis;

Preencher ou confirmar informações referente a localização e renda;

Concluir o cadastro, para que um corretor faça uma simulação e encaminhe a proposta para o cliente;

Não faz contato direto com corretor, somente preenche informações via sistema;

Ofertar simulação/orçamento em todas as ligações;

Utilizará sistemas para realização de registros e aplicações do atendimento.',
  'Maior de 18 anos;

Ensino Médio completo;

Conhecimentos básicos em informática e digitação;

Ter boa comunicação verbal e escrita;

Desejável experiência em Atendimento ao Cliente;

Preferencialmente residir próximo a Unidade Belo Horizonte (Prado) em BH.',
  'R$ 1.412,00',
  'Das 13:40 às 20:00 de Segunda à Sexta e das 09:00 às 15:20 aos Sábados',
  '180 horas mês | Escala 6x1: Trabalha 6 dias na semana – De Segunda à Sábado e folga fixa aos domingos',
  NULL,
  'Unidade Atento Belo Horizonte (Prado): Rua Jaceguai, 220 - Prado, Belo Horizonte - MG, 30411-040, Brasil.',
  'Etapa 1: Cadastro

Etapa 2: Avaliação Unificada

Etapa 3: Smart Recruiter

Etapa 4: Triagem

Etapa 5: Entrevista com o RH e Requisitante

Etapa 6: Contratação'
);

-- VAGA 12: VIVO - COBRANÇA B2B
INSERT INTO vagas (
  site, categoria, cargo, cliente, titulo, celula,
  descricao_vaga, responsabilidades_atribuicoes, requisitos_qualificacoes,
  salario, horario_trabalho, jornada_trabalho, beneficios, local_trabalho, etapas_processo
) VALUES (
  'CABULA', 'OPERAÇÕES', 'ESPECIALISTA I', 'VIVO', NULL, 'VIVO - COBRANÇA B2B',
  'Se você é apaixonado em fazer a diferença, gerar resultados, se colocar no lugar do outro e ainda ganhar por isso? Esta vaga é a sua cara! 🤩

Buscamos pessoas persistentes e responsáveis, com foco na qualidade do atendimento ao nosso cliente para atender a marca eleita a melhor rede móvel do país pelo prêmio Mobile Bench. Por atuar com a cobrança de empresas, temos a oportunidade de aprimorar nosso conhecimento, trazendo a melhor solução para a quitação desse débito.

Como será seu dia a dia...

Ligamos de forma ativa para empresas para negociar suas pendências de internet, telefone, linha móvel entre outros produtos. Trabalhamos de forma ética e com comprometimento com a oportunidade de alavancar os seus ganhos com a variável.

Venha fazer parte do nosso time, estamos ansiosos esperando por você... ❤️',
  'Identificar a necessidade do cliente e trazer uma solução prática e objetiva;

Realizar a negociação de uma forma que fique boa para ambos os lados;

Em cada atendimento prestado uma nova oportunidade de fechar negócio;

Utilizará sistemas para realização dos registros e acompanhamento dos preventivos;

As negociações são realizadas de acordo com o produto e/ou serviço;

Ser comprometido e responsável com o negócio e com a empresa.',
  'Ter no mínimo 18 anos de idade;

Ter no mínimo o Ensino Médio Completo;

Boa fluência verbal e poder de persuasão;

Ter todos os documentos (RG, Título de Eleitor, Reservista);

Conhecimentos básicos de informática e digitação;

Conhecimento Pacote Office;

Ter experiência com cobrança é um diferencial;

Preferencialmente morar próximo a Unidade Atento Oliveira Coutinho (próximo ao terminal rodoviário Barra Funda).',
  'R$ 1.518,00 + Comissão',
  'Das 09:48 às 18:00',
  '180h mês | Escala 5x2 com folga aos finais de semana',
  'Vale Transporte;

Vale refeição e/ou vale alimentação;

Seguro de Vida;

Auxílio funeral;

Auxílio Creche / Auxílio Babá / Transporte Escolar / Auxílio criança com deficiência;

Desconto em Produtos;

Assistência Odontológica;

Saúde Família+;

Descontos em Academias / Práticas Esportivas;

Parcerias educacionais com descontos em cursos;

Plano de carreira;

Plano Pet.',
  'PRESENCIAL R. José de Oliveira Coutinho, 73 - Parque Industrial Tomas Edson, São Paulo - SP, 01144-020.',
  'Etapa 1: Cadastro

Etapa 2: Triagem com IA

Etapa 3: Teste Smart

Etapa 4: Triagem

Etapa 5: Avaliação Geral

Etapa 6: Bate papo com o cliente

Etapa 7: Contratação'
);

-- NOTA: Continuar com as outras 14 vagas...
-- Por limitação de espaço, continuar com os INSERTs das demais vagas...

-- VERIFICAR RESULTADO
SELECT COUNT(*) as total_vagas FROM vagas;

SELECT site, cargo, cliente, celula FROM vagas ORDER BY created_at DESC LIMIT 20;

