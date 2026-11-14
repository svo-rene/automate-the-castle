'use strict';
// --- 🐎 Poststation: LK Datenstrukturen (Burg 24, Lehrplan LB 2/3 Teil 2, OPAL-Kurs LK_INF_LB2_3 „Datenstrukturen und Komplexität“) ---
// Code-Stil wie im Kurs: Node (data/next bzw. value/left/right), LinkedList.head, Queue.enqueue/dequeue, BinaryTree.insert,
// Graph als Dictionary mit Nachbarlisten, Dijkstra mit dist/fertig/vorgaenger, Backtracking mit Rücknahme (del).
// Kapitel: Listen, Stapel, Schlange → Bäume → Graphen → Kürzeste Wege → Backtracking und Grenzen.
// Läuft auf dem Kornspeicher-Ablauf (kornspeicher.js) mit warte + weg: Prüfung über Testfunktionen _t1() … im vorspann
// bzw. über aufrufFn; Bilder (Baum, Graph, Kette, Brett) als SVG in der Ansicht „tabelle“.

KAPITEL[60] = { name: 'Listen, Stapel, Schlange', ico: '⛓️' };
KAPITEL[61] = { name: 'Bäume', ico: '🌳' };
KAPITEL[62] = { name: 'Graphen', ico: '🕸️' };
KAPITEL[63] = { name: 'Kürzeste Wege', ico: '🧭' };
KAPITEL[64] = { name: 'Backtracking und Grenzen', ico: '🔙' };
BURGEN[24] = { name: 'LK Datenstrukturen', ico: '🐎', klasse: 'LK', region: 'handel', kapitel: [60, 61, 62, 63, 64],
  text: 'Leistungskurs: verkettete Liste, Stapel und Schlange, Binärbaum und Suchbaum mit Traversierung, Graphen mit Breiten- und Tiefensuche, Dijkstra, Backtracking und Grenzen der Berechenbarkeit.' };

const S_DS = [...S_LK, 'klasse', 'del'];
const POST = (a) => KORN({ warte: true, weg: true, zielArt: 'wert', funktion: null, sprache: S_DS, ...a });
const PFRAGEN = (a) => POST({ sortArt: 'fragen', listen: [], ...a });
const dsBild = (html) => `<div class="werkbild dsbild">${html}</div>`;
const py = (x) => JSON.stringify(x).replace(/,/g, ', ').replace(/":/g, '": ').replace(/\bnull\b/g, 'None').replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False');

// ---------------------------------------------------------------------------------------------------------
// Bilder: Baum, Graph, Kette, Damenbrett (SVG, passt sich der Breite an)
function svgBaum(t, opt = {}) {
  if (!t) return '<p class="hinweis">(leerer Baum: root ist None)</p>';
  const knoten = [];
  let x = 0;
  // binär: [wert, links, rechts], x nach Inorder · allgemein (opt.allg): [wert, [kinder]], Eltern über der Mitte ihrer Kinder
  const bin = (n, d) => { if (!n) return null; const l = bin(n[1], d + 1), k = { w: n[0], x: x++, d }; const r = bin(n[2], d + 1); k.kinder = [l, r].filter(Boolean); knoten.push(k); return k; };
  const allg = (n, d) => { const kinder = (n[1] || []).map((c) => allg(c, d + 1)); const k = { w: n[0], d, kinder, x: kinder.length ? (kinder[0].x + kinder.at(-1).x) / 2 : x++ }; knoten.push(k); return k; };
  if (opt.allg) allg(t, 0); else bin(t, 0);
  const tief = Math.max(...knoten.map((k) => k.d)), dx = 44, dy = 52, W = Math.max(1, x) * dx + 12, Hh = (tief + 1) * dy + 8;
  const px = (k) => 6 + dx / 2 + k.x * dx, pyy = (k) => 24 + k.d * dy;
  let s = '';
  for (const k of knoten) for (const c of k.kinder) s += `<line x1="${px(k)}" y1="${pyy(k)}" x2="${px(c)}" y2="${pyy(c)}" stroke="#7a5a3a" stroke-width="2"/>`;
  for (const k of knoten) {
    const f = opt.farbe?.[k.w] || (k.kinder.length ? '#f3e2b8' : '#d8efc4');
    s += `<circle cx="${px(k)}" cy="${pyy(k)}" r="16" fill="${f}" stroke="#5a3a1f" stroke-width="2"/><text x="${px(k)}" y="${pyy(k) + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#2a1a0a">${esc(String(k.w))}</text>`;
    if (opt.mark?.[k.w] != null) s += `<circle cx="${px(k) + 14}" cy="${pyy(k) - 14}" r="9" fill="#ffd84a" stroke="#6b4a10"/><text x="${px(k) + 14}" y="${pyy(k) - 10}" text-anchor="middle" font-size="11" font-weight="700" fill="#2a1a0a">${opt.mark[k.w]}</text>`;
  }
  return `<svg class="dssvg" viewBox="0 0 ${W} ${Hh}" style="max-width:${W * 1.4}px">${s}</svg>`;
}
// Graph: g = { pos: {A: [x, y]} (0–100), kanten: [[a, b, gewicht?]], gerichtet }
function svgGraph(g, opt = {}) {
  const W = 360, Hh = 220, P = (n) => [20 + g.pos[n][0] * 3.2, 18 + g.pos[n][1] * 1.84];
  const weg = new Set((opt.weg || []).slice(1).map((n, i) => `${opt.weg[i]}|${n}`));
  let s = `<defs><marker id="dsPfeil" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5a3a1f"/></marker></defs>`;
  for (const [a, b, w] of g.kanten) {
    const [x1, y1] = P(a), [x2, y2] = P(b), l = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / l, uy = (y2 - y1) / l;
    const an = weg.has(`${a}|${b}`) || weg.has(`${b}|${a}`);
    s += `<line x1="${x1 + ux * 16}" y1="${y1 + uy * 16}" x2="${x2 - ux * 17}" y2="${y2 - uy * 17}" stroke="${an ? '#e0a020' : '#9a8060'}" stroke-width="${an ? 5 : 2.5}" ${g.gerichtet ? 'marker-end="url(#dsPfeil)"' : ''}/>`;
    if (w != null) { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; s += `<rect x="${mx - 10}" y="${my - 9}" width="20" height="17" rx="4" fill="#fff8e6" stroke="#9a8060"/><text x="${mx}" y="${my + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#5a3a1f">${w}</text>`; }
  }
  for (const n of Object.keys(g.pos)) {
    const [x, y] = P(n), f = opt.farbe?.[n] || '#f3e2b8', kurz = n.length > 2;
    s += `<circle cx="${x}" cy="${y}" r="${kurz ? 18 : 15}" fill="${f}" stroke="#5a3a1f" stroke-width="2"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="${kurz ? 9.5 : 13}" font-weight="700" fill="#2a1a0a">${esc(n)}</text>`;
    if (opt.mark?.[n] != null) s += `<circle cx="${x + 15}" cy="${y - 15}" r="9" fill="#ffd84a" stroke="#6b4a10"/><text x="${x + 15}" y="${y - 11}" text-anchor="middle" font-size="11" font-weight="700" fill="#2a1a0a">${opt.mark[n]}</text>`;
    if (opt.dist?.[n] !== undefined) s += `<rect x="${x - 27}" y="${y + 8}" width="20" height="15" rx="7" fill="#2f8a3a" stroke="#1a4a1f"/><text x="${x - 17}" y="${y + 19}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${opt.dist[n] === null ? '∞' : opt.dist[n]}</text>`;
  }
  return `<svg class="dssvg" viewBox="0 0 ${W} ${Hh}" style="max-width:${W * 1.5}px">${s}</svg>`;
}
const kantenAus = (graph, gewichtet = false) => {
  const k = [], da = new Set();
  for (const a of Object.keys(graph)) for (const b of (gewichtet ? Object.keys(graph[a]) : graph[a])) {
    if (da.has(`${b}|${a}`)) continue;
    da.add(`${a}|${b}`); k.push([a, b, gewichtet ? graph[a][b] : null]);
  }
  return k;
};
// Verkettete Liste als Kette: head → [3|•] → [7|•] → [9|None]
const svgKette = (werte, kopf = 'head') => `<div class="dskette"><span class="dskopf">${kopf}</span>${werte.length ? werte.map((w, i) => `<span class="dspfeil">→</span><span class="dsknoten"><b>${esc(String(w))}</b><i>${i < werte.length - 1 ? '•' : 'None'}</i></span>`).join('') : '<span class="dspfeil">→</span><span class="hinweis">None</span>'}</div>`;
function svgBrett(spalten) {
  const n = spalten.length, a = 30;
  let s = '';
  for (let z = 0; z < n; z++) for (let c = 0; c < n; c++) {
    s += `<rect x="${c * a}" y="${z * a}" width="${a}" height="${a}" fill="${(z + c) % 2 ? '#a8743e' : '#f1dfb8'}"/>`;
    if (spalten[z] === c) s += `<text x="${c * a + a / 2}" y="${z * a + a * 0.72}" text-anchor="middle" font-size="${a * 0.7}">🛡️</text>`;
  }
  return `<svg class="dssvg" viewBox="0 0 ${n * a} ${n * a}" style="max-width:${n * a * 1.6}px">${s}</svg>`;
}

// ---------------------------------------------------------------------------------------------------------
// Daten und Referenz in JS (für die richtigen Ergebnisse)
const bstNested = (werte) => {
  let root = null;
  const ein = (n, v) => { if (!n) return [v, null, null]; if (v < n[0]) n[1] = ein(n[1], v); else if (v > n[0]) n[2] = ein(n[2], v); return n; };
  for (const v of werte) root = ein(root, v);
  return root;
};
const trav = (n, art) => (!n ? [] : art === 'pre' ? [n[0], ...trav(n[1], art), ...trav(n[2], art)]
  : art === 'in' ? [...trav(n[1], art), n[0], ...trav(n[2], art)] : [...trav(n[1], art), ...trav(n[2], art), n[0]]);
const baumHoehe = (n) => (n ? 1 + Math.max(baumHoehe(n[1]), baumHoehe(n[2])) : -1);
function jsBfs(g, s) { const v = [s], q = [s]; while (q.length) { const u = q.shift(); for (const n of g[u]) if (!v.includes(n)) { v.push(n); q.push(n); } } return v; }
function jsDfs(g, s, v = []) { v.push(s); for (const n of g[s]) if (!v.includes(n)) jsDfs(g, n, v); return v; }
function jsEntf(g, s, z) { const d = { [s]: 0 }, q = [s]; while (q.length) { const u = q.shift(); for (const n of g[u]) if (!(n in d)) { d[n] = d[u] + 1; q.push(n); } } return z in d ? d[z] : -1; }
function jsDijkstra(g, s) {
  const dist = {}, fertig = [], vor = { [s]: null };
  for (const k of Object.keys(g)) dist[k] = Infinity;
  dist[s] = 0;
  while (fertig.length < Object.keys(g).length) {
    let u = null;
    for (const k of Object.keys(g)) if (!fertig.includes(k) && (u === null || dist[k] < dist[u])) u = k;
    fertig.push(u);
    for (const v of Object.keys(g[u])) if (!fertig.includes(v) && dist[u] + g[u][v] < dist[v]) { dist[v] = dist[u] + g[u][v]; vor[v] = u; }
  }
  const plain = {};
  for (const k of Object.keys(dist)) plain[k] = dist[k] === Infinity ? null : dist[k];
  return { dist: plain, fertig, vor };
}
const jsWeg = (vor, z) => { const p = []; let k = z; if (!(z in vor)) return []; while (k != null) { p.unshift(k); k = vor[k]; } return p; };
const jsMatrix = (g) => { const k = Object.keys(g).sort(); return k.map((a) => k.map((b) => (g[a].includes(b) ? 1 : 0))); };

// Straßennetze (ungerichtet, Nachbarlisten wie im Kurs) mit Lage für das Bild
const G1 = { A: ['B', 'C'], B: ['A', 'D', 'E'], C: ['A', 'F'], D: ['B'], E: ['B', 'F'], F: ['C', 'E'] };
const G1_POS = { A: [4, 50], B: [36, 18], C: [36, 84], D: [68, 4], E: [68, 50], F: [96, 84] };
const G2 = { S: ['A', 'B'], A: ['S', 'C'], B: ['S', 'C', 'D'], C: ['A', 'B', 'Z'], D: ['B', 'Z'], Z: ['C', 'D'], X: ['Y'], Y: ['X'] };
const G2_POS = { S: [2, 50], A: [28, 14], B: [28, 86], C: [58, 46], D: [58, 96], Z: [88, 70], X: [78, 4], Y: [98, 26] };
const G3 = { A: ['B', 'D'], B: ['A', 'C', 'E'], C: ['B', 'F'], D: ['A', 'E'], E: ['B', 'D', 'F'], F: ['C', 'E'] };
const G3_POS = { A: [6, 20], B: [50, 20], C: [94, 20], D: [6, 80], E: [50, 80], F: [94, 80] };
const GR = (g, pos, gerichtet = false) => ({ pos, kanten: kantenAus(g), gerichtet });
// gewichtete Netze (Dictionary von Dictionaries wie im Kurs: graph[u][v] = Gewicht)
const W1 = { S: { A: 7, B: 3 }, A: { S: 7, B: 2, Z: 1 }, B: { S: 3, A: 2, C: 8 }, C: { B: 8, Z: 2 }, Z: { A: 1, C: 2 } };
const W1_POS = { S: [2, 50], A: [40, 6], B: [40, 94], C: [94, 94], Z: [94, 30] };
const W2 = { Burg: { Turm: 4, Wald: 2 }, Turm: { Burg: 4, Wald: 1, See: 5 }, Wald: { Burg: 2, Turm: 1, Hof: 8, See: 10 }, Hof: { Wald: 8, See: 2, Markt: 6 },
  See: { Turm: 5, Wald: 10, Hof: 2, Markt: 3 }, Markt: { Hof: 6, See: 3 }, Insel: {} };
