'use strict';
// --- 🪄 Zauber, Zauberplätze und Verstärker -------------------------------------------------------------------
// Vereinfacht 2026-11-09 (Nutzerwunsch, für Klasse 7): keine Steine, keine Sockel, kein Zauberstab, kein Händler.
// Zauber sind einfach Zauber. Einen wählt man vor der ersten Nacht, weitere lassen die 👑 Anführer fallen
// (Beute: aus zwei Angeboten einen wählen). Der Held hat Zauberplätze – mehr gibt es mit dem Level (ZAUBERPLATZ_AB).
// In den Plätzen kann man jederzeit kostenlos wechseln; ein Zauber außerhalb der Plätze wirkt nicht. Das Talentnetz wirkt immer.
// Findet man einen Zauber ein zweites Mal, bekommt er einen ➕ Verstärker-Platz – danach ist er aus dem Beutepool.
// Weitere Verstärker-Plätze kauft man (STUETZ_PREIS, ab Nacht 11 oder wenn alle Aufgaben gelöst sind = Gold-Senke).
// ➕ Verstärker verändern, WIE ein Zauber wirkt; jeden gibt es nur einmal.
// 🔗 Kombos: Zauber zweier Richtungen in den Plätzen, Dreier-Kombos: dreier Richtungen.
// Zustand (Namen aus der Stein-Zeit, nur Code): P.steine {Richtung: true} = Zauber, die man hat; P.sockel [Richtung|null] = Zauberplätze;
// P.doppelt, P.stuetzSockel {Richtung: Anzahl} = Verstärker-Plätze, P.stuetzen {Richtung: [id …]}, P.stuetzVorrat, P.stuetzGekauft,
// P.beute (Zähler), P.beuteWahl (offenes Angebot).

const STEINE = [   // Index = Richtung (THEMEN)
  { ico: '🔥', name: 'Feuerball', text: 'Eine Explosion dort, wo die meisten Gegner stehen, alle 8 s.', mod: { zauber: 'feuerball' } },
  { ico: '❄️', name: 'Eiswelle', text: 'Bremst alle Gegner um das Ziel, alle 8 s.', mod: { zauber: 'eiswelle' } },
  { ico: '🌩️', name: 'Kettenblitz', text: 'Springt über 4 Gegner, alle 6 s.', mod: { zauber: 'kettenblitz' } },
  { ico: '🛡️', name: 'Schutzzauber', text: 'Alle 14 s fängt ein Schild 2 Schaden an der Mauer ab.', mod: { zauber: 'schutz' } },
  { ico: '🏹', name: 'Doppelschuss', text: 'Der Held trifft mit jedem Angriff 2 Gegner und greift 15 % schneller an.', mod: { held_pfeile: 1, held_tempo: 0.15 } },
  { ico: '🧿', name: 'Fluch', text: 'Treffer des Helden verfluchen 1,5 s: Der Gegner wird gebremst und nimmt 10 % mehr Schaden.', mod: { held_bremse: 1.5, fluch_dmg: 0.1 } },
];
// 🪄 Zauberplätze nach Level: 1 Platz, ab Level 5 zwei (genug für eine 🔗 Kombo), ab 15 drei (Dreier-Kombos), ab 28 vier
// (mit 3/12/22 war es leichter als mit den alten Zauberstäben: das Gold für die Stäbe floss in Türme)
const ZAUBERPLATZ_AB = [1, 5, 15, 28];
const platzZahl = (level = heldLevel().level) => ZAUBERPLATZ_AB.filter((l) => level >= l).length;
const sockelZahl = () => platzZahl() + (talentHat('zauberplatz') ? 1 : 0) + schatzSumme('zauberplatz');   // + 🏅 Schätze (abzeichen.js)   // ✦ Wunder „Fünfter Zauberplatz“ (talente.js)
const naechsterPlatzAb = () => ZAUBERPLATZ_AB.find((l) => l > heldLevel().level);
const STUETZ_MAX = 3;                          // Verstärker-Plätze je Zauber
const STUETZ_PREIS = [300, 600, 1000, 1500, 2200, 3000, 4000, 5000, 6000, 7000, 8000, 9000];   // jeder gekaufte Platz teurer
const stuetzOffen = () => P.nacht > KAMPAGNE || alleAufgabenGeloest();

