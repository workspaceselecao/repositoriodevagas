-- Script SQL para remover vagas atuais e inserir todas as vagas do REPOSITORIO.json
-- Execute este script no SQL Editor do Supabase

-- 1. Remover todas as vagas existentes
DELETE FROM vagas;

-- 2. Inserir todas as vagas do REPOSITORIO.json
INSERT INTO vagas (site, categoria, cargo, cliente, produto, descricao_vaga, responsabilidades_atribuicoes, requisitos_qualificacoes, salario, horario_trabalho, jornada_trabalho, beneficios, local_trabalho, etapas_processo, created_at, updated_at) VALUES

-- Vaga 1: URUGUAI - REDE
('URUGUAI', 'OPERAÇÕES', 'ESPECIALISTA I', 'REDE', 'REDE - LINHA DIRETA', 
'Quer levar sua carreira para um novo nível? Acreditamos que o trabalho é mais do que um lugar, é um companheiro na sua jornada e, como sabemos que cada caminho é único, trabalhamos para criar oportunidades para todos! #VempraAtento Buscamos pessoas engajadas para encantar e garantir uma experiência incrível para o cliente em um atendimento do inicio ao fim, sendo resolutivos e humanos.',
'Realizar atendimento aos executivos, lojas e estabelecimentos que utilizam a maquininha de cartões; Tirar dúvidas relacionados ao financeiro, suporte ao time comercial do banco; Oferecer o atendimento humanizado, ou seja, focado nos sentimentos dos clientes.',
'Ter no mínimo 18 anos de idade; Ter no mínimo o Ensino Superior Cursando ou Concluído; Conhecimentos básicos em informática e digitação; Boa comunicação; Já ter realizado atendimento com máquinas de cartões e gostar de suporte comercial será um diferencial.',
'R$ 1.568,89 (90 dias) + R$ 1.750,00 + Premiação R$ 750,00', NULL, '200h mês | Escala 5x2 com folga fixa aos sábados e domingos', NULL, NULL, 'Cadastro, Teste Itaú – Primeira escolha, Smart Recruiter, Entrevista', NOW(), NOW()),

-- Vaga 2: CASA - VIVO
('CASA', 'OPERAÇÕES', 'ESPECIALISTA II', 'VIVO', 'VIVO - Telecom I', NULL,
'Prestar suporte ao cliente final em telefonia móvel; Controle do parque de linhas do cliente, manuseio de planilhas, interação com o cliente e configurações de aparelhos móveis.',
'Ter no mínimo 18 anos de idade; Comprovante de escolaridade do Ensino Médio ou Nível Superior; Ter Título de Eleitor; Ter Certificado Militar/Reservista (Exclusivo sexo masculino); Conhecimento em Informática; Pacote Office (Excel básico a intermediário); Facilidade com sistemas IOS e ANDROID.',
'R$ 1.568,89', 'Das 08:00 às 17:00', '200h mês | Escala 5x2 | Folgas aos sábados e domingos', NULL, NULL, 'Etapa 1: Cadastro, Etapa 2: Triagem com IA, Etapa 3: Avaliação Unificada, Etapa 4: Entrevista com o RH, Etapa 5: Contratação', NOW(), NOW()),

-- Vaga 3: CABULA - VIVO TRAMITAÇÃO
('CABULA', 'OPERAÇÕES', 'ESPECIALISTA I', 'VIVO', 'VIVO - TRAMITAÇÃO', NULL,
'Atendimento off-line; Foco no Cliente; Identificar as dúvidas apoiando nas tratativas contratuais de produtos de linha fixa (dados e voz).',
'Ter no mínimo 18 anos de idade; Ensino Médio Completo; Experiência em atendimento ao cliente; Boa comunicação verbal e escrita; Conhecimento em Pacote Office e habilidade em digitação; Empático, comunicação assertiva, analítico, gestão de conflitos, solucionador, atitude positiva e personalização.',
'R$ 1.627,77', NULL, '200h mês | Escala 6X1 com folga aos domingos', NULL, NULL, NULL, NOW(), NOW()),

