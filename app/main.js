import { searchCities, getForecast, getSample } from './api.js';
import { normalizeForecast, scoreHours, findWindows, reasonsFor } from './scoring.js';
import { render, renderSuggestions, showStatus, hideStatus, showLoading } from './ui.js';
import { buildIcs, download } from './ics.js';
const $ = id => document.getElementById(id);

const saved = JSON.parse(localStorage.getItem('coolrun.settings') || '{}');
const settings = { len: 45, tolerance: 'normal', effort: 'easy', ...saved.settings };
let data = null; // { place, hours, now }

function save() { localStorage.setItem('coolrun.settings', JSON.stringify({ settings, place: data?.placeObj })); }

function recompute() {
  if (!data) return;
  const scored = scoreHours(data.hours, settings);
  const wins = findWindows(scored, settings.len, data.now);
  render({ place: data.place, scored, wins, now: data.now, settings });
  $('ics') && ($('ics').onclick = () => {
    const w = wins[0];
    download(`coolrun-${w.start.toISOString().slice(0,10)}.ics`, buildIcs({
      start: w.start, end: w.end, title: `CoolRun: ${settings.len} min ${settings.effort} run`, location: data.place,
      description: reasonsFor(w).join('\n') + '\nPlanned with CoolRun',
    }));
  });
}

// "Now" expressed in the city's local clock (forecast times are city-local).
function cityNow(offsetSec) {
  const utc = Date.now() + new Date().getTimezoneOffset() * 60e3;
  return new Date(utc + offsetSec * 1e3);
}

async function load(placeObj) {
  hideStatus(); showLoading();
  try {
    const json = await getForecast(placeObj.latitude, placeObj.longitude);
    data = { place: placeObj.name, placeObj, hours: normalizeForecast(json), now: cityNow(json.utc_offset_seconds) };
    $('city').value = placeObj.name; save(); recompute();
  } catch (e) {
    $('results').hidden = true;
    showStatus(`Couldn't reach the forecast service (${e.message}).`, true, true);
    $('demo2').onclick = loadDemo;
  }
}

async function loadDemo() {
  hideStatus();
  const json = await getSample();
  const hours = normalizeForecast(json);
  // Treat demo data as if it were fetched today at the current hour of day.
  const n = new Date(); const now = new Date(hours[0].time); now.setHours(n.getHours(), n.getMinutes());
  data = { place: 'Dubai (demo data)', hours, now };
  $('city').value = 'Dubai (demo data)'; recompute();
}

// City search with debounce
let timer, ctrl;
$('city').addEventListener('input', e => {
  clearTimeout(timer); const q = e.target.value.trim();
  if (q.length < 2) { renderSuggestions([], null); return; }
  timer = setTimeout(async () => {
    ctrl?.abort(); ctrl = new AbortController();
    try { renderSuggestions(await searchCities(q, ctrl.signal), load); } catch {}
  }, 250);
});
$('city').addEventListener('keydown', e => { if (e.key === 'Enter') $('suggest').querySelector('li')?.click(); });
$('locate').onclick = () => {
  if (!navigator.geolocation) return showStatus('Location is not available in this browser — search a city instead.', true);
  navigator.geolocation.getCurrentPosition(
    p => load({ name: 'My location', latitude: p.coords.latitude, longitude: p.coords.longitude }),
    () => showStatus('Location permission was denied — no problem, search a city instead.', true));
};
$('demo').onclick = loadDemo;

// Controls
const lenOut = () => ($('lenOut').textContent = `${settings.len} min`);
$('len').value = settings.len; lenOut();
$('len').addEventListener('input', e => { settings.len = +e.target.value; lenOut(); save(); recompute(); });
for (const key of ['tolerance', 'effort']) {
  const seg = $(key);
  seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === settings[key]));
  seg.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    settings[key] = b.dataset.v; seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    save(); recompute();
  };
}
if (saved.place) load(saved.place);
