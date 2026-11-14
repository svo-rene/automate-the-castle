'use strict';
// --- ⚙️ Torwerk: LK Sprachen und Automaten (Burg 27, Lehrplan LB 6, OPAL-Kurs LK_INF_LB6 „Sprachen und Automaten“) ---
// Das Tor der Burg prüft Passierscheine mit einem Automaten. Torwärter Otto erzählt.
// Neu: Fragen-Art 'automat' (Automaten-Baukasten): δ-Tabelle mit Auswahlfeldern, Endzustände ankreuzen, Bild wird live gezeichnet;
// Prüfen testet alle Wörter bis maxLaenge gegen ziel(wort) und nennt das erste Gegenbeispiel.
// Python: DEA als verschachteltes Dictionary delta[zustand][zeichen], NEA mit Listen von Folgezuständen.

KAPITEL[90] = { name: 'Formale Sprachen', ico: '🔤' };
KAPITEL[91] = { name: 'Grammatiken und BNF', ico: '📜' };
KAPITEL[92] = { name: 'Endliche Automaten', ico: '🤖' };
KAPITEL[93] = { name: 'NEA und Potenzmengen', ico: '🌫️' };
KAPITEL[94] = { name: 'Grenzen der Automaten', ico: '🧱' };
KAPITEL[95] = { name: 'Wie ein Compiler liest', ico: '⚙️' };
BURGEN[27] = { name: 'LK Automaten', ico: '⚙️', klasse: 'LK', region: 'torwerk', kapitel: [90, 91, 92, 93, 94, 95],
  text: 'Leistungskurs: Alphabet, Wort, Sprache, Grammatiken und Ableitungen, BNF, Chomsky-Hierarchie, DEA mit Fangzustand, NEA und Potenzmengenkonstruktion, Grenzen endlicher Automaten, Kellerautomat, lexikalische Analyse.' };

const AUTO = (a) => KORN({ warte: true, tor: true, zielArt: 'wert', funktion: null, sprache: S_LK, ...a });
const AFRAGEN = (a) => AUTO({ sortArt: 'fragen', listen: [], ...a });
const auBild = (html) => `<div class="werkbild dsbild kbild">${html}</div>`;

// --- Automat: { zustaende, start, ende: [..], delta: {z: {c: ziel}} } (fehlender Übergang = verwerfen) ---
function automatLauf(au, wort) {
  let z = au.start;
  const weg = [z];
  for (const c of wort) { z = au.delta[z]?.[c]; if (!z) return { ok: false, weg, haengt: true }; weg.push(z); }
  return { ok: au.ende.includes(z), weg };
}
// alle Wörter über dem Alphabet bis Länge n (das leere Wort zuerst)
function alleWoerter(abc, n) {
  const aus = [''];
  let schicht = [''];
  for (let l = 1; l <= n; l++) { schicht = schicht.flatMap((w) => abc.map((c) => w + c)); aus.push(...schicht); }
  return aus;
}
// erstes Wort, bei dem der Automat anders entscheidet als die Sprache – oder null
function automatFehler(f, au) {
  for (const w of alleWoerter(f.alphabet, f.maxLaenge || 6)) if (automatLauf(au, w).ok !== !!f.ziel(w)) return w;
  return null;
}
// Automat zeichnen: Zustände im Kreis, Pfeile mit Zeichen, Schleifen oben, Hin- und Rückweg gebogen
function svgAutomat(au, opt = {}) {
  const zs = au.zustaende, n = zs.length, W = 380, Hh = n <= 2 ? 150 : 230, r = 18;
  const pos = {};
  zs.forEach((z, i) => {
    pos[z] = n <= 3 ? [60 + i * ((W - 120) / Math.max(1, n - 1)), Hh / 2 + 10]
      : [W / 2 + Math.cos(Math.PI + (i * 2 * Math.PI) / n) * 140, Hh / 2 + 12 + Math.sin(Math.PI + (i * 2 * Math.PI) / n) * 78];
  });
  const kanten = {};
  for (const z of zs) for (const [c, t] of Object.entries(au.delta[z] || {})) if (t && pos[t]) (kanten[`${z}|${t}`] ||= []).push(c);
  let s = '<defs><marker id="auPfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#3a2c10"/></marker></defs>';
  for (const [k, cs] of Object.entries(kanten)) {
    const [a, b] = k.split('|'), [x1, y1] = pos[a], [x2, y2] = pos[b], text = cs.join(',');
    if (a === b) {
      s += `<path d="M${x1 - 9},${y1 - r + 2} C${x1 - 26},${y1 - 58} ${x1 + 26},${y1 - 58} ${x1 + 9},${y1 - r + 2}" fill="none" stroke="#3a2c10" stroke-width="1.8" marker-end="url(#auPfeil)"/><text x="${x1}" y="${y1 - 50}" text-anchor="middle" font-size="12" font-weight="700" fill="#2c3d78">${esc(text)}</text>`;
      continue;
    }
    const zurueck = !!kanten[`${b}|${a}`], dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l, bog = zurueck ? 22 : 0;
    const mx = (x1 + x2) / 2 + nx * bog, my = (y1 + y2) / 2 + ny * bog;
    const sx = x1 + ((mx - x1) / Math.hypot(mx - x1, my - y1)) * r, sy = y1 + ((my - y1) / Math.hypot(mx - x1, my - y1)) * r;
    const ex = x2 + ((mx - x2) / Math.hypot(mx - x2, my - y2)) * (r + 2), ey = y2 + ((my - y2) / Math.hypot(mx - x2, my - y2)) * (r + 2);
    s += `<path d="M${sx},${sy} Q${mx},${my} ${ex},${ey}" fill="none" stroke="#3a2c10" stroke-width="1.8" marker-end="url(#auPfeil)"/>
      <text x="${(sx + 2 * mx + ex) / 4 + nx * 9}" y="${(sy + 2 * my + ey) / 4 + ny * 9 + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#2c3d78">${esc(text)}</text>`;
  }
  const [sx0, sy0] = pos[au.start];
  s += `<line x1="${sx0 - 52}" y1="${sy0}" x2="${sx0 - r - 2}" y2="${sy0}" stroke="#3a2c10" stroke-width="2" marker-end="url(#auPfeil)"/>`;
  for (const z of zs) {
    const [x, y] = pos[z], an = opt.mark?.includes(z);
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${an ? '#ffd84a' : z === opt.fang ? '#d8d0c0' : '#fdf8e8'}" stroke="#3a2c10" stroke-width="2"/>`;
    if (au.ende.includes(z)) s += `<circle cx="${x}" cy="${y}" r="${r - 4}" fill="none" stroke="#3a2c10" stroke-width="1.5"/>`;
    s += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#1a1408">${esc(z)}</text>`;
  }
  return `<svg class="dssvg" viewBox="0 0 ${W} ${Hh}" style="max-width:${W * 1.5}px">${s}</svg>`;
}
const deltaTabelle = (au) => `<div class="dbtab"><div class="dbscroll"><table><tr><th>δ</th>${au.alphabet.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>
  ${au.zustaende.map((z) => `<tr><th>${z === au.start ? '→ ' : ''}${esc(z)}${au.ende.includes(z) ? ' (Ende)' : ''}</th>${au.alphabet.map((c) => `<td>${esc(au.delta[z]?.[c] || '–')}</td>`).join('')}</tr>`).join('')}</table></div></div>`;

