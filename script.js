const honeypotURL = "https://google.com"; // Ganti dengan web penampung DDoS

// Ambil data lama dari localStorage (biar live time)
let totalRequests = parseInt(localStorage.getItem("totalRequests")) || 0;
let mitigatedRequests = parseInt(localStorage.getItem("mitigatedRequests")) || 0;

// Tampilkan data awal
document.getElementById("requestCount").innerText = totalRequests;
document.getElementById("mitigatedCount").innerText = mitigatedRequests;

function detectDDoS() {
    totalRequests++;

    // Simpan ke localStorage biar live time
    localStorage.setItem("totalRequests", totalRequests);

    // Update tampilan traffic secara live
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

// Reset data setiap 30 menit
setInterval(() => {
    totalRequests = 0;
    mitigatedRequests = 0;
    localStorage.setItem("totalRequests", totalRequests);
    localStorage.setItem("mitigatedRequests", mitigatedRequests);

    document.getElementById("requestCount").innerText = totalRequests;
    document.getElementById("mitigatedCount").innerText = mitigatedRequests;
    document.getElementById("status").innerText = "Data direset";

}, 30 * 60 * 1000); // 30 menit dalam milidetik

// Jalankan fungsi deteksi setiap 100ms
setInterval(detectDDoS, 100);
