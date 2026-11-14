'use strict';
// 🏰 Startbildschirm: erscheint beim Öffnen der Seite über dem Spiel (#startScreen in index.html).
// Weiterspielen (mit Angabe, wessen Spielstand das ist – geteilte Schulrechner), Neues Spiel (mit Rückfrage),
// Spielstand-Datei laden, Lehrer-Code, Heft, Geschichte, Lehrkräfte-Seite. Karten des Spiels (#overlay) liegen darüber.
// Hintergrund: die Burg bei Nacht, in der Ferne ein Portal im Nebel (Canvas, ruhig animiert, alles offline).
// Muss VOR main.js stehen: merkt sich den Spielstand, bevor das Spiel ihn beim Start schon speichert.
// Wird ausgelassen bei ?endlos und nach einem Neuladen, wenn man ihn in diesem Tab schon verlassen hat.

const START_OK_KEY = 'atc_start_ok';   // sessionStorage: Startbildschirm in diesem Tab schon verlassen
// Schlüssel dieses Modus (normal oder Leistungskurs), ohne Endlos-Stand
const startMeins = (k) => k.startsWith('atc_') && (LK ? k.startsWith('atc_lk_') : !k.startsWith('atc_lk_') && !k.startsWith('atc_endlos'));
// Spielstände so, wie sie VOR dem Start im Browser lagen
const START_VORHER = {};
try {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (startMeins(k)) START_VORHER[k] = localStorage.getItem(k);
  }
} catch { /* privat */ }

const START = { offen: false, danach: [], raf: 0, pyT: 0 };
const startOffen = () => START.offen;
function startDanach(fn) { if (START.offen) START.danach.push(fn); else fn(); }

(function startEntscheiden() {
  const el = document.getElementById('startScreen');
  if (!el) return;
  let schonDa = false;
  try { schonDa = sessionStorage.getItem(START_OK_KEY) === '1'; } catch { /* privat */ }
  const nav = performance.getEntriesByType?.('navigation')?.[0]?.type;
  if (new URLSearchParams(location.search).has('endlos') || (schonDa && nav === 'reload')) { el.remove(); return; }
  START.offen = true;
  document.body.classList.add('startoffen');
  startBildStarten();
  document.addEventListener('DOMContentLoaded', startAufbauen);
})();

// --- Karten: Solange der Startbildschirm offen ist, liegen Karten des Spiels (z. B. Erklärkarten beim Start) dahinter
// (CSS body.startoffen #overlay). Eine Karte, die der Startbildschirm selbst öffnet, kommt nach vorn; die Spielkarte
// wird dafür samt ihren Knöpfen beiseitegelegt und danach unverändert zurückgestellt.
async function startEigene(fn) {
  const ov = $('#overlay'), body = $('#sheetBody'), btns = $('#sheetBtns'), sheet = $('#overlay .sheet');
  const alt = { body: [...body.childNodes], btns: [...btns.childNodes], zu: ov.classList.contains('hidden'), breit: sheet.classList.contains('breit') };
  const zurueck = () => {
    body.replaceChildren(...alt.body); btns.replaceChildren(...alt.btns);
    sheet.classList.toggle('breit', alt.breit);
    ov.classList.toggle('hidden', alt.zu);
    document.body.classList.remove('starteigen');
  };
  document.body.classList.add('starteigen');
  body.replaceChildren(); btns.replaceChildren();
  const r = fn();
  if (r?.then) await r;
  if (ov.classList.contains('hidden') || !body.childNodes.length) { zurueck(); return; }   // keine Karte aufgegangen (z. B. falscher Code)
  const beob = new MutationObserver(() => {
    if (!ov.classList.contains('hidden')) return;   // Folgekarte schon offen
    beob.disconnect();
    if (START.offen) zurueck(); else document.body.classList.remove('starteigen');
  });
  beob.observe(ov, { attributes: true, attributeFilter: ['class'] });
}

// --- Knöpfe -------------------------------------------------------------------------------------------
// Ein Stand zählt erst, wenn wirklich gespielt wurde (nur einmal geöffnet = Tag 1 ohne Begrüßung und ohne Höfe)
function startHatStand() {
  return Object.entries(START_VORHER).some(([k, v]) => {
    if (k === PROFIL_KEY) return false;
    try { const s = JSON.parse(v); return !!s && (s.tag > 1 || s.nacht > 1 || !!s.gesehen?.willkommen || Object.keys(s.hoefe || {}).length > 0); } catch { return true; }
  });
}

