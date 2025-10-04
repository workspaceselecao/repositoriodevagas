# Script PowerShell para Deploy na Vercel
# Repositório de Vagas v1.0.6

Write-Host "🚀 Iniciando deploy na Vercel..." -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan

try {
    # 1. Verificar se o projeto está limpo
    Write-Host "📋 Verificando status do Git..." -ForegroundColor Yellow
    $gitStatus = git status --porcelain
    
    if ($gitStatus) {
        Write-Host "⚠️  Há mudanças não commitadas. Fazendo commit automático..." -ForegroundColor Yellow
        git add .
        git commit -m "feat: Deploy automático na Vercel"
    }

    # 2. Verificar se o build funciona
    Write-Host "🔨 Testando build local..." -ForegroundColor Yellow
    npm run build
    Write-Host "✅ Build local funcionando!" -ForegroundColor Green

    # 3. Verificar se Vercel CLI está disponível
    Write-Host "🔍 Verificando Vercel CLI..." -ForegroundColor Yellow
    try {
        npx vercel --version | Out-Null
        Write-Host "✅ Vercel CLI disponível!" -ForegroundColor Green
    } catch {
        Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
    }

    # 4. Fazer deploy
    Write-Host "🚀 Iniciando deploy..." -ForegroundColor Yellow
    Write-Host "📝 Siga as instruções na tela para configurar o projeto" -ForegroundColor Cyan
    
    npx vercel --prod

    Write-Host "=" * 50 -ForegroundColor Cyan
    Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Configure as variáveis de ambiente na Vercel" -ForegroundColor White
    Write-Host "2. Atualize as URLs de redirecionamento no Supabase" -ForegroundColor White
    Write-Host "3. Teste a aplicação" -ForegroundColor White
    Write-Host "4. Crie o usuário super admin" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Consulte DEPLOY_VERCEL.md para instruções detalhadas" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Erro durante o deploy: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Soluções:" -ForegroundColor Yellow
    Write-Host "1. Verifique se está logado na Vercel: npx vercel login" -ForegroundColor White
    Write-Host "2. Verifique se o build funciona: npm run build" -ForegroundColor White
    Write-Host "3. Consulte DEPLOY_VERCEL.md para troubleshooting" -ForegroundColor White
    exit 1
}
