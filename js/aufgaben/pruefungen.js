'use strict';
// --- ⚜️ Prüfungen: schwere Programmieraufgaben im Prüfungsturm ---------------------------
// Ab einem Level des Helden. Keine Tipps, mehrere Varianten. Jede bestandene Prüfung = 1 Spezialisierungspunkt.
// bald = braucht ein Kapitel, das es noch nicht gibt (dann nur als Ausblick sichtbar).
// Aufbau wie ein Hof (siehe hoefe.js), dazu pruefung: true und level.

const PRUEFUNGEN = [
  {
    id: 'p1', pruefung: true, level: 20, kapitel: 6, ico: '⚜️', titel: 'Prüfung der Kehre',
    ziel: 'Ernte bis zum Zaun, dann eine Reihe tiefer zurück bis zum Rand. Setzlinge bleiben stehen.',
    start: O(['.rsrr#', 'srrsr.']), varianten: [O(['.rrsrrs#', 'rsrrsrr.']), O(['.sr#', 'rrr.'])],
    befehle: [...DREH, 'while', 'if'], sprache: ['for', 'if', 'while'], lohn: 0, par: 13, sparsam: 99,
    tipps: [],
    loesung: 'while can_move():\n    forward()\n    if can_harvest():\n        harvest()\nturn_right()\nforward()\nif can_harvest():\n    harvest()\nturn_right()\nwhile can_move():\n    forward()\n    if can_harvest():\n        harvest()',
  },
  {
    id: 'p2', pruefung: true, level: 30, kapitel: 6, ico: '⚜️', titel: 'Prüfung des Ackers',
    ziel: 'Ernte den ganzen Acker: 4 Reihen, jeden Tag anders breit. Setzlinge bleiben stehen.',
    start: O(['.rsrr', 'rrsrr', 'srrrs', 'rrsrr']),
    varianten: [O(['.rrsrrr', 'rsrrsrr', 'rrrsrrs', 'srrrrsr']), O(['.rs', 'srr', 'rsr', 'rrs'])],
    befehle: [...DREH, 'for', 'while', 'if'], sprache: ['for', 'if', 'while'], lohn: 0, par: 19, sparsam: 99,
    tipps: [],
    loesung: 'for i in range(2):\n    while can_move():\n        forward()\n        if can_harvest():\n            harvest()\n    turn_right()\n    forward()\n    if can_harvest():\n        harvest()\n    turn_right()\n    while can_move():\n        forward()\n        if can_harvest():\n            harvest()\n    turn_left()\n    forward()\n    if can_harvest():\n        harvest()\n    turn_left()',
  },
  {
    id: 'p3', pruefung: true, level: 40, kapitel: 6, ico: '⚜️', titel: 'Prüfung der Zahlen',
    ziel: 'Ernte bis zum Zaun (Setzlinge bleiben stehen), geh zurück auf dein Startfeld 🏠 und melde, wie viele Rüben du geerntet hast.',
    start: HEIM(['..rsrrs#'], 1), varianten: [HEIM(['...srrrsrr#'], 2), HEIM(['..sr#'], 1)], meldung: meldeErnte,
    befehle: [...DREH, 'for', 'while', 'if', V('schritte = 0'), V('ernte = 0'), V('schritte += 1'), V('ernte += 1'), V('print(ernte)')],
    sprache: ['for', 'if', 'while', 'var'], lohn: 0, par: 13, sparsam: 99,
    tipps: [],
    loesung: 'schritte = 0\nernte = 0\nwhile can_move():\n    forward()\n    schritte += 1\n    if can_harvest():\n        harvest()\n        ernte += 1\nturn_right()\nturn_right()\nfor i in range(schritte):\n    forward()\nprint(ernte)',
  },
];
// --- ⚜️ Wissensprüfungen (Burg 7, Nutzerwunsch 2026-11-09): „Ein Meister muss zeigen, was er kann.“ ---
// Keine Höfe, sondern Fragen zu Code und Begriffen (wie in einer Klassenarbeit): 6 Fragen, bestanden ab QUIZ_BESTEHEN richtigen.
// Keine Tipps; ein Versuch pro Tag. Nach jeder Antwort sieht man, was richtig gewesen wäre.
// QF(code, frage, richtig, ...falsch) – code darf leer sein
const QUIZ_BESTEHEN = 5;
const QF = (code, frage, richtig, ...falsch) => ({ code, frage, optionen: [richtig, ...falsch] });   // Index 0 = richtig (wird gemischt)
PRUEFUNGEN.push(
  { id: 'q1', pruefung: true, art: 'quiz', level: 10, kapitel: 3, ico: '⚜️', titel: 'Prüfung der Schleifen', fragen: [
    QF('for i in range(4):\n    forward()\n    harvest()', 'Wie oft wird harvest() ausgeführt?', '4-mal', '1-mal', '8-mal'),
    QF('for i in range(3):\n    forward()\nharvest()', 'Wie oft wird hier geerntet?', '1-mal', '3-mal', 'gar nicht'),
    QF('', 'Was ist eine Zählschleife?', 'Sie wiederholt Befehle eine feste Anzahl von Malen.', 'Sie wiederholt Befehle, solange vor dem Bauern frei ist.', 'Sie zählt, wie viele Befehle im Programm stehen.', 'Sie führt die Befehle in umgekehrter Reihenfolge aus.'),
    QF('for i in range(2):\n    for j in range(3):\n        forward()', 'Wie viele Schritte geht der Bauer?', '6', '5', '3'),
    QF('', 'Vor dem Bauern liegen 5 Rüben in einer Reihe. Welcher Code erntet alle?', 'for i in range(5):\n    forward()\n    harvest()', 'for i in range(5):\n    forward()\nharvest()', 'forward()\nharvest()\nfor i in range(5):'),
    QF('', 'Was ist ein Algorithmus?', 'Eine eindeutige, ausführbare und endliche Handlungsvorschrift.', 'Ein Programm, das nur in Python geschrieben werden kann.', 'Eine Liste aller Befehle, die ein Roboter kennt.', 'Ein Plan, der so ungefähr sagt, was zu tun ist.'),
  ] },
  { id: 'q2', pruefung: true, art: 'quiz', level: 18, kapitel: 22, ico: '⚜️', titel: 'Prüfung der Ziegel', fragen: [
    QF('for i in range(3):\n    forward()\n    pick_up()', 'Auf jedem Feld liegt ein Ziegel, der Korb ist leer. Wie viele Ziegel sind danach im Korb?', '3', '1', '0'),
    QF('forward()\nplace()', 'Vor dem Bauern ist ein Loch. Der Korb ist leer. Was passiert bei place()?', 'Nichts wird gelegt, der Korb ist ja leer.', 'Das Loch wird trotzdem geflickt.', 'Der Bauer hebt erst einen Ziegel auf.', 'Der Bauer legt den Ziegel neben das Loch.'),
    QF('for i in range(4):\n    forward()\n    pick_up()\n    forward()\n    place()', 'Wie viele Schritte geht der Bauer insgesamt?', '8', '4', '2'),
    QF('for i in range(3):\n    forward()\nplace()', 'Wie oft wird place() ausgeführt?', 'einmal – nach der Schleife', 'in jeder Runde, also 3-mal', 'gar nicht'),
    QF('for i in range(2):\n    for j in range(2):\n        forward()\n        place()', 'Genug Ziegel im Korb, überall Löcher. Wie viele Ziegel werden gelegt?', '4', '2', '6'),
    QF('', 'Warum benutzt man Schleifen?', 'Damit man gleiche Befehle nicht immer wieder aufschreibt.', 'Damit der Bauer mehrere Befehle gleichzeitig ausführt.', 'Damit jeder Befehl im Programm nur einmal läuft.', 'Damit der Bauer schneller über den Acker läuft.'),
  ] },
  { id: 'q3', pruefung: true, art: 'quiz', level: 26, kapitel: 5, ico: '⚜️', titel: 'Prüfung der Variablen', fragen: [
    QF('ernte = 0\nernte = ernte + 1\nernte = ernte + 1\nprint(ernte)', 'Was meldet print?', '2', '1', '0'),
    QF('korb = 10\nfor i in range(3):\n    korb = korb - 1\nprint(korb)', 'Was meldet print?', '7', '3', '10'),
    QF('', 'Was ist eine Variable?', 'Ein Behälter mit Namen, in dem ein Wert liegt.', 'Ein Befehl, der den Bauern ein Feld weiterschickt.', 'Eine Schleife, die sich ihre Runden selbst zählt.', 'Eine Zahl, die sich im Programm nie ändern darf.'),
    QF('x = 5\nx = 2\nprint(x)', 'Was meldet print?', '2', '5', '7'),
    QF('n = 0\nfor i in range(2):\n    for j in range(3):\n        n = n + 1\nprint(n)', 'Was meldet print?', '6', '5', '3', '2'),
    QF('for i in range(4):\n    ernte = 0\n    forward()\n    harvest()\n    ernte = ernte + 1\nprint(ernte)', 'Vor dem Bauern liegen 4 Rüben. Was meldet print?', '1', '4', '0', '5'),
  ] },
);
// --- ⚜️ Burg 10 (Klasse 10): p4 Unterprogramme (Kapitel 112), p5 Listen (Kapitel 113) – nach OPAL Kl. 10 2_4_Unterprogramme / 3_7_arrays ---
PRUEFUNGEN.push(
  {
    id: 'p4', pruefung: true, level: 15, kapitel: 112, ico: '⚜️', titel: 'Prüfung der Unterprogramme',
    ziel: 'Ernte drei Reihen, jede bis zum Zaun oder Rand (Setzlinge bleiben stehen), und melde am Ende, wie viele Rüben es insgesamt waren. Die Reihen sind jeden Tag anders lang – schreib dir eigene Unterprogramme.',
    start: O(['.rsr#..', '.rrsrr#', '.srr#..', '.......']),
    varianten: [O(['.rrsrr#', '.sr#...', '.rrrsrr', '.......']), O(['.r#', '.rr', '.sr', '...'])], meldung: meldeErnte,
    befehle: [...DREH, 'for', 'while', 'if', V('def reihe():'), V('return anzahl'), V('summe = 0'), V('print(summe)')],
    sprache: ['for', 'while', 'var', 'if', 'def'], lohn: 0, par: 21, sparsam: 99,
    tipps: [],
    loesung: 'def reihe():\n    anzahl = 0\n    while can_move():\n        forward()\n        if can_harvest():\n            harvest()\n            anzahl = anzahl + 1\n    return anzahl\n\ndef zurueck():\n    turn_right()\n    turn_right()\n    while can_move():\n        forward()\n    turn_left()\n    forward()\n    turn_left()\n\nsumme = 0\nfor i in range(3):\n    summe = summe + reihe()\n    zurueck()\nprint(summe)',
  },
  { id: 'p5', pruefung: true, art: 'quiz', level: 22, kapitel: 113, ico: '⚜️', titel: 'Prüfung der Listen', fragen: [
    QF('tiere = ["Hund", "Katze", "Maus"]\nprint(tiere[1])', 'Was wird ausgegeben?', 'Katze', 'Hund', 'Maus'),
    QF('tiere = ["Hund", "Katze", "Maus"]\ntiere.append("Fuchs")\nprint(len(tiere))', 'Was wird ausgegeben?', '4', '3', '5'),
    QF('tiere = ["Hund", "Katze", "Maus"]\ntiere.insert(1, "Löwe")\nprint(tiere[2])', 'Was wird ausgegeben?', 'Katze', 'Löwe', 'Maus'),
    QF('zahlen = [2, 4, 6]\nfor zahl in zahlen:\n    print(zahl * 2)', 'Welche Zahlen werden ausgegeben?', '4, 8 und 12', '2, 4 und 6', '24'),
    QF('werte = [5, 12, 17, 8, 4]\nanzahl = 0\nfor zahl in werte:\n    if zahl > 10:\n        anzahl += 1\nprint(anzahl)', 'Was wird ausgegeben?', '2', '3', '5'),
    QF('', 'Welchen Index hat das erste Element einer Liste?', '0', '1', '-1'),
  ] },
);

