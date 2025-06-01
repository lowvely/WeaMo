const d = new Date();

setInterval(()=>time.innerText=new Date().toLocaleTimeString(),1000);

document.querySelector('.date').innerText = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// Graph
