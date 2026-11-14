'use strict';
// --- 🌙 Die Nacht: Tower Defense mit Portalen, festen Wellen, ohne Zufall ---------------
// Feste Schritte von DT Sekunden: Vorschau (simNacht) und Live-Nacht rechnen genau gleich.

const DT = 0.05;
for (const p of PORTALE) {
  p.len = 0;
  for (let i = 1; i < p.weg.length; i++) p.len += Math.hypot(p.weg[i][0] - p.weg[i - 1][0], p.weg[i][1] - p.weg[i - 1][1]);
}
const portal = (id) => PORTALE.find((p) => p.id === id) || PORTALE[0];   // nur noch ein Portal: alle Wellen kommen dort heraus
const portalOffen = (p, n) => p.ab <= n;

function wegPunkt(p, d) {
  let rest = d;
  for (let i = 1; i < p.weg.length; i++) {
    const [ax, ay] = p.weg[i - 1], [bx, by] = p.weg[i], l = Math.hypot(bx - ax, by - ay);
    if (rest <= l) return { x: ax + (bx - ax) * rest / l, y: ay + (by - ay) * rest / l };
    rest -= l;
  }
  const e = p.weg[p.weg.length - 1];
  return { x: e[0], y: e[1] };
}

const turmWerte = (tw) => tw.w;
const turmArt = (tw) => (tw.burg ? 'magie' : TUERME[tw.art].art);
const HELD = { x: 14.25, y: 5 };   // auf dem Torturm mitten auf der Mauer, das Tor führt unter ihm durch (Nutzerwunsch)

// Zauber des Helden: Grundwerte (Talente verändern sie in zaubere)
const ZAUBER = {
  // Reichweite vom Helden auf der Mauer aus: bis weit über die Feldmitte
  feuerball: { ico: '🔥', name: 'Feuerball', cd: 8, reich: 10 },
  kettenblitz: { ico: '🌩️', name: 'Kettenblitz', cd: 6, reich: 9.5 },
  eiswelle: { ico: '❄️', name: 'Eiswelle', cd: 8, reich: 10 },
};
ZAUBER.schutz = { ico: '🛡️', name: 'Schutzzauber', cd: 14, reich: 99 };
// ✦ Zauber aus Wundern im Talentnetz (brauchen keinen Zauberplatz)
ZAUBER.meteor = { ico: '☄️', name: 'Meteor', cd: 25, reich: 99 };
ZAUBER.riesenglocke = { ico: '🔔', name: 'Riesenglocke', cd: 30, reich: 99 };
// 🏅 Zauber aus den Abzeichen-Schätzen (abzeichen.js, ebenfalls ohne Zauberplatz)
ZAUBER.ruebenregen = { ico: '🥕', name: 'Rübenregen', cd: 18, reich: 99 };
ZAUBER.sternenfall = { ico: '🌠', name: 'Sternenfall', cd: 24, reich: 99 };
const ZAUBER_CD = { feuerball: 'fb_cd', kettenblitz: 'kb_cd', eiswelle: 'fn_cd', schutz: 'sz_cd' };

// 🔗 Kombo ausgelöst: große Schrift über dem Gegner (je Kombo höchstens alle pause s, damit es nicht flimmert).
// In der echten Nacht (N.live) wird sie beim ersten Mal entdeckt und kommt ins 📖 Kombo-Buch.
function kombo(N, id, x, y, pause = 2.5) {
  const k = komboById(id);
  // Dieselbe Kraft kann auch aus einem Talent kommen (Blitzableiter, ✧ Funde) – dann ist es keine Kombo
  if (N.kombosAn && !N.kombosAn.has(id)) return;
  if (N.live && !P.kombos.includes(id)) {
    P.kombos.push(id);
    PROFIL.kombos.push(id);   // gilt für alle Burgen
    profilSpeichern();
    speichern();
    (N.neueKombos ||= []).push(id);   // Hilfskarte, sobald gerade keine andere offen ist (nachtFrame)
    N.fx.push({ typ: 'ansage', t: 2.8, text: `🔗 Neue Kombo: ${k.name}!` });
  }
  N.komboUhr = N.komboUhr || {};
  if ((N.komboUhr[id] ?? -99) > N.t - pause) return;
  N.komboUhr[id] = N.t;
  // Keine Schrift mehr bei jedem Auslösen (Nutzer: „nach Nacht 30 sieht man es nur durch den Text“).
  // Stattdessen lädt jede Kombo die 🔗 Kombo-Leiste; ist sie voll, kommt EIN großer Kombo-Ausbruch.
  if (N.ausbruch) return;   // gerade einer bereit: nicht weiter laden
  (N.komboZahl ||= {})[id] = (N.komboZahl[id] || 0) + 1;
  N.komboLadung = (N.komboLadung || 0) + 1 + (N.T.kombo_laden || 0);   // 🔋 Kombo-Leiste lädt schneller
  if (N.komboLadung >= KOMBO_LADUNG && N.t - (N.ausbruchZeit ?? -99) >= AUSBRUCH_ALLE) ausbruchBereit(N);
}
// 🔗 Kombo-Ausbruch (2026-11-13): selten, aber groß. Die Kombo, die seit dem letzten Ausbruch am häufigsten
// ausgelöst hat, entlädt sich über der größten Gruppe – mit den Kräften aller ihrer Richtungen.
// Live erscheint dort zuerst ein ✨ Funke: antippen = stärker (×1,5); sonst bricht er nach 3 s von selbst los.
// Vorschau und Bot: sofort, ohne Bonus.
const KOMBO_LADUNG = 14, AUSBRUCH_ALLE = 16, FUNKE_DAUER = 4.5, AUSBRUCH_R = 3.2;
const BOSS_TOR_ANTEIL = 0.45;
const ausbruchDmg = (N) => 24 + 6 * N.n;   // Spieltest: 16 + 4n war kaum zu spüren (Funkenregen machte mehr)
function ausbruchBereit(N) {
  const zahl = N.komboZahl || {}, id = Object.keys(zahl).sort((a, b) => zahl[b] - zahl[a])[0];
  N.komboZahl = {}; N.komboLadung = 0;
  const ziel = groessteGruppe(N, AUSBRUCH_R * 0.6);
  if (!id || !ziel) return;
  const x = Math.max(0.8, Math.min(NFELD.w - 1.5, ziel.x)), y = Math.max(0.8, Math.min(NFELD.h - 0.5, ziel.y));
  if (!N.live) { komboAusbruch(N, { id, x, y }, 1); return; }
  const t = FUNKE_DAUER * nachtTempo;   // 3 echte Sekunden, auch bei ⏩ 2× oder 4×
  N.ausbruch = true;
  N.funke = { x, y, t, max: t, id };
  if (!PROFIL.funkeGesehen) { PROFIL.funkeGesehen = true; profilSpeichern(); N.fx.push({ typ: 'ansage', t: 2.6, text: '✨ Kombo-Ausbruch! Antippen = stärker!' }); }
}
function funkeSchritt(N) {
  if (N.funke && (N.funke.t -= DT) <= 0) { const f = N.funke; N.funke = null; komboAusbruch(N, f, 1); }
}
function funkeZuenden(N) { const f = N.funke; N.funke = null; komboAusbruch(N, f, 1.5); }
function komboAusbruch(N, f, mal) {
  const k = komboById(f.id), r = AUSBRUCH_R * (1 + (N.T.zauber_flaeche || 0)), dmg = ausbruchDmg(N) * mal * (1 + (N.T.kombo_kraft || 0));
  N.ausbruch = false; N.ausbruchZeit = N.t;
  for (const o of nahe(N, f.x, f.y, r)) {
    treffe(N, o, dmg, 'magie', 'funke');
    for (const t of k.paar) {
      if (t === 0) brennen(o, 3, 3 + N.n * 0.15);                      // 🔥 brennt
      if (t === 1) { betaeube(o, 1.6, true); o.eis = true; }           // ❄️ friert ein
      if (t === 2) { betaeube(o, 0.8); treffe(N, o, dmg * 0.3, 'blitz', 'funke'); }   // ⚡ Schlag
      if (t === 4) treffe(N, o, dmg * 0.4, 'pfeil', 'funke', true);   // 🏹 noch ein Treffer
      if (t === 5) o.fluch = Math.max(o.fluch || 0, 4);               // 🧿 verflucht
    }
  }
  if (k.paar.includes(3)) N.schild += 3;                              // 🛡️ Schild auf die Mauer
  const farben = k.paar.map((t) => THEMEN[t].farbe);
  N.fx.push({ typ: 'ausbruch', x: f.x, y: f.y, r, t: 1.4, farben, ico: k.ico, text: `${k.name.toUpperCase()}!`, stark: mal > 1 });
  if (N.live) N.wackeln = Math.max(N.wackeln || 0, mal > 1 ? 0.45 : 0.3);
}

// 🔗 Hilfskarte zu einer neu entdeckten Kombo (die Nacht steht, solange sie offen ist). Beim allerersten Mal mit Erklärung.
function komboKarte(id, mehr = []) {   // mehr = weitere neue Kombos derselben Pause (eine Karte statt vieler)
  const k = komboById(id), dreier = k.paar.length === 3, erste = !PROFIL.komboErklaert;
  PROFIL.komboErklaert = true;
  profilSpeichern();
  P.gesehen.kombo = true;   // steht danach im Heft unter „So funktioniert das Spiel“
  karte(`<h2>🔗 Neue Kombo entdeckt!</h2>
    ${erste ? '<p>Eine <b>Kombo</b> entsteht von selbst, wenn Zauber zweier Richtungen zusammen eingesetzt sind – mit drei Zaubern gibt es Dreier-Kombos. Sie kostet nichts und wirkt in jeder Nacht.</p><p>Jedes Auslösen lädt die 🔗 <b>Kombo-Leiste</b> (links oben). Ist sie voll, bricht deine häufigste Kombo als großer <b>Kombo-Ausbruch</b> los – tippst du den ✨ Funken vorher an, wird er noch stärker.</p>' : ''}
    <div class="kkarte da an"><div class="kpaar">${k.paar.map((t) => `${THEMEN[t].ico} ${THEMEN[t].name}`).join(' + ')}${dreier ? ' · Dreier-Kombo' : ''}</div>
      <div class="kname">${k.ico} ${esc(k.name)}</div><div class="ktext">${esc(k.text)}</div></div>
    ${mehr.length ? `<p><b>Außerdem neu:</b> ${mehr.map(komboById).filter(Boolean).map((m) => `${m.ico} ${esc(m.name)}`).join(', ')}</p>` : ''}
    <p class="hinweis">Nachlesen kannst du sie jederzeit im 📖 Kombo-Buch (✨ Talente → Kombo-Buch). ${P.kombos.length} von ${KOMBO.length + DREIER.length} entdeckt.</p>`,
  [{ label: 'Weiter kämpfen!' }]);
}
const HELDEN_QUELLEN =['held', 'feuerball', 'kettenblitz', 'eiswelle'];
const zauberCd = (T, name) => ZAUBER[name].cd * (1 - Math.min(0.7, (T[ZAUBER_CD[name]] || 0) + (T.cd_alle || 0)));
const istGross = (id) => GEGNER[id].boss || id === 'troll';   // für Bossjäger: Bosse und Trolle

// Querfeldein: vom Portal in einem leichten Bogen direkt zum Tor. Der Bogen hängt von der Nummer des Gegners ab
// (fest, kein Zufall), so kommen sie aus verschiedenen Richtungen.
function querWeg(p, id) {
  const [sx, sy] = p.weg[0], [gx, gy] = [BURG.tor.x, BURG.y];
  const dx = gx - sx, dy = gy - sy, l = Math.hypot(dx, dy), seite = (((id * 37) % 7) - 3) * 0.7;
  const mx = (sx + gx) / 2 - (dy / l) * seite, my = Math.max(0.3, Math.min(NFELD.h - 0.7, (sy + gy) / 2 + (dx / l) * seite));
  const weg = [[sx, sy], [mx, my], [gx - 1.2, gy + seite * 0.15], [gx, gy]];
  let len = 0;
  for (let i = 1; i < weg.length; i++) len += Math.hypot(weg[i][0] - weg[i - 1][0], weg[i][1] - weg[i - 1][1]);
  return { id: p.id, name: p.name, weg, len };
}
// 🦇 Flieger: fast Luftlinie vom Portal zum Tor (fester kleiner Versatz je Monster, damit sie nicht auf einer Linie fliegen)
function flugWeg(p, id) {
  const [sx, sy] = p.weg[0], [gx, gy] = [BURG.tor.x, BURG.y], seite = (((id * 53) % 9) - 4) * 0.35;
  const dx = gx - sx, dy = gy - sy, l = Math.hypot(dx, dy);
  const mx = (sx + gx) / 2 - (dy / l) * seite, my = Math.max(0.4, Math.min(NFELD.h - 0.6, (sy + gy) / 2 + (dx / l) * seite));
  const weg = [[sx, sy], [mx, my], [gx, gy]];
  return { id: p.id, name: p.name, weg, len: Math.hypot(mx - sx, my - sy) + Math.hypot(gx - mx, gy - my) };
}
// Am Boden = erreichbar für Katapult, Erdbeben, Boden-Feuer und Torwache. Flieger nur, solange sie betäubt/eingefroren
// sind oder gerade weggepustet wurden (e.unten, Sturmturm/Rückstoß) – Nutzeridee 2026-11-13.
const fliegt = (e) => !!GEGNER[e.g].fliegt;
const amBoden = (e) => !GEGNER[e.g].fliegt || e.stun > 0 || e.unten > 0;
const FLIEGER_UNTEN = 1.5;   // so lange liegt ein weggepusteter Flieger am Boden
// Spieltest 2026-11-13: der Eisturm half gegen Greife nicht. Jetzt holt jeder Eistreffer Flieger kurz zu Boden, Blitze kürzer.
const EIS_UNTEN = 1.2, BLITZ_UNTEN = 0.5;
const DRACHE_MUEDE = 0.55;   // 🐉 Tempo des Drachen kurz vor dem Verpuffen (Anteil des vollen Tempos)

// Eine Nacht = 2 Wellen. Ist Welle 1 ganz besiegt, gibt es den Wellenbonus (welleXp) und eine Verschnaufpause:
// Level-up, Talente verteilen, bauen – Welle 2 startet erst auf Knopfdruck (in der Vorschau sofort).
// Bauen, Ausbauen und Talente gehen auch sonst jederzeit – solange ein Blatt offen ist, steht die Nacht still.
const WELLE_ATEM = 1.5;
const welleXp = (n) => 4 + 2 * n;   // Bonus für jede gehaltene Welle
// 🪙 Volles Kopfgeld erst, wenn alle Hauptaufgaben der Burg gelöst sind
const alleAufgabenGeloest = () => burgHoefe().filter((h) => !h.knobel).every((h) => P.hoefe[h.id]?.fertig);
const nachtGoldJe = () => NACHT_GOLD * (ENDLOS ? ENDLOS_GOLD : alleAufgabenGeloest() ? 1 : NACHT_GOLD_OFFEN);   // ♾️ Endlos-Modus: Kopfgeld finanziert alles
// Gold gutschreiben: N.gold zählt mit Nachkomma; live geht jede volle Münze sofort aufs Konto (für die Wellenpause),
// P.nachtVorschuss merkt sich das – wird die Nacht abgebrochen, wird es wieder abgezogen (sonst ließe sich Welle 1 wiederholen)
function nachtGold(N, g, x, y) {
  const vorher = Math.floor(N.gold);
  N.gold += g;
  const d = Math.floor(N.gold) - vorher;
  if (!d || !N.live) return;
  P.gold += d; P.nachtVorschuss = (P.nachtVorschuss || 0) + d; N.goldGezahlt += d;
  hud();
  if (x !== undefined) N.fx.push({ typ: 'text', x, y: y - 0.2, text: `+${d} 🪙`, farbe: '#ffd84a', t: 1.1 });
}
function nachtZustand(n) {
  // Nach Niederlagen sind die Monster dieser Nacht schwächer (schwaechung in data.js)
  const rf = ruhmFaktor();   // ⭐ Ruhm: stärkere Monster, dafür mehr XP, Kopfgeld und Beute (data.js)
  const schwach = (n === P.nacht ? 1 - schwaechung() : 1) * schwierig().leben * rf;   // ⚔️ Schwierigkeit (data.js)
  const wellen = wellenFuer(n).map((gruppen) => {
    const spawns = [];
    for (const g of gruppen) for (let i = 0; i < g.n; i++) spawns.push({ t: g.t + i * g.ab, p: g.p, g: g.g, mehr: (g.mehr || 1) * schwach, chef: g.chef });
    return spawns.sort((a, b) => a.t - b.t);
  });
  const N = { n, t: 0, wt: 0, hp: 0, max: 0, wellen, welle: 0, spawns: wellen[0], si: 0, nr: 0, feinde: [], fx: [], feuer: [], tuerme: [], soldaten: [],
    zauber: [], schaden: {}, besiegt: 0, xp: 0, uhr: {}, ende: null, luecke: 0, halt: false, spaeher: spaeherAktiv(),
    gold: 0, goldGezahlt: 0, goldJe: nachtGoldJe() * ruhmLohn(), ruhm: ruhmLohn(), ruhmLeben: rf,
    levelStart: heldLevel().level };   // XP kommen schon in der Pause aufs Konto – die Ergebniskarte vergleicht mit dem Level vom Nachtbeginn
  // 🎯 Erzfeind (Wegknoten): die häufigste Monsterart dieser Nacht
  const zahl = {};
  for (const w of wellen) for (const s of w) zahl[s.g] = (zahl[s.g] || 0) + 1;
  N.erzfeind = Object.entries(zahl).sort((a, b) => b[1] - a[1])[0]?.[0];
  nachtAufstellen(N, true);
  N.goldJe *= 1 + (N.T.kopfgeld || 0);   // 🪙 Meisterschaft Kopfgeldjäger
  N.komboLadung = P.komboLadung || 0;    // 🔗 die Kombo-Leiste lädt über die Nächte weiter (Spieltest: mit 1–2 Kombos kam sonst nie ein Ausbruch)
  return N;
}

