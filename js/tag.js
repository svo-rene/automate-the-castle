'use strict';
// --- ☀️ Der Tag: Aufgabe laden, ausführen, prüfen, Ergebnis -----------------------------

let ED = null;    // Editor (CodeMirror oder Textfeld)
let H = null;     // heutiger Hof
let LAUF = null;  // laufende Wiedergabe

// Simulation eines Laufs: Python ruft act/sense/say/tick, JS rechnet den Zustand mit FELD.apply
const SIM = { st: null, ev: [], zuege: 0, denk: 0, err: null, budget: false };
const BRUECKE = {
  act(kind, line, vars) {
    if (SIM.zuege >= ZUEGE) { SIM.budget = true; return 'stop'; }
    SIM.denk = 0;
    const ev = FELD.apply(SIM.st, { kind, line });
    if (vars) ev.vars = vars;   // Variablen vor diesem Schritt (JSON-Text, nur für die Zeitleiste)
    SIM.ev.push(ev);
    SIM.zuege++;
    return ev.fail ? 'stop' : '';
  },
  sense(kind) { return FELD.sense(SIM.st, kind); },
  say(text, line, vars) { if (SIM.ev.length < 2000) SIM.ev.push({ kind: 'print', text: String(text), line, ...(vars ? { vars } : {}) }); },
  tick(line) {
    if (++SIM.denk <= DENKGRENZE) return false;
    SIM.err = [line, 'Dein Programm denkt zu lange nach, ohne dass der Bauer etwas tut. Steckt es in einer Endlosschleife?'];
    return true;
  },
};

function simuliere(lage, src) {
  Object.assign(SIM, { st: FELD.start(lage, H), ev: [], zuege: 0, denk: 0, err: null, budget: false });
  FELD.quelle = src;   // für codeRegeln und varPflicht (feld.js)
  const err = PY.run(src, H.sprache) || SIM.err;
  const r = FELD.pruefe(SIM.st);
  // Meldung: die letzte print-Ausgabe muss die richtige Zahl sein
  if (H.meldung && r.ok) {
    const soll = String(H.meldung(FELD.start(lage))), prints = SIM.ev.filter((e) => e.kind === 'print');
    const ist = prints.length ? prints[prints.length - 1].text.trim() : null;
    // print("Anzahl:", anzahl) ist auch richtig (so schlägt es die Fehlermeldung vor): es zählt die letzte Zahl im Text
    const zahl = ist && (ist.match(/-?\d+(?:\.\d+)?/g) || []).pop();
    if (ist === null) Object.assign(r, { ok: false, msg: 'Es fehlt die Meldung: Der Bauer muss am Ende mit print(…) eine Zahl melden.', anteil: 0.7 });
    else if (ist !== soll && zahl !== soll) Object.assign(r, { ok: false, msg: `Gemeldet: ${ist} – richtig wäre ${soll}.`, anteil: 0.7 });
    // print in der Schleife meldet jeden Zwischenstand – gemeldet wird aber nur einmal, am Ende (Spieltest v1)
    else if (prints.length > 1) Object.assign(r, { ok: false, msg: `Der Bauer meldet ${prints.length}-mal (${prints.map((p) => p.text.trim()).slice(0, 4).join(', ')}${prints.length > 4 ? ' …' : ''}). print gehört hinter die Schleife – nicht eingerückt –, dann meldet er nur einmal.`, anteil: 0.8 });
    else r.msg += ` Meldung ${soll} ✓`;
  }
  // Absturz mitten im Lauf: dann ist die Aufgabe nicht „fast fertig“, auch wenn auf dem Feld nichts zu tun war (z. B. nur messen)
  const anteil = err && r.ok ? 0.3 : r.anteil;
  return { lage, ev: SIM.ev, zuege: SIM.zuege, err, budget: SIM.budget, ok: r.ok && !err, msg: r.msg, anteil };
}

const hofStand = (id) => (P.hoefe[id] ||= { fertig: false, kurz: false, sparsam: false, versuche: 0, tipps: 0, heute: 0 });

// 🔧 Verbessern (wie Zachtronics/Human Resource Machine): ein gelöster Code-Hof darf einmal am Tag nachgebessert werden,
// ohne dass es den Tag kostet. Grundlohn gibt es nicht noch einmal – nur fehlende ⭐ bringen ihren Bonus,
// und der Roboter übernimmt den besten Code (weniger Züge = mehr Lohn am Morgen).
let BESSER = false;
const verbesserbar = (h) => !h.art && !h.vorhersage && !h.pruefung && !!P.hoefe[h.id]?.fertig;
const heuteVerbessert = (h) => P.hoefe[h.id]?.besser === P.tag;
const lagen = (h) => [h.start, ...h.varianten];
const LAGE_NAME = 'ABCDEFG';

// --- Bildschirm aufbauen ---
function tagStart(id) {
  const neu = hofById(id);
  const sperre = fokusSperre(neu) || (verbesserbar(neu) && heuteVerbessert(neu) ? '🔧 Diesen Hof hast du heute schon verbessert – morgen wieder.' : null);
  if (sperre) {
    toast(sperre, 4500);
    if (P.phase === 'tag') { P.phase = 'morgen'; speichern(); karteStart(); }   // nach dem Neuladen: zur Karte statt leerem Bildschirm
    return;
  }
  H = neu;
  BESSER = verbesserbar(H);
  VH = null; FELD.marken = null; $('#feldCanvas').onclick = null;   // Reste einer abgebrochenen Vorhersage weg
  P.hof = id;
  P.phase = 'tag';
  speichern();
  zeigeScreen('tag');
  hud();
  $('#aufgabe').innerHTML = `<span class="ico">${H.ico}</span><div class="txt"><div class="t">${esc(H.titel)}</div><div class="z">${esc(figurText(H.ziel))}</div></div>
    ${H.pruefung ? '<span class="pruefmarke">⚜️ Prüfung · ohne Tipps</span>' : '<button class="btn klein leise" id="tippBtn">💡 Tipp</button>'}`;
  if (!H.pruefung) $('#tippBtn').onclick = tipp;
  // Blockmodus (Kapitel 1): Blöcke antippen statt tippen, der Python-Code steht darunter
  ED = H.bloecke ? BLOCK_ED : CODE_ED;
  $('#editor').classList.toggle('hidden', !!H.bloecke);
  $('#blockbox').classList.toggle('hidden', !H.bloecke);
  ED.setReadOnly(false);
  ED.value = P.code[id] ?? H.vorlage ?? (H.bloecke || H.art ? '' : '# Schreib hier deinen Code.\n');   // SQL: leer starten (# wäre dort ein Fehler)
  ED.setMarks(0, 0);
  befehlsleiste();
  $('#protokoll').innerHTML = '';
  // 📜 Archiv-Auftrag (SQL): Tabellen statt Acker
  // 🔭 Späherturm (KI): kein Code – links das Experiment, rechts Knöpfe und Protokoll
  const sql = H.art === 'sql', ki = H.art === 'ki', korn = H.art === 'sort';   // 🌾 Kornspeicher (LK): Säcke statt Acker
  $('.feldbox').classList.toggle('hidden', sql || ki || korn);
  $('#archiv').classList.toggle('hidden', !sql && !ki && !korn);
  $('#archiv').classList.toggle('spaeher', ki);
  $('#archiv').classList.toggle('korn', korn);
  $('#editor').classList.toggle('hidden', !!H.bloecke || ki);
  log(sql ? 'Schreib deine Abfrage. Die Knöpfe unten helfen beim Tippen. Dann ▶ Ausführen.'
    : H.bloecke ? 'Tippe die Blöcke unten an. Dann ▶ Ausführen.' : H.vorlage ? 'Lass den Code laufen und schau, was passiert.'
    : H.selbst ? 'Schreib den Code selbst in das Feld. Dann ▶ Ausführen.' : 'Tippe die Befehle unten an oder schreib selbst. Dann ▶ Ausführen.', 'leise');
  if (BESSER) {
    const s = hofStand(id);
    if (s.geloest && !P.code[id]?.trim()) ED.value = s.geloest;
    log(`🔧 Verbessern: Dieser Hof ist schon gelöst. Ein Versuch kostet heute keinen Tag. ${s.kurz && s.sparsam ? 'Du hast schon beide ⭐ – geht es noch kürzer?' : 'Fehlende ⭐ bringen ihren Bonus.'}${P.roboter[id] ? ' Dein 🤖 Roboter nimmt den besten Code.' : ''}`, 'ok');
  }
  LAUF = null;
  LS = null;
  KS = null;
  KO = null;
  if (sql && H.lesen) sqlLesenStart();   // 🔮 Abfrage vorhersagen
  else if (sql) archivZeigen(); else if (!ki && !korn) zeigeLage(H.start);
  laufChips(null);
  zeitleiste(null);
  haupt('▶ Ausführen', ausfuehren, PY.bereit);
  PZ = null;
  $('#puzzle').classList.add('hidden');
  neben([{ label: '🗺️<span class="lbl"> Karte</span>', title: 'Zurück zur Karte (kostet nichts)', fn: zurKarte },
    ...(puzzleMoeglich(H) ? [{ label: '🧩<span class="lbl"> Puzzle-Hilfe</span>', title: 'Die Zeilen sind schon da – du ordnest sie', fn: puzzleStart }] : [])]);
  if (puzzleMoeglich(H)) log('🧩 Schon zweimal nicht geklappt? Mit der Puzzle-Hilfe sind die Zeilen schon da – du bringst sie in die richtige Reihenfolge. Dafür gibt es halben Lohn und keine ⭐.', 'leise');
  if (H.vorhersage) vorhersageStart();
  if (ki) kiStart();
  if (korn && PY.bereit) kornStart();   // nach haupt/neben: Vorhersagen und Fragen setzen eigene Knöpfe (✔ Prüfen, 🏳️ Auflösen)
  // merkeNach: Merke erst auf der Ergebniskarte (z. B. Messlabor kl1 – sonst stünden die Antworten vor den Fragen)
  if (H.merke && !H.merkeNach && !P.gesehen['merke:' + id]) { P.gesehen['merke:' + id] = true; speichern(); lernkarte(H.merke); }
  // 👆 Beim allerersten Hof: Hand zeigt auf einen Befehl und dann auf ▶ Ausführen
  if (!sql && !ki && !korn && !H.vorhersage && !H.vorlage && !Object.entries(P.hoefe).some(([hid, s]) => s.fertig && !hofById(hid)?.vorhersage)) anleitung('tag', [
    // erst weiter zum Ausführen, wenn ungefähr so viele Befehle dastehen wie in der Lösung
    { ziel: () => $('#befehle button'), text: 'Tippe die Befehle an', fertig: () => ED.value.split('\n').filter((z) => z.trim() && !z.trim().startsWith('#')).length >= H.loesung.split('\n').length },
    { ziel: () => $('#hauptBtn'), text: 'Jetzt ▶ Ausführen', fertig: () => !!LAUF || karteOffen() },
  ], () => P.phase === 'tag' && H && H.id === id);
}

