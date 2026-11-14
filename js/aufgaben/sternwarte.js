'use strict';
// --- 🔭 Sternwarte: LK Künstliche Intelligenz (Burg 22, Lehrplan LB 10, OPAL-Kurs LK_INF_LB10_11 und Abi ab 2027) ---
// Drei Lehrlinge = drei Lernarten: 🏷️ überwacht (Entscheidungsbaum, k-NN, Regression), 🧩 unüberwacht (k-Means),
// 🏆 bestärkend (Q-Lernen auf dem Acker) – dazu der 📜 Regelmeister (wissensbasiert) und am Ende Neuron, Metriken, Verantwortung.
// Läuft auf dem Kornspeicher-Ablauf (art 'sort', kornspeicher.js) mit warte: true und einer Ansicht statt Säcken:
//   ansicht 'punkte' (Punktwolke mit zwei Merkmalen), 'gitter' (Acker für Q-Lernen), 'tabelle' (Datensatz)
//   bild(lauf, k) liefert, was gezeichnet wird; daten = Python-Variablen der Aufgabe; vorspann = Hilfscode (z. B. die k-Means-Schleife).
// Python wie im Abi ohne Bibliotheken (kein sklearn): abstand, zuordnen, neue_zentren, sse, genauigkeit, konfusionsmatrix.

KAPITEL[40] = { name: 'Was ist KI? Die Lernarten', ico: '🧭' };
KAPITEL[41] = { name: 'Überwacht: Entscheidungsbaum', ico: '🌳' };
KAPITEL[42] = { name: 'Überwacht: k-NN und Regression', ico: '📍' };
KAPITEL[43] = { name: 'Unüberwacht: k-Means', ico: '🧩' };
KAPITEL[44] = { name: 'Bestärkend: der Späher lernt', ico: '🏆' };
KAPITEL[45] = { name: 'Neuronen und Verantwortung', ico: '🧠' };
BURGEN[22] = { name: 'LK KI', ico: '🔭', klasse: 'LK', region: 'sternwarte', kapitel: [40, 41, 42, 43, 44, 45],
  text: 'Leistungskurs: Lernarten (überwacht, unüberwacht, bestärkend), Entscheidungsbaum mit Gini, k-NN, Regression, k-Means, Q-Lernen, Perzeptron, Konfusionsmatrix, Bias.' };

// Aufgabe in der Sternwarte (Ablauf aus kornspeicher.js)
const STERN = (a) => KORN({ warte: true, zielArt: 'wert', funktion: null, ...a });
const FRAGEN = (a) => STERN({ sortArt: 'fragen', listen: [], ...a });
const LERNARTEN = ['überwacht', 'unüberwacht', 'bestärkend', 'wissensbasiert – feste Regeln von Fachleuten'];
const SZ = (szenario, richtig, woerter) => ({ art: 'wahl', szenario, text: 'Welche Art von KI steckt dahinter?', optionen: LERNARTEN, richtig, woerter });
const W = (text, optionen, richtig) => ({ art: 'wahl', text, optionen, richtig });

// --- Daten ---
// Monster mit zwei Merkmalen (Größe, Tempo) und einem Label – für k-NN und die Punktwolke
const MONSTER_PUNKTE = [[7, 8, 'frech'], [8, 6, 'frech'], [6, 9, 'frech'], [9, 7, 'frech'], [7, 6, 'frech'], [8, 9, 'frech'], [5, 8, 'frech'], [9, 5, 'frech'], [4, 7, 'frech'],
  [2, 3, 'friedlich'], [3, 2, 'friedlich'], [1, 4, 'friedlich'], [4, 3, 'friedlich'], [2, 5, 'friedlich'], [3, 4, 'friedlich'], [5, 2, 'friedlich'], [4, 1, 'friedlich'], [1, 2, 'friedlich'], [6, 3, 'friedlich'], [5, 4, 'friedlich']];
// Datensatz für den Entscheidungsbaum (Abi: gewichtete Gini-Unreinheit für die Wurzel)
const BAUM_DATEN = [
  { nr: 1, zaehne: true, rot: true, label: 'frech' }, { nr: 2, zaehne: true, rot: false, label: 'frech' }, { nr: 3, zaehne: true, rot: true, label: 'frech' },
  { nr: 4, zaehne: true, rot: false, label: 'friedlich' }, { nr: 5, zaehne: false, rot: true, label: 'frech' }, { nr: 6, zaehne: false, rot: false, label: 'friedlich' },
  { nr: 7, zaehne: false, rot: true, label: 'frech' }, { nr: 8, zaehne: false, rot: false, label: 'friedlich' }];
const gini = (zeilen) => { const n = zeilen.length; if (!n) return 0; const f = zeilen.filter((z) => z.label === 'frech').length / n; return 1 - f * f - (1 - f) * (1 - f); };
const giniGewichtet = (zeilen, m) => { const ja = zeilen.filter((z) => z[m]), nein = zeilen.filter((z) => !z[m]); return (ja.length * gini(ja) + nein.length * gini(nein)) / zeilen.length; };
// alle 8 Kombinationen für „Baum als Code“: rot → frech; sonst Zähne UND groß → frech; sonst friedlich
const BAUM_TESTS = [];
for (const rot of [true, false]) for (const zaehne of [true, false]) for (const gross of [true, false]) BAUM_TESTS.push({ rot, zaehne, gross });
const baumRegel = (m) => (m.rot ? 'frech' : m.zaehne && m.gross ? 'frech' : 'friedlich');
// Regression: Größe → Lebenspunkte
const LEBEN_PUNKTE = [[1, 12], [2, 19], [3, 31], [4, 38], [5, 52], [6, 57], [7, 71]];
const sseGerade = (p, m, b) => p.reduce((s, [x, y]) => s + (y - (m * x + b)) ** 2, 0);
// k-Means: drei Horden, Punkte A–O
const HORDE = [[1, 2], [2, 1], [2, 3], [3, 2], [1, 1], [8, 2], [9, 3], [7, 3], [8, 4], [9, 1], [5, 8], [4, 9], [6, 9], [5, 7], [6, 8]];
const HORDE_NAME = 'ABCDEFGHIJKLMNO';
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const jsZuordnen = (p, z) => p.map((q) => z.reduce((b, c, i) => (dist(q, c) < dist(q, z[b]) ? i : b), 0));
const jsNeueZentren = (p, zu, k) => Array.from({ length: k }, (_, i) => { const g = p.filter((_, j) => zu[j] === i); return g.length ? [g.reduce((s, q) => s + q[0], 0) / g.length, g.reduce((s, q) => s + q[1], 0) / g.length] : [0, 0]; });
const jsSse = (p, zu, z) => p.reduce((s, q, j) => s + dist(q, z[zu[j]]) ** 2, 0);
function jsKmeans(p, start) {
  let z = start.map((c) => [...c]), zu = jsZuordnen(p, z);
  for (let r = 0; r < 20; r++) { z = jsNeueZentren(p, zu, z.length); const neu = jsZuordnen(p, z); if (JSON.stringify(neu) === JSON.stringify(zu)) break; zu = neu; }
  return zu;
}
function jsKnn(daten, neu, k) {
  const n = [...daten].sort((a, b) => dist(a, neu) - dist(b, neu)).slice(0, k), frech = n.filter((d) => d[2] === 'frech').length;
  return frech * 2 > k ? 'frech' : 'friedlich';
}
// Q-Lernen: Acker 6×4 – S Start, Z Ziel (+10), M Monster (−10), # Mauer, jeder Schritt −1
const Q_GITTER = ['S..#.Z', '.#....', '...M..', '..#...'];
// Breitensuche: so viele Schritte braucht der beste Weg (sperre = Felder, die der beste Weg meidet; Start = Feld S)
const qKuerzester = (G = Q_GITTER, sperre = '#M') => {
  const w = G[0].length, h = G.length, s = G.findIndex((r) => r.includes('S')), st = [G[s].indexOf('S'), s];
  const seen = new Map([[st.join(','), 0]]), q = [st];
  while (q.length) { const [x, y] = q.shift(); if (G[y][x] === 'Z') return seen.get(`${x},${y}`);
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h || sperre.includes(G[ny][nx]) || seen.has(`${nx},${ny}`)) continue; seen.set(`${nx},${ny}`, seen.get(`${x},${y}`) + 1); q.push([nx, ny]); } }
  return -1;
};
const Q_VORSPANN = `ALPHA = 0.5
GAMMA = 0.9
GITTER = ${JSON.stringify(Q_GITTER)}
BREITE = 6
HOEHE = 4
def spaeher(lerne, episoden, eps):
    q = [[0.0, 0.0, 0.0, 0.0] for _ in range(BREITE * HOEHE)]
    zufall = 12345
    for e in range(episoden):
        x, y = 0, 0
        for schritt in range(60):
            zustand = y * BREITE + x
            zufall = (zufall * 1103515245 + 12345) % 2147483648
            if zufall / 2147483648 < eps:
                aktion = zufall % 4
            else:
                aktion = q[zustand].index(max(q[zustand]))
            dx, dy = [(1, 0), (0, 1), (-1, 0), (0, -1)][aktion]
            nx, ny = x + dx, y + dy
            if nx < 0 or ny < 0 or nx >= BREITE or ny >= HOEHE or GITTER[ny][nx] == "#":
                nx, ny = x, y
            feld = GITTER[ny][nx]
            belohnung = 10 if feld == "Z" else -10 if feld == "M" else -1
            neuer_zustand = ny * BREITE + nx
            lerne(q, zustand, aktion, belohnung, neuer_zustand)
            x, y = nx, ny
            if feld in "ZM":
                break
    pfad = [[0, 0]]
    x, y = 0, 0
    for schritt in range(30):
        zustand = y * BREITE + x
        aktion = q[zustand].index(max(q[zustand]))
        dx, dy = [(1, 0), (0, 1), (-1, 0), (0, -1)][aktion]
        nx, ny = x + dx, y + dy
        if nx < 0 or ny < 0 or nx >= BREITE or ny >= HOEHE or GITTER[ny][nx] == "#":
            nx, ny = x, y
        x, y = nx, ny
        pfad.append([x, y])
        if GITTER[y][x] in "ZM":
            break
    return {"pfad": pfad, "q": q, "ziel": GITTER[y][x] == "Z"}
`;
// 🏆 Transfer (sq4): ein neuer Acker mit Sumpf W – man kommt durch, aber es kostet mehr. Die Belohnung schreibt man selbst (belohnung(feld)).
const SW_SUMPF = ['S.WW.Z', '..WW..', '......', '.#..M.'];
const SW_SUMPF_V = `ALPHA = 0.5
GAMMA = 0.9
GITTER = ${JSON.stringify(SW_SUMPF)}
BREITE = 6
HOEHE = 4
def spaeher(lerne, belohnung, episoden, eps):
    q = [[0.0, 0.0, 0.0, 0.0] for _ in range(BREITE * HOEHE)]
    zufall = 12345
    for e in range(episoden):
        x, y = 0, 0
        for schritt in range(80):
            zustand = y * BREITE + x
            zufall = (zufall * 1103515245 + 12345) % 2147483648
            if zufall / 2147483648 < eps:
                aktion = zufall % 4
            else:
                aktion = q[zustand].index(max(q[zustand]))
            dx, dy = [(1, 0), (0, 1), (-1, 0), (0, -1)][aktion]
            nx, ny = x + dx, y + dy
            if nx < 0 or ny < 0 or nx >= BREITE or ny >= HOEHE or GITTER[ny][nx] == "#":
                nx, ny = x, y
            feld = GITTER[ny][nx]
            lerne(q, zustand, aktion, belohnung(feld), ny * BREITE + nx)
            x, y = nx, ny
            if feld in "ZM":
                break
    pfad = [[0, 0]]
    x, y = 0, 0
    for schritt in range(40):
        zustand = y * BREITE + x
        aktion = q[zustand].index(max(q[zustand]))
        dx, dy = [(1, 0), (0, 1), (-1, 0), (0, -1)][aktion]
        nx, ny = x + dx, y + dy
        if nx < 0 or ny < 0 or nx >= BREITE or ny >= HOEHE or GITTER[ny][nx] == "#":
            nx, ny = x, y
        x, y = nx, ny
        pfad.append([x, y])
        if GITTER[y][x] in "ZM":
            break
    return {"pfad": pfad, "q": q, "ziel": GITTER[y][x] == "Z", "werte": [belohnung("."), belohnung("W"), belohnung("M"), belohnung("Z")]}
`;
const SW_C_SUMPF = 'def belohnung(feld):\n    if feld == "Z":\n        return 10\n    if feld == "M":\n        return -10\n    if feld == "W":\n        return -4\n    return -1\n\ndef lerne(q, zustand, aktion, belohnung, neuer_zustand):\n    alt = q[zustand][aktion]\n    ziel = belohnung + GAMMA * max(q[neuer_zustand])\n    q[zustand][aktion] = alt + ALPHA * (ziel - alt)';
// 🧠 Perzeptron (sp1, sp2): Die Eingaben sind im Test besondere Objekte – man kann sie nur gewichten (w * x), nicht vergleichen.
// So muss UND bzw. XOR wirklich über neuron(…) laufen (Didaktik-Prüfung: vorher ging „x1 and x2“ bzw. „x1 != x2“).
// Die Meldung kommt als FileNotFoundError, weil python.js deren Text unverändert zeigt (TypeError gibt es im Spiel nicht als Namen).
const SW_NUR_NEURON = (text, mal) => `def _nur_neuron(*rest):
    raise FileNotFoundError(${JSON.stringify(text)})

class _Ein:
    def __init__(self, wert):
        self.__wert = wert
${mal ? `    def __mul__(self, zahl):
        if isinstance(zahl, _Ein) or isinstance(zahl, _Gew):
            _nur_neuron()
        return _Gew(self.__wert * zahl, [self])
    __rmul__ = __mul__
` : `    def __mul__(self, zahl):
        _nur_neuron()
    __rmul__ = __mul__
