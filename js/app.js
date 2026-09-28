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

  const BEACH_DAY_CODES = new Set([0, 1, 2]);

  const els = {
    welcomeBanner: document.getElementById("welcome-banner"),
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

  function renderWelcome(loc, data) {
    const greeting = timeGreeting();
    if (!data) {
      els.welcomeBanner.innerHTML = `<span class="wave">🌊</span> ${greeting}, ${USER_NAME}!`;
      return;
    }
    const code = data.current.weather_code;
    const isBeachDay = BEACH_DAY_CODES.has(code) && data.current.temperature_2m >= (unit === "fahrenheit" ? 75 : 24);
    const tail = isBeachDay
      ? "looks like a perfect beach day ☀️"
      : "here's your forecast for " + locationLabel(loc);
    els.welcomeBanner.innerHTML = `<span class="wave">🌊</span> ${greeting}, ${USER_NAME} &mdash; ${tail}`;
  }

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
    renderWelcome(loc, data);
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

  renderWelcome(DEFAULT_LOCATION, null);
  loadWeatherFor(DEFAULT_LOCATION);
})();
