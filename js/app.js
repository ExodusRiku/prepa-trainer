import { THEMES } from './gen/index.js';
import { Session } from './engine.js';
import { grade, diagnose } from './check.js';
import { fmt } from './rng.js';
import { buildKeypad } from './keypad.js';
import * as store from './storage.js';

const app = document.getElementById('app');
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const pct = (o) => (o && o.n ? Math.round((100 * o.ok) / o.n) : null);
let timerId = null;
const clearTimer = () => { if (timerId) { clearInterval(timerId); timerId = null; } };
let lastSetup = {};

// ---------- Accueil ----------
function home() {
  clearTimer();
  const byTheme = store.statsBy((h) => h.theme, Date.now() - 30 * 864e5);
  app.innerHTML = `
    <div class="top"><div><h1>Prépa Trainer</h1><div class="mut">Série : ${store.streak()} jour(s) · ${store.load().hist.length} questions faites</div></div><div class="sp"></div>
      <button class="ghost" id="bStats">📊</button><button class="ghost" id="bSet">⚙️</button></div>
    <div class="grid">${THEMES.map((t) => {
      const p = pct(byTheme[t.id]);
      return `<button class="tcard" style="--c:${t.color}" data-t="${t.id}"><span class="ic">${t.icon}</span><b>${t.name}</b><span class="mut">${t.desc}</span><span class="mut">${p == null ? 'Pas encore fait' : p + ' % (30 j)'}</span></button>`;
    }).join('')}</div>`;
  app.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => setup(b.dataset.t)));
  $('#bStats').onclick = stats; $('#bSet').onclick = settingsScreen;
}

// ---------- Réglages de session ----------
function setup(id) {
  clearTimer();
  const th = THEMES.find((t) => t.id === id);
  const prev = lastSetup[id] || { level: 0, n: 10, timed: false, oom: store.settings().oom, sub: '' };
  const subs = [...new Set(th.gens.map((g) => g.sub))];
  app.innerHTML = `
    <div class="top"><button class="ghost" id="back">←</button><h1>${th.icon} ${th.name}</h1></div>
    <div class="card"><b>Niveau</b><div class="chips" id="lv">
      <button data-v="0">Adaptatif (niv. ${store.adaptLevel(id)})</button>
      ${['1 Échauffement', '2 Standard', '3 Prépa', '4 Concours', '5 Expert'].map((l, i) => `<button data-v="${i + 1}">${l}</button>`).join('')}</div></div>
    ${th.oom ? `<div class="card"><b>Mode de réponse</b><div class="chips" id="om"><button data-v="0">Résultat exact</button><button data-v="1">Ordre de grandeur (×2)</button></div></div>` : ''}
    <div class="card"><b>Nombre de questions</b><div class="chips" id="nn">${[10, 20, 50].map((n) => `<button data-v="${n}">${n}</button>`).join('')}</div>
      <div style="height:10px"></div><b>Chrono</b><div class="chips" id="tm"><button data-v="0">Sans</button><button data-v="1">30 s / question</button></div></div>
    <div class="card"><b>Sous-thème</b><select id="sub"><option value="">Tous (révision auto des points faibles)</option>${subs.map((s) => `<option>${esc(s)}</option>`).join('')}</select></div>
    <button class="primary" id="go" style="width:100%;font-size:18px;padding:16px">Commencer</button>`;
  const cfg = { ...prev };
  const bind = (sel, key, conv = Number) => {
    const box = $(sel); if (!box) return;
    const upd = () => box.querySelectorAll('button').forEach((b) => b.classList.toggle('on', conv(b.dataset.v) === cfg[key]));
    box.querySelectorAll('button').forEach((b) => (b.onclick = () => { cfg[key] = conv(b.dataset.v); upd(); }));
    upd();
  };
  cfg.oom = cfg.oom ? 1 : 0; cfg.timed = cfg.timed ? 1 : 0;
  bind('#lv', 'level'); bind('#om', 'oom'); bind('#nn', 'n'); bind('#tm', 'timed');
  $('#sub').value = cfg.sub;
  $('#back').onclick = home;
  $('#go').onclick = () => {
    cfg.sub = $('#sub').value; lastSetup[id] = { ...cfg };
    store.settings().oom = !!cfg.oom; store.save();
    run(th, new Session(th, { level: cfg.level, n: cfg.n, timed: !!cfg.timed, oom: !!cfg.oom && !!th.oom, sub: cfg.sub }));
  };
}

