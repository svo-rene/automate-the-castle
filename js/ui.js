'use strict';
// --- Rahmen: HUD, Aktionsleiste, Karten (Overlay), Toast, Menü -------------------------
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function zeigeScreen(name) {
  for (const el of document.querySelectorAll('.screen')) el.classList.toggle('hidden', el.id !== 'scr-' + name);
  $('main').scrollTop = 0;
}

function hud() {
  // ♾️ Endlos-Modus: kein Tag – dort zählt nur die Nacht (zwischen den Nächten ist immer Abend)
  const zeit = ENDLOS ? (P.phase === 'nacht' ? ['🌙', 'Nacht'] : ['🌇', 'Abend vor Nacht'])
    : { morgen: ['☀️', 'Tag'], tag: ['☀️', 'Tag'], abend: ['🌇', 'Abend'], nacht: ['🌙', 'Nacht'] }[P.phase];
  // auf schmalen Bildschirmen nur Symbol und Zahl (.lbl ist dort ausgeblendet)
  $('#zeitPill').innerHTML = `${zeit[0]}<span class="lbl"> ${zeit[1]}</span> ${ENDLOS || P.phase === 'nacht' || P.phase === 'abend' ? P.nacht : P.tag}`;
  $('#goldPill').textContent = `🪙 ${P.gold}`;
  // Held-Level erst, wenn es XP gibt
  const L = heldLevel(), hp = $('#heldPill');
  hp.classList.toggle('hidden', !P.xp || !heldOffen());
  hp.textContent = `🧙 ${L.level}`;
  hp.title = `${PROFIL.figur === 'w' ? 'Heldin' : 'Held'} Level ${L.level} · ${L.rest}/${L.noetig} XP`;
  // 🏆 Ruhm (Verteidigung) und ⭐ Sterne (Aufgaben) getrennt, je mit Abzeichen (abzeichen.js); 🎁 = Schatz zum Kaufen frei
  const kaufbar = (art) => abzLeiterDa(art) && abzListe(art).some((a) => abzWert(art) >= a.ab && SCHAETZE[a.schatz].preis && !schatzHat(a.schatz) && !schatzSchonWunder(a.schatz) && P.gold >= SCHAETZE[a.schatz].preis);
  const rp = $('#ruhmPill'), r = ruhm();
  if (rp) {
    const a = abzAktuell('kampf');
    rp.classList.toggle('hidden', !r && !a && P.nacht <= 1);
    rp.textContent = `${a ? a.ico + ' ' : ''}🏆 ${r}`;
    rp.classList.toggle('puls', kaufbar('kampf'));
    rp.title = `Ruhm ${r} (Rekord ${ruhmRekord()})${a ? ` · Abzeichen: ${a.name}` : ''}: Monster +${Math.round((ruhmFaktor() - 1) * 100)} % stärker, dafür +${Math.round((ruhmLohn() - 1) * 100)} % XP, Kopfgeld und Beute`;
  }
  const sp = $('#sternPill');
  if (sp) {
    const a = abzAktuell('stern'), s = sternePunkte();
    sp.classList.toggle('hidden', ENDLOS || !abzLeiterDa('stern') || (!s && !a));   // Endlos: keine Aufgaben, keine Sterne
    sp.textContent = `${a ? a.ico + ' ' : ''}⭐ ${s}`;
    sp.classList.toggle('puls', kaufbar('stern'));
    sp.title = `${s} Sterne aus den Aufgaben${a ? ` · Abzeichen: ${a.name}` : ''} – antippen: Abzeichen und Schätze`;
  }
  // 🏗️ Bauleiste: zu teure Türme blass (Gold ändert sich nachts laufend)
  if ((P.phase === 'abend' || P.phase === 'nacht') && typeof turmPreis === 'function')
    for (const b of document.querySelectorAll('.screen:not(.hidden) .bauleiste [data-bau]')) b.classList.toggle('teuer', P.gold < turmPreis(b.dataset.bau));
  // 🔴 roter Punkt am ☰, wenn im Heft etwas Neues steht
  $('#menuBtn')?.classList.toggle('neu', heftNeu());
}
// Heft-Stand = Kapitelseiten + erklärte Spielregeln; gelesen wird beim Öffnen gemerkt
// (nur, was im Heft wirklich steht: Kapitelseiten und erklärte Spielregeln aus ERKL – nicht Lernkarten oder Turm-Hinweise)
const heftStand = () => typeof heftKapitel === 'function' ? heftKapitel().length + ERKL.filter((e) => P.gesehen?.[e.key]).length : 0;
const heftNeu = () => heftStand() > (P.heftGelesen ?? heftStand());
function goldDazu(n) {
  P.gold += n;
  hud();
  const g = $('#goldPill');
  g.classList.remove('blink'); void g.offsetWidth; g.classList.add('blink');
  // ✨ kleine Zahl steigt aus der Goldanzeige auf (+ grün, − beim Kaufen gold)
  if (!n || (P.phase === 'nacht' && n > 0)) return;   // nachts zeigt das Feld schon „+1 🪙“
  const r = g.getBoundingClientRect(), z = document.createElement('div');
  z.className = 'goldzahl ' + (n > 0 ? 'plus' : 'minus');
  z.textContent = `${n > 0 ? '+' : '−'}${Math.abs(n)} 🪙`;
  z.style.left = r.left + r.width / 2 + 'px'; z.style.top = r.bottom + 'px';
  document.body.appendChild(z);
  setTimeout(() => z.remove(), 1100);
}