function startZuletzt() {
  let z = null;
  try { z = JSON.parse(START_VORHER[spielSchluessel()] || 'null')?.zuletzt; } catch { /* alt */ }
  if (!z) return '';
  const d = new Date(z), heute = new Date(), gestern = new Date(Date.now() - 864e5);
  const uhr = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const tag = d.toDateString() === heute.toDateString() ? 'heute' : d.toDateString() === gestern.toDateString() ? 'gestern'
    : `am ${d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric', year: d.getFullYear() === heute.getFullYear() ? undefined : 'numeric' })}`;
  return `${tag}, ${uhr} Uhr`;
}

function startStandHtml() {
  if (!startHatStand()) return `<div class="ststand leer"><b>Noch kein Spielstand auf diesem Rechner.</b><span>Starte ein neues Spiel – oder lade deine Spielstand-Datei.</span></div>`;
  const b = BURGEN[BURGNR] || {};
  const geloest = Object.values(P.hoefe || {}).filter((s) => s?.fertig).length;
  const name = (PROFIL.name || '').trim();
  const zuletzt = startZuletzt();
  const neu = P.tag === 1 && P.phase === 'morgen' && !geloest;
  return `<div class="ststand">
    <div class="stkopf">💾 Spielstand auf diesem Rechner</div>
    ${name ? `<div class="stname">${PROFIL.figur === 'w' ? '👩‍🌾' : '🧑‍🌾'} ${esc(name)}</div>` : ''}
    <div class="stzeile"><span>${b.ico || '🏰'} ${esc(b.name || 'Burg')}</span>${neu ? '<span>noch nicht begonnen</span>' : `<span>☀️ Tag ${P.tag}</span><span>🌙 Nacht ${P.nacht}</span>`}</div>
    ${neu ? '' : `<div class="stzeile"><span>🧙 Level ${heldLevel().level}</span><span>🪙 ${P.gold}</span><span>✅ ${geloest} gelöst</span></div>`}
    ${zuletzt ? `<div class="stzeit">zuletzt gespielt: ${zuletzt}</div>` : ''}
  </div>`;
}

function startAufbauen() {
  const el = document.getElementById('startScreen');
  if (!el || !START.offen) return;
  const hat = startHatStand();
  el.querySelector('#stStand').innerHTML = startStandHtml();
  const weiter = el.querySelector('#stWeiter');
  weiter.innerHTML = hat ? '▶ Weiterspielen' : '▶ Spiel starten';
  weiter.onclick = startSchliessen;
  const neu = el.querySelector('#stNeu');
  neu.classList.toggle('hidden', !hat);
  neu.onclick = () => startEigene(startNeuesSpiel);
  el.querySelector('#stSichern').classList.toggle('hidden', !hat);
  el.querySelector('#stSichern').onclick = () => spielstandSichern();
  const datei = el.querySelector('#stDatei');
  el.querySelector('#stLaden').onclick = () => { datei.value = ''; datei.click(); };
  datei.onchange = startDateiGewaehlt;
  el.querySelector('#stCode').onclick = () => {
    const box = el.querySelector('#stCodeBox');
    box.classList.toggle('hidden');
    if (!box.classList.contains('hidden')) el.querySelector('#stCodeFeld').focus();
    START.neuMalen?.();
  };
  const einloesen = () => {
    const feld = el.querySelector('#stCodeFeld'), fehler = el.querySelector('#stCodeFehler');
    if (!feld.value.trim()) { feld.focus(); return; }
    fehler.textContent = '';
    startEigene(() => codeEinloesen(feld.value, fehler));
    if (!fehler.textContent) { feld.value = ''; el.querySelector('#stStand').innerHTML = startStandHtml(); }
  };
  el.querySelector('#stCodeOk').onclick = einloesen;
  el.querySelector('#stCodeFeld').onkeydown = (e) => { if (e.key === 'Enter') einloesen(); };
  el.querySelector('#stHeft').onclick = () => startEigene(heftZeigen);
  el.querySelector('#stStory').onclick = () => startEigene(() => storyKarte());
  el.querySelector('#stLehrer').onclick = () => { location.href = 'lehrer.html'; };
  // ⏳ Python lädt schon im Hintergrund – kurz anzeigen, wie weit
  const py = el.querySelector('#stPython');
  const pyZeigen = () => {
    if (PY.bereit) { py.textContent = '✓ Spiel bereit'; py.classList.add('ok'); clearInterval(START.pyT); }
    else if (PY.fehler) { py.textContent = '⚠️ Python lädt nicht – bitte die Seite neu laden.'; clearInterval(START.pyT); }
    else py.textContent = location.protocol === 'file:' ? '⚠️ Bitte über start.bat bzw. die Internetseite öffnen.' : '⏳ Python lädt … (beim ersten Mal etwas länger)';
  };
  pyZeigen();
  START.pyT = setInterval(pyZeigen, 400);
  el.classList.add('bereit');
  START.neuMalen?.();   // Menü hat jetzt seine echte Größe
  if (!karteOffen()) weiter.focus({ preventScroll: true });
}

