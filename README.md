# Emma's Beach Weather 🌊

A lightweight, beach-themed weather app built with plain HTML/CSS/JS and the free
[Open-Meteo](https://open-meteo.com/) API (no API key or login required).

Defaults to **Boca Raton, FL** and lets you search any city or use your
current location.

## Features

- Personalized welcome banner with a time-of-day greeting
- Current conditions: temperature, feels-like, humidity, wind, precipitation
- 7-day forecast
- City search with autocomplete (Open-Meteo Geocoding API)
- "Use my location" geolocation button
- °F / °C toggle
- Beachy theme: ocean teal, coral sunset, sandy tones
- No build step, no dependencies, no API keys — just static files

## Project structure

```
index.html        Main page
css/styles.css     FAU-themed styles
js/app.js          App logic (fetches Open-Meteo APIs)
assets/logo.svg    Placeholder owl logo (swap with FAU's official licensed logo if you have one)
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

The logo in `assets/logo.svg` is an original sun-and-waves mark. The welcome
message and theme are personalized for Emma — update `USER_NAME` in
`js/app.js` to change who it greets.
