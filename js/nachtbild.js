'use strict';
// --- 🌙 Nachtbild: Spielfeld, Burgmauer, Türme, Gegner, Effekte -----------------------
// Nur Darstellung – gerechnet wird in nacht.js. Auch abends zum Bauen (N = null).
// Vorbild: die Nacht aus code-crawler (Mauer mit Zinnen, Figuren mit Schatten, Zauber mit Flugbahn).

const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", system-ui, sans-serif';
const TURM_BAU = {};   // Platz → Zeitpunkt (s) des letzten Baus/Ausbaus, für die Bau-Animation
const MAUER_X = 13.35;   // linke Kante der Burgmauer (in Feldern) – nur Bild; Plätze, Held und Wege stehen in data.js/nacht.js
const TURM_FARBE = { pfeil: '#8a6a42', katapult: '#6e5a3e', kanone: '#5a5f6e', eis: '#4f8fb8', blitz: '#6a52b8' };

// Emoji einmal mit Schatten auf eine kleine Leinwand malen und dann nur noch kopieren
const SPRITES = new Map();
function sprite(ch, size) {
  const dpr = window.devicePixelRatio || 1, key = `${ch}|${size}|${dpr}`;
  let c = SPRITES.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = c.height = Math.ceil(size * 1.5 * dpr);
    const g = c.getContext('2d');
    g.scale(dpr, dpr);
    g.font = `${size}px ${EMOJI_FONT}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowOffsetY = 2; g.shadowBlur = 2;
    g.fillText(ch, size * 0.75, size * 0.8);
    SPRITES.set(key, c);
  }
  return c;
}
function malSprite(g, ch, x, y, size, spiegeln = false) {
  const s = Math.round(size), w = s * 1.5;
  g.save(); g.translate(x, y); if (spiegeln) g.scale(-1, 1);
  g.drawImage(sprite(ch, s), -w / 2, -w / 2 - s * 0.05, w, w);
  g.restore();
}

// --- ✨ Partikel, Bodenflecken und große Momente (nur Bild, beeinflussen die Rechnung nicht) ---
// Partikel und Flecken in Feld-Einheiten; Zufall ist hier erlaubt, weil es nur um das Aussehen geht.
let PARTIKEL = [], FLECKEN = [], MOMENTE = [], bildN = null, bildZeit = 0;
function funken(x, y, n, o = {}) {
  for (let i = 0; i < n; i++) {
    const a = (o.winkel ?? Math.random() * Math.PI * 2) + (o.streu ?? 0) * (Math.random() - 0.5), v = (o.v ?? 3) * (0.5 + Math.random());
    PARTIKEL.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.hoch ?? 0), g: o.g ?? 0, t: 0, life: (o.life ?? 0.6) * (0.7 + Math.random() * 0.6),
      size: (o.size ?? 0.06) * (0.6 + Math.random() * 0.8), farben: o.farben ?? ['#fff3b0', '#ffb347'], ico: o.ico, reib: o.reib ?? 0.92 });
  }
}
function fleck(x, y, r, typ, life = 3) { FLECKEN.push({ x, y, r, typ, t: 0, life }); }
function zeichnePartikel(g, k, px, dt) {
  for (const p of PARTIKEL) {
    p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.vx *= p.reib; p.vy *= p.reib;
    const a = Math.max(0, 1 - p.t / p.life);
    g.globalAlpha = a;
    if (p.ico) malSprite(g, p.ico, px(p.x), px(p.y), k * p.size * 4);
    else {
      g.fillStyle = p.farben[Math.min(p.farben.length - 1, Math.floor((p.t / p.life) * p.farben.length))];
      g.beginPath(); g.arc(px(p.x), px(p.y), Math.max(1, k * p.size * (0.5 + a * 0.5)), 0, Math.PI * 2); g.fill();
    }
  }
  g.globalAlpha = 1;
  PARTIKEL = PARTIKEL.filter((p) => p.t < p.life);
}
function zeichneFlecken(g, k, px, dt) {
  for (const f of FLECKEN) {
    f.t += dt;
    const a = Math.max(0, 1 - f.t / f.life);
    if (f.typ === 'krater') {
      g.fillStyle = `rgba(60, 40, 25, ${0.55 * a})`; g.beginPath(); g.ellipse(px(f.x), px(f.y), f.r * k, f.r * k * 0.6, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = `rgba(150, 120, 80, ${0.6 * a})`; g.lineWidth = 2; g.stroke();
    } else if (f.typ === 'brand') {
      g.fillStyle = `rgba(30, 15, 10, ${0.5 * a})`; g.beginPath(); g.arc(px(f.x), px(f.y), f.r * k, 0, Math.PI * 2); g.fill();
      g.fillStyle = `rgba(255, 120, 40, ${0.35 * a * (0.6 + 0.4 * Math.sin(f.t * 15))})`; g.beginPath(); g.arc(px(f.x), px(f.y), f.r * k * 0.5, 0, Math.PI * 2); g.fill();
    } else if (f.typ === 'frost') {
      g.fillStyle = `rgba(200, 240, 255, ${0.35 * a})`; g.beginPath(); g.arc(px(f.x), px(f.y), f.r * k, 0, Math.PI * 2); g.fill();
    }
  }
  FLECKEN = FLECKEN.filter((f) => f.t < f.life);
}

// ⬆️ Level-up: Lichtkugeln sammeln sich beim Helden, dann eine große Explosion
function levelUpStart(N, level) {
  const kugeln = Array.from({ length: 16 }, (_, i) => ({ a: (i / 16) * Math.PI * 2 + Math.random() * 0.3, r: 3 + Math.random() * 2.5, v: 0.85 + Math.random() * 0.3 }));
  MOMENTE.push({ typ: 'levelup', t: 0, level, kugeln, knall: false });
}
function zeichneMomente(g, k, px, W, H, dt, N) {
  for (const m of MOMENTE) {
    m.t += dt;
    if (m.typ !== 'levelup') continue;
    const hx = px(HELD.x), hy = px(HELD.y), sammeln = 0.8;
    if (m.t < sammeln) {
      // Kugeln fliegen beschleunigt zum Helden, mit Leuchtschweif
      for (const o of m.kugeln) {
        const p = Math.min(1, (m.t / sammeln) * o.v), e = p * p, r = o.r * (1 - e) * k;
        const x = hx + Math.cos(o.a + e * 2) * r, y = hy + Math.sin(o.a + e * 2) * r;
        const gr = g.createRadialGradient(x, y, 0, x, y, k * 0.3);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, '#ffe680'); gr.addColorStop(1, 'rgba(255, 220, 120, 0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, k * 0.3, 0, Math.PI * 2); g.fill();
      }
      const glanz = g.createRadialGradient(hx, hy, 0, hx, hy, k * (0.5 + m.t));
      glanz.addColorStop(0, `rgba(255, 255, 220, ${0.3 + m.t})`); glanz.addColorStop(1, 'rgba(255, 230, 150, 0)');
      g.fillStyle = glanz; g.beginPath(); g.arc(hx, hy, k * (0.5 + m.t), 0, Math.PI * 2); g.fill();
    } else {
      if (!m.knall) {
        m.knall = true;
        funken(HELD.x, HELD.y, 50, { v: 7, life: 1.1, size: 0.08, farben: ['#ffffff', '#fff3b0', '#ffd84a', '#c9a0ff'], reib: 0.9 });
        funken(HELD.x, HELD.y, 12, { v: 4, life: 1.4, ico: '✨', size: 0.08, reib: 0.9 });
        if (N) N.wackeln = Math.max(N.wackeln || 0, 0.35);
      }
      const e = (m.t - sammeln) / 1.2;
      if (e >= 1) continue;
      // Blitzlicht über dem ganzen Feld
      g.fillStyle = `rgba(255, 250, 220, ${Math.max(0, 0.6 - e * 1.5)})`; g.fillRect(0, 0, W, H);
      // Strahlen
      g.save(); g.translate(hx, hy); g.rotate(e * 1.5);
      for (let i = 0; i < 12; i++) {
        g.rotate(Math.PI / 6);
        const lg = g.createLinearGradient(0, 0, k * 5 * (0.3 + e), 0);
        lg.addColorStop(0, `rgba(255, 245, 200, ${0.8 * (1 - e)})`); lg.addColorStop(1, 'rgba(255, 245, 200, 0)');
        g.fillStyle = lg; g.beginPath(); g.moveTo(0, -k * 0.12); g.lineTo(k * 5 * (0.3 + e), 0); g.lineTo(0, k * 0.12); g.fill();
      }
      g.restore();
      // Druckwellen
      for (const [verz, farbe] of [[0, '255, 255, 255'], [0.12, '255, 216, 74'], [0.24, '201, 160, 255']]) {
        const q = Math.max(0, e - verz);
        if (q <= 0) continue;
        g.strokeStyle = `rgba(${farbe}, ${Math.max(0, 1 - q * 1.3)})`; g.lineWidth = k * 0.18 * (1 - q);
        g.beginPath(); g.arc(hx, hy, k * 6 * q, 0, Math.PI * 2); g.stroke();
      }
      // Kern
      const kern = g.createRadialGradient(hx, hy, 0, hx, hy, k * 1.6 * (1 - e * 0.5));
      kern.addColorStop(0, `rgba(255, 255, 255, ${1 - e})`); kern.addColorStop(1, 'rgba(255, 230, 150, 0)');
      g.fillStyle = kern; g.beginPath(); g.arc(hx, hy, k * 1.6, 0, Math.PI * 2); g.fill();
      // Schrift
      const s = 1 + Math.max(0, 0.4 - e) * 1.5;
      g.save(); g.translate(Math.min(W - k * 3, hx - k * 2.6), hy - k * 1.6); g.scale(s, s);
      g.font = `${Math.round(k * 0.75)}px "Lilita One", ${EMOJI_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.globalAlpha = e < 0.75 ? 1 : (1 - e) / 0.25;
      g.lineWidth = 6; g.strokeStyle = '#2a1050'; g.strokeText(`LEVEL ${m.level}!`, 0, 0);
      g.fillStyle = '#ffe680'; g.fillText(`LEVEL ${m.level}!`, 0, 0);
      g.restore(); g.globalAlpha = 1;
    }
  }
  MOMENTE = MOMENTE.filter((m) => m.typ !== 'levelup' || m.t < 2);
}

function nachtGroesse(cv) {
  const W = cv.parentElement.clientWidth, k = W / NFELD.w, H = k * NFELD.h, dpr = window.devicePixelRatio || 1;
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.height = H + 'px';
  }
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, k, W, H };
}

// Abstand eines Punkts zum Weg eines Portals
function wegAbstand(p, x, y) {
  let best = 99;
  for (let i = 1; i < p.weg.length; i++) {
    const [ax, ay] = p.weg[i - 1], [bx, by] = p.weg[i], l2 = (bx - ax) ** 2 + (by - ay) ** 2;
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / (l2 || 1)));
    best = Math.min(best, Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)));
  }
  return best;
}
// Bäume und Steine: feste Plätze, weit weg vom Weg (dort will man bauen), nicht auf alten Turmplätzen oder der Mauer.
// Sie sind Hindernisse: auf einen Baum kann man keinen Turm stellen.
let DEKO = null;
function nachtDeko() {
  if (DEKO) return DEKO;
  DEKO = [];
  for (let i = 0; i < 120 && DEKO.length < 22; i++) {
    const x = rausch(i * 3 + 1) * (MAUER_X - 1.4), y = rausch(i * 3 + 2) * (NFELD.h - 1);
    const frei = PORTALE.every((p) => wegAbstand(p, x, y) > 2) && ALTE_PLAETZE.every((s) => Math.hypot(s.x - x, s.y - y) > 1) && Math.hypot(HELD.x - x, HELD.y + 0.6 - y) > 1.4
      && DEKO.every((d) => Math.hypot(d.x - x, d.y - y) > 0.8);
    if (frei) DEKO.push({ x, y, baum: i % 4 !== 0, dunkel: i % 3 === 0 });
  }
  return DEKO;
}

// 🏗️ Darf hier ein Turm stehen? null = ja, sonst der Grund (für den roten Geisterturm und die Ansage). ohne = eigene Id beim Prüfen
function platzPruefen(x, y, ohne = null) {
  if (x < 0.4 || y < 0.5 || y > NFELD.h - 0.6) return 'Zu nah am Rand.';
  if (x > MAUER_X - 0.8) return 'Auf und an der Mauer steht nur der Held.';
  const tmax = turmMax();
  if (tmax && ohne === null && Object.keys(P.tuerme).length >= tmax) return `🎯 Scharfschützenburg: höchstens ${tmax} Türme.`;
  if (imPortalNebel(x, y)) return 'Am Portal liegt dichter Nebel – dort kann nie ein Turm stehen.';
  if (!imBauland(x, y)) return 'Hier liegt noch Nebel. Vertreibe ihn unter 🛡️ Burg stärken, dann kannst du weiter vorn bauen.';
  if (PORTALE.some((p) => wegAbstand(p, x, y) < WEG_FREI)) return 'Nicht auf den Weg – dort laufen die Monster.';
  if (Object.entries(P.tuerme).some(([id, t]) => id !== String(ohne) && Math.hypot(t.x - x, t.y - y) < TURM_ABSTAND)) return 'Zu nah an einem anderen Turm.';
  const deko = nachtDeko().find((d) => Math.hypot(d.x - x, d.y - y) < 0.6);
  if (deko) return deko.baum ? 'Dort steht ein Baum.' : 'Dort liegt ein Felsen.';
  return null;
}