-- Vaga 4: MADUREIRA - PLUXEE
('MADUREIRA', 'OPERAÇÕES', 'ESPECIALISTA II', 'PLUXEE', 'PLUXEE - Cartões de beneficio Pluxee', NULL,
'Atendimento ativo e receptivo a empresas interessadas nos produtos; Negociação de contratos e oferta de soluções completas; Acompanhamento do funil de vendas, retenção e pós-venda; Gestão da própria carteira e dos contratos vendidos.',
'Ter no mínimo 18 anos de idade; Ter no mínimo o Ensino Médio Completo; Desejável ter experiência em sondagem, argumentação e flexibilidade em atendimento nos canais ativos e receptivos; Conhecimentos básicos em informática e digitação; Experiência na área de vendas será um diferencial.',
'R$ 1.518,00 + Variável', 'Das 09h48 às 18h00', '180h mês | Escala 5x2 com folgas aos sábados e domingos', NULL, 'R. Líbero Badaró, 633 - Centro Histórico de São Paulo, São Paulo - SP, 01029-010, Brasil.', 'Etapa 1: Cadastro, Etapa 2: Triagem IA, Etapa 3: TESTE SMART, Etapa 4: Avaliação Unificada, Etapa 5: Triagem, Etapa 6: Entrevista com o RH, Etapa 7: Contratação', NOW(), NOW()),

-- Vaga 5: SÃO CAETANO DO SUL - PLUXEE BENEFÍCIOS
('SÃO CAETANO DO SUL', 'OPERAÇÕES', 'ESPECIALISTA I', 'PLUXEE', 'PLUXEE - BENEFÍCIOS', NULL,
'Negociação para credenciamento de produtos; Negociação de antecipação de recebíveis; O especialista precisará identificar a necessidade do cliente e trazer a melhor solução; Utilizará sistemas para realização de registros e acompanhamento das suas vendas.',
'Ter no mínimo 18 anos de idade; Ter no mínimo o Ensino Médio Completo; Desejável ter experiência em sondagem, argumentação e flexibilidade em atendimento nos canais ativos e receptivos; Conhecimentos básicos em informática e digitação; Experiência na área de vendas será um diferencial.',
'R$ 1.518,00 + Variável', 'Das 09h48 às 18h00', '180h mês | Escala 5x2 com folgas aos sábados e domingos', NULL, 'R. Líbero Badaró, 633 - Centro Histórico de São Paulo, São Paulo - SP, 01029-010, Brasil.', 'Etapa 1: Cadastro, Etapa 2: Triagem IA, Etapa 3: TESTE SMART, Etapa 4: Avaliação Unificada, Etapa 5: Triagem, Etapa 6: Entrevista com o RH, Etapa 7: Contratação', NOW(), NOW()),

-- Vaga 6: MADUREIRA - UNIMED
('MADUREIRA', 'OPERAÇÕES', 'ESPECIALISTA I', 'UNIMED', 'UNIMED - Ferj RH Empresas', 
'VAGA ABERTA: Atendimento PJ - Plano de Saúde. A gente acredita no poder de um bom atendimento!! Se você também acredita e quer ajudar empresas a terem a melhor experiência em planos de saúde, essa vaga é pra você!',
'Realizar atendimento receptivo por voz a clientes Pessoa Jurídica, com foco em escuta ativa, empatia e agilidade; Identificar as necessidades do cliente, esclarecer dúvidas e propor soluções eficazes; Executar procedimentos administrativos e contratuais em sistema.',
'Ter no mínimo 18 anos de idade; Ter no mínimo o Ensino Médio Completo; Boa comunicação verbal; Conhecimentos básicos em informática e digitação; Capacidade de lidar com diferentes perfis de clientes de forma empática e profissional.',
'R$ 1.242,00 (90 dias) + R$ 1.518,00', NULL, '180h mês | Escala 6x1 com folgas alternadas sábado ou domingo', NULL, 'Unidade Atento Del Castilho - Av. Dom Helder Câmara, 3203, Maria da Graça, Rio de Janeiro/RJ, CEP: 21050-454', 'Etapa 1: Cadastro, Etapa 2: Avaliação Unificada, Etapa 3: Smart Recruiter, Etapa 4: Triagem, Etapa 5: Entrevista com RH e Requisitante, Etapa 6: Contratação', NOW(), NOW()),

