// PRNG à graine + utilitaires de formatage
export function makeRng(seed) {
  let s = seed >>> 0;
  const next = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    next,
    int: (a, b) => a + Math.floor(next() * (b - a + 1)),
    nz: (a, b) => { let v; do v = r.int(a, b); while (v === 0); return v; },
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    shuffle: (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
    sign: () => (next() < 0.5 ? -1 : 1),
  };
  return r;
}

const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
export const sup = (n) => String(n).split('').map((c) => SUP[c] || c).join('');

// Nombre arrondi à `sig` chiffres significatifs, virgule décimale française
export function fmt(x, sig = 4) {
  if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : 'indéfini';
  if (x === 0) return '0';
  const ax = Math.abs(x);
  if (ax >= 1e6 || ax < 1e-3) return sci(x, Math.min(sig, 3));
  let v = Number(x.toPrecision(sig));
  let s = String(v);
  if (s.includes('e')) s = v.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  return s.replace('.', ',').replace('-', '−');
}

// Notation scientifique: 6,6·10⁻³⁴
export function sci(x, sig = 3) {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  let m = x / Math.pow(10, e);
  m = Number(m.toPrecision(sig));
  let ee = e;
  if (Math.abs(m) >= 10) { m /= 10; ee += 1; }
  const ms = String(m).replace('.', ',').replace('-', '−');
  return `${ms}·10${sup(ee)}`;
}

// QCM: renvoie {choices, a(index)} avec bonne réponse mélangée
export function mcq(r, correct, distractors) {
  const seen = new Set([String(correct)]);
  const ds = [];
  for (const d of distractors) { if (!seen.has(String(d))) { seen.add(String(d)); ds.push(d); } }
  const all = r.shuffle([correct, ...ds.slice(0, 4)]);
  return { choices: all, a: all.indexOf(correct) };
}

export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const fact = (n) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
export const comb = (n, k) => { if (k < 0 || k > n) return 0; let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i; return Math.round(c); };
export const frac = (n, d) => { const g = gcd(n, d) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return d === 1 ? String(n).replace('-', '−') : `${String(n).replace('-', '−')}/${d}`; };

// QCM avec explication de chaque mauvaise réponse: wrongs = [[texte, pourquoi c'est faux], ...]
export function mcqWhy(r, correct, wrongs, expl) {
  const seenT = new Set([String(correct)]);
  const uniq = wrongs.filter(([t]) => { if (seenT.has(String(t))) return false; seenT.add(String(t)); return true; });
  const items = [{ t: correct, why: '' }, ...uniq.map(([t, why]) => ({ t, why }))];
  const sh = r.shuffle(items);
  return { kind: 'mcq', choices: sh.map((x) => x.t), a: sh.findIndex((x) => x.t === correct), why: sh.map((x) => `Ta réponse « ${x.t} » est fausse : ${x.why}`), expl };
}
