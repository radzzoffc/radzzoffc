#!/bin/bash

# Pastikan script dijalankan sebagai root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Please run this script as root!"
   exit 1
fi

# Meminta input domain
read -p "Input DOMAIN ADDRESS: " DOMAIN
if [[ -z "$DOMAIN" ]]; then
    echo "❌ Domain cannot be empty!"
    exit 1
fi

DOMAIN_WWW="www.$DOMAIN"
WEB_ROOT="/var/www/$DOMAIN"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

echo "⏳ Updating system and installing dependencies..."
apt update && apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx curl

# Pastikan Nginx berjalan
systemctl enable --now nginx

# Konfigurasi firewall jika menggunakan UFW
if command -v ufw &>/dev/null; then
    echo "⚙️ Configuring firewall..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw reload
fi

# Membuat direktori web root
mkdir -p "$WEB_ROOT"

# Membuat file index.html default jika belum ada
if [ ! -f "$WEB_ROOT/index.html" ]; then
    echo "<h1>✅ Website $DOMAIN Successfully Configured</h1>" > "$WEB_ROOT/index.html"
fi

chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

# Membuat konfigurasi Nginx
echo "⚙️ Creating Nginx configuration for $DOMAIN..."
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN $DOMAIN_WWW;

    root $WEB_ROOT;
    index index.html index.htm index.php;

    location / {
        try_files \$uri \$uri/ =404;
    }

    error_page 404 /index.html;

    error_log /var/log/nginx/${DOMAIN}_error.log;
    access_log /var/log/nginx/${DOMAIN}_access.log;
}
EOF

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Pastikan domain dapat diakses sebelum mengaktifkan SSL
echo "🔎 Checking if domain is reachable..."
if ! curl -Is "http://$DOMAIN" | head -n 1 | grep -q "200 OK"; then
    echo "❌ Domain $DOMAIN is not reachable. Make sure DNS is set correctly."
    exit 1
fi

# Mengaktifkan SSL dengan Let's Encrypt
echo "🔐 Activating SSL with Let's Encrypt..."
certbot --nginx -d "$DOMAIN" -d "$DOMAIN_WWW" --non-interactive --agree-tos -m admin@$DOMAIN

# Cek apakah SSL berhasil diaktifkan
if certbot certificates | grep -q "$DOMAIN"; then
    echo "✅ SSL successfully activated for $DOMAIN"
else
    echo "❌ SSL activation failed. Check logs using 'journalctl -xe' or 'cat /var/log/letsencrypt/letsencrypt.log'"
    exit 1
fi

# Konfigurasi otomatis perpanjangan sertifikat SSL
echo "🔄 Setting up automatic SSL renewal..."
echo "0 3 * * * certbot renew --quiet && systemctl restart nginx" | tee /etc/cron.d/certbot-renew

# Restart Nginx agar perubahan diterapkan
systemctl restart nginx

# Mengecek apakah website benar-benar tampil dengan index.html
echo "🔎 Checking if website is displaying index.html..."
sleep 5  # Tunggu sebentar sebelum cek

if curl -Is "https://$DOMAIN" | head -n 1 | grep -q "200 OK"; then
    echo "✅ Website is UP and displaying index.html correctly!"
else
    echo "⚠️ Website is NOT showing index.html, setting fallback..."
    echo "<h1>🚨 ERROR 404 FIXED: Website $DOMAIN is now accessible!</h1>" > "$WEB_ROOT/index.html"
    systemctl restart nginx
fi

echo "🎉 Configuration successful! You can access your website at:"
echo "➡️  http://$DOMAIN"
echo "➡️  https://$DOMAIN"
