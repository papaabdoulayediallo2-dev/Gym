@echo off
chcp 65001 >nul
title Installation - System de gestion de projet URBASEN

echo.
echo ================================================
echo    System de gestion de projet URBASEN
echo    Installation et configuration
echo ================================================
echo.

:: Vérifier si Node.js est installé
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installé !
    echo.
    echo Veuillez installer Node.js depuis : https://nodejs.org/
    echo Choisissez la version LTS recommandée.
    echo.
    pause
    exit /b 1
)

:: Afficher la version de Node.js
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js détecté : %NODE_VERSION%
echo.

:: Vérifier si npm est installé
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] npm n'est pas installé !
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm détecté : %NPM_VERSION%
echo.

:: Installer les dépendances
echo [INFO] Installation des dépendances en cours...
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Erreur lors de l'installation des dépendances !
    pause
    exit /b 1
)

echo.
echo ================================================
echo    Installation terminée avec succès !
echo ================================================
echo.
echo Pour lancer l'application, exécutez : start.bat
echo Ou utilisez la commande : npm run dev
echo.
echo L'application sera accessible à : http://localhost:3000
echo.
pause
