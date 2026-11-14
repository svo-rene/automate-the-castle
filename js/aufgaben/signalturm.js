'use strict';
// --- 🔦 Signalturm: LK Technische Informatik (Burg 28, Lehrplan LB 1, OPAL-Kurs LK_INF_LB1 „Technische Informatik“) ---
// Der Signalturm funkt mit Lampen an (1) und aus (0). Signalwärterin Lumi erzählt.
// Neu: Fragen-Art 'wahrheit' (Wahrheitstabelle ausfüllen: Ergebniszellen antippen) und gezeichnete Schaltnetze (svgSchaltung).
// Ausdrücke als Baum: 'A' | ['not', x] | ['and', x, y] | ['or', x, y] | ['xor', x, y].

KAPITEL[100] = { name: 'Zahlen im Rechner', ico: '🔢' };
KAPITEL[101] = { name: 'Zeichen kodieren', ico: '🔤' };
KAPITEL[102] = { name: 'Boolesche Algebra', ico: '💡' };
KAPITEL[103] = { name: 'Schaltnetze und Addierer', ico: '🔌' };
KAPITEL[104] = { name: 'Der Rechner', ico: '🖥️' };
BURGEN[28] = { name: 'LK Technik', ico: '🔦', klasse: 'LK', region: 'signal', kapitel: [100, 101, 102, 103, 104],
  text: 'Leistungskurs: Binär- und Hexadezimalzahlen, Zweierkomplement, Festkomma, ASCII und UTF-8, boolesche Algebra, Normalformen, KV-Diagramme, Gatter, Halb- und Volladdierer, Von-Neumann-Rechner.' };

const SIGNAL = (a) => KORN({ warte: true, signal: true, zielArt: 'wert', funktion: null, sprache: [...S_LK, 'krypto'], ...a });
const SFRAGEN = (a) => SIGNAL({ sortArt: 'fragen', listen: [], ...a });
const siBild = (html) => `<div class="werkbild dsbild kbild">${html}</div>`;

// --- Ausdrücke ---
const ausWert = (e, env) => (typeof e === 'string' ? env[e] : e[0] === 'not' ? 1 - ausWert(e[1], env)
  : e[0] === 'and' ? ausWert(e[1], env) & ausWert(e[2], env) : e[0] === 'or' ? ausWert(e[1], env) | ausWert(e[2], env) : ausWert(e[1], env) ^ ausWert(e[2], env));
const ausText = (e, innen = false) => {
  if (typeof e === 'string') return e;
  if (e[0] === 'not') return `¬${ausText(e[1], true)}`;
  const t = `${ausText(e[1], true)} ${{ and: '∧', or: '∨', xor: '⊕' }[e[0]]} ${ausText(e[2], true)}`;
  return innen ? `(${t})` : t;
};
// alle Belegungen der Variablen (erste Variable ist das höchste Bit, wie in der Wahrheitstabelle üblich)
const belegungen = (vars) => [...Array(2 ** vars.length)].map((_, k) => Object.fromEntries(vars.map((v, i) => [v, (k >> (vars.length - 1 - i)) & 1])));

// Schaltnetz zeichnen (Gatter nach DIN/IEC: & = UND, ≥1 = ODER, =1 = XOR, 1 mit Kreis = NICHT)
function svgSchaltung(e, ausgang = 'f') {
  const knoten = [];
  let zeile = 0;
  const bau = (n) => {
    if (typeof n === 'string') { const k = { blatt: n, x: 0, y: zeile++ }; knoten.push(k); return k; }
    const kinder = n.slice(1).map(bau), k = { art: n[0], kinder, x: Math.max(...kinder.map((c) => c.x)) + 1, y: kinder.reduce((s, c) => s + c.y, 0) / kinder.length };
    knoten.push(k);
    return k;
  };
  const wurzel = bau(e), dx = 92, dy = 40, W = (wurzel.x + 1) * dx + 70, Hh = Math.max(zeile, 1) * dy + 20;
  const X = (k) => 34 + k.x * dx, Y = (k) => 20 + k.y * dy;
  let s = '';
  for (const k of knoten) if (k.kinder) k.kinder.forEach((c, i) => {
    const x1 = c.blatt ? X(c) + 10 : X(c) + 22, y1 = Y(c), x2 = X(k) - 22, y2 = Y(k) + (k.kinder.length === 1 ? 0 : i === 0 ? -8 : 8), xm = (x1 + x2) / 2;
    s += `<path d="M${x1},${y1} H${xm} V${y2} H${x2}" fill="none" stroke="#3a4a6a" stroke-width="2"/>`;
  });
  s += `<path d="M${X(wurzel) + 22},${Y(wurzel)} H${X(wurzel) + 52}" stroke="#3a4a6a" stroke-width="2"/><text x="${X(wurzel) + 58}" y="${Y(wurzel) + 5}" font-size="14" font-weight="700" fill="#1a1408">${esc(ausgang)}</text>`;
  for (const k of knoten) {
    if (k.blatt) { s += `<text x="${X(k)}" y="${Y(k) + 5}" text-anchor="end" font-size="14" font-weight="700" fill="#1a1408">${esc(k.blatt)}</text><circle cx="${X(k) + 6}" cy="${Y(k)}" r="3" fill="#3a4a6a"/>`; continue; }
    s += `<rect x="${X(k) - 22}" y="${Y(k) - 17}" width="44" height="34" rx="3" fill="#fdf8e8" stroke="#1a1408" stroke-width="2"/><text x="${X(k)}" y="${Y(k) + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#1a1408">${{ and: '&amp;', or: '≥1', xor: '=1', not: '1' }[k.art]}</text>`;
    if (k.art === 'not') s += `<circle cx="${X(k) + 25}" cy="${Y(k)}" r="4" fill="#fdf8e8" stroke="#1a1408" stroke-width="2"/>`;
  }
  return `<svg class="dssvg" viewBox="0 0 ${W} ${Hh}" style="max-width:${W * 1.4}px">${s}</svg>`;
}

// --- Wahrheitstabellen-Baukasten (kornspeicher.js ruft diese Funktionen für Fragen mit art 'wahrheit') ---
function wahrheitStart(f) { KO.wt = belegungen(f.variablen).map(() => null); }
function wahrheitHtml(f) {
  return `<div class="dbtab wtab"><div class="dbscroll"><table><tr>${f.variablen.map((v) => `<th>${esc(v)}</th>`).join('')}<th class="wtziel">${esc(f.spalte || 'f')}</th></tr>
    ${belegungen(f.variablen).map((b, i) => `<tr>${f.variablen.map((v) => `<td>${b[v]}</td>`).join('')}<td class="wtzelle" data-wt="${i}">${KO.wt[i] ?? '?'}</td></tr>`).join('')}</table></div></div>
    <p class="hinweis">👆 Tippe die Felder der letzten Spalte an: ? → 0 → 1 → 0 …</p>`;
}
function wahrheitKlicks() {
  for (const td of document.querySelectorAll('[data-wt]')) td.onclick = () => {
    const i = +td.dataset.wt;
    KO.wt[i] = KO.wt[i] === 0 ? 1 : 0;
    td.textContent = KO.wt[i];
    td.classList.remove('falsch');
  };
}
function wahrheitPruefen(f) {
  if (KO.wt.some((x) => x === null)) { toast('Füll erst alle Felder aus (antippen).'); return null; }
  const bs = belegungen(f.variablen), falsch = bs.map((b, i) => (KO.wt[i] !== f.ziel(b) ? i : -1)).filter((i) => i >= 0);
  for (const td of document.querySelectorAll('[data-wt]')) td.classList.toggle('falsch', falsch.includes(+td.dataset.wt));
  if (!falsch.length) return true;
  log(`❌ ${falsch.length} ${falsch.length === 1 ? 'Zeile stimmt' : 'Zeilen stimmen'} noch nicht (rot markiert).`, 'err');
  return false;
}
const wahrheitLoesung = (f) => `<div class="dbtab"><div class="dbscroll"><table><tr>${f.variablen.map((v) => `<th>${esc(v)}</th>`).join('')}<th>${esc(f.spalte || 'f')}</th></tr>
  ${belegungen(f.variablen).map((b) => `<tr>${f.variablen.map((v) => `<td>${b[v]}</td>`).join('')}<td><b>${f.ziel(b)}</b></td></tr>`).join('')}</table></div></div>`;
const WT = (text, variablen, e, extra = {}) => ({ art: 'wahrheit', text, variablen, ziel: (b) => ausWert(e, b), ...extra });

