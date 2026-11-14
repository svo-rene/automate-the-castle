'use strict';
// --- 🔭 Späherturm (Burg 9): KI verstehen – nach den OPAL-Materialien Klasse 9 -----------------------------
// Nicht programmieren, sondern das Prinzip ausprobieren (wie „Beißt der Affe?“, Bauernschach, SoekiaGPT):
//   17 Freund oder Feind?   Entscheidungsbaum aus beschrifteten Monster-Karten bauen (Wurzel, Ast, Blatt)
//   18 Stimmt mein Baum?    Trainings- und Testdaten, Überanpassung („ein Modell passt nie zu 100 %“)
//   19 Ungerechte Späher    Verzerrung: falsche Trainingsdaten → falsche Entscheidungen
//   20 Bauernschach         bestärkendes Lernen mit Perlen-Schachteln (Belohnung, Bestrafung)
//   21 Märchenmaschine      Wortvorhersage nach Wahrscheinlichkeiten wie ein Sprachmodell
// Aufträge sind Höfe mit art: 'ki' und ki = 'baum' | 'vergleich' | 'bias' | 'schach' | 'box' | 'wort' | 'maschine' | 'frage'.
// Optional hängt eine Abschlussfrage (frage) dran. ⭐ ohne Fehler, ⭐ höchstens 2 Fehler. Gelöstes Kapitel 17 = 🔭 Späher in der Nacht.

// Merkmale der Monster: jedes ist ja oder nein. Eine Karte ist ein Code aus 4 Zeichen (z s r g), z. B. '1010'.
const KI_FRAGEN = [
  { id: 'r', text: 'Ist es rot?', kurz: 'rot' },
  { id: 'z', text: 'Zeigt es Zähne?', kurz: 'Zähne' },
  { id: 's', text: 'Sind die Augen schmal?', kurz: 'schmale Augen' },
  { id: 'g', text: 'Ist es groß?', kurz: 'groß' },
];
// 🍄 Transfer (k16, k17): dieselbe Idee mit Pilzen. Pilz-Karten tragen ein „p“ vorn: 'p' + roter Hut, Punkte, Ring, groß (z. B. 'p1010').
// So wissen Baum, Bild und Heft ohne weitere Angaben, was gemeint ist.
const KI_PILZ_FRAGEN = [
  { id: 'o', text: 'Ist der Hut rot?', kurz: 'roter Hut' },
  { id: 'u', text: 'Hat der Hut Punkte?', kurz: 'Punkte' },
  { id: 'i', text: 'Hat der Stiel einen Ring?', kurz: 'Ring' },
  { id: 'e', text: 'Ist der Pilz groß?', kurz: 'groß' },
];
const KI_POS = { z: 0, s: 1, r: 2, g: 3, o: 0, u: 1, i: 2, e: 3 };
const kiIstPilz = (code) => code[0] === 'p';
const kiMerkmal = (code, id) => code[(kiIstPilz(code) ? 1 : 0) + KI_POS[id]] === '1';
const kiFrage = (id) => [...KI_FRAGEN, ...KI_PILZ_FRAGEN].find((f) => f.id === id);
// Was wird eingeordnet? Symbole und Wörter je Art
const KI_ART = {
  monster: { ja: '😠', nein: '😊', jaT: 'frech', neinT: 'friedlich', wort: 'Monster', fragen: KI_FRAGEN },
  pilz: { ja: '🤢', nein: '😋', jaT: 'giftig', neinT: 'essbar', wort: 'Pilze', fragen: KI_PILZ_FRAGEN },
};
const kiArtVon = (code) => (code && kiIstPilz(code) ? KI_ART.pilz : KI_ART.monster);
const kiArtKarten = (karten) => kiArtVon(karten?.[0]?.code);

// 🍄 Pilz als kleines Bild: roter oder brauner Hut, mit oder ohne weiße Punkte, Ring am Stiel, groß oder klein
function kiPilz(code, label = null, extra = '') {
  const [o, u, i, e] = [...code.slice(1)].map((c) => c === '1');
  const k = e ? 1.3 : 1, hut = o ? '#d8453a' : '#9a6a3a', rand = o ? '#7a1e14' : '#4a2e14';
  const art = KI_ART.pilz, schild = label === null ? '' : `<text x="0" y="40" style="font-size:16px" text-anchor="middle">${label === true ? art.ja : label === false ? art.nein : label}</text>`;
  return `<svg viewBox="-30 -30 60 ${label === null ? 58 : 76}" class="kimonster" ${extra}><g transform="translate(0,6) scale(${k})">
    <path d="M-5,-2 L-6,18 Q0,21 6,18 L5,-2 Z" fill="#f4ecd8" stroke="#8a7a5a" stroke-width="1.5"/>
    ${i ? '<path d="M-8,4 Q0,9 8,4 L7,8 Q0,12 -7,8 Z" fill="#fff8e8" stroke="#8a7a5a" stroke-width="1.2"/>' : ''}
    <path d="M-17,0 Q-16,-19 0,-20 Q16,-19 17,0 Q0,4 -17,0 Z" fill="${hut}" stroke="${rand}" stroke-width="2"/>
    ${u ? '<circle cx="-8" cy="-9" r="2.6" fill="#fff"/><circle cx="3" cy="-14" r="2.2" fill="#fff"/><circle cx="9" cy="-6" r="2.4" fill="#fff"/><circle cx="-2" cy="-5" r="1.8" fill="#fff"/>' : ''}
    </g>${schild}</svg>`;
}

// Monster als kleines Bild: rot oder grün, groß oder klein, schmale oder runde Augen, Zähne oder Lächeln
function kiMonster(code, label = null, extra = '') {
  if (kiIstPilz(code)) return kiPilz(code, label, extra);
  const [z, s, r, g] = [...code].map((c) => c === '1');
  const R = g ? 22 : 15, farbe = r ? '#e0574a' : '#5fbf5a', dunkel = r ? '#8a2418' : '#2a6a2a';
  const auge = (x) => (s ? `<line x1="${x - 4}" y1="-4" x2="${x + 4}" y2="-2" stroke="#1a1020" stroke-width="2.5" stroke-linecap="round"/>`
    : `<circle cx="${x}" cy="-3" r="3.5" fill="#fff"/><circle cx="${x}" cy="-3" r="1.8" fill="#1a1020"/>`);
  const mund = z ? `<path d="M-7,6 h14 l-2,5 l-2,-4 l-2,4 l-2,-4 l-2,4 l-2,-4 z" fill="#fff" stroke="#1a1020" stroke-width="1"/>`
    : '<path d="M-6,6 q6,6 12,0" stroke="#1a1020" stroke-width="2" fill="none" stroke-linecap="round"/>';
  const schild = label === null ? '' : `<text x="0" y="40" style="font-size:16px" text-anchor="middle">${label === true ? '😠' : label === false ? '😊' : label}</text>`;
  return `<svg viewBox="-30 -30 60 ${label === null ? 58 : 76}" class="kimonster" ${extra}><g>
    <circle r="${R}" fill="${farbe}" stroke="${dunkel}" stroke-width="2.5"/>
    <circle cx="-${R * 0.6}" cy="-${R * 0.75}" r="${R * 0.25}" fill="${farbe}" stroke="${dunkel}" stroke-width="2"/><circle cx="${R * 0.6}" cy="-${R * 0.75}" r="${R * 0.25}" fill="${farbe}" stroke="${dunkel}" stroke-width="2"/>
    ${auge(-6)}${auge(6)}${mund}</g>${schild}</svg>`;
}

// Entscheidungsbaum: { frage: id, ja: knoten, nein: knoten } oder Blatt true (frech) / false (friedlich) / null (noch leer)
const kiEntscheide = (b, code) => (b && typeof b === 'object' ? kiEntscheide(kiMerkmal(code, b.frage) ? b.ja : b.nein, code) : b);
const kiTreffer = (b, karten) => karten.filter((k) => kiEntscheide(b, k.code) === k.frech).length;
const kiKnoten = (b) => (b && typeof b === 'object' ? 1 + kiKnoten(b.ja) + kiKnoten(b.nein) : 0);
const kiFertig = (b) => (b && typeof b === 'object' ? kiFertig(b.ja) && kiFertig(b.nein) : b !== null);
// Einfacher Lerner (für den Späher im Kapitel Verzerrung): je Ebene die Frage mit den wenigsten Fehlern, Gleichstand = Reihenfolge in KI_FRAGEN
function kiLerne(karten, tiefe = 2) {
  const mehrheit = (ks) => ks.filter((k) => k.frech).length * 2 >= ks.length;
  if (!karten.length) return false;
  if (tiefe === 0 || karten.every((k) => k.frech === karten[0].frech)) return mehrheit(karten);
  let best = null, bestF = Infinity;
  for (const f of kiArtKarten(karten).fragen) {
    const ja = karten.filter((k) => kiMerkmal(k.code, f.id)), nein = karten.filter((k) => !kiMerkmal(k.code, f.id));
    if (!ja.length || !nein.length) continue;
    const fehler = ja.filter((k) => k.frech !== mehrheit(ja)).length + nein.filter((k) => k.frech !== mehrheit(nein)).length;
    if (fehler < bestF) { best = f; bestF = fehler; }
  }
  if (!best) return mehrheit(karten);
  return { frage: best.id, ja: kiLerne(karten.filter((k) => kiMerkmal(k.code, best.id)), tiefe - 1), nein: kiLerne(karten.filter((k) => !kiMerkmal(k.code, best.id)), tiefe - 1) };
}
// Karten aus Codes; regel(code) = frech? – rauschen = Codes, deren Beschriftung absichtlich andersherum ist (Ausreißer)
const kiKarten = (codes, regel, rauschen = []) => codes.map((code) => ({ code, frech: rauschen.includes(code) ? !regel(code) : regel(code) }));

// --- 🧠 Märchenmaschine: Wortpaare aus kleinen Burg-Geschichten (wie SoekiaGPT mit Märchen) ---
const KI_GESCHICHTEN = [
  'der drache schläft im turm .', 'der drache fliegt über die burg .', 'der ritter reitet zur burg .', 'die burg hat einen turm .',
  'der ritter sieht den drachen .', 'die prinzessin liest im turm .', 'der drache sieht die prinzessin .', 'die prinzessin reitet zum drachen .',
];
const KI_FOLGE = (() => {
  const f = {};
  for (const satz of KI_GESCHICHTEN) {
    const w = satz.split(' ');
    for (let i = 0; i + 1 < w.length; i++) { (f[w[i]] ||= {}); f[w[i]][w[i + 1]] = (f[w[i]][w[i + 1]] || 0) + 1; }
  }
  return f;
})();
// Nächstes Wort ziehen: Temperatur 0 = immer das häufigste, höher = auch seltenere Wörter
function kiNaechstesWort(wort, temp) {
  const kand = Object.entries(KI_FOLGE[wort] || {});
  if (!kand.length) return '.';
  if (temp <= 0.05) return kand.sort((a, b) => b[1] - a[1])[0][0];
  const gew = kand.map(([w, n]) => [w, Math.pow(n, 1 / temp)]), summe = gew.reduce((s, [, x]) => s + x, 0);
  let r = Math.random() * summe;
  for (const [w, x] of gew) { if ((r -= x) <= 0) return w; }
  return gew[0][0];
}

