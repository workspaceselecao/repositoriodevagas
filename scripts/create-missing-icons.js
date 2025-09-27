import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Criar os ícones que estão faltando
const iconsDir = path.join(__dirname, '../public/icons')

console.log('Copiando ícones existentes como fallback...')

// Copiar ícones existentes como fallback
const sourceIcon = path.join(iconsDir, 'icon-96x96.png')

if (fs.existsSync(sourceIcon)) {
  fs.copyFileSync(sourceIcon, path.join(iconsDir, 'icon-16x16.png'))
  fs.copyFileSync(sourceIcon, path.join(iconsDir, 'icon-32x32.png'))
  console.log('Ícones 16x16 e 32x32 criados como cópias do 96x96')
} else {
  console.log('Nenhum ícone fonte encontrado')
}