// 🎨 Farben: normal oder freundlich bei Rot-Grün-Schwäche (Blau statt Grün, Orange statt Rot); gilt für alle Burgen
const FARBEN = {
  normal: { gut: '#5ee05a', mittel: '#ffc93c', schlecht: '#ff4d4d', fertig: '#2f9e62' },
  cvd: { gut: '#4aa8ff', mittel: '#ffe066', schlecht: '#ff8a1e', fertig: '#2a6fc0' },
};
const farbe = (k) => FARBEN[PROFIL.farben === 'cvd' ? 'cvd' : 'normal'][k];
function farbenSetzen() { document.body.classList.toggle('cvd', PROFIL.farben === 'cvd'); }

// 👆 Zeigefinger-Anleitung (wie Plants vs. Zombies): beim ersten Mal zeigt eine Hand auf den nächsten Knopf.
// schritte: [{ ziel: () => Element | {el, fx, fy} (Punkt im Element, 0–1), text, fertig: () => bool }]
// wenn: solange true, läuft die Anleitung; sonst Pause (sie kommt beim nächsten Aufruf wieder, bis sie einmal ganz durch ist)
let FINGER = null, FINGER_LAUF = false;
// Schritte abhaken, die schon erledigt sind; ganz durch = für immer gemerkt
function fingerWeiter(F) {
  while (F.i < F.schritte.length && F.schritte[F.i].fertig()) F.i++;
  if (F.i >= F.schritte.length) { P.finger[F.key] = true; speichern(); return true; }
  return false;
}
function anleitung(key, schritte, wenn = () => true) {
  P.finger = P.finger || {};
  if (P.finger[key] || (FINGER && FINGER.key === key)) return;
  if (FINGER) fingerWeiter(FINGER);   // die alte Anleitung noch abhaken, bevor die neue sie ersetzt
  FINGER = { key, schritte, wenn, i: 0 };
  if (!FINGER_LAUF) { FINGER_LAUF = true; requestAnimationFrame(fingerSchritt); }   // immer nur eine Schleife
}
function fingerSchritt() {
  let el = $('#finger');
  if (!el) { el = document.createElement('div'); el.id = 'finger'; el.innerHTML = '<span class="fhand">👆</span><span class="ftext"></span>'; document.body.appendChild(el); }
  const F = FINGER;
  const stopp = () => { FINGER_LAUF = false; el.classList.add('hidden'); };
  if (!F) { stopp(); return; }
  if (fingerWeiter(F)) { FINGER = null; stopp(); return; }
  if (!F.wenn()) { FINGER = null; stopp(); return; }
  const s = F.schritte[F.i], z = s.ziel(), ziel = z && (z.el || z);
  // Ziel weg, versteckt oder hinter einer Karte: Hand kurz ausblenden
  const sichtbar = ziel && ziel.isConnected && ziel.getClientRects().length && (!karteOffen() || ziel.closest('#overlay'));
  el.classList.toggle('hidden', !sichtbar);
  if (sichtbar) {
    const r = ziel.getBoundingClientRect(), x = r.left + r.width * (z.fx ?? 0.5);
    // Ziel außerhalb des Bildes (z. B. unten im Turmblatt): einmal hinscrollen
    if (F.gescrollt !== F.i && (r.bottom > innerHeight || r.top < 0)) { F.gescrollt = F.i; ziel.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    // unten kein Platz? Dann zeigt die Hand von oben (👇)
    const oben = r.top + r.height * (z.fy ?? 1) + 80 > innerHeight;
    const y = oben ? r.top + r.height * (z.fy ?? 0) : r.top + r.height * (z.fy ?? 1);
    el.style.left = x + 'px'; el.style.top = (oben ? y - 4 : z.fy !== undefined ? y + 6 : y) + 'px';
    const ft = el.querySelector('.ftext');
    if (ft.textContent !== s.text) ft.textContent = s.text;
    el.querySelector('.fhand').textContent = oben ? '👇' : '👆';
    el.classList.toggle('oben', oben);
    // Blase im Bild halten: so weit seitlich schieben, dass sie 8 px Abstand zum Rand hat (die Hand bleibt am Ziel)
    const b = ft.getBoundingClientRect(), alt = parseFloat(ft.dataset.dx || 0), mitte = b.left - alt;
    const dx = Math.max(8 - mitte, Math.min(0, innerWidth - 8 - (mitte + b.width)));
    if (dx !== alt) { ft.dataset.dx = dx; ft.style.transform = `translateX(${dx}px)`; }
  }
  requestAnimationFrame(fingerSchritt);
}

// 🌇 Übergang zwischen Tag, Abend, Nacht und Morgen: Farbverlauf mit Sonne/Mond über dem Bild, je Tag und Art nur einmal
const UEBERGANG = { abend: ['🌇', 'Der Abend kommt'], nacht: ['🌙', 'Die Nacht bricht herein'], morgen: ['🌅', 'Ein neuer Morgen'] };
let uebergangZuletzt = '';
function uebergang(art) {
  const key = art + P.tag + '/' + P.nacht;
  if (uebergangZuletzt === key || !UEBERGANG[art]) return;
  uebergangZuletzt = key;
  let el = $('#uebergang');
  if (!el) { el = document.createElement('div'); el.id = 'uebergang'; document.body.appendChild(el); }
  el.className = '';
  el.innerHTML = `<div class="uinnen"><span class="usym">${UEBERGANG[art][0]}</span><span class="utext">${UEBERGANG[art][1]}</span></div>`;
  void el.offsetWidth;
  el.className = 'u-' + art;
}

// 🪙 Zu teuer? Dann steht im Knopf, wie viel noch fehlt (wie bei Bloons) – das Ziel ist klar
const fehlt = (preis) => preis && P.gold < preis ? `<small class="fehlt">noch ${preis - P.gold} 🪙</small>` : '';

// Der eine Hauptknopf rechts unten
function haupt(label, fn, an = true) {
  const b = $('#hauptBtn');
  b.innerHTML = label;   // darf <span class="lbl"> enthalten (auf schmalen Bildschirmen ausgeblendet)
  b.disabled = !an;
  b.onclick = fn;
}
// Wenige Nebenknöpfe links: [{label, title, fn, cls}]
function neben(liste) {
  const box = $('#neben');
  box.innerHTML = '';
  for (const k of liste) {
    const b = document.createElement('button');
    b.className = 'btn ' + (k.cls || 'leise');
    b.innerHTML = k.label;
    b.title = k.title || '';
    b.onclick = k.fn;
    box.appendChild(b);
  }
}

// Karte über allem (Lernkarte, Ergebnis). knoepfe: [{label, cls, fn}] – der letzte ist der Hauptknopf.
// 👩‍🌾 Bäuerin/Zauberin gewählt: feste Texte („der Bauer“, „dein Held“) passend umstellen – einmal hier statt in jedem Text
const FIGUR_W = [['Dein Bauer', 'Deine Bäuerin'], ['dein Bauer', 'deine Bäuerin'], ['Der Bauer', 'Die Bäuerin'], ['der Bauer', 'die Bäuerin'],
  ['dem Bauern', 'der Bäuerin'], ['den Bauern', 'die Bäuerin'], ['des Bauern', 'der Bäuerin'],
  ['Dein Held', 'Deine Heldin'], ['dein Held', 'deine Heldin'], ['Der Held', 'Die Heldin'], ['der Held', 'die Heldin'], ['deinen Helden', 'deine Heldin'],
  ['deinem Helden', 'deiner Heldin'], ['deines Helden', 'deiner Heldin'], ['dem Helden', 'der Heldin'], ['den Helden', 'die Heldin'], ['des Helden', 'der Heldin'],
  ['🧙 Held', '🧙 Heldin']]
  .map(([m, w]) => [new RegExp(`(^|[^\\wäöüÄÖÜß])${m}(?![\\wäöüß])`, 'g'), `$1${w}`]);
function figurText(s) {
  if (PROFIL.figur !== 'w' || typeof s !== 'string') return s;
  for (const [re, w] of FIGUR_W) s = s.replace(re, w);
  return s;
}

function karte(html, knoepfe = [{ label: 'Verstanden' }]) {
  $('#overlay .sheet').classList.remove('breit');
  $('#sheetBody').innerHTML = figurText(html);
  const row = $('#sheetBtns');
  row.innerHTML = '';
  knoepfe.forEach((k, i) => {
    const b = document.createElement('button');
    b.className = 'btn ' + (k.cls || (i === knoepfe.length - 1 ? 'gold' : 'leise'));
    b.textContent = k.label;
    b.onclick = () => { if (!k.offen) karteZu(); if (k.fn) k.fn(); };
    row.appendChild(b);
  });
  $('#overlay').classList.remove('hidden');
  for (const el of [$('#overlay .sheet'), $('#sheetBody'), $('#overlay')]) if (el) el.scrollTop = 0;   // neue Karte beginnt oben
}
function karteZu() { $('#overlay').classList.add('hidden'); }
const karteOffen = () => !$('#overlay').classList.contains('hidden');
// ⎋ Escape schließt eine offene Karte – aber nur, wenn es genau einen eindeutigen Knopf „Fertig“/„Schließen“/„Abbrechen“ gibt
// (wie ein Klick darauf, dessen fn läuft also mit). Karten mit Pflichtwahl (Startzauber, Beute, Figur, Passwort) haben keinen
// solchen Knopf und bleiben offen.
const ESC_KNOPF = /^(✕ |✖ )?(Fertig|Schließen|Abbrechen)$/;
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape' || !karteOffen()) return;
  const kn = [...document.querySelectorAll('#sheetBtns button')].filter((b) => ESC_KNOPF.test(b.textContent.trim()) && !b.disabled);
  if (kn.length !== 1) return;
  ev.preventDefault();
  ev.stopImmediatePropagation();   // sonst bricht z. B. karte.js gleich danach auch den Baumodus ab
  kn[0].click();
});

