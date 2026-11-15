'use strict';
// --- 📓 Das Heft (PLAN.md 6a): ein Heft je Burg, wächst mit dem Spiel, druckbar ---------------------------
// Seiten: Titelbild · „Dieses Heft gehört …“ mit Übersicht · je gelöstem Kapitel eine halbe Seite (Merke + 1–2 Beispiele
// aus dem Spiel) · Meine Burg. Merksätze bewusst einfach (nach den OPAL-Kursen), nicht zu tief.
// Beispiele: bei Höfen der eigene Code mit Bild des Ackers, im Archiv die eigene Abfrage mit Ergebnis,
// im Späherturm das, was man selbst gemacht hat (P.kiHeft: Baum, Partien, Sätze …).

// HEFT_MERKE[kapitel] = { titel, text: [höchstens 3 kurze Sätze], code? } – Begriffe wie in den OPAL-Kursen
// (Algorithmus, Sequenz, Zählschleife, bedingte Schleife, bedingte Anweisung, Attribut/Datensatz, verstärkendes Lernen …)
const HEFT_MERKE = {
  // Burg 7
  1: { titel: 'Algorithmus und Sequenz', text: ['Ein Algorithmus ist eine eindeutige, ausführbare und endliche Handlungsvorschrift, um ein Problem zu lösen.', 'Sequenz: Die Befehle werden nacheinander abgearbeitet – in der Reihenfolge, in der sie dastehen.'],
    code: 'forward()\nharvest()\nturn_right()' },
  3: { titel: 'Die Zählschleife', text: ['Eine Zählschleife wiederholt die Befehle in ihr so oft wie vorgegeben.', 'So muss man Befehle nicht mehrmals aufschreiben.', 'Eine Schleife kann auch in einer anderen Schleife stehen (verschachtelt).'],
    code: 'for i in range(3):\n    forward()\n    harvest()' },
  22: { titel: 'Schleifen in neuen Welten', text: ['Dieselben Bausteine lösen ganz andere Aufgaben: Statt Rüben zu ernten, hebt der Bauer Ziegel auf und flickt Löcher.', 'Erst schauen, was sich wiederholt – das kommt in die Schleife.'],
    code: 'for i in range(6):\n    forward()\n    pick_up()\n    forward()\n    place()' },
  5: { titel: 'Variablen', text: ['Eine Variable ist ein Behälter für einen Wert, z. B. eine Zahl.', 'Bei einer Wertzuweisung bekommt sie einen neuen Wert – der alte wird ersetzt.'],
    code: 'schritte = 4\nfor i in range(schritte):\n    forward()' },
  2: { titel: 'Programmieren mit Text', text: ['Ein Programm kann man auch als Text schreiben statt mit Blöcken – zum Beispiel in Python.', 'Jeder Befehl steht in einer eigenen Zeile. Was in eine Schleife gehört, wird eingerückt.'],
    code: 'for i in range(2):\n    forward()\nturn_left()' },
  // Burg 8
  9: { titel: 'Was du schon kannst', text: ['Sequenz: Befehle werden der Reihe nach abgearbeitet.', 'Die Zählschleife for wiederholt Befehle so oft wie vorgegeben.', 'Variablen speichern Werte.'] },
  4: { titel: 'Die bedingte Schleife', text: ['Eine bedingte Schleife wiederholt Befehle, solange eine Bedingung wahr ist.', 'Eine Bedingung hat nur zwei Ergebnisse: wahr (True) oder falsch (False).', 'In der Schleife muss sich etwas ändern – sonst entsteht eine Endlosschleife.'],
    code: 'while can_move():\n    forward()' },
  10: { titel: 'Zählen mit einer Variable', text: ['Eine Zählvariable beginnt bei 0 und wird in der Schleife jedes Mal um 1 erhöht.', 'Am Ende steht in ihr, wie oft etwas passiert ist.', 'Vergleiche wie < <= == != liefern wahr oder falsch; mit and müssen beide Bedingungen stimmen.'],
    code: 'schritte = 0\nwhile schritte < 5 and can_move():\n    forward()\n    schritte = schritte + 1\nprint(schritte)' },
  23: { titel: 'Listen', text: ['Eine Liste speichert mehrere Werte unter einem Namen. Jeder Platz hat einen Index – gezählt wird ab 0.', 'len(liste) gibt die Anzahl der Werte an, liste.append(x) hängt x hinten an.', 'Summe und Maximum findet man mit einer Schleife über alle Plätze.'],
    code: 'beete = [3, 5, 2]\nprint(beete[0])   # 3\nbeete.append(4)\nprint(len(beete)) # 4' },
  6: { titel: 'Die bedingte Anweisung', text: ['Wenn die Bedingung wahr ist, werden die eingerückten Befehle ausgeführt – sonst nichts (einseitige Verzweigung).', 'Eine Bedingung ist eine Frage mit der Antwort wahr oder falsch, z. B. can_harvest().'],
    code: 'if can_harvest():\n    harvest()' },
  7: { titel: 'Die zweiseitige Verzweigung', text: ['Wenn die Bedingung wahr ist, mache das eine, ansonsten (else) das andere.', 'Es wird immer genau einer der beiden Teile ausgeführt.'],
    code: 'if can_harvest():\n    harvest()\nelse:\n    water()' },
  8: { titel: 'Die mehrfache Verzweigung', text: ['Mit elif (sonst wenn) prüft man mehrere Bedingungen nacheinander.', 'Der Computer nimmt den ersten Fall, dessen Bedingung zutrifft. Trifft keine zu, gilt else.'],
    code: 'if is_weed():\n    pull()\nelif can_harvest():\n    harvest()\nelse:\n    water()' },
  // Burg 9 – Datenbanken
  11: { titel: 'Datenbanken und Tabellen', text: ['Eine relationale Datenbank ist eine Sammlung von Tabellen. Die Spalten heißen Attribute, die Zeilen Datensätze.', 'Mit SQL fragt man Daten ab: SELECT gibt die Attribute an, FROM die Tabelle.', 'Datenschutz: Name, Adresse und Geburtstag sind personenbezogene Daten – speichere und zeige nur, was für den Zweck nötig ist (Datensparsamkeit).'],
    code: 'SELECT name, leben\nFROM monster' },
  12: { titel: 'Filtern mit WHERE', text: ['WHERE ist ein Filter: Es bleiben nur die Datensätze, für die die Bedingung stimmt.', 'Mit AND müssen beide Bedingungen stimmen, mit OR reicht eine. Texte stehen in Anführungszeichen.', 'LIKE sucht nach einem Muster, % ist ein Platzhalter.'],
    code: "SELECT name\nFROM monster\nWHERE art = 'ratte' AND leben > 4" },
  13: { titel: 'Sortieren', text: ['ORDER BY sortiert nach einem Attribut: ASC aufsteigend (Standard), DESC absteigend.', 'LIMIT zeigt nur die ersten Datensätze, DISTINCT lässt doppelte weg.'],
    code: 'SELECT name, tempo\nFROM monster\nORDER BY tempo DESC\nLIMIT 3' },
  14: { titel: 'Aggregatfunktionen', text: ['Aggregatfunktionen fassen viele Datenwerte zu einem Wert zusammen.', 'COUNT zählt, SUM addiert, AVG bildet den Durchschnitt, MIN und MAX finden den kleinsten und größten Wert.'],
    code: "SELECT COUNT(*)\nFROM monster\nWHERE art = 'ork'" },
  16: { titel: 'Daten ändern', text: ['INSERT INTO fügt einen Datensatz ein, UPDATE … SET ändert und DELETE FROM löscht Datensätze.', 'WHERE legt fest, welche Datensätze betroffen sind – ohne WHERE trifft es alle!'],
    code: "UPDATE bauern\nSET jahre = jahre + 1\nWHERE name = 'Anna'" },
  15: { titel: 'Gruppen und Verbund (Vertiefung)', text: ['GROUP BY bildet Gruppen, Aggregatfunktionen rechnen dann je Gruppe.', 'Ein Fremdschlüssel verweist auf den Primärschlüssel einer anderen Tabelle.', 'Mit JOIN … ON werden so Datensätze aus zwei Tabellen verknüpft.'],
    code: 'SELECT bauern.name, ernte.menge\nFROM ernte\nJOIN bauern ON ernte.bauer_id = bauern.id' },
  // Burg 9 – Künstliche Intelligenz
  17: { titel: 'Maschinelles Lernen: der Entscheidungsbaum', text: ['Beim maschinellen Lernen wird aus Daten ein Modell erstellt und trainiert.', 'Ein Entscheidungsbaum erkennt in beschrifteten Daten Zusammenhänge und teilt sie in Gruppen auf (z. B. frech und friedlich).', 'Er stellt Fragen und folgt je nach Antwort einem Zweig – von der Wurzel bis zu einem Blatt.'] },
  18: { titel: 'Trainingsdaten und Testdaten', text: ['Mit Trainingsdaten wird das Modell erstellt, mit Testdaten, die es nie gesehen hat, wird es geprüft.', 'Overfitting (Überanpassung): Das Modell lernt die Trainingsdaten zu genau und erkennt neue Daten schlecht.', 'Ein Modell passt nie zu 100 % – wichtig ist, dass es auch Neues gut erkennt.'] },
  19: { titel: 'Verzerrung durch einseitige Daten', text: ['Eine KI lernt nur, was in ihren Daten steckt.', 'Ist die Datenbasis einseitig, lernt sie falsche Regeln. Das kann Menschen benachteiligen, z. B. bei einem Bewerbungsfilter.'] },
  20: { titel: 'Verstärkendes Lernen', text: ['Beim verstärkenden Lernen (Reinforcement Learning) lernt eine KI durch Belohnung und Bestrafung.', 'Gewinnt der Roboter, kommt eine Perle für seinen Zug dazu. Verliert er, wird sie entfernt.', 'Ein Expertensystem folgt dagegen festen Regeln und lernt nicht dazu.'] },
  21: { titel: 'Sprachmodelle', text: ['Ein Sprachmodell berechnet das wahrscheinlichste nächste Wort.', 'Die Temperatur bringt Zufall dazu: Die Texte werden abwechslungsreicher.', 'Sprachmodelle wirken echt, ohne den Inhalt zu verstehen – sie können auch Falsches erfinden.'] },
  // LK Sortieren & Komplexität (Burg 21)
  30: { titel: 'Sortieren wie ein Computer', text: ['Ein Computer vergleicht immer nur zwei Werte und vertauscht sie bei Bedarf – zum Tauschen braucht man einen Zwischenspeicher temp.', 'Der Aufwand eines Sortierverfahrens wird in Vergleichen (V) und Schreibzugriffen (Z) gezählt.', 'Vergleicht man jedes Paar einmal, sind das n·(n−1)/2 Vergleiche.'],
    code: 'if a[0] > a[1]:\n    temp = a[0]\n    a[0] = a[1]\n    a[1] = temp' },
  31: { titel: 'Bubblesort', text: ['Bubblesort vergleicht benachbarte Elemente und vertauscht sie, wenn sie falsch herum stehen. Nach jedem Durchlauf steht das größte Element hinten.', 'Mit dem Abbruch (getauscht) endet er, sobald ein Durchlauf ohne Tausch bleibt: best case O(n), sonst O(n²).', 'Die Zahl der Vertauschungen ist die Zahl der Fehlstellungen. Mit > statt >= bleibt er stabil.'],
    code: 'for i in range(n - 1):\n    for j in range(n - 1 - i):\n        if a[j] > a[j + 1]:\n            temp = a[j]\n            a[j] = a[j + 1]\n            a[j + 1] = temp' },
  32: { titel: 'Selectionsort und Insertionsort', text: ['Selectionsort sucht im unsortierten Teil das Minimum (min_pos) und tauscht es nach vorn: immer n·(n−1)/2 Vergleiche, höchstens n − 1 Tausche.', 'Insertionsort fügt jedes Element in den sortierten Teil ein und verschiebt dabei größere nach rechts: best case O(n), worst case O(n²).', 'Stabil heißt: Gleich große Elemente behalten ihre Reihenfolge. Insertionsort (und Bubblesort) sind stabil, Selectionsort ist es nicht – der weite Tausch kann Gleiche überholen lassen.'],
    code: 'temp = a[i]\nj = i - 1\nwhile j >= 0 and a[j] > temp:\n    a[j + 1] = a[j]\n    j = j - 1\na[j + 1] = temp' },
  34: { titel: 'Rekursion und Divide & Conquer', text: ['Eine rekursive Funktion ruft sich selbst mit einer kleineren Aufgabe auf (Rekursionsschritt); der Basisfall beendet die Rekursion. Die offenen Aufrufe liegen auf dem Aufrufstapel.', 'Teile und herrsche: Problem teilen, Teile rekursiv lösen, Teillösungen zusammenfügen.', 'Die binäre Suche halbiert eine sortierte Liste in jedem Schritt: O(log n).'],
    code: 'def gewicht(a, i):\n    if i == len(a):\n        return 0\n    return a[i] + gewicht(a, i + 1)' },
  // LK KI (Burg 22)
  40: { titel: 'Arten der Künstlichen Intelligenz', text: ['Wissensbasierte KI folgt Regeln, die Menschen festlegen. Beim maschinellen Lernen entsteht das Modell aus Daten.', 'Überwacht: Beispiele mit Label (Klassifikation, Regression). Unüberwacht: Daten ohne Label, das System findet Gruppen (Clustering). Bestärkend: ein Agent lernt durch Belohnung und Bestrafung.', 'Merkmale beschreiben ein Beispiel, Parameter lernt das Modell, Hyperparameter legt man fest.'] },
  41: { titel: 'Entscheidungsbaum', text: ['An die Wurzel kommt das Merkmal mit der kleinsten gewichteten Gini-Unreinheit (Gini = 1 − Σ p²) – mit gini() und beste_frage() lernt der Rechner den Baum selbst.', 'Genauigkeit = richtig / alle; Konfusionsmatrix: TP, FP, FN, TN.', 'Overfitting: Training sehr gut, Validierung/Test deutlich schlechter – die Baumtiefe wählt man mit den Validierungsdaten.'],
    code: 'def baum(m):\n    if m["rot"]:\n        return "frech"\n    return "friedlich"' },
  42: { titel: 'k-NN und lineare Regression', text: ['k-NN: die k nächsten Nachbarn (euklidischer Abstand) bestimmen per Mehrheit das Label.', 'Lineare Regression: die Gerade y = m·x + b mit der kleinsten Summe der quadrierten Fehler (SSE).'],
    code: 'def abstand(p, q):\n    return ((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2) ** 0.5' },
  43: { titel: 'k-Means (unüberwacht)', text: ['k Startzentren → jeden Punkt dem nächsten Zentrum zuordnen → Zentren in die Mitte ihrer Punkte → wiederholen, bis sich nichts ändert.', 'Die SSE misst, wie eng die Gruppen sind. k wählt man mit der Ellbogenmethode; schlechte Startzentren können zu schlechten Gruppen führen.'],
    code: 'zuordnung = zuordnen(punkte, zentren)\nzentren = neue_zentren(punkte, zuordnung, k)' },
  44: { titel: 'Bestärkendes Lernen', text: ['Ein Agent wählt in jedem Zustand eine Aktion und erhält eine Belohnung; er maximiert die Summe der Belohnungen.', 'Q-Lernen: Q ← Q + α·(r + γ·max Q(neuer Zustand) − Q).', 'Erkunden (ε) gegen Ausnutzen: Wer nie Neues probiert, findet bessere Wege nicht.'],
    code: 'q[s][a] = alt + ALPHA * (r + GAMMA * max(q[s2]) - alt)' },
  45: { titel: 'Neuronen und Verantwortung', text: ['Ein Perzeptron gewichtet Eingaben und vergleicht die Summe mit einer Schwelle; es lernt mit w ← w + η·(soll − ist)·x – aber nur, wenn eine Gerade die Klassen trennt (XOR braucht mehrere Schichten).', 'Precision = TP/(TP+FP), Recall = TP/(TP+FN) – welcher Fehler schlimmer ist, hängt von der Anwendung ab.', 'Bias kommt aus den Daten, auch über Proxy-Merkmale; der EU AI Act ordnet KI nach Risiko.'] },
  // LK OOP (Burg 23)
  50: { titel: 'Klassen und Objekte', text: ['Eine Klasse ist ein Bauplan mit Attributen (Eigenschaften) und Methoden (Fähigkeiten); ein Objekt ist ein Exemplar mit eigenen Attributwerten.', 'Der Konstruktor __init__ setzt die Startwerte; self ist das Objekt selbst. Eine Zuweisung b = a kopiert kein Objekt, beide Namen verweisen auf dasselbe.'],
    code: 'class Monster:\n    def __init__(self, name, leben):\n        self.name = name\n        self.leben = leben' },
  51: { titel: 'Kapselung', text: ['Private Attribute (Python: __name, UML: −) sind von außen nicht erreichbar; Zugriff nur über Methoden (Getter/Setter, UML: +).', 'Setter prüfen, ob ein neuer Wert gültig ist. Typangaben (-> int) sind Hinweise für Menschen und Werkzeuge.'],
    code: 'def set_stufe(self, stufe: int) -> bool:\n    if 1 <= stufe <= 6:\n        self.__stufe = stufe\n        return True\n    return False' },
  52: { titel: 'Beziehungen zwischen Klassen', text: ['Assoziation: Ein Objekt kennt ein anderes. Aggregation (◇): Das Ganze hat Teile, die auch allein existieren. Komposition (◆): Die Teile entstehen und vergehen mit dem Ganzen.', 'Multiplizitäten (1, 0..1, 0..*) geben an, wie viele Objekte beteiligt sind; 0..* wird oft als Liste umgesetzt.'] },
  53: { titel: 'Vererbung und Polymorphie', text: ['Eine Unterklasse erbt Attribute und Methoden der Oberklasse („ist ein“), kann neue hinzufügen und Methoden überschreiben; super() ruft die Oberklasse auf.', 'Polymorphie: Derselbe Methodenaufruf führt je nach Klasse des Objekts verschiedenen Code aus.'],
    code: 'class Eisturm(Turm):\n    def schiesse(self, monster):\n        super().schiesse(monster)\n        monster.tempo = monster.tempo / 2' },
  54: { titel: 'Datenstrukturen als Klassen', text: ['Stapel (Stack, LIFO): push legt oben auf, pop nimmt oben weg – z. B. Klammerprüfung, Aufrufstapel.', 'Schlange (Queue, FIFO): hinten anstellen, vorne heraus. Verkettete Liste: Jeder Knoten kennt seinen Wert und den nächsten Knoten.'] },
  // Burg 28 (LK Technik)
  100: { titel: 'Zahlen im Rechner', text: ['Binär: Stellenwerte 1, 2, 4, 8 …; dezimal → binär durch fortlaufendes Teilen durch 2 (Reste von unten lesen). Hexadezimal fasst 4 Bit zu einer Ziffer 0–F zusammen.', 'Zweierkomplement mit n Bit: höchstes Bit hat den Wert −2ⁿ⁻¹; −x = alle Bits von x umdrehen und 1 addieren. Festkomma: Nachkommastellen durch fortlaufendes Verdoppeln.'],
    code: '−3 mit 4 Bit: 0011 → 1100 → 1101' },
  101: { titel: 'Zeichen kodieren', text: ['ASCII: 128 Zeichen mit 7 bzw. 8 Bit (A = 65, a = 97). Unicode nummeriert alle Zeichen; UTF-8 speichert sie in 1 bis 4 Byte (ASCII-Zeichen in 1 Byte).'] },
  102: { titel: 'Boolesche Algebra', text: ['UND (∧), ODER (∨), NICHT (¬), XOR (⊕), Implikation (→). De Morgan: ¬(A ∧ B) = ¬A ∨ ¬B. KDNF = ODER aller Minterme (Zeilen mit 1), KKNF = UND aller Maxterme (Zeilen mit 0).'] },
  103: { titel: 'Schaltnetze und Addierer', text: ['Gatter: & (UND), ≥1 (ODER), =1 (XOR), 1 mit Kreis (NICHT). Vereinfachen mit Gesetzen oder KV-Diagramm (benachbarte Einsen zu Blöcken zusammenfassen).', 'Halbaddierer: S = A ⊕ B, C = A ∧ B. Volladdierer: zwei Halbaddierer und ein ODER für den Übertrag; hintereinander geschaltet addieren sie ganze Binärzahlen (Ripple-Carry).'],
    code: 's1, c1 = halbaddierer(a, b)\ns, c2 = halbaddierer(s1, cin)\ncout = c1 | c2' },
  104: { titel: 'Der Rechner', text: ['Von-Neumann-Architektur: Rechenwerk, Steuerwerk, Speicherwerk (Programm und Daten gemeinsam), Ein-/Ausgabewerk, Bussystem.', 'Von-Neumann-Zyklus: Befehl holen (Fetch, Befehlszähler + 1), entschlüsseln (Decode), ausführen (Execute), Ergebnis zurückschreiben (Writeback).', 'Laufzeit = Befehle · Takte pro Befehl / Taktfrequenz.'] },
  // Burg 27 (LK Automaten)
  90: { titel: 'Formale Sprachen', text: ['Alphabet Σ: endliche Menge von Zeichen. Wort: endliche Zeichenfolge, ε das leere Wort. Σ*: alle Wörter. Eine formale Sprache ist eine Teilmenge von Σ*.'] },
  91: { titel: 'Grammatiken und BNF', text: ['Grammatik G = (N, T, P, S): Ableitung durch Ersetzen von Nichtterminalen, L(G) = alle ableitbaren Wörter aus Terminalen. BNF: <…> Nichtterminal, ::= definiert, | oder.', 'Chomsky: Typ 3 regulär (endlicher Automat), Typ 2 kontextfrei (Kellerautomat, Programmiersprachen), Typ 1 kontextsensitiv, Typ 0 allgemein (Turingmaschine).'],
    code: 'S → aS | b\nS ⇒ aS ⇒ aaS ⇒ aab' },
  92: { titel: 'Endliche Automaten', text: ['DEA (Q, Σ, δ, q₀, F): zu jedem Zustand und Zeichen genau ein Folgezustand; akzeptiert, wenn er nach dem letzten Zeichen in einem Endzustand ist. Ein Fangzustand nimmt alle Wörter auf, die nicht mehr gültig werden können.', 'Reguläre Ausdrücke: Verkettung, Auswahl (|), Wiederholung (*). Zu jedem gibt es einen endlichen Automaten.'],
    code: 'zustand = start\nfor zeichen in wort:\n    zustand = delta[zustand][zeichen]\nreturn zustand in ende' },
  93: { titel: 'NEA und Potenzmengen', text: ['Ein NEA kann bei einem Zeichen mehrere (oder keine) Folgezustände haben; er akzeptiert, wenn es mindestens einen Weg in einen Endzustand gibt. Potenzmengenkonstruktion: DEA-Zustände sind Mengen von NEA-Zuständen (höchstens 2ⁿ), Endzustand ist jede Menge mit einem NEA-Endzustand.'] },
  94: { titel: 'Grenzen der Automaten', text: ['Endliche Automaten können nicht unbeschränkt zählen: { aⁿbⁿ }, Klammerausdrücke und Palindrome sind nicht regulär. Ein Kellerautomat (mit Stapel) erkennt kontextfreie Sprachen.', 'Pumping-Lemma: Ist L regulär, lässt sich jedes lange Wort z = uvw mit |uv| ≤ n, |v| ≥ 1 aufpumpen. Fällt ein u vⁱ w aus L heraus, ist L nicht regulär.'] },
  95: { titel: 'Compiler', text: ['Phasen: lexikalische Analyse (Scanner, endliche Automaten → Tokens), Syntaxanalyse (Parser, kontextfreie Grammatik → Syntaxbaum), semantische Analyse, Codeerzeugung.', 'Ein Compiler übersetzt vorher das ganze Programm, ein Interpreter Anweisung für Anweisung. Die Symboltabelle merkt sich alle Namen und findet nicht festgelegte.'] },
  // Burg 26 (LK Sicherheit)
  80: { titel: 'Schutzziele und Caesar', text: ['Schutzziele: Vertraulichkeit, Integrität, Verfügbarkeit (CIA), dazu Authentizität und Verbindlichkeit. Kerckhoffs: Die Sicherheit darf nur vom geheimen Schlüssel abhängen, nicht vom geheimen Verfahren.', 'Caesar verschiebt jeden Buchstaben um denselben Abstand: (Position + abstand) % 26. Mit nur 25 Schlüsseln knackt man es durch Ausprobieren (Brute Force).'],
    code: "neuer_ascii = (ord(buchstabe) - ord('a') + abstand) % 26 + ord('a')" },
  81: { titel: 'Häufigkeitsanalyse', text: ['Monoalphabetische Verfahren ersetzen jeden Buchstaben immer gleich – die Buchstabenhäufigkeiten der Sprache bleiben erhalten (im Deutschen e am häufigsten) und verraten den Schlüssel, auch bei 26! möglichen Schlüsseln.', 'Multiplikative Chiffre: Index · schluessel mod 26 – nur Schlüssel teilerfremd zu 26 sind umkehrbar.'] },
  82: { titel: 'Vigenère und One-Time-Pad', text: ['Vigenère verschiebt reihum mit den Buchstaben eines Schlüsselworts (polyalphabetisch). Der Kasiski-Test findet über die Abstände wiederholter Folgen die Schlüssellänge; danach ist jede Gruppe ein Caesar.', 'One-Time-Pad: zufälliger, gleich langer, geheimer, nur einmal benutzter Schlüssel – beweisbar sicher, aber der Schlüsselaustausch ist aufwendig.'] },
  83: { titel: 'Moderne Blockchiffren', text: ['AES verschlüsselt Bitblöcke in Runden aus Substitution (S-Box, Konfusion), Permutation (Diffusion) und XOR mit dem Rundenschlüssel. Symmetrisch: derselbe Schlüssel für beide Richtungen – Problem ist der sichere Schlüsselaustausch.'] },
  84: { titel: 'Öffentliche Schlüssel', text: ['Diffie-Hellman: Aus öffentlich g, p und geheimen a, b entsteht g^(ab) mod p, ohne übertragen zu werden (Schwachstelle Man-in-the-Middle). RSA: n = p · q, φ = (p − 1)(q − 1), e · d mod φ = 1; c = m^e mod n, m = c^d mod n.', 'Der erweiterte euklidische Algorithmus liefert x, y mit a·x + b·y = ggT(a, b) – so berechnet man d.', 'Hybride Verfahren (TLS): asymmetrisch einen Sitzungsschlüssel austauschen, dann schnell symmetrisch verschlüsseln.'],
    code: 'n = p * q\nphi = (p - 1) * (q - 1)\nd = modulares_inverses(e, phi)\nc = pow(m, e, n)' },
  85: { titel: 'Hash, Signatur, Anmeldung', text: ['Hashfunktionen erzeugen einen Fingerabdruck fester Länge: Einweg, Lawineneffekt, kollisionsresistent. Passwörter speichert man als Hash mit Salt.', 'Digitale Signatur: Hash mit dem privaten Schlüssel signieren, mit dem öffentlichen prüfen – Authentizität, Integrität, Verbindlichkeit. Zwei-Faktor-Anmeldung kombiniert z. B. Wissen und Besitz.'] },
  // Burg 25 (LK Daten)
  70: { titel: 'JOIN und GROUP BY', text: ['INNER JOIN verbindet zwei Tabellen über Fremdschlüssel = Primärschlüssel und behält nur Zeilen mit Partner; LEFT JOIN behält alle Zeilen der linken Tabelle (fehlende Partner: NULL).', 'GROUP BY bildet Gruppen, Aggregatfunktionen (COUNT, SUM, AVG, MIN, MAX) rechnen je Gruppe. WHERE filtert Zeilen vor dem Gruppieren, HAVING Gruppen danach.'],
    code: 'SELECT haendler.name, SUM(verkauf.menge * ware.preis) AS umsatz\nFROM verkauf\nJOIN haendler ON verkauf.haendler_id = haendler.id\nJOIN ware ON verkauf.ware_id = ware.id\nGROUP BY haendler.name' },
  71: { titel: 'Subselects', text: ['Ein Subselect ist eine Abfrage in Klammern in einer anderen Abfrage; man liest von innen nach außen. Liefert sie einen Wert, vergleicht man mit = oder >, liefert sie eine Liste, mit IN bzw. NOT IN.'],
    code: 'SELECT name FROM haendler\nWHERE id NOT IN (SELECT haendler_id FROM verkauf)' },
  72: { titel: 'Daten anlegen und ändern', text: ['CRUD: INSERT INTO … VALUES, SELECT, UPDATE … SET … WHERE, DELETE FROM … WHERE. Ohne WHERE treffen UPDATE und DELETE alle Zeilen.', 'CREATE TABLE legt eine Tabelle mit Spalten, Datentypen, PRIMARY KEY und Fremdschlüsseln (REFERENCES) an.'],
    code: 'CREATE TABLE lager (id INTEGER PRIMARY KEY,\n    ware_id INTEGER REFERENCES ware(id), menge INTEGER);\nUPDATE ware SET preis = preis * 1.1 WHERE name = \'Honig\'' },
  73: { titel: 'Modellieren und Normalisieren', text: ['ER-Modell: Entitätstypen, Attribute, Beziehungen mit Kardinalitäten (1:1, 1:n, n:m). Im Relationenmodell wird 1:n zum Fremdschlüssel auf der n-Seite, n:m zu einer eigenen Relation; Primärschlüssel unterstrichen, Fremdschlüssel ↑.', '1NF: atomare Werte. 2NF: keine Abhängigkeit von nur einem Teil des Schlüssels. 3NF: keine transitive Abhängigkeit. Sonst drohen Einfüge-, Änderungs- und Löschanomalien.'] },
  74: { titel: 'CSV und JSON mit Python', text: ['csv.DictReader(datei, delimiter=";") liefert jede Zeile als Dictionary; alle Werte sind Texte und müssen mit int() oder float() umgewandelt werden. Grundmuster: umwandeln, Extremwert suchen, filtern, zusammenfassen; vorher fehlende Werte bereinigen.', 'csv.writer schreibt Zeilen, json.load/json.dump lesen und schreiben verschachtelte Daten (Dictionaries und Listen).'],
    code: "with open(pfad, newline='', encoding='utf-8-sig') as datei:\n    for zeile in csv.DictReader(datei, delimiter=';'):\n        zeit = int(zeile['Zeit'])" },
  75: { titel: 'NoSQL und Datenlebenszyklus', text: ['NoSQL-Datenbanken (Key-Value, Dokumente, Graphen) haben kein festes Schema und lassen sich gut verteilen. CAP: Bei einer Netzstörung muss ein verteiltes System zwischen Konsistenz und Verfügbarkeit wählen.', 'Datenlebenszyklus: erheben, speichern, verarbeiten, nutzen, archivieren, löschen – bei personenbezogenen Daten mit Datensparsamkeit und Zweckbindung (DSGVO).'] },
  // Burg 24 (LK Datenstrukturen)
  60: { titel: 'Listen, Stapel, Schlange', text: ['Array: Zugriff über den Index in O(1), Einfügen vorn O(n). Verkettete Liste aus Knoten (data, next): vorn einfügen O(1), Zugriff auf das k-te Element O(n).', 'Stapel (LIFO): push/pop/peek oben, braucht nur einen Verweis auf den obersten Knoten. Schlange (FIFO): enqueue hinten, dequeue vorn – mit __head und __tail beides in O(1).'],
    code: 'def insert_at_start(self, data):\n    new_node = Node(data)\n    new_node.next = self.head\n    self.head = new_node' },
  61: { titel: 'Bäume', text: ['Ein Baum hat eine Wurzel, jeder andere Knoten genau einen Elternknoten; Knoten ohne Kinder heißen Blätter. Im binären Suchbaum steht links nur Kleineres, rechts nur Größeres – Suchen in O(log n), entartet O(n).', 'Traversierung: Preorder (Knoten, links, rechts), Inorder (links, Knoten, rechts – im Suchbaum sortiert), Postorder (links, rechts, Knoten).'],
    code: 'def inorder(node):\n    if node is None:\n        return []\n    return inorder(node.left) + [node.value] + inorder(node.right)' },
  62: { titel: 'Graphen', text: ['Ein Graph besteht aus Knoten und Kanten (gerichtet/ungerichtet, gewichtet/ungewichtet), gespeichert als Adjazenzmatrix oder Adjazenzliste. Ein Baum ist ein zusammenhängender Graph ohne Zyklen.', 'Breitensuche (Schlange) geht Ebene für Ebene und findet Wege mit den wenigsten Kanten; Tiefensuche (Stapel bzw. Rekursion) geht erst in die Tiefe.'],
    code: 'while not queue.is_empty():\n    vertex = queue.dequeue()\n    for adjacent in graph[vertex]:\n        if adjacent not in visited:\n            visited.append(adjacent)\n            queue.enqueue(adjacent)' },
  63: { titel: 'Kürzeste Wege', text: ['Dijkstra: immer den noch nicht fertigen Knoten mit der kleinsten Entfernung festlegen und seine Kanten relaxieren (dist[u] + w < dist[v]). Nur für Gewichte ≥ 0; über die Vorgänger wird der Weg rückwärts gefunden.', 'Moore-Bellman-Ford relaxiert (n − 1)-mal alle Kanten, O(Knoten · Kanten), und verträgt negative Gewichte ohne negativen Zyklus. Bei gleichen Gewichten genügt die Breitensuche.'],
    code: 'if v not in fertig and dist[u] + w < dist[v]:\n    dist[v] = dist[u] + w\n    vorgaenger[v] = u' },
  64: { titel: 'Backtracking und Grenzen', text: ['Backtracking: Kandidat wählen, prüfen, setzen, rekursiv weiter – in der Sackgasse zurücknehmen (N-Damen, Kartenfärbung, Sudoku). Im schlimmsten Fall exponentielle Laufzeit.', 'Technische Grenzen: exponentiell wachsender Aufwand. Theoretische Grenzen: Das Halteproblem ist unentscheidbar. Churchsche These: Was berechenbar ist, berechnet eine Turingmaschine.'],
    code: 'faerbung[land] = farbe\nif faerbe(laender, i + 1, farben, faerbung):\n    return True\ndel faerbung[land]   # Rücknahme' },
  35: { titel: 'Mergesort und Quicksort', text: ['Mergesort teilt, sortiert beide Hälften rekursiv und mischt sie (merge): immer O(n log n), O(n) Zusatzspeicher, stabil.', 'Quicksort partitioniert um ein Pivot und sortiert die Teile rekursiv: im Mittel O(n log n), bei ungünstigem Pivot (sortierte Liste) O(n²).'],
    code: 'def mergesort(a):\n    if len(a) <= 1:\n        return a\n    mitte = len(a) // 2\n    return merge(mergesort(a[:mitte]), mergesort(a[mitte:]))' },
  33: { titel: 'Zeitkomplexität und O-Notation', text: ['Die O-Notation gibt eine obere Schranke für das Wachstum des Aufwands an; Konstanten fallen weg.', 'Verdopplungsexperiment: wächst der Aufwand ×2 → O(n), ×4 → O(n²), um einen festen Betrag → O(log n).', 'O(1) ⊂ O(log n) ⊂ O(n) ⊂ O(n log n) ⊂ O(n²) ⊂ O(2ⁿ) ⊂ O(n!)'] },
};

