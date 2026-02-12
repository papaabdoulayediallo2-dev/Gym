@echo off
chcp 65001 >nul
title URBASEN - Menu de Déploiement

:menu
cls
echo.
echo ╔════════════════════════════════════════════════╗
echo ║   URBASEN - Menu de Déploiement               ║
echo ╠════════════════════════════════════════════════╣
echo ║                                                ║
echo ║   1. 🌐 Déployer sur Vercel (GRATUIT)         ║
echo ║   2. 🐳 Déployer avec Docker                  ║
echo ║   3. 🖥️  Lancer en local (réseau interne)      ║
echo ║   4. 📱 Guide installation mobile             ║
echo ║   5. 📖 Guide complet de déploiement          ║
echo ║   6. ❌ Quitter                               ║
echo ║                                                ║
echo ╚════════════════════════════════════════════════╝
echo.
set /p choice=Votre choix (1-6) :

if "%choice%"=="1" goto vercel
if "%choice%"=="2" goto docker
if "%choice%"=="3" goto local
if "%choice%"=="4" goto mobile
if "%choice%"=="5" goto guide
if "%choice%"=="6" goto end

goto menu

:vercel
cls
echo.
echo ════════════════════════════════════════════════
echo    Déploiement sur Vercel
echo ════════════════════════════════════════════════
echo.
echo Vercel offre un hébergement GRATUIT pour les
echo applications Next.js avec :
echo.
echo  ✓ HTTPS automatique
echo  ✓ Domaine gratuit (.vercel.app)
echo  ✓ Déploiement continu
echo  ✓ CDN mondial
echo.
echo ────────────────────────────────────────────────
echo.
call deploy-vercel.bat
pause
goto menu

:docker
cls
echo.
echo ════════════════════════════════════════════════
echo    Déploiement avec Docker
echo ════════════════════════════════════════════════
echo.

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Docker n'est pas installé !
    echo.
    echo Téléchargez Docker Desktop depuis :
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    goto menu
)

echo [1/3] Build de l'image Docker...
docker build -t urbasen .

echo [2/3] Arrêt du conteneur existant...
docker stop urbasen-app 2>nul
docker rm urbasen-app 2>nul

echo [3/3] Démarrage du conteneur...
docker run -d -p 3000:3000 --name urbasen-app urbasen

echo.
echo ════════════════════════════════════════════════
echo    Application démarrée !
echo ════════════════════════════════════════════════
echo.
echo Accédez à l'application : http://localhost:3000
echo.
pause
goto menu

:local
cls
echo.
echo ════════════════════════════════════════════════
echo    Lancement en local (réseau interne)
echo ════════════════════════════════════════════════
echo.

:: Obtenir l'IP locale
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP: =%

echo Votre IP locale : %LOCAL_IP%
echo.
echo L'application sera accessible sur votre réseau à :
echo http://%LOCAL_IP%:3000
echo.
echo ────────────────────────────────────────────────
echo.
echo Appuyez sur Ctrl+C pour arrêter le serveur.
echo.

call npm run dev

pause
goto menu

:mobile
cls
echo.
echo ════════════════════════════════════════════════
echo    Installation sur Mobile (Android/iOS)
echo ════════════════════════════════════════════════
echo.
echo 📱 ANDROID :
echo.
echo   1. Ouvrez Chrome sur votre téléphone
echo   2. Allez à l'URL de votre application
echo   3. Menu (3 points) → "Ajouter à l'écran d'accueil"
echo   4. L'application s'installe comme une app native !
echo.
echo ────────────────────────────────────────────────
echo.
echo 🍎 iOS (iPhone/iPad) :
echo.
echo   1. Ouvrez Safari sur votre iPhone
echo   2. Allez à l'URL de votre application
echo   3. Bouton Partager → "Sur l'écran d'accueil"
echo   4. L'application s'installe sur votre écran !
echo.
echo ════════════════════════════════════════════════
echo.
pause
goto menu

:guide
cls
type DEPLOYMENT_GUIDE.md
echo.
pause
goto menu

:end
echo.
echo Au revoir !
echo.
timeout /t 2 >nul
exit
