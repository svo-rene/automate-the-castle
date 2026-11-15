'use strict';
// --- Start: Spielstand, Editor, Python, Phase wiederherstellen -----------------------

// 🪙 LK-Burgen: Lohn × 0,6 (Durchlauf 2026-11-12: Aufträge brachten 83–140 🪙, 12 Nächte ohne einen Mauertreffer;
// Bot mit 0,6: Burg 21/29/30 wie Burg 8 – mittel ≈ Nacht 31–33 nach 40 Tagen, Kampagne für alle schaffbar)
const LK_LOHN = 0.6;
for (const h of HOEFE) if (BURGEN[hofBurg(h)]?.klasse === 'LK' && !h.lkLohn) { h.lohn = Math.round(h.lohn * LK_LOHN); h.lkLohn = true; }

// Lädt CodeMirror nicht, springt ein einfaches Textfeld mit denselben Methoden ein.
function plainEditor(parent, { doc, onChange }) {
  const ta = document.createElement('textarea');
  ta.value = doc;
  ta.spellcheck = false;
  ta.oninput = () => onChange(ta.value);
  parent.appendChild(ta);
  return {
    get value() { return ta.value; },
    set value(v) { ta.value = v; },
    setReadOnly(on) { ta.readOnly = on; },
    insertLine(text) {
      const pos = ta.selectionStart, vor = ta.value.slice(0, pos), start = vor.lastIndexOf('\n') + 1;
      const zeile = ta.value.slice(start).split('\n')[0], ind = zeile.match(/^\s*/)[0];
      const body = text.replace(/¦/g, ''), at = text.indexOf('¦');
      let ins, from;
      if (zeile.trim()) { from = start + zeile.length; ins = '\n' + ind + (/:\s*$/.test(zeile) ? '    ' : '') + body; }
      else { from = start; ins = ind + body; }
      ta.value = ta.value.slice(0, from) + ins + ta.value.slice(start + zeile.length);
      const c = from + ins.length - (at < 0 ? 0 : body.length - at);
      ta.setSelectionRange(c, c);
      ta.focus();
      onChange(ta.value);
    },
    setMarks() {},
    focus() { ta.focus(); },
    insertText(text) {
      if (ta.readOnly) return;
      const at = text.indexOf('¦'), body = text.replace(/¦/g, ''), pos = ta.selectionStart;
      ta.setRangeText(body, pos, ta.selectionEnd, 'end');
      if (at >= 0) ta.setSelectionRange(pos + at, pos + at);
      ta.focus(); onChange(ta.value);
    },
    indent(mehr) {
      if (ta.readOnly) return;
      const pos = ta.selectionStart, start = ta.value.lastIndexOf('\n', pos - 1) + 1;
      if (mehr) ta.setRangeText('    ', start, start, 'end');
      else { const n = ta.value.slice(start, start + 4).match(/^ */)[0].length; ta.setRangeText('', start, start + n, 'end'); }
      ta.focus(); onChange(ta.value);
    },
  };
}

let speicherT = 0;
function editorBauen() {
  if (ED) return;
  const opts = {
    doc: '',
    onChange: (v) => {
      if (P.phase !== 'tag' || !H || LAUF) return;
      P.code[H.id] = v;
      clearTimeout(speicherT);
      speicherT = setTimeout(speichern, 400);
    },
  };
  try { ED = window.createEditor ? window.createEditor($('#editor'), opts) : null; } catch (e) { console.error(e); }
  if (!ED) ED = plainEditor($('#editor'), opts);
  CODE_ED = ED;
}

// Ältere Spielstände: Höfe aus der Zeit vor den 8 Kapiteln umbenennen
function hoefeUmstellen() {
  for (const [alt, neu] of Object.entries(ALTE_IDS)) {
    if (P.hoefe[alt] && !P.hoefe[neu]) P.hoefe[neu] = P.hoefe[alt];
    if (P.code[alt] != null && P.code[neu] == null) P.code[neu] = P.code[alt];
    if (P.hof === alt) P.hof = neu;
    delete P.hoefe[alt]; delete P.code[alt];
  }
  if (P.hof && !hofById(P.hof)) P.hof = null;
}