// Lernkarte: höchstens 3 Sätze, optional ein kurzes Beispiel
function lernkarte(m, fn) {
  karte(`<h2>${esc(m.titel)}</h2><p>${esc(m.text)}</p>${m.code ? `<pre class="mono">${esc(m.code)}</pre>` : ''}${m.echt ? `<p class="hinweis">🌍 ${esc(m.echt)}</p>` : ''}`,
    [{ label: 'Verstanden', fn }]);
}

let toastT = 0;
function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.innerHTML = figurText(msg);
  t.classList.remove('hidden');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.add('hidden'), ms);
}

function menuUmschalten() {
  const m = $('#menuPop');
  if (!m.classList.contains('hidden')) { m.classList.add('hidden'); return; }
  m.innerHTML = '';
  const punkte = [
    [`📓 Mein Heft${heftNeu() ? ' <span class="neupunkt"></span>' : ''}`, () => { P.heftGelesen = heftStand(); speichern(); hud(); heftZeigen(); }],
    ['❓ Hilfe', hilfe],
    ['📖 Die Geschichte', () => storyKarte()],
    ['👾 Monsterbuch', monsterBuch],
    [`🎨 Farben: ${PROFIL.farben === 'cvd' ? 'Blau/Orange (Rot-Grün-Schwäche)' : 'normal'}`, () => {
      PROFIL.farben = PROFIL.farben === 'cvd' ? null : 'cvd'; profilSpeichern(); farbenSetzen();
      if (P.phase === 'morgen') renderKarte();
      toast(PROFIL.farben === 'cvd' ? '🎨 Blau statt Grün, Orange statt Rot – gut bei Rot-Grün-Schwäche.' : '🎨 Normale Farben.');
    }],
    ['🧑‍🌾 Figur wählen', () => figurWahl(() => { if (P.phase === 'tag' && H && !H.art && !LAUF) zeigeLage(H.start); })],
    ['💾 Spielstand als Datei', spielstandDatei],
    ['🎓 Lehrkraft & Klasse', klasseKarte],
    ['🏰 Burg wechseln', () => { if (P.phase === 'nacht' || LAUF) { toast('Erst die Nacht bzw. den Lauf zu Ende spielen.'); return; } burgWahl(); }],
    ['🔄 Neu beginnen', () => karte(`<h2>${BURGEN[BURGNR].name} neu beginnen?</h2><p>Der Spielstand dieser Burg wird gelöscht. Andere Burgen und dein 📖 Kombo-Buch bleiben.</p>`,
      [{ label: 'Abbrechen' }, { label: 'Ja, löschen', cls: 'warn', fn: () => { P = neuerStand(); P.kombos = [...PROFIL.kombos]; speichern(); location.reload(); } }])],
  ];
  // ♾️ Endlos-Modus: kein Burgwechsel; neu beginnen = frischer Endlos-Stand; zurück ins normale Spiel
  if (ENDLOS) punkte.splice(-2, 2,
    ['♾️ Endlos neu beginnen', () => karte('<h2>♾️ Endlos neu beginnen?</h2><p>Der Endlos-Spielstand wird gelöscht. Die Spielstände der Burgen bleiben unberührt.</p>',
      [{ label: 'Abbrechen' }, { label: 'Ja, löschen', cls: 'warn', fn: () => { try { localStorage.removeItem(ENDLOS_KEY); } catch { /* privat */ } location.reload(); } }])],
    ['🏰 Zum normalen Spiel', () => { if (P.phase === 'nacht') { toast('Erst die Nacht zu Ende spielen.'); return; } location.href = location.pathname; }]);
  for (const [txt, fn] of punkte) {
    const b = document.createElement('button');
    b.innerHTML = txt;
    b.onclick = () => { m.classList.add('hidden'); fn(); };
    m.appendChild(b);
  }
  m.classList.remove('hidden');
}

