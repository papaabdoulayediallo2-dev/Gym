@echo off
chcp 65001 >nul
title Build APK - URBASEN

echo.
echo ================================================
echo    URBASEN - Génération du fichier APK
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

:: Vérifier Java JDK
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Java JDK n'est pas installé !
    echo Téléchargez depuis : https://adoptium.net/
    pause
    exit /b 1
)

:: Vérifier ANDROID_HOME
if "%ANDROID_HOME%"=="" (
    if "%ANDROID_SDK_ROOT%"=="" (
        echo [ERREUR] Android SDK n'est pas configuré !
        echo.
        echo Veuillez installer Android Studio : https://developer.android.com/studio
        echo Et configurer la variable d'environnement ANDROID_HOME
        pause
        exit /b 1
    )
)

echo [OK] Prérequis vérifiés
echo.

:: Installer les dépendances
echo [1/5] Installation des dépendances npm...
call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] Erreur lors de l'installation npm
    pause
    exit /b 1
)

:: Installer Capacitor
echo [2/5] Installation de Capacitor...
call npm install @capacitor/core @capacitor/cli @capacitor/android
if %errorlevel% neq 0 (
    echo [ERREUR] Erreur lors de l'installation de Capacitor
    pause
    exit /b 1
)

:: Build Next.js en mode static
echo [3/5] Build de l'application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERREUR] Erreur lors du build
    pause
    exit /b 1
)

:: Export static
echo [4/5] Export statique...
if exist "out" rmdir /s /q "out"
call npx next export
if %errorlevel% neq 0 (
    echo [INFO] Tentative avec next build...
    :: Next.js 13+ utilise output: export dans next.config
)

:: Ajouter la plateforme Android
echo [5/5] Configuration Android...
call npx cap add android
call npx cap sync android

echo.
echo ================================================
echo    Configuration terminée !
echo ================================================
echo.
echo Pour générer l'APK :
echo.
echo 1. Ouvrez Android Studio
echo 2. Ouvrez le dossier "android" de ce projet
echo 3. Attendez la synchronisation Gradle
echo 4. Allez dans Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
echo.
echo L'APK sera généré dans :
echo android/app/build/outputs/apk/debug/app-debug.apk
echo.
echo OU utilisez la commande :
echo cd android ^&^& gradlew assembleDebug
echo.
pause
