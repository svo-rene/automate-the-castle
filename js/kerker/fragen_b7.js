'use strict';
// 🗝️ Kerker-Fragen Burg 7 – Kapitel 1 Blöcke, 140 Algorithmus, 3 for, 22 Ziegel, 5 Variablen, 141 Bauer als Objekt, 2 Python tippen
// Quellen: OPAL INFO_SEK1 Informatik Klasse 7 (lb3_algorithmen: 10_algorithmus, 12_variablen, 13_schleifen,
//   5_klassen_objekte, 6_klassenkarten_objektkarten, 7_methode_punknotation), Leistungskontrollen Kl. 7 LK3 Objektorientierung
//   und LK4 Algorithmen Calliope, Stoffverteilungsplan svp_7 (SW 15 Zustandsdiagramme, SW 20–24 Objektorientierung,
//   SW 27–30 Algorithmen, Wiederholung, Variablen); Lehrplan Gymnasium Sachsen Informatik 2022 Kl. 7 LB 1 (Objektorientierung),
//   LB 2 (Zustandsdiagramme), LB 3 (Algorithmen); Kl. 8 LB 1 (Algorithmusbegriff, im Spiel schon in Burg 7).
// Sprachmittel nur wie in Burg 7: Sequenz, for, Variablen, print – kein if, kein while.
KERKER_FRAGEN.push(
  // ============================== Kapitel 1: 🧩 Blöcke (Sequenz, Drehen) ==============================
  { id: 'k7_001', burg: 7, kap: 1, stufe: 1, art: 'wahl', frage: 'Was macht der Befehl forward()?',
    optionen: ['Der Bauer geht ein Feld weiter.', 'Der Bauer dreht sich nach vorn.', 'Der Bauer erntet das Feld vor sich.', 'Der Bauer geht bis zum Rand.'],
    erkl: 'forward() heißt „vorwärts“: genau ein Feld in Blickrichtung. Für mehr Felder brauchst du mehr forward() oder eine Schleife.', quelle: 'Spiel Burg 7 Kap. 1 · Lehrplan Kl. 7 LB 3 (Sequenz)' },
  { id: 'k7_002', burg: 7, kap: 1, stufe: 1, art: 'zuordnen', frage: 'Was macht welcher Befehl?',
    paare: [['forward()', 'ein Feld weitergehen'], ['harvest()', 'die Rübe ernten'], ['turn_right()', 'nach rechts drehen'], ['turn_left()', 'nach links drehen']],
    erkl: 'Jeder Befehl macht genau eine Sache. Beim Drehen bleibt der Bauer auf seinem Feld.', quelle: 'Spiel Burg 7 Kap. 1 · OPAL Kl. 7 LK4 (Anweisungen)' },
  { id: 'k7_003', burg: 7, kap: 1, stufe: 1, art: 'wahl', frage: 'Der Bauer macht turn_right(). Wo steht er danach?',
    optionen: ['Auf demselben Feld, nur anders gedreht.', 'Ein Feld weiter rechts als vorher.', 'Ein Feld weiter unten als vorher.', 'Wieder auf dem Startfeld des Hofs.'],
    erkl: 'Drehen ändert nur die Blickrichtung – der Bauer bleibt auf seinem Feld. Zum Gehen braucht der Bauer forward().', quelle: 'Spiel Burg 7 Kap. 1 (Merke „Drehen“)' },
  { id: 'k7_004', burg: 7, kap: 1, stufe: 1, art: 'luecke', frage: 'Fülle die Lücken.',
    text: 'Befehle, die einfach nacheinander ausgeführt werden, nennt man eine {}. Der Bauer arbeitet sie von {} nach {} ab.',
    luecken: [['Sequenz'], ['oben'], ['unten']], woerter: ['Sequenz', 'Schleife', 'Variable', 'oben', 'unten', 'links'],
    erkl: 'Die Sequenz ist die einfachste Kontrollstruktur: Die Befehle sind aneinandergereiht und laufen der Reihe nach.', quelle: 'OPAL Kl. 7 lb3 13_schleifen (Kontrollstruktur Sequenz)' },
  { id: 'k7_005', burg: 7, kap: 1, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 7 Kap. 1 (Drehen)',
    gen: (z) => {
      const R = ['Norden', 'Osten', 'Süden', 'Westen'];
      let d = z.int(0, 3); const start = R[d];
      const n = z.int(2, 4), zeilen = [];
      for (let i = 0; i < n; i++) { const r = z.wahl([true, false]); zeilen.push(r ? 'turn_right()' : 'turn_left()'); d = (d + (r ? 1 : 3)) % 4; }
      return { frage: `Der Bauer schaut nach ${start}. Wohin schaut er nach diesen Befehlen?`, code: zeilen.join('\n'),
        antworten: [R[d], 'nach ' + R[d]],
        erkl: `Rechts herum geht es Norden → Osten → Süden → Westen, links herum andersherum. Am Ende schaut der Bauer nach ${R[d]}.` };
    } },
  { id: 'k7_006', burg: 7, kap: 1, stufe: 2, art: 'reihe', frage: 'Der Bauer schaut nach Osten. Eine Rübe liegt direkt vor ihm, eine zweite direkt darunter. Bring die Schritte in die richtige Reihenfolge.',
    bild: () => '<div style="font-size:30px;line-height:1.3;text-align:center">🧑‍🌾🥕<br>🟫🥕</div>',
    teile: ['Zur ersten Rübe gehen: forward()', 'Ernten: harvest()', 'Nach unten drehen: turn_right()', 'Zur zweiten Rübe gehen: forward()', 'Nochmal ernten: harvest()'],
    erkl: 'Erst hingehen, dann ernten. Wer nach Osten schaut, hat Süden (unten) rechts von sich – darum turn_right().', quelle: 'Spiel Burg 7 Kap. 1 · OPAL Kl. 7 LK4 Aufgabe 2 (Algorithmus in Schritten)' },
  { id: 'k7_007', burg: 7, kap: 1, stufe: 2, art: 'eingabe', zahl: true, frage: 'Wie viele Felder geht der Bauer insgesamt?',
    code: 'forward()\nharvest()\nforward()\nforward()\nharvest()\nturn_left()\nforward()\nharvest()', antworten: ['4'],
    erkl: 'Nur forward() bewegt den Bauern – es kommt 4-mal vor. harvest() und turn_left() bleiben auf dem Feld.', quelle: 'Spiel Burg 7 Kap. 1 · svp_7 SW 33 (Abläufe vorhersagen)' },
  { id: 'k7_008', burg: 7, kap: 1, stufe: 3, art: 'zeile', frage: 'Der Bauer schaut nach Osten. Er soll beide Rüben ernten. Tippe die falsche Zeile an.',
    bild: () => '<div style="font-size:30px;line-height:1.3;text-align:center">🧑‍🌾🟫🥕<br>🟫🟫🥕</div>',
    code: 'forward()\nforward()\nharvest()\nturn_left()\nforward()\nharvest()', fehler: [4],
    erkl: 'Die zweite Rübe liegt unter der ersten. Wer nach Osten schaut, muss sich nach rechts drehen, um nach unten zu schauen: turn_right().', quelle: 'Spiel Burg 7 Kap. 1 · svp_7 SW 33 (Fehler finden)' },
  { id: 'k7_009', burg: 7, kap: 1, stufe: 3, art: 'eingabe', zahl: true, frage: 'Der Bauer schaut nach Süden. Wie oft muss er turn_left() machen, damit er nach Westen schaut?',
    antworten: ['3'],
    erkl: 'Links herum von Süden: Osten, Norden, Westen – also 3-mal. Einmal turn_right() wäre kürzer.', quelle: 'Spiel Burg 7 Kap. 1 (Drehen)' },

  // ============================== Kapitel 140: 📋 Was ist ein Algorithmus? ==============================
  { id: 'k7_010', burg: 7, kap: 140, stufe: 1, art: 'luecke', frage: 'Ein Algorithmus ist eine Handlungsvorschrift. Fülle die Lücken.',
    text: 'Jeder Schritt ist klar – der Algorithmus ist {}. Jeder Schritt ist machbar – er ist {}. Er hört irgendwann auf – er ist {}.',
    luecken: [['eindeutig'], ['ausführbar'], ['endlich']], woerter: ['eindeutig', 'ausführbar', 'endlich', 'schnell', 'kurz'],
    erkl: 'Merke: Ein Algorithmus ist eine endliche, ausführbare und eindeutige Handlungsvorschrift, um ein Problem zu lösen.', quelle: 'OPAL Kl. 7 lb3 10_algorithmus (Merke)' },
  { id: 'k7_011', burg: 7, kap: 140, stufe: 1, art: 'zuordnen', frage: 'Jede Anweisung hat einen Fehler. Welche Eigenschaft fehlt ihr?',
    paare: [['„Nimm etwas Mehl.“', 'nicht eindeutig'], ['„Flieg schnell zum Mond und zurück.“', 'nicht ausführbar'], ['„Zähl weiter, bis du bei der größten Zahl bist.“', 'nicht endlich']],
    erkl: '„Etwas“ kann jeder anders verstehen. Zum Mond fliegen kann niemand. Eine größte Zahl gibt es nicht – man zählt ewig.', quelle: 'OPAL Kl. 7 lb3 10_algorithmus · svp_7 SW 27 (eindeutige und mehrdeutige Anweisungen)' },
  { id: 'k7_012', burg: 7, kap: 140, stufe: 2, art: 'wahl', frage: 'Jemand sagt zum Sprachlautsprecher: „Mach es im Zimmer gemütlich.“ Ist das ein Algorithmus?',
    optionen: ['Nein – „gemütlich“ ist nicht eindeutig.', 'Ja – ein Lautsprecher kann das ausführen.', 'Nein – es ist nicht endlich.', 'Ja – es ist nur ein Satz, also klar.'],
    erkl: 'Was „gemütlich“ heißt, ist nicht festgelegt: Licht dimmen? Musik? Heizung? Die Schritte sind nicht eindeutig.', quelle: 'OPAL Kl. 8 LK2 Aufgabe 2b (Algorithmus oder kein Algorithmus)' },
  { id: 'k7_013', burg: 7, kap: 140, stufe: 2, art: 'mehr', frage: 'Kreuze alle Vorgänge an, die nach einem Algorithmus ablaufen können.',
    optionen: ['ein Kuchenrezept mit genauen Mengen', 'eine Bauanleitung für ein Regal', 'den Wecker auf 6:30 Uhr stellen', 'über einen Witz lachen', 'einen schönen Traum haben'], richtig: [0, 1, 2],
    erkl: 'Rezept, Bauanleitung und Wecker stellen bestehen aus klaren Schritten. Lachen und Träumen passieren einfach – dafür gibt es keine Schritt-für-Schritt-Vorschrift.', quelle: 'OPAL Kl. 7 LK4 Aufgabe 1b (Musterlösung)' },
  { id: 'k7_014', burg: 7, kap: 140, stufe: 1, art: 'reihe', frage: 'Ein Algorithmus zum Teekochen. Bring die Schritte in die richtige Reihenfolge.',
    teile: ['Wasser in den Wasserkocher füllen', 'Wasserkocher einschalten', 'warten, bis das Wasser kocht', 'Wasser über den Teebeutel gießen', 'Teebeutel nach 3 Minuten herausnehmen'],
    erkl: 'Bei einem Algorithmus ist die Reihenfolge wichtig: Ohne Wasser bringt Einschalten nichts, und den Beutel nimmt man erst nach dem Ziehen heraus.', quelle: 'OPAL Kl. 7 LK4 Aufgabe 2 (Algorithmus verbal beschreiben)' },
  { id: 'k7_015', burg: 7, kap: 140, stufe: 1, art: 'wahl', frage: 'Ein Computer arbeitet mit einem Algorithmus. Woraus macht er Ausgabedaten?',
    optionen: ['aus Eingabedaten', 'aus Strom', 'aus reinem Zufall', 'aus dem Bildschirm'],
    erkl: 'Am Computer werden mit einem Algorithmus Eingabedaten in Ausgabedaten umgewandelt.', quelle: 'OPAL Kl. 7 lb3 10_algorithmus (Merke)' },
  { id: 'k7_016', burg: 7, kap: 140, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 7 lb3 10_algorithmus Aufgabe 3 (Goldschachteln)',
    gen: (z) => {
      const n = z.int(5, 16);
      return { frage: `${n} Goldschachteln, eine Balkenwaage. Plan: Leg zwei Schachteln auf die Waage, behalte die schwerere und vergleiche sie mit der nächsten – bis keine mehr übrig ist. Wie oft wiegst du?`,
        antworten: [String(n - 1)], erkl: `Bei jedem Wiegen fällt genau eine Schachtel weg. Von ${n} Schachteln bleibt am Ende eine übrig – also ${n - 1}-mal wiegen.` };
    } },
  { id: 'k7_017', burg: 7, kap: 140, stufe: 2, art: 'wahl', frage: 'Wegbeschreibung: „Geh bis zur Kirche. Bieg dort links ab. Nach 100 Metern ist die Schule rechts.“ Was stimmt?',
    optionen: ['Ein Algorithmus: eindeutig, ausführbar und endlich.', 'Kein Algorithmus: „links“ ist nicht eindeutig.', 'Kein Algorithmus: Der Weg ist nicht endlich.', 'Kein Algorithmus: Wege kann man nicht beschreiben.'],
    erkl: 'Jeder Schritt ist klar, man kann ihn gehen, und an der Schule ist Schluss. Eine Wegbeschreibung ist ein typischer Alltags-Algorithmus.', quelle: 'svp_7 SW 27 (Rezept, Wegbeschreibung, Spielregel)' },
  { id: 'k7_018', burg: 7, kap: 140, stufe: 1, art: 'wahl', frage: 'Warum muss ein Plan für den Bauern so genau sein?',
    optionen: ['Er macht genau, was dasteht, und denkt nicht mit.', 'Er rät selbst, was mit einem Befehl gemeint ist.', 'Er überspringt einfach alle unklaren Befehle.', 'Er fragt nach, wenn ihm etwas unklar ist.'],
    erkl: 'Ein Computer (und dein Bauer) macht genau, was dasteht – nicht mehr und nicht weniger. Er rät nicht und fragt nicht nach. Darum muss jeder Schritt eindeutig sein.', quelle: 'OPAL Kl. 7 lb3 10_algorithmus' },
  { id: 'k7_019', burg: 7, kap: 140, stufe: 2, art: 'zeile', frage: 'Ein Rezept für Rührei. Welche Zeile ist NICHT eindeutig?',
    code: 'Nimm 2 Eier aus dem Kühlschrank.\nSchlag die Eier in eine Schüssel.\nGib etwas Milch dazu.\nVerrühre alles 1 Minute lang.\nBrate es 3 Minuten in der Pfanne.', fehler: [3],
    erkl: '„Etwas Milch“ kann jeder anders verstehen. Eindeutig wäre z. B. „Gib 2 Esslöffel Milch dazu.“', quelle: 'OPAL Kl. 7 lb3 10_algorithmus · svp_7 SW 27' },

  // ============================== Kapitel 3: 🔁 Die Zählschleife for ==============================
  { id: 'k7_020', burg: 7, kap: 3, stufe: 1, art: 'wahl', frage: 'Wozu nutzt man eine Zählschleife?',
    optionen: ['Um Befehle eine feste Anzahl von Malen zu wiederholen.', 'Um zu zählen, wie viele Rüben auf dem Acker liegen.', 'Um einen Befehl beim Ausführen einfach zu überspringen.', 'Um alle Befehle rückwärts auszuführen.'],
    erkl: 'Bei der Zählschleife steht vorher fest, wie oft die Befehle in ihr wiederholt werden – in Python mit for i in range(…).', quelle: 'OPAL Kl. 7 lb3 13_schleifen (Zählschleife)' },
  { id: 'k7_021', burg: 7, kap: 3, stufe: 1, art: 'luecke', frage: 'Der Bauer soll 4-mal einen Schritt gehen. Fülle die Lücken.',
    text: '{} i in {}(4):\n    forward()', luecken: [['for'], ['range']], woerter: ['for', 'range', 'repeat', 'print', 'turn'],
    erkl: 'Die Zählschleife in Python: for i in range(Anzahl): – die Befehle darunter werden eingerückt.', quelle: 'Spiel Burg 7 Kap. 3 (Merke „Die Zählschleife for“)' },
  { id: 'k7_022', burg: 7, kap: 3, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 7 lb3 13_schleifen',
    gen: (z) => {
      const n = z.int(3, 9);
      return { frage: 'Wie oft macht der Bauer forward()?', code: `for i in range(${n}):\n    forward()`, antworten: [String(n)],
        erkl: `range(${n}) heißt: Die eingerückten Befehle laufen ${n}-mal.` };
    } },
  { id: 'k7_023', burg: 7, kap: 3, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 7 Kap. 140/3 · OPAL Kl. 7 lb3 13_schleifen',
    gen: (z) => {
      const n = z.int(3, 8);
      return { frage: 'Wie viele Befehle führt der Bauer insgesamt aus?', code: `for i in range(${n}):\n    forward()\n    harvest()`, antworten: [String(2 * n)],
        erkl: `In jeder Runde 2 Befehle (forward und harvest), ${n} Runden: ${n} · 2 = ${2 * n}.` };
    } },
  { id: 'k7_024', burg: 7, kap: 3, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 7 Kap. 3 (Schleife in der Schleife)',
    gen: (z) => {
      const a = z.int(2, 5), b = z.int(2, 5);
      return { frage: 'Wie oft macht der Bauer forward()?', code: `for i in range(${a}):\n    for j in range(${b}):\n        forward()`, antworten: [String(a * b)],
        erkl: `Die innere Schleife läuft bei jeder der ${a} Runden komplett durch, also ${a} · ${b} = ${a * b}-mal.` };
    } },
  { id: 'k7_025', burg: 7, kap: 3, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: ['1'], erkl: '', quelle: 'Spiel Burg 7 Kap. 3 (Einrückung)',
    gen: (z) => {
      const n = z.int(3, 7);
      return { frage: 'Wie oft wird harvest() ausgeführt?', code: `for i in range(${n}):\n    forward()\nharvest()`, antworten: ['1'],
        erkl: `Nur forward() ist eingerückt und gehört zur Schleife. harvest() steht danach und läuft nur einmal – nach den ${n} Schritten.` };
    } },
  { id: 'k7_026', burg: 7, kap: 3, stufe: 2, art: 'wahl', frage: 'Der Bauer soll 3 Schritte gehen und dann EINMAL ernten. Was gehört eingerückt unter for i in range(3): ?',
    optionen: ['nur forward()', 'forward() und harvest()', 'nur harvest()', 'gar nichts'],
    erkl: 'Eingerückt steht nur, was wiederholt werden soll – hier die Schritte. harvest() kommt danach, ohne Einrückung.', quelle: 'Spiel Burg 7 Kap. 3 · Lehrplan Kl. 7 LB 3 (Wiederholung)' },
  { id: 'k7_027', burg: 7, kap: 3, stufe: 2, art: 'zeile', frage: 'Der Bauer startet oben links und soll rechts herum (im Uhrzeigersinn) um das Beet ernten. Tippe die falsche Zeile an.',
    code: 'for i in range(4):\n    for j in range(5):\n        forward()\n        harvest()\n    turn_left()', fehler: [5],
    erkl: 'Rechts herum heißt: an jeder Ecke nach rechts drehen. Mit turn_left() würde der Bauer vom Beet weglaufen.', quelle: 'Spiel Burg 7 Kap. 3 (Rund ums Beet)' },
  { id: 'k7_028', burg: 7, kap: 3, stufe: 2, art: 'eingabe', zahl: true, frage: 'Der Bauer soll ein Quadrat ablaufen und am Ende wieder auf seinem Startfeld stehen. Welche Zahl gehört in das Kästchen?',
    code: 'for i in range(▢):\n    for j in range(3):\n        forward()\n    turn_right()', antworten: ['4'],
    erkl: 'Ein Quadrat hat 4 Seiten. Nach jeder Seite dreht sich der Bauer – nach 4 Runden ist er wieder am Start.', quelle: 'OPAL Kl. 7 LK3 Aufgabe 5 (Turtle zeichnet ein Quadrat) · svp_7 SW 24' },
  { id: 'k7_029', burg: 7, kap: 3, stufe: 3, art: 'reihe', frage: 'Der Bauer soll 4 Rüben in einer Reihe ernten und sich danach EINMAL nach rechts drehen. Bring die Zeilen in die richtige Reihenfolge.',
    teile: ['for i in range(4):', '    forward()', '    harvest()', 'turn_right()'],
    erkl: 'Erst die Schleife, darin Schritt und Ernten. Das Drehen steht danach ohne Einrückung, damit es nur einmal passiert.', quelle: 'Spiel Burg 7 Kap. 3' },
  { id: 'k7_030', burg: 7, kap: 3, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 7 Kap. 3 (Schleife in der Schleife)',
    gen: (z) => {
      const a = z.int(2, 4), b = z.int(2, 5);
      return { frage: 'Wie viele Befehle führt der Bauer insgesamt aus (Schritte und Drehungen zusammen)?', code: `for i in range(${a}):\n    for j in range(${b}):\n        forward()\n    turn_right()`,
        antworten: [String(a * (b + 1))], erkl: `Eine äußere Runde: ${b}-mal forward() und 1-mal turn_right() = ${b + 1} Befehle. Das ${a}-mal: ${a} · ${b + 1} = ${a * (b + 1)}.` };
    } },
  { id: 'k7_031', burg: 7, kap: 3, stufe: 1, art: 'wahl', frage: 'Warum ist for i in range(6) besser als 6-mal forward() untereinander?',
    optionen: ['Kürzer – die Anzahl steht an einer Stelle.', 'Der Bauer läuft damit schneller über den Acker.', 'Mit Schleife darf der Bauer mehr Felder gehen.', 'Ohne Schleife geht es in Python gar nicht.'],
    erkl: 'Wiederholungen erkennen und mit einer Schleife kürzer schreiben: Das spart Zeilen, und für 10 Schritte änderst du nur eine Zahl.', quelle: 'svp_7 SW 29 (Wiederholungen erkennen und kürzer schreiben) · OPAL Kl. 7 lb3 13_schleifen' },

  // ============================== Kapitel 22: 🧱 Ziegel und Löcher ==============================
  { id: 'k7_032', burg: 7, kap: 22, stufe: 1, art: 'zuordnen', frage: 'Was macht welcher Befehl?',
    paare: [['pick_up()', 'hebt einen Ziegel auf und legt ihn in den Korb'], ['place()', 'legt einen Ziegel aus dem Korb ins Loch'], ['forward()', 'geht ein Feld weiter'], ['harvest()', 'erntet eine Rübe']],
    erkl: 'pick_up() heißt „aufheben“, place() heißt „hinlegen“. Gelegt wird immer auf das Feld, auf dem der Bauer steht.', quelle: 'Spiel Burg 7 Kap. 22 (Merke „Ziegel“, wie Robot Karol)' },
  { id: 'k7_033', burg: 7, kap: 22, stufe: 1, art: 'wahl', frage: 'Wohin legt place() den Ziegel?',
    optionen: ['auf das Feld, auf dem der Bauer steht', 'auf das Feld direkt vor dem Bauern', 'zurück in den Korb des Bauern', 'ins nächste Loch, egal wo es auf dem Acker liegt'],
    erkl: 'Der Bauer legt den Ziegel unter sich ab. Darum muss er erst mit forward() auf das Loch gehen.', quelle: 'Spiel Burg 7 Kap. 22' },
  { id: 'k7_034', burg: 7, kap: 22, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 7 Kap. 22 · OPAL Kl. 7 lb3 13_schleifen',
    gen: (z) => {
      const a = z.int(3, 6), k = z.int(a + 1, 12);
      return { frage: `Vor dem Bauern sind ${a} Löcher hintereinander. Im Korb sind ${k} Ziegel. Wie viele Ziegel sind danach noch im Korb?`,
        code: `for i in range(${a}):\n    forward()\n    place()`, antworten: [String(k - a)],
        erkl: `Jedes place() nimmt einen Ziegel aus dem Korb: ${k} − ${a} = ${k - a}.` };
    } },
  { id: 'k7_035', burg: 7, kap: 22, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 7 Kap. 22',
    gen: (z) => {
      const a = z.int(2, 5);
      return { frage: `Vor dem Bauern liegen abwechselnd ein Ziegel und ein Loch – ${a}-mal. Der Korb ist am Anfang leer. Wie viele Löcher sind danach geflickt?`,
        bild: () => '<div style="font-size:28px;text-align:center">🧑‍🌾' + '🧱🕳️'.repeat(a) + '</div>',
        code: `for i in range(${a}):\n    forward()\n    pick_up()\n    forward()\n    place()`, antworten: [String(a)],
        erkl: `In jeder Runde hebt der Bauer einen Ziegel auf und legt ihn ins nächste Loch. ${a} Runden = ${a} geflickte Löcher, der Korb ist am Ende wieder leer.` };
    } },
  { id: 'k7_036', burg: 7, kap: 22, stufe: 2, art: 'zeile', frage: 'Vor dem Bauern: Ziegel, Loch, Ziegel, Loch. Der Korb ist leer. Alle Löcher sollen geflickt werden. Tippe die falsche Zeile an.',
    bild: () => '<div style="font-size:28px;text-align:center">🧑‍🌾🧱🕳️🧱🕳️</div>',
    code: 'for i in range(2):\n    forward()\n    pick_up()\n    forward()\n    pick_up()', fehler: [5],
    erkl: 'Auf dem Loch muss der Bauer den Ziegel hineinlegen: place() statt pick_up().', quelle: 'Spiel Burg 7 Kap. 22' },
  { id: 'k7_037', burg: 7, kap: 22, stufe: 3, art: 'wahl', frage: 'Der Bauer steht auf festem Boden (kein Loch) und macht place(). Was passiert?',
    optionen: ['Der Ziegel liegt jetzt falsch im Weg.', 'Nichts, der Ziegel bleibt im Korb.', 'Der Bauer sucht sich das nächste Loch.', 'Der Ziegel verschwindet einfach so.'],
    erkl: 'Der Ziegel liegt im Weg – die Aufgabe ist damit nicht geschafft. Der Bauer prüft nicht, ob ein Loch da ist – er macht genau, was dasteht. Darum muss dein Plan genau stimmen.', quelle: 'Spiel Burg 7 Kap. 22 (falsch gelegt = nicht geschafft)' },
  { id: 'k7_038', burg: 7, kap: 22, stufe: 3, art: 'eingabe', zahl: true, frage: 'Vor dem Bauern sind 6 Löcher hintereinander. Im Korb sind nur 4 Ziegel. In welcher Runde der Schleife geht es schief?',
    code: 'for i in range(6):\n    forward()\n    place()', antworten: ['5'],
    erkl: 'Nach 4 Runden ist der Korb leer. In Runde 5 soll der Bauer einen Ziegel legen, hat aber keinen mehr – der Befehl ist nicht ausführbar.', quelle: 'Spiel Burg 7 Kap. 22 · OPAL Kl. 7 lb3 10_algorithmus (ausführbar)' },

  // ============================== Kapitel 5: 📦 Variablen ==============================
  { id: 'k7_039', burg: 7, kap: 5, stufe: 1, art: 'wahl', frage: 'Was ist eine Variable?',
    optionen: ['ein Speicherplatz mit Namen, in dem ein Wert liegt', 'ein Befehl, der den Bauern ein Feld weiterbewegt', 'eine Zahl, die sich im Programm nie ändern kann', 'eine Schleife, die sich einen Namen gegeben hat'],
    erkl: 'Eine Variable ist wie eine beschriftete Schachtel (ein Container): Sie hat einen Namen und einen Inhalt, der sich ändern kann.', quelle: 'OPAL Kl. 7 lb3 12_variablen (Container)' },
  { id: 'k7_040', burg: 7, kap: 5, stufe: 1, art: 'zeile', frage: 'Einer Variable ihren ersten Wert geben heißt „initialisieren“. Tippe die Zeile an, in der ernte initialisiert wird.',
    code: 'ernte = 0\nfor i in range(3):\n    forward()\n    harvest()\n    ernte = ernte + 1\nprint(ernte)', fehler: [1],
    erkl: 'In Zeile 1 legt ernte = 0 die Kiste an und legt den ersten Wert 0 hinein. Zeile 5 ändert den Wert später nur – das ist kein Initialisieren mehr.', quelle: 'OPAL Kl. 7 lb3 12_variablen (Initialisierung)' },
  { id: 'k7_041', burg: 7, kap: 5, stufe: 2, art: 'mehr', frage: 'Kreuze alle erlaubten Variablennamen an.',
    optionen: ['ernte', 'zahl_1', 'klick_anzahl', '1zahl', 'meine zahl', '#punkte'], richtig: [0, 1, 2],
    erkl: 'Ein Name beginnt mit einem Buchstaben (oder _), hat keine Leerzeichen und keine Sonderzeichen. Als Trennzeichen nimmt man den Unterstrich.', quelle: 'OPAL Kl. 7 lb3 12_variablen (Benennungsregeln)' },
  { id: 'k7_042', burg: 7, kap: 5, stufe: 1, art: 'wahl', frage: 'Was macht die Zeile ernte = ernte + 1 ?',
    optionen: ['Sie nimmt den Wert aus ernte, zählt 1 dazu und legt ihn zurück.', 'Sie prüft, ob ernte und ernte + 1 gleich groß sind, und meldet das.', 'Sie legt eine zweite Kiste mit dem Namen ernte + 1 an.', 'Sie setzt ernte auf 1, egal was vorher drin war.'],
    erkl: 'Erst wird rechts gerechnet (alter Wert + 1), dann kommt das Ergebnis in die Kiste ernte. Der alte Wert wird dabei ersetzt.', quelle: 'OPAL Kl. 7 lb3 12_variablen (Inhalt ändern) · Spiel Burg 7 Kap. 5' },
  { id: 'k7_043', burg: 7, kap: 5, stufe: 1, art: 'eingabe', zahl: true, frage: 'Was gibt das Programm aus?',
    code: 'ernte = 5\nernte = 2\nprint(ernte)', antworten: ['2'],
    erkl: 'Ein neuer Wert ersetzt den alten – der alte Inhalt der Schachtel wird verworfen. Es wird nichts addiert.', quelle: 'OPAL Kl. 7 lb3 12_variablen (Inhalt ändern)' },
  { id: 'k7_044', burg: 7, kap: 5, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 7 lb3 12_variablen Aufgabe 2 (Klickzähler)',
    gen: (z) => {
      const s = z.int(0, 5), a = z.int(2, 6), d = z.int(2, 3);
      return { frage: 'Was gibt das Programm aus?', code: `punkte = ${s}\nfor i in range(${a}):\n    punkte = punkte + ${d}\nprint(punkte)`, antworten: [String(s + a * d)],
        erkl: `Start ${s}, dann ${a}-mal + ${d}: ${s} + ${a} · ${d} = ${s + a * d}.` };
    } },
  { id: 'k7_045', burg: 7, kap: 5, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 7 lb3 13_schleifen Aufgabe 1 (Countdown mit der Variable zeit)',
    gen: (z) => {
      const t = z.int(8, 15), a = z.int(2, 6);
      return { frage: 'Was gibt das Programm aus?', code: `zeit = ${t}\nfor i in range(${a}):\n    zeit = zeit - 1\nprint(zeit)`, antworten: [String(t - a)],
        erkl: `Der Countdown startet bei ${t} und zieht ${a}-mal 1 ab: ${t} − ${a} = ${t - a}.` };
    } },
  { id: 'k7_046', burg: 7, kap: 5, stufe: 2, art: 'wahl', frage: 'Was gibt dieses Programm aus?',
    code: 'ernte = 0\nfor i in range(3):\n    forward()\n    harvest()\n    ernte = ernte + 1\n    print(ernte)',
    optionen: ['1, 2, 3 (eine Zahl je Runde)', 'nur die 3 (einmal am Ende)', 'nur die 1 (einmal am Anfang)', '0, 1, 2 (eine Zahl je Runde)'],
    erkl: 'print(ernte) ist eingerückt und läuft in jeder Runde – nach dem Hochzählen. Soll nur das Ergebnis kommen, gehört print ohne Einrückung hinter die Schleife.', quelle: 'Spiel Burg 7 Kap. 5 · svp_7 SW 33 (Abläufe vorhersagen)' },
  { id: 'k7_047', burg: 7, kap: 5, stufe: 3, art: 'zeile', frage: 'Der Bauer erntet 4 Rüben. Das Programm soll 4 melden, meldet aber 1. Tippe die falsche Zeile an.',
    code: 'for i in range(4):\n    ernte = 0\n    forward()\n    harvest()\n    ernte = ernte + 1\nprint(ernte)', fehler: [2],
    erkl: 'ernte = 0 steht in der Schleife und setzt die Schachtel in jeder Runde wieder auf 0. Die Variable muss einmal VOR der Schleife initialisiert werden.', quelle: 'Spiel Burg 7 Kap. 5 (Die Erntekiste)' },
  { id: 'k7_048', burg: 7, kap: 5, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 7 Kap. 5 (Variable als Anzahl) · OPAL Kl. 7 lb3 13_schleifen (Variable gibt Anzahl der Wiederholungen an)',
    gen: (z) => {
      const s = z.int(2, 6);
      return { frage: 'Wie viele Schritte macht der Bauer insgesamt?', code: `seite = ${s}\nfor i in range(4):\n    for j in range(seite):\n        forward()\n    turn_right()`, antworten: [String(4 * s)],
        erkl: `Die innere Schleife läuft seite-mal, also ${s}-mal – und das für 4 Seiten: 4 · ${s} = ${4 * s}.` };
    } },
  { id: 'k7_049', burg: 7, kap: 5, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 7 Kap. 5 (Zwei Seitenlängen)',
    gen: (z) => {
      const b = z.int(3, 6), h = z.int(2, 4);
      return { frage: 'Was gibt das Programm aus?', code: `breite = ${b}\nhoehe = ${h}\nschritte = 0\nfor i in range(2):\n    for j in range(breite):\n        schritte = schritte + 1\n    for j in range(hoehe):\n        schritte = schritte + 1\nprint(schritte)`,
        antworten: [String(2 * (b + h))], erkl: `Eine äußere Runde zählt ${b} + ${h} = ${b + h}. Zwei Runden: 2 · ${b + h} = ${2 * (b + h)}.` };
    } },
  { id: 'k7_050', burg: 7, kap: 5, stufe: 3, art: 'wahl', frage: 'Warum schreibt man seite = 5 und dann range(seite) – statt gleich range(5)?',
    optionen: ['Wird das Beet größer, ändert man nur eine Zahl.', 'range(5) ist in Python verboten.', 'Mit einer Variable läuft der Bauer schneller.', 'Sonst zählt die Schleife ein Feld zu wenig oder zu viel.'],
    erkl: 'Die Variable gibt die Anzahl der Wiederholungen an. Wird sie an einer Stelle geändert, passen alle Schleifen, die sie benutzen.', quelle: 'OPAL Kl. 7 lb3 13_schleifen (Variablen zur Angabe der Wiederholungen)' },

  // ============================== Kapitel 141: 🃏 Der Bauer als Objekt ==============================
  { id: 'k7_051', burg: 7, kap: 141, stufe: 1, art: 'zuordnen', frage: 'Ordne jedem Begriff die passende Erklärung zu.',
    paare: [['Klasse', 'Bauplan für viele gleichartige Objekte'], ['Objekt', 'ein Exemplar nach dem Bauplan mit eigenen Werten'], ['Attribut', 'Eigenschaft, die einen Wert hat'], ['Methode', 'Befehl, den ein Objekt ausführen kann']],
    erkl: 'Die Klasse BAUER ist der Bauplan, dein bauer ist ein Objekt davon. richtung ist ein Attribut, forward() eine Methode.', quelle: 'OPAL Kl. 7 LK3 Aufgabe 1 (Musterlösung) · lb3 5_klassen_objekte' },
  { id: 'k7_052', burg: 7, kap: 141, stufe: 1, art: 'wahl', frage: 'Woran erkennst du eine Methode?',
    optionen: ['an den runden Klammern () nach dem Namen', 'am großen Anfangsbuchstaben des Namens', 'am Gleichheitszeichen nach dem Namen', 'am Doppelpunkt am Ende der Zeile'],
    erkl: 'Nach dem Namen einer Methode folgt immer „()“ – z. B. forward() oder füllfarbeSetzen(rot).', quelle: 'OPAL Kl. 7 lb3 7_methode_punknotation (Wichtig)' },
  { id: 'k7_053', burg: 7, kap: 141, stufe: 1, art: 'luecke', frage: 'So ist die Punktnotation aufgebaut. Fülle die Lücken.',
    text: '{}.{}(Attributwert)', luecken: [['objektname'], ['methode']], woerter: ['objektname', 'methode', 'klasse', 'attribut'],
    erkl: 'Erst das Objekt, dann ein Punkt, dann die Methode mit Klammern – z. B. dach.füllfarbeSetzen(rot).', quelle: 'OPAL Kl. 7 lb3 7_methode_punknotation (Merke Punktnotation)' },
  { id: 'k7_054', burg: 7, kap: 141, stufe: 2, art: 'wahl', frage: 'Das Objekt sonne der Klasse KREIS soll gelb gefüllt werden. Welche Anweisung ist richtig?',
    optionen: ['sonne.füllfarbeSetzen(gelb)', 'KREIS.füllfarbeSetzen(gelb)', 'füllfarbeSetzen.sonne(gelb)', 'sonne.gelb(füllfarbeSetzen)'],
    erkl: 'Die Methode wird am Objekt (sonne) aufgerufen, nicht an der Klasse. Der neue Attributwert steht in der Klammer.', quelle: 'OPAL Kl. 7 LK3 Aufgabe 3a' },
  { id: 'k7_055', burg: 7, kap: 141, stufe: 2, art: 'mehr', frage: 'Das ist die Klassenkarte BAUER. Kreuze alle Attribute an.',
    code: 'BAUER\n------------\nx\ny\nrichtung\nkorb\n------------\nforward()\nturn_right()\nharvest()',
    optionen: ['x', 'richtung', 'korb', 'forward()', 'BAUER', 'harvest()'], richtig: [0, 1, 2],
    erkl: 'Ganz oben steht der Klassenname, in der Mitte die Attribute, unten die Methoden (mit Klammern).', quelle: 'OPAL Kl. 7 lb3 6_klassenkarten_objektkarten' },
  { id: 'k7_056', burg: 7, kap: 141, stufe: 2, art: 'wahl', frage: 'Woran erkennst du eine Objektkarte – im Unterschied zur Klassenkarte?',
    optionen: ['an den abgerundeten Ecken und den Attributwerten', 'an den Methoden, die ganz unten auf der Karte stehen', 'am Klassennamen in Großbuchstaben oben', 'daran, dass sie gar keine Attribute hat'],
    erkl: 'Die Objektkarte hat abgerundete Ecken. Oben steht „objektname : KLASSE“, darunter jedes Attribut mit seinem Wert.', quelle: 'OPAL Kl. 7 lb3 6_klassenkarten_objektkarten · LK3 Aufgabe 2 (Erwartungsbild)' },
  { id: 'k7_057', burg: 7, kap: 141, stufe: 3, art: 'eingabe', zahl: true, frage: 'Der bauer hat x = 2 und schaut nach Osten (nach Osten wird x größer). Welchen Wert hat x nach diesen Anweisungen?',
    code: 'bauer.forward()\nbauer.forward()\nbauer.forward()\nbauer.turn_right()\nbauer.forward()', antworten: ['5'],
    erkl: 'Drei Schritte nach Osten: x = 5. Nach turn_right() schaut der Bauer nach Süden – der letzte Schritt ändert y, nicht x.', quelle: 'OPAL Kl. 7 lb3 8_objekte_verschieben · Spiel Burg 7 Kap. 141 (Punktnotation)' },
  { id: 'k7_058', burg: 7, kap: 141, stufe: 3, art: 'wahl', frage: 'Ein Zeichenprogramm bekommt die Klasse STERN. Warum eine Klasse – und nicht jeden Stern einzeln beschreiben?',
    optionen: ['Aus einem Bauplan entstehen viele Sterne mit eigenen Werten.', 'Damit es im ganzen Bild immer nur einen einzigen Stern geben kann.', 'Weil Sterne keine Attribute wie Farbe oder Größe haben.', 'Damit man die Sterne später nicht mehr verschieben kann.'],
    erkl: 'Aus dem Bauplan entstehen beliebig viele Sterne; jeder braucht nur eigene Attributwerte. Die Klasse legt einmal fest, welche Attribute und Methoden alle Sterne haben. Jedes Objekt bekommt dann nur noch seine Werte.', quelle: 'OPAL Kl. 7 LK3 Aufgabe 6b (Musterlösung)' },
  { id: 'k7_059', burg: 7, kap: 141, stufe: 1, art: 'luecke', frage: 'Fülle die Lücken zum Zustandsdiagramm.',
    text: 'Ein Zustandsdiagramm zeigt alle {} eines Objekts. Ein Pfeil ist ein {} zum nächsten Zustand. Er wird von einem {} ausgelöst.',
    luecken: [['Zustände'], ['Übergang'], ['Ereignis']], woerter: ['Zustände', 'Übergang', 'Ereignis', 'Methoden', 'Klasse'],
    erkl: 'Zustände (z. B. rot, grün), Übergänge (Pfeile) und das auslösende Ereignis (z. B. Knopfdruck) – dazu ein Startzustand.', quelle: 'svp_7 SW 15 (Zustandsdiagramme) · Lehrplan Kl. 7 LB 2' },
  { id: 'k7_060', burg: 7, kap: 141, stufe: 2, art: 'eingabe', frage: 'Eine Taschenlampe hat die Zustände „an“ und „aus“. Jeder Druck auf den Knopf wechselt den Zustand. Am Anfang ist sie aus. Wie ist sie nach 5 Drücken?',
    antworten: ['an'],
    erkl: 'aus → an → aus → an → aus → an: Nach einer ungeraden Zahl von Drücken ist sie an.', quelle: 'svp_7 SW 15 (Taschenlampe als Zustandsdiagramm)' },
  { id: 'k7_061', burg: 7, kap: 141, stufe: 3, art: 'eingabe', frage: 'Eine Ampel wechselt bei jedem weiter() so: rot → rotgelb → grün → gelb → rot … Sie ist gerade grün. Welche Farbe zeigt sie nach 3-mal weiter()?',
    antworten: ['rotgelb', 'rot-gelb', 'rot gelb', 'rot und gelb'],
    erkl: 'grün → gelb → rot → rotgelb. Das Attribut farbe hat immer einen der vier Zustände.', quelle: 'svp_7 SW 15 (Ampel) · Spiel Burg 7 Kap. 141 (Ampel am Burgtor)' },

  // ============================== Kapitel 2: ⌨️ Python tippen ==============================
  { id: 'k7_062', burg: 7, kap: 2, stufe: 1, art: 'wahl', frage: 'Was gehört in Python bei jedem Befehl wie forward dazu?',
    optionen: ['runde Klammern: forward()', 'ein Doppelpunkt: forward:', 'ein Punkt: forward.', 'nichts: forward'],
    erkl: 'Befehle (Methoden) bekommen immer runde Klammern – auch wenn nichts darin steht.', quelle: 'Spiel Burg 7 Kap. 2 (Merke „Python tippen“)' },
  { id: 'k7_063', burg: 7, kap: 2, stufe: 1, art: 'luecke', frage: 'Fülle die Lücken.',
    text: 'Die Zeile mit for endet mit einem {}. Die Befehle, die wiederholt werden, werden {}.',
    luecken: [['Doppelpunkt'], ['eingerückt']], woerter: ['Doppelpunkt', 'eingerückt', 'Semikolon', 'unterstrichen', 'Punkt'],
    erkl: 'for i in range(3): – der Doppelpunkt öffnet die Schleife. Was eingerückt darunter steht (4 Leerzeichen), gehört dazu.', quelle: 'Spiel Burg 7 Kap. 2' },
  { id: 'k7_064', burg: 7, kap: 2, stufe: 1, art: 'zeile', frage: 'Python meldet einen Fehler. Tippe die falsche Zeile an.',
    code: 'forward()\nharvest()\nturn_right\nforward()\nharvest()', fehler: [3],
    erkl: 'Bei turn_right fehlen die Klammern. Richtig ist turn_right().', quelle: 'Spiel Burg 7 Kap. 2' },
  { id: 'k7_065', burg: 7, kap: 2, stufe: 2, art: 'zeile', frage: 'Python meldet einen Fehler. Tippe die falsche Zeile an.',
    code: 'for i in range(3)\n    forward()\n    harvest()', fehler: [1],
    erkl: 'Am Ende der for-Zeile fehlt der Doppelpunkt: for i in range(3):', quelle: 'Spiel Burg 7 Kap. 2' },
  { id: 'k7_066', burg: 7, kap: 2, stufe: 2, art: 'zeile', frage: 'Python meldet einen Fehler. Tippe die falsche Zeile an.',
    code: 'for i in range(3):\nforward()\n    harvest()', fehler: [2],
    erkl: 'Nach dem Doppelpunkt muss die nächste Zeile eingerückt sein. forward() steht ganz links – Python erwartet hier eine Einrückung.', quelle: 'Spiel Burg 7 Kap. 2 (Einrückung)' },
  { id: 'k7_067', burg: 7, kap: 2, stufe: 3, art: 'zeile', frage: 'Python meldet einen Fehler. Tippe die falsche Zeile an.',
    code: 'ernte = 0\nfor i in range(2):\n    Forward()\n    harvest()\n    ernte = ernte + 1\nprint(ernte)', fehler: [3],
    erkl: 'Python unterscheidet Groß- und Kleinschreibung. Forward() kennt Python nicht – richtig ist forward().', quelle: 'OPAL Kl. 7 lb3 12_variablen (Groß- und Kleinschreibung beachten)' },
  { id: 'k7_068', burg: 7, kap: 2, stufe: 3, art: 'eingabe', frage: 'Was gibt das Programm aus?',
    code: 'ernte = 3\nprint("ernte")', antworten: ['ernte'],
    erkl: 'In Anführungszeichen steht ein Text – er wird genau so ausgegeben. Den Wert 3 bekommst du mit print(ernte) ohne Anführungszeichen.', quelle: 'Spiel Burg 7 Kap. 2/5 (print)' },
  { id: 'k7_069', burg: 7, kap: 2, stufe: 2, art: 'eingabe', zahl: true, frage: 'Was gibt das Programm aus?',
    code: 'korb = 10\nfor i in range(3):\n    forward()\n    harvest()\nkorb = korb - 3\nprint(korb)', antworten: ['7'],
    erkl: 'korb = korb - 3 ist nicht eingerückt und läuft nur einmal – nach der Schleife: 10 − 3 = 7.', quelle: 'Spiel Burg 7 Kap. 2/5 (Einrückung)' },

  // ============================== Neu (Didaktik-Prüfung 2026-11-13): mehr Fragen mit Zufallswerten ==============================
  { id: 'k7_070', burg: 7, kap: 3, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 7 Kap. 3 (Der Winkel) · svp_7 SW 33 (Abläufe vorhersagen)',
    gen: (z) => {
      const a = z.int(2, 5), b = z.int(2, 6);
      return { frage: 'Wie viele Schritte (forward) geht der Bauer insgesamt?', code: `for i in range(${a}):\n    forward()\n    forward()\nturn_right()\nfor i in range(${b}):\n    forward()`,
        antworten: [String(2 * a + b)], erkl: `Die erste Schleife macht ${a}-mal je 2 Schritte = ${2 * a}, die zweite ${b} Schritte: ${2 * a} + ${b} = ${2 * a + b}. turn_right() ist kein Schritt.` };
    } },
  { id: 'k7_071', burg: 7, kap: 2, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 7 Kap. 2 (Falsch eingerückt)',
    gen: (z) => {
      const a = z.int(3, 6), drin = z.wahl([true, false]);
      return { frage: 'Wie oft wird turn_right() ausgeführt?', code: `for i in range(${a}):\n    forward()\n    harvest()\n${drin ? '    ' : ''}turn_right()`,
        antworten: [String(drin ? a : 1)], erkl: drin ? `turn_right() ist eingerückt und gehört zur Schleife – es läuft in jeder der ${a} Runden.` : 'turn_right() steht ganz links und gehört nicht zur Schleife – es läuft nur einmal, nach der Schleife.' };
    } },
  { id: 'k7_072', burg: 7, kap: 22, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Spiel Burg 7 Kap. 22 (Erst sammeln, dann flicken)',
    gen: (z) => {
      const k = z.int(0, 4), a = z.int(2, 5), b = z.int(1, Math.min(5, k + a));
      return { frage: `Im Korb sind am Anfang ${k} Ziegel. Vor dem Bauern liegen erst ${a} lose Ziegel, dann ${b} Löcher. Wie viele Ziegel sind danach im Korb?`,
        code: `for i in range(${a}):\n    forward()\n    pick_up()\nfor i in range(${b}):\n    forward()\n    place()`, antworten: [String(k + a - b)],
        erkl: `${k} + ${a} aufgehoben − ${b} gelegt = ${k + a - b}.` };
    } },
  { id: 'k7_073', burg: 7, kap: 5, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 7 lb3 12_variablen (Inhalt ändern)',
    gen: (z) => {
      const s = z.int(1, 9), a = z.int(2, 5), d = z.int(2, 3);
      return { frage: 'Was gibt das Programm aus?', code: `x = ${s}\nfor i in range(${a}):\n    x = x + ${d}\nx = x - 1\nprint(x)`, antworten: [String(s + a * d - 1)],
        erkl: `${a}-mal + ${d} in der Schleife, danach einmal − 1: ${s} + ${a * d} − 1 = ${s + a * d - 1}.` };
    } },
  { id: 'k7_074', burg: 7, kap: 141, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL Kl. 7 lb3 8_objekte_verschieben · Spiel Burg 7 Kap. 141',
    gen: (z) => {
      const x = z.int(5, 9), n = z.int(2, 4);
      return { frage: `Der bauer hat x = ${x} und schaut nach Westen (nach Westen wird x kleiner). Welchen Wert hat x danach?`, code: Array(n).fill('bauer.forward()').join('\n'),
        antworten: [String(x - n)], erkl: `${n} Schritte nach Westen: ${x} − ${n} = ${x - n}.` };
    } },
  { id: 'k7_075', burg: 7, kap: 5, stufe: 3, art: 'zeile', frage: 'Das Programm soll melden, wie viele Rüben geerntet wurden. Es meldet aber 1, 2, 3 nacheinander. Tippe die falsche Zeile an.',
    code: 'ernte = 0\nfor i in range(3):\n    forward()\n    harvest()\n    ernte = ernte + 1\n    print(ernte)', fehler: [6],
    erkl: 'print(ernte) ist eingerückt und läuft in jeder Runde. Ganz nach links gerückt läuft es nur einmal – nach der Schleife.', quelle: 'Spiel Burg 7 Kap. 5 (Die Erntekiste)' },
);
