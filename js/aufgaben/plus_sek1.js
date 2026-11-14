'use strict';
// --- 🏫 Sek I: fehlende Kapitel für Burg 7, 8 und 9 (OPAL INFO_SEK1, Stoffverteilungspläne Klasse 7–9) ---
// Burg 7: 140 Was ist ein Algorithmus? (eindeutig, ausführbar, endlich) · 141 Der Bauer als Objekt (Klasse, Objekt,
//         Attribut, Methode, Objektkarte, Klassenkarte, Punktnotation, Zustandsdiagramm der Ampel)
// Burg 8: 142 Belegungstabelle (Variablen Schritt für Schritt verfolgen, kopf-/fußgesteuerte Schleife)
// Burg 9: 144 Baupläne des Archivs (Tabelle, Attribut, Datensatz, Datenwert, Primärschlüssel, Datentypen, ER-Modell,
//         Kardinalitäten, Fremdschlüssel) – ganz am Anfang von Burg 9, vor dem ersten SQL-Kapitel 11
// Technik: Kornspeicher-Ablauf (KORN mit warte) mit ortInfo = 🏫 Dorfschule bzw. 🗺️ Plansaal; dazu ein Acker-Hof (la3).
// Quellen (nur Lehrplan Gymnasium Informatik 2022 Sachsen + eigener OPAL-Kurs):
//   140: Kl. 7 lb3_algorithmen/10_algorithmus.html, svp_7 SW 27 (Lehrplan Kl. 8 LB 1 Algorithmusbegriff)
//   141: Kl. 7 lb3_algorithmen/5_klassen_objekte, 6_klassenkarten_objektkarten, 7_methode_punknotation; lb2/03_zustandsmodelle1; svp_7 SW 15, 20–22
//   142: Kl. 8 lb1_algorithmen/03_variablen, 04_schleifen (Variablenbelegungstabelle); svp_8 SW 5–6 (kopf-/fußgesteuert, Endlosschleife)
//   144: Kl. 9 lb1_informationenUndDaten/datenbank_begriffe, relationale_db, relationenmodell, erm_bestandteile, kardinalitaeten; svp_9 SW 12–16

KAPITEL[140] = { name: 'Was ist ein Algorithmus?', ico: '📋' };
KAPITEL[141] = { name: 'Der Bauer als Objekt', ico: '🃏' };
KAPITEL[142] = { name: 'Belegungstabelle', ico: '🧾' };
KAPITEL[144] = { name: 'Baupläne des Archivs', ico: '🗺️' };

// Kapitel an passender Stelle in die Burgen einsortieren (vor dem Kapitel „vor“, sonst hinten an)
function S1_einfuegen(b, neu, vor) {
  const k = BURGEN[b]?.kapitel;
  if (!k || k.includes(neu)) return;
  const i = vor == null ? -1 : k.indexOf(vor);
  if (i < 0) k.push(neu); else k.splice(i, 0, neu);
}
S1_einfuegen(7, 140, 3);     // Burg 7: Blöcke → Algorithmus → for …
S1_einfuegen(7, 141, 2);     // … Variablen → Objekte (bauer.forward()) → Python tippen
S1_einfuegen(8, 142, 7);     // Burg 8: … if → Belegungstabelle → else …
S1_einfuegen(9, 144, 11);    // Burg 9: Baupläne ganz am Anfang – erst die Begriffe (Attribut, Datensatz, Schlüssel), dann SQL (Didaktik-Prüfung 2026-11-13)
// Burg 9 hat damit 12 Kapitel – der 12. Platz steht in KARTE_DOERFER (karte.js)
BURGEN[7].text = 'Mit Blöcken: Befehle, Drehen, was ein Algorithmus ist, die Zählschleife for, Ziegel legen, Variablen. Dann der Bauer als Objekt (Klasse, Attribut, Methode) und zum Schluss Python selbst tippen.';
BURGEN[8].text = 'In Python: kurz auffrischen, dann die Schleife while, Zählen mit while, Verzweigungen if, else, elif, Programme Schritt für Schritt in der Belegungstabelle verfolgen und Listen.';
BURGEN[9].text = '📜 Archiv: erst Tabellen verstehen (Attribut, Datensatz, Primär- und Fremdschlüssel, ER-Modell), dann Datenbanken mit SQL (vor allem WHERE). 🔭 Späherturm: wie KI lernt – Entscheidungsbaum, Testdaten, Verzerrung, Bauernschach, Wortvorhersage.';

// --- Orte und Bausteine ---
function S1_svgSchule(fertig) {
  return `<ellipse cx="0" cy="32" rx="44" ry="8" fill="rgba(0,0,0,.25)"/>
    <rect x="-36" y="-10" width="72" height="42" fill="#e9d2a8" stroke="#8a6a3a" stroke-width="2"/>
    <polygon points="-42,-10 0,-38 42,-10" fill="${fertig ? '#c9a030' : '#b5452f'}" stroke="#5a2418" stroke-width="2"/>
    <rect x="-6" y="-56" width="12" height="20" fill="#e9d2a8" stroke="#8a6a3a" stroke-width="1.5"/>
    <polygon points="-9,-56 0,-66 9,-56" fill="#7a4a24"/><circle cx="0" cy="-46" r="3.5" fill="#d9a520"/>
    <rect x="-7" y="10" width="14" height="22" fill="#7a4a24"/>
    <rect x="-28" y="0" width="14" height="12" fill="${fertig ? '#ffe27a' : '#9ac8e8'}" stroke="#5a3a1f"/>
    <rect x="14" y="0" width="14" height="12" fill="${fertig ? '#ffe27a' : '#9ac8e8'}" stroke="#5a3a1f"/>
    <text x="22" y="-16" style="font-size:12px">✏️</text>`;
}
const S1_SCHULE = { ort: 'Schule', im: 'in der Dorfschule', ico: '🏫', haupt: '🏫 In die Dorfschule', sub: 'Tippe die Dorfschule an, um ihre Aufträge zu sehen.', svg: (f) => S1_svgSchule(f) };
const S1_PLANSAAL = { ort: 'Saal', im: 'im Plansaal', ico: '🗺️', haupt: '🗺️ In den Plansaal', sub: 'Tippe den Plansaal an, um seine Aufträge zu sehen.', svg: (f) => svgBibliothek(f) };
const S1_K = (a) => KORN({ warte: true, zielArt: 'wert', funktion: null, sprache: S_LK, ortInfo: S1_SCHULE, sprecher: ['👩‍🏫', 'Lehrerin Lina'], ortIco: '🏫', ortName: 'Dorfschule', ...a });
const S1_F = (a) => S1_K({ sortArt: 'fragen', listen: [], ...a });
const S1_V = (a) => S1_K({ sortArt: 'vorher', listen: [[]], ...a });
const S1_ARCHIV = (a) => S1_F({ ortInfo: S1_PLANSAAL, sprecher: ['🦉', 'Archivarin Eulalia'], ortIco: '🗺️', ortName: 'Plansaal', ...a });

