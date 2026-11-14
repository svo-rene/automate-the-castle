'use strict';
// --- 🎓 Prüfungssaal: LK Abitur (Burg 30, OPAL-Kurs LK_INF_Abiturvorbereitung, Abitur Sachsen ab 2027) ---
// Gemischte Aufgaben im Stil der Prüfung (Teil A ohne Rechner, Teil B/C am Rechner) über alle Lernbereiche.
// Jede Aufgabe nennt im ziel den Operator (Ermitteln Sie …, Überführen Sie …, Beurteilen Sie …). Prüferin Ada erzählt.
// Schwerpunkte nach den Hinweisen ab 2027 und der Korrektoren-Rückmeldung 2026 (ASCII-Speicherbedarf, 3NF, fremder OOP-Code, SQL mit Aggregation).
// Technik: Kornspeicher-Ablauf (warte) mit Fragen, Automaten-Baukasten, Wahrheitstabelle, Python (auch Klassen und Dateien),
// SQL über das Archiv (eigene Datenbank Musikschule, Fassungen A/B).

KAPITEL[130] = { name: 'Teil-A-Sprint', ico: '📝' };
KAPITEL[131] = { name: 'Rekursion und Aufwand', ico: '🪆' };
KAPITEL[132] = { name: 'Automat und Grammatik', ico: '🤖' };
KAPITEL[133] = { name: 'Datenbank-Szenario Musikschule', ico: '🎵' };
KAPITEL[134] = { name: 'C-Szenario: Dateien und OOP', ico: '🚲' };
KAPITEL[135] = { name: 'Netze und Sicherheit', ico: '🌐' };
BURGEN[30] = { name: 'LK Abitur', ico: '🎓', klasse: 'LK', region: 'archiv', kapitel: [130, 131, 132, 133, 134, 135],
  text: 'Leistungskurs: Training für die schriftliche Abiturprüfung 2027 – Teil A ohne Rechner (Multiple Choice, Zahlen, Speicherbedarf, Algorithmeneigenschaften), Rekursion und Aufwand, Automat und Grammatik, Datenbank mit JOIN/GROUP BY/Unterabfrage und 3NF, Szenario mit Dateien und fremdem OOP-Code, Netze, RSA, One-Time-Pad und hybride Verfahren.' };

// --- Ort auf der Karte: Prüfungssaal mit Säulen ---
function AB_svgSaal(fertig) {
  return `<ellipse cx="0" cy="34" rx="42" ry="7" fill="rgba(0,0,0,.25)"/>
    <rect x="-38" y="-4" width="76" height="38" fill="#ece4cf" stroke="#5a4a2a" stroke-width="2"/>
    <rect x="-42" y="-8" width="84" height="6" fill="#d8ccae" stroke="#5a4a2a" stroke-width="1.5"/>
    <polygon points="-44,-8 0,-36 44,-8" fill="${fertig ? '#c9a030' : '#7a3a3a'}" stroke="#4a2a1a" stroke-width="2"/>
    ${[-30, -16, 10, 24].map((x) => `<rect x="${x}" y="0" width="6" height="30" fill="#fffaf0" stroke="#8a7a5a" stroke-width="1"/>`).join('')}
    <rect x="-6" y="12" width="12" height="22" fill="#4a2e14"/>
    <rect x="-46" y="32" width="92" height="4" fill="#bfb398"/>
    <text x="-8" y="-14" style="font-size:13px">🎓</text>`;
}
const AB_ORT = { ort: 'Prüfungsraum', im: 'im Prüfungsraum', ico: '🎓', haupt: '🎓 In den Prüfungssaal',
  sub: 'Tippe einen Prüfungsraum an, um seine Aufgaben zu sehen.', svg: AB_svgSaal };
const AB_SPRECHER = ['🎓', 'Prüferin Ada'];
const AB_S = [...S_LK, 'klasse', 'dateien'];
const AB_K = (a) => KORN({ warte: true, zielArt: 'wert', funktion: null, sprache: S_LK, ortInfo: AB_ORT, sprecher: AB_SPRECHER, ortIco: '🎓', ortName: 'Prüfungssaal', ...a });
const AB_F = (a) => AB_K({ sortArt: 'fragen', listen: [], ...a });
const AB_bild = (html) => `<div class="werkbild dsbild kbild">${html}</div>`;
const AB_code = (src) => `<pre class="mono dscode">${esc(src)}</pre>`;
const AB_tab = (kopf, zeilen, titel = '') => `<div class="dbtab">${titel ? `<div class="dbtitel">${titel}</div>` : ''}<div class="dbscroll"><table>
  <tr>${kopf.map((c) => `<th>${c}</th>`).join('')}</tr>
  ${zeilen.map((z) => `<tr>${z.map((v) => `<td>${v === null ? '–' : esc(String(v))}</td>`).join('')}</tr>`).join('')}</table></div></div>`;
const AB_datei = (name, text) => `<div class="dsdatei"><div class="dbtitel">📄 ${esc(name)}</div><pre class="mono">${esc(text)}</pre></div>`;

// --- Referenzen in JS ---
const AB_fibAufrufe = (n) => (n <= 2 ? 1 : 1 + AB_fibAufrufe(n - 1) + AB_fibAufrufe(n - 2));
const AB_baumAufrufe = (n) => (n <= 0 ? 1 : 1 + AB_baumAufrufe(n - 2) + AB_baumAufrufe(n - 1));
const AB_BUCKET = [42, 7, 93, 45, 18, 40, 71, 12];
const AB_eimer = (l) => { const e = []; for (let i = 0; i < 10; i++) e.push([]); for (const z of l) e[Math.floor(z / 10)].push(z); return e; };
const AB_sortiert = (l) => [...l].sort((a, b) => a - b);

// ============ Kapitel 130: 📝 Teil-A-Sprint (ohne Rechner) ============
const AB_HUFF = [['A', '0', 5], ['B', '10', 2], ['R', '110', 2], ['K', '1110', 1], ['D', '1111', 1]];
const AB_KOMPL_CODE = `# (1)
x = 7
while x != 0:
    x = x - 2

# (2)
for i in range(n):
    for j in range(i, n):
        zaehler = zaehler + 1

# (3)
for i in range(n):
    k = 1
    while k < n:
        k = k * 2

# (4)
def hat_doppelte(standnummern):
    n = len(standnummern)
    for i in range(n - 1):
        for j in range(i + 1, n):
            if standnummern[i] == standnummern[j]:
                return True
    return False`;

HOEFE.push(
  AB_F({ id: 'ja1', kapitel: 130, ico: '☑️', titel: 'Fünf Kreuze', lohn: 55,
    ziel: 'Teil A beginnt mit Multiple Choice (je 1 BE). Kreuzen Sie jeweils die richtige Antwort an – ohne Rechner, wie in der Prüfung.',
    story: 'Willkommen im Prüfungssaal! Ich bin Ada, ich habe schon viele Abiturarbeiten korrigiert. Hier trainieren wir genau das, was am 28.04.2027 drankommt: erst Teil A ohne Computer – 100 Minuten, 40 BE –, dann die Aufgaben am Rechner.',
    merke: { titel: '📝 Die Prüfung', text: 'Teil A (40 BE): ohne Computer, 5 Multiple-Choice-Fragen und kurze Aufgaben aus allen Lernbereichen. Teil B (40 BE) und Teil C (40 BE, Wahl C1/C2) am Prüfungsrechner: Programme, SQL, Filius, Automaten. Rechne mit etwa 2,5 Minuten je BE und achte auf den Operator: nennen, beschreiben, erläutern, ermitteln, beurteilen, überführen …' },
    fragen: [W('Welcher Komplexitätsklasse gehört Bubblesort im average case an?', ['O(log n)', 'O(n)', 'O(n · log n)', 'O(n²)'], 3),
      W('Ein Stapel ist leer. Ausgeführt wird: push(4), push(9), pop(), push(2), push(6), pop(). Welches Element liegt danach oben?', ['4', '9', '2', '6'], 2),
      W('Welcher Bus der Von-Neumann-Architektur überträgt die Nummer der Speicherzelle, auf die zugegriffen wird?', ['Datenbus', 'Adressbus', 'Steuerbus', 'USB'], 1),
      W('Ein Programm arbeitet mit nur einem Thread. Was bringt ein Prozessor mit 8 statt 4 Kernen gleicher Taktfrequenz für dieses Programm?', ['es läuft doppelt so schnell', 'es läuft kaum schneller – ein Thread nutzt nur einen Kern', 'es läuft langsamer', 'es läuft viermal so schnell'], 1),
      W('Ein Programm lernt aus 10 000 Fotos, die mit „Hund“ oder „Katze“ beschriftet sind. Welche Lernmethode ist das?', ['überwachtes Lernen', 'unüberwachtes Lernen', 'bestärkendes Lernen', 'wissensbasiertes System'], 0)],
    tipps: ['Bubblesort vergleicht im Mittel etwa n²/4-mal.', 'Stapel = LIFO: pop nimmt immer das zuletzt hineingelegte Element.', 'Gelabelte Daten (mit richtiger Antwort) = überwacht.'] }),

  AB_F({ id: 'ja2', kapitel: 130, ico: '🔢', titel: 'Zahlen von Hand', lohn: 60,
    ziel: 'Ermitteln Sie die Darstellungen von Hand. Rechnen Sie wie in Teil A ohne Taschenrechner.',
    merke: { titel: '🔢 Stellenwertsysteme', text: 'Umrechnen ins System mit Basis b: fortlaufend durch b teilen und die Reste von unten nach oben lesen. Eine Hex-Ziffer entspricht genau 4 Bit, eine Ziffer zur Basis 4 genau 2 Bit. Zweierkomplement einer negativen Zahl: Betrag binär schreiben, alle Bits umkehren, 1 addieren.', code: '237 = 1110 1101₂ = E D₁₆' },
    fragen: [{ art: 'zahl', text: 'Ermitteln Sie die Dualdarstellung (Basis 2) von 237.', soll: () => 11101101 },
      { art: 'zahl', text: 'Ermitteln Sie die Darstellung von 237 zur Basis 4.', soll: () => 3231 },
      { art: 'liste', text: 'Ermitteln Sie die Hexadezimaldarstellung von 237 (z. B. 3F).', soll: () => ['ED'] },
      { art: 'zahl', text: 'Addieren Sie schriftlich 10110110₂ + 01011101₂ (Ergebnis mit allen Stellen, auch dem Übertrag).', soll: () => 100010011 },
      W('Beide Summanden stehen im 8-Bit-Zweierkomplement. Deuten Sie das Ergebnis.', ['Überlauf – das Ergebnis ist unbrauchbar', 'richtig, 19 – der Übertrag in die 9. Stelle fällt weg: −74 + 93 = 19', 'falsch, −19', 'nicht deutbar'], 1),
      { art: 'zahl', text: 'Ermitteln Sie die 8-Bit-Zweierkomplementdarstellung von −23.', soll: () => 11101001 }],
    tipps: ['237 : 2 = 118 Rest 1, 118 : 2 = 59 Rest 0 … Reste von unten lesen.', 'Basis 4: je zwei Bits zusammenfassen: 11|10|11|01.', '−23: 23 = 00010111, umkehren: 11101000, plus 1.'] }),

  AB_F({ id: 'ja3', kapitel: 130, ico: '💾', titel: 'ABRAKADABRA: ASCII gegen Huffman', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'Gegebener Huffman-Code',
    tabelle: () => ({ html: AB_bild(`<p><b>Wort:</b> <span class="mono">ABRAKADABRA</span></p>${AB_tab(['Zeichen', 'Code'], AB_HUFF.map(([z, c]) => [z, c]))}<p class="hinweis">ASCII: 1 Zeichen = 1 Byte im Speicher.</p>`) }),
    ziel: 'Bestimmen Sie den Speicherbedarf des Wortes ABRAKADABRA in ASCII und mit dem gegebenen Huffman-Code. 2026 war das eine der häufigsten Fehlerquellen!',
    merke: { titel: '💾 Speicherbedarf', text: 'ASCII ist ein 7-Bit-Code, gespeichert wird aber jedes Zeichen in einem ganzen Byte (8 Bit). Mit einem Huffman-Code rechnet man für jedes Zeichen Anzahl · Codelänge und addiert. Typische Fehler: Bit und Byte verwechseln, mit 7 Bit rechnen, Zeichen ohne ihre Häufigkeit zählen.' },
    fragen: [{ art: 'zahl', text: 'Wie viele Byte belegt ABRAKADABRA in ASCII?', soll: () => 11 },
      W('Ein Mitschüler rechnet 11 · 7 = 77 Bit. Beurteilen Sie das.', ['richtig – ASCII hat nur sieben Bit je Zeichen', 'falsch, es sind 88 Bit – ASCII umfasst 7 Bit, belegt im Speicher aber je Zeichen 1 Byte', 'falsch, es sind 11 Bit', 'falsch, es sind 22 Byte'], 1),
      { art: 'zahl', text: 'Wie viele Bit braucht ABRAKADABRA mit dem gegebenen Huffman-Code?', soll: () => AB_HUFF.reduce((s, [, c, n]) => s + c.length * n, 0) },
      { art: 'zahl', text: 'Wie viele Bit spart der Huffman-Code gegenüber ASCII?', soll: () => 88 - AB_HUFF.reduce((s, [, c, n]) => s + c.length * n, 0) },
      { art: 'liste', text: 'Decodieren Sie die Bitfolge 1011100 (Buchstaben mit Leerzeichen getrennt).', soll: () => ['B', 'K', 'A'] },
      W('Warum kann man 1011100 eindeutig decodieren, obwohl die Codes verschieden lang sind?', ['präfixfrei – kein Code ist der Anfang eines anderen', 'A ist am häufigsten', 'die Bits sind sortiert', 'gar nicht – man braucht Trennzeichen'], 0)],
    tipps: ['A kommt 5-mal vor, B und R je 2-mal, K und D je einmal.', 'Huffman: 5·1 + 2·2 + 2·3 + 1·4 + 1·4.', 'Decodieren: von links lesen, bis ein vollständiger Code erkannt ist: 10 | 1110 | 0.'] }),

  AB_F({ id: 'ja4', kapitel: 130, ico: '⏱️', titel: 'Eigenschaften und Aufwand am Code', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Programmteile der Flohmarkt-App',
    tabelle: () => ({ html: AB_bild(AB_code(AB_KOMPL_CODE)) }),
    ziel: 'Untersuchen Sie die Programmteile (1)–(4): Ermitteln Sie Komplexitätsklassen und Vergleichsanzahlen und prüfen Sie die Algorithmeneigenschaften.',
    merke: { titel: '⏱️ Eigenschaften und Aufwand', text: 'Algorithmeneigenschaften: Allgemeinheit, Eindeutigkeit, Ausführbarkeit, Determiniertheit, Finitheit (endliche Beschreibung), Terminierung (endet nach endlich vielen Schritten). Aufwand: best, average und worst case unterscheiden; Klassen von O(1) über O(log n), O(n), O(n · log n), O(n²) bis O(2ⁿ).' },
    fragen: [W('Welche Eigenschaft verletzt Programmteil (1)?', ['Finitheit', 'Determiniertheit', 'Terminierung – x springt von 1 auf −1 und wird nie 0', 'Ausführbarkeit'], 2),
      W('Welcher Komplexitätsklasse gehört (2) an?', ['O(n)', 'O(n · log n)', 'O(n²)', 'O(2ⁿ)'], 2),
      W('Welcher Komplexitätsklasse gehört (3) an?', ['O(log n)', 'O(n²)', 'O(n · log n)', 'O(n² · log n)'], 2),
      { art: 'zahl', text: '(4) mit 6 Standnummern: Wie viele Vergleiche standnummern[i] == standnummern[j] gibt es im best case?', soll: () => 1 },
      { art: 'zahl', text: '(4) mit 6 Standnummern: … und im worst case?', soll: () => 15 },
      { art: 'zahl', text: 'Um welchen Faktor wächst die Vergleichsanzahl von (4) im worst case etwa, wenn statt 1000 nun 2000 Nummern geprüft werden?', soll: () => 4, tol: 0.03 },
      W('Ein Programm probiert alle 2ⁿ Auswahlen aus n Anfragen; 30 Anfragen dauern eine Stunde. „Mit einem doppelt so schnellen Rechner schaffen wir 60.“ Beurteilen Sie.', ['stimmt', 'stimmt nicht, nur 31 – doppelte Geschwindigkeit reicht nur für eine Anfrage mehr (2³¹ = 2 · 2³⁰)', 'stimmt nicht, es werden 45', 'stimmt fast, etwa 58'], 1)],
    tipps: ['(1): Schreiben Sie die Werte von x auf: 7, 5, 3, 1, −1 …', '(4) worst case: 5 + 4 + 3 + 2 + 1 Vergleiche – z. B. wenn es keine doppelte Nummer gibt.', 'n² verdoppeln: (2n)² = 4n².'] }),

  AB_F({ id: 'ja5', kapitel: 130, knobel: true, ico: '🎲', titel: 'Querbeet durch Teil A', lohn: 75,
    ziel: 'Gemischte Kurzaufgaben aus Logik, Rechnerarchitektur, Sicherheit und Softwareentwicklung. Ermitteln Sie, nennen Sie, entscheiden Sie.',
    fragen: [WT('Ermitteln Sie die Wahrheitstabelle von ¬(A ∧ B).', ['A', 'B'], ['not', ['and', 'A', 'B']]),
      W('Welcher Term ist nach De Morgan äquivalent zu ¬(A ∧ B)?', ['¬A ∧ ¬B', '¬A ∨ ¬B', 'A ∨ B', '¬A ∨ B'], 1),
      { art: 'zahl', text: 'Ein Adressbus ist 16 Bit breit. Wie viele Speicherzellen kann der Prozessor damit adressieren?', soll: () => 65536 },
      W('Welche Schutzziele sichert eine digitale Signatur?', ['Vertraulichkeit', 'Integrität und Authentizität', 'Verfügbarkeit', 'nur Vertraulichkeit und Verfügbarkeit'], 1),
      W('In einer Versionsverwaltung (z. B. Git) hält man einen Zwischenstand mit Beschreibung fest durch …', ['einen Commit', 'einen Merge-Konflikt', 'ein Backup auf USB', 'Strg+Z'], 0),
      W('Eine Mail „Ihr Konto wird gesperrt – sofort hier anmelden!“ mit Link auf eine fremde Domain ist typisch für …', ['Spam-Filter', 'Phishing', 'Verschlüsselung', 'ein Zertifikat'], 1)],
    tipps: ['¬(A ∧ B) ist nur 0, wenn A und B beide 1 sind.', '16 Bit → 2¹⁶ verschiedene Adressen.', 'Signatur: Wer hat es geschickt, und wurde unterwegs etwas verändert?'] }),
);

