'use strict';
// --- Ergänzungen für Burg 27 (⚙️ Torwerk, LK Automaten) und Burg 28 (🔦 Signalturm, LK Technik) ---
// Nach OPAL LK_INF_LB6 (6.11 Grammatik ↔ Automat, 6.12 ε-Regeln), LK_INF_LB1 und Abiturvorbereitung
// (Abi ab 2027: Syntaxdiagramm, Ableitungsbaum, Übergangsgraph; Speicherbedarf ASCII/Huffman).
// Alle obersten Namen mit Präfix PB_. Kapitel 160–164, Aufträge ua1 … ue3.

KAPITEL[160] = { name: 'Grammatik ↔ Automat', ico: '🔁' };
KAPITEL[161] = { name: 'Syntaxdiagramm und Ableitungsbaum', ico: '🌳' };
KAPITEL[162] = { name: 'Daten kompakt: Huffman', ico: '🗜️' };
KAPITEL[163] = { name: 'Standardschaltnetze und KV', ico: '🔀' };
KAPITEL[164] = { name: 'Rechnerkennzahlen', ico: '📏' };

// Kapitel an sinnvoller Stelle einfügen (nach einem vorhandenen Kapitel, sonst hinten)
function PB_nach(burg, nach, neu) {
  const k = BURGEN[burg]?.kapitel;
  if (!k || k.includes(neu)) return;
  const i = k.indexOf(nach);
  if (i < 0) k.push(neu); else k.splice(i + 1, 0, neu);
}
PB_nach(27, 93, 160);   // nach NEA/Potenzmengen: Grammatik → NEA → DEA
PB_nach(27, 94, 161);   // vor „Wie ein Compiler liest“
PB_nach(28, 101, 162);  // nach „Zeichen kodieren“
PB_nach(28, 103, 163);  // nach „Schaltnetze und Addierer“
PB_nach(28, 104, 164);  // nach „Der Rechner“

const PB_bild = (html) => `<div class="werkbild dsbild kbild">${html}</div>`;
const PB_W = (text, optionen, richtig) => ({ art: 'wahl', text, optionen, richtig });

// ======================= Burg 27: Torwerk =======================

// DEA „beginnt mit ab“ mit Fangzustand F (Großbuchstaben = Nichtterminale der Grammatik)
const PB_AU_AB = { zustaende: ['S', 'P', 'E', 'F'], start: 'S', alphabet: ['a', 'b'], ende: ['E'], delta: { S: { a: 'P', b: 'F' }, P: { a: 'F', b: 'E' }, E: { a: 'E', b: 'E' }, F: { a: 'F', b: 'F' } } };
const PB_AU_GERADE = { G: { a: 'U', b: 'G' }, U: { a: 'G', b: 'U' } };
const PB_AU_SCHLOSS = { Z: { 1: 'Z', 3: 'D', 4: 'Z' }, D: { 1: 'E', 3: 'D', 4: 'Z' }, E: { 1: 'Z', 3: 'D', 4: 'O' }, O: { 1: 'O', 3: 'O', 4: 'O' } };
// Referenz: Übergänge → Regeln (q → aP, und q → a, wenn P Endzustand), Fangzustand weglassen
function PB_regeln(delta, ende, fang) {
  const aus = [];
  for (const [z, ue] of Object.entries(delta)) {
    if (z === fang) continue;
    for (const [c, p] of Object.entries(ue)) {
      if (p === fang) continue;
      aus.push(`${z} -> ${c}${p}`);
      if (ende.includes(p)) aus.push(`${z} -> ${c}`);
    }
  }
  return aus;
}
const PB_REGEL_TESTS = [[PB_AU_AB.delta, ['E'], 'F'], [PB_AU_GERADE, ['G'], ''], [PB_AU_SCHLOSS, ['O'], '']];

// Syntaxdiagramm <zahl>: optional „-“, Ziffern (mindestens eine), optional „,“ und Ziffern
function PB_svgSyntax() {
  const pf = (x, y, d) => (d === 'r' ? `<polygon points="${x - 7},${y - 4} ${x},${y} ${x - 7},${y + 4}" fill="#3a2c10"/>` : `<polygon points="${x + 7},${y - 4} ${x},${y} ${x + 7},${y + 4}" fill="#3a2c10"/>`);
  const linie = (d) => `<path d="${d}" fill="none" stroke="#3a2c10" stroke-width="2"/>`;
  const term = (x, t) => `<rect x="${x}" y="42" width="28" height="26" rx="13" fill="#fdf8e8" stroke="#3a2c10" stroke-width="2"/><text x="${x + 14}" y="60" text-anchor="middle" font-size="16" font-weight="700" fill="#1a1408">${t}</text>`;
  const nt = (x) => `<rect x="${x}" y="42" width="70" height="26" fill="#e8eefc" stroke="#3a2c10" stroke-width="2"/><text x="${x + 35}" y="60" text-anchor="middle" font-size="13" font-weight="700" fill="#1a1408">Ziffer</text>`;
  let s = `<line x1="8" y1="46" x2="8" y2="64" stroke="#3a2c10" stroke-width="2"/>`;
  s += linie('M8,55 H48') + pf(48, 55, 'r') + term(48, '-') + linie('M76,55 H118') + pf(118, 55, 'r');
  s += linie('M28,55 Q36,92 52,92 H82 Q96,92 100,55') + pf(72, 92, 'r');                 // „-“ überspringen
  s += nt(118) + linie('M188,55 H258') + linie('M200,55 Q202,20 186,20 H122 Q106,20 108,55') + pf(150, 20, 'l');   // Ziffer wiederholen
  s += pf(258, 55, 'r') + term(258, ',') + linie('M286,55 H306') + pf(306, 55, 'r');
  s += nt(306) + linie('M376,55 H455') + linie('M388,55 Q390,20 374,20 H310 Q294,20 296,55') + pf(338, 20, 'l');
  s += linie('M226,55 Q232,104 250,104 H400 Q418,104 424,55') + pf(330, 104, 'r');      // Nachkommateil überspringen
  s += pf(455, 55, 'r') + `<line x1="455" y1="46" x2="455" y2="64" stroke="#3a2c10" stroke-width="2"/><line x1="460" y1="46" x2="460" y2="64" stroke="#3a2c10" stroke-width="2"/>`;
  s += `<text x="8" y="30" font-size="13" font-weight="700" fill="#2c3d78">zahl</text>`;
  return `<svg class="dssvg" viewBox="0 0 470 118" style="max-width:700px">${s}</svg>`;
}
const PB_ZAHL_WOERTER = ['-12', '3,50', '-,5', '12,', '007', '1,2,3', '--4', '0'];
const PB_istZahl = (w) => /^-?\d+(,\d+)?$/.test(w);

// Ableitungsbaum zeichnen: Knoten = [Beschriftung, ...Kinder]
function PB_svgBaum(baum, bits = false) {
  const kn = [];
  let blatt = 0, tiefe = 0;
  const lege = (n, d) => {
    tiefe = Math.max(tiefe, d);
    const k = { t: n[0], d, kinder: n.slice(1).map((c) => lege(c, d + 1)) };
    k.x = k.kinder.length ? (k.kinder[0].x + k.kinder[k.kinder.length - 1].x) / 2 : blatt++;
    kn.push(k);
    return k;
  };
  lege(baum, 0);
  const dx = 40, dy = 42, X = (k) => 22 + k.x * dx, Y = (k) => 20 + k.d * dy, W = 44 + (blatt - 1) * dx, Hh = 40 + tiefe * dy;
  let s = '';
  for (const k of kn) k.kinder.forEach((c, i) => {
    s += `<line x1="${X(k)}" y1="${Y(k) + 9}" x2="${X(c)}" y2="${Y(c) - 10}" stroke="#7a6a50" stroke-width="1.5"/>`;
    if (bits) s += `<text x="${(X(k) + X(c)) / 2 + (i ? 7 : -7)}" y="${(Y(k) + Y(c)) / 2 + 2}" text-anchor="middle" font-size="12" font-weight="700" fill="#b03020">${i}</text>`;
  });
  for (const k of kn) {
    const term = !k.kinder.length;
    s += `<circle cx="${X(k)}" cy="${Y(k)}" r="12" fill="${term ? '#fff2b0' : '#e8eefc'}" stroke="#3a2c10" stroke-width="1.5"/><text x="${X(k)}" y="${Y(k) + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#1a1408">${esc(k.t)}</text>`;
  }
  return `<svg class="dssvg" viewBox="0 0 ${W} ${Hh}" style="max-width:${W * 1.5}px">${s}</svg>`;
}
// Beispielbaum für a+a*a mit E → E+T | T, T → T*F | F, F → (E) | a
const PB_BAUM_BSP = ['E', ['E', ['T', ['F', ['a']]]], ['+'], ['T', ['T', ['F', ['a']]], ['*'], ['F', ['a']]]];
const PB_AUSDRUCK_G = 'E → E + T | T\nT → T * F | F\nF → ( E ) | a';

