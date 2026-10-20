---
doc: scope
status: approved
---
<!-- Drafted by the coding agent from Prajwal's brief (useful, judge-friendly, no paid APIs).
     Prajwal: read, edit anything that isn't yours, then change status to approved. -->

# CoolRun

Find the safest time to run in the next 48 hours when you live somewhere hot.

## The Unique Kernel
A **heat-safe run window finder**: instead of a raw forecast, CoolRun scores every hour on *feels-like heat, humidity, UV and wind* against the runner's own run length and heat tolerance, then names the single best window to go — and explains why in plain words.

## Who It's For
A recreational runner in a hot, humid city like Dubai who wants to keep training in summer and shoulder seasons. Today they open a weather app, squint at temperature numbers, and guess "early morning?" — often missing that 05:00 is muggier than 21:00, or that UV makes 07:30 worse than it looks.

## The Core Loop
Open CoolRun → pick a city (or "use my location") → set run length and heat tolerance → see a 48-hour heat ribbon with the best window highlighted → add it to the calendar. Come back the next day for the next run.

## Inspiration & Identity
Calm, cool, sporty. Dark navy "night run" background, a heat ribbon running from cool teal to hot coral. Big confident numbers, short plain-English verdicts. Feels like a coach, not a weather station.

## Why This Matters to the Learner
Lives in Dubai, where heat illness is a real risk for anyone exercising outdoors for much of the year.

## What "Working" Looks Like
Type "Dubai", 45-minute easy run, "normal" tolerance → within a second the app shows "Best: Tomorrow 05:00–05:45, feels like 29°C, Caution" with a highlighted band on the 48-hour ribbon, the reasons, and a button that downloads a calendar event. The "oh, that's cool" beat: switching to 90 minutes or "heat-sensitive" visibly moves the recommended window.

## The POC Boundary
City search + geolocation, live forecast (free, no key), hourly heat-risk scoring, best-window search for a given duration, 48h ribbon visual, plain-English reasons, .ics calendar export, offline sample-data mode so it always demos.

## Later
Notifications, multi-day training plans, route shade data, wearables, saved favourite cities.

## Explicitly Cut
- Accounts/login — nothing needs to be personal or stored server-side.
- Medical advice — CoolRun gives guidance bands, not a diagnosis.
- AI chat — a deterministic, explainable score is more trustworthy for safety than an LLM guess.
