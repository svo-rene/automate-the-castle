'use strict';
// --- Balance-Test: ganzer Spielverlauf mit einem einfachen Bot ------------------------
// Nur für die Entwicklung (Konsole im Test-Tab unter 127.0.0.1): ATC_BALANCE.lauf('gut' | 'mittel' | 'schwach', tage)
// Der Bot löst jeden Tag den nächsten Hof, kauft abends immer den günstigsten Ausbau, lernt Talente auf einem festen Weg
// und spielt die Nacht mit simNacht – genau wie im Spiel, nur ohne Bildschirm. Der echte Spielstand bleibt unberührt.

// Ziele im Talentnetz der Reihe nach; der Bot läuft jeweils den kürzesten Weg dorthin (talentWeg).
// Standard: große Knoten für Zauber, Türme und Tempo, dann Kontrolle und Burg. Für Vergleiche einfach BOT_ZIELE austauschen.
let BOT_ZIELE = ['Abpraller', 'Schnellzauber', 'Pfeilhagel', 'Funkenregen', 'Steinregen', 'Schockfrost', 'Kettenreaktion', 'Echo', 'Blitzableiter', 'Meisterwerkstatt', 'Aufladen', 'Bollwerk', 'Schattenhand', 'Gewitterwolke']
  .map((name) => Object.values(TALENTE).find((t) => t.typ === 'gross' && t.name === name)?.id).filter(Boolean);

