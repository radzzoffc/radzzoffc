#!/bin/bash

if [[ $EUID -ne 0 ]]; then
   echo "Please run with root acces" 
   exit 1
fi

read -p "input DOMAIN ADDRES: " DOMAIN
if [[ -z "$DOMAIN" ]]; then
    echo "Domain don't empty"
    exit 1
fi

DOMAIN_WWW="www.$DOMAIN"

echo "⏳ Updating and Upgrade your system..."
apt update && apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx
systemctl enable --now nginx

WEB_ROOT="/root/$DOMAIN"
mkdir -p "$WEB_ROOT"

if [ ! -f "$WEB_ROOT/index.html" ]; then
    echo "<h1>Website $DOMAIN Succes Configurate</h1>" > "$WEB_ROOT/index.html"
fi

chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

echo "⚙️ Creating Nginx configurating $DOMAIN..."
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN $DOMAIN_WWW;

    root $WEB_ROOT;
    index index.html index.htm index.php;

    location / {
        try_files \$uri \$uri/ =404;
    }

    error_log /var/log/nginx/${DOMAIN}_error.log;
    access_log /var/log/nginx/${DOMAIN}_access.log;
}
EOF

ln -s "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
echo "🔐 Activate SSL with Let's Encrypt..."
certbot --nginx -d "$DOMAIN" -d "$DOMAIN_WWW" --non-interactive --agree-tos -m admin@$DOMAIN

# Cek apakah SSL berhasil
if certbot certificates | grep -q "$DOMAIN"; then
    echo "✅ SSL activate succes for $DOMAIN"
else
    echo "❌ SSL failed to activate, please check  error logs"
fi

# Atur pembaruan otomatis SSL
echo "🔄 Setting auto update SSL..."
echo "0 3 * * * certbot renew --quiet" | tee /etc/cron.d/certbot-renew

# Restart Nginx
systemctl restart nginx

echo "🎉 Configuration succes, now u can acces from:"
echo "➡️  http://$DOMAIN"
echo "➡️  https://$DOMAIN"
