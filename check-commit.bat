@echo off
echo Verificando status do Git...
git status
echo.
echo Verificando ultimos commits...
git log --oneline -3
echo.
echo Fazendo commit das correcoes...
git add .
git commit -m "fix: Corrigir erros de build para deploy na Vercel"
echo.
echo Commit realizado!
git log --oneline -1