// ➕ Verstärker: wirk/was je Richtung des Zaubers (dieselben Mechaniken wie im Talentnetz); element = zählt für Kombos mit
const STUETZEN = {
  doppelt: { ico: '🔱', name: 'Doppelt', wirk: [{ fb_doppelt: 0.6 }, { fn_doppel: true }, { kb_gabel: true }, { schutz_doppel: true }, { held_pfeile: 1 }, { fluch_spring: 2 }],
    was: ['ein zweiter Feuerball fliegt mit (60 %)', 'die Eiswelle trifft auch die zweitgrößte Gruppe', 'der Kettenblitz teilt sich in zwei Ketten', 'zwei Schilde auf einmal', 'ein Ziel mehr pro Angriff', 'der Fluch springt auf 2 Nachbarn'] },
  schnell: { ico: '⏳', name: 'Schnell', wirk: [{ fb_cd: 0.3 }, { fn_cd: 0.3 }, { kb_cd: 0.3 }, { sz_cd: 0.3 }, { held_tempo: 0.25 }, { held_bremse: 1 }],
    was: ['Feuerball 30 % schneller bereit', 'Eiswelle 30 % schneller bereit', 'Kettenblitz 30 % schneller bereit', 'Schutzzauber 30 % schneller bereit', 'Held greift 25 % schneller an', 'der Fluch hält 1 s länger'] },
  nachbeben: { ico: '💥', name: 'Nachbeben', wirk: [{ fb_brand: 4 }, { fn_feld: 4 }, { kb_donner: 10 }, { dornschild: 8 }, { splitpfeil: 0.4 }, { verwirrt: 1 }],
    was: ['der Boden brennt nach dem Einschlag', 'ein Schneefeld bleibt liegen', 'das letzte Ziel der Kette explodiert', 'fängt der Schild etwas ab, nehmen alle am Tor 8 Schaden', 'Splitter fliegen auf Gegner dahinter', 'neu Verfluchte laufen 1 s rückwärts'] },
  zuender: { ico: '🌶️', name: 'Zünder', wirk: [{ fb_zuend: 3 }, { schockfrost: 0.5 }, { ueberladung: 1.5 }, { feuerwall: 5 }, { glutpfeile: 4 }, { fluch_xp: 1 }],
    was: ['Getroffene brennen 3 s', 'der erste Treffer auf jeden Gegner friert ihn kurz ein', 'wer 3-mal vom Blitz getroffen wird, steht still', 'wirkt der Schild, brennt der Boden vor dem Tor', 'jeder 4. Treffer lässt den Boden glühen', 'verfluchte Gegner geben 1 XP extra'] },
  glut: { ico: '🔥', name: 'Glut', element: 0, wirk: [], was: Array(6).fill('zählt für Kombos auch als 🔥 Feuer') },
  reif: { ico: '❄️', name: 'Reif', element: 1, wirk: [], was: Array(6).fill('zählt für Kombos auch als ❄️ Frost') },
  funke: { ico: '⚡', name: 'Funke', element: 2, wirk: [], was: Array(6).fill('zählt für Kombos auch als ⚡ Blitz') },
  schatten: { ico: '🌑', name: 'Schatten', element: 5, wirk: [], was: Array(6).fill('zählt für Kombos auch als 🧿 Schatten') },
};

