# FAU Owls Weather 🦉

A lightweight, FAU-themed weather app built with plain HTML/CSS/JS and the free
[Open-Meteo](https://open-meteo.com/) API (no API key or login required).

Defaults to **Boca Raton, FL** and lets you search any city or use your
current location.

## Features

- Personalized welcome banner with a time-of-day greeting and a rotating
  "good luck in class" message
- A daily tip card with fun, weather-based suggestions (nice out → hit the
  beach; rainy → stay in and study; hot → stay hydrated; cold → grab a
  jacket, etc.)
- Light mode / dark mode toggle (remembers your choice, defaults to your
  system preference)
- Current conditions: temperature, feels-like, humidity, wind, precipitation
- 7-day forecast
- City search with autocomplete (Open-Meteo Geocoding API)
- "Use my location" geolocation button
- °F / °C toggle
- FAU Blue (`#003366`) / FAU Red (`#CC0000`) theme, consistent across both
  light and dark modes
- No build step, no dependencies, no API keys — just static files

## Project structure

```
index.html        Main page
css/styles.css     FAU-themed styles with light/dark theme variables
js/app.js          App logic (fetches Open-Meteo APIs, theme + tip logic)
assets/logo.svg    Placeholder FAU owl logo (swap with FAU's official licensed logo if you have one)
netlify.toml       Netlify deploy config
```

## Local preview

No build tools needed. Either open `index.html` directly in a browser, or run
a simple local server (recommended, since some browsers restrict `fetch` on
`file://` URLs):

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploying to Netlify

This is a static site with zero build step, so deployment is simple.

### Option A: Netlify CLI

```bash
npm install -g netlify-cli
netlify deploy          # preview deploy
netlify deploy --prod   # production deploy
```

### Option B: Netlify dashboard (drag & drop)

1. Go to [app.netlify.com](https://app.netlify.com/drop)
2. Drag the project folder onto the page

### Option C: Git-based deploy (recommended)

1. Push this repo to GitHub (already done if you're reading this on GitHub).
2. In Netlify: **Add new site → Import an existing project** → pick this repo.
3. Build settings:
   - **Build command:** (leave blank)
   - **Publish directory:** `.`
4. Deploy — `netlify.toml` in the repo root already configures this for you.

No environment variables or secrets are required since Open-Meteo's API is
free and keyless.

## Notes on branding

The logo in `assets/logo.svg` is an original placeholder mark in FAU's
colors, not FAU's official trademarked logo. Swap it out for the official
FAU logo file if you have appropriate usage rights, and this isn't an
official university website.

The welcome message and daily tips are personalized for Emma — update
`USER_NAME`, `GOOD_LUCK_MESSAGES`, and `TIP_POOLS` in `js/app.js` to
customize them.
