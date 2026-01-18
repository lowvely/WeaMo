const d = new Date();

setInterval(() => time.innerText = new Date().toLocaleTimeString(), 1000);

document.querySelector('.date').innerText = d.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// THEME-SWITCH
let lightmode = localStorage.getItem('lightmode')
const themeSwitch = document.getElementById('switch')

const fontColors = {
  light: '#000000',
  dark: '#FFFFFF'
};

const gridColors = {
  light: '#edd6abff',
  dark: '#4c2802ff'
};

function getFontColor() {
  return document.body.classList.contains('lightmode') ? fontColors.light : fontColors.dark;
}

function getGridColor() {
  return document.body.classList.contains('lightmode') ? gridColors.light : gridColors.dark;
}

const enableLightmode = () => {
  document.body.classList.add('lightmode')
  localStorage.setItem('lightmode', 'active')
}

const disableLightmode = () => {
  document.body.classList.remove('lightmode')
  localStorage.setItem('lightmode', null)
}

if (lightmode === "active") enableLightmode()

themeSwitch.addEventListener("click", () => {
  lightmode = localStorage.getItem('lightmode')
  if (lightmode !== "active") {
    enableLightmode();
  } else {
    disableLightmode();
  }

  const newColor = getFontColor();
  const newGrid = getGridColor();


  myChart.options.scales.x.ticks.color = newColor;
  myChart.options.scales.x.border.color = newGrid;
  myChart.options.scales.y.ticks.color = newColor;
  myChart.options.scales.y.title.color = newColor;
  myChart.options.scales.y.border.color = newGrid;
  

  myChart.update();
});

// GRAPH
const graph = document.getElementById('graph');

let myChart = new Chart(graph, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: [],
      borderColor: 'orange',
      fill: false,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    layout: { padding: 10 },
    scales: {
      x: {
        grid: { display: false },
        border:{
          color: getGridColor()
        },
        ticks: {
          font: { size: 10 },
          color: getFontColor()
        },
        title: { display: true }
      },
      y: {
        beginAtZero: false,
        ticks: {
          font: { size: 10 },
          color: getFontColor()
        },
        grid: { display: false },
        border:{
          color: getGridColor()
        },
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: { size: 10 },
          color: getFontColor()
        }
      }
    }
  }
});

// ➕ Helper to format time (if needed)
function formatTime(rawTime) {
  const date = new Date(rawTime);
  if (isNaN(date)) return rawTime;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Fetching Real-time Data from Google Sheet
async function updateWeatherFromSheet() {
  const url = "https://script.google.com/macros/s/AKfycbxDgdVsFjB6kxWl9BltMlomz5HDqxWzbf4qQcuKhS3aLBHoNFmsJ-4WbTbaFiLCsrAv/exec";

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Update DOM elements
    document.querySelector(".highlight-row:nth-child(1) .measurement").textContent = `${data["Wind"]} km/s`;
    document.querySelector(".highlight-row:nth-child(2) .measurement").textContent = `${data["Humidity"]}%`;
    document.querySelector(".highlight-row:nth-child(3) .measurement").textContent = `${data["Temperature"]}°`;
    document.querySelector(".highlight-row:nth-child(4) .measurement").textContent = `${data["Pressure"]} mbar`;
    document.querySelector(".cloud-label").textContent = `Cloud Type: ${data["CloudType"]}`;
    document.querySelector(".condition").textContent = data["WeatherCondition"];
    document.querySelector(".temp").textContent = `${data["Temperature"]}°`;

    const forecastImage = document.querySelector('.forecastImage');
    const condition = data.WeatherCondition.toLowerCase();
    if (condition.includes("sunny")) {
      forecastImage.src = "png/Sunny.png";
    } else if (condition.includes("rainy")) {
      forecastImage.src = "png/rainyIcon.png";
    } else {
      forecastImage.src = "png/forecastIcon.png";
    }

    // ➕ Update Graph using data.allRows
    if (data.allRows && Array.isArray(data.allRows)) {
      const labels = [];
      const temps = [];

      data.allRows.forEach(row => {
        if (row.time && row.temperature) {
          labels.push(row.time);
          temps.push(parseFloat(row.temperature));
        }
      });

      myChart.data.labels = labels;
      myChart.data.datasets[0].data = temps;
      myChart.update();
    }

  } catch (error) {
    console.error("Failed to fetch weather data:", error);
  }
}

