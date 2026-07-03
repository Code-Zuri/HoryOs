const API_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = 'd923f8885df15ae4e9641b9a3332f2ef';

const $ = sel => document.querySelector(sel);

function show(el){ el.classList.remove('hidden') }
function hide(el){ el.classList.add('hidden') }

async function fetchWeather(city){
  const url = `${API_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=es`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('No se pudo obtener el clima');
  return res.json();
}

async function fetchWeatherByCoords(lat, lon){
  const url = `${API_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('No se pudo obtener el clima por coordenadas');
  return res.json();
}

function render(data, source = 'search'){
  $('#cityName').textContent = `${data.name || ''}, ${data.sys?.country || ''}`.replace(/^, /, '');
  $('#description').textContent = data.weather?.[0]?.description || '';
  $('#temp').textContent = Math.round(data.main.temp);
  $('#humidity').textContent = data.main.humidity;
  $('#wind').textContent = data.wind.speed;
  const icon = data.weather?.[0]?.icon;
  if(icon){
    // Icono desde CDN de OpenWeather
    $('#icon').src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    $('#icon').alt = data.weather[0].description || 'icono';
  }
  show($('#result'));
}

function tryGeolocation(){
  if(!navigator.geolocation) return;
  show($('#loader'));
  navigator.geolocation.getCurrentPosition(async (pos)=>{
    try{
      const {latitude, longitude} = pos.coords;
      const data = await fetchWeatherByCoords(latitude, longitude);
      render(data, 'geo');
    }catch(err){
      console.warn('Geolocation fetch failed', err);
    }finally{
      hide($('#loader'));
    }
  }, (err)=>{
    hide($('#loader'));
    console.warn('Geolocation error', err);
  }, {timeout:10000});
}

document.addEventListener('DOMContentLoaded', ()=>{
  const form = $('#searchForm');
  const input = $('#cityInput');

  // Intentar obtener ubicación automáticamente al cargar
  tryGeolocation();

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const city = input.value.trim();
    if(!city) return;
    hide($('#result'));
    show($('#loader'));
    try{
      const data = await fetchWeather(city);
      render(data);
    }catch(err){
      alert(err.message || 'Error');
    }finally{
      hide($('#loader'));
    }
  });
});