// ============ Kapitel 131: 🪆 Rekursion und Aufwand ============
const AB_FIB = `def fib(n):
    if n <= 2:
        return 1
    return fib(n - 1) + fib(n - 2)`;
const AB_KNOTEN = `def knoten(stufe):
    if stufe == 0:
        return 1
    return knoten(stufe - 1) + 1 + knoten(stufe - 1)`;
const AB_SUCHE = `def sequenziell(liste, x):
    for i in range(len(liste)):
        if liste[i] == x:          # Vergleich
            return i
    return -1

def binaer(liste, x):            # liste ist sortiert
    links = 0
    rechts = len(liste) - 1
    while links <= rechts:
        mitte = (links + rechts) // 2
        if liste[mitte] == x:      # Vergleich
            return mitte
        elif liste[mitte] < x:
            links = mitte + 1
        else:
            rechts = mitte - 1
    return -1`;

HOEFE.push(
  AB_F({ id: 'jb1', kapitel: 131, ico: '🌳', titel: 'Aufrufe zählen', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Rekursive Funktion mit doppeltem Aufruf',
    tabelle: () => ({ html: AB_bild(`${AB_code(AB_FIB)}${AB_tab(['n', '1', '2', '3', '4', '5', '6', '7'], [['Aufrufe A(n)', 1, 1, 3, 5, '?', '?', '?']])}`) }),
    ziel: 'Wie im Abitur 2026 (Teil B, 7 BE): Ermitteln Sie die Anzahl A(n) aller Aufrufe von fib (der erste Aufruf zählt mit) und daraus die Komplexität.',
    story: 'Rekursion mit doppeltem Aufruf kam 2026 dran: Aufrufe zählen, eine Gleichung finden, die O-Klasse begründen. Zeichne dir den Aufrufbaum – dann ist es reines Abzählen.',
    merke: { titel: '🌳 Aufrufe zählen', text: 'Ruft eine Funktion sich zweimal selbst auf, entsteht ein Aufrufbaum. Für die Anzahl der Aufrufe gilt dann eine Rekursionsgleichung wie A(n) = 1 + A(n − 1) + A(n − 2). Wächst A(n) bei n + 1 um einen festen Faktor, ist der Aufwand exponentiell, also O(2ⁿ) bzw. O(cⁿ).' },
    fragen: [{ art: 'zahl', text: 'Ermitteln Sie A(5).', soll: () => AB_fibAufrufe(5) },
      W('Welche Gleichung beschreibt A(n) für n > 2?', ['A(n) = A(n − 1) + A(n − 2)', 'A(n) = 1 + A(n − 1) + A(n − 2)', 'A(n) = 2 + A(n − 1) + A(n − 2)', 'A(n) = 1 + 2 · A(n − 1)'], 1),
      { art: 'zahl', text: 'Ermitteln Sie A(7).', soll: () => AB_fibAufrufe(7) },
      { art: 'zahl', text: 'Ermitteln Sie A(10).', soll: () => AB_fibAufrufe(10) },
      W('Welcher Komplexitätsklasse gehört fib an?', ['linear, O(n)', 'quadratisch, O(n²)', 'logarithmisch, O(log n)', 'exponentiell, O(2ⁿ)'], 3),
      W('Wie lässt sich der Aufwand auf O(n) senken?', ['die Abbruchbedingung auf n <= 3 ändern', 'berechnete Werte speichern – oder iterativ von unten nach oben rechnen', 'einen schnelleren Rechner nehmen', 'die Reihenfolge der Aufrufe tauschen'], 1)],
    tipps: ['A(5) = 1 + A(4) + A(3) = 1 + 5 + 3.', 'Das Muster: jede Zahl ist 1 + die beiden davor.', 'A(n) wächst je Schritt etwa um den Faktor 1,6 – das ist exponentiell.'] }),

  AB_K({ id: 'jb2v', kapitel: 131, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🔮', titel: 'Abstieg und Aufstieg', lohn: 70,
    ziel: 'Stellen Sie die Abarbeitung dar: In welcher Reihenfolge entstehen die Ausgaben? aus.append(…) steht hier für print(…).',
    merke: { titel: '🪆 Rekursiver Ab- und Aufstieg', text: 'Was VOR dem rekursiven Aufruf steht, passiert im Abstieg (von außen nach innen). Was DANACH steht, passiert erst im Aufstieg, wenn die inneren Aufrufe zurückgekehrt sind – also in umgekehrter Reihenfolge.' },
    listen: [[]], code: `def zeige(n, aus):
    if n == 0:
        return
    aus.append(n)           # Abstieg
    zeige(n - 1, aus)
    aus.append(n * 10)      # Aufstieg

def baum(n, aus):
    if n <= 0:
        return
    baum(n - 2, aus)
    aus.append(n)
    baum(n - 1, aus)

def versuch():
    a = []
    zeige(3, a)
    b = []
    baum(4, b)
    return [a, b]`,
    fragen: [{ art: 'liste', text: 'Welche Ausgaben erzeugt zeige(3, a) – in dieser Reihenfolge?', soll: (l) => l.wert[0] },
      W('Welche Ausgaben von zeige entstehen im rekursiven Aufstieg?', ['3, 2, 1', '10, 20, 30', '30, 20, 10', '1, 2, 3'], 1),
      { art: 'liste', text: 'Welche Ausgaben erzeugt baum(4, b)?', soll: (l) => l.wert[1] },
      { art: 'zahl', text: 'Wie oft wird baum für baum(4, b) insgesamt aufgerufen (der erste Aufruf zählt mit)?', soll: () => AB_baumAufrufe(4) }],
    tipps: ['zeige: erst 3, 2, 1 auf dem Weg nach innen, dann rückwärts 10, 20, 30.', 'baum(4): zuerst baum(2) komplett, dann 4, dann baum(3) komplett.', 'baum(2) liefert 2, 1 – baum(3) liefert 1, 3, 2, 1.'] }),

  AB_F({ id: 'jb3', kapitel: 131, ico: '🪣', titel: 'Bucketsort von Hand', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'Liste und Eimer',
    tabelle: () => ({ html: AB_bild(`<p class="mono">liste = ${py(AB_BUCKET)}</p>${AB_tab(['Eimer', ...Array.from({ length: 10 }, (_, i) => String(i))], [['Zahlen', ...Array.from({ length: 10 }, (_, i) => `${i * 10}–${i * 10 + 9}`)]])}`) }),
    ziel: 'Wie im Abitur 2025 (Teil B): Führen Sie Bucketsort von Hand durch. Zahlen von 0 bis 99, zehn Eimer, Eimer i bekommt die Zahlen mit zahl // 10 == i.',
    merke: { titel: '🪣 Bucketsort', text: 'Bucketsort verteilt die Zahlen nach ihrem Wertebereich auf Eimer (Buckets), sortiert jeden Eimer einzeln (z. B. mit Insertionsort) und hängt die Eimer der Reihe nach aneinander. Sind die Zahlen gleichmäßig verteilt, ist das fast linear; landen alle in einem Eimer, hilft das Verteilen nichts.' },
    fragen: [{ art: 'liste', text: 'Welche Zahlen liegen nach dem Verteilen in Eimer 4 (in der Reihenfolge des Einfügens)?', soll: () => AB_eimer(AB_BUCKET)[4] },
      { art: 'zahl', text: 'Wie viele Eimer bleiben leer?', soll: () => AB_eimer(AB_BUCKET).filter((e) => !e.length).length },
      { art: 'liste', text: 'Geben Sie die sortierte Liste an.', soll: () => AB_sortiert(AB_BUCKET) },
      W('Wann ist Bucketsort besonders langsam?', ['wenn die Zahlen gleichmäßig verteilt sind', 'wenn fast alle Zahlen in denselben Eimer fallen', 'wenn die Liste schon sortiert ist', 'wenn die Liste viele verschiedene Zahlen enthält'], 1)],
    tipps: ['42 // 10 = 4, 45 // 10 = 4, 40 // 10 = 4.', 'Belegt sind die Eimer 0, 1, 4, 7 und 9.', 'Eimer einzeln sortieren und hintereinanderhängen.'] }),

  AB_K({ id: 'jb4', fertig: true, kapitel: 131, sortArt: 'funktion', ico: '🐍', titel: 'Bucketsort implementieren', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Anforderungen',
    tabelle: () => ({ html: AB_bild(`<p><b>verteilen(liste)</b> → Liste mit 10 Eimern (Listen), Zahlen in der Reihenfolge der Eingabe</p><p><b>bucketsort(liste)</b> → neue, aufsteigend sortierte Liste; nutzt verteilen</p><p class="mono">verteilen(${py(AB_BUCKET)})\n→ ${py(AB_eimer(AB_BUCKET))}</p>`) }),
    ziel: 'Implementieren Sie verteilen(liste) und bucketsort(liste) für ganze Zahlen von 0 bis 99. Jeden Eimer dürfen Sie mit sorted() sortieren.',
    vorspann: `def _t1():\n    return verteilen(${py(AB_BUCKET)})\n\ndef _t2():\n    return bucketsort(${py(AB_BUCKET)})\n\ndef _t3():\n    return bucketsort([5, 3, 99, 0, 50, 55, 51])\n\ndef _t4():\n    return bucketsort([])\n`,
    ...tests([AB_eimer(AB_BUCKET), AB_sortiert(AB_BUCKET), [0, 3, 5, 50, 51, 55, 99], []]), testName: (k) => ['verteilen', 'bucketsort', 'bucketsort mit 0 und 99', 'leere Liste'][k],
    befehle: [K_B('def verteilen(liste):'), K_B('range(10)'), K_B('// 10'), K_B('.append(¦)'), K_B('def bucketsort(liste):'), K_B('sorted(¦)')],
    tipps: ['Zehn leere Eimer: eimer = [], dann zehnmal eimer.append([]).', 'Die Eimernummer ist zahl // 10.', 'bucketsort: für jeden Eimer e aus verteilen(liste) die Zahlen aus sorted(e) an ergebnis anhängen.'],
    loesung: `def verteilen(liste):
    eimer = []
    for i in range(10):
        eimer.append([])
    for zahl in liste:
        eimer[zahl // 10].append(zahl)
    return eimer

def bucketsort(liste):
    ergebnis = []
    for e in verteilen(liste):
        for zahl in sorted(e):
            ergebnis.append(zahl)
    return ergebnis` }),

  AB_F({ id: 'jb5', kapitel: 131, ico: '🔎', titel: 'Sequenziell oder binär?', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'Zwei Suchverfahren',
    tabelle: () => ({ html: AB_bild(AB_code(AB_SUCHE)) }),
    ziel: 'Vergleichen Sie sequenzielle und binäre Suche in einer Liste mit n = 1000 Einträgen. Gezählt werden die Vergleiche liste[…] == x.',
    merke: { titel: '🔎 Suchen', text: 'Sequenzielle Suche: best case 1 Vergleich, worst case n, average case etwa n/2 – O(n). Binäre Suche halbiert den Suchbereich in jedem Schritt und braucht höchstens ⌊log₂ n⌋ + 1 Durchläufe – O(log n). Voraussetzung: Die Liste ist sortiert.' },
    fragen: [{ art: 'zahl', text: 'Sequenzielle Suche, n = 1000: Vergleiche im best case?', soll: () => 1 },
      { art: 'zahl', text: 'Sequenzielle Suche, n = 1000: Vergleiche im worst case?', soll: () => 1000 },
      { art: 'zahl', text: 'Sequenzielle Suche, n = 1000: Vergleiche im average case (gesuchter Wert ist enthalten, etwa)?', soll: () => 500, tol: 0.01 },
      { art: 'zahl', text: 'Binäre Suche, n = 1000: höchstens wie viele Durchläufe der while-Schleife?', soll: () => 10 },
      { art: 'zahl', text: 'Binäre Suche, n = 1 000 000: höchstens wie viele Durchläufe?', soll: () => 20 },
      W('Die Liste wird nur einmal durchsucht und ist unsortiert. Beurteilen Sie: „Erst sortieren, dann binär suchen ist schneller.“', ['stimmt immer', 'stimmt nicht – Sortieren kostet mindestens O(n · log n), einmal sequenziell suchen nur O(n)', 'stimmt, weil binär O(log n) ist', 'egal'], 1)],
    tipps: ['2¹⁰ = 1024 ≥ 1000.', '2²⁰ ≈ 1 000 000.', 'Im Mittel liegt der gesuchte Wert in der Mitte.'] }),

  AB_K({ id: 'jb6', kapitel: 131, sortArt: 'funktion', knobel: true, rekursiv: 'knoten_schnell', ico: '⚡', titel: 'Der schnelle Lichtbaum', lohn: 85, ansicht: 'tabelle', titelAnsicht: 'Langsame Fassung',
    tabelle: () => ({ html: AB_bild(`${AB_code(AB_KNOTEN)}<p class="hinweis">knoten(20) braucht so über 2 Millionen Aufrufe.</p>`) }),
    ziel: 'Implementieren Sie knoten_schnell(stufe): dasselbe Ergebnis wie knoten, aber rekursiv mit nur EINEM rekursiven Aufruf je Aufruf. Getestet wird auch Stufe 20.',
    listen: [[], [], []], aufrufFn: (l, k) => `knoten_schnell(${[0, 2, 20][k]})`, soll: (l, k) => 2 ** ([0, 2, 20][k] + 1) - 1, testName: (k) => `Stufe ${[0, 2, 20][k]}`,
    befehle: [K_B('def knoten_schnell(stufe):')],
    tipps: ['Beide rekursiven Aufrufe berechnen genau dasselbe.', 'Speichern Sie knoten_schnell(stufe - 1) in einer Variablen teil und nutzen Sie sie zweimal.', 'Dann gibt es nur noch stufe + 1 Aufrufe: O(n). Meldet Stufe 20 „zu viele Schritte“, rufen Sie noch zweimal auf.'],
    loesung: `def knoten_schnell(stufe):
    if stufe == 0:
        return 1
    teil = knoten_schnell(stufe - 1)
    return teil + 1 + teil` }),
);

