---
doc: prd
status: approved
---
<!-- Drafted by the coding agent. Prajwal: review, edit, then set status: approved. -->

# CoolRun — Product Requirements

A one-screen web app that tells a runner in a hot city the safest time to run in the next 48 hours.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
1. The runner opens CoolRun and sees a short headline ("When is it safe to run?") and a city box.
2. They type a city and pick it from suggestions, or tap "Use my location".
3. They set **run length** (20–120 min) and **heat tolerance** (Heat-sensitive / Normal / Acclimatized) and **effort** (Easy / Tempo / Hard).
4. CoolRun fetches the 48-hour forecast and shows:
   - a **Best window** card: day, start–end time, feels-like temperature, risk band, and 2–3 plain-English reasons;
   - a **48-hour heat ribbon**: one coloured block per hour, the best window outlined;
   - **two alternative windows** that don't overlap the best one.
5. Changing length/tolerance/effort recalculates instantly (no new fetch).
6. They tap **Add to calendar** and get an .ics file for the best window. Success = they know when to run and it's in their calendar.

## Screens and Layout
Single page: header → controls panel (city, sliders/segmented buttons) → results (best window card left, alternatives right) → ribbon full-width → hour-detail tooltip on hover/tap → footer with data source and safety note.

## Look and Feel
Dark navy night-run background, teal→amber→coral risk palette, rounded cards, large numerals, Inter/system sans. Copy is short and coach-like.

## Features and Behavior

### Finding a place
- Typing ≥2 letters shows up to 5 matching cities (name, region, country). Selecting one loads the forecast.
- "Use my location" uses the browser location; if denied, show a friendly message and keep the city box.
- "Try demo data" loads a bundled Dubai sample forecast (for offline demos).
  - [ ] Selecting "Dubai" shows results within ~2 s on a normal connection.

### Scoring heat risk
- Each hour gets a band from an *effective feels-like* temperature: feels-like, adjusted up for strong sun (UV), high humidity, and harder effort; down for a breeze; shifted by the runner's tolerance.
- Bands: Ideal, Good, Caution, High risk, Danger — each with a colour.
  - [ ] Midday Dubai hours show High risk/Danger; pre-dawn/late-night hours show better bands.

### Recommending a window
- Candidate starts every 15 minutes across the next 48 h (future only). A window's risk = its worst hour. Best = lowest risk, ties broken by soonest.
- Two alternatives: the next best windows not overlapping the best or each other.
- Reasons explain the main drivers (e.g. "UV 0 — sun's down", "Humidity 78% makes it feel hotter", "Breeze 18 km/h helps cooling").
  - [ ] Increasing run length to 120 min or switching to Heat-sensitive can change the window or band, visibly.
- If even the best window is High risk/Danger, show a red "Consider indoor/treadmill" advice.

### Calendar export
- "Add to calendar" downloads `coolrun-<date>.ics` with title "CoolRun: <length> min run", the window times, and the reasons in the description.

## States and Boundaries
- **First use** — no city chosen: hero copy + demo-data button.
- **Loading** — skeleton shimmer on the cards.
- **Error** (network/API) — message + "Try demo data" button.
- **Nothing persists** except last city and settings in the browser (localStorage).

## Product Decisions
- Deterministic scoring rather than an AI model — explainable and safe (agent recommendation, pending Prajwal's confirmation).
- 48-hour horizon — forecasts beyond that are less reliable and runners plan a day or two ahead.

## What We're Building
Everything under Features and Behavior, on one page.

## Deferred From the POC
Notifications, saved cities list, weekly plan, route/shade data.

## Possible Later Enhancements
Push alert "your window starts in 30 min"; Apple/Google Health heat-acclimatization tracking.

## Non-Goals
Not a medical tool; no accounts; no paid APIs.

## Open Questions
- Exact thresholds are guidance based on common heat-index guidance, not clinical — fine for POC (can wait).
