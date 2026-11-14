'use strict';
// --- 🗼 Botentürme: LK Rechnernetze (Burg 29, Lehrplan LB 7, OPAL-Kurs LK_INF_LB7 „Rechnernetze“, Seiten 7.1–7.17) ---
// Die Burgen des Landes sind Hosts, die Boten sind Pakete, die Botentürme sind Switches und Router. Kurierin Nora erzählt.
// Begriffe, Beispiele und Zahlen wie im Kurs: SAT, Flooding, ARP, ip_zu_zahl/zahl_zu_ip/maske/gleiches_netz (7.6.5),
// Longest-Prefix-Match (7.5 Beispiel 2), DORA, Resolver/Root/TLD/autoritativ, Drei-Wege-Handshake (7.9.2).
// Läuft auf dem Kornspeicher-Ablauf (warte + eigener Ort über ortInfo), alle obersten Namen mit Präfix NZ_.

KAPITEL[120] = { name: 'Topologien und Medien', ico: '🕸️' };
KAPITEL[121] = { name: 'Schichtenmodelle', ico: '🧅' };
KAPITEL[122] = { name: 'MAC, Switch und ARP', ico: '🔀' };
KAPITEL[123] = { name: 'IP-Adressen und Subnetze', ico: '🔢' };
KAPITEL[124] = { name: 'Routing, DHCP und DNS', ico: '🧭' };
KAPITEL[125] = { name: 'TCP, UDP und Dienste', ico: '🤝' };
BURGEN[29] = { name: 'LK Netze', ico: '🗼', klasse: 'LK', region: 'tauben', kapitel: [120, 121, 122, 123, 124, 125],
  text: 'Leistungskurs: Topologien, Übertragungszeit, Client-Server und P2P, OSI und TCP/IP, Kapselung, MAC und Switch, ARP, IPv4, Subnetting und CIDR, Routing mit Longest-Prefix-Match, DHCP, DNS, TCP und UDP, Ports und Protokolle.' };

// --- 🗼 Bild für die Landkarte: Botenturm mit Leuchtfeuer und Funkwellen ---
function NZ_svgTurm(fertig) {
  const welle = (r, o) => `<path d="M${14 + r},${-46 - r * 0.7} a${r + 6},${r + 6} 0 0 1 0,${r * 1.4 + 8}" fill="none" stroke="${fertig ? '#ffd23a' : '#9ac0e8'}" stroke-width="2" opacity="${o}"/>
    <path d="M${-14 - r},${-46 - r * 0.7} a${r + 6},${r + 6} 0 0 0 0,${r * 1.4 + 8}" fill="none" stroke="${fertig ? '#ffd23a' : '#9ac0e8'}" stroke-width="2" opacity="${o}"/>`;
  return `<ellipse cx="0" cy="34" rx="32" ry="7" fill="rgba(0,0,0,.25)"/>
    <polygon points="-15,34 -11,-26 11,-26 15,34" fill="#a39482" stroke="#4a3e30" stroke-width="2"/>
    ${[-8, 4, 16].map((y) => `<line x1="-13" y1="${y}" x2="13" y2="${y}" stroke="#7a6a58" stroke-width="1"/>`).join('')}
    <rect x="-15" y="-34" width="30" height="9" fill="#a39482" stroke="#4a3e30" stroke-width="2"/>
    ${[-15, -5, 5].map((x) => `<rect x="${x}" y="-40" width="6" height="6" fill="#a39482" stroke="#4a3e30" stroke-width="1"/>`).join('')}
    <path d="M-7,-40 q7,-20 14,0 z" fill="${fertig ? '#ffd23a' : '#e8742a'}" stroke="#8a3a10" stroke-width="1"/>
    <rect x="-3" y="-16" width="6" height="11" rx="3" fill="${fertig ? '#ffe27a' : '#2b2f3d'}"/>
    <path d="M-6,34 v-11 a6,6 0 0 1 12,0 v11 z" fill="#3e2410"/>
    ${welle(0, 0.9)}${welle(8, 0.5)}`;
}
const NZ_ORT = { ort: 'Turm', im: 'im Botenturm', ico: '🗼', haupt: '🗼 In den Botenturm', sub: 'Tippe einen Botenturm an, um seine Aufträge zu sehen.', svg: NZ_svgTurm };

const NZ_S = [...S_LK, 'krypto'];
const NZ = (a) => KORN({ warte: true, zielArt: 'wert', funktion: null, sprache: NZ_S, ortInfo: NZ_ORT, sprecher: ['📡', 'Kurierin Nora'], ortIco: '🗼', ortName: 'Botenturm', ...a });
const NZ_FRAGEN = (a) => NZ({ sortArt: 'fragen', listen: [], ...a });
const NZ_esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const NZ_bild = (html) => `<div class="werkbild dsbild kbild">${html}</div>`;
const NZ_tab = (kopf, zeilen) => `<div class="dbtab"><div class="dbscroll"><table><tr>${kopf.map((k) => `<th>${k}</th>`).join('')}</tr>${zeilen.map((z) => `<tr>${z.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</table></div></div>`;
const NZ_liste = (eintraege) => `<div class="dbtab"><div class="dbscroll"><table>${eintraege.map(([b, t]) => `<tr><th>${b}</th><td>${NZ_esc(t)}</td></tr>`).join('')}</table></div></div>`;

// --- Netzbilder: Knoten { name: [x, y, art, beschriftung, oben] }, Kanten [a, b, text] ---
function NZ_knoten(art) {
  if (art === 'switch') return '<rect x="-19" y="-10" width="38" height="20" rx="3" fill="#3a6ea5" stroke="#1a3a6a" stroke-width="2"/><text y="4" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">Switch</text>';
  if (art === 'router') return '<circle r="13" fill="#c9a030" stroke="#6b4a10" stroke-width="2"/><text y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#3a2a08">⇄</text>';
  if (art === 'server') return '<rect x="-11" y="-15" width="22" height="30" rx="2" fill="#8a9ab0" stroke="#3a4a5a" stroke-width="2"/><line x1="-7" y1="-7" x2="7" y2="-7" stroke="#3a4a5a"/><line x1="-7" y1="0" x2="7" y2="0" stroke="#3a4a5a"/><circle cx="5" cy="8" r="2" fill="#7ad07a"/>';
  if (art === 'wolke') return '<ellipse rx="28" ry="15" fill="#dde6ee" stroke="#7a8a9a" stroke-width="2"/><text y="4" text-anchor="middle" font-size="9" fill="#3a4a5a">Internet</text>';
  if (art === 'punkt') return '<circle r="3" fill="#5a4a3a"/>';
  // Burg = Host (Rechner)
  return `<rect x="-14" y="-9" width="28" height="19" fill="#e8d2a8" stroke="#7a5a2a" stroke-width="2"/>
    ${[-14, -3, 8].map((x) => `<rect x="${x}" y="-14" width="6" height="5" fill="#e8d2a8" stroke="#7a5a2a" stroke-width="1.2"/>`).join('')}
    <path d="M-4,10 v-7 a4,4 0 0 1 8,0 v7 z" fill="#5a3a1a"/>`;
}
function NZ_svg(g) {
  const W = g.w || 320, Hh = g.h || 170, K = g.knoten, sk = g.skala || 1;
  let s = '';
  for (const [a, b, t] of g.kanten || []) {
    const [x1, y1] = K[a], [x2, y2] = K[b];
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5a4a3a" stroke-width="${g.dick || 2.5}"/>`;
    if (t) s += `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 5}" text-anchor="middle" font-size="10" fill="#8a2a10">${NZ_esc(t)}</text>`;
  }
  for (const [n, [x, y, art = 'burg', name = n, oben = false]] of Object.entries(K)) {
    s += `<g transform="translate(${x},${y}) scale(${sk})">${NZ_knoten(art)}</g>`;
    if (name) s += `<text x="${x}" y="${oben ? y - 20 * sk : y + 26 * sk}" text-anchor="middle" font-size="11" font-weight="700" fill="#1a1408">${NZ_esc(name)}</text>`;
  }
  return `<svg class="dssvg" viewBox="0 0 ${W} ${Hh}" style="max-width:${Math.round(W * 1.4)}px">${s}</svg>`;
}
const NZ_kreis = (n, r, cx, cy) => [...Array(n)].map((_, i) => [Math.round(cx + r * Math.sin((2 * Math.PI * i) / n)), Math.round(cy - r * Math.cos((2 * Math.PI * i) / n))]);
function NZ_topo(art) {
  const K = {}, kanten = [];
  if (art === 'bus') {
    [8, 32, 60, 88, 112].forEach((x, i) => { K['p' + i] = [x, 52, 'punkt', '']; if (i) kanten.push(['p' + (i - 1), 'p' + i]); });
    [[32, 20], [60, 86], [88, 20]].forEach(([x, y], i) => { K['h' + i] = [x, y, 'burg', '']; kanten.push(['h' + i, 'p' + (i + 1)]); });
  } else {
    const pos = NZ_kreis(5, 36, 60, 52);
    pos.forEach(([x, y], i) => { K['h' + i] = [x, y, 'burg', '']; });
    if (art === 'stern') { K.m = [60, 52, 'switch', '']; pos.forEach((_, i) => kanten.push(['m', 'h' + i])); }
    if (art === 'ring') pos.forEach((_, i) => kanten.push(['h' + i, 'h' + ((i + 1) % 5)]));
    if (art === 'masche') for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) kanten.push(['h' + i, 'h' + j]);
  }
  return NZ_svg({ w: 120, h: 104, knoten: K, kanten, skala: 0.6, dick: 2 });
}
const NZ_TOPO_BILD = `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${[['A', 'ring'], ['B', 'stern'], ['C', 'masche'], ['D', 'bus']].map(([b, a]) => `<div style="text-align:center;width:130px">${NZ_topo(a)}<div><b>${b}</b></div></div>`).join('')}</div>`;

// --- Referenzen in JS (richtige Ergebnisse) ---
const NZ_ipZahl = (ip) => ip.split('.').reduce((z, t) => z * 256 + Number(t), 0);
const NZ_zahlIp = (z) => [24, 16, 8, 0].map((s) => Math.floor(z / 2 ** s) % 256).join('.');
const NZ_maske = (p) => 2 ** 32 - 2 ** (32 - p);
const NZ_netzZahl = (ip, p) => (NZ_ipZahl(ip) & NZ_maske(p)) >>> 0;
const NZ_netz = (ip, p) => NZ_zahlIp(NZ_netzZahl(ip, p));
const NZ_bc = (ip, p) => NZ_zahlIp(NZ_netzZahl(ip, p) + 2 ** (32 - p) - 1);
const NZ_hosts = (p) => 2 ** (32 - p) - 2;
const NZ_gleich = (a, b, p) => NZ_netzZahl(a, p) === NZ_netzZahl(b, p);
const NZ_praefixFuer = (n) => { for (let p = 30; p >= 0; p--) if (NZ_hosts(p) >= n) return p; return 0; };
function NZ_lpm(tabelle, ziel) {
  let best = -1, hop = null;
  for (const [netz, p, h] of tabelle) if (NZ_netz(ziel, p) === netz && p > best) { best = p; hop = h; }
  return hop;
}
function NZ_switch(rahmen, ports) {
  const sat = {};
  return rahmen.map(([q, z, port]) => { sat[q] = port; return z in sat ? [sat[z]] : [...Array(ports)].map((_, i) => i + 1).filter((p) => p !== port); });
}
function NZ_pruefe(ip, p, gw) {
  const r = [];
  if (ip === NZ_netz(ip, p)) r.push('IP-Adresse ist die Netzadresse');
  if (ip === NZ_bc(ip, p)) r.push('IP-Adresse ist die Broadcast-Adresse');
  if (!NZ_gleich(ip, gw, p)) r.push('Gateway liegt nicht im eigenen Netz');
  if (ip === gw) r.push('IP-Adresse und Gateway sind gleich');
  return r;
}
function NZ_acks(laengen, verloren) {
  const da = laengen.map(() => false), aus = [];
  let ack = 1, k = 0;
  laengen.forEach((_, i) => { if (verloren.includes(i)) return; da[i] = true; while (k < laengen.length && da[k]) ack += laengen[k++]; aus.push(ack); });
  return aus;
}
function NZ_dns(name, zone) {
  for (let i = 0; i < 20 && zone[name]; i++) { const [typ, wert] = zone[name]; if (typ === 'A') return wert; if (typ !== 'CNAME') return null; name = wert; }
  return null;
}
const NZ_rund1 = (x) => Math.round(x * 10) / 10;
const NZ_frame = (n, prot) => n + (prot === 'TCP' ? 20 : 8) + 20 + 18;

