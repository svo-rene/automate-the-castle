'use strict';
// 🗝️ Kerker-Fragen Burg 9 – Quellen: OPAL INFO_SEK1 „Informatik Klasse 9 – GDP“ (lb1_informationenUndDaten: datenbank_begriffe,
// relationale_db, relationenmodell, erm_bestandteile, kardinalitaeten, sql_abfragen, sql_abfragen_2, crud, uebung_relationenmodell_sql;
// lb2_ki: uebersicht_ML, entscheidungsbaeume, bewertung_entscheidungsbaeume, reinforcement, sprachmodelle, ki_gesellschaft),
// Leistungskontrollen Kl. 9 (LK2 Datenbanken Modellierung, LK3 Datenbanken SQL, LK4 Künstliche Intelligenz), svp_9,
// Lehrplan Gymnasium Sachsen Informatik 2022 Kl. 9: LB 1 Informationen und Daten, LB 2 Künstliche Intelligenz.
// Kapitel: 11 Tabellen lesen · 12 WHERE · 13 Sortieren · 14 Zählen · 16 Daten ändern · 17–21 Späherturm (KI) · 144 Baupläne · 15 Gruppen und JOIN (nur Stufe 3).
// Alle SQL-Ergebnisse mit sqlite3 nachgerechnet. Tabellen im Bild über S1_titelTab (plus_sek1.js), nur beim Anzeigen aufgerufen.
KERKER_FRAGEN.push(
  // ============================== 11 📋 Tabellen lesen ==============================
  { id: 'k9_001', burg: 9, kap: 11, stufe: 1, art: 'wahl', frage: 'Welcher Teil einer SQL-Abfrage legt fest, welche Spalten (Attribute) im Ergebnis stehen?',
    optionen: ['SELECT', 'FROM', 'WHERE', 'ORDER BY'],
    erkl: 'Hinter SELECT stehen die Attribute, die angezeigt werden (* = alle). FROM nennt die Tabelle, WHERE filtert Datensätze.', quelle: 'OPAL Kl. 9 sql_abfragen (SELECT … FROM)' },
  { id: 'k9_002', burg: 9, kap: 11, stufe: 1, art: 'zuordnen', frage: 'Ordne jedem SQL-Baustein seine Aufgabe zu.',
    paare: [['SELECT', 'wählt die Attribute (Spalten) aus'], ['FROM', 'nennt die Tabelle'], ['WHERE', 'filtert die Datensätze (Zeilen)'], ['ORDER BY', 'sortiert das Ergebnis']],
    erkl: 'SELECT = welche Spalten, FROM = aus welcher Tabelle, WHERE = welche Zeilen, ORDER BY = in welcher Reihenfolge.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (Reihenfolge bei Abfragen)' },
  { id: 'k9_003', burg: 9, kap: 11, stufe: 1, art: 'luecke', frage: 'Ergänze die Abfrage: Sie soll Name und Art aller Monster zeigen.',
    text: '{} name, art {} monster', luecken: [['SELECT'], ['FROM']], woerter: ['SELECT', 'FROM', 'WHERE', 'TABLE', 'ORDER BY'],
    erkl: 'Erst SELECT mit den Spalten, dann FROM mit dem Namen der Tabelle.', quelle: 'OPAL Kl. 9 sql_abfragen (Abfrage mit Auswahl von Attributen)' },
  { id: 'k9_004', burg: 9, kap: 11, stufe: 1, art: 'eingabe', zahl: true, frage: 'Wie viele Spalten hat das Ergebnis dieser Abfrage?',
    code: 'SELECT *\nFROM waren', antworten: ['5'],
    bild: () => S1_titelTab('waren', ['id', 'ware', 'dorf', 'preis', 'menge'], [[1, 'Äpfel', 'Lindenhain', 2, 40], [2, 'Brot', 'Mühlbach', 3, 25], [3, 'Käse', 'Lindenhain', 5, 12], [4, 'Honig', 'Steinfeld', 6, 8], [5, 'Äpfel', 'Steinfeld', 2, 30], [6, 'Milch', 'Mühlbach', 1, 50], [7, 'Kohl', 'Lindenhain', 1, 18]]),
    erkl: 'SELECT * zeigt alle Attribute der Tabelle: id, ware, dorf, preis und menge – also 5 Spalten.', quelle: 'OPAL Kl. 9 sql_abfragen (SELECT *)' },
  { id: 'k9_005', burg: 9, kap: 11, stufe: 2, art: 'eingabe', zahl: true, frage: 'Welche Zahl steht im Ergebnis in der Zeile von Käse?',
    code: 'SELECT ware, preis * menge\nFROM waren', antworten: ['60'],
    bild: () => S1_titelTab('waren', ['id', 'ware', 'dorf', 'preis', 'menge'], [[1, 'Äpfel', 'Lindenhain', 2, 40], [2, 'Brot', 'Mühlbach', 3, 25], [3, 'Käse', 'Lindenhain', 5, 12], [4, 'Honig', 'Steinfeld', 6, 8], [5, 'Äpfel', 'Steinfeld', 2, 30], [6, 'Milch', 'Mühlbach', 1, 50], [7, 'Kohl', 'Lindenhain', 1, 18]]),
    erkl: 'In SELECT darf man rechnen: Für Käse ist preis · menge = 5 · 12 = 60.', quelle: 'Lehrplan Kl. 9 LB 1 (Abfragen); Spiel-Auftrag d5' },

  // ============================== 12 🔎 Filtern mit WHERE ==============================
  { id: 'k9_006', burg: 9, kap: 12, stufe: 1, art: 'wahl', frage: 'Was bewirkt WHERE in einer SELECT-Abfrage?',
    optionen: ['Es zeigt nur die Datensätze, für die die Bedingung stimmt.', 'Es löscht alle Datensätze, für die die Bedingung nicht stimmt.', 'Es wählt aus, welche Spalten angezeigt werden.', 'Es sortiert die Datensätze nach der Bedingung.'],
    erkl: 'WHERE ist ein Filter: Die Tabelle selbst bleibt unverändert, im Ergebnis stehen nur passende Datensätze. Gelöscht wird nur mit DELETE.', quelle: 'OPAL Kl. 9 sql_abfragen (Abfrage mit Filter)' },
  { id: 'k9_007', burg: 9, kap: 12, stufe: 1, art: 'wahl', frage: 'Welche Bedingung ist richtig geschrieben?',
    optionen: ["WHERE art = 'ork'", 'WHERE art = ork', "WHERE 'art' = ork", 'WHERE art = (ork)'],
    erkl: 'Textwerte stehen in SQL in einfachen Anführungszeichen, Attributnamen und Zahlen nicht.', quelle: 'OPAL Kl. 9 LK3 SQL (Hinweis: Textwerte in einfachen Anführungszeichen)' },
  { id: 'k9_008', burg: 9, kap: 12, stufe: 1, art: 'mehr', frage: 'Kreuze alle Monster an, die diese Abfrage liefert.',
    code: 'SELECT name\nFROM monster\nWHERE leben > 15',
    bild: () => S1_titelTab('monster', ['name', 'art', 'leben', 'tempo'], [['Flitz', 'ratte', 4, 1.9], ['Glibber', 'schleim', 16, 0.9], ['Heuler', 'wolf', 10, 1.5], ['Grummel', 'ork', 26, 0.95], ['Nebelchen', 'geist', 15, 1.3], ['Felsfuss', 'troll', 80, 0.65]]),
    optionen: ['Glibber', 'Grummel', 'Felsfuss', 'Nebelchen', 'Heuler'], richtig: [0, 1, 2],
    erkl: 'Mehr als 15 heißt: 15 selbst gehört nicht dazu. Nebelchen hat genau 15 Leben und fällt heraus.', quelle: 'OPAL Kl. 9 LK3 SQL Aufgabe 3 (Abfragen lesen)' },
  { id: 'k9_009', burg: 9, kap: 12, stufe: 2, art: 'eingabe', zahl: true, frage: 'Wie viele Datensätze liefert diese Abfrage?',
    code: "SELECT *\nFROM waren\nWHERE dorf = 'Lindenhain' AND preis < 3",
    bild: () => S1_titelTab('waren', ['id', 'ware', 'dorf', 'preis', 'menge'], [[1, 'Äpfel', 'Lindenhain', 2, 40], [2, 'Brot', 'Mühlbach', 3, 25], [3, 'Käse', 'Lindenhain', 5, 12], [4, 'Honig', 'Steinfeld', 6, 8], [5, 'Äpfel', 'Steinfeld', 2, 30], [6, 'Milch', 'Mühlbach', 1, 50], [7, 'Kohl', 'Lindenhain', 1, 18]]),
    antworten: ['2'], erkl: 'Bei AND müssen beide Bedingungen stimmen: aus Lindenhain UND billiger als 3 – das sind Äpfel (2) und Kohl (1). Käse kostet 5.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (Filter); Spiel-Auftrag d9' },
  { id: 'k9_010', burg: 9, kap: 12, stufe: 2, art: 'eingabe', zahl: true, frage: 'Wie viele Datensätze liefert diese Abfrage?',
    code: "SELECT *\nFROM waren\nWHERE dorf = 'Mühlbach' OR menge > 35",
    bild: () => S1_titelTab('waren', ['id', 'ware', 'dorf', 'preis', 'menge'], [[1, 'Äpfel', 'Lindenhain', 2, 40], [2, 'Brot', 'Mühlbach', 3, 25], [3, 'Käse', 'Lindenhain', 5, 12], [4, 'Honig', 'Steinfeld', 6, 8], [5, 'Äpfel', 'Steinfeld', 2, 30], [6, 'Milch', 'Mühlbach', 1, 50], [7, 'Kohl', 'Lindenhain', 1, 18]]),
    antworten: ['3'], erkl: 'Bei OR reicht eine Bedingung: Brot und Milch (Mühlbach) sowie Äpfel mit 40 Stück. Milch erfüllt beide – sie steht trotzdem nur einmal im Ergebnis.', quelle: 'OPAL Kl. 9 sql_abfragen_2; Spiel-Auftrag d10' },
  { id: 'k9_011', burg: 9, kap: 12, stufe: 1, art: 'zeile', frage: 'Die Abfrage soll alle Orks zeigen, liefert aber eine Fehlermeldung. Tippe die fehlerhafte Zeile an.',
    code: 'SELECT name, leben\nFROM monster\nWHERE art = ork', fehler: [3],
    erkl: "ork ist ein Textwert und muss in Anführungszeichen stehen: WHERE art = 'ork'. Ohne sie sucht SQL nach einer Spalte namens ork.", quelle: 'OPAL Kl. 9 LK3 SQL Aufgabe 2a' },
  { id: 'k9_012', burg: 9, kap: 12, stufe: 2, art: 'zeile', frage: 'Gesucht sind alle Waren, die höchstens 2 Taler kosten. Die Abfrage läuft, aber das Ergebnis ist falsch. Tippe die fehlerhafte Zeile an.',
    code: 'SELECT ware\nFROM waren\nWHERE preis < 2', fehler: [3],
    erkl: 'Höchstens 2 heißt „2 oder weniger“: preis <= 2. Mit < 2 fehlen alle Waren, die genau 2 kosten.', quelle: 'OPAL Kl. 9 sql_abfragen (Vergleiche); Merke Spiel-Auftrag d9' },
  { id: 'k9_013', burg: 9, kap: 12, stufe: 2, art: 'zeile', frage: 'Gesucht sind alle Ratten und alle Wölfe. Das Ergebnis ist leer. Tippe die fehlerhafte Zeile an.',
    code: "SELECT name\nFROM monster\nWHERE art = 'ratte' AND art = 'wolf'", fehler: [3],
    erkl: 'Kein Monster ist gleichzeitig Ratte UND Wolf. Es reicht, wenn eine Bedingung stimmt – also OR.', quelle: 'OPAL Kl. 9 sql_abfragen_2; Lehrplan Kl. 9 LB 1 (Abfragen)' },
  { id: 'k9_014', burg: 9, kap: 12, stufe: 1, art: 'luecke', frage: 'Ergänze: Die Abfrage soll alle Monster finden, deren Name mit G beginnt.',
    text: "SELECT name FROM monster WHERE name {} 'G{}'", luecken: [['LIKE'], ['%']], woerter: ['LIKE', '=', '%', '*', 'IS'],
    erkl: 'LIKE führt eine Mustersuche aus, % ist der Platzhalter für beliebig viele Zeichen. Mit = würde nur der Name „G%“ gefunden.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (LIKE mit Platzhalter %)' },
  { id: 'k9_015', burg: 9, kap: 12, stufe: 2, art: 'mehr', frage: 'Kreuze alle Namen an, die diese Abfrage liefert.',
    code: "SELECT name\nFROM monster\nWHERE name LIKE '%el%'",
    bild: () => S1_titelTab('monster', ['name', 'art', 'leben', 'tempo'], [['Flitz', 'ratte', 4, 1.9], ['Glibber', 'schleim', 16, 0.9], ['Heuler', 'wolf', 10, 1.5], ['Grummel', 'ork', 26, 0.95], ['Nebelchen', 'geist', 15, 1.3], ['Felsfuss', 'troll', 80, 0.65]]),
    optionen: ['Nebelchen', 'Felsfuss', 'Grummel', 'Heuler', 'Glibber'], richtig: [0, 1, 2],
    erkl: '%el% heißt: irgendwo im Namen steht „el“ – am Anfang, in der Mitte oder am Ende. Heuler enthält „le“, aber nicht „el“.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (Mustersuche); LK3 Aufgabe 6' },
  { id: 'k9_016', burg: 9, kap: 12, stufe: 3, art: 'wahl', frage: 'Gesucht sind alle Waren, die zwischen 2 und 5 Taler kosten (2 und 5 eingeschlossen). Welche Bedingung stimmt?',
    optionen: ['WHERE preis >= 2 AND preis <= 5', 'WHERE preis >= 2 OR preis <= 5', 'WHERE preis > 2 AND preis < 5', 'WHERE preis >= 2 AND <= 5'],
    erkl: 'Beide Grenzen müssen gelten – also AND, und „eingeschlossen“ heißt >= und <=. Mit OR passt jede Ware, und „AND <= 5“ ohne Attribut ist ein Syntaxfehler.', quelle: 'OPAL Kl. 9 sql_abfragen_2 Aufgabe 1 (Größe zwischen 1.85 m und 1.95 m)' },

  // ============================== 13 ↕️ Sortieren ==============================
  { id: 'k9_017', burg: 9, kap: 13, stufe: 1, art: 'wahl', frage: 'In welcher Reihenfolge sortiert ORDER BY preis, wenn nichts dahinter steht?',
    optionen: ['aufsteigend – der kleinste Preis zuerst', 'absteigend – der größte Preis zuerst', 'so, wie die Zeilen in der Tabelle stehen', 'alphabetisch nach dem Namen der Ware'],
    erkl: 'ASC (aufsteigend) ist die Standardeinstellung und kann weggelassen werden. Für absteigend schreibt man DESC.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (ASC ist Standard, DESC absteigend)' },
  { id: 'k9_018', burg: 9, kap: 13, stufe: 1, art: 'eingabe', frage: 'Welche Ware liefert diese Abfrage?',
    code: 'SELECT ware\nFROM waren\nORDER BY menge DESC\nLIMIT 1',
    bild: () => S1_titelTab('waren', ['id', 'ware', 'dorf', 'preis', 'menge'], [[1, 'Äpfel', 'Lindenhain', 2, 40], [2, 'Brot', 'Mühlbach', 3, 25], [3, 'Käse', 'Lindenhain', 5, 12], [4, 'Honig', 'Steinfeld', 6, 8], [5, 'Äpfel', 'Steinfeld', 2, 30], [6, 'Milch', 'Mühlbach', 1, 50], [7, 'Kohl', 'Lindenhain', 1, 18]]),
    antworten: ['Milch'], erkl: 'DESC sortiert die größte Menge nach oben (Milch, 50), LIMIT 1 behält nur diese erste Zeile.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (ORDER BY … DESC)' },
  { id: 'k9_019', burg: 9, kap: 13, stufe: 2, art: 'eingabe', frage: 'Welcher Name steht im Ergebnis an zweiter Stelle?',
    code: 'SELECT name\nFROM monster\nORDER BY leben DESC',
    bild: () => S1_titelTab('monster', ['name', 'art', 'leben', 'tempo'], [['Flitz', 'ratte', 4, 1.9], ['Glibber', 'schleim', 16, 0.9], ['Heuler', 'wolf', 10, 1.5], ['Grummel', 'ork', 26, 0.95], ['Nebelchen', 'geist', 15, 1.3], ['Felsfuss', 'troll', 80, 0.65]]),
    antworten: ['Grummel'], erkl: 'Absteigend nach Leben: Felsfuss (80), Grummel (26), Glibber (16) … An zweiter Stelle steht Grummel.', quelle: 'OPAL Kl. 9 LK3 SQL Aufgabe 2b (absteigend sortieren)' },
  { id: 'k9_020', burg: 9, kap: 13, stufe: 2, art: 'reihe', frage: 'Bring die Teile der Abfrage in die richtige Reihenfolge.',
    teile: ['SELECT ware, preis', 'FROM waren', "WHERE dorf = 'Mühlbach'", 'ORDER BY preis DESC', 'LIMIT 1'],
    erkl: 'Die Reihenfolge ist fest: SELECT – FROM – WHERE – ORDER BY. LIMIT steht ganz am Ende.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (Reihenfolge bei Abfragen mit SQL)' },
  { id: 'k9_021', burg: 9, kap: 13, stufe: 1, art: 'eingabe', zahl: true, frage: 'Wie viele Zeilen liefert diese Abfrage?',
    code: 'SELECT DISTINCT dorf\nFROM waren',
    bild: () => S1_titelTab('waren', ['id', 'ware', 'dorf', 'preis', 'menge'], [[1, 'Äpfel', 'Lindenhain', 2, 40], [2, 'Brot', 'Mühlbach', 3, 25], [3, 'Käse', 'Lindenhain', 5, 12], [4, 'Honig', 'Steinfeld', 6, 8], [5, 'Äpfel', 'Steinfeld', 2, 30], [6, 'Milch', 'Mühlbach', 1, 50], [7, 'Kohl', 'Lindenhain', 1, 18]]),
    antworten: ['3'], erkl: 'DISTINCT lässt doppelte Werte weg. Es gibt drei verschiedene Dörfer: Lindenhain, Mühlbach und Steinfeld.', quelle: 'Lehrplan Kl. 9 LB 1 (Abfragen); Spiel-Auftrag d15' },
  { id: 'k9_022', burg: 9, kap: 13, stufe: 3, art: 'wahl', frage: 'Gesucht sind die zwei billigsten Waren aus Lindenhain. Welche Abfrage liefert genau sie?',
    optionen: ["SELECT ware FROM waren WHERE dorf = 'Lindenhain' ORDER BY preis LIMIT 2", "SELECT ware FROM waren WHERE dorf = 'Lindenhain' ORDER BY preis DESC LIMIT 2", 'SELECT ware FROM waren ORDER BY preis LIMIT 2', "SELECT ware FROM waren WHERE dorf = 'Lindenhain' LIMIT 2 ORDER BY preis"],
    erkl: 'Erst filtern (WHERE), dann aufsteigend sortieren, dann abschneiden. DESC liefert die teuersten, ohne WHERE kommen Waren aus allen Dörfern, und LIMIT vor ORDER BY ist ein Syntaxfehler.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (Reihenfolge, Sortierung)' },

  // ============================== 14 🧮 Zählen und Rechnen ==============================
  { id: 'k9_023', burg: 9, kap: 14, stufe: 1, art: 'zuordnen', frage: 'Ordne jeder Aggregatfunktion zu, was sie liefert.',
    paare: [['COUNT(*)', 'Anzahl der Datensätze'], ['SUM(menge)', 'Summe aller Werte'], ['AVG(menge)', 'Durchschnitt'], ['MAX(menge)', 'größter Wert'], ['MIN(menge)', 'kleinster Wert']],
    erkl: 'Aggregatfunktionen fassen viele Datenwerte einer Spalte zu einem einzigen Wert zusammen.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (Aggregat-Funktionen); svp_9 SW 21' },
  { id: 'k9_024', burg: 9, kap: 14, stufe: 1, art: 'wahl', frage: 'Die Tabelle monster hat 6 Datensätze. Wie sieht das Ergebnis von SELECT COUNT(*) FROM monster aus?',
    optionen: ['eine einzige Zeile mit der Zahl 6', 'sechs Zeilen, in jeder steht eine 1', 'sechs Zeilen mit den Namen der Monster', 'die ganze Tabelle und darunter die Zahl 6'],
    erkl: 'COUNT(*) fasst alle Zeilen zu einer Zahl zusammen – das Ergebnis ist genau eine Zeile.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (COUNT)' },
  { id: 'k9_025', burg: 9, kap: 14, stufe: 1, art: 'eingabe', zahl: true, frage: 'Welche Zahl liefert die Abfrage?',
    code: "SELECT SUM(menge)\nFROM waren\nWHERE dorf = 'Lindenhain'",
    bild: () => S1_titelTab('waren', ['id', 'ware', 'dorf', 'preis', 'menge'], [[1, 'Äpfel', 'Lindenhain', 2, 40], [2, 'Brot', 'Mühlbach', 3, 25], [3, 'Käse', 'Lindenhain', 5, 12], [4, 'Honig', 'Steinfeld', 6, 8], [5, 'Äpfel', 'Steinfeld', 2, 30], [6, 'Milch', 'Mühlbach', 1, 50], [7, 'Kohl', 'Lindenhain', 1, 18]]),
    antworten: ['70'], erkl: 'Erst filtert WHERE die Waren aus Lindenhain (40, 12, 18), dann addiert SUM: 40 + 12 + 18 = 70.', quelle: 'OPAL Kl. 9 LK3 SQL Aufgabe 3b (erst filtern, dann zusammenfassen)' },
  { id: 'k9_026', burg: 9, kap: 14, stufe: 2, art: 'eingabe', zahl: true, frage: 'Welche Zahl liefert die Abfrage?',
    code: 'SELECT AVG(leben)\nFROM monster\nWHERE leben < 20',
    bild: () => S1_titelTab('monster', ['name', 'art', 'leben', 'tempo'], [['Flitz', 'ratte', 4, 1.9], ['Glibber', 'schleim', 16, 0.9], ['Heuler', 'wolf', 10, 1.5], ['Grummel', 'ork', 26, 0.95], ['Nebelchen', 'geist', 15, 1.3], ['Felsfuss', 'troll', 80, 0.65]]),
    antworten: ['11.25'], erkl: 'Unter 20 Leben: 4, 16, 10 und 15. Durchschnitt = (4 + 16 + 10 + 15) / 4 = 45 / 4 = 11,25.', quelle: 'Lehrplan Kl. 9 LB 1 (Aggregatfunktionen); svp_9 SW 21' },
  { id: 'k9_027', burg: 9, kap: 14, stufe: 3, art: 'eingabe', zahl: true, frage: 'Welche Zahl liefert die Abfrage?',
    code: 'SELECT MAX(preis)\nFROM waren\nWHERE menge > 20',
    bild: () => S1_titelTab('waren', ['id', 'ware', 'dorf', 'preis', 'menge'], [[1, 'Äpfel', 'Lindenhain', 2, 40], [2, 'Brot', 'Mühlbach', 3, 25], [3, 'Käse', 'Lindenhain', 5, 12], [4, 'Honig', 'Steinfeld', 6, 8], [5, 'Äpfel', 'Steinfeld', 2, 30], [6, 'Milch', 'Mühlbach', 1, 50], [7, 'Kohl', 'Lindenhain', 1, 18]]),
    antworten: ['3'], erkl: 'Mehr als 20 Stück haben Äpfel (2), Brot (3), Äpfel (2) und Milch (1). Davon ist 3 der größte Preis – Honig (6) fällt schon bei WHERE heraus.', quelle: 'OPAL Kl. 9 LK3 SQL Aufgabe 3b (MAX mit WHERE)' },
  { id: 'k9_028', burg: 9, kap: 14, stufe: 3, art: 'wahl', frage: 'Gesucht ist der NAME des Monsters mit dem meisten Leben. Welche Abfrage liefert ihn?',
    optionen: ['SELECT name FROM monster ORDER BY leben DESC LIMIT 1', 'SELECT MAX(leben) FROM monster', 'SELECT name, leben FROM monster ORDER BY leben LIMIT 1', 'SELECT name FROM monster ORDER BY name DESC LIMIT 1'],
    erkl: 'MAX(leben) liefert nur die Zahl, nicht den Namen. Ohne DESC steht das Monster mit den WENIGSTEN Leben oben, ORDER BY name sortiert nach dem Alphabet. Absteigend nach leben sortieren und LIMIT 1 liefert den Spitzenreiter.', quelle: 'OPAL Kl. 9 sql_abfragen_2 („genau überlegen, wonach man eigentlich sucht!“)' },
  { id: 'k9_029', burg: 9, kap: 14, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 9 LK3 SQL Aufgabe 3 (Abfragen lesen)',
    gen: (z) => {
      const m = [z.int(11, 20), z.int(1, 20), z.int(1, 20), z.int(1, 20)], f = ['Rüben', 'Kohl', 'Kürbis', 'Äpfel'];
      const tab = f.map((x, i) => `${x.padEnd(8)}| ${m[i]}`).join('\n'), gross = m.filter((x) => x > 10), s = gross.reduce((a, b) => a + b, 0);
      return { frage: 'Welche Zahl liefert die Abfrage für diese Tabelle korb?', code: `korb\nfrucht  | menge\n${tab}\n\nSELECT SUM(menge)\nFROM korb\nWHERE menge > 10`,
        antworten: [String(s)], erkl: `Nur die Mengen über 10 zählen: ${gross.join(' + ')} = ${s}.` };
    } },

  // ============================== 16 ✏️ Daten ändern ==============================
  { id: 'k9_030', burg: 9, kap: 16, stufe: 1, art: 'zuordnen', frage: 'CRUD: Ordne jeder Operation den passenden SQL-Befehl zu.',
    paare: [['Create (anlegen)', 'INSERT INTO … VALUES'], ['Read (lesen)', 'SELECT … FROM'], ['Update (ändern)', 'UPDATE … SET'], ['Delete (löschen)', 'DELETE FROM']],
    erkl: 'Die vier wichtigsten Operationen auf Daten heißen zusammen CRUD. Für jede gibt es einen eigenen SQL-Befehl.', quelle: 'OPAL Kl. 9 crud; LK3 SQL Aufgabe 1' },
  { id: 'k9_031', burg: 9, kap: 16, stufe: 1, art: 'luecke', frage: 'Ergänze: Eine neue Ware soll in die Tabelle waren eingetragen werden.',
    text: "{} waren {} (8, 'Eier', 'Mühlbach', 2, 30)", luecken: [['INSERT INTO'], ['VALUES']], woerter: ['INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'SELECT', 'FROM'],
    erkl: 'INSERT INTO tabelle VALUES (…) legt einen neuen Datensatz an; die Werte stehen in der Reihenfolge der Attribute.', quelle: 'OPAL Kl. 9 crud (INSERT INTO … VALUES); LK3 Aufgabe 4b' },
  { id: 'k9_032', burg: 9, kap: 16, stufe: 2, art: 'wahl', frage: 'Jemand führt UPDATE waren SET preis = 4 aus und vergisst WHERE. Was passiert?',
    optionen: ['Alle Waren kosten danach 4 Taler.', 'Nichts – ohne WHERE weiß SQL nicht, welche Zeile gemeint ist.', 'Nur die erste Ware kostet danach 4 Taler.', 'Es wird eine neue Ware mit dem Preis 4 angelegt.'],
    erkl: 'Ohne WHERE gilt die Änderung für jeden Datensatz der Tabelle. Darum ist die Bedingung bei UPDATE und DELETE so wichtig.', quelle: 'svp_9 SW 22 (Folgen fehlender oder falscher Bedingungen); OPAL Kl. 9 crud' },
  { id: 'k9_033', burg: 9, kap: 16, stufe: 2, art: 'eingabe', zahl: true, frage: 'Erst wird die Änderung ausgeführt, dann die Abfrage. Welche Zahl liefert die Abfrage?',
    code: "UPDATE waren\nSET menge = menge - 10\nWHERE ware = 'Äpfel';\n\nSELECT SUM(menge)\nFROM waren\nWHERE ware = 'Äpfel'",
    bild: () => S1_titelTab('waren', ['id', 'ware', 'dorf', 'preis', 'menge'], [[1, 'Äpfel', 'Lindenhain', 2, 40], [2, 'Brot', 'Mühlbach', 3, 25], [3, 'Käse', 'Lindenhain', 5, 12], [4, 'Honig', 'Steinfeld', 6, 8], [5, 'Äpfel', 'Steinfeld', 2, 30], [6, 'Milch', 'Mühlbach', 1, 50], [7, 'Kohl', 'Lindenhain', 1, 18]]),
    antworten: ['50'], erkl: 'Es gibt zwei Datensätze mit Äpfeln (40 und 30). Beide verlieren 10: 30 + 20 = 50.', quelle: 'OPAL Kl. 9 crud (UPDATE … SET … WHERE)' },
  { id: 'k9_034', burg: 9, kap: 16, stufe: 2, art: 'mehr', frage: 'Ein Netzwerk führt DELETE FROM kommentare WHERE text LIKE \'%blöd%\' aus. Kreuze alle Kommentare an, die gelöscht werden.',
    optionen: ['das ist blöd', 'gar nicht blöd, super!', 'blödelei macht spaß', 'tolles bild', 'doof'], richtig: [0, 1, 2],
    erkl: '%blöd% passt auf jeden Text, in dem „blöd“ irgendwo steht – auch in einem Lob oder als Teil eines anderen Wortes. „doof“ bleibt stehen.', quelle: 'OPAL Kl. 9 LK3 SQL Aufgabe 6a (automatisches Löschen)' },
  { id: 'k9_035', burg: 9, kap: 16, stufe: 3, art: 'wahl', frage: 'Beleidigende Kommentare sollen verschwinden. Welches Vorgehen ist am besten?',
    optionen: ["Erst mit SELECT … WHERE text LIKE '%blöd%' anzeigen, prüfen lassen, dann gezielt löschen.", "Sofort DELETE FROM kommentare WHERE text LIKE '%blöd%' ausführen – das ist am schnellsten.", "Erst UPDATE kommentare SET text = '' für alle ausführen, dann die leeren Zeilen löschen.", "DELETE FROM kommentare ohne WHERE – dann ist sicher nichts Beleidigendes mehr übrig."],
    erkl: 'Eine Mustersuche erkennt keinen Zusammenhang (Verneinungen, Lob) und DELETE ist nicht rückgängig zu machen. Darum erst anzeigen und prüfen.', quelle: 'OPAL Kl. 9 LK3 SQL Aufgabe 6c' },
  { id: 'k9_036', burg: 9, kap: 16, stufe: 3, art: 'zeile', frage: 'Nur Anna soll ein Jahr älter werden. Nach der Änderung sind aber mehrere Bauern älter. Tippe die fehlerhafte Zeile an.',
    code: "UPDATE bauern\nSET jahre = jahre + 1\nWHERE dorf = 'Lindenhain'", fehler: [3],
    erkl: "Die Bedingung trifft alle Bauern aus Lindenhain. Richtig wäre WHERE name = 'Anna' – noch sicherer WHERE id = 1 (Primärschlüssel).", quelle: 'svp_9 SW 22 (falsche Bedingungen); OPAL Kl. 9 crud' },

  // ============================== 144 🗺️ Baupläne des Archivs ==============================
  { id: 'k9_037', burg: 9, kap: 144, stufe: 1, art: 'zuordnen', frage: 'Ordne die Fachbegriffe einer Tabelle (Relation) zu.',
    paare: [['Attribut', 'eine Spalte, z. B. vorname'], ['Datensatz', 'eine Zeile, z. B. 2, Ben, 9b, 2010'], ['Datenwert', 'ein einzelner Eintrag, z. B. Mia'], ['Primärschlüssel', 'kennzeichnet jeden Datensatz eindeutig']],
    erkl: 'Spalte = Attribut, Zeile = Datensatz, Zelle = Datenwert. Der Primärschlüssel (unterstrichen) darf keinen Wert doppelt haben.', quelle: 'OPAL Kl. 9 LK2 Datenbanken Aufgabe 2; relationenmodell' },
  { id: 'k9_038', burg: 9, kap: 144, stufe: 1, art: 'zuordnen', frage: 'Wie wird was im ER-Modell gezeichnet?',
    paare: [['Entität', 'Rechteck'], ['Attribut', 'Ellipse'], ['Beziehung', 'Raute'], ['Primärschlüssel', 'unterstrichen']],
    erkl: 'So gilt es im Unterricht: Entität als Rechteck, Beziehung als Raute, Attribut als Ellipse, Primärschlüssel unterstrichen.', quelle: 'OPAL Kl. 9 erm_bestandteile; LK2 Datenbanken (Notation)' },
  { id: 'k9_039', burg: 9, kap: 144, stufe: 1, art: 'wahl', frage: 'Welches Attribut eignet sich als Primärschlüssel der Tabelle bestellungen?',
    bild: () => S1_titelTab('bestellungen', ['nummer', 'kunde', 'artikel', 'menge', 'bezahlt'], [['B1001', 'Max Mustermann', 'Laptop', 1, 'true'], ['B1002', 'Erika Muster', 'Smartphone', 2, 'false'], ['B1003', 'Hans Meier', 'Monitor', 1, 'false'], ['B1004', 'Lisa Schmidt', 'Tastatur', 3, 'true']]),
    optionen: ['nummer', 'kunde', 'menge', 'bezahlt'],
    erkl: 'Jede Bestellung hat eine eigene Nummer – sie ist eindeutig. Ein Kunde kann mehrmals bestellen, menge und bezahlt wiederholen sich.', quelle: 'OPAL Kl. 9 uebung_relationenmodell_sql Aufgabe 1' },
  { id: 'k9_040', burg: 9, kap: 144, stufe: 2, art: 'wahl', frage: 'Warum speichert man eine Telefonnummer wie 0351 8471230 als Text (varchar) und nicht als Ganzzahl (integer)?',
    optionen: ['Die führende 0 ginge verloren, und man rechnet nicht damit.', 'Ganzzahlen dürfen in Datenbanken höchstens sechs Ziffern haben.', 'Text braucht immer weniger Speicherplatz als eine Zahl.', 'Nach Text kann man sortieren, nach Zahlen dagegen nicht.'],
    erkl: 'Als Zahl würde aus 0351 die 351. Außerdem enthalten Telefonnummern oft + oder /, und man rechnet nicht mit ihnen.', quelle: 'OPAL Kl. 9 LK2 Datenbanken Aufgabe 3b' },
  { id: 'k9_041', burg: 9, kap: 144, stufe: 2, art: 'zuordnen', frage: 'Ordne jeder Beziehung ihre Kardinalität zu.',
    paare: [['Schüler – Abschlusszeugnis', '1:1'], ['Klasse – Schüler (Sek I)', '1:n'], ['Schüler – Kurs (Oberstufe)', 'n:m']],
    erkl: 'Ein Schüler hat ein Abschlusszeugnis (1:1). Eine Klasse hat viele Schüler, jeder Schüler gehört zu einer Klasse (1:n). Ein Kurs hat viele Schüler, ein Schüler hat viele Kurse (n:m).', quelle: 'OPAL Kl. 9 kardinalitaeten (Beispiele)' },
  { id: 'k9_042', burg: 9, kap: 144, stufe: 2, art: 'wahl', frage: 'Ein Verlag verlegt viele Bücher, jedes Buch stammt von genau einem Verlag. Wo steht der Fremdschlüssel?',
    optionen: ['in Buch: verlag_id↑', 'in Verlag: buch_id↑', 'in beiden Tabellen', 'in einer eigenen dritten Tabelle'],
    erkl: 'Bei 1:n kommt der Fremdschlüssel auf die n-Seite: Jedes Buch merkt sich seinen einen Verlag. Eine eigene Tabelle braucht nur n:m.', quelle: 'OPAL Kl. 9 LK2 Datenbanken Aufgabe 5; kardinalitaeten' },
  { id: 'k9_043', burg: 9, kap: 144, stufe: 3, art: 'eingabe', zahl: true, frage: 'Schulbibliothek: Ein Leser leiht viele Bücher aus, ein Buch wird von vielen Lesern ausgeliehen. Jedes Buch stammt von genau einem Verlag. Wie viele Tabellen braucht das Relationenmodell?',
    antworten: ['4'], erkl: 'Drei Tabellen für Leser, Buch und Verlag, dazu eine eigene Tabelle Ausleihe für die n:m-Beziehung mit zwei Fremdschlüsseln. Verlag–Buch (1:n) braucht nur verlag_id↑ in Buch.', quelle: 'OPAL Kl. 9 LK2 Datenbanken Aufgaben 4 und 5' },
  { id: 'k9_044', burg: 9, kap: 144, stufe: 3, art: 'mehr', frage: 'Eine Schule plant eine zentrale Datenbank mit Noten, Krankheitstagen mit Diagnosen, Adressen und Fotos. Kreuze alle Regeln an, die den Datenschutz verbessern.',
    optionen: ['Jede Lehrkraft sieht nur die Daten ihrer eigenen Klassen.', 'Diagnosen sehen nur Sekretariat und Schulleitung.', 'Jeder Zugriff wird protokolliert.', 'Alle Lehrkräfte bekommen ein gemeinsames Passwort.', 'Die Datenbank steht offen im Netz, damit Eltern schnell nachsehen können.'], richtig: [0, 1, 2],
    erkl: 'Rollen und Rechte, Datensparsamkeit und Protokollierung schützen. Ein gemeinsames Passwort oder ein offener Zugang machen Missbrauch leichter.', quelle: 'OPAL Kl. 9 LK2 Datenbanken Aufgabe 6; svp_9 SW 18 (Persönlichkeitsrechte)' },

  // ============================== 15 ⭐ Gruppen und JOIN (nur Stufe 3) ==============================
  { id: 'k9_045', burg: 9, kap: 15, stufe: 3, art: 'eingabe', zahl: true, frage: 'Welche Zahl steht im Ergebnis in der Zeile von Lindenhain?',
    code: 'SELECT dorf, COUNT(*)\nFROM waren\nGROUP BY dorf',
    bild: () => S1_titelTab('waren', ['id', 'ware', 'dorf', 'preis', 'menge'], [[1, 'Äpfel', 'Lindenhain', 2, 40], [2, 'Brot', 'Mühlbach', 3, 25], [3, 'Käse', 'Lindenhain', 5, 12], [4, 'Honig', 'Steinfeld', 6, 8], [5, 'Äpfel', 'Steinfeld', 2, 30], [6, 'Milch', 'Mühlbach', 1, 50], [7, 'Kohl', 'Lindenhain', 1, 18]]),
    antworten: ['3'], erkl: 'GROUP BY bildet für jedes Dorf eine Gruppe, COUNT(*) zählt in jeder Gruppe: Lindenhain 3, Mühlbach 2, Steinfeld 2.', quelle: 'OPAL Kl. 9 LK3 SQL Aufgabe 3a (GROUP BY lesen)' },
  { id: 'k9_046', burg: 9, kap: 15, stufe: 3, art: 'eingabe', zahl: true, frage: 'Welche Zahl steht im Ergebnis in der Zeile von Mühlbach?',
    code: 'SELECT dorf, SUM(menge)\nFROM waren\nGROUP BY dorf',
    bild: () => S1_titelTab('waren', ['id', 'ware', 'dorf', 'preis', 'menge'], [[1, 'Äpfel', 'Lindenhain', 2, 40], [2, 'Brot', 'Mühlbach', 3, 25], [3, 'Käse', 'Lindenhain', 5, 12], [4, 'Honig', 'Steinfeld', 6, 8], [5, 'Äpfel', 'Steinfeld', 2, 30], [6, 'Milch', 'Mühlbach', 1, 50], [7, 'Kohl', 'Lindenhain', 1, 18]]),
    antworten: ['75'], erkl: 'In der Gruppe Mühlbach stehen Brot (25) und Milch (50). SUM rechnet je Gruppe: 25 + 50 = 75.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (Grüppchenbildung); svp_9 SW 21' },
  { id: 'k9_047', burg: 9, kap: 15, stufe: 3, art: 'eingabe', frage: 'Welcher Name steht im Ergebnis zweimal?',
    code: 'SELECT bauern.name, ernte.frucht\nFROM ernte\nJOIN bauern ON ernte.bauer_id = bauern.id\nWHERE ernte.menge > 10',
    bild: () => `<div style="display:flex;flex-wrap:wrap;gap:12px">${S1_titelTab('bauern', ['<u>id</u>', 'name'], [[1, 'Anna'], [2, 'Bruno'], [3, 'Clara']])}${S1_titelTab('ernte', ['bauer_id↑', 'frucht', 'menge'], [[1, 'Rüben', 12], [2, 'Kohl', 5], [1, 'Kürbis', 14], [3, 'Rüben', 9], [2, 'Äpfel', 20]])}</div>`,
    antworten: ['Anna'], erkl: 'Mehr als 10: Rüben 12 und Kürbis 14 (beide bauer_id 1 = Anna) und Äpfel 20 (bauer_id 2 = Bruno). Anna steht also zweimal da.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (Primär- und Fremdschlüssel verknüpfen); svp_9 SW 23 (Verbund)' },
  { id: 'k9_048', burg: 9, kap: 15, stufe: 3, art: 'reihe', frage: 'Bring die Teile der Abfrage in die richtige Reihenfolge.',
    teile: ['SELECT dorf, SUM(menge)', 'FROM waren', 'WHERE preis < 5', 'GROUP BY dorf', 'ORDER BY SUM(menge) DESC'],
    erkl: 'Die Reihenfolge bei SQL-Abfragen ist immer SELECT – FROM – WHERE – GROUP BY – ORDER BY. Nicht benötigte Teile lässt man weg.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (Reihenfolge bei Abfragen mit SQL)' },
  { id: 'k9_049', burg: 9, kap: 15, stufe: 3, art: 'wahl', frage: 'Wozu dient beim Verbinden zweier Tabellen die Bedingung ON ernte.bauer_id = bauern.id?',
    optionen: ['Sie verbindet jede Ernte mit dem Bauern, dessen id in bauer_id steht.', 'Sie sortiert alle Ernten nach der Nummer des Bauern, der sie hat.', 'Sie löscht alle Ernten, deren Bauer es in der Tabelle nicht gibt.', 'Sie macht bauer_id zum neuen Primärschlüssel der Tabelle ernte.'],
    erkl: 'Der Fremdschlüssel bauer_id zeigt auf den Primärschlüssel id. ON legt fest, welche Zeilen zusammengehören – sonst würde jede Ernte mit jedem Bauern kombiniert.', quelle: 'OPAL Kl. 9 sql_abfragen_2 (Primär- und Fremdschlüssel); LK3 Aufgabe 5' },

  // ============================== 17 🔭 Freund oder Feind? Entscheidungsbaum ==============================
  { id: 'k9_050', burg: 9, kap: 17, stufe: 1, art: 'zuordnen', frage: 'Ordne die Teile eines Entscheidungsbaums zu.',
    paare: [['Wurzelknoten', 'oberster Knoten mit der ersten Frage'], ['innerer Knoten', 'eine weitere Frage (ein Test)'], ['Blatt', 'Endknoten mit der Entscheidung'], ['Zweig', 'Verbindung für eine mögliche Antwort']],
    erkl: 'Der Baum beginnt oben an der Wurzel, stellt an inneren Knoten Fragen, folgt den Zweigen je nach Antwort und endet in einem Blatt mit der Klasse.', quelle: 'OPAL Kl. 9 entscheidungsbaeume (Aufbau eines Entscheidungsbaums)' },
  { id: 'k9_051', burg: 9, kap: 17, stufe: 1, art: 'wahl', frage: 'Zu welcher Art des maschinellen Lernens gehört ein Entscheidungsbaum, der aus beschrifteten Beispielen („beißt“ / „beißt nicht“) gebaut wird?',
    optionen: ['überwachtes Lernen', 'unüberwachtes Lernen', 'bestärkendes Lernen', 'Expertensystem ohne Lernen'],
    erkl: 'Die Trainingsdaten haben Labels – zu jedem Beispiel ist die richtige Antwort bekannt. Das ist überwachtes Lernen.', quelle: 'OPAL Kl. 9 entscheidungsbaeume (Merke); Affenspiel' },
  { id: 'k9_052', burg: 9, kap: 17, stufe: 2, art: 'wahl', frage: 'Aus diesen Trainingsdaten soll ein möglichst kleiner Entscheidungsbaum werden. Welches Merkmal gehört in die Wurzel?',
    bild: () => S1_titelTab('Lebensmittel', ['Lebensmittel', 'Zucker', 'Fett', 'Klasse'], [['Apfel', 'niedrig', 'niedrig', 'gesund'], ['Schokolade', 'hoch', 'hoch', 'ungesund'], ['Nüsse', 'niedrig', 'hoch', 'gesund'], ['Limonade', 'hoch', 'niedrig', 'ungesund'], ['Karotte', 'niedrig', 'niedrig', 'gesund']]),
    optionen: ['Zucker', 'Fett', 'Lebensmittel (der Name)', 'egal – beide Merkmale sind nötig'],
    erkl: 'Zucker niedrig → immer gesund, Zucker hoch → immer ungesund. Fett wird gar nicht gebraucht (Nüsse: Fett hoch, aber gesund). Ein Baum mit Fett zuerst wäre korrekt, aber nicht minimal.', quelle: 'OPAL Kl. 9 LK4 Künstliche Intelligenz Aufgabe 3a; bewertung_entscheidungsbaeume' },
  { id: 'k9_053', burg: 9, kap: 17, stufe: 2, art: 'mehr', frage: 'Kreuze alle Monster an, die dieser Baum als frech einordnet.',
    code: 'Zeigt es Zähne?\n├─ ja → Ist es groß?\n│        ├─ ja   → 😠 frech\n│        └─ nein → 😊 friedlich\n└─ nein → 😊 friedlich',
    optionen: ['groß, rot, mit Zähnen', 'groß, grün, mit Zähnen', 'klein, rot, mit Zähnen', 'groß, rot, ohne Zähne'], richtig: [0, 1],
    erkl: 'Frech ist nur, wer Zähne zeigt UND groß ist. Die Farbe fragt der Baum gar nicht ab.', quelle: 'OPAL Kl. 9 entscheidungsbaeume (Beißende Affen); Spiel-Kapitel 17' },

  // ============================== 18 🧪 Stimmt mein Baum? ==============================
  { id: 'k9_054', burg: 9, kap: 18, stufe: 1, art: 'wahl', frage: 'Ein Späher wurde mit 100 Monster-Karten trainiert. Wie prüft man am besten, wie gut er wirklich ist?',
    optionen: ['mit Monstern, die nicht unter den 100 Karten waren', 'mit denselben 100 Karten noch einmal, nur gemischt', 'mit 50 der 100 Karten, die er am besten kennt', 'man zählt, wie viele Fragen sein Baum stellt'],
    erkl: 'Nur unbekannte Testdaten zeigen, ob das Modell verallgemeinert – also auch bei neuen Daten richtig entscheidet.', quelle: 'OPAL Kl. 9 bewertung_entscheidungsbaeume (Trainings- und Testdaten); LK4 Aufgabe 4a' },
  { id: 'k9_055', burg: 9, kap: 18, stufe: 1, art: 'wahl', frage: 'Ein Modell trifft auf den Trainingsdaten 100 %, auf den Testdaten nur 55 %. Wie heißt das Problem?',
    optionen: ['Overfitting', 'Underfitting', 'Verzerrung (Bias)', 'Clustering'],
    erkl: 'Overfitting heißt Überanpassung: Das Modell hat die Trainingsdaten mit allen Zufällen und Ausnahmen auswendig gelernt statt der allgemeinen Regel.', quelle: 'OPAL Kl. 9 LK4 Künstliche Intelligenz Aufgabe 4b' },
  { id: 'k9_056', burg: 9, kap: 18, stufe: 1, art: 'zuordnen', frage: 'Ordne die Begriffe zu.',
    paare: [['Trainingsdaten', 'daraus wird das Modell gebaut'], ['Testdaten', 'prüfen das Modell an Unbekanntem'], ['Overfitting', 'Modell zu komplex, Trainingsdaten auswendig gelernt'], ['Underfitting', 'Modell zu einfach, beschreibt auch die Trainingsdaten schlecht']],
    erkl: 'Ein gutes Modell liegt dazwischen. Es passt nie zu 100 %, weil Daten oft unvollständig oder verrauscht sind.', quelle: 'OPAL Kl. 9 bewertung_entscheidungsbaeume (Overfitting und Underfitting)' },
  { id: 'k9_057', burg: 9, kap: 18, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 9 bewertung_entscheidungsbaeume (Baum mit Testdaten bewerten)',
    gen: (z) => { const r = z.int(12, 19); return { frage: `Ein Entscheidungsbaum ordnet ${r} von 20 Testmonstern richtig ein. Wie viel Prozent sind das?`, antworten: [String(r * 5)], erkl: `${r} von 20 = ${r} : 20 = ${r * 5} %. Diese Trefferquote auf den Testdaten zählt – nicht die auf den Trainingsdaten.` }; } },

  // ============================== 19 ⚖️ Ungerechte Späher – Verzerrung ==============================
  { id: 'k9_058', burg: 9, kap: 19, stufe: 1, art: 'wahl', frage: 'Was bedeutet Verzerrung (Bias) bei einer KI?',
    optionen: ['Einseitige Trainingsdaten führen zu einer schiefen Regel.', 'Die KI hat mehr Testdaten als Trainingsdaten bekommen.', 'Der Entscheidungsbaum hat zu viele Fragen hintereinander.', 'Die KI rechnet mit gerundeten statt mit genauen Zahlen.'],
    erkl: 'Eine KI lernt nur, was in ihren Daten steckt. Sind die Daten einseitig, übernimmt sie diese Schieflage.', quelle: 'OPAL Kl. 9 ki_gesellschaft; svp_9 SW 31' },
  { id: 'k9_059', burg: 9, kap: 19, stufe: 2, art: 'wahl', frage: 'Eine KI sortiert Bewerbungen vor. Trainiert wurde sie mit den Einstellungen der letzten zehn Jahre – damals wurden überwiegend Männer eingestellt. Nun sortiert sie Frauen häufiger aus. Was ist die Ursache?',
    optionen: ['Sie hat alte, einseitige Entscheidungen aus den Daten übernommen.', 'Sie hatte zu wenige Testdaten, um sich selbst zu überprüfen.', 'Jemand hat ihr die Regel „Männer bevorzugen“ einprogrammiert.', 'Bewerbungen von Frauen waren für sie schwerer zu lesen.'],
    erkl: 'Das Modell lernt: Merkmale, die mit dem Geschlecht zusammenhängen, gingen früher mit Ablehnung einher – und wendet dieses Muster weiter an.', quelle: 'OPAL Kl. 9 LK4 Künstliche Intelligenz Aufgabe 6a' },
  { id: 'k9_060', burg: 9, kap: 19, stufe: 3, art: 'wahl', frage: 'Man entfernt das Merkmal „Geschlecht“ aus den Bewerbungsdaten. Warum ist das Problem damit nicht sicher gelöst?',
    optionen: ['Andere Merkmale wie der Vorname verraten das Geschlecht.', 'Ohne dieses Merkmal kann die KI gar nicht mehr lernen.', 'Die KI erinnert sich noch an die gelöschte Spalte.', 'Die Testdaten enthalten das Merkmal ja weiterhin.'],
    erkl: 'Andere Merkmale (Vorname, Vereine, Hobbys) hängen mit dem Geschlecht zusammen. Die Verzerrung schleicht sich darüber wieder ein.', quelle: 'OPAL Kl. 9 LK4 Künstliche Intelligenz Aufgabe 6c' },
  { id: 'k9_061', burg: 9, kap: 19, stufe: 2, art: 'mehr', frage: 'Kreuze alle Fälle an, in denen die Trainingsdaten einseitig (verzerrt) sind.',
    optionen: ['Eine Gesichtserkennung wurde fast nur mit Fotos von Menschen mit heller Haut trainiert.', 'Ein Spamfilter wurde nur mit englischen Mails trainiert und soll deutsche sortieren.', 'Ein Späher lernte mit gleich vielen Monstern jeder Art.', 'Eine Wetter-KI lernte mit Daten aus allen Jahreszeiten von 30 Jahren.'], richtig: [0, 1],
    erkl: 'Fehlen Gruppen in den Trainingsdaten oder sind sie viel seltener, entscheidet die KI für sie schlechter. Ausgewogene Daten mindern das.', quelle: 'OPAL Kl. 9 ki_gesellschaft (Warum kann eine KI diskriminierend werden?)' },

  // ============================== 20 ♟️ Bauernschach – bestärkendes Lernen ==============================
  { id: 'k9_062', burg: 9, kap: 20, stufe: 1, art: 'zuordnen', frage: 'Ordne die drei Arten des maschinellen Lernens zu.',
    paare: [['überwachtes Lernen', 'lernt aus beschrifteten Daten (mit Labels)'], ['unüberwachtes Lernen', 'findet in unbeschrifteten Daten selbst Gruppen'], ['bestärkendes Lernen', 'lernt durch Belohnung und Bestrafung']],
    erkl: 'Überwacht: richtige Antworten sind bekannt. Unüberwacht: keine Labels, z. B. Clustering. Bestärkend: ein Agent probiert Aktionen und bekommt Rückmeldung.', quelle: 'OPAL Kl. 9 supvervised, uebersicht_ML; LK4 Aufgabe 2' },
  { id: 'k9_063', burg: 9, kap: 20, stufe: 2, art: 'reihe', frage: 'Bring die Schritte des bestärkenden Lernens in die richtige Reihenfolge.',
    teile: ['Zustand erfassen', 'Aktion wählen und durchführen', 'Belohnung oder Bestrafung erhalten', 'Strategie anpassen und von vorn beginnen'],
    erkl: 'Der Roboter sieht die Stellung, zieht eine Perle (Aktion), erfährt Sieg oder Niederlage und legt Perlen dazu oder nimmt sie weg.', quelle: 'OPAL Kl. 9 uebersicht_ML (Schritte beim maschinellen Lernen); reinforcement' },
  { id: 'k9_064', burg: 9, kap: 20, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 9 reinforcement („Schlag den Roboter“)',
    gen: (z) => {
      const r = z.int(1, 5), b = z.int(2, 6), g = z.int(1, 5), sieg = z.wahl([true, false]), n = r + b + g + (sieg ? 1 : -1);
      return { frage: `In einer Schachtel liegen ${r} rote, ${b} blaue und ${g} grüne Perlen. Der Roboter zieht Blau – das war sein letzter Zug, und er ${sieg ? 'gewinnt' : 'verliert'}. Wie viele Perlen liegen danach in dieser Schachtel?`,
        antworten: [String(n)], erkl: `${sieg ? 'Sieg: Eine blaue Perle kommt dazu (Belohnung)' : 'Niederlage: Die blaue Perle wird entfernt (Bestrafung)'}. ${r + b + g} ${sieg ? '+' : '−'} 1 = ${n}.` };
    } },
  { id: 'k9_065', burg: 9, kap: 20, stufe: 2, art: 'wahl', frage: 'Die Spielregeln, nach denen die „KI“ beim Minischach fest zieht, nennt man Expertensystem. Warum gehört es nicht zum maschinellen Lernen?',
    optionen: ['Die Regeln stammen von Menschen; es lernt nichts dazu.', 'Es lernt durch Belohnung, nicht aus Beispielen.', 'Es braucht Trainingsdaten, die es nicht gibt.', 'Es kann nur rechnen, aber gar keine echten Spiele spielen.'],
    erkl: 'Expertensysteme sind ein eigener Teilbereich der KI: feste Wenn-dann-Regeln. Beim bestärkenden Lernen verändert sich das Verhalten durch Erfahrung.', quelle: 'OPAL Kl. 9 reinforcement („Klassische KI“ – Expertensystem)' },

  // ============================== 21 ✍️ Märchenmaschine – Sprachmodelle ==============================
  { id: 'k9_066', burg: 9, kap: 21, stufe: 1, art: 'wahl', frage: 'Wie bestimmt ein Sprachmodell wie GPT das nächste Wort?',
    optionen: ['Es wählt nach Wahrscheinlichkeiten, was auf den Text folgt.', 'Es schlägt im Lexikon nach und prüft, ob die Aussage stimmt.', 'Es wählt jedes Wort völlig zufällig aus allen Wörtern aus.', 'Es sucht im Internet einen Satz, der genau so anfängt.'],
    erkl: 'Das Modell hat aus sehr vielen Texten Wahrscheinlichkeiten gelernt und erzeugt Token für Token die wahrscheinlichen Fortsetzungen.', quelle: 'OPAL Kl. 9 sprachmodelle; LK4 Aufgabe 5a' },
  { id: 'k9_067', burg: 9, kap: 21, stufe: 2, art: 'mehr', frage: 'Sprachmodelle schreiben manchmal falsche Aussagen sehr überzeugend. Kreuze alle passenden Gründe an.',
    optionen: ['Sie erzeugen plausible Fortsetzungen und prüfen nicht, ob sie wahr sind.', 'In den Trainingstexten fehlen Informationen oder sie sind veraltet oder falsch.', 'Sie schauen nur auf einen begrenzten Teil des Textes zurück.', 'Sie lügen absichtlich, um Menschen zu ärgern.', 'Sie kopieren jede Antwort aus der Wikipedia.'], richtig: [0, 1, 2],
    erkl: 'Ein Sprachmodell versteht keine Inhalte, es rechnet mit Wahrscheinlichkeiten. Darum: Antworten immer prüfen.', quelle: 'OPAL Kl. 9 LK4 Künstliche Intelligenz Aufgabe 5b; sprachmodelle (Kritisch bleiben)' },
  { id: 'k9_068', burg: 9, kap: 21, stufe: 2, art: 'eingabe', zahl: true, frage: 'Eine Märchenmaschine hat nur diese vier Sätze gelesen. Mit welcher Wahrscheinlichkeit (in Prozent) folgt auf „der“ das Wort „hund“?',
    code: 'der hund bellt .\nder hund schläft .\nder vogel singt .\nder hund frisst .', antworten: ['75'],
    erkl: 'Auf „der“ folgt viermal ein Wort, davon dreimal „hund“: 3 von 4 = 75 %.', quelle: 'OPAL Kl. 9 sprachmodelle (SoekiaGPT, N-Gramme)' },
  { id: 'k9_069', burg: 9, kap: 21, stufe: 3, art: 'wahl', frage: 'ELIZA (1966) und ChatGPT führen beide Gespräche. Was ist der wichtigste Unterschied?',
    optionen: ['ELIZA folgt festen Regeln, GPT rechnet mit Wahrscheinlichkeiten.', 'GPT folgt festen Regeln, ELIZA rechnet mit Wahrscheinlichkeiten.', 'ELIZA versteht, was man meint, GPT ahmt es nur nach.', 'GPT sucht die Antworten im Internet, ELIZA in einem Buch.'],
    erkl: 'ELIZA ist ein regelbasiertes System. Moderne Sprachmodelle arbeiten mit neuronalen Netzen und Statistik – verstehen aber auch nichts.', quelle: 'OPAL Kl. 9 sprachmodelle (Von ELIZA zu ChatGPT)' },

  // ============================== KI: Lernaufgaben mit Zufallswerten (2026-11-13, Didaktik-Prüfung) ==============================
  { id: 'k9_070', burg: 9, kap: 17, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 9 entscheidungsbaeume (Baum anwenden); Spiel-Kapitel 17',
    gen: (z) => {
      const M = [['Zeigt es Zähne?', 'zeigt Zähne', 'zeigt keine Zähne'], ['Ist es rot?', 'ist rot', 'ist grün'], ['Ist es groß?', 'ist groß', 'ist klein'], ['Sind die Augen schmal?', 'hat schmale Augen', 'hat runde Augen']];
      const [a, b, c] = z.mische([0, 1, 2, 3]), L = [0, 1, 2, 3].map(() => z.wahl(['😠 frech', '😊 friedlich']));
      if (L.every((x) => x === L[0])) L[3] = L[0] === '😠 frech' ? '😊 friedlich' : '😠 frech';
      const m = [0, 1, 2, 3].map(() => z.wahl([true, false])), i = m[a] ? (m[b] ? 0 : 1) : (m[c] ? 2 : 3);
      const code = `${M[a][0]}\n├─ ja   → ${M[b][0]}\n│          ├─ ja   → ${L[0]}\n│          └─ nein → ${L[1]}\n└─ nein → ${M[c][0]}\n           ├─ ja   → ${L[2]}\n           └─ nein → ${L[3]}`;
      const zweite = m[a] ? b : c;
      return { frage: `Ein neues Monster ${[0, 1, 2, 3].map((k) => (m[k] ? M[k][1] : M[k][2])).join(', ')}. Was sagt der Baum: frech oder friedlich?`, code,
        antworten: [L[i].split(' ')[1], L[i]],
        erkl: `${M[a][0]} ${m[a] ? 'ja' : 'nein'} → ${M[zweite][0]} ${m[zweite] ? 'ja' : 'nein'} → ${L[i]}. Merkmale, nach denen der Baum auf diesem Weg nicht fragt, spielen keine Rolle.` };
    } },
  { id: 'k9_071', burg: 9, kap: 18, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 9 bewertung_entscheidungsbaeume (Baum mit Testdaten bewerten)',
    gen: (z) => {
      const [frage, ja, nein] = z.wahl([['Ist es groß?', 'groß', 'klein'], ['Zeigt es Zähne?', 'mit Zähnen', 'ohne Zähne'], ['Ist es rot?', 'rot', 'grün']]);
      const test = [0, 1, 2, 3, 4].map(() => [z.wahl([true, false]), z.wahl([true, false])]);   // [hat Merkmal, ist wirklich frech]
      const richtig = test.filter(([h, f]) => h === f).length;
      return { frage: `Der Späher-Baum fragt nur „${frage}“ – ja → 😠 frech, nein → 😊 friedlich. Wie viel Prozent der 5 Testmonster ordnet er richtig ein?`,
        code: test.map(([h, f], k) => `Testmonster ${k + 1}: ${h ? ja : nein}, in Wahrheit ${f ? '😠 frech' : '😊 friedlich'}`).join('\n'),
        antworten: [String(richtig * 20)], erkl: `Richtig sind die Monster, bei denen Merkmal und Wahrheit zusammenpassen: ${richtig} von 5 = ${richtig * 20} %.` };
    } },
  { id: 'k9_072', burg: 9, kap: 18, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 9 bewertung_entscheidungsbaeume (Overfitting erkennen); LK4 Aufgabe 4b',
    gen: (z) => {
      const [p, q] = z.mische(['Lina', 'Ben']), t1 = z.int(9, 13), tr2 = z.int(16, 18), t2 = z.int(15, 18);
      const zeilen = z.mische([`${p}: Training 20 von 20 richtig, Test ${t1} von 20 richtig`, `${q}: Training ${tr2} von 20 richtig, Test ${t2} von 20 richtig`]);
      return { frage: 'Zwei Lehrlinge haben Späher trainiert. Wessen Späher ist überangepasst (Overfitting)? Tippe den Namen ein.', code: zeilen.join('\n'),
        antworten: [p], erkl: `${p}s Späher kennt die Trainingsdaten perfekt, liegt bei neuen Monstern aber nur ${t1}-mal richtig – er hat Zufälle auswendig gelernt. ${q}s Späher ist bei neuen Monstern besser.` };
    } },
  { id: 'k9_073', burg: 9, kap: 19, stufe: 2, art: 'mehr', frage: 'In den Trainingsdaten eines Spähers kommen nur Ratten und Wölfe vor, Geister fehlen ganz. Kreuze alle Schritte an, die wirklich helfen.',
    optionen: ['Karten von Geistern (mit Label) zum Training dazunehmen', 'mit Testdaten prüfen, in denen auch Geister vorkommen', 'die Wolf-Karten doppelt in die Trainingsdaten legen', 'den Baum größer machen, ohne neue Daten'], richtig: [0, 1],
    erkl: 'Was nicht in den Daten steckt, kann die KI nicht lernen. Die fehlende Gruppe muss ins Training – und der Test muss zeigen, ob es nun klappt. Mehr vom Gleichen hilft nicht.', quelle: 'OPAL Kl. 9 ki_gesellschaft (Verzerrung vermeiden)' },
  { id: 'k9_074', burg: 9, kap: 19, stufe: 3, art: 'eingabe', zahl: true, tol: 1, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 9 ki_gesellschaft (Warum kann eine KI diskriminierend werden?)',
    gen: (z) => {
      const nh = z.int(8, 19) * 10, rh = nh - z.int(1, 5), rk = z.int(2, 5), p = Math.round(((rh + rk) / (nh + 10)) * 100);
      return { frage: `Eine Tier-KI erkennt auf den Testbildern ${rh} von ${nh} Hunden und ${rk} von 10 Katzen richtig. Wie viel Prozent aller Testbilder erkennt sie richtig? (gerundet)`,
        antworten: [String(p)], erkl: `(${rh} + ${rk}) von ${nh + 10} ≈ ${p} %. Das klingt gut – aber Katzen erkennt sie nur zu ${rk * 10} %. Eine seltene Gruppe geht in der Gesamtquote unter.` };
    } },
  { id: 'k9_075', burg: 9, kap: 20, stufe: 2, art: 'eingabe', zahl: true, tol: 0.5, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 9 reinforcement („Schlag den Roboter“)',
    gen: (z) => {
      const t = z.wahl([4, 5, 8, 10]), r = z.int(1, t - 2), b = z.int(1, t - r - 1), g = t - r - b;
      const [name, n] = z.wahl([['rot', r], ['blau', b], ['grün', g]]), p = (n / t) * 100;
      return { frage: `In einer Schachtel liegen ${r} rote, ${b} blaue und ${g} grüne Perlen. Der Roboter zieht blind eine. Mit wie viel Prozent Wahrscheinlichkeit ist sie ${name}?`,
        antworten: [String(p)], erkl: `${n} von ${t} Perlen sind ${name}: ${n} : ${t} = ${String(p).replace('.', ',')} %. Je mehr Perlen ein Zug hat, desto öfter wählt der Roboter ihn.` };
    } },
  { id: 'k9_076', burg: 9, kap: 21, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 9 sprachmodelle (SoekiaGPT, N-Gramme)',
    gen: (z) => {
      const [a, b] = z.mische(['katze', 'eule', 'ziege', 'maus']).slice(0, 2), na = z.int(1, 4), verben = ['schläft', 'singt', 'rennt', 'frisst', 'lacht'];
      const saetze = z.mische([...Array(na).fill(a), ...Array(5 - na).fill(b)]).map((x) => `die ${x} ${z.wahl(verben)} .`);
      return { frage: `Eine Märchenmaschine hat nur diese fünf Sätze gelesen. Mit welcher Wahrscheinlichkeit (in Prozent) schreibt sie nach „die“ das Wort „${a}“?`, code: saetze.join('\n'),
        antworten: [String(na * 20)], erkl: `Auf „die“ folgt fünfmal ein Wort, davon ${na}-mal „${a}“: ${na} von 5 = ${na * 20} %.` };
    } },
  { id: 'k9_077', burg: 9, kap: 21, stufe: 3, art: 'eingabe', zahl: true, tol: 1, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 9 sprachmodelle (Wahrscheinlichkeit einer Wortfolge)',
    gen: (z) => {
      const S = [...Array(4)].map(() => [z.wahl(['hund', 'vogel']), z.wahl(['schläft', 'singt', 'bellt'])]);
      const [w1, w2] = S[z.int(0, 3)], n1 = S.filter((s) => s[0] === w1).length, n2 = S.filter((s) => s[0] === w1 && s[1] === w2).length;
      const p = Math.round((n1 / 4) * (n2 / n1) * 100);
      return { frage: `Die Maschine kennt nur diese vier Sätze und beginnt mit „der“. Wie wahrscheinlich (in Prozent, gerundet) schreibt sie bei Temperatur 1 als Nächstes „${w1} ${w2}“?`,
        code: S.map(([a, b]) => `der ${a} ${b} .`).join('\n'), antworten: [String(p)],
        erkl: `P(${w1} | der) = ${n1}/4, P(${w2} | ${w1}) = ${n2}/${n1}. Beide Schritte müssen klappen, also malnehmen: ${n1}/4 · ${n2}/${n1} ≈ ${p} %.` };
    } },
);
