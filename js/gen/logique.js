import { fmt, mcqWhy, comb, fact } from '../rng.js';

const G = (id, sub, lvl, gen) => ({ id, sub, lvl, gen });
const N = (q, a, expl, extra = {}) => ({ q, a, expl, tol: 0, ...extra });

// ------------------------------------------------ Matrices de motifs (SVG)
const SHAPES = ['cercle', 'carré', 'triangle'];
const SHAPE_FR = { cercle: 'un cercle', 'carré': 'un carré', triangle: 'un triangle' };
const ROTS = [0, 45, 90];
function shapeSvg(shape, cx, cy, s, rot, fill) {
  const f = fill ? 'currentColor' : 'none';
  const tr = `transform="rotate(${rot} ${cx} ${cy})"`;
  if (shape === 'cercle') return `<circle cx="${cx}" cy="${cy}" r="${s}" fill="${f}" stroke="currentColor" stroke-width="2"/>${rot ? `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - s}" stroke="${fill ? 'var(--bg)' : 'currentColor'}" stroke-width="2" ${tr}/>` : ''}`;
  if (shape === 'carré') return `<rect x="${cx - s}" y="${cy - s}" width="${2 * s}" height="${2 * s}" fill="${f}" stroke="currentColor" stroke-width="2" ${tr}/>`;
  const p = [[cx, cy - s * 1.15], [cx + s * 1.0, cy + s * 0.75], [cx - s * 1.0, cy + s * 0.75]].map((q) => q.join(',')).join(' ');
  return `<polygon points="${p}" fill="${f}" stroke="currentColor" stroke-width="2" ${tr}/>`;
}
function cellSvg(a, ox = 0, oy = 0) {
  const s = a.n === 1 ? 14 : a.n === 2 ? 10 : 7.5;
  let g = '';
  for (let i = 0; i < a.n; i++) g += shapeSvg(a.shape, ox + 32 + (i - (a.n - 1) / 2) * (a.n === 3 ? 19 : 24), oy + 32, s, a.rot, a.fill);
  return g;
}
const wrap1 = (a) => `<svg viewBox="0 0 64 64" style="color:var(--tx)">${cellSvg(a)}<rect x="1" y="1" width="62" height="62" fill="none" stroke="#64748b66"/></svg>`;
function gridSvg(cells) {
  let g = '';
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const ox = j * 66, oy = i * 66;
    g += `<rect x="${ox + 1}" y="${oy + 1}" width="64" height="64" fill="none" stroke="#64748b88"/>`;
    if (i === 2 && j === 2) g += `<text x="${ox + 32}" y="${oy + 44}" text-anchor="middle" font-size="36" fill="currentColor">?</text>`;
    else g += cellSvg(cells[i][j], ox + 1, oy + 1);
  }
  return `<svg viewBox="0 0 198 198" width="240" style="color:var(--tx)">${g}</svg>`;
}
const PAT = {
  latin1: { f: (i, j) => (i + j) % 3, d: 'chaque ligne et chaque colonne contiennent une seule fois chacune des 3 valeurs (carré latin)' },
  latin2: { f: (i, j) => (i + 2 * j) % 3, d: 'chaque ligne et chaque colonne contiennent une seule fois chacune des 3 valeurs (décalage inverse)' },
  row: { f: (i) => i, d: 'la valeur est constante sur une ligne et change d’une ligne à l’autre' },
  col: { f: (i, j) => j, d: 'la valeur est constante sur une colonne et change d’une colonne à l’autre' },
};
const ATTR = {
  shape: { vals: [0, 1, 2], map: (v) => SHAPES[v], name: 'Forme', txt: (v) => SHAPE_FR[SHAPES[v]] },
  n: { vals: [0, 1, 2], map: (v) => v + 1, name: 'Nombre de figures', txt: (v) => `${v + 1} figure(s)` },
  rot: { vals: [0, 1, 2], map: (v) => ROTS[v], name: 'Rotation', txt: (v) => `rotation de ${ROTS[v]}°` },
  fill: { vals: [0, 1, 2], map: (v) => v !== 1, name: 'Remplissage', txt: (v) => (v !== 1 ? 'plein' : 'vide') },
};
function patternQuestion(r, nVar) {
  const attrs = r.shuffle(Object.keys(ATTR));
  const varying = attrs.slice(0, nVar);
  const pats = {};
  const pkeys = r.shuffle(Object.keys(PAT));
  varying.forEach((a, k) => { pats[a] = pkeys[k % pkeys.length]; });
  const base = { shape: 0, n: 0, rot: 0, fill: 0 };
  const cons = {}; Object.keys(ATTR).forEach((a) => { cons[a] = r.int(0, 2); });
  const val = (a, i, j) => (pats[a] ? PAT[pats[a]].f(i, j) : cons[a]);
  const cell = (i, j) => { const o = {}; Object.keys(ATTR).forEach((a) => { o[a] = ATTR[a].map(val(a, i, j)); }); return o; };
  const cells = [0, 1, 2].map((i) => [0, 1, 2].map((j) => cell(i, j)));
  const ans = cells[2][2];
  const key = (c) => `${c.shape}|${c.n}|${c.rot}|${c.fill}`;
  const opts = [ans]; const seen = new Set([key(ans)]);
  let guard = 0;
  while (opts.length < 6 && guard++ < 100) {
    const c = { ...ans }; const a = r.pick(Object.keys(ATTR)); const vv = r.pick([0, 1, 2]);
    c[a] = ATTR[a].map(vv);
    if (r.chance(0.3)) { const a2 = r.pick(Object.keys(ATTR)); c[a2] = ATTR[a2].map(r.pick([0, 1, 2])); }
    if (!seen.has(key(c))) { seen.add(key(c)); opts.push(c); }
  }
  const sh = r.shuffle(opts);
  const rules = varying.map((a) => `• ${ATTR[a].name} : ${PAT[pats[a]].d}.`).join('\n');
  const consts = Object.keys(ATTR).filter((a) => !pats[a]).map((a) => `${ATTR[a].name} (${ATTR[a].txt(cons[a])})`).join(', ');
  const ci = (a) => ATTR[a].txt(val(a, 2, 2));
  return {
    kind: 'mcq', htmlChoices: true, q: 'Quelle figure complète la grille ?', svg: gridSvg(cells), choices: sh.map(wrap1), a: sh.findIndex((c) => key(c) === key(ans)),
    expl: `Règles de construction :\n${rules}\nConstant dans toute la grille : ${consts || 'rien'}.\nCase manquante (ligne 3, colonne 3) : ${varying.map(ci).join(', ')}${consts ? ', ' + consts : ''}. Les autres propositions changent au moins un de ces attributs.`,
  };
}

