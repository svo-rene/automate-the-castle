'use strict';
// --- ➕ Zusatzkapitel für bestehende LK-Burgen (nach OPAL INFO_LK: LB 2/3 Programmieren und Algorithmen, LB 10/11 KI, LB 4/5 OOP, LB 2/3 Datenstrukturen, Abiturvorbereitung) ---
// Burg 21 (🌾 Kornspeicher, KORN): 150 Algorithmen untersuchen · 151 Doppelte Rekursion
// Burg 22 (🔭 Sternwarte, STERN/FRAGEN): 152 Genetische Algorithmen · 153 Sprachmodelle
// Burg 23 (🔧 Werkstatt, WERK/WFRAGEN): 154 Fremden Code lesen und testen
// Burg 24 (🐎 Poststation, POST/PFRAGEN): 155 Backtracking: Sudoku
// Alle obersten Namen mit Präfix PA_, Hof-Ids ma…–mf…

KAPITEL[150] = { name: 'Algorithmen untersuchen', ico: '🔍' };
KAPITEL[151] = { name: 'Doppelte Rekursion', ico: '🐇' };
KAPITEL[152] = { name: 'Genetische Algorithmen', ico: '🧬' };
KAPITEL[153] = { name: 'Sprachmodelle', ico: '💬' };
KAPITEL[154] = { name: 'Fremden Code lesen und testen', ico: '🧪' };
KAPITEL[155] = { name: 'Backtracking: Sudoku', ico: '🔢' };
BURGEN[21].kapitel.push(150, 151);
BURGEN[22].kapitel.push(152, 153);
BURGEN[23].kapitel.push(154);
BURGEN[24].kapitel.push(155);

const PA_esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PA_code = (src) => `<pre class="dscode mono">${PA_esc(src)}</pre>`;

// =====================================================================================================
// Burg 21 · Kapitel 150: 🔍 Algorithmen untersuchen (LB 2/3: 2.1.2 Algorithmus, 2.1 Unterprogramme, Suchen, Abi 2025 B Bucketsort)
// =====================================================================================================
const PA_EIGENSCHAFTEN = ['Terminierung', 'Determiniertheit', 'Ausführbarkeit', 'Determinismus (nächster Schritt eindeutig)', 'Dynamische Finitheit', 'Finitheit (Beschreibung endlich lang)'];
const PA_EW = (text, code, richtig) => ({ art: 'wahl', text, html: PA_code(code), optionen: PA_EIGENSCHAFTEN, richtig });
const PA_C_UNTER = `zaehler = 0

def zaehle_schwere(a, grenze):
    global zaehler
    anzahl = 0
    for sack in a:
        if sack > grenze:
            anzahl = anzahl + 1
            zaehler = zaehler + 1
    return anzahl

def verdopple(grenze):
    grenze = grenze * 2
    return grenze

def leere_ersten(liste):
    liste[0] = 0

def versuch(a):
    grenze = 5
    x = zaehle_schwere(a, grenze)
    neu = verdopple(grenze)
    y = zaehle_schwere(a, neu)
    leere_ersten(a)
    return {"x": x, "y": y, "grenze": grenze, "zaehler": zaehler, "erster": a[0]}`;
const PA_C_SEQ = 'def sequenzielle_suche(a, x):\n    for i in range(len(a)):\n        if a[i] == x:\n            return i\n    return -1';
const PA_C_BIN = 'def binaere_suche(a, x):\n    links = 0\n    rechts = len(a) - 1\n    while links <= rechts:\n        mitte = (links + rechts) // 2\n        if a[mitte] == x:\n            return mitte\n        if a[mitte] < x:\n            links = mitte + 1\n        else:\n            rechts = mitte - 1\n    return -1';
const PA_SEQ_L = [zufallsListe(8, 131), zufallsListe(10, 132), zufallsListe(7, 133), zufallsListe(9, 134)];
const PA_SEQ_X = [PA_SEQ_L[0][5], PA_SEQ_L[1][0], 100, PA_SEQ_L[3][8]];
const PA_C_BUCKET = 'def bucketsort(a, k):\n    eimer = []\n    for i in range(k):\n        eimer.append([])\n    for x in a:\n        eimer[x // 10].append(x)\n    ergebnis = []\n    for e in eimer:\n        for x in sorted(e):\n            ergebnis.append(x)\n    return ergebnis';
// Bucketsort ohne sorted (Nutzerwunsch 2026-11-13): jeder Eimer mit dem eigenen insertionsort (aus ks2, steht im vorspann)
const PA_L_BUCKET = 'def bucketsort(a):\n    eimer = []\n    for i in range(10):\n        eimer.append([])\n    for x in a:\n        eimer[x // 10].append(x)\n    ergebnis = []\n    for e in eimer:\n        insertionsort(e)\n        for x in e:\n            ergebnis.append(x)\n    return ergebnis';

// --- Kapitel 151: 🐇 Doppelte Rekursion (Fibonacci, Aufrufe zählen) ---
const PA_C_FIB = 'def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)';
const PA_aufrufe = (n) => (n <= 1 ? 1 : 1 + PA_aufrufe(n - 1) + PA_aufrufe(n - 2));
const PA_fib = (n) => { let a = 0, b = 1; for (let i = 0; i < n; i++) { const t = a + b; a = b; b = t; } return a; };
const PA_AUF_N = [0, 1, 2, 5, 10];
const PA_FIB_N = [10, 30, 50, 70];

