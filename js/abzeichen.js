// 🏅 Zwei Abzeichen-Leitern (Nutzerwunsch 2026-11-13: „Sterne und Ruhm getrennt, beide mit coolen Badges,
// und es soll nicht nur Deko geben, sondern Zauber, Türme, Fähigkeiten, die man bekommt oder dann kaufen kann“).
//   ⭐ Programmier-Abzeichen: Sterne aus den Aufgaben (+ P.sterneExtra aus dem Kerker). Schwellen als Anteil der Sterne
//      dieser Burg – so passt die Leiter zu jeder Burg. Wer schwächer verteidigt, kann trotzdem stolz auf seine Schätze sein.
//   🏆 Kampf-Abzeichen: Ruhm-Rekord aus der Verteidigung (RUHM_ABZEICHEN in data.js).
// Jede Stufe schaltet einen Schatz frei: preis 0 = geschenkt (wirkt sofort), sonst einmal kaufen (P.schaetze[id]).
// Wirkung über mod wie bei den Talenten (talentWerte → schatzMods).

const SCHAETZE = {
  // ⭐ Programmier-Schätze
  gluecksklee: { ico: '🍀', name: 'Glücksklee', preis: 0, text: 'Monster lassen 10 % mehr Kopfgeld fallen.', mod: { kopfgeld: 0.1 } },
  ruebenregen: { ico: '🥕', name: 'Rübenregen', preis: 120, text: 'Neuer Zauber (ohne Zauberplatz): Alle 18 s prasseln 7 Rüben auf die größte Gruppe – jede trifft und lässt kurz stolpern.', mod: { zauber: 'ruebenregen' } },
  sturmturm: { ico: '🌪️', name: 'Sturmturm', preis: 0, text: 'Neue Turmart: Der Sturmturm pustet Monster auf dem Weg zurück. Du findest ihn in der Bauleiste.', mod: { turm_wind: 1 } },
  eule: { ico: '🦉', name: 'Wächtereule', preis: 300, text: 'Eine Eule kreist über der Burg und greift überall an – auch im Nebel am Portal. Sie wird mit deinem Helden stärker.', mod: { eule: 0.6 } },
  werkzeug: { ico: '🧰', name: 'Werkzeugkiste', preis: 0, text: 'Türme und ihre Ausbauten kosten 10 % weniger.', mod: { turm_rabatt: 0.1 } },
  schnellzauber: { ico: '⚡', name: 'Schnellzauber', preis: 600, text: 'Alle Zauber sind 15 % schneller wieder bereit.', mod: { cd_alle: 0.15 } },
  kombokern: { ico: '🔗', name: 'Kombo-Kern', preis: 900, text: 'Kombos sind 35 % stärker und die Kombo-Leiste füllt sich 30 % schneller.', mod: { kombo_kraft: 0.35, kombo_laden: 0.3 } },
  zauberbuch: { ico: '📘', name: 'Zauberbuch', preis: 0, text: 'Dein Held bekommt einen Zauberplatz mehr.', mod: { zauberplatz: 1 } },
  drachling: { ico: '🐲', name: 'Drachling', preis: 1800, text: 'Ein kleiner Drache wohnt über dem Tor und spuckt schnell Feuer auf alle Monster in der Nähe der Burg. Er wächst mit deinem Helden.', mod: { drachling: 1 } },
  tastenkrone: { ico: '👑', name: 'Krone der Tastatur', preis: 0, text: 'Dein Held, Zauber und Türme machen 12 % mehr Schaden.', mod: { held_dmg: 0.12, alle_dmg: 0.12, turm_dmg: 0.12 } },
  // 🏆 Kampf-Schätze
  trommel: { ico: '🥁', name: 'Kriegstrommel', preis: 0, text: 'Deine Türme schießen 8 % schneller.', mod: { turm_tempo: 0.08 } },
  meisterschuss: { ico: '🏹', name: 'Meisterschuss', preis: 150, text: 'Dein Held schießt bei jedem Angriff einen Pfeil mehr.', mod: { held_pfeile: 1 } },
  turmbanner: { ico: '🚩', name: 'Turmbanner', preis: 0, text: 'Alle Türme machen 10 % mehr Schaden.', mod: { turm_dmg: 0.1 } },
  meteor: { ico: '☄️', name: 'Meteor', preis: 400, text: 'Neuer Zauber (ohne Zauberplatz): Alle 25 s stürzt ein Meteor auf die größte Gruppe, danach brennt der Boden.', mod: { zauber: 'meteor' } },
  fernrohr: { ico: '🔭', name: 'Fernrohr', preis: 0, text: 'Türme reichen 0,4 Felder weiter, Zauber und dein Held 1 Feld weiter.', mod: { turm_reich: 0.4, zauber_reich: 1, held_reich: 1 } },
  drachenbanner: { ico: '🐉', name: 'Drachenbanner', preis: 900, text: 'Alles macht 25 % mehr Schaden gegen Anführer, Trolle und Drachen.', mod: { boss_dmg: 0.25 } },
  // Schlüssel bleibt „riesenglocke“ (RUHM_ABZEICHEN in data.js, schon gekaufte Stände) – die Riesenglocke gibt es aber schon
  // als ✦ Wunder im Talentnetz, darum ist der Schatz jetzt die Turmuhr (gegner_tempo wirkt in nacht.js)
  riesenglocke: { ico: '🕰️', name: 'Turmuhr', preis: 1400, text: 'Die Turmuhr über dem Tor geht langsamer: Alle Monster laufen 12 % langsamer – Türme, Zauber und dein Held haben mehr Zeit.', mod: { gegner_tempo: 0.12 } },
  kronplatz: { ico: '👑', name: 'Kronplatz', preis: 0, text: 'Dein Held bekommt einen Zauberplatz mehr.', mod: { zauberplatz: 1 } },
  sternenfall: { ico: '🌠', name: 'Sternenfall', preis: 2500, text: 'Neuer Zauber (ohne Zauberplatz): Alle 24 s fallen fünf Sterne auf die fünf zähesten Monster.', mod: { zauber: 'sternenfall' } },
  goldburg: { ico: '✨', name: 'Goldene Burg', preis: 0, text: 'Die Mauer hält 10 Treffer mehr, dein Held, Zauber und Türme machen 12 % mehr Schaden.', mod: { mauer: 10, held_dmg: 0.12, alle_dmg: 0.12, turm_dmg: 0.12 } },
};