// 🌫️ Bauland: außerhalb des Kreises um das Tor liegt Dunst (beim Bauen deutlicher, mit wandernder Grenzlinie)
function zeichneBaulandNebel(g, k, px, W, H, jetzt, bauen) {
  const r = baulandR();
  if (r >= BAULAND[BAULAND.length - 1]) return;
  const cx = px(BURG.tor.x), cy = px(BURG.y);
  g.save();
  g.beginPath(); g.rect(-40, -40, W + 80, H + 80); g.arc(cx, cy, r * k, 0, Math.PI * 2);
  g.fillStyle = `rgba(200, 208, 225, ${bauen ? 0.32 : 0.14})`; g.fill('evenodd');
  if (bauen) {
    g.setLineDash([10, 8]); g.lineDashOffset = -jetzt * 12;
    g.strokeStyle = 'rgba(245, 248, 255, .7)'; g.lineWidth = 2.5;
    g.beginPath(); g.arc(cx, cy, r * k, 0, Math.PI * 2); g.stroke();
  }
  g.restore();
}
// 🌀 Dichter Nebel um jedes Portal: wabernde Wolken
function zeichnePortalNebel(g, k, px, jetzt) {
  for (const p of PORTALE) {
    const x = px(p.weg[0][0]), y = px(p.weg[0][1]), R = PORTAL_NEBEL * k;
    const gr = g.createRadialGradient(x, y, R * 0.2, x, y, R);
    gr.addColorStop(0, 'rgba(215, 205, 240, .55)'); gr.addColorStop(0.7, 'rgba(190, 180, 225, .3)'); gr.addColorStop(1, 'rgba(190, 180, 225, 0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 7; i++) {
      const w = i * 0.9 + jetzt * (0.15 + 0.03 * i), d = R * (0.35 + 0.35 * rausch(i + 5));
      const wx = x + Math.cos(w) * d, wy = y + Math.sin(w) * d * 0.8, wr = R * (0.25 + 0.1 * rausch(i + 11));
      const wg = g.createRadialGradient(wx, wy, 0, wx, wy, wr);
      wg.addColorStop(0, 'rgba(235, 230, 250, .35)'); wg.addColorStop(1, 'rgba(235, 230, 250, 0)');
      g.fillStyle = wg; g.beginPath(); g.arc(wx, wy, wr, 0, Math.PI * 2); g.fill();
    }
  }
}

// 📏 Wie viel Weg sieht ein Turm von hier aus? (Felder Weg in Reichweite, ohne den Mindestabstand des Katapults)
function wegInReichweite(x, y, reich, mindest = 0) {
  let n = 0;
  for (const p of PORTALE) for (let i = 1; i < p.weg.length; i++) {
    const [ax, ay] = p.weg[i - 1], [bx, by] = p.weg[i], l = Math.hypot(bx - ax, by - ay);
    for (let s = 0; s < l; s += 0.1) { const d = Math.hypot(ax + (bx - ax) * s / l - x, ay + (by - ay) * s / l - y); if (d <= reich && d >= mindest) n += 0.1; }
  }
  return Math.round(n);
}
// 👆 Bester freier Platz für eine Turmart (Finger beim ersten Turm, Bot): wo der Turm am meisten Weg sieht; bei Gleichstand näher am Tor
function guterPlatz(art) {
  const w = turmWerteAus(art, []);
  let best = null;
  for (let x = 0.5; x < MAUER_X - 0.8; x += 0.25) for (let y = 0.6; y < NFELD.h - 0.6; y += 0.25) {
    if (platzPruefen(x, y)) continue;
    const wert = wegInReichweite(x, y, w.reich, w.mindest || 0) + x * 0.01;
    if (!best || wert > best.wert) best = { x, y, wert };
  }
  return best;
}

// --- Burgmauer am rechten Rand: Zinnen, Steine, Tor, zwei Ecktürme mit Fahnen ---
function zeichneMauer(g, k, W, H, jetzt) {
  const x0 = MAUER_X * k, torY = (BURG.y + 0.5) * k;
  const wand = g.createLinearGradient(x0, 0, W, 0);
  wand.addColorStop(0, '#9aa3b8'); wand.addColorStop(1, '#6f788d');
  g.fillStyle = wand; g.fillRect(x0, 0, W - x0, H);
  // einzelne Steine, jeder etwas anders getönt, mit hellem Rand oben (Licht) und dunklem Fugenstrich
  const st = k * 0.35;
  for (let y = 0, r = 0; y < H; y += st, r++) {
    for (let x = x0 + (r % 2 ? -st * 0.8 : 0), i = 0; x < W; x += st * 1.6, i++) {
      const v = rausch(r * 31 + i * 7) * 30 - 15;
      g.fillStyle = `rgb(${145 + v},${152 + v},${170 + v})`; g.fillRect(x + 1, y + 1, st * 1.6 - 2, st - 2);
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 1, y + 1, st * 1.6 - 2, 2);
      g.fillStyle = 'rgba(30,34,46,.25)'; g.fillRect(x + 1, y + st - 3, st * 1.6 - 2, 2);
    }
  }
  g.fillStyle = F_WAND_SCHATTEN; g.fillRect(x0, 0, W - x0, H);
  // Wehrgang und Zinnen zur Feldseite
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x0 + k * 0.3, 0, k * 0.12, H);
  g.fillStyle = '#a7afc2'; g.strokeStyle = '#4d5568'; g.lineWidth = 1.5;
  for (let y = k * 0.1; y < H; y += k * 0.62) { g.fillRect(x0 - k * 0.2, y, k * 0.24, k * 0.36); g.strokeRect(x0 - k * 0.2, y, k * 0.24, k * 0.36); }
  g.strokeStyle = '#3d4456'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0, H); g.stroke();
  // Torturm des Helden: das Tor führt unter ihm durch
  malHeldenturm(g, HELD.x * k + k / 2, HELD.y * k + k / 2, k);
  // Ecktürme
  for (const ty of ECKTURM_Y) {
    const cx = ECKTURM_X * k, cy = ty * k;
    g.fillStyle = '#868fa4'; g.strokeStyle = '#4d5568'; g.lineWidth = 2;
    g.beginPath(); g.arc(cx, cy, k * 0.75, 0, Math.PI * 2); g.fill(); g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.fillStyle = '#a7afc2'; g.fillRect(cx + Math.cos(a) * k * 0.63 - k * 0.09, cy + Math.sin(a) * k * 0.63 - k * 0.09, k * 0.18, k * 0.18);
    }
    g.fillStyle = FZ.rad(g, cx - k * 0.1, cy - k * 0.1, k * 0.45, [[0, '#e05a4a'], [1, '#8a2a20']]); g.beginPath(); g.arc(cx, cy, k * 0.4, 0, Math.PI * 2); g.fill();
  }
}
const ECKTURM_X = NFELD.w - 0.35, ECKTURM_Y = [0.55, 9.45];   // ganz in den Ecken, damit Held und Türme Platz haben
const F_WAND_SCHATTEN = 'rgba(10, 14, 30, .12)';

// --- Portal: wirbelndes Tor ---
function zeichnePortal(g, k, x, y, jetzt, neu) {
  const R = k * 0.62;
  const gr = g.createRadialGradient(x, y, 0, x, y, R * 1.4);
  gr.addColorStop(0, neu ? `rgba(230, 170, 255, ${0.7 + 0.3 * Math.sin(jetzt * 6)})` : 'rgba(210, 150, 255, .9)');
  gr.addColorStop(0.6, 'rgba(140, 60, 220, .7)'); gr.addColorStop(1, 'rgba(90, 30, 160, 0)');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, R * 1.4, 0, Math.PI * 2); g.fill();
  g.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const a = jetzt * 2.5 + (i * Math.PI * 2) / 3;
    g.strokeStyle = `rgba(255, 220, 255, ${0.8 - i * 0.2})`;
    g.beginPath(); g.arc(x, y, R * (0.45 + i * 0.2), a, a + 2.2); g.stroke();
  }
}