-- Vaga 7: SÃO BENTO - GPA
('SÃO BENTO', 'OPERAÇÕES', 'ESPECIALISTA II', 'GPA', 'GPA - GPA CONTROLLER', 
'Temos oportunidade de emprego chegando... 💥 Essa vaga é para você, que é apaixonado em fazer a diferença, gerar resultados, se colocar no lugar do outro e resolver problemas de forma rápida e efetiva, seu lugar é aqui! 😍',
'O especialista cobrará via sistema em tempo real chamados de manutenção das lojas, nível Brasil; As tratativas realizadas serão direcionadas para fornecedores/empresas que farão os reparos técnicos; Atuação junto aos analistas, coordenadores, gerentes regionais da companhia.',
'Ter no mínimo 18 anos de idade; Ter no mínimo o Ensino Médio Completo; Conhecimento com manutenção de lojas de varejo será um diferencial; Conhecimento em Office 365 e Excel; Boa comunicação; Pro atividade e senso de urgência.',
'R$1.518,00', '06:10/12:30, 17:20/23:40', '180h mês | Escala 6x1 - Folgas variáveis aos sábados ou domingos', 
'Vale Transporte; Vale refeição e/ou vale alimentação; Seguro de Vida; Auxílio funeral; Auxílio creche / Auxílio criança com deficiência / Auxílio Babá / Transporte Escolar; Desconto em Produtos; Assistência Odontológica; Saúde Família+; Descontos em Academias / Práticas Esportivas; Parcerias educacionais com descontos em cursos; Plano de carreira; Plano Pet.',
'Prédio do Cliente - Av. Brigadeiro Luis Antonio 2013, Bela Vista CEP 01317002 São Paulo.', 
'Etapa 1: Cadastro, Etapa 2: Triagem com IA, Etapa 3: Teste Smart, Etapa 3: Avaliação Unificada, Etapa 4: Avaliação de Redação, Etapa 5: Triagem, Etapa 6: Validação com o Requisitante, Etapa 7: Contratação', NOW(), NOW()),

-- Vaga 8: SÃO CAETANO DO SUL - MESSER
('SÃO CAETANO DO SUL', 'OPERAÇÕES', 'ESPECIALISTA I', 'MESSER', 'MESSER - MESSER', 
'Você é apaixonado(a) por desafios e adora enfrentá-los? Você quer proporcionar uma experiência incrível e ainda ganhar por isso? Esta vaga é a sua cara! 🤩',
'O operador precisará identificar a necessidade do cliente e trazer uma solução prática e objetiva, conforme procedimento do produto e/ou serviço; Em cada atendimento prestado, poderá tratar diferentes tipos de situações indicadas pelo cliente.',
'Ter no mínimo 18 anos de idade; Ter no mínimo o Ensino Médio Completo; Conhecimentos básicos em informática e digitação; Boa comunicação; Ter atuado na área de Atendimento ao Cliente será um diferencial.',
'R$ 1.518,00', '23:40/06:00, 12:20/18:40', '180h mês | Escala 6x1 com folga variável entre sábado/domingo',
'Vale Transporte; Vale refeição e/ou vale alimentação; Seguro de Vida; Auxílio funeral; Auxílio Creche / Auxílio Babá / Transporte Escolar / Auxílio criança com deficiência; Desconto em Produtos; Assistência Odontológica; Saúde Família+; Descontos em Academias / Práticas Esportivas; Parcerias educacionais com descontos em cursos; Plano de carreira; Plano Pet.',
'R. Voluntários da Pátria, 300 - Santana, São Paulo - SP, 01142-300, Brasil.',
'Etapa 1: Cadastro, Etapa 2: Triagem com IA, Etapa 3: Teste Smart, Etapa 4: Avaliação Unificada, Etapa 5: Triagem, Etapa 6: Entrevista com RH, Etapa 7: Contratação', NOW(), NOW()),

-- Vaga 9: DEL CASTILHO - UNIMED AGENDAMENTO
('DEL CASTILHO', 'OPERAÇÕES', 'ESPECIALISTA I', 'UNIMED', 'UNIMED - Agendamento', NULL,
'Atendimento Humanizado: Você terá contato com pessoas fragilizadas, doentes, com filhos, pais, avós internados, em tratamento de doenças graves, exames que vão conseguir diagnósticos sérios e tendo eles remarcados/cancelados. Então você precisa gostar de trabalhar com o acolhimento ao cliente, empatia e argumentação.',
'Ter no mínimo 18 anos de idade; Ensino Médio Completo; Conhecimentos básicos em informática e digitação; Perfil Analítico e ágil; Boa comunicação e argumentação; Senso de urgência e alta responsabilidade; Desejável experiência em Atendimento ao Cliente.',
'R$ 1.518,00', NULL, '180 horas mês | Escala 6x1 - Trabalha de Segunda a Sábado e folgas Fixas aos Domingos', NULL, 'Unidade Atento Belo Horizonte (Prado): Rua Jaceguai, 220 - Prado, Belo Horizonte - MG, 30411-040, Brasil.', 'Etapa 1: Cadastro, Etapa 2: Avaliação Unificada, Etapa 3: Smart Recruiter, Etapa 4: Triagem, Etapa 5: Validação com RH e Requisitante, Etapa 6: Contratação', NOW(), NOW()),

