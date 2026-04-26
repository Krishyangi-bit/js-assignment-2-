

const API_KEY = 'c31577fe85a4d877444fb579b6d32d47';

const $ = id => document.getElementById(id);

// ── DOM references ──
const cityInput     = $('cityInput');
const searchBtn     = $('searchBtn');
const searchHint    = $('searchHint');
const weatherCard   = $('weatherCard');
const skeletonCard  = $('skeletonCard');
const errorCard     = $('errorCard');
const errorMsg      = $('errorMsg');
const themeToggle   = $('themeToggle');
const refreshBtn    = $('refreshBtn');
const celsiusBtn    = $('celsiusBtn');
const fahrenheitBtn = $('fahrenheitBtn');

// ── State ──
let lastData  = null;
let isCelsius = true;
let isDark    = false;
let lastCity  = 'New Delhi';

// ── Weather icon emoji map ──
const ICONS = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅',  '02n': '☁️',
  '03d': '☁️',  '03n': '☁️',
  '04d': '☁️',  '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️',  '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

// ── Demo fallback data (shown if API key isn't active yet) ──
const DEMO = {
  name: 'New Delhi',
  sys: { country: 'IN', sunrise: 1714096800, sunset: 1714143600 },
  main: { temp: 36, feels_like: 38, humidity: 22, pressure: 1004 },
  wind: { speed: 4.5 },
  visibility: 5000,
  clouds: { all: 10 },
  weather: [{ description: 'clear sky', icon: '01d' }],
  _demo: true
};

// ── Visibility helpers ──
const show = el => el.classList.remove('hidden');
const hide = el => el.classList.add('hidden');

const showCard     = () => { show(weatherCard); hide(skeletonCard); hide(errorCard); };
const showSkeleton = () => { hide(weatherCard); show(skeletonCard); hide(errorCard); };
const showError    = msg => { hide(weatherCard); hide(skeletonCard); show(errorCard); errorMsg.innerHTML = msg; };

// ── Hint bar ──
function hint(msg, isErr = false) {
  searchHint.textContent = msg;
  searchHint.className = 'search-hint' + (isErr ? ' err' : '');
}

// ── Utility ──
const toF     = c  => Math.round(c * 9 / 5 + 32);
const msToKmh = ms => Math.round(ms * 3.6);
const fmtDate = ()  => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtTime = ts  => new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ── Render weather data into the card ──
function renderWeather(data) {
  lastData = data;

  const tempC  = Math.round(data.main.temp);
  const feelsC = Math.round(data.main.feels_like);
  const unit   = isCelsius ? '°C' : '°F';

  $('cardCity').textContent    = data.name;
  $('cardCountry').textContent = data.sys.country;
  $('cardDate').innerHTML      = `${fmtDate()}<br>☀ ${fmtTime(data.sys.sunrise)} — ${fmtTime(data.sys.sunset)}`;
  $('cardTemp').textContent    = `${isCelsius ? tempC : toF(tempC)}${unit}`;
  $('feelsLike').textContent   = `${isCelsius ? feelsC : toF(feelsC)}${unit}`;
  $('humidity').textContent    = `${data.main.humidity}%`;
  $('wind').textContent        = `${msToKmh(data.wind.speed)} km/h`;
  $('visibility').textContent  = data.visibility ? `${(data.visibility / 1000).toFixed(1)} km` : '—';
  $('pressure').textContent    = `${data.main.pressure} hPa`;
  $('clouds').textContent      = `${data.clouds.all}%`;
  $('cardDesc').textContent    = data.weather[0].description;
  $('weatherIcon').textContent = ICONS[data.weather[0].icon] || '🌡️';
  $('cardUpdate').textContent  = data._demo
    ? 'Demo data — enter a city to fetch live weather'
    : `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  showCard();
}

// ── Update displayed temp when unit is toggled ──
function updateUnit() {
  if (!lastData) return;
  const c  = Math.round(lastData.main.temp);
  const fc = Math.round(lastData.main.feels_like);
  const u  = isCelsius ? '°C' : '°F';
  $('cardTemp').textContent  = `${isCelsius ? c  : toF(c)}${u}`;
  $('feelsLike').textContent = `${isCelsius ? fc : toF(fc)}${u}`;
}

// ── Fetch weather from OpenWeatherMap ──
async function fetchWeather(city) {
  city = city.trim();
  if (!city) { hint('Please enter a city name.', true); return; }

  lastCity = city;
  hint('Fetching…');
  showSkeleton();

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);

    // 401 = API key not yet active (new keys take up to 2 hours)
    if (res.status === 401) {
      renderWeather({ ...DEMO, name: city, sys: { ...DEMO.sys, country: '' }, _demo: true });
      hint('⚠ API key not yet active — showing demo data. Keys activate within 2 hours of signup.', true);
      return;
    }

    // 404 = city not found
    if (res.status === 404) {
      showError(`❌ &nbsp;"${city}" wasn't found.<br><small>Check the spelling — e.g. "Mumbai", "London", "New York"</small>`);
      hint('');
      return;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status}: ${body}`);
    }

    const data = await res.json();
    renderWeather(data);
    hint(`✓ Live weather for ${data.name}, ${data.sys.country}`);

  } catch (err) {
    console.error('Fetch error:', err);

    if (!navigator.onLine) {
      showError('📡 No internet connection detected.<br><small>Connect to the internet and try again.</small>');
      hint('You appear to be offline.', true);
    } else {
      // Fall back to demo so the UI still works
      renderWeather({ ...DEMO, name: city, sys: { ...DEMO.sys, country: '' }, _demo: true });
      hint('⚠ Could not reach API — showing demo data. Your API key may still be activating (takes up to 2 hrs).', true);
    }
  }
}

// ── Event listeners ──
searchBtn.addEventListener('click', () => fetchWeather(cityInput.value));

cityInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') fetchWeather(cityInput.value);
});

cityInput.addEventListener('input', () => {
  if (searchHint.classList.contains('err')) hint('');
});

refreshBtn.addEventListener('click', async () => {
  if (!lastCity) return;
  refreshBtn.textContent = '↻ Refreshing…';
  await fetchWeather(lastCity);
  refreshBtn.textContent = '↻ Refresh';
});

celsiusBtn.addEventListener('click', () => {
  if (isCelsius) return;
  isCelsius = true;
  celsiusBtn.classList.add('active');
  fahrenheitBtn.classList.remove('active');
  updateUnit();
});

fahrenheitBtn.addEventListener('click', () => {
  if (!isCelsius) return;
  isCelsius = false;
  fahrenheitBtn.classList.add('active');
  celsiusBtn.classList.remove('active');
  updateUnit();
});

themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
  themeToggle.textContent = isDark ? '☀' : '☾';
});


fetchWeather('New Delhi');
