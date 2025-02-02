const API_TOKEN = "4c1c76803b8b9a1a8737a85ab1cecbc8";
const ZONE_ID = "f63cd8c329dbba04cf6f5b83899fe41a";

// **Chart.js Konfigurasi**
let ctx = document.getElementById('attackChart').getContext('2d');
let attackChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Jumlah Serangan DDoS',
            data: [],
            borderColor: '#ff4444',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        }
    }
});

// **Ambil Data dari Cloudflare**
async function getCloudflareDDoSData() {
    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/analytics/dashboard?since=-3600&continuous=true`, {
            headers: {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        if (data.success) {
            const attackCount = data.result.totals.all.requests.cached + data.result.totals.all.requests.uncached;
            const rps = data.result.totals.all.requests.cached / 60;
            const topIP = data.result.totals.all.topIps[0]?.ip || "Tidak ada data";

            localStorage.setItem('attackCount', attackCount);

            document.getElementById('attack-count').textContent = attackCount;
            document.getElementById('rps').textContent = rps.toFixed(2);
            document.getElementById('top-ip').textContent = topIP;

            updateChart(attackCount);
        } else {
            document.getElementById('attack-count').textContent = "Gagal mengambil data";
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// **Update Grafik Serangan**
function updateChart(newData) {
    let now = new Date().toLocaleTimeString();
    if (attackChart.data.labels.length >= 10) {
        attackChart.data.labels.shift();
        attackChart.data.datasets[0].data.shift();
    }
    attackChart.data.labels.push(now);
    attackChart.data.datasets[0].data.push(newData);
    attackChart.update();
}

// **Reset Counter (Hanya UI, Data Masih di Cloudflare)**
function resetCounter() {
    localStorage.setItem('attackCount', 0);
    document.getElementById('attack-count').textContent = 0;
}

// **Ambil data pertama kali & update setiap 5 detik**
document.addEventListener('DOMContentLoaded', () => {
    getCloudflareDDoSData();
    setInterval(getCloudflareDDoSData, 5000);
});