-- Vaga 10: URUGUAI - VIVO VENDAS B2C
('URUGUAI', 'OPERAÇÕES', 'ESPECIALISTA II', 'VIVO', 'VIVO - VENDAS B2C', 
'Temos oportunidade de emprego chegando... 💥💥💥 Você é do tipo que visualiza e responde? ✅✅ Essa vaga é para você, que é apaixonado em fazer a diferença, gerar resultados, se colocar no lugar do outro e resolver problemas de forma rápida e efetiva, seu lugar é aqui! 😍',
'O Especialista precisará identificar a necessidade do cliente e trazer uma solução prática e objetiva, conforme procedimento do produto e/ou serviço; Vendas de produtos e serviços; Em cada atendimento prestado, poderá tratar diferentes tipos de situações indicadas pelo cliente.',
'Ter no mínimo 18 anos de idade; Formação acadêmica: Ensino Médio Completo - Será um diferencial Nível Superior cursando ou completo; Comprovante de escolaridade do Ensino médio ou Nível Superior; Conhecimentos básicos em informática e digitação rápida.',
'R$ 1.518,00 + Variável', 'Manhã, Tarde, Noite', '180h mês | Escala 6x1 com folgas alternadas durante os finais de semana',
'Vale Transporte; Vale refeição e/ou vale alimentação; Seguro de Vida; Auxílio funeral; Auxílio creche/babá / Auxílio criança com deficiência/ Auxilio Transporte escolar; Desconto em Produtos; Assistência Odontológica; Assistência Médica; Descontos em Academias / Práticas Esportivas; Parcerias educacionais com descontos em cursos; Plano de carreira; Plano Saúde Pet.',
'Rua Serafim Constantino, 100 - Centro, São Caetano do Sul - SP, Brasil.',
'Etapa 1: Cadastro, Etapa 2: Triagem com IA, Etapa 3: TESTE COMPORTAMENTAL, Etapa 4: Avaliação Unificada Atento, Etapa 5: Teste Smart, Etapa 6: Teste de Digitação, Etapa 7: Triagem, Etapa 8: Entrevista com o Requisitante, Etapa 9: Contratação', NOW(), NOW()),

-- Vaga 11: CASA - MRV
('CASA', 'OPERAÇÕES', 'ESPECIALISTA I', 'MRV', 'MRV - VOZ', 
'Se você é uma pessoa proativa, tem paixão por atendimento e possui habilidades de comunicação excepcionais, queremos conhecer você! Será responsável por fazer o atendimento durante o processo de pré-venda. Atendimento Ativo por Voz.',
'O Especialista precisará ligar para clientes que iniciaram pesquisa no site buscando informações dos imóveis; Preencher ou confirmar informações referente a localização e renda; Concluir o cadastro, para que um corretor faça uma simulação e encaminhe a proposta para o cliente.',
'Maior de 18 anos; Ensino Médio completo; Conhecimentos básicos em informática e digitação; Ter boa comunicação verbal e escrita; Desejável experiência em Atendimento ao Cliente.',
'R$ 1.412,00', 'Das 13:40 às 20:00 de Segunda à Sexta e das 09:00 às 15:20 aos Sábados', '180 horas mês | Escala 6x1: Trabalha 6 dias na semana – De Segunda à Sábado e folga fixa aos domingos', NULL, 'Unidade Atento Belo Horizonte (Prado): Rua Jaceguai, 220 - Prado, Belo Horizonte - MG, 30411-040, Brasil.', 'Etapa 1: Cadastro, Etapa 2: Avaliação Unificada, Etapa 3: Smart Recruiter, Etapa 4: Triagem, Etapa 5: Entrevista com o RH e Requisitante, Etapa 6: Contratação', NOW(), NOW()),

