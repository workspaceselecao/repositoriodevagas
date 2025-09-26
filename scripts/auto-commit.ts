#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CommitConfig {
  types: {
    [key: string]: {
      emoji: string;
      description: string;
      patterns: string[];
    };
  };
  scopes: {
    [key: string]: string[];
  };
}

class AutoCommit {
  private config: CommitConfig;

  constructor() {
    this.config = {
      types: {
        feat: {
          emoji: '✨',
          description: 'Nova funcionalidade',
          patterns: ['src/components/', 'src/hooks/', 'src/contexts/', 'app/']
        },
        fix: {
          emoji: '🐛',
          description: 'Correção de bug',
          patterns: ['src/', 'app/', 'scripts/']
        },
        docs: {
          emoji: '📚',
          description: 'Documentação',
          patterns: ['*.md', 'README.md', 'docs/']
        },
        style: {
          emoji: '💄',
          description: 'Formatação, espaços em branco, etc.',
          patterns: ['src/', '*.css', '*.scss', 'tailwind.config.ts']
        },
        refactor: {
          emoji: '♻️',
          description: 'Refatoração de código',
          patterns: ['src/', 'scripts/']
        },
        perf: {
          emoji: '⚡',
          description: 'Melhoria de performance',
          patterns: ['src/', 'scripts/']
        },
        test: {
          emoji: '🧪',
          description: 'Testes',
          patterns: ['test/', '*.test.ts', '*.test.tsx', '*.spec.ts']
        },
        build: {
          emoji: '🏗️',
          description: 'Sistema de build',
          patterns: ['package.json', 'vite.config.ts', 'tsconfig.json', 'tailwind.config.ts']
        },
        ci: {
          emoji: '👷',
          description: 'Integração contínua',
          patterns: ['.github/', 'vercel.json', '*.yml', '*.yaml']
        },
        chore: {
          emoji: '🔧',
          description: 'Tarefas de manutenção',
          patterns: ['scripts/', '*.sql', 'database/']
        },
        database: {
          emoji: '🗄️',
          description: 'Mudanças no banco de dados',
          patterns: ['database/', 'scripts/*.sql']
        },
        ui: {
          emoji: '🎨',
          description: 'Interface do usuário',
          patterns: ['src/components/', 'src/index.css', 'public/']
        },
        config: {
          emoji: '⚙️',
          description: 'Configurações',
          patterns: ['*.config.*', '.env*', 'components.json']
        },
        pwa: {
          emoji: '📱',
          description: 'Progressive Web App',
          patterns: ['manifest.json', 'manifest.webmanifest', 'sw.js', 'registerSW.js', 'vite.config.ts']
        }
      },
      scopes: {
        'auth': ['AuthContext', 'login', 'authentication'],
        'dashboard': ['dashboard', 'comparativo', 'configuracoes'],
        'vagas': ['vagas', 'jobs', 'emprego'],
        'database': ['database', 'supabase', 'schema'],
        'ui': ['components', 'ui', 'interface'],
        'api': ['api', 'endpoints', 'proxy'],
        'scripts': ['scripts', 'automation'],
        'build': ['build', 'vite', 'typescript'],
        'docs': ['documentation', 'readme', 'md'],
        'pwa': ['pwa', 'manifest', 'service-worker', 'sw']
      }
    };
  }