const W2_POS = { Burg: [2, 50], Turm: [32, 8], Wald: [30, 90], See: [62, 36], Hof: [62, 96], Markt: [96, 66], Insel: [94, 4] };
const W3 = { A: { B: 4, C: 1 }, B: { D: 1 }, C: { B: 2, D: 5 }, D: {} };
const W3_POS = { A: [4, 50], B: [50, 6], C: [50, 94], D: [96, 50] };
const WG = (g, pos, gerichtet = false) => ({ pos, kanten: gerichtet ? Object.keys(g).flatMap((a) => Object.keys(g[a]).map((b) => [a, b, g[a][b]])) : kantenAus(g, true), gerichtet });
// Königreich mit sechs Provinzen um die Mitte und einer Insel (braucht vier Farben)
const REICH = { Mitte: ['Nord', 'Ost', 'Süd', 'West', 'Hafen'], Nord: ['Mitte', 'Ost', 'Hafen'], Ost: ['Mitte', 'Nord', 'Süd'], Süd: ['Mitte', 'Ost', 'West'],
  West: ['Mitte', 'Süd', 'Hafen'], Hafen: ['Mitte', 'West', 'Nord'], Insel: [] };
const REICH_POS = { Mitte: [50, 50], Nord: [50, 4], Ost: [88, 36], Süd: [74, 96], West: [26, 96], Hafen: [12, 36], Insel: [96, 90] };
const FARBE_CSS = { rot: '#e07a6a', gelb: '#f4d35e', blau: '#7ab0e0', 'grün': '#8fd17a' };

const BAUM_WERTE = [8, 3, 10, 1, 6, 14, 4, 7, 13];
const BAUM_T = bstNested(BAUM_WERTE);
const V_NODE_BIN = `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def _baum(n):
    if n is None:
        return None
    return [n.value, _baum(n.left), _baum(n.right)]

def _einfuegen(n, v):
    if n is None:
        return Node(v)
    if v < n.value:
        n.left = _einfuegen(n.left, v)
    elif v > n.value:
        n.right = _einfuegen(n.right, v)
    return n

def _bauen(werte):
    root = None
    for v in werte:
        root = _einfuegen(root, v)
    return root
`;
// Schlange mit Knoten wie im Kurs (queue_knoten.py: private __head/__tail, peek)
const V_QUEUE = `class _Glied:
    def __init__(self, data):
        self.data = data
        self.next = None

class Queue:
    def __init__(self):
        self.__head = None
        self.__tail = None

    def enqueue(self, item):
        k = _Glied(item)
        if self.__tail is None:
            self.__head = k
        else:
            self.__tail.next = k
        self.__tail = k

    def dequeue(self):
        if self.__head is None:
            return None
        item = self.__head.data
        self.__head = self.__head.next
        if self.__head is None:
            self.__tail = None
        return item

    def peek(self):
        if self.__head is None:
            return None
        return self.__head.data

    def is_empty(self):
        return self.__head is None
`;
const V_GRAPHEN = `G1 = ${py(G1)}\nG2 = ${py(G2)}\nG3 = ${py(G3)}\n`;
const V_GEWICHTET = `W1 = ${py(W1)}\nW2 = ${py(W2)}\nW3 = ${py(W3)}\n`;

const C_DIJKSTRA = `def dijkstra(graph, start):
    dist = {}
    for k in graph:
        dist[k] = float("inf")
    dist[start] = 0
    fertig = []
    vorgaenger = {start: None}
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
                dist[v] = dist[u] + w
                vorgaenger[v] = u
    return dist, fertig, vorgaenger`;

