#!/bin/bash

# Pastikan script dijalankan sebagai root
if [[ $EUID -ne 0 ]]; then
   echo "Harap jalankan script sebagai root" 
   exit 1
fi

# Minta user memasukkan domain
read -p "Masukkan nama domain (tanpa www): " DOMAIN

# Validasi input
if [[ -z "$DOMAIN" ]]; then
    echo "Domain tidak boleh kosong!"
    exit 1
fi

# Tambahkan www
DOMAIN_WWW="www.$DOMAIN"

# Update sistem & install paket yang dibutuhkan
echo "⏳ Mengupdate sistem & menginstall Nginx, Certbot..."
apt update && apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx

# Pastikan Nginx aktif
systemctl enable --now nginx

# Buat direktori website di root SFTP (/root)
WEB_ROOT="/root/$DOMAIN"
mkdir -p "$WEB_ROOT"

# Buat file index.html jika belum ada
if [ ! -f "$WEB_ROOT/index.html" ]; then
    echo "<h1>Website $DOMAIN Berhasil Dikonfigurasi!</h1>" > "$WEB_ROOT/index.html"
fi

# Set izin akses
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

# Buat konfigurasi Nginx
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

echo "⚙️ Membuat konfigurasi Nginx untuk $DOMAIN..."
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

# Aktifkan konfigurasi
ln -s "$NGINX_CONF" /etc/nginx/sites-enabled/

# Hapus default config jika ada
rm -f /etc/nginx/sites-enabled/default

# Cek konfigurasi & restart Nginx
nginx -t && systemctl restart nginx

# Instal SSL menggunakan Let's Encrypt
echo "🔐 Mengaktifkan SSL dengan Let's Encrypt..."
certbot --nginx -d "$DOMAIN" -d "$DOMAIN_WWW" --non-interactive --agree-tos -m admin@$DOMAIN

# Cek apakah SSL berhasil
if certbot certificates | grep -q "$DOMAIN"; then
    echo "✅ SSL berhasil diaktifkan untuk $DOMAIN!"
else
    echo "❌ SSL gagal diaktifkan! Coba cek error log."
fi

# Atur pembaruan otomatis SSL
echo "🔄 Mengatur pembaruan otomatis SSL..."
echo "0 3 * * * certbot renew --quiet" | tee /etc/cron.d/certbot-renew

# Restart Nginx
systemctl restart nginx

echo "🎉 Konfigurasi selesai! Website dapat diakses di:"
echo "➡️  http://$DOMAIN"
echo "➡️  https://$DOMAIN"
