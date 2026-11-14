'use strict';
// --- 🌾 Höfe: Aufgaben der Region Algorithmen ---------------------------------------
// Feld-Zeichen: . Erde · r Rübe · s Setzling (nicht ernten!) · g gegossener Setzling · u Unkraut · # Zaun
// start: Position und Blickrichtung des Bauern (O, S, W, N); varianten: weitere Lagen für Prüfläufe
// sprache: erlaubte Sprachmittel (for, while, var, if, else, elif); befehle: Bausteine; neu: leuchten als „neu“
// par/sparsam (⭐ kurz / ⭐ sparsam) werden aus der Musterlösung berechnet (autoZiele in tag.js), wenn sie fehlen.
// bloecke: true = Blockmodus (antippen statt tippen) · knobel: true = goldener Zusatzhof, sperrt nichts
// giessen: true = alle Setzlinge müssen gegossen werden · meldung(st) = Zahl, die am Ende mit print() kommen muss
// merke: Lernkarte beim ersten Öffnen – nur bei neuem Konzept. vorlage: Code, mit dem der Hof beginnt.
// Reihenfolge: Blöcke → Sequenz → for → while → Variablen → if → if/else → if/elif/else.
// Jedes Kapitel hat 5–8 Höfe, die langsam schwerer werden, und am Ende einen ⭐ Knobelhof.

const BAUSTEINE = {
  forward: { text: 'forward()', zeigt: 'forward()', ico: '⬆️' },
  harvest: { text: 'harvest()', zeigt: 'harvest()', ico: '🥕' },
  turn_right: { text: 'turn_right()', zeigt: 'turn_right()', ico: '↪️' },
  turn_left: { text: 'turn_left()', zeigt: 'turn_left()', ico: '↩️' },
  water: { text: 'water()', zeigt: 'water()', ico: '💧' },
  pull: { text: 'pull()', zeigt: 'pull()', ico: '🌿' },
  pick_up: { text: 'pick_up()', zeigt: 'pick_up()', ico: '✋' },
  place: { text: 'place()', zeigt: 'place()', ico: '🧱' },
  for: { text: 'for i in range(¦):', zeigt: 'for i in range( ):', kw: true, ico: '🔁' },
  while: { text: 'while can_move():', zeigt: 'while can_move():', kw: true },
  if: { text: 'if can_harvest():', zeigt: 'if can_harvest():', kw: true },
  else: { text: 'else:', zeigt: 'else:', kw: true },
  elif: { text: 'elif is_weed():', zeigt: 'elif is_weed():', kw: true },
  // Burg 8 ab dem 2. Hof eines Kapitels (Nachprüfung 2026-11-14): nur das Schlüsselwort – die Bedingung schreibt man selbst
  while_: { text: 'while ¦:', zeigt: 'while ▢:', kw: true },
  if_: { text: 'if ¦:', zeigt: 'if ▢:', kw: true },
  elif_: { text: 'elif ¦:', zeigt: 'elif ▢:', kw: true },
};

// Kapitel-Nummern sind feste Ids (Spielstände hängen daran). Welche Burg sie hat und in welcher Reihenfolge, steht in BURGEN.
const KAPITEL = [null,
  { name: 'Blöcke', ico: '🧩' },
  { name: 'Python tippen', ico: '⌨️' },
  { name: 'Die Zählschleife for', ico: '🔁' },
  { name: 'Die Schleife while', ico: '🚧' },
  { name: 'Variablen', ico: '📦' },
  { name: 'Verzweigung if', ico: '❓' },
  { name: 'Zweifach: if/else', ico: '💧' },
  { name: 'Mehrfach: if/elif/else', ico: '🌿' },
  { name: 'Auffrischung', ico: '🔄' },
  { name: 'Zählen mit while', ico: '📏' },
];
KAPITEL[22] = { name: 'Ziegel und Löcher', ico: '🧱' };   // Robot-Karol-Aufgaben: aufheben, legen (Burg 7, nach for)
KAPITEL[23] = { name: 'Listen', ico: '📋' };   // Burg 8 (Lehrplan Kl. 8: Arrays), nach elif

// 🏰 Eine Burg je Klassenstufe (PLAN.md 7b): eigener Spielstand, eigene Kapitel in fester Reihenfolge
const BURGEN = {
  7: { name: 'Burg 7', ico: '🏰', klasse: 7, kapitel: [1, 3, 22, 5, 2], text: 'Mit Blöcken: Befehle, Drehen, die Zählschleife for, Ziegel legen, Variablen. Zum Schluss Python selbst tippen.' },
  8: { name: 'Burg 8', ico: '🏯', klasse: 8, kapitel: [9, 4, 10, 6, 7, 8, 23], text: 'In Python: kurz auffrischen, dann die Schleife while, Zählen mit while, Verzweigungen if, else, elif und Listen.' },
};
const burgKapitel = () => BURGEN[BURGNR].kapitel;
const kapNr = (k) => burgKapitel().indexOf(k) + 1;   // Kapitelnummer innerhalb der Burg (1, 2, 3 …)

