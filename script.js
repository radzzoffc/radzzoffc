const honeypotURL = "https://google.com"; // Ganti dengan web penampung DDoS

// Ambil data lama dari localStorage (biar live time)
let totalRequests = parseInt(localStorage.getItem("totalRequests")) || 0;
let mitigatedRequests = parseInt(localStorage.getItem("mitigatedRequests")) || 0;

// Tampilkan data awal
document.getElementById("requestCount").innerText = totalRequests;
document.getElementById("mitigatedCount").innerText = mitigatedRequests;

// Deteksi request asli dari fetch & XMLHttpRequest
function trackRequest() {
    totalRequests++;
    localStorage.setItem("totalRequests", totalRequests);
    document.getElementById("requestCount").innerText = totalRequests;

    // Jika lebih dari 500 request aktif, redirect ke honeypot & tambah mitigasi
    if (totalRequests > 500) {
        document.getElementById("status").innerText = "DDoS terdeteksi, Redirecting...";
        
        mitigatedRequests++;
        localStorage.setItem("mitigatedRequests", mitigatedRequests);
        document.getElementById("mitigatedCount").innerText = mitigatedRequests;
        
        setTimeout(() => {
            window.location.href = honeypotURL;
        }, 1000);
    } else {
        document.getElementById("status").innerText = "Trafik normal";
    }
}

// Intercept fetch API (untuk menangkap request asli)
const originalFetch = window.fetch;
window.fetch = function(...args) {
    trackRequest();
    return originalFetch.apply(this, args);
};

// Intercept XMLHttpRequest (untuk menangkap request AJAX)
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    xhr.addEventListener("load", trackRequest);
    return xhr;
};

// Reset data setiap 30 menit
setInterval(() => {
    totalRequests = 0;
    mitigatedRequests = 0;
    localStorage.setItem("totalRequests", totalRequests);
    localStorage.setItem("mitigatedRequests", mitigatedRequests);

    document.getElementById("requestCount").innerText = totalRequests;
    document.getElementById("mitigatedCount").innerText = mitigatedRequests;
    document.getElementById("status").innerText = "Data direset otomatis";

}, 5 * 60 * 1000); // 5 menit dalam milidetik