// Prüfungen gehören zu der Burg, deren Kapitel sie prüfen (bald = Kapitel fehlt noch: Burg 8 als Ausblick)
const burgPruefungen = () => PRUEFUNGEN.filter((p) => (p.bald ? 8 : hofBurg(p)) === BURGNR);
const naechstePruefung = () => burgPruefungen().find((p) => !P.pruefungen[p.id]);
// Eine Prüfung braucht das Level des Helden UND das Kapitel, dessen Wissen sie prüft; ein Versuch pro Tag
const pruefungSperre = (p) => (!kapitelFertig(p.kapitel) ? `erst Kapitel ${kapNr(p.kapitel)} schaffen` : heldLevel().level < p.level ? `ab Level ${p.level}`
  : P.hoefe[p.id]?.heute === P.tag ? 'heute schon versucht – morgen wieder' : null);

// Ablauf einer Wissensprüfung: Frage antippen = auswählen, „✅ Antworten“ = festlegen, dann „Weiter“
let QZ = null;
function quizStart(p) {
  QZ = { p, i: 0, richtig: 0, sel: null, gezeigt: false,
    reihen: p.fragen.map((f) => f.optionen.map((_, j) => j).sort(() => Math.random() - 0.5)) };
  quizFrage();
}
function quizFrage() {
  const { p, i } = QZ, f = p.fragen[i], reihe = QZ.reihen[i];
  const opt = (j) => { const t = f.optionen[j]; return t.includes('\n') || /\(\)|range\(/.test(t) ? `<pre class="mono">${esc(t)}</pre>` : esc(t); };
  const klasse = (j) => (QZ.gezeigt ? (j === 0 ? 'qrichtig' : j === QZ.sel ? 'qfalsch' : '') : QZ.sel === j ? 'sel' : '');
  karte(`<h2>⚜️ ${esc(p.titel)}</h2><p class="hinweis">Frage ${i + 1} von ${p.fragen.length} · ${QZ.richtig} richtig · bestanden ab ${QUIZ_BESTEHEN} · keine Tipps</p>
    ${f.code ? `<pre class="mono qcode">${esc(f.code)}</pre>` : ''}<p><b>${esc(f.frage)}</b></p>
    <div class="spezwahl quiz">${reihe.map((j) => `<button data-q="${j}" class="${klasse(j)}" ${QZ.gezeigt ? 'disabled' : ''}>${opt(j)}</button>`).join('')}</div>
    ${QZ.gezeigt ? `<p class="${QZ.sel === 0 ? 'lohn' : 'hinweis'}">${QZ.sel === 0 ? '✅ Richtig!' : '❌ Leider nicht – die grün markierte Antwort stimmt.'}</p>` : ''}`,
  [QZ.gezeigt
    ? { label: i + 1 < p.fragen.length ? 'Weiter ▶' : 'Ergebnis', cls: 'gold', offen: true, fn: () => { QZ.i++; QZ.sel = null; QZ.gezeigt = false; if (QZ.i < p.fragen.length) quizFrage(); else quizEnde(); } }
    : { label: QZ.sel === null ? '👆 Erst eine Antwort antippen' : '✅ Antworten', cls: QZ.sel === null ? 'leise' : 'gold', offen: true,
      fn: () => { if (QZ.sel === null) return; QZ.gezeigt = true; if (QZ.sel === 0) QZ.richtig++; quizFrage(); } }]);
  for (const b of document.querySelectorAll('[data-q]')) b.onclick = () => { if (!QZ.gezeigt) { QZ.sel = +b.dataset.q; quizFrage(); } };
}
function quizEnde() {
  const { p, richtig } = QZ, ok = richtig >= QUIZ_BESTEHEN, erste = ok && !Object.keys(P.pruefungen).length;
  hofStand(p.id).heute = P.tag; hofStand(p.id).versuche++;
  if (ok) { P.pruefungen[p.id] = true; hofStand(p.id).fertig = true; if (erste) TTAB = 'spez'; }
  speichern();
  QZ = null;
  karte(ok
    ? `<h2>⚜️ Prüfung bestanden!</h2><p>${richtig} von ${p.fragen.length} richtig – du hast gezeigt, was ein Meister kann.</p>
       <p class="lohn" style="color:#e0c8ff">+1 Spezialisierungspunkt</p>
       <p class="hinweis">${erste ? 'Heute Abend wählst du im ✨ Talentblatt deine Spezialisierung: Chaos, Licht, Natur oder Zeit.' : 'Lerne ihn heute Abend im ✨ Talentblatt (⚜️ Spezialisierung).'}</p>`
    : `<h2>Prüfung nicht bestanden</h2><p>${richtig} von ${p.fragen.length} richtig – zum Bestehen brauchst du ${QUIZ_BESTEHEN}.</p>
       <p class="hinweis">Schau dir im 📓 Heft die Merksätze noch einmal an. Morgen kannst du es wieder versuchen.</p>`,
  [{ label: '🌇 Feierabend', fn: feierabend }]);
}
const pruefungOffen = (p) => p && !p.bald && !pruefungSperre(p);
