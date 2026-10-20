# Devpost submission notes — CoolRun

> ⚠️ The Devpost Learn skill pack (6-ship) asks that the final project name, description and survey answers be written by you. Treat this as reference notes and rewrite in your own words before submitting.

**Project name:** CoolRun

**Tagline (elevator pitch):** Find the safest time to run in the next 48 hours — when you live somewhere hot.

## Inspiration
In Dubai, outdoor runners deal with heat that can be risky for much of the year. Weather apps show temperatures, but they don't answer the real question: *when should I go?* — and "early morning" isn't always right, because pre-dawn humidity or morning sun can make a cooler-looking hour feel worse.

## What it does
- Search a city (or use your location) and CoolRun pulls the next 48 hours of hourly forecast.
- Every hour gets a personal heat-risk score from feels-like temperature, UV, humidity and breeze, adjusted for your run length, effort (easy/tempo/hard) and heat tolerance (sensitive/normal/acclimatized).
- It recommends the best window (plus two genuinely different alternatives), with a risk band from Ideal to Danger and plain-English reasons.
- A 48-hour heat ribbon shows the whole picture; hover any hour for details.
- One tap adds the window to your calendar (.ics with a 30-minute reminder). If even the best window is risky, it suggests going indoors.
- Works without any API key; bundled demo data keeps it working offline.

Who it's for: recreational runners in hot, humid cities who want to keep training safely.

## How we built it
- Planned first with the Devpost Learn skill pack: `devpost/scope.md` → `prd.md` → `spec.md` → `checklist.md`, then built in small verified slices.
- Plain HTML, CSS and JavaScript modules — no framework, no build step; a zero-dependency Node static server.
- Free Open-Meteo forecast and geocoding APIs (no key).
- Transparent, deterministic scoring (unit-tested with `node:test`) instead of an AI model, because safety guidance should be explainable.
- Demo video recorded headlessly with Playwright.

## Challenges we ran into
- Turning "feels hot" into a simple, explainable score that still captures humidity and sun.
- Time zones: forecasts are city-local, so "now" has to be computed in the city's clock.
- Making alternatives useful — the first version suggested windows 15 minutes apart; we now require them to be at least 3 hours apart.

## Accomplishments we're proud of
A one-screen app that answers a real question in about a second, and explains its answer.

## What we learned
Planning with scope/PRD/spec before coding kept the build small and focused on the kernel: the best-window recommendation.

## What's next
"Your window starts in 30 minutes" notifications, saved cities, a weekly training planner, shade/route data, and validating thresholds with sports-medicine guidance (e.g. WBGT).

## Built with
html, css, javascript, node.js, open-meteo, playwright

## AI-assistance disclosure
Planned and built with an AI coding agent following the Devpost Learn skill pack (challengepost/learn-ai-basics). The agent drafted the planning docs, code, README and demo video under my direction; I reviewed and approved them. No pre-existing code was used; third-party data comes from Open-Meteo (CC BY 4.0).

## Links
- Repo: <add public GitHub URL>
- Demo video (YouTube/Vimeo, public): <add URL>