// Tests für ist_zahl (Syntaxdiagramm als Automat in Python)
const PB_ZAHL_TESTS = [...PB_ZAHL_WOERTER, '', '-', '4,2-', '12,75'];

const PB_GRAMMATIK_11 = 'S → 0S | 1A\nA → 0S | 1E | 1\nE → 0E | 1E | 0 | 1';

HOEFE.push(
  // --- Kapitel 160: 🔁 Grammatik ↔ Automat (Kurs 6.11, 6.12) ---
  AFRAGEN({ id: 'ua1', kapitel: 160, ico: '🔁', titel: 'Von der Grammatik zum Automaten', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Reguläre Grammatik G',
    tabelle: () => ({ html: PB_bild(`<pre class="mono dscode">G = ({S, A, E}, {0, 1}, P, S)\n${PB_GRAMMATIK_11}</pre><p class="hinweis">Jedes Nichtterminal wird ein Zustand, jede Regel ein Übergang.</p>`) }),
    story: 'Otto, der Torwärter, hat zwei Bauanleitungen für dasselbe Tor gefunden: eine Grammatik und einen Automaten. Ob die wirklich dasselbe beschreiben? Reguläre Grammatiken und endliche Automaten lassen sich ineinander umbauen – Regel für Regel.',
    ziel: 'Bau aus der regulären Grammatik G den passenden DEA.',
    merke: { titel: '🔁 Grammatik → Automat', text: 'Jedes Nichtterminal wird ein Zustand, das Startsymbol der Startzustand. Aus A → aB wird ein Übergang A –a→ B; eine Regel A → a, die die Ableitung beendet, führt in einen Endzustand. Entsteht dabei ein NEA, macht die Potenzmengenkonstruktion daraus einen DEA.', code: 'A → 1E  wird  A –1→ E\nA → 1   heißt: nach A –1→ darf das Wort enden' },
    fragen: [{ art: 'automat', text: 'Trag die Übergänge aus den Regeln ein und kreuz den Endzustand an. (A → 1 und A → 1E landen beide in E.)', zustaende: ['S', 'A', 'E'], alphabet: ['0', '1'], ziel: (w) => w.includes('11'), maxLaenge: 7, beispiel: '0110',
      loesung: { ende: ['E'], delta: { S: { 0: 'S', 1: 'A' }, A: { 0: 'S', 1: 'E' }, E: { 0: 'E', 1: 'E' } } } },
      PB_W('Welche Sprache erzeugt G?', ['Wörter, die mit 11 enden', 'Wörter, die irgendwo 11 enthalten', 'Wörter mit einer geraden Anzahl Einsen', 'Wörter, die mit 1 beginnen'], 1),
      { art: 'liste', text: 'Welche Zustände durchläuft dein Automat beim Wort 0110 (mit dem Start)?', soll: () => automatLauf({ start: 'S', ende: ['E'], delta: { S: { 0: 'S', 1: 'A' }, A: { 0: 'S', 1: 'E' }, E: { 0: 'E', 1: 'E' } } }, '0110').weg }],
    tipps: ['S → 0S heißt: von S mit 0 nach S. S → 1A: von S mit 1 nach A.', 'A → 1E und A → 1 bedeuten beide: von A mit 1 nach E, und E ist Endzustand.', 'E → 0E | 1E: E bleibt bei 0 und 1 in E.'] }),
  AFRAGEN({ id: 'ua2', kapitel: 160, ico: '📜', titel: 'Vom Automaten zur Grammatik', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'DEA: beginnt mit ab',
    tabelle: () => ({ html: PB_bild(`${svgAutomat(PB_AU_AB, { fang: 'F' })}${deltaTabelle(PB_AU_AB)}<p class="hinweis">F (grau) ist der Fangzustand.</p>`) }),
    ziel: 'Welche regulären Produktionen gehören zu diesem DEA?',
    merke: { titel: '📜 Automat → Grammatik', text: 'Jeder Zustand wird ein Nichtterminal, der Startzustand das Startsymbol. Aus jedem Übergang q –a→ p wird die Regel q → ap; ist p ein Endzustand, kommt q → a dazu. Den Fangzustand lässt man weg – aus ihm kann nie ein gültiges Wort entstehen.' },
    fragen: [PB_W('Welche Grammatik entsteht nach dem Verfahren (Fangzustand weggelassen)?', [
      'S → aP · P → bE | b · E → aE | bE | a | b',
      'S → aP | bF · P → aF | bE | b · E → aE | bE | a | b · F → aF | bF',
      'S → aP · P → bE · E → aE | bE',
      'S → aP · P → bE | b · E → a | b'], 0),
    PB_W('Warum ist die zweite Grammatik (mit F) zwar nicht falsch, aber unschön?', ['F erzeugt zusätzliche Wörter, die gar nicht zur Sprache gehören', 'aus F kann man nie ein Wort ohne Nichtterminal ableiten – die Regeln mit F sind nutzlos', 'F ist ein Terminal und darf links nicht stehen', 'mit F ist die Grammatik nicht mehr regulär'], 1),
    PB_W('Was fehlt der dritten Grammatik (S → aP · P → bE · E → aE | bE)?', ['nichts, sie erzeugt genau dieselben Wörter wie die erste', 'Regeln wie P → b, mit denen die Ableitung enden darf – sie erzeugt gar kein Wort', 'die Regeln für den Fangzustand F aus der zweiten', 'eine Regel S → ε für das leere Wort am Anfang'], 1),
    { art: 'zahl', text: 'Wie viele Regeln (Alternativen einzeln gezählt) hat die richtige Grammatik?', soll: () => PB_regeln(PB_AU_AB.delta, ['E'], 'F').length }],
    tipps: ['Fangzustand weglassen, auch alle Pfeile, die hineinführen.', 'Pfeil in einen Endzustand: zusätzlich die Regel ohne Nichtterminal (P → b).'] }),
  AUTO({ id: 'ua3', kapitel: 160, sortArt: 'funktion', ico: '🐍', titel: 'Regeln automatisch erzeugen', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Beispiel',
    tabelle: () => ({ html: PB_bild(`${svgAutomat(PB_AU_AB, { fang: 'F' })}<pre class="mono dscode">regeln(AB, ["E"], "F")\n→ ["S -> aP", "P -> bE", "P -> b",\n   "E -> aE", "E -> a", "E -> bE", "E -> b"]</pre>`) }),
    ziel: 'Schreib regeln(delta, ende, fang): Gib für jeden Übergang z –c→ p die Regel "z -> cp" zurück und direkt danach "z -> c", wenn p ein Endzustand ist. Übergänge aus dem und in den Fangzustand fang lässt du weg (fang = "" heißt: keiner). Reihenfolge wie im Dictionary.',
    vorspann: `AB = ${py(PB_AU_AB.delta)}\nGERADE = ${py(PB_AU_GERADE)}\nSCHLOSS = ${py(PB_AU_SCHLOSS)}\n`,
    listen: [[], [], []], aufrufFn: (l, k) => ['regeln(AB, ["E"], "F")', 'regeln(GERADE, ["G"], "")', 'regeln(SCHLOSS, ["O"], "")'][k],
    soll: (l, k) => PB_regeln(...PB_REGEL_TESTS[k]), testName: (k) => ['beginnt mit ab', 'gerade Anzahl a', 'Zahlenschloss'][k],
    befehle: [K_B('def regeln(delta, ende, fang):')],
    tipps: ['Zwei Schleifen: über die Zustände z und über die Zeichen c in delta[z].', 'Ist z oder p der Fangzustand, überspringen.', 'Nach "z -> cp" gleich prüfen: if p in ende: aus.append(z + " -> " + c)'],
    loesung: 'def regeln(delta, ende, fang):\n    aus = []\n    for z in delta:\n        if z != fang:\n            for c in delta[z]:\n                p = delta[z][c]\n                if p != fang:\n                    aus.append(z + " -> " + c + p)\n                    if p in ende:\n                        aus.append(z + " -> " + c)\n    return aus' }),
  AFRAGEN({ id: 'ua4', kapitel: 160, ico: '🫥', titel: 'ε-Regeln entfernen', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Grammatik mit ε-Regeln',
    tabelle: () => ({ html: PB_bild('<pre class="mono dscode">S → aA | bB | ε\nA → aA | b\nB → bB | ε</pre><p class="hinweis">ε ist das leere Wort. A → ε heißt: A darf einfach verschwinden.</p>') }),
    ziel: 'Mach die Grammatik ε-frei, ohne die Sprache zu ändern.',
    merke: { titel: '🫥 ε-Regeln entfernen', text: '1. Bestimme alle Nichtterminale, die ε erzeugen können. 2. Für jede Regel A → aB, bei der B ε erzeugen kann, ergänze A → a. 3. Streiche alle ε-Regeln – nur S → ε darf bleiben, wenn ε zur Sprache gehört und S auf keiner rechten Seite steht (sonst neues Startsymbol S\' mit S\' → ε).', code: 'S → aS | ε   wird zu\nS\' → aS | a | ε\nS  → aS | a' },
    fragen: [PB_W('Welche Nichtterminale können ε erzeugen?', ['nur S', 'S und B', 'A und B', 'alle drei'], 1),
      PB_W('Welche Regel muss man wegen B → ε ergänzen?', ['nur S → b', 'nur B → b', 'S → b und B → b', 'S → b und A → b'], 2),
      PB_W('Wie sieht die ε-freie Grammatik aus?', ['S → aA | bB | b | ε · A → aA | b · B → bB | b', 'S → aA | bB · A → aA | b · B → bB', 'S → aA | bB | b · A → aA | b · B → bB | b | ε', 'S → aA | b · A → aA | b · B → b'], 0),
      PB_W('Warum darf S → ε hier stehen bleiben?', ['ε-Regeln sind am Startsymbol immer erlaubt', 'ε gehört zur Sprache – und S steht auf keiner rechten Seite', 'weil S → ε als erste Regel aufgeschrieben wurde', 'weil B → ε schon gestrichen wurde und S nun ε braucht'], 1),
      PB_W('Andere Grammatik: S → bS | a | ε. S steht rechts. Wie sieht die ε-freie Grammatik aus?', ['S → bS | a | b (ε einfach streichen)', 'S\' → bS | b | a | ε und S → bS | b | a', 'S → bS | b | a | ε', 'S\' → ε und S → bS | a'], 1)],
    tipps: ['B → ε direkt; S → ε direkt. A → aA | b erzeugt immer ein b.', 'S → bB mit ε-fähigem B: ergänze S → b. B → bB: ergänze B → b.'] }),
  AFRAGEN({ id: 'ua5', kapitel: 160, ico: '🔐', titel: 'Das Zahlenschloss 3-1-4', lohn: 75,
    ziel: 'Die Schatzkammer hat ein Zahlenschloss mit den Tasten 1, 3 und 4. Es springt auf, sobald jemand 3, 1, 4 direkt hintereinander tippt – und bleibt dann offen. Bau den DEA.',
    fragen: [{ art: 'automat', text: 'Z = nichts Passendes, D = „3 getippt“, E = „3-1 getippt“, O = offen. Achtung: Eine 3 ist immer ein neuer Anfang!', zustaende: ['Z', 'D', 'E', 'O'], alphabet: ['1', '3', '4'], ziel: (w) => w.includes('314'), maxLaenge: 6, beispiel: '33314',
      loesung: { ende: ['O'], delta: PB_AU_SCHLOSS } },
    PB_W('Jemand tippt 3 3 1 4. Geht das Schloss auf?', ['nein, die erste 3 war falsch', 'ja – nach der zweiten 3 ist der Automat wieder in D', 'nur beim zweiten Mal', 'das hängt vom Startzustand ab'], 1)],
    tipps: ['Aus jedem Zustand führt die 3 nach D (außer aus O).', 'Falsche Taste ohne 3: zurück nach Z.', 'O ist Endzustand und bleibt bei jeder Taste in O.'] }),

  // --- Kapitel 161: 🌳 Syntaxdiagramm und Ableitungsbaum (Abi: Syntaxdiagramm, Ableitungsbaum) ---
  AFRAGEN({ id: 'ub1', kapitel: 161, ico: '🛤️', titel: 'Das Syntaxdiagramm', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Syntaxdiagramm „zahl“',
    tabelle: () => ({ html: PB_bild(`${PB_svgSyntax()}<p class="hinweis">Runde Kästen = Terminale (stehen so im Wort), eckige = Nichtterminale (Ziffer = 0 | 1 | … | 9). Folge den Pfeilen vom Anfang bis zum Ende.</p>
      <div class="dbtab"><div class="dbscroll"><table><tr><th>Nr.</th>${PB_ZAHL_WOERTER.map((w, i) => `<th>${i + 1}</th>`).join('')}</tr><tr><th>Wort</th>${PB_ZAHL_WOERTER.map((w) => `<td class="mono">${esc(w)}</td>`).join('')}</tr></table></div></div>`) }),
    story: 'Am Torwerk hängt ein neues Schild: ein Netz aus Schienen und Kästchen. „Das ist ein Syntaxdiagramm“, sagt Otto. „Wer den Schienen folgen kann, weiß sofort, welche Zahlen auf einem Passierschein stehen dürfen.“',
    ziel: 'Lies das Syntaxdiagramm und entscheide, welche Wörter gültige Zahlen sind.',
    merke: { titel: '🛤️ Syntaxdiagramm', text: 'Ein Syntaxdiagramm zeigt eine Regel als Schienennetz: Runde Kästen sind Terminale, eckige Kästen Nichtterminale (mit eigenem Diagramm). Ein Wort ist gültig, wenn es einen Weg vom Anfang zum Ende gibt, der genau seine Zeichen liest. Eine Umgehung bedeutet „optional“ [ … ], eine Rückschleife „beliebig oft wiederholen“ { … }.' },
    fragen: [{ art: 'liste', text: 'Welche Wörter (Nummern) sind gültige Zahlen?', soll: () => PB_ZAHL_WOERTER.map((w, i) => (PB_istZahl(w) ? i + 1 : 0)).filter(Boolean) },
      PB_W('Welche EBNF beschreibt das Diagramm? ([ ] = optional, { } = beliebig oft)', ['zahl = ["-"] Ziffer {Ziffer} ["," Ziffer {Ziffer}]', 'zahl = "-" Ziffer {Ziffer} "," Ziffer {Ziffer}', 'zahl = ["-"] {Ziffer} ["," {Ziffer}]', 'zahl = {"-"} Ziffer {Ziffer} ["," Ziffer {Ziffer}]'], 0),
      PB_W('Warum ist „12,“ ungültig?', ['nach dem Komma muss mindestens eine Ziffer kommen', 'vor dem Komma dürfen höchstens zwei Ziffern stehen', 'das Komma ist kein Terminal, sondern ein Nichtterminal', 'es ist gültig, die Ziffern nach dem Komma sind optional'], 0),
      PB_W('Zu welchem Chomsky-Typ gehört diese Sprache?', ['Typ 3 – regulär, es gibt nichts zu verschachteln', 'nur Typ 2', 'Typ 1', 'Typ 0'], 0)],
    tipps: ['Die Rückschleife über „Ziffer“ erlaubt 1, 2, 3 … Ziffern, aber nicht 0 Ziffern.', 'Das Komma darf nur einmal vorkommen, das Minus nur vorn.'] }),
  AFRAGEN({ id: 'ub2', kapitel: 161, ico: '🌳', titel: 'Der Ableitungsbaum', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Grammatik für Rechenausdrücke',
    tabelle: () => ({ html: PB_bild(`<pre class="mono dscode">${PB_AUSDRUCK_G}</pre><p class="hinweis">Beispiel: der Ableitungsbaum für a+a*a</p>${PB_svgBaum(PB_BAUM_BSP)}`) }),
    ziel: 'Leite das Wort (a+a)*a als Linksableitung ab und überlege, wie sein Ableitungsbaum aussieht.',
    merke: { titel: '🌳 Ableitungsbaum', text: 'Im Ableitungsbaum steht das Startsymbol oben; jede angewendete Regel hängt ihre rechte Seite als Kinder an ein Nichtterminal. Die Blätter von links nach rechts gelesen ergeben das Wort. Bei der Linksableitung ersetzt man immer das am weitesten links stehende Nichtterminal. Was tiefer im Baum steht, wird zuerst ausgerechnet – so legt die Grammatik fest, dass * stärker bindet als +.' },
    fragen: [{ art: 'liste', text: 'Linksableitung von (a+a)*a: E ⇒ … Gib die nächsten vier Satzformen ohne Leerzeichen an (z. B. T*F).', soll: () => ['T', 'T*F', 'F*F', '(E)*F'] },
      { art: 'zahl', text: 'Wie viele Ableitungsschritte (⇒) braucht die ganze Linksableitung von E bis (a+a)*a?', soll: () => 11 },
      { art: 'zahl', text: 'Wie viele Blätter hat der Ableitungsbaum von (a+a)*a?', soll: () => '(a+a)*a'.length },
      { art: 'zahl', text: 'Wie viele Knoten mit F hat der Baum?', soll: () => 4 },
      PB_W('Welcher Operator steht im Baum von (a+a)*a am höchsten (am nächsten an der Wurzel)?', ['+','* – der Ausdruck ist ein Produkt; die Summe steckt tiefer in der Klammer', '(', 'a'], 1),
      PB_W('Warum braucht man für (a+a)*a die Regel F → ( E )?', ['damit a als Nichtterminal abgeleitet werden kann', 'nur über F kommt man von T wieder zurück zu E – so entsteht eine Summe innerhalb eines Produkts', 'damit die Linksableitung eindeutig bleibt', 'weil Klammern Terminale sind und eigene Regeln brauchen'], 1)],
    tipps: ['E ⇒ T ⇒ T*F ⇒ F*F ⇒ (E)*F ⇒ (E+T)*F ⇒ …', 'Blätter = Zeichen des Worts: ( a + a ) * a', 'F-Knoten: einer für (E), einer für das letzte a, zwei für die a in der Klammer.'] }),
  AFRAGEN({ id: 'ub3', kapitel: 161, ico: '🏛️', titel: 'Automatentypen und Chomsky', lohn: 65,
    ziel: 'Welche Maschine erkennt welchen Grammatiktyp?',
    merke: { titel: '🏛️ Maschinen zur Chomsky-Hierarchie', text: 'Typ 3 (regulär) – endlicher Automat. Typ 2 (kontextfrei) – Kellerautomat. Typ 1 (kontextsensitiv) – linear beschränkter Automat (LBA): eine Turingmaschine, deren Band nur so lang ist wie die Eingabe. Typ 0 – Turingmaschine mit unendlichem Band.' },
    fragen: [{ art: 'liste', text: 'Gib die Chomsky-Typen an für: endlicher Automat, Turingmaschine, Kellerautomat, linear beschränkter Automat (vier Zahlen in dieser Reihenfolge).', soll: () => [3, 0, 2, 1] },
      PB_W('Was unterscheidet einen LBA von einer Turingmaschine?', ['er hat keinen Lesekopf', 'sein Band ist nur so lang wie die Eingabe', 'er kann das Band nur lesen, nicht beschreiben', 'er hat einen Stapel'], 1),
      PB_W('{ aⁿbⁿcⁿ | n ≥ 1 } ist …', ['regulär (Typ 3)', 'kontextfrei (Typ 2)', 'kontextsensitiv (Typ 1)', 'nur Typ 0 (Turingmaschine)'], 2),
      PB_W('Welche Maschine reicht, um zu prüfen, ob die Klammern in einem Programm stimmen?', ['endlicher Automat', 'Kellerautomat', 'erst eine Turingmaschine', 'keine'], 1),
      PB_W('Jede reguläre Sprache ist auch …', ['nur regulär, aber nicht kontextfrei', 'kontextfrei, kontextsensitiv und Typ 0', 'kontextfrei, aber nicht kontextsensitiv', 'Typ 0, aber nicht immer entscheidbar'], 1)],
    tipps: ['Je kleiner die Typnummer, desto mächtiger die Maschine.'] }),
  AUTO({ id: 'ub4', kapitel: 161, sortArt: 'funktion', knobel: true, ico: '🧗', titel: 'Das Syntaxdiagramm als Automat', lohn: 90, ansicht: 'tabelle', titelAnsicht: 'Syntaxdiagramm „zahl“',
    tabelle: () => ({ html: PB_bild(`${PB_svgSyntax()}<p class="hinweis">Jede Stelle im Schienennetz ist ein Zustand: start, minus, ganz, komma, bruch. Endzustände: ganz und bruch.</p>`) }),
    ziel: 'Schreib ist_zahl(wort): True, wenn das Wort zum Syntaxdiagramm „zahl“ passt. Lies das Wort Zeichen für Zeichen wie ein DEA mit den Zuständen start, minus, ganz, komma, bruch – passt ein Zeichen nicht, wird verworfen.',
    listen: PB_ZAHL_TESTS.map(() => []), aufrufFn: (l, k) => `ist_zahl("${PB_ZAHL_TESTS[k]}")`, soll: (l, k) => PB_istZahl(PB_ZAHL_TESTS[k]), testName: (k) => `„${PB_ZAHL_TESTS[k] || 'ε'}“`,
    befehle: [K_B('def ist_zahl(wort):'), K_B('zustand = "¦"'), K_B('.isdigit()'), K_B('elif ¦:'), K_B(' or ')],
    tipps: ['start –"-"→ minus, start/minus/ganz –Ziffer→ ganz.', 'ganz –","→ komma, komma/bruch –Ziffer→ bruch. Alles andere: return False (Fangzustand).', 'Am Ende akzeptieren, wenn der Zustand ganz oder bruch ist – „12,“ endet in komma.'],
    loesung: 'def ist_zahl(wort):\n    zustand = "start"\n    for z in wort:\n        if zustand == "start" and z == "-":\n            zustand = "minus"\n        elif (zustand == "start" or zustand == "minus" or zustand == "ganz") and z.isdigit():\n            zustand = "ganz"\n        elif zustand == "ganz" and z == ",":\n            zustand = "komma"\n        elif (zustand == "komma" or zustand == "bruch") and z.isdigit():\n            zustand = "bruch"\n        else:\n            return False\n    return zustand == "ganz" or zustand == "bruch"' }),
);