HOEFE.push(
  // --- Kapitel 150: 🔍 Algorithmen untersuchen ---
  KORN({ id: 'ma1', kapitel: 150, sortArt: 'fragen', listen: [], ico: '🔍', titel: 'Ist das ein Algorithmus?', lohn: 65,
    ziel: 'Prüf jeden Code auf die Eigenschaften eines Algorithmus: Welche Eigenschaft fehlt?',
    story: 'Ein reisender Händler will der Müllerei seine „Wunder-Rezepte“ verkaufen. Bevor Greta etwas kauft, prüft sie jedes Rezept genau: Endet es immer? Kommt immer dasselbe heraus? Kann man jeden Schritt wirklich ausführen?',
    merke: { titel: '🔍 Eigenschaften eines Algorithmus', text: 'Ein Algorithmus ist endlich beschrieben (Finitheit) und braucht zu jedem Zeitpunkt nur endlich viel Speicher (dynamische Finitheit). Jeder Schritt ist ausführbar, der nächste Schritt ist eindeutig (Determinismus), er endet für jede zulässige Eingabe (Terminierung) und liefert bei gleicher Eingabe dasselbe Ergebnis (Determiniertheit).' },
    fragen: [
      PA_EW('Ruf schaetze_gewicht in Gedanken zweimal mit denselben Säcken auf. Welche Eigenschaft fehlt?', 'def schaetze_gewicht(a):\n    return a[zufall(len(a))]   # zufall: Zufallszahl 0 … n−1', 1),
      PA_EW('Spiel den Aufruf zaehle_bis(3) von Hand durch. Welche Eigenschaft fehlt?', 'def zaehle_bis(n):\n    i = 0\n    while i != n:\n        i = i + 2\n    return i', 0),
      PA_EW('Was passiert bei einer leeren Liste? Welche Eigenschaft fehlt dann?', 'def mittel(a):\n    return sum(a) / len(a)', 2),
      PA_EW('Rezept des Händlers. Welche Eigenschaft fehlt?', '1. Nimm einen Sack.\n2. Nimm irgendeinen anderen Sack, der dir gefällt.\n3. Leg den schwereren nach hinten.', 3),
      PA_EW('Welche Eigenschaft ist hier – neben der Terminierung – noch verletzt?', 'def sammle():\n    a = []\n    while True:\n        a.append(1)', 4),
      W('Ein Webserver soll absichtlich nie anhalten. Was gilt?', ['Er ist kein brauchbares Programm', 'Man lockert bewusst die Terminierung – erweiterter Algorithmusbegriff', 'Er ist nicht ausführbar', 'Er ist nicht determiniert'], 1)],
    tipps: ['Terminierung: endet er? Determiniertheit: gleiches Ergebnis bei gleicher Eingabe? Ausführbarkeit: geht jeder Schritt (auch Teilen durch 0)?', 'Determinismus: Steht der nächste Schritt eindeutig fest?'] }),
  KORN({ id: 'ma2', kapitel: 150, sortArt: 'vorher', funktion: 'versuch', ico: '🔮', titel: 'Wer sieht welche Variable?', lohn: 65,
    ziel: 'Drei Unterprogramme, eine globale Variable. Sag voraus, welche Werte versuch(a) zurückgibt.',
    listen: [[3, 8, 12, 5, 7]], code: PA_C_UNTER,
    merke: { titel: '📦 Unterprogramme und Parameter', text: 'Ein Unterprogramm bekommt beim Aufruf Argumente über seine Parameter und gibt mit return ein Ergebnis zurück. Variablen, die darin entstehen, sind lokal: Außerhalb gibt es sie nicht. Eine globale Variable steht außerhalb aller Funktionen; ändern darf eine Funktion sie nur mit global.', code: 'def flaeche(breite, hoehe):   # Parameter\n    f = breite * hoehe         # lokale Variable\n    return f\n\nprint(flaeche(3, 4))          # Argumente 3 und 4' },
    fragen: [{ art: 'zahl', text: 'Welchen Wert hat x (Säcke schwerer als 5)?', soll: (l) => l.wert.x },
      { art: 'zahl', text: 'Welchen Wert hat y?', soll: (l) => l.wert.y },
      { art: 'zahl', text: 'Welchen Wert hat grenze in versuch, nachdem verdopple(grenze) aufgerufen wurde?', soll: (l) => l.wert.grenze,
        erklaerung: 'Python übergibt eine Referenz auf das Objekt (call by sharing). grenze = grenze * 2 hängt nur den lokalen Namen in verdopple um – für den Aufrufer wirkt das wie ein Werteparameter.' },
      { art: 'zahl', text: 'Welchen Wert hat die globale Variable zaehler am Ende?', soll: (l) => l.wert.zaehler, erklaerung: 'zaehler ist global und zählt über beide Aufrufe weiter.' },
      { art: 'zahl', text: 'Welchen Wert hat a[0] in versuch, nachdem leere_ersten(a) aufgerufen wurde?', soll: (l) => l.wert.erster,
        erklaerung: 'liste und a zeigen auf dieselbe Liste. Wird die Liste über den Parameter verändert, sieht der Aufrufer die Änderung.' },
      W('Was passiert, wenn in versuch die Zeile print(anzahl) steht?', ['Es wird 3 ausgegeben', 'Es gibt eine Fehlermeldung – anzahl ist lokal in zaehle_schwere und existiert in versuch nicht', 'Es wird 0 ausgegeben', 'Es wird der Wert von zaehler ausgegeben'], 1)],
    tipps: ['verdopple bekommt nur den Wert 5. Es rechnet mit seiner eigenen, lokalen Variablen grenze.', 'zaehler zählt bei beiden Aufrufen von zaehle_schwere weiter, weil er global ist.'] }),
  KORN({ id: 'ma3', kapitel: 150, sortArt: 'funktion', funktion: 'sequenzielle_suche', zielArt: 'wert', ico: '🔦', titel: 'Sack für Sack', lohn: 60,
    ziel: `Die Säcke stehen ungeordnet. Schreib sequenzielle_suche(a, x): die Position des ersten Sacks mit Gewicht x, sonst −1. Hör auf, sobald du ihn gefunden hast. Gesucht wird in Liste ${PA_SEQ_X.map((x, i) => `${'ABCD'[i]} das Gewicht ${x}`).join(', ')}.`,
    listen: PA_SEQ_L, aufrufFn: (l, k) => `sequenzielle_suche(a, ${PA_SEQ_X[k]})`, soll: (l, k) => l.indexOf(PA_SEQ_X[k]), testName: (k) => `Liste ${'ABCD'[k]}, gesucht ${PA_SEQ_X[k]}`,
    grenze: (liste, l) => (l.v > liste.length ? `${l.v} Vergleiche bei nur ${liste.length} Säcken – jeder Sack muss höchstens einmal angeschaut werden.` : null),
    befehle: [K_B('def sequenzielle_suche(a, x):'), K_B('for i in range(len(a)):'), K_B('return ¦')],
    merke: { titel: '🔦 Sequenzielle Suche', text: 'Die sequenzielle (lineare) Suche schaut die Werte der Reihe nach an, bis sie den gesuchten findet. Bester Fall: Er steht vorn (1 Vergleich, O(1)). Schlechtester Fall: Er steht hinten oder fehlt (n Vergleiche, O(n)) – dafür muss die Liste nicht sortiert sein.' },
    tipps: ['Geh mit einer Schleife über alle Positionen i.', 'Ist a[i] == x, gib sofort i zurück.', 'Nach der Schleife wurde nichts gefunden: return -1'],
    loesung: PA_C_SEQ }),
  KORN({ id: 'ma4', kapitel: 150, sortArt: 'messen', ico: '🔬', titel: 'Wer findet schneller?', lohn: 70,
    ziel: 'Miss die sequenzielle Suche im besten und im schlechtesten Fall und vergleiche mit der binären Suche.',
    code: PA_C_SEQ + '\n\n' + PA_C_BIN,
    messen: { groessen: [16, 32, 64, 128, 256, 512], aufrufe: [{ name: 'sequenziell, bester Fall', aufruf: 'sequenzielle_suche(a, a[0])', liste: 'sortiert' }, { name: 'sequenziell, fehlt', aufruf: 'sequenzielle_suche(a, n + 1)', liste: 'sortiert' }, { name: 'binär, fehlt', aufruf: 'binaere_suche(a, n + 1)', liste: 'sortiert' }] },
    fragen: [W('Bester Fall der sequenziellen Suche:', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 0),
      W('Schlechtester Fall der sequenziellen Suche:', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2),
      W('Schlechtester Fall der binären Suche:', ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 1),
      { art: 'zahl', text: 'Wie viele Vergleiche braucht die sequenzielle Suche bei n = 512, wenn der Wert fehlt?', soll: (l, m) => m[1].at(-1) },
      W('Was muss für die binäre Suche gelten – und für die sequenzielle nicht?', ['Die Liste muss sortiert sein', 'Die Liste darf keine doppelten Werte haben', 'Die Länge muss eine Zweierpotenz sein', 'Der Wert muss vorkommen'], 0)],
    tipps: ['Vergleiche, wie die Spalten wachsen, wenn n sich verdoppelt: gleich bleiben, verdoppeln oder um einen festen Betrag wachsen?', 'Die binäre Suche macht pro Runde zwei Vergleiche (== und <).'] }),
  KORN({ id: 'ma5', kapitel: 150, sortArt: 'vorher', funktion: 'bucketsort', aufruf: 'bucketsort(a, 6)', ico: '🪣', titel: 'Eimer für Eimer', lohn: 65,
    ziel: 'Ein unbekanntes Verfahren: Bucketsort. Lies den Code und führ ihn von Hand aus, bevor er läuft.',
    story: 'Der Händler hat doch ein gutes Rezept: Stell Eimer auf, einen für 0–9 kg, einen für 10–19 kg und so weiter. Wirf jeden Sack in seinen Eimer, sortiere die Eimer einzeln und schütte sie der Reihe nach aus.',
    listen: [[27, 14, 35, 8, 19, 42, 11, 38]], code: PA_C_BUCKET,
    merke: { titel: '🪣 Bucketsort', text: 'Bucketsort verteilt die Werte nach ihrem Bereich auf Eimer (Buckets), sortiert jeden Eimer einzeln und hängt die Eimer der Reihe nach aneinander. Sind die Werte gleichmäßig verteilt, liegen in jedem Eimer nur wenige – dann braucht er etwa O(n). Landet alles in einem Eimer, ist er so langsam wie das Verfahren im Eimer.', code: 'for x in a:\n    eimer[x // 10].append(x)' },
    fragen: [{ art: 'liste', text: 'Welche Säcke liegen in Eimer 1 (10 bis 19 kg) – in der Reihenfolge, in der sie hineinfallen?', soll: () => [14, 19, 11] },
      { art: 'zahl', text: 'Wie viele der 6 Eimer bleiben leer?', soll: () => 1 },
      { art: 'liste', text: 'Wie lautet das Ergebnis?', soll: (l) => l.wert },
      W('Wann ist Bucketsort besonders schnell?', ['wenn alle Werte gleich groß sind und in einen Eimer fallen', 'wenn die Werte gleichmäßig auf die Eimer verteilt sind', 'wenn die Liste umgekehrt sortiert ist', 'nie – er ist immer O(n²)'], 1)],
    tipps: ['x // 10 ist die Zehnerstelle: 27 // 10 = 2, also Eimer 2.', 'Eimer 0: 8 · Eimer 1: 14, 19, 11 · …'] }),
  KORN({ id: 'ma6', kapitel: 150, sortArt: 'funktion', funktion: 'bucketsort', ico: '🧺', titel: 'Bucketsort programmieren', lohn: 75,
    ziel: 'Schreib bucketsort(a) für Säcke von 1 bis 99 kg: 10 Eimer (Eimer i für i·10 bis i·10 + 9 kg), jeden Sack in seinen Eimer, jeden Eimer sortieren, alles der Reihe nach in eine neue Liste. Gib die neue Liste zurück. Zum Sortieren der Eimer gibt es deinen insertionsort(a) schon.',
    vorspann: C_INSERTION + '\n',
    listen: [zufallsListe(10, 141), zufallsListe(12, 142), [95, 5, 50, 45, 55, 15], [7], []],
    befehle: [K_B('def bucketsort(a):'), K_B('eimer = []'), K_B('return ergebnis')],
    tipps: ['Erst eine Liste mit 10 leeren Listen bauen: for i in range(10): eimer.append([])', 'Sack x kommt in eimer[x // 10].', 'Zum Schluss jeden Eimer mit insertionsort(e) sortieren und Wert für Wert an ergebnis anhängen.'],
    loesung: PA_L_BUCKET }),

  // --- Kapitel 151: 🐇 Doppelte Rekursion ---
  KORN({ id: 'mb1', kapitel: 151, sortArt: 'vorher', funktion: 'fib', aufruf: 'fib(5)', ico: '🐇', titel: 'Kaninchen im Kornspeicher', lohn: 70, stapel: true,
    ziel: 'fib ruft sich zweimal selbst auf. Sag voraus, wie oft – bevor der Aufrufstapel es zeigt.',
    story: 'Im Kornspeicher wohnen Kaninchen, und jeden Monat werden es mehr: 0, 1, 1, 2, 3, 5, 8 … Jede Zahl ist die Summe der beiden davor (Fibonacci). Greta will wissen, wie viel Arbeit es macht, das rekursiv auszurechnen.',
    listen: [[]], code: PA_C_FIB,
    merke: { titel: '🐇 Doppelte Rekursion', text: 'Ruft sich eine Funktion zweimal selbst auf, entsteht ein Aufrufbaum. Beim rekursiven Abstieg kommen neue Aufrufe auf den Stapel, beim Aufstieg geben sie ihr Ergebnis zurück. fib(n) berechnet dieselben Werte immer wieder: Die Zahl der Aufrufe wächst exponentiell, etwa O(2ⁿ).', code: 'def fib(n):\n    if n <= 1:          # Basisfall\n        return n\n    return fib(n - 1) + fib(n - 2)' },
    fragen: [{ art: 'zahl', text: 'Was gibt fib(5) zurück?', soll: (l) => l.wert },
      { art: 'zahl', text: 'Wie oft wird fib insgesamt aufgerufen (der erste Aufruf zählt mit)?', soll: (l) => aufrufZahl(l, 'fib') },
      { art: 'zahl', text: 'Wie oft wird dabei fib(2) aufgerufen?', soll: () => 3 },
      { art: 'zahl', text: 'Wie viele fib-Aufrufe liegen höchstens gleichzeitig auf dem Stapel?', soll: (l) => maxTiefe(l, 'fib') }],
    tipps: ['Zeichne den Aufrufbaum: fib(5) ruft fib(4) und fib(3), fib(4) ruft fib(3) und fib(2) …', 'Aufrufe: fib(0) und fib(1) je 1, fib(2) = 1 + 1 + 1 = 3, fib(3) = 1 + 3 + 1 = 5 …', 'Der längste Weg im Baum geht immer nach links: 5, 4, 3, 2, 1.'] }),
  KORN({ id: 'mb2', kapitel: 151, sortArt: 'funktion', funktion: 'aufrufe', rekursiv: 'aufrufe', sprache: S_REK, zielArt: 'wert', ico: '🧮', titel: 'Aufrufe zählen', lohn: 70, stapel: true,
    ziel: 'Schreib aufrufe(n): wie oft fib aufgerufen wird, wenn man fib(n) startet – selbst rekursiv. Für n = 0, 1, 2, 3, 4, 5 sind es 1, 1, 3, 5, 9, 15.',
    listen: PA_AUF_N.map(() => []), aufrufFn: (l, k) => `aufrufe(${PA_AUF_N[k]})`, soll: (l, k) => PA_aufrufe(PA_AUF_N[k]), testName: (k) => `aufrufe(${PA_AUF_N[k]})`,
    befehle: [K_B('def aufrufe(n):'), K_B('if ¦:')],
    tipps: ['fib(0) und fib(1) rufen nichts weiter auf: 1 Aufruf.', 'fib(n) ist selbst 1 Aufruf – dazu alle Aufrufe von fib(n − 1) und von fib(n − 2).', 'return 1 + aufrufe(n - 1) + aufrufe(n - 2)'],
    loesung: 'def aufrufe(n):\n    if n <= 1:\n        return 1\n    return 1 + aufrufe(n - 1) + aufrufe(n - 2)' }),
  KORN({ id: 'mb3', kapitel: 151, sortArt: 'funktion', funktion: 'fib_schnell', zielArt: 'wert', knobel: true, ico: '⚡', titel: 'fib ohne Wartezeit', lohn: 85,
    ziel: 'fib(30) braucht über 2,6 Millionen Aufrufe – das schafft der Kornspeicher nicht. Schreib fib_schnell(n), das fib(n) ohne doppelte Rekursion berechnet (iterativ), auch für n = 70.',
    listen: PA_FIB_N.map(() => []), aufrufFn: (l, k) => `fib_schnell(${PA_FIB_N[k]})`, soll: (l, k) => PA_fib(PA_FIB_N[k]), testName: (k) => `fib_schnell(${PA_FIB_N[k]})`,
    befehle: [K_B('def fib_schnell(n):'), K_B('for i in range(n):')],
    merke: { titel: '🔁 Rekursion in Iteration umwandeln', text: 'Jede Rekursion lässt sich in eine Schleife umwandeln: Statt auf die Ergebnisse kleinerer Aufrufe zu warten, rechnet man von unten nach oben und merkt sich in Variablen nur, was der nächste Schritt braucht. So wird jeder Wert genau einmal berechnet – O(n) statt O(2ⁿ).', code: 'def fakultaet(n):          # rekursiv\n    if n <= 1:\n        return 1\n    return n * fakultaet(n - 1)\n\ndef fakultaet_schleife(n): # iterativ\n    ergebnis = 1\n    for i in range(2, n + 1):\n        ergebnis = ergebnis * i\n    return ergebnis' },
    tipps: ['Merk dir in a und b immer zwei aufeinanderfolgende Fibonacci-Zahlen, am Anfang 0 und 1.', 'In jedem Schleifendurchlauf: neu = a + b, dann a = b und b = neu.', 'Nach n Durchläufen steht fib(n) in a.'],
    loesung: 'def fib_schnell(n):\n    a = 0\n    b = 1\n    for i in range(n):\n        neu = a + b\n        a = b\n        b = neu\n    return a' }),
);

