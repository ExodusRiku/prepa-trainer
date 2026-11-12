import { makeRng, fmt } from './rng.js';
import { TIPS } from './tips.js';
import { subAccuracy, adaptLevel, setAdaptLevel } from './storage.js';

let counter = 0;

// Affichage propre : supprime le bruit flottant (99.99999999999999 → 100) et met la virgule décimale française
export function cleanText(t) {
  if (typeof t !== 'string') return t;
  return t
    .replace(/\d+\.\d*?(?:0{6,}|9{6,})\d*/g, (m) => String(Number(Number(m).toPrecision(10))))
    .replace(/(\d)\.(\d)/g, '$1,$2');
}

// Explication toujours détaillée : explication propre à la question + rappel de méthode du sous-thème
export function buildExpl(q, g) {
  let e = (q.expl || '').trim();
  if (!e) {
    const ans = q.kind === 'mcq' ? q.choices[q.a] : q.kind === 'list' ? q.a.map((x) => fmt(x)).join(' ; ') : q.kind === 'text' ? q.a : fmt(q.a, 5) + (q.unit ? ' ' + q.unit : '');
    e = `Calcul : ${String(q.q).replace(/\n+/g, ' ').replace(/\(fraction ou décimal.*?\)/, '').trim()} → ${ans}.`;
  }
  const tip = g.tip || TIPS[g.sub];
  if (tip && !e.includes(tip)) e += `\n\nMéthode à retenir : ${tip}`;
  return cleanText(e);
}

export class Session {
  constructor(theme, { level = 0, n = 10, timed = false, oom = false, sub = '' } = {}) {
    this.theme = theme; this.adaptive = level === 0; this.level = level || adaptLevel(theme.id);
    this.n = n; this.timed = timed; this.oom = oom; this.sub = sub;
    this.queue = []; this.done = 0; this.results = []; this.streakOk = 0; this.streakKo = 0;
    this.weak = subAccuracy(theme.id);
    this.pool = theme.gens.filter((g) => (!sub || g.sub === sub) && !(g.oomOnly && !oom) && !(g.exactOnly && oom));
    if (!this.pool.length) this.pool = theme.gens;
  }
  pickGen() {
    const L = this.level;
    const ws = this.pool.map((g) => {
      let w = g.lvl === L ? 5 : Math.abs(g.lvl - L) === 1 ? 2 : g.lvl < L ? 0.7 : 0.15;
      if (this.sub) w = Math.max(w, 1);
      const a = this.weak[g.sub];
      if (a && a.n >= 3) w *= 1 + 2 * (1 - a.ok / a.n); // révision espacée: on insiste sur les points faibles
      return w;
    });
    const tot = ws.reduce((a, b) => a + b, 0);
    let x = Math.random() * tot;
    for (let i = 0; i < ws.length; i++) { x -= ws[i]; if (x <= 0) return this.pool[i]; }
    return this.pool[0];
  }
  next() {
    if (this.done >= this.n) return null;
    if (!this.queue.length) {
      const g = this.pickGen();
      const r = makeRng((Date.now() ^ (counter++ * 2654435761)) >>> 0);
      let out = g.gen(r);
      const arr = Array.isArray(out) ? out : [out];
      const ctx = Array.isArray(out) ? arr.ctx || arr[0].ctx : null;
      arr.forEach((q) => { q.expl = buildExpl(q, g); q.q = cleanText(q.q); if (q.ctx) q.ctx = cleanText(q.ctx); if (q.consts) q.consts = cleanText(q.consts); if (q.kind === 'mcq' && !q.htmlChoices) q.choices = q.choices.map(cleanText); if (q.why) q.why = q.why.map(cleanText); });
      arr.forEach((q, i) => { q.sub = g.sub; q.lvl = g.lvl; q.gid = g.id; q.kind ||= 'num'; q.mental = !!g.mental; q.part = arr.length > 1 ? `${i + 1}/${arr.length}` : null; });
      this.queue.push(...arr);
    }
    this.current = this.queue.shift();
    this.t0 = Date.now();
    return this.current;
  }
  answered(ok) {
    this.done++;
    this.results.push(ok);
    if (ok) { this.streakOk++; this.streakKo = 0; } else { this.streakKo++; this.streakOk = 0; }
    if (this.adaptive) {
      if (this.streakOk >= 3 && this.level < 5) { this.level++; this.streakOk = 0; }
      if (this.streakKo >= 2 && this.level > 1) { this.level--; this.streakKo = 0; }
      setAdaptLevel(this.theme.id, this.level);
    }
  }
}