  private getChangedFiles(): string[] {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
      return output.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
      console.error('Erro ao obter arquivos alterados:', error);
      return [];
    }
  }

  private getUnstagedFiles(): string[] {
    try {
      const output = execSync('git diff --name-only', { encoding: 'utf-8' });
      return output.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
      return [];
    }
  }

  private analyzeFileChanges(files: string[]): { type: string; scope: string; description: string } {
    const typeScores: { [key: string]: number } = {};
    const scopeScores: { [key: string]: number } = {};

    // Analisar cada arquivo
    files.forEach(file => {
      // Determinar tipo baseado nos padrões
      Object.entries(this.config.types).forEach(([type, config]) => {
        config.patterns.forEach(pattern => {
          if (file.includes(pattern) || file.match(new RegExp(pattern.replace('*', '.*')))) {
            typeScores[type] = (typeScores[type] || 0) + 1;
          }
        });
      });

      // Determinar escopo baseado no caminho e nome do arquivo
      Object.entries(this.config.scopes).forEach(([scope, keywords]) => {
        keywords.forEach(keyword => {
          if (file.toLowerCase().includes(keyword.toLowerCase())) {
            scopeScores[scope] = (scopeScores[scope] || 0) + 1;
          }
        });
      });
    });

    // Determinar o tipo mais provável
    const bestType = Object.keys(typeScores).reduce((a, b) => 
      typeScores[a] > typeScores[b] ? a : b, 'chore'
    );

    // Determinar o escopo mais provável
    const bestScope = Object.keys(scopeScores).reduce((a, b) => 
      scopeScores[a] > scopeScores[b] ? a : b, ''
    );

    // Gerar descrição baseada nas mudanças
    const description = this.generateDescription(files, bestType);

    return {
      type: bestType,
      scope: bestScope,
      description
    };
  }

  private generateDescription(files: string[], type: string): string {
    const descriptions: { [key: string]: string[] } = {
      feat: [
        'Adiciona nova funcionalidade',
        'Implementa nova feature',
        'Adiciona componente',
        'Cria nova funcionalidade'
      ],
      fix: [
        'Corrige bug',
        'Resolve problema',
        'Corrige erro',
        'Ajusta funcionalidade'
      ],
      docs: [
        'Atualiza documentação',
        'Adiciona documentação',
        'Melhora documentação',
        'Corrige documentação'
      ],
      style: [
        'Ajusta formatação',
        'Melhora estilo',
        'Corrige formatação',
        'Atualiza estilos'
      ],
      refactor: [
        'Refatora código',
        'Melhora estrutura',
        'Otimiza código',
        'Reorganiza componentes'
      ],
      database: [
        'Atualiza schema',
        'Adiciona tabela',
        'Corrige banco de dados',
        'Melhora queries'
      ],
      ui: [
        'Melhora interface',
        'Atualiza componentes',
        'Ajusta layout',
        'Melhora UX'
      ],
      config: [
        'Atualiza configurações',
        'Ajusta configurações',
        'Melhora configurações',
        'Corrige configurações'
      ],
      pwa: [
        'Melhora PWA',
        'Atualiza manifest',
        'Corrige service worker',
        'Otimiza instalação'
      ],
      chore: [
        'Atualiza dependências',
        'Limpa código',
        'Organiza arquivos',
        'Melhora scripts'
      ]
    };

    const typeDescriptions = descriptions[type] || descriptions.chore;
    return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
  }

  private getCommitMessage(analysis: { type: string; scope: string; description: string }): string {
    const { type, scope, description } = analysis;
    const typeConfig = this.config.types[type];
    const emoji = typeConfig?.emoji || '🔧';
    
    let message = `${emoji} ${type}`;
    
    if (scope) {
      message += `(${scope})`;
    }
    
    message += `: ${description}`;
    
    return message;
  }

  private stageAllChanges(): void {
    try {
      execSync('git add .', { stdio: 'inherit' });
      console.log('✅ Arquivos adicionados ao stage');
    } catch (error) {
      console.error('❌ Erro ao adicionar arquivos ao stage:', error);
      process.exit(1);
    }
  }

  private commitChanges(message: string): void {
    try {
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
      console.log(`✅ Commit realizado: ${message}`);
    } catch (error) {
      console.error('❌ Erro ao fazer commit:', error);
      process.exit(1);
    }
  }

  private pushChanges(): void {
    try {
      execSync('git push', { stdio: 'inherit' });
      console.log('✅ Mudanças enviadas para o repositório remoto');
    } catch (error) {
      console.error('❌ Erro ao enviar mudanças:', error);
      process.exit(1);
    }
  }

  public async run(options: { 
    message?: string; 
    push?: boolean; 
    stage?: boolean;
    interactive?: boolean;
  } = {}): Promise<void> {
    console.log('🚀 Iniciando commit automático...\n');

    // Verificar se estamos em um repositório git
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Não é um repositório git válido');
      process.exit(1);
    }

    // Verificar se há mudanças
    const unstagedFiles = this.getUnstagedFiles();
    const stagedFiles = this.getChangedFiles();

    if (unstagedFiles.length === 0 && stagedFiles.length === 0) {
      console.log('ℹ️  Nenhuma mudança detectada');
      return;
    }

    // Se não há arquivos no stage, adicionar todos
    if (stagedFiles.length === 0 && unstagedFiles.length > 0) {
      if (options.stage !== false) {
        console.log('📦 Adicionando arquivos ao stage...');
        this.stageAllChanges();
      }
    }

    // Obter arquivos alterados
    const changedFiles = this.getChangedFiles();
    
    if (changedFiles.length === 0) {
      console.log('ℹ️  Nenhum arquivo no stage para commit');
      return;
    }

    console.log('📋 Arquivos alterados:');
    changedFiles.forEach(file => console.log(`  - ${file}`));
    console.log();

    // Gerar mensagem de commit
    let commitMessage: string;

    if (options.message) {
      commitMessage = options.message;
      console.log(`💬 Usando mensagem personalizada: ${commitMessage}`);
    } else {
      const analysis = this.analyzeFileChanges(changedFiles);
      commitMessage = this.getCommitMessage(analysis);
      console.log(`🤖 Mensagem gerada automaticamente: ${commitMessage}`);
    }

    // Modo interativo
    if (options.interactive) {
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise<string>((resolve) => {
        rl.question(`\nDeseja continuar com esta mensagem? (y/n/e para editar): `, resolve);
      });

      rl.close();

      if (answer.toLowerCase() === 'n') {
        console.log('❌ Commit cancelado');
        return;
      }

      if (answer.toLowerCase() === 'e') {
        const newMessage = await new Promise<string>((resolve) => {
          const rl2 = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          rl2.question('Digite a nova mensagem: ', resolve);
          rl2.close();
        });
        commitMessage = newMessage;
      }
    }

    // Fazer commit
    this.commitChanges(commitMessage);

    // Push se solicitado
    if (options.push) {
      console.log('\n📤 Enviando mudanças...');
      this.pushChanges();
    }

    console.log('\n🎉 Commit automático concluído com sucesso!');
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const options: any = {};

  // Parse argumentos
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--message':
      case '-m':
        options.message = args[++i];
        break;
      case '--push':
      case '-p':
        options.push = true;
        break;
      case '--no-stage':
        options.stage = false;
        break;
      case '--interactive':
      case '-i':
        options.interactive = true;
        break;
      case '--help':
      case '-h':
        console.log(`
🚀 Auto Commit - Script de commit automático e dinâmico

Uso: npm run commit [opções]

Opções:
  -m, --message <msg>    Mensagem personalizada para o commit
  -p, --push            Enviar mudanças para o repositório remoto
  --no-stage           Não adicionar arquivos automaticamente ao stage
  -i, --interactive     Modo interativo para confirmar/editar mensagem
  -h, --help           Mostrar esta ajuda

Exemplos:
  npm run commit                    # Commit automático
  npm run commit -m "fix: corrige bug"  # Commit com mensagem personalizada
  npm run commit -p                 # Commit e push
  npm run commit -i                 # Modo interativo
        `);
        process.exit(0);
        break;
    }
  }

  const autoCommit = new AutoCommit();
  await autoCommit.run(options);
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default AutoCommit;