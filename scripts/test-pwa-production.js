import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 Testando PWA em produção...\n')

const productionUrl = 'https://repositoriodevagas-k67ahmi63-workspace-selecaos-projects.vercel.app'

console.log(`🌐 URL de Produção: ${productionUrl}`)

// Verificar se os arquivos necessários existem localmente
const requiredFiles = [
  'dist/manifest.webmanifest',
  'dist/sw.js',
  'dist/index.html'
]

console.log('\n📁 Verificando arquivos locais:')
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
  
  // Verificar se tem ícone 192x192 e 512x512
  const has192 = manifest.icons.some(icon => icon.sizes === '192x192')
  const has512 = manifest.icons.some(icon => icon.sizes === '512x512')
  console.log(`✅ Ícone 192x192: ${has192 ? 'Sim' : 'Não'}`)
  console.log(`✅ Ícone 512x512: ${has512 ? 'Sim' : 'Não'}`)
  
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

console.log('\n' + '='.repeat(60))
if (allFilesExist) {
  console.log('🎉 PWA configurado corretamente!')
  console.log('\n📝 Para testar em produção:')
  console.log(`1. Acesse: ${productionUrl}`)
  console.log('2. Abra DevTools (F12) → Application → Manifest')
  console.log('3. Verifique se não há erros vermelhos')
  console.log('4. Vá em Application → Service Workers')
  console.log('5. Verifique se está registrado e ativo')
  console.log('6. Procure o ícone de instalação na barra de endereços')
  console.log('\n⚠️  Problemas comuns:')
  console.log('- Cache do navegador (Ctrl+Shift+R para limpar)')
  console.log('- Usuário precisa interagir com o site primeiro')
  console.log('- PWA já foi instalado antes')
  console.log('- Navegador não suporta PWA')
} else {
  console.log('❌ Alguns arquivos estão faltando. Execute: npm run build')
}
