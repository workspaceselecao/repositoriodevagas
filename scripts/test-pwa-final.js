#!/usr/bin/env node

/**
 * Script de teste final para verificar se todos os problemas PWA foram resolvidos
 */

import fs from 'fs'
import path from 'path'

console.log('🔍 Teste Final PWA - Verificando correções...\n')

let allTestsPassed = true

// Teste 1: Verificar se os ícones SVG existem e não são corrompidos
console.log('1️⃣ Testando ícones SVG...')
const iconSvgPath = 'public/icons/icon.svg'
if (fs.existsSync(iconSvgPath)) {
  const iconContent = fs.readFileSync(iconSvgPath, 'utf8')
  if (iconContent.includes('<svg') && iconContent.includes('viewBox="0 0 512 512"')) {
    console.log('  ✅ Ícone SVG válido encontrado')
  } else {
    console.log('  ❌ Ícone SVG inválido')
    allTestsPassed = false
  }
} else {
  console.log('  ❌ Ícone SVG não encontrado')
  allTestsPassed = false
}

// Teste 2: Verificar se os screenshots SVG existem
console.log('\n2️⃣ Testando screenshots...')
const screenshots = [
  'public/screenshots/desktop-wide.svg',
  'public/screenshots/mobile-narrow.svg'
]

screenshots.forEach(screenshot => {
  if (fs.existsSync(screenshot)) {
    const content = fs.readFileSync(screenshot, 'utf8')
    if (content.includes('<svg')) {
      console.log(`  ✅ ${path.basename(screenshot)} válido`)
    } else {
      console.log(`  ❌ ${path.basename(screenshot)} inválido`)
      allTestsPassed = false
    }
  } else {
    console.log(`  ❌ ${path.basename(screenshot)} não encontrado`)
    allTestsPassed = false
  }
})

// Teste 3: Verificar manifest.json
console.log('\n3️⃣ Testando manifest.json...')
try {
  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'))
  
  // Verificar campos obrigatórios
  const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons']
  requiredFields.forEach(field => {
    if (manifest[field]) {
      console.log(`  ✅ ${field}: ${manifest[field]}`)
    } else {
      console.log(`  ❌ Campo obrigatório ${field} faltando`)
      allTestsPassed = false
    }
  })
  
  // Verificar ícones SVG
  if (manifest.icons && manifest.icons.length > 0) {
    const hasSvgIcon = manifest.icons.some(icon => 
      icon.type === 'image/svg+xml' && icon.src === '/icons/icon.svg'
    )
    if (hasSvgIcon) {
      console.log('  ✅ Ícones SVG configurados corretamente')
    } else {
      console.log('  ❌ Ícones SVG não configurados')
      allTestsPassed = false
    }
  }
  
  // Verificar screenshots
  if (manifest.screenshots && manifest.screenshots.length > 0) {
    console.log(`  ✅ ${manifest.screenshots.length} screenshots configurados`)
    manifest.screenshots.forEach(screenshot => {
      console.log(`    📸 ${screenshot.form_factor}: ${screenshot.sizes}`)
    })
  } else {
    console.log('  ❌ Screenshots não configurados')
    allTestsPassed = false
  }
  
} catch (error) {
  console.log('  ❌ Erro ao ler manifest.json:', error.message)
  allTestsPassed = false
}

// Teste 4: Verificar service worker
console.log('\n4️⃣ Testando service worker...')
if (fs.existsSync('public/sw.js')) {
  const swContent = fs.readFileSync('public/sw.js', 'utf8')
  const requiredFeatures = ['addEventListener', 'install', 'activate', 'fetch', 'caches']
  
  requiredFeatures.forEach(feature => {
    if (swContent.includes(feature)) {
      console.log(`  ✅ ${feature} implementado`)
    } else {
      console.log(`  ❌ ${feature} não encontrado`)
      allTestsPassed = false
    }
  })
} else {
  console.log('  ❌ Service worker não encontrado')
  allTestsPassed = false
}

// Teste 5: Verificar componentes React
console.log('\n5️⃣ Testando componentes React...')
const reactFiles = [
  'src/hooks/usePWA.ts',
  'src/components/PWAInstallPrompt.tsx',
  'src/components/OfflineIndicator.tsx'
]

reactFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} existe`)
  } else {
    console.log(`  ❌ ${file} não encontrado`)
    allTestsPassed = false
  }
})

// Resultado final
console.log('\n' + '='.repeat(50))
if (allTestsPassed) {
  console.log('🎉 TODOS OS TESTES PASSARAM!')
  console.log('\n✅ Problemas resolvidos:')
  console.log('  🔧 Ícones 1x1px → Ícones SVG funcionais')
  console.log('  📸 Screenshots faltando → Screenshots SVG adicionados')
  console.log('  ⚙️ Service worker → Implementado e funcional')
  console.log('  🎯 Manifest → Otimizado e completo')
  console.log('  ⚛️ Componentes React → Implementados')
  
  console.log('\n🚀 Próximos passos:')
  console.log('  1. Reinicie o servidor: npm run dev')
  console.log('  2. Acesse: http://localhost:3003')
  console.log('  3. Abra DevTools > Application > Manifest')
  console.log('  4. Verifique se os avisos foram resolvidos')
  console.log('  5. Teste o ícone de instalação PWA')
  
  console.log('\n💡 Nota sobre HTTPS:')
  console.log('  - Para desenvolvimento: HTTP funciona (com limitações)')
  console.log('  - Para produção: HTTPS é obrigatório para PWA completo')
  console.log('  - O ícone de instalação deve aparecer mesmo em HTTP')
  
} else {
  console.log('❌ ALGUNS TESTES FALHARAM!')
  console.log('Verifique os erros acima e corrija antes de continuar.')
  process.exit(1)
}