// --- ♟️ Bauernschach 3×3 gegen den Perlen-Roboter (wie „Schlag den Roboter“) ---
// Brett als 9 Zeichen (Zeile 0 oben = Roboter ● , Zeile 2 unten = Mensch ○), Züge [von, nach]
const SCHACH_START = '●●●   ○○○';
function schachZuege(brett, wer) {
  const ich = wer === 'mensch' ? '○' : '●', du = wer === 'mensch' ? '●' : '○', dir = wer === 'mensch' ? -1 : 1, z = [];
  for (let i = 0; i < 9; i++) {
    if (brett[i] !== ich) continue;
    const r = Math.floor(i / 3), c = i % 3, nr = r + dir;
    if (nr < 0 || nr > 2) continue;
    if (brett[nr * 3 + c] === ' ') z.push([i, nr * 3 + c]);
    for (const dc of [-1, 1]) { const nc = c + dc; if (nc >= 0 && nc <= 2 && brett[nr * 3 + nc] === du) z.push([i, nr * 3 + nc]); }
  }
  return z;
}
const schachZiehe = (brett, [von, nach]) => { const b = [...brett]; b[nach] = b[von]; b[von] = ' '; return b.join(''); };
// Gewinner nach einem Zug von wer: Grundlinie erreicht, alle geschlagen oder der andere kann nicht mehr ziehen
function schachSieger(brett, wer) {
  const ich = wer === 'mensch' ? '○' : '●', du = wer === 'mensch' ? '●' : '○', ziel = wer === 'mensch' ? [0, 1, 2] : [6, 7, 8];
  if (ziel.some((i) => brett[i] === ich) || ![...brett].includes(du) || !schachZuege(brett, wer === 'mensch' ? 'roboter' : 'mensch').length) return wer;
  return null;
}
const PERLEN = ['#e0574a', '#3f6fd8', '#2f9e62', '#e0b030', '#9a5ad8', '#40c0c0', '#e07ab0'];   // Farbe je möglichem Zug in einer Schachtel
const feldName = (i) => 'abc'[i % 3] + (3 - Math.floor(i / 3));   // a1 = unten links (deine Grundlinie)
function kiZiehePerle(box) {
  let r = Math.random() * box.reduce((a, b) => a + b, 0);
  for (let i = 0; i < box.length; i++) if (box[i] && (r -= box[i]) < 0) return i;
  return box.findLastIndex((x) => x > 0);
}

// --- Kapitel und Aufträge ---
KAPITEL[17] = { name: 'Freund oder Feind?', ico: '🔭' };
KAPITEL[18] = { name: 'Stimmt mein Baum?', ico: '🧪' };
KAPITEL[19] = { name: 'Ungerechte Späher', ico: '⚖️' };
KAPITEL[20] = { name: 'Bauernschach', ico: '♟️' };
KAPITEL[21] = { name: 'Märchenmaschine', ico: '✍️' };
BURGEN[9].kapitel = [11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 15];   // Archiv, dann Späherturm, ganz am Ende die SQL-Vertiefung
BURGEN[9].regionen = ['archiv', 'spaeher'];
const spaeherAktiv = () => kapitelFertig(17);   // 🔭 in der Nacht: gefährliche Gegner markiert (🎯), Türme machen bei ihnen mehr Schaden
const SPAEHER_DMG = 0.25, SPAEHER_AB = 25;   // markiert: Anführer, große Gegner und alle ab 25 Leben (Ork)
BURGEN[9].text = '📜 Archiv: Datenbanken mit SQL (vor allem WHERE). 🔭 Späherturm: wie KI lernt – Entscheidungsbaum, Testdaten, Verzerrung, Bauernschach, Wortvorhersage.';

