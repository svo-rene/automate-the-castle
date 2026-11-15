'use strict';
// --- Konstanten, Spieldaten, Spielstand -------------------------------------------

// 🎓 Zwei Eingänge, ein Spiel: Sek I (index.html, Burg 7–9) und Leistungskurs (lk.html → index.html?lk).
// Im LK eigene Spielstände (atc_lk_…), eigene Burgwahl mit den LK-Burgen; Burg 7–9 sind dort freiwillige 🔄 Auffrischung.
const LK = new URLSearchParams(location.search).has('lk');
const SAVE_KEY = LK ? 'atc_lk_burg7' : 'atc_save1';
const ZUEGE = 80;          // Zugbudget je Lauf (1 Aktion = 1 Zug)
const DENKGRENZE = 400;    // so viele Zeilen ohne Aktion = „denkt zu lange nach“
const STERN_BONUS = 0.5;   // jeder Stern gibt +50 % Lohn
const TEILLOHN = 0.4;      // nicht geschafft: 40 % des Lohns mal dem geschafften Anteil (2 von 3 Rüben = 27 %)
const NACHARBEIT = 0.4;    // schon gelöster Hof: 40 % Lohn (neue Sterne zählen voll)
// 🪙 Nacht-Gold: je besiegtem Monster (so viel wie seine XP × NACHT_GOLD) und je gehaltener Welle.
// Solange in der Burg noch Aufgaben offen sind, nur ein Teil (NACHT_GOLD_OFFEN) – Gold kommt vor allem vom Programmieren.
// 2026-11-10 Spieltest: „+3 🪙 für 42 Monster“ fühlte sich nach nichts an – offen jetzt 0,22 statt 0,15.
// (0,3 war zu viel: für Schwache brachte die Nacht fast so viel wie der Tag – Programmieren soll sich mehr lohnen.)
// 2026-11-15 Nutzer: „zu wenig Gold – alles ging in Türme, Mauer und Zauber waren nie drin“ → offen 0,28 (Messung in balance.js-Kommentar)
const NACHT_GOLD = 0.3, NACHT_GOLD_OFFEN = 0.28;
const KAUF_BESTAETIGEN = 100; // Käufe ab 100 🪙 brauchen ein zweites Antippen

// Regionen der Landkarte (Plan Abschnitt 7). Spielbar ist vorerst nur 🌾 Höfe.
const REGIONEN = [
  { id: 'hoefe', ico: '🌾', name: 'Höfe', thema: 'Algorithmen', offen: true },
  { id: 'signal', ico: '🔦', name: 'Signalturm', thema: 'Daten und Codierung' },
  { id: 'torwerk', ico: '⚙️', name: 'Torwerk', thema: 'Automaten und Sprachen' },
  { id: 'tauben', ico: '🕊️', name: 'Taubenschlag', thema: 'Netzwerke und Sicherheit' },
  { id: 'archiv', ico: '📜', name: 'Archiv', thema: 'Datenbanken' },
  { id: 'spaeher', ico: '🔭', name: 'Späherturm', thema: 'KI' },
  { id: 'werkstatt', ico: '🔧', name: 'Werkstatt', thema: 'OOP' },
  { id: 'handel', ico: '🐎', name: 'Handelsstraßen', thema: 'Graphen' },
];

// --- Nacht: Spielfeld 16 × 10 Felder --------------------------------------------
const NFELD = { w: 16, h: 10 };
const BURG = { x: 14.5, y: 5, tor: { x: 13.5, y: 5 } };
// Portale am Rand, jedes mit eigenem Weg; kurz vor dem Tor laufen die Wege zusammen.
// ab = erste Nacht, in der das Portal offen ist (am Abend davor flackert es schon).
const PORTALE = [
  // Nutzerwunsch: nur EIN großes Portal hinten in der Mitte, ein gewundener Weg (S-Kurven) zum Tor.
  // In den Kurven deckt ein Turm mehrere Wegstücke ab. Wellen, die noch 'west'/'sued'/'nord' nennen, kommen alle hier heraus.
  { id: 'mitte', name: 'Portal', ab: 1, weg: [[0, 5], [3, 5], [3, 2], [6.5, 2], [6.5, 8], [10, 8], [10, 5], [13.5, 5]] },
];
// 🏗️ Freie Türme (2026-11-10, Nutzerwunsch wie Bloons): Ein Turm steht, wo man ihn hinstellt – P.tuerme[id] = {art, wahl, x, y},
// id = kleinste freie Zahl (neueTurmId). Wie viele Türme es gibt, entscheidet nur das Gold.
// Regeln in platzPruefen (nachtbild.js): nicht auf dem Weg (WEG_FREI), nicht an Rand, Mauer oder Bäumen, und jeder Turm hat
// eine kleine „Hitbox“ (TURM_ABSTAND zwischen zwei Türmen) – stapeln geht nicht.
const TURM_ABSTAND = 1.1, WEG_FREI = 0.75;
// 🌫️ Bauland (2026-11-13, Nutzerwunsch: sonst stellt man alle Türme ans Portal): Bauen geht nur im Kreis um das Tor
// (BAULAND[P.bauland], Radius in Feldern). „Nebel vertreiben“ im Blatt 🛡️ Burg stärken macht ihn größer (BAULAND_PREIS = Gold-Senke).
// Um jedes Portal liegt immer dichter Nebel (PORTAL_NEBEL): dort kann nie gebaut werden, und Türme treffen Monster darin nicht –
// nur Held und Zauber (nacht.js schiesse/treffe).
const BAULAND = [7, 9, 11, 14];
const BAULAND_PREIS = [300, 800, 1800];
const PORTAL_NEBEL = 3;
const baulandR = () => BAULAND[Math.min(BAULAND.length - 1, P.bauland || 0)] + (talentHat('bauland_plus') ? 2 : 0) + schatzSumme('bauland_plus');   // ✦ Leuchtfeuer (talente.js)
const imBauland = (x, y) => Math.hypot(x - BURG.tor.x, y - BURG.y) <= baulandR();
const imPortalNebel = (x, y) => PORTALE.some((p) => Math.hypot(x - p.weg[0][0], y - p.weg[0][1]) < PORTAL_NEBEL);
const neueTurmId = () => { let i = 0; while (P.tuerme[i]) i++; return i; };
// 🪙 Ab dem 5. Turm kostet jeder weitere etwas mehr (×TURM_TEURER je Turm) – sonst stellt man im späten Spiel einfach
// Dutzende Türme hin (Bot ohne: Nacht 58/56/52 statt 49/43/30; mit 1,15 noch 20 Türme). Gleichzeitig die Gold-Senke fürs späte Spiel.
let TURM_TEURER = 1.45;   // let: im Test-Tab zum Ausprobieren · 2026-11-15: 1,3 → 1,45, damit das Mehr an Gold nicht nur in noch mehr Türme geht
const TURM_GUENSTIG = 4;
// 🐢 Langsamer Einstieg (Nutzerwunsch 2026-11-15: „erst Türme, dann Türme ausbauen, dann Level“): Türme gibt es ab Nacht 1,
// Ausbauen ab AUSBAU_AB, Held-Level/Talente ab HELD_AB. XP zählen vorher still mit – die Punkte kommen dann gesammelt.
// Wer es schon einmal freigeschaltet hat (Profil, alle Burgen), hat es sofort. Werte nach Bot-Messung (balance.js).
let AUSBAU_AB = 2, HELD_AB = 4;   // let: im Test-Tab zum Messen · Bot (16 Tage): 2/4 so schaffbar wie ohne Sperre, 3/4 für „schwach“ in einem Lauf 3 statt 1 Niederlage
const ausbauOffen = () => ENDLOS || P.nacht >= AUSBAU_AB || !!PROFIL.gesehen?.ausbauFrei || Object.values(P.tuerme || {}).some((t) => t.wahl?.length);
const heldOffen = () => ENDLOS || P.nacht >= HELD_AB || !!PROFIL.gesehen?.heldFrei || (P.talente || []).length > 1;
// 🪙 Rabatt aus dem Talentnetz (Fund „Baumeisterin“): Summe der turm_rabatt-Werte gelernter Knoten
const turmRabatt = () => typeof TALENTE === 'undefined' ? 1 : 1 - Math.min(0.5, (P?.talente || []).reduce((s, id) => s + (TALENTE[id]?.mod?.turm_rabatt || 0), 0) + (typeof schatzSumme === 'function' ? schatzSumme('turm_rabatt') : 0));
const turmPreis = (art) => Math.round(TUERME[art].preis * TURM_TEURER ** Math.max(0, Object.keys(P.tuerme).length - TURM_GUENSTIG + 1) * turmRabatt());
// Plätze aus der Zeit der festen Bauplätze (Index = alte Platznummer im Spielstand); 0–3 lagen in den Taschen der S-Kurve
const ALTE_PLAETZE = [
  { x: 8.25, y: 4.1 }, { x: 8.25, y: 6.5 }, { x: 4.75, y: 5.9 }, { x: 4.75, y: 3.5 },
  { x: 11.8, y: 3.8 }, { x: 11.8, y: 6.3 }, { x: 8.25, y: 9.2 }, { x: 1.5, y: 3.2 },
  { x: 4.75, y: 0.8 }, { x: 8.25, y: 1.0 }, { x: 12, y: 8.3 }, { x: 1.5, y: 7.6 },
];
// ⚔️ Schwierigkeit der Nacht (P.schwierigkeit): ändert nur das Leben der Monster. Ein Klassenranking zählt das Programmieren,
// Nachtrekorde stehen dort nur mit Abzeichen (siehe PLAN.md).
const SCHWIERIG = {
  leicht: { ico: '🟢', name: 'Leicht', leben: 0.7, text: 'Monster haben 30 % weniger Leben. Gut zum Ausprobieren.' },
  normal: { ico: '🟡', name: 'Normal', leben: 1, text: 'So ist das Spiel gedacht.' },
  schwer: { ico: '🔴', name: 'Schwer', leben: 1.35, text: 'Monster haben 35 % mehr Leben. Für Profis.' },
};
const schwierig = () => SCHWIERIG[P.schwierigkeit] || SCHWIERIG.normal;
const VERKAUF_ANTEIL = 0.6;   // 💰 Turm verkaufen: so viel vom Gesamtpreis (Bau + Ausbauten) kommt zurück
// früher gekaufte Feldplätze: alte Stände bekommen das Gold zurück (laden)
const PLATZ_PREIS = [50, 70, 100, 130, 170, 220, 280, 350, 430, 520, 620];
const MAUER_HP = 12;
// Mauer verstärken: jede Stufe +MAUER_PLUS Leben
const MAUER_PLUS = 3;
const MAUER_PREIS = [60, 100, 150, 210, 280, 360, 450, 560, 700, 860, 1050, 1300];   // 2026-11-15 günstiger (vorher 80, 140, 220 … 2300): Mauer soll neben Türmen regelmäßig drin sein
// 🤖 Roboter: arbeiten jeden Morgen mit deinem gespeicherten Code auf einem gelösten Hof (wechselnde Variante)
const ROBO_PREIS = [120, 200, 320, 480, 700, 950];
const ROBO_ANTEIL = 0.25;        // Anteil am Hof-Lohn, wenn der Code klappt
const ROBO_SPARSAM = 0.1;        // dazu, wenn er so sparsam ist wie ⭐ sparsam
// 📓 Merke-Einträge fürs Heft aus Aufgabendateien, die nach heft.js-Art eigene Kapitel mitbringen: HEFT_EXTRA[kapitel] = { titel, text: [..], code? }
const HEFT_EXTRA = {};
const ROBO_AB_KAPITEL = 2;       // Roboter gibt es, wenn das so-vielte Kapitel der Burg geschafft ist
// Nach jeder verlorenen Nacht sind die Monster dieser Nacht schwächer (bis sie gehalten ist)
const SCHWAECHE = 0.15, SCHWAECHE_MAX = 0.6;
const schwaechung = () => Math.min(SCHWAECHE_MAX, SCHWAECHE * P.niederlagen);