// Tests mit eigener Prüfung: soll vergleicht nur die Schlüssel, die es nennt (gleichWert)
const BST_TESTS = [BAUM_WERTE, [5, 5, 3, 7, 3], [1, 2, 3, 4, 5]];
const BFS_TESTS = [['G1', 'A', G1], ['G2', 'S', G2], ['G3', 'A', G3], ['G2', 'X', G2]];
const ENTF_TESTS = [['G2', 'S', 'Z', G2], ['G1', 'A', 'F', G1], ['G2', 'S', 'S', G2], ['G2', 'S', 'X', G2], ['G3', 'C', 'D', G3]];
const DIJ_TESTS = [['W1', 'S', W1], ['W2', 'Burg', W2], ['W3', 'A', W3]];
const ROUTE_TESTS = [['W2', 'Burg', 'Markt', W2], ['W1', 'S', 'Z', W1], ['W2', 'Burg', 'Insel', W2], ['W3', 'A', 'D', W3]];
const MATRIX_TESTS = [{ A: ['B', 'C'], B: ['A'], C: ['A'] }, G1, { A: ['B'], B: ['C'], C: ['A', 'D'], D: [] }];
const RECHEN = [['*', ['+', [3], [4]], [2]], ['-', [10], ['*', [2], [3]]], [7], ['+', ['//', [8], [2]], ['*', [3], [5]]]];
const rechenPy = (n) => (n.length === 1 ? `Node(${n[0]})` : `_k("${n[0]}", ${rechenPy(n[1])}, ${rechenPy(n[2])})`);
const rechenBin = (n) => (n.length === 1 ? [n[0], null, null] : [n[0], rechenBin(n[1]), rechenBin(n[2])]);
const rechenWert = (n) => (n.length === 1 ? n[0] : { '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b, '//': (a, b) => Math.floor(a / b) }[n[0]](rechenWert(n[1]), rechenWert(n[2])));

// Prüfbäume für „Ist das ein Suchbaum?“ (db3t): [Name, Baum als [wert, links, rechts], Suchbaum?]
const psB = (v, l = null, r = null) => [v, l, r];
const PS_BAEUME = [['T', BAUM_T, true], ['LOKAL', psB(8, psB(10), psB(3)), false], ['FALLE', psB(8, psB(3, psB(1), psB(9)), psB(10)), false],
  ['RECHTS', psB(20, psB(10), psB(30, psB(18), psB(40))), false], ['GUT', psB(20, psB(10, psB(5), psB(15)), psB(30, psB(25), psB(40))), true], ['LEER', null, true]];
const psBaumPy = (t) => (t ? `_k(${t[0]}, ${psBaumPy(t[1])}, ${psBaumPy(t[2])})` : 'None');
// Dijkstra Runde für Runde (für die Abi-Tabelle dd1t): je Runde der fertige Knoten und Kopien von dist/vorgaenger
function psDijkstraRunden(g, s) {
  const dist = {}, fertig = [], vor = { [s]: null }, runden = [];
  for (const k of Object.keys(g)) dist[k] = Infinity;
  dist[s] = 0;
  while (fertig.length < Object.keys(g).length) {
    let u = null;
    for (const k of Object.keys(g)) if (!fertig.includes(k) && (u === null || dist[k] < dist[u])) u = k;
    fertig.push(u);
    for (const v of Object.keys(g[u])) if (!fertig.includes(v) && dist[u] + g[u][v] < dist[v]) { dist[v] = dist[u] + g[u][v]; vor[v] = u; }
    runden.push({ u, dist: { ...dist }, vor: { ...vor } });
  }
  return runden;
}
// neues Netz für die Dijkstra-Tabelle (dd1t)
const W4 = { S: { A: 4, B: 1 }, A: { S: 4, B: 2, C: 5 }, B: { S: 1, A: 2, D: 8 }, C: { A: 5, D: 2, Z: 3 }, D: { B: 8, C: 2, Z: 6 }, Z: { C: 3, D: 6 } };
const W4_POS = { S: [2, 50], A: [34, 6], B: [34, 94], C: [66, 6], D: [66, 94], Z: [98, 50] };
const PS_R4 = psDijkstraRunden(W4, 'S'), PS_K4 = ['A', 'B', 'C', 'D', 'Z'];
const psDistListe = (r) => PS_K4.map((k) => (r.dist[k] === Infinity ? 'x' : String(r.dist[k])));

HOEFE.push(
  // --- Kapitel 60: ⛓️ Listen, Stapel, Schlange (Kurs 3.0–3.3) ---
  PFRAGEN({ id: 'da1', kapitel: 60, ico: '📋', titel: 'Regal oder Kette?', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'Zwei Arten, Briefe aufzubewahren',
    tabelle: () => ({ html: dsBild(`<p><b>Array (Python-Liste)</b> – Fächer nebeneinander, jedes hat eine Nummer:</p>
      <div class="dsarray">${['Ada', 'Ben', 'Cem', 'Dua', 'Eli'].map((n, i) => `<span><i>${i}</i>${n}</span>`).join('')}</div>
      <p><b>Verkettete Liste</b> – jeder Brief zeigt auf den nächsten:</p>${svgKette(['Ada', 'Ben', 'Cem', 'Dua', 'Eli'])}`) }),
    ziel: 'Was geht im Regal schnell, was in der Kette?',
    story: 'Willkommen in der Poststation! Hier laufen alle Briefe, Boten und Wege des Königreichs zusammen. Wie man Daten ablegt, entscheidet, wie schnell man sie wiederfindet – das ist das Thema dieser Burg.',
    merke: { titel: '⛓️ Verkettete Liste', text: 'Ein Array legt die Elemente nebeneinander ab: Zugriff über den Index in O(1), aber Einfügen vorn schiebt alle anderen weiter (O(n)). Eine verkettete Liste besteht aus Knoten (data, next); vorn einfügen geht in O(1), dafür muss man zum k-ten Element hinlaufen (O(n)).', code: 'class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None' },
    fragen: [W('Ein neuer Brief soll VORN ins Array. Was passiert?', ['nur ein Fach wird beschrieben – O(1)', 'alle anderen Briefe rücken ein Fach weiter – O(n)', 'das Array wird erst sortiert – O(n · log n)', 'gar nichts'], 1),
      W('Ein neuer Brief soll vorn in die verkettete Liste. Was ist nötig?', ['alle Knoten um eine Stelle nach hinten verschieben – O(n)', 'neuer Knoten zeigt auf den alten Kopf, head zeigt auf den neuen – O(1)', 'die ganze Liste mit dem neuen Knoten neu aufbauen – O(n)', 'das geht nicht'], 1),
      W('Du brauchst den 500. Brief. Wo geht das schneller?', ['im Array: a[499] in O(1)', 'in der verketteten Liste', 'beides gleich', 'in keinem'], 0),
      W('Was bedeutet next = None beim letzten Knoten?', ['der Knoten ist leer', 'danach kommt kein Knoten mehr – hier endet die Liste', 'der Knoten ist kaputt', 'der Wert ist 0'], 1),
      W('Was braucht eine verkettete Liste zusätzlich an Speicher?', ['nichts', 'in jedem Knoten den Verweis auf den nächsten', 'eine zweite Kopie aller gespeicherten Werte', 'einen Index je Knoten'], 1)],
    tipps: ['Array: Fächer mit Nummern. Kette: jeder kennt nur seinen Nachfolger.'] }),
  POST({ id: 'da2', kapitel: 60, sortArt: 'funktion', ico: '⛓️', titel: 'Die Briefkette', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Verkettete Liste',
    tabelle: (lauf) => ({ html: dsBild(`${Array.isArray(lauf?.wert) ? '<p class="hinweis">Deine Liste nach dem Test:</p>' + svgKette(lauf.wert) : svgKette([3, 7, 9])}
      <p class="hinweis">insert_at_start(0): neuer Knoten → alter Kopf, head → neuer Knoten. delete(7): der Vorgänger zeigt am Knoten mit 7 vorbei.</p>`) }),
    ziel: 'Die Klasse LinkedList kann schon append und to_list. Ergänze insert_at_start(data) (vorn einfügen) und delete(data) (erstes Vorkommen aushängen; fehlt der Wert, passiert nichts).',
    vorspann: 'class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\n'
      + 'def _t1():\n    l = LinkedList()\n    for x in [1, 2, 3]:\n        l.append(x)\n    l.insert_at_start(0)\n    return l.to_list()\n\n'
      + 'def _t2():\n    l = LinkedList()\n    for x in [1, 2, 3]:\n        l.append(x)\n    l.delete(2)\n    return l.to_list()\n\n'
      + 'def _t3():\n    l = LinkedList()\n    for x in [1, 2, 1]:\n        l.append(x)\n    l.delete(1)\n    return l.to_list()\n\n'
      + 'def _t4():\n    l = LinkedList()\n    l.delete(5)\n    l.insert_at_start(9)\n    l.delete(9)\n    l.delete(9)\n    return l.to_list()\n',
    ...tests([[0, 1, 2, 3], [1, 3], [2, 1], []]), testName: (k) => ['insert_at_start', 'delete in der Mitte', 'delete am Kopf', 'leere Liste'][k],
    vorlage: `class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if self.head is None:
            self.head = new_node
            return
        current = self.head
        while current.next is not None:
            current = current.next
        current.next = new_node

    def to_list(self):
        werte = []
        current = self.head
        while current is not None:
            werte.append(current.data)
            current = current.next
        return werte

    def insert_at_start(self, data):
        pass   # neuer Knoten wird der Kopf

    def delete(self, data):
        pass   # erstes Vorkommen aushängen`,
    befehle: [K_B('Node(¦)'), K_B('while ¦ is not None:')],
    tipps: ['insert_at_start: new_node = Node(data), new_node.next = self.head, self.head = new_node', 'delete: Ist die Liste leer, return. Steht der Wert im Kopf: self.head = self.head.next', 'Sonst mit current laufen, solange current.next nicht None ist; passt current.next.data, dann current.next = current.next.next und return.'],
    loesung: `class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if self.head is None:
            self.head = new_node
            return
        current = self.head
        while current.next is not None:
            current = current.next
        current.next = new_node

    def to_list(self):
        werte = []
        current = self.head
        while current is not None:
            werte.append(current.data)
            current = current.next
        return werte

    def insert_at_start(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def delete(self, data):
        if self.head is None:
            return
        if self.head.data == data:
            self.head = self.head.next
            return
        current = self.head
        while current.next is not None:
            if current.next.data == data:
                current.next = current.next.next
                return
            current = current.next` }),
  POST({ id: 'da2v', kapitel: 60, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🔮', titel: 'Stapel und Schlange', lohn: 65,
    ziel: 'Briefe kommen auf einen Stapel und Boten stellen sich in eine Schlange. Sag voraus, was herauskommt.',
    listen: [[]], code: `class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        return self.items.pop()

class ListenQueue:
    def __init__(self):
        self.items = []

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        return self.items.pop(0)

def versuch():
    s = Stack()
    q = ListenQueue()
    for x in ["A", "B", "C", "D"]:
        s.push(x)
        q.enqueue(x)
    s.pop()
    q.dequeue()
    s.push("E")
    q.enqueue("E")
    return [s.pop(), s.pop(), q.dequeue(), q.dequeue()]`,
    fragen: [{ art: 'liste', text: 'Welche vier Buchstaben gibt versuch() zurück? (z. B. A B C D)', soll: (l) => l.wert },
      W('Der Stapel arbeitet nach …', ['FIFO – wer zuerst kommt, geht zuerst', 'LIFO – was zuletzt kam, geht zuerst', 'nach dem Alphabet', 'zufällig'], 1),
      W('Warum ist dequeue mit pop(0) bei langen Schlangen langsam?', ['pop(0) ist verboten', 'alle übrigen Elemente rücken ein Fach nach vorn – O(n)', 'die Schlange wird bei jedem pop(0) neu sortiert – O(n · log n)', 'es ist nicht langsam'], 1)],
    tipps: ['Stapel: oben = Ende der Liste. Schlange: vorn = Index 0.', 'Nach den vier push liegt D oben, vorn in der Schlange steht A.'] }),
  POST({ id: 'da3', kapitel: 60, sortArt: 'funktion', ico: '🚪', titel: 'Schlange aus Knoten', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Queue mit Knoten',
    tabelle: () => ({ html: dsBild(`${uml('Queue', ['− __head: Node', '− __tail: Node'], ['+ enqueue(item)', '+ dequeue()', '+ peek()', '+ is_empty(): bool'])}
      <div class="dskette"><span class="dskopf">__head</span><span class="dspfeil">→</span><span class="dsknoten"><b>Ratte</b><i>•</i></span><span class="dspfeil">→</span><span class="dsknoten"><b>Ork</b><i>•</i></span><span class="dspfeil">→</span><span class="dsknoten"><b>Troll</b><i>None</i></span><span class="dspfeil">←</span><span class="dskopf">__tail</span></div>
      <p class="hinweis">Mit __head UND __tail geht enqueue (hinten an) und dequeue (vorn weg) in O(1) – ohne dass etwas nachrückt.</p>`) }),
    ziel: 'Schreib die Klasse Queue mit verketteten Knoten wie im Kurs: Das private Attribut __head zeigt auf den vordersten, __tail auf den letzten Knoten. dequeue() und peek() geben bei leerer Schlange None zurück; peek() schaut nur nach, ohne zu entnehmen. Die Klasse Node (data, next) gibt es schon.',
    vorspann: 'class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\n'
      + 'def _t1():\n    q = Queue()\n    for x in [1, 2, 3]:\n        q.enqueue(x)\n    return [q.dequeue(), q.dequeue(), q.is_empty()]\n\n'
      + 'def _t2():\n    q = Queue()\n    a = q.dequeue()\n    q.enqueue("X")\n    b = q.dequeue()\n    return [a, b, q.is_empty(), q.dequeue(), q.peek()]\n\n'
      + 'def _t3():\n    q = Queue()\n    for x in [1, 2, 3, 4, 5]:\n        q.enqueue(x)\n    q.dequeue()\n    q.dequeue()\n    q.enqueue(6)\n    vorn = q.peek()\n    rest = []\n    while not q.is_empty():\n        rest.append(q.dequeue())\n    q.enqueue(7)\n    return [vorn, rest, q.dequeue()]\n\n'
      + 'def _t4():\n    q = Queue()\n    q.enqueue(7)\n    if not hasattr(q, "_Queue__head") or hasattr(q, "head"):\n        return ["head und tail sollen privat sein: self.__head und self.__tail"]\n    k = q._Queue__head\n    return [isinstance(k, Node), k is q._Queue__tail, k.data, q.peek(), q.dequeue(), q.peek()]\n',
    ...tests([[1, 2, false], [null, 'X', true, null, null], [3, [3, 4, 5, 6], 7], [true, true, 7, 7, 7, null]]), testName: (k) => ['Reihenfolge', 'leere Schlange', 'peek, leeren und wieder füllen', 'privat und aus Knoten?'][k],
    befehle: [K_B('class Queue:'), K_B('self.__tail = None'), K_B('def enqueue(self, item):'), K_B('def dequeue(self):'), K_B('def peek(self):')],
    merke: { titel: '🚪 Stapel und Schlange', text: 'Stapel (Stack, LIFO): push legt oben auf, pop nimmt oben weg – Rückgängig, Aufrufstapel. Schlange (Queue, FIFO): enqueue hinten an, dequeue vorn weg – Warteschlangen, Breitensuche. peek schaut nur nach, ohne zu entnehmen. Mit Knoten und den Zeigern __head und __tail gehen beide Operationen der Schlange in O(1).' },
    tipps: ['enqueue: neuer Knoten; ist die Schlange leer, zeigen __head und __tail auf ihn, sonst __tail.next = neu und __tail = neu.', 'dequeue: Wert von __head merken, __head = __head.next. Wird __head dabei None, muss auch __tail None werden!', 'peek: wie dequeue, aber ohne __head weiterzusetzen.'],
    loesung: `class Queue:
    def __init__(self):
        self.__head = None
        self.__tail = None

    def enqueue(self, item):
        neu = Node(item)
        if self.__tail is None:
            self.__head = neu
        else:
            self.__tail.next = neu
        self.__tail = neu

    def dequeue(self):
        if self.__head is None:
            return None
        item = self.__head.data
        self.__head = self.__head.next
        if self.__head is None:
            self.__tail = None
        return item

    def peek(self):
        if self.__head is None:
            return None
        return self.__head.data

    def is_empty(self):
        return self.__head is None` }),
  // Stapel selbst bauen (Didaktik-Prüfung: Stack nie selbst gebaut) – danach anwenden: Klammerprüfung
  POST({ id: 'da3s', kapitel: 60, sortArt: 'funktion', ico: '🥞', titel: 'Stapel aus Knoten', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Stack mit Knoten',
    tabelle: () => ({ html: dsBild(`${uml('Stack', ['− __top: Node'], ['+ push(item)', '+ pop()', '+ peek()', '+ is_empty(): bool'])}
      ${svgKette(['Brief C', 'Brief B', 'Brief A'], '__top')}
      <p class="hinweis">Oben liegt der zuletzt aufgelegte Brief. Klammerprüfung: „{a[b(c)]d}“ ist richtig geschachtelt, „[(a+b]*c)“ nicht – das „]“ passt nicht zur zuletzt geöffneten „(“.</p>`) }),
    ziel: 'Schreib die Klasse Stack mit Knoten: Das private Attribut __top zeigt auf den obersten Knoten (None = leer). push(item) legt oben auf, pop() nimmt oben weg und gibt den Wert zurück, peek() schaut nur nach (beide bei leerem Stapel None), is_empty(). Schreib danach klammern_ok(text) mit deinem Stack: True, wenn alle Klammern ( ) [ ] { } richtig paarweise geschachtelt sind.',
    merke: { titel: '🥞 Stapel aus Knoten', text: 'Ein Stapel braucht nur einen Verweis auf den obersten Knoten: push hängt einen neuen Knoten davor (wie insert_at_start), pop hängt den obersten ab – beides O(1). Typische Anwendung ist die Klammerprüfung: Jede schließende Klammer muss zur zuletzt geöffneten passen, und am Ende muss der Stapel leer sein.' },
    vorspann: 'class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\n'
      + 'def _t1():\n    s = Stack()\n    for x in [1, 2, 3]:\n        s.push(x)\n    return [s.pop(), s.peek(), s.pop(), s.pop(), s.pop(), s.is_empty()]\n\n'
      + 'def _t2():\n    s = Stack()\n    s.push("A")\n    s.push("B")\n    s.push("C")\n    s.pop()\n    if not hasattr(s, "_Stack__top") or hasattr(s, "items"):\n        return ["Der Stapel soll aus Knoten bestehen: self.__top zeigt auf den obersten Node"]\n    k = s._Stack__top\n    if not isinstance(k, Node) or k.data != "B":\n        return ["Nach push A, B, C und einem pop() muss __top auf den Knoten mit B zeigen – pop() muss __top weiterschieben"]\n    erg = [k.data, k.next.data, k.next.next is None]\n    s.pop()\n    erg.append(s._Stack__top.data)\n    s.pop()\n    erg.append(s._Stack__top is None)\n    return erg\n\n'
      + 'def _t3():\n    erg = []\n    for t in ["{a[b(c)]d}", "[(a+b]*c)", "(x+y))(", "((a)", "", "a+(b*[c-d])"]:\n        erg.append(klammern_ok(t))\n    return erg\n',
    ...tests([[3, 2, 2, 1, null, true], ['B', 'A', true, 'A', true], [true, false, false, false, true, true]]), testName: (k) => ['push, pop, peek', 'aus Knoten – auch nach pop()?', 'Klammern prüfen'][k],
    befehle: [K_B('class Stack:'), K_B('self.__top = None'), K_B('def klammern_ok(text):')],
    tipps: ['push: neu = Node(item), neu.next = self.__top, self.__top = neu – wie insert_at_start.', 'pop: leer → None. Sonst Wert von __top merken und __top = __top.next.', 'klammern_ok: öffnende Klammer → push. Schließende → ist der Stapel leer oder passt pop() nicht zu paare[zeichen], return False. Am Ende: return s.is_empty().'],
    loesung: `class Stack:
    def __init__(self):
        self.__top = None

    def push(self, item):
        neu = Node(item)
        neu.next = self.__top
        self.__top = neu

    def pop(self):
        if self.__top is None:
            return None
        item = self.__top.data
        self.__top = self.__top.next
        return item

    def peek(self):
        if self.__top is None:
            return None
        return self.__top.data

    def is_empty(self):
        return self.__top is None

def klammern_ok(text):
    paare = {")": "(", "]": "[", "}": "{"}
    s = Stack()
    for zeichen in text:
        if zeichen in "([{":
            s.push(zeichen)
        elif zeichen in paare:
            if s.is_empty() or s.pop() != paare[zeichen]:
                return False
    return s.is_empty()` }),
  PFRAGEN({ id: 'da4', kapitel: 60, ico: '🧺', titel: 'Welche Struktur passt?', lohn: 60,
    ziel: 'Stapel, Schlange oder verkettete Liste – was passt zu welcher Aufgabe?',
    fragen: [W('Der Knopf „Rückgängig“ im Zeichenprogramm macht den letzten Schritt zuerst rückgängig.', ['Stapel', 'Schlange', 'Array mit Index'], 0),
      W('Der Drucker der Schule druckt Aufträge in der Reihenfolge, in der sie ankommen.', ['Stapel', 'Schlange', 'Suchbaum'], 1),
      W('Der Zurück-Knopf im Browser führt zur zuletzt besuchten Seite.', ['Stapel', 'Schlange', 'Graph'], 0),
      W('Bei einer rekursiven Funktion warten die offenen Aufrufe auf …', ['eine Schlange', 'den Aufrufstapel', 'ein Array', 'einen Baum'], 1),
      W('Die Breitensuche besucht erst alle Nachbarn, dann deren Nachbarn. Sie merkt sich die nächsten Knoten in …', ['einem Stapel', 'einer Schlange', 'einem Suchbaum', 'gar nichts'], 1),
      W('Eine Klammer „)“ muss zur zuletzt geöffneten passen. Dafür nimmt man …', ['einen Stapel', 'eine Schlange', 'eine Tabelle', 'einen Graphen'], 0)],
    tipps: ['„Das Letzte zuerst“ → Stapel. „Wer zuerst kommt …“ → Schlange.'] }),

  // --- Kapitel 61: 🌳 Bäume (Kurs 3.4–3.6) ---
  PFRAGEN({ id: 'db1', kapitel: 61, ico: '🌳', titel: 'Der Botenbaum', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Wer gibt Briefe an wen weiter?',
    tabelle: () => ({ html: dsBild(svgBaum(['A', [['B', [['E'], ['F', [['I']]]]], ['C'], ['D', [['G'], ['H']]]]], { allg: true })) }),
    ziel: 'Die Hauptpost A verteilt die Briefe über Stationen weiter. Lies den Baum.',
    merke: { titel: '🌳 Bäume', text: 'Ein Baum besteht aus Knoten und Kanten, hat genau eine Wurzel und keine Zyklen; jeder Knoten außer der Wurzel hat genau einen Elternknoten. Knoten ohne Kinder heißen Blätter. Die Höhe ist die Zahl der Kanten auf dem längsten Weg von der Wurzel zu einem Blatt.', code: 'class TreeNode:\n    def __init__(self, value):\n        self.value = value\n        self.children = []' },
    fragen: [W('Welcher Knoten ist die Wurzel?', ['A', 'I', 'D', 'es gibt keine'], 0),
      { art: 'zahl', text: 'Wie viele Blätter hat der Baum?', soll: () => 5 },
      { art: 'zahl', text: 'Wie hoch ist der Baum (Kanten auf dem längsten Weg von der Wurzel)?', soll: () => 3 },
      W('Wer ist der Elternknoten von I?', ['B', 'F', 'A', 'E'], 1),
      { art: 'liste', text: 'Tiefensuche ab A (erst ganz in die Tiefe, Kinder von links nach rechts): Reihenfolge?', soll: () => ['A', 'B', 'E', 'F', 'I', 'C', 'D', 'G', 'H'] },
      { art: 'liste', text: 'Breitensuche ab A (Ebene für Ebene): Reihenfolge?', soll: () => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] }],
    tipps: ['Blätter haben keine Kinder: zähl die grünen Knoten.', 'Tiefensuche: A, dann den ganzen Teilbaum von B, dann C, dann D …'] }),
  POST({ id: 'db2', kapitel: 61, sortArt: 'funktion', ico: '🗂️', titel: 'Das Sortierregal', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Binärer Suchbaum',
    tabelle: (lauf, k) => ({ html: dsBild(`${Array.isArray(lauf?.wert) ? `<p class="hinweis">Dein Baum nach Test ${k + 1} (Einfügen von ${BST_TESTS[k].join(', ')}):</p>${svgBaum(lauf.wert)}` : svgBaum(BAUM_T)}
      <p class="hinweis">Links steht nur Kleineres, rechts nur Größeres – im ganzen Teilbaum. Doppelte Werte werden nicht eingefügt.</p>`) }),
    ziel: 'Die Post sortiert Briefe nach Hausnummer in einen binären Suchbaum. Schreib die Klasse BinaryTree mit insert(value). Node (value, left, right) gibt es schon.',
    vorspann: V_NODE_BIN + BST_TESTS.map((w, i) => `\ndef _t${i + 1}():\n    t = BinaryTree()\n    for v in ${py(w)}:\n        t.insert(v)\n    return _baum(t.root)\n`).join(''),
    ...tests(BST_TESTS.map(bstNested)), testName: (k) => ['neun Briefe', 'doppelte Nummern', 'schon sortiert'][k],
    befehle: [K_B('class BinaryTree:'), K_B('self.root = None'), K_B('def insert(self, value):'), K_B('if ¦ < ¦:'), K_B('Node(¦)')],
    merke: { titel: '🗂️ Binärer Suchbaum', text: 'Im binären Suchbaum hat jeder Knoten höchstens zwei Kinder; im linken Teilbaum steht nur Kleineres, im rechten nur Größeres. Suchen und Einfügen laufen wie beim Zahlenraten von der Wurzel nach unten – bei einem ausgeglichenen Baum in O(log n). Werden die Werte sortiert eingefügt, entartet er zur Liste (O(n)).', code: 'if value < node.value:\n    if node.left is None:\n        node.left = Node(value)\n    else:\n        self.__insert_recursive(node.left, value)' },
    tipps: ['Ist root None, wird der neue Knoten die Wurzel.', 'Sonst ab der Wurzel: kleiner → links weiter, größer → rechts weiter. Ist dort None, kommt der neue Knoten hin.', 'Rekursiv mit einer Hilfsmethode __insert_recursive(self, node, value) – oder mit einer while-Schleife.'],
    loesung: `class BinaryTree:
    def __init__(self):
        self.root = None

    def insert(self, value):
        if self.root is None:
            self.root = Node(value)
        else:
            self.__insert_recursive(self.root, value)

    def __insert_recursive(self, node, value):
        if value < node.value:
            if node.left is None:
                node.left = Node(value)
            else:
                self.__insert_recursive(node.left, value)
        elif value > node.value:
            if node.right is None:
                node.right = Node(value)
            else:
                self.__insert_recursive(node.right, value)` }),
  POST({ id: 'db2v', kapitel: 61, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🔮', titel: 'Wie tief ist das Regal?', lohn: 70,
    ziel: 'Acht Hausnummern werden eingefügt. Zeichne den Baum auf einen Zettel und sag voraus, was herauskommt.',
    listen: [[]], vorspann: V_NODE_BIN + 'bauen = _bauen\n', code: `# bauen(werte) fügt die Zahlen der Reihe nach in einen Suchbaum ein
def hoehe(node):
    if node is None:
        return -1
    return 1 + max(hoehe(node.left), hoehe(node.right))

def vergleiche_bis(node, wert):
    n = 0
    while node is not None:
        n = n + 1
        if wert == node.value:
            return n
        if wert < node.value:
            node = node.left
        else:
            node = node.right
    return n

def versuch():
    root = bauen([50, 30, 70, 20, 40, 60, 80, 35])
    return [hoehe(root), vergleiche_bis(root, 35), vergleiche_bis(root, 65)]`,
    fragen: [{ art: 'zahl', text: 'Welche Höhe hat der Baum? (ein einzelner Knoten hat Höhe 0)', soll: (l) => l.wert[0] },
      { art: 'zahl', text: 'Wie viele Vergleiche braucht die Suche nach 35?', soll: (l) => l.wert[1] },
      { art: 'zahl', text: 'Und nach 65 (kommt nicht vor)?', soll: (l) => l.wert[2] },
      W('Dieselben Zahlen werden sortiert eingefügt (20, 30, 35, …, 80). Was passiert?', ['der Baum wird gleich hoch', 'jeder Knoten hängt rechts am vorigen – Höhe 7, Suchen wie in einer Liste', 'der Baum wird niedriger', 'Python meldet einen Fehler'], 1)],
    tipps: ['50 ist die Wurzel. 30 < 50 → links, 70 → rechts. 35: links von 50, rechts von 30, links von 40.', 'Die Suche nach 65 endet, wenn sie auf None trifft: 50 → 70 → 60 → (rechts: None).'] }),
  POST({ id: 'db3', kapitel: 61, sortArt: 'funktion', ico: '🚶', titel: 'Drei Rundgänge', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Traversierung',
    tabelle: (lauf, k) => {
      const ord = Array.isArray(lauf?.wert) ? lauf.wert : null, mark = {};
      (ord || []).forEach((v, i) => { mark[v] = i + 1; });
      return { html: dsBild(`${svgBaum(BAUM_T, { mark })}<p class="hinweis">${ord ? `Test ${k + 1}: die Zahlen zeigen deine Reihenfolge.` : 'Preorder: Knoten – links – rechts · Inorder: links – Knoten – rechts · Postorder: links – rechts – Knoten'}</p>`) };
    },
    ziel: 'Schreib drei rekursive Funktionen, die die Werte eines Baums als Liste zurückgeben: preorder(node), inorder(node), postorder(node). Für None kommt [] heraus.',
    vorspann: V_NODE_BIN + `T = _bauen(${py(BAUM_WERTE)})\n`,
    listen: [[], [], [], [], []], aufrufFn: (l, k) => ['preorder(T)', 'inorder(T)', 'postorder(T)', 'inorder(T.left)', 'preorder(None)'][k],
    soll: (l, k) => [trav(BAUM_T, 'pre'), trav(BAUM_T, 'in'), trav(BAUM_T, 'post'), trav(BAUM_T[1], 'in'), []][k], testName: (k) => ['preorder', 'inorder', 'postorder', 'linker Teilbaum', 'leerer Baum'][k],
    befehle: [K_B('def preorder(node):'), K_B('[node.value]')],
    merke: { titel: '🚶 Traversierung', text: 'Preorder (Knoten – links – rechts), Inorder (links – Knoten – rechts), Postorder (links – rechts – Knoten) besuchen jeden Knoten genau einmal, rekursiv. Inorder gibt die Werte eines Suchbaums aufsteigend sortiert aus; Postorder rechnet Rechenbäume aus.', code: '# dasselbe Muster: Knoten zählen\ndef anzahl(node):\n    if node is None:\n        return 0\n    return anzahl(node.left) + 1 + anzahl(node.right)' },
    tipps: ['Basisfall: node is None → return []', 'Listen kann man mit + aneinanderhängen: [1] + [2, 3] ergibt [1, 2, 3].', 'Die drei Funktionen unterscheiden sich nur darin, wo [node.value] steht.'],
    loesung: `def preorder(node):
    if node is None:
        return []
    return [node.value] + preorder(node.left) + preorder(node.right)

def inorder(node):
    if node is None:
        return []
    return inorder(node.left) + [node.value] + inorder(node.right)

def postorder(node):
    if node is None:
        return []
    return postorder(node.left) + postorder(node.right) + [node.value]` }),
  POST({ id: 'db4', kapitel: 61, sortArt: 'funktion', ico: '🔎', titel: 'Suchen und messen', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Binärer Suchbaum',
    tabelle: () => ({ html: dsBild(`${svgBaum(BAUM_T)}<p class="hinweis">Suche nach 7: 7 &lt; 8 → links, 7 &gt; 3 → rechts, 7 &gt; 6 → rechts – gefunden. Die anderen Teilbäume schaut man gar nicht an.</p>`) }),
    ziel: 'Schreib suche(node, wert) – True, wenn der Wert im Suchbaum steht – und hoehe(node): ein einzelner Knoten hat Höhe 0, der leere Baum −1. Nutze die Suchbaum-Regel: Es geht immer nur in EINEN Teilbaum weiter.',
    vorspann: V_NODE_BIN + `T = _bauen(${py(BAUM_WERTE)})\nKETTE = _bauen([1, 2, 3, 4, 5, 6])\n`,
    listen: [[], [], [], [], [], []], aufrufFn: (l, k) => ['suche(T, 7)', 'suche(T, 5)', 'suche(None, 1)', 'hoehe(T)', 'hoehe(KETTE)', 'hoehe(None)'][k],
    soll: (l, k) => [true, false, false, baumHoehe(BAUM_T), 5, -1][k], testName: (k) => ['7 suchen', '5 suchen (fehlt)', 'leerer Baum', 'Höhe', 'Höhe der Kette', 'Höhe von None'][k],
    befehle: [K_B('def suche(node, wert):'), K_B('def hoehe(node):'), K_B('max(¦, ¦)')],
    tipps: ['suche: None → False, gleich → True, kleiner → suche(node.left, wert), sonst rechts.', 'hoehe: None → -1, sonst 1 + die größere Höhe der beiden Teilbäume.', 'Ein Binärbaum der Höhe h hat höchstens 2^(h+1) − 1 Knoten – darum ist ein ausgeglichener Suchbaum so schnell.'],
    loesung: `def suche(node, wert):
    if node is None:
        return False
    if wert == node.value:
        return True
    if wert < node.value:
        return suche(node.left, wert)
    return suche(node.right, wert)

def hoehe(node):
    if node is None:
        return -1
    return 1 + max(hoehe(node.left), hoehe(node.right))` }),
  // Übertragen (Didaktik-Prüfung): die Suchbaum-Regel selbst prüfen – mit einem Fallen-Baum, der nur „im Kleinen“ stimmt
  POST({ id: 'db3t', kapitel: 61, sortArt: 'funktion', ico: '🧐', titel: 'Ist das ein Suchbaum?', lohn: 85, ansicht: 'tabelle', titelAnsicht: 'Prüfbäume',
    tabelle: (lauf, k) => { const t = PS_BAEUME[lauf ? k : 2];
      return { html: dsBild(`${svgBaum(t[1])}<p class="hinweis">${lauf ? `Test ${k + 1} (${t[0]}): ${ergebnisText(lauf.wert)}` : 'Jeder Elternknoten passt zu seinen Kindern – und trotzdem ist das kein Suchbaum. Findest du die 9?'}</p>`) }; },
    ziel: 'Ein Lehrling hat das Sortierregal von Hand umgebaut. Schreib ist_suchbaum(node): True, wenn der Baum ein binärer Suchbaum ist – im GANZEN linken Teilbaum nur Kleineres, im ganzen rechten nur Größeres. Der leere Baum ist ein Suchbaum.',
    vorspann: V_NODE_BIN + 'def _k(v, l=None, r=None):\n    n = Node(v)\n    n.left = l\n    n.right = r\n    return n\n\n' + PS_BAEUME.map(([name, t]) => `${name} = ${psBaumPy(t)}\n`).join(''),
    listen: PS_BAEUME.map(() => []), aufrufFn: (l, k) => `ist_suchbaum(${PS_BAEUME[k][0]})`, soll: (l, k) => PS_BAEUME[k][2],
    testName: (k) => ({ T: 'das Regal', LOKAL: 'falsch herum', FALLE: '9 links von 8', RECHTS: '18 rechts von 20', GUT: 'sauber', LEER: 'leerer Baum' })[PS_BAEUME[k][0]],
    befehle: [K_B('def ist_suchbaum(node):'), K_B('def pruefe(node, unten, oben):')],
    tipps: ['Nur Eltern mit ihren Kindern zu vergleichen reicht nicht: Im Bild passt 9 > 3, aber 9 steht links von 8.', 'Gib jedem Teilbaum Grenzen mit: pruefe(node, unten, oben). Links weiter mit oben = node.value, rechts weiter mit unten = node.value. Noch keine Grenze: None.', 'Andere Idee: Die Inorder-Folge eines Suchbaums ist streng aufsteigend sortiert.'],
    loesung: `def ist_suchbaum(node):
    return pruefe(node, None, None)

def pruefe(node, unten, oben):
    if node is None:
        return True
    if unten is not None and node.value <= unten:
        return False
    if oben is not None and node.value >= oben:
        return False
    return pruefe(node.left, unten, node.value) and pruefe(node.right, node.value, oben)` }),
  POST({ id: 'db5', kapitel: 61, sortArt: 'funktion', knobel: true, ico: '🧮', titel: 'Der Rechenbaum', lohn: 90, ansicht: 'tabelle', titelAnsicht: 'Rechenbaum',
    tabelle: (lauf, k) => ({ html: dsBild(`${svgBaum(rechenBin(RECHEN[lauf ? k : 0]))}<p class="hinweis">${lauf ? `Test ${k + 1}` : '(3 + 4) · 2'} – Blätter sind Zahlen, innere Knoten Rechenzeichen. Erst beide Teilbäume ausrechnen, dann den Knoten: Postorder.</p>`) }),
    ziel: 'Der Steuereintreiber schreibt Rechnungen als Baum. Schreib auswerten(node): Ein Blatt (ohne Kinder) gibt seine Zahl zurück, ein innerer Knoten rechnet mit +, -, * oder // die Ergebnisse seiner beiden Teilbäume.',
    vorspann: V_NODE_BIN + 'def _k(op, l, r):\n    n = Node(op)\n    n.left = l\n    n.right = r\n    return n\n',
    listen: RECHEN.map(() => []), aufrufFn: (l, k) => `auswerten(${rechenPy(RECHEN[k])})`, soll: (l, k) => rechenWert(RECHEN[k]), testName: (k) => ['(3 + 4) · 2', '10 − 2 · 3', 'nur 7', '8 // 2 + 3 · 5'][k],
    befehle: [K_B('def auswerten(node):'), K_B('if ¦ is None and ¦ is None:'), K_B('auswerten(¦)'), K_B('if ¦ == "+":')],
    tipps: ['Blatt: return node.value', 'Sonst a = auswerten(node.left), b = auswerten(node.right) und je nach node.value rechnen.', 'Das ist Postorder: erst die Kinder, dann der Knoten selbst.'],
    loesung: `def auswerten(node):
    if node.left is None and node.right is None:
        return node.value
    a = auswerten(node.left)
    b = auswerten(node.right)
    if node.value == "+":
        return a + b
    if node.value == "-":
        return a - b
    if node.value == "*":
        return a * b
    return a // b` }),

  // --- Kapitel 62: 🕸️ Graphen (Kurs 3.7, 3.8) ---
  PFRAGEN({ id: 'dc1', kapitel: 62, ico: '🕸️', titel: 'Das Straßennetz', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Sechs Dörfer, sechs Straßen',
    tabelle: () => ({ html: dsBild(`${svgGraph(GR(G1, G1_POS))}<pre class="mono dscode">G1 = ${esc(py(G1)).replace(/\], /g, '],\n      ')}</pre>`) }),
    ziel: 'Die Dörfer und Straßen als Graph – lies Bild und Adjazenzliste.',
    merke: { titel: '🕸️ Graphen', text: 'Ein Graph G = (V, E) besteht aus Knoten V und Kanten E. Kanten können gerichtet (Einbahnstraße) und gewichtet (Entfernung) sein. Gespeichert wird er als Adjazenzmatrix (Tabelle mit 0/1 bzw. Gewichten) oder als Adjazenzliste (Dictionary: Knoten → Liste der Nachbarn). Ein Baum ist ein zusammenhängender Graph ohne Zyklen.', code: 'graph = {"A": ["B", "C"],\n         "B": ["A", "D", "E"], …}' },
    fragen: [{ art: 'zahl', text: 'Wie viele Kanten hat der Graph?', soll: () => 6 },
      { art: 'zahl', text: 'Welchen Grad hat B (Anzahl der Nachbarn)?', soll: () => 3 },
      W('Gibt es einen Zyklus (Rundweg ohne eine Straße doppelt zu nehmen)?', ['nein', 'ja: A – B – E – F – C – A', 'nur bei gerichteten Graphen', 'das sieht man nicht'], 1),
      W('Warum steht B in der Liste von A UND A in der Liste von B?', ['Fehler', 'der Graph ist ungerichtet – jede Straße gilt in beide Richtungen', 'B ist wichtiger', 'wegen der Sortierung'], 1),
      { art: 'zahl', text: 'Ein Baum mit 6 Knoten – wie viele Kanten hat er?', soll: () => 5 },
      W('Die Adjazenzmatrix eines ungerichteten Graphen ist …', ['immer voll mit Einsen', 'symmetrisch zur Diagonale', 'immer leer', 'nur eine Zeile'], 1)],
    tipps: ['Jede Straße einmal zählen, nicht in beiden Listen.', 'Ein Baum mit n Knoten hat genau n − 1 Kanten.'] }),
  POST({ id: 'dc2', fertig: true, kapitel: 62, sortArt: 'funktion', ico: '🔢', titel: 'Von der Liste zur Matrix', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Adjazenzmatrix',
    tabelle: (lauf, k) => {
      const g = MATRIX_TESTS[lauf ? k : 0], kn = Object.keys(g).sort(), m = Array.isArray(lauf?.wert) ? lauf.wert : jsMatrix(g);
      return { html: dsBild(`<pre class="mono dscode">${esc(py(g))}</pre><table class="dbtab dsmatrix"><tr><th></th>${kn.map((x) => `<th>${x}</th>`).join('')}</tr>${kn.map((a, i) => `<tr><th>${a}</th>${kn.map((_, j) => `<td>${m[i]?.[j] ?? '?'}</td>`).join('')}</tr>`).join('')}</table><p class="hinweis">${lauf ? 'Deine Matrix' : 'So soll es aussehen'} – Zeile = von, Spalte = nach.</p>`) };
    },
    ziel: 'Schreib matrix(graph): Die Knoten werden alphabetisch sortiert (sorted(graph)). Zeile i, Spalte j ist 1, wenn es eine Kante vom i-ten zum j-ten Knoten gibt, sonst 0.',
    vorspann: V_GRAPHEN + `M1 = ${py(MATRIX_TESTS[0])}\nM3 = ${py(MATRIX_TESTS[2])}\n`,
    listen: [[], [], []], aufrufFn: (l, k) => ['matrix(M1)', 'matrix(G1)', 'matrix(M3)'][k], soll: (l, k) => jsMatrix(MATRIX_TESTS[k]), testName: (k) => ['drei Knoten', 'Straßennetz G1', 'gerichtet (Einbahnstraßen)'][k],
    befehle: [K_B('def matrix(graph):'), K_B('sorted(¦)'), K_B('for ¦ in ¦:'), K_B('if ¦ in ¦:')],
    tipps: ['knoten = sorted(graph) gibt die Knoten alphabetisch.', 'Für jeden Knoten a eine Zeile: für jeden Knoten b eine 1, wenn b in graph[a] steht, sonst 0.', 'Die Zeilen sammelst du in einer Liste: m.append(zeile).'],
    loesung: `def matrix(graph):
    knoten = sorted(graph)
    m = []
    for a in knoten:
        zeile = []
        for b in knoten:
            if b in graph[a]:
                zeile.append(1)
            else:
                zeile.append(0)
        m.append(zeile)
    return m` }),
  POST({ id: 'dc3', kapitel: 62, sortArt: 'funktion', ico: '🌊', titel: 'Die Breitensuche', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Breitensuche',
    tabelle: (lauf, k) => {
      const [, , g] = BFS_TESTS[lauf ? k : 0], pos = { G1: G1_POS, G2: G2_POS, G3: G3_POS }[BFS_TESTS[lauf ? k : 0][0]], mark = {};
      (Array.isArray(lauf?.wert) ? lauf.wert : []).forEach((v, i) => { mark[v] = i + 1; });
      return { html: dsBild(`${svgGraph(GR(g, pos), { mark })}<p class="hinweis">${lauf ? `Test ${k + 1}: ${BFS_TESTS[k][0]} ab ${BFS_TESTS[k][1]} – die Zahlen zeigen deine Reihenfolge.` : 'Wie eine Welle: erst alle Nachbarn des Starts, dann deren Nachbarn …'}</p>`) };
    },
    ziel: 'Schreib bfs(graph, start): Gib die Knoten in der Reihenfolge der Breitensuche zurück. Nachbarn in der Reihenfolge ihrer Liste. Die Klasse Queue (enqueue, dequeue, is_empty) gibt es schon.',
    story: 'Ein Bote soll eine Nachricht in alle Dörfer bringen. Von jedem Dorf aus schickt man Reiter zu allen Nachbardörfern, die noch nichts gehört haben – wer zuerst benachrichtigt wurde, schickt auch zuerst weiter.',
    vorspann: V_QUEUE + V_GRAPHEN,
    listen: BFS_TESTS.map(() => []), aufrufFn: (l, k) => `bfs(${BFS_TESTS[k][0]}, "${BFS_TESTS[k][1]}")`, soll: (l, k) => jsBfs(BFS_TESTS[k][2], BFS_TESTS[k][1]),
    testName: (k) => `${BFS_TESTS[k][0]} ab ${BFS_TESTS[k][1]}`,
    befehle: [K_B('def bfs(graph, start):'), K_B('Queue()'), K_B('while not queue.is_empty():')],
    merke: { titel: '🌊 Breitensuche (BFS)', text: 'Die Breitensuche besucht vom Start aus erst alle Nachbarn, dann deren Nachbarn – Ebene für Ebene, wie eine Welle. Wer noch an der Reihe ist, wartet in einer Schlange (FIFO): vorn einen Knoten herausnehmen, seine noch unbekannten Nachbarn als besucht markieren und hinten anstellen. In ungewichteten Graphen findet sie so den Weg mit den wenigsten Kanten.' },
    tipps: ['visited = [start], dann start in die Schlange.', 'Solange die Schlange nicht leer ist: vorderen Knoten holen, alle seine Nachbarn ansehen.', 'Ein Nachbar, der noch nicht in visited steht, kommt in visited UND hinten in die Schlange.'],
    loesung: `def bfs(graph, start):
    visited = [start]
    queue = Queue()
    queue.enqueue(start)
    while not queue.is_empty():
        vertex = queue.dequeue()
        for adjacent in graph[vertex]:
            if adjacent not in visited:
                visited.append(adjacent)
                queue.enqueue(adjacent)
    return visited` }),
  POST({ id: 'dc4', kapitel: 62, sortArt: 'funktion', ico: '🧵', titel: 'Die Tiefensuche', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Tiefensuche',
    tabelle: (lauf, k) => {
      const t = BFS_TESTS[lauf ? k : 0], pos = { G1: G1_POS, G2: G2_POS, G3: G3_POS }[t[0]], mark = {};
      (Array.isArray(lauf?.wert) ? lauf.wert : []).forEach((v, i) => { mark[v] = i + 1; });
      return { html: dsBild(`${svgGraph(GR(t[2], pos), { mark })}<p class="hinweis">${lauf ? `Test ${k + 1}: ${t[0]} ab ${t[1]} – deine Reihenfolge.` : 'Wie ein Faden durchs Labyrinth: so tief wie möglich, erst in der Sackgasse zurück.'}</p>`) };
    },
    ziel: 'Schreib dfs(graph, start) rekursiv: Gib die Knoten in der Reihenfolge der Tiefensuche zurück (Nachbarn in der Reihenfolge ihrer Liste).',
    vorspann: V_GRAPHEN,
    listen: BFS_TESTS.map(() => []), aufrufFn: (l, k) => `dfs(${BFS_TESTS[k][0]}, "${BFS_TESTS[k][1]}")`, soll: (l, k) => jsDfs(BFS_TESTS[k][2], BFS_TESTS[k][1]),
    testName: (k) => `${BFS_TESTS[k][0]} ab ${BFS_TESTS[k][1]}`,
    befehle: [K_B('def dfs(graph, start):'), K_B('def besuche(vertex):'), K_B('for ¦ in ¦:'), K_B('if ¦ not in ¦:')],
    merke: { titel: '🧵 Tiefensuche (DFS)', text: 'Die Tiefensuche geht vom Start aus so weit wie möglich in die Tiefe und kehrt erst in einer Sackgasse zurück (Backtracking). Rekursiv geschrieben merkt sich der Aufrufstapel, wohin es zurückgeht – ein Stapel statt der Schlange der Breitensuche.' },
    tipps: ['Eine Hilfsfunktion besuche(vertex) hängt vertex an visited und ruft sich für jeden noch nicht besuchten Nachbarn selbst auf.', 'dfs legt visited = [] an, ruft besuche(start) auf und gibt visited zurück.', 'Alternativ: def dfs(graph, start, visited=None) und visited weitergeben.'],
    loesung: `def dfs(graph, start):
    visited = []
    besuche(graph, start, visited)
    return visited

def besuche(graph, vertex, visited):
    visited.append(vertex)
    for adjacent in graph[vertex]:
        if adjacent not in visited:
            besuche(graph, adjacent, visited)` }),
  POST({ id: 'dc4v', kapitel: 62, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🔮', titel: 'Welle oder Faden?', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Netz G3',
    tabelle: (lauf) => ({ html: dsBild(`${svgGraph(GR(G3, G3_POS))}<pre class="mono dscode">G3 = ${esc(py(G3))}</pre>${lauf ? `<p>BFS: <b>${lauf.wert[0].join(' ')}</b> · DFS: <b>${lauf.wert[1].join(' ')}</b></p>` : ''}`) }),
    ziel: 'Beide Suchen starten in A. Sag die Reihenfolgen voraus.',
    listen: [[]], vorspann: V_QUEUE + V_GRAPHEN, code: `def bfs(graph, start):
    visited = [start]
    queue = Queue()
    queue.enqueue(start)
    while not queue.is_empty():
        vertex = queue.dequeue()
        for adjacent in graph[vertex]:
            if adjacent not in visited:
                visited.append(adjacent)
                queue.enqueue(adjacent)
    return visited

def dfs(graph, vertex, visited):
    visited.append(vertex)
    for adjacent in graph[vertex]:
        if adjacent not in visited:
            dfs(graph, adjacent, visited)
    return visited

def versuch():
    return [bfs(G3, "A"), dfs(G3, "A", [])]`,
    fragen: [{ art: 'liste', text: 'Reihenfolge der Breitensuche ab A?', soll: (l) => l.wert[0] },
      { art: 'liste', text: 'Reihenfolge der Tiefensuche ab A?', soll: (l) => l.wert[1] },
      W('Welche Suche findet von A aus den Weg mit den wenigsten Straßen zu jedem Dorf?', ['die Breitensuche', 'die Tiefensuche', 'beide immer', 'keine'], 0)],
    tipps: ['BFS: erst B und D (die Nachbarn von A), dann deren Nachbarn in der Reihenfolge, in der sie in die Schlange kamen.', 'DFS: von A nach B, von B nach C, von C nach F … erst in der Sackgasse zurück.'] }),
  POST({ id: 'dc5', kapitel: 62, sortArt: 'funktion', ico: '🏇', titel: 'Wie viele Straßen?', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Wegstrecke zählen',
    tabelle: (lauf, k) => { const t = ENTF_TESTS[lauf ? k : 0], pos = { G1: G1_POS, G2: G2_POS, G3: G3_POS }[t[0]];
      return { html: dsBild(`${svgGraph(GR(t[3], pos), { farbe: { [t[1]]: '#8fd17a', [t[2]]: '#ffd84a' } })}<p class="hinweis">${t[0]}: von ${t[1]} (grün) nach ${t[2]} (gelb)${lauf ? ` – dein Ergebnis: ${ergebnisText(lauf.wert)}` : ''}</p>`) }; },
    ziel: 'Schreib entfernung(graph, start, ziel): die kleinste Zahl von Straßen von start nach ziel. Nicht erreichbar → -1. Nimm die Breitensuche und merk dir in einem Dictionary, wie weit jeder Knoten vom Start weg ist.',
    vorspann: V_QUEUE + V_GRAPHEN,
    listen: ENTF_TESTS.map(() => []), aufrufFn: (l, k) => `entfernung(${ENTF_TESTS[k][0]}, "${ENTF_TESTS[k][1]}", "${ENTF_TESTS[k][2]}")`, soll: (l, k) => jsEntf(ENTF_TESTS[k][3], ENTF_TESTS[k][1], ENTF_TESTS[k][2]),
    testName: (k) => `${ENTF_TESTS[k][0]}: ${ENTF_TESTS[k][1]} → ${ENTF_TESTS[k][2]}`,
    befehle: [K_B('def entfernung(graph, start, ziel):'), K_B('while ¦:'), K_B('for ¦ in ¦:'), K_B('if ¦ not in ¦:')],
    tipps: ['Wie bfs – aber statt visited ein Dictionary dist = {start: 0}.', 'Neuer Nachbar: dist[adjacent] = dist[vertex] + 1.', 'Am Ende: steht ziel in dist, gib dist[ziel] zurück, sonst -1.'],
    loesung: `def entfernung(graph, start, ziel):
    dist = {start: 0}
    queue = Queue()
    queue.enqueue(start)
    while not queue.is_empty():
        vertex = queue.dequeue()
        for adjacent in graph[vertex]:
            if adjacent not in dist:
                dist[adjacent] = dist[vertex] + 1
                queue.enqueue(adjacent)
    if ziel in dist:
        return dist[ziel]
    return -1` }),

  // --- Kapitel 63: 🧭 Kürzeste Wege (Kurs 3.9) ---
  POST({ id: 'dd1', kapitel: 63, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🔮', titel: 'Dijkstra von Hand', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Reitzeiten in Stunden',
    tabelle: (lauf) => { const r = jsDijkstra(W1, 'S');
      return { html: dsBild(`${svgGraph(WG(W1, W1_POS), lauf ? { dist: r.dist, weg: jsWeg(r.vor, 'Z'), mark: Object.fromEntries(r.fertig.map((v, i) => [v, i + 1])) } : {})}<p class="hinweis">${lauf ? 'Gelb: Reihenfolge, in der die Knoten fertig wurden · grün: endgültige Entfernung von S' : 'Kantengewicht = Stunden zu Pferd'}</p>`) }; },
    ziel: 'Ein Bote reitet von S los. Rechne Dijkstra auf einem Zettel mit (Tabelle: fertig, dist je Knoten) und sag voraus, was herauskommt.',
    story: 'Die schnellste Route ist nicht die mit den wenigsten Straßen: Manche Wege führen durch Sumpf. Dijkstra legt immer den Ort endgültig fest, der gerade am nächsten liegt.',
    listen: [[]], vorspann: V_GEWICHTET, code: `${C_DIJKSTRA}

def versuch():
    dist, fertig, vorgaenger = dijkstra(W1, "S")
    return [fertig, dist["Z"], vorgaenger["Z"]]`,
    merke: { titel: '🧭 Dijkstra', text: 'Dijkstra findet in einem Graphen mit nichtnegativen Gewichten die kürzesten Wege vom Start. Er wählt immer den noch nicht fertigen Knoten mit der kleinsten Entfernung, legt sie endgültig fest und relaxiert seine Kanten: Ist dist[u] + w < dist[v], wird dist[v] kleiner und u der Vorgänger von v.', code: 'if v not in fertig and dist[u] + w < dist[v]:\n    dist[v] = dist[u] + w\n    vorgaenger[v] = u' },
    fragen: [{ art: 'liste', text: 'In welcher Reihenfolge werden die Knoten fertig?', soll: (l) => l.wert[0] },
      { art: 'zahl', text: 'Wie viele Stunden braucht der Bote von S nach Z?', soll: (l) => l.wert[1] },
      W('Wer ist der Vorgänger von Z auf dem kürzesten Weg?', ['S', 'A', 'B', 'C'], ['S', 'A', 'B', 'C'].indexOf('A')),
      W('A ist von S direkt 7 Stunden entfernt. Warum steht am Ende 5 da?', ['Rundungsfehler', 'über B (3 + 2) ist es kürzer – die Kante B → A wurde relaxiert', 'weil A nach B fertig wurde', 'weil 5 < 7 immer gilt'], 1)],
    tipps: ['Start: dist[S] = 0, alle anderen ∞. S wird fertig, A bekommt 7, B bekommt 3.', 'Als Nächstes wird B fertig (3 ist am kleinsten) – und verbessert A auf 3 + 2 = 5.'] }),
  // Abi-Tabelle Runde für Runde auf einem neuen Netz (Didaktik-Prüfung: Dijkstra-Tabelle gab es nur im Kerker)
  PFRAGEN({ id: 'dd1t', kapitel: 63, ico: '📋', titel: 'Die Dijkstra-Tabelle', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Neues Netz: Wege ab S',
    tabelle: () => ({ html: dsBild(`${svgGraph(WG(W4, W4_POS))}
      <table class="dbtab dsmatrix"><tr><th>Runde</th><th>fertig</th>${PS_K4.map((k) => `<th>${k}</th>`).join('')}</tr>
      <tr><td>0</td><td>–</td>${PS_K4.map(() => '<td>∞</td>').join('')}</tr>
      ${PS_R4.slice(0, 5).map((r, i) => `<tr><td>${i + 1}</td><td>${i ? '?' : 'S'}</td>${PS_K4.map(() => '<td>?</td>').join('')}</tr>`).join('')}</table>
      <p class="hinweis">So steht es im Abitur: je Runde eine Zeile mit dem Knoten, der fertig wird, und den vorläufigen Entfernungen (dazu der Vorgänger, z. B. 3/B). Schreib die Tabelle auf einen Zettel mit.</p>`) }),
    ziel: 'Rechne Dijkstra ab S auf diesem Netz Runde für Runde und fülle die Tabelle aus. Noch unerreichte Knoten (∞) schreibst du als x.',
    fragen: [{ art: 'liste', text: 'Runde 1: S wird fertig. Welche Entfernungen stehen danach bei A, B, C, D, Z? (∞ = x, z. B. 4 x 7 x x)', soll: () => psDistListe(PS_R4[0]) },
      { art: 'liste', text: 'Welcher Knoten wird in Runde 2 fertig?', soll: () => [PS_R4[1].u] },
      { art: 'liste', text: 'Entfernungen nach Runde 2 bei A, B, C, D, Z?', soll: () => psDistListe(PS_R4[1]) },
      { art: 'liste', text: 'Welche zwei Knoten werden in Runde 3 und 4 fertig (in dieser Reihenfolge)?', soll: () => [PS_R4[2].u, PS_R4[3].u] },
      { art: 'liste', text: 'Entfernungen nach Runde 4 bei A, B, C, D, Z?', soll: () => psDistListe(PS_R4[3]) },
      W(`In Runde 4 wird ${PS_R4[3].u} fertig. D hat schon ${PS_R4[2].dist.D} über B; über ${PS_R4[3].u} wären es ${PS_R4[3].dist[PS_R4[3].u]} + ${W4[PS_R4[3].u].D}. Was passiert mit D?`, [`nichts – ${PS_R4[3].dist[PS_R4[3].u] + W4[PS_R4[3].u].D} ist nicht kleiner als ${PS_R4[2].dist.D}, dist und Vorgänger bleiben`, `dist[D] wird ${PS_R4[3].dist[PS_R4[3].u] + W4[PS_R4[3].u].D}, Vorgänger ${PS_R4[3].u}`, 'D wird sofort fertig', `dist[D] wird ${PS_R4[3].dist[PS_R4[3].u]}`], 0),
      { art: 'liste', text: 'Am Ende: Wer ist der Vorgänger von A, B, C, D, Z?', soll: () => PS_K4.map((k) => PS_R4.at(-1).vor[k]) },
      { art: 'zahl', text: 'Wie lang ist der kürzeste Weg von S nach Z?', soll: () => PS_R4.at(-1).dist.Z }],
    tipps: ['Fertig wird immer der offene Knoten mit der kleinsten Entfernung. Dann nur seine Nachbarn verbessern: dist[u] + Gewicht < dist[v]?', 'Runde 2: B (1) ist kleiner als A (4). Über B wird A billiger: 1 + 2 = 3.', 'Vorgänger = der Knoten, über den die Entfernung zuletzt verbessert wurde.'] }),
  POST({ id: 'dd2', kapitel: 63, sortArt: 'funktion', ico: '🐞', titel: 'Der verirrte Bote', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Reitzeiten',
    tabelle: (lauf, k) => { const t = DIJ_TESTS[lauf ? k : 0], pos = { W1: W1_POS, W2: W2_POS, W3: W3_POS }[t[0]];
      return { html: dsBild(`${svgGraph(WG(t[2], pos, t[0] === 'W3'), { dist: lauf?.wert && typeof lauf.wert === 'object' ? lauf.wert : jsDijkstra(t[2], t[1]).dist })}<p class="hinweis">${t[0]} ab ${t[1]} – grün: ${lauf ? 'deine' : 'die richtigen'} Entfernungen${t[0] === 'W3' ? ' (gerichtet: Einbahnstraßen)' : ''}</p>`) }; },
    ziel: 'Der Lehrling hat Dijkstra abgetippt – aber die Boten kommen mit viel zu kleinen Zeiten an. Finde den Fehler. dijkstra(graph, start) gibt das Dictionary dist zurück.',
    vorspann: V_GEWICHTET,
    listen: DIJ_TESTS.map(() => []), aufrufFn: (l, k) => `dijkstra(${DIJ_TESTS[k][0]}, "${DIJ_TESTS[k][1]}")`, soll: (l, k) => jsDijkstra(DIJ_TESTS[k][2], DIJ_TESTS[k][1]).dist,
    testName: (k) => `${DIJ_TESTS[k][0]} ab ${DIJ_TESTS[k][1]}`,
    vorlage: `def dijkstra(graph, start):
    dist = {}
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
                dist[v] = w
    return dist`,
    tipps: ['Schau dir die Zeile an, in der dist[v] einen neuen Wert bekommt.', 'dist[v] soll die ganze Entfernung vom Start sein – nicht nur die letzte Straße.', 'dist[v] = dist[u] + w'],
    loesung: `def dijkstra(graph, start):
    dist = {}
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
                dist[v] = dist[u] + w
    return dist` }),
  POST({ id: 'dd3', kapitel: 63, sortArt: 'funktion', ico: '🗺️', titel: 'Den Weg zurückverfolgen', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Vorgänger',
    tabelle: (lauf, k) => { const r = jsDijkstra(W2, 'Burg'), z = ['Markt', 'See', 'Burg', 'Turm'][lauf ? k : 0];
      return { html: dsBild(`${svgGraph(WG(W2, W2_POS), { weg: Array.isArray(lauf?.wert) ? lauf.wert : [], dist: r.dist, farbe: { Burg: '#8fd17a', [z]: '#ffd84a' } })}
        <pre class="mono dscode">vorgaenger = ${esc(py(r.vor))}</pre><p class="hinweis">${lauf ? 'Gelb: dein Weg' : 'Ziel gelb'} · grün: Entfernung von der Burg</p>`) }; },
    ziel: 'Dijkstra hat für W2 ab der Burg das Dictionary vorgaenger geliefert (es steht unten). Schreib weg(vorgaenger, ziel): die Liste der Orte von der Burg bis zum Ziel.',
    vorspann: V_GEWICHTET + `VOR = ${py(jsDijkstra(W2, 'Burg').vor)}\n`,
    listen: [[], [], [], []], aufrufFn: (l, k) => `weg(VOR, "${['Markt', 'See', 'Burg', 'Turm'][k]}")`, soll: (l, k) => jsWeg(jsDijkstra(W2, 'Burg').vor, ['Markt', 'See', 'Burg', 'Turm'][k]),
    testName: (k) => `zum ${['Markt', 'See', 'Start', 'Turm'][k]}`,
    befehle: [K_B('def weg(vorgaenger, ziel):'), K_B('pfad.insert(0, ¦)')],
    tipps: ['Fang beim Ziel an und geh immer zum Vorgänger, bis None kommt (der Start hat keinen Vorgänger).', 'Vorn einfügen mit pfad.insert(0, knoten) – dann beginnt der Weg beim Start.'],
    loesung: `def weg(vorgaenger, ziel):
    pfad = []
    knoten = ziel
    while knoten is not None:
        pfad.insert(0, knoten)
        knoten = vorgaenger[knoten]
    return pfad` }),
  // Dijkstra selbst schreiben als Pflichtauftrag mit Gerüst (Didaktik-Prüfung: nur der Knobelhof dd5 verlangte es)
  POST({ id: 'dd2b', kapitel: 63, sortArt: 'funktion', ico: '🏗️', titel: 'Dijkstra selbst gebaut', lohn: 90, ansicht: 'tabelle', titelAnsicht: 'Reitzeiten',
    tabelle: (lauf, k) => { const t = DIJ_TESTS[lauf ? k : 0], pos = { W1: W1_POS, W2: W2_POS, W3: W3_POS }[t[0]], r = jsDijkstra(t[2], t[1]);
      const ist = Array.isArray(lauf?.wert) && lauf.wert[0] && typeof lauf.wert[0] === 'object' ? lauf.wert[0] : null;
      return { html: dsBild(`${svgGraph(WG(t[2], pos, t[0] === 'W3'), { dist: ist || r.dist })}<p class="hinweis">${t[0]} ab ${t[1]} – grün: ${ist ? 'deine' : 'die richtigen'} Entfernungen${t[0] === 'W3' ? ' (gerichtet: Einbahnstraßen)' : ''}</p>`) }; },
    ziel: 'Das Gerüst steht im Editor. Ergänze die zwei fehlenden Schritte: (1) u = der Knoten, der noch nicht fertig ist und die kleinste Entfernung hat. (2) Für jeden Nachbarn v von u relaxieren – dist[v] und vorgaenger[v] verbessern, wenn der Weg über u kürzer ist. dijkstra gibt [dist, vorgaenger] zurück.',
    vorspann: V_GEWICHTET,
    listen: DIJ_TESTS.map(() => []), aufrufFn: (l, k) => `dijkstra(${DIJ_TESTS[k][0]}, "${DIJ_TESTS[k][1]}")`,
    soll: (l, k) => { const r = jsDijkstra(DIJ_TESTS[k][2], DIJ_TESTS[k][1]); return [r.dist, r.vor]; },
    testName: (k) => `${DIJ_TESTS[k][0]} ab ${DIJ_TESTS[k][1]}`,
    vorlage: `def dijkstra(graph, start):
    dist = {}
    for k in graph:
        dist[k] = float("inf")
    dist[start] = 0
    fertig = []
    vorgaenger = {start: None}
    while len(fertig) < len(graph):
        # Schritt 1: u = der Knoten, der noch nicht fertig ist
        #            und die kleinste Entfernung dist[...] hat
        u = None

        fertig.append(u)
        # Schritt 2: jeden Nachbarn v von u relaxieren
        #            (graph[u][v] ist das Gewicht der Kante u – v)

    return [dist, vorgaenger]`,
    befehle: [K_B('for k in graph:'), K_B('if k not in fertig:'), K_B('for v in graph[u]:')],
    tipps: ['Schritt 1 ist eine Minimumsuche: for k in graph – nur Knoten, die nicht in fertig stehen; ist u None oder dist[k] < dist[u], wird k das neue u.', 'Schritt 2: for v in graph[u]: w = graph[u][v]. Nur wenn v nicht fertig ist und dist[u] + w < dist[v] gilt, wird verbessert.', 'Beim Verbessern zwei Zeilen: dist[v] = dist[u] + w und vorgaenger[v] = u.'],
    loesung: `def dijkstra(graph, start):
    dist = {}
    for k in graph:
        dist[k] = float("inf")
    dist[start] = 0
    fertig = []
    vorgaenger = {start: None}
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
                dist[v] = dist[u] + w
                vorgaenger[v] = u
    return [dist, vorgaenger]` }),
  PFRAGEN({ id: 'dd4', kapitel: 63, ico: '⚖️', titel: 'Wann welches Verfahren?', lohn: 65,
    ziel: 'Dijkstra, Moore-Bellman-Ford oder Breitensuche – was passt wann?',
    fragen: [W('Alle Straßen sind gleich lang. Was genügt für den kürzesten Weg?', ['Dijkstra ist nötig', 'die Breitensuche', 'nur Backtracking', 'keine Lösung möglich'], 1),
      W('Ein Händler bekommt auf einer Straße Geld zurück (Gewicht −3, Einbahnstraße). Ist Dijkstra dann sicher richtig?', ['ja, immer', 'nein – bei negativen Gewichten ist Dijkstra nicht garantiert korrekt; Moore-Bellman-Ford geht, solange es keinen negativen Zyklus gibt', 'ja, wenn man die −3 weglässt', 'nur bei ungerichteten Graphen'], 1),
      W('Was heißt „eine Kante u → v relaxieren“?', ['die Kante löschen', 'prüfen, ob der Weg über u kürzer ist – dann dist[v] auf diesen kürzeren Wert verkleinern', 'das Gewicht der Kante halbieren', 'v als fertig markieren und nie mehr ändern'], 1),
      W('Moore-Bellman-Ford relaxiert (n − 1)-mal alle Kanten. Seine Laufzeit ist …', ['O(1)', 'O(Knoten · Kanten)', 'O(log n)', 'O(2ⁿ)'], 1),
      W('Warum darf Dijkstra einen Knoten „fertig“ nennen und nie mehr ändern?', ['weil es schneller ist', 'kein offener Weg kann noch kürzer werden – alle anderen sind schon mindestens so lang, und Gewichte ≥ 0 machen sie nicht kürzer', 'weil der Graph keine Kreise hat, also ein Baum ist', 'Zufall'], 1)],
    tipps: ['Dijkstra verlässt sich darauf, dass ein Umweg nie kürzer werden kann.'] }),
  POST({ id: 'dd5', kapitel: 63, sortArt: 'funktion', knobel: true, ico: '🏁', titel: 'Der schnellste Ritt', lohn: 95, ansicht: 'tabelle', titelAnsicht: 'Route planen',
    tabelle: (lauf, k) => { const t = ROUTE_TESTS[lauf ? k : 0], pos = { W1: W1_POS, W2: W2_POS, W3: W3_POS }[t[0]];
      return { html: dsBild(`${svgGraph(WG(t[3], pos, t[0] === 'W3'), { weg: Array.isArray(lauf?.wert) ? lauf.wert : [], farbe: { [t[1]]: '#8fd17a', [t[2]]: '#ffd84a' } })}<p class="hinweis">${t[0]}: ${t[1]} → ${t[2]}${lauf ? ` · deine Route: ${ergebnisText(lauf.wert)}` : ''}</p>`) }; },
    ziel: 'Ganz ohne Vorlage: route(graph, start, ziel) gibt die Orte des kürzesten Wegs als Liste zurück (Dijkstra mit Vorgängern, dann zurückverfolgen). Ist das Ziel nicht erreichbar: [].',
    vorspann: V_GEWICHTET,
    listen: ROUTE_TESTS.map(() => []), aufrufFn: (l, k) => `route(${ROUTE_TESTS[k][0]}, "${ROUTE_TESTS[k][1]}", "${ROUTE_TESTS[k][2]}")`, soll: (l, k) => jsWeg(jsDijkstra(ROUTE_TESTS[k][3], ROUTE_TESTS[k][1]).vor, ROUTE_TESTS[k][2]),
    testName: (k) => `${ROUTE_TESTS[k][1]} → ${ROUTE_TESTS[k][2]}`,
    tipps: ['Erst Dijkstra mit vorgaenger = {start: None}, dann wie bei weg() vom Ziel zurück.', 'Nicht erreichbar: dist[ziel] bleibt float("inf") – dann return [].'],
    loesung: `def route(graph, start, ziel):
    dist = {}
    for k in graph:
        dist[k] = float("inf")
    dist[start] = 0
    fertig = []
    vorgaenger = {start: None}
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
                dist[v] = dist[u] + w
                vorgaenger[v] = u
    if dist[ziel] == float("inf"):
        return []
    pfad = []
    knoten = ziel
    while knoten is not None:
        pfad.insert(0, knoten)
        knoten = vorgaenger[knoten]
    return pfad` }),

  // --- Kapitel 64: 🔙 Backtracking und Grenzen (Kurs 3.10, 2.2.10) ---
  POST({ id: 'de1', kapitel: 64, sortArt: 'funktion', ico: '🛡️', titel: 'Wachen aufstellen', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Das Wachbrett',
    tabelle: () => ({ html: dsBild(`${svgBrett([1, 3, -1, -1])}<p class="hinweis">spalten = [1, 3, -1, -1]: In Zeile 0 steht eine Wache in Spalte 1, in Zeile 1 in Spalte 3. Zwei Wachen dürfen nicht in derselben Spalte oder auf derselben Diagonale stehen (wie Damen beim Schach).</p>`) }),
    ziel: 'Schreib dame_moeglich(spalten, zeile, spalte): True, wenn eine neue Wache in (zeile, spalte) keine der Wachen in den Zeilen 0 … zeile − 1 bedroht.',
    vorspann: '',
    listen: [[], [], [], [], [], []], aufrufFn: (l, k) => ['dame_moeglich([1, 3, -1, -1], 2, 0)', 'dame_moeglich([1, 3, -1, -1], 2, 2)', 'dame_moeglich([1, 3, -1, -1], 2, 1)', 'dame_moeglich([0, -1, -1, -1], 1, 1)', 'dame_moeglich([-1, -1, -1, -1], 0, 2)', 'dame_moeglich([1, 3, 0, -1], 3, 2)'][k],
    soll: (l, k) => [true, false, false, false, true, true][k], testName: (k) => ['frei', 'Diagonale', 'gleiche Spalte', 'Diagonale direkt', 'erste Zeile', 'letzte Wache'][k],
    befehle: [K_B('def dame_moeglich(spalten, zeile, spalte):'), K_B('for z in range(zeile):'), K_B('abs(¦)')],
    tipps: ['Prüf jede Zeile z vor der neuen: Dort steht die Wache in Spalte spalten[z].', 'Zwei Wachen stehen auf derselben Diagonale, wenn ihr Spaltenabstand so groß ist wie ihr Zeilenabstand.', 'Gleiche Spalte: s == spalte. Diagonale: abs(s - spalte) == zeile - z.'],
    loesung: `def dame_moeglich(spalten, zeile, spalte):
    for z in range(zeile):
        s = spalten[z]
        if s == spalte or abs(s - spalte) == zeile - z:
            return False
    return True` }),
  POST({ id: 'de2', kapitel: 64, sortArt: 'funktion', ico: '🔙', titel: 'Probieren und zurücknehmen', lohn: 85, ansicht: 'tabelle', titelAnsicht: 'Das Wachbrett',
    tabelle: (lauf, k) => ({ html: dsBild(`${lauf?.wert?.brett ? svgBrett(lauf.wert.brett) : svgBrett([-1, -1, -1, -1])}<p class="hinweis">${lauf ? `Test ${k + 1}: ${lauf.wert?.ok ? 'gelöst' : 'keine Lösung gefunden'}` : 'Zeile für Zeile eine Wache setzen – passt nichts mehr, die letzte zurücknehmen und weiterprobieren.'}</p>`) }),
    ziel: 'Schreib setze_damen(spalten, zeile, n) mit Backtracking: Gibt True zurück, wenn sich ab zeile alle Wachen setzen lassen (spalten enthält dann die Lösung), sonst False. dame_moeglich gibt es schon.',
    vorspann: `def dame_moeglich(spalten, zeile, spalte):
    for z in range(zeile):
        s = spalten[z]
        if s == spalte or abs(s - spalte) == zeile - z:
            return False
    return True

def _gueltig(spalten):
    n = len(spalten)
    for z in range(n):
        if spalten[z] < 0 or spalten[z] >= n or not dame_moeglich(spalten, z, spalten[z]):
            return False
    return True

def _versuch(n):
    spalten = [-1] * n
    ok = setze_damen(spalten, 0, n)
    return {"ok": ok, "gueltig": _gueltig(spalten), "brett": spalten}
`,
    listen: [[], [], [], []], aufrufFn: (l, k) => `_versuch(${[4, 3, 6, 8][k]})`,
    soll: (l, k) => [{ ok: true, gueltig: true }, { ok: false, gueltig: false }, { ok: true, gueltig: true }, { ok: true, gueltig: true }][k], testName: (k) => `${[4, 3, 6, 8][k]} Wachen`,
    befehle: [K_B('def setze_damen(spalten, zeile, n):'), K_B('for ¦ in range(¦):')],
    merke: { titel: '🔙 Backtracking', text: 'Backtracking löst Belegungsprobleme schrittweise: Kandidat wählen, prüfen, setzen, rekursiv weiter – führt das in eine Sackgasse, den Schritt zurücknehmen und den nächsten Kandidaten probieren. Im schlimmsten Fall wird alles ausprobiert (exponentielle Laufzeit), aber Sackgassen werden früh abgeschnitten.', code: 'für jeden Kandidaten:\n    wenn er erlaubt ist:\n        setzen\n        wenn der Rest (rekursiv) klappt: fertig – Erfolg\n        zurücknehmen\nkein Kandidat passt: Misserfolg melden' },
    tipps: ['Basisfall: zeile == n → alle Wachen stehen, return True.', 'Sonst jede Spalte probieren: wenn möglich setzen und rekursiv die nächste Zeile füllen.', 'Klappt die nächste Zeile nicht: spalten[zeile] = -1 (zurücknehmen). Nach der Schleife: return False.'],
    loesung: `def setze_damen(spalten, zeile, n):
    if zeile == n:
        return True
    for spalte in range(n):
        if dame_moeglich(spalten, zeile, spalte):
            spalten[zeile] = spalte
            if setze_damen(spalten, zeile + 1, n):
                return True
            spalten[zeile] = -1
    return False` }),
  POST({ id: 'de3', kapitel: 64, sortArt: 'funktion', ico: '🎨', titel: 'Die Wappenfarben', lohn: 85, ansicht: 'tabelle', titelAnsicht: 'Provinzen und Grenzen',
    tabelle: (lauf, k) => {
      const f = lauf?.wert?.faerbung || {}, farbe = Object.fromEntries(Object.entries(f).map(([l, c]) => [l, FARBE_CSS[c] || '#ccc']));
      return { html: dsBild(`${svgGraph(GR(REICH, REICH_POS), { farbe })}<p class="hinweis">${lauf ? `Test ${k + 1} (${k ? 4 : 3} Farben): ${lauf.wert?.ok ? 'gefärbt' : 'keine Färbung gefunden'}` : 'Benachbarte Provinzen (verbunden) brauchen verschiedene Wappenfarben.'}</p>`) };
    },
    ziel: 'Jede Provinz bekommt eine Wappenfarbe, Nachbarn verschiedene. Schreib farbe_erlaubt(faerbung, land, farbe) und faerbe(laender, i, farben, faerbung) mit Backtracking (Rücknahme mit del faerbung[land]). NACHBARN gibt es schon.',
    vorspann: `NACHBARN = ${py(REICH)}

def _gueltig(f):
    for a in NACHBARN:
        if a not in f:
            return False
        for b in NACHBARN[a]:
            if f[a] == f[b]:
                return False
    return True

def _versuch(farben):
    f = {}
    ok = faerbe(list(NACHBARN), 0, farben, f)
    return {"ok": ok, "gueltig": _gueltig(f), "faerbung": f}
`,
    listen: [[], []], aufrufFn: (l, k) => `_versuch(${py([['rot', 'gelb', 'blau'], ['rot', 'gelb', 'blau', 'grün']][k])})`,
    soll: (l, k) => [{ ok: false }, { ok: true, gueltig: true }][k], testName: (k) => `${k ? 4 : 3} Farben`,
    befehle: [K_B('def farbe_erlaubt(faerbung, land, farbe):'), K_B('def faerbe(laender, i, farben, faerbung):'), K_B('for ¦ in ¦:'), K_B('del ¦')],
    tipps: ['farbe_erlaubt: Für jeden Nachbarn n: steht n schon in faerbung und hat dieselbe Farbe → False.', 'faerbe: i == len(laender) → True. Sonst land = laender[i] und jede Farbe probieren: setzen, faerbe(…, i + 1, …), bei Misserfolg del faerbung[land].', 'Mit drei Farben geht es nicht: Die Mitte grenzt an einen Ring aus fünf Provinzen.'],
    loesung: `def farbe_erlaubt(faerbung, land, farbe):
    for n in NACHBARN[land]:
        if n in faerbung and faerbung[n] == farbe:
            return False
    return True

def faerbe(laender, i, farben, faerbung):
    if i == len(laender):
        return True
    land = laender[i]
    for farbe in farben:
        if farbe_erlaubt(faerbung, land, farbe):
            faerbung[land] = farbe
            if faerbe(laender, i + 1, farben, faerbung):
                return True
            del faerbung[land]
    return False` }),
  PFRAGEN({ id: 'de4', kapitel: 64, ico: '🧱', titel: 'Grenzen des Rechnens', lohn: 70,
    ziel: 'Was ein Computer praktisch – und was er grundsätzlich nicht schafft.',
    merke: { titel: '🧱 Grenzen der Berechenbarkeit', text: 'Technische Grenzen: Ein Problem kann lösbar sein und trotzdem zu lange dauern, wenn der Aufwand exponentiell wächst (jede Stelle mehr im Passwort vervielfacht ihn). Theoretische Grenzen: Manche Probleme löst kein Algorithmus – etwa das Halteproblem (entscheiden, ob ein beliebiges Programm anhält). Churchsche These: Was überhaupt berechenbar ist, kann eine Turingmaschine berechnen.' },
    fragen: [{ art: 'zahl', text: 'Ein Schloss hat eine vierstellige PIN (0000 bis 9999). Ein Dieb schafft 1000 Versuche pro Sekunde. Wie viele Sekunden braucht er höchstens?', soll: () => 10 },
      { art: 'zahl', text: 'Ein Passwort aus 3 Kleinbuchstaben (a–z): Wie viele Möglichkeiten gibt es?', soll: () => 17576 },
      W('Das Passwort bekommt eine Stelle mehr (62 mögliche Zeichen). Der Aufwand …', ['wächst um 62', 'wird mit 62 multipliziert – exponentielles Wachstum', 'verdoppelt sich', 'bleibt gleich'], 1),
      W('Das Halteproblem sagt …', ['jedes Programm hält irgendwann an', 'kein Algorithmus entscheidet es für jedes Programm – ob es bei jeder Eingabe anhält, kann kein Verfahren immer richtig sagen', 'Computer sind zu langsam für große Programme', 'while-Schleifen sind verboten'], 1),
      W('Ein Entscheidungsproblem heißt entscheidbar, wenn …', ['es Ja als Antwort hat', 'ein Algorithmus immer richtig Ja oder Nein sagt – für jede Eingabe nach endlich vielen Schritten', 'es ein Mensch mit genug Zeit von Hand lösen kann', 'es in Python geschrieben ist'], 1),
      W('Die Churchsche These lautet:', ['Turingmaschinen rechnen schneller als jeder heutige PC', 'alles intuitiv Berechenbare kann eine Turingmaschine berechnen', 'jedes Problem ist berechenbar', 'Rekursion ist besser als Schleifen'], 1)],
    tipps: ['10 000 Möglichkeiten geteilt durch 1000 pro Sekunde.', '26 · 26 · 26'] }),
);

// --- 🐎 Bild für die Landkarte: Poststation mit Stall und Posthorn ---
function svgPoststation(fertig) {
  return `<ellipse cx="0" cy="32" rx="46" ry="8" fill="rgba(0,0,0,.25)"/>
    <rect x="-36" y="-10" width="44" height="40" fill="#e8d2a8" stroke="#7a5a2a" stroke-width="2"/>
    <polygon points="-42,-10 -14,-36 14,-10" fill="${fertig ? '#c9a030' : '#3f6a8a'}" stroke="#24405a" stroke-width="2"/>
    <rect x="8" y="2" width="30" height="28" fill="#9a6a3a" stroke="#5a3a1a" stroke-width="2"/><polygon points="4,2 23,-14 42,2" fill="#7a4a24" stroke="#4a2a10" stroke-width="1.5"/>
    <rect x="15" y="12" width="16" height="18" fill="#4a2a10"/><rect x="-24" y="4" width="12" height="11" fill="${fertig ? '#ffe27a' : '#2b2f3d'}"/>
    <path d="M-26,-26 q8,-6 16,0 l4,-4 v10 l-4,-4 q-8,6 -16,0z" fill="#ffd84a" stroke="#8a6a10" stroke-width="1"/>
    <text x="30" y="-6" style="font-size:13px">🐎</text>`;
}