// =====================================================================================================
// Burg 22 · Kapitel 152: 🧬 Genetische Algorithmen (OPAL 11.9, Rucksackproblem) · 153: 💬 Sprachmodelle
// =====================================================================================================
const PA_DINGE = [['Seil', 3, 4], ['Laterne', 4, 5], ['Brot', 2, 3], ['Zelt', 6, 8], ['Fernrohr', 5, 9], ['Heiltrank', 1, 4], ['Karte', 1, 2], ['Kessel', 7, 6]];
const PA_GRENZE = 15;
const PA_fit = (c) => { let g = 0, w = 0; c.forEach((b, i) => { if (b === 1) { g += PA_DINGE[i][1]; w += PA_DINGE[i][2]; } }); return g > PA_GRENZE ? 0 : w; };
const PA_kreuze = (a, b, p) => [...a.slice(0, p), ...b.slice(p)];
const PA_mutiere = (c, s) => c.map((b, i) => (i === s ? 1 - b : b));
function PA_generation(pop, punkte, stellen) {
  const s = pop.slice().sort((x, y) => PA_fit(y) - PA_fit(x));
  const neu = [s[0], s[1]];
  for (let i = 0; i < pop.length - 2; i++) neu.push(PA_mutiere(PA_kreuze(s[0], s[1], punkte[i]), stellen[i]));
  return neu;
}
const PA_START = [[1, 0, 0, 0, 0, 0, 0, 1], [0, 1, 0, 1, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 1, 0, 0], [1, 0, 1, 0, 1, 0, 0, 0]];
function PA_lauf(g) {
  let s = 7;
  const zufall = (n) => { s = (s * 75 + 74) % 65537; return s % n; };
  let pop = PA_START.map((c) => [...c]);
  const beste = [Math.max(...pop.map(PA_fit))];
  for (let r = 0; r < g; r++) {
    const punkte = [], stellen = [];
    for (let i = 0; i < pop.length - 2; i++) punkte.push(1 + zufall(7));
    for (let i = 0; i < pop.length - 2; i++) stellen.push(zufall(8));
    pop = PA_generation(pop, punkte, stellen);
    beste.push(Math.max(...pop.map(PA_fit)));
  }
  return beste;
}
const PA_py = (x) => JSON.stringify(x).replace(/,/g, ', ').replace(/":/g, '": ');
const PA_V_DINGE = `DINGE = ${PA_py(PA_DINGE)}\nGRENZE = ${PA_GRENZE}\n`;
const PA_V_GA = `${PA_V_DINGE}START = ${PA_py(PA_START)}

def fitness(chromosom):
    gewicht = 0
    wert = 0
    for i in range(len(chromosom)):
        if chromosom[i] == 1:
            gewicht = gewicht + DINGE[i][1]
            wert = wert + DINGE[i][2]
    if gewicht > GRENZE:
        return 0
    return wert

def kreuze(eltern1, eltern2, punkt):
    return eltern1[:punkt] + eltern2[punkt:]

def mutiere(chromosom, stelle):
    neu = list(chromosom)
    neu[stelle] = 1 - neu[stelle]
    return neu

_s = [7]
def _zufall(n):
    _s[0] = (_s[0] * 75 + 74) % 65537
    return _s[0] % n

def _beste(pop):
    b = 0
    for c in pop:
        if fitness(c) > b:
            b = fitness(c)
    return b

def _lauf(g):
    _s[0] = 7
    pop = []
    for c in START:
        pop.append(list(c))
    beste = [_beste(pop)]
    for r in range(g):
        punkte = []
        stellen = []
        for i in range(len(pop) - 2):
            punkte.append(1 + _zufall(7))
        for i in range(len(pop) - 2):
            stellen.append(_zufall(8))
        pop = generation(pop, punkte, stellen)
        beste.append(_beste(pop))
    return beste
`;
const PA_DINGE_TAB = () => tabHtml(['Nr.', 'Gegenstand', 'Gewicht', 'Wert'], PA_DINGE.map((d, i) => [i, d[0], d[1], d[2]])) + `<p class="hinweis">Der Rucksack trägt höchstens ${PA_GRENZE} kg. Ein Chromosom wie [1, 0, 1, 0, 0, 0, 0, 0] heißt: Seil und Brot kommen mit.</p>`;
const PA_GA_TEST = [[3, 5, 2, 6], [0, 7, 4, 1]];
const PA_GA_GEN = 12;
const PA_FIT_TESTS = [[1, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 1, 1, 1, 0]];
const PA_KREUZ_A = ['kreuze([1, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], 3)', 'kreuze([1, 0, 1, 0, 1, 0, 1, 0], [0, 0, 1, 1, 0, 0, 1, 1], 5)', 'mutiere([1, 0, 1, 0, 1, 0, 1, 0], 1)', 'mutiere([1, 1, 0, 0], 0)', '_t5()'];
const PA_KREUZ_S = [PA_kreuze([1, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], 3), PA_kreuze([1, 0, 1, 0, 1, 0, 1, 0], [0, 0, 1, 1, 0, 0, 1, 1], 5), PA_mutiere([1, 0, 1, 0, 1, 0, 1, 0], 1), PA_mutiere([1, 1, 0, 0], 0), [[1, 0, 1], [1, 0, 0], [1, 1]]];

// Sprachmodell: Wörter aus einer kleinen Burggeschichte
const PA_TEXT = 'der drache fliegt über die burg . der drache schläft im turm . der ritter sieht den drachen . die burg hat einen turm . der drache fliegt zum turm .';
const PA_WOERTER = PA_TEXT.split(' ');
const PA_folge = (wort) => { const d = {}; for (let i = 0; i < PA_WOERTER.length - 1; i++) if (PA_WOERTER[i] === wort) d[PA_WOERTER[i + 1]] = (d[PA_WOERTER[i + 1]] || 0) + 1; return d; };
const PA_naechstes = (wort) => { const d = PA_folge(wort); let best = null; for (const k of Object.keys(d)) if (best === null || d[k] > d[best]) best = k; return best; };
const PA_FOLGE_T = ['der', 'drache', 'turm', 'burg'];
const PA_NAECH_T = ['der', 'die', 'drache', 'burg', 'fliegt'];
const PA_C_FOLGE = 'def folgewoerter(woerter, wort):\n    zaehler = {}\n    for i in range(len(woerter) - 1):\n        if woerter[i] == wort:\n            f = woerter[i + 1]\n            if f in zaehler:\n                zaehler[f] = zaehler[f] + 1\n            else:\n                zaehler[f] = 1\n    return zaehler';
const PA_C_NAECH = PA_C_FOLGE + '\n\ndef naechstes_wort(woerter, wort):\n    zaehler = folgewoerter(woerter, wort)\n    bestes = None\n    for f in zaehler:\n        if bestes is None or zaehler[f] > zaehler[bestes]:\n            bestes = f\n    return bestes';
const PA_TEXT_HTML = () => ({ html: `<div class="werkbild"><p class="mono" style="line-height:1.7">${PA_esc(PA_TEXT)}</p><p class="hinweis">WOERTER = diese Geschichte als Liste von Wörtern (der Punkt ist ein eigenes Wort).</p></div>` });

HOEFE.push(
  // --- Kapitel 152: 🧬 Genetische Algorithmen ---
  FRAGEN({ id: 'mc1', kapitel: 152, ico: '🎒', titel: 'Der Rucksack des Spähers', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Was kommt in den Rucksack?', tabelle: () => ({ html: PA_DINGE_TAB() }),
    ziel: 'Lerne die Begriffe der genetischen Algorithmen am Rucksackproblem kennen.',
    story: 'Ein Späher bricht zu einer langen Reise auf. Sein Rucksack trägt nur 15 kg, aber alles wäre nützlich. Alle Möglichkeiten durchprobieren? Bei 8 Dingen geht das noch – bei 80 nicht mehr. Vega zeigt dir einen Trick der Natur: Lösungen, die sich fortpflanzen.',
    merke: { titel: '🧬 Genetischer Algorithmus', text: 'Ein genetischer Algorithmus verbessert eine Population von Lösungskandidaten (Chromosomen, z. B. Bitstrings) über viele Generationen: Die Fitnessfunktion bewertet jede Lösung, bei der Selektion dürfen die besten Eltern werden, Crossover mischt zwei Eltern, Mutation ändert zufällig ein Bit. Er findet meist eine gute Näherungslösung, aber nicht garantiert die beste.' },
    fragen: [
      { art: 'zahl', text: 'Chromosom [1, 0, 1, 0, 0, 1, 0, 0]: Wie viele kg wiegt der Rucksack?', soll: () => 6 },
      { art: 'zahl', text: 'Welche Fitness (Gesamtwert) hat dieses Chromosom?', soll: () => PA_fit([1, 0, 1, 0, 0, 1, 0, 0]) },
      { art: 'zahl', text: 'Chromosom [0, 0, 0, 1, 1, 1, 1, 1] wiegt 20 kg. Welche Fitness bekommt es?', soll: () => 0 },
      { art: 'zahl', text: 'Wie viele verschiedene Chromosomen (Packmöglichkeiten) gibt es bei 8 Gegenständen?', soll: () => 256 },
      W('Wozu dient die Mutation?', ['Sie macht die beste Lösung schlechter', 'Sie bringt neue Vielfalt in die Population – damit die Suche nicht bei einer mittelmäßigen Lösung stecken bleibt', 'Sie sortiert die Population', 'Sie berechnet die Fitness'], 1),
      W('Was passiert bei der Selektion?', ['Ein Bit wird zufällig umgedreht', 'Individuen mit hoher Fitness werden bevorzugt – sie werden öfter als Eltern ausgewählt', 'Zwei Eltern werden gemischt', 'Alle Möglichkeiten werden durchprobiert'], 1)],
    tipps: ['Die Einsen stehen an Position 0, 2 und 5: Seil, Brot, Heiltrank.', 'Zu schwere Rucksäcke bekommen die Fitness 0 – sonst würde der Algorithmus zu schwere Rucksäcke züchten.', 'Jedes Bit hat 2 Möglichkeiten: 2 · 2 · … · 2.'] }),
  STERN({ id: 'mc2', kapitel: 152, sortArt: 'funktion', ico: '⚖️', titel: 'Die Fitnessfunktion', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Gegenstände',
    tabelle: (lauf, k) => ({ html: PA_DINGE_TAB() + (lauf ? `<p>Test ${k + 1}: Chromosom ${PA_py(PA_FIT_TESTS[k])} → Fitness <b>${ergebnisText(lauf.wert)}</b></p>` : '') }),
    ziel: 'Schreib fitness(chromosom): Summe der Werte aller eingepackten Gegenstände – aber 0, wenn sie zusammen mehr als GRENZE kg wiegen. DINGE[i] = [Name, Gewicht, Wert].',
    vorspann: PA_V_DINGE, listen: PA_FIT_TESTS.map(() => []), aufrufFn: (l, k) => `fitness(${PA_py(PA_FIT_TESTS[k])})`, soll: (l, k) => PA_fit(PA_FIT_TESTS[k]),
    testName: (k) => ['Seil, Brot, Fernrohr', 'zu schwer', 'leerer Rucksack', 'fünf Dinge'][k],
    befehle: [K_B('def fitness(chromosom):'), K_B('for i in range(len(chromosom)):')],
    tipps: ['Zwei Summen: gewicht und wert, beide starten bei 0.', 'Nur wenn chromosom[i] == 1 ist, zählt Gegenstand i mit.', 'Am Ende: zu schwer → return 0, sonst return wert.'],
    loesung: 'def fitness(chromosom):\n    gewicht = 0\n    wert = 0\n    for i in range(len(chromosom)):\n        if chromosom[i] == 1:\n            gewicht = gewicht + DINGE[i][1]\n            wert = wert + DINGE[i][2]\n    if gewicht > GRENZE:\n        return 0\n    return wert' }),
  STERN({ id: 'mc3', kapitel: 152, sortArt: 'funktion', ico: '✂️', titel: 'Kreuzen und mutieren', lohn: 70,
    ziel: 'Schreib kreuze(eltern1, eltern2, punkt): vorn bis punkt von eltern1, ab punkt von eltern2 (Ein-Punkt-Crossover). Und mutiere(chromosom, stelle): eine NEUE Liste, in der das Bit an stelle umgedreht ist. Die Eltern bleiben unverändert.',
    vorspann: 'def _t5():\n    c = [1, 0, 1]\n    k = mutiere(c, 2)\n    e1 = [1, 1]\n    e2 = [0, 0]\n    kreuze(e1, e2, 1)\n    return [c, k, e1]\n',
    listen: PA_KREUZ_A.map(() => []), aufrufFn: (l, k) => PA_KREUZ_A[k], soll: (l, k) => PA_KREUZ_S[k],
    pruefWert: (w, k) => (gleichWert(w, PA_KREUZ_S[k]) ? null : k === 4
      ? `mutiere und kreuze dürfen das Original nicht verändern: Vorher [1, 0, 1], nach mutiere(c, 2) ist c ${ergebnisText(w?.[0])}. Mach mit list(…) eine Kopie und ändere nur die.`
      : `${PA_KREUZ_A[k]} ergibt ${ergebnisText(w)} – richtig wäre ${ergebnisText(PA_KREUZ_S[k])}.`),
    okText: (w, k) => (k === 4 ? 'Die Eltern bleiben unverändert ✓' : `${PA_KREUZ_A[k]} = ${ergebnisText(w)} ✓`),
    testName: (k) => ['Crossover bei 3', 'Crossover bei 5', 'Mutation an Stelle 1', 'Mutation an Stelle 0', 'mutiere darf das Original nicht verändern'][k],
    befehle: [K_B('def kreuze(eltern1, eltern2, punkt):'), K_B('def mutiere(chromosom, stelle):'), K_B('list(¦)'), K_B('1 - ¦'), K_B('return ¦')],
    tipps: ['Mit [:punkt] und [punkt:] schneidest du Listen; + hängt sie aneinander.', 'list(chromosom) macht eine Kopie – sonst änderst du das Original mit.', '1 - bit macht aus 0 eine 1 und aus 1 eine 0.'],
    loesung: 'def kreuze(eltern1, eltern2, punkt):\n    return eltern1[:punkt] + eltern2[punkt:]\n\ndef mutiere(chromosom, stelle):\n    neu = list(chromosom)\n    neu[stelle] = 1 - neu[stelle]\n    return neu' }),
  STERN({ id: 'mc4', kapitel: 152, sortArt: 'funktion', ico: '🌱', titel: 'Eine neue Generation', lohn: 85, ansicht: 'tabelle', titelAnsicht: 'Beste Fitness je Generation',
    tabelle: (lauf, k) => {
      const w = lauf?.wert;
      if (k === 1 && Array.isArray(w)) return { html: `<div class="werkbild">${w.map((f, i) => `<div style="display:flex;gap:6px;align-items:center"><span class="mono" style="width:2.5em">G${i}</span><span style="display:inline-block;height:12px;width:${Math.max(2, (+f || 0) * 8)}px;background:#7cf0a0;border-radius:3px"></span><span>${f}</span></div>`).join('')}<p class="hinweis">Das Optimum ist 26.</p></div>` };
      if (Array.isArray(w)) return { html: tabHtml(['Nr.', 'Chromosom', 'Fitness'], w.map((c, i) => [i, Array.isArray(c) ? c.join(' ') : '?', Array.isArray(c) ? PA_fit(c) : '?'])) };
      return { html: PA_DINGE_TAB() };
    },
    ziel: 'Schreib generation(population, punkte, stellen): Such mit einer Schleife die zwei Chromosomen mit der größten Fitness (bei Gleichstand das vordere). Sie sind die Eltern und kommen unverändert mit (Elitismus). Für jedes weitere Kind i: kreuze die Eltern bei punkte[i] und mutiere bei stellen[i]. Gib die neue Population (gleich groß) zurück.',
    vorspann: PA_V_GA, listen: [[], [], []],
    aufrufFn: (l, k) => [`generation(START, ${PA_py(PA_GA_TEST[0])}, ${PA_py(PA_GA_TEST[1])})`, `_lauf(${PA_GA_GEN})`, 'len(generation(START + START, [1, 2, 3, 4, 5, 6, 7, 1, 2, 3], [0, 1, 2, 3, 4, 5, 6, 7, 0, 1]))'][k],
    soll: (l, k) => [PA_generation(PA_START, ...PA_GA_TEST), PA_lauf(PA_GA_GEN), 12][k],
    testName: (k) => ['Eine Generation', `${PA_GA_GEN} Generationen`, 'Größe bleibt gleich'][k],
    befehle: [K_B('def generation(population, punkte, stellen):'), K_B('list(¦)'), K_B('return ¦')],
    tipps: ['fitness, kreuze und mutiere gibt es schon.', 'Zweimal die Maximumsuche: in einer Kopie rest das fitteste suchen und mit rest.pop(beste) herausnehmen – so findest du beim zweiten Mal das zweitbeste.', 'for i in range(len(population) - 2): Kind kreuzen, mutieren, an neu anhängen.'],
    loesung: 'def generation(population, punkte, stellen):\n    rest = list(population)\n    eltern = []\n    for runde in range(2):\n        beste = 0\n        for i in range(len(rest)):\n            if fitness(rest[i]) > fitness(rest[beste]):\n                beste = i\n        eltern.append(rest.pop(beste))\n    eltern1 = eltern[0]\n    eltern2 = eltern[1]\n    neu = [eltern1, eltern2]\n    for i in range(len(population) - 2):\n        kind = kreuze(eltern1, eltern2, punkte[i])\n        kind = mutiere(kind, stellen[i])\n        neu.append(kind)\n    return neu' }),

  // --- Kapitel 153: 💬 Sprachmodelle (Bigramme) ---
  STERN({ id: 'md1', kapitel: 153, sortArt: 'funktion', ico: '💬', titel: 'Was kommt danach?', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Die Burggeschichte', tabelle: PA_TEXT_HTML,
    ziel: 'Schreib folgewoerter(woerter, wort): ein Dictionary, das zählt, welches Wort wie oft direkt nach wort kommt. Beispiel: nach "der" kommt 3-mal "drache" und 1-mal "ritter".',
    story: 'Die Sterndeuter der Sternwarte erzählen sich abends Geschichten. Vega will, dass auch ein Rechner Sätze bilden kann – ganz ohne Regeln, nur aus dem, was er gelesen hat: Welches Wort folgt meistens auf welches?',
    daten: { WOERTER: PA_WOERTER }, listen: PA_FOLGE_T.map(() => []), aufrufFn: (l, k) => `folgewoerter(WOERTER, "${PA_FOLGE_T[k]}")`, soll: (l, k) => PA_folge(PA_FOLGE_T[k]),
    testName: (k) => `nach „${PA_FOLGE_T[k]}“`,
    befehle: [K_B('def folgewoerter(woerter, wort):'), K_B('zaehler = {}')],
    merke: { titel: '💬 Sprachmodell', text: 'Ein Sprachmodell schätzt, welches Wort (Token) als Nächstes kommt. Ein Bigramm-Modell zählt dazu, wie oft jedes Wort auf ein anderes folgt: P(drache | der) = Anzahl „der drache“ / Anzahl „der …“. Große Sprachmodelle wie ChatGPT lernen das mit neuronalen Netzen aus riesigen Textmengen und schauen auf viel mehr als ein Wort davor.', code: 'if f in zaehler:\n    zaehler[f] = zaehler[f] + 1\nelse:\n    zaehler[f] = 1' },
    tipps: ['Geh alle Positionen i bis zur vorletzten durch.', 'Ist woerter[i] == wort, dann ist woerter[i + 1] ein Folgewort.', 'Gibt es das Folgewort schon im Dictionary, +1 – sonst mit 1 eintragen.'],
    loesung: PA_C_FOLGE }),
  STERN({ id: 'md2', kapitel: 153, sortArt: 'funktion', ico: '🔮', titel: 'Das wahrscheinlichste Wort', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Die Burggeschichte', tabelle: PA_TEXT_HTML,
    ziel: 'Schreib naechstes_wort(woerter, wort): das Folgewort, das am häufigsten nach wort kommt. Bei Gleichstand gewinnt das, das zuerst im Text vorkommt. folgewoerter (wie eben) gibt es schon.',
    vorspann: PA_C_FOLGE, daten: { WOERTER: PA_WOERTER }, listen: PA_NAECH_T.map(() => []), aufrufFn: (l, k) => `naechstes_wort(WOERTER, "${PA_NAECH_T[k]}")`, soll: (l, k) => PA_naechstes(PA_NAECH_T[k]),
    testName: (k) => `nach „${PA_NAECH_T[k]}“`,
    befehle: [K_B('def naechstes_wort(woerter, wort):'), K_B('folgewoerter(¦)')],
    tipps: ['Hol dir mit folgewoerter das Dictionary.', 'Geh alle Schlüssel durch und merk dir den mit der größten Anzahl.', 'Nur bei echtem > wechseln – dann gewinnt bei Gleichstand das erste.'],
    loesung: PA_C_NAECH.slice(PA_C_FOLGE.length + 2) }),
  STERN({ id: 'md3', kapitel: 153, sortArt: 'vorher', funktion: 'erzeuge', aufruf: 'erzeuge(WOERTER, "der", 4)', ico: '📜', titel: 'Die Maschine erzählt', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Die Burggeschichte', tabelle: PA_TEXT_HTML,
    ziel: 'Die Maschine nimmt immer das wahrscheinlichste nächste Wort. Sag voraus, welchen Satz sie bildet.',
    daten: { WOERTER: PA_WOERTER }, listen: [[]],
    code: PA_C_NAECH + '\n\ndef erzeuge(woerter, start, laenge):\n    satz = [start]\n    wort = start\n    for i in range(laenge):\n        wort = naechstes_wort(woerter, wort)\n        satz.append(wort)\n    return satz',
    fragen: [{ art: 'liste', text: 'Welche 5 Wörter gibt erzeuge(WOERTER, "der", 4) zurück?', soll: (l) => l.wert },
      { art: 'zahl', text: 'Mit welcher Wahrscheinlichkeit folgt im Bigramm-Modell „drache“ auf „der“? (als Dezimalzahl)', soll: () => 0.75, tol: 0.01 },
      W('Die Maschine nimmt immer das häufigste Wort. Was passiert, wenn man stattdessen nach den Wahrscheinlichkeiten würfelt (Temperatur höher)?', ['Es kommt immer derselbe Satz', 'Die Sätze werden abwechslungsreicher – aber manchmal auch unsinniger', 'Das Modell lernt neue Wörter', 'Es geht nicht mehr'], 1),
      W('Warum „versteht“ so ein Modell den Text nicht wirklich?', ['Es rechnet nur Häufigkeiten aus – welche Wörter aufeinander folgen', 'Weil der Text zu kurz ist', 'Weil Python keine Sprache kann', 'Es versteht ihn doch'], 0)],
    tipps: ['Nach „der“ kommt 3-mal „drache“, 1-mal „ritter“.', 'Nach „fliegt“ kommen „über“ und „zum“ je einmal – „über“ steht zuerst im Text.'] }),
);

// =====================================================================================================
// Burg 23 · Kapitel 154: 🧪 Fremden Code lesen und testen (LB 4/5: 5.3 Testen, 4.1 Paradigmen, Abi 2026 C2)
// =====================================================================================================
const PA_C_VORRAT = `class Vorratskammer:
    def __init__(self):
        self.__waren = {}

    def einlagern(self, ware: str, menge: int):
        if ware in self.__waren:
            self.__waren[ware] = self.__waren[ware] + menge
        else:
            self.__waren[ware] = menge

    def entnehmen(self, ware: str, menge: int) -> bool:
        if self.bestand(ware) < menge:
            return False
        self.__waren[ware] = self.__waren[ware] - menge
        return True

    def bestand(self, ware: str) -> int:
        if ware in self.__waren:
            return self.__waren[ware]
        return 0

    def gesamt(self) -> int:
        summe = 0
        for ware in self.__waren:
            summe = summe + self.__waren[ware]
        return summe`;
const PA_EINTRITT = { A: ['if alter < 0:', 'if alter < 6:', 'if alter < 18:'], B: ['if alter < 0:', 'if alter <= 6:', 'if alter < 18:'], C: ['if alter < 0:', 'if alter < 6:', 'if alter <= 18:'], D: ['if alter < -1:', 'if alter < 6:', 'if alter < 18:'], E: ['if alter < 0:', 'if alter < 6:', 'if alter < 17:'] };
const PA_V_EINTRITT = Object.entries(PA_EINTRITT).map(([n, b]) => `class Eintritt${n}:\n    def preis(self, alter):\n        ${b[0]}\n            return -1\n        ${b[1]}\n            return 0\n        ${b[2]}\n            return 3\n        return 5\n`).join('\n')
  + '\n' + Object.keys(PA_EINTRITT).map((n, i) => `def _t${i + 1}():\n    return teste(Eintritt${n})\n`).join('\n');
const PA_PARADIGMEN = ['imperativ – prozedural', 'imperativ – objektorientiert', 'deklarativ – funktional', 'deklarativ – logisch', 'deklarativ – Abfragesprache'];
const PA_PW = (name, code, richtig) => ({ art: 'wahl', text: `Zu welchem Paradigma gehört Ausschnitt ${name}?`, html: PA_code(code), optionen: PA_PARADIGMEN, richtig });

HOEFE.push(
  WFRAGEN({ id: 'me1', kapitel: 154, ico: '📖', titel: 'Die fremde Vorratskammer', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Code von Geselle Bruno', tabelle: () => ({ html: `<div class="werkbild">${PA_code(PA_C_VORRAT)}</div>` }),
    ziel: 'Lies den fremden Code ohne Computer: Was tun die Methoden?',
    story: 'Geselle Bruno ist weitergezogen und hat seinen Code dagelassen – ohne ein Wort der Erklärung. Ada seufzt: „Das passiert im echten Leben ständig. Wer fremden Code lesen, beschreiben und prüfen kann, ist Gold wert.“',
    merke: { titel: '📖 Fremden Code lesen', text: 'Geh fremden Code Methode für Methode durch: Was bekommt sie (Parameter), was ändert sie (Attribute), was gibt sie zurück? Spiel kleine Beispiele von Hand durch und schreib das Ergebnis mit. Beschreibe dann in einem Satz, was die Methode tut – nicht, wie sie es Zeile für Zeile tut.' },
    fragen: [
      W('Was speichert das Attribut __waren?', ['eine Liste aller Warennamen', 'ein Dictionary: Warenname → Menge', 'die Gesamtmenge als Zahl', 'die zuletzt eingelagerte Ware'], 1),
      W('Was macht entnehmen, wenn zu wenig da ist?', ['es entnimmt so viel wie möglich', 'es gibt False zurück und ändert nichts', 'es stürzt ab', 'der Bestand wird negativ'], 1),
      { art: 'zahl', text: 'k = Vorratskammer() · k.einlagern("Mehl", 5) · k.einlagern("Mehl", 3) · k.entnehmen("Mehl", 10) – welchen Wert hat danach k.bestand("Mehl")?', soll: () => 8 },
      { art: 'zahl', text: 'Danach noch k.einlagern("Salz", 4) und k.entnehmen("Mehl", 2). Was gibt k.gesamt() zurück?', soll: () => 10 },
      W('Was passiert bei print(k.__waren) außerhalb der Klasse?', ['Das Dictionary wird ausgegeben', 'Fehler – __waren ist privat', 'Es wird 0 ausgegeben', 'Es wird None ausgegeben'], 1)],
    tipps: ['einlagern addiert, wenn die Ware schon da ist – sonst legt es sie neu an.', 'entnehmen prüft zuerst mit bestand, ob genug da ist.'] }),
  WERK({ id: 'me2', fertig: true, kapitel: 154, sortArt: 'funktion', ico: '🧩', titel: 'Brunos Code erweitern', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Neue Methode', tabelle: werkBild(uml('Vorratskammer', ['− __waren: dict'], ['+ einlagern(ware, menge)', '+ entnehmen(ware, menge): bool', '+ bestand(ware): int', '+ gesamt(): int', '<b>+ knapp(grenze): list</b>'])),
    ziel: 'Erweitere Brunos Klasse um die Methode knapp(grenze): eine alphabetisch sortierte Liste aller Waren, von denen weniger als grenze da ist.',
    vorlage: PA_C_VORRAT,
    vorspann: 'def _t1():\n    k = Vorratskammer()\n    k.einlagern("Mehl", 5)\n    k.einlagern("Salz", 1)\n    k.einlagern("Hafer", 2)\n    return k.knapp(3)\n\ndef _t2():\n    k = Vorratskammer()\n    k.einlagern("Mehl", 5)\n    k.entnehmen("Mehl", 4)\n    k.einlagern("Apfel", 3)\n    return k.knapp(3)\n\ndef _t3():\n    k = Vorratskammer()\n    k.einlagern("Mehl", 9)\n    return [k.knapp(2), k.gesamt()]\n',
    ...tests([['Hafer', 'Salz'], ['Mehl'], [[], 9]]), testName: (k) => ['zwei knappe Waren', 'nach dem Entnehmen', 'nichts knapp'][k],
    befehle: [K_B('def knapp(self, grenze):'), K_B('sorted(¦)')],
    tipps: ['Die Methode gehört eingerückt in die Klasse, mit self als erstem Parameter.', 'Geh wie in gesamt() durch alle Waren in self.__waren.', 'Knappe Waren an eine Liste anhängen, am Ende return sorted(liste).'],
    loesung: PA_C_VORRAT + '\n\n    def knapp(self, grenze):\n        liste = []\n        for ware in self.__waren:\n            if self.__waren[ware] < grenze:\n                liste.append(ware)\n        return sorted(liste)' }),
  WFRAGEN({ id: 'me3', kapitel: 154, ico: '📏', titel: 'Klassen und Grenzen', lohn: 65,
    ziel: 'Welche Werte testest du? Bilde Äquivalenzklassen und finde die Grenzwerte.',
    merke: { titel: '📏 Äquivalenzklassen und Grenzwerte', text: 'Ein Testfall besteht aus Eingabe, erwartetem Ergebnis (aus der Spezifikation, nie aus dem Code) und tatsächlichem Ergebnis. Eingaben, die laut Spezifikation gleich behandelt werden, bilden eine Äquivalenzklasse (gültige und ungültige) – aus jeder testet man einen Vertreter. Weil Fehler oft an den Rändern stecken (< statt <=), testet man an jeder Grenze den Wert davor und dahinter.' },
    fragen: [
      { art: 'zahl', text: 'Spezifikation: „Einen Turm kann man ab 50 Gold bauen. Gold ist eine ganze Zahl ab 0, negative Werte sind ungültig.“ Wie viele Äquivalenzklassen gibt es?', soll: () => 3 },
      { art: 'liste', text: 'Welche Grenzwerte testest du? (aufsteigend, mit Leerzeichen)', soll: () => [-1, 0, 49, 50] },
      W('Der Code prüft gold > 50 statt gold >= 50. Welcher Test findet den Fehler?', ['gold = 10', 'gold = 50', 'gold = 200', 'gold = -5'], 1),
      { art: 'zahl', text: 'Neue Spezifikation: „Ab 10 gelösten Höfen gibt es Bronze, ab 25 Silber. Negative Zahlen sind ungültig.“ Wie viele Äquivalenzklassen?', soll: () => 4 },
      { art: 'liste', text: 'Und welche Grenzwerte? (aufsteigend)', soll: () => [-1, 0, 9, 10, 24, 25] },
      W('Woher kommt das erwartete Ergebnis eines Testfalls?', ['aus dem Code', 'aus der Spezifikation (Aufgabenstellung)', 'aus dem tatsächlichen Ergebnis', 'vom Compiler'], 1)],
    tipps: ['Klassen: ungültig (unter 0), gültig ohne Turm (0 bis 49), gültig mit Turm (ab 50).', 'An jeder Grenze den letzten Wert der einen und den ersten der nächsten Klasse.'] }),
  WERK({ id: 'me4', kapitel: 154, sortArt: 'funktion', ico: '🕵️', titel: 'Der Testdetektiv', lohn: 85, ansicht: 'tabelle', titelAnsicht: 'Spezifikation',
    tabelle: werkBild(`${tabHtml(['Alter', 'Preis'], [['unter 0', '−1 (ungültig)'], ['0 bis 5', '0'], ['6 bis 17', '3'], ['ab 18', '5']])}<p class="hinweis">Fünf Gesellen haben die Klasse Eintritt geschrieben (EintrittA … EintrittE), jede mit der Methode preis(alter). Nur eine ist richtig.</p>`),
    ziel: 'Schreib teste(klasse): Sie erzeugt ein Objekt e = klasse() und prüft e.preis(…) mit gut gewählten Testfällen. True, wenn alle stimmen, sonst False. Deine Tests müssen alle vier fehlerhaften Klassen entlarven.',
    vorspann: PA_V_EINTRITT, ...tests([true, false, false, false, false]), testName: (k) => `teste(Eintritt${'ABCDE'[k]})`,
    befehle: [K_B('def teste(klasse):'), K_B('e = klasse()'), K_B('faelle = [[¦]]')],
    tipps: ['Ein Testfall = [Eingabe, erwartetes Ergebnis] aus der Tabelle.', 'Mit Vertretern wie 3, 10, 40 findest du keinen der Fehler – sie stecken an den Grenzen.', 'Teste −1 | 0, 5 | 6 und 17 | 18.'],
    loesung: 'def teste(klasse):\n    e = klasse()\n    faelle = [[-1, -1], [0, 0], [5, 0], [6, 3], [17, 3], [18, 5]]\n    for f in faelle:\n        if e.preis(f[0]) != f[1]:\n            return False\n    return True' }),
  WFRAGEN({ id: 'me5', kapitel: 154, ico: '🗂️', titel: 'Fünf Arten zu programmieren', lohn: 65,
    ziel: 'Ordne jeden Codeausschnitt seinem Programmierparadigma zu.',
    merke: { titel: '🗂️ Programmierparadigmen', text: 'Imperativ heißt: Man schreibt auf, WIE gerechnet wird – Schritt für Schritt mit Variablen, die sich ändern (prozedural mit Funktionen, objektorientiert mit Klassen und Objekten). Deklarativ heißt: Man beschreibt, WAS man will – funktional mit Funktionen ohne Zustandsänderung, logisch mit Fakten und Regeln (Prolog), mit Abfragesprachen wie SQL.' },
    fragen: [
      PA_PW('1 (Monsterliste)', 'SELECT name FROM monster\nWHERE leben > 20\nORDER BY name;', 4),
      PA_PW('2 (Summe bis 10)', 'summe = 0\ni = 1\nwhile i <= 10:\n    summe = summe + i\n    i = i + 1', 0),
      PA_PW('3 (Vorfahren)', 'vorfahr(X, Y) :- elternteil(X, Y).\nvorfahr(X, Y) :- elternteil(X, Z), vorfahr(Z, Y).', 3),
      PA_PW('4 (Summe einer Liste)', 'summe []     = 0\nsumme (x:xs) = x + summe xs', 2),
      PA_PW('5 (Turm)', 'class Turm:\n    def __init__(self, schaden):\n        self.schaden = schaden\n\n    def schiesse(self, monster):\n        monster.leben = monster.leben - self.schaden', 1),
      W('Was ist der Kern des deklarativen Programmierens?', ['Man beschreibt, was das Ergebnis sein soll – wie es berechnet wird, entscheidet das System', 'Man schreibt jeden Schritt in der richtigen Reihenfolge auf', 'Man benutzt nur Klassen', 'Man programmiert direkt in Maschinensprache'], 0)],
    tipps: ['Ändern sich Variablen Schritt für Schritt? Dann imperativ.', 'Fakten und Regeln mit :- sind Prolog (logisch). Gleichungen für Funktionen ohne Variablenänderung sind funktional (Haskell).'] }),
);

// =====================================================================================================
// Burg 24 · Kapitel 155: 🔢 Backtracking: Sudoku (LB 2/3 Datenstrukturen 3.10, 4×4-Sudoku)
// =====================================================================================================
const PA_ERL = (f, z, s, x) => {
  for (let i = 0; i < 4; i++) if (f[z][i] === x || f[i][s] === x) return false;
  const bz = Math.floor(z / 2) * 2, bs = Math.floor(s / 2) * 2;
  for (let i = bz; i < bz + 2; i++) for (let j = bs; j < bs + 2; j++) if (f[i][j] === x) return false;
  return true;
};
const PA_P1 = [[1, 0, 0, 4], [0, 0, 1, 0], [0, 1, 0, 0], [4, 0, 0, 1]];
const PA_GB = [[0, 0, 0, 0], [0, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
const PA_GB2 = [[4, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
const PA_GB3 = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0]];
const PA_GB4 = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]];
const PA_ERL_T = [[PA_P1, 0, 1, 2], [PA_P1, 0, 1, 4], [PA_P1, 1, 0, 4], [PA_GB, 0, 0, 2], [PA_GB, 0, 2, 2], [PA_GB2, 1, 1, 4], [PA_GB3, 2, 3, 1], [PA_GB4, 3, 0, 1]];
const PA_SUDOKUS = [PA_P1, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 3, 4], [2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 3, 0, 0], [0, 0, 0, 2], [3, 0, 0, 0], [0, 0, 1, 0]]];
const PA_loese = (f) => {
  for (let z = 0; z < 4; z++) for (let s = 0; s < 4; s++) if (!f[z][s]) {
    for (let x = 1; x <= 4; x++) if (PA_ERL(f, z, s, x)) { f[z][s] = x; if (PA_loese(f)) return true; f[z][s] = 0; }
    return false;
  }
  return true;
};
const PA_loesbar = (p) => PA_loese(p.map((r) => [...r]));
const PA_C_ERL = `def zahl_erlaubt(feld, zeile, spalte, zahl):
    for i in range(4):
        if feld[zeile][i] == zahl or feld[i][spalte] == zahl:
            return False
    bz = zeile // 2 * 2
    bs = spalte // 2 * 2
    for i in range(bz, bz + 2):
        for j in range(bs, bs + 2):
            if feld[i][j] == zahl:
                return False
    return True`;