function startSchliessen() {
  const el = document.getElementById('startScreen');
  if (!START.offen) return;
  START.offen = false;
  try { sessionStorage.setItem(START_OK_KEY, '1'); } catch { /* privat */ }
  clearInterval(START.pyT);
  document.body.classList.remove('startoffen');
  el.classList.add('weg');
  setTimeout(() => { cancelAnimationFrame(START.raf); el.remove(); }, 450);
  const fns = START.danach.splice(0);
  for (const fn of fns) fn();
}

// ✨ Neues Spiel: alles dieses Modus löschen (alle Burgen, Profil mit Name/Figur/freigeschalteten Burgen) – nur mit Rückfrage
function startNeuesSpiel() {
  const name = (PROFIL.name || '').trim();
  const b = BURGEN[BURGNR] || {};
  karte(`<h2>✨ Neues Spiel beginnen?</h2>
    <p>Dann wird der Spielstand auf diesem Rechner <b>gelöscht</b>${name ? ` – der von <b>${esc(name)}</b>` : ''} (${esc(b.name || 'Burg')}, Tag ${P.tag}).
    Alle Burgen, die Figur und freigeschaltete Burgen sind danach weg.</p>
    <p class="hinweis">💡 Ist es dein Spielstand? Sichere ihn vorher als Datei – dann kannst du ihn später wieder laden.</p>`,
  [{ label: 'Abbrechen' }, { label: '💾 Erst sichern', cls: 'leise', offen: true, fn: () => spielstandSichern() },
    { label: '🗑️ Ja, neu anfangen', cls: 'warn', fn: () => {
      try {
        for (const k of Object.keys(localStorage)) if (startMeins(k)) localStorage.removeItem(k);
        sessionStorage.setItem(START_OK_KEY, '1');   // nach dem Neuladen gleich ins Spiel (Geschichte, Figur wählen)
      } catch { toast('Der Browser lässt das Löschen nicht zu.'); return; }
      location.reload();
    } }]);
}

// 📂 Spielstand-Datei laden (gleiche Prüfung wie ☰ → Spielstand als Datei)
async function startDateiGewaehlt(e) {
  const f = e.target.files[0];
  if (!f) return;
  const s = spielstandPruefen(await f.text());
  if (typeof s === 'string') { toast('⚠️ ' + s); return; }
  const burgen = Object.keys(s.daten).filter((k) => !/profil$/.test(k)).length;
  let name = '';
  try { name = JSON.parse(s.daten[PROFIL_KEY] || s.daten.atc_profil || 'null')?.name || ''; } catch { /* ohne Profil */ }
  startEigene(() => karte(`<h2>📂 Spielstand laden?</h2>
    <p>Datei vom ${new Date(s.datum).toLocaleDateString('de-DE')}${name ? ` von <b>${esc(name)}</b>` : ''} mit ${burgen} Spielstand${burgen === 1 ? '' : 'en'}.</p>
    ${startHatStand() ? '<p class="hinweis">Der Spielstand, der jetzt auf diesem Rechner liegt, wird dabei ersetzt.</p>' : ''}`,
  [{ label: 'Abbrechen' }, { label: '📂 Ja, laden', cls: startHatStand() ? 'warn' : 'gold', fn: () => {
    try { sessionStorage.removeItem(START_OK_KEY); } catch { /* privat */ }   // danach zeigt der Startbildschirm den geladenen Stand
    spielstandEinspielen(s);
  } }]));
}