// --- Effekte: k = Fortschritt 0…1 (warte = Verzögerung am Anfang, z. B. Einschlag nach dem Flug) ---
function zeichneEffekt(g, k0, f, px, jetzt, W, H, N) {
  if (f.dauer == null) f.dauer = f.t + DT;
  let k = 1 - f.t / f.dauer;
  if (f.warte) { const w = f.warte / f.dauer; if (k < w) return; k = (k - w) / (1 - w); }
  const K = k0;   // Feldgröße in Pixeln
  const einmal = !f.gespawnt && (f.gespawnt = true);   // Partikel nur beim ersten sichtbaren Bild des Effekts
  g.save();
  switch (f.typ) {
    case 'magie': {
      // Zaubergeschoss des Helden: leuchtende Kugel mit Schweif (bei Wucht groß und golden)
      const p = Math.min(1, k * 1.1), x = px(f.x1 + (f.x2 - f.x1) * p), y = px(f.y1 + (f.y2 - f.y1) * p) - Math.sin(p * Math.PI) * K * 0.4;
      const R = K * (f.gross ? 0.22 : 0.12), gr = g.createRadialGradient(x, y, 0, x, y, R * 2);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, f.gross ? '#ffd84a' : '#c9a0ff'); gr.addColorStop(1, 'rgba(160, 110, 255, 0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, R * 2, 0, Math.PI * 2); g.fill();
      break;
    }
    case 'pfeil': case 'eis': {
      // Pfeil mit Spitze, Federn und Leuchtspur im flachen Bogen; beim Einschlag kurze Funken
      const p = Math.min(1, k * 1.25), x = px(f.x1 + (f.x2 - f.x1) * p), y = px(f.y1 + (f.y2 - f.y1) * p) - Math.sin(p * Math.PI) * K * 0.3;
      const a = Math.atan2(f.y2 - f.y1, f.x2 - f.x1) - Math.cos(p * Math.PI) * 0.3, eis = f.typ === 'eis';
      const sx = x - Math.cos(a) * K * 1.1, sy = y - Math.sin(a) * K * 1.1, spur = g.createLinearGradient(sx, sy, x, y);
      spur.addColorStop(0, 'rgba(255,255,255,0)'); spur.addColorStop(1, eis ? 'rgba(160, 230, 255, .9)' : 'rgba(255, 220, 140, .9)');
      g.strokeStyle = spur; g.lineWidth = K * 0.09; g.lineCap = 'round';
      g.beginPath(); g.moveTo(sx, sy); g.lineTo(x, y); g.stroke();
      if (p < 1) {
        g.translate(x, y); g.rotate(a);
        if (eis) {
          g.fillStyle = '#e8fbff'; g.beginPath(); g.moveTo(K * 0.2, 0); g.lineTo(-K * 0.1, -K * 0.09); g.lineTo(-K * 0.3, 0); g.lineTo(-K * 0.1, K * 0.09); g.fill();
        } else {
          g.strokeStyle = '#7a4c22'; g.lineWidth = K * 0.06; g.beginPath(); g.moveTo(-K * 0.42, 0); g.lineTo(0, 0); g.stroke();
          g.fillStyle = '#f2f2f2'; g.beginPath(); g.moveTo(K * 0.16, 0); g.lineTo(-K * 0.04, -K * 0.09); g.lineTo(-K * 0.04, K * 0.09); g.fill();
          g.fillStyle = '#d04a3a'; g.beginPath(); g.moveTo(-K * 0.36, 0); g.lineTo(-K * 0.52, -K * 0.09); g.lineTo(-K * 0.46, 0); g.lineTo(-K * 0.52, K * 0.09); g.fill();
        }
      } else if (!f.trefferFunken) {
        f.trefferFunken = true;
        funken(f.x2, f.y2, 6, { v: 3, life: 0.3, size: 0.045, farben: eis ? ['#ffffff', '#9fe3ff'] : ['#ffffff', '#ffd27a'] });
      }
      break;
    }
    case 'stein': {
      // Katapult: hoher, langsamer Bogen, der Stein dreht sich
      const p = k, x = px(f.x1 + (f.x2 - f.x1) * p), y = px(f.y1 + (f.y2 - f.y1) * p) - Math.sin(p * Math.PI) * K * 2.2;
      FZ.ell(g, x, px(f.y1 + (f.y2 - f.y1) * p), K * 0.15, K * 0.05, 'rgba(0,0,0,.25)');   // Schatten am Boden
      g.translate(x, y); g.rotate(p * 8);
      g.fillStyle = FZ.rad(g, -K * 0.05, -K * 0.05, K * 0.22, [[0, '#cfc6b4'], [1, '#6a6050']]);
      g.beginPath(); g.moveTo(-K * 0.17, -K * 0.05); g.lineTo(-K * 0.05, -K * 0.17); g.lineTo(K * 0.14, -K * 0.12); g.lineTo(K * 0.18, K * 0.06); g.lineTo(K * 0.02, K * 0.17); g.lineTo(-K * 0.14, K * 0.1); g.closePath(); g.fill();
      break;
    }
    case 'regen': {
      // 🌧️ Pfeilregen/Pfeilsturm: erst ein Zielkreis am Boden, dann fallen viele Pfeile schräg von oben,
      // jeder mit wachsendem Schatten; beim Einschlag Staub, die Pfeile stecken kurz im Boden
      const x = px(f.x), y = px(f.y), R = f.r * K, n = f.n || 16, gold = f.gold;
      if (!f.pfeile) f.pfeile = Array.from({ length: n }, (_, i) => ({ dx: (rausch(i * 7 + f.x) - 0.5) * 2, dy: (rausch(i * 13 + f.y) - 0.5) * 2, w: (i / n) * 0.45 }));
      g.globalAlpha = Math.max(0, 0.5 - k * 0.5);
      g.strokeStyle = gold ? '#ffd84a' : '#ff6a5a'; g.lineWidth = 2; g.setLineDash([6, 6]);
      g.beginPath(); g.ellipse(x, y, R, R * 0.55, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      g.globalAlpha = 1;
      for (const p of f.pfeile) {
        const q = (k - p.w) / 0.4;   // 0 = startet, 1 = schlägt ein
        const zx = x + p.dx * R * 0.8, zy = y + p.dy * R * 0.45;
        if (q < 0) continue;
        if (q < 1) {
          const sx = zx - K * 1.6 * (1 - q), sy = zy - K * 3.2 * (1 - q);
          FZ.ell(g, zx, zy, K * 0.12 * q, K * 0.05 * q, 'rgba(0,0,0,.35)');
          g.save(); g.translate(sx, sy); g.rotate(Math.atan2(3.2, 1.6));
          const spur = g.createLinearGradient(-K * 0.9, 0, 0, 0); spur.addColorStop(0, 'rgba(255,255,255,0)'); spur.addColorStop(1, gold ? 'rgba(255,220,120,.8)' : 'rgba(255,255,255,.6)');
          g.strokeStyle = spur; g.lineWidth = K * 0.05; g.beginPath(); g.moveTo(-K * 0.9, 0); g.lineTo(0, 0); g.stroke();
          g.strokeStyle = '#6a4424'; g.lineWidth = K * 0.05; g.beginPath(); g.moveTo(-K * 0.4, 0); g.lineTo(0, 0); g.stroke();
          g.fillStyle = gold ? '#ffe680' : '#e8e8f0'; g.beginPath(); g.moveTo(K * 0.12, 0); g.lineTo(-K * 0.02, -K * 0.06); g.lineTo(-K * 0.02, K * 0.06); g.fill();
          g.fillStyle = '#d04a3a'; g.fillRect(-K * 0.42, -K * 0.05, K * 0.1, K * 0.1);
          g.restore();
        } else {
          const nach = Math.min(1, (q - 1) * 2);
          g.globalAlpha = 1 - nach;
          g.strokeStyle = '#6a4424'; g.lineWidth = K * 0.045; g.beginPath(); g.moveTo(zx, zy); g.lineTo(zx - K * 0.12, zy - K * 0.24); g.stroke();
          FZ.kreis(g, zx, zy, K * (0.05 + nach * 0.12), `rgba(210,190,150,${0.6 * (1 - nach)})`);
          g.globalAlpha = 1;
          if (!p.knall) { p.knall = true; if (Math.random() < 0.4) funken((zx - K / 2) / K, (zy - K / 2) / K, 2, { v: 1.5, life: 0.3, size: 0.04, farben: ['#e8d8b0', '#a08a60'] }); }
        }
      }
      break;
    }
    case 'eisblock': {
      // 🧊 Eisgefängnis/Gletscher: ein Kristallblock wächst um den Gegner, Glanz huscht darüber, am Ende Splitter
      const x = px(f.x), y = px(f.y), s = K * (f.r || 0.6), wachs = Math.min(1, k * 5), aus = k > 0.85 ? (1 - k) / 0.15 : 1;
      if (einmal) funken(f.x, f.y, 10, { v: 3, life: 0.5, size: 0.05, farben: ['#ffffff', '#bdf3ff', '#7fd0ff'] });
      g.globalAlpha = 0.85 * aus;
      g.fillStyle = FZ.lin(g, x - s, y - s, x + s, y + s, [[0, 'rgba(230,250,255,.85)'], [0.5, 'rgba(150,220,255,.55)'], [1, 'rgba(90,170,230,.75)']]);
      g.beginPath();
      for (let i = 0; i < 6; i++) { const w = (i / 6) * Math.PI * 2 - Math.PI / 2, r = s * wachs * (i % 2 ? 0.85 : 1.1); g.lineTo(x + Math.cos(w) * r * 0.8, y + Math.sin(w) * r); }
      g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2; g.stroke();
      // Glanzstreifen
      const gx = x - s + ((k * 2.5) % 1) * s * 2;
      g.save(); g.clip(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(gx, y - s); g.lineTo(gx + s * 0.25, y - s); g.lineTo(gx - s * 0.2, y + s); g.lineTo(gx - s * 0.45, y + s); g.fill(); g.restore();
      break;
    }
    case 'beben': {
      // 🌍 Erdbeben: Risse laufen vom Zentrum nach außen, Brocken springen hoch, eine Staubwelle rollt
      const x = px(f.x), y = px(f.y), R = f.r * K;
      if (einmal) {
        if (N) N.wackeln = Math.max(N.wackeln || 0, 0.35);
        funken(f.x, f.y, 18, { v: 4, hoch: 3, g: 14, life: 0.9, size: 0.07, farben: ['#8a6e4a', '#6e5a3e', '#b8a080'], reib: 0.98 });
        if (!f.risse) f.risse = Array.from({ length: 9 }, (_, i) => ({ w: (i / 9) * Math.PI * 2 + rausch(i + f.x) * 0.5, l: 0.6 + rausch(i * 3 + f.y) * 0.4 }));
      }
      g.globalAlpha = Math.max(0, 1 - k);
      g.strokeStyle = '#2a1a0a'; g.lineWidth = 3; g.lineCap = 'round';
      for (const r of f.risse || []) {
        const L = R * r.l * Math.min(1, k * 4);
        g.beginPath(); g.moveTo(x, y);
        for (let s = 1; s <= 4; s++) { const q = s / 4; g.lineTo(x + Math.cos(r.w + (s % 2 ? 0.15 : -0.15)) * L * q, y + Math.sin(r.w + (s % 2 ? 0.15 : -0.15)) * L * q * 0.55); }
        g.stroke();
      }
      g.strokeStyle = `rgba(210,180,130,${Math.max(0, 0.8 - k)})`; g.lineWidth = K * 0.25 * (1 - k);
      g.beginPath(); g.ellipse(x, y, R * (0.2 + k), R * (0.12 + k) * 0.55, 0, 0, Math.PI * 2); g.stroke();
      break;
    }
    case 'wolke': {
      // ☁️ Gewitterwolke/Gewittersturm: dunkle Wolke zieht über dem Ziel auf, dann schlägt der Blitz ein
      const x = px(f.x), y = px(f.y), wy = y - K * 2.2, auf = Math.min(1, k * 3), schlag = k > 0.35 && k < 0.6;
      g.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : auf;
      for (const [dx, dy, r] of [[-0.45, 0.05, 0.42], [0, -0.12, 0.55], [0.45, 0.05, 0.42], [0.2, 0.15, 0.38], [-0.2, 0.15, 0.38]]) FZ.kreis(g, x + dx * K, wy + dy * K, r * K, schlag ? '#6a6a8a' : '#3a3a52');
      g.globalAlpha = 1;
      if (schlag) {
        if (!f.knall) { f.knall = true; funken(f.x, f.y, 10, { v: 3.5, life: 0.4, size: 0.05, farben: ['#ffffff', '#e8e0ff', '#ffe45a'] }); if (N) N.wackeln = Math.max(N.wackeln || 0, 0.12); }
        const pts = [[x, wy + K * 0.3], [x - K * 0.25, wy + K * 0.9], [x + K * 0.15, wy + K * 1.3], [x - K * 0.1, y - K * 0.3], [x, y]];
        for (const [w, c] of [[9, 'rgba(180,160,255,.5)'], [4, '#e8e0ff'], [1.5, '#ffffff']]) { g.strokeStyle = c; g.lineWidth = w; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke(); }
        g.fillStyle = FZ.rad(g, x, y, K * 0.8, [[0, 'rgba(255,255,255,.9)'], [1, 'rgba(180,160,255,0)']]); g.beginPath(); g.arc(x, y, K * 0.8, 0, Math.PI * 2); g.fill();
      }
      break;
    }
    case 'glocke': {
      // 🔔 Burgglocke: goldene Glocke schwingt über dem Tor, Schallwellen laufen über das Feld
      const x = px(f.x), y = px(f.y), R = f.r * K, schwing = Math.sin(k * 25) * 0.4 * (1 - k);
      g.globalAlpha = Math.max(0, 1 - k);
      for (let i = 0; i < 3; i++) {
        const q = Math.max(0, k * 1.6 - i * 0.2);
        if (q <= 0 || q > 1) continue;
        g.strokeStyle = `rgba(255,220,120,${0.8 * (1 - q)})`; g.lineWidth = K * 0.12 * (1 - q);
        g.beginPath(); g.arc(x, y, R * q, Math.PI * 0.55, Math.PI * 1.45); g.stroke();
      }
      g.save(); g.translate(x + K * 0.4, y - K * 1.4); g.rotate(schwing);
      g.fillStyle = FZ.lin(g, -K * 0.3, 0, K * 0.3, 0, [[0, '#a07818'], [0.5, '#ffe27a'], [1, '#a07818']]);
      g.beginPath(); g.moveTo(-K * 0.12, -K * 0.3); g.quadraticCurveTo(-K * 0.3, K * 0.1, -K * 0.35, K * 0.25); g.lineTo(K * 0.35, K * 0.25); g.quadraticCurveTo(K * 0.3, K * 0.1, K * 0.12, -K * 0.3); g.closePath(); g.fill();
      FZ.kreis(g, 0, K * 0.3, K * 0.07, '#6a4a10');
      g.restore();
      break;
    }
    case 'loch': {
      // 🕳️ Schattenloch: ein dunkler Wirbel öffnet sich, Ringe drehen sich nach innen
      const x = px(f.x), y = px(f.y), R = f.r * K * Math.min(1, k * 4), aus = k > 0.8 ? (1 - k) / 0.2 : 1;
      g.globalAlpha = aus;
      g.fillStyle = FZ.rad(g, x, y, R, [[0, 'rgba(10,0,25,.9)'], [0.6, 'rgba(70,20,130,.6)'], [1, 'rgba(120,60,200,0)']]);
      g.beginPath(); g.ellipse(x, y, R, R * 0.55, 0, 0, Math.PI * 2); g.fill();
      g.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) { const a = -jetzt * 4 + i * 1.6; g.strokeStyle = `rgba(200,150,255,${0.7 - i * 0.12})`; g.beginPath(); g.ellipse(x, y, R * (0.3 + i * 0.18), R * (0.3 + i * 0.18) * 0.55, 0, a, a + 2); g.stroke(); }
      break;
    }
    case 'klirr': {
      // Schwerthieb: kurzer Funkenstern
      const x = px(f.x), y = px(f.y);
      g.globalAlpha = Math.max(0, 1 - k); g.strokeStyle = '#fff6c0'; g.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI + 0.4, d = K * (0.08 + k * 0.2);
        g.beginPath(); g.moveTo(x - Math.cos(a) * d, y - Math.sin(a) * d); g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); g.stroke();
      }
      break;
    }
    case 'staub': {
      // Katapult-Einschlag: Wackeln, Druckwelle, Krater, Brocken mit Schwerkraft, Staubpilz
      const x = px(f.x), y = px(f.y), R = f.r * K;
      if (einmal) {
        if (N) N.wackeln = Math.max(N.wackeln || 0, 0.18);
        fleck(f.x, f.y, f.r * 0.7, 'krater', 4);
        funken(f.x, f.y, 14, { v: 4, hoch: 3, g: 14, life: 0.9, size: 0.07, farben: ['#8a6e4a', '#6e5a3e', '#4a3a28'], reib: 0.98 });
        funken(f.x, f.y, 10, { v: 1.5, hoch: 1, life: 1.2, size: 0.18, farben: ['rgba(210,180,130,.7)', 'rgba(170,140,100,.5)'], reib: 0.94 });
      }
      g.strokeStyle = `rgba(255, 245, 220, ${Math.max(0, 1 - k * 2)})`; g.lineWidth = K * 0.12 * (1 - k);
      g.beginPath(); g.ellipse(x, y, R * (0.3 + k * 2.2), R * (0.2 + k * 1.4), 0, 0, Math.PI * 2); g.stroke();
      if (k < 0.15) { g.fillStyle = `rgba(255, 250, 230, ${0.8 - k * 5})`; g.beginPath(); g.arc(x, y, R * 0.9, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = Math.max(0, 1 - k);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2, d = R * (0.3 + k * 0.8);
        g.fillStyle = i % 2 ? 'rgba(200, 170, 120, .8)' : 'rgba(160, 130, 90, .8)';
        g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6 - k * K * 0.4, R * (0.35 + k * 0.3), 0, Math.PI * 2); g.fill();
      }
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.4, d = R * (0.2 + k * 1.3);
        g.fillStyle = '#6e5a3e'; g.fillRect(x + Math.cos(a) * d - 3, y + Math.sin(a) * d - Math.sin(k * Math.PI) * K * 0.6 - 3, 6, 6);
      }
      g.strokeStyle = 'rgba(255, 230, 180, .9)'; g.lineWidth = 3;
      g.beginPath(); g.ellipse(x, y, R * (0.4 + k), R * (0.25 + k * 0.6), 0, 0, Math.PI * 2); g.stroke();
      break;
    }
    case 'kugel': {
      const p = k, x = px(f.x1 + (f.x2 - f.x1) * p), y = px(f.y1 + (f.y2 - f.y1) * p) - Math.sin(p * Math.PI) * K * 0.9;
      // Kanonenkugel mit Glanzpunkt und Rauchspur
      for (let i = 1; i <= 4; i++) { const q = Math.max(0, p - i * 0.05); FZ.kreis(g, px(f.x1 + (f.x2 - f.x1) * q), px(f.y1 + (f.y2 - f.y1) * q) - Math.sin(q * Math.PI) * K * 0.9, K * (0.06 + i * 0.03), `rgba(200,200,200,${0.3 - i * 0.06})`); }
      g.fillStyle = FZ.rad(g, x - K * 0.04, y - K * 0.04, K * 0.15, [[0, '#8a8e9a'], [0.5, '#2a2e38'], [1, '#111']]); g.beginPath(); g.arc(x, y, K * 0.13, 0, Math.PI * 2); g.fill();
      break;
    }
    case 'boom': {
      const x = px(f.x), y = px(f.y), R = f.r * K * (0.5 + 0.7 * Math.min(1, k * 2));
      const farbe = f.farbe || '255, 150, 60';
      if (einmal) {
        funken(f.x, f.y, 12, { v: 4, life: 0.5, size: 0.06, farben: ['#ffffff', '#ffe08a', `rgb(${farbe})`] });
        if (!f.farbe) fleck(f.x, f.y, f.r * 0.5, 'brand', 2);
      }
      g.globalAlpha = Math.max(0, 1 - k);
      const gr = g.createRadialGradient(x, y, 0, x, y, R);
      gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.45, `rgba(${farbe}, .9)`); gr.addColorStop(1, `rgba(${farbe}, 0)`);
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2, d = R * (0.5 + k * 0.7);
        g.fillStyle = i % 2 ? '#ffd27a' : `rgb(${farbe})`; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 2.5, 0, Math.PI * 2); g.fill();
      }
      break;
    }
    case 'feuerball': {
      const flug = 0.38;
      if (k < flug) {
        const p = k / flug, bahn = (q) => [px(f.x1 + (f.x2 - f.x1) * q), px(f.y1 + (f.y2 - f.y1) * q) - Math.sin(q * Math.PI) * K * 1.6];
        for (let i = 4; i >= 1; i--) {   // Schweif
          const [tx, ty] = bahn(Math.max(0, p - i * 0.06));
          g.globalAlpha = 0.5 - i * 0.1; g.fillStyle = '#ff9a3c'; g.beginPath(); g.arc(tx, ty, Math.max(1, K * 0.3 - i * 2), 0, Math.PI * 2); g.fill();   // auf kleinen Bildschirmen nie negativ
        }
        g.globalAlpha = 1;
        const [x, y] = bahn(p), gr = g.createRadialGradient(x, y, 2, x, y, K * 0.5);
        gr.addColorStop(0, '#fff6c0'); gr.addColorStop(0.5, '#ff9a3c'); gr.addColorStop(1, 'rgba(255,80,20,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, K * 0.5, 0, Math.PI * 2); g.fill();
        // gezeichneter Kern mit flackernden Flammenzungen statt Emoji
        for (let i = 0; i < 5; i++) { const w = jetzt * 20 + i * 1.3; FZ.ell(g, x - Math.cos(i) * K * 0.12, y + Math.sin(w) * K * 0.06, K * (f.gross ? 0.3 : 0.2), K * 0.1, `rgba(255,${120 + i * 25},40,.6)`, i); }
        FZ.kreis(g, x, y, K * (f.gross ? 0.22 : 0.15), '#fffbe0');
      } else {
        const e = (k - flug) / (1 - flug), x = px(f.x2), y = px(f.y2), R = f.r * K * (0.5 + 0.7 * Math.min(1, e * 2));
        if (!f.knall) {
          // Einschlag: Wackeln, Glut nach oben, Brandfleck, Druckwelle
          f.knall = true;
          if (N) N.wackeln = Math.max(N.wackeln || 0, 0.22);
          fleck(f.x2, f.y2, f.r * 0.8, 'brand', 3);
          funken(f.x2, f.y2, 28, { v: 5, hoch: 1.5, life: 0.8, size: 0.07, farben: ['#ffffff', '#fff3b0', '#ffb347', '#ff5a1a', '#7a2a10'], reib: 0.9 });
          funken(f.x2, f.y2, 6, { v: 2, hoch: 2, life: 1, ico: '🔥', size: 0.08, reib: 0.9 });
        }
        g.strokeStyle = `rgba(255, 220, 160, ${Math.max(0, 1 - e * 1.6)})`; g.lineWidth = K * 0.14 * (1 - e);
        g.beginPath(); g.arc(x, y, f.r * K * (0.4 + e * 1.8), 0, Math.PI * 2); g.stroke();
        g.globalAlpha = Math.max(0, 1 - e);
        const gr = g.createRadialGradient(x, y, 0, x, y, R);
        gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.4, '#ffb347'); gr.addColorStop(0.8, 'rgba(255,90,20,.6)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#ffdd88'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.stroke();
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2, d = R * (0.6 + e * 0.6);
          g.fillStyle = i % 2 ? '#ffd27a' : '#ff7a1a'; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 3, 0, Math.PI * 2); g.fill();
        }
      }
      break;
    }
    case 'frostring': {
      // farbe = anderer Ring (Glocke, Mond, Schattenloch) statt Frost
      const a = k < 0.7 ? 1 : (1 - k) / 0.3, x = px(f.x), y = px(f.y), R = f.r * K * Math.min(1, k * 5);
      if (einmal && !f.farbe) {
        fleck(f.x, f.y, f.r * 0.9, 'frost', 2.5);
        funken(f.x, f.y, 18, { v: 4.5, life: 0.7, size: 0.06, farben: ['#ffffff', '#c8f2ff', '#7fd0ff'] });
        funken(f.x, f.y, 6, { v: 3, life: 0.9, ico: '❄️', size: 0.06 });
      } else if (einmal) funken(f.x, f.y, 14, { v: 4, life: 0.6, size: 0.06, farben: ['#ffffff', `rgb(${f.farbe})`] });
      if (k < 0.2) { g.fillStyle = `rgba(230, 250, 255, ${0.7 - k * 3.5})`; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 0.28 * a; g.fillStyle = f.farbe ? `rgb(${f.farbe})` : '#bdf3ff'; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
      g.globalAlpha = a; g.strokeStyle = f.farbe ? `rgb(${f.farbe})` : '#e8fbff'; g.lineWidth = 3; g.setLineDash([8, 6]);
      g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      if (f.farbe) break;
      // gezeichnete Eiszacken wachsen aus dem Boden und kleine Schneekristalle drehen sich am Rand
      for (let i = 0; i < 10; i++) {
        const w = (i / 10) * Math.PI * 2 + 0.3, h = K * (0.35 + rausch(i + f.x * 7) * 0.3) * Math.min(1, k * 4), bx = x + Math.cos(w) * R * 0.7, by = y + Math.sin(w) * R * 0.55;
        g.fillStyle = FZ.lin(g, bx, by - h, bx, by, [[0, '#ffffff'], [0.5, '#bdf0ff'], [1, 'rgba(90,170,230,.8)']]);
        g.beginPath(); g.moveTo(bx - K * 0.08, by); g.lineTo(bx + Math.cos(w) * K * 0.08, by - h); g.lineTo(bx + K * 0.08, by); g.fill();
      }
      g.strokeStyle = '#ffffff'; g.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const w = (i / 6) * Math.PI * 2 + jetzt * 0.8, cx = x + Math.cos(w) * R * 0.95, cy = y + Math.sin(w) * R * 0.95, r = K * 0.13;
        for (let j = 0; j < 3; j++) { const a = j * Math.PI / 3 + jetzt * 2; g.beginPath(); g.moveTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke(); }
      }
      break;
    }
    case 'blitz': {
      const al = Math.max(0, 1 - k), pts = [];
      f.punkte.forEach((q, i) => {
        if (i) {
          const a = f.punkte[i - 1];
          for (let s = 1; s <= 4; s++) {
            const p = s / 4, j = s === 4 ? 0 : Math.sin(jetzt * 40 + i * 7 + s * 3) * K * 0.18;
            pts.push([px(a.x + (q.x - a.x) * p) + j, px(a.y + (q.y - a.y) * p) - j * 0.6]);
          }
        } else pts.push([px(q.x), px(q.y)]);
      });
      for (const [w, c, d] of [[f.dick ? 14 : 7, f.eis ? '#5fc8ff' : '#8f6bff', 0.35], [f.dick ? 6 : 3, f.eis ? '#bdf3ff' : '#c9b3ff', 0.8], [2, '#ffffff', 1]]) {
        g.globalAlpha = d * al; g.strokeStyle = c; g.lineWidth = w; g.lineJoin = 'round';
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      }
      // kleine Seitenäste und ein Leuchten an jedem getroffenen Gegner
      if (f.dick) {
        g.globalAlpha = 0.8 * al; g.strokeStyle = '#e3d6ff'; g.lineWidth = 1.5;
        for (let i = 2; i < pts.length; i += 2) {
          const [x, y] = pts[i], w = Math.sin(jetzt * 30 + i) * 2;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + K * 0.35 * Math.cos(w), y + K * 0.35 * Math.sin(w)); g.stroke();
        }
        for (const q of f.punkte.slice(1)) {
          const gr = g.createRadialGradient(px(q.x), px(q.y), 0, px(q.x), px(q.y), K * 0.6);
          gr.addColorStop(0, `rgba(255, 255, 255, ${al})`); gr.addColorStop(0.4, `rgba(180, 150, 255, ${0.6 * al})`); gr.addColorStop(1, 'rgba(140, 100, 255, 0)');
          g.globalAlpha = 1; g.fillStyle = gr; g.beginPath(); g.arc(px(q.x), px(q.y), K * 0.6, 0, Math.PI * 2); g.fill();
        }
        if (einmal) for (const q of f.punkte.slice(1)) funken(q.x, q.y, 6, { v: 3.5, life: 0.35, size: 0.04, farben: ['#ffffff', '#c9b3ff'] });
        if (einmal) { g.globalAlpha = 0.25; g.fillStyle = '#e8e0ff'; g.fillRect(0, 0, W, H); }
      }
      break;
    }
    case 'tot': {
      const x = px(f.x), y = px(f.y);
      if (einmal) funken(f.x, f.y, 8, { v: 2.5, hoch: 1, life: 0.5, size: 0.05, farben: ['#ffffff', '#ffd84a', '#ff9a5a'] });
      g.globalAlpha = Math.max(0, 1 - k);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.3, d = K * (0.15 + k * 0.6);
        g.fillStyle = i % 2 ? '#ffffff' : '#ffd84a'; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d - k * K * 0.3, 2.5, 0, Math.PI * 2); g.fill();
      }
      // Verpuffen: kleine Rauchwolke steigt auf
      g.globalAlpha = Math.max(0, 0.7 - k);
      for (let i = 0; i < 4; i++) FZ.kreis(g, x + (i - 1.5) * K * 0.12 * (1 + k), y - k * K * 0.5 - (i % 2) * K * 0.08, K * (0.12 + k * 0.15), 'rgba(235,235,245,.9)');
      break;
    }
    case 'text': {
      const x = Math.max(30, Math.min(W - 30, px(f.x))), y = px(f.y) - k * K * 0.8;
      g.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
      g.font = `${Math.round(K * 0.42)}px "Lilita One", ${EMOJI_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 4; g.strokeStyle = '#1a1020'; g.strokeText(f.text, x, y); g.fillStyle = f.farbe; g.fillText(f.text, x, y);
      break;
    }
    case 'flug': {
      // Etwas fliegt von (x1, y1) nach (x2, y2) und zieht eine Funkenspur: Phönix, Sternschnuppe, Irrlicht
      const x = f.x1 + (f.x2 - f.x1) * k, y = f.y1 + (f.y2 - f.y1) * k;
      funken(x, y, f.gross ? 2 : 1, { v: 0.8, life: 0.5, size: f.gross ? 0.09 : 0.05, farben: f.farbe || ['#ffffff', '#ffd84a'] });
      const fx = px(x), fy = px(y) - Math.sin(k * Math.PI) * K * 0.2, rechts = f.x2 > f.x1 ? 1 : -1;
      if (f.ico === '🌠') {   // Sternschnuppe: heller Kern, langer Schweif zurück zur Startrichtung
        const a = Math.atan2(f.y2 - f.y1, f.x2 - f.x1), l = K * 1.6;
        const sp = g.createLinearGradient(fx - Math.cos(a) * l, fy - Math.sin(a) * l, fx, fy); sp.addColorStop(0, 'rgba(255,240,180,0)'); sp.addColorStop(1, 'rgba(255,240,180,.9)');
        g.strokeStyle = sp; g.lineWidth = K * 0.16; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx - Math.cos(a) * l, fy - Math.sin(a) * l); g.lineTo(fx, fy); g.stroke();
        g.fillStyle = FZ.rad(g, fx, fy, K * 0.4, [[0, '#ffffff'], [0.4, '#ffe680'], [1, 'rgba(255,200,80,0)']]); g.beginPath(); g.arc(fx, fy, K * 0.4, 0, Math.PI * 2); g.fill();
      } else if (f.ico === '🕊️') {   // Phönix: Vogel aus Flammen mit schlagenden Flügeln
        const fl = Math.sin(jetzt * 18) * K * 0.35;
        g.fillStyle = FZ.rad(g, fx, fy, K * 1.3, [[0, 'rgba(255,220,120,.5)'], [1, 'rgba(255,90,20,0)']]); g.beginPath(); g.arc(fx, fy, K * 1.3, 0, Math.PI * 2); g.fill();
        for (const [farbe, z] of [['#ff5a1a', 1], ['#ffb040', 0.7], ['#fff2b0', 0.4]]) {
          g.fillStyle = farbe; g.beginPath();
          g.moveTo(fx + rechts * K * 0.6 * z, fy);
          g.quadraticCurveTo(fx, fy - K * 0.5 * z - fl * z, fx - rechts * K * 0.9 * z, fy - K * 0.7 * z - fl * z);
          g.quadraticCurveTo(fx - rechts * K * 0.3 * z, fy, fx - rechts * K * 1.0 * z, fy + K * 0.15 * z);
          g.quadraticCurveTo(fx, fy + K * 0.3 * z, fx + rechts * K * 0.6 * z, fy); g.fill();
        }
      } else if (f.ico === '🔮') {   // Irrlicht: schwebende, pulsierende Lichtkugel
        const r = K * (0.22 + 0.05 * Math.sin(jetzt * 12));
        g.fillStyle = FZ.rad(g, fx, fy, r * 2.2, [[0, '#ffffff'], [0.35, 'rgba(160,215,255,.9)'], [1, 'rgba(255,170,110,0)']]); g.beginPath(); g.arc(fx, fy, r * 2.2, 0, Math.PI * 2); g.fill();
      } else if (f.ico === '🥕') {   // 🥕 Rübenregen: gezeichnete Rübe, Spitze nach unten, dreht sich im Fall
        g.save(); g.translate(fx, fy); g.rotate(Math.sin(k * 9) * 0.35); g.lineJoin = 'round';
        g.fillStyle = '#ff8a1e'; g.strokeStyle = '#7a3a08'; g.lineWidth = Math.max(1, K * 0.04);
        g.beginPath(); g.moveTo(-K * 0.16, -K * 0.12); g.quadraticCurveTo(0, -K * 0.2, K * 0.16, -K * 0.12); g.lineTo(0, K * 0.38); g.closePath(); g.fill(); g.stroke();
        g.strokeStyle = 'rgba(122,58,8,.6)'; g.beginPath(); g.moveTo(-K * 0.08, K * 0.02); g.lineTo(K * 0.04, K * 0.04); g.moveTo(-K * 0.04, K * 0.16); g.lineTo(K * 0.05, K * 0.18); g.stroke();
        g.fillStyle = '#4caf3a'; for (const w of [-0.5, 0, 0.5]) { g.beginPath(); g.ellipse(Math.sin(w) * K * 0.1, -K * 0.26, K * 0.05, K * 0.14, w, 0, Math.PI * 2); g.fill(); }
        g.restore();
        if (k > 0.92) funken(x, y, 2, { v: 1.2, life: 0.4, size: 0.05, farben: ['#ffb040', '#c8a070'] });
      } else malSprite(g, f.ico, fx, fy, K * (f.gross ? 0.9 : 0.42), f.x2 > f.x1);
      break;
    }
    case 'ausbruch': {
      // 🔗 Kombo-Ausbruch: Lichtblitz über dem ganzen Feld, Ringe in den Farben der Kombo, Strahlen, großes Symbol und Name
      const x = px(f.x), y = px(f.y), R = f.r * K, farben = f.farben?.length ? f.farben : ['#ff6fd0'];
      if (k < 0.14) { g.fillStyle = `rgba(255, 245, 255, ${(1 - k / 0.14) * (f.stark ? 0.45 : 0.3)})`; g.fillRect(0, 0, W, H); }
      // Lichtsäule von oben
      if (k < 0.3) {
        const a = 1 - k / 0.3, sb = K * 0.9 * (1 + k);
        const gr = g.createLinearGradient(0, 0, 0, y);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, `rgba(255, 230, 255, ${0.8 * a})`);
        g.fillStyle = gr; g.fillRect(x - sb / 2, 0, sb, y);
      }
      // Bodenglühen
      const glu = g.createRadialGradient(x, y, 0, x, y, R * 1.2);
      glu.addColorStop(0, `rgba(255,255,255,${0.55 * (1 - k)})`); glu.addColorStop(0.5, `${farben[0]}55`); glu.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = glu; g.beginPath(); g.arc(x, y, R * 1.2, 0, Math.PI * 2); g.fill();
      // Strahlen (drehen sich)
      g.globalAlpha = Math.max(0, 1 - k * 1.1);
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6 + k * 1.5, l = R * (0.4 + Math.min(1, k * 2.2) * 0.9);
        g.strokeStyle = farben[i % farben.length]; g.lineWidth = K * (0.16 - k * 0.1); g.lineCap = 'round';
        g.beginPath(); g.moveTo(x + Math.cos(a) * K * 0.3, y + Math.sin(a) * K * 0.3); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      // Ringe nacheinander, je Farbe einer
      farben.forEach((c, i) => {
        const kk = Math.max(0, Math.min(1, (k - i * 0.1) / 0.6));
        if (kk <= 0 || kk >= 1) return;
        g.globalAlpha = 1 - kk; g.strokeStyle = c; g.lineWidth = K * 0.22 * (1 - kk) + 2;
        g.beginPath(); g.arc(x, y, R * (0.2 + kk * 1.0), 0, Math.PI * 2); g.stroke();
      });
      // großes Symbol und Name
      g.globalAlpha = k < 0.75 ? 1 : (1 - k) / 0.25;
      const s = k < 0.12 ? 0.4 + (k / 0.12) * 0.9 : k < 0.22 ? 1.3 - (k - 0.12) * 3 : 1;
      malSprite(g, f.ico, x, y - K * 0.2, K * 1.1 * s);
      g.font = `${Math.round(K * (f.stark ? 0.85 : 0.7))}px "Lilita One", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const tx = Math.max(K * 3, Math.min(W - K * 3, x)), ty = Math.max(K, y - K * 1.5 - k * K * 0.4);
      g.shadowColor = farben[0]; g.shadowBlur = 22; g.lineWidth = 7; g.strokeStyle = '#1a0a24';
      g.strokeText((f.stark ? '✨ ' : '🔗 ') + f.text, tx, ty); g.fillStyle = '#fff3fb'; g.fillText((f.stark ? '✨ ' : '🔗 ') + f.text, tx, ty);
      if (einmal) {
        funken(f.x, f.y, f.stark ? 80 : 55, { v: 7, hoch: 1.5, life: 1.1, size: 0.08, farben: ['#ffffff', ...farben], reib: 0.92 });
        funken(f.x, f.y, 8, { v: 3.5, hoch: 2, life: 1.3, ico: f.ico, size: 0.09, reib: 0.92 });
      }
      break;
    }
    case 'kombo': {
      // 🔗 Kombo: leuchtende, wachsende Schrift über dem Gegner
      const x = Math.max(70, Math.min(W - 70, px(f.x))), y = px(f.y) - k * K * 0.5, s = k < 0.2 ? 0.7 + k * 2 : 1.1;
      g.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
      g.translate(x, y); g.scale(s, s);
      g.font = `${Math.round(K * 0.5)}px "Lilita One", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = '#ff6fd0'; g.shadowBlur = 16;
      g.lineWidth = 5; g.strokeStyle = '#2a0a30'; g.strokeText(f.text, 0, 0);
      g.fillStyle = '#ffd6f4'; g.fillText(f.text, 0, 0);
      if (einmal) funken(f.x, f.y + 0.6, 16, { farben: ['#ff6fd0', '#ffd6f4', '#ffd84a'], v: 3.5, hoch: 1 });
      break;
    }
    case 'ansage': {
      if (f.banner) {
        // 🎌 Wellen-Banner: dunkles Band mit Goldkanten fährt von links herein, steht kurz, fährt rechts hinaus
        const rein = k < 0.15 ? 1 - k / 0.15 : 0, raus = k > 0.82 ? (k - 0.82) / 0.18 : 0;
        const dx = (-rein * rein + raus * raus) * W, bh = Math.max(46, K * 1.5), by = H * 0.3;
        g.translate(dx, 0);
        g.fillStyle = 'rgba(12, 10, 30, .82)'; g.fillRect(0, by - bh / 2, W, bh);
        g.fillStyle = '#e8b830'; g.fillRect(0, by - bh / 2, W, 3); g.fillRect(0, by + bh / 2 - 3, W, 3);
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = `${Math.round(bh * (f.unter ? 0.46 : 0.56))}px "Lilita One", ${EMOJI_FONT}`;
        g.lineWidth = 6; g.strokeStyle = '#1a1020'; g.fillStyle = '#ffd84a';
        const ty = by - (f.unter ? bh * 0.13 : 0);
        g.strokeText(f.text, W / 2, ty); g.fillText(f.text, W / 2, ty);
        if (f.unter) { g.font = `${Math.round(bh * 0.28)}px "Lilita One", sans-serif`; g.fillStyle = '#fff'; g.strokeText(f.unter, W / 2, by + bh * 0.25); g.fillText(f.unter, W / 2, by + bh * 0.25); }
        break;
      }
      // Große Schrift in der Mitte, springt herein und verblasst
      const s = k < 0.15 ? 0.6 + (k / 0.15) * 0.5 : k < 0.25 ? 1.1 - (k - 0.15) : 1;
      g.globalAlpha = k < 0.75 ? 1 : (1 - k) / 0.25;
      g.font = `${Math.round(K * 1.1)}px "Lilita One", ${EMOJI_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const passt = Math.min(1, (W * 0.88) / g.measureText(f.text).width);   // lange Ansagen schmaler machen
      g.translate(W / 2, H * 0.32 + (f.zeile || 0) * K * 1.3); g.scale(s * passt, s * passt);
      g.lineWidth = 8; g.strokeStyle = '#1a1020'; g.strokeText(f.text, 0, 0);
      g.fillStyle = f.text.startsWith('💥') ? '#ff8a4a' : '#ffd84a'; g.fillText(f.text, 0, 0);
      break;
    }
    case 'durch': {
      // 🚪 Ein Monster rennt ins Tor: es läuft weiter Richtung Torbogen, wird kleiner und verschwindet darin
      const gg = GEGNER[f.g], s = K * (gg.gross || (f.g === 'drache' ? 1.45 : f.g === 'troll' ? 1.0 : 0.6)) * (f.chef ? 2.1 : 1) * (1 - k * 0.6);
      const zx = px(HELD.x - 1.2), zy = px(HELD.y), x = px(f.x) + (zx - px(f.x)) * k, y = px(f.y) + (zy - px(f.y)) * k;
      g.globalAlpha = Math.max(0, 1 - k * k);
      if (!malGegner(g, f.g, x, y, s, jetzt, true, 7)) malSprite(g, gg.ico, x, y, s);
      break;
    }
    case 'tor': {
      g.globalAlpha = Math.max(0, 1 - k);
      const gr = g.createRadialGradient(W, px(BURG.y), K, W, px(BURG.y), W * 0.6);
      gr.addColorStop(0, 'rgba(255, 40, 40, .55)'); gr.addColorStop(1, 'rgba(255, 40, 40, 0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      break;
    }
    case 'licht': case 'zeit':
      g.globalAlpha = Math.max(0, 1 - k) * 0.55; g.fillStyle = f.typ === 'licht' ? '#fff0a0' : '#78c8ff'; g.fillRect(0, 0, W, H);
      break;
    case 'riss': {
      const x = px(f.x), y = px(f.y);
      g.globalAlpha = Math.max(0, 1 - k); g.strokeStyle = '#be5aff'; g.lineWidth = 4;
      for (let i = 0; i < 3; i++) { const a = jetzt * 6 + i * 2; g.beginPath(); g.arc(x, y, K * (0.3 + k * 0.6 + i * 0.12), a, a + 1.6); g.stroke(); }
      break;
    }
    default: break;
  }
  g.restore();
}

