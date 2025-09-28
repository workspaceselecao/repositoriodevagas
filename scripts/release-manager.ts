#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface ReleaseOptions {
  type: 'patch' | 'minor' | 'major'
  description?: string
  skipTests?: boolean
  skipBuild?: boolean
  skipPush?: boolean
  dryRun?: boolean
}

class ReleaseManager {
  private projectRoot: string

  constructor() {
    this.projectRoot = process.cwd()
  }

  /**
   * Executa comandos com tratamento de erro
   */
  private execCommand(command: string, options: { cwd?: string; stdio?: 'inherit' | 'pipe' } = {}): string {
    try {
      return execSync(command, { 
        encoding: 'utf-8', 
        cwd: options.cwd || this.projectRoot,
        stdio: options.stdio || 'pipe'
      }).trim()
    } catch (error) {
      console.error(`❌ Erro ao executar comando: ${command}`)
      throw error
    }
  }

  /**
   * Verifica se o repositório está limpo
   */
  private checkRepositoryStatus(): void {
    console.log('🔍 Verificando status do repositório...')
    
    const status = this.execCommand('git status --porcelain')
    if (status) {
      console.log('⚠️ Repositório possui mudanças não commitadas:')
      console.log(status)
      throw new Error('Repositório deve estar limpo antes do release')
    }
    
    console.log('✅ Repositório está limpo')
  }

  /**
   * Executa testes (se existirem)
   */
  private runTests(): void {
    console.log('🧪 Executando testes...')
    
    try {
      // Verificar se existe script de teste
      const packageJson = JSON.parse(readFileSync(join(this.projectRoot, 'package.json'), 'utf-8'))
      
      if (packageJson.scripts?.test) {
        this.execCommand('npm test', { stdio: 'inherit' })
        console.log('✅ Testes passaram')
      } else {
        console.log('ℹ️ Nenhum script de teste encontrado, pulando...')
      }
    } catch (error) {
      console.warn('⚠️ Testes falharam ou não foram encontrados')
      throw error
    }
  }

  /**
   * Executa linting
   */
  private runLint(): void {
    console.log('🔍 Executando linting...')
    
    try {
      this.execCommand('npm run lint', { stdio: 'inherit' })
      console.log('✅ Linting passou')
    } catch (error) {
      console.warn('⚠️ Linting falhou')
      throw error
    }
  }

  /**
   * Executa build
   */
  private runBuild(): void {
    console.log('🏗️ Executando build...')
    
    try {
      this.execCommand('npm run build', { stdio: 'inherit' })
      console.log('✅ Build concluído')
    } catch (error) {
      console.error('❌ Build falhou')
      throw error
    }
  }

  /**
   * Executa o processo de versionamento
   */
  private bumpVersion(type: 'patch' | 'minor' | 'major', description?: string): void {
    console.log(`📦 Incrementando versão ${type}...`)
    
    try {
      const command = description 
        ? `npm run version:${type} -- "${description}"`
        : `npm run version:${type}`
      
      this.execCommand(command, { stdio: 'inherit' })
      console.log('✅ Versão incrementada')
    } catch (error) {
      console.error('❌ Erro ao incrementar versão')
      throw error
    }
  }

  /**
   * Faz commit das mudanças
   */
  private commitChanges(): void {
    console.log('📝 Fazendo commit das mudanças...')
    
    try {
      this.execCommand('git add .', { stdio: 'inherit' })
      this.execCommand('npm run commit', { stdio: 'inherit' })
      console.log('✅ Mudanças commitadas')
    } catch (error) {
      console.error('❌ Erro ao fazer commit')
      throw error
    }
  }

  /**
   * Faz push das mudanças e tags
   */
  private pushChanges(): void {
    console.log('📤 Enviando mudanças...')
    
    try {
      this.execCommand('git push', { stdio: 'inherit' })
      this.execCommand('git push --tags', { stdio: 'inherit' })
      console.log('✅ Mudanças enviadas')
    } catch (error) {
      console.error('❌ Erro ao fazer push')
      throw error
    }
  }