// Initial load
updateWeatherFromSheet();
setInterval(updateWeatherFromSheet, 3000); // every 3 seconds

// Forecast Container (4 tiles)
const forecastApiUrl = 'https://script.google.com/macros/s/AKfycbwKEx_HBmL3zcPiokfkuY0I049bwFdCEFHmX7nP6BZww3zlT-wpgh5z3V1KxD_x81nr/exec';

function fetchForecastData() {
  fetch(forecastApiUrl)
    .then(response => response.json())
    .then(data => {
      const forecastArray = data.Forecast;

      forecastArray.forEach((item, index) => {
        const time = item.time;
        const condition = item.condition;
        const conditionLower = condition.toLowerCase();

        if (index < 4) {
          document.querySelector(`.Time${index + 1}`).textContent = time;
          document.querySelector(`.weather-type${index + 1}`).textContent = condition;

          const iconElement = document.querySelector(`.weather-icon${index + 1} img`);
          if (conditionLower.includes("sunny")) {
            iconElement.src = "png/Sunny.png";
          } else if (conditionLower.includes("rain")) {
            iconElement.src = "png/rainyIcon.png";
          } else if (conditionLower.includes("cloud") || conditionLower.includes("overcast")) {
            iconElement.src = "png/forecastIcon.png";
          } else {
            iconElement.src = "png/forecastIcon.png";
          }
        }
      });
    })
    .catch(error => {
      console.error("Failed to load today's forecast:", error);
    });
}

fetchForecastData();
setInterval(fetchForecastData, 10000); // every 10 seconds

// ICON + CLOUD-IMAGE TRIGGERS
document.addEventListener("DOMContentLoaded", () => {
  const cloudIcon = document.querySelector(".clouds-container");
  const cloudImage = document.querySelector(".cloud-image-container");
  const homeIcon = document.querySelector(".home-container");
  const aboutIcon = document.querySelector(".about-us-container");
  const aboutContainer = document.querySelector(".about-container");

  const sections = document.querySelectorAll(
    ".current-forecast-container, .todays-forecast-container, .todays-highlight-container, .cloud-image-container, .overview-container"
  );
  const cloudDetails = document.querySelector(".cloud-details-container");
  const cloudLabel = document.querySelector(".cloud-label");

  const sideIcons = [homeIcon, cloudIcon, aboutIcon];

  // helper: switch active state
  function setActive(icon) {
    sideIcons.forEach(el => el.classList.remove("active"));
    icon.classList.add("active");
  }

  // default = home
  setActive(homeIcon);

  // clicking home
  homeIcon.addEventListener("click", () => {
    sections.forEach(el => el.classList.remove("hidden"));
    cloudDetails.classList.add("hidden");
    aboutContainer.classList.add("hidden");
    document.querySelector(".cloud-image-container").appendChild(cloudLabel);
    setActive(homeIcon);
  });

  // clicking cloud icon
  cloudIcon.addEventListener("click", () => {
    sections.forEach(el => el.classList.add("hidden"));
    aboutContainer.classList.add("hidden");
    cloudDetails.classList.remove("hidden");
    cloudDetails.appendChild(cloudLabel);
    setActive(cloudIcon);
  });

  // clicking cloud image (acts same as cloud icon)
  cloudImage.addEventListener("click", () => {
    sections.forEach(el => el.classList.add("hidden"));
    aboutContainer.classList.add("hidden");
    cloudDetails.classList.remove("hidden");
    cloudDetails.appendChild(cloudLabel);
    setActive(cloudIcon); // make the side cloud icon white
  });

  // clicking about us
  aboutIcon.addEventListener("click", () => {
    sections.forEach(el => el.classList.add("hidden")); // hide main sections
    cloudDetails.classList.add("hidden");
    aboutContainer.classList.remove("hidden"); // show about section
    setActive(aboutIcon);
  });

});