HEFT_EXTRA[160] = { titel: 'Grammatik ↔ Automat',
  text: ['Grammatik → Automat: Nichtterminale werden Zustände, A → aB wird der Übergang A –a→ B, A → a führt in einen Endzustand.', 'Automat → Grammatik: aus q –a→ p wird q → ap, führt der Pfeil in einen Endzustand, kommt q → a dazu; der Fangzustand fällt weg.', 'ε-Regeln entfernen: ε-fähige Nichtterminale suchen, A → a ergänzen, ε-Regeln streichen (nur S → ε darf bleiben, wenn S rechts nicht vorkommt).'],
  code: 'S → 0S | 1A      S –0→ S, S –1→ A\nA → 1E | 1       A –1→ E (E ist Endzustand)' };
HEFT_EXTRA[161] = { titel: 'Syntaxdiagramm und Ableitungsbaum',
  text: ['Im Syntaxdiagramm sind runde Kästen Terminale und eckige Nichtterminale; Umgehung = optional, Rückschleife = Wiederholung.', 'Im Ableitungsbaum steht das Startsymbol oben, die Blätter ergeben das Wort; tiefer Stehendes wird zuerst ausgewertet.', 'Endlicher Automat – Typ 3, Kellerautomat – Typ 2, linear beschränkter Automat – Typ 1, Turingmaschine – Typ 0.'],
  code: 'E ⇒ T ⇒ T*F ⇒ F*F ⇒ (E)*F ⇒ (E+T)*F ⇒ … ⇒ (a+a)*a' };