`}    def __repr__(self):
        return "x"
    __eq__ = _nur_neuron
    __ne__ = _nur_neuron
    __bool__ = _nur_neuron
    __add__ = _nur_neuron
    __radd__ = _nur_neuron
    __sub__ = _nur_neuron
    __rsub__ = _nur_neuron
    __lt__ = _nur_neuron
    __le__ = _nur_neuron
    __gt__ = _nur_neuron
    __ge__ = _nur_neuron
    __int__ = _nur_neuron
    __float__ = _nur_neuron
    __index__ = _nur_neuron
    __mod__ = _nur_neuron
    __neg__ = _nur_neuron
    def _wert(self):
        return self.__wert

# Gewichtete Eingabe (w * x): kann nur addiert und – als Summe BEIDER Eingaben – mit der Schwelle verglichen werden.
class _Gew:
    def __init__(self, wert, quellen):
        self.__wert = wert
        self.__q = quellen
    def _v(self):
        return self.__wert
    def _quellen(self):
        return self.__q
    def _dazu(self, b, vz):
        if isinstance(b, _Ein):
            _nur_neuron()
        if isinstance(b, _Gew):
            q = list(self.__q)
            for e in b._quellen():
                neu = True
                for f in q:
                    if f is e:
                        neu = False
                if neu:
                    q.append(e)
            return _Gew(self.__wert + vz * b._v(), q)
        return _Gew(self.__wert + vz * b, self.__q)
    def __add__(self, b):
        return self._dazu(b, 1)
    __radd__ = __add__
    def __sub__(self, b):
        return self._dazu(b, -1)
    def __rsub__(self, b):
        return _Gew(0, [])._dazu(b, 1)._dazu(self, -1)
    def _vgl(self, b):
        s = self._dazu(b, -1)
        if len(s._quellen()) < 2:
            _nur_neuron()
        return s._v()
    def __ge__(self, b):
        return self._vgl(b) >= 0
    def __gt__(self, b):
        return self._vgl(b) > 0
    def __le__(self, b):
        return self._vgl(b) <= 0
    def __lt__(self, b):
        return self._vgl(b) < 0
    def __repr__(self):
        return "w·x"
    __eq__ = _nur_neuron
    __ne__ = _nur_neuron
    __bool__ = _nur_neuron
    __mul__ = _nur_neuron
    __rmul__ = _nur_neuron
    __int__ = _nur_neuron
    __float__ = _nur_neuron
    __index__ = _nur_neuron
    __neg__ = _nur_neuron
    __mod__ = _nur_neuron

def _w(x):
    if isinstance(x, _Ein):
        return x._wert()
    return x
`;
const SW_SP1_V = SW_NUR_NEURON('und(x1, x2) soll ein Neuron sein: Die Eingaben werden nur gewichtet (w1 * x1 + w2 * x2) und mit der Schwelle verglichen. Vergleiche x1 und x2 nicht selbst – auch nicht gewichtet wie x1 * 1 == 1 (kein ==, and, if x1). Nur die Summe beider gewichteten Eingaben wird mit der Schwelle verglichen – ruf neuron(…) mit passenden Gewichten auf.', true)
  + '\ndef _und(a, b):\n    return _w(und(_Ein(a), _Ein(b)))\n';
const SW_SP1_T = [['neuron(1, 0, 0.3, 0.8, 0.5)', 0], ['neuron(1, 1, 0.3, 0.8, 0.5)', 1], ['neuron(0, 1, -1, 2, 2)', 1], ['neuron(1, 1, -1, 2, 2)', 0],
  ['_und(0, 0)', 0], ['_und(0, 1)', 0], ['_und(1, 0)', 0], ['_und(1, 1)', 1]];
const SW_SP2_V =SW_NUR_NEURON('Im Netz rechnen nur Neuronen: x1 und x2 darfst du nicht selbst vergleichen oder verrechnen (kein ==, !=, and, if x1). Gib sie an neuron(…) weiter – oder an und, oder, nicht.', false)
  + `
def neuron(x1, x2, w1, w2, schwelle):
    if w1 * _w(x1) + w2 * _w(x2) >= schwelle:
        return _Ein(1)
    return _Ein(0)

def _xor(a, b):
    return _w(xor(_Ein(a), _Ein(b)))

def _netz():
    t = [[0, 0], [0, 1], [1, 0], [1, 1]]
    u = []
    o = []
    for p in t:
        u.append(_w(und(_Ein(p[0]), _Ein(p[1]))))
        o.append(_w(oder(_Ein(p[0]), _Ein(p[1]))))
    return {"und": u, "oder": o, "nicht": [_w(nicht(_Ein(0))), _w(nicht(_Ein(1)))]}
`;
// 🧠 Perzeptron-Lernregel (sp1b): w ← w + η · (soll − ist) · x, Schwelle ← Schwelle − η · (soll − ist)
const SW_UND = [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]], SW_ODER = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]], SW_XOR = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
function SW_trainiere(daten, eta, runden) {
  let w1 = 0, w2 = 0, s = 0;
  for (let r = 0; r < runden; r++) for (const [x1, x2, soll] of daten) {
    const ist = w1 * x1 + w2 * x2 >= s ? 1 : 0;
    w1 = w1 + eta * (soll - ist) * x1; w2 = w2 + eta * (soll - ist) * x2; s = s - eta * (soll - ist);
  }
  return [w1, w2, s];
}
const SW_LERN_TESTS = [[SW_UND, 0.5, 10, 'UND, η = 0,5'], [SW_ODER, 0.5, 10, 'ODER, η = 0,5'], [SW_UND, 0.25, 12, 'UND, η = 0,25']];
const SW_C_TRAINIERE = 'def trainiere(daten, eta, runden):\n    w1 = 0\n    w2 = 0\n    schwelle = 0\n    for r in range(runden):\n        for d in daten:\n            ist = neuron(d[0], d[1], w1, w2, schwelle)\n            fehler = d[2] - ist\n            w1 = w1 + eta * fehler * d[0]\n            w2 = w2 + eta * fehler * d[1]\n            schwelle = schwelle - eta * fehler\n    return [w1, w2, schwelle]';
const SW_NEURON_PY = 'def neuron(x1, x2, w1, w2, schwelle):\n    if w1 * x1 + w2 * x2 >= schwelle:\n        return 1\n    return 0\n';
// 🌳 Gini im Code (sb6): allgemein für beliebig viele Labels; Transfer auf einen neuen Datensatz (Himmelsobjekte)
const SW_HIMMEL = [
  { nr: 1, hell: true, schweif: true, bewegt: true, label: 'Komet' }, { nr: 2, hell: false, schweif: true, bewegt: true, label: 'Komet' },
  { nr: 3, hell: true, schweif: true, bewegt: false, label: 'Komet' }, { nr: 4, hell: true, schweif: false, bewegt: true, label: 'Planet' },
  { nr: 5, hell: true, schweif: false, bewegt: true, label: 'Planet' }, { nr: 6, hell: false, schweif: false, bewegt: true, label: 'Planet' },
  { nr: 7, hell: true, schweif: false, bewegt: false, label: 'Stern' }, { nr: 8, hell: false, schweif: false, bewegt: false, label: 'Stern' },
  { nr: 9, hell: false, schweif: false, bewegt: false, label: 'Stern' }];
function SW_gini(zeilen) {
  const n = zeilen.length; if (!n) return 0;
  const anz = {}; for (const z of zeilen) anz[z.label] = (anz[z.label] || 0) + 1;
  let g = 1; for (const l in anz) g = g - (anz[l] / n) ** 2;
  return g;
}
function SW_besteFrage(daten, merkmale) {
  let beste = null, wert = 2;
  for (const m of merkmale) { const ja = daten.filter((z) => z[m]), nein = daten.filter((z) => !z[m]); const w = ja.length / daten.length * SW_gini(ja) + nein.length / daten.length * SW_gini(nein); if (w < wert) { beste = m; wert = w; } }
  return beste;
}
const SW_GINI_A = ['gini(monster)', 'gini([])', 'gini(himmel)', 'beste_frage(monster, ["zaehne", "rot"])', 'beste_frage(himmel, ["hell", "bewegt", "schweif"])'];
const SW_GINI_S = [SW_gini(BAUM_DATEN), 0, SW_gini(SW_HIMMEL), SW_besteFrage(BAUM_DATEN, ['zaehne', 'rot']), SW_besteFrage(SW_HIMMEL, ['hell', 'bewegt', 'schweif'])];
const SW_C_GINI = 'def gini(zeilen):\n    n = len(zeilen)\n    if n == 0:\n        return 0\n    anzahl = {}\n    for z in zeilen:\n        l = z["label"]\n        if l in anzahl:\n            anzahl[l] = anzahl[l] + 1\n        else:\n            anzahl[l] = 1\n    g = 1\n    for l in anzahl:\n        g = g - (anzahl[l] / n) ** 2\n    return g\n\ndef beste_frage(daten, merkmale):\n    beste = None\n    bester_wert = 2\n    for m in merkmale:\n        ja = []\n        nein = []\n        for z in daten:\n            if z[m]:\n                ja.append(z)\n            else:\n                nein.append(z)\n        wert = len(ja) / len(daten) * gini(ja) + len(nein) / len(daten) * gini(nein)\n        if wert < bester_wert:\n            beste = m\n            bester_wert = wert\n    return beste';
const KMEANS_VORSPANN = `def abstand(p, q):
    return ((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2) ** 0.5
def kmeans(punkte, start):
    zentren = [list(z) for z in start]
    verlauf = []
    zuordnung = zuordnen(punkte, zentren)
    verlauf.append({"zentren": [list(z) for z in zentren], "zuordnung": list(zuordnung)})
    for runde in range(20):
        zentren = neue_zentren(punkte, zuordnung, len(zentren))
        neu = zuordnen(punkte, zentren)
        verlauf.append({"zentren": [list(z) for z in zentren], "zuordnung": list(neu)})
        if neu == zuordnung:
            break
        zuordnung = neu
    return verlauf
`;
const C_ZUORDNEN = 'def zuordnen(punkte, zentren):\n    zuordnung = []\n    for p in punkte:\n        beste = 0\n        for i in range(len(zentren)):\n            if abstand(p, zentren[i]) < abstand(p, zentren[beste]):\n                beste = i\n        zuordnung.append(beste)\n    return zuordnung';
const C_NEUE_ZENTREN = 'def neue_zentren(punkte, zuordnung, k):\n    zentren = []\n    for i in range(k):\n        sx = 0\n        sy = 0\n        anzahl = 0\n        for j in range(len(punkte)):\n            if zuordnung[j] == i:\n                sx = sx + punkte[j][0]\n                sy = sy + punkte[j][1]\n                anzahl = anzahl + 1\n        zentren.append([sx / anzahl, sy / anzahl])\n    return zentren';
// k-NN ohne sorted (Nutzerwunsch 2026-11-13: Grundlagen selbst schreiben): k-mal den nächsten Nachbarn suchen und aus der Liste nehmen
const C_KNN = 'def abstand(p, q):\n    return ((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2) ** 0.5\n\ndef knn(daten, neu, k):\n    rest = list(daten)\n    frech = 0\n    for runde in range(k):\n        beste = 0\n        for i in range(len(rest)):\n            if abstand(rest[i], neu) < abstand(rest[beste], neu):\n                beste = i\n        if rest[beste][2] == "frech":\n            frech = frech + 1\n        rest.pop(beste)\n    if frech * 2 > k:\n        return "frech"\n    return "friedlich"';
const C_KMEANS = 'def kmeans(punkte, start):\n    zentren = start\n    zuordnung = zuordnen(punkte, zentren)\n    verlauf = [{"zentren": zentren, "zuordnung": zuordnung}]\n    fertig = False\n    while not fertig:\n        zentren = neue_zentren(punkte, zuordnung, len(zentren))\n        neu = zuordnen(punkte, zentren)\n        verlauf.append({"zentren": zentren, "zuordnung": neu})\n        fertig = neu == zuordnung\n        zuordnung = neu\n    return verlauf';
const C_WAEHLE = 'def waehle_aktion(werte, eps, wuerfel, zufallsaktion):\n    if wuerfel < eps:\n        return zufallsaktion\n    beste = 0\n    for i in range(len(werte)):\n        if werte[i] > werte[beste]:\n            beste = i\n    return beste';
const WAEHLE_TESTS = [[[0, 5, 2, 1], 0.2, 0.9, 3], [[0, 5, 2, 1], 0.2, 0.1, 3], [[-1, -3, -0.5, -2], 0, 0.5, 0], [[4, 4, 1, 0], 0.1, 0.5, 2]];
const jsWaehle = ([w, eps, wuerfel, zufall]) => (wuerfel < eps ? zufall : w.reduce((b, x, i) => (x > w[b] ? i : b), 0));
// [1] ist ein schlechter Start: zwei Zentren in der linken Horde – k-Means teilt sie und legt die beiden anderen zusammen
const KMEANS_STARTS = [[[1, 1], [9, 1], [5, 9]], [[1, 1], [2, 1], [8, 2]]];
const KNN_TESTS = [[[8, 8], 3], [[2, 2], 3], [[5, 5], 1], [[4, 5], 5]];
const REG_TESTS = [[10, 0], [9, 3], [10, 2]];
const GERADEN = [[8, 8], [10, 1], [12, -6]];
const tabHtml = (spalten, zeilen) => `<table class="messtab kitab"><tr>${spalten.map((s) => `<th>${s}</th>`).join('')}</tr>${zeilen.map((z) => `<tr>${z.map((v) => `<td>${v === true ? 'ja' : v === false ? 'nein' : v}</td>`).join('')}</tr>`).join('')}</table>`;
const BAUM_TAB = tabHtml(['Nr.', 'Zähne', 'rot', 'Label'], BAUM_DATEN.map((z) => [z.nr, z.zaehne, z.rot, z.label]));