let BOT_GIFT = 1;   // so viele Gifttürme baut der Bot (0 = wie vor dem Giftturm, zum Vergleichen)
let BOT_TURM_MEHR = 1.5;   // ab dem 4. Turm: so viel teurer kommt dem Bot jeder weitere Turm vor
// Abend: so lange kaufen, wie Gold da ist – immer das Günstigste (neuer Turm oder Ausbau)
// 🪙 Gold-Abstimmung 2026-11-15 (Nutzer: „zu wenig Gold, alles ging in Türme – Mauer, Reichweite, Zauber nie drin“).
// Bot 50 Tage, Burg 7, BOT_AUSG = wofür das Gold ging. Änderung: Lohn ×1,3 (LOHN_PLUS), Nacht offen 0,22 → 0,28,
// TURM_TEURER 1,3 → 1,45, Mauer/Torwache/Verstärker-Plätze günstiger, Verstärker ab Nacht 6 (STUETZ_AB).
//            Einnahmen      in Türme     Extras (Mauer, Wache, Zauber, Schätze, Roboter)   Nacht T50   verloren
//   gut      10709 → 15422  72 % → 65 %   2920 → 4700  (Mauer 3 → 5, Wache 2 → 3)          44 → 45     6 → 5
//   mittel    5859 →  8334  75 % → 67 %   1380 → 2640  (Mauer 2 → 4, Wache 2 → 3)          42 → 44     8 → 6
//   schwach   2632 →  3401  83 % → 66 %    440 → 1140  (Mauer 1 → 3, Wache 1 → 2)          39 → 39    11 → 11
// 🐉 Bosse bleiben am Tor (2026-11-15, BOSS_TAKT in nacht.js): Bot 50 Tage, Burg 7, vorher → nachher
//            Nacht T50   verloren   davon Drachennächte (10, 14, 18 …)
//   gut      45 → 45      5 → 5      2 → 4  (von 11 → 13 Versuchen)
//   mittel   43 → 42      7 → 8      1 → 4  (von 10 → 13)
//   schwach  40 → 40     10 → 10     2 → 4  (von 10 → 12)
// 👑🐉 Boss-Eigenheiten (2026-11-15, BOSS_ART in nacht.js): Bot 50 Tage, Burg 7, vorher → nachher (verloren/Versuche je Boss)
//   gut      Nacht 45 → 43, verloren 5 → 7    ork 0/12 → 1/13, geist 1/11 → 0/9, troll 1/11 → 2/11, drache 3/12 → 4/13
//   mittel   Nacht 41 → 42, verloren 9 → 8    troll 3/12 → 3/12, drache 5/13 → 4/13
//   schwach  Nacht 40 → 38, verloren 10 → 12  ork 2/13 → 2/12, geist 0/9 → 1/9, drache 4/12 → 5/13
// 🧪 Giftturm (2026-11-15, ab Nacht 8, Gift = fester Teil + 0,3 % der max. Leben je Schicht und s) und 😡 Wut der Bosse am Tor
// (+50 % je weiterem Schlag). Bot 50 Tage, Burg 7, BOT_GIFT 0 → 1 (ein Giftturm), Drache = verloren/Versuche:
//   gut      Nacht 44 → 45, verloren 6 → 5,   Drache 4/13 → 3/12
//   mittel   Nacht 42 → 43, verloren 8 → 7,   Drache 4/13 → 1/10
//   schwach  Nacht 39 → 39, verloren 12 → 11, Drache 6/14 → 2/10
// Nachtdauer (mittel, Spielzeit): Nacht 1 50 s, Nacht 5–15 meist 80–130 s, spät bis 170 s.
let BOT_AUSG = {};
function botKaufen() {
  for (let runde = 0; runde < 30; runde++) {
    const moeglich = [];
    const zahl = Object.keys(P.tuerme).length;
    // 🤖 Roboter auf den lohnendsten gelösten Hof ohne Roboter
    const robHof = burgHoefe().filter((h) => !h.art && P.hoefe[h.id]?.fertig && !P.roboter[h.id]).sort((a, b) => b.lohn - a.lohn)[0];
    if (roboterBekannt() && robHof && roboPreis() !== undefined) moeglich.push({ kat: "robo", preis: roboPreis() * 0.8, kosten: roboPreis(), tu: () => { P.roboter[robHof.id] = { seit: 0 }; } });
    // ➕ Verstärker-Platz kaufen (für den liebsten eingesetzten Zauber, der noch Platz hat)
    const stuetzZiel = ausgeruestet().find((t) => stuetzSockel(t) < STUETZ_MAX);
    if (stuetzOffen() && stuetzZiel !== undefined && STUETZ_PREIS[P.stuetzGekauft]) moeglich.push({ kat: "zauber", preis: STUETZ_PREIS[P.stuetzGekauft], tu: () => { P.stuetzGekauft++; P.stuetzSockel[stuetzZiel] = stuetzSockel(stuetzZiel) + 1; botSteine(); } });
    // 🌫️ Nebel vertreiben, sobald 4 Türme stehen (mehr Bauland = bessere Plätze für weitere Türme)
    const lp = BAULAND_PREIS[P.bauland || 0];
    if (lp && zahl >= 4) moeglich.push({ kat: "land", preis: lp * 1.2, kosten: lp, tu: () => { P.bauland = (P.bauland || 0) + 1; } });
    // 🏅 freigeschaltete Schätze (abzeichen.js) – gern, sie sind meist stark
    for (const id of Object.keys(SCHAETZE)) if (schatzFrei(id) && !schatzHat(id) && !(typeof schatzSchonWunder === 'function' && schatzSchonWunder(id))) moeglich.push({ kat: "schatz", preis: SCHAETZE[id].preis * 0.7, kosten: SCHAETZE[id].preis, tu: () => { (P.schaetze ||= {})[id] = true; } });
    if (WACHE_PREIS[P.wache]) moeglich.push({ kat: "wache", preis: WACHE_PREIS[P.wache] * 1.5, kosten: WACHE_PREIS[P.wache], tu: () => { P.wache++; } });
    if (MAUER_PREIS[P.mauer]) moeglich.push({ kat: "mauer", preis: MAUER_PREIS[P.mauer] * 1.5, kosten: MAUER_PREIS[P.mauer], tu: () => { P.mauer++; } });
    // 🏗️ Freie Türme: neuer Turm auf den besten freien Platz (guterPlatz). Jeder weitere Turm ist dem Bot etwas weniger wert
    // als ein Ausbau (preis steigt mit der Zahl der Türme), sonst stellt er nur billige Türme hin.
    {
      const anzahl = (a) => Object.values(P.tuerme).filter((t) => t.art === a).length;
      const ziel = { pfeil: 9, katapult: 2, kanone: 2, eis: 1, blitz: 1, gift: BOT_GIFT };
      // erst ein Pfeilturm, dann ein Katapult, danach das Teuerste, was noch fehlt
      const art = anzahl('pfeil') === 0 ? 'pfeil'
        : ['blitz', 'gift', 'kanone', 'katapult', 'eis', 'pfeil'].find((a) => TUERME[a].ab <= P.nacht && anzahl(a) < ziel[a]) || 'pfeil';
      const kosten = turmPreis(art);
      moeglich.push({ kat: "turm", preis: kosten * (1 + BOT_TURM_MEHR * Math.max(0, zahl - 3)), kosten, tu: () => {
        const p = guterPlatz(art);
        if (p) P.tuerme[neueTurmId()] = { art, wahl: [], x: p.x, y: p.y, bezahlt: kosten }; else P.gold += kosten;
      } });
    }
    for (const tw of Object.values(P.tuerme)) {
      const st = turmStufe(tw);
      if (st < MAX_STUFE && ausbauOffen()) moeglich.push({ kat: st >= 4 ? "meister" : "ausbau", preis: ausbauPreis(tw.art, st), tu: () => tw.wahl.push(st % 2 ? 'a' : 'b') });
      else if ((tw.vet || 0) < VETERAN_MAX) { const vp = veteranPreis(tw.art, tw.vet || 0); moeglich.push({ kat: "veteran", preis: vp * 1.3, kosten: vp, tu: () => { tw.vet = (tw.vet || 0) + 1; } }); }   // 🎖️ Veteranen (data.js)
    }
    // preis = wie gern der Bot es kauft (Mauer nachrangig), kosten = was es wirklich kostet
    const billig = moeglich.filter((m) => (m.kosten ?? m.preis) <= P.gold).sort((a, b) => a.preis - b.preis)[0];
    if (!billig) return;
    P.gold -= billig.kosten ?? billig.preis;
    BOT_AUSG[billig.kat] = (BOT_AUSG[billig.kat] || 0) + (billig.kosten ?? billig.preis);   // fürs Messen: wofür ging das Gold?
    billig.tu();
  }
}

