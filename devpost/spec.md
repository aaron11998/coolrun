---
doc: spec
status: draft
---
<!-- Drafted by the coding agent. Prajwal: review, edit, then set status: approved. -->

# CoolRun — Technical Spec

## How This Works, In Plain Language
CoolRun is a single web page. When you pick a city it asks a free weather service (Open-Meteo) for the next 48 hours, hour by hour. A small scoring file turns each hour into a "how hot does this feel for *you*" number and a colour. A window finder slides your run length across those hours and picks the stretch whose worst moment is the mildest. The page draws the results and can save the best window as a calendar file. No server, no account, no API key.

## The Core Journey Through the System
City typed → `api.js` geocoding search → user picks → `api.js` forecast fetch (or `sample-dubai.json`) → `scoring.js` scores hours → `scoring.js` findWindows(length) → `ui.js` renders card, alternatives, ribbon → "Add to calendar" → `ics.js` builds file → browser download. PRD ref: `prd.md > The Core Journey`.

## Stack
- Plain HTML/CSS/ES modules, no build step — easy to read, nothing to install.
- Open-Meteo Forecast + Geocoding APIs (free, no key): https://open-meteo.com/en/docs , https://open-meteo.com/en/docs/geocoding-api
- Node 18+ only for the tiny static server (`server.mjs`) and `node --test` unit tests.

## Where It Runs and How Someone Tries It
`node server.mjs` → open http://localhost:5173 . Demo video recorded headlessly with Playwright (`video/record.py`). Deployment optional (any static host, e.g. GitHub Pages works as-is from `app/`).

## Look and Feel
Background #0b1324 with subtle radial glow; cards #121c33; text #e8eefc; risk palette Ideal #2dd4bf, Good #84cc16, Caution #fbbf24, High #fb7185, Danger #e11d48. System sans, numerals 48–64px. Generous spacing.

## Components
### Geocoding & forecast client (`app/api.js`)
PRD ref: `prd.md > Finding a place`.
### Heat scoring (`app/scoring.js`)
`effectiveFeels(hour, settings)` = apparent_temperature + UV term (0.6×UV when day) + humidity term (0.08×(RH−60) if RH>60) − wind term (0.08×min(wind,30)) + effort (0/1.5/3) − tolerance (−2/0/+2). Bands: <24 Ideal, <28 Good, <32 Caution, <36 High risk, else Danger. PRD ref: `prd.md > Scoring heat risk`.
### Window finder (`app/scoring.js`)
15-min start steps, hours overlapped by [start, start+len), risk = max effective; sort by risk then time; pick best + 2 non-overlapping. PRD ref: `prd.md > Recommending a window`.
### UI (`app/ui.js`, `app/index.html`, `app/styles.css`)
### Calendar export (`app/ics.js`)
PRD ref: `prd.md > Calendar export`.

## Data Model
In-memory `hours[]` {time, feels, temp, rh, uv, wind, rain, isDay}. localStorage `coolrun.settings` {city, len, tolerance, effort}.

## File Structure
```
buildwithai/
├── app/
│   ├── index.html        # the one page
│   ├── styles.css
│   ├── main.js           # wiring + state
│   ├── api.js            # Open-Meteo calls
│   ├── scoring.js        # heat score + window finder (pure)
│   ├── ui.js             # rendering
│   ├── ics.js            # calendar file
│   └── sample-dubai.json # offline demo data
├── test/scoring.test.mjs
├── server.mjs            # zero-dependency static server
├── video/                # demo recording scripts
└── devpost/              # planning docs
```

## External Services and Dependencies
- Geocoding: `GET https://geocoding-api.open-meteo.com/v1/search?name=<q>&count=5` → `results[]`.
- Forecast: `GET https://api.open-meteo.com/v1/forecast?latitude&longitude&hourly=apparent_temperature,temperature_2m,relative_humidity_2m,uv_index,wind_speed_10m,precipitation_probability,is_day&forecast_days=3&timezone=auto`. Free for non-commercial use, no key, ~10k calls/day.

## Important Failure Modes
- **API unreachable** → error card with "Try demo data".
- **Geolocation denied** → message, city search still works.

## What Was Simplified and Why
- **Rule-based score** instead of a physiological model (WBGT) — WBGT needs radiation data and is overkill for a POC.

## Decisions and Open Issues
- No LLM: safety guidance should be deterministic and explainable (agent recommendation).
- Open: thresholds are heuristic; validate with a sports-medicine source later.