// 🎁 Erbe: Wer schon eine andere Burg gespielt hat, wählt beim Start einer neuen Burg einen kleinen Startvorteil
const ERBE = [
  { id: 'gold', ico: '💰', name: 'Kriegskasse', text: '+60 🪙 zum Start – genug für zwei Türme.', tu: () => { P.gold += 60; } },
  { id: 'punkt', ico: '✨', name: 'Erfahrung', text: 'Dein Held startet mit einem Talentpunkt mehr.', tu: () => { P.erbePunkt = 1; } },
  { id: 'wache', ico: '🛡️', name: 'Veteranen', text: 'Die Torwache startet eine Stufe höher (3 Soldaten).', tu: () => { P.wache = Math.max(P.wache, 1); } },
];
function erbeKarte() {
  karte(`<h2>🎁 Dein Erbe</h2><p>Willkommen in der ${BURGEN[BURGNR].name}! Du hast schon eine andere Burg verteidigt. Nimm dir einen Vorteil mit – nur einen.</p>
    <div class="spezwahl">${ERBE.map((e) => `<button data-erbe="${e.id}"><span class="sico">${e.ico}</span><b>${e.name}</b><span class="hinweis">${e.text}</span></button>`).join('')}</div>`, []);
  for (const b of document.querySelectorAll('[data-erbe]')) b.onclick = () => {
    const e = ERBE.find((x) => x.id === b.dataset.erbe);
    e.tu();
    P.erbeOffen = false; P.erbe = e.id; P.gesehen.willkommen = true;
    speichern();
    karteZu();
    hud();
    karteStart();
    toast(`${e.ico} ${e.name}!`);
  };
}

// 📖 Einstiegsgeschichte: was Tag und Nacht miteinander zu tun haben, Aufgabe und Ziel
// Nutzerwunsch 2026-11-14: keine Textwände beim Start – zwei Sätze, der Rest wird erklärt, wenn man ihn braucht
const STORY = [
  'Jede Nacht kommen Monster aus dem Nebel und greifen deine Burg an.',
  'Tagsüber programmierst du deine Hilfe auf dem Hof – das bringt Gold für Türme.',
];
function storyKarte(weiter) {
  karte(`<h2>🏰 Die Burg im Nebel</h2>${STORY.map((s) => `<p>${s}</p>`).join('')}
    <p class="hinweis">☀️ programmieren · 🌇 Türme bauen · 🌙 verteidigen</p>`,
  [{ label: 'Weiter ▶', fn: weiter }]);
}
// 🧑‍🌾 Figur wählen: Bauer & Zauberer oder Bäuerin & Zauberin (PROFIL.figur, gilt für alle Burgen)
const FIGUR = { m: { bauer: 'Bauer', held: 'Zauberer', dem: 'deinem Bauern' }, w: { bauer: 'Bäuerin', held: 'Zauberin', dem: 'deiner Bäuerin' } };
const figur = () => FIGUR[PROFIL.figur] || FIGUR.m;
function figurWahl(weiter) {
  let sel = PROFIL.figur || null;
  const zeig = () => {
    karte(`<h2>Wer bist du?</h2>
      <div class="figurwahl">${['m', 'w'].map((f) => `<button data-figur="${f}" class="${sel === f ? 'sel' : ''}"><canvas width="230" height="130" data-vorschau="${f}"></canvas>
        <b>${FIGUR[f].bauer} & ${FIGUR[f].held}</b></button>`).join('')}</div>
      <p class="hinweis">Später änderbar: ☰ → Figur wählen</p>`,
    [{ label: sel ? 'Los geht\'s!' : '👆 Erst antippen', offen: !sel, fn: () => { if (!sel) return; PROFIL.figur = sel; profilSpeichern(); weiter?.(); } }]);
    // Vorschau: dieselben Zeichnungen wie im Spiel
    const alt = PROFIL.figur;
    for (const c of document.querySelectorAll('[data-vorschau]')) {
      PROFIL.figur = c.dataset.vorschau;
      const g = c.getContext('2d');
      g.fillStyle = '#4f8f3c'; g.fillRect(0, 0, 115, 130); g.fillStyle = '#1d2a52'; g.fillRect(115, 0, 115, 130);
      malBauer(g, 57, 78, 80, 'O', 0); malHeld(g, 172, 82, 64, performance.now() / 1000);
    }
    PROFIL.figur = alt;
    for (const b of document.querySelectorAll('[data-figur]')) b.onclick = () => { sel = b.dataset.figur; zeig(); };
  };
  zeig();
}