const KI = (a) => hof({ art: 'ki', start: 'A', varianten: [], bloecke: false, sprache: [], befehle: [], tipps: [], loesung: '', ...a });
const F = (frage, optionen, richtig, erklaerung) => ({ frage, optionen, richtig, erklaerung });
// Rechenfrage (Wahrscheinlichkeit, Anzahl …): soll = Zahl oder (KS) => Zahl; Prozent darf man auch als 0,6 eintippen.
// Ein Auftrag kann mehrere Fragen nacheinander stellen: kiFragen: [F(...), KI_ZAHL(...)] (sonst die eine frage).
const KI_ZAHL = (frage, soll, erklaerung, tol = 0.5) => ({ art: 'zahl', frage, soll, erklaerung, tol });
const kiPZ = (a, b) => { const f = KI_FOLGE[a] || {}, n = Object.values(f).reduce((s, x) => s + x, 0); return n ? ((f[b] || 0) / n) * 100 : 0; };   // P(b | a) in %
HOEFE.push(
  // --- 17: Freund oder Feind? Entscheidungsbaum ---
  KI({ id: 'k1', kapitel: 17, ki: 'baum', ico: '🔭', titel: 'Eine Frage reicht', lohn: 30, tiefe: 1,
    ziel: 'Bau einen Baum, der jedes Monster richtig einordnet: Wähle rechts eine Frage, dann für „ja“ und „nein“ je ein Blatt (😠 frech oder 😊 friedlich).',
    regel: (c) => kiMerkmal(c, 'z'), train: ['1000', '0000', '1110', '0110', '1011', '0011', '1101', '0101'], test: ['1001', '0100', '1111', '0010'],
    merke: { titel: '🔭 Der Entscheidungsbaum', text: 'Ein Entscheidungsbaum stellt Fragen, eine nach der anderen: oben die Wurzel, dann je nach Antwort den Ast „ja“ oder „nein“ entlang. Unten im Blatt steht die Entscheidung. Den Baum baut man aus Beispielen, deren Antwort man schon kennt (Trainingsdaten).',
      echt: 'In echt: So entscheiden z. B. Spamfilter („Kommt das Wort GRATIS vor?“) oder Programme, die Ärzten Hinweise geben. Ein Computer kann solche Bäume aus Tausenden Beispielen selbst bauen.' },
    tipps: ['Schau dir die frechen 😠 Monster an: Was haben sie alle gemeinsam?', 'Alle frechen zeigen Zähne – die friedlichen nicht.'],
    story: 'Eulalia hier, jetzt oben im Späherturm! Unsere Späher sollen lernen, freche Monster zu erkennen. Diese acht kennen wir schon.', danach: 'Der Späher stellt nur eine Frage – und liegt bei allen acht Monstern richtig!' }),
  KI({ id: 'k2', kapitel: 17, ki: 'baum', ico: '🌳', titel: 'Zwei Fragen', lohn: 35, tiefe: 2,
    ziel: 'Diesmal braucht der Baum zwei Fragen. Ordne alle Monster richtig ein.',
    regel: (c) => kiMerkmal(c, 'z') && kiMerkmal(c, 's'), train: ['1100', '1000', '0100', '0000', '1110', '1011', '0111', '1101'], test: ['1111', '1010', '0101', '1001'],
    tipps: ['Eine Frage allein reicht nicht. Welche Frage trennt schon mal viele richtig?', 'Frech sind nur die, die Zähne zeigen UND schmale Augen haben.'],
    story: 'Neue Monster sind aufgetaucht. Manche zeigen Zähne und sind trotzdem friedlich. Hm …', danach: 'Zwei Fragen hintereinander – jetzt passt es wieder.' }),
  KI({ id: 'k3', kapitel: 17, ki: 'baum', ico: '🌲', titel: 'Rot oder groß', lohn: 35, tiefe: 2,
    ziel: 'Ordne alle Monster richtig ein. Zwei Fragen sind erlaubt.',
    regel: (c) => kiMerkmal(c, 'r') || kiMerkmal(c, 'g'), train: ['0010', '0001', '0000', '1000', '0110', '1011', '1100', '0111'], test: ['0011', '1110', '0100', '1001'],
    tipps: ['Hier zählt nicht, ob es Zähne zeigt.', 'Frech ist, wer rot ist – oder groß.'],
    story: 'Die Späher sagen: Bei diesen hier ist es anders. Schau genau hin!', danach: 'Rot oder groß – das merkt sich der Späher.' }),
  KI({ id: 'k4', kapitel: 17, knobel: true, ki: 'baum', ico: '🌴', titel: 'Der knifflige Baum', lohn: 50, tiefe: 2,
    ziel: 'Ordne alle Monster richtig ein. Tipp: Fang mit der richtigen Frage an.',
    regel: (c) => (kiMerkmal(c, 'g') ? kiMerkmal(c, 'r') : kiMerkmal(c, 'z')), train: ['0011', '0001', '1011', '1001', '1000', '0000', '1010', '0110'], test: ['0111', '1101', '1100', '0100'],
    tipps: ['Bei den Großen kommt es auf etwas anderes an als bei den Kleinen.', 'Erste Frage: groß? Dann bei den Großen: rot? Bei den Kleinen: Zähne?'],
    story: 'Ein ganz schwieriger Fall für die besten Späher.', danach: 'Unglaublich – du denkst schon wie ein Späher-Meister!' }),

  // --- 18: Stimmt mein Baum? Testdaten und Überanpassung ---
  KI({ id: 'k5', kapitel: 18, ki: 'vergleich', ico: '🧪', titel: 'Welcher Baum ist besser?', lohn: 40,
    ziel: 'Zwei Späher haben gelernt. Welcher wird bei neuen Monstern öfter richtig liegen? Wähle aus.',
    // Testmonster kommen in den Trainingsdaten nicht vor (Didaktik-Prüfung: 1111 stand in beiden)
    regel: (c) => kiMerkmal(c, 's'), rauschen: ['1101'], train: ['0100', '1100', '0110', '1111', '0000', '1000', '0011', '1001', '1101'], test: ['0101', '1110', '0010', '0111'],
    baeume: [{ frage: 's', ja: true, nein: false }, { frage: 's', ja: { frage: 'g', ja: { frage: 'r', ja: true, nein: false }, nein: true }, nein: false }],
    merke: { titel: '🧪 Trainings- und Testdaten', text: 'Eine KI lernt aus Trainingsdaten. Ob sie wirklich etwas kann, zeigen erst Testdaten, die sie beim Lernen nie gesehen hat. Wer jede Kleinigkeit der Trainingsdaten auswendig lernt, liegt bei Neuem oft daneben – das heißt Überanpassung (englisch: Overfitting).',
      echt: 'In echt: Bevor eine KI z. B. Krankheiten auf Röntgenbildern erkennen darf, wird sie an Bildern getestet, die sie nie gesehen hat. Erst die Trefferquote dort zählt.' },
    tipps: ['Baum B passt zu allen Trainingsmonstern – auch zu dem einen merkwürdigen.', 'Ein einziger Ausreißer ist eher Zufall als eine Regel.'],
    frage: F('Warum war der große Baum schlechter?', ['Er hat einen Ausreißer auswendig gelernt.', 'Er stellt seine Fragen in falscher Reihenfolge.', 'Er hat zu wenige Trainingsmonster gesehen.', 'Er kannte die neuen Monster schon vorher.'], 0, 'Der große Baum hat sich an einen Zufall angepasst – das hilft bei neuen Monstern nicht.'),
    story: 'Zwei Lehrlinge haben je einen Späher trainiert. Beide behaupten, ihrer sei der beste.', danach: 'Genau! Der kleine Baum ist ehrlicher – er merkt sich die Regel, nicht den Zufall.' }),
  KI({ id: 'k6', kapitel: 18, ki: 'baum', ico: '🎯', titel: 'Nicht alles auswendig', lohn: 45, tiefe: 2, testZiel: 4,
    ziel: 'Bau einen Baum. Ein Trainingsmonster ist ein Ausreißer – du musst nicht alle Trainingsmonster richtig haben. Wichtig: Alle neuen Monster im Test müssen stimmen.',
    regel: (c) => kiMerkmal(c, 's'), rauschen: ['1101'], train: ['0100', '1100', '0110', '1111', '0000', '1000', '0011', '1001', '1101'], test: ['0101', '1110', '0010', '0111'],
    tipps: ['Fast alle frechen haben etwas gemeinsam – nur eins nicht.', 'Eine Frage nach den schmalen Augen reicht.'],
    story: 'Diesmal ist ein seltsames Monster dabei. Lass dich nicht täuschen!', danach: 'Ein Modell muss nicht jedes Beispiel treffen – wichtig ist, dass es bei neuen Monstern stimmt.' }),
  KI({ id: 'k7', kapitel: 18, ki: 'frage', ico: '❓', titel: 'Wozu Testdaten?', lohn: 35,
    ziel: 'Beantworte Eulalias Frage.',
    kiFragen: [F('Wozu braucht man Testdaten, die der Späher beim Lernen nie gesehen hat?', ['Um zu prüfen, ob er auch Neues richtig erkennt.', 'Damit er beim Lernen schneller fertig wird.', 'Damit sein Baum ein paar Fragen mehr bekommt.', 'Um die Trainingsdaten noch einmal zu üben.'], 0, 'Nur neue Beispiele zeigen, ob ein Modell wirklich etwas gelernt hat.'),
      KI_ZAHL('Späher Ole erkennt alle 20 Trainingsmonster richtig, aber nur 13 von 20 neuen Testmonstern. Wie viel Prozent der Testmonster erkennt er richtig?', 65, '13 von 20 = 13 : 20 = 65 %. Nur diese Zahl sagt, wie gut er bei Neuem ist – die 100 % im Training täuschen.')],
    tipps: ['Was bringt es, wenn der Späher nur die Monster kennt, die er schon gesehen hat?'],
    story: 'Ein Lehrling fragt: „Warum testen wir mit anderen Monstern als beim Training?“', danach: 'Richtig. Darum heben wir immer ein paar Monster für den Test auf.' }),

  // --- 19: Ungerechte Späher – Verzerrung ---
  KI({ id: 'k8', kapitel: 19, ki: 'bias', ico: '⚖️', titel: 'Der Späher, der nur Rotes kannte', lohn: 45,
    ziel: 'Der Späher irrt sich bei allen neuen Monstern. Gib ihm genau 2 neue Trainingsmonster, damit er richtig lernt.',
    regel: (c) => kiMerkmal(c, 'z'), train: ['1010', '1110', '0000', '0100'], test: ['1000', '0010', '1001', '0011'], pool: ['1100', '0110', '0101', '0001', '1111', '1011'],   // keine Testmonster im Pool (Merke k7), nur 2 von 6 helfen
    merke: { titel: '⚖️ Verzerrung', text: 'Eine KI lernt nur, was in ihren Daten steckt. Sind die Daten einseitig – hier: alle frechen Monster rot, alle friedlichen grün –, lernt sie eine falsche Regel. Man sagt: Die Daten sind verzerrt (englisch: Bias).',
      echt: 'In echt: Eine KI, die Bewerbungen vorsortiert, hat aus alten Daten gelernt, in denen fast nur Männer eingestellt wurden – und Frauen schlechter bewertet. Darum muss man prüfen, mit welchen Daten eine KI gelernt hat.' },
    tipps: ['Der Späher glaubt: rot = frech. Zeig ihm, dass das nicht stimmt!', 'Gib ihm ein grünes Monster, das frech ist, oder ein rotes, das friedlich ist.'],
    frage: F('Warum hat der Späher sich am Anfang geirrt?', ['Seine Daten waren einseitig: alle Frechen waren rot.', 'Er durfte nur eine einzige Frage stellen.', 'Rote Monster sind in Wahrheit immer frech.', 'Er hatte zu viele Testmonster bekommen.'], 0, 'Einseitige Daten führen zu einer falschen Regel – auch bei echter KI, z. B. bei Bewerbungen.'),
    story: 'Unser neuer Späher hat nur ein paar Monster gesehen. Jetzt hält er jedes grüne Monster für harmlos – gefährlich!', danach: 'Mit besseren Daten lernt er die richtige Regel. Gute Daten sind das Wichtigste!' }),
  KI({ id: 'k9', kapitel: 19, ki: 'frage', ico: '❓', titel: 'Ist das gerecht?', lohn: 35,
    ziel: 'Beantworte Eulalias Frage.',
    frage: F('Ein Späher hat nur Wölfe als gefährlich kennengelernt. Was passiert, wenn plötzlich ein Troll kommt?', ['Er hält ihn vielleicht für harmlos – er kennt keinen.', 'Er erkennt ihn sofort, weil Trolle größer sind.', 'Er lernt beim ersten Troll von selbst dazu.', 'Er meldet ihn als Wolf, weil beide gefährlich sind.'], 0, 'Was nicht in den Trainingsdaten vorkommt, kann eine KI nicht wissen.'),
    tipps: ['Kann der Späher etwas über Trolle gelernt haben?'],
    story: 'Die Wachen fragen sich, ob man den Spähern blind vertrauen kann.', danach: 'Genau. KI ist nur so gut wie ihre Daten – darum prüfen wir sie.' }),

  // --- 20: Bauernschach – bestärkendes Lernen ---
  KI({ id: 'k10', kapitel: 20, ki: 'schach', ico: '♟️', titel: 'Schlag den Roboter', lohn: 45, partien: 6, training: 60,
    ziel: 'Spiele 6 Partien Bauernschach gegen den Perlen-Roboter und beobachte seine Perlen. Danach trainiert er 60 schnelle Partien – schau dir seine Lernkurve an.',
    merke: { titel: '♟️ Lernen durch Belohnung', text: 'Der Roboter hat für jede Stellung eine Schachtel mit einer Perle je möglichem Zug und zieht blind eine davon. Gewinnt er, kommt eine Perle für seinen letzten Zug dazu (Belohnung), verliert er, fliegt sie raus (Bestrafung). Niemand sagt ihm, welcher Zug gut ist – er lernt aus Erfahrung: verstärkendes Lernen (Reinforcement Learning).',
      echt: 'In echt: So haben Computer gelernt, Schach und Go besser zu spielen als jeder Mensch – sie haben Millionen Partien gegen sich selbst gespielt. Auch Roboter lernen so laufen.' },
    tipps: ['Bauern ziehen nur nach vorn und schlagen schräg.', 'Gewonnen hat, wer die gegnerische Grundlinie erreicht, alle Gegner schlägt – oder wenn der andere nicht mehr ziehen kann.'],
    kiFragen: [KI_ZAHL('Lies die Lernkurve: Wie viele der letzten 10 Trainingspartien hat der Roboter gewonnen?', (ks) => (ks.training || []).slice(-10).filter((x) => x === 'roboter').length, 'Am Anfang gewinnt er selten, am Ende fast immer – er hat aus Belohnung und Bestrafung gelernt.', 0),
      F('Warum gewinnt der Roboter mit der Zeit öfter?', ['Schlechte Züge verlieren Perlen und kommen seltener dran.', 'Er bekommt nach jeder Partie eine neue Spielregel dazu.', 'Gute Züge bekommen Perlen von schlechten Zügen geschenkt.', 'Sein Gegner wird mit der Zeit immer müder.'], 0, 'Bestrafte Züge verschwinden nach und nach – übrig bleiben die guten.')],
    story: 'Der Burgschmied hat einen Spielroboter gebaut. Er behauptet, der lernt beim Spielen!', danach: 'Der Roboter hat aus seinen Niederlagen gelernt – Perle für Perle.' }),
  KI({ id: 'k11', kapitel: 20, ki: 'box', ico: '🎲', titel: 'Was zieht der Roboter?', lohn: 40,
    ziel: 'Hier ist eine Schachtel des Roboters. Welchen Zug wird er am wahrscheinlichsten wählen?',
    box: { brett: '●●●○   ○○', perlen: [1, 4, 2] },
    kiFragen: [KI_ZAHL('Er zieht blind eine Perle. Mit wie viel Prozent Wahrscheinlichkeit wählt er genau diesen Zug? (gerundet)', (4 / 7) * 100, '4 von 7 Perlen gehören zu diesem Zug: 4 : 7 ≈ 57 %. Sicher ist der Zug also nicht – in 3 von 7 Fällen zieht er etwas anderes.', 1)],
    tipps: ['Er zieht blind eine Perle – welche Farbe liegt am häufigsten drin?', 'Wahrscheinlichkeit = Perlen dieser Farbe geteilt durch alle Perlen.'],
    story: 'Wir haben eine Schachtel aus dem Roboter geholt. Schau mal hinein!', danach: 'Genau – die meisten Perlen gewinnen am häufigsten. Sicher ist es aber nie!' }),
  KI({ id: 'k12', kapitel: 20, ki: 'frage', ico: '❓', titel: 'Regeln oder Lernen?', lohn: 35,
    ziel: 'Beantworte Eulalias Frage.',
    frage: F('Der Schmied könnte dem Roboter auch feste Regeln geben („Wenn …, dann zieh …“). Was ist der Unterschied?', ['Mit Regeln lernt er nichts dazu, mit Perlen schon.', 'Mit Regeln lernt er schneller als mit Perlen.', 'Mit Perlen braucht er keine Belohnung mehr.', 'Mit Regeln kann er gar nicht verlieren.'], 0, 'Ein Regel-System (Expertensystem) ist auch KI, lernt aber nicht. Mit Perlen lernt der Roboter aus Erfahrung.'),
    tipps: ['Was passiert mit festen Regeln nach einer Niederlage?'],
    story: 'Der Schmied überlegt, ob er dem Roboter nicht einfach Regeln einbaut.', danach: 'Richtig. Regeln sind gut, wenn man sie kennt – Lernen hilft, wenn man sie nicht kennt.' }),

  // --- 21: Märchenmaschine – Wortvorhersage ---
  KI({ id: 'k13', kapitel: 21, ki: 'wort', ico: '🔤', titel: 'Was kommt nach „der“?', lohn: 40,
    ziel: 'Lies die Geschichten. Welches Wort folgt am häufigsten auf „der“?',
    frage: F('Welches Wort folgt in den Geschichten am häufigsten auf „der“?', ['drache', 'ritter', 'burg', 'turm'], 0, '„der drache“ steht dreimal da, „der ritter“ zweimal.'),
    merke: { titel: '✍️ Wie eine Sprach-KI schreibt', text: 'Eine Sprach-KI wählt beim Schreiben immer das nächste Wort – nach der Wahrscheinlichkeit, mit der es in ihren Texten folgt. Unsere Maschine schaut nur auf ein Wort davor, echte Sprach-KIs auf sehr viele. Was ein Drache ist, weiß keine von beiden.',
      echt: 'In echt: Chatbots wie ChatGPT arbeiten nach diesem Prinzip, nur mit riesigen Textmengen. Darum klingen ihre Antworten gut – und können trotzdem falsch sein.' },
    tipps: ['Zähl in jeder Zeile: Welches Wort steht direkt hinter „der“?'],
    story: 'Ich habe eine Maschine gebaut, die Geschichten schreibt! Sie hat nur diese acht Sätze gelesen.', danach: 'Genau so zählt die Maschine auch – nur viel, viel schneller.' }),
  KI({ id: 'k14', kapitel: 21, ki: 'maschine', ico: '✍️', titel: 'Die Märchenmaschine', lohn: 45, saetze: 3,
    ziel: 'Lass die Maschine 3 Sätze schreiben. Probiere dabei den Zufallsregler (Temperatur) aus.',
    kiFragen: [KI_ZAHL('Rechne nach: Auf „die“ folgt in den Geschichten mehrmals ein Wort. Mit wie viel Prozent Wahrscheinlichkeit wählt die Maschine bei Temperatur 1 danach „prinzessin“?', kiPZ('die', 'prinzessin'), 'Auf „die“ folgt fünfmal ein Wort: dreimal „prinzessin“, zweimal „burg“. 3 von 5 = 60 %.'),
      F('Was passiert, wenn die Temperatur ganz auf 0 steht?', ['Sie nimmt immer das häufigste Wort – immer derselbe Satz.', 'Sie nimmt jedes Wort gleich oft – lauter neue Sätze.', 'Sie nimmt nur Wörter, die sie noch nie geschrieben hat.', 'Sie hört nach dem ersten Wort auf zu schreiben.'], 0, 'Ohne Zufall wählt sie immer das wahrscheinlichste Wort. Mit mehr Temperatur wird sie überraschender.')],
    tipps: ['Stell den Regler auf 0 und lass zweimal schreiben. Was fällt dir auf?', 'Zähl in den Geschichten jedes „die“ und schau, welches Wort danach kommt.'],
    story: 'Jetzt darfst du die Maschine selbst bedienen!', danach: 'Du hast eine echte kleine Sprach-KI bedient!' }),
  KI({ id: 'k15', kapitel: 21, knobel: true, ki: 'frage', ico: '❓', titel: 'Weiß die Maschine Bescheid?', lohn: 45,
    ziel: 'Beantworte Eulalias Frage.',
    frage: F('Die Maschine schreibt: „die prinzessin reitet zur burg.“ Stimmt das?', ['Vielleicht nicht – sie kennt nur Wortpaare, keine Fakten.', 'Ja – jedes Wortpaar darin kommt in den Geschichten vor.', 'Ja – sonst hätte die Maschine es nicht geschrieben.', 'Nein – „zur burg“ kommt in keiner Geschichte vor.'], 0, 'In den Geschichten reitet die Prinzessin zum Drachen, nicht zur Burg. Sprach-KIs klingen überzeugend und schreiben trotzdem manchmal Falsches. Darum: Fakten immer prüfen!'),
    tipps: ['In welcher Geschichte reitet die Prinzessin zur Burg?', 'Jedes Wortpaar kommt vor – aber nicht der ganze Satz.'],
    story: 'Die Maschine hat etwas Neues geschrieben. Die Wachen glauben es sofort …', danach: 'Klug! Was eine KI schreibt, muss man immer prüfen.' }),
);