// ⭐ Ruhm (Nutzerwunsch 2026-11-09): Jeder Stern beim Programmieren macht die Burg berühmter. Ruhm lockt stärkere Monster an
// (+RUHM_JE Leben je Punkt), die aber genauso mehr XP, Kopfgeld und Beute bringen – Sterne sind nie eine Strafe.
// Ruhm = Sterne dieser Burg + P.ruhmExtra (keine Obergrenze – er pendelt sich von selbst ein):
//   verlorene Nacht: −RUHM_VERLUST_ANTEIL des Ruhms, mindestens RUHM_VERLUST (bei viel Ruhm passt er sich so schnell an)
//   gehaltene Nacht in der Kampagne: +1 zurück, höchstens bis zur Zahl der Sterne
//   gehaltene Endlosnacht: +1, auch über die Sterne hinaus (Nutzerwunsch: Siege bringen am Ende wieder Ruhm)
// (0,02 je Punkt war zu wenig: der gute Bot hatte in der Kampagne nie Schaden an der Mauer)
const RUHM_JE = 0.035, RUHM_VERLUST = 3, RUHM_VERLUST_ANTEIL = 0.2;
// Nutzeridee 2026-11-12: Ruhm ist das Ziel des Spiels. Gehaltene Nacht ohne Schaden an der Mauer +RUHM_MAUER,
// dazu ohne einen Treffer an der Torwache noch +RUHM_WACHE (auch in der Kampagne, über die Sternzahl hinaus).
// Wer stark verteidigt, macht die nächsten Nächte schwerer; Schwächere bekommen Treffer und bleiben bei wenig Ruhm.
const RUHM_MAUER = 1, RUHM_WACHE = 1;
// 🏅 Ruhm-Abzeichen (Nutzerwunsch 2026-11-12): alle 10 Ruhm eins; verdient ist es, sobald der Rekord die Schwelle erreicht –
// es geht nach einer Niederlage nicht wieder verloren. Namen figurneutral und kindgerecht.
// 2026-11-13: 🏆 Kampf-Abzeichen (nur Ruhm aus der Verteidigung), jedes schaltet einen Schatz frei (abzeichen.js SCHAETZE).
// name = [Bauer/Zauberer, Bäuerin/Zauberin]
const RUHM_ABZEICHEN = [
  [5, '🛡️', ['Torwache', 'Torwache'], 'trommel'], [10, '🏹', ['Mauerschütze', 'Mauerschützin'], 'meisterschuss'],
  [20, '🗼', ['Turmwart', 'Turmwärterin'], 'turmbanner'], [30, '⚔️', ['Burgverteidiger', 'Burgverteidigerin'], 'meteor'],
  [40, '🌙', ['Nachtwächter', 'Nachtwächterin'], 'fernrohr'], [50, '🔥', ['Drachenschreck', 'Drachenschreck'], 'drachenbanner'],
  [65, '🏰', ['Bollwerk des Tals', 'Bollwerk des Tals'], 'riesenglocke'], [80, '👑', ['Held der Königin', 'Heldin der Königin'], 'kronplatz'],
  [100, '🌟', ['Unbezwingbar', 'Unbezwingbar'], 'sternenfall'], [125, '🐉', ['Legende des Königreichs', 'Legende des Königreichs'], 'goldburg'],
].map(([ab, ico, namen, schatz]) => ({ ab, ico, namen, schatz, get name() { return namen[PROFIL?.figur === 'w' ? 1 : 0]; } }));
const ruhmRekord = () => Math.max(P.ruhmRekord || 0, ruhm());
const abzeichenFuer = (r) => [...RUHM_ABZEICHEN].reverse().find((a) => r >= a.ab) || null;
const naechstesAbzeichen = (r) => RUHM_ABZEICHEN.find((a) => r < a.ab) || null;
const sterneZahl = () => Object.values(P.hoefe || {}).reduce((s, h) => s + (h.kurz ? 1 : 0) + (h.sparsam ? 1 : 0), 0);
// 2026-11-13 Nutzerwunsch: 🏆 Ruhm und ⭐ Sterne sind getrennt. Ruhm kommt NUR aus der Verteidigung (P.ruhmWert),
// Sterne aus den Aufgaben haben eigene Abzeichen (abzeichen.js). Beide Leitern schalten echte Schätze frei.
// (Spieltest: Sterne über 🔁/Raten trieben den Ruhm bei Schwachen hoch, die Monster passten nicht zur Verteidigung.)
const ruhm = () => Math.max(0, Math.round(P.ruhmWert || 0));
// 2026-11-13 Endlos-Spiel des Nutzers: bis Nacht 40 ohne Probleme. Ruhm wuchs, aber er brachte im selben Maß mehr
// Kopfgeld und XP – das machte die Burg genauso schnell stärker wie die Monster. Jetzt wachsen die Monster mit dem Ruhm
// immer schneller (quadratisch, RUHM_QUAD), die Belohnung nur langsam (RUHM_LOHN). Hoher Ruhm wird so wirklich schwer.
// 2026-11-13 Nutzer „steiler“: der ideale Bot hielt auch bei Ruhm 175 (×19 Leben) jede Nacht ohne Kratzer.
// Darum ab RUHM_STEIL_AB zusätzlich kubisch (unten bleibt alles wie bisher – trifft Mittlere und Schwache kaum)
// und eine 🔥 Glanzserie: jede weitere saubere Nacht in Folge bringt +1 extra (höchstens RUHM_SERIE_MAX).
// 2026-11-13 Spieltest: gute Spieler hielten bei Ruhm 78 jede Nacht ohne Kratzer → steil schon ab 40 (vorher 50 / 0,000006).
const RUHM_QUAD = 0.0004, RUHM_LOHN = 0.02, RUHM_STEIL_AB = 30, RUHM_KUBIK = 0.00003, RUHM_SERIE_MAX = 3;
const ruhmFaktor = (r = ruhm()) => 1 + RUHM_JE * r + RUHM_QUAD * r * r + RUHM_KUBIK * Math.max(0, r - RUHM_STEIL_AB) ** 3;
const ruhmLohn = (r = ruhm()) => 1 + RUHM_LOHN * r;
// nach jeder Nacht (nachtEnde und balance.js); gibt die Änderung zurück
function ruhmNachNacht(sieg, n, NN = null) {
  const vor = ruhm();
  let neu = sieg ? vor + 1 : Math.max(0, vor - Math.max(RUHM_VERLUST, Math.round(vor * RUHM_VERLUST_ANTEIL)));
  // Bonus für eine saubere Verteidigung
  P.ruhmGrund = '';
  if (sieg && NN && NN.hp >= NN.max) {
    neu += RUHM_MAUER; P.ruhmGrund = 'Mauer ohne Kratzer';
    if (!NN.wacheGetroffen) { neu += RUHM_WACHE; P.ruhmGrund = 'Mauer ohne Kratzer, Wache unverletzt'; }
    // 🔥 Glanzserie: saubere Nächte hintereinander
    P.ruhmSerie = (P.ruhmSerie || 0) + 1;
    const extra = Math.min(RUHM_SERIE_MAX, P.ruhmSerie - 1);
    if (extra > 0) { neu += extra; P.ruhmGrund += ` · 🔥 Glanzserie ${P.ruhmSerie}`; }
  } else P.ruhmSerie = 0;
  P.ruhmWert = neu;
  P.ruhmRekord = Math.max(P.ruhmRekord || 0, neu);   // höchster Ruhm dieser Burg (Heft, Fortschrittscode, später Leaderboard)
  return neu - vor;
}