// --- Daten aus dem Kurs ---
const NZ_SWITCH_RAHMEN = [['W', 'X', 1], ['X', 'W', 2], ['Y', 'alle', 3], ['Z', 'Y', 4], ['W', 'Z', 1]];   // Aufgabe 7.4.2
const NZ_SW = NZ_switch(NZ_SWITCH_RAHMEN, 4);
const NZ_ROUTER = [['10.0.0.0', 8, '192.168.100.2'], ['10.1.0.0', 16, '192.168.100.6'], ['10.1.2.0', 24, 'direkt'], ['0.0.0.0', 0, '203.0.113.1']];   // 7.5 Beispiel 2
const NZ_HOP_TEXT = { '192.168.100.2': 'an 192.168.100.2 über eth1', '192.168.100.6': 'an 192.168.100.6 über eth2', direkt: 'direkt über eth3', '203.0.113.1': 'an 203.0.113.1 über eth0' };
const NZ_HOP_OPT = Object.values(NZ_HOP_TEXT);
const NZ_hopFrage = (ziel) => W(`Wohin schickt der Router ein Paket an ${ziel}?`, NZ_HOP_OPT, NZ_HOP_OPT.indexOf(NZ_HOP_TEXT[NZ_lpm(NZ_ROUTER, ziel)]));
const NZ_ZONE = { 'www.schule-beispiel.de': ['A', '198.51.100.7'], 'vertretungsplan.schule-beispiel.de': ['CNAME', 'www.schule-beispiel.de'],
  'plan.schule-beispiel.de': ['CNAME', 'vertretungsplan.schule-beispiel.de'], 'mail.schule-beispiel.de': ['A', '198.51.100.25'], 'schule-beispiel.de': ['MX', 'mail.schule-beispiel.de'] };
const NZ_VLSM = [['Schülernetz', 100], ['Verwaltung', 25], ['Server', 6]];   // Aufgabe 7.6.3 (+ 1 Adresse fürs Gateway)
function NZ_vlsm() {
  let start = NZ_ipZahl('192.168.10.0');
  return NZ_VLSM.map(([name, n]) => { const p = NZ_praefixFuer(n + 1), netz = NZ_zahlIp(start), bc = NZ_zahlIp(start + 2 ** (32 - p) - 1); start += 2 ** (32 - p); return { name, p, netz, bc }; });
}
const NZ_PLAN = NZ_vlsm();

// --- Python-Hilfscode (wie in der Musterlösung 7.6.5, ohne Fehlerprüfung) ---
const NZ_PY_IP = `def ip_zu_zahl(ip):
    teile = ip.split(".")
    zahl = 0
    for teil in teile:
        zahl = zahl * 256 + int(teil)
    return zahl

def zahl_zu_ip(zahl):
    oktette = []
    for i in range(4):
        oktette.insert(0, str(zahl % 256))
        zahl = zahl // 256
    return ".".join(oktette)
`;
const NZ_PY_MASKE = `def maske(praefix):
    return 2**32 - 2**(32 - praefix)

def netzadresse(ip, praefix):
    return zahl_zu_ip(ip_zu_zahl(ip) & maske(praefix))

def gleiches_netz(ip1, ip2, praefix):
    m = maske(praefix)
    return (ip_zu_zahl(ip1) & m) == (ip_zu_zahl(ip2) & m)
`;
const NZ_PY_BC = `def broadcast(ip, praefix):
    hostteil = 2**(32 - praefix) - 1
    netz = ip_zu_zahl(ip) & maske(praefix)
    return zahl_zu_ip(netz | hostteil)
`;

// --- Bilder ---
const NZ_SWITCH_BILD = NZ_svg({ w: 320, h: 170, knoten: { W: [60, 32, 'burg', 'W'], X: [260, 32, 'burg', 'X'], Y: [60, 138, 'burg', 'Y', true], Z: [260, 138, 'burg', 'Z', true], s: [160, 85, 'switch', ''] },
  kanten: [['W', 's', 'Port 1'], ['X', 's', 'Port 2'], ['Y', 's', 'Port 3'], ['Z', 's', 'Port 4']] });
const NZ_ARP_BILD = NZ_svg({ w: 320, h: 80, knoten: { a: [40, 36, 'burg', 'PC1 192.168.0.1'], s: [160, 36, 'switch', ''], b: [280, 36, 'burg', 'PC2 192.168.0.2'] }, kanten: [['a', 's'], ['s', 'b']] })
  + NZ_tab(['Gerät', 'IP-Adresse', 'MAC-Adresse'], [['PC1', '192.168.0.1', '3C:79:30:29:FA:1F'], ['PC2', '192.168.0.2', 'B6:89:F5:BD:42:AF']]);
const NZ_DREI_BILD = NZ_svg({ w: 540, h: 150, knoten: { A: [70, 40, 'burg', 'Dresden 192.168.10.0/24', true], B: [240, 40, 'burg', 'Freiberg 192.168.20.0/24', true], C: [410, 40, 'burg', 'Meißen 192.168.30.0/24', true],
  R1: [70, 105, 'router', 'R1'], R2: [240, 105, 'router', 'R2'], R3: [410, 105, 'router', 'R3'], I: [500, 105, 'wolke', ''] },
kanten: [['A', 'R1'], ['B', 'R2'], ['C', 'R3'], ['R1', 'R2', '10.0.0.0/30'], ['R2', 'R3', '10.0.0.4/30'], ['R3', 'I']] })
  + NZ_tab(['Router', 'Schnittstellen'], [['R1', 'eth0 192.168.10.1 (Dresden) · eth1 10.0.0.1'], ['R2', 'eth0 10.0.0.2 · eth1 10.0.0.5 · eth2 192.168.20.1 (Freiberg)'], ['R3', 'eth0 10.0.0.6 · eth1 192.168.30.1 (Meißen) · eth2 203.0.113.2 → Anbieter 203.0.113.1']])
  + '<p class="hinweis">R2 kennt Dresden (192.168.10.0/24 über 10.0.0.1) und schickt alles andere über seine Default-Route 0.0.0.0/0 an R3 (10.0.0.6). R3 hat seine Default-Route zum Anbieter.</p>';
const NZ_ROUTER_BILD = NZ_tab(['Zielnetz', 'Next Hop', 'Schnittstelle'], [['10.0.0.0/8', '192.168.100.2', 'eth1'], ['10.1.0.0/16', '192.168.100.6', 'eth2'], ['10.1.2.0/24', 'direkt', 'eth3'], ['0.0.0.0/0', '203.0.113.1', 'eth0']]);
const NZ_bin = (n) => n.toString(2).padStart(8, '0');
// NAT-Tabelle (OPAL 7.5 / 7.3.5: FRITZ!Box innen 192.168.178.1, außen 203.0.113.5)
const NZ_NAT = [['192.168.178.23:51000', '203.0.113.5:40001', '198.51.100.7:443'], ['192.168.178.40:51000', '203.0.113.5:40002', '198.51.100.7:443'], ['192.168.178.23:51002', '203.0.113.5:40003', '93.184.216.34:80']];
// IPv6: Kurzform → acht Gruppen mit je vier Ziffern
function NZ_v6lang(a) {
  const [vorn, hinten] = a.split('::'), v = vorn ? vorn.split(':') : [], h = hinten !== undefined && hinten ? hinten.split(':') : [];
  const g = hinten === undefined ? v : [...v, ...Array(8 - v.length - h.length).fill('0'), ...h];
  return g.map((x) => x.padStart(4, '0'));
}
const NZ_AND_BILD = NZ_tab(['', '4. Byte', 'binär'], [['IP 192.168.10.77', '77', `<span class="mono">${NZ_bin(77)}</span>`], ['Maske /27', '224', `<span class="mono">${NZ_bin(224)}</span>`],
  ['AND', '<b>64</b>', `<b class="mono">${NZ_bin(77 & 224)}</b>`]]) + '<p class="hinweis">Netzadresse 192.168.10.64 – nur wo IP UND Maske eine 1 haben, bleibt eine 1. Hostbits auf 1 gesetzt: 64 + 31 = 95 → Broadcast 192.168.10.95.</p>';

