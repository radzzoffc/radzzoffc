// **SITE KEY DI-HIDE MENGGUNAKAN ENCODING**
const encodedKey = "MHg0QUFBQUFBQThHcDFmT25GcjVZYmZwCg=="; // Base64 Encoded Key
const siteKey = "0x4AAAAAAA8Gp1fOnFr5Ybfp";

// Inject Turnstile Captcha ke halaman
document.getElementById("captcha-container").innerHTML = `<div class="cf-turnstile" data-sitekey="${siteKey}"></div>`;

document.getElementById("captchaForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const token = document.querySelector("[name='cf-turnstile-response']")?.value;
    const honeypot = document.querySelector("[name='honeypot']").value;

    if (honeypot) {
        window.location.href = "https://google.com"; // Redirect ke jebakan bot
        return;
    }

    if (!token) {
        document.getElementById("status").innerText = "Silakan selesaikan Captcha!";
        return;
    }

    // Simulasi verifikasi sukses (karena tanpa backend)
    setTimeout(() => {
        window.location.href = "success.html";
    }, 1000);
});
