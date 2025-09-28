#!/usr/bin/env node

/**
 * Script para criar screenshots placeholder para o PWA
 * Resolve os avisos sobre screenshots faltando
 */

import fs from 'fs'
import path from 'path'

console.log('📸 Criando screenshots placeholder...\n')

// Criar pasta screenshots se não existir
const screenshotsDir = 'public/screenshots'
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
  console.log('📁 Pasta screenshots criada')
}

// SVG para screenshot desktop (1280x720)
const desktopScreenshot = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bg)"/>
  
  <!-- Header -->
  <rect x="0" y="0" width="1280" height="80" fill="#3b82f6"/>
  <text x="640" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#ffffff">Repositório de Vagas</text>
  
  <!-- Sidebar -->
  <rect x="0" y="80" width="250" height="640" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  
  <!-- Menu items -->
  <rect x="20" y="120" width="210" height="40" fill="#f1f5f9" rx="8"/>
  <text x="30" y="145" font-family="Arial, sans-serif" font-size="16" fill="#1e293b">📊 Dashboard</text>
  
  <rect x="20" y="180" width="210" height="40" fill="#ffffff" rx="8"/>
  <text x="30" y="205" font-family="Arial, sans-serif" font-size="16" fill="#64748b">👥 Clientes</text>
  
  <rect x="20" y="240" width="210" height="40" fill="#ffffff" rx="8"/>
  <text x="30" y="265" font-family="Arial, sans-serif" font-size="16" fill="#64748b">📝 Nova Vaga</text>
  
  <!-- Main content -->
  <rect x="270" y="120" width="980" height="580" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="12"/>
  
  <!-- Stats cards -->
  <rect x="300" y="150" width="200" height="120" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="2" rx="8"/>
  <text x="400" y="180" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#0c4a6e">Total de Vagas</text>
  <text x="400" y="220" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#0ea5e9">21</text>
  
  <rect x="520" y="150" width="200" height="120" fill="#f0fdf4" stroke="#22c55e" stroke-width="2" rx="8"/>
  <text x="620" y="180" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#166534">Clientes Únicos</text>
  <text x="620" y="220" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#22c55e">10</text>
  
  <rect x="740" y="150" width="200" height="120" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" rx="8"/>
  <text x="840" y="180" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#92400e">Sites Ativos</text>
  <text x="840" y="220" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#f59e0b">7</text>
  
  <rect x="960" y="150" width="200" height="120" fill="#fce7f3" stroke="#ec4899" stroke-width="2" rx="8"/>
  <text x="1060" y="180" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#be185d">Usuários Ativos</text>
  <text x="1060" y="220" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#ec4899">2</text>
  
  <!-- Chart area -->
  <rect x="300" y="300" width="860" height="300" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="8"/>
  <text x="730" y="330" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1e293b">Gráfico de Vagas por Mês</text>
  
  <!-- Chart bars -->
  <rect x="350" y="450" width="40" height="120" fill="#3b82f6" rx="4"/>
  <rect x="420" y="400" width="40" height="170" fill="#3b82f6" rx="4"/>
  <rect x="490" y="350" width="40" height="220" fill="#3b82f6" rx="4"/>
  <rect x="560" y="300" width="40" height="270" fill="#3b82f6" rx="4"/>
  <rect x="630" y="250" width="40" height="320" fill="#3b82f6" rx="4"/>
  <rect x="700" y="200" width="40" height="370" fill="#3b82f6" rx="4"/>
  <rect x="770" y="180" width="40" height="390" fill="#3b82f6" rx="4"/>
  <rect x="840" y="160" width="40" height="410" fill="#3b82f6" rx="4"/>
  <rect x="910" y="140" width="40" height="430" fill="#3b82f6" rx="4"/>
  <rect x="980" y="120" width="40" height="450" fill="#3b82f6" rx="4"/>
  <rect x="1050" y="100" width="40" height="470" fill="#3b82f6" rx="4"/>
  
  <!-- Footer -->
  <rect x="0" y="700" width="1280" height="20" fill="#f1f5f9"/>
  <text x="640" y="715" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#64748b">Repositório de Vagas - Dashboard</text>
