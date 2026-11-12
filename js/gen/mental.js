import { fmt, sci, sup, frac, gcd } from '../rng.js';

const G = (id, sub, lvl, gen, o = {}) => ({ id, sub, lvl, gen, mental: true, ...o });
const FR = ' (fraction ou décimal à 1 %)';

export default [
  // ---- Addition / soustraction
  G('add2', 'Addition / soustraction', 1, (r) => { const a = r.int(11, 99), b = r.int(11, 99); return { q: `${a} + ${b}`, a: a + b, expl: `${a} + ${b} = ${a + b}` }; }),
  G('sub2', 'Addition / soustraction', 1, (r) => { const a = r.int(40, 99), b = r.int(11, a - 1); return { q: `${a} − ${b}`, a: a - b }; }),
  G('add3', 'Addition / soustraction', 2, (r) => { const a = r.int(100, 999), b = r.int(100, 999); return r.chance(0.5) ? { q: `${a} + ${b}`, a: a + b, expl: 'Additionne centaines, dizaines, unités séparément.' } : { q: `${a + b} − ${a}`, a: b }; }),
  G('add4', 'Addition / soustraction', 3, (r) => { const a = r.int(1000, 9999), b = r.int(1000, 9999), c = r.int(100, 999); return { q: `${a} + ${b} − ${c}`, a: a + b - c }; }),
  G('sum1n', 'Addition / soustraction', 3, (r) => { const n = r.int(10, 60); return { q: `1 + 2 + 3 + … + ${n}`, a: (n * (n + 1)) / 2, expl: 'n(n+1)/2' }; }),
  // ---- Multiplication
  G('table', 'Multiplication', 1, (r) => { const a = r.int(3, 12), b = r.int(3, 12); return { q: `${a} × ${b}`, a: a * b }; }),
  G('mul21', 'Multiplication', 2, (r) => { const a = r.int(12, 99), b = r.int(3, 9); return { q: `${a} × ${b}`, a: a * b, expl: `${Math.floor(a / 10) * 10}×${b} + ${a % 10}×${b}` }; }),
  G('mul11', 'Multiplication', 2, (r) => { const a = r.int(12, 99); return { q: `${a} × 11`, a: a * 11, expl: 'a×10 + a' }; }),
  G('mul25', 'Multiplication', 2, (r) => { const m = r.pick([25, 50, 125, 5, 15]); const a = r.int(4, 48) * (m === 125 ? 8 : 4); return { q: `${a} × ${m}`, a: a * m, expl: m === 25 ? '×100 puis ÷4' : m === 125 ? '×1000 puis ÷8' : m === 50 ? '×100 puis ÷2' : m === 5 ? '×10 puis ÷2' : '×10 + moitié' }; }),
  G('mul22', 'Multiplication', 3, (r) => { const a = r.int(12, 49), b = r.int(12, 49); return { q: `${a} × ${b}`, a: a * b, expl: `${a}×${Math.floor(b / 10) * 10} + ${a}×${b % 10}` }; }),
  G('mulnear100', 'Multiplication', 3, (r) => { const a = 100 - r.int(1, 9), b = 100 - r.int(1, 9); return { q: `${a} × ${b}`, a: a * b, expl: `(100−x)(100−y) = 100(100−x−y)+xy` }; }),
  G('mul32', 'Multiplication', 4, (r) => { const a = r.int(101, 399), b = r.int(12, 29); return { q: `${a} × ${b}`, a: a * b }; }),
  G('mulsq', 'Multiplication', 4, (r) => { const m = r.int(11, 49); return { q: `${m - 1} × ${m + 1}`, a: m * m - 1, expl: `(m−1)(m+1) = m²−1 avec m=${m}` }; }),
  // ---- Carrés, cubes
  G('sq', 'Carrés / cubes', 1, (r) => { const n = r.int(4, 15); return { q: `${n}²`, a: n * n }; }),
  G('sq2', 'Carrés / cubes', 2, (r) => { const n = r.int(16, 35); return { q: `${n}²`, a: n * n, expl: '(a+b)² = a²+2ab+b²' }; }),
  G('sq5', 'Carrés / cubes', 3, (r) => { const d = r.int(3, 19); return { q: `${d * 10 + 5}²`, a: (d * 10 + 5) ** 2, expl: `d×(d+1) puis « 25 » avec d=${d}` }; }),
  G('sq3', 'Carrés / cubes', 3, (r) => { const n = r.int(36, 99); return { q: `${n}²`, a: n * n }; }),
  G('cube', 'Carrés / cubes', 3, (r) => { const n = r.int(3, 15); return { q: `${n}³`, a: n ** 3 }; }),
  G('cube2', 'Carrés / cubes', 4, (r) => { const n = r.int(16, 25); return { q: `${n}³`, a: n ** 3 }; }),
  // ---- Division
  G('div1', 'Division', 1, (r) => { const b = r.int(3, 12), c = r.int(3, 12); return { q: `${b * c} ÷ ${b}`, a: c }; }),
  G('div2', 'Division', 2, (r) => { const b = r.int(3, 9), c = r.int(12, 99); return { q: `${b * c} ÷ ${b}`, a: c }; }),
  G('divdec', 'Division', 3, (r) => { const b = r.pick([4, 8, 16, 5, 20, 25, 40]), a = r.int(3, 99); return { q: `${a} ÷ ${b}`, a: a / b, expl: 'Décimal exact.' }; }),
  G('divrem', 'Division', 3, (r) => { const b = r.int(6, 19), a = r.int(100, 999); return { q: `Reste de la division de ${a} par ${b}`, a: a % b }; }),
  G('div3', 'Division', 4, (r) => { const b = r.int(12, 29), c = r.int(21, 99); return { q: `${b * c} ÷ ${b}`, a: c }; }),
  // ---- Pourcentages
  G('pct1', 'Pourcentages', 1, (r) => { const p = r.pick([10, 20, 25, 50, 5]), x = r.int(2, 40) * 20; return { q: `${p} % de ${x}`, a: (x * p) / 100 }; }),
  G('pct2', 'Pourcentages', 2, (r) => { const p = r.pick([15, 30, 35, 12, 8, 40, 60, 75]), x = r.int(2, 30) * 20; return { q: `${p} % de ${x}`, a: (x * p) / 100, expl: 'Décompose: 10 % + 5 %…' }; }),
  G('pctvar', 'Pourcentages', 3, (r) => { const a = r.pick([40, 50, 80, 120, 200, 250]), p = r.pick([10, 20, 25, 30, 50]); const up = r.chance(0.5); const b = up ? (a * (100 + p)) / 100 : (a * (100 - p)) / 100; return { q: `Un prix passe de ${a} à ${b}. Variation en % (signe inclus) ?`, a: up ? p : -p, expl: '(b−a)/a' }; }),
  G('pctsucc', 'Pourcentages', 3, (r) => { const p = r.pick([10, 20, 30, 50]), up = r.chance(0.5); const f = up ? (1 + p / 100) * (1 - p / 100) : (1 + p / 100) ** 2; return up ? { q: `+${p} % puis −${p} % : variation totale en % ?`, a: Math.round((f - 1) * 1000) / 10, expl: `1,${p}×0,${100 - p}…` } : { q: `Deux hausses successives de ${p} % : hausse totale en % ?`, a: Math.round((f - 1) * 1000) / 10, expl: `(1+${p / 100})²−1` }; }),
  G('pctinv', 'Pourcentages', 4, (r) => { const p = r.pick([20, 25, 50, 10]), x = r.int(3, 20) * 10; const prix = (x * (100 + p)) / 100; return { q: `Un prix TTC est ${prix} avec ${p} % de TVA. Prix HT ?`, a: x, tol: 1e-6 }; }),
  // ---- Fractions
  G('fradd', 'Fractions', 2, (r) => { const b = r.pick([2, 3, 4, 5, 6, 8]), d = r.pick([2, 3, 4, 5, 6, 8]), a = r.int(1, b - 1) || 1, c = r.int(1, d - 1) || 1; const n = a * d + c * b, m = b * d; return { q: `${a}/${b} + ${c}/${d}` + FR, a: n / m, tol: 0.01, expl: `= ${frac(n, m)}` }; }),
  G('frmul', 'Fractions', 2, (r) => { const a = r.int(1, 7), b = r.int(2, 9), c = r.int(1, 7), d = r.int(2, 9); return { q: `${a}/${b} × ${c}/${d}` + FR, a: (a * c) / (b * d), tol: 0.01, expl: `= ${frac(a * c, b * d)}` }; }),
  G('frdec', 'Fractions', 1, (r) => { const p = r.pick([[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 8], [3, 8], [5, 8], [1, 20], [7, 20], [1, 25]]); return { q: `${p[0]}/${p[1]} en décimal`, a: p[0] / p[1] }; }),
  G('frdec2', 'Fractions', 3, (r) => { const d = r.pick([3, 6, 7, 9, 11, 12]), n = r.int(1, d - 1); return { q: `${n}/${d} en décimal (2 chiffres après la virgule)`, a: n / d, tol: 0.006, abs: 0.006 }; }),
  // ---- Racines, puissances
  G('sqrt1', 'Racines / puissances', 1, (r) => { const n = r.int(3, 15); return { q: `√${n * n}`, a: n }; }),
  G('sqrt2', 'Racines / puissances', 3, (r) => { const n = r.int(3, 99); return { q: `√${n} (à 1 % près)`, a: Math.sqrt(n), tol: 0.01, expl: `Entre ${Math.floor(Math.sqrt(n))} et ${Math.floor(Math.sqrt(n)) + 1}.` }; }),
  G('cbrt', 'Racines / puissances', 3, (r) => { const n = r.int(2, 12); return { q: `∛${n ** 3}`, a: n }; }),
  G('pow2', 'Racines / puissances', 2, (r) => { const n = r.int(5, 16); return { q: `2${sup(n)}`, a: 2 ** n, expl: '2¹⁰ = 1024' }; }),
  G('pow3', 'Racines / puissances', 3, (r) => { const b = r.pick([3, 5, 6, 7]), n = r.int(2, b === 3 ? 7 : b === 5 ? 5 : 4); return { q: `${b}${sup(n)}`, a: b ** n }; }),
  G('pow10', 'Racines / puissances', 2, (r) => { const a = r.int(-4, 6), b = r.int(-4, 6); return { q: `10${sup(a)} × 10${sup(b)}  (écris 10^n ou la valeur)`, a: 10 ** (a + b), tol: 1e-6, expl: `exposants: ${a}+${b}` }; }),
  G('powfrac', 'Racines / puissances', 4, (r) => { const b = r.pick([4, 8, 9, 16, 25, 27, 32, 64, 100]); const opt = { 4: [[1, 2, 2], [3, 2, 8]], 8: [[1, 3, 2], [2, 3, 4]], 9: [[1, 2, 3], [3, 2, 27]], 16: [[1, 2, 4], [3, 4, 8], [1, 4, 2]], 25: [[1, 2, 5], [3, 2, 125]], 27: [[1, 3, 3], [2, 3, 9]], 32: [[1, 5, 2], [3, 5, 8]], 64: [[1, 2, 8], [1, 3, 4], [1, 6, 2], [2, 3, 16]], 100: [[1, 2, 10], [3, 2, 1000]] }[b]; const [p, q, v] = r.pick(opt); return { q: `${b}^(${p}/${q})`, a: v }; }),
  // ---- Algèbre rapide
  G('lin', 'Algèbre rapide', 1, (r) => { const x = r.int(2, 15), a = r.int(2, 9), b = r.int(1, 30); return { q: `${a}x + ${b} = ${a * x + b}. x = ?`, a: x }; }),
  G('lin2', 'Algèbre rapide', 3, (r) => { const x = r.int(-9, 12), a = r.int(2, 9), c = r.int(1, a - 1), b = r.int(-20, 20); return { q: `${a}x + ${b} = ${c}x + ${c * x + b - (a - c) * x + (a - c) * x}`.replace(/.*/, `${a}x + ${b} = ${c}x + ${a * x + b - c * x}. x = ?`), a: x }; }),
  G('idrem', 'Algèbre rapide', 3, (r) => { const a = r.int(3, 30), b = r.int(1, a - 1); return { q: `${a}² − ${b}²`, a: (a - b) * (a + b), expl: '(a−b)(a+b)' }; }),
  G('sumprod', 'Algèbre rapide', 3, (r) => { const x = r.int(1, 9), y = r.int(1, 9); return { q: `x + y = ${x + y} et xy = ${x * y}. Calculer x² + y²`, a: x * x + y * y, expl: '(x+y)² − 2xy' }; }),
  G('quad', 'Algèbre rapide', 4, (r) => { const x1 = r.int(-6, 8), x2 = r.int(-6, 8); const b = -(x1 + x2), c = x1 * x2; const poly = 'x²' + (b ? ` ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x` : '') + (c ? ` ${c < 0 ? '−' : '+'} ${Math.abs(c)}` : ''); return { kind: 'list', q: `Racines de ${poly} = 0 (séparées par « ; »)`, a: [x1, x2], expl: `Pour x² + bx + c = 0 : somme des racines = −b = ${-b} et produit = c = ${c}. Les nombres ${x1} et ${x2} conviennent (${x1}+${x2} = ${x1 + x2}, ${x1}×${x2} = ${x1 * x2}).` }; }),
  G('modn', 'Algèbre rapide', 4, (r) => { const b = r.pick([3, 7, 9, 13]), n = r.int(20, 120), m = r.pick([10, 4, 5]); const v = Number(((BigInt(b) ** BigInt(n)) % BigInt(m))); return { q: `${b}^${n} mod ${m}`, a: v, expl: 'Cherche la période des puissances.' }; }),
  // ---- Conversions / unités
  G('kmh', 'Conversions', 2, (r) => { const v = r.pick([18, 36, 54, 72, 90, 108, 126, 144]); return { q: `${v} km/h en m/s`, a: v / 3.6, expl: '÷3,6' }; }),
  G('ms', 'Conversions', 2, (r) => { const v = r.int(2, 40); return { q: `${v} m/s en km/h`, a: v * 3.6, tol: 1e-6, expl: '×3,6' }; }),
  G('time', 'Conversions', 2, (r) => { const m = r.int(100, 999); return { q: `${m} minutes en heures (décimal)`, a: m / 60, tol: 0.005 }; }),
  G('unit', 'Conversions', 3, (r) => { const o = r.pick([['L', 'm³', 1e-3], ['cm²', 'm²', 1e-4], ['mm³', 'L', 1e-6], ['km²', 'm²', 1e6], ['g/cm³', 'kg/m³', 1e3], ['bar', 'Pa', 1e5], ['MPa', 'kPa', 1e3], ['eV', 'J', 1.6e-19]]); const x = r.int(2, 9); return { q: `${x} ${o[0]} en ${o[1]}`, a: x * o[2], tol: 0.01, expl: `×${o[2]}` }; }),
  // ---- Logs, exp, approximations
  G('log10', 'Logarithmes / approx.', 3, (r) => { const k = r.pick([2, 3, 4, 5, 8]), n = r.int(1, 6); return { q: `log₁₀(${k}×10${sup(n)}) à 0,02 près (log 2 ≈ 0,301 ; log 3 ≈ 0,477)`, a: Math.log10(k) + n, tol: 0.01, abs: 0.02 }; }),
  G('ln', 'Logarithmes / approx.', 4, (r) => { const x = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 20, 50]); return { q: `ln(${x}) à 0,03 près (ln 2 ≈ 0,69 ; ln 10 ≈ 2,30)`, a: Math.log(x), tol: 0.01, abs: 0.03 }; }),
  G('exp', 'Logarithmes / approx.', 4, (r) => { const x = r.pick([0.1, 0.2, 0.5, 1, 2, 3]); return { q: `e^${fmt(x)} à 3 % près (e ≈ 2,718)`, a: Math.exp(x), tol: 0.03 }; }),
  G('pow2big', 'Logarithmes / approx.', 4, (r) => { const n = r.pick([20, 30, 32, 40, 50, 64]); return { q: `2${sup(n)} à 10 % près (2¹⁰≈10³)`, a: 2 ** n, tol: 0.1, expl: `2^${n} = ${sci(2 ** n, 3)}` }; }),
  G('rule72', 'Logarithmes / approx.', 3, (r) => { const p = r.pick([2, 3, 4, 6, 8, 9, 12]); return { q: `Années pour doubler un capital à ${p} %/an (approx. à 10 %)`, a: Math.log(2) / Math.log(1 + p / 100), tol: 0.1, expl: 'Règle de 72 : 72/taux' }; }),
  G('taylor', 'Logarithmes / approx.', 5, (r) => { const x = r.pick([0.01, 0.02, 0.05, 0.1]); const k = r.pick([['√(1+x)', (x) => Math.sqrt(1 + x)], ['1/(1+x)', (x) => 1 / (1 + x)], ['(1+x)^3', (x) => (1 + x) ** 3]]); return { q: `${k[0]} pour x = ${fmt(x)} (4 chiffres sig., approx. 0,2 %)`, a: k[1](x), tol: 0.002, expl: 'Développement limité au 1er ordre.' }; }),
  // ---- Ordre de grandeur & Fermi
  G('sciprod', 'Ordre de grandeur', 2, (r) => { const a = r.int(11, 99) / 10, b = r.int(11, 99) / 10, e1 = r.int(-6, 8), e2 = r.int(-6, 8); return { q: `(${fmt(a)}·10${sup(e1)}) × (${fmt(b)}·10${sup(e2)})`, a: a * b * 10 ** (e1 + e2), tol: 0.05, factor: 1.5, expl: 'Multiplie les mantisses, additionne les exposants.' }; }, { oomOnly: true }),
  G('scidiv', 'Ordre de grandeur', 3, (r) => { const a = r.int(11, 99) / 10, b = r.int(11, 99) / 10, e1 = r.int(-6, 8), e2 = r.int(-6, 8); return { q: `(${fmt(a)}·10${sup(e1)}) ÷ (${fmt(b)}·10${sup(e2)})`, a: (a / b) * 10 ** (e1 - e2), factor: 1.5 }; }, { oomOnly: true }),
  G('approx3', 'Ordre de grandeur', 2, (r) => { const a = r.int(111, 989), b = r.int(111, 989); return { q: `${a} × ${b}`, a: a * b, factor: 1.3, expl: 'Arrondis à 1–2 chiffres significatifs.' }; }, { oomOnly: true }),
  G('approxdiv', 'Ordre de grandeur', 3, (r) => { const a = r.int(1111, 9999) * 10, b = r.int(11, 99); return { q: `${a} ÷ ${b}`, a: a / b, factor: 1.3 }; }, { oomOnly: true }),
  G('fact', 'Ordre de grandeur', 3, (r) => { const f = r.pick([['Secondes dans une année', 3.15e7], ['Distance Terre–Soleil (m)', 1.5e11], ['Rayon de la Terre (m)', 6.4e6], ['Masse de la Terre (kg)', 6e24], ['Vitesse du son dans l’air (m/s)', 340], ['Population mondiale', 8e9], ['Nombre d’Avogadro', 6e23], ['Population de la France', 6.8e7], ['Distance Terre–Lune (m)', 3.8e8], ['Masse du Soleil (kg)', 2e30], ['Rayon d’un atome (m)', 1e-10], ['Rayon d’un noyau (m)', 1e-15], ['Longueur d’onde visible (m)', 5e-7], ['PIB mondial (US$)', 1e14], ['Énergie d’une mole de liaisons C–H (J)', 4e5], ['Chaleur massique de l’eau (J/kg/K)', 4200]]); return { q: `${f[0]} — ordre de grandeur ?`, a: f[1], factor: 3, expl: `≈ ${sci(f[1], 2)}` }; }, { oomOnly: true }),
  G('fermi', 'Ordre de grandeur', 4, (r) => { const f = r.pick([
    () => { const h = r.pick([3, 5, 8]); return { q: `Une ville de ${h} millions d’habitants boit 1,5 L d’eau/jour/pers. Volume par an en m³ ?`, a: h * 1e6 * 1.5 * 365 / 1000, expl: 'hab × 1,5 L × 365 / 1000' }; },
    () => { const m = r.pick([2, 5, 10]); return { q: `Une voiture parcourt ${m * 1000} km/an à 6 L/100 km. Litres consommés ?`, a: m * 1000 * 6 / 100 }; },
    () => { const p = r.pick([60, 70, 80]); return { q: `Un humain de ${p} kg consomme ≈ 2 500 kcal/jour (1 kcal = 4,2 kJ). Puissance moyenne en W ?`, a: 2500 * 4200 / 86400, expl: 'E/Δt' }; },
    () => { const n = r.pick([1e6, 1e7]); return { q: `${sci(n, 1)} personnes jettent chacune 0,5 kg de déchets/jour. Tonnes par an ?`, a: n * 0.5 * 365 / 1000 }; },
    () => ({ q: 'Battements de cœur en 80 ans (70 bpm) ?', a: 70 * 60 * 24 * 365 * 80, expl: '70 × 525 600 min/an × 80' }),
  ])(); return { ...f, factor: 1.6 }; }, { oomOnly: true }),
];
