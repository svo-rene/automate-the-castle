'use strict';
// --- 📜 Archiv (Burg 9): Datenbanken mit SQL ------------------------------------------------
// Aufträge sind Höfe mit art: 'sql'. Statt eines Ackers gibt es eine kleine Datenbank (monster, bauern, ernte).
// Jede Abfrage läuft auf zwei Archiven (A und B, verschiedene Daten): Wer die Antwort abschreibt statt zu fragen,
// fällt bei B auf. Verglichen wird mit dem Ergebnis der Musterlösung (Reihenfolge nur, wenn sie ORDER BY hat).
// Daten ändern (INSERT/UPDATE/DELETE): pruef = Abfrage, die danach das Ergebnis zeigt.
// Namen kindgerecht: Monster verpuffen, werden aus dem Buch gestrichen – nichts Brutales.

const ARCHIV_MONSTER = [
  ['Flitz', 'ratte', 4, 1.9, 1, 0], ['Knabber', 'ratte', 5, 2.0, 1, 0], ['Glibber', 'schleim', 16, 0.9, 2, 0], ['Wabbel', 'schleim', 18, 0.8, 2, 0],
  ['Heuler', 'wolf', 10, 1.5, 2, 0], ['Graupelz', 'wolf', 12, 1.4, 2, 1], ['Grummel', 'ork', 26, 0.95, 2, 2], ['Brummbart', 'ork', 30, 0.9, 3, 2],
  ['Huschhusch', 'geist', 18, 1.2, 2, 0], ['Nebelchen', 'geist', 15, 1.3, 1, 0], ['Felsfuss', 'troll', 80, 0.65, 5, 1], ['Glutzahn', 'drache', 180, 0.55, 12, 3],
];
const ARCHIV_BAUERN = [
  [1, 'Anna', 'Lindenhain', 34], [2, 'Bruno', 'Lindenhain', 51], [3, 'Clara', 'Mühlbach', 27], [4, 'David', 'Mühlbach', 45],
  [5, 'Ella', 'Steinfeld', 38], [6, 'Finn', 'Steinfeld', 22], [7, 'Greta', 'Lindenhain', 63], [8, 'Hugo', 'Mühlbach', 30],
];
const ARCHIV_ERNTE = [
  [1, 'Rüben', 12, 1], [1, 'Kohl', 5, 1], [2, 'Rüben', 20, 1], [3, 'Kürbis', 4, 1], [4, 'Rüben', 9, 2], [4, 'Äpfel', 15, 2],
  [5, 'Kohl', 7, 2], [6, 'Rüben', 6, 2], [7, 'Äpfel', 22, 3], [7, 'Rüben', 8, 3], [8, 'Kürbis', 6, 3], [2, 'Kohl', 11, 3],
  [3, 'Rüben', 14, 4], [5, 'Äpfel', 10, 4], [6, 'Kürbis', 3, 4], [1, 'Rüben', 7, 4],
];
// Archiv B: andere Zahlen und ein paar Zeilen mehr – so lässt sich keine Antwort auswendig hinschreiben
const archivDaten = (v) => v === 'A'
  ? { monster: ARCHIV_MONSTER, bauern: ARCHIV_BAUERN, ernte: ARCHIV_ERNTE }
  : {
    monster: [...ARCHIV_MONSTER.map(([n, a, l, t, s, r], i) => [n, a, l + 2 + (i % 2 ? 0 : 3), t, s, r]), ['Zappel', 'ratte', 6, 2.1, 1, 0], ['Kloss', 'troll', 95, 0.6, 6, 2], ['Gruselgrau', 'geist', 21, 1.1, 2, 0], ['Schnüffel', 'maulwurf', 9, 0.7, 1, 1]],
    bauern: [...ARCHIV_BAUERN.map(([id, n, d, j], i) => [id, n, d, j + (i % 3) * 2]), [9, 'Ida', 'Steinfeld', 41], [10, 'Karl', 'Mühlbach', 19], [11, 'Martha', 'Mühlbach', 72], [12, 'Jana', 'Mühlbach', 35]],  // Jana genau 35: „jünger als 35“ mit <= fällt auf (d8)
    ernte: [...ARCHIV_ERNTE.map(([b, f, m, w], i) => [b, f, m + ((i * 7) % 5) - 2, w]), [9, 'Rüben', 13, 4], [10, 'Kohl', 9, 4], [9, 'Äpfel', 5, 3]],
  };
const ARCHIV_SCHEMA = {
  monster: [['name', 'TEXT'], ['art', 'TEXT'], ['leben', 'INTEGER'], ['tempo', 'REAL'], ['schaden', 'INTEGER'], ['ruestung', 'INTEGER']],
  bauern: [['id', 'INTEGER PRIMARY KEY'], ['name', 'TEXT'], ['dorf', 'TEXT'], ['jahre', 'INTEGER']],
  ernte: [['bauer_id', 'INTEGER'], ['frucht', 'TEXT'], ['menge', 'INTEGER'], ['woche', 'INTEGER']],
};
const sqlWert = (x) => (x === null ? 'NULL' : typeof x === 'number' ? String(x) : `'${String(x).replace(/'/g, "''")}'`);
// Eigene Datenbank je Auftrag (🗄️ LK Daten: h.db = { schema, daten(v) }), sonst das Archiv von Burg 9
const ARCHIV_DB = { schema: ARCHIV_SCHEMA, daten: archivDaten };
const dbVon = (h) => h?.db || ARCHIV_DB;
function dbSetup(h, v) {
  const db = dbVon(h), d = db.daten(v);
  return Object.entries(db.schema).map(([t, spalten]) => `CREATE TABLE ${t} (${spalten.map(([n, typ]) => `${n} ${typ}`).join(', ')});\n`
    + d[t].map((z) => `INSERT INTO ${t} VALUES (${z.map(sqlWert).join(', ')});`).join('\n')).join('\n');
}
const archivSetup = (v) => dbSetup(null, v);

// Bausteine für die Befehlsleiste (werden als neue Zeile eingefügt)
const Q = (text, neu = false) => ({ text, zeigt: text, neu });
const Q_SELECT = [Q('SELECT *'), Q('SELECT name'), Q('FROM monster')];
const Q_WHERE = [Q("WHERE art = 'ratte'"), Q('AND'), Q('OR')];
const Q_ORDER = [Q('ORDER BY leben'), Q('DESC'), Q('LIMIT 3')];

// Kapitel und Burg 9 (Kapitel-Ids 11–16)
KAPITEL[11] = { name: 'Tabellen lesen', ico: '📋' };
KAPITEL[12] = { name: 'Filtern mit WHERE', ico: '🔎' };
KAPITEL[13] = { name: 'Sortieren', ico: '↕️' };
KAPITEL[14] = { name: 'Zählen und Rechnen', ico: '🧮' };
KAPITEL[15] = { name: 'Vertiefung: Gruppen und JOIN', ico: '⭐' };
KAPITEL[16] = { name: 'Daten ändern', ico: '✏️' };
// Klasse 9: Schwerpunkt SELECT und WHERE, dazu einfache Aggregatfunktionen. GROUP BY und JOIN nur als Vertiefung am Ende.
BURGEN[9] = { name: 'Burg 9', ico: '🏛️', klasse: 9, region: 'archiv', kapitel: [11, 12, 13, 14, 16, 15], text: '📜 Archiv: Datenbanken mit SQL – abfragen, filtern mit WHERE, sortieren, zählen, Daten ändern. Für Profis: Gruppen und JOIN.' };

// Auftrag im Archiv. tabellen = welche Tabellen links gezeigt werden
const AUFTRAG = (a) => hof({ art: 'sql', start: 'A', varianten: ['B'], bloecke: false, sprache: [], tabellen: ['monster'], ...a });

