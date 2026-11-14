'use strict';
// 🗝️ Kerker-Fragen Burg 8 – Kapitel 9 Auffrischung, 4 while, 10 Zählen mit while, 6 if, 142 Belegungstabelle, 7 if/else, 8 elif
// Quellen: OPAL INFO_SEK1 Informatik Klasse 8 (lb1_algorithmen: 01_algortihmus_defintion, 03_variablen, 04_schleifen,
//   05_verzweigung, 06_uebungen_kontrollstrukturen), Leistungskontrollen Kl. 8 LK1 Kontrollstrukturen und Variablen,
//   LK2 Eigenschaften, Schleifenarten, Algorithmen in der Gesellschaft; Stoffverteilungsplan svp_8 (SW 2–9);
//   Lehrplan Gymnasium Sachsen Informatik 2022 Kl. 8 LB 1 (Algorithmen: Algorithmusbegriff, Variablen, Wiederholung,
//   Verzweigung, Algorithmen in Lebenswelt und Gesellschaft).
// Sprachmittel wie in Burg 8: for, while, Variablen, +=, Vergleiche, if/else/elif; Bauer: can_move(), can_harvest(), is_hole(), is_weed().
KERKER_FRAGEN.push(
  // ============================== Kapitel 9: 🔄 Auffrischung (Grundstrukturen, for, Variablen, Algorithmusbegriff) ==============================
  { id: 'k8_001', burg: 8, kap: 9, stufe: 1, art: 'mehr', frage: 'Kreuze die drei algorithmischen Grundstrukturen an.',
    optionen: ['Sequenz', 'Wiederholung (Schleife)', 'Verzweigung', 'Variable', 'Methode', 'Pseudocode'], richtig: [0, 1, 2],
    erkl: 'Sequenz, Wiederholung und Verzweigung steuern den Ablauf eines Algorithmus. Variablen speichern Werte – sie sind keine Kontrollstruktur.', quelle: 'OPAL Kl. 8 lb1 06_uebungen_kontrollstrukturen · LK1 Aufgabe 1a' },
  { id: 'k8_002', burg: 8, kap: 9, stufe: 1, art: 'luecke', frage: 'Fülle die Lücke.',
    text: 'Sequenz, Wiederholung und Verzweigung heißen zusammen {}.', luecken: [['Kontrollstrukturen']], woerter: ['Kontrollstrukturen', 'Datentypen', 'Methoden', 'Variablen'],
    erkl: 'Die algorithmischen Grundstrukturen heißen auch Kontrollstrukturen – sie kontrollieren den Ablauf eines Algorithmus.', quelle: 'OPAL Kl. 8 LK1 Aufgabe 1b · lb1 04_schleifen' },
  { id: 'k8_003', burg: 8, kap: 9, stufe: 1, art: 'reihe', frage: 'Der Bauer soll 4 Rüben ernten und melden, wie viele es waren. Bring die Zeilen in die richtige Reihenfolge.',
    teile: ['ernte = 0', 'for i in range(4):', '    forward()', '    harvest()', '    ernte = ernte + 1', 'print(ernte)'],
    erkl: 'Die Variable bekommt vor der Schleife ihren ersten Wert (initialisieren). In der Schleife wird sie nach jedem Ernten erhöht, nach der Schleife einmal ausgegeben.', quelle: 'OPAL Kl. 8 lb1 06_uebungen_kontrollstrukturen (Schritte mit Variablen) · Spiel Burg 8 Kap. 9' },
  { id: 'k8_004', burg: 8, kap: 9, stufe: 2, art: 'zuordnen', frage: 'Ordne jeder Eigenschaft eines Algorithmus die passende Erklärung zu.',
    paare: [['Eindeutigkeit', 'Jeder Schritt ist klar festgelegt.'], ['Ausführbarkeit', 'Jeder Schritt kann wirklich ausgeführt werden.'], ['Endlichkeit', 'Er endet nach endlich vielen Schritten.']],
    erkl: 'Eindeutig, ausführbar und endlich muss jeder Algorithmus sein.', quelle: 'OPAL Kl. 8 LK2 Aufgabe 1 (Musterlösung)' },
  { id: 'k8_005', burg: 8, kap: 9, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 9 (Auffrischung for und Variablen)',
    gen: (z) => {
      const a = z.int(2, 5), b = z.int(2, 5);
      return { frage: 'Was gibt das Programm aus?', code: `n = 0\nfor i in range(${a}):\n    for j in range(${b}):\n        n = n + 1\nprint(n)`, antworten: [String(a * b)],
        erkl: `Die innere Schleife zählt in jeder der ${a} Runden ${b}-mal: ${a} · ${b} = ${a * b}.` };
    } },
  { id: 'k8_006', burg: 8, kap: 9, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 8 lb1 03_variablen (Spielstand)',
    gen: (z) => {
      const s = z.int(1, 9), a = z.int(2, 5), d = z.int(2, 4);
      return { frage: 'Was gibt das Programm aus?', code: `summe = ${s}\nfor i in range(${a}):\n    summe = summe + ${d}\nprint(summe)`, antworten: [String(s + a * d)],
        erkl: `Start ${s}, ${a}-mal + ${d}: ${s} + ${a * d} = ${s + a * d}.` };
    } },
  { id: 'k8_007', burg: 8, kap: 9, stufe: 3, art: 'wahl', frage: 'Smarthome-Regel: „Wenn es nach 20 Uhr ist und der Bewegungsmelder im Flur etwas erkennt, schalte die Flurlampe für 2 Minuten ein.“ Ist das ein Algorithmus?',
    optionen: ['Ja – eindeutig, ausführbar, nach 2 Minuten zu Ende.', 'Nein – eine Lampe kann ja nicht selbst denken.', 'Nein – „nach 20 Uhr“ ist gar nicht eindeutig.', 'Nein – Algorithmen gibt es nur in echten Computern.'],
    erkl: 'Bedingung (Uhrzeit, Bewegung) und Aktion (Lampe 2 Minuten an) sind genau festgelegt und machbar, und der Ablauf endet.', quelle: 'OPAL Kl. 8 LK2 Aufgabe 2a' },
  { id: 'k8_008', burg: 8, kap: 9, stufe: 2, art: 'wahl', frage: 'Eine Videoplattform schlägt dir vor allem Videos vor, die zu deinen bisherigen passen. Das Risiko dabei nennt man „Filterblase“. Was ist damit gemeint?',
    optionen: ['Man sieht fast nur noch Videos zu denselben Themen.', 'Die Videos werden mit der Zeit immer kürzer.', 'Der Algorithmus löscht nach und nach deine Likes.', 'Man kann keine Videos mehr selbst suchen.'],
    erkl: 'Eingabe sind z. B. angesehene Videos, Likes und Suchbegriffe; ausgegeben wird eine Liste ähnlicher Videos. Dadurch kann eine Filterblase entstehen, und man schaut länger.', quelle: 'OPAL Kl. 8 LK1 Aufgabe 5 · lb1 01_algortihmus_defintion · svp_8 SW 3' },

  // ============================== Kapitel 4: 🚧 Die Schleife while ==============================
  { id: 'k8_009', burg: 8, kap: 4, stufe: 1, art: 'wahl', frage: 'Was ist der Unterschied zwischen einer Zählschleife und einer bedingten Schleife?',
    optionen: ['Bei der Zählschleife steht die Anzahl vorher fest; die bedingte läuft, solange eine Bedingung wahr ist.', 'Bei der bedingten Schleife steht die Anzahl vorher fest; die Zählschleife läuft, solange eine Bedingung wahr ist.', 'Die bedingte Schleife läuft immer genau einmal.', 'Es gibt keinen Unterschied, nur andere Namen.'],
    erkl: 'for i in range(5) läuft genau 5-mal. while can_move(): läuft, solange die Bedingung wahr ist – wie oft, weiß man vorher nicht.', quelle: 'OPAL Kl. 8 LK1 Aufgabe 2 (Musterlösung) · lb1 04_schleifen' },
  { id: 'k8_010', burg: 8, kap: 4, stufe: 1, art: 'luecke', frage: 'Eine Bedingung hat nur zwei mögliche Ergebnisse. Fülle die Lücken.',
    text: 'Die Bedingung zahl < 14 ist für zahl = 10 {} und für zahl = 16 {}.', luecken: [['wahr'], ['falsch']], woerter: ['wahr', 'falsch', 'vielleicht', 'gleich'],
    erkl: '10 < 14 stimmt → wahr (True). 16 < 14 stimmt nicht → falsch (False).', quelle: 'OPAL Kl. 8 lb1 04_schleifen (Bedingung)' },
  { id: 'k8_011', burg: 8, kap: 4, stufe: 1, art: 'wahl', frage: 'Was bedeutet die Zeile while can_move(): ?',
    optionen: ['Solange vor dem Bauern frei ist, wiederhole …', 'Wenn vor dem Bauern frei ist, mache einmal …', 'Geh bis zum Rand und dann noch einen Schritt.', 'Wiederhole genau so oft, wie Felder auf dem Acker sind.'],
    erkl: 'while heißt „solange“. Vor jedem Durchlauf wird can_move() neu gefragt.', quelle: 'Spiel Burg 8 Kap. 4 (Merke „Die Schleife while“)' },
  { id: 'k8_012', burg: 8, kap: 4, stufe: 1, art: 'wahl', frage: 'Wann endet die Schleife while can_move(): ?',
    optionen: ['wenn can_move() falsch ist', 'wenn can_move() wahr ist', 'nach genau 10 Durchläufen', 'sobald eine Rübe kommt'],
    erkl: 'Die Abbruchbedingung ist erreicht, wenn vor dem Bauern nicht mehr frei ist (Zaun oder Rand) – dann geht es unter der Schleife weiter.', quelle: 'svp_8 SW 6 (Abbruchbedingung) · Spiel Burg 8 Kap. 4' },
  { id: 'k8_013', burg: 8, kap: 4, stufe: 1, art: 'wahl', frage: 'Wann nimmst du while statt for?',
    optionen: ['wenn man vorher nicht weiß, wie oft wiederholt werden muss', 'wenn man genau weiß, wie oft wiederholt werden muss', 'immer, denn while ist in Python schneller und kürzer als for', 'nur wenn der Bauer ernten soll'],
    erkl: 'Die Reihe ist jeden Tag anders lang? Dann hilft nur while – for braucht eine feste Zahl.', quelle: 'Spiel Burg 8 Kap. 4 (Bis zum Zaun) · OPAL Kl. 8 lb1 06 Aufgabe 3' },
  { id: 'k8_014', burg: 8, kap: 4, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 4 (Bis zum Zaun)',
    gen: (z) => {
      const n = z.int(2, 8);
      return { frage: `Vor dem Bauern liegen ${n} Rüben in einer Reihe, dahinter steht der Zaun. Wie oft wird harvest() ausgeführt?`,
        bild: () => '<div style="font-size:26px;text-align:center">🧑‍🌾' + '🥕'.repeat(n) + '🚧</div>',
        code: 'while can_move():\n    forward()\n    harvest()', antworten: [String(n)],
        erkl: `Bei jeder Rübe ist vorher frei, also ${n} Durchläufe. Danach steht der Zaun vor dem Bauern – can_move() ist falsch.` };
    } },
  { id: 'k8_015', burg: 8, kap: 4, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 4 · OPAL Kl. 8 LK2 Aufgabe 3 (kopfgesteuert)',
    gen: (z) => {
      const n = z.int(2, 8);
      return { frage: `Vor dem Bauern liegen ${n} freie Felder, dahinter steht der Zaun. Wie oft wird die Bedingung can_move() geprüft?`,
        code: 'while can_move():\n    forward()', antworten: [String(n + 1)],
        erkl: `${n}-mal ist die Antwort „wahr“ (Schritt), beim ${n + 1}. Mal „falsch“ – erst dann endet die Schleife. Also ${n + 1} Prüfungen.` };
    } },
  { id: 'k8_016', burg: 8, kap: 4, stufe: 2, art: 'wahl', frage: 'Vor dem Bauern liegen Rüben. Was passiert bei diesem Programm?',
    code: 'while can_move():\n    harvest()',
    optionen: ['Endlosschleife: Der Bauer bleibt einfach stehen.', 'Er erntet nacheinander alle Rüben der Reihe.', 'Er erntet eine Rübe und hört dann auf.', 'Er läuft bis zum Zaun, ohne unterwegs etwas zu ernten.'],
    erkl: 'In der Schleife fehlt forward(). Der Bauer bleibt stehen, vor ihm bleibt frei – die Abbruchbedingung wird nie erreicht.', quelle: 'svp_8 SW 6 (Endlosschleife) · OPAL Kl. 8 LK1 Aufgabe 3b' },
  { id: 'k8_017', burg: 8, kap: 4, stufe: 2, art: 'zeile', frage: 'Der Bauer startet am linken Rand. Er soll bis zum Zaun ernten und dann zurück auf sein Startfeld gehen. Tippe die falsche Zeile an.',
    code: 'while can_move():\n    forward()\n    harvest()\nturn_right()\nwhile can_move():\n    forward()', fehler: [4],
    erkl: 'Zum Umdrehen braucht der Bauer zwei Drehungen (turn_right() zweimal). Mit nur einer schaut er nach unten und läuft in die falsche Richtung.', quelle: 'Spiel Burg 8 Kap. 4 (Hin und wieder heim)' },
  { id: 'k8_018', burg: 8, kap: 4, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 4 (Hin und wieder heim)',
    gen: (z) => {
      const n = z.int(3, 8);
      return { frage: `Der Bauer steht am linken Rand. Bis zum Zaun sind es ${n} Felder. Wie viele Schritte (forward) macht er insgesamt?`,
        code: 'while can_move():\n    forward()\n    harvest()\nturn_right()\nturn_right()\nwhile can_move():\n    forward()', antworten: [String(2 * n)],
        erkl: `Hin ${n} Schritte bis zum Zaun, dann umdrehen und ${n} Schritte zurück bis zum Rand: ${2 * n}.` };
    } },
  { id: 'k8_019', burg: 8, kap: 4, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 4 (Holen und flicken bis zum Rand)',
    gen: (z) => {
      const k = z.int(2, 5);
      return { frage: 'Vor dem Bauern liegen abwechselnd ein Ziegel und ein Loch, bis zum Rand. Der Korb ist leer. Wie viele Löcher sind am Ende geflickt?',
        bild: () => '<div style="font-size:26px;text-align:center">🧑‍🌾' + '🧱🕳️'.repeat(k) + '</div>',
        code: 'while can_move():\n    forward()\n    pick_up()\n    forward()\n    place()', antworten: [String(k)],
        erkl: `Jeder Durchlauf holt einen Ziegel und legt ihn ins nächste Loch. Es gibt ${k} Paare, also ${k} Durchläufe – danach ist der Rand erreicht.` };
    } },
  { id: 'k8_020', burg: 8, kap: 4, stufe: 2, art: 'reihe', frage: 'Eine Heizung: „Solange es kälter als 20 °C ist, bleibt die Heizung an. Jede Minute wird neu gemessen. Ist es warm genug, geht die Heizung aus und ein Häkchen erscheint.“ Das Programm steht hier als Pseudocode – in deutschen Wörtern statt in Python. Bring die Zeilen in die richtige Reihenfolge.',
    teile: ['solange Temperatur < 20', '    schalte Heizung ein', '    pausiere 1 Minute', 'schalte Heizung aus', 'zeige Häkchen'],
    erkl: 'Eine kopfgesteuerte Schleife: Die Bedingung steht oben. Heizen und Warten gehören in den Schleifenrumpf, Ausschalten und Häkchen kommen danach.', quelle: 'OPAL Kl. 8 LK2 Aufgabe 4 (Musterlösung)' },

  // ============================== Kapitel 10: 📏 Zählen mit while ==============================
  { id: 'k8_021', burg: 8, kap: 10, stufe: 1, art: 'wahl', frage: 'Was bedeutet schritte += 1 ?',
    optionen: ['dasselbe wie schritte = schritte + 1', 'schritte bekommt den Wert 1', 'schritte wird mit 1 verglichen (wahr oder falsch)', 'schritte wird verdoppelt'],
    erkl: '+= 1 ist die Kurzform: Der alte Wert wird gelesen, 1 dazugezählt und das Ergebnis wieder in schritte gespeichert.', quelle: 'Spiel Burg 8 Kap. 10 (Merke „Kurz und knapp: +=“)' },
  { id: 'k8_022', burg: 8, kap: 10, stufe: 1, art: 'luecke', frage: 'So zählt man richtig. Fülle die Lücken.',
    text: 'Die Zählvariable wird {} der Schleife auf 0 gesetzt, in der Schleife um 1 {} und {} der Schleife ausgegeben.',
    luecken: [['vor'], ['erhöht'], ['nach']], woerter: ['vor', 'erhöht', 'nach', 'in', 'verringert'],
    erkl: 'schritte = 0 steht vor der Schleife, schritte += 1 eingerückt darin, print(schritte) ohne Einrückung danach.', quelle: 'Spiel Burg 8 Kap. 10 · OPAL Kl. 8 lb1 03_variablen (Klickzähler)' },
  { id: 'k8_023', burg: 8, kap: 10, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 10 (+=)',
    gen: (z) => {
      const s = z.int(5, 20), a = z.int(2, 9), b = z.int(2, 9);
      return { frage: 'Was gibt das Programm aus?', code: `gold = ${s}\ngold += ${a}\ngold += ${b}\nprint(gold)`, antworten: [String(s + a + b)],
        erkl: `${s} + ${a} + ${b} = ${s + a + b}. Jedes += zählt zum aktuellen Wert dazu.` };
    } },
  { id: 'k8_024', burg: 8, kap: 10, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 10 (Miss die Reihe)',
    gen: (z) => {
      const n = z.int(2, 9);
      return { frage: `Vor dem Bauern liegen ${n} freie Felder, dahinter der Zaun. Was gibt das Programm aus?`,
        code: 'schritte = 0\nwhile can_move():\n    forward()\n    schritte += 1\nprint(schritte)', antworten: [String(n)],
        erkl: `Bei jedem Schritt zählt schritte eins dazu – ${n} Schritte bis zum Zaun.` };
    } },
  { id: 'k8_025', burg: 8, kap: 10, stufe: 2, art: 'zeile', frage: 'Das Programm soll melden, wie viele Schritte es bis zum Zaun sind. Es meldet aber immer 1. Tippe die falsche Zeile an.',
    code: 'schritte = 0\nwhile can_move():\n    forward()\nschritte += 1\nprint(schritte)', fehler: [4],
    erkl: 'schritte += 1 ist nicht eingerückt – es gehört nicht zur Schleife und läuft nur einmal. Es muss unter forward() eingerückt stehen.', quelle: 'Spiel Burg 8 Kap. 10' },
  { id: 'k8_026', burg: 8, kap: 10, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 10 (Der Umfang)',
    gen: (z) => {
      const w = z.int(3, 7), h = z.int(2, 5);
      return { frage: `Der leere Acker ist ${w} Felder breit und ${h} Felder hoch. Der Bauer steht oben links und schaut nach Osten. Was gibt das Programm aus?`,
        code: 'schritte = 0\nfor i in range(4):\n    while can_move():\n        forward()\n        schritte += 1\n    turn_right()\nprint(schritte)',
        antworten: [String(2 * (w - 1) + 2 * (h - 1))],
        erkl: `Oben ${w - 1} Schritte, rechts ${h - 1}, unten ${w - 1}, links ${h - 1}: zusammen ${2 * (w - 1) + 2 * (h - 1)}. Das Startfeld selbst ist kein Schritt.` };
    } },
  { id: 'k8_027', burg: 8, kap: 10, stufe: 3, art: 'zeile', frage: 'Der leere Acker ist 4 Felder breit und 3 hoch, der Bauer steht oben links. Das Programm soll die Fläche (12) melden, meldet aber 9. Tippe die falsche Zeile an.',
    code: 'breite = 0\nwhile can_move():\n    forward()\n    breite += 1\nturn_right()\nhoehe = 1\nwhile can_move():\n    forward()\n    hoehe += 1\nprint(breite * hoehe)', fehler: [1],
    erkl: 'Das Startfeld zählt mit. Beim Gehen zählt man nur 3 Schritte, die Breite ist aber 4 – darum muss breite bei 1 starten, wie hoehe.', quelle: 'Spiel Burg 8 Kap. 10 (Die Fläche)' },
  { id: 'k8_028', burg: 8, kap: 10, stufe: 3, art: 'wahl', frage: 'Links vom Startfeld ist noch Platz. Der Bauer zählt auf dem Hinweg bis zum Zaun die Schritte in schritte. Dann dreht er sich zweimal um. Wo steht er nach for i in range(schritte): forward() ?',
    optionen: ['wieder auf seinem Startfeld', 'ein Feld vor dem Startfeld', 'am Zaun', 'am linken Rand des Ackers'],
    erkl: 'Er geht genau so viele Schritte zurück, wie er hingegangen ist. Die Variable gibt die Anzahl der Wiederholungen an. Das klappt auch, wenn links vom Start noch Platz ist.', quelle: 'Spiel Burg 8 Kap. 10 (Der Heimweg)' },
  { id: 'k8_029', burg: 8, kap: 10, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 10 (Zählen bis zum Zaun)',
    gen: (z) => {
      const n = z.int(3, 7);
      return { frage: `Vor dem Bauern liegen ${n} Rüben bis zum Zaun. Was gibt das Programm aus?`,
        code: 'ernte = 10\nwhile can_move():\n    forward()\n    harvest()\n    ernte += 1\nprint(ernte)', antworten: [String(10 + n)],
        erkl: `Achtung, ernte startet bei 10, nicht bei 0: 10 + ${n} = ${10 + n}.` };
    } },

  // ============================== Kapitel 6: ❓ Verzweigung if ==============================
  { id: 'k8_030', burg: 8, kap: 6, stufe: 1, art: 'wahl', frage: 'Was macht dieser Code?',
    code: 'if can_harvest():\n    harvest()',
    optionen: ['Der Bauer erntet nur, wenn er auf einer reifen Rübe steht.', 'Der Bauer erntet immer, auch auf leerer Erde und auf Setzlingen.', 'Der Bauer erntet, bis keine Rübe mehr da ist.', 'Der Bauer geht zur nächsten Rübe.'],
    erkl: 'Bei einer bedingten Anweisung läuft der eingerückte Block nur, wenn die Bedingung wahr ist – sonst passiert nichts.', quelle: 'Spiel Burg 8 Kap. 6 (Merke „Die Verzweigung if“)' },
  { id: 'k8_031', burg: 8, kap: 6, stufe: 1, art: 'luecke', frage: 'Fülle die Lücken.',
    text: 'Eine Verzweigung mit nur if heißt {}. Ist die Bedingung wahr, wird der Block ausgeführt, sonst passiert {}.',
    luecken: [['bedingte Anweisung'], ['nichts']], woerter: ['bedingte Anweisung', 'nichts', 'Zählschleife', 'etwas anderes', 'alles'],
    erkl: 'Bedingte Anweisung (einseitige Verzweigung): „Wenn die Bedingung wahr ist, dann mache …, sonst nichts.“', quelle: 'OPAL Kl. 8 lb1 05_verzweigung' },
  { id: 'k8_032', burg: 8, kap: 6, stufe: 1, art: 'zuordnen', frage: 'Ordne jedem Vergleichsoperator seine Bedeutung zu.',
    paare: [['==', 'gleich'], ['!=', 'ungleich'], ['<=', 'kleiner oder gleich'], ['>', 'größer als']],
    erkl: 'Ein einzelnes = ist eine Zuweisung, == ist ein Vergleich. != heißt „ist nicht gleich“.', quelle: 'svp_8 SW 7 (Bedingungen mit Vergleichsoperatoren)' },
  { id: 'k8_033', burg: 8, kap: 6, stufe: 2, art: 'mehr', frage: 'zahl hat den Wert 7. Kreuze alle Bedingungen an, die wahr sind.',
    optionen: ['zahl > 5', 'zahl == 7', 'zahl != 3', 'zahl < 7', 'zahl >= 8', 'zahl == 5'], richtig: [0, 1, 2],
    erkl: '7 > 5 ✓, 7 == 7 ✓, 7 ist ungleich 3 ✓. 7 < 7 ist falsch (gleich ist nicht kleiner), 7 >= 8 und 7 == 5 sind falsch.', quelle: 'OPAL Kl. 8 lb1 04_schleifen (Bedingung) · svp_8 SW 7' },
  { id: 'k8_034', burg: 8, kap: 6, stufe: 1, art: 'wahl', frage: 'Welche Zeile prüft, ob anzahl gleich 3 ist?',
    optionen: ['if anzahl == 3:', 'if anzahl = 3:', 'if anzahl equals 3:', 'anzahl == 3 if:'],
    erkl: 'Zum Vergleichen braucht Python ==. Mit einem einzelnen = würde man anzahl den Wert 3 zuweisen – das geht in einer Bedingung nicht.', quelle: 'svp_8 SW 7 · Spiel Burg 8 Kap. 6' },
  { id: 'k8_035', burg: 8, kap: 6, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 6 (Das bunte Beet)',
    gen: (z) => {
      const n = z.int(4, 7), reihe = Array.from({ length: n }, () => z.wahl(['r', 's']));
      if (!reihe.includes('s')) reihe[0] = 's';
      const r = reihe.filter((c) => c === 'r').length, bildText = reihe.map((c) => (c === 'r' ? '🥕' : '🌱')).join('');
      return { frage: `Die Reihe vor dem Bauern: ${bildText} (🥕 Rübe, 🌱 Setzling). Wie oft wird harvest() ausgeführt?`,
        code: `for i in range(${n}):\n    forward()\n    if can_harvest():\n        harvest()`, antworten: [String(r)],
        erkl: `can_harvest() ist nur auf einer Rübe wahr. Es gibt ${r} Rüben – auf den Setzlingen passiert nichts.` };
    } },
  { id: 'k8_036', burg: 8, kap: 6, stufe: 2, art: 'zeile', frage: 'Gezählt werden sollen nur die geernteten Rüben. Das Programm zählt aber jedes Feld. Tippe die falsche Zeile an.',
    code: 'ernte = 0\nfor i in range(6):\n    forward()\n    if can_harvest():\n        harvest()\n    ernte += 1\nprint(ernte)', fehler: [6],
    erkl: 'ernte += 1 steht nur so weit eingerückt wie forward() – es läuft in jeder Runde. Es gehört in den if-Block, gleich weit eingerückt wie harvest().', quelle: 'Spiel Burg 8 Kap. 6 (Zähl die bunte Reihe)' },
  { id: 'k8_037', burg: 8, kap: 6, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 6 (Nur in die Löcher)',
    gen: (z) => {
      const n = z.int(5, 8), weg = Array.from({ length: n }, () => z.wahl(['o', '.']));
      if (!weg.includes('o')) weg[1] = 'o';
      const l = weg.filter((c) => c === 'o').length, bildText = weg.map((c) => (c === 'o' ? '🕳️' : '🟫')).join('');
      return { frage: `Der Weg vor dem Bauern bis zum Zaun: ${bildText} (🕳️ Loch, 🟫 fester Boden). Im Korb sind 10 Ziegel. Wie viele Ziegel sind danach noch im Korb?`,
        code: 'while can_move():\n    forward()\n    if is_hole():\n        place()', antworten: [String(10 - l)],
        erkl: `place() läuft nur auf einem Loch. ${l} Löcher → ${l} Ziegel weg: 10 − ${l} = ${10 - l}.` };
    } },
  { id: 'k8_038', burg: 8, kap: 6, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 8 LK2 Aufgabe 5a (nur positive Zahlen addieren)',
    gen: (z) => {
      const g = z.int(5, 8), s = z.int(2, g - 2);
      let summe = 0; for (let k = s + 1; k <= g; k++) summe += k;
      return { frage: 'Was gibt das Programm aus?', code: `zahl = 0\nsumme = 0\nwhile zahl < ${g}:\n    zahl += 1\n    if zahl > ${s}:\n        summe += zahl\nprint(summe)`, antworten: [String(summe)],
        erkl: `zahl läuft von 1 bis ${g}. Addiert werden nur die Zahlen größer als ${s}: ${Array.from({ length: g - s }, (_, i) => s + 1 + i).join(' + ')} = ${summe}.` };
    } },

  // ============================== Kapitel 142: 🧾 Belegungstabelle ==============================
  { id: 'k8_039', burg: 8, kap: 142, stufe: 1, art: 'wahl', frage: 'Was schreibt man in eine Belegungstabelle?',
    optionen: ['nach jedem Schritt den Wert jeder Variable', 'alle Befehle, die es in Python gibt', 'nur die letzte Ausgabe des Programms', 'die Fehlermeldungen, die Python beim Ausführen zeigt'],
    erkl: 'Jede Spalte ist eine Variable, jede Zeile ein Schritt. So verfolgst du, was das Programm wirklich tut.', quelle: 'OPAL Kl. 8 lb1 04_schleifen (Variablenbelegungstabelle)' },
  { id: 'k8_040', burg: 8, kap: 142, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 8 LK1 Aufgabe 3 (Verdoppeln)',
    gen: (z) => {
      const g = z.int(10, 100); let n = 1; const w = [1];
      while (n < g) { n *= 2; w.push(n); }
      return { frage: 'Was gibt das Programm aus?', code: `n = 1\nwhile n < ${g}:\n    n = n * 2\nprint(n)`, antworten: [String(n)],
        erkl: `Belegung von n: ${w.join(', ')}. Erst bei ${n} ist n < ${g} falsch – darum wird ${n} ausgegeben.` };
    } },
  { id: 'k8_041', burg: 8, kap: 142, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'svp_8 SW 6 (Schleifen mit Belegungstabellen nachvollziehen)',
    gen: (z) => {
      const g = z.int(20, 200); let n = 1, k = 0; const w = [1];
      while (n < g) { n *= 3; k++; w.push(n); }
      return { frage: 'Was gibt das Programm aus?', code: `zahl = 1\nschritte = 0\nwhile zahl < ${g}:\n    zahl = zahl * 3\n    schritte += 1\nprint(schritte)`, antworten: [String(k)],
        erkl: `zahl: ${w.join(', ')}. Das sind ${k} Durchläufe – schritte zählt sie mit.` };
    } },
  { id: 'k8_042', burg: 8, kap: 142, stufe: 2, art: 'eingabe', zahl: true, frage: 'Was gibt das Programm aus?',
    code: 'zahl = 50\nwhile zahl < 20:\n    zahl = zahl * 2\nprint(zahl)', antworten: ['50'],
    erkl: 'while ist kopfgesteuert: Die Bedingung wird VOR dem ersten Durchlauf geprüft. 50 < 20 ist falsch – der Rumpf läuft kein einziges Mal.', quelle: 'OPAL Kl. 8 LK2 Aufgabe 3a (kopfgesteuerte Schleife)' },
  { id: 'k8_043', burg: 8, kap: 142, stufe: 1, art: 'eingabe', zahl: true, frage: 'Eine fußgesteuerte Schleife prüft die Bedingung erst nach dem Durchlauf. Wie oft läuft ihr Rumpf mindestens?',
    antworten: ['1'],
    erkl: 'Weil erst am Ende (im Fuß) geprüft wird, läuft der Rumpf mindestens einmal. Eine kopfgesteuerte Schleife wie while kann auch 0-mal laufen.', quelle: 'OPAL Kl. 8 LK2 Aufgabe 3b' },
  { id: 'k8_044', burg: 8, kap: 142, stufe: 2, art: 'wahl', frage: 'Was passiert bei diesem Programm?',
    code: 'n = 1\nwhile n > 0:\n    n = n * 2\nprint(n)',
    optionen: ['Endlosschleife: n bleibt immer größer als 0.', 'Es gibt 2 aus – nach einem Durchlauf.', 'Es gibt 1 aus – die Schleife läuft nie.', 'Es gibt 0 aus – n wird irgendwann 0, dann endet die Schleife.'],
    erkl: 'print wird nie erreicht: n ist von Anfang an größer als 0 und wird immer größer. Die Bedingung wird nie falsch.', quelle: 'OPAL Kl. 8 LK1 Aufgabe 3b (Musterlösung)' },
  { id: 'k8_045', burg: 8, kap: 142, stufe: 2, art: 'zuordnen', frage: 'Verfolge die Variablen wie in einer Belegungstabelle. Welchen Wert haben sie?',
    code: 'a = 2\nb = 5\na = a + b\nb = a - 1\na = a * 2',
    paare: [['b nach Zeile 2', '5'], ['a nach Zeile 3', '7'], ['b nach Zeile 4', '6'], ['a nach Zeile 5', '14']],
    erkl: 'a = 2 + 5 = 7, dann b = 7 − 1 = 6, dann a = 7 · 2 = 14. Für jede Zeile gilt der neueste Wert.', quelle: 'OPAL Kl. 8 lb1 04_schleifen Aufgabe 2 (Variablenbelegungstabelle)' },
  { id: 'k8_046', burg: 8, kap: 142, stufe: 3, art: 'eingabe', frage: 'Was gibt das Programm aus?',
    code: 'a = 3\nb = 8\nhilf = a\na = b\nb = hilf\nprint(a, b)', antworten: ['8 3', '8, 3', '8,3'],
    erkl: 'hilf merkt sich die 3. Dann bekommt a die 8, und b bekommt die gemerkte 3. Die Werte sind getauscht. Ohne hilf wäre die 3 verloren.', quelle: 'OPAL Kl. 8 lb1 04_schleifen (Belegungstabelle)' },
  { id: 'k8_047', burg: 8, kap: 142, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 142 (Der Countdown) · OPAL Kl. 7 lb3 13_schleifen (Countdown)',
    gen: (z) => {
      const t = z.int(8, 20), d = z.int(2, 4); let x = t; const aus = [];
      while (x > 0) { aus.push(x); x -= d; }
      return { frage: 'Wie viele Zahlen gibt das Programm aus?', code: `zeit = ${t}\nwhile zeit > 0:\n    print(zeit)\n    zeit = zeit - ${d}`, antworten: [String(aus.length)],
        erkl: `Ausgegeben werden ${aus.join(', ')}. Danach ist zeit = ${x} und nicht mehr größer als 0 – also ${aus.length} Zahlen.` };
    } },
  { id: 'k8_048', burg: 8, kap: 142, stufe: 2, art: 'zeile', frage: 'Das Programm soll von 10 herunterzählen und dann „Los!“ ausgeben. Es hört aber nie auf. Tippe die falsche Zeile an.',
    code: 'zeit = 10\nwhile zeit > 0:\n    print(zeit)\n    zeit = zeit + 1\nprint("Los!")', fehler: [4],
    erkl: 'zeit wird größer statt kleiner – die Abbruchbedingung zeit > 0 wird nie falsch. Richtig: zeit = zeit - 1.', quelle: 'svp_8 SW 6 (Abbruchbedingung und Endlosschleife)' },
  { id: 'k8_049', burg: 8, kap: 142, stufe: 2, art: 'zuordnen', frage: 'Pseudocode beschreibt ein Programm mit deutschen Wörtern. Hier sagen Pseudocode und Python dasselbe. Ordne zu.',
    paare: [['setze n auf 1', 'n = 1'], ['solange n < 20', 'while n < 20:'], ['wiederhole 3 mal', 'for i in range(3):'], ['wenn zahl > 0 dann', 'if zahl > 0:'], ['ändere summe um zahl', 'summe += zahl']],
    erkl: 'Pseudocode beschreibt ein Programm in deutscher Sprache mit Fachbegriffen. Jede Zeile lässt sich direkt in Python übersetzen.', quelle: 'OPAL Kl. 8 lb1 03_variablen (Pseudocode) · LK1 Aufgabe 3, LK2 Aufgabe 5' },

  // ============================== Kapitel 7: 💧 Zweifach: if/else ==============================
  { id: 'k8_050', burg: 8, kap: 7, stufe: 1, art: 'wahl', frage: 'Was ist der Unterschied zwischen einer bedingten Anweisung (nur if) und einer zweiseitigen Verzweigung (if/else)?',
    optionen: ['if/else: genau ein Teil läuft – nur if: sonst passiert nichts.', 'if/else: beide Teile laufen immer nacheinander ab.', 'nur if: beide Teile laufen – if/else: nur einer.', 'Es gibt keinen Unterschied, beide Schreibweisen bedeuten genau dasselbe.'],
    erkl: 'Die zweiseitige Verzweigung hat einen Wenn-Zweig und einen Sonst-Zweig – genau einer davon läuft.', quelle: 'OPAL Kl. 8 LK1 Aufgabe 4b (Musterlösung)' },
  { id: 'k8_051', burg: 8, kap: 7, stufe: 1, art: 'luecke', frage: 'Fülle die Lücken.',
    text: 'else steht genauso weit {} wie sein if und endet mit einem {}.', luecken: [['links'], ['Doppelpunkt']], woerter: ['links', 'Doppelpunkt', 'rechts', 'Punkt', 'Klammer'],
    erkl: 'if und else stehen untereinander auf derselben Höhe; der Block darunter ist eingerückt: else:', quelle: 'Spiel Burg 8 Kap. 7 (Merke „Zweifach: if/else“)' },
  { id: 'k8_052', burg: 8, kap: 7, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 7 (Rübe oder Wasser)',
    gen: (z) => {
      const n = z.int(4, 7), reihe = Array.from({ length: n }, () => z.wahl(['r', 's']));
      if (!reihe.includes('r')) reihe[0] = 'r';
      const s = reihe.filter((c) => c === 's').length, bildText = reihe.map((c) => (c === 'r' ? '🥕' : '🌱')).join('');
      return { frage: `Die Reihe vor dem Bauern: ${bildText} (🥕 Rübe, 🌱 Setzling). Wie oft wird water() ausgeführt?`,
        code: `for i in range(${n}):\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()`, antworten: [String(s)],
        erkl: `Auf jeder Rübe wird geerntet, auf allem anderen gegossen. ${s} Setzlinge → ${s}-mal water().` };
    } },
  { id: 'k8_053', burg: 8, kap: 7, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 7 · OPAL Kl. 8 lb1 05_verzweigung',
    gen: (z) => {
      const n = z.int(4, 8);
      return { frage: `Die Reihe hat ${n} Felder mit Rüben und Setzlingen gemischt. Wie oft werden harvest() und water() zusammen ausgeführt?`,
        code: `for i in range(${n}):\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()`, antworten: [String(n)],
        erkl: `Bei if/else passiert auf jedem Feld genau eins von beiden – egal, wie die Reihe aussieht: ${n}-mal.` };
    } },
  { id: 'k8_054', burg: 8, kap: 7, stufe: 2, art: 'zeile', frage: 'Python meldet einen Fehler. Tippe die falsche Zeile an.',
    code: 'for i in range(4):\n    forward()\n    if can_harvest():\n        harvest()\n        else:\n        water()', fehler: [5],
    erkl: 'else ist zu weit eingerückt. Es muss genau unter seinem if stehen.', quelle: 'Spiel Burg 8 Kap. 7' },
  { id: 'k8_055', burg: 8, kap: 7, stufe: 3, art: 'zeile', frage: 'Gezählt werden sollen die gegossenen Setzlinge. Welche Zeile steht an der falschen Stelle?',
    code: 'gegossen = 0\nfor i in range(6):\n    forward()\n    if can_harvest():\n        harvest()\n        gegossen += 1\n    else:\n        water()\nprint(gegossen)', fehler: [6],
    erkl: 'gegossen += 1 steht im if-Teil und zählt die Rüben. Es gehört in den else-Teil unter water().', quelle: 'Spiel Burg 8 Kap. 7 (Setzlinge zählen)' },
  { id: 'k8_056', burg: 8, kap: 7, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 8 LK2 Aufgabe 4 (Heizung) · svp_8 SW 7 (Temperaturwarner)',
    gen: (z) => {
      const t = z.wahl([17, 18, 19, 20, 20, 21, 22]), an = t < 20;
      return { frage: 'Was gibt das Programm aus?', code: `temperatur = ${t}\nif temperatur < 20:\n    print("Heizung an")\nelse:\n    print("Heizung aus")`,
        antworten: [an ? 'Heizung an' : 'Heizung aus'],
        erkl: `${t} < 20 ist ${an ? 'wahr – der if-Teil läuft' : 'falsch – der else-Teil läuft'}.${t === 20 ? ' Achtung: 20 ist nicht kleiner als 20.' : ''}` };
    } },
  { id: 'k8_057', burg: 8, kap: 7, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 7 · OPAL Kl. 8 LK2 Aufgabe 5 (Programm nachvollziehen)',
    gen: (z) => {
      const n = 5, reihe = Array.from({ length: n }, () => z.wahl(['r', 's']));
      if (!reihe.includes('s')) reihe[2] = 's';
      if (!reihe.includes('r')) reihe[0] = 'r';
      const r = reihe.filter((c) => c === 'r').length, s = n - r, bildText = reihe.map((c) => (c === 'r' ? '🥕' : '🌱')).join('');
      return { frage: `Die Reihe vor dem Bauern: ${bildText} (🥕 Rübe, 🌱 Setzling). Was gibt das Programm aus?`,
        code: 'punkte = 0\nfor i in range(5):\n    forward()\n    if can_harvest():\n        harvest()\n        punkte += 2\n    else:\n        water()\n        punkte -= 1\nprint(punkte)',
        antworten: [String(2 * r - s)], erkl: `${r} Rüben bringen je +2, ${s} Setzlinge je −1: ${2 * r} − ${s} = ${2 * r - s}.` };
    } },

  // ============================== Kapitel 8: 🌿 Mehrfach: if/elif/else ==============================
  { id: 'k8_058', burg: 8, kap: 8, stufe: 1, art: 'luecke', frage: 'Fülle die Lücken.',
    text: 'elif bedeutet „{}“. Python prüft die Bedingungen von {} nach {} und macht nur den ersten Teil, der passt.',
    luecken: [['sonst wenn'], ['oben'], ['unten']], woerter: ['sonst wenn', 'und dann', 'oben', 'unten', 'solange'],
    erkl: 'Mehrfache Verzweigung: wenn … sonst wenn … sonst. Sobald eine Bedingung wahr ist, werden die anderen nicht mehr geprüft.', quelle: 'Spiel Burg 8 Kap. 8 (Merke „Mehrfach: elif“) · OPAL Kl. 8 lb1 05_verzweigung' },
  { id: 'k8_059', burg: 8, kap: 8, stufe: 1, art: 'zuordnen', frage: 'Ordne jeder Art der Verzweigung ihre Form in Python zu.',
    paare: [['bedingte Anweisung (einseitig)', 'if'], ['zweiseitige Verzweigung', 'if … else'], ['mehrfache Verzweigung', 'if … elif … else']],
    erkl: 'Die Arten unterscheiden sich in der Zahl der Wege: einer (sonst nichts), zwei, oder mehrere.', quelle: 'OPAL Kl. 8 lb1 05_verzweigung (drei Typen von Verzweigungen)' },
  { id: 'k8_060', burg: 8, kap: 8, stufe: 1, art: 'zuordnen', frage: 'Was soll der Bauer auf welchem Feld tun?',
    paare: [['🥕 Rübe', 'harvest()'], ['🌿 Unkraut', 'pull()'], ['🌱 Setzling', 'water()'], ['🕳️ Loch', 'place()']],
    erkl: 'Rüben ernten, Unkraut rupfen, Setzlinge gießen, Löcher mit Ziegeln flicken. Mit if/elif/else wählt der Bauer den richtigen Befehl.', quelle: 'Spiel Burg 8 Kap. 6–8' },
  { id: 'k8_061', burg: 8, kap: 8, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 8 (Drei Sorten)',
    gen: (z) => {
      const n = z.int(5, 7), reihe = Array.from({ length: n }, () => z.wahl(['r', 'u', 's']));
      if (!reihe.includes('u')) reihe[1] = 'u';
      const u = reihe.filter((c) => c === 'u').length, bildText = reihe.map((c) => ({ r: '🥕', u: '🌿', s: '🌱' })[c]).join('');
      return { frage: `Die Reihe vor dem Bauern: ${bildText} (🥕 Rübe, 🌿 Unkraut, 🌱 Setzling). Wie oft wird pull() ausgeführt?`,
        code: `for i in range(${n}):\n    forward()\n    if can_harvest():\n        harvest()\n    elif is_weed():\n        pull()\n    else:\n        water()`, antworten: [String(u)],
        erkl: `pull() läuft nur, wenn keine Rübe da ist und is_weed() wahr ist – also auf den ${u} Unkräutern.` };
    } },
  { id: 'k8_062', burg: 8, kap: 8, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 8 LK1 Aufgabe 4 (Lärmampel) · lb1 05_verzweigung Aufgabe 3',
    gen: (z) => {
      const l = z.wahl([20, 49, 50, 75, 100, 101, 180]), f = l < 50 ? 'grün' : l <= 100 ? 'gelb' : 'rot';
      return { frage: `Eine Lärmampel misst laut = ${l}. Was gibt das Programm aus?`,
        code: `laut = ${l}\nif laut < 50:\n    print("grün")\nelif laut <= 100:\n    print("gelb")\nelse:\n    print("rot")`, antworten: [f],
        erkl: f === 'grün' ? `${l} < 50 ist wahr – gleich der erste Teil.` : f === 'gelb' ? `${l} < 50 ist falsch, aber ${l} <= 100 ist wahr.` : `${l} < 50 und ${l} <= 100 sind beide falsch – also else.` };
    } },
  { id: 'k8_063', burg: 8, kap: 8, stufe: 3, art: 'mehr', frage: 'Bei welchen Werten von laut gibt dieses Programm „gelb“ aus? Kreuze alle an.',
    code: 'if laut < 50:\n    print("grün")\nelif laut <= 100:\n    print("gelb")\nelse:\n    print("rot")',
    optionen: ['50', '100', '75', '49', '101'], richtig: [0, 1, 2],
    erkl: 'Gelb heißt: nicht kleiner als 50, aber höchstens 100 – also 50 bis 100. 49 ist grün, 101 ist rot.', quelle: 'OPAL Kl. 8 LK1 Aufgabe 4 (korrekte Grenzen)' },
  { id: 'k8_064', burg: 8, kap: 8, stufe: 3, art: 'eingabe', frage: 'Hier ist die Reihenfolge vertauscht. Was gibt das Programm bei laut = 20 aus?',
    code: 'laut = 20\nif laut < 100:\n    print("gelb")\nelif laut < 50:\n    print("grün")\nelse:\n    print("rot")', antworten: ['gelb'],
    erkl: '20 < 100 ist schon wahr – der erste passende Teil gewinnt, elif wird gar nicht mehr geprüft. So wird nie „grün“ ausgegeben.', quelle: 'Spiel Burg 8 Kap. 8 (erster passender Teil) · OPAL Kl. 8 LK1 Aufgabe 4' },
  { id: 'k8_065', burg: 8, kap: 8, stufe: 2, art: 'zeile', frage: 'Python meldet einen Fehler. Tippe die falsche Zeile an.',
    code: 'for i in range(6):\n    forward()\n    if can_harvest():\n        harvest()\n    else:\n        water()\n    elif is_weed():\n        pull()', fehler: [7],
    erkl: 'elif muss VOR else stehen. else ist immer der letzte Teil einer Verzweigung.', quelle: 'Spiel Burg 8 Kap. 8' },
  { id: 'k8_066', burg: 8, kap: 8, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 8 lb1 05_verzweigung (mehrfache Verzweigung) · svp_8 SW 7',
    gen: (z) => {
      const p = z.wahl([95, 90, 89, 75, 74, 60, 59, 30]), note = p >= 90 ? 1 : p >= 75 ? 2 : p >= 60 ? 3 : 4;
      return { frage: `Ein Quiz vergibt Sterne. Wer ${p} Punkte hat – was gibt das Programm aus?`,
        code: `punkte = ${p}\nif punkte >= 90:\n    sterne = 3\nelif punkte >= 75:\n    sterne = 2\nelif punkte >= 60:\n    sterne = 1\nelse:\n    sterne = 0\nprint(sterne)`,
        antworten: [String(4 - note)],
        erkl: `Von oben geprüft: Der erste Teil, dessen Bedingung für ${p} wahr ist, legt die Sterne fest – hier ${4 - note}.` };
    } },

  // ============================== Vergleiche (Kap. 10 „Genau fünf“, Kap. 6 „Volle Kiste“) ==============================
  { id: 'k8_067', burg: 8, kap: 10, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. 10 (Genau fünf) · svp_8 SW 7',
    gen: (z) => {
      const g = z.int(3, 6), n = z.int(2, 9), s = Math.min(g, n);
      return { frage: `Vor dem Bauern liegen ${n} freie Felder, dahinter der Zaun. Was gibt das Programm aus?`,
        code: `schritte = 0\nwhile schritte < ${g} and can_move():\n    forward()\n    schritte += 1\nprint(schritte)`, antworten: [String(s)],
        erkl: `Mit and müssen beide Bedingungen stimmen. ${n <= g ? `Nach ${n} Schritten ist can_move() falsch (Zaun).` : `Nach ${g} Schritten ist schritte < ${g} falsch.`} Also ${s}.` };
    } },
  { id: 'k8_068', burg: 8, kap: 6, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'svp_8 SW 7 (Vergleichsoperatoren, and, not)',
    gen: (z) => {
      const x = z.int(2, 8), a = z.int(2, 8), b = z.int(2, 8), ja = x != a && x >= b;
      return { frage: 'Was gibt das Programm aus?', code: `x = ${x}\nif x != ${a} and x >= ${b}:\n    print("ja")\nelse:\n    print("nein")`, antworten: [ja ? 'ja' : 'nein'],
        erkl: `x != ${a} ist ${x != a ? 'wahr' : 'falsch'}, x >= ${b} ist ${x >= b ? 'wahr' : 'falsch'}. Mit and müssen beide wahr sein – also „${ja ? 'ja' : 'nein'}“.` };
    } },

  // ============================== Kapitel 23: 📋 Listen ==============================
  { id: 'k8_069', burg: 8, kap: 23, stufe: 1, art: 'wahl', frage: 'Welchen Index hat der erste Wert einer Liste?',
    optionen: ['0', '1', '-1', 'keinen'],
    erkl: 'In Python wird ab 0 gezählt: liste[0] ist der erste Wert, liste[len(liste) - 1] der letzte.', quelle: 'Lehrplan Kl. 8 LB 1 (Arrays) · Spiel Burg 8 Kap. Listen' },
  { id: 'k8_070', burg: 8, kap: 23, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. Listen (Der Plan)',
    gen: (z) => {
      const l = [z.int(1, 9), z.int(1, 9), z.int(1, 9), z.int(1, 9)], i = z.int(0, 3);
      return { frage: 'Was gibt das Programm aus?', code: `plan = [${l.join(', ')}]\nprint(plan[${i}])`, antworten: [String(l[i])],
        erkl: `Gezählt wird ab 0: plan[0] = ${l[0]}, plan[1] = ${l[1]}, plan[2] = ${l[2]}, plan[3] = ${l[3]}.` };
    } },
  { id: 'k8_071', burg: 8, kap: 23, stufe: 1, art: 'luecke', frage: 'Fülle die Lücken.',
    text: 'beete = []\nbeete.{}(5)\nprint({}(beete))   # gibt 1 aus', luecken: [['append'], ['len']], woerter: ['append', 'len', 'sum', 'print', 'add'],
    erkl: 'append hängt einen Wert hinten an die Liste. len sagt, wie viele Werte in der Liste sind.', quelle: 'Spiel Burg 8 Kap. Listen (Das Messbuch)' },
  { id: 'k8_072', burg: 8, kap: 23, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. Listen (Wie viele insgesamt?)',
    gen: (z) => {
      const l = Array.from({ length: z.int(3, 5) }, () => z.int(1, 9)), s = l.reduce((a, b) => a + b, 0);
      return { frage: 'Was gibt das Programm aus?', code: `ernte = [${l.join(', ')}]\nsumme = 0\nfor i in range(len(ernte)):\n    summe += ernte[i]\nprint(summe)`, antworten: [String(s)],
        erkl: `Die Schleife geht jeden Platz einmal durch und zählt dazu: ${l.join(' + ')} = ${s}.` };
    } },
  { id: 'k8_073', burg: 8, kap: 23, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. Listen (Das Messbuch)',
    gen: (z) => {
      const n = z.int(2, 4), a = z.int(1, 3);
      return { frage: 'Was gibt das Programm aus?', code: `liste = [${Array.from({ length: n }, (_, i) => i + 1).join(', ')}]\n${Array(a).fill('liste.append(0)').join('\n')}\nprint(len(liste))`, antworten: [String(n + a)],
        erkl: `Am Anfang ${n} Werte, ${a}-mal append: ${n} + ${a} = ${n + a}.` };
    } },
  { id: 'k8_074', burg: 8, kap: 23, stufe: 2, art: 'zeile', frage: 'Das Programm soll alle Werte der Liste ausgeben, bricht aber mit einem Fehler ab. Tippe die falsche Zeile an.',
    code: 'plan = [2, 4, 2]\nfor i in range(1, len(plan) + 1):\n    print(plan[i])', fehler: [2],
    erkl: 'i läuft hier 1, 2, 3. Den ersten Wert (Index 0) gibt es nicht aus, und plan[3] gibt es gar nicht – die Plätze gehen nur von 0 bis 2. Richtig: for i in range(len(plan)):', quelle: 'Spiel Burg 8 Kap. Listen (Der verrutschte Plan)' },
  { id: 'k8_075', burg: 8, kap: 23, stufe: 3, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. Listen (Das größte Beet)',
    gen: (z) => {
      const l = z.mische([z.int(1, 3), z.int(4, 5), z.int(6, 7), 9]), m = Math.max(...l), p = l.indexOf(m);
      return { frage: 'Was gibt das Programm aus? (zwei Zahlen)', code: `beete = [${l.join(', ')}]\ngroesste = beete[0]\nplatz = 0\nfor i in range(len(beete)):\n    if beete[i] > groesste:\n        groesste = beete[i]\n        platz = i\nprint(groesste, platz)`,
        antworten: [`${m} ${p}`, `${m}, ${p}`, `${m},${p}`], erkl: `Das größte Beet hat ${m} Rüben und steht an Platz ${p} (gezählt ab 0).` };
    } },
  { id: 'k8_076', burg: 8, kap: 23, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 8 Kap. Listen',
    gen: (z) => {
      const a = z.int(3, 6), k = z.int(1, a - 1);
      return { frage: 'Was gibt das Programm aus?', code: `liste = []\nfor i in range(${a}):\n    liste.append(i * 2)\nprint(liste[${k}])`, antworten: [String(2 * k)],
        erkl: `Die Liste wird [${Array.from({ length: a }, (_, i) => i * 2).join(', ')}]. Platz ${k} (ab 0 gezählt) enthält ${2 * k}.` };
    } },
);
