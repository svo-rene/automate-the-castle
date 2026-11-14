'use strict';
// --- 🗼 Burg 10: Klasse 10 (Sek I) – streng nach Lehrplan Gymnasium Sachsen 2022 (Kl. 10: LB 1 Algorithmen, LB 2 Sprachen),
// Stoffverteilungsplan svp_10 und dem OPAL-Kurs „Informatik Klasse 10 – GDP“ (Ordner lb1_algorithmen, lb2_sprachen).
// Kapitel → Quelle:
//   110 Datentypen und Verzweigungen  – svp SW 3–4, Kurs 3_2_datentypen, 2_2_Vezweigung (Notenrechner, Pacman-Bereiche)
//   111 Fehler finden                 – svp SW 2, 5, 6, Kurs 3_6_variablenbeleg (Fibonacci-Belegung, Debugging), 2_3_Schleifen (range, Zahlenraten)
//   112 Unterprogramme                – svp SW 9–10, Kurs 2_4_Unterprogramme (def, Parameter, return, DRY, lokal/global, Module), lokale_globale_Variablen.py
//   113 Listen                        – svp SW 11 (Notenliste), Kurs 3_7_arrays (Index ab 0, append, insert, del, for … in, Listen in Funktionen)
//   114 Maschinelle Entscheidungen    – svp SW 16, Kurs 5_1_clustering (Drohnen-Startup, Clustering, Kategorisierung, k-Means)
//   115 Formale Sprachen und Automaten – svp SW 18–21, Kurs sprachen_formalisier, endliche_sprachen, regulaere_ausdruecke, anwendung_regex, endlicheAutomaten
// Gemischt: Acker-Höfe mit dem Bauern (def und Listen auf dem Acker) und Aufträge im 🗼 Gelehrtenturm (Kornspeicher-Ablauf).

KAPITEL[110] = { name: 'Datentypen und Verzweigungen', ico: '🐍' };
KAPITEL[111] = { name: 'Fehler finden', ico: '🐞' };
KAPITEL[112] = { name: 'Unterprogramme mit def', ico: '🧰' };
KAPITEL[113] = { name: 'Listen', ico: '📋' };
KAPITEL[114] = { name: 'Maschinelle Entscheidungen', ico: '🚁' };
KAPITEL[115] = { name: 'Formale Sprachen und Automaten', ico: '🔣' };
BURGEN[10] = { name: 'Burg 10', ico: '🗼', klasse: 10, region: 'signal', kapitel: [110, 111, 112, 113, 114, 115],
  text: 'Python wie in Klasse 10: Datentypen und verknüpfte Bedingungen, Fehler finden, Unterprogramme, Listen, maschinelle Entscheidungen – dazu formale Sprachen, reguläre Ausdrücke und endliche Automaten.' };

// --- Ort auf der Karte: der Gelehrtenturm (Sandstein, blaues Spitzdach, Bücherstapel) ---
function B10_svgTurm(fertig) {
  return `<ellipse cx="0" cy="32" rx="38" ry="8" fill="rgba(0,0,0,.25)"/>
    <rect x="-16" y="-24" width="32" height="56" fill="#c9b48a" stroke="#6a5a3a" stroke-width="2"/>
    ${[-10, 0, 10].map((y) => `<line x1="-16" y1="${y}" x2="16" y2="${y}" stroke="#a8946a" stroke-width="1"/>`).join('')}
    <polygon points="-22,-24 0,-54 22,-24" fill="${fertig ? '#c9a030' : '#3a5a8a'}" stroke="#23304a" stroke-width="2"/>
    <rect x="-5" y="-16" width="10" height="12" rx="5" fill="${fertig ? '#ffe27a' : '#2b2f3d'}"/>
    <path d="M-7,32 v-12 a7,7 0 0 1 14,0 v12 z" fill="#3e2410"/>
    <rect x="20" y="24" width="18" height="5" fill="#8a3a2a"/><rect x="22" y="19" width="15" height="5" fill="#2a5a8a"/><rect x="21" y="14" width="16" height="5" fill="#3a7a3a"/>
    <text x="-38" y="6" style="font-size:13px">🐍</text>`;
}
const B10_ORT = { ort: 'Turm', im: 'im Gelehrtenturm', ico: '🗼', haupt: '🗼 In den Gelehrtenturm', sub: 'Tippe einen Gelehrtenturm an, um seine Aufträge zu sehen.', svg: B10_svgTurm };
// Klasse 10: eigene, engere Sprache (nicht S_LK – sonst gingen set, zip, Comprehensions … und Fertiges wie sum/sorted; Nutzerwunsch 2026-11-13)
const B10_S = ['for', 'while', 'if', 'else', 'elif', 'var', 'def', 'vergleich', 'methoden', 'del'];
// Aufträge im Turm (Kornspeicher-Ablauf): Funktion schreiben, Code vorhersagen oder Fragen
const B10_K = (a) => KORN({ warte: true, zielArt: 'wert', funktion: null, sprache: B10_S, ortInfo: B10_ORT, sprecher: ['👩‍🏫', 'Gelehrte Ilse'],
  ortIco: '🗼', ortName: 'Gelehrtenturm', ...a });
