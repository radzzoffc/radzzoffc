#!/bin/bash

# Pastikan script dijalankan sebagai root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Please run this script as root!"
   exit 1
fi

# Pilihan menu
echo "==============================="
echo "  🔧 Website Management Script"
echo "==============================="
echo "1) Install New Website"
echo "2) Uninstall Website"
echo "3) Exit"
read -p "Select option (1-3): " OPTION

if [[ "$OPTION" == "1" ]]; then
    read -p "Enter DOMAIN (example.com): " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        echo "❌ Domain cannot be empty!"
        exit 1
    fi

    DOMAIN_WWW="www.$DOMAIN"
    WEB_ROOT="/root/$DOMAIN"
    NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

    echo "⏳ Installing dependencies..."
    apt update && apt upgrade -y
    apt install -y nginx certbot python3-certbot-nginx curl

    # Pastikan Nginx berjalan
    systemctl enable --now nginx

    # Konfigurasi firewall jika UFW aktif
    if command -v ufw &>/dev/null; then
        echo "⚙️ Configuring firewall..."
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw reload
    fi

    # Membuat direktori web root di /root/ agar bisa diakses SFTP
    mkdir -p "$WEB_ROOT"
    chown -R www-data:www-data "$WEB_ROOT"
    chmod -R 755 "$WEB_ROOT"

    # Membuat file index.html default jika belum ada
    if [ ! -f "$WEB_ROOT/index.html" ]; then
        echo "<h1>✅ Website $DOMAIN Successfully Configured</h1>" > "$WEB_ROOT/index.html"
    fi

    # Konfigurasi Nginx
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

    # Cek apakah domain bisa diakses
    echo "🔎 Checking if domain is reachable..."
    if ! curl -Is "http://$DOMAIN" | head -n 1 | grep -q "200 OK"; then
        echo "❌ Domain $DOMAIN is not reachable. Make sure DNS is set correctly."
        exit 1
    fi

    # Aktifkan SSL
    echo "🔐 Activating SSL with Let's Encrypt..."
    certbot --nginx -d "$DOMAIN" -d "$DOMAIN_WWW" --non-interactive --agree-tos -m admin@$DOMAIN

    # Cek apakah SSL aktif
    if certbot certificates | grep -q "$DOMAIN"; then
        echo "✅ SSL successfully activated for $DOMAIN"
    else
        echo "❌ SSL activation failed. Check logs using 'journalctl -xe' or 'cat /var/log/letsencrypt/letsencrypt.log'"
        exit 1
    fi

    # Konfigurasi auto-renew SSL
    echo "🔄 Setting up automatic SSL renewal..."
    echo "0 3 * * * certbot renew --quiet && systemctl restart nginx" | tee /etc/cron.d/certbot-renew

    # Restart Nginx
    systemctl restart nginx

    # Mengecek apakah website benar-benar tampil
    echo "🔎 Checking if website is displaying index.html..."
    sleep 5

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

elif [[ "$OPTION" == "2" ]]; then
    read -p "Enter DOMAIN to uninstall: " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        echo "❌ Domain cannot be empty!"
        exit 1
    fi

    NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
    WEB_ROOT="/root/$DOMAIN"

    echo "🛑 Uninstalling website $DOMAIN..."
    
    # Hapus Nginx Config
    rm -f "$NGINX_CONF"
    rm -f "/etc/nginx/sites-enabled/$DOMAIN"

    # Hapus SSL Certbot
    certbot delete --cert-name "$DOMAIN"

    # Hapus Folder Web
    rm -rf "$WEB_ROOT"

    # Restart Nginx
    systemctl restart nginx

    echo "✅ Website $DOMAIN has been removed successfully!"

else
    echo "❌ Invalid option. Exiting..."
    exit 1
fi
