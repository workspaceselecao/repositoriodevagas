#!/usr/bin/env tsx

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

interface VersionInfo {
  version: string
  buildDate: string
  description?: string
}

interface ChangelogEntry {
  version: string
  date: string
  changes: {
    added?: string[]
    changed?: string[]
    fixed?: string[]
    removed?: string[]
  }
}

class VersionManager {
  private projectRoot: string
  private versionFiles: string[]
  private changelogPath: string

  constructor() {
    this.projectRoot = process.cwd()
    this.versionFiles = [
      'src/version.ts',
      'package.json',
      'public/version.json'
    ]
    this.changelogPath = join(this.projectRoot, 'CHANGELOG.md')
  }

  /**
   * Obtém a versão atual do arquivo principal
   */
  private getCurrentVersion(): string {
    try {
      const versionContent = readFileSync(join(this.projectRoot, 'src/version.ts'), 'utf-8')
      const match = versionContent.match(/export const APP_VERSION = "([^"]+)"/)
      return match ? match[1] : '1.0.0'
    } catch (error) {
      console.error('❌ Erro ao ler versão atual:', error)
      return '1.0.0'
    }
  }

  /**
   * Incrementa a versão baseado no tipo
   */
  private incrementVersion(currentVersion: string, type: 'major' | 'minor' | 'patch'): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number)
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`
      case 'minor':
        return `${major}.${minor + 1}.0`
      case 'patch':
        return `${major}.${minor}.${patch + 1}`
      default:
        throw new Error(`Tipo de versão inválido: ${type}`)
    }
  }

  /**
   * Atualiza o arquivo src/version.ts
   */
  private updateVersionFile(newVersion: string): void {
    const versionPath = join(this.projectRoot, 'src/version.ts')
    const content = readFileSync(versionPath, 'utf-8')
    
    const updatedContent = content.replace(
      /export const APP_VERSION = "[^"]+"/,
      `export const APP_VERSION = "${newVersion}"`
    ).replace(
      /export const BUILD_DATE = new Date\(\)\.toISOString\(\)/,
      `export const BUILD_DATE = "${new Date().toISOString()}"`
    )
    
    writeFileSync(versionPath, updatedContent)
    console.log(`✅ src/version.ts atualizado para v${newVersion}`)
  }

  /**
   * Atualiza o package.json
   */
  private updatePackageJson(newVersion: string): void {
    const packagePath = join(this.projectRoot, 'package.json')
    const packageContent = JSON.parse(readFileSync(packagePath, 'utf-8'))
    
    packageContent.version = newVersion
    writeFileSync(packagePath, JSON.stringify(packageContent, null, 2) + '\n')
    console.log(`✅ package.json atualizado para v${newVersion}`)
  }

  /**
   * Atualiza o public/version.json
   */
  private updatePublicVersion(newVersion: string, description?: string): void {
    const versionPath = join(this.projectRoot, 'public/version.json')
    const versionInfo: VersionInfo = {
      version: newVersion,
      buildDate: new Date().toISOString(),
      description: description || `Versão ${newVersion}`
    }
    
    writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2) + '\n')
    console.log(`✅ public/version.json atualizado para v${newVersion}`)
  }

  /**
   * Gera entrada do changelog baseada nos commits
   */
  private generateChangelogEntry(newVersion: string, previousVersion: string): ChangelogEntry {
    try {
      // Obter commits desde a última versão
      const commits = execSync(
        `git log --oneline --pretty=format:"%s" v${previousVersion}..HEAD 2>/dev/null || git log --oneline --pretty=format:"%s" -10`,
        { encoding: 'utf-8' }
      ).trim().split('\n').filter(commit => commit.length > 0)

      const changes = {
        added: [] as string[],
        changed: [] as string[],
        fixed: [] as string[],
        removed: [] as string[]
      }

      // Categorizar commits
      commits.forEach(commit => {
        const lowerCommit = commit.toLowerCase()
        
        if (lowerCommit.includes('feat') || lowerCommit.includes('add') || lowerCommit.includes('new')) {
          changes.added.push(commit)
        } else if (lowerCommit.includes('fix') || lowerCommit.includes('bug') || lowerCommit.includes('corrige')) {
          changes.fixed.push(commit)
        } else if (lowerCommit.includes('refactor') || lowerCommit.includes('update') || lowerCommit.includes('melhora')) {
          changes.changed.push(commit)
        } else if (lowerCommit.includes('remove') || lowerCommit.includes('delete')) {
          changes.removed.push(commit)
        } else {
          changes.changed.push(commit)
        }
      })

      return {
        version: newVersion,
        date: new Date().toISOString().split('T')[0],
        changes
      }
    } catch (error) {
      console.warn('⚠️ Erro ao gerar changelog:', error)
      return {
        version: newVersion,
        date: new Date().toISOString().split('T')[0],
        changes: {
          added: [],
          changed: [],
          fixed: [],
          removed: []
        }
      }
    }
  }

  /**
   * Atualiza o CHANGELOG.md
   */
  private updateChangelog(entry: ChangelogEntry): void {
    let changelogContent = ''
    
    if (existsSync(this.changelogPath)) {
      changelogContent = readFileSync(this.changelogPath, 'utf-8')
    }

    const newEntry = this.formatChangelogEntry(entry)
    
    // Adicionar nova entrada no topo
    const updatedChangelog = `# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

${newEntry}

