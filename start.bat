@echo off
chcp 65001 >nul
title System de gestion de projet URBASEN

echo.
echo ================================================
echo    System de gestion de projet URBASEN
echo    Démarrage de l'application
echo ================================================
echo.

:: Vérifier si node_modules existe
if not exist "node_modules" (
    echo [ERREUR] Les dépendances ne sont pas installées !
    echo.
    echo Veuillez d'abord exécuter : install.bat
    echo.
    pause
    exit /b 1
)

echo [INFO] Démarrage du serveur de développement...
echo.
echo L'application sera accessible à : http://localhost:3000
echo.
echo Appuyez sur Ctrl+C pour arrêter le serveur.
echo.
echo ================================================
echo.

call npm run dev

pause
