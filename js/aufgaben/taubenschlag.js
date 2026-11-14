'use strict';
// --- 🕊️ Taubenschlag: LK Informationssicherheit (Burg 26, Lehrplan LB 8, OPAL-Kurs LK_INF_LB8 „Informationssicherheit“) ---
// Die Brieftauben der Burg tragen Nachrichten – wer sie abfängt, soll nichts verstehen. Schlüsselmeisterin Mira erzählt.
// Code-Stil wie im Kurs: verschiebe(buchstabe, abstand) mit ord/chr, verschluesseln/entschluesseln, brute_force,
// multiplikative_chiffre, vigenere_encrypt (Zähler j nur für Buchstaben), Mini-AES-8 (HEX, SBOX, HEX_TO_BIN, sub_bytes_hex …),
// modulares_inverses, RSA mit pow(m, e, n), Diffie-Hellman g/p/a/b.
// Läuft auf dem Kornspeicher-Ablauf (warte + krypto), Sprache S_KRYPTO (ord, chr, pow erlaubt).

KAPITEL[80] = { name: 'Schutzziele und Caesar', ico: '🛡️' };
KAPITEL[81] = { name: 'Häufigkeitsanalyse', ico: '📊' };
KAPITEL[82] = { name: 'Vigenère und One-Time-Pad', ico: '🔑' };
KAPITEL[83] = { name: 'Moderne Blockchiffren', ico: '🧱' };
KAPITEL[84] = { name: 'Öffentliche Schlüssel', ico: '🗝️' };
KAPITEL[85] = { name: 'Hash, Signatur, Anmeldung', ico: '✍️' };
BURGEN[26] = { name: 'LK Sicherheit', ico: '🔐', klasse: 'LK', region: 'tauben', kapitel: [80, 81, 82, 83, 84, 85],
  text: 'Leistungskurs: Schutzziele, Caesar und Brute Force, Häufigkeitsanalyse, multiplikative Chiffre, Vigenère und Kasiski, One-Time-Pad, Mini-AES, Diffie-Hellman, RSA, Hashfunktionen, digitale Signatur.' };

const S_KRYPTO = [...S_LK, 'krypto'];
const KRYPTO = (a) => KORN({ warte: true, krypto: true, zielArt: 'wert', funktion: null, sprache: S_KRYPTO, ...a });
const KRFRAGEN = (a) => KRYPTO({ sortArt: 'fragen', listen: [], ...a });
const krBild = (html) => `<div class="werkbild dsbild kbild">${html}</div>`;

// --- Referenz in JS (richtige Ergebnisse) ---
const ABC = 'abcdefghijklmnopqrstuvwxyz';
const istAbc = (z) => /^[a-zA-Z]$/.test(z);
const jsVerschiebe = (b, a) => ABC[(((ABC.indexOf(b.toLowerCase()) + a) % 26) + 26) % 26];
const jsCaesar = (s, a) => [...s].map((z) => (istAbc(z) ? jsVerschiebe(z, a) : z)).join('');
function jsVig(text, key, richtung = 1) {
  let j = 0;
  return [...text].map((z) => { if (!istAbc(z)) return z; const s = ABC.indexOf(key[j % key.length].toLowerCase()); j++; return jsVerschiebe(z, richtung * s); }).join('');
}
const jsHaeuf = (t) => { const d = {}; for (const z of t.toUpperCase()) if (/[A-Z]/.test(z)) d[z] = (d[z] || 0) + 1; return d; };
const jsMult = (t, k) => [...t.toUpperCase()].map((z) => (/[A-Z]/.test(z) ? ABC.toUpperCase()[((z.charCodeAt(0) - 65) * k) % 26] : z)).join('');
const jsOtp = (n, k) => (n.length !== k.length ? '' : [...n].map((z, i) => String.fromCharCode(65 + ((z.charCodeAt(0) - 65 + k.charCodeAt(i) - 65) % 26))).join(''));
function jsAbstaende(text, folge) {
  const pos = [];
  for (let i = 0; i + folge.length <= text.length; i++) if (text.slice(i, i + folge.length) === folge) pos.push(i);
  return pos.slice(1).map((p, i) => p - pos[i]);
}
const HEX = '0123456789ABCDEF'.split('');
const SBOX = ['E', '4', 'D', '1', '2', 'F', 'B', '8', '3', 'A', '6', 'C', '5', '9', '0', '7'];
const jsSub = (b) => SBOX[HEX.indexOf(b[0])] + SBOX[HEX.indexOf(b[1])];
const jsXor = (a, b) => HEX[HEX.indexOf(a) ^ HEX.indexOf(b)];
const jsRoundKey = (b, k) => jsXor(b[0], k[0]) + jsXor(b[1], k[1]);
const jsRunde = (b, k) => { const s = jsSub(b); return jsRoundKey(s[1] + s[0], k); };
const jsGgt = (a, b) => (b === 0 ? a : jsGgt(b, a % b));
const jsInv = (a, m) => { for (let i = 1; i < m; i++) if ((a * i) % m === 1) return i; return null; };
const jsPow = (b, e, m) => Number((BigInt(b) ** BigInt(e)) % BigInt(m));
const jsMiniHash = (t) => [...t].reduce((s, z, i) => s + (i + 1) * z.charCodeAt(0), 0) % 997;

const V_VERSCHIEBE = `def verschiebe(buchstabe, abstand):
    buchstabe = buchstabe.lower()
    start = ord('a')
    neuer_ascii = (ord(buchstabe) - start + abstand) % 26 + start
    return chr(neuer_ascii)

def verschluesseln(satz, abstand):
    ergebnis = ""
    for buchstabe in satz:
        if 'a' <= buchstabe.lower() <= 'z':
            ergebnis += verschiebe(buchstabe, abstand)
        else:
            ergebnis += buchstabe
    return ergebnis

def entschluesseln(satz, abstand):
    return verschluesseln(satz, -abstand)
`;
const V_AES = `HEX = ${py(HEX)}
SBOX = ${py(SBOX)}
HEX_TO_BIN = {${HEX.map((h, i) => `"${h}": "${i.toString(2).padStart(4, '0')}"`).join(', ')}}
BIN_TO_HEX = {${HEX.map((h, i) => `"${i.toString(2).padStart(4, '0')}": "${h}"`).join(', ')}}
`;

// Lange Klartexte für die Häufigkeitsanalyse (im Deutschen ist e der häufigste Buchstabe)
const KLAR_1 = 'die monster kommen heute nacht durch das westtor. die wachen sollen die mauer besetzen und die kessel mit wasser fuellen. der held wartet auf dem torturm. ende der nachricht.';
const KLAR_2 = 'morgen frueh kommen neue steine fuer die mauer. bitte schickt zehn bauern zum steinbruch und sagt der heldin bescheid, dass der erste turm fertig werden muss.';
const GEHEIM_1 = jsCaesar(KLAR_1, 7), GEHEIM_2 = jsCaesar(KLAR_2, 19);
// Alphabet mit Verschiebung (Caesar-Scheibe als Tabelle)
const alphabetBild = (a) => `<div class="dbtab"><div class="dbscroll"><table><tr><th>klar</th>${[...ABC].map((z) => `<td>${z}</td>`).join('')}</tr>
  <tr><th>geheim</th>${[...ABC].map((z) => `<td><b>${jsVerschiebe(z, a)}</b></td>`).join('')}</tr></table></div></div>`;
// Häufigkeiten als Balken
function haeufBild(text, titel) {
  const d = jsHaeuf(text), max = Math.max(...Object.values(d));
  return `<div class="krbalken"><div class="dbtitel">${titel}</div><div class="krbalkenreihe">${[...ABC.toUpperCase()].map((z) => `<div><i style="height:${Math.round(((d[z] || 0) / max) * 70)}px"></i><span>${z}</span></div>`).join('')}</div></div>`;
}
// Kasiski: Vigenère-Text (Schlüssel „burg“, Länge 4), in dem „derfeind“ viermal steht – Abstände 24, 20, 28
const KASISKI_TEXT = jsVig('derfeind' + 'kommtheutenachts' + 'derfeind' + 'durchdenwald' + 'derfeind' + 'undwartetvordentoren' + 'derfeind' + 'istschlau', 'burg');
const K_F1 = KASISKI_TEXT.slice(0, 3), K_F2 = KASISKI_TEXT.slice(3, 6);
// Vigenère knacken (fc5): lange Texte, Schlüssellänge 5 – in jeder Gruppe ist e der häufigste Buchstabe (wie im Python-Code geprüft)
const KR_LANG = [[`${KLAR_1} ${KLAR_2}`, 'taube'], [`${KLAR_2} ${KLAR_1}`, 'falke'], [`${KLAR_1} ${KLAR_2}`, 'stein']].map(([t, k]) => [jsVig(t, k), k]);
const krCaesarKnacken = (g) => { const z = {}, reihe = []; for (const c of g) if (c >= 'a' && c <= 'z') { if (!(c in z)) { z[c] = 0; reihe.push(c); } z[c]++; } let h = ''; for (const b of reihe) if (h === '' || z[b] > z[h]) h = b; return (((h.charCodeAt(0) - 101) % 26) + 26) % 26; };
const krVigKnacken = (g, L) => { const bs = [...g].filter((c) => c >= 'a' && c <= 'z'); let k = ''; for (let i = 0; i < L; i++) k += ABC[krCaesarKnacken(bs.filter((_, j) => j % L === i).join(''))]; return k; };
// erweiterter Euklid (fe2b): [g, x, y] mit a·x + b·y = g
const krErw = (a, b) => (b === 0 ? [a, 1, 0] : (([g, x, y]) => [g, y, x - Math.floor(a / b) * y])(krErw(b, a % b)));
const KR_ERW_TESTS = [[240, 46], [72, 5], [17, 5], [120, 7], [13, 26], [10, 0]];
// Kollision finden (ff1k): alle Wörter aus drei Buchstaben a–h
const KR_ACHT = 'abcdefgh';
const krKollisionen = (w) => { const r = []; for (const a of KR_ACHT) for (const b of KR_ACHT) for (const c of KR_ACHT) { const x = a + b + c; if (x !== w && jsMiniHash(x) === jsMiniHash(w)) r.push(x); } return r; };
const KR_KOLL_TESTS = ['bad', 'cab', 'hhh', 'taube'];
const geheimBild = (name, text) => `<div class="dsdatei"><div class="dbtitel">🕊️ ${esc(name)}</div><pre class="mono krtext">${esc(text)}</pre></div>`;

