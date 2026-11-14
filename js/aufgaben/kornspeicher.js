'use strict';
// --- 🌾 Kornspeicher: LK Sortieren und Komplexität (Burg 21, nach dem OPAL-Kurs LB 2/3, 2.2.1–2.2.5 und O-Notation) ---
// Säcke mit Gewichten stehen in einer Reihe (Liste). Echtes Python mit def, Listen, while, Rekursion.
// Das Spiel zählt Vergleiche (V) und Schreibzugriffe in die Liste (Z) selbst mit (python.js SORT_PY).
// Arten (sortArt):
//   karten   – Kartenspiel aus 2.2.1: Säcke verdeckt in der Liste a; vergleichen (a[i] > a[j]) und tauschen (temp) schreibt man selbst
//   funktion – eigene Funktion (z. B. bubblesort(a)) wird auf jeder Testliste aufgerufen und geprüft
//   vorher   – Code steht fest, erst vorhersagen (Zahl, Liste, Auswahl), dann läuft er (PRIMM)
//   messen   – 🔬 Messlabor: fester Code auf wachsenden Listen, Tabelle und Kurve, dann Fragen (O-Notation, Hochrechnen)
// Begriffe und Code wie im Kurs: bubblesort, getauscht, min_pos, temp (kein Tupeltausch nötig).

KAPITEL[30] = { name: 'Sortieren wie ein Computer', ico: '🃏' };
KAPITEL[31] = { name: 'Bubblesort', ico: '🫧' };
KAPITEL[32] = { name: 'Selection- und Insertionsort', ico: '👉' };
KAPITEL[33] = { name: 'Messlabor: O-Notation', ico: '🔬' };
KAPITEL[34] = { name: 'Rekursion: Teile und herrsche', ico: '🪆' };
KAPITEL[35] = { name: 'Mergesort und Quicksort', ico: '⚡' };
BURGEN[21] = { name: 'LK Sortieren', ico: '🌾', klasse: 'LK', region: 'kornspeicher', kapitel: [30, 31, 32, 33, 34, 35],
  text: 'Leistungskurs: Sortieren wie ein Computer, Bubble-, Selection- und Insertionsort, O-Notation im Messlabor, Rekursion und Divide & Conquer, Merge- und Quicksort.' };