HOEFE.push(
  // --- Kapitel 11: 📋 Tabellen lesen ---
  AUFTRAG({ id: 'd1', kapitel: 11, ico: '📖', titel: 'Das Monsterbuch', ziel: 'Zeige die ganze Tabelle monster.', lohn: 20,
    befehle: Q_SELECT, neu: Q_SELECT,
    merke: { titel: '📜 Willkommen im Archiv!', text: 'Im Archiv stehen Daten in Tabellen. Mit SQL fragst du sie ab. SELECT sagt, welche Spalten du sehen willst (* = alle), FROM sagt, aus welcher Tabelle. Links siehst du die Tabellen – und wie das Ergebnis aussehen soll.', code: 'SELECT *\nFROM monster' },
    tipps: ['SELECT * zeigt alle Spalten.', 'Danach kommt FROM und der Name der Tabelle.', 'SELECT * FROM monster'],
    loesung: 'SELECT * FROM monster' }),
  AUFTRAG({ id: 'd2', kapitel: 11, ico: '🏷️', titel: 'Nur die Namen', ziel: 'Zeige nur die Namen aller Monster.', lohn: 20,
    befehle: Q_SELECT,
    tipps: ['Statt * schreibst du den Namen der Spalte.', 'Die Spalte heißt name.', 'SELECT name FROM monster'],
    loesung: 'SELECT name FROM monster' }),
  AUFTRAG({ id: 'd3', kapitel: 11, ico: '❤️', titel: 'Name und Leben', ziel: 'Zeige Name und Leben aller Monster.', lohn: 25,
    befehle: Q_SELECT,
    tipps: ['Mehrere Spalten trennst du mit Komma.', 'Erst name, dann leben.', 'SELECT name, leben FROM monster'],
    loesung: 'SELECT name, leben FROM monster' }),
  AUFTRAG({ id: 'd4', kapitel: 11, ico: '🧑‍🌾', titel: 'Wer wohnt wo?', ziel: 'Zeige Name und Dorf aller Bauern.', lohn: 25, tabellen: ['bauern'],
    befehle: [Q('SELECT name, dorf'), Q('FROM bauern')],
    tipps: ['Diesmal geht es um die Tabelle bauern.', 'Spalten name und dorf.', 'SELECT name, dorf FROM bauern'],
    loesung: 'SELECT name, dorf FROM bauern' }),
  AUFTRAG({ id: 'd5', kapitel: 11, knobel: true, ico: '✖️', titel: 'Doppelt so zäh', ziel: 'Zeige jeden Namen und daneben das doppelte Leben.', lohn: 35,
    befehle: Q_SELECT,
    tipps: ['In SELECT darfst du auch rechnen.', 'leben * 2 ist das doppelte Leben.', 'SELECT name, leben * 2 FROM monster'],
    loesung: 'SELECT name, leben * 2 FROM monster' }),

  // --- Kapitel 12: 🔎 Filtern mit WHERE ---
  AUFTRAG({ id: 'd6', kapitel: 12, ico: '🐀', titel: 'Nur Ratten', ziel: 'Zeige alle Spalten, aber nur die Ratten.', lohn: 30,
    befehle: [...Q_SELECT, ...Q_WHERE], neu: [Q_WHERE[0]],
    merke: { titel: 'Filtern mit WHERE', text: 'WHERE behält nur die Zeilen, für die die Bedingung stimmt. Texte stehen in einfachen Anführungszeichen: art = \'ratte\'. Zahlen ohne: leben > 20.', code: "SELECT *\nFROM monster\nWHERE art = 'ratte'" },
    tipps: ['Hinter FROM monster kommt WHERE.', "Die Art steht in der Spalte art – als Text in 'ratte'.", "SELECT * FROM monster WHERE art = 'ratte'"],
    loesung: "SELECT * FROM monster WHERE art = 'ratte'" }),
  AUFTRAG({ id: 'd7', kapitel: 12, ico: '💪', titel: 'Die Zähen', ziel: 'Zeige Name und Leben aller Monster mit mehr als 20 Leben.', lohn: 30,
    befehle: [...Q_SELECT, Q('WHERE leben > 20')],
    tipps: ['Bei Zahlen gibt es auch < und >.', 'Mehr als 20: leben > 20', 'SELECT name, leben FROM monster WHERE leben > 20'],
    loesung: 'SELECT name, leben FROM monster WHERE leben > 20' }),
  AUFTRAG({ id: 'd8', kapitel: 12, ico: '🧒', titel: 'Junge Bauern', ziel: 'Zeige die Namen aller Bauern, die jünger als 35 Jahre sind.', lohn: 30, tabellen: ['bauern'],
    befehle: [Q('SELECT name'), Q('FROM bauern'), Q('WHERE jahre < 35')],
    tipps: ['Das Alter steht in der Spalte jahre.', 'Jünger als 35: jahre < 35', 'SELECT name FROM bauern WHERE jahre < 35'],
    loesung: 'SELECT name FROM bauern WHERE jahre < 35' }),
  AUFTRAG({ id: 'd33', kapitel: 12, ico: '🏔️', titel: 'Alle aus Steinfeld', ziel: 'Zeige Name und Alter aller Bauern aus Steinfeld.', lohn: 30, tabellen: ['bauern'],
    befehle: [Q('SELECT name, jahre'), Q('FROM bauern'), Q("WHERE dorf = 'Steinfeld'")],
    tipps: ['Das Dorf ist ein Text – also in Anführungszeichen.', "WHERE dorf = 'Steinfeld'", "SELECT name, jahre FROM bauern WHERE dorf = 'Steinfeld'"],
    loesung: "SELECT name, jahre FROM bauern WHERE dorf = 'Steinfeld'" }),
  AUFTRAG({ id: 'd34', kapitel: 12, ico: '🪖', titel: 'Monster mit Rüstung', ziel: 'Zeige Name und Rüstung aller Monster, die überhaupt Rüstung haben.', lohn: 30,
    befehle: [...Q_SELECT, Q('WHERE ruestung > 0')],
    tipps: ['Keine Rüstung heißt: ruestung ist 0.', 'Mehr als 0: ruestung > 0', 'SELECT name, ruestung FROM monster WHERE ruestung > 0'],
    loesung: 'SELECT name, ruestung FROM monster WHERE ruestung > 0' }),
  AUFTRAG({ id: 'd35', kapitel: 12, ico: '🧺', titel: 'Große Körbe', ziel: 'Zeige alle Einträge aus der Ernte, bei denen mindestens 10 Stück geerntet wurden.', lohn: 35, tabellen: ['ernte'],
    befehle: [Q('SELECT *'), Q('FROM ernte'), Q('WHERE menge >= 10')],
    tipps: ['Mindestens 10: >=', 'Alle Spalten: SELECT *', 'SELECT * FROM ernte WHERE menge >= 10'],
    loesung: 'SELECT * FROM ernte WHERE menge >= 10' }),
  AUFTRAG({ id: 'd9', kapitel: 12, ico: '⚡', titel: 'Schnell und stark', ziel: 'Zeige die Namen aller Monster, die mindestens 2 Schaden machen und schneller als 1 sind.', lohn: 35,
    befehle: [...Q_SELECT, ...Q_WHERE, Q('schaden >= 2'), Q('tempo > 1')], neu: [Q_WHERE[1]],
    merke: { titel: 'AND und OR', text: 'Mit AND müssen beide Bedingungen stimmen, mit OR reicht eine. >= heißt „mindestens“, <= „höchstens“.', code: 'WHERE leben >= 20 AND tempo < 1' },
    tipps: ['Zwei Bedingungen, die beide stimmen müssen: AND.', 'Mindestens 2: schaden >= 2', 'SELECT name FROM monster WHERE schaden >= 2 AND tempo > 1'],
    loesung: 'SELECT name FROM monster WHERE schaden >= 2 AND tempo > 1' }),
  AUFTRAG({ id: 'd10', kapitel: 12, ico: '🐺', titel: 'Ratten oder Wölfe', ziel: 'Zeige Name und Art aller Ratten und Wölfe.', lohn: 35,
    befehle: [...Q_SELECT, ...Q_WHERE],
    tipps: ['Ein Monster ist entweder Ratte oder Wolf – es reicht, wenn eins stimmt.', 'Also OR.', "SELECT name, art FROM monster WHERE art = 'ratte' OR art = 'wolf'"],
    loesung: "SELECT name, art FROM monster WHERE art = 'ratte' OR art = 'wolf'" }),
  AUFTRAG({ id: 'd11', kapitel: 12, knobel: true, ico: '🔤', titel: 'Alle mit G', ziel: 'Zeige die Namen aller Monster, die mit G anfangen.', lohn: 45,
    befehle: [...Q_SELECT, Q("WHERE name LIKE 'G%'")],
    tipps: ['LIKE vergleicht mit einem Muster.', '% steht für „irgendwas, beliebig lang“.', "SELECT name FROM monster WHERE name LIKE 'G%'"],
    loesung: "SELECT name FROM monster WHERE name LIKE 'G%'" }),

  // --- Kapitel 13: ↕️ Sortieren ---
  AUFTRAG({ id: 'd12', kapitel: 13, ico: '↕️', titel: 'Nach Leben sortiert', ziel: 'Zeige Name und Leben aller Monster – vom kleinsten zum größten Leben.', lohn: 35,
    befehle: [...Q_SELECT, ...Q_ORDER], neu: [Q_ORDER[0]],
    merke: { titel: 'Sortieren mit ORDER BY', text: 'ORDER BY sortiert das Ergebnis nach einer Spalte – erst klein, dann groß. Mit DESC dahinter geht es andersherum. ORDER BY steht hinter WHERE (nur LIMIT darf noch danach kommen).', code: 'SELECT name, schaden\nFROM monster\nORDER BY schaden' },
    tipps: ['Am Ende der Abfrage: ORDER BY und die Spalte.', 'Klein nach groß ist die normale Reihenfolge.', 'SELECT name, leben FROM monster ORDER BY leben'],
    loesung: 'SELECT name, leben FROM monster ORDER BY leben' }),
  AUFTRAG({ id: 'd13', kapitel: 13, ico: '🏃', titel: 'Die Schnellsten zuerst', ziel: 'Zeige Name und Tempo aller Monster – die schnellsten zuerst.', lohn: 35,
    befehle: [...Q_SELECT, ...Q_ORDER],
    tipps: ['Groß nach klein: DESC.', 'ORDER BY tempo DESC', 'SELECT name, tempo FROM monster ORDER BY tempo DESC'],
    loesung: 'SELECT name, tempo FROM monster ORDER BY tempo DESC' }),
  AUFTRAG({ id: 'd14', kapitel: 13, ico: '🥇', titel: 'Die drei Zähesten', ziel: 'Zeige Name und Leben der drei Monster mit dem meisten Leben.', lohn: 40,
    befehle: [...Q_SELECT, ...Q_ORDER], neu: [Q_ORDER[2]],
    merke: { titel: 'Nur die ersten: LIMIT', text: 'LIMIT 3 schneidet das Ergebnis nach 3 Zeilen ab. Zusammen mit ORDER BY bekommst du so die Größten oder Kleinsten.', code: 'ORDER BY schaden DESC\nLIMIT 2' },
    tipps: ['Erst groß nach klein sortieren, dann abschneiden.', 'ORDER BY leben DESC LIMIT 3', 'SELECT name, leben FROM monster ORDER BY leben DESC LIMIT 3'],
    loesung: 'SELECT name, leben FROM monster ORDER BY leben DESC LIMIT 3' }),
  AUFTRAG({ id: 'd15', kapitel: 13, ico: '🗂️', titel: 'Welche Arten gibt es?', ziel: 'Zeige jede Monsterart genau einmal.', lohn: 40,
    befehle: [Q('SELECT DISTINCT art', true), Q('FROM monster')],
    merke: { titel: 'Jedes nur einmal: DISTINCT', text: 'SELECT DISTINCT lässt doppelte Zeilen weg. So siehst du, welche Werte es überhaupt gibt.', code: 'SELECT DISTINCT art\nFROM monster' },
    tipps: ['Ohne Doppelte: DISTINCT hinter SELECT.', 'Gesucht ist nur die Spalte art.', 'SELECT DISTINCT art FROM monster'],
    loesung: 'SELECT DISTINCT art FROM monster' }),
  AUFTRAG({ id: 'd16', kapitel: 13, knobel: true, ico: '👴', titel: 'Der Älteste aus Mühlbach', ziel: 'Wie heißt der älteste Bauer aus Mühlbach? Zeige nur seinen Namen.', lohn: 50, tabellen: ['bauern'],
    befehle: [Q('SELECT name'), Q('FROM bauern'), Q("WHERE dorf = 'Mühlbach'"), Q('ORDER BY jahre DESC'), Q('LIMIT 1')],
    tipps: ['Erst filtern, dann sortieren, dann abschneiden.', 'WHERE … ORDER BY … LIMIT 1', "SELECT name FROM bauern WHERE dorf = 'Mühlbach' ORDER BY jahre DESC LIMIT 1"],
    loesung: "SELECT name FROM bauern WHERE dorf = 'Mühlbach' ORDER BY jahre DESC LIMIT 1" }),

  // --- Kapitel 14: 🧮 Zählen und Rechnen ---
  AUFTRAG({ id: 'd17', kapitel: 14, ico: '🔢', titel: 'Wie viele Monster?', ziel: 'Wie viele Monster stehen im Buch? Zeige nur die Anzahl.', lohn: 40,
    befehle: [Q('SELECT COUNT(*)', true), Q('FROM monster')],
    merke: { titel: 'Zählen mit COUNT', text: 'COUNT(*) zählt die Zeilen. Statt einer langen Liste bekommst du eine einzige Zahl.', code: 'SELECT COUNT(*)\nFROM monster' },
    tipps: ['Gezählt wird mit COUNT(*).', 'COUNT(*) steht hinter SELECT.', 'SELECT COUNT(*) FROM monster'],
    loesung: 'SELECT COUNT(*) FROM monster' }),
  AUFTRAG({ id: 'd18', kapitel: 14, ico: '🧺', titel: 'Die ganze Ernte', ziel: 'Wie viel wurde insgesamt geerntet? Zeige die Summe der Spalte menge.', lohn: 40, tabellen: ['ernte'],
    befehle: [Q('SELECT SUM(menge)', true), Q('FROM ernte')],
    merke: { titel: 'SUM, AVG, MIN, MAX', text: 'SUM addiert alle Werte einer Spalte, AVG bildet den Durchschnitt, MIN und MAX finden den kleinsten und größten Wert.', code: 'SELECT SUM(menge)\nFROM ernte' },
    tipps: ['Addieren heißt SUM.', 'SUM(menge)', 'SELECT SUM(menge) FROM ernte'],
    loesung: 'SELECT SUM(menge) FROM ernte' }),
  AUFTRAG({ id: 'd19', kapitel: 14, ico: '🐉', titel: 'Das meiste Leben', ziel: 'Wie viel Leben hat das zäheste Monster? Zeige nur die Zahl.', lohn: 40,
    befehle: [Q('SELECT MAX(leben)'), Q('FROM monster')],
    tipps: ['Der größte Wert: MAX.', 'MAX(leben)', 'SELECT MAX(leben) FROM monster'],
    loesung: 'SELECT MAX(leben) FROM monster' }),
  AUFTRAG({ id: 'd20', kapitel: 14, ico: '🥕', titel: 'Alle Rüben', ziel: 'Wie viele Rüben wurden insgesamt geerntet?', lohn: 45, tabellen: ['ernte'],
    befehle: [Q('SELECT SUM(menge)'), Q('FROM ernte'), Q("WHERE frucht = 'Rüben'")],
    tipps: ['Erst nur die Rüben behalten, dann addieren.', "WHERE frucht = 'Rüben'", "SELECT SUM(menge) FROM ernte WHERE frucht = 'Rüben'"],
    loesung: "SELECT SUM(menge) FROM ernte WHERE frucht = 'Rüben'" }),
  AUFTRAG({ id: 'd36', kapitel: 14, knobel: true, ico: '⚖️', titel: 'Der Durchschnitts-Ork', ziel: 'Wie viel Leben hat ein Ork im Durchschnitt?', lohn: 55,
    befehle: [Q('SELECT AVG(leben)'), Q('FROM monster'), Q("WHERE art = 'ork'")],
    tipps: ['Den Durchschnitt bildet AVG.', "Nur die Orks: WHERE art = 'ork'", "SELECT AVG(leben) FROM monster WHERE art = 'ork'"],
    loesung: "SELECT AVG(leben) FROM monster WHERE art = 'ork'" }),

  // --- Kapitel 15: ⭐ Vertiefung (für Profis, ganz am Ende der Burg): Gruppen und Tabellen verbinden ---
  AUFTRAG({ id: 'd21', kapitel: 15, ico: '📊', titel: 'Je Art zählen', ziel: 'Wie viele Monster gibt es von jeder Art? Zeige die Art und die Anzahl.', lohn: 45,
    befehle: [Q('SELECT art, COUNT(*)'), Q('FROM monster'), Q('GROUP BY art', true)],
    merke: { titel: 'Gruppen bilden: GROUP BY', text: 'GROUP BY art steckt alle Zeilen mit derselben Art in eine Gruppe. COUNT, SUM & Co. rechnen dann für jede Gruppe einzeln.', code: 'SELECT ruestung, COUNT(*)\nFROM monster\nGROUP BY ruestung' },
    tipps: ['Für jede Art einzeln zählen: Gruppen bilden.', 'GROUP BY art am Ende.', 'SELECT art, COUNT(*) FROM monster GROUP BY art'],
    loesung: 'SELECT art, COUNT(*) FROM monster GROUP BY art' }),
  AUFTRAG({ id: 'd22', kapitel: 15, ico: '🏆', titel: 'Ernte je Frucht', ziel: 'Zeige jede Frucht mit ihrer Gesamtmenge – die größte Menge zuerst.', lohn: 55, tabellen: ['ernte'],
    befehle: [Q('SELECT frucht, SUM(menge)'), Q('FROM ernte'), Q('GROUP BY frucht'), Q('ORDER BY SUM(menge) DESC')],
    tipps: ['Gruppen je Frucht, darin addieren.', 'Sortieren geht auch nach SUM(menge).', 'SELECT frucht, SUM(menge) FROM ernte GROUP BY frucht ORDER BY SUM(menge) DESC'],
    loesung: 'SELECT frucht, SUM(menge) FROM ernte GROUP BY frucht ORDER BY SUM(menge) DESC' }),

  AUFTRAG({ id: 'd23', kapitel: 15, ico: '🔗', titel: 'Wer hat geerntet?', ziel: 'Zeige zu jeder Ernte den Namen des Bauern, die Frucht und die Menge.', lohn: 45, tabellen: ['bauern', 'ernte'],
    befehle: [Q('JOIN … ON … = …', true)],   // nur das Muster – die fertigen Zeilen waren die Lösung (Selbsttest-Hinweis)
    merke: { titel: 'Tabellen verbinden: JOIN', text: 'Oft steht in einer Tabelle nur die Nummer einer Zeile aus einer anderen Tabelle (ein Fremdschlüssel, z. B. klasse_id). Mit JOIN … ON holst du die passende Zeile dazu: ON sagt, welche Nummer zu welcher id gehört. Gleiche Spaltennamen unterscheidest du mit tabelle.spalte.', code: '-- Beispiel aus einer Schule:\nSELECT schueler.name, klasse.raum\nFROM schueler\nJOIN klasse ON schueler.klasse_id = klasse.id' },
    tipps: ['Die Nummer in ernte.bauer_id gehört zu bauern.id.', 'FROM ernte JOIN bauern ON ernte.bauer_id = bauern.id', 'SELECT bauern.name, ernte.frucht, ernte.menge FROM ernte JOIN bauern ON ernte.bauer_id = bauern.id'],
    loesung: 'SELECT bauern.name, ernte.frucht, ernte.menge FROM ernte JOIN bauern ON ernte.bauer_id = bauern.id' }),
  AUFTRAG({ id: 'd24', kapitel: 15, ico: '🌳', titel: 'Ernte aus Lindenhain', ziel: 'Zeige Name, Frucht und Menge – aber nur für Bauern aus Lindenhain.', lohn: 45, tabellen: ['bauern', 'ernte'],
    befehle: [Q('SELECT bauern.name, ernte.frucht, ernte.menge'), Q('FROM ernte'), Q('JOIN bauern ON ernte.bauer_id = bauern.id'), Q("WHERE bauern.dorf = 'Lindenhain'")],
    tipps: ['Wie eben – nur mit WHERE dahinter.', 'Das Dorf steht in bauern.dorf.', "… JOIN bauern ON ernte.bauer_id = bauern.id WHERE bauern.dorf = 'Lindenhain'"],
    loesung: "SELECT bauern.name, ernte.frucht, ernte.menge FROM ernte JOIN bauern ON ernte.bauer_id = bauern.id WHERE bauern.dorf = 'Lindenhain'" }),
  AUFTRAG({ id: 'd25', kapitel: 15, ico: '🧑‍🌾', titel: 'Ernte je Bauer', ziel: 'Zeige jeden Bauern mit der Menge, die er insgesamt geerntet hat.', lohn: 50, tabellen: ['bauern', 'ernte'],
    befehle: [Q('SELECT bauern.name, SUM(ernte.menge)'), Q('FROM ernte'), Q('JOIN bauern ON ernte.bauer_id = bauern.id'), Q('GROUP BY bauern.name')],
    tipps: ['Verbinden und dann gruppieren.', 'GROUP BY bauern.name', 'SELECT bauern.name, SUM(ernte.menge) FROM ernte JOIN bauern ON ernte.bauer_id = bauern.id GROUP BY bauern.name'],
    loesung: 'SELECT bauern.name, SUM(ernte.menge) FROM ernte JOIN bauern ON ernte.bauer_id = bauern.id GROUP BY bauern.name' }),
  AUFTRAG({ id: 'd26', kapitel: 15, ico: '🏘️', titel: 'Ernte je Dorf', ziel: 'Zeige jedes Dorf mit der Menge, die dort insgesamt geerntet wurde.', lohn: 50, tabellen: ['bauern', 'ernte'],
    befehle: [Q('SELECT bauern.dorf, SUM(ernte.menge)'), Q('FROM ernte'), Q('JOIN bauern ON ernte.bauer_id = bauern.id'), Q('GROUP BY bauern.dorf')],
    tipps: ['Wie „Ernte je Bauer“ – nur nach dem Dorf gruppiert.', 'GROUP BY bauern.dorf', 'SELECT bauern.dorf, SUM(ernte.menge) FROM ernte JOIN bauern ON ernte.bauer_id = bauern.id GROUP BY bauern.dorf'],
    loesung: 'SELECT bauern.dorf, SUM(ernte.menge) FROM ernte JOIN bauern ON ernte.bauer_id = bauern.id GROUP BY bauern.dorf' }),
  AUFTRAG({ id: 'd27', kapitel: 15, knobel: true, ico: '🏅', titel: 'Fleißigste Hand', ziel: 'Wer hat insgesamt am meisten geerntet? Zeige Name und Gesamtmenge – nur diese eine Zeile.', lohn: 60, tabellen: ['bauern', 'ernte'],
    befehle: [Q('SELECT bauern.name, SUM(ernte.menge)'), Q('FROM ernte'), Q('JOIN bauern ON ernte.bauer_id = bauern.id'), Q('GROUP BY bauern.name'), Q('ORDER BY SUM(ernte.menge) DESC'), Q('LIMIT 1')],
    tipps: ['Verbinden, gruppieren, sortieren, abschneiden.', 'ORDER BY SUM(ernte.menge) DESC LIMIT 1', 'Baue auf „Ernte je Bauer“ auf.'],
    loesung: 'SELECT bauern.name, SUM(ernte.menge) FROM ernte JOIN bauern ON ernte.bauer_id = bauern.id GROUP BY bauern.name ORDER BY SUM(ernte.menge) DESC LIMIT 1' }),

  // --- Kapitel 16: ✏️ Daten ändern (pruef = Abfrage, die danach das Ergebnis zeigt) ---
  AUFTRAG({ id: 'd28', kapitel: 16, ico: '➕', titel: 'Ein neuer Bauer', ziel: 'Trag Jonas aus Steinfeld ein: Nummer 20, 29 Jahre alt.', lohn: 50, tabellen: ['bauern'],
    pruef: 'SELECT * FROM bauern ORDER BY id',
    befehle: [Q('INSERT INTO bauern', true), Q("VALUES (20, 'Jonas', 'Steinfeld', 29)")],
    merke: { titel: 'Neue Zeile: INSERT', text: 'INSERT INTO tabelle VALUES (…) fügt eine neue Zeile hinzu. Die Werte stehen in derselben Reihenfolge wie die Spalten, Texte in Anführungszeichen.', code: "INSERT INTO bauern\nVALUES (12, 'Lotte', 'Mühlbach', 41)" },
    tipps: ['Die Spalten von bauern: id, name, dorf, jahre.', 'Texte in einfachen Anführungszeichen.', "INSERT INTO bauern VALUES (20, 'Jonas', 'Steinfeld', 29)"],
    loesung: "INSERT INTO bauern VALUES (20, 'Jonas', 'Steinfeld', 29)" }),
  AUFTRAG({ id: 'd29', kapitel: 16, ico: '🎂', titel: 'Geburtstag', ziel: 'Anna hat Geburtstag: Mach sie ein Jahr älter.', lohn: 50, tabellen: ['bauern'],
    pruef: 'SELECT name, jahre FROM bauern ORDER BY id',
    befehle: [Q('UPDATE bauern', true), Q('SET jahre = jahre + 1'), Q("WHERE name = 'Anna'")],
    merke: { titel: 'Ändern: UPDATE', text: 'UPDATE tabelle SET spalte = neuer Wert ändert Zeilen. Ganz wichtig: WHERE – sonst ändert sich jede Zeile!', code: "UPDATE monster\nSET leben = leben + 5\nWHERE name = 'Flitz'" },
    tipps: ['Nur Anna soll sich ändern – also WHERE.', 'SET jahre = jahre + 1 rechnet mit dem alten Wert.', "UPDATE bauern SET jahre = jahre + 1 WHERE name = 'Anna'"],
    loesung: "UPDATE bauern SET jahre = jahre + 1 WHERE name = 'Anna'" }),
  AUFTRAG({ id: 'd30', kapitel: 16, ico: '🧹', titel: 'Ratten austragen', ziel: 'Die Ratten sind weggezogen. Streiche alle Ratten aus dem Monsterbuch.', lohn: 55,
    pruef: 'SELECT name, art FROM monster ORDER BY name',
    befehle: [Q('DELETE FROM monster', true), Q("WHERE art = 'ratte'")],
    merke: { titel: 'Streichen: DELETE', text: 'DELETE FROM tabelle WHERE … streicht alle Zeilen, für die die Bedingung stimmt. Ohne WHERE ist die ganze Tabelle leer – also vorsichtig!', code: "DELETE FROM monster\nWHERE leben < 5" },
    tipps: ['Gestrichen wird mit DELETE FROM.', "Nur die Ratten: WHERE art = 'ratte'", "DELETE FROM monster WHERE art = 'ratte'"],
    loesung: "DELETE FROM monster WHERE art = 'ratte'" }),
  AUFTRAG({ id: 'd31', kapitel: 16, ico: '🛡️', titel: 'Orks mit Helm', ziel: 'Alle Orks haben Helme bekommen: Erhöhe ihre Rüstung um 1.', lohn: 55,
    pruef: 'SELECT name, ruestung FROM monster ORDER BY name',
    befehle: [Q('UPDATE monster'), Q('SET ruestung = ruestung + 1'), Q("WHERE art = 'ork'")],
    tipps: ['Wie beim Geburtstag – nur für alle Orks.', "WHERE art = 'ork'", "UPDATE monster SET ruestung = ruestung + 1 WHERE art = 'ork'"],
    loesung: "UPDATE monster SET ruestung = ruestung + 1 WHERE art = 'ork'" }),
  AUFTRAG({ id: 'd32', kapitel: 16, knobel: true, ico: '🥬', titel: 'Neuer Name für Kohl', ziel: 'Im Archiv heißt Kohl ab jetzt Weißkohl. Ändere alle Einträge.', lohn: 65, tabellen: ['ernte'],
    pruef: 'SELECT frucht, SUM(menge) FROM ernte GROUP BY frucht ORDER BY frucht',
    befehle: [Q('UPDATE ernte'), Q("SET frucht = 'Weißkohl'"), Q("WHERE frucht = 'Kohl'")],
    tipps: ['Geändert wird der Text in der Spalte frucht.', "SET frucht = 'Weißkohl'", "UPDATE ernte SET frucht = 'Weißkohl' WHERE frucht = 'Kohl'"],
    loesung: "UPDATE ernte SET frucht = 'Weißkohl' WHERE frucht = 'Kohl'" }),
);