// Ein Kapitel kommt ins Heft, sobald darin eine Aufgabe gelöst ist
const heftKapitel = () => burgKapitel().filter((k) => kapitelHoefe(k).some((h) => P.hoefe[h.id]?.fertig));
// 1–2 Beispiele je Kapitel: die erste gelöste Aufgabe und die letzte gelöste Hauptaufgabe (keine Vorhersagen, wenn es andere gibt)
function heftBeispiele(k) {
  const geloest = kapitelHoefe(k).filter((h) => P.hoefe[h.id]?.fertig);
  // Späherturm: nur Aufträge, zu denen es etwas zu zeigen gibt (gespeicherter Baum, Partien …)
  const echt = geloest.filter((h) => !h.vorhersage && !h.lesen && !h.fragen && h.ki !== 'frage' && (h.art !== 'ki' || heftKi(h)));
  const pool = echt.length ? echt : geloest, haupt = pool.filter((h) => !h.knobel);
  const a = (haupt[0] || pool[0]), b = haupt.at(-1);
  return b && b !== a ? [a, b] : [a];
}

// 🌾 Acker als Bild (Startlage), gemalt mit FELD.draw in einen unsichtbaren Kasten
function heftAcker(h) {
  const box = document.createElement('div');
  box.style.cssText = 'position:absolute;left:-9999px;top:0;width:340px';
  const cv = document.createElement('canvas');
  box.appendChild(cv); document.body.appendChild(box);
  const letzt = FELD.letzt, fx = FELD_FX;   // das Heft-Bild soll Acker und Effekte des Tages nicht übernehmen
  FELD_FX = [];
  try { FELD.draw(cv, FELD.start(h.start, h)); return `<img class="hbild" src="${cv.toDataURL()}" alt="Acker">`; } catch (e) { return ''; } finally { box.remove(); FELD.letzt = letzt; FELD_FX = fx; }
}
const heftCode = (h) => {
  // zuerst der Code, mit dem der Hof gelöst wurde; ältere Stände kennen nur den letzten Versuch
  const eigen = (P.hoefe[h.id]?.geloest ?? P.code[h.id] ?? '').trim();
  return eigen && !eigen.startsWith('# Schreib') ? eigen : (h.code || h.loesung || '').trim();
};
const heftTabelle = (cols, rows) => `<table class="htab"><tr>${cols.map((c) => `<th>${esc(String(c))}</th>`).join('')}</tr>
  ${rows.slice(0, 6).map((z) => `<tr>${z.map((v) => `<td>${esc(String(sqlNorm(v)))}</td>`).join('')}</tr>`).join('')}
  ${rows.length > 6 ? `<tr><td colspan="${cols.length}">… ${rows.length - 6} weitere</td></tr>` : ''}</table>`;

