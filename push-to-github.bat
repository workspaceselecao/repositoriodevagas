@echo off
echo ========================================
echo    PUSH PARA GITHUB - REPOSITORIO VAGAS
echo ========================================
echo.

echo [1/3] Verificando status do Git...
git status
echo.

echo [2/3] Verificando commits pendentes...
git log --oneline -5
echo.

echo [3/3] Fazendo push para origin main...
git push origin main
echo.

echo ========================================
echo    PUSH CONCLUIDO!
echo ========================================
echo.
echo Verifique no GitHub se as alteracoes foram enviadas:
echo - Sistema de filtro do super admin
echo - Painel de controle na sidebar
echo - Botao voltar no painel
echo - Correcoes de build para Vercel
echo ========================================

pause