// ---------- Session ----------
function showAnswer(q) {
  if (q.show) return q.show;
  if (q.kind === 'mcq') return q.htmlChoices ? 'la bonne figure est surlignée' : q.choices[q.a];
  if (q.kind === 'list') return q.a.map((x) => fmt(x)).join(' ; ');
  if (q.kind === 'text') return q.a;
  return fmt(q.a, 5) + (q.unit ? ' ' + q.unit : '');
}

function run(th, S) {
  const q = S.next();
  if (!q) return results(th, S);
  clearTimer();
  const sysKb = store.settings().sysKeyboard;
  const typed = q.kind !== 'mcq';
  const useKeypad = (q.kind === 'num' || q.kind === 'list');
  const hint = q.kind === 'num'
    ? (S.oom && q.mental ? 'Ordre de grandeur accepté (×2)' : q.tol && q.tol >= 0.005 ? `Tolérance ≈ ${q.tol * 100} %` : 'Valeur exacte (fraction ou décimal)')
    : q.kind === 'list' ? 'Valeurs séparées par « ; »' : '';
  app.innerHTML = `
    <div class="top"><button class="ghost" id="quit">✕</button><span class="mut">${esc(th.name)} · ${esc(q.sub)} · niv. ${q.lvl}</span><div class="sp"></div><span class="timer" id="tm"></span></div>
    <div class="bar"><i style="width:${(S.done / S.n) * 100}%"></i></div>
    <div class="card">
      ${q.ctx ? `<div class="ctx">${esc(q.ctx)}</div>` : ''}
      ${q.part ? `<div class="mut">Question ${q.part}</div>` : ''}
      ${q.consts ? `<div class="consts">${esc(q.consts)}</div>` : ''}
      ${q.svg ? `<div class="qsvg">${q.svg}</div>` : ''}
      <div class="q ${q.big ? 'big' : ''}">${esc(q.q)}${q.unit && q.kind === 'num' ? ` <span class="mut">(en ${esc(q.unit)})</span>` : ''}</div>
      ${hint ? `<div class="mut" style="margin-bottom:8px">${hint}</div>` : ''}
      <div id="inp">${q.kind === 'mcq'
        ? `<div class="choices ${q.htmlChoices ? 'svgc' : ''}">${q.choices.map((c, i) => `<button data-i="${i}">${q.htmlChoices ? c : esc(c)}</button>`).join('')}</div>`
        : `<div class="ans"><input id="in" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" ${useKeypad && !sysKb ? 'inputmode="none"' : ''} placeholder="Ta réponse"><button class="primary" id="ok">OK</button></div>`}</div>
      <div id="fb"></div>
    </div>
    ${useKeypad ? '<div class="kp" id="kp"></div>' : ''}`;
  $('#quit').onclick = () => { clearTimer(); home(); };
  const t0 = Date.now();
  let answered = false;

  const userText = (raw) => (q.kind === 'mcq' ? (q.htmlChoices ? 'la figure choisie' : q.choices[Number(raw)]) : String(raw ?? '').trim());
  const finish = (ok, extra = '', raw = null) => {
    if (answered) return; answered = true; clearTimer();
    const ms = Date.now() - t0;
    store.record({ t: Date.now(), theme: th.id, sub: q.sub, lvl: q.lvl, ok: !!ok, ms });
    S.answered(ok);
    const fb = $('#fb');
    const diag = !ok && raw !== null ? diagnose(q, raw, S.oom) : '';
    const mine = raw !== null && raw !== '' ? userText(raw) : '';
    fb.innerHTML = `<div class="fb ${ok ? 'ok' : 'ko'}"><b class="t">${ok ? '✓ Correct' : '✗ Raté'}${extra}</b>` +
      (!ok && mine ? `Ta réponse : <b>${esc(mine)}</b>\n` : '') +
      `${ok ? 'Réponse' : 'Bonne réponse'} : <b>${esc(showAnswer(q))}</b>\n` +
      (diag ? `\n<b>Pourquoi c’est faux :</b> ${esc(diag)}\n` : '') +
      `\n<b>Explication détaillée :</b>\n${esc(q.expl || '')}</div>
      <button class="primary" id="next" style="width:100%">${S.done >= S.n ? 'Voir le résultat' : 'Suivant →'}</button>`;
    const nb = $('#next'); nb.onclick = () => run(th, S); nb.focus();
    if (typed) { $('#in').disabled = true; $('#ok').disabled = true; }
    const inp = $('#in'); if (inp) inp.blur();
  };

  if (q.kind === 'mcq') {
    app.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => {
      if (answered) return;
      const i = Number(b.dataset.i), ok = i === q.a;
      b.classList.add(ok ? 'good' : 'bad');
      if (!ok) app.querySelector(`[data-i="${q.a}"]`).classList.add('good');
      finish(ok, '', i);
    }));
  } else {
    const inp = $('#in');
    if (useKeypad) buildKeypad($('#kp'), inp);
    const submit = () => {
      if (answered) return;
      if (!inp.value.trim()) return;
      const g = grade(q, inp.value, S.oom);
      if (g.error) { $('#fb').innerHTML = `<div class="fb ko">${esc(g.error)}</div>`; return; }
      finish(g.ok, '', inp.value);
    };
    $('#ok').onclick = submit;
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    if (matchMedia('(hover:hover)').matches || sysKb || !useKeypad) inp.focus();
  }
  document.onkeydown = (e) => { if (e.key === 'Enter' && answered) { const nb = $('#next'); if (nb) nb.click(); } };

  if (S.timed) {
    let left = 30; const tm = $('#tm'); tm.textContent = left + ' s';
    timerId = setInterval(() => {
      left--; tm.textContent = left + ' s';
      if (left <= 0) { finish(false, ' (temps écoulé)', ''); }
    }, 1000);
  }
}

// ---------- Résultats ----------
function results(th, S) {
  clearTimer(); document.onkeydown = null;
  const ok = S.results.filter(Boolean).length;
  app.innerHTML = `
    <div class="top"><h1>Résultat</h1></div>
    <div class="card" style="text-align:center"><div class="big-num">${ok} / ${S.n}</div>
      <div class="mut">${Math.round((100 * ok) / S.n)} % · ${th.name}${S.adaptive ? ' · niveau adaptatif actuel ' + S.level : ''}</div></div>
    <div class="row"><button id="again" class="primary">Rejouer</button><button id="hm">Accueil</button></div>`;
  $('#again').onclick = () => run(th, new Session(th, { level: S.adaptive ? 0 : S.level, n: S.n, timed: S.timed, oom: S.oom, sub: S.sub }));
  $('#hm').onclick = home;
}

// ---------- Statistiques ----------
function lineChart(series) {
  const W = 340, H = 120, p = 18, step = (W - 2 * p) / (series.length - 1);
  const pts = series.map((d, i) => d.n ? [p + i * step, H - p - ((H - 2 * p) * d.ok) / d.n] : null);
  let path = '', pen = false;
  pts.forEach((pt) => { if (!pt) { pen = false; return; } path += `${pen ? 'L' : 'M'}${pt[0].toFixed(1)},${pt[1].toFixed(1)} `; pen = true; });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%"><line x1="${p}" y1="${p}" x2="${W - p}" y2="${p}" stroke="#64748b44"/><line x1="${p}" y1="${H - p}" x2="${W - p}" y2="${H - p}" stroke="#64748b44"/>
    <text x="0" y="${p + 4}" font-size="9" fill="#94a3b8">100%</text><text x="2" y="${H - p + 4}" font-size="9" fill="#94a3b8">0</text>
    <path d="${path}" fill="none" stroke="#6366f1" stroke-width="2.5"/>${pts.map((pt, i) => pt ? `<circle cx="${pt[0]}" cy="${pt[1]}" r="3.5" fill="#6366f1"><title>${series[i].ok}/${series[i].n}</title></circle>` : '').join('')}</svg>`;
}
function stats() {
  clearTimer();
  const now = Date.now();
  const t30 = store.statsBy((h) => h.theme, now - 30 * 864e5);
  const tAll = store.statsBy((h) => h.theme);
  const subs = store.statsBy((h) => h.theme + '|' + h.sub, now - 60 * 864e5);
  const weak = Object.entries(subs).filter(([, o]) => o.n >= 4).map(([k, o]) => ({ k, p: o.ok / o.n, o })).sort((a, b) => a.p - b.p).slice(0, 6);
  const nameOf = (id) => THEMES.find((t) => t.id === id)?.name || id;
  app.innerHTML = `
    <div class="top"><button class="ghost" id="back">←</button><h1>Progression</h1></div>
    <div class="card"><b>Précision par jour (14 j)</b>${lineChart(store.dailySeries(14))}</div>
    <div class="card"><b>Par thème (30 jours)</b>${THEMES.map((t) => { const o = t30[t.id], p = pct(o); return `<div class="stat"><span class="n">${t.icon} ${t.name}</span><span class="b"><i style="width:${p || 0}%;background:${t.color}"></i></span><span class="v">${o ? p + ' % · ' + o.n + ' q.' : '—'}</span></div>`; }).join('')}</div>
    <div class="card"><b>Points faibles (60 jours)</b>${weak.length ? weak.map((w) => { const [t, s] = w.k.split('|'); return `<div class="stat"><span class="n" style="width:200px">${esc(nameOf(t))} — ${esc(s)}</span><span class="b"><i style="width:${w.p * 100}%;background:#ef4444"></i></span><span class="v">${Math.round(w.p * 100)} %</span></div>`; }).join('') : '<div class="mut">Pas encore assez de données (4 questions min. par sous-thème).</div>'}</div>
    <div class="card"><b>Vitesse moyenne</b>${THEMES.map((t) => { const o = tAll[t.id]; return o ? `<div class="stat"><span class="n">${t.name}</span><span class="v" style="flex:1;text-align:left">${(o.ms / o.n / 1000).toFixed(1)} s / question</span></div>` : ''; }).join('') || '<div class="mut">—</div>'}</div>`;
  $('#back').onclick = home;
}