// Ein Beispiel: Aufgabe (Titel, Ziel) und was man selbst gemacht hat
function heftBeispiel(h) {
  const kopf = `<div class="hbtitel">${h.ico} ${esc(h.titel)}${P.hoefe[h.id]?.kurz ? ' ⭐' : ''}${P.hoefe[h.id]?.sparsam ? '⭐' : ''}</div><div class="hziel">${esc(h.ziel)}</div>`;
  if (h.art === 'sql') {
    const q = h.lesen ? h.code : heftCode(h);
    let erg = '';
    try { if (PY.sql) { const r = PY.sql(dbSetup(h, 'A'), q, h.pruef || h.lesen?.pruef || ''); if (!r.fehler) erg = heftTabelle(r.cols, r.rows); } } catch (e) { /* ohne Tabelle */ }
    return `<div class="hbsp">${kopf}<pre class="hcode">${esc(q)}</pre>${erg}</div>`;
  }
  if (h.art === 'ki') return `<div class="hbsp">${kopf}${heftKi(h)}</div>`;
  if (h.art === 'sort') return `<div class="hbsp">${kopf}<pre class="hcode">${esc(h.geheim ? '' : heftCode(h))}</pre></div>`;
  return `<div class="hbsp hzwei">${heftAcker(h)}<div>${kopf}<pre class="hcode">${esc(heftCode(h))}</pre></div></div>`;
}