// --- Automaten-Baukasten (kornspeicher.js ruft diese Funktionen für Fragen mit art 'automat') ---
function automatStart(f) {
  KO.auto = { zustaende: f.zustaende, start: f.zustaende[0], alphabet: f.alphabet, ende: [...(f.vorgabe?.ende || [])], delta: JSON.parse(JSON.stringify(f.vorgabe?.delta || {})) };
  for (const z of f.zustaende) KO.auto.delta[z] ||= {};
}
function automatHtml(f) {
  const au = KO.auto;
  return `<div class="auwerk"><div id="auBild">${svgAutomat(au)}</div>
    <div class="dbtab"><div class="dbscroll"><table class="autab"><tr><th>Zustand</th><th>Ende?</th>${f.alphabet.map((c) => `<th>mit ${esc(c)}</th>`).join('')}</tr>
    ${f.zustaende.map((z) => `<tr><th>${z === au.start ? '→ ' : ''}${esc(z)}</th><td><input type="checkbox" data-ende="${z}" ${au.ende.includes(z) ? 'checked' : ''}></td>
      ${f.alphabet.map((c) => `<td><select data-z="${z}" data-c="${c}"><option value="">–</option>${f.zustaende.map((t) => `<option ${au.delta[z][c] === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></td>`).join('')}</tr>`).join('')}</table></div></div>
    <div class="auprobe"><input id="auWort" class="codefeld" placeholder="Wort ausprobieren, z. B. ${esc(f.beispiel || f.alphabet.join('').repeat(2))}" autocomplete="off"><span id="auErg" class="hinweis"></span></div></div>`;
}
function automatKlicks() {
  const neu = () => { $('#auBild').innerHTML = svgAutomat(KO.auto, { mark: KO.auMark }); };
  for (const s of document.querySelectorAll('.autab select')) s.onchange = () => { KO.auto.delta[s.dataset.z][s.dataset.c] = s.value || undefined; if (!s.value) delete KO.auto.delta[s.dataset.z][s.dataset.c]; neu(); };
  for (const c of document.querySelectorAll('.autab [data-ende]')) c.onchange = () => { const z = c.dataset.ende; KO.auto.ende = c.checked ? [...KO.auto.ende, z] : KO.auto.ende.filter((x) => x !== z); neu(); };
  const probe = () => {
    const w = $('#auWort').value.trim(), r = automatLauf(KO.auto, w);
    KO.auMark = r.weg.slice(-1);
    $('#auErg').textContent = w === '' && !$('#auWort').value ? '' : `${r.weg.join(' → ')}${r.haengt ? ' → (kein Übergang)' : ''} · ${r.ok ? '✅ akzeptiert' : '❌ verworfen'}`;
    neu();
  };
  $('#auWort').oninput = probe;
  $('#auWort').onkeydown = (e) => { if (e.key === 'Enter') kornFragePruefen(); };
}
function automatPruefen(f) {
  if (!KO.auto.ende.length) { toast('Kreuz mindestens einen Endzustand an.'); return null; }
  const w = automatFehler(f, KO.auto);
  if (w === null) return true;
  const soll = !!f.ziel(w), anzeige = w === '' ? 'ε (das leere Wort)' : `„${w}“`;
  // Sek I (Klasse 7/8): ohne Automaten-Fachsprache – f.fehlerText(wort, soll) darf es aufgabengenau sagen
  if (f.fehlerText) log(`❌ ${f.fehlerText(w, soll)}`, 'err');
  else if ((BURGEN[BURGNR]?.klasse || 99) <= 8) log(`❌ Probier mal ${anzeige} unten aus: Da müsste dein Diagramm ${soll ? 'beim angekreuzten Zustand ankommen' : 'woanders ankommen als beim angekreuzten Zustand'} – tut es aber nicht.`, 'err');
  else log(`❌ ${anzeige} soll ${soll ? 'akzeptiert' : 'verworfen'} werden – dein Automat ${soll ? 'verwirft' : 'akzeptiert'} es.`, 'err');
  $('#auWort').value = w; $('#auWort').oninput();
  return false;
}

// --- Automaten aus dem Kurs (für Bilder und Fragen) ---
const AU_AB = { zustaende: ['s', 'p', 'e'], start: 's', alphabet: ['a', 'b'], ende: ['e'], delta: { s: { a: 'p', b: 's' }, p: { a: 'p', b: 'e' }, e: { a: 'p', b: 's' } } };
const AU_NEA = { zustaende: ['q0', 'q1', 'q2'], start: 'q0', alphabet: ['0', '1'], ende: ['q2'] };   // Wörter, die mit 1 beginnen und mit 1 enden
const zeichenZahl = (w, c) => [...w].filter((x) => x === c).length;
const binWert = (w) => (w ? parseInt(w, 2) : 0);
// regulär oder nicht? (gleich lange Antworten – sonst verrät die Länge „nicht regulär“)
const RG_WAHL = ['Typ 3 – regulär, ein endlicher Automat genügt', 'Typ 2 – nicht regulär, erst ein Kellerautomat schafft es'];

const PASS_TESTS = [['KB-17', true], ['NO-4711', true], ['AB-1', true], ['kb-17', false], ['KB17', false], ['KB-', false], ['KB-12345', false], ['K1-12', false], ['KB-1a', false]];
const ANBN_TESTS = ['ab', 'aaabbb', '', 'aab', 'abb', 'abab', 'ba', 'aaaabbbb'];
// Liste mit Nummern (für „Welche Nummern …?“-Fragen)
const AU_liste = (eintraege) => `<div class="dbtab"><div class="dbscroll"><table><tr>${eintraege.map((_, i) => `<th>${i + 1}</th>`).join('')}</tr><tr>${eintraege.map((w) => `<td class="mono">${esc(w)}</td>`).join('')}</tr></table></div></div>`;
// Kapitel 90: Wort über Σ ↔ Wort der Sprache (Passierscheine)
const AU_PASS_WOERTER = ['KB-17', 'kb-17', 'KB17', 'ZZ-0000', 'AB-12345', 'KB_17', '-'];
const AU_inSigma = (w) => /^[A-Z0-9-]*$/.test(w);
const AU_inPass = (w) => /^[A-Z]{2}-[0-9]{1,4}$/.test(w);
// Kapitel 93: NEA „enthält ab“ für den Potenzmengen-Baukasten
const AU_N2 = { q0: { a: ['q0', 'q1'], b: ['q0'] }, q1: { b: ['q2'] }, q2: { a: ['q2'], b: ['q2'] } };
const AU_folge = (menge, c) => [...new Set(menge.flatMap((q) => AU_N2[q][c] || []))].sort();
const TOKEN_TESTS = [['x = 12 + y3', ['x', '=', '12', '+', 'y3']], ['(a+b)*2', ['(', 'a', '+', 'b', ')', '*', '2']], ['summe=summe+100', ['summe', '=', 'summe', '+', '100']], ['  7  ', ['7']]];

HOEFE.push(
  // --- Kapitel 90: 🔤 Formale Sprachen (Kurs 6.1, 6.2) ---
  AFRAGEN({ id: 'ga1', kapitel: 90, ico: '🔤', titel: 'Alphabet, Wort, Sprache', lohn: 55,
    ziel: 'Die Grundbegriffe der formalen Sprachen.',
    story: 'Willkommen im Torwerk! Unser Tor lässt nur Boten mit gültigem Passierschein herein. Aber was ist „gültig“? Das muss man so genau beschreiben, dass eine Maschine es prüfen kann – mit formalen Sprachen.',
    merke: { titel: '🔤 Formale Sprachen', text: 'Ein Alphabet Σ ist eine endliche Menge von Zeichen. Ein Wort ist eine endliche Folge von Zeichen aus Σ, ε ist das leere Wort (Länge 0). Σ* ist die Menge aller Wörter über Σ. Eine formale Sprache L ist eine Teilmenge von Σ* – also genau die Wörter, die „gültig“ sind.' },
    fragen: [W('Σ = {a, b}. Welches ist KEIN Wort über Σ?', ['abba', 'ε', 'abc', 'bbbb'], 2),
      { art: 'zahl', text: 'Wie viele Wörter der Länge 3 gibt es über Σ = {a, b}?', soll: () => 8 },
      { art: 'zahl', text: 'Welche Länge hat das leere Wort ε?', soll: () => 0 },
      W('L = { aⁿb | n ≥ 0 }. Welches Wort gehört NICHT zu L?', ['b', 'aab', 'ab', 'abb'], 3),
      W('Ist L = { aⁿb | n ≥ 0 } endlich?', ['ja, sie hat 3 Wörter', 'nein – sie enthält unendlich viele Wörter, obwohl jedes einzelne endlich ist', 'ja, weil Σ endlich ist', 'das kann man nicht sagen'], 1)],
    tipps: ['2 · 2 · 2'] }),
  AFRAGEN({ id: 'ga1b', kapitel: 90, ico: '🎫', titel: 'Wort über Σ – oder Wort der Sprache?', lohn: 55, ansicht: 'tabelle', titelAnsicht: 'Zeichenfolgen am Tor',
    tabelle: () => ({ html: auBild(`<p><b>Σ</b> = { A, B, …, Z, 0, 1, …, 9, - } – Großbuchstaben, Ziffern und der Bindestrich</p>
      <p><b>L</b> = gültige Passierscheine: zwei Großbuchstaben, ein „-“, dann eine bis vier Ziffern</p>${AU_liste(AU_PASS_WOERTER)}`) }),
    ziel: 'Am Tor kommen sieben Zeichenfolgen an. Unterscheide genau: Ist eine Zeichenfolge überhaupt ein Wort über Σ – und gehört sie dann auch zur Sprache L?',
    fragen: [{ art: 'liste', menge: true, text: 'Welche Zeichenfolgen sind Wörter über Σ? (Nummern mit Leerzeichen)', soll: () => AU_PASS_WOERTER.map((w, i) => (AU_inSigma(w) ? i + 1 : 0)).filter(Boolean) },
      { art: 'liste', menge: true, text: 'Welche davon gehören zur Sprache L der Passierscheine? (Nummern)', soll: () => AU_PASS_WOERTER.map((w, i) => (AU_inPass(w) ? i + 1 : 0)).filter(Boolean) },
      { art: 'zahl', text: 'Wie viele Zeichen hat das Alphabet Σ?', soll: () => 26 + 10 + 1 },
      { art: 'zahl', text: 'Wie viele verschiedene Wörter enthält L? (2 Buchstaben, dann 1, 2, 3 oder 4 Ziffern)', soll: () => 26 * 26 * (10 + 100 + 1000 + 10000) },
      W('Ist die Sprache L endlich?', ['ja – sie enthält nur endlich viele Wörter, auch wenn es sehr viele sind', 'nein – über Σ gibt es unendlich viele Wörter, also ist auch L unendlich', 'nein – jede formale Sprache ist unendlich, weil Σ* unendlich ist', 'das kann man erst sagen, wenn ein Automat die Wörter geprüft hat'], 0)],
    tipps: ['Ein Wort über Σ darf nur Zeichen aus Σ enthalten – Kleinbuchstaben und _ gehören nicht dazu. Ob es ein gültiger Schein ist, spielt dafür keine Rolle.', 'L ist eine Teilmenge der Wörter über Σ: Jedes Wort aus L ist ein Wort über Σ, aber nicht umgekehrt.', '26 · 26 Möglichkeiten für die Buchstaben, dann 10 + 100 + 1000 + 10 000 für die Ziffern.'] }),
  AUTO({ id: 'ga2', kapitel: 90, sortArt: 'funktion', ico: '🎫', titel: 'Der Passierschein', lohn: 65,
    ziel: 'Ein Passierschein hat genau zwei Großbuchstaben, einen Bindestrich und dann eine bis vier Ziffern, z. B. „KB-17“. Schreib ist_passierschein(wort): True, wenn das Wort zu dieser Sprache gehört. Dein Programm entscheidet wie ein Automat über ein Wort: ja oder nein. Später im Kapitel 🤖 baust du denselben Prüfer als Automaten – ganz ohne len() und Index, nur mit Zuständen.',
    listen: PASS_TESTS.map(() => []), aufrufFn: (l, k) => `ist_passierschein("${PASS_TESTS[k][0]}")`, soll: (l, k) => PASS_TESTS[k][1], testName: (k) => `„${PASS_TESTS[k][0]}“`,
    befehle: [K_B('def ist_passierschein(wort):'), K_B('.isdigit()')],
    tipps: ['Erst die Länge prüfen: mindestens 4 (AB-1), höchstens 7 (AB-1234).', "wort[0] und wort[1] Großbuchstaben, wort[2] == '-'.", 'Ab Index 3 nur Ziffern: z.isdigit().'],
    loesung: "def ist_passierschein(wort):\n    if len(wort) < 4 or len(wort) > 7:\n        return False\n    if not ('A' <= wort[0] <= 'Z' and 'A' <= wort[1] <= 'Z'):\n        return False\n    if wort[2] != '-':\n        return False\n    for i in range(3, len(wort)):\n        if not wort[i].isdigit():\n            return False\n    return True" }),

  // --- Kapitel 91: 📜 Grammatiken und BNF (Kurs 6.3–6.6) ---
  AFRAGEN({ id: 'gb1', kapitel: 91, ico: '📜', titel: 'Eine Grammatik lesen', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'Grammatik G',
    tabelle: () => ({ html: auBild('<pre class="mono dscode">G = (N, T, P, S)\nN = {S, B}\nT = {a, b}\nP = { S → aS | aB\n      B → bB | b }</pre>') }),
    ziel: 'Lies die Grammatik und leite Wörter ab.',
    merke: { titel: '📜 Grammatiken', text: 'Eine Grammatik G = (N, T, P, S) besteht aus Nichtterminalen N, Terminalen T, Produktionsregeln P und dem Startsymbol S. Eine Ableitung ersetzt Schritt für Schritt Nichtterminale nach den Regeln (⇒), bis nur noch Terminale dastehen. L(G) ist die Menge aller so ableitbaren Wörter.', code: 'S ⇒ aS ⇒ aaB ⇒ aabB ⇒ aabb' },
    fragen: [W('Welche Zeichen sind Terminale?', ['S und B', 'a und b', 'S, B, a, b', '→ und |'], 1),
      W('Welches Wort ist aus S ableitbar?', ['b', 'ab', 'ba', 'aba'], 1),
      { art: 'zahl', text: 'Wie viele Ableitungsschritte (⇒) braucht aabb?', soll: () => 4 },
      W('Welche Sprache erzeugt G?', ['{ aⁿbⁿ }', '{ aⁿbᵐ | n ≥ 1, m ≥ 1 }', 'alle Wörter über {a, b}', '{ (ab)ⁿ }'], 1),
      { art: 'zahl', text: 'Wie viele verschiedene Wörter der Länge 4 erzeugt G?', soll: () => 3 }],
    tipps: ['S ⇒ aS ⇒ aaB ⇒ aabB ⇒ aabb', 'Erst kommen die a (mindestens eins), dann die b (mindestens eins). Bei Länge 4: Wie viele a können es sein?'] }),
  AUTO({ id: 'gb2', kapitel: 91, sortArt: 'funktion', ico: '🪜', titel: 'Ableitung Schritt für Schritt', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Grammatik',
    tabelle: () => ({ html: auBild('<pre class="mono dscode">S → aS | b</pre><p class="hinweis">Für aab: S ⇒ aS ⇒ aaS ⇒ aab – als Liste ["S", "aS", "aaS", "aab"]</p>') }),
    ziel: 'Schreib ableitung(n): die Liste aller Satzformen der Ableitung von aⁿb mit S → aS | b, vom Startsymbol S bis zum fertigen Wort.',
    listen: [[], [], []], aufrufFn: (l, k) => `ableitung(${[2, 0, 4][k]})`, soll: (l, k) => { const n = [2, 0, 4][k]; return [...Array(n + 1)].map((_, i) => 'a'.repeat(i) + 'S').concat('a'.repeat(n) + 'b'); }, testName: (k) => `n = ${[2, 0, 4][k]}`,
    befehle: [K_B('def ableitung(n):'), K_B('.append(')],
    tipps: ['Start: ["S"]. n-mal die Regel S → aS anwenden, dann einmal S → b.', '"a" * 3 ergibt "aaa".'],
    loesung: 'def ableitung(n):\n    formen = ["S"]\n    for i in range(n):\n        formen.append("a" * (i + 1) + "S")\n    formen.append("a" * n + "b")\n    return formen' }),
  AFRAGEN({ id: 'gb3', kapitel: 91, ico: '🧾', titel: 'Die Backus-Naur-Form', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'BNF der Passierscheine',
    tabelle: () => ({ html: auBild('<pre class="mono dscode">&lt;schein&gt;    ::= &lt;burg&gt; "-" &lt;nummer&gt;\n&lt;burg&gt;     ::= "N" | "S" | "O" | "W"\n&lt;nummer&gt;   ::= &lt;ziffer&gt; | &lt;ziffer&gt; &lt;nummer&gt;\n&lt;ziffer&gt;   ::= "0" | "1" | … | "9"</pre>') }),
    ziel: 'Welche Passierscheine beschreibt diese BNF?',
    merke: { titel: '🧾 BNF', text: 'Die Backus-Naur-Form beschreibt Grammatiken kompakt: Nichtterminale in spitzen Klammern <…>, ::= heißt „wird definiert als“, | trennt Alternativen, Terminale stehen in Anführungszeichen. Rekursive Regeln wie <nummer> ::= <ziffer> | <ziffer><nummer> erlauben beliebig lange Folgen.' },
    fragen: [W('Welcher Schein ist gültig?', ['N-', 'NS-12', 'W-007', 'O12'], 2),
      W('Warum ist „N-“ ungültig?', ['N gehört nicht zu <burg>', '<nummer> braucht mindestens eine Ziffer', 'vor dem „-“ fehlt ein zweites <burg>', 'der Bindestrich gehört zu <nummer>'], 1),
      W('Wie lang darf die Nummer höchstens sein?', ['genau eine Ziffer', 'höchstens vier Ziffern', 'beliebig lang – die Regel ist rekursiv', 'höchstens zehn Ziffern'], 2),
      W('Was bedeutet | in der BNF?', ['und', 'oder – trennt Alternativen', 'Ende der Regel', 'Wiederholung'], 1)],
    tipps: ['Jede Regel von oben nach unten einsetzen.'] }),
  AFRAGEN({ id: 'gb4', kapitel: 91, ico: '🏛️', titel: 'Die Chomsky-Hierarchie', lohn: 65,
    ziel: 'Welche Grammatik gehört zu welchem Typ – und welche Maschine erkennt sie?',
    merke: { titel: '🏛️ Chomsky-Hierarchie', text: 'Typ 3 (regulär): Regeln A → aB oder A → a – erkannt von endlichen Automaten. Typ 2 (kontextfrei): links genau ein Nichtterminal, z. B. S → aSb – erkannt von Kellerautomaten, beschreibt Programmiersprachen. Typ 1 (kontextsensitiv), Typ 0 (ohne Einschränkung, Turingmaschine). Jeder Typ enthält die höheren Nummern.' },
    fragen: [W('S → aS | a ist …', ['Typ 3 (regulär)', 'nur Typ 2', 'Typ 1', 'keine Grammatik'], 0),
      W('S → aSb | ab erzeugt { aⁿbⁿ | n ≥ 1 }. Sie ist …', ['regulär (Typ 3), weil nur a und b vorkommen', 'kontextfrei (Typ 2), aber nicht regulär', 'kontextsensitiv (Typ 1), nicht kontextfrei', 'regulär (Typ 3), weil links nur S steht'], 1),
      W('Welche Maschine erkennt die Sprachen vom Typ 2?', ['endlicher Automat mit Fangzustand', 'Kellerautomat (mit Stapelspeicher)', 'nichtdeterministischer endlicher Automat', 'DEA mit beliebig vielen Endzuständen'], 1),
      W('Warum beschreibt man Programmiersprachen mit kontextfreien Grammatiken?', ['Verschachtelung – Klammern, Blöcke und if in if sind beliebig tief verschachtelt, das schafft Typ 3 nicht', 'Kürze – kontextfreie Regeln sind immer kürzer als reguläre', 'Geschwindigkeit – reguläre Grammatiken sind beim Übersetzen zu langsam', 'Vollständigkeit – reguläre Grammatiken kennen keine Schlüsselwörter'], 0),
      W('Zurück zur Grammatik G aus „Eine Grammatik lesen“: S → aS | aB, B → bB | b. Zu welchem Typ gehört sie höchstens?', ['Typ 3 – jede Regel hat die Form A → aB oder A → a', 'nur Typ 2 – weil S auf der rechten Seite vorkommt', 'nur Typ 1 – weil es zwei Nichtterminale gibt', 'Typ 0 – weil die Wörter beliebig lang werden'], 0)],
    tipps: ['Typ 3: rechts höchstens ein Nichtterminal, und zwar ganz hinten.'] }),

  // --- Kapitel 92: 🤖 Endliche Automaten (Kurs 6.7, 6.8) ---
  AFRAGEN({ id: 'gc1', kapitel: 92, ico: '🤖', titel: 'Ein Automat am Tor', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'DEA: Wörter, die auf ab enden',
    tabelle: () => ({ html: auBild(`${svgAutomat(AU_AB)}${deltaTabelle(AU_AB)}<p class="hinweis">Doppelkreis = Endzustand, Pfeil von links = Startzustand.</p>`) }),
    ziel: 'Lies den Automaten und spiele Wörter durch.',
    merke: { titel: '🤖 DEA', text: 'Ein deterministischer endlicher Automat A = (Q, Σ, δ, q₀, F) hat Zustände Q, ein Eingabealphabet Σ, eine Übergangsfunktion δ (zu jedem Zustand und Zeichen genau ein Folgezustand), einen Startzustand q₀ und Endzustände F. Er liest das Wort Zeichen für Zeichen; akzeptiert wird, wenn er NACH dem letzten Zeichen in einem Endzustand ist.' },
    fragen: [{ art: 'liste', text: 'Welche Zustände durchläuft der Automat beim Wort baab (mit dem Start)?', soll: () => automatLauf(AU_AB, 'baab').weg },
      W('Wird baab akzeptiert?', ['ja', 'nein'], automatLauf(AU_AB, 'baab').ok ? 0 : 1),
      { art: 'liste', text: 'Und bei aba?', soll: () => automatLauf(AU_AB, 'aba').weg },
      W('Bei aba war der Automat zwischendurch in e. Wird aba akzeptiert?', ['ja, er war ja in e', 'nein – entscheidend ist nur der Zustand nach dem letzten Zeichen', 'manchmal', 'das hängt vom Startzustand ab'], 1)],
    tipps: ['Zeile = aktueller Zustand, Spalte = gelesenes Zeichen.'] }),
  AFRAGEN({ id: 'gc2', kapitel: 92, ico: '🛠️', titel: 'Bau deinen ersten Automaten', lohn: 70,
    ziel: 'Das Tor öffnet sich nur, wenn im Wort eine gerade Anzahl a steht (b ist egal). Bau den DEA.',
    merke: { titel: '🛠️ Der Automaten-Baukasten', text: 'Trag in der Tabelle für jeden Zustand ein, wohin er bei jedem Zeichen wechselt, und kreuz die Endzustände an. Oben siehst du deinen Automaten, unten kannst du Wörter ausprobieren. ✔ Prüfen testet alle Wörter bis zu einer bestimmten Länge und nennt dir das erste, bei dem dein Automat falsch entscheidet.' },
    fragen: [{ art: 'automat', text: 'Gerade Anzahl a (0, 2, 4 …). g = „bisher gerade“, u = „bisher ungerade“.', zustaende: ['g', 'u'], alphabet: ['a', 'b'], ziel: (w) => zeichenZahl(w, 'a') % 2 === 0, maxLaenge: 6, beispiel: 'abab',
      loesung: { ende: ['g'], delta: { g: { a: 'u', b: 'g' }, u: { a: 'g', b: 'u' } } } }],
    tipps: ['Frag dich für beide Zeichen: Ändert ein a etwas an „bisher gerade / ungerade“? Und ein b?', 'Ist das leere Wort ε gültig? Daraus folgt, ob der Startzustand ein Endzustand ist.'] }),
  AFRAGEN({ id: 'gc3', kapitel: 92, ico: '🕳️', titel: 'Der Fangzustand', lohn: 70,
    ziel: 'Das Nordtor nimmt nur Wörter, die mit ab beginnen (danach beliebig). Bau den DEA – mit einem Fangzustand f, aus dem es kein Zurück gibt.',
    merke: { titel: '🕳️ Fangzustand', text: 'In einem vollständigen DEA hat jeder Zustand für jedes Zeichen einen Übergang. Kann ein Wort nicht mehr gültig werden, führt man es in einen Fangzustand: kein Endzustand, alle Übergänge zeigen auf ihn selbst. Im Bild lässt man ihn oft weg – fehlende Übergänge bedeuten dann „verwerfen“.' },
    fragen: [{ art: 'automat', text: 'Beginnt mit ab. s = Start, p = „a gelesen“, e = „ab gelesen“, f = Fangzustand.', zustaende: ['s', 'p', 'e', 'f'], alphabet: ['a', 'b'], ziel: (w) => w.startsWith('ab'), maxLaenge: 6, beispiel: 'abba',
      loesung: { ende: ['e'], delta: { s: { a: 'p', b: 'f' }, p: { a: 'f', b: 'e' }, e: { a: 'e', b: 'e' }, f: { a: 'f', b: 'f' } } } },
    W('Was passiert, wenn der Automat im Fangzustand ist?', ['er springt zurück zum Start', 'er bleibt bis zum Ende dort – das Wort wird verworfen', 'er akzeptiert sofort das ganze Wort', 'er überspringt das nächste Zeichen'], 1)],
    tipps: ['Welche Anfänge machen ein Wort schon unrettbar? Dorthin gehört der Fangzustand – und er lässt niemanden wieder heraus.', 'Ist ab einmal gelesen, ist der Rest egal. Was heißt das für die Übergänge des Zustands „ab gelesen“?'] }),
  AFRAGEN({ id: 'gc6', kapitel: 92, ico: '🎫', titel: 'Eigene Zustände', lohn: 85,
    story: 'Otto legt dir neun leere Zustandskarten hin: „Den Passierschein KB-17 hast du mit Python geprüft. Ein Automat hat aber kein len() und keinen Index – er kann sich nur merken, in welchem Zustand er gerade ist. Was die Zustände bedeuten, entscheidest diesmal du.“',
    ziel: 'Bau den Passierschein-Prüfer als DEA. Die Zustände z0 … z8 haben keine vorgegebene Bedeutung – du legst fest, wofür jeder steht. Nicht alle musst du benutzen.',
    merke: { titel: '🧠 Zustände selbst entwerfen', text: 'Ein Zustand steht für alles, was sich der Automat über den bisher gelesenen Anfang merken muss, z. B. „zwei Großbuchstaben gelesen“. Frag bei jedem Zustand: Was ist bisher passiert – und welche Zeichen dürfen jetzt kommen? Fehlt ein Übergang, wird das Wort verworfen.' },
    fragen: [{ art: 'automat', text: 'G steht für einen Großbuchstaben, Z für eine Ziffer, - für den Bindestrich. Gültig ist: G G - und dann 1 bis 4-mal Z (GG-Z = „AB-1“, GG-ZZ = „KB-17“, GG-ZZZZ = „ZZ-0000“). z0 ist der Startzustand.',
      zustaende: ['z0', 'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7', 'z8'], alphabet: ['G', '-', 'Z'], ziel: (w) => /^GG-Z{1,4}$/.test(w), maxLaenge: 8, beispiel: 'GG-ZZ',
      loesung: { ende: ['z4', 'z5', 'z6', 'z7'], delta: { z0: { G: 'z1' }, z1: { G: 'z2' }, z2: { '-': 'z3' }, z3: { Z: 'z4' }, z4: { Z: 'z5' }, z5: { Z: 'z6' }, z6: { Z: 'z7' } } } },
      { art: 'zahl', text: 'Wie viele Zustände braucht ein solcher Automat mindestens, wenn fehlende Übergänge „verwerfen“ bedeuten (also ohne Fangzustand)?', soll: () => 8 },
      W('Warum kann ein Automat „höchstens vier Ziffern“ prüfen, aber nicht „genauso viele Ziffern wie Buchstaben, beliebig viele“?', ['Eine feste Grenze braucht nur endlich viele Zustände – für beliebig große Anzahlen bräuchte er unendlich viele', 'Ein Automat unterscheidet nur ein einziges Zeichen – Buchstaben und Ziffern zugleich gehen nicht', 'Ein Automat kann Ziffern nicht zählen, nur Buchstaben – Ziffern sind für ihn alle gleich', 'Er kann beides mit genügend vielen Endzuständen – man muss sie nur ankreuzen'], 0)],
    tipps: ['Schreib dir zuerst auf, was sich der Automat merken muss: Wie viele Großbuchstaben? Schon den Bindestrich gesehen? Wie viele Ziffern danach? Jede dieser Möglichkeiten ist ein eigener Zustand.', 'Zähl die Möglichkeiten: noch nichts – ein G – zwei G – Bindestrich gelesen – und für jede erlaubte Ziffernzahl eine eigene. Ein Zustand ist genau dann Endzustand, wenn das Wort dort schon gültig wäre.', 'Probier „GG-ZZZZZ“ aus: Nach der vierten Ziffer darf kein Übergang mehr weiterführen. Und „G-Z“: Von welchem Zustand aus darf der Bindestrich überhaupt kommen?'] }),
  AFRAGEN({ id: 'gc7', kapitel: 92, ico: '🔎', titel: 'Reguläre Ausdrücke', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Wörter am Westtor',
    tabelle: () => ({ html: auBild(`<p>Das Westtor öffnet bei <b class="mono">a(b|c)*d</b></p>${AU_liste(['ad', 'abcd', 'abc', 'abdd', 'acccbd', 'bd', 'aa'])}`) }),
    ziel: 'Ein regulärer Ausdruck beschreibt eine Sprache in einer einzigen Zeile. Lies a(b|c)*d, teste Wörter und bau dann den passenden DEA – die Zustände sind nur nummeriert.',
    merke: { titel: '🔎 Reguläre Ausdrücke', text: 'Ein regulärer Ausdruck setzt eine Sprache aus drei Bausteinen zusammen: Verkettung (ab = erst a, dann b), Auswahl (b|c = b oder c) und Wiederholung (x* = x beliebig oft, auch 0-mal). Klammern fassen zusammen: (b|c)* = beliebig viele b und c in beliebiger Reihenfolge. Zu jedem regulären Ausdruck gibt es einen endlichen Automaten und umgekehrt – so arbeiten die Suche im Editor und der Scanner eines Compilers.', code: '(a|b)*b   alle Wörter über {a, b}, die auf b enden\nab*       a, ab, abb, abbb …' },
    fragen: [{ art: 'liste', menge: true, text: 'Welche Wörter gehören zu a(b|c)*d? (Nummern mit Leerzeichen)', soll: () => ['ad', 'abcd', 'abc', 'abdd', 'acccbd', 'bd', 'aa'].map((w, i) => (/^a[bc]*d$/.test(w) ? i + 1 : 0)).filter(Boolean) },
      { art: 'zahl', text: 'Wie viele verschiedene Wörter der Länge 4 beschreibt a(b|c)*d?', soll: () => 4 },
      { art: 'automat', text: 'Bau den DEA zu a(b|c)*d. Start ist q0, was q1 … q3 bedeuten, legst du fest.', zustaende: ['q0', 'q1', 'q2', 'q3'], alphabet: ['a', 'b', 'c', 'd'], ziel: (w) => /^a[bc]*d$/.test(w), maxLaenge: 6, beispiel: 'abcd',
        loesung: { ende: ['q2'], delta: { q0: { a: 'q1' }, q1: { b: 'q1', c: 'q1', d: 'q2' } } } },
      W('Welcher reguläre Ausdruck beschreibt die Scheine des Nordtors: Wörter über {a, b}, die mit ab beginnen?', ['ab(a|b)*', '(a|b)*ab', 'a(b|a)*b', '(ab)*(a|b)'], 0)],
    tipps: ['Ein Wort muss mit a beginnen, mit d enden, und dazwischen dürfen nur b und c stehen – auch gar keins.', 'Länge 4: a _ _ d, für jede Lücke b oder c.', 'Der Teil (b|c)* wird im Automaten eine Schleife: Ein Zustand bleibt bei b und c in sich selbst.'] }),
  AUTO({ id: 'gc4', kapitel: 92, sortArt: 'funktion', ico: '🐍', titel: 'Ein DEA in Python', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Der Automat als Dictionary',
    tabelle: () => ({ html: auBild(`${svgAutomat(AU_AB)}<pre class="mono dscode">delta = {"s": {"a": "p", "b": "s"},\n         "p": {"a": "p", "b": "e"},\n         "e": {"a": "p", "b": "s"}}\nstart = "s"\nende = ["e"]</pre>`) }),
    ziel: 'Schreib akzeptiert(delta, start, ende, wort): Spiel das Wort durch den Automaten. Fehlt ein Übergang, wird verworfen (False).',
    vorspann: `AB = ${py(AU_AB.delta)}\nTEIL = {"s": {"a": "p"}, "p": {"b": "e"}, "e": {}}\n`,
    listen: [[], [], [], [], [], []], aufrufFn: (l, k) => ['akzeptiert(AB, "s", ["e"], "baab")', 'akzeptiert(AB, "s", ["e"], "aba")', 'akzeptiert(AB, "s", ["e"], "")', 'akzeptiert(TEIL, "s", ["e"], "ab")', 'akzeptiert(TEIL, "s", ["e"], "abb")', 'akzeptiert(TEIL, "s", ["e"], "b")'][k],
    soll: (l, k) => [true, false, false, true, false, false][k], testName: (k) => ['baab', 'aba', 'leeres Wort', 'unvollständig: ab', 'unvollständig: abb', 'unvollständig: b'][k],
    befehle: [K_B('def akzeptiert(delta, start, ende, wort):'), K_B('not in')],
    tipps: ['zustand = start, dann für jedes Zeichen: zustand = delta[zustand][zeichen]', 'Vorher prüfen: if zeichen not in delta[zustand]: return False', 'Am Ende: return zustand in ende'],
    loesung: 'def akzeptiert(delta, start, ende, wort):\n    zustand = start\n    for zeichen in wort:\n        if zeichen not in delta[zustand]:\n            return False\n        zustand = delta[zustand][zeichen]\n    return zustand in ende' }),
  AFRAGEN({ id: 'gc5', kapitel: 92, knobel: true, ico: '🧮', titel: 'Durch 3 teilbar', lohn: 90,
    ziel: 'Das Rechenwerk am Südtor liest Binärzahlen (Ziffer für Ziffer, vorne beginnend) und öffnet bei Zahlen, die durch 3 teilbar sind. Bau den DEA – die Zustände sind die Reste 0, 1, 2.',
    fragen: [{ art: 'automat', text: 'Binärzahl durch 3 teilbar (das leere Wort zählt als 0). Zustand = bisheriger Rest.', zustaende: ['r0', 'r1', 'r2'], alphabet: ['0', '1'], ziel: (w) => binWert(w) % 3 === 0, maxLaenge: 8, beispiel: '110',
      loesung: { ende: ['r0'], delta: { r0: { 0: 'r0', 1: 'r1' }, r1: { 0: 'r2', 1: 'r0' }, r2: { 0: 'r1', 1: 'r2' } } } }],
    tipps: ['Eine Ziffer hinten anhängen heißt: neuer Wert = 2 · alter Wert + Ziffer.', 'Also neuer Rest = (2 · alter Rest + Ziffer) mod 3. Von r1 mit 0: 2 → r2.'] }),

  // --- Kapitel 93: 🌫️ NEA und Potenzmengenkonstruktion (Kurs 6.9, 6.10) ---
  AFRAGEN({ id: 'gd1', kapitel: 93, ico: '🌫️', titel: 'Der unentschlossene Automat', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'NEA: beginnt und endet mit 1',
    tabelle: () => ({ html: auBild(`<pre class="mono dscode">δ(q0, 1) = {q1, q2}\nδ(q1, 0) = {q1}\nδ(q1, 1) = {q1, q2}\nStart q0, Endzustand q2</pre>`) }),
    ziel: 'Ein NEA darf bei einem Zeichen mehrere Folgezustände haben – oder keinen.',
    merke: { titel: '🌫️ NEA', text: 'Ein nichtdeterministischer endlicher Automat kann bei einem Zeichen in mehrere Zustände wechseln (oder in keinen). Er akzeptiert, wenn es MINDESTENS EINEN Weg gibt, der in einem Endzustand endet. Man verfolgt dazu die Menge aller Zustände, in denen er gerade sein kann. NEA sind oft leichter zu entwerfen; jeder NEA lässt sich in einen gleichwertigen DEA umwandeln (Potenzmengenkonstruktion).' },
    fragen: [W('In welcher Menge von Zuständen ist der NEA nach dem Zeichen 1?', ['{q0, q1}', '{q1}', '{q1, q2}', '{q0, q2}'], 2),
      W('Und nach 10?', ['{q1}', '{q1, q2}', '∅', '{q0, q1}'], 0),
      W('Wird 101 akzeptiert?', ['ja, q2 ist nach 101 in der Menge', 'nein, nach 10 bleibt nur noch q1 übrig', 'nur, wenn der NEA richtig rät', 'nein, ein NEA braucht einen DEA dafür'], 0),
      W('Was passiert beim Wort 0?', ['es wird akzeptiert, weil q0 bleibt', 'q0 hat keinen 0-Übergang – die Menge wird leer, verworfen', 'der NEA wählt zufällig einen Weg', 'er bleibt in q0 und wartet'], 1)],
    tipps: ['Bei 1 aus q1: q1 oder q2 – beide merken.'] }),
  AUTO({ id: 'gd2', kapitel: 93, sortArt: 'funktion', ico: '👣', titel: 'Viele Wege gleichzeitig', lohn: 80,
    ziel: 'Schreib nea_akzeptiert(delta, start, ende, wort): delta[zustand][zeichen] ist eine LISTE von Folgezuständen (fehlt der Eintrag: keine). Verfolge die Liste aller möglichen Zustände; akzeptiert, wenn am Ende einer davon ein Endzustand ist.',
    vorspann: 'NEA = {"q0": {"1": ["q1", "q2"]}, "q1": {"0": ["q1"], "1": ["q1", "q2"]}, "q2": {}}\nVORLETZT = {"s0": {"A": ["s0", "s1"], "B": ["s0"]}, "s1": {"A": ["s2"], "B": ["s2"]}, "s2": {}}\n',
    listen: [[], [], [], [], [], []], aufrufFn: (l, k) => ['nea_akzeptiert(NEA, "q0", ["q2"], "101")', 'nea_akzeptiert(NEA, "q0", ["q2"], "10")', 'nea_akzeptiert(NEA, "q0", ["q2"], "0")', 'nea_akzeptiert(NEA, "q0", ["q2"], "1")', 'nea_akzeptiert(VORLETZT, "s0", ["s2"], "BBAB")', 'nea_akzeptiert(VORLETZT, "s0", ["s2"], "ABBA")'][k],
    soll: (l, k) => [true, false, false, true, true, false][k], testName: (k) => ['101', '10', '0', '1', 'BBAB (vorletztes A)', 'ABBA'][k],
    befehle: [K_B('def nea_akzeptiert(delta, start, ende, wort):'), K_B('.get(')],
    tipps: ['aktuell = [start]. Für jedes Zeichen eine neue Liste neu aus allen Folgezuständen aller Zustände in aktuell.', 'delta[z].get(zeichen, []) liefert die Folgezustände oder eine leere Liste.', 'Am Ende: Ist irgendein Zustand aus aktuell in ende?'],
    loesung: 'def nea_akzeptiert(delta, start, ende, wort):\n    aktuell = [start]\n    for zeichen in wort:\n        neu = []\n        for z in aktuell:\n            for t in delta[z].get(zeichen, []):\n                if t not in neu:\n                    neu.append(t)\n        aktuell = neu\n    for z in aktuell:\n        if z in ende:\n            return True\n    return False' }),
  AFRAGEN({ id: 'gd3', kapitel: 93, ico: '🧺', titel: 'Potenzmengenkonstruktion', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Vom NEA zum DEA',
    tabelle: () => ({ html: auBild(`<pre class="mono dscode">NEA: δ(q0, 1) = {q1, q2}, δ(q1, 0) = {q1}, δ(q1, 1) = {q1, q2}\nStart q0, Ende q2</pre><div class="dbtab"><div class="dbscroll"><table><tr><th>DEA-Zustand</th><th>mit 0</th><th>mit 1</th></tr><tr><th>→ {q0}</th><td>?</td><td>{q1, q2}</td></tr><tr><th>{q1, q2}</th><td>{q1}</td><td>?</td></tr><tr><th>{q1}</th><td>{q1}</td><td>{q1, q2}</td></tr><tr><th>∅</th><td>∅</td><td>∅</td></tr></table></div></div>`) }),
    ziel: 'Ergänze die Tabelle der Potenzmengenkonstruktion im Kopf.',
    fragen: [W('Welcher DEA-Zustand steht bei {q0} mit 0?', ['{q0}', '∅ – der Fangzustand', '{q1}', '{q1, q2}'], 1),
      W('Welcher DEA-Zustand steht bei {q1, q2} mit 1?', ['{q1, q2}', '{q2}', '{q0, q1}', '{q1}'], 0),
      { art: 'zahl', text: 'Wie viele Zustände hat der DEA?', soll: () => 4 },
      W('Welche DEA-Zustände sind Endzustände?', ['nur der Start {q0}', 'alle, die q2 enthalten – hier {q1, q2}', 'alle, die q1 enthalten', 'nur der Fangzustand ∅'], 1),
      W('Wie viele Zustände kann der DEA zu einem NEA mit n Zuständen höchstens haben?', ['n', '2n', '2ⁿ – alle Teilmengen', 'n²'], 2)],
    tipps: ['Folgemenge = Vereinigung der Folgezustände aller Zustände in der Menge.'] }),
  AFRAGEN({ id: 'gd5', kapitel: 93, ico: '🧺', titel: 'Potenzmengen-Baukasten', lohn: 85, ansicht: 'tabelle', titelAnsicht: 'NEA: Wörter, die ab enthalten',
    tabelle: () => ({ html: auBild(`<div class="dbtab"><div class="dbscroll"><table><tr><th>δ</th><th>a</th><th>b</th></tr><tr><th>→ q0</th><td>{q0, q1}</td><td>{q0}</td></tr><tr><th>q1</th><td>∅</td><td>{q2}</td></tr><tr><th>q2 (Ende)</th><td>{q2}</td><td>{q2}</td></tr></table></div></div>
      <p class="hinweis">Diesmal ist keine Tabelle vorgegeben: Du bildest die Mengen selbst – Zeile für Zeile.</p>`) }),
    ziel: 'Wandle den NEA mit der Potenzmengenkonstruktion selbst in einen DEA um: erst die Folgemengen ausrechnen, dann den DEA bauen.',
    merke: { titel: '🧺 Potenzmengenkonstruktion', text: '1. Der Startzustand des DEA ist die Menge {Start des NEA}. 2. Für jede neue Menge und jedes Zeichen: Folgemenge = alle Zustände, die man von irgendeinem Element der Menge mit diesem Zeichen erreicht. 3. Wiederholen, bis keine neue Menge mehr entsteht. Endzustände sind alle Mengen, die einen Endzustand des NEA enthalten.' },
    fragen: [{ art: 'liste', menge: true, text: 'Start {q0}: Welche Menge erreicht der DEA mit a? (Zustände ohne Klammern, z. B. q0 q2)', soll: () => AU_folge(['q0'], 'a') },
      { art: 'liste', menge: true, text: 'Neue Zeile {q0, q1}: Welche Menge erreicht der DEA mit b?', soll: () => AU_folge(['q0', 'q1'], 'b') },
      { art: 'liste', menge: true, text: 'Neue Zeile {q0, q2}: Welche Menge erreicht der DEA mit a?', soll: () => AU_folge(['q0', 'q2'], 'a') },
      { art: 'zahl', text: 'Wie viele Zustände hat der fertige DEA (nur erreichbare Mengen)?', soll: () => 4 },
      { art: 'automat', text: 'Bau jetzt den DEA. A = {q0}, B = {q0, q1}, C = {q0, q2}, D = {q0, q1, q2}. Trag für jede Menge die Folgemenge ein und kreuz die Endzustände an.', zustaende: ['A', 'B', 'C', 'D'], alphabet: ['a', 'b'], ziel: (w) => w.includes('ab'), maxLaenge: 6, beispiel: 'babb',
        loesung: { ende: ['C', 'D'], delta: { A: { a: 'B', b: 'A' }, B: { a: 'B', b: 'C' }, C: { a: 'D', b: 'C' }, D: { a: 'D', b: 'C' } } } }],
    tipps: ['Aus q0 mit a: q0 oder q1. q1 hat mit a keinen Übergang – er trägt nichts bei.', 'Folgemenge einer Menge = Vereinigung der Folgemengen aller ihrer Elemente. Schau für jedes Element einzeln in die NEA-Tabelle.', 'Endzustände des DEA sind alle Mengen, die einen Endzustand des NEA enthalten.'] }),
  AFRAGEN({ id: 'gd4', kapitel: 93, ico: '🔎', titel: 'Das vorletzte Zeichen', lohn: 80,
    ziel: 'Der NEA dafür ist leicht – jetzt der DEA: Wörter über {A, B}, deren VORLETZTES Zeichen ein A ist. Die Zustände merken sich die letzten beiden Zeichen.',
    fragen: [{ art: 'automat', text: 'Vorletztes Zeichen A. Zustand = die letzten beiden gelesenen Zeichen (am Anfang als B gedacht).', zustaende: ['BB', 'BA', 'AB', 'AA'], alphabet: ['A', 'B'], ziel: (w) => w.length >= 2 && w[w.length - 2] === 'A', maxLaenge: 6, beispiel: 'BAB',
      loesung: { ende: ['AB', 'AA'], delta: { BB: { A: 'BA', B: 'BB' }, BA: { A: 'AA', B: 'AB' }, AB: { A: 'BA', B: 'BB' }, AA: { A: 'AA', B: 'AB' } } } }],
    tipps: ['Liest der Automat ein neues Zeichen, fällt das ältere der beiden gemerkten Zeichen heraus, und das neue kommt hinten dazu.', 'Welcher Teil des Zustandsnamens ist nach dem letzten Zeichen das vorletzte Zeichen? Danach richten sich die Endzustände.'] }),

  // --- Kapitel 94: 🧱 Grenzen (Kurs 6.13) ---
  AFRAGEN({ id: 'ge1', kapitel: 94, ico: '🧱', titel: 'Was kein Automat schafft', lohn: 65,
    ziel: 'Welche Sprachen sind regulär – und welche brauchen mehr Speicher?',
    merke: { titel: '🧱 Grenzen endlicher Automaten', text: 'Endliche Automaten haben nur endlich viele Zustände – sie können nicht unbeschränkt zählen. Zählen modulo einer festen Zahl geht („gerade Anzahl a“), aber { aⁿbⁿ }, korrekt geklammerte Ausdrücke oder Palindrome sind nicht regulär. Dafür braucht man einen Kellerautomaten mit Stapelspeicher (Typ 2).' },
    fragen: [W('Gerade Anzahl a:', RG_WAHL, 0),
      W('{ aⁿbⁿ | n ≥ 1 } (gleich viele a wie b, erst alle a):', RG_WAHL, 1),
      W('Binärzahlen, die durch 3 teilbar sind:', RG_WAHL, 0),
      W('Korrekt geklammerte Ausdrücke wie (()(())):', RG_WAHL, 1),
      W('Warum scheitert ein DEA an { aⁿbⁿ }?', ['er kann ein b nach den a nicht mehr lesen', 'er müsste sich beliebig viele a merken – dafür reichen endlich viele Zustände nicht', 'er bräuchte mehr als einen Endzustand', 'er scheitert nicht, zwei Zustände reichen'], 1)],
    tipps: ['Muss man bis beliebig hoch zählen? Dann nicht regulär.'] }),
  AFRAGEN({ id: 'ge3', kapitel: 94, ico: '🎈', titel: 'Das Pumping-Lemma', lohn: 85, ansicht: 'tabelle', titelAnsicht: 'DEA: Wörter, die auf ab enden (3 Zustände)',
    tabelle: () => ({ html: auBild(`${svgAutomat(AU_AB)}<p class="hinweis">Liest ein DEA mit 3 Zuständen ein Wort mit mindestens 3 Zeichen, muss er einen Zustand zweimal besuchen.</p>`) }),
    ziel: 'Erst siehst du am Automaten, warum man Wörter „aufpumpen“ kann. Dann nutzt du das, um zu zeigen, dass { aⁿbⁿ } nicht regulär ist.',
    merke: { titel: '🎈 Pumping-Lemma', text: 'Ist L regulär, gibt es eine Zahl n (z. B. die Zustandszahl eines DEA für L), sodass jedes Wort z ∈ L mit |z| ≥ n zerlegt werden kann in z = u v w mit |uv| ≤ n, |v| ≥ 1 und u vⁱ w ∈ L für alle i ≥ 0. Grund: Nach n Zeichen hat der DEA einen Zustand doppelt besucht – die Schleife dazwischen (v) kann er beliebig oft oder gar nicht durchlaufen. Um zu zeigen, dass L nicht regulär ist, wählt man ein passendes z und zeigt: Für jede erlaubte Zerlegung fällt ein u vⁱ w aus L heraus.' },
    fragen: [{ art: 'liste', text: 'Welche Zustände durchläuft der DEA beim Wort abab (mit dem Start)?', soll: () => automatLauf(AU_AB, 'abab').weg },
      { art: 'liste', text: 'Welcher Zustand wird als Erster zum zweiten Mal erreicht?', soll: () => ['p'] },
      { art: 'liste', text: 'u = gelesen bis zum ersten Besuch dieses Zustands, v = gelesen zwischen den beiden Besuchen, w = der Rest. Gib u, v und w an (mit Leerzeichen).', soll: () => ['a', 'ba', 'b'] },
      { art: 'liste', text: 'Pumpe mit i = 3: Wie lautet u v v v w?', soll: () => ['a' + 'ba'.repeat(3) + 'b'] },
      { art: 'zahl', text: 'Jetzt { aⁿbⁿ } mit Pumping-Länge n = 3: z = aaabbb, eine erlaubte Zerlegung ist u = a, v = aa, w = abbb. Wie viele a hat u v⁰ w (also u w)?', soll: () => 2 },
      W('Warum besteht v bei JEDER erlaubten Zerlegung von z = aⁿbⁿ nur aus a?', ['Wegen |uv| ≤ n liegt v in den ersten n Zeichen – und die sind alle a', 'Weil v immer genau ein Zeichen lang sein muss und z mit a beginnt', 'Weil man die Zerlegung im Beweis frei wählen und so festlegen darf', 'Weil w immer mit b beginnt und deshalb alle a vorher stehen müssen'], 0),
      W('Malte will zeigen, dass L = { aᵐbᵏ | m, k ≥ 0 } nicht regulär ist. Er nimmt z = aⁿbⁿ, u = aⁿ⁻¹, v = ab, w = bⁿ⁻¹ – u v v w enthält „…abab…“ und liegt nicht in L. Wo liegt der Fehler?', ['|uv| = n + 1 > n: Die Zerlegung ist nicht erlaubt – und L ist sogar regulär (a*b*)', 'v darf nur aus einem einzigen Zeichen bestehen, ab ist zu lang', 'Er hätte i = 0 wählen müssen, i = 2 ist beim Pumpen nicht erlaubt', 'Kein Fehler: Der Beweis zeigt richtig, dass L nicht regulär ist'], 0)],
    tipps: ['s –a→ p –b→ e –a→ p –b→ e: p kommt zweimal vor.', 'Bis zum ersten p wurde „a“ gelesen, zwischen den beiden p „ba“, danach „b“.', 'Bei aaabbb ist |uv| ≤ 3: u und v liegen ganz im a-Block. Ohne v fehlen a – das Wort hat dann weniger a als b.'] }),
  AUTO({ id: 'ge2', kapitel: 94, sortArt: 'funktion', ico: '📚', titel: 'Der Kellerautomat', lohn: 80,
    ziel: 'Schreib anbn(wort) wie ein Kellerautomat: Für jedes a legst du etwas auf einen Stapel, für jedes b nimmst du eins herunter. True genau für aⁿbⁿ mit n ≥ 1 (erst alle a, dann gleich viele b).',
    listen: ANBN_TESTS.map(() => []), aufrufFn: (l, k) => `anbn("${ANBN_TESTS[k]}")`, soll: (l, k) => /^(a+)(b+)$/.test(ANBN_TESTS[k]) && ANBN_TESTS[k].split('a').length - 1 === ANBN_TESTS[k].split('b').length - 1, testName: (k) => `„${ANBN_TESTS[k] || 'ε'}“`,
    befehle: [K_B('def anbn(wort):'), K_B('.append('), K_B('.pop()')],
    merke: { titel: '📚 Kellerautomat', text: 'Ein Kellerautomat ist ein endlicher Automat mit einem Stapelspeicher (Keller). Er kann sich beliebig viel merken, aber nur oben zugreifen (LIFO). Damit erkennt er kontextfreie Sprachen wie { aⁿbⁿ } oder korrekt geklammerte Ausdrücke – und Compiler prüfen so die Klammern und Blöcke eines Programms.' },
    tipps: ['Ein a nach einem b ist verboten (abab).', 'Bei b: ist der Stapel leer, gibt es zu viele b → False.', 'Am Ende muss der Stapel leer sein UND es muss mindestens ein a gegeben haben.'],
    loesung: 'def anbn(wort):\n    stapel = []\n    b_gesehen = False\n    for z in wort:\n        if z == "a":\n            if b_gesehen:\n                return False\n            stapel.append("a")\n        elif z == "b":\n            b_gesehen = True\n            if len(stapel) == 0:\n                return False\n            stapel.pop()\n        else:\n            return False\n    return b_gesehen and len(stapel) == 0' }),

  // --- Kapitel 95: ⚙️ Wie ein Compiler liest (Kurs 6.14) ---
  AFRAGEN({ id: 'gf1', kapitel: 95, ico: '⚙️', titel: 'Vom Quelltext zum Programm', lohn: 60,
    ziel: 'Die Phasen eines Compilers – und wo Automaten und Grammatiken stecken.',
    merke: { titel: '⚙️ Compiler', text: 'Ein Compiler übersetzt in Phasen: Die lexikalische Analyse (Scanner) zerlegt den Text in Tokens – dafür genügen endliche Automaten. Die Syntaxanalyse (Parser) prüft mit einer kontextfreien Grammatik, ob die Tokens einen gültigen Programmaufbau ergeben, und baut einen Syntaxbaum. Danach folgen semantische Analyse (Typen, Namen) und Codeerzeugung.' },
    fragen: [W('In welcher Reihenfolge arbeitet ein Compiler?', ['Parser → Scanner → semantische Analyse → Codeerzeugung', 'Scanner → Parser → semantische Analyse → Codeerzeugung', 'Scanner → semantische Analyse → Parser → Codeerzeugung', 'Parser → semantische Analyse → Scanner → Codeerzeugung'], 1),
      W('„x = 12 + y3“ wird zu x, =, 12, +, y3. Das macht …', ['der Parser (Syntaxanalyse)', 'der Scanner (lexikalische Analyse)', 'die semantische Analyse (Typen, Namen)', 'die Codeerzeugung (Übersetzung)'], 1),
      W('„print(x“ – die Klammer ist nicht geschlossen. Wer findet den Fehler?', ['der Scanner (lexikalische Analyse)', 'der Parser (Syntaxanalyse) – mit der kontextfreien Grammatik', 'die semantische Analyse (Typen, Namen)', 'die Codeerzeugung beim Übersetzen'], 1),
      W('Python meldet „name y is not defined“. Welche Phase?', ['lexikalische Analyse (Scanner)', 'semantisch bzw. zur Laufzeit – syntaktisch war alles korrekt', 'Syntaxanalyse (Parser)', 'Codeerzeugung (Übersetzung)'], 1)],
    tipps: ['Erst Wörter erkennen, dann Satzbau, dann Bedeutung.'] }),
  AFRAGEN({ id: 'gf1b', kapitel: 95, ico: '📒', titel: 'Interpreter und Symboltabelle', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Programm am Kassenhaus',
    tabelle: () => ({ html: auBild('<pre class="mono dscode">1  preis = 12\n2  menge = 3\n3  summe = preis * menge\n4  rabat = 2\n5  gesamt = summe - rabatt\n6  print(gesamt)</pre>') }),
    ziel: 'Was passiert mit einem Fehler, der erst in der Bedeutung steckt – beim Compiler und beim Interpreter?',
    merke: { titel: '📒 Interpreter und Symboltabelle', text: 'Ein Compiler übersetzt das ganze Programm, bevor es läuft. Ein Interpreter (wie Python) übersetzt und führt Anweisung für Anweisung aus – ein Fehler in einer späten Zeile fällt erst auf, wenn sie an der Reihe ist. Die semantische Analyse führt eine Symboltabelle: Jeder festgelegte Name wird eingetragen, und wird ein Name benutzt, der dort fehlt, gibt es einen Fehler. Eine kontextfreie Grammatik kann das nicht prüfen, weil es davon abhängt, was weiter oben im Programm steht.' },
    fragen: [{ art: 'zahl', text: 'In welcher Zeile meldet die semantische Analyse einen Fehler?', soll: () => 5 },
      { art: 'liste', text: 'Welche Namen stehen in der Symboltabelle, wenn Zeile 5 geprüft wird? (in der Reihenfolge, in der sie eingetragen wurden)', soll: () => ['preis', 'menge', 'summe', 'rabat'] },
      W('Ein Programm benutzt in Zeile 900 einen Namen, der nirgends festgelegt wurde. Was passiert?', ['Compiler: Meldung vor dem Start · Interpreter: Zeilen 1–899 laufen, dann Abbruch', 'Compiler und Interpreter: Zeilen 1–899 laufen, der Abbruch kommt erst bei Zeile 900', 'Compiler: Zeilen 1–899 laufen, dann Abbruch · Interpreter: Meldung schon vor dem Start', 'Compiler und Interpreter: Meldung schon vor dem Start, Zeile 1 läuft gar nicht erst'], 0),
      W('Warum findet der Parser den Fehler in Zeile 5 nicht?', ['Die Zeile passt zur Grammatik (Name = Name - Name) – ob rabatt festgelegt ist, hängt vom Kontext ab', 'Der Parser liest nur Zahlen und Rechenzeichen, Namen überspringt er beim Prüfen', 'Der Parser findet ihn doch, weil die Grammatik alle Namen des Programms kennt', 'Der Scanner hat rabatt schon vorher in zwei Tokens zerlegt und so versteckt'], 0)],
    tipps: ['Lies genau: In Zeile 4 steht ein anderer Name als in Zeile 5.', 'In die Symboltabelle kommt ein Name, wenn ihm ein Wert zugewiesen wird.'] }),
  AUTO({ id: 'gf2', kapitel: 95, sortArt: 'funktion', knobel: true, ico: '🔍', titel: 'Ein kleiner Scanner', lohn: 95,
    ziel: 'Schreib tokens(text): Zerlege den Text in Tokens – Zahlen (Ziffernfolgen), Namen (beginnen mit Buchstabe, dann Buchstaben oder Ziffern) und einzelne Zeichen aus + - * / = ( ). Leerzeichen trennen nur. Rückgabe: Liste der Tokens als Texte.',
    listen: TOKEN_TESTS.map(() => []), aufrufFn: (l, k) => `tokens("${TOKEN_TESTS[k][0]}")`, soll: (l, k) => TOKEN_TESTS[k][1], testName: (k) => `„${TOKEN_TESTS[k][0]}“`,
    tipps: ['Mit einem Index i durch den Text laufen. Ziffer? Dann so lange weiterlesen, wie Ziffern kommen – das ist ein Zustand des Automaten.', 'Buchstabe? Weiterlesen, solange Buchstaben oder Ziffern kommen.', 'Ein Zeichen aus "+-*/=()" ist allein ein Token, ein Leerzeichen wird übersprungen.'],
    loesung: 'def tokens(text):\n    aus = []\n    i = 0\n    while i < len(text):\n        z = text[i]\n        if z == " ":\n            i = i + 1\n        elif z.isdigit():\n            start = i\n            while i < len(text) and text[i].isdigit():\n                i = i + 1\n            aus.append(text[start:i])\n        elif z.isalpha():\n            start = i\n            while i < len(text) and (text[i].isalpha() or text[i].isdigit()):\n                i = i + 1\n            aus.append(text[start:i])\n        else:\n            aus.append(z)\n            i = i + 1\n    return aus' }),
);
// --- ⚙️ Bild für die Landkarte: Torhaus mit Zahnrad ---
function svgTorwerk(fertig) {
  return `<ellipse cx="0" cy="32" rx="44" ry="8" fill="rgba(0,0,0,.25)"/>
    <rect x="-34" y="-20" width="68" height="50" fill="#a7afc2" stroke="#5d6578" stroke-width="2"/>
    ${[-34, -20, -6, 8, 22].map((x) => `<rect x="${x}" y="-28" width="10" height="9" fill="#a7afc2" stroke="#5d6578" stroke-width="1"/>`).join('')}
    <path d="M-12,30 v-20 a12,12 0 0 1 24,0 v20 z" fill="#4a321c" stroke="#2c1d10" stroke-width="1.5"/>
    ${[-8, -2, 4, 10].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="30" stroke="#8a8a8a" stroke-width="1.5"/>`).join('')}
    <circle cx="22" cy="-36" r="10" fill="${fertig ? '#c9a030' : '#7a8a9a'}" stroke="#3a4a5a" stroke-width="2"/><circle cx="22" cy="-36" r="4" fill="#3a4a5a"/>
    <text x="-30" y="-34" style="font-size:12px">⚙️</text>`;
}