const steinBesitz = () => Object.keys(P.steine || {}).map(Number).sort((a, b) => a - b);
const stuetzSockel = (t) => (P.stuetzSockel?.[t] || 0);
// Zauberplätze aufräumen: so viele wie das Level erlaubt; ein neuer Platz nimmt gleich einen freien Zauber auf
function sockel() {
  const n = sockelZahl();
  P.sockel = (P.sockel || []).map((t) => (t !== null && P.steine[t] ? t : null)).slice(0, n);
  while (P.sockel.length < n) P.sockel.push(steinBesitz().find((t) => !P.sockel.includes(t)) ?? null);
  P.stuetzen ||= {};
  // P.stuetzVorrat = alle eigenen Verstärker (eingesetzt oder nicht); früher fehlten direkt eingesetzte darin und gingen beim Herausnehmen verloren
  P.stuetzVorrat ||= [];
  for (const id of Object.values(P.stuetzen).flat()) if (!P.stuetzVorrat.includes(id)) P.stuetzVorrat.push(id);
  for (const t of steinBesitz()) P.stuetzen[t] = (P.stuetzen[t] || []).slice(0, stuetzSockel(t));
  return P.sockel;
}
const ausgeruestet = () => sockel().filter((t) => t !== null);
// Richtungen, die für Kombos zählen: Zauber in den Plätzen + Element-Verstärker an ihnen
function aktiveElemente() {
  const el = new Set(ausgeruestet());
  for (const t of ausgeruestet()) for (const id of P.stuetzen[t] || []) if (STUETZEN[id].element !== undefined) el.add(STUETZEN[id].element);
  return el;
}
// Wirkungen der Zauber in den Plätzen (Zauber + Verstärker) als mod-Objekte für talentWerte
function steinMods() {
  const mods = [];
  for (const t of ausgeruestet()) {
    mods.push(STEINE[t].mod);
    for (const id of P.stuetzen[t] || []) if (STUETZEN[id].wirk[t]) mods.push(STUETZEN[id].wirk[t]);
  }
  return mods;
}