// Turmarten. art = Schadensart (für Resistenzen), basis = Werte auf Stufe 1.
// wege: je Ausbau eine Wahl zwischen zwei Möglichkeiten [A, B].
// mod: mal = Wert malnehmen, plus = Wert dazuzählen, setze = neue Fähigkeit
//   pfeile (mehrere Ziele), durchschlag (Rüstung zählt nicht), stun (s stillstehen), feuer (brennender Boden, Schaden/s),
//   bremsFaktor (Tempo beim Bremsen), eisfeld (bremst alle in diesem Umkreis), frierJedes (jeder n-te Schuss friert ein),
//   ersterDoppelt (erstes Blitzziel bekommt 3× Schaden)
const TUERME = {
  pfeil: {
    ico: '🏹', name: 'Pfeilturm', art: 'pfeil', ab: 1, preis: 30,
    text: 'Schießt schnell auf einen Gegner. Rüstung hält Pfeile auf.',
    basis: { dmg: 4, reich: 4, takt: 0.6, pfeile: 1 },   // Reichweite 4 (vorher 3,4): sieht von jedem Startplatz gut die Hälfte des Wegs
    wege: [
      [{ ico: '🏹', name: 'Zwei Pfeile', text: 'Schießt auf 2 Gegner gleichzeitig.', mod: { plus: { pfeile: 1 } } },
        { ico: '💨', name: 'Schnellschuss', text: 'Schießt fast doppelt so schnell.', mod: { mal: { takt: 0.6 } } }],
      [{ ico: '🗡️', name: 'Scharfe Spitzen', text: '+60 % Schaden.', mod: { mal: { dmg: 1.6 } } },
        { ico: '🦅', name: 'Adlerauge', text: 'Reichweite +1, +20 % Schaden.', mod: { plus: { reich: 1 }, mal: { dmg: 1.2 } } }],
      [{ ico: '🎯', name: 'Durchschlag', text: 'Rüstung hält die Pfeile nicht mehr auf. +30 % Schaden.', mod: { setze: { durchschlag: true }, mal: { dmg: 1.3 } } },
        { ico: '🌧️', name: 'Pfeilhagel', text: 'Zwei Pfeile mehr pro Schuss.', mod: { plus: { pfeile: 2 } } }],
      [{ ico: '🔥', name: 'Brandpfeile', text: 'Getroffene Gegner brennen 3 s lang (4 Schaden pro Sekunde).', mod: { setze: { brandpfeil: 4 } } },
        { ico: '🎯', name: 'Volltreffer', text: 'Jeder 4. Schuss trifft mit vierfachem Schaden.', mod: { setze: { volltreffer: 4 } } }],
      [{ ico: '⛈️', name: 'Pfeilsturm', text: '🪄 Zum Auslösen (alle 5 s): Pfeile regnen auf die größte Gruppe in Reichweite (vierfacher Schaden an alle).', mod: { setze: { pfeilsturm: 5 } } },
        { ico: '🎱', name: 'Abpraller', text: 'Jeder Pfeil prallt ab und trifft noch einen zweiten Gegner.', mod: { setze: { abpraller: true } } }],
    ],
  },
  katapult: {
    ico: '🪨', name: 'Katapult', art: 'stein', ab: 1, preis: 45,
    text: 'Wirft Steine sehr weit, aber langsam. Ganz nahe Gegner trifft es nicht. Trifft keine 🦇 Flieger (nur am Boden).',
    basis: { dmg: 10, reich: 9, mindest: 2, takt: 2.8, flaeche: 0.8, steine: 1 },
    wege: [
      [{ ico: '🪨', name: 'Großer Stein', text: 'Größere Fläche, +20 % Schaden.', mod: { plus: { flaeche: 0.5 }, mal: { dmg: 1.2 } } },
        { ico: '⚙️', name: 'Schnell spannen', text: 'Wirft ein Drittel schneller.', mod: { mal: { takt: 0.68 } } }],
      [{ ico: '🔭', name: 'Weitwurf', text: 'Reichweite +1,5.', mod: { plus: { reich: 1.5 } } },
        { ico: '🔥', name: 'Brandgeschosse', text: 'Der Boden brennt nach dem Einschlag.', mod: { setze: { feuer: 3 } } }],
      [{ ico: '🌧️', name: 'Steinhagel', text: 'Wirft 3 Steine auf verschiedene Gegner.', mod: { plus: { steine: 2 } } },
        { ico: '💥', name: 'Felsbrocken', text: 'Doppelter Schaden, Getroffene stehen kurz still.', mod: { mal: { dmg: 2 }, setze: { stun: 0.5 } } }],
      [{ ico: '🧱', name: 'Splitterstein', text: 'Der Stein zerspringt beim Einschlag: 3 kleine Steine treffen Gegner ringsum (halber Schaden).', mod: { setze: { splitterstein: 3 } } },
        { ico: '🌋', name: 'Lavastein', text: 'Wo der Stein einschlägt, fließt 4 s lang Lava: 6 Schaden pro Sekunde, Gegner werden langsam.', mod: { setze: { lava: 6 } } }],
      [{ ico: '🌍', name: 'Erdbeben', text: '🪄 Zum Auslösen (alle 10 s): Die Erde bebt um die größte Gruppe – alle dort stehen 1,5 s still.', mod: { setze: { beben: 10 } } },
        { ico: '🗿', name: 'Riesenwurf', text: 'Zielt immer auf den Gegner mit dem meisten Leben und macht gegen Große dreifachen Schaden.', mod: { setze: { riesen: true } } }],
    ],
  },
  kanone: {
    ico: '💣', name: 'Kanone', art: 'feuer', ab: 2, preis: 50,
    text: 'Langsam, trifft aber alle Gegner in der Nähe des Einschlags.',
    basis: { dmg: 8, reich: 3.6, takt: 1.6, flaeche: 1.0 },
    wege: [
      [{ ico: '💥', name: 'Große Bombe', text: 'Die Explosion ist viel größer.', mod: { plus: { flaeche: 0.6 } } },
        { ico: '🧨', name: 'Schwarzpulver', text: '+60 % Schaden.', mod: { mal: { dmg: 1.6 } } }],
      [{ ico: '💫', name: 'Betäubung', text: 'Getroffene Gegner stehen 0,6 s still.', mod: { setze: { stun: 0.6 } } },
        { ico: '⚙️', name: 'Schnell laden', text: 'Schießt ein Drittel schneller.', mod: { mal: { takt: 0.65 } } }],
      [{ ico: '🔥', name: 'Brennender Boden', text: 'Der Boden brennt 2,5 s weiter.', mod: { setze: { feuer: 4 } } },
        { ico: '🔭', name: 'Weitschuss', text: 'Reichweite +1,2 und +30 % Schaden.', mod: { plus: { reich: 1.2 }, mal: { dmg: 1.3 } } }],
      [{ ico: '🎇', name: 'Streukugel', text: 'Die Kugel teilt sich in 3 kleine Kugeln, die rund um den Einschlag knallen (halber Schaden).', mod: { setze: { streu: 3 } } },
        { ico: '🌬️', name: 'Rückstoß', text: 'Die Explosion schleudert Gegner ein Stück zurück (nicht Anführer und Bosse).', mod: { setze: { rueckstoss: 0.8 } } }],
      [{ ico: '💣', name: 'Doppellauf', text: 'Schießt jedes Mal zwei Kugeln auf verschiedene Ziele.', mod: { setze: { doppellauf: true } } },
        { ico: '🔥', name: 'Feuermeer', text: '🪄 Zum Auslösen (alle 8 s): Eine große Fläche um die größte Gruppe brennt 5 s lang (8 Schaden pro Sekunde).', mod: { setze: { feuermeer: 8 } } }],
    ],
  },
  eis: {
    ico: '🧊', name: 'Eisturm', art: 'eis', ab: 3, preis: 40,
    text: 'Wenig Schaden, bremst aber den Gegner auf halbes Tempo. Holt 🦇 Flieger kurz zu Boden – dann treffen sie auch Katapult und Torwache.',
    basis: { dmg: 3, reich: 4, takt: 0.9, bremse: 1.8, bremsFaktor: 0.5 },   // 2026-11-13 Spieltest „nutzlos“: vorher dmg 2, reich 3,6, takt 1,0, bremse 1,6
    wege: [
      [{ ico: '🥶', name: 'Klirrende Kälte', text: 'Gebremste Gegner laufen nur noch 30 % Tempo.', mod: { setze: { bremsFaktor: 0.3 } } },
        { ico: '⏳', name: 'Langer Frost', text: 'Die Bremse hält doppelt so lange.', mod: { mal: { bremse: 2 } } }],
      [{ ico: '❄️', name: 'Eisfeld', text: 'Bremst auch alle Gegner rund um das Ziel.', mod: { setze: { eisfeld: 1.0 } } },
        { ico: '🔪', name: 'Eissplitter', text: 'Dreifacher Schaden.', mod: { mal: { dmg: 3 } } }],
      [{ ico: '🧊', name: 'Einfrieren', text: 'Jeder 3. Schuss friert den Gegner 1,2 s ein.', mod: { setze: { frierJedes: 3 } } },
        { ico: '👁️', name: 'Weitblick', text: 'Reichweite +1,2, schießt schneller.', mod: { plus: { reich: 1.2 }, mal: { takt: 0.8 } } }],
      [{ ico: '❄️', name: 'Frostnova', text: 'Jeder 4. Schuss friert alle Gegner rund um das Ziel 1 s ein.', mod: { setze: { nova: 4 } } },
        { ico: '💔', name: 'Sprödes Eis', text: 'Wen der Eisturm trifft, der nimmt 3 s lang 30 % mehr Schaden – von allem.', mod: { setze: { sproede: 0.3 } } }],
      [{ ico: '🌨️', name: 'Schneesturm', text: 'Schießt auf 3 Gegner gleichzeitig.', mod: { setze: { eisziele: 3 } } },
        { ico: '🧊', name: 'Eisgefängnis', text: '🪄 Zum Auslösen (alle 6 s): Der stärkste Gegner in Reichweite friert 2,5 s ein.', mod: { setze: { gefaengnis: 6 } } }],
    ],
  },
  // 🧪 Giftturm (Nutzerwunsch 2026-11-15: Konter gegen den Drachen statt ihn schwächer zu machen): Gift stapelt sich und
  // ignoriert Rüstung – stark gegen einzelne zähe Gegner, schwach gegen Schwärme (die sterben, bevor sich Gift stapelt).
  // Kommt zwei Nächte vor dem ersten Drachen (Nacht 10). Werte: gift = Schaden je Schicht und Sekunde (nacht.js giftSchritt)
  gift: {
    ico: '🧪', name: 'Giftturm', art: 'gift', ab: 8, preis: 60,
    text: 'Vergiftet ein Ziel. Gift stapelt sich (bis 5 Schichten), ignoriert Rüstung und frisst je Schicht einen Teil der Leben – stark gegen Bosse, schwach gegen Schwärme.',
    basis: { dmg: 1, reich: 3.8, takt: 0.9, gift: 1.6, giftProz: 0.003, giftMax: 5, giftDauer: 4 },   // giftProz: je Schicht 0,3 % der max. Leben pro s – wächst mit dem Boss mit, bei Ratten fast nichts
    wege: [
      [{ ico: '☠️', name: 'Starkes Gift', text: 'Jede Schicht macht 50 % mehr Schaden.', mod: { mal: { gift: 1.5, giftProz: 1.5 } } },
        { ico: '💨', name: 'Schnelle Pfeile', text: 'Schießt ein Drittel schneller.', mod: { mal: { takt: 0.67 } } }],
      [{ ico: '🧫', name: 'Tiefe Wunden', text: 'Bis zu 8 Schichten statt 5.', mod: { plus: { giftMax: 3 } } },
        { ico: '👁️', name: 'Weitblick', text: 'Reichweite +1.', mod: { plus: { reich: 1 } } }],
      [{ ico: '🎯', name: 'Bossgift', text: 'Zielt auf den Gegner mit den meisten Leben, jeder Treffer legt 2 Schichten.', mod: { setze: { bossgift: true } } },
        { ico: '🦠', name: 'Seuche', text: 'Stirbt ein Vergifteter, springen seine Schichten auf den nächsten Gegner.', mod: { setze: { seuche: true } } }],
      [{ ico: '🫠', name: 'Ätzend', text: 'Vergiftete nehmen 20 % mehr Schaden – von allem.', mod: { setze: { aetzend: 0.2 } } },
        { ico: '🐌', name: 'Lähmgift', text: 'Gegner mit 5 oder mehr Schichten laufen 30 % langsamer.', mod: { setze: { laehm: 0.3 } } }],
      [{ ico: '☁️', name: 'Giftwolke', text: 'Jeder Treffer legt auch allen Gegnern im Umkreis von 1 Feld eine Schicht.', mod: { setze: { giftwolke: 1 } } },
        { ico: '💀', name: 'Todesgift', text: 'Ab 8 Schichten macht das Gift 50 % mehr Schaden.', mod: { setze: { todesgift: true } } }],
    ],
  },
  blitz: {
    ico: '🌩️', name: 'Blitzturm', art: 'blitz', ab: 6, preis: 80,
    text: 'Der Blitz springt auf mehrere Gegner nacheinander über. Holt 🦇 Flieger kurz herunter.',
    basis: { dmg: 6, reich: 3.8, takt: 1.3, kette: 3 },
    wege: [
      [{ ico: '🔗', name: 'Lange Kette', text: 'Springt auf 2 Gegner mehr.', mod: { plus: { kette: 2 } } },
        { ico: '⚡', name: 'Hochspannung', text: '+50 % Schaden.', mod: { mal: { dmg: 1.5 } } }],
      [{ ico: '💫', name: 'Schock', text: 'Jeder Getroffene steht 0,3 s still.', mod: { setze: { stun: 0.3 } } },
        { ico: '🔋', name: 'Schnell geladen', text: 'Schießt ein Drittel schneller.', mod: { mal: { takt: 0.65 } } }],
      [{ ico: '⛈️', name: 'Gewitter', text: 'Springt auf 3 Gegner mehr, +20 % Schaden.', mod: { plus: { kette: 3 }, mal: { dmg: 1.2 } } },
        { ico: '☄️', name: 'Überladung', text: 'Das erste Ziel bekommt dreifachen Schaden.', mod: { setze: { ersterDoppelt: true } } }],
      [{ ico: '🔋', name: 'Riesenblitz', text: 'Jeder 5. Schuss ist ein Riesenblitz: dreifacher Schaden, springt auf 3 Gegner mehr.', mod: { setze: { riesenblitz: 5 } } },
        { ico: '🧲', name: 'Magnetfeld', text: 'Getroffene Gegner laufen 1,5 s lang nur halb so schnell.', mod: { setze: { magnet: 1.5 } } }],
      [{ ico: '🌩️', name: 'Gewittersturm', text: '🪄 Zum Auslösen (alle 8 s): Blitze schlagen in die 5 Gegner, die dem Tor am nächsten sind (dreifacher Schaden).', mod: { setze: { sturm: 8 } } },
        { ico: '♾️', name: 'Endloskette', text: 'Die Kette springt doppelt so weit und auf doppelt so viele Gegner.', mod: { setze: { endlos: true } } }],
    ],
  },
};
// 🌪️ Sturmturm: nur mit dem ✦ Wunder „Sturmturm“ im Talentnetz (talent = mod-Schlüssel). Pustet Monster auf dem Weg zurück;
// jedes Monster höchstens stoesse-mal (sonst stünde die Welle ewig), Bosse und Anführer gar nicht (nacht.js schiesse).
TUERME.wind = {
  ico: '🌪️', name: 'Sturmturm', art: 'wind', ab: 1, preis: 70, talent: 'turm_wind',
  text: 'Pustet Monster auf dem Weg ein Stück zurück – sie müssen die Kurven noch einmal laufen. Wenig Schaden, jedes Monster höchstens 3-mal.',
  basis: { dmg: 3, reich: 3.4, takt: 2.4, flaeche: 1.0, rueckstoss: 0.9, stoesse: 3 },
  wege: [
    [{ ico: '🌬️', name: 'Starker Wind', text: 'Pustet ein halbes Feld weiter zurück.', mod: { plus: { rueckstoss: 0.5 } } },
      { ico: '⚙️', name: 'Schnelle Flügel', text: 'Pustet ein Drittel öfter.', mod: { mal: { takt: 0.7 } } }],
    [{ ico: '🌀', name: 'Breite Böe', text: 'Trifft eine größere Fläche.', mod: { plus: { flaeche: 0.6 } } },
      { ico: '🔭', name: 'Hoher Mast', text: 'Reichweite +1,2.', mod: { plus: { reich: 1.2 } } }],
    [{ ico: '🍂', name: 'Laubsturm', text: 'Zweieinhalbfacher Schaden.', mod: { mal: { dmg: 2.5 } } },
      { ico: '🥶', name: 'Kalter Wind', text: 'Gepustete Monster laufen 1,5 s lang langsamer.', mod: { setze: { bremse: 1.5, bremsFaktor: 0.6 } } }],
    [{ ico: '💫', name: 'Schwindel', text: 'Gepustete Monster stehen danach 0,6 s still.', mod: { setze: { stun: 0.6 } } },
      { ico: '🪢', name: 'Ausdauer', text: 'Jedes Monster kann 2-mal öfter zurückgepustet werden.', mod: { plus: { stoesse: 2 } } }],
    [{ ico: '🌪️', name: 'Tornado', text: '🪄 Zum Auslösen (alle 12 s): Ein Tornado wirft alle Monster um die größte Gruppe 2,5 Felder zurück – auch Anführer (halb so weit).', mod: { setze: { tornado: 12 } } },
      { ico: '🌬️', name: 'Sturmfront', text: 'Jede Böe trifft alle Monster in Reichweite.', mod: { setze: { front: true } } }],
  ],
};
// Turmart heute baubar? (Nacht erreicht und – beim Sturmturm – das Wunder gelernt)
const turmOffen = (id) => TUERME[id].ab <= P.nacht && (!TUERME[id].talent || talentHat(TUERME[id].talent) || schatzSumme(TUERME[id].talent) > 0);
const MAX_STUFE = 6;   // Stufe 1 + fünf Ausbauten mit Wahl (5 und 6 = Meisterstufen mit Fähigkeiten)
const turmStufe = (tw) => tw.wahl.length + 1;
// Die Meisterstufen sind teuer: Gold-Senke fürs späte Spiel
const ausbauPreis = (art, stufe) => Math.round(TUERME[art].preis * (stufe < 4 ? 0.8 + 0.6 * (stufe - 1) : stufe === 4 ? 6 : 10) * turmRabatt());
// 🎖️ Veteranen (2026-11-13, Spieltest: ab Nacht ~35 lagen 1300–1900 🪙 ungenutzt): ein voll ausgebauter Turm (Stufe 6)
// kann noch VETERAN_MAX Veteranen-Abzeichen bekommen – je +VETERAN_DMG Schaden und +VETERAN_REICH Reichweite.
// Jedes kostet mehr (Gold-Senke fürs späte Spiel); gekauft im Turmblatt mit Karte + Knopf (karte.js).
const VETERAN_MAX = 10, VETERAN_DMG = 0.12, VETERAN_REICH = 0.1;
const veteranPreis = (art, v) => Math.round(TUERME[art].preis * 14 * 1.35 ** v * turmRabatt());
// Werte eines Turms aus Basis und den gewählten Ausbauten (vet = Zahl der Veteranen-Abzeichen)
function turmWerteAus(art, wahl, vet = 0) {
  const t = TUERME[art], s = { ...t.basis };
  wahl.forEach((w, i) => {
    const m = t.wege[i][w === 'a' ? 0 : 1].mod;
    for (const [k, v] of Object.entries(m.mal || {})) s[k] *= v;
    for (const [k, v] of Object.entries(m.plus || {})) s[k] = (s[k] || 0) + v;
    Object.assign(s, m.setze || {});
  });
  if (vet) { s.dmg *= 1 + VETERAN_DMG * vet; s.reich += VETERAN_REICH * vet; }
  return s;
}
// Der Held auf der Mauer greift schwach an; stärker wird er über den Talentbaum.
const BURGSCHUETZE = { dmg: 3, reich: 9, takt: 0.9, art: 'magie' };   // Grundangriff des Helden (Reichweite 9: vom Torturm aus erreicht er gut zwei Drittel des Wegs)
// 🧙 Der Held wächst mit dem Level: Grundangriff und Zauber +HELD_JE_LEVEL je Level (nacht.js nachtAufstellen).
// Spieltest 2026-11-10: spät machten Held und Zauber nur 3–5 % des Schadens – Talente allein wachsen nicht mit den Monstern mit.
let HELD_JE_LEVEL = 0.06;

