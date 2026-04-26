#WEBDEV2 ASSIGNMENT 2: 
# Async Weather Tracker

A sleek, async weather tracker built with vanilla HTML, CSS, and JavaScript. Fetches live data from the OpenWeatherMap API with a refined editorial UI, dark mode, unit toggling, and graceful error handling.


## Features

- **Live weather data** via OpenWeatherMap API
- **Async fetch** with skeleton loading state
- **Dark / Light mode** toggle
- **°C / °F** unit switcher
- **6 weather stats** — feels like, humidity, wind, visibility, pressure, cloud cover
- **Sunrise & sunset** times per city
- **Demo fallback** — shows sample data if the API key isn't active yet
- **Smart error handling** — distinguishes between city not found, offline, and key not activated
- **Fully responsive** down to mobile

---

## File Structure

```
atmos-weather/
├── index.html   # Markup and structure
├── style.css    # All styling, themes, animations
└── app.js       # API logic, DOM updates, event listeners
```

## API Reference

This project uses the **OpenWeatherMap Current Weather API**.

## Error States

| Situation | Behaviour |
|-----------|-----------|
| City not found (404) | Error card with spelling suggestion |
| API key not active (401) | Demo data shown with warning hint |
| No internet connection | Error card with offline message |
| Other network failure | Demo data shown with retry hint |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, animations) |
| Logic | JavaScript (async/await) |
| Fonts | DM Serif Display + DM Sans via Google Fonts |
| Data | OpenWeatherMap REST API |