// 🔮 Abfragen vorhersagen (PRIMM): Die Abfrage steht fest, man sagt voraus, was herauskommt – in Archiv A.
// lesen.typ: 'zeilen' = alle Zeilen der Tabelle antippen, die herauskommen (soll = Abfrage, die ihre rowids liefert),
// 'erste' = die Zeile antippen, die ganz oben steht, 'zahl' = die Zahl eintippen (pruef = Abfrage danach, z. B. bei UPDATE).
const LESEN = (a) => AUFTRAG({ ico: '🔮', loesung: a.code, befehle: [], ...a,
  tipps: ['Lies die Abfrage Teil für Teil: FROM (welche Tabelle?), WHERE (welche Zeilen?), dann der Rest.', ...a.tipps] });
function nachAuftrag(id, neu) { HOEFE.splice(HOEFE.findIndex((h) => h.id === id) + 1, 0, neu); }
nachAuftrag('d6', LESEN({ id: 'd6v', kapitel: 12, titel: 'Wen findet WHERE?', lohn: 30, tabellen: ['monster'],
  ziel: 'Tippe alle Monster an, die diese Abfrage liefert. Dann ✔ Prüfen.',
  lesen: { typ: 'zeilen', tabelle: 'monster', soll: 'SELECT rowid FROM monster WHERE leben > 15' },
  merke: { titel: '🔮 Abfragen vorhersagen', text: 'Hier ist die Abfrage schon fertig. Sag voraus, was herauskommt: Tippe in der Tabelle die passenden Zeilen an (nochmal tippen = abwählen) und dann ✔ Prüfen.' },
  tipps: ['Nur Monster mit mehr als 15 Leben – genau 15 zählt nicht.'],
  code: 'SELECT name, leben\nFROM monster\nWHERE leben > 15' }));
nachAuftrag('d9', LESEN({ id: 'd9v', kapitel: 12, titel: 'AND oder OR?', lohn: 35, tabellen: ['monster'],
  ziel: 'Tippe alle Monster an, die diese Abfrage liefert. Dann ✔ Prüfen.',
  lesen: { typ: 'zeilen', tabelle: 'monster', soll: "SELECT rowid FROM monster WHERE art = 'geist' OR schaden >= 3" },
  tipps: ['Bei OR reicht es, wenn eine Bedingung stimmt.', 'Alle Geister – und dazu alle mit mindestens 3 Schaden.'],
  code: "SELECT name\nFROM monster\nWHERE art = 'geist' OR schaden >= 3" }));