HOEFE.push(
  // --- Kapitel 40: 🧭 Was ist KI? Die Lernarten (Kurs 11.1/11.2, Abi Teil A) ---
  FRAGEN({ id: 'sa1', kapitel: 40, ico: '🧭', titel: 'Die drei Lehrlinge', lohn: 60,
    ziel: 'Ordne jedes System einer Lernart zu – und tippe das Wort an, das es verrät.',
    story: 'Willkommen in der Sternwarte! Hier lernen drei Lehrlinge, Monster zu erkennen – jeder auf seine Art: Lina bekommt beschriftete Karten, Uno nur Karten ohne Beschriftung, Ben bekommt Punkte für gute und Abzug für schlechte Entscheidungen. Und der alte Regelmeister lernt gar nicht – er folgt Regeln, die ihm jemand aufgeschrieben hat.',
    merke: { titel: '🧭 Arten der KI', text: 'Wissensbasierte KI folgt Regeln, die Menschen festlegen. Beim maschinellen Lernen lernt das System aus Daten: überwacht aus Beispielen mit Label (richtiger Antwort), unüberwacht aus Daten ohne Label (es findet selbst Gruppen), bestärkend durch Belohnung und Bestrafung für seine Aktionen.' },
    fragen: [
      SZ('Ein Spamfilter lernt aus 10 000 E-Mails, die Menschen vorher als „Spam“ oder „kein Spam“ markiert haben.', 0, ['markiert']),
      SZ('Ein Onlineshop teilt seine Kunden in Gruppen ein, ohne vorher zu wissen, welche Gruppen es überhaupt gibt.', 1, ['ohne']),
      SZ('Ein Laufroboter bekommt für jeden Schritt nach vorn Punkte. Fällt er hin, gibt es Abzug. Nach vielen Versuchen läuft er sicher.', 2, ['punkte', 'abzug']),
      SZ('Die Lüftungsampel im Klassenzimmer schaltet auf Rot, wenn der CO₂-Wert über 1000 liegt – so hat es ein Techniker festgelegt.', 3, ['festgelegt']),
      SZ('Der Batteriespeicher der Stadtwerke probiert Lade-Strategien aus und erhält eine Belohnung, wenn Stromkosten gespart werden.', 2, ['belohnung']),
      SZ('Aus Fotos mit der Beschriftung „Hund“ oder „Katze“ lernt eine App, neue Fotos einzuordnen.', 0, ['beschriftung'])],
    tipps: ['Gibt es zu jedem Beispiel die richtige Antwort (Label)? Dann überwacht.', 'Gibt es Punkte, Belohnung, Abzug? Dann bestärkend. Hat ein Mensch die Regel festgelegt? Dann wissensbasiert.'] }),
  FRAGEN({ id: 'sa2', kapitel: 40, ico: '🎯', titel: 'Was kommt heraus?', lohn: 60,
    ziel: 'Klassifikation, Regression oder Clustering? Entscheide nach der Art der Ausgabe.',
    merke: { titel: '🎯 Klassifikation, Regression, Clustering', text: 'Klassifikation sagt eine Klasse (Kategorie) voraus, z. B. frech oder friedlich. Regression sagt eine Zahl voraus, z. B. die Lebenspunkte. Clustering findet Gruppen in Daten ohne Label.' },
    fragen: [
      W('Eine KI soll vorhersagen, wie viele Lebenspunkte ein Monster hat.', ['Klassifikation', 'Regression', 'Clustering'], 1),
      W('Eine KI soll sagen, ob ein Monster frech oder friedlich ist.', ['Klassifikation', 'Regression', 'Clustering'], 0),
      W('Eine KI soll Monsterhorden in Gruppen einteilen, die sich ähnlich bewegen. Welche Gruppen es gibt, weiß niemand.', ['Klassifikation', 'Regression', 'Clustering'], 2),
      W('Eine KI schätzt, wie viel Gold ein Hof morgen einbringt.', ['Klassifikation', 'Regression', 'Clustering'], 1),
      W('Eine Bank-KI entscheidet: Kredit ja oder nein.', ['Klassifikation', 'Regression', 'Clustering'], 0)],
    tipps: ['Ist die Ausgabe eine Zahl auf einer Skala? Regression.', 'Gibt es vorher keine Labels? Clustering.'] }),
  FRAGEN({ id: 'sa3', kapitel: 40, ico: '📚', titel: 'Merkmal, Label, Parameter', lohn: 65,
    ziel: 'Die wichtigsten Begriffe des maschinellen Lernens.',
    merke: { titel: '📚 Begriffe', text: 'Merkmale (Features) beschreiben ein Beispiel, das Label ist die gesuchte Antwort. Parameter lernt das Modell selbst (z. B. Gewichte), Hyperparameter legt man vorher fest (z. B. k bei k-NN, die Baumtiefe). Mit Trainingsdaten lernt das Modell, mit Testdaten, die es nie gesehen hat, prüft man es.' },
    fragen: [
      W('Bei den Monsterkarten: „Größe“ und „Tempo“ sind …', ['Merkmale', 'Labels', 'Hyperparameter', 'Testdaten'], 0),
      W('„frech“ oder „friedlich“ auf der Karte ist …', ['ein Merkmal', 'das Label', 'ein Parameter', 'eine Belohnung'], 1),
      W('Die Zahl k bei k-NN (wie viele Nachbarn gefragt werden) ist …', ['ein Parameter, den das Modell lernt', 'ein Hyperparameter, den man festlegt', 'ein Label', 'ein Merkmal'], 1),
      W('Warum prüft man ein Modell mit Testdaten statt mit den Trainingsdaten?', ['Testdaten sind kleiner und schneller', 'Weil es die Testdaten nicht gesehen hat – nur so sieht man, ob es verallgemeinert', 'Trainingsdaten haben keine Labels', 'Das ist egal'], 1),
      W('Was ist kein Teilbereich der KI?', ['maschinelles Lernen', 'wissensbasierte Systeme', 'Sprachverarbeitung', 'Tabellenkalkulation'], 3)],
    tipps: ['Parameter lernt das Modell, Hyperparameter stellst du ein.'] }),

  // --- Kapitel 41: 🌳 Überwacht: Entscheidungsbaum (Kurs 11.5, Abi Teil A/C) ---
  FRAGEN({ id: 'sb1', kapitel: 41, ico: '🧮', titel: 'Gini von Hand', lohn: 70, ansicht: 'tabelle', titelAnsicht: '8 Monsterkarten',
    tabelle: () => ({ html: BAUM_TAB }),
    ziel: 'Welches Merkmal gehört an die Wurzel? Rechne die Gini-Unreinheit aus.',
    story: 'Lina baut einen Entscheidungsbaum. Die erste Frage soll die Monster möglichst „rein“ trennen – also in Gruppen, in denen fast alle das gleiche Label haben. Das misst die Gini-Unreinheit: 0 = ganz rein.',
    merke: { titel: '🌳 Gini-Unreinheit', text: 'Gini = 1 − p(frech)² − p(friedlich)². Für eine Frage rechnet man Gini in beiden Gruppen und gewichtet mit ihrer Größe. An die Wurzel kommt das Merkmal mit der kleinsten gewichteten Gini-Unreinheit.', code: 'Gini_gewichtet = 4/8 · Gini(ja) + 4/8 · Gini(nein)' },
    fragen: [
      { art: 'zahl', text: 'Gini-Unreinheit aller 8 Monster (vor der ersten Frage)?', soll: () => gini(BAUM_DATEN), tol: 0.02 },
      { art: 'zahl', text: 'Gewichtete Gini-Unreinheit, wenn man nach „Zähne“ fragt?', soll: () => giniGewichtet(BAUM_DATEN, 'zaehne'), tol: 0.02 },
      { art: 'zahl', text: 'Gewichtete Gini-Unreinheit, wenn man nach „rot“ fragt?', soll: () => giniGewichtet(BAUM_DATEN, 'rot'), tol: 0.02 },
      W('Welches Merkmal kommt an die Wurzel?', ['Zähne', 'rot', 'egal, beide gleich gut'], giniGewichtet(BAUM_DATEN, 'rot') < giniGewichtet(BAUM_DATEN, 'zaehne') ? 1 : 0)],
    tipps: ['5 frech, 3 friedlich: 1 − (5/8)² − (3/8)².', 'Rot: alle 4 roten sind frech (Gini 0), von den nicht roten ist 1 frech: 1 − (1/4)² − (3/4)².'] }),
  STERN({ id: 'sb6', kapitel: 41, sortArt: 'funktion', ico: '🧮', titel: 'Gini im Code', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Zwei Datensätze',
    tabelle: (lauf, k) => ({ html: `<p class="hinweis">monster (Labels frech/friedlich):</p>${BAUM_TAB}<p class="hinweis">himmel (drei Labels):</p>${tabHtml(['Nr.', 'hell', 'Schweif', 'bewegt', 'Label'], SW_HIMMEL.map((z) => [z.nr, z.hell, z.schweif, z.bewegt, z.label]))}${lauf ? `<p>${esc(SW_GINI_A[k])} → <b>${ergebnisText(lauf.wert)}</b></p>` : ''}` }),
    ziel: 'Schreib gini(zeilen): 1 minus die Summe der quadrierten Anteile jedes Labels (z["label"]), für eine leere Liste 0. Dann beste_frage(daten, merkmale): das Merkmal mit der kleinsten gewichteten Gini-Unreinheit (bei Gleichstand das erste). Es muss auch für den neuen Datensatz himmel mit drei Labels klappen.',
    story: 'Lina hat genug vom Rechnen auf Papier. Sie will, dass der Rechner die beste Frage für die Wurzel selbst findet – nicht nur für Monster, sondern auch für die Himmelsobjekte, die Vega jede Nacht beobachtet.',
    daten: { monster: BAUM_DATEN, himmel: SW_HIMMEL }, listen: SW_GINI_A.map(() => []), aufrufFn: (l, k) => SW_GINI_A[k], soll: (l, k) => SW_GINI_S[k], tol: 1e-6,
    testName: (k) => ['Gini aller Monster', 'leere Liste', 'Gini mit drei Labels', 'Wurzel für die Monster', 'Wurzel für den Himmel'][k],
    befehle: [K_B('def gini(zeilen):'), K_B('def beste_frage(daten, merkmale):'), K_B('anzahl = {}')],
    merke: { titel: '🌳 Einen Baum lernen', text: 'Ein Entscheidungsbaum wird von oben nach unten gelernt: Für jedes Merkmal teilt man die Daten in „ja“ und „nein“ und berechnet die gewichtete Gini-Unreinheit. Das Merkmal mit dem kleinsten Wert wird die Frage im Knoten. Dasselbe wiederholt man in jedem Ast, bis die Gruppen rein sind oder die maximale Tiefe erreicht ist.' },
    tipps: ['gini: Zähle in einem Dictionary, wie oft jedes Label vorkommt. Dann g = 1 und für jedes Label g = g − (anzahl / n) ** 2.', 'beste_frage: Für jedes Merkmal m die Zeilen in zwei Listen ja/nein aufteilen (z[m] ist True oder False).', 'gewichtet = len(ja) / len(daten) · gini(ja) + len(nein) / len(daten) · gini(nein) – das kleinste merken (nur bei echtem <).'],
    loesung: SW_C_GINI }),
  STERN({ id: 'sb2', kapitel: 41, sortArt: 'funktion', ico: '🌳', titel: 'Der Baum als Code', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Der Baum',
    tabelle: (lauf, k) => ({ html: `<pre class="kibaum">rot?
├─ ja  → frech
└─ nein → Zähne?
          ├─ nein → friedlich
          └─ ja  → groß?
                   ├─ ja  → frech
                   └─ nein → friedlich</pre>${tabHtml(['Test', 'rot', 'Zähne', 'groß', 'soll'], BAUM_TESTS.map((m, i) => [i + 1, m.rot, m.zaehne, m.gross, baumRegel(m)]))}` }),
    ziel: 'Schreib den Baum als if-Struktur: baum(m) gibt "frech" oder "friedlich" zurück. Die Merkmale stehen in m["rot"], m["zaehne"], m["gross"].',
    daten: { monster: BAUM_TESTS }, listen: BAUM_TESTS.map(() => []), aufrufFn: (l, k) => `baum(monster[${k}])`, soll: (l, k) => baumRegel(BAUM_TESTS[k]),
    befehle: [K_B('def baum(m):'), K_B('if m["rot"]:'), K_B('else:')],
    tipps: ['Jede Frage im Baum ist ein if, jedes Blatt ein return.', 'Unter „nein“ kommt die nächste Frage – eingerückt im else.', 'if m["rot"]: return "frech" · if m["zaehne"] and m["gross"]: return "frech" · return "friedlich"'],
    loesung: 'def baum(m):\n    if m["rot"]:\n        return "frech"\n    else:\n        if m["zaehne"]:\n            if m["gross"]:\n                return "frech"\n        return "friedlich"' }),
  STERN({ id: 'sb3', kapitel: 41, sortArt: 'funktion', ico: '✅', titel: 'Wie gut ist der Baum?', lohn: 70,
    ziel: 'Schreib genauigkeit(echt, vorhergesagt): der Anteil der richtig vorhergesagten Labels (eine Zahl zwischen 0 und 1).',
    listen: [[], [], []], soll: (l, k) => [0.75, 1, 0][k],
    aufrufFn: (l, k) => ['genauigkeit(["frech", "frech", "friedlich", "friedlich"], ["frech", "friedlich", "friedlich", "friedlich"])', 'genauigkeit(["frech"], ["frech"])', 'genauigkeit(["frech", "friedlich"], ["friedlich", "frech"])'][k],
    befehle: [K_B('def genauigkeit(echt, vorhergesagt):'), K_B('for i in range(len(echt)):')],
    merke: { titel: '✅ Genauigkeit (Accuracy)', text: 'Die Genauigkeit ist der Anteil der richtigen Vorhersagen: richtig / alle. Man misst sie auf Testdaten. Vorsicht bei unausgewogenen Klassen: Wer bei 98 % Gesunden immer „gesund“ sagt, hat 98 % Genauigkeit – und findet keinen einzigen Kranken.' },
    tipps: ['Zähle, an wie vielen Stellen echt[i] == vorhergesagt[i] ist.', 'Teile durch die Anzahl aller.'],
    loesung: 'def genauigkeit(echt, vorhergesagt):\n    richtig = 0\n    for i in range(len(echt)):\n        if echt[i] == vorhergesagt[i]:\n            richtig = richtig + 1\n    return richtig / len(echt)' }),
  STERN({ id: 'sb4', kapitel: 41, sortArt: 'funktion', ico: '🔲', titel: 'Die Konfusionsmatrix', lohn: 75,
    ziel: 'Schreib konfusionsmatrix(echt, vorhergesagt, positiv): gib [TP, FP, FN, TN] zurück. positiv ist das Label, das als „Treffer“ zählt (z. B. "frech").',
    listen: [[], []], soll: (l, k) => [[2, 1, 1, 2], [0, 2, 1, 0]][k],
    aufrufFn: (l, k) => ['konfusionsmatrix(["frech", "frech", "frech", "friedlich", "friedlich", "friedlich"], ["frech", "frech", "friedlich", "frech", "friedlich", "friedlich"], "frech")', 'konfusionsmatrix(["krank", "gesund", "gesund"], ["gesund", "krank", "krank"], "krank")'][k],
    befehle: [K_B('def konfusionsmatrix(echt, vorhergesagt, positiv):'), K_B('for i in range(len(echt)):'), K_B('return [¦]')],
    merke: { titel: '🔲 Konfusionsmatrix', text: 'TP: positiv vorhergesagt und richtig, FP: positiv vorhergesagt, aber falsch (Fehlalarm), FN: negativ vorhergesagt, aber eigentlich positiv (übersehen), TN: richtig negativ. Precision = TP/(TP+FP), Recall = TP/(TP+FN).' },
    tipps: ['Vier Zähler, eine Schleife über alle Beispiele.', 'Vorhersage positiv? Dann TP (wenn echt auch positiv) oder FP. Sonst FN oder TN.'],
    loesung: 'def konfusionsmatrix(echt, vorhergesagt, positiv):\n    tp = 0\n    fp = 0\n    fn = 0\n    tn = 0\n    for i in range(len(echt)):\n        if vorhergesagt[i] == positiv:\n            if echt[i] == positiv:\n                tp = tp + 1\n            else:\n                fp = fp + 1\n        else:\n            if echt[i] == positiv:\n                fn = fn + 1\n            else:\n                tn = tn + 1\n    return [tp, fp, fn, tn]' }),
  FRAGEN({ id: 'sb5', kapitel: 41, ico: '📈', titel: 'Zu gut gelernt?', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Genauigkeit je Baumtiefe',
    tabelle: () => ({ html: tabHtml(['Baumtiefe', 'Training', 'Validierung', 'Test'], [[1, '68 %', '66 %', '65 %'], [3, '89 %', '86 %', '85 %'], [8, '100 %', '71 %', '69 %']]) }),
    ziel: 'Lina hat drei Bäume verschieden tief wachsen lassen. Welcher ist der beste?',
    merke: { titel: '📈 Overfitting', text: 'Overfitting (Überanpassung): Das Modell lernt die Trainingsdaten auswendig – Trainingsgenauigkeit hoch, Validierung und Test deutlich schlechter. Underfitting: Das Modell ist zu einfach, alle Werte sind niedrig. Mit Validierungsdaten wählt man Hyperparameter wie die Baumtiefe, mit Testdaten prüft man am Ende.' },
    fragen: [W('Welcher Baum ist überangepasst (Overfitting)?', ['Tiefe 1', 'Tiefe 3', 'Tiefe 8'], 2),
      W('Welcher ist unterangepasst (Underfitting)?', ['Tiefe 1', 'Tiefe 3', 'Tiefe 8'], 0),
      W('Welche Tiefe wählst du – und anhand welcher Spalte?', ['Tiefe 8 – Training ist am höchsten', 'Tiefe 3 – Validierung ist am höchsten', 'Tiefe 1 – am einfachsten', 'Tiefe 8 – Test ist egal'], 1),
      W('Wozu dient die Spalte „Test“?', ['zum Auswählen der Tiefe', 'zur ehrlichen Schlussprüfung – mit Daten, die beim Auswählen nicht benutzt wurden', 'zum Training', 'gar nicht'], 1)],
    tipps: ['Großer Abstand zwischen Training und Validierung heißt: auswendig gelernt.'] }),

  // --- Kapitel 42: 📍 Überwacht: k-NN und Regression (Kurs 11.4, 11.6) ---
  STERN({ id: 'sn1', kapitel: 42, sortArt: 'funktion', ico: '📏', titel: 'Der Abstand', lohn: 65, ansicht: 'punkte', titelAnsicht: 'Monsterkarte',
    ziel: 'Schreib abstand(p, q): der euklidische Abstand zwischen zwei Punkten p = (x, y) und q.',
    listen: [[], [], [], []], soll: (l, k) => [5, 5, 0, Math.sqrt(5)][k], tol: 1e-6,
    aufrufFn: (l, k) => ['abstand((0, 0), (3, 4))', 'abstand((1, 2), (4, 6))', 'abstand((2, 2), (2, 2))', 'abstand((1, 1), (2, 3))'][k],
    bild: (lauf, k) => { const pq = [[[0, 0], [3, 4]], [[1, 2], [4, 6]], [[2, 2], [2, 2]], [[1, 1], [2, 3]]][k]; return { punkte: pq.map(([x, y], i) => ({ x, y, farbe: i ? '#ff8fd8' : '#ffd84a', name: i ? 'q' : 'p' })), strecke: pq, max: 7 }; },
    befehle: [K_B('def abstand(p, q):'), K_B('return ¦'), K_B('** 0.5')],
    merke: { titel: '📏 Euklidischer Abstand', text: 'Der Abstand zweier Punkte ist die Länge der Strecke dazwischen (Satz des Pythagoras): √((x₁−x₂)² + (y₁−y₂)²). Die Wurzel zieht man in Python mit ** 0.5.', code: 'P = (1, 2), Q = (4, 6):\n  √((4 − 1)² + (6 − 2)²) = √(9 + 16) = √25 = 5\n  in Python: 25 ** 0.5 → 5.0' },
    tipps: ['p[0] ist x, p[1] ist y.', 'Quadrieren mit ** 2, Wurzel mit ** 0.5.'],
    loesung: 'def abstand(p, q):\n    return ((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2) ** 0.5' }),
  STERN({ id: 'sn2', kapitel: 42, sortArt: 'funktion', ico: '📍', titel: 'Frag die Nachbarn (k-NN)', lohn: 75, ansicht: 'punkte', titelAnsicht: 'Monsterkarte',
    ziel: 'Schreib knn(daten, neu, k): such die k Monster mit dem kleinsten Abstand zu neu und gib das Label zurück, das bei ihnen öfter vorkommt.',
    story: 'Ein neues Monster taucht am Waldrand auf. Frech oder friedlich? Lina schaut, wie sich die ähnlichsten bekannten Monster verhalten – ihre nächsten Nachbarn.',
    daten: { monster: MONSTER_PUNKTE }, listen: [[], [], [], []],
    aufrufFn: (l, k) => `knn(monster, ${JSON.stringify(KNN_TESTS[k][0])}, ${KNN_TESTS[k][1]})`, soll: (l, k) => jsKnn(MONSTER_PUNKTE, KNN_TESTS[k][0], KNN_TESTS[k][1]),
    testName: (k) => `Monster bei (${KNN_TESTS[k][0].join(', ')}), k = ${KNN_TESTS[k][1]}`,
    bild: (lauf, k) => monsterBild(KNN_TESTS[k][0], lauf?.wert, KNN_TESTS[k][1]),
    befehle: [K_B('def knn(daten, neu, k):'), K_B('list(¦)'), K_B('for runde in range(k):')],
    merke: { titel: '📍 k-nächste Nachbarn (k-NN)', text: 'k-NN merkt sich alle Trainingsdaten. Für ein neues Beispiel sucht es die k nächsten (kleinster Abstand) und nimmt das Label, das dort am häufigsten ist (Mehrheit). k ist ein Hyperparameter: Kleines k reagiert auf Ausreißer, großes k wird ungenau. Merkmale sollten ähnlich skaliert sein.', code: 'for runde in range(k):\n    beste = …   # nächster Nachbar in rest\n    …\n    rest.pop(beste)' },
    tipps: ['Schreib zuerst abstand (wie im letzten Auftrag) über knn.', 'k-mal: In einer Kopie rest den Punkt mit dem kleinsten Abstand suchen (wie die Minimumsuche bei Selectionsort), sein Label zählen, ihn mit rest.pop(beste) herausnehmen.', 'Zähle, wie viele der k Nachbarn "frech" sind; mehr als die Hälfte → "frech".'],
    loesung: C_KNN }),
  STERN({ id: 'sn2v', kapitel: 42, sortArt: 'vorher', funktion: 'knn', ico: '🔮', titel: 'Ein Nachbar oder fünf?', lohn: 70, ansicht: 'punkte', titelAnsicht: 'Monsterkarte',
    ziel: 'Das neue Monster steht bei (4, 6). Sag voraus, was k-NN mit k = 1 und mit k = 5 sagt.',
    daten: { monster: MONSTER_PUNKTE }, listen: [[]], code: C_KNN, aufruf: '[knn(monster, (4, 6), 1), knn(monster, (4, 6), 5)]',
    bild: (lauf) => monsterBild([4, 6], lauf?.wert?.[1] || null, 5),
    fragen: [W('Was sagt k-NN mit k = 1?', ['frech', 'friedlich'], jsKnn(MONSTER_PUNKTE, [4, 6], 1) === 'frech' ? 0 : 1),
      W('Und mit k = 5?', ['frech', 'friedlich'], jsKnn(MONSTER_PUNKTE, [4, 6], 5) === 'frech' ? 0 : 1),
      W('Warum nimmt man für k meist eine ungerade Zahl?', ['weil es schneller rechnet', 'damit es bei zwei Klassen kein Unentschieden gibt', 'weil gerade Zahlen bei k-NN nicht erlaubt sind', 'damit Ausreißer bei der Abstimmung mehr zählen'], 1)],
    tipps: ['Der nächste Nachbar von (4, 6) ist (4, 7) – Abstand 1.', 'Bei k = 5: zähle die Farben der 5 nächsten Punkte (die weißen Ringe).'] }),
  FRAGEN({ id: 'sn5', kapitel: 42, ico: '📐', titel: 'Zentimeter gegen Tempo', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Monster in echten Einheiten',
    tabelle: () => ({ html: `${tabHtml(['Monster', 'Größe (cm)', 'Tempo (1–5)', 'Label'], [['A', 190, 1, 'friedlich'], ['B', 160, 5, 'frech'], ['N (neu)', 185, 5, '?']])}<p class="hinweis">Alle Monster der Sternwarte sind 100 bis 250 cm groß und haben Tempo 1 bis 5.</p>` }),
    ziel: 'k-NN mit k = 1 – aber diesmal in echten Einheiten. Rechne die Abstände aus, einmal ohne und einmal mit Skalierung.',
    merke: { titel: '📐 Merkmale skalieren', text: 'Der euklidische Abstand addiert die quadrierten Unterschiede aller Merkmale. Hat ein Merkmal große Zahlen (Zentimeter), bestimmt es den Abstand fast allein. Darum skaliert man vorher, z. B. mit der Min-Max-Skalierung x′ = (x − min) / (max − min): Danach liegt jedes Merkmal zwischen 0 und 1.' },
    fragen: [
      { art: 'zahl', text: 'Abstand von N zu B in den echten Einheiten?', soll: () => 25, tol: 0.01 },
      { art: 'zahl', text: 'Abstand von N zu A in den echten Einheiten? (zwei Nachkommastellen)', soll: () => Math.hypot(5, 4), tol: 0.01 },
      W('Was sagt k-NN mit k = 1 ohne Skalierung?', ['friedlich – A ist näher', 'frech – B ist näher', 'unentschieden', 'das lässt sich nicht sagen'], 0),
      { art: 'zahl', text: 'Skaliere die Größe von N mit Min-Max (min 100, max 250). Welcher Wert kommt heraus? (zwei Nachkommastellen)', soll: () => 85 / 150, tol: 0.01 },
      { art: 'zahl', text: 'Skaliere beide Merkmale (Tempo: min 1, max 5). Wie groß ist jetzt der Abstand von N zu B? (zwei Nachkommastellen)', soll: () => 25 / 150, tol: 0.05 },
      W('Was sagt k-NN mit k = 1 nach der Skalierung – und warum?', ['frech – Tempo zählt jetzt genauso viel wie die Größe', 'friedlich – die Größe entscheidet weiter', 'frech – Skalierung bevorzugt kleine Monster', 'friedlich – Skalierung ändert keine Nachbarn'], 0)],
    tipps: ['Ohne Skalierung: √((185 − 160)² + (5 − 5)²) und √((185 − 190)² + (5 − 1)²).', 'Größe: (185 − 100) / 150. Tempo von N und B: (5 − 1) / 4 = 1 – sie unterscheiden sich im Tempo also gar nicht.', 'Skaliert liegen N und B nur (185 − 160) / 150 auseinander, N und A aber eine ganze Tempo-Einheit (1).'] }),
  STERN({ id: 'sn3', kapitel: 42, sortArt: 'funktion', ico: '📉', titel: 'Wie gut passt die Gerade?', lohn: 70, ansicht: 'punkte', titelAnsicht: 'Größe → Lebenspunkte',
    ziel: 'Schreib sse(punkte, m, b): die Summe der quadrierten Fehler der Geraden y = m·x + b (Regression).',
    daten: { punkte: LEBEN_PUNKTE }, listen: [[], [], []],
    aufrufFn: (l, k) => `sse(punkte, ${REG_TESTS[k][0]}, ${REG_TESTS[k][1]})`, soll: (l, k) => sseGerade(LEBEN_PUNKTE, ...REG_TESTS[k]), tol: 1e-6,
    bild: (lauf, k) => ({ punkte: LEBEN_PUNKTE.map(([x, y]) => ({ x, y, farbe: '#7cc4ff' })), linien: [{ m: REG_TESTS[k][0], b: REG_TESTS[k][1], farbe: '#ffd84a' }], fehler: REG_TESTS[k], max: 8, ymax: 80, achsen: ['Größe', 'Leben'] }),
    befehle: [K_B('def sse(punkte, m, b):'), K_B('for p in punkte:')],
    merke: { titel: '📉 Lineare Regression', text: 'Die Regression sucht die Gerade y = m·x + b, die am besten zu den Punkten passt. Gemessen wird mit der Summe der quadrierten Fehler (SSE): für jeden Punkt (echter y-Wert − vorhergesagter y-Wert)², alles addiert. Die beste Gerade hat die kleinste SSE.', code: 'Gerade y = 10·x + 0, Punkte (2 | 19) und (3 | 31):\n  19 − 20 = −1   →  (−1)² = 1\n  31 − 30 =  1   →    1²  = 1\n  SSE = 1 + 1 = 2' },
    tipps: ['Für jeden Punkt: Wie weit liegt er über oder unter der Geraden?', 'Fehler quadrieren und aufsummieren.'],
    loesung: 'def sse(punkte, m, b):\n    summe = 0\n    for p in punkte:\n        fehler = p[1] - (m * p[0] + b)\n        summe = summe + fehler ** 2\n    return summe' }),
  FRAGEN({ id: 'sn4', kapitel: 42, ico: '📏', titel: 'Die beste Gerade', lohn: 70, ansicht: 'punkte', titelAnsicht: 'Drei Geraden',
    ziel: 'Drei Lehrlinge haben eine Gerade gezeichnet. Welche passt am besten?',
    bild: () => ({ punkte: LEBEN_PUNKTE.map(([x, y]) => ({ x, y, farbe: '#7cc4ff' })), linien: GERADEN.map(([m, b], i) => ({ m, b, farbe: ['#ffd84a', '#ff8fd8', '#7cf0a0'][i], name: 'ABC'[i] })), max: 8, ymax: 80, achsen: ['Größe', 'Leben'] }),
    fragen: [
      { art: 'zahl', text: `SSE der Geraden A (gelb, y = ${GERADEN[0][0]}·x + ${GERADEN[0][1]})?`, soll: () => sseGerade(LEBEN_PUNKTE, ...GERADEN[0]), tol: 0.01 },
      W('Welche Gerade hat die kleinste SSE?', ['A (gelb)', 'B (rosa)', 'C (grün)'], [0, 1, 2].reduce((b, i) => (sseGerade(LEBEN_PUNKTE, ...GERADEN[i]) < sseGerade(LEBEN_PUNKTE, ...GERADEN[b]) ? i : b), 0)),
      { art: 'zahl', text: 'Mit der besten Geraden: Wie viele Lebenspunkte sagt sie für ein Monster der Größe 8 voraus?', soll: () => { const i = [0, 1, 2].reduce((b, j) => (sseGerade(LEBEN_PUNKTE, ...GERADEN[j]) < sseGerade(LEBEN_PUNKTE, ...GERADEN[b]) ? j : b), 0); return GERADEN[i][0] * 8 + GERADEN[i][1]; }, tol: 0.01 },
      W('Ist das eine Klassifikation oder eine Regression?', ['Klassifikation', 'Regression'], 1)],
    tipps: ['Rechne für jeden Punkt y − (m·x + b), quadriere, addiere.', 'Vorhersage: m · 8 + b.'] }),

  // --- Kapitel 43: 🧩 Unüberwacht: k-Means (Abi-Schwerpunkt ab 2027, Teil B ohne sklearn) ---
  STERN({ id: 'sk1', kapitel: 43, sortArt: 'funktion', ico: '🧲', titel: 'Wer gehört zu wem?', lohn: 75, ansicht: 'punkte', titelAnsicht: 'Monsterhorden',
    ziel: 'Schreib zuordnen(punkte, zentren): für jeden Punkt die Nummer des nächsten Zentrums (0, 1, 2 …). abstand(p, q) gibt es schon.',
    story: 'Uno bekommt Monster ohne Beschriftung. Er soll Horden finden, die zusammengehören – niemand sagt ihm, welche es gibt. Dafür setzt er Zentren und ordnet jedes Monster dem nächsten Zentrum zu.',
    daten: { punkte: HORDE }, vorspann: KMEANS_VORSPANN.split('def kmeans')[0], listen: [[], []],
    aufrufFn: (l, k) => `zuordnen(punkte, ${JSON.stringify(KMEANS_STARTS[k])})`, soll: (l, k) => jsZuordnen(HORDE, KMEANS_STARTS[k]),
    bild: (lauf, k) => hordenBild(Array.isArray(lauf?.wert) ? lauf.wert : null, KMEANS_STARTS[k]),
    befehle: [K_B('def zuordnen(punkte, zentren):'), K_B('zuordnung = []'), K_B('for p in punkte:'), K_B('.append(¦)')],
    merke: { titel: '🧩 k-Means', text: 'k-Means ist unüberwachtes Lernen: Es findet k Gruppen (Cluster) ohne Labels. 1. k Startzentren wählen. 2. Jeden Punkt dem nächsten Zentrum zuordnen. 3. Jedes Zentrum in die Mitte seiner Punkte setzen (Mittelwert). 2 und 3 wiederholen, bis sich nichts mehr ändert.', code: 'zuordnung = zuordnen(punkte, zentren)\nzentren = neue_zentren(punkte, zuordnung, k)' },
    tipps: ['Für jeden Punkt: Merk dir den Index des Zentrums mit dem kleinsten Abstand.', 'beste = 0 · for i in range(len(zentren)): if abstand(p, zentren[i]) < abstand(p, zentren[beste]): beste = i'],
    loesung: C_ZUORDNEN }),
  STERN({ id: 'sk2', kapitel: 43, sortArt: 'funktion', ico: '🎯', titel: 'Die Zentren wandern', lohn: 75, ansicht: 'punkte', titelAnsicht: 'Monsterhorden',
    ziel: 'Schreib neue_zentren(punkte, zuordnung, k): für jede Gruppe 0 … k−1 den Mittelpunkt ihrer Punkte als [x, y].',
    daten: { punkte: HORDE }, listen: [[], []],
    aufrufFn: (l, k) => `neue_zentren(punkte, ${JSON.stringify(jsZuordnen(HORDE, KMEANS_STARTS[k]))}, 3)`, soll: (l, k) => jsNeueZentren(HORDE, jsZuordnen(HORDE, KMEANS_STARTS[k]), 3), tol: 1e-6,
    bild: (lauf, k) => hordenBild(jsZuordnen(HORDE, KMEANS_STARTS[k]), Array.isArray(lauf?.wert) ? lauf.wert : KMEANS_STARTS[k]),
    befehle: [K_B('def neue_zentren(punkte, zuordnung, k):'), K_B('zentren = []'), K_B('for i in range(k):')],
    tipps: ['Für jede Gruppe i: x-Werte und y-Werte ihrer Punkte addieren und mitzählen.', 'Mittelwert = Summe / Anzahl.'],
    loesung: C_NEUE_ZENTREN }),
  STERN({ id: 'sk3', kapitel: 43, sortArt: 'funktion', ico: '🧮', titel: 'Wie gut sind die Gruppen?', lohn: 75, ansicht: 'punkte', titelAnsicht: 'Monsterhorden',
    ziel: 'Schreib sse(punkte, zuordnung, zentren): die Summe der quadrierten Abstände jedes Punkts zu seinem Zentrum.',
    daten: { punkte: HORDE }, vorspann: 'def abstand(p, q):\n    return ((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2) ** 0.5\n', listen: [[], []],
    aufrufFn: (l, k) => { const zu = jsKmeans(HORDE, KMEANS_STARTS[k]), z = jsNeueZentren(HORDE, zu, 3); return `sse(punkte, ${JSON.stringify(zu)}, ${JSON.stringify(z)})`; },
    soll: (l, k) => { const zu = jsKmeans(HORDE, KMEANS_STARTS[k]); return jsSse(HORDE, zu, jsNeueZentren(HORDE, zu, 3)); }, tol: 1e-6,
    bild: (lauf, k) => { const zu = jsKmeans(HORDE, KMEANS_STARTS[k]); return hordenBild(zu, jsNeueZentren(HORDE, zu, 3)); },
    befehle: [K_B('def sse(punkte, zuordnung, zentren):'), K_B('for j in range(len(punkte)):')],
    merke: { titel: '🧮 SSE beim Clustering', text: 'Die SSE (Summe der quadrierten Abstände zu den Zentren) misst, wie eng die Gruppen sind. Je kleiner, desto besser passt die Einteilung. Mit mehr Gruppen sinkt sie immer – darum wählt man k mit der Ellbogenmethode.' },
    tipps: ['Für jeden Punkt j: sein Zentrum ist zentren[zuordnung[j]].', 'abstand(…) ** 2 aufsummieren.'],
    loesung: 'def sse(punkte, zuordnung, zentren):\n    summe = 0\n    for j in range(len(punkte)):\n        zentrum = zentren[zuordnung[j]]\n        summe = summe + abstand(punkte[j], zentrum) ** 2\n    return summe' }),
  STERN({ id: 'sk4', kapitel: 43, sortArt: 'funktion', ico: '🔄', titel: 'k-Means komplett', lohn: 85, ansicht: 'punkte', titelAnsicht: 'Monsterhorden',
    ziel: 'Schreib die k-Means-Schleife kmeans(punkte, start): erst zuordnen, dann immer wieder neue_zentren und zuordnen, bis sich die Zuordnung nicht mehr ändert. Merk dir jede Runde in verlauf (als {"zentren": …, "zuordnung": …}) und gib verlauf zurück. zuordnen, neue_zentren und abstand gibt es schon (deine Funktionen von eben).',
    daten: { punkte: HORDE }, vorspann: KMEANS_VORSPANN.split('def kmeans')[0] + C_ZUORDNEN + '\n' + C_NEUE_ZENTREN + '\n', listen: [[], []],
    aufrufFn: (l, k) => `kmeans(punkte, ${JSON.stringify(KMEANS_STARTS[k])})`,
    pruefWert: (w, k) => { const soll = jsKmeans(HORDE, KMEANS_STARTS[k]); const ende = Array.isArray(w) ? w.at(-1)?.zuordnung : null; return gleichWert(ende, soll) ? null : 'Am Ende stimmen die Gruppen noch nicht.'; },
    okText: (w) => `Fertig nach ${w.length - 1} ${w.length === 2 ? 'Runde' : 'Runden'} ✓`,
    bild: (lauf, k) => (Array.isArray(lauf?.wert) ? { schritte: lauf.wert.map((s) => hordenBild(s.zuordnung, s.zentren)) } : hordenBild(null, KMEANS_STARTS[k])),
    befehle: [K_B('def kmeans(punkte, start):'), K_B('while not fertig:'), K_B('return verlauf')],
    merke: { titel: '🔄 Die k-Means-Schleife', text: 'k-Means wiederholt zwei Schritte: zuordnen (jeder Punkt zum nächsten Zentrum) und neue Zentren berechnen (Mittelwert jeder Gruppe). Es hört auf, wenn sich die Zuordnung nicht mehr ändert – dann ist k-Means „konvergiert“.', code: 'Start: zuordnen\nwiederhole:\n    neue Zentren berechnen\n    neu zuordnen\nbis die neue Zuordnung gleich der alten ist' },
    tipps: ['Erst einmal zuordnen. Dann in einer Schleife: neue Zentren, neu zuordnen – und vergleichen, ob sich etwas geändert hat.', 'Mit fertig = False und while not fertig: … fertig = neu == zuordnung. Danach zuordnung = neu.', 'Jede Runde: verlauf.append({"zentren": zentren, "zuordnung": neu})'],
    loesung: C_KMEANS }),
  STERN({ id: 'sk4v', kapitel: 43, sortArt: 'vorher', funktion: 'kmeans', ico: '🔮', titel: 'Schlechter Start', lohn: 80, ansicht: 'punkte', titelAnsicht: 'Monsterhorden',
    ziel: 'Diesmal liegen zwei Startzentren in derselben Horde unten links, das dritte rechts. Sag voraus, was k-Means daraus macht.',
    daten: { punkte: HORDE }, vorspann: KMEANS_VORSPANN, listen: [[]], code: C_ZUORDNEN + '\n\n' + C_NEUE_ZENTREN, aufruf: `kmeans(punkte, ${JSON.stringify(KMEANS_STARTS[1])})`,
    bild: (lauf) => (Array.isArray(lauf?.wert) ? { schritte: lauf.wert.map((s) => hordenBild(s.zuordnung, s.zentren)) } : hordenBild(null, KMEANS_STARTS[1])),
    fragen: [
      { art: 'zahl', text: 'Startzentren: Gruppe 0 bei (1, 1), Gruppe 1 bei (2, 1), Gruppe 2 bei (8, 2). Wie viele der 15 Punkte gehören nach der ersten Zuordnung zur Gruppe 2?', soll: () => jsZuordnen(HORDE, KMEANS_STARTS[1]).filter((g) => g === 2).length },
      { art: 'zahl', text: 'Nach wie vielen Runden (neue Zentren) ändert sich nichts mehr?', soll: (l) => l.wert.length - 1 },
      W('Findet k-Means am Ende die drei Horden?', ['ja, immer', 'nein – die linke Horde wird geteilt, die beiden anderen landen in einer Gruppe', 'nein, es bricht mit einem Fehler ab'], 1),
      W('Was folgt daraus für die Praxis?', ['Startzentren sind egal', 'mehrmals mit anderen Startzentren starten – und das Ergebnis mit der kleinsten SSE nehmen', 'immer k = 1 nehmen, dann gibt es nur eine Gruppe', 'die Punkte vorher der Größe nach sortieren'], 1)],
    tipps: ['Alle Punkte der Horden rechts und oben liegen am nächsten an (8, 2).', 'Rechne für ein paar Punkte den Abstand zu allen drei Zentren aus.'] }),
  STERN({ id: 'sk5', kapitel: 43, sortArt: 'vorher', funktion: 'ellbogen', ico: '💪', titel: 'Die Ellbogenmethode', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'SSE je k',
    ziel: 'Wie viele Horden sind es wirklich? Der Code rechnet k-Means für k = 1 bis 6 und gibt jeweils die SSE aus.',
    daten: { punkte: HORDE }, vorspann: KMEANS_VORSPANN + '\n' + C_ZUORDNEN + '\n' + C_NEUE_ZENTREN, listen: [[]],
    code: 'def ellbogen(punkte):\n    werte = []\n    starts = [[1, 1], [9, 1], [5, 9], [2, 3], [8, 4], [5, 7]]\n    for k in range(1, 7):\n        verlauf = kmeans(punkte, starts[:k])\n        ende = verlauf[len(verlauf) - 1]\n        summe = 0\n        for j in range(len(punkte)):\n            summe = summe + abstand(punkte[j], ende["zentren"][ende["zuordnung"][j]]) ** 2\n        werte.append(round(summe, 1))\n        print("k =", k, "SSE =", round(summe, 1))\n    return werte',
    aufruf: 'ellbogen(punkte)',
    tabelle: (lauf) => ({ html: lauf?.wert ? tabHtml(['k', 'SSE'], lauf.wert.map((s, i) => [i + 1, String(s).replace('.', ',')])) : '<p class="hinweis">Die Tabelle erscheint, wenn der Code gelaufen ist. Erst vorhersagen!</p>' }),
    fragen: [W('Was passiert mit der SSE, wenn k größer wird?', ['sie steigt', 'sie sinkt (oder bleibt gleich)', 'sie bleibt immer gleich', 'sie springt zufällig'], 1),
      W('Bei welchem k knickt die Kurve wie ein Ellbogen – danach bringt ein weiteres Zentrum kaum noch etwas?', ['1', '2', '3', '6'], 2),
      W('Warum nimmt man nicht einfach das k mit der kleinsten SSE?', ['das wäre k = 15 – jeder Punkt eine eigene Gruppe, nichts gelernt', 'die kleinste SSE ist immer falsch', 'weil k gerade sein muss', 'das geht schon'], 0)],
    tipps: ['Mit k = Anzahl der Punkte wäre die SSE 0.', 'Der Ellbogen ist da, wo die Verbesserung plötzlich klein wird.'] }),

  // --- Kapitel 44: 🏆 Bestärkend: der Späher lernt (Kurs 11.2; Lücke „nur konzeptionell“ geschlossen) ---
  FRAGEN({ id: 'sq1', kapitel: 44, ico: '🏆', titel: 'Agent, Umgebung, Belohnung', lohn: 70, ansicht: 'gitter', titelAnsicht: 'Der Acker des Spähers',
    bild: () => ({}),
    ziel: 'Die Bausteine des bestärkenden Lernens.',
    story: 'Ben ist ein Späher. Er soll vom Start S zum Ziel Z, ohne dem Monster M zu nahe zu kommen. Niemand zeigt ihm den Weg – er probiert, bekommt Belohnung oder Strafe und lernt daraus.',
    merke: { titel: '🏆 Bestärkendes Lernen', text: 'Ein Agent handelt in einer Umgebung. In jedem Zustand wählt er eine Aktion und bekommt eine Belohnung (positiv oder negativ). Er lernt eine Strategie, die die Summe der Belohnungen maximiert. Dabei muss er abwägen: Neues ausprobieren (erkunden) oder Bekanntes nutzen (ausnutzen).' },
    fragen: [W('Wer ist hier der Agent?', ['der Acker', 'der Späher Ben', 'das Monster', 'die Lehrkraft'], 1),
      W('Was ist ein Zustand?', ['die Belohnung für den letzten Schritt', 'das Feld, auf dem der Späher gerade steht', 'die Mauer am Rand des Ackers', 'die Anzahl der Versuche bis zum Ziel'], 1),
      W('Jeder Schritt kostet −1. Warum?', ['damit der Späher langsamer wird', 'damit sich ein kurzer Weg mehr lohnt – lange Umwege sammeln mehr Kosten', 'damit er nie ans Ziel kommt', 'das hat keinen Grund'], 1),
      W('Was unterscheidet bestärkendes von überwachtem Lernen?', ['Es gibt überhaupt keine Daten zum Lernen', 'Statt Labels gibt es nur Belohnung oder Strafe – für jede Aktion, keine richtigen Antworten', 'Es braucht viel mehr Speicher für die Daten', 'Es kann nur für Spiele benutzt werden'], 1)],
    tipps: ['Der Agent ist der, der Entscheidungen trifft.'] }),
  STERN({ id: 'sq2', fertig: true, kapitel: 44, sortArt: 'funktion', ico: '🧭', titel: 'Die Lernregel', lohn: 90, ansicht: 'gitter', titelAnsicht: 'Der Acker des Spähers',
    ziel: 'Schreib lerne(q, zustand, aktion, belohnung, neuer_zustand). Sie verbessert q[zustand][aktion] nach der Q-Lernregel. ALPHA = 0.5 und GAMMA = 0.9 sind schon festgelegt.',
    story: 'Ben führt eine Tabelle q: für jedes Feld und jede Richtung (0 rechts, 1 runter, 2 links, 3 hoch) einen Wert – wie gut es ist, dort diese Richtung zu nehmen. Nach jedem Schritt verbessert er einen Eintrag. Nach 300 Ausflügen läuft er los – findet er den kürzesten Weg?',
    vorspann: Q_VORSPANN, listen: [[]], aufruf: 'spaeher(lerne, 300, 0.2)',
    pruefWert: (w) => (!w?.ziel ? 'Der Späher kommt nicht am Ziel an – sieh dir die Pfeile an.' : w.pfad.length - 1 > qKuerzester() ? `Ziel erreicht, aber mit ${w.pfad.length - 1} Schritten – der kürzeste Weg hat ${qKuerzester()}.` : null),
    okText: (w) => `Der Späher findet den kürzesten Weg: ${w.pfad.length - 1} Schritte ✓`,
    bild: (lauf) => ({ q: lauf?.wert?.q, pfad: lauf?.wert?.pfad }),
    befehle: [K_B('def lerne(q, zustand, aktion, belohnung, neuer_zustand):'), K_B('q[zustand][aktion]'), K_B('max(q[neuer_zustand])')],
    merke: { titel: '🧭 Q-Lernen', text: 'Q-Lernen merkt sich für jeden Zustand und jede Aktion einen Wert Q. Nach jedem Schritt: Q ← Q + α · (Belohnung + γ · bester Q-Wert im neuen Zustand − Q). α ist die Lernrate, γ wie wichtig spätere Belohnungen sind. Am Ende nimmt der Agent in jedem Zustand die Aktion mit dem größten Q.', code: 'Q = 2, Belohnung −1, bester Q-Wert danach 5, α = 0,5, γ = 0,9:\n  Ziel = −1 + 0,9 · 5 = 3,5\n  neues Q = 2 + 0,5 · (3,5 − 2) = 2,75' },
    tipps: ['Der neue Wert liegt zwischen dem alten Wert und dem „Ziel“: Belohnung plus der beste Wert, den man vom neuen Feld aus erwarten kann.', 'max(q[neuer_zustand]) ist der beste Wert im neuen Zustand.', 'q[zustand][aktion] = alt + ALPHA * (belohnung + GAMMA * max(q[neuer_zustand]) - alt)'],
    loesung: 'def lerne(q, zustand, aktion, belohnung, neuer_zustand):\n    alt = q[zustand][aktion]\n    ziel = belohnung + GAMMA * max(q[neuer_zustand])\n    q[zustand][aktion] = alt + ALPHA * (ziel - alt)' }),
  STERN({ id: 'sq2b', kapitel: 44, sortArt: 'funktion', ico: '🎲', titel: 'Erkunden oder ausnutzen', lohn: 85,
    ziel: 'Schreib waehle_aktion(werte, eps, wuerfel, zufallsaktion): Ist wuerfel kleiner als eps, probiert der Späher etwas Neues und nimmt zufallsaktion. Sonst nimmt er die Richtung mit dem größten Wert in werte (bei Gleichstand die erste) – such sie selbst mit einer Schleife.',
    story: 'Bisher hat der Späher-Code für Ben entschieden, welche Richtung er nimmt. Jetzt entscheidest du: Meistens nimmt Ben das, was sich bewährt hat – aber manchmal würfelt er und probiert etwas Neues.',
    ...{ listen: WAEHLE_TESTS.map(() => []), aufrufFn: (l, k) => `waehle_aktion(${JSON.stringify(WAEHLE_TESTS[k][0])}, ${WAEHLE_TESTS[k][1]}, ${WAEHLE_TESTS[k][2]}, ${WAEHLE_TESTS[k][3]})`,
      soll: (l, k) => jsWaehle(WAEHLE_TESTS[k]), testName: (k) => ['Würfel 0,9 bei ε = 0,2 – ausnutzen', 'Würfel 0,1 bei ε = 0,2 – erkunden', 'nur negative Werte, ε = 0', 'Gleichstand'][k] },
    befehle: [K_B('def waehle_aktion(werte, eps, wuerfel, zufallsaktion):'), K_B('if ¦:')],
    merke: { titel: '🎲 ε-greedy', text: 'Mit der Wahrscheinlichkeit ε erkundet der Agent (zufällige Aktion), sonst nutzt er aus (Aktion mit dem größten Q-Wert). Ohne Erkunden findet er vielleicht nie einen besseren Weg, mit zu viel Erkunden nutzt er sein Wissen nicht.', code: 'ε = 0,2, Q-Werte [0, 5, 2, 1]:\n  Würfel 0,9 ≥ 0,2 → ausnutzen → Aktion 1 (Wert 5)\n  Würfel 0,1 < 0,2 → erkunden → zufällige Aktion' },
    tipps: ['Zuerst: if wuerfel < eps: return zufallsaktion', 'Sonst Maximumsuche über die Indizes: beste = 0, dann for i in range(len(werte)): if werte[i] > werte[beste]: beste = i', 'Mit > (nicht >=) bleibt bei Gleichstand die erste Richtung.'],
    loesung: C_WAEHLE }),
  STERN({ id: 'sq3', kapitel: 44, sortArt: 'vorher', funktion: 'versuch', ico: '🔮', titel: 'Erkunden oder ausnutzen?', lohn: 80, ansicht: 'gitter', titelAnsicht: 'Der Acker des Spähers',
    ziel: 'Was passiert, wenn der Späher nie etwas Neues ausprobiert (ε = 0) – und was, wenn er nur 3 Ausflüge machen darf?',
    vorspann: Q_VORSPANN, listen: [[]],
    code: 'def lerne(q, zustand, aktion, belohnung, neuer_zustand):\n    alt = q[zustand][aktion]\n    ziel = belohnung + GAMMA * max(q[neuer_zustand])\n    q[zustand][aktion] = alt + ALPHA * (ziel - alt)\n\ndef versuch():\n    a = spaeher(lerne, 300, 0.2)\n    b = spaeher(lerne, 300, 0.0)\n    c = spaeher(lerne, 3, 0.2)\n    print("ε = 0.2, 300 Ausflüge:", len(a["pfad"]) - 1, "Schritte, Ziel:", a["ziel"])\n    print("ε = 0, 300 Ausflüge:", len(b["pfad"]) - 1, "Schritte, Ziel:", b["ziel"])\n    print("ε = 0.2, 3 Ausflüge:", len(c["pfad"]) - 1, "Schritte, Ziel:", c["ziel"])\n    return [a, b, c]',
    aufruf: 'versuch()',
    bild: (lauf) => ({ q: lauf?.wert?.[0]?.q, pfad: lauf?.wert?.[0]?.pfad }),
    fragen: [W('ε ist die Wahrscheinlichkeit, eine zufällige Richtung auszuprobieren. Was bedeutet ε = 0?', ['der Späher erkundet nie – er nimmt immer die bisher beste Richtung', 'der Späher läuft nur zufällig', 'der Späher lernt nichts', 'der Späher bleibt stehen'], 0),
      W('Erreicht der Späher mit nur 3 Ausflügen schon zuverlässig das Ziel?', ['ja', 'nein – 3 Ausflüge reichen nicht zum Lernen'], 1),
      W('Was ist der Kompromiss beim bestärkenden Lernen?', ['schnell gegen langsam', 'erkunden gegen ausnutzen – Neues probieren oder das Beste nehmen', 'groß gegen klein', 'Training gegen Test'], 1)],
    tipps: ['Lies die Bedeutung von ε im Text der Frage.'] }),
  STERN({ id: 'sq4', fertig: true, kapitel: 44, sortArt: 'funktion', ico: '🌊', titel: 'Der Sumpf', lohn: 95, ansicht: 'gitter', titelAnsicht: 'Der Sumpf vor der Sternwarte',
    ziel: 'Ein neuer Acker: Durch den Sumpf W kommt man durch, aber jeder Schritt hinein kostet 4. Ein normaler Schritt kostet 1, das Ziel Z bringt +10, das Monster M −10 (beide beenden den Ausflug). Schreib belohnung(feld) für diese Umgebung – und deine Lernregel lerne(…) noch einmal. Findet der Späher den besten Weg?',
    story: 'Vor der Sternwarte liegt ein Sumpf. Ben könnte mitten hindurchwaten – kürzer, aber mühsam. Oder er läuft außen herum. Niemand sagt ihm, was besser ist: Er muss es aus den Belohnungen lernen, die du festlegst.',
    vorspann: SW_SUMPF_V, listen: [[]], aufruf: 'spaeher(lerne, belohnung, 300, 0.2)',
    pruefWert: (w) => {
      if (!w?.werte) return 'Der Späher hat keine Werte geliefert.';
      if (!gleichWert(w.werte, [-1, -4, -10, 10])) return `belohnung gibt für . W M Z die Werte ${w.werte.map(ergebnisText).join(', ')} – laut Beschreibung wären es −1, −4, −10, 10.`;
      if (!w.ziel) return 'Der Späher kommt nicht am Ziel an – stimmt die Lernregel?';
      const sumpf = w.pfad.some(([x, y]) => SW_SUMPF[y][x] === 'W');
      if (sumpf) return 'Der Späher watet durch den Sumpf. Außen herum bringt mehr – stimmt die Lernregel?';
      return w.pfad.length - 1 > qKuerzester(SW_SUMPF, '#MW') ? `Ziel erreicht, aber mit ${w.pfad.length - 1} Schritten – außen herum geht es in ${qKuerzester(SW_SUMPF, '#MW')}.` : null;
    },
    okText: (w) => `Der Späher läuft in ${w.pfad.length - 1} Schritten außen um den Sumpf herum ✓`,
    bild: (lauf) => ({ gitter: SW_SUMPF, q: lauf?.wert?.q, pfad: lauf?.wert?.pfad }),
    befehle: [K_B('def belohnung(feld):'), K_B('def lerne(q, zustand, aktion, belohnung, neuer_zustand):')],
    tipps: ['belohnung bekommt das Zeichen des Feldes, das der Späher gerade betritt ("." "W" "M" "Z") und gibt eine Zahl zurück.', 'Kosten sind negative Belohnungen: ein normaler Schritt −1, ein Schritt in den Sumpf −4.', 'Die Lernregel ist dieselbe wie auf dem ersten Acker: Ziel = Belohnung + γ · bester Wert im neuen Zustand, dann Q um α · (Ziel − Q) verschieben.'],
    loesung: SW_C_SUMPF }),

  // --- Kapitel 45: 🧠 Neuronen und Verantwortung (Kurs 11.8, 11.3, 11.10) ---
  STERN({ id: 'sp1', kapitel: 45, sortArt: 'funktion', ico: '🧠', titel: 'Ein Neuron für UND', lohn: 75,
    ziel: 'Schreib neuron(x1, x2, w1, w2, schwelle) als Perzeptron: Ist w1·x1 + w2·x2 ≥ schwelle, gibt es 1 zurück, sonst 0. Die Tests probieren verschiedene Gewichte. Dann und(x1, x2): ein einziger Aufruf von neuron mit Gewichten und Schwelle, die nur bei (1, 1) feuern.',
    vorspann: SW_SP1_V, listen: SW_SP1_T.map(() => []), aufrufFn: (l, k) => SW_SP1_T[k][0], soll: (l, k) => SW_SP1_T[k][1], testName: (k) => SW_SP1_T[k][0].replace(/^_und/, 'und'),
    befehle: [K_B('def neuron(x1, x2, w1, w2, schwelle):'), K_B('def und(x1, x2):'), K_B('return neuron(¦)')],
    merke: { titel: '🧠 Perzeptron', text: 'Ein künstliches Neuron gewichtet seine Eingaben, addiert sie und vergleicht mit einer Schwelle (Aktivierungsfunktion): Ist die Summe groß genug, feuert es (1), sonst nicht (0). Beim Lernen werden die Gewichte angepasst. Ein einzelnes Perzeptron kann nur Klassen trennen, die sich durch eine Gerade trennen lassen.', code: 'w1 = 0,3, w2 = 0,8, Schwelle 0,5, Eingabe (1, 1):\n  Summe = 0,3 · 1 + 0,8 · 1 = 1,1 ≥ 0,5  →  Ausgabe 1\nEingabe (1, 0): Summe 0,3 < 0,5  →  Ausgabe 0' },
    tipps: ['neuron: summe = w1 * x1 + w2 * x2, dann mit der Schwelle vergleichen.', 'Für UND: Probier w1 = 1, w2 = 1. Welche Summen sind möglich: 0, 1, 2?', 'Die Schwelle muss größer als 1 und höchstens 2 sein.'],
    loesung: 'def neuron(x1, x2, w1, w2, schwelle):\n    summe = w1 * x1 + w2 * x2\n    if summe >= schwelle:\n        return 1\n    return 0\n\ndef und(x1, x2):\n    return neuron(x1, x2, 1, 1, 1.5)' }),
  STERN({ id: 'sp1b', kapitel: 45, sortArt: 'funktion', ico: '🎓', titel: 'Das Neuron lernt', lohn: 85,
    ziel: 'Bisher hast du die Gewichte selbst ausgesucht. Jetzt lernt das Neuron sie: Schreib trainiere(daten, eta, runden). Es startet mit w1 = w2 = schwelle = 0, geht runden-mal alle Beispiele [x1, x2, soll] durch und verbessert sich nach der Lernregel aus dem Merke (Lernrate eta). Gib am Ende [w1, w2, schwelle] zurück. neuron gibt es schon.',
    story: 'Vega lächelt: „Gewichte von Hand aussuchen kann jeder bei zwei Eingaben. Bei tausend Eingaben nicht mehr. Lass das Neuron aus seinen Fehlern lernen!“',
    vorspann: SW_NEURON_PY + '\ndef _pruefe(daten):\n    w = trainiere(daten, 0.5, 10)\n    aus = []\n    for d in daten:\n        aus.append(neuron(d[0], d[1], w[0], w[1], w[2]))\n    return aus\n',
    daten: { UND: SW_UND, ODER: SW_ODER }, listen: [[], [], [], [], []], tol: 1e-6,
    aufrufFn: (l, k) => (k < 3 ? `trainiere(${['UND', 'ODER', 'UND'][k]}, ${SW_LERN_TESTS[k][1]}, ${SW_LERN_TESTS[k][2]})` : `_pruefe(${['UND', 'ODER'][k - 3]})`),
    soll: (l, k) => (k < 3 ? SW_trainiere(...SW_LERN_TESTS[k].slice(0, 3)) : [[0, 0, 0, 1], [0, 1, 1, 1]][k - 3]),
    testName: (k) => (k < 3 ? `Gewichte nach dem Training (${SW_LERN_TESTS[k][3]}, ${SW_LERN_TESTS[k][2]} Runden)` : `Das trainierte ${['UND', 'ODER'][k - 3]}-Neuron auf allen vier Eingaben`),
    befehle: [K_B('def trainiere(daten, eta, runden):'), K_B('for r in range(runden):')],
    merke: { titel: '🎓 Die Lernregel des Perzeptrons', text: 'Das Perzeptron lernt aus seinen Fehlern: Für jedes Beispiel vergleicht es seine Ausgabe mit dem Soll. Ist sie falsch, schiebt es jedes Gewicht um η · (soll − ist) · x in die richtige Richtung, die Schwelle in die Gegenrichtung. η (eta) ist die Lernrate. Sind die Klassen durch eine Gerade trennbar, hört es nach endlich vielen Runden auf, Fehler zu machen.', code: 'Beispiel (1, 1), soll 1, ist 0, η = 0,5:\n  fehler = 1 − 0 = 1\n  w1 = 0 + 0,5 · 1 · 1 = 0,5   (w2 genauso)\n  schwelle = 0 − 0,5 · 1 = −0,5' },
    tipps: ['Zwei Schleifen: außen über die Runden, innen über alle Beispiele d (d[0] = x1, d[1] = x2, d[2] = soll).', 'Ist die Ausgabe richtig, ist fehler = 0 – dann ändert sich nichts. Du brauchst also kein if.', 'Achtung, Vorzeichen: Die Schwelle wird um eta · fehler kleiner (schwelle = schwelle − eta · fehler).'],
    loesung: SW_C_TRAINIERE }),
  STERN({ id: 'sp1bv', kapitel: 45, sortArt: 'vorher', funktion: 'versuch', ico: '🔮', titel: 'Lernt es auch XOR?', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Fehler je Runde',
    ziel: 'Der Code trainiert dasselbe Neuron 8 Runden lang auf UND und auf XOR und zählt in jeder Runde die Fehler. Sag voraus, was passiert.',
    vorspann: SW_NEURON_PY, daten: { UND: SW_UND, XOR: SW_XOR }, listen: [[]],
    code: 'def fehler_je_runde(daten, eta, runden):\n    w1 = 0\n    w2 = 0\n    schwelle = 0\n    verlauf = []\n    for r in range(runden):\n        fehler_zahl = 0\n        for d in daten:\n            ist = neuron(d[0], d[1], w1, w2, schwelle)\n            fehler = d[2] - ist\n            if fehler != 0:\n                fehler_zahl = fehler_zahl + 1\n            w1 = w1 + eta * fehler * d[0]\n            w2 = w2 + eta * fehler * d[1]\n            schwelle = schwelle - eta * fehler\n        verlauf.append(fehler_zahl)\n    return verlauf\n\ndef versuch():\n    und = fehler_je_runde(UND, 0.5, 8)\n    xor = fehler_je_runde(XOR, 0.5, 8)\n    print("UND:", und)\n    print("XOR:", xor)\n    return {"und": und, "xor": xor}',
    aufruf: 'versuch()',
    tabelle: (lauf) => ({ html: lauf?.wert?.und ? tabHtml(['Runde', 'Fehler UND', 'Fehler XOR'], lauf.wert.und.map((f, i) => [i + 1, f, lauf.wert.xor[i]])) : '<p class="hinweis">Die Tabelle erscheint, wenn der Code gelaufen ist. Erst vorhersagen!</p>' }),
    fragen: [{ art: 'zahl', text: 'Wie viele Fehler macht das UND-Neuron in Runde 1? (Spiel die vier Beispiele von Hand durch.)', soll: (l) => l.wert.und[0] },
      W('Was passiert mit den Fehlern bei XOR?', ['sie werden nie 0, auch nicht nach vielen Runden', 'sie sinken etwas langsamer, werden aber auch 0', 'sie sind von Anfang an 0', 'sie steigen in jeder Runde weiter an'], 0),
      W('Warum lernt das Neuron XOR nicht?', ['Keine Gerade trennt (0|1), (1|0) von (0|0), (1|1)', 'Die Lernrate 0,5 ist für XOR zu groß', 'XOR braucht mehr als acht Runden Training', 'Die Startgewichte 0 sind für XOR ungünstig'], 0),
      W('Was hilft bei XOR?', ['ein Netz mit einer versteckten Schicht', 'eine kleinere Lernrate', 'mehr Trainingsrunden', 'die Beispiele anders sortieren'], 0)],
    tipps: ['Spiel UND von Hand durch: Runde 1 beginnt mit w1 = w2 = schwelle = 0, also feuert das Neuron bei (0, 0) – ein Fehler.', 'Ein Perzeptron zieht eine Gerade w1·x1 + w2·x2 = schwelle. Versuch, XOR mit einer Geraden zu trennen.'] }),
  STERN({ id: 'sp2', kapitel: 45, sortArt: 'funktion', knobel: true, ico: '⚔️', titel: 'Der XOR-Bosskampf', lohn: 95,
    ziel: 'Ein einzelnes Neuron schafft XOR nicht (nur genau eine Eingabe ist 1). Bau ein kleines Netz: und(x1, x2), oder(x1, x2) und nicht(x) als Neuronen – und daraus xor(x1, x2). neuron(x1, x2, w1, w2, schwelle) gibt es schon. Die Eingaben kannst du nur an Neuronen weitergeben, nicht selbst vergleichen.',
    vorspann: SW_SP2_V, listen: [[], [], [], [], []], aufrufFn: (l, k) => (k < 4 ? `_xor(${[0, 0, 1, 1][k]}, ${[0, 1, 0, 1][k]})` : '_netz()'),
    soll: (l, k) => [0, 1, 1, 0, { und: [0, 0, 0, 1], oder: [0, 1, 1, 1], nicht: [1, 0] }][k], testName: (k) => (k < 4 ? `xor(${[0, 0, 1, 1][k]}, ${[0, 1, 0, 1][k]})` : 'und, oder, nicht einzeln'),
    befehle: [K_B('def oder(x1, x2):'), K_B('def nicht(x):'), K_B('def xor(x1, x2):'), K_B('return neuron(¦)')],
    tipps: ['XOR heißt: mindestens eine ist 1 (ODER) – aber nicht beide (NICHT UND).', 'nicht(x) ist ein Neuron mit negativem Gewicht: −1 · x ≥ −0.5. Als zweite Eingabe gibst du 0 mit Gewicht 0.', 'Zwei Schichten: erst oder und und, dann ein Neuron, das beide verknüpft.'],
    loesung: 'def und(x1, x2):\n    return neuron(x1, x2, 1, 1, 1.5)\n\ndef oder(x1, x2):\n    return neuron(x1, x2, 1, 1, 0.5)\n\ndef nicht(x):\n    return neuron(x, 0, -1, 0, -0.5)\n\ndef xor(x1, x2):\n    return und(oder(x1, x2), nicht(und(x1, x2)))' }),
  FRAGEN({ id: 'sp3', kapitel: 45, ico: '🚨', titel: 'Fehlalarm oder übersehen?', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Monster-Warnsystem',
    tabelle: () => ({ html: tabHtml(['', 'echt: Angriff', 'echt: kein Angriff'], [['Alarm', 'TP = 18', 'FP = 12'], ['kein Alarm', 'FN = 2', 'TN = 168']]) }),
    ziel: 'Das Warnsystem der Burg meldet Monsterangriffe. Bewerte es mit Precision und Recall.',
    fragen: [
      { art: 'zahl', text: 'Precision = TP / (TP + FP): Wie viele der Alarme waren echt? (als Dezimalzahl)', soll: () => 18 / 30, tol: 0.01 },
      { art: 'zahl', text: 'Recall = TP / (TP + FN): Wie viele echte Angriffe wurden gemeldet?', soll: () => 18 / 20, tol: 0.01 },
      { art: 'zahl', text: 'Genauigkeit = (TP + TN) / alle?', soll: () => 186 / 200, tol: 0.01 },
      W('Beim Monster-Warnsystem: Was ist schlimmer?', ['ein Fehlalarm (FP) – die Wache steht umsonst auf', 'ein übersehener Angriff (FN) – die Burg ist ungeschützt'], 1),
      W('Ein Spamfilter soll keine wichtige Mail wegwerfen. Worauf achtest du dort besonders (positiv = Spam)?', ['Precision – wenn er „Spam“ sagt, soll es auch Spam sein', 'Recall – er soll jeden Spam finden'], 0)],
    tipps: ['18 / (18 + 12)', 'Überleg, was ein Fehler jeweils kostet.'] }),
  FRAGEN({ id: 'sp4', kapitel: 45, ico: '⚖️', titel: 'Wer trägt die Verantwortung?', lohn: 75,
    ziel: 'Bias, Erklärbarkeit und Regeln für KI.',
    merke: { titel: '⚖️ KI und Verantwortung', text: 'Eine KI lernt, was in ihren Daten steckt – auch Vorurteile (Bias). Ein scheinbar harmloses Merkmal kann ein anderes ersetzen (Proxy-Merkmal, z. B. Postleitzahl statt Herkunft). Viele Modelle sind eine Black Box: Man sieht nicht, warum sie entscheiden. Der EU AI Act teilt KI nach Risiko ein und verbietet manche Anwendungen ganz.' },
    fragen: [
      SZ('Eine Bewerbungs-KI wurde mit den Einstellungen der letzten 10 Jahre trainiert, in denen fast nur Männer eingestellt wurden. Nun bewertet sie Bewerberinnen schlechter.', 0, ['trainiert', 'einstellungen']),
      W('Die Bewerbungs-KI bekommt das Merkmal „Geschlecht“ nicht mehr – aber den Namen des Sportvereins. Warum kann der Bias bleiben?', ['weil Sportvereine egal sind', 'weil der Verein als Proxy wirken kann – er hängt mit dem Geschlecht zusammen', 'weil die KI kaputt ist', 'gar nicht – der Bias ist weg'], 1),
      W('Ein Entscheidungsbaum gilt als gut erklärbar, ein großes neuronales Netz nicht. Warum?', ['der Baum ist schneller', 'beim Baum kann man die Fragen nachlesen – bis zur Entscheidung, beim Netz nicht', 'das Netz hat gar keine Gewichte zum Lesen', 'Bäume machen keine Fehler'], 1),
      W('Nach dem EU AI Act: In welche Risikostufe fällt eine KI, die über Bewerbungen entscheidet?', ['minimales Risiko', 'begrenztes Risiko', 'hohes Risiko – strenge Pflichten', 'verboten'], 2),
      W('Und eine KI, die Menschen nach ihrem Verhalten bewertet und benachteiligt (Social Scoring durch Behörden)?', ['minimales Risiko', 'hohes Risiko', 'verboten (unannehmbares Risiko)', 'erlaubt, wenn sie genau ist'], 2)],
    tipps: ['Die KI ist nicht böse – sie spiegelt ihre Trainingsdaten.'] }),
);

