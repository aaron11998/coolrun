import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeForecast, scoreHours, findWindows, scoreHour } from '../app/scoring.js';

const json = JSON.parse(readFileSync(new URL('../app/sample-dubai.json', import.meta.url)));
const hours = normalizeForecast(json);
const now = new Date(hours[0].time.getTime() + 10 * 3600e3);

test('sun, humidity and effort make it feel hotter; tolerance helps', () => {
  const h = { feels: 30, temp: 28, rh: 80, uv: 8, wind: 0, isDay: true };
  const base = scoreHour({ ...h, uv: 0, rh: 50, isDay: false }, { effort: 'easy', tolerance: 'normal' }).eff;
  assert.ok(scoreHour(h, { effort: 'easy', tolerance: 'normal' }).eff > base);
  assert.ok(scoreHour(h, { effort: 'hard', tolerance: 'normal' }).eff > scoreHour(h, { effort: 'easy', tolerance: 'normal' }).eff);
  assert.ok(scoreHour(h, { effort: 'easy', tolerance: 'acclimatized' }).eff < scoreHour(h, { effort: 'easy', tolerance: 'sensitive' }).eff);
});

test('finds 3 non-overlapping future windows, best first', () => {
  const s = scoreHours(hours, { effort: 'easy', tolerance: 'normal' });
  const w = findWindows(s, 45, now);
  assert.equal(w.length, 3);
  assert.ok(w.every(x => x.start >= now));
  assert.ok(w[0].eff <= w[1].eff || w[0].band < w[1].band);
  for (let i = 0; i < w.length; i++) for (let j = i + 1; j < w.length; j++)
    assert.ok(w[i].end <= w[j].start || w[i].start >= w[j].end);
  assert.equal((w[0].end - w[0].start) / 60e3, 45);
});

test('best window avoids the hottest midday hours', () => {
  const s = scoreHours(hours, { effort: 'easy', tolerance: 'normal' });
  const w = findWindows(s, 45, now)[0];
  const hottest = Math.max(...s.map(h => h.eff));
  assert.ok(w.eff < hottest - 3);
});
