@echo off
echo ========================================
echo    DEPLOY COMPLETO - REPOSITORIO VAGAS
echo ========================================
echo.

echo [1/5] Verificando status do Git...
git status
echo.

echo [2/5] Fazendo commit das alteracoes...
git add .
git commit -m "fix: Correções finais para deploy na Vercel - Super admin invisível e build funcionando"
echo.

echo [3/5] Verificando build local...
npm run build
echo.

echo [4/5] Fazendo deploy na Vercel...
vercel --prod
echo.

echo [5/5] Deploy concluido!
echo.
echo ========================================
echo    PRÓXIMOS PASSOS:
echo ========================================
echo 1. Configure as variáveis de ambiente na Vercel
echo 2. Atualize as URLs no Supabase
echo 3. Teste a aplicação
echo 4. Crie o super admin
echo.
echo Consulte INSTRUCOES_DEPLOY_VERCEL.md para detalhes
echo ========================================

pause
