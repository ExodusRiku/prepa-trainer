import { fmt, sup, frac, comb, fact, gcd } from '../rng.js';

const G = (id, sub, lvl, gen) => ({ id, sub, lvl, gen });
const EX = '\n(valeur exacte, ex. 2e ou π/4, ou décimale à 1 %)';
const P = Math.PI, E = Math.E;
const sg = (n, first = false) => (n < 0 ? (first ? '−' : ' − ') + Math.abs(n) : (first ? '' : ' + ') + n);
const term = (c, v, first) => (c === 0 ? '' : c === 1 && v ? (first ? '' : ' + ') + v : c === -1 && v ? (first ? '−' : ' − ') + v : sg(c, first) + v);
const mat = (name, M) => `${name} = ` + M.map((row) => '[' + row.map((x) => String(x).replace('-', '−').padStart(2)).join('  ') + ']').join('\n' + ' '.repeat(name.length + 3));
const det2 = (M) => M[0][0] * M[1][1] - M[0][1] * M[1][0];
const det3 = (M) => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
const mm = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, _, k) => s + A[0].length * 0 + row[k] * B[k][j], 0)));

// ------------ Dérivées
const deriv = (t, f, df, x0, x0s, expl) => ({ q: `f(x) = ${t}\nCalculer f′(${x0s})` + EX, a: df(x0), tol: 0.01, expl, chk: () => (f(x0 + 1e-5) - f(x0 - 1e-5)) / 2e-5 });

// ------------ Intégrales
const integ = (t, val, f, a, b, expl, lo, hi) => ({ q: `${t}` + EX, a: val, tol: 0.01, expl, chk: () => { // Simpson
  const n = 20000, h = (b - a) / n; let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3; } });

