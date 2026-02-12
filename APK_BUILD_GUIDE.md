# Guide de création de l'APK Android - URBASEN

## Méthode 1 : PWA (Application Web Progressive) - RECOMMANDÉ

L'application URBASEN est une PWA (Progressive Web App). Elle peut être installée directement sur Android **sans créer de fichier APK**.

### Installation sur Android :

1. **Ouvrez Chrome** sur votre téléphone Android
2. **Allez sur l'URL** de l'application (ex: `http://votre-serveur:3000`)
3. **Appuyez sur le menu** (3 points en haut à droite)
4. **Sélectionnez "Ajouter à l'écran d'accueil"** ou "Installer l'application"
5. **Confirmez l'installation**

L'application sera installée comme une application native et fonctionnera hors ligne !

---

## Méthode 2 : Créer un vrai fichier APK

### Prérequis (obligatoires) :

1. **Node.js** (v18+) : https://nodejs.org/
2. **Java JDK 17+** : https://adoptium.net/
3. **Android Studio** : https://developer.android.com/studio
4. **Variables d'environnement** configurées :
   - `JAVA_HOME` → dossier JDK
   - `ANDROID_HOME` → dossier Android SDK

### Étapes détaillées :

#### 1. Modifier next.config.ts
Changez `output: "standalone"` à `output: "export"`

#### 2. Installer les dépendances
```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
```

#### 3. Build et export
```bash
npm run build
```

#### 4. Initialiser Capacitor
```bash
npx cap init URBASEN com.urbasen.gestion --web-dir out
```

#### 5. Ajouter la plateforme Android
```bash
npx cap add android
npx cap sync android
```

#### 6. Générer l'APK

**Option A : Avec Android Studio**
1. Ouvrez Android Studio
2. File → Open → Sélectionnez le dossier `android`
3. Attendez la synchronisation Gradle
4. Build → Build Bundle(s) / APK(s) → Build APK(s)

**Option B : En ligne de commande**
```bash
cd android
./gradlew assembleDebug
```

L'APK sera dans : `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Méthode 3 : Utiliser des services en ligne

### Appliku (gratuit)
1. Allez sur https://appliku.com/
2. Uploadez votre projet
3. Téléchargez l'APK généré

### Capacitor Cloud Build
1. Créez un compte sur Ionic
2. Utilisez leur service de build cloud

---

## Utilisation du script automatique

Exécutez `build-apk.bat` sur Windows pour configurer automatiquement le projet pour Android.

---

## Informations de l'application

- **Nom** : URBASEN - Gestion de Projet
- **Package ID** : com.urbasen.gestion
- **Version** : 1.0.0
- **Min SDK** : Android 5.0 (API 21)

---

© 2026 URBASEN - Développé par ABDOULAHI
