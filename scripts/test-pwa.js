#!/usr/bin/env node

/**
 * Script para testar a funcionalidade PWA
 * Verifica se todos os requisitos estão atendidos
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 Testando implementação PWA...\n')

// Verificar arquivos essenciais
const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'dist/manifest.json',
  'dist/sw.js'
]

let allFilesExist = true

console.log('📁 Verificando arquivos essenciais:')
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allFilesExist = false
})

if (!allFilesExist) {
  console.log('\n❌ Alguns arquivos essenciais estão faltando!')
  process.exit(1)
}

// Verificar manifest.json
console.log('\n📋 Verificando manifest.json:')
try {
  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'))
  
  const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons']
  requiredFields.forEach(field => {
    const hasField = manifest.hasOwnProperty(field)
    console.log(`  ${hasField ? '✅' : '❌'} ${field}`)
  })
  
  // Verificar ícones
  if (manifest.icons && manifest.icons.length > 0) {
    console.log(`  ✅ ${manifest.icons.length} ícones definidos`)
    
    // Verificar se os ícones existem
    const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]
    iconSizes.forEach(size => {
      const iconPath = `public/icons/icon-${size}x${size}.png`
      const exists = fs.existsSync(iconPath)
      console.log(`    ${exists ? '✅' : '❌'} icon-${size}x${size}.png`)
    })
  }
  
  console.log(`  ✅ Theme color: ${manifest.theme_color}`)
  console.log(`  ✅ Background color: ${manifest.background_color}`)
  console.log(`  ✅ Display mode: ${manifest.display}`)
  
} catch (error) {
  console.log('❌ Erro ao ler manifest.json:', error.message)
}

// Verificar service worker
console.log('\n⚙️ Verificando service worker:')
try {
  const swContent = fs.readFileSync('public/sw.js', 'utf8')
  
  const requiredSWFeatures = [
    'addEventListener',
    'install',
    'activate',
    'fetch',
    'caches'
  ]
  
  requiredSWFeatures.forEach(feature => {
    const hasFeature = swContent.includes(feature)
    console.log(`  ${hasFeature ? '✅' : '❌'} ${feature}`)
  })
  
  console.log(`  ✅ Service worker tem ${swContent.split('\n').length} linhas`)
  
} catch (error) {
  console.log('❌ Erro ao ler service worker:', error.message)
}

// Verificar HTML
console.log('\n🌐 Verificando index.html:')
try {
  const htmlContent = fs.readFileSync('index.html', 'utf8')
  
  const requiredMetaTags = [
    'manifest.json',
    'theme-color',
    'apple-mobile-web-app-capable',
    'viewport'
  ]
  
  requiredMetaTags.forEach(tag => {
    const hasTag = htmlContent.includes(tag)
    console.log(`  ${hasTag ? '✅' : '❌'} ${tag}`)
  })
  
} catch (error) {
  console.log('❌ Erro ao ler index.html:', error.message)
}

// Verificar componentes React
console.log('\n⚛️ Verificando componentes React:')
const reactFiles = [
  'src/hooks/usePWA.ts',
  'src/components/PWAInstallPrompt.tsx',
  'src/components/OfflineIndicator.tsx'
]

reactFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
})

console.log('\n🎉 Teste PWA concluído!')
console.log('\n📝 Próximos passos:')
console.log('  1. Execute: npm run dev')
console.log('  2. Abra http://localhost:3000 no Chrome')
console.log('  3. Abra DevTools > Application > Manifest')
console.log('  4. Verifique se o ícone de instalação aparece na barra de endereços')
console.log('  5. Teste a instalação do PWA')
console.log('\n💡 Dicas:')
console.log('  - Use HTTPS em produção para PWA funcionar completamente')
console.log('  - Teste em diferentes dispositivos móveis')
console.log('  - Verifique o Lighthouse PWA audit')
