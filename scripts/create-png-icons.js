import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para criar um PNG simples em base64
function createSimplePNG(size) {
  // PNG header + IHDR + IDAT + IEND
  // Este é um PNG 1x1 pixel azul simples
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return pngData;
}

// Tamanhos dos ícones
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Diretório de ícones
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Criar ícones PNG simples
sizes.forEach(size => {
  const pngData = createSimplePNG(size);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, pngData);
  console.log(`✅ Gerado: ${filename}`);
});

console.log('\n🎉 Ícones PNG básicos criados!');
console.log('📝 Nota: Estes são ícones temporários. Para produção, substitua por ícones reais.');
