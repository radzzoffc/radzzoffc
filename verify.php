<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $captcha_response = $_POST["cf-turnstile-response"];
    $honeypot = $_POST["honeypot"]; // Jika bot mengisi ini, dia akan terkena jebakan
    
    // Jika honeypot terisi (bot), alihkan ke jebakan
    if (!empty($honeypot)) {
        header("Location: ddos.php");
        exit();
    }

    if (!$captcha_response) {
        die("Verifikasi gagal. Silakan coba lagi.");
    }

    $secret_key = "YOUR_CLOUDFLARE_SECRET_KEY"; // Ganti dengan SECRET KEY Cloudflare
    $verify_url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    
    $data = [
        "secret" => $secret_key,
        "response" => $captcha_response
    ];

    $options = [
        "http" => [
            "header"  => "Content-type: application/x-www-form-urlencoded\r\n",
            "method"  => "POST",
            "content" => http_build_query($data)
        ]
    ];

    $context  = stream_context_create($options);
    $result = file_get_contents($verify_url, false, $context);
    $response = json_decode($result, true);

    if ($response["success"]) {
        $_SESSION["verified"] = true;
        header("Location: success.php");
        exit();
    } else {
        die("Verifikasi gagal. Silakan coba lagi.");
    }
}
?>
