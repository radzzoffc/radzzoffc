document.addEventListener("DOMContentLoaded", function () {
    const siteKey = "0x4AAAAAAA8Gp1fOnFr5Ybfp"; // Site Key kamu

    // Inject Captcha ke halaman
    document.getElementById("captcha-container").innerHTML = 
        `<div class="cf-turnstile" data-sitekey="${siteKey}"></div>`;

    document.getElementById("captchaForm").addEventListener("submit", function(event) {
        event.preventDefault();
        
        const token = document.querySelector("[name='cf-turnstile-response']")?.value;
        const honeypot = document.querySelector("[name='honeypot']").value;

        // 🔥 Kalau bot terdeteksi, redirect ke honeypot
        if (honeypot) {
            window.location.href = "https://google.com"; // Ganti dengan URL jebakan
            return;
        }

        // Kalau Captcha belum diisi, kasih fake error delay
        if (!token) {
            document.getElementById("status").innerText = "Sistem mendeteksi aktivitas mencurigakan...";
            setTimeout(() => {
                document.getElementById("status").innerText = "Akses Ditolak! Bot terdeteksi.";
            }, 3000);
            return;
        }

        // Kalau lolos Captcha, redirect normal ke success.html
        setTimeout(() => {
            window.location.href = "radzz.html";
        }, 1000);
    });
});