// Türme, Held, Zauber, Torwache und Mauer aus dem Spielstand aufstellen – zu Beginn und nach jedem Bauen/Lernen
// in der Nacht (Abklingzeiten und verwundete Soldaten bleiben erhalten)
function nachtAufstellen(N, erstes) {
  const T = talentWerte(), alt = N.tuerme, lieb = T.lieb_turm ? lieblingsturm() : null;
  const tuerme = Object.entries(P.tuerme).map(([s, tw]) => {
    const w = turmWerteAus(tw.art, tw.wahl, tw.vet);
    w.dmg *= 1 + (T.turm_dmg || 0) + (tw.art === lieb ? T.lieb_turm : 0);   // 🏰 Lieblingsturm
    w.takt /= Math.max(0.5, 1 + (T.turm_tempo || 0)); w.reich += T.turm_reich || 0;   // (stand versehentlich im Kommentar oben – wirkte nicht)
    if (w.pfeile) w.pfeile += T.turm_pfeile || 0;
    if (w.flaeche) w.flaeche += T.turm_flaeche || 0;
    if (tw.art === 'katapult' && T.turm_steine) w.steine = (w.steine || 1) + T.turm_steine;
    const vorher = alt.find((t) => t.slot === +s);
    return { slot: +s, x: tw.x, y: tw.y, art: tw.art, wahl: [...tw.wahl], vet: tw.vet || 0, w, cd: vorher ? vorher.cd : 0.3, schuss: vorher ? vorher.schuss : 0, uhr: vorher?.uhr };
  });
  // 📊 Für die Schadensbilanz merken, welche Turmart wo stand. Wurde in der Pause verkauft und etwas anderes gebaut,
  // bekommt der alte Turm einen eigenen Eintrag („2~pfeil“), damit sein Schaden nicht dem neuen zugeschrieben wird.
  N.turmArt = N.turmArt || {};
  for (const t of tuerme) {
    const s = String(t.slot), vor = N.turmArt[s];
    if (vor && vor !== t.art && N.schaden?.[s]) { N.schaden[`${s}~${vor}`] = (N.schaden[`${s}~${vor}`] || 0) + N.schaden[s]; delete N.schaden[s]; N.turmArt[`${s}~${vor}`] = vor; }
    N.turmArt[s] = t.art;
  }
  // Der Held steht auf der Mauer: Grundangriff wie ein schwacher Turm, dazu seine Zauber
  // 👑 Schlüsseltalente: Eremit (stark, keine Zauber), Sturmherz (Grundangriff halb)
  const heldMal = (T.eremit ? 2 : 1) * (T.held_halb ? 0.5 : 1);
  // 🧙 Level-Kraft (data.js HELD_JE_LEVEL): wirkt auf Grundangriff und alle Zauber (über alle_dmg)
  const lk = 1 + HELD_JE_LEVEL * (heldLevel().level - 1);
  T.held_dmg = (1 + (T.held_dmg || 0)) * lk - 1; T.alle_dmg = (1 + (T.alle_dmg || 0)) * lk - 1;
  const held = { burg: true, ...HELD, cd: N.held ? N.held.cd : 0.3, anim: 0, w: { ...BURGSCHUETZE, dmg: BURGSCHUETZE.dmg * Math.max(0.2, 1 + (T.held_dmg || 0)) * heldMal,
    takt: BURGSCHUETZE.takt / Math.max(0.3, 1 + (T.held_tempo || 0)) / (T.eremit ? 1.4 : 1), reich: Math.max(2.5, BURGSCHUETZE.reich + (T.held_reich || 0)), pfeile: 1 + (T.held_pfeile || 0) } };
  if (T.held_aus) held.w.reich = 0;   // ⏳ Zeitschleife: der Held greift nicht mehr selbst an (nur noch Zauber)
  tuerme.push(held);
  // 👥 Schattenklon: steht neben dem Helden und greift mit halbem Schaden an
  if (T.klon) tuerme.push({ burg: true, quelle: 'klon', x: HELD.x, y: HELD.y + 1.1, cd: 0.6, w: { ...held.w, dmg: held.w.dmg * T.klon } });
  // 🌿 Uralter Baum: kämpft neben der Burg wie ein starker Turm
  if (T.baum) tuerme.push({ burg: true, quelle: 'baum', x: BURG.x - 1.3, y: BURG.y + 1.5, cd: 0.3, w: { dmg: 10, reich: 3.6, takt: 1.0 } });
  // 🦉 Wächtereule (Wunder): kreist über der Burg, trifft überall (auch im Portal-Nebel), stark wie ein Teil des Grundangriffs
  if (T.eule) tuerme.push({ burg: true, quelle: 'eule', x: BURG.x - 1, y: BURG.y - 2, cd: 0.5, w: { dmg: held.w.dmg * T.eule * 2, reich: 99, takt: 1.6 } });
  // 🐲 Drachling (⭐ Abzeichen-Schatz): kleiner Drache über dem Tor, spuckt schnell Feuer auf alles in der Nähe des Tors
  if (T.drachling) tuerme.push({ burg: true, quelle: 'drachling', x: BURG.x - 1, y: BURG.y + 2, cd: 0.7, w: { dmg: held.w.dmg * T.drachling * 1.6, reich: 7, takt: 0.9 } });
  const max = mauerMax();   // karte.js – dieselbe Zahl wie im Abendpanel
  N.hp = erstes ? max : Math.min(max, N.hp + Math.max(0, max - N.max));
  N.max = max;
  N.zauber = (T.eremit ? [] : T.zauber).map((name) => ({ name, t: N.zauber.find((z) => z.name === name)?.t ?? 1.5, echo: 0 }));
  // 🛡️ Torwache: wer schon kämpft, bleibt mit seinen Wunden; ein Ausbau gibt die neuen Werte dazu
  const w = WACHE[P.wache], alteS = N.soldaten || [];
  N.soldaten = WACHE_POSTEN.slice(0, w.n).map(([x, y], i) => {
    const s = alteS.find((o) => o.id === i);
    if (s) return Object.assign(s, { hp: Math.min(w.hp, s.hp + Math.max(0, w.hp - s.max)), max: w.hp, dmg: w.dmg });
    return { id: i, px: x, py: y, x, y, hp: w.hp, max: w.hp, dmg: w.dmg, ziel: null, tot: 0, schlag: 0 };
  });
  if (erstes) { N.schild = T.schild || 0; N.wiedergeburt = !!T.wiedergeburt; }
  N.kuppel = !!T.kuppel && !N.kuppelWeg;   // 🌈 Schutzkuppel: einmal pro Nacht
  Object.assign(N, { T, held, tuerme, kombosAn: new Set(kombosAktiv().map((k) => k.id)) });
}

function naechsteWelle(N) {
  N.welle++;
  N.spawns = N.wellen[N.welle];
  N.si = 0; N.wt = 0; N.luecke = 0;
  N.fx = N.fx.filter((f) => f.typ !== 'ansage');   // „Welle gehalten“ aus der Pause nicht unter dem neuen Banner liegen lassen
  const gross = N.welle === N.wellen.length - 1;
  // großes Banner wie bei Kingdom Rush: fährt von links herein
  N.fx.push({ typ: 'ansage', banner: true, t: 2.6, text: `${gross ? '👑' : '⚔️'} Welle ${N.welle + 1} von ${N.wellen.length}`,
    unter: gross ? 'Der Anführer kommt!' : N.welle === 0 ? `Nacht ${N.n} beginnt` : '' });
}

// 🛡️ Soldaten: suchen sich einen Gegner nahe ihrem Posten, halten ihn fest und kämpfen
function wacheSchritt(N) {
  for (const s of N.soldaten) {
    if (s.tot > 0) {
      if ((s.tot -= DT) <= 0) Object.assign(s, { x: s.px, y: s.py, hp: s.max, ziel: null });
      continue;
    }
    if (s.ziel && (s.ziel.hp <= 0 || s.ziel.amTor || !amBoden(s.ziel))) { s.ziel.gehalten = null; s.ziel = null; }   // 🦇 Flieger hebt wieder ab
    if (!s.ziel) {
      let best = null, bd = 1.6;
      for (const e of N.feinde) {
        const d = Math.hypot(e.x - s.px, e.y - s.py);
        if (e.hp > 0 && !e.gehalten && amBoden(e) && d < bd) { best = e; bd = d; }
      }
      if (best) { s.ziel = best; best.gehalten = s; }
    }
    const zx = s.ziel ? s.ziel.x : s.px, zy = s.ziel ? s.ziel.y : s.py, d = Math.hypot(zx - s.x, zy - s.y);
    if (d > (s.ziel ? 0.42 : 0.05)) {
      const v = Math.min(d, 2.6 * DT);
      s.x += ((zx - s.x) / d) * v; s.y += ((zy - s.y) / d) * v;
    } else if (s.ziel) {
      // Nahkampf: beide verlieren Leben (🥷 Schattenwache: doppelter Schaden und Fluch, 🏮 Laternenwache: Brand und Fluch)
      const e = s.ziel, T = N.T;
      treffe(N, e, s.dmg * (T.schattenwache ? 2 : 1) * DT, 'stein', 'wache', false, true);
      if (T.schattenwache) { e.fluch = Math.max(e.fluch || 0, 1); kombo(N, 'schattenwache', e.x, e.y, 8); }
      if (T.laterne) { brennen(e, 1, T.laterne); e.fluch = Math.max(e.fluch || 0, 1); kombo(N, 'laterne', e.x, e.y, 8); }
      s.hp -= GEGNER[e.g].schaden * (e.chef ? 2 : 1) * 1.2 * DT;
      N.wacheGetroffen = true;   // ⭐ Ruhm-Bonus nur, wenn die Wache unverletzt blieb
      if ((s.schlag -= DT) <= 0) { s.schlag = 0.45; e.getroffen = 0.12; N.fx.push({ typ: 'klirr', x: (s.x + e.x) / 2, y: (s.y + e.y) / 2, t: 0.25 }); }
      if (s.hp <= 0) {
        s.tot = WACHE_WIEDER * (1 - (T.wache_schnell || 0)) * (T.schattenwache ? 0.5 : 1);
        e.gehalten = null; s.ziel = null; N.fx.push({ typ: 'text', x: s.x, y: s.y - 0.4, text: '💫', farbe: '#fff', t: 1 });
      }
    }
  }
}

// Etwas regelmäßig tun (Spezialisierungen): alle s Sekunden fn(); gibt fn false zurück, wird es gleich wieder versucht
function alle(N, key, s, fn) {
  N.uhr[key] = (N.uhr[key] ?? s) - DT;
  if (N.uhr[key] <= 0 && fn() !== false) N.uhr[key] = s;
}

// ⚜️ Wirkungen der Spezialisierungen, die nicht an einem Treffer hängen
function spezSchritt(N) {
  const T = N.T, lebend = () => N.feinde.filter((e) => e.hp > 0);
  if (T.mauer_regen) alle(N, 'regen', T.mauer_regen, () => { N.hp = Math.min(N.max, N.hp + 1); });
  if (T.dornen) for (const e of lebend()) treffe(N, e, T.dornen * DT, 'natur', 'dornen', false, true);
  if (T.blenden) alle(N, 'blenden', 10, () => {
    const nah = lebend().filter((e) => Math.hypot(e.x - BURG.x, e.y - BURG.y) <= 6);
    if (!nah.length) return false;
    for (const e of nah) betaeube(e, 1.5);
    N.fx.push({ typ: 'licht', t: 0.4 });
  });
  if (T.wurzel) alle(N, 'wurzel', 5, () => {
    const e = lebend().sort((a, b) => a.rest - b.rest)[0];
    if (!e) return false;
    betaeube(e, 2); e.wurzel = 2;
  });
  if (T.riss) alle(N, 'riss', 10, () => {
    const e = lebend().sort((a, b) => b.hp - a.hp)[0];
    if (!e) return false;
    treffe(N, e, e.hp / 3, 'chaos', 'riss');
    N.fx.push({ typ: 'riss', x: e.x, y: e.y, t: 0.5 });
  });
  if (T.zeitstopp) alle(N, 'zeitstopp', 15, () => {
    if (!lebend().length) return false;
    for (const e of lebend()) betaeube(e, 1.5);
    N.fx.push({ typ: 'zeit', t: 0.5 });
  });
  if (T.rueckspulen) alle(N, 'rueck', 20, () => {
    if (!lebend().length) return false;
    for (const e of lebend()) e.d = Math.max(0, e.d - 1.5);
    N.fx.push({ typ: 'zeit', t: 0.5 });
  });
  // 🧪 Zerfall (Gift)
  for (const e of N.feinde) if (e.gift > 0 && e.hp > 0) { e.gift -= DT; treffe(N, e, T.gift * DT, 'chaos', 'gift', false, true); }
}

// Schaden an der Mauer – mit Lichtschild, Spiegelschild, Gewitterschild und Wiedergeburt (e = der Angreifer)
function mauerTreffer(N, dmg, e) {
  const T = N.T, weg = Math.min(N.schild, dmg);
  N.schild -= weg;
  N.hp -= dmg - weg;
  // 💎 Eispanzer und 🌘 Schattenschild: wenn der Schild etwas abfängt
  if (e && weg > 0 && (T.eispanzer || T.schattenschild)) {
    for (const o of N.feinde) {
      if (o.hp <= 0) continue;
      const d = Math.hypot(o.x - e.x, o.y - e.y);
      if (T.eispanzer && d <= 1.5) { betaeube(o, T.eispanzer, true); o.eis = true; }
      if (T.schattenschild && d <= 2.5) o.fluch = Math.max(o.fluch || 0, T.schattenschild);
    }
    if (T.eispanzer) { N.fx.push({ typ: 'frostring', x: e.x, y: e.y, r: 1.5, t: 0.8 }); kombo(N, 'eispanzer', e.x, e.y); }
    if (T.schattenschild) kombo(N, 'schattenschild', e.x, e.y - 0.5);
  }
  if (e && weg > 0 && T.spiegel) {
    for (const o of N.feinde) if (o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) <= 1.5) treffe(N, o, T.spiegel, 'magie', 'spiegel');
    N.fx.push({ typ: 'boom', x: e.x, y: e.y, r: 1.5, t: 0.35, farbe: '160, 220, 255' }, { typ: 'text', x: e.x, y: e.y - 0.5, text: '🪞', farbe: '#9fd8ff', t: 1 });
  }
  // ⛈️ Gewitterschild: Blitz in die 3 nächsten Gegner am Tor
  if (e && T.gewitter) {
    const ziele = N.feinde.filter((o) => o.hp > 0 && o !== e).sort((a, b) => a.rest - b.rest).slice(0, 3);
    for (const o of ziele) treffe(N, o, T.gewitter, 'blitz', 'gewitter');
    if (ziele.length) {
      N.fx.push({ typ: 'blitz', punkte: [{ x: BURG.tor.x, y: BURG.y - 1 }, ...ziele.map((o) => ({ x: o.x, y: o.y }))], t: 0.35, dick: true });
      kombo(N, 'gewitter', ziele[0].x, ziele[0].y);
    }
  }
  // 🌵 Dornenschild und 🔷 Kristallmauer: wenn der Schild etwas abfängt
  if (e && weg > 0 && T.dornschild) {
    for (const o of nahe(N, BURG.tor.x - 1, BURG.y, 2.2)) treffe(N, o, T.dornschild, 'stein', 'dornschild');
    N.fx.push({ typ: 'text', x: BURG.tor.x - 0.8, y: BURG.y - 1, text: '🌵', farbe: '#fff', t: 0.8 });
  }
  if (e && weg > 0 && T.kristall) {
    const ziele = nahe(N, BURG.tor.x, BURG.y, 99).sort((a, b) => a.rest - b.rest).slice(0, 4);
    for (const o of ziele) { treffe(N, o, T.kristall, 'eis', 'kristall'); betaeube(o, 1, true); o.eis = true; }
    if (ziele.length) { N.fx.push({ typ: 'blitz', punkte: [{ x: BURG.tor.x, y: BURG.y - 1 }, ...ziele.map((o) => ({ x: o.x, y: o.y }))], t: 0.35, dick: true, eis: true }); kombo(N, 'kristall', ziele[0].x, ziele[0].y); }
  }
  // 🔔 Sturmglocke: jeder Treffer am Tor lässt alle in der Nähe stillstehen (höchstens alle 3 s)
  if (e && T.sturmglocke && (N.glockeUhr ?? -9) < N.t - 3) {
    N.glockeUhr = N.t;
    for (const o of nahe(N, BURG.tor.x, BURG.y, 3.5)) { betaeube(o, 1); o.fluch = Math.max(o.fluch || 0, 2); }
    N.fx.push({ typ: 'frostring', x: BURG.tor.x, y: BURG.y, r: 3.5, t: 0.6, farbe: '200, 160, 255' });
    kombo(N, 'sturmglocke', BURG.tor.x - 1.5, BURG.y);
  }
  // 🌈 Schutzkuppel: einmal pro Nacht, wenn die Mauer unter die Hälfte fällt
  if (N.kuppel && N.hp > 0 && N.hp < N.max / 2) {
    N.kuppel = false; N.kuppelWeg = true; N.schild += T.kuppel;
    N.fx.push({ typ: 'licht', t: 0.6 }, { typ: 'text', x: BURG.tor.x, y: BURG.y - 1.4, text: `🌈 +${T.kuppel}`, farbe: '#9fd8ff', t: 1.4 });
  }
  if (N.hp <= 0 && N.wiedergeburt) { N.wiedergeburt = false; N.hp = Math.ceil(N.max / 2); N.fx.push({ typ: 'licht', t: 0.8 }); }
}

