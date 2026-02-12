# Guide de Déploiement - URBASEN

## 🌐 Options de déploiement

### Option 1 : Vercel (GRATUIT - Recommandé)

**Le plus simple** - Déploiement en 5 minutes !

1. Créez un compte sur https://vercel.com
2. Installez Vercel CLI :
   ```bash
   npm install -g vercel
   ```
3. Dans le dossier du projet, lancez :
   ```bash
   vercel
   ```
4. Suivez les instructions (connectez votre compte)
5. Votre app sera en ligne à : `https://urbasen.vercel.app`

**Avantages :**
- Gratuit pour les projets personnels
- HTTPS automatique
- Déploiement continu (connectez GitHub)
- Domaine personnalisé gratuit

---

### Option 2 : Netlify (GRATUIT)

1. Créez un compte sur https://netlify.com
2. Modifiez `next.config.ts` :
   ```typescript
   output: "export"
   ```
3. Build et export :
   ```bash
   npm run build
   ```
4. Sur Netlify, glissez-déposez le dossier `out`

---

### Option 3 : Serveur VPS (DigitalOcean, OVH, etc.)

#### Prérequis
- Un serveur Ubuntu/Debian
- Node.js installé sur le serveur

#### Étapes

1. **Connectez-vous au serveur**
   ```bash
   ssh root@votre-ip
   ```

2. **Installez Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

3. **Installez PM2** (gestionnaire de processus)
   ```bash
   sudo npm install -g pm2
   ```

4. **Transférez les fichiers** (depuis votre PC)
   ```bash
   scp -r /chemin/vers/urbasen root@votre-ip:/var/www/
   ```

5. **Sur le serveur, installez et lancez**
   ```bash
   cd /var/www/urbasen
   npm install
   npm run build
   pm2 start npm --name "urbasen" -- start
   ```

6. **Configurez Nginx**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/urbasen
   ```

   Contenu :
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Activez :
   ```bash
   sudo ln -s /etc/nginx/sites-available/urbasen /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

### Option 4 : Serveur local (réseau interne)

Pour utiliser l'application sur votre réseau local :

1. **Lancez l'application**
   ```bash
   npm run dev
   ```

2. **Trouvez votre IP locale**
   - Windows : `ipconfig`
   - Mac/Linux : `ifconfig` ou `ip addr`

3. **Accédez depuis n'importe quel appareil**
   ```
   http://VOTRE_IP_LOCALE:3000
   ```

---

### Option 5 : Docker

1. **Créez le Dockerfile** (déjà fourni)
2. **Build l'image**
   ```bash
   docker build -t urbasen .
   ```
3. **Lancez le conteneur**
   ```bash
   docker run -p 3000:3000 urbasen
   ```

---

## 🔒 Configuration HTTPS (SSL gratuit)

### Avec Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

Renouvellement automatique :
```bash
sudo certbot renew --dry-run
```

---

## 📱 Déploiement mobile

Une fois déployée, l'application PWA peut être installée sur :

- **Android** : Chrome → Menu → "Ajouter à l'écran d'accueil"
- **iOS** : Safari → Partager → "Sur l'écran d'accueil"

---

## 🔄 Déploiement continu (CI/CD)

### Avec GitHub + Vercel

1. Poussez votre code sur GitHub
2. Connectez votre repo à Vercel
3. Chaque push = déploiement automatique !

### Avec GitHub Actions

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - # Ajoutez votre étape de déploiement ici
```

---

## 🌍 Domaine personnalisé

1. Achetez un domaine (Namecheap, OVH, Gandi...)
2. Configurez les DNS :
   - Type A → IP de votre serveur
   - Ou utilisez les DNS de Vercel/Netlify
3. Attendez la propagation (jusqu'à 48h)

---

## 📊 Tableau comparatif

| Option | Coût | Difficulté | Performance |
|--------|------|------------|-------------|
| Vercel | Gratuit | ⭐ Très facile | ⭐⭐⭐⭐⭐ |
| Netlify | Gratuit | ⭐ Très facile | ⭐⭐⭐⭐⭐ |
| VPS | 5-20€/mois | ⭐⭐⭐ Moyen | ⭐⭐⭐⭐ |
| Local | Gratuit | ⭐ Facile | ⭐⭐⭐ |
| Docker | Variable | ⭐⭐ Facile | ⭐⭐⭐⭐ |

---

© 2026 URBASEN - Développé par ABDOULAHI