-- Vaga 12: CABULA - VIVO COBRANÇA B2B
('CABULA', 'OPERAÇÕES', 'ESPECIALISTA I', 'VIVO', 'VIVO - COBRANÇA B2B', 
'Se você é apaixonado em fazer a diferença, gerar resultados, se colocar no lugar do outro e ainda ganhar por isso? Esta vaga é a sua cara! 🤩 Buscamos pessoas persistentes e responsáveis, com foco na qualidade do atendimento ao nosso cliente para atender a marca eleita a melhor rede móvel do país pelo prêmio Mobile Bench.',
'Identificar a necessidade do cliente e trazer uma solução prática e objetiva; Realizar a negociação de uma forma que fique boa para ambos os lados; Em cada atendimento prestado uma nova oportunidade de fechar negócio; Utilizará sistemas para realização dos registros e acompanhamento dos preventivos.',
'Ter no mínimo 18 anos de idade; Ter no mínimo o Ensino Médio Completo; Boa fluência verbal e poder de persuasão; Ter todos os documentos (RG, Título de Eleitor, Reservista); Conhecimentos básicos de informática e digitação; Conhecimento Pacote Office.',
'R$ 1.518,00 + Comissão', 'Das 09:48 às 18:00', '180h mês | Escala 5x2 com folga aos finais de semana',
'Vale Transporte; Vale refeição e/ou vale alimentação; Seguro de Vida; Auxílio funeral; Auxílio Creche / Auxílio Babá / Transporte Escolar / Auxílio criança com deficiência; Desconto em Produtos; Assistência Odontológica; Saúde Família+; Descontos em Academias / Práticas Esportivas; Parcerias educacionais com descontos em cursos; Plano de carreira; Plano Pet.',
'PRESENCIAL R. José de Oliveira Coutinho, 73 - Parque Industrial Tomas Edson, São Paulo - SP, 01144-020.',
'Etapa 1: Cadastro, Etapa 2: Triagem com IA, Etapa 3: Teste Smart, Etapa 4: Triagem, Etapa 5: Avaliação Geral, Etapa 6: Bate papo com o cliente, Etapa 7: Contratação', NOW(), NOW()),

-- Vaga 13: MADUREIRA - VIVO RETENÇÃO B2C
('MADUREIRA', 'OPERAÇÕES', 'ESPECIALISTA II', 'VIVO', 'VIVO - RETENÇÃO B2C', NULL,
'Atendimento de Solicitações de Cancelamento: Receber e tratar chamadas direcionadas para cancelamento de serviços, identificando a causa do pedido e buscando alternativas que possibilitem a retenção do cliente; Argumentação e Persuasão: Utilizar técnicas de negociação para tentar reverter a solicitação de cancelamento.',
'Ter no mínimo 18 anos de idade; Ter Título de Eleitor; Ter Certificado Militar/Reservista (Exclusivo sexo masculino); Comprovante de escolaridade do Ensino médio ou nível superior; Formação acadêmica: Ensino Médio completo; Boa fluência verbal e poder de persuasão.',
'R$ 1.242,00 nos 75 primeiros dias e após isso será de R$ 1.518,00 + Premiação de acordo com a atingimento de metas', 'Entradas entre 14:00, 14:30, 15:00 e 15:40 - (Último horário de saída será 22:00)', '180h mês | Escala 6x1 com folga variável.', NULL, NULL, 'Etapa 1: Cadastro, Etapa 2: Triagem com IA, Etapa 3: Teste de Perfil, Etapa 4: Teste Smart, Etapa 5: Avaliação Unificada Atento, Etapa 6: Entrevista com o Requisitante, Etapa 7: Contratação', NOW(), NOW()),

