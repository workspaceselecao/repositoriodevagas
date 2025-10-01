# Diretrizes de Marca - RepoVagas

## 1. Nome e Arquitetura de Marca

### Marca Principal
**Repositório de Vagas** - Nome completo usado em contextos formais

### Marca de Apresentação / Slogan
**RepoVagas** - Forma abreviada, moderna e amigável

### Uso Recomendado

- **"Repositório de Vagas"** deve ser usado em:
  - Site principal
  - Documentos legais
  - Comunicação inicial para deixar claro o propósito
  - Página de login
  - Títulos principais

- **"RepoVagas"** é ideal para:
  - Identidade visual principal do logotipo
  - Favicon
  - Aplicativo móvel
  - Redes sociais
  - Referências casuais

## 2. Conceito Central e Metáfora Visual

### Conceito Principal
A identidade gira em torno da fusão de dois conceitos:
- **Repositório**: Organização, confiabilidade, estrutura
- **Oportunidade**: Conexão, crescimento, futuro

### Metáfora Visual
**"Repositório de Oportunidades"** - onde os candidatos encontram não apenas vagas, mas o próximo passo em suas carreiras.

### Linguagem de Marca
- Substituir "vagas" por "oportunidades" sempre que possível
- Usar "oportunidades profissionais" em contextos mais formais
- Manter consistência na narrativa de crescimento e desenvolvimento

## 3. Especificações de Design

### Paleta de Cores (Versão Final)

#### Cores Primárias
- **Azul Primário**: `#2563EB`
  - Uso: Elementos principais, botões, links
  - Significado: Confiança, Tecnologia, Profissionalismo

- **Verde de Destaque**: `#10B981`
  - Uso: Sucessos, confirmações, elementos de destaque
  - Significado: Sucesso, Crescimento, Confirmação

#### Cores de Texto
- **Cinza Escuro**: `#334155`
  - Uso: Texto principal
  - Significado: Legibilidade e acessibilidade

- **Cinza Médio**: `#64748B`
  - Uso: Texto secundário
  - Significado: Hierarquia visual

#### Cores de Fundo
- **Cinza Claro**: `#F1F5F9`
  - Uso: Fundos e espaços negativos
  - Significado: Limpeza e organização

### Implementação CSS

#### Variáveis CSS Personalizadas
```css
:root {
  /* Paleta de Cores RepoVagas - Tema Claro */
  --primary: 221 83% 53%; /* #2563EB */
  --success: 158 64% 52%; /* #10B981 */
  --foreground: 215 25% 27%; /* #334155 */
  --muted-foreground: 215 16% 47%; /* #64748B */
  --secondary: 210 40% 98%; /* #F1F5F9 */
  
  /* Cores específicas da marca RepoVagas */
  --repovagas-primary: #2563EB;
  --repovagas-success: #10B981;
  --repovagas-text-primary: #334155;
  --repovagas-text-secondary: #64748B;
  --repovagas-bg-light: #F1F5F9;
}
```

#### Classes Tailwind Customizadas
```css
/* Cores específicas da marca RepoVagas */
.repovagas-primary { color: #2563EB; }
.repovagas-success { color: #10B981; }
.repovagas-text-primary { color: #334155; }
.repovagas-text-secondary { color: #64748B; }
.repovagas-bg-light { background-color: #F1F5F9; }
```

### Tipografia

#### Fonte Primária: Inter
- **Justificativa**: Extremamente legível em todas as telas, possui uma ampla família de pesos e transmite uma neutralidade profissional e moderna.

#### Hierarquia Tipográfica
- **Logotipo**: Inter SemiBold (600) + letter-spacing: -0.025em
- **Cabeçalhos**: Inter SemiBold (600) + letter-spacing: -0.025em
- **Corpo do Texto**: Inter Regular (400)

#### Implementação CSS
```css
/* Importação da fonte */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Hierarquia tipográfica RepoVagas */
.font-logo {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.font-heading {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.font-body {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 400;
}

.font-medium {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 500;
}
```

## 4. Implementação no Sistema

### Componentes Atualizados

#### Página de Login
- Título: "Repositório de Vagas"
- Subtítulo: "Seu repositório de oportunidades profissionais"
- Logo com cores da marca (#2563EB)

#### Menu Principal
- "Lista de Vagas" → "Oportunidades"
- "Nova Vaga" → "Nova Oportunidade"

#### Páginas de Conteúdo
- Títulos usando hierarquia tipográfica Inter
- Cores da marca aplicadas consistentemente
- Linguagem de "oportunidades" em vez de "vagas"

#### Mensagens do Sistema
- "Vaga criada com sucesso!" → "Oportunidade criada com sucesso!"
- "Carregando vagas..." → "Carregando oportunidades..."

### Tema Escuro
- Adaptação das cores da marca para tema escuro
- Manutenção da identidade visual em ambos os temas
- Contraste adequado para acessibilidade

## 5. Guia de Uso

### Quando usar "Repositório de Vagas"
- Página de login
- Títulos principais da aplicação
- Documentação formal
- Comunicação inicial

### Quando usar "RepoVagas"
- Referências casuais
- Redes sociais
- Favicon
- Aplicativo móvel

### Quando usar "Oportunidades"
- Menu de navegação
- Botões de ação
- Mensagens do sistema
- Conteúdo interno

### Quando usar "Vagas"
- Manter em contextos técnicos
- Campos de banco de dados
- APIs internas
- Documentação técnica

## 6. Manutenção da Marca

### Checklist de Consistência
- [ ] Todas as cores seguem a paleta definida
- [ ] Tipografia Inter aplicada consistentemente
- [ ] Linguagem de "oportunidades" usada apropriadamente
- [ ] Logo e identidade visual alinhados
- [ ] Tema claro e escuro implementados
- [ ] Acessibilidade mantida

### Atualizações Futuras
- Sempre consultar este documento antes de alterações visuais
- Manter consistência com as diretrizes estabelecidas
- Testar em ambos os temas (claro/escuro)
- Verificar acessibilidade e contraste

---

**Versão**: 1.0  
**Data**: Dezembro 2024  
**Status**: Implementado