${changelogContent.replace(/^# Changelog\s*\n/, '').replace(/^Todas as mudanças notáveis neste projeto serão documentadas neste arquivo\.\s*\n/, '')}`

    writeFileSync(this.changelogPath, updatedChangelog)
    console.log(`✅ CHANGELOG.md atualizado com v${entry.version}`)
  }

  /**
   * Formata uma entrada do changelog
   */
  private formatChangelogEntry(entry: ChangelogEntry): string {
    let formatted = `## [${entry.version}] - ${entry.date}\n\n`

    if (entry.changes.added.length > 0) {
      formatted += `### ✨ Adicionado\n\n`
      entry.changes.added.forEach(change => {
        formatted += `- ${change}\n`
      })
      formatted += '\n'
    }

    if (entry.changes.changed.length > 0) {
      formatted += `### 🔄 Alterado\n\n`
      entry.changes.changed.forEach(change => {
        formatted += `- ${change}\n`
      })
      formatted += '\n'
    }

    if (entry.changes.fixed.length > 0) {
      formatted += `### 🐛 Corrigido\n\n`
      entry.changes.fixed.forEach(change => {
        formatted += `- ${change}\n`
      })
      formatted += '\n'
    }

    if (entry.changes.removed.length > 0) {
      formatted += `### 🗑️ Removido\n\n`
      entry.changes.removed.forEach(change => {
        formatted += `- ${change}\n`
      })
      formatted += '\n'
    }

    return formatted
  }

  /**
   * Cria uma tag git para a nova versão
   */
  private createGitTag(version: string): void {
    try {
      execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' })
      console.log(`✅ Tag git v${version} criada`)
    } catch (error) {
      console.warn('⚠️ Erro ao criar tag git:', error)
    }
  }

  /**
   * Executa o processo de versionamento
   */
  public async bumpVersion(type: 'major' | 'minor' | 'patch', description?: string): Promise<void> {
    console.log(`🚀 Iniciando processo de versionamento ${type}...\n`)

    const currentVersion = this.getCurrentVersion()
    const newVersion = this.incrementVersion(currentVersion, type)

    console.log(`📋 Versão atual: v${currentVersion}`)
    console.log(`📋 Nova versão: v${newVersion}\n`)

    // Atualizar todos os arquivos de versão
    this.updateVersionFile(newVersion)
    this.updatePackageJson(newVersion)
    this.updatePublicVersion(newVersion, description)

    // Gerar changelog
    const changelogEntry = this.generateChangelogEntry(newVersion, currentVersion)
    this.updateChangelog(changelogEntry)

    // Criar tag git
    this.createGitTag(newVersion)

    console.log(`\n🎉 Versionamento concluído com sucesso!`)
    console.log(`📦 Nova versão: v${newVersion}`)
    console.log(`📝 Changelog atualizado`)
    console.log(`🏷️ Tag git criada`)
    
    console.log(`\n📋 Próximos passos:`)
    console.log(`   1. Revisar as mudanças: git diff`)
    console.log(`   2. Fazer commit: git add . && git commit -m "chore: bump version to v${newVersion}"`)
    console.log(`   3. Fazer push: git push && git push --tags`)
    console.log(`   4. Fazer build: npm run build`)
  }

  /**
   * Mostra informações da versão atual
   */
  public showVersionInfo(): void {
    const currentVersion = this.getCurrentVersion()
    
    console.log(`📦 Informações da Versão`)
    console.log(`   Versão atual: v${currentVersion}`)
    console.log(`   Data de build: ${new Date().toISOString()}`)
    
    // Verificar consistência entre arquivos
    console.log(`\n🔍 Verificação de consistência:`)
    this.versionFiles.forEach(file => {
      try {
        const content = readFileSync(join(this.projectRoot, file), 'utf-8')
        if (file === 'package.json') {
          const pkg = JSON.parse(content)
          console.log(`   ${file}: v${pkg.version} ${pkg.version === currentVersion ? '✅' : '❌'}`)
        } else if (file === 'src/version.ts') {
          const match = content.match(/export const APP_VERSION = "([^"]+)"/)
          const version = match ? match[1] : 'N/A'
          console.log(`   ${file}: v${version} ${version === currentVersion ? '✅' : '❌'}`)
        } else if (file === 'public/version.json') {
          const versionInfo = JSON.parse(content)
          console.log(`   ${file}: v${versionInfo.version} ${versionInfo.version === currentVersion ? '✅' : '❌'}`)
        }
      } catch (error) {
        console.log(`   ${file}: ❌ Erro ao ler arquivo`)
      }
    })
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2)
  const versionManager = new VersionManager()

  if (args.length === 0) {
    console.log(`
🚀 Version Manager - Sistema de versionamento automático

Uso: npm run version [comando] [opções]

Comandos:
  patch     Incrementa versão de patch (1.0.0 -> 1.0.1)
  minor     Incrementa versão menor (1.0.0 -> 1.1.0)
  major     Incrementa versão maior (1.0.0 -> 2.0.0)
  info      Mostra informações da versão atual
  check     Verifica consistência entre arquivos

Exemplos:
  npm run version patch
  npm run version minor -- "Nova funcionalidade"
  npm run version major -- "Breaking changes"
  npm run version info
    `)
    return
  }

  const command = args[0]
  const description = args[1]

  switch (command) {
    case 'patch':
    case 'minor':
    case 'major':
      await versionManager.bumpVersion(command as 'major' | 'minor' | 'patch', description)
      break
    case 'info':
      versionManager.showVersionInfo()
      break
    case 'check':
      versionManager.showVersionInfo()
      break
    default:
      console.error(`❌ Comando inválido: ${command}`)
      console.log('Use "npm run version" para ver os comandos disponíveis')
      process.exit(1)
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export default VersionManager