// 💾 Spielstand als Datei (ohne Konto, ohne Cloud): alle atc_-Einträge des Browsers in eine JSON-Datei –
// z. B. auf den USB-Stick oder ins Netzlaufwerk. Laden ersetzt alle Burgen und das Profil.
const SPIELSTAND_APP = 'automate-the-castle';
function spielstandDaten() {
  speichern();
  const daten = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith('atc_')) daten[k] = localStorage.getItem(k);
    }
  } catch { /* privat */ }
  return { app: SPIELSTAND_APP, version: 1, datum: new Date().toISOString(), daten };
}
function spielstandSichern() {
  const blob = new Blob([JSON.stringify(spielstandDaten())], { type: 'application/json' });
  const a = document.createElement('a'), tag = new Date().toISOString().slice(0, 10);
  a.href = URL.createObjectURL(blob);
  a.download = `burg-spielstand-${tag}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  toast('💾 Datei gespeichert – leg sie z. B. auf deinen USB-Stick.');
}
// Text einer Datei prüfen: liefert die Daten oder einen Fehlertext
function spielstandPruefen(text) {
  let s;
  try { s = JSON.parse(text); } catch { return 'Das ist keine Spielstand-Datei.'; }
  if (!s || s.app !== SPIELSTAND_APP || !s.daten || typeof s.daten !== 'object') return 'Das ist keine Spielstand-Datei von Automate the Castle.';
  const keys = Object.keys(s.daten);
  if (!keys.length || keys.some((k) => !k.startsWith('atc_') || typeof s.daten[k] !== 'string')) return 'Die Datei ist beschädigt.';
  return s;
}
function spielstandEinspielen(s) {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('atc_')) localStorage.removeItem(k);
    for (const [k, v] of Object.entries(s.daten)) localStorage.setItem(k, v);
  } catch { toast('Der Browser lässt das Speichern nicht zu.'); return; }
  location.reload();
}
function spielstandDatei() {
  if (P.phase === 'nacht' || LAUF) { toast('Erst die Nacht bzw. den Lauf zu Ende spielen.'); return; }
  karte(`<h2>💾 Spielstand als Datei</h2>
    <p>Dein Spiel ist im Browser gespeichert. Als Datei kannst du es mitnehmen – auf einen USB-Stick, ins Netzlaufwerk oder an einen anderen Rechner.</p>
    <p class="hinweis">Laden ersetzt alle Burgen auf diesem Rechner durch die aus der Datei.</p>
    <input type="file" id="standDatei" accept=".json,application/json" class="hidden">`,
  [{ label: 'Schließen' }, { label: '📂 Laden', cls: 'leise', offen: true, fn: () => $('#standDatei').click() }, { label: '💾 Sichern', fn: spielstandSichern }]);
  $('#standDatei').onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const s = spielstandPruefen(await f.text());
    if (typeof s === 'string') { toast('⚠️ ' + s); return; }
    const burgen = Object.keys(s.daten).filter((k) => k !== 'atc_profil').length;
    karte(`<h2>📂 Spielstand laden?</h2><p>Datei vom ${new Date(s.datum).toLocaleDateString('de-DE')} mit ${burgen} Spielstand${burgen === 1 ? '' : 'en'}.</p>
      <p class="hinweis">Dein jetziger Spielstand auf diesem Rechner wird dabei ersetzt.</p>`,
    [{ label: 'Abbrechen' }, { label: 'Ja, laden', cls: 'warn', fn: () => spielstandEinspielen(s) }]);
  };
}

// --- 🎓 Lehrkraft & Klasse (Codes in lehrercode.js, Übersicht in lehrer.html) ---
// Wirkungen der Lehrer-Codes im Spielstand: P.codes (schon eingelöst), P.kapFrei, P.fokus {kap, tag}, P.doppel (Datum), P.klassenziel
// ⭐ Ruhm und 🏅 Abzeichen: jetzt, Rekord, alle Abzeichen (verdient = Rekord hat die Schwelle erreicht), nächstes Ziel
// Heft: Abzeichen einer Leiter als Reihe (art = 'stern' | 'kampf')
function abzeichenHtml(art = 'kampf') {
  if (!abzLeiterDa(art)) return '';
  const w = abzWert(art), nx = abzNaechstes(art);
  return `<div class="abzeichen">${abzListe(art).map((a) => `<span class="abz ${w >= a.ab ? 'da' : ''}" title="${a.name} – ab ${a.ab}">
    <i>${w >= a.ab ? a.ico : '🔒'}</i><b>${w >= a.ab ? esc(a.name) : '???'}</b><small>${a.ab} ${art === 'stern' ? '⭐' : '🏆'}</small></span>`).join('')}</div>
    ${nx ? `<p class="hinweis">Nächstes Abzeichen: ${nx.ico} ${esc(nx.name)} – noch ${nx.ab - w}.</p>` : '<p class="hinweis">Alle Abzeichen gesammelt – du bist eine Legende!</p>'}`;
}
const ruhmKarte = () => abzeichenKarte('kampf');
// 🔁 Zweiter Versuch (Durchlauf 2026-11-12: „ein Fehler kostet den ganzen Tag“): einmal pro Tag darf man einen
// misslungenen Auftrag sofort noch einmal versuchen – dann gibt es nur ZWEIT_LOHN des Lohns (⭐ „auf Anhieb“ ist ohnehin weg)
const ZWEIT_LOHN = 0.5;
const zweitAktiv = () => !!(H && P.zweit?.tag === P.tag && P.zweit.id === H.id);
const lohnFaktor = () => (P.doppel === datumHeute() ? 2 : 1) * (zweitAktiv() ? ZWEIT_LOHN : 1) * tagLohnFaktor();   // tagLohnFaktor: wächst mit Ruhm und Nacht (data.js)
function zweitKnopf(ok) {
  if (ok || !H || H.pruefung || ENDLOS || P.zweit?.tag === P.tag) return [];
  return [{ label: '🔁 Nochmal (½ 🪙)', fn: () => { P.zweit = { tag: P.tag, id: H.id }; speichern(); tagStart(H.id); toast('🔁 Zweiter Versuch – gelingt er, gibt es den halben Lohn.'); } }];
}
// 🎯 Heute nur ein Kapitel: andere Höfe sperren – außer das Kapitel ist noch zu (erst aufholen) oder schon fertig
function fokusSperre(h) {
  const f = P.fokus;
  if (!f || f.tag !== datumHeute() || h.pruefung || h.kapitel === f.kap || !burgKapitel().includes(f.kap)) return null;
  if (!kapitelOffen(f.kap) || kapitelFertig(f.kap)) return null;
  return `🎯 Heute ist Kapitel ${kapNr(f.kap)} „${KAPITEL[f.kap].name}“ dran – so hat es deine Lehrkraft eingestellt.`;
}
function codeEinloesen(text, fehlerEl) {
  const sag = (t) => { if (fehlerEl) fehlerEl.textContent = t; else toast(t); };
  const c = lehrerCodeLesen(text);
  if (c.fehler) { sag('⚠️ ' + c.fehler); return; }
  P.codes ||= [];
  if (c.typ !== 'B' && P.codes.includes(c.code)) { sag('Diesen Code hast du schon eingelöst.'); return; }
  const kap = c.zahl ? burgKapitel()[c.zahl - 1] : null;
  let titel, text2, knoepfe = [{ label: 'Super!' }];
  if (c.typ === 'B') {
    if (!BURGEN[c.zahl]) { sag('⚠️ Diese Burg gibt es nicht.'); return; }
    if (!burgSichtbar(c.zahl)) { sag('⚠️ Diese Burg gehört zum Leistungskurs. Starte das Spiel über lk.bat (oder lk.html).'); return; }
    PROFIL.burgFrei = [...new Set([...(PROFIL.burgFrei || []), c.zahl])];
    profilSpeichern();
    titel = `🔓 ${BURGEN[c.zahl].name} ist frei!`;
    text2 = esc(BURGEN[c.zahl].text);
    if (c.zahl !== BURGNR) knoepfe = [{ label: 'Später' }, { label: `${BURGEN[c.zahl].ico} In die ${BURGEN[c.zahl].name}`, fn: () => burgWechseln(c.zahl) }];
  } else if ((c.typ === 'K' || c.typ === 'F') && !kap) { sag(`⚠️ Kapitel ${c.zahl} gibt es in ${BURGEN[BURGNR].name} nicht.`); return; }
  else if (c.typ === 'K') {
    P.kapFrei = [...new Set([...(P.kapFrei || []), kap])];
    titel = `🔓 Kapitel ${c.zahl} ist offen`; text2 = `${KAPITEL[kap].ico} „${esc(KAPITEL[kap].name)}“ kannst du jetzt spielen.`;
  } else if (c.typ === 'F') {
    P.fokus = { kap, tag: datumHeute() };
    titel = `🎯 Heute: Kapitel ${c.zahl}`; text2 = `Heute geht es um ${KAPITEL[kap].ico} „${esc(KAPITEL[kap].name)}“. ${kapitelFertig(kap) ? 'Du hast es schon fertig – du darfst weiterspielen, wo du willst.' : 'Andere Kapitel sind heute gesperrt.'}`;
  } else if (c.typ === 'D') {
    P.doppel = datumHeute();
    titel = '✨ Doppelter Lohn!'; text2 = 'Heute bringt jede Aufgabe doppelt so viel Gold.';
  } else if (c.typ === 'G') {
    if (c.zahl < 1 || c.zahl > 5000) { sag('⚠️ Dieser Code passt nicht.'); return; }
    goldDazu(c.zahl);
    titel = `🎁 +${c.zahl} 🪙`; text2 = 'Ein Geschenk deiner Lehrkraft. Gut gemacht!';
  } else if (c.typ === 'Z') {
    P.klassenziel = c.zahl;
    titel = '🏆 Klassenziel'; text2 = `Eure Klasse sammelt gemeinsam ${c.zahl} ⭐. Jeder Stern von dir zählt mit – du hast schon ${sterneZahl()} ⭐.`;
  } else if (c.typ === 'C') {
    kerkerStand().frei = true;
    titel = '🗝️ Der Kerker ist offen'; text2 = 'Auf der Landkarte wartet der Kerker: Räume voller Fragen und am Ende ein Boss. Jeden Morgen ein Versuch.';
  }
  if (c.typ !== 'B') P.codes.push(c.code);
  speichern();
  karte(`<h2>${titel}</h2><p>${text2}</p>`, knoepfe);
  hud();
  if (P.phase === 'morgen' && $('#scr-karte') && !$('#scr-karte').classList.contains('hidden')) renderKarte();
}
// Fortschrittscode: was die Lehrkraft für die Klassenübersicht braucht (nichts Privates außer dem Namen)
function fortschrittDaten() {
  const h = {};
  for (const x of burgHoefe()) { const s = P.hoefe[x.id]; if (s?.fertig) h[x.id] = (s.kurz ? 1 : 0) + (s.sparsam ? 1 : 0); }
  return { n: (PROFIL.name || '').trim(), b: BURGNR, t: P.tag, na: P.nacht, l: heldLevel().level, p: Object.keys(P.pruefungen || {}).length, s: sterneZahl(), r: ruhm(), rh: P.ruhmRekord || ruhm(), h, d: datumHeute() };   // r/rh = ⭐ Ruhm jetzt / höchster (später Leaderboard)
}
function klasseKarte() {
  if (ENDLOS) { toast('Im Endlos-Modus gibt es keine Klassen-Codes.'); return; }
  const aktiv = [
    P.fokus?.tag === datumHeute() && burgKapitel().includes(P.fokus.kap) ? `🎯 Heute: Kapitel ${kapNr(P.fokus.kap)} „${esc(KAPITEL[P.fokus.kap].name)}“` : '',
    lohnFaktor() > 1 ? '✨ Heute doppelter Lohn' : '',
    P.klassenziel ? `🏆 Klassenziel: ${P.klassenziel} ⭐ gemeinsam – du hast ${sterneZahl()} ⭐` : '',
    (P.kapFrei || []).length ? `🔓 Freigeschaltet: Kapitel ${P.kapFrei.filter((k) => burgKapitel().includes(k)).map(kapNr).join(', ')}` : '',
  ].filter(Boolean);
  karte(`<h2>🎓 Lehrkraft & Klasse</h2>
    <h3>🎟️ Code von der Lehrkraft</h3>
    <p><input id="lkCode" class="codefeld" autocomplete="off" spellcheck="false" placeholder="z. B. D-1112-K7QD"></p>
    <p><button class="btn gruen" id="lkEinloesen">Einlösen</button> <span class="hinweis" id="lkFehler"></span></p>
    ${aktiv.length ? `<div class="lkaktiv">${aktiv.map((a) => `<div>${a}</div>`).join('')}</div>` : ''}
    <h3>📤 Fortschritt abgeben</h3>
    <p class="hinweis">Deine Lehrkraft sieht damit, wie weit du bist. Kopiere den Code und gib ihn ab (z. B. in OPAL).</p>
    <p><input id="lkName" class="codefeld" maxlength="30" placeholder="Dein Name" value="${esc(PROFIL.name || '')}"></p>
    <p><button class="btn leise" id="lkMachen">Code erzeugen</button></p>
    <textarea id="lkFort" class="codefeld hidden" readonly rows="3"></textarea>
    <p class="hidden" id="lkKopierZeile"><button class="btn gold" id="lkKopieren">📋 Kopieren</button> <span class="hinweis" id="lkKopiert"></span></p>`,
  [{ label: 'Schließen' }]);
  $('#lkEinloesen').onclick = () => codeEinloesen($('#lkCode').value, $('#lkFehler'));
  $('#lkCode').onkeydown = (e) => { if (e.key === 'Enter') codeEinloesen(e.target.value, $('#lkFehler')); };
  $('#lkMachen').onclick = () => {
    const name = $('#lkName').value.trim();
    if (!name) { $('#lkName').focus(); toast('Schreib erst deinen Namen hinein.'); return; }
    PROFIL.name = name; profilSpeichern();
    const f = $('#lkFort');
    f.value = fortschrittMachen(fortschrittDaten());
    f.classList.remove('hidden'); $('#lkKopierZeile').classList.remove('hidden');
    f.select();
  };
  $('#lkKopieren').onclick = async () => {
    const f = $('#lkFort');
    try { await navigator.clipboard.writeText(f.value); } catch { f.select(); document.execCommand('copy'); }
    $('#lkKopiert').textContent = '✓ kopiert';
  };
}

// ⚔️ Schwierigkeit der Nacht wählen (antippen + Knopf; nicht mitten in der Nacht)
function schwierigWahl() {
  if (P.phase === 'nacht') { toast('Die Schwierigkeit kannst du nach der Nacht ändern.'); return; }
  let sel = P.schwierigkeit || 'normal';
  const zeig = () => {
    karte(`<h2>⚔️ Schwierigkeit der Nacht</h2><p class="hinweis">Gilt für die Nächte dieser Burg. Das Programmieren am Tag bleibt gleich.</p>
      <div class="spezwahl">${Object.entries(SCHWIERIG).map(([id, s]) => `<button data-schwer="${id}" class="${sel === id ? 'sel' : ''}"><span class="sico">${s.ico}</span><b>${s.name}</b><span class="hinweis">${s.text}</span></button>`).join('')}</div>`,
    [{ label: 'Abbrechen' }, { label: `${SCHWIERIG[sel].ico} ${SCHWIERIG[sel].name} wählen`, fn: () => { P.schwierigkeit = sel; speichern(); toast(`⚔️ Schwierigkeit: ${SCHWIERIG[sel].name}`); } }]);
    for (const b of document.querySelectorAll('[data-schwer]')) b.onclick = () => { sel = b.dataset.schwer; zeig(); };
  };
  zeig();
}

function hilfe(willkommen = false) {
  karte(`<h2>${willkommen ? '🏰 Willkommen auf der Burg!' : "So geht's"}</h2>
    ${willkommen ? `<p>Nachts greifen Monster deine Burg an. Tagsüber verdienst du das Gold für ihre Verteidigung – ${LK ? 'indem du in den Werkstätten, Archiven und Türmen des Königreichs Aufträge mit eigenen Programmen löst' : `indem du ${figur().dem} das Arbeiten beibringst`}.</p>` : ''}
    <p>☀️ <b>Tag:</b> ${BURGNR === 9
      ? 'Wähle im 📜 Archiv einen Auftrag (Abfragen in SQL) oder im 🔭 Späherturm ein Experiment (so lernt eine KI). Pro Tag hast du einen Versuch – ein gelöster Auftrag bringt 🪙 Gold, ⭐ Sterne bringen mehr.'
      : BURGNR > 9 ? `${BURGEN[BURGNR].ico} ${esc(BURGEN[BURGNR].name)}: Wähle auf der Karte einen Ort und dort einen Auftrag – Python, Fragen, SQL oder Automaten, je nach Thema. Pro Tag hast du einen Versuch je Auftrag – gelöst bringt er 🪙 Gold, ⭐ Sterne bringen mehr.`
      : `Wähle im Dorf einen Hof. Gib ${PROFIL.figur === 'w' ? 'der Bäuerin' : 'dem Bauern'} Befehle (${BURGNR === 8 ? 'in Python' : 'erst mit Blöcken, später in Python'}) und drück ▶ Ausführen. Pro Tag hast du einen Versuch – ein gelöster Hof bringt 🪙 Gold, ⭐ kurzer und ⭐ sparsamer Code bringen mehr.`}</p>
    <p>🌇 <b>Abend:</b> Stelle mit dem Gold Türme neben den Weg, wo du willst, und baue sie aus.</p>
    <p>🌙 <b>Nacht:</b> Zwei Wellen Monster, am Ende kommt ein 👑 Anführer. Deine Türme und dein Held 🧙 verteidigen die Burg.${willkommen ? '' : ' Zwischen den Wellen ist Zeit zum Bauen. Besiegte Monster bringen ein paar 🪙 – volles Kopfgeld, wenn alle Aufgaben der Burg gelöst sind.'}</p>
    ${willkommen ? '<p class="hinweis">Alles Weitere (Talente, Zauber …) erklärt dir das Spiel, sobald es soweit ist.</p>' : `
    <p>✨ <b>Talente:</b> Für jede Nacht bekommt dein Held XP. Mit jedem Level lernt er etwas Neues im Talentnetz – alles Gelernte wirkt immer.</p>
    <p>🪄 <b>Zauber:</b> Nur Zauber in einem Zauberplatz wirken. Neue Zauber lassen die 👑 Anführer fallen, mehr Plätze gibt es mit dem Level. Wechseln kostet nichts (✨ Talente → 🪄 Zauber).</p>
    <p class="hinweis">Alles, was du schon erklärt bekommen hast, steht auch in deinem 📓 Heft (☰ → Mein Heft, Teil 3).</p>
    <details><summary>Befehle des Bauern</summary><pre class="mono">forward()      einen Schritt vor
harvest()      ernten
turn_right()   rechts drehen
turn_left()    links drehen
water()        gießen
pull()         Unkraut rupfen
pick_up()      Ziegel aufheben
place()        Ziegel ins Loch legen
can_harvest()  steht er auf einer reifen Rübe?
can_move()     ist vor ihm frei?
is_weed()      steht er auf Unkraut?
is_hole()      steht er auf einem Loch?</pre></details>`}`);
}