HOEFE.push(
  // --- Kapitel 80: 🛡️ Schutzziele und Caesar (Kurs 8.1–8.3) ---
  KRFRAGEN({ id: 'fa1', kapitel: 80, ico: '🛡️', titel: 'Was soll geschützt werden?', lohn: 60,
    ziel: 'Die fünf Schutzziele der Informationssicherheit – welches ist jeweils verletzt?',
    story: 'Willkommen im Taubenschlag! Hier starten die Brieftauben der Burg. Jede Nachricht kann abgefangen, verändert oder gefälscht werden – und manchmal kommt gar keine Taube an. Bevor wir verschlüsseln, klären wir, was eigentlich schiefgehen kann.',
    merke: { titel: '🛡️ Schutzziele', text: 'Vertraulichkeit: Nur Berechtigte können lesen. Integrität: Daten sind unverändert. Verfügbarkeit: Der Dienst funktioniert, wenn man ihn braucht (diese drei = CIA). Dazu Authentizität (der Absender ist echt) und Verbindlichkeit (er kann es nicht abstreiten).' },
    fragen: [W('Ein Spion fängt eine Taube ab und liest die Nachricht.', ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Verbindlichkeit'], 0),
      W('Aus „schickt 10 Bauern“ wird unterwegs „schickt 100 Bauern“.', ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Authentizität'], 1),
      W('Ein Habicht fängt alle Tauben ab – keine Nachricht kommt mehr an.', ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Verbindlichkeit'], 2),
      W('Eine Nachricht trägt das Siegel des Königs, stammt aber von einem Betrüger.', ['Verfügbarkeit', 'Authentizität', 'Integrität', 'Vertraulichkeit'], 1),
      W('Ein Händler bestellt 200 Rüben und behauptet später, er habe nie bestellt.', ['Verbindlichkeit', 'Verfügbarkeit', 'Vertraulichkeit', 'Integrität'], 0),
      W('Kerckhoffs-Prinzip: Die Sicherheit eines Verfahrens darf nur abhängen von …', ['der Geheimhaltung des Verfahrens', 'der Geheimhaltung des Schlüssels', 'der Länge der Nachricht', 'der Schnelligkeit der Tauben'], 1)],
    tipps: ['Gelesen → Vertraulichkeit, verändert → Integrität, verhindert → Verfügbarkeit.'] }),
  KRYPTO({ id: 'fa2', kapitel: 80, sortArt: 'funktion', ico: '🔤', titel: 'Einen Buchstaben verschieben', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Caesar mit Abstand 3',
    tabelle: () => ({ html: krBild(`${alphabetBild(3)}<p class="hinweis">ord('a') = 97, ord('b') = 98 … chr(100) = 'd'. Nach z geht es wieder bei a weiter: % 26.</p>`) }),
    ziel: 'Schreib verschiebe(buchstabe, abstand): Der Buchstabe (klein gemacht) wird um abstand im Alphabet verschoben – nach z geht es bei a weiter, auch rückwärts mit negativem Abstand.',
    merke: { titel: '🔤 Caesar-Verschlüsselung', text: 'Jeder Buchstabe wird um denselben Abstand im Alphabet verschoben – der Abstand ist der Schlüssel. Rechnung: Position = ord(buchstabe) − ord("a"), dann (Position + abstand) % 26, zurück mit chr(… + ord("a")). Entschlüsseln = mit −abstand verschieben.', code: "ord('c') - ord('a')     # 2: c ist der 3. Buchstabe\nchr(2 + ord('a'))       # 'c'\n(24 + 5) % 26           # 3: nach z geht es bei a weiter\n(1 - 4) % 26            # 23: auch rückwärts" },
    listen: [[], [], [], [], []], aufrufFn: (l, k) => [`verschiebe("a", 3)`, `verschiebe("x", 3)`, `verschiebe("K", 10)`, `verschiebe("c", -5)`, `verschiebe("m", 26)`][k],
    soll: (l, k) => [jsVerschiebe('a', 3), jsVerschiebe('x', 3), jsVerschiebe('K', 10), jsVerschiebe('c', -5), 'm'][k], testName: (k) => ['a + 3', 'x + 3 (über z hinaus)', 'K + 10 (groß)', 'c − 5', 'm + 26'][k],
    befehle: [K_B('def verschiebe(buchstabe, abstand):'), K_B('.lower()'), K_B('ord(¦)'), K_B('chr(¦)'), K_B('% 26')],
    tipps: ['ord(buchstabe) - ord("a") ist die Position im Alphabet (0 bis 25).', '% 26 sorgt dafür, dass man nach z wieder bei a landet – auch bei negativen Zahlen.', 'Am Ende wieder + ord("a") und chr(…).'],
    loesung: "def verschiebe(buchstabe, abstand):\n    buchstabe = buchstabe.lower()\n    start = ord('a')\n    neuer_ascii = (ord(buchstabe) - start + abstand) % 26 + start\n    return chr(neuer_ascii)" }),
  KRYPTO({ id: 'fa3', kapitel: 80, sortArt: 'funktion', ico: '✉️', titel: 'Ganze Nachrichten', lohn: 65,
    ziel: 'Schreib verschluesseln(satz, abstand) und entschluesseln(satz, abstand): Nur Buchstaben a–z werden verschoben, Leer- und Satzzeichen bleiben. verschiebe gibt es schon.',
    vorspann: V_VERSCHIEBE.split('\ndef verschluesseln')[0] + '\n',
    listen: [[], [], [], []], aufrufFn: (l, k) => ['verschluesseln("Hallo, wie geht es dir?", 3)', 'entschluesseln("kdoor, zlh jhkw hv glu?", 3)', 'verschluesseln("Zug um zehn!", 13)', 'entschluesseln(verschluesseln("Treffen am Brunnen", 7), 7)'][k],
    soll: (l, k) => [jsCaesar('Hallo, wie geht es dir?', 3), 'hallo, wie geht es dir?', jsCaesar('Zug um zehn!', 13), 'treffen am brunnen'][k], testName: (k) => ['verschlüsseln', 'entschlüsseln', 'ROT13', 'hin und zurück'][k],
    // Didaktik-Prüfung: nur Kopfzeilen und Bruchstücke, keine ganzen Lösungszeilen
    befehle: [K_B('def verschluesseln(satz, abstand):'), K_B('def entschluesseln(satz, abstand):'), K_B('for ¦ in :'), K_B("'a' <= ¦ <= 'z'"), K_B('.lower()'), K_B('+= ')],
    tipps: ['Leerer Text ergebnis = "", dann Zeichen für Zeichen anhängen.', "Buchstabe? 'a' <= buchstabe.lower() <= 'z' (buchstabe.isalpha() würde auch ä erwischen).", 'entschluesseln ist verschluesseln mit -abstand.'],
    loesung: V_VERSCHIEBE.split('\n').slice(V_VERSCHIEBE.split('\n').findIndex((z) => z.startsWith('def verschluesseln'))).join('\n') }),
  KRYPTO({ id: 'fa4', kapitel: 80, sortArt: 'funktion', ico: '🔨', titel: 'Alle 26 Schlüssel probieren', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Abgefangene Tauben',
    tabelle: () => ({ html: krBild(`${geheimBild('Taube 1', jsCaesar('treffen am nordtor um mitternacht', 11))}${geheimBild('Taube 2', jsCaesar('die kiste liegt unter der bruecke', 22))}`) }),
    ziel: 'Schreib brute_force(geheim, wort): Probier alle Abstände von 0 bis 25 und gib den Abstand zurück, bei dem im entschlüsselten Text das Wort vorkommt (sonst -1). entschluesseln gibt es schon.',
    story: 'Der Feind schickt Caesar-Tauben. Wir wissen nicht welcher Abstand – aber es gibt nur 26 Möglichkeiten. Und Spione beginnen ihre Nachrichten gern mit denselben Wörtern.',
    vorspann: V_VERSCHIEBE,
    listen: [[], [], []], aufrufFn: (l, k) => [`brute_force("${jsCaesar('treffen am nordtor um mitternacht', 11)}", "nordtor")`, `brute_force("${jsCaesar('die kiste liegt unter der bruecke', 22)}", "kiste")`, `brute_force("${jsCaesar('nichts zu melden', 5)}", "drache")`][k],
    soll: (l, k) => [11, 22, -1][k], testName: (k) => ['Taube 1', 'Taube 2', 'Wort kommt nicht vor'][k],
    befehle: [K_B('def brute_force(geheim, wort):'), K_B('range(26)'), K_B('entschluesseln(¦, )')],
    tipps: ['for abstand in range(26): … entschluesseln(geheim, abstand)', 'wort in text prüft, ob das Wort im Text vorkommt.', 'Nach der Schleife: return -1'],
    loesung: 'def brute_force(geheim, wort):\n    for abstand in range(26):\n        if wort in entschluesseln(geheim, abstand):\n            return abstand\n    return -1' }),

  // --- Kapitel 81: 📊 Häufigkeitsanalyse (Kurs 8.2, 8.6) ---
  KRYPTO({ id: 'fb1', kapitel: 81, sortArt: 'funktion', ico: '📊', titel: 'Buchstaben zählen', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Häufigkeiten',
    tabelle: () => ({ html: krBild(haeufBild(KLAR_1, 'Häufigkeiten in einem deutschen Text')) }),
    ziel: 'Schreib haeufigkeiten(text): ein Dictionary, das zu jedem Großbuchstaben A–Z zählt, wie oft er (groß oder klein) im Text vorkommt. Andere Zeichen zählen nicht.',
    merke: { titel: '📊 Häufigkeitsanalyse', text: 'In jeder Sprache kommen Buchstaben unterschiedlich oft vor – im Deutschen ist e mit Abstand der häufigste (etwa 17 %), dann n, i, s, r. Eine monoalphabetische Verschlüsselung (Caesar, multiplikativ, Substitution) ersetzt jeden Buchstaben immer gleich: Die Häufigkeiten bleiben erhalten und verraten den Schlüssel.', code: 'if zeichen in zaehler:\n    zaehler[zeichen] += 1\nelse:\n    zaehler[zeichen] = 1' },
    listen: [[], [], []], aufrufFn: (l, k) => ['haeufigkeiten("Hallo Welt")', 'haeufigkeiten("abc, ABC!")', `haeufigkeiten("${KLAR_1}")`][k],
    soll: (l, k) => [jsHaeuf('Hallo Welt'), jsHaeuf('abc, ABC!'), jsHaeuf(KLAR_1)][k], testName: (k) => ['Hallo Welt', 'groß und klein', 'langer Text'][k],
    befehle: [K_B('def haeufigkeiten(text):'), K_B('.upper()'), K_B('.get(¦, 0)')],
    tipps: ['text.upper() macht alles groß.', "Nur Zeichen mit 'A' <= zeichen <= 'Z' zählen.", 'zaehler.get(zeichen, 0) gibt 0, wenn der Buchstabe noch nicht im Dictionary steht.'],
    loesung: "def haeufigkeiten(text):\n    zaehler = {}\n    for zeichen in text.upper():\n        if 'A' <= zeichen <= 'Z':\n            zaehler[zeichen] = zaehler.get(zeichen, 0) + 1\n    return zaehler" }),
  KRYPTO({ id: 'fb2', kapitel: 81, sortArt: 'funktion', ico: '🕵️', titel: 'Caesar ohne Wörterbuch knacken', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Abgefangene Taube',
    tabelle: (lauf, k) => { const g = [GEHEIM_1, GEHEIM_2][lauf ? k : 0];
      return { html: krBild(`${geheimBild(`Taube ${lauf ? k + 1 : 1}`, g)}${haeufBild(g, 'Häufigkeiten im Geheimtext')}${lauf ? `<p class="hinweis">Mit deinem Abstand entschlüsselt: <i>${esc(jsCaesar(g, -(lauf.wert || 0)).slice(0, 70))} …</i></p>` : ''}`) }; },
    ziel: 'Schreib caesar_knacken(geheim): Finde den häufigsten Buchstaben im Geheimtext – er steht vermutlich für e. Gib den Abstand zurück (0 bis 25).',
    listen: [[], []], aufrufFn: (l, k) => `caesar_knacken("${[GEHEIM_1, GEHEIM_2][k]}")`, soll: (l, k) => [7, 19][k], testName: (k) => `Taube ${k + 1}`,
    befehle: [K_B('def caesar_knacken(geheim):'), K_B('.get(¦, 0)'), K_B('for ¦ in :'), K_B('if ¦ > :'), K_B("ord('e')"), K_B('% 26')],
    tipps: ['Erst zählen (wie eben, diesmal klein), dann den Buchstaben mit der größten Zahl suchen.', 'Maximumsuche im Wörterbuch: Merke dir den bisher häufigsten Buchstaben (am Anfang ""). Geh alle Buchstaben b durch – kommt b öfter vor, ist b der neue häufigste.', 'Abstand = Position des häufigsten Buchstabens minus Position von e – mit % 26, damit er nicht negativ wird.'],
    loesung: "def caesar_knacken(geheim):\n    zaehler = {}\n    for zeichen in geheim:\n        if 'a' <= zeichen <= 'z':\n            zaehler[zeichen] = zaehler.get(zeichen, 0) + 1\n    haeufigster = \"\"\n    for b in zaehler:\n        if haeufigster == \"\" or zaehler[b] > zaehler[haeufigster]:\n            haeufigster = b\n    return (ord(haeufigster) - ord('e')) % 26" }),
  KRYPTO({ id: 'fb3', fertig: true, kapitel: 81, sortArt: 'funktion', ico: '✖️', titel: 'Die multiplikative Chiffre', lohn: 70,
    ziel: 'Schreib multiplikative_chiffre(text, schluessel): Jeder Buchstabe (groß gemacht) bekommt den Index (Index · schluessel) % 26 im Alphabet A–Z. Andere Zeichen bleiben.',
    listen: [[], [], []], aufrufFn: (l, k) => ['multiplikative_chiffre("Der Informatik-LK schreibt heute Klausur!", 5)', 'multiplikative_chiffre("abc xyz", 3)', 'multiplikative_chiffre("Taube", 1)'][k],
    soll: (l, k) => [jsMult('Der Informatik-LK schreibt heute Klausur!', 5), jsMult('abc xyz', 3), 'TAUBE'][k], testName: (k) => ['Klausursatz', 'abc xyz', 'Schlüssel 1'][k],
    befehle: [K_B('def multiplikative_chiffre(text, schluessel):'), K_B('"ABCDEFGHIJKLMNOPQRSTUVWXYZ"'), K_B('.upper()'), K_B('.index(¦)'), K_B('% 26')],
    tipps: ['alphabet.index(buchstabe) liefert die Position 0–25.', 'Nur Buchstaben aus alphabet verschlüsseln: if buchstabe in alphabet:'],
    loesung: 'def multiplikative_chiffre(text, schluessel):\n    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"\n    chiffre = ""\n    for buchstabe in text.upper():\n        if buchstabe in alphabet:\n            buchstabe_index = alphabet.index(buchstabe)\n            chiffre += alphabet[(buchstabe_index * schluessel) % 26]\n        else:\n            chiffre += buchstabe\n    return chiffre' }),
  KRFRAGEN({ id: 'fb4', kapitel: 81, ico: '🔢', titel: 'Wie viele Schlüssel gibt es?', lohn: 65,
    ziel: 'Der Schlüsselraum entscheidet, ob Durchprobieren reicht.',
    fragen: [{ art: 'zahl', text: 'Wie viele sinnvolle Caesar-Schlüssel gibt es (Abstand 0 verschlüsselt nichts)?', soll: () => 25 },
      W('Multiplikative Chiffre mit Schlüssel 13: A → A, C → A. Was ist das Problem?', ['die Buchstaben werden gar nicht verändert', 'zwei Buchstaben werden gleich verschlüsselt – man kann nicht mehr eindeutig entschlüsseln', 'das Entschlüsseln dauert dann viel zu lange', 'der Schlüssel 13 ist zu groß für das Alphabet'], 1),
      W('Welche Schlüssel taugen für die multiplikative Chiffre?', ['alle Zahlen von 1 bis 25 außer der 13', 'alle, die zu 26 teilerfremd sind – also ggT(a, 26) = 1', 'nur die ungeraden Zahlen von 1 bis 25', 'nur die Primzahlen zwischen 2 und 25'], 1),
      { art: 'zahl', text: 'Wie viele Zahlen von 1 bis 25 sind teilerfremd zu 26?', soll: () => [...Array(25)].filter((_, i) => jsGgt(i + 1, 26) === 1).length },
      W('Bei einer beliebigen Buchstaben-Ersetzung gibt es 26! ≈ 4 · 10²⁶ Schlüssel. Ist sie damit sicher?', ['ja, Durchprobieren aller Schlüssel dauert zu lange', 'nein, die Häufigkeitsanalyse knackt sie trotzdem – jeder Buchstabe wird immer gleich ersetzt', 'ja, wenn man nur Großbuchstaben verwendet', 'nein, ein Rechner probiert 26! Schlüssel schnell durch'], 1)],
    tipps: ['Teilerfremd zu 26 = weder durch 2 noch durch 13 teilbar.'] }),

  // --- Kapitel 82: 🔑 Vigenère und One-Time-Pad (Kurs 8.3–8.5) ---
  KRYPTO({ id: 'fc1', kapitel: 82, sortArt: 'funktion', ico: '🔑', titel: 'Vigenère', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Schlüsselwort INFO',
    tabelle: () => ({ html: krBild(`<div class="dbtab"><div class="dbscroll"><table><tr><th>Klartext</th>${[...'computerraum'].map((z) => `<td>${z}</td>`).join('')}</tr><tr><th>Schlüssel</th>${[...'computerraum'].map((_, i) => `<td>${'info'[i % 4]}</td>`).join('')}</tr><tr><th>Geheimtext</th>${[...jsVig('computerraum', 'info')].map((z) => `<td><b>${z}</b></td>`).join('')}</tr></table></div></div><p class="hinweis">Jeder Schlüsselbuchstabe ist ein eigener Caesar-Abstand (a = 0, i = 8 …). Leer- und Satzzeichen verbrauchen keinen Schlüsselbuchstaben.</p>`) }),
    ziel: 'Schreib vigenere_encrypt(plain_text, key): Der j-te Buchstabe des Textes wird um den Abstand des Schlüsselbuchstabens key[j % len(key)] verschoben. Nicht-Buchstaben bleiben und zählen nicht mit. verschiebe gibt es schon.',
    merke: { titel: '🔑 Vigenère', text: 'Vigenère verschiebt jeden Buchstaben mit einem anderen Caesar-Abstand – reihum nach den Buchstaben eines Schlüsselworts. Gleiche Klartextbuchstaben werden so verschieden verschlüsselt (polyalphabetisch); die einfache Häufigkeitsanalyse versagt. Der Kasiski-Test findet die Schlüssellänge, danach ist jede Gruppe wieder nur Caesar.', code: 'key_char = key[j % len(key)]\nshift = ord(key_char.lower()) - ord("a")\nencrypted_text += verschiebe(char, shift)\nj += 1' },
    vorspann: V_VERSCHIEBE.split('\ndef verschluesseln')[0] + '\n',
    listen: [[], [], []], aufrufFn: (l, k) => ['vigenere_encrypt("computerraum", "info")', 'vigenere_encrypt("Hallo. Wie geht es dir?", "Blume")', 'vigenere_encrypt("aaaa aaaa", "abc")'][k],
    soll: (l, k) => [jsVig('computerraum', 'info'), jsVig('Hallo. Wie geht es dir?', 'Blume'), jsVig('aaaa aaaa', 'abc')][k], testName: (k) => ['computerraum / info', 'mit Satzzeichen', 'Schlüssel sichtbar machen'][k],
    befehle: [K_B('def vigenere_encrypt(plain_text, key):'), K_B('key[¦ % len(key)]'), K_B('ord(¦)'), K_B('verschiebe(¦, )')],
    tipps: ['Ein eigener Zähler j zählt nur die Buchstaben – nicht die Position im Text.', 'Der Abstand ist die Position des Schlüsselbuchstabens im Alphabet (a = 0): ord(…) minus ord("a").', "Nur bei Buchstaben ('a' <= char.lower() <= 'z') verschieben und j erhöhen."],
    loesung: "def vigenere_encrypt(plain_text, key):\n    encrypted_text = ''\n    j = 0\n    for char in plain_text:\n        if 'a' <= char.lower() <= 'z':\n            key_char = key[j % len(key)]\n            shift = ord(key_char.lower()) - ord('a')\n            encrypted_text += verschiebe(char, shift)\n            j += 1\n        else:\n            encrypted_text += char\n    return encrypted_text" }),
  // Rückweg (Didaktik-Prüfung: Krypto nur vorwärts)
  KRYPTO({ id: 'fc1d', kapitel: 82, sortArt: 'funktion', ico: '🔓', titel: 'Vigenère entschlüsseln', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Abgefangene Taube',
    tabelle: () => ({ html: krBild(`${geheimBild('Taube an die Heldin (Schlüssel INFO)', jsVig('Treffen am Nordtor, kommt allein!', 'info'))}<p class="hinweis">Mit dem Schlüssel kommt man den Weg zurück: jeder Buchstabe wird um den Abstand seines Schlüsselbuchstabens zurückgeschoben.</p>`) }),
    ziel: 'Schreib vigenere_decrypt(cipher_text, key): der Rückweg zu vigenere_encrypt. Nicht-Buchstaben bleiben und verbrauchen keinen Schlüsselbuchstaben. verschiebe gibt es schon.',
    vorspann: V_VERSCHIEBE.split('\ndef verschluesseln')[0] + '\n',
    listen: [[], [], []], aufrufFn: (l, k) => [`vigenere_decrypt("${jsVig('Treffen am Nordtor, kommt allein!', 'info')}", "info")`, `vigenere_decrypt("${jsVig('Hallo. Wie geht es dir?', 'Blume')}", "Blume")`, 'vigenere_decrypt("bcde fgh", "b")'][k],
    soll: (l, k) => [jsVig(jsVig('Treffen am Nordtor, kommt allein!', 'info'), 'info', -1), jsVig(jsVig('Hallo. Wie geht es dir?', 'Blume'), 'Blume', -1), jsVig('bcde fgh', 'b', -1)][k],
    testName: (k) => ['Taube an die Heldin', 'mit Satzzeichen', 'Schlüssel b'][k],
    befehle: [K_B('def vigenere_decrypt(cipher_text, key):'), K_B('key[¦ % len(key)]')],
    tipps: ['Fast wie vigenere_encrypt – mit eigenem Zähler j, der nur Buchstaben zählt.', 'Der Unterschied: Mit dem negativen Abstand schiebt verschiebe zurück.', 'Den Abstand berechnest du wie beim Verschlüsseln aus dem Schlüsselbuchstaben key[j % len(key)].'],
    loesung: "def vigenere_decrypt(cipher_text, key):\n    plain_text = ''\n    j = 0\n    for char in cipher_text:\n        if 'a' <= char.lower() <= 'z':\n            key_char = key[j % len(key)]\n            shift = ord(key_char.lower()) - ord('a')\n            plain_text += verschiebe(char, -shift)\n            j += 1\n        else:\n            plain_text += char\n    return plain_text" }),
  KRYPTO({ id: 'fc2', kapitel: 82, sortArt: 'funktion', ico: '📏', titel: 'Kasiski: Abstände messen', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Geheimtext mit Wiederholungen',
    tabelle: () => ({ html: krBild(`${geheimBild('Taube (Vigenère, Schlüssel unbekannt)', KASISKI_TEXT)}<p class="hinweis">Kommt dieselbe Buchstabenfolge mehrmals vor, ist ihr Abstand oft ein Vielfaches der Schlüssellänge.</p>`) }),
    ziel: 'Schreib abstaende(text, folge): Suche alle Stellen, an denen folge im Text beginnt, und gib die Abstände zwischen je zwei aufeinanderfolgenden Fundstellen zurück.',
    listen: [[], [], [], []], aufrufFn: (l, k) => [`abstaende("${KASISKI_TEXT}", "${K_F1}")`, `abstaende("${KASISKI_TEXT}", "${K_F2}")`, 'abstaende("abcabcab", "ab")', 'abstaende("taube", "xyz")'][k],
    soll: (l, k) => [jsAbstaende(KASISKI_TEXT, K_F1), jsAbstaende(KASISKI_TEXT, K_F2), [3, 3], []][k], testName: (k) => [`Folge ${K_F1}`, `Folge ${K_F2}`, 'abcabcab', 'kommt nicht vor'][k],
    befehle: [K_B('def abstaende(text, folge):'), K_B('range(¦)'), K_B('len(¦)'), K_B('text[¦:]'), K_B('.append(¦)')],
    tipps: ['Erst alle Startpositionen sammeln: text[i:i + len(folge)] == folge.', 'Dann die Differenzen benachbarter Positionen.'],
    loesung: 'def abstaende(text, folge):\n    positionen = []\n    for i in range(len(text) - len(folge) + 1):\n        if text[i:i + len(folge)] == folge:\n            positionen.append(i)\n    ergebnis = []\n    for k in range(len(positionen) - 1):\n        ergebnis.append(positionen[k + 1] - positionen[k])\n    return ergebnis' }),
  KRFRAGEN({ id: 'fc3', kapitel: 82, ico: '🧮', titel: 'Wie lang ist der Schlüssel?', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Kasiski-Test',
    tabelle: () => ({ html: krBild(`${geheimBild('Taube (Vigenère)', KASISKI_TEXT)}<p>Abstände der Folge <b>${K_F1}</b>: ${jsAbstaende(KASISKI_TEXT, K_F1).join(', ')} · der Folge <b>${K_F2}</b>: ${jsAbstaende(KASISKI_TEXT, K_F2).join(', ')}</p>`) }),
    ziel: 'Schließe aus den Abständen auf die Schlüssellänge.',
    fragen: [{ art: 'zahl', text: 'Welche Schlüssellänge ist am wahrscheinlichsten (größter gemeinsamer Teiler der Abstände)?', soll: () => [...jsAbstaende(KASISKI_TEXT, K_F1), ...jsAbstaende(KASISKI_TEXT, K_F2)].reduce(jsGgt) },
      W('Warum hilft die Schlüssellänge?', ['dann kennt man sofort den ganzen Klartext', 'dann ist jeder 4. Buchstabe wieder Caesar – er ist mit demselben Schlüsselbuchstaben verschlüsselt, und die Häufigkeitsanalyse geht', 'dann wird der Geheimtext kürzer und lesbar', 'dann kann man den Schlüssel einfach raten'], 1),
      W('Warum war Vigenère lange „unknackbar“?', ['die Häufigkeitsanalyse versagt – gleiche Buchstaben werden je nach Position verschieden verschlüsselt', 'es gab damals noch keine Computer', 'der Schlüssel war unendlich lang', 'das Verfahren war streng geheim'], 0)],
    tipps: ['Gemeinsamer Teiler: Welche Zahl teilt alle Abstände?'] }),
  // Vigenère brechen (Didaktik-Prüfung: Krypto nur vorwärts) – Kasiski liefert die Länge, dann je Gruppe Caesar knacken
  KRYPTO({ id: 'fc5', kapitel: 82, sortArt: 'funktion', ico: '🗝️', titel: 'Vigenère knacken', lohn: 90, ansicht: 'tabelle', titelAnsicht: 'Lange Taube, Schlüssel unbekannt',
    tabelle: (lauf, k) => { const [g, key] = KR_LANG[lauf ? k : 0];
      return { html: krBild(`${geheimBild(`Taube ${lauf ? k + 1 : 1} – Kasiski sagt: Schlüssellänge ${key.length}`, g)}${lauf && typeof lauf.wert === 'string' ? `<p class="hinweis">Mit deinem Schlüssel „${esc(lauf.wert)}“ entschlüsselt: <i>${esc(jsVig(g, lauf.wert.length ? lauf.wert : 'a', -1).slice(0, 70))} …</i></p>` : ''}`) }; },
    story: 'Der Feind hat dazugelernt und schickt Vigenère-Tauben. Aber die Briefe sind lang – und der Kasiski-Test hat uns die Schlüssellänge verraten. Jetzt zerlegen wir den Text in Gruppen.',
    ziel: 'Schreib vigenere_knacken(geheim, laenge): Teile die Buchstaben des Geheimtexts in laenge Gruppen (Gruppe i = Buchstabe i, i + laenge, i + 2·laenge …). Jede Gruppe ist Caesar-verschlüsselt: caesar_knacken(gruppe) liefert ihren Abstand. Gib den Schlüssel als Wort zurück (Abstand 0 = a, 1 = b …). caesar_knacken gibt es schon.',
    vorspann: "def caesar_knacken(geheim):\n    zaehler = {}\n    for zeichen in geheim:\n        if 'a' <= zeichen <= 'z':\n            zaehler[zeichen] = zaehler.get(zeichen, 0) + 1\n    haeufigster = \"\"\n    for b in zaehler:\n        if haeufigster == \"\" or zaehler[b] > zaehler[haeufigster]:\n            haeufigster = b\n    return (ord(haeufigster) - ord('e')) % 26\n",
    listen: KR_LANG.map(() => []), aufrufFn: (l, k) => `vigenere_knacken("${KR_LANG[k][0]}", ${KR_LANG[k][1].length})`, soll: (l, k) => krVigKnacken(KR_LANG[k][0], KR_LANG[k][1].length),
    testName: (k) => `Taube ${k + 1}`,
    befehle: [K_B('def vigenere_knacken(geheim, laenge):'), K_B("'a' <= ¦ <= 'z'"), K_B("chr(¦ + ord('a'))")],
    tipps: ['Erst nur die Buchstaben sammeln (Leer- und Satzzeichen weg) – in einen Text buchstaben.', 'Gruppe i: alle buchstaben[j], bei denen j % laenge == i ist (oder kurz: buchstaben[i::laenge]).', "Für jede Gruppe: abstand = caesar_knacken(gruppe), schluessel += chr(abstand + ord('a'))."],
    loesung: "def vigenere_knacken(geheim, laenge):\n    buchstaben = ''\n    for zeichen in geheim:\n        if 'a' <= zeichen <= 'z':\n            buchstaben += zeichen\n    schluessel = ''\n    for i in range(laenge):\n        gruppe = ''\n        for j in range(len(buchstaben)):\n            if j % laenge == i:\n                gruppe += buchstaben[j]\n        schluessel += chr(caesar_knacken(gruppe) + ord('a'))\n    return schluessel" }),
  KRYPTO({ id: 'fc4', kapitel: 82, sortArt: 'funktion', ico: '📜', titel: 'Das One-Time-Pad', lohn: 75,
    ziel: 'Schreib otp_verschluesseln(nachricht, schluessel) für Großbuchstaben A–Z: Buchstabe für Buchstabe (Nachricht + Schlüssel) mod 26. Sind beide nicht gleich lang, gib "" zurück – ein zu kurzer Schlüssel ist kein One-Time-Pad.',
    merke: { titel: '📜 One-Time-Pad', text: 'Beim One-Time-Pad ist der Schlüssel echt zufällig, genauso lang wie die Nachricht, geheim und wird nur ein einziges Mal benutzt. Dann ist das Verfahren beweisbar sicher: Jeder Klartext gleicher Länge ist gleich wahrscheinlich. Der Haken: Man muss so viel Schlüssel sicher austauschen, wie man Nachrichten schickt.', code: 'g = (ord(n) - ord("A") + ord(s) - ord("A")) % 26' },
    listen: [[], [], []], aufrufFn: (l, k) => ['otp_verschluesseln("INFO", "XMCK")', 'otp_verschluesseln("TAUBENPOST", "QWERTZUIOP")', 'otp_verschluesseln("GEHEIM", "ABC")'][k],
    soll: (l, k) => [jsOtp('INFO', 'XMCK'), jsOtp('TAUBENPOST', 'QWERTZUIOP'), ''][k], testName: (k) => ['INFO / XMCK', 'TAUBENPOST', 'Schlüssel zu kurz'][k],
    befehle: [K_B('def otp_verschluesseln(nachricht, schluessel):'), K_B('len(¦)'), K_B('range(¦)'), K_B("ord(¦) - ord('A')"), K_B("chr(¦ + ord('A'))"), K_B('% 26')],
    tipps: ['Länge prüfen, dann mit einem Index i durch beide Texte gleichzeitig.', "Zahl des Buchstabens: ord(z) - ord('A'). Zurück: chr(zahl + ord('A'))."],
    loesung: "def otp_verschluesseln(nachricht, schluessel):\n    if len(nachricht) != len(schluessel):\n        return ''\n    geheim = ''\n    for i in range(len(nachricht)):\n        g = (ord(nachricht[i]) - ord('A') + ord(schluessel[i]) - ord('A')) % 26\n        geheim += chr(g + ord('A'))\n    return geheim" }),

  // --- Kapitel 83: 🧱 Moderne Blockchiffren (Kurs 8.6, 8.7: Mini-AES-8) ---
  KRYPTO({ id: 'fd1', fertig: true, kapitel: 83, sortArt: 'funktion', ico: '🧱', titel: 'Mini-AES: SubBytes und XOR', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'S-Box',
    tabelle: () => ({ html: krBild(`<div class="dbtab"><div class="dbscroll"><table><tr><th>ein</th>${HEX.map((h) => `<td>${h}</td>`).join('')}</tr><tr><th>SBOX</th>${SBOX.map((h) => `<td><b>${h}</b></td>`).join('')}</tr></table></div></div><p class="hinweis">Ein Byte = zwei Hex-Zeichen (Nibbles). XOR: gleiche Bits → 0, verschiedene → 1. HEX, SBOX, HEX_TO_BIN und BIN_TO_HEX gibt es schon.</p>`) }),
    ziel: 'Schreib sub_bytes_hex(byte_str): Jedes der beiden Hex-Zeichen wird über die SBOX ersetzt. Und xor_hex_digit(a, b): XOR zweier Hex-Zeichen Bit für Bit über HEX_TO_BIN und BIN_TO_HEX.',
    merke: { titel: '🧱 Blockchiffren (AES)', text: 'Moderne Verfahren wie AES verschlüsseln Blöcke aus Bits in mehreren Runden. Jede Runde ersetzt (Substitution über eine S-Box → Konfusion), vertauscht (Permutation → Diffusion: ein geändertes Bit wirkt auf viele) und verknüpft mit dem Rundenschlüssel per XOR. AES ist symmetrisch: derselbe Schlüssel ver- und entschlüsselt.', code: 'def xor_hex_digit(a, b):\n    bin_a = HEX_TO_BIN[a]\n    bin_b = HEX_TO_BIN[b]\n    …' },
    vorspann: V_AES,
    listen: [[], [], [], [], []], aufrufFn: (l, k) => ['sub_bytes_hex("3A")', 'sub_bytes_hex("F0")', 'xor_hex_digit("A", "5")', 'xor_hex_digit("C", "C")', 'xor_hex_digit("7", "9")'][k],
    soll: (l, k) => [jsSub('3A'), jsSub('F0'), jsXor('A', '5'), jsXor('C', 'C'), jsXor('7', '9')][k], testName: (k) => ['SubBytes 3A', 'SubBytes F0', 'A xor 5', 'C xor C', '7 xor 9'][k],
    befehle: [K_B('def sub_bytes_hex(byte_str):'), K_B('HEX.index(¦)'), K_B('def xor_hex_digit(a, b):'), K_B('HEX_TO_BIN[¦]')],
    tipps: ['HEX.index("3") liefert 3 – damit holst du SBOX[3].', 'xor: bin_a = HEX_TO_BIN[a], dann für i in range(4) gleiche Bits → "0", sonst "1".', 'Zum Schluss BIN_TO_HEX[result_bits].'],
    loesung: 'def sub_bytes_hex(byte_str):\n    return SBOX[HEX.index(byte_str[0])] + SBOX[HEX.index(byte_str[1])]\n\ndef xor_hex_digit(a, b):\n    bin_a = HEX_TO_BIN[a]\n    bin_b = HEX_TO_BIN[b]\n    result_bits = ""\n    for i in range(4):\n        if bin_a[i] == bin_b[i]:\n            result_bits += "0"\n        else:\n            result_bits += "1"\n    return BIN_TO_HEX[result_bits]' }),
  KRYPTO({ id: 'fd2', kapitel: 83, sortArt: 'funktion', ico: '🔁', titel: 'Mini-AES: eine ganze Runde', lohn: 80,
    ziel: 'sub_bytes_hex und xor_hex_digit gibt es jetzt. Schreib permute_hex(byte_str) (die beiden Hex-Zeichen tauschen), add_round_key_hex(byte_str, key_str) (zeichenweise XOR) und runde(byte_str, key_str) = SubBytes → Permutation → AddRoundKey.',
    vorspann: V_AES + 'def sub_bytes_hex(byte_str):\n    return SBOX[HEX.index(byte_str[0])] + SBOX[HEX.index(byte_str[1])]\n\ndef xor_hex_digit(a, b):\n    return HEX[HEX.index(a) ^ HEX.index(b)]\n',
    listen: [[], [], [], []], aufrufFn: (l, k) => ['permute_hex("3A")', 'add_round_key_hex("3A", "F0")', 'runde("3A", "5C")', 'runde("00", "00")'][k],
    soll: (l, k) => ['A3', jsRoundKey('3A', 'F0'), jsRunde('3A', '5C'), jsRunde('00', '00')][k], testName: (k) => ['Permutation', 'Rundenschlüssel', 'Runde 3A / 5C', 'Runde 00 / 00'][k],
    befehle: [K_B('def permute_hex(byte_str):'), K_B('def add_round_key_hex(byte_str, key_str):'), K_B('def runde(byte_str, key_str):')],
    tipps: ['permute_hex: Das zweite Zeichen kommt nach vorn: byte_str[1] + …', 'add_round_key_hex: Zeichen 0 mit Zeichen 0 verknüpfen, Zeichen 1 mit Zeichen 1 – je mit xor_hex_digit – und die Ergebnisse aneinanderhängen.', 'runde: Die drei Schritte ineinander einsetzen – innen SubBytes, dann Permutation, außen AddRoundKey.'],
    loesung: 'def permute_hex(byte_str):\n    return byte_str[1] + byte_str[0]\n\ndef add_round_key_hex(byte_str, key_str):\n    return xor_hex_digit(byte_str[0], key_str[0]) + xor_hex_digit(byte_str[1], key_str[1])\n\ndef runde(byte_str, key_str):\n    return add_round_key_hex(permute_hex(sub_bytes_hex(byte_str)), key_str)' }),
  // Lawineneffekt messen (Didaktik-Prüfung): Diffusion nicht nur als Satz, sondern gezählt
  KRYPTO({ id: 'fd2v', kapitel: 83, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🏔️', titel: 'Die Lawine messen', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'S-Box und Bits',
    tabelle: () => ({ html: krBild(`<div class="dbtab"><div class="dbscroll"><table><tr><th>ein</th>${HEX.map((h) => `<td>${h}</td>`).join('')}</tr><tr><th>SBOX</th>${SBOX.map((h) => `<td><b>${h}</b></td>`).join('')}</tr><tr><th>Bits</th>${HEX.map((h, i) => `<td style="font-size:10px">${i.toString(2).padStart(4, '0')}</td>`).join('')}</tr></table></div></div><p class="hinweis">Zwei Klartexte, die sich in genau einem Bit unterscheiden (3A und 3B), laufen durch zwei Runden Mini-AES. Rechne beide auf einem Zettel mit.</p>`) }),
    ziel: 'Zwei Klartexte unterscheiden sich in nur einem Bit. Wie viele Bits sind nach einer und nach zwei Runden verschieden? Sag es voraus.',
    vorspann: V_AES + 'def xor_hex_digit(a, b):\n    return HEX[HEX.index(a) ^ HEX.index(b)]\n',
    listen: [[]], code: `def runde(byte_str, key_str):
    s = SBOX[HEX.index(byte_str[0])] + SBOX[HEX.index(byte_str[1])]   # SubBytes
    p = s[1] + s[0]                                                    # Permutation
    return xor_hex_digit(p[0], key_str[0]) + xor_hex_digit(p[1], key_str[1])   # AddRoundKey

def bits_verschieden(x, y):
    n = 0
    for i in range(2):
        a = HEX_TO_BIN[x[i]]
        b = HEX_TO_BIN[y[i]]
        for j in range(4):
            if a[j] != b[j]:
                n = n + 1
    return n

def versuch():
    a = "3A"
    b = "3B"          # nur das letzte Bit ist anders
    a1 = runde(a, "5C")
    b1 = runde(b, "5C")
    a2 = runde(a1, "A7")
    b2 = runde(b1, "A7")
    return [a1, b1, bits_verschieden(a1, b1), bits_verschieden(a2, b2)]`,
    fragen: [{ art: 'liste', text: 'Welche Werte haben a1 und b1 nach Runde 1? (z. B. 4F 0C)', soll: (l) => l.wert.slice(0, 2) },
      { art: 'zahl', text: 'In wie vielen Bits unterscheiden sich a1 und b1?', soll: (l) => l.wert[2] },
      { art: 'zahl', text: 'Und nach Runde 2 – in wie vielen Bits unterscheiden sich a2 und b2?', soll: (l) => l.wert[3] },
      W('Am Anfang war genau 1 Bit anders. Was zeigt die Messung?', ['Diffusion – eine kleine Änderung breitet sich mit jeder Runde auf mehr Bits aus', 'Konfusion – der Schlüssel wird mit jeder Runde länger', 'ein Fehler – gute Verfahren ändern nur dieses eine Bit', 'gar nichts – das ist Zufall'], 0)],
    tipps: ['SubBytes für 3A: SBOX[3] = 1, SBOX[A] = 6 → 16. Tauschen → 61. XOR mit 5C: 6 xor 5 und 1 xor C.', 'XOR Bit für Bit: 6 = 0110, 5 = 0101 → 0011 = 3.', 'Schreib jede Hex-Ziffer als 4 Bits (Zeile „Bits“ in der Tabelle) und zähle die Stellen, die verschieden sind.'] }),
  KRFRAGEN({ id: 'fd3', kapitel: 83, ico: '🧊', titel: 'Symmetrisch – und das Problem', lohn: 65,
    ziel: 'Was macht AES stark, und wo liegt die Schwäche aller symmetrischen Verfahren?',
    fragen: [W('Die S-Box (Substitution) sorgt vor allem für …', ['Konfusion – der Zusammenhang zwischen Schlüssel und Geheimtext wird verschleiert', 'Diffusion', 'Integrität', 'Kompression'], 0),
      W('Die Permutation über viele Runden sorgt vor allem für …', ['Diffusion – ändert sich ein Bit im Klartext, ändern sich viele Bits im Geheimtext', 'Konfusion', 'Integrität', 'Kompression'], 0),
      { art: 'zahl', text: 'AES-128 hat 2^128 Schlüssel. Wie viele Stellen hat 2^128 ungefähr im Dezimalsystem? (2^10 ≈ 1000)', soll: () => 39, tol: 0.03 },
      W('Das große Problem aller symmetrischen Verfahren ist …', ['die geringe Geschwindigkeit', 'der Schlüsselaustausch – beide brauchen vorher denselben geheimen Schlüssel', 'die zu kurzen Schlüssel', 'die Länge des Geheimtexts'], 1)],
    tipps: ['2^128 = (2^10)^12,8 ≈ 10^38,5'] }),

  // --- Kapitel 84: 🗝️ Öffentliche Schlüssel (Kurs 8.8–8.11) ---
  KRYPTO({ id: 'fe1', kapitel: 84, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🎨', titel: 'Diffie-Hellman', lohn: 70,
    ziel: 'Alice und Bob einigen sich über eine Leitung, die jeder abhören kann, auf einen geheimen Schlüssel. Rechne mit.',
    story: 'Die Tauben fliegen über Feindesland – jeder kann mitlesen. Trotzdem wollen der Torwächter und die Heldin einen gemeinsamen geheimen Schlüssel haben. Diffie und Hellman zeigten 1976, wie das geht.',
    listen: [[]], code: `def versuch():
    g = 5          # öffentlich
    p = 23         # öffentlich
    a = 6          # geheim (Alice)
    b = 15         # geheim (Bob)
    A = pow(g, a, p)       # Alice schickt A
    B = pow(g, b, p)       # Bob schickt B
    s_alice = pow(B, a, p)
    s_bob = pow(A, b, p)
    return [A, B, s_alice, s_bob]`,
    merke: { titel: '🎨 Diffie-Hellman', text: 'Öffentlich: Basis g und Primzahl p. Jeder wählt eine geheime Zahl (a, b) und schickt g^a mod p bzw. g^b mod p. Beide rechnen dann B^a mod p = A^b mod p = g^(a·b) mod p – denselben Schlüssel, der nie übertragen wurde. Ein Lauscher müsste a aus g^a mod p zurückrechnen (diskreter Logarithmus) – das ist bei großen Zahlen praktisch unmöglich. Schwachstelle: Man-in-the-Middle.', code: 'A = pow(g, a, p)\ns = pow(B, a, p)' },
    fragen: [{ art: 'zahl', text: 'Welche Zahl A schickt Alice?', soll: (l) => l.wert[0] },
      { art: 'zahl', text: 'Welche Zahl B schickt Bob?', soll: (l) => l.wert[1] },
      { art: 'zahl', text: 'Welchen gemeinsamen Schlüssel haben beide am Ende?', soll: (l) => l.wert[2] },
      W('Was kennt ein Lauscher auf der Leitung?', ['a und b', 'g, p, A und B – aber nicht a, b und den Schlüssel', 'nur den Schlüssel', 'gar nichts'], 1),
      W('Eve schaltet sich dazwischen und tauscht mit jedem einen eigenen Schlüssel aus. Das ist …', ['ein Brute-Force-Angriff auf den Schlüssel', 'ein Man-in-the-Middle-Angriff – dagegen helfen nur Zertifikate bzw. Signaturen', 'harmlos, solange p groß genug ist', 'eine Häufigkeitsanalyse'], 1)],
    tipps: ['pow(5, 6, 23) = 5⁶ mod 23. 5² = 25 ≡ 2, also 5⁶ = 2³ = 8.', 'Kontrolle: s_alice und s_bob müssen gleich sein.'] }),
  KRYPTO({ id: 'fe2', kapitel: 84, sortArt: 'funktion', ico: '➗', titel: 'ggT und modulares Inverses', lohn: 70,
    ziel: 'Schreib ggt(a, b) mit dem euklidischen Algorithmus und modulares_inverses(a, m): die Zahl i mit (a · i) % m == 1 (gibt es keine, None).',
    listen: [[], [], [], [], [], []], aufrufFn: (l, k) => ['ggt(48, 18)', 'ggt(17, 5)', 'ggt(120, 7)', 'modulares_inverses(7, 120)', 'modulares_inverses(5, 26)', 'modulares_inverses(13, 26)'][k],
    soll: (l, k) => [6, 1, 1, jsInv(7, 120), jsInv(5, 26), null][k], testName: (k) => ['ggt(48, 18)', 'ggt(17, 5)', 'ggt(120, 7)', 'Inverses von 7 mod 120', 'Inverses von 5 mod 26', '13 mod 26 hat keins'][k],
    befehle: [K_B('def ggt(a, b):'), K_B('def modulares_inverses(a, m):'), K_B('while ¦:'), K_B('range(¦, )'), K_B('None')],
    tipps: ['Euklid: Solange b nicht 0 ist, ersetze (a, b) durch (b, a % b). Dann ist a der ggT.', 'Inverses: Probiere alle i von 1 bis m − 1 durch und prüfe, ob a · i bei Division durch m den Rest 1 lässt.', 'Findet die Schleife kein passendes i, gibt die Funktion None zurück.'],
    loesung: 'def ggt(a, b):\n    while b != 0:\n        a, b = b, a % b\n    return a\n\ndef modulares_inverses(a, m):\n    for i in range(1, m):\n        if (a * i) % m == 1:\n            return i\n    return None' }),
  // Erweiterter Euklid (Didaktik-Prüfung: fehlte; im Abitur rechnet man d damit von Hand)
  KRYPTO({ id: 'fe2b', kapitel: 84, sortArt: 'funktion', ico: '🧮', titel: 'Der erweiterte Euklid', lohn: 85, ansicht: 'tabelle', titelAnsicht: 'Rückwärts einsetzen',
    tabelle: () => ({ html: krBild(`<pre class="mono dscode">ggT(72, 5):   72 = 14 · 5 + 2
              5 =  2 · 2 + 1
              2 =  2 · 1 + 0   → ggT = 1

rückwärts:    1 = 5 − 2 · 2
                = 5 − 2 · (72 − 14 · 5)
                = −2 · 72 + 29 · 5</pre><p class="hinweis">Also 72 · (−2) + 5 · 29 = 1. Darum ist 29 das Inverse von 5 modulo 72 – genau so findet man bei RSA den privaten Exponenten d.</p>`) }),
    ziel: 'Schreib erw_ggt(a, b): gib [g, x, y] zurück mit g = ggT(a, b) und a · x + b · y = g. Nimm die Rekursion: Ist b == 0, gilt [a, 1, 0]. Sonst liefert erw_ggt(b, a % b) schon [g, x, y] für das kleinere Paar – rechne daraus x und y für (a, b) aus.',
    merke: { titel: '🧮 Erweiterter Euklid', text: 'Der erweiterte euklidische Algorithmus liefert zum ggT zusätzlich x und y mit a · x + b · y = ggT(a, b). Ist der ggT 1, dann ist y (mod a) das Inverse von b modulo a. So berechnet man bei RSA d aus e und φ(n) – auch bei riesigen Zahlen, wo Durchprobieren nicht mehr geht.' },
    listen: KR_ERW_TESTS.map(() => []), aufrufFn: (l, k) => `erw_ggt(${KR_ERW_TESTS[k].join(', ')})`, soll: (l, k) => krErw(...KR_ERW_TESTS[k]),
    // Es gibt viele richtige (x, y) – geprüft wird die Gleichung, nicht ein bestimmtes Paar
    pruefWert: (w, k) => {
      const [a, b] = KR_ERW_TESTS[k], g = jsGgt(a, b);
      if (!Array.isArray(w) || w.length !== 3 || !w.every((x) => Number.isInteger(x))) return `erw_ggt(${a}, ${b}): Ergebnis ${ergebnisText(w)} – erwartet wird eine Liste [g, x, y] aus drei ganzen Zahlen.`;
      if (w[0] !== g) return `erw_ggt(${a}, ${b}): g = ${w[0]}, der ggT ist aber ${g}.`;
      if (a * w[1] + b * w[2] !== g) return `erw_ggt(${a}, ${b}): ${a} · ${w[1]} + ${b} · ${w[2]} = ${a * w[1] + b * w[2]}, nicht ${g}.`;
      return null;
    },
    okText: (w, k) => `erw_ggt(${KR_ERW_TESTS[k].join(', ')}) = [${w.join(', ')}] ✓`,
    testName: (k) => `erw_ggt(${KR_ERW_TESTS[k].join(', ')})`,
    befehle: [K_B('def erw_ggt(a, b):'), K_B('a // b')],
    tipps: ['Abbruch: b == 0 → return [a, 1, 0], denn a · 1 + 0 · 0 = a.', 'Sonst: g, x, y = erw_ggt(b, a % b). Es gilt b · x + (a % b) · y = g, und a % b = a − (a // b) · b.', 'Einsetzen und nach a und b ordnen: Vor a steht dann y, vor b steht x − (a // b) · y.'],
    loesung: 'def erw_ggt(a, b):\n    if b == 0:\n        return [a, 1, 0]\n    g, x, y = erw_ggt(b, a % b)\n    return [g, y, x - (a // b) * y]' }),
  KRYPTO({ id: 'fe2v', kapitel: 84, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '✏️', titel: 'RSA von Hand', lohn: 75,
    ziel: 'So läuft RSA im Abitur: Schlüssel erzeugen mit dem erweiterten Euklid, dann ver- und entschlüsseln. Rechne auf einem Zettel mit und sag voraus.',
    listen: [[]], code: `def erw_ggt(a, b):
    if b == 0:
        return [a, 1, 0]
    g, x, y = erw_ggt(b, a % b)
    return [g, y, x - (a // b) * y]

def versuch():
    p = 7
    q = 13
    e = 5
    n = p * q
    phi = (p - 1) * (q - 1)
    g, x, y = erw_ggt(phi, e)
    d = y % phi
    c = pow(10, e, n)       # Nachricht m = 10 verschlüsseln
    m = pow(c, d, n)        # und wieder entschlüsseln
    return [n, phi, [g, x, y], d, c, m]`,
    fragen: [{ art: 'liste', text: 'Welche Werte haben n und phi? (z. B. 15 8)', soll: (l) => l.wert.slice(0, 2) },
      { art: 'liste', text: 'Was liefert erw_ggt(phi, e)? (g x y, z. B. 1 3 -4)', soll: (l) => l.wert[2] },
      { art: 'zahl', text: 'Welchen privaten Exponenten d bekommt man?', soll: (l) => l.wert[3] },
      { art: 'zahl', text: 'Welcher Geheimtext c entsteht für m = 10?', soll: (l) => l.wert[4] },
      { art: 'zahl', text: 'Was kommt beim Entschlüsseln heraus?', soll: (l) => l.wert[5] }],
    tipps: ['n = 7 · 13, phi = 6 · 12.', 'Euklid für (72, 5): 72 = 14 · 5 + 2, 5 = 2 · 2 + 1. Rückwärts einsetzen wie bei der Aufgabe davor.', 'Probe: e · d mod phi muss 1 ergeben. 10⁵ mod 91: erst 10² = 100 ≡ 9 rechnen.'] }),
  KRYPTO({ id: 'fe3', kapitel: 84, sortArt: 'funktion', ico: '🗝️', titel: 'RSA selbst gebaut', lohn: 85,
    ziel: 'Schreib rsa_schluessel(p, q, e): gibt [n, phi, d] zurück (n = p·q, phi = (p−1)·(q−1), d = Inverses von e mod phi). Und rsa(m, exponent, n) = m hoch exponent mod n – damit wird ver- (mit e) und entschlüsselt (mit d). modulares_inverses gibt es schon.',
    merke: { titel: '🗝️ RSA', text: 'Schlüsselerzeugung: zwei Primzahlen p, q; n = p · q; φ(n) = (p − 1)(q − 1); e teilerfremd zu φ(n); d mit e · d mod φ(n) = 1. Öffentlicher Schlüssel (e, n), privater (d, n). Verschlüsseln c = m^e mod n, entschlüsseln m = c^d mod n. Sicher, weil man n bei großen Primzahlen praktisch nicht in p und q zerlegen kann.', code: '# Beispiel mit kleinen Zahlen\n# p = 5, q = 11  →  n = 55, φ(n) = 4 · 10 = 40\n# e = 3  →  d = 27, denn 3 · 27 = 81 = 2 · 40 + 1\n# m = 7  →  c = 7³ mod 55 = 13,  13²⁷ mod 55 = 7' },
    vorspann: 'def modulares_inverses(a, m):\n    for i in range(1, m):\n        if (a * i) % m == 1:\n            return i\n    return None\n',
    listen: [[], [], [], []], aufrufFn: (l, k) => ['rsa_schluessel(11, 13, 7)', 'rsa_schluessel(61, 53, 17)', 'rsa(65, 17, 3233)', 'rsa(rsa(42, 7, 143), 103, 143)'][k],
    soll: (l, k) => [[143, 120, jsInv(7, 120)], [3233, 3120, jsInv(17, 3120)], jsPow(65, 17, 3233), 42][k], testName: (k) => ['p = 11, q = 13', 'p = 61, q = 53', 'verschlüsseln', 'hin und zurück'][k],
    befehle: [K_B('def rsa_schluessel(p, q, e):'), K_B('def rsa(m, exponent, n):'), K_B('pow(¦, , )')],
    tipps: ['Die Formeln stehen im Merke: n, φ(n) und d – d liefert modulares_inverses.', 'Gib die drei Werte n, phi und d als Liste zurück.', 'pow(m, exponent, n) rechnet m^exponent mod n schnell – auch bei großen Zahlen.'],
    loesung: 'def rsa_schluessel(p, q, e):\n    n = p * q\n    phi = (p - 1) * (q - 1)\n    d = modulares_inverses(e, phi)\n    return [n, phi, d]\n\ndef rsa(m, exponent, n):\n    return pow(m, exponent, n)' }),
  KRYPTO({ id: 'fe4', kapitel: 84, sortArt: 'funktion', knobel: true, ico: '💥', titel: 'Kleines RSA knacken', lohn: 95,
    ziel: 'Der Feind benutzt RSA – aber mit viel zu kleinen Primzahlen. Schreib knacken(n, e, c): Zerlege n in p und q (Probedivision), berechne d und gib den Klartext m zurück. modulares_inverses gibt es schon.',
    story: 'Echte RSA-Schlüssel haben über 600 Dezimalstellen. Unser Feind war sparsam: n hat nur vier. Das zeigt, warum die Sicherheit an der Größe der Primzahlen hängt.',
    vorspann: 'def modulares_inverses(a, m):\n    for i in range(1, m):\n        if (a * i) % m == 1:\n            return i\n    return None\n',
    listen: [[], [], []], aufrufFn: (l, k) => [`knacken(3233, 17, ${jsPow(65, 17, 3233)})`, `knacken(143, 7, ${jsPow(42, 7, 143)})`, `knacken(2537, 13, ${jsPow(1999, 13, 2537)})`][k],
    soll: (l, k) => [65, 42, 1999][k], testName: (k) => ['n = 3233', 'n = 143', 'n = 2537'][k],
    tipps: ['Probedivision: for p in range(2, n): wenn n % p == 0, dann ist q = n // p.', 'Dann wie bei der Schlüsselerzeugung: phi aus p und q, d mit modulares_inverses.', 'Zum Schluss mit d entschlüsseln – wie in rsa().'],
    loesung: 'def knacken(n, e, c):\n    p = 2\n    while n % p != 0:\n        p = p + 1\n    q = n // p\n    phi = (p - 1) * (q - 1)\n    d = modulares_inverses(e, phi)\n    return pow(c, d, n)' }),
  KRFRAGEN({ id: 'fe5', kapitel: 84, ico: '🔀', titel: 'Hybride Verfahren', lohn: 65,
    ziel: 'Warum nimmt man im Internet beides – symmetrisch und asymmetrisch?',
    fragen: [W('Mit welchem Schlüssel verschlüsselt man eine Nachricht an Bob?', ['mit dem eigenen privaten Schlüssel', 'mit Bobs öffentlichem Schlüssel', 'mit Bobs privatem Schlüssel', 'mit dem eigenen öffentlichen Schlüssel'], 1),
      W('Warum verschlüsselt man nicht die ganze Datei mit RSA?', ['RSA ist viel langsamer als AES – darum verschlüsselt RSA nur einen zufälligen AES-Schlüssel (hybrides Verfahren)', 'RSA ist für große Dateien zu unsicher', 'RSA darf man nur für E-Mails benutzen', 'RSA braucht dafür zu viele Schlüssel'], 0),
      W('Was passiert bei TLS (https) am Anfang der Verbindung?', ['der Browser schickt sein Passwort unverschlüsselt an den Server', 'Browser und Server handeln einen Sitzungsschlüssel aus – asymmetrisch, danach geht es symmetrisch weiter', 'der Server schickt dem Browser seinen privaten Schlüssel', 'alle Daten werden ab jetzt nur noch mit RSA verschlüsselt'], 1),
      W('Wozu braucht der Browser das Zertifikat des Servers?', ['damit die Seite schneller lädt, weil der Browser sie schon kennt', 'um zu prüfen, ob der öffentliche Schlüssel echt zur Seite gehört – das verhindert Man-in-the-Middle-Angriffe', 'um damit alle Daten der Seite symmetrisch zu verschlüsseln', 'um zu prüfen, ob die Seite frei von Viren und Werbung ist'], 1)],
    tipps: ['Öffentlich verschlüsseln, privat entschlüsseln.'] }),

  // --- Kapitel 85: ✍️ Hash, Signatur, Anmeldung (Kurs 8.12–8.14) ---
  KRYPTO({ id: 'ff1', kapitel: 85, sortArt: 'funktion', ico: '#️⃣', titel: 'Ein Mini-Hash', lohn: 70,
    ziel: 'Schreib mini_hash(text): Summe von (Position + 1) · ord(zeichen) über alle Zeichen, davon der Rest bei Division durch 997. Die Position zählt ab 0.',
    merke: { titel: '#️⃣ Hashfunktionen', text: 'Eine kryptographische Hashfunktion macht aus einer beliebig langen Eingabe einen kurzen Wert fester Länge (digitaler Fingerabdruck). Sie ist eine Einwegfunktion, eine kleine Änderung ändert den Hash völlig (Lawineneffekt), und Kollisionen (zwei Eingaben, gleicher Hash) sind praktisch nicht zu finden. Passwörter speichert man nur als Hash – mit Salt, damit gleiche Passwörter verschiedene Hashes haben.' },
    listen: [[], [], [], []], aufrufFn: (l, k) => ['mini_hash("abc")', 'mini_hash("Taube")', 'mini_hash("taube")', 'mini_hash("")'][k],
    soll: (l, k) => [jsMiniHash('abc'), jsMiniHash('Taube'), jsMiniHash('taube'), 0][k], testName: (k) => ['abc', 'Taube', 'taube', 'leer'][k],
    befehle: [K_B('def mini_hash(text):'), K_B('range(len(¦))'), K_B('ord(¦)'), K_B('% 997')],
    tipps: ['Mit dem Index i laufen: text[i] ist das Zeichen, i + 1 der Faktor.', 'Erst summieren, am Ende % 997.'],
    loesung: 'def mini_hash(text):\n    summe = 0\n    for i in range(len(text)):\n        summe += (i + 1) * ord(text[i])\n    return summe % 997' }),
  // Kollision selbst finden (Didaktik-Prüfung): Warum der Mini-Hash als Fingerabdruck nichts taugt
  KRYPTO({ id: 'ff1k', kapitel: 85, sortArt: 'funktion', ico: '👯', titel: 'Kollision finden', lohn: 75,
    story: 'Ein Fälscher will einen Befehl so ändern, dass der Mini-Hash gleich bleibt. Geht das? Probier es aus – wie ein Angreifer.',
    ziel: 'Schreib kollision(wort): Probiere alle Wörter aus drei Buchstaben a bis h (aaa, aab, … hhh) und gib das erste zurück, das NICHT wort ist, aber denselben mini_hash hat. Gibt es keins, gib "" zurück. mini_hash gibt es schon.',
    vorspann: 'def mini_hash(text):\n    summe = 0\n    for i in range(len(text)):\n        summe += (i + 1) * ord(text[i])\n    return summe % 997\n',
    listen: KR_KOLL_TESTS.map(() => []), aufrufFn: (l, k) => `kollision("${KR_KOLL_TESTS[k]}")`, soll: (l, k) => krKollisionen(KR_KOLL_TESTS[k])[0] || '',
    pruefWert: (w, k) => {
      const wort = KR_KOLL_TESTS[k], alle = krKollisionen(wort);
      if (!alle.length) return w === '' ? null : `kollision("${wort}"): Ergebnis ${ergebnisText(w)} – unter den Wörtern aaa … hhh hat keins denselben Hash, richtig wäre "".`;
      if (typeof w !== 'string' || !alle.includes(w)) return `kollision("${wort}"): ${ergebnisText(w)} ist keine Kollision – gesucht ist ein anderes Wort aus a–h mit mini_hash = ${jsMiniHash(wort)}.`;
      return null;
    },
    okText: (w, k) => (w ? `mini_hash("${w}") = mini_hash("${KR_KOLL_TESTS[k]}") = ${jsMiniHash(w)} ✓` : 'keine Kollision ✓'),
    testName: (k) => KR_KOLL_TESTS[k],
    befehle: [K_B('def kollision(wort):'), K_B('"abcdefgh"')],
    tipps: ['Drei Schleifen ineinander: for a in buchstaben, darin for b …, darin for c … – das Wort ist a + b + c.', 'Treffer: w != wort und mini_hash(w) == mini_hash(wort) → sofort return w.', 'Nach allen drei Schleifen: return ""'],
    loesung: 'def kollision(wort):\n    buchstaben = "abcdefgh"\n    ziel = mini_hash(wort)\n    for a in buchstaben:\n        for b in buchstaben:\n            for c in buchstaben:\n                w = a + b + c\n                if w != wort and mini_hash(w) == ziel:\n                    return w\n    return ""' }),
  KRYPTO({ id: 'ff2', kapitel: 85, sortArt: 'funktion', ico: '🧂', titel: 'Passwörter mit Salt', lohn: 80,
    ziel: 'Schreib registrieren(passwort, salt): gibt den Eintrag salt + ":" + str(hash_wert(salt + passwort)) zurück. Und anmelden(passwort, eintrag): Salt aus dem Eintrag holen (alles vor dem :), neu hashen und vergleichen. hash_wert gibt es schon.',
    vorspann: 'def hash_wert(text):\n    summe = 0\n    for i in range(len(text)):\n        summe += (i + 1) * ord(text[i])\n    return summe % 99991\n',
    listen: [[], [], [], [], []], aufrufFn: (l, k) => ['registrieren("geheim", "x7")', 'registrieren("geheim", "q2") == registrieren("geheim", "x7")', 'anmelden("geheim", registrieren("geheim", "k9"))', 'anmelden("Geheim", registrieren("geheim", "k9"))', 'anmelden("tor", "ab:123")'][k],
    soll: (l, k) => [`x7:${[...'x7geheim'].reduce((s, z, i) => s + (i + 1) * z.charCodeAt(0), 0) % 99991}`, false, true, false, false][k],
    testName: (k) => ['Eintrag', 'anderes Salt, anderer Eintrag', 'richtiges Passwort', 'falsches Passwort', 'fremder Eintrag'][k],
    befehle: [K_B('def registrieren(passwort, salt):'), K_B('def anmelden(passwort, eintrag):'), K_B('.split(":")'), K_B('str(¦)')],
    tipps: ['registrieren: erst salt + passwort hashen, dann salt, ":" und den Hash (als Text mit str) aneinanderhängen.', 'eintrag.split(":") zerlegt "x7:1234" in ["x7", "1234"].', 'anmelden kann registrieren mit demselben Salt wiederverwenden und die Einträge vergleichen.'],
    loesung: 'def registrieren(passwort, salt):\n    return salt + ":" + str(hash_wert(salt + passwort))\n\ndef anmelden(passwort, eintrag):\n    salt = eintrag.split(":")[0]\n    return registrieren(passwort, salt) == eintrag' }),
  KRYPTO({ id: 'ff3', kapitel: 85, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '✍️', titel: 'Die Unterschrift der Königin', lohn: 70,
    ziel: 'Die Königin signiert einen Befehl mit Mini-RSA. Sag voraus, was herauskommt.',
    listen: [[]], code: `def versuch():
    n = 33
    e = 3          # öffentlich
    d = 7          # privat – nur die Königin kennt ihn
    h = 4          # Hashwert des Befehls
    s = pow(h, d, n)          # signieren
    pruefung = pow(s, e, n)   # jeder kann prüfen
    return [s, pruefung, pruefung == h]`,
    merke: { titel: '✍️ Digitale Signatur', text: 'Der Absender berechnet den Hashwert des Dokuments und verschlüsselt ihn mit seinem PRIVATEN Schlüssel – das ist die Signatur. Jeder prüft mit dem ÖFFENTLICHEN Schlüssel und vergleicht mit dem selbst berechneten Hashwert. So sind Authentizität, Integrität und Verbindlichkeit gesichert.' },
    fragen: [{ art: 'zahl', text: 'Welche Signatur s entsteht?', soll: (l) => l.wert[0] },
      { art: 'zahl', text: 'Was ergibt die Prüfung pow(s, e, n)?', soll: (l) => l.wert[1] },
      W('Warum signiert man mit dem privaten Schlüssel?', ['weil er kürzer ist', 'nur die Königin hat ihn – also kann nur sie die Signatur erzeugt haben; prüfen kann jeder mit dem öffentlichen', 'damit niemand den Befehl lesen kann', 'Zufall'], 1),
      W('Ein Bote ändert den Befehl. Was merkt der Empfänger?', ['nichts, die Signatur stimmt weiter', 'die Prüfung schlägt fehl – der Hashwert des geänderten Befehls passt nicht mehr zur Signatur', 'der Befehl wird unlesbar', 'der öffentliche Schlüssel ändert sich'], 1)],
    tipps: ['4⁷ mod 33: 4² = 16, 4⁴ = 256 ≡ 25, 4⁷ = 25 · 16 · 4 = 1600 ≡ ?'] }),
  KRFRAGEN({ id: 'ff4', kapitel: 85, ico: '🔐', titel: 'Wer bist du?', lohn: 65,
    ziel: 'Hash-Eigenschaften und sichere Anmeldung.',
    fragen: [W('Ein Shop speichert Passwörter nur als Hash. Wie prüft er beim Anmelden?', ['er entschlüsselt den gespeicherten Hash und vergleicht', 'er hasht die Eingabe und vergleicht die Hashwerte', 'er schickt das Passwort zur Kontrolle per Mail', 'er vergleicht die Länge des Passworts mit dem Hash'], 1),
      W('Warum ein Salt?', ['damit gleiche Passwörter verschiedene Hashes haben – vorberechnete Tabellen (Rainbow Tables) nutzen dann nichts', 'damit man den Hash später wieder entschlüsseln kann', 'damit der Hash kürzer wird und weniger Platz braucht', 'damit das Passwort auch ohne Hash geheim bleibt'], 0),
      W('Welche Kombination ist eine Zwei-Faktor-Anmeldung?', ['Passwort und eine vierstellige PIN', 'Passwort und Code aus einer App auf dem Handy – Wissen und Besitz', 'zwei verschiedene, lange Passwörter', 'Passwort und Antwort auf eine Sicherheitsfrage'], 1),
      W('„Hallo“ und „hallo“ haben völlig verschiedene SHA-256-Werte. Das heißt …', ['Kollisionsresistenz', 'Lawineneffekt', 'Einwegeigenschaft', 'Salt'], 1),
      W('Welches Schutzziel unterstützt RAID 1 (Spiegelung)?', ['Vertraulichkeit', 'Verfügbarkeit – fällt eine Festplatte aus, sind die Daten auf der anderen noch da (ersetzt aber kein Backup)', 'Integrität', 'Verbindlichkeit'], 1)],
    tipps: ['Wissen, Besitz, Sein – zwei verschiedene Faktoren.'] }),
);

// --- 🕊️ Bild für die Landkarte: Taubenschlag auf einem Pfahl ---
function svgTaubenschlag(fertig) {
  return `<ellipse cx="0" cy="34" rx="34" ry="7" fill="rgba(0,0,0,.25)"/>
    <rect x="-4" y="4" width="8" height="30" fill="#6a4a2a"/>
    <rect x="-30" y="-24" width="60" height="30" fill="#e8d2a8" stroke="#7a5a2a" stroke-width="2"/>
    <polygon points="-36,-24 0,-50 36,-24" fill="${fertig ? '#c9a030' : '#5a6a9a'}" stroke="#2a3a6a" stroke-width="2"/>
    ${[-18, 0, 18].map((x) => `<path d="M${x - 5},-2 v-8 a5,5 0 0 1 10,0 v8 z" fill="#3a2a1a"/><rect x="${x - 8}" y="-2" width="16" height="3" fill="#7a5a2a"/>`).join('')}
    <text x="12" y="-40" style="font-size:14px">🕊️</text>`;
}