// ======================= Burg 28: Signalturm =======================

// Gegebener Huffman-Baum (wie im Abi 2026 / Abi-Vorbereitung Aufgabe 1.1.9: Baum ablesen, codieren, decodieren, Speicherbedarf)
const PB_HUFF_BAUM = ['', ['A'], ['', ['', ['B'], ['R']], ['', ['K'], ['D']]]];
const PB_haeufig = (text) => { const h = {}; for (const z of text) h[z] = (h[z] || 0) + 1; return h; };
const PB_CODE = { A: '0', B: '100', R: '101', K: '110', D: '111' };
const PB_LAMPE = { L: '00', A: '01', M: '10', P: '110', E: '111' };
const PB_MUEHLE = { M: '00', 'Ü': '01', H: '10', L: '110', E: '111' };
const PB_huffBits = (text, code) => [...text].reduce((s, z) => s + code[z].length, 0);
const PB_kodiere = (t, c) => [...t].map((z) => c[z]).join('');
function PB_dekodiere(bits, c) {
  const r = Object.fromEntries(Object.entries(c).map(([k, v]) => [v, k]));
  let t = '', p = '';
  for (const b of bits) { p += b; if (r[p]) { t += r[p]; p = ''; } }
  return t;
}
const PB_KOD_TESTS = [['kodiere("ABRA", CODE)', PB_kodiere('ABRA', PB_CODE), 'kodiere ABRA'], ['kodiere("ABRAKADABRA", CODE)', PB_kodiere('ABRAKADABRA', PB_CODE), 'kodiere ABRAKADABRA'], ['kodiere("LAMPE", LAMPE)', PB_kodiere('LAMPE', PB_LAMPE), 'kodiere LAMPE'],
  [`dekodiere("${PB_kodiere('ABRA', PB_CODE)}", CODE)`, 'ABRA', 'dekodiere ABRA'], [`dekodiere("${PB_kodiere('PALME', PB_LAMPE)}", LAMPE)`, 'PALME', 'dekodiere PALME'], ['dekodiere("", CODE)', '', 'leere Bitfolge']];
