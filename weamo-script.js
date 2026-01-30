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

// // Helper to format time
// function formatTime(rawTime) {
//   const date = new Date(rawTime);
//   if (isNaN(date)) return rawTime;
//   return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// }

// SUPABASE SETUP
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://ixofcczytuiaulkqtuks.supabase.co",
  "sb_publishable_RKTJjRPrvJym2wq6ptrvOA_lPG8OiFS"
);

// Graph Setup
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
        border:{color: getGridColor()},
        ticks: { font: { size: 10 }, color: getFontColor() },
        title: {display: true}
      },
      y: {
        beginAtZero: false,
        ticks: { font: { size: 10 }, color: getFontColor() },
        grid: {display: false},
        border: {color: getGridColor()},
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

// Fetch Laters Weather + update chart
async function updateWeatherFromSupabase() {
  try {
    // Latest data for highlights
    const { data: latestData, error: latestError } = await supabase
      .from("weather_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latestError) {
      console.error("Supabase error (latest):", latestError);
    } else if (latestData) {
      document.getElementById("windSpeed").textContent = `${latestData.wind_speed} km/h`;
      document.getElementById("humidity").textContent = `${latestData.humidity}%`;
      document.getElementById("temperature").textContent = `${latestData.temperature}°`;
      document.getElementById("pressure").textContent = `${latestData.pressure} hPa`;

      const tempDisplay = document.querySelector(".temp");
      const conditionDisplay = document.querySelector(".condition");
      const cloudLabel = document.querySelector(".cloud-label");
      const forecastImage = document.querySelector(".forecastImage");

      if (tempDisplay) tempDisplay.textContent = `${latestData.temperature}°`;
      if (conditionDisplay) conditionDisplay.textContent = latestData.condition;
      if (cloudLabel) cloudLabel.textContent = `Cloud Type: ${latestData.cloud_type}`;

       //Weather Icon Logic
      if (forecastImage) {
        const condition = latestData.condition.toLowerCase();
        if (condition.includes("sunny") || condition.includes("clear")) {
          forecastImage.src = "png/Sunny.png";
        } else if (condition.includes("cloud") || condition.includes("outcast")) {
          forecastImage.src = "png/Cloudy.png";
        } else if (condition.includes("rainy") || condition.includes("shower") || condition.includes("storm")) {
          forecastImage.src = "png/rainyIcon.png";
        } else {
          forecastImage.src = "png/forecastIcon.png"; // default icon
        }
      }
    }

    // All data for chart
    const { data: allData, error: allError } = await supabase
      .from("weather_data")
      .select("temperature, created_at")
      .order("created_at", { ascending: true });

    if (allError) {
      console.error("Supabase error (graph):", allError);
    } else if (allData) {
      const labels = allData.map(row => {
        const date = new Date(row.created_at);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
      });
      const temps = allData.map(row => parseFloat(row.temperature));

      myChart.data.labels = labels;
      myChart.data.datasets[0].data = temps;
      myChart.update();
    }

  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

updateWeatherFromSupabase();
setInterval(updateWeatherFromSupabase, 3000); // refresh every 3 seconds

// Today's Forecats -FETCH LAST 3 FORECASTS-
async function updateTodaysForecast() {
  try {
    const { data, error } = await supabase
      .from("weather_forecast")
      .select("*")
      .order("created_at")
      .limit(3);

    if (error) return console.error("Supabase error:", error);
    if (!data || data.length === 0) return console.log("No forecast data found");

    data.forEach((f, i) => {
      const timeEl = document.querySelector(`.Time${i+1}`);
      const typeEl = document.querySelector(`.weather-type${i+1}`);
      const iconEl = document.querySelector(`.weather-icon${i+1} img`);

      if (timeEl) timeEl.textContent = f.forecast_time || "--";
      if (typeEl) typeEl.textContent = f.condition || "N/A";

      if (iconEl) {
        const c = (f.condition || "").toLowerCase();
        if (c.includes("sunny") || c.includes("clear")) iconEl.src = "png/Sunny.png";
        else if (c.includes("cloud") || c.includes("overcast")) iconEl.src = "png/Cloudy.png";
        else if (c.includes("rain") || c.includes("shower") || c.includes("storm")) iconEl.src = "png/rainyIcon.png";
        else iconEl.src = "png/forecastIcon.png";
      }
    });

  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

updateTodaysForecast();
setInterval(updateTodaysForecast, 3000); // refresh every 3 seconds

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