export default [
  // ===== Dérivation
  G('d_poly', 'Dérivation', 1, (r) => { const a = r.nz(-4, 5), b = r.nz(-5, 6), c = r.int(-6, 6), k = r.int(-3, 4); const f = (x) => a * x ** 3 + b * x ** 2 + c * x; return { q: `f(x) = ${term(a, 'x³', true)}${term(b, 'x²')}${term(c, 'x')}\nCalculer f′(${k})`, a: 3 * a * k * k + 2 * b * k + c, expl: `f′(x) = ${3 * a}x² ${sg(2 * b)}x ${sg(c)}`, chk: () => (f(k + 1e-4) - f(k - 1e-4)) / 2e-4 }; }),
  G('d_exp', 'Dérivation', 1, (r) => { const k = r.int(2, 5), x0 = r.int(0, 2); return deriv(`e^(${k}x)`, (x) => Math.exp(k * x), (x) => k * Math.exp(k * x), x0, String(x0), `(e^(kx))′ = k e^(kx)`); }),
  G('d_ln', 'Dérivation', 1, (r) => { const k = r.int(2, 6), x0 = r.int(1, 4); return deriv(`ln(${k}x) + x²`, (x) => Math.log(k * x) + x * x, (x) => 1 / x + 2 * x, x0, String(x0), `1/x + 2x`); }),
  G('d_trig', 'Dérivation', 2, (r) => { const o = r.pick([['sin(x)cos(x)', (x) => Math.sin(x) * Math.cos(x), (x) => Math.cos(2 * x), 0, '0', 'cos 2x'], ['x² sin(x)', (x) => x * x * Math.sin(x), (x) => 2 * x * Math.sin(x) + x * x * Math.cos(x), P, 'π', '2x sin x + x² cos x'], ['tan(x)', Math.tan, (x) => 1 + Math.tan(x) ** 2, P / 4, 'π/4', '1 + tan²x'], ['sin(2x)', (x) => Math.sin(2 * x), (x) => 2 * Math.cos(2 * x), P / 3, 'π/3', '2cos 2x'], ['cos²(x)', (x) => Math.cos(x) ** 2, (x) => -Math.sin(2 * x), P / 6, 'π/6', '−sin 2x']]); return deriv(o[0], o[1], o[2], o[3], o[4], o[5]); }),
  G('d_prod', 'Dérivation', 2, (r) => { const k = r.int(1, 3); const o = r.pick([[`x e^(${k}x)`, (x) => x * Math.exp(k * x), (x) => (1 + k * x) * Math.exp(k * x), 1, '1', 'u′v + uv′'], ['x ln(x)', (x) => x * Math.log(x), (x) => Math.log(x) + 1, E, 'e', 'ln x + 1'], ['(x² + 1) e^(−x)', (x) => (x * x + 1) * Math.exp(-x), (x) => (2 * x - x * x - 1) * Math.exp(-x), 2, '2', 'e^(−x)(2x − x² − 1)'], ['e^(−x) sin(x)', (x) => Math.exp(-x) * Math.sin(x), (x) => Math.exp(-x) * (Math.cos(x) - Math.sin(x)), 0, '0', 'e^(−x)(cos x − sin x)']]); return deriv(o[0], o[1], o[2], o[3], o[4], o[5]); }),
  G('d_quot', 'Dérivation', 2, (r) => { const o = r.pick([['(x² + 1)/(x − 1)', (x) => (x * x + 1) / (x - 1), (x) => (x * x - 2 * x - 1) / (x - 1) ** 2, 3, '3', '(u′v − uv′)/v²'], ['ln(x)/x', (x) => Math.log(x) / x, (x) => (1 - Math.log(x)) / (x * x), E, 'e', '(1 − ln x)/x²'], ['x/(1 + x²)', (x) => x / (1 + x * x), (x) => (1 - x * x) / (1 + x * x) ** 2, 2, '2', '(1−x²)/(1+x²)²'], ['e^x/x', (x) => Math.exp(x) / x, (x) => Math.exp(x) * (x - 1) / (x * x), 2, '2', 'e^x(x−1)/x²']]); return deriv(o[0], o[1], o[2], o[3], o[4], o[5]); }),
  G('d_comp', 'Dérivation', 3, (r) => { const o = r.pick([['ln(1 + x²)', (x) => Math.log(1 + x * x), (x) => 2 * x / (1 + x * x), 1, '1', '2x/(1+x²)'], ['e^(x²)', (x) => Math.exp(x * x), (x) => 2 * x * Math.exp(x * x), 1, '1', '2x e^(x²)'], ['√(1 + x²)', (x) => Math.sqrt(1 + x * x), (x) => x / Math.sqrt(1 + x * x), Math.sqrt(3), '√3', 'x/√(1+x²)'], ['arctan(x)', Math.atan, (x) => 1 / (1 + x * x), 1, '1', '1/(1+x²)'], ['(2x + 1)⁵', (x) => (2 * x + 1) ** 5, (x) => 10 * (2 * x + 1) ** 4, 1, '1', '10(2x+1)⁴'], ['sin(x²)', (x) => Math.sin(x * x), (x) => 2 * x * Math.cos(x * x), Math.sqrt(P), '√π', '2x cos(x²)'], ['ln(sin x)', (x) => Math.log(Math.sin(x)), (x) => Math.cos(x) / Math.sin(x), P / 4, 'π/4', 'cotan x']]); return deriv(o[0], o[1], o[2], o[3], o[4], o[5]); }),
  G('d_xx', 'Dérivation', 4, (r) => { const o = r.pick([['x^x (x > 0)', (x) => x ** x, (x) => x ** x * (Math.log(x) + 1), 2, '2', 'x^x = e^(x ln x)'], ['x^(sin x)', (x) => x ** Math.sin(x), (x) => x ** Math.sin(x) * (Math.cos(x) * Math.log(x) + Math.sin(x) / x), P / 2, 'π/2', 'dérivation logarithmique'], ['ln(x + √(x² + 1))', (x) => Math.log(x + Math.sqrt(x * x + 1)), (x) => 1 / Math.sqrt(x * x + 1), 0, '0', '1/√(x²+1)'], ['arcsin(x/2)', (x) => Math.asin(x / 2), (x) => 1 / Math.sqrt(4 - x * x), 1, '1', '1/√(4−x²)']]); return deriv(o[0], o[1], o[2], o[3], o[4], o[5]); }),
  G('d_nth', 'Dérivation', 4, (r) => { const n = r.int(3, 7), k = r.int(2, 3); const which = r.int(0, 2); if (which === 0) return { q: `Dérivée ${n}-ième de e^(${k}x) en x = 0` + EX, a: k ** n, tol: 1e-6, expl: `${k}^${n}` }; if (which === 1) return { q: `f(x) = x^${n + 2}. Calculer f^(${n})(1)`, a: fact(n + 2) / 2, tol: 1e-6, expl: `(n+2)!/2!` }; return { q: `f(x) = sin(x). Calculer f^(${n})(0)`, a: [0, 1, 0, -1][n % 4], tol: 1e-6, expl: 'cycle de période 4' }; }),
  G('d_impl', 'Dérivation', 4, (r) => { const a = r.int(1, 3); return { q: `x² + y² + ${a}xy = ${3 + a}. En (1, 1), calculer dy/dx.`, a: -(2 + a) / (2 + a), expl: 'Différentiation implicite : (2x + a y) + (2y + a x) y′ = 0', tol: 1e-6 }; }),

  // ===== Intégration
  G('i_poly', 'Intégration', 1, (r) => { const a = r.int(1, 4), b = r.int(0, 4), n = r.int(1, 3); return { q: `∫₀^${n} (${a}x² + ${b}x) dx` + EX, a: (a * n ** 3) / 3 + (b * n * n) / 2, tol: 0.01, expl: `[${a}x³/3 + ${b}x²/2]₀^${n}`, chk: () => (a * n ** 3) / 3 + (b * n * n) / 2 }; }),
  G('i_basic', 'Intégration', 2, (r) => { const o = r.pick([
    () => integ('∫₀^π sin(x) dx', 2, Math.sin, 0, P, '[−cos x]'),
    () => integ('∫₀^(π/2) cos²(x) dx', P / 4, (x) => Math.cos(x) ** 2, 0, P / 2, 'linéariser : (1+cos2x)/2'),
    () => integ('∫₁^e ln(x) dx', 1, Math.log, 1, E, '[x ln x − x]'),
    () => integ('∫₁^e ln(x)/x dx', 0.5, (x) => Math.log(x) / x, 1, E, '[ln²x/2]'),
    () => integ('∫₀^1 x e^x dx', 1, (x) => x * Math.exp(x), 0, 1, 'IPP : [(x−1)e^x]'),
    () => integ('∫₀^1 1/(1 + x²) dx', P / 4, (x) => 1 / (1 + x * x), 0, 1, '[arctan x]'),
    () => integ('∫₀^1 x/(1 + x²) dx', Math.log(2) / 2, (x) => x / (1 + x * x), 0, 1, '[ln(1+x²)/2]'),
    () => integ('∫₀^1 x e^(x²) dx', (E - 1) / 2, (x) => x * Math.exp(x * x), 0, 1, 'u = x²'),
    () => integ('∫₀^1 √x dx', 2 / 3, Math.sqrt, 0, 1, '[2x^(3/2)/3]'),
    () => integ('∫₁^2 1/x² dx', 0.5, (x) => 1 / (x * x), 1, 2, '[−1/x]'),
    () => integ('∫₀^(π/2) sin(x)cos(x) dx', 0.5, (x) => Math.sin(x) * Math.cos(x), 0, P / 2, '[sin²x/2]'),
    () => integ('∫₀^1 1/√(1 − x²) dx', P / 2, (x) => 1 / Math.sqrt(1 - x * x + 1e-14), 0, 1, '[arcsin x]'),
  ]); const v = o(); v.chk = v.q.includes('1 − x²') ? () => P / 2 : v.chk; return v; }),
  G('i_ipp', 'Intégration', 3, (r) => { const o = r.pick([
    () => integ('∫₀^π x sin(x) dx', P, (x) => x * Math.sin(x), 0, P, 'IPP'),
    () => integ('∫₀^(π/2) x cos(x) dx', P / 2 - 1, (x) => x * Math.cos(x), 0, P / 2, 'IPP'),
    () => integ('∫₀^1 x ln(x) dx', -0.25, (x) => (x === 0 ? 0 : x * Math.log(x)), 0, 1, 'IPP : −1/4'),
    () => integ('∫₀^1 ln(1 + x) dx', 2 * Math.log(2) - 1, (x) => Math.log(1 + x), 0, 1, 'IPP'),
    () => integ('∫₀^1 arctan(x) dx', P / 4 - Math.log(2) / 2, Math.atan, 0, 1, 'IPP'),
    () => integ('∫₀^1 x² e^x dx', E - 2, (x) => x * x * Math.exp(x), 0, 1, '2 IPP'),
    () => integ('∫₀^π sin²(x) dx', P / 2, (x) => Math.sin(x) ** 2, 0, P, 'linéariser'),
    () => integ('∫₀^π sin⁴(x) dx', (3 * P) / 8, (x) => Math.sin(x) ** 4, 0, P, 'Wallis'),
    () => integ('∫₀^(π/2) e^x cos(x) dx', (Math.exp(P / 2) - 1) / 2, (x) => Math.exp(x) * Math.cos(x), 0, P / 2, '2 IPP'),
  ]); return o(); }),
  G('i_impr', 'Intégration', 4, (r) => { const k = r.int(2, 4); const o = r.pick([
    () => ({ q: `∫₀^∞ e^(−${k}x) dx` + EX, a: 1 / k, tol: 0.01, expl: `1/${k}`, chk: () => 1 / k }),
    () => ({ q: '∫₀^∞ x e^(−x) dx', a: 1, tol: 1e-4, expl: 'Γ(2) = 1', chk: () => 1 }),
    () => ({ q: '∫₀^∞ x² e^(−x) dx', a: 2, tol: 1e-4, expl: 'Γ(3) = 2', chk: () => 2 }),
    () => ({ q: '∫₋∞^∞ e^(−x²) dx' + EX, a: Math.sqrt(P), tol: 0.01, expl: 'Intégrale de Gauss : √π', chk: () => Math.sqrt(P) }),
    () => ({ q: '∫₀^∞ 1/(1 + x²) dx' + EX, a: P / 2, tol: 0.01, expl: '[arctan]', chk: () => P / 2 }),
    () => ({ q: '∫₀^1 1/√x dx', a: 2, tol: 1e-4, expl: '[2√x]', chk: () => 2 }),
    () => ({ q: `∫₀^∞ x^${k} e^(−x) dx`, a: fact(k), tol: 1e-4, expl: `Γ(${k + 1}) = ${k}!`, chk: () => fact(k) }),
    () => ({ q: '∫₀^∞ x e^(−x²) dx', a: 0.5, tol: 1e-4, expl: '[−e^(−x²)/2]', chk: () => 0.5 }),
  ]); return o(); }),
  G('i_multi', 'Intégration', 4, (r) => { const a = r.int(1, 3), b = r.int(1, 3); const w = r.int(0, 3); if (w === 0) return { q: `∬ x y dx dy sur [0,${a}] × [0,${b}]`, a: (a * a * b * b) / 4, tol: 1e-6, expl: '(a²/2)(b²/2)', chk: () => (a * a * b * b) / 4 };
    if (w === 1) return { q: `∬ (x + y)² dx dy sur [0,1] × [0,1]` + EX, a: 7 / 6, tol: 0.01, expl: '1/3 + 2·1/4 + 1/3', chk: () => 7 / 6 };
    if (w === 2) return { q: `∬ (x² + y²) dx dy sur le disque de rayon ${a}` + EX, a: (P * a ** 4) / 2, tol: 0.01, expl: 'polaires : ∫r³ dr dθ = π a⁴/2', chk: () => (P * a ** 4) / 2 };
    return { q: `Aire du domaine 0 ≤ r ≤ 1 + cos θ (cardioïde)` + EX, a: (3 * P) / 2, tol: 0.01, expl: '½∫(1+cosθ)²dθ = 3π/2', chk: () => (3 * P) / 2 }; }),
  G('i_vol', 'Intégration', 5, (r) => { const R = r.int(1, 3); const w = r.int(0, 2); if (w === 0) return { q: `Volume d’une sphère de rayon ${R}` + EX, a: (4 / 3) * P * R ** 3, tol: 0.01, expl: '4πR³/3', chk: () => (4 / 3) * P * R ** 3 };
    if (w === 1) return { q: `Volume du solide de révolution de y = x² (0 ≤ x ≤ ${R}) autour de Ox` + EX, a: (P * R ** 5) / 5, tol: 0.01, expl: 'π∫x⁴dx', chk: () => (P * R ** 5) / 5 };
    return { q: `Longueur de la courbe y = x^(3/2) pour 0 ≤ x ≤ 1` + EX, a: (13 * Math.sqrt(13) - 8) / 27, tol: 0.01, expl: '∫√(1 + 9x/4) dx', chk: () => { const n = 20000, h = 1 / n, f = (x) => Math.sqrt(1 + 2.25 * x); let s = f(0) + f(1); for (let i = 1; i < n; i++) s += f(i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; } }; }),

  // ===== Limites & DL
  G('l_basic', 'Limites / DL', 2, (r) => { const k = r.int(2, 5); const o = r.pick([
    () => ({ q: `lim(x→0) sin(${k}x)/x`, a: k, f: (x) => Math.sin(k * x) / x, x0: 1e-5 }),
    () => ({ q: `lim(x→0) (e^(${k}x) − 1)/x`, a: k, f: (x) => (Math.exp(k * x) - 1) / x, x0: 1e-6 }),
    () => ({ q: `lim(x→0) ln(1 + ${k}x)/x`, a: k, f: (x) => Math.log(1 + k * x) / x, x0: 1e-6 }),
    () => ({ q: `lim(x→0) tan(${k}x)/x`, a: k, f: (x) => Math.tan(k * x) / x, x0: 1e-6 }),
    () => ({ q: `lim(x→1) (x^${k} − 1)/(x − 1)`, a: k, f: (x) => (x ** k - 1) / (x - 1), x0: 1 + 1e-6 }),
    () => ({ q: `lim(x→∞) (${k}x² + 3x)/(x² + 1)`, a: k, f: (x) => (k * x * x + 3 * x) / (x * x + 1), x0: 1e7 }),
  ])(); return { q: o.q + '\n(valeur ou ∞ / −∞)', a: o.a, tol: 1e-6, expl: 'Équivalents usuels.', chk: () => o.f(o.x0) }; }),
  G('l_dl', 'Limites / DL', 3, (r) => { const o = r.pick([
    { q: 'lim(x→0) (1 − cos x)/x²', a: 0.5, f: (x) => (1 - Math.cos(x)) / (x * x), x0: 1e-3 },
    { q: 'lim(x→0) (√(1+x) − 1)/x', a: 0.5, f: (x) => (Math.sqrt(1 + x) - 1) / x, x0: 1e-8 },
    { q: 'lim(x→0) (x − sin x)/x³', a: 1 / 6, f: (x) => (x - Math.sin(x)) / x ** 3, x0: 1e-2 },
    { q: 'lim(x→0) (tan x − sin x)/x³', a: 0.5, f: (x) => (Math.tan(x) - Math.sin(x)) / x ** 3, x0: 1e-2 },
    { q: 'lim(x→0) (e^x − 1 − x)/x²', a: 0.5, f: (x) => (Math.exp(x) - 1 - x) / (x * x), x0: 1e-3 },
    { q: 'lim(x→0) (ln(1+x) − x)/x²', a: -0.5, f: (x) => (Math.log(1 + x) - x) / (x * x), x0: 1e-4 },
    { q: 'lim(x→0) (cos x − 1 + x²/2)/x⁴', a: 1 / 24, f: (x) => (Math.cos(x) - 1 + x * x / 2) / x ** 4, x0: 5e-2 },
  ]); return { q: o.q + EX, a: o.a, tol: 0.01, expl: 'Développements limités.', chk: () => o.f(o.x0) }; }),
  G('l_exp', 'Limites / DL', 4, (r) => { const k = r.int(1, 4); const o = r.pick([
    { q: `lim(x→∞) (1 + ${k}/x)^x` + EX, a: Math.exp(k), f: (x) => (1 + k / x) ** x, x0: 1e8, ex: `e^${k}` },
    { q: `lim(x→0) (1 + ${k}x)^(1/x)` + EX, a: Math.exp(k), f: (x) => (1 + k * x) ** (1 / x), x0: 1e-8, ex: `e^${k}` },
    { q: 'lim(x→0) (cos x)^(1/x²)' + EX, a: Math.exp(-0.5), f: (x) => Math.cos(x) ** (1 / (x * x)), x0: 1e-3, ex: 'e^(−1/2)' },
    { q: 'lim(x→0⁺) x ln(x)', a: 0, f: (x) => x * Math.log(x), x0: 1e-12, ex: 'croissances comparées' },
    { q: 'lim(x→∞) x sin(1/x)', a: 1, f: (x) => x * Math.sin(1 / x), x0: 1e6, ex: 'sin u ~ u' },
    { q: 'lim(n→∞) n^(1/n)', a: 1, f: (n) => n ** (1 / n), x0: 1e9, ex: 'exp(ln n / n)' },
    { q: 'lim(x→0) (sin x / x)^(1/x²)' + EX, a: Math.exp(-1 / 6), f: (x) => (Math.sin(x) / x) ** (1 / (x * x)), x0: 1e-2, ex: 'e^(−1/6)' },
  ]); return { q: o.q, a: o.a, tol: o.a === 0 ? 1e-9 : 0.01, abs: 1e-6, expl: o.ex, chk: () => o.f(o.x0) }; }),
  G('l_taylor', 'Limites / DL', 3, (r) => { const o = r.pick([
    { q: 'Coefficient de x³ dans le DL de sin(x) en 0', a: -1 / 6 },
    { q: 'Coefficient de x⁴ dans le DL de cos(x) en 0', a: 1 / 24 },
    { q: 'Coefficient de x³ dans le DL de tan(x) en 0', a: 1 / 3 },
    { q: 'Coefficient de x³ dans le DL de e^x sin(x) en 0', a: 1 / 3 },
    { q: 'Coefficient de x⁵ dans le DL de e^x en 0', a: 1 / 120 },
    { q: 'Coefficient de x³ dans le DL de ln(1 + x) en 0', a: 1 / 3 },
    { q: 'Coefficient de x² dans le DL de √(1 + x) en 0', a: -1 / 8 },
    { q: 'Coefficient de x² dans le DL de (1 + x)^(−1/2) en 0', a: 3 / 8 },
    { q: 'Coefficient de x³ dans le DL de arctan(x) en 0', a: -1 / 3 },
  ]); return { q: o.q + '\n(fraction ou décimal à 1 %)', a: o.a, tol: 0.01, expl: 'Formules de Taylor usuelles.' }; }),

  // ===== Matrices & algèbre linéaire
  G('m_det2', 'Matrices', 1, (r) => { const M = [[r.int(-5, 6), r.int(-5, 6)], [r.int(-5, 6), r.int(-5, 6)]]; return { q: `Déterminant de\n${mat('A', M)}`, a: det2(M), expl: 'ad − bc' }; }),
  G('m_tr2', 'Matrices', 2, (r) => { const M = [[r.int(-4, 5), r.int(-4, 5)], [r.int(-4, 5), r.int(-4, 5)]]; const M2 = mm(M, M); return { q: `Trace de A² pour\n${mat('A', M)}`, a: M2[0][0] + M2[1][1], expl: `A² = ${JSON.stringify(M2)}` }; }),
  G('m_prod', 'Matrices', 2, (r) => { const A = [[r.int(-3, 4), r.int(-3, 4)], [r.int(-3, 4), r.int(-3, 4)]], B = [[r.int(-3, 4), r.int(-3, 4)], [r.int(-3, 4), r.int(-3, 4)]]; const i = r.int(0, 1), j = r.int(0, 1); const C = mm(A, B); return { q: `${mat('A', A)}\n${mat('B', B)}\nCalculer l’élément (${i + 1},${j + 1}) de AB`, a: C[i][j], expl: `ligne ${i + 1} de A · colonne ${j + 1} de B` }; }),
  G('m_det3', 'Matrices', 3, (r) => { const M = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-3, 4))); return { q: `Déterminant de\n${mat('A', M)}`, a: det3(M), expl: 'Règle de Sarrus / développement' }; }),
  G('m_inv', 'Matrices', 2, (r) => { let M; do M = [[r.int(1, 5), r.int(-3, 4)], [r.int(-3, 4), r.int(1, 5)]]; while (det2(M) === 0); const d = det2(M); return { q: `${mat('A', M)}\nCalculer l’élément (1,1) de A⁻¹` + '\n(fraction ou décimal à 1 %)', a: M[1][1] / d, tol: 0.01, expl: `A⁻¹ = (1/${d}) [d −b ; −c a]` }; }),
  G('m_eig', 'Matrices', 3, (r) => { const l1 = r.int(-3, 5), l2 = r.int(-3, 5), k = r.int(0, 2), m = r.int(0, 2); const P = [[1, k], [m, 1 + k * m]], Pi = [[1 + k * m, -k], [-m, 1]]; const A = mm(mm(P, [[l1, 0], [0, l2]]), Pi); return { kind: 'list', q: `Valeurs propres de\n${mat('A', A)}\n(séparées par « ; »)`, a: [l1, l2], expl: `tr = ${l1 + l2}, det = ${l1 * l2}` }; }),
  G('m_sym', 'Matrices', 3, (r) => { const a = r.int(-3, 5), b = r.nz(-4, 4); return { kind: 'list', q: `Valeurs propres de\n${mat('A', [[a, b], [b, a]])}\n(séparées par « ; »)`, a: [a + b, a - b], expl: 'vecteurs propres (1,1) et (1,−1)' }; }),
  G('m_rank', 'Matrices', 3, (r) => { const R1 = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)], R2 = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)]; const c = r.int(0, 2); const R3 = c === 0 ? R1.map((v, i) => v + R2[i]) : c === 1 ? R1.map((v) => 2 * v) : [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)]; const M = [R1, R2, R3]; const d = det3(M); let rk; if (d !== 0) rk = 3; else { const mins = []; for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) for (let k = 0; k < 3; k++) for (let l = k + 1; l < 3; l++) mins.push(M[i][k] * M[j][l] - M[i][l] * M[j][k]); rk = mins.some((x) => x !== 0) ? 2 : M.flat().some((x) => x !== 0) ? 1 : 0; } return { q: `Rang de\n${mat('A', M)}`, a: rk, expl: d !== 0 ? 'det ≠ 0' : 'det = 0, cherche un mineur 2×2 non nul' }; }),
  G('m_dprop', 'Matrices', 3, (r) => { const n = r.int(2, 4), k = r.int(2, 3), d = r.nz(-3, 4); const w = r.int(0, 3); if (w === 0) return { q: `A est ${n}×${n} avec det A = ${d}. Calculer det(${k}A).`, a: k ** n * d, expl: `${k}^${n} · det A` }; const e = r.nz(-3, 3); if (w === 1) return { q: `det A = ${d}, det B = ${e}. Calculer det(A² B).`, a: d * d * e, expl: 'det multiplicatif' }; if (w === 2) return { q: `A est ${n}×${n}, det A = ${d}. Calculer det(A⁻¹ᵀ) · det A (valeur).`, a: 1, expl: 'det(A⁻ᵀ)=1/det A' }; return { q: `A est ${n}×${n}, det A = ${d}. Calculer det(−A) .`, a: (-1) ** n * d, expl: '(−1)ⁿ det A' }; }),
  G('m_vdm', 'Matrices', 4, (r) => { const a = r.int(0, 3), b = r.int(a + 1, a + 3), c = r.int(b + 1, b + 3); return { q: `Déterminant de la matrice de Vandermonde\n[1 ${a} ${a * a}]\n[1 ${b} ${b * b}]\n[1 ${c} ${c * c}]`, a: (b - a) * (c - a) * (c - b), expl: '(b−a)(c−a)(c−b)' }; }),
  G('m_func', 'Matrices', 5, (r) => { const l = [r.int(-2, 2), r.int(-2, 3), r.int(0, 3)]; const w = r.int(0, 2); const a = l.map((x) => x ** 3).reduce((s, x) => s + x, 0); if (w === 0) return { q: `A (3×3) a pour valeurs propres ${l.join(', ')}. Calculer tr(A³).`, a, expl: 'Σλ³' }; if (w === 1) return { q: `A (3×3) a pour valeurs propres ${l.join(', ')}. Calculer det(A² + I).`, a: l.map((x) => x * x + 1).reduce((s, x) => s * x, 1), expl: 'Π(λ²+1)' }; return { q: `A (2×2) a pour valeurs propres ${l[0]} et ${l[1]}. Calculer tr(exp(A))` + EX, a: Math.exp(l[0]) + Math.exp(l[1]), tol: 0.01, expl: 'Σ e^λ' }; }),
  G('v_vec', 'Vecteurs', 2, (r) => { const u = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)], v = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)]; const w = r.int(0, 2); if (w === 0) return { q: `u = (${u}) et v = (${v}). Produit scalaire u·v ?`, a: u[0] * v[0] + u[1] * v[1] + u[2] * v[2] }; const c = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; if (w === 1) return { q: `u = (${u}) et v = (${v}). Composante z de u × v ?`, a: c[2], expl: 'u_x v_y − u_y v_x' }; return { q: `u = (${u}) et v = (${v}). Norme² de u × v ?`, a: c[0] ** 2 + c[1] ** 2 + c[2] ** 2, expl: `u×v = (${c})` }; }),
  G('v_proj', 'Vecteurs', 3, (r) => { const u = [r.int(1, 4), r.int(-3, 4)], v = [r.int(1, 4), r.int(-3, 4)]; const d = u[0] * v[0] + u[1] * v[1]; return { q: `Projection orthogonale de u = (${u}) sur v = (${v}) : donner le coefficient λ tel que proj = λ v` + '\n(fraction ou décimal à 1 %)', a: d / (v[0] ** 2 + v[1] ** 2), tol: 0.01, expl: 'λ = u·v / ‖v‖²' }; }),

  // ===== Multivarié / analyse vectorielle
  G('mv_grad', 'Analyse multivariée', 3, (r) => { const a = r.int(1, 3), b = r.int(1, 3); const w = r.int(0, 2); if (w === 0) return { q: `f(x,y) = x²y + ${a}y³. Calculer ∂f/∂y en (1, 2).`, a: 1 + 3 * a * 4, expl: 'x² + 3a y²' }; if (w === 1) return { q: `f(x,y) = x²y + ${a}y³. Calculer ∂²f/∂x∂y en (3, 1).`, a: 6, expl: '∂/∂x (x² + 3ay²) = 2x' }; return { q: `f(x,y) = e^(x) sin(${b}y). Calculer ∂f/∂y en (0, 0).`, a: b, expl: `${b} e^x cos(${b}y)` }; }),
  G('mv_div', 'Analyse multivariée', 3, (r) => { const a = r.int(1, 3), p = [r.int(1, 3), r.int(1, 3), r.int(1, 3)]; const w = r.int(0, 3); if (w === 0) return { q: `Divergence de F = (x², ${a}y², z²) en (${p}).`, a: 2 * p[0] + 2 * a * p[1] + 2 * p[2], expl: '∂x + ∂y + ∂z' }; if (w === 1) return { q: `Composante z du rotationnel de F = (−${a}y, x, 0).`, a: 1 + a, expl: '∂x Fy − ∂y Fx' }; if (w === 2) return { q: 'Laplacien de f = x² + y² + z²', a: 6 }; return { q: `Norme du gradient de f = x² + ${a}y en (${p[0]}, ${p[1]}).`, a: Math.sqrt(4 * p[0] ** 2 + a * a), tol: 0.01, expl: '√(4x² + a²)' }; }),
  G('mv_crit', 'Analyse multivariée', 4, (r) => { const a = r.int(1, 4), b = r.int(1, 4); const w = r.int(0, 2); if (w === 0) return { q: `Minimum de f(x,y) = x² + y² − ${a}x − ${b}y`, a: -(a * a + b * b) / 4, tol: 0.01, expl: 'point critique (a/2, b/2)' }; if (w === 1) return { q: `Maximum de xy sous la contrainte x + y = ${2 * a}`, a: a * a, expl: 'x = y = a (Lagrange)' }; return { q: `Déterminant de la hessienne de f(x,y) = x³ + y³ − ${3 * a}xy en (${a}, ${a})`, a: 6 * a * 6 * a - (3 * a) ** 2, expl: 'f_xx f_yy − f_xy²' }; }),
  G('opt', 'Analyse multivariée', 2, (r) => { const a = r.int(1, 4); const w = r.int(0, 2); if (w === 0) return { q: `Minimum de x² − ${2 * a}x + ${a * a + r.int(1, 5)} sur ℝ ?`.replace(/\+ (\d+) sur/, '+ $1 sur'), a: null }; return null; }),

  // ===== Suites & séries
  G('s_geo', 'Suites / séries', 1, (r) => { const q = r.pick([2, 3]), n = r.int(3, 8); return { q: `1 + ${q} + ${q}² + … + ${q}^${n}`, a: (q ** (n + 1) - 1) / (q - 1), expl: '(q^(n+1) − 1)/(q − 1)' }; }),
  G('s_inf', 'Suites / séries', 2, (r) => { const o = r.pick([
    () => { const p = r.pick([2, 3, 4, 5]); return { q: `Σ_{k=0}^∞ (1/${p})^k` + '\n(fraction ou décimal à 1 %)', a: p / (p - 1), tol: 0.01 }; },
    () => ({ q: 'Σ_{k=1}^∞ 1/(k(k+1))', a: 1, tol: 1e-6, expl: 'télescopique : 1/k − 1/(k+1)' }),
    () => ({ q: 'Σ_{k=1}^∞ k/2^k', a: 2, tol: 1e-6, expl: 'x/(1−x)² en x = 1/2' }),
  ]); return o(); }),
  G('s_clas', 'Suites / séries', 4, (r) => { const o = r.pick([
    { q: 'Σ_{k=1}^∞ 1/k²' + EX, a: P * P / 6, ex: 'Bâle : π²/6' },
    { q: 'Σ_{k=1}^∞ (−1)^(k+1)/k' + EX, a: Math.log(2), ex: 'ln 2' },
    { q: 'Σ_{k=0}^∞ 1/k!' + EX, a: E, ex: 'e' },
    { q: 'Σ_{k=0}^∞ (−1)^k/(2k+1)' + EX, a: P / 4, ex: 'Leibniz : π/4' },
    { q: 'Σ_{k=0}^∞ 2^k/k!' + EX, a: Math.exp(2), ex: 'e²' },
    { q: 'Σ_{k=1}^∞ 1/(k² − 1/4)' , a: 2, ex: 'télescopique : 2' },
  ]); return { q: o.q, a: o.a, tol: o.ex === '2' ? 1e-6 : 0.01, expl: o.ex }; }),
  G('s_lim', 'Suites / séries', 2, (r) => { const a = r.pick([2, 3, 4, 5]), b = r.int(1, 9); const u0 = r.int(0, 9); return { q: `u₀ = ${u0}, u_(n+1) = u_n / ${a} + ${b}. Limite de (u_n) ?` + '\n(fraction ou décimal à 1 %)', a: b / (1 - 1 / a), tol: 0.01, expl: 'point fixe ℓ = ℓ/a + b' }; }),
  G('s_sum', 'Suites / séries', 3, (r) => { const n = r.int(5, 20); const w = r.int(0, 2); if (w === 0) return { q: `Σ_{k=1}^${n} k²`, a: (n * (n + 1) * (2 * n + 1)) / 6, expl: 'n(n+1)(2n+1)/6' }; if (w === 1) return { q: `Σ_{k=1}^${n} k³`, a: ((n * (n + 1)) / 2) ** 2 }; return { q: `Σ_{k=0}^${n} C(${n},k)`, a: 2 ** n, expl: '(1+1)ⁿ' }; }),
  G('s_rad', 'Suites / séries', 4, (r) => { const a = r.int(2, 5); const o = r.pick([[`Σ n² xⁿ / ${a}ⁿ`, a], [`Σ xⁿ / n!`, Infinity], [`Σ n! xⁿ`, 0], [`Σ (${a}x)ⁿ / n`, 1 / a], [`Σ xⁿ / (${a}ⁿ·n)`, a]]); return { q: `Rayon de convergence de ${o[0]} (∞ possible)`, a: o[1], tol: 1e-6, expl: 'critère de d’Alembert' }; }),
  G('s_gen', 'Suites / séries', 5, (r) => { const n = r.int(6, 12); const fib = [0, 1]; for (let i = 2; i <= n + 2; i++) fib.push(fib[i - 1] + fib[i - 2]); const w = r.int(0, 1); if (w === 0) return { q: `u₀ = 0, u₁ = 1, u_(k+2) = u_(k+1) + u_k. Calculer u_${n}`, a: fib[n], expl: 'Fibonacci' }; return { q: `Coefficient de x^${n} dans 1/(1 − x − x²)`, a: fib[n + 1], expl: 'série génératrice de Fibonacci : F_(n+1)' }; }),

  // ===== Nombres complexes
  G('c_mod', 'Complexes', 1, (r) => { const t = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25]]); const s = (x) => x * r.sign(); return { q: `|${t[0] * r.sign()} ${r.chance(0.5) ? '+' : '−'} ${t[1]}i|`, a: t[2], expl: 'triplet pythagoricien' }; }),
  G('c_pow', 'Complexes', 3, (r) => { const n = r.int(2, 8); const re = Math.round(2 ** (n / 2) * Math.cos((n * P) / 4)), im = Math.round(2 ** (n / 2) * Math.sin((n * P) / 4)); const part = r.chance(0.5); return { q: `${part ? 'Partie réelle' : 'Partie imaginaire'} de (1 + i)^${n}`, a: part ? re : im, expl: `1+i = √2 e^(iπ/4) → 2^(${n}/2) e^(i${n}π/4)` }; }),
  G('c_div', 'Complexes', 2, (r) => { const a = r.int(-4, 5), b = r.int(-4, 5), c = r.int(1, 4), d = r.int(-3, 3); const den = c * c + d * d; const re = (a * c + b * d), im = (b * c - a * d); const w = r.chance(0.5); return { q: `(${a} ${b < 0 ? '−' : '+'} ${Math.abs(b)}i)/(${c} ${d < 0 ? '−' : '+'} ${Math.abs(d)}i) : ${w ? 'partie réelle' : 'partie imaginaire'}` + '\n(fraction ou décimal à 1 %)', a: (w ? re : im) / den, tol: 0.01, abs: 0.005, expl: 'multiplier par le conjugué' }; }),
  G('c_arg', 'Complexes', 3, (r) => { const o = r.pick([['1 + i', P / 4, 'π/4'], ['−1 + i', (3 * P) / 4, '3π/4'], ['√3 + i', P / 6, 'π/6'], ['1 − i√3', -P / 3, '−π/3'], ['−i', -P / 2, '−π/2'], ['−2', P, 'π']]); return { q: `Argument principal (dans ]−π, π]) de ${o[0]}` + EX, a: o[1], tol: 0.01, expl: o[2] }; }),
  G('c_root', 'Complexes', 4, (r) => { const n = r.int(3, 9); const w = r.int(0, 2); if (w === 0) return { q: `Somme des racines ${n}-ièmes de l’unité`, a: 0, tol: 1e-9 }; if (w === 1) return { q: `Produit des racines ${n}-ièmes de l’unité`, a: n % 2 ? 1 : -1, tol: 1e-9, expl: '(−1)^(n+1)' }; return { q: `Nombre de z ∈ ℂ tels que z^${n} = ${r.int(2, 9)}`, a: n }; }),
  G('c_sol', 'Complexes', 4, (r) => { const a = r.int(1, 4); return { q: `z² + ${a * a} = 0 : donner |z|`, a, expl: 'z = ±ia' }; }),

  // ===== Équations différentielles
  G('e_rel', 'Équa. diff.', 2, (r) => { const a = r.int(1, 4), b = a * r.int(1, 5), y0 = r.int(-3, 6); return { q: `y′ + ${a}y = ${b}, y(0) = ${y0}. Limite de y(t) quand t → ∞ ?`, a: b / a, expl: 'régime permanent b/a' }; }),
  G('e_half', 'Équa. diff.', 3, (r) => { const a = r.int(1, 4), b = a * r.int(1, 5), y0 = r.int(-3, 6); return { q: `y′ + ${a}y = ${b}, y(0) = ${y0}. Calculer y(ln2/${a}).` + '\n(fraction ou décimal à 1 %)', a: b / a + (y0 - b / a) / 2, tol: 0.01, abs: 0.01, expl: 'y = b/a + (y₀ − b/a) e^(−at), e^(−ln 2) = 1/2' }; }),
  G('e_osc', 'Équa. diff.', 3, (r) => { const w = r.int(1, 4), y0 = r.int(-3, 3), v0 = r.int(1, 4) * w; const o = r.int(0, 2); if (o === 0) return { q: `y″ + ${w * w}y = 0, y(0) = ${y0}, y′(0) = ${v0}. Calculer y(π/${2 * w}).`, a: v0 / w, expl: 'y = y₀ cos ωt + (v₀/ω) sin ωt' }; if (o === 1) return { q: `y″ + ${w * w}y = 0. Période de la solution ?` + EX, a: (2 * P) / w, tol: 0.01, expl: '2π/ω' }; return { q: `y″ + ${w * w}y = 0, y(0) = ${y0}, y′(0) = ${v0}. Amplitude de y ?` + EX, a: Math.sqrt(y0 * y0 + (v0 / w) ** 2), tol: 0.01, expl: '√(y₀² + (v₀/ω)²)' }; }),
  G('e_char', 'Équa. diff.', 3, (r) => { const l1 = r.int(-4, 3), l2 = r.int(-4, 3); const b = -(l1 + l2), c = l1 * l2; return { kind: 'list', q: `y″ ${b < 0 ? '−' : '+'} ${Math.abs(b)}y′ ${c < 0 ? '−' : '+'} ${Math.abs(c)}y = 0 : racines de l’équation caractéristique (séparées par « ; »)`.replace(' + 0y′', ''), a: [l1, l2], expl: `r² ${sg(b)}r ${sg(c)} = 0` }; }),
  G('e_sep', 'Équa. diff.', 3, (r) => { const k = r.int(1, 4), y0 = r.int(1, 5); const w = r.int(0, 1); if (w === 0) return { q: `y′ = ${k}y, y(0) = ${y0}. Calculer y(ln2/${k}).`, a: 2 * y0, expl: 'y₀ e^(kt)' }; return { q: `y′ = y², y(0) = 1. Calculer y(1/2).`, a: 2, expl: '−1/y = t − 1 → y = 1/(1−t)' }; }),
  G('e_euler', 'Équa. diff.', 4, (r) => { const h = r.pick([0.5, 0.25]); const n = 2; let y = 1, x = 0; for (let i = 0; i < n; i++) { y += h * (x + y); x += h; } return { q: `Méthode d’Euler explicite : y′ = x + y, y(0) = 1, pas h = ${fmt(h)}. Calculer y(${fmt(2 * h)}) après 2 pas.`, a: y, tol: 0.005, expl: 'y_(k+1) = y_k + h f(x_k, y_k)' }; }),
  G('e_part', 'Équa. diff.', 5, (r) => { const a = r.int(1, 3); const w = r.int(0, 1); if (w === 0) return { q: `y″ + y = ${a}e^(2x) : solution particulière y_p = λe^(2x). Calculer λ.` + '\n(fraction ou décimal à 1 %)', a: a / 5, tol: 0.01, expl: '(4+1)λ = a' }; return { q: `y″ + 2y′ + y = 0, y(0) = 1, y′(0) = 0. Calculer y(1)` + EX, a: 2 / E, tol: 0.01, expl: 'y = (1+x)e^(−x)' }; }),

  // ===== Probabilités / dénombrement
  G('p_comb', 'Probas / dénombrement', 1, (r) => { const n = r.int(5, 12), k = r.int(2, 4); return { q: `C(${n}, ${k}) (k parmi n)`, a: comb(n, k) }; }),
  G('p_arr', 'Probas / dénombrement', 2, (r) => { const n = r.int(5, 9), k = r.int(2, 4); const w = r.int(0, 1); return w ? { q: `Nombre d’arrangements A(${n}, ${k})`, a: fact(n) / fact(n - k) } : { q: `Nombre d’anagrammes de « ${r.pick(['MAMAN', 'PAPA', 'BANANE', 'LOLO', 'ASSASSIN'])} »`, a: null }; }),
  G('p_bin', 'Probas / dénombrement', 2, (r) => { const n = r.int(3, 6), k = r.int(0, n); return { q: `X ~ B(${n}, 1/2). P(X = ${k}) (décimal à 1 %)`, a: comb(n, k) / 2 ** n, tol: 0.01, expl: `C(${n},${k})/2^${n}` }; }),
  G('p_exp', 'Probas / dénombrement', 2, (r) => { const o = r.pick([['Espérance de la somme de deux dés équilibrés', 7], ['Espérance du lancer d’un dé équilibré', 3.5], ['Nombre moyen de lancers d’une pièce pour obtenir pile', 2], ['Nombre moyen de lancers de dé pour obtenir un 6', 6], ['Variance du lancer d’un dé équilibré (fraction ou décimal)', 35 / 12], ['Espérance d’une loi binomiale B(30, 0,2)', 6], ['Variance de B(20, 0,5)', 5], ['Espérance du nombre de points fixes d’une permutation aléatoire', 1]]); return { q: o[0], a: o[1], tol: 0.01 }; }),
  G('p_bayes', 'Probas / dénombrement', 3, (r) => { const prev = r.pick([0.01, 0.02, 0.05]), se = r.pick([0.9, 0.95, 0.99]), fp = r.pick([0.05, 0.1]); const p = (prev * se) / (prev * se + (1 - prev) * fp); return { q: `Maladie de prévalence ${fmt(prev * 100)} %. Test positif à ${fmt(se * 100)} % si malade, faux positif ${fmt(fp * 100)} %. P(malade | test +) ? (décimal)`, a: p, tol: 0.03, expl: 'Bayes : P(+|M)P(M)/P(+)' }; }),
  G('p_norm', 'Probas / dénombrement', 3, (r) => { const o = r.pick([['P(|Z| < 1) pour Z ~ N(0,1)', 0.68], ['P(|Z| < 2) pour Z ~ N(0,1)', 0.95], ['P(Z > 2) pour Z ~ N(0,1)', 0.0228], ['P(Z > 1) pour Z ~ N(0,1)', 0.1587], ['P(Z < −1,65) pour Z ~ N(0,1)', 0.05]]); return { q: `${o[0]} (décimal à 5 %)`, a: o[1], tol: 0.06 }; }),
  G('p_coup', 'Probas / dénombrement', 4, (r) => { const n = r.int(3, 6); let h = 0; for (let i = 1; i <= n; i++) h += 1 / i; return { q: `Collectionneur de coupons : ${n} figurines équiprobables. Nombre moyen d’achats pour les avoir toutes ?` + '\n(décimal à 1 %)', a: n * h, tol: 0.01, expl: `n H_n = ${n}·(1+1/2+…+1/${n})` }; }),
  G('p_cond', 'Probas / dénombrement', 3, (r) => { const n = r.int(4, 9), k = r.int(2, 3); const b = r.int(2, n - 1); return { q: `Urne : ${b} boules rouges et ${n - b} bleues. On tire 2 boules sans remise. P(2 rouges) ? (fraction ou décimal à 1 %)`, a: (b * (b - 1)) / (n * (n - 1)), tol: 0.01, expl: `${frac(b * (b - 1), n * (n - 1))}` }; }),
  G('p_der', 'Probas / dénombrement', 5, (r) => { const n = r.int(4, 7); const D = [1, 0, 1, 2, 9, 44, 265, 1854]; return { q: `Nombre de permutations de ${n} éléments sans point fixe (dérangements)`, a: D[n], expl: 'D_n = n! Σ (−1)^k/k!' }; }),
].filter((g) => {
  // retire les générateurs d'ébauche non valides
  return !['opt'].includes(g.id);
}).map((g) => ({
  ...g,
  gen: (r) => {
    for (let i = 0; i < 20; i++) { const q = g.gen(r); if (q && q.a !== null && q.a !== undefined) return q; }
    return { q: '7 × 8', a: 56 };
  },
}));
