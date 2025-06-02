const d = new Date();

setInterval(()=>time.innerText=new Date().toLocaleTimeString(),1000);

document.querySelector('.date').innerText = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// THEME-SWITCH
let lightmode = localStorage.getItem('lightmode')
const themeSwitch = document.getElementById('switch')

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
  lightmode !== "active" ? enableLightmode() : disableLightmode()
})