// --- Bilder ---
const SFARBE = { frech: '#ff7b6b', friedlich: '#7cc4ff' };
const CLUSTER_FARBE = ['#ffd84a', '#7cf0a0', '#ff8fd8', '#b67aff', '#ffb86b', '#7cc4ff'];
function monsterBild(neu, ergebnis, k) {
  const nah = [...MONSTER_PUNKTE].sort((a, b) => dist(a, neu) - dist(b, neu)).slice(0, k);
  return { punkte: MONSTER_PUNKTE.map(([x, y, l]) => ({ x, y, farbe: SFARBE[l], ring: nah.some((n) => n[0] === x && n[1] === y) })),
    neu: { x: neu[0], y: neu[1], farbe: ergebnis ? SFARBE[ergebnis] || '#fff' : '#fff', text: ergebnis || '?' }, max: 10, achsen: ['Größe', 'Tempo'], legende: [['frech', SFARBE.frech], ['friedlich', SFARBE.friedlich]] };
}
const hordenBild = (zu, zentren) => ({ punkte: HORDE.map(([x, y], j) => ({ x, y, farbe: zu ? CLUSTER_FARBE[zu[j] % 6] : '#c8d0e8', name: HORDE_NAME[j] })),
  zentren: (zentren || []).map(([x, y], i) => ({ x, y, farbe: CLUSTER_FARBE[i % 6] })), max: 10, achsen: ['x', 'y'] });

