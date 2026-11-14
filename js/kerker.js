'use strict';
// --- 🗝️ Kerker: Endspiel jeder Burg (wie die Höhle im code-crawler, aber mit Fragen statt Kampf) ----------------------
// Karte aus Reihen von Räumen (unten Eingang, oben Boss), man wählt Raum für Raum den Weg. In den Räumen werden Fragen
// gestellt (KERKER_FRAGEN, Dateien js/kerker/fragen_b<N>.js, Format in docs_kerker_fragen.md): falsch = −1 ❤️,
// 0 ❤️ = festgenommen, zurück zum Eingang. Nur beim 👑 Boss kämpft der Held: Jede richtige Antwort (gegen die Zeit) lässt
// einen Zauber los. Fehler kommen ins 📓 Fehlerheft (Wiederholung nach 1, 2, 4, 7 Tagen) und die Ampel je Kapitel ins Heft.
// Ebene 1 offen, sobald die Hälfte der Haupt-Kapitel gelöst ist (Fragen nur aus gelösten Kapiteln); ganz offen, wenn alle
// Aufgaben der Burg gelöst sind oder mit Lehrer-Code C. Ein Versuch pro Morgen (kostet den Tag).
// Stand: P.kerker = { frei, heute, besiegt: {ebene: true}, best: {ebene: Reihe}, laeufe, joker, gesehen: {id: tag},
//   fehler: {id: {box, faellig, n}}, gelernt, kap: {kapitel: 'rrfr…'}, lauf }

const KERKER_FRAGEN = [];
const KK_REIHEN = 6;
const KK_EBENEN = [
  { name: 'Verlies', ico: '🕯️', boss: { art: 'troll', name: 'Kerkermeister Grimbart', leben: 5 }, stufen: [1], elite: [1, 2], boss3: [1, 2] },
  { name: 'Tiefe Gewölbe', ico: '🦇', boss: { art: 'geist', name: 'Schattenwächter', leben: 6 }, stufen: [1, 2], elite: [2, 3], boss3: [2, 3] },
  { name: 'Drachengrube', ico: '🐉', boss: { art: 'drache', name: 'Kerkerdrache', leben: 7 }, stufen: [2, 3], elite: [3], boss3: [3] },
];
const KK_RAUM = {
  frage: { ico: '⚔️', name: 'Prüfungsraum', text: '2 Fragen' },
  elite: { ico: '💀', name: 'Wächterraum', text: '3 schwere Fragen – ohne Fehler gibt es ein Relikt' },
  rast: { ico: '💧', name: 'Quelle', text: '+1 ❤️ (bei vollem Leben ein 🃏 Joker)' },
  truhe: { ico: '🎁', name: 'Truhe', text: 'ein Relikt oder Gold' },
  raetsel: { ico: '❔', name: 'Rätseltür', text: 'eine Frage – richtig: Gold und ein Joker' },
  haendler: { ico: '🏪', name: 'Händler', text: 'Leben und Joker gegen Gold' },
  boss: { ico: '👑', name: 'Boss', text: 'Kampf mit Zaubern' },
};
// 🏺 Relikte gelten nur für einen Lauf
const KK_RELIKTE = {
  feder: { ico: '🪶', name: 'Glücksfeder', text: 'Der erste Fehler kostet kein ❤️.' },
  lupe: { ico: '🔍', name: 'Lupe', text: 'Bei Auswahlfragen ist eine falsche Antwort durchgestrichen.' },
  sanduhr: { ico: '⏳', name: 'Sanduhr', text: 'Beim Boss hast du 50 % mehr Zeit.' },
  klee: { ico: '🍀', name: 'Kleeblatt', text: '+50 % Gold im Kerker.' },
  amulett: { ico: '💖', name: 'Herzamulett', text: '+1 ❤️ (auch das höchste Leben).' },
  buch: { ico: '📕', name: 'Zauberbuch', text: 'Jeder dritte Treffer beim Boss zählt doppelt.' },
};
const KK_PREIS = { herz: 50, joker: 40 };   // × Ebene
const KK_WIEDER = [1, 2, 4, 7];             // Tage bis zur Wiederholung je Box im Fehlerheft

function kerkerStand() {
  P.kerker ||= { frei: false, heute: 0, besiegt: {}, best: {}, laeufe: 0, joker: 0, gesehen: {}, fehler: {}, gelernt: 0, kap: {}, lauf: null };
  return P.kerker;
}
const kkFragen = () => KERKER_FRAGEN.filter((f) => f.burg === BURGNR);
const kerkerDa = () => kkFragen().length >= 10;
// Didaktik-Prüfung (verteilte Wiederholung): Ebene 1 öffnet schon, wenn die Hälfte der Haupt-Kapitel gelöst ist –
// gefragt wird dann nur, was schon dran war (kkKapErlaubt). Ebene 2/3 wie bisher: erst wenn alles gelöst ist (oder Code C).
const kkHauptKapitel = () => burgKapitel().filter((k) => k < ZUSATZ_AB && kapitelHoefe(k).length);
const kkKapGeloest = () => kkHauptKapitel().filter(kapitelFertig);
const kkVollOffen = () => alleAufgabenGeloest() || !!kerkerStand().frei;
const kkHalbOffen = () => { const n = kkHauptKapitel().length, g = kkKapGeloest().length; return g > 0 && 2 * g >= n; };
const kkKapErlaubt = (k) => kkVollOffen() || kapitelFertig(k);
const kerkerOffen = () => kerkerDa() && !ENDLOS && (kkVollOffen() || kkHalbOffen());
const kkEbeneOffen = (e) => e === 0 || (!!kerkerStand().besiegt[e - 1] && kkVollOffen());
const kkHeuteFrei = () => kerkerStand().heute !== P.tag;
const kkFaellig = () => Object.entries(kerkerStand().fehler).filter(([id, f]) => f.faellig <= P.tag && KERKER_FRAGEN.some((q) => q.id === id && q.burg === BURGNR)).length;
const kkFehlerZahl = () => Object.keys(kerkerStand().fehler).filter((id) => KERKER_FRAGEN.some((q) => q.id === id && q.burg === BURGNR)).length;

