# System de gestion de projet URBASEN

Application web de gestion de projets et de suivi financier par membre.

## Installation sur Windows

### Prérequis

1. **Node.js** (version 18 ou supérieure)
   - Téléchargez depuis : https://nodejs.org/
   - Choisissez la version LTS recommandée
   - Installez avec les options par défaut

### Étapes d'installation

#### Méthode 1 : Utilisation des fichiers .bat (Recommandé)

1. **Double-cliquez sur `install.bat`**
   - Ce script vérifie que Node.js est installé
   - Installe toutes les dépendances nécessaires

2. **Double-cliquez sur `start.bat`**
   - Lance l'application
   - L'application sera accessible à : http://localhost:3000

#### Méthode 2 : Utilisation de la ligne de commande

1. Ouvrez l'invite de commandes (cmd) ou PowerShell
2. Naviguez vers le dossier du projet :
   ```
   cd chemin\vers\le\projet
   ```
3. Installez les dépendances :
   ```
   npm install
   ```
4. Lancez l'application :
   ```
   npm run dev
   ```
5. Ouvrez votre navigateur à : http://localhost:3000

## Fonctionnalités

- **Gestion des membres** : Ajout, modification, suppression
- **Gestion des projets** : Création avec budgets et frais
- **Allocations** : Versements aux membres avec contrôle budget
- **Suivi par projet** : Vue d'ensemble des budgets et versements
- **Suivi par membre** : Historique par membre
- **Export** : JSON, CSV, Excel

## Structure des données

Toutes les données sont sauvegardées automatiquement dans le localStorage du navigateur.

## Support

© 2026 URBASEN - Développé par ABDOULAHI
