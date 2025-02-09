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
            window.location.href = "https://example.com/honeypot";
            return;
        }

        // Jika Captcha belum diisi
        if (!token) {
            document.getElementById("status").innerText = "Silakan selesaikan Captcha!";
            return;
        }

        // Redirect ke halaman sukses setelah verifikasi selesai
        setTimeout(() => {
            window.location.href = "success.html";
        }, 1000);
    });
});
