# Logos RepoVagas - Documentação

## Visão Geral

Foram criados logos exclusivos para o RepoVagas seguindo as diretrizes de marca estabelecidas. Os logos refletem o conceito de "Repositório de Oportunidades" através de elementos visuais que representam organização, crescimento e conexão.

## Conceito Visual

### Metáfora Principal
- **Repositório**: Representado por camadas organizadas (containers)
- **Oportunidades**: Representado por elementos que "crescem" do repositório
- **Conexão**: Linhas que conectam o repositório ao crescimento

### Elementos Visuais
- **Camadas empilhadas**: Representam organização e estrutura
- **Cores da marca**: Azul primário (#2563EB) e Verde de destaque (#10B981)
- **Elementos de crescimento**: Linhas e pontos que sugerem expansão
- **Tipografia Inter**: Consistente com a identidade visual

## Variações de Logo

### 1. Logo Principal (`logo-repovagas-principal.svg`)
- **Dimensões**: 200x60px
- **Uso**: Cabeçalhos principais, documentos formais
- **Elementos**: Ícone + texto "RepoVagas" + tagline "Repositório de Oportunidades"
- **Versões**: Claro e escuro

### 2. Logo Compacto (`logo-repovagas-compacto.svg`)
- **Dimensões**: 120x40px
- **Uso**: Sidebar, navegação, espaços médios
- **Elementos**: Ícone + texto "RepoVagas"
- **Características**: Versão simplificada do logo principal

### 3. Logo Ícone (`logo-repovagas-icon.svg`)
- **Dimensões**: 48x48px
- **Uso**: Favicons, botões, contextos pequenos
- **Elementos**: Apenas o ícone em círculo
- **Características**: Máxima legibilidade em tamanhos pequenos

### 4. Logo Favicon (`logo-repovagas-favicon.svg`)
- **Dimensões**: 32x32px
- **Uso**: Favicon do navegador, PWA
- **Elementos**: Ícone otimizado para tamanho mínimo
- **Características**: Versão super compacta para máxima clareza

## Implementação

### Componente React Logo
```tsx
import Logo from './Logo'

// Exemplos de uso
<Logo variant="principal" width={200} height={60} />
<Logo variant="compacto" width={120} height={40} />
<Logo variant="icon" width={48} height={48} />
<Logo variant="favicon" width={32} height={32} />
```

### Características do Componente
- **Adaptação automática**: Muda automaticamente entre tema claro/escuro
- **Responsivo**: Dimensões flexíveis
- **Acessível**: Alt text incluído
- **Performático**: SVG otimizado

## Localização dos Arquivos

```
public/logos/
├── logo-repovagas-principal.svg      # Logo principal (tema claro)
├── logo-repovagas-principal-dark.svg # Logo principal (tema escuro)
├── logo-repovagas-compacto.svg       # Logo compacto
├── logo-repovagas-icon.svg           # Logo ícone
└── logo-repovagas-favicon.svg        # Logo favicon
```

## Implementações Realizadas

### 1. Página de Login
- Logo ícone centralizado
- Efeito hover com escala
- Integração com animações existentes

### 2. Sidebar do Dashboard
- Logo compacto quando expandida
- Logo ícone quando colapsada
- Transições suaves entre estados

### 3. Header de Páginas
- Componente Header reutilizável
- Logo compacto + título da página
- Informações do usuário

### 4. Favicon e PWA
- Favicon atualizado no HTML
- Ícones do manifest.json atualizados
- Cores do tema atualizadas para a marca

## Especificações Técnicas

### Formato
- **SVG**: Escalável e otimizado
- **Cores**: Definidas via CSS para fácil manutenção
- **Fontes**: Inter (Google Fonts)

### Acessibilidade
- **Alt text**: "RepoVagas - Repositório de Oportunidades"
- **Contraste**: Seguindo WCAG 2.1 AA
- **Responsividade**: Adaptável a diferentes tamanhos

### Performance
- **Tamanho**: SVGs otimizados (< 2KB cada)
- **Carregamento**: Assíncrono via componente React
- **Cache**: Servidos via CDN/browser cache

## Guia de Uso

### Quando usar cada variação:

#### Logo Principal
- Página de login
- Documentos formais
- Apresentações
- Marketing materials

#### Logo Compacto
- Sidebar do dashboard
- Headers de páginas
- Navegação principal
- Contextos de tamanho médio

#### Logo Ícone
- Favicon
- Botões de ação
- Contextos muito pequenos
- Aplicativo móvel

#### Logo Favicon
- Aba do navegador
- PWA
- Bookmarks
- Contextos de 32px ou menores

## Manutenção

### Atualizações de Cores
- Modificar variáveis CSS nos arquivos SVG
- Testar em ambos os temas (claro/escuro)
- Verificar contraste e legibilidade

### Novas Variações
- Seguir o padrão de nomenclatura existente
- Manter consistência visual
- Atualizar documentação

### Testes
- Verificar renderização em diferentes navegadores
- Testar responsividade
- Validar acessibilidade

## Cores Utilizadas

### Tema Claro
- **Azul Primário**: #2563EB
- **Verde de Destaque**: #10B981
- **Cinza Claro**: #F1F5F9
- **Cinza Escuro**: #334155

### Tema Escuro
- **Azul Primário**: #4A90E2 (mais claro)
- **Verde de Destaque**: #10B981 (mantido)
- **Cinza Claro**: #21516B
- **Cinza Escuro**: #E2E8F0

---

**Versão**: 1.0  
**Data**: Dezembro 2024  
**Status**: Implementado e em produção
