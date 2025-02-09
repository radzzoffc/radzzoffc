<?php
session_start();
if (!isset($_SESSION["verified"])) {
    header("Location: index.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Berhasil!</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>🎉 Selamat! 🎉</h1>
        <p>Anda telah berhasil melewati verifikasi.</p>
    </div>
</body>
</html>