const B10_FR = (a) => B10_K({ sortArt: 'fragen', listen: [], ...a });
const B10_VH = (a) => B10_K({ sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', listen: [[]], ...a });
// Vorhersage ohne def (Kapitel vor den Unterprogrammen): Code mit print, läuft über kornOhneFunktion; links erscheint danach die Ausgabe
const B10_VO = (a) => B10_K({ sortArt: 'vorher', listen: [[]], ansicht: 'tabelle', titelAnsicht: 'Ausgabe', tabelle: B10_ausgabe(), ...a });
// Funktionstests: aufrufe = Python-Ausdrücke, soll = richtige Ergebnisse, namen = Testnamen
const B10_T = (aufrufe, soll, namen) => ({ listen: aufrufe.map(() => []), aufrufFn: (l, k) => aufrufe[k], soll: (l, k) => soll[k], testName: (k) => namen[k] });
const B10_esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const B10_bild = (html) => () => ({ html: `<div class="werkbild dsbild kbild">${html}</div>` });
const B10_rahmen = (html) => `<div class="werkbild dsbild kbild">${html}</div>`;
// Ausgabe des Programms: vorher nur ein Hinweis, nach dem Lauf alle print-Zeilen (function: wird vor B10_VO gebraucht)
function B10_ausgabe(hinweis = 'Lies den Code und sag voraus, was print ausgibt. Hier erscheint danach die echte Ausgabe.') {
  return (lauf) => ({ html: B10_rahmen(lauf ? `<div class="dbtitel">Ausgabe</div><pre class="mono dscode">${B10_esc((lauf.aus || []).join('\n') || '(keine Ausgabe)')}</pre>`
    : `<p class="hinweis">${hinweis}</p>`) });
}
const B10_aus = (l, i) => { const a = l?.aus || []; return a[i < 0 ? a.length + i : i]; };
const B10_zahl = (l, i) => Number(String(B10_aus(l, i) ?? '').trim());
// Belegungstabelle: vor dem Lauf nur die Startzeile und ?, nach dem Lauf ganz ausgefüllt (wie plus_sek1 lc1–lc3)
const B10_tab = (kopf, zeilen) => `<div class="dbtab"><div class="dbscroll"><table><tr>${kopf.map((k) => `<th>${k}</th>`).join('')}</tr>
  ${zeilen.map((z) => `<tr>${z.map((x) => `<td>${B10_esc(String(x))}</td>`).join('')}</tr>`).join('')}</table></div></div>`;
// Vor dem Lauf nur die Startzeile und eine Zeile „…“ – wie viele Durchläufe es gibt, soll man selbst herausfinden (Didaktik-Prüfung: xb2 verriet 7 Zeilen)
const B10_beleg = (kopf, spur, hinweis) => (lauf) => ({ html: B10_rahmen(`${B10_tab(kopf, lauf ? spur : [spur[0], ['…', ...spur[0].slice(1).map(() => '?')]])}
  <p class="hinweis">${lauf ? '✅ So sieht die fertige Belegungstabelle aus.' : hinweis}</p>`) });
// k-Means wie im Code von xe4: je Runde [g1, g2, z1, z2]
function B10_kmeans() {
  const orte = [1, 2, 3, 8, 9, 11]; let z1 = 1, z2 = 2; const r = [];
  for (let i = 0; i < 3; i++) {
    const g1 = orte.filter((x) => Math.abs(x - z1) <= Math.abs(x - z2)), g2 = orte.filter((x) => Math.abs(x - z1) > Math.abs(x - z2));
    z1 = g1.reduce((s, x) => s + x, 0) / g1.length; z2 = g2.reduce((s, x) => s + x, 0) / g2.length; r.push([g1, g2, z1, z2]);
  }
  return r;
}
function B10_spurFibo() {
  let a = 1, b = 1, c = a + b, n = 0;
  const z = [['vor der Schleife', a, b, c, n]];
  while (c < 50) { a = b; b = c; c = a + b; n++; z.push([`Durchlauf ${n}`, a, b, c, n]); }
  return z;
}
// Acker: Sprachmittel der Burg 10 (Vergleiche kommen mit if/while); Listen brauchen die Punkt-Schreibweise (append)
const B10_ACKER = ['for', 'while', 'var', 'if', 'else', 'elif', 'def'];
const B10_LISTE = [...B10_ACKER, 'methoden'];

// --- Referenzen in JS (richtige Ergebnisse) ---
const B10_note = (p) => (p < 0 || p > 100 ? 0 : p >= 85 ? 1 : p >= 70 ? 2 : p >= 55 ? 3 : p >= 40 ? 4 : p >= 20 ? 5 : 6);
// jede Grenze des Notenschlüssels von beiden Seiten
const B10_NOTEN_TEST = [101, 100, 92, 85, 84, 70, 69, 55, 54, 40, 39, 20, 19, 0, -1];
const B10_pacman = (x, b) => (x < b / 3 ? 2 : x < (2 * b) / 3 ? 0 : -2);
const B10_datum = (t) => t.length === 10 && t[2] === '.' && t[5] === '.' && /^\d+$/.test(t.slice(0, 2) + t.slice(3, 5) + t.slice(6))
  && +t.slice(0, 2) >= 1 && +t.slice(0, 2) <= 31 && +t.slice(3, 5) >= 1 && +t.slice(3, 5) <= 12;
const B10_schnitt = (l) => (l.length ? l.reduce((s, x) => s + x, 0) / l.length : 0);
const B10_groesser = (l, g) => l.filter((x) => x > g).length;
const B10_start = (wind, akku, notfall) => wind < 50 && (akku >= 30 || notfall);
const B10_naechste = (d, x, y) => d.map(([a, b]) => (a - x) ** 2 + (b - y) ** 2).reduce((bi, w, i, arr) => (w < arr[bi] ? i : bi), 0);
const B10_maxReihe = (st) => Math.max(...st.t.map((z) => z.filter((c) => c === 'r').length));
// DEA aus dem Kurs: Binärzahlen, die auf mindestens zwei Nullen enden (Z0 → Z1 → ZE)
const B10_DEA2 = { Z0: { 0: 'Z1', 1: 'Z0' }, Z1: { 0: 'ZE', 1: 'Z0' }, ZE: { 0: 'ZE', 1: 'Z0' } };
const B10_lauf = (w) => { let z = 'Z0'; return [...w].map((c) => (z = B10_DEA2[z][c])); };

// Kleine Legende für reguläre Ausdrücke (Operatoren wie auf flaci.com/regexp und im Kurs „Anwendung“)
const B10_REGEX = `<div class="dbtab"><table>
  <tr><th>Muster</th><th>bedeutet</th></tr>
  <tr><td class="mono">ab</td><td>erst a, dann b</td></tr>
  <tr><td class="mono">a|b</td><td>a oder b</td></tr>
  <tr><td class="mono">a*</td><td>a beliebig oft – auch gar nicht</td></tr>
  <tr><td class="mono">a+</td><td>a mindestens einmal</td></tr>
  <tr><td class="mono">(ab)*</td><td>Klammern fassen zusammen: ab beliebig oft</td></tr>
  <tr><td class="mono">[0-9] · [a-z] · [A-Z]</td><td>eine Ziffer · ein kleiner · ein großer Buchstabe</td></tr>
  <tr><td class="mono">x{4} · x{1,3}</td><td>genau 4-mal · 1- bis 3-mal</td></tr>
  <tr><td class="mono">\\.</td><td>ein echter Punkt</td></tr></table></div>
  <p class="hinweis">Das Muster muss auf das ganze Wort passen.</p>`;

HOEFE.push(
  // --- Kapitel 110: 🐍 Datentypen und Verzweigungen (svp SW 3–4; Kurs 3_2_datentypen, 2_2_Vezweigung) ---
  B10_FR({ id: 'xa1', kapitel: 110, ico: '🏷️', titel: 'Einfache Datentypen', lohn: 55,
    ziel: 'Jeder Wert in Python hat einen Datentyp. Ordne zu!',
    story: 'Willkommen im Gelehrtenturm! Hier wird nicht geerntet, sondern nachgedacht. Bevor wir große Programme schreiben, schauen wir genau hin: Welche Arten von Werten gibt es eigentlich – und was macht Python mit ihnen?',
    merke: { titel: '🏷️ Einfache Datentypen', text: 'integer = ganze Zahl (42), float = Gleitkommazahl (34.6 – mit Punkt!), boolean = Wahrheitswert (True/False), string = Zeichenkette ("Text", immer in Anführungszeichen). Python erkennt den Typ selbst; type(x) verrät ihn, str(zahl) wandelt um (Type Casting).', code: 'zahl = 42\ntext = str(zahl)   # "42"\nprint(type(1.84))  # float' },
    fragen: [W('Welchen Datentyp hat 42?', ['integer (ganze Zahl)', 'float (Gleitkommazahl)', 'string (Zeichenkette)', 'boolean (Wahrheitswert)'], 0),
      W('Welchen Datentyp hat 34.6?', ['integer', 'float', 'string', 'boolean'], 1),
      { ...W('Welchen Datentyp hat "42"?', ['integer', 'float', 'string', 'boolean'], 2), erklaerung: 'Die Anführungszeichen machen einen Text daraus.' },
      W('Was gibt print(type(True)) in Python aus?', ['str', 'int', 'bool', 'float'], 2),
      { ...W('Welchen Datentyp hat i = "john" == "doe"?', ['boolean', 'string', 'integer', 'float'], 0), erklaerung: 'Ein Vergleich ergibt True oder False – auch wenn Texte verglichen werden, ist das Ergebnis kein Text.' },
      W('Wie schreibt man in Python die Gleitkommazahl 34,6?', ['34.6', '34,6', '"34,6"', '34 6'], 0)],
    tipps: ['Anführungszeichen machen aus allem eine Zeichenkette.', 'Vergleiche wie == ergeben immer einen Wahrheitswert.'] }),
  B10_VO({ id: 'xa2', kapitel: 110, ico: '🧮', titel: 'Rechnen mit Zahlen', lohn: 60,
    ziel: 'Lies den Code und sag voraus, was print jeweils ausgibt.',
    merke: { titel: '🧮 Operatoren', text: '/ teilt und ergibt immer einen float. // ist die ganzzahlige Division (Ergebnis int), % (Modulo) der Rest der ganzzahligen Division, ** das Potenzieren. Floats werden nicht beliebig genau gespeichert – es entstehen Rundungsfehler.', code: 'print(17 // 5)   # 3\nprint(17 % 5)    # 2\nprint(2 ** 4)    # 16' },
    code: 'a = 5\nb = 3\nprint(a + b)\nprint(a // b)\nprint(a % b)\nprint(a ** 2)\nprint(str(a) + str(b))\nprint(3 * 0.1 == 0.3)\nprint(a / b)',
    fragen: [{ art: 'zahl', text: 'Was gibt print(a // b) aus?', soll: (l) => B10_zahl(l, 1) },
      { art: 'zahl', text: 'Was gibt print(a % b) aus?', soll: (l) => B10_zahl(l, 2) },
      { art: 'zahl', text: 'Was gibt print(a ** 2) aus?', soll: (l) => B10_zahl(l, 3) },
      W('Was gibt print(str(a) + str(b)) aus?', ['53 – str macht Texte daraus, + hängt sie aneinander', '8 – das wäre a + b mit Zahlen', '35 – die Reihenfolge bleibt erhalten', 'Fehler – Texte kann man doch aneinanderhängen'], 0),
      W('Was gibt print(3 * 0.1 == 0.3) aus?', ['False – Gleitkommazahlen werden nicht beliebig genau gespeichert', 'True – mathematisch stimmt es, aber nicht im Computer'], 0),
      W('Welchen Datentyp hat das Ergebnis von a / b?', ['float – / ergibt immer eine Gleitkommazahl', 'integer – das wäre a // b', 'string – das wäre str(a / b)'], 0)],
    tipps: ['// fragt: Wie oft passt die 3 ganz in die 5?', '% fragt: Was bleibt übrig? 5 = 1 · 3 + 2.', '+ hängt Zeichenketten aneinander.'] }),
  B10_K({ id: 'xa5', kapitel: 110, sortArt: 'funktion', ico: '📝', titel: 'Der Notenrechner', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Notenschlüssel',
    tabelle: B10_bild(`<div class="dbtab"><table><tr><th>Punkte</th><th>Note</th></tr><tr><td>85–100</td><td>1</td></tr><tr><td>70–84</td><td>2</td></tr><tr><td>55–69</td><td>3</td></tr>
      <tr><td>40–54</td><td>4</td></tr><tr><td>20–39</td><td>5</td></tr><tr><td>0–19</td><td>6</td></tr><tr><td>unter 0 oder über 100</td><td>0 (ungültig)</td></tr></table></div>`),
    ziel: 'Ergänze note(punkte) mit einer Mehrfachverzweigung: Sie gibt zu den Punkten die Note nach dem Notenschlüssel zurück. Ungültige Punkte ergeben 0. Die ersten Zeilen stehen schon da.',
    merke: { titel: '🔀 Mehrfachverzweigung', text: 'Bei if … elif … else prüft der Computer die Bedingungen von oben nach unten, bis eine zutrifft. Die übrigen Bedingungen werden dann nicht mehr geprüft.', code: 'if (a > b):\n    print(a, "ist größer")\nelif (a < b):\n    print(a, "ist kleiner")\nelse:\n    print(a, "ist gleich", b)' },
    vorlage: 'def note(punkte):\n    if punkte < 0 or punkte > 100:\n        return 0\n    # hier geht es weiter\n    return 6',
    ...B10_T(B10_NOTEN_TEST.map((p) => `note(${p})`), B10_NOTEN_TEST.map(B10_note), B10_NOTEN_TEST.map((p) => `${p} Punkte`)),
    befehle: [K_B('elif ¦:'), K_B('else:'), K_B('return ¦')],
    tipps: ['Von oben nach unten: erst die 1 (ab 85), dann die 2 (ab 70) …', 'Mit elif wird nur die erste passende Bedingung genommen – darum reicht punkte >= 70 für die 2.', 'return beendet die Funktion sofort.'],
    loesung: 'def note(punkte):\n    if punkte < 0 or punkte > 100:\n        return 0\n    elif punkte >= 85:\n        return 1\n    elif punkte >= 70:\n        return 2\n    elif punkte >= 55:\n        return 3\n    elif punkte >= 40:\n        return 4\n    elif punkte >= 20:\n        return 5\n    else:\n        return 6' }),
  B10_VO({ id: 'xa3', kapitel: 110, ico: '🔤', titel: 'Zeichenketten', lohn: 60,
    ziel: 'Auch die Zeichen eines Strings haben Plätze. Sag voraus, was print jeweils ausgibt.',
    merke: { titel: '🔤 Strings', text: 'Ein String ist eine Folge von Zeichen. Der Index beginnt bei 0: frucht[0] ist das erste Zeichen, frucht[-1] das letzte, len(frucht) die Länge. Mit + werden Strings zusammengehängt, mit * wiederholt.', code: 'frucht = "Banane"\nprint(frucht[0])    # B\nprint(len(frucht))  # 6' },
    code: 'frucht = "Kirsche"\nprint(len(frucht))\nprint(frucht[0])\nprint(frucht[-1])\nnachricht = "Hallo" + " " + "Welt"\nprint(nachricht)\nprint(3 * "ab")',
    fragen: [{ art: 'zahl', text: 'Was gibt print(len(frucht)) aus?', soll: (l) => B10_zahl(l, 0) },
      W('Was gibt print(frucht[0]) aus?', ['K', 'i', 'e'], 0), W('Was gibt print(frucht[-1]) aus?', ['e', 'h', 'K'], 0),
      W('Was gibt print(nachricht) aus?', ['Hallo Welt', 'HalloWelt', 'Hallo+Welt'], 0),
      W('Was gibt print(3 * "ab") aus?', ['ababab', 'ab3', 'ab ab ab'], 0)],
    tipps: ['Zähle ab 0: K ist Platz 0.', '[-1] zählt von hinten.'] }),
  B10_VO({ id: 'xa4', kapitel: 110, ico: '⚖️', titel: 'Verknüpfte Bedingungen', lohn: 60,
    ziel: 'Bedingungen lassen sich mit and, or und not verknüpfen. Sag voraus, was print jeweils ausgibt.',
    merke: { titel: '⚖️ and, or, not', text: 'a and b: wahr, wenn beide wahr sind. a or b: wahr, wenn a oder b oder beide wahr sind. not a: wahr, wenn a nicht wahr ist. Das Ergebnis ist wieder ein Wahrheitswert.', code: 'if (a > b and b > c):\n    print(c, "ist die kleinste Zahl")' },
    code: 'a = 30\nb = 28\nc = 30\nprint(a > b and b > c)\nprint(a > b or b > c)\nprint(not (a == c))\nprint((a != b or b == c) and not (c < b))\nif (a > b and b > c):\n    print(c, "ist die kleinste Zahl")\nprint("fertig")',
    fragen: [W('Was gibt print(a > b and b > c) aus?', ['True', 'False'], 1), W('Was gibt print(a > b or b > c) aus?', ['True', 'False'], 0),
      W('Was gibt print(not (a == c)) aus?', ['True', 'False'], 1), W('Was gibt die vierte print-Zeile aus?', ['True', 'False'], 0),
      W('Wird „30 ist die kleinste Zahl“ ausgegeben?', ['ja – a > b stimmt doch', 'nein – b > c ist False, also ist die ganze and-Bedingung False'], 1)],
    tipps: ['Rechne erst jede Seite einzeln aus: a > b ist True, b > c ist False.', 'Klammern zuerst – wie in Mathe.'] }),
  B10_K({ id: 'xa6', kapitel: 110, knobel: true, sortArt: 'funktion', ico: '🟡', titel: 'Pacman in drei Bereichen', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Die Zeichenfläche',
    tabelle: B10_bild(`<svg viewBox="0 0 300 100" class="dssvg"><rect x="0" y="0" width="100" height="100" fill="#2a3a5a"/><rect x="100" y="0" width="100" height="100" fill="#3a3a3a"/><rect x="200" y="0" width="100" height="100" fill="#5a2a2a"/>
      <text x="50" y="45" fill="#fff" text-anchor="middle" font-size="13">Bereich 1</text><text x="50" y="68" fill="#ffe27a" text-anchor="middle" font-size="12">→ +2</text>
      <text x="150" y="45" fill="#fff" text-anchor="middle" font-size="13">Bereich 2</text><text x="150" y="68" fill="#ffe27a" text-anchor="middle" font-size="12">steht: 0</text>
      <text x="250" y="45" fill="#fff" text-anchor="middle" font-size="13">Bereich 3</text><text x="250" y="68" fill="#ffe27a" text-anchor="middle" font-size="12">← −2</text></svg>`),
    ziel: 'Die Zeichenfläche (breite Pixel) ist in drei gleich breite Bereiche geteilt. Schreib bewegung(maus_x, breite): Im Bereich 1 gibt sie 2 zurück (Pacman läuft nach rechts), im Bereich 2 gibt sie 0 zurück (er bleibt stehen), im Bereich 3 gibt sie -2 zurück.',
    vorlage: 'def bewegung(maus_x, breite):\n    return 0',
    ...B10_T(['bewegung(100, 600)', 'bewegung(300, 600)', 'bewegung(450, 600)', 'bewegung(200, 600)', 'bewegung(0, 300)', 'bewegung(299, 300)'],
      [[100, 600], [300, 600], [450, 600], [200, 600], [0, 300], [299, 300]].map(([x, b]) => B10_pacman(x, b)), ['links', 'Mitte', 'rechts', 'Grenze 1|2', 'ganz links', 'ganz rechts']),
    befehle: [K_B('def bewegung(maus_x, breite):'), K_B('if ¦:'), K_B('elif ¦:'), K_B('else:'), K_B('return ¦')],
    tipps: ['Bereich 1 endet bei breite / 3, Bereich 2 bei 2 * breite / 3.', 'Eine Mehrfachverzweigung mit if, elif und else reicht.', 'Genau auf der Grenze (200 von 600) beginnt schon Bereich 2.'],
    loesung: 'def bewegung(maus_x, breite):\n    if maus_x < breite / 3:\n        return 2\n    elif maus_x < 2 * breite / 3:\n        return 0\n    else:\n        return -2' }),

  // --- Kapitel 111: 🐞 Fehler finden (svp SW 2, 5, 6; Kurs 3_6_variablenbeleg, 2_3_Schleifen) ---
  B10_FR({ id: 'xb1', kapitel: 111, ico: '🔍', titel: 'Syntax oder Logik?', lohn: 55, ansicht: 'tabelle', titelAnsicht: 'Fünf Programme',
    tabelle: B10_bild(['A', 'for i in range(3)\n    print(i)', 'B', '# Summe von 1 bis 5\nsumme = 0\nfor i in range(5):\n    summe = summe + i\nprint(summe)',
      'C', 'print("Hallo)', 'D', '# ab 18 volljährig\nalter = 18\nif alter > 18:\n    print("volljährig")', 'E', 'zahl = 4\nif zahl % 2 == 0:\n    print("gerade")']
      .reduce((s, x, i, a) => (i % 2 ? s : s + `<div class="dbtitel">Programm ${x}</div><pre class="mono dscode">${B10_esc(a[i + 1])}</pre>`), '')),
    ziel: 'Welcher Fehler steckt in den Programmen A bis E?',
    story: 'Beim Programmieren schleichen sich oft Fehler ein – sogenannte Bugs. Der Name stammt von 1947: Im Computer Harvard Mark II steckte eine echte Motte. Grace Hopper klebte sie ins Logbuch. Heute suchen wir Bugs systematisch.',
    merke: { titel: '🐞 Syntax und Semantik', text: 'Die Syntax sind die Schreibregeln einer Sprache, die Semantik ist die Bedeutung (was das Programm tut). Einen Syntaxfehler meldet Python schon vor dem Start (z. B. fehlender Doppelpunkt). Ein Fehler in der Logik läuft ohne Meldung, liefert aber ein falsches Ergebnis. Debugging = Fehler systematisch finden und beheben.' },
    fragen: [W('Programm A?', ['Syntaxfehler', 'Fehler in der Logik', 'kein Fehler'], 0), W('Programm B?', ['Syntaxfehler', 'Fehler in der Logik', 'kein Fehler'], 1),
      W('Programm C?', ['Syntaxfehler', 'Fehler in der Logik', 'kein Fehler'], 0), W('Programm D?', ['Syntaxfehler', 'Fehler in der Logik', 'kein Fehler'], 1),
      W('Programm E?', ['Syntaxfehler', 'Fehler in der Logik', 'kein Fehler'], 2),
      W('Was beschreibt die Semantik eines Programms?', ['seine Bedeutung – was es tut', 'die Schreibregeln der Sprache', 'die Farben im Editor'], 0)],
    tipps: ['Würde Python das Programm überhaupt starten? Wenn nein: Syntax.', 'B rechnet 0 + 1 + 2 + 3 + 4 – ist das die Summe von 1 bis 5?', 'D: Ist jemand mit genau 18 volljährig?'] }),
  B10_VO({ id: 'xb2', kapitel: 111, ico: '📋', titel: 'Variablenbelegung', lohn: 65, titelAnsicht: 'Tabelle der Variablen',
    tabelle: B10_beleg(['Schritt', 'a', 'b', 'c', 'n'], B10_spurFibo(), 'Trag in Gedanken (oder im Hefter) nach jedem Schleifendurchlauf ein, welche Werte die Variablen haben – wie im Variablen-Fenster von Thonny. Wie viele Zeilen du brauchst, findest du selbst heraus.'),
    ziel: 'Der Code berechnet die Fibonacci-Folge. Verfolge die Variablen a, b, c und den Zähler n bei jedem Schleifendurchlauf.',
    merke: { titel: '📋 Variablenbelegung', text: 'In einer Tabelle der Variablenbelegung steht für jeden Schritt, welchen Wert jede Variable hat. So findet man Fehler in der Logik, ohne zu raten. Im Debug-Modus von Thonny (🐞, Schritt für Schritt mit F7) sieht man dasselbe im Fenster „Variablen“.' },
    code: 'n = 0\na = 1\nb = 1\nprint(a)\nprint(b)\nc = a + b\nwhile (c < 50):\n    print(c)\n    a = b\n    b = c\n    c = a + b\n    n = n + 1\nprint(n)',
    fragen: [{ art: 'liste', text: 'Welche Zahlen gibt print(c) in der Schleife nacheinander aus? (mit Leerzeichen)', soll: () => B10_spurFibo().slice(0, -1).map((z) => z[3]) },
      { art: 'zahl', text: 'Welchen Wert hat c am Ende des Programms?', soll: () => B10_spurFibo().at(-1)[3] },
      { art: 'zahl', text: 'Was gibt print(n) am Ende aus?', soll: (l) => B10_zahl(l, -1) },
      W('Warum hört die Schleife auf?', ['weil c nicht mehr kleiner als 50 ist', 'weil n den Wert 5 überschreitet', 'weil b größer als a geworden ist'], 0)],
    tipps: ['1. Durchlauf: c = 2 wird ausgegeben, dann a = 1, b = 2, c = 3.', 'Die Bedingung wird VOR jedem Durchlauf geprüft.', 'Jede neue Zahl ist die Summe der beiden davor.'] }),
  hof({ id: 'xb3', kapitel: 111, ico: '🐞', titel: 'Einer zu viel', ziel: 'Der Bauer soll bis zum Zaun ernten und melden, wie viele Rüben es waren. Er meldet aber immer eine zu viel. Finde den Fehler in der Logik!', lohn: 60,
    start: O(['.rrrr#']), varianten: [O(['.rrrrrrr#']), O(['.rr#'])], meldung: meldeErnte, sprache: B10_ACKER,
    befehle: [...SEQ, 'while', V('print(anzahl)')],
    vorlage: 'anzahl = 1\nwhile can_move():\n    forward()\n    harvest()\n    anzahl = anzahl + 1\nprint(anzahl)',
    tipps: ['Lass den Code laufen und verfolge anzahl in der Zeitleiste (📦 Variablen).', 'Wie viel steht in anzahl, bevor die erste Rübe geerntet ist?', 'Ein Zähler beginnt bei 0.'],
    loesung: 'anzahl = 0\nwhile can_move():\n    forward()\n    harvest()\n    anzahl = anzahl + 1\nprint(anzahl)' }),
  hof({ id: 'xb4', kapitel: 111, ico: '🧯', titel: 'Drei Syntaxfehler', ziel: 'In diesem Code stecken drei Syntaxfehler. Lies die Fehlermeldungen und behebe sie, bis der Bauer alle Rüben erntet.', lohn: 60,
    start: O(['.rrr', '...r', '...r']), sprache: B10_ACKER, befehle: [...DREH, 'for'],
    vorlage: 'for i in range(3)\n    forward()\n    harvest()\nturn_right()\nfor i in range(2):\nforward()\n    Harvest()',
    tipps: ['Python meldet immer nur den ersten Fehler – danach den nächsten.', 'Nach for … gehört ein Doppelpunkt, und die Zeilen darunter werden python-typisch eingerückt.', 'Groß- und Kleinschreibung zählt: harvest().'],
    loesung: 'for i in range(3):\n    forward()\n    harvest()\nturn_right()\nfor i in range(2):\n    forward()\n    harvest()' }),
  B10_K({ id: 'xb5', kapitel: 111, sortArt: 'funktion', ico: '➕', titel: 'Die Summe bis n', lohn: 65,
    ziel: 'summe_bis(n) soll 1 + 2 + … + n ausrechnen. Bei summe_bis(3) kommt aber 3 statt 6 heraus. Finde den Fehler.',
    vorlage: 'def summe_bis(n):\n    summe = 0\n    for i in range(1, n):\n        summe = summe + i\n    return summe',
    ...B10_T(['summe_bis(3)', 'summe_bis(10)', 'summe_bis(1)'], [6, 55, 1], ['1 bis 3', '1 bis 10', 'nur 1']),
    befehle: [],
    tipps: ['Welche Zahlen liefert range(1, 3)? Schreib sie auf.', 'range(start, ende) gibt Werte von start bis ende − 1 zurück.', 'range(1, n + 1)'],
    loesung: 'def summe_bis(n):\n    summe = 0\n    for i in range(1, n + 1):\n        summe = summe + i\n    return summe' }),
  B10_VO({ id: 'xb6', kapitel: 111, knobel: true, ico: '🎯', titel: 'Zahlenraten', lohn: 75,
    ziel: 'Der Computer rät die geheime Zahl 37 zwischen 1 und 100 – immer genau in der Mitte. „Zu groß“ oder „zu klein“ verkleinert den Bereich. Sag voraus, was print ausgibt.',
    code: 'unten = 1\noben = 100\ntipp = 0\nversuche = 0\nwhile tipp != 37:\n    tipp = (unten + oben) // 2\n    print(tipp)\n    versuche = versuche + 1\n    if tipp < 37:\n        unten = tipp + 1\n    elif tipp > 37:\n        oben = tipp - 1\nprint(versuche)\nprint(oben)',
    fragen: [{ art: 'liste', text: 'Welche Zahlen rät der Computer nacheinander (print(tipp))?', soll: (l) => (l.aus || []).slice(0, -2).map(Number) },
      { art: 'zahl', text: 'Was gibt print(versuche) aus?', soll: (l) => B10_zahl(l, -2) },
      { art: 'zahl', text: 'Was gibt print(oben) aus?', soll: (l) => B10_zahl(l, -1) }],
    tipps: ['(1 + 100) // 2 = 50. 50 ist zu groß – also oben = 49.', 'Dann (1 + 49) // 2.'] }),

  // --- Kapitel 112: 🧰 Unterprogramme (svp SW 9–10; Kurs 2_4_Unterprogramme, lokale_globale_Variablen.py) ---
  hof({ id: 'xc1', kapitel: 112, ico: '🧰', titel: 'Ein neues Unterprogramm', ziel: 'Ernte die drei Beete. Schreib dafür das Unterprogramm drei(): drei Schritte, jedes Mal ernten – und ruf es dreimal auf.', lohn: 60,
    start: O(['.rrr.rrr.rrr']), sprache: B10_ACKER, befehle: [...SEQ, 'for', V('def drei():', true), V('drei()', true)],
    merke: { titel: '🧰 Unterprogramme', text: 'Ein Unterprogramm (Funktion) ist ein wiederverwendbarer Codeblock mit einem Namen. Es wird mit def definiert und läuft erst, wenn es aufgerufen wird: drei(). DRY – „Don\'t Repeat Yourself“: Wer nichts doppelt schreibt, macht weniger Fehler.', code: 'def drei():\n    for i in range(3):\n        forward()\n        harvest()\n\ndrei()' },
    tipps: ['Erst das Unterprogramm schreiben: def drei(): und darunter eingerückt die Schleife.', 'Dann im Hauptprogramm (nicht eingerückt) aufrufen.', 'drei() · forward() · drei() · forward() · drei()'],
    loesung: 'def drei():\n    for i in range(3):\n        forward()\n        harvest()\n\ndrei()\nforward()\ndrei()\nforward()\ndrei()' }),
  VORHER({ id: 'xc2', kapitel: 112, ico: '🔮', titel: 'Wann läuft die Funktion?', lohn: 60,
    start: O(['.rr', '.rr']), befehle: DREH, sprache: B10_ACKER,
    tipps: ['Die Zeilen unter def laufen erst beim Aufruf ecke().', 'ecke() wird zweimal aufgerufen – jedes Mal mit einer Drehung am Ende.'],
    code: 'def ecke():\n    forward()\n    harvest()\n    turn_right()\n\nforward()\nharvest()\necke()\necke()' }),
  hof({ id: 'xc3', kapitel: 112, ico: '📏', titel: 'Funktion mit Parameter', ziel: 'Ernte alle Rüben. Schreib dazu reihe(n): n Schritte, jedes Mal ernten – und ruf sie mit verschiedenen Zahlen auf.', lohn: 65,
    start: O(['.rrrrr', '.....r', '.rrrrr']), sprache: B10_ACKER, befehle: [...DREH, 'for', V('def reihe(n):', true)],
    merke: { titel: '📏 Parameter', text: 'Funktionen können Parameter annehmen: def reihe(n). Beim Aufruf reihe(5) steht n für 5, bei reihe(2) für 2. Der Parameter steht immer in Klammern hinter dem Funktionsnamen – wie bei print("Hallo").', code: 'def reihe(n):\n    for i in range(n):\n        forward()\n        harvest()\n\nreihe(5)' },
    tipps: ['Oben 5 Rüben, rechts 2 nach unten, unten 4 zurück.', 'Nach jeder Reihe eine Rechtsdrehung.', 'reihe(5) · turn_right() · reihe(2) · turn_right() · reihe(4)'],
    loesung: 'def reihe(n):\n    for i in range(n):\n        forward()\n        harvest()\n\nreihe(5)\nturn_right()\nreihe(2)\nturn_right()\nreihe(4)' }),
  hof({ id: 'xc4', kapitel: 112, ico: '🔲', titel: 'Rahmen aus Seiten', ziel: 'Ernte den großen und den kleinen Rahmen. Zerlege das Problem: seite(n) erntet eine Seite, rahmen(n) ruft viermal seite(n) auf.', lohn: 70,
    start: O(['.rrrr', 'r.rrr', 'rr.rr', 'rrrrr', 'rrrrr']), sprache: B10_ACKER,
    befehle: [...DREH, 'for', V('def seite(n):', true), V('def rahmen(n):', true)],
    merke: { titel: '🧩 Modularisierung', text: 'Modularisierung heißt: ein Problem in Teilprobleme zerlegen und jedes mit einem eigenen Unterprogramm lösen. Funktionen können andere Funktionen aufrufen – rahmen(n) benutzt seite(n), wie do_a_and_b() die Funktionen do_a() und do_b().', code: 'def rahmen(n):\n    for i in range(4):\n        seite(n)\n        turn_right()' },
    tipps: ['Der große Rahmen hat Seiten mit 4 Schritten, der kleine mit 2.', 'Nach dem großen Rahmen steht der Bauer wieder oben links. Ein Schritt nach unten, einer nach rechts – dann beginnt der kleine.', 'rahmen(4) · turn_right() · forward() · turn_left() · forward() · rahmen(2)'],
    loesung: 'def seite(n):\n    for i in range(n):\n        forward()\n        harvest()\n\ndef rahmen(n):\n    for i in range(4):\n        seite(n)\n        turn_right()\n\nrahmen(4)\nturn_right()\nforward()\nturn_left()\nforward()\nrahmen(2)' }),
  hof({ id: 'xc5', kapitel: 112, ico: '↩️', titel: 'Funktion mit Rückgabewert', ziel: 'Ernte beide Reihen bis zum Zaun bzw. Rand (Setzlinge bleiben stehen) und melde, wie viele Rüben es insgesamt waren. Deine Funktion gibt mit return zurück, wie viele sie geerntet hat.', lohn: 75,
    start: O(['.rsrr#', 'rrsr..']), varianten: [O(['.rsrrsr#', 'srrsrr..']), O(['.sr#', 'rr..'])], meldung: meldeErnte, sprache: B10_ACKER,
    befehle: [...DREH, 'while', 'if', V('def ernte_bis_ende():', true), V('return ', true)],
    merke: { titel: '↩️ Rückgabewert', text: 'Mit return gibt eine Funktion einen Wert zurück – und hört sofort auf. Den Rückgabewert kann man speichern oder ausgeben: print(quadrat(3)). Ohne return gibt eine Funktion nichts (None) zurück.', code: 'def quadrat(x):\n    return x * x\n\nprint(quadrat(3))   # 9' },
    tipps: ['Die Funktion läuft bis zum Zaun, erntet nur Rüben (if can_harvest()) und zählt mit.', 'Zwischen den Reihen: turn_right(), forward(), turn_right() – dann zeigt der Bauer nach links.', 'a = ernte_bis_ende() · Wechsel · b = ernte_bis_ende() · print(a + b)'],
    loesung: 'def ernte_bis_ende():\n    anzahl = 0\n    while can_move():\n        forward()\n        if can_harvest():\n            harvest()\n            anzahl = anzahl + 1\n    return anzahl\n\na = ernte_bis_ende()\nturn_right()\nforward()\nturn_right()\nb = ernte_bis_ende()\nprint(a + b)' }),
  B10_VH({ id: 'xc6', kapitel: 112, ico: '🏠', titel: 'Lokal oder global?', lohn: 65, ortInfo: B10_ORT, ansicht: 'tabelle', titelAnsicht: 'Ausgabe', tabelle: B10_ausgabe(),
    ziel: 'Es gibt zwei Variablen mit dem Namen a. Das Hauptprogramm steht in versuch(). Sag voraus, was print jeweils ausgibt.',
    merke: { titel: '🏠 Lokale und globale Variablen', text: 'Lokale Variablen gibt es nur in der Funktion, in der sie einen Wert bekommen. Globale Variablen werden außerhalb von Funktionen angelegt und sind überall sichtbar. Soll eine Funktion eine globale Variable ändern, braucht sie global – lokale Variablen werden aber bevorzugt.', code: 'a = 1\n\ndef show_var():\n    a = 2      # lokal\n    print(a)\n\nshow_var()   # 2\nprint(a)     # 1' },
    code: 'a = 1\n\ndef show_var():\n    a = 2\n    return a\n\nxpos = 0\n\ndef bewege():\n    global xpos\n    xpos = xpos + 2\n\ndef versuch():\n    print(show_var())\n    print(a)\n    bewege()\n    bewege()\n    print(xpos)',
    fragen: [{ art: 'zahl', text: 'Was gibt print(show_var()) aus?', soll: (l) => B10_zahl(l, 0) },
      { art: 'zahl', text: 'Was gibt danach print(a) aus?', soll: (l) => B10_zahl(l, 1) },
      { art: 'zahl', text: 'Was gibt print(xpos) nach zwei Aufrufen von bewege() aus?', soll: (l) => B10_zahl(l, 2) },
      W('Warum ändert show_var() das globale a nicht?', ['a = 2 legt in show_var eine eigene, lokale Variable an', 'show_var wird im Hauptprogramm gar nicht aufgerufen', 'return gibt den Wert nur zurück, statt ihn zu speichern'], 0),
      W('Wie bindet man die Funktion randint aus der Bibliothek random ein?', ['from random import randint', 'def randint(random):', 'import randint from random'], 0)],
    tipps: ['show_var() hat ein eigenes, lokales a.', 'bewege sagt mit global xpos ausdrücklich: Ich meine das xpos draußen.'] }),
  B10_K({ id: 'xc7', kapitel: 112, sortArt: 'funktion', ico: '🔄', titel: 'Zahlen tauschen', lohn: 70, ortInfo: B10_ORT,
    ziel: 'zahlen_tauschen(zahl1, zahl2) soll die beiden Zahlen vertauscht zurückgeben. Aus 3 und 8 wird aber 8 und 8. Warum? Verbessere das Unterprogramm.',
    vorlage: 'def zahlen_tauschen(zahl1, zahl2):\n    zahl1 = zahl2\n    zahl2 = zahl1\n    return zahl1, zahl2',
    ...B10_T(['zahlen_tauschen(3, 8)', 'zahlen_tauschen(1, 2)', 'zahlen_tauschen(7, 7)'], [[8, 3], [2, 1], [7, 7]], ['3 und 8', '1 und 2', 'zweimal 7']),
    befehle: [],
    tipps: ['Mach eine Variablenbelegung: Nach zahl1 = zahl2 ist der alte Wert von zahl1 weg.', 'Merk dir den alten Wert vorher in einer Hilfsvariable.', 'hilf = zahl1, zahl1 = zahl2, zahl2 = hilf'],
    loesung: 'def zahlen_tauschen(zahl1, zahl2):\n    hilf = zahl1\n    zahl1 = zahl2\n    zahl2 = hilf\n    return zahl1, zahl2' }),

  // --- Kapitel 113: 📋 Listen (svp SW 11 „Notenliste auswerten“; Kurs 3_7_arrays) ---
  hof({ id: 'xd1', kapitel: 113, ico: '📋', titel: 'Die Längenliste', ziel: 'In der Liste laengen steht, wie lang jede Reihe ist. Ernte Reihe für Reihe: hin, zurück zum Rand, eine Reihe tiefer – mit for l in laengen.', lohn: 70,
    start: O(['.rrr..', '.rrrrr', '.rr...', '.rrrr.', '......']), sprache: B10_LISTE,
    befehle: [...DREH, 'for', V('for l in laengen:', true)],
    vorlage: 'laengen = [3, 5, 2, 4]\n',
    merke: { titel: '📋 Listen', text: 'Eine Liste ist eine geordnete Sammlung von Werten in eckigen Klammern: laengen = [3, 5, 2, 4]. Mit for l in laengen: nimmt l bei jedem Durchlauf den nächsten Wert der Liste an.', code: 'tiere = ["Hund", "Katze", "Maus"]\nfor tier in tiere:\n    print("Tier:", tier)' },
    tipps: ['Für jede Länge l: l Schritte mit Ernten, umdrehen, l Schritte zurück.', 'Eine Reihe tiefer: turn_left(), forward(), turn_left().', 'for l in laengen: · for i in range(l): forward(), harvest() · 2× turn_right() · for i in range(l): forward() · turn_left(), forward(), turn_left()'],
    loesung: 'laengen = [3, 5, 2, 4]\nfor l in laengen:\n    for i in range(l):\n        forward()\n        harvest()\n    turn_right()\n    turn_right()\n    for i in range(l):\n        forward()\n    turn_left()\n    forward()\n    turn_left()' }),
  hof({ id: 'xd2', kapitel: 113, ico: '🧺', titel: 'Ernte je Reihe', ziel: 'Ernte drei Reihen (Setzlinge bleiben stehen). Häng in einer Liste an, wie viele Rüben jede Reihe hatte. Such am Ende mit einer Schleife die beste Reihe und melde sie: print(beste).', lohn: 75,
    start: O(['.rsrrs', '.rrrsr', '.srsrs', '......']), varianten: [O(['.rrsrrrs', '.srsrsrr', '.rrrrsrr', '........']), O(['.rrs', '.srr', '.ssr', '....'])],
    meldung: B10_maxReihe, sprache: B10_LISTE,
    befehle: [...DREH, 'for', 'while', 'if', V('ernten = []', true), V('ernten.append()', true)],
    merke: { titel: '➕ append und Maximum suchen', text: 'liste = [] legt eine leere Liste an, append() hängt ein Element hinten an. Einen Extremwert findest du so: Merk dir das erste Element und geh die Liste durch – ist ein Element besser, merkst du dir das. Das Beispiel sucht den kleinsten Preis; den größten Wert findest du genauso, nur mit dem anderen Vergleich.', code: 'preise = []\npreise.append(4)\npreise.append(2)\npreise.append(7)\nbillig = preise[0]\nfor p in preise:\n    if p < billig:\n        billig = p' },
    tipps: ['Für jede der 3 Reihen: anzahl = 0, bis zum Rand ernten und zählen, dann ernten.append(anzahl).', 'Zurück: umdrehen, while can_move(): forward(), dann turn_left(), forward(), turn_left().', 'Ganz am Ende, nicht eingerückt: beste = ernten[0] · for e in ernten: if e > beste: beste = e · print(beste)'],
    loesung: 'ernten = []\nfor reihe in range(3):\n    anzahl = 0\n    while can_move():\n        forward()\n        if can_harvest():\n            harvest()\n            anzahl = anzahl + 1\n    ernten.append(anzahl)\n    turn_right()\n    turn_right()\n    while can_move():\n        forward()\n    turn_left()\n    forward()\n    turn_left()\nbeste = ernten[0]\nfor e in ernten:\n    if e > beste:\n        beste = e\nprint(beste)' }),
  B10_VO({ id: 'xd3', kapitel: 113, ico: '🔢', titel: 'Index, insert und remove', lohn: 65,
    ziel: 'Jedes Element einer Liste hat einen Index. Beim Einfügen und Löschen verschieben sich die anderen. Sag voraus, was print jeweils ausgibt.',
    merke: { titel: '🔢 Index', text: 'Der Index beginnt in Python immer bei 0. append(wert) hängt hinten an, insert(index, wert) fügt an einer Stelle ein (die Elemente danach rücken nach rechts), del liste[index] und remove(wert) löschen (die Elemente danach rücken nach links).', code: 'tiere = ["Hund", "Katze", "Maus"]\nprint(tiere[0])   # Hund\ntiere.insert(1, "Löwe")' },
    code: 'tiere = ["Hund", "Katze", "Maus"]\nprint(tiere[1])\ntiere.append("Fuchs")\nprint(len(tiere))\ntiere.insert(1, "Löwe")\nprint(tiere[2])\ntiere.remove("Maus")\nfor tier in tiere:\n    print(tier)',
    fragen: [W('Was gibt print(tiere[1]) aus?', ['Katze', 'Hund', 'Maus'], 0),
      { art: 'zahl', text: 'Was gibt print(len(tiere)) nach append aus?', soll: (l) => B10_zahl(l, 1) },
      W('Was gibt print(tiere[2]) nach insert(1, "Löwe") aus?', ['Katze', 'Löwe', 'Maus'], 0),
      { art: 'liste', text: 'Welche Tiere gibt die for-Schleife am Ende nacheinander aus? (Namen mit Leerzeichen)', soll: (l) => (l.aus || []).slice(3) }],
    tipps: ['Der erste Platz hat den Index 0.', 'Nach insert(1, "Löwe") steht Löwe auf Platz 1, Katze ist auf Platz 2 gerutscht.', 'remove("Maus") löscht die Maus, egal auf welchem Platz sie steht.'] }),
  B10_K({ id: 'xd4', kapitel: 113, sortArt: 'funktion', ico: '📊', titel: 'Notenliste auswerten', lohn: 70, ortInfo: B10_ORT,
    ziel: 'Schreib durchschnitt(noten): den Durchschnitt aller Noten der Liste. Zähl die Noten mit einer Schleife zusammen und teil durch die Anzahl. Ist die Liste leer, gib 0 zurück.',
    ...B10_T(['durchschnitt([2, 3, 1, 2])', 'durchschnitt([1, 1, 2])', 'durchschnitt([5])', 'durchschnitt([])'], [[2, 3, 1, 2], [1, 1, 2], [5], []].map(B10_schnitt),
      ['vier Noten', 'drei Noten', 'eine Note', 'leere Liste']),
    befehle: [K_B('def durchschnitt(noten):')],
    tipps: ['Erst alle Noten zusammenzählen, dann durch die Anzahl teilen.', 'len(noten) ist die Anzahl.', 'Leere Liste zuerst abfangen: if len(noten) == 0: return 0'],
    loesung: 'def durchschnitt(noten):\n    if len(noten) == 0:\n        return 0\n    summe = 0\n    for note in noten:\n        summe = summe + note\n    return summe / len(noten)' }),
  B10_K({ id: 'xd5', kapitel: 113, sortArt: 'funktion', ico: '🔎', titel: 'Zählen mit Bedingung', lohn: 70, ortInfo: B10_ORT,
    ziel: 'Schreib anzahl_groesser(liste, grenze): Sie zählt, wie viele Zahlen in der Liste größer als grenze sind, und gibt die Anzahl zurück.',
    ...B10_T(['anzahl_groesser([5, 12, 17, 8, 4], 10)', 'anzahl_groesser([1, 2, 3], 5)', 'anzahl_groesser([10, 11, 10], 10)', 'anzahl_groesser([], 0)'],
      [[[5, 12, 17, 8, 4], 10], [[1, 2, 3], 5], [[10, 11, 10], 10], [[], 0]].map(([l, g]) => B10_groesser(l, g)), ['größer als 10', 'keine', 'genau 10 zählt nicht', 'leere Liste']),
    befehle: [K_B('def anzahl_groesser(liste, grenze):')],
    tipps: ['Wie Rüben zählen: anzahl = 0, dann bei jedem Treffer + 1.', 'Die Schleife nimmt jede Zahl der Liste einmal.', 'return anzahl nach der Schleife (nicht eingerückt in die Schleife).'],
    loesung: 'def anzahl_groesser(liste, grenze):\n    anzahl = 0\n    for zahl in liste:\n        if zahl > grenze:\n            anzahl += 1\n    return anzahl' }),

  // --- Kapitel 114: 🚁 Maschinelle Entscheidungen (svp SW 16; Kurs 5_1_clustering) ---
  B10_FR({ id: 'xe1', kapitel: 114, ico: '🚁', titel: 'Das Drohnen-Startup', lohn: 60,
    ziel: 'Ein Startup will mit Drohnen Defibrillatoren schnell zu Patienten bringen. Wie können Computer dabei entscheiden?',
    story: 'Ein Startup will mit Drohnen Defibrillatoren schnell zu Patienten fliegen. Wo sollen die Drohnen stehen? Und welche Drohne fliegt los, wenn ein Notruf kommt? Computer treffen solche Entscheidungen – nach Regeln oder aus Daten gelernt.',
    merke: { titel: '🤖 Maschinelles Lernen', text: 'Überwachtes Lernen: Die Trainingsdaten haben Labels (z. B. „Katze“/„Hund“). Unüberwachtes Lernen: Die Daten haben keine Labels, der Algorithmus sucht selbst Muster. Clustering teilt Objekte mit ähnlichen Merkmalen in Gruppen (Cluster) ein – das ist unüberwachtes Lernen.' },
    fragen: [W('Der Computer bekommt Bilder mit der Beschriftung „Katze“ oder „Hund“ und soll danach neue Bilder einordnen. Das ist …', ['überwachtes Lernen', 'unüberwachtes Lernen', 'bestärkendes Lernen'], 0),
      W('Der Computer bekommt Bilder ohne Beschriftung und soll sie selbst in zwei Gruppen teilen. Das ist …', ['unüberwachtes Lernen', 'überwachtes Lernen', 'bestärkendes Lernen'], 0),
      W('Die Drohnenstandorte stehen fest. Ein neuer Einsatzort wird der nächsten Drohne zugeordnet. Das nennt man …', ['Kategorisierung', 'Clustering', 'Debugging'], 0),
      W('Was ist die Aufgabe der Entwickler beim Clustering?', ['passende Merkmale auswählen', 'jedes Objekt selbst einsortieren', 'die Gruppen vorher festlegen'], 0),
      { ...W('Ein autonomes Auto entscheidet falsch. Wer ist verantwortlich?', ['die Menschen, die es bauen und einsetzen', 'das Auto, weil es selbst entschieden hat', 'niemand, weil Maschinen eben Fehler machen'], 0),
        erklaerung: 'Menschen legen Regeln und Trainingsdaten fest und entscheiden, das System einzusetzen – die Verantwortung bleibt bei ihnen.' }],
    tipps: ['Label = Beschriftung. Mit Label → überwacht.', 'Clustering findet Gruppen, Kategorisierung ordnet Neues in bestehende Gruppen ein.'] }),
  B10_K({ id: 'xe2', kapitel: 114, sortArt: 'funktion', ico: '📏', titel: 'Darf die Drohne starten?', lohn: 70,
    ziel: 'Schreib die Entscheidungsregel darf_starten(wind, akku, notfall): Die Drohne startet nur, wenn der Wind unter 50 km/h liegt UND (der Akku mindestens 30 % hat ODER ein Notfall ist). Rückgabe True oder False.',
    ...B10_T(['darf_starten(20, 80, False)', 'darf_starten(60, 90, True)', 'darf_starten(30, 10, False)', 'darf_starten(30, 10, True)', 'darf_starten(49, 30, False)'],
      [[20, 80, false], [60, 90, true], [30, 10, false], [30, 10, true], [49, 30, false]].map(([w, a, n]) => B10_start(w, a, n)),
      ['alles gut', 'zu viel Wind', 'Akku leer', 'Akku leer, aber Notfall', 'Grenzfall']),
    // Didaktik-Nachprüfung: der zweite Baustein war die ganze Lösung → nur Kopf + leeres return
    befehle: [K_B('def darf_starten(wind, akku, notfall):'), K_B('return ¦')],
    tipps: ['Zwei Teile mit and verknüpft – der zweite Teil ist selbst ein or.', 'Die Klammern sind wichtig!', 'notfall ist schon ein Wahrheitswert – man muss nicht notfall == True schreiben.'],
    loesung: 'def darf_starten(wind, akku, notfall):\n    return wind < 50 and (akku >= 30 or notfall)' }),
  B10_K({ id: 'xe3', kapitel: 114, sortArt: 'funktion', ico: '📍', titel: 'Welche Drohne fliegt?', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Drohnenstandorte',
    tabelle: B10_bild('<pre class="mono dscode">drohnen = [[2, 3], [8, 1], [5, 7]]\n#          Drohne 0  1       2\n# Einsatzort (x, y) → nächste Drohne?</pre><p class="hinweis">Abstand zum Quadrat: (x − dx)² + (y − dy)². Wurzelziehen ist nicht nötig – die nächste Drohne bleibt die nächste.</p>'),
    ziel: 'Kategorisierung: Schreib naechste_drohne(drohnen, x, y). Sie gibt den Index der Drohne zurück, die dem Einsatzort (x, y) am nächsten ist. Bei Gleichstand zählt die erste.',
    ...B10_T(['naechste_drohne([[2, 3], [8, 1], [5, 7]], 3, 3)', 'naechste_drohne([[2, 3], [8, 1], [5, 7]], 7, 2)', 'naechste_drohne([[2, 3], [8, 1], [5, 7]], 5, 9)', 'naechste_drohne([[0, 0]], 4, 4)'],
      [[3, 3], [7, 2], [5, 9], null].map((p, i) => (i === 3 ? 0 : B10_naechste([[2, 3], [8, 1], [5, 7]], p[0], p[1]))), ['Ort (3, 3)', 'Ort (7, 2)', 'Ort (5, 9)', 'nur eine Drohne']),
    befehle: [K_B('def naechste_drohne(drohnen, x, y):'), K_B('for i in range(¦):'), K_B('if ¦:'), K_B('return ¦')],
    tipps: ['Jede Drohne ist selbst eine Liste: d[0] ist x, d[1] ist y.', 'Merk dir den Index der bisher nächsten Drohne und ihren Abstand.', 'Nur bei echt kleinerem Abstand (<) wechseln – dann bleibt bei Gleichstand die erste.'],
    loesung: 'def naechste_drohne(drohnen, x, y):\n    beste = 0\n    kleinster = (drohnen[0][0] - x) ** 2 + (drohnen[0][1] - y) ** 2\n    for i in range(len(drohnen)):\n        d = drohnen[i]\n        abstand = (d[0] - x) ** 2 + (d[1] - y) ** 2\n        if abstand < kleinster:\n            kleinster = abstand\n            beste = i\n    return beste' }),
  B10_VO({ id: 'xe4', kapitel: 114, knobel: true, ico: '🧲', titel: 'k-Means an der Straße', lohn: 85,
    ziel: 'Die Einsätze liegen an einer Straße (Kilometer). Zwei Drohnen sollen so stehen, dass sie ihre Einsätze schnell erreichen. Der Code ist das partitionierende Verfahren k-Means mit k = 2. Verfolge es.',
    merke: { titel: '🧲 k-Means', text: 'k-Means teilt die Daten in k Cluster: 1. Jeder Punkt kommt zum nächsten Zentrum. 2. Jedes Zentrum wandert in die Mitte (Durchschnitt) seiner Punkte. Das wiederholt man, bis sich nichts mehr ändert.' },
    code: 'orte = [1, 2, 3, 8, 9, 11]\nz1 = 1\nz2 = 2\nfor runde in range(3):\n    g1 = []\n    g2 = []\n    for x in orte:\n        if abs(x - z1) <= abs(x - z2):\n            g1.append(x)\n        else:\n            g2.append(x)\n    z1 = sum(g1) / len(g1)\n    z2 = sum(g2) / len(g2)\n    print("Runde", runde + 1, g1, g2, z1, z2)',
    fragen: [{ art: 'zahl', text: 'Wo steht Zentrum z2 nach der 1. Runde?', soll: () => B10_kmeans()[0][3], tol: 0.01 },
      { art: 'liste', text: 'Welche Orte gehören am Ende zur Gruppe g1?', soll: () => B10_kmeans().at(-1)[0] },
      { art: 'zahl', text: 'Wo steht z1 am Ende?', soll: () => B10_kmeans().at(-1)[2], tol: 0.01 },
      { art: 'zahl', text: 'Wo steht z2 am Ende? (auf 2 Stellen)', soll: () => B10_kmeans().at(-1)[3], tol: 0.01 }],
    tipps: ['Runde 1: Nur der Ort 1 liegt näher an z1 = 1 als an z2 = 2.', 'Neues z2 = Durchschnitt von 2, 3, 8, 9, 11.', 'Ab Runde 2 ändern sich die Gruppen nicht mehr.'] }),

  // --- Kapitel 115: 🔣 Formale Sprachen und Automaten (svp SW 18–21; Kurs lb2_sprachen) ---
  B10_FR({ id: 'xf1', kapitel: 115, ico: '🔣', titel: 'Alphabet, Wort, Sprache', lohn: 55,
    ziel: 'Programmiersprachen sind formale Sprachen. Was bedeuten Alphabet, Wort und Sprache?',
    story: 'Am Burgtor prüfen die Wachen Losungen, Kennzeichen und Daten – nach festen Regeln. Solche Regeln kann man genau aufschreiben: als regulären Ausdruck, als Automat oder als Grammatik.',
    merke: { titel: '🔣 Formale Sprachen', text: 'Ein Alphabet Σ ist eine endliche, nichtleere Menge von Zeichen, z. B. Σ = {I, V, X, L, C, D, M}. Ein Wort über Σ ist eine Zeichenkette nur aus Zeichen des Alphabets; das leere Wort ε gehört zu jedem Alphabet. Eine Sprache L ist eine Teilmenge der Wörter über Σ.' },
    fragen: [W('Was ist ein Alphabet?', ['eine endliche, nichtleere Menge von Zeichen', 'nur die 26 Buchstaben von a bis z', 'eine beliebige Menge von Wörtern'], 0),
      W('Σ = {I, V, X, L, C, D, M}. Welches Wort gehört zur Sprache der römischen Zahlen?', ['LXX', 'XXL', 'LILLI'], 0),
      W('XXL ist ein Wort über Σ, aber keine römische Zahl. Also ist die Sprache der römischen Zahlen …', ['eine Teilmenge aller Wörter über Σ', 'das Alphabet selbst', 'genau die Menge aller Wörter über Σ'], 0),
      W('Die Sprache der T-Shirt-Größen L = {L, XL, XXL, …} kommt mit welchem Alphabet aus?', ['{L, X}', '{L}', '{I, V, X, L, C, D, M} ist zwingend'], 0),
      W('L = {a, b, ab, ba, abba} über A = {a, b}. Gehört aab zur Sprache?', ['nein – nur die aufgezählten Wörter gehören dazu', 'ja – jedes Wort aus a und b gehört dazu'], 0),
      W('Womit wird eine Sprache erzeugt, womit erkannt?', ['Eine Grammatik erzeugt sie, ein Automat erkennt sie.', 'Ein Automat erzeugt sie, eine Grammatik erkennt sie.', 'Ein regulärer Ausdruck erzeugt sie, eine Grammatik erkennt sie.'], 0)],
    tipps: ['Wort = irgendeine Zeichenfolge aus dem Alphabet, Sprache = die erlaubten davon.'] }),
  B10_FR({ id: 'xf2', kapitel: 115, ico: '🧵', titel: 'Reguläre Ausdrücke lesen', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'Reguläre Ausdrücke',
    tabelle: B10_bild(B10_REGEX),
    ziel: 'Ein regulärer Ausdruck beschreibt eine Sprache als Muster. Welche Wörter passen?',
    merke: { titel: '🧵 Reguläre Ausdrücke', text: 'Mit regulären Ausdrücken lassen sich einfach aufgebaute Sprachen beschreiben: | für „oder“, * für „beliebig oft“, Klammern zum Zusammenfassen. Praktisch nutzt man sie zum Suchen und Ersetzen (z. B. in Notepad++ oder LibreOffice Calc) und in Python mit dem Modul re.', code: 'RFC[0-9]{4}     findet RFC2616, RFC0791 …\n[0-9]{5}        Postleitzahl' },
    fragen: [W('Welches Wort gehört zu (aba)*?', ['abaaba', 'abab', 'aab'], 0),
      W('Welches Wort gehört zu (aa|b)*?', ['aabaa', 'aba', 'aaa'], 0),
      W('Was beschreibt a(a|b)*b über A = {a, b}?', ['alle Wörter, die mit a beginnen und mit b enden', 'alle Wörter, die genau ein a und ein b enthalten', 'alle Wörter, die mit b beginnen und mit a enden'], 0),
      W('Welcher Treffer passt zu RFC[0-9]{4}?', ['RFC2616', 'RFC261', 'RFC 2616'], 0),
      W('Welches Wort passt zu [0-9]{5}?', ['01069', '1069', '0106a'], 0),
      W('Welches Wort passt NICHT zu Ra+t?', ['Rt', 'Rat', 'Raaat'], 0)],
    tipps: ['* erlaubt auch null Mal, + braucht mindestens einmal.', '(aa|b)* setzt nur die Stücke aa und b zusammen.'] }),
  B10_FR({ id: 'xf3', kapitel: 115, ico: '✍️', titel: 'Reguläre Ausdrücke finden', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Reguläre Ausdrücke',
    tabelle: B10_bild(B10_REGEX),
    ziel: 'Jetzt umgekehrt: Welcher reguläre Ausdruck beschreibt die Eingaben richtig?',
    fragen: [W('Alle Wörter über {a, b}, die wenigstens drei aufeinanderfolgende a enthalten?', ['(a|b)*aaa(a|b)*', 'aaa(a|b)', 'a*a*a*(a|b)*'], 0),
      W('Ein Datum wie 24.12.2026?', ['[0-9]{2}\\.[0-9]{2}\\.[0-9]{4}', '[0-9]+\\.[0-9]+', '[0-9]{2}-[0-9]{2}-[0-9]{4}'], 0),
      W('Eine Raumnummer wie „B-204“ (ein großer Buchstabe, Strich, genau 3 Ziffern)?', ['[A-Z]-[0-9]{3}', '[A-Z]{3}-[0-9]', '[a-z]-[0-9]{3}'], 0),
      W('Eine einfache E-Mail-Adresse wie anna@burg.de?', ['[a-z]+@[a-z]+\\.de', '[a-z]+@[a-z]+de', '[a-z]+\\.[a-z]+@de'], 0),
      { art: 'liste', text: 'Welche der Wörter Rabe, Robe, Rebe, Rbe, Raabe passen zu R(a|e|o)be? (in dieser Reihenfolge, mit Leerzeichen)', soll: () => ['Rabe', 'Robe', 'Rebe', 'Rbe', 'Raabe'].filter((w) => /^R(a|e|o)be$/.test(w)) }],
    tipps: ['Ein echter Punkt wird als \\. geschrieben.', '(a|e|o) ist genau EIN Buchstabe.'] }),
  B10_K({ id: 'xf4', kapitel: 115, sortArt: 'funktion', ico: '📅', titel: 'Ein Datum validieren', lohn: 70,
    ziel: 'Validieren = prüfen, ob eine Eingabe die richtige Form hat. Schreib ist_datum(text): True, wenn der Text die Form TT.MM.JJJJ hat (10 Zeichen, Punkte an Platz 2 und 5, sonst Ziffern) und Tag 1–31 und Monat 1–12 stimmen. Sonst False.',
    ...B10_T(['ist_datum("24.12.2026")', 'ist_datum("1.1.2026")', 'ist_datum("24-12-2026")', 'ist_datum("32.01.2026")', 'ist_datum("05.13.2026")', 'ist_datum("ab.cd.efgh")'],
      ['24.12.2026', '1.1.2026', '24-12-2026', '32.01.2026', '05.13.2026', 'ab.cd.efgh'].map(B10_datum), ['24.12.2026', '1.1.2026', 'mit Strichen', 'Tag 32', 'Monat 13', 'Buchstaben']),
    befehle: [K_B('def ist_datum(text):'), K_B('if ¦:'), K_B('return False'), K_B('return ¦')],
    tipps: ['Prüf Schritt für Schritt und gib sofort False zurück, wenn etwas nicht passt.', 'isdigit() ist True, wenn ein String nur aus Ziffern besteht. text[0:2] sind die Zeichen auf Platz 0 und 1.', 'Am Ende: return 1 <= tag <= 31 and 1 <= monat <= 12'],
    loesung: 'def ist_datum(text):\n    if len(text) != 10:\n        return False\n    if text[2] != "." or text[5] != ".":\n        return False\n    ziffern = text[0:2] + text[3:5] + text[6:10]\n    if not ziffern.isdigit():\n        return False\n    tag = int(text[0:2])\n    monat = int(text[3:5])\n    return 1 <= tag <= 31 and 1 <= monat <= 12' }),
  B10_FR({ id: 'xf5', kapitel: 115, ico: '🚪', titel: 'Der DEA mit zwei Nullen', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'DEA 1',
    // Zustandsgraph wie im Kurs (svgAutomat aus torwerk.js, erst beim Zeichnen aufgerufen)
    tabelle: () => ({ html: B10_rahmen(`${typeof svgAutomat === 'function' ? svgAutomat({ zustaende: ['Z0', 'Z1', 'ZE'], alphabet: ['0', '1'], start: 'Z0', ende: ['ZE'], delta: B10_DEA2 }) : ''}
      <pre class="mono dscode">Z0 --0--> Z1 --0--> ZE --0--> ZE\nZ0 --1--> Z0\nZ1 --1--> Z0\nZE --1--> Z0\nStart: Z0   Endzustand: ZE</pre><p class="hinweis">Der Automat erkennt alle Binärzahlen, die auf mindestens zwei Nullen enden.</p>`) }),
    ziel: 'Ein deterministischer endlicher Automat (DEA) liest eine Eingabe Zeichen für Zeichen. Verfolge DEA 1 – und bau dann selbst einen.',
    merke: { titel: '🚪 Endlicher Automat', text: 'Ein DEA hat einen Startzustand und mindestens einen Endzustand. Er liest die Eingabe zeichenweise und wechselt jeweils in einen Folgezustand. Ist die Eingabe zu Ende und er steht in einem Endzustand, wird sie akzeptiert – darum heißt er auch Akzeptor. Darstellung als Zustandsgraph mit Z0, Z1, …' },
    fragen: [{ art: 'liste', text: 'Die Eingabe 110100 wird gelesen. Welche Zustände nimmt der Automat nacheinander ein (ohne den Startzustand)?', soll: () => B10_lauf('110100') },
      W('Wird 0011010 akzeptiert?', ['nein, er endet in Z1', 'ja, er endet in ZE', 'nein, er endet in Z0'], B10_lauf('0011010').at(-1) === 'Z1' ? 0 : 1),
      { art: 'automat', text: 'Verändere den Automaten: Jetzt sollen nur Eingaben akzeptiert werden, die auf 01 enden. Z0 = Start, Z1 = „zuletzt 0 gelesen“, ZE = „zuletzt 01 gelesen“.', zustaende: ['Z0', 'Z1', 'ZE'], alphabet: ['0', '1'], ziel: (w) => w.endsWith('01'), maxLaenge: 7, beispiel: '1101',
        loesung: { ende: ['ZE'], delta: { Z0: { 0: 'Z1', 1: 'Z0' }, Z1: { 0: 'Z1', 1: 'ZE' }, ZE: { 0: 'Z1', 1: 'Z0' } } } }],
    tipps: ['Bei einer 1 geht DEA 1 immer zurück nach Z0.', 'Für „endet auf 01“: Nach einer 0 bist du immer in Z1 – egal wo du vorher warst.', 'Aus ZE führt eine 1 zurück nach Z0, eine 0 nach Z1.'] }),
  B10_FR({ id: 'xf6', kapitel: 115, knobel: true, ico: '🧩', titel: 'Beginnt mit a, endet mit b', lohn: 85,
    ziel: 'Die Wörter über {a, b}, die mit a beginnen und mit b enden – als regulärer Ausdruck a(a|b)*b. Bau dazu den DEA – mit einem Fehlerzustand ZF.',
    fragen: [{ art: 'automat', text: 'Beginnt mit a, endet mit b. Z0 = Start, Z1 = „mit a begonnen, zuletzt a“, ZE = „mit a begonnen, zuletzt b“, ZF = Fehlerzustand (kein Zurück).', zustaende: ['Z0', 'Z1', 'ZE', 'ZF'], alphabet: ['a', 'b'], ziel: (w) => /^a(a|b)*b$/.test(w), maxLaenge: 6, beispiel: 'abab',
      loesung: { ende: ['ZE'], delta: { Z0: { a: 'Z1', b: 'ZF' }, Z1: { a: 'Z1', b: 'ZE' }, ZE: { a: 'Z1', b: 'ZE' }, ZF: { a: 'ZF', b: 'ZF' } } } },
    W('Was passiert im Fehlerzustand?', ['Der Automat bleibt bis zum Ende dort – die Eingabe ist falsch.', 'Er springt zurück zum Startzustand Z0.', 'Die Eingabe wird trotzdem akzeptiert.'], 0)],
    tipps: ['Beginnt das Wort mit b, ist es verloren → ZF.', 'Danach entscheidet nur das zuletzt gelesene Zeichen: a → Z1, b → ZE.'] }),
);

// --- Neue Aufträge (Didaktik-Prüfung 2026-11-13): Belegungstabelle selbst ausfüllen, k-Means als Pflicht, reguläre Ausdrücke selbst schreiben ---
const B10_nach = (id, h) => HOEFE.splice(HOEFE.findIndex((x) => x.id === id) + 1, 0, h);
function B10_spurDoppel() {
  let x = 2, y = 0, n = 0;
  const z = [['vor der Schleife', x, y]];
  while (x < 30) { y = y + x; x = x * 2; n++; z.push([`Durchlauf ${n}`, x, y]); }
  return z;
}
B10_nach('xb2', B10_VO({ id: 'xb2b', kapitel: 111, ico: '✍️', titel: 'Belegung selbst eintragen', lohn: 65, titelAnsicht: 'Tabelle der Variablen',
  tabelle: B10_beleg(['Schritt', 'x', 'y'], B10_spurDoppel(), 'Füll die Tabelle im Kopf oder im Hefter aus – Zeile für Zeile, nach jedem Schleifendurchlauf. Wie viele Zeilen es werden, findest du selbst heraus.'),
  ziel: 'Jetzt füllst du die Belegungstabelle selbst aus: Trag nach jedem Schleifendurchlauf die Werte von x und y ein.',
  code: 'x = 2\ny = 0\nwhile x < 30:\n    y = y + x\n    x = x * 2\nprint(x)\nprint(y)',
  fragen: [{ art: 'liste', text: 'Spalte x: Welche Werte hat x nach dem 1., 2., 3. … Durchlauf? (mit Leerzeichen)', soll: () => B10_spurDoppel().slice(1).map((z) => z[1]) },
    { art: 'liste', text: 'Spalte y: Welche Werte hat y nach dem 1., 2., 3. … Durchlauf? (mit Leerzeichen)', soll: () => B10_spurDoppel().slice(1).map((z) => z[2]) },
    { art: 'zahl', text: 'Wie oft läuft die Schleife?', soll: () => B10_spurDoppel().length - 1 },
    { art: 'zahl', text: 'Was gibt print(y) am Ende aus?', soll: (l) => B10_zahl(l, -1) }],
  tipps: ['Vor der Schleife: x = 2, y = 0. Ist 2 < 30? Dann läuft der 1. Durchlauf: erst y = 0 + 2, dann x = 2 · 2.', 'Die Bedingung x < 30 wird VOR jedem Durchlauf geprüft – mit dem neuen x.', 'Die Reihenfolge im Schleifenkörper zählt: y bekommt das alte x, bevor x verdoppelt wird.'] }));

// k-Means von Hand: 7 Einsatzorte, Start Z1 = A, Z2 = C (wie im Kurs: zuordnen, Mittelpunkt berechnen, wiederholen)
const B10_ORTE = { A: [1, 2], B: [2, 1], C: [3, 3], D: [6, 6], E: [8, 5], F: [7, 8], G: [5, 5] };
function B10_kmeans2D() {
  const n = Object.keys(B10_ORTE), d = (p, z) => (p[0] - z[0]) ** 2 + (p[1] - z[1]) ** 2, mitte = (g) => [0, 1].map((k) => g.reduce((s, x) => s + B10_ORTE[x][k], 0) / g.length);
  let z1 = B10_ORTE.A, z2 = B10_ORTE.C;
  const r = [];
  for (let i = 0; i < 3; i++) {
    const g1 = n.filter((x) => d(B10_ORTE[x], z1) <= d(B10_ORTE[x], z2)), g2 = n.filter((x) => !g1.includes(x));
    z1 = mitte(g1); z2 = mitte(g2);
    r.push({ g1, g2, z1, z2 });
  }
  return r;
}
function B10_kmeansBild() {
  const k = 34, P = (x, y) => [20 + x * k, 300 - y * k];
  const gitter = [...Array(10)].map((_, i) => `<line x1="${P(i, 0)[0]}" y1="${P(0, 0)[1]}" x2="${P(i, 0)[0]}" y2="${P(0, 8.5)[1]}" stroke="#3a4a6a" stroke-width="1"/>
    <line x1="${P(0, 0)[0]}" y1="${P(0, i)[1]}" x2="${P(9, 0)[0]}" y2="${P(0, i)[1]}" stroke="#3a4a6a" stroke-width="1"/>
    <text x="${P(i, 0)[0]}" y="${P(0, 0)[1] + 14}" font-size="10" fill="#aab" text-anchor="middle">${i}</text><text x="${P(0, i)[0] - 8}" y="${P(0, i)[1] + 4}" font-size="10" fill="#aab" text-anchor="end">${i}</text>`).join('');
  const orte = Object.entries(B10_ORTE).map(([n, [x, y]]) => `<circle cx="${P(x, y)[0]}" cy="${P(x, y)[1]}" r="6" fill="#ffd84a"/><text x="${P(x, y)[0] + 8}" y="${P(x, y)[1] - 6}" font-size="13" font-weight="700" fill="#fff">${n}</text>`).join('');
  const zen = [['Z1', B10_ORTE.A, '#e05a4a'], ['Z2', B10_ORTE.C, '#4a9ae0']].map(([n, [x, y], f]) => `<rect x="${P(x, y)[0] - 9}" y="${P(x, y)[1] - 9}" width="18" height="18" fill="none" stroke="${f}" stroke-width="3"/><text x="${P(x, y)[0] - 12}" y="${P(x, y)[1] + 22}" font-size="12" font-weight="700" fill="${f}">${n}</text>`).join('');
  return `<svg viewBox="0 0 340 320" class="dssvg" style="max-width:420px">${gitter}${orte}${zen}</svg>
    <p class="hinweis">Gelbe Punkte = Einsatzorte. Start: Zentrum Z1 liegt auf A, Zentrum Z2 auf C (Quadrate). Abstand zum Quadrat: (x₁ − x₂)² + (y₁ − y₂)². Bei Gleichstand gewinnt Z1.</p>`;
}
B10_nach('xe3', B10_FR({ id: 'xe5', kapitel: 114, ico: '🧲', titel: 'k-Means von Hand', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Einsatzorte',
  tabelle: B10_bild(B10_kmeansBild()),
  ziel: 'Zwei Drohnen sollen so stehen, dass sie ihre Einsatzorte schnell erreichen. Führe das Verfahren k-Means mit k = 2 von Hand aus: Punkte zuordnen, Zentren neu berechnen – zwei Runden lang.',
  merke: { titel: '🧲 k-Means', text: 'k-Means teilt Daten in k Cluster: 1. Jeder Punkt kommt zum nächsten Zentrum. 2. Jedes Zentrum wandert in die Mitte (Durchschnitt der x- und der y-Werte) seiner Punkte. Das wiederholt man, bis sich die Gruppen nicht mehr ändern. Es ist unüberwachtes Lernen: Niemand sagt vorher, welche Gruppe richtig ist.', code: 'Mitte von (1, 2) und (2, 1):\nx = (1 + 2) / 2 = 1,5\ny = (2 + 1) / 2 = 1,5' },
  fragen: [{ art: 'liste', menge: true, text: 'Runde 1: Welche Orte kommen zum Zentrum Z1? (Buchstaben mit Leerzeichen)', soll: () => B10_kmeans2D()[0].g1 },
    { art: 'zahl', text: 'Runde 1: Z2 wandert in die Mitte seiner Orte. Welche x-Koordinate hat das neue Z2?', soll: () => B10_kmeans2D()[0].z2[0], tol: 0.01 },
    { art: 'zahl', text: 'Und welche y-Koordinate hat das neue Z2?', soll: () => B10_kmeans2D()[0].z2[1], tol: 0.01 },
    { art: 'liste', menge: true, text: 'Runde 2: Ordne mit den neuen Zentren noch einmal zu. Welche Orte gehören jetzt zu Z1?', soll: () => B10_kmeans2D()[1].g1 },
    { art: 'zahl', text: 'Runde 2: Welche x-Koordinate hat Z2 danach?', soll: () => B10_kmeans2D()[1].z2[0], tol: 0.01 },
    W('Würde sich in Runde 3 noch etwas ändern?', ['Nein – die Gruppen bleiben gleich, das Verfahren ist fertig.', 'Ja – C wechselt wieder zurück zum Zentrum Z2.', 'Ja – G wechselt hinüber zum Zentrum Z1.', 'Ja – k-Means hört nie von selbst auf.'], 0)],
  tipps: ['Runde 1: Berechne für jeden Ort den Abstand zum Quadrat zu Z1 = (1, 2) und zu Z2 = (3, 3).', 'Neues Zentrum = Durchschnitt: alle x-Werte der Gruppe addieren und durch die Anzahl teilen, ebenso die y-Werte.', 'In Runde 2 liegt Z1 bei (1,5 | 1,5) – C ist jetzt näher an Z1.'] }));
// Den Merke-Text hat jetzt xe5 (Pflicht); xe4 (Knobelhof) verfolgt dasselbe Verfahren im Code
{ const h = HOEFE.find((x) => x.id === 'xe4'); if (h) delete h.merke; }

// ✍️ Reguläre Ausdrücke selbst schreiben: als Python-Text, geprüft mit Wörtern, die passen bzw. nicht passen müssen (JS-RegExp, ganzes Wort)
const B10_RE_TESTS = [
  { name: 'plz', was: 'Postleitzahl', gut: ['01069', '09111', '80331', '10115'], schlecht: ['1069', '010690', '0106a', '01 069', 'D-01069'],
    geheimGut: ['04109', '99084', '53111'], geheimSchlecht: ['123456', '4109'] },
  { name: 'kennzeichen', was: 'Kfz-Kennzeichen', gut: ['DD-AB 123', 'L-X 7', 'MEI-KL 4711', 'B-AB 12'], schlecht: ['dd-AB 123', 'DD AB 123', 'DDDD-A 1', 'DD-ABC 12', 'DD-AB 12345', 'DD-AB'],
    geheimGut: ['HH-Z 9999', 'PIR-E 55', 'M-QR 1'], geheimSchlecht: ['DD-AB1', 'D1-AB 12'] },
  { name: 'uhrzeit', was: 'Uhrzeit', gut: ['07:30', '23:59', '00:00', '19:05', '12:45'], schlecht: ['7:30', '24:00', '12:60', '1230', '12:5', '29:10'],
    geheimGut: ['08:15', '20:40', '13:07'], geheimSchlecht: ['25:00', '23:61'] },
];
// geheimGut/geheimSchlecht werden nicht angezeigt: wer nur die sichtbaren Wörter mit | aufzählt, fällt hier durch (Didaktik-Nachprüfung)
function B10_rePruef(wert, k) {
  const t = B10_RE_TESTS[k];
  if (typeof wert !== 'string' || !wert) return `${t.name}: Schreib das Muster als Text in Anführungszeichen, z. B. ${t.name} = "[0-9]"`;
  let re;
  try { re = new RegExp(`^(?:${wert})$`); } catch (e) { return `${t.name}: „${wert}“ ist kein gültiger regulärer Ausdruck (Klammern vollständig?).`; }
  const nein = t.gut.find((w) => !re.test(w));
  if (nein) return `${t.name}: „${nein}“ ist eine richtige ${t.was} – dein Muster passt aber nicht darauf.`;
  const doch = t.schlecht.find((w) => re.test(w));
  if (doch) return `${t.name}: „${doch}“ ist keine richtige ${t.was} – dein Muster lässt es aber durch.`;
  if (t.geheimGut.some((w) => !re.test(w)) || t.geheimSchlecht.some((w) => re.test(w))) {
    return `${t.name}: Dein Muster passt nur auf die Beispiele – die Wache hat noch weitere, geheime Wörter geprüft, und da stimmt es nicht. Beschreib den Aufbau mit Bausteinen wie [0-9] und {…}, statt Wörter aufzuzählen.`;
  }
  return null;
}
B10_nach('xf4', B10_K({ id: 'xf7', kapitel: 115, sortArt: 'funktion', ico: '🧵', titel: 'Muster selbst schreiben', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Reguläre Ausdrücke',
  tabelle: B10_bild(`${B10_REGEX}<div class="dbtitel">Diese Wörter prüft die Wache</div>${B10_RE_TESTS.map((t) => `<p class="mono"><b>${t.name}</b> ✓ ${t.gut.map(B10_esc).join(' · ')}<br>✗ ${t.schlecht.map(B10_esc).join(' · ')}</p>`).join('')}`),
  ziel: 'Schreib drei reguläre Ausdrücke als Text: plz für eine Postleitzahl (genau 5 Ziffern), kennzeichen für ein Kfz-Kennzeichen wie „DD-AB 123“ (1–3 Großbuchstaben, Strich, 1–2 Großbuchstaben, Leerzeichen, 1–4 Ziffern) und uhrzeit für eine Uhrzeit von 00:00 bis 23:59.',
  vorlage: 'plz = ""\nkennzeichen = ""\nuhrzeit = ""',
  listen: [[], [], []], aufrufFn: (l, k) => B10_RE_TESTS[k].name, testName: (k) => B10_RE_TESTS[k].was,
  pruefWert: B10_rePruef, okText: (w, k) => `${B10_RE_TESTS[k].was}: „${w}“ ✓`,
  tipps: ['Eine Ziffer ist [0-9], genau fünf Ziffern: [0-9]{5}.', 'Kennzeichen: [A-Z]{1,3} für 1–3 Großbuchstaben, danach ein Strich -, dann [A-Z]{1,2}, ein Leerzeichen und [0-9]{1,4}.', 'Uhrzeit: Die Stunde ist entweder 0 oder 1 mit einer beliebigen Ziffer – oder 2 mit 0 bis 3: ([01][0-9]|2[0-3]). Danach : und die Minuten [0-5][0-9].'],
  loesung: 'plz = "[0-9]{5}"\nkennzeichen = "[A-Z]{1,3}-[A-Z]{1,2} [0-9]{1,4}"\nuhrzeit = "([01][0-9]|2[0-3]):[0-5][0-9]"' }));

// Notenrechner (xa5) und Pacman (xa6) brauchen def/return – die kommen erst in Kapitel 112 (Didaktik-Prüfung). Dorthin verschieben:
// xa5 hinter xc5 (Rückgabewert), xa6 als Knobelhof ans Ende.
for (const [id, nach] of [['xa5', 'xc5'], ['xa6', 'xc7']]) {
  const [h] = HOEFE.splice(HOEFE.findIndex((x) => x.id === id), 1);
  h.kapitel = 112;
  HOEFE.splice(HOEFE.findIndex((x) => x.id === nach) + 1, 0, h);
}

// --- 📓 Heft: Merke je Kapitel ---
HEFT_EXTRA[110] = { titel: 'Datentypen und Verzweigungen', text: ['Einfache Datentypen: integer (ganze Zahl), float (Gleitkommazahl mit Punkt), boolean (True/False), string (Zeichenkette in Anführungszeichen).', '/ ergibt einen float, // ist die ganzzahlige Division, % der Rest (Modulo), ** das Potenzieren.', 'Bedingungen verknüpft man mit and, or und not; if … elif … else ist eine Mehrfachverzweigung.'], code: 'if (a > b and b > c):\n    print(c, "ist die kleinste Zahl")\nelif (a < b):\n    print(a, "ist kleiner")\nelse:\n    print("sonst")' };
HEFT_EXTRA[111] = { titel: 'Fehler finden', text: ['Syntax = Schreibregeln, Semantik = Bedeutung. Syntaxfehler meldet Python vor dem Start, Fehler in der Logik liefern still ein falsches Ergebnis.', 'Debugging: Fehler systematisch finden – mit einer Tabelle der Variablenbelegung oder dem Debugger (Thonny 🐞, F7).', 'range(start, ende) hört bei ende − 1 auf.'], code: 'for i in range(1, n + 1):   # 1 bis n\n    summe = summe + i' };
HEFT_EXTRA[112] = { titel: 'Unterprogramme', text: ['Ein Unterprogramm (Funktion) wird mit def definiert und läuft erst beim Aufruf; Parameter stehen in Klammern, return gibt einen Wert zurück.', 'Lokale Variablen gibt es nur in ihrer Funktion, globale überall – lokale werden bevorzugt.', 'Modularisierung: ein Problem in Teilprobleme zerlegen; Funktionen aus Bibliotheken holt man mit import.'], code: 'def quadrat(x):\n    return x * x\n\nprint(quadrat(3))\nfrom random import randint' };
HEFT_EXTRA[113] = { titel: 'Listen', text: ['Eine Liste ist eine geordnete Sammlung von Werten: tiere = ["Hund", "Katze"]. Der Index beginnt bei 0.', 'append hängt hinten an, insert(index, wert) fügt ein, del liste[index] und remove(wert) löschen.', 'Mit for x in liste durchläuft man alle Elemente, z. B. um Summe oder Durchschnitt zu berechnen.'], code: 'noten = [2, 3, 1]\nsumme = 0\nfor note in noten:\n    summe = summe + note\nprint(summe / len(noten))' };
HEFT_EXTRA[114] = { titel: 'Maschinelle Entscheidungen', text: ['Überwachtes Lernen nutzt Daten mit Labels, unüberwachtes Lernen Daten ohne Labels.', 'Clustering teilt Daten in Gruppen mit ähnlichen Merkmalen (z. B. k-Means), Kategorisierung ordnet Neues einer bestehenden Gruppe zu.', 'Maschinen entscheiden nach Regeln oder gelernten Mustern – verantwortlich bleiben die Menschen.'], code: '# Entscheidungsregel als Funktion (Beispiel)\ndef darf_baden(grad, gewitter):\n    return grad >= 20 and not gewitter' };
HEFT_EXTRA[115] = { titel: 'Formale Sprachen und Automaten', text: ['Alphabet = endliche, nichtleere Menge von Zeichen; Wort = Zeichenkette aus dem Alphabet; Sprache = Teilmenge der Wörter.', 'Reguläre Ausdrücke beschreiben einfache Sprachen: | oder, * beliebig oft, + mindestens einmal; man nutzt sie zum Suchen, Ersetzen und Validieren.', 'Ein endlicher Automat (Akzeptor) liest zeichenweise; endet er im Endzustand, wird die Eingabe akzeptiert. Eine Grammatik erzeugt eine Sprache.'], code: 'a(a|b)*b          beginnt mit a, endet mit b\n[0-9]{2}\\.[0-9]{2}\\.[0-9]{4}   Datum' };