const S_LK = ['for', 'while', 'if', 'else', 'elif', 'var', 'def', 'vergleich', 'methoden', 'lk'];   // 'lk': set() und Comprehensions erlaubt (Spieltest)
const S_REK = ['if', 'else', 'elif', 'var', 'def', 'vergleich', 'methoden'];   // Rekursion ohne Schleifen (Kurs 2.2.7)
// immer gleiche „zufällige“ Listen (damit Musterlösung und Sterne zu jeder Liste passen)
function zufallsListe(n, seed, max = 99) {
  let s = seed * 9301 + 49297;
  const aus = [];
  for (let i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; aus.push(1 + Math.floor((s / 233280) * max)); }
  return aus;
}
const permutationen = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => permutationen([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
const aufsteigend = (n) => Array.from({ length: n }, (_, i) => (i + 1) * 7 % 100 || 1).sort((a, b) => a - b);
const absteigendL = (n) => aufsteigend(n).reverse();
const K_B = (text, zeigt = text) => ({ text, zeigt: zeigt.replace('¦', ' ') });
// Kartenspiel (2026-11-13, Nutzerwunsch): keine fertigen Befehle – Vergleichen und Tauschen mit Grundsyntax selbst schreiben
// Didaktik-Prüfung: die Bausteine waren wörtlich die Lösung von ko1 → allgemein mit i und j (die Plätze trägt man selbst ein)
const B_KARTEN = [K_B('if a[i] > a[j]:'), K_B('temp = a[i]'), K_B('a[i] = a[j]'), K_B('a[j] = temp'), K_B('for i in range(¦):'), K_B('len(a)')];
const TAUSCH01 = 'if a[0] > a[1]:\n    temp = a[0]\n    a[0] = a[1]\n    a[1] = temp';
const B_LISTE = [K_B('def bubblesort(a):'), K_B('n = len(a)'), K_B('for i in range(¦):'), K_B('while ¦:'), K_B('if a[j] > a[j + 1]:'), K_B('temp = a[j]')];

// Datensätze für ks4 (Bestenliste, gleiche Punkte = Stabilität prüfen) und ks5 (Register: Dorf, dann Gewicht absteigend)
const BESTE = [
  [['Ada', 7], ['Ben', 9], ['Cem', 7], ['Dana', 4], ['Emil', 9]],
  [['Lea', 3], ['Max', 6], ['Nora', 6], ['Ole', 6], ['Pia', 1], ['Quinn', 8]],
  [['Ida', 5], ['Jan', 5], ['Kai', 8]],
  [['Rosa', 9], ['Sam', 9], ['Tim', 2]],
];
const REGISTER = [
  [['Eichhof', 12], ['Birkenau', 30], ['Eichhof', 25], ['Birkenau', 8], ['Mühlbach', 17]],
  [['Mühlbach', 5], ['Ackerhain', 40], ['Mühlbach', 22], ['Ackerhain', 9], ['Eichhof', 33], ['Ackerhain', 15]],
  [['Birkenau', 20], ['Birkenau', 21]],
];

// Auftrag im Kornspeicher; vSoll/zSoll (für die ⭐) kommen aus der Musterlösung (kornZiele)
const KORN = (a) => hof({ art: 'sort', start: 0, varianten: [], bloecke: false, sprache: S_LK, befehle: [], tipps: [], zielArt: 'sortiert', ...a });

HOEFE.push(
  // --- Kapitel 30: 🃏 Sortieren wie ein Computer (Kartenspiel 2.2.1) ---
  KORN({ id: 'ko1', kapitel: 30, sortArt: 'karten', ico: '🃏', titel: 'Zwei Säcke', lohn: 40,
    ziel: 'Die Säcke stehen in der Liste a, sind aber zugebunden. Bring den leichteren nach vorn: vergleiche a[0] mit a[1] und tausche, wenn nötig.',
    story: 'Willkommen im Kornspeicher! Morgen ist Markt, und die Säcke müssen nach Gewicht stehen, der leichteste vorn. Aber sie sind zugebunden: Du siehst nicht, was drin ist. Du kannst nur zwei vergleichen (a[0] > a[1]) und sie umstellen – wie ein Computer.',
    listen: [[7, 3], [2, 8]], befehle: B_KARTEN, neu: B_KARTEN,
    // Merke zeigt das Prinzip, nicht die Lösung (Spieltest): Tausch mit temp an zwei Bechern statt an a[0]/a[1]
    merke: { titel: '🃏 Sortieren wie ein Computer', text: 'Ein Computer sieht nicht die ganze Liste auf einmal. Er vergleicht immer zwei Werte und tauscht sie, wenn nötig. Zum Tauschen braucht man einen Zwischenspeicher temp – wie beim Umfüllen zweier Becher einen dritten, leeren Becher. Jeder Vergleich und jeder Schreibzugriff kostet einen Strich.', code: '# Inhalt von x und y tauschen\ntemp = x\nx = y\ny = temp' },
    tipps: ['Die Bausteine sprechen von a[i] und a[j] – hier sind es die Plätze 0 und 1. Vergleiche Sack 0 mit Sack 1: if a[0] > a[1]:','Ist Sack 0 schwerer, gehört er nach hinten. Schreibst du gleich a[0] = a[1], ist der alte Wert von a[0] weg – merk ihn dir vorher in temp.', 'temp = a[0] · a[0] = a[1] · a[1] = temp'],
    loesung: TAUSCH01 }),
  KORN({ id: 'ko2', kapitel: 30, sortArt: 'karten', ico: '🎲', titel: 'Drei Säcke', lohn: 45,
    ziel: 'Sortiere drei verdeckte Säcke – für jede der 6 möglichen Reihenfolgen.',
    listen: permutationen([4, 7, 9]), befehle: [...B_KARTEN, K_B('def tausche(i, j):')],
    tipps: ['Erst den schwersten nach hinten bringen: 0 mit 1, dann 1 mit 2. Dann vorn noch einmal 0 mit 1.', 'Dreimal dasselbe Tauschen abschreiben ist mühsam. Schreib dir einen eigenen Befehl: def tausche(i, j): mit temp = a[i] …', 'def tausche(i, j): temp = a[i] · a[i] = a[j] · a[j] = temp – dann: if a[0] > a[1]: tausche(0, 1)'],
    loesung: 'def tausche(i, j):\n    temp = a[i]\n    a[i] = a[j]\n    a[j] = temp\n\nif a[0] > a[1]:\n    tausche(0, 1)\nif a[1] > a[2]:\n    tausche(1, 2)\nif a[0] > a[1]:\n    tausche(0, 1)' }),
  KORN({ id: 'ko3', kapitel: 30, sortArt: 'karten', ico: '🏋️', titel: 'Der Schwerste nach hinten', lohn: 50, zielArt: 'maxHinten',
    ziel: 'Bring den schwersten Sack ans Ende – egal, wie viele Säcke es sind (len(a)).',
    listen: [zufallsListe(6, 1), zufallsListe(8, 2), zufallsListe(5, 3)], befehle: B_KARTEN,
    tipps: ['Geh mit einer Schleife durch alle Nachbarpaare: for i in range(len(a) - 1):', 'Paar i und i + 1: ist a[i] schwerer, tauschen. So wandert der Schwerste mit nach hinten.', 'if a[i] > a[i + 1]: temp = a[i] · a[i] = a[i + 1] · a[i + 1] = temp'],
    loesung: 'for i in range(len(a) - 1):\n    if a[i] > a[i + 1]:\n        temp = a[i]\n        a[i] = a[i + 1]\n        a[i + 1] = temp' }),
  KORN({ id: 'ko3v', kapitel: 30, sortArt: 'vorher', ico: '🔮', titel: 'Ein Durchlauf', lohn: 50,
    ziel: 'Lies den Code und sag voraus, was passiert – bevor er läuft.',
    listen: [[5, 1, 4, 2, 3]],
    code: 'for i in range(4):\n    if a[i] > a[i + 1]:\n        temp = a[i]\n        a[i] = a[i + 1]\n        a[i + 1] = temp',
    fragen: [{ art: 'zahl', text: 'Wie viele Vergleiche macht der Code?', soll: (l) => l.v },
      { art: 'liste', text: 'Wie stehen die Säcke danach? (Gewichte von vorn nach hinten, mit Leerzeichen)', soll: (l) => l.ende }],
    tipps: ['range(4) läuft mit i = 0, 1, 2, 3.', 'Der schwerste Sack wandert Schritt für Schritt nach hinten.'] }),
  KORN({ id: 'ko4', kapitel: 30, sortArt: 'karten', ico: '📦', titel: 'Alles sortieren', lohn: 55,
    ziel: 'Sortiere alle Säcke, der leichteste vorn – auch wenn es mehr sind.',
    listen: [zufallsListe(6, 4), zufallsListe(7, 5), [9, 8, 7, 6, 5, 4]], befehle: B_KARTEN,
    tipps: ['Ein Durchlauf bringt den Schwersten nach hinten. Was, wenn du den Durchlauf wiederholst?', 'Nach n − 1 Durchläufen steht alles richtig: eine Schleife um deinen Durchlauf. Für den ⭐: Nach Durchlauf i stehen hinten schon i Säcke fertig – die musst du nicht mehr vergleichen.', 'for i in range(len(a) - 1): for j in range(len(a) - 1 - i): if a[j] > a[j + 1]: … tauschen'],
    // Musterlösung ohne die schon fertigen hinteren Säcke (Spieltest: mit range(len(a) - 1) innen lag die ⭐-Grenze bei 36 statt 21)
    loesung: 'for i in range(len(a) - 1):\n    for j in range(len(a) - 1 - i):\n        if a[j] > a[j + 1]:\n            temp = a[j]\n            a[j] = a[j + 1]\n            a[j + 1] = temp' }),
  KORN({ id: 'ko5', kapitel: 30, sortArt: 'karten', knobel: true, ico: '🧠', titel: 'Vier Säcke, fünf Striche', lohn: 70,
    ziel: 'Sortiere vier Säcke mit höchstens 5 Vergleichen – in jeder der 24 Reihenfolgen.',
    listen: permutationen([2, 5, 7, 9]), befehle: [...B_KARTEN, K_B('def ordne(i, j):')], vMax: 5,
    tipps: ['Der normale Weg braucht 6 Vergleiche. Einer ist zu viel. Ein eigener Befehl def ordne(i, j): (vergleichen und wenn nötig tauschen) spart viel Schreibarbeit.', 'Sortiere erst die Paare (0,1) und (2,3) einzeln. Dann kennst du in jedem Paar den leichteren.', 'Paare (0,1), (2,3), dann (0,2), (1,3), zum Schluss (1,2).'],
    loesung: 'def ordne(i, j):\n    if a[i] > a[j]:\n        temp = a[i]\n        a[i] = a[j]\n        a[j] = temp\n\nordne(0, 1)\nordne(2, 3)\nordne(0, 2)\nordne(1, 3)\nordne(1, 2)' }),

  // --- Kapitel 31: 🫧 Bubblesort (2.2.2) ---
  KORN({ id: 'kb1', kapitel: 31, sortArt: 'funktion', funktion: 'bubblesort', nurTemp: true, ico: '🫧', titel: 'Bubblesort', lohn: 55,
    ziel: 'Schreib die Funktion bubblesort(a). Sie sortiert die Liste a aufsteigend.',
    story: 'Jetzt sind die Säcke offen – du siehst die Gewichte. Vergleichen und Tauschen mit temp kennst du schon; jetzt kommt alles in eine eigene Funktion bubblesort(a).',
    listen: [zufallsListe(6, 11), zufallsListe(8, 12), [6, 5, 4, 3, 2, 1]], befehle: B_LISTE, neu: B_LISTE,
    merke: { titel: '🫧 Bubblesort', text: 'Bubblesort vergleicht immer zwei Nachbarn und tauscht sie, wenn der vordere größer ist. Nach jedem Durchlauf steht der größte Wert hinten wie eine aufsteigende Blase. Getauscht wird mit einem Zwischenspeicher temp.', code: '1. Durchlauf mit [6, 2, 7, 3]:\n[6, 2, 7, 3]  6 > 2 → tauschen\n[2, 6, 7, 3]  6 > 7? nein\n[2, 6, 7, 3]  7 > 3 → tauschen\n[2, 6, 3, 7]  die 7 ist fertig' },
    tipps: ['Zwei Schleifen: außen die Durchläufe, innen die Nachbarpaare.', 'Im Durchlauf i sind hinten schon i Säcke fertig: for j in range(n - 1 - i).', 'n = len(a) · for i in range(n - 1): for j in range(n - 1 - i): if a[j] > a[j + 1]: temp …'],
    loesung: 'def bubblesort(a):\n    n = len(a)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if a[j] > a[j + 1]:\n                temp = a[j]\n                a[j] = a[j + 1]\n                a[j + 1] = temp' }),
  KORN({ id: 'kb1v', kapitel: 31, sortArt: 'vorher', funktion: 'bubblesort', ico: '🔮', titel: 'Blasen zählen', lohn: 55,
    ziel: 'Lies den Bubblesort und sag voraus, was er mit dieser Liste macht.',
    listen: [[5, 1, 4, 2, 8]],
    code: 'def bubblesort(a):\n    n = len(a)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if a[j] > a[j + 1]:\n                temp = a[j]\n                a[j] = a[j + 1]\n                a[j + 1] = temp',
    fragen: [{ art: 'liste', text: 'Wie steht die Liste nach dem 1. Durchlauf (i = 0)?', soll: () => [1, 4, 2, 5, 8] },
      { art: 'zahl', text: 'Wie viele Vergleiche macht bubblesort insgesamt?', soll: (l) => l.v },
      { art: 'zahl', text: 'Wie oft wird getauscht? (Tipp: Zähle die Fehlstellungen – Paare, die falsch herum stehen.)', soll: (l) => l.z / 2 }],
    tipps: ['Im 1. Durchlauf wandert die 5 nach hinten, bis sie auf die 8 trifft.', 'Vergleiche: 4 + 3 + 2 + 1.'] }),
  KORN({ id: 'kb2', kapitel: 31, sortArt: 'funktion', funktion: 'bubblesort', nurTemp: true, ico: '🛑', titel: 'Früher aufhören', lohn: 60,
    ziel: 'Schreib bubblesort(a) mit Abbruch: Ist ein Durchlauf ohne Tausch, ist die Liste fertig. Bei einer sortierten Liste reichen n − 1 Vergleiche, bei einer fast sortierten (nur ein Paar vertauscht) 2·(n − 1).',
    listen: [zufallsListe(7, 21), [1, 2, 3, 4, 5, 6, 7, 8], [2, 1, 3, 4, 5, 6, 7]], befehle: [...B_LISTE, K_B('getauscht = False'), K_B('if not getauscht:'), K_B('break')],
    // fast sortiert (Spieltest): getauscht = False nur EINMAL vor der äußeren Schleife bricht nie ab – das fällt erst hier auf
    grenze: (liste, l) => {
      const n = liste.length, fehl = liste.reduce((s, x, i) => s + liste.slice(i + 1).filter((y) => y < x).length, 0);
      if (!fehl && l.v > n - 1) return `Die Liste war schon sortiert, trotzdem ${l.v} Vergleiche – merk dir mit getauscht, ob in einem Durchlauf etwas passiert ist.`;
      if (fehl === 1 && l.v > 2 * (n - 1)) return `Die Liste war fast sortiert (nur ein Paar vertauscht): Nach dem 2. Durchlauf ohne Tausch müsste Schluss sein, es waren aber ${l.v} Vergleiche (erlaubt ${2 * (n - 1)}). Setzt du getauscht = False vor JEDEM Durchlauf zurück?`;
      return null;
    },
    merke: { titel: '🛑 Abbruch mit getauscht', text: 'Wird in einem ganzen Durchlauf nichts getauscht, ist die Liste sortiert. Dann kann Bubblesort aufhören. Im besten Fall (schon sortiert) braucht er nur n − 1 Vergleiche.', code: 'getauscht = False\n…\nif not getauscht:\n    break' },
    tipps: ['Vor jedem Durchlauf: getauscht = False. Beim Tauschen: getauscht = True.', 'Nach dem Durchlauf: if not getauscht: break', 'Die äußere Schleife darf auch while getauscht: sein.'],
    loesung: 'def bubblesort(a):\n    n = len(a)\n    for i in range(n - 1):\n        getauscht = False\n        for j in range(n - 1 - i):\n            if a[j] > a[j + 1]:\n                temp = a[j]\n                a[j] = a[j + 1]\n                a[j + 1] = temp\n                getauscht = True\n        if not getauscht:\n            break' }),
  KORN({ id: 'kb3', kapitel: 31, sortArt: 'funktion', funktion: 'bubblesort', nurTemp: true, ico: '🐞', titel: 'Wo sind die Säcke hin?', lohn: 60,
    ziel: 'Dieser Bubblesort verliert Säcke. Finde den Fehler und repariere ihn.',
    vorlage: 'def bubblesort(a):\n    n = len(a)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if a[j] > a[j + 1]:\n                a[j] = a[j + 1]\n                a[j + 1] = a[j]',
    listen: [zufallsListe(6, 31), [4, 3, 2, 1]], befehle: B_LISTE,
    tipps: ['Lass ihn laufen und schau, welche Zahl doppelt auftaucht.', 'Nach a[j] = a[j + 1] ist der alte Wert von a[j] weg.', 'Merk dir a[j] vorher in temp.'],
    loesung: 'def bubblesort(a):\n    n = len(a)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if a[j] > a[j + 1]:\n                temp = a[j]\n                a[j] = a[j + 1]\n                a[j + 1] = temp' }),
  KORN({ id: 'kb4', kapitel: 31, sortArt: 'funktion', funktion: 'bubblesort', nurTemp: true, ico: '🔽', titel: 'Schwere zuerst', lohn: 60, zielArt: 'absteigend',
    ziel: 'Auf den Wagen kommen die schweren Säcke zuerst: Schreib bubblesort(a) so, dass er absteigend sortiert, der schwerste vorn.',
    listen: [zufallsListe(7, 41), [1, 2, 3, 4, 5, 6]], befehle: B_LISTE,
    tipps: ['Es ändert sich nur eine Stelle.', 'Getauscht wird jetzt, wenn der vordere leichter ist.', 'if a[j] < a[j + 1]:'],
    loesung: 'def bubblesort(a):\n    n = len(a)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if a[j] < a[j + 1]:\n                temp = a[j]\n                a[j] = a[j + 1]\n                a[j + 1] = temp' }),
  KORN({ id: 'kb5', kapitel: 31, sortArt: 'funktion', funktion: 'bubblesort', nurTemp: true, knobel: true, ico: '🐢', titel: 'Hasen und Schildkröten', lohn: 75,
    ziel: 'Ein leichter Sack ganz hinten (eine „Schildkröte“) wandert pro Durchlauf nur einen Platz nach vorn. Schreib bubblesort(a) so, dass diese Listen mit höchstens 3·(n − 1) Vergleichen sortiert sind – und sortiere trotzdem jede Liste.',
    listen: [[2, 3, 4, 5, 6, 7, 8, 1], [3, 4, 5, 6, 7, 8, 9, 10, 2], zufallsListe(7, 81)], befehle: B_LISTE,
    grenze: (liste, l) => (liste.length >= 8 && l.v > 3 * (liste.length - 1) ? `${l.v} Vergleiche – erlaubt sind höchstens ${3 * (liste.length - 1)}. Die Schildkröte hinten kommt zu langsam nach vorn.` : null),
    tipps: ['Bubblesort schiebt große Werte schnell nach hinten (Hasen), kleine nur langsam nach vorn (Schildkröten).', 'Lauf abwechselnd vorwärts und rückwärts (Shakersort) – mit Abbruch.', 'Rückwärts: for j in range(n - 2, -1, -1): wenn a[j] > a[j + 1], tauschen.'],
    loesung: 'def bubblesort(a):\n    n = len(a)\n    getauscht = True\n    while getauscht:\n        getauscht = False\n        for j in range(n - 1):\n            if a[j] > a[j + 1]:\n                temp = a[j]\n                a[j] = a[j + 1]\n                a[j + 1] = temp\n                getauscht = True\n        if not getauscht:\n            break\n        getauscht = False\n        for j in range(n - 2, -1, -1):\n            if a[j] > a[j + 1]:\n                temp = a[j]\n                a[j] = a[j + 1]\n                a[j + 1] = temp\n                getauscht = True' }),

  // --- Kapitel 32: 👉 Selection- und Insertionsort (2.2.5) ---
  KORN({ id: 'ks1', kapitel: 32, sortArt: 'funktion', funktion: 'selectionsort', nurTemp: true, ico: '👉', titel: 'Selectionsort', lohn: 60,
    ziel: 'Schreib selectionsort(a): Such im unsortierten Rest den kleinsten Wert (min_pos) und tausch ihn nach vorn. Höchstens n − 1 Tausche!',
    listen: [zufallsListe(7, 51), zufallsListe(6, 52), [5, 4, 3, 2, 1]], befehle: [K_B('def selectionsort(a):'), K_B('min_pos = i'), K_B('for j in range(i + 1, len(a)):'), K_B('if a[j] < a[min_pos]:'), K_B('temp = a[i]')],
    grenze: (liste, l) => (l.z > 2 * (liste.length - 1) ? `${l.z / 2} Tausche – Selectionsort tauscht höchstens einmal pro Durchlauf (n − 1 = ${liste.length - 1}).` : null),
    merke: { titel: '👉 Selectionsort', text: 'Selectionsort sucht im unsortierten Teil die Position des kleinsten Werts (min_pos) und tauscht ihn an den Anfang dieses Teils. So wächst vorn der sortierte Teil. Er vergleicht immer n·(n−1)/2-mal, tauscht aber höchstens n − 1-mal.', code: '[7, 4, 1, 9, 6]   kleinster ab Platz 0: die 1 (min_pos = 2)\n[1, 4, 7, 9, 6]   Platz 0 ↔ Platz 2 getauscht\n[1, 4, 7, 9, 6]   kleinster ab Platz 1: die 4 – bleibt\n[1, 4, 6, 9, 7]   kleinster ab Platz 2: die 6 …' },
    tipps: ['Außen: for i in range(len(a) - 1). Innen suchst du min_pos ab i + 1.', 'Getauscht wird erst nach der inneren Schleife: a[i] mit a[min_pos].', 'temp = a[i] · a[i] = a[min_pos] · a[min_pos] = temp'],
    loesung: 'def selectionsort(a):\n    for i in range(len(a) - 1):\n        min_pos = i\n        for j in range(i + 1, len(a)):\n            if a[j] < a[min_pos]:\n                min_pos = j\n        temp = a[i]\n        a[i] = a[min_pos]\n        a[min_pos] = temp' }),
  KORN({ id: 'ks1v', kapitel: 32, sortArt: 'vorher', funktion: 'selectionsort', ico: '🔮', titel: 'Der kleinste nach vorn', lohn: 60,
    ziel: 'Lies den Selectionsort und sag voraus, was er macht.',
    listen: [[6, 3, 8, 2, 5]],
    code: 'def selectionsort(a):\n    for i in range(len(a) - 1):\n        min_pos = i\n        for j in range(i + 1, len(a)):\n            if a[j] < a[min_pos]:\n                min_pos = j\n        temp = a[i]\n        a[i] = a[min_pos]\n        a[min_pos] = temp',
    fragen: [{ art: 'zahl', text: 'Welchen Wert hat min_pos am Ende des 1. Durchlaufs (i = 0)?', soll: () => 3 },
      { art: 'liste', text: 'Wie steht die Liste nach 2 Durchläufen?', soll: () => [2, 3, 8, 6, 5] },
      { art: 'zahl', text: 'Wie viele Vergleiche macht selectionsort insgesamt?', soll: (l) => l.v }],
    tipps: ['min_pos ist eine Position (Index), kein Gewicht. Gezählt wird ab 0.', 'Vergleiche: 4 + 3 + 2 + 1 – egal, wie die Liste aussieht.'] }),
  KORN({ id: 'ks2', kapitel: 32, sortArt: 'funktion', funktion: 'insertionsort', ico: '🃏', titel: 'Insertionsort', lohn: 65,
    ziel: 'Schreib insertionsort(a): Nimm den nächsten Sack (temp) und schieb größere Säcke nach rechts, bis seine Lücke frei ist.',
    listen: [zufallsListe(7, 61), [1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1]], befehle: [K_B('def insertionsort(a):'), K_B('temp = a[i]'), K_B('while ¦:'), K_B('a[j + 1] = ¦'), K_B('j >= 0')],   // nicht mehr die ganze Lösung (Didaktik-Prüfung)
    grenze: (liste, l) => (liste.every((x, i) => !i || liste[i - 1] <= x) && l.v > liste.length - 1 ? `Die Liste war schon sortiert, trotzdem ${l.v} Vergleiche. Insertionsort hört beim ersten kleineren Sack auf zu suchen.` : null),
    merke: { titel: '🃏 Insertionsort', text: 'Insertionsort sortiert wie beim Kartenspiel: Er nimmt den nächsten Wert und schiebt alle größeren im sortierten Teil eine Stelle nach rechts. Dann setzt er den Wert in die Lücke. Bei einer fast sortierten Liste ist er sehr schnell.', code: 'sortiert | Rest\n[2, 5, 7 | 4, 1]   temp = 4\n[2, 5, _, 7 | 1]   7 > 4 → 7 rückt nach rechts\n[2, _, 5, 7 | 1]   5 > 4 → 5 rückt nach rechts\n[2, 4, 5, 7 | 1]   2 > 4? nein → 4 in die Lücke' },
    tipps: ['Außen: for i in range(1, len(a)).', 'Innen eine while-Schleife: solange j >= 0 und a[j] > temp, rückt a[j] nach rechts.', 'Am Ende: a[j + 1] = temp'],
    loesung: 'def insertionsort(a):\n    for i in range(1, len(a)):\n        temp = a[i]\n        j = i - 1\n        while j >= 0 and a[j] > temp:\n            a[j + 1] = a[j]\n            j = j - 1\n        a[j + 1] = temp' }),
  KORN({ id: 'ks2v', kapitel: 32, sortArt: 'vorher', funktion: 'insertionsort', ico: '🔮', titel: 'Glück gehabt?', lohn: 65,
    ziel: 'Wie viele Vergleiche braucht Insertionsort? Sag es voraus.',
    listen: [[1, 2, 3, 4, 5, 6]],
    code: 'def insertionsort(a):\n    for i in range(1, len(a)):\n        temp = a[i]\n        j = i - 1\n        while j >= 0 and a[j] > temp:\n            a[j + 1] = a[j]\n            j = j - 1\n        a[j + 1] = temp',
    fragen: [{ art: 'zahl', text: 'Die Liste ist schon sortiert (6 Säcke). Wie viele Vergleiche a[j] > temp?', soll: (l) => l.v },
      { art: 'zahl', text: 'Und wenn sie genau falsch herum steht (6, 5, 4, 3, 2, 1)?', soll: () => 15 },
      // ohne O-Notation – die kommt erst im Messlabor (Kapitel 33, Spieltest)
      { art: 'wahl', text: 'Die sortierte Liste wird doppelt so lang (12 Säcke). Wie viele Vergleiche braucht Insertionsort dann?', optionen: ['etwa doppelt so viele', 'etwa viermal so viele', 'genauso viele', 'nur einer mehr'], richtig: 0 }],
    tipps: ['Bei einer sortierten Liste ist a[j] > temp sofort falsch.', 'Falsch herum muss jeder Sack an den ganz vorn: 1 + 2 + 3 + 4 + 5.'] }),
  KORN({ id: 'ks3', kapitel: 32, sortArt: 'funktion', funktion: 'insertionsort', ico: '🐞', titel: 'Der erste bleibt stehen', lohn: 65,
    ziel: 'Dieser Insertionsort lässt manchmal den ersten Sack falsch stehen. Finde den Fehler.',
    vorlage: 'def insertionsort(a):\n    for i in range(1, len(a)):\n        temp = a[i]\n        j = i - 1\n        while j > 0 and a[j] > temp:\n            a[j + 1] = a[j]\n            j = j - 1\n        a[j + 1] = temp',
    listen: [[5, 1, 4, 2, 3], zufallsListe(6, 71)], befehle: [],
    tipps: ['Schau, mit welchem j die Schleife aufhört.', 'Auch Position 0 muss verglichen werden.', 'while j >= 0 and …'],
    loesung: 'def insertionsort(a):\n    for i in range(1, len(a)):\n        temp = a[i]\n        j = i - 1\n        while j >= 0 and a[j] > temp:\n            a[j + 1] = a[j]\n            j = j - 1\n        a[j + 1] = temp' }),

  // Didaktik-Prüfung: Datensätze nach einem Attribut und Stabilität standen nur im Merke → eigener Auftrag + Transfer
  KORN({ id: 'ks4', kapitel: 32, sortArt: 'funktion', funktion: 'bestenliste', zielArt: 'wert', ico: '🏆', titel: 'Bestenliste', lohn: 70,
    ziel: 'Schreib bestenliste(liste): Jeder Eintrag ist [name, punkte]. Sortiere mit Insertionsort absteigend nach den Punkten und gib die Liste zurück. Wer gleich viele Punkte hat, bleibt in der alten Reihenfolge (stabil).',
    story: 'Nach dem Erntefest will ich eine Bestenliste der Sackträger aushängen. Die Liste ist nach der Anmeldung geordnet – und wer gleich viele Punkte hat, soll in dieser Reihenfolge stehen bleiben. Wer sich zuerst angemeldet hat, steht weiter vorn.',
    listen: [[], [], [], []], aufrufFn: (l, k) => `bestenliste(${JSON.stringify(BESTE[k])})`,
    soll: (l, k) => [...BESTE[k]].sort((x, y) => y[1] - x[1]),
    // eigene Prüfung: „nach Punkten richtig, aber nicht stabil“ eigens erklären
    pruefWert: (w, k) => {
      const soll = [...BESTE[k]].sort((x, y) => y[1] - x[1]);
      if (gleichWert(w, soll)) return null;
      if (Array.isArray(w) && w.length === soll.length && w.every((e, i) => Array.isArray(e) && e[1] === soll[i][1])) return `Nach Punkten richtig – aber Einträge mit gleichen Punkten stehen anders als vorher: ${ergebnisText(w)}. Das ist nicht stabil. Rückt ein Eintrag auch bei GLEICHEN Punkten nach rechts?`;
      return `Ergebnis ${ergebnisText(w)} – richtig wäre ${ergebnisText(soll)}.`;
    },
    okText: () => 'Richtig sortiert – und stabil ✓',
    befehle: [K_B('def bestenliste(liste):'), K_B('for i in range(1, len(liste)):'), K_B('temp = ¦'), K_B('liste[j][1]'), K_B('return liste')],
    merke: { titel: '🏆 Datensätze sortieren, stabil', text: 'Ein Datensatz besteht aus mehreren Attributen, z. B. [name, punkte]. Sortiert wird nach einem Attribut (dem Schlüssel), verschoben wird aber immer der ganze Datensatz. Ein Verfahren ist stabil, wenn Datensätze mit gleichem Schlüssel ihre alte Reihenfolge behalten.', code: 'vorher:  [Ada, 7] [Ben, 9] [Cem, 7]\nstabil:  [Ben, 9] [Ada, 7] [Cem, 7]\ninstabil:[Ben, 9] [Cem, 7] [Ada, 7]' },
    tipps: ['Wie Insertionsort – nur vergleichst du liste[j][1] (die Punkte) mit temp[1] und verschiebst den ganzen Eintrag.', 'Absteigend: Ein Eintrag rückt nach rechts, solange er WENIGER Punkte hat als temp.', 'Stabil bleibt es nur mit < – mit <= springt temp über gleich gute Einträge hinweg: while j >= 0 and liste[j][1] < temp[1]:'],
    loesung: 'def bestenliste(liste):\n    for i in range(1, len(liste)):\n        temp = liste[i]\n        j = i - 1\n        while j >= 0 and liste[j][1] < temp[1]:\n            liste[j + 1] = liste[j]\n            j = j - 1\n        liste[j + 1] = temp\n    return liste' }),
  KORN({ id: 'ks5', kapitel: 32, sortArt: 'funktion', funktion: 'register', zielArt: 'wert', ico: '📒', titel: 'Das Lagerregister', lohn: 75,
    ziel: 'Schreib register(saecke): Jeder Sack ist [dorf, gewicht]. Sortiere mit Selectionsort zuerst nach dem Dorf (alphabetisch), im selben Dorf den schwersten zuerst. Gib die Liste zurück.',
    story: 'Die Fuhrleute holen die Säcke Dorf für Dorf ab – und laden im selben Dorf die schweren zuerst auf, die leichten obenauf. Kannst du mein Register so ordnen? Zwei Regeln auf einmal: Das ist neu.',
    listen: [[], [], []], aufrufFn: (l, k) => `register(${JSON.stringify(REGISTER[k])})`,
    soll: (l, k) => [...REGISTER[k]].sort((x, y) => (x[0] === y[0] ? y[1] - x[1] : x[0] < y[0] ? -1 : 1)),
    befehle: [K_B('def register(saecke):'), K_B('def kommt_vor(x, y):'), K_B('min_pos = i'), K_B('return saecke')],
    tipps: ['Schreib dir zuerst eine Funktion kommt_vor(x, y): Sie gibt True zurück, wenn Sack x vor Sack y gehört.', 'In kommt_vor: Sind die Dörfer verschieden, entscheidet das Dorf (x[0] < y[0]). Sonst entscheidet das Gewicht – der schwerere zuerst (x[1] > y[1]).', 'Dann Selectionsort wie gewohnt, nur mit if kommt_vor(saecke[j], saecke[min_pos]): statt des <-Vergleichs.'],
    loesung: 'def kommt_vor(x, y):\n    if x[0] != y[0]:\n        return x[0] < y[0]\n    return x[1] > y[1]\n\ndef register(saecke):\n    for i in range(len(saecke) - 1):\n        min_pos = i\n        for j in range(i + 1, len(saecke)):\n            if kommt_vor(saecke[j], saecke[min_pos]):\n                min_pos = j\n        temp = saecke[i]\n        saecke[i] = saecke[min_pos]\n        saecke[min_pos] = temp\n    return saecke' }),

  // --- Kapitel 33: 🔬 Messlabor (2.2.3 / 2.2.4) ---
  KORN({ id: 'kl1', kapitel: 33, sortArt: 'messen', ico: '🔬', titel: 'Verdopplungsexperiment', lohn: 70, merkeNach: true,   // Merke verrät die Antworten → erst danach (Didaktik-Prüfung)
    ziel: 'Miss Bubblesort auf immer längeren Listen. Was passiert, wenn n sich verdoppelt?',
    story: 'Die Müllerei wächst: Bald sind es nicht 8, sondern Tausende Säcke. Wie lange braucht dein Bubblesort dann? Im Messlabor zählt das Spiel für dich.',
    code: 'def bubblesort(a):\n    n = len(a)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if a[j] > a[j + 1]:\n                temp = a[j]\n                a[j] = a[j + 1]\n                a[j + 1] = temp',
    messen: { groessen: [10, 20, 40, 80, 160, 320], aufrufe: [{ name: 'bubblesort', aufruf: 'bubblesort(a)', liste: 'zufall' }] },
    fragen: [{ art: 'zahl', text: 'Ungefähr um welchen Faktor wachsen die Vergleiche, wenn sich n verdoppelt?', soll: () => 4, tol: 0.15 },
      { art: 'wahl', text: 'Welche Zeitkomplexität hat Bubblesort?', optionen: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'], richtig: 2 }],
    merke: { titel: '🔬 O-Notation', text: 'Die O-Notation sagt, wie der Aufwand wächst, wenn die Eingabe größer wird – Konstanten fallen weg. Verdoppelt sich n und vervierfacht sich der Aufwand, ist das O(n²). Klassen: O(1) ⊂ O(log n) ⊂ O(n) ⊂ O(n log n) ⊂ O(n²) ⊂ O(2ⁿ).', code: 'n·(n−1)/2 Vergleiche → O(n²)' },
    tipps: ['Teile den Wert in einer Zeile durch den Wert in der Zeile davor.', 'n·(n−1)/2 – was passiert mit n², wenn n doppelt so groß ist?'] }),
  KORN({ id: 'kl2', kapitel: 33, sortArt: 'messen', ico: '📦', titel: 'Drei Rätselkisten', lohn: 75, geheim: true,
    ziel: 'Drei Verfahren, deren Code geheim ist. Nur die Messwerte verraten, wie schnell sie wachsen.',
    code: 'def kiste_a(a, x):\n    for i in range(len(a)):\n        if a[i] == x:\n            return i\n    return -1\n\ndef kiste_b(a, x):\n    links = 0\n    rechts = len(a) - 1\n    while links <= rechts:\n        mitte = (links + rechts) // 2\n        if a[mitte] == x:\n            return mitte\n        if a[mitte] < x:\n            links = mitte + 1\n        else:\n            rechts = mitte - 1\n    return -1\n\ndef kiste_c(a):\n    paare = 0\n    for i in range(len(a)):\n        for j in range(i + 1, len(a)):\n            if a[i] > a[j]:\n                paare = paare + 1\n    return paare',
    messen: { groessen: [16, 32, 64, 128, 256, 512], aufrufe: [{ name: 'Kiste A', aufruf: 'kiste_a(a, a[n - 1])', liste: 'sortiert' }, { name: 'Kiste B', aufruf: 'kiste_b(a, a[n - 1])', liste: 'sortiert' }, { name: 'Kiste C', aufruf: 'kiste_c(a)', liste: 'zufall' }] },
    fragen: ['A', 'B', 'C'].map((k, i) => ({ art: 'wahl', text: `Welche Zeitkomplexität hat Kiste ${k}?`, optionen: ['O(log n)', 'O(n)', 'O(n²)', 'O(2ⁿ)'], richtig: [1, 0, 2][i] })),
    tipps: ['Wächst der Wert um einen festen Betrag, wenn n sich verdoppelt? Dann ist es O(log n).', 'Verdoppelt er sich mit n, ist es O(n); vervierfacht er sich, O(n²).'] }),
  KORN({ id: 'kl3', kapitel: 33, sortArt: 'messen', ico: '🧮', titel: 'Der Hochrechner', lohn: 75,
    ziel: 'Rechne hoch: Wie lange bräuchte Selectionsort für 50 000 Songs?',
    story: 'Ein Streamingdienst will seine Songs sortieren – mit Selectionsort. Sein Rechner schafft 10 Millionen Vergleiche pro Sekunde. Reicht das?',
    code: 'def selectionsort(a):\n    for i in range(len(a) - 1):\n        min_pos = i\n        for j in range(i + 1, len(a)):\n            if a[j] < a[min_pos]:\n                min_pos = j\n        temp = a[i]\n        a[i] = a[min_pos]\n        a[min_pos] = temp',
    messen: { groessen: [10, 20, 40, 80, 160, 320], aufrufe: [{ name: 'selectionsort', aufruf: 'selectionsort(a)', liste: 'zufall' }] },
    fragen: [{ art: 'zahl', text: 'Wie viele Vergleiche braucht Selectionsort für n = 50 000? (Formel aus der Tabelle: n·(n−1)/2)', soll: () => 50000 * 49999 / 2, tol: 0.03 },
      { art: 'zahl', text: 'Wie viele Sekunden sind das bei 10 Millionen Vergleichen pro Sekunde?', soll: () => 50000 * 49999 / 2 / 1e7, tol: 0.05 },
      { art: 'wahl', text: 'Und bei 100 Millionen Songs? (n wird 2000-mal so groß)', optionen: ['etwa 2000-mal so lange', 'etwa 4 Millionen-mal so lange', 'etwa 45 000-mal so lange', 'etwa 2 Milliarden-mal so lange'], richtig: 1 }],
    tipps: ['Setz n = 50 000 in n·(n−1)/2 ein – ungefähr n²/2.', 'Vergleiche geteilt durch 10 000 000.'] }),
  KORN({ id: 'kl4', kapitel: 33, sortArt: 'messen', ico: '🍀', titel: 'Glück und Pech', lohn: 75,
    ziel: 'Insertionsort einmal auf sortierten, einmal auf umgekehrten Listen: bester und schlechtester Fall.',
    code: 'def insertionsort(a):\n    for i in range(1, len(a)):\n        temp = a[i]\n        j = i - 1\n        while j >= 0 and a[j] > temp:\n            a[j + 1] = a[j]\n            j = j - 1\n        a[j + 1] = temp',
    messen: { groessen: [10, 20, 40, 80, 160, 320], aufrufe: [{ name: 'sortiert (best case)', aufruf: 'insertionsort(a)', liste: 'sortiert' }, { name: 'umgekehrt (worst case)', aufruf: 'insertionsort(a)', liste: 'umgekehrt' }] },
    fragen: [{ art: 'wahl', text: 'Bester Fall (schon sortiert):', optionen: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'], richtig: 1 },
      { art: 'wahl', text: 'Schlechtester Fall (umgekehrt):', optionen: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'], richtig: 2 },
      { art: 'wahl', text: 'Welches Verfahren nimmst du für eine Liste, die fast sortiert ist?', optionen: ['Selectionsort – er vergleicht immer gleich oft', 'Insertionsort – im besten Fall fast linear', 'Bubblesort ohne Abbruch', 'Egal, alle O(n²)'], richtig: 1 }],
    tipps: ['Schau, wie die beiden Spalten wachsen, wenn n sich verdoppelt.'] }),
);

// --- Kapitel 34 und 35 (Kurs 2.2.7–2.2.9b) ---
const C_GEWICHT = 'def gewicht(a, i):\n    if i == len(a):\n        return 0\n    return a[i] + gewicht(a, i + 1)';
const C_BINAER = 'def binaere_suche(a, x, links, rechts):\n    if links > rechts:\n        return -1\n    mitte = (links + rechts) // 2\n    if a[mitte] == x:\n        return mitte\n    if a[mitte] < x:\n        return binaere_suche(a, x, mitte + 1, rechts)\n    return binaere_suche(a, x, links, mitte - 1)';
const C_MERGE = 'def merge(links, rechts):\n    ergebnis = []\n    i = 0\n    j = 0\n    while i < len(links) and j < len(rechts):\n        if links[i] <= rechts[j]:\n            ergebnis.append(links[i])\n            i = i + 1\n        else:\n            ergebnis.append(rechts[j])\n            j = j + 1\n    while i < len(links):\n        ergebnis.append(links[i])\n        i = i + 1\n    while j < len(rechts):\n        ergebnis.append(rechts[j])\n        j = j + 1\n    return ergebnis';
const C_MERGESORT = C_MERGE + '\n\ndef mergesort(a):\n    if len(a) <= 1:\n        return a\n    mitte = len(a) // 2\n    links = mergesort(a[:mitte])\n    rechts = mergesort(a[mitte:])\n    return merge(links, rechts)';
const C_QUICK = 'def quicksort(a):\n    if len(a) <= 1:\n        return a\n    pivot = a[len(a) - 1]\n    kleiner = []\n    gleich = []\n    groesser = []\n    for x in a:\n        if x < pivot:\n            kleiner.append(x)\n        elif x == pivot:\n            gleich.append(x)\n        else:\n            groesser.append(x)\n    return quicksort(kleiner) + gleich + quicksort(groesser)';
const C_QUICK_INPLACE = 'def quicksort(a, links, rechts):\n    if links >= rechts:\n        return\n    pivot = a[rechts]\n    grenze = links\n    for i in range(links, rechts):\n        if a[i] < pivot:\n            temp = a[i]\n            a[i] = a[grenze]\n            a[grenze] = temp\n            grenze = grenze + 1\n    temp = a[grenze]\n    a[grenze] = a[rechts]\n    a[rechts] = temp\n    quicksort(a, links, grenze - 1)\n    quicksort(a, grenze + 1, rechts)';
const C_BUBBLE = 'def bubblesort(a):\n    n = len(a)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if a[j] > a[j + 1]:\n                temp = a[j]\n                a[j] = a[j + 1]\n                a[j + 1] = temp';
const C_INSERTION = 'def insertionsort(a):\n    for i in range(1, len(a)):\n        temp = a[i]\n        j = i - 1\n        while j >= 0 and a[j] > temp:\n            a[j + 1] = a[j]\n            j = j - 1\n        a[j + 1] = temp';
const maxTiefe = (l, name) => Math.max(0, ...(l.ev || []).filter((e) => e[0] === 'call' && (!name || e[1] === name)).map((e) => e[2]));
const aufrufZahl = (l, name) => (l.ev || []).filter((e) => e[0] === 'call' && e[1] === name).length;
// O(n log n) erzwingen (km2, kq1): bei langen Listen höchstens faktor · n · ⌈log₂ n⌉ Vergleiche – ein innerer Bubble-/Insertionsort scheitert
const grenzeNlogN = (liste, l, faktor, warum) => {
  const n = liste.length;
  if (n < 16) return null;
  const max = Math.floor(faktor * n * Math.ceil(Math.log2(n)));
  return l.v > max ? `${l.v} Vergleiche bei ${n} Säcken – mit O(n log n) reichen höchstens ${max}. ${warum}` : null;
};
// Teile und herrsche erzwingen (kr3): der Aufrufstapel darf nur etwa log₂(n) tief werden – „erster Sack + Rest“ wird n tief
// Nachprüfung 2026-11-14: gezählt wird die Tiefe über ALLE eigenen Funktionen (eine linear rekursive Hilfsfunktion + Scheinaufruf bestand sonst);
// +1 Puffer für eine kleine Hilfsfunktion ganz unten (z. B. groesser(m1, m2)).
const grenzeHalbieren = (name) => (liste, l) => {
  const n = liste.length, erlaubt = Math.ceil(Math.log2(Math.max(1, n))) + 2, tief = maxTiefe(l);
  return n >= 4 && tief > erlaubt ? `Richtig – aber der Aufrufstapel wurde ${tief} tief (bei Halbieren höchstens ${erlaubt}). Teilst du den Bereich wirklich in zwei Hälften und rufst ${name} für beide auf?` : null;
};
// kr4: binäre Suche – höchstens log₂(n + 1) Ebenen, dazu der Basisfall „nichts mehr übrig“ und eine Hilfsfunktion
const grenzeSuchTiefe = (liste, l) => {
  const n = liste.length, erlaubt = Math.ceil(Math.log2(n + 1)) + 2, tief = maxTiefe(l);
  return n >= 4 && tief > erlaubt ? `Richtig gefunden – aber der Aufrufstapel wurde ${tief} tief (beim Halbieren höchstens ${erlaubt}). Suchst du wirklich nur in der Hälfte weiter, in der x liegen kann?` : null;
};
const SUCHE_16 =Array.from({ length: 16 }, (_, i) => 3 * (i + 1));
const SUCHE_X = [33, 50, 3, 48];
const MERGE_TEIL = [4, 3, 1, 0];

// 🪞 kl5: Klasse aus dem Faktor beim Verdoppeln (160 → 320): ≈ 1 O(log n)… hier: < 1,5 O(log n), < 2,12 O(n), < 3 O(n log n), sonst O(n²)
const O_KLASSEN = ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'];
const oKlasse = (s) => { const r = s.at(-1) / Math.max(1, s.at(-2)); return r < 1.5 ? 0 : r < 2.12 ? 1 : r < 3 ? 2 : 3; };
const faktorVon = (s) => s.at(-1) / Math.max(1, s.at(-2));

HOEFE.push(
  // Didaktik-Prüfung: eigenen Code messen (Transfer) – das Messlabor nimmt den selbst geschriebenen Sortierer (kornMessCode)
  KORN({ id: 'kl5', kapitel: 33, sortArt: 'messen', ico: '🪞', titel: 'Miss dich selbst', lohn: 80,
    ziel: 'Diesmal misst das Messlabor DEINEN Code – den Sortierer, den du selbst geschrieben hast. Wie wächst er auf zufälligen und auf schon sortierten Listen?',
    story: 'Bisher hast du fremde Verfahren gemessen. Jetzt kommt dein eigener Sortierer auf den Prüfstand – genau der Code, mit dem du den Auftrag gelöst hast.',
    code: C_INSERTION,
    messen: { groessen: [10, 20, 40, 80, 160, 320], eigen: [['ks2', 'insertionsort'], ['ks1', 'selectionsort'], ['kb2', 'bubblesort'], ['kb5', 'bubblesort'], ['kb1', 'bubblesort']],
      aufrufe: [{ name: 'zufällig', aufruf: 'insertionsort(a)', liste: 'zufall' }, { name: 'schon sortiert', aufruf: 'insertionsort(a)', liste: 'sortiert' }] },
    fragen: [{ art: 'zahl', text: 'Zufällige Listen: Um welchen Faktor wachsen die Vergleiche deines Codes von n = 160 auf n = 320?', soll: (l, m) => faktorVon(m[0]), tol: 0.06 },
      { art: 'wahl', text: 'Welche Zeitkomplexität hat dein Code auf zufälligen Listen?', optionen: O_KLASSEN, richtig: 0, richtigFn: (l, m) => oKlasse(m[0]) },
      { art: 'wahl', text: 'Und auf schon sortierten Listen?', optionen: O_KLASSEN, richtig: 0, richtigFn: (l, m) => oKlasse(m[1]) },
      { art: 'zahl', text: 'Rechne hoch: Ungefähr wie viele Vergleiche bräuchte dein Code für 1280 zufällige Säcke? (Zweimal verdoppeln – nimm den Faktor aus der ersten Frage.)', soll: (l, m) => m[0].at(-1) * faktorVon(m[0]) ** 2, tol: 0.2 }],
    tipps: ['Teile den Wert bei n = 320 durch den Wert bei n = 160.', 'Faktor ≈ 2 → O(n), etwas mehr als 2 → O(n log n), ≈ 4 → O(n²).', '1280 = 320 · 2 · 2: zweimal mit dem Faktor malnehmen.'] }),

  // --- Kapitel 34: 🪆 Rekursion und Teile und herrsche (2.2.7, 2.2.8) ---
  KORN({ id: 'kr1', kapitel: 34, sortArt: 'funktion', funktion: 'gewicht', rekursiv: 'gewicht', sprache: S_REK, zielArt: 'wert', ico: '🪆', titel: 'Gewicht ohne Schleife', lohn: 65,
    ziel: 'Schreib gewicht(a, i): das Gesamtgewicht aller Säcke ab Position i – rekursiv, ohne for und while.',
    story: 'Der Händler will wissen, wie schwer die ganze Ladung ist. Eine Schleife ist heute kaputt – aber du kannst die Aufgabe kleiner machen: erster Sack plus der Rest.',
    listen: [[4, 7, 1], [12, 5, 9, 3, 8], [6], []], aufruf: 'gewicht(a, 0)', soll: (l) => l.reduce((s, x) => s + x, 0), stapel: true,
    befehle: [K_B('def gewicht(a, i):'), K_B('if ¦:'), K_B('return ¦'), K_B('len(a)')],
    merke: { titel: '🪆 Rekursion', text: 'Eine rekursive Funktion ruft sich selbst auf – mit einer kleineren Aufgabe (Rekursionsschritt). Der Basisfall beendet die Rekursion ohne neuen Aufruf. Jeder Aufruf wartet auf dem Aufrufstapel, bis der nächste fertig ist.', code: 'def fakultaet(n):\n    if n <= 1:          # Basisfall\n        return 1\n    return n * fakultaet(n - 1)   # Rekursionsschritt' },
    tipps: ['Basisfall: Ist i schon hinter dem letzten Sack, ist das Gewicht 0.', 'Rekursionsschritt: Sack i plus das Gewicht ab i + 1.', 'if i == len(a): return 0 · return a[i] + gewicht(a, i + 1)'],
    loesung: C_GEWICHT }),
  KORN({ id: 'kr1v', kapitel: 34, sortArt: 'vorher', funktion: 'gewicht', aufruf: 'gewicht(a, 0)', ico: '🔮', titel: 'Der Aufrufstapel', lohn: 65, stapel: true,
    ziel: 'Lies die rekursive Funktion und sag voraus, was auf dem Aufrufstapel passiert.',
    listen: [[4, 7, 1]], code: C_GEWICHT,
    fragen: [{ art: 'zahl', text: 'gewicht(a, 0) mit a = [4, 7, 1]: Wie viele Aufrufe von gewicht liegen höchstens gleichzeitig auf dem Stapel?', soll: (l) => maxTiefe(l, 'gewicht') },
      { art: 'zahl', text: 'Was gibt der Aufruf gewicht(a, 2) zurück?', soll: () => 1 },
      { art: 'zahl', text: 'Und was gibt gewicht(a, 0) am Ende zurück?', soll: () => 12 }],
    tipps: ['Es gibt die Aufrufe mit i = 0, 1, 2 – und noch einen für den Basisfall.', 'gewicht(a, 3) = 0, gewicht(a, 2) = 1 + 0 …'] }),
  KORN({ id: 'kr2', kapitel: 34, sortArt: 'funktion', funktion: 'gewicht', rekursiv: 'gewicht', sprache: S_REK, zielArt: 'wert', ico: '🐞', titel: 'Die Rekursion hört nie auf', lohn: 65,
    ziel: 'Diese Rekursion endet nie. Finde den Fehler.',
    vorlage: 'def gewicht(a, i):\n    if i == len(a):\n        return 0\n    return a[i] + gewicht(a, i)',
    listen: [[4, 7, 1], [2, 2]], aufruf: 'gewicht(a, 0)', soll: (l) => l.reduce((s, x) => s + x, 0), stapel: true, befehle: [],
    tipps: ['Lass sie laufen und schau auf den Aufrufstapel: Was ändert sich von Aufruf zu Aufruf?', 'Die Aufgabe muss bei jedem Aufruf kleiner werden.', 'gewicht(a, i + 1)'],
    loesung: C_GEWICHT }),
  KORN({ id: 'kr3', kapitel: 34, sortArt: 'funktion', funktion: 'maximum', rekursiv: 'maximum', sprache: S_REK, zielArt: 'wert', ico: '✂️', titel: 'Teile und herrsche', lohn: 70,
    ziel: 'Schreib maximum(a, links, rechts): Teil den Bereich in zwei Hälften, such in beiden das Maximum und nimm das größere.',
    listen: [zufallsListe(8, 91), zufallsListe(5, 92), [42], zufallsListe(11, 93)], aufruf: 'maximum(a, 0, n - 1)', soll: (l) => Math.max(...l), stapel: true,
    grenze: grenzeHalbieren('maximum'),   // Didaktik-Prüfung: lineare Rekursion (erster + Rest) bestand
    befehle: [K_B('def maximum(a, links, rechts):'), K_B('if links == rechts:'), K_B('mitte = ¦'), K_B('return ¦')],
    merke: { titel: '✂️ Divide & Conquer', text: 'Teile und herrsche: Teile das Problem in kleinere Teilprobleme (Divide), löse sie rekursiv (Conquer) und füge die Teillösungen zusammen (Combine). Der Basisfall ist so klein, dass die Lösung sofort feststeht.', code: 'Größter Wert in [3, 9, 4, 7]:\n  teilen:      [3, 9]       [4, 7]\n  teilen:    [3]   [9]    [4]   [7]   ← Basisfall\n  zusammen:     9            7\n  zusammen:           9' },
    tipps: ['Basisfall: links == rechts – dann gibt es nur einen Sack.', 'Sonst: mitte bestimmen, zweimal rekursiv aufrufen (links bis mitte, mitte + 1 bis rechts).', 'if m1 > m2: return m1 · return m2'],
    loesung: 'def maximum(a, links, rechts):\n    if links == rechts:\n        return a[links]\n    mitte = (links + rechts) // 2\n    m1 = maximum(a, links, mitte)\n    m2 = maximum(a, mitte + 1, rechts)\n    if m1 > m2:\n        return m1\n    return m2' }),
  KORN({ id: 'kr4', kapitel: 34, sortArt: 'funktion', funktion: 'binaere_suche', rekursiv: 'binaere_suche', sprache: S_REK, zielArt: 'wert', ico: '🔎', titel: 'Binäre Suche', lohn: 75,
    ziel: 'Die Säcke stehen sortiert. Schreib binaere_suche(a, x, links, rechts): die Position von Gewicht x oder −1 – mit Halbieren statt Durchsuchen.',
    listen: [SUCHE_16, SUCHE_16, SUCHE_16.slice(0, 9), SUCHE_16], aufrufFn: (l, k) => `binaere_suche(a, ${SUCHE_X[k]}, 0, n - 1)`,
    soll: (l, k) => l.indexOf(SUCHE_X[k]), stapel: true,
    grenze: (liste, l) => (l.v > 2 * (Math.floor(Math.log2(liste.length)) + 1) ? `${l.v} Vergleiche – mit Halbieren reichen höchstens ${2 * (Math.floor(Math.log2(liste.length)) + 1)}.` : grenzeSuchTiefe(liste, l)),
    befehle: [K_B('def binaere_suche(a, x, links, rechts):'), K_B('if links > rechts:'), K_B('mitte = ¦'), K_B('if a[mitte] == x:'), K_B('return ¦')],
    merke: { titel: '🔎 Binäre Suche', text: 'In einer sortierten Liste schaut die binäre Suche in die Mitte. Ist der gesuchte Wert größer, sucht sie rechts weiter, sonst links – jedes Mal wird der Bereich halbiert. Darum braucht sie nur etwa log₂(n) Schritte: O(log n).', code: 'Suche 70 in [10, 20, 30, 40, 50, 60, 70]:\n  Mitte 40 < 70 → rechts weiter: [50, 60, 70]\n  Mitte 60 < 70 → rechts weiter: [70]\n  Mitte 70 = 70 → gefunden' },
    tipps: ['Basisfall 1: links > rechts – nichts mehr übrig, also −1. Basisfall 2: a[mitte] == x.', 'Ist a[mitte] < x, liegt x rechts von der Mitte.', 'return binaere_suche(a, x, mitte + 1, rechts) bzw. (a, x, links, mitte - 1)'],
    loesung: C_BINAER }),
  KORN({ id: 'kr4v', kapitel: 34, sortArt: 'vorher', funktion: 'binaere_suche', aufruf: 'binaere_suche(a, 27, 0, n - 1)', ico: '🔮', titel: 'Halbieren vorhersagen', lohn: 75, stapel: true,
    ziel: 'Die binäre Suche sucht 27 unter 16 sortierten Säcken. Sag voraus, wie sie vorgeht.',
    listen: [SUCHE_16], code: C_BINAER,
    fragen: [{ art: 'zahl', text: 'Im ersten Aufruf ist links = 0 und rechts = 15. Welchen Wert hat mitte?', soll: () => 7 },
      { art: 'zahl', text: 'Wie viele Aufrufe von binaere_suche gibt es insgesamt, bis 27 gefunden ist?', soll: (l) => aufrufZahl(l, 'binaere_suche') },
      { art: 'zahl', text: 'Wie viele Aufrufe bräuchte sie höchstens bei 1 000 000 Säcken? (log₂)', soll: () => 20, tol: 0.05 }],
    tipps: ['(0 + 15) // 2 rundet ab.', 'a = [3, 6, 9, …, 48]: a[7] = 24 < 27, also rechts weiter.', '2²⁰ ≈ 1 000 000'] }),

  // --- Kapitel 35: ⚡ Mergesort und Quicksort (2.2.9, 2.2.9b) ---
  KORN({ id: 'km1', kapitel: 35, sortArt: 'funktion', funktion: 'merge', ico: '🤝', titel: 'Zwei Reihen zusammenführen', lohn: 70,
    ziel: 'Schreib merge(links, rechts): Beide Listen sind schon sortiert. Gib eine neue, sortierte Liste mit allen Säcken zurück – mit höchstens n − 1 Vergleichen.',
    listen: [[1, 4, 9, 12, 2, 3, 10], [5, 6, 7, 1, 2], [3], [2, 8]], aufrufFn: (l, k) => `merge(a[:${MERGE_TEIL[k]}], a[${MERGE_TEIL[k]}:])`,
    grenze: (liste, l) => (l.v > Math.max(0, liste.length - 1) ? `${l.v} Vergleiche – merge kommt mit höchstens ${liste.length - 1} aus: Es vergleicht immer nur die beiden vordersten Säcke.` : null),
    befehle: [K_B('def merge(links, rechts):'), K_B('ergebnis = []'), K_B('while ¦:'), K_B('if ¦:'), K_B('else:'), K_B('return ¦')],
    merke: { titel: '🤝 Mischen (merge)', text: 'merge führt zwei sortierte Listen zu einer zusammen: Es vergleicht nur die beiden vordersten Werte und hängt den kleineren an das Ergebnis an. Ist eine Liste leer, kommt der Rest der anderen dazu. Das braucht O(n) Schritte und eine neue Liste (Zusatzspeicher).', code: '[1, 4] und [2, 3]:\n  1 ≤ 2 → 1 anhängen   ergebnis [1]\n  4 ≤ 2? nein → 2      ergebnis [1, 2]\n  4 ≤ 3? nein → 3      ergebnis [1, 2, 3]\n  rechts leer → Rest   ergebnis [1, 2, 3, 4]' },
    tipps: ['Zwei Zeiger i und j, beide starten bei 0.', 'Solange beide Listen noch Säcke haben: den kleineren vorderen anhängen und seinen Zeiger weiterschieben.', 'Danach mit zwei while-Schleifen die Reste anhängen.'],
    loesung: C_MERGE }),
  KORN({ id: 'km2', kapitel: 35, sortArt: 'funktion', funktion: 'mergesort', rekursiv: 'mergesort', ico: '⚡', titel: 'Mergesort', lohn: 80,
    ziel: 'Schreib mergesort(a): teilen, beide Hälften rekursiv sortieren, mit merge zusammenführen. Gib die sortierte Liste zurück.',
    // Didaktik-Prüfung: ohne Grenze bestand auch ein Bubblesort mit einem Schein-Aufruf – die lange Liste verrät O(n²)
    listen: [zufallsListe(8, 101), zufallsListe(7, 102), [6, 5, 4, 3, 2, 1], [1], zufallsListe(64, 103, 999)], stapel: true,
    grenze: (liste, l) => grenzeNlogN(liste, l, 1, 'Mergesort halbiert die Liste immer wieder und mischt die Hälften mit merge – sortierst du irgendwo mit zwei Schleifen?'),
    befehle: [K_B('def mergesort(a):'), K_B('if ¦:'), K_B('mitte = ¦'), K_B('return ¦')],
    merke: { titel: '⚡ Mergesort', text: 'Mergesort teilt die Liste in zwei Hälften, sortiert beide rekursiv und mischt sie mit merge. Die Liste wird log₂(n)-mal halbiert, jede Ebene kostet O(n): zusammen O(n log n) – immer, auch im schlechtesten Fall. Er braucht O(n) Zusatzspeicher und ist stabil.', code: '[5, 2, 9, 1]\n[5, 2]   [9, 1]        teilen\n[5] [2]  [9] [1]       Basisfall\n[2, 5]   [1, 9]        merge\n[1, 2, 5, 9]           merge' },
    tipps: ['Schreib zuerst merge (wie beim letzten Auftrag) über mergesort.', 'Basisfall: eine Liste mit 0 oder 1 Sack ist schon sortiert – return a.', 'a[:mitte] ist die linke Hälfte, a[mitte:] die rechte.'],
    loesung: C_MERGESORT }),
  KORN({ id: 'km2v', kapitel: 35, sortArt: 'vorher', funktion: 'mergesort', ico: '🔮', titel: 'Der Aufrufbaum', lohn: 80, stapel: true,
    ziel: 'Mergesort mit 8 Säcken: Sag voraus, wie oft er sich aufruft.',
    listen: [[5, 2, 9, 1, 7, 3, 8, 4]], code: C_MERGESORT,
    fragen: [{ art: 'zahl', text: 'Wie oft wird mergesort insgesamt aufgerufen (der erste Aufruf zählt mit)?', soll: (l) => aufrufZahl(l, 'mergesort') },
      { art: 'zahl', text: 'Wie viele mergesort-Aufrufe liegen höchstens gleichzeitig auf dem Stapel?', soll: (l) => maxTiefe(l, 'mergesort') },
      { art: 'wahl', text: 'Welche Zeitkomplexität hat Mergesort?', optionen: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], richtig: 1 }],
    tipps: ['8 → 4 + 4 → 2 + 2 + 2 + 2 → 8 Einzelne: 1 + 2 + 4 + 8.', '8 halbiert bis 1: 8, 4, 2, 1 – das sind die Ebenen.'] }),
  KORN({ id: 'kq1', kapitel: 35, sortArt: 'funktion', funktion: 'quicksort', rekursiv: 'quicksort', ico: '🎯', titel: 'Quicksort', lohn: 80,
    ziel: 'Schreib quicksort(a): Pivot = letzter Sack. Verteil alle Säcke auf kleiner, gleich und groesser, sortiere kleiner und groesser rekursiv und gib alles zusammen zurück.',
    listen: [zufallsListe(8, 111), [4, 2, 4, 1, 4, 3], zufallsListe(9, 112), [], zufallsListe(128, 103, 999)], stapel: true,
    grenze: (liste, l) => grenzeNlogN(liste, l, 2.5, 'Quicksort verteilt die Säcke um das Pivot und sortiert nur die Teile rekursiv – sortierst du irgendwo mit zwei Schleifen?'),
    befehle: [K_B('def quicksort(a):'), K_B('if ¦:'), K_B('for x in a:'), K_B('elif ¦:'), K_B('else:'), K_B('return ¦')],
    merke: { titel: '🎯 Quicksort', text: 'Quicksort wählt ein Pivot-Element und teilt die übrigen Werte in kleiner, gleich und größer auf (Partitionierung). Die Teile werden rekursiv sortiert. Im Mittel O(n log n) – aber bei schlechtem Pivot (z. B. sortierte Liste, Pivot = letztes) O(n²).', code: '[4, 1, 6, 3]   Pivot 3\nkleiner [1] · gleich [3] · groesser [4, 6]\n→ beide Teile rekursiv sortieren, dann zusammensetzen' },
    tipps: ['Basisfall wie bei Mergesort: höchstens ein Sack.', 'for x in a: mit if/elif/else auf die drei Listen verteilen (append).', 'Listen kann man mit + aneinanderhängen.'],
    loesung: C_QUICK }),
  KORN({ id: 'kq2', kapitel: 35, sortArt: 'funktion', funktion: 'quicksort', rekursiv: 'quicksort', nurTemp: true, ico: '🔀', titel: 'Quicksort an Ort und Stelle', lohn: 85, aufruf: 'quicksort(a, 0, n - 1)',
    ziel: 'Ohne neue Listen (in place): quicksort(a, links, rechts) partitioniert den Bereich mit Pivot a[rechts] durch Tauschen und sortiert dann beide Seiten rekursiv.',
    listen: [zufallsListe(8, 121), [3, 1, 2], zufallsListe(7, 122), [5, 4, 3, 2, 1]], stapel: true,
    befehle: [K_B('def quicksort(a, links, rechts):'), K_B('if ¦:'), K_B('return'), K_B('for i in range(¦):'), K_B('temp = ¦')],
    tipps: ['grenze zeigt auf den ersten Platz, der nicht kleiner als das Pivot ist.', 'Ist a[i] < pivot: a[i] mit a[grenze] tauschen, grenze + 1. Am Ende Pivot mit a[grenze] tauschen.', 'quicksort(a, links, grenze - 1) · quicksort(a, grenze + 1, rechts)'],
    loesung: C_QUICK_INPLACE }),
  KORN({ id: 'kq3', kapitel: 35, sortArt: 'messen', ico: '🪤', titel: 'Die Pivot-Falle', lohn: 80,
    ziel: 'Quicksort mit Pivot = letztes Element: einmal auf zufälligen, einmal auf schon sortierten Listen.',
    code: C_QUICK, messen: { groessen: [10, 20, 40, 80, 160, 320], aufrufe: [{ name: 'zufällig', aufruf: 'quicksort(a)', liste: 'zufall' }, { name: 'schon sortiert', aufruf: 'quicksort(a)', liste: 'sortiert' }] },
    fragen: [{ art: 'wahl', text: 'Wie wächst Quicksort auf zufälligen Listen?', optionen: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'], richtig: 1 },
      { art: 'wahl', text: 'Und auf schon sortierten Listen?', optionen: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], richtig: 2 },
      { art: 'wahl', text: 'Warum?', optionen: ['Das Pivot ist immer das größte Element – eine Seite bleibt leer, die andere schrumpft nur um 1', 'Sortierte Listen haben mehr Säcke', 'Der Basisfall fehlt', 'merge ist langsamer'], richtig: 0 },
      { art: 'wahl', text: 'Wie umgeht man die Falle?', optionen: ['Pivot zufällig oder aus der Mitte wählen', 'Immer das erste Element als Pivot', 'Die Liste vorher sortieren', 'Gar nicht – Quicksort ist immer O(n²)'], richtig: 0 }],
    tipps: ['Rechne aus, um welchen Faktor die Werte wachsen, wenn n sich verdoppelt.'] }),
  KORN({ id: 'kq4', kapitel: 35, sortArt: 'messen', ico: '🏁', titel: 'Das große Rennen', lohn: 90,
    ziel: 'Alle vier Verfahren auf denselben zufälligen Listen. Wer gewinnt – und warum?',
    story: 'Großer Markttag! Vier Sortiermeister treten gegen dieselben Säcke an. Gezählt werden nur die Vergleiche.',
    code: [C_BUBBLE, C_INSERTION, C_MERGESORT, C_QUICK].join('\n\n'),
    messen: { groessen: [10, 20, 40, 80, 160], aufrufe: ['bubblesort', 'insertionsort', 'mergesort', 'quicksort'].map((f) => ({ name: f, aufruf: `${f}(a)`, liste: 'zufall' })) },
    fragen: [{ art: 'wahl', text: 'Welche beiden wachsen etwa wie n log n?', optionen: ['Bubble- und Insertionsort', 'Merge- und Quicksort', 'Bubble- und Mergesort', 'alle vier gleich'], richtig: 1 },
      { art: 'zahl', text: 'Bei n = 160: Wie viele Male so viele Vergleiche braucht Bubblesort wie Mergesort? (gerundet)', soll: (l, m) => Math.round(m[0].at(-1) / m[2].at(-1)), tol: 0.1 },
      { art: 'wahl', text: 'Wann ist Insertionsort trotzdem eine gute Wahl?', optionen: ['bei sehr großen, zufälligen Listen', 'bei kleinen oder fast sortierten Listen', 'nie', 'nur bei umgekehrt sortierten Listen'], richtig: 1 }],
    tipps: ['Vergleiche die letzte Zeile der Tabelle: Bubblesort geteilt durch Mergesort.'] }),
);

// --- ⭐-Ziele aus der Musterlösung: vSoll = Vergleiche, zSoll = Schreibzugriffe (Kartenspiel: Tausche), jeweils das Maximum über alle Listen ---
function kornZiele(h) {
  if (h.vSoll != null || !['karten', 'funktion'].includes(h.sortArt)) return;
  const r = PY.sort(h.loesung, kornSprache(h), kornAuftrag(h, false));
  if (r.err || r.laeufe.some((l) => l.err)) { console.warn('Musterlösung fehlerhaft:', h.id, r.err || r.laeufe.find((l) => l.err).err); h.vSoll = h.zSoll = Infinity; return; }  h.vSoll = Math.max(...r.laeufe.map((l) => l.v));
  h.zSoll = Math.max(...r.laeufe.map((l) => l.z));
}
// 🔭 Sternwarte/🔧 Werkstatt: keine Säcke – stattdessen Punktwolke, Gitter, Tabelle, Arena (malen) oder nur das Protokoll
// leer = Kornspeicher-Aufgabe, deren Ergebnis ein Wert ist und deren Testlisten leer sind (fib, Suche …): keine Säcke, Abrechnung wie in der Sternwarte
const kornLeer = (h) => !h.warte && h.zielArt === 'wert' && h.sortArt !== 'fragen' && (h.listen || []).length > 0 && h.listen.every((l) => !l.length);
const ohneSaecke = (h) => !!(h.ansicht || h.malen || h.warte || kornLeer(h));
const kornBildDa = (h) => !!(h.ansicht || h.malen || (!h.warte && !kornLeer(h) && h.sortArt !== 'fragen'));
const stilTest = (h) => !!(h.warte || kornLeer(h));   // Tests statt Testlisten, ⭐ auf Anhieb / ohne Tipp
// aufrufFn(liste, k) = eigener Aufruf je Liste (z. B. binaere_suche(a, 42, 0, n - 1) oder merge(a[:3], a[3:]))
const kornAuftrag = (h, ereignisse = true) => ({ art: h.sortArt === 'karten' ? 'karten' : 'funktion', funktion: h.funktion, listen: h.listen, ereignisse: ereignisse && !ohneSaecke(h),
  aufruf: h.aufruf, aufrufe: h.aufrufFn ? h.listen.map(h.aufrufFn) : null, daten: h.daten, vorspann: h.vorspann, dateien: h.dateien });
// Ergebnisse vergleichen: Zahlen mit kleiner Toleranz (Kommazahlen), Listen und Dicts Stück für Stück
function gleichWert(a, b, tol = 1e-6) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => gleichWert(x, b[i], tol));
  if (a && b && typeof a === 'object' && typeof b === 'object') return Object.keys(b).every((k) => gleichWert(a[k], b[k], tol));
  return a === b;
}
const ergebnisText = (w) => (w === null || w === undefined ? 'nichts (fehlt ein return?)' : typeof w === 'number' ? String(Math.round(w * 1000) / 1000).replace('.', ',') : typeof w === 'string' ? `"${w}"` : JSON.stringify(w).replace(/"/g, "'").replace(/\bnull\b/g, 'None').replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').slice(0, 80));
// Sprache für die Prüfung vor dem Start – dazu die Namen aus Daten und Hilfscode der Aufgabe (sonst „Python kennt abstand nicht“)
const aufgabenNamen = (h) => [...Object.keys(h.daten || {}), ...[...(h.vorspann || '').matchAll(/^(?:(?:def|class)\s+(\w+)|(\w+)\s*=)/gm)].map((m) => m[1] || m[2])];
// fertig: true = dieser Auftrag darf sum/sorted/min/max/.sort/.index/.count benutzen (sonst schreibt man es selbst, python.js _FERTIG)
// nurtemp: Tausch nur mit temp, kein Tupeltausch a, b = b, a (Kartenspiel und Aufträge mit nurTemp – so wie im Kurs)
const kornSprache = (h) => [...h.sprache, ...(h.sortArt === 'karten' ? ['karten'] : []), ...(h.sortArt === 'karten' || h.nurTemp ? ['nurtemp'] : []),...(h.fertig ? ['fertig'] : []), ...(h.ohnebin ? ['ohnebin'] : []), ...aufgabenNamen(h).map((n) => 'name:' + n)];
// Kopfzeile der verlangten Funktion aus der Musterlösung (z. B. „def bubblesort(a):“) – null, wenn der Auftrag keine verlangt
const kornFunktionsKopf = (h) => (h.sortArt === 'funktion' && h.funktion && h.loesung
  ? (h.loesung.match(new RegExp(`^def\\s+${h.funktion}\\s*\\([^)]*\\)\\s*:`, 'm')) || [null])[0] : null);
// Rekursion: die Funktion muss sich selbst aufrufen
const ruftSichSelbst = (src, name) => (src.replace(/#.*$/gm, '').match(new RegExp(`\\b${name}\\s*\\(`, 'g')) || []).length >= 2;

// Ist das Ergebnis richtig? { ok, msg, anteil }
function kornPruefe(h, liste, l, k = 0) {
  if (l.err) return { ok: false, msg: `Zeile ${l.err[0]}: ${l.err[1]}`, anteil: 0 };
  // Ergebnis ist eine Zahl (Gewicht, Position …) statt einer sortierten Liste
  if (h.zielArt === 'wert') {
    // eigene Prüfung (z. B. Q-Lernen: kommt der Späher ans Ziel?) oder Vergleich mit dem richtigen Wert
    if (h.pruefWert) { const m = h.pruefWert(l.wert, k); return m ? { ok: false, msg: m, anteil: 0.4 } : { ok: true, msg: h.okText?.(l.wert, k) || 'Richtig ✓', anteil: 1 }; }
    const soll = h.soll(liste, k);
    // ein erwartetes None ist kein „fehlt ein return?“ (Spieltest)
    const sollText = soll === null ? 'None' : ergebnisText(soll);
    if (!gleichWert(l.wert, soll, h.tol ?? 1e-6)) return { ok: false, msg: `${h.testName ? h.testName(k) + ': ' : ''}Ergebnis ${ergebnisText(l.wert)} – richtig wäre ${sollText}.`, anteil: 0.3 };
    if (ohneSaecke(h)) return { ok: true, msg: `${h.testName ? h.testName(k) + ': ' : ''}${sollText} ✓`, anteil: 1 };
    if (h.vMax && l.v > h.vMax) return { ok: false, msg: `Richtig – aber mit ${l.v} Vergleichen. Erlaubt sind ${h.vMax}.`, anteil: 0.8 };
    const g = h.grenze?.(liste, l);
    if (g) return { ok: false, msg: g, anteil: 0.8 };
    return { ok: true, msg: `Ergebnis ${soll} ✓ mit ${l.v} ${l.v === 1 ? 'Vergleich' : 'Vergleichen'}.`, anteil: 1 };
  }
  const ende = l.ende || [], sortiert = [...liste].sort((a, b) => a - b);
  if (JSON.stringify([...ende].sort((a, b) => a - b)) !== JSON.stringify(sortiert)) {
    const fehlt = sortiert.filter((x) => ende.filter((y) => y === x).length < liste.filter((y) => y === x).length);
    // ein Wert doppelt, ein anderer weg = fast immer Tauschen ohne Zwischenspeicher (Spieltest: die Meldung sagte nicht, warum)
    const doppelt = ende.some((x) => ende.filter((y) => y === x).length > liste.filter((y) => y === x).length);
    return { ok: false, msg: `Säcke sind verloren gegangen oder doppelt: ${fehlt.length ? `es fehlt ${[...new Set(fehlt)].join(', ')}` : 'die Liste hat sich verändert'}.${doppelt && fehlt.length ? ' Beim Tauschen ohne temp überschreibst du einen Wert, bevor du ihn gesichert hast.' : ''}`, anteil: 0.1 };
  }
  const soll = h.zielArt === 'absteigend' ? [...sortiert].reverse() : sortiert;
  let ok, anteil;
  if (h.zielArt === 'maxHinten') { ok = ende.at(-1) === Math.max(...liste); anteil = ok ? 1 : 0.3; }
  else { anteil = soll.length ? ende.filter((x, i) => x === soll[i]).length / soll.length : 1; ok = anteil === 1; }
  if (!ok) return { ok, msg: h.zielArt === 'maxHinten' ? 'Der schwerste Sack steht nicht hinten.' : `Noch nicht ${h.zielArt === 'absteigend' ? 'absteigend ' : ''}sortiert: ${ende.join(', ')}`, anteil };
  if (h.vMax && l.v > h.vMax) return { ok: false, msg: `Sortiert – aber mit ${l.v} Vergleichen. Erlaubt sind ${h.vMax}.`, anteil: 0.8 };
  const g = h.grenze?.(liste, l);
  if (g) return { ok: false, msg: g, anteil: 0.8 };
  const zahl = (n, eins, mehr) => `${n} ${n === 1 ? eins : mehr}`;
  return { ok: true, msg: `${h.zielArt === 'maxHinten' ? 'Der Schwerste steht hinten – mit' : 'Sortiert mit'} ${zahl(l.v, 'Vergleich', 'Vergleichen')} und ${zahl(l.z, 'Schreibzugriff', 'Schreibzugriffen')}.`, anteil: 1 };
}

// ---------------------------------------------------------------------------------------------------------
// Bildschirm: links der Kornspeicher (Säcke), Listen-Chips, Fragen bzw. Messlabor; rechts Code und Protokoll
let KO = null;   // { laeufe, checks, i, fragen, fi, fehler, mess }
const KORN_NAME = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function kornStart() {
  KO = { laeufe: null, checks: null, i: 0, fehler: 0, hier: 0, fi: 0 };
  // 🔭 Sternwarte (LK KI) nutzt denselben Ablauf, zeigt aber Punktwolke, Gitter oder Tabelle statt Säcken (sternwarte.js)
  const wer = H.sprecher ? H.sprecher : H.signal ? ['💡', 'Signalwärterin Lumi'] : H.tor ? ['💂', 'Torwärter Otto'] : H.krypto ? ['🗝️', 'Schlüsselmeisterin Mira'] : H.kontor ? ['🦉', 'Archivarin Eulalia'] : H.weg ? ['📯', 'Postmeisterin Paula'] : H.werk ? ['🧑‍🔧', 'Meisterin Ada'] : H.warte ? ['🔭', 'Astronomin Vega'] : ['👩‍🌾', 'Müllerin Greta'];
  const story = H.story ? `<div class="eulalia korn ${H.warte ? 'warte' : ''}"><span class="eico">${wer[0]}</span><div><b>${wer[1]}</b><p>${esc(figurText(H.story))}</p></div></div>` : '';
  $('#archiv').innerHTML = `${story}
    <div class="kornbox ${H.warte ? 'warte' : ''} ${!kornBildDa(H) ? 'hidden' : ''}"><div class="kornkopf"><span id="kornTitel"></span><span id="kornZahl" class="kornzahl"></span></div>
      <canvas id="kornCanvas" class="${H.ansicht === 'tabelle' || !kornBildDa(H) ? 'hidden' : ''}"></canvas><div id="sternTabelle"></div>
      <div id="kornChips" class="kornchips"></div><div id="kornStapel" class="kornstapel hidden"></div></div>
    <div id="kornMess"></div><div id="kornFrage"></div>`;
  if (H.sortArt === 'vorher' || H.sortArt === 'messen') {
    ED.value = H.geheim ? '# 🔒 Der Code der drei Kisten ist geheim.\n# Nur die Messwerte links verraten, wie schnell sie wachsen.' : H.messen?.eigen ? kornMessCode(H).code : H.code;
    ED.setReadOnly(true);
    $('#befehle').innerHTML = '';
  }
  // reine Fragen (Lernarten, Begriffe): kein Code
  $('#editor').classList.toggle('hidden', H.sortArt === 'fragen');
  if (H.sortArt === 'fragen') $('#befehle').innerHTML = '';
  kornChips();
  if (ohneSaecke(H)) sternZeigen(null, 0); else kornMalen(H.listen?.[0] || [], { verdeckt: H.sortArt === 'karten' });
  kornTitel(0);
  if (H.sortArt === 'vorher') kornVorherStart();
  if (H.sortArt === 'messen') kornMessen();
  if (H.sortArt === 'fragen') kornFragenStart(null);
}
function kornTitel(i, v = null, z = null) {
  const liste = H.listen?.[i];
  if (stilTest(H)) { $('#kornTitel').textContent = `${H.ortIco ? H.ortIco : kornLeer(H) ? '🌾' : H.signal ? '🔦' : H.tor ? '⚙️' : H.krypto ? '🕊️' : H.kontor ? '🗄️' : H.weg ? '🐎' : H.werk ? '🔧' : '🔭'} ${H.titelAnsicht || H.ortName || (kornLeer(H) ? 'Kornspeicher' : H.signal ? 'Signalturm' : H.tor ? 'Torwerk' : H.krypto ? 'Taubenschlag' : H.kontor ? 'Schreibstube' : H.weg ? 'Poststation' : H.werk ? 'Werkstatt' : 'Sternwarte')}${H.listen?.length > 1 && H.sortArt === 'funktion' ? ` · Test ${i + 1}` : ''}`; $('#kornZahl').textContent = ''; return; }
  $('#kornTitel').textContent = H.sortArt === 'messen' ? '🔬 Messlabor' : `🌾 Liste ${KORN_NAME[i]}${liste ? ` · ${liste.length} Säcke` : ''}`;
  $('#kornZahl').textContent = v === null ? '' : `V ${v} · Z ${z}`;
}
function kornChips() {
  const box = $('#kornChips');
  if (!box) return;
  if (!H.listen || H.listen.length < 2 || H.sortArt === 'messen' || H.sortArt === 'fragen' || H.sortArt === 'vorher') { box.innerHTML = ''; return; }
  const nameVon = (i) => (stilTest(H) ? String(i + 1) : KORN_NAME[i]);
  box.innerHTML = `<span class="hinweis">${H.listen.length} ${stilTest(H) ? 'Tests' : 'Testlisten'}:</span>` + H.listen.map((_, i) => {
    const c = KO?.checks?.[i];
    return `<button class="lauf ${c ? (c.ok ? 'ok' : 'nein') : ''} ${i === KO?.i ? 'zeigt' : ''}" data-i="${i}">${nameVon(i)}${c ? (c.ok ? ' ✓' : ' ✗') : ''}</button>`;
  }).join('');
  for (const b of box.querySelectorAll('button')) b.onclick = () => {
    if (LAUF) return;
    KO.i = +b.dataset.i;
    if (ohneSaecke(H)) { sternZeigen(KO.laeufe?.[KO.i] || null, KO.i); kornTitel(KO.i); kornChips(); if (KO.checks) log((KO.checks[KO.i].ok ? '✅ ' : '❌ ') + KO.checks[KO.i].msg, KO.checks[KO.i].ok ? 'ok' : 'err'); return; }
    if (KO.laeufe) kornWiedergabe(KO.i, null);
    else { kornMalen(H.listen[KO.i], { verdeckt: H.sortArt === 'karten' }); kornTitel(KO.i); kornChips(); }
  };
}

// Säcke malen: Höhe nach Gewicht, Zahl auf dem Sack. hl = verglichene Positionen, neu = gerade geschrieben
function kornMalen(werte, opt = {}) {
  const cv = $('#kornCanvas');
  if (!cv) return;
  const w = cv.clientWidth || 400, h = Math.round(Math.min(260, Math.max(150, w * 0.42)));
  const dpr = devicePixelRatio || 1;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + 'px'; }
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Holzboden und Wand
  g.fillStyle = '#5b3d22'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#6d4a2a'; for (let y = 0; y < h - 30; y += 22) g.fillRect(0, y, w, 1.5);
  g.fillStyle = '#3e2914'; g.fillRect(0, h - 30, w, 30);
  const n = werte.length;
  if (!n) return;
  const max = Math.max(...werte, 1), platz = w / n, sw = Math.min(64, platz * 0.78), unten = h - 34;
  werte.forEach((v, i) => {
    const x = platz * (i + 0.5), hoch = 26 + (unten - 50) * (opt.verdeckt && !opt.offen?.has(i) ? 0.55 : v / max);
    const an = opt.hl?.includes(i), neu = opt.neu === i;
    g.save();
    // Sack: bauchige Form mit zugebundenem Hals
    g.beginPath();
    g.moveTo(x - sw * 0.32, unten - hoch);
    g.quadraticCurveTo(x - sw * 0.62, unten - hoch * 0.45, x - sw * 0.5, unten);
    g.lineTo(x + sw * 0.5, unten);
    g.quadraticCurveTo(x + sw * 0.62, unten - hoch * 0.45, x + sw * 0.32, unten - hoch);
    g.closePath();
    g.fillStyle = neu ? '#bfe6a0' : opt.fertig ? '#e6d29a' : '#d9bf86';
    g.strokeStyle = an ? '#ffd84a' : '#7a5a2a'; g.lineWidth = an ? 4 : 2;
    g.fill(); g.stroke();
    g.fillStyle = '#8a6a3a'; g.fillRect(x - sw * 0.2, unten - hoch - 7, sw * 0.4, 7);
    g.fillStyle = '#c9a65a'; g.beginPath(); g.ellipse(x, unten - hoch - 10, sw * 0.14, 5, 0, 0, 7); g.fill();
    const zeig = opt.verdeckt && !opt.offen?.has(i) ? '?' : String(v);
    g.fillStyle = '#3a2410'; g.font = `700 ${Math.max(11, Math.min(20, sw * 0.38))}px 'Lilita One', system-ui, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(zeig, x, unten - hoch * 0.45);
    g.fillStyle = '#d8c6a4'; g.font = '11px ui-monospace, Consolas, monospace';
    g.fillText(String(i), x, h - 14);
    g.restore();
  });
}

// --- Ausführen (karten / funktion): alle Listen, dann Wiedergabe der ersten falschen (sonst der ersten) ---
function kornAusfuehren() {
  if (LAUF || !KO) return;
  if (H.sortArt === 'vorher' || H.sortArt === 'messen' || H.sortArt === 'fragen') return;
  const src = ED.value;
  P.code[H.id] = src;
  // Verlangt der Auftrag eine Funktion und sie fehlt, sagt Python sonst nur „kennt a nicht – Tippfehler?“ (Spieltest)
  const kopf = kornFunktionsKopf(H);
  const chk = kopf && !new RegExp(`^\\s*def\\s+${H.funktion}\\s*\\(`, 'm').test(src)
    ? { err: [1, `Schreib deinen Code in die Funktion ${H.funktion}: oben die Zeile „${kopf}“, darunter alles eingerückt. Das Spiel ruft ${H.funktion} für jede Testliste selbst auf.`] }
    : PY.check(src, kornSprache(H));
  if (chk.err) {
    ED.setMarks(0, chk.err[0]);
    for (const e of document.querySelectorAll('#protokoll .err')) e.remove();
    log(`Zeile ${chk.err[0]}: ${chk.err[1]}`, 'err');
    toast('Fehler vor dem Start – das kostet keinen Tag. 🙂');
    return;
  }
  const r = PY.sort(src, kornSprache(H), kornAuftrag(H));
  if (r.err) {
    ED.setMarks(0, r.err[0]);
    for (const e of document.querySelectorAll('#protokoll .err')) e.remove();
    log(`Zeile ${r.err[0]}: ${r.err[1]}`, 'err');
    toast('Fehler vor dem Start – das kostet keinen Tag. 🙂');
    return;
  }
  if (H.rekursiv && !ruftSichSelbst(src, H.rekursiv)) {
    for (const e of document.querySelectorAll('#protokoll .err')) e.remove();
    log(`${H.rekursiv} soll sich selbst aufrufen (Rekursion) – im Code steht kein Aufruf ${H.rekursiv}(…).`, 'err');
    toast('Fehler vor dem Start – das kostet keinen Tag. 🙂');
    return;
  }
  // Stürzt das Programm in JEDEM Test ab (Tippfehler, falscher Typ …), kostet das keinen Tag – wie ein SQL-Tippfehler (Spieltest)
  if (r.laeufe.length && r.laeufe.every((l) => l.err)) {
    const e = r.laeufe[0].err;
    ED.setMarks(0, e[0]);
    for (const x of document.querySelectorAll('#protokoll .err')) x.remove();
    log(`Zeile ${e[0]}: ${e[1]}`, 'err');
    log('Dein Programm ist in jedem Test abgestürzt. Verbessere es und drück nochmal ▶ Ausführen – das kostet keinen Versuch.', 'leise');
    toast('Absturz in allen Tests – das kostet keinen Tag. 🙂');
    return;
  }
  kornZiele(H);
  KO.laeufe = r.laeufe;
  KO.checks = r.laeufe.map((l, i) => kornPruefe(H, H.listen[i], l, i));
  KO.i = Math.max(0, KO.checks.findIndex((c) => !c.ok));
  $('#protokoll').innerHTML = '';
  // 🔭 Sternwarte: keine Säcke – Ergebnis jedes Tests ins Protokoll, das Bild zeigt den ersten falschen Test
  if (ohneSaecke(H)) {
    for (const l of r.laeufe) for (const s of l.aus || []) log('» ' + s, 'print');
    KO.checks.forEach((c, i) => log(`${KO.checks.length > 1 ? `Test ${i + 1}: ` : ''}${c.ok ? '✅ ' : '❌ '}${c.msg}`, c.ok ? 'ok' : 'err'));
    const err = r.laeufe[KO.i]?.err;
    ED.setMarks(0, err ? err[0] : 0);
    sternZeigen(r.laeufe[KO.i], KO.i);
    kornTitel(KO.i); kornChips();
    setTimeout(() => kornAbrechnen(src), 700);
    return;
  }
  kornWiedergabe(KO.i, () => kornAbrechnen(src));
}

// Wiedergabe einer Liste: Vergleiche leuchten gelb, geschriebene Säcke grün, die Codezeile leuchtet
function kornWiedergabe(i, fertig) {
  const l = KO.laeufe[i], liste = H.listen[i], ev = l.ev || [];
  const werte = [...liste], offen = new Set(), stapel = [];
  let k = 0, v = 0, z = 0, t0 = 0, hl = [], neu = -1, letzte = '';
  // 📚 Aufrufstapel (Rekursion): oben der aktuelle Aufruf, darunter die wartenden; dazu die letzte Rückgabe
  const zeigStapel = ev.some((e) => e[0] === 'call' && e[2] > 1) || H.stapel;
  const stapelMalen = () => {
    const box = $('#kornStapel');
    if (!box) return;
    box.classList.toggle('hidden', !zeigStapel);
    if (!zeigStapel) return;
    box.innerHTML = `<div class="kstitel">📚 Aufrufstapel <span class="hinweis">${stapel.length ? `Tiefe ${stapel.length}` : ''}</span></div>
      ${stapel.slice().reverse().slice(0, 8).map((s, j) => `<div class="ksrahmen ${j ? '' : 'oben'}" style="margin-left:${(stapel.length - 1 - j) * 10}px"><code>${esc(s)}</code></div>`).join('')}
      ${stapel.length > 8 ? `<div class="hinweis">… ${stapel.length - 8} weitere darunter</div>` : ''}
      ${letzte ? `<div class="ksletzt">↩ ${esc(letzte)}</div>` : ''}`;
  };
  const tempo = () => (LAUF?.tempo || 1);
  LAUF = { korn: true, tempo: LAUF?.tempo || 1 };
  ED.setReadOnly(true);
  KO.i = i; kornChips();
  if (KO.laeufe.length > 1) log(`— Liste ${KORN_NAME[i]} —`, 'leise');
  for (const s of l.aus || []) log('» ' + s, 'print');
  const ende = () => {
    LAUF = null;
    ED.setReadOnly(H.sortArt === 'vorher' || H.sortArt === 'messen');
    const c = KO.checks?.[i];
    kornMalen(l.ende || werte, { fertig: c?.ok, offen: new Set(werte.map((_, j) => j)) });
    kornTitel(i, l.v, l.z);
    if (l.err) { ED.setMarks(0, l.err[0]); log(`Zeile ${l.err[0]}: ${l.err[1]}`, 'err'); } else ED.setMarks(0, 0);
    if (c) log((c.ok ? '✅ ' : '❌ ') + c.msg, c.ok ? 'ok' : 'err');
    if (ev.length >= 4000) log('(Die Wiedergabe zeigt nur die ersten 4000 Schritte.)', 'leise');
    if (fertig) setTimeout(fertig, 500);
    else { haupt('▶ Ausführen', ausfuehren, PY.bereit && H.sortArt !== 'vorher' && H.sortArt !== 'messen'); neben([{ label: '🗺️<span class="lbl"> Karte</span>', title: 'Zurück zur Karte', fn: zurKarte }]); }
  };
  haupt('⏭ Ende zeigen', () => { k = ev.length; schritt(performance.now() + 1e6); });
  neben([{ label: `⏩ ${tempo()}×`, title: 'Tempo', fn: () => { LAUF.tempo = LAUF.tempo >= 8 ? 1 : LAUF.tempo * 2; $('#neben button').textContent = `⏩ ${LAUF.tempo}×`; } }]);
  $('#archiv').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  function anwenden(e) {
    hl = []; neu = -1;
    if (e[0] === 'cmp') { v++; hl = [e[1], e[2]].filter((x) => x >= 0); if (H.sortArt === 'karten') for (const x of hl) offen.add(x); }
    else if (e[0] === 'set') { z++; werte[e[1]] = e[2]; neu = e[1]; }
    else if (e[0] === 'swap') { z++; const a = werte[e[1]]; werte[e[1]] = werte[e[2]]; werte[e[2]] = a; hl = [e[1], e[2]]; }
    else if (e[0] === 'call') stapel.push(`${e[1]}(${e[3]})`);
    else if (e[0] === 'ret') { const f = stapel.pop(); letzte = `${f || e[1]} gibt ${e[3]} zurück`; }
    ED.setMarks(e[0] === 'call' || e[0] === 'ret' ? e[4] : e[3], 0);
    stapelMalen();
  }
  function schritt(now) {
    if (!LAUF?.korn) return;
    if (!t0) t0 = now;
    // ⏭: alles auf einmal
    if (k >= ev.length) { ende(); return; }
    if (now - t0 >= 380 / tempo()) {
      t0 = now;
      if (H.sortArt === 'karten') offen.clear();
      anwenden(ev[k++]);
      kornMalen(werte, { hl, neu, verdeckt: H.sortArt === 'karten', offen });
      kornTitel(i, v, z);
    }
    requestAnimationFrame(schritt);
  }
  kornMalen(werte, { verdeckt: H.sortArt === 'karten' });
  kornTitel(i, 0, 0);
  stapelMalen();
  requestAnimationFrame(schritt);
}

// Abrechnung wie im Archiv: ⭐ wenige Vergleiche (≤ Musterlösung), ⭐ wenige Schreibzugriffe/Tausche
function kornAbrechnen(src) {
  const h = hofStand(H.id), ok = KO.checks.every((c) => c.ok);
  const vMax = Math.max(...KO.laeufe.map((l) => l.v)), zMax = Math.max(...KO.laeufe.map((l) => l.z));
  // 🔭 Sternwarte: Vergleiche zählen dort nichts – ⭐ auf Anhieb und ⭐ ohne Tipp (wie im Archiv)
  const wenigV = ok && (stilTest(H) ? h.versuche === 0 : vMax <= H.vSoll), wenigZ = ok && (stilTest(H) ? h.tipps === 0 : zMax <= H.zSoll);
  // Tests (Sternwarte, Werkstatt, Staatsarchiv …): Teillohn = Anteil bestandener Tests (Nachprüfung 2026-11-14: „40 % richtig“, obwohl kein Test stimmte)
  const okZahl = KO.checks.filter((c) => c.ok).length;
  const anteil = ok ? 1 : stilTest(H) ? okZahl / KO.checks.length : KO.checks.reduce((s, c) => s + c.anteil, 0) / KO.checks.length;
  let gold;
  if (ok) {
    const stern = (neu, alt) => (neu ? H.lohn * STERN_BONUS * (alt ? NACHARBEIT : 1) : 0);
    gold = H.lohn * (h.fertig ? NACHARBEIT : 1) + stern(wenigV, h.kurz) + stern(wenigZ, h.sparsam);
  } else gold = h.fertig ? 0 : H.lohn * TEILLOHN * anteil;
  gold = Math.round(gold * lohnFaktor());
  const warFertig = h.fertig;
  if (ok) h.geloest = src;
  h.versuche++; h.fertig ||= ok; h.kurz ||= wenigV; h.sparsam ||= wenigZ; h.heute = P.tag;
  P.gold += gold;
  speichern();
  const st = (an, t) => `<span class="${an ? '' : 'aus'}" title="${t}">⭐</span>`, zw = 'Schreibzugriffe';
  const sterne = stilTest(H)
    ? `<div class="sterne">✅ ${st(wenigV, 'auf Anhieb')}${st(wenigZ, 'ohne Tipp')}</div>
      <div class="zeile"><span>⭐ auf Anhieb</span><span>${wenigV ? '✓' : '–'}</span></div><div class="zeile"><span>⭐ ohne Tipp</span><span>${wenigZ ? '✓' : '–'}</span></div>`
    : `<div class="sterne">✅ ${st(wenigV, 'wenige Vergleiche')}${st(wenigZ, `wenige ${zw}`)}</div>
      <div class="zeile"><span>⭐ Vergleiche (höchstens ${H.vSoll})</span><span>${wenigV ? '✓' : vMax}</span></div>
      <div class="zeile"><span>⭐ ${zw} (höchstens ${H.zSoll})</span><span>${wenigZ ? '✓' : zMax}</span></div>`;
  // Überschrift passend zum Ziel (Spieltest: „Sortiert!“ auch bei „Schwerster nach hinten“)
  const titel = stilTest(H) || H.zielArt === 'maxHinten' ? 'Geschafft! 🎉' : H.zielArt === 'wert' ? 'Richtig! 🎉' : 'Sortiert! 🎉';
  karte(`<h2>${ok ? titel : 'Noch nicht ganz'}</h2>
    ${ok ? sterne
    : `<p>${KO.checks.map((c, i) => `${KO.checks.length > 1 ? (stilTest(H) ? `Test ${i + 1}: ` : `Liste ${KORN_NAME[i]}: `) : ''}${c.ok ? '✓' : esc(c.msg)}`).slice(0, 8).join('<br>')}${KO.checks.length > 8 ? '<br>…' : ''}</p>
      <div class="teil"><div class="teilbalken"><i style="width:${Math.round(anteil * 100)}%"></i></div><span>${stilTest(H) ? `${okZahl} von ${KO.checks.length} Tests richtig` : `${Math.round(anteil * 100)} % erledigt`}</span></div>`}
    <p class="lohn">+${gold} 🪙${!ok && gold ? ' Teillohn' : ''}${lohnHinweis()}</p>
    ${!ok && !gold ? `<p class="hinweis">${warFertig ? 'Teillohn gibt es nur, solange der Auftrag noch nicht gelöst ist.' : 'Kein Teillohn: Noch ist nichts davon richtig.'}</p>` : ''}
    ${ok && warFertig ? '<p class="hinweis">Schon gelöster Auftrag: weniger Lohn, neue Sterne zählen voll.</p>' : ''}
    ${!ok ? `<p class="hinweis">${stilTest(H) ? 'Tipp die Test-Knöpfe an, um jeden Test noch einmal anzusehen.' : 'Tipp die Listen-Knöpfe an, um jede Liste noch einmal ablaufen zu sehen.'} Morgen kannst du es noch einmal versuchen.${puzzleMoeglich(H) ? ' Wenn es wieder hakt, hilft dir die 🧩 Puzzle-Hilfe.' : ''}</p>` : ''}
    ${ok ? `<details><summary>Musterlösung ansehen</summary><pre class="mono">${esc(H.loesung)}</pre></details>` : ''}`,
  [...zweitKnopf(ok), { label: '👀 Ansehen', fn: () => haupt('🌇 Feierabend', feierabend) }, { label: '🌇 Feierabend', fn: feierabend }]);
  neben([]);
  haupt('🌇 Feierabend', feierabend);
  hud();
}

// --- 🔮 Vorhersagen und 🔬 Messlabor: Fragen nacheinander, ✔ Prüfen zählt Fehler ---
function kornVorherStart() {
  // Code ohne Funktion (Kapitel 30): wird über der Liste a ausgeführt
  const lauf = kornVorherLauf(H);
  if (!lauf || lauf.err) { log('Der Code ließ sich nicht ausführen.', 'err'); console.warn(H.id, lauf); return; }
  if (ohneSaecke(H)) sternZeigen(null, 0);
  KO.laeufe = [lauf];
  kornFragenStart(lauf);
}
// Der feste Code einer Vorhersage, einmal ausgeführt (auch für den Selbsttest)
const kornVorherLauf = (h) => (h.funktion
  ? PY.sort(h.code, [...kornSprache(h), 'fertig'], { art: 'funktion', funktion: h.funktion, aufruf: h.aufruf, listen: h.listen, daten: h.daten, vorspann: h.vorspann, dateien: h.dateien, ereignisse: !ohneSaecke(h) }).laeufe?.[0]
  : kornOhneFunktion(h));
// Kapitel-30-Vorhersage: Code steht ohne def da – wir packen ihn in eine Funktion über der Liste a
function kornOhneFunktion(h = H) {
  const src = 'def oben(a):\n' + h.code.split('\n').map((z) => '    ' + z).join('\n');
  const r = PY.sort(src, [...S_LK, 'fertig'], { art: 'funktion', funktion: 'oben', listen: h.listen });
  // Zeilen passend zum gezeigten Code; der Aufruf der Hülle „oben“ gehört nicht in den Stapel
  if (r.laeufe) r.laeufe[0].ev = (r.laeufe[0].ev || []).filter((e) => !((e[0] === 'call' || e[0] === 'ret') && e[1] === 'oben')).map((e) => (e[0] === 'call' || e[0] === 'ret' ? [...e.slice(0, 4), Math.max(1, e[4] - 1)] : [...e.slice(0, 3), Math.max(1, e[3] - 1)]));
  return r.laeufe?.[0];
}
// Auswahlfragen (Spieltest: oft war die erste Antwort richtig, Begründungen verrieten die Lösung):
// Antworten mischen (jeden Tag anders, innerhalb eines Tages gleich) und „kurze Antwort – Begründung“ nur kurz zeigen,
// die Begründung der richtigen Antwort erscheint erst nach dem Antworten. Gekürzt wird nur, wenn nach „ – “ ein echtes Wort steht
// (nicht bei „A – B – C“) und alle Kurzformen verschieden sind.
function wahlMischen(f) {
  if (f.art !== 'wahl' || !f.optionen) return f;
  const teile = f.optionen.map((o) => { const i = o.indexOf(' – '), rest = i > 0 ? o.slice(i + 3) : ''; return i > 0 && /[a-zäöüß]{4,}/.test(rest) ? [o.slice(0, i), rest] : [o, '']; });
  const kurz = new Set(teile.map((t) => t[0])).size === teile.length && teile.some((t) => t[1]);
  // Samen aus dem ganzen Fragetext (Spieltest: „Kiste A/B/C“ haben gleich lange Texte → überall dieselbe Reihenfolge)
  let s = [...`${H.id}|${P.tag}|${f.text}|${f.optionen.join('|')}`].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 7);
  s = (Math.imul(s ^ (s >>> 15), 2246822507) >>> 0) ^ (s >>> 13);
  const reihe = f.optionen.map((_, i) => i);
  for (let i = reihe.length - 1; i > 0; i--) { s = (Math.imul(s, 1103515245) + 12345) >>> 0; const j = Math.floor((s / 4294967296) * (i + 1)); [reihe[i], reihe[j]] = [reihe[j], reihe[i]]; }
  // „alle oben genannten“ u. Ä. bleiben am Ende
  const fest = reihe.filter((i) => /^(alle|keine|beide)\b.*(oben|genannt)/i.test(f.optionen[i]));
  const ord = [...reihe.filter((i) => !fest.includes(i)), ...fest];
  return { ...f, optionen: ord.map((i) => (kurz ? teile[i][0] : f.optionen[i])), richtig: ord.indexOf(f.richtig), erklaerung: kurz ? teile[f.richtig][1] : f.erklaerung };
}
function kornFragenStart(lauf) {
  // richtigFn: die richtige Auswahl hängt von der Messung ab (🪞 kl5 misst den eigenen Code)
  KO.fragen = H.fragen.map((f) => wahlMischen({ ...f, wert: f.soll ? f.soll(lauf, KO.mess) : null, ...(f.richtigFn ? { richtig: f.richtigFn(lauf, KO.mess) } : {}) }));
  KO.fi = 0; KO.fehler = 0; KO.hier = 0; KO.raten = 0;
  $('#protokoll').innerHTML = '';
  if (KO.messInfo) log(KO.messInfo, 'leise');
  log(H.sortArt === 'messen' ? '🔬 Schau dir die Messwerte an und beantworte die Fragen.' : H.sortArt === 'fragen' ? '❓ Lies genau und beantworte die Fragen.' : '🔮 Lies den Code. Sag dann voraus, was passiert – erst danach läuft er.', 'leise');
  log(`🎲 Raten lohnt sich nicht: Jeder Fehlversuch kostet ${Math.round(RATE_ABZUG * 100)} % vom Lohn.`, 'leise');
  neben([{ label: '🗺️<span class="lbl"> Karte</span>', title: 'Zurück zur Karte', fn: zurKarte }, { label: '🏳️<span class="lbl"> Auflösen</span>', title: 'Antworten zeigen (nur Teillohn)', fn: () => kornFragenEnde(false) }]);
  kornFrage();
}
function kornFrage() {
  const f = KO.fragen[KO.fi], box = $('#kornFrage');
  // Szenario mit antippbaren Wörtern (Abi: „Lernart bestimmen und am Wort im Text begründen“)
  const szenario = f.szenario ? `<p class="kfszenario">${f.szenario.split(/(\s+)/).map((t, i) => (/\s/.test(t) ? t : `<span class="kfwort" data-wort="${i}">${esc(t)}</span>`)).join('')}</p>
    <p class="hinweis">👆 Tippe auch das Wort an, das die Antwort verrät.</p>` : '';
  // ⚙️ Automaten-Baukasten (torwerk.js): δ-Tabelle, Endzustände, Bild, Wort ausprobieren
  if (f.art === 'automat') automatStart(f);
  if (f.art === 'wahrheit') wahrheitStart(f);   // 🔦 Wahrheitstabelle (signalturm.js)
  box.innerHTML = `<div class="kornfrage"><div class="kfnr">Frage ${KO.fi + 1} von ${KO.fragen.length}</div>${szenario}<p>${esc(figurText(f.text))}</p>${f.html || ''}
    ${f.art === 'automat' ? automatHtml(f) : f.art === 'wahrheit' ? wahrheitHtml(f) : f.art === 'wahl' ? `<div class="kfwahl">${f.optionen.map((o, i) => `<button class="btn leise" data-w="${i}">${esc(figurText(o))}</button>`).join('')}</div>`
      : `<input id="kfEin" class="codefeld" autocomplete="off" inputmode="${f.art === 'zahl' ? 'decimal' : 'text'}" placeholder="${f.art !== 'liste' ? 'Zahl' : f.wert?.length === 1 ? 'Antwort' : f.wert?.every?.((x) => typeof x === 'number') ? 'z. B. 1 4 2 5 8' : f.wert?.every?.((x) => String(x).length === 1) ? 'z. B. A C B D' : 'Antworten mit Leerzeichen getrennt'}">`}</div>`;
  for (const b of box.querySelectorAll('[data-w]')) b.onclick = () => { KO.wahl = +b.dataset.w; for (const x of box.querySelectorAll('[data-w]')) x.classList.toggle('gold', x === b); };
  KO.wahl = null;
  KO.worte = new Set();
  for (const w of box.querySelectorAll('[data-wort]')) w.onclick = () => {
    const t = w.textContent.toLowerCase().replace(/[^a-zäöüß0-9-]/g, '');
    if (KO.worte.has(t)) { KO.worte.delete(t); w.classList.remove('an'); } else { KO.worte.add(t); w.classList.add('an'); }
  };
  if ($('#kfEin')) { $('#kfEin').onkeydown = (e) => { if (e.key === 'Enter') kornFragePruefen(); }; }
  if (f.art === 'automat') automatKlicks();
  if (f.art === 'wahrheit') wahrheitKlicks();
  haupt('✔ Prüfen', kornFragePruefen, true);
  log(`❓ ${figurText(f.text)}`);
}
// 🔦 Wahrheitstabelle prüfen (Didaktik-Prüfung: rote Zeilen sofort = einfach umdrehen reicht):
// beim 1. Fehlversuch einer Frage nur „x Zeilen falsch“, rot markiert erst ab dem 2. (KO.hier = Fehlversuche dieser Frage)
function wahrheitPruefenStufig(f) {
  if (KO.wt.some((x) => x === null)) { toast('Füll erst alle Felder aus (antippen).'); return null; }
  const falsch = belegungen(f.variablen).map((b, i) => (KO.wt[i] !== f.ziel(b) ? i : -1)).filter((i) => i >= 0);
  const zeigen = KO.hier >= 1;
  for (const td of document.querySelectorAll('[data-wt]')) td.classList.toggle('falsch', zeigen && falsch.includes(+td.dataset.wt));
  if (!falsch.length) return true;
  const n = `${falsch.length} ${falsch.length === 1 ? 'Zeile stimmt' : 'Zeilen stimmen'} noch nicht`;
  log(zeigen ? `❌ ${n} (rot markiert).` : `❌ ${n}. Rechne jede Zeile nach – beim nächsten Prüfen werden sie rot markiert.`, 'err');
  return false;
}
// 1.234.567 / 1 234 567 / 4,0 / 4.5 / 1,25e9 – alles als Zahl lesen
function kornZahl(s) {
  let t = String(s).trim().replace(/\s/g, '');
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '');
  return Number(t.replace(',', '.'));
}
function kornFragePruefen() {
  const f = KO.fragen[KO.fi];
  let ok;
  if (f.art === 'automat' || f.art === 'wahrheit') {
    // Didaktik-Prüfung 2026-11-14: auch hier kostet Raten Lohn. Nochmal Prüfen ohne Änderung zählt nicht (und schaltet keinen Tipp frei).
    const stand = JSON.stringify(f.art === 'automat' ? [KO.auto?.ende, KO.auto?.delta] : KO.wt);
    if (KO.hier && stand === KO.letzterStand) { toast('Du hast seit dem letzten Prüfen nichts geändert.'); return; }
    ok = f.art === 'automat' ? automatPruefen(f) : wahrheitPruefenStufig(f);
    if (ok === null) return;
    if (!ok) {
      KO.letzterStand = stand;
      KO.fehler++; KO.hier++; KO.raten = (KO.raten || 0) + 1;
      log(`(Lohn jetzt ${Math.round(rateFaktor(KO.raten) * 100)} %)`, 'err');
      if (KO.hier >= 2 && H.tipps.length) log(`💡 ${H.tipps[Math.min(H.tipps.length - 1, KO.hier - 2)]}`, 'leise');
      return;
    }
  } else if (f.art === 'wahl') {
    if (KO.wahl === null) { toast('Tipp erst eine Antwort an.'); return; }
    ok = KO.wahl === f.richtig;
    if (f.szenario && !KO.worte.size) { toast('Tipp im Text noch das Wort an, das es verrät.'); return; }
    if (ok && f.woerter && !f.woerter.some((w) => KO.worte.has(w.toLowerCase()))) {
      KO.fehler++; KO.hier++; KO.raten = (KO.raten || 0) + 1;
      log('🤔 Die Antwort stimmt – aber welches Wort im Text verrät sie? Tipp ein anderes an.', 'err');
      return;
    }
  } else {
    const ein = $('#kfEin').value.trim().replace(/[−–]/g, '-');   // typografisches Minus (das Spiel schreibt selbst „−1“)
    if (!ein) { toast('Gib erst eine Antwort ein.'); return; }
    // Listen aus Zahlen oder aus Buchstaben/Namen (🐎 Poststation: Reihenfolge der Breitensuche „A B D …“), Groß-/Kleinschreibung egal
    const norm = (x) => (typeof x === 'number' ? x : String(x).replace(/["'\[\]]/g, '').toUpperCase());
    if (f.art === 'liste') {
      // Spieltest: „BEGCFAD“ ohne Leerzeichen und „3C-79-30“ wurden abgelehnt → bei Bedarf auch zeichenweise bzw. an - und : trennen
      const zahlen = f.wert.every((x) => typeof x === 'number'), soll = f.wert.map(norm);
      let t = ein.split(/[\s,;]+/).filter(Boolean);
      if (!zahlen && t.length === 1 && soll.length > 1 && soll.every((x) => String(x).length === 1)) t = [...t[0]];
      if (t.length !== soll.length) { const t2 = ein.split(/[\s,;:\-–]+/).filter(Boolean); if (t2.length === soll.length) t = t2; }
      const ist = t.map((x) => (zahlen ? Number(x) : norm(x)));
      // f.menge: Reihenfolge egal (z. B. Ports eines Switches)
      const key = (a) => JSON.stringify(f.menge ? [...a].sort() : a);
      ok = key(ist) === key(soll);
      // eine einzige Antwort wie „3C:79:30“: Trennzeichen egal („3C 79 30“, „3C-79-30“)
      if (!ok && soll.length === 1) ok = norm(ein).replace(/[\s:\-–]/g, '') === String(soll[0]).replace(/[\s:\-–]/g, '');
    }
    else { const x = kornZahl(ein), soll = f.wert; ok = Number.isFinite(x) && Math.abs(x - soll) <= (f.tol || 0) * Math.abs(soll) + 1e-9; }
  }
  if (!ok) {
    KO.fehler++; KO.hier++; KO.raten = (KO.raten || 0) + 1;
    // Raten lohnt sich nicht (Spieltest): jeder Fehlversuch kostet RATE_ABZUG vom Lohn, mindestens bleibt der Teillohn.
    // Eine falsche Auswahl wird ausgegraut – so zählt jede Antwort höchstens einmal.
    if (f.art === 'wahl') { const b = $(`#kornFrage [data-w="${KO.wahl}"]`); if (b) { b.disabled = true; b.classList.remove('gold'); b.classList.add('aus'); } KO.wahl = null; }
    log(`❌ Noch nicht richtig. (Lohn jetzt ${Math.round(rateFaktor(KO.raten) * 100)} %)`, 'err');
    if (KO.hier >= 2 && H.tipps.length) log(`💡 ${H.tipps[Math.min(H.tipps.length - 1, KO.hier - 2)]}`, 'leise');
    return;
  }
  log(`✅ Richtig!${f.art === 'zahl' && f.tol ? ` (genau: ${f.wert.toLocaleString('de-DE', { maximumFractionDigits: 2 })})` : ''}${f.erklaerung ? ` ${/^[a-zäöüß]+[ (=<>.,[]/.test(f.erklaerung) && !/^(weil|denn|da|nur|nein|ja|also|sonst|erst|immer|nie|hier)\b/.test(f.erklaerung) ? f.erklaerung : f.erklaerung.charAt(0).toUpperCase() + f.erklaerung.slice(1)}` : ''}`, 'ok');
  KO.fi++; KO.hier = 0;
  if (KO.fi < KO.fragen.length) { kornFrage(); return; }
  kornFragenEnde(true);
}
function kornFragenEnde(ok) {
  $('#kornFrage').innerHTML = '';
  const weiter = () => kornVorherAbrechnen(ok);
  // Vorhersage: der Code läuft zur Kontrolle (bzw. zeigt beim Auflösen, was passiert)
  if (H.sortArt === 'vorher') {
    if (!ok) log(`Die Antworten: ${KO.fragen.slice(KO.fi).map((f) => (f.art === 'wahl' ? f.optionen[f.richtig] : Array.isArray(f.wert) ? f.wert.join(' ') : f.wert)).join(' · ')}`, 'leise');
    log('▶ Jetzt läuft der Code – schau, ob es so kommt, wie du gesagt hast.', 'leise');
    KO.checks = null;
    if (ohneSaecke(H)) { sternZeigen(KO.laeufe[0], 0, true); for (const s of KO.laeufe[0].aus || []) log('» ' + s, 'print'); setTimeout(weiter, 900); return; }
    kornWiedergabe(0, weiter);
  } else {
    if (!ok) log(`Die Antworten: ${KO.fragen.slice(KO.fi).map((f) => (f.art === 'automat' ? 'ein Automat wie unten' : f.art === 'wahrheit' ? 'Tabelle wie unten' : f.art === 'wahl' ? f.optionen[f.richtig] : Array.isArray(f.wert) ? f.wert.join(' ') : f.wert.toLocaleString('de-DE', { maximumFractionDigits: 2 }))).join(' · ')}`, 'leise');
    // ⚙️ aufgelöster Automat: einen passenden Automaten zeigen
    const au = !ok && KO.fragen.slice(KO.fi).find((f) => f.art === 'automat');
    const wt = !ok && KO.fragen.slice(KO.fi).find((f) => f.art === 'wahrheit');
    if (wt) $('#kornFrage').innerHTML = `<div class="kornfrage"><p><b>So sieht die Tabelle aus (${esc(wt.text)}):</b></p>${wahrheitLoesung(wt)}</div>`;
    if (au) { const m ={ zustaende: au.zustaende, start: au.zustaende[0], alphabet: au.alphabet, ...au.loesung }; $('#kornFrage').innerHTML = `<div class="kornfrage"><p><b>So geht es zum Beispiel:</b></p>${svgAutomat(m)}${deltaTabelle(m)}</div>`; }
    weiter();
  }
}
function kornVorherAbrechnen(ok) {
  const h = hofStand(H.id), fehlerfrei = ok && KO.fehler === 0, wenig = ok && KO.fehler <= 2;
  const anteil = ok ? 1 : KO.fi / KO.fragen.length, rf = rateFaktor(KO.raten || 0);
  let gold;
  if (ok) {
    const stern = (neu, alt) => (neu ? H.lohn * STERN_BONUS * (alt ? NACHARBEIT : 1) : 0);
    gold = H.lohn * (h.fertig ? NACHARBEIT : 1) * rf + stern(fehlerfrei, h.kurz) + stern(wenig, h.sparsam);
  } else gold = h.fertig ? 0 : H.lohn * TEILLOHN * anteil;
  gold = Math.round(gold * lohnFaktor());
  const warFertig = h.fertig;
  h.versuche++; h.fertig ||= ok; h.kurz ||= fehlerfrei; h.sparsam ||= wenig; h.heute = P.tag;
  P.gold += gold;
  speichern();
  const st = (an, t) => `<span class="${an ? '' : 'aus'}" title="${t}">⭐</span>`;
  karte(`<h2>${ok ? (H.sortArt === 'messen' ? 'Gut gemessen! 🔬' : H.sortArt === 'fragen' ? 'Geschafft! ✅' : 'Richtig vorhergesagt! 🔮') : 'Aufgelöst'}</h2>
    ${ok ? `<div class="sterne">✅ ${st(fehlerfrei, 'ohne Fehler')}${st(wenig, 'höchstens 2 Fehler')}</div>
      <div class="zeile"><span>⭐ ohne Fehler</span><span>${fehlerfrei ? '✓' : `${KO.fehler} Fehler`}</span></div>
      <div class="zeile"><span>⭐ höchstens 2 Fehler</span><span>${wenig ? '✓' : '–'}</span></div>
      ${KO.raten ? `<div class="zeile"><span>🎲 ${KO.raten} Fehlversuch${KO.raten > 1 ? 'e' : ''}: Lohn</span><span>${Math.round(rf * 100)} %</span></div>` : ''}`
    : `<div class="teil"><div class="teilbalken"><i style="width:${Math.round(anteil * 100)}%"></i></div><span>${Math.round(anteil * 100)} % beantwortet</span></div>`}
    <p class="lohn">+${gold} 🪙${!ok && gold ? ' Teillohn' : ''}${lohnHinweis()}</p>
    ${ok && KO.raten ? `<p class="hinweis">Jeder Fehlversuch kostet ${Math.round(RATE_ABZUG * 100)} % vom Lohn (höchstens bis auf ${Math.round(TEILLOHN * 100)} %). Lieber einmal mehr nachdenken als raten.</p>` : ''}
    ${ok && warFertig ? '<p class="hinweis">Schon gelöster Auftrag: weniger Lohn, neue Sterne zählen voll.</p>' : ''}
    ${H.merkeNach && H.merke ? merkeKasten(H.merke) : ''}`,
  [...zweitKnopf(ok), { label: '👀 Ansehen', fn: () => haupt('🌇 Feierabend', feierabend) }, { label: '🌇 Feierabend', fn: feierabend }]);
  if (H.merkeNach && H.merke && !P.gesehen['merke:' + H.id]) { P.gesehen['merke:' + H.id] = true; speichern(); }
  neben([]);
  haupt('🌇 Feierabend', feierabend);
  hud();
}
// Merke auf der Ergebniskarte (merkeNach): erst messen und antworten, dann das Merke
const merkeKasten = (m) => `<div class="merkebox" style="text-align:left;border:2px solid #c9a65a;border-radius:10px;padding:8px 12px;margin-top:10px"><b>📌 ${esc(m.titel)}</b><p>${esc(m.text)}</p>${m.code ? `<pre class="mono">${esc(m.code)}</pre>` : ''}</div>`;

// --- 🔬 Messlabor: fester Code auf wachsenden Listen; Tabelle und Kurve, dann die Fragen ---
function messListe(art, n, seed) {
  if (art === 'sortiert') return Array.from({ length: n }, (_, i) => i + 1);
  if (art === 'umgekehrt') return Array.from({ length: n }, (_, i) => n - i);
  return zufallsListe(n, seed, 1000);
}
// 🪞 messen.eigen = [[hofId, funktion], …]: gemessen wird der selbst geschriebene Code des ersten gelösten Auftrags (h.geloest)
function kornMessCode(h) {
  for (const [id, fn] of h.messen?.eigen || []) {
    const s = (typeof P !== 'undefined' && P?.hoefe?.[id]) || null;
    if (s?.fertig && s.geloest && new RegExp(`^def\\s+${fn}\\s*\\(`, 'm').test(s.geloest)) return { code: s.geloest, fn, von: hofById(id)?.titel || id };
  }
  return { code: h.code, fn: null, von: null };
}
function kornMessen() {
  const M = H.messen, spalten = [];
  let mc = kornMessCode(H);
  const messe = (code, fn) => {
    const sp = [];
    for (const a of M.aufrufe) {
      const listen = M.groessen.map((n, i) => messListe(a.liste, n, 100 + i));
      const r = PY.sort(code, [...S_LK, 'fertig'], { art: 'funktion', aufruf: fn ? `${fn}(a)` : a.aufruf, listen, ereignisse: false, rueckgabe: false });
      if (r.err || r.laeufe.some((l) => l.err)) { console.warn(r); return null; }
      sp.push(r.laeufe.map((l) => l.v));
    }
    return sp;
  };
  let sp = messe(mc.code, mc.fn);
  // eigener Code lässt sich nicht messen (z. B. zu langsam) → Musterlösung
  if (!sp && mc.fn) { log(`Dein Code aus „${mc.von}“ ließ sich nicht messen – gemessen wird stattdessen ein Insertionsort.`, 'leise'); mc = { code: H.code, fn: null }; ED.value = H.code; sp = messe(H.code, null); }
  if (!sp) { log('Messung fehlgeschlagen.', 'err'); return; }
  spalten.push(...sp);
  if (M.eigen) KO.messInfo = (mc.von ? `🪞 Gemessen wird dein eigener Code aus „${mc.von}“ (links im Editor).` : '🪞 Du hast noch keinen Sortierer selbst gelöst – gemessen wird ein Insertionsort. Löse erst Insertion-, Selection- oder Bubblesort, dann misst das Labor deinen Code.');
  KO.mess = spalten;
  const farben = ['#ffd84a', '#7cc4ff', '#ff8fd8', '#7cf0a0'];
  $('#kornMess').innerHTML = `<div class="kornmess"><table class="messtab"><tr><th>n</th>${M.aufrufe.map((a, i) => `<th style="color:${farben[i]}">${esc(a.name)}<br><span class="hinweis">Vergleiche</span></th>`).join('')}</tr>
    ${M.groessen.map((n, z) => `<tr><td>${n}</td>${spalten.map((s) => `<td>${s[z].toLocaleString('de-DE')}</td>`).join('')}</tr>`).join('')}</table>
    <canvas id="messCanvas"></canvas></div>`;
  $('#kornCanvas').classList.add('hidden');
  $('#kornChips').innerHTML = '';
  kornKurve(M.groessen, spalten, farben);
  kornFragenStart(null);
}
function kornKurve(ns, spalten, farben) {
  const cv = $('#messCanvas'), w = cv.clientWidth || 360, h = 200, dpr = devicePixelRatio || 1;
  cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = '#0e1838'; g.fillRect(0, 0, w, h);
  const l = 44, u = h - 26, o = 12, r = w - 12, maxN = Math.max(...ns), maxV = Math.max(1, ...spalten.flat());
  g.strokeStyle = '#3a4f8f'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(l, o); g.lineTo(l, u); g.lineTo(r, u); g.stroke();
  g.fillStyle = '#93a3d4'; g.font = '11px system-ui'; g.textAlign = 'center';
  for (const n of ns) g.fillText(n, l + (r - l) * n / maxN, u + 14);
  g.textAlign = 'right'; g.fillText(maxV.toLocaleString('de-DE'), l - 4, o + 8); g.fillText('0', l - 4, u);
  g.textAlign = 'left'; g.fillText('n →', r - 22, u - 6);
  spalten.forEach((s, k) => {
    g.strokeStyle = farben[k]; g.fillStyle = farben[k]; g.lineWidth = 2.5;
    g.beginPath();
    s.forEach((v, i) => { const x = l + (r - l) * ns[i] / maxN, y = u - (u - o) * v / maxV; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    g.stroke();
    s.forEach((v, i) => { g.beginPath(); g.arc(l + (r - l) * ns[i] / maxN, u - (u - o) * v / maxV, 3.5, 0, 7); g.fill(); });
  });
}
