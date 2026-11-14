'use strict';
// 🗝️ Kerker-Fragen Burg 24 (LK Datenstrukturen) – Quellen: OPAL „LK INF LB 2/3 – Datenstrukturen und Komplexität“
// (3.0.1 Einfügen, 3.1 Linked Lists, 3.2 Queue, 3.3 Stack, 3.4–3.6 Bäume/Traversierung, 3.7–3.9 Graphen/Dijkstra,
// 3.10 Backtracking, 2.2.10 Berechenbarkeit, „Kurz geprüft“), OPAL „LK INF Abiturvorbereitung“ 3.1 und 3.2,
// Lehrplan Sachsen LK Informatik LB 2/3 (Datenstrukturen, Komplexität, Grenzen der Berechenbarkeit).
// Höhe eines Baums wie im Kurs: Anzahl der Kanten (nur Wurzel = 0, leerer Baum = −1).
KERKER_FRAGEN.push(
  // ---------------------------------------------------------------------------------------------
  // Kapitel 60: Listen, Stapel, Schlange
  { id: 'k24_001', burg: 24, kap: 60, stufe: 1, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL LB 2/3 3.3 Stack; Abiturvorbereitung 3.1.1 a',
    gen: (z) => {
      const [a, b, c, d] = z.mische([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
      const r = [c, d, b];
      return { frage: `Ein Stapel ist leer. Nacheinander: push(${a}), push(${b}), push(${c}), pop(), push(${d}), pop(), pop(). Welche Werte liefern die drei pop()-Aufrufe? (Schreibweise: 1, 2, 3)`,
        antworten: [r.join(', '), r.join(',')],
        erkl: `LIFO: pop() nimmt immer das zuletzt aufgelegte Element. Zuerst ${c}, dann das neu aufgelegte ${d}, dann ${b}. Übrig bleibt nur ${a}.` };
    } },
  { id: 'k24_002', burg: 24, kap: 60, stufe: 1, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL LB 2/3 3.2 Queue; 3.8 Kurz geprüft 3',
    gen: (z) => {
      const [a, b, c] = z.mische(['Mia', 'Ole', 'Ida', 'Ben', 'Lea', 'Tom']).slice(0, 3);
      return { frage: `q = Queue() ist leer. Danach: q.enqueue("${a}"), q.enqueue("${b}"), q.dequeue(), q.enqueue("${c}"), q.dequeue(). Was liefert jetzt q.peek()?`,
        antworten: [c, `"${c}"`, `'${c}'`],
        erkl: `FIFO: ${a} wird zuerst entnommen, dann ${b}. Vorn steht danach nur noch ${c}. peek() schaut nach, ohne zu entfernen.` };
    } },
  { id: 'k24_003', burg: 24, kap: 60, stufe: 1, art: 'wahl', frage: 'Eine einfach verkettete Liste mit n Knoten kennt nur ihren ersten Knoten head. Welche Aussage ist richtig?',
    optionen: ['Einfügen am Anfang dauert O(1).', 'Der Zugriff auf das k-te Element dauert O(1).', 'Einfügen am Anfang dauert O(n), weil alle Knoten nach hinten rücken.', 'Löschen des ersten Knotens dauert O(n), weil alle Verweise geändert werden.'],
    erkl: 'Vorn einfügen setzt nur zwei Verweise um (neu.next = head, head = neu) – egal wie lang die Liste ist. An das k-te Element kommt man nur, indem man ab head durchläuft.', quelle: 'Abiturvorbereitung 3.1.1 b; OPAL 3.1 Schritt 5' },
  { id: 'k24_004', burg: 24, kap: 60, stufe: 2, art: 'zeile', frage: 'Diese Methode der Klasse LinkedList soll alle Werte ausgeben. Tippe die fehlerhafte Zeile an.',
    code: `def display(self):
    current = self.head
    while current.next is not None:
        print(current.data, end=" -> ")
        current = current.next
    print("None")`,
    fehler: [3], erkl: 'display muss jeden Knoten verarbeiten, auch den letzten – also while current is not None. So wird der letzte Wert nie ausgegeben, und bei leerer Liste gibt es einen AttributeError.', quelle: 'OPAL 3.1 Kurz geprüft 4; Aufgabe 3.1.1' },
  { id: 'k24_005', burg: 24, kap: 60, stufe: 2, art: 'zeile', frage: 'append soll hinten anhängen, bricht aber mit einem AttributeError ab. Tippe die fehlerhafte Zeile an.',
    code: `def append(self, data):
    neu = Node(data)
    if self.head is None:
        self.head = neu
        return
    current = self.head
    while current is not None:
        current = current.next
    current.next = neu`,
    fehler: [7], erkl: 'append muss auf dem letzten Knoten stehen bleiben: while current.next is not None. Mit „current is not None“ läuft current bis None, und None hat kein Attribut next.', quelle: 'OPAL 3.1 Schritt 3, Kurz geprüft 3 und 4' },
  { id: 'k24_006', burg: 24, kap: 60, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.1 Kurz geprüft 3',
    gen: (z) => {
      const n = z.int(3, 12);
      return { frage: `Eine verkettete Liste hat ${n} Knoten. Wie oft wird beim nächsten append die Zeile current = current.next ausgeführt?`,
        antworten: [String(n - 1)], erkl: `current startet beim 1. Knoten und muss bis zum ${n}. weiterlaufen: ${n - 1} Schritte.` };
    } },
  { id: 'k24_007', burg: 24, kap: 60, stufe: 2, art: 'reihe', frage: 'Bringe die Zeilen in die richtige Reihenfolge: Der Knoten mit dem Wert x (nicht der erste Knoten) wird aus der Liste gelöscht.',
    teile: ['current = self.head', 'while current.next.data != x:', 'current = current.next', 'current.next = current.next.next'],
    erkl: 'Zum Löschen braucht man den Vorgänger: current bleibt vor dem gesuchten Knoten stehen und überspringt ihn dann mit current.next = current.next.next.', quelle: 'OPAL 3.1 Schritt 6, Kurz geprüft 6' },
  { id: 'k24_008', burg: 24, kap: 60, stufe: 1, art: 'mehr', frage: 'Kreuze alle Anwendungen an, für die ein Stapel (LIFO) die passende Datenstruktur ist.',
    optionen: ['Rückgängig-Taste in einem Zeichenprogramm', 'Klammerprüfung in einer Formel', 'Druckaufträge in der Reihenfolge ihres Eingangs abarbeiten', 'Zurück-Knopf im Browser', 'Kundinnen an der Kasse bedienen'], richtig: [0, 1, 3],
    erkl: 'Beim Stapel kommt das zuletzt Abgelegte zuerst zurück: letzte Aktion, zuletzt geöffnete Klammer, zuletzt besuchte Seite. Druckaufträge und Kasse arbeiten nach FIFO – das ist eine Schlange.', quelle: 'OPAL 3.3 Stack; Abiturvorbereitung 3.1.3 c' },
  { id: 'k24_009', burg: 24, kap: 60, stufe: 2, art: 'wahl', frage: '', optionen: [], erkl: '', quelle: 'OPAL 3.3 Schritt 4/5 Klammerprüfung; Abiturvorbereitung 3.1.7',
    code: `def klammern_ok(text):
    paare = {")": "(", "]": "[", "}": "{"}
    s = Stack()
    for zeichen in text:
        if zeichen in "([{":
            s.push(zeichen)
        elif zeichen in paare:
            if s.is_empty() or s.pop() != paare[zeichen]:
                return False
    return s.is_empty()`,
    gen: (z) => {
      const [f, w] = z.wahl([['{a[b(c)]d}', 'True'], ['[(a+b]*c)', 'False'], ['(x+y))(', 'False'], ['((a)', 'False'], ['([]{})', 'True'], ['a+(b*[c-d])', 'True']]);
      return { frage: `Was liefert klammern_ok("${f}")?`, optionen: [w, w === 'True' ? 'False' : 'True', 'Fehler, weil pop() auf einen leeren Stapel zugreift'],
        erkl: w === 'True' ? 'Jede schließende Klammer passt zur zuletzt geöffneten, und am Ende ist der Stapel leer.' : 'Entweder passt eine schließende Klammer nicht zur obersten des Stapels, es fehlt ein offener Partner (is_empty() wird vorher geprüft) oder am Ende bleiben Klammern übrig.' };
    } },
  { id: 'k24_010', burg: 24, kap: 60, stufe: 3, art: 'wahl', frage: 'Vorschlag: Statt eines Stapels reicht ein Zähler (+1 bei öffnender, −1 bei schließender Klammer, am Ende 0 und nie negativ = in Ordnung). Bei welcher Formel liefert der Zähler ein falsches Ergebnis?',
    optionen: ['[(])', '((a)', '(a))(', '()[]'],
    erkl: 'Bei [(]) wird der Zähler nie negativ und endet bei 0, aber die Klammern sind falsch geschachtelt. Ein Zähler weiß nicht, welche Klammer zuletzt geöffnet wurde – das kann nur der Stapel.', quelle: 'Abiturvorbereitung 3.1.7 d' },
  { id: 'k24_011', burg: 24, kap: 60, stufe: 1, art: 'zuordnen', frage: 'Ordne jedem Begriff die passende Beschreibung zu.',
    paare: [['push / pop', 'Stapel: LIFO'], ['enqueue / dequeue', 'Schlange: FIFO'], ['peek bzw. top', 'nachsehen, ohne zu entfernen'], ['head', 'Verweis auf den ersten Knoten'], ['next = None', 'letzter Knoten der Liste']],
    erkl: 'Stapel: zuletzt hinein, zuerst heraus. Schlange: zuerst hinein, zuerst heraus. peek/top verändern nichts. head zeigt auf den ersten Knoten, der letzte zeigt mit next auf None.', quelle: 'OPAL 3.1–3.3' },
  { id: 'k24_012', burg: 24, kap: 60, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.0.1 Was kostet das Einfügen?; Abiturvorbereitung 3.1.8 c',
    gen: (z) => {
      const n = z.int(20, 120);
      return { frage: `In einer Python-Liste warten ${n} Personen. Sie werden mit pop(0) nacheinander aufgerufen, bis die Liste leer ist. Wie viele Verschiebungen sind das insgesamt?`,
        antworten: [String(n * (n - 1) / 2)], erkl: `Beim ersten pop(0) rücken ${n - 1} nach, dann ${n - 2} … bis 0: n(n − 1)/2 = ${n * (n - 1) / 2}. Eine Schlange aus Knoten setzt dagegen je dequeue nur __head um – O(1).` };
    } },
  { id: 'k24_013', burg: 24, kap: 60, stufe: 3, art: 'wahl', frage: 'Behauptung: „Eine verkettete Liste ist immer schneller als ein Array, weil beim Einfügen nichts verschoben werden muss.“ Welche Stellungnahme ist stichhaltig?',
    optionen: ['Nur teilweise: Einhängen ist O(1), aber Suchen der Stelle und Indexzugriff kosten O(n).', 'Stimmt, denn in einer verketteten Liste ist jede Operation O(1).', 'Stimmt nicht, denn eine verkettete Liste braucht mehr Speicher und ist deshalb bei jeder Operation langsamer.', 'Stimmt, weil Python-Listen intern ohnehin verkettete Listen sind.'],
    erkl: 'Das Einhängen selbst kostet O(1), aber die Stelle muss erst ab head gesucht werden (O(n)), und der Indexzugriff ist beim Array O(1), bei der Liste O(n). Ein Urteil „stimmt nur, wenn …“ ist hier richtig: Vergleiche mindestens zwei Operationen (Zugriff über den Index, Einfügen an bekannter Stelle) in O-Notation.', quelle: 'Abiturvorbereitung 3.1.1 f' },
  { id: 'k24_014', burg: 24, kap: 60, stufe: 2, art: 'wahl', frage: 'Die Klasse Queue aus dem Kurs (wie im Auftrag „Schlange aus Knoten“) arbeitet mit Knoten, __head vorn und __tail hinten. Was muss dequeue() zusätzlich tun, wenn gerade das letzte Element entnommen wird?',
    optionen: ['auch __tail auf None setzen', 'alle übrigen Knoten nach vorn verschieben', '__head auf __tail setzen', 'nichts – __head = None reicht immer'],
    erkl: 'Sonst zeigt __tail noch auf den entfernten Knoten, und das nächste enqueue hängt dort an – das neue Element wäre unerreichbar.', quelle: 'OPAL 3.2 Queue; Abiturvorbereitung 3.1.1 e und 3.1.3 d' },
  { id: 'k24_015', burg: 24, kap: 60, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.1 LinkedList; Abiturvorbereitung 3.1.4',
    gen: (z) => {
      const [a, b, c, x, y] = z.mische([3, 4, 5, 6, 7, 8, 9, 11, 12, 15]).slice(0, 5);
      const r = [x, a, c, y];
      return { frage: `Die Liste p sieht aus wie im Bild. Danach: p.insert_at_start(${x}), p.append(${y}), p.delete(${b}). Gib alle Werte ab head an (Schreibweise: 1, 2, 3).`,
        bild: () => svgKette([a, b, c]),
        antworten: [r.join(', '), r.join(',')], erkl: `insert_at_start stellt ${x} vor den Kopf, append hängt ${y} hinten an, delete entfernt ${b}: ${r.join(' → ')} → None.` };
    } },

  // ---------------------------------------------------------------------------------------------
  // Kapitel 61: Bäume
  { id: 'k24_016', burg: 24, kap: 61, stufe: 1, art: 'mehr', frage: 'Kreuze alle Aussagen an, die für den abgebildeten Baum stimmen. (Höhe und Tiefe zählen Kanten.)',
    bild: () => svgBaum(['A', [['B', [['E', []], ['F', [['G', []]]]]], ['C', [['H', []]]], ['D', []]]], { allg: true }),
    optionen: ['Der Baum hat die Höhe 3.', 'B und C sind Geschwister.', 'Der Baum hat 4 Blätter.', 'G hat die Tiefe 2.', 'Der Teilbaum mit der Wurzel B besteht aus 3 Knoten.'], richtig: [0, 1, 2],
    erkl: 'Längster Weg A–B–F–G hat 3 Kanten. Blätter: E, G, H, D. G liegt 3 Kanten unter der Wurzel. Zum Teilbaum von B gehört auch B selbst: B, E, F, G = 4 Knoten.', quelle: 'OPAL 3.4 Kurz geprüft 1; Abiturvorbereitung 3.2.7 a' },
  { id: 'k24_017', burg: 24, kap: 61, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Abiturvorbereitung 3.2.7 b',
    gen: (z) => {
      const n = z.int(7, 40);
      return { frage: `Ein Baum hat ${n} Knoten. Wie viele Kanten hat er?`, antworten: [String(n - 1)],
        erkl: `Jeder Knoten außer der Wurzel hat genau einen Elternknoten, also führt in jeden genau eine Kante hinein: ${n} − 1 = ${n - 1}.` };
    } },
  { id: 'k24_018', burg: 24, kap: 61, stufe: 1, art: 'eingabe', frage: 'Ein Baum besteht nur aus seiner Wurzel. Welche Höhe hat er (Höhe wie im Kurs)?', antworten: ['0'], zahl: true,
    erkl: 'Die Höhe zählt die Kanten auf dem längsten Weg von der Wurzel zu einem Blatt. Ohne Kanten ist sie 0; ein leerer Baum hat die Höhe −1.', quelle: 'Abiturvorbereitung 3.2 Hinweis; 3.2.2 c' },
  { id: 'k24_019', burg: 24, kap: 61, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.6 Traversierung; Abiturvorbereitung 3.2.1 c',
    gen: (z) => {
      const w = z.mische([12, 18, 23, 29, 35, 41, 47, 53, 58, 64, 71, 77, 83, 90]).slice(0, 7);
      const ein = (n, v) => { if (!n) return [v, null, null]; if (v < n[0]) n[1] = ein(n[1], v); else n[2] = ein(n[2], v); return n; };
      let r = null;
      for (const v of w) r = ein(r, v);
      const pre = (n) => (n ? [n[0], ...pre(n[1]), ...pre(n[2])] : []);
      const post = (n) => (n ? [...post(n[1]), ...post(n[2]), n[0]] : []);
      const level = (n) => { const q = [n], e = []; while (q.length) { const k = q.shift(); if (!k) continue; e.push(k[0]); q.push(k[1], k[2]); } return e; };
      const [name, f, wie] = z.wahl([['Pre-Order', pre, 'Knoten – links – rechts'], ['Post-Order', post, 'links – rechts – Knoten'], ['Level-Order', level, 'Ebene für Ebene, jeweils von links nach rechts']]);
      const s = f(r);
      return { frage: `Gib die ${name} des binären Suchbaums an (Schreibweise: 1, 2, 3).`, bild: () => svgBaum(r),
        antworten: [s.join(', '), s.join(',')], erkl: `${name}: ${wie}. Ergebnis: ${s.join(', ')}.` };
    } },
  { id: 'k24_020', burg: 24, kap: 61, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.5 Binärbaum; Abiturvorbereitung 3.2.1 b und 3.2.4',
    gen: (z) => {
      const w = z.mische([5, 9, 14, 17, 22, 26, 31, 38, 44, 50]).slice(0, z.int(6, 8));
      const ein = (n, v) => { if (!n) return [v, null, null]; if (v < n[0]) n[1] = ein(n[1], v); else n[2] = ein(n[2], v); return n; };
      let r = null;
      for (const v of w) r = ein(r, v);
      const h = (n) => (n ? 1 + Math.max(h(n[1]), h(n[2])) : -1);
      return { frage: `Die Werte ${w.join(', ')} werden in dieser Reihenfolge in einen leeren binären Suchbaum eingefügt. Welche Höhe hat der Baum?`,
        antworten: [String(h(r))], erkl: `Kleiner → links, größer → rechts. Der längste Weg von der Wurzel ${w[0]} zu einem Blatt hat ${h(r)} Kanten.` };
    } },
  { id: 'k24_021', burg: 24, kap: 61, stufe: 2, art: 'wahl', frage: 'Die Werte 6, 2, 9, 1, 4 werden in dieser Reihenfolge in einen leeren binären Suchbaum eingefügt. Welche andere Einfügereihenfolge erzeugt genau denselben Baum?',
    optionen: ['6, 9, 2, 4, 1', '1, 2, 4, 6, 9', '2, 6, 1, 4, 9', '6, 4, 9, 2, 1'],
    erkl: 'Die Wurzel 6 muss zuerst kommen, und jeder Wert erst nach seinem Elternknoten (2 vor 1 und 4). Bei 6, 4, 9, 2, 1 würde 4 linkes Kind der 6.', quelle: 'Abiturvorbereitung 3.2.1 a' },
  { id: 'k24_022', burg: 24, kap: 61, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.5 Kurz geprüft 3; Abiturvorbereitung 3.2.4 b',
    gen: (z) => {
      const w = z.mische([10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]).slice(0, 7);
      const ein = (n, v) => { if (!n) return [v, null, null]; if (v < n[0]) n[1] = ein(n[1], v); else n[2] = ein(n[2], v); return n; };
      let r = null;
      for (const v of w) r = ein(r, v);
      const ziel = z.wahl(w.slice(1));
      let k = r, n = 0;
      while (k) { n++; if (k[0] === ziel) break; k = ziel < k[0] ? k[1] : k[2]; }
      return { frage: `Wie viele Knoten werden bei der Suche nach ${ziel} in diesem Suchbaum verglichen (der gefundene Knoten zählt mit)?`, bild: () => svgBaum(r),
        antworten: [String(n)], erkl: `Die Suche läuft denselben Weg wie das Einfügen: ab der Wurzel kleiner → links, größer → rechts, bis ${ziel} gefunden ist – ${n} Vergleiche, höchstens einer je Ebene.` };
    } },
  { id: 'k24_023', burg: 24, kap: 61, stufe: 1, art: 'zuordnen', frage: 'Ordne jeder Traversierung die Anwendung zu, für die sie passt.',
    paare: [['Pre-Order', 'Inhaltsverzeichnis: Überschrift vor den Unterkapiteln'], ['In-Order', 'Suchbaum aufsteigend sortiert ausgeben'], ['Post-Order', 'Ordnergröße: erst alle Unterordner, dann der Ordner'], ['Level-Order', 'Ebene für Ebene mit einer Schlange']],
    erkl: 'Pre: Knoten zuerst. In: links – Knoten – rechts, beim Suchbaum sortiert. Post: Knoten nach seinen Kindern. Level-Order arbeitet mit einer Warteschlange wie die Breitensuche.', quelle: 'OPAL 3.6 Praxisbezug; Abiturvorbereitung 3.2.7 c, d' },
  { id: 'k24_024', burg: 24, kap: 61, stufe: 2, art: 'luecke', frage: 'Ergänze die rekursive Hilfsmethode, die die Höhe wie im Kurs berechnet (nur Wurzel = 0).',
    text: 'def __hoehe(self, knoten):\n    if knoten is None:\n        return {}\n    return 1 + {}(self.__hoehe(knoten.left), self.__hoehe(knoten.right))',
    luecken: [['-1'], ['max']], woerter: ['-1', '0', '1', 'max', 'min', 'sum'],
    erkl: 'Ein leerer Teilbaum hat die Höhe −1, damit ein Blatt 1 + max(−1, −1) = 0 bekommt. Gibt der Abbruchfall 0 zurück, ist jede Höhe um 1 zu groß.', quelle: 'Abiturvorbereitung 3.2.2 c' },
  { id: 'k24_025', burg: 24, kap: 61, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.6 Kurz geprüft 3',
    gen: (z) => {
      const n = z.int(3, 15);
      return { frage: `in_order(knoten) ruft sich für knoten.links und knoten.rechts auf – auch wenn dort None steht. Wie oft wird in_order insgesamt aufgerufen, wenn der Baum ${n} Knoten hat?`,
        antworten: [String(2 * n + 1)], erkl: `Ein Aufruf je Knoten (${n}) plus je ein Aufruf für jeden leeren Platz. Ein Binärbaum mit n Knoten hat n + 1 leere Plätze: ${n} + ${n + 1} = ${2 * n + 1}.` };
    } },
  { id: 'k24_026', burg: 24, kap: 61, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Abiturvorbereitung 3.2.2 e und 3.2.5 b',
    gen: (z) => {
      const n = z.int(5, 120);
      let h = 0;
      while (2 ** (h + 1) - 1 < n) h++;
      return { frage: `Wie groß ist die kleinstmögliche Höhe eines Binärbaums mit ${n} Knoten?`,
        antworten: [String(h)], erkl: `Ein Binärbaum der Höhe h hat höchstens 2^(h+1) − 1 Knoten. Für h = ${h} passen ${2 ** (h + 1) - 1} Knoten hinein${h > 0 ? `, für h = ${h - 1} nur ${2 ** h - 1}` : ''}.` };
    } },
  { id: 'k24_027', burg: 24, kap: 61, stufe: 3, art: 'wahl', frage: 'Der Kassierer meint: „Wenn die Platznummern schon sortiert ankommen, ist der Suchbaum besonders schnell – er ist dann ja schon geordnet.“ Welche Stellungnahme ist richtig?',
    optionen: ['Falsch: Sortiert eingefügt entartet der Suchbaum zu einer Kette – die Suche braucht dann O(n).', 'Richtig: Sortierte Daten ergeben einen ausgeglichenen Baum mit Höhe log n, die Suche bleibt bei O(log n).', 'Richtig: Die Reihenfolge des Einfügens hat keinen Einfluss auf die Form des Suchbaums.', 'Falsch: Sortierte Werte lassen sich gar nicht in einen Suchbaum einfügen.'],
    erkl: 'Jede neue Nummer ist größer als alle bisherigen und wandert immer nach rechts. Der Baum sieht aus wie eine verkettete Liste (Höhe n − 1).', quelle: 'Abiturvorbereitung 3.2.5 d; OPAL 3.5 Kurz geprüft 4' },
  { id: 'k24_028', burg: 24, kap: 61, stufe: 3, art: 'wahl', frage: 'Ein K.-o.-Turnier ist als Binärbaum gespeichert (Blätter = Spieler, innere Knoten = Spiele). anzahl_siege besucht jeden Knoten genau einmal. Behauptung: „Bei 1024 statt 8 Spielern wird das Programm unbenutzbar langsam.“ Welche Begründung ist stichhaltig?',
    optionen: ['Die Aussage ist falsch: n Spieler ergeben 2n − 1 Knoten, also 2047 Aufrufe – linearer Aufwand O(n).', 'Die Aussage stimmt: Der Aufwand wächst exponentiell, weil jeder Aufruf jedes Mal zwei weitere neue Aufrufe auslöst.', 'Die Aussage stimmt: Rekursion ist bei mehr als 1000 Knoten grundsätzlich zu langsam.', 'Die Aussage ist falsch: Der Aufwand ist konstant, weil nur die Wurzel befragt wird.'],
    erkl: 'Jeder Aufruf erzeugt zwar zwei Unteraufrufe, aber jeder Knoten wird nur einmal besucht. Doppelt so viele Spieler heißt etwa doppelt so viele Aufrufe – das ist linear, nicht exponentiell.', quelle: 'Abiturvorbereitung 3.2.3 e' },

  // ---------------------------------------------------------------------------------------------
  // Kapitel 62: Graphen
  { id: 'k24_029', burg: 24, kap: 62, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'Abiturvorbereitung 3.2.8 a; OPAL 3.7 Kurz geprüft 2',
    gen: (z) => {
      const k = z.int(5, 15);
      return { frage: `Die Adjazenzmatrix eines ungerichteten Graphen enthält ${2 * k} Einsen. Wie viele Kanten hat der Graph?`, antworten: [String(k)],
        erkl: `Jede ungerichtete Kante steht zweimal in der Matrix (Zeile i/Spalte j und Zeile j/Spalte i): ${2 * k} : 2 = ${k}.` };
    } },
  { id: 'k24_030', burg: 24, kap: 62, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.8 Breitensuche, Kurz geprüft 2; Abiturvorbereitung 3.2.8 c',
    gen: (z) => {
      const g = { A: ['B', 'C'], B: ['A', 'D'], C: ['A', 'D', 'E'], D: ['B', 'C', 'F'], E: ['C', 'F', 'G'], F: ['D', 'E', 'G'], G: ['E', 'F'] };
      const pos = { A: [4, 50], B: [30, 8], C: [30, 92], D: [58, 30], E: [58, 92], F: [84, 46], G: [98, 96] };
      const s = z.wahl(['A', 'B', 'D', 'G']);
      const v = [s], q = [s];
      while (q.length) { const u = q.shift(); for (const n of g[u]) if (!v.includes(n)) { v.push(n); q.push(n); } }
      const kanten = [];
      for (const a of Object.keys(g)) for (const b of g[a]) if (a < b) kanten.push([a, b, null]);
      return { frage: `Führe eine Breitensuche ab ${s} durch. Nachbarn werden alphabetisch bearbeitet. In welcher Reihenfolge werden die Knoten besucht? (Schreibweise: A, B, C)`,
        bild: () => svgGraph({ pos, kanten, gerichtet: false }), antworten: [v.join(', '), v.join(','), v.join('')],
        erkl: `Schlange: vorn entnehmen, unentdeckte Nachbarn hinten anhängen und sofort markieren. Reihenfolge: ${v.join(', ')}.` };
    } },
  { id: 'k24_031', burg: 24, kap: 62, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.8 Aufgabe 3.8.3 Tiefensuche; Abiturvorbereitung 3.2.8 d',
    gen: (z) => {
      const g = { A: ['B', 'C'], B: ['A', 'D'], C: ['A', 'D', 'E'], D: ['B', 'C', 'F'], E: ['C', 'F', 'G'], F: ['D', 'E', 'G'], G: ['E', 'F'] };
      const pos = { A: [4, 50], B: [30, 8], C: [30, 92], D: [58, 30], E: [58, 92], F: [84, 46], G: [98, 96] };
      const s = z.wahl(['A', 'C', 'E', 'G']);
      const v = [];
      const dfs = (u) => { v.push(u); for (const n of g[u]) if (!v.includes(n)) dfs(n); };
      dfs(s);
      const kanten = [];
      for (const a of Object.keys(g)) for (const b of g[a]) if (a < b) kanten.push([a, b, null]);
      return { frage: `Gib die Reihenfolge an, in der eine rekursive Tiefensuche ab ${s} die Knoten besucht. Nachbarn werden alphabetisch bearbeitet. (Schreibweise: A, B, C)`,
        bild: () => svgGraph({ pos, kanten, gerichtet: false }), antworten: [v.join(', '), v.join(','), v.join('')],
        erkl: `Die Tiefensuche geht sofort zum ersten unbesuchten Nachbarn und kehrt erst um, wenn es nicht weitergeht: ${v.join(', ')}.` };
    } },
  { id: 'k24_032', burg: 24, kap: 62, stufe: 2, art: 'wahl', frage: 'In bfs wird visited[...] = True erst direkt nach current = queue.dequeue() gesetzt, nicht schon beim Einreihen der Nachbarn. Was passiert?',
    optionen: ['Knoten können mehrfach in die Schlange kommen und mehrfach besucht werden.', 'Nichts – die Reihenfolge bleibt gleich, es ist nur eine andere Schreibweise.', 'Die Breitensuche wird zur Tiefensuche.', 'Der Startknoten wird nie besucht.'],
    erkl: 'Ein Knoten, der schon in der Schlange wartet, ist noch nicht markiert und wird von weiteren Nachbarn erneut angehängt. Wer beim Einreihen markiert, stellt jeden Knoten nur einmal an.', quelle: 'OPAL 3.8 Kurz geprüft 4' },
  { id: 'k24_033', burg: 24, kap: 62, stufe: 1, art: 'wahl', frage: 'Ein Straßennetz hat 50 000 Kreuzungen, an jeder treffen sich höchstens 4 Straßen. Welche Darstellung ist sinnvoller?',
    optionen: ['Adjazenzliste: Sie braucht nur Platz für Knoten und vorhandene Kanten.', 'Adjazenzmatrix: Sie braucht weniger Speicher, weil nur 0 und 1 vorkommen.', 'Adjazenzmatrix: Nur damit kann man Nachbarn finden.', 'Beide brauchen gleich viel Speicher.'],
    erkl: 'Die Matrix hat n² = 2,5 Milliarden Einträge, fast alle 0. Die Liste braucht etwa n + Anzahl der Kanten – bei dünnen Graphen viel weniger.', quelle: 'OPAL 3.8 Darstellungen im Vergleich; Aufgabe 3.7.3' },
  { id: 'k24_034', burg: 24, kap: 62, stufe: 1, art: 'zuordnen', frage: 'Ordne jedem Begriff die passende Beschreibung zu.',
    paare: [['Zyklus', 'Weg, der wieder am Startknoten ankommt'], ['gerichteter Graph', 'Kanten haben eine Richtung (z. B. Einbahnstraße)'], ['gewichteter Graph', 'jede Kante trägt eine Zahl (z. B. Fahrzeit)'], ['Grad eines Knotens', 'Anzahl seiner Nachbarn'], ['Baum', 'zusammenhängender Graph ohne Zyklus']],
    erkl: 'Diese Begriffe braucht man, um Graphen im Sachzusammenhang zu beschreiben – etwa ein Navi: gerichtet, gewichtet, mit Zyklen.', quelle: 'OPAL 3.7 Graphen, Kurz geprüft 1' },
  { id: 'k24_035', burg: 24, kap: 62, stufe: 2, art: 'wahl', frage: 'Was passiert bei der letzten Zeile?',
    code: `netz = {"Hafen": {"Markt": 4, "Kirche": 2},
        "Markt": {"Hafen": 4},
        "Kirche": {"Hafen": 2}}
print(list(netz["Hafen"]))
print("Kirche" in netz["Markt"])
print(netz["Markt"]["Kirche"])`,
    optionen: ['KeyError: \'Kirche\'', 'Es wird 0 ausgegeben.', 'Es wird None ausgegeben.', 'Es wird False ausgegeben.'],
    erkl: 'Die ersten beiden Zeilen geben [\'Markt\', \'Kirche\'] und False aus. Das innere Dictionary von Markt hat keinen Schlüssel „Kirche“, deshalb KeyError. Vorher mit in prüfen!', quelle: 'OPAL 3.7 Kurz geprüft 3' },
  { id: 'k24_036', burg: 24, kap: 62, stufe: 3, art: 'mehr', frage: 'Kreuze alle Aussagen an, die für die Breitensuche in einem ungewichteten Graphen gelten.',
    optionen: ['Sie findet zu jedem Knoten einen Weg mit den wenigsten Kanten.', 'Sie erreicht alle Knoten, die vom Start aus erreichbar sind.', 'Mit ihr kann man prüfen, ob ein Graph zusammenhängend ist.', 'Sie findet in einem gewichteten Graphen die kürzeste Fahrzeit.', 'Sie braucht einen Stapel statt einer Schlange.'], richtig: [0, 1, 2],
    erkl: 'Die Breitensuche arbeitet Ebene für Ebene mit einer Schlange. Kantengewichte beachtet sie nicht – dafür braucht man Dijkstra.', quelle: 'OPAL 3.8 Weiterführend: kürzester Weg mit BFS; Abiturvorbereitung 3.2.1 f' },
  { id: 'k24_037', burg: 24, kap: 62, stufe: 3, art: 'wahl', frage: 'Eine Telefonkette soll nach der Tiefensuche statt nach der Breitensuche organisiert werden: „Die Tiefensuche erreicht auch alle Familien, also sind genauso schnell alle informiert.“ Welche Stellungnahme ist richtig?',
    optionen: ['Falsch: Beide erreichen alle, aber die Tiefensuche bildet eine lange Anrufkette.', 'Stimmt: Beide besuchen dieselben Knoten in derselben Reihenfolge.', 'Stimmt nicht: Die Tiefensuche erreicht in einem Graphen mit Zyklen nicht alle Knoten.', 'Stimmt: Die Tiefensuche ist immer schneller, weil sie keine Schlange braucht.'],
    erkl: 'Die Anrufrunde entspricht der kleinsten Kantenzahl vom Start – genau das liefert die Breitensuche. Bei der Tiefensuche ruft jede Familie die nächste an, die Kette wird viel länger.', quelle: 'Abiturvorbereitung 3.2.8 e' },
  { id: 'k24_038', burg: 24, kap: 62, stufe: 2, art: 'wahl', frage: 'Statt graph = [[] for i in range(3)] schreibt jemand graph = [[]] * 3 und danach graph[0].append(2). Was steht in graph?',
    optionen: ['[[2], [2], [2]]', '[[2], [], []]', '[[2, 2, 2], [], []]', 'Fehlermeldung'],
    erkl: '[[]] * 3 enthält dreimal dieselbe Liste. Die Komprehension erzeugt dagegen für jeden Knoten eine eigene Liste.', quelle: 'OPAL 3.8 Kurz geprüft 1' },

  // ---------------------------------------------------------------------------------------------
  // Kapitel 63: Kürzeste Wege
  { id: 'k24_039', burg: 24, kap: 63, stufe: 2, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.9 Dijkstra; Abiturvorbereitung 3.2.1 e',
    gen: (z) => {
      const kant = [['S', 'A'], ['S', 'B'], ['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'], ['C', 'Z'], ['D', 'Z']];
      const pos = { S: [2, 50], A: [34, 6], B: [34, 94], C: [66, 30], D: [66, 94], Z: [98, 60] };
      const kanten = kant.map(([a, b]) => [a, b, z.int(1, 9)]);
      const g = {};
      for (const k of Object.keys(pos)) g[k] = {};
      for (const [a, b, w] of kanten) { g[a][b] = w; g[b][a] = w; }
      const dist = {}, fertig = [], vor = {};
      for (const k of Object.keys(g)) { dist[k] = Infinity; vor[k] = null; }
      dist.S = 0;
      while (fertig.length < 6) {
        let u = null;
        for (const k of Object.keys(g)) if (!fertig.includes(k) && (u === null || dist[k] < dist[u])) u = k;
        fertig.push(u);
        for (const v of Object.keys(g[u])) if (!fertig.includes(v) && dist[u] + g[u][v] < dist[v]) { dist[v] = dist[u] + g[u][v]; vor[v] = u; }
      }
      const weg = [];
      for (let k = 'Z'; k; k = vor[k]) weg.unshift(k);
      return { frage: 'Bestimme mit dem Algorithmus von Dijkstra die kürzeste Entfernung von S nach Z.', bild: () => svgGraph({ pos, kanten, gerichtet: false }),
        antworten: [String(dist.Z)], erkl: `Immer den offenen Knoten mit der kleinsten Distanz festlegen und seine Kanten relaxieren. Kürzester Weg: ${weg.join(' → ')} mit der Länge ${dist.Z}.` };
    } },
  { id: 'k24_040', burg: 24, kap: 63, stufe: 2, art: 'eingabe', frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.9 Kurz geprüft 2; PRIMM 3.9',
    gen: (z) => {
      const kant = [['S', 'A'], ['S', 'B'], ['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'Z'], ['B', 'Z']];
      const pos = { S: [2, 50], A: [40, 6], B: [40, 94], C: [74, 40], Z: [98, 92] };
      let kanten, fertig, dist;
      do {
        kanten = kant.map(([a, b]) => [a, b, z.int(1, 9)]);
        const g = {};
        for (const k of Object.keys(pos)) g[k] = {};
        for (const [a, b, w] of kanten) { g[a][b] = w; g[b][a] = w; }
        dist = {}; fertig = [];
        for (const k of Object.keys(g)) dist[k] = Infinity;
        dist.S = 0;
        while (fertig.length < 5) {
          let u = null;
          for (const k of Object.keys(g)) if (!fertig.includes(k) && (u === null || dist[k] < dist[u])) u = k;
          fertig.push(u);
          for (const v of Object.keys(g[u])) if (!fertig.includes(v) && dist[u] + g[u][v] < dist[v]) dist[v] = dist[u] + g[u][v];
        }
      } while (new Set(Object.values(dist)).size < 5);
      return { frage: 'Dijkstra ab S: In welcher Reihenfolge werden die Knoten „fertig“? (Schreibweise: S, A, B)', bild: () => svgGraph({ pos, kanten, gerichtet: false }),
        antworten: [fertig.join(', '), fertig.join(','), fertig.join('')], erkl: `Fertig wird immer der offene Knoten mit der kleinsten vorläufigen Distanz: ${fertig.map((k) => `${k} (${dist[k]})`).join(', ')}.` };
    } },
  { id: 'k24_041', burg: 24, kap: 63, stufe: 1, art: 'reihe', frage: 'Bringe die Schritte des Algorithmus von Dijkstra in die richtige Reihenfolge.',
    teile: ['Distanz des Starts auf 0, alle anderen auf ∞ setzen', 'unter den offenen Knoten den mit der kleinsten Distanz wählen', 'diesen Knoten als fertig markieren', 'Kanten zu offenen Nachbarn relaxieren', 'wiederholen, bis alle erreichbaren Knoten fertig sind'],
    erkl: 'Greedy-Strategie: Der Knoten mit der kleinsten vorläufigen Distanz wird endgültig festgelegt, danach werden nur noch seine offenen Nachbarn verbessert.', quelle: 'OPAL 3.9 Schritt 2' },
  { id: 'k24_042', burg: 24, kap: 63, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.9 Kantenrelaxation',
    gen: (z) => {
      const du = z.int(2, 12), w = z.int(1, 9), dv = z.wahl([du + w + z.int(1, 6), du + w - z.int(1, Math.min(4, du + w - 1))]);
      const neu = Math.min(dv, du + w);
      return { frage: `Knoten u ist gerade fertig geworden: dist[u] = ${du}. Die Kante u–v hat das Gewicht ${w}, bisher gilt dist[v] = ${dv}. Welcher Wert steht nach dem Relaxieren in dist[v]?`,
        antworten: [String(neu)], erkl: du + w < dv ? `${du} + ${w} = ${du + w} < ${dv}, also wird verbessert: dist[v] = ${du + w}, vorgaenger[v] = u.` : `${du} + ${w} = ${du + w} ist nicht kleiner als ${dv} – dist[v] bleibt ${dv}.` };
    } },
  { id: 'k24_043', burg: 24, kap: 63, stufe: 1, art: 'eingabe', frage: 'Gib den Weg von S nach Z an, den man aus diesem Dictionary abliest. (Schreibweise: S, A, B)',
    code: `vorgaenger = {'S': None, 'A': 'B', 'B': 'S', 'C': 'A', 'D': 'B', 'Z': 'C'}`,
    antworten: ['S, B, A, C, Z', 'S,B,A,C,Z', 'SBACZ'],
    erkl: 'Rückwärts vom Ziel: Z ← C ← A ← B ← S. Umgedreht ergibt das den Weg S → B → A → C → Z.', quelle: 'OPAL 3.9 Aufgabe 3.9.2 weg(vorgaenger, ziel)' },
  { id: 'k24_044', burg: 24, kap: 63, stufe: 2, art: 'zeile', frage: 'Diese Fassung von dijkstra liefert zu kleine Entfernungen. Tippe die fehlerhafte Zeile an.',
    code: `def dijkstra(graph, start, dist):
    for k in graph:
        dist[k] = float("inf")
    dist[start] = 0
    fertig = []
    while len(fertig) < len(graph):
        u = None
        for k in graph:
            if k not in fertig:
                if u is None or dist[k] < dist[u]:
                    u = k
        fertig.append(u)
        for v in graph[u]:
            w = graph[u][v]
            if v not in fertig and dist[u] + w < dist[v]:
                dist[v] = w`,
    fehler: [16], erkl: 'Eingetragen werden muss die Länge des ganzen Wegs: dist[v] = dist[u] + w. So steht nur das Gewicht der letzten Kante in dist.', quelle: 'OPAL 3.9 PRIMM Schritt 5 Fehler finden' },
  { id: 'k24_045', burg: 24, kap: 63, stufe: 2, art: 'wahl', frage: 'Ein Lieferdienst bekommt auf manchen Einbahnstraßen eine Prämie, die als negatives Gewicht eingetragen wird (ohne negativen Zyklus). Welches Verfahren liefert sicher die kürzesten Wege?',
    optionen: ['Moore-Bellman-Ford', 'Dijkstra', 'Breitensuche', 'Tiefensuche mit Backtracking, die beim ersten gefundenen Weg aufhört'],
    erkl: 'Dijkstra legt einen Knoten endgültig fest und verbessert ihn nie wieder – bei negativen Kanten kann ein späterer Umweg aber kürzer sein. Moore-Bellman-Ford relaxiert (n − 1)-mal alle Kanten.', quelle: 'OPAL 3.9 Schritt 1 und Hinweis; Aufgabe 3.9.3' },
  { id: 'k24_046', burg: 24, kap: 63, stufe: 3, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.9 Kurz geprüft 1 (Moore)',
    gen: (z) => {
      const x = z.int(3, 9), y = x + z.int(1, 6), w = z.int(y - x + 1, y - 1);
      return { frage: `Gerichteter Graph: S→A (${x}), S→B (${y}), B→A (−${w}). Relaxiere mit Moore-Bellman-Ford in der Reihenfolge S→A, S→B, B→A. Welche Distanz hat A am Ende?`,
        antworten: [String(y - w)], erkl: `S→A: A = ${x}. S→B: B = ${y}. B→A: ${y} + (−${w}) = ${y - w} < ${x}, also A = ${y - w} über B. In Runde 2 ändert sich nichts mehr. Dijkstra hätte A schon mit ${x} festgelegt.` };
    } },
  { id: 'k24_047', burg: 24, kap: 63, stufe: 3, art: 'wahl', frage: 'Ein Fahrer meint: „Der schnellste Weg ist immer der mit den wenigsten Zwischenstopps. Dafür brauche ich keinen Dijkstra.“ Welche Stellungnahme ist stichhaltig?',
    optionen: ['Falsch: Die kleinste Gewichtssumme kann über mehr Stopps führen.', 'Richtig: Jeder zusätzliche Stopp verlängert die Fahrzeit.', 'Richtig: Dijkstra findet ohnehin immer den Weg mit den wenigsten Kanten.', 'Falsch: Der schnellste Weg hat immer die meisten Zwischenstopps.'],
    erkl: 'Unterscheide „wenigste Kanten“ (Breitensuche) und „kleinste Summe der Kantengewichte“ (Dijkstra). Eine lange direkte Kante kann teurer sein als zwei kurze.', quelle: 'Abiturvorbereitung 3.2.1 f' },
  { id: 'k24_048', burg: 24, kap: 63, stufe: 1, art: 'wahl', frage: 'In der Kursfassung sucht dijkstra in jedem Durchlauf mit for k in graph den offenen Knoten mit der kleinsten Distanz. Welche Laufzeit ergibt sich bei n Knoten?',
    optionen: ['O(n²)', 'O(n)', 'O(log n)', 'O(2ⁿ)'],
    erkl: 'Die while-Schleife läuft n-mal, die Suche darin sieht jedes Mal alle n Knoten an: n · n Schritte.', quelle: 'OPAL 3.9 Kurz geprüft 4' },

  // ---------------------------------------------------------------------------------------------
  // Kapitel 64: Backtracking und Grenzen
  { id: 'k24_049', burg: 24, kap: 64, stufe: 1, art: 'wahl', frage: 'Was beschreibt Backtracking am besten?',
    optionen: ['Tiefensuche durch alle Entscheidungen, in Sackgassen zurücknehmen', 'Breitensuche, die alle Möglichkeiten einer Ebene zugleich prüft', 'in jedem Schritt die lokal beste Wahl, die nie zurückgenommen wird', 'ein Sortierverfahren, das von hinten nach vorn arbeitet'],
    erkl: 'Backtracking geht schrittweise vor, springt bei einer Sackgasse zurück und probiert die nächste Alternative. Die Greedy-Strategie (wie bei Dijkstra) nimmt Entscheidungen dagegen nie zurück.', quelle: 'OPAL 3.10 Backtracking' },
  { id: 'k24_050', burg: 24, kap: 64, stufe: 2, art: 'wahl', frage: 'Welchen Pfad liefert g.find_path(0, 4)?',
    code: `# Nachbarlisten: 0: [1, 2]  1: [0]  2: [0, 3, 4]  3: [2, 4]  4: [3, 2]
def find_path(self, start, end, path=None):
    if path is None:
        path = []
    path = path + [start]
    if start == end:
        return path
    for neighbor in self.graph[start]:
        if neighbor not in path:
            new_path = self.find_path(neighbor, end, path)
            if new_path is not None:
                return new_path
    return None`,
    optionen: ['[0, 2, 3, 4]', '[0, 2, 4]', '[0, 1, 0, 2, 4]', 'None'],
    erkl: 'Von 0 geht es zuerst zu 1 (Sackgasse, zurück), dann zu 2, von dort zuerst zu 3 und weiter zu 4. Die Tiefensuche liefert den ersten gefundenen Weg – nicht unbedingt den kürzesten.', quelle: 'OPAL 3.10 Schritt 1 find_path' },
  { id: 'k24_051', burg: 24, kap: 64, stufe: 2, art: 'mehr', frage: 'Kreuze alle Probleme an, die unentscheidbar sind (P ist ein beliebiges Programm, x eine Eingabe).',
    optionen: ['Hält P bei Eingabe x irgendwann an?', 'Gibt P bei jeder Eingabe irgendwann „Hallo“ aus?', 'Hält P bei Eingabe x nach höchstens 1 000 000 Rechenschritten an?', 'Enthält der Quelltext von P eine while-Schleife?', 'Ist die Zahl, die P ausgegeben hat, eine Primzahl?'], richtig: [0, 1],
    erkl: 'Das Halteproblem ist unentscheidbar, und „gibt irgendwann Hallo aus“ lässt sich darauf zurückführen. Eine Million Schritte kann man einfach ausführen und zählen – das hält immer an.', quelle: 'OPAL 2.2.10 Aufgabe 2.2.10.3' },
  { id: 'k24_052', burg: 24, kap: 64, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL 2.2.10 Technische Grenzen, Beispiel 1',
    gen: (z) => {
      const [art, b, nm] = z.wahl([['Ziffern', 10, '0–9'], ['Kleinbuchstaben', 26, 'a–z']]), l = art === 'Ziffern' ? z.int(4, 8) : z.int(3, 5);
      return { frage: `Wie viele verschiedene Codes aus ${l} ${art} (${nm}) gibt es?`, antworten: [String(b ** l)],
        erkl: `Jede der ${l} Stellen hat ${b} Möglichkeiten: ${b}^${l} = ${b ** l}. Jede weitere Stelle vervielfacht den Aufwand – exponentielles Wachstum.` };
    } },
  { id: 'k24_053', burg: 24, kap: 64, stufe: 1, art: 'wahl', frage: 'Warum kann man die Churchsche These nicht beweisen?',
    optionen: ['Weil „intuitiv berechenbar“ kein mathematisch definierter Begriff ist.', 'Weil noch niemand eine echte Turingmaschine mit unendlichem Band gebaut hat.', 'Weil das Halteproblem entscheidbar ist.', 'Weil heutige Computer schneller sind als eine Turingmaschine.'],
    erkl: 'Die These verbindet einen anschaulichen Begriff mit einem mathematischen Modell. Gestützt wird sie dadurch, dass alle bekannten Modelle genau dieselben Funktionen berechnen.', quelle: 'OPAL 2.2.10 Die Churchsche These' },
  { id: 'k24_054', burg: 24, kap: 64, stufe: 1, art: 'wahl', frage: 'Was bedeutet es, dass ein Entscheidungsproblem in NP liegt?',
    optionen: ['Eine vorgeschlagene Lösung lässt sich in Polynomialzeit prüfen.', 'Es gibt sicher keinen schnellen Algorithmus, der das Problem lösen kann.', 'Das Problem ist unentscheidbar.', 'Das Problem lässt sich in O(n log n) lösen.'],
    erkl: 'NP heißt: Ein Zertifikat ist schnell prüfbar. Jedes Problem aus P liegt auch in NP. Ob P = NP gilt, ist ungelöst.', quelle: 'OPAL 2.2.10 Das P-vs.-NP-Problem' },
  { id: 'k24_055', burg: 24, kap: 64, stufe: 3, art: 'eingabe', zahl: true, frage: 'Vier Burgen auf einer Karte grenzen jeweils an alle drei anderen. Jede Burg bekommt eine Wappenfarbe, benachbarte Burgen verschiedene. Wie viele Farben braucht man mindestens?',
    antworten: ['4'], erkl: 'Jede Burg ist mit jeder benachbart, also müssen alle vier Farben verschieden sein. Backtracking mit drei Farben läuft für jede Belegung in eine Sackgasse.', quelle: 'OPAL 3.10 Belegungsprobleme (Klausurplan, Färben)' },
  { id: 'k24_056', burg: 24, kap: 64, stufe: 3, art: 'wahl', frage: 'Ein Stundenplanprogramm probiert alle Verteilungen von k Kursen auf 30 Zeitfenster durch (30^k Möglichkeiten). Ein tausendmal schnellerer Rechner wird gekauft. Welche Beurteilung ist richtig?',
    optionen: ['Hilft kaum: Zwei Kurse mehr (Faktor 900) fressen den Gewinn auf.', 'Löst das Problem dauerhaft, weil der Aufwand nur linear mit k wächst.', 'Das ist unnötig, weil das Problem unentscheidbar ist.', 'Das löst das Problem, weil 30^k nur polynomial wächst.'],
    erkl: 'Der Aufwand 30^k wächst exponentiell: 30² = 900. Besser sind Heuristiken oder Backtracking mit frühem Abbruch. Bei exponentiellem Wachstum gleicht ein schnellerer Rechner nur wenige zusätzliche Eingabeelemente aus. Das ist eine technische, keine theoretische Grenze.', quelle: 'OPAL 2.2.10 Aufgabe 2.2.10.1' },

  // ---------------------------------------------------------------------------------------------
  // Kapitel 155: Backtracking – Sudoku (Zusatzkapitel)
  { id: 'k24_057', burg: 24, kap: 155, stufe: 1, art: 'eingabe', zahl: true, frage: '', antworten: [], erkl: '', quelle: 'OPAL 3.10 Belegungsprobleme (Sudoku)',
    gen: (z) => {
      const zz = z.int(0, 8);
      return { frage: `In einem 9×9-Sudoku (Zeilen ab 0 gezählt) liegt ein Feld in Zeile ${zz}. In welcher Zeile beginnt sein 3×3-Block? (bz = zeile // 3 * 3)`,
        antworten: [String(Math.floor(zz / 3) * 3)], erkl: `${zz} // 3 = ${Math.floor(zz / 3)}, mal 3 ergibt ${Math.floor(zz / 3) * 3}. Ganzzahlige Division schneidet den Rest ab.` };
    } },
  { id: 'k24_058', burg: 24, kap: 155, stufe: 2, art: 'wahl', frage: '', optionen: [], erkl: '', quelle: 'OPAL 3.10 Belegungsprobleme; Spiel Kap. 155 zahl_erlaubt',
    code: `feld = [[1, 0, 0, 4],
        [0, 4, 1, 0],
        [0, 1, 0, 0],
        [4, 0, 0, 1]]   # 0 = leer, 2×2-Blöcke`,
    gen: (z) => {
      const feld = [[1, 0, 0, 4], [0, 4, 1, 0], [0, 1, 0, 0], [4, 0, 0, 1]];
      const erlaubt = (zl, sp, n) => { for (let i = 0; i < 4; i++) if (feld[zl][i] === n || feld[i][sp] === n) return false; const bz = Math.floor(zl / 2) * 2, bs = Math.floor(sp / 2) * 2; for (let a = bz; a < bz + 2; a++) for (let b = bs; b < bs + 2; b++) if (feld[a][b] === n) return false; return true; };
      const [zl, sp, n] = z.wahl([[0, 1, 2], [0, 1, 4], [2, 0, 4], [2, 2, 1], [3, 2, 2], [1, 3, 3], [3, 1, 1], [2, 3, 1]]);
      const ok = erlaubt(zl, sp, n);
      return { frage: `Was liefert zahl_erlaubt(feld, ${zl}, ${sp}, ${n})?`, optionen: ok ? ['True', 'False'] : ['False', 'True'],
        erkl: ok ? `${n} steht weder in Zeile ${zl} noch in Spalte ${sp} noch im 2×2-Block des Felds.` : `${n} steht schon in Zeile ${zl}, in Spalte ${sp} oder im 2×2-Block des Felds.` };
    } },
  { id: 'k24_059', burg: 24, kap: 155, stufe: 2, art: 'luecke', frage: 'Ergänze den Kern des Backtracking-Lösers.',
    text: 'for zahl in range(1, 5):\n    if zahl_erlaubt(feld, z, s, zahl):\n        feld[z][s] = zahl\n        if {}(feld):\n            return True\n        feld[z][s] = {}\nreturn {}',
    luecken: [['fuelle_sudoku'], ['0'], ['False']], woerter: ['fuelle_sudoku', 'zahl_erlaubt', '0', 'zahl', 'True', 'False'],
    erkl: 'Nach dem Setzen wird rekursiv weitergefüllt. Führt das in eine Sackgasse, wird die Zahl zurückgenommen (wieder 0). Passt keine der vier Zahlen, meldet der Aufruf False an den vorherigen zurück.', quelle: 'OPAL 3.10 Backtracking 2; Spiel Kap. 155' },
  { id: 'k24_060', burg: 24, kap: 155, stufe: 1, art: 'wahl', frage: 'Warum setzt der Sudoku-Löser feld[z][s] = 0, wenn der rekursive Aufruf False liefert?',
    optionen: ['Damit die falsche Zahl spätere Versuche nicht blockiert.', 'Damit die Rekursion schneller endet und weniger Speicher braucht.', 'Weil Python Listen sonst nicht ändern darf.', 'Damit das Sudoku am Ende überall 0 enthält.'],
    erkl: 'Die Liste feld wird nicht kopiert. Bleibt eine falsche Zahl stehen, verbietet zahl_erlaubt später richtige Zahlen in Zeile, Spalte und Block.', quelle: 'OPAL 3.10 (Zurücknehmen beim Backtracking)' },
  { id: 'k24_061', burg: 24, kap: 155, stufe: 3, art: 'wahl', frage: 'Wie ordnet man das Problem „Lässt sich ein n²×n²-Sudoku mit gegebenen Vorgaben vollständig ausfüllen?“ ein?',
    optionen: ['In NP: schnell prüfbar, Lösen evtl. langsam.', 'Unentscheidbar – genauso wie das Halteproblem.', 'In P, weil Backtracking immer schnell ist.', 'Nur für 4×4 entscheidbar, sonst nicht.'],
    erkl: 'Prüfen heißt: jede Zeile, Spalte und jeden Block einmal durchgehen – polynomial. Finden kann im schlechtesten Fall exponentiell viele Versuche kosten. Entscheidbar ist es trotzdem, weil es nur endlich viele Belegungen gibt.', quelle: 'OPAL 2.2.10 Aufgabe 2.2.10.4 c' },
  { id: 'k24_062', burg: 24, kap: 155, stufe: 1, art: 'reihe', frage: 'Bringe die Schritte des Sudoku-Lösers mit Backtracking in die richtige Reihenfolge.',
    teile: ['erstes leeres Feld suchen – gibt es keins, ist das Rätsel gelöst', 'nächste Zahl von 1 bis 4 probieren', 'prüfen, ob die Zahl erlaubt ist, und sie setzen', 'rekursiv das restliche Feld füllen', 'bei einer Sackgasse die Zahl zurücknehmen und weiterprobieren'],
    erkl: 'Das ist das allgemeine Muster des Backtrackings: Entscheidung treffen, rekursiv weitermachen, bei Misserfolg zurücknehmen.', quelle: 'OPAL 3.10 Belegungsprobleme' },
);