const PA_C_FUELLE = `def fuelle_sudoku(feld):
    for zeile in range(4):
        for spalte in range(4):
            if feld[zeile][spalte] == 0:
                for zahl in range(1, 5):
                    if zahl_erlaubt(feld, zeile, spalte, zahl):
                        feld[zeile][spalte] = zahl
                        if fuelle_sudoku(feld):
                            return True
                        feld[zeile][spalte] = 0
                return False
    return True`;
function PA_gitter(f, start, fehlt = false) {
  const zelle = (v, z, s) => `<td style="width:2.2em;height:2.2em;text-align:center;font-size:1.15em;border:1px solid #6a5a3a;${s === 1 ? 'border-right:3px solid #3a2a10;' : ''}${z === 1 ? 'border-bottom:3px solid #3a2a10;' : ''}${start && start[z][s] ? 'font-weight:700;' : 'color:#2a6ab0;'}background:${v ? '#f6ecd2' : '#e4d6b4'}">${v || ''}</td>`;
  return `<table style="border-collapse:collapse;border:3px solid #3a2a10;margin:4px auto">${f.map((r, z) => `<tr>${r.map((v, s) => zelle(v, z, s)).join('')}</tr>`).join('')}</table>${fehlt ? '<p class="hinweis" style="text-align:center">keine Lösung gefunden</p>' : ''}`;
}

