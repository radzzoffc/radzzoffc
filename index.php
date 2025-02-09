<?php
session_start();
$ip = $_SERVER['REMOTE_ADDR']; // Ambil IP pengunjung

// Log IP untuk mendeteksi serangan
$file = "logs.txt";
file_put_contents($file, "$ip\n", FILE_APPEND);

?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script> <!-- Cloudflare Turnstile -->
</head>
<body>
    <div class="container">
        <h1>⚡ Selamat Datang ⚡</h1>
        <p>IP Anda: <strong><?php echo $ip; ?></strong></p>

        <form action="verify.php" method="post">
            <div class="cf-turnstile" data-sitekey="YOUR_CLOUDFLARE_SITE_KEY"></div> <!-- Ganti dengan SITE KEY Cloudflare -->
            
            <!-- Honeypot Field (Hidden untuk manusia, terbaca oleh bot) -->
            <input type="text" name="honeypot" style="display:none;">
            
            <br>
            <button type="submit">Verifikasi</button>
        </form>
    </div>
</body>
</html>