// --- 🍄 Transfer (Didaktik-Prüfung: „KI immer dieselben Merkmale“): dieselben Ideen in neuer Lage, ans Ende der Kapitel ---
const kiNach = (id, neu) => HOEFE.splice(HOEFE.findIndex((h) => h.id === id) + 1, 0, neu);
// k16: Pilze (p + roter Hut, Punkte, Ring, groß). Regel: mit Ring entscheidet die Farbe, ohne Ring die Punkte – nur „Ring?“ als Wurzel klappt.
kiNach('k4', KI({ id: 'k16', kapitel: 17, ki: 'baum', ico: '🍄', titel: 'Pilze im Zauberwald', lohn: 50, tiefe: 2,
  ziel: 'Neue Lage, gleiche Idee: Bau einen Entscheidungsbaum, der jeden Pilz richtig als 🤢 giftig oder 😋 essbar einordnet. Zwei Fragen hintereinander sind erlaubt.',
  regel: (c) => (kiMerkmal(c, 'i') ? kiMerkmal(c, 'o') : kiMerkmal(c, 'u')),
  train: ['p0010', 'p1010', 'p0110', 'p1110', 'p0100', 'p0000', 'p1101', 'p1001', 'p0011'], test: ['p1011', 'p0101', 'p1000', 'p0111'],
  tipps: ['Probier für die Wurzel jede Frage aus: Nach welcher lassen sich beide Äste mit nur noch einer Frage sauber trennen?', 'Fang mit „Hat der Stiel einen Ring?“ an.', 'Mit Ring kommt es auf die Farbe an, ohne Ring auf die Punkte.'],
  story: 'Die Kräuterfrau der Burg bittet um Hilfe: Ihr Lehrling soll im Zauberwald giftige von essbaren Pilzen unterscheiden. Diese neun Pilze hat sie schon bestimmt.',
  danach: 'Der Baum stellt zwei Fragen – und kein giftiger Pilz landet im Korb. Bei echten Pilzen gilt trotzdem: nur mit Fachleuten sammeln!' }));
// k17: Verzerrung II – die Sammlerin war nur auf der Rotwiese: Dort hatten alle roten Pilze Punkte. Gesucht: die Pilze, die in den Daten fehlen.
kiNach('k9', KI({ id: 'k17', kapitel: 19, ki: 'bias', ico: '🧺', titel: 'Die Pilze, die fehlten', lohn: 50, alleNeu: true,
  ziel: 'Die Pilz-Späherin hat eine falsche Regel gelernt. Gib ihr genau 2 neue Pilze, die ihr beim Training gefehlt haben – also solche, bei denen sie bisher danebenliegt.',
  regel: (c) => kiMerkmal(c, 'u'), train: ['p1100', 'p1101', 'p0000', 'p0010', 'p0001'], test: ['p0100', 'p1000', 'p0111', 'p1011'], pool: ['p1110', 'p0110', 'p0011', 'p1001', 'p1111'],
  tipps: ['Was hat die Späherin gelernt? Welche Pilze kamen in ihren Trainingsdaten nie vor?', 'Auf der Rotwiese hatten alle roten Pilze Punkte. Es fehlen rote Pilze OHNE Punkte und braune MIT Punkten.', 'Ein roter Pilz mit Punkten bringt nichts Neues – den kannte sie schon.'],
  kiFragen: [F('Welche Gruppe fehlte in den Trainingsdaten?', ['rote ohne Punkte und braune mit Punkten', 'Pilze mit einem dünnen Ring am Stiel', 'große Pilze mit einem breiten braunen Hut', 'Pilze aus dem Nadelwald hinter der Burg'], 0, 'Rot und gepunktet kamen immer zusammen vor – darum konnte die Späherin nicht wissen, welches Merkmal wirklich zählt. Fehlt eine Gruppe in den Daten, lernt die KI eine falsche Regel.')],
  story: 'Die Kräuterfrau hat eine Pilz-Späherin angelernt. Gesammelt hat sie nur auf der Rotwiese – und dort hatten alle roten Pilze weiße Punkte. Jetzt hält die Späherin jeden roten Pilz für giftig …',
  danach: 'Mit den fehlenden Pilzen lernt sie die richtige Regel: Es kommt auf die Punkte an, nicht auf die Farbe.' }));
// k18: Wahrscheinlichkeiten aus den Geschichten selbst ausrechnen
kiNach('k15', KI({ id: 'k18', kapitel: 21, ki: 'wort', ico: '🎲', titel: 'Wie wahrscheinlich?', lohn: 50,
  ziel: 'Rechne aus, wie wahrscheinlich die Märchenmaschine ein Wort wählt – so wie sie selbst es tut. Gib Prozent an (z. B. 25).',
  kiFragen: [KI_ZAHL('Mit welcher Wahrscheinlichkeit (in %) folgt auf „der“ das Wort „ritter“?', kiPZ('der', 'ritter'), 'Auf „der“ folgt fünfmal ein Wort: dreimal „drache“, zweimal „ritter“. 2 von 5 = 40 %.'),
    KI_ZAHL('Mit welcher Wahrscheinlichkeit (in %) folgt auf „drache“ das Wort „sieht“? (gerundet)', kiPZ('drache', 'sieht'), 'Auf „drache“ folgen „schläft“, „fliegt“ und „sieht“ je einmal: 1 von 3 ≈ 33 %.', 1),
    KI_ZAHL('Die Maschine steht bei „der“. Wie wahrscheinlich schreibt sie bei Temperatur 1 als Nächstes „drache sieht“? (in %)', (kiPZ('der', 'drache') * kiPZ('drache', 'sieht')) / 100, 'Beide Schritte müssen klappen: P(drache | der) · P(sieht | drache) = 3/5 · 1/3 = 1/5 = 20 %.', 1),
    F('Bei Temperatur 0: Welches Wort schreibt die Maschine nach „die“ – jedes Mal?', ['prinzessin', 'burg', 'drache', 'turm'], 0, 'Temperatur 0 nimmt immer das häufigste Folgewort: „prinzessin“ (3-mal) schlägt „burg“ (2-mal).')],
  tipps: ['Zähl in den Geschichten jedes Vorkommen des ersten Worts und schau, was direkt danach steht.', 'Wahrscheinlichkeit = wie oft dieses Folgewort ÷ wie oft überhaupt ein Wort folgt.', 'Für zwei Schritte nacheinander: die beiden Wahrscheinlichkeiten malnehmen.'],
  story: 'Ein Lehrling will wissen, wie sicher die Maschine ihre Wörter wählt. Die Maschine verrät es nicht – aber du kannst es aus den Geschichten ausrechnen!',
  danach: 'Genau so rechnet die Maschine. Echte Sprachmodelle machen dasselbe – nur mit Milliarden Wörtern und viel längerem Rückblick.' }));