// Zeigt den Bildschirm, der zur gespeicherten Phase gehört
function phaseZeigen() {
  if (P.phase === 'tag' && P.hof && hofStand(P.hof).heute === P.tag) P.phase = 'abend';  // heute schon gearbeitet
  if (P.phase === 'tag' && P.hof && hofStand(P.hof).besser === P.tag) P.phase = 'morgen';  // 🔧 heute schon verbessert: der Tag ist noch frei
  if (P.phase === 'nacht') P.phase = 'abend';  // abgebrochene Nacht beginnt neu
  // Gold, das in der abgebrochenen Nacht schon gezahlt wurde, zählt nicht (sonst ließe sich Welle 1 immer wieder spielen)
  if (P.nachtVorschuss) { P.gold = Math.max(0, P.gold - P.nachtVorschuss); P.nachtVorschuss = 0; speichern(); }
  if (P.phase === 'tag' && P.hof) tagStart(P.hof);
  else karteStart();
}

// ♾️ Endlos-Modus (?endlos): erst das Passwort (gilt, bis der Tab geschlossen wird), dann der eigene Spielstand atc_endlos
function endlosPasswort() {
  karte(`<h2>♾️ Endlos-Modus</h2><p>Direkt in die Endlosnächte – ohne Programmieren, mit eigenem Spielstand.</p>
    <p><input id="endlosPw" type="password" autocomplete="off" placeholder="Passwort" style="width:100%;font-size:1.1em;padding:8px"></p>
    <p class="hinweis" id="endlosFehler"></p>`,
  [{ label: 'Zum normalen Spiel', fn: () => { location.href = location.pathname; } },
    { label: '♾️ Starten', offen: true, fn: pruefen }]);
  function pruefen() {
    if (textPruefsumme($('#endlosPw').value.trim().toLowerCase()) !== ENDLOS_PRUEF) { $('#endlosFehler').textContent = '❌ Falsches Passwort.'; return; }
    try { sessionStorage.setItem('atc_endlos_ok', '1'); } catch { /* privat */ }
    location.reload();
  }
  const pw = $('#endlosPw');
  pw.focus();
  pw.onkeydown = (e) => { if (e.key === 'Enter') pruefen(); };
}

