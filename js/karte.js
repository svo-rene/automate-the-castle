'use strict';
// --- 🗺️ Die Karte: morgens Aufträge wählen, abends die Burg ausbauen --------------------

let WAHL = null;    // gewählter Hof auf der Karte (oder 'pruefung')
let KAP = null;     // gewähltes Kapitel (für Sprünge aus dem Morgenbericht)
let DORF = null;    // betretenes Dorf (Kapitel) – null = Landkarte
let SEL = null;     // gewählter Bauplatz am Abend
let KAUF = null;    // Kauf, der noch ein zweites Antippen braucht

function karteStart() {
  if (P.phase === 'abend' || ENDLOS) { abendStart(); return; }   // ♾️ Endlos-Modus: kein Tag, nach der Nacht gleich wieder Abend
  P.phase = 'morgen';
  speichern();
  zeigeScreen('karte');
  uebergang('morgen');   // erst, wenn die Ergebniskarte der Nacht zu ist
  hud();
  neben([]);
  // Morgens den nächsten offenen Hof vorwählen; ist das Dorf fertig, geht es auf die Landkarte (neues Dorf sehen)
  if (WAHL && WAHL !== 'pruefung' && P.hoefe[WAHL]?.fertig) WAHL = null;
  const naechst = naechsterHof();
  if (DORF && naechst && naechst.kapitel !== DORF && kapitelFertig(DORF)) DORF = null;
  renderKarte();
  // 👆 Am allerersten Morgen: Hand zeigt aufs Dorf und dann auf den Hof
  if (!Object.values(P.hoefe).some((s) => s.fertig)) anleitung('karte', [
    { ziel: () => document.querySelector('.kdorf.offen'), text: `Tippe auf ${{ Dorf: 'das Dorf', Saal: 'den Saal', Stockwerk: 'den Turm', Speicher: 'den Speicher', Kuppel: 'die Kuppel', Werkbank: 'die Werkbank', Station: 'die Station', Schlag: 'den Taubenschlag', Tor: 'das Tor', Turm: 'den Turm' }[ortWort(burgKapitel()[0]).ort]}`, fertig: () => !!document.querySelector('.khof') || P.phase !== 'morgen' },
    { ziel: () => document.querySelector('.weiterhier')?.closest('.khof') || document.querySelector('.khof.offen'), text: `${ortWort(burgKapitel()[0]).hof} antippen`, fertig: () => P.phase !== 'morgen' },
  ], () => P.phase === 'morgen');
  if (roboBerichtZeigen()) return;
  if (roboterBekannt() && erklaere('roboter')) return;
  erklaerungenPruefen();
}

// --- Landkarte als SVG: Burg in der Mitte, je Kapitel ein Dorf am Weg, der Rest im Nebel ---
// Der Weg wächst mit jedem Kapitel. Sichtbar: offene Dörfer und genau EIN gesperrtes („???“).
// Plätze 9–11 liegen östlich des Flusses (Burg 9 hat 11 Kapitel); sind sie sichtbar, ist der Nebel weg
const KARTE_DOERFER = [null, [400, 480], [245, 515], [105, 440], [115, 290], [215, 165], [370, 75], [700, 80], [870, 150], [890, 300], [790, 420], [690, 520], [860, 525]];
const KARTE_TOR = [480, 360];
const KARTE_BRUECKE = [600, 78];
const KARTE_REGIONEN = { signal: [700, 300], torwerk: [870, 290], tauben: [800, 400], archiv: [660, 510], spaeher: [940, 400], werkstatt: [905, 540], handel: [785, 555] };
const KARTE_TURM = [552, 500];   // ⚜️ Prüfungsturm
const KARTE_BAEUME = [[555, 545], [490, 570], [30, 30], [20, 200], [15, 370], [150, 585], [330, 585], [560, 200], [545, 30], [345, 250], [300, 190], [30, 100], [470, 160]];

function svgBurg(x, y, s = 1) {
  const zinnen = (x0, x1, yy, f) => { let o = ''; for (let i = x0; i < x1; i += 18) o += `<rect x="${i}" y="${yy}" width="11" height="11" fill="${f}"/>`; return o; };
  const turm = (tx) => `<rect x="${tx - 24}" y="-40" width="48" height="112" fill="#a7afc2" stroke="#5d6578" stroke-width="2"/>
    ${zinnen(tx - 24, tx + 24, -51, '#a7afc2')}<polygon points="${tx - 30},-51 ${tx},-100 ${tx + 30},-51" fill="#b8402e" stroke="#7a2418" stroke-width="2"/>
    <rect x="${tx - 5}" y="-20" width="10" height="16" rx="5" fill="#2b2f3d"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="0" cy="78" rx="165" ry="26" fill="rgba(0,0,0,.25)"/>
    <rect x="-112" y="-8" width="224" height="80" fill="#959eb2" stroke="#5d6578" stroke-width="2"/>${zinnen(-112, 112, -19, '#959eb2')}
    <rect x="-40" y="-78" width="80" height="80" fill="#b6bdcd" stroke="#5d6578" stroke-width="2"/>${zinnen(-40, 40, -89, '#b6bdcd')}
    <polygon points="-48,-89 0,-140 48,-89" fill="#c4473a" stroke="#7a2418" stroke-width="2"/>
    <line x1="0" y1="-140" x2="0" y2="-172" stroke="#3a2a1a" stroke-width="3"/><polygon points="0,-172 30,-163 0,-153" fill="#ffd84a"/>
    <rect x="-12" y="-60" width="10" height="16" rx="5" fill="#2b2f3d"/><rect x="2" y="-60" width="10" height="16" rx="5" fill="#2b2f3d"/>
    ${turm(-128)}${turm(128)}
    <path d="M-24,72 v-34 a24,24 0 0 1 48,0 v34 z" fill="#4a321c" stroke="#2c1d10" stroke-width="2"/>
    <line x1="0" y1="14" x2="0" y2="72" stroke="#2c1d10" stroke-width="2"/></g>`;
}

// 📜 Archiv-Kapitel (Burg 9) bekommen eigene Bilder: Bibliothek statt Dorf, Regale statt Höfe, Lesesaal statt Dorfplatz
const archivKap = (k) => kapitelHoefe(k)[0]?.art === 'sql';
// 🔭 Späherturm-Kapitel (KI): Turm mit Fernrohr statt Dorf, Lernpulte statt Höfe
const spaeherKap = (k) => kapitelHoefe(k)[0]?.art === 'ki';
// 🌾 Kornspeicher-Kapitel (LK Sortieren): Speicher statt Dorf, Aufträge statt Höfe
const kornKap = (k) => kapitelHoefe(k)[0]?.art === 'sort' && !kapitelHoefe(k)[0]?.warte;
// 🔭 Sternwarte-Kapitel (LK KI): Kuppeln statt Speicher; 🔧 Werkstatt (LK OOP): Werkbänke
const werkKap = (k) => !!kapitelHoefe(k)[0]?.werk;
// 🐎 Poststation (LK Datenstrukturen): Stationen statt Dörfer
const wegKap = (k) => !!kapitelHoefe(k)[0]?.weg;
// 🗄️ Staatsarchiv (LK Daten): Python-Kapitel sehen aus wie die Säle des Archivs
const kontorKap = (k) => !!kapitelHoefe(k)[0]?.kontor;
// 🕊️ Taubenschlag (LK Sicherheit)
const kryptoKap = (k) => !!kapitelHoefe(k)[0]?.krypto;
// ⚙️ Torwerk (LK Automaten)
const torKap = (k) => !!kapitelHoefe(k)[0]?.tor;
// 🔦 Signalturm (LK Technik)
const signalKap = (k) => !!kapitelHoefe(k)[0]?.signal;
// Allgemein: Aufgaben können ihren Ort selbst mitbringen – ortInfo = { ort, im, ico, haupt, sub, svg(fertig) } (neue Burgen ohne Eingriff hier)
const plusKap = (k) => kapitelHoefe(k)[0]?.ortInfo || null;
const warteKap = (k) => !!kapitelHoefe(k)[0]?.warte && !werkKap(k) && !wegKap(k) && !kontorKap(k) && !kryptoKap(k) && !torKap(k) && !signalKap(k) && !plusKap(k);
function svgWerkstatt(fertig) {
  return `<ellipse cx="0" cy="30" rx="42" ry="8" fill="rgba(0,0,0,.25)"/>
    <rect x="-34" y="-12" width="68" height="42" fill="#8a6a4a" stroke="#4a3018" stroke-width="2"/>
    <polygon points="-40,-12 0,-40 40,-12" fill="${fertig ? '#c9a030' : '#5a6a7a'}" stroke="#2a3038" stroke-width="2"/>
    <rect x="18" y="-36" width="9" height="16" fill="#6a6a6a"/><circle cx="23" cy="-42" r="4" fill="rgba(220,220,220,.6)"/>
    <rect x="-8" y="8" width="16" height="22" fill="#3e2410"/><rect x="-28" y="0" width="12" height="10" fill="${fertig ? '#ffe27a' : '#2b2f3d'}"/>
    <text x="16" y="14" style="font-size:13px">⚙️</text>`;
}
// Wörter je Ort: Dorf mit Höfen, Saal mit Aufträgen, Turm-Stockwerk mit Aufträgen
const ortWort = (k) => (plusKap(k) ? { hof: 'Auftrag', hoefe: 'Aufträge', ...plusKap(k) } : archivKap(k) || kontorKap(k) ? { ort: 'Saal', im: 'im Saal', hof: 'Auftrag', hoefe: 'Aufträge', ico: '🏛️' }
  : spaeherKap(k) ? { ort: 'Stockwerk', im: 'im Stockwerk', hof: 'Auftrag', hoefe: 'Aufträge', ico: '🔭' }
    : kornKap(k) ? { ort: 'Speicher', im: 'im Speicher', hof: 'Auftrag', hoefe: 'Aufträge', ico: '🌾' }
      : warteKap(k) ? { ort: 'Kuppel', im: 'in der Kuppel', hof: 'Auftrag', hoefe: 'Aufträge', ico: '🔭' }
        : werkKap(k) ? { ort: 'Werkbank', im: 'an der Werkbank', hof: 'Auftrag', hoefe: 'Aufträge', ico: '🔧' }
          : wegKap(k) ? { ort: 'Station', im: 'in der Station', hof: 'Auftrag', hoefe: 'Aufträge', ico: '🐎' }
            : kryptoKap(k) ? { ort: 'Schlag', im: 'im Taubenschlag', hof: 'Auftrag', hoefe: 'Aufträge', ico: '🕊️' }
              : torKap(k) ? { ort: 'Tor', im: 'am Tor', hof: 'Auftrag', hoefe: 'Aufträge', ico: '⚙️' }
                : signalKap(k) ? { ort: 'Turm', im: 'im Signalturm', hof: 'Auftrag', hoefe: 'Aufträge', ico: '🔦' }
      : { ort: 'Dorf', im: 'im Dorf', hof: 'Hof', hoefe: 'Höfe', ico: '🏘️' });
// Kornspeicher für die Landkarte: Holzscheune auf Stelzen mit Säcken davor
function svgSpeicher(fertig) {
  const sack = (x, y, s) => `<path d="M${x - 6 * s},${y} q${-3 * s},${-9 * s} ${2 * s},${-14 * s} h${8 * s} q${5 * s},${5 * s} ${2 * s},${14 * s} z" fill="#d9bf86" stroke="#7a5a2a" stroke-width="1.2"/>`;
  return `<ellipse cx="0" cy="34" rx="44" ry="8" fill="rgba(0,0,0,.25)"/>
    ${[-26, -8, 10, 26].map((x) => `<rect x="${x}" y="18" width="5" height="16" fill="#5a3a1f"/>`).join('')}
    <rect x="-34" y="-14" width="68" height="34" fill="#a8743e" stroke="#5a3a1f" stroke-width="2"/>
    ${[-24, -12, 0, 12, 24].map((x) => `<line x1="${x}" y1="-14" x2="${x}" y2="20" stroke="#8a5a2a" stroke-width="1.5"/>`).join('')}
    <polygon points="-42,-14 0,-44 42,-14" fill="${fertig ? '#c9a030' : '#9a3a2a'}" stroke="#5a2418" stroke-width="2"/>
    <rect x="-8" y="0" width="16" height="20" fill="#4a2a10"/>${sack(-44, 34, 1)}${sack(46, 34, 1.1)}${sack(36, 34, 0.8)}`;
}
function svgSpaeherturm(fertig) {
  return `<ellipse cx="0" cy="30" rx="34" ry="8" fill="rgba(0,0,0,.25)"/>
    <rect x="-14" y="-30" width="28" height="60" fill="#8a7a9e" stroke="#4a3e60" stroke-width="2"/>
    ${[-14, -4, 6].map((x) => `<rect x="${x}" y="-38" width="8" height="9" fill="#8a7a9e" stroke="#4a3e60" stroke-width="1"/>`).join('')}
    <rect x="-4" y="-18" width="8" height="12" rx="4" fill="${fertig ? '#ffe27a' : '#2b2f3d'}"/><path d="M-7,30 v-12 a7,7 0 0 1 14,0 v12 z" fill="#3e2410"/>
    <g transform="translate(10,-44) rotate(-25)"><rect x="-4" y="-4" width="26" height="8" rx="3" fill="#c9a030" stroke="#6b4a10" stroke-width="1.5"/><rect x="20" y="-6" width="6" height="12" rx="2" fill="#e0b030" stroke="#6b4a10"/></g>
    <text x="-24" y="-40" style="font-size:12px">✨</text>`;
}
// Kleine Bibliothek: Giebel, Säulen, Tür, Schriftrolle – für die Landkarte
function svgBibliothek(fertig) {
  const saeule = (x) => `<rect x="${x}" y="-14" width="7" height="30" fill="#efe6d2" stroke="#9a8a6a" stroke-width="1"/>`;
  return `<rect x="-40" y="14" width="80" height="8" fill="#cfc3a8" stroke="#8a7a5a" stroke-width="1.5"/>
    <rect x="-36" y="-16" width="72" height="30" fill="#e2d6b8" stroke="#8a7a5a" stroke-width="1.5"/>
    ${[-31, -17, 10, 24].map(saeule).join('')}
    <path d="M-6,14 v-14 a6,6 0 0 1 12,0 v14 z" fill="#5a3a1f"/>
    <polygon points="-44,-16 0,-40 44,-16" fill="${fertig ? '#c9a030' : '#7a5aa8'}" stroke="#4a3070" stroke-width="2"/>
    <text y="-22" style="font-size:13px">📜</text>`;
}