const O = (feld, x = 0, y = 0, dir = 'O') => ({ feld, x, y, dir });
// Lage mit Heimfeld: der Bauer muss am Ende wieder auf seinem Startfeld stehen
const HEIM = (feld, x, y = 0, dir = 'O') => ({ feld, x, y, dir, heim: true });
// Rahmen: Rand eines w×h-Ackers im Uhrzeigersinn, belegt reihum mit den Zeichen aus muster (Start oben links ist frei)
// ecke = true: auch das Startfeld oben links gehört zum Rahmen (der Bauer kommt am Ende dort an – nötig für Ziegel)
function RAHMEN(w, h, muster = 'r', ecke = false) {
  const t = Array.from({ length: h }, () => Array(w).fill('.')), weg = [];
  for (let x = 1; x < w; x++) weg.push([x, 0]);
  for (let y = 1; y < h; y++) weg.push([w - 1, y]);
  for (let x = w - 2; x >= 0; x--) weg.push([x, h - 1]);
  for (let y = h - 2; y >= 1; y--) weg.push([0, y]);
  if (ecke) weg.push([0, 0]);
  weg.forEach(([x, y], i) => { t[y][x] = muster[i % muster.length]; });
  return O(t.map((z) => z.join('')));
}
// Leerer Acker w×h (zum Messen)
const LEER = (w, h) => O(Array.from({ length: h }, () => '.'.repeat(w)));
// Eigener Baustein (z. B. mit dem Variablennamen des Hofs)
const V = (text, neu = false) => ({ text, zeigt: text, neu });
// Baustein mit Lücke: ¦ = hier tippt man selbst weiter (angezeigt als ▢), z. B. VL('print(¦)')
const VL = (text, neu = false) => ({ text, zeigt: text.replace('¦', '▢'), neu });
// 📜 Code-Regeln der Listen-Höfe (FELD.codePruefen): die Zahlen müssen aus der Liste kommen
const R_FESTE_ZAHL = { nicht: /range\(\s*\d/, text: 'In range(…) steht eine feste Zahl. Nimm die Zahl aus dem Plan – z. B. range(plan[1]).' };
const R_FORWARDS = { nicht: /forward\(\)[ \t]*\n[ \t]*forward\(\)/, text: 'Da stehen mehrere forward() untereinander. Lass lieber die Schleife mit der Zahl aus dem Plan zählen: for j in range(plan[…]):' };
// meldung(st) = die Zahl, die der Bauer am Ende mit print() melden muss (aus der Ausgangslage berechnet)
const zaehle = (st, c) => st.t.flat().filter((x) => x === c).length;
const meldeErnte = (st) => st.rueben;
const meldeSetzlinge = (st) => zaehle(st, 's');
const meldeUnkraut = (st) => zaehle(st, 'u');
const meldeLaenge = (st) => { let n = 0, x = st.x; while (FELD.frei(st, x + 1, st.y)) { x++; n++; } return n; };
const meldeUmfang = (st) => 2 * (st.w - 1) + 2 * (st.h - 1);
const meldeFlaeche = (st) => st.w * st.h;

const SEQ = ['forward', 'harvest'], DREH = ['forward', 'harvest', 'turn_right', 'turn_left'];
const S_FOR = ['for'], S_WHILE = ['for', 'while'], S_VAR = ['for', 'while', 'var'], S_IF = [...S_VAR, 'if'];
const S_ELSE = [...S_IF, 'else'], S_ELIF = [...S_ELSE, 'elif'];
const S_LISTE = [...S_ELIF, 'methoden'];   // 📋 Listen: liste.append(…) braucht die Punkt-Schreibweise

// Kurzform: Hof anlegen. Pflicht: id, kapitel, ico, titel, ziel, start, befehle, loesung, tipps
// Burg 7 bleibt lange bei Blöcken (wie Calliope/MakeCode in Klasse 7): Kapitel 1, 3 und 5 im Blockmodus, getippt wird erst in Kapitel 2 am Schluss
const BLOCK_KAPITEL = [1, 3, 22, 5];
// 🧱 Lage mit Ziegeln im Korb am Anfang
const ZIEGEL = (lage, n) => ({ ...lage, ziegel: n });
// 🧺 Lage, in der nur n Rüben in den Korb passen (w10 „Genau fünf“)
const KORB = (lage, n) => ({ ...lage, korb: n });
// Wie weit kommt der Bauer von (x, y) in Richtung dir, bis Zaun oder Rand?
function laufLaenge(st, x, y, dir) {
  const [dx, dy] = RICHTUNG[dir];
  let n = 0;
  while (FELD.frei(st, x + dx, y + dy)) { x += dx; y += dy; n++; }
  return [n, x, y];
}
// i9: bei welchem Schritt (ab Start nach Osten) kommt die 3. Rübe in die Kiste?
function meldeVoll(st) {
  let ernte = 0;
  for (let k = 1; FELD.frei(st, st.x + k, st.y); k++) if (st.t[st.y][st.x + k] === 'r' && ++ernte === 3) return k;
  return -1;
}
// 📋 Listen: die Beete (Rüben-Gruppen, getrennt durch ein leeres Feld) rechts vom Bauern als Liste – so wie Python sie druckt
const beeteVon = (st) => st.t[st.y].slice(st.x + 1).join('').split('.').map((b) => b.length);
const pyListe = (l) => `[${l.join(', ')}]`;
const KAROL = ['forward', 'pick_up', 'place'], KAROL_DREH = [...KAROL, 'turn_right', 'turn_left'];
const hof = (h) => ({ varianten: [], sprache: [], bloecke: BLOCK_KAPITEL.includes(h.kapitel), ...h });
const S_7 = ['for', 'var'];   // Burg 7: Variablen und for, noch kein while
// 🔮 Vorhersage-Hof (PRIMM): code steht fest, man spielt den Bauern mit den Knöpfen (vorhersageStart in tag.js).
// Kommt direkt nach der Einführung einer neuen Struktur, damit man sie erst liest, bevor man sie schreibt.
const VORHER = (h) => hof({ vorhersage: true, loesung: h.code, ziel: 'Lies den Code und sag voraus, was passiert – bevor er läuft. Tippe die Antworten auf dem Acker an.',
  ...h, tipps: ['Lies von oben nach unten. Eingerückte Zeilen gehören zur Zeile darüber.', ...h.tipps] });

const HOEFE = [
  // --- Kapitel 1: 🧩 Blöcke (antippen, nicht tippen) ---
  hof({ id: 'b1', kapitel: 1, bloecke: true, ico: '🥕', titel: 'Der erste Schritt', ziel: 'Ernte die Rübe.', lohn: 15,
    start: O(['.r']), befehle: SEQ, neu: SEQ,
    merke: { titel: 'Dein Bauer', text: 'Der Bauer macht genau, was deine Blöcke sagen – von oben nach unten. Tippe die Blöcke unten an.', code: 'forward()\nharvest()' },
    tipps: ['Der Bauer steht neben der Rübe. Erst muss der Bauer hingehen.', 'Erst ein Schritt, dann ernten.', 'Tippe forward() an, dann harvest().'],
    loesung: 'forward()\nharvest()' }),
  hof({ id: 'b2', kapitel: 1, bloecke: true, ico: '🥕', titel: 'Drei in einer Reihe', ziel: 'Ernte alle 3 Rüben.', lohn: 15,
    start: O(['.rrr']), befehle: SEQ,
    tipps: ['Wie beim ersten Hof – nur dreimal.', 'Immer abwechselnd: Schritt, ernten.', 'forward, harvest, forward, harvest, forward, harvest'],
    loesung: 'forward()\nharvest()\nforward()\nharvest()\nforward()\nharvest()' }),
  hof({ id: 'b3', kapitel: 1, bloecke: true, ico: '🕳️', titel: 'Eine Lücke', ziel: 'Ernte beide Rüben.', lohn: 20,
    start: O(['.r.r']), befehle: SEQ,
    tipps: ['Nicht auf jedem Feld wächst etwas.', 'Auf dem leeren Feld musst du nicht ernten.', 'forward, harvest, forward, forward, harvest'],
    loesung: 'forward()\nharvest()\nforward()\nforward()\nharvest()' }),
  hof({ id: 'b4', kapitel: 1, bloecke: true, ico: '↪️', titel: 'Die erste Kurve', ziel: 'Ernte beide Rüben.', lohn: 20,
    start: O(['.r', '.r']), befehle: DREH, neu: ['turn_right', 'turn_left'],
    merke: { titel: 'Drehen', text: '↪️ turn_right() dreht den Bauern nach rechts, ↩️ turn_left() nach links. Beim Drehen bleibt die Figur auf demselben Feld. Das gelbe Dreieck zeigt die Blickrichtung.', code: 'turn_right()\nforward()' },
    tipps: ['Die zweite Rübe liegt unter der ersten.', 'Nach der ersten Rübe muss sich der Bauer nach unten drehen – von ihm aus nach rechts.', 'forward, harvest, turn_right, forward, harvest'],
    loesung: 'forward()\nharvest()\nturn_right()\nforward()\nharvest()' }),
  VORHER({ id: 'b4v', kapitel: 1, bloecke: true, ico: '🔮', titel: 'Lies den Plan', lohn: 20,
    start: O(['.rr', 'rrr']), befehle: DREH,
    merke: { titel: '🔮 Code lesen', text: 'Der Code ist schon fertig. Sag voraus, was der Bauer tun wird: Tippe die passenden Felder an, dann ✅ Prüfen.' },
    tipps: ['Nach turn_right() schaut der Bauer nach unten.', 'Nur harvest() erntet. Läuft der Bauer über eine Rübe, bleibt sie stehen.'],
    code: 'forward()\nturn_right()\nforward()\nharvest()\nturn_left()\nforward()\nharvest()' }),
  hof({ id: 'b5', kapitel: 1, bloecke: true, ico: '↩️', titel: 'Links herum', ziel: 'Ernte alle 3 Rüben.', lohn: 20,
    start: O(['..r', '.rr'], 0, 1), befehle: DREH,
    tipps: ['Diesmal geht es nach oben.', 'Am Ende der Reihe dreht sich der Bauer nach links.', 'forward, harvest, forward, harvest, turn_left, forward, harvest'],
    loesung: 'forward()\nharvest()\nforward()\nharvest()\nturn_left()\nforward()\nharvest()' }),
  hof({ id: 'b6', kapitel: 1, bloecke: true, ico: '🔄', titel: 'Hin und zurück', ziel: 'Ernte alle 4 Rüben.', lohn: 25,
    start: O(['.rr', '.rr']), befehle: DREH,
    tipps: ['Erst die obere Reihe, dann die untere.', 'Für den Rückweg dreht sich der Bauer zweimal nach rechts – mit einem Schritt dazwischen.', 'Zwei Rüben oben, turn_right, forward, harvest, turn_right, forward, harvest'],
    loesung: 'forward()\nharvest()\nforward()\nharvest()\nturn_right()\nforward()\nharvest()\nturn_right()\nforward()\nharvest()' }),
  hof({ id: 'b7', kapitel: 1, knobel: true, bloecke: true, ico: '🪜', titel: 'Die Treppe', ziel: 'Ernte alle 6 Rüben.', lohn: 35,
    start: O(['.r..', '.rr.', '..rr', '...r']), befehle: DREH,
    tipps: ['Eine Stufe: ein Schritt nach rechts, einer nach unten.', 'Nach dem Schritt nach unten dreht sich der Bauer wieder zurück.', 'forward, harvest, turn_right, forward, harvest, turn_left – und das dreimal.'],
    loesung: 'forward()\nharvest()\nturn_right()\nforward()\nharvest()\nturn_left()\nforward()\nharvest()\nturn_right()\nforward()\nharvest()\nturn_left()\nforward()\nharvest()\nturn_right()\nforward()\nharvest()' }),

  // --- Kapitel 2: ⌨️ Python tippen (in Burg 7 das letzte Kapitel – erst nach Blöcken, Schleifen und Variablen) ---
  hof({ id: 's1', kapitel: 2, ico: '⌨️', titel: 'Jetzt wird getippt', ziel: 'Ernte beide Rüben.', lohn: 45, sprache: S_7,
    start: O(['.rr']), befehle: SEQ,
    merke: { titel: 'Python tippen', text: 'Jetzt tippst du den Code selbst: jede Zeile ein Befehl, mit () am Ende. Was in eine Schleife gehört, rückst du ein (Tab-Taste).', code: 'forward()\nharvest()' },
    tipps: ['Schreib forward() in die erste Zeile.', 'Die Klammern () gehören immer dazu.', 'forward() harvest() forward() harvest() – jeweils in eine eigene Zeile.'],
    loesung: 'forward()\nharvest()\nforward()\nharvest()' }),
  hof({ id: 's2', kapitel: 2, ico: '🌱', titel: 'Die lange Reihe', ziel: 'Ernte alle 5 Rüben.', lohn: 45, sprache: S_7,
    start: O(['.rrrrr']), befehle: [...SEQ, 'for'],
    tipps: ['Fünfmal das Gleiche – dafür gibt es die Zählschleife.', 'for i in range(5): und dann die Befehle eingerückt darunter.', 'Einrücken geht mit der Tab-Taste.'],
    loesung: 'for i in range(5):\n    forward()\n    harvest()' }),
  // (Didaktik-Prüfung 2026-11-13: keine reinen Sequenzen mehr – s3–s6 üben for, Einrückung und Variablen in neuen Lagen)
  hof({ id: 's3', kapitel: 2, ico: '🪨', titel: 'Um den Zaun', ziel: 'Ernte alle 9 Rüben. Vor dem Zaun weichst du eine Reihe nach unten aus.', lohn: 45, sprache: S_7,
    start: O(['.rrrrr#..', '.....rrrr']), befehle: [...DREH, 'for'],
    tipps: ['Zwei gerade Stücke – jedes mit einer Schleife. Dazwischen weicht der Bauer aus.', 'Ausweichen: rechts drehen, Schritt, ernten, links drehen.', 'for i in range(5): … · turn_right(), forward(), harvest(), turn_left() · for i in range(3): …'],
    loesung: 'for i in range(5):\n    forward()\n    harvest()\nturn_right()\nforward()\nharvest()\nturn_left()\nfor i in range(3):\n    forward()\n    harvest()' }),
  hof({ id: 'f5x', kapitel: 2, ico: '🐞', titel: 'Falsch eingerückt', ziel: 'Der Bauer soll beide Reihen ernten. Im Code ist eine Zeile falsch eingerückt. Finde und behebe den Fehler!', lohn: 50, sprache: S_7,
    start: O(['.rrrrr', 'rrrrrr']), befehle: [...DREH, 'for'],
    vorlage: 'for i in range(5):\n    forward()\n    harvest()\n    turn_right()\nforward()\nharvest()\nturn_right()\nfor i in range(5):\n    forward()\n    harvest()',
    tipps: ['Lass den Code laufen und schau, wann der Bauer sich zum ersten Mal dreht.', 'Eingerückte Zeilen laufen in jeder Runde. Soll sich der Bauer in jeder Runde drehen?', 'Das erste turn_right() gehört nicht in die Schleife – rück es ganz nach links.'],
    loesung: 'for i in range(5):\n    forward()\n    harvest()\nturn_right()\nforward()\nharvest()\nturn_right()\nfor i in range(5):\n    forward()\n    harvest()' }),
  hof({ id: 's7', kapitel: 2, ico: '🔲', titel: 'Das Beet tippen', ziel: 'Ernte alle Rüben rund um das Beet.', lohn: 50, sprache: S_7,
    start: RAHMEN(4, 4), befehle: [...DREH, 'for'],
    tipps: ['Wie „Rund ums Beet“ mit Blöcken – jetzt getippt.', 'Die innere Schleife ist zweimal eingerückt (8 Leerzeichen).', 'for i in range(4): · for j in range(3): forward(), harvest() · turn_right()'],
    loesung: 'for i in range(4):\n    for j in range(3):\n        forward()\n        harvest()\n    turn_right()' }),
  hof({ id: 's8', kapitel: 2, ico: '📦', titel: 'Die Kiste tippen', ziel: 'Ernte alle Rüben. Zähl dabei in einer Variable mit und melde sie am Ende mit print.', lohn: 50, sprache: S_7, meldeVar: true,
    start: O(['.rrrrrrr']), meldung: meldeErnte, befehle: [...SEQ, 'for', V('print(ernte)')],
    tipps: ['Wie „Die Erntekiste“ – jetzt getippt.', 'ernte = ernte + 1 gehört in die Schleife (eingerückt), print(ernte) danach (nicht eingerückt).', 'ernte = 0 · for i in range(7): forward(), harvest(), ernte = ernte + 1 · print(ernte)'],
    loesung: 'ernte = 0\nfor i in range(7):\n    forward()\n    harvest()\n    ernte = ernte + 1\nprint(ernte)' }),
  hof({ id: 's4', kapitel: 2, ico: '🐞', titel: 'Die Kiste wird immer leer', ziel: 'Der Bauer soll melden, wie viele Rüben er geerntet hat – er meldet aber 1. Finde und behebe den Fehler!', lohn: 50, sprache: S_7, meldeVar: true,
    start: O(['.rrrrr']), meldung: meldeErnte, befehle: [...SEQ, 'for'],
    vorlage: 'for i in range(5):\n    ernte = 0\n    forward()\n    harvest()\n    ernte = ernte + 1\nprint(ernte)',
    tipps: ['Verfolge die Kiste ernte Runde für Runde: Was steht nach Runde 1 drin, was nach Runde 2?', 'ernte = 0 leert die Kiste. Wie oft passiert das hier?', 'Die Kiste wird nur einmal angelegt – ganz oben, vor der Schleife.'],
    loesung: 'ernte = 0\nfor i in range(5):\n    forward()\n    harvest()\n    ernte = ernte + 1\nprint(ernte)' }),
  hof({ id: 's5', kapitel: 2, ico: '🧺', titel: 'Ziegel-Countdown', ziel: 'Im Korb sind 12 Ziegel. Flick alle Löcher in beiden Reihen und melde, wie viele Ziegel danach noch im Korb sind – zähl mit einer Variable herunter.', lohn: 55, sprache: S_7, meldeVar: true,
    start: ZIEGEL(O(['.oooooo', '...oooo']), 12), meldung: (st) => st.ziegel - st.loecher, befehle: [...KAROL_DREH, 'for', V('print(korb)')],
    tipps: ['Wie ein Countdown: Die Variable korb startet bei 12 und wird nach jedem place() um 1 kleiner.', 'Oben 6 Löcher, dann um die Ecke, unten noch 4 (eins davon direkt nach der Kurve).', 'korb = 12 · for (6): forward(), place(), korb = korb - 1 · Kurve mit place() · for (3): … · print(korb)'],
    loesung: 'korb = 12\nfor i in range(6):\n    forward()\n    place()\n    korb = korb - 1\nturn_right()\nforward()\nplace()\nkorb = korb - 1\nturn_right()\nfor i in range(3):\n    forward()\n    place()\n    korb = korb - 1\nprint(korb)' }),
  hof({ id: 's6', kapitel: 2, knobel: true, ico: '🐌', titel: 'Die Schnecke', ziel: 'Ernte alle 24 Rüben – der Bauer läuft wie ein Schneckenhaus nach innen. Die Seiten werden immer kürzer: eine Variable hilft.', lohn: 65, sprache: S_7,
    start: O(['.rrrr', 'rrrrr', 'rrrrr', 'rrrrr', 'rrrrr']), befehle: [...DREH, 'for'],
    tipps: ['Die Seiten sind 4, 4, 4, 3, 3, 2, 2, 1, 1 Felder lang.', 'Nach der ersten Seite kommen immer zwei gleich lange Seiten – danach ist seite eins kleiner.', 'Erste Seite + turn_right() · dann for i in range(4): zweimal (for j in range(seite): …, turn_right()) und seite = seite - 1'],
    loesung: 'seite = 4\nfor j in range(seite):\n    forward()\n    harvest()\nturn_right()\nfor i in range(4):\n    for k in range(2):\n        for j in range(seite):\n            forward()\n            harvest()\n        turn_right()\n    seite = seite - 1' }),

  // --- Kapitel 3: 🔁 Die Zählschleife for ---
  hof({ id: 'f1', kapitel: 3, ico: '🌱', titel: 'Zehn am Stück', ziel: 'Ernte alle 10 Rüben.', lohn: 30,
    start: O(['.rrrrrrrrrr']), befehle: [...SEQ, 'for'], neu: ['for'], sprache: S_FOR,
    merke: { titel: 'Die Zählschleife for', text: 'Mit 🔁 for wiederholst du Befehle so oft, wie die Zahl sagt. Blöcke, die du danach antippst, landen in der Schleife – bis „⬅ aus der Schleife“.', code: 'for i in range(4):\n    turn_right()' },
    tipps: ['Zehnmal Schritt und Ernten – das wären 20 Blöcke! Mit einer Schleife sind es drei.', 'Erst for antippen, dann forward() und harvest() – sie landen in der Schleife.', 'Stell im for-Block die Zahl auf 10.'],
    loesung: 'for i in range(10):\n    forward()\n    harvest()' }),
  VORHER({ id: 'f1v', kapitel: 3, ico: '🔮', titel: 'Wie oft?', lohn: 30,
    start: O(['.rrrrr', '...r..']), befehle: DREH, sprache: S_FOR,
    tipps: ['Die beiden eingerückten Zeilen kommen 3-mal hintereinander – nicht öfter, auch wenn noch Rüben liegen.', 'turn_right() ist nicht eingerückt: Es kommt erst nach der Schleife, nur einmal. Danach kommt kein harvest() mehr.'],
    code: 'for i in range(3):\n    forward()\n    harvest()\nturn_right()\nforward()' }),
  hof({ id: 'f2', kapitel: 3, ico: '🌾', titel: 'Zwölf am Stück', ziel: 'Ernte alle 12 Rüben.', lohn: 30,
    start: O(['.rrrrrrrrrrrr']), befehle: [...SEQ, 'for'], sprache: S_FOR,
    tipps: ['Fast wie der letzte Hof.', 'Nur die Zahl in range(…) ändert sich.', 'for i in range(12): …'],
    loesung: 'for i in range(12):\n    forward()\n    harvest()' }),
  hof({ id: 'f3', kapitel: 3, ico: '🦘', titel: 'Jedes zweite Feld', ziel: 'Ernte alle 6 Rüben.', lohn: 35,
    start: O(['..r.r.r.r.r.r']), befehle: [...SEQ, 'for'], sprache: S_FOR,
    tipps: ['Was wiederholt sich? Schau dir zwei Felder zusammen an.', 'In der Schleife: zwei Schritte, dann ernten.', 'for i in range(6): forward(), forward(), harvest()'],
    loesung: 'for i in range(6):\n    forward()\n    forward()\n    harvest()' }),
  hof({ id: 'f4', kapitel: 3, ico: '📐', titel: 'Der Winkel', ziel: 'Ernte alle 10 Rüben.', lohn: 35,
    start: O(['.rrrrrr', '......r', '......r', '......r', '......r']), befehle: [...DREH, 'for'], sprache: S_FOR,
    tipps: ['Zwei gerade Stücke, dazwischen eine Kurve.', 'Eine Schleife nach rechts, drehen, eine Schleife nach unten.', 'for (6-mal), turn_right(), for (4-mal)'],
    loesung: 'for i in range(6):\n    forward()\n    harvest()\nturn_right()\nfor i in range(4):\n    forward()\n    harvest()' }),
  hof({ id: 'f5', kapitel: 3, ico: '🔄', titel: 'Zwei lange Reihen', ziel: 'Ernte beide Reihen.', lohn: 40,
    start: O(['.rrrrrrrr', 'rrrrrrrrr']), befehle: [...DREH, 'for'], sprache: S_FOR,
    tipps: ['Wie „Hin und zurück“ – nur viel länger.', 'Am Ende oben: rechts drehen, Schritt, ernten, noch mal rechts drehen.', 'Zwei for-Schleifen mit range(8), dazwischen die Kurve.'],
    loesung: 'for i in range(8):\n    forward()\n    harvest()\nturn_right()\nforward()\nharvest()\nturn_right()\nfor i in range(8):\n    forward()\n    harvest()' }),
  hof({ id: 'f6', kapitel: 3, ico: '🪜', titel: 'Die Treppe', ziel: 'Ernte alle 10 Rüben.', lohn: 40,
    start: O(['.r....', '.rr...', '..rr..', '...rr.', '....rr', '.....r']), befehle: [...DREH, 'for'], sprache: S_FOR,
    tipps: ['Erinnerst du dich an die erste Treppe? Eine Stufe wiederholt sich.', 'Eine Stufe: Schritt, ernten, rechts, Schritt, ernten, links.', 'for i in range(5): und darunter die sechs Befehle einer Stufe.'],
    loesung: 'for i in range(5):\n    forward()\n    harvest()\n    turn_right()\n    forward()\n    harvest()\n    turn_left()' }),
  hof({ id: 'f7', kapitel: 3, ico: '🟩', titel: 'Zwei Beete', ziel: 'Ernte beide Beete.', lohn: 40,
    start: O(['.rrrrr.rrrrr']), befehle: [...SEQ, 'for'], sprache: S_FOR,
    tipps: ['Zwischen den Beeten liegt ein leeres Feld.', 'Eine Schleife fürs erste Beet, ein Schritt, eine Schleife fürs zweite.', 'Profis wiederholen das Ganze mit einer zweiten Schleife drumherum.'],
    loesung: 'for i in range(5):\n    forward()\n    harvest()\nforward()\nfor i in range(5):\n    forward()\n    harvest()' }),
  hof({ id: 'f8', kapitel: 3, ico: '🔲', titel: 'Rund ums Beet', ziel: 'Ernte alle Rüben rund um das Beet.', lohn: 45,
    start: RAHMEN(6, 6), befehle: [...DREH, 'for'], sprache: S_FOR,
    merke: { titel: 'Schleife in der Schleife', text: 'Eine Schleife darf in einer anderen stehen. Die innere läuft bei jeder Runde der äußeren ganz durch – hier turn_right() 2 · 3 = 6-mal.', code: 'for i in range(2):\n    for j in range(3):\n        turn_right()\n    forward()' },
    tipps: ['Jede Seite ist gleich: 5 Schritte mit Ernten, dann rechts drehen.', 'Eine Seite ist eine Schleife. Und die Seiten wiederholen sich viermal.', 'for (4) · darin for (5) mit forward(), harvest() · ⬅ einmal raus · turn_right()'],
    loesung: 'for i in range(4):\n    for j in range(5):\n        forward()\n        harvest()\n    turn_right()' }),
  VORHER({ id: 'f8v', kapitel: 3, ico: '🔮', titel: 'Schleife in der Schleife lesen', lohn: 45,
    start: O(['.rrr', '..r.', '.rr.']), befehle: DREH, sprache: S_FOR,
    tipps: ['Die innere Schleife läuft bei jedem Durchgang der äußeren ganz durch.', 'Einmal außen = 2× (Schritt, ernten), dann rechts drehen. Außen sind es nur 2 Runden.'],
    code: 'for i in range(2):\n    for j in range(2):\n        forward()\n        harvest()\n    turn_right()' }),
  hof({ id: 'f9', kapitel: 3, knobel: true, ico: '🏯', titel: 'Das große Beet', ziel: 'Ernte alle Rüben rund um das große Beet.', lohn: 50,
    start: RAHMEN(9, 9), befehle: [...DREH, 'for'], sprache: S_FOR,
    tipps: ['Wie „Rund ums Beet“, nur größer.', 'Wie viele Schritte hat eine Seite?', 'Innen range(8).'],
    loesung: 'for i in range(4):\n    for j in range(8):\n        forward()\n        harvest()\n    turn_right()' }),

  // --- Kapitel 22: 🧱 Ziegel und Löcher (wie Robot Karol: aufheben und legen, Burg 7 nach for) ---
  hof({ id: 'z1', kapitel: 22, ico: '🧱', titel: 'Der erste Ziegel', ziel: 'Heb den Ziegel auf und flick damit das Loch.', lohn: 35,
    start: O(['.zo']), befehle: KAROL, neu: ['pick_up', 'place'], sprache: S_FOR,
    merke: { titel: 'Ziegel', text: 'Der Weg hat Löcher. ✋ pick_up() hebt einen Ziegel in den Korb, 🧱 place() legt ihn ins Loch unter dem Bauern.', code: 'forward()\npick_up()\nforward()\nplace()' },
    tipps: ['Erst zum Ziegel gehen.', 'Aufheben, dann weiter zum Loch.', 'forward, pick_up, forward, place'],
    loesung: 'forward()\npick_up()\nforward()\nplace()' }),
  hof({ id: 'z2', kapitel: 22, ico: '🕳️', titel: 'Löcher im Weg', ziel: 'Flick alle 9 Löcher. Im Korb sind genug Ziegel.', lohn: 35,
    start: ZIEGEL(O(['.ooooooooo']), 9), befehle: [...KAROL, 'for'], sprache: S_FOR,
    tipps: ['Neunmal das Gleiche – das schreit nach einer Schleife.', 'In der Schleife: Schritt, Ziegel legen.', 'for (9): forward(), place()'],
    loesung: 'for i in range(9):\n    forward()\n    place()' }),
  hof({ id: 'z3', kapitel: 22, ico: '✋', titel: 'Aufräumen', ziel: 'Sammle alle 10 Ziegel ein.', lohn: 35,
    start: O(['.zzzzzzzzzz']), befehle: [...KAROL, 'for'], sprache: S_FOR,
    tipps: ['Wie beim Ernten – nur mit pick_up().', 'Schritt, aufheben – zehnmal.', 'for (10): forward(), pick_up()'],
    loesung: 'for i in range(10):\n    forward()\n    pick_up()' }),
  VORHER({ id: 'z3v', kapitel: 22, ico: '🔮', titel: 'Wohin kommen die Ziegel?', lohn: 35,
    start: O(['.zzzooo']), befehle: KAROL, sprache: S_FOR,
    tipps: ['Erst läuft die Schleife ganz durch: dreimal Schritt und aufheben.', 'Danach kommt die zweite Schleife – zweimal Schritt und legen.'],
    code: 'for i in range(3):\n    forward()\n    pick_up()\nfor i in range(2):\n    forward()\n    place()' }),
  hof({ id: 'z4', kapitel: 22, ico: '🔁', titel: 'Holen und flicken', ziel: 'Neben jedem Loch liegt ein Ziegel. Flick alle 6 Löcher.', lohn: 40,
    start: O(['.zozozozozozo']), befehle: [...KAROL, 'for'], sprache: S_FOR,
    tipps: ['Was wiederholt sich? Immer ein Ziegel, dann ein Loch.', 'In der Schleife: Schritt, aufheben, Schritt, legen.', 'for (6): forward(), pick_up(), forward(), place()'],
    loesung: 'for i in range(6):\n    forward()\n    pick_up()\n    forward()\n    place()' }),
  hof({ id: 'z5', kapitel: 22, ico: '↪️', titel: 'Erst sammeln, dann flicken', ziel: 'Oben liegen die Ziegel, unten sind die Löcher. Flick alle Löcher.', lohn: 45,
    start: O(['.zzzzzzz', '.ooooooo']), befehle: [...KAROL_DREH, 'for'], sprache: S_FOR,
    tipps: ['Erst die obere Reihe einsammeln, dann unten zurück und legen.', 'Am Ende oben: rechts, Schritt, legen, rechts.', 'for (7): forward(), pick_up() · turn_right(), forward(), place(), turn_right() · for (6): forward(), place()'],
    loesung: 'for i in range(7):\n    forward()\n    pick_up()\nturn_right()\nforward()\nplace()\nturn_right()\nfor i in range(6):\n    forward()\n    place()' }),
  hof({ id: 'z6', kapitel: 22, ico: '🔲', titel: 'Der Mauerring', ziel: 'Rund um den Burghof sind lauter Löcher. Flick sie alle.', lohn: 45,
    start: ZIEGEL(RAHMEN(6, 6, 'o', true), 20), befehle: [...KAROL_DREH, 'for'], sprache: S_FOR,
    tipps: ['Wie „Rund ums Beet“ – nur mit place().', 'Eine Seite: 5-mal Schritt und legen. Dann rechts drehen.', 'for (4): for (5): forward(), place() · ⬅ raus · turn_right()'],
    loesung: 'for i in range(4):\n    for j in range(5):\n        forward()\n        place()\n    turn_right()' }),
  hof({ id: 'z7', kapitel: 22, knobel: true, ico: '🏯', titel: 'Ziegel im Kreis', ziel: 'Rund um den Hof wechseln sich Ziegel und Löcher ab. Flick alle Löcher.', lohn: 55,
    start: RAHMEN(5, 5, 'zo', true), befehle: [...KAROL_DREH, 'for'], sprache: S_FOR,
    tipps: ['Auf jeder Seite: Ziegel, Loch, Ziegel, Loch.', 'Ein Paar ist: Schritt, aufheben, Schritt, legen. Eine Seite hat 2 Paare.', 'for (4): for (2): forward(), pick_up(), forward(), place() · ⬅ raus · turn_right()'],
    loesung: 'for i in range(4):\n    for j in range(2):\n        forward()\n        pick_up()\n        forward()\n        place()\n    turn_right()' }),

  // --- Kapitel 4: 🚧 Die Schleife while ---
  hof({ id: 'w1', kapitel: 4, ico: '🚧', titel: 'Bis zum Zaun', ziel: 'Ernte die ganze Reihe. Sie ist jeden Tag anders lang.', lohn: 40,
    start: O(['.rrrrr#']), varianten: [O(['.rrrrrrrr#']), O(['.rr#'])], befehle: [...SEQ, 'while'], neu: ['while'], sprache: S_WHILE,
    merke: { titel: 'Die Schleife while', text: 'while wiederholt, solange die Bedingung stimmt. So muss der Bauer nicht wissen, wie lang die Reihe ist. can_move() ist wahr, wenn vor ihm frei ist.', code: 'while can_move():\n    forward()' },
    tipps: ['Mit for müsstest du wissen, wie lang die Reihe ist.', 'Solange vor dem Bauern frei ist: Schritt und ernten.', 'while can_move(): forward(), harvest()'],
    loesung: 'while can_move():\n    forward()\n    harvest()' }),
  VORHER({ id: 'w1v', kapitel: 4, ico: '🔮', titel: 'Wann ist Schluss?', lohn: 40,
    start: O(['.rr#r', '..r.r']), befehle: DREH, sprache: S_WHILE,
    tipps: ['Vor jedem Durchgang fragt die Schleife: Ist vor dem Bauern frei?', 'Vor dem Zaun ist nicht mehr frei – dann geht es unter der Schleife weiter. Über den Zaun kommt der Bauer nie.'],
    code: 'while can_move():\n    forward()\n    harvest()\nturn_right()\nforward()\nharvest()' }),
  hof({ id: 'w2', kapitel: 4, ico: '🏞️', titel: 'Bis zum Rand', ziel: 'Ernte die ganze Reihe bis zum Rand.', lohn: 40,
    start: O(['.rrrr']), varianten: [O(['.rrrrrrr']), O(['.r'])], befehle: [...SEQ, 'while'], sprache: S_WHILE,
    tipps: ['can_move() merkt auch den Rand des Ackers.', 'Genau wie beim Zaun.', 'while can_move(): forward(), harvest()'],
    loesung: 'while can_move():\n    forward()\n    harvest()' }),
  hof({ id: 'w3', kapitel: 4, ico: '🏠', titel: 'Hin und wieder heim', ziel: 'Ernte bis zum Zaun und geh dann zurück auf dein Startfeld 🏠.', lohn: 45,
    start: HEIM(['.rrrr#'], 0), varianten: [HEIM(['.rrrrrr#'], 0), HEIM(['.rr#'], 0)], befehle: [...DREH, 'while'], sprache: S_WHILE,
    tipps: ['Zurück geht es auch mit while – bis zum Rand.', 'Umdrehen heißt: zweimal rechts drehen.', 'while (hin), turn_right(), turn_right(), while can_move(): forward()'],
    loesung: 'while can_move():\n    forward()\n    harvest()\nturn_right()\nturn_right()\nwhile can_move():\n    forward()' }),
  hof({ id: 'w3x', kapitel: 4, ico: '🐞', titel: 'Der falsche Heimweg', ziel: 'Der Bauer soll bis zum Zaun ernten und dann zurück auf sein Startfeld 🏠. Er kommt aber woanders an. Finde und behebe den Fehler!', lohn: 45,
    start: HEIM(['.rrr#', '.....'], 0), varianten: [HEIM(['.rrrrr#', '.......'], 0), HEIM(['.rr#', '....'], 0)], befehle: [...DREH, 'while'], sprache: S_WHILE,
    vorlage: 'while can_move():\n    forward()\n    harvest()\nturn_right()\nwhile can_move():\n    forward()',
    tipps: ['Lass den Code laufen: In welche Richtung schaut der Bauer nach turn_right()?', 'Einmal rechts drehen ist eine Vierteldrehung. Zum Umdrehen braucht es eine halbe.', 'Nach dem ersten while kommt turn_right() zweimal.'],
    loesung: 'while can_move():\n    forward()\n    harvest()\nturn_right()\nturn_right()\nwhile can_move():\n    forward()' }),
  hof({ id: 'w4', kapitel: 4, ico: '🏁', titel: 'Um die Ecke', ziel: 'Ernte bis zum Zaun, dann nach unten bis zum Rand.', lohn: 45,
    start: O(['.rrr#', '...r.', '...r.']), varianten: [O(['.rr#', '..r.', '..r.', '..r.']), O(['.rrrr#', '....r.'])], befehle: [...DREH, 'while'], sprache: S_WHILE,
    tipps: ['Zwei gerade Stücke wie beim Winkel – aber verschieden lang.', 'while nach rechts, drehen, noch ein while.', 'while … · turn_right() · while …'],
    loesung: 'while can_move():\n    forward()\n    harvest()\nturn_right()\nwhile can_move():\n    forward()\n    harvest()' }),
  hof({ id: 'w5', kapitel: 4, ico: '🔄', titel: 'Zwei Reihen', ziel: 'Ernte beide Reihen. Sie sind jeden Tag anders lang.', lohn: 50,
    start: O(['.rrr', 'rrrr']), varianten: [O(['.rrrrr', 'rrrrrr']), O(['.r', 'rr'])], befehle: [...DREH, 'while'], sprache: S_WHILE,
    tipps: ['Wie „Zwei lange Reihen“, nur mit while.', 'Die Kurve bleibt gleich: rechts, Schritt, ernten, rechts.', 'while · Kurve · while'],
    loesung: 'while can_move():\n    forward()\n    harvest()\nturn_right()\nforward()\nharvest()\nturn_right()\nwhile can_move():\n    forward()\n    harvest()' }),
  hof({ id: 'w6', kapitel: 4, ico: '🔲', titel: 'Der Rahmen', ziel: 'Ernte rund um den Acker. Er ist jeden Tag anders groß.', lohn: 50,
    start: RAHMEN(4, 3), varianten: [RAHMEN(6, 4), RAHMEN(3, 3)], befehle: [...DREH, 'for', 'while'], sprache: S_WHILE,
    tipps: ['Vier Seiten – jede bis zum Rand.', 'for für die vier Seiten, while für eine Seite.', 'for i in range(4): darin while can_move(): forward(), harvest() – danach turn_right().'],
    loesung: 'for i in range(4):\n    while can_move():\n        forward()\n        harvest()\n    turn_right()' }),
  hof({ id: 'w8', kapitel: 4, ico: '🧱', titel: 'Löcher bis zum Zaun', ziel: 'Flick alle Löcher bis zum Zaun. Der Weg ist jeden Tag anders lang.', lohn: 50,
    start: ZIEGEL(O(['.ooooo#']), 12), varianten: [ZIEGEL(O(['.oooooooo#']), 12), ZIEGEL(O(['.oo#']), 12)], befehle: [...KAROL, 'while'], neu: ['pick_up', 'place'], sprache: S_WHILE,
    merke: { titel: 'Ziegel', text: 'Neue Befehle: ✋ pick_up() hebt einen Ziegel auf, 🧱 place() legt einen aus dem Korb ins Loch unter dem Bauern. Diesmal hat er schon genug Ziegel im Korb.', code: 'forward()\nplace()' },
    tipps: ['Wie „Bis zum Zaun“ – nur mit place() statt harvest().', 'Solange vor dem Bauern frei ist: Schritt und legen.', 'while can_move(): forward(), place()'],
    loesung: 'while can_move():\n    forward()\n    place()' }),
  hof({ id: 'w9', kapitel: 4, ico: '🔁', titel: 'Holen und flicken bis zum Rand', ziel: 'Abwechselnd Ziegel und Loch, bis zum Rand. Flick alle Löcher.', lohn: 55,
    start: O(['.zozozo']), varianten: [O(['.zozozozozo']), O(['.zo'])], befehle: [...KAROL, 'while'], sprache: S_WHILE,
    tipps: ['Ein Durchgang: Ziegel holen und ins nächste Loch legen.', 'Nach jedem Paar fragt die Schleife wieder: Geht es weiter?', 'while can_move(): forward(), pick_up(), forward(), place()'],
    loesung: 'while can_move():\n    forward()\n    pick_up()\n    forward()\n    place()' }),
  hof({ id: 'w7', kapitel: 4, knobel: true, ico: '🐍', titel: 'Drei Reihen', ziel: 'Ernte alle drei Reihen. Sie sind jeden Tag anders lang.', lohn: 55,
    start: O(['.rrr', 'rrrr', 'rrrr']), varianten: [O(['.rrrrr', 'rrrrrr', 'rrrrrr']), O(['.r', 'rr', 'rr'])], befehle: [...DREH, 'while'], sprache: S_WHILE,
    tipps: ['Hin, zurück, hin – wie eine Schlange.', 'Die zweite Kurve geht nach links.', 'while · rechts-Kurve · while · links-Kurve · while'],
    loesung: 'while can_move():\n    forward()\n    harvest()\nturn_right()\nforward()\nharvest()\nturn_right()\nwhile can_move():\n    forward()\n    harvest()\nturn_left()\nforward()\nharvest()\nturn_left()\nwhile can_move():\n    forward()\n    harvest()' }),

  // --- Kapitel 5: 📦 Variablen ---
  hof({ id: 'v1', kapitel: 5, ico: '📦', titel: 'Die Erntekiste', ziel: 'Ernte alle Rüben. Zähl dabei in einer Variable mit und melde sie am Ende mit print.', lohn: 50, meldeVar: true,
    start: O(['.rrr']), meldung: meldeErnte, sprache: S_7,
    befehle: [...SEQ, 'for', V('ernte = 0', true), V('ernte = ernte + 1', true), V('print(ernte)', true)],
    merke: { titel: 'Variablen', text: 'Eine Variable ist wie eine beschriftete Kiste: ernte = 0 legt die Kiste „ernte“ an und legt 0 hinein. ernte = ernte + 1 zählt eins dazu. print(ernte) meldet, was drin ist.', code: 'ernte = 0\nernte = ernte + 1\nprint(ernte)' },
    tipps: ['Lege ganz oben die Kiste an: ernte = 0', 'Nach jedem harvest() zählst du eins dazu.', 'Ganz am Ende, nicht eingerückt: print(ernte)'],
    loesung: 'ernte = 0\nfor i in range(3):\n    forward()\n    harvest()\n    ernte = ernte + 1\nprint(ernte)' }),
  VORHER({ id: 'v1v', kapitel: 5, ico: '🔮', titel: 'Was meldet er?', lohn: 50,
    start: O(['.rrr']), befehle: SEQ, sprache: S_7,
    tipps: ['Im Korb ist am Anfang Platz für 10. Jede Rübe nimmt einen Platz weg.', 'Die Schleife läuft 3-mal – zähl rückwärts mit.'],
    code: 'korb = 10\nfor i in range(3):\n    forward()\n    harvest()\n    korb = korb - 1\nprint(korb)' }),
  hof({ id: 'v11', kapitel: 5, ico: '🧺', titel: 'Platz im Lager', ziel: 'Ins Lager passen 10 Rüben. Ernte die Reihe und melde, wie viel Platz danach noch frei ist – zähl mit einer Variable herunter.', lohn: 50, meldeVar: true,
    start: O(['.rrrr']), meldung: (st) => 10 - st.rueben, sprache: S_7,
    befehle: [...SEQ, 'for', V('platz = 10', true), V('platz = platz - 1', true), V('print(platz)')],
    tipps: ['Wie ein Countdown: Die Kiste fängt bei 10 an und wird kleiner.', 'Nach jedem harvest() ist ein Platz weniger frei.', 'platz = 10 · for (4): forward(), harvest(), platz = platz - 1 · ⬅ raus · print(platz)'],
    loesung: 'platz = 10\nfor i in range(4):\n    forward()\n    harvest()\n    platz = platz - 1\nprint(platz)' }),
  hof({ id: 'v8', kapitel: 5, ico: '📏', titel: 'Die Seitenlänge', ziel: 'Ernte alle Rüben rund um das Beet. Merk dir die Seitenlänge in der Variable seite und benutze sie in der Schleife.', lohn: 55, varPflicht: { seite: 5 },
    start: RAHMEN(6, 6), sprache: S_7,
    befehle: [...DREH, 'for', V('seite = 5', true), V('for j in range(seite):', true)],
    merke: { titel: 'Variable als Anzahl', text: 'seite = 5 merkt sich, wie lang eine Seite ist. for j in range(seite) nutzt die Zahl aus der Kiste. Wird das Beet größer, änderst du nur eine Zahl.', code: 'seite = 5\nfor j in range(seite):\n    forward()' },
    tipps: ['Wie „Rund ums Beet“ – aber die innere Schleife zählt mit seite.', 'Leg seite = 5 ganz oben an.', 'seite = 5 · for (4): for j in range(seite): forward(), harvest() · ⬅ raus · turn_right()'],
    loesung: 'seite = 5\nfor i in range(4):\n    for j in range(seite):\n        forward()\n        harvest()\n    turn_right()' }),
  hof({ id: 'v9', kapitel: 5, ico: '🔢', titel: 'Zwei Beete zählen', ziel: 'Ernte beide Beete. Zähl in einer Variable mit und melde am Ende, wie viele Rüben es waren.', lohn: 55, meldeVar: true,
    start: O(['.rrrrr.rrrrr.']), meldung: meldeErnte, sprache: S_7,
    befehle: [...SEQ, 'for', V('ernte = 0'), V('ernte = ernte + 1'), V('print(ernte)')],
    tipps: ['Ein Beet: 5-mal Schritt, ernten, zählen. Danach ein Schritt über die Lücke.', 'Das Ganze zweimal – eine Schleife um die Schleife.', 'ernte = 0 · for (2): for (5): forward(), harvest(), ernte = ernte + 1 · ⬅ raus · forward() · ⬅ raus · print(ernte)'],
    loesung: 'ernte = 0\nfor i in range(2):\n    for j in range(5):\n        forward()\n        harvest()\n        ernte = ernte + 1\n    forward()\nprint(ernte)' }),
  hof({ id: 'v10', kapitel: 5, knobel: true, ico: '📐', titel: 'Zwei Seitenlängen', ziel: 'Ernte rund um das lange Beet. Merk dir Breite und Höhe in den Variablen breite und hoehe.', lohn: 65, varPflicht: { breite: 4, hoehe: 2 },
    start: RAHMEN(5, 3), sprache: S_7,
    befehle: [...DREH, 'for', V('breite = 4'), V('hoehe = 2'), V('for j in range(breite):'), V('for j in range(hoehe):')],
    tipps: ['Oben und unten sind die Seiten lang, rechts und links kurz.', 'Eine lange und eine kurze Seite – und das zweimal.', 'for (2): for j in range(breite): … · turn_right() · for j in range(hoehe): … · turn_right()'],
    loesung: 'breite = 4\nhoehe = 2\nfor i in range(2):\n    for j in range(breite):\n        forward()\n        harvest()\n    turn_right()\n    for j in range(hoehe):\n        forward()\n        harvest()\n    turn_right()' }),

  // --- Kapitel 10 (Burg 8): 📏 Zählen mit while ---
  hof({ id: 'v2', kapitel: 10, ico: '📏', titel: 'Miss die Reihe', ziel: 'Geh bis zum Zaun und melde, wie viele Schritte es waren.', lohn: 50,
    start: O(['.....#']), varianten: [O(['........#']), O(['..#'])], meldung: meldeLaenge, sprache: S_VAR,
    befehle: ['forward', 'while', VL('print(¦)')],
    merke: { titel: 'Kurz und knapp: +=', text: 'punkte += 1 ist die Kurzform von punkte = punkte + 1. Beides zählt eins dazu.', code: 'punkte = 0\npunkte += 1    # jetzt ist punkte 1' },
    tipps: ['Die Reihe ist jeden Tag anders lang – du musst wirklich zählen.', 'Solange frei ist: Schritt und mitzählen.', 'schritte = 0 · while: forward(), schritte += 1 · print(schritte)'],
    loesung: 'schritte = 0\nwhile can_move():\n    forward()\n    schritte += 1\nprint(schritte)' }),
  hof({ id: 'v3', kapitel: 10, ico: '🧺', titel: 'Zählen bis zum Zaun', ziel: 'Ernte bis zum Zaun und melde, wie viele Rüben es waren.', lohn: 55,
    start: O(['.rrrr#']), varianten: [O(['.rrrrrrr#']), O(['.r#'])], meldung: meldeErnte, sprache: S_VAR,
    befehle: [...SEQ, 'while', V('print(ernte)')],
    tipps: ['Wie „Miss die Reihe“ – mit Ernten.', 'Zählen direkt nach harvest().', 'ernte = 0 · while: forward(), harvest(), ernte += 1 · print(ernte)'],
    loesung: 'ernte = 0\nwhile can_move():\n    forward()\n    harvest()\n    ernte += 1\nprint(ernte)' }),
  hof({ id: 'w10', kapitel: 10, ico: '🖐️', titel: 'Genau fünf', ziel: 'In den Korb passen genau 5 Rüben. Ernte, bis der Korb voll ist – oder bis der Zaun kommt. Die Reihe ist jeden Tag anders lang.', lohn: 55,
    start: KORB(O(['.rrrrrrrr#']), 5), varianten: [KORB(O(['.rrr#']), 5), KORB(O(['.rrrrrr#']), 5)], sprache: S_VAR,
    befehle: [...SEQ, 'while'],
    merke: { titel: 'Vergleiche', text: 'Eine Bedingung kann auch zwei Zahlen vergleichen: < kleiner, <= kleiner oder gleich, == gleich, != ungleich. Mit and müssen beide Bedingungen stimmen, not dreht wahr und falsch um. Zum Vergleichen schreibt man ==, ein einzelnes = speichert.',
      code: 'x = 4\nprint(x < 5)              # True\nprint(x == 5)             # False\nprint(x != 5 and x >= 4)  # True' },
    tipps: ['Zwei Gründe zum Aufhören: Der Korb ist voll ODER der Zaun ist da. Die Schleife läuft also, solange beides noch nicht passiert ist.', 'Zähl die geernteten Rüben in ernte mit. Weiter geht es, solange ernte < 5 ist und can_move() stimmt.', 'while ernte < 5 and can_move(): forward(), harvest(), ernte += 1'],
    loesung: 'ernte = 0\nwhile ernte < 5 and can_move():\n    forward()\n    harvest()\n    ernte += 1' }),
  hof({ id: 'v4', kapitel: 10, ico: '🏠', titel: 'Der Heimweg', ziel: 'Ernte bis zum Zaun. Dann geh zurück auf dein Startfeld 🏠.', lohn: 55,
    start: HEIM(['..rrrr#'], 1), varianten: [HEIM(['...rrrrrr#'], 2), HEIM(['..rr#'], 1)], sprache: S_VAR,
    befehle: [...DREH, 'for', 'while'],
    merke: { titel: 'Variable als Anzahl', text: 'Eine Variable kann auch sagen, wie oft eine Schleife läuft: range(schritte). So geht der Bauer genau so viele Schritte zurück, wie er hingegangen ist.', code: 'for i in range(schritte):\n    forward()' },
    tipps: ['Bis zum Rand zurück reicht nicht – links vom Startfeld ist noch Platz.', 'Zähle auf dem Hinweg die Schritte. Dreh dich dann zweimal um.', 'Hinweg mit schritte += 1 · zweimal turn_right() · for i in range(schritte): forward()'],
    loesung: 'schritte = 0\nwhile can_move():\n    forward()\n    harvest()\n    schritte += 1\nturn_right()\nturn_right()\nfor i in range(schritte):\n    forward()' }),
  hof({ id: 'v5', kapitel: 10, ico: '📐', titel: 'Der Umfang', ziel: 'Geh einmal um den leeren Acker und melde, wie viele Schritte es waren.', lohn: 55,
    start: LEER(4, 3), varianten: [LEER(6, 4), LEER(3, 3)], meldung: meldeUmfang, sprache: S_VAR,
    befehle: [...DREH, 'for', 'while', V('print(schritte)')],
    tipps: ['Wie „Der Rahmen“ – nur zählen statt ernten.', 'Die Kiste zählt über alle vier Seiten weiter.', 'schritte = 0 · for 4: while: forward(), schritte += 1 · turn_right() · print(schritte)'],
    loesung: 'schritte = 0\nfor i in range(4):\n    while can_move():\n        forward()\n        schritte += 1\n    turn_right()\nprint(schritte)' }),
  hof({ id: 'v6', kapitel: 10, ico: '🔢', titel: 'Zwei Reihen zählen', ziel: 'Ernte beide Reihen und melde, wie viele Rüben es zusammen waren.', lohn: 60,
    start: O(['.rrr', 'rrrr']), varianten: [O(['.rrrrr', 'rrrrrr']), O(['.r', 'rr'])], meldung: meldeErnte, sprache: S_VAR,
    befehle: [...DREH, 'while', V('print(ernte)')],
    tipps: ['Wie „Zwei Reihen“ aus dem while-Kapitel, mit Zählen.', 'Nach jedem harvest() eins dazu – auch in der Kurve.', 'Die Kiste wird nur einmal ganz oben angelegt.'],
    loesung: 'ernte = 0\nwhile can_move():\n    forward()\n    harvest()\n    ernte += 1\nturn_right()\nforward()\nharvest()\nernte += 1\nturn_right()\nwhile can_move():\n    forward()\n    harvest()\n    ernte += 1\nprint(ernte)' }),
  hof({ id: 'v7', kapitel: 10, knobel: true, ico: '🧮', titel: 'Die Fläche', ziel: 'Miss den leeren Acker aus und melde, wie viele Felder er hat.', lohn: 65,
    start: LEER(4, 3), varianten: [LEER(6, 5), LEER(2, 2)], meldung: meldeFlaeche, sprache: S_VAR,
    befehle: [...DREH, 'while', VL('print(¦)')],
    tipps: ['Fläche = Breite mal Höhe.', 'Das Startfeld zählt mit – darum beginnen beide Kisten bei 1.', 'Breite nach rechts messen, rechts drehen, Höhe nach unten messen, dann print(breite * hoehe).'],
    loesung: 'breite = 1\nwhile can_move():\n    forward()\n    breite += 1\nturn_right()\nhoehe = 1\nwhile can_move():\n    forward()\n    hoehe += 1\nprint(breite * hoehe)' }),

  // --- Kapitel 6: ❓ Verzweigung if ---
  hof({ id: 'i1', kapitel: 6, ico: '🌿', titel: 'Vorsicht, Setzling!', ziel: 'Ernte die Rüben 🥕. Setzlinge 🌱 bleiben stehen.', lohn: 50,
    start: O(['.rsr']), varianten: [O(['.srr']), O(['.rrs'])], befehle: [...SEQ, 'for', 'if'], neu: ['if'], sprache: S_IF,
    merke: { titel: 'Die Verzweigung if', text: 'Mit if prüft der Bauer etwas, bevor er handelt. Nur wenn die Bedingung stimmt, läuft der eingerückte Block. can_harvest() ist wahr, wenn er auf einer reifen Rübe steht.', code: 'if can_harvest():\n    harvest()' },
    tipps: ['Der Hof sieht jeden Tag anders aus.', 'Nach jedem Schritt fragt der Bauer: Kann ich hier ernten?', 'for i in range(3): forward(), dann if can_harvest(): und noch weiter eingerückt harvest().'],
    loesung: 'for i in range(3):\n    forward()\n    if can_harvest():\n        harvest()' }),
  VORHER({ id: 'i1v', kapitel: 6, ico: '🔮', titel: 'Ernten oder nicht?', lohn: 50,
    start: O(['.rsr.r']), befehle: SEQ, sprache: S_IF,
    tipps: ['harvest() passiert nur, wenn can_harvest() stimmt – also nur auf einer Rübe.', 'Auf dem Setzling und auf leerer Erde wird nicht geerntet. Und wie weit läuft die Schleife überhaupt?'],
    code: 'for i in range(4):\n    forward()\n    if can_harvest():\n        harvest()' }),
  hof({ id: 'i2', kapitel: 6, ico: '❓', titel: 'Das bunte Beet', ziel: 'Ernte alle Rüben. Die Setzlinge bleiben stehen.', lohn: 50,
    start: O(['.rsrrsrsr']), varianten: [O(['.srrsrrss']), O(['.rrsrsrrr'])], befehle: [...SEQ, 'for', 'if'], sprache: S_IF,
    tipps: ['Wie der letzte Hof, nur länger.', 'Die Reihe hat 8 Felder.', 'for i in range(8): forward(), if can_harvest(): harvest()'],
    loesung: 'for i in range(8):\n    forward()\n    if can_harvest():\n        harvest()' }),
  hof({ id: 'i3', kapitel: 6, ico: '🌻', titel: 'Bunt bis zum Zaun', ziel: 'Ernte bis zum Zaun. Die Setzlinge bleiben stehen.', lohn: 55,
    start: O(['.rsrrs#']), varianten: [O(['.srrsrrr#']), O(['.rs#'])], befehle: [...SEQ, 'while', 'if'], sprache: S_IF,
    tipps: ['while und if zusammen.', 'Solange frei ist: gehen, und nur ernten, wenn es geht.', 'while can_move(): forward(), if can_harvest(): harvest()'],
    loesung: 'while can_move():\n    forward()\n    if can_harvest():\n        harvest()' }),
  hof({ id: 'i4', kapitel: 6, ico: '🔢', titel: 'Zähl die bunte Reihe', ziel: 'Ernte die Rüben, Setzlinge bleiben stehen. Melde, wie viele Rüben es waren.', lohn: 55,
    start: O(['.rsrrsrsr']), varianten: [O(['.srrsrrss']), O(['.rrsrsrrr'])], meldung: meldeErnte, sprache: S_IF,
    befehle: [...SEQ, 'for', 'if', V('print(ernte)')],
    tipps: ['Gezählt wird nur, was wirklich geerntet wird.', 'Das Zählen gehört in den if-Block, direkt unter harvest().', 'Unter if can_harvest(): stehen harvest() und ernte += 1 – gleich weit eingerückt.'],
    loesung: 'ernte = 0\nfor i in range(8):\n    forward()\n    if can_harvest():\n        harvest()\n        ernte += 1\nprint(ernte)' }),
  hof({ id: 'i5', kapitel: 6, ico: '🧮', titel: 'Zählen bis zum Zaun', ziel: 'Ernte bis zum Zaun, Setzlinge bleiben stehen. Melde, wie viele Rüben es waren.', lohn: 60,
    start: O(['.rsrrs#']), varianten: [O(['.srrsrrr#']), O(['.rs#'])], meldung: meldeErnte, sprache: S_IF,
    befehle: [...SEQ, 'while', 'if', V('print(ernte)')],
    tipps: ['Wie der letzte Hof – nur weißt du nicht, wie lang die Reihe ist.', 'Nimm while can_move(): statt for.', 'ernte = 0 · while … if can_harvest(): harvest(), ernte += 1 · print(ernte)'],
    loesung: 'ernte = 0\nwhile can_move():\n    forward()\n    if can_harvest():\n        harvest()\n        ernte += 1\nprint(ernte)' }),
  hof({ id: 'i9', kapitel: 6, ico: '📦', titel: 'Volle Kiste', ziel: 'Ernte bis zum Zaun, Setzlinge bleiben stehen. In die Kiste passen 3 Rüben: Melde (nur einmal!), bei welchem Schritt die Kiste voll wurde.', lohn: 60, meldeVar: true,
    start: O(['.rsrsrr#']), varianten: [O(['.srsrsrr#']), O(['.rrrs#']), O(['.ssrsrsrr#'])], meldung: meldeVoll, sprache: S_IF,
    befehle: [...SEQ, 'while', 'if', V('print(schritte)')],
    tipps: ['Du brauchst zwei Variablen: eine für die Schritte, eine für die Rüben in der Kiste.', 'Gleich nach ernte += 1 fragst du: Ist die Kiste jetzt genau voll? Vergleichen geht mit ==.', 'if ernte == 3: print(schritte) – eingerückt unter dem if, in dem geerntet wird.'],
    loesung: 'schritte = 0\nernte = 0\nwhile can_move():\n    forward()\n    schritte += 1\n    if can_harvest():\n        harvest()\n        ernte += 1\n        if ernte == 3:\n            print(schritte)' }),
  hof({ id: 'i6', kapitel: 6, ico: '🧺', titel: 'Zwei bunte Reihen', ziel: 'Ernte beide Reihen. Die Setzlinge bleiben stehen.', lohn: 60,
    start: O(['.rsrr', 'rsrsr']), varianten: [O(['.srsr', 'srrrs']), O(['.rrss', 'rsrrs'])], befehle: [...DREH, 'for', 'if'], sprache: S_IF,
    tipps: ['Wie „Zwei lange Reihen“ – aber vor jedem Ernten fragen.', 'Auch auf dem Feld in der Kurve kann ein Setzling stehen.', 'for-Schleife oben · Kurve mit if · for-Schleife unten'],
    loesung: 'for i in range(4):\n    forward()\n    if can_harvest():\n        harvest()\nturn_right()\nforward()\nif can_harvest():\n    harvest()\nturn_right()\nfor i in range(4):\n    forward()\n    if can_harvest():\n        harvest()' }),
  hof({ id: 'i8', kapitel: 6, ico: '🕳️', titel: 'Nur in die Löcher', ziel: 'Geh bis zum Zaun und flick nur die Löcher. Auf festen Boden kommt kein Ziegel!', lohn: 60,
    start: ZIEGEL(O(['.o..oo.o#']), 10), varianten: [ZIEGEL(O(['.oo.o...o.o#']), 10), ZIEGEL(O(['..o#']), 10)], befehle: [...KAROL, 'while', V('if is_hole():', true)], sprache: S_IF,
    tipps: ['Nicht jedes Feld hat ein Loch – erst nachsehen.', 'is_hole() ist wahr, wenn der Bauer auf einem Loch steht.', 'while can_move(): forward(), if is_hole(): place()'],
    loesung: 'while can_move():\n    forward()\n    if is_hole():\n        place()' }),
  hof({ id: 'i7', kapitel: 6, knobel: true, ico: '🔲', titel: 'Der bunte Rahmen', ziel: 'Ernte rund um den Acker. Setzlinge bleiben stehen.', lohn: 65,
    start: RAHMEN(5, 4, 'rrs'), varianten: [RAHMEN(6, 4, 'rsr'), RAHMEN(3, 3, 'srr')], befehle: [...DREH, 'for', 'while', 'if'], sprache: S_IF,
    tipps: ['Wie „Der Rahmen“ aus dem while-Kapitel – mit Setzlingen.', 'Drei Ebenen: for, while, if.', 'for 4: while can_move(): forward(), if can_harvest(): harvest() · turn_right()'],
    loesung: 'for i in range(4):\n    while can_move():\n        forward()\n        if can_harvest():\n            harvest()\n    turn_right()' }),

  // --- Kapitel 7: 💧 Zweifach: if/else ---
  hof({ id: 'e1', kapitel: 7, ico: '💧', titel: 'Rübe oder Wasser', ziel: 'Ernte jede Rübe 🥕, gieße jeden Setzling 🌱.', lohn: 55, giessen: true,
    start: O(['.rsrssr']), varianten: [O(['.srrsrs']), O(['.ssrrrs'])], befehle: [...SEQ, 'water', 'for', 'if', 'else'], neu: ['water', 'else'], sprache: S_ELSE,
    merke: { titel: 'Zweifach: if/else', text: 'Nach else steht, was passiert, wenn die Bedingung nicht stimmt. Der Bauer macht immer genau eins von beiden. else steht genauso weit links wie sein if.', code: 'if can_harvest():\n    harvest()\nelse:\n    water()' },
    tipps: ['Jedes Feld hat entweder eine Rübe oder einen Setzling.', 'Rübe: ernten. Sonst: gießen.', 'if can_harvest(): harvest() · else: water()'],
    loesung: 'for i in range(6):\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()' }),
  VORHER({ id: 'e1v', kapitel: 7, ico: '🔮', titel: 'Ernten oder gießen?', lohn: 55, giessen: true,
    start: O(['.rssrs']), befehle: [...SEQ, 'water'], sprache: S_ELSE,
    tipps: ['Auf jedem Feld passiert genau eins: harvest() oder water().', 'Rübe → ernten, sonst → gießen. Die Schleife läuft nur 4-mal.'],
    code: 'for i in range(4):\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()' }),
  hof({ id: 'e2', kapitel: 7, ico: '🚿', titel: 'Gießen bis zum Zaun', ziel: 'Ernte jede Rübe und gieße jeden Setzling – bis zum Zaun.', lohn: 55, giessen: true,
    start: O(['.rssr#']), varianten: [O(['.srsrrss#']), O(['.sr#'])], befehle: [...SEQ, 'water', 'while', 'if', 'else'], sprache: S_ELSE,
    tipps: ['Wie der letzte Hof – mit while.', 'In der Schleife: Schritt, dann if/else.', 'while can_move(): forward() · if … harvest() · else: water()'],
    loesung: 'while can_move():\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()' }),
  hof({ id: 'e3', kapitel: 7, ico: '🔢', titel: 'Setzlinge zählen', ziel: 'Ernte und gieße alles. Melde, wie viele Setzlinge du gegossen hast.', lohn: 60, giessen: true,
    start: O(['.rsrssr']), varianten: [O(['.srrsrs']), O(['.ssrrrs'])], meldung: meldeSetzlinge, sprache: S_ELSE,
    befehle: [...SEQ, 'water', 'for', 'if', 'else', V('print(gegossen)')],
    tipps: ['Gezählt wird im else-Teil.', 'Unter else: stehen water() und gegossen += 1.', 'gegossen = 0 · Schleife mit if/else · print(gegossen)'],
    loesung: 'gegossen = 0\nfor i in range(6):\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()\n        gegossen += 1\nprint(gegossen)' }),
  hof({ id: 'e3x', kapitel: 7, ico: '🐞', titel: 'Falsch gezählt', ziel: 'Der Bauer soll melden, wie viele Setzlinge er gegossen hat – er meldet aber eine falsche Zahl. Finde und behebe den Fehler!', lohn: 60, giessen: true,
    start: O(['.srrsss']), varianten: [O(['.rrsrrs']), O(['.ssrsss'])], meldung: meldeSetzlinge, sprache: S_ELSE, befehle: [...SEQ, 'water', 'for', 'if', 'else'],
    vorlage: 'gegossen = 0\nfor i in range(6):\n    forward()\n    if can_harvest():\n        harvest()\n        gegossen += 1\n    else:\n        water()\nprint(gegossen)',
    tipps: ['Was zählt der Code gerade wirklich: Rüben oder Setzlinge?', 'gegossen += 1 soll nur laufen, wenn gegossen wird.', 'Schieb gegossen += 1 in den else-Teil, direkt unter water().'],
    loesung: 'gegossen = 0\nfor i in range(6):\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()\n        gegossen += 1\nprint(gegossen)' }),
  hof({ id: 'e4', kapitel: 7, ico: '🔄', titel: 'Zwei Reihen gießen', ziel: 'Ernte und gieße beide Reihen.', lohn: 60, giessen: true,
    start: O(['.rsrs', 'srrsr']), varianten: [O(['.ssrr', 'rrssr']), O(['.rrss', 'srsrs'])], befehle: [...DREH, 'water', 'for', 'if', 'else'], sprache: S_ELSE,
    tipps: ['Wie „Zwei bunte Reihen“ – mit else.', 'Auch in der Kurve: ernten oder gießen.', 'for oben · Kurve mit if/else · for unten'],
    loesung: 'for i in range(4):\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()\nturn_right()\nforward()\nif can_harvest():\n    harvest()\nelse:\n    water()\nturn_right()\nfor i in range(4):\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()' }),
  hof({ id: 'e5', kapitel: 7, ico: '🔲', titel: 'Der Gießrahmen', ziel: 'Rund um den Acker: Rüben ernten, Setzlinge gießen.', lohn: 65, giessen: true,
    start: RAHMEN(5, 4, 'rs'), varianten: [RAHMEN(6, 4, 'srr'), RAHMEN(3, 3, 'ssr')], befehle: [...DREH, 'water', 'for', 'while', 'if', 'else'], sprache: S_ELSE,
    tipps: ['Wie „Der bunte Rahmen“ – mit else.', 'Am Ende kommt der Bauer auf sein leeres Startfeld zurück. Wasser dort schadet nicht.', 'for 4: while: forward(), if/else · turn_right()'],
    loesung: 'for i in range(4):\n    while can_move():\n        forward()\n        if can_harvest():\n            harvest()\n        else:\n            water()\n    turn_right()' }),
  hof({ id: 'e6', kapitel: 7, knobel: true, ico: '🐍', titel: 'Drei Reihen gießen', ziel: 'Ernte und gieße alle drei Reihen. Sie sind jeden Tag anders lang.', lohn: 70, giessen: true,
    start: O(['.rsr', 'srrs', 'rssr']), varianten: [O(['.srrs', 'rrssr', 'srsrs']), O(['.r', 'sr', 'rs'])], befehle: [...DREH, 'water', 'while', 'if', 'else'], sprache: S_ELSE,
    tipps: ['Wie „Drei Reihen“ aus dem while-Kapitel – mit if/else auf jedem Feld.', 'Auch die Felder in den Kurven brauchen if/else.', 'while · rechts-Kurve · while · links-Kurve · while'],
    loesung: 'while can_move():\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()\nturn_right()\nforward()\nif can_harvest():\n    harvest()\nelse:\n    water()\nturn_right()\nwhile can_move():\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()\nturn_left()\nforward()\nif can_harvest():\n    harvest()\nelse:\n    water()\nturn_left()\nwhile can_move():\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()' }),

  // --- Kapitel 8: 🌿 Mehrfach: if/elif/else ---
  hof({ id: 'm1', kapitel: 8, ico: '🌿', titel: 'Unkraut!', ziel: 'Ernte die Rüben und rupfe das Unkraut 🌿 aus.', lohn: 60,
    start: O(['.rurur']), varianten: [O(['.uurrr']), O(['.ruuru'])], befehle: [...SEQ, 'pull', 'for', 'if', 'else'], neu: ['pull'], sprache: S_ELSE,
    merke: { titel: 'Unkraut rupfen', text: 'pull() rupft Unkraut aus. Vorsicht: Rüben und Setzlinge darf der Bauer nicht ausrupfen!', code: 'pull()' },
    tipps: ['Auf jedem Feld ist entweder eine Rübe oder Unkraut.', 'Rübe: ernten. Sonst: rupfen.', 'if can_harvest(): harvest() · else: pull()'],
    loesung: 'for i in range(5):\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        pull()' }),
  hof({ id: 'm2', kapitel: 8, ico: '🥕', titel: 'Drei Sorten', ziel: 'Rüben ernten, Unkraut rupfen, Setzlinge gießen.', lohn: 65, giessen: true,
    start: O(['.rusrsu']), varianten: [O(['.ssuurr']), O(['.urrssu'])], befehle: [...SEQ, 'water', 'pull', 'for', 'if', 'elif', 'else'], neu: ['elif'], sprache: S_ELIF,
    merke: { titel: 'Mehrfach: elif', text: 'Mit elif („sonst wenn“) prüfst du eine zweite Bedingung. Python geht von oben nach unten und macht nur den ersten Teil, der passt. is_weed() ist wahr auf Unkraut.', code: 'if can_harvest():\n    harvest()\nelif is_weed():\n    pull()\nelse:\n    water()' },
    tipps: ['Drei Sorten brauchen drei Fälle.', 'Rübe → ernten, Unkraut → rupfen, sonst → gießen.', 'if can_harvest(): … elif is_weed(): … else: …'],
    loesung: 'for i in range(6):\n    forward()\n    if can_harvest():\n        harvest()\n    elif is_weed():\n        pull()\n    else:\n        water()' }),
  VORHER({ id: 'm2v', kapitel: 8, ico: '🔮', titel: 'Drei Sorten lesen', lohn: 65, giessen: true,
    start: O(['.rsusrs']), befehle: [...SEQ, 'pull', 'water'], sprache: S_ELIF,
    tipps: ['Die Fragen kommen der Reihe nach: erst Rübe?, dann Unkraut?, sonst gießen.', 'Rübe → harvest(), Unkraut → pull(), alles andere → water().'],
    code: 'for i in range(4):\n    forward()\n    if can_harvest():\n        harvest()\n    elif is_weed():\n        pull()\n    else:\n        water()' }),
  hof({ id: 'm3', kapitel: 8, ico: '🚧', titel: 'Drei Sorten bis zum Zaun', ziel: 'Bis zum Zaun: ernten, rupfen, gießen.', lohn: 65, giessen: true,
    start: O(['.rusr#']), varianten: [O(['.suurrsu#']), O(['.us#'])], befehle: [...SEQ, 'water', 'pull', 'while', 'if', 'elif', 'else'], sprache: S_ELIF,
    tipps: ['Wie „Drei Sorten“, nur mit while.', 'Die drei Fälle bleiben gleich.', 'while can_move(): forward() · if … elif … else …'],
    loesung: 'while can_move():\n    forward()\n    if can_harvest():\n        harvest()\n    elif is_weed():\n        pull()\n    else:\n        water()' }),
  hof({ id: 'm4', kapitel: 8, ico: '🔢', titel: 'Unkraut zählen', ziel: 'Ernten, rupfen, gießen – und melde, wie viel Unkraut du gerupft hast.', lohn: 70, giessen: true,
    start: O(['.rusrsu']), varianten: [O(['.ssuurr']), O(['.urrssu'])], meldung: meldeUnkraut, sprache: S_ELIF,
    befehle: [...SEQ, 'water', 'pull', 'for', 'if', 'elif', 'else', V('print(unkraut)')],
    tipps: ['Gezählt wird im elif-Teil.', 'Unter elif is_weed(): stehen pull() und unkraut += 1.', 'unkraut = 0 · Schleife mit if/elif/else · print(unkraut)'],
    loesung: 'unkraut = 0\nfor i in range(6):\n    forward()\n    if can_harvest():\n        harvest()\n    elif is_weed():\n        pull()\n        unkraut += 1\n    else:\n        water()\nprint(unkraut)' }),
  hof({ id: 'm5', kapitel: 8, ico: '🔄', titel: 'Zwei Reihen, drei Sorten', ziel: 'Beide Reihen: ernten, rupfen, gießen. Sie sind jeden Tag anders lang.', lohn: 70, giessen: true,
    start: O(['.rus', 'surr']), varianten: [O(['.usrsu', 'rsuurs']), O(['.s', 'ur'])], befehle: [...DREH, 'water', 'pull', 'while', 'if', 'elif', 'else'], sprache: S_ELIF,
    tipps: ['Wie „Zwei Reihen“ – mit drei Fällen auf jedem Feld.', 'Auch das Feld in der Kurve braucht if/elif/else.', 'while · Kurve · while'],
    loesung: 'while can_move():\n    forward()\n    if can_harvest():\n        harvest()\n    elif is_weed():\n        pull()\n    else:\n        water()\nturn_right()\nforward()\nif can_harvest():\n    harvest()\nelif is_weed():\n    pull()\nelse:\n    water()\nturn_right()\nwhile can_move():\n    forward()\n    if can_harvest():\n        harvest()\n    elif is_weed():\n        pull()\n    else:\n        water()' }),
  hof({ id: 'm6', kapitel: 8, ico: '🔲', titel: 'Der große Rahmen', ziel: 'Rund um den Acker: ernten, rupfen, gießen.', lohn: 75, giessen: true,
    start: RAHMEN(5, 4, 'rus'), varianten: [RAHMEN(6, 5, 'sur'), RAHMEN(3, 3, 'urs')], befehle: [...DREH, 'water', 'pull', 'for', 'while', 'if', 'elif', 'else'], sprache: S_ELIF,
    tipps: ['Wie „Der Gießrahmen“ – mit drei Fällen.', 'Auf dem leeren Startfeld wird am Ende gegossen – das schadet nicht.', 'for 4: while: forward(), if/elif/else · turn_right()'],
    loesung: 'for i in range(4):\n    while can_move():\n        forward()\n        if can_harvest():\n            harvest()\n        elif is_weed():\n            pull()\n        else:\n            water()\n    turn_right()' }),
  hof({ id: 'm7', kapitel: 8, knobel: true, ico: '👑', titel: 'Der ganze Acker', ziel: 'Der ganze Acker (4 Reihen, jeden Tag anders breit): ernten, rupfen, gießen.', lohn: 85, giessen: true,
    start: O(['.rus', 'surr', 'rrus', 'usrr']), varianten: [O(['.rsuu', 'urrsr', 'srurs', 'rusur']), O(['.u', 'sr', 'ru', 'us'])],
    befehle: [...DREH, 'water', 'pull', 'for', 'while', 'if', 'elif', 'else'], sprache: S_ELIF,
    tipps: ['Zwei Mal „hin und zurück“ – das ruft nach einer for-Schleife drumherum.', 'Für die vier Kurven brauchst du keine eigene Zählung: rechts-Kurve, while, links-Kurve.', 'for i in range(2): while … · Kurve rechts · while … · Kurve links'],
    loesung: 'for i in range(2):\n    while can_move():\n        forward()\n        if can_harvest():\n            harvest()\n        elif is_weed():\n            pull()\n        else:\n            water()\n    turn_right()\n    forward()\n    if can_harvest():\n        harvest()\n    elif is_weed():\n        pull()\n    else:\n        water()\n    turn_right()\n    while can_move():\n        forward()\n        if can_harvest():\n            harvest()\n        elif is_weed():\n            pull()\n        else:\n            water()\n    turn_left()\n    forward()\n    if can_harvest():\n        harvest()\n    elif is_weed():\n        pull()\n    else:\n        water()\n    turn_left()' }),

  // --- Burg 8, Kapitel „Auffrischung“: das Wichtigste aus Klasse 7 (for, Variablen) in wenigen Höfen, getippt; dann kommt while ---
  VORHER({ id: 'a1', kapitel: 9, ico: '🔮', titel: 'Kennst du das noch?', lohn: 20,
    start: O(['.rrr', '..r.', '..rr', '..r.']), befehle: [...DREH, 'for'], sprache: S_7,
    merke: { titel: '🏯 Willkommen in Burg 8!', text: 'Kurz erinnert: for wiederholt, was eingerückt darunter steht. In Burg 8 tippst du Python selbst.', code: 'for i in range(3):\n    forward()\n    harvest()' },
    tipps: ['Die erste Schleife läuft genau 2-mal.', 'Danach dreht er sich nach unten, und die zweite Schleife läuft auch 2-mal.'],
    code: 'for i in range(2):\n    forward()\n    harvest()\nturn_right()\nfor i in range(2):\n    forward()\n    harvest()' }),
  hof({ id: 'a2', kapitel: 9, ico: '📐', titel: 'Die Ecke', ziel: 'Ernte alle 6 Rüben.', lohn: 25,
    start: O(['.rrrr', '....r', '....r']), befehle: [...DREH, 'for'], sprache: S_7,
    tipps: ['Zwei gerade Stücke, dazwischen eine Drehung.', 'Erst 4-mal Schritt und ernten, dann rechts drehen.', 'for i in range(4): … · turn_right() · for i in range(2): …'],
    loesung: 'for i in range(4):\n    forward()\n    harvest()\nturn_right()\nfor i in range(2):\n    forward()\n    harvest()' }),
  hof({ id: 'a3', kapitel: 9, ico: '🔲', titel: 'Rund herum', ziel: 'Ernte alle Rüben rund um das Beet.', lohn: 30,
    start: RAHMEN(6, 6), befehle: [...DREH, 'for'], sprache: S_7,
    tipps: ['Jede Seite: 5-mal Schritt und ernten, dann rechts drehen.', 'Eine Schleife für die Seite, eine Schleife für die 4 Seiten.', 'for i in range(4): · for j in range(5): forward(), harvest() · turn_right()'],
    loesung: 'for i in range(4):\n    for j in range(5):\n        forward()\n        harvest()\n    turn_right()' }),
  VORHER({ id: 'a4', kapitel: 9, ico: '🔮', titel: 'Was ist in der Kiste?', lohn: 25,
    start: O(['.rrr']), befehle: SEQ, sprache: S_7,
    merke: { titel: 'Variablen – kurz erinnert', text: 'ernte = 0 legt eine Kiste an und legt 0 hinein. ernte = ernte + 1 zählt eins dazu. print(ernte) meldet, was drin ist.', code: 'ernte = 0\nernte = ernte + 1\nprint(ernte)' },
    tipps: ['Bei jeder Rübe kommt eins in die Kiste.', 'Zähl mit, wie oft harvest() passiert.'],
    code: 'ernte = 0\nfor i in range(3):\n    forward()\n    harvest()\n    ernte = ernte + 1\nprint(ernte)' }),
  hof({ id: 'a5', kapitel: 9, ico: '🔢', titel: 'Zähl die Ecke', ziel: 'Ernte alle Rüben, zähl in einer Variable mit und melde, wie viele es waren.', lohn: 30, meldeVar: true,
    start: O(['.rrr', '...r', '...r']), meldung: meldeErnte, sprache: S_7,
    befehle: [...DREH, 'for', V('print(ernte)')],
    tipps: ['Zwei Schleifen mit einer Drehung dazwischen.', 'Nach jedem harvest() zählst du eins dazu – in beiden Schleifen.', 'ernte = 0 · for (3) … · turn_right() · for (2) … · print(ernte)'],
    loesung: 'ernte = 0\nfor i in range(3):\n    forward()\n    harvest()\n    ernte = ernte + 1\nturn_right()\nfor i in range(2):\n    forward()\n    harvest()\n    ernte = ernte + 1\nprint(ernte)' }),
  hof({ id: 'a6', kapitel: 9, knobel: true, ico: '🐍', titel: 'Die Zählschlange', ziel: 'Ernte alle drei Reihen, zähl in einer Variable mit und melde, wie viele Rüben es waren.', lohn: 40, meldeVar: true,
    start: O(['.rrr', 'rrrr', 'rrrr']), meldung: meldeErnte, sprache: S_7,
    befehle: [...DREH, 'for', V('print(ernte)')],
    tipps: ['Hin, zurück, hin – wie eine Schlange. Die zweite Kurve geht nach links.', 'Auch in den Kurven wird geerntet und gezählt.', 'Die Kiste wird nur einmal ganz oben angelegt.'],
    loesung: 'ernte = 0\nfor i in range(3):\n    forward()\n    harvest()\n    ernte = ernte + 1\nturn_right()\nforward()\nharvest()\nernte = ernte + 1\nturn_right()\nfor i in range(3):\n    forward()\n    harvest()\n    ernte = ernte + 1\nturn_left()\nforward()\nharvest()\nernte = ernte + 1\nturn_left()\nfor i in range(3):\n    forward()\n    harvest()\n    ernte = ernte + 1\nprint(ernte)' }),

  // --- Kapitel 23 (Burg 8): 📋 Listen (Lehrplan Kl. 8: Arrays) – Index ab 0, len, append; Summe und Maximum selbst mit for ---
  // Geprüft wird über die Lagen: Beete/Wege sind jeden Tag anders, gemeldet wird die ganze Liste (print(beete) → „[3, 2, 4]“)
  hof({ id: 'y1', kapitel: 23, ico: '📋', titel: 'Der Plan', lohn: 60, sprache: S_LISTE,
    ziel: 'Im Plan steht, wie viele Schritte der Bauer bis zur nächsten Rübe geht: plan = [3, 1, 4]. Der Anfang steht schon da. Ergänze den Rest mit plan[1] und plan[2].',
    start: O(['...rr...r']), befehle: [...SEQ, 'for'],
    vorlage: 'plan = [3, 1, 4]\nfor i in range(plan[0]):\n    forward()\nharvest()\n',
    merke: { titel: '📋 Listen', text: 'Eine Liste speichert mehrere Werte unter einem Namen. Jeder Platz hat eine Nummer, den Index – gezählt wird ab 0. len(liste) sagt, wie viele Werte drin sind.',
      code: 'tiere = ["Kuh", "Huhn", "Ziege"]\nprint(tiere[0])    # Kuh\nprint(tiere[2])    # Ziege\nprint(len(tiere))  # 3' },
    tipps: ['plan[0] ist die 3, plan[1] die 1, plan[2] die 4.', 'Jedes Stück ist gleich gebaut: Schritte mit for, dann harvest().', 'Kopiere die drei Zeilen zweimal und ändere plan[0] in plan[1] bzw. plan[2].'],
    // Nachprüfung 2026-11-14: range(1), range(4) oder forward() untereinander gingen ohne Liste
    codeRegeln: [{ muss: /range\(\s*plan\[/, text: 'Benutze den Plan: Die Schleifen sollen mit range(plan[0]), range(plan[1]) und range(plan[2]) zählen.' }, R_FESTE_ZAHL, R_FORWARDS],
    loesung: 'plan = [3, 1, 4]\nfor i in range(plan[0]):\n    forward()\nharvest()\nfor i in range(plan[1]):\n    forward()\nharvest()\nfor i in range(plan[2]):\n    forward()\nharvest()' }),
  VORHER({ id: 'y1v', kapitel: 23, ico: '🔮', titel: 'Der Plan in der Schleife', lohn: 60, sprache: S_LISTE,
    start: O(['.rr.rrrr']), befehle: SEQ,
    tipps: ['i läuft 0, 1, 2 – len(plan) ist 3. plan[i] ist also erst 2, dann 3, dann 1.', 'harvest() steht nach der inneren Schleife: Geerntet wird nur am Ende jedes Wegstücks.'],
    code: 'plan = [2, 3, 1]\nfor i in range(len(plan)):\n    for j in range(plan[i]):\n        forward()\n    harvest()' }),
  hof({ id: 'y2', kapitel: 23, ico: '🧱', titel: 'Der Pflasterplan', lohn: 60, sprache: S_LISTE,
    ziel: 'Auf dem Weg liegt Laub 🍂 – manche Haufen verdecken ein Loch, unter anderen ist fester Boden. is_hole() sieht unter dem Laub nichts. Nur der Pflasterplan weiß, wie weit es bis zum nächsten Loch ist: plan = [1, 3, 2, 2, 4]. Flick alle Löcher – mit einer Schleife über die Liste.',
    start: ZIEGEL(O(['.lk.l.lklk.kl']), 5), befehle: [...KAROL, 'for', VL('plan = [¦]')],
    tipps: ['Wie im Code eben: for i in range(len(plan)): läuft einmal für jeden Eintrag.', 'Innen: plan[i]-mal forward(), dann place().', 'for i in range(len(plan)): · for j in range(plan[i]): forward() · place()'],
    // Nachprüfung 2026-11-14: while can_move() + if is_hole() ging ohne Liste – darum Laub (is_hole() sieht nichts) und Regeln
    codeRegeln: [{ muss: /for\s+\w+\s+in\s+range\(\s*len\(\s*plan\s*\)\s*\)/, text: 'Lauf mit einer Schleife über die ganze Liste: for i in range(len(plan)):' },
      { muss: /range\(\s*plan\[/, text: 'Die Schritte bis zum nächsten Loch stehen im Plan: for j in range(plan[i]):' }, R_FESTE_ZAHL, R_FORWARDS],
    loesung: 'plan = [1, 3, 2, 2, 4]\nfor i in range(len(plan)):\n    for j in range(plan[i]):\n        forward()\n    place()' }),
  hof({ id: 'y3', kapitel: 23, ico: '📏', titel: 'Das Messbuch', lohn: 65, sprache: S_LISTE,
    ziel: 'Geh bis zum Zaun, dreh nach rechts und geh bis zum Rand. Schreib beide Längen in die Liste laengen und melde sie: print(laengen). Der Acker ist jeden Tag anders.',
    start: O(['...#.', '.....', '.....', '.....']), varianten: [O(['.....#', '......']), O(['.#', '..', '..', '..', '..'])],
    meldung: (st) => { const [a, x, y] = laufLaenge(st, st.x, st.y, st.dir); return pyListe([a, laufLaenge(st, x, y, DREH_R[st.dir])[0]]); },
    befehle: [...DREH, 'for', 'while', VL('laengen.append(¦)', true), VL('print(¦)')],
    merke: { titel: '➕ Listen wachsen', text: 'messbuch = [] ist eine leere Liste. messbuch.append(7) hängt die 7 hinten an. print(messbuch) zeigt die ganze Liste mit eckigen Klammern.', code: 'messbuch = []\nmessbuch.append(7)\nmessbuch.append(2)\nprint(messbuch)   # [7, 2]' },
    tipps: ['Zweimal dasselbe: Schritte zählen bis es nicht weitergeht, Zahl in die Liste, rechts drehen.', 'Vor jedem Stück fängt schritte wieder bei 0 an.', 'laengen = [] · for k in range(2): schritte = 0 · while …: forward(), schritte += 1 · laengen.append(schritte) · turn_right() · print(laengen)'],
    loesung: 'laengen = []\nfor k in range(2):\n    schritte = 0\n    while can_move():\n        forward()\n        schritte += 1\n    laengen.append(schritte)\n    turn_right()\nprint(laengen)' }),
  hof({ id: 'y4', kapitel: 23, ico: '🥕', titel: 'Beete zählen', lohn: 65, sprache: S_LISTE,
    ziel: 'Ernte bis zum Rand. Die Beete sind durch ein leeres Feld getrennt. Schreib für jedes Beet die Anzahl der Rüben in die Liste beete und melde sie: print(beete).',
    start: O(['.rrr.rr.rrrr']), varianten: [O(['.rr.rrrrr.r']), O(['.rrrr'])], meldung: (st) => pyListe(beeteVon(st)),
    befehle: [...SEQ, 'while', 'if', 'else', V('beete = []'), V('print(beete)')],
    tipps: ['Zähl die Rüben des aktuellen Beets in anzahl. Auf einem leeren Feld ist das Beet zu Ende.', 'Beet zu Ende: beete.append(anzahl) und anzahl wieder auf 0.', 'Nach der Schleife fehlt noch das letzte Beet – auch das kommt mit append in die Liste.'],
    loesung: 'beete = []\nanzahl = 0\nwhile can_move():\n    forward()\n    if can_harvest():\n        harvest()\n        anzahl += 1\n    else:\n        beete.append(anzahl)\n        anzahl = 0\nbeete.append(anzahl)\nprint(beete)' }),
  hof({ id: 'yx', kapitel: 23, ico: '🐞', titel: 'Der verrutschte Plan', lohn: 65, sprache: S_LISTE,
    ziel: 'Der Bauer soll nach dem Plan ernten: plan = [2, 4, 2]. Der Code bricht aber ab. Finde und behebe den Fehler!',
    start: O(['..r...r.r']), befehle: [...SEQ, 'for'],
    vorlage: 'plan = [2, 4, 2]\nfor i in range(1, len(plan) + 1):\n    for j in range(plan[i]):\n        forward()\n    harvest()',
    tipps: ['range(1, 4) zählt 1, 2, 3. Welche Plätze hat die Liste plan?', 'Der erste Platz einer Liste hat den Index 0, der letzte len(plan) − 1.', 'Lass i ganz normal laufen: for i in range(len(plan)):'],
    loesung: 'plan = [2, 4, 2]\nfor i in range(len(plan)):\n    for j in range(plan[i]):\n        forward()\n    harvest()' }),
  hof({ id: 'y5', kapitel: 23, ico: '➕', titel: 'Wie viele insgesamt?', lohn: 70, sprache: S_LISTE,
    ziel: 'Schreib wieder die Beete in die Liste beete. Rechne dann mit einer Schleife über die Liste die Summe aus (sum() gibt es hier nicht) und melde beides mit einem print: print(beete, summe).',
    start: O(['.rr.rrrr.r']), varianten: [O(['.rrrrr.rrr']), O(['.r.r.r.rr'])], meldung: (st) => { const b = beeteVon(st); return `${pyListe(b)} ${b.reduce((s, x) => s + x, 0)}`; },
    befehle: [...SEQ, 'while', 'if', 'else', 'for', VL('beete.append(¦)'), VL('print(¦)')],
    tipps: ['Der erste Teil ist wie bei „Beete zählen“.', 'summe = 0, dann für jeden Index i: summe += beete[i].', 'for i in range(len(beete)): summe += beete[i] – danach print(beete, summe)'],
    // Nachprüfung 2026-11-14: ein Zähler beim Ernten ergab die Summe ohne Liste
    codeRegeln: [{ muss: /\+=?\s*\w+\[[^\]]+\]/, text: 'Die Summe soll aus der Liste kommen: Geh nach dem Ernten mit for über die Liste und zähl zusammen – summe += beete[i]. Ein Zähler beim Ernten gilt hier nicht.' }],
    loesung: 'beete = []\nanzahl = 0\nwhile can_move():\n    forward()\n    if can_harvest():\n        harvest()\n        anzahl += 1\n    else:\n        beete.append(anzahl)\n        anzahl = 0\nbeete.append(anzahl)\nsumme = 0\nfor i in range(len(beete)):\n    summe += beete[i]\nprint(beete, summe)' }),
  hof({ id: 'y6', kapitel: 23, knobel: true, ico: '🏆', titel: 'Das größte Beet', lohn: 80, sprache: S_LISTE,
    ziel: 'Welches Beet ist das größte? Melde, wie viele Rüben es hat und an welchem Platz der Liste es steht (ab 0 gezählt): print(groesste, platz). max() gibt es hier nicht.',
    start: O(['.rr.rrrr.rrr']), varianten: [O(['.rrrrr.r.rr']), O(['.r.rr.rrr.rrrrrr'])],
    meldung: (st) => { const b = beeteVon(st), m = Math.max(...b); return `${m} ${b.indexOf(m)}`; },
    befehle: [...SEQ, 'while', 'if', 'else', 'for', VL('beete.append(¦)'), VL('print(¦)')],
    tipps: ['Erst wie gehabt die Liste beete füllen.', 'Merk dir das größte bisher (groesste = beete[0], platz = 0) und geh die Liste durch.', 'if beete[i] > groesste: dann groesste = beete[i] und platz = i'],
    // Nachprüfung 2026-11-14: das Maximum ließ sich schon beim Laufen merken – gesucht wird aber in der Liste
    codeRegeln: [{ muss: /\w+\[[^\]]+\]\s*[<>]|[<>]=?\s*\w+\[[^\]]+\]/, text: 'Such das größte Beet in der Liste: Geh mit for über die Liste und vergleiche beete[i] mit dem größten bisher. Mitzählen beim Laufen gilt hier nicht.' }],
    loesung: 'beete = []\nanzahl = 0\nwhile can_move():\n    forward()\n    if can_harvest():\n        harvest()\n        anzahl += 1\n    else:\n        beete.append(anzahl)\n        anzahl = 0\nbeete.append(anzahl)\ngroesste = beete[0]\nplatz = 0\nfor i in range(len(beete)):\n    if beete[i] > groesste:\n        groesste = beete[i]\n        platz = i\nprint(groesste, platz)' }),
];
// Burg 8 (Nachprüfung 2026-11-14): Nur der erste Hof eines Kapitels bekommt die ganzen Kopf-Bausteine (while can_move():),
// danach gibt es nur das Schlüsselwort (while ▢:) – die Bedingung denkt und tippt man selbst.
for (const k of BURGEN[8].kapitel) {
  const liste = HOEFE.filter((h) => h.kapitel === k && !h.vorhersage);
  for (const h of liste.slice(1)) h.befehle = (h.befehle || []).map((b) => (b === 'while' || b === 'if' || b === 'elif' ? b + '_' : b));
}
const hofById = (id) => HOEFE.find((h) => h.id === id) || PRUEFUNGEN.find((h) => h.id === id);
const kapitelHoefe = (k) => HOEFE.filter((h) => h.kapitel === k);
// Alle Höfe der aktuellen Burg, in der Reihenfolge ihrer Kapitel
const burgHoefe = () => burgKapitel().flatMap(kapitelHoefe);
const hofBurg = (h) => +Object.keys(BURGEN).find((b) => BURGEN[b].kapitel.includes(h.kapitel));
const kapitelFertig = (k) => kapitelHoefe(k).filter((h) => !h.knobel).every((h) => P.hoefe[h.id]?.fertig);
// Offen: das erste Kapitel der Burg, jedes weitere, wenn das vorige fertig ist (Kapitel anderer Burgen: nie).
// Wer dort schon etwas gelöst hat (Stand von vor dem Einfügen neuer Höfe), dem bleibt es offen.
const ZUSATZ_AB = 140;
function kapitelOffen(k) {
  const liste = burgKapitel(), i = liste.indexOf(k);
  if (i < 0) return false;
  // Zusatzkapitel (Ids ab 140, nachträglich eingeschoben) sperren die regulären Kapitel dahinter nicht (Spieltest:
  // wer 93 fertig hatte, kam sonst erst nach dem neuen Kapitel 160 an 94) – sie öffnen sich parallel
  let j = i - 1;
  if (k < ZUSATZ_AB) while (j >= 0 && liste[j] >= ZUSATZ_AB) j--;
  return i === 0 || j < 0 || (P.kapFrei || []).includes(k) || kapitelFertig(liste[j]) || liste.slice(i).some((x) => kapitelHoefe(x).some((h) => P.hoefe[h.id]?.fertig));
}
// Offen: erster Hof eines offenen Kapitels, jeder Hof nach einem gelösten; Knobelhof, wenn das Kapitel fertig ist
function hofOffenId(id) {
  const h = HOEFE.find((x) => x.id === id);
  if (!h || !kapitelOffen(h.kapitel)) return false;
  if (h.knobel) return kapitelFertig(h.kapitel);
  const liste = kapitelHoefe(h.kapitel).filter((x) => !x.knobel), i = liste.indexOf(h);
  // offen: erster Hof, Vorgänger gelöst – oder ein späterer Hof ist schon gelöst (Stand von vor dem Einfügen neuer Höfe)
  return i === 0 || !!P.hoefe[liste[i - 1].id]?.fertig || liste.slice(i).some((x) => P.hoefe[x.id]?.fertig);
}
// Alte Spielstände (vor dem Umbau in 8 Kapitel): Hof-Ids umstellen
const ALTE_IDS = { start: 'b1', reihe: 'b2', luecke: 'b3', kurve: 'b4', bogen: 'b6', lang5: 'f1', lang8: 'f2', jedes2: 'f3', winkel: 'f4',
  ecke: 'f5', treppe: 'f6', setzling: 'i1', luecken: 'i2', zaunbeet: 'i3', beete2: 'i6', zaun: 'w1', zaunecke: 'w4', kiste: 'v1',
  messen: 'v2', buntzaehlen: 'i4', zaunzaehlen: 'i5', heimweg: 'v4' };