function botTalente() {
  while (punkteFrei() > 0) {
    // nächster Schritt auf dem Weg zum ersten noch offenen Ziel; danach kleine Knoten nahe der Mitte
    const naechster = BOT_ZIELE.map((z) => talentWeg(z)[0]).find((id) => id && !talentSperre(id))
      || Object.values(TALENTE).filter((t) => t.typ !== 'key' && !talentSperre(t.id)).sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))[0]?.id;
    if (!naechster) return;
    P.talente.push(naechster);
  }
  botSteine();
}

// 💎 Steine: Startstein Feuerball; Beute nach Vorliebe (neue Steine in dieser Reihenfolge, dann Stützsteine, dann doppelte);
// in die Sockel kommen die liebsten Steine, Stützsteine reihum in ihre Stützsockel
const BOT_STEINE = [0, 1, 2, 4, 5, 3], BOT_STUETZEN = ['doppelt', 'schnell', 'zuender', 'nachbeben', 'glut', 'reif', 'funke', 'schatten'];
function botBeute(angebot) {
  const wert = (x) => (x.art === 'stein' ? (P.steine[x.t] ? 30 : 0) + BOT_STEINE.indexOf(x.t) : 10 + BOT_STUETZEN.indexOf(x.id));
  return [...angebot].sort((a, b) => wert(a) - wert(b))[0];
}
function botSteine() {
  if (!steinBesitz().length) P.steine[BOT_STEINE[0]] = true;
  const n = sockelZahl(), liebste = BOT_STEINE.filter((t) => P.steine[t]).slice(0, n);
  P.sockel = Array.from({ length: n }, (_, i) => liebste[i] ?? null);
  // alle Verstärker einsammeln (Vorrat + schon eingesetzte – beuteNehmen setzt sie selbst ein) und neu verteilen
  const alle = [...new Set([...(P.stuetzVorrat || []), ...Object.values(P.stuetzen || {}).flat()])];
  P.stuetzen = {}; P.stuetzVorrat = alle;
  const vorrat = [...alle].sort((a, b) => BOT_STUETZEN.indexOf(a) - BOT_STUETZEN.indexOf(b));
  for (let j = 0; j < STUETZ_MAX; j++) for (const t of liebste) if (stuetzSockel(t) > j && vorrat.length) (P.stuetzen[t] ||= []).push(vorrat.shift());
}