// --- 🔮 Vorhersage-Hof (PRIMM: erst lesen und vorhersagen) ---------------------------------
// Der Code steht fest und läuft NICHT. Man sagt das Ergebnis voraus (Nutzerwunsch: Befehle nachklicken war nur Abschreiben):
//   felder = alle Felder antippen, auf denen der Bauer etwas tut (erntet, gießt, rupft, Ziegel aufhebt/legt)
//   zahl   = die Zahl eintippen, die er am Ende mit print meldet
//   ende   = das Feld antippen, auf dem er am Ende steht
// ✅ Prüfen zählt Fehler (⭐ ohne Fehler, ⭐ höchstens 2). Ist alles richtig, läuft der Code zur Kontrolle ab.
// 🏳️ Auflösen spielt den Lauf vor und gibt Teillohn für die schon richtig beantworteten Fragen.
let VH = null;
// 🎲 Raten lohnt sich nicht (Spieltest: Vorhersagen und Auswahlfragen ließen sich durchprobieren, voller Lohn + ⭐):
// jeder Fehlversuch kostet RATE_ABZUG vom Grundlohn, mindestens bleibt der Teillohn. Gilt für Vorhersage-Höfe und Kornspeicher-Fragen.
const RATE_ABZUG = 0.15;
const rateFaktor = (fehler) => Math.max(TEILLOHN, 1 - RATE_ABZUG * fehler);
// Zusatz hinter dem Lohn auf jeder Ergebniskarte: halber Lohn beim zweiten Versuch, doppelter durch einen Lehrer-Code
const lohnHinweis = () => {
  const tf = tagLohnFaktor(), t = [tf >= 1.05 && `×${String(Math.round(tf * 10) / 10).replace('.', ',')} – Ruhm und Erfahrung`, zweitAktiv() && '½ – zweiter Versuch', P.doppel === datumHeute() && '×2 – doppelter Lohn heute'].filter(Boolean);
  return t.length ? ` <span class="hinweis">(${t.join(', ')})</span>` : '';
};
const VH_TUN = { harvest: 'erntet', water: 'gießt', pull: 'Unkraut rupft', pick: 'einen Ziegel aufhebt', place: 'einen Ziegel legt' };
function vorhersageStart() {
  ED.value = H.code;
  ED.setReadOnly(true);
  ED.setMarks(0, 0);
  $('#befehle').innerHTML = '';
  if (!PY.bereit) { haupt('Python lädt …', null, false); return; }   // main.js baut den Hof neu auf, sobald Python da ist
  const lauf = simuliere(H.start, H.code);
  // Was tut der Bauer wo? (nur Aktionen, die etwas bewirken)
  const st = FELD.start(H.start, H), felder = {};
  for (const ev of lauf.ev) {
    if (ev.kind === 'print') continue;
    const e = FELD.apply(st, { kind: ev.kind });   // nachspielen, um zu wissen, wo der Bauer gerade steht
    if (VH_TUN[ev.kind] && e.got) (felder[ev.kind] ||= new Set()).add(`${st.x},${st.y}`);
  }
  // Gefragt wird nach EINER Tätigkeit – der spannendsten (bei if/else z. B. das Gießen im else-Zweig, nicht „alles“)
  const art = ['water', 'pull', 'place', 'pick', 'harvest'].find((k) => felder[k]);
  const prints = lauf.ev.filter((e) => e.kind === 'print'), fragen = [];
  if (prints.length) fragen.push({ typ: 'zahl', soll: String(prints[prints.length - 1].text).trim(), text: '📢 Welche Zahl meldet der Bauer am Ende mit print? Tippe sie unten ein.' });
  else if (art) fragen.push({ typ: 'felder', soll: felder[art], text: `👆 Auf welchen Feldern ${VH_TUN[art]} der Bauer? Tippe alle diese Felder auf dem Acker an.` });
  fragen.push({ typ: 'ende', soll: `${st.x},${st.y}`, text: '🏁 Auf welchem Feld steht der Bauer, wenn der Code fertig ist? Tippe es auf dem Acker an.' });
  VH = { lauf, fragen, i: 0, fehler: 0, hier: 0, felder: new Set(), ende: null };
  $('#protokoll').innerHTML = '';
  log('🔮 Lies den Code Zeile für Zeile – er läuft erst, wenn du richtig vorhergesagt hast.', 'leise');
  log(`🎲 Raten lohnt sich nicht: Jeder Fehlversuch kostet ${Math.round(RATE_ABZUG * 100)} % vom Lohn.`, 'leise');
  $('#feldCanvas').onclick = vorhersageKlick;
  vorhersageFrage();
}

// Die aktuelle Frage anzeigen (Text, Eingabe, Knöpfe)
function vorhersageFrage() {
  const f = VH.fragen[VH.i], box = $('#befehle');
  log(`${VH.i + 1}/${VH.fragen.length}: ${f.text}`, 'frage');
  $('#laufInfo').innerHTML = `<div class="vhfrage">🔮 ${VH.i + 1}/${VH.fragen.length} · ${esc(figurText(f.text))}</div>`;   // direkt unter dem Acker, wo man tippt
  box.innerHTML = f.typ === 'zahl'
    ? '<span class="meldefeld"><input type="number" id="vhZahl" placeholder="?" inputmode="numeric"></span>'
    : `<span class="hinweis">${f.typ === 'felder' ? 'Antippen markiert ein Feld, nochmal antippen nimmt die Markierung weg.' : 'Antippen setzt die 🏁 Fahne.'}</span>`;
  haupt('✅ Prüfen', vorhersagePruefen, true);
  neben([{ label: '🏳️<span class="lbl"> Auflösen</span>', title: 'Den Code laufen lassen (nur Teillohn)', fn: vorhersageAufloesen },
    { label: '🗺️<span class="lbl"> Karte</span>', title: 'Zurück zur Karte (kostet nichts)', fn: zurKarte }]);
  vorhersageMalen();
}

function vorhersageMalen() {
  FELD.marken = VH ? { felder: VH.felder, ende: VH.ende } : null;
  FELD.draw($('#feldCanvas'), FELD.start(H.start, H));
}

// Antippen auf dem Acker: Feld aus der Klickposition (FELD.geo kommt aus FELD.draw)
function vorhersageKlick(ev) {
  if (!VH || LAUF || !FELD.geo) return;
  const f = VH.fragen[VH.i];
  if (f.typ === 'zahl') return;
  const cv = $('#feldCanvas'), r = cv.getBoundingClientRect(), g = FELD.geo, s = g.W / r.width;
  const x = Math.floor(((ev.clientX - r.left) * s - g.ox) / g.k), y = Math.floor(((ev.clientY - r.top) * s - g.oy) / g.k);
  if (x < 0 || y < 0 || x >= g.w || y >= g.h) return;
  const key = `${x},${y}`;
  if (f.typ === 'felder') VH.felder.has(key) ? VH.felder.delete(key) : VH.felder.add(key);
  else VH.ende = key;
  vorhersageMalen();
}