async function start() {
  if (new URLSearchParams(location.search).has('endlos')) {
    let ok = false;
    try { ok = sessionStorage.getItem('atc_endlos_ok') === '1'; } catch { /* privat */ }
    if (!ok) { endlosPasswort(); return; }
    ENDLOS = true;
    document.title = '♾️ ' + document.title;
  }
  if (LK && !ENDLOS) document.title = '🎓 LK · ' + document.title;
  laden();
  hoefeUmstellen();
  // Talentnetz neu (v5: Richtungen, Kombos von selbst, Schlüsseltalente): alle Punkte einmal kostenlos zurück
  if ((P.talentVer || 1) < 6) { P.talente = ['mitte']; P.talentVer = 6; }
  // v7: Zauber kommen aus 💎 Steinen. Wer einen Zauber im Netz gelernt hatte, bekommt ihn als Stein; alle Punkte zurück
  if (P.talentVer < 7) {
    for (let t = 0; t < 6; t++) if (P.talente.includes('c' + t)) P.steine[t] = 1;
    P.sockel = (P.ausgeruestet || []).filter((t) => P.steine[t]);
    P.talente = ['mitte']; P.talentVer = 7;
    delete P.ausgeruestet; delete P.platzZahl;
  }
  // v8: Netz wie bei PoE (kleine und große Knoten, nichts ruht) – alle Punkte zurück; Steine ohne Sterne, Stützen je Stein
  if (P.talentVer < 8) {
    P.talente = ['mitte']; P.talentVer = 8;
    for (const t of Object.keys(P.steine)) P.steine[t] = true;
    if (Array.isArray(P.stuetzen)) { P.stuetzVorrat = [...new Set([...(P.stuetzVorrat || []), ...P.stuetzen.flat()])].filter((id) => STUETZEN[id]); P.stuetzen = {}; }
    if (P.werkstatt) for (const t of steinBesitz()) P.stuetzSockel[t] = Math.max(P.stuetzSockel[t] || 0, P.werkstatt);
    delete P.werkstatt;
  }
  // v9: Netz als Geflecht (alle Punkte zurück); Sockel kommen vom Zauberstab – wer schon mehr Sockel hatte, bekommt den passenden Stab
  if (P.talentVer < 9) {
    const L = heldLevel().level;
    P.stab = L >= 25 ? 5 : L >= 15 ? 3 : L >= 5 ? 1 : 0;
    P.talente = ['mitte']; P.talentVer = 9;
  }
  // v10: Burg 7 bekommt das kleine Netz (alle großen Kräfte, weniger kleine Knoten) – dort alle Punkte einmal zurück
  baueBaum(BURGNR === 7 && !ENDLOS, LK || ENDLOS);   // 🌌 Sternenring und 💎 Juwel-Fassungen nur im Leistungskurs und im Endlos-Modus   // ♾️ Endlos: immer das große Netz (Spieltest: dort fehlten Funde, Wunder, Meisterschaft)
  if (P.talentVer < 10) { if (BURGNR === 7) P.talente = ['mitte']; P.talentVer = 10; }
  // Talente, die es im Baum nicht (mehr) gibt, verfallen – der Punkt ist wieder frei
  P.talente = ['mitte', ...P.talente.filter((id) => id !== 'mitte' && TALENTE[id])];
  if (P.heftGelesen === undefined) P.heftGelesen = heftStand();   // 🔴 ab jetzt zählt Neues im Heft
  farbenSetzen();
  hud();
  $('#menuBtn').onclick = menuUmschalten;
  $('#ruhmPill').onclick = () => abzeichenKarte('kampf');
  $('#sternPill').onclick = () => abzeichenKarte('stern');
  $('#goldPill').onclick = () => toast('🪙 Gold verdienst du tagsüber auf den Höfen. Abends baust du damit Türme.');
  $('#heldPill').onclick = () => { const L = heldLevel(); toast(`🧙 Held Level ${L.level} · ${L.rest}/${L.noetig} XP bis zum nächsten Level. XP gibt es für jede Nacht.`); };
  $('#zeitPill').onclick = () => toast(`Tag ${P.tag} · nächste Nacht: ${P.nacht}${P.rekord ? ` · Rekord: Nacht ${P.rekord}` : ''}`);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#menuPop, #menuBtn')) $('#menuPop').classList.add('hidden');
  });

  // CodeMirror kommt als Modul nach den klassischen Skripten
  await new Promise((ok) => {
    if (window.createEditor) ok();
    window.addEventListener('editor-bereit', ok, { once: true });
    setTimeout(ok, 4000);
  });
  editorBauen();

  if (location.protocol === 'file:') {
    karte('<h2>Bitte über den Server starten</h2><p>Als Datei geöffnet darf der Browser Python nicht laden. Starte <b>start.bat</b> (Doppelklick).</p>', []);
    return;
  }
  phaseZeigen();
  if (ENDLOS) toast(`♾️ Endlos-Modus: eigener Spielstand, kein Programmieren. Nacht ${P.nacht} · Rekord ${P.rekord || '–'}`, 4500);
  // 🏰 Startbildschirm (start.js) offen: die Startkarten kommen erst, wenn man ihn verlässt – Python lädt schon im Hintergrund
  if (typeof startOffen === 'function' && startOffen()) startDanach(startKarten); else startKarten();
  await initPython(BRUECKE);
  if (!PY.bereit) {
    karte(`<h2>Python lädt nicht</h2><p>${esc(PY.fehler || '')}</p>`, [{ label: 'Neu laden', fn: () => location.reload() }]);
    return;
  }
  autoZiele();
  if (P.phase === 'tag' && H?.art === 'sort' && !KO) kornStart();   // 🌾 Kornspeicher braucht Python schon zum Aufbauen
  // Knöpfe, die auf Python gewartet haben, freigeben
  const b = $('#hauptBtn');
  if (b.textContent === 'Los!' || b.textContent === '▶ Ausführen') b.disabled = false;
  else if (b.disabled && b.textContent === 'Python lädt …') phaseZeigen();
}