// Alle lebenden Gegner im Umkreis r um (x, y), ohne den Gegner ohne
const nahe = (N, x, y, r, ohne) => N.feinde.filter((o) => o.hp > 0 && o !== ohne && Math.hypot(o.x - x, o.y - y) <= r);
const naechste = (N, e, r, n) => nahe(N, e.x, e.y, r, e).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y)).slice(0, n);
// 🔥 Ein Gegner brennt s Sekunden lang mit dps Schaden pro Sekunde
function brennen(e, s, dps) {
  e.brand = Math.max(e.brand || 0, s);
  e.brandDps = Math.max(e.brandDps || 0, dps);
}
// Die größte Gruppe (Gegner mit den meisten Nachbarn im Umkreis r); ohne = Gegner, die nicht in Frage kommen
function groessteGruppe(N, r, ohne = () => false) {
  let best = null, bn = -1;
  for (const e of N.feinde) {
    if (e.hp <= 0 || ohne(e)) continue;
    const n = nahe(N, e.x, e.y, r).length;
    if (n > bn || (n === bn && e.rest < best.rest)) { best = e; bn = n; }
  }
  return best;
}

// 🪄 Von Hand oder 🤖 Auto: Zauber und Turm-Fähigkeiten wirken von selbst, außer man schaltet Auto aus
// (P.zauberAuto[key] === false, key = Zaubername bzw. 't' + Turmplatz). Vorschau und Bot spielen immer mit Auto.
const autoAn = (N, key) => !N.live || (P.zauberAuto || {})[key] !== false;
const ZIEL_ZAUBER = ['feuerball', 'eiswelle'];   // brauchen einen Zielpunkt im Feld
function zauberVonHand(N, name, ziel) {
  const z = N.zauber.find((o) => o.name === name);
  if (!z || z.t > 0) return false;
  if (!zaubere(N, name, ziel)) return false;
  z.t = zauberCd(N.T, name);
  if (N.T.echo) z.echo = 1;
  return true;
}

// Zauber wirken lassen. false = kein Gegner in Reichweite (dann wartet der Zauber). ziel = Gegner (von Hand gezielt)
function zaubere(N, name, ziel) {
  const T = N.T, z = ZAUBER[name], h = N.held, kraft = 1 + (T.alle_dmg || 0);
  if (name === 'schutz') {
    // 🛡️ Schild auf die Mauer (nur wenn schon Gegner da sind)
    if (!N.feinde.length) return false;
    const plus = (2 + (T.schutz_plus || 0)) * (T.schutz_mal || 1) * (T.schutz_doppel ? 2 : 1);   // 🔰 Doppelschild
    N.schild = Math.min(N.schild + plus, plus * 2);   // höchstens zwei Schilde übereinander
    // ♨️ Dampfwolke: heißer Dampf vor dem Tor bremst und brennt
    if (T.dampf) {
      N.feuer.push({ x: BURG.tor.x - 1.6, y: BURG.y, r: 1.6, t: 5, dps: T.dampf, bremse: 0.35, art: 'dampf', q: 'dampf' });
      kombo(N, 'dampf', BURG.tor.x - 1.6, BURG.y);
    }
    if (T.schutz_heil) N.hp = Math.min(N.max, N.hp + T.schutz_heil);
    if (T.schutz_wache) for (const s of N.soldaten) if (s.tot <= 0) s.hp = s.max;
    // 🏮 Feuerwall: der Boden vor dem Tor brennt
    if (T.feuerwall) {
      N.feuer.push({ x: BURG.tor.x - 1.3, y: BURG.y, r: 1.3, t: 4, dps: T.feuerwall, q: 'feuerwall' });
      kombo(N, 'feuerwall', BURG.tor.x - 1.3, BURG.y);
    }
    N.fx.push({ typ: 'licht', t: 0.5 }, { typ: 'text', x: BURG.tor.x, y: BURG.y - 1.4, text: `🛡️ +${plus}`, farbe: '#9fd8ff', t: 1.2 });
    h.anim = 0.4;
    return true;
  }
  const imKreis = N.feinde.filter((e) => e.hp > 0 && Math.hypot(e.x - h.x, e.y - h.y) <= z.reich + (T.zauber_reich || 0));   // 🔭 Weite Zauber
  if (!imKreis.length) return false;
  const imKreisSet = new Set(imKreis);
  if (name === 'feuerball') {
    // 🏀 Abpraller springt vom Einschlag weiter, ☀️ Zwillingsball fliegt mit voller Kraft mit
    const a = feuerwurf(N, { erlaubt: imKreisSet, ziel });
    if (a && T.fb_abprall) feuerwurf(N, { erlaubt: imKreisSet, vorher: a, mal: T.fb_abprall, von: a });
    if (a && T.fb_doppelt) feuerwurf(N, { erlaubt: imKreisSet, vorher: a, mal: T.fb_doppelt });
  } else if (name === 'kettenblitz') {
    const dmg = 7 * (1 + (T.kb_dmg || 0)) * kraft;
    const erstes = imKreis.sort((a, b) => a.rest - b.rest)[0];
    const getroffen = blitzkette(N, erstes, 4 + (T.kb_kette || 0), [], h);
    // 🔱 Gabelblitz: eine zweite Kette ab dem ersten Ziel
    if (T.kb_gabel) blitzkette(N, erstes, 3 + (T.kb_kette || 0), getroffen, erstes);
    for (const e of getroffen) {
      treffe(N, e, dmg, 'blitz', 'kettenblitz');
      if (T.kb_stun) betaeube(e, T.kb_stun);
      if (T.funkenflug) N.feuer.push({ x: e.x, y: e.y, r: 0.55, t: 1.5, dps: T.funkenflug, q: 'funken' });   // 🎇 Funkenflug
      if (T.schattenblitz) e.fluch = Math.max(e.fluch || 0, T.schattenblitz);   // 🌌 Schattenblitz
    }
    const letzt = getroffen[getroffen.length - 1];
    // 💥 Donnerschlag: das letzte Ziel explodiert
    if (T.kb_donner) {
      for (const o of nahe(N, letzt.x, letzt.y, 1.3)) treffe(N, o, T.kb_donner * kraft, 'blitz', 'donner');
      N.fx.push({ typ: 'boom', x: letzt.x, y: letzt.y, r: 1.3, t: 0.4, farbe: '255, 240, 120' });
    }
    if (T.funkenflug) kombo(N, 'funken', erstes.x, erstes.y);
    if (T.schattenblitz) kombo(N, 'schattenblitz', letzt.x, letzt.y);
    N.fx.push(...getroffen.map((e) => ({ typ: 'text', x: e.x, y: e.y - 0.4, text: `-${Math.round(dmg)}`, farbe: '#c9b3ff', t: 0.9 })));
    // 🔁 Nachhall: jeder 3. Kettenblitz kommt gleich noch einmal
    N.kbZahl = (N.kbZahl || 0) + 1;
    if (T.kb_nachhall && N.kbZahl % T.kb_nachhall === 0 && !N.nachhall) { N.nachhall = true; zaubere(N, 'kettenblitz'); N.nachhall = false; }
  } else if (name === 'meteor') {
    // ☄️ Meteor: auf die größte Gruppe, großer Einschlag, danach brennt der Boden
    // (Nutzerwunsch: neue Zauber „genauso stark wie die anderen“ – gemessen etwa wie der Feuerball, dafür überall auf dem Feld)
    const mr = 1.5 * (1 + (T.zauber_flaeche || 0));
    const m = ziel || groessteGruppe(N, mr, (e) => !imKreisSet.has(e));
    if (!m) return false;
    const dmg = 14 * kraft;
    for (const o of nahe(N, m.x, m.y, mr)) treffe(N, o, dmg, 'feuer', 'meteor');
    N.feuer.push({ x: m.x, y: m.y, r: 1.2, t: 3, dps: 3 * kraft, q: 'meteor' });
    N.fx.push({ typ: 'boom', x: m.x, y: m.y, r: 1.5, t: 0.7, farbe: '255, 150, 60' }, { typ: 'beben', x: m.x, y: m.y, r: 1.5, t: 0.9 },
      { typ: 'text', x: m.x, y: m.y - 0.6, text: `☄️ -${Math.round(dmg)}`, farbe: '#ff9a4a', t: 1.2 });
  } else if (name === 'ruebenregen') {
    // 🥕 Rübenregen (⭐ Abzeichen): 7 Rüben prasseln auf die größte Gruppe, jede trifft klein und lässt kurz stolpern
    const r = 1.8 * (1 + (T.zauber_flaeche || 0));
    const m = ziel || groessteGruppe(N, r, (e) => !imKreisSet.has(e));
    if (!m) return false;
    const dmg = 5.5 * kraft;   // gemessen: mit 4 nur halb so viel wie der Meteor
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4, d = i ? (0.45 + (i % 3) * 0.45) * r / 1.8 : 0, x = m.x + Math.cos(a) * d, y = m.y + Math.sin(a) * d;
      for (const o of nahe(N, x, y, 0.7)) { treffe(N, o, dmg, 'magie', 'ruebenregen'); betaeube(o, 0.25); }
      N.fx.push({ typ: 'flug', ico: '🥕', x1: x + 1.2, y1: y - 4, x2: x, y2: y, t: 0.5 + i * 0.07, farbe: ['#ffb040', '#7ad04a'] });
    }
  } else if (name === 'sternenfall') {
    // 🌠 Sternenfall (🏆 Abzeichen): fünf Sterne auf die fünf zähesten Monster
    const ziele = [...imKreis].sort((a, b) => b.hp - a.hp).slice(0, 5), dmg = 20 * kraft;
    ziele.forEach((e, i) => {
      for (const o of nahe(N, e.x, e.y, 0.9 * (1 + (T.zauber_flaeche || 0)))) treffe(N, o, dmg, 'magie', 'sternenfall');
      N.fx.push({ typ: 'flug', ico: '🌠', x1: e.x + 2.5, y1: -1, x2: e.x, y2: e.y, t: 0.5 + i * 0.12, farbe: ['#fff6c0', '#c9b3ff'] });
    });
    N.fx.push({ typ: 'ansage', t: 1.6, text: '🌠 Sternenfall!' });
  } else if (name === 'riesenglocke') {
    // 🔔 Riesenglocke: alle Monster stehen still (Bosse und Anführer kürzer, über betaeube)
    for (const o of imKreis) { betaeube(o, 2); treffe(N, o, 3 * kraft, 'magie', 'riesenglocke'); }
    N.fx.push({ typ: 'glocke', x: BURG.tor.x, y: BURG.y, r: 12, t: 1.4 }, { typ: 'ansage', t: 1.8, text: '🔔 Die Riesenglocke dröhnt!' });
  } else if (name === 'eiswelle') {
    const r = (1.3 + (T.fn_radius || 0)) * (1 + (T.zauber_flaeche || 0));
    const mitte = ziel || groessteGruppe(N, r, (e) => !imKreisSet.has(e));
    eiswelle(N, mitte, r);
    // 🌊 Doppelwelle: auch die zweitgrößte Gruppe (weit genug weg von der ersten)
    if (T.fn_doppel) {
      const zwei = groessteGruppe(N, r, (e) => !imKreisSet.has(e) || Math.hypot(e.x - mitte.x, e.y - mitte.y) < r * 1.5);
      if (zwei) eiswelle(N, zwei, r);
    }
  }
  h.anim = 0.4;   // der Held hebt den Stab
  return true;
}

// 🔥 Ein Feuerball dorthin, wo die meisten Gegner stehen. opt: erlaubt (Set möglicher Ziele), vorher (lieber nicht dorthin),
// mal (Schadensfaktor), von (Startpunkt, sonst der Held), gross (Vulkan: Fläche und Schaden mal gross)
function feuerwurf(N, opt = {}) {
  const T = N.T, h = N.held, gross = opt.gross || 1, mal = opt.mal || 1, von = opt.von || h;
  const fl = (1 + (T.fb_flaeche || 0)) * (1 + (T.zauber_flaeche || 0)) * (gross > 1 ? 2 : 1), dmg = 10 * (1 + (T.fb_dmg || 0)) * (1 + (T.alle_dmg || 0)) * mal * gross;
  const best = opt.ziel || groessteGruppe(N, fl, (e) => (opt.erlaubt && !opt.erlaubt.has(e)) || e === opt.vorher);
  if (!best) return null;
  const x = best.x, y = best.y, getroffen = nahe(N, x, y, fl);
  for (const o of getroffen) {
    treffe(N, o, dmg, 'feuer', gross > 1 ? 'vulkan' : 'feuerball');
    if (T.hoelle) o.fluch = Math.max(o.fluch || 0, 2);   // 🟣 Schattenflamme: Feuerball verflucht
    if (T.fb_zuend) brennen(o, 3, T.fb_zuend);           // 🌶️ Zündfunke
  }
  if (T.fb_brand) N.feuer.push({ x, y, r: fl * 0.8, t: 3, dps: T.fb_brand, q: 'feuerball' });
  // 🎇 Funkensprung: 3 Funken auf Gegner in der Nähe, die der Ball nicht getroffen hat
  if (T.fb_funken) {
    const weiter = nahe(N, x, y, fl + 2.2).filter((o) => !getroffen.includes(o)).slice(0, T.fb_funken);
    for (const o of weiter) {
      treffe(N, o, 5, 'feuer', 'funkensprung');
      N.fx.push({ typ: 'magie', x1: x, y1: y, x2: o.x, y2: o.y, t: 0.35, gross: true, warte: 0.25 });
    }
  }
  N.fx.push({ typ: 'feuerball', x1: von.x, y1: von.y, x2: x, y2: y, r: fl, t: 0.8, gross: fl > 1.3 },
    { typ: 'text', x, y: y - 0.3, text: `-${Math.round(dmg)}`, farbe: '#ffb347', t: 1.1, warte: 0.3 });
  return best;
}

// ⚡ Blitzkette ab erstes: springt zum jeweils nächsten Gegner; schon = bereits getroffen (wird erweitert)
function blitzkette(N, erstes, laenge, schon, von) {
  const getroffen = schon.includes(erstes) ? [] : [erstes], alle = () => schon.concat(getroffen);
  let letzt = erstes;
  while (getroffen.length < laenge) {
    let nah = null, nd = N.T.supra ? 3 : 2.0;
    for (const e of N.feinde) {
      const d = Math.hypot(e.x - letzt.x, e.y - letzt.y);
      if (e.hp > 0 && !alle().includes(e) && d < nd) { nah = e; nd = d; }
    }
    if (!nah) break;
    getroffen.push(nah); letzt = nah;
  }
  N.fx.push({ typ: 'blitz', punkte: [{ x: von.x, y: von.y }, ...(schon.includes(erstes) ? [{ x: erstes.x, y: erstes.y }] : []), ...getroffen.map((e) => ({ x: e.x, y: e.y }))], t: 0.4, dick: true });
  schon.push(...getroffen);
  return schon;
}

// ❄️ Eiswelle um ziel mit Radius r
function eiswelle(N, ziel, r) {
  const T = N.T, dmg = 3 * (1 + (T.fn_dmg || 0)) * (1 + (T.alle_dmg || 0));
  const s = { bremse: 3 * (1 + (T.fn_dauer || 0)), bremsFaktor: T.fn_stark ? 0.3 : 0.5 };
  for (const e of nahe(N, ziel.x, ziel.y, r)) {
    treffe(N, e, dmg, 'eis', 'eiswelle');
    bremse(e, s);
    if (T.eisfluch) e.fluch = Math.max(e.fluch || 0, 3);   // 🌫️ Eisiger Fluch
    if (T.fn_frier) { betaeube(e, T.fn_frier, true); e.eis = true; }
  }
  // 🌨️ Schneefeld: bremst noch eine Weile
  if (T.fn_feld) N.feuer.push({ x: ziel.x, y: ziel.y, r, t: T.fn_feld, dps: 0, bremse: 0.5, art: 'eis', q: 'schnee' });
  N.fx.push({ typ: 'frostring', x: ziel.x, y: ziel.y, r, t: 1.2 });
  if (T.eisfluch) kombo(N, 'eisfluch', ziel.x, ziel.y);
}

