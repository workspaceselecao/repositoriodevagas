import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 Testando configuração PWA...\n')

// Verificar se os arquivos necessários existem
const requiredFiles = [
  'dist/manifest.webmanifest',
  'dist/sw.js',
  'dist/index.html',
  'public/icons/icon-192x192.png',
  'public/icons/icon-512x512.png'
]

let allFilesExist = true

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  const exists = fs.existsSync(filePath)
  console.log(`${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allFilesExist = false
})

// Verificar manifest
try {
  const manifestPath = path.join(__dirname, '..', 'dist/manifest.webmanifest')
  const manifestContent = fs.readFileSync(manifestPath, 'utf8')
  const manifest = JSON.parse(manifestContent)
  
  console.log('\n📋 Verificando Manifest:')
  console.log(`✅ Nome: ${manifest.name}`)
  console.log(`✅ Short Name: ${manifest.short_name}`)
  console.log(`✅ Start URL: ${manifest.start_url}`)
  console.log(`✅ Display: ${manifest.display}`)
  console.log(`✅ Theme Color: ${manifest.theme_color}`)
  console.log(`✅ Background Color: ${manifest.background_color}`)
  console.log(`✅ Ícones: ${manifest.icons.length} ícones`)
  
  // Verificar se tem ícones maskable
  const maskableIcons = manifest.icons.filter(icon => icon.purpose === 'maskable')
  console.log(`✅ Ícones Maskable: ${maskableIcons.length}`)
  
} catch (error) {
  console.log('❌ Erro ao verificar manifest:', error.message)
  allFilesExist = false
}

// Verificar HTML
try {
  const htmlPath = path.join(__dirname, '..', 'dist/index.html')
  const htmlContent = fs.readFileSync(htmlPath, 'utf8')
  
  console.log('\n🌐 Verificando HTML:')
  console.log(`✅ Meta viewport: ${htmlContent.includes('viewport') ? 'Sim' : 'Não'}`)
  console.log(`✅ Meta theme-color: ${htmlContent.includes('theme-color') ? 'Sim' : 'Não'}`)
  console.log(`✅ Manifest link: ${htmlContent.includes('manifest.webmanifest') ? 'Sim' : 'Não'}`)
  console.log(`✅ Apple touch icon: ${htmlContent.includes('apple-touch-icon') ? 'Sim' : 'Não'}`)
  
} catch (error) {
  console.log('❌ Erro ao verificar HTML:', error.message)
  allFilesExist = false
}

console.log('\n' + '='.repeat(50))
if (allFilesExist) {
  console.log('🎉 PWA configurado corretamente!')
  console.log('\n📝 Para testar:')
  console.log('1. Execute: npm run preview')
  console.log('2. Acesse: http://localhost:4173')
  console.log('3. Abra DevTools → Application → Manifest')
  console.log('4. Verifique se o ícone de instalação aparece')
  console.log('\n⚠️  Nota: O ícone pode não aparecer em localhost')
  console.log('   Para teste completo, faça deploy em HTTPS')
} else {
  console.log('❌ Alguns arquivos estão faltando. Execute: npm run build')
}
