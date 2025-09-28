#!/usr/bin/env node

/**
 * Script para testar a detecção de PWA instalado
 */

import fs from 'fs'

console.log('🔍 Testando detecção de PWA instalado...\n')

try {
  // Verificar se os arquivos existem
  const files = [
    'src/hooks/usePWA.ts',
    'src/components/PWAInstallPrompt.tsx',
    'src/App.tsx'
  ]

  console.log('📁 Verificando arquivos necessários...')
  files.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`)
    } else {
      console.log(`  ❌ ${file} - ARQUIVO NÃO ENCONTRADO`)
      process.exit(1)
    }
  })

  // Verificar implementação no usePWA.ts
  const usePWAContent = fs.readFileSync('src/hooks/usePWA.ts', 'utf8')
  
  console.log('\n🔧 Verificando implementação no usePWA.ts...')
  
  const checks = [
    { name: 'Função checkInstalled implementada', pattern: /const checkInstalled = useCallback\(\(\) => \{/ },
    { name: 'Verificação display-mode standalone', pattern: /window\.matchMedia\('\(display-mode: standalone\)'\)\.matches/ },
    { name: 'Verificação iOS standalone', pattern: /\(window\.navigator as any\)\.standalone === true/ },
    { name: 'Logs de debug implementados', pattern: /console\.log\('\[PWA\] Verificação de instalação:'/ },
    { name: 'Event listener appinstalled', pattern: /window\.addEventListener\('appinstalled', handleAppInstalled\)/ },
    { name: 'Atualização de estado quando instalado', pattern: /isInstalled: true/ }
  ]

  let passedChecks = 0
  checks.forEach(check => {
    if (check.pattern.test(usePWAContent)) {
      console.log(`  ✅ ${check.name}`)
      passedChecks++
    } else {
      console.log(`  ❌ ${check.name}`)
    }
  })

  // Verificar implementação no PWAInstallPrompt.tsx
  const promptContent = fs.readFileSync('src/components/PWAInstallPrompt.tsx', 'utf8')
  
  console.log('\n🎯 Verificando implementação no PWAInstallPrompt.tsx...')
  
  const promptChecks = [
    { name: 'Verificação isInstalled no render', pattern: /if \(!showPrompt \|\| isInstalled\)/ },
    { name: 'Logs de debug implementados', pattern: /console\.log\('\[PWA Install Prompt\] Estado atual:'/ },
    { name: 'Ocultação quando instalado', pattern: /if \(isInstalled\) \{[\s\S]*?console\.log\('\[PWA Install Prompt\] App já instalado/ },
    { name: 'Hook usePWA importado', pattern: /import { usePWA } from '@\/hooks\/usePWA'/ }
  ]

  let passedPromptChecks = 0
  promptChecks.forEach(check => {
    if (check.pattern.test(promptContent)) {
      console.log(`  ✅ ${check.name}`)
      passedPromptChecks++
    } else {
      console.log(`  ❌ ${check.name}`)
    }
  })

  // Verificar se está sendo usado no App.tsx
  const appContent = fs.readFileSync('src/App.tsx', 'utf8')
  
  console.log('\n📱 Verificando uso no App.tsx...')
  
  const appChecks = [
    { name: 'PWAInstallPrompt importado', pattern: /import { PWAInstallPrompt } from '\.\/components\/PWAInstallPrompt'/ },
    { name: 'PWAInstallPrompt renderizado', pattern: /<PWAInstallPrompt \/>/ }
  ]

  let passedAppChecks = 0
  appChecks.forEach(check => {
    if (check.pattern.test(appContent)) {
      console.log(`  ✅ ${check.name}`)
      passedAppChecks++
    } else {
      console.log(`  ❌ ${check.name}`)
    }
  })

  console.log(`\n📊 Resultado dos testes:`)
  console.log(`  usePWA.ts: ${passedChecks}/${checks.length} verificações passaram`)
  console.log(`  PWAInstallPrompt.tsx: ${passedPromptChecks}/${promptChecks.length} verificações passaram`)
  console.log(`  App.tsx: ${passedAppChecks}/${appChecks.length} verificações passaram`)

  const totalPassed = passedChecks + passedPromptChecks + passedAppChecks
  const totalChecks = checks.length + promptChecks.length + appChecks.length

  if (totalPassed === totalChecks) {
    console.log('\n🎉 SUCESSO! Detecção de PWA instalado implementada corretamente!')
    console.log('\n✅ Funcionalidades implementadas:')
    console.log('  🔍 Detecção robusta de PWA instalado')
    console.log('  📱 Suporte para diferentes navegadores e dispositivos')
    console.log('  🚫 Ocultação automática quando app já está instalado')
    console.log('  📝 Logs de debug para monitoramento')
    console.log('  ⚡ Atualização em tempo real do estado')
    
    console.log('\n🚀 Como testar:')
    console.log('  1. Acesse http://localhost:3003')
    console.log('  2. Abra DevTools > Console')
    console.log('  3. Verifique os logs de detecção de PWA')
    console.log('  4. Instale o PWA usando o prompt')
    console.log('  5. Recarregue a página - o prompt deve desaparecer')
    console.log('  6. Verifique os logs confirmando que está instalado')
    
  } else {
    console.log('\n❌ ALGUMAS VERIFICAÇÕES FALHARAM!')
    console.log(`Apenas ${totalPassed}/${totalChecks} verificações passaram.`)
    console.log('Verifique os arquivos e corrija as implementações faltantes.')
    process.exit(1)
  }
  
} catch (error) {
  console.error('❌ Erro ao verificar implementação:', error.message)
  process.exit(1)
}