function treffe(N, e, dmg, art, quelle, durch = false, tick = false) {
  const g = GEGNER[e.g];
  if (/^\d+$/.test(quelle) && imPortalNebel(e.x, e.y)) return;   // 🌫️ im Portal-Nebel treffen Türme nicht (data.js PORTAL_NEBEL)
  if (art === 'pfeil' && !durch) dmg -= g.ruestung;
  dmg *= 1 - (g.res[art] || 0) / 100;
  if (e.gross) dmg *= 1 + (N.T.boss_dmg || 0) + (HELDEN_QUELLEN.includes(quelle) ? N.T.held_boss || 0 : 0);
  if (e.fluch > 0) dmg *= 1 + (N.T.fluch_dmg || 0);
  if (N.T.erzfeind && e.g === N.erzfeind) dmg *= 1 + N.T.erzfeind;   // 🎯 Erzfeind (Wegknoten)
  if (e.sproedeT > 0) dmg *= 1 + e.sproede;   // 💔 Sprödes Eis (Eisturm)
  if (e.markiert && /^\d+$/.test(quelle)) dmg *= 1 + SPAEHER_DMG;   // 🔭 vom Späher markiert: Türme treffen besser
  if (e.turmschild && /^\d+$/.test(quelle)) dmg *= TURMSCHILD;   // 🛡️ Turmschild: gegen Türme halb, gegen Held und Zauber voll
  if (N.T.licht_geist && e.g === 'geist' && quelle === 'held') dmg *= 3;
  // 🌌 Erzschlüssel: 🦅 Luftherrschaft (Flieger +60 % und kurz zu Boden, alle anderen −15 %), 🎲 Glücksritter (jeder 10. Treffer ×5, sonst −20 %)
  if (N.T.luft) { if (fliegt(e)) { dmg *= 1 + N.T.luft; if (!tick) e.unten = Math.max(e.unten || 0, 0.6); } else dmg *= 0.85; }
  if (N.T.gluecks && !tick) dmg *= (N.glueckN = (N.glueckN || 0) + 1) % 10 === 0 ? 4 : 0.7;
  // 🔗 Kombos: Kälte + Feuer, Kälte + Blitz
  const kalt = e.bremse > 0 || (e.eis && e.stun > 0);
  if (N.T.thermo && art === 'feuer' && kalt) { dmg *= 1 + N.T.thermo; if (!tick) kombo(N, 'thermo', e.x, e.y); }
  if (N.T.supra && art === 'blitz' && kalt) { dmg *= 1 + N.T.supra; kombo(N, 'supra', e.x, e.y); }
  // 🎯 Erster Schuss: der erste Treffer des Helden auf jeden Gegner zählt doppelt
  if (N.T.erstschlag && quelle === 'held' && !e.heldDran) { e.heldDran = true; dmg *= 1 + N.T.erstschlag; }
  if (!tick) {
    // 🧊 Schockfrost: der allererste Treffer friert kurz ein
    if (N.T.schockfrost && !e.schock) { e.schock = true; betaeube(e, N.T.schockfrost, true); e.eis = true; }
    // 💠 Splittereis: Treffer auf Gefrorene lassen Splitter fliegen (je Gegner höchstens alle 0,5 s)
    else if (N.T.splitter && e.eis && e.stun > 0 && quelle !== 'splitter' && (e.splitUhr ?? -9) < N.t - 0.5) {
      e.splitUhr = N.t;
      for (const o of nahe(N, e.x, e.y, 1.3, e)) treffe(N, o, N.T.splitter, 'eis', 'splitter');
      N.fx.push({ typ: 'frostring', x: e.x, y: e.y, r: 1.3, t: 0.4 });
    }
    // 🌀 Überladung: der 3. Blitztreffer betäubt
    if (N.T.ueberladung && art === 'blitz' && (e.blitzN = (e.blitzN || 0) + 1) >= 3) {
      e.blitzN = 0; betaeube(e, N.T.ueberladung);
      N.fx.push({ typ: 'text', x: e.x, y: e.y - 0.6, text: '⚡', farbe: '#ffe45a', t: 0.8 });
    }
  }
  // tick = Schaden über Zeit in kleinen Stücken (Gift, Dornen, brennender Boden) – ohne Mindestschaden
  if (!tick) dmg = Math.max(0.5, dmg);
  const wirkt = Math.min(dmg, Math.max(0, e.hp));   // für die Bilanz zählt nur, was wirklich Leben kostet (kein Überschaden)
  e.hp -= dmg;
  if (wirkt > 0) e.letzte = quelle;
  if (!tick) e.getroffen = 0.12;   // nur fürs Bild: kurz weiß aufblitzen
  // Schadenszahl nur bei großen Treffern und höchstens alle 0,4 s je Gegner (nur live, nur Bild)
  // Schadenszahlen nur für große Treffer – gemessen am Leben des Monsters (spät waren es sonst Knäuel aus Zahlen), höchstens 6 gleichzeitig
  if (N.live && !tick && dmg >= Math.max(12, e.max * 0.3) && !(e.zahlT > N.t) && N.fx.filter((f) => f.typ === 'text').length < 6) { e.zahlT = N.t + 0.4; N.fx.push({ typ: 'text', x: e.x + 0.2, y: e.y - 0.5, text: `-${Math.round(dmg)}`, farbe: dmg >= 30 ? '#ff8a4a' : '#ffe680', t: 0.8 }); }
  N.schaden[quelle] = (N.schaden[quelle] || 0) + wirkt;
  if (N.T.gift && !tick) e.gift = 3;
  if (N.T.entropie && e.hp > 0 && e.hp < e.max * N.T.entropie && !istBoss(e)) { N.schaden.entropie = (N.schaden.entropie || 0) + e.hp; e.hp = 0; }
}

// Stillstehen (Betäuben, Einfrieren). Bosse nur kurz; Eis-Resistenz verkürzt Einfrieren.
function betaeube(e, s, eis = false) {
  const g = GEGNER[e.g];
  s *= (g.boss && !e.stunVoll ? 0.3 : e.chef && !e.stunVoll ? 0.5 : 1) * (eis ? 1 - (g.res.eis || 0) / 100 : 1) * (g.flink ? 0.5 : 1);   // 🦊 flink: schüttelt Betäuben schneller ab
  e.stun = Math.max(e.stun, s);
}
function bremse(e, s) {
  const dauer = s.bremse * (1 - (GEGNER[e.g].res.eis || 0) / 100) * (1 + e.bremsPlus);
  e.bremsF = e.bremse > 0 ? Math.min(e.bremsF, s.bremsFaktor) : s.bremsFaktor;
  e.bremse = Math.max(e.bremse, dauer);
}

function schiesse(N, tw) {
  const s = turmWerte(tw), art = turmArt(tw), q = tw.quelle || (tw.burg ? 'held' : String(tw.slot));
  // Ziele: wer am nächsten am Tor ist zuerst
  const inReichweite = N.feinde.filter((e) => {
    const d = Math.hypot(e.x - tw.x, e.y - tw.y);
    return e.hp > 0 && d <= s.reich && d >= (s.mindest || 0) && (tw.burg || !imPortalNebel(e.x, e.y))   // Katapult: nicht zu nah; 🌫️ im Portal-Nebel nur Held
      && (tw.art !== 'katapult' || amBoden(e));   // 🦇 Katapult trifft Flieger nur am Boden
  }).sort((a, b) => a.rest - b.rest);
  // 🗿 Riesenwurf: lieber den Gegner mit dem meisten Leben
  if (s.riesen) inReichweite.sort((a, b) => b.hp - a.hp);
  const ziel = inReichweite[0];
  if (!ziel) return false;
  const typ = tw.burg ? 'pfeil' : tw.art;
  tw.schuss = (tw.schuss || 0) + 1;
  const jedes = (n) => n && tw.schuss % n === 0;
  if (typ === 'katapult') {
    // Je Stein ein anderes Ziel; Schaden in der Fläche um den Einschlag
    for (const z of inReichweite.slice(0, s.steine || 1)) {
      const dmg = s.dmg * (s.riesen && z.gross ? 3 : 1);
      for (const e of nahe(N, z.x, z.y, s.flaeche).filter(amBoden)) {
        treffe(N, e, dmg, art, q);
        if (s.stun) betaeube(e, s.stun);
      }
      if (s.feuer) N.feuer.push({ x: z.x, y: z.y, r: s.flaeche * 0.8, t: 2.5, dps: s.feuer, q });
      // 🌋 Lavastein und 🧱 Splitterstein
      if (s.lava) N.feuer.push({ x: z.x, y: z.y, r: s.flaeche, t: 4, dps: s.lava, bremse: 0.6, art: 'lava', q });
      if (s.splitterstein) for (const o of naechste(N, z, 2.2, s.splitterstein)) {
        for (const e of nahe(N, o.x, o.y, 0.6).filter(amBoden)) treffe(N, e, s.dmg / 2, art, q);
        N.fx.push({ typ: 'stein', x1: z.x, y1: z.y, x2: o.x, y2: o.y, t: 0.35, klein: true, warte: 0.15 });
      }
      N.fx.push({ typ: 'stein', x1: tw.x, y1: tw.y, x2: z.x, y2: z.y, t: 0.55 }, { typ: 'staub', x: z.x, y: z.y, r: s.flaeche, t: 1, warte: 0.45 },
        { typ: 'text', x: z.x, y: z.y - 0.4, text: `-${Math.round(dmg)}`, farbe: '#f0d090', t: 1.3, warte: 0.45 });
    }
  } else if (typ === 'kanone') {
    // 💣 Doppellauf: zwei Kugeln auf verschiedene Ziele
    const ziele = s.doppellauf ? [ziel, inReichweite.find((e) => Math.hypot(e.x - ziel.x, e.y - ziel.y) > s.flaeche) || inReichweite[1]].filter(Boolean) : [ziel];
    for (const z of ziele) {
      const knall = (x, y, r, dmg) => {
        for (const e of nahe(N, x, y, r)) {
          treffe(N, e, dmg, art, q);
          if (s.stun) betaeube(e, s.stun);
          // 🌬️ Rückstoß
          if (s.rueckstoss && !istBoss(e)) { e.d = Math.max(0, e.d - s.rueckstoss); e.unten = FLIEGER_UNTEN; }
        }
      };
      knall(z.x, z.y, s.flaeche, s.dmg);
      if (s.feuer) N.feuer.push({ x: z.x, y: z.y, r: s.flaeche * 0.8, t: 2.5, dps: s.feuer, q });
      // 🎇 Streukugel: kleine Bomben rund um den Einschlag
      if (s.streu) for (let i = 0; i < s.streu; i++) {
        const w = i * Math.PI * 2 / s.streu + tw.schuss, x = z.x + Math.cos(w) * s.flaeche * 1.2, y = z.y + Math.sin(w) * s.flaeche * 1.2;
        knall(x, y, s.flaeche * 0.6, s.dmg / 2);
        N.fx.push({ typ: 'boom', x, y, r: s.flaeche * 0.6, t: 0.4, warte: 0.35 });
      }
      N.fx.push({ typ: 'kugel', x1: tw.x, y1: tw.y, x2: z.x, y2: z.y, t: 0.25 }, { typ: 'boom', x: z.x, y: z.y, r: s.flaeche, t: 0.45, warte: 0.2 },
        { typ: 'text', x: z.x, y: z.y - 0.4, text: `-${Math.round(s.dmg)}`, farbe: '#ffb37a', t: 1, warte: 0.2 });
    }
  } else if (typ === 'pfeil') {
    // Held: Wucht (jeder n-te Angriff dreifach), Fluch (bremsen, mehr Schaden), Ranken (festhalten)
    const T = N.T, istHeld = tw === N.held, wucht = istHeld && T.held_wucht && tw.schuss % Math.max(2, T.held_wucht) === 0;
    const jedes = (n) => istHeld && n && tw.schuss % n === 0;
    // 🏹 Meisterschuss: jeder 8. Angriff trifft alle in Reichweite
    const meister = jedes(T.meisterschuss);
    if (meister) N.fx.push({ typ: 'text', x: tw.x - 0.6, y: tw.y - 0.8, text: '🏹 Meisterschuss!', farbe: '#ffd84a', t: 1 });
    let erster = true;
    const voll = s.volltreffer && tw.schuss % s.volltreffer === 0;   // 🎯 Volltreffer: jeder 4. Schuss vierfach
    for (const e of meister ? inReichweite : inReichweite.slice(0, s.pfeile || 1)) {
      const lebte = e.hp > 0;
      treffe(N, e, s.dmg * (wucht ? 3 : 1) * (voll ? 4 : 1), art, q, s.durchschlag);
      if (s.brandpfeil) brennen(e, 3, s.brandpfeil);   // 🔥 Brandpfeile
      if (voll) N.fx.push({ typ: 'text', x: e.x, y: e.y - 0.5, text: `🎯 ${Math.round(s.dmg * 4)}`, farbe: '#ffd84a', t: 0.9 });
      // 🎱 Abpraller: noch ein zweiter Gegner
      if (s.abpraller) {
        const o = naechste(N, e, 2.2, 1)[0];
        if (o) { treffe(N, o, s.dmg, art, q, s.durchschlag); N.fx.push({ typ: 'pfeil', x1: e.x, y1: e.y, x2: o.x, y2: o.y, t: 0.2, warte: 0.1 }); }
      }
      if (istHeld) {
        heldTreffer(N, tw, e, s, erster);
        erster = false;
        // 🐺 Gewitterjagd: verpufft der Gegner, springt ein Blitz weiter
        if (T.gewitterjagd && lebte && e.hp <= 0) {
          const weiter = naechste(N, e, 3, 3);
          for (const o of weiter) treffe(N, o, T.gewitterjagd, 'blitz', 'jagd');
          if (weiter.length) { N.fx.push({ typ: 'blitz', punkte: [{ x: e.x, y: e.y }, ...weiter.map((o) => ({ x: o.x, y: o.y }))], t: 0.3 }); kombo(N, 'jagd', e.x, e.y, 6); }
        }
        if (T.held_bremse) { bremse(e, { bremse: T.held_bremse, bremsFaktor: T.held_bremse_stark ? 0.3 : T.eisfluch ? 0.4 : 0.6 }); e.fluch = Math.max(e.fluch || 0, T.held_bremse); }
        // Kombos am Grundangriff: 🌨️ Frostpfeile, 🌠 Glutpfeile, 🌟 Blitzpfeile, 🗼 Wachposten
        if (T.frostpfeile) { bremse(e, { bremse: T.frostpfeile, bremsFaktor: 0.7 }); kombo(N, 'frostpfeile', e.x, e.y, 12); }
        if (T.glutpfeile && tw.schuss % T.glutpfeile === 0) {
          N.feuer.push({ x: e.x, y: e.y, r: 0.6, t: 2, dps: 3, q: 'glut' });
          kombo(N, 'glut', e.x, e.y, 6);
        }
        if (T.blitzpfeile && tw.schuss % T.blitzpfeile === 0) {
          const nah = N.feinde.filter((o) => o !== e && o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) <= 2.2)
            .sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y)).slice(0, 2);
          for (const o of nah) treffe(N, o, s.dmg, 'blitz', 'blitzpfeile');
          if (nah.length) { N.fx.push({ typ: 'blitz', punkte: [{ x: e.x, y: e.y }, ...nah.map((o) => ({ x: o.x, y: o.y }))], t: 0.25 }); kombo(N, 'blitzpfeile', e.x, e.y, 6); }
        }
        if (T.wachposten && N.schild > 0) kombo(N, 'wachposten', tw.x - 1, tw.y + 0.6, 15);
        if (T.held_stun) betaeube(e, T.held_stun);
        if (wucht && T.held_wucht_stun) betaeube(e, T.held_wucht_stun);
        if (wucht) N.fx.push({ typ: 'text', x: e.x, y: e.y - 0.4, text: `💥 ${Math.round(s.dmg * 3)}`, farbe: '#ffd84a', t: 0.9 });
        // 🌬️ Wegpusten: verfluchte, schwache Gegner verschwinden sofort
        if (T.hinrichtung && e.fluch > 0 && e.hp > 0 && e.hp < e.max * T.hinrichtung && !istBoss(e)) {
          N.schaden.hinrichtung = (N.schaden.hinrichtung || 0) + e.hp; e.hp = 0;
          kombo(N, 'wegpusten', e.x, e.y);
        }
      }
      N.fx.push({ typ: tw.burg ? 'magie' : 'pfeil', x1: tw.x, y1: tw.y, x2: e.x, y2: e.y, t: 0.25, gross: wucht });
    }
  } else if (typ === 'wind') {
    // 🌪️ Sturmturm: eine Böe um das Ziel (🌬️ Sturmfront: alle in Reichweite) pustet zurück – je Monster höchstens s.stoesse-mal
    const ziele = s.front ? inReichweite : nahe(N, ziel.x, ziel.y, s.flaeche).filter((e) => !imPortalNebel(e.x, e.y));
    for (const e of ziele) {
      treffe(N, e, s.dmg, art, q);
      if (!istBoss(e) && (e.gepustet || 0) < s.stoesse) { e.gepustet = (e.gepustet || 0) + 1; e.d = Math.max(0, e.d - s.rueckstoss); e.unten = FLIEGER_UNTEN; }
      else if (fliegt(e)) e.unten = FLIEGER_UNTEN;   // 🌪️ der Wind drückt Flieger auch ohne Rückstoß kurz zu Boden
      if (s.stun) betaeube(e, s.stun);
      if (s.bremse) bremse(e, s);
    }
    N.fx.push({ typ: 'frostring', x: ziel.x, y: ziel.y, r: s.front ? 1.2 : s.flaeche, t: 0.5, farbe: '225, 255, 235' });
  } else if (typ === 'blitz') {
    // 🔋 Riesenblitz (jeder 5. Schuss), ♾️ Endloskette (doppelt so weit, doppelt so viele)
    const riese = jedes(s.riesenblitz), kette = (s.kette + (riese ? 3 : 0)) * (s.endlos ? 2 : 1), mal = riese ? 3 : 1;
    const getroffen = [ziel];
    let letzt = ziel;
    while (getroffen.length < kette) {
      let nah = null, nd = (N.T.supra ? 2.7 : 1.8) * (s.endlos ? 2 : 1);
      for (const e of N.feinde) {
        const d = Math.hypot(e.x - letzt.x, e.y - letzt.y);
        if (e.hp > 0 && !getroffen.includes(e) && d < nd) { nah = e; nd = d; }
      }
      if (!nah) break;
      getroffen.push(nah); letzt = nah;
    }
    getroffen.forEach((e, i) => {
      treffe(N, e, s.dmg * mal * (i === 0 && s.ersterDoppelt ? 3 : 1), art, q);
      if (fliegt(e)) e.unten = Math.max(e.unten || 0, BLITZ_UNTEN);   // 🌩️ der Schlag holt Flieger kurz herunter
      if (s.stun) betaeube(e, s.stun);
      if (s.magnet) bremse(e, { bremse: s.magnet, bremsFaktor: 0.5 });   // 🧲 Magnetfeld
    });
    if (riese) N.fx.push({ typ: 'text', x: ziel.x, y: ziel.y - 0.6, text: '🔋 Riesenblitz!', farbe: '#ffe45a', t: 1 });
    N.fx.push({ typ: 'blitz', punkte: [{ x: tw.x, y: tw.y }, ...getroffen.map((e) => ({ x: e.x, y: e.y }))], t: riese ? 0.4 : 0.2, dick: riese });
  } else {
    // Eis (🌨️ Schneesturm: mehrere Ziele)
    for (const z of inReichweite.slice(0, s.eisziele || 1)) {
      treffe(N, z, s.dmg, art, q);
      const ziele = s.eisfeld ? nahe(N, z.x, z.y, s.eisfeld) : [z];
      for (const e of ziele) {
        bremse(e, s);
        if (fliegt(e)) e.unten = Math.max(e.unten || 0, EIS_UNTEN);   // 🧊 vereiste Flügel: Flieger sinken kurz zu Boden (Katapult und Wache erreichen sie)
        if (s.sproede) { e.sproede = s.sproede; e.sproedeT = 3; }   // 💔 Sprödes Eis
      }
      if (s.frierJedes && tw.schuss % s.frierJedes === 0) { betaeube(z, 1.2, true); z.eis = true; }
      if (s.eisfeld) N.fx.push({ typ: 'frostring', x: z.x, y: z.y, r: s.eisfeld, t: 0.6 });
      N.fx.push({ typ, x1: tw.x, y1: tw.y, x2: z.x, y2: z.y, t: 0.22 });
    }
    // ❄️ Frostnova: jeder 4. Schuss friert alle ums Ziel ein
    if (jedes(s.nova)) {
      for (const e of nahe(N, ziel.x, ziel.y, 1.4)) { betaeube(e, 1, true); e.eis = true; }
      N.fx.push({ typ: 'frostring', x: ziel.x, y: ziel.y, r: 1.4, t: 0.7 });
    }
  }
  return true;
}