// 🔭 Späherturm: gespeicherte Ergebnisse (kiEnde → P.kiHeft[id])
function heftKi(h) {
  const d = P.kiHeft?.[h.id] || {};
  const karten = h.regel ? kiKarten(h.train, h.regel, h.rauschen) : [];
  if (h.ki === 'baum' && d.baum) return `<div class="hki kbaum">${kiBaumHtml(d.baum, karten, '', false)}</div><p class="hnotiz">Mein Baum: ${kiTreffer(d.baum, karten)} von ${karten.length} Trainingsmonstern richtig.</p>`;
  if (h.ki === 'vergleich') {
    const test = kiKarten(h.test, h.regel);
    return `<p class="hnotiz">${h.baeume.map((b, i) => `Späher ${'AB'[i]}: Training ${kiTreffer(b, karten)}/${karten.length}, Test ${kiTreffer(b, test)}/${test.length}`).join(' · ')}<br>Besser bei neuen Monstern: Späher A – der kleinere Baum.</p>`;
  }
  if (h.ki === 'bias' && d.extra) {
    const alle = [...karten, ...kiKarten(d.extra, h.regel)];
    return `<p class="hnotiz">Vorher hatte der Späher aus einseitigen Daten eine falsche Regel gelernt. Diese Karten habe ich dazugegeben:</p><div class="hki kikarten">${kiKarten(d.extra, h.regel).map((k) => `<div class="kikarte">${kiMonster(k.code, k.frech)}</div>`).join('')}</div>
      <div class="hki kbaum">${kiBaumHtml(kiLerne(alle, 1), alle, '', false)}</div>`;
  }
  if (h.ki === 'schach' && d.ergebnisse) {
    const r = d.ergebnisse.filter((x) => x === 'roboter').length;
    return `<p class="hnotiz">Meine Partien: ${d.ergebnisse.map((x) => (x === 'mensch' ? '🧑' : '🤖')).join(' ')}<br>Der Roboter gewann ${r} von ${d.ergebnisse.length} – je später, desto öfter.</p>`;
  }
  if (h.ki === 'box') {
    const zuege = schachZuege(h.box.brett, 'roboter'), i = h.box.perlen.indexOf(Math.max(...h.box.perlen));
    return `<div class="hki">${schachBoxHtml({ brett: h.box.brett, perlen: h.box.perlen, i, zuege }, '🎲 Schachtel')}</div>`;
  }
  if (h.ki === 'maschine' && d.saetze) return `<p class="hnotiz">Das hat die Maschine für mich geschrieben:</p><ul class="hliste">${d.saetze.map((s) => `<li>${esc(s.text)} <i>(Temperatur ${s.temp})</i></li>`).join('')}</ul>`;
  if (h.frage) return `<p class="hnotiz"><b>${esc(h.frage.frage)}</b><br>✔ ${esc(h.frage.optionen[h.frage.richtig])}</p>`;
  return '';
}