// ============ Kapitel 132: 🤖 Automat und Grammatik ============
const AB_AU1 = { zustaende: ['q0', 'q1', 'q2'], start: 'q0', alphabet: ['0', '1'], ende: ['q2'], delta: { q0: { 0: 'q1', 1: 'q0' }, q1: { 0: 'q1', 1: 'q2' }, q2: { 0: 'q2', 1: 'q2' } } };
const AB_AU2 = { zustaende: ['S', 'A', 'B', 'F'], start: 'S', alphabet: ['a', 'b'], ende: ['B'], delta: { S: { a: 'A', b: 'F' }, A: { a: 'A', b: 'B' }, B: { a: 'A', b: 'B' }, F: { a: 'F', b: 'F' } } };
const AB_au1Wort = (w) => w.includes('01');
// Syntaxdiagramme Haus und Raumnummer
function AB_syntaxBild() {
  const pf = 'marker-end="url(#abPfeil)"';
  const nt = (x, y, t) => `<rect x="${x}" y="${y - 13}" width="62" height="26" fill="#fdf8e8" stroke="#3a2c10" stroke-width="2"/><text x="${x + 31}" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="700">${t}</text>`;
  const te = (x, y, t) => `<rect x="${x}" y="${y - 13}" width="30" height="26" rx="13" fill="#e8f0ff" stroke="#2c3d78" stroke-width="2"/><text x="${x + 15}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#2c3d78">${t}</text>`;
  const l = (d, pfeil = false) => `<path d="${d}" fill="none" stroke="#3a2c10" stroke-width="1.8" ${pfeil ? pf : ''}/>`;
  return `<svg class="dssvg" viewBox="0 0 470 210" style="max-width:640px" font-family="system-ui">
    <defs><marker id="abPfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#3a2c10"/></marker></defs>
    <text x="6" y="18" font-size="13" font-weight="700">Haus</text>
    ${l('M10,40 H40')}${l('M40,40 H70', true)}${te(70, 40, 'A')}${l('M100,40 H140')}
    ${l('M40,40 Q48,40 48,56 V64 Q48,72 60,72 H70', true)}${te(70, 72, 'B')}${l('M100,72 H120 Q132,72 132,60 V50 Q132,40 140,40')}${l('M140,40 H170', true)}
    <line x1="170" y1="32" x2="170" y2="48" stroke="#3a2c10" stroke-width="2"/>
    <text x="6" y="118" font-size="13" font-weight="700">Raum</text>
    ${l('M10,145 H30', true)}${nt(30, 145, 'Haus')}${l('M92,145 H110', true)}${te(110, 145, '.')}${l('M140,145 H170', true)}${nt(170, 145, 'Ziffer')}
    ${l('M232,145 H262')}${l('M250,145 Q258,145 258,160 V170 Q258,184 244,184 H170 Q156,184 156,170 V160 Q156,145 166,145', true)}
    ${l('M262,145 H300', true)}${te(300, 145, 'w')}${l('M330,145 H380', true)}
    ${l('M276,145 Q284,145 284,130 V122 Q284,110 296,110 H336 Q350,110 350,122 V130 Q350,145 360,145')}
    <line x1="380" y1="137" x2="380" y2="153" stroke="#3a2c10" stroke-width="2"/>
    <text x="300" y="200" font-size="11" fill="#5a4a2a">Rechteck = Nichtterminal · rund = Terminal · Ziffer = 0 … 9</text></svg>`;
}
const AB_GRAMM = `E → E + T | T
T → T * F | F
F → ( E ) | a`;