// --- Anzeige im Spielfeld: Mauerleben, Nacht, Gegner übrig, Abklingzeiten ---
// kompakt = eigene Leiste über dem Feld (#nachtLeiste, schmale Bildschirme): Mauer/XP links, Welle rechts daneben,
// keine Zauber-Uhren (die zeigt die Zauberleiste unter dem Feld)
const NACHT_KOMPAKT = 560;
function zeichneAnzeige(g, k, W, N, kompakt = false) {
  const r = Math.max(0, N.hp / N.max), bw = kompakt ? Math.max(80, W * 0.44 - 44) : Math.min(220, W * 0.32);
  g.fillStyle = 'rgba(8,16,40,.82)'; g.beginPath(); g.roundRect(8, 8, bw + 44, 28, 14); g.fill();
  g.fillStyle = '#3a0d12'; g.beginPath(); g.roundRect(38, 15, bw, 14, 7); g.fill();
  g.fillStyle = farbe(r > 0.5 ? 'gut' : r > 0.25 ? 'mittel' : 'schlecht'); g.beginPath(); g.roundRect(38, 15, Math.max(0, bw * r), 14, 7); g.fill();
  malSprite(g, '🧱', 23, 22, 16);
  g.font = '13px "Lilita One", sans-serif'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(`${Math.ceil(N.hp)}/${N.max}${N.schild > 0 ? `  🛡️${Math.ceil(N.schild)}` : ''}`, 38 + bw / 2, 23);
  // 🧙 XP-Leiste: füllt sich mit jedem besiegten Gegner (läuft weich nach), Aufstieg mit Glanz über dem Helden
  const xb = bw * 0.75;
  // 🐢 vor HELD_AB (data.js) keine XP-Leiste und kein Level-up – XP zählen still mit
  if (heldOffen()) {
  const L = heldLevel(P.xp + N.xp);
  if (N.lvlZeige === undefined) N.lvlZeige = L.level;
  if (L.level > N.lvlZeige) {
    N.lvlZeige = L.level;
    levelUpStart(N, L.level);
    N.held.anim = 2; N.xpGlanz = 1.6;
  }
  const ziel = L.rest / L.noetig;
  N.xpBalken = N.xpBalken === undefined || ziel < N.xpBalken - 0.5 ? ziel : N.xpBalken + (ziel - N.xpBalken) * 0.15;
  if (N.xpGlanz > 0) N.xpGlanz -= 1 / 60;
  g.fillStyle = 'rgba(8,16,40,.82)'; g.beginPath(); g.roundRect(8, 40, xb + 74, 22, 11); g.fill();
  g.fillStyle = '#241a3e'; g.beginPath(); g.roundRect(38, 46, xb, 10, 5); g.fill();
  g.fillStyle = N.xpGlanz > 0 ? '#f0e0ff' : '#a98bff'; g.beginPath(); g.roundRect(38, 46, Math.max(0, xb * N.xpBalken), 10, 5); g.fill();
  // 🧙 Porträt der eigenen Figur (Zauberer/Zauberin) im goldenen Rahmen, leuchtet beim Aufstieg
  g.save(); g.beginPath(); g.arc(23, 51, 14, 0, Math.PI * 2); g.clip();
  g.fillStyle = N.xpGlanz > 0 ? '#5a4aa0' : '#2a2f6a'; g.fillRect(9, 37, 28, 28);
  malHeld(g, 24, 66, 40, performance.now() / 1000);
  g.restore();
  g.strokeStyle = '#e0b030'; g.lineWidth = 2.5; g.beginPath(); g.arc(23, 51, 14, 0, Math.PI * 2); g.stroke();
  g.font = '11px "Lilita One", sans-serif'; g.fillStyle = '#e0d4ff'; g.textAlign = 'left'; g.fillText(`Lv ${L.level}`, 38 + xb + 4, 51); g.textAlign = 'center';
  }
  // 🔗 Kombo-Leiste: jede ausgelöste Kombo lädt sie, voll = Kombo-Ausbruch
  if (N.kombosAn?.size || N.komboLadung || N.ausbruch) {
    const kl = N.ausbruch ? 1 : Math.min(1, (N.komboLadung || 0) / KOMBO_LADUNG), voll = N.ausbruch;
    g.fillStyle = 'rgba(8,16,40,.82)'; g.beginPath(); g.roundRect(8, 66, xb + 74, 18, 9); g.fill();
    malSprite(g, '🔗', 23, 75, 12);
    g.font = '10px "Lilita One", sans-serif'; g.fillStyle = '#ffb0e8'; g.textAlign = 'left'; g.fillText(voll ? 'Ausbruch!' : 'Kombo', 38 + xb + 4, 76); g.textAlign = 'center';
    g.fillStyle = '#3a1a3e'; g.beginPath(); g.roundRect(38, 71, xb, 8, 4); g.fill();
    g.fillStyle = voll ? `rgba(255, ${180 + 60 * Math.sin(performance.now() / 90)}, 240, 1)` : '#ff6fd0';
    g.beginPath(); g.roundRect(38, 71, Math.max(0, xb * kl), 8, 4); g.fill();
  }
  // übrig = alles, was noch kommt (auch spätere Wellen), plus alles auf dem Feld
  const rest = N.spawns.length - N.si + N.feinde.length + N.wellen.slice(N.welle + 1).reduce((s, w) => s + w.length, 0);
  const vor = `${N.raffer && !N.stand ? '⏩  ' : ''}${N.stand ? '⏸  ' : ''}`;
  g.font = `16px "Lilita One", ${EMOJI_FONT}`;
  let txt = `${vor}🌙 Nacht ${N.n}  ·  Welle ${N.welle + 1}/${N.wellen.length}  ·  👾 ${rest}`, tw = g.measureText(txt).width + 24;
  // Schmaler Bildschirm: kürzer schreiben; passt es neben Mauer- und XP-Leiste immer noch nicht, rutscht alles darunter
  const links = bw + 60;
  if (kompakt || W - tw - 8 < links) { txt = `${vor}🌙 ${N.n} · ${N.welle + 1}/${N.wellen.length} · 👾 ${rest}`; tw = g.measureText(txt).width + 24; }
  if (kompakt && W - tw - 8 < links) { g.font = `13px "Lilita One", ${EMOJI_FONT}`; tw = g.measureText(txt).width + 18; }
  const y0 = !kompakt && W - tw - 8 < links ? 66 : 8;
  g.fillStyle = 'rgba(8,16,40,.82)'; g.beginPath(); g.roundRect(W - tw - 8, y0, tw, 28, 14); g.fill();
  g.fillStyle = '#fff'; g.fillText(txt, W - tw / 2 - 8, y0 + 15);
  // 🎌 Wellenleiste: wie viel von dieser Welle schon aus dem Portal kam; am Ende der letzten Welle wartet der Anführer
  const anteil = N.spawns.length ? Math.min(1, N.si / N.spawns.length) : 1, lx = W - tw - 8 + 14, lb = tw - 28 - (N.welle === N.wellen.length - 1 ? 14 : 0);
  g.fillStyle = 'rgba(8,16,40,.82)'; g.beginPath(); g.roundRect(lx - 4, y0 + 30, lb + 8 + (N.welle === N.wellen.length - 1 ? 14 : 0), 12, 6); g.fill();
  g.fillStyle = '#3a2a5a'; g.beginPath(); g.roundRect(lx, y0 + 33, lb, 6, 3); g.fill();
  g.fillStyle = '#c9a0ff'; g.beginPath(); g.roundRect(lx, y0 + 33, Math.max(0, lb * anteil), 6, 3); g.fill();
  if (N.welle === N.wellen.length - 1) malSprite(g, '👑', lx + lb + 9, y0 + 36, 12);
  // Abklingzeiten: Kreise mit Uhr-Füllung, bereit = leuchtet gold
  if (!kompakt) N.zauber.forEach((z, i) => {
    const x = W - 26 - (N.zauber.length - 1 - i) * 38, y = y0 + 64, R = 15, cd = zauberCd(N.T, z.name), rest = Math.max(0, z.t);
    g.fillStyle = 'rgba(8,16,40,.85)'; g.beginPath(); g.arc(x, y, R + 2, 0, Math.PI * 2); g.fill();
    g.globalAlpha = rest > 0 ? 0.45 : 1; malSprite(g, ZAUBER[z.name].ico, x, y, 17); g.globalAlpha = 1;
    if (rest > 0) {
      g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, R, -Math.PI / 2, -Math.PI / 2 + (rest / cd) * Math.PI * 2); g.closePath(); g.fill();
      g.font = '11px "Lilita One", sans-serif'; g.fillStyle = '#fff'; g.fillText(Math.ceil(rest), x, y + R + 8);
    } else { g.strokeStyle = '#ffd84a'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, R + 1, 0, Math.PI * 2); g.stroke(); }
  });
}