// Gegner als Steckbrief (Objektkarte mit Attributen). res = Resistenz in Prozent je Schadensart.
// quer: true = kleine Flinke laufen querfeldein aufs Tor zu (querWeg in nacht.js), fliegt: true = Luftlinie (flugWeg);
// alle anderen folgen dem Weg (Nutzer 2026-11-13: „klumpen nicht so auf dem Weg“ – sonst erledigt das Katapult alles).
// teilt: beim Tod entstehen zwei Gegner dieser Art · gross: Bildgröße (Anteil eines Feldes)
const GEGNER = {
  ratte: { ico: '🐀', name: 'Ratte', hp: 4, tempo: 1.9, schaden: 1, ruestung: 0, res: {}, gross: 0.45, quer: true, tip: 'kommt in Scharen, fällt beim ersten Treffer' },
  schleim: { ico: '🟢', name: 'Schleim', hp: 16, tempo: 0.9, schaden: 2, ruestung: 0, res: {}, teilt: 'minischleim', gross: 0.6, tip: 'teilt sich in zwei kleine Schleime, wenn er besiegt ist' },
  minischleim: { ico: '🟢', name: 'Minischleim', hp: 5, tempo: 1.3, schaden: 1, ruestung: 0, res: {}, gross: 0.38, tip: 'klein und flink' },
  wolf: { ico: '🐺', name: 'Wolf', hp: 10, tempo: 1.5, schaden: 2, ruestung: 0, res: {}, tip: 'schnell, aber schwach' },
  ork: { ico: '👹', name: 'Ork', hp: 26, tempo: 0.95, schaden: 2, ruestung: 2, res: {}, tip: 'Rüstung: Pfeile machen 2 weniger Schaden' },
  geist: { ico: '👻', name: 'Geist', hp: 18, tempo: 1.2, schaden: 2, ruestung: 0, res: { pfeil: 50 }, tip: 'Pfeile gehen halb durch ihn hindurch' },
  troll: { ico: '🧌', name: 'Troll', hp: 80, tempo: 0.65, schaden: 5, ruestung: 1, res: { eis: 50 }, weg: true, tip: 'zäh, Eis wirkt nur halb' },
  // ab Nacht 11 (Endlos): gegen Flächenschaden gebaut – Katapult und Blitz sollen nicht mehr alles allein erledigen
  fuchs: { ico: '🦊', name: 'Fuchs', hp: 12, tempo: 2.3, schaden: 2, ruestung: 0, res: {}, flink: true, abstand: 1.3, quer: true, tip: 'sehr schnell, läuft weit verteilt, Betäuben hält nur halb' },
  felsling: { ico: '🪨', name: 'Felsling', hp: 34, tempo: 0.8, schaden: 3, ruestung: 0, res: { stein: 60, blitz: 50 }, gross: 0.72, tip: 'aus Stein: Katapult und Blitz wirken kaum' },
  // 🦇 Flieger (2026-11-13, Nutzerwunsch: „Katapulte zu OP“): fliegen geradewegs zum Tor, Katapult, Erdbeben, Boden-Feuer
  // und Torwache erreichen sie nur, solange sie betäubt/eingefroren am Boden liegen (amBoden in nacht.js)
  fledermaus: { ico: '🦇', name: 'Fledermaus', hp: 8, tempo: 1.25, schaden: 1, ruestung: 0, res: {}, gross: 0.6, fliegt: true, tip: 'fliegt geradewegs zur Burg – Pfeil, Kanone, Blitz und Held treffen sie, Eis holt sie zu Boden, das Katapult trifft sie nur dort' },
  greif: { ico: '🦅', name: 'Greif', hp: 30, tempo: 0.85, schaden: 3, ruestung: 1, res: {}, gross: 0.8, fliegt: true, tip: 'großer Flieger mit Federpanzer – Pfeil, Kanone, Blitz und Held treffen ihn, Eis holt ihn zu Boden, das Katapult trifft ihn nur dort' },
  drache: { ico: '🐉', name: 'Drache', hp: 180, tempo: 0.55, schaden: 12, ruestung: 3, res: { feuer: 60 }, boss: true, weg: true, tip: 'Boss: Feuer prallt ab, Rüstung 3, lässt sich kaum betäuben' },
};

