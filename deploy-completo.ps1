# Script PowerShell para Deploy Completo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DEPLOY COMPLETO - REPOSITORIO VAGAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "[1/5] Verificando status do Git..." -ForegroundColor Yellow
    git status
    Write-Host ""

    Write-Host "[2/5] Fazendo commit das alterações..." -ForegroundColor Yellow
    git add .
    git commit -m "fix: Correções finais para deploy na Vercel - Super admin invisível e build funcionando"
    Write-Host ""

    Write-Host "[3/5] Verificando build local..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build local funcionando!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro no build local" -ForegroundColor Red
        exit 1
    }
    Write-Host ""

    Write-Host "[4/5] Fazendo deploy na Vercel..." -ForegroundColor Yellow
    vercel --prod
    Write-Host ""

    Write-Host "[5/5] Deploy concluído!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "    PRÓXIMOS PASSOS:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "1. Configure as variáveis de ambiente na Vercel" -ForegroundColor White
    Write-Host "2. Atualize as URLs no Supabase" -ForegroundColor White
    Write-Host "3. Teste a aplicação" -ForegroundColor White
    Write-Host "4. Crie o super admin" -ForegroundColor White
    Write-Host ""
    Write-Host "Consulte INSTRUCOES_DEPLOY_VERCEL.md para detalhes" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Erro durante o deploy: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Soluções:" -ForegroundColor Yellow
    Write-Host "1. Verifique se está logado na Vercel: vercel login" -ForegroundColor White
    Write-Host "2. Verifique se o build funciona: npm run build" -ForegroundColor White
    Write-Host "3. Consulte INSTRUCOES_DEPLOY_VERCEL.md" -ForegroundColor White
    exit 1
}
