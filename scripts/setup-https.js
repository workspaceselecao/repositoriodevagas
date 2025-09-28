#!/usr/bin/env node

/**
 * Script para gerar certificados SSL locais para desenvolvimento HTTPS
 * Resolve o aviso de "origem segura" no PWA
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🔐 Gerando certificados SSL locais...\n')

// Verificar se os certificados já existem
const keyFile = 'localhost-key.pem'
const certFile = 'localhost.pem'

if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
  console.log('✅ Certificados SSL já existem!')
  console.log('📁 Arquivos encontrados:')
  console.log(`  🔑 ${keyFile}`)
  console.log(`  📜 ${certFile}`)
  console.log('\n🚀 Você pode usar HTTPS agora!')
  console.log('   Execute: npm run dev')
  console.log('   Acesse: https://localhost:3000')
  process.exit(0)
}

try {
  console.log('⚙️ Gerando chave privada...')
  execSync(`openssl genrsa -out ${keyFile} 2048`, { stdio: 'inherit' })
  
  console.log('📜 Gerando certificado...')
  execSync(`openssl req -new -x509 -key ${keyFile} -out ${certFile} -days 365 -subj "/C=BR/ST=SP/L=SaoPaulo/O=Dev/OU=IT/CN=localhost"`, { stdio: 'inherit' })
  
  console.log('✅ Certificados SSL gerados com sucesso!')
  console.log('📁 Arquivos criados:')
  console.log(`  🔑 ${keyFile}`)
  console.log(`  📜 ${certFile}`)
  
  console.log('\n🚀 Próximos passos:')
  console.log('  1. Execute: npm run dev')
  console.log('  2. Acesse: https://localhost:3000')
  console.log('  3. Aceite o certificado no navegador')
  console.log('  4. Teste o PWA com HTTPS!')
  
} catch (error) {
  console.error('❌ Erro ao gerar certificados SSL:', error.message)
  console.log('\n💡 Alternativas:')
  console.log('  1. Instale OpenSSL: https://slproweb.com/products/Win32OpenSSL.html')
  console.log('  2. Ou use mkcert: https://github.com/FiloSottile/mkcert')
  console.log('  3. Ou teste em produção com HTTPS real')
  
  console.log('\n🎯 Solução Temporária:')
  console.log('Para desenvolvimento local, você pode:')
  console.log('  1. Testar em produção (com HTTPS real)')
  console.log('  2. Usar ngrok para tunel HTTPS')
  console.log('  3. Aceitar que algumas funcionalidades PWA não funcionem em HTTP')
}
