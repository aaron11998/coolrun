import { BANDS, reasonsFor } from './scoring.js';
const $ = id => document.getElementById(id);
const hm = d => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
export function dayLabel(d, now) {
  const a = new Date(d); a.setHours(0,0,0,0); const b = new Date(now); b.setHours(0,0,0,0);
  const diff = Math.round((a - b) / 864e5);
  const wd = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
  return diff === 0 ? `Today · ${wd}` : diff === 1 ? `Tomorrow · ${wd}` : wd;
}
const pill = b => `<span class="pill" style="background:${BANDS[b].color}">${BANDS[b].label}</span>`;

export function showStatus(msg, err = false, withDemo = false) {
  const s = $('status'); s.hidden = false; s.className = 'status' + (err ? ' err' : '');
  s.innerHTML = msg + (withDemo ? ' <button class="link" id="demo2">Try offline demo data</button>' : '');
}
export function hideStatus() { $('status').hidden = true; }
export function showLoading() {
  $('results').hidden = false;
  $('best').innerHTML = '<div class="skel"></div>'; $('alts').innerHTML = '<div class="card skel"></div><div class="card skel"></div>';
}

export function render({ place, scored, wins, now, settings }) {
  $('results').hidden = false;
  const [best, ...alts] = wins;
  if (!best) { $('best').innerHTML = '<p>No full window fits in the next 48 hours — try a shorter run.</p>'; $('alts').innerHTML=''; }
  else {
    const B = BANDS[best.band];
    $('best').innerHTML = `<div class="glow" style="background:${B.color}"></div>
      <div class="kicker">Best window in ${place} · ${settings.len} min ${settings.effort} run</div>
      <div class="when">${hm(best.start)} – ${hm(best.end)}</div>
      <div class="day">${dayLabel(best.start, now)}</div>
      <div class="stats">
        <div><b>${Math.round(best.worst.feels)}°C</b>feels like</div>
        <div><b>${Math.round(best.worst.rh)}%</b>humidity</div>
        <div><b>${best.worst.isDay ? best.worst.uv.toFixed(1) : '0'}</b>UV</div>
        <div><b>${pill(best.band)}</b>heat risk</div>
      </div>
      <ul class="reasons">${reasonsFor(best).map(r => `<li>${r}</li>`).join('')}</ul>
      <div class="advice ${best.band >= 3 ? 'bad' : ''}">${best.band >= 3 ? '⚠️ Even the best window is risky. ' : '💧 '}${B.advice}</div>
      <button class="cta" id="ics">📅 Add to calendar</button>`;
    $('alts').innerHTML = alts.map((w, i) => `<div class="card alt">
      <div class="kicker">Alternative ${i + 1}</div>
      <div class="when">${hm(w.start)} – ${hm(w.end)}</div>
      <div class="day" style="color:var(--mute);margin-bottom:10px">${dayLabel(w.start, now)}</div>
      ${pill(w.band)} <span style="color:var(--mute);margin-left:8px">feels ${Math.round(w.worst.feels)}°C</span></div>`).join('')
      || '<div class="card alt"><div class="kicker">No other windows</div></div>';
  }
  // Ribbon: 48 hours starting at the current hour
  const startIdx = Math.max(0, scored.findIndex(h => h.time.getTime() + 3600e3 > now.getTime()));
  const hrs = scored.slice(startIdx, startIdx + 48);
  const inWin = h => best && h.time < best.end && h.time.getTime() + 3600e3 > best.start.getTime();
  $('ribbon').innerHTML = hrs.map((h, i) => `<div class="h ${inWin(h) ? 'win' : ''}" data-i="${i}" style="background:${BANDS[h.band].color}"></div>`).join('')
    + hrs.map(h => `<div class="lab">${h.time.getHours() % 6 === 0 ? (h.time.getHours() === 0 ? h.time.toLocaleDateString('en-GB',{weekday:'short'}) : String(h.time.getHours()).padStart(2,'0')+':00') : ''}</div>`).join('');
  $('legend').innerHTML = BANDS.map(b => `<span><i style="background:${b.color}"></i>${b.label}</span>`).join('');
  const detail = h => `<b style="color:var(--text)">${dayLabel(h.time, now).split(' · ')[0]} ${hm(h.time)}</b> · ${BANDS[h.band].label} · feels ${Math.round(h.feels)}°C (air ${Math.round(h.temp)}°C) · humidity ${Math.round(h.rh)}% · UV ${h.isDay ? h.uv.toFixed(1) : 0} · wind ${Math.round(h.wind)} km/h`;
  $('ribbon').onmouseover = $('ribbon').onclick = e => { const i = e.target.dataset?.i; if (i != null) $('detail').innerHTML = detail(hrs[i]); };
  $('detail').textContent = 'Hover or tap an hour for details. The outlined hours are your best window.';
}

export function renderSuggestions(list, onPick) {
  const ul = $('suggest');
  if (!list.length) { ul.hidden = true; return; }
  ul.innerHTML = list.map((c, i) => `<li data-i="${i}">${c.name} <small>${[c.admin1, c.country].filter(Boolean).join(', ')}</small></li>`).join('');
  ul.hidden = false;
  ul.onclick = e => { const li = e.target.closest('li'); if (li) { ul.hidden = true; onPick(list[li.dataset.i]); } };
}