// 👑 Turm-Fähigkeiten mit Abklingzeit: Pfeilsturm, Eisgefängnis, Gewittersturm. Mit 🤖 Auto wirken sie, sobald sie
// bereit sind; sonst wartet der Turm, bis man den Knopf über ihm antippt (turmVonHand).
const TURM_FAEHIG = { pfeilsturm: ['⛈️', 'Pfeilsturm'], gefaengnis: ['🧊', 'Eisgefängnis'], sturm: ['🌩️', 'Gewittersturm'], beben: ['🌍', 'Erdbeben'], feuermeer: ['🔥', 'Feuermeer'], tornado: ['🌪️', 'Tornado'] };
const turmFaehigArt = (tw) => !tw.burg && Object.keys(TURM_FAEHIG).find((k) => tw.w[k]);
function turmSchritt(N, tw) {
  const art = turmFaehigArt(tw);
  if (!art) return;
  if (tw.uhr === undefined) tw.uhr = turmCd(N, tw, art);
  if (tw.uhr > 0) { tw.uhr -= DT; return; }
  if (autoAn(N, 't' + tw.slot) && turmFaehig(N, tw)) tw.uhr = turmCd(N, tw, art);
}
// 🛠️ Meisterwerkstatt (großer Knoten): Turm-Fähigkeiten schneller bereit
const turmCd = (N, tw, art) => tw.w[art] * (1 - Math.min(0.6, N.T.turm_cd || 0));
function turmVonHand(N, tw) {
  const art = turmFaehigArt(tw);
  if (!art || tw.uhr > 0 || !turmFaehig(N, tw)) return false;
  tw.uhr = turmCd(N, tw, art);
  return true;
}
// Die Fähigkeit wirken lassen; false = gerade kein Ziel
function turmFaehig(N, tw) {
  const s = tw.w;
  const inReich = nahe(N, tw.x, tw.y, s.reich);
  if (s.pfeilsturm) {
    const e = groessteGruppe(N, 1.5, (o) => !inReich.includes(o));
    if (!e) return false;
    for (const o of nahe(N, e.x, e.y, 1.5)) treffe(N, o, s.dmg * 4, 'pfeil', String(tw.slot), s.durchschlag);
    N.fx.push({ typ: 'regen', x: e.x, y: e.y, r: 1.5, n: 24, gold: true, t: 1.0 });
  } else if (s.gefaengnis) {
    const e = inReich.sort((a, b) => b.hp - a.hp)[0];
    if (!e) return false;
    betaeube(e, 2.5, true); e.eis = true;
    N.fx.push({ typ: 'eisblock', x: e.x, y: e.y, r: 0.7, t: 2.5 });
  } else if (s.beben || s.feuermeer) {
    // 🌍 Erdbeben (Katapult) und 🔥 Feuermeer (Kanone): um die größte Gruppe in Reichweite (Katapult: nicht zu nah)
    const e = groessteGruppe(N, 1.5, (o) => !inReich.includes(o) || Math.hypot(o.x - tw.x, o.y - tw.y) < (s.mindest || 0) || !amBoden(o));
    if (!e) return false;
    if (s.beben) {
      for (const o of nahe(N, e.x, e.y, 2.5).filter(amBoden)) { betaeube(o, 1.5); treffe(N, o, s.dmg, 'stein', String(tw.slot)); }
      N.fx.push({ typ: 'beben', x: e.x, y: e.y, r: 2.5, t: 1.1 });
    } else {
      N.feuer.push({ x: e.x, y: e.y, r: 2, t: 5, dps: s.feuermeer, q: String(tw.slot) });
      N.fx.push({ typ: 'boom', x: e.x, y: e.y, r: 2, t: 0.6 });
    }
  } else if (s.tornado) {
    // 🌪️ Tornado (Sturmturm): wirft die größte Gruppe zurück, Anführer und Bosse halb so weit
    const e = groessteGruppe(N, 2, (o) => !inReich.includes(o) || imPortalNebel(o.x, o.y));
    if (!e) return false;
    for (const o of nahe(N, e.x, e.y, 2)) {
      if (imPortalNebel(o.x, o.y)) continue;
      o.d = Math.max(0, o.d - (istBoss(o) ? 1.25 : 2.5)); betaeube(o, 0.5); o.unten = FLIEGER_UNTEN;
      treffe(N, o, s.dmg * 2, 'wind', String(tw.slot));
    }
    N.fx.push({ typ: 'frostring', x: e.x, y: e.y, r: 2, t: 0.9, farbe: '210, 255, 230' }, { typ: 'text', x: e.x, y: e.y - 0.7, text: '🌪️ Tornado!', farbe: '#dfffe8', t: 1 });
  } else if (s.sturm) {
    const ziele = N.feinde.filter((e) => e.hp > 0).sort((a, b) => a.rest - b.rest).slice(0, 5);
    if (!ziele.length) return false;
    ziele.forEach((e, i) => {
      treffe(N, e, s.dmg * 3, 'blitz', String(tw.slot));
      N.fx.push({ typ: 'wolke', x: e.x, y: e.y, t: 0.9 + i * 0.12, warte: i * 0.12 });
    });
  }
  return true;
}

// Fähigkeiten und Dreier-Kombos am Treffer des Helden. erster = erstes Ziel dieses Angriffs (für „jeder n-te Angriff“)
function heldTreffer(N, tw, e, s, erster) {
  const T = N.T, jedes = (n) => erster && n && tw.schuss % n === 0;
  // 🔋 Aufladen: der Kettenblitz ist schneller wieder bereit
  if (T.kb_laden) { const z = N.zauber.find((o) => o.name === 'kettenblitz'); if (z) z.t -= T.kb_laden; }
  // 🔋 Aufladen (großer Knoten): jeder Treffer lädt alle Zauber auf
  if (T.laden) for (const z of N.zauber) z.t -= T.laden;
  // 🪶 Splitterpfeile: 2 Splitter auf Gegner dahinter
  if (T.splitpfeil && erster) for (const o of naechste(N, e, 2, 2)) {
    treffe(N, o, s.dmg * T.splitpfeil, 'magie', 'splitterpfeil');
    N.fx.push({ typ: 'magie', x1: e.x, y1: e.y, x2: o.x, y2: o.y, t: 0.2 });
  }
  // 🎱 Querschläger: jeder 3. Treffer prallt ab
  if (jedes(T.querschlag)) {
    const o = naechste(N, e, 2.5, 1)[0];
    if (o) { treffe(N, o, s.dmg, 'magie', 'querschlag'); N.fx.push({ typ: 'magie', x1: e.x, y1: e.y, x2: o.x, y2: o.y, t: 0.25, gross: true }); }
  }
  // 🌗 Glut und Reif: abwechselnd Feuer- und Eispfeil
  if (T.wechselpfeile) {
    if (tw.schuss % 2) brennen(e, 3, 3); else { betaeube(e, 0.4, true); e.eis = true; }
    kombo(N, 'wechsel', e.x, e.y, 10);
  }
  // 🧯 Brandmauer und 🏔️ Eisfestung: solange ein Schild liegt
  if (N.schild > 0 && T.brandmauer) { brennen(e, 3, T.brandmauer); kombo(N, 'brandmauer', e.x, e.y, 10); }
  if (N.schild > 0 && T.eisfestung) { betaeube(e, T.eisfestung, true); e.eis = true; kombo(N, 'eisfestung', e.x, e.y, 10); }
  // 🌙 Mondpfeil: friert alle um das Ziel ein und verflucht sie
  if (jedes(T.mondpfeil)) {
    for (const o of nahe(N, e.x, e.y, 1.5)) { betaeube(o, 0.8, true); o.eis = true; o.fluch = Math.max(o.fluch || 0, 3); }
    N.fx.push({ typ: 'frostring', x: e.x, y: e.y, r: 1.5, t: 0.7, farbe: '200, 190, 255' });
    kombo(N, 'mond', e.x, e.y);
  }
  // 🔦 Polarstrahl: alle Gegner auf der Linie vom Helden durch das Ziel
  if (jedes(T.polarstrahl)) {
    const dx = e.x - tw.x, dy = e.y - tw.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, weit = tw.w.reich + 2;
    for (const o of N.feinde) {
      const px = o.x - tw.x, py = o.y - tw.y, entlang = px * ux + py * uy;
      if (o.hp > 0 && entlang > 0 && entlang < weit && Math.abs(px * uy - py * ux) < 0.6) { treffe(N, o, 10, 'eis', 'polarstrahl'); betaeube(o, 0.6, true); o.eis = true; }
    }
    N.fx.push({ typ: 'blitz', punkte: [{ x: tw.x, y: tw.y }, { x: tw.x + ux * weit, y: tw.y + uy * weit }], t: 0.4, dick: true, eis: true });
    kombo(N, 'polarstrahl', e.x, e.y);
  }
  // 🎆 Feuerwerk: Rakete mit Explosion und Blitzen
  if (jedes(T.feuerwerk)) {
    for (const o of nahe(N, e.x, e.y, 1.5)) treffe(N, o, 15, 'feuer', 'feuerwerk');
    const weiter = naechste(N, e, 3.5, 3);
    for (const o of weiter) treffe(N, o, 10, 'blitz', 'feuerwerk');
    N.fx.push({ typ: 'boom', x: e.x, y: e.y, r: 1.5, t: 0.5, farbe: '255, 120, 220' });
    if (weiter.length) N.fx.push({ typ: 'blitz', punkte: [{ x: e.x, y: e.y }, ...weiter.map((o) => ({ x: o.x, y: o.y }))], t: 0.35 });
    kombo(N, 'donnerpfeil', e.x, e.y);
  }
}

// Wenn ein Gegner verpufft: Ansteckender Fluch, Glücksfunke (in nachtSchritt), Eisblume, Flammenkrone, Schattengewitter
function sterbeEffekte(N, e) {
  const T = N.T;
  if (T.fluch_spring && e.fluch > 0) {
    const weiter = naechste(N, e, 2.5, T.fluch_spring);
    for (const o of weiter) { o.fluch = Math.max(o.fluch || 0, 3); N.fx.push({ typ: 'magie', x1: e.x, y1: e.y, x2: o.x, y2: o.y, t: 0.3 }); }
  }
  if (T.eisblume && (e.bremse > 0 || (e.eis && e.stun > 0))) {
    for (const o of nahe(N, e.x, e.y, 1.2, e)) { betaeube(o, T.eisblume, true); o.eis = true; }
    N.fx.push({ typ: 'frostring', x: e.x, y: e.y, r: 1.2, t: 0.6 }, { typ: 'text', x: e.x, y: e.y - 0.3, text: '🌸', farbe: '#fff', t: 0.9 });
  }
  if (T.brand_spring && e.brand > 0) {
    const o = naechste(N, e, 2.5, 1)[0];
    if (o) { brennen(o, 3, Math.max(3, e.brandDps)); N.fx.push({ typ: 'magie', x1: e.x, y1: e.y, x2: o.x, y2: o.y, t: 0.3, gross: true }); }
  }
  if (T.schattengewitter && e.fluch > 0) {
    const weiter = naechste(N, e, 3, 2);
    for (const o of weiter) treffe(N, o, T.schattengewitter, 'blitz', 'schattengewitter');
    N.feuer.push({ x: e.x, y: e.y, r: 0.6, t: 2, dps: 3, q: 'schattengewitter' });
    if (weiter.length) { N.fx.push({ typ: 'blitz', punkte: [{ x: e.x, y: e.y }, ...weiter.map((o) => ({ x: o.x, y: o.y }))], t: 0.3 }); kombo(N, 'schattengewitter', e.x, e.y, 6); }
  }
}

// Fähigkeiten und Kombos, die regelmäßig von selbst wirken (Feuer am Gegner, Vulkan, Gletscher, Phönix …)
function talentSchritt(N) {
  const T = N.T, lebend = () => N.feinde.filter((e) => e.hp > 0), tor = () => lebend().sort((a, b) => a.rest - b.rest);
  // 🔥 Brennende Gegner
  for (const e of N.feinde) if (e.brand > 0 && e.hp > 0) {
    e.brand -= DT;
    treffe(N, e, e.brandDps * DT, 'feuer', 'brand', false, true);
    if (e.brand <= 0) e.brandDps = 0;
  }
  if (T.vulkan && T.zauber.includes('feuerball') && !T.eremit) alle(N, 'vulkan', T.vulkan, () => {
    if (!lebend().length) return false;
    feuerwurf(N, { gross: 2 });
    N.fx.push({ typ: 'text', x: HELD.x - 1, y: HELD.y - 1, text: '🌋 Vulkan!', farbe: '#ff8a3a', t: 1.2 });
  });
  if (T.gletscher) alle(N, 'gletscher', 12, () => {
    const e = tor()[0];
    if (!e) return false;
    betaeube(e, T.gletscher, true); e.eis = true;
    N.fx.push({ typ: 'eisblock', x: e.x, y: e.y, r: 0.75, t: T.gletscher });
  });
  if (T.wolke) alle(N, 'wolke', 10, () => {
    const e = lebend().sort((a, b) => b.hp - a.hp)[0];
    if (!e) return false;
    treffe(N, e, T.wolke, 'blitz', 'wolke');
    N.fx.push({ typ: 'wolke', x: e.x, y: e.y, t: 1.0 });
  });
  if (T.glocke) alle(N, 'glocke', 15, () => {
    const nah = nahe(N, BURG.tor.x, BURG.y, 4.5);
    if (!nah.length) return false;
    for (const e of nah) betaeube(e, T.glocke);
    N.fx.push({ typ: 'glocke', x: BURG.tor.x, y: BURG.y, r: 4.5, t: 1.2 });
  });
  if (T.pfeilregen) alle(N, 'pfeilregen', 10, () => {
    const e = groessteGruppe(N, 1.5);
    if (!e) return false;
    for (const o of nahe(N, e.x, e.y, 1.5)) treffe(N, o, T.pfeilregen, 'pfeil', 'pfeilregen', true);
    N.fx.push({ typ: 'regen', x: e.x, y: e.y, r: 1.5, n: 16, t: 0.9 });
  });
  if (T.schattenhand) alle(N, 'schattenhand', 6, () => {
    const e = lebend().sort((a, b) => b.hp - a.hp)[0];
    if (!e) return false;
    e.fluch = Math.max(e.fluch || 0, T.schattenhand);
    N.fx.push({ typ: 'text', x: e.x, y: e.y - 0.7, text: '✋', farbe: '#fff', t: 1 });
  });
  if (T.schattenloch) alle(N, 'schattenloch', 12, () => {
    const nah = nahe(N, BURG.tor.x - 1.5, BURG.y, 1.6);
    if (!nah.length) return false;
    for (const e of nah) betaeube(e, T.schattenloch);
    N.fx.push({ typ: 'loch', x: BURG.tor.x - 1.5, y: BURG.y, r: 1.6, t: T.schattenloch });
  });
  // --- Dreier-Kombos, die von selbst wirken ---
  if (T.elementar && !T.eremit) alle(N, 'elementar', T.elementar, () => {
    if (!lebend().length) return false;
    let wirkt = false;
    for (const z of ['feuerball', 'eiswelle', 'kettenblitz']) if (zaubere(N, z)) wirkt = true;
    if (wirkt) kombo(N, 'elementar', HELD.x - 2, HELD.y);
    return wirkt;
  });
  if (T.irrlicht) alle(N, 'irrlicht', 8, () => {
    const ziele = lebend().sort((a, b) => (b.fluch > 0) - (a.fluch > 0) || a.rest - b.rest).slice(0, 3);
    if (!ziele.length) return false;
    for (const e of ziele) {
      treffe(N, e, T.irrlicht, 'magie', 'irrlicht');
      bremse(e, { bremse: 2, bremsFaktor: 0.5 }); e.fluch = Math.max(e.fluch || 0, 2);
      N.fx.push({ typ: 'flug', ico: '🔮', x1: HELD.x, y1: HELD.y, x2: e.x, y2: e.y, t: 0.7, farbe: ['#9fd8ff', '#ffb070'] });
    }
    kombo(N, 'irrlicht', ziele[0].x, ziele[0].y);
  });
  if (T.stern) alle(N, 'stern', 10, () => {
    const ziele = tor().slice(0, 3);
    if (!ziele.length) return false;
    ziele.forEach((e, i) => {
      for (const o of nahe(N, e.x, e.y, 0.8)) treffe(N, o, T.stern, 'feuer', 'stern');
      N.feuer.push({ x: e.x, y: e.y, r: 0.6, t: 2, dps: 3, q: 'stern' });
      N.fx.push({ typ: 'flug', ico: '🌠', x1: e.x + 2.5, y1: -1, x2: e.x, y2: e.y, t: 0.5 + i * 0.1, farbe: ['#fff6c0', '#ffd84a'] });
    });
    kombo(N, 'stern', ziele[0].x, ziele[0].y);
  });
  if (T.phoenix) alle(N, 'phoenix', 20, () => {
    const e = groessteGruppe(N, 1);
    if (!e) return false;
    for (const o of lebend()) if (Math.abs(o.y - e.y) < 1) { treffe(N, o, T.phoenix, 'feuer', 'phoenix'); brennen(o, 3, 3); o.fluch = Math.max(o.fluch || 0, 3); }
    N.fx.push({ typ: 'flug', ico: '🕊️', x1: BURG.tor.x, y1: e.y, x2: -1, y2: e.y, t: 1.2, gross: true, farbe: ['#ffd84a', '#ff7a3a', '#ff4a2a'] });
    kombo(N, 'phoenix', e.x, e.y);
  });
  if (T.polarlicht) alle(N, 'polarlicht', T.polarlicht, () => {
    if (!lebend().length) return false;
    for (const e of lebend()) { betaeube(e, 1.5); e.fluch = Math.max(e.fluch || 0, 2); }
    N.fx.push({ typ: 'licht', t: 0.6 });
    kombo(N, 'polarlicht', lebend()[0].x, lebend()[0].y);
  });
  if (T.nebel) alle(N, 'nebel', T.nebel, () => {
    if (!nahe(N, BURG.tor.x - 2, BURG.y, 3).length) return false;
    N.feuer.push({ x: BURG.tor.x - 2, y: BURG.y, r: 2.2, t: 4, dps: 0, bremse: 0.2, fluch: true, art: 'nebel', q: 'nebel' });
    kombo(N, 'nebel', BURG.tor.x - 2, BURG.y);
  });
  if (T.ableiter) alle(N, 'ableiter', 8, () => {
    let wirkt = false;
    for (const tw of N.tuerme) {
      if (tw === N.held) continue;
      const e = nahe(N, tw.x, tw.y, tw.w.reich + 1).sort((a, b) => a.rest - b.rest)[0];
      if (!e) continue;
      wirkt = true;
      treffe(N, e, T.ableiter, 'blitz', 'ableiter');
      N.fx.push({ typ: 'blitz', punkte: [{ x: tw.x, y: tw.y - 0.5 }, { x: e.x, y: e.y }], t: 0.3 });
    }
    if (!wirkt) return false;
    kombo(N, 'ableiter', N.held.x - 2, N.held.y);
  });
}