// ⭐ Programmier-Abzeichen: [Anteil der Sterne dieser Burg, Symbol, [Name m, Name w], Schatz]
const STERN_ABZEICHEN_ROH = [
  [0.04, '🌱', ['Code-Keimling', 'Code-Keimling'], 'gluecksklee'],
  [0.1, '🥕', ['Rübenhacker', 'Rübenhackerin'], 'ruebenregen'],
  [0.18, '🔁', ['Schleifendreher', 'Schleifendreherin'], 'sturmturm'],
  [0.27, '🐛', ['Käferjäger', 'Käferjägerin'], 'eule'],
  [0.37, '🧠', ['Algorithmus-Ass', 'Algorithmus-Ass'], 'werkzeug'],
  [0.48, '⚡', ['Turbo-Tipper', 'Turbo-Tipperin'], 'schnellzauber'],
  [0.6, '🤖', ['Robo-Flüsterer', 'Robo-Flüsterin'], 'kombokern'],
  [0.72, '🧙', ['Code-Magier', 'Code-Magierin'], 'zauberbuch'],
  [0.85, '🌌', ['Sternenprogrammierer', 'Sternenprogrammiererin'], 'drachling'],
  [1, '🐉', ['Legende der Tastatur', 'Legende der Tastatur'], 'tastenkrone'],
];
const sternePunkte = () => sterneZahl() + (P.sterneExtra || 0);
const sternMax = () => ENDLOS ? 0 : 2 * burgHoefe().length;
// Schwellen dieser Burg (mindestens 2 Sterne Abstand, damit kleine Burgen nicht zwei Abzeichen auf einmal geben)
function sternAbzeichen() {
  const max = sternMax();
  let vor = 0;
  return STERN_ABZEICHEN_ROH.map(([anteil, ico, namen, schatz]) => {
    const ab = Math.max(vor + 2, Math.round(anteil * max));
    vor = ab;
    return { ab, ico, namen, schatz, name: namen[PROFIL.figur === 'w' ? 1 : 0] };
  });
}
// art: 'stern' | 'kampf' → Liste, aktueller Wert (Sterne bzw. Ruhm-Rekord)
const abzListe = (art) => art === 'stern' ? sternAbzeichen() : RUHM_ABZEICHEN;
const abzWert = (art) => art === 'stern' ? sternePunkte() : ruhmRekord();
const abzLeiterDa = (art) => art === 'kampf' || sternMax() > 0;
const abzAktuell = (art) => [...abzListe(art)].reverse().find((a) => abzWert(art) >= a.ab) || null;
const abzNaechstes = (art) => abzListe(art).find((a) => abzWert(art) < a.ab) || null;