const PB_SPEICHER_TESTS = [['ABRAKADABRA', 'CODE', PB_CODE], ['LAMPE', 'LAMPE', PB_LAMPE], ['MÜHLE', 'MUEHLE', PB_MUEHLE], ['', 'CODE', PB_CODE]];
const PB_utf8 = (t) => [...t].reduce((s, z) => { const c = z.codePointAt(0); return s + (c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4); }, 0);

// KV-Diagramme als Tabelle (Gray-Code-Reihenfolge 00 01 11 10)
const PB_GRAY = ['00', '01', '11', '10'];
function PB_kv3(f) {
  return `<div class="dbtab"><div class="dbscroll"><table><tr><th>A \\ BC</th>${PB_GRAY.map((g) => `<th>${g}</th>`).join('')}</tr>
    ${[0, 1].map((a) => `<tr><th>${a}</th>${PB_GRAY.map((g) => `<td><b>${f({ A: a, B: +g[0], C: +g[1] })}</b></td>`).join('')}</tr>`).join('')}</table></div></div>`;
}
function PB_kv4(f) {
  return `<div class="dbtab"><div class="dbscroll"><table><tr><th>AB \\ CD</th>${PB_GRAY.map((g) => `<th>${g}</th>`).join('')}</tr>
    ${PB_GRAY.map((r) => `<tr><th>${r}</th>${PB_GRAY.map((g) => `<td><b>${f({ A: +r[0], B: +r[1], C: +g[0], D: +g[1] })}</b></td>`).join('')}</tr>`).join('')}</table></div></div>`;
}
const PB_E_KV = ['or', 'C', ['and', 'A', 'B']];                                   // Einsen bei m1, m3, m5, m6, m7
const PB_KV4 = (b) => (b.B === b.D ? 1 : 0);                                       // Mitte (B ∧ D) und vier Ecken (¬B ∧ ¬D)
const PB_E_MUX = ['or', ['and', ['not', 'S'], 'A'], ['and', 'S', 'B']];
const PB_imp = (x, y) => ['or', ['not', x], y];
const PB_E_MP = PB_imp(['and', PB_imp('A', 'B'), 'A'], 'B');                       // ((A → B) ∧ A) → B

// Binäraddition von Hand: Ergebnis und Zahl der Überträge
function PB_addBin(a, b) {
  let c = 0, s = '', n = 0;
  for (let i = a.length - 1; i >= 0; i--) { const t = +a[i] + +b[i] + c; s = (t % 2) + s; c = t >> 1; n += c; }
  return { s, uebertraege: n };
}
const PB_X = '01101011', PB_Y = '00110110';

