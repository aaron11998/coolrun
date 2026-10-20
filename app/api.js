export async function searchCities(q, signal) {
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`, { signal });
  if (!r.ok) throw new Error('City search failed');
  return (await r.json()).results ?? [];
}
export async function getForecast(lat, lon) {
  const hourly = 'apparent_temperature,temperature_2m,relative_humidity_2m,uv_index,wind_speed_10m,precipitation_probability,is_day';
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hourly}&forecast_days=3&timezone=auto`);
  if (!r.ok) throw new Error('Forecast unavailable');
  return r.json();
}
export async function getSample() { return (await fetch('./sample-dubai.json')).json(); }