// --- Referenzen in JS ---
const dezBin = (n) => n.toString(2);
const zk = (x, bits) => ((x + 2 ** bits) % 2 ** bits).toString(2).padStart(bits, '0');
const ausZk = (s) => (s[0] === '1' ? parseInt(s, 2) - 2 ** s.length : parseInt(s, 2));
function bruchBits(x, n) { let s = ''; for (let i = 0; i < n; i++) { x *= 2; if (x >= 1) { s += '1'; x -= 1; } else s += '0'; } return s; }
function addiere(a, b) {
  let c = 0, s = '';
  for (let i = a.length - 1; i >= 0; i--) { const t = +a[i] + +b[i] + c; s = (t % 2) + s; c = t >> 1; }
  return [s, c];
}
// Akkumulator-Maschine: Programm aus Texten, Speicher als Liste
function maschine(prog, sp) {
  const m = [...sp];
  let acc = 0, pc = 0, schritte = 0;
  while (pc < prog.length && schritte++ < 1000) {
    const [bef, arg] = prog[pc].split(' '), a = +arg;
    pc++;
    if (bef === 'LOAD') acc = m[a]; else if (bef === 'STORE') m[a] = acc; else if (bef === 'ADD') acc += m[a]; else if (bef === 'SUB') acc -= m[a];
    else if (bef === 'JMP') pc = a; else if (bef === 'JZ') { if (acc === 0) pc = a; } else if (bef === 'HLT') break;
  }
  return m;
}
const PROG_ADD = ['LOAD 0', 'ADD 1', 'STORE 2', 'HLT'];
// Summe n + (n-1) + … + 1: Speicher[0] = n, [1] = Summe, [2] = 1 (Konstante)
const PROG_SUMME = ['LOAD 0', 'JZ 9', 'ADD 1', 'STORE 1', 'LOAD 0', 'SUB 2', 'STORE 0', 'JMP 0', 'HLT', 'HLT'];
const MASCH_TESTS = [[PROG_ADD, [5, 7, 0, 0]], [PROG_SUMME, [4, 0, 1, 0]], [PROG_SUMME, [10, 0, 1, 0]], [['LOAD 1', 'SUB 0', 'STORE 3', 'HLT', 'STORE 2'], [9, 4, 0, 0]]];

// Akkumulator-Maschine wie im Kurs (4.1): HLT und OUT; liefert Ausgaben, Anzahl ausgeführter Befehle (HLT mitgezählt), Speicher
function SI_spur(prog, sp) {
  const m = [...sp], aus = [];
  let acc = 0, pc = 0, schritte = 0;
  while (pc < prog.length && schritte < 1000) {
    const [bef, arg] = prog[pc].split(' '), a = +arg;
    pc++; schritte++;
    if (bef === 'HLT') break;
    if (bef === 'LOAD') acc = m[a]; else if (bef === 'STORE') m[a] = acc; else if (bef === 'ADD') acc += m[a]; else if (bef === 'SUB') acc -= m[a];
    else if (bef === 'OUT') aus.push(acc); else if (bef === 'JMP') pc = a; else if (bef === 'JZ' && acc === 0) pc = a;
  }
  return { aus, schritte, m };
}
// Summe n + (n − 1) + … + 1 mit Ausgabe der Zwischensummen; Zelle 10 = n, 11 = Summe, 12 = 1
const SI_PROG = ['LOAD 11', 'ADD 10', 'STORE 11', 'OUT', 'LOAD 10', 'SUB 12', 'STORE 10', 'JZ 9', 'JMP 0', 'HLT'];
const SI_tag = () => (typeof P !== 'undefined' && P && P.tag) || 1;
const SI_heN = () => 3 + (SI_tag() % 3);   // 3, 4 oder 5 – jeden Tag anders
const SI_heSpur = () => SI_spur(SI_PROG, [...Array(10).fill(0), SI_heN(), 0, 1]);

// KDNF und KV: jeden Tag eine andere Funktion f(A, B, C), gegeben durch ihren kürzesten Ausdruck (+ plausible falsche)
const SI_KDNF = [
  { min: ['or', 'A', ['and', 'B', 'C']], falsch: [['or', ['and', 'A', 'B'], 'C'], ['and', 'A', ['or', 'B', 'C']], ['and', ['or', 'A', 'B'], 'C']] },
  { min: ['or', ['not', 'A'], ['and', 'B', 'C']], falsch: [['or', ['or', ['not', 'A'], 'B'], 'C'], ['and', ['not', 'A'], ['or', 'B', 'C']], ['or', ['and', ['not', 'A'], 'B'], 'C']] },
  { min: ['or', ['and', ['not', 'A'], 'C'], ['and', ['not', 'B'], 'C']], falsch: [['or', ['and', 'A', 'C'], ['and', 'B', 'C']], ['or', ['and', ['not', 'A'], ['not', 'B']], 'C'], ['or', ['and', ['not', 'A'], 'B'], ['and', ['not', 'B'], 'C']]] },
  { min: ['or', ['and', ['not', 'A'], 'B'], ['and', 'B', ['not', 'C']]], falsch: [['or', ['and', 'A', 'B'], ['and', 'B', 'C']], ['or', ['not', 'A'], ['and', 'B', ['not', 'C']]], ['or', ['and', ['not', 'A'], ['not', 'C']], 'B']] },
  { min: ['or', ['and', ['not', 'B'], ['not', 'C']], ['and', 'A', ['not', 'B']]], falsch: [['or', ['and', 'B', 'C'], ['and', ['not', 'A'], 'B']], ['and', ['not', 'B'], ['not', 'C']], ['or', ['and', ['not', 'B'], 'C'], ['and', 'A', 'B']]] },
  { min: ['or', ['or', ['and', 'A', 'B'], ['and', 'A', 'C']], ['and', 'B', 'C']], falsch: [['and', ['or', 'A', 'B'], 'C'], ['or', ['and', 'A', 'B'], 'C'], ['or', ['or', ['and', 'A', 'B'], ['and', 'A', 'C']], ['and', ['not', 'B'], 'C']]] },
  { min: ['or', ['and', ['not', 'B'], 'C'], ['and', 'B', ['not', 'C']]], falsch: [['or', ['and', ['not', 'A'], 'C'], ['and', 'A', ['not', 'C']]], ['or', ['and', 'B', 'C'], ['and', ['not', 'B'], ['not', 'C']]], ['or', 'B', 'C']] },
  { min: ['or', ['not', 'C'], ['and', 'A', 'B']], falsch: [['or', 'C', ['and', 'A', 'B']], ['and', ['not', 'C'], ['or', 'A', 'B']], ['or', ['and', ['not', 'C'], 'A'], 'B']] },
];
const SI_fall = () => SI_KDNF[SI_tag() % SI_KDNF.length];
const SI_ABC = ['A', 'B', 'C'];
const SI_minterme = (f) => belegungen(SI_ABC).filter((b) => ausWert(f.min, b)).map((b) => SI_ABC.map((v) => b[v]).join(''));
const SI_terme = (e) => (typeof e !== 'string' && e[0] === 'or' ? SI_terme(e[1]) + SI_terme(e[2]) : 1);

