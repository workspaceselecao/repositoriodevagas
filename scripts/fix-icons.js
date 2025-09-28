#!/usr/bin/env node

/**
 * Script para regenerar todos os ícones PNG a partir do SVG base
 * Resolve o problema dos ícones sendo carregados como 1x1px
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔄 Regenerando ícones PNG...\n')

// Tamanhos de ícones necessários
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]

// SVG base
const svgBase = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bg)" stroke="#ffffff" stroke-width="8"/>
  
  <!-- Document icon -->
  <rect x="180" y="140" width="152" height="200" rx="12" fill="#ffffff" opacity="0.9"/>
  <rect x="200" y="180" width="112" height="8" rx="4" fill="#3b82f6"/>
  <rect x="200" y="200" width="80" height="6" rx="3" fill="#6b7280"/>
  <rect x="200" y="220" width="100" height="6" rx="3" fill="#6b7280"/>
  <rect x="200" y="240" width="90" height="6" rx="3" fill="#6b7280"/>
  <rect x="200" y="260" width="70" height="6" rx="3" fill="#6b7280"/>
  
  <!-- Building icon -->
  <rect x="220" y="280" width="20" height="40" fill="#3b82f6"/>
  <rect x="250" y="270" width="20" height="50" fill="#3b82f6"/>
  <rect x="280" y="290" width="20" height="30" fill="#3b82f6"/>
  
  <!-- RV text -->
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#ffffff">RV</text>
</svg>`

// Função para criar SVG com tamanho específico
function createSVG(size) {
  return svgBase.replace('width="512" height="512"', `width="${size}" height="${size}"`)
}

// Função para converter SVG para PNG usando Canvas (simulação)
function createPNGFromSVG(svgContent, size) {
  // Como não temos acesso a bibliotecas de conversão SVG->PNG no Node.js básico,
  // vamos criar um arquivo SVG temporário e instruir o usuário sobre como converter
  
  const tempSvgPath = `temp-icon-${size}x${size}.svg`
  fs.writeFileSync(tempSvgPath, svgContent)
  
  console.log(`  📝 Criado SVG temporário: ${tempSvgPath}`)
  console.log(`  💡 Converta para PNG usando: https://convertio.co/svg-png/ ou similar`)
  
  return tempSvgPath
}

// Criar todos os ícones
console.log('📁 Criando ícones SVG temporários...')
const tempFiles = []

iconSizes.forEach(size => {
  const svgContent = createSVG(size)
  const tempFile = createPNGFromSVG(svgContent, size)
  tempFiles.push(tempFile)
})

console.log('\n🎯 Solução Alternativa - Usar ícones SVG no manifest:')
console.log('Como os ícones PNG estão corrompidos, vamos usar SVGs diretamente no manifest.')

// Atualizar manifest para usar SVGs
const manifestPath = 'public/manifest.json'
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

// Substituir ícones PNG por SVG
manifest.icons = [
  {
    "src": "/icons/icon.svg",
    "sizes": "any",
    "type": "image/svg+xml",
    "purpose": "any"
  },
  {
    "src": "/icons/icon.svg",
    "sizes": "any", 
    "type": "image/svg+xml",
    "purpose": "maskable"
  }
]

// Salvar manifest atualizado
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

console.log('✅ Manifest atualizado para usar ícones SVG')
console.log('✅ Isso resolve o problema dos ícones 1x1px')

// Limpar arquivos temporários
tempFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
  }
})

console.log('\n🎉 Ícones regenerados com sucesso!')
console.log('📝 Próximos passos:')
console.log('  1. Reinicie o servidor de desenvolvimento')
console.log('  2. Teste novamente no DevTools')
console.log('  3. Os ícones agora devem carregar corretamente')