// 👑 Anführer: am Ende der 2. Welle kommt ein großer, starker Gegner seiner Art (e.chef in nacht.js)
const CHEF = {
  ratte: 'Rattenkönig', schleim: 'Schleimkönig', wolf: 'Leitwolf', ork: 'Orkhäuptling', geist: 'Geisterfürst', troll: 'Trollkönig',
};
// Leben des Anführers (vor WELLEN_LEBEN). Gedeckelt für zähe Arten: der Troll-Anführer hatte ×5 = 2,8-mal so viel wie der Ork
// und machte jede dritte Endlosnacht (17, 20, 23 …) zur Wand.
const CHEF_LEBEN = (g) => Math.min(GEGNER[g].hp * 5, 180) + 20;
const CHEF_XP = 6;                                  // so viel mal die XP seiner Art

// Feste Wellen: je Nacht 2 Wellen, jede eine Liste von Gruppen {p: Portal, g: Gegner, n: Anzahl, ab: Abstand in s, t: Start in s}.
// Viele schwache Gegner statt weniger starker. Nach Welle 1 ist Verschnaufpause (Level-up, Talente, bauen),
// Welle 2 endet mit einem 👑 Anführer (oder dem Drachen).
// Stellschrauben für alle Nächte (abgestimmt mit js/balance.js): mehr Gegner, mehr Leben
const WELLEN_MENGE = 1.5, WELLEN_LEBEN = 1.75;   // 1.75 seit dem langen S-Weg (vorher 1.25): Türme haben dort mehr Zeit
const G = (p, g, n, ab, t = 0.5) => ({ p, g, n: Math.round(n * WELLEN_MENGE), ab: ab / WELLEN_MENGE, t, mehr: WELLEN_LEBEN });
const welleDauer = (w) => Math.max(...w.map((g) => g.t + (g.n - 1) * g.ab));
// Aus 3 geplanten Teilen werden 2 Wellen: Teil 1 + 2 hintereinander, dann Teil 3 mit dem Anführer am Schluss
function zweiWellen([a, b, c], chef) {
  const versatz = welleDauer(a) + 2;
  const zweite = c.concat(chef ? [{ p: c[0].p, g: chef, n: 1, ab: 1, t: welleDauer(c) + 1.5, mehr: c[0].mehr, chef: true }] : []);
  return [a.concat(b.map((g) => ({ ...g, t: g.t + versatz }))), zweite];
}
const NAECHTE_PLAN = [
  null,
  [[G('west', 'ratte', 6, 0.8)], [G('west', 'wolf', 4, 1.3)], [G('west', 'ratte', 10, 0.5), G('west', 'wolf', 3, 1.2, 3)]],
  [[G('west', 'ratte', 8, 0.6)], [G('west', 'wolf', 6, 1)], [G('west', 'schleim', 4, 1.5), G('west', 'ratte', 8, 0.5, 2)]],
  [[G('west', 'wolf', 6, 0.9)], [G('west', 'ork', 3, 2), G('west', 'ratte', 10, 0.4, 1)], [G('west', 'schleim', 5, 1.2), G('west', 'wolf', 6, 0.8, 3)]],
  [[G('west', 'ratte', 10, 0.4), G('west', 'wolf', 4, 1, 2)], [G('west', 'ork', 4, 1.6), G('west', 'schleim', 4, 1.4, 2)], [G('west', 'ork', 6, 1.2), G('west', 'wolf', 10, 0.6, 4), G('west', 'fledermaus', 6, 0.9, 6)]],
  [[G('west', 'wolf', 8, 0.8), G('sued', 'ratte', 8, 0.5)], [G('sued', 'ork', 5, 1.4), G('west', 'schleim', 5, 1.2)], [G('sued', 'troll', 1, 1), G('west', 'wolf', 12, 0.5, 1)]],
  [[G('west', 'geist', 8, 1)], [G('sued', 'ork', 6, 1.2), G('west', 'schleim', 6, 1), G('sued', 'fledermaus', 8, 0.7, 3)], [G('sued', 'troll', 2, 5), G('west', 'ratte', 12, 0.4), G('sued', 'geist', 6, 1, 3)]],
  [[G('west', 'wolf', 12, 0.6), G('sued', 'greif', 2, 3, 3)], [G('sued', 'troll', 2, 5), G('west', 'schleim', 8, 0.9)], [G('sued', 'troll', 3, 4), G('west', 'wolf', 14, 0.5, 2)]],
  [[G('west', 'ork', 10, 1), G('west', 'fledermaus', 8, 0.6, 4)], [G('sued', 'geist', 8, 0.9), G('west', 'greif', 3, 2.5, 2), G('west', 'schleim', 8, 0.9)], [G('west', 'ork', 10, 0.9), G('sued', 'geist', 10, 0.8, 2)]],
  [[G('sued', 'troll', 3, 4)], [G('west', 'schleim', 12, 0.7), G('sued', 'wolf', 8, 0.6)], [G('west', 'troll', 2, 4), G('sued', 'troll', 2, 4), G('west', 'wolf', 16, 0.4, 4)]],
  [[G('west', 'ork', 10, 0.9), G('sued', 'ratte', 10, 0.4)], [G('west', 'geist', 8, 0.9), G('sued', 'schleim', 8, 0.9), G('west', 'greif', 3, 2.5, 3)], [G('sued', 'drache', 1, 1), G('west', 'ork', 8, 1.2, 2)]],
];
// Anführer je Nacht (Nacht 10 hat schon den Drachen)
const NACHT_CHEF = [null, 'ratte', 'schleim', 'wolf', 'ork', 'ork', 'geist', 'wolf', 'ork', 'troll', null];
// Die ersten Nächte sanfter (Spieltest 2026-11-09: der erste Leitwolf in Nacht 3 kam fast immer bis zum Tor,
// auch der gute Bot verlor Nacht 3, der schwache Nacht 4 und 5) – gilt auch für den Anführer
// (2026-11-09 nach dem Verlegen der Startplätze in die Kurven wieder etwas angehoben – vorher 0,7 / 0,75 / 0,8 / 0,85 / 0,92)
// 2026-11-09 echter Durchlauf: ab Nacht 3 kam nie etwas bis zur Mauer → Nacht 3–6 etwas, 7–10 deutlich mehr Leben
// 2026-11-10: Nacht 6→7 war eine Klippe (×1,1 → ×1,6, Bot mittel und schwach verloren Nacht 7) – jetzt in Stufen
// 2026-11-12 Durchläufe: Mauer nie getroffen. Statt die Kurve für alle anzuheben (traf vor allem die Schwachen), wächst der
// ⭐ Ruhm jetzt schneller, wenn Mauer bzw. Wache keinen Schaden nehmen (RUHM_MAUER/RUHM_WACHE) – Nutzeridee: gute Spieler machen es sich selbst schwer
const FRUEH_LEBEN = [1, 0.8, 0.85, 0.94, 0.94, 1.05, 1.05, 1.3, 1.45, 1.55, 1.6];
const ENDLOS_LEBEN_AB = FRUEH_LEBEN[10];   // Endlosnächte setzen dort an, wo Nacht 10 aufhört (vorher war Nacht 11 leichter als Nacht 10)
const NAECHTE = NAECHTE_PLAN.map((w, n) => w && zweiWellen(w.map((teil) => teil.map((g) => ({ ...g, mehr: g.mehr * (FRUEH_LEBEN[n] ?? 1) }))), NACHT_CHEF[n]));
const KAMPAGNE = NAECHTE.length - 1;
// Ab dann: Endlosmodus mit fester Formel (kein Zufall), ebenfalls 2 Wellen; alle 4 Nächte der Drache, sonst ein Anführer
// Leben je Nacht nach der Kampagne: erst sanft (linear), dann immer schneller (quadratisch) – abgestimmt mit js/balance.js.
// Spät so hoch, weil Held und Meistertürme Flächenschaden machen, der mit der Zahl der Gegner wächst.
// 2026-11-08 Spieltest: Nacht 11–20 war mit voll ausgebauten Türmen zu leicht (alles starb im ersten Viertel des Wegs).
// Darum wächst es jetzt früh schneller (linear 0,18 statt 0,10, quadratisch 0,035 statt 0,04) – dazu der Turmschild.
// 2026-11-10 freie Türme: mehr Türme an besseren Plätzen → quadratisch 0,1 statt 0,035 (Bot 60 Tage: gut 56, mittel 47, schwach 34).
// 2026-11-12: stetig ab dem Niveau von Nacht 10 (ENDLOS_LEBEN_AB) mit 0,10/0,025 – vorher 0,18/0,1 ab Niveau 1 (Nacht 11 leichter als 10, Nacht 17 eine Wand)
let ENDLOS_LEBEN = 0.1, ENDLOS_QUAD = 0.032;   // 2026-11-13: 0,025 → 0,032 (nach Eis-Stärkung und müdem Drachen war Endlos für den Bot leichter)
// Monster je Gruppe in Endlosnächten: Start + Zuwachs je Nacht. Spieltest 2026-11-13: nach Nacht 10 (73 Monster) kamen in
// Nacht 11 nur 27 – jetzt höherer Start, flacherer Zuwachs (spät etwa gleich viele wie vorher; vorher [6, 0.9]).
let ENDLOS_ANZAHL = [13, 0.7];
const FUCHS_MAX = 12;   // 🦊 höchstens so viele Füchse je Gruppe (Rest kommt als Wölfe)
// 🛡️ Turmschild (Endlosnächte ab Nacht 12, Nutzerwunsch „mehr Arbeit für den Helden“): Anführer und jedes n-te Monster
// tragen einen Schild – Türme machen nur diesen Anteil Schaden, Held, Zauber und Talente vollen.
// (Mit 0,5 auch auf allen großen Monstern war Nacht 17 für den Bot eine Wand.)
let TURMSCHILD = 0.65;
const turmschildJedes = (k) => Math.max(3, 7 - Math.floor(k / 4));
function wellenFuer(n) {
  if (n <= KAMPAGNE) return NAECHTE[n];
  const k = n - KAMPAGNE, offen = PORTALE.filter((p) => p.ab <= n).map((p) => p.id), mehr = WELLEN_LEBEN * ENDLOS_LEBEN_AB * (1 + ENDLOS_LEBEN * k + ENDLOS_QUAD * k * k);
  const arten = ['wolf', 'fledermaus', 'schleim', 'fuchs', 'greif', 'ork', 'geist', 'felsling', 'ratte', 'troll'];
  // Wachstum abgestimmt mit js/balance.js (Gold und Talente über ~50 Tage)
  // Ratten doppelt so viele, Trolle (80 Leben) nur ein Drittel – sonst waren Troll-Nächte (17, 23 …) eine Wand
  const anzahl = (g, w) => Math.max(2, Math.round((ENDLOS_ANZAHL[0] + ENDLOS_ANZAHL[1] * k) * (w === 2 ? 1.5 : 1) * (g === 'ratte' ? 2 : g === 'troll' ? 1 / 3 : g === 'felsling' ? 0.6 : g === 'greif' ? 0.5 : g === 'fledermaus' ? 1.3 : 1)));
  // Abstand zwischen zwei Monstern einer Gruppe; Füchse kommen einzeln mit großem Abstand (Flächenschaden trifft dann nur einen)
  const abstand = (g) => Math.max(0.4, 1.1 - 0.03 * k) * (GEGNER[g].abstand || 1);
  // 🦊 Spieltest 2026-11-13: Nächte mit 25–48 Füchsen waren eine Wand. Füchse jetzt höchstens FUCHS_MAX je Gruppe,
  // der Rest der Gruppe kommt als Wölfe (laufen auf dem Weg) – gemischt statt nur Füchse.
  const gruppe = (p, i, w) => {
    const g = arten[(k + i + w * 2) % arten.length], n = anzahl(g, w), t = 0.5 + 1.5 * i;
    if (g !== 'fuchs') return [{ p, g, n, ab: abstand(g), t, mehr }];
    const f = Math.min(FUCHS_MAX, Math.round(n * 0.5));
    return [{ p, g, n: f, ab: abstand(g), t, mehr }, { p, g: 'wolf', n: Math.max(2, Math.round((n - f) * 0.8)), ab: abstand('wolf'), t: t + 1, mehr }];
  };
  const teile = [0, 1, 2].map((w) => offen.flatMap((p, i) => gruppe(p, i, w))
    .concat(w === 2 && k % 4 === 0 ? [{ p: offen[0], g: 'drache', n: 1, ab: 1, t: 3, mehr }] : []));
  return zweiWellen(teile, k % 4 === 0 ? null : ['ork', 'troll', 'geist'][k % 3]);
}
// 🛡️ Torwache: Soldaten vor dem Tor halten Gegner fest. Stufe 0 gibt es von Anfang an.
const WACHE = [
  { n: 2, hp: 14, dmg: 3 }, { n: 3, hp: 20, dmg: 4 }, { n: 3, hp: 30, dmg: 6 }, { n: 4, hp: 38, dmg: 8 }, { n: 4, hp: 50, dmg: 11 },
];
const WACHE_PREIS = [70, 140, 250, 400];   // 2026-11-15 günstiger (vorher 90, 180, 320, 500)
const WACHE_POSTEN = [[12.35, 4.6], [12.35, 5.4], [11.7, 5.0], [13.0, 5.0]];   // eng am Weg vor dem Tor (die Bauplätze liegen daneben)
const WACHE_WIEDER = 8;   // Sekunden bis ein gefallener Soldat wieder aufsteht
// Mauer in der Pause reparieren
const REPARATUR_PLUS = 4;
const reparaturPreis = (n) => 10 + 2 * n;