// --- 🌙 Licht der Nacht: eine Dunkel-Maske mit „Löchern“ (destination-out) für jede Lichtquelle, darüber farbiges Glühen (lighter) ---
let LICHT_CV = null;
function nachtLicht(g, k, px, W, H, jetzt, N, tuerme) {
  const dpr = window.devicePixelRatio || 1, R = 24;   // Rand, damit beim Wackeln nichts hell aufblitzt
  if (!LICHT_CV) LICHT_CV = document.createElement('canvas');
  const cw = Math.round((W + 2 * R) * dpr), ch = Math.round((H + 2 * R) * dpr);
  if (LICHT_CV.width !== cw || LICHT_CV.height !== ch) { LICHT_CV.width = cw; LICHT_CV.height = ch; }
  const lg = LICHT_CV.getContext('2d');
  lg.setTransform(dpr, 0, 0, dpr, R * dpr, R * dpr);
  lg.globalCompositeOperation = 'source-over';
  lg.clearRect(-R, -R, W + 2 * R, H + 2 * R);
  // Himmel: oben links etwas Mondlicht, zum Rand dunkler
  const dunkel = lg.createRadialGradient(W * 0.3, H * 0.15, H * 0.1, W * 0.5, H * 0.5, W * 0.8);
  dunkel.addColorStop(0, 'rgba(14, 22, 64, .52)'); dunkel.addColorStop(1, 'rgba(4, 6, 28, .8)');
  lg.fillStyle = dunkel; lg.fillRect(-R, -R, W + 2 * R, H + 2 * R);
  // Lichtquellen sammeln: [x, y, Radius in Pixeln, Stärke 0..1, Farbe 'r,g,b' oder null]
  const L = [], fl = (s) => 0.88 + 0.12 * Math.sin(jetzt * 13 + s) + 0.05 * Math.sin(jetzt * 31 + s * 2);
  for (const fy of [2.6, 7.4]) L.push([MAUER_X * k, fy * k, k * 2.6 * fl(fy), 0.95, '255,170,80']);   // Fackeln
  L.push([px(HELD.x), px(HELD.y), k * 3.2, 1, '170,130,255']);                                        // Held auf dem Torturm
  L.push([px(BURG.tor.x), px(BURG.y), k * 2.2, 0.7, '255,190,110']);                                // Tor
  for (const p of PORTALE) if (portalOffen(p, N.n)) L.push([px(p.weg[0][0]), px(p.weg[0][1]), k * 2.2, 0.75, '200,110,255']);
  for (const tw of tuerme) {
    const c = { eis: '150,225,255', blitz: '190,160,255', kanone: '255,170,90', wind: '200,255,220' }[tw.art] || '255,200,120';
    L.push([px(tw.x), px(tw.y) - k * 0.3, k * (tw.art === 'eis' || tw.art === 'blitz' ? 1.7 : 1.25), 0.6, c]);
  }
  for (const f of N.feuer) L.push([px(f.x), px(f.y), f.r * k * 1.9, f.art === 'nebel' ? 0.2 : 0.8, f.art === 'eis' ? '170,230,255' : f.art === 'nebel' ? null : '255,140,50']);
  for (const e of N.feinde) {
    if (e.g === 'geist') L.push([px(e.x), px(e.y), k * 1.0, 0.45, '210,200,255']);
    if (e.brand > 0) L.push([px(e.x), px(e.y), k * 0.9, 0.5, '255,140,50']);
  }
  // Zauber und Einschläge leuchten (je nach Fortschritt des Effekts)
  for (const f of N.fx) {
    const kk = f.dauer ? 1 - f.t / f.dauer : 0, aus = Math.max(0, 1 - kk);
    if (f.typ === 'feuerball') {
      if (kk < 0.38) { const p = kk / 0.38; L.push([px(f.x1 + (f.x2 - f.x1) * p), px(f.y1 + (f.y2 - f.y1) * p) - Math.sin(p * Math.PI) * k * 1.6, k * 2.0, 1, '255,150,60']); }
      else L.push([px(f.x2), px(f.y2), f.r * k * 3.2 * (1.2 - kk), Math.min(1, aus * 1.6), '255,140,50']);
    } else if (f.typ === 'boom' || f.typ === 'staub') L.push([px(f.x), px(f.y), (f.r || 1) * k * 2.6, aus, f.farbe || '255,160,70']);
    else if (f.typ === 'frostring') L.push([px(f.x), px(f.y), f.r * k * 2.0, aus * 0.9, f.farbe || '160,225,255']);
    else if (f.typ === 'blitz') for (const q of f.punkte) L.push([px(q.x), px(q.y), k * (f.dick ? 2.2 : 1.3), aus, f.eis ? '150,220,255' : '190,160,255']);
    else if (f.typ === 'ausbruch') L.push([px(f.x), px(f.y), f.r * k * 3.2, Math.min(1, aus * 1.5), '255,190,240']);
    else if (f.typ === 'magie' || f.typ === 'eis') {
      const p = Math.min(1, kk * 1.1); L.push([px(f.x1 + (f.x2 - f.x1) * p), px(f.y1 + (f.y2 - f.y1) * p), k * 0.9, 0.7, f.typ === 'eis' ? '170,230,255' : '200,170,255']);
    } else if (f.typ === 'wolke' && kk > 0.35 && kk < 0.6) L.push([px(f.x), px(f.y), k * 3.5, 1, '220,210,255']);
    else if (f.typ === 'flug') { const p = Math.min(1, kk); L.push([px(f.x1 + (f.x2 - f.x1) * p), px(f.y1 + (f.y2 - f.y1) * p), k * 1.5, 0.8, '255,190,120']); }
    else if (f.typ === 'glocke') L.push([px(f.x), px(f.y), f.r * k * kk, aus * 0.5, '255,220,140']);
    else if (f.typ === 'licht') L.push([W / 2, H / 2, W, aus * 0.8, null]);
  }
  if (N.schild > 0) L.push([W, H / 2, H * 0.6, 0.5, '140,210,255']);
  // Löcher in die Dunkelheit
  lg.globalCompositeOperation = 'destination-out';
  for (const [x, y, r, s] of L) {
    if (r < 1 || s <= 0) continue;
    const gr = lg.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(0,0,0,${s})`); gr.addColorStop(0.5, `rgba(0,0,0,${s * 0.55})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    lg.fillStyle = gr; lg.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.drawImage(LICHT_CV, -R, -R, W + 2 * R, H + 2 * R);
  // farbiges Glühen obendrauf
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [x, y, r, s, c] of L) {
    if (!c || r < 1 || s <= 0) continue;
    const gr = g.createRadialGradient(x, y, 0, x, y, r * 0.8);
    gr.addColorStop(0, `rgba(${c},${0.22 * s})`); gr.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.restore();
}

function zeichneNacht(cv, N, opt = {}) {
  const n = N ? N.n : P.nacht, { g, k, W, H } = nachtGroesse(cv), jetzt = performance.now() / 1000;
  const px = (v) => v * k + k / 2;
  // Zeit seit dem letzten Bild (für Partikel); neue Nacht = alles Alte weg
  // opt.mini = kleine Vorschau (Turmblatt): lässt Uhr, Partikel und Flecken des großen Felds in Ruhe
  const dt = opt.mini ? 0 : Math.min(0.1, bildZeit ? jetzt - bildZeit : 0) * (N ? nachtTempo : 1);
  if (!opt.mini) bildZeit = jetzt;
  if (!opt.mini && N !== bildN) { PARTIKEL = []; FLECKEN = []; MOMENTE = []; bildN = N; }
  g.save();
  if (N && N.wackeln > 0) g.translate(Math.sin(jetzt * 90) * N.wackeln * 14, Math.cos(jetzt * 70) * N.wackeln * 8);
  // Steht die Nacht (Pause, Blatt offen), klingt das Wackeln trotzdem ab – sonst wackelt z. B. ein Level-up ewig
  if (N && N.stand && N.wackeln > 0) N.wackeln = Math.max(0, N.wackeln - Math.max(dt, 0.016));
  // Hintergrund (Gras, Wege, Bäume, Mauer) liegt fertig gemalt bereit (figuren.js: bodenBild) – nur kopieren
  const wege = (gg, pxx) => {
    gg.lineCap = 'round'; gg.lineJoin = 'round';
    for (const [breite, farbe] of [[0.9, '#3e2c1a'], [0.76, '#7e5e3a'], [0.62, '#a3825a'], [0.08, 'rgba(255, 235, 190, .2)']]) {
      for (const p of PORTALE) {
        if (!portalOffen(p, n)) continue;
        gg.strokeStyle = farbe; gg.lineWidth = k * breite;
        gg.beginPath(); p.weg.forEach(([x, y], i) => (i ? gg.lineTo(pxx(x), pxx(y)) : gg.moveTo(pxx(x), pxx(y)))); gg.stroke();
      }
    }
    // Kiesel, Fahrspuren, Randsteine und Grasbüschel am Wegrand (alles nur einmal gemalt, liegt im Hintergrundbild)
    PORTALE.filter((p) => portalOffen(p, n)).forEach((p, pi) => p.weg.forEach(([x, y], i) => {
      if (!i) return;
      const [ax, ay] = p.weg[i - 1], l = Math.hypot(x - ax, y - ay), nx = -(y - ay) / l, ny = (x - ax) / l;
      const auf = (q, quer) => [pxx(ax + (x - ax) * q + nx * quer), pxx(ay + (y - ay) * q + ny * quer)];
      // zwei ausgefahrene Spuren
      gg.strokeStyle = 'rgba(90, 64, 38, .35)'; gg.lineWidth = k * 0.07;
      for (const quer of [-0.14, 0.14]) { gg.beginPath(); gg.moveTo(...auf(0, quer)); gg.lineTo(...auf(1, quer)); gg.stroke(); }
      for (let j = 0; j < 14; j++) { const q = rausch(pi * 97 + i * 13 + j); const [cx, cy] = auf(q, (rausch(j + i * 7) - 0.5) * 0.55); FZ.kreis(gg, cx, cy, 1 + rausch(j + 50) * 1.6, rausch(j + 70) > 0.5 ? 'rgba(70,50,30,.45)' : 'rgba(200,175,130,.35)'); }
      // Randsteine links und rechts, jeder etwas anders
      const nr = Math.ceil(l * 3.2);
      for (let j = 0; j <= nr; j++) for (const s of [-1, 1]) {
        const v = rausch(pi * 31 + i * 17 + j * 3 + (s > 0 ? 1 : 0));
        if (v < 0.25 || Math.min(j / nr, 1 - j / nr) * l < 0.5) continue;   // an den Ecken nicht (dort läge er sonst auf dem Weg)
        const [cx, cy] = auf(j / nr, s * (0.43 + v * 0.05));
        const r = k * (0.06 + v * 0.05), hell = 120 + Math.round(v * 50);
        FZ.ell(gg, cx + 1, cy + 1.5, r * 1.2, r * 0.8, 'rgba(0,0,0,.3)');
        FZ.ell(gg, cx, cy, r * 1.2, r * 0.85, `rgb(${hell},${hell - 6},${hell - 18})`, v * 3);
        FZ.ell(gg, cx - r * 0.3, cy - r * 0.3, r * 0.5, r * 0.3, 'rgba(255,255,240,.25)', v * 3);
      }
      // Grasbüschel, die über den Rand wachsen
      for (let j = 0; j < Math.ceil(l * 2); j++) for (const s of [-1, 1]) {
        const v = rausch(pi * 53 + i * 29 + j * 5 + (s > 0 ? 2 : 0));
        const q = rausch(j * 7 + i + s);
        if (v < 0.45 || Math.min(q, 1 - q) * l < 0.55) continue;
        const [cx, cy] = auf(q, s * 0.52);
        gg.strokeStyle = v > 0.7 ? '#4f8a3e' : '#3a6e30'; gg.lineWidth = 1.4;
        for (let h = -2; h <= 2; h++) { gg.beginPath(); gg.moveTo(cx + h * 1.5, cy + 2); gg.quadraticCurveTo(cx + h * 2.2, cy - 3, cx + h * 3 + s, cy - 6 - v * 3); gg.stroke(); }
      }
    }));
  };
  g.fillStyle = '#2a5a2c'; g.fillRect(-40, -40, W + 80, H + 80);   // auch den Rand füllen, der beim Wackeln frei wird
  if (W >= 1 && H >= 1) g.drawImage(bodenBild(W, H, k, n, zeichneMauer, wege), 0, 0, W, H);   // unsichtbares Feld (Breite 0): nichts kopieren
  // Neuer Weg (abends): lila pulsieren
  for (const p of PORTALE) {
    if (N || p.ab !== n || n <= 1 || !portalOffen(p, n)) continue;
    g.strokeStyle = `rgba(200, 120, 255, ${0.3 + 0.25 * Math.sin(jetzt * 5)})`; g.lineWidth = k * 0.76; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); p.weg.forEach(([x, y], i) => (i ? g.lineTo(px(x), px(y)) : g.moveTo(px(x), px(y)))); g.stroke();
  }
  for (const p of PORTALE) if (portalOffen(p, n)) zeichnePortal(g, k, px(p.weg[0][0]), px(p.weg[0][1]), jetzt, !N && p.ab === n && n > 1);
  malFackeln(g, k, H, jetzt);
  zeichneBaulandNebel(g, k, px, W, H, jetzt, !N || opt.bauen);
  if (!opt.mini) zeichneFlecken(g, k, px, dt);
  // Felder am Boden: brennender Boden, Schnee, Nebel, Dampf
  const FELD_ART = { eis: ['220, 245, 255', '180, 230, 255', '❄️'], nebel: ['200, 190, 230', '140, 110, 200', '🌫️'], dampf: ['255, 255, 255', '255, 180, 140', '♨️'], lava: ['255, 120, 40', '180, 40, 10', '🌋'] };
  if (N) for (const f of N.feuer) {
    const [innen, aussen, ico] = FELD_ART[f.art] || [`255, ${160 + 40 * Math.sin(jetzt * 12 + f.x)}, 60`, '255, 90, 20', '🔥'];
    const gr = g.createRadialGradient(px(f.x), px(f.y), 0, px(f.x), px(f.y), f.r * k);
    gr.addColorStop(0, `rgba(${innen}, .55)`); gr.addColorStop(1, `rgba(${aussen}, 0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(px(f.x), px(f.y), f.r * k, 0, Math.PI * 2); g.fill();
    malSprite(g, ico, px(f.x), px(f.y) - Math.abs(Math.sin(jetzt * 9 + f.x)) * 3, k * 0.4);
  }
  // Bauplätze und Türme
  // in der Pause zählt der Spielstand (dort wird gerade gebaut), sonst die Türme der laufenden Nacht
  const tuerme = (N && !opt.bauen ? N.tuerme.filter((t) => !t.burg) : Object.entries(P.tuerme).map(([s, tw]) => ({ slot: +s, ...tw })))
    .sort((p, q) => p.y - q.y);   // weiter unten = weiter vorn
  const a = k * 0.5;
  // 🎯 Reichweite als Kreis (bei Ausbau alt gestrichelt, neu durchgezogen); rot = hier darf man nicht bauen
  const reichKreis = (x, y, vs, rot) => {
    const kreis = (r, strich, fuell) => { g.fillStyle = fuell; g.beginPath(); g.arc(x, y, r * k, 0, Math.PI * 2); g.fill(); g.strokeStyle = strich; g.lineWidth = 2.5; g.stroke(); };
    if (vs.alt && vs.alt !== vs.reich) { g.setLineDash([6, 6]); kreis(vs.alt, 'rgba(255,255,255,.6)', 'rgba(0,0,0,0)'); g.setLineDash([]); }
    kreis(vs.reich, rot ? 'rgba(255, 110, 110, .9)' : 'rgba(255, 216, 74, .95)', rot ? 'rgba(255, 80, 80, .12)' : 'rgba(255, 216, 74, .14)');
    if (vs.mindest && !rot) { g.setLineDash([4, 4]); kreis(vs.mindest, 'rgba(255,120,120,.8)', 'rgba(255,80,80,.12)'); g.setLineDash([]); }
  };
  // 📍 Neuer Turm (opt.plan auf dem Spielfeld, opt.vorschau mit slot 'neu' im Turmblatt): Geisterturm mit Reichweite.
  // Beim Platzieren zeigen zarte rote Kreise die „Hitbox“ der anderen Türme.
  const plan = opt.vorschau?.slot === 'neu' ? { ...opt.vorschau } : opt.plan;
  if (plan) {
    if (!opt.mini) for (const t of tuerme) { g.fillStyle = 'rgba(255, 90, 90, .13)'; g.beginPath(); g.arc(px(t.x), px(t.y), TURM_ABSTAND * k, 0, Math.PI * 2); g.fill(); }
    reichKreis(px(plan.x), px(plan.y), plan, plan.grund);
  }
  // Geisterturm erst nach den echten Türmen malen, damit er vorn liegt
  const geist = () => {
    const x = px(plan.x), y = px(plan.y);
    malBauplatz(g, x, y + a * 0.2, a, false, false, !plan.grund, jetzt);
    g.globalAlpha = plan.grund ? 0.45 : 0.7; malTurm(g, plan.art, 1, x, y + a * 0.2, a, jetzt, false, []); g.globalAlpha = 1;
    if (plan.grund) malSprite(g, '🚫', x, y - a * 0.4, k * 0.55);
  };
  tuerme.forEach((tw) => {
    const i = tw.slot, sel = opt.sel === i, x = px(tw.x), y = px(tw.y);
    const vs = opt.vorschau && opt.vorschau.slot === i ? opt.vorschau : null;
    if (vs) reichKreis(x, y, vs);   // 🎯 Vorschau im Turmblatt
    malBauplatz(g, x, y + a * 0.2, a, false, false, false, jetzt);
    if (sel && !vs) {
      const reich = turmWerteAus(tw.art, tw.wahl, tw.vet).reich * k;
      g.fillStyle = 'rgba(255, 216, 74, .08)'; g.beginPath(); g.arc(x, y, reich, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255, 216, 74, .8)'; g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath(); g.arc(x, y, reich, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    }
    // Turm: Sockel mit Schatten, farbiger Block, Zinnen, Symbol
    const schuss = N && !opt.bauen && tw.cd > turmWerte(tw).takt - 0.12;   // gerade geschossen: kurz hüpfen
    const hy = y;
    if (sel) { g.strokeStyle = '#ffd84a'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y + a * 1.05, a * 1.3, a * 0.44, 0, 0, Math.PI * 2); g.stroke(); }
    // 🔨 Gerade gebaut oder ausgebaut: der Turm wächst aus dem Boden, Staub wirbelt (TURM_BAU in karte.js)
    const bau = TURM_BAU[i] && !opt.mini ? (performance.now() / 1000 - TURM_BAU[i]) / 0.7 : 1;   // die kleine Vorschau malt nur einmal – dort fertig zeigen
    if (bau < 1) {
      g.save(); g.beginPath(); g.rect(x - a * 2.5, y - a * 4, a * 5, a * 5.05); g.clip();
      mitUmriss(g, () => malTurm(g, tw.art, turmStufe(tw), x, y + a * 0.2 + (1 - bau) * (1 - bau) * a * 2.6, a, jetzt, false, tw.wahl));
      g.restore();
      for (let j = 0; j < 7; j++) { const w = (j / 7) * Math.PI * 2; FZ.kreis(g, x + Math.cos(w) * a * (0.8 + bau), y + a * 1.0 + Math.sin(w) * a * 0.3 * (1 + bau), a * (0.25 + bau * 0.2), `rgba(210,190,150,${0.6 * (1 - bau)})`); }
    } else mitUmriss(g, () => malTurm(g, tw.art, turmStufe(tw), x, y + a * 0.2, a, jetzt, schuss, tw.wahl));   // gezeichnet (figuren.js)
    // 🐉 Vom Feueratem getroffen: verkohlt, Rauch steigt auf, schießt nicht
    const nt = N?.tuerme?.find((t) => t.slot === tw.slot && !t.burg);
    if (nt?.verkohlt > 0 && !opt.mini) {
      g.fillStyle = 'rgba(20,10,5,.45)'; g.beginPath(); g.arc(x, y, a * 1.1, 0, Math.PI * 2); g.fill();
      malSprite(g, '💨', x + Math.sin(jetzt * 3) * a * 0.2, y - a * 1.4 - (jetzt * 0.6 % 1) * a * 0.5, a * 0.7);
    }
    // ⬆️ Abends (und in der Pause): Der nächste Ausbau ist bezahlbar – kleines goldenes Zeichen über dem Turm
    if ((!N || opt.bauen) && !opt.mini && ausbauOffen() && (turmStufe(tw) < MAX_STUFE ? P.gold >= ausbauPreis(tw.art, turmStufe(tw))
      : (tw.vet || 0) < VETERAN_MAX && P.gold >= veteranPreis(tw.art, tw.vet || 0))) {   // 🎖️ auch: Veteran bezahlbar
      const ux = x + a * 0.95, uy = y - a * 1.55 - Math.abs(Math.sin(jetzt * 3 + i)) * a * 0.12;
      g.fillStyle = '#ffd84a'; g.strokeStyle = '#8a6200'; g.lineWidth = 2;
      g.beginPath(); g.arc(ux, uy, a * 0.32, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#2a1a00'; g.beginPath(); g.moveTo(ux, uy - a * 0.2); g.lineTo(ux + a * 0.16, uy + a * 0.02); g.lineTo(ux + a * 0.06, uy + a * 0.02);
      g.lineTo(ux + a * 0.06, uy + a * 0.18); g.lineTo(ux - a * 0.06, uy + a * 0.18); g.lineTo(ux - a * 0.06, uy + a * 0.02); g.lineTo(ux - a * 0.16, uy + a * 0.02); g.closePath(); g.fill();
    }
    // Gewählte Ausbauten als kleine Punkte vorn auf der Platte
    tw.wahl.forEach((w, j) => {
      g.fillStyle = w === 'a' ? '#ffd84a' : '#5fe0d0'; g.strokeStyle = '#1a1020'; g.lineWidth = 1;
      g.beginPath(); g.arc(x + (j - (tw.wahl.length - 1) / 2) * a * 0.3, hy + a * 1.12, k * 0.06, 0, Math.PI * 2); g.fill(); g.stroke();
    });
    // 🎖️ Veteranen-Abzeichen: kleines goldenes Schild mit der Zahl links unten am Turm
    if (tw.vet && !opt.mini) {
      const vx = x - a * 1.0, vy = hy + a * 0.75, r = a * 0.3;
      g.fillStyle = '#ffd84a'; g.strokeStyle = '#6a4a00'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(vx - r, vy - r); g.lineTo(vx + r, vy - r); g.lineTo(vx + r, vy + r * 0.2); g.lineTo(vx, vy + r * 1.1); g.lineTo(vx - r, vy + r * 0.2); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#3a2400'; g.font = `bold ${Math.round(r * 1.2)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(String(tw.vet), vx, vy - r * 0.1);
    }
  });
  if (plan) geist();
  // Held auf der Mauer, Uralter Baum daneben
  const held = N ? N.held : null, gross = held && held.anim > 0 ? 1.1 : 1;
  malHeldenturmGlanz(g, px(HELD.x), px(HELD.y), k, jetzt);
  mitUmriss(g, () => malHeld(g, px(HELD.x), px(HELD.y), k * 1.3 * gross, jetzt, gross > 1));   // gezeichnete Figur (figuren.js)
  // 👥 Schattenklon neben dem Helden: durchsichtig und lila
  if (N ? N.T.klon : talentWerte().klon) malHeld(g, px(HELD.x + 0.35), px(HELD.y + 0.5), k * 0.75, jetzt + 1, false, true);
  if (N ? N.T.baum : talentWerte().baum) malSprite(g, '🌳', px(BURG.x - 1.3), px(BURG.y + 1.5), k * 1.05);
  // 🦉 Wächtereule (Wunder): kreist über der Burg
  if (N ? N.T.drachling : schatzSumme('drachling')) malSprite(g, '🐲', px(BURG.x - 1 + Math.sin(jetzt * 1.3) * 0.4), px(BURG.y + 2 + Math.cos(jetzt * 1.1) * 0.3), k * 0.65, false);
  if (N ? N.T.eule : talentHat('eule') || schatzSumme('eule')) malSprite(g, '🦉', px(BURG.x - 1 + Math.cos(jetzt * 0.9) * 0.6), px(BURG.y - 2 + Math.sin(jetzt * 0.9) * 0.35), k * 0.6);
  if (!N || opt.mini) { zeichnePortalNebel(g, k, px, jetzt); g.restore(); return; }
  // 🌙 Nachtstimmung mit echtem Licht (2026-11-13, Nutzerwunsch „auf Hochglanz“): dunkle Nacht, Lichtinseln an Fackeln,
  // Held, Türmen, Portalen, brennendem Boden – und jeder Zauber erhellt beim Einschlag die Umgebung (nachtLicht)
  nachtLicht(g, k, px, W, H, jetzt, N, tuerme);
  // Gegner (von oben nach unten, damit vordere vorne stehen)
  for (const e of N.feinde.slice().sort((a, b) => (GEGNER[a.g].fliegt ? 99 : 0) + a.y - (GEGNER[b.g].fliegt ? 99 : 0) - b.y)) {   // 🦇 Flieger über allen anderen
    // dicke Bosse: Drache, Troll und Anführer deutlich größer (Nutzerwunsch)
    const gg = GEGNER[e.g], s = k * (gg.gross || (e.g === 'drache' ? 1.45 : e.g === 'troll' ? 1.0 : 0.6)) * (e.chef ? 2.1 : 1), x = px(e.x);
    // 🦇 Flieger schweben hoch über ihrem Schatten; liegen sie am Boden (betäubt, eingefroren, weggepustet), sinken sie herab
    const hoehe = gg.fliegt ? (amBoden(e) ? 0 : k * (0.55 + Math.sin(jetzt * 2.5 + e.id) * 0.08)) : 0, y = px(e.y) - hoehe;
    const hupf = e.stun > 0 || gg.fliegt ? 0 : Math.abs(Math.sin(jetzt * 8 + e.id)) * k * 0.07;
    g.fillStyle = gg.fliegt && hoehe ? 'rgba(0,0,0,.2)' : 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x, y + hoehe + s * 0.42, s * (hoehe ? 0.3 : 0.42), s * (hoehe ? 0.09 : 0.13), 0, 0, Math.PI * 2); g.fill();
    if (e.stun > 0 && e.eis) { g.fillStyle = 'rgba(180,240,255,.65)'; g.beginPath(); g.arc(x, y, s * 0.62, 0, Math.PI * 2); g.fill(); }
    else if (e.bremse > 0) { g.fillStyle = 'rgba(120,200,255,.35)'; g.beginPath(); g.arc(x, y, s * 0.56, 0, Math.PI * 2); g.fill(); }
    if (e.fluch > 0) { g.strokeStyle = 'rgba(190, 120, 255, .8)'; g.lineWidth = 2; g.setLineDash([3, 3]); g.beginPath(); g.arc(x, y, s * 0.5, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }
    if (e.gift > 0) { g.fillStyle = 'rgba(150,230,70,.35)'; g.beginPath(); g.arc(x, y, s * 0.5, 0, Math.PI * 2); g.fill(); }
    if (e.stun > 0 && !e.eis) { g.fillStyle = 'rgba(190,160,255,.4)'; g.beginPath(); g.arc(x, y, s * 0.58, 0, Math.PI * 2); g.fill(); }
    let gemalt = false;
    // 👑 Boss-Eigenheiten (nacht.js BOSS_ART) sichtbar: Nebelgestalt halb durchsichtig, Luftholen glüht, Schildwall, Rasen
    if (e.atem > 0) { const gl = g.createRadialGradient(x, y, 0, x, y, s * 0.9); gl.addColorStop(0, `rgba(255,140,40,${0.35 + 0.25 * Math.sin(jetzt * 14)})`); gl.addColorStop(1, 'rgba(255,140,40,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x, y, s * 0.9, 0, Math.PI * 2); g.fill(); }
    if (e.nebel > 0) g.globalAlpha = 0.35;
    mitUmriss(g, () => { gemalt = malGegner(g, e.g, x, y - hupf, s, jetzt, e.rechts !== false, e.id); });   // gezeichnet mit Umriss (figuren.js)
    if (!gemalt) malSprite(g, gg.ico, x, y - hupf, s, e.rechts);
    g.globalAlpha = 1;
    if (e.schildwall > 0) { g.strokeStyle = 'rgba(160,210,255,.9)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, s * 0.6, Math.PI * 0.6, Math.PI * 1.4); g.stroke(); malSprite(g, '🛡️', x - s * 0.55, y, k * 0.4); }
    if (e.atem > 0) malSprite(g, '🔥', x + s * 0.45, y - s * 0.25, k * (0.3 + 0.1 * Math.sin(jetzt * 12)));
    if (e.rasend > 0) malSprite(g, '💢', x + s * 0.4, y - s * 0.5, k * 0.24);
    if (e.getroffen > 0) {   // Treffer: kurz weiß aufblitzen
      g.fillStyle = `rgba(255, 255, 255, ${e.getroffen * 4})`; g.beginPath(); g.arc(x, y - hupf, s * 0.42, 0, Math.PI * 2); g.fill();
    }
    if (e.stun > 0 && !e.eis) malSprite(g, e.wurzel > 0 ? '🪢' : '💫', x + Math.cos(jetzt * 9) * s * 0.3, y - s * 0.6, k * 0.3);
    if (gg.boss || e.chef) malSprite(g, '👑', x, y - s * 0.72, k * 0.32);
    if (e.markiert) malSprite(g, '🎯', x - s * 0.42, y - s * 0.5, k * 0.22);   // 🔭 vom Späher erkannt
    if (e.turmschild) {
      // 🛡️ Turmschild: schimmernder Sechseck-Ring um das Monster, kleines Schild-Zeichen rechts oben
      const r = s * 0.58, a0 = jetzt * 0.8;
      g.strokeStyle = `rgba(150, 220, 255, ${0.55 + 0.25 * Math.sin(jetzt * 4 + e.id)})`; g.lineWidth = 2.5;
      g.beginPath(); for (let j = 0; j <= 6; j++) { const w = a0 + (j / 6) * Math.PI * 2; g[j ? 'lineTo' : 'moveTo'](x + Math.cos(w) * r, y - hupf + Math.sin(w) * r); } g.stroke();
      malSprite(g, '🛡️', x + s * 0.42, y - s * 0.5, k * 0.24);
    }
    if (e.brand > 0) malSprite(g, '🔥', x + s * 0.25, y - s * 0.2 - Math.abs(Math.sin(jetzt * 10 + e.id)) * 3, k * 0.24);
    const bw = Math.max(k * 0.6, s * 0.9), r = Math.max(0, e.hp / e.max), by = y - s * 0.62 - 6;
    g.fillStyle = '#1b0f14'; g.fillRect(x - bw / 2 - 1, by, bw + 2, 6);
    g.fillStyle = farbe(r > 0.5 ? 'gut' : r > 0.25 ? 'mittel' : 'schlecht'); g.fillRect(x - bw / 2, by + 1, bw * r, 4);
  }
  zeichnePortalNebel(g, k, px, jetzt);   // über den Monstern: wer im Nebel steckt, ist halb verdeckt (Türme treffen ihn nicht)
  // 🛡️ Torwache: Soldaten mit Schild, Lebensbalken; im Kampf wippen sie zum Schlag
  for (const s of N.soldaten) {
    const x = px(s.x), y = px(s.y);
    // Erschöpfter Soldat: ruht sich am Posten aus, bis er wieder aufsteht
    if (s.tot > 0) { g.globalAlpha = 0.45; malSprite(g, '💤', px(s.px), px(s.py), k * 0.42); g.globalAlpha = 1; continue; }
    const kampf = s.ziel && Math.hypot(s.ziel.x - s.x, s.ziel.y - s.y) < 0.5, hieb = kampf ? Math.sin(jetzt * 14 + s.id) * k * 0.06 : 0;
    malSoldat(g, x, y, k * 0.55, jetzt, hieb, s.ziel ? s.ziel.x < s.x : true);   // gezeichnet (figuren.js)
    const r = Math.max(0, s.hp / s.max), bw = k * 0.5;
    g.fillStyle = '#10203a'; g.fillRect(x - bw / 2 - 1, y - k * 0.45, bw + 2, 5);
    g.fillStyle = '#6ec6ff'; g.fillRect(x - bw / 2, y - k * 0.45 + 1, bw * r, 3);
  }
  // 👑 Turm-Fähigkeit bereit (von Hand): pulsierender Knopf über dem Turm
  for (const tw of N.tuerme) {
    const art = turmFaehigArt(tw);
    if (!art || tw.uhr > 0 || autoAn(N, 't' + tw.slot)) continue;
    const x = px(tw.x), y = px(tw.y - 0.95), puls = 1 + 0.1 * Math.sin(jetzt * 8);
    g.fillStyle = 'rgba(255, 216, 74, .9)'; g.strokeStyle = '#8a6200'; g.lineWidth = 3;
    g.beginPath(); g.arc(x, y, k * 0.38 * puls, 0, Math.PI * 2); g.fill(); g.stroke();
    malSprite(g, TURM_FAEHIG[art][0], x, y, k * 0.4);
  }
  $('#nachtCanvas').classList.toggle('zielt', !!ZIELEN);
  // 🎯 Beim Zielen: so weit reicht der Zauber des Helden
  if (ZIELEN) {
    const R = (ZAUBER[ZIELEN].reich + (N.T?.zauber_reich || 0)) * k;
    g.fillStyle = 'rgba(255, 216, 74, .07)'; g.beginPath(); g.arc(px(HELD.x), px(HELD.y), R, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255, 216, 74, .85)'; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.arc(px(HELD.x), px(HELD.y), R, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  }
  // ✨ Kombo-Funke: pulsierender Stern mit Ring, der abläuft – antippen!
  if (N.funke) {
    const f = N.funke, x = px(f.x), y = px(f.y), puls = 1 + 0.12 * Math.sin(jetzt * 10), rest = Math.max(0, f.t / f.max);
    const gr = g.createRadialGradient(x, y, 0, x, y, k * 1.1);
    gr.addColorStop(0, 'rgba(255, 220, 255, .85)'); gr.addColorStop(0.5, 'rgba(255, 110, 220, .45)'); gr.addColorStop(1, 'rgba(255, 110, 220, 0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, k * 1.1 * puls, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#ffd6f4'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, k * 0.75, -Math.PI / 2, -Math.PI / 2 + rest * Math.PI * 2); g.stroke();
    malSprite(g, komboById(f.id).ico, x, y, k * 0.6 * puls);
    g.font = `${Math.round(k * 0.32)}px "Lilita One", sans-serif`; g.textAlign = 'center'; g.fillStyle = '#fff'; g.strokeStyle = '#2a0a30'; g.lineWidth = 4;
    g.strokeText('Tippen!', x, y - k * 0.95); g.fillText('Tippen!', x, y - k * 0.95);
    if (Math.random() < 0.3) funken(f.x, f.y, 1, { v: 1.5, life: 0.5, size: 0.05, farben: ['#ffd6f4', '#ff6fd0', '#ffd84a'] });
  }
  // Effekte, Partikel, große Momente, danach die Anzeige
  // Mehrere Ansagen gleichzeitig (z. B. „Neue Kombo!“ und „Blitzableiter!“): jede bekommt ihre eigene Zeile statt übereinander
  const belegt = new Set(N.fx.filter((f) => f.typ === 'ansage' && !f.banner && f.zeile !== undefined).map((f) => f.zeile));
  for (const f of N.fx) if (f.typ === 'ansage' && !f.banner && f.zeile === undefined) { let z = 0; while (belegt.has(z)) z++; f.zeile = z; belegt.add(z); }
  for (const f of N.fx) zeichneEffekt(g, k, f, px, jetzt, W, H, N);
  zeichnePartikel(g, k, px, dt);
  // 🛡️ Schutzschild über der Mauer, solange er hält
  if (N.schild > 0) {
    const x0 = (MAUER_X - 0.7) * k, a = 0.18 + 0.08 * Math.sin(jetzt * 4);
    const gr = g.createLinearGradient(x0, 0, W, 0);
    gr.addColorStop(0, `rgba(140, 210, 255, ${a + 0.15})`); gr.addColorStop(1, 'rgba(140, 210, 255, 0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(W, H / 2, W - x0, H * 0.62, 0, Math.PI / 2, Math.PI * 1.5); g.fill();
    g.strokeStyle = `rgba(200, 235, 255, ${0.6 + 0.3 * Math.sin(jetzt * 6)})`; g.lineWidth = 3; g.stroke();
  }
  zeichneMomente(g, k, px, W, H, dt, N);
  g.restore();
  // 📱 Schmaler Bildschirm (Nutzerwunsch 2026-11-14): Mauer-, XP- und Wellenbalken in eine eigene Leiste über dem Feld,
  // damit sie das kleine Spielfeld nicht verdecken
  const leiste = !opt.mini && cv.id === 'nachtCanvas' ? document.getElementById('nachtLeiste') : null;
  const kompakt = !!leiste && W < NACHT_KOMPAKT;
  if (leiste) leiste.classList.toggle('hidden', !kompakt);
  if (kompakt) {
    const lh = N.kombosAn?.size || N.komboLadung || N.ausbruch ? 90 : 68, dpr = window.devicePixelRatio || 1;
    if (leiste.width !== Math.round(W * dpr) || leiste.height !== Math.round(lh * dpr)) {
      leiste.width = Math.round(W * dpr); leiste.height = Math.round(lh * dpr); leiste.style.height = lh + 'px'; leiste.style.width = W + 'px';
    }
    const lg = leiste.getContext('2d');
    lg.setTransform(dpr, 0, 0, dpr, 0, 0);
    lg.clearRect(0, 0, W, lh);
    zeichneAnzeige(lg, k, W, N, true);
  } else zeichneAnzeige(g, k, W, N);
}