// eigenes Escapen: esc() aus ui.js gibt es beim Laden dieser Datei noch nicht
const S1_esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const S1_bild = (html) => `<div class="werkbild dsbild kbild">${html}</div>`;
const S1_code = (src) => `<pre class="mono dscode">${S1_esc(src)}</pre>`;
const S1_tab = (kopf, zeilen) => `<div class="dbtab"><div class="dbscroll"><table><tr>${kopf.map((k) => `<th>${k}</th>`).join('')}</tr>
  ${zeilen.map((z) => `<tr>${z.map((x) => `<td>${S1_esc(String(x))}</td>`).join('')}</tr>`).join('')}</table></div></div>`;
// Tabelle mit sichtbarem Namen darüber
const S1_titelTab = (name, kopf, zeilen) => `<div><div style="font-weight:700;margin:2px 0">📄 ${name}</div>${S1_tab(kopf, zeilen)}</div>`;
// letzte Ausgabe von print als Zahl
const S1_aus = (l) => Number(String((l?.aus || []).slice(-1)[0] ?? '').trim());

// --- Belegungstabellen (JS-Spur der festen Programme; die Antworten zu print kommen aus dem echten Lauf) ---
function S1_spurVerdoppeln() {
  let zahl = 1, schritte = 0;
  const z = [['Start', zahl, schritte]];
  while (zahl < 20) { zahl *= 2; schritte += 1; z.push([`Durchlauf ${schritte}`, zahl, schritte]); }
  return z;
}
function S1_spurCountdown() {
  let zeit = 10, n = 0;
  const z = [['Start', zeit, '']];
  while (zeit > 0) { const aus = zeit; zeit -= 3; n++; z.push([`Durchlauf ${n}`, zeit, aus]); }
  return z;
}
function S1_spurGeld() {
  let geld = 0, woche = 1;
  const z = [['Start', geld, woche]];
  while (woche <= 5) { geld += 10; if (woche === 3) geld -= 15; woche += 1; z.push([`Durchlauf ${woche - 1}`, geld, woche]); }
  return z;
}
// vor dem Lauf: nur die Startzeile und eine Zeile „…“ (wie viele Durchläufe es sind, bleibt offen); nach dem Lauf: die ganze Tabelle
const S1_beleg = (kopf, spur, hinweis) => (lauf) => ({ html: S1_bild(`${S1_tab(kopf, lauf ? spur : [spur[0], ['…', ...spur[0].slice(1).map(() => '?')]])}
  <p class="hinweis">${lauf ? '✅ So sieht die fertige Belegungstabelle aus.' : hinweis}</p>`) });

// --- Bilder für Burg 7: Objektkarte, Klassenkarte, Ampel ---
// Klassennamen in Großbuchstaben wie im OPAL-Kurs (Klasse RECHTECK, Objekt re0)
const S1_KLASSE = uml('BAUER', ['x', 'y', 'richtung', 'korb'], ['forward()', 'turn_right()', 'turn_left()', 'harvest()']);
const S1_OBJEKT = objKarte('bauer', 'BAUER', { x: 0, y: 0, richtung: '"Osten"', korb: 0 });
const S1_karten = (...teile) => S1_bild(`<div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:flex-start">${teile.map((t) => `<div>${t}</div>`).join('')}</div>`);

// --- Bilder für Burg 9 ---
const S1_MONSTER6 = ARCHIV_MONSTER.slice(0, 6);
const S1_ERNTE8 = ARCHIV_ERNTE.slice(0, 8);
const S1_bauernName = (id) => ARCHIV_BAUERN.find((b) => b[0] === id)[1];
function S1_er() {
  const ell = (x, y, t, unter = false) => `<ellipse cx="${x}" cy="${y}" rx="34" ry="15" fill="#fdf8e8" stroke="#3a2c10" stroke-width="1.5"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="12" ${unter ? 'text-decoration="underline"' : ''} fill="#1a1408">${t}</text>`;
  const lin = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3a2c10" stroke-width="1.5"/>`;
  const ent = (x, t) => `<rect x="${x - 45}" y="90" width="90" height="36" fill="#e9d2a8" stroke="#3a2c10" stroke-width="2"/><text x="${x}" y="113" text-anchor="middle" font-size="14" font-weight="700" fill="#1a1408">${t}</text>`;
  return `<svg class="dssvg" viewBox="0 0 440 215" style="max-width:520px">
    ${lin(85, 90, 45, 40)}${lin(85, 90, 125, 40)}${lin(85, 126, 85, 175)}${lin(355, 90, 315, 40)}${lin(355, 90, 395, 40)}${lin(355, 126, 355, 175)}
    ${lin(130, 108, 175, 108)}${lin(265, 108, 310, 108)}
    ${ell(45, 32, 'id', true)}${ell(125, 32, 'name')}${ell(85, 190, 'dorf')}${ell(315, 32, 'frucht')}${ell(395, 32, 'menge')}${ell(355, 190, 'woche')}
    ${ent(85, 'Bauer')}${ent(355, 'Ernte')}
    <polygon points="220,80 265,108 220,136 175,108" fill="#cfe0f0" stroke="#3a2c10" stroke-width="2"/><text x="220" y="112" text-anchor="middle" font-size="11" font-weight="700" fill="#1a1408">bringt ein</text>
    <text x="150" y="100" text-anchor="middle" font-size="14" font-weight="700" fill="#2c3d78">1</text><text x="290" y="100" text-anchor="middle" font-size="14" font-weight="700" fill="#2c3d78">n</text></svg>`;
}
const S1_TEILNAHME = [[1, 1], [1, 3], [2, 2], [3, 1], [3, 2], [3, 3], [4, 3]];
const S1_SCHUELER = [[1, 'Mia'], [2, 'Ben'], [3, 'Lea'], [4, 'Tom']];
const S1_AG = [[1, 'Theater'], [2, 'Robotik'], [3, 'Chor']];

