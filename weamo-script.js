const d = new Date();

setInterval(()=>time.innerText=new Date().toLocaleTimeString(),1000);

document.querySelector('.date').innerText = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// THEME-SWITCH
let lightmode = localStorage.getItem('lightmode')
const themeSwitch = document.getElementById('switch')

const fontColors = {
  light: '#000000',
  dark: '#FFFFFF'
};

function getFontColor() {
  return document.body.classList.contains('lightmode') ? fontColors.light : fontColors.dark;
}

const enableLightmode = () => {
  document.body.classList.add('lightmode')
  localStorage.setItem('lightmode', 'active')
}

const disableLightmode = () => {
  document.body.classList.remove('lightmode')
  localStorage.setItem('lightmode', null)
}

if(lightmode === "active") enableLightmode()

themeSwitch.addEventListener("click", () => {
  lightmode = localStorage.getItem('lightmode')
  if (lightmode !== "active") {
    enableLightmode();
  } else {
    disableLightmode();
  }

  const newColor = getFontColor();

  myChart.options.scales.x.ticks.color = newColor;
  myChart.options.scales.y.ticks.color = newColor;
  myChart.options.scales.y.title.color = newColor;

  myChart.update();
});

//GRAPH
const graph = document.getElementById('graph');

let myChart = new Chart(graph, {
  type: 'line',
  data: {
    labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00'],
    datasets: [{
      data: [28, 26, 27, 23, 25, 28],
      borderColor: 'orange',
      fill: false,
      tension: 0.4
     }]
  },
   options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {legend: { display: false }},
    layout: { padding:10 },
    scales: {
      x: {
        grid: { display: false},
        ticks: {
          font: {size: 10}, 
          color: getFontColor()
        },
        title: {display: true}
      },
      y: {
        beginAtZero: false,
        ticks: {
          font: {size: 10},
          color: getFontColor()},
        grid: {display: false},
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: {size: 10},
          color: getFontColor()
        }
      }
    }
  }
});

//Fetching Real-time Data from Google Sheet
async function updateWeatherFromSheet() {
  const url = "https://script.google.com/macros/s/AKfycbxDgdVsFjB6kxWl9BltMlomz5HDqxWzbf4qQcuKhS3aLBHoNFmsJ-4WbTbaFiLCsrAv/exec";

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Sample: data = { windSpeed: "10 km/h", humidity: "85%", pressure: "1010 mbar", temperature: "28°", condition: "Sunny" }

    // Update DOM elements
     document.querySelector(".highlight-row:nth-child(1) .measurement").textContent = `${data["Wind"]} km/s`;
    document.querySelector(".highlight-row:nth-child(2) .measurement").textContent = `${data["Humidity"]}%`;
    document.querySelector(".highlight-row:nth-child(3) .measurement").textContent = `${data["Temperature"]}°`;
    document.querySelector(".highlight-row:nth-child(4) .measurement").textContent = `${data["Pressure"]} mbar`;
    document.querySelector(".cloud-label").textContent = `Cloud Type: ${data["CloudType"]}`;

    document.querySelector(".condition").textContent = data["WeatherCondition"];
    document.querySelector(".temp").textContent = `${data["Temperature"]}°`;

    // Optional: Change forecast image based on condition
    const forecastImage = document.querySelector('.forecastImage');
    const condition = data.WeatherCondition.toLowerCase();

    if (condition.includes("sunny")) {
      forecastImage.src = "png/Sunny.png";
    } else if (condition.includes("rainy")) {
      forecastImage.src = "png/rainyIcon.png";
    } else {
      forecastImage.src = "png/forecastIcon.png"; // default
    }

  } catch (error) {
    console.error("Failed to fetch weather data:", error);
  }
}

// Initial load
updateWeatherFromSheet();

// Auto-refresh every 10 seconds
setInterval(updateWeatherFromSheet, 3000);
