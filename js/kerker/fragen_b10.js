'use strict';
// 🗝️ Kerker-Fragen Burg 10 – Quellen: OPAL INFO_SEK1 „Informatik Klasse 10 – GDP“ (lb1_algorithmen: 2_2_Vezweigung, 2_3_Schleifen,
// 2_4_Unterprogramme, 3_2_datentypen, 3_6_variablenbeleg, 3_7_arrays, 5_1_clustering; lb2_sprachen: sprachen_formalisier,
// endliche_sprachen, regulaere_ausdruecke, anwendung_regex, endlicheAutomaten), Leistungskontrollen Kl. 10 (LK1 Python-Grundlagen,
// LK2 Modularisierung und Entscheidungen, LK3 Sprachen und reguläre Ausdrücke), svp_10,
// Lehrplan Gymnasium Sachsen Informatik 2022 Kl. 10: LB 1 Algorithmen und Programmierung, LB 2 Sprachen.
// Kapitel: 110 Datentypen/Verzweigungen · 111 Fehler finden · 112 def · 113 Listen · 114 maschinelle Entscheidungen · 115 formale Sprachen.
// Alle Ausgaben mit Python 3 nachgerechnet (re.fullmatch/re.findall für die regulären Ausdrücke).
KERKER_FRAGEN.push(
  // ============================== 110 🐍 Datentypen und Verzweigungen ==============================
  { id: 'k10_001', burg: 10, kap: 110, stufe: 1, art: 'zuordnen', frage: 'Welchen Datentyp liefert type() für den Ausdruck?',
    paare: [['12', 'int'], ['3.5', 'float'], ['"12"', 'str'], ['3 < 5', 'bool']],
    erkl: 'Ganze Zahl = int, Gleitkommazahl (mit Punkt) = float, alles in Anführungszeichen = str, ein Vergleich ergibt einen Wahrheitswert = bool.', quelle: 'OPAL Kl. 10 LK1 Python Aufgabe 1; 3_2_datentypen' },
  { id: 'k10_002', burg: 10, kap: 110, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 3_2_datentypen (Operatoren // und %); LK1 Aufgabe 3a',
    gen: (z) => { const a = z.int(13, 40), b = z.int(3, 7), q = Math.floor(a / b); return { frage: 'Was gibt das Programm aus?', code: `print(${a} // ${b})`, antworten: [String(q)], erkl: `// ist die ganzzahlige Division: ${b} passt ${q}-mal ganz in ${a} (${q} · ${b} = ${q * b}).` }; } },
  { id: 'k10_003', burg: 10, kap: 110, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 3_2_datentypen (Modulo); LK1 Aufgabe 3a',
    gen: (z) => { const a = z.int(13, 40), b = z.int(3, 7), q = Math.floor(a / b), r = a % b; return { frage: 'Was gibt das Programm aus?', code: `print(${a} % ${b})`, antworten: [String(r)], erkl: `% liefert den Rest der ganzzahligen Division: ${a} = ${q} · ${b} + ${r}.` }; } },
  { id: 'k10_004', burg: 10, kap: 110, stufe: 2, art: 'eingabe', frage: 'Was gibt die Zeile print(x * y) aus?',
    code: 'x = "2"\ny = 4\nprint(x * y)', antworten: ['2222'],
    erkl: 'x ist eine Zeichenkette. * wiederholt sie: "2" viermal hintereinander = 2222. Mit int(x) * y käme 8 heraus.', quelle: 'OPAL Kl. 10 LK1 Python Aufgabe 3b; 3_2_datentypen (Operatoren auf Zeichenketten)' },
  { id: 'k10_005', burg: 10, kap: 110, stufe: 1, art: 'wahl', frage: 'Was geschieht bei der Anweisung x = x + 1?',
    optionen: ['x bekommt den alten Wert plus 1; der alte Wert ist weg.', 'Python prüft, ob x gleich x + 1 ist, und meldet False.', 'Es entsteht eine zweite Variable x mit dem neuen Wert.', 'Python meldet einen Fehler, weil x auf beiden Seiten steht.'],
    erkl: '= ist eine Zuweisung, kein Vergleich: Erst wird die rechte Seite ausgewertet, dann landet das Ergebnis in der Variablen links.', quelle: 'OPAL Kl. 10 LK1 Python Aufgabe 2; 3_1_Variablen' },
  { id: 'k10_006', burg: 10, kap: 110, stufe: 2, art: 'mehr', frage: 'Es gilt a = 4 und b = 7. Kreuze alle Ausdrücke an, die True ergeben.',
    optionen: ['a < b and b < 10', 'a > 5 or b > 5', 'a % 2 == 0', 'not (a == 4)', 'a != b and a > b'], richtig: [0, 1, 2],
    erkl: 'and: beide Seiten wahr. or: mindestens eine. not kehrt um: a == 4 ist True, also not (…) False. Bei a != b and a > b ist die zweite Seite falsch.', quelle: 'OPAL Kl. 10 3_2_datentypen (logische Operatoren and, or, not)' },
  { id: 'k10_007', burg: 10, kap: 110, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 LK1 Python Aufgabe 5a (Temperaturanzeige); 2_2_Vezweigung',
    gen: (z) => {
      const t = z.wahl([-5, -1, 0, 7, 19, 20, 21, 28]), a = t < 0 ? 'Frost' : t <= 20 ? 'kühl' : 'warm';
      const grund = t < 0 ? `${t} < 0 ist wahr` : t <= 20 ? `${t} < 0 ist falsch, ${t} <= 20 ist wahr` : `${t} < 0 und ${t} <= 20 sind falsch, also else`;
      return { frage: 'Was gibt das Programm aus?', code: `t = ${t}\nif t < 0:\n    print("Frost")\nelif t <= 20:\n    print("kühl")\nelse:\n    print("warm")`, antworten: [a], erkl: `Die Bedingungen werden von oben geprüft: ${grund} → ${a}.` };
    } },
  { id: 'k10_008', burg: 10, kap: 110, stufe: 2, art: 'luecke', frage: 'Ergänze: „angenehm“ soll nur bei Temperaturen von 18 bis einschließlich 25 erscheinen.',
    code: 'if t >= 18 ▢ t ▢ 25:\n    print("angenehm")', text: 'if t >= 18 {} t {} 25:', luecken: [['and'], ['<=']], woerter: ['and', 'or', 'not', '<=', '<', '=='],
    erkl: 'Beide Grenzen müssen gelten, also and. „Einschließlich 25“ heißt t <= 25.', quelle: 'OPAL Kl. 10 LK1 Python Aufgabe 5b' },
  { id: 'k10_009', burg: 10, kap: 110, stufe: 3, art: 'wahl', frage: 'Bei 90 Punkten soll Note 1 herauskommen, das Programm liefert aber 4. Warum?',
    code: 'punkte = 90\nif punkte >= 40:\n    note = 4\nelif punkte >= 85:\n    note = 1\nprint(note)',
    optionen: ['Schon punkte >= 40 stimmt; das elif wird dann übersprungen.', 'Python prüft die Bedingungen von unten nach oben durch.', 'note = 1 läuft, wird danach aber mit 4 überschrieben.', 'elif darf nur hinter einem else stehen, nicht hinter if.'],
    erkl: 'Die Bedingungen werden von oben nach unten geprüft, bis eine zutrifft. Darum muss die strengste Grenze (>= 85) zuerst stehen.', quelle: 'OPAL Kl. 10 2_2_Vezweigung (Mehrfachverzweigung, Notenrechner)' },
  { id: 'k10_010', burg: 10, kap: 110, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 LK2 Python Aufgabe 3a; 3_2_datentypen (Zugriff auf Zeichen)',
    gen: (z) => { const w = z.wahl(['Burgturm', 'Drache', 'Python', 'Zauberer', 'Informatik']), a = w[0] + w[w.length - 1]; return { frage: 'Was gibt das Programm aus?', code: `wort = "${w}"\nprint(wort[0] + wort[-1])`, antworten: [a], erkl: `wort[0] ist das erste Zeichen (${w[0]}), wort[-1] das letzte (${w[w.length - 1]}). + hängt sie aneinander: ${a}.` }; } },

  // ============================== 111 🐞 Fehler finden ==============================
  { id: 'k10_011', burg: 10, kap: 111, stufe: 1, art: 'zuordnen', frage: 'Ordne die Begriffe zu.',
    paare: [['Syntax', 'Schreibregeln der Sprache'], ['Semantik', 'Bedeutung – was das Programm tut'], ['Syntaxfehler', 'Python meldet ihn schon vor dem Start'], ['Fehler in der Logik', 'Programm läuft, liefert aber ein falsches Ergebnis']],
    erkl: 'Ein fehlender Doppelpunkt ist ein Syntaxfehler. range(1, 5) statt range(1, 6) ist ein Fehler in der Logik – Python merkt nichts.', quelle: 'svp_10 SW 2; OPAL Kl. 10 LK3 Aufgabe 2 (Syntax und Semantik)' },
  { id: 'k10_012', burg: 10, kap: 111, stufe: 1, art: 'zeile', frage: 'Das Programm soll prüfen, ob eine Zahl gerade ist. Python meldet einen Syntaxfehler. Tippe die fehlerhafte Zeile an.',
    code: 'zahl = int(input("Zahl: "))\nif zahl % 2 = 0:\n    print("gerade")\nelse:\n    print("ungerade")', fehler: [2],
    erkl: 'Für einen Vergleich braucht man ==. Ein einzelnes = ist eine Zuweisung und in einer Bedingung nicht erlaubt.', quelle: 'OPAL Kl. 10 LK1 Python Aufgabe 6a' },
  { id: 'k10_013', burg: 10, kap: 111, stufe: 1, art: 'zeile', frage: 'Python meldet einen Syntaxfehler. Tippe die fehlerhafte Zeile an.',
    code: 'zahl = int(input("Zahl: "))\nif zahl % 2 == 0:\n    print("gerade")\nelse\n    print("ungerade")', fehler: [4],
    erkl: 'Nach else (wie nach if, elif, for, while und def) gehört ein Doppelpunkt: else:', quelle: 'OPAL Kl. 10 LK1 Python Aufgabe 6a' },
  { id: 'k10_014', burg: 10, kap: 111, stufe: 2, art: 'eingabe', zahl: true, frage: 'Erstelle in Gedanken eine Belegungstabelle für i und summe. Was gibt print(summe) aus?',
    code: 'summe = 0\ni = 1\nwhile i <= 5:\n    summe = summe + i\n    i = i + 2\nprint(summe)', antworten: ['9'],
    erkl: 'i nimmt 1, 3, 5 an: summe = 1, dann 4, dann 9. Danach ist i = 7, und 7 <= 5 ist falsch.', quelle: 'OPAL Kl. 10 LK1 Python Aufgabe 4a (Variablenbelegungstabelle); 3_6_variablenbeleg' },
  { id: 'k10_015', burg: 10, kap: 111, stufe: 2, art: 'eingabe', frage: 'Welche Zahlen gibt das Programm aus? (mit Leerzeichen getrennt)',
    code: 'for i in range(2, 10, 3):\n    print(i)', antworten: ['2 5 8', '2, 5, 8', '2,5,8'],
    erkl: 'range(start, ende, schritt): ab 2 in Dreierschritten, ende (10) selbst gehört nie dazu: 2, 5, 8.', quelle: 'OPAL Kl. 10 2_3_Schleifen (range(start, ende, wert))' },
  { id: 'k10_016', burg: 10, kap: 111, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 2_3_Schleifen (range gibt Werte bis ende − 1)',
    gen: (z) => { const n = z.int(4, 12); return { frage: 'Wie oft wird print(i) ausgeführt?', code: `for i in range(1, ${n}):\n    print(i)`, antworten: [String(n - 1)], erkl: `range(1, ${n}) liefert 1, 2, …, ${n - 1} – das sind ${n - 1} Werte. Der Endwert ${n} gehört nicht dazu.` }; } },
  { id: 'k10_017', burg: 10, kap: 111, stufe: 3, art: 'zeile', frage: 'Das Programm soll 1 + 2 + 3 + 4 + 5 = 15 ausgeben, gibt aber 10 aus. Tippe die Zeile mit dem Fehler in der Logik an.',
    code: 'summe = 0\ni = 1\nwhile i < 5:\n    summe = summe + i\n    i = i + 1\nprint(summe)', fehler: [3],
    erkl: 'Mit i < 5 endet die Schleife, bevor 5 addiert wird. Richtig ist while i <= 5. Eine Belegungstabelle zeigt das sofort.', quelle: 'svp_10 SW 6 (Logikfehler beheben); OPAL Kl. 10 3_6_variablenbeleg' },
  { id: 'k10_018', burg: 10, kap: 111, stufe: 2, art: 'zeile', frage: 'Der Countdown soll von 10 bis 1 zählen, hört aber nie auf. Tippe die fehlerhafte Zeile an.',
    code: 'n = 10\nwhile n > 0:\n    print(n)\n    n = n + 1', fehler: [4],
    erkl: 'n wird immer größer, die Bedingung n > 0 bleibt also immer wahr – eine Endlosschleife. Richtig: n = n - 1.', quelle: 'OPAL Kl. 10 2_3_Schleifen (Bedingung muss sich ändern können, sonst Endlosschleife)' },
  { id: 'k10_019', burg: 10, kap: 111, stufe: 1, art: 'wahl', frage: 'Wozu dient eine Tabelle der Variablenbelegung?',
    optionen: ['Sie zeigt Schritt für Schritt die Werte der Variablen.', 'Sie listet alle Syntaxfehler eines Programms auf.', 'Sie zeigt, welche Datentypen eine Variable haben darf.', 'Sie zählt, wie oft jede Zeile des Programms vorkommt.'],
    erkl: 'Schritt für Schritt (wie im Debugger von Thonny) sieht man, wo eine Variable einen unerwarteten Wert bekommt.', quelle: 'OPAL Kl. 10 3_6_variablenbeleg; svp_10 SW 6' },
  { id: 'k10_020', burg: 10, kap: 111, stufe: 3, art: 'eingabe', frage: 'Die Werte von a und b sollen getauscht werden. Was gibt das Programm wirklich aus?',
    code: 'a = 3\nb = 8\na = b\nb = a\nprint(a, b)', antworten: ['8 8', '8, 8'],
    erkl: 'Nach a = b ist der alte Wert 3 verloren, dann bekommt b den neuen Wert von a (8). Zum Tauschen braucht man eine Hilfsvariable: hilf = a.', quelle: 'OPAL Kl. 10 2_4_Unterprogramme Aufgabe 3 (lokale_globale_Variablen.py, Zahlen tauschen)' },

  // ============================== 112 🧰 Unterprogramme mit def ==============================
  { id: 'k10_021', burg: 10, kap: 112, stufe: 1, art: 'zuordnen', frage: 'Ordne die Begriffe zu.',
    paare: [['Funktion', 'benannter, wiederverwendbarer Programmteil, mit def definiert'], ['Parameter', 'Wert, der beim Aufruf in Klammern übergeben wird'], ['Rückgabewert', 'Ergebnis, das mit return zurückgegeben wird'], ['DRY', 'Don’t Repeat Yourself – nichts doppelt schreiben']],
    erkl: 'def flaeche(b, h): definiert eine Funktion mit den Parametern b und h; return b * h gibt den Rückgabewert an die aufrufende Stelle.', quelle: 'OPAL Kl. 10 LK2 Python Aufgabe 1; 2_4_Unterprogramme (DRY)' },
  { id: 'k10_022', burg: 10, kap: 112, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 LK2 Python Aufgabe 2a',
    gen: (z) => {
      const a = z.int(2, 9), b = z.int(2, 9), c = z.int(1, 9), d = z.int(1, 9), f = a * b, u = 2 * (c + d);
      return { frage: 'Was gibt das Programm aus?', code: `def flaeche(b, h):\n    return b * h\n\ndef umfang(b, h):\n    return 2 * (b + h)\n\nprint(flaeche(${a}, ${b}) + umfang(${c}, ${d}))`,
        antworten: [String(f + u)], erkl: `flaeche(${a}, ${b}) = ${f}, umfang(${c}, ${d}) = 2 · (${c} + ${d}) = ${u}, zusammen ${f + u}.` };
    } },
  { id: 'k10_023', burg: 10, kap: 112, stufe: 2, art: 'eingabe', zahl: true, frage: 'Was gibt das Programm aus?',
    code: 'x = 5\n\ndef f():\n    x = 10\n    return x * 2\n\nprint(f() + x)', antworten: ['25'],
    erkl: 'In f ist x = 10 eine lokale Variable, f() liefert 20. Das globale x bleibt 5: 20 + 5 = 25.', quelle: 'OPAL Kl. 10 2_4_Unterprogramme (lokale und globale Variablen)' },
  { id: 'k10_024', burg: 10, kap: 112, stufe: 2, art: 'eingabe', zahl: true, frage: 'Was gibt das Programm aus?',
    code: 'punkte = 0\n\ndef treffer():\n    global punkte\n    punkte = punkte + 10\n\ntreffer()\ntreffer()\ntreffer()\nprint(punkte)', antworten: ['30'],
    erkl: 'Mit global punkte ändert die Funktion die globale Variable. Drei Aufrufe: 0 → 10 → 20 → 30.', quelle: 'OPAL Kl. 10 2_4_Unterprogramme (globale Variablen); Spiel-Auftrag xc6' },
  { id: 'k10_025', burg: 10, kap: 112, stufe: 1, art: 'wahl', frage: 'Ein Programm beginnt mit import random. Wie ruft man danach die Funktion randint auf?',
    optionen: ['random.randint(1, 6)', 'randint(1, 6)', 'import.randint(1, 6)', 'random(randint, 1, 6)'],
    erkl: 'Nach import random steht der Modulname davor (Punktnotation). Nur nach from random import randint ruft man direkt randint(1, 6) auf.', quelle: 'OPAL Kl. 10 LK2 Python Aufgabe 4; 2_4_Unterprogramme (Funktionen aus Modulen importieren)' },
  { id: 'k10_026', burg: 10, kap: 112, stufe: 2, art: 'eingabe', frage: 'Was gibt die letzte Zeile print(x) aus?',
    code: 'def gruss(name):\n    print("Hallo", name)\n\nx = gruss("Ada")\nprint(x)', antworten: ['None'],
    erkl: 'gruss gibt zwar „Hallo Ada“ aus, hat aber kein return. Eine Funktion ohne return gibt None zurück – das landet in x.', quelle: 'OPAL Kl. 10 2_4_Unterprogramme (Beispiel 1 ohne, Beispiel 2 mit Rückgabewert)' },
  { id: 'k10_027', burg: 10, kap: 112, stufe: 1, art: 'luecke', frage: 'Ergänze die Funktion, die das Quadrat einer Zahl zurückgibt.',
    code: '▢ quadrat(x):\n    ▢ x * x', text: 'Zeile 1: {} quadrat(x):  ·  Zeile 2: {} x * x', luecken: [['def'], ['return']], woerter: ['def', 'return', 'print', 'for', 'function'],
    erkl: 'Funktionen werden mit def definiert, return gibt das Ergebnis zurück. print würde es nur anzeigen.', quelle: 'OPAL Kl. 10 2_4_Unterprogramme (Beispiel 2: quadrat)' },
  { id: 'k10_028', burg: 10, kap: 112, stufe: 3, art: 'zeile', frage: 'Python meldet: NameError: name \'doppelt\' is not defined. Tippe die Zeile an, in der der Fehler auftritt.',
    code: 'print(doppelt(4))\n\ndef doppelt(x):\n    return 2 * x', fehler: [1],
    erkl: 'Python arbeitet von oben nach unten. In Zeile 1 ist doppelt noch nicht definiert. Die Funktion muss vor dem Aufruf stehen.', quelle: 'OPAL Kl. 10 2_4_Unterprogramme (Funktionen müssen definiert und aufgerufen werden)' },
  { id: 'k10_029', burg: 10, kap: 112, stufe: 1, art: 'wahl', frage: 'Was versteht man unter Modularisierung?',
    optionen: ['Ein Problem in Teile zerlegen, jedes mit eigener Funktion.', 'Alle Variablen global anlegen, damit jede Funktion sie sieht.', 'Ein Programm auf mehreren Computern gleichzeitig starten.', 'Wiederholte Zeilen mehrmals untereinander kopieren.'],
    erkl: 'Modularisierung macht Programme übersichtlich: Teilaufgaben bekommen eigene Funktionen oder Module, die man wiederverwenden kann.', quelle: 'svp_10 SW 10 (Prinzip der Modularisierung); OPAL Kl. 10 2_4_Unterprogramme' },
  { id: 'k10_030', burg: 10, kap: 112, stufe: 3, art: 'eingabe', zahl: true, frage: 'Was gibt das Programm aus?',
    code: 'def plus1(x):\n    return x + 1\n\ndef mal2(x):\n    return x * 2\n\nprint(mal2(plus1(3)) + plus1(mal2(3)))', antworten: ['15'],
    erkl: 'Innen zuerst: mal2(plus1(3)) = mal2(4) = 8, plus1(mal2(3)) = plus1(6) = 7. Zusammen 15.', quelle: 'OPAL Kl. 10 2_4_Unterprogramme (Funktionen können andere Funktionen aufrufen)' },

  // ============================== 113 📋 Listen ==============================
  { id: 'k10_031', burg: 10, kap: 113, stufe: 1, art: 'wahl', frage: 'tiere = ["Hund", "Katze", "Maus"]. Welchen Index hat "Hund"?',
    optionen: ['0', '1', '-1', '3'],
    erkl: 'Der Index beginnt in Python immer bei 0. Das erste Element ist tiere[0], das letzte tiere[2] (oder tiere[-1]).', quelle: 'OPAL Kl. 10 3_7_arrays (Was ist ein Index?)' },
  { id: 'k10_032', burg: 10, kap: 113, stufe: 2, art: 'eingabe', frage: 'Was gibt print(farben[2]) aus?',
    code: 'farben = ["rot", "blau", "grün"]\nfarben.append("gelb")\nfarben.insert(1, "weiß")\ndel farben[3]\nprint(farben[2])', antworten: ['blau', '"blau"', "'blau'"],
    erkl: 'append → rot, blau, grün, gelb. insert(1, "weiß") → rot, weiß, blau, grün, gelb. del farben[3] löscht grün → rot, weiß, blau, gelb. Index 2 ist blau.', quelle: 'OPAL Kl. 10 3_7_arrays (append, insert, del)' },
  { id: 'k10_033', burg: 10, kap: 113, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 3_7_arrays (Index)',
    gen: (z) => { const l = [z.int(1, 30), z.int(1, 30), z.int(1, 30), z.int(31, 60)], e = l[3] - l[1]; return { frage: 'Was gibt das Programm aus?', code: `z = [${l.join(', ')}]\nprint(z[-1] - z[1])`, antworten: [String(e)], erkl: `z[-1] ist das letzte Element (${l[3]}), z[1] das zweite (${l[1]}): ${l[3]} − ${l[1]} = ${e}.` }; } },
  { id: 'k10_034', burg: 10, kap: 113, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 3_7_arrays Aufgabe 5 (Zählen mit Bedingung)',
    gen: (z) => {
      const w = [z.int(1, 20), z.int(1, 20), z.int(1, 20), z.int(1, 20), z.int(1, 20)], g = z.int(6, 14), t = w.filter((x) => x > g);
      return { frage: 'Was gibt das Programm aus?', code: `werte = [${w.join(', ')}]\nanzahl = 0\nfor zahl in werte:\n    if zahl > ${g}:\n        anzahl += 1\nprint(anzahl)`,
        antworten: [String(t.length)], erkl: `Größer als ${g} sind: ${t.length ? t.join(', ') : 'keine'} – also ${t.length}. Genau ${g} zählt nicht.` };
    } },
  { id: 'k10_035', burg: 10, kap: 113, stufe: 3, art: 'zeile', frage: 'Der Durchschnitt der Noten 2, 3, 1 ist 2. Das Programm gibt aber 1.333… aus. Tippe die fehlerhafte Zeile an.',
    code: 'noten = [2, 3, 1]\nsumme = 0\nfor i in range(1, len(noten)):\n    summe = summe + noten[i]\nprint(summe / len(noten))', fehler: [3],
    erkl: 'range(1, 3) liefert nur 1 und 2 – noten[0] wird nie addiert. Richtig: range(len(noten)) oder for note in noten.', quelle: 'OPAL Kl. 10 3_7_arrays (Index ab 0); 2_3_Schleifen (range)' },
  { id: 'k10_036', burg: 10, kap: 113, stufe: 1, art: 'zuordnen', frage: 'Ordne jeder Listen-Anweisung ihre Wirkung zu.',
    paare: [['liste.append(w)', 'hängt w hinten an'], ['liste.insert(i, w)', 'fügt w an der Stelle i ein'], ['liste.remove(w)', 'löscht den Wert w'], ['del liste[i]', 'löscht das Element mit Index i'], ['len(liste)', 'Anzahl der Elemente']],
    erkl: 'Nach insert rücken die folgenden Elemente nach rechts, nach remove und del nach links – ihre Indizes ändern sich.', quelle: 'OPAL Kl. 10 3_7_arrays (Elemente hinzufügen, einfügen, entfernen)' },
  { id: 'k10_037', burg: 10, kap: 113, stufe: 2, art: 'wahl', frage: 'Was passiert bei diesem Programm?',
    code: 'liste = [4, 7, 9]\nprint(liste[3])',
    optionen: ['IndexError – Platz 3 gibt es nicht', '9 – das dritte Element der Liste', '7 – Platz 3 ohne die 0 gezählt', 'None – ein leerer Platz am Ende'],
    erkl: 'Drei Elemente haben die Indizes 0, 1 und 2. liste[3] liegt außerhalb der Liste – Python bricht mit IndexError ab.', quelle: 'OPAL Kl. 10 3_7_arrays (Index beginnt bei 0)' },
  { id: 'k10_038', burg: 10, kap: 113, stufe: 1, art: 'eingabe', zahl: true, frage: 'Was gibt das Programm aus?',
    code: 'z = [1, 2, 3]\nz.append(4)\nz.remove(2)\nprint(len(z))', antworten: ['3'],
    erkl: 'Nach append: [1, 2, 3, 4]. remove(2) löscht den Wert 2 (nicht den Index 2): [1, 3, 4] – also 3 Elemente.', quelle: 'OPAL Kl. 10 3_7_arrays Aufgabe 2 (Hinzufügen und Entfernen)' },

  // ============================== 114 🚁 Maschinelle Entscheidungen ==============================
  { id: 'k10_039', burg: 10, kap: 114, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 LK2 Python Aufgabe 5a (autonomes Fahren)',
    gen: (z) => {
      const a = z.wahl([10, 15, 30, 45, 60, 80]), t = z.wahl([20, 40, 60, 100]);
      const r = a < 20 && t > 30 ? 'Vollbremsung' : a < 50 ? 'langsamer' : 'weiterfahren';
      const grund = a < 20 && t > 30 ? `${a} < 20 und ${t} > 30 – beides wahr` : a < 50 ? `die erste Bedingung ist falsch, aber ${a} < 50` : `beide Bedingungen sind falsch, also else`;
      return { frage: `Was gibt entscheide(${a}, ${t}) zurück?`, code: 'def entscheide(abstand, tempo):\n    if abstand < 20 and tempo > 30:\n        return "Vollbremsung"\n    elif abstand < 50:\n        return "langsamer"\n    else:\n        return "weiterfahren"',
        antworten: [r], erkl: `${grund} → ${r}.` };
    } },
  { id: 'k10_040', burg: 10, kap: 114, stufe: 1, art: 'zuordnen', frage: 'Ordne die Begriffe zu.',
    paare: [['überwachtes Lernen', 'Trainingsdaten haben Labels (z. B. „Katze“/„Hund“)'], ['unüberwachtes Lernen', 'Daten ohne Labels, der Algorithmus sucht selbst Muster'], ['Clustering', 'Objekte mit ähnlichen Merkmalen in Gruppen einteilen'], ['Kategorisierung', 'Neues einer bestehenden Gruppe zuordnen']],
    erkl: 'Clustering (z. B. k-Means) ist unüberwachtes Lernen. Kategorisierung ordnet z. B. einen neuen Einsatzort der nächsten vorhandenen Drohne zu.', quelle: 'OPAL Kl. 10 5_1_clustering (Drohnen-Startup)' },
  { id: 'k10_041', burg: 10, kap: 114, stufe: 2, art: 'eingabe', zahl: true, frage: 'k-Means mit k = 2: Einsätze bei Kilometer 1, 3, 5, 8, 10, 12. Start: z1 = 1, z2 = 12. Jeder Ort kommt zum näheren Zentrum, dann wandert jedes Zentrum in die Mitte seiner Orte. Wo steht z1 nach der ersten Runde?',
    antworten: ['3'], erkl: '1, 3 und 5 liegen näher an 1, 8, 10 und 12 näher an 12. Neues z1 = (1 + 3 + 5) / 3 = 3, neues z2 = (8 + 10 + 12) / 3 = 10.', quelle: 'OPAL Kl. 10 5_1_clustering Aufgabe 6 (partitionierendes Verfahren k-Means)' },
  { id: 'k10_042', burg: 10, kap: 114, stufe: 1, art: 'reihe', frage: 'Bring die Schritte von k-Means in die richtige Reihenfolge.',
    teile: ['k Zentren festlegen', 'jeden Punkt dem nächsten Zentrum zuordnen', 'jedes Zentrum in die Mitte (Durchschnitt) seiner Punkte verschieben', 'wiederholen, bis sich nichts mehr ändert'],
    erkl: 'Zuordnen und Verschieben wechseln sich ab, bis die Gruppen gleich bleiben.', quelle: 'OPAL Kl. 10 5_1_clustering (k-Means); Spiel-Auftrag xe4' },
  { id: 'k10_043', burg: 10, kap: 114, stufe: 3, art: 'mehr', frage: 'Die Funktion entscheide(abstand, tempo) steuert das Bremsen mit festen Grenzen. Kreuze alle Grenzen dieses Modells an, die in Wirklichkeit zu Fehlentscheidungen führen können.',
    optionen: ['Nasse oder glatte Fahrbahn wird nicht berücksichtigt.', 'Sensoren können Abstände falsch messen.', 'Feste Grenzwerte passen nicht zu jeder Situation.', 'Python kann keine Zahlen über 100 vergleichen.', 'Eine Funktion darf nur einmal aufgerufen werden.'], richtig: [0, 1, 2],
    erkl: 'Ein Modell vereinfacht die Wirklichkeit. Was es nicht kennt (Wetter, Beladung, Sensorfehler), kann es nicht beachten.', quelle: 'OPAL Kl. 10 LK2 Python Aufgabe 6b' },
  { id: 'k10_044', burg: 10, kap: 114, stufe: 3, art: 'wahl', frage: 'Wird ein Fußgänger erkannt (fussgaenger ist True), soll unabhängig von allem anderen eine Vollbremsung erfolgen. Welche erste Bedingung ist richtig?',
    optionen: ['if fussgaenger or (abstand < 20 and tempo > 30):', 'if fussgaenger and abstand < 20 and tempo > 30:', 'if (fussgaenger or abstand < 20) and tempo > 30:', 'if not fussgaenger or abstand < 20:'],
    erkl: 'Mit or reicht der Fußgänger allein. Bei and bzw. mit tempo > 30 in der äußeren Klammer würde bei langsamer Fahrt nicht gebremst.', quelle: 'OPAL Kl. 10 LK2 Python Aufgabe 5b' },
  { id: 'k10_045', burg: 10, kap: 114, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 LK2 Python Aufgabe 6a (Faustformel Bremsweg)',
    gen: (z) => { const t = z.wahl([30, 40, 50, 60, 70, 80, 90, 100]), w = (t / 10) * (t / 10); return { frage: `Was liefert bremsweg(${t})?`, code: 'def bremsweg(tempo):\n    return (tempo / 10) * (tempo / 10)', antworten: [String(w)], erkl: `${t} / 10 = ${t / 10}, und ${t / 10} · ${t / 10} = ${w}. (Python gibt ${w}.0 aus, weil / immer einen float liefert.)` }; } },

  // ============================== 115 🔣 Formale Sprachen und Automaten ==============================
  { id: 'k10_046', burg: 10, kap: 115, stufe: 1, art: 'zuordnen', frage: 'Ordne die Begriffe zu.',
    paare: [['Alphabet', 'endliche, nichtleere Menge von Zeichen'], ['Wort', 'endliche Folge von Zeichen des Alphabets'], ['Sprache', 'Menge von Wörtern über dem Alphabet'], ['leeres Wort ε', 'Wort ohne ein einziges Zeichen']],
    erkl: 'Beispiel: Σ = {I, V, X, L, C, D, M}; LXX und XXL sind Wörter darüber, aber nur LXX gehört zur Sprache der römischen Zahlen.', quelle: 'OPAL Kl. 10 sprachen_formalisier (Merke); LK3 Aufgabe 1' },
  { id: 'k10_047', burg: 10, kap: 115, stufe: 1, art: 'wahl', frage: '„12,5“ ist eine gültige Dezimalzahl, „1,,2“ nicht. Was legt das fest?',
    optionen: ['die Syntax', 'die Semantik', 'das Alphabet allein', 'der Automat'],
    erkl: 'Die Syntax legt fest, welche Zeichenfolgen gültig sind. Die Semantik ist die Bedeutung: 12,5 bezeichnet den Wert zwölfeinhalb.', quelle: 'OPAL Kl. 10 LK3 Sprachen Aufgabe 2' },
  { id: 'k10_048', burg: 10, kap: 115, stufe: 2, art: 'mehr', frage: 'L ist die Sprache aller Wörter über {0, 1}, die mit 1 beginnen und mit 0 enden. Kreuze alle Wörter an, die zu L gehören.',
    optionen: ['10', '110', '1010', '01', '101', '1'], richtig: [0, 1, 2],
    erkl: '01 beginnt mit 0, 101 endet mit 1, und 1 endet nicht mit 0.', quelle: 'OPAL Kl. 10 LK3 Sprachen Aufgabe 3a' },
  { id: 'k10_049', burg: 10, kap: 115, stufe: 2, art: 'wahl', frage: 'Welcher reguläre Ausdruck beschreibt L = alle Wörter über {0, 1}, die mit 1 beginnen und mit 0 enden?',
    optionen: ['1(0|1)*0', '(0|1)*10', '1(0|1)+0', '10*'],
    erkl: '1 am Anfang, beliebige Mitte (auch leer), 0 am Ende. (0|1)*10 erlaubt auch 010, 1(0|1)+0 verbietet das kürzeste Wort 10, und 10* erzeugt nur 1, 10, 100 …', quelle: 'OPAL Kl. 10 LK3 Sprachen Aufgabe 3b' },
  { id: 'k10_050', burg: 10, kap: 115, stufe: 2, art: 'mehr', frage: 'Kreuze alle Zeichenketten an, die vollständig auf den regulären Ausdruck [A-Z][a-z]+ passen.',
    optionen: ['Anna', 'Ab', 'anna', 'AB', 'A'], richtig: [0, 1],
    erkl: 'Zuerst genau ein Großbuchstabe, dann mindestens ein Kleinbuchstabe. anna beginnt klein, bei AB folgt kein Kleinbuchstabe, bei A fehlt er ganz (+ heißt mindestens einmal).', quelle: 'OPAL Kl. 10 LK3 Sprachen Aufgabe 4a' },
  { id: 'k10_051', burg: 10, kap: 115, stufe: 3, art: 'eingabe', zahl: true, frage: 'Im Text wird mit [0-9]{5} gesucht. Nach jedem Treffer wird dahinter weitergesucht. Wie viele Treffer gibt es?',
    code: 'Die Burg liegt in 01069 Dresden. Telefon: 0351 4472910.', antworten: ['2'],
    erkl: 'Treffer sind 01069 und 44729 (aus der Telefonnummer). Der Ausdruck prüft nur fünf aufeinanderfolgende Ziffern; 0351 hat nur vier, der Rest „10“ nur zwei.', quelle: 'OPAL Kl. 10 LK3 Sprachen Aufgabe 5a' },
  { id: 'k10_052', burg: 10, kap: 115, stufe: 2, art: 'luecke', frage: 'Ergänze den regulären Ausdruck, der genau die Wörter Datei und Dateien findet.',
    text: 'Datei(en){}', luecken: [['?']], woerter: ['?', '*', '+', '|'],
    erkl: '? heißt: Das Davorstehende kommt höchstens einmal vor. (en)* würde auch Dateienen finden, (en)+ nicht mehr Datei.', quelle: 'OPAL Kl. 10 LK3 Sprachen Aufgabe 5b; regulaere_ausdruecke (Operator ?)' },
  { id: 'k10_053', burg: 10, kap: 115, stufe: 1, art: 'wahl', frage: 'Welche Sprache beschreibt dieser reguläre Ausdruck?', code: 'abc?',
    optionen: ['{ab, abc}', '{abc, abcc, abccc, …}', '{a, b, c}', '{abc}'],
    erkl: 'Das ? bezieht sich nur auf das Zeichen direkt davor: c darf fehlen oder einmal vorkommen.', quelle: 'OPAL Kl. 10 regulaere_ausdruecke (Tabelle der Operatoren)' },
  { id: 'k10_054', burg: 10, kap: 115, stufe: 1, art: 'wahl', frage: 'Wann akzeptiert ein deterministischer endlicher Automat (DEA) eine Eingabe?',
    optionen: ['Wenn er nach dem letzten Zeichen in einem Endzustand steht.', 'Sobald er unterwegs einmal einen Endzustand erreicht hat.', 'Wenn er jeden seiner Zustände mindestens einmal besucht.', 'Wenn er beim Lesen nie in den Startzustand zurückkehrt.'],
    erkl: 'Die Eingabe wird zeichenweise ganz abgearbeitet. Nur wenn der Automat danach im Endzustand ist, wird sie akzeptiert.', quelle: 'OPAL Kl. 10 endlicheAutomaten (Merke: Zustandsgraph)' },
  { id: 'k10_055', burg: 10, kap: 115, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 endlicheAutomaten Aufgabe 5 (DEA 2)',
    gen: (z) => {
      const n = z.int(5, 7); let w = '', zust = 'Z0';
      for (let i = 0; i < n; i++) { const c = z.wahl(['0', '1']); w += c; if (c === '1') zust = zust === 'Z0' ? 'Z1' : 'Z0'; }
      const einsen = [...w].filter((c) => c === '1').length;
      return { frage: `Der DEA liest die Eingabe ${w}. In welchem Zustand steht er am Ende?`, code: 'Z0 --1--> Z1\nZ1 --1--> Z0\nZ0 --0--> Z0\nZ1 --0--> Z1\nStart: Z0   Endzustand: Z0',
        antworten: [zust, zust.replace('Z', 'Z_')], erkl: `Jede 1 wechselt den Zustand, eine 0 lässt ihn gleich. ${w} enthält ${einsen} Einsen → ${zust}. Der Automat akzeptiert genau die Wörter mit gerader Anzahl Einsen${zust === 'Z0' ? ' – diese Eingabe also auch' : ' – diese Eingabe nicht'}.` };
    } },
  { id: 'k10_056', burg: 10, kap: 115, stufe: 3, art: 'wahl', frage: 'Ein Formular prüft E-Mail-Adressen mit [a-z0-9]+@[a-z0-9]+\\.[a-z]{2,}. Welche gültige Adresse wird trotzdem abgelehnt?',
    optionen: ['max.m@web.de', 'anna@burg.de', 'ben7@post99.org', 'lea@web.info'],
    erkl: 'Der Ausdruck erlaubt keinen Punkt im Namen (max.m) – und auch keine Subdomain wie mail.schule.de. Er ist vereinfacht – echte Adressen sind vielfältiger.', quelle: 'OPAL Kl. 10 LK3 Sprachen Aufgabe 6b' },
  { id: 'k10_057', burg: 10, kap: 115, stufe: 3, art: 'wahl', frage: 'Ein Formular akzeptiert Passwörter mit [A-Za-z0-9]{8,}. Stellt das sicher, dass Passwörter sicher sind?',
    optionen: ['Nein – auch 12345678 passt, geprüft wird nur die Form.', 'Ja – Buchstaben und Ziffern zusammen sind Pflicht.', 'Ja – mit mindestens 8 Zeichen ist es immer sicher.', 'Nein – der Ausdruck lässt gar keine Ziffern zu.'],
    erkl: '{8,} heißt „mindestens 8“. Der Ausdruck verlangt nicht, dass verschiedene Zeichenarten vorkommen, und schließt bekannte Passwörter nicht aus.', quelle: 'OPAL Kl. 10 LK3 Sprachen Aufgabe 6a' },

  // ============================== k-Means und reguläre Ausdrücke mit Zufallswerten (2026-11-13) ==============================
  { id: 'k10_058', burg: 10, kap: 114, stufe: 2, art: 'eingabe', zahl: true, tol: 0.01, frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 5_1_clustering (k-Means: Zentrum neu berechnen)',
    gen: (z) => {
      const n = z.int(3, 4), xs = [...Array(n)].map(() => z.int(1, 12)), ys = [...Array(n)].map(() => z.int(1, 12)), ach = z.wahl(['x', 'y']), w = ach === 'x' ? xs : ys;
      const m = w.reduce((s, v) => s + v, 0) / n;
      return { frage: `Zu einem Cluster gehören diese ${n} Einsatzorte. Wo liegt das neue Zentrum? Gib seine ${ach}-Koordinate an.`, code: xs.map((x, i) => `(${x}, ${ys[i]})`).join('   '),
        antworten: [String(Math.round(m * 100) / 100)], erkl: `Das neue Zentrum ist der Durchschnitt: ${ach} = (${w.join(' + ')}) / ${n} = ${String(Math.round(m * 100) / 100).replace('.', ',')}.` };
    } },
  { id: 'k10_059', burg: 10, kap: 114, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 5_1_clustering (k-Means: Punkte zuordnen)',
    gen: (z) => {
      let a, b, p, da, db;
      do { a = [z.int(0, 10), z.int(0, 10)]; b = [z.int(0, 10), z.int(0, 10)]; p = [z.int(0, 10), z.int(0, 10)]; da = (p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2; db = (p[0] - b[0]) ** 2 + (p[1] - b[1]) ** 2; } while (da === db);
      const n = da < db ? 'A' : 'B';
      return { frage: `Zentrum A liegt bei (${a[0]}, ${a[1]}), Zentrum B bei (${b[0]}, ${b[1]}). Zu welchem Cluster kommt der Punkt (${p[0]}, ${p[1]})? Tippe A oder B.`,
        antworten: [n], erkl: `Abstand zum Quadrat: zu A ${da}, zu B ${db}. Der Punkt kommt zum näheren Zentrum ${n}.` };
    } },
  { id: 'k10_060', burg: 10, kap: 115, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: 'Die Erklärung kommt aus gen.', quelle: 'OPAL Kl. 10 regulaere_ausdruecke, anwendung_regex',
    gen: (z) => {
      const [muster, beschr, gut, schlecht] = z.wahl([['[0-9]{5}', 'eine Postleitzahl', '01069', ['1069', '010690', '0106a']], ['[A-Z][a-z]+', 'ein Name', 'Ida', ['ida', 'I', 'IDA']], ['(ab)+', 'ab mindestens einmal', 'abab', ['aba', 'ba', '']], ['R(a|o)+t', 'Rat, Rot, Raot …', 'Raot', ['Rt', 'Rit', 'rat']]]);
      const w = z.mische([gut, ...schlecht.filter(Boolean)].slice(0, 3)), richtig = w.filter((x) => new RegExp(`^(?:${muster})$`).test(x));
      return { frage: `Welche dieser Wörter passen vollständig auf ${muster}? Tippe sie mit Leerzeichen ein (in der Reihenfolge von oben).`, code: w.join('\n'),
        antworten: [richtig.join(' ')], erkl: `${muster} beschreibt ${beschr}. Es passt: ${richtig.join(', ') || 'keines'}. Das Muster muss auf das ganze Wort passen.` };
    } },
);