HOEFE.push(
  // ============================== Burg 7 · Kapitel 140: 📋 Was ist ein Algorithmus? ==============================
  S1_F({ id: 'la1', kapitel: 140, ico: '📋', titel: 'Ein guter Plan', lohn: 20,
    ziel: 'Was macht einen guten Plan aus? Beantworte die Fragen.',
    story: 'Hallo, ich bin Lina, die Lehrerin in der Dorfschule! Dein Bauer macht genau das, was du sagst – nicht mehr und nicht weniger. Darum muss jeder Plan sehr genau sein. So einen genauen Plan nennt man Algorithmus.',
    merke: { titel: '📋 Algorithmus', text: 'Ein Algorithmus ist eine Handlungsvorschrift, die eine Aufgabe löst. Er ist eindeutig (jeder Schritt ist klar), ausführbar (jeder Schritt ist machbar) und endlich (er hört irgendwann auf).' },
    fragen: [W('Welche Anweisung ist NICHT eindeutig?', ['Geh 3 Felder vorwärts.', 'Geh ein paar Felder vor.', 'Dreh dich einmal nach rechts.', 'Ernte die Rübe vor dir.'], 1),
      W('Welche Anweisung ist NICHT ausführbar?', ['Heb den Ziegel vor dir auf.', 'Geh einen Schritt vor.', 'Spring über die Mauer.', 'Gieß den Setzling.'], 2),
      W('Welche Vorschrift ist NICHT endlich?', ['Ernte 5 Rüben.', 'Dreh dich zweimal nach links.', 'Geh immer weiter.', 'Geh 4 Felder vor, dann stopp.'], 2),
      W('„Male ein schönes Bild.“ Ist das ein Algorithmus?', ['Ja, es ist eindeutig.', 'Nein, nicht eindeutig.', 'Ja, weil es kurz ist.', 'Nein, nicht ausführbar.'], 1)],
    tipps: ['Eindeutig: Jeder macht genau dasselbe. Wie viele sind „ein paar“?', 'Ausführbar: Kann der Bauer das wirklich tun?', 'Endlich: Hört der Plan irgendwann auf?'] }),
  S1_F({ id: 'la2', kapitel: 140, ico: '⏳', titel: 'Hört das je auf?', lohn: 20,
    ziel: 'Lies die Pläne genau. Welche hören auf – und was passiert?',
    fragen: [W('Plan A: „Wiederhole 4-mal: Schritt vor, Rübe ernten.“ Hört der Plan auf?', ['Ja, nach 4 Runden.', 'Nein, nie.'], 0),
      { art: 'zahl', text: 'Wie viele Befehle macht der Bauer bei Plan A insgesamt?', soll: () => 8 },
      W('Plan B: „Wiederhole 3-mal: Dreh dich nach rechts.“ Am Anfang ist der Blick nach Osten gerichtet. Wohin geht der Blick danach?', ['nach Norden', 'nach Osten', 'nach Süden', 'nach Westen'], 0),
      W('Plan C: „Wiederhole immer wieder: Dreh dich nach rechts.“ Welche Eigenschaft fehlt?', ['eindeutig', 'ausführbar', 'endlich'], 2)],
    tipps: ['Eine Runde von Plan A hat 2 Befehle.', 'Rechts von Osten ist Süden, dann Westen, dann …', 'Plan C sagt nicht, wann Schluss ist.'] }),
  hof({ id: 'la3', kapitel: 140, bloecke: true, ico: '🧭', titel: 'Der genaue Plan', lohn: 25,
    ziel: 'Lina hat aufgeschrieben: „Geh zur Rübe und ernte sie. Dann geh um die Ecke zur zweiten.“ Das ist für den Bauern nicht eindeutig. Mach daraus einen genauen Plan aus Blöcken.',
    start: O(['..r', '..r']), befehle: DREH,
    tipps: ['Zähle: Wie viele Schritte sind es bis zur ersten Rübe?', 'Die zweite Rübe liegt unter der ersten. Von dort aus ist unten rechts.', 'forward, forward, harvest, turn_right, forward, harvest'],
    loesung: 'forward()\nforward()\nharvest()\nturn_right()\nforward()\nharvest()' }),
  S1_F({ id: 'la4', kapitel: 140, knobel: true, ico: '🍝', titel: 'Algorithmen im Alltag', lohn: 35,
    ziel: 'Knifflige Pläne aus dem Alltag: Was fehlt ihnen – und wie viele Schritte braucht ein guter Plan?',
    fragen: [W('Im Rezept steht: „Salz nach Geschmack dazugeben.“ Welche Eigenschaft fehlt?', ['eindeutig – jeder salzt anders viel', 'ausführbar – Salz gibt es nicht', 'endlich – man salzt ewig', 'keine – das passt so'], 0),
      W('Spielregel mit einem normalen Würfel (1 bis 6): „Würfle so lange, bis du eine 7 hast.“ Was stimmt?', ['Gut – irgendwann klappt es.', 'Nicht endlich – eine 7 kommt nie.', 'Nicht eindeutig – welcher Würfel?', 'Nicht ausführbar – würfeln geht nicht.'], 1),
      { art: 'zahl', text: 'Vier Goldschachteln, eine Balkenwaage. Plan: Leg zwei Schachteln auf die Waage, behalte die schwerere und vergleiche sie mit der nächsten – bis keine mehr übrig ist. Wie oft wiegst du?', soll: () => 3 },
      { art: 'zahl', text: 'Und mit demselben Plan bei 10 Schachteln?', soll: () => 9 }],
    tipps: ['Eine Spielregel ist nur dann ein Algorithmus, wenn sie sicher endet.', 'Jedes Wiegen scheidet genau eine Schachtel aus. Am Ende bleibt eine übrig.', 'Bei 4 Schachteln scheiden 3 aus.'] }),

  // ============================== Burg 7 · Kapitel 141: 🃏 Der Bauer als Objekt ==============================
  S1_F({ id: 'lb1', kapitel: 141, ico: '🃏', titel: 'Klassenkarte und Objektkarte', lohn: 40,
    ansicht: 'tabelle', titelAnsicht: 'Klassenkarte und Objektkarte', tabelle: () => ({ html: S1_karten(`<div class="hinweis">Klassenkarte</div>${S1_KLASSE}`, `<div class="hinweis">Objektkarte</div>${S1_OBJEKT}`) }),
    ziel: 'Dein Bauer ist ein Objekt. Lies die beiden Karten und beantworte die Fragen.',
    story: 'Weißt du was? Dein Bauer ist ein Objekt – genau wie ein Kreis in einem Malprogramm. Links siehst du den Bauplan, die Klassenkarte. Rechts steht, wie dein Bauer gerade ist: die Objektkarte.',
    merke: { titel: '🃏 Klasse und Objekt', text: 'Eine Klasse ist der Bauplan (BAUER), ein Objekt ist ein echtes Exemplar nach diesem Plan (bauer). Attribute wie richtung haben Attributwerte wie "Osten". Methoden wie forward() verändern die Attributwerte.' },
    fragen: [W('Was ist hier die Klasse?', ['bauer', 'BAUER', 'korb', 'forward()'], 1),
      W('Was ist ein Attribut?', ['forward()', 'richtung', 'BAUER', '"Osten"'], 1),
      { art: 'zahl', text: 'Welchen Attributwert hat korb?', soll: () => 0 },
      W('Was ist eine Methode?', ['x', 'turn_left()', '0', 'BAUER'], 1),
      W('Was steht ganz oben auf der Objektkarte?', ['Objektname : Klasse', 'nur die Methoden', 'der Attributwert', 'gar nichts'], 0)],
    tipps: ['Die Klassenkarte hat ganz oben den Namen der Klasse.', 'Methoden erkennst du an den runden Klammern ().', 'Attribute stehen in der Mitte, Methoden unten.'] }),
  S1_F({ id: 'lb2', kapitel: 141, ico: '•', titel: 'Die Punktnotation', lohn: 40,
    ansicht: 'tabelle', titelAnsicht: 'Objektkarte vorher', tabelle: () => ({ html: S1_karten(S1_OBJEKT, S1_KLASSE) }),
    ziel: 'Gib dem Objekt Aufträge mit der Punktnotation – und sag voraus, was sich ändert.',
    merke: { titel: '• Punktnotation', text: 'Mit der Punktnotation führst du eine Methode an einem Objekt aus: erst der Objektname, dann ein Punkt, dann die Methode. In deinen Blöcken steht die Methode allein – gemeint ist immer dein Bauer.', code: 'objektname.methode()\ndach.fuellfarbeSetzen(rot)' },
    fragen: [W('Der Bauer soll sich nach links drehen. Welche Zeile ist richtig?', ['bauer.turn_left()', 'turn_left.bauer()', 'BAUER turn_left', 'bauer(turn_left)'], 0),
      { art: 'zahl', text: 'Der Bauer bekommt dreimal bauer.forward(). Welchen Wert hat x danach? (Am Anfang ist x = 0, Blick nach Osten.)', soll: () => 3 },
      W('Danach kommt bauer.turn_right(). Welches Attribut ändert sich?', ['x', 'korb', 'richtung', 'gar keins'], 2),
      W('Welchen Wert hat richtung nach bauer.turn_right()? (vorher "Osten")', ['"Norden"', '"Osten"', '"Süden"', '"Westen"'], 2),
      { art: 'zahl', text: 'bauer.forward() · bauer.harvest() · bauer.forward() · bauer.harvest() – auf beiden Feldern liegt eine Rübe. Welchen Wert hat korb danach? (vorher 0)', soll: () => 2 }],
    tipps: ['Erst das Objekt, dann ein Punkt, dann die Methode mit Klammern.', 'Drehen ändert nicht, wo der Bauer steht – nur die Blickrichtung.', 'Rechts von Osten ist Süden.'] }),
  S1_F({ id: 'lb3', kapitel: 141, ico: '👥', titel: 'Zwei Bauern', lohn: 45,
    ansicht: 'tabelle', titelAnsicht: 'Zwei Objekte der Klasse BAUER',
    tabelle: () => ({ html: S1_karten(objKarte('bauer1', 'BAUER', { x: 0, y: 0, richtung: '"Osten"', korb: 0 }), objKarte('bauer2', 'BAUER', { x: 3, y: 1, richtung: '"Westen"', korb: 4 }), S1_code('bauer2.forward()\nbauer2.forward()\nbauer1.harvest()')) }),
    ziel: 'Nach einem Bauplan kann es viele Objekte geben. Lies die Karten und den Code.',
    fragen: [W('bauer1 und bauer2 sind …', ['zwei Klassen', 'zwei Objekte', 'zwei Attribute', 'zwei Methoden'], 1),
      W('Was stimmt?', ['Nur bauer1 hat das Attribut korb.', 'Gleiche Attribute, eigene Werte.', 'Immer die gleichen Attributwerte.', 'Objekte haben gar keine Attribute.'], 1),
      { art: 'zahl', text: 'Der Blick von bauer2 geht nach Westen. Dann kommt zweimal bauer2.forward(). Nach Westen wird x kleiner. Welchen Wert hat x von bauer2 danach?', soll: () => 1 },
      { art: 'zahl', text: 'Welchen Wert hat x von bauer1 danach?', soll: () => 0 }],
    tipps: ['Eine Methode ändert nur das Objekt vor dem Punkt.', 'bauer2: x = 3, zwei Schritte nach Westen.'] }),
  S1_F({ id: 'lb4', kapitel: 141, knobel: true, ico: '🚦', titel: 'Die Ampel am Burgtor', lohn: 55,
    ansicht: 'tabelle', titelAnsicht: 'Objekt ampel', tabelle: () => ({ html: S1_karten(uml('AMPEL', ['farbe'], ['weiter()']), objKarte('ampel', 'AMPEL', { farbe: '"rot"' })) }),
    ziel: 'Auch eine Ampel ist ein Objekt. Ihr Attribut farbe hat immer einen von vier Werten: gelb, grün, rotgelb oder rot. Baue ihr Zustandsdiagramm.',
    merke: { titel: '🚦 Zustandsdiagramm', text: 'Ein Zustandsdiagramm zeigt alle Zustände eines Objekts und wie es von einem zum nächsten kommt. Ein Pfeil gehört zu einem Ereignis – hier w für weiter(). Der Pfeil von links zeigt den Startzustand.' },
    fragen: [W('Die Ampel ist rot. Welche Farbe kommt nach einem Mal weiter()?', ['grün', 'rotgelb', 'gelb', 'rot'], 1),
      { art: 'automat', text: 'Denk an eine echte Ampel an der Straße. Jedes w heißt: Jemand drückt einmal auf weiter. Trag für jede Farbe ein, welche danach kommt. So liest du die Tabelle: Steht in der Zeile X bei „mit w“ die Farbe Y, wird die Ampel von X zu Y. In der Spalte „Ende?“ kreuzt du die Farbe an, bei der die Autos fahren dürfen. Probier unten aus: Nach wie vielen w ist die Ampel grün?',
        zustaende: ['rot', 'gelb', 'grün', 'rotgelb'], alphabet: ['w'], ziel: (w) => w.length % 4 === 2, maxLaenge: 9, beispiel: 'ww',
        fehlerText: (w, soll) => (w.length === 0 ? 'Am Anfang ist die Ampel rot – da dürfen die Autos noch nicht fahren.'
          : `Nach ${w.length}-mal weiter sollte die Ampel ${soll ? '' : 'nicht '}grün sein – bei dir ist sie es ${soll ? 'nicht' : 'aber'}.`),
        loesung: { ende: ['grün'], delta: { rot: { w: 'rotgelb' }, rotgelb: { w: 'grün' }, 'grün': { w: 'gelb' }, gelb: { w: 'rot' } } } },
      { art: 'zahl', text: 'Die Ampel ist rot. Nach wie vielen weiter() ist sie zum ersten Mal wieder rot?', soll: () => 4 }],
    tipps: ['Jede Zeile der Tabelle ist ein Zustand. In der Spalte „mit w“ wählst du den nächsten.', 'Bevor eine Ampel grün wird, leuchten Rot und Gelb zusammen. Bevor sie rot wird, leuchtet nur Gelb.', 'Nur bei grün dürfen die Autos fahren – nur grün bekommt das Häkchen bei „Ende?“.'] }),

  // ============================== Burg 8 · Kapitel 142: 🧾 Belegungstabelle ==============================
  S1_V({ id: 'lc1', kapitel: 142, ico: '🧾', titel: 'Verdoppeln', lohn: 55,
    ziel: 'Verfolge die Variablen Schritt für Schritt – wie in einer Belegungstabelle. Sag voraus, was passiert.',
    story: 'Hallo, ich bin Lina aus der Dorfschule! Wenn ein Programm etwas Seltsames tut, hilft nur eins: Schritt für Schritt aufschreiben, was in jeder Variable steht. Das ist eine Belegungstabelle.',
    merke: { titel: '🧾 Belegungstabelle', text: 'In einer Belegungstabelle schreibst du nach jedem Schritt auf, welchen Wert jede Variable hat. Jede Spalte ist eine Variable, jede Zeile ein Schritt. So siehst du genau, was dein Programm tut.' },
    code: 'zahl = 1\nschritte = 0\nwhile zahl < 20:\n    zahl = zahl * 2\n    schritte += 1\nprint(zahl)',
    ansicht: 'tabelle', titelAnsicht: 'Belegungstabelle',
    tabelle: S1_beleg(['Schritt', 'zahl', 'schritte'], S1_spurVerdoppeln(), 'Füll die Tabelle im Kopf (oder auf Papier) aus.'),
    fragen: [{ art: 'liste', text: 'Welche Werte hat zahl nacheinander? (mit dem Startwert, durch Leerzeichen getrennt)', soll: () => S1_spurVerdoppeln().map((z) => z[1]) },
      { art: 'zahl', text: 'Wie oft läuft die Schleife?', soll: () => S1_spurVerdoppeln().length - 1 },
      { art: 'zahl', text: 'Was gibt print(zahl) aus?', soll: (l) => S1_aus(l) }],
    tipps: ['Die Schleife fragt vor jedem Durchlauf: Ist zahl noch kleiner als 20?', '1, 2, 4, 8, 16 – und 16 ist noch kleiner als 20!'] }),
  S1_V({ id: 'lc2', kapitel: 142, ico: '⏱️', titel: 'Der Countdown', lohn: 55,
    ziel: 'Ein Countdown in Dreierschritten. Sag voraus, was er ausgibt.',
    code: 'zeit = 10\nwhile zeit > 0:\n    print(zeit)\n    zeit = zeit - 3\nprint("Los!")',
    ansicht: 'tabelle', titelAnsicht: 'Belegungstabelle',
    tabelle: S1_beleg(['Schritt', 'zeit (danach)', 'Ausgabe'], S1_spurCountdown(), 'Achtung: print kommt vor dem Abziehen.'),
    fragen: [{ art: 'liste', text: 'Welche Zahlen gibt das Programm aus, bevor „Los!“ kommt?', soll: () => S1_spurCountdown().slice(1).map((z) => z[2]) },
      { art: 'zahl', text: 'Welchen Wert hat zeit ganz am Ende?', soll: () => S1_spurCountdown().slice(-1)[0][1] },
      W('Was passiert, wenn die Zeile zeit = zeit - 3 fehlt?', ['Sofort „Los!“ – die Schleife wird übersprungen', 'Endlosschleife – zeit bleibt immer 10', 'Nur einmal 10 – danach ist Schluss', 'Wie vorher – Python zählt selbst herunter'], 1)],
    tipps: ['10 – 3 = 7, dann 4, dann 1 …', 'Nach 1 kommt 1 – 3. Ist das noch größer als 0?'] }),
  S1_V({ id: 'lc3', kapitel: 142, ico: '🪙', titel: 'Das Taschengeld', lohn: 60,
    ziel: 'Hier steckt ein if in der Schleife. Verfolge geld und woche genau.',
    code: 'geld = 0\nwoche = 1\nwhile woche <= 5:\n    geld = geld + 10\n    if woche == 3:\n        geld = geld - 15\n    woche = woche + 1\nprint(geld)',
    ansicht: 'tabelle', titelAnsicht: 'Belegungstabelle',
    tabelle: S1_beleg(['Schritt', 'geld', 'woche'], S1_spurGeld(), 'In Woche 3 kauft das Kind ein Buch für 15 🪙.'),
    fragen: [{ art: 'liste', text: 'Welchen Wert hat geld nach jedem Durchlauf? (5 Zahlen)', soll: () => S1_spurGeld().slice(1).map((z) => z[1]) },
      { art: 'zahl', text: 'Welchen Wert hat woche am Ende?', soll: () => S1_spurGeld().slice(-1)[0][2] },
      { art: 'zahl', text: 'Was gibt print(geld) aus?', soll: (l) => S1_aus(l) }],
    tipps: ['Jede Woche kommen 10 dazu. Nur in Woche 3 gehen 15 weg.', 'Die Schleife läuft, solange woche höchstens 5 ist – danach ist woche schon eins größer.'] }),
  S1_F({ id: 'lc4', kapitel: 142, knobel: true, ico: '♾️', titel: 'Hört die Schleife auf?', lohn: 70,
    ziel: 'Erst zwei Fragen zu den Schleifenarten. Dann kommen drei Schleifen A, B und C – nicht alle hören auf. Verfolge n im Kopf.',
    merke: { titel: '♾️ Schleifenarten', text: 'Eine kopfgesteuerte Schleife prüft die Bedingung vor jedem Durchlauf – wie while in Python. Eine fußgesteuerte Schleife prüft erst danach, sie läuft also mindestens einmal. Wird die Abbruchbedingung nie erreicht, entsteht eine Endlosschleife.' },
    fragen: [W('while prüft die Bedingung vor jedem Durchlauf. Das ist eine …', ['kopfgesteuerte Schleife', 'fußgesteuerte Schleife', 'Zählschleife', 'Verzweigung'], 0),
      W('Welche Schleife läuft immer mindestens einmal?', ['die kopfgesteuerte', 'die fußgesteuerte', 'keine'], 1),{ ...W('Hört Schleife A auf?', ['ja', 'nein, nie'], 0), html: S1_code('n = 1\nwhile n < 10:\n    n = n + 2') },
      { art: 'zahl', text: 'Welchen Wert hat n am Ende von Schleife A?', soll: () => 11, html: S1_code('n = 1\nwhile n < 10:\n    n = n + 2') },
      { ...W('Hört Schleife B auf?', ['ja', 'nein, nie – n wird immer größer, bleibt also über 0'], 1), html: S1_code('n = 10\nwhile n > 0:\n    n = n + 1') },
      { ...W('Hört Schleife C auf?', ['ja, bei n = 5', 'nein, nie – n ist 0, 2, 4, 6 … und springt über die 5'], 1), html: S1_code('n = 0\nwhile n != 5:\n    n = n + 2') }],
    tipps: ['Kopf = oben, Fuß = unten: Wo wird die Bedingung geprüft?', 'Schreib dir eine kleine Belegungstabelle: n nach jedem Durchlauf.', '!= heißt „ungleich“.'] }),


  // ============================== Burg 9 · Kapitel 144: 🗺️ Baupläne des Archivs ==============================
  S1_ARCHIV({ id: 'le1', kapitel: 144, ico: '📋', titel: 'Begriffe an der Tabelle', lohn: 40,
    ansicht: 'tabelle', titelAnsicht: 'Tabelle monster',
    tabelle: () => ({ html: S1_bild(S1_tab(['name', 'art', 'leben', 'tempo'], S1_MONSTER6.map((m) => [m[0], m[1], m[2], String(m[3]).replace('.', ',')]))) }),
    ziel: 'Bevor du die erste Abfrage schreibst: die Fachwörter. Beantworte die Fragen zur Tabelle.',
    story: 'Willkommen im Plansaal! Hier liegen die Baupläne meines Archivs. Wer im Archiv suchen will, muss erst wissen, wie eine Tabelle gebaut ist – und wie man darüber spricht.',
    merke: { titel: '📋 Tabelle (Relation)', text: 'Ein Datenbanksystem besteht aus der Datenbasis und dem Datenbankmanagementsystem (DBMS). In einer Tabelle (Relation) heißt eine Spalte Attribut und eine Zeile Datensatz. Ein einzelner Eintrag in einer Zelle ist ein Datenwert.' },
    fragen: [W('Wie heißt eine Spalte, z. B. „leben“?', ['Datensatz', 'Attribut', 'Datenwert', 'Tabelle'], 1),
      W('Wie heißt eine ganze Zeile, z. B. alles über Glibber?', ['Datensatz', 'Attribut', 'Datentyp', 'Schlüssel'], 0),
      W('„schleim“ in der Zeile von Glibber ist ein …', ['Attribut', 'Datensatz', 'Datenwert', 'Primärschlüssel'], 2),
      W('Ein Datenbanksystem besteht aus …', ['Datenbasis und Datenbankmanagementsystem (DBMS)', 'nur einer einzigen großen Tabelle mit allen Daten', 'Tastatur, Bildschirm und einem schnellen Rechner', 'Attributen, Methoden und einem Bauplan (Klasse)'], 0),
      { art: 'zahl', text: 'Wie viele Datensätze zeigt die Tabelle?', soll: () => S1_MONSTER6.length },
      { art: 'zahl', text: 'Wie viele Attribute zeigt die Tabelle?', soll: () => 4 }],
    tipps: ['Attribut = Spalte (Eigenschaft), Datensatz = Zeile (ein Monster).', 'Die Kopfzeile zählt nicht als Datensatz.'] }),
  S1_ARCHIV({ id: 'le2', kapitel: 144, ico: '🔑', titel: 'Schlüssel und Datentypen', lohn: 40,
    ansicht: 'tabelle', titelAnsicht: 'Tabelle bauern',
    tabelle: () => ({ html: S1_bild(S1_tab(['id', 'name', 'dorf', 'jahre'], ARCHIV_BAUERN)) }),
    ziel: 'Welches Attribut kennzeichnet jeden Bauern eindeutig? Und was für Werte stehen in den Spalten?',
    merke: { titel: '🔑 Primärschlüssel und Datentypen', text: 'Der Primärschlüssel kennzeichnet jeden Datensatz eindeutig – kein Wert darf doppelt vorkommen. Man unterstreicht ihn. Jedes Attribut hat einen Datentyp, z. B. integer (ganze Zahl), varchar (Text) oder boolean (wahr/falsch).' },
    fragen: [W('Welches Attribut ist der Primärschlüssel?', ['name', 'dorf', 'id', 'jahre'], 2),
      W('Warum taugt dorf nicht als Primärschlüssel?', ['Doppelte Werte – Lindenhain steht mehrmals da', 'Zu lang – Dorfnamen haben viele Buchstaben', 'Text – Text darf nie Schlüssel sein', 'Es taugt doch – jedes Dorf ist anders'], 0),
      W('Hier kommt auch jeder name nur einmal vor. Warum nimmt man trotzdem id?', ['Zufall – name ginge genauso gut', 'Kürzer – eine Zahl spart Platz', 'Gleiche Namen – bald gibt es zwei Annas', 'Sortieren – Zahlen lassen sich besser ordnen'], 2),
      W('Welchen Datentyp hat jahre?', ['integer', 'varchar', 'boolean'], 0),
      W('Welchen Datentyp hat name?', ['integer', 'varchar', 'boolean'], 1),
      W('Ein neues Attribut hat_esel (ja oder nein) bekommt den Datentyp …', ['integer', 'varchar', 'boolean'], 2)],
    tipps: ['Eindeutig heißt: Jeder Wert kommt höchstens einmal vor.', 'Zahl – Text – wahr/falsch.'] }),
  S1_ARCHIV({ id: 'le3', kapitel: 144, ico: '🗺️', titel: 'Das ER-Modell', lohn: 45,
    ansicht: 'tabelle', titelAnsicht: 'ER-Modell', tabelle: () => ({ html: S1_bild(S1_er()) }),
    ziel: 'So sieht der Bauplan für Bauern und Ernte aus. Lies das ER-Modell.',
    merke: { titel: '🗺️ ER-Modell und Kardinalität', text: 'Im ER-Modell (ERM) sind Entitäten Rechtecke, Attribute Ellipsen (der Primärschlüssel unterstrichen) und Beziehungen Rauten. Die Kardinalität sagt, wie viele beteiligt sind: 1:1, 1:n oder n:m.' },
    fragen: [W('Was ist „Bauer“ im Bild?', ['eine Entität', 'ein Attribut', 'eine Beziehung', 'ein Datenwert'], 0),
      W('Was ist die Raute „bringt ein“?', ['ein Attribut', 'eine Beziehung', 'eine Entität', 'ein Primärschlüssel'], 1),
      W('Bei Bauer steht 1, bei Ernte n. Das heißt:', ['1 Bauer → viele Ernten, 1 Ernte → 1 Bauer', '1 Bauer → 1 Ernte, 1 Ernte → 1 Bauer', '1 Bauer → 1 Ernte, 1 Ernte → viele Bauern', 'viele Bauern → viele Ernten, beliebig'], 0),
      W('Jede Burg hat genau ein Haupttor, jedes Haupttor gehört zu genau einer Burg. Kardinalität?', ['1:1', '1:n', 'n:m'], 0),
      W('Ein Kind kann in mehreren AGs sein, eine AG hat viele Kinder. Kardinalität?', ['1:1', '1:n', 'n:m'], 2)],
    tipps: ['Rechteck = Ding, Ellipse = Eigenschaft, Raute = Beziehung.', 'Frag von beiden Seiten: Wie viele … hat ein …?'] }),
  S1_ARCHIV({ id: 'le4', kapitel: 144, ico: '🔗', titel: 'Der Fremdschlüssel', lohn: 50,
    ansicht: 'tabelle', titelAnsicht: 'Tabellen bauern und ernte',
    tabelle: () => ({ html: S1_bild(`<div style="display:flex;flex-wrap:wrap;gap:12px">${S1_titelTab('bauern', ['<u>id</u>', 'name'], ARCHIV_BAUERN.map((b) => [b[0], b[1]]))}${S1_titelTab('ernte', ['bauer_id', 'frucht', 'menge'], S1_ERNTE8.map((e) => [e[0], e[1], e[2]]))}</div>`) }),
    ziel: 'In der Tabelle ernte steht nicht der Name des Bauern, sondern nur eine Nummer. Finde heraus, wie die Tabellen zusammenhängen.',
    merke: { titel: '🔗 Fremdschlüssel', text: 'Ein Fremdschlüssel ist ein Attribut, das auf den Primärschlüssel einer anderen Tabelle zeigt. Bei einer 1:n-Beziehung steht er in der Tabelle auf der n-Seite: In ernte steht bauer_id – die id eines Bauern aus bauern.' },
    fragen: [W('Welches Attribut ist der Fremdschlüssel?', ['frucht', 'menge', 'bauer_id', 'name'], 2),
      W('Wer hat die 20 Rüben geerntet?', ARCHIV_BAUERN.slice(0, 4).map((b) => b[1]), ARCHIV_BAUERN.slice(0, 4).findIndex((b) => b[0] === S1_ERNTE8.find((e) => e[2] === 20)[0])),
      { art: 'zahl', text: `Wie viele Einträge in ernte gehören zu ${S1_bauernName(1)}?`, soll: () => S1_ERNTE8.filter((e) => e[0] === 1).length },
      W('In welche Tabelle kommt der Fremdschlüssel bei einer 1:n-Beziehung?', ['n-Seite – zu den vielen Einträgen', '1-Seite – zu dem einen Eintrag', 'beide – doppelt hält besser', 'keine – er steht extra'], 0)],
    tipps: ['bauer_id = 2 heißt: Schau in bauern nach der Zeile mit id 2.', 'Ein Bauer – viele Ernten: Jede Ernte merkt sich ihren Bauern.'] }),
  S1_ARCHIV({ id: 'le5', kapitel: 144, knobel: true, ico: '🕸️', titel: 'Viele zu viele', lohn: 60,
    ansicht: 'tabelle', titelAnsicht: 'Kinder und AGs',
    tabelle: () => ({ html: S1_bild(`<div style="display:flex;flex-wrap:wrap;gap:12px">${S1_titelTab('kind', ['<u>id</u>', 'name'], S1_SCHUELER)}${S1_titelTab('ag', ['<u>id</u>', 'ag'], S1_AG)}${S1_titelTab('teilnahme', ['kind_id', 'ag_id'], S1_TEILNAHME)}</div>`) }),
    ziel: 'Eine n:m-Beziehung passt nicht in zwei Tabellen. Schau dir an, wie man sie baut.',
    fragen: [{ ...W('Wie setzt man eine n:m-Beziehung in Tabellen um?', ['eine eigene Tabelle mit zwei Fremdschlüsseln', 'eine Spalte ag_id als Fremdschlüssel in kind', 'alle AGs als Liste in eine einzige Zelle', 'gar nicht, n:m lässt sich nie speichern'], 0),
        erklaerung: 'Eine Zwischentabelle (hier teilnahme) mit je einem Fremdschlüssel auf kind und auf ag – jede Zeile ist eine Teilnahme.' },
      { art: 'zahl', text: 'Wie viele Tabellen braucht man für Kinder, AGs und ihre n:m-Beziehung?', soll: () => 3 },
      { art: 'zahl', text: `In wie vielen AGs ist ${S1_SCHUELER[0][1]}?`, soll: () => S1_TEILNAHME.filter((t) => t[0] === 1).length },
      { art: 'zahl', text: `Wie viele Kinder sind im ${S1_AG[2][1]}?`, soll: () => S1_TEILNAHME.filter((t) => t[1] === 3).length },
      W('Was ist der Primärschlüssel von teilnahme?', ['kind_id allein, es steht ja vorn', 'ag_id allein, sie nennt die AG', 'kind_id und ag_id zusammen', 'keiner, teilnahme braucht keinen'], 2)],
    tipps: ['Jede Zeile in teilnahme sagt: Dieses Kind ist in dieser AG.', 'Mia hat die id 1, der Chor die id 3.'] }),
);

