'use strict';
// --- 🗄️ Staatsarchiv: LK Datenmanagement (Burg 25, Lehrplan LB 9, OPAL-Kurs LK_INF_LB9 „Datenmanagement“) ---
// Eulalia aus Burg 9 ist inzwischen Staatsarchivarin. Kapitel: JOIN und GROUP BY → Subselects → Daten ändern (CRUD, CREATE TABLE)
// → Modellieren (ERM, Relationenmodell, Normalformen) → CSV und JSON mit Python → NoSQL und Datenlebenszyklus.
// SQL-Aufträge laufen über das Archiv (archiv.js, art 'sql') mit eigener Datenbank h.db (KOENIGREICH_DB, A/B verschieden).
// Python-Aufträge laufen über den Kornspeicher-Ablauf (warte + kontor) mit Dateien im Speicher (h.dateien, import csv/json, with open).

KAPITEL[70] = { name: 'Mehrere Tabellen: JOIN und GROUP BY', ico: '🔗' };
KAPITEL[71] = { name: 'Abfragen in Abfragen', ico: '🪆' };
KAPITEL[72] = { name: 'Daten anlegen und ändern', ico: '✏️' };
KAPITEL[73] = { name: 'Modellieren und Normalisieren', ico: '🧩' };
KAPITEL[74] = { name: 'CSV und JSON mit Python', ico: '📄' };
KAPITEL[75] = { name: 'NoSQL und Datenlebenszyklus', ico: '☁️' };
BURGEN[25] = { name: 'LK Daten', ico: '🗄️', klasse: 'LK', region: 'archiv', kapitel: [70, 71, 72, 73, 74, 75],
  text: 'Leistungskurs: JOIN, GROUP BY und HAVING, Subselects, INSERT/UPDATE/DELETE und CREATE TABLE, ER-Modell, Relationenmodell, Normalformen, CSV und JSON mit Python, NoSQL.' };

// --- Datenbank des Königreichs: Dörfer, Händler, Waren, Verkäufe (zwei Fassungen A/B mit verschiedenen Daten) ---
const KR_SCHEMA = {
  dorf: [['id', 'INTEGER PRIMARY KEY'], ['name', 'TEXT'], ['einwohner', 'INTEGER']],
  haendler: [['id', 'INTEGER PRIMARY KEY'], ['name', 'TEXT'], ['dorf_id', 'INTEGER']],
  ware: [['id', 'INTEGER PRIMARY KEY'], ['name', 'TEXT'], ['preis', 'REAL']],
  verkauf: [['id', 'INTEGER PRIMARY KEY'], ['haendler_id', 'INTEGER'], ['ware_id', 'INTEGER'], ['menge', 'INTEGER'], ['woche', 'INTEGER']],
};
const KR_A = {
  dorf: [[1, 'Lindenhain', 420], [2, 'Mühlbach', 310], [3, 'Steinfeld', 180], [4, 'Seedorf', 95]],
  haendler: [[1, 'Anna', 1], [2, 'Bruno', 1], [3, 'Clara', 2], [4, 'David', 3], [5, 'Ella', null], [6, 'Finn', 2], [7, 'Greta', 4], [8, 'Hugo', 6]],
  ware: [[1, 'Rüben', 2.5], [2, 'Kohl', 3.0], [3, 'Äpfel', 4.5], [4, 'Honig', 12.0], [5, 'Wolle', 8.0], [6, 'Kürbis', 6.0]],
  verkauf: [[1, 1, 1, 20, 1], [2, 1, 3, 10, 1], [3, 2, 2, 15, 1], [4, 3, 4, 3, 2], [5, 3, 1, 25, 2], [6, 4, 5, 6, 2],
    [7, 1, 4, 2, 3], [8, 6, 6, 8, 3], [9, 2, 1, 12, 3], [10, 3, 3, 14, 4], [11, 7, 2, 9, 4], [12, 1, 1, 18, 4]],
};
const KR_B = {
  dorf: [[1, 'Lindenhain', 455], [2, 'Mühlbach', 290], [3, 'Steinfeld', 205], [4, 'Seedorf', 120], [5, 'Felsenau', 260]],
  // Händler 8 heißt wie Händler 2 (zwei verschiedene Brunos) – wer nach dem Namen statt nach der id gruppiert, wirft sie zusammen
  haendler: [[1, 'Anna', 2], [2, 'Bruno', 1], [3, 'Clara', 2], [4, 'David', 3], [5, 'Ella', null], [6, 'Finn', 3], [7, 'Greta', 4], [8, 'Bruno', 5], [9, 'Ida', 6]],
  ware: [[1, 'Rüben', 3.0], [2, 'Kohl', 2.5], [3, 'Äpfel', 5.0], [4, 'Honig', 14.0], [5, 'Wolle', 7.5], [6, 'Kürbis', 6.5], [7, 'Käse', 9.0]],
  verkauf: [...KR_A.verkauf.map(([id, h, w, m, wo], i) => [id, h, w, m + ((i * 3) % 5) - 1, wo]), [13, 8, 7, 5, 4], [14, 2, 6, 4, 2], [15, 6, 3, 11, 1]],
};
const KOENIGREICH_DB = { schema: KR_SCHEMA, daten: (v) => (v === 'A' ? KR_A : KR_B) };
// Unnormalisierte Liste für „Normalisieren mit SQL“
const LISTE_DB = {
  schema: { liste: [['haendler', 'TEXT'], ['dorf', 'TEXT'], ['einwohner', 'INTEGER'], ['ware', 'TEXT'], ['menge', 'INTEGER']] },
  daten: (v) => ({ liste: v === 'A'
    ? [['Anna', 'Lindenhain', 420, 'Rüben', 20], ['Anna', 'Lindenhain', 420, 'Äpfel', 10], ['Bruno', 'Lindenhain', 420, 'Kohl', 15], ['Clara', 'Mühlbach', 310, 'Honig', 3], ['Clara', 'Mühlbach', 310, 'Rüben', 25], ['David', 'Steinfeld', 180, 'Wolle', 6]]
    : [['Anna', 'Mühlbach', 290, 'Rüben', 21], ['Bruno', 'Lindenhain', 455, 'Kohl', 14], ['Clara', 'Mühlbach', 290, 'Honig', 4], ['David', 'Steinfeld', 205, 'Wolle', 7], ['Hugo', 'Felsenau', 260, 'Käse', 5], ['Hugo', 'Felsenau', 260, 'Rüben', 9], ['Finn', 'Steinfeld', 205, 'Kürbis', 8]] }),
};

// Burgbibliothek für „Die Bibliothek“ (ed6): nur leser ist schon da, buch und ausleihe legen die Schüler an
const KONTOR_BIB = { schema: { leser: [['id', 'INTEGER PRIMARY KEY'], ['name', 'TEXT']] },
  daten: (v) => ({ leser: v === 'A' ? [[1, 'Lea'], [2, 'Tom'], [3, 'Mia']] : [[1, 'Ole'], [2, 'Ida'], [3, 'Ben']] }) };

const KR = (a) => AUFTRAG({ db: KOENIGREICH_DB, tabellen: ['haendler', 'dorf'], ...a });
const KR_LESEN = (a) => LESEN({ db: KOENIGREICH_DB, ...a });
// Bausteine nur als Schlüsselwörter (Didaktik-Prüfung 2026-11-13: ganze Zeilen verrieten die Lösung)
const KW = (...w) => w.map((x) => Q(x));
const Q_JOIN = KW('SELECT', 'FROM', 'INNER JOIN', 'LEFT JOIN', 'ON');
const Q_GROUP = KW('SELECT', 'COUNT(*)', 'FROM', 'GROUP BY', 'HAVING');
const Q_SUB = KW('SELECT', 'FROM', 'WHERE', '= (', 'IN (', 'NOT IN (', ')');

