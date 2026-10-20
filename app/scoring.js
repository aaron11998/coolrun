// Pure heat-scoring and window-finding logic. No DOM, no network.
export const BANDS = [
  { key: 'ideal',   label: 'Ideal',     max: 24,       color: '#2dd4bf', advice: 'Great running weather.' },
  { key: 'good',    label: 'Good',      max: 28,       color: '#84cc16', advice: 'Comfortable — carry water on longer runs.' },
  { key: 'caution', label: 'Caution',   max: 32,       color: '#fbbf24', advice: 'Slow the pace, hydrate before and after.' },
  { key: 'high',    label: 'High risk', max: 36,       color: '#fb7185', advice: 'Shorten it or go easy; watch for heat symptoms.' },
  { key: 'danger',  label: 'Danger',    max: Infinity, color: '#e11d48', advice: 'Consider the treadmill or an indoor session.' },
];
export const EFFORT = { easy: 0, tempo: 1.5, hard: 3 };
export const TOLERANCE = { sensitive: -2, normal: 0, acclimatized: 2 };

export function bandFor(eff) { return BANDS.findIndex(b => eff < b.max); }

/** Effective feels-like °C for one hour given runner settings, with the parts that explain it. */
export function scoreHour(h, s) {
  const parts = [];
  let eff = h.feels;
  const uv = h.isDay ? 0.6 * h.uv : 0;
  if (uv > 0.3) parts.push({ d: uv, text: `UV ${h.uv.toFixed(1)} — direct sun adds heat` });
  else parts.push({ d: 0, text: h.isDay ? 'Low sun' : "Sun's down — no UV load", good: true });
  const hum = h.rh > 60 ? 0.08 * (h.rh - 60) : 0;
  if (hum > 0) parts.push({ d: hum, text: `Humidity ${Math.round(h.rh)}% slows sweat cooling` });
  else parts.push({ d: 0, text: `Dry air (${Math.round(h.rh)}% humidity) helps cooling`, good: true });
  const wind = 0.08 * Math.min(h.wind, 30);
  if (h.wind >= 10) parts.push({ d: -wind, text: `Breeze ${Math.round(h.wind)} km/h helps you cool`, good: true });
  const effort = EFFORT[s.effort] ?? 0;
  const tol = TOLERANCE[s.tolerance] ?? 0;
  eff = eff + uv + hum - wind + effort - tol;
  return { eff, band: bandFor(eff), parts };
}

export function scoreHours(hours, s) { return hours.map(h => ({ ...h, ...scoreHour(h, s) })); }

/** Find best + up to 2 alternatives (≥3 h apart, alternative windows of `minutes` length starting after `now`. */
export function findWindows(scored, minutes, now, count = 3) {
  if (!scored.length) return [];
  const t0 = scored[0].time.getTime();
  const H = 3600e3, step = 15 * 60e3, len = minutes * 60e3;
  const end = scored[scored.length - 1].time.getTime() + H;
  const startMin = Math.max(t0, Math.ceil(now.getTime() / step) * step);
  const horizon = Math.min(end, now.getTime() + 48 * H);
  const cands = [];
  for (let st = startMin; st + len <= horizon; st += step) {
    const a = Math.floor((st - t0) / H), b = Math.floor((st + len - 1 - t0) / H);
    const hrs = scored.slice(a, b + 1);
    if (!hrs.length) continue;
    const worst = hrs.reduce((m, h) => (h.eff > m.eff ? h : m));
    const avg = hrs.reduce((t, h) => t + h.eff, 0) / hrs.length;
    cands.push({ start: new Date(st), end: new Date(st + len), worst, eff: worst.eff, avg, band: worst.band, hours: hrs });
  }
  cands.sort((x, y) => x.band - y.band || x.eff - y.eff || x.start - y.start);
  const picked = [];
  for (const c of cands) {
    const gap = 3 * H; // alternatives should be genuinely different sessions
    if (picked.every(p => c.end.getTime() + gap <= p.start.getTime() || c.start.getTime() >= p.end.getTime() + gap)) picked.push(c);
    if (picked.length === count) break;
  }
  return picked;
}

/** Plain-English reasons for a window, strongest drivers first. */
export function reasonsFor(win) {
  const h = win.worst;
  const r = [`Feels like ${Math.round(h.feels)}°C (air ${Math.round(h.temp)}°C)`];
  const sorted = [...h.parts].sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
  for (const p of sorted.slice(0, 3)) r.push(p.text);
  if (h.rain >= 40) r.push(`${Math.round(h.rain)}% chance of rain`);
  return r;
}

export function normalizeForecast(json) {
  const H = json.hourly;
  return H.time.map((t, i) => ({
    time: new Date(t), feels: H.apparent_temperature[i], temp: H.temperature_2m[i],
    rh: H.relative_humidity_2m[i], uv: H.uv_index[i] ?? 0, wind: H.wind_speed_10m[i],
    rain: H.precipitation_probability?.[i] ?? 0, isDay: !!H.is_day?.[i],
  }));
}