-- Vaga 14: SÃO CAETANO DO SUL - VIVO COBRANÇA B2B REC
('SÃO CAETANO DO SUL', 'OPERAÇÕES', 'ESPECIALISTA I', 'VIVO', 'VIVO - COBRANÇA B2B REC', 
'Temos oportunidade de emprego esperando por você... 😍 Essa vaga é para você, que é apaixonado em fazer a diferença, realizar um atendimento humanizado e com muita empatia! 😊 Atendimento ao cliente por voz Receptivo, para negociação de dívidas de produtos ou serviços da telefonia, internet, oferecendo ofertas especiais para pagamento.',
'O operador precisará identificar a necessidade do cliente e trazer uma solução prática e objetiva, conforme procedimento do produto e/ou serviço; Utilizará sistemas para realização de registros e aplicações do atendimento.',
'Ter no mínimo 18 anos de idade; Ter no mínimo o Ensino Médio Completo; Conhecimentos básicos em informática; Boa comunicação; Disponibilidade para realizar o treinamento em Home Office e Presencial.',
'R$ 1.518,00 + Variável de até R$ 200,00 (conforme indicadores)', 'Manhã/Tarde/Noite', '180h mês | Escala 6x1 - Folga Domingo',
'Vale Transporte; Vale refeição e/ou vale alimentação; Seguro de Vida; Auxílio funeral; Auxílio Creche / Auxílio Babá / Transporte Escolar / Auxílio criança com deficiência; Desconto em Produtos; Assistência Odontológica; Saúde Família+; Descontos em Academias / Práticas Esportivas; Parcerias educacionais com descontos em cursos; Plano de carreira; Plano Pet.',
'Rua Serafim Constantino, 100, e 136 parte, Centro, São Caetano do Sul/SP, CEP. 09510-220.',
'Etapa 1: Cadastro, Etapa 2: Triagem com IA, Etapa 3: Teste Smart, Etapa 4: Avaliação Unificada Atento, Etapa 5: Triagem, Etapa 6: Entrevista com o RH, Etapa 7: Contratação', NOW(), NOW()),

-- Vaga 15: MADUREIRA - VIVO VPE B2B BILINGUE
('MADUREIRA', 'OPERAÇÕES', 'ESPECIALISTA II', 'VIVO', 'VIVO - VPE B2B BILINGUE - MISSÃO CRÍTICA', 
'Atendimento Suporte Receptivo por e-mail e voz com clientes PJ de telefonia móvel, nacionais e internacionais que tenham alguma incidência técnica em voz ou dados. Vaga Presencial; Treinamento Online.',
'Identificar a necessidade do cliente sobre incidências técnicas; Classificar a criticidade do problema e registrar as solicitações de falhas técnicas, Buscar soluções e cumprir os prazos estabelecidos, dando a devolutiva para o cliente; Direcionar e acompanhar os chamados abertos para tratativa do II nível quando necessário.',
'Ter no mínimo 18 anos; Ter no mínimo o Ensino Médio Completo; Diferencial possuir curso técnico ou graduação em tecnologia; Ter habilidade em digitação e informática; Será um diferencial já ter atuado com Telefonia Móvel; Desejável Inglês avançado para escrita/leitura e compreensão verbal.',
'R$ 1.900,00', '6X1 06:00/12:20 SAB/DOM VARIAVEL, 6X1 12:20/18:40 SAB/DOM VARIAVEL', '180h mês | Escala 6x1 com folga variável sábado ou domingo',
'Vale Transporte; Vale refeição e/ou vale alimentação; Seguro de Vida; Auxílio funeral; Auxílio Creche / Auxílio Babá / Transporte Escolar / Auxílio criança com deficiência; Desconto em Produtos; Assistência Odontológica; Saúde Família+; Descontos em Academias / Práticas Esportivas; Parcerias educacionais com descontos em cursos; Plano de carreira; Plano Pet.',
'Central SCS | Rua Serafim Constantino 100, Centro e 136 São Caetano do Sul, SP, 09510-220',
'Etapa 1: Cadastro, Etapa 2: Triagem com IA, Etapa 3: TESTE SMART, Etapa 4: Avaliação Unificada, Etapa 5: Avaliação de Inglês, Etapa 6: Triagem, Etapa 7: Entrevista com o RH, Etapa 8: Validação com o Requisitante, Etapa 9: Contratação', NOW(), NOW()),