// --- Spielen: Zustand KS · links das Experiment (#archiv), rechts die Knöpfe (#befehle) ---
// phase: 'haupt' (ausprobieren) → 'erfolg' (Ergebnis ansehen) → 'frage' (falls es eine Abschlussfrage gibt) → Ergebniskarte
let KS = null;
const kiMischen = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const kiEule = (t) => (t ? `<div class="eulalia"><span class="eico">🦉</span><div><b>Eulalia</b><p>${esc(t)}</p></div></div>` : '');
// Bildlegende: zu jeder Frage ein Monster mit „ja“ und eins mit „nein“ (sonst gleich), damit man die Merkmale sicher erkennt
const KI_LEGENDE_BILD = { r: ['0010', '0000'], z: ['1000', '0000'], s: ['0100', '0000'], g: ['0001', '0000'], o: ['p1000', 'p0000'], u: ['p0100', 'p0000'], i: ['p0010', 'p0000'], e: ['p0001', 'p0000'] };
const kiLegende = (art) => `<div class="kipanel kilegende"><div class="kititel">🔍 So erkennst du die Merkmale</div><div class="kilegfeld">${art.fragen.map((f) => {
  const [ja, nein] = KI_LEGENDE_BILD[f.id];
  return `<div class="kileg"><span>${f.text}</span><div><span class="kimini2">${kiMonster(ja)}<i class="kja">ja</i></span><span class="kimini2">${kiMonster(nein)}<i class="knein">nein</i></span></div></div>`;
}).join('')}</div><div class="hinweis">Unter jedem Bild steht, was wir schon wissen: ${art.ja} ${art.jaT} oder ${art.nein} ${art.neinT}.</div></div>`;
const KI_LEGENDE = kiLegende(KI_ART.monster);
// Die Fragen eines Auftrags: kiFragen (mehrere nacheinander) oder die eine frage
const kiFragenListe = () => H.kiFragen || (H.frage ? [H.frage] : []);
const kiAktFrage = () => kiFragenListe()[KS.fi || 0];
function kiFrageNeu(i) { KS.fi = i; KS.falsch = new Set(); const f = kiFragenListe()[i]; KS.reihe = f?.optionen ? kiMischen(f.optionen.map((_, j) => j)) : []; }

function kiStart() {
  KS = { fehler: 0, hier: 0, phase: ['frage', 'wort'].includes(H.ki) ? 'frage' : 'haupt', aus: false, falsch: new Set(), reihe: [], fi: 0 };
  kiFrageNeu(0);
  KS.art = KI_ART.monster;
  if (H.regel) { KS.train = kiKarten(H.train, H.regel, H.rauschen); KS.test = kiKarten(H.test, H.regel); KS.art = kiArtKarten(KS.train); }
  if (H.ki === 'baum') { KS.baum = null; KS.sel = ''; }
  if (H.ki === 'vergleich') KS.vFalsch = new Set();
  if (H.ki === 'bias') { KS.wahl = new Set(); KS.extra = []; KS.pool = kiKarten(H.pool, H.regel); }
  if (H.ki === 'schach') { KS.boxen = {}; KS.ergebnisse = []; schachNeu(); }
  if (H.ki === 'maschine') { KS.temp = 1; KS.start = 'der'; KS.saetze = []; }
  $('#befehle').innerHTML = '';
  $('#protokoll').innerHTML = '';
  log({ baum: '🌳 Tippe einen Knoten im Baum an und wähle rechts eine Frage oder eine Entscheidung.', vergleich: '🧪 Vergleiche die beiden Späher. Wähle dann rechts.',
    bias: '⚖️ Wähle 2 neue Trainingsmonster und lass den Späher neu lernen.', schach: '♟️ Tippe einen deiner Bauern an, dann das Feld, auf das er ziehen soll.',
    box: '🎲 Schau in die Schachtel und wähle rechts.', maschine: '✍️ Wähle ein Startwort und lass die Maschine schreiben.' }[H.ki] || '❓ Lies die Frage und tippe eine Antwort an.', 'leise');
  const merke = kapitelHoefe(H.kapitel).find((x) => x.merke)?.merke;
  neben([{ label: '🗺️<span class="lbl"> Karte</span>', title: 'Zurück zur Karte (kostet nichts)', fn: zurKarte },
    ...(merke ? [{ label: '📖<span class="lbl"> Merke</span>', title: 'Das Wichtigste dieses Kapitels nachlesen', fn: () => lernkarte(merke) }] : []),
    { label: '🏳️<span class="lbl"> Aufgeben</span>', title: 'Für heute aufhören (nur Teillohn)', fn: () => { if (KS && !KS.aus) kiEnde(false); } }]);
  kiZeigen();
}

function kiFehler(msg) {
  KS.fehler++; KS.hier++;
  log(`❌ ${msg}`, 'err');
  if (KS.hier >= 2 && H.tipps.length) log(`💡 ${H.tipps[Math.min(H.tipps.length - 1, KS.hier - 2)]}`, 'leise');
}
// Hauptteil geschafft: Ergebnis ansehen, dann Frage oder Ende
function kiGeschafft() { KS.phase = 'erfolg'; KS.hier = 0; }
function kiWeiter() {
  if (kiFragenListe().length && KS.phase !== 'frage') { KS.phase = 'frage'; KS.hier = 0; kiFrageNeu(0); kiZeigen(); } else kiEnde(true);
}

// Monsterkarten: label = Wahrheit, tipp = was der Späher sagt (✓/✗ am Rand)
function kiKartenHtml(titel, karten, { baum = null, label = true, klick = null, wahl = null } = {}) {
  return `<div class="kipanel"><div class="kititel">${titel}</div><div class="kikarten">${karten.map((k, i) => {
    const p = baum !== null && kiFertig(baum) ? kiEntscheide(baum, k.code) : null;
    const cls = [p === null ? '' : p === k.frech ? 'ok' : 'nein', wahl?.has(i) ? 'sel' : '', klick ? 'klick' : ''].join(' ');
    const art = kiArtVon(k.code);
    return `<div class="kikarte ${cls}" ${klick ? `data-${klick}="${i}"` : ''}>${kiMonster(k.code, label ? k.frech : '❔')}${p === null ? '' : `<span class="kitipp" title="Das sagt der Späher">🔭${p ? art.ja : art.nein}</span>`}</div>`;
  }).join('')}</div></div>`;
}
// Baum zeichnen: Fragen mit Ästen ja/nein, Blätter mit den Trainingsmonstern, die dort ankommen
function kiBaumHtml(b, karten, pfad = '', aktiv = true, art = null) {
  art ||= kiArtKarten(karten);
  const sel = aktiv && KS.sel === pfad ? 'sel' : '', an = aktiv ? `data-pfad="${pfad}"` : '';
  if (b && typeof b === 'object') {
    const ja = karten.filter((k) => kiMerkmal(k.code, b.frage)), nein = karten.filter((k) => !kiMerkmal(k.code, b.frage));
    return `<div class="kknoten"><button class="kfrage ${sel}" ${an}>❓ ${kiFrage(b.frage).text}</button>
      <div class="kaeste"><div class="kast"><span class="kja">ja</span>${kiBaumHtml(b.ja, ja, pfad + 'j', aktiv, art)}</div>
      <div class="kast"><span class="knein">nein</span>${kiBaumHtml(b.nein, nein, pfad + 'n', aktiv, art)}</div></div></div>`;
  }
  const mini = karten.map((k) => `<span class="kmini ${b === null ? '' : b === k.frech ? 'ok' : 'nein'}">${kiMonster(k.code, k.frech)}</span>`).join('');
  return `<div class="kknoten"><button class="kblatt ${b === null ? 'leer' : b ? 'frech' : 'lieb'} ${sel}" ${an}>${b === null ? '❔ leer' : b ? `${art.ja} ${art.jaT}` : `${art.nein} ${art.neinT}`}</button>
    <div class="kminis">${mini || '<span class="hinweis">–</span>'}</div></div>`;
}
const kiHole = (b, pfad) => [...pfad].reduce((x, c) => (c === 'j' ? x.ja : x.nein), b);
function kiSetze(pfad, wert) {
  if (!pfad) { KS.baum = wert; return; }
  kiHole(KS.baum, pfad.slice(0, -1))[pfad.at(-1) === 'j' ? 'ja' : 'nein'] = wert;
}
const kiLeer = (b, pfad = '') => (b === null ? pfad : typeof b === 'object' ? kiLeer(b.ja, pfad + 'j') ?? kiLeer(b.nein, pfad + 'n') : null);

