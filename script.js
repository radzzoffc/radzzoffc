document.addEventListener("DOMContentLoaded", function () {
    const siteKey = "0x4AAAAAAA8Gp1fOnFr5Ybfp"; // Site Key yang kamu kasih

    // Inject Captcha ke halaman
    document.getElementById("captcha-container").innerHTML = 
        `<div class="cf-turnstile" data-sitekey="${siteKey}"></div>`;

    document.getElementById("captchaForm").addEventListener("submit", function(event) {
        event.preventDefault();
        
        const token = document.querySelector("[name='cf-turnstile-response']")?.value;
        const honeypot = document.querySelector("[name='honeypot']").value;

        // Jika bot mengisi honeypot, redirect ke jebakan
        if (honeypot) {
            window.location.href = "https://google.com";
            return;
        }

        // Jika Captcha belum diisi
        if (!token) {
            document.getElementById("status").innerText = "Selesaikan chaptcha dulu woee!";
            return;
        }

        // Redirect ke halaman sukses setelah verifikasi selesai
        setTimeout(() => {
            window.location.href = "radzz.html";
        }, 1000);
    });
});
