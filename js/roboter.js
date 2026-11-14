'use strict';
// --- 🤖 Roboter: dein Code arbeitet für dich -----------------------------------------
// Ein Roboter steht auf einem gelösten Hof. Jeden Morgen führt er deinen gespeicherten Code aus –
// jeden Tag auf einer anderen Variante des Hofs. Klappt der Code, bringt er Gold. Klappt er nicht,
// steht im Morgenbericht, warum – dann lohnt es sich, den Code allgemeiner zu machen.

const roboterAnzahl = () => Object.keys(P.roboter).length + P.roboFrei;
const roboPreis = () => ROBO_PREIS[roboterAnzahl()];   // undefined = keine weiteren Roboter
// Roboter arbeiten nur auf Äckern – in einer Burg ohne Höfe (Burg 9: nur 📜 Archiv) gibt es keine
const roboterBekannt = () => burgHoefe().some((h) => !h.art) && (kapitelFertig(burgKapitel()[ROBO_AB_KAPITEL - 1]) || roboterAnzahl() > 0);
// Lohn wächst mit sparsamem Code: bei ⭐ sparsam (≤ h.sparsam Züge) der volle Zuschlag, bei doppelt so vielen Zügen keiner
const roboGuete = (h, zuege) => Math.max(0, Math.min(1, (2 * h.sparsam - zuege) / h.sparsam));
const roboLohn = (h, guete) => Math.round(h.lohn * (ROBO_ANTEIL + ROBO_SPARSAM * +guete));
// Der Roboter nimmt den besten Code, der schon geklappt hat (🔧 Verbessern), sonst den zuletzt geschriebenen
const roboCode = (id) => P.hoefe[id]?.geloest || P.code[id];
let ROBO_WARTE = null;   // Kauf ab 100 🪙: zweites Antippen

// Ein Arbeitstag auf einem Hof: dein Code auf der Variante des Tages
function roboArbeit(id) {
  const h = hofById(id), src = roboCode(id), alle = lagen(h), i = P.tag % alle.length, vorher = H;
  if (!src || !/\w/.test(src.replace(/#.*$/gm, ''))) return { id, ok: false, gold: 0, msg: 'Auf diesem Hof gibt es keinen Code.' };
  H = h;
  const chk = PY.check(src, h.sprache);
  const r = chk.err ? { ok: false, err: chk.err } : simuliere(alle[i], src);
  H = vorher;
  const variante = alle.length > 1 ? ` (Hof ${LAGE_NAME[i]})` : '';
  if (!r.ok) return { id, ok: false, gold: 0, msg: (r.err ? `Fehler in Zeile ${r.err[0]}: ${r.err[1]}` : r.msg) + variante };
  const sparsam = r.zuege <= h.sparsam;
  return { id, ok: true, sparsam, gold: roboLohn(h, roboGuete(h, r.zuege)), msg: `${r.zuege} Züge${sparsam ? ' · ⭐ sparsam' : ` (⭐ sparsam ≤ ${h.sparsam} bringt mehr)`}${variante}` };
}

// Morgens (nach der Nacht): alle Roboter arbeiten, Gold kommt sofort, der Bericht erscheint auf der Karte
function roboMorgen() {
  const ids = Object.keys(P.roboter);
  if (!ids.length || !PY.bereit) { P.roboBericht = null; return; }
  P.roboBericht = ids.map(roboArbeit);
  P.gold += P.roboBericht.reduce((s, r) => s + r.gold, 0);
}

function roboBerichtZeigen() {
  const b = P.roboBericht;
  if (!b) return false;
  P.roboBericht = null;
  speichern();
  const summe = b.reduce((s, r) => s + r.gold, 0), fehler = b.find((r) => !r.ok);
  karte(`<h2>🌅 Morgenbericht</h2><p>Deine Roboter haben gearbeitet:</p>
    ${b.map((r) => `<div class="zeile"><span>🤖 ${esc(hofById(r.id).titel)}<br><span class="hinweis">${esc(r.msg)}</span></span>
      <span class="${r.ok ? 'gut' : 'schlecht'}">${r.ok ? `+${r.gold} 🪙` : '✗'}</span></div>`).join('')}
    <p class="lohn">+${summe} 🪙</p>
    ${fehler ? '<p class="hinweis">Ein Roboter ist gescheitert: Dein Code klappt dort nicht auf jeder Variante. Verbessere ihn – dann arbeitet der Roboter wieder.</p>'
    : b.some((r) => r.ok && !r.sparsam) ? '<p class="hinweis">🔧 Tipp: Gelöste Höfe kannst du verbessern, ohne dass es einen Tag kostet. Weniger Züge = mehr Lohn für den Roboter.</p>' : ''}`,
  fehler ? [{ label: '✏️ Code verbessern', fn: () => { WAHL = fehler.id; DORF = hofById(fehler.id).kapitel; renderKarte(); } }, { label: 'Weiter' }] : [{ label: 'Weiter' }]);
  hud();
  return true;
}

// Auf der Karte: Roboter hinstellen (kaufen oder einen freien nehmen), abziehen
function roboHinstellen(id) {
  if (P.roboter[id]) return;
  if (P.roboFrei > 0) { P.roboFrei--; P.roboter[id] = { seit: P.tag }; speichern(); renderKarte(); return; }
  const preis = roboPreis();
  if (preis === undefined || P.gold < preis) return;
  if (preis >= KAUF_BESTAETIGEN && ROBO_WARTE !== id) { ROBO_WARTE = id; renderKarte(); return; }
  ROBO_WARTE = null;
  goldDazu(-preis);
  P.roboter[id] = { seit: P.tag };
  speichern();
  renderKarte();
  if (!P.gesehen.roboter_da) {
    P.gesehen.roboter_da = true;
    lernkarte({ titel: '🤖 Dein erster Roboter', text: 'Ab morgen früh arbeitet er hier mit deinem Code – jeden Tag auf einer anderen Variante des Hofs. Ist dein Code allgemein genug, bringt er jeden Morgen Gold.' });
  }
}
function roboAbziehen(id) {
  if (!P.roboter[id]) return;
  delete P.roboter[id];
  P.roboFrei++;
  speichern();
  renderKarte();
}

// Zeile in der Hof-Info auf der Karte
function roboZeile(h) {
  if (h.pruefung || h.art || !roboterBekannt()) return '';
  if (P.roboter[h.id]) {
    return `<div class="robozeile"><span>🤖 Ein Roboter arbeitet hier · bis zu ${roboLohn(h, true)} 🪙 pro Morgen</span>
      <button class="btn klein leise" id="roboAb">abziehen</button></div>`;
  }
  if (!P.hoefe[h.id]?.fertig) return '';
  const preis = roboPreis(), warte = ROBO_WARTE === h.id;
  if (!P.roboFrei && preis === undefined) return '<div class="robozeile"><span class="hinweis">🤖 Du hast alle Roboter gekauft.</span></div>';
  const text = P.roboFrei ? '🤖 Freien Roboter hinstellen' : warte ? 'Nochmal tippen zum Kaufen!' : `🤖 Roboter kaufen · ${preis} 🪙`;
  return `<div class="robozeile"><span class="hinweis">Ein Roboter würde hier jeden Morgen bis zu ${roboLohn(h, true)} 🪙 verdienen.</span>
    <button class="btn klein ${warte ? 'gold' : 'gruen'}" id="roboHin" ${!P.roboFrei && P.gold < preis ? 'disabled' : ''}>${text}${P.roboFrei ? '' : fehlt(preis)}</button></div>`;
}
