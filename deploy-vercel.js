#!/usr/bin/env node

/**
 * Script para fazer deploy na Vercel
 * Repositório de Vagas v1.0.6
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando deploy na Vercel...');
console.log('=' .repeat(50));

try {
  // 1. Verificar se o projeto está limpo
  console.log('📋 Verificando status do Git...');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (gitStatus.trim()) {
    console.log('⚠️  Há mudanças não commitadas. Fazendo commit automático...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "feat: Deploy automático na Vercel"', { stdio: 'inherit' });
  }

  // 2. Verificar se o build funciona
  console.log('🔨 Testando build local...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build local funcionando!');

  // 3. Verificar se Vercel CLI está disponível
  console.log('🔍 Verificando Vercel CLI...');
  try {
    execSync('npx vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI disponível!');
  } catch (error) {
    console.log('📦 Instalando Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  // 4. Fazer deploy
  console.log('🚀 Iniciando deploy...');
  console.log('📝 Siga as instruções na tela para configurar o projeto');
  
  execSync('npx vercel --prod', { stdio: 'inherit' });

  console.log('=' .repeat(50));
  console.log('🎉 Deploy concluído com sucesso!');
  console.log('');
  console.log('📋 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente na Vercel');
  console.log('2. Atualize as URLs de redirecionamento no Supabase');
  console.log('3. Teste a aplicação');
  console.log('4. Crie o usuário super admin');
  console.log('');
  console.log('📖 Consulte DEPLOY_VERCEL.md para instruções detalhadas');

} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  console.log('');
  console.log('🔧 Soluções:');
  console.log('1. Verifique se está logado na Vercel: npx vercel login');
  console.log('2. Verifique se o build funciona: npm run build');
  console.log('3. Consulte DEPLOY_VERCEL.md para troubleshooting');
  process.exit(1);
}
