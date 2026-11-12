// Mémoire de progression (localStorage) + export/import
const KEY = 'preptrainer.v1';
const MAX_HIST = 12000;

const blank = () => ({ hist: [], adapt: {}, settings: { oom: false, sysKeyboard: false } });
let state = null;

export function load() {
  if (state) return state;
  try { state = JSON.parse(localStorage.getItem(KEY)) || blank(); } catch (e) { state = blank(); }
  state.hist ||= []; state.adapt ||= {}; state.settings ||= { oom: false, sysKeyboard: false };
  return state;
}
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota / privé */ }
}
export function record(entry) {
  load().hist.push(entry);
  if (state.hist.length > MAX_HIST) state.hist.splice(0, state.hist.length - MAX_HIST);
  save();
}
export function settings() { return load().settings; }
export function adaptLevel(theme) { return load().adapt[theme] || 2; }
export function setAdaptLevel(theme, l) { load().adapt[theme] = Math.max(1, Math.min(5, l)); save(); }

export function exportJSON() { return JSON.stringify({ app: 'preptrainer', version: 1, data: load() }); }
export function importJSON(text, merge = true) {
  const obj = JSON.parse(text);
  if (!obj || obj.app !== 'preptrainer') throw new Error('Fichier invalide');
  const inc = obj.data;
  const cur = load();
  if (!merge) { state = Object.assign(blank(), inc); save(); return; }
  const key = (h) => `${h.t}|${h.sub}|${h.theme}`;
  const seen = new Set(cur.hist.map(key));
  for (const h of inc.hist || []) if (!seen.has(key(h))) cur.hist.push(h);
  cur.hist.sort((a, b) => a.t - b.t);
  if (cur.hist.length > MAX_HIST) cur.hist.splice(0, cur.hist.length - MAX_HIST);
  cur.adapt = Object.assign({}, inc.adapt || {}, cur.adapt);
  save();
}
export function reset() { state = blank(); save(); }

// Statistiques
export function statsBy(fn, since = 0) {
  const m = {};
  for (const h of load().hist) {
    if (h.t < since) continue;
    const k = fn(h);
    const o = (m[k] ||= { n: 0, ok: 0, ms: 0 });
    o.n++; if (h.ok) o.ok++; o.ms += h.ms || 0;
  }
  return m;
}
export function subAccuracy(theme) {
  const m = statsBy((h) => (h.theme === theme ? h.sub : null), Date.now() - 60 * 864e5);
  delete m.null;
  return m;
}
export function dailySeries(days = 14, theme = null) {
  const out = [];
  const day = 864e5;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const t0 = today.getTime() - i * day;
    let n = 0, ok = 0;
    for (const h of load().hist) if (h.t >= t0 && h.t < t0 + day && (!theme || h.theme === theme)) { n++; if (h.ok) ok++; }
    out.push({ t0, n, ok });
  }
  return out;
}
export function streak() {
  const days = new Set(load().hist.map((h) => { const d = new Date(h.t); d.setHours(0, 0, 0, 0); return d.getTime(); }));
  let s = 0; const d = new Date(); d.setHours(0, 0, 0, 0);
  if (!days.has(d.getTime())) d.setDate(d.getDate() - 1);
  while (days.has(d.getTime())) { s++; d.setDate(d.getDate() - 1); }
  return s;
}