function vorhersagePruefen() {
  if (!VH || LAUF) return;
  const f = VH.fragen[VH.i];
  let richtig, tipp = '';
  if (f.typ === 'zahl') {
    const ist = ($('#vhZahl')?.value || '').trim();
    if (!ist) { toast('Tippe erst eine Zahl ein.'); return; }
    richtig = ist === f.soll;
    if (!richtig) tipp = 'Rechne nochmal nach: Wie oft läuft die Schleife, und was passiert jedes Mal mit der Variable?';
  } else if (f.typ === 'felder') {
    if (!VH.felder.size) { toast('Tippe erst die Felder auf dem Acker an.'); return; }
    const fehlt = [...f.soll].filter((k) => !VH.felder.has(k)).length, zuviel = [...VH.felder].filter((k) => !f.soll.has(k)).length;
    richtig = !fehlt && !zuviel;
    if (!richtig) tipp = [fehlt && `${fehlt} Feld${fehlt > 1 ? 'er fehlen' : ' fehlt'}`, zuviel && `${zuviel} Feld${zuviel > 1 ? 'er sind' : ' ist'} zu viel markiert`].filter(Boolean).join(', ') + '.';
  } else {
    if (!VH.ende) { toast('Tippe erst das Feld an, auf dem der Bauer am Ende steht.'); return; }
    richtig = VH.ende === f.soll;
    if (!richtig) tipp = 'Dort endet der Weg nicht. Geh den Code mit dem Finger Schritt für Schritt durch – auch die Drehungen.';
  }
  if (!richtig) {
    VH.fehler++; VH.hier++;
    tipp += ` (Lohn jetzt ${Math.round(rateFaktor(VH.fehler) * 100)} %)`;
    log(`❌ Noch nicht. ${tipp}`, 'err');
    const extra = VH.hier >= 2 ? ' 💡 Zähl bei jeder Schleife mit, wie oft sie läuft. Eingerückte Zeilen gehören zur Schleife darüber.' : '';
    if (extra) log(`💡 Tipp:${extra.slice(2)}`, 'leise');
    // die Rückmeldung auch direkt unter dem Acker (das Protokoll steht weit unten – Spieltest: „nach Prüfen passiert scheinbar nichts“)
    $('#laufInfo').innerHTML = `<div class="vhfrage">🔮 ${VH.i + 1}/${VH.fragen.length} · ${esc(figurText(f.text))}</div><div class="vhfalsch">❌ Noch nicht. ${esc(tipp)}${extra}</div>`;
    toast('❌ Noch nicht – schau unter den Acker.');
    return;
  }
  VH.hier = 0;
  log('✅ Richtig!', 'ok');
  VH.i++;
  if (VH.i < VH.fragen.length) { vorhersageFrage(); return; }
  // Alles vorhergesagt: jetzt läuft der Code zur Kontrolle (die Markierungen bleiben sichtbar)
  $('#befehle').innerHTML = '';
  log('▶ Jetzt läuft der Code – schau, ob es so kommt, wie du gesagt hast.', 'leise');
  wiedergabe([VH.lauf], 0, () => vorhersageEnde(true));
}

// Aufgeben: der Code läuft vor, dafür gibt es nur Teillohn für die schon richtig beantworteten Fragen
function vorhersageAufloesen() {
  if (!VH || LAUF) return;
  ED.setMarks(0, 0);
  $('#befehle').innerHTML = '';
  wiedergabe([VH.lauf], 0, () => vorhersageEnde(false));
}

function vorhersageEnde(ok) {
  const h = hofStand(H.id), fehlerfrei = ok && VH.fehler === 0, wenig = ok && VH.fehler <= 2;
  const anteil = ok ? 1 : VH.i / Math.max(1, VH.fragen.length), rf = rateFaktor(VH.fehler);
  let gold;
  if (ok) {
    const stern = (neu, alt) => (neu ? H.lohn * STERN_BONUS * (alt ? NACHARBEIT : 1) : 0);
    gold = H.lohn * (h.fertig ? NACHARBEIT : 1) * rf + stern(fehlerfrei, h.kurz) + stern(wenig, h.sparsam);
  } else gold = h.fertig ? 0 : H.lohn * TEILLOHN * anteil;
  gold = Math.round(gold * lohnFaktor());
  const warFertig = h.fertig;
  h.versuche++;
  h.fertig ||= ok; h.kurz ||= fehlerfrei; h.sparsam ||= wenig;
  h.heute = P.tag;
  P.gold += gold;
  speichern();
  const st = (an, t) => `<span class="${an ? '' : 'aus'}" title="${t}">⭐</span>`;
  karte(`<h2>${ok ? 'Richtig vorhergesagt! 🔮' : 'Aufgelöst'}</h2>
    ${ok ? `<div class="sterne">✅ ${st(fehlerfrei, 'ohne Fehler')}${st(wenig, 'höchstens 2 Fehler')}</div>
      <div class="zeile"><span>⭐ ohne Fehler</span><span>${fehlerfrei ? '✓' : `${VH.fehler} Fehler`}</span></div>
      <div class="zeile"><span>⭐ höchstens 2 Fehler</span><span>${wenig ? '✓' : '–'}</span></div>
      ${VH.fehler ? `<div class="zeile"><span>🎲 ${VH.fehler} Fehlversuch${VH.fehler > 1 ? 'e' : ''}: Lohn</span><span>${Math.round(rf * 100)} %</span></div>` : ''}`
    : `<div class="teil"><div class="teilbalken"><i style="width:${Math.round(anteil * 100)}%"></i></div><span>${Math.round(anteil * 100)} % vorhergesagt</span></div>`}
    <p class="lohn">+${gold} 🪙${!ok && gold ? ' Teillohn' : ''}${lohnHinweis()}</p>
    ${ok && VH.fehler ? `<p class="hinweis">Jeder Fehlversuch kostet ${Math.round(RATE_ABZUG * 100)} % vom Lohn (höchstens bis auf ${Math.round(TEILLOHN * 100)} %).</p>` : ''}
    ${ok && warFertig ? '<p class="hinweis">Schon gelöster Hof: weniger Lohn, neue Sterne zählen voll.</p>' : ''}
    ${!ok ? '<p class="hinweis">Morgen kannst du es noch einmal versuchen. Lies den Code Zeile für Zeile – und zähl bei Schleifen mit.</p>' : ''}`,
  [...zweitKnopf(ok), { label: '🌇 Feierabend', fn: feierabend }]);
  VH = null;
  FELD.marken = null;
  $('#feldCanvas').onclick = null;
  neben([]);
  haupt('🌇 Feierabend', feierabend);
  hud();
}

function zurKarte() {
  if (LAUF) return;
  P.phase = 'morgen';
  speichern();
  karteStart();
}

function befehlsleiste() {
  const box = $('#befehle');
  box.innerHTML = '';
  // ⌨️ Selbst schreiben (Nutzerwunsch 2026-11-15: „sonst ist es wie am Anfang mit den Blöcken“): die Befehle stehen nur
  // zum Nachschauen da; antippbar sind nur Tipp-Hilfen ohne Befehl (Einrücken, Klammern, Doppelpunkt – fehlen am Handy)
  if (H.selbst && !H.bloecke) {
    const liste = H.befehle.map((id) => (typeof id === 'string' ? BAUSTEINE[id] : id)).filter(Boolean);
    box.innerHTML = `<div class="nachschauen"><span class="hinweis">📋 Zum Nachschauen – tippen musst du selbst:</span>
      ${liste.map((b) => `<code>${esc(b.zeigt)}</code>`).join(' ')}</div>
      <div class="tipphilfe"><button data-h="ein" title="Zeile einrücken">⇥ einrücken</button><button data-h="aus" title="Zeile ausrücken">⇤</button>
      <button data-h="()">( )</button><button data-h=":">:</button><button data-h="=">=</button></div>`;
    for (const k of box.querySelectorAll('[data-h]')) k.onclick = () => {
      const h = k.dataset.h;
      if (h === 'ein' || h === 'aus') ED.indent?.(h === 'ein');
      else ED.insertText?.(h === '()' ? '(¦)' : h === '=' ? ' = ' : h);
    };
    return;
  }
  for (const id of H.befehle) {
    const b = typeof id === 'string' ? BAUSTEINE[id] : id, k = document.createElement('button');
    k.textContent = (H.bloecke && b.ico ? b.ico + ' ' : '') + b.zeigt;
    k.className = (b.kw || /^(for|if|while|else|elif)\b/.test(b.text) ? 'kw' : '') + ((H.neu || []).includes(id) || b.neu ? ' neu' : '') + (H.bloecke ? ' gross' : '');
    k.onclick = () => ED.insertLine(b.text);
    box.appendChild(k);
  }
}

// Vorschläge beim Tippen (editor.js): die Befehle dieses Hofs und die Variablen, die im Code schon vorkommen
window.editorWoerter = (src) => {
  if (!H || (H.art && H.art !== 'sort') || H.bloecke) return [];
  const aus = [];
  for (const id of H.befehle) {
    const b = typeof id === 'string' ? BAUSTEINE[id] : id;
    if (!b?.text) continue;
    const wort = b.text.match(/^\w+/)?.[0];
    if (!wort) continue;
    // Selbst schreiben: Vorschlag ergänzt nur das Wort, keine fertige Zeile (for i in range(…): tippt man selbst)
    const text = H.selbst ? (b.kw ? wort : /^\w+\(\)$/.test(b.text) ? b.text : wort) : b.text;
    aus.push({ label: b.kw ? wort : b.zeigt.trim(), text, detail: b.kw ? b.zeigt : (b.ico || ''), type: b.kw ? 'keyword' : 'function' });
  }
  const vars = new Set([...src.matchAll(/^\s*(\w+)\s*[-+]?=[^=]/gm), ...src.matchAll(/^\s*for\s+(\w+)\s+in\b/gm)].map((m) => m[1]));
  for (const v of vars) if (!aus.some((o) => o.label.startsWith(v + '('))) aus.push({ label: v, text: v, detail: 'Variable', type: 'variable' });
  return aus;
};