function kiFrageHtml() {
  const f = kiAktFrage(), n = kiFragenListe().length;
  const kopf = `<div class="kititel">❓ Eulalias Frage${n > 1 ? ` ${KS.fi + 1} von ${n}` : ''}</div><p class="kfr">${esc(f.frage)}</p>`;
  if (f.art === 'zahl') {
    return `<div class="kipanel kifrage">${kopf}<div class="kiknoepfe"><input id="kiZahl" class="codefeld" inputmode="decimal" autocomplete="off" placeholder="Zahl" style="max-width:9em">
      <button class="btn gold" id="kiZahlOk">✔ Prüfen</button></div></div>`;
  }
  return `<div class="kipanel kifrage">${kopf}
    ${KS.reihe.map((i) => `<button class="kopt ${KS.falsch.has(i) ? 'falsch' : ''}" data-opt="${i}" ${KS.falsch.has(i) ? 'disabled' : ''}>${esc(f.optionen[i])}</button>`).join('')}</div>`;
}
// 🎲 Schaubild der Trainingspartien: Siege des Roboters je 10 Partien
function kiLernkurveHtml(t) {
  const bloecke = [];
  for (let i = 0; i < t.length; i += 10) bloecke.push(t.slice(i, i + 10).filter((x) => x === 'roboter').length);
  return `<div class="kipanel"><div class="kititel">📈 Lernkurve: Siege des Roboters je 10 Trainingspartien</div>
    <svg viewBox="0 0 ${bloecke.length * 50 + 30} 150" class="dssvg" style="max-width:420px">
    <line x1="24" y1="10" x2="24" y2="120" stroke="#888"/><line x1="24" y1="120" x2="${bloecke.length * 50 + 28}" y2="120" stroke="#888"/>
    <text x="18" y="124" font-size="10" text-anchor="end" fill="#aaa">0</text><text x="18" y="24" font-size="10" text-anchor="end" fill="#aaa">10</text>
    ${bloecke.map((s, i) => `<rect x="${32 + i * 50}" y="${120 - s * 10}" width="34" height="${s * 10}" fill="#d8a030"/><text x="${49 + i * 50}" y="${115 - s * 10}" font-size="12" text-anchor="middle" fill="#fff">${s}</text>
      <text x="${49 + i * 50}" y="136" font-size="10" text-anchor="middle" fill="#aaa">${i * 10 + 1}–${i * 10 + 10}</text>`).join('')}
    <text x="${bloecke.length * 25 + 26}" y="149" font-size="10" text-anchor="middle" fill="#aaa">Trainingspartien</text></svg>
    <p class="hinweis">Gegner war ein Lehrling, der einfach irgendeinen erlaubten Zug macht.</p></div>`;
}
// ⏩ Der Roboter trainiert gegen einen Lehrling, der zufällig zieht – mit denselben Schachteln und Regeln (Belohnung/Bestrafung des letzten Zugs)
function schachTraining(n) {
  const kurve = [];
  for (let p = 0; p < n; p++) {
    let brett = SCHACH_START, letzte = null, sieger = null;
    while (!sieger) {
      const zm = schachZuege(brett, 'mensch');
      brett = schachZiehe(brett, zm[Math.floor(Math.random() * zm.length)]);
      if (schachSieger(brett, 'mensch')) { sieger = 'mensch'; break; }
      const zr = schachZuege(brett, 'roboter'), box = (KS.boxen[brett] ||= zr.map(() => 1));
      if (!box.some((x) => x > 0)) { sieger = 'mensch'; break; }   // leere Schachtel: er gibt auf, bestraft wird sein Zug davor
      const i = kiZiehePerle(box);
      letzte = { brett, i };
      brett = schachZiehe(brett, zr[i]);
      if (schachSieger(brett, 'roboter')) sieger = 'roboter';
    }
    if (letzte) { const b = KS.boxen[letzte.brett]; if (sieger === 'roboter') b[letzte.i]++; else b[letzte.i] = Math.max(0, b[letzte.i] - 1); }
    kurve.push(sieger);
  }
  return kurve;
}
const kiGeschichtenHtml = () => `<div class="kipanel"><div class="kititel">📖 Die Geschichten, die die Maschine gelesen hat</div>
  <ol class="kigesch">${KI_GESCHICHTEN.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>`;

// ♟️ Brett: Felder antippbar (klick), gewählter Bauer, mögliche Ziele, ein Zug in Perlenfarbe
function schachHtml(brett, { klick = false, sel = null, ziele = [], zug = null, farbe = null } = {}) {
  return `<div class="schach">${[...brett].map((f, i) => {
    const cls = [(Math.floor(i / 3) + i % 3) % 2 ? 'dunkel' : '', sel === i ? 'sel' : '', ziele.includes(i) ? 'ziel' : '', zug && zug.includes(i) ? 'zug' : ''].join(' ');
    return `<button class="sfeld ${cls}" ${klick ? `data-feld="${i}"` : 'disabled'} ${farbe ? `style="--pf:${farbe}"` : ''}>${f === '●' ? '<span class="sb rob">🤖</span>' : f === '○' ? '<span class="sb ich">🧑</span>' : ''}<span class="fname">${feldName(i)}</span></button>`;
  }).join('')}</div>`;
}
function schachBoxHtml(L, titel = '🎲 Schachtel des Roboters') {
  return `<div class="kipanel perlbox"><div class="kititel">${titel}</div>${schachHtml(L.brett, { zug: L.i >= 0 ? L.zuege[L.i] : null, farbe: L.i >= 0 ? PERLEN[L.i] : null })}
    ${L.zuege.map((z, j) => `<div class="pzeile ${j === L.i ? 'gezogen' : ''}"><span class="pz"><i class="pdot" style="background:${PERLEN[j]}"></i>${feldName(z[0])} → ${feldName(z[1])}${L.brett[z[1]] !== ' ' ? ' ✖ schlagen' : ''}</span>
      <span class="perlen">${L.perlen[j] ? `<i style="background:${PERLEN[j]}"></i>`.repeat(L.perlen[j]) : '<span class="hinweis">keine Perle</span>'}${j === L.i && L.aenderung ? ` <b>${L.aenderung}</b>` : ''}</span></div>`).join('')}</div>`;
}
function schachNeu() { Object.assign(KS, { brett: SCHACH_START, sel: null, zuege: [], letzte: null, ende: null, denkt: false, msg: 'Du spielst 🧑 (unten) und fängst an.' }); }
function schachKlick(i) {
  if (KS.ende || KS.denkt) return;
  const zuege = schachZuege(KS.brett, 'mensch');
  if (KS.brett[i] === '○') {
    KS.sel = zuege.some((z) => z[0] === i) ? i : null;
    if (KS.sel === null) toast('Dieser Bauer kann gerade nicht ziehen.');
    kiZeigen(); return;
  }
  const z = zuege.find((x) => x[0] === KS.sel && x[1] === i);
  if (!z) return;
  KS.brett = schachZiehe(KS.brett, z); KS.sel = null;
  if (schachSieger(KS.brett, 'mensch')) { schachEnde('mensch'); return; }
  KS.denkt = true; KS.msg = '🤖 Der Roboter greift in seine Schachtel …';
  kiZeigen();
  const ks = KS;
  setTimeout(() => { if (KS === ks && !KS.aus) roboterZieht(); }, 800);
}
function roboterZieht() {
  KS.denkt = false;
  const zuege = schachZuege(KS.brett, 'roboter'), box = (KS.boxen[KS.brett] ||= zuege.map(() => 1));
  if (!box.some((x) => x > 0)) {
    KS.letzte = { brett: KS.brett, perlen: [...box], i: -1, zuege };
    schachEnde('mensch', '🏳️ Die Schachtel ist leer – der Roboter gibt auf!');
    return;
  }
  const i = kiZiehePerle(box);
  KS.zuege.push({ brett: KS.brett, i });
  KS.letzte = { brett: KS.brett, perlen: [...box], i, zuege };
  KS.brett = schachZiehe(KS.brett, zuege[i]);
  KS.msg = `🤖 Er zieht eine Perle: ${feldName(zuege[i][0])} → ${feldName(zuege[i][1])}. Du bist dran.`;
  if (schachSieger(KS.brett, 'roboter')) schachEnde('roboter');
  else kiZeigen();
}
// Ende einer Partie: der letzte Zug des Roboters wird belohnt (+1 Perle) oder bestraft (−1 Perle)
function schachEnde(sieger, vorweg = '') {
  const l = KS.zuege.at(-1);
  KS.ende = sieger;
  KS.ergebnisse.push(sieger);
  if (l) {
    const b = KS.boxen[l.brett];
    if (sieger === 'roboter') b[l.i]++; else b[l.i] = Math.max(0, b[l.i] - 1);
    KS.letzte = { brett: l.brett, perlen: [...b], i: l.i, zuege: schachZuege(l.brett, 'roboter'), aenderung: sieger === 'roboter' ? '+1' : '−1' };
  }
  KS.msg = `${vorweg ? vorweg + ' ' : ''}${sieger === 'roboter' ? '🤖 Der Roboter gewinnt! Belohnung: eine Perle mehr für seinen letzten Zug.' : `🎉 Du gewinnst!${l ? ' Bestrafung: Die Perle für den letzten Zug des Roboters fliegt raus.' : ''}`}`;
  log(KS.msg, sieger === 'roboter' ? 'err' : 'ok');
  kiZeigen();
}

function kiSchreibe() {
  const w = [KS.start], schritte = [];
  while (w.length < 10 && w.at(-1) !== '.') {
    const von = w.at(-1), n = kiNaechstesWort(von, KS.temp);
    schritte.push({ von, kand: Object.entries(KI_FOLGE[von] || {}).sort((a, b) => b[1] - a[1]), n });
    w.push(n);
  }
  KS.saetze.push({ text: w.join(' ').replace(' .', '.'), temp: KS.temp, schritte });
}
const KI_TEMP = [0, 0.5, 1, 2];