// Schätze: frei = Abzeichen erreicht, hat = frei und (geschenkt oder gekauft)
function schatzFrei(id) {
  for (const art of ['stern', 'kampf']) if (abzLeiterDa(art) && abzListe(art).some((a) => a.schatz === id && abzWert(art) >= a.ab)) return true;
  return false;
}
const schatzHat = (id) => !!SCHAETZE[id] && schatzFrei(id) && (SCHAETZE[id].preis === 0 || !!P.schaetze?.[id]);
// Zauber-Schatz, den schon ein gelerntes ✦ Wunder im Talentnetz gibt (z. B. ☄️ Meteor): Kaufen brächte nichts
const schatzSchonWunder = (id) => {
  const z = SCHAETZE[id]?.mod?.zauber;
  return !!z && typeof TALENTE !== 'undefined' && (P?.talente || []).some((t) => TALENTE[t]?.mod?.zauber === z);
};
function schatzMods() {
  if (typeof P === 'undefined' || !P) return [];
  return Object.keys(SCHAETZE).filter(schatzHat).map((id) => SCHAETZE[id].mod);
}
const schatzSumme = (key) => schatzMods().reduce((s, m) => s + (typeof m[key] === 'number' ? m[key] : 0), 0);

// Vor der Nacht / nach dem Tag: Stand merken, um neue Abzeichen zu melden (nachtEnde)
function abzeichenNeu(art, vorher) {
  return abzListe(art).filter((a) => vorher < a.ab && abzWert(art) >= a.ab);
}
function abzNeuHtml(art, liste) {
  return figurText(liste.map((a) => {
    const s = SCHAETZE[a.schatz];
    return `<div class="abzneu"><i>${a.ico}</i><div><b>Neues ${art === 'stern' ? 'Programmier' : 'Kampf'}-Abzeichen: ${esc(a.name)}!</b><br>
      <span class="hinweis">🎁 Freigeschaltet: ${s.ico} <b>${esc(s.name)}</b> – ${esc(s.text)} ${s.preis ? `Kaufen für ${s.preis} 🪙: ${art === 'stern' ? '⭐' : '🏆'} oben antippen.` : 'Wirkt ab sofort!'}</span></div></div>`;
  }).join(''));
}

