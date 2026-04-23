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

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase client (you already have this)
const supabase = createClient(
  "https://ixofcczytuiaulkqtuks.supabase.co",
  "sb_publishable_RKTJjRPrvJym2wq6ptrvOA_lPG8OiFS"
);

const cloudContainer = document.getElementById("cloudContainer");
const cloudDetailsContainer = document.querySelector(".cloud-details-container");

// Function to load latest image from Supabase
async function loadLatestCloudImage() {
  try {
    const { data, error } = await supabase
      .from("cloud_images_meta")
      .select("filename")
      .order("uploaded_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) {
      cloudContainer.innerHTML = "<p>No images found</p>";
      cloudDetailsContainer.innerHTML = "<p>No images found</p>";
      return;
    }

    const latestFile = data[0].filename;
    const imageUrl = `https://ixofcczytuiaulkqtuks.supabase.co/storage/v1/object/public/cloud_images/${latestFile}`;

    // Update main container
    cloudContainer.style.background = `
      linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
      url('${imageUrl}') center/cover no-repeat
    `;

    // Update details container to match
    copyCloudContainerContent();

  } catch (err) {
    console.error("Error loading latest image:", err);
  }
}

function copyCloudContainerContent() {
  cloudDetailsContainer.style.background = cloudContainer.style.background;
  cloudDetailsContainer.innerHTML = "";
}

loadLatestCloudImage();

setInterval(loadLatestCloudImage, 10000);

// GRAPH SETUP
const graph = document.getElementById('graph');

let myChart = new Chart(graph, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: [],
      borderColor: 'orange',
      fill: false,
      tension: 0.5
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
          forecastImage.src = "png/forecastIcon.png";
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
    .order("created_at", { ascending: false }) // get latest first
    .limit(10); // last 10 rows

    if (allError) {
      console.error("Supabase error (graph):", allError);
    } else if (allData && allData.length > 0) {
      // reverse so chart is oldest → newest
      const orderedData = allData.reverse();

      const labels = orderedData.map(row => {
      const date = new Date(row.created_at);
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    });

      const temps = orderedData.map(row => parseFloat(row.temperature));
      
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

// Today's Forecast - FETCH LAST 3 FORECASTS WITH RELATIVE TIME
async function updateTodaysForecast() {
  try {
    // 🔹 Get last 2 from weather_forecast
    const { data: forecastData, error: forecastError } = await supabase
      .from("weather_forecast")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2);

    if (forecastError) {
      console.error("Forecast error:", forecastError);
      return;
    }

    // 🔹 Get latest 1 from weather_forecast_advance
    const { data: advanceData, error: advanceError } = await supabase
      .from("weather_forecast_advance")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (advanceError) {
      console.error("Advance forecast error:", advanceError);
    }

    const now = new Date();

    // =========================
    // 🔹 SLOT 1 & 2 (normal forecast)
    // =========================
    if (forecastData && forecastData.length > 0) {
      const ordered = forecastData.reverse(); // oldest → newest

      ordered.forEach((f, i) => {
        const timeEl = document.querySelector(`.Time${i+1}`);
        const typeEl = document.querySelector(`.weather-type${i+1}`);
        const iconEl = document.querySelector(`.weather-icon${i+1} img`);

        let displayTime = new Date(now);
        if (i === 0) displayTime.setHours(displayTime.getHours() - 1);
        else if (i === 1) displayTime.setHours(displayTime.getHours());

        if (timeEl) timeEl.textContent = displayTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (typeEl) typeEl.textContent = f.condition || "N/A";

        if (iconEl) {
          const c = (f.condition || "").toLowerCase();
          if (c.includes("sunny") || c.includes("clear")) iconEl.src = "png/Sunny.png";
          else if (c.includes("cloud") || c.includes("overcast")) iconEl.src = "png/Cloudy.png";
          else if (c.includes("rain") || c.includes("storm")) iconEl.src = "png/rainyIcon.png";
          else iconEl.src = "png/forecastIcon.png";
        }
      });
    }

    // =========================
    // 🔹 SLOT 3 (advance forecast)
    // =========================
    if (advanceData) {
      const timeEl = document.querySelector(`.Time3`);
      const typeEl = document.querySelector(`.weather-type3`);
      const iconEl = document.querySelector(`.weather-icon3 img`);

      let futureTime = new Date(now);
      futureTime.setHours(futureTime.getHours() + 1);

      if (timeEl) timeEl.textContent = futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (typeEl) typeEl.textContent = advanceData.condition || "N/A";

      if (iconEl) {
        const c = (advanceData.condition || "").toLowerCase();
        if (c.includes("sunny") || c.includes("clear")) iconEl.src = "png/Sunny.png";
        else if (c.includes("cloud") || c.includes("overcast")) iconEl.src = "png/Cloudy.png";
        else if (c.includes("rain") || c.includes("storm")) iconEl.src = "png/rainyIcon.png";
        else iconEl.src = "png/forecastIcon.png";
      }
    }

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
  cloudLabel.style.display = "block"; // show again

  setActive(homeIcon);
});

  // clicking cloud icon
  cloudIcon.addEventListener("click", () => {
    sections.forEach(el => el.classList.add("hidden"));
    aboutContainer.classList.add("hidden");
    cloudDetails.classList.remove("hidden");
    cloudDetails.appendChild(cloudLabel);
    cloudLabel.style.display = "none";
    setActive(cloudIcon);
  });

  // clicking cloud image (acts same as cloud icon)
  cloudImage.addEventListener("click", () => {
    sections.forEach(el => el.classList.add("hidden"));
    aboutContainer.classList.add("hidden");
    cloudDetails.classList.remove("hidden");
    cloudDetails.appendChild(cloudLabel);
    cloudLabel.style.display = "none";
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