function heftKapitelSeite(k, nr) {
  const m = HEFT_MERKE[k] || HEFT_EXTRA[k] || {}, K = KAPITEL[k];
  return `<section class="hseite hkap" id="h-k${k}"><h2>${nr} ${K.ico} ${esc(m.titel || K.name)}</h2>
    <div class="hmerke"><b>Merke</b>${(m.text || []).map((s) => `<p>${esc(s)}</p>`).join('')}${m.code ? `<pre class="hcode">${esc(m.code)}</pre>` : ''}</div>
    <div class="hbeispiele"><b>Aus meinem Spiel</b>${heftBeispiele(k).map(heftBeispiel).join('')}</div></section>`;
}

function heftHtml() {
  const B = BURGEN[BURGNR], kaps = burgKapitel(), drin = heftKapitel(), L = heftLevel();
  const zeile = (k) => {
    const hs = kapitelHoefe(k).filter((h) => !h.knobel), g = hs.filter((h) => P.hoefe[h.id]?.fertig).length;
    const sterne = kapitelHoefe(k).reduce((s, h) => s + (P.hoefe[h.id]?.kurz ? 1 : 0) + (P.hoefe[h.id]?.sparsam ? 1 : 0), 0);
    return `<tr class="${g ? '' : 'leer'}"><td>${kapNr(k)}</td><td>${KAPITEL[k].ico} ${esc(KAPITEL[k].name)}</td><td>${g}/${hs.length}${g === hs.length ? ' ✅' : ''}</td><td>${sterne ? `${sterne} ⭐` : ''}</td></tr>`;
  };
  const tuerme = Object.values(P.tuerme).map((t) => `${TUERME[t.art].ico} ${TUERME[t.art].name} (Stufe ${turmStufe(t)})`);
  const regeln = ERKL.filter((e) => e.basis || P.gesehen[e.key]);
  // 📑 Gliederung: 1 Stand · 2 Lerninhalte (2.1 …) · 3 Spielregeln (3.1 …) · 4 Meine Burg – antippen springt hin
  const eintrag = (id, nr, titel, tief = false) => `<li class="${tief ? 'tief' : ''}"><a data-ziel="${id}"><span class="hnr">${nr}</span> ${esc(titel)}</a></li>`;
  const gliederung = [eintrag('h-stand', '1', 'So weit bin ich'), eintrag('h-lernen', '2', 'Was ich gelernt habe'),
    ...drin.map((k, i) => eintrag(`h-k${k}`, `2.${i + 1}`, (HEFT_MERKE[k] || HEFT_EXTRA[k])?.titel || KAPITEL[k].name, true)),
    eintrag('h-regeln', '3', 'So funktioniert das Spiel'), ...regeln.map((e, i) => eintrag(`h-r${e.key}`, `3.${i + 1}`, e.titel.replace(/^\S+\s/, ''), true)),
    eintrag('h-burg', '4', 'Meine Burg'), ...(kerkerDa() ? [eintrag('h-kerker', '5', 'Mein Kerker und Fehlerheft')] : [])].join('');
  return `<div class="heft">
    <section class="hseite htitel"><svg viewBox="200 140 600 280" class="htitelbild">${svgBurg(500, 265, 0.95)}</svg>
      <h1>📓 Mein Informatik-Heft</h1><p class="hgross">${B.ico} ${B.name} · Klasse ${B.klasse}</p><p>Automate the Castle</p></section>
    <section class="hseite"><h2>Dieses Heft gehört</h2>
      <p class="hlinie">Name: <span>${esc(PROFIL.name || '')}</span></p><p class="hlinie">Klasse: <span></span></p>
      <h3>📑 Inhalt</h3><ol class="hinhalt">${gliederung}</ol></section>
    <section class="hseite" id="h-stand"><h2>1 So weit bin ich</h2><table class="htab hueber"><tr><th>Nr.</th><th>Kapitel</th><th>gelöst</th><th>Sterne</th></tr>${kaps.map(zeile).join('')}</table>
      ${abzLeiterDa('stern') ? `<p>⭐ Sterne <b>${sternePunkte()}</b>${abzAktuell('stern') ? ` · ${abzAktuell('stern').ico} ${esc(abzAktuell('stern').name)}` : ''}</p>` : ''}
      <p>🏆 Ruhm jetzt <b>${ruhm()}</b> · Rekord <b>${ruhmRekord()}</b>${abzAktuell('kampf') ? ` · ${abzAktuell('kampf').ico} ${esc(abzAktuell('kampf').name)}` : ''}</p></section>
    <section class="hseite hteil" id="h-lernen"><h2>2 Was ich gelernt habe</h2><p class="hinweis">Zu jedem Kapitel: das Wichtigste zum Merken und Aufgaben aus meinem Spiel.</p></section>
    ${drin.length ? drin.map((k, i) => heftKapitelSeite(k, `2.${i + 1}`)).join('') : '<section class="hseite"><p>Noch leer – löse die erste Aufgabe, dann wächst dein Heft von selbst.</p></section>'}
    <section class="hseite" id="h-regeln"><h2>3 So funktioniert das Spiel</h2>
      ${regeln.map((e, i) => `<div class="hregel" id="h-r${e.key}"><h3>3.${i + 1} ${esc(e.titel)}</h3><p>${esc(e.text)}</p></div>`).join('')}</section>
    <section class="hseite" id="h-burg"><h2>4 🏰 Meine Burg</h2>
      <p>🧙 Held: Level ${L} · ${Math.max(0, P.talente.length - 1)} Talente gelernt · ${sockelZahl()} Zauberplätze</p>
      <p>🪄 Zauber: ${steinBesitz().map((t) => `${STEINE[t].ico} ${STEINE[t].name}`).join(', ') || 'noch keine'}</p>
      <p>🗼 Türme: ${tuerme.length ? tuerme.join(', ') : 'noch keine'}</p>
      <p>🌙 Nacht ${P.nacht}${P.rekord ? ` · Rekord: Nacht ${P.rekord}` : ''} · Tag ${P.tag}</p>
      <p>👾 Monsterbuch: ${(P.monster || []).length} von ${Object.keys(GEGNER).length} Monstern gesehen</p>
      ${abzLeiterDa('stern') ? `<h3>⭐ Programmier-Abzeichen</h3><p>${sternePunkte()} Sterne aus den Aufgaben</p>${abzeichenHtml('stern')}` : ''}
      <h3>🏆 Kampf-Abzeichen</h3>
      <p>Ruhm jetzt: <b>${ruhm()}</b> · Mein Rekord: <b>${ruhmRekord()}</b></p>
      ${abzeichenHtml('kampf')}
      ${Object.keys(SCHAETZE).some(schatzHat) ? `<p>🎁 Meine Schätze: ${Object.keys(SCHAETZE).filter(schatzHat).map((id) => `${SCHAETZE[id].ico} ${esc(SCHAETZE[id].name)}`).join(', ')}</p>` : ''}</section>${kerkerHeftHtml()}</div>`;
}
const heftLevel = () => heldLevel().level;

