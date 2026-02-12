#!/bin/bash

# ================================================
#    URBASEN - Déploiement sur serveur VPS
# ================================================

# Configuration - MODIFIEZ CES VALEURS
SERVER_USER="root"
SERVER_IP="VOTRE_IP"
SERVER_PATH="/var/www/urbasen"
DOMAIN="votre-domaine.com"

echo "=========================================="
echo "   URBASEN - Déploiement VPS"
echo "=========================================="

# Vérifier que les variables sont configurées
if [ "$SERVER_IP" = "VOTRE_IP" ]; then
    echo "[ERREUR] Veuillez configurer le script avec vos informations"
    echo "Modifiez les variables SERVER_USER, SERVER_IP, SERVER_PATH et DOMAIN"
    exit 1
fi

echo "[1/4] Build de l'application..."
npm run build

echo "[2/4] Transfert des fichiers vers le serveur..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    ./ $SERVER_USER@$SERVER_IP:$SERVER_PATH

echo "[3/4] Installation et démarrage sur le serveur..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /var/www/urbasen
npm install --production
npm run build
pm2 delete urbasen 2>/dev/null || true
pm2 start npm --name "urbasen" -- start
pm2 save
ENDSSH

echo "[4/4] Configuration Nginx..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
if [ ! -f /etc/nginx/sites-available/urbasen ]; then
    cat > /etc/nginx/sites-available/urbasen << 'NGINX'
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX
    ln -s /etc/nginx/sites-available/urbasen /etc/nginx/sites-enabled/
    nginx -t && systemctl restart nginx
fi
ENDSSH

echo "=========================================="
echo "   Déploiement terminé !"
echo "=========================================="
echo ""
echo "Votre application est accessible à :"
echo "http://$DOMAIN"
echo ""
echo "Pour configurer HTTPS, exécutez sur le serveur :"
echo "certbot --nginx -d $DOMAIN"
