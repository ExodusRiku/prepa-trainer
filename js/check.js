// Parseur d'expressions + correction des réponses
const FUNCS = {
  sqrt: Math.sqrt, racine: Math.sqrt, ln: Math.log, log: Math.log10, exp: Math.exp,
  sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan, abs: Math.abs, cbrt: Math.cbrt,
  sh: Math.sinh, ch: Math.cosh, th: Math.tanh,
};
const CONSTS = { pi: Math.PI, 'π': Math.PI, e: Math.E, inf: Infinity, infinity: Infinity, '∞': Infinity };
const SUPMAP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

function stripUnit(s) {
  const m = s.match(/^(.*?[0-9)π∞²³¹])\s*([a-zA-ZµΩ°%][a-zA-Z0-9µΩ°%·*.\/\-⁻¹²³ ()]*)$/);
  if (!m) return s;
  const suf = m[2].trim().toLowerCase();
  if (/^(sqrt|racine|ln|log|exp|sin|cos|tan|asin|acos|atan|arc|abs|cbrt|sh|ch|th|pi|e\b|inf)/.test(suf)) return s;
  if (/^e[0-9+\-]/.test(suf)) return s;
  return m[1];
}

function tokenize(src) {
  let s = src.replace(/\s+/g, ' ').trim()
    .replace(/[−–—]/g, '-').replace(/[×·∙⋅]/g, '*').replace(/÷/g, '/').replace(/,/g, '.')
    .replace(/\*\*/g, '^');
  s = stripUnit(s);
  // exposants unicode: ⁻¹ ² ³ …
  s = s.replace(/(⁻)?([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, neg, d) => {
    const n = d.split('').map((c) => SUPMAP[c]).join('');
    return neg ? `^(-${n})` : `^(${n})`;
  });
  const toks = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    let m;
    if ((m = /^(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i)))) {
      toks.push({ t: 'n', v: parseFloat(m[0]) }); i += m[0].length; continue;
    }
    if ('+-*/^()!%'.includes(c)) { toks.push({ t: c }); i++; continue; }
    if (c === '√') { toks.push({ t: 'f', v: 'sqrt' }); i++; continue; }
    if (c === 'π' || c === '∞') { toks.push({ t: 'n', v: CONSTS[c] }); i++; continue; }
    if ((m = /^[a-zA-Z]+/.exec(s.slice(i)))) {
      const w = m[0].toLowerCase();
      if (FUNCS[w]) toks.push({ t: 'f', v: w });
      else if (w in CONSTS) toks.push({ t: 'n', v: CONSTS[w] });
      else throw new Error('Symbole inconnu: ' + m[0]);
      i += m[0].length; continue;
    }
    throw new Error('Caractère inattendu: ' + c);
  }
  return toks;
}

export function parseExpr(src) {
  const toks = tokenize(String(src));
  let p = 0;
  const peek = () => toks[p];
  const eat = (t) => { if (toks[p] && toks[p].t === t) return toks[p++]; return null; };
  function expr() {
    let v = term();
    for (;;) {
      if (eat('+')) v += term(); else if (eat('-')) v -= term(); else break;
    }
    return v;
  }
  function startsAtom(t) { return t && (t.t === 'n' || t.t === 'f' || t.t === '('); }
  function term() {
    let v = unary();
    for (;;) {
      if (eat('*')) v *= unary();
      else if (eat('/')) v /= unary();
      else if (startsAtom(peek())) v *= unary();
      else break;
    }
    return v;
  }
  function unary() {
    if (eat('-')) return -unary();
    if (eat('+')) return unary();
    return power();
  }
  function power() {
    let b = postfix();
    if (eat('^')) { const e = unary(); b = Math.pow(b, e); }
    return b;
  }
  function postfix() {
    let v = atom();
    for (;;) {
      if (eat('!')) { let f = 1; for (let k = 2; k <= Math.round(v); k++) f *= k; v = f; }
      else if (eat('%')) v /= 100;
      else break;
    }
    return v;
  }
  function atom() {
    const t = toks[p];
    if (!t) throw new Error('Expression incomplète');
    if (t.t === 'n') { p++; return t.v; }
    if (t.t === 'f') {
      p++;
      let arg;
      if (peek() && peek().t === '(') { p++; arg = expr(); if (!eat(')')) throw new Error('Parenthèse manquante'); }
      else arg = power();
      return FUNCS[t.v](arg);
    }
    if (t.t === '(') { p++; const v = expr(); if (!eat(')')) throw new Error('Parenthèse manquante'); return v; }
    throw new Error('Expression invalide');
  }
  const v = expr();
  if (p < toks.length) throw new Error('Expression invalide');
  return v;
}

export function safeParse(s) {
  try { const v = parseExpr(s); return Number.isNaN(v) ? null : v; } catch (e) { return null; }
}