// --- 🧩 Block-Editor: dieselben Methoden wie der Code-Editor, aber nur Antippen ---
// Schleifen sind Klammer-Blöcke: Nach einem for (oder einer anderen Zeile mit „:“) landen die nächsten Blöcke darin,
// bis man „⬅ aus der Schleife“ tippt. Der Python-Code (mit Einrückung) steht immer darunter.
let CODE_ED = null;   // der richtige Editor (CodeMirror oder Textfeld), gesetzt in main.js
const SCHLEIFEN_FARBE = ['#f0a03a', '#b67aff', '#3fc9a0'];   // Ebene 1, 2, 3 – wiederholt sich danach
const tiefeVon = (z) => Math.floor((z.match(/^ */)[0].length) / 4);
const istKopf = (z) => z.trim().endsWith(':');
const BLOCK_ED = {
  src: '', ro: false, cur: 0, bad: 0, tiefe: 0,
  get value() { return this.src; },
  set value(v) {
    this.src = v.split('\n').filter((z) => z.trim() && !z.trim().startsWith('#')).join('\n');
    this.cur = this.bad = 0; this.tiefe = this.endTiefe(); blockRender();
  },
  zeilen() { return this.src ? this.src.split('\n') : []; },
  // Wohin kommt der nächste Block? Hinter die letzte Zeile – in ihre Schleife, wenn sie ein Kopf ist
  endTiefe() { const z = this.zeilen().at(-1); return z === undefined ? 0 : tiefeVon(z) + (istKopf(z) ? 1 : 0); },
  setReadOnly(on) { this.ro = on; blockRender(); },
  insertLine(text) {
    if (this.ro) return;
    let t = text.replace('¦', '3').replace(/¦/g, '');
    // innere Zählschleifen heißen j, k (wie in den Lernkarten)
    if (this.tiefe > 0 && t.startsWith('for i in range(')) t = t.replace('for i ', `for ${'ijk'[Math.min(2, this.tiefe)]} `);
    this.src = [...this.zeilen(), '    '.repeat(this.tiefe) + t].join('\n');
    if (istKopf(t)) this.tiefe++;
    this.bad = 0;
    blockGeaendert();
  },
  // eine Ebene nach außen – aber erst, wenn in der Schleife schon etwas liegt
  raus() {
    const z = this.zeilen().at(-1);
    if (this.tiefe === 0) return;
    if (!z || istKopf(z)) { toast('Leg erst einen Block in die Schleife.'); return; }
    this.tiefe = Math.min(this.tiefe - 1, tiefeVon(z));
    blockRender();
  },
  // Block entfernen; bei einem Schleifenkopf rückt sein Inhalt eine Ebene nach links
  entfernen(i) {
    const z = this.zeilen(), t = tiefeVon(z[i]);
    if (istKopf(z[i])) for (let j = i + 1; j < z.length && tiefeVon(z[j]) > t; j++) z[j] = z[j].slice(4);
    z.splice(i, 1);
    this.src = z.join('\n');
    this.tiefe = this.endTiefe();
    blockGeaendert();
  },
  setMarks(cur, bad) { this.cur = cur; this.bad = bad; blockRender(); },
  focus() {},
};
function blockGeaendert() {
  if (H) P.code[H.id] = BLOCK_ED.src;
  speichern();
  blockRender();
}
function blockRender() {
  const box = $('#blockbox'), B = BLOCK_ED;
  const zeilen = B.zeilen();
  const ico = (z) => Object.values(BAUSTEINE).find((b) => b.text === z)?.ico
    || (z.startsWith('for ') ? '🔁' : z.startsWith('while ') ? '🚧' : z.startsWith('print') ? '📢' : z.includes('=') ? '📦' : '▪️');
  // Zählschleife: die Zahl lässt sich direkt im Block einstellen
  const inhalt = (z, i) => {
    const m = z.match(/^(for \w+ in range\()(\d+)(\):)$/);
    if (!m || B.ro) return esc(z);
    return `${esc(m[1])}<input type="number" class="bzahl" data-n="${i}" min="1" max="20" value="${m[2]}">${esc(m[3])}`;
  };
  // Jede Schleifenebene hat ihre Farbe: Der Kopf ist so gefärbt, und alles, was dazugehört, hängt an einer
  // gleichfarbigen Klammer links daneben (bei Schleife in Schleife zwei Klammern nebeneinander).
  const klammern = (t, ende) => Array.from({ length: t }, (_, e) => `<span class="bklammer ${ende && e === t - 1 ? 'ende' : ''}" style="--farbe:${SCHLEIFEN_FARBE[e % SCHLEIFEN_FARBE.length]}"></span>`).join('');
  const blocks = zeilen.map((z, i) => {
    const t = tiefeVon(z), zz = z.trim(), naechstT = i + 1 < zeilen.length ? tiefeVon(zeilen[i + 1]) : (B.ro ? 0 : B.tiefe);
    return `<div class="bzeile">${klammern(t, naechstT < t)}<div class="block ${istKopf(zz) ? 'kopf' : ''} ${i + 1 === B.cur ? 'cur' : ''} ${i + 1 === B.bad ? 'bad' : ''}" ${istKopf(zz) ? `style="--farbe:${SCHLEIFEN_FARBE[t % SCHLEIFEN_FARBE.length]}"` : ''}>
      <span class="bnr">${i + 1}</span><span class="bico">${ico(zz)}</span><span class="btext">${inhalt(zz, i)}</span>
      ${B.ro ? '' : `<button class="bx" data-n="${i}" title="Block entfernen">✖</button>`}</div></div>`;
  }).join('');
  const naechster = B.ro ? '' : `<div class="bzeile">${klammern(B.tiefe, true)}<div class="bnaechst">${B.tiefe ? '↳ Der nächste Block kommt in die Schleife.' : '➕ Hier kommt der nächste Block hin.'}
    ${B.tiefe ? '<button class="btn klein leise" id="blockRaus">⬅ aus der Schleife</button>' : ''}</div></div>`;
  box.innerHTML = `<div class="bkopf"><b>🧩 Dein Programm</b>${zeilen.length && !B.ro ? `<button class="btn klein ${B.leerWarte ? 'warn' : 'leise'}" id="blockLeer">${B.leerWarte ? 'Wirklich? Nochmal tippen!' : '🗑️ Alles löschen'}</button>` : ''}</div>
    <div class="bliste">${zeilen.length ? blocks : '<p class="hinweis">Tippe unten auf einen Block – er wird hier angehängt.</p>'}${zeilen.length ? naechster : ''}</div>
    <div class="bpy"><span>🐍 So sieht das in Python aus:</span><pre class="mono">${esc(B.src) || '&nbsp;'}</pre></div>`;
  for (const b of box.querySelectorAll('.bx')) b.onclick = () => { if (!B.ro) B.entfernen(+b.dataset.n); };
  const mitZahl = (inp) => { const z = B.zeilen(), n = Math.max(1, Math.min(20, Math.round(+inp.value) || 1)); z[+inp.dataset.n] = z[+inp.dataset.n].replace(/range\(\d+\)/, `range(${n})`); return z.join('\n'); };
  for (const inp of box.querySelectorAll('.bzahl')) {
    inp.onchange = () => { B.src = mitZahl(inp); blockGeaendert(); };
    // Python-Vorschau UND das Programm schon beim Tippen (Spieltest: Feld zeigte 10, ausgeführt wurde noch 3)
    inp.oninput = () => { B.src = mitZahl(inp); if (H) P.code[H.id] = B.src; box.querySelector('.bpy pre').textContent = B.src; };
  }
  const raus = $('#blockRaus');
  if (raus) raus.onclick = () => B.raus();
  const leer = $('#blockLeer');
  // Alles löschen braucht zwei Antippen (Spieltest: ein Versehen löschte das ganze Programm)
  if (leer) leer.onclick = () => {
    if (!B.leerWarte) { B.leerWarte = true; blockGeaendert(); setTimeout(() => { if (B.leerWarte) { B.leerWarte = false; blockGeaendert(); } }, 3000); return; }
    B.leerWarte = false; B.src = ''; B.tiefe = 0; blockGeaendert();
  };
  // den gerade laufenden bzw. neuesten Block zeigen (nur in der Liste scrollen, nie die Seite)
  const liste = box.querySelector('.bliste'), ziel = box.querySelector('.block.cur, .block.bad') || [...box.querySelectorAll('.block')].pop();
  if (liste && ziel) liste.scrollTop = Math.max(0, ziel.offsetTop - liste.offsetTop - liste.clientHeight / 2);
}

// ⭐-Ziele aus der Musterlösung berechnen, wo sie fehlen (par = Anweisungen, sparsam = Züge im teuersten Lauf)
function autoZiele() {
  const vorher = H;
  for (const h of [...HOEFE, ...PRUEFUNGEN]) {
    if (h.bald || h.art || (h.par != null && h.sparsam != null)) continue;
    H = h;
    const chk = PY.check(h.loesung, h.sprache);
    if (chk.err) { console.warn('Musterlösung fehlerhaft:', h.id, chk.err); continue; }
    h.par ??= chk.count;
    h.sparsam ??= Math.max(...lagen(h).map((l) => simuliere(l, h.loesung).zuege));
  }
  H = vorher;
}

function log(text, cls = '') {
  const p = $('#protokoll'), d = document.createElement('div');
  d.className = cls;
  d.textContent = figurText(text);
  p.appendChild(d);
  p.scrollTop = p.scrollHeight;
}

function zeigeLage(lage) { FELD.draw($('#feldCanvas'), FELD.start(lage, H)); }