// ------------------------------------------------ utilitaires
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const nextPrime = (n) => { let m = n + 1; while (!isPrime(m)) m++; return m; };
const seq = (n, f) => Array.from({ length: n }, (_, i) => f(i));
const fmtSeq = (a) => a.join(' ; ') + ' ; ?';

// Chevaliers (disent toujours vrai) & valets (toujours faux)
function knights(r, nP) {
  const names = ['A', 'B', 'C'].slice(0, nP);
  for (let attempt = 0; attempt < 300; attempt++) {
    const stm = names.map((who) => {
      const o = r.pick(names.filter((x) => x !== who));
      const kind = r.int(0, nP === 3 ? 3 : 2);
      if (kind === 0) return { t: `« ${o} est un valet. »`, f: (s) => !s[o] };
      if (kind === 1) return { t: `« ${o} est un chevalier. »`, f: (s) => s[o] };
      if (kind === 2) return { t: `« ${o} et moi sommes de même nature. »`, f: (s) => s[o] === s[who] };
      return { t: '« Il y a au moins un valet parmi nous. »', f: (s) => names.some((x) => !s[x]) };
    });
    const sols = [];
    for (let m = 0; m < 2 ** nP; m++) {
      const s = {}; names.forEach((x, i) => { s[x] = !!((m >> i) & 1); });
      if (names.every((x, i) => stm[i].f(s) === s[x])) sols.push(s);
    }
    if (sols.length === 1) return { names, stm, sol: sols[0] };
  }
  return null;
}