function numOk(user, ans, q, oomMode) {
  if (!isFinite(ans) || !isFinite(user)) return user === ans;
  if (q.factor || (oomMode && q.mental)) {
    if (ans === 0 || user === 0) return user === ans;
    if (Math.sign(user) !== Math.sign(ans)) return false;
    const f = q.factor || (q.lvl >= 3 ? 1.5 : 2);
    const ratio = Math.abs(user / ans);
    return ratio <= f && ratio >= 1 / f;
  }
  const rel = q.tol == null ? 1e-6 : q.tol;
  const abs = q.abs == null ? 1e-9 : q.abs;
  return Math.abs(user - ans) <= Math.max(abs, rel * Math.abs(ans));
}

// Analyse d'une réponse fausse: pistes sur la nature de l'erreur
export function diagnose(q, input, oomMode = false) {
  if (q.kind === 'mcq') {
    const i = Number(input);
    return q.why && q.why[i] ? q.why[i] : '';
  }
  if (q.kind === 'text') return `Tu as écrit « ${input} » ; la réponse attendue est « ${q.a} ».`;
  if (q.kind === 'list') return '';
  const u = safeParse(input), a = q.a;
  if (u === null || !isFinite(a) || !isFinite(u)) return '';
  const hints = [];
  const rel = a !== 0 ? Math.abs(u - a) / Math.abs(a) : Math.abs(u);
  if (a !== 0 && Math.abs(u + a) < 1e-9 * Math.abs(a) + 1e-12) hints.push('Erreur de signe : ta valeur est l’opposé de la bonne.');
  else if (a !== 0 && u !== 0 && Math.abs(Math.log10(Math.abs(u / a)) - Math.round(Math.log10(Math.abs(u / a)))) < 0.01 && Math.round(Math.log10(Math.abs(u / a))) !== 0) hints.push(`Erreur d’ordre de grandeur : tu es à un facteur 10^${Math.round(Math.log10(Math.abs(u / a)))} de la bonne valeur (puissance de 10, conversion d’unités ?).`);
  else if (a !== 0 && u !== 0 && Math.abs(Math.abs(u / a) - 2) < 0.02) hints.push('Tu as trouvé le double de la bonne valeur (facteur 2 oublié ou en trop ?).');
  else if (a !== 0 && u !== 0 && Math.abs(Math.abs(u / a) - 0.5) < 0.01) hints.push('Tu as trouvé la moitié de la bonne valeur (facteur 2 oublié ?).');
  else if (a !== 0 && u !== 0 && Math.abs(u * a - 1) < 1e-2 * Math.abs(u * a)) hints.push('Tu as peut-être trouvé l’inverse de la bonne valeur.');
  else if (rel < 0.05) hints.push(`Très proche (écart ${(rel * 100).toFixed(1)} %) : problème d’arrondi, ou tolérance dépassée (${q.tol ? q.tol * 100 : 0} %).`);
  else if (rel < 0.3) hints.push(`Écart de ${(rel * 100).toFixed(0)} % : probable erreur de calcul intermédiaire ou d’arrondi trop grossier.`);
  else hints.push(`Écart important (${(rel * 100).toFixed(0)} %) : revois la méthode.`);
  if (oomMode && q.mental) hints.push('En mode ordre de grandeur, ton résultat doit être à un facteur ≤ 2 de la valeur exacte.');
  return hints.join(' ');
}

// Retourne {ok, parsed, error}
export function grade(q, input, oomMode = false) {
  if (q.kind === 'mcq') return { ok: Number(input) === q.a, parsed: input };
  if (q.kind === 'text') {
    const norm = (x) => String(x).trim().toLowerCase().replace(/\s+/g, '').replace(/ō/g, 'ou').replace(/ū/g, 'uu').replace(/ā/g, 'aa').replace(/ī/g, 'ii').replace(/ē/g, 'ee');
    const ok = [q.a, ...(q.alts || [])].some((x) => norm(x) === norm(input));
    return { ok, parsed: input };
  }
  if (q.kind === 'list') {
    const parts = String(input).split(/[;\n]+/).map((x) => x.trim()).filter(Boolean);
    const ans = q.ordered ? q.a : q.a.slice().sort((a, b) => a - b);
    if (parts.length !== ans.length) return { ok: false, error: `Il faut ${ans.length} valeurs séparées par « ; »` };
    const vals = parts.map(safeParse);
    if (vals.some((v) => v === null)) return { ok: false, error: 'Expression illisible' };
    if (!q.ordered) vals.sort((a, b) => a - b);
    return { ok: vals.every((v, i) => numOk(v, ans[i], q, oomMode)), parsed: vals };
  }
  const v = safeParse(input);
  if (v === null) return { ok: false, error: 'Expression illisible' };
  return { ok: numOk(v, q.a, q, oomMode), parsed: v };
}