// --- Anzeige: links Experiment, rechts Knöpfe, Hauptknopf je nach Phase ---
function kiZeigen() {
  if (!KS || KS.aus) return;
  const box = $('#archiv'), bef = $('#befehle'), ph = KS.phase;
  let links = '', rechts = '';
  if (ph === 'frage') {
    const zahl = kiAktFrage()?.art === 'zahl';
    links = kiEule(['frage', 'wort'].includes(H.ki) ? H.story : kiFragenListe().length > 1 ? 'Noch ein paar Fragen, bevor du gehst:' : 'Eine letzte Frage, bevor du gehst:')
      + (['wort', 'maschine'].includes(H.ki) ? kiGeschichtenHtml() : '') + (KS.training ? kiLernkurveHtml(KS.training) : '')
      + (H.ki === 'box' ? schachBoxHtml({ brett: H.box.brett, perlen: H.box.perlen, i: KS.wahlZug ?? -1, zuege: schachZuege(H.box.brett, 'roboter') }) : '') + kiFrageHtml();
    rechts = `<span class="hinweis">${zahl ? '✏️ Rechne aus und tippe links die Zahl ein. Prozent: z. B. 25 (oder 0,25).' : '👆 Tippe links die Antwort an, die du für richtig hältst.'}</span>
      <span class="hinweis">🎲 Raten lohnt sich nicht: Jeder Fehlversuch kostet ${Math.round(RATE_ABZUG * 100)} % vom Lohn.</span>`;
    haupt(zahl ? '✔ Prüfen' : '👆 Antwort antippen', zahl ? kiZahlPruefen : null, zahl);
  } else if (H.ki === 'baum') {
    const fertig = ph === 'erfolg', art = KS.art;
    links = kiEule(H.story) + kiLegende(art) + kiKartenHtml(`📋 Trainingsdaten: Diese ${KS.train.length} ${art.wort} kennen wir`, KS.train, { baum: KS.baum })
      + `<div class="kipanel"><div class="kititel">🌳 Dein Entscheidungsbaum (höchstens ${H.tiefe} Frage${H.tiefe > 1 ? 'n' : ''} hintereinander)</div><div class="kbaum">${kiBaumHtml(KS.baum, KS.train, '', !fertig)}</div></div>`
      + (KS.testZeigen ? kiKartenHtml(`🧪 Neue ${art.wort} (Test): ${kiTreffer(KS.baum, KS.test)} von ${KS.test.length} richtig erkannt`, KS.test, { baum: KS.baum }) : '');
    if (!fertig) {
      const tief = KS.sel.length, hier = kiHole(KS.baum, KS.sel);
      // Weg zum gewählten Knoten in Worten, z. B. „Zähne? ja → schmale Augen? nein“
      const weg = [...KS.sel].map((c, i) => `${kiFrage(kiHole(KS.baum, KS.sel.slice(0, i)).frage).kurz}? ${c === 'j' ? 'ja' : 'nein'}`).join(' → ');
      rechts = `<div class="kiwahl"><b>${KS.sel ? `Gewählt (gelb): ${weg}` : 'Gewählt (gelb): die Wurzel, ganz oben'}</b><span class="hinweis">Was soll hier stehen? Eine Frage teilt die ${art.wort} weiter auf, ein Blatt entscheidet. Anderen Knoten antippen = dort weitermachen.</span>
        <div class="kiknoepfe">${tief < H.tiefe ? art.fragen.map((f) => `<button class="btn klein ${hier?.frage === f.id ? 'gold' : ''}" data-frage="${f.id}">❓ ${f.text}</button>`).join('') : `<span class="hinweis">Hier ist keine weitere Frage erlaubt.</span>`}</div>
        <div class="kiknoepfe"><button class="btn klein ${hier === true ? 'gold' : ''}" data-blatt="1">${art.ja} ${art.jaT}</button><button class="btn klein ${hier === false ? 'gold' : ''}" data-blatt="0">${art.nein} ${art.neinT}</button>
        ${hier !== null ? '<button class="btn klein leise" data-weg="1">🗑️ leeren</button>' : ''}</div></div>`;
      haupt('✔ Prüfen', kiBaumPruefen, kiFertig(KS.baum));
    }
  } else if (H.ki === 'vergleich') {
    const [A, B] = H.baeume, n = KS.train.length;
    links = kiEule(H.story) + KI_LEGENDE + kiKartenHtml(`📋 Trainingsdaten (${n} Monster)`, KS.train)
      + `<div class="kizwei">${[A, B].map((b, i) => `<div class="kipanel ${KS.gewaehlt === i ? 'gewaehlt' : ''}"><div class="kititel">${['🅰️', '🅱️'][i]} Späher ${'AB'[i]} · Training: ${kiTreffer(b, KS.train)} von ${n} richtig
        ${KS.testZeigen ? ` · <b>Test: ${kiTreffer(b, KS.test)} von ${KS.test.length}</b>` : ''}</div><div class="kbaum">${kiBaumHtml(b, KS.train, '', false)}</div></div>`).join('')}</div>`
      + (KS.testZeigen ? kiKartenHtml('🧪 Neue Monster (Test)', KS.test) : '');
    if (ph === 'haupt') {
      rechts = `<div class="kiwahl"><b>Welcher Späher erkennt neue Monster besser?</b><div class="kiknoepfe">${[0, 1].map((i) => `<button class="btn" data-baum="${i}" ${KS.vFalsch.has(i) ? 'disabled' : ''}>${['🅰️', '🅱️'][i]} Späher ${'AB'[i]}</button>`).join('')}</div>
        <span class="hinweis">Denk an den einen merkwürdigen Ausreißer in den Trainingsdaten. Raten kostet Lohn.</span></div>`;
      haupt('👆 Späher wählen', null, false);
    }
  } else if (H.ki === 'bias') {
    const alle = [...KS.train, ...KS.extra], baum = kiLerne(alle, 1), art = KS.art;
    links = kiEule(H.story) + kiLegende(art) + kiKartenHtml(`📋 Trainingsdaten (${alle.length} ${art.wort})`, alle)
      + `<div class="kipanel"><div class="kititel">🔭 Das hat der Späher daraus gelernt</div><div class="kbaum">${kiBaumHtml(baum, alle, '', false)}</div></div>`
      + kiKartenHtml(`🧪 Neue ${art.wort} (Test): ${kiTreffer(baum, KS.test)} von ${KS.test.length} richtig erkannt`, KS.test, { baum })
      + (ph === 'haupt' ? kiKartenHtml(`➕ Weitere ${art.wort} für das Training – tippe genau 2 an (${KS.wahl.size}/2)`, KS.pool, { klick: 'pool', wahl: KS.wahl }) : '');
    if (ph === 'haupt') {
      rechts = '<span class="hinweis">Der Späher lernt die Frage, die seine Trainingsdaten am besten trennt. Welche Monster bringen ihn auf die richtige Spur?</span>';
      haupt('🧠 Neu lernen', kiBiasLernen, KS.wahl.size === 2);
    }
  } else if (H.ki === 'schach') {
    const siege = KS.ergebnisse.filter((x) => x === 'mensch').length, nieder = KS.ergebnisse.length - siege, nr = Math.min(H.partien, KS.ergebnisse.length + (KS.ende ? 0 : 1));
    const ziele = KS.sel === null ? [] : schachZuege(KS.brett, 'mensch').filter((z) => z[0] === KS.sel).map((z) => z[1]);
    links = kiEule(H.story) + `<div class="kipanel"><div class="kititel">♟️ Partie ${nr} von ${H.partien} · 🧑 ${siege} : ${nieder} 🤖
        <span class="kiverlauf">${KS.ergebnisse.map((x) => (x === 'mensch' ? '🧑' : '🤖')).join('')}</span></div>
      <div class="kizwei schachzwei"><div>${schachHtml(KS.brett, { klick: !KS.ende && !KS.denkt, sel: KS.sel, ziele })}<p class="kimsg">${esc(KS.msg)}</p></div>
      ${KS.letzte ? schachBoxHtml(KS.letzte, KS.letzte.aenderung ? '🎲 Schachtel seines letzten Zugs' : '🎲 Schachtel für diese Stellung') : '<div class="kipanel perlbox"><div class="kititel">🎲 Schachteln</div><p class="hinweis">Für jede Stellung hat der Roboter eine Schachtel. Am Anfang liegt für jeden möglichen Zug eine Perle darin.</p></div>'}</div></div>`;
    rechts = `<span class="hinweis">Bauern ziehen ein Feld nach vorn und schlagen schräg nach vorn. Gewonnen hat, wer die andere Seite erreicht, alle Gegner schlägt – oder wenn der andere nicht mehr ziehen kann.</span>
      <span class="hinweis">Gelernte Stellungen: ${Object.keys(KS.boxen).length}</span>`;
    if (KS.training) links += kiLernkurveHtml(KS.training);
    if (!KS.ende) haupt(KS.denkt ? '🤖 denkt …' : '♟️ Du bist dran', null, false);
    else if (KS.ergebnisse.length >= H.partien && H.training && !KS.training) {
      rechts += `<span class="hinweis">⏩ Jetzt trainiert der Roboter ${H.training} schnelle Partien gegen einen Lehrling – mit denselben Schachteln. Schau dir danach an, wie oft er gewinnt.</span>`;
      haupt(`⏩ ${H.training} Trainingspartien`, () => { KS.training = schachTraining(H.training); log(`⏩ ${H.training} Trainingspartien gespielt. Gelernte Stellungen: ${Object.keys(KS.boxen).length}`, 'ok'); kiZeigen(); });
    } else if (KS.ergebnisse.length >= H.partien) { if (ph === 'haupt') kiGeschafft(); haupt('➡ Weiter', kiWeiter); }
    else haupt('▶ Nächste Partie', () => { schachNeu(); kiZeigen(); });
  } else if (H.ki === 'box') {
    const zuege = schachZuege(H.box.brett, 'roboter');
    links = kiEule(H.story) + schachBoxHtml({ brett: H.box.brett, perlen: H.box.perlen, i: ph === 'erfolg' ? KS.wahlZug : -1, zuege });
    if (ph === 'haupt') {
      rechts = `<div class="kiwahl"><b>Welchen Zug zieht der Roboter am wahrscheinlichsten?</b><div class="kiknoepfe">${zuege.map((z, j) => `<button class="btn klein" data-zug="${j}"><i class="pdot" style="background:${PERLEN[j]}"></i> ${feldName(z[0])} → ${feldName(z[1])}</button>`).join('')}</div></div>`;
      haupt('👆 Zug wählen', null, false);
    }
  } else if (H.ki === 'maschine') {
    const s = KS.saetze.at(-1);
    links = kiEule(H.story) + kiGeschichtenHtml() + `<div class="kipanel"><div class="kititel">✍️ Was die Maschine geschrieben hat (${KS.saetze.length})</div>
      ${KS.saetze.length ? `<ol class="kisaetze">${KS.saetze.map((x) => `<li><b>${esc(x.text)}</b> <span class="hinweis">Temperatur ${x.temp}</span></li>`).join('')}</ol>` : '<p class="hinweis">Noch nichts. Tippe rechts auf „✍️ Schreiben“.</p>'}
      ${s ? `<div class="kititel">So hat sie beim letzten Satz gewählt:</div><div class="kischritte">${s.schritte.map((x) => `<div>nach „${esc(x.von)}“: ${x.kand.map(([w, n]) => `<span class="${w === x.n ? 'gew' : ''}">${esc(w)} ${n}×</span>`).join(' · ')}</div>`).join('')}</div>` : ''}</div>`;
    rechts = `<div class="kiwahl"><b>Startwort</b><div class="kiknoepfe">${['der', 'die'].map((w) => `<button class="btn klein ${KS.start === w ? 'gold' : ''}" data-start="${w}">${w}</button>`).join('')}</div>
      <b>🎲 Temperatur (Zufall): ${KS.temp}</b><input type="range" id="kiTemp" min="0" max="3" step="1" value="${KI_TEMP.indexOf(KS.temp)}">
      <span class="hinweis">0 = immer das häufigste Wort · 2 = auch seltene Wörter</span>
      <button class="btn gruen" id="kiSchreib">✍️ Schreiben</button></div>`;
    const fehlt = H.saetze - KS.saetze.length;
    haupt(fehlt > 0 ? `✍️ noch ${fehlt} ${fehlt > 1 ? 'Sätze' : 'Satz'}` : '➡ Weiter zur Frage', kiWeiter, fehlt <= 0);
  }
  if (ph === 'erfolg' && !['schach'].includes(H.ki)) { rechts = `<span class="hinweis">✅ Geschafft! Schau dir das Ergebnis links an.</span>`; haupt('➡ Weiter', kiWeiter); }
  box.innerHTML = links;
  bef.innerHTML = `<div class="kirechts">${rechts}</div>`;
  kiKlicks();
  if ($('#kiZahl')) { $('#kiZahl').focus(); $('#kiZahl').onkeydown = (e) => { if (e.key === 'Enter') kiZahlPruefen(); }; $('#kiZahlOk').onclick = kiZahlPruefen; }
}
// Rechenfrage prüfen: Komma oder Punkt, „60 %“ oder 0,6 (wenn Prozent gesucht sind)
function kiZahlPruefen() {
  const f = kiAktFrage(), ein = ($('#kiZahl')?.value || '').trim();
  if (!f || f.art !== 'zahl') return;
  if (!ein) { toast('Tipp erst eine Zahl ein.'); return; }
  let x = Number(ein.replace('%', '').replace(',', '.').trim());
  const soll = typeof f.soll === 'function' ? f.soll(KS) : f.soll;
  if (Number.isFinite(x) && soll > 1 && x > 0 && x <= 1 && /^0?[.,]/.test(ein)) x *= 100;
  if (Number.isFinite(x) && Math.abs(x - soll) <= (f.tol ?? 0.5) + 1e-9) { log(`✅ Richtig! ${f.erklaerung || ''}`, 'ok'); kiFrageFertig(); return; }
  kiFehler(`${ein} stimmt nicht – rechne noch einmal nach. (Lohn jetzt ${Math.round(rateFaktor(KS.fehler + 1) * 100)} %)`);
  kiZeigen();
}
// Eine Frage richtig: nächste Frage oder Ende
function kiFrageFertig() {
  KS.hier = 0;
  if (KS.fi + 1 < kiFragenListe().length) { kiFrageNeu(KS.fi + 1); kiZeigen(); } else kiEnde(true);
}