// --- Zufall mit Samen (gleiche Karte je Burg und Ebene; Fragen mit gen bekommen neue Zahlen) ---
function kkRng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function kkZ(seed) {
  const r = kkRng(seed);
  const mische = (l) => { const x = l.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
  return { r, int: (a, b) => a + Math.floor(r() * (b - a + 1)), wahl: (l) => l[Math.floor(r() * l.length)], mische };
}
// Eine Frage, wie sie gestellt wird: feste Felder + gen(z), dazu die gemischte Reihenfolge
function kkFrage(id, seed) {
  const f = KERKER_FRAGEN.find((q) => q.id === id);
  if (!f) return null;
  const q = { ...f, ...(f.gen ? f.gen(kkZ(seed)) : {}), seed };
  const z = kkZ(seed + 7);
  if (q.optionen) q.ord = z.mische(q.optionen.map((_, j) => j));
  if (q.paare) q.rechts = z.mische(q.paare.map((_, j) => j));
  if (q.teile) q.pool = z.mische(q.teile.map((_, j) => j));
  if (q.woerter) q.bank = z.mische(q.woerter);
  return q;
}

// --- 🗺️ Karte einer Ebene: 6 Reihen à 3 Räume, Wege nach oben (keine Kreuzungen) ---
function kkKarte(e) {
  const rng = kkRng(BURGNR * 997 + e * 131 + 17), reihen = [];
  const typen = [['frage', 40], ['elite', 18], ['rast', 10], ['truhe', 12], ['raetsel', 14], ['haendler', 6]];
  const zieh = (r) => {
    const ok = typen.filter(([t]) => !(t === 'elite' && r < 2) && !(t === 'haendler' && reihen.flat().some((n) => n.typ === 'haendler')));
    let x = rng() * ok.reduce((s, [, w]) => s + w, 0);
    for (const [t, w] of ok) { x -= w; if (x <= 0) return t; }
    return 'frage';
  };
  for (let r = 0; r < KK_REIHEN; r++) {
    const reihe = [0, 1, 2].map(() => ({ typ: r === 0 ? 'frage' : r === KK_REIHEN - 1 ? 'frage' : zieh(r), to: [] }));
    if (r === KK_REIHEN - 1) reihe[Math.floor(rng() * 3)].typ = 'rast';
    reihen.push(reihe);
  }
  if (!reihen.flat().some((n) => n.typ === 'haendler')) reihen[2][Math.floor(rng() * 3)].typ = 'haendler';
  if (!reihen.flat().some((n) => n.typ === 'truhe')) reihen[3][Math.floor(rng() * 3)].typ = 'truhe';
  for (let r = 0; r < KK_REIHEN - 1; r++) {
    reihen[r].forEach((n, i) => {
      n.to = [i];
      if (i > 0 && rng() < 0.45 && !reihen[r][i - 1].to.includes(i)) n.to.push(i - 1);
      if (i < 2 && rng() < 0.45) n.to.push(i + 1);
    });
  }
  return reihen;
}
const kkErreichbar = (L, r, i) => {
  if (r === KK_REIHEN) return L.r === KK_REIHEN - 1;
  if (L.r === -1) return r === 0;
  return r === L.r + 1 && kkKarte(L.ebene)[L.r][L.i].to.includes(i);
};

// --- Fragen ziehen: erst fällige aus dem Fehlerheft (höchstens eine je Raum), dann ungesehene, dann der Rest ---
function kkZiehen(L, anzahl, stufen, ausHeft = 1) {
  // nur Fragen aus Kapiteln, die schon gelöst sind (solange der Kerker erst halb offen ist)
  const erlaubt = kkFragen().filter((f) => kkKapErlaubt(f.kap));
  const basis = erlaubt.length ? erlaubt : kkFragen();
  const K = kerkerStand(), alle = basis.filter((f) => !L.benutzt.includes(f.id));
  let pool = alle.filter((f) => stufen.includes(f.stufe));
  if (pool.length < anzahl) pool = alle;
  if (pool.length < anzahl) { L.benutzt = []; pool = basis; }
  const mische = (l) => l.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const heft = mische(pool.filter((f) => K.fehler[f.id] && K.fehler[f.id].faellig <= P.tag)).slice(0, ausHeft);
  const neu = mische(pool.filter((f) => !K.gesehen[f.id] && !heft.includes(f)));
  const rest = pool.filter((f) => K.gesehen[f.id] && !heft.includes(f)).sort((a, b) => K.gesehen[a.id] - K.gesehen[b.id] || Math.random() - 0.5);
  const wahl = [...heft, ...neu, ...rest].slice(0, anzahl);
  for (const f of wahl) L.benutzt.push(f.id);
  return wahl.map((f) => ({ id: f.id, seed: Math.floor(Math.random() * 1e9) }));
}

// --- Ablauf ---
let KK = { ui: {}, gezeigt: null, tick: 0, frist: 0, fx: [], anim: 0, wahlRelikt: null };
const kkLauf = () => kerkerStand().lauf;
function kkStart(e) {
  const K = kerkerStand();
  if (!kerkerOffen() || !kkHeuteFrei() || !kkEbeneOffen(e)) return;
  K.heute = P.tag; K.laeufe++;
  K.lauf = { ebene: e, r: -1, i: null, hp: 3, max: 3, gold: 0, xp: 0, relikte: [], federDa: false, richtig: 0, falsch: 0, raum: null, benutzt: [], weg: [] };
  speichern();
  kerkerZeigen();
}
function kkBetreten(r, i) {
  const L = kkLauf();
  if (!L || L.raum || !kkErreichbar(L, r, i)) return;
  L.r = r; L.i = i;
  const E = KK_EBENEN[L.ebene], typ = r === KK_REIHEN ? 'boss' : kkKarte(L.ebene)[r][i].typ;
  const raum = { typ, k: 0, fehler: 0, fertig: false };
  if (typ === 'frage') raum.fragen = kkZiehen(L, 2, E.stufen);
  else if (typ === 'elite') raum.fragen = kkZiehen(L, 3, E.elite, 0);
  else if (typ === 'raetsel') raum.fragen = kkZiehen(L, 1, E.stufen);
  else if (typ === 'boss') { raum.fragen = kkZiehen(L, 1, E.boss3, 3); raum.leben = E.boss.leben; raum.treffer = 0; }
  else if (typ === 'truhe') raum.angebot = kkReliktAngebot(L);
  else if (typ === 'rast') {
    if (L.hp < L.max) { L.hp++; raum.ergebnis = '💧 Das klare Wasser stärkt dich: +1 ❤️'; }
    else { kerkerStand().joker++; raum.ergebnis = '💧 Du bist ganz bei Kräften – am Brunnen liegt ein 🃏 Joker. Du nimmst ihn mit.'; }
    raum.fertig = true;
  }
  L.raum = raum;
  KK.ui = {}; KK.gezeigt = null;
  if (typ === 'boss') KK.frist = 0;
  speichern();
  kerkerZeigen();
}
const kkReliktAngebot = (L) => Object.keys(KK_RELIKTE).filter((k) => !L.relikte.includes(k)).map((k) => [Math.random(), k]).sort((a, b) => a[0] - b[0]).slice(0, 2).map((x) => x[1]);
const kkHat = (k) => !!kkLauf()?.relikte.includes(k);
function kkReliktNehmen(k) {
  const L = kkLauf();
  if (!L || L.relikte.includes(k)) return;
  L.relikte.push(k);
  if (k === 'amulett') { L.max++; L.hp++; }
}
const kkGoldFaktor = () => (kkHat('klee') ? 1.5 : 1);
// Raum verlassen: zurück auf die Karte
function kkRaumEnde() {
  const L = kkLauf();
  if (!L) return;
  L.weg.push({ r: L.r, i: L.i, typ: L.raum.typ, ok: !L.raum.fehler });
  L.raum = null; KK.gezeigt = null; KK.ui = {}; KK.wahlRelikt = null;
  speichern();
  kerkerZeigen();
}

// --- Antworten prüfen ---
const kkNorm = (s) => String(s ?? '').toLowerCase().replace(/[−–]/g, '-').replace(/[„“"'‚‘’]/g, '').replace(/\s+/g, '').replace(/\.$/, '');
const kkZahl = (s) => parseFloat(String(s).replace(/\s/g, '').replace(',', '.').replace(/[−–]/g, '-'));
function kkRichtig(q, ui) {
  switch (q.art) {
    case 'wahl': return ui.sel === 0;
    case 'mehr': { const s = new Set(ui.set || []); return s.size === q.richtig.length && q.richtig.every((j) => s.has(j)); }
    case 'eingabe': {
      if (q.zahl) { const x = kkZahl(ui.text); return Number.isFinite(x) && q.antworten.some((a) => Math.abs(kkZahl(a) - x) <= (q.tol ?? 1e-9)); }
      return q.antworten.some((a) => kkNorm(a) === kkNorm(ui.text));
    }
    case 'luecke': return q.luecken.every((ok, n) => ok.some((a) => kkNorm(a) === kkNorm((ui.luecken || [])[n])));
    case 'zuordnen': return q.paare.every((_, n) => +(ui.zu || [])[n] === n);
    case 'reihe': { const f = ui.folge || []; return f.length === q.teile.length && f.every((j, n) => q.teile[j] === q.teile[n]); }
    case 'zeile': { const s = new Set(ui.set || []); return s.size === q.fehler.length && q.fehler.every((z) => s.has(z)); }
  }
  return false;
}
// Ist schon etwas eingegeben? (Knopf „Antworten“ erst dann)
function kkBereit(q, ui) {
  switch (q.art) {
    case 'wahl': return ui.sel != null;
    case 'mehr': case 'zeile': return (ui.set || []).length > 0;
    case 'eingabe': return String(ui.text ?? '').trim() !== '';
    case 'luecke': return q.luecken.every((_, n) => String((ui.luecken || [])[n] ?? '').trim() !== '');
    case 'zuordnen': return q.paare.every((_, n) => (ui.zu || [])[n] != null && (ui.zu || [])[n] !== '');
    case 'reihe': return (ui.folge || []).length === q.teile.length;
  }
  return false;
}
function kkLoesungText(q) {
  switch (q.art) {
    case 'wahl': return q.optionen[0];
    case 'mehr': return q.richtig.map((j) => q.optionen[j]).join(' · ');
    case 'eingabe': return q.antworten[0];
    case 'luecke': { let n = 0; return q.text.replace(/\{\}/g, () => `[${q.luecken[n++][0]}]`); }
    case 'zuordnen': return q.paare.map(([a, b]) => `${a} → ${b}`).join(' · ');
    case 'reihe': return q.teile.map((t, n) => `${n + 1}. ${t}`).join('  ');
    case 'zeile': return `Zeile ${q.fehler.join(', ')}`;
  }
  return '';
}

// Ergebnis einer Frage festhalten: Statistik je Kapitel, Fehlerheft, Leben, Lohn
function kkWerten(q, ok, zeitUm = false) {
  const K = kerkerStand(), L = kkLauf(), E = L.ebene + 1;
  let gefedert = false;
  K.gesehen[q.id] = P.tag;
  K.kap[q.kap] = ((K.kap[q.kap] || '') + (ok ? 'r' : 'f')).slice(-12);
  const fh = K.fehler[q.id];
  if (ok) {
    L.richtig++;
    L.gold += Math.round(4 * E * kkGoldFaktor());
    L.xp += 2 * E;
    if (fh && fh.faellig <= P.tag) {
      fh.box++;
      if (fh.box >= KK_WIEDER.length) { delete K.fehler[q.id]; K.gelernt++; } else fh.faellig = P.tag + KK_WIEDER[fh.box];
    }
  } else {
    L.falsch++;
    L.raum.fehler++;
    K.fehler[q.id] = { box: 0, faellig: P.tag + 1, n: (fh?.n || 0) + 1 };
    if (kkHat('feder') && !L.federDa) { L.federDa = true; gefedert = true; }
    else L.hp--;
  }
  KK.gezeigt = { ok, zeitUm, feder: gefedert };
  speichern();
}
function kkAntworten(zeitUm = false) {
  const L = kkLauf(), raum = L?.raum;
  if (!raum || KK.gezeigt) return;
  const q = kkFrage(raum.fragen[raum.k].id, raum.fragen[raum.k].seed);
  kkInputLesen(q);
  if (!zeitUm && !kkBereit(q, KK.ui)) return;
  const ok = !zeitUm && kkRichtig(q, KK.ui);
  kkWerten(q, ok, zeitUm);
  if (raum.typ === 'boss') kkBossTreffer(ok);
  kerkerZeigen();
}
function kkWeiter() {
  const L = kkLauf(), raum = L?.raum;
  if (!raum) return;
  KK.gezeigt = null; KK.ui = {};
  if (L.hp <= 0) { kkEnde(false); return; }
  if (raum.typ === 'boss') {
    if (raum.leben <= 0) { kkEnde(true); return; }
    raum.fragen.push(...kkZiehen(L, 1, KK_EBENEN[L.ebene].boss3, 1));
    raum.k++; KK.frist = 0;
    speichern(); kerkerZeigen(); return;
  }
  raum.k++;
  if (raum.k < raum.fragen.length) { speichern(); kerkerZeigen(); return; }
  raum.fertig = true;
  if (raum.typ === 'raetsel' && !raum.fehler) { const g = Math.round(15 * (L.ebene + 1) * kkGoldFaktor()); L.gold += g; kerkerStand().joker++; raum.ergebnis = `❔ Die Tür springt auf: +${g} 🪙 und ein 🃏 Joker.`; }
  else if (raum.typ === 'raetsel') raum.ergebnis = '❔ Die Tür bleibt zu. Weiter geht es trotzdem.';
  else if (raum.typ === 'elite' && !raum.fehler) { raum.angebot = kkReliktAngebot(L); raum.ergebnis = '💀 Der Wächter verbeugt sich: Ohne einen Fehler! Wähle ein Relikt.'; }
  else if (raum.typ === 'elite') raum.ergebnis = `💀 Geschafft – mit ${raum.fehler} ${raum.fehler === 1 ? 'Fehler' : 'Fehlern'}. Für ein Relikt hätte es keiner sein dürfen.`;
  else raum.ergebnis = raum.fehler ? `⚔️ Raum geschafft (${raum.fehler} ${raum.fehler === 1 ? 'Fehler' : 'Fehler'}).` : '⚔️ Raum geschafft – alles richtig!';
  speichern(); kerkerZeigen();
}
// 🃏 Joker: diese Frage gegen eine andere tauschen (kostet nichts außer dem Joker)
function kkJoker() {
  const L = kkLauf(), raum = L?.raum, K = kerkerStand();
  if (!raum?.fragen || KK.gezeigt || K.joker <= 0) return;
  const E = KK_EBENEN[L.ebene], st = raum.typ === 'elite' ? E.elite : raum.typ === 'boss' ? E.boss3 : E.stufen;
  const neu = kkZiehen(L, 1, st, 0)[0];
  if (!neu) return;
  K.joker--;
  raum.fragen[raum.k] = neu;
  KK.ui = {}; KK.frist = 0;
  speichern(); kerkerZeigen();
}
function kkKaufen(was) {
  const L = kkLauf(), preis = KK_PREIS[was] * (L.ebene + 1);
  if (P.gold < preis) { toast(`Dafür fehlen noch ${preis - P.gold} 🪙.`); return; }
  if (KK.kauf !== was) { KK.kauf = was; kerkerZeigen(); return; }   // nie mit einem Antippen kaufen
  KK.kauf = null;
  goldDazu(-preis);
  if (was === 'herz') { L.max++; L.hp++; } else kerkerStand().joker++;
  speichern(); kerkerZeigen();
}

// --- Ende eines Laufs ---
function kkEnde(sieg) {
  const K = kerkerStand(), L = kkLauf(), E = KK_EBENEN[L.ebene], e = L.ebene;
  cancelAnimationFrame(KK.anim); clearInterval(KK.tick);
  const erste = sieg && !K.besiegt[e];
  let gold = sieg ? L.gold + Math.round((erste ? 80 : 30) * (e + 1) * kkGoldFaktor()) : Math.floor(L.gold / 2);
  let xp = sieg ? L.xp + (erste ? 20 : 10) * (e + 1) : Math.floor(L.xp / 2);
  gold = Math.round(gold * lohnFaktor());
  const vorher = heldLevel().level, rekordVorher = K.best[e] || 0;
  K.best[e] = Math.max(rekordVorher, sieg ? KK_REIHEN + 1 : L.r + 1);
  let ruhmText = '';
  if (erste) {
    K.besiegt[e] = true;
    P.sterneExtra = (P.sterneExtra || 0) + 3;   // Kerker = Wissen → zählt für die ⭐ Programmier-Abzeichen (abzeichen.js), nicht für den Ruhm
    ruhmText = `<p class="lohn">⭐ +3 Sterne – ${esc(E.boss.name)} zum ersten Mal besiegt!</p>${KK_EBENEN[e + 1] ? `<p class="hinweis">🔓 Neu: Ebene ${e + 2} ${KK_EBENEN[e + 1].ico} ${KK_EBENEN[e + 1].name}</p>` : '<p class="hinweis">👑 Du hast alle Ebenen des Kerkers bezwungen.</p>'}`;
  }
  P.xp += xp;
  goldDazu(gold);
  const weg = L.weg.map((w) => `<span class="${w.ok ? 'ok' : 'fehl'}">${KK_RAUM[w.typ].ico}</span>`).join('') + (sieg ? '<span class="ok">👑</span>' : '<span class="fehl">⛓️</span>');
  const neuLevel = heldLevel().level > vorher ? `<p class="lohn">⬆️ Level ${heldLevel().level}!</p>` : '';
  K.lauf = null;
  WAHL = null;
  speichern(); hud();
  // Hinter der Karte: der Tag im Kerker ist vorbei – nur noch Feierabend
  $('#scr-karte').innerHTML = `<div class="kopf"><h1>🗝️ Der Kerker</h1><span class="sub">${sieg ? 'Sieg!' : 'Festgenommen'} · Für heute ist Schluss.</span></div>
    <div class="kkraumbox"><div class="kkweg">${weg}</div><p>${L.richtig} richtig, ${L.falsch} falsch · +${gold} 🪙 · +${xp} XP</p>
    <p class="hinweis">📓 Deine Fehler stehen im Heft unter „5 Mein Kerker“.</p></div>`;
  kkInline('🌇 Feierabend', feierabend);
  karte(sieg
    ? `<h2>👑 ${esc(E.boss.name)} ist besiegt!</h2><div class="kkweg">${weg}</div>
       <p>${L.richtig} richtig, ${L.falsch} falsch · Ebene ${e + 1} ${E.ico} ${E.name}</p>
       <p class="lohn">+${gold} 🪙 · +${xp} XP</p>${ruhmText}${neuLevel}`
    : `<h2>⛓️ Festgenommen!</h2><div class="kkweg">${weg}</div>
       <p>Die Wachen bringen dich zurück zum Eingang – Raum ${L.r + 1} von ${KK_REIHEN + 1}${K.best[e] > rekordVorher && rekordVorher ? ' · so weit wie nie!' : ''}.</p>
       <p>${L.richtig} richtig, ${L.falsch} falsch. Die Hälfte der Beute bleibt dir:</p>
       <p class="lohn">+${gold} 🪙 · +${xp} XP</p>${neuLevel}`,
  [{ label: '📓 Fehlerheft', cls: 'leise', fn: () => { heftZeigen(); } }, { label: '🌇 Feierabend', fn: feierabend }]);
  haupt('🌇 Feierabend', feierabend);
  neben([]);
}

// --- 🎨 Darstellung ---
function kerkerZeigen() {
  const L = kkLauf();
  zeigeScreen('karte');
  if (!L) { kkVorraum(); return; }
  if (!L.raum) { kkKarteZeigen(); return; }
  kkRaumZeigen();
}
const kkHerzen = (L) => `<span class="kkherz">${'❤️'.repeat(Math.max(0, L.hp))}${'🖤'.repeat(Math.max(0, L.max - L.hp))}</span>`;
const kkLeiste = (L) => `<div class="kkleiste">${kkHerzen(L)}<span>🃏 ${kerkerStand().joker}</span><span>🪙 +${L.gold}</span>${L.relikte.map((k) => `<span class="kkrel" title="${esc(KK_RELIKTE[k].name + ': ' + KK_RELIKTE[k].text)}">${KK_RELIKTE[k].ico}</span>`).join('')}<span class="kkeb">${KK_EBENEN[L.ebene].ico} Ebene ${L.ebene + 1}</span></div>`;

function kkVorraum() {
  const K = kerkerStand(), offen = kerkerOffen(), frei = kkHeuteFrei();
  const ebene = (E, e) => {
    const auf = kkEbeneOffen(e), best = K.best[e] || 0;
    return `<button class="kkebene ${auf ? 'auf' : 'zu'} ${KK.ebene === e ? 'sel' : ''}" data-kke="${e}" ${auf ? '' : 'disabled'}>
      <span class="kkico">${auf ? E.ico : '🔒'}</span><b>Ebene ${e + 1}: ${E.name}</b>
      <small>${!auf ? (K.besiegt[e - 1] ? 'öffnet, wenn alle Aufgaben der Burg gelöst sind' : `erst ${KK_EBENEN[e - 1].boss.name} besiegen`) :K.besiegt[e] ? `👑 ${E.boss.name} besiegt` : best ? `weitester Raum: ${best} von ${KK_REIHEN + 1}` : `Boss: ${E.boss.name}`}</small>
      <small>Fragen: ${e === 0 ? 'Grundwissen' : e === 1 ? 'Anwenden' : 'Transfer – wie in der Prüfung'}</small></button>`;
  };
  if (KK.ebene == null || !kkEbeneOffen(KK.ebene)) KK.ebene = [2, 1, 0].find((e) => kkEbeneOffen(e) && !K.besiegt[e]) ?? [2, 1, 0].find(kkEbeneOffen);
  const nH = kkHauptKapitel().length, nG = kkKapGeloest().length;
  const sperre = !kerkerDa() ? 'Für diese Burg gibt es noch keine Kerker-Fragen.' : !offen ? `Ebene 1 öffnet sich, wenn die Hälfte der Kapitel dieser Burg gelöst ist (${nG} von ${Math.ceil(nH / 2)} geschafft) – oder mit einem Code deiner Lehrkraft.` : !frei ? 'Heute warst du schon im Kerker. Morgen wieder!' : '';
  const teil = offen && !kkVollOffen() ? `<div class="kkinfo">📚 Gefragt wird nur, was du schon gelöst hast: ${kkKapGeloest().map((k) => `${KAPITEL[k]?.ico || ''} ${esc(KAPITEL[k]?.name || '')}`).join(', ')}. Die tieferen Ebenen öffnen sich, wenn alle Aufgaben gelöst sind.</div>` : '';
  $('#scr-karte').innerHTML = `<div class="kopf"><h1>🗝️ Der Kerker</h1><span class="sub">${BURGEN[BURGNR].ico} ${BURGEN[BURGNR].name} · Räume voller Fragen, am Ende ein Boss</span></div>
    <div class="kkvorraum">
      <div class="kkintro"><p>Unter der Burg liegt der Kerker. Hier zeigst du, was du gelernt hast: <b>In jedem Raum warten Fragen.</b>
        Eine falsche Antwort kostet ❤️. Ohne ❤️ wirst du <b>festgenommen</b> und landest wieder am Eingang. Beim 👑 Boss kämpft dein Held: Jede richtige Antwort lässt einen Zauber los – aber die Zeit läuft.</p>
        <p class="hinweis">Deine Fehler kommen ins 📓 Fehlerheft. Ein paar Tage später fragt der Kerker sie wieder – bis sie sitzen.</p></div>
      <div class="kkebenen">${KK_EBENEN.map(ebene).join('')}</div>
      <div class="kkinfo">🃏 Joker: <b>${K.joker}</b> (tauscht eine Frage aus) · 📓 Im Fehlerheft: <b>${kkFehlerZahl()}</b>${kkFaellig() ? ` (heute fällig: ${kkFaellig()})` : ''} · ✅ gelernt: ${K.gelernt}</div>
      ${sperre ? `<div class="kkinfo sperre">🔒 ${sperre}</div>` : ''}${teil}
      <div class="kklegende">${Object.entries(KK_RAUM).map(([, r]) => `<span>${r.ico} ${r.name}: ${r.text}</span>`).join('')}</div>
      <div class="kkknoepfe" id="kkKnoepfe"></div>
    </div>`;
  for (const b of document.querySelectorAll('[data-kke]')) b.onclick = () => { KK.ebene = +b.dataset.kke; kkVorraum(); };
  const zurueck = () => { WAHL = null; renderKarte(); }, los = offen && frei && kkEbeneOffen(KK.ebene);
  neben([{ label: '🗺️<span class="lbl"> Landkarte</span>', title: 'Zurück zur Landkarte', fn: zurueck }]);
  haupt(`🗝️ Hinab<span class="lbl"> in Ebene ${KK.ebene + 1}</span>`, () => kkStart(KK.ebene), los);
  kkInline(los ? `🗝️ Hinab in Ebene ${KK.ebene + 1}` : '🔒 Heute nicht', () => kkStart(KK.ebene), los, { label: '🗺️ Landkarte', fn: zurueck });
}

function kkKarteZeigen() {
  const L = kkLauf(), karte0 = kkKarte(L.ebene), E = KK_EBENEN[L.ebene];
  const Y0 = 40, DY = 70, H = Y0 + KK_REIHEN * DY + 62;
  const pos = (r, i) => (r === KK_REIHEN ? { x: 50, y: Y0 } : { x: 20 + i * 30, y: Y0 + (KK_REIHEN - r) * DY });
  const besucht = (r, i) => L.weg.some((w) => w.r === r && w.i === i);
  let linien = '';
  karte0.forEach((reihe, r) => reihe.forEach((n, i) => {
    for (const j of r === KK_REIHEN - 1 ? [0] : n.to) {
      const a = pos(r, i), b = r === KK_REIHEN - 1 ? pos(KK_REIHEN, 0) : pos(r + 1, j);
      const an = besucht(r, i) && (r === KK_REIHEN - 1 ? false : besucht(r + 1, j));
      linien += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${an ? 'an' : ''}" vector-effect="non-scaling-stroke"/>`;
    }
  }));
  let knoten = '';
  for (let r = 0; r <= KK_REIHEN; r++) {
    (r === KK_REIHEN ? [{ typ: 'boss' }] : karte0[r]).forEach((n, i) => {
      const p = pos(r, i), geht = kkErreichbar(L, r, i), war = besucht(r, i), hier = L.r === r && L.i === i;
      const R = KK_RAUM[n.typ];
      knoten += `<button class="kkraum ${n.typ} ${geht ? 'geht' : ''} ${war ? 'war' : ''} ${hier ? 'hier' : ''}" style="left:${p.x}%;top:${p.y}px" data-kkr="${r}-${i}" title="${esc(R.name + ' – ' + R.text)}">${n.typ === 'boss' ? `<span class="bossico">👑</span>` : R.ico}</button>`;
    });
  }
  $('#scr-karte').innerHTML = `<div class="kopf"><h1>🗝️ Kerker · ${E.ico} ${E.name}</h1><span class="sub">Tippe einen leuchtenden Raum an – von unten nach oben bis zum 👑 Boss ${esc(E.boss.name)}.</span></div>
    ${kkLeiste(L)}
    <div class="kkkarte" style="height:${H}px"><svg viewBox="0 0 100 ${H}" preserveAspectRatio="none">${linien}</svg>${knoten}<span class="kkeingang">🚪 Eingang</span></div>
    <div class="kklegende">${Object.entries(KK_RAUM).map(([, r]) => `<span>${r.ico} ${r.name}</span>`).join('')}</div>
    ${L.relikte.length ? `<div class="kkinfo">${L.relikte.map((k) => `${KK_RELIKTE[k].ico} <b>${KK_RELIKTE[k].name}</b>: ${KK_RELIKTE[k].text}`).join('<br>')}</div>` : ''}`;
  for (const b of document.querySelectorAll('[data-kkr]')) b.onclick = () => {
    const [r, i] = b.dataset.kkr.split('-').map(Number);
    if (kkErreichbar(L, r, i)) kkBetreten(r, i);
    else toast(r <= L.r ? 'Dort warst du schon – es geht nur nach oben.' : 'Dahin führt von hier kein Gang. Die leuchtenden Räume sind erreichbar.');
  };
  neben([]);
  haupt('👆 Raum antippen', null, false);
}

function kkRaumZeigen() {
  const L = kkLauf(), raum = L.raum, R = KK_RAUM[raum.typ], E = KK_EBENEN[L.ebene];
  const kopf = `<div class="kopf"><h1>${R.ico} ${raum.typ === 'boss' ? esc(E.boss.name) : R.name}</h1><span class="sub">${E.ico} ${E.name} · Raum ${L.r + 1} von ${KK_REIHEN + 1}</span></div>${kkLeiste(L)}`;
  // Räume ohne Fragen (oder fertig): Ergebnis, Truhe, Händler
  if (raum.typ === 'haendler') { kkHaendler(kopf); return; }
  if (raum.typ === 'truhe' || (raum.fertig && raum.angebot)) { kkTruhe(kopf); return; }
  if (raum.fertig) {
    $('#scr-karte').innerHTML = `${kopf}<div class="kkraumbox"><p class="kkerg">${esc(raum.ergebnis || '')}</p></div>`;
    haupt('🗺️ Weiter', kkRaumEnde); neben([]);
    kkInline('🗺️ Weiter', kkRaumEnde);
    return;
  }
  const f = raum.fragen[raum.k], q = kkFrage(f.id, f.seed), fh = kerkerStand().fehler[q.id];
  const boss = raum.typ === 'boss';
  const zaehler = boss ? `Treffer nötig: ${raum.leben}` : `Frage ${raum.k + 1} von ${raum.fragen.length}`;
  $('#scr-karte').innerHTML = `${kopf}
    ${boss ? `<div class="kkboss"><canvas id="kkBossCv"></canvas><div class="kkbosshp"><span>👑 ${esc(E.boss.name)}</span><div class="bar"><i style="width:${100 * raum.leben / E.boss.leben}%"></i></div></div>
      <div class="kkzeit"><i id="kkZeit"></i></div></div>` : ''}
    <div class="kkraumbox"><div class="kkfkopf"><span>${zaehler}</span><span>${KAPITEL[q.kap] ? `${KAPITEL[q.kap].ico} ${esc(KAPITEL[q.kap].name)}` : ''}</span>${fh && !KK.gezeigt ? '<span class="kkheft">📓 aus deinem Fehlerheft</span>' : ''}</div>
      ${kkFrageHtml(q)}
      ${KK.gezeigt ? kkRueckmeldung(q) : ''}
      <div class="kkknoepfe" id="kkKnoepfe"></div></div>`;
  kkFrageKlicks(q);
  if (KK.gezeigt) {
    const weiter = L.hp <= 0 ? '⛓️ Weiter' : boss && raum.leben <= 0 ? '👑 Sieg!' : 'Weiter ▶';
    haupt(weiter, kkWeiter); kkInline(weiter, kkWeiter);
  } else {
    const bereit = kkBereit(q, KK.ui);
    haupt('✅ Antworten', () => kkAntworten(), bereit);
    kkInline(bereit ? '✅ Antworten' : '👆 Erst antworten', () => kkAntworten(), bereit,
      kerkerStand().joker > 0 ? { label: `🃏 Joker (${kerkerStand().joker})`, fn: kkJoker } : null);
  }
  neben([]);
  if (boss) kkBossStart(q);
}
function kkInline(label, fn, an = true, extra = null) {
  const box = $('#kkKnoepfe') || (() => { const d = document.createElement('div'); d.className = 'kkknoepfe'; d.id = 'kkKnoepfe'; $('#scr-karte').appendChild(d); return d; })();
  box.innerHTML = '';
  if (extra) { const b = document.createElement('button'); b.className = 'btn leise'; b.textContent = extra.label; b.onclick = extra.fn; box.appendChild(b); }
  const b = document.createElement('button');
  b.className = 'btn ' + (an ? 'gold' : 'leise'); b.textContent = label; b.disabled = !an; b.onclick = fn;
  box.appendChild(b);
}
// Nach jeder Eingabe den Antworten-Knopf frei schalten (ohne alles neu zu zeichnen – sonst springt das Textfeld)
function kkBereitPruefen(q) {
  kkInputLesen(q);
  const an = kkBereit(q, KK.ui), b = $('#kkKnoepfe button:last-child');
  if (b && !KK.gezeigt) { b.disabled = !an; b.className = 'btn ' + (an ? 'gold' : 'leise'); b.textContent = an ? '✅ Antworten' : '👆 Erst antworten'; }
  $('#hauptBtn').disabled = !an;
}

function kkFrageHtml(q) {
  const ui = KK.ui, g = KK.gezeigt, code = (t) => `<pre class="mono kkcode">${esc(t)}</pre>`;
  const istCode = (t) => /\n/.test(t) || /^\s*(SELECT|INSERT|UPDATE|DELETE|def |for |while |if |print\()/i.test(t);
  const optText = (t) => (istCode(t) ? code(t) : esc(t));
  let teil = '';
  const bild = q.bild ? (() => { try { return `<div class="kkbild">${typeof q.bild === 'function' ? q.bild() : q.bild}</div>`; } catch (e) { return ''; } })() : '';
  switch (q.art) {
    case 'wahl': case 'mehr': {
      const lupe = kkHat('lupe') && q.art === 'wahl' ? q.ord.find((j) => j !== 0) : -1;
      teil = `<div class="kkopt">${q.ord.map((j) => {
        const sel = q.art === 'wahl' ? ui.sel === j : (ui.set || []).includes(j);
        const richtig = q.art === 'wahl' ? j === 0 : q.richtig.includes(j);
        const cls = g ? (richtig ? 'richtig' : sel ? 'falsch' : '') : sel ? 'sel' : '';
        return `<button class="${cls} ${j === lupe ? 'lupe' : ''}" data-kw="${j}" ${g || j === lupe ? 'disabled' : ''}>${q.art === 'mehr' ? `<span class="kkbox">${sel ? '☑' : '☐'}</span>` : ''}${optText(q.optionen[j])}</button>`;
      }).join('')}</div>`;
      break;
    }
    case 'eingabe': teil = `<input id="kkIn" class="kkin" autocomplete="off" spellcheck="false" placeholder="${q.zahl ? 'Zahl eingeben' : 'Antwort eingeben'}" value="${esc(ui.text || '')}" ${g ? 'disabled' : ''}>`; break;
    case 'luecke': {
      let n = 0;
      teil = `<p class="kkluecke">${esc(q.text).replace(/\{\}/g, () => {
        const k = n++, v = (ui.luecken || [])[k] ?? '';
        const zust = g ? (q.luecken[k].some((a) => kkNorm(a) === kkNorm(v)) ? 'richtig' : 'falsch') : '';
        return q.bank ? `<select data-kl="${k}" class="${zust}" ${g ? 'disabled' : ''}><option value="">…</option>${q.bank.map((w) => `<option ${w === v ? 'selected' : ''}>${esc(w)}</option>`).join('')}</select>`
          : `<input data-kl="${k}" class="${zust}" value="${esc(v)}" autocomplete="off" spellcheck="false" size="10" ${g ? 'disabled' : ''}>`;
      })}</p>`;
      break;
    }
    case 'zuordnen': teil = `<div class="kkzu">${q.paare.map(([a], n) => {
      const v = (ui.zu || [])[n] ?? '', zust = g ? (+v === n ? 'richtig' : 'falsch') : '';
      return `<div class="kkzuz"><span>${esc(a)}</span><select data-kz="${n}" class="${zust}" ${g ? 'disabled' : ''}><option value="">…</option>${q.rechts.map((j) => `<option value="${j}" ${String(j) === String(v) ? 'selected' : ''}>${esc(q.paare[j][1])}</option>`).join('')}</select></div>`;
    }).join('')}</div>`; break;
    case 'reihe': {
      const folge = ui.folge || [];
      teil = `<ol class="kkfolge">${folge.map((j, n) => `<li class="${g ? (q.teile[j] === q.teile[n] ? 'richtig' : 'falsch') : ''}">${optText(q.teile[j])}</li>`).join('')}</ol>
        ${g ? '' : `<div class="kkopt kkpool">${q.pool.filter((j) => !folge.includes(j)).map((j) => `<button data-kp="${j}">${optText(q.teile[j])}</button>`).join('')}</div>
        ${folge.length ? '<button class="btn leise klein" data-kreset="1">↺ Nochmal von vorn</button>' : ''}`}`;
      break;
    }
    case 'zeile': teil = `<div class="kkzeilen">${q.code.split('\n').map((z, n) => {
      const nr = n + 1, sel = (ui.set || []).includes(nr), cls = g ? (q.fehler.includes(nr) ? 'richtig' : sel ? 'falsch' : '') : sel ? 'sel' : '';
      return `<button class="${cls}" data-kzl="${nr}" ${g ? 'disabled' : ''}><span class="nr">${nr}</span>${esc(z) || '&nbsp;'}</button>`;
    }).join('')}</div>`; break;
  }
  return `${bild}${q.code && q.art !== 'zeile' ? code(q.code) : ''}<p class="kkfrage"><b>${esc(q.frage)}</b>${q.art === 'mehr' ? ' <span class="hinweis">(mehrere richtig)</span>' : q.art === 'zeile' ? ` <span class="hinweis">(Zeile antippen${q.fehler.length > 1 ? ` – ${q.fehler.length} Fehler` : ''})</span>` : ''}</p>${teil}`;
}
function kkRueckmeldung(q) {
  const g = KK.gezeigt, L = kkLauf();
  const kopf = g.ok ? '✅ Richtig!' : g.zeitUm ? '⌛ Die Zeit ist um!' : '❌ Leider falsch.';
  const folge = g.ok ? '' : g.feder ? ' 🪶 Die Glücksfeder fängt den Fehler auf – kein ❤️ weg.' : L.hp <= 0 ? ' Dein letztes ❤️ ist weg …' : ' −1 ❤️';
  return `<div class="kkrueck ${g.ok ? 'ok' : 'fehl'}"><b>${kopf}</b>${folge}
    ${g.ok ? '' : `<div class="kkloesung">Richtig ist: <b>${esc(kkLoesungText(q))}</b></div>`}
    ${q.erkl ? `<div class="kkerkl">💡 ${esc(q.erkl)}</div>` : ''}${g.ok ? '' : '<div class="hinweis">📓 Kommt ins Fehlerheft – der Kerker fragt sie in ein paar Tagen wieder.</div>'}</div>`;
}
function kkInputLesen(q) {
  if (q.art === 'eingabe' && $('#kkIn')) KK.ui.text = $('#kkIn').value;
  if (q.art === 'luecke') { KK.ui.luecken = []; for (const el of document.querySelectorAll('[data-kl]')) KK.ui.luecken[+el.dataset.kl] = el.value; }
  if (q.art === 'zuordnen') { KK.ui.zu = []; for (const el of document.querySelectorAll('[data-kz]')) KK.ui.zu[+el.dataset.kz] = el.value; }
}
function kkFrageKlicks(q) {
  if (KK.gezeigt) return;
  const neu = () => { kkInputLesen(q); kkRaumZeigen(); };
  for (const b of document.querySelectorAll('[data-kw]')) b.onclick = () => {
    const j = +b.dataset.kw;
    if (q.art === 'wahl') KK.ui.sel = j;
    else { const s = new Set(KK.ui.set || []); s.has(j) ? s.delete(j) : s.add(j); KK.ui.set = [...s]; }
    neu();
  };
  for (const b of document.querySelectorAll('[data-kzl]')) b.onclick = () => { const s = new Set(KK.ui.set || []), z = +b.dataset.kzl; s.has(z) ? s.delete(z) : s.add(z); KK.ui.set = [...s]; neu(); };
  for (const b of document.querySelectorAll('[data-kp]')) b.onclick = () => { (KK.ui.folge ||= []).push(+b.dataset.kp); neu(); };
  const r = $('[data-kreset]'); if (r) r.onclick = () => { KK.ui.folge = []; neu(); };
  for (const el of document.querySelectorAll('#kkIn, [data-kl], [data-kz]')) {
    el.oninput = () => kkBereitPruefen(q);
    el.onchange = () => kkBereitPruefen(q);
    if (el.tagName === 'INPUT') el.onkeydown = (ev) => { if (ev.key === 'Enter') kkAntworten(); };
  }
  if ($('#kkIn') && !('ontouchstart' in window)) $('#kkIn').focus();
}

function kkHaendler(kopf) {
  const L = kkLauf(), e = L.ebene + 1;
  const ware = (was, ico, name, text) => {
    const preis = KK_PREIS[was] * e, zweit = KK.kauf === was;
    return `<div class="kkware"><span class="kkico">${ico}</span><div><b>${name}</b><div class="hinweis">${text}</div></div>
      <button class="btn ${P.gold >= preis ? (zweit ? 'gruen' : 'gold') : 'leise'}" data-kk-kauf="${was}">${P.gold >= preis ? (zweit ? `✔ Wirklich kaufen (${preis} 🪙)` : `${preis} 🪙`) : `noch ${preis - P.gold} 🪙`}</button></div>`;
  };
  $('#scr-karte').innerHTML = `${kopf}<div class="kkraumbox"><p>🏪 Ein Händler hat sich im Kerker verlaufen. Er nimmt dein Gold aus den Nächten (du hast ${P.gold} 🪙).</p>
    ${ware('herz', '❤️', 'Heiltrank', '+1 ❤️ – auch das höchste Leben steigt.')}
    ${ware('joker', '🃏', 'Joker', 'Tauscht eine Frage gegen eine andere. Bleibt dir auch für spätere Läufe.')}</div>`;
  for (const b of document.querySelectorAll('[data-kk-kauf]')) b.onclick = () => kkKaufen(b.dataset.kkKauf);
  haupt('🗺️ Weiter', kkRaumEnde); neben([]);
  kkInline('🗺️ Weiter', kkRaumEnde);
}
function kkTruhe(kopf) {
  const L = kkLauf(), raum = L.raum, gold = Math.round(25 * (L.ebene + 1) * kkGoldFaktor());
  const elite = raum.typ === 'elite';
  $('#scr-karte').innerHTML = `${kopf}<div class="kkraumbox">${raum.ergebnis ? `<p class="kkerg">${esc(raum.ergebnis)}</p>` : '<p>🎁 Eine alte Truhe! Darin liegen zwei Relikte. Nimm eins – oder lieber das Gold?</p>'}
    <div class="kkrelikte">${raum.angebot.map((k) => `<button class="kkrelikt ${KK.wahlRelikt === k ? 'sel' : ''}" data-kkrel="${k}"><span class="kkico">${KK_RELIKTE[k].ico}</span><b>${KK_RELIKTE[k].name}</b><small>${KK_RELIKTE[k].text}</small></button>`).join('')}
      ${elite ? '' : `<button class="kkrelikt ${KK.wahlRelikt === 'gold' ? 'sel' : ''}" data-kkrel="gold"><span class="kkico">🪙</span><b>${gold} Gold</b><small>kommt zur Beute dazu</small></button>`}</div>
    <p class="hinweis">Relikte helfen nur in diesem Lauf. Antippen = auswählen.</p></div>`;
  for (const b of document.querySelectorAll('[data-kkrel]')) b.onclick = () => { KK.wahlRelikt = b.dataset.kkrel; kerkerZeigen(); };
  const nehmen = () => {
    if (!KK.wahlRelikt) return;
    if (KK.wahlRelikt === 'gold') L.gold += gold; else kkReliktNehmen(KK.wahlRelikt);
    raum.angebot = null; raum.fertig = true; kkRaumEnde();
  };
  const an = !!KK.wahlRelikt;
  haupt('✔ Nehmen', nehmen, an); neben([]);
  kkInline(an ? '✔ Nehmen' : '👆 Erst auswählen', nehmen, an);
}

// --- 👑 Bosskampf: Bild mit Held und Boss, Zeitbalken, Zauber fliegen ---
const kkZeitFuer = (q) => {
  const jung = typeof BURGEN[BURGNR].klasse === 'number' && BURGEN[BURGNR].klasse <= 8;
  const s = (q.art === 'wahl' ? (jung ? 40 : 30) : (jung ? 75 : 60)) * (kkHat('sanduhr') ? 1.5 : 1);
  return s * 1000;
};
function kkBossStart(q) {
  clearInterval(KK.tick);
  if (!KK.gezeigt) {
    if (!KK.frist) KK.frist = Date.now() + kkZeitFuer(q);
    const ganz = kkZeitFuer(q);
    KK.tick = setInterval(() => {
      const rest = KK.frist - Date.now(), bar = $('#kkZeit');
      if (!bar || !kkLauf()?.raum || kkLauf().raum.typ !== 'boss') { clearInterval(KK.tick); return; }
      bar.style.width = Math.max(0, 100 * rest / ganz) + '%';
      bar.classList.toggle('knapp', rest < ganz * 0.25);
      if (rest <= 0) { clearInterval(KK.tick); kkAntworten(true); }
    }, 100);
  }
  cancelAnimationFrame(KK.anim);
  const malen = (jetzt) => {
    const cv = $('#kkBossCv');
    if (!cv) return;
    const w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== w) { cv.width = w; cv.height = h; }
    const g = cv.getContext('2d'), t = jetzt / 1000, L = kkLauf();
    if (!L?.raum) return;
    const E = KK_EBENEN[L.ebene];
    g.clearRect(0, 0, w, h);
    g.fillStyle = FZ.lin(g, 0, 0, 0, h, [[0, '#1c1a2a'], [1, '#3a3446']]); g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 46) for (let y = 0; y < h * 0.7; y += 26) { g.strokeStyle = 'rgba(255,255,255,.05)'; g.strokeRect(x + ((y / 26) % 2) * 23, y, 46, 26); }
    g.fillStyle = '#2a2433'; g.fillRect(0, h * 0.78, w, h * 0.22);
    // Fackeln
    for (const fx of [w * 0.08, w * 0.92]) { FZ.kreis(g, fx, h * 0.28, 16 + Math.sin(t * 9 + fx) * 3, 'rgba(255,170,60,.25)'); FZ.kreis(g, fx, h * 0.28, 6, '#ffb040'); }
    const jetztFx = KK.fx.filter((f) => t - f.t < 1.4 || f.t > t);
    KK.fx = jetztFx;
    const schlag = KK.fx.find((f) => f.art === 'schlag' && t - f.t >= 0 && t - f.t < 0.5);
    const zauber = KK.fx.find((f) => f.art === 'zauber' && t - f.t >= 0 && t - f.t < 0.9);
    const hx = w * 0.2, bx = w * 0.76, fy = h * 0.6, S = Math.min(h * 0.55, w * 0.22);
    malHeld(g, hx, fy, S * 0.9, t, !!zauber);
    const ruck = schlag ? Math.sin((t - schlag.t) / 0.5 * Math.PI) * -w * 0.12 : 0;
    const trifft = KK.fx.find((f) => f.art === 'zauber' && t - f.t >= 0.45 && t - f.t < 0.8);
    g.save();
    if (trifft) g.filter = 'brightness(2)';
    malGegner(g, E.boss.art, bx + ruck, fy - S * 0.1, S * 1.1, t, false);
    g.restore();
    if (zauber && t - zauber.t < 0.45) {
      const p = (t - zauber.t) / 0.45, x = hx + (bx - hx) * p, y = fy - S * 0.4 - Math.sin(p * Math.PI) * h * 0.15;
      FZ.kreis(g, x, y, 18, zauber.farbe + '66'); g.font = `${Math.round(S * 0.35)}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(zauber.ico, x, y);
    }
    if (trifft) { g.font = `bold ${Math.round(S * 0.3)}px sans-serif`; g.fillStyle = '#ffe27a'; g.textAlign = 'center'; g.fillText(trifft.doppelt ? '−2' : '−1', bx, fy - S * 0.9 - (t - trifft.t) * 40); }
    if (schlag) { g.fillStyle = `rgba(255,40,40,${0.35 * (1 - (t - schlag.t) / 0.5)})`; g.fillRect(0, 0, w * 0.45, h); g.font = `bold ${Math.round(S * 0.28)}px sans-serif`; g.fillStyle = '#ff7a7a'; g.textAlign = 'center'; g.fillText('−❤️', hx, fy - S * 0.8); }
    KK.anim = requestAnimationFrame(malen);
  };
  KK.anim = requestAnimationFrame(malen);
}
const kkBossZeit = () => performance.now() / 1000;
function kkBossTreffer(ok) {
  const L = kkLauf(), raum = L.raum;
  clearInterval(KK.tick);
  if (ok) {
    raum.treffer++;
    const doppelt = kkHat('buch') && raum.treffer % 3 === 0;
    raum.leben = Math.max(0, raum.leben - (doppelt ? 2 : 1));
    const zauber = (P.sockel || []).filter((x) => x != null).map((i) => STEINE[i]);
    const z = zauber.length ? zauber[(raum.treffer - 1) % zauber.length] : { ico: '✨', name: 'Zauberblitz' };
    const farbe = { '🔥': '#ff7a30', '❄️': '#80d0ff', '🌩️': '#ffe060', '🛡️': '#a0e0ff', '🏹': '#e0c080', '🧿': '#c080ff' }[z.ico] || '#ffe27a';
    KK.fx.push({ art: 'zauber', t: kkBossZeit(), ico: z.ico, farbe, doppelt });
  } else KK.fx.push({ art: 'schlag', t: kkBossZeit() });
  speichern();
}

// --- 📓 Heft: Ampel je Kapitel und Fehlerheft ---
function kkAmpel(k) {
  const s = kerkerStand().kap[k] || '';
  if (s.length < 3) return { ico: '⚪', text: 'noch zu wenig gefragt' };
  const q = [...s].filter((c) => c === 'r').length / s.length;
  return q >= 0.8 ? { ico: '🟢', text: 'sitzt' } : q >= 0.5 ? { ico: '🟡', text: 'fast' } : { ico: '🔴', text: 'üben' };
}
function kerkerHeftHtml() {
  if (!kerkerDa()) return '';
  const K = kerkerStand();
  const kaps = burgKapitel().filter((k) => kkFragen().some((f) => f.kap === k));
  const offen = Object.entries(K.fehler).map(([id, f]) => [kkFrage(id, 1), f]).filter(([q]) => q && q.burg === BURGNR).sort((a, b) => a[1].faellig - b[1].faellig);
  return `<section class="hseite" id="h-kerker"><h2>5 🗝️ Mein Kerker</h2>
    <p>${KK_EBENEN.map((E, e) => `${E.ico} Ebene ${e + 1}: ${K.besiegt[e] ? `👑 ${esc(E.boss.name)} besiegt` : K.best[e] ? `bis Raum ${K.best[e]} von ${KK_REIHEN + 1}` : 'noch nicht betreten'}`).join(' · ')}</p>
    <h3>🚦 So sicher bin ich (letzte 12 Antworten je Kapitel)</h3>
    <table class="htab"><tr><th>Kapitel</th><th>Ampel</th><th></th></tr>${kaps.map((k) => { const a = kkAmpel(k), s = K.kap[k] || ''; return `<tr><td>${KAPITEL[k].ico} ${esc(KAPITEL[k].name)}</td><td>${a.ico} ${a.text}</td><td class="hinweis">${s ? `${[...s].filter((c) => c === 'r').length} von ${s.length} richtig` : ''}</td></tr>`; }).join('')}</table>
    <h3>📓 Fehlerheft (${offen.length})</h3>
    ${offen.length ? offen.map(([q, f]) => `<div class="hfehler"><p><b>${esc(q.frage)}</b> <span class="hinweis">${KAPITEL[q.kap]?.ico || ''} · ${f.n}× falsch · ${f.faellig <= P.tag ? 'heute fällig' : `wieder in ${f.faellig - P.tag} ${f.faellig - P.tag === 1 ? 'Tag' : 'Tagen'}`}</span></p>
      ${q.code && q.art !== 'zeile' ? `<pre class="hcode">${esc(q.code)}</pre>` : ''}${q.art === 'zeile' ? `<pre class="hcode">${esc(q.code)}</pre>` : ''}
      <p>✅ ${esc(kkLoesungText(q))}</p>${q.erkl ? `<p class="hinweis">💡 ${esc(q.erkl)}</p>` : ''}</div>`).join('') : '<p>Leer – entweder warst du noch nicht im Kerker, oder alles sitzt. 💪</p>'}
    <p class="hinweis">✅ Aus dem Fehlerheft gelernt: ${K.gelernt} Fragen (viermal richtig nach Pausen von 1, 2, 4 und 7 Tagen).</p></section>`;
}

// --- 🗺️ Kerkertür auf der Landkarte ---
const KARTE_KERKER = [330, 250];
function svgKerkerTuer(x, y) {
  const offen = kerkerOffen(), K = kerkerStand(), frei = kkHeuteFrei();
  const schild = !offen ? '🔒 Kerker' : !frei ? '🗝️ morgen wieder' : kkFaellig() ? `🗝️ Kerker · 📓 ${kkFaellig()}` : '🗝️ Kerker';
  return `<g class="kturm kkerker ${offen && frei ? 'offen' : ''} ${WAHL === 'kerker' ? 'gewaehlt' : ''}" data-kerker="1" transform="translate(${x},${y})">
    <ellipse class="ring" cx="0" cy="4" rx="46" ry="40"/>
    <ellipse cx="0" cy="26" rx="40" ry="9" fill="rgba(0,0,0,.3)"/>
    <path d="M-36,26 Q-38,-14 0,-22 Q38,-14 36,26 Z" fill="#6a6470" stroke="#3a3440" stroke-width="2"/>
    ${[[-24, 6], [-8, -10], [12, -8], [24, 8], [-18, 18], [16, 20]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="8" ry="5" fill="#7a7480" stroke="#4a4450" stroke-width="1"/>`).join('')}
    <path d="M-14,26 v-16 a14,14 0 0 1 28,0 v16 z" fill="${offen ? '#1a1018' : '#2b2530'}" stroke="#2a1a10" stroke-width="2"/>
    ${[-8, -2, 4, 10].map((gx) => `<line x1="${gx}" y1="${-2}" x2="${gx}" y2="26" stroke="#5a5a62" stroke-width="2"/>`).join('')}
    ${offen ? '<circle cx="0" cy="14" r="4" fill="#ffb040" opacity=".7"/>' : ''}
    <text y="-30" style="font-size:18px">🗝️</text>
    <rect x="-62" y="34" width="124" height="20" rx="10" fill="rgba(20,28,58,.85)"/><text y="45" class="rname">${schild}</text>${K.besiegt[2] ? '<text x="30" y="-18" style="font-size:14px">👑</text>' : ''}</g>`;
}