nachAuftrag('d12', LESEN({ id: 'd12v', kapitel: 13, titel: 'Wer steht oben?', lohn: 35, tabellen: ['monster'],
  ziel: 'Tippe das Monster an, das bei dieser Abfrage ganz oben steht.',
  lesen: { typ: 'erste', tabelle: 'monster', soll: 'SELECT rowid FROM monster ORDER BY tempo' },
  tipps: ['ORDER BY ohne DESC: das Kleinste zuerst.', 'Gesucht ist das langsamste Monster.'],
  code: 'SELECT name, tempo\nFROM monster\nORDER BY tempo' }));
nachAuftrag('d14', LESEN({ id: 'd14v', kapitel: 13, titel: 'Die drei Schnellsten', lohn: 40, tabellen: ['monster'],
  ziel: 'Tippe die Monster an, die diese Abfrage liefert. Dann ✔ Prüfen.',
  lesen: { typ: 'zeilen', tabelle: 'monster', soll: 'SELECT rowid FROM monster ORDER BY tempo DESC LIMIT 3' },
  tipps: ['DESC: das Größte zuerst. LIMIT 3: nur die ersten drei.', 'Such die drei mit dem höchsten Tempo.'],
  code: 'SELECT name, tempo\nFROM monster\nORDER BY tempo DESC\nLIMIT 3' }));
nachAuftrag('d17', LESEN({ id: 'd17v', kapitel: 14, titel: 'Was zählt COUNT?', lohn: 40, tabellen: ['monster'],
  ziel: 'Welche Zahl liefert diese Abfrage? Tipp sie ein.',
  lesen: { typ: 'zahl' },
  tipps: ['COUNT(*) zählt die Zeilen, die nach WHERE übrig bleiben.', 'Zähl alle Orks und Trolle.'],
  code: "SELECT COUNT(*)\nFROM monster\nWHERE art = 'ork' OR art = 'troll'" }));
nachAuftrag('d20', LESEN({ id: 'd20v', kapitel: 14, titel: 'Was rechnet SUM?', lohn: 45, tabellen: ['ernte'],
  ziel: 'Welche Zahl liefert diese Abfrage? Tipp sie ein.',
  lesen: { typ: 'zahl' },
  tipps: ['Erst nur die Zeilen aus Woche 1, dann die Mengen addieren.', 'Schau in der Spalte woche nach der 1.'],
  code: 'SELECT SUM(menge)\nFROM ernte\nWHERE woche = 1' }));
nachAuftrag('d23', LESEN({ id: 'd23v', kapitel: 15, titel: 'Was gehört zu Anna?', lohn: 45, tabellen: ['bauern', 'ernte'],
  ziel: 'Tippe in der Tabelle ernte alle Zeilen an, die diese Abfrage liefert. Dann ✔ Prüfen.',
  lesen: { typ: 'zeilen', tabelle: 'ernte', soll: "SELECT ernte.rowid FROM ernte JOIN bauern ON ernte.bauer_id = bauern.id WHERE bauern.name = 'Anna'" },
  tipps: ['Welche id hat Anna in der Tabelle bauern?', 'In ernte gehören alle Zeilen mit dieser bauer_id zu ihr.'],
  code: "SELECT ernte.frucht, ernte.menge\nFROM ernte\nJOIN bauern ON ernte.bauer_id = bauern.id\nWHERE bauern.name = 'Anna'" }));
nachAuftrag('d29', LESEN({ id: 'd29v', kapitel: 16, titel: 'Wie alt danach?', lohn: 50, tabellen: ['bauern'],
  ziel: 'Nach diesen Änderungen: Wie viele Jahre ist Bruno alt? Tipp die Zahl ein.',
  lesen: { typ: 'zahl', pruef: "SELECT jahre FROM bauern WHERE name = 'Bruno'" },
  tipps: ['Bruno wohnt in Lindenhain – also gilt die erste Änderung für ihn.', 'Gilt die zweite auch? Prüf seinen Namen.'],
  code: "UPDATE bauern SET jahre = jahre + 2 WHERE dorf = 'Lindenhain';\nUPDATE bauern SET jahre = jahre + 10 WHERE name = 'Anna'" }));

// --- 📚 Transfer: die Schulbibliothek (eigene Datenbank, Fassung A und B wie 🗄️ KOENIGREICH_DB) ---
// Am Ende eines Kapitels dasselbe Werkzeug in neuer Lage (Didaktik-Prüfung: „Übertragen fehlt“). Dazu MIN, Fehler finden und Datenschutz.
const BIB_DB = {
  schema: {
    buch: [['id', 'INTEGER PRIMARY KEY'], ['titel', 'TEXT'], ['autor', 'TEXT'], ['genre', 'TEXT'], ['jahr', 'INTEGER'], ['seiten', 'INTEGER'], ['ausgeliehen', 'INTEGER']],
    leser: [['id', 'INTEGER PRIMARY KEY'], ['name', 'TEXT'], ['klasse', 'TEXT'], ['geburtstag', 'TEXT'], ['strasse', 'TEXT'], ['telefon', 'TEXT'], ['ueberfaellig', 'INTEGER']],
  },
  daten: (v) => (v === 'A' ? {
    buch: [[1, 'Die Burg im Nebel', 'Mara Stein', 'Fantasy', 2019, 320, 1], [2, 'Rübenrätsel', 'Ole Hahn', 'Krimi', 2021, 180, 0], [3, 'Kodex der Eule', 'Lina Berg', 'Fantasy', 2015, 410, 0],
      [4, 'Sternenschiff Nova', 'Tom Weiß', 'Science-Fiction', 2022, 290, 1], [5, 'Das Geheimnis der Mühle', 'Ole Hahn', 'Krimi', 2018, 120, 1], [6, 'Python für Burgleute', 'Ada Kurz', 'Sachbuch', 2023, 250, 0],
      [7, 'Drachenei', 'Mara Stein', 'Fantasy', 2023, 280, 1], [8, 'Der kleine Roboter', 'Tom Weiß', 'Science-Fiction', 2016, 96, 0], [9, 'Lichter über dem See', 'Lina Berg', 'Fantasy', 2020, 350, 0],
      [10, 'Wie Tiere schlafen', 'Ida Fuchs', 'Sachbuch', 2017, 140, 1], [11, 'Mops und Moppel', 'Ida Fuchs', 'Comic', 2024, 64, 0]],
    leser: [[1, 'Mia', '9a', '2011-03-14', 'Burgweg 3', '0123 45601', 0], [2, 'Ben', '9b', '2010-11-02', 'Mühlgasse 7', '0123 45602', 2], [3, 'Lea', '9b', '2011-06-21', 'Am Teich 1', '0123 45603', 0],
      [4, 'Noah', '9a', '2011-01-30', 'Lindenweg 4', '0123 45604', 1], [5, 'Emil', '9c', '2010-09-09', 'Steinfeld 2', '0123 45605', 0], [6, 'Sofia', '9b', '2011-08-17', 'Burgweg 9', '0123 45606', 1]],
  } : {
    buch: [[1, 'Die Burg im Nebel', 'Mara Stein', 'Fantasy', 2019, 320, 0], [2, 'Rübenrätsel', 'Ole Hahn', 'Krimi', 2021, 180, 1], [3, 'Kodex der Eule', 'Lina Berg', 'Fantasy', 2015, 300, 1],
      [4, 'Sternenschiff Nova', 'Tom Weiß', 'Science-Fiction', 2022, 290, 0], [5, 'Das Geheimnis der Mühle', 'Ole Hahn', 'Krimi', 2018, 120, 0], [6, 'Python für Burgleute', 'Ada Kurz', 'Sachbuch', 2023, 250, 1],
      [7, 'Drachenei', 'Mara Stein', 'Fantasy', 2025, 380, 1], [8, 'Der kleine Roboter', 'Tom Weiß', 'Science-Fiction', 2016, 110, 1], [9, 'Lichter über dem See', 'Lina Berg', 'Fantasy', 2020, 350, 1],
      [10, 'Wie Tiere schlafen', 'Ida Fuchs', 'Sachbuch', 2017, 140, 0], [11, 'Mops und Moppel', 'Ida Fuchs', 'Comic', 2024, 72, 0], [12, 'Die Eulenpost', 'Mara Stein', 'Fantasy', 2021, 410, 0],
      [13, 'Zahlenzauber', 'Ada Kurz', 'Sachbuch', 2012, 88, 1], [14, 'Comic-Ritter', 'Ole Hahn', 'Comic', 2024, 80, 0]],
    leser: [[1, 'Jonas', '9c', '2010-12-01', 'Bachstraße 2', '0123 45611', 1], [2, 'Ida', '9b', '2011-02-11', 'Mühlgasse 3', '0123 45612', 3], [3, 'Karl', '9a', '2011-05-05', 'Am Teich 8', '0123 45613', 0],
      [4, 'Paula', '9b', '2010-10-20', 'Lindenweg 1', '0123 45614', 0], [5, 'Tim', '9b', '2011-07-07', 'Burgweg 5', '0123 45615', 2], [6, 'Nele', '9a', '2011-04-04', 'Steinfeld 6', '0123 45616', 0],
      [7, 'Ole', '9c', '2010-08-18', 'Am Markt 1', '0123 45617', 1]],
  }),
};
const BIB = (a) => AUFTRAG({ db: BIB_DB, tabellen: ['buch'], befehle: [], ...a });
nachAuftrag('d5', BIB({ id: 'd43', kapitel: 11, ico: '🔐', titel: 'Nur was nötig ist', lohn: 30, tabellen: ['leser'],
  ziel: 'Für die neuen Bibliotheksausweise braucht die Druckerei nur Name und Klasse. Zeige genau diese beiden Spalten – nicht mehr.',
  merke: { titel: '🔐 Datenschutz', text: 'Name, Geburtstag, Adresse und Telefon sind personenbezogene Daten – die Datenschutz-Grundverordnung (DSGVO) schützt sie. Darum gilt: nur so viel speichern und weitergeben, wie für den Zweck nötig ist (Datensparsamkeit). Mit SELECT wählst du genau die Spalten aus, die jemand braucht.', code: '-- nicht alles weitergeben:\nSELECT * FROM leser\n-- sondern nur, was gebraucht wird, z. B.:\nSELECT name FROM leser' },
  tipps: ['Wozu braucht die Druckerei den Geburtstag oder die Telefonnummer? Gar nicht.', 'Zwei Spalten hinter SELECT, mit Komma getrennt.', 'SELECT name, klasse FROM leser'],
  story: 'Die Schulbibliothek der Burg bittet um Hilfe! Herr Blattwerk will Ausweise drucken lassen. „Schick der Druckerei einfach die ganze Leserliste“, sagt er. Halt – da stehen Adressen und Telefonnummern drin!',
  danach: 'Genau so: Die Druckerei bekommt nur, was sie braucht. Adressen und Telefonnummern bleiben in der Bibliothek.',
  loesung: 'SELECT name, klasse FROM leser' }));
nachAuftrag('d11', BIB({ id: 'd37', kapitel: 12, ico: '📚', titel: 'Dicke Fantasy-Bücher', lohn: 35,
  ziel: 'Zeige Titel und Autor aller Fantasy-Bücher mit mehr als 300 Seiten.',
  tipps: ['Zwei Bedingungen, die beide stimmen müssen.', "Das Genre ist ein Text: genre = 'Fantasy'", "SELECT titel, autor FROM buch WHERE genre = 'Fantasy' AND seiten > 300"],
  story: 'Herr Blattwerk aus der Schulbibliothek schon wieder: Eine Schülerin liest nur Fantasy – und nur richtig dicke Bücher. Was können wir ihr geben?',
  danach: 'Sie hat sich gleich zwei ausgeliehen.',
  loesung: "SELECT titel, autor FROM buch WHERE genre = 'Fantasy' AND seiten > 300" }));
nachAuftrag('d37', BIB({ id: 'd41', kapitel: 12, ico: '🐞', titel: 'Eins fehlt', lohn: 40,
  ziel: 'Gesucht sind alle Bücher mit höchstens 120 Seiten. Die Abfrage im Editor vergisst eins. Finde den Fehler und verbessere sie.',
  vorlage: 'SELECT titel, seiten\nFROM buch\nWHERE seiten < 120',
  tipps: ['Vergleiche das Ziel links mit der Tabelle buch: Welches dünne Buch fehlt in deiner Abfrage? Wie viele Seiten hat es?', '„Höchstens 120“ heißt: 120 ist noch erlaubt.', 'WHERE seiten <= 120'],
  story: 'Für die Leseanfänger der 5. Klasse sucht Herr Blattwerk dünne Bücher: höchstens 120 Seiten. Seine Abfrage hat er selbst geschrieben – aber irgendwas fehlt.',
  danach: 'Jetzt ist auch „Das Geheimnis der Mühle“ dabei – genau 120 Seiten.',
  loesung: 'SELECT titel, seiten FROM buch WHERE seiten <= 120' }));
nachAuftrag('d16', BIB({ id: 'd38', kapitel: 13, ico: '🆕', titel: 'Die neuesten Bücher', lohn: 40,
  ziel: 'Zeige Titel und Erscheinungsjahr der drei neuesten Bücher.',
  tipps: ['Neu heißt: großes Jahr. Also groß nach klein sortieren.', 'Dann nach drei Zeilen abschneiden.', 'SELECT titel, jahr FROM buch ORDER BY jahr DESC LIMIT 3'],
  story: 'Für das Schaufenster der Bibliothek: die drei neuesten Bücher!',
  danach: 'Das Schaufenster sieht toll aus.',
  loesung: 'SELECT titel, jahr FROM buch ORDER BY jahr DESC LIMIT 3' }));
