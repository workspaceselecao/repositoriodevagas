# 🚀 Sistema de Versionamento Automático

Este documento descreve o sistema completo de versionamento automático implementado no Repositório de Vagas.

## 📋 Visão Geral

O sistema de versionamento automático permite:
- ✅ Incremento automático de versões (semântico)
- ✅ Sincronização entre todos os arquivos de versão
- ✅ Geração automática de changelog
- ✅ Criação de tags git
- ✅ Processo completo de release

## 🛠️ Arquivos Envolvidos

### Arquivos de Versão
- `src/version.ts` - Versão principal da aplicação
- `package.json` - Versão do projeto npm
- `public/version.json` - Versão para verificação de atualizações

### Scripts
- `scripts/version-manager.ts` - Gerenciador de versões
- `scripts/release-manager.ts` - Gerenciador de releases
- `CHANGELOG.md` - Log de mudanças automático

## 🎯 Comandos Disponíveis

### Versionamento Básico

```bash
# Ver informações da versão atual
npm run version:info

# Verificar consistência entre arquivos
npm run version:check

# Incrementar versão patch (1.0.0 -> 1.0.1)
npm run version:patch

# Incrementar versão minor (1.0.0 -> 1.1.0)
npm run version:minor

# Incrementar versão major (1.0.0 -> 2.0.0)
npm run version:major

# Incrementar com descrição personalizada
npm run version:patch -- "Correção de bug crítico"
```

### Release Completo

```bash
# Release patch completo (testes + build + version + commit + push)
npm run release:patch

# Release minor com descrição
npm run release:minor --description "Nova funcionalidade de exportação"

# Release major pulando testes
npm run release:major --skip-tests

# Simular release sem aplicar mudanças
npm run release:patch --dry-run

# Ver último release
npm run release:last
```

## 📊 Versionamento Semântico

### Tipos de Versão

| Tipo | Descrição | Exemplo | Quando Usar |
|------|-----------|---------|-------------|
| **MAJOR** | Mudanças incompatíveis | 1.0.0 → 2.0.0 | Breaking changes, refatorações grandes |
| **MINOR** | Novas funcionalidades | 1.0.0 → 1.1.0 | Novas features, melhorias |
| **PATCH** | Correções de bugs | 1.0.0 → 1.0.1 | Bug fixes, pequenas correções |

### Convenções de Commit

O sistema analisa commits para categorizar mudanças:

```bash
# ✨ Adicionado (feat, add, new)
feat: adiciona nova funcionalidade de busca
add: implementa sistema de notificações

# 🔄 Alterado (refactor, update, melhora)
refactor: otimiza sistema de cache
update: melhora performance do dashboard

# 🐛 Corrigido (fix, bug, corrige)
fix: corrige erro de autenticação
bug: resolve problema de carregamento

# 🗑️ Removido (remove, delete)
remove: remove funcionalidade obsoleta
delete: limpa código não utilizado
```

## 🔄 Processo de Release

### Release Automático

O comando `npm run release` executa:

1. **Verificação** - Status do repositório
2. **Testes** - Execução de testes (se existirem)
3. **Linting** - Verificação de código
4. **Build** - Compilação da aplicação
5. **Versionamento** - Incremento da versão
6. **Changelog** - Geração automática
7. **Commit** - Commit das mudanças
8. **Tag** - Criação de tag git
9. **Push** - Envio para repositório

### Opções de Release

```bash
# Pular etapas específicas
npm run release:patch --skip-tests    # Pular testes
npm run release:patch --skip-build    # Pular build
npm run release:patch --skip-push     # Pular push

# Modo simulação
npm run release:patch --dry-run       # Simular sem aplicar

# Com descrição
npm run release:minor --description "Nova funcionalidade"
```

## 📝 Changelog Automático

### Geração Automática

O sistema gera automaticamente entradas no `CHANGELOG.md` baseado nos commits desde a última versão:

```markdown
## [1.0.5] - 2024-12-19

### ✨ Adicionado
- Nova funcionalidade de busca avançada
- Sistema de notificações em tempo real

### 🔄 Alterado
- Melhorada performance do dashboard
- Otimizado sistema de cache

### 🐛 Corrigido
- Corrigido erro de autenticação
- Resolvido problema de carregamento
```

