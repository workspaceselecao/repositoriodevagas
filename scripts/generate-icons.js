import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tamanhos dos ícones necessários
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG base para os ícones
const svgTemplate = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
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
</svg>`;

// Criar diretório de ícones se não existir
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Gerar ícones SVG para cada tamanho
sizes.forEach(size => {
  const svgContent = svgTemplate(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Gerado: ${filename}`);
});

// Criar um favicon.ico simples (usando o ícone 32x32)
const faviconSvg = svgTemplate(32);
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSvg);
console.log('✅ Gerado: favicon.svg');

console.log('\n🎉 Todos os ícones foram gerados com sucesso!');
console.log('📝 Nota: Para converter SVG para PNG, use uma ferramenta online ou ImageMagick');
console.log('   Exemplo: convert icon-192x192.svg icon-192x192.png');