-- Vaga 16: SÃO BENTO - VIVO COBRANÇA OUT E CAC B2B
('SÃO BENTO', 'OPERAÇÕES', 'ESPECIALISTA I', 'VIVO', 'VIVO - COBRANÇA OUT E CAC B2B', 
'Temos oportunidade de emprego esperando por você... 😍 Essa vaga é para você, que é apaixonado em fazer a diferença, realizar um atendimento humanizado e com muita empatia! 😊 Atendimento ao cliente por voz Ativo e Receptivo, para negociação de dívidas de produtos ou serviços da telefonia, internet, oferecendo ofertas especiais para pagamento.',
'Atendimento ao cliente por voz Ativo e Receptivo, para negociação de dívidas de produtos ou serviços da telefonia, internet, oferecendo ofertas especiais para pagamento; O operador precisará identificar a necessidade do cliente e trazer uma solução prática e objetiva, conforme procedimento do produto e/ou serviço.',
'Ter no mínimo 18 anos de idade; Ter no mínimo o Ensino Médio Completo; Conhecimentos básicos em informática e digitação; Boa comunicação; Disponibilidade para realizar o treinamento de forma híbrida.',
'R$ 1.518,00 + Variável de até R$ 200,00 conforme indicadores', 'Das 09:48 às 18:00', '180h mês | Escala 5x2 Folga sábado e domingo',
'Vale Transporte; Vale refeição e/ou vale alimentação; Seguro de Vida; Auxílio funeral; Auxílio creche / Auxílio criança com deficiência / Auxílio Babá / Transporte Escolar; Desconto em Produtos; Assistência Odontológica; Serviço Família+; Descontos em Academias / Práticas Esportivas; Parcerias educacionais com descontos em cursos; Plano de carreira. PLANO PET',
'Rua Serafim Constantino, 100, e 136 parte, Centro, São Caetano do Sul/SP, CEP. 09510-220.',
'Etapa 1: Cadastro, Etapa 2: Triagem com IA, Etapa 3: Teste Smart, Etapa 4: Avaliação Unificada Atento, Etapa 5: Triagem, Etapa 6: Entrevista com o RH, Etapa 7: Contratação', NOW(), NOW()),

-- Vaga 17: SÃO CAETANO DO SUL - CONSULTING HOUSE
('SÃO CAETANO DO SUL', 'OPERAÇÕES', 'ESPECIALISTA II', 'CONSULTING HOUSE', 'CONSULTING HOUSE - Consulting House', NULL,
'Atualizar e construir os organogramas das empresas prospects e targets dos clientes da Agência de Relacionamento CH com atualização do Sales Force, pesquisa no Linked-in e redes sociais, Google (pesquisa do faturamento e demais informações); Cavam os contatos que estão com as informações incompletas e realizam a atualização de executivos "em transição" através do Linked-in para as novas empresas.',
'Desejável Superior Cursando ou Completo; Bons conhecimentos dos pacote Office (Excel, Word, PowerPoint e Outlook); Boa comunicação verbal e escrita; Conhecimento em redes sociais (para fim de clipagem e pesquisa do perfil dos clientes); Facilidade para trabalhar em equipe; Comprometimento; Organização.',
'R$ 1.518,00', 'Das 09h00 às 17h12', '180h mês | Escala 5x2 com folga sábado e domingo', NULL, 'Na primeira semana a atuação será no cliente (Moema - Alameda Maracatins, 426) e depois a atuação será na Atento Unidade Sede: R. Paul Valery, 255 - Santo Amaro, 04719-050, São Paulo, SP, Brasil', 'Etapa 1: Cadastro, Etapa 2: Triagem com IA, Etapa 3: Avaliação Unificada, Etapa 4: Triagem, Etapa 5: Entrevista RH/Requisitante, Etapa 6: Contratação', NOW(), NOW()),

-- Vaga 18: DEL CASTILHO - VIVO SAC B2B
('DEL CASTILHO', 'OPERAÇÕES', 'ESPECIALISTA I', 'VIVO', 'VIVO - sac b2b', NULL,
'O operador precisará identificar a necessidade do cliente e trazer uma solução prática e objetiva, conforme procedimento do produto e/ou serviço; Vendas de produtos e serviços; Tarefas Técnicas especificas: Atendimento Call Center para oferta de serviços ou produtos de telefonia de voz ou dados.',
'Ter no mínimo 18 anos de idade; Ensino Médio Completo; Boa fluência verbal e poder de persuasão; Habilidade de negociação/argumentação; Conhecimentos básicos em informática e digitação; Disponibilidade para realizar o treinamento Online; Ter computador ou notebook para realizar o treinamento.',
'R$ 1.242,00 nos primeiros 75 dias e após será de R$1.518,00 + Remuneração Variável', 'Horário de trabalho com saídas 20h30, 21H00 e 22H00', '180h mês | Escala 6x1 - folga variável',
'Vale Transporte; Vale refeição e/ou vale alimentação; Seguro de Vida; Auxílio funeral; Auxílio creche / Auxílio criança com deficiência; Desconto em Produtos; Assistência Odontológica; Assistência Médica; Descontos em Academias / Práticas Esportivas; Parcerias educacionais com descontos em cursos; Plano de carreira; Plano de Saúde Pet.',
'Praça Carlos Bahia, 19 - Centro, Feira de Santana - BA, 44002-780, Brasil.',
'Etapa 1: Cadastro, Etapa 2: Triagem com IA, Etapa 3: TESTE COMPORTAMENTAL, Etapa 4: Avaliação Unificada, Etapa 5: Teste Smart, Etapa 6: Triagem, Etapa 7: Entrevista com o RH, Etapa 8: Contratação', NOW(), NOW()),

