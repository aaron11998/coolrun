---
doc: checklist
status: approved
---
# Build Checklist

Build mode: fast (agent-driven; learner hands-on review still pending)

## Slices

- [x] **1. Pick a city and see the best run window**
  Becomes usable: Search a city, get the forecast, see the best window card with risk band and reasons.
  Why now: It is the kernel; proves the API, scoring and rendering end to end.
  PRD ref: `prd.md > The Core Journey` (steps 1–4), `prd.md > Scoring heat risk`, `prd.md > Recommending a window`
  Spec ref: `spec.md > Components`, `spec.md > File Structure`
  Build: Static server, page, Open-Meteo client, scoring + window finder, best-window card.
  Verify (mechanical): `node --test test/` passes; headless browser search for "Dubai" renders the card.
  Learner check: Open http://localhost:5173, search your city, check the window makes sense.
  Commit: `CoolRun: heat-safe run window finder (first working slice)`

- [x] **2. Personalise and see the whole 48 hours**
  Becomes usable: Run length / tolerance / effort recalc instantly; alternatives; 48h ribbon with hover details.
  Why now: The "oh, that's cool" beat from scope.
  PRD ref: `prd.md > Recommending a window`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Window finder`, `spec.md > UI`
  Build: Controls, alternatives ≥3 h apart, ribbon, localStorage settings.
  Verify (mechanical): Headless run changes length to 120 min and the window/band changes.
  Learner check: Drag the slider to 120 and switch to Heat-sensitive; watch the window move.
  Commit: `Add personalisation, alternatives and heat ribbon`

- [x] **3. Add to calendar and offline demo**
  Becomes usable: .ics download; demo data and error state.
  Why now: Closes the loop (it's in your calendar) and makes the demo reliable.
  PRD ref: `prd.md > Calendar export`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Calendar export`, `spec.md > Important Failure Modes`
  Build: ics.js, demo button, error card.
  Verify (mechanical): Headless click triggers a `coolrun-YYYY-MM-DD.ics` download.
  Learner check: Click Add to calendar and open the file in your calendar app.
  Commit: `Add calendar export, demo data and README`

## Hands-on Checkpoints
- [ ] Early usable behavior explored — shared final-review session
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review
- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map
- [ ] Learning activity complete
- [ ] Optional edit and transfer reflection addressed
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown

## Revisions
- Alternatives now must be ≥3 h from other picks — first build showed adjacent 15-min-shifted windows that weren't useful choices.