// --- Eingetippte Ausdrücke lesen (hd7k, hd6): ¬ ∧ ∨ oder not/and/or, auch ! & | * +; Ergebnis = Baum wie oben oder null ---
function SI_formel(text, vars) {
  const t = String(text ?? '').replace(/¬|!/g, ' not ').replace(/∧|&&?|\*|·/g, ' and ').replace(/∨|\|\|?|\+/g, ' or ')
    .replace(/\bnicht\b/gi, ' not ').replace(/\bund\b/gi, ' and ').replace(/\boder\b/gi, ' or ');
  const tok = t.match(/\(|\)|[A-Za-z_]\w*|\S/g) || [], VAR = new Map(vars.map((v) => [v.toLowerCase(), v]));
  let i = 0;
  const ist = (w) => tok[i] && tok[i].toLowerCase() === w;
  const atom = () => {
    const x = tok[i++];
    if (x === '(') { const e = oder(); if (tok[i++] !== ')') throw new Error('Klammer'); return e; }
    if (x && x.toLowerCase() === 'not') return ['not', atom()];
    if (x && VAR.has(x.toLowerCase())) return VAR.get(x.toLowerCase());
    throw new Error('Zeichen');
  };
  const und = () => { let e = atom(); while (ist('and')) { i++; e = ['and', e, atom()]; } return e; };
  const oder = () => { let e = und(); while (ist('or')) { i++; e = ['or', e, und()]; } return e; };
  try { const e = oder(); return i === tok.length ? e : null; } catch (_) { return null; }
}
const SI_oderTeile = (e) => (typeof e !== 'string' && e[0] === 'or' ? [...SI_oderTeile(e[1]), ...SI_oderTeile(e[2])] : [e]);
const SI_undTeile = (e) => (typeof e !== 'string' && e[0] === 'and' ? [...SI_undTeile(e[1]), ...SI_undTeile(e[2])] : [e]);
const SI_blaetter = (e) => (typeof e === 'string' ? 1 : e.slice(1).reduce((s, x) => s + SI_blaetter(x), 0));
// erste Belegung, bei der zwei Ausdrücke verschieden sind (oder null)
const SI_unterschied = (e, f, vars) => belegungen(vars).find((b) => ausWert(e, b) !== ausWert(f, b)) || null;
// Ausdruck als Text für die Musterlösung: KDNF der heutigen Funktion
const SI_kdnfText = () => SI_minterme(SI_fall()).map((z) => `(${SI_ABC.map((v, i) => (z[i] === '1' ? v : '¬' + v)).join(' ∧ ')})`).join(' ∨ ');
// Prüfen eines eingetippten Ausdrucks: kdnf = true verlangt die Form der KDNF, sonst höchstens so viele Variablen-Vorkommen wie der kürzeste
function SI_ausdruckPruefen(w, kdnf) {
  const name = kdnf ? 'kdnf()' : 'kurz()', soll = SI_fall().min;
  if (typeof w !== 'string') return `${name} soll den Ausdruck als Text zurückgeben, z. B. return "(¬A ∧ B ∧ C) ∨ (A ∧ ¬B ∧ C)".`;
  const e = SI_formel(w, SI_ABC);
  if (!e) return `${name}: „${w}“ kann ich nicht lesen. Erlaubt sind A, B, C, Klammern und ¬ ∧ ∨ (oder not, and, or).`;
  if (kdnf) {
    const gesehen = new Set();
    for (const term of SI_oderTeile(e)) {
      const lit = SI_undTeile(term), namen = lit.map((x) => (typeof x === 'string' ? x : x[0] === 'not' && typeof x[1] === 'string' ? x[1] : null));
      if (namen.includes(null) || namen.length !== 3 || new Set(namen).size !== 3) return `kdnf(): „${ausText(term)}“ ist kein Minterm – jeder Minterm verknüpft A, B und C (jede genau einmal, negiert oder nicht) mit ∧.`;
      const key = SI_ABC.map((v) => (lit.includes(v) ? 1 : 0)).join('');
      if (gesehen.has(key)) return `kdnf(): Der Minterm „${ausText(term)}“ kommt doppelt vor.`;
      gesehen.add(key);
    }
  }
  const b = SI_unterschied(e, soll, SI_ABC);
  if (b) return `${name}: Bei A = ${b.A}, B = ${b.B}, C = ${b.C} liefert dein Ausdruck ${ausWert(e, b)}, laut Tabelle muss f = ${ausWert(soll, b)} sein.`;
  if (!kdnf && SI_blaetter(e) > SI_blaetter(soll)) return `kurz(): Gleichwertig ✓ – aber noch nicht der kürzeste: ${SI_blaetter(e)} Variablen-Vorkommen, es geht mit ${SI_blaetter(soll)}. Fasse im KV-Diagramm größere Blöcke zusammen.`;
  return null;
}
const SI_loesungK = () => `def kdnf():\n    return "${SI_kdnfText()}"\n\ndef kurz():\n    return "${ausText(SI_fall().min)}"`;
// 🪟 hd6: Schaltung zum Ausdruck im eigenen Code (return … in fenster) – oder null
function SI_eigeneSchaltung() {
  const src = typeof ED !== 'undefined' && ED && typeof ED.value === 'string' ? ED.value : '';
  const m = src.match(/def\s+fenster\s*\([^)]*\)\s*:\s*\n\s*return\s+(.+)/);
  return m ? SI_formel(m[1].replace(/#.*$/, ''), ['w', 'l', 'r', 's']) : null;
}

const E_ABC = ['and', 'A', ['or', 'B', 'C']];
const E_SCHALT = ['or', ['and', 'A', ['not', 'B']], ['and', 'B', 'C']];
const E_ALARM = ['or', ['and', 'T', 'F'], ['and', 'T', ['not', 'F']]];

HOEFE.push(
  // --- Kapitel 100: 🔢 Zahlen im Rechner (Kurs 1.1–1.3) ---
  SFRAGEN({ id: 'ha1', kapitel: 100, ico: '🔢', titel: 'Lampen am Signalturm', lohn: 55, ansicht: 'tabelle', titelAnsicht: 'Acht Lampen = ein Byte',
    tabelle: () => ({ html: siBild(`<div class="dbtab"><div class="dbscroll"><table><tr><th>Stellenwert</th>${[128, 64, 32, 16, 8, 4, 2, 1].map((w) => `<td>${w}</td>`).join('')}</tr><tr><th>Lampe</th>${[...'01001101'].map((b) => `<td>${b === '1' ? '💡' : '⚫'}</td>`).join('')}</tr></table></div></div>`) }),
    ziel: 'Binär, dezimal, hexadezimal – lies und rechne um.',
    story: 'Willkommen im Signalturm! Nachts funken wir mit acht Lampen zur Nachbarburg: an heißt 1, aus heißt 0. Genau so speichert auch jeder Computer alles – Zahlen, Buchstaben, Bilder – als Bits.',
    merke: { titel: '🔢 Stellenwertsysteme', text: 'Im Binärsystem hat jede Stelle den doppelten Wert der rechten Nachbarstelle (1, 2, 4, 8 …). Dezimal → binär: fortlaufend durch 2 teilen, die Reste von unten nach oben lesen. Hexadezimal fasst je 4 Bit zu einer Ziffer 0–9, A–F zusammen: 1111 = F, 1010 1100 = AC.' },
    fragen: [{ art: 'zahl', text: 'Welche Dezimalzahl zeigen die Lampen (01001101)?', soll: () => 77 },
      { art: 'zahl', text: 'Wie viele verschiedene Werte kann man mit 8 Lampen funken?', soll: () => 256 },
      W('Welche Hexadezimalzahl ist 0100 1101?', ['4D', '77', 'D4', '4E'], 0),
      { art: 'zahl', text: 'Welche Dezimalzahl ist hexadezimal FF?', soll: () => 255 },
      W('Wie schreibt man 13 im Binärsystem?', ['1011', '1101', '1110', '0111'], 1)],
    tipps: ['64 + 8 + 4 + 1'] }),
  SIGNAL({ id: 'ha2', ohnebin: true, kapitel: 100, sortArt: 'funktion', ico: '🔁', titel: 'Umrechnen mit Python', lohn: 65,
    ziel: 'Schreib dez_zu_bin(n) (Divisionsrestverfahren, gibt einen Text aus 0 und 1 zurück; 0 → "0") und bin_zu_dez(text) (Stellenwerte addieren). Ohne bin() und int(…, 2)!',
    listen: [[], [], [], [], [], []], aufrufFn: (l, k) => ['dez_zu_bin(13)', 'dez_zu_bin(0)', 'dez_zu_bin(255)', 'bin_zu_dez("1101")', 'bin_zu_dez("01001101")', 'bin_zu_dez("0")'][k],
    soll: (l, k) => ['1101', '0', '11111111', 13, 77, 0][k], testName: (k) => ['13', '0', '255', '"1101"', '"01001101"', '"0"'][k],
    befehle: [K_B('def dez_zu_bin(n):'), K_B('def bin_zu_dez(text):'), K_B('while ¦:'), K_B('% 2'), K_B('// 2'), K_B('str(¦)'), K_B('int(¦)')],
    tipps: ['Den Rest beim Teilen durch 2 vorn an den Text hängen, dann n ganzzahlig durch 2 teilen – bis n 0 ist.', 'Sonderfall n = 0: Dann läuft die Schleife gar nicht – gib "0" zurück.', 'bin_zu_dez: von links lesen, den bisherigen Wert verdoppeln und die Ziffer addieren (Horner-Schema).'],
    loesung: 'def dez_zu_bin(n):\n    if n == 0:\n        return "0"\n    text = ""\n    while n > 0:\n        text = str(n % 2) + text\n        n = n // 2\n    return text\n\ndef bin_zu_dez(text):\n    wert = 0\n    for z in text:\n        wert = wert * 2 + int(z)\n    return wert' }),
  SIGNAL({ id: 'ha3', ohnebin: true, kapitel: 100, sortArt: 'funktion', ico: '🔣', titel: 'Hexadezimal', lohn: 65,
    ziel: 'Schreib zu_hex(n): die Hexadezimaldarstellung einer Zahl ≥ 0 als Text in Großbuchstaben (0 → "0"). Ohne hex()!',
    listen: [[], [], [], [], []], aufrufFn: (l, k) => `zu_hex(${[255, 77, 0, 4096, 48879][k]})`, soll: (l, k) => [255, 77, 0, 4096, 48879][k].toString(16).toUpperCase(), testName: (k) => String([255, 77, 0, 4096, 48879][k]),
    befehle: [K_B('def zu_hex(n):'), K_B('"0123456789ABCDEF"'), K_B('% 16'), K_B('// 16')],
    tipps: ['Wie beim Binärsystem – nur mit 16 statt 2.', 'Leg dir einen Text mit allen 16 Ziffern an: Der Rest beim Teilen ist dann genau der Index der passenden Ziffer 0–F.'],
    loesung: 'def zu_hex(n):\n    if n == 0:\n        return "0"\n    ziffern = "0123456789ABCDEF"\n    text = ""\n    while n > 0:\n        text = ziffern[n % 16] + text\n        n = n // 16\n    return text' }),
  SIGNAL({ id: 'ha4', kapitel: 100, sortArt: 'funktion', ico: '➖', titel: 'Das Zweierkomplement', lohn: 75,
    ziel: 'Schreib zweierkomplement(x, bits): die Zahl x (auch negativ) als Bitfolge mit genau bits Stellen. Und von_zweierkomplement(text): zurück in eine Dezimalzahl (das erste Bit hat den Wert −2^(n−1)).',
    merke: { titel: '➖ Zweierkomplement', text: 'Bei n Bit hat das höchste Bit den Stellenwert −2ⁿ⁻¹, alle anderen sind positiv: 1101 = −8 + 4 + 1 = −3. So geht −x: x binär mit n Bit, alle Bits umdrehen (Einerkomplement), 1 addieren. Mit 4 Bit reicht der Bereich von −8 bis 7. Vorteil: Addition und Subtraktion brauchen dieselbe Schaltung.', code: '−3 mit 4 Bit:\n 0011  (3)\n 1100  (umdrehen)\n 1101  (+1)' },
    listen: [[], [], [], [], [], []], aufrufFn: (l, k) => ['zweierkomplement(-3, 4)', 'zweierkomplement(5, 4)', 'zweierkomplement(-1, 8)', 'zweierkomplement(-128, 8)', 'von_zweierkomplement("1101")', 'von_zweierkomplement("01111111")'][k],
    soll: (l, k) => [zk(-3, 4), zk(5, 4), zk(-1, 8), zk(-128, 8), ausZk('1101'), ausZk('01111111')][k], testName: (k) => ['−3 (4 Bit)', '5 (4 Bit)', '−1 (8 Bit)', '−128 (8 Bit)', '"1101"', '"01111111"'][k],
    befehle: [K_B('def zweierkomplement(x, bits):'), K_B('def von_zweierkomplement(text):'), K_B('2 ** bits'), K_B('range(¦)'), K_B('text[0]')],
    tipps: ['Trick: Eine negative Zahl x hat dieselben Bits wie x + 2^bits (bei 4 Bit: −3 + 16 = 13 = 1101).', 'Dann wie dez_zu_bin, mit führenden Nullen auf bits Stellen auffüllen.', 'Zurück: erst ganz normal umrechnen; ist das erste Bit 1, noch 2^n abziehen.'],
    loesung: 'def zweierkomplement(x, bits):\n    if x < 0:\n        x = x + 2 ** bits\n    text = ""\n    for i in range(bits):\n        text = str(x % 2) + text\n        x = x // 2\n    return text\n\ndef von_zweierkomplement(text):\n    wert = 0\n    for z in text:\n        wert = wert * 2 + int(z)\n    if text[0] == "1":\n        wert = wert - 2 ** len(text)\n    return wert' }),
  SFRAGEN({ id: 'ha5', kapitel: 100, ico: '💥', titel: 'Überlauf', lohn: 60,
    ziel: 'Was passiert an den Rändern des Zahlenbereichs?',
    fragen: [{ art: 'zahl', text: 'Welche ist die größte Zahl im 8-Bit-Zweierkomplement?', soll: () => 127 },
      { art: 'zahl', text: 'Und die kleinste?', soll: () => -128 },
      W('Im 4-Bit-Zweierkomplement wird 0111 + 0001 gerechnet (7 + 1). Was steht da?', ['1000 = 8', '1000 = −8 – ein Überlauf, das Ergebnis passt nicht in den Bereich', '0000', 'ein Fehler, der Rechner stoppt'], 1),
      W('Woran erkennt man einen Überlauf bei der Addition zweier positiver Zahlen im Zweierkomplement?', ['das Ergebnis ist negativ (höchstes Bit 1)', 'am Übertrag ganz links (Carry-Bit ist 1)', 'das Ergebnis hat mehr als 8 Stellen', 'das niedrigste Bit des Ergebnisses ist 0'], 0)],
    tipps: ['Bei 8 Bit: −2⁷ bis 2⁷ − 1.'] }),
  SIGNAL({ id: 'ha6', kapitel: 100, sortArt: 'funktion', ico: '🔸', titel: 'Festkomma: der Bruchteil', lohn: 70,
    ziel: 'Schreib bruch_bits(x, n): die ersten n Nachkommastellen von 0 ≤ x < 1 im Binärsystem („Multiplikation mit 2“: verdoppeln, Ganzzahlteil notieren, abziehen).',
    merke: { titel: '🔸 Festkommazahlen', text: 'Bei Festkommazahlen steht das Komma an einer festen Stelle. Nachkommastellen haben die Werte ½, ¼, ⅛ … Umrechnung: Bruchteil mal 2, die Ziffer vor dem Komma ist das nächste Bit, weiter mit dem Rest. 0,45 hat keine endliche Binärdarstellung – mit festen Stellen entsteht ein Rundungsfehler.', code: '0,45 · 2 = 0,9 → 0\n0,9 · 2 = 1,8 → 1\n0,8 · 2 = 1,6 → 1' },
    listen: [[], [], [], []], aufrufFn: (l, k) => `bruch_bits(${[0.5, 0.375, 0.45, 0.1][k]}, ${[4, 4, 8, 6][k]})`, soll: (l, k) => bruchBits([0.5, 0.375, 0.45, 0.1][k], [4, 4, 8, 6][k]), testName: (k) => `${String([0.5, 0.375, 0.45, 0.1][k]).replace('.', ',')}`,
    befehle: [K_B('def bruch_bits(x, n):'), K_B('range(¦)'), K_B('* 2'), K_B('>= 1'), K_B('else:')],
    tipps: ['n-mal verdoppeln. Ist das Ergebnis mindestens 1, ist das Bit 1 und du ziehst die 1 wieder ab – sonst ist das Bit 0.'],
    loesung: 'def bruch_bits(x, n):\n    text = ""\n    for i in range(n):\n        x = x * 2\n        if x >= 1:\n            text = text + "1"\n            x = x - 1\n        else:\n            text = text + "0"\n    return text' }),

  // --- Kapitel 101: 🔤 Zeichen kodieren (Kurs 1.4) ---
  SIGNAL({ id: 'hb1', kapitel: 101, sortArt: 'funktion', ico: '🔤', titel: 'Buchstaben funken', lohn: 65,
    ziel: 'Schreib ascii_bits(text): für jedes Zeichen seinen ASCII-Code als 8-Bit-Text (mit führenden Nullen), als Liste.',
    merke: { titel: '🔤 Zeichenkodierung', text: 'ASCII ordnet 128 Zeichen eine Zahl zu (A = 65, a = 97, 0 = 48, Leerzeichen 32), gespeichert in 7 bzw. 8 Bit. Unicode gibt jedem Zeichen der Welt eine Nummer (Codepoint); UTF-8 speichert ASCII-Zeichen in 1 Byte, ä in 2, € in 3 und Emojis in 4 Byte.', code: 'ord("A")  # 65 → 01000001' },
    listen: [[], [], []], aufrufFn: (l, k) => `ascii_bits("${['A', 'Hi', 'a 0'][k]}")`, soll: (l, k) => [...['A', 'Hi', 'a 0'][k]].map((z) => z.charCodeAt(0).toString(2).padStart(8, '0')), testName: (k) => `„${['A', 'Hi', 'a 0'][k]}“`,
    befehle: [K_B('def ascii_bits(text):'), K_B('ord(¦)'), K_B('% 2'), K_B('// 2'), K_B('.append(¦)')],
    tipps: ['ord(z) liefert den Code.', 'Dann 8-mal Rest durch 2 vorn anhängen – so entstehen auch die führenden Nullen.'],
    loesung: 'def ascii_bits(text):\n    aus = []\n    for z in text:\n        code = ord(z)\n        bits = ""\n        for i in range(8):\n            bits = str(code % 2) + bits\n            code = code // 2\n        aus.append(bits)\n    return aus' }),
  SFRAGEN({ id: 'hb2', kapitel: 101, ico: '🌍', titel: 'ASCII, Unicode, UTF-8', lohn: 60,
    ziel: 'Wie viele Bytes braucht welches Zeichen?',
    fragen: [{ art: 'zahl', text: 'ASCII-Code von „a“ ist 97. Welchen Code hat „d“?', soll: () => 100 },
      W('Wie unterscheiden sich „A“ (65) und „a“ (97) binär?', ['in den unteren vier Bits', 'nur in einem Bit (Wert 32)', 'in allen acht Bits', 'a hat ein Bit mehr (8 statt 7)'], 1),
      { art: 'zahl', text: 'Wie viele Byte braucht „Bär“ in UTF-8? (ä braucht 2)', soll: () => 4 },
      W('Ein Text wird als UTF-8 gespeichert, aber als Latin-1 gelesen. Aus „Grüße“ wird „GrÃ¼ÃŸe“. Warum?', ['Latin-1 kennt keine Umlaute und setzt deshalb Ersatzzeichen ein', 'die zwei Bytes von ü bzw. ß werden als je zwei einzelne Zeichen gelesen', 'beim Speichern wurde jedes Byte um eine Stelle verschoben', 'UTF-8 speichert Umlaute rückwärts, Latin-1 liest sie vorwärts'], 1)],
    tipps: ['B und r je 1 Byte, ä 2 Byte.'] }),

  // --- Kapitel 102: 💡 Boolesche Algebra (Kurs 2.1–2.8) ---
  SFRAGEN({ id: 'hc1', kapitel: 102, ico: '💡', titel: 'UND, ODER, NICHT', lohn: 60,
    ziel: 'Fülle die Wahrheitstabellen aus – tippe die Felder der letzten Spalte an.',
    merke: { titel: '💡 Boolesche Algebra', text: 'Aussagen sind wahr (1) oder falsch (0). Konjunktion A ∧ B (UND): nur 1, wenn beide 1 sind. Disjunktion A ∨ B (ODER): 1, wenn mindestens eine 1 ist. Negation ¬A (NICHT) dreht um. XOR A ⊕ B: 1, wenn genau eine 1 ist. Implikation A → B ist nur falsch, wenn A wahr und B falsch ist.' },
    fragen: [WT('A ∧ B (UND)', ['A', 'B'], ['and', 'A', 'B']), WT('A ∨ B (ODER)', ['A', 'B'], ['or', 'A', 'B']), WT('A ⊕ B (XOR, entweder – oder)', ['A', 'B'], ['xor', 'A', 'B']),
      { art: 'wahrheit', text: 'A → B (Implikation: „wenn A, dann B“)', variablen: ['A', 'B'], ziel: (b) => (b.A && !b.B ? 0 : 1) }],
    tipps: ['Geh Zeile für Zeile vor: ∧ ist nur bei 1 und 1 wahr · ∨ ist nur bei 0 und 0 falsch · ⊕ ist wahr, wenn A und B verschieden sind · → ist nur bei A = 1 und B = 0 falsch.'] }),
  SFRAGEN({ id: 'hc2', kapitel: 102, ico: '🧮', titel: 'Drei Variablen', lohn: 65,
    ziel: 'Wahrheitstabellen mit drei Variablen – acht Zeilen.',
    fragen: [WT(`f = ${ausText(E_ABC)}`, ['A', 'B', 'C'], E_ABC), WT('f = ¬(A ∧ B) ∨ C', ['A', 'B', 'C'], ['or', ['not', ['and', 'A', 'B']], 'C']),
      { art: 'zahl', text: `Wie viele Minterme hat die KDNF von ${ausText(E_ABC)} (Zeilen mit Ergebnis 1)?`, soll: () => belegungen(['A', 'B', 'C']).filter((b) => ausWert(E_ABC, b)).length }],
    tipps: ['Erst die Klammer ausrechnen, dann den Rest.'] }),
  SFRAGEN({ id: 'hc3', kapitel: 102, ico: '⚖️', titel: 'Gesetze und Normalformen', lohn: 65,
    ziel: 'De Morgan, Normalformen und Tautologien.',
    merke: { titel: '⚖️ Gesetze und Normalformen', text: 'De Morgan: ¬(A ∧ B) = ¬A ∨ ¬B und ¬(A ∨ B) = ¬A ∧ ¬B. Die KDNF ist die ODER-Verknüpfung aller Minterme (Zeilen mit 1, Variablen mit 0 negiert), die KKNF die UND-Verknüpfung aller Maxterme (Zeilen mit 0). Eine Tautologie ist immer wahr, ein Widerspruch immer falsch.' },
    fragen: [W('¬(A ∨ B) ist gleichwertig zu …', ['¬A ∨ ¬B', '¬A ∧ ¬B', 'A ∧ B', '¬A ∨ B'], 1),
      W('Die Zeile A = 1, B = 0 liefert 1. Welcher Minterm gehört in die KDNF?', ['A ∧ B', 'A ∧ ¬B', '¬A ∧ B', 'A ∨ ¬B'], 1),
      W('A ∨ ¬A ist …', ['ein Widerspruch', 'eine Tautologie – immer wahr', 'erfüllbar, aber nicht immer wahr', 'kein Ausdruck'], 1),
      W('Welcher Ausdruck ist gleichwertig zu A → B?', ['A ∧ B', '¬A ∨ B', 'A ∨ ¬B', '¬A ∧ B'], 1)],
    tipps: ['De Morgan: Klammer auflösen, jedes Zeichen umdrehen und ∧ ↔ ∨ tauschen.'] }),
  SIGNAL({ id: 'hc4', kapitel: 102, sortArt: 'funktion', ico: '🔍', titel: 'Gleichwertig?', lohn: 75,
    ziel: 'Schreib gleichwertig(f, g, n): f und g sind Python-Funktionen, die eine Liste von n Bits bekommen und 0 oder 1 liefern. Prüfe alle 2ⁿ Belegungen – True, wenn f und g überall gleich sind.',
    vorspann: 'def demorgan_links(b):\n    return 1 - (b[0] & b[1])\n\ndef demorgan_rechts(b):\n    return (1 - b[0]) | (1 - b[1])\n\ndef falsch_rechts(b):\n    return (1 - b[0]) & (1 - b[1])\n\ndef dist_links(b):\n    return b[0] & (b[1] | b[2])\n\ndef dist_rechts(b):\n    return (b[0] & b[1]) | (b[0] & b[2])\n\ndef fast_gleich(b):\n    return (b[0] & b[1]) | (b[0] & b[2]) | (b[0] & b[1] & (1 - b[2]) & b[3])\n\ndef fast_anders(b):\n    return (b[0] & b[1]) | (b[0] & b[2]) | ((1 - b[0]) & b[1] & b[2] & b[3])\n',
    listen: [[], [], [], [], []], aufrufFn: (l, k) => ['gleichwertig(demorgan_links, demorgan_rechts, 2)', 'gleichwertig(demorgan_links, falsch_rechts, 2)', 'gleichwertig(dist_links, dist_rechts, 3)', 'gleichwertig(fast_gleich, dist_rechts, 4)', 'gleichwertig(fast_anders, dist_rechts, 4)'][k],
    soll: (l, k) => [true, false, true, true, false][k], testName: (k) => ['De Morgan', 'falscher De Morgan', 'Distributivgesetz', 'mit 4 Variablen', 'nur in einer Zeile anders'][k],
    befehle: [K_B('def gleichwertig(f, g, n):'), K_B('range(2 ** n)'), K_B('>> i'), K_B('& 1'), K_B('!=')],
    tipps: ['Alle Zahlen k von 0 bis 2ⁿ − 1 durchgehen – ihre Binärdarstellung ist eine Belegung.', 'Bit i von k: (k >> i) & 1 – oder mit // und %.', 'Sobald f und g verschieden sind: return False.'],
    loesung: 'def gleichwertig(f, g, n):\n    for k in range(2 ** n):\n        bits = []\n        for i in range(n):\n            bits.append((k >> i) & 1)\n        if f(bits) != g(bits):\n            return False\n    return True' }),

  // --- Kapitel 103: 🔌 Schaltnetze und Addierer (Kurs 3.1–3.7) ---
  SFRAGEN({ id: 'hd1', kapitel: 103, ico: '🔌', titel: 'Eine Schaltung analysieren', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Schaltnetz am Turmtor',
    tabelle: () => ({ html: siBild(`${svgSchaltung(E_SCHALT)}<p class="hinweis">&amp; = UND, ≥1 = ODER, =1 = XOR, 1 mit Kreis = NICHT</p>`) }),
    ziel: 'Lies die Schaltung und fülle ihre Wahrheitstabelle aus.',
    merke: { titel: '🔌 Gatter', text: 'Schaltnetze setzen boolesche Funktionen mit Gattern um: UND (&), ODER (≥1), NICHT (1 mit Kreis am Ausgang), XOR (=1). Analyse: Für jede Belegung die Gatter von links nach rechts ausrechnen. Synthese: Aus der Wahrheitstabelle die KDNF bilden, vereinfachen (Gesetze, KV-Diagramm) und als Gatter aufbauen.' },
    fragen: [WT('Ausgang f der Schaltung', ['A', 'B', 'C'], E_SCHALT),
      W('Welcher Ausdruck beschreibt die Schaltung?', [ausText(E_SCHALT), '(A ∨ ¬B) ∧ (B ∨ C)', 'A ∧ B ∧ C', '¬A ∨ (B ∧ C)'], 0)],
    tipps: ['Oberes UND: A und nicht B. Unteres UND: B und C. Dann ODER.'] }),
  SFRAGEN({ id: 'hd2', kapitel: 103, ico: '🚨', titel: 'Vereinfachen: die Alarmanlage', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Alarm am Turm',
    tabelle: () => ({ html: siBild(`${svgSchaltung(E_ALARM, 'Alarm')}<p class="hinweis">T = Tür offen, F = Fenster offen</p>`) }),
    ziel: 'Diese Schaltung ist umständlich. Wie geht es einfacher?',
    merke: { titel: '🗺️ KV-Diagramm', text: 'Im Karnaugh-Veitch-Diagramm steht jede Zeile der Wahrheitstabelle als Feld; benachbarte Felder unterscheiden sich in genau einer Variablen. Man fasst benachbarte Einsen zu möglichst großen Blöcken (1, 2, 4, 8 Felder) zusammen – Variablen, die sich im Block ändern, fallen weg. So erhält man einen möglichst kurzen Ausdruck.' },
    fragen: [WT('Alarm', ['T', 'F'], E_ALARM, { spalte: 'Alarm' }),
      W('Welcher kürzere Ausdruck ist gleichwertig?', ['T ∧ F', 'T', 'F', 'T ∨ F'], 1),
      W('Welches Gesetz steckt dahinter? (T ∧ F) ∨ (T ∧ ¬F) = T ∧ (F ∨ ¬F) = …', ['De-Morgan-Gesetz', 'Distributivgesetz – danach F ∨ ¬F = 1', 'Kommutativgesetz', 'Absorptionsgesetz'], 1),
      { art: 'zahl', text: 'Wie viele Gatter spart man? (vorher: 2 UND, 1 ODER, 1 NICHT)', soll: () => 4 }],
    tipps: ['Wann gibt es Alarm? Schau, ob F überhaupt eine Rolle spielt.'] }),
  SFRAGEN({ id: 'hd7', kapitel: 103, ico: '🧾', titel: 'KDNF aufstellen und vereinfachen', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Die Funktion von heute',
    tabelle: () => ({ html: siBild(`<div class="dbtab"><div class="dbscroll"><table><tr><th>A</th><th>B</th><th>C</th><th>f</th></tr>${belegungen(SI_ABC).map((b) => `<tr><td>${b.A}</td><td>${b.B}</td><td>${b.C}</td><td><b>${ausWert(SI_fall().min, b)}</b></td></tr>`).join('')}</table></div></div>
      <p class="hinweis">Jeden Tag steht hier eine andere Funktion.</p>`) }),
    ziel: 'Stell zur Wahrheitstabelle links die KDNF auf und vereinfache sie dann mit dem KV-Diagramm (auf Papier) zum kürzesten Ausdruck.',
    fragen: [{ art: 'zahl', text: 'Aus wie vielen Mintermen besteht die KDNF von f?', soll: () => SI_minterme(SI_fall()).length },
      { art: 'liste', menge: true, text: 'Zu welchen Zeilen gehören die Minterme? Gib die Belegungen ABC an (z. B. 011 110).', soll: () => SI_minterme(SI_fall()) },
      { art: 'liste', get text() { return `Schreib den Minterm zur Zeile ${SI_minterme(SI_fall())[0]}: A, B und C der Reihe nach, ein n davor, wenn die Variable negiert ist (z. B. nA B nC).`; },
        soll: () => { const z = SI_minterme(SI_fall())[0]; return SI_ABC.map((v, i) => (z[i] === '1' ? v : 'n' + v)); } },
      { art: 'zahl', text: 'Trag die Einsen in ein KV-Diagramm ein und fasse sie zu möglichst großen Blöcken zusammen. Aus wie vielen Blöcken (Termen) besteht der kürzeste Ausdruck?', soll: () => SI_terme(SI_fall().min) }],
    tipps: ['Ein Minterm gehört zu jeder Zeile mit f = 1.', 'Im Minterm steht jede Variable genau einmal – negiert, wenn sie in der Zeile 0 ist.', 'Im KV-Diagramm sind auch der linke und der rechte Rand benachbart. Ein Zweierblock lässt eine Variable weg, ein Viererblock zwei.'] }),
  SIGNAL({ id: 'hd7k', kapitel: 103, sortArt: 'funktion', ico: '✍️', titel: 'KDNF und kürzester Ausdruck – selbst geschrieben', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Die Funktion von heute',
    tabelle: () => ({ html: siBild(`<div class="dbtab"><div class="dbscroll"><table><tr><th>A</th><th>B</th><th>C</th><th>f</th></tr>${belegungen(SI_ABC).map((b) => `<tr><td>${b.A}</td><td>${b.B}</td><td>${b.C}</td><td><b>${ausWert(SI_fall().min, b)}</b></td></tr>`).join('')}</table></div></div>
      <p class="hinweis">Dieselbe Funktion wie bei „KDNF aufstellen“ – jeden Tag eine andere. Schreibweise: ¬ ∧ ∨ oder not, and, or, dazu Klammern.</p>`) }),
    story: 'Lumi will die Formel der Turmsteuerung nicht ankreuzen, sondern aufgeschrieben haben: „Eine Schaltung baut man nur aus einem Ausdruck, den man selbst hinschreiben kann.“',
    ziel: 'Schreib zwei Funktionen, die je einen Ausdruck als Text zurückgeben: kdnf() die vollständige KDNF der Tabelle (ODER aus Mintermen, jeder Minterm enthält A, B und C) und kurz() einen kürzesten gleichwertigen Ausdruck, den du mit dem KV-Diagramm findest. Geprüft wird über die ganze Wahrheitstabelle.',
    listen: [[], []], aufrufFn: (l, k) => ['kdnf()', 'kurz()'][k], testName: (k) => ['KDNF', 'kürzester Ausdruck'][k],
    soll: (l, k) => [SI_kdnfText(), ausText(SI_fall().min)][k],
    pruefWert: (w, k) => SI_ausdruckPruefen(w, k === 0),
    okText: (w, k) => (k === 0 ? `KDNF „${w}“ stimmt in allen 8 Zeilen ✓` : `„${w}“ ist gleichwertig und kürzest ✓`),
    befehle: [K_B('def kdnf():'), K_B('def kurz():'), K_B('return "¦"'), K_B('¬'), K_B(' ∧ '), K_B(' ∨ ')],
    tipps: ['Für jede Zeile mit f = 1 ein Minterm: alle drei Variablen mit ∧, negiert, wo in der Zeile eine 0 steht. Die Minterme verbindest du mit ∨.', 'Für kurz(): Jeder Block im KV-Diagramm wird ein Term. Eine Variable, die sich innerhalb des Blocks ändert, fällt weg.', 'Prüf kurz() an einer Zeile mit f = 0: Darf dort keiner deiner Terme wahr werden?'],
    loesung: SI_loesungK() }),
  SIGNAL({ id: 'hd6', kapitel: 103, sortArt: 'funktion', ico: '🪟', titel: 'Gatter-Baukasten: das Dachfenster', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Gärtnerei am Signalturm',
    tabelle: () => ({ html: siBild(`<div class="dbtab"><div class="dbscroll"><table><tr><th>Sensor</th><th>1 bedeutet</th></tr><tr><th>w</th><td>zu warm im Gewächshaus</td></tr><tr><th>l</th><td>Luft zu feucht</td></tr><tr><th>r</th><td>es regnet</td></tr><tr><th>s</th><td>Sturm</td></tr></table></div></div>
      <p class="hinweis">In Python: and = ∧ (&amp;-Gatter), or = ∨ (≥1-Gatter), not = ¬ (1-Gatter mit Kreis).</p>
      ${(() => { const e = SI_eigeneSchaltung(); return e ? `<p><b>Deine Schaltung</b> (aus deinem return)</p>${svgSchaltung(e, 'Fenster')}` : '<p class="hinweis">Sobald du fenster mit einem einzigen return geschrieben und ausgeführt hast, erscheint hier deine Schaltung.</p>'; })()}`) }),
    story: 'Die Gärtnerei am Fuß des Signalturms hat ein Dachfenster mit vier Sensoren. Bisher öffnet Lumi es von Hand – jetzt sollst du die Steuerung entwerfen.',
    ziel: 'Schreib fenster(w, l, r, s): True, wenn das Dachfenster öffnen soll. Es öffnet, wenn es zu warm ist – oder wenn die Luft zu feucht ist und es dabei nicht regnet. Bei Sturm bleibt es immer zu. Am besten ein einziges return mit and, or und not: Das ist dann direkt der Bauplan der Schaltung.',
    merke: { titel: '🪟 Von der Beschreibung zur Schaltung', text: 'Synthese: Sammle die Bedingungen in Worten, schreib jede als Teilausdruck („und nicht“ = ∧ ¬) und verknüpfe sie. Ein Ausdruck mit and, or und not ist zugleich der Bauplan der Schaltung: jedes and ein &-Gatter, jedes or ein ≥1-Gatter, jedes not ein 1-Gatter mit Kreis. Ob er stimmt, zeigt erst die ganze Wahrheitstabelle.' },
    listen: [...Array(16)].map(() => []),
    aufrufFn: (l, k) => `fenster(${[3, 2, 1, 0].map((i) => ((k >> i) & 1 ? 'True' : 'False')).join(', ')})`,
    soll: (l, k) => { const [w, f, r, s] = [3, 2, 1, 0].map((i) => (k >> i) & 1); return !!((w || (f && !r)) && !s); },
    testName: (k) => `w=${(k >> 3) & 1} l=${(k >> 2) & 1} r=${(k >> 1) & 1} s=${k & 1}`,
    befehle: [K_B('def fenster(w, l, r, s):')],
    tipps: ['Zerlege den Satz: (zu warm) ODER (feucht UND NICHT Regen) – und das Ganze UND NICHT Sturm.', 'Achte auf die Klammern: Der Sturm muss beide Fälle verhindern, nicht nur einen.', 'Schau dir rechts die Schaltung zu deinem Ausdruck an: Hängt das Gatter für „nicht Sturm“ ganz hinten vor dem Ausgang?'],
    loesung: 'def fenster(w, l, r, s):\n    return (w or (l and not r)) and not s' }),
  SIGNAL({ id: 'hd3', kapitel: 103, sortArt: 'funktion', ico: '➕', titel: 'Halb- und Volladdierer', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Halbaddierer',
    tabelle: () => ({ html: siBild(`${svgSchaltung(['xor', 'A', 'B'], 'S')}${svgSchaltung(['and', 'A', 'B'], 'C')}<p class="hinweis">Summe S = A ⊕ B, Übertrag C = A ∧ B. Python: ^ ist XOR, &amp; ist UND, | ist ODER.</p>`) }),
    ziel: 'Schreib halbaddierer(a, b) → [s, c] mit ^ und &. Dann volladdierer(a, b, cin) → [s, cout] aus zwei Halbaddierern und einem ODER.',
    merke: { titel: '➕ Addierer', text: 'Der Halbaddierer addiert zwei Bits: Summe S = A ⊕ B, Übertrag C = A ∧ B. Der Volladdierer addiert zusätzlich den Übertrag der vorigen Stelle: zwei Halbaddierer hintereinander, die beiden Überträge per ODER verknüpft. Mehrere Volladdierer hintereinander (Ripple-Carry) addieren ganze Binärzahlen.', code: 'A B | C S\n0 0 | 0 0\n0 1 | 0 1\n1 0 | 0 1\n1 1 | 1 0' },
    listen: [[], [], [], [], [], []], aufrufFn: (l, k) => ['halbaddierer(1, 1)', 'halbaddierer(1, 0)', 'volladdierer(1, 0, 1)', 'volladdierer(1, 1, 1)', 'volladdierer(0, 0, 0)', 'volladdierer(0, 1, 0)'][k],
    soll: (l, k) => [[0, 1], [1, 0], [0, 1], [1, 1], [0, 0], [1, 0]][k], testName: (k) => ['HA 1+1', 'HA 1+0', 'VA 1+0+1', 'VA 1+1+1', 'VA 0+0+0', 'VA 0+1+0'][k],
    befehle: [K_B('def halbaddierer(a, b):'), K_B('def volladdierer(a, b, cin):')],
    tipps: ['S ist 1, wenn genau ein Bit 1 ist (XOR, in Python ^). C ist nur bei 1 + 1 gleich 1 (UND, &).', 'volladdierer: erst a und b halb addieren, dann deren Summe mit cin halb addieren.', 'Ein Übertrag entsteht, wenn einer der beiden Halbaddierer einen liefert: c1 | c2.'],
    loesung: 'def halbaddierer(a, b):\n    return [a ^ b, a & b]\n\ndef volladdierer(a, b, cin):\n    s1, c1 = halbaddierer(a, b)\n    s, c2 = halbaddierer(s1, cin)\n    return [s, c1 | c2]' }),
  SFRAGEN({ id: 'hd4', kapitel: 103, ico: '📋', titel: 'Die Tabelle des Volladdierers', lohn: 65,
    ziel: 'Beide Ausgänge des Volladdierers als Wahrheitstabelle.',
    fragen: [WT('Summe S', ['A', 'B', 'Cin'], ['xor', ['xor', 'A', 'B'], 'Cin'], { spalte: 'S' }),
      WT('Übertrag Cout', ['A', 'B', 'Cin'], ['or', ['and', 'A', 'B'], ['and', ['xor', 'A', 'B'], 'Cin']], { spalte: 'Cout' }),
      W('Wann ist Cout = 1?', ['wenn genau ein Eingang 1 ist', 'wenn mindestens zwei Eingänge 1 sind', 'nur wenn alle drei Eingänge 1 sind', 'wenn eine ungerade Zahl Eingänge 1 ist'], 1)],
    tipps: ['S ist 1, wenn eine ungerade Zahl von Eingängen 1 ist.'] }),
  SIGNAL({ id: 'hd5', kapitel: 103, sortArt: 'funktion', ico: '🔗', titel: 'Vier Volladdierer hintereinander', lohn: 85,
    ziel: 'Schreib addiere(a, b): a und b sind gleich lange Bittexte (höchstes Bit links). Addiere Stelle für Stelle von rechts mit volladdierer und gib [Summe als Text, letzter Übertrag] zurück. volladdierer gibt es schon.',
    vorspann: 'def volladdierer(a, b, cin):\n    s = a ^ b ^ cin\n    return [s, (a & b) | ((a ^ b) & cin)]\n',
    listen: [[], [], [], []], aufrufFn: (l, k) => `addiere(${[['"0110"', '"0111"'], ['"1111"', '"0001"'], ['"0011"', '"0101"'], ['"10110110"', '"01101101"']][k].join(', ')})`,
    soll: (l, k) => addiere(...[['0110', '0111'], ['1111', '0001'], ['0011', '0101'], ['10110110', '01101101']][k]), testName: (k) => ['6 + 7', '15 + 1 (Übertrag)', '3 + 5', '8 Bit'][k],
    befehle: [K_B('def addiere(a, b):'), K_B('volladdierer(')],
    tipps: ['Von rechts nach links: range kann auch rückwärts zählen – mit Start, Ende und Schrittweite −1.', 'Der Übertrag jeder Stelle geht in die nächste (Ripple-Carry).', 'Das Summenbit kommt vorn an den Ergebnistext, weil du von rechts nach links rechnest.'],
    loesung: 'def addiere(a, b):\n    uebertrag = 0\n    summe = ""\n    for i in range(len(a) - 1, -1, -1):\n        s, uebertrag = volladdierer(int(a[i]), int(b[i]), uebertrag)\n        summe = str(s) + summe\n    return [summe, uebertrag]' }),

  // --- Kapitel 104: 🖥️ Der Rechner (Kurs 4.1–4.3) ---
  SFRAGEN({ id: 'he1', kapitel: 104, ico: '🖥️', titel: 'Der Von-Neumann-Rechner', lohn: 60,
    ziel: 'Aufbau und Arbeitsweise eines Rechners.',
    merke: { titel: '🖥️ Von-Neumann-Architektur', text: 'Ein Von-Neumann-Rechner besteht aus Rechenwerk und Steuerwerk (zusammen CPU), Speicherwerk, Ein-/Ausgabewerk und Bussystem. Programm und Daten liegen im selben Speicher. Die CPU wiederholt immer den Von-Neumann-Zyklus aus vier Phasen: Befehl holen (Fetch, dabei wird der Befehlszähler um 1 erhöht), entschlüsseln (Decode), ausführen (Execute) und das Ergebnis zurückschreiben (Writeback). Der gemeinsame Bus ist ein Engpass (Von-Neumann-Flaschenhals).' },
    fragen: [W('Wo liegen beim Von-Neumann-Rechner Programm und Daten?', ['in getrennten Speichern', 'im selben Speicher', 'nur im Prozessor', 'auf der Festplatte'], 1),
      { art: 'liste', text: 'Bring die vier Phasen des Von-Neumann-Zyklus in die richtige Reihenfolge (Buchstaben).', soll: () => ['B', 'D', 'C', 'A'],
        html: `<div class="dbtab"><div class="dbscroll"><table>${[['A', 'Ergebnis in Register oder Speicher zurückschreiben (Writeback)'], ['B', 'Befehl aus der Speicherzelle holen, auf die der Befehlszähler zeigt (Fetch)'], ['C', 'Befehl ausführen: rechnen, laden oder springen (Execute)'], ['D', 'Bitmuster entschlüsseln: Welche Operation, welche Adresse? (Decode)']].map(([b, t]) => `<tr><th>${b}</th><td>${t}</td></tr>`).join('')}</table></div></div>` },
      { art: 'zahl', text: 'Ein Programm hat 6 Milliarden Befehle, jeder braucht im Mittel 2 Takte, der Prozessor läuft mit 3 GHz. Wie viele Sekunden rechnet es?', soll: () => 4 },
      W('Warum gibt es Cache-Speicher?', ['als schneller Ersatz für die Festplatte im Rechner', 'der Hauptspeicher ist viel langsamer als die CPU – oft gebrauchte Daten liegen nah und schnell im Cache', 'damit Programm und Daten getrennt liegen können', 'damit die CPU mehr als einen Befehl je Takt holt'], 1)],
    tipps: ['6 · 10⁹ · 2 / (3 · 10⁹)', 'Erst muss der Befehl da sein, dann muss man wissen, was er bedeutet, dann tut man es – und zuletzt wird das Ergebnis abgelegt.'] }),
  SFRAGEN({ id: 'he1v', kapitel: 104, ico: '🕵️', titel: 'Sei der Prozessor', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Speicher der Rechenmaschine',
    tabelle: () => ({ html: siBild(`<div class="dbtab"><div class="dbscroll"><table><tr><th>Adresse</th><th>Inhalt</th></tr>${SI_PROG.map((b, i) => `<tr><th>${i}</th><td class="mono">${b}</td></tr>`).join('')}
      <tr><th>10</th><td class="mono">${SI_heN()}</td></tr><tr><th>11</th><td class="mono">0</td></tr><tr><th>12</th><td class="mono">1</td></tr></table></div></div>
      <p class="hinweis">LOAD a: Akku = Zelle a · STORE a: Zelle a = Akku · ADD / SUB a: Zelle a zum Akku addieren / abziehen · OUT: Akku ausgeben · JMP a: springe zu a · JZ a: springe, wenn Akku = 0 · HLT: Halt. Der Befehlszähler beginnt bei 0.</p>`) }),
    story: 'Bevor du im Keller selbst eine Mini-CPU programmierst, spielst du sie einmal von Hand: Zyklus für Zyklus, mit Befehlszähler und Akku auf einem Zettel.',
    ziel: 'Arbeite das Programm Zyklus für Zyklus ab wie das Steuerwerk – am besten mit einer Tabelle: Zyklus, Befehlszähler, Befehl, Akku, Ausgabe.',
    fragen: [{ art: 'liste', text: 'Welche Zahlen gibt das Programm mit OUT aus? (der Reihe nach, mit Leerzeichen)', soll: () => SI_heSpur().aus },
      { art: 'zahl', text: 'Was steht nach dem Halt in Zelle 11?', soll: () => SI_heSpur().m[11] },
      { art: 'zahl', text: 'Wie viele Befehle führt der Prozessor insgesamt aus – HLT mitgezählt?', soll: () => SI_heSpur().schritte },
      { art: 'zahl', text: 'Zum ersten Mal wird der Befehl JZ 9 geholt (Fetch). Welchen Wert hat der Befehlszähler direkt nach diesem Fetch?', soll: () => 8 },
      W('Was passiert, wenn in Zelle 10 am Anfang 0 steht?', ['Es hält nie an: Zelle 10 wird −1, −2, … und beim JZ ist der Akku nie mehr 0', 'Es hält sofort an, weil in Zelle 10 eine 0 steht und JZ deshalb gleich springt', 'Es gibt einmal die 0 aus, springt dann mit JZ zu Adresse 9 und hält an', 'Es meldet einen Fehler, weil man von 0 nichts mehr abziehen kann'], 0)],
    tipps: ['Ein Durchlauf der Schleife: Summe = Summe + n, ausgeben, n = n − 1, prüfen, ob n schon 0 ist.', 'Ein Durchlauf führt die Befehle 0 bis 8 aus (9 Befehle). Beim letzten springt JZ zu 9, dann folgt HLT.', 'Beim Fetch wird der Befehlszähler sofort erhöht – nach dem Holen von Adresse 7 steht er auf 8.'] }),
  SIGNAL({ id: 'he2', kapitel: 104, sortArt: 'funktion', knobel: true, ico: '⚙️', titel: 'Eine Mini-CPU', lohn: 95,
    ziel: 'Schreib fuehre_aus(programm, speicher): eine Akkumulator-Maschine. Befehle (Texte wie "ADD 1"): LOAD a (acc = speicher[a]), STORE a, ADD a, SUB a, JMP z (springe zu Befehl z), JZ z (springe, wenn acc == 0), HLT. Gib den Speicher am Ende zurück (höchstens 1000 Schritte).',
    story: 'Im Keller des Signalturms steht eine Rechenmaschine, die genau sieben Befehle kennt. Sie arbeitet im Von-Neumann-Zyklus wie jede echte CPU: Befehl holen, dekodieren, ausführen und das Ergebnis zurückschreiben – in Akku oder Speicher.',
    listen: MASCH_TESTS.map(() => []), aufrufFn: (l, k) => `fuehre_aus(${py(MASCH_TESTS[k][0])}, ${py(MASCH_TESTS[k][1])})`, soll: (l, k) => maschine(...MASCH_TESTS[k]), testName: (k) => ['5 + 7', 'Summe 1 bis 4 (Schleife)', 'Summe 1 bis 10', 'Subtraktion, HLT vor dem Ende'][k],
    tipps: ['acc = 0, pc = 0. Solange pc < len(programm): befehl, arg = programm[pc].split(" ") … aber HLT hat kein Argument!', 'teile = programm[pc].split(" "); befehl = teile[0]; erst pc = pc + 1, dann ausführen (Sprünge setzen pc neu).', 'Schrittzähler gegen Endlosschleifen: höchstens 1000.'],
    loesung: 'def fuehre_aus(programm, speicher):\n    acc = 0\n    pc = 0\n    schritte = 0\n    while pc < len(programm) and schritte < 1000:\n        schritte = schritte + 1\n        teile = programm[pc].split(" ")\n        befehl = teile[0]\n        pc = pc + 1\n        if befehl == "HLT":\n            break\n        a = int(teile[1])\n        if befehl == "LOAD":\n            acc = speicher[a]\n        elif befehl == "STORE":\n            speicher[a] = acc\n        elif befehl == "ADD":\n            acc = acc + speicher[a]\n        elif befehl == "SUB":\n            acc = acc - speicher[a]\n        elif befehl == "JMP":\n            pc = a\n        elif befehl == "JZ":\n            if acc == 0:\n                pc = a\n    return speicher' }),
);
// hd7k: Die Funktion wechselt täglich (P.tag) – die Musterlösung also auch
{ const h = HOEFE.find((x) => x.id === 'hd7k'); if (h) Object.defineProperty(h, 'loesung', { get: SI_loesungK, configurable: true, enumerable: true }); }

// --- 🔦 Bild für die Landkarte: Signalturm mit Lampen ---
function svgSignalturm(fertig) {
  return `<ellipse cx="0" cy="32" rx="30" ry="7" fill="rgba(0,0,0,.25)"/>
    <polygon points="-16,32 -10,-26 10,-26 16,32" fill="#9a8a7a" stroke="#4a3a2a" stroke-width="2"/>
    <rect x="-16" y="-38" width="32" height="12" fill="#7a6a5a" stroke="#4a3a2a" stroke-width="2"/>
    ${[-10, -3, 4, 11].map((x, i) => `<circle cx="${x - 1}" cy="-32" r="3" fill="${fertig || i % 2 ? '#ffe27a' : '#2b2f3d'}"/>`).join('')}
    <path d="M-6,32 v-12 a6,6 0 0 1 12,0 v12 z" fill="#3e2410"/>
    <text x="14" y="-40" style="font-size:12px">✨</text>`;
}