// Einen Gegner auf den Weg schicken (weg = Portal-Weg oder eigener Weg, z. B. für Minischleime)
// chef = 👑 Anführer: viel mehr Leben, etwas langsamer, dreifacher Torschaden, sechsfache XP
function feindNeu(N, art, weg, mehr = 1, chef = false) {
  const g = GEGNER[art], T = N.T, gross = chef || istGross(art), id = ++N.nr;
  // 🦇 Flieger nehmen die Luftlinie, kleine Flinke laufen querfeldein (nur vom Portal aus; Brut und Minischleime haben schon eigene Wege)
  if (weg.weg && weg.id !== 'brut' && weg.weg.length > 3 && !chef) weg = g.fliegt ? flugWeg(weg, id) : g.quer ? querWeg(weg, id) : weg;
  const hp = Math.round((chef ? CHEF_LEBEN(art) : g.hp) * mehr * (gross ? 1 - Math.min(0.6, T.boss_hp || 0) : 1));
  const e = { id, g: art, p: weg, hp, max: hp, d: 0, x: weg.weg[0][0], y: weg.weg[0][1], rest: 99, bremse: 0, bremsF: 1, stun: 0, rechts: true,
    gross, chef, stunVoll: !!T.boss_stun, bremsPlus: T.brems_dauer || 0, mehr, markiert: !!N.spaeher && (gross || g.hp >= SPAEHER_AB) };
  // 🛡️ Turmschild ab der ersten Endlosnacht (nicht für die kleine Brut der Bosse)
  const k = N.n - KAMPAGNE;
  e.turmschild = k >= 2 && weg.id !== 'brut' && (chef || id % turmschildJedes(k) === 0);
  N.feinde.push(e);
  if (chef) N.fx.push({ typ: 'ansage', t: 2.2, text: `👑 ${CHEF[art]}!` });
  // 👾 Neues Monster (nur live): Karte im Monsterbuch, sobald gerade keine andere offen ist (nachtFrame)
  // (Minischleime gehören zum Schleim – dessen Karte erklärt sie schon, keine zweite Karte direkt hinterher)
  // Monsterkarte nur beim ersten Mal je Spieler (Durchlauf: in Burg 10 kamen Ratte, Wolf … noch einmal); im Monsterbuch der Burg steht es trotzdem
  if (N.live && !(P.monster ||= []).includes(art)) {
    P.monster.push(art); speichern();
    const kennt = (PROFIL.monster ||= []).includes(art);
    if (!kennt) { PROFIL.monster.push(art); profilSpeichern(); }
    if (art !== 'minischleim' && !kennt) (N.neueMonster ||= []).push(art);
  }
  return e;
}
const istBoss = (e) => GEGNER[e.g].boss || e.chef;   // lässt sich nicht wegpusten, kaum betäuben
// 👑 Dicke Bosse (Anführer, Trolle, Drachen) spucken immer wieder kleine Monster aus, die querfeldein aufs Tor rennen
const BRUT = { chef: { alle: 5, art: 'ratte', n: 2 }, troll: { alle: 7, art: 'minischleim', n: 2 }, drache: { alle: 4, art: 'wolf', n: 2 } };
function brutSchritt(N) {
  for (const e of N.feinde.slice()) {
    const b = e.chef ? BRUT.chef : BRUT[e.g];
    if (!b || e.hp <= 0 || e.stun > 0) continue;
    if ((e.brut ??= b.alle * 0.6) > 0) { e.brut -= DT; continue; }
    e.brut = b.alle;
    for (let i = 0; i < b.n; i++) {
      const seite = (i - (b.n - 1) / 2) * 0.6, weg = [[e.x, e.y], [BURG.tor.x - 1.2, BURG.y + seite * 0.5], [BURG.tor.x, BURG.y]];
      let len = 0; for (let j = 1; j < weg.length; j++) len += Math.hypot(weg[j][0] - weg[j - 1][0], weg[j][1] - weg[j - 1][1]);
      feindNeu(N, b.art, { id: 'brut', name: 'Brut', weg, len }, (e.mehr || 1) * 0.7);
    }
    N.fx.push({ typ: 'boom', x: e.x, y: e.y, r: 0.6, t: 0.4, farbe: '200, 120, 255' });
  }
}

function nachtSchritt(N) {
  if (N.ende) return;
  N.t += DT;
  N.wt += DT;
  while (N.si < N.spawns.length && N.spawns[N.si].t <= N.wt) {
    const s = N.spawns[N.si++], g = GEGNER[s.g];
    feindNeu(N, s.g, portal(s.p), s.mehr, s.chef);   // alle folgen dem Weg (querfeldein nur die Kleinen, die ein Boss ausspuckt)
  }
  wacheSchritt(N);
  // Felder am Boden: brennender Boden, Schnee und Nebel (bremse = Tempo darin, fluch = verflucht)
  for (const f of N.feuer) {
    f.t -= DT;
    for (const e of N.feinde) {
      if (e.hp <= 0 || Math.hypot(e.x - f.x, e.y - f.y) > f.r || !amBoden(e)) continue;   // 🦇 Boden-Felder erreichen Flieger nicht
      if (f.dps) treffe(N, e, f.dps * DT, 'feuer', f.q, false, true);
      if (f.bremse) bremse(e, { bremse: 0.3, bremsFaktor: f.bremse });
      if (f.fluch) e.fluch = Math.max(e.fluch || 0, 0.5);
    }
  }
  N.feuer = N.feuer.filter((f) => f.t > 0);
  for (const e of N.feinde) {
    // 👑 Anführer stapfen langsamer (0,6): groß und schwer – so haben die Türme Zeit (der Leitwolf rannte sonst fast immer durchs Tor)
    let v = GEGNER[e.g].tempo * (e.chef ? 0.6 : 1) * (1 - Math.min(0.5, N.T.gegner_tempo || 0));
    // 🐉 Spieltest 2026-11-13: der Drache kam in jeder Drachennacht ans Tor. Jetzt wird er mit jedem Treffer müder:
    // bei vollem Leben volles Tempo, fast besiegt nur noch DRACHE_MUEDE davon (die Türme haben so mehr Zeit für ihn).
    if (e.g === 'drache') v *= DRACHE_MUEDE + (1 - DRACHE_MUEDE) * Math.max(0, e.hp / e.max);
    if (e.bremse > 0) { e.bremse -= DT; v *= e.bremsF; }
    if (e.unten > 0) e.unten -= DT;
    if (e.stun > 0) { e.stun -= DT; v = 0; } else e.eis = false;
    // von einem Soldaten festgehalten?
    if (e.gehalten && e.gehalten.ziel === e && e.gehalten.tot <= 0 && Math.hypot(e.gehalten.x - e.x, e.gehalten.y - e.y) < 0.7) v = 0;
    // 😵 Verwirrung: wer neu verflucht wird, läuft kurz rückwärts
    if (N.T.verwirrt && e.fluch > 0 && !e.warFluch && !istBoss(e)) e.rueck = N.T.verwirrt;
    e.warFluch = e.fluch > 0;
    if (e.rueck > 0) { e.rueck -= DT; v = -Math.abs(v) * 0.8; }
    e.d = Math.max(0, e.d + v * DT);
    const pt = wegPunkt(e.p, e.d), vor = wegPunkt(e.p, e.d + 0.05);
    // etwas seitlich versetzt (fest je Gegner), damit nicht alle genau auf einer Linie laufen
    // 🦊 Füchse nutzen die ganze Wegbreite und mehr (laufen weit verteilt)
    const dl = Math.hypot(vor.x - pt.x, vor.y - pt.y) || 1, quer = ((((e.id * 37) % 5) - 2) * (GEGNER[e.g].flink ? 0.22 : 0.11)) * Math.min(1, e.d, e.p.len - e.d);
    const nx = pt.x - ((vor.y - pt.y) / dl) * quer, ny = pt.y + ((vor.x - pt.x) / dl) * quer;
    if (Math.abs(nx - e.x) > 0.001) e.rechts = nx > e.x;   // Blickrichtung fürs Bild
    e.x = nx; e.y = ny; e.rest = e.p.len - e.d;
    // ⚠️ Anführer und Bosse kurz vor dem Tor: einmal warnen (Spieltest: die Niederlage kam sonst „aus dem Nichts“)
    if (N.live && !e.gewarnt && (e.chef || GEGNER[e.g].boss) && e.rest < 4 && e.hp > 0) {
      e.gewarnt = true;
      N.fx.push({ typ: 'ansage', t: 2.2, text: `⚠️ ${e.chef ? '👑 ' + CHEF[e.g] : GEGNER[e.g].name} ist gleich am Tor!` });
    }
    if (e.rest <= 0 && e.hp > 0) {
      let dmg = Math.max(1, GEGNER[e.g].schaden * (e.chef ? 3 : 1) - (N.T.tor_schutz || 0));
      // Spieltest 2026-11-13: Drache/Anführer am Tor = −12 bis −15 bei 12–18 Mauer → jede 4. Nacht Alles-oder-nichts.
      // Ein einzelner Boss nimmt höchstens BOSS_TOR_ANTEIL der Mauer – verlieren geht nur, wenn noch mehr durchkommt.
      if (e.chef || GEGNER[e.g].boss) dmg = Math.min(dmg, Math.max(2, Math.ceil(N.max * BOSS_TOR_ANTEIL)));
      e.amTor = true;
      mauerTreffer(N, dmg, e);
      N.wackeln = 0.3;
      // 🚪 Durchgebrochen: das Monster rennt sichtbar ins Tor (statt einfach zu verschwinden), große Monster mit Ansage
      const name = e.chef ? CHEF[e.g] : GEGNER[e.g].name;
      (N.durch ||= []).push({ name, dmg, chef: e.chef, g: e.g });
      N.fx.push({ typ: 'tor', t: 0.4 }, { typ: 'text', x: BURG.tor.x + 0.3, y: BURG.y - 0.6, text: `-${dmg} 🧱`, farbe: '#ff6b6b', t: 1 },
        { typ: 'durch', g: e.g, x: e.x, y: e.y, chef: e.chef, t: 0.7 });
      if (e.chef || istGross(e.g)) N.fx.push({ typ: 'ansage', t: 2.4, text: `🚪 ${e.chef ? '👑 ' : ''}${name} bricht durchs Tor! −${dmg} 🧱` });
    }
  }
  if (N.wackeln > 0) N.wackeln -= DT;
  const T = N.T, h = N.held;
  for (const e of N.feinde) {
    if (e.getroffen > 0) e.getroffen -= DT;
    if (e.sproedeT > 0) e.sproedeT -= DT;
    // 🌑 Ewige Nacht: alles in Reichweite des Helden ist verflucht
    if (T.nacht_aura && e.hp > 0 && Math.hypot(e.x - h.x, e.y - h.y) <= h.w.reich) e.fluch = Math.max(e.fluch || 0, 0.3);
    if (e.fluch > 0) {
      e.fluch -= DT;
      // 🟣 Schattenflamme: Verfluchte brennen
      if (T.hoelle && e.hp > 0) { treffe(N, e, T.hoelle * DT, 'feuer', 'hoelle', false, true); if (!e.brennt) { e.brennt = true; kombo(N, 'hoelle', e.x, e.y); } }
    }
  }
  if (h.anim > 0) h.anim -= DT;
  if (N.rausch > 0) N.rausch -= DT;
  for (const tw of N.tuerme) {
    // Held schneller: 🗼 Wachposten (Schild liegt) und 💫 Schwung (nach einem Sieg)
    const tempo = tw !== h ? 1 : 1 + (T.wachposten && N.schild > 0 ? T.wachposten : 0) + (N.rausch > 0 ? T.rausch : 0);
    tw.cd -= DT * tempo;
    if (tw.cd <= 0 && schiesse(N, tw)) tw.cd = turmWerte(tw).takt;
    if (!tw.burg) turmSchritt(N, tw);
  }
  for (const z of N.zauber) {
    if (z.t > 0) z.t -= DT;
    // Bereit: mit 🤖 Auto wirkt er sofort, sonst wartet er aufs Antippen (zauberVonHand)
    if (z.t <= 0 && autoAn(N, z.name) && zaubere(N, z.name)) { z.t = zauberCd(N.T, z.name); if (N.T.echo) z.echo = 1; }
    // ⏳ Echo: der Zauber kommt 1 s später noch einmal
    if (z.echo > 0 && (z.echo -= DT) <= 0) zaubere(N, z.name);
  }
  spezSchritt(N);
  talentSchritt(N);
  brutSchritt(N);
  if (N.live) funkeSchritt(N);
  // Besiegte Gegner: XP, 🎆 Funkenregen (kann weitere Gegner mitreißen)
  for (let runde = 0; runde < 5; runde++) {
    const tote = N.feinde.filter((e) => e.hp <= 0 && !e.amTor && !e.gezaehlt);
    if (!tote.length) break;
    for (const e of tote) {
      e.gezaehlt = true;
      N.besiegt++;
      if (N.T.rausch) N.rausch = 2;
      const xp = Math.round(((XP_GEGNER[e.g] || 1) * (e.chef ? CHEF_XP : 1) + (N.T.fluch_xp && e.fluch > 0 ? N.T.fluch_xp : 0)) * (N.ruhm || 1));   // ⭐ Ruhm: mehr XP
      N.xp += xp;
      nachtGold(N, (XP_GEGNER[e.g] || 1) * (e.chef ? CHEF_XP : 1) * N.goldJe, e.x, e.y);
      N.fx.push({ typ: 'tot', x: e.x, y: e.y, t: 0.5, ico: GEGNER[e.g].ico });
      if (e.gross || (N.T.fluch_xp && e.fluch > 0)) N.fx.push({ typ: 'text', x: e.x, y: e.y - 0.5, text: `+${xp} XP`, farbe: '#c9b8ff', t: 1.2 });
      if (e.chef) N.fx.push({ typ: 'ansage', t: 2.2, text: `🏆 ${CHEF[e.g]} besiegt!` });
      // 💎 Beute: Anführer und Drachen füllen den Beutezähler (P.beute); ab 1 fällt ein Stein (Auswahl nach der Nacht)
      if (e.chef || GEGNER[e.g].boss) {
        N.beute = (N.beute || 0) + (GEGNER[e.g].boss ? BEUTE_DRACHE : BEUTE_ANFUEHRER) * (N.ruhm || 1);   // ⭐ Ruhm: öfter Beute
        if (N.live && !N.beuteAngesagt && P.beute + N.beute >= 1) {
          N.beuteAngesagt = true;
          N.fx.push({ typ: 'ansage', t: 2.6, warte: 1.2, text: '🪄 Ein Zauber fällt! Nach der Nacht darfst du wählen.' }, { typ: 'text', x: e.x, y: e.y - 0.7, text: '🪄', farbe: '#9fe8ff', t: 2 });
        }
      }
      sterbeEffekte(N, e);
      // 🎆 Funkenregen: wer selbst von Funken erledigt wurde, zerstiebt nicht noch einmal (sonst Kettenexplosion durch die ganze Welle)
      if (N.T.leiche && e.letzte !== 'leiche') {
        const r = 1 + (N.T.leiche_r || 0);
        // höchstens die 3 nächsten (Spieltest: in dichten späten Wellen machte der Funkenregen sonst fast ein Drittel des Schadens)
        N.feinde.filter((o) => o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) <= r).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))
          .slice(0, 3).forEach((o) => treffe(N, o, e.max * N.T.leiche, 'chaos', 'leiche'));
        N.fx.push({ typ: 'boom', x: e.x, y: e.y, r, t: 0.3, farbe: '170, 80, 255' });
      }
      // 🟢 Schleim teilt sich: zwei kleine laufen von hier aus weiter aufs Tor zu (der Schleimkönig in zwei große)
      const kind = e.chef && GEGNER[e.g].teilt ? e.g : GEGNER[e.g].teilt;
      if (kind) for (const seite of [-0.35, 0.35]) {
        feindNeu(N, kind, { weg: [[e.x, e.y + seite], [BURG.tor.x - 1, BURG.y + seite], [BURG.tor.x, BURG.y]], len: Math.hypot(BURG.tor.x - 1 - e.x, BURG.y - e.y) + 1 }, e.mehr);
      }
    }
  }
  N.feinde = N.feinde.filter((e) => e.hp > 0 && !e.amTor);
  for (const f of N.fx) f.t -= DT;
  N.fx = N.fx.filter((f) => f.t > 0);
  if (N.hp <= 0) { N.hp = 0; N.ende = 'verloren'; return; }
  // Welle ganz besiegt: Wellenbonus, dann Verschnaufpause (live) – oder die Nacht ist gehalten
  if (N.si >= N.spawns.length && !N.feinde.length) {
    if (N.welle >= N.wellen.length - 1) { N.ende = 'gehalten'; return; }
    if ((N.luecke += DT) < WELLE_ATEM) return;
    const wx = Math.round(welleXp(N.n) * (N.ruhm || 1));
    N.xp += wx;
    const wg = Math.round(welleXp(N.n) * N.goldJe);
    nachtGold(N, wg);
    N.fx.push({ typ: 'ansage', t: 2.4, text: `✅ Welle ${N.welle + 1} gehalten! +${wx} XP${wg ? ` · +${wg} 🪙` : ''}` });
    if (N.live) { N.zwischen = true; N.halt = true; return; }
    if (N.zwischenFn) N.zwischenFn(N);
    naechsteWelle(N);
  }
}

