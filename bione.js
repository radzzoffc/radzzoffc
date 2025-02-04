const ctx = document.getElementById('trafficChart').getContext('2d');
const trafficChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [], 
    datasets: [{
      label: 'Traffic Volume',
      data: [],
      borderColor: '#00ff00',
      backgroundColor: 'rgba(0, 255, 0, 0.1)',
      borderWidth: 2,
      fill: true,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          color: '#00ff00'
        },
        grid: {
          color: '#333'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Requests',
          color: '#00ff00'
        },
        grid: {
          color: '#333'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#00ff00'
        }
      }
    }
  }
});

function addData(label, data) {
  trafficChart.data.labels.push(label);
 trafficChart.data.datasets[0].data.push(data);
  if (trafficChart.data.labels.length > 15) {
    trafficChart.data.labels.shift();
    trafficChart.data.datasets[0].data.shift();
  }

  trafficChart.update();
  const threshold = 1000; 
  if (data > threshold) {
    document.getElementById('statusText').innerHTML = 'Status: <span class="alert">🚨 DDoS Attack Detected!</span>';
  } else {
    document.getElementById('statusText').innerHTML = 'Status: <span class="normal">Normal</span>';
  }
}

async function fetchTrafficData() {
  try {
    const response = await fetch('https://api.example.com/traffic');
    const data = await response.json();
    const traffic = data.requests; 
    const now = new Date().toLocaleTimeString();
    addData(now, traffic);
  } catch (error) {
    console.error('Error fetching traffic data:', error);
  }
}

setInterval(fetchTrafficData, 2000);