// --- Beute: 👑 Anführer bringen 0,4, Drachen 1 – ab 1 gibt es einen Zauber (P.beute beginnt bei 1: der erste Anführer bringt sicher einen) ---
// Pool: Zauber, die man noch nicht hat, und einmal jeden doppelt (= Verstärker-Platz); Verstärker, sobald ein Zauber einen Platz dafür hat
const BEUTE_ANFUEHRER = 0.4, BEUTE_DRACHE = 1;
function beutePool() {
  const neu = STEINE.map((_, t) => t).filter((t) => !P.steine[t]).map((t) => ({ art: 'stein', t }));
  const doppelt = steinBesitz().filter((t) => !P.doppelt?.[t]).map((t) => ({ art: 'stein', t }));
  const stuetzen = Object.values(P.stuetzSockel || {}).some((n) => n > 0)
    ? Object.keys(STUETZEN).filter((id) => !(P.stuetzVorrat || []).includes(id) && !Object.values(P.stuetzen || {}).flat().includes(id)).map((id) => ({ art: 'stuetze', id })) : [];
  return [...neu, ...neu, ...doppelt, ...stuetzen];   // neue Zauber doppelt so wahrscheinlich
}
function beuteAngebot() {
  const pool = beutePool(), wahl = [];
  while (wahl.length < 2 && pool.length) {
    const x = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    if (!wahl.some((w) => w.art === x.art && w.t === x.t && w.id === x.id)) wahl.push(x);
  }
  return wahl;
}
function beuteNehmen(x) {
  P.beuteWahl = null;
  if (x.art === 'stuetze') {
    // gleich an einen eingesetzten Zauber mit freiem Verstärker-Platz (Spieltest: sonst lag er unbemerkt im Vorrat)
    (P.stuetzVorrat ||= []).push(x.id);
    const t = sockel().find((s) => s !== null && (P.stuetzen?.[s] || []).length < stuetzSockel(s));
    if (t !== undefined) { ((P.stuetzen ||= {})[t] ||= []).push(x.id); return 'eingesetzt:' + t; }
    return 'vorrat';
  }
  if (P.steine[x.t]) {   // doppelt: ein Verstärker-Platz für diesen Zauber, danach ist er aus dem Pool
    (P.doppelt ||= {})[x.t] = true;
    (P.stuetzSockel ||= {})[x.t] = stuetzSockel(x.t) + 1;
    return 'doppelt';
  }
  P.steine[x.t] = true;
  const s = sockel(), frei = s.indexOf(null);
  if (frei >= 0) P.sockel[frei] = x.t;
}
const beuteName = (x) => (x.art === 'stein' ? `${STEINE[x.t].ico} ${STEINE[x.t].name}` : `➕ ${STUETZEN[x.id].ico} ${STUETZEN[x.id].name}`);
function beuteText(x) {
  if (x.art === 'stuetze') return `Verstärker: ${STUETZEN[x.id].element !== undefined ? STUETZEN[x.id].was[0] : 'z. B. ' + STUETZEN[x.id].was.slice(0, 2).join(' · ')}.`;
  if (!P.steine[x.t]) return `Neu! ${STEINE[x.t].text}`;
  const drin = (P.sockel || []).includes(x.t);
  return `Hast du schon – ein zweites Mal bringt diesem Zauber einen ➕ Verstärker-Platz!${drin ? '' : ' Er wirkt, sobald der Zauber in einem Zauberplatz steckt.'}`;
}
// Auswahlkarte: antippen = auswählen, Knopf = nehmen (nie etwas mit einem einzigen Antippen)
function beuteKarte(angebot, titel, text, weiter) {
  let sel = null;
  const zeig = () => {
    karte(`<h2>${titel}</h2><p>${text}</p><div class="spezwahl">${angebot.map((x, i) => `<button data-beute="${i}" class="${sel === i ? 'sel' : ''}" style="--farbe:${x.art === 'stein' ? THEMEN[x.t].farbe : '#b67aff'}">
      <span class="sico">${x.art === 'stein' ? STEINE[x.t].ico : STUETZEN[x.id].ico}</span><b>${beuteName(x)}</b>
      <span class="hinweis">${esc(beuteText(x))}</span></button>`).join('')}</div>`,
    [{ label: sel === null ? '👆 Erst einen antippen' : `🪄 ${beuteName(angebot[sel])} nehmen`, cls: 'gold', offen: sel === null,
      fn: () => {
        if (sel === null) return;
        const x = angebot[sel], erg = beuteNehmen(x);
        speichern(); hud();
        if (erg?.startsWith?.('eingesetzt:')) toast(`➕ ${STUETZEN[x.id].name} verstärkt jetzt deinen ${STEINE[+erg.slice(11)].ico} ${STEINE[+erg.slice(11)].name}.`, 3500);
        if (erg === 'vorrat') toast(`➕ ${STUETZEN[x.id].name} liegt bereit – einsetzen unter ✨ Talente → 🪄 Zauber (Zauber antippen).`, 4500);
        if (erg === 'doppelt') stuetzErklaeren(x.t, weiter); else weiter?.();
      } }]);
    for (const b of document.querySelectorAll('[data-beute]')) b.onclick = () => { sel = +b.dataset.beute; zeig(); };
  };
  zeig();
}
// Erster doppelter Zauber: erklären, was ein Verstärker-Platz bringt
function stuetzErklaeren(t, weiter) {
  P.gesehen.stuetz = true;
  karte(`<h2>➕ Ein Verstärker-Platz!</h2><p>Dein <b>${STEINE[t].ico} ${STEINE[t].name}</b> hat jetzt einen Platz für einen Verstärker.${(P.sockel || []).includes(t) ? '' : ' Er wirkt, sobald dieser Zauber in einem deiner Zauberplätze steckt (✨ Talente → 🪄 Zauber).'}</p>
    <p>Ein <b>Verstärker</b> verändert, <i>wie</i> der Zauber wirkt – zum Beispiel ${STUETZEN.doppelt.ico} Doppelt: ${esc(STUETZEN.doppelt.was[t])}. Verstärker lassen die 👑 Anführer ab jetzt auch fallen.</p>
    <p class="hinweis">Diesen Zauber findest du nicht noch einmal. Weitere Verstärker-Plätze kannst du kaufen (✨ Talente → 🪄 Zauber)${ENDLOS ? '' : ' – ab Nacht 11 oder wenn alle Aufgaben der Burg gelöst sind'}.</p>`,
  [{ label: 'Verstanden', fn: weiter }]);
}
// Vor der allerersten Nacht: ersten Zauber wählen (alle sechs zur Auswahl)
function startsteinKarte(weiter) {
  P.gesehen.steine = true;   // die Karte erklärt die Zauber (steht danach im Heft)
  beuteKarte(STEINE.map((_, t) => ({ art: 'stein', t })), '🪄 Dein erster Zauber',
    'Dein Held 🧙 kann zaubern. Wähle den ersten Zauber – weitere lassen die 👑 Anführer der Nacht fallen. Wechseln kostet nichts.', weiter);
}