// Vorschau: dieselbe Nacht sofort durchrechnen. zwischen(N) = was in der Wellenpause passiert (Balance-Bot: Talente lernen)
function simNacht(n, zwischen) {
  const N = nachtZustand(n);
  N.zwischenFn = zwischen;
  while (!N.ende && N.t < 900) nachtSchritt(N);
  return N;
}
function risiko(n) {
  const N = simNacht(n), r = N.hp / N.max;
  if (N.ende === 'verloren') return { stufe: 'gefaehrlich', text: 'gefährlich' };
  if (r < 0.6) return { stufe: 'knapp', text: 'knapp' };
  return { stufe: 'sicher', text: 'sicher' };
}

// --- Live-Nacht ---
let N = null, nachtTempo = 1, nachtLetzt = 0, nachtRest = 0;

function nachtStart() {
  // Vor der allerersten Nacht: einen Zauberstein wählen
  if (!steinBesitz().length) { startsteinKarte(nachtStart); return; }
  P.phase = 'nacht';
  speichern();
  N = nachtZustand(P.nacht);
  N.live = true;   // nur hier werden Kombos entdeckt (nicht in der Vorschau)
  $('#scr-karte').innerHTML = '';   // Abend-Ansicht weg (sonst gäbe es #baupanel doppelt)
  zeigeScreen('nacht');
  uebergang('nacht');
  hud();
  nachtKnoepfe();
  nachtLetzt = performance.now();
  nachtRest = 0;
  nachtInfo();
  // Jederzeit: Turm antippen öffnet das Turmblatt (die Nacht steht still, solange es offen ist), freie Stelle = Bauplan
  const cv = $('#nachtCanvas');
  cv.onclick = (ev) => {
    if (!N || N.ende) return;
    const r = cv.getBoundingClientRect(), k = r.width / NFELD.w;
    const x = (ev.clientX - r.left) / k - 0.5, y = (ev.clientY - r.top) / k - 0.5;
    // ✨ Kombo-Funke getroffen?
    if (N.funke && !N.stand && Math.hypot(N.funke.x - x, N.funke.y - y) < 1.4) { funkeZuenden(N); return; }
    // 🎯 Zielen: Feuerball/Eiswelle auf den Gegner, der der angetippten Stelle am nächsten ist
    if (ZIELEN) {
      const ziel = nahe(N, x, y, 2.2).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
      if (!ziel) { toast('Dort ist kein Gegner. Tippe näher an die Monster.'); return; }
      if (Math.hypot(ziel.x - N.held.x, ziel.y - N.held.y) > ZAUBER[ZIELEN].reich + (N.T.zauber_reich || 0)) { toast('Zu weit weg – so weit reicht dein Held nicht (gelber Kreis).'); return; }
      if (zauberVonHand(N, ZIELEN, ziel)) ZIELEN = null;
      zauberLeiste();
      return;
    }
    // 👑 Bereite Turm-Fähigkeit über dem Turm angetippt?
    const tw = N.tuerme.find((t) => turmFaehigArt(t) && t.uhr <= 0 && Math.hypot(t.x - x, t.y - 0.95 - y) < 0.6);
    if (tw && !N.stand) { if (!turmVonHand(N, tw)) toast('Gerade kein Ziel in Reichweite.'); return; }
    feldTippen(x, y);   // Turm → Turmblatt; freie Stelle nur im Baumodus (Bauleiste rechts, karte.js)
  };
  BAU = null; BAUMODUS = null;
  bauSteuerung(cv);
  bauleisteRender(); bauOkZeigen();
  ZIELEN = null;
  $('#zauberLeiste').innerHTML = '';
  N.leisteKey = null;
  zauberLeiste();
  requestAnimationFrame(nachtFrame);
}

// 🪄 Leiste unter dem Spielfeld: je Heldenzauber und Turm-Fähigkeit ein Knopf mit Abklingring und 🤖 Auto-Schalter.
// Antippen, wenn bereit: Kettenblitz und Schutz wirken sofort, Feuerball und Eiswelle wollen ein Ziel (ZIELEN).
// Tasten 1–9 wie die Knöpfe. Gezeichnet wird nur neu, wenn sich die Liste ändert; sonst nur Ring und Zustand.
let ZIELEN = null;
function leisteEintraege() {
  const zauber = N.zauber.map((z) => ({ key: z.name, ico: ZAUBER[z.name].ico, name: ZAUBER[z.name].name, rest: Math.max(0, z.t), voll: zauberCd(N.T, z.name) }));
  const tuerme = N.tuerme.filter(turmFaehigArt).map((tw) => {
    const art = turmFaehigArt(tw);
    return { key: 't' + tw.slot, ico: TURM_FAEHIG[art][0], name: `${TURM_FAEHIG[art][1]} (Turm ${tw.slot + 1})`, rest: Math.max(0, tw.uhr ?? tw.w[art]), voll: tw.w[art], tw };
  });
  return [...zauber, ...tuerme];
}
function zauberLeiste() {
  const box = $('#zauberLeiste');
  if (!box || !N) return;
  const liste = leisteEintraege(), key = liste.map((e) => e.key).join(',');
  if (key !== N.leisteKey) {
    N.leisteKey = key;
    box.innerHTML = liste.map((e, i) => `<div class="zfeld"><button class="zknopf" data-z="${e.key}" title="Taste ${i + 1}"><span class="zring"></span><span class="zico">${e.ico}</span><span class="zname">${esc(e.name)}</span><span class="ztaste">${i + 1}</span></button>
      <label class="zauto"><input type="checkbox" data-auto="${e.key}" ${(P.zauberAuto || {})[e.key] !== false ? 'checked' : ''}> 🤖 Auto</label></div>`).join('');
    for (const b of box.querySelectorAll('[data-z]')) b.onclick = () => leisteKlick(b.dataset.z);
    for (const c of box.querySelectorAll('[data-auto]')) c.onchange = () => { (P.zauberAuto ||= {})[c.dataset.auto] = c.checked; speichern(); };
  }
  for (const e of liste) {
    const b = box.querySelector(`[data-z="${e.key}"]`);
    if (!b) continue;
    b.style.setProperty('--p', e.voll ? 1 - e.rest / e.voll : 1);
    b.classList.toggle('bereit', e.rest <= 0);
    b.classList.toggle('zielt', ZIELEN === e.key);
  }
}
function leisteKlick(key) {
  if (!N || N.ende || N.stand) return;
  const e = leisteEintraege().find((x) => x.key === key);
  if (!e) return;
  if (e.rest > 0) { toast(`${e.ico} ${e.name} lädt noch.`); return; }
  if (e.tw) { if (!turmVonHand(N, e.tw)) toast('Gerade kein Ziel in Reichweite.'); return; }
  if (ZIEL_ZAUBER.includes(key)) { ZIELEN = ZIELEN === key ? null : key; zauberLeiste(); if (ZIELEN) toast(`🎯 Tippe ins Feld: Wohin soll ${e.ico} ${e.name}?`); return; }
  if (!zauberVonHand(N, key)) toast('Gerade kein Gegner in Reichweite.');
}
document.addEventListener('keydown', (ev) => {
  if (!N || P.phase !== 'nacht' || karteOffen() || !/^[1-9]$/.test(ev.key)) return;
  const e = leisteEintraege()[+ev.key - 1];
  if (e) leisteKlick(e.key);
});

// Hauptknopf: Tempo (läuft) oder Weiter (⏸ angehalten); links ⏸ Pause und ✨ Talente
function nachtKnoepfe() {
  if (N && N.zwischen) haupt(`▶ Welle ${N.welle + 2} 👑`, () => { N.halt = false; N.zwischen = false; naechsteWelle(N); nachtInfo(); nachtKnoepfe(); });
  else if (N && N.halt) haupt('▶ Weiter', () => { N.halt = false; nachtInfo(); nachtKnoepfe(); });
  else haupt(`⏩<span class="lbl"> Tempo</span> ${nachtTempo}×`, () => {
    nachtTempo = nachtTempo >= 4 ? 1 : nachtTempo * 2;
    $('#hauptBtn').innerHTML = `⏩<span class="lbl"> Tempo</span> ${nachtTempo}×`;
  });
  const frei = punkteFrei() + Math.max(0, spezPunkte()), knoepfe = [];
  if (N && !N.halt) knoepfe.push({ label: '⏸<span class="lbl"> Pause</span>', title: 'Anhalten: Mauer reparieren, Torwache, bauen', fn: () => { N.halt = true; nachtInfo(); nachtKnoepfe(); }, cls: 'leise' });
  if (P.xp || frei > 0) knoepfe.push({ label: `✨<span class="lbl"> Talente</span>${frei > 0 ? ` <span class="badge">${frei}</span>` : ''}`, title: 'Talentbaum (die Nacht wartet)', fn: talentBlatt, cls: frei > 0 ? 'gruen puls' : 'leise' });
  neben(knoepfe);
}

// ⏸ Angehalten: unter dem Spielfeld Mauer, Reparatur und Torwache (damit das Spielfeld nicht springt)
function nachtInfo() {
  $('#nachtInfo').innerHTML = '';
  if (!N || !N.halt) { $('#nachtBau').innerHTML = ''; return; }
  SEL = null; KAUF = null;
  const frei = punkteFrei();
  $('#nachtBau').innerHTML = `<div class="pausebrett">${N.zwischen
    ? `<b>✅ Welle ${N.welle + 1} gehalten!</b><span class="hinweis">${frei > 0 ? `✨ ${frei} Talentpunkt${frei > 1 ? 'e' : ''} frei – jetzt verteilen! ` : ''}Bauen, reparieren, dann kommt Welle ${N.welle + 2} mit dem 👑 Anführer.</span>`
    : '<b>⏸ Pause</b><span class="hinweis">Tippe einen Turm an zum Ausbauen – neue Türme wählst du rechts in der Bauleiste.</span>'}</div>
    <div class="baupanel" id="baupanel" style="margin-top:8px"></div>`;
  renderBau();
}

// Angehalten (⏸ oder ein offenes Blatt): XP gutschreiben, damit Talente gelernt werden können
function nachtAnhalten() {
  if (N.xp) { P.xp += N.xp; N.xp = 0; speichern(); hud(); }
}

function nachtFrame(now) {
  if (!N || P.phase !== 'nacht') return;
  const steht = N.halt || karteOffen();
  if (steht && !N.stand) { nachtAnhalten(); if (N.zwischen) { nachtKnoepfe(); nachtInfo(); } }
  // Weiter nach dem Anhalten: Gebautes und Gelerntes zählt sofort
  if (!steht && N.stand) { nachtAufstellen(N, false); SEL = null; nachtKnoepfe(); }
  N.stand = steht;
  // ⏩ Zeitraffer: solange kein Gegner in Reichweite eines Turms oder des Helden ist, läuft die Nacht 4× so schnell
  N.raffer = !N.funke && !N.feinde.some((e) => N.tuerme.some((tw) => Math.hypot(e.x - tw.x, e.y - tw.y) <= tw.w.reich + 0.5))
    && !N.fx.some((f) => f.typ !== 'text' && (f.typ !== 'ansage' || f.banner));   // das Wellen-Banner soll man lesen können
  if (steht) nachtRest = 0;
  else nachtRest += Math.min(0.25, (now - nachtLetzt) / 1000) * nachtTempo * (N.raffer ? 4 : 1);
  nachtLetzt = now;
  while (nachtRest >= DT && !N.ende && !N.halt) { nachtSchritt(N); nachtRest -= DT; }
  zeichneNacht($('#nachtCanvas'), N, { sel: SEL, bauen: steht, plan: bauPlan() });
  if (N.ende) { setTimeout(nachtEnde, 600); return; }
  // Kombo-Karten erst in der Wellenpause (Durchlauf: 4 Karten nacheinander mitten im Kampf); der Rest steht auf der Ergebniskarte
  if (N.neueKombos?.length && N.zwischen && !karteOffen()) { const ids = N.neueKombos.splice(0); komboKarte(ids[0], ids.slice(1)); }
  else if (N.neueMonster?.length && !karteOffen()) monsterKarte(N.neueMonster.shift());
  zauberLeiste();
  // Aufstieg mitten in der Nacht: Talente-Knopf bekommt sein Abzeichen
  const lv = heldLevel(P.xp + N.xp).level;
  if (N.knopfLevel !== lv) { if (N.knopfLevel !== undefined && !steht) { P.xp += N.xp; N.xp = 0; speichern(); hud(); nachtKnoepfe(); } N.knopfLevel = lv; }
  requestAnimationFrame(nachtFrame);
}

// Für Tests im Hintergrund-Tab: Nacht sofort zu Ende rechnen
function nachtSofort() {
  while (N && !N.ende) nachtSchritt(N);
}

// 📊 Schadensbilanz nach der Nacht: drei Gruppen (Türme, Held, Talente & Wache) mit Balken, bester Turm und Tipp für den schwächsten
const BILANZ_NAMEN = { held: '🧙 Grundangriff', wache: '🛡️ Torwache', baum: '🌳 Uralter Baum', gift: '🧪 Zerfall', leiche: '🎆 Funkenregen', entropie: '🍂 Entropie',
  riss: '🌀 Chaosriss', dornen: '🌿 Dornen', hoelle: '🟣 Schattenflamme', gewitter: '⛈️ Gewitterschild', spiegel: '🪞 Spiegelschild', hinrichtung: '🌬️ Wegpusten',
  funken: '🎇 Funkenflug', feuerwall: '🏮 Feuerwall', glut: '🌠 Glutpfeile', blitzpfeile: '🌟 Blitzpfeile', klon: '👥 Schattenklon',
  brand: '🔥 Brennen', vulkan: '🌋 Vulkan', funkensprung: '🎇 Funkensprung', splitter: '💠 Splittereis', schnee: '🌨️ Schneefeld', donner: '💥 Donnerschlag',
  wolke: '☁️ Gewitterwolke', dornschild: '🌵 Dornenschild', splitterpfeil: '🪶 Splitterpfeile', querschlag: '🎱 Querschläger', pfeilregen: '🌧️ Pfeilregen',
  dampf: '♨️ Dampfwolke', irrlicht: '🔮 Irrlichter', stern: '🌠 Sternschnuppen', feuerwerk: '🎆 Feuerwerk', schattengewitter: '🌩️ Schattengewitter',
  funke: '🔗 Kombo-Ausbruch', eule: '🦉 Wächtereule', drachling: '🐲 Drachling', phoenix: '🕊️ Phönix', kristall: '🔷 Kristallmauer', polarstrahl: '🔦 Polarstrahl', ableiter: '🗼 Blitzableiter', jagd: '🐺 Gewitterjagd' };