</svg>`

// SVG para screenshot mobile (390x844)
const mobileScreenshot = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="390" height="844" fill="url(#bg)"/>
  
  <!-- Header -->
  <rect x="0" y="0" width="390" height="60" fill="#3b82f6"/>
  <text x="195" y="35" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#ffffff">RepoVagas</text>
  
  <!-- Stats cards -->
  <rect x="20" y="80" width="350" height="80" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="2" rx="8"/>
  <text x="195" y="105" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#0c4a6e">Total de Vagas</text>
  <text x="195" y="135" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#0ea5e9">21</text>
  
  <rect x="20" y="180" width="170" height="80" fill="#f0fdf4" stroke="#22c55e" stroke-width="2" rx="8"/>
  <text x="105" y="205" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#166534">Clientes</text>
  <text x="105" y="230" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#22c55e">10</text>
  
  <rect x="200" y="180" width="170" height="80" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" rx="8"/>
  <text x="285" y="205" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#92400e">Sites</text>
  <text x="285" y="230" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#f59e0b">7</text>
  
  <!-- Menu -->
  <rect x="20" y="280" width="350" height="200" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>
  <text x="195" y="305" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1e293b">Menu Principal</text>
  
  <rect x="40" y="330" width="310" height="40" fill="#f1f5f9" rx="8"/>
  <text x="50" y="355" font-family="Arial, sans-serif" font-size="14" fill="#1e293b">📊 Dashboard</text>
  
  <rect x="40" y="380" width="310" height="40" fill="#ffffff" rx="8"/>
  <text x="50" y="405" font-family="Arial, sans-serif" font-size="14" fill="#64748b">👥 Clientes</text>
  
  <rect x="40" y="430" width="310" height="40" fill="#ffffff" rx="8"/>
  <text x="50" y="455" font-family="Arial, sans-serif" font-size="14" fill="#64748b">📝 Nova Vaga</text>
  
  <!-- Recent activity -->
  <rect x="20" y="500" width="350" height="200" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>
  <text x="195" y="525" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1e293b">Atividade Recente</text>
  
  <rect x="40" y="550" width="310" height="30" fill="#f8fafc" rx="4"/>
  <text x="50" y="570" font-family="Arial, sans-serif" font-size="12" fill="#64748b">Nova vaga adicionada - Empresa XYZ</text>
  
  <rect x="40" y="590" width="310" height="30" fill="#f8fafc" rx="4"/>
  <text x="50" y="610" font-family="Arial, sans-serif" font-size="12" fill="#64748b">Cliente atualizado - João Silva</text>
  
  <rect x="40" y="630" width="310" height="30" fill="#f8fafc" rx="4"/>
  <text x="50" y="650" font-family="Arial, sans-serif" font-size="12" fill="#64748b">Relatório gerado - Setembro 2024</text>
  
  <!-- Bottom navigation -->
  <rect x="0" y="780" width="390" height="64" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  
  <rect x="20" y="800" width="70" height="24" fill="#3b82f6" rx="12"/>
  <text x="55" y="815" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">Home</text>
  
  <text x="120" y="815" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#64748b">Clientes</text>
  <text x="200" y="815" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#64748b">Vagas</text>
  <text x="280" y="815" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#64748b">Perfil</text>
</svg>`

// Salvar screenshots
fs.writeFileSync(path.join(screenshotsDir, 'desktop-wide.svg'), desktopScreenshot)
fs.writeFileSync(path.join(screenshotsDir, 'mobile-narrow.svg'), mobileScreenshot)

console.log('✅ Screenshots SVG criados:')
console.log('  📱 mobile-narrow.svg (390x844)')
console.log('  💻 desktop-wide.svg (1280x720)')

console.log('\n💡 Para converter para PNG:')
console.log('  1. Use https://convertio.co/svg-png/')
console.log('  2. Ou qualquer conversor SVG->PNG online')
console.log('  3. Renomeie para desktop-wide.png e mobile-narrow.png')

console.log('\n🎯 Alternativa: Usar SVGs diretamente no manifest')
console.log('Os SVGs funcionam perfeitamente e resolvem os avisos!')

console.log('\n🎉 Screenshots criados com sucesso!')