// Chips unter dem Feld: welche Höfe (Varianten) der Code schaffen muss bzw. geschafft hat
// Vor dem Lauf: antippen zeigt die Variante (wie Karel/7 Billion Humans). Ab Burg 8 und in Prüfungen ist die letzte
// Variante 🔒 geheim: man sieht sie erst nach dem Lauf – der Code muss allgemein sein, nicht für die sichtbaren Höfe gebaut.
const geheimAb = (h) => (!h.art && h.varianten.length >= 2 && (h.pruefung || hofBurg(h) >= 8) ? lagen(h).length - 1 : lagen(h).length);
function laufChips(runs, zeigt = -1) {
  const box = $('#laufInfo');
  if (!H.varianten.length) { box.innerHTML = ''; return; }
  const n = lagen(H).length, geheim = geheimAb(H);
  if (runs) {
    box.innerHTML = runs.map((r, i) => `<button class="lauf ${r.ok ? 'ok' : 'nein'} ${i === zeigt ? 'zeigt' : ''}" data-i="${i}">${i >= geheim ? '🔓 ' : ''}Hof ${LAGE_NAME[i]} ${r.ok ? '✓' : '✗'}</button>`).join('');
    for (const b of box.querySelectorAll('button')) b.onclick = () => { if (!LAUF) wiedergabe(runs, +b.dataset.i); };
    return;
  }
  if (H.art === 'sql') { box.innerHTML = `<span class="hinweis">Deine Abfrage muss in ${n} Archiven mit verschiedenen Daten klappen.</span>`; return; }
  if (H.art) { box.innerHTML = ''; return; }
  if (H.vorhersage) { box.innerHTML = ''; return; }
  box.innerHTML = `<span class="hinweis">Dein Code muss auf ${n} Höfen klappen:</span>`
    + lagen(H).map((l, i) => i >= geheim
      ? `<span class="lauf geheim" title="Siehst du erst nach dem Lauf">🔒 Hof ${LAGE_NAME[i]}</span>`
      : `<button class="lauf ${i === Math.max(0, zeigt) ? 'zeigt' : ''}" data-i="${i}" title="Antippen: diesen Hof ansehen">👁 Hof ${LAGE_NAME[i]}</button>`).join('');
  for (const b of box.querySelectorAll('button')) b.onclick = () => {
    if (LAUF || VH) return;
    zeitleiste(null);
    zeigeLage(lagen(H)[+b.dataset.i]);
    laufChips(null, +b.dataset.i);
  };
}

function tipp() {
  const h = hofStand(H.id);
  if (h.tipps < H.tipps.length) h.tipps++;
  speichern();
  const liste = H.tipps.slice(0, h.tipps).map((t, i) => `<p><b>${i + 1}.</b> ${esc(t)}</p>`).join('');
  const mehr = h.tipps < H.tipps.length ? [{ label: 'Noch ein Tipp', cls: 'leise', fn: tipp }] : [];
  karte(`<h2>💡 Tipps</h2>${liste}`, [...mehr, { label: 'Danke' }]);
}