// Ein Dorf: drei Häuschen und Äcker, Schild mit Kapitel und Fortschritt
function svgDorf(k, x, y) {
  const offen = kapitelOffen(k), hoefe = kapitelHoefe(k), haupt = hoefe.filter((h) => !h.knobel);
  const geloest = haupt.filter((h) => P.hoefe[h.id]?.fertig).length, fertig = geloest === haupt.length;
  const knobel = hoefe.filter((h) => h.knobel && P.hoefe[h.id]?.fertig).length;
  const haus = (hx, hy, dach) => `<rect x="${hx - 13}" y="${hy - 11}" width="26" height="20" fill="#f1dfb8" stroke="#8a6a3a" stroke-width="1.5"/>
    <rect x="${hx - 4}" y="${hy - 2}" width="7" height="11" fill="#7a4a24"/><polygon points="${hx - 17},${hy - 10} ${hx},${hy - 27} ${hx + 17},${hy - 10}" fill="${dach}" stroke="#5a2418" stroke-width="1.5"/>`;
  let acker = '';
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
    acker += `<circle cx="${-30 + c * 13}" cy="${22 + r * 10}" r="3.2" fill="${fertig ? '#3f7d2e' : (r + c) % 3 ? '#e8822a' : '#59b043'}"/>`;
  }
  const schild = offen ? `${KAPITEL[k].ico} ${KAPITEL[k].name}` : '???';
  const robos = hoefe.filter((h) => P.roboter[h.id]).length;
  const stand = offen ? `${geloest}/${haupt.length}${knobel ? ' 🏅' : ''}${fertig ? ' ✅' : ''}${robos ? ` 🤖${robos > 1 ? robos : ''}` : ''}` : '🔒';
  return `<g class="kdorf ${offen ? 'offen' : 'zu'} ${fertig ? 'fertig' : ''} ${KAP === k && WAHL !== 'pruefung' ? 'gewaehlt' : ''}" data-kap="${k}" transform="translate(${x},${y})">
    <ellipse class="ring" cx="0" cy="8" rx="62" ry="50"/>
    ${plusKap(k)?.svg ? plusKap(k).svg(fertig) : archivKap(k) || kontorKap(k) ? svgBibliothek(fertig) : spaeherKap(k) ? svgSpaeherturm(fertig) : kornKap(k) ? svgSpeicher(fertig) : warteKap(k) ? svgSpaeherturm(fertig) : werkKap(k) ? svgWerkstatt(fertig) : wegKap(k) ? svgPoststation(fertig) : kryptoKap(k) ? svgTaubenschlag(fertig) : torKap(k) ? svgTorwerk(fertig) : signalKap(k) ? svgSignalturm(fertig) : `<rect x="-38" y="14" width="66" height="24" rx="4" fill="#7a5230" stroke="#5a3a1f" stroke-width="1.5"/>${acker}
    ${haus(-24, -8, '#b5452f')}${haus(6, -18, '#c4673a')}${haus(32, 4, '#9a3a2a')}`}
    <rect x="-64" y="42" width="128" height="20" rx="5" fill="#d9b77a" stroke="#8a6a3a" stroke-width="1.5"/>
    <text y="53" class="kname">${schild}</text>
    <rect x="-24" y="-52" width="48" height="18" rx="9" fill="rgba(20,28,58,.85)"/><text y="-43" class="rname">${stand}</text></g>`;
}

function svgPruefturm(x, y) {
  const p = naechstePruefung(), offen = pruefungOffen(p);
  const schild = !p ? '✅ alle bestanden' : offen ? '⚜️ Prüfung bereit!' : p.bald ? 'Prüfungsturm' : `🔒 ${pruefungSperre(p)}`;
  return `<g class="kturm ${offen ? 'offen' : ''} ${WAHL === 'pruefung' ? 'gewaehlt' : ''}" data-pruef="1" transform="translate(${x},${y})">
    <ellipse class="ring" cx="0" cy="0" rx="40" ry="62"/>
    <ellipse cx="0" cy="44" rx="30" ry="8" fill="rgba(0,0,0,.25)"/>
    <rect x="-16" y="-30" width="32" height="74" fill="#6d5a9e" stroke="#3e2f66" stroke-width="2"/>
    ${[-16, -6, 4].map((zx) => `<rect x="${zx}" y="-38" width="8" height="9" fill="#6d5a9e"/>`).join('')}
    <polygon points="-22,-38 0,-76 22,-38" fill="#3a2a6a" stroke="#22184a" stroke-width="2"/>
    <rect x="-5" y="-16" width="10" height="16" rx="5" fill="${offen ? '#ffe27a' : '#2b2f3d'}"/>
    <path d="M-9,44 v-14 a9,9 0 0 1 18,0 v14 z" fill="#2c1d10"/>
    <text y="-88" style="font-size:20px">⚜️</text>
    <rect x="-62" y="50" width="124" height="20" rx="10" fill="rgba(20,28,58,.85)"/><text y="61" class="rname">${schild}</text></g>`;
}

// 🥚 Ostereier auf der Landkarte (Nutzerwunsch): Tiere zum Antippen; alle gefunden = kleine Belohnung
const OSTEREIER = [
  { id: 'schaf', x: 45, y: 560, ruf: 'Mäh! 🐑', svg: `<ellipse cx="0" cy="0" rx="16" ry="11" fill="#f4f2ea"/>${[-10, -3, 4, 10].map((x) => `<circle cx="${x}" cy="-7" r="6" fill="#fbfaf4"/>`).join('')}
      <ellipse cx="17" cy="-4" rx="6" ry="5" fill="#3a3a44"/><rect x="-10" y="9" width="3" height="8" fill="#3a3a44"/><rect x="7" y="9" width="3" height="8" fill="#3a3a44"/><circle cx="19" cy="-5" r="1.2" fill="#fff"/>` },
  { id: 'ente', x: 598, y: 432, ruf: 'Quak! 🦆', svg: `<ellipse cx="0" cy="6" rx="18" ry="4" fill="rgba(255,255,255,.35)"/><ellipse cx="0" cy="0" rx="12" ry="7" fill="#f2e6c8"/>
      <circle cx="9" cy="-7" r="5.5" fill="#2f8a4a"/><path d="M13,-7 l7,1.5 l-7,1.5 z" fill="#f0a020"/><circle cx="10.5" cy="-8" r="1.1" fill="#111"/>` },
  { id: 'huhn', x: 30, y: 205, ruf: 'Gack gack! 🐔', svg: `<ellipse cx="0" cy="0" rx="10" ry="9" fill="#fff8ee"/><circle cx="7" cy="-8" r="5" fill="#fff8ee"/><path d="M5,-14 q2,-4 4,0 q2,-4 4,0 z" fill="#e0402a"/>
      <path d="M12,-8 l5,1 l-5,1.5 z" fill="#f0a020"/><circle cx="8.5" cy="-9" r="1" fill="#111"/><rect x="-3" y="8" width="2" height="6" fill="#e0a020"/><rect x="2" y="8" width="2" height="6" fill="#e0a020"/>` },
  { id: 'maulwurf', x: 150, y: 588, ruf: 'Hallo da oben! 🐹', svg: `<ellipse cx="0" cy="4" rx="16" ry="8" fill="#6a4a2a"/><circle cx="0" cy="-2" r="7" fill="#4a4450"/><ellipse cx="0" cy="1" rx="3" ry="2" fill="#f0a0b0"/>
      <circle cx="-2.5" cy="-4" r="1" fill="#111"/><circle cx="2.5" cy="-4" r="1" fill="#111"/>` },
];
const svgOstereier = () => OSTEREIER.map((o) => `<g class="osterei" data-osterei="${o.id}" transform="translate(${o.x},${o.y})"><g class="ostereiInnen">${o.svg}</g></g>`).join('');
function osterKlick(id) {
  const o = OSTEREIER.find((x) => x.id === id), el = $(`[data-osterei="${id}"] .ostereiInnen`);
  if (el) { el.classList.remove('hupf'); void el.getBBox(); el.classList.add('hupf'); }
  const neu = !(P.ostereier ||= []).includes(id);
  if (neu) P.ostereier.push(id);
  if (neu && P.ostereier.length === OSTEREIER.length) { goldDazu(20); toast(`${o.ruf} – 🥚 Alle ${OSTEREIER.length} Überraschungen gefunden! +20 🪙`, 4000); }
  else toast(neu ? `${o.ruf} <span class="hinweis">(${P.ostereier.length}/${OSTEREIER.length} gefunden)</span>` : o.ruf);
  speichern();
}