// --- Spielstand ------------------------------------------------------------------
function neuerStand() {
  return {
    v: 1,
    tag: 1,          // der wievielte Tag
    nacht: 1,        // die nächste Nacht (wächst nur nach einem Sieg)
    gold: 30,        // reicht für den ersten Turm, auch wenn der erste Hof noch nicht klappt (Spieltest: sonst ist Nacht 1 verloren)
    plaetze: 0,      // gekaufte Feldplätze
    slotVer: 4,      // 4 = freie Türme mit x/y (ältere Stände werden in laden() umgestellt)
    mauer: 0,        // Ausbaustufe der Mauer
    wache: 0,        // Ausbaustufe der Torwache (WACHE)
    niederlagen: 0,  // verlorene Versuche der aktuellen Nacht
    roboter: {},     // Hof-Id → { seit: Tag } (dort arbeitet ein Roboter)
    roboFrei: 0,     // gekaufte, gerade nicht aufgestellte Roboter
    roboBericht: null, // Ergebnis der Morgenarbeit, wird auf der Karte gezeigt
    phase: 'morgen', // morgen | tag | abend | nacht
    hof: null,       // gewählter bzw. heutiger Hof
    hoefe: {},       // id → {fertig, kurz, sparsam, versuche, tipps, zuletzt}
    code: {},        // id → Quelltext
    tuerme: {},      // Slot-Index → {art, wahl: ['a', 'b' …]} (gewählte Ausbauten)
    gesehen: {},     // Lernkarten, Hinweise
    rekord: 0,       // höchste gehaltene Nacht
    xp: 0,           // XP des Helden (aus den Nächten)
    talente: ['mitte'], // gelernte Talente (Knoten-Ids); talentVer setzt main.js (Umstellung alter Stände)
    pruefungen: {},  // id → true (bestanden)
    spez: null,      // gewählte Spezialisierung (chaos, licht, natur, zeit)
    spezTal: [],     // gelernte Knoten der Spezialisierung
    kombos: [],      // entdeckte Kombos (📖 Kombo-Buch)
    steine: {},      // 💎 Zaubersteine: Richtung → true (steine.js)
    doppelt: {},     // Richtung → true: schon doppelt gefunden (= Stützsockel bekommen, nicht mehr im Pool)
    sockel: [],      // Richtung je Sockel (null = leer)
    stab: 0,         // 🪄 Zauberstab (Index in STAEBE) – bestimmt die Zahl der Sockel
    stuetzSockel: {}, // Richtung → Zahl der 🔮 Stützsockel dieses Steins
    stuetzen: {},    // Richtung → eingesetzte Stützsteine
    stuetzVorrat: [], // gefundene Stützsteine (jeden gibt es einmal)
    stuetzGekauft: 0, // gekaufte Stützsockel (jeder weitere ist teurer)
    beute: 1,        // Beutezähler: ab 1 fällt ein Stein (der erste Anführer bringt sicher einen)
  };
}
let P = neuerStand();