HOEFE.push(
  // --- Kapitel 70: 🔗 Mehrere Tabellen (Kurs 1.3–1.6) ---
  KR({ id: 'ea1', kapitel: 70, ico: '💰', titel: 'Die teuren Waren', lohn: 50, tabellen: ['ware'],
    ziel: 'Zeige Name und Preis aller Waren, die mehr als 5 Taler kosten – die teuerste zuerst.',
    story: 'Willkommen zurück! Aus dem kleinen Archiv ist das Staatsarchiv des Königreichs geworden: Dörfer, Händler, Waren und jeder einzelne Verkauf. Zum Warmwerden eine einfache Frage der Schatzmeisterin.',
    merke: { titel: '🗄️ Das Staatsarchiv', text: 'Die Datenbank hat vier Tabellen: dorf, haendler, ware und verkauf. Jede hat einen Primärschlüssel id. haendler.dorf_id, verkauf.haendler_id und verkauf.ware_id sind Fremdschlüssel: Sie verweisen auf die id einer anderen Tabelle. Jede Abfrage läuft auf zwei Archiven mit verschiedenen Daten.', code: 'SELECT name, einwohner\nFROM dorf\nWHERE einwohner < 300\nORDER BY name' },
    befehle: KW('SELECT', 'FROM', 'WHERE', 'ORDER BY', 'DESC'),
    tipps: ['Welche zwei Spalten, aus welcher Tabelle?', 'WHERE filtert die Zeilen, ORDER BY … DESC sortiert absteigend.', 'SELECT name, preis FROM ware WHERE … ORDER BY …'],
    loesung: 'SELECT name, preis FROM ware WHERE preis > 5 ORDER BY preis DESC' }),
  KR({ id: 'ea2', kapitel: 70, ico: '🧮', titel: 'Wie viele Verkäufe je Händler?', lohn: 60, tabellen: ['verkauf'],
    ziel: 'Zeige für jede haendler_id, wie oft sie verkauft hat – aber nur Händler mit mindestens 3 Verkäufen.',
    merke: { titel: '🧮 GROUP BY und HAVING', text: 'GROUP BY fasst alle Zeilen mit demselben Wert zu einer Gruppe zusammen; Aggregatfunktionen (COUNT, SUM, AVG, MIN, MAX) rechnen dann je Gruppe. WHERE filtert Zeilen VOR dem Gruppieren, HAVING filtert Gruppen DANACH – darum darf nur in HAVING eine Aggregatfunktion stehen.', code: 'SELECT ware_id, SUM(menge)\nFROM verkauf\nGROUP BY ware_id\nHAVING SUM(menge) > 20' },
    befehle: Q_GROUP,
    tipps: ['Gruppieren nach haendler_id, zählen mit COUNT(*).', 'Die Bedingung „mindestens 3“ betrifft die Gruppe – also HAVING, nicht WHERE.'],
    loesung: 'SELECT haendler_id, COUNT(*) FROM verkauf GROUP BY haendler_id HAVING COUNT(*) >= 3' }),
  KR({ id: 'ea3', kapitel: 70, ico: '🔗', titel: 'Wer wohnt wo?', lohn: 60,
    ziel: 'Zeige zu jedem Händler den Namen seines Dorfs (zwei Spalten: Händlername, Dorfname). Nimm einen INNER JOIN.',
    merke: { titel: '🔗 INNER JOIN', text: 'Ein JOIN verbindet zwei Tabellen über ein Spaltenpaar – meist Fremdschlüssel = Primärschlüssel. INNER JOIN behält nur Zeilen, die in beiden Tabellen einen Partner finden. Gibt es gleiche Spaltennamen, schreibt man tabelle.spalte.', code: 'SELECT ware.name, verkauf.menge\nFROM verkauf\nINNER JOIN ware ON verkauf.ware_id = ware.id' },
    muss: [/\bjoin\b/i, 'Hier geht es um JOIN: Verbinde haendler und dorf mit INNER JOIN … ON …'],
    befehle: Q_JOIN,
    tipps: ['FROM haendler INNER JOIN dorf ON …', 'Das Spaltenpaar: haendler.dorf_id = dorf.id', 'Beide Tabellen haben eine Spalte name: also haendler.name und dorf.name.'],
    loesung: 'SELECT haendler.name, dorf.name FROM haendler INNER JOIN dorf ON haendler.dorf_id = dorf.id' }),
  KR_LESEN({ id: 'ea3v', kapitel: 70, titel: 'Wer fällt beim JOIN heraus?', lohn: 55, tabellen: ['haendler', 'dorf'],
    ziel: 'Tippe in der Tabelle haendler alle Händler an, die dieser INNER JOIN liefert. Dann ✔ Prüfen.',
    lesen: { typ: 'zeilen', tabelle: 'haendler', soll: 'SELECT haendler.rowid FROM haendler INNER JOIN dorf ON haendler.dorf_id = dorf.id' },
    tipps: ['Nur wer ein dorf_id hat, das es in dorf gibt, findet einen Partner.', 'NULL ist mit keinem Wert gleich – auch nicht mit einer id.'],
    code: 'SELECT haendler.name, dorf.name\nFROM haendler\nINNER JOIN dorf ON haendler.dorf_id = dorf.id' }),
  KR({ id: 'ea4', kapitel: 70, ico: '🫂', titel: 'Niemand wird vergessen', lohn: 60,
    ziel: 'Wie eben – aber jetzt sollen ALLE Händler erscheinen, auch die ohne Dorf (dort steht dann nichts beim Dorf).',
    muss: [/\bleft\s+(outer\s+)?join\b/i, 'Alle Zeilen der linken Tabelle behält der LEFT JOIN.'],
    befehle: Q_JOIN,
    tipps: ['LEFT JOIN behält alle Zeilen der linken Tabelle (die nach FROM).', 'Findet ein Händler kein Dorf, steht dort NULL.'],
    loesung: 'SELECT haendler.name, dorf.name FROM haendler LEFT JOIN dorf ON haendler.dorf_id = dorf.id' }),
  KR({ id: 'ea5', kapitel: 70, ico: '🏆', titel: 'Wer hat den größten Umsatz?', lohn: 75, tabellen: ['verkauf', 'haendler', 'ware'],
    ziel: 'Zeige für jeden Händler mit Verkäufen seinen Namen und den Umsatz (Summe von menge · preis), der größte Umsatz zuerst. Nenne die Spalte umsatz. Vorsicht: Zwei verschiedene Händler können gleich heißen.',
    befehle: KW('SELECT', 'SUM()', 'AS', 'FROM', 'JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'DESC'),
    // Prüfhinweis (Didaktik-Nachprüfung): Wer nur nach dem Namen gruppiert, bekommt gezielt den Grund – kostet keinen Versuch
    muss: [/^(?![\s\S]*\bgroup\s+by\s+(haendler\.)?name\b\s*(order\b|having\b|limit\b|;|$))/i, 'Achtung: In Archiv B gibt es zwei verschiedene Händler mit dem Namen Bruno. Wer nach dem Namen gruppiert, wirft ihre Umsätze zusammen – gruppiere nach dem Schlüssel haendler.id.'],
    tipps: ['Drei Tabellen: verkauf in der Mitte, haendler und ware je mit einem JOIN dazu.', 'Gruppiere nach dem Schlüssel haendler.id – nicht nach dem Namen: Sonst landen zwei Händler mit gleichem Namen in einer Gruppe.', 'AS umsatz gibt der Spalte SUM(verkauf.menge * ware.preis) einen Namen – danach kann ORDER BY umsatz DESC sortieren.'],
    loesung: 'SELECT haendler.name, SUM(verkauf.menge * ware.preis) AS umsatz FROM verkauf JOIN haendler ON verkauf.haendler_id = haendler.id JOIN ware ON verkauf.ware_id = ware.id GROUP BY haendler.id ORDER BY umsatz DESC' }),
  KR({ id: 'ea6', kapitel: 70, ico: '🏘️', titel: 'Welches Dorf handelt am meisten?', lohn: 80, knobel: true, tabellen: ['verkauf', 'haendler', 'dorf'],
    ziel: 'Zeige für jedes Dorf die Zahl der verkauften Stücke (Summe von menge) – nur Dörfer mit mehr als 20 Stück, sortiert nach dem Dorfnamen.',
    tipps: ['verkauf → haendler → dorf: zwei JOINs hintereinander.', 'Gruppiere nach dem Schlüssel dorf.id, dann HAVING SUM(verkauf.menge) > 20.', 'ORDER BY dorf.name ganz am Ende.'],
    loesung: 'SELECT dorf.name, SUM(verkauf.menge) FROM verkauf JOIN haendler ON verkauf.haendler_id = haendler.id JOIN dorf ON haendler.dorf_id = dorf.id GROUP BY dorf.id HAVING SUM(verkauf.menge) > 20 ORDER BY dorf.name' }),

  // --- Kapitel 71: 🪆 Subselects (Kurs 1.19) ---
  KR({ id: 'eb1', kapitel: 71, ico: '🪆', titel: 'Die Händler aus Mühlbach', lohn: 60,
    ziel: 'Zeige die Namen aller Händler aus dem Dorf Mühlbach – ohne JOIN, mit einer Abfrage in der Abfrage. Die id von Mühlbach darfst du nicht hineinschreiben.',
    merke: { titel: '🪆 Subselect', text: 'Ein Subselect ist eine Abfrage in Klammern innerhalb einer anderen. Man liest von innen nach außen: Die innere Abfrage liefert einen Wert (oder eine Liste), der in die äußere eingesetzt wird. Liefert sie eine Liste, nimmt man IN bzw. NOT IN statt =.', code: "SELECT menge FROM verkauf\nWHERE ware_id = (\n    SELECT id FROM ware WHERE name = 'Kohl'\n)" },
    muss: [/\(\s*select\b/i, 'Hier ist ein Subselect gefragt: … WHERE dorf_id = (SELECT id FROM dorf WHERE …)'],
    befehle: Q_SUB,
    tipps: ['Erst die innere Abfrage allein: SELECT id FROM dorf WHERE name = \'Mühlbach\'', 'Dann in Klammern einsetzen: WHERE dorf_id = ( … )'],
    loesung: "SELECT name FROM haendler WHERE dorf_id = (SELECT id FROM dorf WHERE name = 'Mühlbach')" }),
  KR({ id: 'eb2', kapitel: 71, ico: '📈', titel: 'Teurer als der Durchschnitt', lohn: 60, tabellen: ['ware'],
    ziel: 'Zeige Name und Preis aller Waren, die teurer sind als der Durchschnittspreis aller Waren.',
    muss: [/\(\s*select\b/i, 'Den Durchschnitt rechnet ein Subselect aus: (SELECT AVG(preis) FROM ware)'],
    befehle: KW('SELECT', 'FROM', 'WHERE', 'AVG()', '(', ')'),
    tipps: ['AVG darf nicht direkt im WHERE stehen – aber in einem Subselect.', 'WHERE preis > (SELECT AVG(preis) FROM ware)'],
    loesung: 'SELECT name, preis FROM ware WHERE preis > (SELECT AVG(preis) FROM ware)' }),
  KR({ id: 'eb3', kapitel: 71, ico: '😴', titel: 'Wer hat nie verkauft?', lohn: 65, tabellen: ['haendler', 'verkauf'],
    ziel: 'Zeige die Namen aller Händler, die noch nie etwas verkauft haben.',
    muss: [/\(\s*select\b/i, 'Nimm ein Subselect: … WHERE id NOT IN (SELECT haendler_id FROM verkauf)'],
    befehle: Q_SUB,
    tipps: ['Die innere Abfrage liefert alle haendler_id, die in verkauf vorkommen – eine Liste.', 'Bei einer Liste: NOT IN statt <>.'],
    loesung: 'SELECT name FROM haendler WHERE id NOT IN (SELECT haendler_id FROM verkauf)' }),
  KR({ id: 'eb4', kapitel: 71, ico: '🥇', titel: 'Die meistverkaufte Ware', lohn: 85, knobel: true, tabellen: ['verkauf', 'ware'],
    ziel: 'Zeige Name und Gesamtmenge der Ware, von der insgesamt am meisten Stück verkauft wurden – ohne LIMIT, mit Subselect (bei Gleichstand alle).',
    muss: [/\(\s*select\b/i, 'Ohne LIMIT: Vergleiche die Summe mit dem größten Wert aus einem Subselect.'],
    tipps: ['Je Ware summieren: GROUP BY ware.id mit SUM(verkauf.menge) – gruppiert wird nach dem Schlüssel.', 'Die größte Summe: SELECT MAX(s) FROM (SELECT SUM(menge) AS s FROM verkauf GROUP BY ware_id)', 'HAVING SUM(verkauf.menge) = ( … )'],
    loesung: 'SELECT ware.name, SUM(verkauf.menge) FROM verkauf JOIN ware ON verkauf.ware_id = ware.id GROUP BY ware.id HAVING SUM(verkauf.menge) = (SELECT MAX(s) FROM (SELECT SUM(menge) AS s FROM verkauf GROUP BY ware_id))' }),

  // --- Kapitel 72: ✏️ Daten anlegen und ändern (Kurs 1.8, 1.11-1) ---
  KR({ id: 'ec1', kapitel: 72, ico: '➕', titel: 'Ein neuer Händler', lohn: 55, tabellen: ['haendler', 'dorf'], pruef: 'SELECT * FROM haendler',
    ziel: 'Karl zieht nach Steinfeld (dorf_id 3) und wird Händler. Trag ihn mit der id 10 ein.',
    merke: { titel: '✏️ Daten ändern (CRUD)', text: 'Create, Read, Update, Delete: INSERT INTO fügt Zeilen ein, SELECT liest, UPDATE … SET … WHERE ändert, DELETE FROM … WHERE löscht. Ohne WHERE treffen UPDATE und DELETE ALLE Zeilen – vorher mit SELECT und derselben Bedingung prüfen!', code: "INSERT INTO ware (id, name, preis)\nVALUES (8, 'Salz', 1.5)" },
    befehle: KW('INSERT INTO', 'VALUES', '(', ')'),
    tipps: ['INSERT INTO tabelle (spalten) VALUES (werte) – die Spalten von haendler stehen links in der Tabelle.', "Texte in einfachen Anführungszeichen: 'Karl'", 'Die Werte in derselben Reihenfolge wie die Spalten: 10, Name, dorf_id.'],
    loesung: "INSERT INTO haendler (id, name, dorf_id) VALUES (10, 'Karl', 3)" }),
  KR({ id: 'ec2', kapitel: 72, ico: '🍯', titel: 'Honig wird teurer', lohn: 55, tabellen: ['ware'], pruef: 'SELECT name, preis FROM ware',
    ziel: 'Der Honig wird um 10 % teurer. Ändere nur seinen Preis.',
    befehle: KW('UPDATE', 'SET', 'WHERE'),
    tipps: ['UPDATE ware SET preis = … WHERE …', '10 % mehr: der neue Preis ist der alte mal 1.1 – rechts vom = darf die Spalte selbst stehen.', 'Ohne WHERE würden ALLE Waren teurer.'],
    loesung: "UPDATE ware SET preis = preis * 1.1 WHERE name = 'Honig'" }),
  KR({ id: 'ec3', kapitel: 72, ico: '🗑️', titel: 'Die erste Woche streichen', lohn: 55, tabellen: ['verkauf'], pruef: 'SELECT COUNT(*), SUM(menge) FROM verkauf',
    ziel: 'Die Verkäufe aus Woche 1 waren nur Probeläufe. Lösch genau diese Zeilen.',
    befehle: KW('DELETE FROM', 'WHERE'),
    tipps: ['DELETE FROM tabelle WHERE bedingung', 'Prüf vorher mit SELECT * und derselben Bedingung, welche Zeilen verschwinden.', 'Die Woche steht in der Spalte woche.'],
    loesung: 'DELETE FROM verkauf WHERE woche = 1' }),
  KR({ id: 'ec4', kapitel: 72, ico: '🏗️', titel: 'Eine neue Tabelle: lager', lohn: 75, tabellen: ['ware'],
    pruef: 'SELECT ware.name, ware.preis, lager.menge FROM lager JOIN ware ON lager.ware_id = ware.id ORDER BY lager.id',
    ziel: 'Leg die Tabelle lager an: id (Primärschlüssel), ware_id (Fremdschlüssel auf ware), menge. Trag dann ein: Platz 1 = 30 Stück Honig (ware 4), Platz 2 = 200 Stück Rüben (ware 1).',
    befehle: KW('CREATE TABLE', 'INTEGER', 'PRIMARY KEY', 'REFERENCES', 'INSERT INTO', 'VALUES', ';'),
    tipps: ['CREATE TABLE lager (spalte TYP, spalte TYP, …); – je Spalte Name und Datentyp, getrennt durch Kommas.', 'Der Fremdschlüssel: ware_id INTEGER REFERENCES ware(id). Mehrere Anweisungen trennst du mit ;', 'Danach zwei INSERT INTO lager VALUES (…); – Reihenfolge wie die Spalten: id, ware_id, menge.'],
    loesung: 'CREATE TABLE lager (id INTEGER PRIMARY KEY, ware_id INTEGER REFERENCES ware(id), menge INTEGER);\nINSERT INTO lager VALUES (1, 4, 30);\nINSERT INTO lager VALUES (2, 1, 200)' }),
  // Fehler finden (Didaktik-Prüfung: UPDATE ohne WHERE, DELETE trotz Fremdschlüssel)
  KR({ id: 'ec5', kapitel: 72, ico: '🕵️', titel: 'Wer hat das Archiv zerstört?', lohn: 70, tabellen: ['verkauf', 'haendler', 'ware'],
    pruef: 'SELECT verkauf.id, haendler.name, ware.name, ware.preis FROM verkauf LEFT JOIN haendler ON verkauf.haendler_id = haendler.id JOIN ware ON verkauf.ware_id = ware.id ORDER BY verkauf.id',
    story: 'Gestern Abend hat der Lehrling ein Skript laufen lassen. Heute früh stimmen die Preise nicht mehr, und zu manchen Verkäufen gibt es keinen Händler. Zum Glück haben wir eine Sicherung – lass das Skript berichtigt noch einmal laufen.',
    ziel: 'Der Auftrag war: Kohl wird 0,50 Taler teurer, und Finn (id 6) hört auf – seine Verkäufe übernimmt Clara (id 3). Das Skript des Lehrlings steht im Editor. Finde die zwei Fehler und berichtige es.',
    vorlage: 'UPDATE ware SET preis = preis + 0.5;\nDELETE FROM haendler WHERE id = 6',
    befehle: KW('UPDATE', 'SET', 'WHERE', 'DELETE FROM', ';'),
    tipps: ['Lass das Skript erst einmal laufen und vergleiche dein Ergebnis mit dem Soll: Welche Preise und welche Händler stimmen nicht?', 'Ein UPDATE ohne WHERE trifft ALLE Zeilen. Und wer gelöscht wird, auf den dürfen keine Fremdschlüssel mehr zeigen (referentielle Integrität).', 'Vor dem DELETE: UPDATE verkauf SET haendler_id = 3 WHERE haendler_id = 6;'],
    loesung: "UPDATE ware SET preis = preis + 0.5 WHERE name = 'Kohl';\nUPDATE verkauf SET haendler_id = 3 WHERE haendler_id = 6;\nDELETE FROM haendler WHERE id = 6" }),
);

// --- Kapitel 73 und 74: Kornspeicher-Ablauf (Fragen, Python mit Dateien) ---
const S_DATEI = [...S_LK, 'dateien'];
const KONTOR = (a) => KORN({ warte: true, kontor: true, zielArt: 'wert', funktion: null, sprache: S_DATEI, ...a });
const KFRAGEN = (a) => KONTOR({ sortArt: 'fragen', listen: [], ...a });
const kBild = (html) => `<div class="werkbild dsbild kbild">${html}</div>`;
const kTab = (cols, rows, titel = '', pk = [], fk = []) => `<div class="dbtab"><div class="dbtitel">${titel}</div><div class="dbscroll"><table>
  <tr>${cols.map((c) => `<th>${pk.includes(c) ? `<u>${c}</u>` : fk.includes(c) ? `↑${c}` : c}</th>`).join('')}</tr>
  ${rows.map((z) => `<tr>${z.map((v) => `<td>${v === null ? '–' : esc(String(v))}</td>`).join('')}</tr>`).join('')}</table></div></div>`;
const dateiBild = (name, text) => `<div class="dsdatei"><div class="dbtitel">📄 ${esc(name)}</div><pre class="mono">${esc(text)}</pre></div>`;
// ER-Diagramm (Chen-Notation): Rechtecke = Entitätstypen, Rauten = Beziehungen, Ovale = Attribute (Schlüssel unterstrichen)
function svgErm() {
  const ent = (x, y, t) => `<rect x="${x - 46}" y="${y - 16}" width="92" height="32" fill="#fdf8e8" stroke="#3a2c10" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="700">${t}</text>`;
  const bez = (x, y, t) => `<polygon points="${x - 48},${y} ${x},${y - 22} ${x + 48},${y} ${x},${y + 22}" fill="#e8f0ff" stroke="#2c3d78" stroke-width="2"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11">${t}</text>`;
  const att = (x, y, t, pk) => `<ellipse cx="${x}" cy="${y}" rx="30" ry="12" fill="#fff" stroke="#7a5a3a"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10" ${pk ? 'text-decoration="underline"' : ''}>${t}</text>`;
  const l = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5a3a1f" stroke-width="1.5"/>`;
  const k = (x, y, t) => `<text x="${x}" y="${y}" font-size="13" font-weight="700" fill="#b8402e">${t}</text>`;
  return `<svg class="dssvg" viewBox="0 0 440 245" style="max-width:640px" font-family="system-ui">
    ${l(70, 45, 28, 14)}${l(70, 45, 112, 14)}${l(70, 180, 28, 228)}${l(70, 180, 112, 228)}${l(225, 180, 195, 128)}${l(225, 180, 258, 128)}${l(375, 180, 342, 128)}${l(375, 180, 408, 128)}
    ${l(70, 61, 70, 90)}${l(70, 134, 70, 164)}${l(116, 180, 177, 180)}${l(273, 180, 329, 180)}
    ${att(28, 14, 'id', true)}${att(112, 14, 'name')}${att(28, 228, 'id', true)}${att(112, 228, 'name')}${att(195, 128, 'menge')}${att(258, 128, 'woche')}${att(342, 128, 'id', true)}${att(408, 128, 'preis')}
    ${ent(70, 45, 'Dorf')}${bez(70, 112, 'wohnt in')}${ent(70, 180, 'Händler')}${bez(225, 180, 'verkauft')}${ent(375, 180, 'Ware')}
    ${k(78, 82, '1')}${k(78, 160, 'n')}${k(124, 174, 'n')}${k(312, 174, 'm')}</svg>`;
}
// Zeiten ein-, zwei- und dreistellig (Didaktik-Prüfung): Als Text verglichen ist "105" < "9" – wer nicht umwandelt, fällt auf
const RENNEN_A = 'Name;Station;Zeit;Dorf\nAnna;Nordtor;42;Lindenhain\nBen;Mühle;105;Mühlbach\nClara;Brücke;40;Mühlbach\nDavid;Nordtor;39;Lindenhain\nEva;See;44;Steinfeld\nFinn;Mühle;9;Lindenhain\n';
const RENNEN_B = 'Name;Station;Zeit;Dorf\nGreta;See;51;Seedorf\nHugo;Brücke;8;Mühlbach\nIda;Nordtor;49;Mühlbach\nJonas;Mühle;112;Steinfeld\nKaja;See;53;Seedorf\n';
const MESS_A = 'Stunde,Temperatur\n1,12.5\n2,13.0\n3,N/A\n4,14.5\n5,\n6,15.0\n7,13.5\n';
const MESS_B = 'Stunde,Temperatur\n1,8.0\n2,N/A\n3,N/A\n4,9.5\n5,10.5\n6,\n';
const WETTER = { ort: 'Burg', tage: [{ datum: '2026-11-09', temperaturen: [4, 7, 9, 6] }, { datum: '2026-11-10', temperaturen: [5, 11, 12, 8] }, { datum: '2026-11-11', temperaturen: [2, 3, 5, 4] }] };
const WETTER_B = { ort: 'Seedorf', tage: [{ datum: '2026-12-01', temperaturen: [-2, 1, 3] }, { datum: '2026-12-02', temperaturen: [0, 4, 6, 2] }] };
const VERKAEUFE_CSV = 'Haendler;Dorf;Ware;Menge;Preis\nAnna;Lindenhain;Rüben;20;2.50\nBruno;Lindenhain;Kohl;15;3.00\nClara;Mühlbach;Honig;3;12.00\nClara;Mühlbach;Rüben;25;2.50\nDavid;Steinfeld;Wolle;6;8.00\nFinn;Mühlbach;Kürbis;8;6.00\n';
const VERKAEUFE_B_CSV = 'Haendler;Dorf;Ware;Menge;Preis\nGreta;Seedorf;Honig;4;12.00\nHugo;Felsenau;Käse;5;9.00\nHugo;Felsenau;Rüben;30;2.50\nIda;Mühlbach;Kohl;12;3.00\nJonas;Steinfeld;Wolle;9;8.00\nJonas;Steinfeld;Rüben;14;2.50\n';
const KONTOR_DATEIEN = { 'rennen.csv': RENNEN_A, 'rennen_b.csv': RENNEN_B, 'messung.csv': MESS_A, 'messung_b.csv': MESS_B,
  'wetter.json': JSON.stringify(WETTER, null, 2), 'wetter_b.json': JSON.stringify(WETTER_B, null, 2), 'verkaeufe.csv': VERKAEUFE_CSV, 'verkaeufe_b.csv': VERKAEUFE_B_CSV };
// Dieselben Verkäufe als Tabelle (SQL oder Python? – ef3/ef3p)
const KONTOR_VK = { schema: { verkaeufe: [['haendler', 'TEXT'], ['dorf', 'TEXT'], ['ware', 'TEXT'], ['menge', 'INTEGER'], ['preis', 'REAL']] },
  daten: (v) => ({ verkaeufe: csvZeilen(v === 'A' ? VERKAEUFE_CSV : VERKAEUFE_B_CSV).map((r) => [r.Haendler, r.Dorf, r.Ware, +r.Menge, +r.Preis]) }) };
const mengeJeDorf = (t, min) => { const d = {}; for (const r of csvZeilen(t)) d[r.Dorf] = (d[r.Dorf] || 0) + +r.Menge; return Object.keys(d).sort().filter((k) => d[k] >= min).map((k) => [k, d[k]]); };
// richtige Ergebnisse in JS ausrechnen
const csvZeilen = (t, trenn = ';') => { const [kopf, ...z] = t.trim().split('\n'); const k = kopf.split(trenn); return z.map((l) => Object.fromEntries(l.split(trenn).map((v, i) => [k[i], v]))); };
const rund = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const schnellster = (t) => csvZeilen(t).reduce((a, b) => (+b.Zeit < +a.Zeit ? b : a)).Name;
const schnitt = (t, dorf) => { const z = csvZeilen(t).filter((r) => r.Dorf === dorf).map((r) => +r.Zeit); return z.length ? rund(z.reduce((a, b) => a + b, 0) / z.length) : 0; };
const gueltige = (t) => csvZeilen(t, ',').map((r) => r.Temperatur).filter((v) => v !== 'N/A' && v.trim() !== '').map(Number);

HOEFE.push(
  KFRAGEN({ id: 'ed1', kapitel: 73, ico: '🧩', titel: 'Das ER-Modell lesen', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'ER-Modell des Handels',
    tabelle: () => ({ html: kBild(`${svgErm()}<p class="hinweis">Rechteck = Entitätstyp, Raute = Beziehung, Oval = Attribut (unterstrichen = Schlüssel). Die Zahlen an den Linien sind die Kardinalitäten.</p>`) }),
    ziel: 'So hat Eulalia die Datenbank geplant. Lies das ER-Modell.',
    merke: { titel: '🧩 ER-Modell', text: 'Ein Entity-Relationship-Modell beschreibt Entitätstypen (Rechteck) mit Attributen (Oval, Schlüssel unterstrichen) und ihre Beziehungen (Raute). Kardinalitäten 1:1, 1:n, n:m sagen, wie viele Entitäten auf jeder Seite beteiligt sind. Auch eine Beziehung kann Attribute haben.' },
    fragen: [W('Welche Kardinalität hat die Beziehung „wohnt in“ zwischen Dorf und Händler?', ['1:1', '1:n – ein Dorf hat viele Händler, ein Händler wohnt in einem Dorf', 'n:m', 'gar keine'], 1),
      W('Welche Kardinalität hat „verkauft“ zwischen Händler und Ware?', ['1:1', '1:n', 'n:m – ein Händler verkauft viele Waren, eine Ware wird von vielen verkauft', 'n:1'], 2),
      W('Zu wem gehören die Attribute menge und woche?', ['zum Entitätstyp Händler', 'zum Entitätstyp Ware', 'zur Beziehung „verkauft“ – sie beschreiben einen einzelnen Verkauf', 'zum Entitätstyp Dorf'], 2),
      { art: 'zahl', text: 'Wie viele Tabellen entstehen daraus im Relationenmodell?', soll: () => 4 },
      W('Wo landet bei der 1:n-Beziehung „wohnt in“ der Fremdschlüssel?', ['in der Tabelle dorf (händler_id)', 'in der Tabelle haendler (dorf_id) – auf der n-Seite', 'in einer neuen Tabelle', 'nirgends'], 1)],
    tipps: ['n:m wird zu einer eigenen Tabelle, 1:n zu einem Fremdschlüssel auf der n-Seite.'] }),
  KFRAGEN({ id: 'ed2', kapitel: 73, ico: '📐', titel: 'Vom ER-Modell zu Tabellen', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'Relationenmodell',
    tabelle: () => ({ html: kBild(`<pre class="mono dscode">Dorf(<u>id</u>, name, einwohner)
Haendler(<u>id</u>, name, ↑dorf_id)
Ware(<u>id</u>, name, preis)
Verkauf(<u>id</u>, ↑haendler_id, ↑ware_id, menge, woche)</pre>`) }),
    ziel: 'Das Relationenmodell der Datenbank – was bedeuten die Zeichen?',
    merke: { titel: '📐 Relationenmodell', text: 'Aus jedem Entitätstyp wird eine Relation (Tabelle), aus Attributen Spalten. Der Primärschlüssel wird unterstrichen, Fremdschlüssel bekommen einen Pfeil ↑. 1:n: Primärschlüssel der 1-Seite als Fremdschlüssel auf die n-Seite. n:m: neue Relation mit beiden Primärschlüsseln als Fremdschlüssel.', code: 'Haendler(<id>, name, ↑dorf_id)' },
    fragen: [W('Was bedeutet das Unterstreichen von id?', ['Fremdschlüssel', 'Primärschlüssel – identifiziert jede Zeile eindeutig', 'Pflichtfeld', 'Text'], 1),
      W('Was bedeutet ↑ vor dorf_id?', ['Primärschlüssel', 'Fremdschlüssel – verweist auf den Primärschlüssel einer anderen Relation', 'Zahl wird größer', 'sortiert'], 1),
      W('Statt Verkauf(id, …) könnte man den Primärschlüssel aus (haendler_id, ware_id) bilden. Was wäre dann nicht mehr möglich?', ['dass ein Händler dieselbe Ware zweimal verkauft – etwa in zwei verschiedenen Wochen', 'dass ein Händler zwei verschiedene Waren verkauft', 'dass eine Ware zwei Händler hat', 'nichts'], 0),
      W('Eine Burg hat genau eine Burgherrin, eine Burgherrin gehört zu genau einer Burg (1:1). Wohin mit dem Fremdschlüssel?', ['in eine der beiden Tabellen – am besten auf die Seite, deren Partner immer existiert', 'in beide eine neue Tabelle', 'man braucht keinen', 'in die Tabelle dorf'], 0),
      W('Welche Bedingung gehört in den JOIN von Verkauf und Ware?', ['verkauf.id = ware.id', 'verkauf.ware_id = ware.id – Fremdschlüssel = Primärschlüssel', 'verkauf.menge = ware.preis', 'ware.name = verkauf.name'], 1)],
    tipps: ['Fremdschlüssel = Primärschlüssel – das ist auch die Bedingung im JOIN.'] }),
  KFRAGEN({ id: 'ed3', kapitel: 73, ico: '1️⃣', titel: 'Die erste Normalform', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'Händlerliste aus dem Marktbuch',
    tabelle: () => ({ html: kBild(kTab(['id', 'name', 'waren'], [[1, 'Anna', 'Rüben, Äpfel, Honig'], [2, 'Bruno', 'Kohl, Rüben'], [3, 'Clara', 'Honig']], 'Händler(<u>id</u>, name, waren)', ['id'])) }),
    ziel: 'Diese Tabelle stammt aus dem alten Marktbuch. Bring sie in die 1. Normalform.',
    merke: { titel: '1️⃣ Erste Normalform', text: 'Eine Relation ist in der 1. Normalform, wenn jede Zelle genau einen (atomaren) Wert enthält. Mehrwertige Einträge werden auf eigene Zeilen verteilt; danach muss man den Primärschlüssel neu bestimmen.' },
    fragen: [W('Warum ist die Tabelle nicht in der 1NF?', ['die id ist doppelt', 'die Spalte waren ist nicht atomar – sie enthält mehrere Werte in einer Zelle', 'es fehlt ein Fremdschlüssel', 'die Namen sind zu kurz'], 1),
      W('Welches Problem hat man mit dieser Tabelle in SQL?', ["WHERE waren = 'Rüben' findet Anna und Bruno nicht", 'SELECT * zeigt die Spalte waren gar nicht an', 'man kann nicht sortieren', 'keins'], 0),
      { art: 'zahl', text: 'Wie viele Zeilen hat die Tabelle in der 1NF (eine Ware je Zeile)?', soll: () => 6 },
      W('Was ist danach der Primärschlüssel von Händler(id, name, ware)?', ['id', 'name', '(id, ware)', 'ware'], 2),
      W('Ist die neue Tabelle schon in der 2NF?', ['ja', 'nein – name hängt nur von id ab, also nur von einem Teil des Schlüssels', 'nein, weil sie Zahlen enthält', 'das hängt von der Sortierung ab'], 1)],
    tipps: ['3 + 2 + 1 Waren'] }),
  KFRAGEN({ id: 'ed4', kapitel: 73, ico: '🧹', titel: 'Zweite und dritte Normalform', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Zwei Tabellen mit Problemen',
    tabelle: () => ({ html: kBild(`${kTab(['haendler_id', 'ware_id', 'warenname', 'preis', 'menge'], [[1, 1, 'Rüben', 2.5, 20], [1, 3, 'Äpfel', 4.5, 10], [2, 1, 'Rüben', 2.5, 15], [3, 1, 'Rüben', 2.5, 25]], 'Tabelle A: Verkauf(<u>haendler_id, ware_id</u>, warenname, preis, menge)', ['haendler_id', 'ware_id'])}
      ${kTab(['id', 'name', 'dorf_id', 'dorfname', 'einwohner'], [[1, 'Anna', 1, 'Lindenhain', 420], [2, 'Bruno', 1, 'Lindenhain', 420], [3, 'Clara', 2, 'Mühlbach', 310]], 'Tabelle B: Haendler(<u>id</u>, name, dorf_id, dorfname, einwohner)', ['id'])}`) }),
    ziel: 'Zwei Tabellen, zwei Verstöße. Finde sie.',
    merke: { titel: '🧹 2NF und 3NF', text: '2. Normalform: 1NF, und jedes Nicht-Schlüssel-Attribut hängt vom GANZEN Primärschlüssel ab (keine Teilabhängigkeit). 3. Normalform: 2NF, und kein Nicht-Schlüssel-Attribut hängt von einem anderen Nicht-Schlüssel-Attribut ab (keine transitive Abhängigkeit). Sonst drohen Anomalien beim Einfügen, Ändern und Löschen.' },
    fragen: [W('Tabelle A: Welche Attribute hängen nur von einem Teil des Schlüssels ab?', ['menge', 'warenname und preis – sie hängen nur von ware_id ab', 'haendler_id', 'keine'], 1),
      W('Tabelle A verletzt deshalb …', ['die 1NF', 'die 2NF', 'nur die 3NF', 'keine Normalform'], 1),
      W('Tabelle B: dorfname und einwohner hängen von dorf_id ab, dorf_id von id. Das ist …', ['eine Teilabhängigkeit (2NF)', 'eine transitive Abhängigkeit – Verstoß gegen die 3NF', 'in Ordnung', 'eine Verletzung der 1NF'], 1),
      W('Der Rübenpreis ändert sich. Was droht in Tabelle A?', ['eine Änderungsanomalie – man muss ihn in vielen Zeilen ändern und kann eine vergessen', 'nichts', 'eine Einfügeanomalie', 'der Schlüssel ändert sich'], 0),
      W('Eine neue Ware soll ins Sortiment, ist aber noch nie verkauft worden. Was droht in Tabelle A?', ['eine Löschanomalie', 'eine Einfügeanomalie – ohne Verkauf (haendler_id) kann man sie nicht eintragen', 'nichts', 'eine Änderungsanomalie'], 1),
      W('Wie bringt man Tabelle B in die 3NF?', ['dorfname löschen', 'Dorf(id, dorfname, einwohner) auslagern – in Haendler bleibt nur ↑dorf_id', 'einwohner zum Schlüssel machen', 'alles in eine Spalte schreiben'], 1)],
    tipps: ['Frage bei jedem Attribut: Wovon hängt es eigentlich ab?'] }),
);
HOEFE.push(
  AUFTRAG({ id: 'ed5', kapitel: 73, ico: '✂️', titel: 'Normalisieren mit SQL', lohn: 70, db: LISTE_DB, tabellen: ['liste'],
    ziel: 'Aus der langen Liste soll die Tabelle der Dörfer werden: jedes Dorf genau einmal, mit seinen Einwohnern, alphabetisch sortiert.',
    story: 'Ein Schreiber hat alles in eine einzige lange Liste geschrieben – jedes Dorf steht so oft da, wie es Verkäufe gab. Wir zerlegen sie.',
    befehle: KW('SELECT', 'DISTINCT', 'FROM', 'ORDER BY'),
    tipps: ['Welche zwei Spalten gehören zum Dorf?', 'DISTINCT direkt hinter SELECT entfernt doppelte Zeilen aus dem Ergebnis.', 'Alphabetisch: ORDER BY dorf'],
    loesung: 'SELECT DISTINCT dorf, einwohner FROM liste ORDER BY dorf' }),
  // Vom ER-Modell zu CREATE TABLE (Didaktik-Prüfung: Modellieren nur als Auswahlfragen) – leser gibt es schon (A/B verschieden)
  AUFTRAG({ id: 'ed6', kapitel: 73, ico: '📚', titel: 'Die Bibliothek', lohn: 80, db: KONTOR_BIB, tabellen: ['leser'],
    pruef: 'SELECT leser.name, buch.titel, ausleihe.datum FROM ausleihe JOIN leser ON ausleihe.leser_id = leser.id JOIN buch ON ausleihe.buch_id = buch.id ORDER BY ausleihe.id',
    story: 'Die Burgbibliothek soll ins Archiv. Die Bibliothekarin hat ein ER-Modell gezeichnet: Leser (id, name) – leiht (datum) – Buch (id, titel). Ein Leser leiht viele Bücher, ein Buch wird von vielen Lesern geliehen: n:m.',
    ziel: 'Die Tabelle leser gibt es schon. Leg nach dem ER-Modell die Tabellen buch (id, titel) und ausleihe (id, leser_id, buch_id, datum) an – ausleihe mit zwei Fremdschlüsseln. Trag dann ein: Buch 1 „Krabat“, Buch 2 „Momo“. Ausleihe 1: Leser 1 leiht Buch 2 am \'2026-11-02\'. Ausleihe 2: Leser 3 leiht Buch 2 am \'2026-11-09\'. Ausleihe 3: Leser 3 leiht Buch 1 am \'2026-11-09\'.',
    muss: [/references[\s\S]+references/i, 'Die n:m-Beziehung wird eine eigene Tabelle mit ZWEI Fremdschlüsseln: … REFERENCES leser(id) und … REFERENCES buch(id).'],
    merke: { titel: '📚 n:m wird eine eigene Tabelle', text: 'Eine n:m-Beziehung lässt sich nicht als einzelner Fremdschlüssel speichern – ein Buch hätte sonst nur einen Leser. Sie wird eine eigene Tabelle mit den Primärschlüsseln beider Seiten als Fremdschlüssel; Attribute der Beziehung (hier datum) kommen mit hinein. In SQL: spalte INTEGER REFERENCES tabelle(id).' },
    befehle: KW('CREATE TABLE', 'INTEGER', 'TEXT', 'PRIMARY KEY', 'REFERENCES', 'INSERT INTO', 'VALUES', ';'),
    tipps: ['Erst CREATE TABLE buch (…); dann CREATE TABLE ausleihe (…); – Anweisungen mit ; trennen.', 'In ausleihe: leser_id INTEGER REFERENCES leser(id), buch_id INTEGER REFERENCES buch(id), dazu datum TEXT.', "Zum Schluss fünf INSERT INTO … VALUES (…); – Texte und Daten in einfachen Anführungszeichen: '2026-11-02'."],
    loesung: "CREATE TABLE buch (id INTEGER PRIMARY KEY, titel TEXT);\nCREATE TABLE ausleihe (id INTEGER PRIMARY KEY, leser_id INTEGER REFERENCES leser(id), buch_id INTEGER REFERENCES buch(id), datum TEXT);\nINSERT INTO buch VALUES (1, 'Krabat');\nINSERT INTO buch VALUES (2, 'Momo');\nINSERT INTO ausleihe VALUES (1, 1, 2, '2026-11-02');\nINSERT INTO ausleihe VALUES (2, 3, 2, '2026-11-09');\nINSERT INTO ausleihe VALUES (3, 3, 1, '2026-11-09')" }),
);

HOEFE.push(
  // --- Kapitel 74: 📄 CSV und JSON mit Python (Kurs 3.2–3.10) ---
  KONTOR({ id: 'ee1', kapitel: 74, sortArt: 'funktion', ico: '📄', titel: 'Das Botenrennen einlesen', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Datei im Archiv',
    tabelle: () => ({ html: kBild(dateiBild('rennen.csv', RENNEN_A)) }), dateien: KONTOR_DATEIEN,
    ziel: 'Schreib einlesen(pfad): Lies die CSV-Datei mit csv.DictReader (Trennzeichen ;) und gib eine Liste von Dictionaries zurück – eins je Zeile.',
    story: 'Die Ergebnisse des Botenrennens liegen als CSV-Datei vor – so, wie jedes Programm sie exportieren kann. Bevor wir rechnen, müssen wir sie einlesen.',
    merke: { titel: '📄 CSV einlesen', text: 'Eine CSV-Datei ist eine Textdatei: jede Zeile ein Datensatz, die Werte durch ein Trennzeichen getrennt (in Deutschland meist ;). csv.DictReader liefert jede Zeile als Dictionary mit den Spaltennamen der Kopfzeile als Schlüssel. Alle Werte sind zunächst Texte – auch Zahlen.', code: "import csv\n\nwith open('mitglieder.csv', newline='', encoding='utf-8-sig') as datei:\n    reader = csv.DictReader(datei, delimiter=';')\n    for zeile in reader:\n        print(zeile['Name'])" },
    vorspann: 'def _t1():\n    d = einlesen("rennen.csv")\n    return [len(d), d[0]]\n\ndef _t2():\n    d = einlesen("rennen_b.csv")\n    return [len(d), d[2]["Name"], d[2]["Zeit"]]\n',
    ...tests([[6, csvZeilen(RENNEN_A)[0]], [5, 'Ida', '49']]), testName: (k) => ['rennen.csv', 'rennen_b.csv'][k],
    befehle: [K_B('import csv'), K_B('def einlesen(pfad):'), K_B("with open(¦, newline='', encoding='utf-8-sig') as datei:"), K_B("csv.DictReader(¦, delimiter=';')")],
    tipps: ['Oben: import csv. Dann eine leere Liste daten = [].', "with open(pfad, newline='', encoding='utf-8-sig') as datei: öffnet die Datei und schließt sie danach von selbst.", "csv.DictReader(datei, delimiter=';') – ohne delimiter wird die ganze Kopfzeile ein einziger Schlüssel."],
    loesung: "import csv\n\ndef einlesen(pfad):\n    daten = []\n    with open(pfad, newline='', encoding='utf-8-sig') as datei:\n        reader = csv.DictReader(datei, delimiter=';')\n        for zeile in reader:\n            daten.append(zeile)\n    return daten" }),
  KONTOR({ id: 'ee2', kapitel: 74, sortArt: 'funktion', ico: '🏇', titel: 'Der schnellste Bote', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Datei im Archiv',
    tabelle: () => ({ html: kBild(dateiBild('rennen.csv', RENNEN_A)) }), dateien: KONTOR_DATEIEN,
    ziel: 'Schreib schnellster(pfad): Name des Boten mit der kleinsten Zeit (in Minuten).',
    listen: [[], []], aufrufFn: (l, k) => `schnellster("${['rennen.csv', 'rennen_b.csv'][k]}")`, soll: (l, k) => schnellster([RENNEN_A, RENNEN_B][k]), testName: (k) => ['rennen.csv', 'rennen_b.csv'][k],
    // Wer die Zeiten als Text vergleicht, bekommt den „kleinsten Text“ ("105" < "9") – dann gezielt auf das Umwandeln hinweisen
    pruefWert: (w, k) => {
      const t = [RENNEN_A, RENNEN_B][k], soll = schnellster(t), alsText = csvZeilen(t).reduce((a, b) => (b.Zeit < a.Zeit ? b : a));
      if (w === soll) return null;
      if (w === alsText.Name) return `${['rennen.csv', 'rennen_b.csv'][k]}: Ergebnis "${w}" – das ist die kleinste Zeit als TEXT ("${alsText.Zeit}" steht im Alphabet vor "${csvZeilen(t).find((r) => r.Name === soll).Zeit}"). Aus der CSV-Datei kommen nur Texte: Wandle die Zeit erst in eine Zahl um, dann vergleiche.`;
      return `${['rennen.csv', 'rennen_b.csv'][k]}: Ergebnis ${ergebnisText(w)} – richtig wäre "${soll}".`;
    },
    befehle: [K_B('def schnellster(pfad):'), K_B('bester = None'), K_B('int(¦)')],
    tipps: ['Extremwert suchen: Merkvariable bester = None, dann in der Schleife ersetzen, wenn einer kleiner ist.', 'Texte vergleichen Zeichen für Zeichen: "105" < "9" ist wahr! Darum erst int(zeile["Zeit"]).', 'Am Ende: return bester["Name"]'],
    loesung: "import csv\n\ndef schnellster(pfad):\n    bester = None\n    with open(pfad, newline='', encoding='utf-8-sig') as datei:\n        for zeile in csv.DictReader(datei, delimiter=';'):\n            if bester is None or int(zeile['Zeit']) < int(bester['Zeit']):\n                bester = zeile\n    return bester['Name']" }),
  KONTOR({ id: 'ee3', kapitel: 74, sortArt: 'funktion', ico: '🔎', titel: 'Filtern nach Dorf', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Datei im Archiv',
    tabelle: () => ({ html: kBild(dateiBild('rennen.csv', RENNEN_A)) }), dateien: KONTOR_DATEIEN,
    ziel: 'Schreib durchschnitt(pfad, dorf): mittlere Zeit aller Boten aus diesem Dorf, auf 2 Stellen gerundet (round). Kommt niemand aus dem Dorf: 0.',
    listen: [[], [], [], []], aufrufFn: (l, k) => `durchschnitt(${['"rennen.csv", "Lindenhain"', '"rennen.csv", "Mühlbach"', '"rennen_b.csv", "Seedorf"', '"rennen.csv", "Seedorf"'][k]})`,
    soll: (l, k) => [schnitt(RENNEN_A, 'Lindenhain'), schnitt(RENNEN_A, 'Mühlbach'), schnitt(RENNEN_B, 'Seedorf'), 0][k], testName: (k) => ['Lindenhain', 'Mühlbach', 'Seedorf (Datei b)', 'niemand'][k],
    befehle: [K_B('def durchschnitt(pfad, dorf):'), K_B('if ¦ == ¦:'), K_B('round(¦, 2)')],
    tipps: ['Filtern: nur Zeilen mit zeile["Dorf"] == dorf zählen. Dabei summe und anzahl mitführen.', 'Die Zeit ist ein Text: summe = summe + int(zeile["Zeit"]).', 'anzahl == 0? Dann return 0 – sonst würde durch 0 geteilt. Sonst round(summe / anzahl, 2).'],
    loesung: "import csv\n\ndef durchschnitt(pfad, dorf):\n    summe = 0\n    anzahl = 0\n    with open(pfad, newline='', encoding='utf-8-sig') as datei:\n        for zeile in csv.DictReader(datei, delimiter=';'):\n            if zeile['Dorf'] == dorf:\n                summe = summe + int(zeile['Zeit'])\n                anzahl = anzahl + 1\n    if anzahl == 0:\n        return 0\n    return round(summe / anzahl, 2)" }),
  KONTOR({ id: 'ee4', kapitel: 74, sortArt: 'funktion', ico: '🌡️', titel: 'Messwerte bereinigen', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Thermometer im Turm',
    tabelle: () => ({ html: kBild(`${dateiBild('messung.csv', MESS_A)}<p class="hinweis">Das Thermometer im Turm hat manchmal ausgesetzt: N/A oder gar nichts. Trennzeichen hier: Komma.</p>`) }), dateien: KONTOR_DATEIEN,
    ziel: 'Schreib bereinigen(pfad): Lies die Datei (Komma als Trennzeichen) und gib [Anzahl gelöschter Zeilen, Mittelwert der gültigen Temperaturen auf 2 Stellen] zurück. Ungültig sind "N/A" und leere Werte.',
    merke: { titel: '🧹 Daten bereinigen', text: 'Fehlende oder kaputte Werte (N/A, leer, Tippfehler) werden vor der Auswertung erkannt und entfernt – oder nachvollziehbar ersetzt (z. B. durch den Mittelwert der Nachbarn). Keine eigenen Annahmen einbauen: Die Bereinigung darf das Ergebnis nicht verfälschen und sollte dokumentiert werden (wie viele Zeilen wurden entfernt?).' },
    listen: [[], []], aufrufFn: (l, k) => `bereinigen("${['messung.csv', 'messung_b.csv'][k]}")`,
    soll: (l, k) => { const t = [MESS_A, MESS_B][k], g = gueltige(t); return [csvZeilen(t, ',').length - g.length, rund(g.reduce((a, b) => a + b, 0) / g.length)]; }, testName: (k) => ['messung.csv', 'messung_b.csv'][k],
    befehle: [K_B('def bereinigen(pfad):'), K_B('float(¦)'), K_B('.strip()')],
    tipps: ['csv.DictReader(datei) ohne delimiter – hier ist das Komma richtig.', 'Für jede Zeile: gültig → float(wert) zur summe und anzahl + 1, sonst den Zähler geloescht erhöhen.', 'Leer ist ein Wert, wenn wert.strip() == "" gilt. Am Ende: return [geloescht, round(summe / anzahl, 2)]'],
    loesung: "import csv\n\ndef bereinigen(pfad):\n    summe = 0\n    anzahl = 0\n    geloescht = 0\n    with open(pfad, newline='', encoding='utf-8') as datei:\n        for zeile in csv.DictReader(datei):\n            wert = zeile['Temperatur']\n            if wert != 'N/A' and wert.strip() != '':\n                summe = summe + float(wert)\n                anzahl = anzahl + 1\n            else:\n                geloescht = geloescht + 1\n    return [geloescht, round(summe / anzahl, 2)]" }),
  KONTOR({ id: 'ee5', kapitel: 74, sortArt: 'funktion', ico: '✍️', titel: 'Die Rangliste schreiben', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Datei im Archiv',
    tabelle: () => ({ html: kBild(`${dateiBild('rennen.csv', RENNEN_A)}${dateiBild('rangliste.csv (so soll sie werden)', ['Platz;Name;Zeit', ...csvZeilen(RENNEN_A).sort((a, b) => a.Zeit - b.Zeit).slice(0, 3).map((r, i) => `${i + 1};${r.Name};${r.Zeit}`), '…'].join('\n'))}`) }), dateien: KONTOR_DATEIEN,
    ziel: 'Schreib rangliste(pfad_ein, pfad_aus): Lies das Rennen, sortiere nach Zeit (schnellste zuerst) und schreib eine neue CSV-Datei mit der Kopfzeile Platz;Name;Zeit (Trennzeichen ;).',
    merke: { titel: '✍️ CSV schreiben', text: 'csv.writer(datei, delimiter=";") schreibt Listen als Zeilen: writerow(zeile) eine, writerows(liste) viele. Die Datei öffnet man mit "w" (überschreiben) oder "a" (anhängen) und newline="", sonst entstehen unter Windows Leerzeilen.', code: "with open(pfad, 'w', newline='', encoding='utf-8') as datei:\n    writer = csv.writer(datei, delimiter=';')\n    writer.writerow(['Platz', 'Name', 'Zeit'])" },
    vorspann: 'import csv\n\ndef _lies(p):\n    with open(p, newline="") as f:\n        return [z for z in csv.reader(f, delimiter=";")]\n\ndef _t1():\n    rangliste("rennen.csv", "rangliste.csv")\n    return _lies("rangliste.csv")\n\ndef _t2():\n    rangliste("rennen_b.csv", "aus.csv")\n    return _lies("aus.csv")\n',
    ...tests([RENNEN_A, RENNEN_B].map((t) => [['Platz', 'Name', 'Zeit'], ...csvZeilen(t).sort((a, b) => a.Zeit - b.Zeit).map((r, i) => [String(i + 1), r.Name, r.Zeit])])), testName: (k) => ['rennen.csv', 'rennen_b.csv'][k],
    // Sortieren nach dem Text ("105" vor "39") gezielt erkennen (Didaktik-Prüfung)
    pruefWert: (w, k) => {
      const t = [RENNEN_A, RENNEN_B][k], name = ['rennen.csv', 'rennen_b.csv'][k], z = csvZeilen(t);
      const soll = [['Platz', 'Name', 'Zeit'], ...[...z].sort((a, b) => a.Zeit - b.Zeit).map((r, i) => [String(i + 1), r.Name, r.Zeit])];
      const alsText = [['Platz', 'Name', 'Zeit'], ...[...z].sort((a, b) => (a.Zeit < b.Zeit ? -1 : a.Zeit > b.Zeit ? 1 : 0)).map((r, i) => [String(i + 1), r.Name, r.Zeit])];
      if (gleichWert(w, soll)) return null;
      if (gleichWert(w, alsText)) return `${name}: Deine Rangliste ist nach dem TEXT sortiert – "105" kommt dort vor "39" und "9" ganz nach hinten. Sortiere nach der Zeit als Zahl: key=lambda z: int(z['Zeit']).`;
      return `${name}: Die Datei sieht anders aus – richtig wäre ${ergebnisText(soll)}.`;
    },
    befehle: [K_B('def rangliste(pfad_ein, pfad_aus):'), K_B("open(pfad_aus, 'w', newline='', encoding='utf-8')"), K_B("csv.writer(¦, delimiter=';')"), K_B('.sort(key=lambda z: ¦)')],
    tipps: ['Erst alle Zeilen in eine Liste daten einlesen.', "Sortieren: daten.sort(key=lambda z: …) – der Schlüssel ist die Zeit als Zahl, nicht als Text.", 'Beim Schreiben zählt der Platz mit: platz = platz + 1, dann writer.writerow([platz, z["Name"], z["Zeit"]]).'],
    loesung: "import csv\n\ndef rangliste(pfad_ein, pfad_aus):\n    daten = []\n    with open(pfad_ein, newline='', encoding='utf-8-sig') as datei:\n        for zeile in csv.DictReader(datei, delimiter=';'):\n            daten.append(zeile)\n    daten.sort(key=lambda z: int(z['Zeit']))\n    with open(pfad_aus, 'w', newline='', encoding='utf-8') as datei:\n        writer = csv.writer(datei, delimiter=';')\n        writer.writerow(['Platz', 'Name', 'Zeit'])\n        platz = 0\n        for z in daten:\n            platz = platz + 1\n            writer.writerow([platz, z['Name'], z['Zeit']])" }),
  KONTOR({ id: 'ee6v', kapitel: 74, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🔮', titel: 'Kisten in Kisten', lohn: 60,
    ziel: 'Listen in Dictionaries in Listen … Sag voraus, was herauskommt.',
    listen: [[]], code: `def versuch():
    reich = {
        "Lindenhain": [{"name": "Anna", "waren": ["Rüben", "Äpfel"]},
                       {"name": "Bruno", "waren": ["Kohl"]}],
        "Mühlbach": [{"name": "Clara", "waren": ["Honig", "Rüben", "Kohl"]}]
    }
    a = reich["Lindenhain"][1]["name"]
    b = reich["Mühlbach"][0]["waren"][2]
    anzahl = 0
    for dorf, leute in reich.items():
        for person in leute:
            anzahl = anzahl + len(person["waren"])
    return [a, b, anzahl]`,
    merke: { titel: '📦 Verschachtelte Datentypen', text: 'Listen und Dictionaries lassen sich beliebig ineinander schachteln – so sehen auch JSON-Daten aus. Man greift Schritt für Schritt zu: erst der Schlüssel bzw. Index der äußeren Ebene, dann der nächste: reich["Mühlbach"][0]["waren"][2].', code: 'reich["Lindenhain"][1]["name"]   # "Bruno"' },
    fragen: [W('Welchen Wert hat a?', ['Anna', 'Bruno', 'Kohl', 'Lindenhain'], 1),
      W('Welchen Wert hat b?', ['Honig', 'Rüben', 'Kohl', 'einen Fehler'], 2),
      { art: 'zahl', text: 'Welchen Wert hat anzahl am Ende?', soll: (l) => l.wert[2] }],
    tipps: ['Indizes zählen ab 0: [1] ist das zweite Element.', 'anzahl zählt alle Waren aller Personen zusammen.'] }),
  KONTOR({ id: 'ee7', kapitel: 74, sortArt: 'funktion', ico: '☁️', titel: 'Das Wetter als JSON', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Datei vom Wetterturm',
    tabelle: () => ({ html: kBild(dateiBild('wetter.json', JSON.stringify(WETTER, null, 2))) }), dateien: KONTOR_DATEIEN,
    ziel: 'Schreib waermster_tag(pfad): Lies die JSON-Datei mit json.load und gib [datum des Tages mit der höchsten Temperatur, Mittelwert ALLER Temperaturen auf 1 Stelle] zurück.',
    merke: { titel: '☁️ JSON', text: 'JSON ist ein Textformat für verschachtelte Daten: Objekte {"schlüssel": wert} werden in Python zu Dictionaries, Arrays [ … ] zu Listen. json.load(datei) liest eine Datei, json.loads(text) einen Text, json.dump(daten, datei) schreibt. Wetter-Apps und Fahrpläne bekommen ihre Daten so über APIs.', code: "import json\n\nwith open(pfad, encoding='utf-8') as datei:\n    wetter = json.load(datei)\nprint(wetter['tage'][0]['datum'])" },
    listen: [[], []], aufrufFn: (l, k) => `waermster_tag("${['wetter.json', 'wetter_b.json'][k]}")`,
    soll: (l, k) => { const w = [WETTER, WETTER_B][k], t = w.tage.flatMap((d) => d.temperaturen); return [w.tage.reduce((a, b) => (Math.max(...b.temperaturen) > Math.max(...a.temperaturen) ? b : a)).datum, rund(t.reduce((a, b) => a + b, 0) / t.length, 1)]; },
    testName: (k) => ['wetter.json', 'wetter_b.json'][k],
    befehle: [K_B('import json'), K_B('def waermster_tag(pfad):'), K_B('json.load(¦)'), K_B("for tag in wetter['tage']:")],
    tipps: ["wetter['tage'] ist eine Liste von Dictionaries; jedes hat 'datum' und 'temperaturen'.", 'Zwei Schleifen ineinander: für jeden Tag, darin für jede Temperatur t. Ist t größer als die bisher höchste, merk dir t und das Datum.', 'Nebenbei summe und anzahl mitführen – am Ende round(summe / anzahl, 1).'],
    loesung: "import json\n\ndef waermster_tag(pfad):\n    with open(pfad, encoding='utf-8') as datei:\n        wetter = json.load(datei)\n    hoechste = None\n    datum = ''\n    summe = 0\n    anzahl = 0\n    for tag in wetter['tage']:\n        for t in tag['temperaturen']:\n            summe = summe + t\n            anzahl = anzahl + 1\n            if hoechste is None or t > hoechste:\n                hoechste = t\n                datum = tag['datum']\n    return [datum, round(summe / anzahl, 1)]" }),
  KONTOR({ id: 'ee8', kapitel: 74, sortArt: 'funktion', knobel: true, ico: '🧾', titel: 'Umsatz je Dorf als JSON', lohn: 90, ansicht: 'tabelle', titelAnsicht: 'Datei im Archiv',
    tabelle: () => ({ html: kBild(dateiBild('verkaeufe.csv', VERKAEUFE_CSV)) }), dateien: KONTOR_DATEIEN,
    ziel: 'Ein ganzer Datenlebenszyklus: umsatz_je_dorf(pfad_ein, pfad_aus) liest die Verkäufe, rechnet je Dorf den Umsatz (Menge · Preis, auf 2 Stellen gerundet) in ein Dictionary und speichert es mit json.dump als JSON-Datei. Rückgabe: das Dictionary.',
    vorspann: 'import json\n\ndef _t1():\n    d = umsatz_je_dorf("verkaeufe.csv", "umsatz.json")\n    with open("umsatz.json") as f:\n        gespeichert = json.load(f)\n    return [d, gespeichert]\n',
    ...tests([(() => { const u = {}; for (const r of csvZeilen(VERKAEUFE_CSV)) u[r.Dorf] = rund((u[r.Dorf] || 0) + r.Menge * r.Preis); return [u, u]; })()]), testName: () => 'verkaeufe.csv → umsatz.json',
    tipps: ['Ein leeres Dictionary umsatz = {}. Ist das Dorf neu, mit 0 anfangen: if dorf not in umsatz: umsatz[dorf] = 0', 'int(zeile["Menge"]) * float(zeile["Preis"])', "Schreiben: with open(pfad_aus, 'w', encoding='utf-8') as datei: json.dump(umsatz, datei)"],
    loesung: "import csv\nimport json\n\ndef umsatz_je_dorf(pfad_ein, pfad_aus):\n    umsatz = {}\n    with open(pfad_ein, newline='', encoding='utf-8-sig') as datei:\n        for zeile in csv.DictReader(datei, delimiter=';'):\n            dorf = zeile['Dorf']\n            if dorf not in umsatz:\n                umsatz[dorf] = 0\n            umsatz[dorf] = round(umsatz[dorf] + int(zeile['Menge']) * float(zeile['Preis']), 2)\n    with open(pfad_aus, 'w', encoding='utf-8') as datei:\n        json.dump(umsatz, datei)\n    return umsatz" }),

  // --- Kapitel 75: ☁️ NoSQL und Datenlebenszyklus (Kurs 2.1–2.3, 3.1, 3.14) ---
  KFRAGEN({ id: 'ef1', kapitel: 75, ico: '☁️', titel: 'Nicht alles ist eine Tabelle', lohn: 65,
    ziel: 'NoSQL-Datenbanken und das CAP-Theorem.',
    merke: { titel: '☁️ NoSQL und CAP', text: 'NoSQL-Datenbanken speichern Daten ohne festes Tabellenschema, z. B. als Schlüssel-Wert-Paare (Key-Value), als JSON-Dokumente oder als Graph. Sie lassen sich gut auf viele Rechner verteilen. Das CAP-Theorem: Ein verteiltes System kann bei einer Netzwerkstörung (Partition) nicht zugleich Konsistenz (alle sehen dieselben Daten) und Verfügbarkeit (jede Anfrage bekommt eine Antwort) garantieren.' },
    fragen: [W('Ein Key-Value-Speicher funktioniert wie …', ['eine Tabelle mit JOINs', 'ein Python-Dictionary – zu jedem Schlüssel gehört ein Wert', 'eine CSV-Datei mit Kopfzeile', 'ein Binärbaum'], 1),
      W('Wofür ist eine Dokumentendatenbank (JSON-Dokumente) besonders gut?', ['für Daten mit wechselnder, verschachtelter Struktur – z. B. Profile mit unterschiedlich vielen Feldern', 'für streng gleich aufgebaute Buchhaltung mit vielen JOINs', 'nur für Bilder', 'gar nicht'], 0),
      W('C, A und P im CAP-Theorem stehen für …', ['Kapazität, Ausfallsicherheit, Performance', 'Konsistenz, Verfügbarkeit, Partitionstoleranz', 'Cache, Array, Pointer', 'Client, Administrator, Passwortschutz'], 1),
      W('Das Netz zwischen zwei Rechenzentren fällt aus. Ein Online-Banking-System …', ['antwortet lieber gar nicht – ein falscher Kontostand wäre schlimmer, es wählt Konsistenz', 'zeigt irgendeinen Kontostand – Verfügbarkeit geht vor', 'löscht alle Daten', 'braucht kein CAP'], 0),
      W('Wann ist eine relationale Datenbank mit SQL die bessere Wahl?', ['bei strukturierten Daten mit vielen Beziehungen – die konsistent bleiben müssen', 'bei Millionen Sensorwerten ohne Struktur', 'nie', 'nur bei Bildern'], 0)],
    tipps: ['Key-Value = Dictionary.'] }),
  KFRAGEN({ id: 'ef2', kapitel: 75, ico: '♻️', titel: 'Der Lebenszyklus der Daten', lohn: 65,
    ziel: 'Von der Erhebung bis zum Löschen – und was dabei erlaubt ist.',
    merke: { titel: '♻️ Datenlebenszyklus', text: 'Daten durchlaufen einen Lebenszyklus: erheben, speichern, verarbeiten (bereinigen, auswerten), nutzen und teilen, archivieren und schließlich löschen. Bei personenbezogenen Daten gilt die DSGVO: nur so viel erheben wie nötig (Datensparsamkeit), nur für den genannten Zweck verwenden und löschen, wenn der Zweck erfüllt ist.' },
    fragen: [W('In welcher Reihenfolge laufen diese Schritte?', ['löschen – erheben – speichern – auswerten', 'erheben – speichern – bereinigen – auswerten – archivieren – löschen', 'auswerten – erheben – speichern – löschen', 'speichern – löschen – erheben'], 1),
      W('Das Botenrennen will auch die Adressen aller Läufer speichern, „falls man sie mal braucht“. Das widerspricht …', ['der Datensparsamkeit und Zweckbindung', 'dem CAP-Theorem', 'der 3. Normalform der Datenbank', 'nichts'], 0),
      W('Messwerte mit N/A werden einfach durch den Wert 20 ersetzt, „weil es meistens etwa 20 Grad sind“. Was ist das Problem?', ['keins', 'eine eigene Annahme verfälscht die Auswertung – besser entfernen oder nachvollziehbar ersetzen und dokumentieren', 'Python kann 20 nicht speichern', 'die Datei wird durch die vielen Zwanziger zu groß'], 1),
      W('Warum ist CSV im Unterricht und im Abitur so beliebt?', ['es ist ein einfaches Textformat – fast jedes Programm kann es lesen und schreiben, ohne Internet', 'es ist verschlüsselt', 'es kann Bilder speichern', 'es ist schneller als jede Datenbank'], 0)],
    tipps: ['Zweckbindung: Daten nur für das nutzen, wofür sie erhoben wurden.'] }),
  // SQL oder Python? Dieselbe Auswertung zweimal (Didaktik-Prüfung: Kapitel 75 nur Fragen, kein Transfer)
  AUFTRAG({ id: 'ef3', kapitel: 75, ico: '🔀', titel: 'SQL oder Python? (1) SQL', lohn: 70, db: KONTOR_VK, tabellen: ['verkaeufe'],
    story: 'Der Schatzmeister will wissen, welche Dörfer viel handeln. Die Verkäufe liegen bei uns zweimal vor: als Tabelle in der Datenbank und als CSV-Datei. Wir rechnen es auf beiden Wegen aus – erst mit SQL.',
    ziel: 'Zeige je Dorf die Gesamtmenge der verkauften Stücke – nur Dörfer mit mindestens 20 Stück, alphabetisch nach dem Dorf.',
    befehle: KW('SELECT', 'SUM()', 'FROM', 'GROUP BY', 'HAVING', 'ORDER BY'),
    tipps: ['Je Dorf eine Gruppe: GROUP BY dorf.', 'Die Bedingung betrifft die Summe einer Gruppe – also HAVING, nicht WHERE.', 'SELECT dorf, SUM(menge) FROM verkaeufe GROUP BY … HAVING … ORDER BY dorf'],
    loesung: 'SELECT dorf, SUM(menge) FROM verkaeufe GROUP BY dorf HAVING SUM(menge) >= 20 ORDER BY dorf' }),
  KONTOR({ id: 'ef3p', kapitel: 75, sortArt: 'funktion', ico: '🐍', titel: 'SQL oder Python? (2) Python', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Dieselbe Auswertung',
    tabelle: () => ({ html: kBild(`${dateiBild('verkaeufe.csv', VERKAEUFE_CSV)}<pre class="mono dscode">SELECT dorf, SUM(menge)
FROM verkaeufe
GROUP BY dorf
HAVING SUM(menge) >= 20
ORDER BY dorf</pre><p class="hinweis">So hast du es eben mit SQL gelöst. Jetzt Schritt für Schritt in Python: GROUP BY wird ein Dictionary, HAVING ein if, ORDER BY ein Sortieren.</p>`) }), dateien: KONTOR_DATEIEN,
    ziel: 'Schreib menge_je_dorf(pfad, mindestens): dieselbe Auswertung in Python. Gib eine Liste [[dorf, menge], …] zurück – nur Dörfer mit mindestens so vielen Stück, alphabetisch nach dem Dorf.',
    merke: { titel: '🔀 SQL oder Python?', text: 'SQL beschreibt, WAS herauskommen soll (GROUP BY, HAVING, ORDER BY) – die Datenbank sucht selbst den Weg; das passt zu großen, verknüpften Tabellen. Python beschreibt Schritt für Schritt, WIE gerechnet wird (Dictionary als Zähler, if, sortieren); das passt zu Dateien, zum Bereinigen und zu Rechnungen, die SQL nicht kann.' },
    listen: [[], [], []], aufrufFn: (l, k) => [`menge_je_dorf("verkaeufe.csv", 20)`, `menge_je_dorf("verkaeufe_b.csv", 20)`, `menge_je_dorf("verkaeufe.csv", 40)`][k],
    soll: (l, k) => [mengeJeDorf(VERKAEUFE_CSV, 20), mengeJeDorf(VERKAEUFE_B_CSV, 20), mengeJeDorf(VERKAEUFE_CSV, 40)][k], testName: (k) => ['verkaeufe.csv, mindestens 20', 'verkaeufe_b.csv, mindestens 20', 'mindestens 40 (niemand)'][k],
    befehle: [K_B('def menge_je_dorf(pfad, mindestens):'), K_B('summe = {}'), K_B('for dorf in sorted(summe):')],
    tipps: ['Wie GROUP BY: ein Dictionary summe; ist das Dorf neu, mit 0 anfangen, dann int(zeile["Menge"]) dazuzählen.', 'Wie HAVING und ORDER BY: for dorf in sorted(summe): nur wenn summe[dorf] >= mindestens, kommt [dorf, summe[dorf]] in die Ergebnisliste.', 'Trennzeichen ; nicht vergessen: csv.DictReader(datei, delimiter=";")'],
    loesung: "import csv\n\ndef menge_je_dorf(pfad, mindestens):\n    summe = {}\n    with open(pfad, newline='', encoding='utf-8-sig') as datei:\n        for zeile in csv.DictReader(datei, delimiter=';'):\n            dorf = zeile['Dorf']\n            if dorf not in summe:\n                summe[dorf] = 0\n            summe[dorf] = summe[dorf] + int(zeile['Menge'])\n    ergebnis = []\n    for dorf in sorted(summe):\n        if summe[dorf] >= mindestens:\n            ergebnis.append([dorf, summe[dorf]])\n    return ergebnis" }),
);
