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