// 🏰 Burgen (PLAN.md 7b): je Klassenstufe ein eigener Spielstand. Burg 7 behält den alten Schlüssel (alte Stände = Burg 7).
// PROFIL gilt für alle Burgen: gewählte Burg, entdeckte Kombos, gewähltes Erbe je Burg.
const burgSchluessel = (b) => (b === 7 ? SAVE_KEY : `${LK ? 'atc_lk_' : 'atc_'}burg${b}`);
const PROFIL_KEY = LK ? 'atc_lk_profil' : 'atc_profil';
let PROFIL = { burg: null, kombos: [], erbe: {} };
let BURGNR = 7;
const lkBurg = (b) => BURGEN[b]?.klasse === 'LK';
const burgSichtbar = (b) => !!BURGEN[b] && (LK || !lkBurg(b));   // Sek I sieht keine LK-Burgen
const ersteLkBurg = () => +Object.keys(BURGEN).find(lkBurg) || 7;
function profilLaden() {
  try { Object.assign(PROFIL, JSON.parse(localStorage.getItem(PROFIL_KEY)) || {}); } catch { /* kein Profil */ }
  // Erster Start: im LK die erste LK-Burg; sonst schlägt ?klasse=8 die Burg vor; wer schon einen alten Stand hat, ist in Burg 7
  if (!PROFIL.burg) {
    const k = +new URLSearchParams(location.search).get('klasse');
    PROFIL.burg = LK ? ersteLkBurg() : BURGEN[k] && !localStorage.getItem(SAVE_KEY) ? k : 7;
  }
  // 🔒 Burgen außer 7 brauchen einen Code der Lehrkraft (Nutzerwunsch: alle bleiben grob im Rahmen der Klasse).
  // Gewünscht, aber gesperrt (z. B. ?klasse=8): erst Burg 7, main.js zeigt gleich die Burgwahl mit Code-Feld
  BURGNR = burgSichtbar(PROFIL.burg) && burgFrei(PROFIL.burg) ? PROFIL.burg : 7;
}
// Frei: Burg 7, mit Code freigeschaltet oder schon gespielt (alte Stände behalten ihre Burgen).
// Im LK zusätzlich die erste LK-Burg und alle Burgen der Sek I (freiwillige Auffrischung, ohne Code).
function burgFrei(b) {
  if (!burgSichtbar(b)) return false;
  if (+b === 7 || (PROFIL.burgFrei || []).includes(+b)) return true;
  // Leistungskurs: keine Trennung nach Klasse 11/12 – jede LK-Burg kann man anfangen, wann man will (Nutzer 2026-11-12);
  // B-Codes funktionieren weiter, schalten im LK aber nichts mehr extra frei
  if (LK) return true;
  try { return !!localStorage.getItem(burgSchluessel(+b)); } catch { return false; }
}
function profilSpeichern() {
  try { localStorage.setItem(PROFIL_KEY, JSON.stringify(PROFIL)); } catch { /* privat */ }
}
// Stand einer anderen Burg lesen (für die Burgwahl), ohne ihn zu laden
function burgStand(b) {
  try { return JSON.parse(localStorage.getItem(burgSchluessel(b))); } catch { return null; }
}
// In eine andere Burg wechseln: speichern und neu laden (alle Ansichten starten frisch)
function burgWechseln(b) {
  speichern();
  PROFIL.burg = b;
  profilSpeichern();
  location.reload();
}

