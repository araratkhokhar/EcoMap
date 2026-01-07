@echo off
echo ===========================================
echo   EcoMap One-Click Deployer 🚀
echo ===========================================

echo 1. Staging all changes...
git add .

echo 2. Committing changes...
git commit -m "update: automatic deployment %date% %time%"

echo 3. Pushing to GitHub (and Railway)...
git push origin main

echo ===========================================
echo   DONE! Railway should be building now.
echo ===========================================
pause