// typ: gut = alle Sterne · mittel = keine Sterne · schwach = jeder zweite Versuch scheitert (Teillohn 50 %)
// typ 'endlos' = ♾️ Endlos-Modus: kein Tag, nur Kopfgeld (tage = Zahl der Nächte)
function botLauf(typ = 'gut', tage = 40) {
  const echt = P, zeilen = [], endlosVorher = ENDLOS;
  ENDLOS = typ === 'endlos';
  P = ENDLOS ? endlosStand() : neuerStand();
  BOT_AUSG = {};
  let versuch = 0;
  for (let tag = 1; tag <= tage; tag++) {
    // Morgen: Roboter (gut = Code klappt immer und ist sparsam, mittel = klappt, schwach = jeder zweite Morgen)
    let robo = 0;
    for (const id of Object.keys(P.roboter)) {
      if (typ === 'schwach' && tag % 2) continue;
      robo += roboLohn(hofById(id), typ === 'gut');
    }
    P.gold += robo;
    // Tag
    const h = ENDLOS ? null : naechsterHof();
    let lohn = 0;
    if (ENDLOS) { /* kein Tag */ } else if (h) {
      const klappt = typ !== 'schwach' || versuch++ % 2 === 1;
      if (klappt) {
        lohn = h.lohn * (typ === 'gut' ? 1 + 2 * STERN_BONUS : 1);
        // Sterne (zählen auch für den ⭐ Ruhm): gut holt beide, mittel einen, schwach keinen
        P.hoefe[h.id] = { fertig: true, kurz: typ !== 'schwach', sparsam: typ === 'gut', versuche: 1, tipps: 0, heute: 0 };
      } else lohn = h.lohn * TEILLOHN * 0.5;
    } else lohn = burgHoefe().at(-1).lohn * NACHARBEIT;   // alles gelöst: Nacharbeit
    P.gold += Math.round(lohn);
    // Abend
    botKaufen();
    botTalente();
    // Nacht
    // In der Wellenpause: XP gutschreiben und Talente lernen, wie ein Spieler es tut
    // In der Wellenpause auch das Nacht-Gold von Welle 1 ausgeben (wie live)
    const n = P.nacht, N = simNacht(n, (N) => {
      P.xp += N.xp; N.xp = 0; botTalente();
      const d = Math.floor(N.gold) - N.goldGezahlt; P.gold += d; N.goldGezahlt += d; botKaufen();
      nachtAufstellen(N, false);
    }), sieg = N.ende === 'gehalten';
    staerkeMerken(N);
    P.xp += Math.round(sieg ? N.xp + welleXp(n) * (N.ruhm || 1) : N.xp / 2);
    const nachtgold = Math.max(0, Math.round(N.gold + (sieg ? welleXp(n) * N.goldJe : 0)) - N.goldGezahlt) + N.goldGezahlt;
    P.gold += nachtgold - N.goldGezahlt;
    // 💎 Beute nach der Nacht
    P.beute += N.beute || 0;
    while (P.beute >= 1) { P.beute -= 1; const a = beuteAngebot(); if (a.length) beuteNehmen(botBeute(a)); }
    botSteine();
    if (sieg) { P.nacht++; P.niederlagen = 0; } else P.niederlagen++;
    ruhmNachNacht(sieg, n, N);   // ⭐ Ruhm wie in nachtEnde (mit Bonus für Mauer/Wache ohne Schaden)
    zeilen.push({ tag, dauer: Math.round(N.t), hof: h ? h.id : '–', lohn: Math.round(lohn), robo, nachtgold, roboter: Object.keys(P.roboter).length, nacht: n, ergebnis: sieg ? `✓ ${Math.ceil(N.hp)}/${N.max}` : '✗', xp: P.xp,
      gold: P.gold, ruhm: ruhm(), sterne: ENDLOS ? 0 : sternePunkte(), schaetze: Object.keys(SCHAETZE).filter(schatzHat).length, tuerme: Object.values(P.tuerme).map((t) => TUERME[t.art].ico + turmStufe(t)).join(''), level: heldLevel().level });
  }
  window.BOT_LETZT = P; window.BOT_AUSG = BOT_AUSG;   // zum Nachmessen (z. B. simNacht mit dem Stand des Bots)
  P = echt; ENDLOS = endlosVorher;
  return zeilen;
}

// Kurzfassung: an welchem Tag wurde welche Nacht gehalten, wie oft verloren?
function botBericht(typ, tage = 40) {
  const z = botLauf(typ, tage);
  const verloren = z.filter((r) => r.ergebnis === '✗').map((r) => `T${r.tag}:N${r.nacht}`);
  const letzte = z[z.length - 1];
  let stau = 0, lauf = 0;
  for (const r of z) { lauf = r.ergebnis === '✗' ? lauf + 1 : 0; stau = Math.max(stau, lauf); }
  const bei = (t) => z[Math.min(z.length, t) - 1];
  return { typ, erreicht: `Nacht ${letzte.nacht} an Tag ${tage}`, verloren: verloren.length, laengsteSträhne: stau, wo: verloren.slice(0, 14).join(' '),
    nachtBeiTag: [10, 20, 30, 40, 50].map((t) => `T${t}:N${bei(t).nacht}`).join(' '),
    levelBeiTag: [10, 20, 30, 40, 50].map((t) => `T${t}:L${bei(t).level}`).join(' '),
    goldBeiTag: [10, 20, 30, 40, 50].map((t) => `T${t}:${bei(t).gold}`).join(' '),
    ruhmBeiTag: [10, 20, 30, 40, 50].map((t) => `T${t}:🏆${bei(t).ruhm} ⭐${bei(t).sterne} 🎁${bei(t).schaetze}`).join(' '),
    hofBeiTag: [10, 20, 30, 40, 50].map((t) => `T${t}:${bei(t).hof}`).join(' '),
    roboBeiTag: [10, 20, 30, 40, 50].map((t) => `T${t}:${bei(t).roboter}🤖+${bei(t).robo}`).join(' '),
    tuerme: letzte.tuerme };
}

window.ATC_BALANCE = { lauf: botLauf, bericht: botBericht };