// ♾️ Endlos-Modus (für den Lehrer, Nutzerwunsch 2026-11-10): direkt in die Endlosnächte, ohne Programmieren, eigener Spielstand.
// Start mit endlos.bat bzw. ?endlos in der Adresse → Passwort (hier steht nur die Prüfsumme). Kein Menüpunkt, damit Schüler ihn nicht finden.
// Passwort ändern: neue Prüfsumme mit textPruefsumme('neues wort') in der Konsole ausrechnen und hier eintragen.
const ENDLOS_PRUEF = '10nz7o51gdq';
const ENDLOS_KEY = 'atc_endlos';
// Nutzerwunsch: Held startet bei Level 1, alles wird über das Kopfgeld der Monster finanziert (ENDLOS_GOLD × volles Kopfgeld)
// Bot (40 Nächte ab Nacht 11): ×2 → Nacht 47, 3 verloren, ~100–150 🪙 je Nacht; ×3 → Nacht 49, 1 verloren
const ENDLOS_START = { gold: 300, level: 1 };
let ENDLOS_GOLD = 2;
let ENDLOS = false;
function textPruefsumme(text, seed = 7) {   // cyrb53 – kein echter Schutz, nur damit das Wort nicht im Klartext im Code steht
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < text.length; i++) { const ch = text.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
const spielSchluessel = () => (ENDLOS ? ENDLOS_KEY : burgSchluessel(BURGNR));
// Neuer Endlos-Stand: erste Nacht nach der Kampagne, Gold und Held-Level wie am Ende der Kampagne, gleich der Abend
function endlosStand() {
  const s = neuerStand();
  let xp = 0;
  for (let l = 1; l < ENDLOS_START.level; l++) xp += xpFuerLevel(l);
  Object.assign(s, { nacht: KAMPAGNE + 1, gold: ENDLOS_START.gold, xp, phase: 'abend', gesehen: { willkommen: true } });
  return s;
}

function laden() {
  profilLaden();
  if (ENDLOS) P = endlosStand();
  try {
    const s = JSON.parse(localStorage.getItem(spielSchluessel()));
    if (s && s.v === 1) P = Object.assign(ENDLOS ? endlosStand() : neuerStand(), s);
    // ältere Türme mit „stufe“: Ausbauten als Weg A übernehmen
    for (const tw of Object.values(P.tuerme)) if (!tw.wahl) { tw.wahl = Array((tw.stufe || 1) - 1).fill('a'); delete tw.stufe; }
    // Stände vor den Mauerplätzen: die am weitesten ausgebauten Türme kommen auf die Mauer,
    // für die übrigen gibt es das ausgegebene Gold zurück
    // (Spieltest 2026-11-13: hier stand „!== 3“ – das lief bei Stand 4 bei JEDEM Laden und behielt nur 4 Türme)
    if ((P.slotVer || 0) < 3) {
      const wert = (tw) => TUERME[tw.art].preis + tw.wahl.reduce((s, _, i) => s + ausbauPreis(tw.art, i + 1), 0);
      const liste = Object.values(P.tuerme).sort((a, b) => wert(b) - wert(a));
      P.tuerme = {};
      liste.forEach((tw, i) => { if (i < 4) P.tuerme[i] = tw; else P.gold += wert(tw); });
      P.plaetze = 0;
      P.slotVer = 3;
    }
    // 🏗️ freie Türme: jeder Turm bekommt die Lage seines alten Platzes, gekaufte Feldplätze gibt es als Gold zurück
    if ((P.slotVer || 0) < 4) {
      for (const [s, tw] of Object.entries(P.tuerme)) if (tw.x === undefined) Object.assign(tw, ALTE_PLAETZE[s] || ALTE_PLAETZE[0]);
      P.gold += PLATZ_PREIS.slice(0, P.plaetze || 0).reduce((a, b) => a + b, 0);
      P.plaetze = 0;
      P.slotVer = 4;
    }
    // 🏆 Ruhm ohne Sterne (2026-11-13): übrig bleibt, was über die Sterne hinaus aus den Nächten kam
    if ((P.ruhmVer || 0) < 2) {
      const alt = P.ruhmExtra ?? -(P.ruhmVerlust || 0);
      P.ruhmWert = Math.max(0, Math.round(alt));
      P.ruhmRekord = Math.max(P.ruhmWert, (P.ruhmRekord || 0) - sterneZahl());
      delete P.ruhmExtra; delete P.ruhmVerlust;
      P.ruhmVer = 2;
    }
  } catch { /* kein Spielstand */ }
  // Neue Burg: Höfe, die man schon gelöst hat, als ihre Kapitel noch in der Burg 7 lagen, kommen mit (samt Code).
  // Wer schon eine andere Burg gespielt hat, darf ein 🎁 Erbe wählen (erbeKarte in main.js).
  if (!ENDLOS && !localStorage.getItem(burgSchluessel(BURGNR))) {
    for (const b of Object.keys(BURGEN).map(Number).filter((b) => b !== BURGNR && burgSichtbar(b))) {
      const s = burgStand(b);
      if (!s) continue;
      for (const h of burgHoefe()) {
        if (s.hoefe?.[h.id]) P.hoefe[h.id] = s.hoefe[h.id];
        if (s.code?.[h.id]) P.code[h.id] = s.code[h.id];
      }
      if (s.tag > 1) P.erbeOffen = true;
    }
  }
  // 📖 Kombo-Buch gilt für alle Burgen
  PROFIL.kombos = [...new Set([...PROFIL.kombos, ...P.kombos])];
  P.kombos = [...PROFIL.kombos];
  profilSpeichern();
}
function speichern() {
  P.zuletzt = Date.now();   // 🏰 Startbildschirm: „zuletzt gespielt …“ (geteilte Schulrechner)
  try { localStorage.setItem(spielSchluessel(), JSON.stringify(P)); } catch { /* privat */ }
}