HOEFE.push(
  // --- Kapitel 120: 🕸️ Topologien und Medien (Kurs 7.1, 7.2) ---
  NZ_FRAGEN({ id: 'ia1', kapitel: 120, ico: '🕸️', titel: 'Wie hängen die Burgen zusammen?', lohn: 55, ansicht: 'tabelle', titelAnsicht: 'Vier Botennetze',
    tabelle: () => ({ html: NZ_bild(NZ_TOPO_BILD) }),
    story: 'Willkommen bei den Botentürmen! Ich bin Nora, Kurierin des Landes. Unsere Burgen schicken sich Boten mit Nachrichten – in der Sprache der Informatik: Hosts schicken sich Pakete. Zuerst schauen wir, wie die Burgen überhaupt verbunden sind.',
    ziel: 'Ordne die vier Netze ihrer Topologie zu und zähle Leitungen.',
    merke: { titel: '🕸️ Topologien', text: 'Stern: alle Geräte hängen an einem zentralen Knoten. Bus: eine gemeinsame Leitung für alle; Ring: jeder hat zwei Nachbarn; Masche: mehrere redundante Wege; Baum: mehrere Sterne hierarchisch verbunden. Die physische Topologie beschreibt die Verkabelung, die logische Topologie den Weg, den die Daten tatsächlich nehmen.' },
    fragen: [W('Welches Bild zeigt einen Stern?', ['A', 'B', 'C', 'D'], 1),
      W('Welches Bild zeigt einen Bus (eine gemeinsame Leitung, z. B. CAN-Bus im Auto)?', ['A', 'B', 'C', 'D'], 3),
      W('In welchem Netz kommt jede Nachricht noch an, auch wenn zwei beliebige Leitungen reißen?', ['A', 'B', 'C', 'D'], 2),
      { art: 'zahl', text: 'Wie viele Leitungen braucht ein vollvermaschtes Netz aus 5 Burgen (jede mit jeder)?', soll: () => (5 * 4) / 2 },
      { art: 'zahl', text: 'Ein Firmennetz ist ein Baum mit 59 Knoten (Switches, PCs, Server). Wie viele Leitungen hat es?', soll: () => 59 - 1 },
      W('Was ist beim Stern der „Single Point of Failure“?', ['jedes einzelne Endgerät', 'der zentrale Switch', 'das längste Kabel im Netz', 'die Leitung zum Drucker'], 1),
      W('Ein alter Hub ist sternförmig verkabelt und gibt jedes Signal an alle Anschlüsse weiter. Welche Topologie hat das Netz?', ['physisch Bus, logisch Stern', 'physisch Stern, logisch Bus', 'physisch und logisch Ring', 'physisch und logisch Stern'], 1)],
    tipps: ['Masche: n Knoten, jeder mit jedem → n · (n − 1) / 2 Leitungen.', 'Ein Baum mit n Knoten hat immer n − 1 Kanten.', 'Hub: verkabelt wird sternförmig – aber wohin laufen die Signale?'] }),
  NZ_FRAGEN({ id: 'ia2', kapitel: 120, ico: '⏱️', titel: 'Wie lange braucht der Bote?', lohn: 60,
    ziel: 'Übertragungszeit = Datenmenge / Datenrate. Achte auf Bit und Byte!',
    merke: { titel: '⏱️ Übertragungszeit', text: 'Übertragungszeit = Datenmenge : Datenrate. Datenraten werden in Bit pro Sekunde angegeben (Mbit/s), Dateigrößen in Byte (1 Byte = 8 Bit) – beide Größen müssen dieselbe Einheit haben. Die effektive Datenrate ist kleiner als die angegebene (Overhead, geteilte Leitung).' },
    fragen: [{ art: 'zahl', text: 'Ein Spiel hat 24 GB (= 24 000 MB). Die Leitung hat 500 Mbit/s, effektiv nutzbar sind 75 %. Wie viele Sekunden dauert der Download?', soll: () => (24000 * 8) / (0.75 * 500) },
      { art: 'zahl', text: 'Tom rechnet: 80 000 MB : 250 Mbit/s = 320 s. Wie viele Sekunden sind es richtig (ohne Overhead)?', soll: () => (80000 * 8) / 250 },
      W('Was war Toms schwerster Fehler?', ['Megabyte durch Megabit/s geteilt – der Faktor 8 fehlt', 'mit 1000 statt 1024 gerechnet', 'Sekunden statt Minuten angegeben', 'den Overhead nicht abgezogen'], 0),
      W('Das neue Gebäude ist 250 m vom Serverraum entfernt. Welches Medium?', ['Kupfer-Twisted-Pair', 'Glasfaser – Kupfer-Twisted-Pair reicht nur bis 100 m', 'WLAN', 'ein Hub'], 1),
      W('Warum ist WLAN für viele Tablets im selben Raum am wenigsten verlässlich?', ['WLAN-Pakete haben keine Prüfsumme und kommen oft kaputt an', 'alle Geräte einer Funkzelle teilen sich die Datenrate – sie schwankt stark', 'Funkwellen gehen nicht durch Wände und Menschen hindurch', 'jedes Tablet braucht eine eigene Leitung zum Access Point'], 1)],
    tipps: ['24 000 MB · 8 = 192 000 Mbit. Effektive Rate: 0,75 · 500 = 375 Mbit/s.', '80 000 MB · 8 = 640 000 Mbit.'] }),
  NZ({ id: 'ia3', kapitel: 120, sortArt: 'funktion', ico: '🐎', titel: 'Der Rechenbote', lohn: 65,
    ziel: 'Schreib uebertragungszeit(megabyte, mbit_pro_s): die Zeit in Sekunden. Und paketzeit(pakete, leitungen, ms_je_paket): Wie viele Millisekunden dauert es, bis bei Paketvermittlung alle Pakete über eine Kette von Leitungen angekommen sind?',
    merke: { titel: '📦 Leitungs- und Paketvermittlung', text: 'Leitungsvermittlung (altes Telefon) reserviert eine feste Leitung für die ganze Verbindung. Paketvermittlung (Internet) zerlegt die Daten in Pakete, die einzeln von Knoten zu Knoten weitergereicht werden. Während ein Paket auf der zweiten Leitung ist, läuft das nächste schon auf der ersten – wie ein Fließband.' },
    listen: [[], [], [], [], [], []],
    aufrufFn: (l, k) => ['uebertragungszeit(100, 50)', 'uebertragungszeit(24000, 375)', 'uebertragungszeit(3, 100)', 'paketzeit(2000, 4, 1)', 'paketzeit(1, 4, 2000)', 'paketzeit(10, 1, 5)'][k],
    soll: (l, k) => [(100 * 8) / 50, (24000 * 8) / 375, (3 * 8) / 100, 2003, 8000, 50][k],
    testName: (k) => ['100 MB mit 50 Mbit/s', 'Spiel mit 375 Mbit/s', '3 MB mit 100 Mbit/s', '2000 Pakete über 4 Leitungen', 'ein großes Paket (= Nachrichtenvermittlung)', 'eine Leitung'][k],
    befehle: [K_B('def uebertragungszeit(megabyte, mbit_pro_s):'), K_B('megabyte * 8'), K_B('def paketzeit(pakete, leitungen, ms_je_paket):'), K_B('return')],
    tipps: ['Erst Megabyte in Megabit umrechnen (· 8), dann durch die Datenrate teilen.', 'Das erste Paket braucht leitungen · ms_je_paket. Jedes weitere Paket kommt eine Paketzeit später an.', 'Zusammen: (pakete + leitungen − 1) · ms_je_paket'],
    loesung: 'def uebertragungszeit(megabyte, mbit_pro_s):\n    return megabyte * 8 / mbit_pro_s\n\ndef paketzeit(pakete, leitungen, ms_je_paket):\n    return (pakete + leitungen - 1) * ms_je_paket' }),
  NZ_FRAGEN({ id: 'ia4', kapitel: 120, ico: '🏛️', titel: 'Zentral oder dezentral?', lohn: 60,
    ziel: 'Client-Server oder Peer-to-Peer? Leitung oder Paket?',
    merke: { titel: '🏛️ Client-Server und Peer-to-Peer', text: 'Beim Client-Server-Modell (zentral) bietet ein Server einen Dienst an, die Clients nutzen ihn. Bei Peer-to-Peer (dezentral) ist jeder Teilnehmer gleichzeitig Client und Server. Ein Dienst fasst Aufgaben eines Themengebiets zusammen und ist über ein Protokoll erreichbar.' },
    fragen: [W('Eine Webseite im Browser aufrufen', ['Client-Server', 'Peer-to-Peer'], 0),
      W('Eine Datei per BitTorrent laden (jeder lädt herunter und stellt Teile bereit)', ['Client-Server', 'Peer-to-Peer'], 1),
      W('Bitcoin-Zahlung (Blockchain ohne zentrale Bank)', ['Client-Server', 'Peer-to-Peer'], 1),
      W('E-Mails mit dem Mailprogramm abrufen', ['Client-Server', 'Peer-to-Peer'], 0),
      { art: 'zahl', text: 'Eine 2048-kbit/s-Leitung wird leitungsvermittelt für Telefonate mit je 64 kbit/s genutzt. Wie viele Gespräche passen gleichzeitig darauf?', soll: () => 2048 / 64 },
      W('Ein Server mit 1 Gbit/s schickt ein Video an 120 Laptops. Was passiert, wenn 120 weitere Laptops dazukommen?', ['es geht genauso schnell', 'jeder bekommt nur noch halb so viel – die Serverkapazität ist fest', 'es wird schneller', 'der Server sendet nur noch an die ersten 120'], 1)],
    tipps: ['Gibt es einen zentralen Anbieter? → Client-Server.', '2048 : 64', 'Der Server hat eine feste Kapazität, die sich alle Clients teilen. Bei P2P bringt jeder Peer eigene Upload-Kapazität mit.'] }),

  // --- Kapitel 121: 🧅 Schichtenmodelle (Kurs 7.3) ---
  NZ_FRAGEN({ id: 'ib1', kapitel: 121, ico: '🧅', titel: 'Turm aus Schichten', lohn: 60,
    story: 'Ein Bote muss nicht wissen, was im Brief steht – und der Schreiber nicht, über welche Straße der Bote reitet. So arbeiten auch Netze: in Schichten. Jede löst eine Teilaufgabe und nutzt die Schicht darunter.',
    ziel: 'Bring die Schichten des OSI- und des TCP/IP-Modells in die richtige Reihenfolge.',
    merke: { titel: '🧅 Schichtenmodelle', text: 'Schichtenmodelle teilen die Kommunikation in Schichten, von denen jede genau eine Teilaufgabe löst und nur die Dienste der Schicht darunter nutzt. Das OSI-Modell der ISO hat 7 Schichten, das für das Internet entwickelte TCP/IP-Modell 4. Vorteile: Abstraktion, Modularität, Standardisierung, Fehlerisolierung.' },
    fragen: [{ art: 'liste', text: 'OSI-Modell: Gib die Buchstaben von oben (Schicht 7) nach unten (Schicht 1) an.', soll: () => ['B', 'E', 'G', 'C', 'F', 'A', 'D'],
      html: NZ_liste([['A', 'Sicherungsschicht'], ['B', 'Anwendungsschicht'], ['C', 'Transportschicht'], ['D', 'Bitübertragungsschicht'], ['E', 'Darstellungsschicht'], ['F', 'Vermittlungsschicht'], ['G', 'Sitzungsschicht']]) },
    { art: 'liste', text: 'TCP/IP-Modell: Gib die Buchstaben von oben nach unten an.', soll: () => ['B', 'D', 'A', 'C'],
      html: NZ_liste([['A', 'Internetschicht'], ['B', 'Anwendungsschicht'], ['C', 'Netzzugangsschicht'], ['D', 'Transportschicht']]) },
    W('Welche OSI-Schichten fasst die Anwendungsschicht von TCP/IP zusammen?', ['1 und 2', '3 und 4', '5, 6 und 7', '4, 5 und 6'], 2),
    W('Warum sucht man Netzfehler von unten nach oben?', ['die oberen Schichten melden nie selbst einen Fehler', 'jede Schicht setzt die darunterliegende voraus', 'unten lassen sich Fehler schneller beheben als oben', 'nur die unteren Schichten lassen sich mit ping testen'], 1)],
    tipps: ['Merksatz von unten (1 → 7): „Bitte Sag Viktor, Tim Sitzt Da Auf“ – Bitübertragung, Sicherung, Vermittlung, Transport, Sitzung, Darstellung, Anwendung.', 'TCP/IP von oben: Anwendung – Transport – Internet – Netzzugang.'] }),
  NZ_FRAGEN({ id: 'ib2', kapitel: 121, ico: '🗂️', titel: 'Wer gehört wohin?', lohn: 60,
    ziel: 'Ordne Protokolle und Geräte den Schichten des TCP/IP-Modells zu.',
    merke: { titel: '🗂️ Dateneinheiten', text: 'Jede Schicht hat ihre eigenen Protokolle, ihre eigenen Geräte und ihre eigene Dateneinheit (PDU). Ein Gerät arbeitet bis zu der Schicht, deren Adressen es auswerten muss.' },
    fragen: [{ art: 'liste', text: 'Gib für HTTP, TCP, IPv4, Ethernet, Switch, Router, DNS, ICMP jeweils die Schicht an (1 = Netzzugang, 2 = Internet, 3 = Transport, 4 = Anwendung).', soll: () => [4, 3, 2, 1, 1, 2, 4, 2] },
      W('Wie heißt die Dateneinheit der Netzzugangsschicht?', ['Segment', 'Paket', 'Frame', 'Nachricht'], 2),
      W('Wie heißt die Dateneinheit von TCP?', ['Segment', 'Frame', 'Datagramm', 'Paket'], 0),
      W('Zu welcher Schicht gehört UDP?', ['Netzzugang', 'Internet', 'Transport', 'Anwendung'], 2)],
    tipps: ['ICMP (ping) meldet Fehler beim Weiterleiten – es gehört zur Internetschicht wie IP.', 'Der Switch liest nur MAC-Adressen, der Router IP-Adressen.', 'Dateneinheiten von oben: Nachricht – Segment (TCP) bzw. Datagramm (UDP) – Paket – Frame.'] }),
  NZ_FRAGEN({ id: 'ib3', kapitel: 121, ico: '✉️', titel: 'Briefe in Briefen', lohn: 65,
    ziel: 'Rechne nach, wie viel „Verpackung“ jede Schicht um die Nutzdaten legt.',
    merke: { titel: '✉️ Kapselung', text: 'Beim Senden fügt jede Schicht vorn ihren Header an (Ethernet zusätzlich hinten eine Prüfsumme) – wie Briefe in Briefen. Header-Größen: UDP 8 Byte, TCP 20, IPv4 20, Ethernet 14 + 4 Byte Prüfsumme. Der Empfänger packt in umgekehrter Reihenfolge aus, jede Schicht liest nur ihren eigenen Header.' },
    fragen: [{ art: 'zahl', text: 'Ein Sensor schickt 40 Byte Messwerte per UDP. Wie groß ist das UDP-Datagramm?', soll: () => 40 + 8 },
      { art: 'zahl', text: 'Wie groß ist das IP-Paket?', soll: () => 40 + 8 + 20 },
      { art: 'zahl', text: 'Wie groß ist der Ethernet-Frame?', soll: () => NZ_frame(40, 'UDP') },
      { art: 'zahl', text: 'Wie viel Prozent des Frames sind Header und Prüfsumme? (eine Nachkommastelle)', soll: () => NZ_rund1(((NZ_frame(40, 'UDP') - 40) / NZ_frame(40, 'UDP')) * 100), tol: 0.01 },
      W('Ein Router leitet den Frame weiter. Was ändert sich?', ['die IP-Adressen und die Ports', 'nur die Prüfsumme des Frames', 'die MAC-Adressen und die TTL – der Router baut für den nächsten Abschnitt einen neuen Frame', 'die Quell-IP-Adresse und die TTL'], 2)],
    tipps: ['Von innen nach außen: Nutzdaten + 8 (UDP) + 20 (IP) + 14 + 4 (Ethernet).', '46 Byte Verpackung von 86 Byte.'] }),
  NZ({ id: 'ib4', kapitel: 121, sortArt: 'funktion', ico: '🔍', titel: 'Fehler beim Verpacken', lohn: 70,
    ziel: 'Lehrling Kurt hat frame_groesse(nutzdaten, protokoll) und header_anteil(nutzdaten, protokoll) geschrieben – aber drei Fehler eingebaut. Finde und behebe sie. header_anteil gibt den Prozentanteil von Header und Prüfsumme am Frame zurück, gerundet auf eine Nachkommastelle.',
    vorlage: 'def frame_groesse(nutzdaten, protokoll):\n    if protokoll == "TCP":\n        transport = 8\n    else:\n        transport = 20\n    return nutzdaten + transport + 20 + 14\n\ndef header_anteil(nutzdaten, protokoll):\n    frame = frame_groesse(nutzdaten, protokoll)\n    return round(nutzdaten / frame * 100, 1)',
    listen: [[], [], [], [], []],
    aufrufFn: (l, k) => ['frame_groesse(40, "UDP")', 'frame_groesse(1460, "TCP")', 'frame_groesse(0, "UDP")', 'header_anteil(40, "UDP")', 'header_anteil(1460, "TCP")'][k],
    soll: (l, k) => [NZ_frame(40, 'UDP'), NZ_frame(1460, 'TCP'), NZ_frame(0, 'UDP'), NZ_rund1(((NZ_frame(40, 'UDP') - 40) / NZ_frame(40, 'UDP')) * 100), NZ_rund1(((NZ_frame(1460, 'TCP') - 1460) / NZ_frame(1460, 'TCP')) * 100)][k],
    testName: (k) => ['Sensor per UDP', 'voller TCP-Frame', 'nur Verpackung', 'Anteil beim Sensor', 'Anteil beim vollen Frame'][k],
    tipps: ['Welcher Header ist 8 Byte groß – TCP oder UDP?', 'Ethernet: 14 Byte Header PLUS 4 Byte Prüfsumme.', 'Gefragt ist der Anteil der Verpackung, nicht der Nutzdaten.'],
    loesung: 'def frame_groesse(nutzdaten, protokoll):\n    if protokoll == "TCP":\n        transport = 20\n    else:\n        transport = 8\n    return nutzdaten + transport + 20 + 18\n\ndef header_anteil(nutzdaten, protokoll):\n    frame = frame_groesse(nutzdaten, protokoll)\n    return round((frame - nutzdaten) / frame * 100, 1)' }),

  // --- Kapitel 122: 🔀 MAC, Switch und ARP (Kurs 7.4) ---
  NZ_FRAGEN({ id: 'ic1', kapitel: 122, ico: '🏷️', titel: 'Die Hausmarke jedes Boten', lohn: 60,
    story: 'In jeder Burg gibt es einen Hof, auf dem der Bote die letzte Etappe läuft: das lokale Netz. Dort zählt nicht der Name der Burg, sondern die Hausmarke am Tor – die MAC-Adresse.',
    ziel: 'MAC-Adressen lesen und verstehen.',
    merke: { titel: '🏷️ MAC-Adresse', text: 'Die MAC-Adresse (Media Access Control) ist die Hardware-Adresse einer Netzwerkschnittstelle, hexadezimal in Gruppen zu zwei Zeichen geschrieben (00:1A:2B:3C:4D:5E). Ein Teil nennt den Hersteller (OUI), der Rest das einzelne Gerät. Mit ihr werden Frames auf der Netzzugangsschicht zugestellt.' },
    fragen: [{ art: 'liste', text: 'Wie lautet der OUI (Hersteller-Teil) der Adresse 3C:79:30:29:FA:1F?', soll: () => ['3C:79:30'] },
      { art: 'zahl', text: 'Wie viele Bit hat eine MAC-Adresse?', soll: () => 48 },
      W('Ein Frame geht an FF:FF:FF:FF:FF:FF. Wer bekommt ihn?', ['nur das Gerät mit der höchsten MAC', 'nur der Router, der ihn ins Internet schickt', 'alle Geräte im lokalen Netz (Broadcast)', 'alle Geräte im ganzen Internet'], 2),
      W('Das Handy zeigt DA:A1:19:5C:0E:73. DA = 1101 1010, das zweitniedrigste Bit ist 1. Was heißt das?', ['Broadcast', 'lokal verwaltet – eine zufällige Adresse (MAC-Randomisierung)', 'die Adresse ist kaputt', 'es ist ein Router'], 1),
      W('Warum reicht eine MAC-Adresse nicht, um einen Rechner im Internet zu erreichen?', ['sie ist zu kurz', 'sie gilt nur im lokalen Netz – sie ist nicht hierarchisch, Router bauen für jeden Abschnitt einen neuen Frame', 'sie ändert sich jede Sekunde', 'Router kennen keine Zahlen'], 1)],
    tipps: ['Der OUI sind die ersten drei Byte.', '6 Byte · 8 Bit', 'FF:FF:FF:FF:FF:FF ist die Broadcast-Adresse.'] }),
  NZ_FRAGEN({ id: 'ic2', kapitel: 122, ico: '🔀', titel: 'Der Switch lernt', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Ein Switch mit vier Ports',
    tabelle: () => ({ html: NZ_bild(NZ_SWITCH_BILD + NZ_tab(['Nr.', 'Frame', 'Absender an Port'], NZ_SWITCH_RAHMEN.map(([q, z, p], i) => [i + 1, `${q} → ${z === 'alle' ? 'Broadcast' : z}`, p]))) + '<p class="hinweis">Die SAT (MAC-Tabelle) ist am Anfang leer.</p>' }),
    ziel: 'Spiel den Switch: Was lernt er, und an welche Ports schickt er jeden Frame weiter?',
    merke: { titel: '🔀 Wie ein Switch lernt', text: 'Der Switch merkt sich in der SAT (Source Address Table) zu jeder Quell-MAC-Adresse den Port, an dem sie hereinkam. Ist die Ziel-MAC bekannt, geht der Frame nur an diesen Port. Unbekannte Ziele und Broadcasts flutet er an alle anderen Ports (Flooding).' },
    fragen: [{ art: 'liste', menge: true, text: 'Frame 1 (W → X): An welche Ports geht er? (Nummern mit Leerzeichen)', soll: () => NZ_SW[0] },
      { art: 'liste', menge: true, text: 'Frame 2 (X → W): An welche Ports?', soll: () => NZ_SW[1] },
      { art: 'liste', menge: true, text: 'Frame 3 (Y → Broadcast): An welche Ports?', soll: () => NZ_SW[2] },
      { art: 'liste', menge: true, text: 'Frame 5 (W → Z): An welche Ports?', soll: () => NZ_SW[4] },
      W('Was lernt der Switch bei Frame 5?', ['W erneut an Port 1', 'Z an Port 4', 'nichts Neues – W kennt er schon', 'Z an alle Ports'], 2),
      W('Was unterscheidet einen Hub vom Switch?', ['ein Hub lernt MAC-Adressen und schickt nur an einen Port', 'ein Hub gibt jedes Signal an alle Anschlüsse weiter – jeder kann mitlesen, es gibt Kollisionen', 'ein Hub leitet anhand der IP-Adressen weiter wie ein Router', 'ein Hub verbindet nur zwei Geräte, ein Switch beliebig viele'], 1)],
    tipps: ['Erst lernen (Quelle → Port), dann nachschauen (Ziel bekannt?).', 'Flooding = an alle Ports außer dem, an dem der Frame hereinkam.'] }),
  NZ({ id: 'ic3', kapitel: 122, sortArt: 'funktion', ico: '🧠', titel: 'Ein Switch in Python', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Switch',
    tabelle: () => ({ html: NZ_bild(NZ_SWITCH_BILD) }),
    ziel: 'Schreib switch_lernt(rahmen, anzahl_ports): rahmen ist eine Liste von Frames [quelle, ziel, port] (ziel "alle" = Broadcast). Gib für jeden Frame die Liste der Ports zurück, an die der Switch ihn weiterleitet – lernen, dann nachschlagen oder fluten.',
    listen: [[], [], []],
    aufrufFn: (l, k) => [`switch_lernt(${py(NZ_SWITCH_RAHMEN)}, 4)`, 'switch_lernt([["A", "B", 1], ["B", "A", 2], ["C", "alle", 3], ["A", "C", 1]], 3)', 'switch_lernt([["A", "B", 1], ["B", "A", 2], ["A", "B", 3], ["B", "A", 2]], 4)'][k],
    soll: (l, k) => [NZ_SW, NZ_switch([['A', 'B', 1], ['B', 'A', 2], ['C', 'alle', 3], ['A', 'C', 1]], 3), NZ_switch([['A', 'B', 1], ['B', 'A', 2], ['A', 'B', 3], ['B', 'A', 2]], 4)][k],
    testName: (k) => ['Aufgabe 7.4.2', 'Beispiel mit drei Ports', 'A steckt um (an Port 3)'][k],
    befehle: [K_B('def switch_lernt(rahmen, anzahl_ports):'), K_B('{}'), K_B('for ¦ in rahmen:'), K_B('if ¦ in sat:'), K_B('range(1, ¦)')],
    tipps: ['sat = {} ist die MAC-Tabelle: sat["W"] = 1 heißt „W hängt an Port 1“.', 'Für jeden Frame: erst sat[quelle] = port, dann prüfen: ziel in sat?', 'Sonst alle Ports von 1 bis anzahl_ports außer dem Eingangsport sammeln.'],
    loesung: 'def switch_lernt(rahmen, anzahl_ports):\n    sat = {}\n    ausgaben = []\n    for r in rahmen:\n        quelle = r[0]\n        ziel = r[1]\n        port = r[2]\n        sat[quelle] = port\n        if ziel in sat:\n            ausgaben.append([sat[ziel]])\n        else:\n            ports = []\n            for p in range(1, anzahl_ports + 1):\n                if p != port:\n                    ports.append(p)\n            ausgaben.append(ports)\n    return ausgaben' }),
  NZ_FRAGEN({ id: 'ic4', kapitel: 122, ico: '❓', titel: 'Wer hat 192.168.0.2?', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Zwei Rechner am Switch',
    tabelle: () => ({ html: NZ_bild(NZ_ARP_BILD) }),
    ziel: 'PC1 pingt PC2 an – aber kennt dessen MAC-Adresse noch nicht. Verfolge ARP und zerlege eine Datei in Frames.',
    merke: { titel: '❓ ARP', text: 'ARP (Address Resolution Protocol) ordnet einer IP-Adresse im lokalen Netz die zugehörige MAC-Adresse zu. Es liegt an der Grenze zwischen Netzzugangs- und Internetschicht, weil es beide Adressarten verbindet. Gelernte Zuordnungen zeigt arp -a.' },
    fragen: [{ art: 'liste', text: 'Bring die Schritte in die richtige Reihenfolge (Buchstaben).', soll: () => ['C', 'A', 'D', 'B'],
      html: NZ_liste([['A', 'PC2 antwortet direkt mit seiner MAC-Adresse'], ['B', 'PC1 schickt den Ping (ICMP Echo Request) an die MAC von PC2'], ['C', 'PC1 fragt per Broadcast: Wer hat 192.168.0.2?'], ['D', 'PC1 speichert die Zuordnung im ARP-Cache']]) },
      W('Welche Ziel-MAC hat der ARP-Request?', ['3C:79:30:29:FA:1F', 'B6:89:F5:BD:42:AF', 'FF:FF:FF:FF:FF:FF', 'die MAC des Switches'], 2),
      W('Braucht der Switch eine eigene MAC-Adresse, um die Frames weiterzuleiten?', ['ja, sonst geht nichts', 'nein – er leitet transparent weiter und liest nur die MACs der Endgeräte', 'nur bei Broadcasts', 'nur für die ARP-Anfrage'], 1),
      { art: 'zahl', text: 'Eine Datei von 3 MiB (3 145 728 Byte) wird per TCP übertragen, jeder Frame trägt höchstens 1 460 Byte Nutzdaten. Wie viele Frames braucht man?', soll: () => Math.ceil(3145728 / 1460) },
      { art: 'zahl', text: 'Wie viele Byte Nutzdaten trägt der letzte Frame?', soll: () => 3145728 - Math.floor(3145728 / 1460) * 1460 }],
    tipps: ['Erst fragen, dann antworten, dann merken, dann senden.', '3 145 728 : 1 460 aufrunden. Rest = 3 145 728 − volle Frames · 1 460.'] }),

  // --- Kapitel 123: 🔢 IP-Adressen und Subnetze (Kurs 7.5, 7.6) ---
  NZ_FRAGEN({ id: 'id1', kapitel: 123, ico: '🔢', titel: 'Die Anschrift jeder Burg', lohn: 60,
    story: 'MAC-Adressen helfen nur auf dem eigenen Hof. Für den Weg durch das ganze Land braucht jede Burg eine Anschrift mit Landesteil und Hausnummer: die IP-Adresse mit Netzanteil und Hostanteil.',
    ziel: 'IPv4-Adressen, Subnetzmasken und Präfixe.',
    merke: { titel: '🔢 IPv4 und Subnetzmaske', text: 'Eine IPv4-Adresse besteht aus vier Oktetten (je 0 bis 255). Die Präfixlänge (/24) bzw. Subnetzmaske (255.255.255.0) sagt, wie viele Bit vorn der Netzanteil sind; der Rest ist der Hostanteil. Ein Netz mit h Hostbits hat 2^h Adressen, davon 2^h − 2 für Geräte (ohne Netz- und Broadcast-Adresse).' },
    fragen: [{ art: 'zahl', text: 'Wie viele Bit hat eine IPv4-Adresse?', soll: () => 32 },
      { art: 'liste', text: 'Wie lautet die Subnetzmaske zu /24?', soll: () => [NZ_zahlIp(NZ_maske(24))] },
      { art: 'liste', text: 'Wie lautet die Subnetzmaske zu /27?', soll: () => [NZ_zahlIp(NZ_maske(27))] },
      { art: 'zahl', text: 'Wie viele Geräte (Hosts) passen in ein /27-Netz?', soll: () => NZ_hosts(27) },
      { art: 'zahl', text: 'Wie viele Adressen hat ein /20-Netz insgesamt?', soll: () => 2 ** 12 },
      W('Welche Adresse ist NICHT privat (wird im Internet weitergeleitet)?', ['10.4.2.1', '172.20.5.5', '172.32.0.1', '192.168.178.34'], 2)],
    tipps: ['/27 = 27 Einsen: 255.255.255 und im letzten Byte 3 Einsen = 128 + 64 + 32.', 'Privat sind 10.0.0.0/8, 172.16.0.0/12 (172.16 bis 172.31) und 192.168.0.0/16.'] }),
  NZ({ id: 'id2', kapitel: 123, sortArt: 'funktion', ico: '🔄', titel: 'Adressen als Zahl', lohn: 70,
    ziel: 'Schreib ip_zu_zahl(ip): "192.168.10.77" → eine 32-Bit-Zahl (wie beim Horner-Schema zur Basis 256). Und zahl_zu_ip(zahl): zurück in die Punktschreibweise.',
    merke: { titel: '🔄 IP-Adresse als Zahl', text: 'Eine IPv4-Adresse ist eine 32-Bit-Zahl: jedes Oktett ist eine Ziffer zur Basis 256. 192.168.10.77 = 192 · 256³ + 168 · 256² + 10 · 256 + 77. Als Zahl kann man mit der Maske rechnen (AND, OR).' },
    listen: [[], [], [], [], []],
    aufrufFn: (l, k) => ['ip_zu_zahl("192.168.10.77")', 'ip_zu_zahl("0.0.1.0")', 'zahl_zu_ip(3232238157)', 'zahl_zu_ip(4294967295)', 'zahl_zu_ip(ip_zu_zahl("10.4.37.200"))'][k],
    soll: (l, k) => [NZ_ipZahl('192.168.10.77'), 256, NZ_zahlIp(3232238157), '255.255.255.255', '10.4.37.200'][k],
    testName: (k) => ['192.168.10.77', '0.0.1.0', '3232238157', 'größte Adresse', 'hin und zurück'][k],
    befehle: [K_B('def ip_zu_zahl(ip):'), K_B('.split(".")'), K_B('def zahl_zu_ip(zahl):'), K_B('range(4)'), K_B('".".join(¦)')],
    tipps: ['ip.split(".") liefert ["192", "168", "10", "77"]; int(teil) macht eine Zahl daraus.', 'Zurück: viermal das letzte Oktett mit % 256 abtrennen und mit // 256 weiterrechnen.', 'oktette.insert(0, …) fügt vorn ein, ".".join(oktette) klebt mit Punkten zusammen.'],
    loesung: NZ_PY_IP.trim() }),
  NZ({ id: 'id3', kapitel: 123, sortArt: 'funktion', ico: '🧮', titel: 'Netzadresse per AND', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'AND mit der Maske',
    tabelle: () => ({ html: NZ_bild(NZ_AND_BILD) }),
    ziel: 'Schreib maske(praefix) (als 32-Bit-Zahl), netzadresse(ip, praefix) (als Text) und gleiches_netz(ip1, ip2, praefix) (True/False). ip_zu_zahl und zahl_zu_ip gibt es schon.',
    merke: { titel: '🧮 Netzadresse per AND', text: 'Netzadresse = IP-Adresse AND Subnetzmaske: Die Hostbits werden 0. Zwei Rechner liegen im selben Netz, wenn ihre Netzadressen gleich sind – dann stellen sie direkt zu, sonst geht das Paket an das Standard-Gateway. Die Maske hat vorn so viele Einsen, wie das Präfix sagt, dahinter Nullen.' },
    vorspann: NZ_PY_IP,
    listen: [[], [], [], [], [], [], []],
    aufrufFn: (l, k) => ['zahl_zu_ip(maske(27))', 'maske(24)', 'netzadresse("192.168.10.77", 27)', 'netzadresse("10.4.37.200", 21)', 'gleiches_netz("192.168.10.77", "192.168.10.100", 27)', 'gleiches_netz("192.168.10.77", "192.168.10.94", 27)', 'gleiches_netz("10.4.37.200", "10.4.40.1", 21)'][k],
    soll: (l, k) => ['255.255.255.224', NZ_maske(24), NZ_netz('192.168.10.77', 27), NZ_netz('10.4.37.200', 21), NZ_gleich('192.168.10.77', '192.168.10.100', 27), NZ_gleich('192.168.10.77', '192.168.10.94', 27), NZ_gleich('10.4.37.200', '10.4.40.1', 21)][k],
    testName: (k) => ['Maske /27', 'Maske /24 als Zahl', 'Netz von .77/27', 'Netz von 10.4.37.200/21', '.77 und .100 (/27)', '.77 und .94 (/27)', '10.4.37.200 und 10.4.40.1 (/21)'][k],
    befehle: [K_B('def maske(praefix):'), K_B('def netzadresse(ip, praefix):'), K_B('def gleiches_netz(ip1, ip2, praefix):')],
    tipps: ['Maske: 2**32 minus die Zahl der Adressen im Netz, also 2**32 - 2**(32 - praefix).', '& ist das bitweise AND in Python.', 'gleiches_netz: Netzanteile beider Adressen vergleichen.'],
    loesung: NZ_PY_MASKE.trim() }),
  NZ_FRAGEN({ id: 'id4', kapitel: 123, ico: '✍️', titel: 'Von Hand gerechnet', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Beispiel: 192.168.10.77/27',
    tabelle: () => ({ html: NZ_bild(NZ_AND_BILD) }),
    ziel: 'Ein Rechner hat 10.4.37.200/21. Rechne wie im Beispiel – aber Achtung: Bei /21 liegt die Grenze zwischen Netz- und Hostanteil in einem anderen Byte.',
    fragen: [{ art: 'liste', text: 'Wie lautet die Subnetzmaske zu /21?', soll: () => [NZ_zahlIp(NZ_maske(21))] },
      { art: 'zahl', text: 'In welchem Byte der Adresse (1, 2, 3 oder 4) liegt die Grenze – also das Byte, das weder ganz Netz noch ganz Host ist?', soll: () => 3 },
      { art: 'zahl', text: 'Rechne dieses Byte der Adresse AND das passende Byte der Maske. Was kommt heraus?', soll: () => 37 & 248 },
      { art: 'liste', text: 'Wie lautet die Netzadresse?', soll: () => [NZ_netz('10.4.37.200', 21)] },
      { art: 'liste', text: 'Wie lautet die Broadcast-Adresse?', soll: () => [NZ_bc('10.4.37.200', 21)] },
      { art: 'zahl', text: 'Wie viele Hosts hat das Netz?', soll: () => NZ_hosts(21) },
      W('Liegt 10.4.40.1 im selben Netz?', ['ja', 'nein – 40 AND 248 ergibt 40, das ist ein anderes Netz'], NZ_gleich('10.4.37.200', '10.4.40.1', 21) ? 0 : 1)],
    tipps: ['/21: 8 + 8 + 5 Einsen → drittes Byte 11111000 = 248.', '37 = 00100101, AND 11111000 = 00100000 = 32.', 'Broadcast: alle Hostbits auf 1 → drittes Byte 00100111 = 39, viertes 255.'] }),
  NZ({ id: 'id5', kapitel: 123, sortArt: 'funktion', ico: '📣', titel: 'Broadcast und Hostzahl', lohn: 70,
    ziel: 'Schreib broadcast(ip, praefix): alle Hostbits auf 1 (OR mit dem Hostteil). Und hosts(praefix): wie viele Geräte passen ins Netz? ip_zu_zahl, zahl_zu_ip und maske gibt es schon.',
    merke: { titel: '📣 Broadcast-Adresse', text: 'Die Netzadresse hat alle Hostbits 0, die Broadcast-Adresse alle Hostbits 1 – beide bekommt kein Gerät. Dazwischen liegen die Hostadressen.' },
    vorspann: NZ_PY_IP + NZ_PY_MASKE,
    listen: [[], [], [], [], [], [], []],
    aufrufFn: (l, k) => ['broadcast("192.168.10.77", 27)', 'broadcast("172.16.45.13", 20)', 'broadcast("192.168.100.130", 30)', 'hosts(27)', 'hosts(20)', 'hosts(30)', 'hosts(8)'][k],
    soll: (l, k) => [NZ_bc('192.168.10.77', 27), NZ_bc('172.16.45.13', 20), NZ_bc('192.168.100.130', 30), NZ_hosts(27), NZ_hosts(20), NZ_hosts(30), NZ_hosts(8)][k],
    testName: (k) => ['.77/27', '172.16.45.13/20', 'Punkt-zu-Punkt /30', 'hosts(27)', 'hosts(20)', 'hosts(30)', 'hosts(8)'][k],
    befehle: [K_B('def broadcast(ip, praefix):'), K_B('2**(32 - praefix)'), K_B('|'), K_B('def hosts(praefix):')],
    tipps: ['Hostteil = 2**(32 - praefix) - 1 (alle Hostbits 1). | ist das bitweise OR: Netz | Hostteil.','hosts: 2**(32 - praefix) Adressen, davon zwei abziehen.'],
    loesung: (NZ_PY_BC + '\ndef hosts(praefix):\n    return 2**(32 - praefix) - 2').trim() }),
  NZ_FRAGEN({ id: 'id6', kapitel: 123, ico: '🧩', titel: 'Das Land aufteilen (VLSM)', lohn: 75,
    ziel: 'Die Burg bekommt 192.168.10.0/24 und braucht drei Subnetze: Schülernetz 100 Geräte, Verwaltung 25, Server 6 – jedes Netz braucht zusätzlich eine Adresse fürs Gateway. Vergib die Netze lückenlos, das größte zuerst.',
    merke: { titel: '🧩 Subnetting mit VLSM', text: 'Für jedes Subnetz wählt man das kleinste Netz, das alle Geräte plus Gateway fasst (Hosts = 2^h − 2). Man vergibt vom größten zum kleinsten, damit jedes Netz an einer passenden Grenze beginnt. CIDR schreibt Netze mit Präfix, z. B. 192.168.10.128/27.' },
    fragen: [{ art: 'zahl', text: 'Welches Präfix bekommt das Schülernetz (100 + 1 Adressen)?', soll: () => NZ_PLAN[0].p },
      { art: 'zahl', text: 'Welches Präfix bekommt die Verwaltung (25 + 1)?', soll: () => NZ_PLAN[1].p },
      { art: 'zahl', text: 'Welches Präfix bekommt das Servernetz (6 + 1)?', soll: () => NZ_PLAN[2].p },
      { art: 'liste', text: 'Mit welcher Netzadresse beginnt die Verwaltung?', soll: () => [NZ_PLAN[1].netz] },
      { art: 'liste', text: 'Wie lautet die Broadcast-Adresse des Servernetzes?', soll: () => [NZ_PLAN[2].bc] },
      W('Warum reicht /29 für die Server nicht?', ['zu wenig Hostadressen – /29 hat nur 6 nutzbare, gebraucht werden 7', '/29 gibt es nicht', 'Server brauchen immer /24', 'es reicht doch'], 0)],
    tipps: ['Hosts: /25 → 126, /26 → 62, /27 → 30, /28 → 14, /29 → 6.', 'Schülernetz .0 bis .127, danach beginnt die Verwaltung.'] }),
  NZ({ id: 'id7', kapitel: 123, sortArt: 'funktion', knobel: true, ico: '🕵️', titel: 'Kurts Konfigurationsprüfer', lohn: 90,
    ziel: 'Kurt wollte pruefe_konfiguration(ip, praefix, gateway) schreiben: eine Liste mit den Problemen in dieser Reihenfolge – "IP-Adresse ist die Netzadresse", "IP-Adresse ist die Broadcast-Adresse", "Gateway liegt nicht im eigenen Netz", "IP-Adresse und Gateway sind gleich" (leer = alles in Ordnung). Drei Fehler stecken drin. netzadresse, broadcast und gleiches_netz gibt es schon.',
    story: 'Im Büro der Burg geht nichts mehr: PC-2 erreicht das Internet nicht, der Laptop hat eine seltsame Adresse. Kurt hat ein Prüfprogramm geschrieben – aber es meldet bei jedem Gerät Unsinn.',
    vorspann: NZ_PY_IP + NZ_PY_MASKE + NZ_PY_BC,
    vorlage: 'def pruefe_konfiguration(ip, praefix, gateway):\n    probleme = []\n    if ip == netzadresse(ip, praefix):\n        probleme.append("IP-Adresse ist die Netzadresse")\n    if ip == broadcast(ip, 24):\n        probleme.append("IP-Adresse ist die Broadcast-Adresse")\n    if gleiches_netz(ip, gateway, 24):\n        probleme.append("Gateway liegt nicht im eigenen Netz")\n    if ip == gateway:\n        probleme.append("IP-Adresse und Gateway sind gleich")\n    return probleme',
    listen: [[], [], [], [], [], []],
    aufrufFn: (l, k) => [['192.168.50.20', 26, '192.168.50.1'], ['192.168.50.70', 26, '192.168.50.1'], ['192.168.50.63', 26, '192.168.50.1'], ['192.168.50.100', 27, '192.168.50.65'], ['192.168.50.64', 26, '192.168.50.65'], ['10.0.0.1', 8, '10.0.0.1']].map(([a, p, g]) => `pruefe_konfiguration("${a}", ${p}, "${g}")`)[k],
    soll: (l, k) => [['192.168.50.20', 26, '192.168.50.1'], ['192.168.50.70', 26, '192.168.50.1'], ['192.168.50.63', 26, '192.168.50.1'], ['192.168.50.100', 27, '192.168.50.65'], ['192.168.50.64', 26, '192.168.50.65'], ['10.0.0.1', 8, '10.0.0.1']].map(([a, p, g]) => NZ_pruefe(a, p, g))[k],
    testName: (k) => ['PC-1 (alles gut)', 'PC-2 aus dem Lagernetz', 'Laptop .63/26', 'Scanner mit /27', 'Netzadresse vergeben', 'IP = Gateway'][k],
    tipps: ['Kurt hat an zwei Stellen /24 fest eingetragen statt praefix zu benutzen.', 'Das Gateway ist ein Problem, wenn es NICHT im selben Netz liegt.'],
    loesung: 'def pruefe_konfiguration(ip, praefix, gateway):\n    probleme = []\n    if ip == netzadresse(ip, praefix):\n        probleme.append("IP-Adresse ist die Netzadresse")\n    if ip == broadcast(ip, praefix):\n        probleme.append("IP-Adresse ist die Broadcast-Adresse")\n    if not gleiches_netz(ip, gateway, praefix):\n        probleme.append("Gateway liegt nicht im eigenen Netz")\n    if ip == gateway:\n        probleme.append("IP-Adresse und Gateway sind gleich")\n    return probleme' }),
  NZ_FRAGEN({ id: 'id8', kapitel: 123, ico: '🏠', titel: 'NAT im Heimnetz', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'NAT-Tabelle der FRITZ!Box',
    tabelle: () => ({ html: NZ_bild(`<p>Innen: Laptop 192.168.178.23, Handy 192.168.178.40, FRITZ!Box 192.168.178.1 · Außen: FRITZ!Box 203.0.113.5</p>${NZ_tab(['privat (IP:Port)', 'öffentlich (IP:Port)', 'Ziel (IP:Port)'], NZ_NAT.map((z) => z.map(NZ_esc)))}`) }),
    story: 'Im Dorf hat jede Familie nur eine einzige Anschrift beim Landesboten – aber im Haus wohnen viele. Der Hausverwalter merkt sich, wer welchen Brief losgeschickt hat, und verteilt die Antworten. Genau so arbeitet NAT im Heimrouter.',
    ziel: 'Übersetze wie die FRITZ!Box zwischen privaten und öffentlichen Adressen – in beide Richtungen.',
    merke: { titel: '🏠 NAT', text: 'Private Adressen (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) werden im Internet nicht weitergeleitet. Der Heimrouter ersetzt deshalb beim Weg nach draußen die private Quell-IP durch seine öffentliche IP und den Quellport durch einen freien eigenen Port (NAT, Network Address Translation); die Zuordnung steht in der NAT-Tabelle. Kommt eine Antwort an diesen Port, setzt er Ziel-IP und Zielport wieder auf die privaten Werte.' },
    fragen: [{ art: 'liste', text: 'Der Laptop schickt ein Paket von 192.168.178.23:51000 an 198.51.100.7:443. Mit welcher Quelladresse (IP:Port) verlässt es die FRITZ!Box?', soll: () => [NZ_NAT[0][1]] },
      { art: 'liste', text: 'Eine Antwort kommt außen an 203.0.113.5:40002 an. An welche private Adresse (IP:Port) leitet die FRITZ!Box sie weiter?', soll: () => [NZ_NAT[1][0]] },
      { art: 'zahl', text: 'Laptop und Handy rufen beide 198.51.100.7 auf. Wie viele verschiedene Absender-IP-Adressen sieht dieser Webserver?', soll: () => 1 },
      { art: 'zahl', text: 'Der Laptop öffnet noch eine Verbindung von Port 51002 zu 93.184.216.34:80. Welchen öffentlichen Port hat die FRITZ!Box dafür eingetragen?', soll: () => +NZ_NAT[2][1].split(':')[1] },
      W('Warum ersetzt die FRITZ!Box nicht nur die IP-Adresse, sondern auch den Quellport?', ['Laptop und Handy nutzen beide Port 51000 – ohne eigenen Port wüsste sie nicht, wem eine Antwort gehört', 'Ports über 50000 sind im Internet verboten', 'ein neuer Port verschlüsselt die Verbindung', 'Webserver antworten nur an Ports über 40000'], 0),
      W('Von außen kommt ein Paket an 203.0.113.5:40099, dazu steht nichts in der NAT-Tabelle. Was passiert?', ['Sie verwirft das Paket – ohne Eintrag weiß sie nicht, welches Gerät gemeint ist', 'Sie schickt es per Broadcast an alle', 'Sie gibt es an das erste Gerät der Tabelle', 'Sie fragt per DNS, wer gemeint ist'], 0)],
    tipps: ['Hinaus: in der Spalte „privat“ suchen, die Spalte „öffentlich“ ablesen. Herein: umgekehrt.', 'Alle Geräte des Heimnetzes erscheinen draußen mit derselben öffentlichen IP.', 'Gleiche private Ports sind kein Problem – sie bekommen draußen verschiedene Ports.'] }),
  NZ_FRAGEN({ id: 'id9', kapitel: 123, ico: '6️⃣', titel: 'IPv6-Adressen kürzen', lohn: 70,
    ziel: 'IPv4-Adressen sind knapp – IPv6 hat 128 Bit. Lies, verlängere und kürze IPv6-Adressen und finde das /64-Präfix.',
    merke: { titel: '6️⃣ IPv6', text: 'IPv6-Adressen haben 128 Bit, geschrieben als acht Gruppen zu je vier Hexadezimalziffern, z. B. 2001:0db8:85a3:0000:0000:8a2e:0370:7334. Kürzen: Führende Nullen einer Gruppe dürfen wegfallen (0db8 → db8, 0000 → 0), und EINMAL pro Adresse darf eine Folge von Nullgruppen durch :: ersetzt werden → 2001:db8:85a3::8a2e:370:7334. Im lokalen Netz sind meist die ersten 64 Bit das Netzpräfix (/64), die letzten 64 Bit die Interface-ID; wegen der vielen Adressen braucht man normalerweise kein NAT.' },
    fragen: [{ art: 'liste', text: 'Schreib 2001:db8:85a3::8a2e:370:7334 wieder ausführlich: alle acht Gruppen mit je vier Ziffern (mit Leerzeichen oder Doppelpunkten).', soll: () => NZ_v6lang('2001:db8:85a3::8a2e:370:7334') },
      { art: 'zahl', text: 'Wie viele Nullgruppen stehen in fe80::1 für das :: ?', soll: () => 6 },
      W('Welche Kurzform von 2001:0db8:0000:0000:0000:ff00:0042:8329 ist richtig?', ['2001:db8::ff00:42:8329', '2001:db8:ff00:42:8329', '2001:db8::ff:42:8329', '2001:db8::ff00::42:8329'], 0),
      W('Warum ist 2001:db8::8a2e::7334 keine gültige Adresse?', ['das :: kommt zweimal vor – man wüsste nicht, wie viele Nullgruppen wo fehlen', 'es sind weniger als acht Gruppen', 'die Gruppe 8a2e enthält Buchstaben', ':: darf nur am Anfang stehen'], 0),
      { art: 'liste', text: 'Wie lautet das /64-Präfix von 2001:db8:85a3:4:21a:2bff:fe3c:9d1? (die vier Gruppen des Netzanteils so, wie sie in der Adresse stehen)', soll: () => ['2001', 'db8', '85a3', '4'] },
      { art: 'zahl', text: 'Ein Haushalt bekommt vom Anbieter ein /56-Präfix. Wie viele /64-Netze kann er daraus bilden?', soll: () => 2 ** (64 - 56) }],
    tipps: [':: steht für so viele 0000-Gruppen, dass es wieder genau acht Gruppen sind.', 'Führende Nullen darf man weglassen – Nullen am Ende einer Gruppe nie (ff00 bleibt ff00).', '/64 = die ersten 64 Bit = vier Gruppen zu je 16 Bit. Von /56 bis /64 bleiben 8 Bit für die Netze.'] }),

  // --- Kapitel 124: 🧭 Routing, DHCP und DNS (Kurs 7.5, 7.7, 7.8, Filius 7.13–7.16) ---
  NZ_FRAGEN({ id: 'ie1', kapitel: 124, ico: '🧭', titel: 'Der längste Präfix gewinnt', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Routingtabelle des Botenturms',
    tabelle: () => ({ html: NZ_bild(NZ_ROUTER_BILD + '<p class="hinweis">Passen mehrere Einträge, gilt der mit dem längsten Präfix (Longest-Prefix-Match). 0.0.0.0/0 passt immer.</p>') }),
    story: 'Kein Botenturm kennt den ganzen Weg. Jeder weiß nur, an welchen Turm er den Boten als Nächstes schickt – das steht in seiner Routingtabelle.',
    ziel: 'Entscheide wie der Router, wohin jedes Paket geht.',
    merke: { titel: '🧭 Routing', text: 'Ein Router vergleicht die Ziel-IP mit allen Einträgen seiner Routingtabelle (Ziel-IP AND Maske = Zielnetz?). Passen mehrere, gewinnt der längste Präfix (Longest-Prefix-Match); die Default-Route 0.0.0.0/0 greift nur, wenn nichts Genaueres passt. Er verringert die TTL um 1 und schickt das Paket an den Next Hop.' },
    fragen: [NZ_hopFrage('10.1.2.200'), NZ_hopFrage('10.1.3.1'), NZ_hopFrage('10.0.0.1'), NZ_hopFrage('172.16.0.1'),
      W('Der Eintrag 10.1.0.0/16 wird gelöscht. Wohin geht jetzt 10.1.3.1?', NZ_HOP_OPT, NZ_HOP_OPT.indexOf(NZ_HOP_TEXT[NZ_lpm(NZ_ROUTER.filter((e) => e[1] !== 16), '10.1.3.1')])),
      { art: 'zahl', text: 'Ein Paket startet mit TTL 64 und passiert drei Router. Mit welcher TTL kommt es an?', soll: () => 64 - 3 }],
    tipps: ['10.1.3.1 AND 255.255.255.0 = 10.1.3.0 ≠ 10.1.2.0 – die /24 passt nicht.', 'Jeder Router zieht 1 von der TTL ab.'] }),
  NZ({ id: 'ie2', kapitel: 124, sortArt: 'funktion', ico: '🗺️', titel: 'Ein Router in Python', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'ROUTER (Tabelle als Liste)',
    tabelle: () => ({ html: NZ_bild(NZ_ROUTER_BILD + `<p class="hinweis mono">ROUTER = ${NZ_esc(py(NZ_ROUTER))}</p>`) }),
    ziel: 'Schreib weiterleiten(tabelle, ziel_ip): tabelle ist eine Liste von Einträgen [zielnetz, praefix, next_hop]. Gib den next_hop des passenden Eintrags mit dem längsten Präfix zurück – passt keiner, None. netzadresse(ip, praefix) gibt es schon.',
    vorspann: NZ_PY_IP + NZ_PY_MASKE + `ROUTER = ${py(NZ_ROUTER)}\nOHNE_DEFAULT = ${py(NZ_ROUTER.slice(0, 3))}\n`,
    listen: [[], [], [], [], [], []],
    aufrufFn: (l, k) => ['weiterleiten(ROUTER, "10.1.2.55")', 'weiterleiten(ROUTER, "10.1.9.9")', 'weiterleiten(ROUTER, "10.200.0.1")', 'weiterleiten(ROUTER, "8.8.8.8")', 'weiterleiten(OHNE_DEFAULT, "172.16.0.1")', 'weiterleiten(OHNE_DEFAULT, "10.1.2.255")'][k],
    soll: (l, k) => [NZ_lpm(NZ_ROUTER, '10.1.2.55'), NZ_lpm(NZ_ROUTER, '10.1.9.9'), NZ_lpm(NZ_ROUTER, '10.200.0.1'), NZ_lpm(NZ_ROUTER, '8.8.8.8'), NZ_lpm(NZ_ROUTER.slice(0, 3), '172.16.0.1'), NZ_lpm(NZ_ROUTER.slice(0, 3), '10.1.2.255')][k],
    testName: (k) => ['10.1.2.55', '10.1.9.9', '10.200.0.1', '8.8.8.8 (nur Default)', 'ohne Default-Route', '10.1.2.255 ohne Default'][k],
    befehle: [K_B('def weiterleiten(tabelle, ziel_ip):'), K_B('-1'), K_B('for ¦ in tabelle:'), K_B('netzadresse(¦)'), K_B('None')],
    tipps: ['Ein Eintrag passt, wenn netzadresse(ziel_ip, praefix) == zielnetz.', 'Merk dir den bisher längsten Präfix in einer Variablen bester (Start −1).', 'next_hop = None am Anfang – dann stimmt auch „passt keiner“.'],
    loesung: 'def weiterleiten(tabelle, ziel_ip):\n    bester = -1\n    next_hop = None\n    for eintrag in tabelle:\n        netz = eintrag[0]\n        praefix = eintrag[1]\n        if netzadresse(ziel_ip, praefix) == netz and praefix > bester:\n            bester = praefix\n            next_hop = eintrag[2]\n    return next_hop' }),
  NZ_FRAGEN({ id: 'ie3', kapitel: 124, ico: '🎟️', titel: 'Eine Anschrift leihen (DHCP)', lohn: 65,
    ziel: 'Eine neue Burg kommt ins Netz und hat noch keine IP-Adresse. Wie bekommt sie eine?',
    merke: { titel: '🎟️ DHCP', text: 'DHCP ist ein Anwendungsprotokoll (UDP, Ports 67/68), mit dem ein DHCP-Server einem Client für eine begrenzte Zeit (Lease) IP-Adresse, Subnetzmaske, Standard-Gateway und DNS-Server zuweist. Der Ablauf besteht aus vier Nachrichten. Er vergibt nur Adressen aus seinem Pool, Netz- und Broadcast-Adresse und fest vergebene Adressen nie.' },
    fragen: [{ art: 'liste', text: 'Bring die vier DHCP-Nachrichten in die richtige Reihenfolge (Buchstaben).', soll: () => ['B', 'D', 'A', 'C'],
      html: NZ_liste([['A', 'Request: Der Client nimmt ein Angebot an (Broadcast)'], ['B', 'Discover: Der Client sucht einen DHCP-Server (Broadcast)'], ['C', 'Acknowledgement: Der Server bestätigt'], ['D', 'Offer: Ein Server bietet eine freie Adresse an']]) },
      W('Welche Ziel-IP hat der Discover?', ['0.0.0.0', '255.255.255.255', 'die IP des Routers', '127.0.0.1'], 1),
      W('ipconfig zeigt 169.254.17.3. Was ist los?', ['eine normale private Adresse vom Router', 'kein DHCP-Server hat geantwortet – Notadresse (APIPA)', 'das ist die Adresse des Routers', 'der DNS-Server ist kaputt'], 1),
      { art: 'zahl', text: 'Das Café-WLAN hat 192.168.40.0/26. Router hat .1, die Adressen .2 bis .9 sind reserviert. Wie viele Adressen hat der DHCP-Pool höchstens?', soll: () => NZ_hosts(26) - 9 },
      W('Die Lease beträgt 24 Stunden, täglich kommen 150 Gäste, nie mehr als 40 gleichzeitig. Was passiert?', ['nichts', 'der Pool läuft leer – gegangene Gäste behalten ihre Adresse noch einen Tag', 'die Gäste bekommen doppelte Adressen', 'das WLAN wird schneller'], 1),
      W('Warum gibt es den Request überhaupt?', ['damit der Router die Adresse in seine Routingtabelle einträgt', 'damit alle Server wissen, welches Angebot gilt – die anderen geben ihre angebotene Adresse wieder frei', 'damit der Client sein WLAN-Passwort schickt', 'damit der Client seine MAC-Adresse bekannt gibt'], 1)],
    tipps: ['DORA: Discover, Offer, Request, Acknowledgement.', 'Ohne Antwort eines DHCP-Servers gibt sich ein Gerät eine Notadresse aus 169.254.0.0/16 (APIPA).', '/26 hat 62 Hostadressen (.1 bis .62). Ohne .1 bis .9 bleiben .10 bis .62.'] }),
  NZ_FRAGEN({ id: 'ie4', kapitel: 124, ico: '📖', titel: 'Das Telefonbuch des Netzes (DNS)', lohn: 65,
    ziel: 'Wie wird aus einem Namen wie beispiel-verein.org eine IP-Adresse?',
    merke: { titel: '📖 DNS', text: 'DNS übersetzt Namen in IP-Adressen; die Namen sind hierarchisch aufgebaut (Root, Top-Level-Domain, Second-Level-Domain, Subdomains). Ein Resolver fragt sich für den Client durch die Hierarchie und speichert Antworten für die Dauer ihrer TTL im Cache. Die Einträge (Records) haben verschiedene Typen, je nachdem, was sie speichern.' },
    fragen: [W('Was ist bei mail.schule-beispiel.sachsen.de die Top-Level-Domain?', ['mail', 'schule-beispiel', 'sachsen', 'de'], 3),
      { art: 'liste', text: 'Bring die Schritte der Namensauflösung in die richtige Reihenfolge (Buchstaben).', soll: () => ['B', 'A', 'D', 'C', 'E'],
        html: NZ_liste([['A', 'Resolver fragt einen Root-Server: Verweis auf die .org-Server'], ['B', 'Client fragt seinen Resolver nach beispiel-verein.org'], ['C', 'Autoritativer Nameserver: A-Record 203.0.113.44'], ['D', '.org-TLD-Server: Verweis auf den zuständigen Nameserver'], ['E', 'Resolver antwortet dem Client und speichert den Eintrag im Cache']]) },
      { art: 'liste', text: 'Welcher Record-Typ gehört zu (a) IPv6-Adresse, (b) Mailserver einer Domain, (c) Alias-Name? (drei Typen mit Leerzeichen)', soll: () => ['AAAA', 'MX', 'CNAME'] },
      W('Der A-Eintrag hat TTL 600 s. Der Resolver fragt um 8:00 Uhr. Woher kommt die Antwort auf eine Anfrage um 8:12 Uhr?', ['aus dem Cache des Resolvers', 'vom autoritativen Nameserver – der Cache-Eintrag ist nach 600 s abgelaufen', 'direkt von einem Root-Server', 'aus dem Cache des DHCP-Servers'], 1),
      W('ping 192.168.3.2 klappt, ping gdp.de nicht. Wo liegt der Fehler?', ['am Netzwerkkabel des Rechners', 'am Standardgateway (Router)', 'bei der Namensauflösung (DNS)', 'am Switch im Klassenraum'], 2),
      { art: 'zahl', text: 'Über welchen Port (UDP) laufen DNS-Anfragen?', soll: () => 53 }],
    tipps: ['Die TLD steht ganz rechts.', 'Root → TLD → autoritativ: vom Allgemeinen zum Besonderen.', 'Record-Typen: A (IPv4), AAAA (IPv6), MX (Mailserver), CNAME (Alias).'] }),
  NZ({ id: 'ie5', kapitel: 124, sortArt: 'funktion', ico: '🔎', titel: 'Ein kleiner Resolver', lohn: 80, ansicht: 'tabelle', titelAnsicht: 'Zonendatei schule-beispiel.de',
    tabelle: () => ({ html: NZ_bild(NZ_tab(['Name', 'Typ', 'Wert'], Object.entries(NZ_ZONE).map(([n, [t, w]]) => [NZ_esc(n), t, NZ_esc(w)]))) }),
    ziel: 'Schreib aufloesen(name, zone): zone ist ein Dictionary name → [typ, wert]. Bei einem A-Eintrag gib die IP-Adresse zurück, bei einem CNAME löse den Zielnamen weiter auf. Gibt es den Namen nicht oder nur einen anderen Typ (z. B. MX), gib None zurück.',
    vorspann: `ZONE = ${py(NZ_ZONE)}\n`,
    listen: [[], [], [], [], []],
    aufrufFn: (l, k) => ['aufloesen("www.schule-beispiel.de", ZONE)', 'aufloesen("vertretungsplan.schule-beispiel.de", ZONE)', 'aufloesen("plan.schule-beispiel.de", ZONE)', 'aufloesen("schule-beispiel.de", ZONE)', 'aufloesen("gdp.de", ZONE)'][k],
    soll: (l, k) => ['www.schule-beispiel.de', 'vertretungsplan.schule-beispiel.de', 'plan.schule-beispiel.de', 'schule-beispiel.de', 'gdp.de'].map((n) => NZ_dns(n, NZ_ZONE))[k],
    testName: (k) => ['A-Eintrag', 'CNAME → www', 'zwei CNAMEs hintereinander', 'nur MX', 'unbekannter Name'][k],
    befehle: [K_B('def aufloesen(name, zone):'), K_B('while ¦ in zone:'), K_B('zone[name]'), K_B('elif ¦:'), K_B('"CNAME"')],
    tipps: ['Solange der Name in der Zone steht: Typ ansehen.', 'A → fertig, Wert zurückgeben. CNAME → name = Wert und weiter. Sonst → None.', 'Nach der Schleife (Name unbekannt): return None.'],
    loesung: 'def aufloesen(name, zone):\n    while name in zone:\n        typ = zone[name][0]\n        wert = zone[name][1]\n        if typ == "A":\n            return wert\n        elif typ == "CNAME":\n            name = wert\n        else:\n            return None\n    return None' }),

  // --- Kapitel 125: 🤝 TCP, UDP und Dienste (Kurs 7.9, 7.10, Projekt 7.17) ---
  NZ_FRAGEN({ id: 'if1', kapitel: 125, ico: '🤝', titel: 'Einschreiben oder Postkarte?', lohn: 60,
    story: 'Manche Boten bringen Einschreiben: Jede Seite wird quittiert, Verlorenes neu geschickt. Andere werfen nur Postkarten ein – schnell, aber ohne Gewähr. Im Netz heißen sie TCP und UDP.',
    ziel: 'Entscheide: TCP oder UDP?',
    merke: { titel: '🤝 TCP und UDP', text: 'TCP ist verbindungsorientiert und zuverlässig: Drei-Wege-Handshake, Sequenznummern, Bestätigungen, erneutes Senden. UDP ist verbindungslos und schlank: keine Bestätigung, kein Neusenden. Die IP-Adresse bestimmt den Rechner, der Port das Programm auf diesem Rechner.' },
    fragen: [W('Videocall', ['TCP', 'UDP'], 1), W('Webseite per HTTPS laden', ['TCP', 'UDP'], 0), W('DNS-Anfrage (kurze Frage, kurze Antwort)', ['TCP', 'UDP'], 1),
      W('Update-Datei herunterladen', ['TCP', 'UDP'], 0), W('Positionen der Mitspieler in einem Online-Spiel', ['TCP', 'UDP'], 1),
      W('„UDP ist schneller, weil es kürzere Wege durchs Netz nimmt.“ Stimmt das?', ['ja', 'nein – den Weg bestimmen die Router; UDP spart Verbindungsaufbau, Bestätigungen und Warten', 'nur im WLAN', 'nur bei IPv6'], 1),
      W('Zwei Browser-Tabs sprechen mit demselben Server (Port 443). Woran unterscheidet der Laptop die Antworten?', ['an der MAC-Adresse', 'an den Quellports – jeder Tab hat einen eigenen, z. B. 50123 und 50124', 'an der TTL', 'an der Ziel-IP-Adresse'], 1)],
    tipps: ['Muss jedes Byte ankommen? → TCP. Ist eine veraltete Wiederholung nutzlos? → UDP.'] }),
  NZ({ id: 'if2', kapitel: 125, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🔢', titel: 'Der Drei-Wege-Handshake', lohn: 70,
    ziel: 'Ein Client baut eine TCP-Verbindung auf und schickt zwei Segmente mit je 200 Byte. Sag die Nummern voraus, bevor der Code läuft.',
    listen: [[]], code: `def versuch():
    seq_client = 300
    seq_server = 7000
    syn = [seq_client, 0]
    syn_ack = [seq_server, seq_client + 1]
    ack = [seq_client + 1, seq_server + 1]
    segment1 = seq_client + 1
    segment2 = segment1 + 200
    bestaetigung = segment2 + 200
    return [syn_ack[1], ack[1], segment2, bestaetigung]`,
    merke: { titel: '🔢 Sequenz- und Bestätigungsnummern', text: 'Der Drei-Wege-Handshake (SYN, SYN-ACK, ACK) baut eine TCP-Verbindung auf; beide Seiten wählen dabei eine zufällige Startnummer. Die Sequenznummer zählt die gesendeten Bytes, die Bestätigungsnummer nennt das nächste erwartete Byte und bestätigt alles davor auf einmal (kumulativ). Fehlende Daten schickt der Sender erneut.' },
    fragen: [{ art: 'zahl', text: 'Welche Ack-Nummer steht im SYN-ACK des Servers?', soll: (l) => l.wert[0] },
      { art: 'zahl', text: 'Welche Ack-Nummer schickt der Client im ACK?', soll: (l) => l.wert[1] },
      { art: 'zahl', text: 'Welche Seq-Nummer hat das 2. Datensegment?', soll: (l) => l.wert[2] },
      { art: 'zahl', text: 'Mit welcher Ack-Nummer bestätigt der Server beide Segmente auf einmal?', soll: (l) => l.wert[3] },
      W('Das 1. Datensegment geht verloren, das 2. kommt an. Was bestätigt der Server?', ['Ack = 701', 'Ack = 301 – Byte 301 fehlt noch', 'Ack = 501', 'gar nichts'], 1)],
    tipps: ['SYN zählt wie ein Byte: Die Antwort bestätigt x + 1.', 'Die Bytes 301 bis 500 stehen im ersten Segment.'] }),
  NZ({ id: 'if3', kapitel: 125, sortArt: 'funktion', ico: '📬', titel: 'Quittungen zählen', lohn: 80,
    ziel: 'Schreib acks(laengen, verloren): Segmente mit den Längen laengen werden nacheinander gesendet, die Sequenznummern beginnen bei 1. Segmente, deren Index in verloren steht, kommen nicht an. Gib für jedes ankommende Segment die Bestätigungsnummer zurück, die der Empfänger schickt (nächstes erwartetes Byte, kumulativ – zu früh angekommene Segmente werden aufbewahrt).',
    listen: [[], [], [], []],
    aufrufFn: (l, k) => ['acks([1000, 1000, 1000, 1000], [])', 'acks([1000, 1000, 1000, 1000], [1])', 'acks([200, 300, 100], [0])', 'acks([500, 500, 500, 500, 500], [2])'][k],
    soll: (l, k) => [NZ_acks([1000, 1000, 1000, 1000], []), NZ_acks([1000, 1000, 1000, 1000], [1]), NZ_acks([200, 300, 100], [0]), NZ_acks([500, 500, 500, 500, 500], [2])][k],
    testName: (k) => ['nichts verloren', 'Segment 2 verloren (7.9.5)', 'das erste verloren', 'Segment 3 verloren'][k],
    befehle: [K_B('def acks(laengen, verloren):'), K_B('not in verloren'), K_B('while ¦:'), K_B('angekommen[k]'), K_B('.append(¦)')],
    tipps: ['Merk dir in einer Liste angekommen, welche Segmente schon da sind.', 'naechstes (Start 1) wächst nur, solange das Segment k lückenlos da ist.', 'Nach jedem angekommenen Segment: antworten.append(naechstes).'],
    loesung: 'def acks(laengen, verloren):\n    n = len(laengen)\n    angekommen = []\n    for i in range(n):\n        angekommen.append(False)\n    naechstes = 1\n    k = 0\n    antworten = []\n    for i in range(n):\n        if i not in verloren:\n            angekommen[i] = True\n            while k < n and angekommen[k]:\n                naechstes = naechstes + laengen[k]\n                k = k + 1\n            antworten.append(naechstes)\n    return antworten' }),
  NZ_FRAGEN({ id: 'if4', kapitel: 125, ico: '📮', titel: 'Dienste und Ports', lohn: 65,
    ziel: 'Welche Protokolle der Anwendungsschicht arbeiten auf welchem Port?',
    merke: { titel: '📮 Anwendungsprotokolle', text: 'Dienste der Anwendungsschicht erreicht man über ein Protokoll und ihren Standardport. Ohne TLS übertragen HTTP, FTP, SMTP, POP3 und IMAP alles im Klartext; mit TLS gibt es verschlüsselte Varianten (z. B. HTTPS). Für E-Mail gibt es getrennte Protokolle zum Versenden und zum Abrufen.' },
    fragen: [{ art: 'liste', text: 'Gib die Ports für HTTPS, DNS, SMTP-Einlieferung und IMAP mit TLS an (mit Leerzeichen).', soll: () => [443, 53, 587, 993] },
      W('Eine Lehrerin liest ihre Mails am Laptop, Tablet und Handy. Was soll sie einrichten?', ['POP3', 'IMAP – die Mails bleiben auf dem Server, alle Geräte sind gleich', 'FTP', 'DHCP'], 1),
      W('Mit welchem Protokoll werden Mails versendet?', ['IMAP', 'POP3', 'SMTP', 'DNS'], 2),
      W('Der Browser meldet 404 Not Found. Was heißt das?', ['der Webserver ist aus', 'den Pfad gibt es nicht – der Server läuft, findet aber die angefragte Seite nicht', 'DNS findet den Namen nicht', 'Zugriff nur mit Anmeldung'], 1),
      W('Bei Oma steht im Postausgang Port 110. Warum kann sie nicht senden?', ['falscher Dienst – 110 ist der Port von POP3 (Abruf), nicht von SMTP', 'Port 110 ist zu klein', 'das ist richtig so', 'man braucht Port 80'], 0),
      W('Der Browser ruft http://schule-beispiel.de/vertretung auf und wird auf https://… weitergeleitet. Was schützt TLS ab dann?', ['nur das Passwort-Feld', 'Inhalt, Eingaben und Cookies – IP-Adressen und Ports bleiben aber sichtbar', 'alles, auch IP-Adressen und Ports', 'nur den Domainnamen in der Adresse'], 1),
      W('Warum soll der Verein FTP (Port 21) schließen?', ['Klartext – FTP überträgt Benutzername, Passwort und Dateien unverschlüsselt, besser SFTP (Port 22)', 'zu langsam', 'Port 21 ist belegt', 'keine großen Dateien'], 0)],
    tipps: ['HTTP 80, HTTPS 443, DNS 53, SMTP-Einlieferung 587, IMAP 143 (mit TLS 993), POP3 110 (mit TLS 995).', 'IMAP lässt die Mails auf dem Server, POP3 lädt sie auf ein Gerät herunter; versendet wird mit SMTP.'] }),
  NZ_FRAGEN({ id: 'if5', kapitel: 125, knobel: true, ico: '⭐', titel: 'Das Netz der drei Burgen', lohn: 95, ansicht: 'tabelle', titelAnsicht: 'Drei Standorte, drei Router',
    tabelle: () => ({ html: NZ_bild(NZ_DREI_BILD) }),
    story: 'Die drei Burgen Dresden, Freiberg und Meißen sollen ein gemeinsames Netz bekommen. Du bist die Netzplanerin – prüfe, ob alles stimmt, bevor der erste Bote losreitet.',
    ziel: 'Plane und prüfe das Netz: Routingtabellen, Weg eines Pakets, typische Fehler.',
    fragen: [{ art: 'liste', text: 'Welchen Next Hop trägt R1 für die Default-Route 0.0.0.0/0 ein?', soll: () => ['10.0.0.2'] },
      { art: 'liste', text: 'Welchen Next Hop braucht R3 für Dresden (192.168.10.0/24)?', soll: () => ['10.0.0.5'] },
      { art: 'liste', text: 'tracert 192.168.30.8 (Meißen) auf 192.168.10.5 (Dresden): Welche Adressen antworten der Reihe nach? (jeder Router meldet sich mit der Schnittstelle, an der das Paket ankam)', soll: () => ['192.168.10.1', '10.0.0.2', '10.0.0.6', '192.168.30.8'] },
      { art: 'zahl', text: 'Das Paket startet mit TTL 64. Mit welcher TTL kommt es bei 192.168.30.8 an?', soll: () => 61 },
      { art: 'zahl', text: 'Wie viele Hostadressen hat ein Transfernetz /30?', soll: () => NZ_hosts(30) },
      W('PC-17 in Freiberg: IP 192.168.20.17/24, Gateway 192.168.2.1. Was bemerkt man?', ['nichts', 'nur Freiberg geht – das Gateway liegt nicht im eigenen Netz, andere Netze und das Internet sind nicht erreichbar', 'gar nichts geht, auch nicht in Freiberg', 'nur DNS fällt aus'], 1),
      W('R3 bekommt statt der zwei Einzelrouten für Dresden und Freiberg nur 192.168.0.0/19 über 10.0.0.5. Was passiert mit einem Paket an 192.168.5.5?', ['es wird sofort verworfen', 'es pendelt zwischen R2 und R3 – Routing-Schleife, bis die TTL 0 ist', 'es kommt in Dresden an', 'R3 schickt es über die Default-Route ins Internet'], 1)],
    tipps: ['Für R1 liegt der ganze Rest der Welt hinter R2.', 'Router melden sich bei tracert mit der Eingangsschnittstelle: R1 eth0, R2 eth0, R3 eth0.', '/19 reicht von 192.168.0.0 bis 192.168.31.255 – R2 kennt 192.168.5.0 nicht und nimmt seine Default-Route zurück zu R3.'] }),
);

