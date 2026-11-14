'use strict';
// 🗝️ Kerker-Fragen Burg 30 (LK Abitur, gemischt mit Abi-Operatoren) – Quellen: OPAL LK_INF_Abiturvorbereitung
// (0 Prüfung, 2.1 Programmieren mit Dateien, 2.2 Suchen/Sortieren/Rekursion, 2.3 Komplexität und Berechenbarkeit,
// 4.1 OOP, 5.1 Sprachen und Automaten, 6.1 Rechnernetze, 6.2 Informationssicherheit, 7.1 Datenbanken),
// Lehrplan Sachsen LK Informatik (Abiturprüfung ab 2027). Kapitel 130–135.
KERKER_FRAGEN.push(
  // ---------- Kapitel 130: Teil-A-Sprint ----------
  { id: 'k30_001', burg: 30, kap: 130, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 2.2.1 a',
    gen: (z) => {
      const n = z.int(5, 12);
      return { frage: `Wie viele Vergleiche braucht Selectionsort, um eine Liste mit ${n} Einträgen zu sortieren?`,
        antworten: [String((n * (n - 1)) / 2)],
        erkl: `Im 1. Durchlauf ${n - 1} Vergleiche, dann ${n - 2}, … bis 1: zusammen n · (n − 1) / 2 = ${(n * (n - 1)) / 2} – unabhängig von der Reihenfolge der Daten.` };
    } },
  { id: 'k30_002', burg: 30, kap: 130, stufe: 1, art: 'eingabe', frage: 'Die Liste 42, 17, 35, 9, 28, 14 wird mit Bubblesort aufsteigend sortiert. Wie sieht sie nach dem ersten Durchlauf aus? (Zahlen mit Komma)',
    antworten: ['17, 35, 9, 28, 14, 42', '17,35,9,28,14,42', '17 35 9 28 14 42'],
    erkl: 'Bubblesort vergleicht Nachbarn und tauscht – das größte Element wandert nach hinten. 9, 17, 35, 42, 28, 14 wäre der erste Durchlauf von Selectionsort.', quelle: 'OPAL Abiturvorbereitung 2.2.4 a' },
  { id: 'k30_003', burg: 30, kap: 130, stufe: 1, art: 'wahl', frage: 'Welche Eigenschaft eines Algorithmus ist gemeint: „Bei gleicher Eingabe liefert das Verfahren immer dasselbe Ergebnis.“?',
    optionen: ['Determiniertheit', 'Terminierung', 'Finitheit', 'Ausführbarkeit'],
    erkl: 'Terminierung: endet nach endlich vielen Schritten. Finitheit: endlich lange Beschreibung. Ausführbarkeit: jeder Schritt ist machbar.', quelle: 'OPAL Abiturvorbereitung 2.3.4' },
  { id: 'k30_004', burg: 30, kap: 130, stufe: 2, art: 'zuordnen', frage: 'Jedes Verfahren verletzt eine Eigenschaft eines Algorithmus. Ordne zu.',
    paare: [['x = 7; solange x ≠ 0: x = x − 2', 'Terminierung'], ['Würfle eine Zahl und gib sie aus.', 'Determiniertheit'], ['Schreibe die größte Primzahl auf.', 'Ausführbarkeit'], ['Schreibe für jede natürliche Zahl eine eigene Regel auf.', 'Finitheit']],
    erkl: 'x läuft 7, 5, 3, 1, −1 … und wird nie 0. Es gibt keine größte Primzahl. Unendlich viele Regeln ergeben keine endliche Beschreibung.', quelle: 'OPAL Abiturvorbereitung 2.3.1 c, 2.3.4 b' },
  { id: 'k30_005', burg: 30, kap: 130, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 2.2.5 d, 2.3.6',
    gen: (z) => {
      const n = z.wahl([15, 31, 100, 500, 1000, 4096, 1000000]), r = Math.floor(Math.log2(n)) + 1;
      return { frage: `Eine sortierte Liste hat ${n.toLocaleString('de-DE')} Einträge. Wie viele Runden braucht die binäre Suche höchstens?`, antworten: [String(r)],
        erkl: `Jede Runde halbiert den Suchbereich. Nach ${r - 1} Halbierungen sind höchstens ${Math.ceil(n / 2 ** (r - 1))} Einträge übrig, mit Runde ${r} ist sicher Schluss (⌊log₂ n⌋ + 1 = ${r}). Sequenziell wären es bis zu ${n.toLocaleString('de-DE')} Vergleiche.` };
    } },
  { id: 'k30_006', burg: 30, kap: 130, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 0 Prüfung (Teil A), Abiturvorbereitung 3.1',
    gen: (z) => {
      const ops = [], st = [];
      let k = 0;
      while (ops.length < 7) {
        if (st.length && (z.int(0, 2) === 0 || st.length > 3) && k > 0) { st.pop(); ops.push('pop()'); }
        else { const v = z.int(1, 9); st.push(v); ops.push(`push(${v})`); k++; }
      }
      if (!st.length) { st.push(5); ops.push('push(5)'); }
      return { frage: `Ein Stapel ist leer. Ausgeführt wird: ${ops.join(', ')}. Welches Element liegt danach oben?`, antworten: [String(st[st.length - 1])],
        erkl: `Stapel = LIFO: pop nimmt immer das zuletzt hineingelegte Element. Am Ende liegt (von unten nach oben) ${st.join(', ')} – oben ${st[st.length - 1]}.` };
    } },
  { id: 'k30_007', burg: 30, kap: 130, stufe: 3, art: 'wahl', frage: '', optionen: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 2.3.1 f',
    gen: (z) => {
      const f = z.wahl([2, 4, 8, 1024]), k = Math.log2(f), n0 = z.wahl([30, 40]);
      return { frage: `Ein Programm probiert alle 2ⁿ Auswahlen aus n Anfragen durch. ${n0} Anfragen dauern eine Stunde. Wie viele Anfragen schafft ein ${f}-mal so schneller Rechner in einer Stunde?`,
        optionen: [`${n0 + k}`, `${n0 * f}`, `${n0 + 10 * k}`, `${n0 + f}`],
        erkl: `Jede weitere Anfrage verdoppelt die Arbeit: 2^(${n0} + ${k}) = 2^${n0} · 2^${k} = 2^${n0} · ${f}. Ein ${f}-mal schnellerer Rechner schafft nur ${k} Anfrage${k > 1 ? 'n' : ''} mehr – bei exponentiellem Aufwand hilft schnellere Hardware kaum.` };
    } },
  { id: 'k30_008', burg: 30, kap: 130, stufe: 2, art: 'zuordnen', frage: 'Ordne der gemessenen Laufzeit die Komplexitätsklasse zu.',
    paare: [['n verdoppeln → Laufzeit etwa ×2', 'O(n)'], ['n verdoppeln → Laufzeit etwa ×4', 'O(n²)'], ['n verdoppeln → Laufzeit wächst nur um einen festen Betrag', 'O(log n)'], ['n um 1 erhöhen → Laufzeit etwa ×2', 'O(2ⁿ)']],
    erkl: 'O(n · log n) wächst beim Verdoppeln etwas stärker als ×2. Messwerte zeigen eine Tendenz, sie „beweisen“ keine Klasse.', quelle: 'OPAL Abiturvorbereitung 2.3.5' },
  { id: 'k30_009', burg: 30, kap: 130, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 2.3.1 d',
    code: 'def hat_doppelte(nummern):\n    n = len(nummern)\n    for i in range(n - 1):\n        for j in range(i + 1, n):\n            if nummern[i] == nummern[j]:\n                return True\n    return False',
    gen: (z) => { const n = z.int(5, 12); return { frage: `Wie viele Vergleiche nummern[i] == nummern[j] macht die Funktion im worst case bei ${n} Nummern?`, antworten: [String((n * (n - 1)) / 2)], erkl: `Worst case: keine Nummer doppelt. ${n - 1} + ${n - 2} + … + 1 = ${n} · ${n - 1} / 2 = ${(n * (n - 1)) / 2} – also O(n²).` }; } },

  // ---------- Kapitel 131: Rekursion und Aufwand ----------
  { id: 'k30_010', burg: 30, kap: 131, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 2.3.2 b',
    code: 'def t(n):\n    if n <= 1:\n        return 1\n    return t(n - 1) + t(n - 1)',
    gen: (z) => {
      const n = z.int(3, 8);
      return { frage: `Wie viele Aufrufe von t entstehen insgesamt beim Aufruf t(${n}) – der erste Aufruf zählt mit?`, antworten: [String(2 ** n - 1)],
        erkl: `A(1) = 1 und A(n) = 1 + 2 · A(n − 1): 1, 3, 7, 15, … also A(n) = 2ⁿ − 1 = ${2 ** n - 1}.` };
    } },
  { id: 'k30_011', burg: 30, kap: 131, stufe: 3, art: 'wahl', frage: 'Welche Komplexität hat t(n), und wie wird die Funktion mit gleichem Ergebnis schnell?',
    code: 'def t(n):\n    if n <= 1:\n        return 1\n    return t(n - 1) + t(n - 1)',
    optionen: ['O(2ⁿ); schneller: t(n − 1) nur einmal berechnen – dann O(n)', 'O(n²); schneller geht es nicht', 'O(n); die Funktion ist schon optimal', 'O(2ⁿ); schneller: statt Rekursion eine Liste anlegen – dann O(1)'],
    erkl: 'Der doppelte Aufruf berechnet zweimal dasselbe: x = t(n − 1) einmal berechnen und x + x zurückgeben. Mit einem Aufruf je Stufe gibt es nur n Aufrufe.', quelle: 'OPAL Abiturvorbereitung 2.3.2 e' },
  { id: 'k30_012', burg: 30, kap: 131, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 2.2.1 e',
    code: 'def b(n):\n    if n < 2:\n        return str(n)\n    return b(n // 2) + str(n % 2)',
    gen: (z) => {
      const n = z.int(5, 60), k = [];
      for (let m = n; m >= 2; m = Math.floor(m / 2)) k.push(`b(${m})`);
      return { frage: `Was gibt print(b(${n})) aus?`, antworten: [n.toString(2)],
        erkl: `Abstieg: ${k.join(' → ')} → b(1) = "1". Im Aufstieg hängt jeder Aufruf seinen Rest n % 2 hinten an: ${n.toString(2)} – die Binärdarstellung von ${n}.` };
    } },
  { id: 'k30_013', burg: 30, kap: 131, stufe: 2, art: 'wahl', frage: 'Beim Aufruf b(13) mit b(n) = b(n // 2) + str(n % 2): Wann wird die Ziffer str(13 % 2) angehängt?',
    optionen: ['Im Aufstieg, nachdem b(6) fertig ist', 'Im Abstieg, bevor b(6) überhaupt aufgerufen wird', 'Ganz am Anfang, weil 13 die erste Zahl der Rechnung ist', 'Gar nicht, sie wird vom Ergebnis von b(6) überschrieben'],
    erkl: 'Was nach dem rekursiven Aufruf steht, passiert im Aufstieg. Deshalb steht die Ziffer von 13 ganz hinten.', quelle: 'OPAL Abiturvorbereitung 2.2.1 e, 2.2.10' },
  { id: 'k30_014', burg: 30, kap: 131, stufe: 1, art: 'wahl', frage: 'Welche Voraussetzung braucht die binäre Suche?',
    optionen: ['Die Liste muss sortiert sein', 'Die Liste muss eine Zweierpotenz an Einträgen haben', 'Der gesuchte Wert muss in der Liste vorkommen', 'Die Liste darf keine doppelten Werte enthalten'],
    erkl: 'Nur in einer sortierten Liste weiß man nach dem Vergleich mit der Mitte, in welcher Hälfte weitergesucht werden muss.', quelle: 'OPAL Abiturvorbereitung 2.2.5' },
  { id: 'k30_015', burg: 30, kap: 131, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 2.2.1 d, 2.2.5',
    code: 'def binaer(liste, x):\n    links = 0\n    rechts = len(liste) - 1\n    while links <= rechts:\n        mitte = (links + rechts) // 2\n        if liste[mitte] == x:\n            return mitte\n        elif liste[mitte] < x:\n            links = mitte + 1\n        else:\n            rechts = mitte - 1\n    return -1',
    gen: (z) => {
      const l = [4, 9, 13, 18, 22, 27, 31, 36, 40, 45, 52, 58, 63, 71, 79], x = z.wahl([...l, 5, 30, 64, 80, 1]);
      let li = 0, re = l.length - 1, r = 0;
      const m = [];
      while (li <= re) { const mi = Math.floor((li + re) / 2); r++; m.push(l[mi]); if (l[mi] === x) break; if (l[mi] < x) li = mi + 1; else re = mi - 1; }
      return { frage: `liste = [${l.join(', ')}]. Wie viele Durchläufe der while-Schleife braucht binaer(liste, ${x})?`, antworten: [String(r)],
        erkl: `Werte an der Stelle mitte: ${m.join(', ')}. ${l.includes(x) ? `${x} gefunden` : `${x} kommt nicht vor, danach ist links > rechts`} – ${r} Durchläufe.` };
    } },
  { id: 'k30_016', burg: 30, kap: 131, stufe: 3, art: 'wahl', frage: 'Ein Mitglied der Turnierleitung meint: „Für eine Million Teams dürfen wir die rekursive Fassung nicht verwenden, Python bricht sonst wegen zu tiefer Rekursion ab.“ Nimm Stellung.',
    code: 'def runden(teams):\n    if teams <= 1:\n        return 0\n    return 1 + runden((teams + 1) // 2)',
    optionen: ['Stimmt nicht: Die Rekursionstiefe ist nur etwa 20', 'Stimmt, jede Rekursion bricht bei großen Zahlen irgendwann ab', 'Stimmt, die Rekursionstiefe wäre etwa 1 000 000 Aufrufe', 'Stimmt nicht, Python hat keine Grenze für die Rekursionstiefe'],
    erkl: 'runden halbiert die Anzahl bei jedem Aufruf: Tiefe etwa log₂(10⁶) ≈ 20 – weit unter Pythons Grenze von etwa 1000 Aufrufen. Entscheidend ist die Tiefe, nicht die Größe der Zahl. Bei einer Rekursion, die n nur um 1 verkleinert (wie eine rekursive Summe), hätte das Mitglied recht.', quelle: 'OPAL Abiturvorbereitung 2.2.10 d' },
  { id: 'k30_017', burg: 30, kap: 131, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 2.2.9 a',
    gen: (z) => {
      const pool = z.mische([3, 5, 8, 12, 15, 20, 25, 30, 33, 41, 47]), na = z.int(2, 4), a = pool.slice(0, na).sort((p, q) => p - q), b = pool.slice(na, na + z.int(3, 4)).sort((p, q) => p - q);
      let i = 0, j = 0, v = 0;
      while (i < a.length && j < b.length) { v++; if (a[i] <= b[j]) i++; else j++; }
      return { frage: `Wie viele Vergleiche braucht merge([${a.join(', ')}], [${b.join(', ')}]), wenn verglichen wird, bis eine der beiden Listen leer ist?`, antworten: [String(v)],
        erkl: `Bei jedem Vergleich wandert das kleinere vordere Element ins Ergebnis. Ist eine Liste leer, wird der Rest ohne Vergleich angehängt: ${v} Vergleiche (höchstens ${a.length + b.length - 1}).` };
    } },
  { id: 'k30_018', burg: 30, kap: 131, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 2.2.9 b',
    gen: (z) => { const k = z.int(8, 12), n = 2 ** k; return { frage: `Mergesort braucht höchstens etwa n · log₂ n Vergleiche. Wie viele sind das für n = ${n}?`, antworten: [String(k * n)], erkl: `log₂ ${n} = ${k} Ebenen, auf jeder Ebene höchstens etwa n Vergleiche: ${k} · ${n} = ${k * n}. Selectionsort bräuchte ${(n * (n - 1)) / 2}.` }; } },
  { id: 'k30_019', burg: 30, kap: 131, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 2.2.3 (Quicksort mit sortierter Liste)',
    gen: (z) => { const n = z.int(5, 12); return { frage: `Quicksort wählt immer das erste Element als Pivot. Wie viele Vergleiche mit einem Pivot braucht er für eine bereits sortierte Liste mit ${n} Einträgen?`, antworten: [String((n * (n - 1)) / 2)], erkl: `Jede Zerlegung lässt links nichts übrig, rechts n − 1 Elemente: (${n} − 1) + (${n} − 2) + … + 1 = ${(n * (n - 1)) / 2}. Worst case O(n²) – so viel wie Selectionsort.` }; } },
  { id: 'k30_020', burg: 30, kap: 131, stufe: 2, art: 'wahl', frage: 'Für welche Daten ist Countingsort ungeeignet?',
    optionen: ['10 Zahlen zwischen 0 und einer Milliarde', 'Schuhgrößen von 36 bis 47 aller Schüler', 'Noten von 1 bis 6 einer ganzen Schule', 'Viele gleiche Werte in einem kleinen Bereich'],
    erkl: 'Countingsort braucht eine Zählliste für den ganzen Wertebereich: Aufwand etwa n + (g − k + 1). Bei riesigem Bereich dominiert die Zählliste.', quelle: 'OPAL Abiturvorbereitung 2.2.2 d' },

  // ---------- Kapitel 132: Automat und Grammatik ----------
  { id: 'k30_021', burg: 30, kap: 132, stufe: 1, art: 'mehr', frage: 'Klopfzeichen k (kurz) und l (lang): Startzustand q0, Endzustand q3, q4 ist ein Fangzustand. Kreuze alle Wörter an, die der Automat akzeptiert.',
    bild: () => svgAutomat({ zustaende: ['q0', 'q1', 'q2', 'q3', 'q4'], start: 'q0', ende: ['q3'], delta: { q0: { k: 'q1', l: 'q4' }, q1: { k: 'q1', l: 'q2' }, q2: { k: 'q1', l: 'q3' }, q3: { k: 'q1', l: 'q3' }, q4: { k: 'q4', l: 'q4' } } }, { fang: 'q4' }),
    optionen: ['kll', 'klll', 'kkll', 'lkll', 'kllk', 'kl'], richtig: [0, 1, 2],
    erkl: 'Ein l am Anfang führt in den Fangzustand q4. kllk endet in q1, kl in q2.', quelle: 'OPAL Abiturvorbereitung 5.1.1 a' },
  { id: 'k30_022', burg: 30, kap: 132, stufe: 2, art: 'wahl', frage: 'Beschreiben Sie verbal die Sprache des Klopfzeichen-Automaten (Start q0, Ende q3, Fangzustand q4).',
    bild: () => svgAutomat({ zustaende: ['q0', 'q1', 'q2', 'q3', 'q4'], start: 'q0', ende: ['q3'], delta: { q0: { k: 'q1', l: 'q4' }, q1: { k: 'q1', l: 'q2' }, q2: { k: 'q1', l: 'q3' }, q3: { k: 'q1', l: 'q3' }, q4: { k: 'q4', l: 'q4' } } }, { fang: 'q4' }),
    optionen: ['alle Wörter, die mit k beginnen und mit ll enden', 'alle Wörter, die ll enthalten', 'alle Wörter, die mit k beginnen und genau zwei l enthalten', 'alle Wörter, die auf ll enden'],
    erkl: 'q1 = „zuletzt k“, q2 = „zuletzt genau ein l“, q3 = „zuletzt mindestens zwei l“. Ein Wort, das mit l beginnt, landet für immer in q4.', quelle: 'OPAL Abiturvorbereitung 5.1.1 b/c' },
  { id: 'k30_023', burg: 30, kap: 132, stufe: 2, art: 'mehr', frage: 'Überführen Sie den Klopfzeichen-Automaten (Start q0, Ende q3, Fangzustand q4) in eine reguläre Grammatik. Kreuzen Sie alle Regeln an, die dazugehören.',
    bild: () => svgAutomat({ zustaende: ['q0', 'q1', 'q2', 'q3', 'q4'], start: 'q0', ende: ['q3'], delta: { q0: { k: 'q1', l: 'q4' }, q1: { k: 'q1', l: 'q2' }, q2: { k: 'q1', l: 'q3' }, q3: { k: 'q1', l: 'q3' }, q4: { k: 'q4', l: 'q4' } } }, { fang: 'q4' }),
    optionen: ['q2 → l', 'q3 → lq3', 'q1 → kq1', 'q0 → lq4', 'q3 → ε', 'q1 → l'], richtig: [0, 1, 2],
    erkl: 'Übergänge in den Endzustand q3 liefern zusätzlich q2 → l und q3 → l. Der Fangzustand bekommt kein Nichtterminal, ε-Regeln braucht man nicht. q1 → l wäre falsch, weil q2 kein Endzustand ist.', quelle: 'OPAL Abiturvorbereitung 5.1.1 d' },
  { id: 'k30_024', burg: 30, kap: 132, stufe: 3, art: 'eingabe', zahl: true, frage: 'Wie viele Regeln (jede Alternative einzeln gezählt) hat die vollständige reguläre Grammatik zum Klopfzeichen-Automaten, wenn der Fangzustand weggelassen wird?',
    bild: () => svgAutomat({ zustaende: ['q0', 'q1', 'q2', 'q3', 'q4'], start: 'q0', ende: ['q3'], delta: { q0: { k: 'q1', l: 'q4' }, q1: { k: 'q1', l: 'q2' }, q2: { k: 'q1', l: 'q3' }, q3: { k: 'q1', l: 'q3' }, q4: { k: 'q4', l: 'q4' } } }, { fang: 'q4' }),
    antworten: ['9'], erkl: 'q0 → kq1 · q1 → kq1 | lq2 · q2 → kq1 | lq3 | l · q3 → kq1 | lq3 | l: 1 + 2 + 3 + 3 = 9 Regeln. N = {q0, q1, q2, q3}.', quelle: 'OPAL Abiturvorbereitung 5.1.1 d (Kontrolle)' },
  { id: 'k30_025', burg: 30, kap: 132, stufe: 1, art: 'wahl', frage: 'Was beschreibt die Syntax einer Sprache?',
    optionen: ['die Regeln, nach denen gültige Sätze aufgebaut sind', 'die Bedeutung der einzelnen Wörter und Sätze', 'die Menge aller Zeichen, die vorkommen dürfen', 'die Übersetzung eines Programms in Maschinencode'],
    erkl: 'Die Bedeutung ist die Semantik, die Zeichenmenge das Alphabet. 2026 wurde im Abitur nach Syntax und Semantik gefragt.', quelle: 'OPAL Abiturvorbereitung 5.1.4 a' },
  { id: 'k30_026', burg: 30, kap: 132, stufe: 1, art: 'wahl', frage: 'Welcher Automatentyp erkennt genau die Sprachen, die von kontextfreien Grammatiken (Typ 2) erzeugt werden?',
    optionen: ['Kellerautomat', 'deterministischer endlicher Automat', 'linear beschränkter Automat', 'Turingmaschine'],
    erkl: 'Der Keller (Stapelspeicher) erlaubt unbeschränkt tiefe Klammerstrukturen, wie sie kontextfreie Sprachen enthalten.', quelle: 'OPAL Abiturvorbereitung 5.1.8 d' },
  { id: 'k30_027', burg: 30, kap: 132, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 5.1.8 a/b',
    code: 'δ        | 0          | 1          | □\nq0       | (q0, 1, R) | (q0, 0, R) | (q1, □, L)\nq1       | (q1, 0, L) | (q1, 1, L) | (q2, □, R)\nq2 Halt  | –          | –          | –',
    gen: (z) => {
      let w = '';
      for (let i = z.int(3, 6); i > 0; i--) w += z.wahl(['0', '1']);
      const e = [...w].map((c) => (c === '0' ? '1' : '0')).join('');
      return { frage: `Turingmaschine: Der Kopf steht auf der ersten Ziffer, Start q0, □ = Leersymbol. Welche Ziffern stehen nach dem Halten auf dem Band, wenn die Eingabe ${w} war?`, antworten: [e],
        erkl: `In q0 läuft der Kopf nach rechts und kehrt jede Ziffer um, am ersten □ dreht er um. In q1 läuft er ohne Änderung zurück: ${w} wird zu ${e}, der Kopf steht wieder auf der ersten Ziffer.` };
    } },
  { id: 'k30_028', burg: 30, kap: 132, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 5.1.8 a (Kontrolle)',
    code: 'δ        | 0          | 1          | □\nq0       | (q0, 1, R) | (q0, 0, R) | (q1, □, L)\nq1       | (q1, 0, L) | (q1, 1, L) | (q2, □, R)\nq2 Halt  | –          | –          | –',
    gen: (z) => { const n = z.int(2, 8); return { frage: `Wie viele Rechenschritte (⊢) macht diese Turingmaschine bei einer Eingabe aus ${n} Ziffern, bis sie in q2 hält?`, antworten: [String(2 * n + 2)], erkl: `${n} Schritte nach rechts, 1 Schritt am □ (umdrehen), ${n} Schritte zurück, 1 Schritt am linken □ nach q2: 2 · ${n} + 2 = ${2 * n + 2}.` }; } },
  { id: 'k30_029', burg: 30, kap: 132, stufe: 1, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 5.1.1 e',
    gen: (z) => { const n = z.int(1, 4), w = 'x'.repeat(n) + 'z' + 'y'.repeat(n); return { frage: `G = ({S}, {x, y, z}, { S → xSy | z }, S). Geben Sie das Wort an, das G mit genau ${n + 1} Ableitungsschritten erzeugt.`, antworten: [w], erkl: `${n}-mal S → xSy, dann einmal S → z: ${w}. Links und rechts vom z stehen immer gleich viele x bzw. y.` }; } },

  // ---------- Kapitel 133: Datenbank-Szenario Musikschule ----------
  { id: 'k30_030', burg: 30, kap: 133, stufe: 1, art: 'wahl', frage: 'Welche Abfrage liefert alle Kurse (kurs_id) mit mindestens 3 Belegungen?',
    optionen: ['SELECT kurs_id, COUNT(*) FROM belegung GROUP BY kurs_id HAVING COUNT(*) >= 3;', 'SELECT kurs_id, COUNT(*) FROM belegung WHERE COUNT(*) >= 3 GROUP BY kurs_id;', 'SELECT kurs_id, COUNT(*) FROM belegung HAVING COUNT(*) >= 3;', 'SELECT kurs_id, COUNT(*) FROM belegung GROUP BY kurs_id ORDER BY COUNT(*) DESC;'],
    erkl: 'Bedingungen an Gruppen (COUNT) gehören in HAVING nach GROUP BY. WHERE filtert einzelne Zeilen und kennt noch keine Gruppen.', quelle: 'OPAL Abiturvorbereitung 7.1.4 a' },
  { id: 'k30_031', burg: 30, kap: 133, stufe: 2, art: 'eingabe', zahl: true, frage: 'Wie viele Zeilen liefert die Abfrage für die abgebildeten Daten?',
    code: 'SELECT kurs_id, COUNT(*)\nFROM belegung\nGROUP BY kurs_id\nHAVING COUNT(*) >= 3;',
    bild: () => AB_bild(AB_tab(['id', 'schueler_id', 'kurs_id'], AB_DB.daten('A').belegung, 'belegung')),
    antworten: ['3'], erkl: 'Kurs 1, 3 und 5 haben je 3 Belegungen, Kurs 4 hat 2, Kurs 2 hat 1. Kurs 6 kommt in belegung gar nicht vor.', quelle: 'OPAL Abiturvorbereitung 7.1.4 b' },
  { id: 'k30_032', burg: 30, kap: 133, stufe: 2, art: 'eingabe', zahl: true, frage: 'Wie viele Zeilen liefert die Abfrage?',
    code: 'SELECT titel, gebuehr\nFROM kurs\nWHERE gebuehr > (SELECT AVG(gebuehr) FROM kurs);',
    bild: () => AB_bild(AB_tab(['id', 'titel', 'lehrkraft_id', 'gebuehr'], AB_DB.daten('A').kurs, 'kurs')),
    antworten: ['3'], erkl: 'Durchschnitt (45 + 60 + 35 + 40 + 30 + 55) / 6 ≈ 44,17 €. Darüber liegen 45, 60 und 55 €. Die Unterabfrage vermeidet, den Durchschnitt als Zahl hineinzuschreiben.', quelle: 'OPAL Abiturvorbereitung 7.1.2 b' },
  { id: 'k30_033', burg: 30, kap: 133, stufe: 2, art: 'eingabe', zahl: true, frage: 'Wie viele Zeilen liefert die Abfrage (Kurse der Lehrkraft 1)?',
    code: 'SELECT s.name\nFROM schueler s\nINNER JOIN belegung b ON b.schueler_id = s.id\nINNER JOIN kurs k ON b.kurs_id = k.id\nWHERE k.lehrkraft_id = 1;',
    bild: () => AB_bild(AB_tab(['id', 'titel', 'lehrkraft_id', 'gebuehr'], AB_DB.daten('A').kurs, 'kurs') + AB_tab(['id', 'schueler_id', 'kurs_id'], AB_DB.daten('A').belegung, 'belegung')),
    antworten: ['4'], erkl: 'Lehrkraft 1 unterrichtet Kurs 1 und 2. Belegungen dafür: (1, 1), (3, 2), (5, 1), (7, 1) – vier Zeilen (Lena, Sophie, Mia, Emma).', quelle: 'OPAL Abiturvorbereitung 7.1.2' },
  { id: 'k30_034', burg: 30, kap: 133, stufe: 3, art: 'wahl', frage: 'Gezählt werden sollen nur Kurse mit einer Gebühr über 40 €. Warum gehört die Bedingung gebuehr > 40 in die WHERE-Klausel und nicht in HAVING?',
    optionen: ['Die Gebühr ist ein Wert jeder einzelnen Zeile', 'Weil HAVING nur mit ganzen Zahlen umgehen kann', 'Weil WHERE schneller ist, sonst wäre es egal', 'Weil in HAVING nur die Funktion COUNT erlaubt ist'],
    erkl: 'WHERE filtert einzelne Zeilen vor dem Gruppieren, HAVING ganze Gruppen (z. B. COUNT(*)). Faustregel: Bedingungen an Spalten → WHERE, Bedingungen an Aggregatfunktionen → HAVING.', quelle: 'OPAL Abiturvorbereitung 7.1.4 c' },
  { id: 'k30_035', burg: 30, kap: 133, stufe: 1, art: 'zuordnen', frage: 'Eine Tabelle Kursliste speichert in jeder Zeile Kurs, Lehrkraft und deren Telefonnummer. Ordne die Anomalie zu.',
    paare: [['Einfügeanomalie', 'Eine neue Lehrkraft kann erst gespeichert werden, wenn sie einen Kurs hat'], ['Löschanomalie', 'Mit dem letzten Kurs einer Lehrkraft gehen auch ihre Kontaktdaten verloren'], ['Änderungsanomalie', 'Eine neue Telefonnummer muss in vielen Zeilen geändert werden – vergisst man eine, ist die Datenbank widersprüchlich']],
    erkl: 'Ursache ist Redundanz: Daten der Lehrkraft stehen in jeder Kurszeile. Abhilfe: Zerlegung in Relationen in 3NF.', quelle: 'OPAL Abiturvorbereitung 7.1.1 a, 7.1.7' },
  { id: 'k30_036', burg: 30, kap: 133, stufe: 1, art: 'eingabe', frage: 'Welche Kardinalität hat die Beziehung zwischen schueler und kurs, die die Tabelle belegung (schueler_id, kurs_id) abbildet? (Schreibweise wie 1:n)',
    antworten: ['n:m', 'm:n'],
    erkl: 'Ein Schüler belegt viele Kurse, ein Kurs hat viele Schüler. Eine n:m-Beziehung wird im Relationenmodell durch eine eigene Tabelle mit zwei Fremdschlüsseln aufgelöst.', quelle: 'OPAL Abiturvorbereitung 7.1.3, 7.1.6' },
  { id: 'k30_037', burg: 30, kap: 133, stufe: 2, art: 'wahl', frage: 'Ein Schüler verlangt, dass seine Daten vollständig gelöscht werden. Welche Reihenfolge der DELETE-Anweisungen ist richtig?',
    optionen: ['Erst seine Zeilen in belegung, dann die in schueler', 'Erst seine Zeile in schueler, dann die in belegung', 'Die Reihenfolge ist egal, beides wird gelöscht', 'Nur in schueler löschen, belegung passt sich an'],
    erkl: 'Sonst verweisen Belegungen auf einen nicht vorhandenen Schüler (referentielle Integrität). Ein Fremdschlüssel muss immer auf einen vorhandenen Datensatz zeigen. Mit REFERENCES lehnt die Datenbank das falsche Löschen sogar ab.', quelle: 'OPAL Abiturvorbereitung 7.1.8 b/c' },
  { id: 'k30_038', burg: 30, kap: 133, stufe: 3, art: 'wahl', frage: 'Anmeldung(schueler_id, kurs_id, schueler_name, kurs_titel) mit dem zusammengesetzten Primärschlüssel (schueler_id, kurs_id). Warum ist die Tabelle nicht in 2NF?',
    optionen: ['schueler_name hängt nur von schueler_id ab', 'Weil sie für eine Tabelle zu viele Spalten hat', 'Weil Namen grundsätzlich keine atomaren Werte sind', 'Weil sie keinen eindeutigen Primärschlüssel hat'],
    erkl: 'schueler_name hängt nur von schueler_id ab (ebenso kurs_titel nur von kurs_id). 2NF verlangt: Jedes Nichtschlüsselattribut hängt vom ganzen Schlüssel ab. Abhilfe: schueler und kurs als eigene Relationen, Anmeldung behält nur die beiden Fremdschlüssel.', quelle: 'OPAL Abiturvorbereitung 7.1.1 b' },

  // ---------- Kapitel 134: C-Szenario Dateien und OOP ----------
  { id: 'k30_039', burg: 30, kap: 134, stufe: 1, art: 'luecke', frage: 'Eine CSV-Datei nutzt das Semikolon als Trennzeichen. Ergänzen Sie den Aufruf.',
    text: 'leser = csv.DictReader(datei, {}=";")', luecken: [['delimiter']], woerter: ['delimiter', 'sep', 'split', 'end'],
    erkl: 'Ohne delimiter erwartet das Modul csv Kommas – dann landet die ganze Zeile in einer einzigen Spalte.', quelle: 'OPAL Abiturvorbereitung 2.1, 2.4 CSV-Training' },
  { id: 'k30_040', burg: 30, kap: 134, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 4.1.5 (Getter und Setter)',
    gen: (z) => {
      const s = z.int(20, 80), a = z.int(5, 30), b = -z.int(5, 40), c = z.int(1, 15);
      return { frage: 'Was gibt das Programm aus?',
        code: `class Konto:\n    def __init__(self, stand):\n        self.__stand = stand\n\n    def einzahlen(self, betrag):\n        if betrag > 0:\n            self.__stand = self.__stand + betrag\n\n    def get_stand(self):\n        return self.__stand\n\nk = Konto(${s})\nk.einzahlen(${a})\nk.einzahlen(${b})\nk.einzahlen(${c})\nprint(k.get_stand())`,
        antworten: [String(s + a + c)], erkl: `Die Methode prüft den Betrag: ${b} wird abgelehnt. ${s} + ${a} + ${c} = ${s + a + c}. Kapselung: Der Stand ändert sich nur über die Methode mit Prüfung.` };
    } },
  { id: 'k30_041', burg: 30, kap: 134, stufe: 1, art: 'wahl', frage: 'Was passiert bei der Zeile print(k.__stand) außerhalb der Klasse Konto (self.__stand wird im Konstruktor gesetzt)?',
    optionen: ['Ein Fehler (AttributeError)', 'Der Kontostand wird ausgegeben', 'Es wird None ausgegeben', 'Es wird die Zahl 0 ausgegeben'],
    erkl: 'Das private Attribut ist von außen unter diesem Namen nicht erreichbar. Python benennt __stand intern um. Von außen liest man den Wert über den Getter get_stand().', quelle: 'OPAL Abiturvorbereitung 4.1.4 a, 4.1.5' },
  { id: 'k30_042', burg: 30, kap: 134, stufe: 3, art: 'eingabe', frage: 'Was gibt das Programm aus?',
    code: 'def verdopple(liste):\n    for i in range(len(liste)):\n        liste[i] = liste[i] * 2\n    liste = [0]\n\nw = [1, 2, 3]\nverdopple(w)\nprint(w)',
    antworten: ['[2, 4, 6]'], erkl: 'liste zeigt zuerst auf dieselbe Liste wie w – die Änderungen an den Einträgen sieht man auch in w. liste = [0] lässt nur den lokalen Namen auf eine neue Liste zeigen, w bleibt [2, 4, 6].', quelle: 'OPAL Abiturvorbereitung 2.1.1 c' },
  { id: 'k30_043', burg: 30, kap: 134, stufe: 2, art: 'eingabe', frage: 'Was gibt das Programm aus?',
    code: 'kasse = 100\n\ndef verkaufen(preis):\n    global kasse\n    kasse = kasse + preis\n\ndef zeigen(preis):\n    kasse = preis * 2\n    return kasse\n\nverkaufen(30)\nprint(zeigen(5), kasse)',
    antworten: ['10 130'], erkl: 'verkaufen ändert dank global die globale kasse auf 130. In zeigen ist kasse eine lokale Variable (10) – die globale bleibt 130.', quelle: 'OPAL Abiturvorbereitung 2.1.6' },
  { id: 'k30_044', burg: 30, kap: 134, stufe: 1, art: 'zuordnen', frage: 'Ordne jedem Merkmal das Gütekriterium für Programme zu.',
    paare: [['aussagekräftige Namen für Variablen und Funktionen', 'Verständlichkeit'], ['Kommentare und saubere Einrückung', 'Lesbarkeit'], ['Aufteilung in Funktionen und Methoden', 'Strukturierung'], ['verständliche Eingabeaufforderung, Prüfung falscher Eingaben', 'nutzerfreundliche Bedienbarkeit']],
    erkl: 'In Teil B und C gibt es eigene BE für die Gütekriterien – „Achte auf die Gütekriterien“ steht fast in jeder Programmieraufgabe.', quelle: 'OPAL Abiturvorbereitung 2.1, 6.1.3 c' },
  { id: 'k30_045', burg: 30, kap: 134, stufe: 3, art: 'wahl', frage: 'Eine Praktikantin schlägt vor, die Klasse Spielraum von der Klasse Buchung erben zu lassen: „Dann hat der Raum gleich alle Methoden der Buchungen, und wir sparen Code.“ Nehmen Sie Stellung.',
    optionen: ['Unpassend: Ein Raum ist keine Buchung', 'Gute Idee, Vererbung spart in jedem Fall Code', 'Unpassend, weil Python gar keine Vererbung kennt', 'Gute Idee, solange Buchung nur private Attribute hat'],
    erkl: 'Die ist-ein-Beziehung gilt nicht. Ein Raum hat Buchungen – eine Assoziation (Aggregation) mit Multiplizität 1 zu 0..*. Vererbung nur bei „ist ein“ (Eisturm ist ein Turm). Bei „hat ein“ hält ein Objekt Verweise auf andere Objekte.', quelle: 'OPAL Abiturvorbereitung 4.1.1 e' },
  { id: 'k30_046', burg: 30, kap: 134, stufe: 2, art: 'eingabe', zahl: true, frage: 'Was gibt das Programm aus?',
    code: 'class Kurs:\n    def __init__(self, preis):\n        self.preis = preis\n    def gebuehr(self):\n        return self.preis\n\nclass Einzel(Kurs):\n    def gebuehr(self):\n        return self.preis * 2\n\nclass Ensemble(Kurs):\n    def gebuehr(self):\n        return 25\n\nkurse = [Kurs(30), Einzel(30), Ensemble(30)]\nsumme = 0\nfor k in kurse:\n    summe = summe + k.gebuehr()\nprint(summe)',
    antworten: ['115'], erkl: 'Polymorphie: Die Schleife ruft immer gebuehr() auf, jedes Objekt nutzt die Methode seiner eigenen Klasse: 30 + 60 + 25 = 115.', quelle: 'OPAL Abiturvorbereitung 4.1.3 c, 4.1.4 c' },
  { id: 'k30_047', burg: 30, kap: 134, stufe: 2, art: 'wahl', frage: 'Welche Einordnung in die Hierarchie der Programmierparadigmen ist richtig?',
    optionen: ['Prolog gehört zur deklarativen Programmierung und dort zum logischen Paradigma', 'SQL ist imperativ, weil die Datenbank die Abfrage Schritt für Schritt abarbeitet', 'Objektorientierte Programmierung ist deklarativ, weil Objekte die Welt beschreiben', 'Funktionale Programmierung ist imperativ, weil Funktionen nacheinander aufgerufen werden'],
    erkl: 'Deklarativ = man beschreibt, WAS gilt (SQL, Prolog, funktional). Imperativ = man sagt, WIE es geht (prozedural, objektorientiert).', quelle: 'OPAL Abiturvorbereitung 4.1.7 b' },
  { id: 'k30_048', burg: 30, kap: 134, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 2.1.3 h, 2.1.4 a',
    gen: (z) => {
      const v = z.wahl([20, 30, 50]), m = z.wahl([24, 48, 96]);
      return { frage: `${v} Bienenvölker werden ${m}-mal am Tag gewogen, jede Messung ist eine Zeile der CSV-Datei. Wie viele Zeilen entstehen in einem Jahr mit 365 Tagen?`, antworten: [String(v * m * 365)],
        erkl: `${v} · ${m} · 365 = ${v * m * 365}. Wer die Datei für jedes Volk neu durchläuft, liest sie ${v}-mal – besser einmal einlesen und in ein Dictionary je Volk einsortieren.` };
    } },

  // ---------- Kapitel 135: Netze und Sicherheit ----------
  { id: 'k30_049', burg: 30, kap: 135, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 6.2.1 d/e',
    gen: (z) => {
      const [p, q, e] = z.wahl([[5, 11, 3], [7, 11, 7], [5, 13, 5], [7, 13, 5], [5, 13, 7], [11, 13, 7]]), phi = (p - 1) * (q - 1);
      let d = 1;
      while ((e * d) % phi !== 1) d++;
      return { frage: `RSA mit p = ${p}, q = ${q} und e = ${e}. Ermitteln Sie den privaten Exponenten d (kleinstes positives d mit e · d mod φ(n) = 1).`, antworten: [String(d)],
        erkl: `φ(n) = (${p} − 1) · (${q} − 1) = ${phi}. ${e} · ${d} = ${e * d} = ${(e * d - 1) / phi} · ${phi} + 1, also d = ${d}.` };
    } },
  { id: 'k30_050', burg: 30, kap: 135, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 6.2.1 f (modulare Multiplikation)',
    gen: (z) => {
      const [n, e] = z.wahl([[55, 3], [77, 7], [65, 5], [91, 5]]), m = z.int(2, 12);
      let c = 1;
      const schritte = [];
      for (let i = 0; i < e; i++) { c = (c * m) % n; schritte.push(c); }
      return { frage: `Verschlüsseln Sie m = ${m} mit dem öffentlichen Schlüssel (e, n) = (${e}, ${n}): c = mᵉ mod n.`, antworten: [String(c)],
        erkl: `Schrittweise multiplizieren und nach jedem Schritt mod ${n} rechnen: ${schritte.join(' → ')}. Also c = ${c}.` };
    } },
  { id: 'k30_051', burg: 30, kap: 135, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 6.2.1 a',
    gen: (z) => {
      const [p, q] = z.wahl([[5, 13], [7, 13], [5, 11], [7, 11], [11, 13], [7, 19]]), phi = (p - 1) * (q - 1), ggt = (a, b) => (b ? ggt(b, a % b) : a);
      let e = 2;
      while (ggt(e, phi) !== 1) e++;
      return { frage: `Für einen RSA-Schlüssel werden p = ${p} und q = ${q} gewählt. Welches ist der kleinste zulässige öffentliche Exponent e > 1?`, antworten: [String(e)],
        erkl: `φ(n) = ${p - 1} · ${q - 1} = ${phi}. e muss teilerfremd zu ${phi} sein; alle kleineren Zahlen ab 2 haben einen gemeinsamen Teiler mit ${phi}. Also e = ${e}.` };
    } },
  { id: 'k30_052', burg: 30, kap: 135, stufe: 1, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 6.2.5 b',
    gen: (z) => {
      const m = z.int(0, 255), k = z.int(0, 255), b = (x) => x.toString(2).padStart(8, '0'), c = b(m ^ k);
      return { frage: `One-Time-Pad mit XOR: Verschlüsseln Sie m = ${b(m)} mit dem Schlüssel k = ${b(k)}.`, antworten: [c, `${c.slice(0, 4)} ${c.slice(4)}`],
        erkl: `Bitweise: gleiche Bits → 0, verschiedene → 1. c = ${c}. Mit c ⊕ k erhält man wieder m.` };
    } },
  { id: 'k30_053', burg: 30, kap: 135, stufe: 1, art: 'wahl', frage: 'Welches Vorgehen verletzt eine Bedingung des One-Time-Pads?',
    optionen: ['Derselbe Schlüsselblock wird für zwei kurze Nachrichten verwendet', 'Der Schlüssel wird durch Würfeln erzeugt', 'Der Schlüssel wird vorab persönlich auf einem USB-Stick übergeben', 'Der Schlüssel ist länger als die Nachricht, der Rest wird danach vernichtet'],
    erkl: 'Bedingungen: echt zufällig, mindestens so lang wie die Nachricht, geheim, nur einmal verwendet. Bei Wiederverwendung gilt c₁ ⊕ c₂ = m₁ ⊕ m₂ – der Schlüssel fällt heraus.', quelle: 'OPAL Abiturvorbereitung 6.2.1 b, 6.2.5 c' },
  { id: 'k30_054', burg: 30, kap: 135, stufe: 3, art: 'wahl', frage: 'Zwei Brieffreunde schlagen vor: „Als Schlüssel für das One-Time-Pad nehmen wir den Text unseres Lieblingsbuchs ab Seite 1. Der ist lang genug, und wir haben beide das Buch.“ Beurteilen Sie den Vorschlag.',
    optionen: ['Unsicher: Buchtext ist nicht zufällig', 'Sicher, weil der Schlüssel lang genug ist', 'Sicher, solange niemand sonst das Buch kauft', 'Unsicher, nur weil ein Buch zu kurz ist'],
    erkl: 'Buchtext hat häufige Buchstaben und ganze Wörter, und wer das Buch errät, hat den ganzen Schlüssel – die Bedingung „echt zufällig“ ist verletzt. Länge allein reicht nicht. Die perfekte Sicherheit beruht darauf, dass jeder Schlüssel gleich wahrscheinlich ist.', quelle: 'OPAL Abiturvorbereitung 6.2.5 d' },
  { id: 'k30_055', burg: 30, kap: 135, stufe: 1, art: 'wahl', frage: 'Welche Aussage ist richtig?',
    optionen: ['Bei einem symmetrischen Verfahren muss der gemeinsame Schlüssel vorher auf sicherem Weg ausgetauscht werden', 'Asymmetrische Verfahren sind schneller, deshalb verschlüsselt man große Dateien direkt mit RSA', 'Bei einem asymmetrischen Verfahren muss auch der öffentliche Schlüssel geheim bleiben', 'AES mit 128 Bit ist unsicherer als RSA mit 1024 Bit, weil der Schlüssel kürzer ist'],
    erkl: 'Das Schlüsselaustauschproblem löst das hybride Verfahren: symmetrisch schnell verschlüsseln, nur den Sitzungsschlüssel asymmetrisch.', quelle: 'OPAL Abiturvorbereitung 6.2.4 a' },
  { id: 'k30_056', burg: 30, kap: 135, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 6.2.4 b',
    gen: (z) => { const n = z.int(5, 30); return { frage: `${n} Personen wollen paarweise vertraulich mit einem symmetrischen Verfahren schreiben. Wie viele geheime Schlüssel werden insgesamt gebraucht?`, antworten: [String((n * (n - 1)) / 2)], erkl: `Jedes Paar braucht einen eigenen Schlüssel: ${n} · ${n - 1} / 2 = ${(n * (n - 1)) / 2}. Asymmetrisch genügt je Person ein Schlüsselpaar: ${2 * n} Schlüssel.` }; } },
  { id: 'k30_057', burg: 30, kap: 135, stufe: 2, art: 'wahl', frage: 'Welche Aussage zur digitalen Signatur ist richtig?',
    optionen: ['Signiert wird mit dem privaten Schlüssel des Absenders', 'Signiert wird mit dem öffentlichen Schlüssel der Empfängerin', 'Geprüft wird mit dem privaten Schlüssel der Empfängerin', 'Die Signatur verschlüsselt das Dokument für die Empfängerin'],
    erkl: 'Der Absender signiert den Hashwert des Dokuments mit seinem privaten Schlüssel; jeder kann mit dem öffentlichen Schlüssel des Absenders prüfen. Eine Signatur sichert Integrität und Authentizität – aber keine Vertraulichkeit.', quelle: 'OPAL Abiturvorbereitung 6.2.9 a' },
  { id: 'k30_058', burg: 30, kap: 135, stufe: 3, art: 'wahl', frage: 'Ein Auktionator sagt: „Unsere Gutachten sind digital signiert. Damit kann sie unterwegs auch niemand lesen.“ Nehmen Sie Stellung.',
    optionen: ['Falsch: Eine Signatur sichert nur Echtheit und Unverändertheit', 'Richtig, eine Signatur verschlüsselt das Gutachten zugleich', 'Richtig, weil der private Schlüssel des Absenders geheim ist', 'Falsch, weil signierte Dokumente nicht übertragen werden dürfen'],
    erkl: 'Lesen kann das Gutachten jeder – für Vertraulichkeit muss man zusätzlich verschlüsseln, z. B. hybrid. Schutzziele auseinanderhalten: Vertraulichkeit (Verschlüsselung), Integrität und Authentizität (Signatur, Hash), Verfügbarkeit (Sicherung, Redundanz).', quelle: 'OPAL Abiturvorbereitung 6.2.9 e' },
  { id: 'k30_059', burg: 30, kap: 135, stufe: 1, art: 'mehr', frage: 'Kreuzen Sie alle Anmeldeverfahren an, die eine echte Zwei-Faktor-Authentifizierung sind.',
    optionen: ['Passwort und Code aus einer Authenticator-App', 'Passwort und Antwort auf eine Sicherheitsfrage', 'zwei verschiedene Passwörter', 'Bankkarte und PIN', 'Benutzername und Passwort', 'Fingerabdruck und PIN'], richtig: [0, 3, 5],
    erkl: 'Zwei Faktoren aus verschiedenen Kategorien: Wissen (Passwort, PIN), Besitz (Handy mit App, Karte), Sein (Fingerabdruck). Sicherheitsfrage und zweites Passwort sind beides Wissen.', quelle: 'OPAL Abiturvorbereitung 6.2.10 b' },
  { id: 'k30_060', burg: 30, kap: 135, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 6.1.4 a',
    gen: (z) => { const p = z.int(24, 30); return { frage: `Ein Netz hat die Präfixlänge /${p}. Wie viele Geräte (Router mitgezählt) können darin eine Adresse bekommen?`, antworten: [String(2 ** (32 - p) - 2)], erkl: `${32 - p} Hostbits: 2^${32 - p} − 2 = ${2 ** (32 - p) - 2}. Netz- und Broadcast-Adresse sind reserviert.` }; } },

  // ---------- Ergänzungen 2026-11-13: Fehler finden (Abi-Operator „Fehler finden und korrigieren“) ----------
  { id: 'k30_061', burg: 30, kap: 131, stufe: 2, art: 'zeile', frage: 'Die binäre Suche hängt bei manchen Werten in einer Endlosschleife. Tippe die fehlerhafte Zeile an.',
    code: 'def binaer(liste, x):\n    links = 0\n    rechts = len(liste) - 1\n    while links <= rechts:\n        mitte = (links + rechts) // 2\n        if liste[mitte] == x:\n            return mitte\n        elif liste[mitte] < x:\n            links = mitte\n        else:\n            rechts = mitte - 1\n    return -1',
    fehler: [9], erkl: 'Mit links = mitte wird der Suchbereich nicht immer kleiner (z. B. links = 3, rechts = 4: mitte bleibt 3). Richtig: links = mitte + 1.', quelle: 'OPAL Abiturvorbereitung 2.2.5' },
  { id: 'k30_062', burg: 30, kap: 133, stufe: 2, art: 'zeile', frage: 'Gesucht sind alle Kurse (kurs_id) mit mindestens 3 Belegungen. Tippe die fehlerhafte Zeile an.',
    code: 'SELECT kurs_id, COUNT(*)\nFROM belegung\nWHERE COUNT(*) >= 3\nGROUP BY kurs_id;',
    fehler: [3], erkl: 'Bedingungen an Gruppen stehen in HAVING nach GROUP BY: … GROUP BY kurs_id HAVING COUNT(*) >= 3. WHERE filtert einzelne Zeilen und kennt noch keine Gruppen.', quelle: 'OPAL Abiturvorbereitung 7.1.4' },
  { id: 'k30_063', burg: 30, kap: 132, stufe: 2, art: 'zeile', frage: 'Grammatik S → xSy | z. Tippe den ersten falschen Ableitungsschritt an.',
    code: 'S\n⇒ xSy\n⇒ xxSy\n⇒ xxzy',
    fehler: [3], erkl: 'S → xSy ersetzt S durch xSy: xSy ⇒ x(xSy)y = xxSyy. Jede Anwendung setzt links ein x UND rechts ein y.', quelle: 'OPAL Abiturvorbereitung 5.1.1 e' },
  { id: 'k30_064', burg: 30, kap: 135, stufe: 2, art: 'zeile', frage: 'RSA mit p = 5, q = 11 und e = 3. Tippe den fehlerhaften Schritt an.',
    code: 'n = p · q = 55\nφ(n) = (p − 1) · (q − 1) = 40\nd mit 3 · d mod 40 = 1: d = 13\nöffentlicher Schlüssel (3, 55), privater (13, 55)',
    fehler: [3], erkl: '3 · 13 = 39 ≡ 39 (mod 40), nicht 1. Richtig ist d = 27: 3 · 27 = 81 = 2 · 40 + 1.', quelle: 'OPAL Abiturvorbereitung 6.2.1' },
  { id: 'k30_065', burg: 30, kap: 134, stufe: 2, art: 'zeile', frage: 'Die Unterklasse soll den Preis von der Oberklasse übernehmen. Beim Aufruf von e.gebuehr() gibt es einen AttributeError. Tippe die fehlerhafte Zeile an.',
    code: 'class Kurs:\n    def __init__(self, preis):\n        self.preis = preis\n\nclass Einzel(Kurs):\n    def __init__(self, preis, lehrkraft):\n        self.lehrkraft = lehrkraft\n    def gebuehr(self):\n        return self.preis * 2',
    fehler: [7], erkl: 'Der Konstruktor der Unterklasse ruft den der Oberklasse nicht auf – self.preis entsteht nie. Vor Zeile 7 gehört super().__init__(preis).', quelle: 'OPAL Abiturvorbereitung 4.1.3' },
  { id: 'k30_066', burg: 30, kap: 132, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL Abiturvorbereitung 5.1.1 a',
    bild: () => svgAutomat({ zustaende: ['q0', 'q1', 'q2', 'q3', 'q4'], start: 'q0', ende: ['q3'], delta: { q0: { k: 'q1', l: 'q4' }, q1: { k: 'q1', l: 'q2' }, q2: { k: 'q1', l: 'q3' }, q3: { k: 'q1', l: 'q3' }, q4: { k: 'q4', l: 'q4' } } }, { fang: 'q4' }),
    gen: (z) => {
      const d = { q0: { k: 'q1', l: 'q4' }, q1: { k: 'q1', l: 'q2' }, q2: { k: 'q1', l: 'q3' }, q3: { k: 'q1', l: 'q3' }, q4: { k: 'q4', l: 'q4' } };
      let w = 'k';
      for (let i = z.int(3, 5); i > 0; i--) w += z.wahl(['k', 'l']);
      let s = 'q0';
      const weg = [s];
      for (const c of w) { s = d[s][c]; weg.push(s); }
      return { frage: `Klopfzeichen-Automat: In welchem Zustand ist er nach dem Wort ${w}?`, antworten: [s], erkl: `Zustandsfolge: ${weg.join(' → ')}. ${s === 'q3' ? 'Endzustand – akzeptiert.' : 'Kein Endzustand – abgelehnt.'}` };
    } },

  // ---------- Ergänzungen 2026-11-14: weitere Fehler-finden-Aufgaben (Prüfungssaal ja2, jb4, je1, jf1) ----------
  { id: 'k30_067', burg: 30, kap: 130, stufe: 1, art: 'zeile', frage: 'Ermittelt wird die 8-Bit-Zweierkomplementdarstellung von −23. Tippe den fehlerhaften Schritt an.',
    code: '23 als 8-Bit-Dualzahl: 00010111\nalle Bits umkehren: 11101000\n1 addieren: 11101010',
    fehler: [3], erkl: '11101000 + 1 = 11101001. Probe: 11101001 + 00010111 = 1 0000 0000 – der Übertrag fällt weg, die Summe ist 0.', quelle: 'OPAL Abiturvorbereitung Teil A (Zahlsysteme), Prüfungssaal ja2' },
  { id: 'k30_068', burg: 30, kap: 131, stufe: 2, art: 'zeile', frage: 'verteilen soll Zahlen von 0 bis 99 auf zehn Eimer verteilen: Eimer 4 bekommt 40 bis 49 usw. Tippe die fehlerhafte Zeile an.',
    code: 'def verteilen(liste):\n    eimer = []\n    for i in range(10):\n        eimer.append([])\n    for zahl in liste:\n        eimer[zahl % 10].append(zahl)\n    return eimer',
    fehler: [6], erkl: 'zahl % 10 ist die Einerstelle – 42 landete in Eimer 2. Die Eimernummer ist die Zehnerstelle: eimer[zahl // 10].', quelle: 'OPAL Abiturvorbereitung 2.2 (Bucketsort), Prüfungssaal jb4' },
  { id: 'k30_069', burg: 30, kap: 134, stufe: 2, art: 'zeile', frage: "Die Datei zaehlung.csv beginnt mit der Kopfzeile datum;station;anzahl. Das Programm bricht mit KeyError: 'anzahl' ab. Tippe die fehlerhafte Zeile an.",
    code: "import csv\n\ndef einlesen(pfad):\n    daten = []\n    with open(pfad, newline='', encoding='utf-8') as datei:\n        for zeile in csv.DictReader(datei, delimiter=','):\n            zeile['anzahl'] = int(zeile['anzahl'])\n            daten.append(zeile)\n    return daten",
    fehler: [6], erkl: "Die Datei trennt mit Semikolon. Mit delimiter=',' wird die ganze Kopfzeile ein einziger Schlüssel „datum;station;anzahl“ – den Schlüssel 'anzahl' gibt es nicht. Richtig: delimiter=';'.", quelle: 'OPAL Abiturvorbereitung 2.1 (CSV), Prüfungssaal je1' },
  { id: 'k30_070', burg: 30, kap: 135, stufe: 1, art: 'zeile', frage: 'Ermittelt werden die Netzdaten von 192.168.10.77/26. Tippe den fehlerhaften Schritt an.',
    code: '/26 → Maske 255.255.255.192\n77 AND 192 = 64 → Netzadresse 192.168.10.64\nBlockgröße 2⁶ = 64 → Broadcast 192.168.10.127\nHostadressen: 2⁶ = 64',
    fehler: [4], erkl: 'Netz- und Broadcast-Adresse bekommt kein Rechner: 2⁶ − 2 = 62 Hostadressen.', quelle: 'OPAL Abiturvorbereitung 6.1.4 a, Prüfungssaal jf1' },
);