HOEFE.push(
  POST({ id: 'mf1', kapitel: 155, sortArt: 'funktion', ico: '🔢', titel: 'Darf die Zahl hierhin?', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Das Zahlenrätsel',
    tabelle: (lauf, k) => { const t = PA_ERL_T[k || 0]; return { html: dsBild(`${PA_gitter(t[0], t[0])}<p class="hinweis">Test ${(k || 0) + 1}: Zahl ${t[3]} in Zeile ${t[1]}, Spalte ${t[2]}?${lauf ? ` → ${ergebnisText(lauf.wert)}` : ''} In jeder Zeile, jeder Spalte und jedem 2×2-Block darf jede Zahl 1–4 nur einmal stehen. 0 = leer.</p>`) }; },
    ziel: 'Schreib zahl_erlaubt(feld, zeile, spalte, zahl): True, wenn zahl weder in der Zeile noch in der Spalte noch im 2×2-Block von (zeile, spalte) steht. feld ist eine Liste aus 4 Zeilen mit je 4 Zahlen, 0 = leer.',
    story: 'Die Postmeisterin verschickt Briefe mit einem Zahlenrätsel als Siegel: Nur wer das 4×4-Sudoku löst, darf den Brief öffnen. Paula will die Siegel nicht mehr von Hand prüfen – und auch nicht von Hand lösen.',
    listen: PA_ERL_T.map(() => []), aufrufFn: (l, k) => { const t = PA_ERL_T[k]; return `zahl_erlaubt(${PA_py(t[0])}, ${t[1]}, ${t[2]}, ${t[3]})`; },
    soll: (l, k) => PA_ERL(...PA_ERL_T[k]), testName: (k) => ['frei', 'schon in der Zeile', 'schon in der Spalte', 'schon im Block', 'anderer Block', 'Block oben links, Feld in Zeile 1', 'Block unten rechts, Feld in Zeile 2', 'Block unten links, Feld in Zeile 3'][k],
    befehle: [K_B('def zahl_erlaubt(feld, zeile, spalte, zahl):'), K_B('for i in range(4):'), K_B('return True')],
    tipps: ['Zeile und Spalte gehen in einer Schleife: feld[zeile][i] und feld[i][spalte].', 'Der Block beginnt bei bz = zeile // 2 * 2 und bs = spalte // 2 * 2.', 'Zwei verschachtelte Schleifen über bz … bz + 1 und bs … bs + 1.'],
    loesung: PA_C_ERL }),
  POST({ id: 'mf2', kapitel: 155, sortArt: 'funktion', ico: '🔙', titel: 'Das Siegel knacken', lohn: 90, ansicht: 'tabelle', titelAnsicht: 'Das Zahlenrätsel',
    tabelle: (lauf, k) => { const p = PA_SUDOKUS[k || 0], w = lauf?.wert; return { html: dsBild(`${PA_gitter(w?.feld || p, p, w && !w.ok)}<p class="hinweis">${lauf ? `Test ${k + 1}: ${w?.ok ? 'gelöst' : 'keine Lösung gefunden'}` : 'Erstes leeres Feld suchen, Zahlen 1–4 probieren, rekursiv weiter – führt es in eine Sackgasse, zurücknehmen (wieder 0).'}</p>`) }; },
    ziel: 'Schreib fuelle_sudoku(feld) mit Backtracking: Finde das erste leere Feld, probiere 1 bis 4, setze eine erlaubte Zahl und fülle rekursiv weiter. Klappt das nicht, nimm die Zahl zurück (0). True, wenn alles gefüllt ist, False, wenn es keine Lösung gibt. zahl_erlaubt gibt es schon.',
    vorspann: `${PA_C_ERL}

def _gueltig(feld, start):
    for z in range(4):
        for s in range(4):
            x = feld[z][s]
            if x < 1 or x > 4 or (start[z][s] != 0 and start[z][s] != x):
                return False
            feld[z][s] = 0
            ok = zahl_erlaubt(feld, z, s, x)
            feld[z][s] = x
            if not ok:
                return False
    return True

def _versuch(start):
    feld = []
    for zeile in start:
        feld.append(list(zeile))
    ok = fuelle_sudoku(feld)
    return {"ok": ok, "gueltig": _gueltig(feld, start), "feld": feld}
`,
    listen: PA_SUDOKUS.map(() => []), aufrufFn: (l, k) => `_versuch(${PA_py(PA_SUDOKUS[k])})`,
    soll: (l, k) => (PA_loesbar(PA_SUDOKUS[k]) ? { ok: true, gueltig: true } : { ok: false, gueltig: false }),
    pruefWert: (w, k) => (PA_loesbar(PA_SUDOKUS[k])
      ? (!w?.ok ? 'fuelle_sudoku gibt False zurück, obwohl dieses Siegel eine Lösung hat.' : !w.gueltig ? 'fuelle_sudoku meldet True, aber das Feld stimmt nicht: Eine Zahl steht doppelt, ein Feld ist leer oder eine Vorgabe wurde verändert.' : null)
      : (w?.ok ? 'Dieses Siegel hat keine Lösung – fuelle_sudoku hätte False zurückgeben müssen.' : null)),
    okText: (w) => (w.ok ? 'Gelöst – jede Zahl passt ✓' : 'Richtig erkannt: Dieses Siegel hat keine Lösung ✓'), testName: (k) => ['Siegel 1', 'leeres Feld', 'Siegel ohne Lösung', 'Siegel 4'][k],
    befehle: [K_B('def fuelle_sudoku(feld):'), K_B('for zahl in range(1, 5):'), K_B('return False')],
    merke: { titel: '🔢 Backtracking beim Sudoku', text: 'Das Sudoku wird Feld für Feld gefüllt: Kandidat wählen (1 bis 4), mit zahl_erlaubt prüfen, setzen, rekursiv das nächste leere Feld füllen. Passt für ein Feld keine Zahl mehr, gibt der Aufruf False zurück und der Aufrufer nimmt seine Zahl zurück (Rücknahme) und probiert die nächste. Gibt es kein leeres Feld mehr, ist das Rätsel gelöst.', code: 'feld[zeile][spalte] = zahl\nif fuelle_sudoku(feld):\n    return True\nfeld[zeile][spalte] = 0   # Rücknahme' },
    tipps: ['Zwei Schleifen über zeile und spalte suchen das erste Feld mit 0.', 'Dort alle Zahlen probieren; nach der Zahlen-Schleife: return False (keine passt).', 'Findet die Suche gar kein leeres Feld, ist alles gefüllt: return True ganz am Ende.'],
    loesung: PA_C_FUELLE }),
  POST({ id: 'mf3', kapitel: 155, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🔮', titel: 'Wie oft wird probiert?', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Zwei Siegel',
    tabelle: () => ({ html: dsBild(`<div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center"><div>${PA_gitter(PA_SUDOKUS[1], PA_SUDOKUS[1])}<p class="hinweis" style="text-align:center">Siegel A: leer</p></div><div>${PA_gitter(PA_SUDOKUS[2], PA_SUDOKUS[2])}<p class="hinweis" style="text-align:center">Siegel B</p></div></div>`) }),
    ziel: 'Der Backtracking-Löser zählt seine Aufrufe mit. Sag voraus, wie oft er sich bei den beiden Siegeln aufruft.',
    listen: [[]], code: `aufrufe = 0

${PA_C_ERL}

${PA_C_FUELLE.replace('def fuelle_sudoku(feld):\n', 'def fuelle_sudoku(feld):\n    global aufrufe\n    aufrufe = aufrufe + 1\n')}

def versuch():
    global aufrufe
    a = ${PA_py(PA_SUDOKUS[1])}
    fuelle_sudoku(a)
    aufrufe_a = aufrufe
    aufrufe = 0
    b = ${PA_py(PA_SUDOKUS[2])}
    ok_b = fuelle_sudoku(b)
    return {"zeile0": a[0], "aufrufe_a": aufrufe_a, "aufrufe_b": aufrufe, "ok_b": ok_b}`,
    fragen: [{ art: 'liste', text: 'Siegel A (leer): Welche Zahlen stehen danach in Zeile 0?', soll: (l) => l.wert.zeile0 },
      { art: 'zahl', text: 'Bei Siegel A muss der Löser nie zurücknehmen. Wie oft wird fuelle_sudoku aufgerufen (der erste Aufruf zählt mit)?', soll: (l) => l.wert.aufrufe_a },
      { art: 'zahl', text: 'Siegel B hat keine Lösung. Wie oft wird fuelle_sudoku aufgerufen, bis False herauskommt?', soll: (l) => l.wert.aufrufe_b },
      { art: 'zahl', text: 'Ohne Prüfen müsste man bei 10 leeren Feldern jede Belegung mit 1–4 ausprobieren. Wie viele sind das?', soll: () => 4 ** 10 },
      W('Warum ist Backtracking viel schneller als alles auszuprobieren?', ['Es probiert in jedem Feld weniger verschiedene Zahlen aus', 'Es bricht einen Weg ab, sobald eine Zahl nicht passt – und spart so ganze Teilbäume', 'Es rechnet parallel', 'Es ist nicht schneller'], 1)],
    tipps: ['Jedes gesetzte Feld führt zu genau einem neuen Aufruf, dazu kommt der allererste.', 'Siegel B: In Zeile 0 fehlen 1 und 2, aber die 2 steht schon im Block oben links.'] }),
);