function kiKlicks() {
  const alle = (sel, fn) => { for (const b of document.querySelectorAll(sel)) b.onclick = () => fn(b); };
  alle('#archiv [data-pfad]', (b) => { KS.sel = b.dataset.pfad; kiZeigen(); });
  alle('#befehle [data-frage]', (b) => { kiSetze(KS.sel, { frage: b.dataset.frage, ja: null, nein: null }); KS.sel += 'j'; kiZeigen(); });
  alle('#befehle [data-blatt]', (b) => { kiSetze(KS.sel, b.dataset.blatt === '1'); KS.sel = kiLeer(KS.baum) ?? KS.sel; kiZeigen(); });
  alle('#befehle [data-weg]', () => { kiSetze(KS.sel, null); kiZeigen(); });
  alle('#archiv [data-opt]', (b) => kiAntwort(+b.dataset.opt));
  alle('#befehle [data-baum]', (b) => {
    // Falsche Wahl zählt nicht als geschafft (Didaktik-Prüfung): Test wird gezeigt, man muss noch einmal wählen
    const i = +b.dataset.baum;
    KS.testZeigen = true;
    if (i === 0) { KS.gewaehlt = 0; log('✅ Richtig: Späher A erkennt neue Monster besser.', 'ok'); kiGeschafft(); }
    else { KS.vFalsch.add(1); kiFehler(`Späher B kennt die Trainingsmonster besser – aber schau dir jetzt den Test an: Bei neuen Monstern liegt er öfter daneben. (Lohn jetzt ${Math.round(rateFaktor(KS.fehler + 1) * 100)} %)`); }
    kiZeigen();
  });
  alle('#archiv [data-pool]', (b) => {
    const i = +b.dataset.pool;
    if (KS.wahl.has(i)) KS.wahl.delete(i); else if (KS.wahl.size < 2) KS.wahl.add(i); else toast('Genau 2 – tippe erst eins wieder ab.');
    kiZeigen();
  });
  alle('#archiv [data-feld]', (b) => schachKlick(+b.dataset.feld));
  alle('#befehle [data-zug]', (b) => {
    const j = +b.dataset.zug, max = Math.max(...H.box.perlen);
    if (H.box.perlen[j] === max) { KS.wahlZug = j; log('✅ Richtig: Von dieser Farbe liegen die meisten Perlen drin.', 'ok'); kiGeschafft(); }
    else kiFehler('Von dieser Farbe liegen weniger Perlen in der Schachtel.');
    kiZeigen();
  });
  alle('#befehle [data-start]', (b) => { KS.start = b.dataset.start; kiZeigen(); });
  const t = $('#kiTemp');
  if (t) t.oninput = () => { KS.temp = KI_TEMP[+t.value]; kiZeigen(); };
  const s = $('#kiSchreib');
  if (s) s.onclick = () => { kiSchreibe(); log(`✍️ ${KS.saetze.at(-1).text}`, 'ok'); kiZeigen(); };
}

function kiBaumPruefen() {
  if (!kiFertig(KS.baum)) { toast('Jedes Blatt braucht eine Entscheidung: 😠 oder 😊.'); return; }
  const tr = kiTreffer(KS.baum, KS.train), te = kiTreffer(KS.baum, KS.test), n = KS.train.length;
  const ok = H.testZiel ? te >= H.testZiel : tr === n;
  KS.testZeigen = ok || !!H.testZiel;
  if (ok) { log(`✅ Training: ${tr} von ${n} richtig · neue Monster: ${te} von ${KS.test.length}`, 'ok'); kiGeschafft(); }
  else kiFehler(H.testZiel ? `Bei den neuen Monstern lag dein Späher nur ${te} von ${KS.test.length} Mal richtig.` : `${n - tr} Trainingsmonster ${n - tr === 1 ? 'landet' : 'landen'} im falschen Blatt (rot markiert).`);
  kiZeigen();
}
function kiBiasLernen() {
  const vorher = kiLerne(KS.train, 1), art = KS.art;
  KS.extra = [...KS.wahl].map((i) => KS.pool[i]);
  const baum = kiLerne([...KS.train, ...KS.extra], 1), te = kiTreffer(baum, KS.test);
  // alleNeu (k17): jede gewählte Karte muss etwas zeigen, das der Späher bisher falsch sieht – sonst bringt sie nichts Neues
  const nutzlos = H.alleNeu ? KS.extra.filter((k) => kiEntscheide(vorher, k.code) === k.frech).length : 0;
  if (te === KS.test.length && !nutzlos) { log(`✅ Jetzt erkennt der Späher alle neuen ${art.wort} richtig!`, 'ok'); kiGeschafft(); }
  else if (te === KS.test.length) kiFehler(`Der Test klappt – aber ${nutzlos === 1 ? 'eine deiner Karten zeigt' : 'deine Karten zeigen'} nichts Neues: So ${nutzlos === 1 ? 'einen Fall kannte' : 'Fälle kannte'} der Späher schon. Tausche ${nutzlos === 1 ? 'sie' : 'sie'} gegen ${art.wort}, bei denen er bisher danebenliegt.`);
  else kiFehler(`Der Späher liegt noch ${KS.test.length - te} von ${KS.test.length} Mal falsch. Er hat wieder „${kiFrage(baum.frage || art.fragen[0].id).kurz}“ gelernt.`);
  kiZeigen();
}
function kiAntwort(i) {
  const f = kiAktFrage();
  if (i === f.richtig) { log(`✅ Richtig! ${f.erklaerung || ''}`, 'ok'); kiFrageFertig(); return; }
  KS.falsch.add(i);
  kiFehler(`Das stimmt nicht – überleg noch einmal. (Lohn jetzt ${Math.round(rateFaktor(KS.fehler + 1) * 100)} %)`);
  kiZeigen();
}

// Kapitel geschafft: noch einmal das Merke des Kapitels und wozu es in echt gut ist
function kiRueckblick(k) {
  const m = kapitelHoefe(k).find((x) => x.merke)?.merke;
  return m ? `<div class="kineu"><b>📓 Kapitel „${esc(KAPITEL[k].name)}“ geschafft – das hast du gelernt:</b><p><b>${esc(m.titel)}</b> ${esc(m.text)}</p>
    ${m.echt ? `<p>🌍 ${esc(m.echt)}</p>` : ''}</div>` : '';
}

// ⭐ ohne Fehler · ⭐ höchstens 2 Fehler (gespeichert in kurz/sparsam wie bei den Höfen)
function kiEnde(ok) {
  const h = hofStand(H.id), vorher = spaeherAktiv(), kapVorher = kapitelFertig(H.kapitel), fehlerfrei = ok && KS.fehler === 0, wenig = ok && KS.fehler <= 2, rf = rateFaktor(KS.fehler);
  let gold;
  if (ok) {
    const stern = (neu, alt) => (neu ? H.lohn * STERN_BONUS * (alt ? NACHARBEIT : 1) : 0);
    gold = H.lohn * (h.fertig ? NACHARBEIT : 1) * rf + stern(fehlerfrei, h.kurz) + stern(wenig, h.sparsam);   // 🎲 Raten kostet (wie Vorhersagen)
  } else gold = h.fertig ? 0 : H.lohn * TEILLOHN * 0.5;
  gold = Math.round(gold * lohnFaktor());
  const warFertig = h.fertig;
  h.versuche++; h.fertig ||= ok; h.kurz ||= fehlerfrei; h.sparsam ||= wenig; h.heute = P.tag;
  P.gold += gold;
  // Fürs 📓 Heft: was man selbst gebaut bzw. gespielt hat
  if (ok) (P.kiHeft ||= {})[H.id] = { baum: KS.baum ?? null, extra: KS.extra?.map((k) => k.code), ergebnisse: KS.ergebnisse, saetze: KS.saetze?.map(({ text, temp }) => ({ text, temp })) };
  speichern();
  KS.aus = true;
  const st = (an, t) => `<span class="${an ? '' : 'aus'}" title="${t}">⭐</span>`;
  karte(`<h2>${ok ? 'Geschafft! 🔭' : 'Für heute aufgehört'}</h2>
    ${ok && H.danach ? kiEule(H.danach) : ''}
    ${ok ? `<div class="sterne">✅ ${st(fehlerfrei, 'ohne Fehler')}${st(wenig, 'höchstens 2 Fehler')}</div>
      <div class="zeile"><span>⭐ ohne Fehler</span><span>${fehlerfrei ? '✓' : `${KS.fehler} Fehler`}</span></div>
      <div class="zeile"><span>⭐ höchstens 2 Fehler</span><span>${wenig ? '✓' : '–'}</span></div>
      ${KS.fehler ? `<div class="zeile"><span>🎲 ${KS.fehler} Fehlversuch${KS.fehler > 1 ? 'e' : ''}: Lohn</span><span>${Math.round(rf * 100)} %</span></div>` : ''}` : ''}
    ${ok ? kiFragenListe().filter((f) => f.erklaerung).map((f) => `<p>💡 ${esc(f.erklaerung)}</p>`).join('') : ''}
    ${!kapVorher && kapitelFertig(H.kapitel) ? kiRueckblick(H.kapitel) : ''}
    ${!vorher && spaeherAktiv() ? `<div class="kineu">🔭 <b>Der Späher hilft ab heute Nacht!</b> Orks, Trolle, Drachen und Anführer bekommen ein 🎯. Deine Türme kennen jetzt ihre Schwachstellen und machen bei ihnen ${Math.round(SPAEHER_DMG * 100)} % mehr Schaden.</div>` : ''}
    <p class="lohn">+${gold} 🪙${!ok && gold ? ' Teillohn' : ''}${lohnHinweis()}</p>
    ${ok && warFertig ? '<p class="hinweis">Schon gelöster Auftrag: weniger Lohn, neue Sterne zählen voll.</p>' : ''}
    ${!ok ? '<p class="hinweis">Morgen kannst du es noch einmal versuchen.</p>' : ''}`,
  [...zweitKnopf(ok), { label: '🌇 Feierabend', fn: feierabend }]);
  neben([]);
  haupt('🌇 Feierabend', feierabend);
  hud();
}