const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const BASE_L = [
  // ================= Matrices de motifs (SVG)
  G('mot1', 'Matrices de motifs', 1, (r) => patternQuestion(r, 1)),
  G('mot2', 'Matrices de motifs', 2, (r) => patternQuestion(r, 2)),
  G('mot3', 'Matrices de motifs', 3, (r) => patternQuestion(r, 3)),
  G('mot4', 'Matrices de motifs', 4, (r) => patternQuestion(r, 3)),
  G('mot5', 'Matrices de motifs', 5, (r) => patternQuestion(r, 4)),

  // ================= Suites numériques
  G('s_arith', 'Suites numériques', 1, (r) => { const a = r.int(-5, 20), d = r.nz(-9, 12); const s = seq(6, (i) => a + i * d); return N(`Quel nombre suit ?\n${fmtSeq(s)}`, a + 6 * d, `Suite arithmétique : on ajoute ${d} à chaque pas (${s.slice(0, 3).join(' → ')} …). Suivant : ${s[5]} + ${d} = ${a + 6 * d}.`); }),
  G('s_geom', 'Suites numériques', 1, (r) => { const a = r.int(1, 5), q = r.pick([2, 3, -2, 4]); const s = seq(5, (i) => a * q ** i); return N(`Quel nombre suit ?\n${fmtSeq(s)}`, a * q ** 5, `Suite géométrique de raison ${q} : chaque terme est le précédent × ${q}. Suivant : ${s[4]} × ${q} = ${a * q ** 5}.`); }),
  G('s_sq', 'Suites numériques', 2, (r) => { const o = r.pick([['n²', (n) => n * n], ['n² + 1', (n) => n * n + 1], ['n³', (n) => n ** 3], ['n² − 1', (n) => n * n - 1], ['n(n+1)/2', (n) => (n * (n + 1)) / 2], ['2ⁿ', (n) => 2 ** n], ['n(n+1)', (n) => n * (n + 1)], ['n³ − n', (n) => n ** 3 - n]]); const k = r.int(1, 3); const s = seq(6, (i) => o[1](i + k)); return N(`Quel nombre suit ?\n${fmtSeq(s)}`, o[1](6 + k), `Terme général u_n = ${o[0]} (ici n = ${k}, ${k + 1}, …). Différences successives : ${s.slice(1).map((x, i) => x - s[i]).join(', ')}. Terme suivant, n = ${6 + k} : ${o[1](6 + k)}.`); }),
  G('s_fib', 'Suites numériques', 2, (r) => { const a = r.int(1, 4), b = r.int(1, 5); const s = [a, b]; for (let i = 2; i < 7; i++) s.push(s[i - 1] + s[i - 2]); return N(`Quel nombre suit ?\n${fmtSeq(s.slice(0, 6))}`, s[6], `Chaque terme est la somme des deux précédents (type Fibonacci) : ${s[4]} + ${s[5]} = ${s[6]}.`); }),
  G('s_prime', 'Suites numériques', 2, (r) => { let p = r.pick([2, 3, 5, 7, 11, 13]); const s = []; for (let i = 0; i < 6; i++) { s.push(p); p = nextPrime(p); } return N(`Quel nombre suit ?\n${fmtSeq(s)}`, p, `Ce sont des nombres premiers consécutifs. Après ${s[5]}, le prochain nombre premier est ${p} (les nombres entre sont divisibles par 2, 3, …).`); }),
  G('s_quad', 'Suites numériques', 3, (r) => { const a = r.int(1, 9), d1 = r.int(1, 5), d2 = r.pick([1, 2, 3]); const s = [a]; let d = d1; for (let i = 0; i < 6; i++) { s.push(s[i] + d); d += d2; } return N(`Quel nombre suit ?\n${fmtSeq(s.slice(0, 6))}`, s[6], `Différences : ${s.slice(1, 6).map((x, i) => x - s[i]).join(', ')} — elles augmentent de ${d2} à chaque pas (suite quadratique). Prochaine différence : ${s[6] - s[5]} → ${s[6]}.`); }),
  G('s_alt', 'Suites numériques', 3, (r) => { const p = r.int(2, 6), m = r.pick([2, 3]); let x = r.int(1, 5); const s = [x]; for (let i = 0; i < 7; i++) { x = i % 2 === 0 ? x + p : x * m; s.push(x); } return N(`Quel nombre suit ?\n${fmtSeq(s.slice(0, 7))}`, s[7], `Deux opérations alternent : +${p} puis ×${m}. Après ${s[6]} (obtenu par ${6 % 2 === 0 ? '+' : '×'}), l’opération suivante est ${6 % 2 === 0 ? `+${p}` : `×${m}`} : ${s[7]}.`); }),
  G('s_inter', 'Suites numériques', 3, (r) => { const a = r.int(1, 9), d = r.int(2, 6), b = r.int(20, 40), e = r.int(-5, -2); const s = []; for (let i = 0; i < 4; i++) { s.push(a + i * d); s.push(b + i * e); } return N(`Quel nombre suit ?\n${fmtSeq(s.slice(0, 7))}`, s[7], `Deux suites entrelacées : rangs impairs ${s.filter((_, i) => i % 2 === 0).slice(0, 4).join(', ')} (pas +${d}) et rangs pairs ${s.filter((_, i) => i % 2).slice(0, 3).join(', ')}, … (pas ${e}). Le terme manquant est de rang pair : ${s[7]}.`); }),
  G('s_digit', 'Suites numériques', 4, (r) => { let x = r.int(1, 9); const s = [x]; for (let i = 0; i < 6; i++) { x += String(x).split('').reduce((a, c) => a + +c, 0); s.push(x); } return N(`Quel nombre suit ?\n${fmtSeq(s.slice(0, 6))}`, s[6], `Chaque terme = précédent + somme de ses chiffres : ${s[5]} + ${String(s[5]).split('').join('+')} = ${s[6]}.`); }),
  G('s_rec', 'Suites numériques', 4, (r) => { const k = r.pick([2, 3]), c = r.pick([1, -1, 2]); let x = r.int(1, 3); const s = [x]; for (let i = 0; i < 6; i++) { x = k * x + c; s.push(x); } return N(`Quel nombre suit ?\n${fmtSeq(s.slice(0, 6))}`, s[6], `Relation de récurrence u_(n+1) = ${k}·u_n ${c < 0 ? '−' : '+'} ${Math.abs(c)} : ${k}×${s[5]} ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${s[6]}.`); }),
  G('s_fact', 'Suites numériques', 5, (r) => { const o = r.pick([['n!', (n) => fact(n)], ['n! + 1', (n) => fact(n) + 1], ['n! − 1', (n) => fact(n) - 1], ['2·n!', (n) => 2 * fact(n)], ['n! + n', (n) => fact(n) + n]]); const s = seq(6, (i) => o[1](i + 2)); return N(`Quel nombre suit ?\n${fmtSeq(s)}`, o[1](8), `Terme général u_n = ${o[0]} avec n = 2, 3, … Pour n = 8 : ${o[1](8)}.`); }),
  G('s_ana', 'Suites numériques', 2, (r) => { const f = r.pick([['carré', (x) => x * x], ['cube', (x) => x ** 3], ['double + 1', (x) => 2 * x + 1], ['triple − 2', (x) => 3 * x - 2], ['x² + x', (x) => x * x + x]]); const a = r.int(2, 5), b = r.int(6, 9); return N(`${a} : ${f[1](a)} :: ${b} : ?`, f[1](b), `La règle est « ${f[0]} » : ${a} → ${f[1](a)}. Donc ${b} → ${f[1](b)}.`); }),
  G('s_grid', 'Suites numériques', 3, (r) => { const rule = r.pick([['la 3ᵉ colonne est la somme des deux premières', (a, b) => a + b], ['la 3ᵉ colonne est le produit des deux premières', (a, b) => a * b], ['la 3ᵉ colonne est la différence (1ʳᵉ − 2ᵉ)', (a, b) => a - b]]); const rows = [0, 1, 2].map(() => { const a = r.int(2, 9), b = r.int(1, 8); return [a, b, rule[1](a, b)]; }); return N(`Trouve le nombre manquant :\n${rows[0].join('   ')}\n${rows[1].join('   ')}\n${rows[2][0]}   ${rows[2][1]}   ?`, rows[2][2], `Sur chaque ligne ${rule[0]} : ${rows[0][0]}, ${rows[0][1]} → ${rows[0][2]}. Donc ${rows[2][0]}, ${rows[2][1]} → ${rows[2][2]}.`); }),
  G('s_pascal', 'Suites numériques', 3, (r) => { const n = r.int(4, 8), k = r.int(1, n - 1); return N(`Dans le triangle de Pascal (ligne 0 = « 1 »), quel est le nombre de la ligne ${n}, en position ${k} (en partant de 0) ?`, comb(n, k), `Chaque nombre est la somme des deux au-dessus ; c’est le coefficient binomial C(${n},${k}) = ${n}!/(${k}!×${n - k}!) = ${comb(n, k)}.`); }),

  // ================= Séries de lettres (réponse texte)
  G('lettres', 'Lettres & mots', 2, (r) => { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; const step = r.pick([1, 2, 3, 4]); const st = r.int(0, 8); const s = seq(5, (i) => A[(st + i * step) % 26]); const nx = A[(st + 5 * step) % 26]; return { kind: 'text', q: `Quelle lettre suit ?\n${s.join(' ')} ?`, a: nx, expl: `Décalage constant de +${step} dans l’alphabet : ${s.map((c) => `${c}(${A.indexOf(c) + 1})`).join(', ')}. La suivante est ${nx}(${A.indexOf(nx) + 1}).` }; }),
  G('lettres2', 'Lettres & mots', 3, (r) => { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; const d1 = r.pick([1, 2]), d2 = r.pick([3, 4]); let p = r.int(0, 6); const s = [A[p]]; for (let i = 0; i < 6; i++) { p += i % 2 === 0 ? d1 : d2; s.push(A[p % 26]); } return { kind: 'text', q: `Quelle lettre suit ?\n${s.slice(0, 6).join(' ')} ?`, a: s[6], expl: `Les décalages alternent : +${d1}, +${d2}, +${d1}, +${d2}, +${d1}. Le suivant est +${d2} : ${s[6]}.` }; }),
  G('lettres3', 'Lettres & mots', 4, (r) => { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; const a = r.int(0, 5), b = r.int(14, 20), d = r.pick([1, 2]); const s = []; for (let i = 0; i < 4; i++) { s.push(A[a + i * d]); s.push(A[b - i * d]); } return { kind: 'text', q: `Quelle lettre suit ?\n${s.slice(0, 7).join(' ')} ?`, a: s[7], expl: `Deux séries entrelacées : une avance (${s.filter((_, i) => i % 2 === 0).join(' ')} : pas +${d}) et l’autre recule (${s.filter((_, i) => i % 2).slice(0, 3).join(' ')} … : pas −${d}). Le terme manquant est ${s[7]}.` }; }),
  G('anagr', 'Lettres & mots', 2, (r) => { const w = r.pick(['MARS', 'LUNE', 'ATOME', 'ENERGIE', 'FORCE', 'ONDES', 'MATRICE', 'LIMITE']); return N(`Combien de lettres comporte le mot « ${w} », et combien de lettres distinctes ? Donne le nombre de lettres distinctes.`, new Set(w.split('')).size, `Lettres de ${w} : ${w.split('').join(' ')} ; distinctes : ${[...new Set(w.split(''))].join(' ')} → ${new Set(w.split('')).size}.`); }),

  // ================= Déduction
  G('chev', 'Déduction', 3, (r) => { const p = knights(r, r.pick([2, 3])); if (!p) return N('Un chevalier dit toujours la vérité et un valet toujours un mensonge. Si A dit « je suis un valet », combien y a-t-il de chevaliers parmi A ? (0 ou 1)', 0, 'Si A était chevalier, il dirait vrai en s’accusant : contradiction. Si A est valet, sa phrase est fausse (il n’est pas valet) : contradiction aussi — l’énoncé est un paradoxe, donc A ne peut pas prononcer cette phrase. On répond 0 par convention.'); const k = p.names.filter((x) => p.sol[x]).length; const txt = p.names.map((x, i) => `${x} dit : ${p.stm[i].t}`).join('\n'); const sol = p.names.map((x) => `${x} = ${p.sol[x] ? 'chevalier' : 'valet'}`).join(', '); return N(`Île des chevaliers (disent toujours vrai) et des valets (mentent toujours).\n${txt}\nCombien y a-t-il de chevaliers ?`, k, `Seule configuration cohérente : ${sol}. Vérification : ${p.names.map((x, i) => `la phrase de ${x} est ${p.stm[i].f(p.sol) ? 'vraie' : 'fausse'}, ${x} étant ${p.sol[x] ? 'chevalier (doit dire vrai)' : 'valet (doit mentir)'} ✓`).join(' ; ')}.`); }),
  G('ordre', 'Déduction', 2, (r) => { const noms = r.shuffle(['Alice', 'Bruno', 'Chloé', 'David', 'Emma']).slice(0, r.pick([3, 4])); const rel = []; for (let i = 0; i < noms.length - 1; i++) rel.push(`${noms[i]} est plus grand(e) que ${noms[i + 1]}.`); const shown = r.shuffle(rel); const q = r.pick(['le plus petit', 'le plus grand', 'au milieu']); const ans = q === 'le plus petit' ? noms[noms.length - 1] : q === 'le plus grand' ? noms[0] : noms[Math.floor(noms.length / 2)]; if (q === 'au milieu' && noms.length === 4) return N('Dans « Alice > Bruno > Chloé > David », combien de personnes sont plus petites que Bruno ?', 2, 'Bruno est devant Chloé et David : 2 personnes sont plus petites.'); return mcqWhy(r, ans, noms.filter((x) => x !== ans).map((x) => [x, `l’ordre reconstitué est ${noms.join(' > ')} : ${x} n’est pas ${q}.`]), `Ordre reconstitué à partir des comparaisons : ${noms.join(' > ')}. Donc ${q} : ${ans}.`, ) && { ...mcqWhy(r, ans, noms.filter((x) => x !== ans).map((x) => [x, `l’ordre reconstitué est ${noms.join(' > ')} : ${x} n’est pas ${q}.`]), `Ordre reconstitué à partir des comparaisons : ${noms.join(' > ')}. Donc ${q} : ${ans}.`), q: `${shown.join(' ')}\nQui est ${q} ?` }; }),
  G('syllo', 'Déduction', 3, (r) => { const o = r.pick([
    ['Tous les chats sont des mammifères. Tous les mammifères sont des animaux.', 'Tous les chats sont des animaux', [['Tous les animaux sont des chats', 'c’est la réciproque : non déduite (il existe des animaux qui ne sont pas des chats).'], ['Aucun chat n’est un animal', 'c’est le contraire de la conclusion valide.']], 'Transitivité de l’inclusion : chats ⊂ mammifères ⊂ animaux.'],
    ['Aucun poisson n’est un mammifère. Tous les dauphins sont des mammifères.', 'Aucun dauphin n’est un poisson', [['Certains dauphins sont des poissons', 'les dauphins sont dans les mammifères, disjoints des poissons.'], ['Tous les mammifères sont des dauphins', 'on sait seulement que tous les dauphins sont des mammifères, pas l’inverse.']], 'Dauphins ⊂ mammifères, mammifères ∩ poissons = ∅ → dauphins ∩ poissons = ∅.'],
    ['Si il pleut, la route est mouillée. La route est mouillée.', 'On ne peut pas conclure qu’il pleut', [['Il pleut', 'erreur « d’affirmation du conséquent » : la route peut être mouillée pour une autre raison (arrosage…).'], ['Il ne pleut pas', 'rien ne l’établit non plus.']], 'P ⇒ Q et Q vrai n’implique pas P. (Seul « non Q ⇒ non P », la contraposée, est valide.)'],
    ['Si il pleut, la route est mouillée. La route n’est pas mouillée.', 'Il ne pleut pas', [['Il pleut', 'si il pleuvait, la route serait mouillée : contradiction.'], ['On ne peut rien conclure', 'la contraposée (non Q ⇒ non P) permet de conclure.']], 'Contraposée : P ⇒ Q équivaut à non Q ⇒ non P.'],
    ['Certains étudiants sont sportifs. Tous les sportifs sont en bonne santé.', 'Certains étudiants sont en bonne santé', [['Tous les étudiants sont en bonne santé', 'seuls certains étudiants sont sportifs : on ne peut pas généraliser.'], ['Aucun étudiant n’est en bonne santé', 'les étudiants sportifs le sont par hypothèse.']], 'Les étudiants sportifs sont en bonne santé, et il en existe au moins un.'],
  ]); return { ...mcqWhy(r, o[1], o[2], o[3]), q: `${o[0]}\nQuelle conclusion est valide ?` }; }),
  G('bool', 'Déduction', 2, (r) => { const a = r.chance(0.5), b = r.chance(0.5), c = r.chance(0.5); const e = r.pick([['(A ET B) OU C', (A, B, C) => (A && B) || C], ['A ET (B OU C)', (A, B, C) => A && (B || C)], ['NON(A) OU (B ET C)', (A, B, C) => !A || (B && C)], ['(A OU B) ET NON(C)', (A, B, C) => (A || B) && !C], ['A XOR B', (A, B, C) => A !== B], ['NON(A ET B)', (A, B, C) => !(A && B)]]); const v = (x) => (x ? 'VRAI' : 'FAUX'); const res = e[1](a, b, c); return N(`A = ${v(a)}, B = ${v(b)}, C = ${v(c)}.\nValeur de « ${e[0]} » ? (1 = VRAI, 0 = FAUX)`, res ? 1 : 0, `On remplace : ${e[0].replace('A', v(a)).replace('B', v(b)).replace('C', v(c))} → ${v(res)}.`); }),
  G('truth', 'Déduction', 4, (r) => { const e = r.pick([['(A OU B) ET (NON(A) OU C)', (A, B, C) => (A || B) && (!A || C)], ['A XOR B XOR C', (A, B, C) => A !== B !== C], ['(A ET B) OU (NON(A) ET C)', (A, B, C) => (A && B) || (!A && C)], ['NON(A OU B) OU C', (A, B, C) => !(A || B) || C]]); let n = 0; const rows = []; for (let m = 0; m < 8; m++) { const A = !!(m & 4), B = !!(m & 2), C = !!(m & 1); const v = e[1](A, B, C); if (v) n++; rows.push(`${+A}${+B}${+C}→${+v}`); } return N(`Pour combien de triplets (A, B, C) ∈ {0,1}³ l’expression « ${e[0]} » est-elle vraie ?`, n, `Table de vérité (ABC→résultat) : ${rows.join(' ; ')}. Nombre de 1 : ${n}.`); }),
  G('cal', 'Déduction', 2, (r) => { const d0 = r.int(0, 6), j = r.int(8, 28); const a = DAYS[d0], ans = DAYS[(d0 + j - 1) % 7]; return mcqWhy(r, ans, DAYS.filter((x) => x !== ans).slice(0, 4).map((x) => [x, `le ${j} est ${j - 1} jours après le 1ᵉʳ ; ${j - 1} mod 7 = ${(j - 1) % 7} ; on décale de ${(j - 1) % 7} jour(s) à partir de ${a}, ce qui donne ${ans}.`]), `Du 1ᵉʳ au ${j} il y a ${j - 1} jours ; ${j - 1} = 7×${Math.floor((j - 1) / 7)} + ${(j - 1) % 7}. On décale donc de ${(j - 1) % 7} jour(s) après ${a} : ${ans}.`) && { ...mcqWhy(r, ans, DAYS.filter((x) => x !== ans).slice(0, 4).map((x) => [x, `le ${j} est ${j - 1} jours après le 1ᵉʳ ; ${j - 1} mod 7 = ${(j - 1) % 7} : on décale de ${(j - 1) % 7} jour(s) à partir de ${a}, ce qui donne ${ans}.`]), `Du 1ᵉʳ au ${j} il y a ${j - 1} jours ; ${j - 1} = 7×${Math.floor((j - 1) / 7)} + ${(j - 1) % 7}. On décale donc de ${(j - 1) % 7} jour(s) après ${a} : ${ans}.`), q: `Le 1ᵉʳ du mois est un ${a}. Quel jour est le ${j} du même mois ?` }; }),
  G('horloge', 'Déduction', 3, (r) => { const h = r.int(1, 11), m = r.pick([0, 10, 15, 20, 30, 40, 45, 50]); const ah = (h % 12) * 30 + m * 0.5, am = m * 6; let ang = Math.abs(ah - am); if (ang > 180) ang = 360 - ang; return N(`Quel angle (en degrés, ≤ 180°) forment les aiguilles d’une horloge à ${h} h ${String(m).padStart(2, '0')} ?`, ang, `Aiguille des heures : ${h}×30° + ${m}×0,5° = ${fmt(ah)}° ; aiguille des minutes : ${m}×6° = ${am}°. Écart = ${fmt(Math.abs(ah - am))}° → angle = ${fmt(ang)}°.`, { tol: 0.005 }); }),
  G('age', 'Déduction', 3, (r) => { const s = r.int(5, 14), f = 2 * s + r.int(4, 25); const x = f - 2 * s; return N(`Aujourd’hui un père a ${f} ans et son fils ${s} ans. Dans combien d’années le père aura-t-il exactement le double de l’âge de son fils ?`, x, `On cherche x tel que ${f} + x = 2(${s} + x) → ${f} + x = ${2 * s} + 2x → x = ${f} − ${2 * s} = ${x}. Vérification : père ${f + x} ans, fils ${s + x} ans, ${f + x} = 2×${s + x} ✓.`); }),
  G('odd', 'Déduction', 2, (r) => { const o = r.pick([[[4, 9, 16, 25], 37, 'carrés parfaits'], [[2, 3, 5, 7], 9, 'nombres premiers'], [[8, 27, 64, 125], 100, 'cubes parfaits'], [[6, 28, 496, 8128], 100, 'nombres parfaits'], [[3, 6, 9, 12], 14, 'multiples de 3'], [[1, 3, 6, 10], 12, 'nombres triangulaires']]); const list = r.shuffle([...o[0], o[1]]); return { ...mcqWhy(r, String(o[1]), o[0].map((x) => [String(x), `${x} fait partie des ${o[2]}.`]), `${o[0].join(', ')} sont des ${o[2]} ; ${o[1]} n’en est pas un : c’est l’intrus.`), q: `Quel nombre est l’intrus ?\n${list.join(' ; ')}` }; }),

  // ================= Dénombrement & logique combinatoire
  G('hand', 'Combinatoire logique', 2, (r) => { const n = r.int(5, 20); return N(`${n} personnes se serrent toutes la main une fois. Combien de poignées de main ?`, (n * (n - 1)) / 2, `Chaque paire donne une poignée : C(${n},2) = ${n}×${n - 1}/2 = ${(n * (n - 1)) / 2}.`); }),
  G('hanoi', 'Combinatoire logique', 3, (r) => { const n = r.int(3, 10); return N(`Nombre minimal de déplacements pour résoudre la tour de Hanoï à ${n} disques ?`, 2 ** n - 1, `T(n) = 2T(n−1) + 1 avec T(1) = 1 → T(n) = 2ⁿ − 1 = 2^${n} − 1 = ${2 ** n - 1}.`); }),
  G('cube', 'Combinatoire logique', 3, (r) => { const n = r.int(3, 7); const w = r.int(0, 2); if (w === 0) return N(`Un cube ${n}×${n}×${n} est peint puis découpé en ${n ** 3} petits cubes. Combien ont exactement 2 faces peintes ?`, 12 * (n - 2), `Ce sont les cubes d’arête (hors coins) : 12 arêtes × (${n} − 2) = ${12 * (n - 2)}.`); if (w === 1) return N(`Un cube ${n}×${n}×${n} est peint sur toutes ses faces puis découpé en ${n ** 3} petits cubes. Combien ont exactement 1 face peinte ?`, 6 * (n - 2) ** 2, `Centres de faces : 6 faces × (${n} − 2)² = ${6 * (n - 2) ** 2}.`); return N(`Un cube ${n}×${n}×${n} est peint sur toutes ses faces puis découpé en ${n ** 3} petits cubes. Combien n’ont aucune face peinte ?`, (n - 2) ** 3, `Cube intérieur : (${n} − 2)³ = ${(n - 2) ** 3}.`); }),
  G('chemins', 'Combinatoire logique', 3, (r) => { const a = r.int(2, 6), b = r.int(2, 6); return N(`Dans une grille, combien de chemins plus courts relient le coin bas-gauche au coin haut-droit en avançant seulement d’une case vers la droite ou le haut, avec ${a} pas à droite et ${b} pas en haut ?`, comb(a + b, a), `Il faut choisir quelles positions de la suite de ${a + b} pas sont des pas « droite » : C(${a + b},${a}) = ${comb(a + b, a)}.`); }),
  G('lignes', 'Combinatoire logique', 4, (r) => { const n = r.int(3, 9); const w = r.int(0, 1); return w ? N(`Combien de régions du plan découpent ${n} droites en position générale (aucune parallèle, pas trois concourantes) ?`, 1 + (n * (n + 1)) / 2, `R(n) = R(n−1) + n (la n-ième droite coupe n régions) → R(n) = 1 + n(n+1)/2 = ${1 + (n * (n + 1)) / 2}.`) : N(`Combien de diagonales possède un polygone convexe à ${n + 3} côtés ?`, ((n + 3) * n) / 2, `Chaque sommet envoie n−3 diagonales : n(n−3)/2 avec n = ${n + 3} → ${((n + 3) * n) / 2}.`); }),
  G('pesee', 'Combinatoire logique', 4, (r) => { const n = r.pick([3, 9, 12, 20, 27, 30, 50, 81]); return N(`Parmi ${n} pièces dont une est plus légère, combien de pesées minimum sur une balance à deux plateaux pour la trouver à coup sûr ?`, Math.ceil(Math.log(n) / Math.log(3) - 1e-9), `Chaque pesée a 3 issues (gauche, droite, équilibre) : on peut distinguer 3^k cas avec k pesées. Il faut 3^k ≥ ${n} → k = ⌈log₃ ${n}⌉ = ${Math.ceil(Math.log(n) / Math.log(3) - 1e-9)}.`); }),
  G('chaussettes', 'Combinatoire logique', 3, (r) => { const c = r.int(2, 5), k = r.int(2, 3); return N(`Un tiroir contient des chaussettes de ${c} couleurs (beaucoup de chaque). Combien en faut-il prendre au minimum, sans regarder, pour être certain d’avoir ${k} chaussettes de la même couleur ?`, c * (k - 1) + 1, `Principe des tiroirs : au pire on a ${k - 1} de chaque couleur (${c}×${k - 1} = ${c * (k - 1)}), la suivante en donne ${k} d’une même couleur → ${c * (k - 1) + 1}.`); }),
  G('anag', 'Combinatoire logique', 4, (r) => { const w = r.pick([['MAMAN', 'M', 2, 'A', 2], ['BANANE', 'A', 2, 'N', 2], ['PAPA', 'P', 2, 'A', 2], ['LOLO', 'L', 2, 'O', 2], ['AAB', 'A', 2, 'B', 1], ['ABCD', 'A', 1, 'B', 1]]); const word = w[0]; const counts = {}; word.split('').forEach((c) => { counts[c] = (counts[c] || 0) + 1; }); let d = 1; Object.values(counts).forEach((v) => { d *= fact(v); }); return N(`Nombre d’anagrammes distincts (même sans sens) du mot « ${word} » ?`, fact(word.length) / d, `${word.length}! = ${fact(word.length)} permutations, divisées par ${Object.entries(counts).filter(([, v]) => v > 1).map(([c, v]) => `${v}! (lettre ${c} répétée)`).join(' × ') || '1'} → ${fact(word.length) / d}.`); }),

  // ================= Binaire & bases
  G('bin', 'Binaire & bases', 2, (r) => { const n = r.int(5, 60); const w = r.int(0, 1); const bits = n.toString(2); const terms = bits.split('').map((b, i, a) => `${b}×2^${a.length - 1 - i}`).join(' + '); return w ? N(`Convertis ${n} (décimal) en binaire, puis donne le nombre de « 1 » dans son écriture.`, bits.replace(/0/g, '').length, `On divise successivement par 2 en notant les restes (lus de bas en haut) : ${n} = ${bits}₂. Vérification : ${bits.split('').map((b, i, a) => (b === '1' ? 2 ** (a.length - 1 - i) : null)).filter((x) => x !== null).join(' + ')} = ${n}. Nombre de 1 : ${bits.replace(/0/g, '').length}.`) : N(`Quelle est la valeur décimale du nombre binaire ${bits} ?`, n, `Chaque chiffre est multiplié par la puissance de 2 correspondant à sa position (de droite à gauche : 2⁰, 2¹, 2², …) : ${terms} = ${bits.split('').map((b, i, a) => (b === '1' ? 2 ** (a.length - 1 - i) : 0)).join(' + ')} = ${n}.`); }),
  G('xor', 'Binaire & bases', 3, (r) => { const a = r.int(5, 60), b = r.int(5, 60); const w = r.int(0, 2); const f = [['XOR (⊕)', (x, y) => x ^ y], ['ET bit à bit (&)', (x, y) => x & y], ['OU bit à bit (|)', (x, y) => x | y]][w]; return N(`Calcule ${a} ${f[0]} ${b} (en décimal).`, f[1](a, b), `${a} = ${a.toString(2).padStart(6, '0')}₂ ; ${b} = ${b.toString(2).padStart(6, '0')}₂ ; ${f[0]} bit à bit → ${f[1](a, b).toString(2).padStart(6, '0')}₂ = ${f[1](a, b)}.`); }),
  G('hexa', 'Binaire & bases', 3, (r) => { const n = r.int(16, 255); return N(`Quelle est la valeur décimale du nombre hexadécimal ${n.toString(16).toUpperCase()} ?`, n, `${n.toString(16).toUpperCase()}₁₆ = ${n.toString(16).split('').map((c, i, a) => `${parseInt(c, 16)}×16^${a.length - 1 - i}`).join(' + ')} = ${n}.`); }),
];


