(() => {
  "use strict";

  const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
  const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

  const DEFAULT_LOCATION = {
    name: "Boca Raton",
    admin1: "Florida",
    country: "United States",
    latitude: 26.3683,
    longitude: -80.1289,
  };

  const WEATHER_CODES = {
    0: { desc: "Clear sky", icon: "☀️" },
    1: { desc: "Mainly clear", icon: "🌤️" },
    2: { desc: "Partly cloudy", icon: "⛅" },
    3: { desc: "Overcast", icon: "☁️" },
    45: { desc: "Fog", icon: "🌫️" },
    48: { desc: "Depositing rime fog", icon: "🌫️" },
    51: { desc: "Light drizzle", icon: "🌦️" },
    53: { desc: "Moderate drizzle", icon: "🌦️" },
    55: { desc: "Dense drizzle", icon: "🌧️" },
    56: { desc: "Light freezing drizzle", icon: "🌧️" },
    57: { desc: "Dense freezing drizzle", icon: "🌧️" },
    61: { desc: "Slight rain", icon: "🌧️" },
    63: { desc: "Moderate rain", icon: "🌧️" },
    65: { desc: "Heavy rain", icon: "🌧️" },
    66: { desc: "Light freezing rain", icon: "🌧️" },
    67: { desc: "Heavy freezing rain", icon: "🌧️" },
    71: { desc: "Slight snow fall", icon: "🌨️" },
    73: { desc: "Moderate snow fall", icon: "🌨️" },
    75: { desc: "Heavy snow fall", icon: "❄️" },
    77: { desc: "Snow grains", icon: "❄️" },
    80: { desc: "Slight rain showers", icon: "🌦️" },
    81: { desc: "Moderate rain showers", icon: "🌧️" },
    82: { desc: "Violent rain showers", icon: "⛈️" },
    85: { desc: "Slight snow showers", icon: "🌨️" },
    86: { desc: "Heavy snow showers", icon: "❄️" },
    95: { desc: "Thunderstorm", icon: "⛈️" },
    96: { desc: "Thunderstorm with slight hail", icon: "⛈️" },
    99: { desc: "Thunderstorm with heavy hail", icon: "⛈️" },
  };

  const USER_NAME = "Emma";
  const THEME_KEY = "fau-weather-theme";

  const SUNNY_CODES = new Set([0, 1]);
  const CLOUDY_CODES = new Set([2, 3]);
  const FOG_CODES = new Set([45, 48]);
  const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]);
  const STORM_CODES = new Set([95, 96, 99]);
  const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);

  const GOOD_LUCK_MESSAGES = [
    "Good luck in class today! 🦉",
    "You've got this, Owl! Crush those classes today.",
    "Wishing you a great day on campus!",
    "Ace that quiz today &mdash; go Owls!",
    "Hope your classes fly by today 🦉",
    "One more day closer to the weekend &mdash; you've got this!",
  ];

  const TIP_POOLS = {
    sunny: [
      { icon: "🏖️", text: "It's beautiful out &mdash; perfect day to hit the beach after class!" },
      { icon: "☀️", text: "Gorgeous weather today. Maybe take your notes outside and study on the lawn?" },
      { icon: "🕶️", text: "Sunshine alert! Squeeze in a study break at the beach." },
    ],
    cloudy: [
      { icon: "⛅", text: "Nice mix of sun and clouds &mdash; a great day for a walk between classes." },
      { icon: "☁️", text: "A little gray out there &mdash; cozy library study session, anyone?" },
    ],
    fog: [
      { icon: "🌫️", text: "Foggy out there &mdash; give yourself extra time getting to class." },
    ],
    rain: [
      { icon: "📚", text: "It's rainy &mdash; perfect excuse to stay in and get ahead on homework." },
      { icon: "☔", text: "Grab an umbrella! Or just stay cozy and hit the books instead." },
      { icon: "🌧️", text: "Rainy day, productive day &mdash; library time?" },
    ],
    storm: [
      { icon: "⛈️", text: "Thunderstorms today &mdash; best to stay indoors and knock out some studying." },
    ],
    snow: [
      { icon: "❄️", text: "Snow in Boca?! Stay cozy inside and get some reading done." },
    ],
  };

  const HOT_TIP = { icon: "🥵", text: "It's toasty out there &mdash; stay hydrated between classes!" };
  const COLD_TIP = { icon: "🧥", text: "Bit chilly today &mdash; grab a light jacket before heading to campus." };

  const els = {
    welcomeBanner: document.getElementById("welcome-banner"),
    themeToggle: document.getElementById("theme-toggle"),
    dailyTip: document.getElementById("daily-tip"),
    tipIcon: document.getElementById("tip-icon"),
    tipText: document.getElementById("tip-text"),
    form: document.getElementById("search-form"),
    input: document.getElementById("city-input"),
    suggestions: document.getElementById("suggestions"),
    locateBtn: document.getElementById("locate-btn"),
    unitToggle: document.getElementById("unit-toggle"),
    status: document.getElementById("status"),
    current: document.getElementById("current-weather"),
    forecastSection: document.getElementById("forecast"),
    forecastList: document.getElementById("forecast-list"),
    locationName: document.getElementById("location-name"),
    currentDatetime: document.getElementById("current-datetime"),
    currentIcon: document.getElementById("current-icon"),
    currentTemp: document.getElementById("current-temp"),
    currentDesc: document.getElementById("current-desc"),
    feelsLike: document.getElementById("feels-like"),
    humidity: document.getElementById("humidity"),
    wind: document.getElementById("wind"),
    precip: document.getElementById("precip"),
  };

  let unit = "fahrenheit"; // or "celsius"
  let currentLocation = DEFAULT_LOCATION;
  let suggestionItems = [];
  let debounceTimer = null;

  function weatherInfo(code) {
    return WEATHER_CODES[code] || { desc: "Unknown", icon: "❔" };
  }

  function timeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function renderWelcome() {
    const greeting = timeGreeting();
    const goodLuck = pickRandom(GOOD_LUCK_MESSAGES);
    els.welcomeBanner.innerHTML = `<span class="wave">🦉</span> ${greeting}, ${USER_NAME}! ${goodLuck}`;
  }

  function tipPoolForCode(code) {
    if (SUNNY_CODES.has(code)) return TIP_POOLS.sunny;
    if (CLOUDY_CODES.has(code)) return TIP_POOLS.cloudy;
    if (FOG_CODES.has(code)) return TIP_POOLS.fog;
    if (RAIN_CODES.has(code)) return TIP_POOLS.rain;
    if (STORM_CODES.has(code)) return TIP_POOLS.storm;
    if (SNOW_CODES.has(code)) return TIP_POOLS.snow;
    return TIP_POOLS.cloudy;
  }

  function renderDailyTip(data) {
    const c = data.current;
    const hotThreshold = unit === "fahrenheit" ? 90 : 32;
    const coldThreshold = unit === "fahrenheit" ? 55 : 13;

    let tip;
    if (c.temperature_2m >= hotThreshold) {
      tip = HOT_TIP;
    } else if (c.temperature_2m <= coldThreshold) {
      tip = COLD_TIP;
    } else {
      tip = pickRandom(tipPoolForCode(c.weather_code));
    }

    els.tipIcon.textContent = tip.icon;
    els.tipText.innerHTML = tip.text;
    els.dailyTip.classList.remove("hidden");
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    els.themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    els.themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  function initTheme() {
    let saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch (err) {
      // localStorage unavailable; fall back to light theme
    }
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  els.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (err) {
      // ignore write failures (private browsing, etc.)
    }
  });

  function showStatus(message, isLoading) {
    els.status.textContent = message;
    els.status.classList.remove("hidden");
    els.status.classList.toggle("loading", !!isLoading);
  }

  function hideStatus() {
    els.status.classList.add("hidden");
  }

  function locationLabel(loc) {
    const parts = [loc.name];
    if (loc.admin1 && loc.admin1 !== loc.name) parts.push(loc.admin1);
    if (loc.country && loc.country !== "United States") parts.push(loc.country);
    return parts.join(", ");
  }

  async function geocodeSearch(query) {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding request failed");
    const data = await res.json();
    return data.results || [];
  }

  async function fetchWeather(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "is_day",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
      ].join(","),
      temperature_unit: unit,
      wind_speed_unit: unit === "fahrenheit" ? "mph" : "kmh",
      precipitation_unit: unit === "fahrenheit" ? "inch" : "mm",
      timezone: "auto",
      forecast_days: 7,
    });
    const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
    if (!res.ok) throw new Error("Forecast request failed");
    return res.json();
  }

  function renderCurrent(loc, data) {
    const c = data.current;
    const info = weatherInfo(c.weather_code);
    const tempUnitSymbol = unit === "fahrenheit" ? "°F" : "°C";
    const speedUnit = unit === "fahrenheit" ? "mph" : "km/h";
    const precipUnit = unit === "fahrenheit" ? "in" : "mm";

    els.locationName.textContent = locationLabel(loc);
    els.currentDatetime.textContent = new Date(c.time).toLocaleString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    els.currentIcon.textContent = c.is_day ? info.icon : info.icon.replace("☀️", "🌙");
    els.currentTemp.innerHTML = `${Math.round(c.temperature_2m)}&deg;`;
    els.currentDesc.textContent = info.desc;
    els.feelsLike.innerHTML = `${Math.round(c.apparent_temperature)}${tempUnitSymbol}`;
    els.humidity.textContent = `${Math.round(c.relative_humidity_2m)}%`;
    els.wind.textContent = `${Math.round(c.wind_speed_10m)} ${speedUnit}`;
    els.precip.textContent = `${c.precipitation ?? 0} ${precipUnit}`;

    els.current.classList.remove("hidden");
    renderDailyTip(data);
  }

  function renderForecast(data) {
    const d = data.daily;
    els.forecastList.innerHTML = "";
    for (let i = 0; i < d.time.length; i++) {
      const info = weatherInfo(d.weather_code[i]);
      const date = new Date(d.time[i] + "T00:00:00");
      const dayName = i === 0 ? "Today" : date.toLocaleDateString(undefined, { weekday: "short" });

      const card = document.createElement("div");
      card.className = "forecast-day";
      card.innerHTML = `
        <div class="day-name">${dayName}</div>
        <div class="day-icon">${info.icon}</div>
        <div class="day-temps">
          <span class="day-high">${Math.round(d.temperature_2m_max[i])}&deg;</span>
          &nbsp;/&nbsp;
          <span class="day-low">${Math.round(d.temperature_2m_min[i])}&deg;</span>
        </div>
        <div class="day-precip">💧 ${d.precipitation_probability_max[i] ?? 0}%</div>
      `;
      els.forecastList.appendChild(card);
    }
    els.forecastSection.classList.remove("hidden");
  }

  async function loadWeatherFor(loc) {
    currentLocation = loc;
    showStatus(`Loading weather for ${locationLabel(loc)}...`, true);
    try {
      const data = await fetchWeather(loc.latitude, loc.longitude);
      renderCurrent(loc, data);
      renderForecast(data);
      hideStatus();
    } catch (err) {
      console.error(err);
      showStatus("Couldn't load weather right now. Please try again in a moment.", false);
    }
  }

  function clearSuggestions() {
    els.suggestions.innerHTML = "";
    els.suggestions.classList.add("hidden");
    suggestionItems = [];
  }

  function renderSuggestions(results) {
    suggestionItems = results;
    if (!results.length) {
      clearSuggestions();
      return;
    }
    els.suggestions.innerHTML = results
      .map((r, i) => `<li role="option" data-index="${i}">${locationLabel(r)}</li>`)
      .join("");
    els.suggestions.classList.remove("hidden");
  }

  els.suggestions.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-index]");
    if (!li) return;
    const loc = suggestionItems[Number(li.dataset.index)];
    clearSuggestions();
    els.input.value = locationLabel(loc);
    loadWeatherFor(loc);
  });

  els.input.addEventListener("input", () => {
    const query = els.input.value.trim();
    clearTimeout(debounceTimer);
    if (query.length < 2) {
      clearSuggestions();
      return;
    }
    debounceTimer = setTimeout(async () => {
      try {
        const results = await geocodeSearch(query);
        renderSuggestions(results);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  });

  document.addEventListener("click", (e) => {
    if (!els.suggestions.contains(e.target) && e.target !== els.input) {
      clearSuggestions();
    }
  });

  els.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = els.input.value.trim();
    if (!query) return;
    showStatus(`Searching for "${query}"...`, true);
    try {
      const results = await geocodeSearch(query);
      clearSuggestions();
      if (!results.length) {
        showStatus(`No results found for "${query}".`, false);
        return;
      }
      loadWeatherFor(results[0]);
    } catch (err) {
      console.error(err);
      showStatus("Search failed. Please try again.", false);
    }
  });

  els.locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showStatus("Geolocation isn't supported by your browser.", false);
      return;
    }
    showStatus("Getting your location...", true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          name: "My Location",
          admin1: "",
          country: "",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        els.input.value = "";
        loadWeatherFor(loc);
      },
      () => {
        showStatus("Couldn't get your location. Check browser permissions.", false);
      }
    );
  });

  els.unitToggle.addEventListener("click", () => {
    unit = unit === "fahrenheit" ? "celsius" : "fahrenheit";
    els.unitToggle.querySelectorAll("span[data-unit]").forEach((span) => {
      const active = (span.dataset.unit === "F" && unit === "fahrenheit") ||
        (span.dataset.unit === "C" && unit === "celsius");
      span.classList.toggle("active", active);
    });
    els.unitToggle.setAttribute("aria-pressed", unit === "celsius" ? "true" : "false");
    loadWeatherFor(currentLocation);
  });

  initTheme();
  renderWelcome();
  loadWeatherFor(DEFAULT_LOCATION);
})();