// --- 📓 Heft ---
HEFT_EXTRA[120] = { titel: 'Topologien und Übertragungszeit', text: ['Topologien: Stern (zentraler Switch), Bus (eine Leitung), Ring, Masche (redundante Wege), Baum (Sterne hierarchisch verbunden).', 'Übertragungszeit = Datenmenge : Datenrate – Byte erst mit 8 malnehmen, Datenraten sind in Bit/s angegeben.', 'Client-Server: zentraler Dienst; Peer-to-Peer: jeder ist Client und Server. Paketvermittlung zerlegt Daten in Pakete, die einzeln weitergereicht werden.'], code: 'def uebertragungszeit(megabyte, mbit_pro_s):\n    return megabyte * 8 / mbit_pro_s' };
HEFT_EXTRA[121] = { titel: 'Schichtenmodelle und Kapselung', text: ['OSI: Anwendung, Darstellung, Sitzung, Transport, Vermittlung, Sicherung, Bitübertragung. TCP/IP: Anwendung, Transport, Internet, Netzzugang.', 'Dateneinheiten: Nachricht – Segment/Datagramm – Paket – Frame.', 'Kapselung: Jede Schicht fügt ihren Header an (UDP 8, TCP 20, IP 20, Ethernet 14 + 4 Byte); der Empfänger packt in umgekehrter Reihenfolge aus.'] };
HEFT_EXTRA[122] = { titel: 'MAC, Switch und ARP', text: ['Die MAC-Adresse (48 Bit, OUI + Gerätenummer) adressiert ein Gerät im lokalen Netz; FF:FF:FF:FF:FF:FF ist Broadcast.', 'Ein Switch lernt in seiner SAT, an welchem Port welche Quell-MAC hängt; unbekannte Ziele und Broadcasts flutet er.', 'ARP fragt per Broadcast „Wer hat diese IP?“ und speichert die Antwort im ARP-Cache.'], code: 'sat[quelle] = port\nif ziel in sat:\n    ausgaben.append([sat[ziel]])' };
HEFT_EXTRA[123] = { titel: 'IP-Adressen, Subnetting und CIDR', text: ['IPv4: 32 Bit, Netzanteil + Hostanteil; die Präfixlänge (/24) bzw. Maske (255.255.255.0) legt die Grenze fest.', 'Netzadresse = IP AND Maske, Broadcast = Netz OR Hostteil; Hosts = 2^(32 − p) − 2. Gleiches Netz → direkt zustellen, sonst ans Standard-Gateway.', 'VLSM: Subnetze vom größten zum kleinsten vergeben, jeweils das kleinste passende Präfix.', 'NAT: Der Router ersetzt die privaten Adressen (z. B. 192.168.x.x) beim Weg ins Internet durch seine eine öffentliche Adresse und merkt sich in einer Tabelle, welche Antwort zu welchem Rechner gehört.', 'IPv6: 128 Bit statt 32, geschrieben als 8 Blöcke aus 4 Hex-Ziffern (z. B. 2001:db8::1) – so viele Adressen, dass jedes Gerät eine eigene öffentliche bekommen kann.'], code: 'def maske(praefix):\n    return 2**32 - 2**(32 - praefix)\n\nnetz = ip_zu_zahl(ip) & maske(praefix)' };
HEFT_EXTRA[124] = { titel: 'Routing, DHCP und DNS', text: ['Router entscheiden nur über den Next Hop: Longest-Prefix-Match, die Default-Route 0.0.0.0/0 greift zuletzt; jeder Router senkt die TTL um 1.', 'DHCP verleiht Adresse, Maske, Gateway und DNS-Server: Discover – Offer – Request – Acknowledgement.', 'DNS übersetzt Namen in IP-Adressen: Resolver → Root → TLD → autoritativer Nameserver; A, AAAA, MX, CNAME.'] };
HEFT_EXTRA[125] = { titel: 'TCP, UDP und Anwendungsprotokolle', text: ['TCP: Drei-Wege-Handshake (SYN, SYN-ACK, ACK), Sequenznummern, kumulative Bestätigungen, Neusenden. UDP: verbindungslos, ohne Bestätigung.', 'Ports adressieren Programme: HTTP 80, HTTPS 443, DNS 53, SMTP 587/25, IMAP 993, POP3 995, SSH 22.', 'IMAP lässt Mails auf dem Server, POP3 lädt sie herunter; SMTP versendet.'] };