nachAuftrag('d36', BIB({ id: 'd39', kapitel: 14, ico: '📕', titel: 'Wie viele sind weg?', lohn: 45,
  ziel: 'Wie viele Bücher sind gerade ausgeliehen? In der Spalte ausgeliehen steht 1 für „ausgeliehen“ und 0 für „im Regal“.',
  tipps: ['Erst nur die ausgeliehenen Bücher behalten, dann zählen.', 'WHERE ausgeliehen = 1', 'SELECT COUNT(*) FROM buch WHERE ausgeliehen = 1'],
  story: 'Herr Blattwerk staunt über die leeren Regale. Wie viele Bücher sind gerade unterwegs?',
  danach: 'Eine Zahl – und Herr Blattwerk weiß, wie viele Rückgaben er erwartet.',
  loesung: 'SELECT COUNT(*) FROM buch WHERE ausgeliehen = 1' }));
nachAuftrag('d39', BIB({ id: 'd42', kapitel: 14, ico: '📏', titel: 'Das dünnste Buch', lohn: 45,
  ziel: 'Wie viele Seiten hat das dünnste Buch der Bibliothek? Zeige nur die Zahl.',
  muss: [/\bmin\s*\(/i, 'Hier soll SQL den kleinsten Wert selbst ausrechnen – mit einer Funktion aus dem Merke „SUM, AVG, MIN, MAX“, nicht mit ORDER BY und LIMIT.'],
  tipps: ['Den kleinsten Wert einer Spalte findet eine der Funktionen aus dem Merke „SUM, AVG, MIN, MAX“.', 'MIN(seiten)', 'SELECT MIN(seiten) FROM buch'],
  story: 'Ein Erstklässler fragt: „Was ist das dünnste Buch, das ihr habt?“ Erst einmal: Wie dünn ist es denn?',
  danach: 'Das schafft er bestimmt an einem Nachmittag.',
  loesung: 'SELECT MIN(seiten) FROM buch' }));
nachAuftrag('d32', BIB({ id: 'd40', kapitel: 16, ico: '📬', titel: 'Alles zurück', lohn: 55, tabellen: ['leser'],
  pruef: 'SELECT name, klasse, ueberfaellig FROM leser ORDER BY id',
  ziel: 'Die ganze 9b hat ihre Bücher zurückgebracht. Setze bei allen aus der 9b die Zahl der überfälligen Bücher (ueberfaellig) auf 0.',
  tipps: ['Geändert wird mit UPDATE … SET …', 'Nur die 9b: WHERE klasse = …', "UPDATE leser SET ueberfaellig = 0 WHERE klasse = '9b'"],
  story: 'Die 9b hat aufgeräumt und einen ganzen Korb Bücher zurückgebracht! Jetzt muss die Leserliste stimmen – sonst bekommen sie Mahnungen.',
  danach: 'Keine Mahnung für die 9b. Herr Blattwerk sortiert die Bücher wieder ein.',
  loesung: "UPDATE leser SET ueberfaellig = 0 WHERE klasse = '9b'" }));

// 🦉 Geschichte wie bei SQL Island: Archivarin Eulalia gibt jeden Auftrag (story) und sagt, was die Antwort bewirkt (danach)
const ARCHIV_STORY = {
  d1: ['Willkommen im Archiv der Burg! Ich bin Eulalia. Seit Tagen kommen Monster – aber wer sind sie eigentlich? Hol mir das ganze Monsterbuch.', 'Was für ein Buch! Jetzt wissen wir, mit wem wir es nachts zu tun haben.'],
  d2: ['Der Herold will die Monster ausrufen – er braucht nur ihre Namen, sonst nichts.', 'Der Herold übt schon: „Flitz! Glibber! Glutzahn!“'],
  d3: ['Die Turmwachen fragen: Wie viel hält jedes Monster aus?', 'Jetzt wissen die Wachen, wen sie zuerst ins Visier nehmen.'],
  d4: ['Der Bote soll Briefe verteilen. Wer wohnt in welchem Dorf?', 'Der Bote sattelt sein Pony und reitet los.'],
  d5: ['Gerüchte sagen, die Monster werden nachts zäher – doppelt so zäh! Wie viel wäre das?', 'Gut zu wissen. Wir bauen lieber noch einen Turm.'],
  d6: ['In der Speisekammer knabbert es! Zeig mir alles über die Ratten.', 'Die Katze ist informiert. Die Ratten sollten sich vorsehen.'],
  d7: ['Für die Katapulte suchen wir die zähen Brocken: alle mit mehr als 20 Leben.', 'Die Katapult-Leute nicken – genau ihre Kragenweite.'],
  d8: ['Für das Erntefest suchen wir junge Helfer: alle Bauern unter 35.', 'Die jungen Helfer stellen schon die Bänke auf.'],
  d9: ['Gefährlich sind die, die schnell UND stark sind. Wer ist das?', 'Die Torwache verstärkt sich vor genau diesen Monstern.'],
  d10: ['Der Jäger kennt sich nur mit Ratten und Wölfen aus. Welche gibt es davon?', 'Der Jäger zieht seine Stiefel an.'],
  d11: ['Ein altes Rätsel im Archiv: „Fürchte die, deren Name mit G beginnt.“ Welche sind das?', 'Unheimlich! Ich lege das Rätsel in die Schublade für später.'],
  d12: ['Für die Übungsstunde der Bogenschützen: alle Monster, die leichtesten zuerst.', 'Die Bogenschützen fangen mit den Kleinen an.'],
  d13: ['Wer rennt am schnellsten aufs Tor zu? Die Schnellsten zuerst, bitte!', 'Für die Flinken bauen wir einen Eisturm.'],
  d14: ['Der Burgherr will nur die drei Zähesten sehen – mehr Zeit hat er nicht.', 'Der Burgherr runzelt die Stirn und bestellt mehr Steine.'],
  d15: ['Für mein neues Regal brauche ich jede Monsterart genau einmal.', 'Das Regal hat jetzt für jede Art ein eigenes Fach.'],
  d16: ['Mühlbach feiert seinen ältesten Bauern. Wer ist es?', 'Das Dorf backt einen riesigen Kuchen.'],
  d17: ['Der Burgherr fragt nur: Wie viele Monster sind es? Eine Zahl genügt.', 'Eine Zahl – genau so mag es der Burgherr.'],
  d18: ['Der Speicher wird voll! Wie viel wurde insgesamt geerntet?', 'Wir brauchen wohl einen zweiten Speicher.'],
  d19: ['Wie zäh ist das zäheste Monster? Davon hängt ab, wie dick die Mauer sein muss.', 'Die Maurer seufzen und holen mehr Steine.'],
  d20: ['Die Rübensuppe für alle: Wie viele Rüben haben wir?', 'Das reicht für einen großen Topf Suppe!'],
  d21: ['Für die Monsterkarte: Wie viele gibt es von jeder Art?', 'Die Karte ist fertig. Ich hänge sie in den Turm.'],
  d22: ['Welche Frucht bringt am meisten? Die größte Menge zuerst.', 'Nächstes Jahr pflanzen wir mehr davon.'],
  d23: ['Im Erntebuch stehen nur Nummern statt Namen. Wer hat was geerntet?', 'Endlich wissen wir, wem wir danken müssen.'],
  d24: ['Lindenhain will wissen, was seine Bauern geerntet haben.', 'Lindenhain hängt die Liste am Brunnen auf.'],
  d25: ['Wer hat insgesamt wie viel geerntet?', 'Jeder Bauer bekommt einen Dank – und ein Stück Kuchen.'],
  d26: ['Welches Dorf hat am meisten geschafft? Erst einmal alle Summen.', 'Die Dörfer necken sich schon um den ersten Platz.'],
  d27: ['Wer ist die fleißigste Hand im ganzen Land?', 'Ein Hoch auf die fleißigste Hand! 🎉'],
  d28: ['Ein neuer Bauer ist zugezogen: Jonas aus Steinfeld. Trag ihn ein!', 'Willkommen, Jonas! Er bekommt den Hof am Bach.'],
  d29: ['Psst, Anna hat heute Geburtstag! Mach sie im Archiv ein Jahr älter.', 'Alles Gute, Anna! 🎂'],
  d30: ['Die Ratten sind ins Nachbarland weitergezogen. Streich sie aus dem Buch.', 'Ruhe in der Speisekammer – endlich!'],
  d31: ['Die Orks tragen jetzt Helme. Das muss ins Buch!', 'Die Turmwachen schärfen ihre Pfeile.'],
  d32: ['Der Koch besteht darauf: Es heißt Weißkohl, nicht Kohl!', 'Der Koch ist zufrieden und rührt weiter.'],
  d33: ['Steinfeld schickt Helfer für die Mauer. Wer wohnt dort, und wie alt sind sie?', 'Die Steinfelder bringen gleich ihre Werkzeuge mit.'],
  d34: ['Unsere Pfeile prallen manchmal ab! Welche Monster tragen Rüstung?', 'Gegen die nehmen wir lieber das Katapult.'],
  d35: ['Der Händler kauft nur große Körbe – ab 10 Stück. Welche Einträge kommen in Frage?', 'Der Händler reibt sich die Hände.'],
  d36: ['Ein Gelehrter fragt: Wie zäh ist ein Ork im Durchschnitt?', 'Der Gelehrte schreibt die Zahl sorgfältig in sein Buch.'],
  d6v: ['Ein Lehrling hat diese Abfrage geschrieben. Bevor wir sie fragen: Wen wird sie wohl finden?', 'Genau die! Der Lehrling staunt, wie gut du lesen kannst.'],
  d9v: ['Hier steht OR, nicht AND. Macht das einen Unterschied? Sag voraus, wen sie findet.', 'Richtig – mit OR reicht eine Bedingung.'],
  d12v: ['Der Herold liest die Liste von oben vor. Wer kommt zuerst dran?', 'Der Herold räuspert sich und beginnt.'],
  d14v: ['Für das Wettrennen der Monster: Wer landet auf dem Treppchen?', 'Das Treppchen ist besetzt! 🥇🥈🥉'],
  d17v: ['Der Burgherr will nur eine Zahl. Welche wird ihm die Abfrage sagen?', 'Stimmt genau. Der Burgherr nickt zufrieden.'],
  d20v: ['Was ist in der ersten Woche zusammengekommen?', 'Genau so viel steht im Speicherbuch.'],
  d23v: ['Anna fragt, was das Archiv über ihre Ernte weiß. Welche Einträge gehören zu ihr?', 'Anna erkennt jede einzelne Kiste wieder.'],
  d29v: ['Zwei Änderungen hintereinander – rechne mit: Wie alt ist Bruno danach?', 'Richtig gerechnet! Bruno lacht: „So alt fühle ich mich gar nicht.“'],
};
for (const h of HOEFE) if (ARCHIV_STORY[h.id]) [h.story, h.danach] = ARCHIV_STORY[h.id];
// 🔮 Nach dem Vorhersagen: der Grenzfall, über den man stolpert (erklaerung steht auf der Ergebniskarte, auch beim Auflösen)
const ARCHIV_GRENZFALL = {
  d6v: 'Grenzfall: Nebelchen hat genau 15 Leben – 15 ist nicht größer als 15, also fehlt Nebelchen. Glibber mit 16 ist dabei.',
  d9v: 'Bei OR reicht eine Bedingung: Brummbart ist kein Geist, macht aber 3 Schaden – darum ist Brummbart dabei.',
  d12v: 'Ohne DESC steht der kleinste Wert oben: Glutzahn ist mit Tempo 0,55 am langsamsten.',
  d14v: 'Graupelz ist mit Tempo 1,4 Vierter – LIMIT 3 schneidet ihn ab.',
  d17v: 'COUNT(*) zählt Zeilen, nicht Leben: 2 Orks und 1 Troll sind 3 Zeilen.',
  d20v: 'Nur die vier Zeilen aus Woche 1 zählen: 12 + 5 + 20 + 4 = 41.',
  d23v: 'Anna hat die id 1. Alle drei Zeilen mit bauer_id 1 gehören zu ihr – auch die aus Woche 4.',
  d29v: 'Bruno wohnt in Lindenhain (+2), heißt aber nicht Anna (+10 gilt nicht für ihn): 51 + 2 = 53.',
};
for (const h of HOEFE) if (ARCHIV_GRENZFALL[h.id]) h.erklaerung = ARCHIV_GRENZFALL[h.id];
// 🧩 Hilfe-Zeilen in Burg 9 als Gerüst: Werte werden zu „…“ ('ratte' → '…', 20 → …); außer beim Einführungsauftrag auch die Spalten
// hinter SELECT, GROUP BY und ORDER BY. So zeigt die Hilfe nach einem Fehlversuch den Aufbau, aber nicht die Lösung.
const sqlGeruest = (t, spalten) => {
  let s = t.replace(/'[^']*'/g, "'…'").replace(/(?<![\w.])\d+(\.\d+)?\b/g, '…');
  if (spalten) s = s.replace(/^(SELECT(?:\s+DISTINCT)?|GROUP BY|ORDER BY)\s+(?!\*$)(.+?)(\s+DESC)?$/i, (m, kw, mitte, desc) => `${kw} …${desc || ''}`);
  return s;
};
for (const h of HOEFE) {
  if (h.art !== 'sql' || h.db || h.lesen || hofBurg(h) !== 9) continue;
  h.befehle = h.befehle.map((b) => {
    const t = sqlGeruest(b.text, true);
    return t === b.text ? b : { ...b, text: t, zeigt: t, hilfe: true, neu: b.neu || (h.neu || []).includes(b) };
  });
}

// --- Prüfen: Ergebnis der Schüler gegen das der Musterlösung ---
const sqlNorm = (v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v);
const sqlSchluessel = (zeile) => JSON.stringify(zeile.map(sqlNorm));
function sqlVergleich(ist, soll, geordnet) {
  if (ist.fehler) return { ok: false, msg: ist.fehler, anteil: 0 };
  if (ist.cols.length !== soll.cols.length) {
    return { ok: false, msg: `Dein Ergebnis hat ${ist.cols.length} Spalte${ist.cols.length === 1 ? '' : 'n'}, gesucht ${soll.cols.length === 1 ? 'ist' : 'sind'} ${soll.cols.length}.`, anteil: 0.2 };
  }
  const rest = new Map();
  for (const z of soll.rows) { const k = sqlSchluessel(z); rest.set(k, (rest.get(k) || 0) + 1); }
  let treffer = 0;
  for (const z of ist.rows) { const k = sqlSchluessel(z); if (rest.get(k) > 0) { rest.set(k, rest.get(k) - 1); treffer++; } }
  const anteil = treffer / Math.max(1, soll.rows.length, ist.rows.length);
  const fehlen = soll.rows.length - treffer, zuviel = ist.rows.length - treffer;
  if (!fehlen && !zuviel) {
    // Reihenfolge: nur die Spalten vergleichen, nach denen die Musterlösung sortiert – bei Gleichstand (zwei Monster mit
    // 18 Leben) ist jede Reihenfolge richtig (Spieltest: „ORDER BY leben, name“ wurde abgelehnt). Unbekannte Spalte → ganze Zeile.
    const idx = (geordnet || []).map((c) => soll.cols.findIndex((s) => s.toLowerCase() === c));
    const key = (z) => (idx.length && idx.every((i) => i >= 0) ? sqlSchluessel(idx.map((i) => z[i])) : sqlSchluessel(z));
    if (geordnet && ist.rows.some((z, i) => key(z) !== key(soll.rows[i]))) return { ok: false, msg: 'Die Zeilen stimmen – aber die Reihenfolge noch nicht.', anteil: 0.8 };
    return { ok: true, msg: `${soll.rows.length} Zeile${soll.rows.length === 1 ? '' : 'n'} – genau richtig!`, anteil: 1 };
  }
  const teile = [fehlen && `${fehlen} Zeile${fehlen === 1 ? ' fehlt' : 'n fehlen'}`, zuviel && `${zuviel} Zeile${zuviel === 1 ? ' ist' : 'n sind'} zu viel oder anders`].filter(Boolean);
  return { ok: false, msg: `${teile.join(', ')}.`, anteil };
}
// Sortierspalten der Musterlösung (kleingeschrieben, ohne ASC/DESC) – oder null, wenn nicht sortiert wird
function sqlGeordnet(h) {
  const m = /order\s+by\s+(.+?)(\s+limit\b|;|$)/is.exec(h.pruef || h.loesung);
  return m ? m[1].split(',').map((t) => t.trim().replace(/\s+(asc|desc)$/i, '').split('.').pop().toLowerCase()) : null;
}

// --- ⌨️ SQL-Bausteinleiste (Didaktik-Prüfung 2026-11-13: fertige Zeilen wie „WHERE leben > 20“ waren oft schon die Lösung) ---
// Standard: nur WÖRTER – die Schlüsselwörter, die man bis zu diesem Auftrag kennengelernt hat (Musterlösungen und Merke der
// früheren Aufträge derselben Burg), die Namen der gezeigten Tabellen und Spalten und die Zeichen (= < > , ( ) ').
// Werte und Bedingungen schreibt man selbst. Ganze Zeilen (h.befehle) gibt es nur
//   · beim Einführungsauftrag eines Bausteins (h.merke), · als Hilfe nach einem Fehlversuch (versuche > 0, noch nicht gelöst),
//   · wenn der Auftrag es so will. Zeilen mit „…“ sind Muster ohne Lösung und erscheinen immer.
// Steuerung je Auftrag (auch in kontor.js/abitur.js): leiste: 'zeilen' (immer ganze Zeilen) | 'woerter' (nie ganze Zeilen, auch nicht
// nach Fehlversuch) | ['SELECT', …] (genau diese Wörter); woerter: ['…'] = zusätzliche Wörter.
const SQL_WOERTER = [   // [Knopf, Regex für die Musterlösungen, beginnt eine neue Zeile?]
  ['SELECT', /\bselect\b/i, true], ['DISTINCT', /\bdistinct\b/i], ['*', /select\s+(distinct\s+)?\*/i], ['FROM', /\bfrom\b/i, true],
  ['WHERE', /\bwhere\b/i, true], ['AND', /\band\b/i], ['OR', /\bor\b/i], ['NOT', /\bnot\b/i], ['LIKE', /\blike\b/i], ['IN', /\bin\s*\(/i],
  ['IS NULL', /\bis\s+(not\s+)?null\b/i], ['BETWEEN', /\bbetween\b/i],
  ['ORDER BY', /\border\s+by\b/i, true], ['DESC', /\bdesc\b/i], ['LIMIT', /\blimit\b/i, true],
  ['COUNT(*)', /\bcount\(\s*\*\s*\)/i], ['COUNT(', /\bcount\(\s*(distinct\s+)?\w/i], ['SUM(', /\bsum\b/i], ['AVG(', /\bavg\b/i], ['MIN(', /\bmin\b/i], ['MAX(', /\bmax\b/i],
  ['ROUND(', /\bround\(/i], ['AS', /\bas\b/i],
  ['GROUP BY', /\bgroup\s+by\b/i, true], ['HAVING', /\bhaving\b/i, true],
  ['JOIN', /(?<!(left|inner)\s+)\bjoin\b/i, true], ['INNER JOIN', /\binner\s+join\b/i, true], ['LEFT JOIN', /\bleft\s+join\b/i, true], ['ON', /\bon\b/i],
  ['INSERT INTO', /\binsert\s+into\b/i, true], ['VALUES', /\bvalues\b/i, true], ['UPDATE', /\bupdate\b/i, true], ['SET', /\bset\b/i, true], ['DELETE FROM', /\bdelete\s+from\b/i, true],
  ['CREATE TABLE', /\bcreate\s+table\b/i, true], ['PRIMARY KEY', /\bprimary\s+key\b/i], ['REFERENCES', /\breferences\b/i], ['INTEGER', /\binteger\b/i], ['TEXT', /\btext\b/i], ['REAL', /\breal\b/i],
];
const SQL_ZEILE = new Set(SQL_WOERTER.filter((w) => w[2]).map((w) => w[0]));
// Grundwortschatz aus Burg 9 für eigene Datenbanken (🗄️ LK Daten, 🎓 Abitur): das kennt man schon
const SQL_BASIS = ['SELECT', '*', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'LIKE', 'ORDER BY', 'DESC', 'LIMIT', 'DISTINCT', 'COUNT(*)', 'SUM(', 'AVG(', 'MIN(', 'MAX(', 'GROUP BY', 'JOIN', 'ON', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];
// Aufträge dieser Burg bis einschließlich h (Reihenfolge wie auf der Karte: BURGEN[n].kapitel, darin wie in HOEFE)
function sqlBisher(h) {
  const K = BURGEN[hofBurg(h)]?.kapitel || [], pos = (x) => K.indexOf(x.kapitel), i = HOEFE.indexOf(h);
  return HOEFE.filter((x) => x.art === 'sql' && x !== h && pos(x) >= 0 && (pos(x) < pos(h) || (pos(x) === pos(h) && HOEFE.indexOf(x) < i)));
}
function sqlWortschatz(h) {
  if (Array.isArray(h.leiste)) return [...h.leiste];
  const texte = [], merke = [];
  for (const x of [...sqlBisher(h), h]) {
    if (x !== h) texte.push(x.loesung || '', x.code || '', x.pruef || '');
    if (x.merke) merke.push(`${x.merke.code || ''} ${x.merke.text || ''}`);
  }
  if (h.merke && !h.lesen) texte.push(h.loesung || '');   // Einführung: die neuen Wörter dieses Auftrags gehören dazu
  const kennt = new Set(h.db ? SQL_BASIS : []);
  for (const [w, re] of SQL_WOERTER) {
    if (texte.some((t) => re.test(t)) || merke.some((t) => new RegExp(re.source).test(t))) kennt.add(w);   // in Merke-Texten nur GROSS geschriebene Wörter
  }
  for (const w of h.woerter || []) kennt.add(w);
  return SQL_WOERTER.map((w) => w[0]).filter((w) => kennt.has(w)).concat((h.woerter || []).filter((w) => !SQL_WOERTER.some((x) => x[0] === w)));
}
// Wörter, die in diesem Auftrag neu sind (Einführung) – bekommen das Schild „neu“
const sqlNeuWoerter = (h) => (h.merke ? SQL_WOERTER.filter(([, re]) => re.test(h.loesung || '') && !sqlBisher(h).some((x) => re.test(x.loesung || ''))).map((w) => w[0]) : []);
const sqlZeilenZeigen = (h) => h.leiste === 'zeilen' || (h.leiste !== 'woerter' && !Array.isArray(h.leiste) && (!!h.merke || (P.hoefe[h.id]?.versuche > 0 && !P.hoefe[h.id]?.fertig)));
function sqlLeiste() {
  const box = $('#befehle');
  if (!box || !H || H.art !== 'sql' || H.lesen) return;
  if (!$('#sqlStil')) {
    const s = document.createElement('style');
    s.id = 'sqlStil';
    s.textContent = '#befehle .sqlgruppe{display:flex;flex-wrap:wrap;gap:5px;align-items:center;width:100%}#befehle .sqlgruppe>.sqlt{font-size:12px;opacity:.75;margin-right:2px;min-width:5.5em}#befehle button.sqlw{padding:4px 9px;font-variant-ligatures:none}#befehle button.sqlname{color:#ffe9a8}#befehle button.sqlzeichen{min-width:2.2em;color:#fff}';
    document.head.appendChild(s);
  }
  const db = dbVon(H), worte = sqlWortschatz(H), neu = sqlNeuWoerter(H);
  const mitJoin = H.tabellen.length > 1 && worte.some((w) => /JOIN/.test(w));
  const namen = [...H.tabellen, ...H.tabellen.flatMap((t) => (db.schema[t] || []).map(([c]) => (mitJoin ? `${t}.${c}` : c)))].filter((x, i, a) => a.indexOf(x) === i);
  const bisher = sqlBisher(H).map((x) => x.loesung || '').join('\n');
  const zeichen = [...(worte.includes('WHERE') || worte.includes('ON') ? ['=', '<', '>', '<=', '>=', '<>'] : []),
    ...(/[\w)]\s*[-+/]\s*[\w(]|\w\s+\*\s+\w/.test(bisher + (H.merke ? H.loesung : '')) ? ['+', '-', '*', '/'] : []), ',', '(', ')', "'"].filter((x, i, a) => a.indexOf(x) === i);
  const knopf = (t, cls, ein = t, zeile = false, istNeu = false) => `<button class="sqlw ${cls}${istNeu ? ' neu' : ''}" data-ein="${esc(ein)}" data-zeile="${zeile ? 1 : ''}" title="${zeile ? 'als eigene Zeile einfügen' : 'an der Schreibmarke einfügen'}">${esc(t)}</button>`;
  const muster = H.befehle.filter((b) => /…/.test(b.text) && !b.hilfe);
  const zeilen = sqlZeilenZeigen(H) ? H.befehle.filter((b) => !/…/.test(b.text) || b.hilfe) : [];
  const nachFehler = zeilen.length && !H.merke && H.leiste !== 'zeilen';
  box.innerHTML = `<div class="sqlgruppe"><span class="sqlt">🔤 Wörter</span>${worte.map((w) => knopf(w, 'kw', w, false, neu.includes(w))).join('')}</div>
    <div class="sqlgruppe"><span class="sqlt">📚 Namen</span>${namen.map((n) => knopf(n, 'sqlname')).join('')}</div>
    <div class="sqlgruppe"><span class="sqlt">✏️ Zeichen</span>${zeichen.map((z) => knopf(z, 'sqlzeichen')).join('')}<span class="hinweis">Zahlen und Texte wie 'ratte' tippst du selbst.</span></div>
    ${muster.length ? `<div class="sqlgruppe"><span class="sqlt">🧩 Muster</span>${muster.map((b) => knopf(b.zeigt, 'muster', b.text, true)).join('')}</div>` : ''}
    ${zeilen.length ? `<div class="sqlgruppe"><span class="sqlt">${nachFehler ? '💡 Hilfe' : '📜 Zeilen'}</span>${zeilen.map((b) => knopf(b.zeigt, '', b.text, true, b.neu || (H.neu || []).includes(b))).join('')}</div>` : ''}`;
  for (const b of box.querySelectorAll('button[data-ein]')) b.onclick = () => (b.dataset.zeile ? ED.insertLine(b.dataset.ein) : sqlEinfuegen(b.dataset.ein, SQL_ZEILE.has(b.dataset.ein)));
}
// Text vor dem Cursor in der aktuellen Zeile (CodeMirror: aus der DOM-Auswahl, Textfeld: selectionStart)
// CodeMirror-Ansicht des Editors (editor.js gibt sie nicht heraus; CodeMirror hängt sie an das DOM-Element)
function sqlCmView() {
  const c = document.querySelector('#editor .cm-content');
  const v = c?.cmTile?.view || c?.cmView?.rootView?.view || c?.cmView?.view;
  return v && typeof v.dispatch === 'function' ? v : null;
}
function sqlVorCursor() {
  const v = sqlCmView();
  if (v) { const h = v.state.selection.main.head, l = v.state.doc.lineAt(h); return l.text.slice(0, h - l.from); }
  const ta = document.activeElement;
  if (ta && ta.tagName === 'TEXTAREA') return ta.value.slice(0, ta.selectionStart).split('\n').pop();
  const s = window.getSelection();
  if (!s || !s.rangeCount) return '';
  const r = s.getRangeAt(0), n = r.startContainer, el = n.nodeType === 1 ? n : n.parentElement, zeile = el?.closest?.('.cm-line');
  if (!zeile) return '';
  const vor = document.createRange();
  vor.setStart(zeile, 0);
  vor.setEnd(r.startContainer, r.startOffset);
  return vor.toString();
}
// Wort an der Schreibmarke einfügen (mit passenden Leerzeichen); Satzteile wie WHERE beginnen eine neue Zeile
function sqlEinfuegen(wort, neueZeile) {
  if (!ED || ED !== CODE_ED) return;
  ED.focus();
  const vor = sqlVorCursor();
  if (neueZeile && vor.trim()) { ED.insertLine(wort + ' '); return; }
  let text;
  if (wort === "'") text = ((vor.match(/'/g) || []).length % 2 ? "' " : (vor && !/[\s(]$/.test(vor) ? ' ' : '') + "'");
  else text = (vor && !/[\s(.]$/.test(vor) && !/^[,)]/.test(wort) ? ' ' : '') + wort + (/[(.]$/.test(wort) ? '' : ' ');
  const ta = document.activeElement, ranRuecken = /^[,)]/.test(wort) && / $/.test(vor);   // „name ,“ → „name,“
  const v = sqlCmView();
  if (v) {
    const { from, to } = v.state.selection.main, ab = from - (ranRuecken ? 1 : 0);
    v.dispatch({ changes: { from: ab, to, insert: text }, selection: { anchor: ab + text.length }, scrollIntoView: true, userEvent: 'input' });
    v.focus();
    return;
  }
  if (ta && ta.tagName === 'TEXTAREA') {
    const s = ta.selectionStart - (ranRuecken ? 1 : 0);
    ta.setRangeText(text, s, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); return;
  }
  if (ranRuecken) document.execCommand('delete');
  if (!document.execCommand('insertText', false, text)) ED.value += text;
}

// --- 💡 Gezielte Hinweise nach einem Fehlversuch (statt nur „6 Zeilen fehlen“) ---
function sqlSelectTeile(src) {
  const m = /\bselect\s+(?:distinct\s+)?([\s\S]+?)\s+from\b/i.exec(src);
  if (!m) return [];
  const teile = [];
  let tiefe = 0, cur = '';
  for (const c of m[1]) { if (c === '(') tiefe++; if (c === ')') tiefe--; if (c === ',' && !tiefe) { teile.push(cur.trim()); cur = ''; } else cur += c; }
  return [...teile, cur.trim()].filter(Boolean);
}
function sqlHinweis(src, runs) {
  const s = src.replace(/--.*$/gm, ''), agg = /\b(count|sum|avg|min|max)\s*\(/i, gruppe = /\bgroup\s+by\b/i.test(s);
  const r = runs.find((x) => !x.ok);
  if (!r || !r.soll || r.ist?.fehler) return '';
  const teile = sqlSelectTeile(s);
  if (!gruppe && teile.some((t) => agg.test(t)) && teile.some((t) => !agg.test(t) && t !== '*')) {
    return 'Neben COUNT, SUM & Co. steht eine normale Spalte – aber ohne GROUP BY rechnet die Funktion über die ganze Tabelle und SQL zeigt nur eine einzige Zeile. Für jede Gruppe einzeln brauchst du GROUP BY mit dieser Spalte.';
  }
  if (!gruppe && agg.test(s) && r.ist.rows.length === 1 && r.soll.rows.length > 1) return 'Du bekommst nur eine Zeile. COUNT, SUM & Co. rechnen ohne GROUP BY über die ganze Tabelle – gesucht ist aber ein Ergebnis je Gruppe.';
  if (r.ist.cols.length !== r.soll.cols.length) return 'Zähl die Spalten im Ziel und schreib genau diese hinter SELECT – nicht mehr und nicht weniger.';
  if (r.msg.includes('Reihenfolge')) return 'Prüf die Spalte hinter ORDER BY und die Richtung: ohne DESC klein nach groß, mit DESC groß nach klein.';
  const fehlen = /fehl/.test(r.msg), zuviel = /zu viel/.test(r.msg);
  if (fehlen && !zuviel) return 'Es fehlen Zeilen – deine Bedingung ist zu streng. Denk an Grenzfälle (zählt der Wert selbst mit? dann <= bzw. >=) und an OR statt AND.';
  if (zuviel && !fehlen && r.ist.rows.length > r.soll.rows.length) return 'Es sind Zeilen zu viel – deine Bedingung lässt zu viel durch. Fehlt eine Bedingung, oder brauchst du AND statt OR bzw. > statt >=?';
  return '';
}
// Fehlermeldung „Die Spalte „ratte“ gibt es nicht“ – dabei ist ratte ein Wert in der Tabelle: Anführungszeichen vergessen
function sqlFehlerHinweis(msg) {
  const m = /Die Spalte „(.+?)“ gibt es nicht/.exec(msg || '');
  if (!m) return '';
  const d = dbVon(H).daten('A'), w = m[1].replace(/^\w+\./, '').toLowerCase();
  const wert = Object.values(d).flat().flat().find((v) => typeof v === 'string' && v.toLowerCase() === w);
  return wert ? `„${m[1]}“ ist ein Wert in der Tabelle, kein Spaltenname. Texte stehen in einfachen Anführungszeichen: '${wert}'.` : '';
}

// --- Darstellung links: Tabellen des Archivs, Soll-Ergebnis, eigenes Ergebnis ---
function tabelleHtml(cols, rows, titel, klasse = '') {
  const max = 40;
  return `<div class="dbtab ${klasse}"><div class="dbtitel">${titel}</div><div class="dbscroll"><table>
    <tr>${cols.map((c) => `<th>${esc(String(c))}</th>`).join('')}</tr>
    ${rows.slice(0, max).map((z) => `<tr>${z.map((v) => `<td>${v === null ? '–' : esc(String(sqlNorm(v)))}</td>`).join('')}</tr>`).join('')}
    ${rows.length > max ? `<tr><td colspan="${cols.length}" class="hinweis">… ${rows.length - max} weitere Zeilen</td></tr>` : ''}
    ${rows.length ? '' : `<tr><td colspan="${Math.max(1, cols.length)}" class="hinweis">(keine Zeilen)</td></tr>`}</table></div></div>`;
}
async function archivZeigen(ist = null) {
  const box = $('#archiv'), d = dbVon(H).daten('A');
  const tabellen = H.tabellen.map((t) => tabelleHtml(dbVon(H).schema[t].map(([n]) => n), d[t], `📚 Tabelle <b>${t}</b>`)).join('');
  const story = H.story ? `<div class="eulalia"><span class="eico">${(H.sprecher || ["🦉"])[0]}</span><div><b>${(H.sprecher || [0, "Eulalia"])[1]}</b><p>${esc(H.story)}</p></div></div>` : '';
  box.innerHTML = `${story}${tabellen}<div id="archivSoll"></div><div id="archivIst"></div>`;
  sqlLeiste();
  if (!(await sqlBereit())) { $('#archivSoll').innerHTML = '<p class="hinweis">SQL lädt nicht.</p>'; return; }
  const soll0 = PY.sql(dbSetup(H, 'A'), H.loesung, H.pruef || '');
  // Spaltenköpfe wie „COUNT(*)“ oder „MIN(seiten)“ verraten die Funktion → neutral anzeigen (nur Anzeige, die Prüfung vergleicht Werte)
  const soll = { ...soll0, cols: (soll0.cols || []).map((c, i, a) => (String(c).includes('(')
    ? (a.filter((x) => String(x).includes('(')).length === 1 && a.length === 1 ? 'Ergebnis' : `Spalte ${i + 1}`) : c)) };
  // Ein einziger Zahlenwert (COUNT, SUM, AVG …): nur die Form zeigen, nicht die gesuchte Zahl (Didaktik-Prüfung: d17–d20 verrieten sie)
  const nurZahl = !H.pruef && soll.rows.length === 1 && soll.rows[0].every((v) => typeof v === 'number');
  $('#archivSoll').innerHTML = nurZahl
    ? tabelleHtml(soll.cols, [soll.cols.map(() => '?')], `🎯 So soll das Ergebnis aussehen: 1 Zeile, ${soll.cols.length === 1 ? '1 Zahl' : `${soll.cols.length} Zahlen`}`, 'soll')
      + '<p class="hinweis">Die Zahl selbst verrät das Archiv nicht – die soll deine Abfrage ausrechnen. Der Spaltenname darf anders heißen.</p>'
    : tabelleHtml(soll.cols, soll.rows, `🎯 So soll das Ergebnis${H.pruef ? ' danach' : ''} aussehen`, 'soll');
  if (ist) $('#archivIst').innerHTML = ist.fehler ? `<div class="dbtab ist"><div class="dbtitel">📋 Dein Ergebnis</div><p class="err">${esc(ist.fehler)}</p></div>`
    : tabelleHtml(ist.cols, ist.rows, '📋 Dein Ergebnis', 'ist');
}

// --- 🔮 Vorhersagen spielen: Zeilen antippen bzw. Zahl eintippen, ✔ Prüfen ---
let LS = null;
async function sqlLesenStart() {
  const L = H.lesen;
  ED.value = H.code;
  ED.setReadOnly(true);
  ED.setMarks(0, 0);
  if (!(await sqlBereit())) { log('SQL lädt nicht.', 'err'); return; }
  const setup = dbSetup(H, 'A');
  const soll = L.typ === 'zahl' ? PY.sql(setup, H.code, L.pruef || '').rows[0][0] : PY.sql(setup, L.soll).rows.map((z) => z[0]);
  LS = { soll, gewaehlt: new Set(), fehler: 0, hier: 0, aufgeloest: false };
  $('#befehle').innerHTML = L.typ === 'zahl'
    ? '<span class="meldefeld"><input type="number" id="lsZahl" placeholder="?"><button class="btn gold" id="lsAntwort">📢 Das kommt heraus</button></span>'
    : `<span class="hinweis">${L.typ === 'erste' ? '👆 Tippe in der Tabelle die Zeile an, die ganz oben steht.' : '👆 Tippe in der Tabelle die Zeilen an, die herauskommen. Nochmal tippen = abwählen.'}</span>`;
  if ($('#lsAntwort')) $('#lsAntwort').onclick = () => lesenPruefen();
  $('#protokoll').innerHTML = '';
  log('🔮 Lies die Abfrage. Sag dann voraus, was herauskommt.', 'leise');
  log(`🎲 Raten lohnt sich nicht: Jeder Fehlversuch kostet ${Math.round(RATE_ABZUG * 100)} % vom Lohn.`, 'leise');
  if (L.typ === 'zeilen') haupt('✔ Prüfen', () => lesenPruefen(), true);
  else haupt(L.typ === 'zahl' ? '✔ Prüfen' : '👆 Zeile antippen', L.typ === 'zahl' ? () => lesenPruefen() : null, L.typ === 'zahl');
  neben([{ label: '🗺️<span class="lbl"> Karte</span>', title: 'Zurück zur Karte', fn: zurKarte }, { label: '🏳️<span class="lbl"> Auflösen</span>', title: 'Lösung zeigen (nur Teillohn)', fn: lesenAufloesen }]);
  lesenZeigen();
}
// Linke Seite: Eulalia und die Tabellen; die Tabelle der Vorhersage hat antippbare Zeilen
function lesenZeigen(markieren = null) {
  const L = H.lesen, d = dbVon(H).daten('A');
  const story = H.story ? `<div class="eulalia"><span class="eico">${(H.sprecher || ["🦉"])[0]}</span><div><b>${(H.sprecher || [0, "Eulalia"])[1]}</b><p>${esc(H.story)}</p></div></div>` : '';
  const tab = (t) => {
    const cols = dbVon(H).schema[t].map(([n]) => n), klickbar = t === L.tabelle;
    return `<div class="dbtab ${klickbar ? 'waehlbar' : ''}"><div class="dbtitel">📚 Tabelle <b>${t}</b>${klickbar ? ' · 👆 antippen' : ''}</div><div class="dbscroll"><table>
      <tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>
      ${d[t].map((z, i) => {
        const id = i + 1, an = LS?.gewaehlt.has(id), richtig = markieren?.includes(id);
        return `<tr ${klickbar ? `data-zeile="${id}"` : ''} class="${an ? 'gewaehlt' : ''} ${richtig ? 'richtig' : ''}">${z.map((v) => `<td>${esc(String(v))}</td>`).join('')}</tr>`;
      }).join('')}</table></div></div>`;
  };
  $('#archiv').innerHTML = story + H.tabellen.map(tab).join('');
  for (const tr of document.querySelectorAll('#archiv [data-zeile]')) tr.onclick = () => {
    if (!LS || LS.aufgeloest) return;
    const id = +tr.dataset.zeile;
    if (L.typ === 'erste') { LS.gewaehlt = new Set([id]); lesenZeigen(); lesenPruefen(); return; }
    if (LS.gewaehlt.has(id)) LS.gewaehlt.delete(id); else LS.gewaehlt.add(id);
    lesenZeigen();
  };
}
function lesenPruefen() {
  if (!LS || LS.aufgeloest) return;
  const L = H.lesen;
  let ok, msg;
  if (L.typ === 'zahl') {
    const ein = $('#lsZahl').value.trim();
    if (!ein) { toast('Tipp zuerst eine Zahl ein.'); return; }
    ok = Number(ein) === Number(LS.soll);
    msg = ok ? '' : `Die Abfrage liefert eine andere Zahl als ${ein}.`;
  } else if (L.typ === 'erste') {
    ok = LS.gewaehlt.has(LS.soll[0]);
    msg = ok ? '' : 'Diese Zeile steht nicht ganz oben.';
  } else {
    const soll = new Set(LS.soll), fehlen = LS.soll.filter((x) => !LS.gewaehlt.has(x)).length, zuviel = [...LS.gewaehlt].filter((x) => !soll.has(x)).length;
    ok = !fehlen && !zuviel;
    msg = ok ? '' : `Noch nicht: ${[fehlen && `${fehlen} Zeile${fehlen === 1 ? ' fehlt' : 'n fehlen'}`, zuviel && `${zuviel} Zeile${zuviel === 1 ? ' gehört' : 'n gehören'} nicht dazu`].filter(Boolean).join(', ')}.`;
  }
  if (ok) { lesenEnde(true); return; }
  LS.fehler++; LS.hier++;
  log(`❌ ${msg} (Lohn jetzt ${Math.round(rateFaktor(LS.fehler) * 100)} %)`, 'err');
  if (LS.hier >= 2) log(`💡 ${H.tipps[Math.min(H.tipps.length - 1, LS.hier - 1)]}`, 'leise');
}
function lesenAufloesen() {
  if (!LS || LS.aufgeloest) return;
  LS.aufgeloest = true;
  lesenEnde(false);
}
function lesenEnde(ok) {
  const h = hofStand(H.id), L = H.lesen, fehlerfrei = ok && LS.fehler === 0, wenig = ok && LS.fehler <= 2, rf = rateFaktor(LS.fehler);
  let gold;
  if (ok) {
    const stern = (neu, alt) => (neu ? H.lohn * STERN_BONUS * (alt ? NACHARBEIT : 1) : 0);
    gold = H.lohn * (h.fertig ? NACHARBEIT : 1) * rf + stern(fehlerfrei, h.kurz) + stern(wenig, h.sparsam);   // 🎲 Raten kostet wie bei den Vorhersage-Höfen
  } else gold = h.fertig ? 0 : H.lohn * TEILLOHN * 0.5;
  gold = Math.round(gold * lohnFaktor());
  const warFertig = h.fertig;
  h.versuche++; h.fertig ||= ok; h.kurz ||= fehlerfrei; h.sparsam ||= wenig; h.heute = P.tag;
  P.gold += gold;
  speichern();
  LS.aufgeloest = true;
  // Lösung zeigen: richtige Zeilen markieren bzw. die Zahl nennen, dazu das echte Ergebnis der Abfrage
  if (L.typ !== 'zahl') lesenZeigen(L.typ === 'erste' ? [LS.soll[0]] : LS.soll);
  const ergebnis = PY.sql(dbSetup(H, 'A'), H.code, L.pruef || '');
  const st = (an, t) => `<span class="${an ? '' : 'aus'}" title="${t}">⭐</span>`;
  karte(`<h2>${ok ? 'Richtig vorhergesagt! 🔮' : 'Aufgelöst'}</h2>
    ${ok && H.danach ? `<div class="eulalia"><span class="eico">${(H.sprecher || ["🦉"])[0]}</span><div><b>${(H.sprecher || [0, "Eulalia"])[1]}</b><p>${esc(H.danach)}</p></div></div>` : ''}
    ${ok ? `<div class="sterne">✅ ${st(fehlerfrei, 'ohne Fehler')}${st(wenig, 'höchstens 2 Fehler')}</div>
      <div class="zeile"><span>⭐ ohne Fehler</span><span>${fehlerfrei ? '✓' : `${LS.fehler} Fehler`}</span></div>
      <div class="zeile"><span>⭐ höchstens 2 Fehler</span><span>${wenig ? '✓' : '–'}</span></div>
      ${LS.fehler ? `<div class="zeile"><span>🎲 ${LS.fehler} Fehlversuch${LS.fehler > 1 ? 'e' : ''}: Lohn</span><span>${Math.round(rf * 100)} %</span></div>` : ''}`
    : `<p>${L.typ === 'zahl' ? `Die Abfrage liefert <b>${esc(String(LS.soll))}</b>.` : 'Die richtigen Zeilen sind jetzt in der Tabelle grün markiert.'}</p>`}
    ${H.erklaerung ? `<p>💡 ${esc(H.erklaerung)}</p>` : ''}
    <div class="archiv">${tabelleHtml(ergebnis.cols, ergebnis.rows, '📋 Das liefert die Abfrage', 'ist')}</div>
    <p class="lohn">+${gold} 🪙${!ok && gold ? ' Teillohn' : ''}${lohnHinweis()}</p>
    ${ok && warFertig ? '<p class="hinweis">Schon gelöster Auftrag: weniger Lohn, neue Sterne zählen voll.</p>' : ''}
    ${!ok ? '<p class="hinweis">Morgen kannst du es noch einmal versuchen. Lies die Abfrage Teil für Teil.</p>' : ''}`,
  [...zweitKnopf(ok), { label: '🌇 Feierabend', fn: feierabend }]);
  neben([]);
  haupt('🌇 Feierabend', feierabend);
  hud();
}

// --- Ausführen: beide Archive, abrechnen, Ergebnis zeigen ---
async function sqlAusfuehren() {
  if (LAUF) return;
  const src = ED.value;
  P.code[H.id] = src;
  if (!src.trim()) { log('Schreib zuerst eine Abfrage.', 'err'); return; }
  // Pflicht-Baustein (🗄️ LK Daten: „mit Subselect“, „mit LEFT JOIN“) – fehlt er, kostet das keinen Versuch
  if (H.muss && !H.muss[0].test(src.replace(/--.*$/gm, ''))) { log(H.muss[1], 'err'); return; }
  haupt('⏳ Frage das Archiv …', null, false);
  if (!(await sqlBereit())) { log('SQL konnte nicht geladen werden.', 'err'); haupt('▶ Ausführen', ausfuehren, true); return; }
  $('#protokoll').innerHTML = '';
  const runs = lagen(H).map((v) => {
    const ist = PY.sql(dbSetup(H, v), src, H.pruef || ''), soll = PY.sql(dbSetup(H, v), H.loesung, H.pruef || '');
    return { ...sqlVergleich(ist, soll, sqlGeordnet(H)), ist, soll };
  });
  // Tippfehler (SQL meldet einen Fehler): nur zurückmelden wie bei Python – kostet keinen Tag und keinen Versuch (Spieltest)
  const fehler = runs.find((r) => r.ist?.fehler);
  if (fehler) {
    for (const e of document.querySelectorAll('#protokoll .err, #protokoll .leise')) e.remove();
    log(fehler.msg || fehler.ist.fehler, 'err');
    const fh = sqlFehlerHinweis(fehler.msg || fehler.ist.fehler);
    if (fh) log(`💡 ${fh}`, 'leise');
    log('Verbessere die Abfrage und drück nochmal ▶ Ausführen – ein Tippfehler kostet keinen Versuch.');
    await archivZeigen(fehler.ist);
    haupt('▶ Ausführen', ausfuehren, true);
    return;
  }
  runs.forEach((r, i) => log(`${H.sprecher ? "Fassung" : "Archiv"} ${LAGE_NAME[i]}: ${r.ok ? '✓' : '✗'} ${r.msg}`, r.ok ? 'ok' : 'err'));
  const hinweis = sqlHinweis(src, runs);
  if (hinweis) log(`💡 ${hinweis}`, 'leise');
  await archivZeigen(runs[0].ist);
  sqlAbrechnen(runs, hinweis);
}

// ⭐ auf Anhieb (erster Versuch) · ⭐ ohne Tipp – gespeichert in kurz/sparsam wie bei den Höfen
function sqlAbrechnen(runs, hinweis = '') {
  const h = hofStand(H.id), ok = runs.every((r) => r.ok), anhieb = ok && h.versuche === 0, ohneTipp = ok && h.tipps === 0;
  if (ok) h.geloest = P.code[H.id];   // fürs Heft: die Abfrage, die geklappt hat
  const anteil = ok ? 1 : runs.reduce((s, r) => s + r.anteil, 0) / runs.length;
  let gold;
  if (ok) {
    const stern = (neu, alt) => (neu ? H.lohn * STERN_BONUS * (alt ? NACHARBEIT : 1) : 0);
    gold = H.lohn * (h.fertig ? NACHARBEIT : 1) + stern(anhieb, h.kurz) + stern(ohneTipp, h.sparsam);
  } else gold = h.fertig ? 0 : H.lohn * TEILLOHN * anteil;
  gold = Math.round(gold * lohnFaktor());
  const warFertig = h.fertig;
  h.versuche++;
  h.fertig ||= ok; h.kurz ||= anhieb; h.sparsam ||= ohneTipp;
  h.heute = P.tag;
  P.gold += gold;
  speichern();
  const st = (an, t) => `<span class="${an ? '' : 'aus'}" title="${t}">⭐</span>`;
  karte(`<h2>${ok ? 'Richtig abgefragt! 🎉' : 'Noch nicht ganz'}</h2>
    ${ok && H.danach ? `<div class="eulalia"><span class="eico">${(H.sprecher || ["🦉"])[0]}</span><div><b>${(H.sprecher || [0, "Eulalia"])[1]}</b><p>${esc(H.danach)}</p></div></div>` : ''}
    ${ok ? `<div class="sterne">✅ ${st(anhieb, 'auf Anhieb')}${st(ohneTipp, 'ohne Tipp')}</div>
      <div class="zeile"><span>⭐ auf Anhieb</span><span>${anhieb ? '✓' : '–'}</span></div>
      <div class="zeile"><span>⭐ ohne Tipp</span><span>${ohneTipp ? '✓' : '–'}</span></div>`
    : `<p>${runs.map((r, i) => `${H.sprecher ? "Fassung" : "Archiv"} ${LAGE_NAME[i]}: ${esc(r.msg)}`).join('<br>')}</p>
      <div class="teil"><div class="teilbalken"><i style="width:${Math.round(anteil * 100)}%"></i></div><span>${Math.round(anteil * 100)} % richtig</span></div>
      ${hinweis ? `<p>💡 ${esc(hinweis)}</p>` : ''}`}
    <p class="lohn">+${gold} 🪙${!ok && gold ? ' Teillohn' : ''}${lohnHinweis()}</p>
    ${ok && warFertig ? '<p class="hinweis">Schon gelöster Auftrag: weniger Lohn, neue Sterne zählen voll.</p>' : ''}
    ${!ok ? `<p class="hinweis">Vergleiche links „Dein Ergebnis“ mit dem Ziel. Morgen kannst du die Abfrage verbessern${H.leiste === 'woerter' || Array.isArray(H.leiste) || H.merke || !H.befehle.some((b) => !/…/.test(b.text) || b.hilfe) ? '' : ' – dann zeigen dir Hilfe-Zeilen unten den Aufbau'}.</p>` : ''}
    ${ok ? `<details><summary>Musterlösung ansehen</summary><pre class="mono">${esc(H.loesung)}</pre></details>` : ''}`,
  [...zweitKnopf(ok), { label: '👀 Ansehen', fn: () => haupt('🌇 Feierabend', feierabend) }, { label: '🌇 Feierabend', fn: feierabend }]);
  neben([]);
  haupt('🌇 Feierabend', feierabend);
  hud();
}