// --- Ausführen ---
function ausfuehren() {
  if (LAUF || !PY.bereit || H.vorhersage) return;
  if (H.art === 'sql') { if (!H.lesen) sqlAusfuehren(); return; }
  if (H.art === 'ki') return;
  if (H.art === 'sort') { kornAusfuehren(); return; }
  const src = ED.value;
  P.code[H.id] = src;
  const chk = PY.check(src, H.sprache);
  if (chk.err) {
    // Fehler vor dem Start kosten keinen Tag
    ED.setMarks(0, chk.err[0]);
    for (const e of document.querySelectorAll('#protokoll .err')) e.remove();   // nur der aktuelle Fehler (Spieltest: alte, schon behobene blieben stehen)
    log(`Zeile ${chk.err[0]}: ${chk.err[1]}`, 'err');
    toast('Fehler vor dem Start – das kostet keinen Tag. 🙂');
    return;
  }
  if (!/\w/.test(src.replace(/#.*$/gm, ''))) { toast('Schreib erst ein paar Befehle.'); return; }
  const runs = lagen(H).map((l) => simuliere(l, src));
  const erg = BESSER ? verbessernAbrechnen(runs, chk.count, src) : abrechnen(runs, chk.count);
  // fürs Heft und den Roboter: der Code, der geklappt hat (nicht der letzte Versuch)
  if (erg.ok && !BESSER) { Object.assign(hofStand(H.id), { geloest: src, besteZuege: erg.zuege, besteZeilen: erg.count }); speichern(); }
  const zeigt = Math.max(0, runs.findIndex((r) => !r.ok));
  $('#protokoll').innerHTML = '';
  wiedergabe(runs, zeigt, () => ergebnis(erg));
}

function abrechnen(runs, count) {
  const h = hofStand(H.id), ok = runs.every((r) => r.ok);
  const zuege = Math.max(...runs.map((r) => r.zuege));
  const kurz = ok && count <= H.par, sparsam = ok && zuege <= H.sparsam;
  let gold = 0;
  // Anteil der Arbeit, die erledigt ist (über alle Lagen gemittelt) – für den Teillohn
  const anteil = ok ? 1 : runs.reduce((s, r) => s + (r.anteil || 0), 0) / runs.length;
  if (ok) {
    const stern = (neu, alt) => (neu ? H.lohn * STERN_BONUS * (alt ? NACHARBEIT : 1) : 0);
    gold = H.lohn * (h.fertig ? NACHARBEIT : 1) + stern(kurz, h.kurz) + stern(sparsam, h.sparsam);
  } else gold = h.fertig ? 0 : H.lohn * TEILLOHN * anteil;
  gold = Math.round(gold * lohnFaktor());
  const erg ={ ok, kurz, sparsam, count, zuege, gold, anteil, runs, warFertig: h.fertig, ersteSpez: false };
  // ⚜️ Prüfung: bestanden = 1 Spezialisierungspunkt
  if (H.pruefung && ok && !P.pruefungen[H.id]) { erg.ersteSpez = !Object.keys(P.pruefungen).length; P.pruefungen[H.id] = true; }
  h.versuche++;
  h.fertig ||= ok; h.kurz ||= kurz; h.sparsam ||= sparsam;
  h.heute = P.tag;   // heute schon gearbeitet → nach Neuladen geht es zum Abend
  P.gold += gold;
  speichern();
  return erg;
}

// 🔧 Verbessern: kein Grundlohn, kein Teillohn, der Tag bleibt frei. Neue ⭐ zahlen ihren vollen Bonus.
// Der beste Code (erst weniger Züge, dann weniger Zeilen) bleibt gespeichert – den nimmt der Roboter.
function verbessernAbrechnen(runs, count, src) {
  const h = hofStand(H.id), ok = runs.every((r) => r.ok);
  const zuege = Math.max(...runs.map((r) => r.zuege));
  const kurz = ok && count <= H.par, sparsam = ok && zuege <= H.sparsam;
  const neuKurz = kurz && !h.kurz, neuSparsam = sparsam && !h.sparsam;
  const gold = Math.round(H.lohn * STERN_BONUS * (neuKurz + neuSparsam) * lohnFaktor());
  const vorher = { zuege: h.besteZuege, zeilen: h.besteZeilen };
  const besser = ok && (h.besteZuege == null || zuege < h.besteZuege || (zuege === h.besteZuege && count < (h.besteZeilen ?? Infinity)));
  if (besser) Object.assign(h, { geloest: src, besteZuege: zuege, besteZeilen: count });
  h.versuche++;
  h.kurz ||= kurz; h.sparsam ||= sparsam;
  h.besser = P.tag;
  P.gold += gold;
  speichern();
  const anteil = ok ? 1 : runs.reduce((s, r) => s + (r.anteil || 0), 0) / runs.length;
  return { ok, kurz, sparsam, count, zuege, gold, anteil, runs, warFertig: true, besser, vorher, neuKurz, neuSparsam, verbessern: true };
}

// --- 🧩 Puzzle-Hilfe (Parsons-Puzzle mit Lücken, Nutzerwunsch nach der Recherche) ---------------------------
// Nach 2 Fehlversuchen: die Zeilen der Musterlösung liegen gemischt da, dazu eine falsche Zeile (Ablenker).
// Man legt sie in die richtige Reihenfolge, rückt sie mit ⬅ ➡ ein und trägt die Zahlen in range(▢) selbst ein –
// so ist es kein reines Nachklicken (wie früher bei den Vorhersagen). Geprüft wird durch echtes Ausführen.
// Lohn: 60 % (−10 % je falschem Prüfen, mindestens 30 %), keine ⭐. Der Hof gilt als gelöst; Sterne holt man später mit 🔧 Verbessern.
const PUZZLE_LOHN = 0.6, PUZZLE_ABZUG = 0.1, PUZZLE_MIN = 0.3;
let PZ = null;
// 🌾 auch im Kornspeicher (Spieltest: dort erschien sie nie), für Aufträge mit Code und Säcken (Kartenspiel, eigene Funktion);
// geprüft wird dann mit PY.sort auf allen Testlisten, die Wiedergabe zeigt die Säcke (puzzleKorn)
// Didaktik-Prüfung: auch Sternwarte/Werkstatt (ohne Säcke) – dort zeigt das Protokoll die Tests; zu lange Lösungen
// (mehr als 30 Zeilen) oder solche mit mehrzeiligen Texten eignen sich nicht als Puzzle
const puzzleArt = (h) => !h.art || (h.art === 'sort' && ['karten', 'funktion'].includes(h.sortArt) && !!h.loesung
  && h.loesung.split('\n').filter((z) => z.trim() && !z.trim().startsWith('#')).length <= 30 && !/"""|'''|\\\s*$/m.test(h.loesung));
const puzzleMoeglich = (h) => puzzleArt(h) && !h.vorhersage && !h.pruefung && !h.vorlage && !P.hoefe[h.id]?.fertig && (P.hoefe[h.id]?.versuche || 0) >= 2;
const befehlText = (b) => (typeof b === 'string' ? BAUSTEINE[b]?.text : b.text);
function puzzleStart() {
  if (LAUF || !puzzleMoeglich(H)) return;
  const zeilen = H.loesung.split('\n').filter((z) => z.trim() && !z.trim().startsWith('#')).map((z) => z.trim());
  const teile = zeilen.map((z) => ({ text: z.replace(/range\((\d+)\)/, 'range(▢)') }));
  // Ablenker: die Drehung in die falsche Richtung (sonst ein Schritt zu viel)
  const tausch = { 'turn_right()': 'turn_left()', 'turn_left()': 'turn_right()' };
  const erlaubt = H.befehle.map(befehlText);
  const dreh = zeilen.find((z) => tausch[z] && erlaubt.includes(tausch[z]));
  // Kornspeicher: ein umgedrehter Vergleich (> statt <), sonst ein Schritt in die falsche Richtung
  const vgl = zeilen.find((z) => /^(if|while)\b.* [<>] /.test(z));
  // Werkstatt (OOP): ein Attribut ohne self. – der typische Fehler
  const selbst = zeilen.find((z) => /^self\.\w+ = /.test(z));
  const ablenker = H.art === 'sort'
    ? (vgl ? vgl.replace(/ ([<>]) /, (_, c) => ` ${c === '<' ? '>' : '<'} `) : selbst ? selbst.replace(/^self\./, '') : ohneSaecke(H) ? 'return None' : 'j = j + 1')
    : dreh ? tausch[dreh] : 'forward()';
  teile.push({ text: ablenker, ablenker: true });
  // gemischt – aber jeden Tag gleich (Neuladen ändert nichts)
  const rang = (t, i) => textPruefsumme(`${H.id}:${P.tag}:${i}:${t.text}`);
  teile.forEach((t, i) => { t.id = i; t.r = rang(t, i); });
  teile.sort((a, b) => (a.r < b.r ? -1 : 1));
  PZ = { teile, prog: [], fehler: 0, lohn: PUZZLE_LOHN };
  ED.setMarks(0, 0);
  ED = PUZZLE_ED;
  $('#editor').classList.add('hidden');
  $('#blockbox').classList.add('hidden');
  $('#puzzle').classList.remove('hidden');
  zeitleiste(null);
  $('#protokoll').innerHTML = '';
  log('🧩 Tippe die Zeilen in der richtigen Reihenfolge an. Mit ⬅ ➡ rückst du ein, in ▢ gehört eine Zahl. Eine Zeile ist zu viel!', 'leise');
  neben([{ label: '✏️<span class="lbl"> Selbst schreiben</span>', title: 'Zurück zum normalen Editor', fn: puzzleAbbrechen }]);
  haupt('✅ Prüfen', puzzlePruefen, PY.bereit);
  puzzleRender();
}
function puzzleAbbrechen() {
  if (LAUF) return;
  tagStart(H.id);
}
// Adapter, damit Wiedergabe und Zeitleiste die Puzzle-Zeilen markieren können
const PUZZLE_ED = {
  cur: 0, bad: 0, ro: false,
  get value() { return puzzleCode(); },
  set value(v) {},
  setReadOnly(on) { this.ro = on; puzzleRender(); },
  setMarks(cur, bad) { this.cur = cur; this.bad = bad; puzzleRender(); },
  insertLine() {}, focus() {},
};
const puzzleZeile = (p) => '    '.repeat(p.tiefe) + PZ.teile.find((t) => t.id === p.id).text.replace('▢', p.zahl ?? '');
const puzzleCode = () => (PZ ? PZ.prog.map(puzzleZeile).join('\n') : '');
// höchstens eine Stufe tiefer als die Zeile davor – und nur nach einer Zeile mit Doppelpunkt
const tiefeMax = (i) => {
  if (i === 0) return 0;
  const vor = PZ.prog[i - 1], t = PZ.teile.find((x) => x.id === vor.id).text;
  return vor.tiefe + (t.endsWith(':') ? 1 : 0);
};
function puzzleRender() {
  if (!PZ) return;
  const box = $('#puzzle'), ro = PUZZLE_ED.ro || !!PZ.fertig;
  box.innerHTML = `<div class="pzkopf">🧩 Dein Programm <span class="hinweis">${PZ.prog.length ? '' : '– tippe unten die erste Zeile an'}</span></div>
    <div class="pzliste">${PZ.prog.map((p, i) => {
      const t = PZ.teile.find((x) => x.id === p.id).text, [vor, nach] = t.split('▢');
      const zahl = t.includes('▢') ? `${esc(vor)}<input class="bzahl" data-zahl="${i}" inputmode="numeric" maxlength="3" value="${esc(p.zahl ?? '')}" ${ro ? 'disabled' : ''}>${esc(nach)}` : esc(t);
      const cls = PUZZLE_ED.bad === i + 1 ? 'bad' : PUZZLE_ED.cur === i + 1 ? 'cur' : '';
      return `<div class="pzzeile ${cls}"><span class="pznr">${i + 1}</span><span class="pzein">${'<i></i>'.repeat(p.tiefe)}</span><code>${zahl}</code>
        <span class="pzknoepfe"><button data-links="${i}" ${ro || p.tiefe === 0 ? 'disabled' : ''} title="weniger einrücken">⬅</button><button data-rechts="${i}" ${ro || p.tiefe >= tiefeMax(i) ? 'disabled' : ''} title="einrücken">➡</button><button data-weg="${i}" ${ro ? 'disabled' : ''} title="zurücklegen">✖</button></span></div>`;
    }).join('')}</div>`;
  for (const b of box.querySelectorAll('[data-links]')) b.onclick = () => { PZ.prog[+b.dataset.links].tiefe--; puzzleGeaendert(); };
  for (const b of box.querySelectorAll('[data-rechts]')) b.onclick = () => { PZ.prog[+b.dataset.rechts].tiefe++; puzzleGeaendert(); };
  for (const b of box.querySelectorAll('[data-weg]')) b.onclick = () => { PZ.prog.splice(+b.dataset.weg, 1); puzzleGeaendert(); };
  for (const f of box.querySelectorAll('[data-zahl]')) f.oninput = () => { PZ.prog[+f.dataset.zahl].zahl = f.value.replace(/\D/g, '').slice(0, 3); };
  // unten: die Zeilen, die noch nicht im Programm sind
  const pool = $('#befehle');
  pool.innerHTML = '';
  for (const t of PZ.teile) {
    if (PZ.prog.some((p) => p.id === t.id)) continue;
    const k = document.createElement('button');
    k.textContent = t.text;
    k.className = 'pzteil' + (/^(for|while|if|elif|else)\b/.test(t.text) ? ' kw' : '');
    k.disabled = ro;
    k.onclick = () => {
      // neue Zeile: so tief wie möglich, wenn die Zeile davor einen Doppelpunkt hat, sonst gleich tief
      const i = PZ.prog.length;
      PZ.prog.push({ id: t.id, tiefe: i ? tiefeMax(i) : 0, zahl: null });
      puzzleGeaendert();
    };
    pool.appendChild(k);
  }
}
function puzzleGeaendert() {
  // Einrückungen gültig halten (nach Entfernen oder Ausrücken)
  PZ.prog.forEach((p, i) => { p.tiefe = Math.max(0, Math.min(p.tiefe, tiefeMax(i))); });
  PUZZLE_ED.cur = PUZZLE_ED.bad = 0;
  puzzleRender();
}
function puzzlePruefen() {
  if (!PZ || PZ.fertig || LAUF) return;
  if (!PZ.prog.length) { toast('Leg erst Zeilen in dein Programm.'); return; }
  if (PZ.prog.some((p) => PZ.teile.find((t) => t.id === p.id).text.includes('▢') && !p.zahl)) { toast('In range(▢) fehlt noch eine Zahl.'); return; }
  const src = puzzleCode();
  const falsch = (text) => {
    PZ.fehler++;
    PZ.lohn = Math.max(PUZZLE_MIN, PUZZLE_LOHN - PUZZLE_ABZUG * PZ.fehler);
    for (const e of document.querySelectorAll('#protokoll .err')) e.remove();
    log(`${text.replace(/\.\s*$/, '')} – noch ${Math.round(PZ.lohn * 100)} % Lohn. Ändere etwas und prüfe nochmal.`, 'err');
  };
  if (H.art === 'sort') { puzzleKorn(src, falsch); return; }
  const chk = PY.check(src, H.sprache);
  if (chk.err) { PUZZLE_ED.setMarks(0, chk.err[0]); falsch(`Zeile ${chk.err[0]}: ${chk.err[1]}`); return; }
  const runs = lagen(H).map((l) => simuliere(l, src));
  const ok = runs.every((r) => r.ok);
  const zeigt = Math.max(0, runs.findIndex((r) => !r.ok));
  $('#protokoll').innerHTML = '';
  wiedergabe(runs, zeigt, () => {
    if (ok) { puzzleEnde(runs, src); return; }
    const r = runs[zeigt];
    falsch(`${runs.length > 1 ? `Hof ${LAGE_NAME[zeigt]}: ` : ''}${r.err ? `Zeile ${r.err[0]}: ${r.err[1]}` : r.msg}`);
    haupt('✅ Prüfen', puzzlePruefen, true);
    neben([{ label: '✏️<span class="lbl"> Selbst schreiben</span>', title: 'Zurück zum normalen Editor', fn: puzzleAbbrechen }]);
  });
}
// 🌾 Kornspeicher-Puzzle: auf allen Testlisten ausführen, die erste falsche Liste mit Säcken vorspielen
function puzzleKorn(src, falsch) {
  const chk = PY.check(src, kornSprache(H));
  if (chk.err) { PUZZLE_ED.setMarks(0, chk.err[0]); falsch(`Zeile ${chk.err[0]}: ${chk.err[1]}`); return; }
  const r = PY.sort(src, kornSprache(H), kornAuftrag(H));
  if (r.err) { PUZZLE_ED.setMarks(0, r.err[0]); falsch(`Zeile ${r.err[0]}: ${r.err[1]}`); return; }
  KO.laeufe = r.laeufe;
  KO.checks = r.laeufe.map((l, i) => kornPruefe(H, H.listen[i], l, i));
  const ok = KO.checks.every((c) => c.ok);
  KO.i = Math.max(0, KO.checks.findIndex((c) => !c.ok));
  $('#protokoll').innerHTML = '';
  // 🔭/🔧 ohne Säcke: Ergebnis jedes Tests ins Protokoll, Bild des ersten falschen Tests
  if (ohneSaecke(H)) {
    for (const l of r.laeufe) for (const s of l.aus || []) log('» ' + s, 'print');
    KO.checks.forEach((c, i) => log(`${KO.checks.length > 1 ? `Test ${i + 1}: ` : ''}${c.ok ? '✅ ' : '❌ '}${c.msg}`, c.ok ? 'ok' : 'err'));
    const err = r.laeufe[KO.i]?.err;
    PUZZLE_ED.setMarks(0, err ? err[0] : 0);
    sternZeigen(r.laeufe[KO.i], KO.i);
    kornTitel(KO.i); kornChips();
    if (ok) { puzzleEnde(null, src); return; }
    falsch(`${KO.checks.length > 1 ? `Test ${KO.i + 1}: ` : ''}${KO.checks[KO.i].msg}`);
    return;
  }
  kornWiedergabe(KO.i, () => {
    if (ok) { puzzleEnde(null, src); return; }
    falsch(`${KO.checks.length > 1 ? `Liste ${KORN_NAME[KO.i]}: ` : ''}${KO.checks[KO.i].msg}`);
    haupt('✅ Prüfen', puzzlePruefen, true);
    neben([{ label: '✏️<span class="lbl"> Selbst schreiben</span>', title: 'Zurück zum normalen Editor', fn: puzzleAbbrechen }]);
  });
}
function puzzleEnde(runs, src) {
  const h = hofStand(H.id), gold = Math.round(H.lohn * PZ.lohn * lohnFaktor());
  Object.assign(h, { fertig: true, puzzle: true, geloest: src, besteZeilen: PZ.prog.length, ...(runs ? { besteZuege: Math.max(...runs.map((r) => r.zuege)) } : {}) });
  h.versuche++;
  h.heute = P.tag;
  P.code[H.id] = src;
  P.gold += gold;
  speichern();
  karte(`<h2>Puzzle gelöst! 🧩</h2>
    <p>Dein Programm klappt ${!runs ? (ohneSaecke(H) ? `in ${H.listen.length === 1 ? 'dem Test' : `allen ${H.listen.length} Tests`}` : `auf ${H.listen.length === 1 ? 'der Testliste' : `allen ${H.listen.length} Testlisten`}`) : runs.length === 1 ? 'auf dem Hof' : `auf allen ${runs.length} Höfen`}.${PZ.fehler ? ` Gebraucht: ${PZ.fehler + 1}-mal prüfen.` : ' Gleich beim ersten Prüfen!'}</p>
    <p class="lohn">+${gold} 🪙 (${Math.round(PZ.lohn * 100)} % Lohn)${lohnHinweis()}</p>
    <p class="hinweis">${runs ? 'Der Hof zählt als gelöst – du kommst weiter. Die ⭐ kannst du dir später holen: mit 🔧 Verbessern, wenn du den Code selbst schreibst.' : 'Der Auftrag zählt als gelöst – du kommst weiter. Die ⭐ gibt es nur für selbst geschriebenen Code.'}</p>`,
  [{ label: '👀 Ansehen', fn: () => haupt('🌇 Feierabend', feierabend) }, { label: '🌇 Feierabend', fn: feierabend }]);
  PZ.fertig = true;   // bleibt sichtbar (Zeitleiste markiert die Zeilen), aber nichts mehr verschieben
  puzzleRender();
  neben([]);
  haupt('🌇 Feierabend', feierabend);
  hud();
}

// --- Wiedergabe: dieselben Ereignisse, dieselbe apply-Logik ---
function wiedergabe(runs, i, fertig) {
  const r = runs[i];
  LAUF = { runs, i, r, k: 0, st: FELD.start(r.lage, H), von: null, p: 1, t0: 0, dauer: 0, tempo: LAUF?.tempo || 1, fertig, letzt: performance.now() };
  ED.setReadOnly(true);
  zeitleiste(null);
  $('#feldCanvas').scrollIntoView({ block: 'nearest', behavior: 'smooth' });   // die Wiedergabe soll man sehen, nicht die Blöcke darunter
  laufChips(runs, i);
  if (runs.length > 1) log(`— Hof ${LAGE_NAME[i]} —`, 'leise');
  haupt('⏭ Ende zeigen', () => wiedergabeEnde());
  neben([{ label: tempoText(), title: 'Tempo', fn: tempoWechsel }]);
  requestAnimationFrame(wiedergabeSchritt);
}
const tempoText = () => `⏩ ${LAUF ? LAUF.tempo : 1}×`;
function tempoWechsel() {
  if (!LAUF) return;
  LAUF.tempo = LAUF.tempo >= 4 ? 1 : LAUF.tempo * 2;
  $('#neben button').textContent = tempoText();
}

function naechstesEreignis() {
  const L = LAUF, ev = L.r.ev[L.k++];
  L.von = { x: L.st.x, y: L.st.y, dir: L.st.dir };
  if (ev.kind === 'print') { log('» ' + ev.text, 'print'); L.dauer = 0.15; }
  else {
    FELD.apply(L.st, ev);
    feldEffekt(ev, L.st);   // ✨ Rübe springt, Wasser spritzt … (nur Bild)
    const m = FELD.meldung(L.st, ev);
    if (m) log(m[0], m[1]);
    L.dauer = ev.kind === 'forward' && !ev.bump ? 0.38 : 0.28;
  }
  ED.setMarks(ev.line, 0);
  L.p = 0;
}

function wiedergabeSchritt(now) {
  const L = LAUF;
  if (!L) return;
  const dt = Math.min(0.1, (now - L.letzt) / 1000) * L.tempo;
  L.letzt = now;
  L.p = L.dauer ? Math.min(1, L.p + dt / L.dauer) : 1;
  if (L.p >= 1) {
    if (L.k >= L.r.ev.length) { wiedergabeEnde(); return; }
    naechstesEreignis();
  }
  FELD.draw($('#feldCanvas'), L.st, L.von, L.p);
  requestAnimationFrame(wiedergabeSchritt);
}

function wiedergabeEnde() {
  const L = LAUF;
  if (!L) return;
  while (L.k < L.r.ev.length) naechstesEreignis();
  L.p = 1;
  FELD.draw($('#feldCanvas'), L.st);
  const r = L.r;
  if (r.err) { ED.setMarks(0, r.err[0]); log(`Zeile ${r.err[0]}: ${r.err[1]}`, 'err'); }
  else ED.setMarks(0, 0);
  if (r.budget) log(`⏰ Die ${ZUEGE} Züge des Tages sind aufgebraucht.`, 'err');
  log(r.ok ? '✅ ' + r.msg : '❌ ' + r.msg, r.ok ? 'ok' : 'err');
  LAUF = null;
  ED.setReadOnly(false);
  zeitleiste(r);
  if (L.fertig) setTimeout(L.fertig, 500);
  else haupt('🌇 Feierabend', feierabend);
}

// --- 🔍 Zeitleiste (wie CodeCombat): nach dem Lauf Schritt für Schritt vor- und zurückspulen = Debuggen lernen ---
// Der Zustand nach Schritt k entsteht neu aus FELD.start + den ersten k Ereignissen (ohne Effekte und Protokoll).
let ZL = null;
function zeitleiste(r) {
  const box = $('#zeitleiste');
  ZL = r && r.ev.length ? { r, k: r.ev.length, zeilen: ED.value.split('\n') } : null;
  box.classList.toggle('hidden', !ZL);
  if (!ZL) { box.innerHTML = ''; return; }
  const n = r.ev.length;
  box.innerHTML = `<div class="zlkopf">🔍 <b>Zurückspulen</b> <span class="hinweis">Schritt für Schritt nachsehen, was dein Code getan hat</span></div>
    <div class="zlzeile"><button class="btn klein leise" data-z="0" title="Zum Anfang">⏮</button><button class="btn klein leise" data-z="-1" title="Ein Schritt zurück">◀</button>
    <input type="range" min="0" max="${n}" value="${n}" id="zlRegler" aria-label="Schritt"><button class="btn klein leise" data-z="1" title="Ein Schritt vor">▶</button>
    <button class="btn klein leise" data-z="${n}" title="Zum Ende">⏭</button></div><div class="zlinfo" id="zlInfo"></div>`;
  $('#zlRegler').oninput = (e) => zlZeige(+e.target.value);
  for (const b of box.querySelectorAll('[data-z]')) b.onclick = () => {
    const z = b.dataset.z;
    zlZeige(z === '-1' || z === '1' ? ZL.k + +z : +z);
  };
  zlZeige(n, true);
}
function zlZeige(k, still) {
  if (!ZL || LAUF) return;
  const r = ZL.r, n = r.ev.length;
  k = Math.max(0, Math.min(n, k));
  ZL.k = k;
  const st = FELD.start(r.lage, H);
  let print = null, meldung = null;
  for (let j = 0; j < k; j++) { const ev = r.ev[j]; if (ev.kind === 'print') print = ev.text; else { FELD.apply(st, ev); if (j === k - 1) meldung = FELD.meldung(st, ev); } }
  FELD.draw($('#feldCanvas'), st);
  const ev = r.ev[k - 1], ende = k === n;
  $('#zlRegler').value = k;
  if (!still) ED.setMarks(ev ? ev.line : 0, ende && r.err ? r.err[0] : 0);
  const was = !ev ? 'Start: so sah der Hof am Anfang aus.' : ev.kind === 'print' ? `print → ${esc(ev.text)}` : `Zeile ${ev.line}: <code>${esc((ZL.zeilen[ev.line - 1] || '').trim())}</code>${ev.bump ? ' – 💥 gegen den Zaun!' : ''}`;
  // was bei diesem Schritt passiert ist (z. B. „Korb leer“, „kein Weg“) und am Ende der Grund, warum es nicht geklappt hat
  const warum = meldung && meldung[1] !== 'ok' ? `<div class="zlwarum ${meldung[1]}">${esc(meldung[0])}</div>` : '';
  // 📦 Variablen bei diesem Schritt (wie sie waren, als die Zeile drankam)
  let vars = '';
  try {
    const v = ev?.vars ? JSON.parse(ev.vars) : null;
    if (v) vars = `<div class="zlvars">📦 ${Object.entries(v).map(([name, w]) => `<code>${esc(name)} = ${esc(typeof w === 'string' ? `"${w}"` : w === true ? 'True' : w === false ? 'False' : String(w))}</code>`).join(' ')}</div>`;
  } catch { /* alter Lauf */ }
  $('#zlInfo').innerHTML = `<b>Schritt ${k} von ${n}</b> · ${was}${print !== null && ev?.kind !== 'print' ? ` · letzte Ausgabe: ${esc(print)}` : ''}${vars}${warum}${ende ? (r.ok ? '<div>✅ geschafft</div>' : `<div class="zlwarum err">❌ ${esc(r.msg)}${r.err ? ` · Zeile ${r.err[0]}: ${esc(r.err[1])}` : ''}</div>`) : ''}`;
}

// Didaktik-Prüfung (f1): „1 von 10 Rüben“ sagte nicht, warum. Genau eine Aufgabe erledigt, obwohl der Code eine Schleife hat
// → fast immer steht der Befehl nicht eingerückt in der Schleife (oder davor/dahinter).
function einrueckHinweis(runs) {
  const src = (P.code[H.id] ?? ED.value ?? '').replace(/#.*$/gm, '');
  if (!/^\s*(for|while)\b.*:\s*$/m.test(src)) return '';
  const einmal = runs.some((r) => !r.ok && !r.err && /^1 von ([3-9]|\d\d+) /.test(r.msg || ''));
  return einmal ? '<p class="hinweis">💡 Nur eine Aufgabe erledigt, obwohl dein Code eine Schleife hat: Steht der Befehl eingerückt <b>in</b> der Schleife? Was wiederholt werden soll, rückt man unter dem for/while ein.</p>' : '';
}

// --- Ergebnis: höchstens 4 Blöcke ---
function ergebnis(e) {
  if (H.pruefung) { pruefungErgebnis(e); return; }
  if (e.verbessern) { verbessernErgebnis(e); return; }
  const st = (an, t) => `<span class="${an ? '' : 'aus'}" title="${t}">⭐</span>`;
  const why = e.ok
    ? `<div class="zeile"><span>⭐ kurz: ${e.count} Anweisungen</span><span>${e.kurz ? '✓' : `Ziel ≤ ${H.par}`}</span></div>
       <div class="zeile"><span>⭐ sparsam: ${e.zuege} Züge</span><span>${e.sparsam ? '✓' : `Ziel ≤ ${H.sparsam}`}</span></div>`
    : `<p>${e.runs.map((r, i) => `${e.runs.length > 1 ? `Hof ${LAGE_NAME[i]}: ` : ''}${r.ok ? '✓' : esc(r.err ? 'Fehler in Zeile ' + r.err[0] : r.msg)}`).join('<br>')}</p>${einrueckHinweis(e.runs)}`;
  const loesung = e.ok ? `<details><summary>Musterlösung ansehen</summary><pre class="mono">${esc(H.loesung)}</pre></details>` : '';
  // Nutzerwunsch 2026-11-14: sichtbar nur Ergebnis, Sterne bzw. Fehler und Lohn – Erklärungen unter „Mehr“
  const mehrText = e.ok
    ? `${why}${e.warFertig ? '<p class="hinweis">Schon gelöster Hof: weniger Lohn, neue Sterne zählen voll.</p>' : ''}${loesung}`
    : `<p class="hinweis">${e.warFertig ? 'Diesen Hof hast du schon gelöst – Teillohn gibt es nur beim ersten Mal.' : `Für die ganze Aufgabe gibt es ${H.lohn} 🪙, mit ⭐⭐ noch mehr.`} Morgen kannst du es noch einmal versuchen. ${puzzleMoeglich(H) ? 'Wenn es wieder hakt, hilft dir die 🧩 Puzzle-Hilfe.' : 'Wenn du willst, nimm einen 💡 Tipp.'}</p>`;
  karte(`<h2>${e.ok ? 'Geschafft! 🎉' : 'Noch nicht ganz'}</h2>
    ${e.ok ? `<div class="sterne">✅ ${st(e.kurz, 'kurz')}${st(e.sparsam, 'sparsam')}</div>` : why}
    ${!e.ok ? `<div class="teil"><div class="teilbalken"><i style="width:${Math.round(e.anteil * 100)}%"></i></div><span>${Math.round(e.anteil * 100)} % erledigt</span></div>` : ''}
    <p class="lohn">+${e.gold} 🪙${!e.ok && e.gold ? ' Teillohn' : ''}${lohnHinweis()}</p>
    <details class="mehr"><summary>${e.ok ? 'Mehr: Sterne und Musterlösung' : 'Mehr'}</summary>${mehrText}</details>`, [...zweitKnopf(e.ok), { label: '👀 Ansehen', fn: () => haupt('🌇 Feierabend', feierabend) }, { label: '🌇 Feierabend', fn: feierabend }]);
  neben([]);
  haupt('🌇 Feierabend', feierabend);
  hud();
}

// Ergebnis beim Verbessern: Vergleich mit dem bisher besten Code, zurück zur Karte (der Tag ist noch frei)
function verbessernErgebnis(e) {
  const st = (an, t) => `<span class="${an ? '' : 'aus'}" title="${t}">⭐</span>`, h = hofStand(H.id), v = e.vorher;
  const pfeil = (alt, neu) => (alt == null ? `${neu}` : neu < alt ? `${alt} → <b class="gut">${neu}</b>` : neu > alt ? `${alt} → <span class="schlecht">${neu}</span>` : `${neu} (gleich)`);
  const robo = P.roboter[H.id] && e.besser ? `<p class="hinweis">🤖 Dein Roboter arbeitet ab morgen mit dem neuen Code: bis zu ${roboLohn(H, roboGuete(H, e.zuege))} 🪙 pro Morgen.</p>` : '';
  const zur = () => { P.phase = 'morgen'; speichern(); karteStart(); };
  karte(`<h2>${!e.ok ? 'Diesmal nicht geschafft' : e.besser ? 'Verbessert! 🔧' : 'Geschafft – aber nicht besser'}</h2>
    ${e.ok ? `<div class="sterne">✅ ${st(h.kurz, 'kurz')}${st(h.sparsam, 'sparsam')}</div>
      <div class="zeile"><span>Anweisungen (⭐ kurz ≤ ${H.par})</span><span>${pfeil(v.zeilen, e.count)}</span></div>
      <div class="zeile"><span>Züge (⭐ sparsam ≤ ${H.sparsam})</span><span>${pfeil(v.zuege, e.zuege)}</span></div>`
    : `<p>${e.runs.map((r, i) => `${e.runs.length > 1 ? `Hof ${LAGE_NAME[i]}: ` : ''}${r.ok ? '✓' : esc(r.err ? 'Fehler in Zeile ' + r.err[0] : r.msg)}`).join('<br>')}</p>
      <p class="hinweis">Dein bisher bester Code bleibt gespeichert.</p>`}
    ${e.gold ? `<p class="lohn">+${e.gold} 🪙 für ${e.neuKurz && e.neuSparsam ? 'zwei neue ⭐' : 'einen neuen ⭐'}</p>` : ''}
    ${robo}
    <p class="hinweis">Verbessern kostet keinen Tag – ab zur Karte und such dir die heutige Arbeit aus.</p>`,
  [{ label: '👀 Ansehen', fn: () => haupt('🗺️ Zur Karte', zur) }, { label: '🗺️ Zur Karte', fn: zur }]);
  neben([]);
  haupt('🗺️ Zur Karte', zur);
  hud();
}

function pruefungErgebnis(e) {
  const laeufe = e.runs.map((r, i) => `Variante ${LAGE_NAME[i]}: ${r.ok ? '✓' : esc(r.err ? 'Fehler in Zeile ' + r.err[0] : r.msg)}`).join('<br>');
  karte(e.ok
    ? `<h2>⚜️ Prüfung bestanden!</h2><p>Dein Code hat alle ${e.runs.length} Varianten geschafft.</p>
       <p class="lohn" style="color:#e0c8ff">+1 Spezialisierungspunkt</p>
       <p class="hinweis">${e.ersteSpez ? 'Heute Abend wählst du im ✨ Talentbaum deine Spezialisierung: Chaos, Licht, Natur oder Zeit.' : 'Lerne ihn heute Abend im ✨ Talentbaum (⚜️ Spezialisierung).'}</p>
       <details><summary>Musterlösung ansehen</summary><pre class="mono">${esc(H.loesung)}</pre></details>`
    : `<h2>Prüfung nicht bestanden</h2><p>${laeufe}</p><p class="hinweis">Du kannst es an einem anderen Morgen noch einmal versuchen. Dein Code bleibt gespeichert.</p>`,
  [{ label: '👀 Ansehen', fn: () => haupt('🌇 Feierabend', feierabend) }, { label: '🌇 Feierabend', fn: feierabend }]);
  if (e.ersteSpez) TTAB = 'spez';
  neben([]);
  haupt('🌇 Feierabend', feierabend);
  hud();
}

function feierabend() {
  if (LAUF) return;
  P.phase = 'abend';
  speichern();
  karteStart();
}
