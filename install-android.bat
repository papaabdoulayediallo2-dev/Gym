@echo off
chcp 65001 >nul
title Installation Android - URBASEN

echo.
echo ================================================
echo    URBASEN - Installation sur Android
echo ================================================
echo.
echo Cette application est une PWA (Progressive Web App).
echo Elle peut être installée directement depuis Chrome.
echo.
echo ================================================
echo    INSTRUCTIONS D'INSTALLATION
echo ================================================
echo.
echo 1. Démarrez l'application sur votre PC avec start.bat
echo.
echo 2. Sur votre téléphone Android :
echo    - Ouvrez Chrome
echo    - Allez à l'adresse : http://[IP_DU_PC]:3000
echo    (Remplacez [IP_DU_PC] par l'IP de votre ordinateur)
echo.
echo 3. Installez l'application :
echo    - Appuyez sur le menu (3 points)
echo    - Sélectionnez "Ajouter à l'écran d'accueil"
echo    - Confirmez l'installation
echo.
echo 4. L'application sera installée comme une app native !
echo.
echo ================================================
echo.
echo Pour créer un vrai fichier APK, consultez :
echo APK_BUILD_GUIDE.md
echo.
echo ================================================
echo.
echo Voulez-vous démarrer l'application maintenant ? (O/N)
set /p choice=Votre choix :

if /i "%choice%"=="O" (
    echo.
    echo Démarrage de l'application...
    call npm run dev
) else (
    echo.
    echo Pour démarrer plus tard, exécutez : start.bat
)
echo.
pause