  /**
   * Executa o processo completo de release
   */
  public async release(options: ReleaseOptions): Promise<void> {
    const { type, description, skipTests, skipBuild, skipPush, dryRun } = options
    
    console.log(`🚀 Iniciando processo de release ${type}...`)
    console.log(`📋 Modo: ${dryRun ? 'DRY RUN (simulação)' : 'REAL'}`)
    console.log(`📋 Descrição: ${description || 'Nenhuma'}`)
    console.log(`📋 Pular testes: ${skipTests ? 'Sim' : 'Não'}`)
    console.log(`📋 Pular build: ${skipBuild ? 'Sim' : 'Não'}`)
    console.log(`📋 Pular push: ${skipPush ? 'Sim' : 'Não'}\n`)

    try {
      // 1. Verificar status do repositório
      this.checkRepositoryStatus()

      // 2. Executar testes (se não pular)
      if (!skipTests) {
        this.runTests()
      }

      // 3. Executar linting
      this.runLint()

      // 4. Executar build (se não pular)
      if (!skipBuild) {
        this.runBuild()
      }

      // 5. Incrementar versão
      this.bumpVersion(type, description)

      // 6. Fazer commit (se não for dry run)
      if (!dryRun) {
        this.commitChanges()

        // 7. Fazer push (se não pular)
        if (!skipPush) {
          this.pushChanges()
        }
      }

      console.log('\n🎉 Release concluído com sucesso!')
      
      if (dryRun) {
        console.log('📋 Este foi um DRY RUN - nenhuma mudança foi aplicada')
        console.log('📋 Para executar o release real, remova a flag --dry-run')
      } else {
        console.log('📋 Release publicado com sucesso!')
        console.log('📋 Verifique o deploy automático se configurado')
      }

    } catch (error) {
      console.error('\n❌ Release falhou:', error)
      process.exit(1)
    }
  }

  /**
   * Mostra informações sobre o último release
   */
  public showLastRelease(): void {
    try {
      const lastTag = this.execCommand('git describe --tags --abbrev=0')
      const lastCommit = this.execCommand('git log -1 --pretty=format:"%h %s"')
      
      console.log('📦 Último Release:')
      console.log(`   Tag: ${lastTag}`)
      console.log(`   Commit: ${lastCommit}`)
      
      // Verificar se há commits desde o último release
      const commitsSince = this.execCommand(`git log ${lastTag}..HEAD --oneline`)
      if (commitsSince) {
        console.log(`\n📋 Commits desde último release:`)
        commitsSince.split('\n').forEach(commit => {
          console.log(`   - ${commit}`)
        })
      } else {
        console.log('\n✅ Nenhum commit desde o último release')
      }
    } catch (error) {
      console.error('❌ Erro ao obter informações do último release:', error)
    }
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2)
  const releaseManager = new ReleaseManager()

  if (args.length === 0) {
    console.log(`
🚀 Release Manager - Sistema de release automático

Uso: npm run release [tipo] [opções]

Tipos:
  patch     Release de patch (1.0.0 -> 1.0.1)
  minor     Release menor (1.0.0 -> 1.1.0)
  major     Release maior (1.0.0 -> 2.0.0)

Opções:
  --description "texto"    Descrição do release
  --skip-tests           Pular execução de testes
  --skip-build           Pular build da aplicação
  --skip-push            Pular push para repositório
  --dry-run              Simular release sem aplicar mudanças
  --last                 Mostrar informações do último release

Exemplos:
  npm run release patch
  npm run release minor --description "Nova funcionalidade"
  npm run release major --skip-tests --dry-run
  npm run release --last
    `)
    return
  }

  if (args[0] === '--last') {
    releaseManager.showLastRelease()
    return
  }

  const type = args[0] as 'patch' | 'minor' | 'major'
  if (!['patch', 'minor', 'major'].includes(type)) {
    console.error(`❌ Tipo de release inválido: ${type}`)
    process.exit(1)
  }

  const options: ReleaseOptions = {
    type,
    skipTests: args.includes('--skip-tests'),
    skipBuild: args.includes('--skip-build'),
    skipPush: args.includes('--skip-push'),
    dryRun: args.includes('--dry-run')
  }

  // Extrair descrição
  const descIndex = args.indexOf('--description')
  if (descIndex !== -1 && args[descIndex + 1]) {
    options.description = args[descIndex + 1]
  }

  await releaseManager.release(options)
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export default ReleaseManager