// ------------------------------------------------ Bonne position des questions : réponse unique
// Prédictions du terme suivant par chaque famille de règles simples qui colle à tous les termes affichés.
function predictions(seq) {
  const out = [];
  const n = seq.length, last = seq[n - 1];
  // 1) polynôme de degré <= 3 : différences constantes
  let levels = [seq.slice()];
  for (let k = 1; k <= 3; k++) {
    const prev = levels[k - 1];
    levels.push(prev.slice(1).map((x, i) => x - prev[i]));
    const d = levels[k];
    if (d.length >= 2 && d.every((x) => x === d[0])) {
      let nxt = d[0];
      for (let j = k - 1; j >= 0; j--) nxt = levels[j][levels[j].length - 1] + nxt;
      out.push(nxt); break;
    }
  }
  // 2) géométrique
  if (seq.every((x) => x !== 0) && seq.slice(1).every((x, i) => x * seq[0] === seq[i] * seq[1])) { const v = (last * seq[1]) / seq[0]; if (Number.isInteger(v)) out.push(v); }
  // 3) récurrence affine u(n+1) = a·u(n) + b
  if (seq[1] !== seq[0]) { const a = (seq[2] - seq[1]) / (seq[1] - seq[0]); const b = seq[1] - a * seq[0]; if (seq.slice(1).every((x, i) => Math.abs(a * seq[i] + b - x) < 1e-9)) { const v = a * last + b; if (Math.abs(v - Math.round(v)) < 1e-9) out.push(Math.round(v)); } }
  // 4) récurrence linéaire d’ordre 2 : u(n+2) = a·u(n+1) + b·u(n)
  if (n >= 5) { const det = seq[1] * seq[1] - seq[0] * seq[2]; if (det !== 0) { const a = (seq[2] * seq[1] - seq[0] * seq[3]) / det, b = (seq[1] * seq[3] - seq[2] * seq[2]) / det; if (seq.slice(2).every((x, i) => Math.abs(a * seq[i + 1] + b * seq[i] - x) < 1e-9)) { const v = a * last + b * seq[n - 2]; if (Math.abs(v - Math.round(v)) < 1e-9) out.push(Math.round(v)); } } }
  // 5) deux suites arithmétiques entrelacées
  if (n >= 6) { const ev = seq.filter((_, i) => i % 2 === 0), od = seq.filter((_, i) => i % 2); const ar = (t) => t.length >= 3 && t.slice(1).every((x, i) => x - t[i] === t[1] - t[0]); if (ar(ev) && ar(od)) { const t = n % 2 === 0 ? ev : od; out.push(t[t.length - 1] + (t[1] - t[0])); } }
  // 6) opérations alternées (+p puis ×m, ou ×m puis +p)
  if (n >= 5) { for (const [addFirst] of [[true], [false]]) { const a0 = addFirst ? seq[1] - seq[0] : null; const p = addFirst ? seq[1] - seq[0] : seq[2] - seq[1]; const m = addFirst ? (seq[1] !== 0 ? seq[2] / seq[1] : NaN) : (seq[0] !== 0 ? seq[1] / seq[0] : NaN); if (!Number.isFinite(m) || !Number.isInteger(m)) continue; let ok = true; for (let i = 0; i < n - 1; i++) { const isAdd = addFirst ? i % 2 === 0 : i % 2 === 1; if ((isAdd ? seq[i] + p : seq[i] * m) !== seq[i + 1]) { ok = false; break; } } if (ok) { const i = n - 1; const isAdd = addFirst ? i % 2 === 0 : i % 2 === 1; out.push(isAdd ? last + p : last * m); } } }
  return out;
}
const HINTS = { s_digit: 'Indice : chaque terme se calcule à partir du précédent et de ses chiffres.', s_fact: 'Indice : la formule fait intervenir une factorielle (n!).', s_prime: 'Indice : pense aux nombres premiers.' };
const parseSeq = (q) => String(q).split('\n').slice(1).join(' ').replace('?', '').split(';').map((x) => x.trim()).filter(Boolean).map(Number);
const wellPosed = (g) => ({
  ...g,
  gen: (r) => {
    let last;
    for (let i = 0; i < 40; i++) {
      const q = g.gen(r); last = q;
      const seq = parseSeq(q.q);
      if (seq.length < 4 || seq.some(Number.isNaN)) return q;
      const preds = [...new Set(predictions(seq))];
      if (preds.length === 0) { // règle « exotique » : on donne un indice sur la famille
        if (HINTS[g.id]) { q.q += `\n${HINTS[g.id]}`; return q; }
        continue;
      }
      if (preds.length === 1 && preds[0] === q.a) return q;
    }
    return { q: 'Quel nombre suit ?\n2 ; 5 ; 8 ; 11 ; 14 ; ?', a: 17, tol: 0, expl: 'Suite arithmétique de raison 3 : 14 + 3 = 17.' };
  },
});
const OVR = {
  s_ana: (r) => { const rules = [['le carré', (x) => x * x, 'x²'], ['le double plus 1', (x) => 2 * x + 1, '2x + 1'], ['le triple moins 2', (x) => 3 * x - 2, '3x − 2'], ['x² + x', (x) => x * x + x, 'x² + x'], ['x² + 1', (x) => x * x + 1, 'x² + 1'], ['le nombre triangulaire x(x+1)/2', (x) => (x * (x + 1)) / 2, 'x(x+1)/2'], ['le quadruple moins 1', (x) => 4 * x - 1, '4x − 1'], ['x² − 1', (x) => x * x - 1, 'x² − 1']]; const f = r.pick(rules); const a = r.int(1, 4); const xs = [a, a + 1, a + 2, a + 3]; const b = a + 4 + r.int(0, 3); return N(`Trouve la règle puis complète :\n${xs.map((x) => `${x} → ${f[1](x)}`).join(' ; ')} ; ${b} → ?`, f[1](b), `Les quatre exemples suffisent à fixer la règle (une formule polynomiale de degré ≤ 2 est entièrement déterminée par 3 points ; le 4ᵉ la vérifie) : f(x) = ${f[2]}. Vérification : ${xs.map((x) => `f(${x}) = ${f[1](x)}`).join(', ')}. Donc f(${b}) = ${f[1](b)}.`); },
  s_grid: (r) => { const rules = [['la 3ᵉ colonne est la somme des deux premières', (a, b) => a + b], ['la 3ᵉ colonne est le produit des deux premières', (a, b) => a * b], ['la 3ᵉ colonne est la différence (1ʳᵉ − 2ᵉ)', (a, b) => a - b], ['la 3ᵉ colonne est la différence (2ᵉ − 1ʳᵉ)', (a, b) => b - a]]; for (let t = 0; t < 200; t++) { const k = r.int(0, 3); const rows = [0, 1, 2].map(() => { const a = r.int(2, 9), b = r.int(1, 8); return [a, b, rules[k][1](a, b)]; }); const others = rules.filter((_, i) => i !== k); const unique = others.every((o) => rows.some((row) => o[1](row[0], row[1]) !== row[2])); if (!unique || new Set(rows.map((x) => x.join())).size < 3) continue; return N(`Trouve le nombre manquant :\n${rows[0].join('   ')}\n${rows[1].join('   ')}\n${rows[2][0]}   ${rows[2][1]}   ?`, rows[2][2], `Sur chaque ligne ${rules[k][0]} : ${rows[0][0]}, ${rows[0][1]} → ${rows[0][2]} ; ${rows[1][0]}, ${rows[1][1]} → ${rows[1][2]}. Les trois autres règles (somme, produit, différences) ne marchent pas sur toutes les lignes, donc celle-ci est la seule. Ligne 3 : ${rows[2][0]}, ${rows[2][1]} → ${rows[2][2]}.`); } return N('Trouve le nombre manquant :\n2   3   5\n4   1   5\n6   2   ?', 8, 'La 3ᵉ colonne est la somme des deux premières : 6 + 2 = 8.'); },
  odd: (r) => { const fams = [['carrés parfaits', [4, 9, 16, 25, 36, 49, 64, 81], (x) => Number.isInteger(Math.sqrt(x))], ['nombres premiers', [2, 3, 5, 7, 11, 13, 17, 19, 23, 29], (x) => x > 1 && Array.from({ length: Math.max(0, Math.floor(Math.sqrt(x)) - 1) }, (_, i) => i + 2).every((d) => x % d)], ['cubes parfaits', [1, 8, 27, 64, 125], (x) => Number.isInteger(Math.round(Math.cbrt(x))) && Math.round(Math.cbrt(x)) ** 3 === x], ['multiples de 3', [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], (x) => x % 3 === 0], ['nombres triangulaires', [1, 3, 6, 10, 15, 21, 28, 36, 45], (x) => { const k = Math.round((Math.sqrt(8 * x + 1) - 1) / 2); return (k * (k + 1)) / 2 === x; }], ['puissances de 2', [2, 4, 8, 16, 32, 64, 128], (x) => x > 0 && (x & (x - 1)) === 0]]; for (let t = 0; t < 400; t++) { const F = r.pick(fams); const four = r.shuffle(F[1]).slice(0, 4); const intr = r.int(2, 80); if (F[2](intr) || four.includes(intr)) continue; const five = r.shuffle([...four, intr]); const counts = fams.map((f) => five.filter((x) => f[2](x)).length); const okF = counts[fams.indexOf(F)] === 4 && counts.every((c, i) => i === fams.indexOf(F) || c <= 3); if (!okF) continue; const names = fams.map((f) => f[0]).join(', '); return { ...mcqWhy(r, String(intr), four.map((x) => [String(x), `${x} fait partie des ${F[0]}, comme les trois autres.`]), `Quatre nombres (${four.sort((a, b) => a - b).join(', ')}) sont des ${F[0]} ; ${intr} n’en est pas un. Aucune autre famille de la liste ne contient quatre de ces cinq nombres : l’intrus est donc ${intr}.`), q: `Quatre de ces nombres appartiennent à la même famille parmi : ${names}.\n${five.join(' ; ')}\nLequel est l’intrus ?` }; } return N('Quel est le plus petit nombre premier ?', 2, '2 est le seul nombre premier pair et le plus petit.'); },
};
export default BASE_L.map((g) => { const h = OVR[g.id] ? { ...g, gen: OVR[g.id] } : g; return /^s_/.test(g.id) && !['s_ana', 's_grid', 's_pascal'].includes(g.id) ? wellPosed(h) : h; });
