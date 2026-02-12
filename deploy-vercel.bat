@echo off
chcp 65001 >nul
title Déploiement Vercel - URBASEN

echo.
echo ================================================
echo    URBASEN - Déploiement sur Vercel
echo ================================================
echo.

:: Vérifier Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installé !
    echo Téléchargez depuis : https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js détecté
echo.

:: Vérifier si Vercel CLI est installé
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Installation de Vercel CLI...
    call npm install -g vercel
)

echo.
echo ================================================
echo    INSTRUCTIONS
echo ================================================
echo.
echo 1. Vous allez être redirigé vers le navigateur
echo 2. Connectez-vous ou créez un compte Vercel
echo 3. Confirmez les paramètres de déploiement
echo 4. Votre application sera en ligne !
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

echo.
echo [INFO] Lancement du déploiement...
echo.

call vercel --prod

echo.
echo ================================================
echo    Déploiement terminé !
echo ================================================
echo.
echo Votre application est en ligne sur Vercel.
echo Connectez-vous à https://vercel.com pour gérer votre app.
echo.
pause