// Karten beim Start: Burgwahl, Erbe, Beute, Geschichte/Figur
function startKarten() {
  // Erster Tag in einer weiteren Burg: Erbe wählen. Beim allerersten Start überhaupt: Begrüßung mit dem Ablauf des Spiels
  // 🔒 Gewünschte Burg (z. B. ?klasse=8) ist noch nicht freigeschaltet: Burgwahl mit Code-Feld zuerst
  if (!ENDLOS && PROFIL.burg !== BURGNR) { const w = PROFIL.burg; PROFIL.burg = BURGNR; profilSpeichern(); BURG_SEL = BURGEN[w] ? w : null; burgWahl(); }
  else if (P.erbeOffen) erbeKarte();
  else if (P.beuteWahl && P.phase !== 'tag') beuteZeigen();   // 💎 Beute noch nicht gewählt
  // Allererster Start: Geschichte → Figur wählen → Ablauf des Spiels; wer schon spielt, wählt nur einmal die Figur
  // Die Geschichte nur einmal je Profil (Spieltest: bei jeder neuen LK-Burg kam sie wieder), danach nur die Begrüßung dieser Burg
  else if (!P.gesehen.willkommen && P.tag === 1 && P.phase === 'morgen') {
    P.gesehen.willkommen = true; speichern();
    // danach keine Regel-Karte mehr (Nutzerwunsch: nur erklären, wenn man es braucht) – der 👆 Finger führt zum ersten Hof
    const weiter = () => { if (!PROFIL.figur) figurWahl(); };
    if (PROFIL.storyGesehen) weiter(); else { PROFIL.storyGesehen = true; profilSpeichern(); storyKarte(weiter); }
  }
  else if (!PROFIL.figur) figurWahl(() => { if (P.phase === 'tag' && H && !H.art) zeigeLage(H.start); });
}

window.addEventListener('resize', () => {
  if (P.phase === 'tag' && H && !LAUF && !H.art) zeigeLage(H.start);   // Archiv-Aufträge haben keinen Acker
  if (P.phase === 'tag' && H?.art === 'sort' && !LAUF && KO && H.listen) {
    if (ohneSaecke(H)) sternZeigen(KO.laeufe?.[KO.i] || null, KO.i);   // Sternwarte/Werkstatt: Ansicht neu zeichnen
    else kornMalen(KO.laeufe?.[KO.i]?.ende || H.listen[KO.i] || [], { verdeckt: H.sortArt === 'karten' && !KO.laeufe });
  }
});

// Für Tests im Hintergrund-Tab
window.ATC = {
  get P() { return P; }, get N() { return N; }, get ED() { return ED; }, get LAUF() { return LAUF; },
  tagStart, ausfuehren, wiedergabeEnde, feierabend, nachtStart, nachtSofort, nachtEnde, simNacht, risiko, karteStart, abendStart, kaufe,
  setSel: (i) => { SEL = i; },
};

start();