-- Vaga 19: SÃO BENTO - GRUPO ITAU
('SÃO BENTO', 'OPERAÇÕES', 'ESPECIALISTA II', 'GRUPO ITAU', 'GRUPO ITAU - ATENA 180HRS', 
'Quer levar sua carreira para um novo nível? Acreditamos que o trabalho é mais do que um lugar, é um companheiro na sua jornada e, como sabemos que cada caminho é único, trabalhamos para criar oportunidades para todos! #VempraAtento Buscamos pessoas engajadas para encantar e garantir uma experiência incrível para o cliente em um atendimento do inicio ao fim, sendo resolutivos e humanos.',
'A central é receptivo com o atendimento por voz. Exemplos de assuntos atendidos: Cartão de crédito, fatura, desbloqueio de cartão. Assuntos relacionados exclusivos a cartão de crédito. Profissional com habilidade de comunicação, boa escrita, com perfil mais analítico pois será necessário atender demandas mais complexas que exigem maior conhecimento.',
'Ter mais de 18 anos; Ter no mínimo o Ensino Superior cursando ou completo; Boa comunicação; Protagonismo; Capacidade de adaptação; Conhecimento em Excel; Bons conhecimentos em informática e digitação.',
'Piso experiência 1572,50 após R$ 1.850,00', NULL, '180hrs – 5x2', NULL, NULL, 'Cadastro, Teste Itaú – Primeira escolha, Smart Recruiter, Entrevista', NOW(), NOW()),

-- Vaga 20: SÃO CAETANO DO SUL - BRADESCO
('SÃO CAETANO DO SUL', 'OPERAÇÕES', 'ESPECIALISTA I', 'BRADESCO', 'BRADESCO - Bradesco', 
'Atuação presencial nos postos de atendimento BAC.',
'Recepcionar e direcionar os clientes para as vagas de estacionamento no pátio do BAC, anexar o prisma no teto do veículo referente ao atendimento desejado. Atualizar diariamente as informações do cliente e tipo de atendimento. Montar o dossiê do atendimento do cliente para entrega à área responsável pela realização do serviço.',
'Ter no mínimo 18 anos de idade; Ter Título de Eleitor; Ter Certificado Militar/Reservista (Exclusivo sexo masculino); Formação acadêmica: Ensino Médio completo; Comprovante de escolaridade do Ensino médio; Boa fluência verbal e poder de persuasão; Possuir habilitação tipo B (Carro); Conhecimentos básicos de informática e digitação.',
'R$ 2062,06', 'Integral (08:12h às 18h)', '220h mês | Escala 5x2 Seg à Sex', NULL, 'Prédio do Cliente no Caju', 'Etapa 1: Cadastro, Etapa 2: Triagem, Etapa 3: Contratação', NOW(), NOW()),

-- Vaga 21: DEL CASTILHO - VIVO SUPERVISOR
('DEL CASTILHO', 'OPERAÇÕES', 'ESPECIALISTA II', 'VIVO', 'VIVO - S Supervisor', NULL,
'Acompanhamento de carteira e gestão de equipe de vendas; Organizar e acompanhar ações externas de vendas para equipe; Governança dos indicadores de vendas da equipe e acompanhamento de status destas vendas; Definição de rota e atuações de equipe de vendas; Monitorar e garantir qualidade das vendas realizadas pela equipe de vendas.',
'Desejável Ensino Superior Completo; Excel e Power Point nível intermediário; Capacidade analítica; Total capacidade de organização, objetividade e senso de urgência; Pro atividade, comprometimento e vontade de superar desafios; Visão de futuro para propor melhorias, mudanças e criação de processos; Boa fluência verbal para contato com clientes e outras áreas da empresa.',
'R$ 3.800,00 + Variável', '6x1 - Segunda a sábado, Segunda a sexta das 09hrs às 18hrs e aos sábados das 09hrs às 13hrs', NULL, NULL, NULL, NULL, NOW(), NOW());

-- Verificar resultado final
SELECT 
  COUNT(*) as total_vagas_inseridas,
  COUNT(DISTINCT cliente) as total_clientes,
  COUNT(DISTINCT site) as total_sites,
  COUNT(DISTINCT categoria) as total_categorias
FROM vagas;