// mitTipp: den Hinweis auf einen schwachen Turm nur geben, wenn es auch eng war (Spieltest: ein Turm am Ende des Wegs trifft
// wenig, weil die anderen vorher alles erledigen – das ist gut so und kein Grund, ihn zu verkaufen)
function bilanzHtml(schaden, turmArt = {}, mitTipp = true, verloren = false) {
  // auch Türme, die gar nicht getroffen haben (0) – gerade die sind für den Tipp wichtig
  const eintraege = [...Object.entries(schaden).filter(([, d]) => d >= 1), ...Object.keys(turmArt).filter((q) => !(schaden[q] >= 1)).map((q) => [q, 0])];
  if (!eintraege.length) return '<p>–</p>';
  const gesamt = Math.max(1, eintraege.reduce((s, [, d]) => s + d, 0)), max = Math.max(1, ...eintraege.map(([, d]) => d));
  const gruppen = { turm: [], held: [], mehr: [] };
  for (const [q, d] of eintraege) {
    const art = turmArt[q] || P.tuerme[q]?.art;   // auch Türme, die in der Pause verkauft wurden
    if (art) gruppen.turm.push({ q, d, name: `${TUERME[art].ico} ${TUERME[art].name} <span class="hinweis">Nr. ${+q.split('~')[0] + 1}${P.tuerme[q.split('~')[0]]?.art === art && !q.includes('~') ? '' : ' · verkauft'}</span>` });
    else if (q === 'held' || ZAUBER[q]) gruppen.held.push({ q, d, name: ZAUBER[q] ? `${ZAUBER[q].ico} ${ZAUBER[q].name}` : BILANZ_NAMEN[q] });
    else gruppen.mehr.push({ q, d, name: BILANZ_NAMEN[q] || q });
  }
  const anteil = (d) => Math.round((d / gesamt) * 100);
  const zeile = (z) => `<div class="bilzeile"><span class="bname">${z.name}</span><span class="bbalken"><i style="width:${Math.max(2, (z.d / max) * 100)}%"></i></span><span class="bwert">${Math.round(z.d)}</span></div>`;
  const block = (titel, liste) => {
    if (!liste.length) return '';
    const summe = liste.reduce((s, z) => s + z.d, 0);
    return `<div class="bgruppe"><div class="btitel"><b>${titel}</b><span>${anteil(summe)} %</span></div>${liste.sort((a, b) => b.d - a.d).map(zeile).join('')}</div>`;
  };
  // bester Turm und – wenn ein Turm kaum etwas getan hat – ein Tipp
  const tuerme = gruppen.turm.slice().sort((a, b) => b.d - a.d);
  let tipp = '';
  if (tuerme.length) tipp += `<p class="hinweis">⭐ Bester Turm: ${tuerme[0].name} mit ${anteil(tuerme[0].d)} % des Schadens.</p>`;
  const schwach = tuerme.length > 1 && tuerme[tuerme.length - 1];
  if (mitTipp && schwach && schwach.d < tuerme[0].d * 0.25) tipp += `<p class="hinweis">💡 ${schwach.name} hat wenig getroffen. Vielleicht passt dort eine andere Turmart oder ein Ausbau?</p>`;
  // Bei einer Niederlage: konkrete nächste Schritte (Spieltest 2026-11-13: „baue mehr Türme“ allein half nicht)
  if (verloren) {
    const schritte = [], arten = new Set(Object.values(P.tuerme || {}).map((t) => t.art)), zahl = Object.keys(P.tuerme || {}).length;
    const heldAnteil = anteil(gruppen.held.reduce((s, z) => s + z.d, 0));
    if (typeof punkteFrei === 'function' && punkteFrei() > 0) schritte.push(`Du hast ${punkteFrei()} Talentpunkt${punkteFrei() === 1 ? '' : 'e'} frei – lerne sie im ✨ Talentnetz.`);
    const drin = (P.sockel || []).filter((s) => s != null).length;
    if (drin < sockelZahl() && Object.keys(P.steine || {}).length > drin) schritte.push('Ein Zauberplatz ist leer – setze einen Zauber ein (✨ Talente → 🪄 Zauber).');
    if (zahl && arten.size === 1) schritte.push(`Du hast nur ${TUERME[[...arten][0]].ico} ${TUERME[[...arten][0]].name}. Jede Turmart hat Stärken und Schwächen – mische sie.`);
    const billigster = Object.values(P.tuerme || {}).filter((t) => turmStufe(t) < MAX_STUFE).map((t) => ausbauPreis(t.art, turmStufe(t))).sort((a, b) => a - b)[0];
    if (billigster && P.gold >= billigster) schritte.push(`Du hast ${P.gold} 🪙 – genug für einen Ausbau (Turm antippen).`);
    if (zahl && heldAnteil < 8 && !schritte.length) schritte.push('Dein Held hat kaum mitgeholfen – Talente für Held und Zauber machen ihn stärker.');
    if (schritte.length) tipp += `<p class="hinweis">🧭 <b>Was jetzt hilft:</b> ${schritte.slice(0, 3).join(' ')}</p>`;
  }
  return `<div class="bilanz">${block('🏰 Türme', gruppen.turm)}${block('🧙 Held und Zauber', gruppen.held)}${block('✨ Talente und Wache', gruppen.mehr)}</div>${tipp}`;
}

// 💡 Warum kam etwas durchs Tor – und was hilft? (Spieltest 2026-11-13: „4× Greif durchs Tor“ ohne Grund half nicht weiter)
// durch = N.durch; liefert HTML mit höchstens drei Tipps, passend zu den Monsterarten und den eigenen Türmen.
const LUFT_TUERME = ['pfeil', 'kanone', 'blitz', 'eis', 'wind'];   // treffen Flieger (Katapult nur am Boden)
function durchTipps(durch) {
  if (!durch?.length) return '';
  const arten = new Set(durch.map((d) => (GEGNER[d.g]?.boss ? 'boss' : d.chef ? 'chef' : d.g)));
  const tuerme = Object.values(P.tuerme || {}).map((t) => t.art);
  const name = (a) => `${TUERME[a].ico} ${TUERME[a].name}`;
  const tipps = [];
  if ([...arten].some((g) => GEGNER[g]?.fliegt)) {
    const luft = tuerme.filter((a) => LUFT_TUERME.includes(a));
    if (!luft.length) {
      const billig = ['pfeil', 'blitz'].filter((a) => turmOffen(a)).sort((a, b) => turmPreis(a) - turmPreis(b))[0] || 'pfeil';
      const kat = tuerme.includes('katapult');
      const knapp = P.gold < turmPreis(billig);
      tipps.push(`🦇 <b>Flieger</b> fliegen über den Weg hinweg. ${kat ? 'Dein Katapult trifft sie nicht – ' : ''}keiner deiner Türme erreicht sie in der Luft. Baue einen ${name(billig)}${turmOffen('blitz') && billig !== 'blitz' ? ` oder ${name('blitz')}` : ''} nah am Tor${turmOffen('eis') ? `, ein ${name('eis')} holt sie zusätzlich zu Boden` : ''}.${knapp && kat ? ` Zu wenig Gold? Verkaufe ein Katapult (Turm antippen → Verkaufen) und baue dafür einen ${name(billig)}.` : ''}`);
    } else tipps.push(`🦇 <b>Flieger</b> nehmen die Luftlinie zum Tor. Nur ${luft.length === 1 ? 'ein Turm trifft' : `${luft.length} Türme treffen`} sie (${[...new Set(luft)].map(name).join(', ')}). Stelle ${luft.length === 1 ? 'einen zweiten' : 'sie'} nah ans Tor oder baue sie aus – ein ${name('eis')} holt sie zu Boden, dann helfen auch Katapult und Torwache.`);
  }
  if (arten.has('fuchs') || arten.has('ratte') || arten.has('wolf')) tipps.push('🦊 <b>Flinke Monster</b> (Füchse, Ratten, Wölfe) laufen schnell und oft querfeldein. Ein 🏹 Pfeilturm schießt schnell und trifft sie gut – stelle ihn nah ans Tor. Auch eine stärkere 🛡️ Torwache hält sie fest.');
  if (arten.has('chef') || arten.has('troll') || arten.has('ork') || arten.has('felsling')) tipps.push('👑 <b>Zähe Monster</b> (Anführer, Trolle, Orks) haben viel Leben. Hilfe: 💣 Kanone, Türme ausbauen (Turm antippen), 🧊 Eis bremst sie, eine stärkere Mauer hält mehr aus (🛡️ Burg stärken).');
  if (arten.has('boss')) tipps.push('🐉 <b>Der Drache</b> ist sehr zäh und Feuer prallt ab. Baue Türme entlang des ganzen Wegs aus, 🧊 Eis und Betäuben bremsen ihn – je mehr Leben er verliert, desto langsamer wird er. Türme am Anfang des Wegs lohnen sich gegen ihn.');
  return tipps.slice(0, 3).map((t) => `<p class="hinweis durchtipp">💡 ${t}</p>`).join('');
}

// 💪 „Deine Stärke“ (Wegknoten): was in dieser Nacht am meisten Schaden gemacht hat – Türme, Grundangriff (+ Eule) oder Zauber
function staerkeMerken(N) {
  const s = { turm: 0, held: 0, zauber: 0 };
  for (const [q, d] of Object.entries(N.schaden || {})) {
    if (/^\d/.test(q)) s.turm += d;
    else if (q === 'held' || q === 'eule' || q === 'drachling' || q === 'klon') s.held += d;
    else if (ZAUBER[q]) s.zauber += d;
  }
  const best = Object.entries(s).sort((a, b) => b[1] - a[1])[0];
  if (best[1] > 0) P.staerke = best[0];
}

let nachtKombos = [];   // in der Nacht entdeckte Kombos, deren Karte noch nicht kam (stehen auf der Ergebniskarte)
function nachtEnde() {
  if (!N) return;   // schon abgerechnet
  ZIELEN = null;
  $('#zauberLeiste').innerHTML = '';
  const n = N.n, sieg = N.ende === 'gehalten';
  staerkeMerken(N);
  const bilanz = bilanzHtml(N.schaden, N.turmArt, N.ende !== 'gehalten' || !!(N.durch || []).length, N.ende !== 'gehalten');
  // 🚪 Wer kam durchs Tor? (damit klar ist, warum die Mauer Leben verloren hat)
  const durchGr = {};
  for (const d of N.durch || []) { const x = (durchGr[d.name] ||= { n: 0, dmg: 0, chef: d.chef }); x.n++; x.dmg += d.dmg; }
  const durchListe = Object.entries(durchGr).sort((a, b) => b[1].dmg - a[1].dmg).map(([name, x]) => `${x.chef ? '👑 ' : ''}${x.n > 1 ? `${x.n}× ` : ''}${name} (−${x.dmg} 🧱)`).join(', ');
  const durchZeile = durchListe ? `<p class="hinweis">🚪 <b>Durchs Tor gekommen:</b> ${durchListe}. Wer das Tor erreicht, rennt hindurch und beschädigt dabei die Mauer – Anführer dreifach. Ist die Mauer bei 0, fällt die Burg.</p>${durchTipps(N.durch)}` : '';
  // XP: je besiegtem Gegner, dazu ein Bonus für jede gehaltene Welle; verloren = halbe XP
  const xp = Math.round(sieg ? N.xp + welleXp(n) * (N.ruhm || 1) : N.xp / 2), vorher = N.levelStart ?? heldLevel().level;
  P.xp += xp;
  const neu = heldLevel().level - vorher;
  // 🪙 Nacht-Gold: Kopfgeld (live schon gezahlt) + Rest + Bonus für die letzte Welle, wenn gehalten
  const gold = Math.round(N.gold + (sieg ? welleXp(n) * N.goldJe : 0));
  P.gold += Math.max(0, gold - N.goldGezahlt);
  P.nachtVorschuss = 0;
  const voll = N.goldJe / (N.ruhm || 1) >= NACHT_GOLD, besiegt = N.besiegt;
  // ⭐ Ruhm: verloren = ein Teil weg (die nächsten Nächte werden leichter), gehalten = kommt zurück bzw. wächst (data.js)
  const rekVorher = ruhmRekord();
  const ruhmPlus = ruhmNachNacht(sieg, n, N), ruhmNach = ruhm();
  P.komboLadung = N.ausbruch ? KOMBO_LADUNG : Math.min(KOMBO_LADUNG, N.komboLadung || 0);
  // 🏅 neue Abzeichen: 🏆 Kampf (Ruhm-Rekord dieser Nacht) und ⭐ Programmieren (Sterne seit der letzten Nacht) – je mit Schatz (abzeichen.js)
  const sternVorher = P.abzSterne ?? 0;   // alte Stände: alle schon verdienten Programmier-Abzeichen einmal zeigen
  P.abzSterne = sternePunkte();
  const juwelNeu = juwelNachNacht(sieg, true);   // 💎 Juwel gefunden? (nur LK/Endlos, wenn eine Fassung gelernt ist)
  const abzZeile = abzNeuHtml('kampf', abzeichenNeu('kampf', rekVorher)) + (abzLeiterDa('stern') ? abzNeuHtml('stern', abzeichenNeu('stern', sternVorher)) : '')
    + (juwelNeu ? `<div class="abzneu"><i>${juwelNeu.ico}</i><div><b>Neues Juwel: ${esc(juwelNeu.name)}!</b><br><span class="hinweis">${esc(juwelNeu.text)} Einsetzen im ✨ Talentnetz an einer 💎 Fassung.</span></div></div>` : '');
  const ruhmZeile = ruhmPlus < 0 ? `<p class="hinweis">🏆 Ruhm −${-ruhmPlus} für die Niederlage (jetzt ${ruhmNach}): Die Monster der nächsten Nacht sind schwächer.</p>`
    : ruhmPlus > 0 ? `<p class="hinweis">🏆 Ruhm jetzt ${ruhmNach} (+${ruhmPlus} ${P.ruhmGrund ? `– ${P.ruhmGrund}! Die Kunde verbreitet sich, stärkere Monster kommen` : 'für den Sieg – er spricht sich herum'}).</p>` : '';
  // 💎 Beute: Zähler voll → ein Angebot aus zwei Steinen (bleibt gespeichert, bis gewählt)
  P.beute = (P.beute ?? 1) + (N.beute || 0);
  if (P.beute >= 1 && !P.beuteWahl) { P.beute -= 1; P.beuteWahl = beuteAngebot(); if (!P.beuteWahl.length) P.beuteWahl = null; }
  P.tag++;
  P.phase = 'morgen';
  nachtKombos = N.neueKombos || [];
  roboMorgen();   // 🤖 die Roboter arbeiten im Morgengrauen
  if (sieg) { P.nacht++; P.rekord = Math.max(P.rekord, n); P.niederlagen = 0; } else P.niederlagen++;
  speichern();
  N = null;
  const neuerPlatz = platzZahl(heldLevel().level) > platzZahl(vorher);   // 🪄 mit dem Level kommt ein Zauberplatz dazu
  const xpZeile = `<p class="lohn" style="color:#c9b8ff">+${xp} XP${neu ? ` · 🧙 Level ${heldLevel().level}! +${neu} Talentpunkt${neu > 1 ? 'e' : ''}${punkteFrei() < neu ? ` (noch ${punkteFrei()} frei)` : ''}` : ''}</p>
    ${neuerPlatz ? `<p class="lohn" style="color:#c9b8ff">🪄 Neuer Zauberplatz! Jetzt kann dein Held ${sockelZahl()} Zauber gleichzeitig einsetzen (✨ Talente → 🪄 Zauber).</p>` : ''}
    <p class="lohn">+${gold} 🪙 <span class="hinweis">für ${besiegt} besiegte Monster${sieg ? ' und gehaltene Wellen' : ''}</span></p>
    ${voll || ENDLOS || P.gesehen.kopfgeldTipp || !(P.gesehen.nachtgold || PROFIL.gesehen?.nachtgold) ? '' : '<p class="hinweis">💡 Volles Kopfgeld gibt es, wenn alle Aufgaben dieser Burg gelöst sind.</p>'}`;
  hud();   // Ruhm, Level und Gold oben gleich neu (Spieltest: nach einer Niederlage stand dort noch der alte Ruhm)
  if (!voll) P.gesehen.kopfgeldTipp = true;   // Spieltest: der Hinweis kam jede Nacht – einmal reicht
  // Gebündelt statt eigener Karten (Durchlauf: nach der Nacht kamen 3–4 Karten): neue Kombos und die Kopfgeld-Erklärung stehen hier
  const komboRest = (nachtKombos || []).map(komboById).filter(Boolean);
  const komboErst = komboRest.length && !PROFIL.komboErklaert;
  if (komboRest.length) { PROFIL.komboErklaert = true; profilSpeichern(); P.gesehen.kombo = true; }
  const komboZeile = komboRest.length ? `<p class="hinweis">🔗 Neu entdeckt: ${komboRest.map((k) => `${k.ico} ${esc(k.name)}`).join(', ')} – nachlesen im 📖 Kombo-Buch (✨ Talente).${komboErst ? ' Eine Kombo entsteht von selbst, wenn Zauber zweier Richtungen zusammen eingesetzt sind – sie wirkt in jeder Nacht.' : ''}</p>` : '';
  const kg = ERKL.find((x) => x.key === 'nachtgold');
  let kgZeile = '';
  if (kg && !ENDLOS && !P.gesehen.nachtgold && !PROFIL.gesehen?.nachtgold) { P.gesehen.nachtgold = true; (PROFIL.gesehen ||= {}).nachtgold = true; profilSpeichern(); speichern(); kgZeile = `<p class="hinweis">💡 <b>${kg.titel}:</b> ${kg.text}</p>`; }
  karte(sieg
    ? `<h2>🌅 Nacht ${n} gehalten!</h2><p>${n === KAMPAGNE ? 'Ab jetzt wird es jede Nacht schwerer – wie weit kommst du?' : ENDLOS ? 'Die Burg steht. Bis zum Abend ist Zeit zum Ausbauen.' : 'Die Burg steht. Ein neuer Morgen beginnt.'}</p>
       ${abzZeile}${xpZeile}${ruhmZeile}${durchZeile}${komboZeile}${kgZeile}<details><summary>📊 Schadensbilanz</summary>${bilanz}</details>`
    : `<h2>🔥 Die Burg ist gefallen</h2><p>Die Monster haben die Mauer überrannt. ${ENDLOS ? 'Bis zum Abend ist sie wieder aufgebaut.' : 'Über Tag wird sie repariert.'}</p>
       <p>${ENDLOS ? 'Baue um, verteile Talente' : 'Verdiene Gold, baue mehr Türme'} und versuche Nacht ${n} noch einmal.</p>
       ${abzZeile}${xpZeile}${ruhmZeile}${durchZeile}${komboZeile}${kgZeile}<details open><summary>📊 Schadensbilanz</summary>${bilanz}</details>`,
    [{ label: P.beuteWahl ? '🪄 Beute ansehen' : ENDLOS ? '🌇 Zum Abend' : '🌅 Neuer Morgen', fn: P.beuteWahl ? beuteZeigen : karteStart }]);
}
// Offenes Beute-Angebot zeigen (nach der Nacht oder nach dem Neuladen)
function beuteZeigen() {
  if (!P.beuteWahl) { karteStart(); return; }
  // Beim ersten Mal die Erklärung gleich mit in die Beute-Karte (Durchlauf: eigene Karte davor war eine zu viel)
  const e = ERKL.find((x) => x.key === 'beute');
  let erkl = '';
  if (e && !P.gesehen.beute && !PROFIL.gesehen?.beute) { erkl = `</p><p class="hinweis">💡 ${e.text}`; }
  if (e) { P.gesehen.beute = true; (PROFIL.gesehen ||= {}).beute = true; profilSpeichern(); speichern(); }
  beuteKarte(P.beuteWahl, '🪄 Beute!', `Der Anführer hat etwas zurückgelassen. Wähle eins von beiden:${erkl}`, karteStart);
}
