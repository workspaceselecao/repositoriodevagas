# 🚀 Auto Commit - Script de Commit Automático

Um script inteligente para automatizar commits no Git com análise automática de mudanças, geração de mensagens e validações.

## ✨ Funcionalidades

- **Análise Automática**: Detecta automaticamente o tipo de mudança baseado nos arquivos modificados
- **Geração de Mensagens**: Cria mensagens de commit seguindo padrões convencionais
- **Validação**: Valida mensagens de commit com regras configuráveis
- **Hooks**: Suporte a hooks pre e post commit
- **Configuração Flexível**: Arquivo de configuração personalizável
- **Modo Interativo**: Permite editar mensagens antes do commit
- **Múltiplas Opções**: Push automático, staging, etc.

## 🛠️ Instalação

O script já está configurado no projeto. Para usar:

```bash
npm run commit
```

## 📋 Uso Básico

### Commit Automático
```bash
npm run commit
```

### Commit com Mensagem Personalizada
```bash
npm run commit -m "fix: corrige bug no login"
```

### Commit e Push
```bash
npm run commit -p
```

### Modo Interativo
```bash
npm run commit -i
```

## ⚙️ Opções Disponíveis

| Opção | Descrição |
|-------|-----------|
| `-m, --message <msg>` | Mensagem personalizada para o commit |
| `-p, --push` | Enviar mudanças para o repositório remoto |
| `--no-stage` | Não adicionar arquivos automaticamente ao stage |
| `-i, --interactive` | Modo interativo para confirmar/editar mensagem |
| `--skip-hooks` | Pular execução de hooks pre/post commit |
| `--skip-validation` | Pular validação da mensagem de commit |
| `--init-config` | Criar arquivo de configuração inicial |
| `-h, --help` | Mostrar ajuda |

## 🔧 Configuração

### Criar Arquivo de Configuração

```bash
npm run commit --init-config
```

Isso criará um arquivo `.auto-commit.json` na raiz do projeto.

### Estrutura da Configuração

```json
{
  "types": {
    "feat": {
      "emoji": "✨",
      "description": "Nova funcionalidade",
      "patterns": ["src/components/", "src/hooks/"]
    }
  },
  "scopes": {
    "auth": ["AuthContext", "login", "authentication"]
  },
  "hooks": {
    "preCommit": ["npm run lint"],
    "postCommit": []
  },
  "validation": {
    "maxMessageLength": 100,
    "minMessageLength": 10,
    "requireScope": false,
    "allowedTypes": ["feat", "fix", "docs"]
  },
  "conventional": {
    "enabled": true,
    "breakingChangePrefix": "BREAKING CHANGE:"
  }
}
```

### Tipos de Commit Suportados

- `feat` ✨ - Nova funcionalidade
- `fix` 🐛 - Correção de bug
- `docs` 📚 - Documentação
- `style` 💄 - Formatação, espaços em branco
- `refactor` ♻️ - Refatoração de código
- `perf` ⚡ - Melhoria de performance
- `test` 🧪 - Testes
- `build` 🏗️ - Sistema de build
- `ci` 👷 - Integração contínua
- `chore` 🔧 - Tarefas de manutenção
- `database` 🗄️ - Mudanças no banco de dados
- `ui` 🎨 - Interface do usuário
- `config` ⚙️ - Configurações

## 🎯 Como Funciona

1. **Análise de Arquivos**: O script analisa os arquivos modificados
2. **Detecção de Tipo**: Determina o tipo de commit baseado nos padrões
3. **Geração de Escopo**: Identifica o escopo das mudanças
4. **Criação da Mensagem**: Gera mensagem seguindo padrões convencionais
5. **Validação**: Valida a mensagem conforme regras configuradas
6. **Hooks Pre-Commit**: Executa comandos antes do commit
7. **Commit**: Realiza o commit com a mensagem gerada
8. **Hooks Post-Commit**: Executa comandos após o commit
9. **Push**: Envia mudanças se solicitado

## 🔍 Exemplos de Uso

### Desenvolvimento Diário
```bash
# Commit automático com análise inteligente
npm run commit

# Commit rápido sem hooks (útil durante desenvolvimento)
npm run commit --skip-hooks

# Commit com push automático
npm run commit -p
```

### Correções e Hotfixes
```bash
# Commit de correção com mensagem específica
npm run commit -m "fix: corrige erro crítico no login"

# Commit e push imediato
npm run commit -m "hotfix: corrige vulnerabilidade" -p
```

### Desenvolvimento de Features
```bash
# Commit interativo para revisar mensagem
npm run commit -i

# Commit de feature com push
npm run commit -m "feat: adiciona sistema de notificações" -p
```

## 🚨 Validações

O script inclui várias validações:

- **Comprimento da Mensagem**: Configurável via `validation.maxMessageLength` e `validation.minMessageLength`
- **Tipos Permitidos**: Lista de tipos válidos em `validation.allowedTypes`
- **Escopo Obrigatório**: Pode ser exigido via `validation.requireScope`
- **Formato Convencional**: Segue padrões de Conventional Commits

## 🔗 Hooks

### Pre-Commit
Executados antes do commit. Se falharem, o commit é cancelado.

```json
{
  "hooks": {
    "preCommit": [
      "npm run lint",
      "npm run test",
      "npm run build"
    ]
  }
}
```

### Post-Commit
Executados após o commit bem-sucedido.

```json
{
  "hooks": {
    "postCommit": [
      "npm run deploy:staging",
      "echo 'Commit realizado com sucesso!'"
    ]
  }
}
```

## 🎨 Personalização

### Adicionar Novos Tipos
```json
{
  "types": {
    "security": {
      "emoji": "🔒",
      "description": "Correções de segurança",
      "patterns": ["src/auth/", "src/security/"]
    }
  }
}
```

### Adicionar Novos Escopos
```json
{
  "scopes": {
    "payment": ["payment", "billing", "stripe"],
    "notification": ["notification", "email", "sms"]
  }
}
```

### Configurar Validações
```json
{
  "validation": {
    "maxMessageLength": 72,
    "minMessageLength": 5,
    "requireScope": true,
    "allowedTypes": ["feat", "fix", "docs"]
  }
}
```

## 🐛 Solução de Problemas

### Erro: "Não é um repositório git válido"
- Certifique-se de estar em um diretório com repositório Git inicializado

### Erro: "Mensagem de commit inválida"
- Verifique as regras de validação na configuração
- Use `--skip-validation` para pular validações temporariamente

### Hooks Falhando
- Verifique se os comandos nos hooks existem e funcionam
- Use `--skip-hooks` para pular hooks temporariamente

### Arquivo de Configuração Não Encontrado
- Execute `npm run commit --init-config` para criar o arquivo
- Verifique se o arquivo `.auto-commit.json` está na raiz do projeto

## 📚 Recursos Adicionais

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

## 🤝 Contribuição

Para contribuir com melhorias no script:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste thoroughly
5. Faça um commit usando o próprio script
6. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