// --- 🪄 Ansicht im Talentblatt: Zauberplätze, weitere Zauber, Verstärker; antippen = auswählen, nochmal = einsetzen/herausnehmen ---
let STEIN_SEL = null, STUETZ_KAUF = null;
function steinRender() {
  const s = sockel(), n = s.length, ab = naechsterPlatzAb();
  if (STEIN_SEL === null || !P.steine[STEIN_SEL]) STEIN_SEL = s.find((t) => t !== null) ?? steinBesitz()[0] ?? null;
  const vorrat = steinBesitz().filter((t) => !s.includes(t));
  const alleStuetzen = (P.stuetzVorrat || []).filter((id) => STUETZEN[id]);
  const stuetzAn = (id) => { for (const t of steinBesitz()) if ((P.stuetzen[t] || []).includes(id)) return t; return null; };
  // Steuerung (Nutzerwunsch 2026-11-13: „erst nach ein paar Versuchen gemerkt, dass man doppelt tippen muss“):
  // Zauber antippen = auswählen (gelb). Ist ein Zauber aus „Weitere Zauber“ gewählt, leuchten die Zauberplätze –
  // einen Platz antippen legt ihn dort ab (ein belegter Platz tauscht). Herausnehmen mit dem Knopf in der Info.
  const ablegen = STEIN_SEL !== null && !s.includes(STEIN_SEL);
  const steinKnopf = (t, extra) => `<button class="stein ${s.includes(t) ? 'an' : ''} ${STEIN_SEL === t ? 'sel' : ''}" ${extra} style="--farbe:${THEMEN[t].farbe}">
    <span class="sico">${STEINE[t].ico}</span><b>${STEINE[t].name}</b>
    ${stuetzSockel(t) ? `<span class="stuetzreihe">${Array.from({ length: stuetzSockel(t) }, (_, j) => { const id = P.stuetzen[t][j]; return `<span class="stuetz ${id ? 'an' : 'leer'}">${id ? STUETZEN[id].ico : '＋'}</span>`; }).join('')}</span>` : ''}</button>`;
  $('#talentBaum').innerHTML = `<div class="tkopf"><h2>🪄 Zauber</h2><span>Zauberplätze ${ausgeruestet().length}/${n}${ab ? ` · nächster Platz ab Level ${ab}` : ''}</span></div>
    <details class="sogehts" ${P.gesehen.steinHilfe ? '' : 'open'}><summary>❓ So geht's</summary>
      <ol><li><b>Nur Zauber in einem Zauberplatz wirken.</b></li>
        <li><b>Wechseln:</b> unten einen Zauber antippen, dann oben einen Zauberplatz antippen – dort wird er abgelegt. Kostet nichts.</li>
        <li><b>Zwei Zauber zusammen</b> ergeben eine 🔗 Kombo – probier verschiedene aus!</li>
        <li><b>Mehr Plätze</b> bekommt dein Held mit dem Level. Findest du einen Zauber doppelt, bekommt er einen ➕ Verstärker-Platz.</li></ol></details>
    <div class="sockelreihe">${s.map((t, i) => `<div class="sockel ${ablegen ? 'ziel' : ''}" data-platz="${i}">${t !== null ? steinKnopf(t, '') : '<div class="stein leer"><span class="sico">✨</span><span class="hinweis">freier Platz</span></div>'}
      ${ablegen ? `<span class="ablegen">${t !== null ? '⇄ tauschen' : '⬇ hier ablegen'}</span>` : ''}</div>`).join('')}</div>
    <div id="steinInfoBox" class="steininfo"></div>
    ${['meteor', 'riesenglocke'].filter((z) => talentWerte().zauber.includes(z)).map((z) => `<p class="hinweis">✦ ${ZAUBER[z].ico} <b>${ZAUBER[z].name}</b> kommt aus einem Wunder im Talentnetz und wirkt immer – ohne Zauberplatz.</p>`).join('')}
    <h3 class="kabschnitt">📜 Weitere Zauber <span class="hinweis">antippen = auswählen, dann oben einen Zauberplatz antippen</span></h3>
    <div class="steinvorrat">${vorrat.length ? vorrat.map((t) => steinKnopf(t, `data-stein="${t}"`)).join('') : '<span class="hinweis">Alle deine Zauber sind eingesetzt. Neue lassen die 👑 Anführer fallen.</span>'}</div>
    ${alleStuetzen.length ? `<h3 class="kabschnitt">➕ Verstärker <span class="hinweis">antippen = an den gewählten Zauber${STEIN_SEL !== null ? ` (${STEINE[STEIN_SEL].ico} ${STEINE[STEIN_SEL].name})` : ''} bzw. wieder herunter</span></h3>
      <div class="steinvorrat">${alleStuetzen.map((id) => { const an = stuetzAn(id); return `<button class="stein stuetzstein ${an !== null ? 'an' : ''} ${an === STEIN_SEL && an !== null ? 'sel' : ''}" data-srein="${id}"><span class="sico">${STUETZEN[id].ico}</span><b>${STUETZEN[id].name}</b><span class="hinweis">${an !== null ? `an ${STEINE[an].ico} ${STEINE[an].name}` : 'frei'}</span></button>`; }).join('')}</div>` : ''}`;
  steinInfo();
  const hilfe = $('#talentBaum .sogehts');
  if (hilfe) hilfe.ontoggle = () => { if (!hilfe.open) { P.gesehen.steinHilfe = true; speichern(); } };   // einmal zugeklappt = bleibt zu
  // Zauber in „Weitere Zauber“ antippen = auswählen (nochmal = abwählen)
  for (const b of document.querySelectorAll('.steinvorrat [data-stein]')) b.onclick = () => {
    const t = +b.dataset.stein;
    STEIN_SEL = STEIN_SEL === t ? (s.find((x) => x !== null) ?? null) : t; STUETZ_KAUF = null; talentRender();
  };
  // Zauberplatz antippen: gewählten Zauber hier ablegen – sonst den Zauber im Platz auswählen
  for (const p of document.querySelectorAll('[data-platz]')) p.onclick = () => {
    const i = +p.dataset.platz, drin = P.sockel[i];
    if (ablegen) {
      P.sockel[i] = STEIN_SEL;
      toast(`${STEINE[STEIN_SEL].ico} ${STEINE[STEIN_SEL].name} eingesetzt${drin !== null && drin !== undefined ? ` – ${STEINE[drin].ico} ${STEINE[drin].name} liegt jetzt unten` : ''}.`);
      speichern(); talentRender(); return;
    }
    if (drin !== null && drin !== undefined) { STEIN_SEL = drin; STUETZ_KAUF = null; talentRender(); return; }
    toast('Tippe unten einen Zauber an – dann hier, um ihn abzulegen.');
  };
  for (const b of document.querySelectorAll('[data-srein]')) b.onclick = () => {
    const t = STEIN_SEL, id = b.dataset.srein, alt = stuetzAn(id);
    if (alt !== null && (alt === t || t === null)) {   // sitzt am gewählten Zauber: herunternehmen
      P.stuetzen[alt] = P.stuetzen[alt].filter((x) => x !== id); speichern(); talentRender(); return;
    }
    if (t === null) { toast('Wähle zuerst einen Zauber (antippen).'); return; }
    if (!stuetzSockel(t)) { toast('Dieser Zauber hat noch keinen Verstärker-Platz.'); return; }
    if (P.stuetzen[t].length >= stuetzSockel(t)) {   // voll: tauschen – der letzte Verstärker geht dorthin, wo der neue herkam (oder wird frei)
      const raus = P.stuetzen[t].pop();
      if (alt !== null) P.stuetzen[alt].push(raus);
      toast(`${STUETZEN[raus].ico} ${STUETZEN[raus].name} getauscht.`);
    }
    if (alt !== null) P.stuetzen[alt] = P.stuetzen[alt].filter((x) => x !== id);
    P.stuetzen[t].push(id); speichern(); talentRender();
  };
}
// Info zum gewählten Zauber: was er tut, seine Verstärker (antippen = herausnehmen), Verstärker-Platz kaufen
function steinInfo() {
  const t = STEIN_SEL, box = $('#steinInfoBox') || $('#talentInfo');
  if ($('#steinInfoBox')) $('#talentInfo').innerHTML = '';   // Info direkt unter den Zauberplätzen, nicht ganz unten
  if (t === null) { box.innerHTML = '<p class="hinweis">Noch kein Zauber. Vor der ersten Nacht wählst du einen.</p>'; return; }
  const preis = STUETZ_PREIS[P.stuetzGekauft || 0], kannKaufen = stuetzOffen() && stuetzSockel(t) < STUETZ_MAX && preis;
  box.innerHTML = `<div class="tart">🪄 Zauber · ${THEMEN[t].ico} ${THEMEN[t].name}${P.sockel.includes(t) ? ' · eingesetzt' : ' · nicht eingesetzt'}</div>
    <h3>${STEINE[t].ico} ${STEINE[t].name}</h3><p>${esc(STEINE[t].text)}</p>
    ${P.sockel.includes(t) ? '<button class="btn leise klein" id="steinRaus">✖ Herausnehmen</button>'
      : `<p class="hinweis">👆 Tippe oben einen Zauberplatz an, um ihn dort abzulegen.</p>${P.sockel.includes(null) ? '<button class="btn gold klein" id="steinRein">⬇ In den freien Platz</button>' : ''}`}
    ${(P.stuetzen[t] || []).map((id) => `<p><button class="btn klein leise" data-sraus="${id}" title="Herausnehmen">✖</button> ${STUETZEN[id].ico} <b>${STUETZEN[id].name}:</b> ${esc(STUETZEN[id].was[t])}</p>`).join('')}
    <p class="hinweis">➕ Verstärker-Plätze: ${stuetzSockel(t)}/${STUETZ_MAX}.${stuetzSockel(t) ? '' : ' Findest du diesen Zauber ein zweites Mal, bekommt er einen.'}
      ${stuetzSockel(t) < STUETZ_MAX && !stuetzOffen() ? ' Weitere kann man ab Nacht 11 kaufen – oder wenn alle Aufgaben der Burg gelöst sind.' : ''}</p>
    ${kannKaufen ? `<button class="btn ${STUETZ_KAUF === t ? 'gold' : 'leise'}" id="stuetzKauf" ${P.gold < preis ? 'disabled' : ''}>${STUETZ_KAUF === t ? 'Nochmal tippen zum Kaufen!' : `➕ Verstärker-Platz kaufen · ${preis} 🪙`}${fehlt(preis)}</button>` : ''}`;
  const raus = $('#steinRaus'), rein = $('#steinRein');
  if (raus) raus.onclick = () => { P.sockel[P.sockel.indexOf(t)] = null; speichern(); talentRender(); };
  if (rein) rein.onclick = () => { P.sockel[P.sockel.indexOf(null)] = t; speichern(); talentRender(); };
  for (const b of box.querySelectorAll('[data-sraus]')) b.onclick = () => { P.stuetzen[t] = P.stuetzen[t].filter((id) => id !== b.dataset.sraus); speichern(); talentRender(); };
  const k = $('#stuetzKauf');
  if (k) k.onclick = () => {
    if (STUETZ_KAUF !== t) { STUETZ_KAUF = t; steinInfo(); return; }
    STUETZ_KAUF = null;
    goldDazu(-preis);
    P.stuetzGekauft = (P.stuetzGekauft || 0) + 1;
    (P.stuetzSockel ||= {})[t] = stuetzSockel(t) + 1;
    speichern(); talentRender();
  };
}
// Kurze Zeile über dem Talentnetz
function steinZeile() {
  const s = sockel();
  return `<div class="platzleiste"><b>🪄 Zauber</b>${s.map((t) => (t === null ? '<span class="platzchip leer">frei</span>'
    : `<span class="platzchip an" style="--farbe:${THEMEN[t].farbe}">${STEINE[t].ico} ${STEINE[t].name}</span>`)).join('')}
    <button class="btn klein leise" id="zuSteinen">🪄 Wechseln</button></div>`;
}