HOEFE.push(
  // --- Kapitel 162: 🗜️ Daten kompakt: Huffman ---
  SFRAGEN({ id: 'uc1', kapitel: 162, ico: '💾', titel: 'Wie viel Speicher braucht ein Text?', lohn: 60,
    story: 'Die Nachbarburg beschwert sich: Unsere Lampen-Botschaften dauern ewig! Lumi rechnet nach, wie viele Bits ein Text wirklich braucht – und ob es kürzer geht.',
    ziel: 'Berechne den Speicherbedarf von Texten in ASCII, UTF-8 und UTF-32.',
    merke: { titel: '💾 Speicherbedarf', text: 'ASCII: 1 Byte (8 Bit) je Zeichen. UTF-8: ASCII-Zeichen 1 Byte, ä/ö/ü/ß 2 Byte, € 3 Byte, Emojis 4 Byte. UTF-32: jedes Zeichen 4 Byte.', code: '„Küche“ in UTF-8:\nK ü c h e = 1+2+1+1+1 = 6 Byte' },
    fragen: [{ art: 'zahl', text: 'Wie viele Bit braucht „SIGNALTURM“ in ASCII mit 8 Bit je Zeichen?', soll: () => 'SIGNALTURM'.length * 8 },
      { art: 'zahl', text: 'Wie viele Byte braucht „Grüße“ in UTF-8?', soll: () => PB_utf8('Grüße') },
      { art: 'zahl', text: 'Und in UTF-32?', soll: () => [...'Grüße'].length * 4 },
      { art: 'zahl', text: 'Ein Buch hat 300 000 Zeichen, alle aus ASCII. Wie viele KB (1 KB = 1000 Byte) braucht es in UTF-32?', soll: () => 1200 },
      { art: 'zahl', text: 'Und in UTF-8 (KB)?', soll: () => 300 }],
    tipps: ['UTF-32: immer 4 Byte je Zeichen.', 'ü und ß brauchen in UTF-8 je 2 Byte.'] }),
  SFRAGEN({ id: 'uc2', kapitel: 162, ico: '🌲', titel: 'Der Huffman-Baum', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Huffman-Baum für ABRAKADABRA',
    tabelle: () => ({ html: PB_bild(`${PB_svgBaum(PB_HUFF_BAUM, true)}<p class="hinweis">Von der Wurzel zum Blatt: links 0, rechts 1. Beim Decodieren nach jedem erreichten Blatt wieder an der Wurzel beginnen.</p>`) }),
    ziel: 'Lies die Codes aus dem Huffman-Baum ab, codiere, decodiere und vergleiche den Speicherbedarf mit ASCII.',
    merke: { titel: '🌲 Huffman-Codierung', text: 'Bei der Huffman-Codierung bekommen häufige Zeichen kurze Codes, seltene lange. Den Code liest man im Huffman-Baum ab: von der Wurzel zum Blatt, links 0, rechts 1. Kein Code ist der Anfang eines anderen – deshalb lässt sich die Bitfolge ohne Trennzeichen eindeutig decodieren.' },
    fragen: [{ art: 'liste', text: 'Gib die Codes von A, B, R, K und D an (fünf Bitfolgen).', soll: () => ['A', 'B', 'R', 'K', 'D'].map((z) => PB_CODE[z]) },
      { art: 'liste', text: 'Codiere das Wort DAKAR (eine Bitfolge ohne Lücken).', soll: () => [PB_kodiere('DAKAR', PB_CODE)] },
      { art: 'liste', text: `Decodiere die Bitfolge ${PB_kodiere('BARKA', PB_CODE)}.`, soll: () => ['BARKA'] },
      { art: 'zahl', text: 'Wie viele Bit braucht ABRAKADABRA mit diesem Huffman-Code?', soll: () => PB_huffBits('ABRAKADABRA', PB_CODE) },
      { art: 'zahl', text: 'Und in ASCII mit 1 Byte je Zeichen (in Bit)?', soll: () => 'ABRAKADABRA'.length * 8 },
      PB_W('Zwischen den Codes stehen keine Trennzeichen. Warum lässt sich die Bitfolge trotzdem eindeutig decodieren?', ['weil alle Codes gleich lang sind', 'alle Zeichen sind Blätter – kein Code ist der Anfang eines anderen Codes', 'weil der Empfänger das Wort kennt', 'gar nicht, man braucht Trennzeichen'], 1)],
    tipps: ['A hängt direkt links an der Wurzel: Code 0. Für die anderen geht es zuerst nach rechts.', 'Zähle, wie oft jeder Buchstabe vorkommt: A 5, B 2, R 2, K 1, D 1. Dann Anzahl · Codelänge addieren.'] }),
  SIGNAL({ id: 'uc3', kapitel: 162, sortArt: 'funktion', ico: '📡', titel: 'Kodieren und dekodieren', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Zwei Codes',
    tabelle: () => ({ html: PB_bild(`<pre class="mono dscode">CODE  = ${py(PB_CODE)}\nLAMPE = ${py(PB_LAMPE)}</pre>`) }),
    ziel: 'Schreib kodiere(text, code): hängt die Codewörter aller Zeichen aneinander. Und dekodiere(bits, code): liest Bit für Bit, bis die gelesenen Bits ein Codewort ergeben, und schreibt dann das Zeichen. Die Codes sind präfixfrei.',
    vorspann: `CODE = ${py(PB_CODE)}\nLAMPE = ${py(PB_LAMPE)}\n`,
    listen: PB_KOD_TESTS.map(() => []), aufrufFn: (l, k) => PB_KOD_TESTS[k][0], soll: (l, k) => PB_KOD_TESTS[k][1], testName: (k) => PB_KOD_TESTS[k][2],
    befehle: [K_B('def kodiere(text, code):'), K_B('def dekodiere(bits, code):'), K_B('code[¦]'), K_B('{}'), K_B('in rueck'), K_B('= ""')],
    tipps: ['kodiere: für jedes Zeichen z das Codewort code[z] anhängen.', 'dekodiere: erst ein umgedrehtes Dictionary rueck bauen (Codewort → Zeichen).', 'Bits in einem puffer sammeln; sobald puffer in rueck ist: Zeichen anhängen, puffer = "".'],
    loesung: 'def kodiere(text, code):\n    bits = ""\n    for z in text:\n        bits = bits + code[z]\n    return bits\n\ndef dekodiere(bits, code):\n    rueck = {}\n    for z in code:\n        rueck[code[z]] = z\n    text = ""\n    puffer = ""\n    for b in bits:\n        puffer = puffer + b\n        if puffer in rueck:\n            text = text + rueck[puffer]\n            puffer = ""\n    return text' }),
  SIGNAL({ id: 'uc4', kapitel: 162, sortArt: 'funktion', knobel: true, ico: '⭐', titel: 'Speicherbedarf im Vergleich', lohn: 90, ansicht: 'tabelle', titelAnsicht: 'Drei Huffman-Codes',
    tabelle: () => ({ html: PB_bild(`<pre class="mono dscode">CODE   = ${py(PB_CODE)}\nLAMPE  = ${py(PB_LAMPE)}\nMUEHLE = ${py(PB_MUEHLE)}</pre>`) }),
    ziel: 'Schreib speicherbedarf(text, code): Gib eine Liste mit dem Speicherbedarf in Bit zurück – [mit dem Huffman-Code, mit 1 Byte je Zeichen (z. B. Latin-1 – Ü ist kein ASCII-Zeichen), UTF-8, UTF-32]. UTF-8: Codepoint ord(z) < 128 → 1 Byte, < 2048 → 2 Byte, < 65536 → 3 Byte, sonst 4 Byte.',
    vorspann: `CODE = ${py(PB_CODE)}\nLAMPE = ${py(PB_LAMPE)}\nMUEHLE = ${py(PB_MUEHLE)}\n`,
    listen: PB_SPEICHER_TESTS.map(() => []), aufrufFn: (l, k) => `speicherbedarf("${PB_SPEICHER_TESTS[k][0]}", ${PB_SPEICHER_TESTS[k][1]})`,
    soll: (l, k) => { const [t, , c] = PB_SPEICHER_TESTS[k]; return [PB_huffBits(t, c), [...t].length * 8, PB_utf8(t) * 8, [...t].length * 32]; }, testName: (k) => `„${PB_SPEICHER_TESTS[k][0] || 'leerer Text'}“`,
    befehle: [K_B('def speicherbedarf(text, code):'), K_B('len(¦)'), K_B('ord(¦)'), K_B('elif ¦:'), K_B('< 2048')],
    tipps: ['Huffman: für jedes Zeichen len(code[z]) aufaddieren.', 'UTF-8: je nach ord(z) 1, 2, 3 oder 4 Byte zählen – am Ende mal 8.', 'ASCII: 8 Bit je Zeichen, UTF-32: 32 Bit je Zeichen.'],
    loesung: 'def speicherbedarf(text, code):\n    huffman = 0\n    utf8 = 0\n    for z in text:\n        huffman = huffman + len(code[z])\n        n = ord(z)\n        if n < 128:\n            utf8 = utf8 + 1\n        elif n < 2048:\n            utf8 = utf8 + 2\n        elif n < 65536:\n            utf8 = utf8 + 3\n        else:\n            utf8 = utf8 + 4\n    return [huffman, len(text) * 8, utf8 * 8, len(text) * 32]' }),

  // --- Kapitel 163: 🔀 Standardschaltnetze und KV ---
  SFRAGEN({ id: 'ud1', kapitel: 163, ico: '🔀', titel: 'Multiplexer und Demultiplexer', lohn: 70, ansicht: 'tabelle', titelAnsicht: '2:1-Multiplexer',
    tabelle: () => ({ html: PB_bild(`${svgSchaltung(PB_E_MUX, 'Y')}<p class="hinweis">S = Steuereingang (beide S-Eingänge im Bild sind dasselbe Signal), A und B = Dateneingänge</p>`) }),
    story: 'Zwei Wachen melden gleichzeitig – aber es gibt nur eine Signallampe. Ein Multiplexer entscheidet, wessen Meldung durchkommt.',
    ziel: 'Untersuche den Multiplexer und den Demultiplexer.',
    merke: { titel: '🔀 Multiplexer', text: 'Ein Multiplexer (MUX) schaltet einen von mehreren Dateneingängen auf einen Ausgang; die Steuereingänge wählen aus. 2:1-MUX: Y = (¬S ∧ A) ∨ (S ∧ B). Mit n Steuerleitungen wählt man aus 2ⁿ Eingängen. Ein Demultiplexer (DEMUX) macht es umgekehrt: Er leitet einen Eingang D auf den gewählten von mehreren Ausgängen.' },
    fragen: [WT('Ausgang Y des 2:1-Multiplexers', ['S', 'A', 'B'], PB_E_MUX, { spalte: 'Y' }),
      PB_W('Welcher Eingang kommt durch, wenn S = 1 ist?', ['A', 'B', 'beide', 'keiner'], 1),
      { art: 'zahl', text: 'Wie viele Steuerleitungen braucht ein 8:1-Multiplexer?', soll: () => 3 },
      WT('Demultiplexer 1:2: Ausgang Y1 bekommt das Signal D, wenn S = 1 ist (sonst 0).', ['S', 'D'], ['and', 'S', 'D'], { spalte: 'Y1' }),
      PB_W('Wofür braucht man einen Demultiplexer?', ['um mehrere Signale auf eine gemeinsame Leitung zu bündeln', 'um ein Signal an einen von mehreren Empfängern zu schicken – z. B. eine Speicherzelle auswählen', 'um aus zwei Eingangsbits Summe und Übertrag zu bilden', 'um die Bits eines Signals der Reihe nach umzudrehen'], 1)],
    tipps: ['S = 0: das obere UND lässt A durch. S = 1: das untere lässt B durch.', '2³ = 8'] }),
  SFRAGEN({ id: 'ud2', kapitel: 163, ico: '🗺️', titel: 'Das KV-Diagramm', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'KV-Diagramm für f(A, B, C)',
    tabelle: () => ({ html: PB_bild(`${PB_kv3((b) => ausWert(PB_E_KV, b))}<p class="hinweis">Spalten in Gray-Reihenfolge 00, 01, 11, 10: Nachbarn unterscheiden sich in genau einem Bit – auch die rechte und die linke Spalte.</p>`) }),
    ziel: 'Lies die Funktion aus dem KV-Diagramm, vereinfache sie und prüf das Ergebnis mit einer Wahrheitstabelle.',
    fragen: [{ art: 'zahl', text: 'Wie viele Minterme hat die KDNF dieser Funktion?', soll: () => belegungen(['A', 'B', 'C']).filter((b) => ausWert(PB_E_KV, b)).length },
      PB_W('Die vier Einsen in den Spalten 01 und 11 bilden einen Block. Was bleibt davon übrig?', ['A', 'B', 'C – A und B ändern sich im Block und fallen weg', 'A ∧ B'], 2),
      PB_W('Welcher Ausdruck ist die vereinfachte Funktion?', ['C ∨ (A ∧ B)', 'A ∨ (B ∧ C)', 'C ∧ (A ∨ B)', '(A ∧ C) ∨ B'], 0),
      WT('Prüf deinen vereinfachten Ausdruck aus der vorigen Frage: Fülle seine Wahrheitstabelle aus.', ['A', 'B', 'C'], PB_E_KV)],
    tipps: ['Zähle die Einsen im Diagramm.', 'Zweiter Block: die Einsen in Zeile A = 1 bei BC = 11 und 10 → A ∧ B.'] }),
  SFRAGEN({ id: 'ud3', kapitel: 163, knobel: true, ico: '🍩', titel: 'KV mit vier Variablen', lohn: 85, ansicht: 'tabelle', titelAnsicht: 'KV-Diagramm für f(A, B, C, D)',
    tabelle: () => ({ html: PB_bild(`${PB_kv4(PB_KV4)}<p class="hinweis">Zeilen AB und Spalten CD in Gray-Reihenfolge. Oberer und unterer Rand sind Nachbarn, linker und rechter auch.</p>`) }),
    ziel: 'Fasse die Einsen zu möglichst großen Blöcken zusammen.',
    merke: { titel: '🍩 Blöcke über den Rand', text: 'Im KV-Diagramm sind auch die gegenüberliegenden Ränder benachbart – man kann sich das Diagramm zu einer Rolle gebogen vorstellen. Beim 4 × 4-Diagramm bilden deshalb auch die vier Eckfelder eine Gruppe. Eine Variable, die sich innerhalb einer Gruppe ändert, fällt weg.' },
    fragen: [{ art: 'zahl', text: 'Wie viele Einsen stehen im Diagramm?', soll: () => belegungen(['A', 'B', 'C', 'D']).filter(PB_KV4).length },
      PB_W('Welche Variablen bleiben vom Block der vier Einsen in der Mitte des Diagramms übrig?', ['A ∧ C', 'B ∧ D', 'B ∧ C ∧ D', 'D'], 1),
      PB_W('Warum dürfen die vier Ecken einen Block bilden?', ['dürfen sie nicht', 'gegenüberliegende Ränder sind benachbart – die Ecken unterscheiden sich nur in A bzw. C', 'weil in allen vier Ecken eine Eins steht', 'weil sich die Ecken in allen Variablen gleichen'], 1),
      PB_W('Welcher Ausdruck beschreibt f?', ['(B ∧ D) ∨ (¬B ∧ ¬D)', 'B ∧ D', 'B ∨ D', '(A ∧ C) ∨ (¬A ∧ ¬C)'], 0),
      PB_W('Wie heißt diese Funktion noch?', ['B ⊕ D (XOR)', '¬(B ⊕ D) – Äquivalenz: 1, wenn B und D gleich sind', 'B → D', 'A ∧ B ∧ C ∧ D'], 1)],
    tipps: ['Im mittleren Block ändern sich A und C – sie fallen weg.', 'Die Ecken: B = 0 und D = 0.'] }),
  SFRAGEN({ id: 'ud4', kapitel: 163, ico: '♾️', titel: 'Tautologie und Widerspruch', lohn: 65,
    ziel: 'Immer wahr, nie wahr oder manchmal? Prüf es mit Wahrheitstabellen.',
    merke: { titel: '♾️ Tautologie', text: 'Eine Tautologie ist in jeder Zeile der Wahrheitstabelle wahr, ein Widerspruch in keiner. Alles dazwischen heißt erfüllbar. Mit A → B = ¬A ∨ B lassen sich Implikationen in Gatter umsetzen.' },
    fragen: [WT('((A → B) ∧ A) → B', ['A', 'B'], PB_E_MP),
      PB_W('Was ist ((A → B) ∧ A) → B also?', ['Tautologie', 'Widerspruch', 'erfüllbar – aber keine Tautologie'], 0),
      PB_W('A ∧ ¬A ist …', ['Tautologie', 'Widerspruch', 'erfüllbar – aber keine Tautologie'], 1),
      PB_W('(A ∧ B) → A ist …', ['Tautologie', 'Widerspruch', 'erfüllbar – aber keine Tautologie'], 0),
      PB_W('A → (A ∧ B) ist …', ['Tautologie', 'Widerspruch', 'erfüllbar – aber keine Tautologie'], 2)],
    tipps: ['Leg dir Hilfsspalten an: erst A → B, dann (A → B) ∧ A, dann den ganzen Ausdruck.', 'Eine Implikation ist nur falsch, wenn links 1 und rechts 0 steht.', 'A → (A ∧ B): Probier A = 1, B = 0.'] }),

  // --- Kapitel 164: 📏 Rechnerkennzahlen ---
  SFRAGEN({ id: 'ue1', kapitel: 164, ico: '🚌', titel: 'Das Bussystem', lohn: 65,
    story: 'Im Keller des Signalturms verbinden drei Bündel von Leitungen die Rechenmaschine mit dem Speicher. Lumi will wissen, wie viel Speicher die Maschine überhaupt ansprechen kann.',
    ziel: 'Daten-, Adress- und Steuerbus – und wie viel Speicher sich adressieren lässt.',
    merke: { titel: '🚌 Bussystem', text: 'Über den Adressbus schickt die CPU die Nummer der Speicherzelle (nur in eine Richtung). Der Datenbus überträgt die Daten in beide Richtungen; seine Breite sagt, wie viele Bits auf einmal fließen. Der Steuerbus trägt Signale wie Lesen/Schreiben und Takt. Mit n Adressleitungen erreicht man 2ⁿ Speicherzellen.' },
    fragen: [PB_W('Über welchen Bus schickt die CPU die Nummer der Speicherzelle?', ['Datenbus', 'Adressbus', 'Steuerbus', 'Taktleitung'], 1),
      PB_W('Welcher Bus überträgt in beide Richtungen?', ['Adressbus', 'Datenbus', 'keiner'], 1),
      PB_W('Was läuft über den Steuerbus?', ['die Speicheradressen der gewünschten Zelle', 'Signale wie „Lesen“, „Schreiben“ und der Takt', 'die Daten, die in den Speicher geschrieben werden', 'die Befehle des Programms aus dem Speicher'], 1),
      { art: 'zahl', text: 'Ein Adressbus hat 16 Leitungen, jede Adresse gehört zu 1 Byte. Wie viele Byte lassen sich adressieren?', soll: () => 2 ** 16 },
      { art: 'zahl', text: 'Bei 32 Adressleitungen: Wie viele GiB (1 GiB = 2³⁰ Byte)?', soll: () => 4 },
      { art: 'zahl', text: 'Wie viele Adressleitungen braucht man mindestens für 1 MiB (2²⁰ Byte)?', soll: () => 20 },
      { art: 'zahl', text: 'Der Datenbus ist 64 Bit breit. Wie viele Byte fließen je Übertragung?', soll: () => 8 }],
    tipps: ['n Leitungen → 2ⁿ Adressen.', '2³² = 2² · 2³⁰'] }),
  SFRAGEN({ id: 'ue2', kapitel: 164, ico: '⚡', titel: 'Cache und mehr Kerne', lohn: 70,
    ziel: 'Rechne mit Trefferquoten und überlege, wann mehr Kerne helfen.',
    merke: { titel: '⚡ Cache und Kerne', text: 'Mittlere Zugriffszeit: t = h · t_Cache + (1 − h) · t_Speicher (h = Trefferquote). Ein Mehrkernprozessor hat mehrere vollständige Steuer- und Rechenwerke (Kerne), die gleichzeitig verschiedene Programme abarbeiten können. Beim Multithreading bearbeitet ein Kern einen anderen Befehlsstrom, während einer auf Daten aus dem Speicher wartet.' },
    fragen: [{ art: 'zahl', text: 'Cache 2 ns, Hauptspeicher 60 ns, Trefferquote 95 %. Wie groß ist die mittlere Zugriffszeit in ns?', soll: () => 4.9, tol: 0.001 },
      { art: 'zahl', text: 'Und bei einer Trefferquote von 80 %?', soll: () => 13.6, tol: 0.001 },
      PB_W('Warum ist die Trefferquote trotz kleinem Cache meist so hoch?', ['Größe – der Cache ist fast so groß wie der Hauptspeicher', 'Lokalität – Programme greifen oft wieder auf dieselben und benachbarte Daten zu', 'Vorhersage – die CPU errät immer die nächste Adresse', 'Takt – der Cache läuft mit doppeltem Takt'], 1),
      PB_W('Was ist ein Mehrkernprozessor?', ['ein Prozessor, der mehrere Befehle in einem Takt holen kann', 'mehrere vollständige Kerne auf einem Chip – jeder mit eigenem Steuer- und Rechenwerk', 'ein Prozessor mit mehreren Caches für Daten und Befehle', 'mehrere Rechner im Netz, die gemeinsam an einer Aufgabe arbeiten'], 1),
      PB_W('Werbung: „Mit 8 Kernen läuft jedes Programm 8-mal so schnell!“ Was stimmt?', ['das stimmt, weil jeder Kern ein Achtel des Programms abarbeitet', 'nur aufteilbare Aufgaben werden schneller – ein Programm mit nur einem Befehlsstrom nutzt einen Kern', 'das stimmt nur, wenn auch der Cache achtmal so groß ist', 'mehr Kerne machen jedes Programm durch den höheren Takt schneller'], 1),
      PB_W('Was passiert beim Multithreading, während ein Befehlsstrom auf Daten aus dem Speicher wartet?', ['der Kern macht Pause, bis die Daten da sind', 'der Kern bearbeitet in der Zeit einen anderen Befehlsstrom', 'der Takt wird kurz erhöht, damit die Daten schneller ankommen', 'ein anderer Kern übernimmt den wartenden Befehlsstrom'], 1)],
    tipps: ['0,95 · 2 + 0,05 · 60', 'Ein Kern arbeitet einen Befehlsstrom ab – mehr Kerne helfen nur, wenn es mehrere gibt.'] }),
  SFRAGEN({ id: 'ue3', kapitel: 164, ico: '✍️', titel: 'Rechnen wie das Rechenwerk', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Schriftliche Addition',
    tabelle: () => ({ html: PB_bild(`<pre class="mono dscode">  ${PB_X}\n+ ${PB_Y}\n  ────────\n  ????????</pre><p class="hinweis">0 + 0 = 0, 0 + 1 = 1, 1 + 1 = 0 Übertrag 1, 1 + 1 + 1 = 1 Übertrag 1</p>`) }),
    ziel: 'Addiere binär von Hand und rechne im Vierersystem.',
    merke: { titel: '✍️ Stellenwertsysteme', text: 'Binär addiert man wie dezimal, nur ist bei 2 schon Übertrag. Im Vierersystem gibt es die Ziffern 0–3 und die Stellenwerte 1, 4, 16, 64 … Je zwei Bit ergeben genau eine Ziffer im Vierersystem (wie je vier Bit eine Hexziffer).', code: '45 = 2·16 + 3·4 + 1 → 231 (Vierersystem)' },
    fragen: [{ art: 'zahl', text: `${PB_X} + ${PB_Y} = ? (8 Bit, nur 0 und 1 eintippen)`, soll: () => Number(PB_addBin(PB_X, PB_Y).s) },
      { art: 'zahl', text: 'Wie viele Überträge (1) entstehen dabei?', soll: () => PB_addBin(PB_X, PB_Y).uebertraege },
      { art: 'zahl', text: 'Welche Dezimalzahl ist das Ergebnis (vorzeichenlos)?', soll: () => parseInt(PB_addBin(PB_X, PB_Y).s, 2) },
      { art: 'zahl', text: 'Und im 8-Bit-Zweierkomplement gelesen?', soll: () => parseInt(PB_addBin(PB_X, PB_Y).s, 2) - 256 },
      PB_W('107 und 54 sind positiv, das Ergebnis im 8-Bit-Zweierkomplement aber negativ. Was ist passiert?', ['ein Rechenfehler beim Übertrag', 'ein Überlauf – 161 liegt außerhalb des Bereichs −128 bis 127, das höchste Bit wird als Vorzeichen gelesen', 'nichts, das ist richtig so', 'der Übertrag ganz links fehlt'], 1),
      { art: 'zahl', text: 'Schreib 27 im Vierersystem.', soll: () => Number((27).toString(4)) },
      { art: 'zahl', text: 'Welche Dezimalzahl ist 3012 im Vierersystem?', soll: () => parseInt('3012', 4) },
      PB_W('Wie lautet 110110 (binär) im Vierersystem?', ['312', '123', '66', '54'], 0)],
    tipps: ['Von rechts: 1+0 = 1, 1+1 = 0 Übertrag 1, …', 'Zweierkomplement: Ist das erste Bit 1, ziehe 256 ab.', 'Vierersystem: 27 : 4 = 6 Rest 3, 6 : 4 = 1 Rest 2, 1 : 4 = 0 Rest 1.'] }),
);