HOEFE.push(
  AB_F({ id: 'jc1', kapitel: 132, ico: '📋', titel: 'Vom Graphen zur Tabelle', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Übergangsgraph eines DEA',
    tabelle: () => ({ html: AB_bild(`${svgAutomat(AB_AU1)}<p class="hinweis">Startzustand q0 (Pfeil), Endzustand q2 (Doppelkreis).</p>`) }),
    ziel: 'Überführen Sie den Übergangsgraphen in eine Übergangstabelle (Baukasten: für jeden Zustand und jedes Zeichen den Folgezustand wählen, Endzustand ankreuzen) und beschreiben Sie die akzeptierte Sprache.',
    story: 'Fast jede Prüfung hatte in Teil A einen Automaten mit Grammatik: Tabelle → Graph, Graph → Grammatik, Fangzustand, Wort ableiten. Das üben wir jetzt hintereinander.',
    merke: { titel: '🤖 DEA', text: 'Ein deterministischer endlicher Automat besteht aus Zuständen, Alphabet, Übergangsfunktion δ, Startzustand und Endzuständen. Tabelle und Übergangsgraph enthalten dieselbe Information: Jede Zelle δ(z, c) wird ein Pfeil von z nach δ(z, c) mit der Beschriftung c.' },
    fragen: [{ art: 'automat', text: 'Füllen Sie die Übergangstabelle nach dem Graphen links aus.', zustaende: ['q0', 'q1', 'q2'], alphabet: ['0', '1'], ziel: AB_au1Wort, maxLaenge: 6, beispiel: '1001',
      loesung: { ende: ['q2'], delta: AB_AU1.delta } },
      W('Beschreiben Sie die Sprache des Automaten.', ['alle Wörter, die mit 01 enden', 'alle Wörter, die das Teilwort 01 enthalten', 'alle Wörter, in denen nach jeder 0 eine 1 steht', 'alle Wörter, die mit 0 beginnen und eine 1 enthalten'], 1),
      { art: 'zahl', text: 'Wie viele Wörter der Länge 3 akzeptiert der Automat?', soll: () => alleWoerter(['0', '1'], 3).filter((w) => w.length === 3 && AB_au1Wort(w)).length }],
    tipps: ['Jeder Pfeil von z nach z′ mit Zeichen c wird zur Zelle „Zeile z, Spalte c: z′“. Schleifen zeigen auf den Zustand selbst.', 'q2 kann man nicht mehr verlassen – was muss man gelesen haben, um dorthin zu kommen?', 'Länge 3: 001, 010, 011, 101 …'] }),

  AB_F({ id: 'jc2', kapitel: 132, ico: '📜', titel: 'Vom Graphen zur Grammatik', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Übergangsgraph mit Fangzustand F',
    tabelle: () => ({ html: AB_bild(svgAutomat(AB_AU2, { fang: 'F' })) }),
    ziel: 'Überführen Sie den Automaten in eine reguläre Grammatik mit Startsymbol S. Entscheiden Sie, welche Regeln dazugehören.',
    merke: { titel: '📜 Automat → Grammatik', text: 'Jeder Zustand wird ein Nichtterminal, der Startzustand das Startsymbol. Aus jedem Übergang X –c→ Y wird die Regel X → cY; führt er in einen Endzustand, kommt zusätzlich X → c dazu. Für den Fangzustand braucht man kein Nichtterminal – aus ihm entsteht nie ein gültiges Wort.' },
    fragen: [W('Welche Regel gehört NICHT in die Grammatik?', ['S → aA', 'A → bB', 'S → bF', 'B → aA'], 2),
      W('Welche Regeln hat das Nichtterminal A?', ['A → aA | bB', 'A → aA | bB | b', 'A → aB | bA | a', 'A → bB | b'], 1),
      W('Welches Wort lässt sich ableiten?', ['baab', 'aba', 'abab', 'abba'], 2),
      { art: 'zahl', text: 'Wie viele Ableitungsschritte braucht S ⇒ … ⇒ aab?', soll: () => 3 },
      W('Beschreiben Sie die Sprache.', ['alle Wörter mit gleich vielen a und b', 'alle Wörter, die mit a beginnen und mit b enden', 'alle Wörter, die mit b beginnen und mit a enden', 'alle Wörter, die mit a beginnen und ab enthalten'], 1)],
    tipps: ['F ist kein Endzustand und man kommt nie wieder heraus.', 'A hat Pfeile nach A (a) und nach B (b); B ist Endzustand → zusätzlich A → b.', 'S ⇒ aA ⇒ aaA ⇒ aab'] }),

  AB_F({ id: 'jc3', kapitel: 132, ico: '🚦', titel: 'Syntaxdiagramm lesen', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Raumnummern im Schulhaus',
    tabelle: () => ({ html: AB_bild(AB_syntaxBild()) }),
    ziel: 'Die Raumnummern einer Schule sind durch Syntaxdiagramme festgelegt. Entscheiden Sie, welche Wörter gültig sind, und ermitteln Sie Anzahlen.',
    merke: { titel: '🚦 Syntaxdiagramm', text: 'Ein Syntaxdiagramm liest man in Pfeilrichtung von links nach rechts. Rechtecke sind Nichtterminale (eigene Diagramme), runde Kästen Terminale. Ein Rückweg bedeutet Wiederholung { … }, ein Umweg darum herum „optional“ [ … ], Verzweigungen sind Alternativen ( … | … ).' },
    fragen: [W('Welche Raumnummer ist gültig?', ['A12w', 'B.3w', 'A.w1', 'C.1w'], 1),
      W('Welche Raumnummer ist NICHT gültig?', ['A.105', 'B.7', 'A.1ww', 'B.30w'], 2),
      W('Welche EBNF-Regel entspricht dem Diagramm Raum?', ['Raum = Haus "." Ziffer [ Ziffer ] { "w" }', 'Raum = Haus "." Ziffer { Ziffer } [ "w" ]', 'Raum = Haus { "." Ziffer } "w"', 'Raum = { Haus } "." Ziffer'], 1),
      { art: 'zahl', text: 'Ermitteln Sie, wie viele gültige Raumnummern genau 4 Zeichen lang sind.', soll: () => 2 * 10 * 10 + 2 * 10 }],
    tipps: ['Haus ist nur A oder B. Nach dem Punkt muss mindestens eine Ziffer kommen.', 'Das w darf höchstens einmal am Ende stehen.', '4 Zeichen: Haus . Ziffer Ziffer – oder Haus . Ziffer w.'] }),

  AB_F({ id: 'jc4', kapitel: 132, ico: '🌲', titel: 'Der Ableitungsbaum', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Kontextfreie Grammatik, Startsymbol E',
    tabelle: () => ({ html: AB_bild(`${AB_code(AB_GRAMM)}<div class="dbtab"><div class="dbscroll"><table>${['E → E + T', 'E → T', 'T → T * F', 'T → F', 'F → ( E )', 'F → a'].map((r, i) => `<tr><th>R${i + 1}</th><td class="mono">${esc(r)}</td></tr>`).join('')}</table></div></div><p><b>Wort:</b> <span class="mono">(a+a)*a</span></p>`) }),
    ziel: 'Stellen Sie den Ableitungsbaum für das Wort (a+a)*a dar – auf Papier, und hier über die Linksableitung (immer das am weitesten links stehende Nichtterminal ersetzen).',
    merke: { titel: '🌲 Ableitungsbaum', text: 'Die Wurzel ist das Startsymbol, jeder innere Knoten ein Nichtterminal mit der angewendeten Regel, die Blätter von links nach rechts ergeben das Wort. Jeder innere Knoten ist genau eine Regelanwendung. Was tiefer im Baum steht, wird zuerst ausgewertet – so legt die Grammatik fest, dass * stärker bindet als +.' },
    fragen: [{ art: 'liste', text: 'Geben Sie die Linksableitung von (a+a)*a als Folge der Regelnummern an (z. B. 2 3 4 …).', soll: () => [2, 3, 4, 5, 1, 2, 4, 6, 4, 6, 6] },
      { art: 'liste', text: 'Welche Satzform steht nach den ersten fünf Ableitungsschritten da? (ohne Leerzeichen, z. B. T*F)', soll: () => ['(E+T)*F'] },
      { art: 'zahl', text: 'Wie viele Blätter (Terminalzeichen) hat der Baum?', soll: () => '(a+a)*a'.length },
      { art: 'zahl', text: 'Wie viele Regelanwendungen (innere Knoten) hat der Baum?', soll: () => 11 },
      { ...W('Welche Art von Grammatik ist das?', ['regulär (Typ 3)', 'kontextfrei (Typ 2), aber nicht regulär', 'kontextsensitiv (Typ 1), aber nicht kontextfrei', 'gar keine'], 1),
        erklaerung: 'Musterantwort zum Vergleich mit Ihrer Skizze: E → T; T → T * F; links T → F → ( E ), darin E → E + T mit E → T → F → a und T → F → a; rechts F → a. Die Blätter von links nach rechts ergeben ( a + a ) * a. Die Grammatik ist kontextfrei (links steht immer genau ein Nichtterminal), aber nicht regulär, weil beliebig tief geschachtelte Klammern zueinander passen müssen.' }],
    tipps: ['Ganz oben steht ein * – das gibt es nur in T → T * F. Vorher muss aus E ein T werden (R2).', 'E ⇒ T ⇒ T*F ⇒ F*F ⇒ (E)*F ⇒ (E+T)*F ⇒ …', 'Jede angewendete Regel ist ein innerer Knoten des Baums: so viele Regelnummern, so viele innere Knoten.'] }),

  AB_F({ id: 'jc5', kapitel: 132, ico: '🔐', titel: 'Das Zahlenschloss 3-1-4', lohn: 70,
    ziel: 'Entwerfen Sie einen vollständigen DEA für ein Zahlenschloss: Es öffnet genau bei der Eingabe 314. Jede falsche Ziffer (und jede Ziffer nach dem Öffnen) führt in den Fangzustand f.',
    merke: { titel: '🕳️ Vollständiger DEA', text: 'In einem vollständigen DEA hat jeder Zustand für jedes Zeichen genau einen Übergang. Kann ein Wort nicht mehr gültig werden, geht es in den Fangzustand: kein Endzustand, alle Übergänge führen zu ihm selbst.' },
    fragen: [{ art: 'automat', text: 'Schloss 3-1-4. s = Start, z3 = „3 gelesen“, z31 = „31 gelesen“, auf = offen, f = Fangzustand.', zustaende: ['s', 'z3', 'z31', 'auf', 'f'], alphabet: ['1', '3', '4'], ziel: (w) => w === '314', maxLaenge: 5, beispiel: '314',
      loesung: { ende: ['auf'], delta: { s: { 1: 'f', 3: 'z3', 4: 'f' }, z3: { 1: 'z31', 3: 'f', 4: 'f' }, z31: { 1: 'f', 3: 'f', 4: 'auf' }, auf: { 1: 'f', 3: 'f', 4: 'f' }, f: { 1: 'f', 3: 'f', 4: 'f' } } } },
      { art: 'zahl', text: 'Wie viele Übergänge hat der vollständige DEA?', soll: () => 5 * 3 }],
    tipps: ['Nur die richtige Ziffer führt weiter, alles andere nach f.', 'Auch von auf aus geht jede weitere Ziffer nach f – 3141 öffnet nicht.', '5 Zustände · 3 Zeichen.'] }),

  AB_F({ id: 'jc6', kapitel: 132, knobel: true, ico: '🧠', titel: 'Das geduldige Schloss', lohn: 85,
    ziel: 'Das neue Schloss vergisst Fehleingaben: Es ist offen, sobald die letzten drei Ziffern 3, 1, 4 waren. Entwerfen Sie den DEA (Zustand = wie viel vom Code zuletzt passt).',
    fragen: [{ art: 'automat', text: 'Endet auf 314. s = nichts passt, z3 = „…3“, z31 = „…31“, z314 = offen.', zustaende: ['s', 'z3', 'z31', 'z314'], alphabet: ['1', '3', '4'], ziel: (w) => w.endsWith('314'), maxLaenge: 6, beispiel: '33314',
      loesung: { ende: ['z314'], delta: { s: { 1: 's', 3: 'z3', 4: 's' }, z3: { 1: 'z31', 3: 'z3', 4: 's' }, z31: { 1: 's', 3: 'z3', 4: 'z314' }, z314: { 1: 's', 3: 'z3', 4: 's' } } } }],
    tipps: ['Eine 3 ist immer ein möglicher Neuanfang – von jedem Zustand mit 3 nach z3.', 'z3 mit 3: „33“ – das letzte Zeichen ist wieder ein Anfang, also z3.', 'Von z314 aus: 3 → z3, sonst → s.'] }),
);

// ============ Kapitel 133: 🎵 Datenbank-Szenario Musikschule ============
const AB_DB = {
  schema: {
    lehrkraft: [['id', 'INTEGER PRIMARY KEY'], ['name', 'TEXT'], ['fach', 'TEXT']],
    schueler: [['id', 'INTEGER PRIMARY KEY'], ['name', 'TEXT'], ['jahrgang', 'INTEGER']],
    kurs: [['id', 'INTEGER PRIMARY KEY'], ['titel', 'TEXT'], ['lehrkraft_id', 'INTEGER'], ['gebuehr', 'INTEGER']],
    belegung: [['id', 'INTEGER PRIMARY KEY'], ['schueler_id', 'INTEGER'], ['kurs_id', 'INTEGER']],
  },
  daten: (v) => (v === 'A' ? {
    lehrkraft: [[1, 'Frau Berger', 'Klavier'], [2, 'Herr Ahmadi', 'Gitarre'], [3, 'Frau Chen', 'Geige'], [4, 'Herr Dietrich', 'Schlagzeug']],
    schueler: [[1, 'Lena', 2010], [2, 'Max', 2011], [3, 'Sophie', 2009], [4, 'Paul', 2012], [5, 'Mia', 2010], [6, 'Ben', 2011], [7, 'Emma', 2013]],
    kurs: [[1, 'Klavier Anfänger', 1, 45], [2, 'Klavier Fortgeschrittene', 1, 60], [3, 'Gitarrenband', 2, 35], [4, 'Geigenensemble', 3, 40], [5, 'Trommelgruppe', 4, 30], [6, 'Gitarre Solo', 2, 55]],
    belegung: [[1, 1, 1], [2, 1, 4], [3, 2, 3], [4, 3, 2], [5, 3, 4], [6, 4, 5], [7, 5, 1], [8, 5, 3], [9, 6, 3], [10, 6, 5], [11, 7, 1], [12, 2, 5]],
  } : {
    lehrkraft: [[1, 'Frau Berger', 'Klavier'], [2, 'Herr Ahmadi', 'Gitarre'], [3, 'Frau Chen', 'Geige'], [4, 'Herr Dietrich', 'Schlagzeug'], [5, 'Frau Esposito', 'Gesang']],
    schueler: [[1, 'Lena', 2010], [2, 'Max', 2011], [3, 'Sophie', 2009], [4, 'Paul', 2012], [5, 'Mia', 2010], [6, 'Ben', 2011], [7, 'Emma', 2013], [8, 'Noah', 2012], [9, 'Lea', 2014]],
    kurs: [[1, 'Klavier Anfänger', 1, 50], [2, 'Klavier Fortgeschrittene', 1, 65], [3, 'Gitarrenband', 2, 35], [4, 'Geigenensemble', 3, 45], [5, 'Trommelgruppe', 4, 30], [6, 'Gitarre Solo', 2, 55], [7, 'Chor', 5, 25]],
    belegung: [[1, 1, 1], [2, 1, 4], [3, 2, 3], [4, 3, 2], [5, 3, 4], [6, 4, 5], [7, 5, 1], [8, 5, 7], [9, 6, 3], [10, 6, 5], [11, 7, 4], [12, 8, 7], [13, 9, 7], [14, 8, 6], [15, 2, 2]],
  }),
};
const AB_SQL = (a) => AUFTRAG({ db: AB_DB, ortInfo: AB_ORT, tabellen: ['schueler', 'belegung', 'kurs', 'lehrkraft'], ...a });
const AB_CREATE = `CREATE TABLE lehrkraft (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  fach TEXT
);
CREATE TABLE schueler (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  jahrgang INTEGER
);
CREATE TABLE kurs (
  id INTEGER PRIMARY KEY,
  titel TEXT NOT NULL,
  lehrkraft_id INTEGER NOT NULL REFERENCES lehrkraft(id),
  gebuehr INTEGER
);
CREATE TABLE belegung (
  id INTEGER PRIMARY KEY,
  schueler_id INTEGER NOT NULL REFERENCES schueler(id),
  kurs_id INTEGER NOT NULL REFERENCES kurs(id)
);`;