// ---------- Réglages / sauvegarde ----------
function settingsScreen() {
  clearTimer();
  const s = store.settings();
  app.innerHTML = `
    <div class="top"><button class="ghost" id="back">←</button><h1>Réglages</h1></div>
    <div class="card"><b>Clavier</b><div class="mut">Le clavier de symboles remplace le clavier système sur mobile pour les réponses numériques.</div>
      <div class="chips" style="margin-top:8px"><button id="kb">${s.sysKeyboard ? 'Clavier système : OUI' : 'Clavier système : NON'}</button></div></div>
    <div class="card"><b>Sauvegarde / transfert iPhone ↔ Mac</b><div class="mut">Les données restent sur cet appareil. Exporte puis importe sur l’autre (AirDrop, iCloud…). L’import fusionne l’historique.</div>
      <div class="row" style="margin-top:8px"><button id="ex" class="primary">Exporter</button><button id="im">Importer</button></div>
      <textarea id="ta" placeholder="Coller ici le contenu à importer…" style="margin-top:8px"></textarea>
      <div id="msg" class="mut"></div></div>
    <div class="card"><b>Zone dangereuse</b><div class="row" style="margin-top:8px"><button id="rs" style="background:#7f1d1d;color:#fff">Effacer l’historique</button></div></div>`;
  $('#back').onclick = home;
  $('#kb').onclick = () => { s.sysKeyboard = !s.sysKeyboard; store.save(); settingsScreen(); };
  $('#ex').onclick = () => {
    const json = store.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `preptrainer-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); $('#ta').value = json; $('#msg').textContent = 'Fichier téléchargé (et copiable ci-dessus).';
  };
  $('#im').onclick = () => { try { store.importJSON($('#ta').value); $('#msg').textContent = 'Import réussi ✓'; } catch (e) { $('#msg').textContent = 'Erreur : ' + e.message; } };
  $('#rs').onclick = () => { if (confirm('Effacer tout l’historique ?')) { store.reset(); home(); } };
}

store.load();
home();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