function svgKarte() {
  // Dörfer = die Kapitel dieser Burg in ihrer Reihenfolge (Platz i auf dem Weg)
  // sichtbar bis zum letzten offenen Kapitel + eins (Spieltest: per K-Code geöffnete hintere Kapitel fehlten sonst auf der Karte)
  const kaps = burgKapitel(), letztesOffen = kaps.reduce((m, k, i) => (kapitelOffen(k) ? i : m), -1);
  const sichtbar = Math.min(kaps.length, letztesOffen + 2), ueberFluss = sichtbar >= 7, osten = sichtbar >= 9;
  const weg = 'M' + [KARTE_TOR, ...KARTE_DOERFER.slice(1, sichtbar + 1)].map((p) => p.join(',')).join(' L');
  const tuer = kerkerDa();   // 🗝️ Kerker-Tür links unter der Burg (Bäume dort weichen)
  const baeume = KARTE_BAEUME.filter(([x, y]) => !tuer || Math.hypot(x - KARTE_KERKER[0], y - KARTE_KERKER[1]) > 70).map(([x, y], i) => `<g transform="translate(${x},${y}) scale(${0.8 + (i % 3) * 0.15})">
    <rect x="-3" y="4" width="6" height="12" fill="#5a3a1f"/><circle cx="0" cy="-4" r="14" fill="${i % 2 ? '#2f7a3a' : '#3a8a44'}"/><circle cx="-6" cy="-8" r="7" fill="#4fa356" opacity=".6"/></g>`).join('');
  // Im Nebel: Regionen, die es noch nicht gibt (die Region dieser Burg – z. B. 📜 Archiv in Burg 9 – ist ja gerade offen)
  const eigene = BURGEN[BURGNR].regionen || [BURGEN[BURGNR].region];
  // LK-Burgen: keine fremden „bald“-Orte (Spieltest: verwirrend, die anderen LK-Burgen sind eigene Burgen)
  const nebel = osten || BURGEN[BURGNR].klasse === 'LK' || BURGNR >= 10 ? '' : REGIONEN.filter((r) => !r.offen && !eigene.includes(r.id)).map((r) => {
    const [x, y] = KARTE_REGIONEN[r.id];
    return `<g class="kregion" transform="translate(${x},${y})"><text class="rico">${r.ico}</text>
      <rect x="-56" y="24" width="112" height="22" rx="11" fill="rgba(20,28,58,.75)"/><text y="36" class="rname">${r.name} · bald</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 1000 600" class="landkarte" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gras" cx="35%" cy="50%" r="80%"><stop offset="0" stop-color="#6cb24e"/><stop offset="1" stop-color="#3f7f35"/></radialGradient>
      <filter id="weich"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    <rect width="1000" height="600" fill="url(#gras)"/>
    <ellipse cx="150" cy="560" rx="260" ry="90" fill="#79bf58" opacity=".5"/><ellipse cx="420" cy="60" rx="220" ry="70" fill="#79bf58" opacity=".45"/>
    <path d="M610,0 C580,120 640,200 600,300 S560,480 610,600" stroke="#4aa3d8" stroke-width="30" fill="none" stroke-linecap="round"/>
    <path d="M610,0 C580,120 640,200 600,300 S560,480 610,600" stroke="#7cc8f0" stroke-width="10" fill="none" opacity=".6"/>
    <path d="${weg}" stroke="#c9a46a" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${weg}" stroke="#e0c58f" stroke-width="5" fill="none" stroke-dasharray="2 14" stroke-linecap="round" stroke-linejoin="round"/>
    ${baeume}
    ${svgBurg(500, 265, 0.95)}
    <g transform="translate(500,375)"><rect x="-90" y="0" width="180" height="26" rx="13" fill="rgba(20,28,58,.8)"/><text y="14" class="rname" style="font-size:15px">${BURGEN[BURGNR].ico} ${BURGEN[BURGNR].name} · Nacht ${P.nacht}</text></g>
    <g class="kburgwahl" data-burgwahl="1" transform="translate(322,375)"><rect x="-74" y="0" width="148" height="26" rx="13" fill="#d9b77a" stroke="#8a6a3a" stroke-width="1.5"/><text y="14" class="kname" style="font-size:14px">🏰 Burg wechseln</text></g>
    ${ueberFluss ? `<g transform="translate(${KARTE_BRUECKE.join(',')})">
      <rect x="-34" y="-12" width="68" height="24" rx="4" fill="#9a6a3a" stroke="#5a3a1f" stroke-width="2"/>
      ${[-26, -14, -2, 10, 22].map((bx) => `<line x1="${bx}" y1="-12" x2="${bx}" y2="12" stroke="#7a4c22" stroke-width="2"/>`).join('')}
      <line x1="-34" y1="-12" x2="34" y2="-12" stroke="#5a3a1f" stroke-width="4"/><line x1="-34" y1="12" x2="34" y2="12" stroke="#5a3a1f" stroke-width="4"/></g>` : ''}
    ${burgPruefungen().length ? svgPruefturm(...KARTE_TURM) : ''}
    ${tuer ? svgKerkerTuer(...KARTE_KERKER) : ''}
    ${nebel}
    ${osten ? '' : `<g filter="url(#weich)" opacity=".75" pointer-events="none">
      <ellipse cx="830" cy="310" rx="200" ry="105" fill="#e9eef8"/><ellipse cx="770" cy="510" rx="230" ry="105" fill="#e9eef8"/>
      <ellipse cx="690" cy="330" rx="70" ry="80" fill="#e9eef8"/>
      ${ueberFluss ? '' : '<ellipse cx="800" cy="110" rx="200" ry="95" fill="#e9eef8"/>'}
    </g>`}
    ${svgOstereier()}
    ${kaps.slice(0, sichtbar).map((k, i) => svgDorf(k, ...KARTE_DOERFER[i + 1])).join('')}
    ${nebel.replace(/class="kregion"/g, 'class="kregion oben"')}
  </svg>`;
}

// Der nächste ungelöste Hof dieser Burg (Hauptweg), sonst ein offener Knobelhof
const naechsterHof = () => burgHoefe().find((h) => !h.knobel && hofOffenId(h.id) && !P.hoefe[h.id]?.fertig)
  || burgHoefe().find((h) => hofOffenId(h.id) && !P.hoefe[h.id]?.fertig);

// Morgens: Landkarte (Dörfer) oder – wenn ein Dorf betreten ist – die Dorfkarte mit den Höfen
function renderKarte() {
  if (WAHL === 'kerker' || kerkerStand().lauf) { kerkerZeigen(); return; }
  if (WAHL === 'pruefung') { renderPruefungWahl(); return; }
  if (DORF) { renderDorf(); return; }
  const naechst = naechsterHof(), h = naechst || burgHoefe()[0], archiv = archivKap(h.kapitel) || kontorKap(h.kapitel), spaeher = spaeherKap(h.kapitel), o = ortWort(h.kapitel);
  const pr = naechstePruefung(), prBereit = pr && !pr.bald && pruefungOffen(pr);
  // Alles gelöst (Spieltest: dort stand „Als Nächstes: Der erste Schritt“): Glückwunsch und Hinweis auf Prüfung bzw. Nacharbeit
  const info = naechst
    ? `<span class="hico">${KAPITEL[h.kapitel].ico}</span><div><div class="kap">Als Nächstes</div>
      <h3>${esc(h.titel)}</h3><div class="meta">${o.im} „${KAPITEL[h.kapitel].name}“ (Kapitel ${kapNr(h.kapitel)})</div></div>`
    : `<span class="hico">🏆</span><div><div class="kap">Alles gelöst!</div><h3>Alle Aufgaben dieser Burg sind geschafft</h3>
      <div class="meta">${prBereit ? '⚜️ Im Prüfungsturm wartet eine Prüfung. ' : ''}${kerkerDa() ? '🗝️ Der Kerker unter der Burg ist offen – jeden Morgen ein Versuch. ' : ''}Gelöste Höfe kannst du jederzeit wiederholen – für fehlende ⭐ und etwas Gold.</div></div>`;
  $('#scr-karte').innerHTML = `<div class="kopf"><h1>☀️ Ein neuer Morgen</h1><span class="sub">${BURGEN[BURGNR].ico} ${BURGEN[BURGNR].name} · ${plusKap(h.kapitel)?.sub ? plusKap(h.kapitel).sub : archiv ? 'Tippe einen Saal des Archivs an, um seine Aufträge zu sehen.' : spaeher ? 'Tippe ein Stockwerk des Späherturms an, um seine Aufträge zu sehen.' : kornKap(h.kapitel) ? 'Tippe einen Kornspeicher an, um seine Aufträge zu sehen.' : warteKap(h.kapitel) ? 'Tippe eine Kuppel der Sternwarte an, um ihre Aufträge zu sehen.' : werkKap(h.kapitel) ? 'Tippe eine Werkbank an, um ihre Aufträge zu sehen.' : wegKap(h.kapitel) ? 'Tippe eine Poststation an, um ihre Aufträge zu sehen.' : kryptoKap(h.kapitel) ? 'Tippe einen Taubenschlag an, um seine Aufträge zu sehen.' : torKap(h.kapitel) ? 'Tippe ein Tor an, um seine Aufträge zu sehen.' : signalKap(h.kapitel) ? 'Tippe einen Signalturm an, um seine Aufträge zu sehen.' : 'Tippe ein Dorf an, um seine Höfe zu sehen.'}</span></div>
    <div class="kartebox">${svgKarte()}</div>
    <div class="hofinfo">${info}</div>${klassenZeile()}`;
  karteKlicks();
  haupt(plusKap(h.kapitel)?.haupt ? plusKap(h.kapitel).haupt : archiv ? '🏛️ Ins Archiv' : spaeher ? '🔭 In den Späherturm' : kornKap(h.kapitel) ? '🌾 In den Speicher' : warteKap(h.kapitel) ? '🔭 In die Sternwarte' : werkKap(h.kapitel) ? '🔧 In die Werkstatt' : wegKap(h.kapitel) ? '🐎 In die Station' : kryptoKap(h.kapitel) ? '🕊️ In den Taubenschlag' : torKap(h.kapitel) ? '⚙️ Ans Tor' : signalKap(h.kapitel) ? '🔦 In den Signalturm' : '🏘️ Ins Dorf', () => dorfBetreten(h.kapitel));
}

function dorfBetreten(k) {
  if (!kapitelOffen(k)) { toast(`🔒 Erst alle Höfe in Kapitel ${kapNr(k) - 1} schaffen.`); return; }
  DORF = k;
  const imKap = kapitelHoefe(k).filter((h) => hofOffenId(h.id));
  if (!WAHL || hofById(WAHL)?.kapitel !== k || !hofOffenId(WAHL)) WAHL = (imKap.find((h) => !P.hoefe[h.id]?.fertig) || imKap[0]).id;
  ROBO_WARTE = null;
  renderKarte();
  $('main').scrollTop = 0;
}

function karteKlicks() {
  for (const d of document.querySelectorAll('.kdorf')) d.onclick = () => dorfBetreten(+d.dataset.kap);
  for (const o of document.querySelectorAll('[data-osterei]')) o.onclick = (ev) => { ev.stopPropagation(); osterKlick(o.dataset.osterei); };
  const bw = $('[data-burgwahl]');
  if (bw) bw.onclick = burgWahl;
  const t = $('[data-pruef]');
  if (t) t.onclick = () => { WAHL = 'pruefung'; DORF = null; renderKarte(); };
  const kk = $('[data-kerker]');
  if (kk) kk.onclick = () => { WAHL = 'kerker'; DORF = null; renderKarte(); };
}

// 🎓 Was die Lehrkraft heute eingestellt hat (Lehrer-Codes): unter der Karte, antippen öffnet ☰ → Lehrkraft & Klasse
function klassenZeile() {
  if (ENDLOS) return '';
  const teile = [
    P.fokus?.tag === datumHeute() && burgKapitel().includes(P.fokus.kap) && !kapitelFertig(P.fokus.kap) ? `🎯 Heute: Kapitel ${kapNr(P.fokus.kap)} „${esc(KAPITEL[P.fokus.kap].name)}“` : '',
    lohnFaktor() > 1 ? '✨ Heute doppelter Lohn' : '',
    P.klassenziel ? `🏆 Klassenziel ${P.klassenziel} ⭐ – du trägst ${sterneZahl()} ⭐ bei` : '',
  ].filter(Boolean);
  return teile.length ? `<button class="klassenzeile" onclick="klasseKarte()">${teile.join(' · ')}</button>` : '';
}

// --- 🏰 Burgwahl: antippen = auswählen, Knopf = hineingehen. Burgen außer 7 öffnet ein 🎟️ Code der Lehrkraft (burgFrei) ---
let BURG_SEL = null;
function burgWahl() {
  BURG_SEL = burgSichtbar(BURG_SEL) ? BURG_SEL : BURGNR;
  const zeile = ([b, B]) => {
    const s = +b === BURGNR ? P : burgStand(+b), hoefe = B.kapitel.flatMap(kapitelHoefe).filter((h) => !h.knobel);
    const geloest = s ? hoefe.filter((h) => s.hoefe?.[h.id]?.fertig).length : 0;
    const stand = !burgFrei(b) ? '🔒 braucht einen Code deiner Lehrkraft' : s ? `Tag ${s.tag} · Nacht ${s.nacht} · ${geloest}/${hoefe.length} ${ortWort(B.kapitel[0]).hoefe}` : 'noch nicht betreten';
    return `<button data-burg="${b}" class="${+b === BURG_SEL ? 'sel' : ''} ${burgFrei(b) ? '' : 'zu'}"><span class="sico">${burgFrei(b) ? B.ico : '🔒'}</span><b>${B.name}${+b === BURGNR ? ' · hier bist du' : ''}</b>
      <span class="hinweis">${esc(B.text)}</span><span class="p">${stand}</span></button>`;
  };
  const sichtbar = Object.entries(BURGEN).filter(([b]) => burgSichtbar(b));
  // Im LK: oben die Burgen des Leistungskurses, darunter die Sek-I-Burgen als freiwillige Auffrischung
  const zeilen = LK
    ? `${sichtbar.filter(([b]) => lkBurg(b)).map(zeile).join('')}</div>
      <h3>🔄 Auffrischung (freiwillig)</h3><p class="hinweis">Themen aus Klasse 7–9 zum Wiederholen – ohne Code, mit eigenem Spielstand.</p>
      <div class="spezwahl burgwahl">${sichtbar.filter(([b]) => !lkBurg(b)).map(zeile).join('')}`
    : sichtbar.map(zeile).join('');
  const zu = !burgFrei(BURG_SEL);
  const knopf = BURG_SEL === BURGNR ? [{ label: 'Hierbleiben' }]
    : zu ? [{ label: 'Abbrechen' }, { label: '🔓 Freischalten', offen: true, fn: () => codeEinloesen($('#burgCode').value, $('#burgCodeFehler')) }]
      : [{ label: 'Abbrechen' }, { label: `${BURGEN[BURG_SEL].ico} In die ${BURGEN[BURG_SEL].name}`, fn: () => burgWechseln(BURG_SEL) }];
  karte(`<h2>🏰 Burg wählen</h2><p class="hinweis">${LK ? 'Jedes Thema des Leistungskurses hat seine eigene Burg' : 'Jede Klassenstufe hat ihre eigene Burg'} mit eigenem Spielstand. Du kannst jederzeit zurück – nichts geht verloren.</p>
    <div class="spezwahl burgwahl">${zeilen}</div>
    ${zu ? `<p><b>${BURGEN[BURG_SEL].name}</b> schaltet deine Lehrkraft mit einem Code frei:</p>
      <p><input id="burgCode" class="codefeld" autocomplete="off" spellcheck="false" placeholder="z. B. ${LK ? 'B21' : 'B8'}-1112-K7QD"></p><p class="hinweis" id="burgCodeFehler"></p>` : ''}`, knopf);
  for (const b of document.querySelectorAll('[data-burg]')) b.onclick = () => { BURG_SEL = +b.dataset.burg; burgWahl(); };
  if (zu) $('#burgCode').onkeydown = (e) => { if (e.key === 'Enter') codeEinloesen(e.target.value, $('#burgCodeFehler')); };
}

// --- 🏘️ Dorfkarte: die Höfe eines Kapitels am Dorfweg, in der Mitte das Dorf ---
const DORF_PLAETZE = [[140, 420], [285, 480], [435, 430], [585, 485], [735, 440], [870, 350], [780, 215], [630, 160], [470, 135], [310, 150], [160, 190]];
const DORF_EINGANG = [40, 320];

// nr = Reihenfolge im Dorf (1, 2, 3 …; Knobelhof: 🏅) · weiter = der nächste ungelöste Hof
function svgDorfHof(h, x, y, nr, weiter) {
  const s = P.hoefe[h.id], offen = hofOffenId(h.id), fertig = !!s?.fertig;
  const nummer = `<g transform="translate(-50,-48)"><circle r="17" fill="${fertig ? farbe('fertig') : offen ? '#ffd84a' : '#5a6070'}" stroke="#1a1020" stroke-width="2.5"/>
    <text y="1" style="font: 20px 'Lilita One', sans-serif; fill: ${offen && !fertig ? '#2a1a00' : '#fff'}">${h.knobel ? '🏅' : nr}</text></g>`;
  const pfeil = weiter ? `<g transform="translate(0,-92)"><g class="weiterhier"><rect x="-58" y="-15" width="116" height="28" rx="14" fill="#ffd84a" stroke="#8a6200" stroke-width="2"/>
    <text y="0" style="font: 15px 'Lilita One', sans-serif; fill: #2a1a00">▶ Weiter hier</text><polygon points="-8,13 8,13 0,24" fill="#ffd84a"/></g></g>` : '';
  let pflanzen = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    pflanzen += `<circle cx="${-38 + c * 15}" cy="${6 + r * 13}" r="${fertig ? 2.5 : 4}" fill="${fertig ? '#3f7d2e' : (r + c) % 3 ? '#e8822a' : '#59b043'}"/>`;
  }
  const sterne = fertig ? `<text y="84" class="kst">${s.kurz ? '⭐' : '☆'}${s.sparsam ? '⭐' : '☆'}</text>` : '';
  const zaun = h.knobel ? `<rect x="-58" y="-66" width="116" height="112" rx="10" fill="none" stroke="#e0b030" stroke-width="4" stroke-dasharray="8 5"/>` : '';
  // 📜 Archiv: Bücherregal mit bunten Buchrücken (gelöst = goldene Bücher) statt Acker und Hof
  const BUCH = ['#b5452f', '#3f6fd8', '#2f9e62', '#c9a030', '#7a5aa8', '#c4673a'];
  const regal = () => `<rect x="-50" y="-38" width="62" height="78" rx="4" fill="#6b4424" stroke="#3e2410" stroke-width="2"/>
    ${[0, 1, 2].map((r) => `<rect x="-45" y="${-33 + r * 24}" width="52" height="20" fill="#3e2410"/>
      ${[0, 1, 2, 3, 4, 5].map((c) => `<rect x="${-44 + c * 8.5}" y="${-31 + r * 24 + (c % 3)}" width="7" height="${18 - (c % 3)}" rx="1" fill="${fertig ? '#e0b030' : BUCH[(c + r * 2 + h.id.length) % BUCH.length]}"/>`).join('')}`).join('')}`;
  // 🔭 Späherturm: Lernpult mit Schriftrolle und Fernrohr
  const pult = () => `<rect x="-46" y="-2" width="92" height="10" rx="3" fill="#8a5a30" stroke="#4a2c10" stroke-width="2"/>
    <rect x="-40" y="8" width="8" height="32" fill="#6b4424"/><rect x="32" y="8" width="8" height="32" fill="#6b4424"/>
    <rect x="-36" y="-22" width="44" height="20" rx="3" fill="${fertig ? '#ffe9a0' : '#f4e8c8'}" stroke="#a8844a" stroke-width="1.5"/>
    ${[0, 1, 2].map((r) => `<line x1="-31" x2="${2 - r * 8}" y1="${-16 + r * 5}" y2="${-16 + r * 5}" stroke="#7a6040" stroke-width="1.5"/>`).join('')}
    <g transform="translate(-44,-30) rotate(-20)"><rect width="22" height="7" rx="3" fill="#c9a030" stroke="#6b4a10"/></g>`;
  const acker = `<rect x="-48" y="-6" width="96" height="44" rx="6" fill="#7a5230" stroke="#5a3a1f" stroke-width="2"/>
    ${[0, 1, 2].map((r) => `<line x1="-44" x2="44" y1="${6 + r * 13}" y2="${6 + r * 13}" stroke="#5e3d22" stroke-width="3"/>`).join('')}${pflanzen}
    <rect x="-46" y="-34" width="34" height="26" fill="#f1dfb8" stroke="#8a6a3a" stroke-width="1.5"/>
    <rect x="-33" y="-22" width="9" height="14" fill="#7a4a24"/>
    <polygon points="-51,-33 -29,-55 -7,-33" fill="${h.knobel ? '#c9a030' : '#b5452f'}" stroke="#7a2418" stroke-width="1.5"/>`;
  return `<g class="khof ${offen ? 'offen' : 'zu'} ${fertig ? 'fertig' : ''} ${h.id === WAHL ? 'gewaehlt' : ''}" data-hof="${h.id}" transform="translate(${x},${y})">
    <ellipse class="ring" cx="0" cy="8" rx="76" ry="64"/>${zaun}
    ${h.art === 'sql' ? regal() : h.art === 'ki' ? pult() : acker}
    <circle cx="28" cy="-30" r="20" fill="#fff8e6" stroke="${h.knobel ? '#e0b030' : '#8a6a3a'}" stroke-width="2.5"/>
    <text x="28" y="-29" class="kico">${offen ? h.ico : h.knobel ? '🏅' : '🔒'}</text>
    ${P.roboter[h.id] ? '<text x="48" y="2" style="font-size:20px">🤖</text>' : ''}
    <rect x="-58" y="46" width="116" height="22" rx="5" fill="#d9b77a" stroke="#8a6a3a" stroke-width="1.5"/>
    <text y="58" class="kname">${offen ? esc(h.titel) : '???'}</text>${sterne}${nummer}${pfeil}</g>`;
}

function svgDorf2(k) {
  const hoefe = kapitelHoefe(k), plaetze = hoefe.map((_, i) => DORF_PLAETZE[i]);
  const offen = hoefe.filter((h) => hofOffenId(h.id)).length;
  const weiterId = (hoefe.find((h) => !h.knobel && hofOffenId(h.id) && !P.hoefe[h.id]?.fertig) || hoefe.find((h) => hofOffenId(h.id) && !P.hoefe[h.id]?.fertig))?.id;
  const weg = 'M' + [DORF_EINGANG, ...plaetze.slice(0, Math.min(hoefe.length, offen + 1))].map((p) => p.join(',')).join(' L');
  const baeume = [[60, 120], [110, 520], [380, 540], [930, 520], [950, 160], [200, 260], [560, 540], [520, 50], [700, 330], [40, 470]]
    .map(([x, y], i) => `<g transform="translate(${x},${y}) scale(${0.9 + (i % 3) * 0.15})"><rect x="-3" y="4" width="6" height="12" fill="#5a3a1f"/><circle cx="0" cy="-4" r="15" fill="${i % 2 ? '#2f7a3a' : '#3a8a44'}"/><circle cx="-6" cy="-8" r="7" fill="#4fa356" opacity=".6"/></g>`).join('');
  const haus = (x, y, s, dach) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-22" y="-16" width="44" height="32" fill="#f1dfb8" stroke="#8a6a3a" stroke-width="2"/>
    <rect x="-6" y="0" width="12" height="16" fill="#7a4a24"/><rect x="-17" y="-8" width="8" height="8" fill="#9fd3f5"/><rect x="9" y="-8" width="8" height="8" fill="#9fd3f5"/>
    <polygon points="-28,-15 0,-40 28,-15" fill="${dach}" stroke="#5a2418" stroke-width="2"/></g>`;
  // Dorfmitte: Kirche, Häuser, Brunnen, Dorfplatz
  const mitte = `<ellipse cx="560" cy="330" rx="125" ry="70" fill="#c9a46a" opacity=".55"/>
    ${haus(480, 290, 1.1, '#b5452f')}${haus(640, 285, 1.15, '#9a3a2a')}${haus(470, 375, 0.95, '#c4673a')}${haus(655, 372, 1, '#b5452f')}
    <g transform="translate(560,250)"><rect x="-26" y="-30" width="52" height="56" fill="#e8dcc0" stroke="#8a6a3a" stroke-width="2"/>
      <rect x="-12" y="-78" width="24" height="50" fill="#e8dcc0" stroke="#8a6a3a" stroke-width="2"/><polygon points="-16,-78 0,-108 16,-78" fill="#5a6a8a" stroke="#3a4560" stroke-width="2"/>
      <line x1="0" y1="-108" x2="0" y2="-122" stroke="#3a2a1a" stroke-width="3"/><line x1="-6" y1="-116" x2="6" y2="-116" stroke="#3a2a1a" stroke-width="3"/>
      <path d="M-9,26 v-16 a9,9 0 0 1 18,0 v16 z" fill="#7a4a24"/><circle cx="0" cy="-58" r="6" fill="#ffd84a"/></g>
    <g transform="translate(560,345)"><circle r="18" fill="#8a8f99" stroke="#5d6578" stroke-width="3"/><circle r="11" fill="#4aa3d8"/></g>`;
  const k0 = KAPITEL[k], archiv = archivKap(k) || kontorKap(k), o = ortWort(k);
  // 🔭 Späherturm groß in der Mitte: Steinturm mit Fenstern, Plattform, Fernrohr, Sternenfahne
  const turmMitte = `<ellipse cx="560" cy="350" rx="125" ry="62" fill="#c9a46a" opacity=".55"/>
    <g transform="translate(560,300)"><ellipse cx="0" cy="62" rx="60" ry="12" fill="rgba(0,0,0,.25)"/>
      <path d="M-42,62 L-32,-90 L32,-90 L42,62 z" fill="#9a8ab0" stroke="#4a3e60" stroke-width="3"/>
      ${[-60, -20, 20].map((y) => `<rect x="-8" y="${y}" width="16" height="22" rx="8" fill="#ffe27a" stroke="#4a3e60" stroke-width="2"/>`).join('')}
      <rect x="-48" y="-104" width="96" height="16" fill="#8a7a9e" stroke="#4a3e60" stroke-width="2"/>
      ${[-48, -28, -8, 12, 32].map((x) => `<rect x="${x}" y="-118" width="14" height="14" fill="#8a7a9e" stroke="#4a3e60" stroke-width="2"/>`).join('')}
      <g transform="translate(6,-124) rotate(-28)"><rect x="-6" y="-6" width="52" height="12" rx="4" fill="#c9a030" stroke="#6b4a10" stroke-width="2"/><rect x="44" y="-9" width="10" height="18" rx="3" fill="#e0b030" stroke="#6b4a10" stroke-width="2"/></g>
      <line x1="-30" y1="-118" x2="-30" y2="-160" stroke="#3a2a1a" stroke-width="3"/><polygon points="-30,-160 4,-150 -30,-140" fill="#3f6fd8"/><text x="-18" y="-146" style="font-size:12px">⭐</text>
      <path d="M-14,62 v-26 a14,14 0 0 1 28,0 v26 z" fill="#3e2410"/></g>`;
  // 📜 Lesesaal: Steinboden, roter Teppich als Weg, Leuchter statt Bäumen, Archivhalle mit Säulen und Kuppel, Globus
  const leuchter = [[60, 120], [110, 520], [380, 540], [930, 520], [950, 160], [200, 260], [560, 540], [520, 50], [700, 330], [40, 470]]
    .map(([x, y]) => `<g transform="translate(${x},${y})"><rect x="-3" y="-6" width="6" height="22" fill="#8a6a3a"/><ellipse cx="0" cy="16" rx="9" ry="3" fill="#6b4424"/>
      <ellipse cx="0" cy="-10" rx="4" ry="7" fill="#ffd84a"/><ellipse cx="0" cy="-10" rx="10" ry="12" fill="#ffe8a0" opacity=".25"/></g>`).join('');
  const halle = `<ellipse cx="560" cy="330" rx="140" ry="75" fill="#b8a27a" opacity=".6"/>
    <g transform="translate(560,270)"><rect x="-120" y="40" width="240" height="14" fill="#cfc3a8" stroke="#8a7a5a" stroke-width="2"/>
      <rect x="-110" y="-30" width="220" height="70" fill="#e2d6b8" stroke="#8a7a5a" stroke-width="2"/>
      ${[-100, -70, -40, 30, 60, 90].map((x) => `<rect x="${x}" y="-30" width="12" height="70" fill="#f3ead6" stroke="#9a8a6a" stroke-width="1.5"/>`).join('')}
      <path d="M-14,40 v-36 a14,14 0 0 1 28,0 v36 z" fill="#5a3a1f"/>
      <polygon points="-124,-30 0,-72 124,-30" fill="#7a5aa8" stroke="#4a3070" stroke-width="2"/>
      <path d="M-30,-58 a30,26 0 0 1 60,0 z" fill="#9a7ac8" stroke="#4a3070" stroke-width="2"/><text y="-44" style="font-size:22px">📜</text></g>
    <g transform="translate(560,355)"><circle r="16" fill="#4aa3d8" stroke="#2a5a8a" stroke-width="3"/><path d="M-12,-4 q8,-6 16,0 q4,6 -6,10 z M2,6 q6,-2 8,4" fill="#5fd38d"/>
      <rect x="-2" y="16" width="4" height="10" fill="#6b4424"/><rect x="-12" y="26" width="24" height="5" rx="2" fill="#6b4424"/></g>`;
  return `<svg viewBox="0 0 1000 570" class="landkarte dorfkarte" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="dgras" cx="50%" cy="55%" r="75%"><stop offset="0" stop-color="#78bd57"/><stop offset="1" stop-color="#3f7f35"/></radialGradient>
      <radialGradient id="dstein" cx="50%" cy="55%" r="80%"><stop offset="0" stop-color="#d8c8a4"/><stop offset="1" stop-color="#8f7d5c"/></radialGradient>
      <pattern id="fliesen" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="none" stroke="#7a6a4a" stroke-width="1" opacity=".35"/></pattern></defs>
    <rect width="1000" height="570" fill="url(#${archiv ? 'dstein' : 'dgras'})"/>
    ${archiv ? '<rect width="1000" height="570" fill="url(#fliesen)"/>'
      : [[60, 40, 160, 70], [800, 470, 170, 70], [330, 30, 120, 60]].map(([x, y, w, hh]) => `<g opacity=".45">${[0, 1, 2, 3, 4].map((i) => `<rect x="${x}" y="${y + i * hh / 5}" width="${w}" height="${hh / 10}" fill="#c9b04a"/>`).join('')}</g>`).join('')}
    <path d="${weg}" stroke="${archiv ? '#9a3a2a' : '#c9a46a'}" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${weg}" stroke="${archiv ? '#d9a040' : '#e0c58f'}" stroke-width="6" fill="none" stroke-dasharray="2 16" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${DORF_EINGANG.join(',')} Q300,330 ${archiv ? 440 : 470},330" stroke="${archiv ? '#9a3a2a' : '#c9a46a'}" stroke-width="12" fill="none" stroke-linecap="round" opacity=".8"/>
    ${archiv ? leuchter + halle : spaeherKap(k) ? baeume + turmMitte : baeume + mitte}
    <g transform="translate(${DORF_EINGANG.join(',')})" class="dorftor" id="zurLandkarte"><rect x="-6" y="-40" width="8" height="54" fill="#6b4424"/>
      <rect x="-30" y="-58" width="120" height="30" rx="6" fill="#d9b77a" stroke="#8a6a3a" stroke-width="2"/><text x="30" y="-42" class="kname" style="font-size:13px">🗺️ Landkarte</text></g>
    <g transform="translate(830,40)"><rect x="-130" y="-20" width="260" height="38" rx="12" fill="rgba(20,28,58,.85)"/>
      <text y="0" class="rname" style="font-size:20px">${k0.ico} ${o.ort} ${esc(k0.name)}</text></g>
    ${hoefe.map((h, i) => svgDorfHof(h, ...plaetze[i], i + 1, h.id === weiterId)).join('')}
  </svg>`;
}

function renderDorf() {
  const k = DORF, hoefe = kapitelHoefe(k);
  if (!WAHL || hofById(WAHL)?.kapitel !== k || !hofOffenId(WAHL)) {
    const imKap = hoefe.filter((h) => hofOffenId(h.id));
    WAHL = (imKap.find((h) => !P.hoefe[h.id]?.fertig) || imKap[0]).id;
  }
  const h = hofById(WAHL), s = P.hoefe[h.id], archiv = archivKap(k) || kontorKap(k), o = ortWort(k);
  const hof = o.hof, hoefeW = o.hoefe;
  // Sterne heißen je nach Aufgabe anders: Vorhersagen und Späherturm zählen Fehler, SQL zählt Versuche und Tipps
  const [s1, s2] = h.vorhersage || h.lesen || h.art === 'ki' || h.fragen ? ['ohne Fehler', 'höchstens 2 Fehler'] : h.art === 'sql' ? ['auf Anhieb', 'ohne Tipp']
    : h.warte ? ['auf Anhieb', 'ohne Tipp'] : h.art === 'sort' ? ['wenige Vergleiche', h.sortArt === 'karten' ? 'wenige Tausche' : 'wenige Schreibzugriffe'] : ['kurz', 'sparsam'];
  const besser = verbesserbar(h), sperre = fokusSperre(h), heute = (besser && heuteVerbessert(h)) || !!sperre;
  const meta = s?.fertig
    ? `✅ gelöst${s.kurz ? ` · ⭐ ${s1}` : ''}${s.sparsam ? ` · ⭐ ${s2}` : ''} · ${!besser ? `Nochmal: ${Math.round(h.lohn * NACHARBEIT)} 🪙, neue Sterne zählen voll`
      : heute ? '🔧 Heute schon verbessert – morgen wieder'
        : `🔧 Verbessern kostet keinen Tag${s.kurz && s.sparsam ? ' – geht es noch kürzer?' : ` · fehlende ⭐ bringen je ${Math.round(h.lohn * STERN_BONUS)} 🪙`}${s.besteZuege ? ` · bisher ${s.besteZuege} Züge` : ''}`}`
    : `Lohn: ${h.lohn} 🪙${h.knobel ? ` · 🏅 Knobel${hof.toLowerCase()}: schwerer, freiwillig` : ''}`;
  const haupt0 = hoefe.filter((x) => !x.knobel), geloest = haupt0.filter((x) => P.hoefe[x.id]?.fertig).length;
  const nr = h.knobel ? `🏅 Knobel${hof.toLowerCase()}` : `${hof} ${haupt0.indexOf(h) + 1} von ${haupt0.length}`;
  $('#scr-karte').innerHTML = `<div class="kopf"><h1>${o.ico} ${KAPITEL[k].ico} ${esc(KAPITEL[k].name)}</h1><span class="sub">${BURGEN[BURGNR].name} · Kapitel ${kapNr(k)} · ${geloest}/${haupt0.length} ${hoefeW} gelöst · ${hof} antippen = auswählen, nochmal antippen = starten</span></div>
    <div class="kartebox">${svgDorf2(k)}</div>
    <div class="hofinfo kapinfo"><div class="hofzeile"><span class="hico">${h.ico}</span><div><div class="kap">${nr}</div><h3>${esc(h.titel)}${h.knobel ? ` <span class="knobelmarke">🏅 Knobel${hof.toLowerCase()}</span>` : ''}</h3>
      <div class="ziel">${esc(h.ziel)}</div><div class="meta">${meta}</div>${sperre ? `<div class="meta fokus">${esc(sperre)}</div>` : ''}</div></div>${roboZeile(h)}</div>`;
  // erstes Antippen wählt den Hof, zweites Antippen startet ihn (wie „Los!“)
  for (const b of document.querySelectorAll('.khof.offen')) b.onclick = () => {
    if (WAHL === b.dataset.hof) { if (PY.bereit) tagStart(WAHL); return; }
    WAHL = b.dataset.hof; ROBO_WARTE = null; renderDorf();
  };
  for (const b of document.querySelectorAll('.khof.zu')) b.onclick = () => toast(`🔒 Erst ${o.hof === 'Hof' ? 'den Hof' : 'den Auftrag'} davor lösen.`);
  $('#zurLandkarte').onclick = dorfVerlassen;
  if ($('#roboHin')) $('#roboHin').onclick = () => roboHinstellen(WAHL);
  if ($('#roboAb')) $('#roboAb').onclick = () => roboAbziehen(WAHL);
  neben([{ label: '🗺️<span class="lbl"> Landkarte</span>', title: 'Zurück zur Landkarte', fn: dorfVerlassen }]);
  haupt(besser ? '🔧 Verbessern' : 'Los!', () => tagStart(WAHL), PY.bereit && !heute);
}
function dorfVerlassen() { DORF = null; neben([]); renderKarte(); }

// Prüfungsturm gewählt: nächste Prüfung zeigen
function renderPruefungWahl() {
  const p = naechstePruefung(), offen = pruefungOffen(p);
  const info = !p ? 'Du hast alle Prüfungen bestanden. 👑'
    : p.bald ? `Die nächste Prüfung braucht das Kapitel „${p.bald}“. Das kommt bald.`
      : offen && p.art === 'quiz' ? `<div class="ziel">${p.fragen.length} Fragen zu Code und Begriffen – bestanden ab ${QUIZ_BESTEHEN} richtigen.</div><div class="meta">Keine Tipps · ein Versuch pro Tag · Lohn: 1 ⚜️ Spezialisierungspunkt</div>`
      : offen ? `<div class="ziel">${esc(p.ziel)}</div><div class="meta">Keine Tipps · ${p.varianten.length + 1} Varianten · Lohn: 1 ⚜️ Spezialisierungspunkt</div>`
        : `Noch gesperrt: ${pruefungSperre(p)}.`;
  $('#scr-karte').innerHTML = `<div class="kopf"><h1>☀️ Ein neuer Morgen</h1><span class="sub">Im Prüfungsturm beweist du, wie gut du programmierst.</span></div>
    <div class="kartebox">${svgKarte()}</div>
    <div class="hofinfo"><span class="hico">⚜️</span><div><div class="kap">Prüfungsturm · ${Object.keys(P.pruefungen).length}/${burgPruefungen().length} bestanden</div>
      <h3>${p ? esc(p.titel) : 'Alle Prüfungen bestanden'}</h3>${info}</div></div>`;
  karteKlicks();
  haupt('⚜️ Prüfung beginnen', () => (p.art === 'quiz' ? quizStart(p) : tagStart(p.id)), (PY.bereit || p?.art === 'quiz') && offen);
}
// --- Abend ---
function abendStart() {
  P.phase = 'abend';
  speichern();
  SEL = null; KAUF = null; BAU = null;
  zeigeScreen('karte');
  uebergang('abend');
  hud();
  // 👆 Beim ersten Abend ohne Turm zeigt die Hand einen guten Platz (in der Kurve) und sagt warum, dann Schritt für Schritt das Bauen
  if (!Object.keys(P.tuerme).length && P.nacht <= 2 && P.gold >= Math.min(...Object.values(TUERME).map((t) => t.preis))) {
    const gp = guterPlatz('pfeil'), blatt = () => karteOffen() && !!$('#turmBlatt');   // ein geschlossenes Blatt bleibt versteckt im DOM
    const gebaut = () => Object.keys(P.tuerme).length > 0;
    anleitung('bauen', [
      { ziel: () => $('#scr-karte .bauleiste [data-bau="pfeil"]'), text: 'Wähle hier den Pfeilturm!', fertig: () => !!BAUMODUS || gebaut() },
      { ziel: () => ({ el: $('#abendCanvas'), fx: (gp.x + 0.5) / NFELD.w, fy: (gp.y + 0.5) / NFELD.h }), text: 'Ein guter Platz! In der Kurve trifft dein Turm gleich mehrere Wegstücke. Tippe hier.', fertig: () => (BAU?.fest && !BAU.grund) || gebaut() },
      { ziel: () => $('#bauOk'), text: 'Der gelbe Kreis zeigt, wie weit er schießt. Bauen!', fertig: gebaut },
      { ziel: () => $('#hauptBtn'), text: 'Jetzt kommt die Nacht!', fertig: () => P.phase === 'nacht' },
    ], () => P.phase === 'abend');
  }
  // Talente erst, wenn der Held XP hat (Abzeichen: freie Talent- und Spezialisierungspunkte)
  const frei = punkteFrei() + Math.max(0, spezPunkte());
  neben(P.xp ? [{ label: `✨<span class="lbl"> Talente</span>${frei > 0 ? ` <span class="badge">${frei}</span>` : ''}`, title: 'Talente und Zauber des Helden', fn: () => talentBlatt(), cls: frei > 0 ? 'gruen' : 'leise' }] : []);
  $('#scr-karte').innerHTML = `<div class="kopf"><h1>🌇 Abend</h1><span class="sub">Türme neben den Weg stellen, dann oben „🌙 Nacht starten“.</span></div>
    <div class="abend-grid">
      <div class="feldreihe"><div class="nachtbox"><canvas id="abendCanvas"></canvas><div class="bauok"></div></div><div class="bauleiste"></div></div>
      <div><div class="baupanel" id="baupanel"></div><div class="vorschau" id="vorschau" style="margin-top:10px"></div></div>
    </div>`;
  const cv = $('#abendCanvas');
  cv.onclick = (ev) => {
    const r = cv.getBoundingClientRect(), k = r.width / NFELD.w;
    feldTippen((ev.clientX - r.left) / k - 0.5, (ev.clientY - r.top) / k - 0.5);
  };
  BAUMODUS = null;
  bauSteuerung(cv);
  bauleisteRender();
  renderBau();
  renderVorschau();
  haupt('🌙<span class="lbl"> Nacht starten</span>', nachtStart);
  const id = ++ABEND_ID;   // ein neuer Abend-Aufbau beendet die alte Malschleife
  requestAnimationFrame(() => abendFrame(id));
  // Neue Turmart heute verfügbar?
  for (const [id, t] of Object.entries(TUERME)) {
    if (turmOffen(id) && !P.gesehen['turm:' + id]) {
      P.gesehen['turm:' + id] = true;
      if (t.ab > 1 || t.talent) toast(`Neu: ${t.ico} ${t.name} – ${t.text}`, 4500);
    }
  }
  const billig = Math.min(...Object.values(TUERME).map((t) => t.preis));
  // Führt der 👆 Finger durchs erste Bauen, braucht es keine Karte davor (Nutzerwunsch: nur erklären, wenn man es braucht)
  if (!P.gesehen.bauen && !Object.keys(P.tuerme).length && P.gold >= billig) { P.gesehen.bauen = true; }
  else if (erklaere('bauen', P.gold < billig ? ` Ein Turm kostet ${billig} 🪙 – heute reicht es noch nicht.` : '')) { /* Abend erklärt */ }
  else if (frei > 0 && erklaere('talente', ' Dein Held 🧙 ist aufgestiegen – oben: ✨ Talente.')) { /* Netz erklärt */ }
  else erklaerungenPruefen();
  speichern();
}

let ABEND_ID = 0;
function abendFrame(id) {
  const cv = $('#abendCanvas');
  if (P.phase !== 'abend' || !cv || id !== ABEND_ID) return;
  zeichneNacht(cv, null, { sel: SEL, plan: bauPlan() });
  requestAnimationFrame(() => abendFrame(id));
}

// 🏗️ Spielfeld angetippt (abends und nachts): Turm → Turmblatt; freie Stelle → 📍 Bauplan (Geisterturm mit Reichweite, rot = geht nicht).
// Den Plan nochmal antippen (oder „Turm aussuchen“) öffnet das Turmblatt. Gekauft wird erst dort mit dem Knopf.
let BAU = null;   // {x, y, grund, art, fest} – geplanter neuer Turm (fest = abgesetzt, sonst folgt er der Maus)
// 🏗️ Steuerung (Nutzerwunsch 2026-11-13: „oft aus Versehen einen Turm gesetzt“): Bauen geht NUR über die Bauleiste rechts.
// Turmart antippen → Baumodus (BAUMODUS = art): der Geisterturm folgt der Maus, Antippen setzt ihn ab, gebaut wird erst mit
// dem Knopf direkt am Geisterturm. ✖, Esc oder Rechtsklick brechen ab. Ohne Baumodus tut ein Tippen aufs freie Feld nichts.
let BAUMODUS = null;
const bauScreen = () => $(P.phase === 'nacht' ? '#scr-nacht' : '#scr-karte');
function feldTippen(x, y) {
  const tw = Object.entries(P.tuerme).find(([, t]) => Math.hypot(t.x - x, t.y - 0.2 - y) < 0.65);
  KAUF = null;
  if (!BAUMODUS) {
    if (tw) { BAU = null; SEL = +tw[0]; renderBau(); turmBlatt(SEL); return; }
    BAU = null; SEL = null; renderBau();
    const bl = bauScreen()?.querySelector('.bauleiste');   // freie Stelle ohne Baumodus: nur zeigen, wo gebaut wird
    if (bl) { bl.classList.remove('blinken'); void bl.offsetWidth; bl.classList.add('blinken'); }
    return;
  }
  if (tw) { toast('Hier steht schon ein Turm. Tippe eine freie Stelle an.'); return; }
  bauZeigen(x, y, true);
}
// Geisterturm an (x, y); fest = abgesetzt (Knopf erscheint), sonst Vorschau unter der Maus
function bauZeigen(x, y, fest) {
  x = Math.round(x * 20) / 20; y = Math.round(y * 20) / 20;
  if (!fest && BAU?.fest) return;   // abgesetzt: Maus bewegt ihn nicht mehr, nur neues Antippen
  BAU = { x, y, grund: platzPruefen(x, y), art: BAUMODUS, fest };
  SEL = null;
  if (fest) { renderBau(); bauOkZeigen(); }
}
function bauModus(art) {
  BAUMODUS = BAUMODUS === art ? null : art;
  BAU = null; SEL = null; KAUF = null;
  bauleisteRender(); bauOkZeigen(); renderBau();
}
function bauAbbrechen() { if (!BAUMODUS && !BAU) return; BAUMODUS = null; BAU = null; bauleisteRender(); bauOkZeigen(); renderBau(); }
// 🏗️ Die Leiste: eine Taste je offene Turmart mit Preis (zu teuer = blass, „noch X“)
function bauleisteRender() {
  const box = bauScreen()?.querySelector('.bauleiste');
  if (!box) return;
  const offen = Object.entries(TUERME).filter(([id]) => turmOffen(id));
  box.innerHTML = `<div class="bltitel">🔨 Bauen</div>${offen.map(([id, t]) => { const p = turmPreis(id);
    return `<button data-bau="${id}" class="${BAUMODUS === id ? 'sel' : ''} ${P.gold < p ? 'teuer' : ''}" title="${esc(t.name)}: ${esc(t.text)}"><span class="sico">${t.ico}</span><span class="n">${esc(t.name.replace(/turm$/i, ''))}</span><span class="p">${p} 🪙</span></button>`; }).join('')}
    ${BAUMODUS ? '<button class="abbruch" data-bauweg>✖ Stopp</button>' : ''}`;
  for (const b of box.querySelectorAll('[data-bau]')) b.onclick = () => bauModus(b.dataset.bau);
  const w = box.querySelector('[data-bauweg]');
  if (w) w.onclick = bauAbbrechen;
  const cv = bauScreen().querySelector('canvas');
  if (cv) cv.classList.toggle('baut', !!BAUMODUS);
}
// Knopf direkt am abgesetzten Geisterturm: „🔨 Bauen · Preis“ und ✖
function bauOkZeigen() {
  const box = bauScreen()?.querySelector('.bauok');
  if (!box) return;
  if (!BAUMODUS || !BAU?.fest) { box.classList.remove('an'); box.innerHTML = ''; return; }
  const t = TUERME[BAUMODUS], p = turmPreis(BAUMODUS);
  box.style.left = `${Math.max(14, Math.min(86, (BAU.x + 0.5) / NFELD.w * 100))}%`;
  const unten = BAU.y < NFELD.h - 2.2;   // Platz unter dem Turm? sonst darüber
  box.style.top = unten ? `${(BAU.y + 1.25) / NFELD.h * 100}%` : `${(BAU.y - 1.2) / NFELD.h * 100}%`;
  box.innerHTML = BAU.grund ? `<span class="btn leise klein">🚫 ${esc(BAU.grund.split('.')[0])}</span>`
    : `<button class="btn gold" id="bauOk" ${P.gold < p ? 'disabled' : ''}>🔨 ${t.ico} bauen · ${p} 🪙${fehlt(p)}</button>`;   // abbrechen nur über „✖ Stopp“ in der Leiste (Spieltest: drei Abbrechen-Knöpfe verwirrten)
  box.classList.add('an');
  const ok = box.querySelector('#bauOk');
  if (ok) ok.onclick = (ev) => { ev.stopPropagation(); bauKaufen(); };
  const nein = box.querySelector('#bauNein');
  if (nein) nein.onclick = (ev) => { ev.stopPropagation(); BAU = null; bauOkZeigen(); renderBau(); };
}
function bauKaufen() {
  const art = BAUMODUS, preis = turmPreis(art);
  if (!BAU || P.gold < preis || platzPruefen(BAU.x, BAU.y)) return;
  const id = neueTurmId(), t = TUERME[art];
  goldDazu(-preis); P.tuerme[id] = { art, wahl: [], x: BAU.x, y: BAU.y, bezahlt: preis }; speichern();
  TURM_BAU[id] = performance.now() / 1000;   // 🔨 Bau-Animation im Feld
  toast(`${t.ico} ${t.name} gebaut! Antippen zum Ausbauen.`);
  BAUMODUS = null; BAU = null; SEL = null;   // nach dem Bauen ist der Baumodus aus – sonst baut man aus Versehen weiter (rechts wieder „Burg stärken“)
  bauleisteRender(); bauOkZeigen(); renderBau(); renderVorschau?.();
  if (P.phase === 'nacht' && N) nachtAufstellen(N);
}
// Maus über dem Feld: Geisterturm folgt (nur im Baumodus und solange er nicht abgesetzt ist); Esc / Rechtsklick = Stopp
function bauSteuerung(cv) {
  cv.onmousemove = (ev) => {
    if (!BAUMODUS || BAU?.fest) return;
    const r = cv.getBoundingClientRect(), k = r.width / NFELD.w;
    bauZeigen((ev.clientX - r.left) / k - 0.5, (ev.clientY - r.top) / k - 0.5, false);
  };
  cv.onmouseleave = () => { if (BAU && !BAU.fest) BAU = null; };
  cv.oncontextmenu = (ev) => { if (BAUMODUS) { ev.preventDefault(); bauAbbrechen(); } };
}
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && BAUMODUS && !karteOffen()) bauAbbrechen(); });
function bauPlan() {
  if (!BAU) return null;
  const art = BAU.art && TUERME[BAU.art].ab <= P.nacht ? BAU.art : 'pfeil', w = turmWerteAus(art, []);
  return { ...BAU, art, reich: w.reich, mindest: w.mindest };
}

// 🛡️ Burg stärken (Nutzerwunsch: weniger Kleinkram am Abend): Mauer, Torwache und – in der Pause – Reparatur in einem Blatt.
// Wie überall: antippen = auswählen und lesen, gekauft wird nur mit dem eigenen Knopf.
let BURG_WAHL = null;
function burgBlatt() {
  const pause = P.phase === 'nacht' && N;
  const w = WACHE[P.wache], wn = WACHE[P.wache + 1], mp = MAUER_PREIS[P.mauer], wp = WACHE_PREIS[P.wache], rp = pause ? reparaturPreis(N.n) : 0;
  const optionen = [
    { id: 'mauer', ico: '🧱', name: 'Mauer verstärken', jetzt: `${mauerMax()} Leben`, neu: mp && `+${MAUER_PLUS} Leben – jede Nacht`, preis: mp, tu: () => { P.mauer++; } },
    { id: 'wache', ico: '🛡️', name: 'Torwache ausbilden', jetzt: `${w.n} Soldaten · ${w.hp} Leben · ${w.dmg} Schaden/s`, neu: wn && `${wn.n} Soldaten · ${wn.hp} Leben · ${wn.dmg} Schaden/s`, preis: wp, tu: () => { P.wache++; } },
    { id: 'land', ico: '🌫️', name: 'Nebel vertreiben', jetzt: `Bauland ${baulandR()} Felder um das Tor`, neu: BAULAND_PREIS[P.bauland || 0] && `${BAULAND[(P.bauland || 0) + 1] + (talentHat('bauland_plus') ? 2 : 0)} Felder – du kannst weiter vorn bauen (nie direkt am Portal)`,
      preis: BAULAND_PREIS[P.bauland || 0], tu: () => { P.bauland = (P.bauland || 0) + 1; } },
    ...(pause ? [{ id: 'rep', ico: '🔧', name: 'Mauer reparieren', jetzt: `${Math.ceil(N.hp)}/${N.max} Leben`, neu: N.hp < N.max && `+${REPARATUR_PLUS} Leben – nur diese Nacht`, preis: rp, tu: () => { N.hp = Math.min(N.max, N.hp + REPARATUR_PLUS); } }] : []),
  ];
  if (!optionen.some((o) => o.id === BURG_WAHL)) BURG_WAHL = null;
  const sel = optionen.find((o) => o.id === BURG_WAHL);
  karte(`<h2>🛡️ Burg stärken</h2><p class="hinweis">Türme baust du auf dem Spielfeld. Hier geht es um die Burg selbst und ums Bauland. Du hast <b>${P.gold} 🪙</b>.</p>
    <div class="spezwahl">${optionen.map((o) => `<button data-burgwahl="${o.id}" class="${BURG_WAHL === o.id ? 'sel' : ''}" ${o.neu ? '' : 'disabled'}>
      <span class="sico">${o.ico}</span><b>${o.name}</b><span class="hinweis">Jetzt: ${o.jetzt}${o.neu ? `<br>Danach: ${o.neu}` : ' · ganz ausgebaut'}</span>
      <span class="p">${o.neu ? `${o.preis} 🪙${fehlt(o.preis)}` : ''}</span></button>`).join('')}</div>
    ${sel ? `<div class="kaufzeile"><button class="btn gold" id="burgKauf" ${P.gold < sel.preis ? 'disabled' : ''}>${sel.ico} ${sel.name} · ${sel.preis} 🪙${fehlt(sel.preis)}</button></div>`
      : '<p class="hinweis" style="text-align:center">👆 Erst etwas antippen</p>'}`,
  [{ label: 'Fertig', fn: () => { BURG_WAHL = null; renderBau(); } }]);
  for (const b of document.querySelectorAll('[data-burgwahl]')) b.onclick = () => { BURG_WAHL = BURG_WAHL === b.dataset.burgwahl ? null : b.dataset.burgwahl; burgBlatt(); };
  const kb = $('#burgKauf');
  if (kb) kb.onclick = () => { if (P.gold < sel.preis) return; goldDazu(-sel.preis); sel.tu(); speichern(); toast(`${sel.ico} ${sel.name}!`); renderBau(); burgBlatt(); };
}

// Leben der Mauer wie in der Nacht (mit Talenten), damit Abendpanel und Nachtleiste dieselbe Zahl zeigen
function mauerMax() {
  const T = talentWerte();
  return Math.max(4, Math.round((MAUER_HP + MAUER_PLUS * P.mauer + (T.mauer || 0)) * (1 + (T.mauer_mal || 0))));
}
function renderBau() {
  const box = $('#baupanel');
  if (!box) return;   // nachts nur, solange ⏸ angehalten ist
  if (SEL === null) {
    // Nichts gewählt: Hinweis aufs Bauen, darunter ein Knopf für alles an der Burg selbst (Mauer, Torwache, Reparatur)
    const w = WACHE[P.wache], pause = P.phase === 'nacht' && N;
    if (BAUMODUS) {
      // 🏗️ Baumodus: was der gewählte Turm kann; gebaut wird mit dem Knopf am Geisterturm
      const t = TUERME[BAUMODUS];
      box.innerHTML = `<h3>${t.ico} ${t.name} bauen</h3><p class="hinweis">${esc(t.text)}</p>
        ${werteTabelle(turmWerteAus(BAUMODUS, []))}
        <p class="hinweis">${BAU?.fest ? (BAU.grund ? `🚫 ${BAU.grund}` : '👉 Jetzt am Turm auf <b>🔨 bauen</b> tippen – oder eine andere Stelle antippen.') : '👉 Tippe auf dem Spielfeld eine freie Stelle neben dem Weg an. Der gelbe Kreis zeigt die Reichweite.'}</p>
        <p class="hinweis">Doch nicht bauen? Rechts auf <b>✖ Stopp</b>.</p>`;
      return;
    }
    box.innerHTML = `<h3>🔨 Bauen</h3><p class="hinweis">Turm wählen, dann neben den Weg tippen. Turm antippen = ausbauen.</p>
      <p class="hinweis">Türme: ${Object.keys(P.tuerme).length}</p>
      <div class="zeile"><span>🧱 Mauer ${pause ? `${Math.ceil(N.hp)}/${N.max}` : `${mauerMax()} Leben`} · 🛡️ Torwache: ${w.n} Soldaten</span>
        <button class="btn klein gruen" id="burgBtn">🛡️ Burg stärken</button></div>`;
    $('#burgBtn').onclick = () => burgBlatt();
    return;
  }
  const tw = P.tuerme[SEL];
  if (!tw) { SEL = null; renderBau(); return; }   // gerade verkauft
  const t = TUERME[tw.art], stufe = turmStufe(tw), w = turmWerteAus(tw.art, tw.wahl, tw.vet);
  const zahl = (v) => Math.round(v * 100) / 100;
  const werte = [['schaden', w.dmg], ['reichweite', w.reich], ['mindestens', w.mindest, ' Felder entfernt'], ['takt', w.takt, ' s'], ['pfeile', w.pfeile > 1 && w.pfeile],
    ['steine', w.steine > 1 && w.steine], ['flaeche', w.flaeche],
    ['bremse', w.bremse, ' s'], ['tempo_gebremst', w.bremsFaktor], ['kette', w.kette], ['betaeubt', w.stun, ' s'], ['feuer', w.feuer, '/s'],
    ['eisfeld', w.eisfeld], ['friert_jeden', w.frierJedes, '. Schuss'], ['durchschlag', w.durchschlag && 'True'], ['ueberladung', w.ersterDoppelt && 'True']]
    .filter(([, v]) => v).map(([k, v, e]) => `${k} = ${typeof v === 'number' ? zahl(v) : v}${e ? `  # ${e.trim()}` : ''}`).join('\n');
  const weg = tw.wahl.map((x, i) => { const o = t.wege[i][x === 'a' ? 0 : 1]; return `<span class="wegchip ${x}">${o.ico} ${o.name}</span>`; }).join('');
  const preis = stufe < MAX_STUFE ? ausbauPreis(tw.art, stufe) : 0;
  box.innerHTML = `<h3>${t.ico} ${t.name} · Stufe ${stufe}</h3>
    ${weg ? `<div class="wegleiste">${weg}</div>` : `<p class="hinweis">${t.text}</p>`}
    <div class="steckbrief">${werte}</div>
    ${stufe < MAX_STUFE ? `<button class="btn ${P.gold >= preis ? 'gold' : 'leise'}" id="blattBtn" style="margin-top:10px">⬆️ Ausbau ansehen · ${preis} 🪙${fehlt(preis)}</button>` : (tw.vet || 0) < VETERAN_MAX ? `<button class="btn ${P.gold >= veteranPreis(tw.art, tw.vet || 0) ? 'gold' : 'leise'}" id="blattBtn" style="margin-top:10px">🎖️ Veteran ansehen · ${veteranPreis(tw.art, tw.vet || 0)} 🪙${fehlt(veteranPreis(tw.art, tw.vet || 0))}</button>`
      : '<p class="hinweis" style="margin-top:8px">✨ Voll ausgebaut.</p>'}`;
  const bb = $('#blattBtn');
  if (bb) bb.onclick = () => turmBlatt(SEL);
}

// 🎖️ Voll ausgebaut: Veteranen-Abzeichen als Karte (antippen = Werte ansehen, Kaufknopf direkt darunter)
function veteranHtml(tw) {
  const v = tw.vet || 0;
  if (v >= VETERAN_MAX) return `<p class="hinweis">✨ Voll ausgebaut und ${VETERAN_MAX}-facher Veteran – mehr geht nicht.</p>`;
  const preis = veteranPreis(tw.art, v), sel = TB.wahl === 'vet';
  return `<h3 class="kabschnitt">🎖️ Veteranen <span class="hinweis">– voll ausgebaut, aber noch nicht am Ende (${v}/${VETERAN_MAX})</span></h3>
    <div class="ausbauwahl"><button class="ausbaukarte ${sel ? 'sel' : ''}" data-w="vet"><span class="sico">🎖️</span><b>Veteran ${v + 1}</b>
      <span class="hinweis">+${Math.round(VETERAN_DMG * 100)} % Schaden, etwas mehr Reichweite. Jedes Abzeichen kostet mehr.</span><span class="p">${preis} 🪙${fehlt(preis)}</span></button></div>
    ${sel ? `<div class="kaufzeile links"><button class="btn gold" id="tbKauf" ${P.gold < preis ? 'disabled' : ''}>🎖️ Veteran ${v + 1} kaufen · ${preis} 🪙${fehlt(preis)}</button></div>` : ''}`;
}

// --- 🏰 Turmblatt: bauen und ausbauen wie im Talentbaum ---
// Erst antippen und lesen, gekauft wird nur mit dem eigenen Knopf.
let TB = { slot: null, wahl: null };
const WERT_NAME = {
  dmg: ['💥 Schaden', ''], reich: ['🎯 Reichweite', ' Felder'], mindest: ['↔️ Mindestabstand', ' Felder'], takt: ['⏱️ Schuss alle', ' s'],
  pfeile: ['🏹 Pfeile pro Schuss', ''], steine: ['🪨 Steine pro Wurf', ''], flaeche: ['💫 Trefferfläche', ' Felder'],
  bremse: ['🐌 Bremst für', ' s'], bremsFaktor: ['🐌 Tempo gebremst', '×'], kette: ['⚡ Springt auf', ' Gegner'], stun: ['💫 Betäubt für', ' s'],
  feuer: ['🔥 Feuer', ' pro s'], eisfeld: ['❄️ Eisfeld', ''], frierJedes: ['🧊 Friert jeden', '. Schuss'], durchschlag: ['➡️ Durchschlag', ''], ersterDoppelt: ['⚡ Überladung', ''],
  rueckstoss: ['🌬️ Pustet zurück', ' Felder'], stoesse: ['🪢 Je Monster höchstens', '-mal'],
};
// 👑 Fähigkeiten der Meisterstufen (Stufe 5 und 6) als Zeile
function turmFaehigZeile(tw) {
  const f = tw.wahl.slice(3).map((x, i) => TUERME[tw.art].wege[i + 3][x === 'a' ? 0 : 1]);
  return f.length ? `<p class="hinweis">👑 ${f.map((o) => `${o.ico} ${esc(o.name)}`).join(' · ')}</p>` : '';
}
const wertText = (k, v) => v === true ? 'ja' : !v ? '–' : `${String(Math.round(v * 100) / 100).replace('.', ',')}${WERT_NAME[k][1]}`;

// Werte als Tabelle; mit „nachher“ wird die Änderung hervorgehoben (alt → neu)
function werteTabelle(v, n) {
  return `<div class="turmwerte">${Object.keys(WERT_NAME).filter((k) => (v[k] && !(k === 'pfeile' || k === 'steine') || v[k] > 1) || (n && n[k] !== v[k] && n[k])).map((k) => {
    const neu = n && n[k] !== v[k];
    return `<div class="${neu ? 'neu' : ''}"><span>${WERT_NAME[k][0]}</span><b>${neu ? `${wertText(k, v[k])} → ${wertText(k, n[k])}` : wertText(k, v[k])}</b></div>`;
  }).join('')}</div>`;
}

// slot = Id eines Turms oder 'neu' (Bauplan BAU)
function turmBlatt(slot) {
  if (slot === null || (slot === 'neu' ? !BAU || BAU.grund : !P.tuerme[slot])) return;
  if (TB.slot !== slot) TB = { slot, wahl: slot === 'neu' ? BAU.art : null };
  SEL = slot === 'neu' ? null : slot; KAUF = null;
  karte('<div id="turmBlatt"></div>', [{ label: 'Fertig', fn: () => { if (!BAUMODUS) BAU = null; bauleisteRender(); bauOkZeigen(); renderBau(); renderVorschau(); if (P.phase === 'nacht' && N) nachtAufstellen(N); } }]);
  $('#overlay .sheet').classList.add('breit');
  turmBlattRender();
}

function turmBlattRender() {
  const slot = TB.slot, tw = slot === 'neu' ? null : P.tuerme[slot], box = $('#turmBlatt');
  if (!box) return;
  const kopf = (titel) => `<div class="tkopf"><h2>${titel}</h2><span><b>${P.gold} 🪙</b></span></div>`;
  if (!tw) {
    if (!BAU) { box.innerHTML = `${kopf('🔨 Turm bauen')}<p class="hinweis">Tippe auf dem Spielfeld eine freie Stelle an.</p>`; return; }
    // Leerer Platz: Turmarten als Karten
    const arten = Object.entries(TUERME), offen = arten.filter(([id]) => turmOffen(id));
    const naechste = arten.filter(([, t]) => t.ab > P.nacht && !t.talent).sort((a, b) => a[1].ab - b[1].ab)[0];
    if (!TB.wahl || !TUERME[TB.wahl] || !turmOffen(TB.wahl)) TB.wahl = offen[0][0];
    const t = TUERME[TB.wahl], preis = turmPreis(TB.wahl), teurer = preis > t.preis;
    BAU.art = TB.wahl;   // auf dem Spielfeld zeigt der Kreis dann diese Turmart
    box.innerHTML = `${kopf('🔨 Turm bauen')}<div class="turmkarten">${offen.map(([id, o]) => `
      <button data-art="${id}" class="${TB.wahl === id ? 'sel' : ''}"><span class="sico">${o.ico}</span><b>${o.name}</b><span class="p">${turmPreis(id)} 🪙${fehlt(turmPreis(id))}</span></button>`).join('')}
      ${naechste ? `<button disabled><span class="sico">🔒</span><b>???</b><span class="hinweis">ab Nacht ${naechste[1].ab}</span></button>` : ''}</div>
      <div class="kaufzeile"><button class="btn gold" id="tbKauf" ${P.gold < preis ? 'disabled' : ''}>🔨 ${t.ico} ${t.name} bauen · ${preis} 🪙${fehlt(preis)}</button></div>
      ${P.gold < preis ? `<p class="hinweis">Gold verdienst du ${ENDLOS ? 'mit dem Kopfgeld in der Nacht' : 'morgen auf einem Hof'}.</p>` : ''}
      ${teurer ? `<p class="hinweis">🪙 Du hast schon ${Object.keys(P.tuerme).length} Türme – jeder weitere kostet etwas mehr. Ausbauen lohnt sich oft mehr.</p>` : ''}
      <div class="turminfo"><h3>${t.ico} ${t.name}</h3><p>${esc(t.text)}</p>${tbFeld()}${werteTabelle(turmWerteAus(TB.wahl, []))}</div>`;
    const w0 = turmWerteAus(TB.wahl, []);
    tbVorschau({ slot: 'neu', x: BAU.x, y: BAU.y, art: TB.wahl, reich: w0.reich, mindest: w0.mindest });
    for (const b of box.querySelectorAll('[data-art]')) b.onclick = () => { TB.wahl = b.dataset.art; turmBlattRender(); };
    $('#tbKauf').onclick = () => {
      if (P.gold < preis || platzPruefen(BAU.x, BAU.y)) return;
      const id = neueTurmId();
      goldDazu(-preis); P.tuerme[id] = { art: TB.wahl, wahl: [], x: BAU.x, y: BAU.y, bezahlt: preis }; speichern();
      BAU = null; TB = { slot: id, wahl: null }; SEL = id;
      TURM_BAU[id] = performance.now() / 1000;   // 🔨 Bau-Animation im Feld
      toast(`${t.ico} ${t.name} gebaut!`);
      turmBlattRender();
    };
    return;
  }
  // Turm steht (übersichtlich, Nutzerwunsch 2026-11-09): oben die bisherigen Wahlen als Leiste, darunter die NÄCHSTE
  // Entscheidung als zwei große Karten (antippen = Werte und Reichweite ansehen, kaufen nur mit dem Knopf),
  // unten Verkaufen und der ganze Baum zum Aufklappen (🌳 Alle Stufen ansehen).
  const t = TUERME[tw.art], stufe = turmStufe(tw), U = 60, i0 = tw.wahl.length;
  // TB.wahl: '1a' … = ein Ausbau ist angetippt; sonst null (Werte des Turms)
  if (TB.wahl && !/^[0-9][ab]$/.test(TB.wahl) && TB.wahl !== 'vet') TB.wahl = null;
  if (TB.wahl === 'vet' && stufe < MAX_STUFE) TB.wahl = null;
  const pos = (i, x) => [x === 'a' ? -1.5 : 1.5, 3.3 - 1.25 * (i + 1)];   // Stufe i+2, Weg a links, b rechts
  let kanten = '', knoten = '';
  for (let i = 0; i < t.wege.length; i++) {
    for (const x of 'ab') {
      const [px, py] = pos(i, x);
      const vor = i === 0 ? [['', 0, 3.3]] : [...'ab'].map((y) => [y, ...pos(i - 1, y)]);
      for (const [y, qx, qy] of vor) {
        const an = tw.wahl[i] === x && (i === 0 || tw.wahl[i - 1] === y);
        const offen = tw.wahl.length === i && (i === 0 || tw.wahl[i - 1] === y);
        kanten += `<line x1="${qx * U}" y1="${qy * U}" x2="${px * U}" y2="${py * U}" class="tk ${an ? 'an' : ''} ${offen ? 'offen' : ''}"/>`;
      }
      const o = t.wege[i][x === 'a' ? 0 : 1], an = tw.wahl[i] === x, weg = i < tw.wahl.length && !an;
      const geht = i === tw.wahl.length, fern = i > tw.wahl.length;
      knoten += `<g class="tn weg${x} ${an ? 'an' : ''} ${geht ? 'geht' : ''} ${weg ? 'blockiert' : ''} ${fern ? 'fern' : ''} ${TB.wahl === i + x ? 'sel' : ''}" data-w="${i}${x}" transform="translate(${px * U},${py * U})">
        <circle r="${0.42 * U}"/><text style="font-size:${0.42 * U}px">${o.ico}</text>
        <text y="${0.68 * U}" class="tname">${esc(o.name)}</text></g>`;
    }
    knoten += `<text x="0" y="${(3.3 - 1.25 * (i + 1)) * U}" class="tstufe">${i >= 3 ? '👑 ' : ''}Stufe ${i + 2}</text>`;
  }
  knoten += `<g class="tn mitte" transform="translate(0,${3.3 * U})"><circle r="${0.5 * U}"/><text style="font-size:${0.5 * U}px">${t.ico}</text></g>`;
  const oben = 3.3 - 1.25 * t.wege.length - 0.75;
  // bisherige Wahlen als kleine Leiste
  const leiste = tw.wahl.length
    ? tw.wahl.map((x, j) => { const o = t.wege[j][x === 'a' ? 0 : 1]; return `<span class="wahlchip">${o.ico} ${esc(o.name)}</span>`; }).join('')
    : '<span class="hinweis">Noch kein Ausbau – der Turm ist auf Stufe 1.</span>';
  // die nächste Entscheidung als zwei Karten
  const karteNaechst = (x) => {
    const o = t.wege[i0][x === 'a' ? 0 : 1], preis = ausbauPreis(tw.art, i0 + 1);
    return `<button class="ausbaukarte ${TB.wahl === i0 + x ? 'sel' : ''}" data-w="${i0}${x}"><span class="sico">${o.ico}</span><b>${esc(o.name)}</b>
      <span class="hinweis">${esc(o.text)}</span><span class="p">${preis} 🪙${fehlt(preis)}</span></button>`;
  };
  // Kaufknopf direkt unter der angetippten Karte (Nutzerwunsch: nicht weit unten)
  const kaufHier = TB.wahl && +TB.wahl[0] === i0 && stufe < MAX_STUFE;
  const kaufO = kaufHier ? t.wege[i0][TB.wahl[1] === 'a' ? 0 : 1] : null, kaufPreis = kaufHier ? ausbauPreis(tw.art, i0 + 1) : 0;
  box.innerHTML = `${kopf(`${t.ico} ${t.name} · Stufe ${stufe}`)}
    <div class="wahlleiste">${leiste}</div>
    ${stufe < MAX_STUFE ? `<h3 class="kabschnitt">⬆️ Nächster Ausbau: Stufe ${stufe + 1}${stufe + 1 >= 5 ? ' · 👑 Meisterstufe' : ''} <span class="hinweis">– wähle einen der beiden Wege</span></h3>
      <div class="ausbauwahl">${karteNaechst('a')}<span class="oder">oder</span>${karteNaechst('b')}</div>
      ${kaufHier ? `<div class="kaufzeile ${TB.wahl[1] === 'b' ? 'rechts' : 'links'}"><button class="btn gold" id="tbKauf" ${P.gold < kaufPreis ? 'disabled' : ''}>⬆️ ${kaufO.ico} ${esc(kaufO.name)} kaufen · ${kaufPreis} 🪙${fehlt(kaufPreis)}</button></div>` : ''}` : veteranHtml(tw)}
    <div id="turmInfo" class="turminfo"></div>
    <div class="turmunten"><button class="btn ${TB.verkauf ? 'warn' : 'leise'} klein" id="tbVerkauf"></button></div>
    <details class="turmbaum"><summary>🌳 Alle Stufen ansehen</summary>
      <svg viewBox="${-2.6 * U} ${oben * U} ${5.2 * U} ${(4.05 - oben) * U}" class="talentsvg turmsvg">${kanten}${knoten}</svg></details>`;
  for (const g of box.querySelectorAll('[data-w]')) g.onclick = () => { TB.wahl = TB.wahl === g.dataset.w ? null : g.dataset.w; TB.verkauf = false; turmBlattRender(); };
  if (TB.baumOffen) box.querySelector('.turmbaum').open = true;
  box.querySelector('.turmbaum').ontoggle = (e) => { TB.baumOffen = e.target.open; };
  // 💰 Verkaufen: 60 % von allem, was der Turm gekostet hat; zweimal antippen
  const vetWert = Array.from({ length: tw.vet || 0 }, (_, v) => veteranPreis(tw.art, v)).reduce((s, p) => s + p, 0);
  const wert = Math.round(((tw.bezahlt || t.preis) + tw.wahl.reduce((s, _, j) => s + ausbauPreis(tw.art, j + 1), 0) + vetWert) * VERKAUF_ANTEIL);
  const vk = $('#tbVerkauf');
  vk.innerHTML = TB.verkauf ? 'Wirklich? Nochmal tippen!' : `💰 Verkaufen · +${wert} 🪙 (${Math.round(VERKAUF_ANTEIL * 100)} % zurück)`;
  vk.onclick = () => {
    if (!TB.verkauf) { TB.verkauf = true; turmBlattRender(); return; }
    TB.verkauf = false; delete P.tuerme[slot]; goldDazu(wert); speichern();
    toast(`💰 ${t.name} verkauft: +${wert} 🪙`);
    BAU = { x: tw.x, y: tw.y, grund: null, art: tw.art }; TB = { slot: 'neu', wahl: tw.art }; SEL = null;   // gleich hier etwas Neues bauen?
    turmBlattRender();
  };
  const info = $('#turmInfo'), jetzt = turmWerteAus(tw.art, tw.wahl, tw.vet);
  if (TB.wahl === 'vet') {
    // 🎖️ Veteranen-Abzeichen ansehen: Werte alt → neu, gekauft wird nur mit dem Knopf unter der Karte
    const v = tw.vet || 0, nachher = v < VETERAN_MAX ? turmWerteAus(tw.art, tw.wahl, v + 1) : null, preis = nachher ? veteranPreis(tw.art, v) : 0;
    info.innerHTML = `<div class="tart">🎖️ Veteran ${v + 1 > VETERAN_MAX ? VETERAN_MAX : v + 1} von ${VETERAN_MAX}</div><h3>🎖️ Veteranen-Abzeichen</h3>
      <p>Die Turmbesatzung hat viele Nächte erlebt und wird noch geschickter: +${Math.round(VETERAN_DMG * 100)} % Schaden und ein Stück mehr Reichweite.</p>
      ${tbFeld()}${werteTabelle(jetzt, nachher)}`;
    tbVorschau({ slot, reich: (nachher || jetzt).reich, alt: jetzt.reich, mindest: jetzt.mindest });
    const kb = $('#tbKauf');
    if (kb) kb.onclick = () => {
      if (!nachher || P.gold < preis) return;
      goldDazu(-preis); tw.vet = v + 1; speichern();
      TURM_BAU[slot] = performance.now() / 1000;
      toast(`🎖️ ${t.name}: Veteran ${tw.vet}!`);
      TB.wahl = null;   // nächstes Abzeichen wieder erst antippen, dann kaufen (nie mit einem Antippen)
      turmBlattRender();
    };
    return;
  }
  if (!TB.wahl) {
    // nichts angetippt: was der Turm jetzt kann
    info.innerHTML = `<p class="hinweis">${esc(t.text)}${stufe < MAX_STUFE ? ' Tippe oben einen Ausbau an, um zu sehen, was er ändert.' : ''}</p>${tbFeld()}${werteTabelle(jetzt)}${turmFaehigZeile(tw)}`;
    tbVorschau({ slot, reich: jetzt.reich, mindest: jetzt.mindest });
    return;
  }
  const i = +TB.wahl[0], x = TB.wahl[1], o = t.wege[i][x === 'a' ? 0 : 1], preis = ausbauPreis(tw.art, i + 1);
  let unten;
  if (tw.wahl[i] === x) unten = '<p class="hinweis">✅ Schon ausgebaut.</p>';
  else if (i < tw.wahl.length) unten = '<p class="hinweis">Auf dieser Stufe hast du den anderen Weg gewählt.</p>';
  else if (i > tw.wahl.length) unten = `<p class="hinweis">🔒 Erst Stufe ${tw.wahl.length + 2} ausbauen.</p>`;
  else unten = '';   // Kaufknopf steht direkt unter den beiden Karten
  const nachher = i === tw.wahl.length ? turmWerteAus(tw.art, [...tw.wahl, x]) : null;
  info.innerHTML = `<div class="tart">Stufe ${i + 2}${i >= 3 ? ' · 👑 Meisterstufe' : ''}</div><h3>${o.ico} ${esc(o.name)}</h3><p>${esc(o.text)}</p>
    ${tbFeld()}${werteTabelle(jetzt, nachher)}${unten}`;
  tbVorschau({ slot, reich: (nachher || jetzt).reich, alt: jetzt.reich, mindest: (nachher || jetzt).mindest });
  const kb = $('#tbKauf');
  if (kb) kb.onclick = () => {
    if (P.gold < preis) return;
    goldDazu(-preis); tw.wahl.push(x); speichern();
    TURM_BAU[slot] = performance.now() / 1000;   // 🔨 Ausbau-Animation im Feld
    toast(`⬆️ ${o.ico} ${o.name}!`);
    TB.wahl = null;
    turmBlattRender();
  };
}

// 🎯 kleine Karte im Turmblatt: zeigt die Reichweite schon vor dem Kauf
const tbFeld = () => '<div class="tbfeld"><canvas id="tbCanvas"></canvas><span class="hinweis">🎯 So weit reicht der Turm</span></div>';
function tbVorschau(vs) {
  const cv = $('#tbCanvas');
  if (cv) zeichneNacht(cv, null, { mini: true, bauen: true, vorschau: vs });
}

// Käufe ab KAUF_BESTAETIGEN brauchen ein zweites Antippen
function kaufe(key, preis, tu) {
  if (P.gold < preis) return;
  if (preis >= KAUF_BESTAETIGEN && KAUF !== key) { KAUF = key; renderBau(); return; }
  KAUF = null;
  goldDazu(-preis);
  tu();
  speichern();
  renderBau();
  renderVorschau();
}

function renderVorschau() {
  if (!$('#vorschau')) return;   // in der Pause der Nacht gibt es keine Vorschau
  const n = P.nacht, alleWellen = wellenFuer(n), wellen = alleWellen.flat(), r = risiko(n);
  const neu = PORTALE.filter((p) => p.ab === n && n > 1);
  // je Welle eine Zeile mit den Gegnern als Symbolen
  const zeilen = alleWellen.map((gr, i) => `<div class="zeile"><span>Welle ${i + 1}</span>
    <span>${gr.map((w) => w.chef ? `👑 ${CHEF[w.g]}` : `${GEGNER[w.g].ico}×${w.n}`).join(' ')}</span></div>`).join('');
  const arten = [...new Set(wellen.map((w) => w.g))];
  const steckbriefe = arten.map((id) => {
    const g = GEGNER[id], res = Object.entries(g.res).map(([a, v]) => `\n${id}.resistenz_${a} = ${v}`).join('');
    return `<div class="steckbrief">${id} = Gegner()\n${id}.hp = ${g.hp}\n${id}.tempo = ${g.tempo}\n${id}.ruestung = ${g.ruestung}${res}\n# ${g.tip}</div>`;
  }).join('');
  // 🦇 Warnung: Flieger kommen, aber kein Turm trifft sie in der Luft (Spieltest 2026-11-13: nur Katapulte → Nacht 12 dreimal verloren)
  const tuerme = Object.values(P.tuerme || {}).map((t) => t.art);
  const flieger = arten.filter((g) => GEGNER[g].fliegt);
  const luftWarnung = flieger.length && tuerme.length && !tuerme.some((a) => LUFT_TUERME.includes(a))
    ? `<p class="luftwarnung">⚠️ Heute kommen Flieger (${flieger.map((g) => GEGNER[g].ico).join(' ')}) – keiner deiner Türme trifft sie in der Luft!${tuerme.includes('katapult') ? ' Das Katapult trifft nur am Boden.' : ''} Baue einen 🏹 Pfeilturm${turmOffen('blitz') ? ' oder 🌩️ Blitzturm' : ''} nah am Tor${turmOffen('eis') ? ' – ein 🧊 Eisturm holt sie zu Boden' : ''}.</p>` : '';
  $('#vorschau').innerHTML = `<h3>👁 Heute Nacht ${n} ${n > KAMPAGNE ? '· Endlos' : ''}</h3>
    ${luftWarnung}
    ${neu.length ?`<p>⚠️ Ein neues Portal öffnet sich: <b>${neu.map((p) => p.name).join(', ')}</b> (es flackert).</p>` : ''}
    ${P.niederlagen ? `<p>😮‍💨 Die Monster sind vom letzten Angriff erschöpft: <b>−${Math.round(schwaechung() * 100)} % Leben</b>.</p>` : ''}
    ${zeilen}
    <p style="margin-top:8px">Einschätzung: <span class="risiko ${r.stufe}">${r.text}</span></p>
    <details><summary>Steckbriefe</summary>${steckbriefe}</details>`;
}