HOEFE.push(
  AB_SQL({ id: 'jd1', kapitel: 133, ico: '🎹', titel: 'Wer lernt Klavier?', lohn: 65,
    ziel: 'Ermitteln Sie mit SQL die Namen aller Schülerinnen und Schüler, die den Kurs „Klavier Anfänger“ belegen. Verbinden Sie dazu drei Tabellen mit INNER JOIN.',
    story: 'Datenbanken kommen in jeder Prüfung vor – 2026 hatten viele Prüflinge Mühe mit Aggregation und dem Relationenmodell. Unser Szenario: die Musikschule mit Lehrkräften, Kursen und Belegungen.',
    sprecher: AB_SPRECHER,
    merke: { titel: '🎵 Die Musikschule', text: 'belegung verbindet schueler und kurs (n:m-Beziehung), kurs verweist mit lehrkraft_id auf lehrkraft (1:n). Über mehrere Tabellen fragt man mit mehreren INNER JOIN ab, jeweils Fremdschlüssel = Primärschlüssel.', code: 'SELECT …\nFROM tabelle_a\nINNER JOIN tabelle_b ON tabelle_b.a_id = tabelle_a.id\nINNER JOIN tabelle_c ON tabelle_b.c_id = tabelle_c.id\nWHERE …' },
    muss: [/\bjoin\b/i, 'Verbinden Sie die Tabellen mit INNER JOIN … ON …'],
    befehle: [Q('SELECT … FROM schueler'), Q('INNER JOIN … ON …'), Q("WHERE kurs.titel = '…'")],
    tipps: ['Der Weg: schueler → belegung → kurs.', 'Zwei JOINs: belegung.schueler_id = schueler.id und belegung.kurs_id = kurs.id.', "Zum Schluss WHERE kurs.titel = 'Klavier Anfänger'."],
    loesung: "SELECT schueler.name FROM schueler INNER JOIN belegung ON belegung.schueler_id = schueler.id INNER JOIN kurs ON belegung.kurs_id = kurs.id WHERE kurs.titel = 'Klavier Anfänger'" }),

  AB_SQL({ id: 'jd2', kapitel: 133, ico: '👥', titel: 'Volle Kurse', lohn: 70,
    ziel: 'Ermitteln Sie für jeden Kurs mit mindestens 3 Belegungen den Titel und die Anzahl der Belegungen.',
    sprecher: AB_SPRECHER,
    merke: { titel: '🧮 GROUP BY und HAVING', text: 'GROUP BY bildet Gruppen gleicher Werte, Aggregatfunktionen (COUNT, SUM, AVG, MIN, MAX) rechnen je Gruppe. WHERE filtert Zeilen vor dem Gruppieren, HAVING filtert danach ganze Gruppen – nur dort darf eine Aggregatfunktion in der Bedingung stehen.', code: 'SELECT lehrkraft_id, COUNT(*)\nFROM kurs\nGROUP BY lehrkraft_id\nHAVING COUNT(*) > 1' },
    muss: [/\bhaving\b/i, 'Die Bedingung „mindestens 3“ betrifft die Gruppe – also HAVING.'],
    befehle: [Q('COUNT(*)'), Q('INNER JOIN … ON …'), Q('GROUP BY …'), Q('HAVING …')],
    tipps: ['Erst belegung und kurs verbinden, damit der Titel da ist.', 'Gruppieren nach dem Kurs, zählen mit COUNT(*).', 'HAVING COUNT(*) >= 3'],
    loesung: 'SELECT kurs.titel, COUNT(*) FROM belegung INNER JOIN kurs ON belegung.kurs_id = kurs.id GROUP BY kurs.id HAVING COUNT(*) >= 3' }),

  AB_SQL({ id: 'jd3', kapitel: 133, ico: '💶', titel: 'Teurer als der Durchschnitt', lohn: 70, tabellen: ['kurs'],
    ziel: 'Ermitteln Sie Titel und Gebühr aller Kurse, deren Gebühr über der durchschnittlichen Gebühr aller Kurse liegt. Verwenden Sie eine Unterabfrage.',
    sprecher: AB_SPRECHER,
    merke: { titel: '🪆 Unterabfrage', text: 'Eine Unterabfrage steht in Klammern und liefert hier einen einzigen Wert, mit dem man vergleichen kann. Man braucht sie, weil eine Aggregatfunktion nicht direkt in WHERE stehen darf.', code: 'SELECT name\nFROM schueler\nWHERE jahrgang < (SELECT MAX(jahrgang) FROM schueler)' },
    muss: [/\(\s*select\b/i, 'Berechnen Sie den Durchschnitt in einer Unterabfrage: ( SELECT AVG(…) FROM … ).'],
    befehle: [Q('SELECT … FROM kurs'), Q('WHERE … > ( … )'), Q('AVG(…)')],
    tipps: ['WHERE gebuehr > AVG(gebuehr) ist verboten.', 'Die Unterabfrage: (SELECT AVG(gebuehr) FROM kurs).'],
    loesung: 'SELECT titel, gebuehr FROM kurs WHERE gebuehr > (SELECT AVG(gebuehr) FROM kurs)' }),

  AB_SQL({ id: 'jd4', kapitel: 133, knobel: true, ico: '💰', titel: 'Einnahmen je Lehrkraft', lohn: 85,
    ziel: 'Ermitteln Sie für jede Lehrkraft den Namen und die monatlichen Einnahmen (Summe der Gebühren aller Belegungen ihrer Kurse), die höchsten zuerst.',
    sprecher: AB_SPRECHER,
    befehle: [Q('SUM(…)'), Q('INNER JOIN … ON …'), Q('GROUP BY …'), Q('ORDER BY … DESC')],
    tipps: ['Jede Belegung bringt die Gebühr ihres Kurses – also von belegung ausgehen.', 'Zwei JOINs: belegung → kurs → lehrkraft, dann GROUP BY lehrkraft.id.', 'ORDER BY SUM(kurs.gebuehr) DESC'],
    loesung: 'SELECT lehrkraft.name, SUM(kurs.gebuehr) FROM belegung INNER JOIN kurs ON belegung.kurs_id = kurs.id INNER JOIN lehrkraft ON kurs.lehrkraft_id = lehrkraft.id GROUP BY lehrkraft.id ORDER BY SUM(kurs.gebuehr) DESC' }),
);
HOEFE.push(
  AB_F({ id: 'jd5', kapitel: 133, ico: '🧹', titel: 'Die alte Anmeldeliste', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Anmeldung(schueler_id, kurs_id, schuelername, kurstitel, lehrkraft, fach)',
    tabelle: () => ({ html: AB_bild(AB_tab(['<u>schueler_id</u>', '<u>kurs_id</u>', 'schuelername', 'kurstitel', 'lehrkraft', 'fach'],
      [[1, 1, 'Lena', 'Klavier Anfänger', 'Frau Berger', 'Klavier'], [1, 4, 'Lena', 'Geigenensemble', 'Frau Chen', 'Geige'], [5, 1, 'Mia', 'Klavier Anfänger', 'Frau Berger', 'Klavier'], [4, 5, 'Paul', 'Trommelgruppe', 'Herr Dietrich', 'Schlagzeug']], 'Primärschlüssel: (schueler_id, kurs_id)')) }),
    ziel: 'Die Musikschule hat ihre Anmeldungen früher in einer einzigen Tabelle geführt. Erläutern Sie die Probleme und überführen Sie die Tabelle in die 3. Normalform.',
    merke: { titel: '🧹 Normalformen', text: '1NF: jede Zelle ein atomarer Wert. 2NF: jedes Nicht-Schlüsselattribut hängt vom ganzen Primärschlüssel ab. 3NF: kein Nicht-Schlüsselattribut hängt von einem anderen Nicht-Schlüsselattribut ab (keine transitive Abhängigkeit). Sonst drohen Einfüge-, Änderungs- und Löschanomalien.' },
    fragen: [W('Wovon hängt schuelername ab?', ['vom ganzen Schlüssel (schueler_id, kurs_id)', 'nur von schueler_id – Teil des Schlüssels, Verstoß gegen die 2NF', 'von kurstitel', 'von nichts'], 1),
      W('fach hängt von lehrkraft ab, lehrkraft von kurs_id. Das ist …', ['eine transitive Abhängigkeit – Verstoß gegen die 3NF', 'in Ordnung, weil fach kein Schlüssel ist', 'ein Verstoß gegen die 1NF', 'ein Fremdschlüssel'], 0),
      W('Paul meldet sich von seinem einzigen Kurs ab, die Zeile wird gelöscht. Welche Anomalie entsteht?', ['Einfügeanomalie', 'Änderungsanomalie', 'Löschanomalie – Pauls Daten und evtl. der ganze Kurs gehen verloren', 'keine'], 2),
      W('Ein neuer Kurs ohne Teilnehmende soll eingetragen werden. Was ist das Problem?', ['keins', 'Einfügeanomalie – ohne schueler_id fehlt ein Teil des Primärschlüssels', 'Löschanomalie', 'der Kurs ist zu teuer'], 1),
      { art: 'zahl', text: 'Wie viele Relationen hat das Modell in der 3NF?', soll: () => 4 },
      { ...W('Welches Relationenmodell ist in der 3NF?', ['Schueler(id, name), Kurs(id, titel, lehrkraft, fach), Belegung(↑schueler_id, ↑kurs_id)', 'Schueler(id, name), Lehrkraft(id, name, fach), Kurs(id, titel, ↑lehrkraft_id), Belegung(↑schueler_id, ↑kurs_id)', 'Schueler(id, name), Lehrkraft(id, name), Kurs(id, titel, fach, ↑lehrkraft_id), Belegung(id, ↑schueler_id, ↑kurs_id)', 'Schueler(id, name, kurse), Lehrkraft(id, name, fach), Kurs(id, titel, ↑lehrkraft_id)'], 1),
        erklaerung: 'Musterantwort zum Vergleich: Die Tabelle ist in der 1NF, aber nicht in der 2NF, weil schuelername nur von schueler_id und kurstitel nur von kurs_id abhängen (Teilabhängigkeiten). Zudem hängt fach transitiv über lehrkraft vom Schlüssel ab (Verstoß gegen die 3NF). Folgen sind Anomalien, z. B. geht beim Löschen der einzigen Anmeldung von Paul auch der Schüler verloren. Lösung: Schueler(id, name), Lehrkraft(id, name, fach), Kurs(id, titel, ↑lehrkraft_id), Belegung(↑schueler_id, ↑kurs_id).' }],
    tipps: ['Fragen Sie bei jedem Attribut: Wovon hängt es eigentlich ab?', 'Lehrkraft und Fach gehören in eine eigene Relation, der Kurs bekommt den Fremdschlüssel.', 'Schueler, Lehrkraft, Kurs und die Verbindung Belegung.'] }),

  AB_F({ id: 'jd6', kapitel: 133, ico: '🧩', titel: 'ERM aus SQL rekonstruieren', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Datenbankschema der Musikschule',
    tabelle: () => ({ html: AB_bild(AB_code(AB_CREATE)) }),
    ziel: 'Wie im Abitur 2026 (Teil B): Rekonstruieren Sie aus den CREATE-TABLE-Anweisungen das ER-Modell mit Kardinalitäten.',
    merke: { titel: '🧩 Vom Schema zum ERM', text: 'Jede Tabelle mit eigenem Inhalt wird ein Entitätstyp. Ein Fremdschlüssel auf der n-Seite zeigt eine 1:n-Beziehung. Eine Tabelle, die nur aus zwei Fremdschlüsseln (und evtl. einer id) besteht, ist keine eigene Entität, sondern eine n:m-Beziehung. NOT NULL beim Fremdschlüssel heißt: Jede Zeile muss einen Partner haben.' },
    fragen: [{ art: 'zahl', text: 'Wie viele Fremdschlüssel enthält das Schema?', soll: () => 3 },
      W('Welche Kardinalität hat die Beziehung zwischen Lehrkraft und Kurs?', ['1:1', '1:n – eine Lehrkraft leitet viele Kurse, ein Kurs hat genau eine Lehrkraft', 'n:m', 'keine'], 1),
      W('Welche Kardinalität hat die Beziehung zwischen Schüler und Kurs?', ['1:1', '1:n', 'n:m – dargestellt durch die Tabelle belegung', 'n:1'], 2),
      { art: 'zahl', text: 'Wie viele Entitätstypen hat das ER-Modell?', soll: () => 3 },
      W('Was folgt aus NOT NULL bei kurs.lehrkraft_id?', ['ein Kurs kann ohne Lehrkraft existieren', 'jeder Kurs hat genau eine Lehrkraft', 'jede Lehrkraft hat mindestens einen Kurs', 'nichts'], 1)],
    tipps: ['REFERENCES markiert einen Fremdschlüssel.', 'belegung enthält nur Verweise – sie ist die Beziehung „belegt“.', 'Entitätstypen: Lehrkraft, Schüler, Kurs.'] }),
);

// ============ Kapitel 134: 🚲 C-Szenario Radzählung: Dateien und OOP ============
const AB_CSV_A = `datum;station;anzahl
12.04.2027;Elbufer;812
12.04.2027;Markt;455
12.04.2027;Brücke;230
13.04.2027;Elbufer;905
13.04.2027;Markt;-1
13.04.2027;Brücke;198
14.04.2027;Elbufer;640
14.04.2027;Markt;512
14.04.2027;Brücke;260
15.04.2027;Elbufer;1033
15.04.2027;Markt;498
15.04.2027;Brücke;241
`;
const AB_CSV_B = `datum;station;anzahl
20.05.2027;Hafen;300
20.05.2027;Schule;150
21.05.2027;Hafen;-1
21.05.2027;Schule;175
22.05.2027;Hafen;420
22.05.2027;Schule;175
23.05.2027;Hafen;390
23.05.2027;Schule;160
`;
const AB_DATEIEN = { 'zaehlung.csv': AB_CSV_A, 'zaehlung_b.csv': AB_CSV_B };
const AB_zeilen = (t) => t.trim().split('\n').slice(1).map((l) => { const [datum, station, anzahl] = l.split(';'); return { datum, station, anzahl: Number(anzahl) }; });
const AB_rund = (x) => Math.round(x * 100) / 100;
function AB_auswertung(t) {
  const st = {};
  for (const z of AB_zeilen(t)) { st[z.station] ||= []; if (z.anzahl >= 0) st[z.station].push(z.anzahl); }
  return Object.keys(st).sort().map((s) => { const w = st[s], summe = w.reduce((a, b) => a + b, 0); return [s, summe, w.length ? AB_rund(summe / w.length) : 0]; });
}
const AB_MESSREIHE = `class Messreihe:
    def __init__(self, station: str):
        self.__station = station
        self.__werte = []          # Liste von [datum, anzahl]

    def get_station(self) -> str:
        return self.__station

    def hinzufuegen(self, datum: str, anzahl: int):
        if anzahl >= 0:
            self.__werte.append([datum, anzahl])

    def summe(self) -> int:
        s = 0
        for eintrag in self.__werte:
            s = s + eintrag[1]
        return s

    def tage_ueber(self, grenze: int) -> list:
        ergebnis = []
        for eintrag in self.__werte:
            if eintrag[1] > grenze:
                ergebnis.append(eintrag[0])
        return ergebnis`;
const AB_MITTEL = `

    def mittel(self) -> float:
        if len(self.__werte) == 0:
            return 0
        return round(self.summe() / len(self.__werte), 2)

    def max_tag(self) -> str:
        bester = None
        for eintrag in self.__werte:
            if bester is None or eintrag[1] > bester[1]:
                bester = eintrag
        if bester is None:
            return None
        return bester[0]`;
const AB_D = (a) => AB_K({ sortArt: 'funktion', sprache: AB_S, dateien: AB_DATEIEN, ...a });

HOEFE.push(
  AB_D({ id: 'je1', kapitel: 134, ico: '📄', titel: 'Die Zähldaten einlesen', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Datei der Radzählstellen',
    tabelle: () => ({ html: AB_bild(AB_datei('zaehlung.csv', AB_CSV_A)) }),
    ziel: 'Implementieren Sie einlesen(pfad): Lesen Sie die CSV-Datei (Trennzeichen ;) und geben Sie eine Liste von Dictionaries zurück. Wandeln Sie anzahl dabei in eine ganze Zahl um.',
    story: 'Teil C ist ein großes Szenario – fast immer mit Dateien („besonders wichtig“, sagt das Ministerium) und oft mit fremdem OOP-Code. Unsere Stadt zählt Fahrräder an mehreren Stationen. Der Zähler am Markt hat einmal gestreikt und −1 gemeldet.',
    merke: { titel: '📄 Dateien in Teil C', text: 'Mit csv.DictReader(datei, delimiter=";") liefert jede Zeile ein Dictionary mit den Spaltennamen als Schlüssel. Alle Werte sind Texte – Zahlen erst mit int() oder float() umwandeln. with open(…) schließt die Datei von selbst.', code: "import csv\n\nwith open(pfad, newline='', encoding='utf-8') as datei:\n    for zeile in csv.DictReader(datei, delimiter=';'):\n        ..." },
    vorspann: 'def _t1():\n    d = einlesen("zaehlung.csv")\n    return [len(d), d[1], d[4]["anzahl"]]\n\ndef _t2():\n    d = einlesen("zaehlung_b.csv")\n    return [len(d), d[4]["station"], d[4]["anzahl"]]\n',
    ...tests([[12, AB_zeilen(AB_CSV_A)[1], -1], [8, 'Hafen', 420]]), testName: (k) => ['zaehlung.csv', 'zaehlung_b.csv'][k],
    befehle: [K_B('def einlesen(pfad):'), K_B("with open(¦, newline='', encoding='utf-8') as datei:"), K_B("csv.DictReader(¦, delimiter=';')"), K_B('int(¦)')],
    tipps: ['Oben import csv, dann eine leere Liste daten.', "csv.DictReader(datei, delimiter=';') – jede Zeile ist ein Dictionary.", "zeile['anzahl'] = int(zeile['anzahl']), dann daten.append(zeile)."],
    loesung: `import csv

def einlesen(pfad):
    daten = []
    with open(pfad, newline='', encoding='utf-8') as datei:
        for zeile in csv.DictReader(datei, delimiter=';'):
            zeile['anzahl'] = int(zeile['anzahl'])
            daten.append(zeile)
    return daten` }),

  AB_F({ id: 'je2', kapitel: 134, ico: '🔍', titel: 'Fremden Code beschreiben', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Klasse Messreihe (von einer Kollegin)',
    tabelle: () => ({ html: AB_bild(AB_code(AB_MESSREIHE)) }),
    ziel: 'Eine Kollegin hat die Klasse Messreihe geschrieben. Beschreiben Sie, was die Methoden leisten – 2026 hatten viele Prüflinge genau mit fremdem OOP-Code Mühe.',
    merke: { titel: '🔍 Fremden Code lesen', text: 'Erst die Attribute im Konstruktor ansehen (was speichert ein Objekt?), dann jede Methode: Parameter, Rückgabe, Wirkung auf die Attribute. Private Attribute (__name) sind nur innerhalb der Klasse sichtbar – von außen kommt man nur über Methoden heran (Kapselung).' },
    fragen: [W('Beschreiben Sie, was tage_ueber(500) zurückgibt.', ['die Anzahl der Tage mit mehr als 500 gezählten Rädern', 'eine Liste der Daten aller Tage mit mehr als 500 Rädern', 'True, wenn mindestens ein Tag mehr als 500 Räder hat', 'eine Liste der Zählwerte aller Tage mit mehr als 500 Rädern'], 1),
      W('Was bewirkt hinzufuegen("13.04.2027", -1)?', ['der Wert −1 wird gespeichert', 'nichts – negative Werte werden als Messfehler verworfen', 'ein Fehler bricht das Programm ab', 'der letzte Wert wird gelöscht'], 1),
      { art: 'zahl', text: 'm = Messreihe("Markt"); m.hinzufuegen("12.04.", 455); m.hinzufuegen("13.04.", -1); m.hinzufuegen("14.04.", 512). Was liefert m.summe()?', soll: () => 455 + 512 },
      { art: 'zahl', text: 'Und was liefert len(m.tage_ueber(400))?', soll: () => 2 },
      W('Was passiert bei print(m.__werte) außerhalb der Klasse?', ['es gibt die Liste aus', 'ein Fehler (AttributeError) – das Attribut ist privat', 'es gibt eine leere Liste [] aus', 'es gibt die Station aus'], 1),
      W('Warum ist __werte privat?', ['damit das Programm schneller läuft', 'Kapselung: nur hinzufuegen darf Werte eintragen – so kommen keine ungeprüften Werte hinein', 'weil Listen immer privat sein müssen', 'damit jedes Objekt seine eigene Liste bekommt'], 1)],
    tipps: ['tage_ueber sammelt eintrag[0] – das ist das Datum.', 'hinzufuegen prüft anzahl >= 0.', 'Gespeichert sind nur 455 und 512.'] }),

  AB_D({ id: 'je3', kapitel: 134, ico: '➕', titel: 'Die Klasse erweitern', lohn: 80,
    ziel: 'Erweitern Sie die Klasse Messreihe um mittel() (Durchschnitt der gespeicherten Werte, auf 2 Stellen gerundet, 0 ohne Werte) und max_tag() (Datum des größten Wertes, bei Gleichstand das frühere, None ohne Werte).',
    vorlage: AB_MESSREIHE,
    vorspann: `def _t1():
    m = Messreihe("Elbufer")
    m.hinzufuegen("12.04.2027", 812)
    m.hinzufuegen("13.04.2027", 905)
    m.hinzufuegen("14.04.2027", 640)
    return [m.mittel(), m.max_tag()]

def _t2():
    m = Messreihe("Leer")
    return [m.mittel(), m.max_tag()]

def _t3():
    m = Messreihe("Schule")
    m.hinzufuegen("20.05.2027", 150)
    m.hinzufuegen("21.05.2027", 175)
    m.hinzufuegen("22.05.2027", -1)
    m.hinzufuegen("23.05.2027", 175)
    return [m.mittel(), m.max_tag()]
`,
    ...tests([[AB_rund(2357 / 3), '13.04.2027'], [0, null], [AB_rund(500 / 3), '21.05.2027']]), testName: (k) => ['drei Werte', 'ohne Werte', 'Gleichstand und Messfehler'][k],
    befehle: [K_B('def mittel(self) -> float:'), K_B('len(self.__werte)'), K_B('round(¦, 2)'), K_B('def max_tag(self) -> str:'), K_B('is None')],
    tipps: ['Neue Methoden gehören eingerückt in die Klasse und bekommen self als ersten Parameter.', 'mittel: summe() wiederverwenden, aber vorher auf leere Liste prüfen.', 'max_tag: mit > (nicht >=) vergleichen, dann bleibt bei Gleichstand das frühere Datum.'],
    loesung: AB_MESSREIHE + AB_MITTEL }),

  AB_D({ id: 'je4', kapitel: 134, knobel: true, ico: '📊', titel: 'Der Bericht je Station', lohn: 90, ansicht: 'tabelle', titelAnsicht: 'Eingabe und gewünschte Ausgabe',
    tabelle: () => ({ html: AB_bild(`${AB_datei('zaehlung.csv', AB_CSV_A)}${AB_datei('bericht.csv (so soll er werden)', `station;summe;mittel\n${AB_auswertung(AB_CSV_A).map((z) => z.join(';')).join('\n')}`)}<p class="hinweis">Die Klasse Messreihe (mit mittel) ist schon vorhanden.</p>`) }),
    ziel: 'Implementieren Sie auswerten(pfad_ein, pfad_aus): Legen Sie je Station ein Messreihe-Objekt an, füllen Sie es aus der Datei und schreiben Sie eine CSV-Datei mit der Kopfzeile station;summe;mittel – Stationen alphabetisch sortiert.',
    vorspann: `${AB_MESSREIHE}${AB_MITTEL}

import csv

def _lies(p):
    zeilen = []
    with open(p, newline="") as f:
        for z in csv.reader(f, delimiter=";"):
            zeilen.append(z)
    ergebnis = [zeilen[0]]
    for z in zeilen[1:]:
        ergebnis.append([z[0], float(z[1]), float(z[2])])
    return ergebnis

def _t1():
    auswerten("zaehlung.csv", "bericht.csv")
    return _lies("bericht.csv")

def _t2():
    auswerten("zaehlung_b.csv", "bericht_b.csv")
    return _lies("bericht_b.csv")
`,
    ...tests([AB_CSV_A, AB_CSV_B].map((t) => [['station', 'summe', 'mittel'], ...AB_auswertung(t)])), testName: (k) => ['zaehlung.csv', 'zaehlung_b.csv'][k],
    befehle: [K_B('def auswerten(pfad_ein, pfad_aus):'), K_B('Messreihe(¦)'), K_B('not in'), K_B("csv.writer(¦, delimiter=';')"), K_B('sorted(¦)')],
    tipps: ['Ein Dictionary reihen ordnet jeder Station ihr Messreihe-Objekt zu.', "Beim Einlesen: reihen[station].hinzufuegen(zeile['datum'], int(zeile['anzahl'])) – den Messfehler filtert die Klasse.", "Beim Schreiben: writer.writerow([station, r.summe(), r.mittel()]) für jede Station aus sorted(reihen)."],
    loesung: `import csv

def auswerten(pfad_ein, pfad_aus):
    reihen = {}
    with open(pfad_ein, newline='', encoding='utf-8') as datei:
        for zeile in csv.DictReader(datei, delimiter=';'):
            station = zeile['station']
            if station not in reihen:
                reihen[station] = Messreihe(station)
            reihen[station].hinzufuegen(zeile['datum'], int(zeile['anzahl']))
    with open(pfad_aus, 'w', newline='', encoding='utf-8') as datei:
        writer = csv.writer(datei, delimiter=';')
        writer.writerow(['station', 'summe', 'mittel'])
        for station in sorted(reihen):
            r = reihen[station]
            writer.writerow([station, r.summe(), r.mittel()])` }),

  AB_F({ id: 'je5', kapitel: 134, ico: '✅', titel: 'Gütekriterien', lohn: 55, ansicht: 'tabelle', titelAnsicht: 'Zwei Fassungen derselben Funktion',
    tabelle: () => ({ html: AB_bild(`${AB_code('def f(a):\n    x=0\n    for b in a:\n        x=x+b[1]\n    return x/len(a)')}${AB_code('def mittlere_anzahl(eintraege):\n    """Durchschnitt der Zählwerte; 0 bei leerer Liste."""\n    if len(eintraege) == 0:\n        return 0\n    summe = 0\n    for eintrag in eintraege:\n        summe = summe + eintrag[1]   # eintrag = [datum, anzahl]\n    return summe / len(eintraege)')}`) }),
    ziel: 'In Teil B und C gibt es eigene BE für die Gütekriterien. Ordnen Sie die Verbesserungen den Kriterien zu und beurteilen Sie.',
    merke: { titel: '✅ Gütekriterien', text: 'Verständlichkeit: selbsterklärende, einheitliche Namen. Lesbarkeit: angemessene Kommentare. Strukturierung: sinnvolle Funktionen oder Methoden statt eines langen Blocks. Nutzerfreundliche Bedienbarkeit: verständliche Ein- und Ausgaben, falsche Eingaben abfangen.' },
    fragen: [W('Der Name mittlere_anzahl statt f verbessert vor allem …', ['die Verständlichkeit', 'die Laufzeit', 'die nutzerfreundliche Bedienbarkeit', 'den Speicherbedarf'], 0),
      W('Der Kommentar # eintrag = [datum, anzahl] verbessert vor allem …', ['die Strukturierung', 'die Lesbarkeit', 'die Bedienbarkeit', 'gar nichts'], 1),
      W('Was macht die erste Fassung bei einer leeren Liste?', ['sie gibt 0 zurück, weil die Summe 0 ist', 'sie bricht mit ZeroDivisionError ab', 'sie gibt None zurück, weil nichts zu tun ist', 'sie bricht mit IndexError ab'], 1),
      W('Ein Programm fragt „Station?“ und stürzt bei einem Tippfehler ab. Welches Kriterium ist verletzt?', ['Verständlichkeit der Variablennamen', 'Lesbarkeit durch Kommentare', 'nutzerfreundliche Bedienbarkeit – verständliche Eingabeaufforderung und Prüfung falscher Eingaben', 'Strukturierung in Funktionen'], 2),
      W('Das ganze Programm steht in einem Block von 200 Zeilen ohne Funktionen. Welches Kriterium ist verletzt?', ['Strukturierung', 'Lesbarkeit', 'Verständlichkeit', 'keins'], 0)],
    tipps: ['Namen → Verständlichkeit, Kommentare → Lesbarkeit.', 'len([]) ist 0 – und durch 0 teilen geht nicht.', 'Funktionen und Methoden → Strukturierung.'] }),
);

// ============ Kapitel 135: 🌐 Netze und Sicherheit ============
const AB_NETZ = [['PC1', '192.168.20.11', '255.255.255.0', '192.168.20.1'], ['PC2', '192.168.20.12', '255.255.255.0', '192.168.20.254'],
  ['PC3', '192.168.20.13', '255.255.255.0', '192.168.20.1'], ['PC4', '192.168.2.14', '255.255.255.0', '192.168.20.1'], ['Router (innen)', '192.168.20.1', '255.255.255.0', '–']];
const AB_DNS = [['A', 'Der Resolver fragt einen Root-Server, wer für .de zuständig ist.'], ['B', 'Der Browser schickt die HTTP-Anfrage an die IP-Adresse des Webservers.'],
  ['C', 'Der Rechner fragt den DNS-Resolver (z. B. im Router) nach der IP-Adresse von www.musikschule.de.'], ['D', 'Der Nameserver für .de nennt den Nameserver von musikschule.de.'],
  ['E', 'Der Nameserver von musikschule.de liefert die IP-Adresse.'], ['F', 'Der Resolver gibt die IP-Adresse an den Rechner zurück und speichert sie im Cache.']];
const AB_HYBRID = [['A', 'Bob entschlüsselt die Nachricht mit k.'], ['B', 'Alice erzeugt einen zufälligen Sitzungsschlüssel k.'],
  ['C', 'Bob entschlüsselt k mit seinem privaten Schlüssel.'], ['D', 'Alice verschlüsselt die Nachricht symmetrisch mit k und k asymmetrisch mit Bobs öffentlichem Schlüssel.'],
  ['E', 'Alice sendet beides an Bob.']];
const AB_xor = (a, b) => [...a].map((c, i) => (c === b[i] ? '0' : '1')).join('');
const AB_powMod = (b, e, m) => { let r = 1; for (let i = 0; i < e; i++) r = (r * b) % m; return r; };

HOEFE.push(
  AB_F({ id: 'jf1', kapitel: 135, ico: '🧮', titel: 'Das /26-Netz', lohn: 65,
    ziel: 'Ein Rechner hat die Adresse 192.168.10.77/26. Ermitteln Sie die Netzdaten.',
    story: 'Zum Schluss Netze und Sicherheit: Subnetze und DNS in Teil A, RSA und das One-Time-Pad sind ab 2027 ausdrücklich Schwerpunkt, dazu das Prinzip hybrider Verfahren.',
    merke: { titel: '🧮 Subnetze', text: '/n heißt: die ersten n Bit der Adresse sind Netzteil, die restlichen 32 − n Bit Hostteil. Die Adressen bilden Blöcke zu 2^(32 − n); die erste Adresse eines Blocks ist die Netzadresse, die letzte die Broadcastadresse, alle dazwischen sind Hostadressen.', code: '/24 → 255.255.255.0, Blöcke zu 256, 254 Hosts' },
    fragen: [W('Welche Subnetzmaske gehört zu /26?', ['255.255.255.0', '255.255.255.128', '255.255.255.192', '255.255.255.224'], 2),
      { art: 'liste', text: 'Ermitteln Sie Netzadresse und Broadcastadresse (mit Leerzeichen getrennt).', soll: () => ['192.168.10.64', '192.168.10.127'], erklaerung: '77 liegt im Block 64 … 127 (Blöcke zu 2⁶ = 64 Adressen).' },
      { art: 'zahl', text: 'Wie viele Rechner können in diesem Netz eine Adresse bekommen?', soll: () => 62, erklaerung: '2⁶ − 2 = 62 – Netz- und Broadcastadresse sind reserviert.' },
      W('Welche Adresse liegt im selben Netz wie 192.168.10.77/26?', ['192.168.10.60', '192.168.10.130', '192.168.10.120', '192.168.11.77'], 2)],
    tipps: ['/26: 26 Einsen in der Maske – im letzten Byte also zwei Einsen.', 'Bei /26 bleiben 6 Hostbits: In welchem Block zu 2⁶ Adressen liegt 77?', 'Netz- und Broadcastadresse bekommt kein Rechner.'] }),

  AB_F({ id: 'jf2', kapitel: 135, ico: '📮', titel: 'Der Weg einer Anfrage', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'Schritte (durcheinander)',
    tabelle: () => ({ html: AB_bild(AB_tab(['', 'Schritt'], AB_DNS)) }),
    ziel: 'Wie im Abitur 2025 (Teil A): Beschreiben Sie den Kommunikationsweg, wenn jemand www.musikschule.de im Browser aufruft und noch nichts im Cache liegt. Bringen Sie die Schritte in die richtige Reihenfolge.',
    merke: { titel: '📮 DNS', text: 'Das Domain Name System übersetzt Namen in IP-Adressen. Der Resolver fragt sich von oben durch die Hierarchie: Root-Server → Nameserver der Top-Level-Domain (.de) → zuständiger Nameserver der Domain. Das Ergebnis landet im Cache; erst danach baut der Browser die Verbindung zum Webserver auf.' },
    fragen: [{ art: 'liste', text: 'Reihenfolge der Buchstaben (mit Leerzeichen getrennt):', soll: () => ['C', 'A', 'D', 'E', 'F', 'B'] },
      W('Was passiert beim zweiten Aufruf kurz danach?', ['alles noch einmal', 'der Resolver antwortet aus dem Cache – Root und .de werden nicht gefragt', 'der Browser fragt direkt den Root-Server', 'nichts, die Seite lädt nicht'], 1),
      W('Welches Protokoll der Transportschicht nutzt HTTP normalerweise?', ['UDP', 'TCP', 'IP', 'DNS'], 1)],
    tipps: ['Zuerst fragt der eigene Rechner, ganz zuletzt kommt die HTTP-Anfrage.', 'Die Hierarchie von oben: Root, dann .de, dann musikschule.de.'] }),

  AB_F({ id: 'jf3', kapitel: 135, ico: '🛠️', titel: 'Fehler in der Konfiguration', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Netz 192.168.20.0/24 der Musikschule',
    tabelle: () => ({ html: AB_bild(`${AB_tab(['Gerät', 'IP-Adresse', 'Maske', 'Gateway'], AB_NETZ)}<p class="hinweis">Alle Geräte hängen am selben Switch, der Router verbindet ins Internet.</p>`) }),
    ziel: 'Wie in Filius-Aufgaben: Ermitteln Sie die fehlerhaften Einstellungen und erläutern Sie ihre Folgen.',
    merke: { titel: '🛠️ Gateway und Netz', text: 'Rechner im selben Netz (gleicher Netzteil nach der Maske) erreichen sich direkt über den Switch. Für alle anderen Ziele schickt ein Rechner die Pakete an sein Standardgateway – die Adresse des Routers in seinem Netz. Falsches Gateway: lokal geht alles, ins Internet nichts. Falsche Netzadresse: nicht einmal die Nachbarn sind erreichbar.' },
    fragen: [W('Welcher Rechner erreicht die anderen PCs, aber nicht das Internet?', ['PC1', 'PC2', 'PC3', 'PC4'], 1),
      W('Welcher Rechner erreicht nicht einmal die anderen PCs im Netz?', ['PC1', 'PC2', 'PC3', 'PC4'], 3),
      W('Wie wird PC4 repariert?', ['Gateway auf 192.168.2.1', 'IP-Adresse in 192.168.20.14 ändern', 'Maske auf 255.255.0.0 und sonst nichts', 'Kabel tauschen'], 1),
      W('Welche Aufgabe hat das Standardgateway?', ['es übersetzt Namen wie www.musikschule.de in IP-Adressen', 'es leitet Pakete an Ziele außerhalb des Netzes weiter', 'es verbindet die Rechner im selben Netz miteinander', 'es vergibt den Rechnern ihre IP-Adressen und Masken'], 1)],
    tipps: ['Vergleichen Sie Gateway und Router-Adresse.', 'Gilt 192.168.2.x mit Maske /24 als dasselbe Netz wie 192.168.20.x?'] }),

  AB_F({ id: 'jf4', kapitel: 135, ico: '🗝️', titel: 'RSA von Hand', lohn: 75,
    ziel: 'Führen Sie RSA mit p = 5, q = 11 und e = 3 von Hand durch: Ermitteln Sie die Schlüssel, verschlüsseln Sie m = 7 und überprüfen Sie das Entschlüsseln.',
    merke: { titel: '🗝️ RSA', text: 'n = p · q, φ(n) = (p − 1)(q − 1). Wähle e teilerfremd zu φ(n) und d mit e · d mod φ(n) = 1. Öffentlicher Schlüssel (e, n), privater (d, n). Verschlüsseln: c = mᵉ mod n, entschlüsseln: m = cᵈ mod n. Von Hand mit modularer Multiplikation: nach jedem Schritt mod n rechnen, damit die Zahlen klein bleiben (fortgesetztes Quadrieren).', code: 'aᵇ mod n: a² mod n, a⁴ = (a²)² mod n, …\nzum Schluss die passenden Potenzen multiplizieren' },
    fragen: [{ art: 'zahl', text: 'Ermitteln Sie n.', soll: () => 5 * 11 },
      { art: 'zahl', text: 'Ermitteln Sie φ(n).', soll: () => 4 * 10 },
      { art: 'zahl', text: 'Ermitteln Sie d (kleinstes positives d mit 3 · d mod 40 = 1).', soll: () => jsInv(3, 40), erklaerung: '3 · 27 = 81 = 2 · 40 + 1.' },
      { art: 'zahl', text: 'Verschlüsseln Sie m = 7: c = 7³ mod 55.', soll: () => AB_powMod(7, 3, 55), erklaerung: '7³ = 343 = 6 · 55 + 13.' },
      { art: 'zahl', text: 'Modulare Multiplikation: Berechnen Sie c² mod 55 (erster Schritt beim Entschlüsseln).', soll: () => (13 * 13) % 55, erklaerung: '13² = 169 = 3 · 55 + 4.' },
      { art: 'zahl', text: 'Überprüfen Sie das Entschlüsseln: Ermitteln Sie m = c^d mod 55.', soll: () => AB_powMod(AB_powMod(7, 3, 55), jsInv(3, 40), 55), erklaerung: '13²⁷ mod 55 = 7 – die ursprüngliche Nachricht. (27 = 16 + 8 + 2 + 1: 13¹ = 13, 13² = 4, 13⁴ = 16, 13⁸ = 36, 13¹⁶ = 31; 31 · 36 · 4 · 13 mod 55 = 7)' },
      W('Welcher Schlüssel darf veröffentlicht werden?', ['(d, n)', '(e, n)', 'p und q', 'φ(n)'], 1),
      W('Warum ist RSA mit großen Zahlen sicher?', ['weil e und n geheim bleiben und nur Bob sie kennt', 'weil man n praktisch nicht in p und q zerlegen kann – ohne p, q fehlt φ(n) und damit d', 'weil es zu jedem n sehr viele mögliche Exponenten e gibt', 'weil die Nachricht vor dem Senden in Blöcke zerlegt wird'], 1)],
    tipps: ['φ(n) = (p − 1) · (q − 1).', 'd finden: Probieren Sie die Zahlen 41, 81, 121 … (Vielfache von 40 plus 1) – welche ist durch 3 teilbar?', 'Für c^d: d als Summe von Zweierpotenzen schreiben und nach jedem Quadrieren mod 55 rechnen.'] }),

  AB_F({ id: 'jf5', kapitel: 135, ico: '🎟️', titel: 'One-Time-Pad mit XOR', lohn: 65,
    ziel: 'Verschlüsseln und entschlüsseln Sie mit dem One-Time-Pad von Hand (bitweises XOR) und beurteilen Sie seine Sicherheit.',
    merke: { titel: '🎟️ One-Time-Pad', text: 'Beim One-Time-Pad wird jedes Bit der Nachricht mit einem Schlüsselbit per XOR verknüpft: c = m ⊕ k, und wieder m = c ⊕ k. Es ist beweisbar sicher, wenn der Schlüssel echt zufällig, so lang wie die Nachricht, geheim und nur einmal verwendet ist.' },
    fragen: [{ art: 'zahl', text: `Verschlüsseln Sie m = 10110010 mit k = 01101100 (c = m ⊕ k).`, soll: () => Number(AB_xor('10110010', '01101100')) },
      { art: 'zahl', text: 'Entschlüsseln Sie c = 10011011 mit demselben k = 01101100.', soll: () => Number(AB_xor('10011011', '01101100')) },
      W('Welche Bedingung gehört NICHT zum sicheren One-Time-Pad?', ['Schlüssel echt zufällig', 'Schlüssel so lang wie die Nachricht', 'Schlüssel wird nur einmal verwendet', 'Schlüssel wird öffentlich gemacht'], 3),
      W('Jemand benutzt denselben Schlüssel für zwei Nachrichten. Was kann ein Angreifer berechnen?', ['nichts', 'c₁ ⊕ c₂ = m₁ ⊕ m₂ – der Schlüssel fällt heraus', 'den privaten RSA-Schlüssel', 'nur die Länge'], 1),
      W('Warum nutzt man das One-Time-Pad im Alltag kaum?', ['es ist unsicher', 'Schlüsselaustausch – der Schlüssel ist so lang wie alle Nachrichten und muss vorher sicher übergeben werden', 'XOR ist zu langsam', 'es geht nur mit Buchstaben'], 1)],
    tipps: ['XOR: gleiche Bits → 0, verschiedene Bits → 1.', 'Stelle für Stelle von links: 1⊕0 = 1, 0⊕1 = 1, 1⊕1 = 0 …', 'XOR mit demselben Schlüssel hebt sich auf.'] }),

  AB_F({ id: 'jf6', kapitel: 135, ico: '🔀', titel: 'Das hybride Verfahren', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Alice schickt Bob eine große Datei',
    tabelle: () => ({ html: AB_bild(AB_tab(['', 'Schritt'], AB_HYBRID)) }),
    ziel: 'Erläutern Sie das Prinzip hybrider Verfahren: Bringen Sie die Schritte in die richtige Reihenfolge und begründen Sie, warum man beide Verfahren kombiniert.',
    merke: { titel: '🔀 Hybride Verschlüsselung', text: 'Symmetrische Verfahren (z. B. AES) sind schnell, haben aber das Schlüsselaustauschproblem. Asymmetrische Verfahren (z. B. RSA) lösen es, sind aber langsam. Hybrid: Die Nachricht wird symmetrisch mit einem zufälligen Sitzungsschlüssel verschlüsselt, nur dieser kurze Schlüssel asymmetrisch mit dem öffentlichen Schlüssel des Empfängers.' },
    fragen: [{ art: 'liste', text: 'Reihenfolge der Buchstaben (mit Leerzeichen getrennt):', soll: () => ['B', 'D', 'E', 'C', 'A'] },
      W('Warum verschlüsselt Alice nicht die ganze Datei mit RSA?', ['RSA gilt seit einigen Jahren als geknackt', 'RSA ist für große Daten sehr langsam', 'RSA kann nur Zahlen, aber keine Dateien', 'Bob hat keinen öffentlichen Schlüssel'], 1),
      W('Warum schickt Alice k nicht einfach unverschlüsselt mit?', ['jeder Mithörende könnte die Datei entschlüsseln', 'k ist zu lang, um es unverschlüsselt zu senden', 'das ginge auch, weil k ohnehin nur einmal benutzt wird', 'Bob kann ein unverschlüsseltes k nicht lesen'], 0),
      { ...W('Wie kann Alice prüfen, dass der öffentliche Schlüssel wirklich Bob gehört?', ['am Namen, der im Schlüssel selbst steht', 'über ein Zertifikat einer Zertifizierungsstelle', 'Bob schickt ihn ihr zur Sicherheit noch einmal per E-Mail', 'gar nicht, das muss sie einfach glauben'], 1),
        erklaerung: 'Musterantwort zum Vergleich: Alice erzeugt einen zufälligen Sitzungsschlüssel k, verschlüsselt die Datei schnell symmetrisch (z. B. AES) mit k und nur den kurzen Schlüssel k asymmetrisch (z. B. RSA) mit Bobs öffentlichem Schlüssel. Bob entschlüsselt k mit seinem privaten Schlüssel und damit die Datei. So verbindet das hybride Verfahren die Geschwindigkeit symmetrischer Verfahren mit dem gelösten Schlüsselaustausch asymmetrischer Verfahren; die Echtheit von Bobs öffentlichem Schlüssel sichert ein Zertifikat.' }],
    tipps: ['Zuerst braucht Alice den Sitzungsschlüssel.', 'Bob braucht erst k, bevor er die Nachricht lesen kann.'] }),
);

// --- 📓 Heft ---
HEFT_EXTRA[130] = { titel: '📝 Teil A ohne Rechner', text: ['Teil A (40 BE) wird ohne Computer und Taschenrechner geschrieben: Multiple Choice, Umrechnen, Speicherbedarf, Algorithmeneigenschaften.', 'ASCII belegt 1 Byte je Zeichen; mit einem Huffman-Code rechnet man Anzahl · Codelänge.', 'Terminierung ist verletzt, wenn eine Schleife nie endet – z. B. wenn ein Zähler die Abbruchbedingung überspringt.'], code: 'x = 7\nwhile x != 0:      # 7, 5, 3, 1, -1 …\n    x = x - 2' };
HEFT_EXTRA[131] = { titel: '🪆 Rekursion und Aufwand', text: ['Bei doppelter Rekursion gilt für die Aufrufe z. B. A(n) = 1 + A(n − 1) + A(n − 2) – der Aufwand ist exponentiell.', 'Was vor dem rekursiven Aufruf steht, passiert im Abstieg, was danach steht, im Aufstieg.', 'Sequenzielle Suche O(n), binäre Suche O(log n) – aber nur in sortierten Listen.'], code: 'def knoten_schnell(stufe):\n    if stufe == 0:\n        return 1\n    teil = knoten_schnell(stufe - 1)\n    return teil + 1 + teil' };
HEFT_EXTRA[132] = { titel: '🤖 Automat und Grammatik', text: ['Aus jedem Übergang X –c→ Y wird die Regel X → cY, führt er in einen Endzustand, zusätzlich X → c.', 'Der Fangzustand macht den DEA vollständig, bekommt aber kein Nichtterminal.', 'Im Ableitungsbaum ist jeder innere Knoten eine Regelanwendung; die Blätter ergeben das Wort.'], code: 'S → aA\nA → aA | bB | b\nB → aA | bB | b' };
HEFT_EXTRA[133] = { titel: '🎵 Datenbanken im Abitur', text: ['Mehrere Tabellen verbindet man mit INNER JOIN über Fremdschlüssel = Primärschlüssel.', 'GROUP BY bildet Gruppen, HAVING filtert Gruppen, eine Unterabfrage liefert z. B. den Durchschnitt zum Vergleichen.', '3NF: keine Teilabhängigkeit und keine transitive Abhängigkeit – sonst drohen Anomalien.'], code: 'SELECT titel, gebuehr\nFROM kurs\nWHERE gebuehr > (SELECT AVG(gebuehr) FROM kurs)' };
HEFT_EXTRA[134] = { titel: '🚲 Szenario mit Dateien und OOP', text: ['CSV-Dateien liest man mit csv.DictReader und wandelt Zahlen mit int() oder float() um.', 'Fremden Code liest man von den Attributen im Konstruktor zu den Methoden; private Attribute erreicht man nur über Methoden.', 'Gütekriterien: Verständlichkeit, Lesbarkeit, Strukturierung, nutzerfreundliche Bedienbarkeit.'], code: "writer = csv.writer(datei, delimiter=';')\nwriter.writerow(['station', 'summe', 'mittel'])" };
HEFT_EXTRA[135] = { titel: '🌐 Netze und Sicherheit', text: ['/26: Maske 255.255.255.192, Blöcke zu 64 Adressen, 62 Hosts.', 'RSA: n = p · q, φ(n) = (p − 1)(q − 1), e · d mod φ(n) = 1, c = mᵉ mod n.', 'Hybrid: Nachricht symmetrisch mit Sitzungsschlüssel, den Sitzungsschlüssel asymmetrisch verschlüsseln.'], code: 'p = 5, q = 11 → n = 55, φ = 40\ne = 3 → d = 27\nm = 7 → c = 343 mod 55 = 13' };