// --- Karte: eine Leiter mit allen Stufen und ihren Schätzen; Schatz antippen = auswählen, Knopf darunter = kaufen ---
let ABZ_SEL = null, ABZ_ART = 'stern';
function abzeichenKarte(art = ABZ_ART) {
  if (!abzLeiterDa(art)) art = 'kampf';
  ABZ_ART = art; ABZ_SEL = null;
  karte('<div id="abzKarte"></div>', [{ label: 'Schließen', fn: () => { hud(); if (P.phase === 'abend' && typeof abendStart === 'function') abendStart(); } }]);
  $('#overlay .sheet').classList.add('breit');
  abzRender();
}
function abzRender() {
  const art = ABZ_ART, liste = abzListe(art), w = abzWert(art), akt = abzAktuell(art), nx = abzNaechstes(art);
  const tabs = abzLeiterDa('stern')
    ? `<div class="ttabs"><button data-abz="stern" class="${art === 'stern' ? 'an' : ''}">⭐ Programmieren</button><button data-abz="kampf" class="${art === 'kampf' ? 'an' : ''}">🏆 Verteidigen</button></div>` : '';
  const kopf = art === 'stern'
    ? `<h2>⭐ ${sternePunkte()} Sterne</h2><p>Sterne bekommst du bei den Aufgaben (kurz und sparsam, dazu ⭐ aus dem Kerker). Jedes Abzeichen schaltet einen Schatz für die Nacht frei – Sterne gehen nie verloren.</p>`
    : `<h2>🏆 Ruhm ${ruhm()} <span class="hinweis">· Rekord ${ruhmRekord()}</span></h2><p>Ruhm kommt nur aus der Verteidigung: gehaltene Nacht +1, Mauer ohne Kratzer +1, Torwache unverletzt +1, und jede weitere Nacht ohne Kratzer in Folge noch mehr (🔥 Glanzserie${P.ruhmSerie > 1 ? `, jetzt ${P.ruhmSerie}` : ''}). Eine verlorene Nacht kostet Ruhm. Mit dem Ruhm kommen stärkere Monster (jetzt +${Math.round((ruhmFaktor() - 1) * 100)} %), dafür mehr XP, Kopfgeld und Beute (+${Math.round((ruhmLohn() - 1) * 100)} %). Die Abzeichen zählen nach deinem Rekord – sie gehen nicht verloren.</p>`;
  const zeilen = liste.map((a) => {
    const da = w >= a.ab, s = SCHAETZE[a.schatz], hat = schatzHat(a.schatz), sel = ABZ_SEL === a.schatz;
    const wunder = da && !hat && schatzSchonWunder(a.schatz);
    const status = !da ? `🔒 ab ${a.ab}` : hat ? (s.preis ? '✅ gekauft' : '✅ wirkt') : wunder ? '✦ hast du schon (Wunder)' : `🪙 ${s.preis}`;
    return `<div class="abzstufe ${da ? 'da' : ''} ${sel ? 'sel' : ''}" data-schatz="${a.schatz}">
      <div class="abzico">${da ? a.ico : '🔒'}</div>
      <div class="abztext"><b>${da ? esc(a.name) : '???'}</b> <small>${a.ab} ${art === 'stern' ? '⭐' : '🏆'}</small><br>
        <span class="abzschatz">${s.ico} <b>${esc(s.name)}</b>${s.preis ? '' : ' 🎁'}: ${esc(s.text)}</span></div>
      <div class="abzstatus ${hat || wunder ? 'ok' : ''}">${status}</div></div>
      ${sel && da && !hat && !wunder ? `<div class="kaufzeile"><button class="btn gold" id="abzKauf" ${P.gold < s.preis ? 'disabled' : ''}>🪙 ${s.ico} ${esc(s.name)} kaufen · ${s.preis}${P.gold < s.preis ? ` ${fehlt(s.preis)}` : ''}</button></div>` : ''}`;
  }).join('');
  $('#abzKarte').innerHTML = figurText(`${tabs}${kopf}
    ${akt ? `<p><b>Dein Abzeichen: ${akt.ico} ${esc(akt.name)}</b></p>` : ''}
    <div class="abzleiter">${zeilen}</div>
    ${nx ? `<p class="hinweis">Nächstes: ${nx.ico} ${esc(nx.name)} – noch ${nx.ab - w} ${art === 'stern' ? 'Sterne' : 'Ruhm (Rekord)'}.</p>` : '<p class="hinweis">Alle Abzeichen gesammelt – du bist eine Legende!</p>'}`);   // „Dein Held“ → „Deine Heldin“
  for (const b of document.querySelectorAll('[data-abz]')) b.onclick = () => { ABZ_ART = b.dataset.abz; ABZ_SEL = null; abzRender(); };
  for (const z of document.querySelectorAll('.abzstufe')) z.onclick = () => {
    const id = z.dataset.schatz;
    ABZ_SEL = ABZ_SEL === id || !schatzFrei(id) || schatzHat(id) || schatzSchonWunder(id) ? null : id;   // nur Kaufbares lässt sich auswählen
    abzRender();
  };
  const kb = $('#abzKauf');
  if (kb) kb.onclick = () => schatzKaufen(ABZ_SEL);
}
function schatzKaufen(id) {
  const s = SCHAETZE[id];
  if (!s || !schatzFrei(id) || schatzHat(id) || schatzSchonWunder(id) || P.gold < s.preis) return;
  P.gold -= s.preis;
  (P.schaetze ||= {})[id] = true;
  speichern();
  if (P.phase === 'nacht' && typeof N !== 'undefined' && N) nachtAufstellen(N);   // in der Wellenpause gleich wirksam
  toast(`${s.ico} ${s.name} gehört jetzt dir!`);
  ABZ_SEL = null;
  hud(); if ($('#abzKarte')) abzRender();
}