// --- 📓 Heft ---
HEFT_EXTRA[140] = { titel: 'Was ist ein Algorithmus?', text: ['Ein Algorithmus ist eine Handlungsvorschrift, die eine Aufgabe löst.', 'Er ist eindeutig (jeder Schritt ist klar), ausführbar (jeder Schritt ist machbar) und endlich (er hört irgendwann auf).', '„Geh ein paar Schritte“ ist nicht eindeutig, „Geh immer weiter“ ist nicht endlich.'] };
HEFT_EXTRA[141] = { titel: 'Klasse, Objekt, Attribut, Methode', text: ['Eine Klasse ist der Bauplan (BAUER), ein Objekt ein Exemplar danach (bauer).', 'Attribute wie richtung haben Attributwerte wie "Osten"; Methoden wie forward() verändern sie.', 'Punktnotation: objekt.methode() – ein Zustandsdiagramm zeigt, wie ein Objekt seinen Zustand wechselt.'], code: 'bauer.forward()\nbauer.turn_right()' };
HEFT_EXTRA[142] = { titel: 'Belegungstabelle', text: ['In einer Belegungstabelle steht nach jedem Schritt der Wert jeder Variable.', 'Jede Spalte ist eine Variable, jede Zeile ein Schritt.', 'So findest du Fehler und Endlosschleifen.'], code: 'zahl = 1\nwhile zahl < 20:\n    zahl = zahl * 2\n# zahl: 1, 2, 4, 8, 16, 32' };
HEFT_EXTRA[144] = { titel: 'Tabellen planen', text: ['Spalte = Attribut, Zeile = Datensatz, Eintrag = Datenwert. Der Primärschlüssel ist eindeutig; Datentypen z. B. integer, varchar, boolean.', 'Im ER-Modell: Entität = Rechteck, Attribut = Ellipse, Beziehung = Raute; Kardinalitäten 1:1, 1:n, n:m.', 'Ein Fremdschlüssel zeigt auf den Primärschlüssel einer anderen Tabelle. n:m braucht eine eigene Tabelle.'] };
