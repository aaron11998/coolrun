// Records the CoolRun demo headlessly with Playwright. Usage (server running):
//   node video/record.mjs   (needs `npm i playwright` somewhere on NODE_PATH)
import { chromium } from 'playwright';
const OUT = process.env.OUT || new URL('./tmp/', import.meta.url).pathname;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, timezoneId: 'Asia/Dubai',
  recordVideo: { dir: OUT, size: { width: 1280, height: 800 } }, acceptDownloads: true });
const p = await ctx.newPage();
const T0 = Date.now(); const marks = [];
await p.goto('http://localhost:5173');
await p.addStyleTag({ content: `
  #cap{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:999;max-width:1000px;background:#000c;color:#fff;
   font:600 24px/1.35 Inter,system-ui,sans-serif;padding:14px 24px;border-radius:14px;text-align:center;transition:opacity .4s;box-shadow:0 10px 30px #0008}
  #card{position:fixed;inset:0;z-index:1000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;
   background:radial-gradient(800px 400px at 70% 20%,#1d3a6b,#0b1324);color:#e8eefc;font-family:Inter,system-ui,sans-serif;transition:opacity .6s;text-align:center;padding:40px}
  #card h1{font-size:64px;margin:0}#card h1 span{color:#2dd4bf}#card p{font-size:28px;color:#b6c3e3;margin:0;max-width:980px;line-height:1.4}
  .cursorDot{position:fixed;width:22px;height:22px;border-radius:50%;background:#2dd4bfaa;border:2px solid #fff;z-index:998;pointer-events:none;transform:translate(-50%,-50%);transition:left .5s,top .5s}` });
const card = (html) => p.evaluate(h => { let c = document.getElementById('card'); if (!c) { c = document.createElement('div'); c.id = 'card'; document.body.append(c); } c.innerHTML = h; c.style.opacity = 1; }, html);
const hideCard = () => p.evaluate(() => { const c = document.getElementById('card'); c.style.opacity = 0; setTimeout(() => c.remove(), 700); });
const cap = (t) => { marks.push([(Date.now() - T0) / 1000, t]); return p.evaluate(t => { let c = document.getElementById('cap'); if (!c) { c = document.createElement('div'); c.id = 'cap'; document.body.append(c); } c.textContent = t; c.style.opacity = t ? 1 : 0; }, t); };
const wait = ms => p.waitForTimeout(ms);
const dot = async (sel) => { const bb = await p.locator(sel).first().boundingBox(); await p.evaluate(([x, y]) => { let d = document.querySelector('.cursorDot'); if (!d) { d = document.createElement('div'); d.className = 'cursorDot'; document.body.append(d); } d.style.left = x + 'px'; d.style.top = y + 'px'; }, [bb.x + bb.width / 2, bb.y + bb.height / 2]); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 12 }); await wait(600); };
const click = async sel => { await dot(sel); await p.click(sel); };

await card(`<h1>❄︎ Cool<span>Run</span></h1><p>Find the safest time to run in the next 48 hours — when you live somewhere hot.</p>`);
await wait(4500);
await card(`<h1 style="font-size:46px">The problem</h1><p>In cities like Dubai, outdoor runners face heat that can be dangerous for much of the year.<br><br>Weather apps show numbers. They don't tell you <b>when</b> it's safe to go — for <b>your</b> run, effort and heat tolerance.</p>`);
await wait(9000);
await card(`<h1 style="font-size:46px">Who it's for</h1><p>Recreational runners in hot, humid cities who want to keep training safely — without guessing "early morning?" and getting it wrong.</p>`);
await wait(6500);
await hideCard(); await wait(800);
await cap('One page. No sign-up, no API keys. Start by searching a city.'); await wait(3500);
await click('#city');
await p.locator('#city').pressSequentially('Dubai', { delay: 160 });
await p.waitForSelector('#suggest li'); await cap('Live city search via the free Open-Meteo geocoding API.'); await wait(2500);
await click('#suggest li');
await p.waitForSelector('#ics', { timeout: 20000 });
await cap('CoolRun fetches the 48-hour forecast and scores every hour for heat risk.'); await wait(4500);
await cap('The answer up front: the best window to run, with feels-like heat, humidity, UV and a risk band.'); await wait(5500);
await dot('.reasons'); await cap('…and plain-English reasons, so you understand WHY this window wins.'); await wait(5000);
await dot('#alts'); await cap('Two genuinely different alternatives, in case the best slot doesn\'t fit your day.'); await wait(4500);
await p.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' })); await wait(1200);
await cap('The 48-hour heat ribbon: every hour coloured from Ideal to Danger. Midday is clearly off-limits.'); await wait(4000);
const hs = p.locator('#ribbon .h');
for (const i of [3, 10, 20, 30]) { const bb = await hs.nth(i).boundingBox(); await p.mouse.move(bb.x + 5, bb.y + 20, { steps: 10 }); await wait(1100); }
await dot('#ribbon .h.win'); await p.hover('#ribbon .h.win'); await cap('Hover any hour for the details. The outlined block is your recommended run.'); await wait(3500);
await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await wait(1000);
await cap('Now make it personal. A longer run needs a longer cool window…');
await dot('#len'); const lb = await p.locator('#len').boundingBox();
await p.mouse.down(); for (let k = 0; k <= 20; k++) { await p.mouse.move(lb.x + lb.width * (0.24 + 0.76 * k / 20), lb.y + lb.height / 2); await wait(70); } await p.mouse.up();
await wait(3500);
await cap('Hard effort plus heat-sensitive: the risk rises and the advice changes — instantly, no reload.');
await click('#effort [data-v="hard"]'); await wait(1500); await click('#tolerance [data-v="sensitive"]'); await wait(4500);
await cap('Acclimatized runner, easy 45 minutes — back to a comfortable window.');
await click('#tolerance [data-v="acclimatized"]'); await click('#effort [data-v="easy"]');
await p.locator('#len').fill('45'); await p.locator('#len').dispatchEvent('input'); await wait(4000);
await cap('Last step: one tap adds the window to your calendar, with a 30-minute reminder.');
const dl = p.waitForEvent('download'); await click('#ics'); const d = await dl; await wait(1500);
await cap(`Downloaded ${d.suggestedFilename()} — works with Google, Apple and Outlook calendars.`); await wait(4000);
await cap('Offline? A bundled demo forecast keeps it working anywhere.'); await click('#demo'); await wait(4000);
await cap('');
await card(`<h1 style="font-size:46px">How it's built</h1><p>Plain HTML, CSS & JavaScript · free Open-Meteo forecast (no key)<br>Transparent scoring: feels-like + sun + humidity + effort − breeze ± tolerance<br>Planned with the Devpost Learn skill pack: scope → PRD → spec → build</p>`);
await wait(8000);
await card(`<h1>❄︎ Cool<span>Run</span></h1><p>Know when to run. Stay cool. Stay safe.<br><span style="font-size:20px;color:#93a3c6">Guidance, not medical advice — listen to your body.</span></p>`);
await wait(4500);
console.log(JSON.stringify(marks));
const vid = p.video(); await ctx.close(); console.log('VIDEO', await vid.path()); await b.close();
