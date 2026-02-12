# 🚀 URBASEN - System de Gestion de Projet

Application web complète de gestion de projets et de suivi financier par membre.

![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

---

## ✨ Fonctionnalités

### 👥 Gestion des Membres
- Ajout, modification, suppression de membres
- Code membre unique
- Coordonnées (email, téléphone)

### 📁 Gestion des Projets
- Création de projets avec code unique
- Attribution de budgets aux membres
- Gestion des autres frais
- Totaux automatiques

### 💰 Allocations
- Enregistrement des versements
- Contrôle automatique des budgets
- Historique complet
- Numéros de chèques

### 📊 Suivi
- Suivi par projet avec progression visuelle
- Suivi par membre
- Reste à recevoir calculé automatiquement

### 📤 Export
- **JSON** - Pour intégration
- **CSV** - Compatible Excel
- **Excel** - Multi-feuilles

---

## 🛠️ Installation

### Windows

```bash
# Double-cliquez sur install.bat
# Ou en ligne de commande :
install.bat
```

### Linux/Mac

```bash
npm install
```

---

## 🚀 Démarrage

### Windows
```bash
# Double-cliquez sur start.bat
# Ou utilisez le menu :
deploy.bat
```

### Linux/Mac
```bash
npm run dev
```

L'application sera accessible à : **http://localhost:3000**

---

## 📱 Installation Mobile

L'application est une **PWA** (Progressive Web App) et peut être installée sur mobile :

### Android
1. Ouvrez Chrome
2. Allez à l'URL de l'application
3. Menu → "Ajouter à l'écran d'accueil"

### iOS
1. Ouvrez Safari
2. Allez à l'URL de l'application
3. Partager → "Sur l'écran d'accueil"

---

## 🌐 Déploiement

### Vercel (Gratuit - Recommandé)

```bash
npm install -g vercel
vercel
```

### Docker

```bash
docker build -t urbasen .
docker run -p 3000:3000 urbasen
```

### VPS

```bash
# Modifiez deploy-vps.sh avec vos infos
chmod +x deploy-vps.sh
./deploy-vps.sh
```

Voir [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) pour plus d'options.

---

## 📁 Structure du projet

```
urbasen/
├── src/
│   ├── app/
│   │   ├── page.tsx      # Application principale
│   │   ├── layout.tsx    # Layout avec PWA
│   │   └── globals.css   # Styles globaux
│   └── components/ui/    # Composants shadcn/ui
├── public/
│   ├── manifest.json     # Configuration PWA
│   └── icons/            # Icônes de l'app
├── install.bat           # Script installation Windows
├── start.bat             # Script démarrage Windows
├── deploy.bat            # Menu de déploiement
├── Dockerfile            # Image Docker
└── docker-compose.yml    # Configuration Docker Compose
```

---

## 🔧 Technologies

- **Framework** : Next.js 16
- **Langage** : TypeScript
- **Styles** : Tailwind CSS
- **UI** : shadcn/ui
- **Icons** : Lucide Icons
- **Stockage** : localStorage

---

## 📋 Configuration requise

- Node.js 18+
- npm ou bun
- 512 MB RAM minimum
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

---

## 🔒 Sécurité

- Données stockées localement (localStorage)
- Aucune donnée envoyée à des serveurs externes
- Application mono-utilisateur

---

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation dans le dossier
- Ouvrez une issue sur GitHub

---

## 👨‍💻 Auteur

**ABDOULAHI**

---

## 📄 License

MIT License - Libre d'utilisation

---

© 2026 URBASEN - Développé par ABDOULAHI