// --- Hintergrund: Burg bei Nacht, Portal in der Ferne ------------------------------------------------------
function startBildStarten() {
  const cv = document.getElementById('startBild');
  if (!cv) return;
  const g = cv.getContext('2d');
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, L = null;

  // fester Zufall, damit das Bild bei jeder Größe gleich aussieht
  const zufall = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const ebene = () => { const c = document.createElement('canvas'); c.width = W * dpr; c.height = H * dpr; const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return [c, x]; };

  function aufbauen() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const hoch = W < H * 0.9 || W < 700;   // wie die Media-Query in style.css
    const pr = document.querySelector('.startpanel')?.getBoundingClientRect();   // das Menü: Portal und Horizont weichen ihm aus
    const hy = hoch ? Math.min(H * 0.74, Math.max(H * 0.6, (pr ? pr.bottom : H * 0.5) + H * 0.15)) : H * 0.64;   // Horizont
    // Burg (rechts bzw. unten), Einheit u = cw/100, Grundlinie by
    const panelR = hoch ? 0 : pr?.width ? pr.right + 10 : Math.min(W * 0.05 + 420, W * 0.5);
    const cw = hoch ? Math.min(W * 0.78, H * 0.36) : Math.max(W * 0.3, Math.min(W * 0.42, H * 0.62, W * 0.955 - panelR - 130));   // quer: Platz fürs Portal lassen
    const cl = hoch ? W - cw - W * 0.04 : W - cw - W * 0.045;
    const by = H * (hoch ? 0.97 : 0.92);
    // Portal in der Ferne: zwischen Menü und Burg (quer), links (hochkant)
    const px = hoch ? W * 0.17 : Math.max(panelR + 50, Math.min(cl - 60, (panelR + cl) / 2));
    const R = Math.max(16, Math.min(W, H) * 0.045);
    const fern = (x) => hy - H * 0.035 * (0.6 + 0.4 * Math.sin(x / W * 5.1 + 1.3)) - H * 0.015 * Math.sin(x / W * 13.7);
    const nah = (x) => hy + H * 0.07 - H * 0.03 * Math.sin(x / W * 3.3 + 0.4) - H * 0.012 * Math.sin(x / W * 9.1);
    const pb = fern(px) + R * 0.1;   // Fuß des Portals auf dem fernen Hügel
    const moon = hoch ? { x: W * (W < 560 ? 0.88 : 0.8), y: H * (W < 560 ? 0.045 : 0.09), r: Math.min(W, H) * (W < 560 ? 0.035 : 0.045) } : { x: W * 0.6, y: H * 0.15, r: Math.min(W, H) * 0.05 };
    L = { hoch, hy, cw, cl, by, px, pb, R, moon, fern, nah };
    L.U = (u) => cl + u * cw / 100;
    L.V = (v) => by - v * cw / 100;
    L.k = cw / 100;
    // Sterne
    const n = Math.min(500, Math.round(W * H / 2600));
    L.sterne = [];
    for (let i = 0; i < n; i++) {
      const y = Math.pow(zufall(i * 2 + 1), 1.4) * hy * 0.95;
      L.sterne.push({ x: zufall(i * 2) * W, y, r: 0.4 + zufall(i * 3 + 7) * (zufall(i + 99) > 0.93 ? 1.4 : 0.8), ph: zufall(i * 5) * 6.3, sp: 0.6 + zufall(i * 7) * 2 });
    }

    // Ebene 1: Himmel und Mond
    const [himmel, h] = ebene();
    const gr = h.createLinearGradient(0, 0, 0, hy);
    gr.addColorStop(0, '#040817'); gr.addColorStop(0.55, '#0c1533'); gr.addColorStop(1, '#251d4d');
    h.fillStyle = gr; h.fillRect(0, 0, W, H);
    // violetter Schein über dem Portal am Horizont
    const sch = h.createRadialGradient(px, pb, 0, px, pb, W * 0.45);
    sch.addColorStop(0, 'rgba(150, 80, 230, .35)'); sch.addColorStop(1, 'rgba(150, 80, 230, 0)');
    h.fillStyle = sch; h.fillRect(0, 0, W, H);
    // Mond mit Hof
    const mh = h.createRadialGradient(moon.x, moon.y, moon.r * 0.8, moon.x, moon.y, moon.r * 5);
    mh.addColorStop(0, 'rgba(200, 215, 255, .22)'); mh.addColorStop(1, 'rgba(200, 215, 255, 0)');
    h.fillStyle = mh; h.fillRect(0, 0, W, H);
    h.fillStyle = '#eef1ff'; h.beginPath(); h.arc(moon.x, moon.y, moon.r, 0, 7); h.fill();
    h.fillStyle = 'rgba(160, 170, 210, .35)';
    for (const [dx, dy, r] of [[-0.3, -0.2, 0.22], [0.25, 0.15, 0.16], [-0.05, 0.4, 0.12], [0.35, -0.35, 0.09]]) { h.beginPath(); h.arc(moon.x + dx * moon.r, moon.y + dy * moon.r, r * moon.r, 0, 7); h.fill(); }
    L.himmel = himmel;

    // Ebene 2: ferne Hügel
    const [fernC, f] = ebene();
    f.fillStyle = '#1a1f48';
    f.beginPath(); f.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) f.lineTo(x, fern(x));
    f.lineTo(W, H); f.closePath(); f.fill();
    // Kante vom Mond angestrahlt
    f.strokeStyle = 'rgba(140, 150, 220, .18)'; f.lineWidth = 1.2;
    f.beginPath(); for (let x = 0; x <= W + 8; x += 8) f[x ? 'lineTo' : 'moveTo'](x, fern(x)); f.stroke();
    L.fernC = fernC;

    // Ebene 3: nahe Hügel, Weg, Bäume, Burg
    const [vorn, v] = ebene();
    const ng = v.createLinearGradient(0, hy, 0, H);
    ng.addColorStop(0, '#111838'); ng.addColorStop(1, '#060a18');
    v.fillStyle = ng;
    v.beginPath(); v.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) v.lineTo(x, nah(x));
    v.lineTo(W, H); v.closePath(); v.fill();
    // Weg vom Portal zum Tor
    const gx = L.U(50), gy = by;
    const c1 = { x: px + (gx - px) * 0.15, y: nah(px) + (gy - nah(px)) * 0.55 }, c2 = { x: gx - (gx - px) * 0.35, y: gy - (gy - hy) * 0.15 };
    const pt = (t) => {
      const a = 1 - t;
      return { x: a * a * a * px + 3 * a * a * t * c1.x + 3 * a * t * t * c2.x + t * t * t * gx, y: a * a * a * pb + 3 * a * a * t * c1.y + 3 * a * t * t * c2.y + t * t * t * gy };
    };
    const links = [], rechts = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, p = pt(t), q = pt(Math.min(1, t + 0.01)), w = 1 + Math.pow(t, 1.6) * cw * 0.09;
      let nx = -(q.y - p.y), ny = q.x - p.x; const ln = Math.hypot(nx, ny) || 1; nx /= ln; ny /= ln;
      links.push([p.x + nx * w, p.y + ny * w]); rechts.push([p.x - nx * w, p.y - ny * w]);
    }
    const wg = v.createLinearGradient(0, pb, 0, gy);
    wg.addColorStop(0, 'rgba(150, 120, 210, .25)'); wg.addColorStop(1, 'rgba(120, 125, 170, .32)');
    v.fillStyle = wg;
    v.beginPath(); links.forEach(([x, y], i) => v[i ? 'lineTo' : 'moveTo'](x, y)); rechts.reverse().forEach(([x, y]) => v.lineTo(x, y)); v.closePath(); v.fill();
    // Tannen auf den nahen Hügeln (nicht vor Burg und Portal)
    for (let i = 0; i < 26; i++) {
      const x = zufall(i * 11 + 3) * W;
      if (x > cl - cw * 0.05 && x < cl + cw * 1.05) continue;
      if (Math.abs(x - px) < R * 2.2) continue;
      const s = (0.6 + zufall(i * 13) * 0.7) * Math.min(W, H) * 0.035, y = nah(x) + s * 0.25 + zufall(i * 17) * H * 0.04;
      v.fillStyle = '#080d22';
      v.beginPath(); v.moveTo(x, y - s * 2.2); v.lineTo(x + s * 0.7, y); v.lineTo(x - s * 0.7, y); v.closePath(); v.fill();
      v.beginPath(); v.moveTo(x, y - s * 2.8); v.lineTo(x + s * 0.5, y - s * 1.1); v.lineTo(x - s * 0.5, y - s * 1.1); v.closePath(); v.fill();
    }
    burgMalen(v);
    L.vorn = vorn;
  }

  // Burg als Silhouette mit Steinen; links vom Mond angestrahlt
  function burgMalen(v) {
    const { U, V, k } = L;
    const koerper = (x0, x1, y0, y1) => {
      const gr = v.createLinearGradient(U(x0), 0, U(x1), 0);
      gr.addColorStop(0, '#2a3466'); gr.addColorStop(0.35, '#1a2149'); gr.addColorStop(1, '#0c1029');
      v.fillStyle = gr; v.fillRect(U(x0), V(y1), (x1 - x0) * k, (y1 - y0) * k);
      // Steinreihen
      v.strokeStyle = 'rgba(0, 0, 0, .28)'; v.lineWidth = Math.max(0.6, k * 0.25);
      v.beginPath();
      for (let y = y0 + 4; y < y1; y += 4) { v.moveTo(U(x0), V(y)); v.lineTo(U(x1), V(y)); }
      for (let y = y0, r = 0; y < y1; y += 4, r++) for (let x = x0 + (r % 2 ? 3 : 0.5); x < x1; x += 5) { v.moveTo(U(x), V(y)); v.lineTo(U(x), V(Math.min(y1, y + 4))); }
      v.stroke();
    };
    const zinnen = (x0, x1, y) => {
      v.fillStyle = '#1d2450';
      const n = Math.max(2, Math.round((x1 - x0) / 5)), b = (x1 - x0) / n;
      for (let i = 0; i < n; i++) {
        const gr = v.createLinearGradient(U(x0 + i * b), 0, U(x0 + i * b + b * 0.6), 0);
        gr.addColorStop(0, '#2a3466'); gr.addColorStop(1, '#141a3d');
        v.fillStyle = gr; v.fillRect(U(x0 + i * b + b * 0.2), V(y + 4), b * 0.6 * k, 4 * k);
      }
    };
    const dach = (x0, x1, y, hoch) => {
      const gr = v.createLinearGradient(U(x0), 0, U(x1), 0);
      gr.addColorStop(0, '#6a2a4c'); gr.addColorStop(0.5, '#3d1834'); gr.addColorStop(1, '#22102a');
      v.fillStyle = gr;
      v.beginPath(); v.moveTo(U(x0 - 1.5), V(y)); v.lineTo(U((x0 + x1) / 2), V(y + hoch)); v.lineTo(U(x1 + 1.5), V(y)); v.closePath(); v.fill();
      v.fillStyle = '#d9b44a'; v.beginPath(); v.arc(U((x0 + x1) / 2), V(y + hoch), k * 0.9, 0, 7); v.fill();
    };
    // Bergfried hinten
    koerper(30, 70, 0, 66); zinnen(30, 70, 66);
    koerper(43, 57, 66, 84); dach(43, 57, 84, 18);
    // Fahnenstange
    v.strokeStyle = '#9aa0b8'; v.lineWidth = Math.max(1, k * 0.5);
    v.beginPath(); v.moveTo(U(50), V(102)); v.lineTo(U(50), V(114)); v.stroke();
    // Ecktürme
    koerper(0, 17, 0, 52); dach(0, 17, 52, 22);
    koerper(83, 100, 0, 52); dach(83, 100, 52, 22);
    // Mauer vorn mit Zinnen
    koerper(17, 83, 0, 30); zinnen(17, 83, 30);
    // Tor (dunkel; das Licht malt die Animation)
    v.fillStyle = '#05060f';
    v.beginPath(); v.moveTo(U(43), V(0)); v.lineTo(U(43), V(13)); v.arc(U(50), V(13), 7 * k, Math.PI, 0); v.lineTo(U(57), V(0)); v.closePath(); v.fill();
    // Fensteröffnungen
    v.fillStyle = '#05060f';
    for (const [x, y] of L.fenster = [[36, 42], [50, 46], [64, 42], [43, 57], [57, 57], [50, 72], [8.5, 38], [91.5, 38], [8.5, 22], [91.5, 22]]) fensterForm(v, x, y);
  }
  function fensterForm(c, x, y, s = 1) {
    const { U, V, k } = L;
    c.beginPath(); c.moveTo(U(x - 1.6 * s), V(y)); c.lineTo(U(x - 1.6 * s), V(y + 3.4 * s)); c.arc(U(x), V(y + 3.4 * s), 1.6 * s * k, Math.PI, 0); c.lineTo(U(x + 1.6 * s), V(y)); c.closePath(); c.fill();
  }

  function malen(ms) {
    const t = ms / 1000;
    if (!L) aufbauen();
    const { px, pb, R, U, V, k } = L;
    g.drawImage(L.himmel, 0, 0, W, H);
    // Sterne funkeln
    for (const s of L.sterne) {
      g.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
      g.fillStyle = '#dfe7ff';
      g.fillRect(s.x - s.r / 2, s.y - s.r / 2, s.r, s.r);
    }
    g.globalAlpha = 1;
    g.drawImage(L.fernC, 0, 0, W, H);

    // 🌀 Portal: Steinbogen, wirbelnde Mitte, aufsteigende Funken
    const puls = 0.85 + 0.15 * Math.sin(t * 1.6);
    const glow = g.createRadialGradient(px, pb - R * 1.4, 0, px, pb - R * 1.4, R * 5);
    glow.addColorStop(0, `rgba(190, 110, 255, ${0.45 * puls})`); glow.addColorStop(1, 'rgba(190, 110, 255, 0)');
    g.fillStyle = glow; g.fillRect(px - R * 5, pb - R * 6.4, R * 10, R * 10);
    g.save();
    g.translate(px, pb - R * 1.45); g.scale(R * 0.58, R * 1.3);
    const kern = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    kern.addColorStop(0, '#fbefff'); kern.addColorStop(0.3, '#c58dff'); kern.addColorStop(0.75, '#6a2bd1'); kern.addColorStop(1, '#2b0d5e');
    g.fillStyle = kern; g.beginPath(); g.arc(0, 0, 1, 0, 7); g.fill();
    g.clip();
    for (let i = 0; i < 6; i++) {
      g.save(); g.rotate(t * (0.9 + i * 0.12) * (i % 2 ? -1 : 1) + i);
      g.strokeStyle = `rgba(255, 235, 255, ${0.16 + 0.05 * i})`; g.lineWidth = 0.07;
      g.beginPath(); g.arc(0, 0, 0.25 + i * 0.13, 0, 2.2); g.stroke();
      g.restore();
    }
    g.restore();
    // Steinbogen um das Portal
    g.fillStyle = '#20223c';
    g.fillRect(px - R * 0.92, pb - R * 2.05, R * 0.34, R * 2.1);
    g.fillRect(px + R * 0.58, pb - R * 2.05, R * 0.34, R * 2.1);
    g.strokeStyle = '#20223c'; g.lineWidth = R * 0.34;
    g.beginPath(); g.arc(px, pb - R * 2.0, R * 0.75, Math.PI, 0); g.stroke();
    g.strokeStyle = `rgba(200, 140, 255, ${0.5 * puls})`; g.lineWidth = Math.max(1, R * 0.05);
    g.beginPath(); g.arc(px, pb - R * 2.0, R * 0.6, Math.PI, 0); g.stroke();
    // Funken
    for (let i = 0; i < 26; i++) {
      const ph = (t * 0.22 + i / 26) % 1;
      const x = px + (zufall(i) - 0.5) * R * 1.1 + Math.sin(t * 1.3 + i) * R * 0.35 * ph;
      const y = pb - R * 1.2 - ph * R * 4.5;
      g.globalAlpha = (1 - ph) * 0.85;
      g.fillStyle = i % 3 ? '#d6a8ff' : '#9fe6ff';
      g.beginPath(); g.arc(x, y, Math.max(0.8, R * 0.05) * (1 - ph * 0.5), 0, 7); g.fill();
    }
    g.globalAlpha = 1;

    // 🌫️ Nebel in drei Bändern
    const nebel = (yB, tempo, a, rr, seed) => {
      for (let j = 0; j < 9; j++) {
        const breite = W * 1.5;
        const x = ((zufall(seed + j) * breite + t * tempo * W) % breite) - W * 0.25;
        const y = yB + (zufall(seed + j * 3) - 0.5) * H * 0.05;
        const r = rr * (0.7 + zufall(seed + j * 7) * 0.6);
        const ng = g.createRadialGradient(x, y, 0, x, y, r);
        ng.addColorStop(0, `rgba(150, 160, 225, ${a})`); ng.addColorStop(1, 'rgba(150, 160, 225, 0)');
        g.fillStyle = ng; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
    };
    nebel(L.hy, 0.006, 0.09, W * 0.16, 10);
    g.drawImage(L.vorn, 0, 0, W, H);

    // 🔥 Licht in der Burg: Tor, Fenster, Fackeln, Fahne
    const flack = (i) => 0.75 + 0.25 * Math.sin(t * 7 + i * 1.7) * Math.sin(t * 3.1 + i);
    const tor = g.createRadialGradient(U(50), V(2), 0, U(50), V(8), 12 * k);
    tor.addColorStop(0, `rgba(255, 190, 90, ${0.85 * flack(0)})`); tor.addColorStop(1, 'rgba(120, 50, 10, .15)');
    g.fillStyle = tor;
    g.beginPath(); g.moveTo(U(43), V(0)); g.lineTo(U(43), V(13)); g.arc(U(50), V(13), 7 * k, Math.PI, 0); g.lineTo(U(57), V(0)); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(10, 8, 20, .85)'; g.lineWidth = Math.max(1, k * 0.7);   // Fallgitter
    g.beginPath();
    for (let x = 44.5; x < 57; x += 2.5) { g.moveTo(U(x), V(0)); g.lineTo(U(x), V(x > 46 && x < 54 ? 19.5 : 16)); }
    for (let y = 3; y < 19; y += 4) { g.moveTo(U(43), V(y)); g.lineTo(U(57), V(y)); }
    g.stroke();
    L.fenster.forEach(([x, y], i) => {
      const a = flack(i + 2);
      const fg = g.createRadialGradient(U(x), V(y + 2), 0, U(x), V(y + 2), 6 * k);
      fg.addColorStop(0, `rgba(255, 200, 100, ${0.32 * a})`); fg.addColorStop(1, 'rgba(255, 200, 100, 0)');
      g.fillStyle = fg; g.fillRect(U(x) - 6 * k, V(y + 8), 12 * k, 12 * k);
      g.fillStyle = `rgba(255, ${190 + 30 * a | 0}, 110, ${0.7 + 0.3 * a})`;
      fensterForm(g, x, y, 0.8);
    });
    for (const [x, i] of [[39, 0], [61, 1]]) {
      const f = flack(i + 20);
      const lg = g.createRadialGradient(U(x), V(20), 0, U(x), V(20), 10 * k);
      lg.addColorStop(0, `rgba(255, 170, 70, ${0.45 * f})`); lg.addColorStop(1, 'rgba(255, 170, 70, 0)');
      g.fillStyle = lg; g.fillRect(U(x) - 10 * k, V(30), 20 * k, 20 * k);
      g.fillStyle = '#3a2a1a'; g.fillRect(U(x) - 0.5 * k, V(19), k, 4 * k);
      g.fillStyle = '#ffb347';
      g.beginPath(); g.moveTo(U(x - 1.3), V(19)); g.quadraticCurveTo(U(x - 1.4), V(21.5), U(x + Math.sin(t * 9 + i) * 0.6), V(22.5 + f * 1.6)); g.quadraticCurveTo(U(x + 1.4), V(21.5), U(x + 1.3), V(19)); g.closePath(); g.fill();
      g.fillStyle = '#fff1b0'; g.beginPath(); g.arc(U(x), V(19.8), k * 0.7, 0, 7); g.fill();
    }
    // Fahne
    g.fillStyle = '#c8433a';
    g.beginPath(); g.moveTo(U(50), V(113.5));
    for (let i = 0; i <= 10; i++) g.lineTo(U(50 + i * 1.1), V(113.5 - Math.sin(t * 3 + i * 0.6) * 0.8 * i / 10));
    for (let i = 10; i >= 0; i--) g.lineTo(U(50 + i * 1.1), V(108.5 - Math.sin(t * 3 + i * 0.6) * 0.8 * i / 10));
    g.closePath(); g.fill();
    // Nebel vorn
    nebel(L.by - L.cw * 0.02, 0.012, 0.07, W * 0.2, 40);
    nebel(H * 1.02, -0.009, 0.08, W * 0.22, 70);
  }

  const schleife = (ms) => {
    if (!START.offen && !document.getElementById('startScreen')) return;
    malen(ms);
    if (!ruhig) START.raf = requestAnimationFrame(schleife);
  };
  START.neuMalen = () => { if (!document.getElementById('startScreen')) return; L = null; if (ruhig) malen(performance.now()); };
  window.addEventListener('resize', START.neuMalen);
  START.raf = requestAnimationFrame(schleife);
}