// --- 📓 Heft ---
HEFT_EXTRA[150] = { titel: '🔍 Algorithmen untersuchen', text: ['Ein Algorithmus ist endlich beschrieben, jeder Schritt ist ausführbar und eindeutig, er terminiert und liefert bei gleicher Eingabe dasselbe Ergebnis (Determiniertheit).', 'Lokale Variablen gibt es nur in ihrer Funktion; eine globale Variable ändert eine Funktion nur mit global.', 'Sequenzielle Suche: O(1) bis O(n), ohne Sortieren. Binäre Suche: O(log n), nur in sortierten Listen. Bucketsort verteilt Werte auf Eimer und sortiert jeden einzeln.'], code: 'for i in range(len(a)):\n    if a[i] == x:\n        return i\nreturn -1' };
HEFT_EXTRA[151] = { titel: '🐇 Doppelte Rekursion', text: ['fib(n) ruft sich zweimal auf: Es entsteht ein Aufrufbaum mit rekursivem Abstieg und Aufstieg.', 'Dieselben Werte werden immer wieder berechnet – die Aufrufe wachsen exponentiell (O(2ⁿ)): 1, 1, 3, 5, 9, 15, 25 …', 'Iterativ mit zwei Variablen braucht fib nur O(n) Schritte.'], code: 'def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)' };
HEFT_EXTRA[152] = { titel: '🧬 Genetische Algorithmen', text: ['Eine Population von Chromosomen (z. B. Bitstrings) wird über Generationen verbessert: Fitness bewerten, die Besten auswählen (Selektion), kreuzen (Crossover), zufällig ändern (Mutation).', 'Elitismus übernimmt die Besten unverändert. Das Ergebnis ist meist eine gute Näherung, nicht garantiert das Optimum.'], code: 'kind = kreuze(eltern1, eltern2, punkt)\nkind = mutiere(kind, stelle)' };
HEFT_EXTRA[153] = { titel: '💬 Sprachmodelle', text: ['Ein Sprachmodell sagt das nächste Wort voraus. Ein Bigramm-Modell zählt, wie oft ein Wort auf ein anderes folgt.', 'P(drache | der) = Anzahl „der drache“ / Anzahl „der …“. Mit höherer Temperatur wird gewürfelt statt immer das häufigste Wort zu nehmen.'], code: 'zaehler[f] = zaehler[f] + 1' };
HEFT_EXTRA[154] = { titel: '🧪 Fremden Code lesen und testen', text: ['Fremden Code liest man Methode für Methode: Parameter, geänderte Attribute, Rückgabe – und spielt Beispiele von Hand durch.', 'Testfälle: Äquivalenzklassen (je ein Vertreter) und Grenzwerte (davor und dahinter). Das erwartete Ergebnis kommt aus der Spezifikation.', 'Paradigmen: imperativ (prozedural, objektorientiert) beschreibt WIE, deklarativ (funktional, logisch, SQL) beschreibt WAS.'], code: 'for f in faelle:\n    if e.preis(f[0]) != f[1]:\n        return False' };
HEFT_EXTRA[155] = { titel: '🔢 Backtracking: Sudoku', text: ['Leeres Feld suchen, Zahl probieren, prüfen, setzen, rekursiv weiter. Sackgasse → Zahl zurücknehmen und die nächste probieren.', 'Weil ungültige Wege früh abgebrochen werden, ist Backtracking viel schneller als alle 4ⁿ Belegungen durchzuprobieren.'], code: 'feld[zeile][spalte] = zahl\nif fuelle_sudoku(feld):\n    return True\nfeld[zeile][spalte] = 0' };
