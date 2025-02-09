document.addEventListener("DOMContentLoaded", function () {
    const siteKey = "0x4AAAAAAA8Gp1fOnFr5Ybfp"; // Site Key kamu
    let humanInteraction = false; // Deteksi aktivitas user
    
    // 🔥 Cek kalau user beneran interaksi
    document.addEventListener("mousemove", () => humanInteraction = true);
    document.addEventListener("keydown", () => humanInteraction = true);
    document.addEventListener("scroll", () => humanInteraction = true);
    
    // Inject Captcha ke halaman
    document.getElementById("captcha-container").innerHTML = 
        `<div class="cf-turnstile" data-sitekey="${siteKey}"></div>`;

    document.getElementById("captchaForm").addEventListener("submit", function(event) {
        event.preventDefault();
        
        const token = document.querySelector("[name='cf-turnstile-response']")?.value;
        const honeypot = document.querySelector("[name='honeypot']").value;

        // 🔥 1. Kalau bot terdeteksi dari honeypot, redirect ke jebakan
        if (honeypot) {
            window.location.href = "https://google.com"; 
            return;
        }

        // 🔥 2. Kalau Captcha langsung keisi tanpa aktivitas manusia = bot!
        if (!humanInteraction) {
            document.getElementById("status").innerText = "Sistem mendeteksi auto-fill Captcha, Bot terdeteksi";

            // **Bikin browser bot crash & stuck**
            setTimeout(() => {
                for (let i = 0; i < 1000; i++) {
                    history.pushState({}, "", "#bot-" + i);
                }

                // **Infinite loop buat freeze bot**
                setTimeout(() => {
                    while (true) {
                        console.log("Bot detected, Stuck here forever");
                    }
                }, 5000);
            }, 3000);
            return;
        }

        // 🔥 3. Kalau lolos Captcha dengan interaksi manusia, lanjut ke success.html
        setTimeout(() => {
            window.location.href = "radzz.html";
        }, 1000);
    });
});