HEFT_EXTRA[162] = { titel: 'Daten kompakt: Huffman',
  text: ['ASCII braucht 1 Byte je Zeichen, UTF-8 1 bis 4 Byte, UTF-32 immer 4 Byte.', 'Im Huffman-Baum liest man den Code von der Wurzel zum Blatt ab (links 0, rechts 1); häufige Zeichen haben kurze Codes.', 'Kein Code ist Anfang eines anderen – die Bitfolge lässt sich ohne Trennzeichen eindeutig decodieren.'],
  code: 'ABRAKADABRA: ASCII 88 Bit, Huffman 23 Bit' };
HEFT_EXTRA[163] = { titel: 'Standardschaltnetze und KV',
  text: ['Ein Multiplexer wählt mit n Steuerleitungen einen von 2ⁿ Eingängen aus; ein Demultiplexer verteilt ein Signal auf einen von mehreren Ausgängen.', 'Im KV-Diagramm fasst man benachbarte Einsen zu Blöcken aus 1, 2, 4, 8 Feldern zusammen – auch über den Rand. Variablen, die sich im Block ändern, fallen weg.', 'Tautologie: immer wahr. Widerspruch: nie wahr.'],
  code: '2:1-MUX: Y = (¬S ∧ A) ∨ (S ∧ B)' };
HEFT_EXTRA[164] = { titel: 'Rechnerkennzahlen',
  text: ['Adressbus: n Leitungen → 2ⁿ Speicherzellen. Datenbus: Breite = Bits je Übertragung. Steuerbus: Lesen/Schreiben, Takt.', 'Mittlere Zugriffszeit mit Cache: t = h · t_Cache + (1 − h) · t_Speicher.', 'Mehrkernprozessor: mehrere Kerne arbeiten gleichzeitig verschiedene Befehlsströme ab; Multithreading nutzt Wartezeiten eines Kerns.'],
  code: '0,95 · 2 ns + 0,05 · 60 ns = 4,9 ns' };