### Categorização Inteligente

O sistema analisa commits e categoriza automaticamente:
- **feat/add/new** → ✨ Adicionado
- **fix/bug/corrige** → 🐛 Corrigido
- **refactor/update/melhora** → 🔄 Alterado
- **remove/delete** → 🗑️ Removido

## 🏷️ Tags Git

### Criação Automática

Cada release cria uma tag git:
```bash
git tag -a v1.0.5 -m "Release v1.0.5"
```

### Listagem de Tags

```bash
# Ver todas as tags
git tag -l

# Ver última tag
git describe --tags --abbrev=0

# Ver commits desde última tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

## 🔍 Verificação de Consistência

### Comando de Verificação

```bash
npm run version:check
```

Saída exemplo:
```
📦 Informações da Versão
   Versão atual: v1.0.4
   Data de build: 2024-12-19T10:30:00.000Z

🔍 Verificação de consistência:
   src/version.ts: v1.0.4 ✅
   package.json: v1.0.4 ✅
   public/version.json: v1.0.4 ✅
```

## 🚨 Troubleshooting

### Problemas Comuns

**1. Repositório não limpo**
```bash
# Verificar status
git status

# Fazer commit das mudanças
git add .
git commit -m "feat: preparação para release"
```

**2. Testes falhando**
```bash
# Executar testes manualmente
npm test

# Pular testes no release
npm run release:patch --skip-tests
```

**3. Build falhando**
```bash
# Executar build manualmente
npm run build

# Pular build no release
npm run release:patch --skip-build
```

**4. Erro de push**
```bash
# Verificar configuração do git
git remote -v

# Fazer push manual
git push
git push --tags
```

## 📚 Exemplos Práticos

### Cenário 1: Correção de Bug

```bash
# 1. Fazer correção
git add .
git commit -m "fix: corrige erro de validação de email"

# 2. Release patch
npm run release:patch

# Resultado: 1.0.4 -> 1.0.5
```

### Cenário 2: Nova Funcionalidade

```bash
# 1. Implementar feature
git add .
git commit -m "feat: adiciona sistema de backup automático"

# 2. Release minor
npm run release:minor --description "Sistema de backup automático"

# Resultado: 1.0.4 -> 1.1.0
```

### Cenário 3: Breaking Change

```bash
# 1. Refatoração grande
git add .
git commit -m "refactor: muda estrutura da API"

# 2. Release major
npm run release:major --description "Nova estrutura da API"

# Resultado: 1.0.4 -> 2.0.0
```

## 🎯 Boas Práticas

### 1. Commits Descritivos
```bash
# ✅ Bom
feat: adiciona sistema de notificações push
fix: corrige erro de validação de formulário
refactor: otimiza queries do banco de dados

# ❌ Ruim
fix bug
update
changes
```

### 2. Releases Frequentes
- Faça releases pequenos e frequentes
- Use patch para correções rápidas
- Use minor para novas funcionalidades
- Use major apenas para breaking changes

### 3. Testes Antes do Release
- Sempre execute testes antes do release
- Use `--dry-run` para simular primeiro
- Verifique se o build está funcionando

### 4. Documentação
- Mantenha o CHANGELOG.md atualizado
- Documente breaking changes claramente
- Use descrições descritivas nos releases

## 🔧 Configuração Avançada

### Personalizar Categorização

Para personalizar como os commits são categorizados, edite o arquivo `scripts/version-manager.ts`:

```typescript
// Adicionar novos padrões
if (lowerCommit.includes('security') || lowerCommit.includes('segurança')) {
  changes.security.push(commit)
}
```

### Integração com CI/CD

Para integrar com pipelines de CI/CD:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy
        run: npm run deploy
```

## 📞 Suporte

Para dúvidas ou problemas com o sistema de versionamento:

1. Verifique este documento
2. Execute `npm run version:check` para diagnóstico
3. Use `--dry-run` para simular antes de aplicar
4. Consulte os logs de erro para detalhes específicos

---

**Sistema de Versionamento v1.0.4** - Repositório de Vagas