let STERN_ANIM = null;
// Zeichnet die Ansicht der Aufgabe: Punktwolke, Gitter oder Tabelle (lauf = Ergebnis aus Python oder null)
function sternZeigen(lauf, k = 0) {
  clearInterval(STERN_ANIM);
  if (H.malen) { H.malen(lauf, k); return; }   // 🔧 Arena der Werkstatt
  if (!H.ansicht) return;                       // nur Protokoll (z. B. Vorhersagen in der Werkstatt)
  if (H.ansicht === 'tabelle') { $('#sternTabelle').innerHTML = H.tabelle(lauf, k).html; return; }
  const b = H.bild ? H.bild(lauf, k) : {};
  if (H.ansicht === 'gitter') { sternGitter(b); return; }
  if (b.schritte) {
    // k-Means Runde für Runde
    let i = 0;
    const zeig = () => { sternPunkte(b.schritte[i]); $('#kornZahl').textContent = i ? `Runde ${i}` : 'Start'; };
    zeig();
    STERN_ANIM = setInterval(() => {
      if (!$('#kornZahl') || !H?.warte) { clearInterval(STERN_ANIM); return; }   // inzwischen eine andere Aufgabe
      if (++i >= b.schritte.length) { clearInterval(STERN_ANIM); const n = b.schritte.length - 1; $('#kornZahl').textContent = `fertig nach ${n} ${n === 1 ? 'Runde' : 'Runden'}`; return; }
      zeig();
    }, 900);
    return;
  }
  sternPunkte(b);
}
function sternLeinwand() {
  const cv = $('#kornCanvas'), w = cv.clientWidth || 400, h = Math.round(Math.min(320, Math.max(220, w * 0.62))), dpr = devicePixelRatio || 1;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + 'px';
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Nachthimmel
  const grad = g.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, '#0b1230'); grad.addColorStop(1, '#1a1a40');
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.35)';
  for (let i = 0; i < 40; i++) g.fillRect((i * 97) % w, (i * 53) % h, 1.5, 1.5);
  return { g, w, h };
}
function sternPunkte(b) {
  const { g, w, h } = sternLeinwand(), l = 34, r = w - 14, o = 14, u = h - 28, xmax = b.max || 10, ymax = b.ymax || b.max || 10;
  const X = (x) => l + (r - l) * x / xmax, Y = (y) => u - (u - o) * y / ymax;
  g.strokeStyle = '#3a4f8f'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(l, o); g.lineTo(l, u); g.lineTo(r, u); g.stroke();
  g.fillStyle = '#93a3d4'; g.font = '11px system-ui'; g.textAlign = 'center';
  for (let x = 0; x <= xmax; x += xmax > 10 ? 2 : 1) g.fillText(x, X(x), u + 13);
  g.textAlign = 'right';
  for (let y = 0; y <= ymax; y += ymax > 20 ? 20 : 2) g.fillText(y, l - 4, Y(y) + 4);
  if (b.achsen) { g.textAlign = 'right'; g.fillText(b.achsen[0] + ' →', r, u - 4); g.textAlign = 'left'; g.fillText('↑ ' + b.achsen[1], l + 4, o + 10); }
  for (const li of b.linien || []) {
    g.strokeStyle = li.farbe; g.lineWidth = 2.5; g.beginPath(); g.moveTo(X(0), Y(li.b)); g.lineTo(X(xmax), Y(li.m * xmax + li.b)); g.stroke();
    if (li.name) { g.fillStyle = li.farbe; g.textAlign = 'left'; g.font = '700 13px system-ui'; g.fillText(li.name, X(xmax) - 16, Y(li.m * xmax + li.b) + 14); }
  }
  // Fehlerstrecken bei der Regression
  if (b.fehler) { g.strokeStyle = 'rgba(255,123,107,.8)'; g.lineWidth = 1.5; for (const p of b.punkte) { g.beginPath(); g.moveTo(X(p.x), Y(p.y)); g.lineTo(X(p.x), Y(b.fehler[0] * p.x + b.fehler[1])); g.stroke(); } }
  if (b.strecke) { g.strokeStyle = '#ffd84a'; g.setLineDash([5, 4]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(b.strecke[0][0]), Y(b.strecke[0][1])); g.lineTo(X(b.strecke[1][0]), Y(b.strecke[1][1])); g.stroke(); g.setLineDash([]); }
  for (const p of b.punkte || []) {
    g.fillStyle = p.farbe; g.beginPath(); g.arc(X(p.x), Y(p.y), 6, 0, 7); g.fill();
    if (p.ring) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(X(p.x), Y(p.y), 10, 0, 7); g.stroke(); }
    if (p.name) { g.fillStyle = '#e6edff'; g.font = '10px system-ui'; g.textAlign = 'left'; g.fillText(p.name, X(p.x) + 8, Y(p.y) - 6); }
  }
  for (const z of b.zentren || []) {
    g.strokeStyle = '#0b1230'; g.lineWidth = 3; g.fillStyle = z.farbe;
    g.beginPath(); g.moveTo(X(z.x), Y(z.y) - 11); for (let i = 1; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 5 : 11; g.lineTo(X(z.x) + rr * Math.cos(a), Y(z.y) + rr * Math.sin(a)); } g.closePath(); g.stroke(); g.fill();
  }
  if (b.neu) {
    g.fillStyle = b.neu.farbe; g.strokeStyle = '#fff'; g.lineWidth = 2.5;
    g.beginPath(); g.rect(X(b.neu.x) - 7, Y(b.neu.y) - 7, 14, 14); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.font = '700 12px system-ui'; g.textAlign = 'left'; g.fillText(b.neu.text, X(b.neu.x) + 11, Y(b.neu.y) + 4);
  }
  if (b.legende) { g.font = '11px system-ui'; g.textAlign = 'left'; b.legende.forEach(([t, f], i) => { g.fillStyle = f; g.beginPath(); g.arc(l + 14, o + 26 + i * 15, 5, 0, 7); g.fill(); g.fillStyle = '#e6edff'; g.fillText(t, l + 24, o + 30 + i * 15); }); }
}
// Q-Lernen: Gitter mit Start, Ziel, Monster, Mauern; Pfeile = beste Richtung je Feld; gelber Weg = was der Späher gelernt hat
function sternGitter(b) {
  const G = b.gitter || Q_GITTER;   // 🌊 sq4: eigener Acker mit Sumpf W
  const { g, w, h } = sternLeinwand(), gw = G[0].length, gh = G.length;
  const s = Math.min((w - 20) / gw, (h - 20) / gh), ox = (w - s * gw) / 2, oy = (h - s * gh) / 2;
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const c = G[y][x], px = ox + x * s, py = oy + y * s;
    g.fillStyle = c === '#' ? '#5a4632' : c === 'W' ? ((x + y) % 2 ? '#2f5f6b' : '#356a77') : (x + y) % 2 ? '#3d6b34' : '#447a3a';
    g.fillRect(px + 1, py + 1, s - 2, s - 2);
    g.font = `${Math.round(s * 0.45)}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (c === 'W') { g.strokeStyle = 'rgba(190,230,255,.45)'; g.lineWidth = 1.5; for (let i = 1; i <= 2; i++) { g.beginPath(); for (let t = 0; t <= 8; t++) { const xx = px + s * (0.15 + t * 0.0875), yy = py + s * (i * 0.33) + Math.sin(t * 1.4 + i) * s * 0.04; if (t) g.lineTo(xx, yy); else g.moveTo(xx, yy); } g.stroke(); } }
    if (c === 'Z') g.fillText('🏁', px + s / 2, py + s / 2);
    if (c === 'M') g.fillText('👹', px + s / 2, py + s / 2);
    if (c === 'S') g.fillText('🏠', px + s / 2, py + s / 2);
    if (c === '#') g.fillText('🧱', px + s / 2, py + s / 2);
    if (b.q && !'#ZM'.includes(c)) {
      const qq = b.q[y * gw + x], best = qq.indexOf(Math.max(...qq));
      if (qq.some((v) => v !== 0)) {
        const [dx, dy] = [[1, 0], [0, 1], [-1, 0], [0, -1]][best], cx = px + s / 2, cy = py + s / 2;
        g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(cx - dx * s * 0.25, cy - dy * s * 0.25); g.lineTo(cx + dx * s * 0.28, cy + dy * s * 0.28); g.stroke();
        g.beginPath(); g.moveTo(cx + dx * s * 0.3, cy + dy * s * 0.3); g.lineTo(cx + dx * s * 0.14 - dy * s * 0.1, cy + dy * s * 0.14 + dx * s * 0.1); g.lineTo(cx + dx * s * 0.14 + dy * s * 0.1, cy + dy * s * 0.14 - dx * s * 0.1); g.closePath(); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill();
        g.font = `${Math.round(s * 0.16)}px system-ui`; g.fillStyle = '#ffe08a'; g.fillText(Math.max(...qq).toFixed(1).replace('.', ','), cx, py + s * 0.85);
      }
    }
  }
  if (b.pfad) {
    g.strokeStyle = '#ffd84a'; g.lineWidth = 4; g.lineJoin = 'round';
    g.beginPath(); b.pfad.forEach(([x, y], i) => { const px = ox + (x + 0.5) * s, py = oy + (y + 0.5) * s; if (i) g.lineTo(px, py); else g.moveTo(px, py); }); g.stroke();
  }
  g.textBaseline = 'alphabetic';
}
