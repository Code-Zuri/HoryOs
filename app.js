const API_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = 'd923f8885df15ae4e9641b9a3332f2ef';

const $ = sel => document.querySelector(sel);

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function formatTime(timestamp, timezone) {
  if (!timestamp) return '--:--';
  const date = new Date((timestamp + (timezone || 0)) * 1000);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
}

function formatVisibility(meters) {
  if (!meters) return '--';
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
}

async function fetchWeather(city) {
  const url = `${API_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=es`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Ciudad no encontrada');
    throw new Error('Error al consultar el clima');
  }
  return res.json();
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `${API_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('No se pudo obtener el clima por coordenadas');
  return res.json();
}

function render(data, source = 'search') {
  // City name
  const cityName = `${data.name || ''}${data.sys?.country ? ', ' + data.sys.country : ''}`;
  $('#cityName').textContent = cityName || 'Ubicación desconocida';

  // Description
  const desc = data.weather?.[0]?.description || '';
  $('#description').textContent = desc;

  // Temperature
  $('#temp').textContent = Math.round(data.main?.temp || 0);

  // Humidity
  $('#humidity').textContent = data.main?.humidity || 0;

  // Wind
  $('#wind').textContent = (data.wind?.speed || 0).toFixed(1);

  // Feels like
  $('#feelsLike').textContent = Math.round(data.main?.feels_like || data.main?.temp || 0);

  // Pressure
  $('#pressure').textContent = data.main?.pressure || 0;

  // Sunrise / Sunset
  const timezone = data.timezone || 0;
  $('#sunrise').textContent = formatTime(data.sys?.sunrise, timezone);
  $('#sunset').textContent = formatTime(data.sys?.sunset, timezone);

  // Visibility
  $('#visibility').textContent = formatVisibility(data.visibility);

  // Weather icon
  const icon = data.weather?.[0]?.icon;
  const iconEl = $('#icon');
  if (icon) {
    iconEl.src = `https://openweathermap.org/img/wn/${icon}@4x.png`;
    iconEl.alt = desc || 'icono del clima';
  } else {
    iconEl.src = '';
    iconEl.alt = '';
  }

  show($('#result'));
}

function showError(msg) {
  $('#errorText').textContent = msg;
  show($('#error'));
  setTimeout(() => hide($('#error')), 5000);
}

async function handleSearch(city) {
  if (!city) return;
  hide($('#result'));
  hide($('#error'));
  show($('#loader'));

  try {
    const data = await fetchWeather(city);
    render(data, 'search');
  } catch (err) {
    showError(err.message || 'Error al buscar la ciudad');
  } finally {
    hide($('#loader'));
  }
}

async function handleGeolocation() {
  if (!navigator.geolocation) {
    showError('Tu navegador no soporta geolocalización');
    return;
  }

  hide($('#result'));
  hide($('#error'));
  show($('#loader'));

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const data = await fetchWeatherByCoords(latitude, longitude);
        render(data, 'geo');
      } catch (err) {
        showError(err.message || 'Error al obtener tu ubicación');
      } finally {
        hide($('#loader'));
      }
    },
    (err) => {
      hide($('#loader'));
      let msg = 'No se pudo obtener tu ubicación';
      if (err.code === 1) msg = 'Permiso de ubicación denegado';
      else if (err.code === 2) msg = 'Ubicación no disponible';
      else if (err.code === 3) msg = 'Tiempo de espera agotado';
      showError(msg);
    },
    { timeout: 10000, enableHighAccuracy: false }
  );
}

// ─── Event Listeners ───
document.addEventListener('DOMContentLoaded', () => {
  const form = $('#searchForm');
  const input = $('#cityInput');
  const geoBtn = $('#geoBtn');

  // Auto geolocation on load
  handleGeolocation();

  // Search form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = input.value.trim();
    if (!city) return;
    handleSearch(city);
  });

  // Geolocation button
  geoBtn.addEventListener('click', () => {
    input.value = '';
    handleGeolocation();
  });

  // Enter key on input (already handled by form submit)
});