// Heft öffnen (als breites Blatt); SQL wird vorher geladen, damit Beispiele ihr Ergebnis zeigen
async function heftZeigen() {
  if (BURGNR === 9 && heftKapitel().some((k) => kapitelHoefe(k)[0]?.art === 'sql')) await sqlBereit();
  // Spieltest: Schließen stand nur ganz unten (am Handy nach ~15 Bildschirmen) – jetzt oben eine feste Leiste und Escape
  const zu = () => { document.removeEventListener('keydown', esc_); karteZu(); };
  const esc_ = (e) => { if (e.key === 'Escape') zu(); };
  karte(`<div class="heftleiste"><button class="btn leise klein" id="heftDruck">🖨️ Drucken / PDF</button><button class="btn gold klein" id="heftZu">✕ Schließen</button></div>${heftHtml()}`,
    [{ label: '🖨️ Drucken / PDF', cls: 'leise', offen: true, fn: heftDrucken }, { label: 'Schließen', fn: () => document.removeEventListener('keydown', esc_) }]);
  $('#overlay .sheet').classList.add('breit');
  $('#heftDruck').onclick = heftDrucken;
  $('#heftZu').onclick = zu;
  document.addEventListener('keydown', esc_);
  for (const a of document.querySelectorAll('.hinhalt [data-ziel]')) a.onclick = () => document.getElementById(a.dataset.ziel)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
// Drucken in einem unsichtbaren Rahmen: nur das Heft, auf weißem Papier, jede Seite für sich
function heftDrucken() {
  const f = document.createElement('iframe');
  f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(f);
  const d = f.contentDocument;
  d.open();
  d.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Heft ${esc(BURGEN[BURGNR].name)}</title>
    <link rel="stylesheet" href="${new URL('vendor/fonts/fonts.css', location.href)}"><link rel="stylesheet" href="${new URL('style.css', location.href)}"></head><body class="heftdruck">${heftHtml()}</body></html>`);
  d.close();
  // Stylesheet abwarten (onload), höchstens 1,5 s
  let gedruckt = false;
  const los = () => { if (gedruckt) return; gedruckt = true; f.contentWindow.focus(); f.contentWindow.print(); setTimeout(() => f.remove(), 2000); };
  f.onload = los;
  setTimeout(los, 1500);
}

// --- 🎮 Erklärkarten: jede Spielregel erscheint beim ersten Mal als Karte (Nutzerwunsch) und steht danach im Heft
// unter „3 So funktioniert das Spiel“. key = P.gesehen-Schlüssel; basis = steht immer im Heft.
const ERKL = [
  { key: 'story', basis: true, titel: '📖 Die Burg im Nebel', text: 'Jede Nacht kommen Monster aus dem Nebel. Tagsüber programmierst du deine Hilfe auf dem Hof und verdienst Gold, abends baust du damit Türme.' },
  { key: 'willkommen', basis: true, titel: '🏰 Tag, Abend und Nacht', text: 'Tagsüber löst du Aufgaben und verdienst damit 🪙 Gold. Abends baust du mit dem Gold Türme. Nachts greifen Monster an – Türme und dein Held 🧙 verteidigen die Burg.' },
  { key: 'tag', basis: true, titel: '☀️ Der Tag', text: 'Ein gelöster Hof bringt 🪙, jeder ⭐ mehr. Pro Tag hast du einen Versuch.' },
  { key: 'bauen', titel: '🌇 Der Abend: Türme bauen', text: 'Wähle in der 🔨 Bauleiste einen Turm, tippe neben den Weg und dann auf „🔨 bauen“. In Kurven trifft er am meisten.' },
  { key: 'nacht', basis: true, titel: '🌙 Die Nacht', text: 'Zwei Wellen, am Ende ein 👑 Anführer. Kleine Monster am Tor kosten einmal Mauer; Anführer und Drachen bleiben dort und schlagen alle 3 s zu, bis du sie besiegst.' },
  { key: 'nachtgold', titel: '🪙 Kopfgeld in der Nacht', text: 'Jedes besiegte Monster bringt etwas 🪙. Das meiste Gold gibt es aber für Höfe am Tag.' },
  { key: 'steine', titel: '🪄 Zauber', text: 'Nur Zauber im Zauberplatz wirken. Einsetzen: oben ✨ Talente → Reiter 🪄 Zauber.' },
  { key: 'beute', titel: '👑 Beute vom Anführer', text: 'Der erste 👑 Anführer lässt sicher einen Zauber fallen, spätere manchmal. Du wählst nach der Nacht einen von zwei.' },
  { key: 'talente', titel: '✨ Das Talentnetz', text: 'Pro Level 1 Punkt. Der goldene Ring zeigt einen guten nächsten Knoten – zweimal antippen lernt ihn. Oder oben „🤖 Für mich verteilen“.' },
  { key: 'kombo', titel: '🔗 Kombos', text: 'Zwei Zauber verschiedener Richtungen im Zauberplatz wirken zusammen als Kombo. Nachlesen: ✨ Talente → 📖 Kombo-Buch.' },
  { key: 'stuetz', titel: '➕ Verstärker', text: 'Dieser Zauber hat jetzt einen ➕ Platz. Setz einen Verstärker ein: ✨ Talente → 🪄 Zauber → Zauber antippen.' },
  { key: 'stuetzkauf', titel: '🛒 Verstärker-Plätze kaufen', text: 'Mehr ➕ Plätze kaufen: ✨ Talente → 🪄 Zauber → Zauber antippen.' },
  { key: 'ruhm', titel: '🏆 Ruhm und ⭐ Sterne', text: 'Jede gehaltene Nacht bringt 🏆 Ruhm: Monster werden zäher, nach Nacht 10 kommen ⭐ Elite-Monster dazu – dafür gibt es mehr Gold. Was die Elite heute kann, steht im Späherbericht.' },
  { key: 'turmschild', titel: '🛡️ Monster mit Turmschild', text: 'Monster mit blauem Ring (🛡️) nehmen von Türmen weniger Schaden. Dein Held 🧙 und seine Zauber treffen voll.' },
  { key: 'flieger', titel: '🦇 Flieger', text: '🦇 Flieger fliegen quer übers Feld zum Tor. Stell einen 🏹 Pfeilturm nah ans Tor – Katapulte treffen sie nicht.' },
  { key: 'sternenring', titel: '🌌 Sternenring und 💎 Juwelen', text: '🌌 Sternenring: sehr starke Talente mit Nachteil, ganz außen im Netz. 💎 Juwelen setzt du in eine gelernte Fassung.' },
  { key: 'monster', titel: '👾 Das Monsterbuch', text: 'Alle Monster mit Tipp und Python-Klasse: ☰ → 👾 Monsterbuch.' },
  { key: 'kerker', titel: '🗝️ Der Kerker', text: 'Neu auf der Karte: die 🗝️ Kerkertür. Jeden Morgen ein Versuch – Fragen beantworten, falsch kostet ❤️.' },
  { key: 'roboter', titel: '🤖 Roboter', text: 'Tippe einen gelösten Hof an → „🤖 Roboter kaufen“. Er arbeitet jeden Morgen mit deinem Code – Gold gibt es nur, wenn der Code auf jeder Variante klappt.' },
];
// Karte zeigen, wenn noch nicht gesehen (fn läuft danach bzw. sofort); extra = Satz für genau diese Lage
function erklaere(key, extra = '', fn) {
  const e = ERKL.find((x) => x.key === key);
  // schon erklärt: nichts zeigen, der Aufrufer macht selbst weiter (fn hier NICHT rufen – sonst ruft sich z. B. beuteZeigen endlos selbst auf)
  // je Spieler nur einmal (Durchlauf: in jeder neuen Burg kamen alle Erklärkarten wieder) – im Heft steht sie trotzdem
  if (e && !P.gesehen[key] && PROFIL.gesehen?.[key]) { P.gesehen[key] = true; speichern(); }
  if (!e || P.gesehen[key]) return false;
  P.gesehen[key] = true;
  (PROFIL.gesehen ||= {})[key] = true;
  profilSpeichern();
  speichern();
  lernkarte({ titel: e.titel, text: e.text + extra }, fn);
  return true;
}
// Was ist gerade neu? Höchstens eine Karte auf einmal (morgens und abends geprüft)
const ERKL_WANN = [
  ['steine', () => P.phase === 'abend' && steinBesitz().length > 0],   // z. B. Zauber aus einem umgestellten alten Spielstand
  ['talente', () => P.xp > 0 && heldOffen() && P.talentVer >= 9 && P.phase === 'abend'],
  ['ruhm', () => P.phase === 'abend' && ruhm() > 0 && P.nacht >= 4],   // erst ab Nacht 4 (Nutzerwunsch 2026-11-15: am Anfang weniger Infos)
  ['turmschild', () => P.phase === 'abend' && P.nacht >= KAMPAGNE + 2],   // am Abend vor der ersten Nacht mit Schilden
  ['nachtgold', () => P.tag >= 2],
  ['kerker', () => P.phase === 'morgen' && kerkerOffen()],
  // Zauber-Karten nur abends, wo man sie gleich nutzen kann (Spieltest: morgens lag „Verstärker-Plätze kaufen“ über dem Auftrag)
  ['stuetz', () => P.phase === 'abend' && Object.values(P.stuetzSockel || {}).some((n) => n > 0)],
  ['stuetzkauf', () => P.phase === 'abend' && stuetzOffen() && steinBesitz().length > 0],
  ['flieger', () => P.phase === 'abend' && P.nacht >= 4],   // am Abend vor der ersten Nacht mit 🦇 (Nacht 4)
  ['sternenring', () => P.phase === 'abend' && typeof NETZ_GROSS !== 'undefined' && NETZ_GROSS && heldLevel().level >= 8],
];
function erklaerungenPruefen() {
  if (karteOffen()) return;
  for (const [key, wann] of ERKL_WANN) if (!P.gesehen[key] && wann() && erklaere(key)) return;
}
