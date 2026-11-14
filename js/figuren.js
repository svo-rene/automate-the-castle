'use strict';
// --- 🎨 Gezeichnete Figuren für die Nacht (statt Emoji): Monster, Türme, Held, Torwache ----------------------
// Nutzerwunsch: „richtig hübsch“, selbst gezeichnet (kein Download). Alles mit Canvas-Formen, Verläufen und
// kleinen Bewegungen (Wippen, Flügel, Umhang). Nur Darstellung – nacht.js rechnet. Maße: s = Größe der Figur in Pixeln,
// (x, y) = Mitte der Figur; die Füße stehen bei etwa y + 0.4·s. Figuren schauen nach rechts (zur Burg).

const FZ = {
  rad(g, x, y, r, stops) { const gr = g.createRadialGradient(x, y, 0, x, y, r); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; },
  lin(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; },
  ell(g, x, y, rx, ry, farbe, rot = 0) { g.fillStyle = farbe; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); g.fill(); },
  kreis(g, x, y, r, farbe) { g.fillStyle = farbe; g.beginPath(); g.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2); g.fill(); },
  auge(g, x, y, r, boese = false) {
    FZ.kreis(g, x, y, r, '#fff'); FZ.kreis(g, x + r * 0.25, y, r * 0.55, '#1a1020');
    if (boese) { g.strokeStyle = '#1a1020'; g.lineWidth = Math.max(1, r * 0.5); g.beginPath(); g.moveTo(x - r, y - r * 1.1); g.lineTo(x + r, y - r * 0.4); g.stroke(); }
  },
};

// --- 👾 Monster ---
function malGegner(g, art, x, y, s, t, rechts = true, id = 0) {
  g.save(); g.translate(x, y);
  if (!rechts) g.scale(-1, 1);
  const wipp = Math.sin(t * 9 + id) * s * 0.03, bein = Math.sin(t * 14 + id);
  switch (art) {
    case 'ratte': {
      g.strokeStyle = '#c08080'; g.lineWidth = Math.max(1, s * 0.06); g.lineCap = 'round';
      g.beginPath(); g.moveTo(-s * 0.3, s * 0.1); g.quadraticCurveTo(-s * 0.7, -s * 0.2 + bein * s * 0.08, -s * 0.85, s * 0.15); g.stroke();
      FZ.ell(g, 0, s * 0.05 + wipp, s * 0.4, s * 0.24, FZ.lin(g, 0, -s * 0.2, 0, s * 0.3, [[0, '#9a8e8e'], [1, '#5e5454']]));
      FZ.ell(g, -s * 0.05, -s * 0.08 + wipp, s * 0.25, s * 0.08, 'rgba(255,255,255,.18)');   // Glanz auf dem Fell
      FZ.ell(g, s * 0.35, -s * 0.05 + wipp, s * 0.2, s * 0.16, '#8a7e7e');
      FZ.kreis(g, s * 0.3, -s * 0.2 + wipp, s * 0.09, '#8a7e7e'); FZ.kreis(g, s * 0.3, -s * 0.2 + wipp, s * 0.055, '#e8a0a0');   // Ohr mit Innenseite
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 0.8;   // Schnurrhaare
      for (const d of [-0.04, 0.03]) { g.beginPath(); g.moveTo(s * 0.5, -s * 0.02 + wipp); g.lineTo(s * 0.68, (-0.02 + d * 2) * s + wipp); g.stroke(); }
      FZ.kreis(g, s * 0.53, -s * 0.02 + wipp, s * 0.045, '#ff9aa8');
      FZ.kreis(g, s * 0.42, -s * 0.08 + wipp, s * 0.04, '#1a1020');
      g.strokeStyle = '#5e5454'; g.lineWidth = Math.max(1, s * 0.05);
      for (const [bx, p] of [[-s * 0.2, bein], [s * 0.15, -bein]]) { g.beginPath(); g.moveTo(bx, s * 0.22); g.lineTo(bx + p * s * 0.08, s * 0.36); g.stroke(); }
      break;
    }
    case 'schleim': case 'minischleim': {
      const qu = 1 + Math.sin(t * 6 + id) * 0.08, h = s * 0.45 / qu, b = s * 0.48 * qu, mini = art === 'minischleim';
      g.translate(0, s * 0.35);
      g.fillStyle = FZ.rad(g, -b * 0.3, -h * 1.2, b * 1.5, mini ? [[0, '#d0ffb0'], [0.6, '#8ad860'], [1, '#4a9a30']] : [[0, '#b0f5a0'], [0.6, '#46b84a'], [1, '#22702a']]);
      g.beginPath(); g.moveTo(-b, 0); g.bezierCurveTo(-b * 1.05, -h * 1.4, b * 1.05, -h * 1.4, b, 0);
      g.quadraticCurveTo(0, h * 0.18, -b, 0); g.fill();
      // Bläschen im Inneren steigen auf
      for (let i = 0; i < 3; i++) { const q = ((t * 0.6 + i / 3 + id * 0.1) % 1); FZ.kreis(g, b * (0.3 - i * 0.3), -h * q * 0.9, s * (0.025 + i * 0.01), `rgba(230,255,220,${0.5 * (1 - q)})`); }
      FZ.ell(g, -b * 0.35, -h * 0.85, b * 0.25, h * 0.15, 'rgba(255,255,255,.6)', -0.4);
      FZ.kreis(g, -b * 0.08, -h * 0.98, s * 0.03, 'rgba(255,255,255,.8)');
      FZ.auge(g, b * 0.05, -h * 0.55, s * 0.08); FZ.auge(g, b * 0.45, -h * 0.55, s * 0.08);
      break;
    }
    case 'wolf': case 'fuchs': {
      // 🦊 Fuchs = gleicher Körperbau, orange mit weißer Schwanzspitze, kleiner und flinker
      const fu = art === 'fuchs', k = s * (fu ? 0.42 : 0.5), F = fu
        ? { bein: '#3a2418', schwanz: '#d86a20', hell: '#f0a050', dunkel: '#b85418', schnauze: '#e88a40', kopf: '#e07a30', ohr: '#7a3410' }
        : { bein: '#4a5260', schwanz: '#6a7484', hell: '#9aa4b4', dunkel: '#5a6474', schnauze: '#7e8898', kopf: '#8a94a4', ohr: '#5a6474' };
      const lauf = fu ? Math.sin(t * 24 + id) : bein;
      g.strokeStyle = F.bein; g.lineWidth = Math.max(1.5, k * 0.16); g.lineCap = 'round';
      for (const [bx, p] of [[-k * 0.6, lauf], [-k * 0.3, -lauf], [k * 0.35, -lauf], [k * 0.6, lauf]]) { g.beginPath(); g.moveTo(bx, k * 0.2); g.lineTo(bx + p * k * 0.25, k * 0.75); g.stroke(); }
      g.fillStyle = F.schwanz; g.beginPath(); g.moveTo(-k * 0.85, -k * 0.1); g.quadraticCurveTo(-k * 1.4, -k * 0.5 + lauf * k * 0.1, -k * 1.3, -k * 0.8); g.quadraticCurveTo(-k * 1.1, -k * 0.3, -k * 0.75, k * 0.1); g.fill();
      if (fu) FZ.kreis(g, -k * 1.3, -k * 0.75, k * 0.16, '#fff6ea');
      FZ.ell(g, 0, wipp, k * 0.9, k * 0.42, FZ.lin(g, 0, -k * 0.4, 0, k * 0.4, [[0, F.hell], [1, F.dunkel]]));
      g.fillStyle = F.schnauze; g.beginPath(); g.moveTo(k * 0.6, -k * 0.3 + wipp); g.lineTo(k * 1.35, -k * 0.15 + wipp); g.lineTo(k * 1.3, k * 0.1 + wipp); g.lineTo(k * 0.7, k * 0.2 + wipp); g.fill();
      FZ.kreis(g, k * 0.8, -k * 0.25 + wipp, k * 0.38, F.kopf);
      if (fu) FZ.ell(g, k * 1.0, -k * 0.05 + wipp, k * 0.3, k * 0.14, '#fff6ea');
      g.fillStyle = F.ohr; for (const ox of [0.62, 0.92]) { g.beginPath(); g.moveTo(k * ox, -k * 0.5 + wipp); g.lineTo(k * (ox + 0.08), -k * 0.95 + wipp); g.lineTo(k * (ox + 0.22), -k * 0.5 + wipp); g.fill(); }
      FZ.kreis(g, k * 1.33, -k * 0.02 + wipp, k * 0.08, '#1a1020');
      FZ.kreis(g, k * 0.95, -k * 0.32 + wipp, k * 0.08, '#ffd84a'); FZ.kreis(g, k * 0.97, -k * 0.32 + wipp, k * 0.04, '#1a1020');
      if (fu) for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-k * (1.5 + i * 0.25), -k * 0.3 + i * k * 0.25); g.lineTo(-k * (2.0 + i * 0.25), -k * 0.3 + i * k * 0.25); g.stroke(); }   // Tempo-Striche
      break;
    }
    case 'felsling': {
      // 🪨 Felsling: kantiger Steinbrocken mit Moos und glimmenden Augen, stapft schwer
      const k = s * 0.5, stampf = Math.abs(Math.sin(t * 5 + id)) * k * 0.06;
      g.fillStyle = '#4a4a52'; g.fillRect(-k * 0.45, k * 0.35, k * 0.3, k * 0.5 - stampf); g.fillRect(k * 0.15, k * 0.35, k * 0.3, k * 0.5 + stampf);
      g.fillStyle = FZ.lin(g, -k, -k, k, k, [[0, '#a8a8b2'], [0.5, '#7c7c88'], [1, '#55555f']]);
      g.beginPath(); [[-0.75, 0.4], [-0.85, -0.2], [-0.45, -0.75], [0.2, -0.85], [0.75, -0.45], [0.85, 0.15], [0.55, 0.5]].forEach(([px, py], i) => g[i ? 'lineTo' : 'moveTo'](k * px, k * py + wipp)); g.closePath(); g.fill();
      g.strokeStyle = '#3a3a44'; g.lineWidth = Math.max(1, k * 0.06);
      g.beginPath(); g.moveTo(-k * 0.3, -k * 0.5 + wipp); g.lineTo(-k * 0.05, -k * 0.1 + wipp); g.lineTo(-k * 0.35, k * 0.25 + wipp); g.stroke();
      FZ.ell(g, -k * 0.35, -k * 0.65 + wipp, k * 0.3, k * 0.12, '#5a8a3a', -0.3);   // Moos
      for (const ox of [0.25, 0.55]) { FZ.kreis(g, k * ox, -k * 0.25 + wipp, k * 0.1, '#ffb040'); FZ.kreis(g, k * ox, -k * 0.25 + wipp, k * 0.05, '#fff2b0'); }
      break;
    }
    case 'fledermaus': {
      // 🦇 Fledermaus: kleiner violetter Körper, große Hautflügel, die schnell schlagen, Ohren, gelbe Augen
      const k = s * 0.5, fl = Math.sin(t * 22 + id);
      for (const seite of [-1, 1]) {
        g.fillStyle = FZ.lin(g, 0, -k, 0, k * 0.3, [[0, '#b48ae0'], [1, '#6a4a9a']]);
        g.beginPath(); g.moveTo(0, -k * 0.1);
        const sx = seite * k * 1.25, sy = -k * (0.2 + fl * 0.55);
        g.quadraticCurveTo(seite * k * 0.6, sy - k * 0.35, sx, sy);
        for (let i = 1; i <= 3; i++) g.quadraticCurveTo(seite * k * (1.25 - i * 0.32 + 0.1), sy + k * 0.35, seite * k * (1.25 - i * 0.32), sy * (1 - i * 0.28) + k * 0.12);
        g.closePath(); g.fill();
      }
      FZ.ell(g, 0, wipp, k * 0.34, k * 0.42, FZ.lin(g, 0, -k * 0.4, 0, k * 0.4, [[0, '#c8a8e8'], [1, '#7a5aa8']]));
      g.fillStyle = '#7a5aa8'; for (const ox of [-0.18, 0.18]) { g.beginPath(); g.moveTo(k * (ox - 0.1), -k * 0.3 + wipp); g.lineTo(k * ox * 1.4, -k * 0.7 + wipp); g.lineTo(k * (ox + 0.1), -k * 0.3 + wipp); g.fill(); }
      FZ.kreis(g, -k * 0.12, -k * 0.12 + wipp, k * 0.08, '#ffd84a'); FZ.kreis(g, k * 0.12, -k * 0.12 + wipp, k * 0.08, '#ffd84a');
      FZ.kreis(g, -k * 0.1, -k * 0.12 + wipp, k * 0.035, '#1a1020'); FZ.kreis(g, k * 0.14, -k * 0.12 + wipp, k * 0.035, '#1a1020');
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-k * 0.06, k * 0.05 + wipp); g.lineTo(-k * 0.03, k * 0.14 + wipp); g.lineTo(0, k * 0.05 + wipp); g.fill();
      break;
    }
    case 'greif': {
      // 🦅 Greif: Adlerkopf mit Schnabel, Löwenkörper, breite Federflügel, die langsam schlagen
      const k = s * 0.5, fl = Math.sin(t * 8 + id);
      g.fillStyle = '#c89a4a'; g.beginPath(); g.moveTo(-k * 0.7, k * 0.05 + wipp); g.quadraticCurveTo(-k * 1.3, k * 0.1, -k * 1.25, -k * 0.35 + fl * k * 0.05); g.lineTo(-k * 1.05, -k * 0.1); g.lineTo(-k * 0.6, k * 0.25 + wipp); g.fill();
      FZ.kreis(g, -k * 1.27, -k * 0.4, k * 0.1, '#7a5a2a');   // Schwanzquaste
      for (const seite of [-1, 1]) {   // Flügel mit Federn (hinterer dunkler)
        const ty = -k * (1.0 + fl * 0.45) * (seite > 0 ? 1 : 0.85);
        g.fillStyle = FZ.lin(g, 0, ty, 0, -k * 0.2, [[0, seite > 0 ? '#f0e6d0' : '#c8bca4'], [1, '#8a6a3a']]);
        g.beginPath(); g.moveTo(-k * 0.2, -k * 0.2 + wipp); g.lineTo(-k * 0.9, ty);
        for (let i = 0; i < 4; i++) g.lineTo(-k * (0.75 - i * 0.22), ty + k * (0.18 + (i % 2) * 0.12));
        g.lineTo(k * 0.35, -k * 0.2 + wipp); g.fill();
      }
      FZ.ell(g, 0, wipp, k * 0.75, k * 0.42, FZ.lin(g, 0, -k * 0.4, 0, k * 0.4, [[0, '#e0b060'], [1, '#9a7030']]));
      FZ.ell(g, -k * 0.15, -k * 0.15 + wipp, k * 0.4, k * 0.1, 'rgba(255,255,255,.2)', -0.2);
      FZ.kreis(g, k * 0.72, -k * 0.38 + wipp, k * 0.34, '#f4eee0');   // weißer Adlerkopf
      g.fillStyle = '#f0b020'; g.beginPath(); g.moveTo(k * 0.95, -k * 0.45 + wipp); g.quadraticCurveTo(k * 1.3, -k * 0.4 + wipp, k * 1.15, -k * 0.2 + wipp); g.lineTo(k * 0.95, -k * 0.28 + wipp); g.fill();
      FZ.auge(g, k * 0.82, -k * 0.48 + wipp, k * 0.07, true);
      g.strokeStyle = '#f0b020'; g.lineWidth = Math.max(1, k * 0.07);   // Krallen
      for (const bx of [-0.3, 0.3]) { g.beginPath(); g.moveTo(k * bx, k * 0.35 + wipp); g.lineTo(k * (bx + 0.1), k * 0.55 + wipp); g.stroke(); }
      break;
    }
    case 'ork': {
      const k = s * 0.5;
      g.fillStyle = '#3a5a2a'; g.fillRect(-k * 0.45, k * 0.3, k * 0.3, k * 0.55 + bein * k * 0.06); g.fillRect(k * 0.15, k * 0.3, k * 0.3, k * 0.55 - bein * k * 0.06);
      FZ.ell(g, 0, wipp, k * 0.62, k * 0.6, FZ.lin(g, -k * 0.6, 0, k * 0.6, 0, [[0, '#4a7a3a'], [1, '#78b05a']]));
      g.fillStyle = '#7a5a3a'; g.fillRect(-k * 0.62, k * 0.08 + wipp, k * 1.24, k * 0.22);
      g.fillStyle = '#d8b040'; g.fillRect(k * 0.0, k * 0.1 + wipp, k * 0.2, k * 0.18); g.fillStyle = '#7a5a3a'; g.fillRect(k * 0.05, k * 0.14 + wipp, k * 0.1, k * 0.1);   // Gürtelschnalle
      // Schulterpanzer
      g.fillStyle = FZ.lin(g, 0, -k * 0.6, 0, -k * 0.2, [[0, '#c8ced8'], [1, '#5a6070']]); g.beginPath(); g.ellipse(-k * 0.38, -k * 0.32 + wipp, k * 0.3, k * 0.18, -0.3, 0, Math.PI * 2); g.fill();
      FZ.kreis(g, -k * 0.38, -k * 0.36 + wipp, k * 0.04, '#e8eef8');
      FZ.kreis(g, k * 0.1, -k * 0.72 + wipp, k * 0.42, '#6aa050');
      g.fillStyle = FZ.lin(g, 0, -k * 1.3, 0, -k * 0.7, [[0, '#d8dee8'], [1, '#6a7080']]); g.beginPath(); g.arc(k * 0.1, -k * 0.8 + wipp, k * 0.46, Math.PI, 0); g.fill();
      g.fillStyle = '#fff'; g.fillRect(k * 0.05, -k * 0.5 + wipp, k * 0.1, k * 0.14); g.fillRect(k * 0.3, -k * 0.5 + wipp, k * 0.1, k * 0.14);
      FZ.kreis(g, k * 0.3, -k * 0.72 + wipp, k * 0.08, '#ff3a2a');
      g.strokeStyle = '#7a5a3a'; g.lineWidth = Math.max(2, k * 0.14); g.beginPath(); g.moveTo(k * 0.55, k * 0.1 + wipp); g.lineTo(k * 0.85, -k * 0.75 + wipp); g.stroke();
      g.fillStyle = FZ.lin(g, k * 0.7, -k, k * 1.2, -k * 0.5, [[0, '#e8eef8'], [1, '#8890a0']]);
      g.beginPath(); g.moveTo(k * 0.78, -k * 0.95 + wipp); g.quadraticCurveTo(k * 1.35, -k * 0.85 + wipp, k * 1.05, -k * 0.45 + wipp); g.lineTo(k * 0.85, -k * 0.6 + wipp); g.fill();
      break;
    }
    case 'geist': {
      const k = s * 0.5, schweb = Math.sin(t * 3 + id) * k * 0.12;
      g.translate(0, schweb - k * 0.1);
      g.fillStyle = FZ.rad(g, 0, 0, k * 1.6, [[0, 'rgba(220,210,255,.35)'], [1, 'rgba(220,210,255,0)']]); g.beginPath(); g.arc(0, 0, k * 1.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = FZ.lin(g, 0, -k, 0, k, [[0, 'rgba(250,248,255,.95)'], [1, 'rgba(200,190,240,.6)']]);
      g.beginPath(); g.moveTo(-k * 0.7, k * 0.8); g.lineTo(-k * 0.7, -k * 0.2); g.arc(0, -k * 0.2, k * 0.7, Math.PI, 0); g.lineTo(k * 0.7, k * 0.8);
      for (let i = 0; i < 4; i++) { const xx = k * 0.7 - (i + 0.5) * k * 0.35; g.quadraticCurveTo(xx, k * (0.55 + Math.sin(t * 6 + i) * 0.15), xx - k * 0.175, k * 0.8); }
      g.fill();
      FZ.ell(g, k * 0.05, -k * 0.25, k * 0.12, k * 0.18, '#3a2a5a'); FZ.ell(g, k * 0.38, -k * 0.25, k * 0.12, k * 0.18, '#3a2a5a');
      FZ.ell(g, k * 0.22, k * 0.08, k * 0.1, k * 0.12, '#5a4a7a');
      break;
    }
    case 'troll': {
      const k = s * 0.5;
      g.fillStyle = '#5a6a5a'; g.fillRect(-k * 0.5, k * 0.4, k * 0.35, k * 0.55 + bein * k * 0.05); g.fillRect(k * 0.15, k * 0.4, k * 0.35, k * 0.55 - bein * k * 0.05);
      FZ.ell(g, 0, wipp, k * 0.8, k * 0.7, FZ.lin(g, -k, 0, k, 0, [[0, '#5e7262'], [1, '#90a894']]));
      g.fillStyle = '#7a5a3a'; g.fillRect(-k * 0.8, k * 0.25 + wipp, k * 1.6, k * 0.22);
      for (const [wx, wy, wr] of [[-0.4, -0.1, 0.07], [0.3, 0.15, 0.06], [-0.1, 0.3, 0.05], [0.5, -0.2, 0.05]]) FZ.kreis(g, k * wx, k * wy + wipp, k * wr, 'rgba(60,80,60,.55)');   // Warzen und Flecken
      FZ.ell(g, -k * 0.2, -k * 0.3 + wipp, k * 0.35, k * 0.12, 'rgba(255,255,255,.12)', -0.3);
      FZ.kreis(g, k * 0.35, -k * 0.6 + wipp, k * 0.42, '#86a08a');
      FZ.ell(g, k * 0.25, -k * 0.82 + wipp, k * 0.18, k * 0.07, 'rgba(255,255,255,.18)', -0.2);
      g.fillStyle = '#f2ead0'; for (const ox of [0.35, 0.6]) { g.beginPath(); g.moveTo(k * ox, -k * 0.38 + wipp); g.lineTo(k * (ox + 0.05), -k * 0.62 + wipp); g.lineTo(k * (ox + 0.12), -k * 0.38 + wipp); g.fill(); }
      FZ.auge(g, k * 0.5, -k * 0.75 + wipp, k * 0.09, true);
      // Keule über der Schulter
      g.save(); g.translate(-k * 0.3, -k * 0.1 + wipp); g.rotate(-0.9 + Math.sin(t * 4 + id) * 0.1);
      g.fillStyle = '#6a4424'; g.fillRect(-k * 0.08, -k * 1.1, k * 0.16, k * 1.1);
      FZ.ell(g, 0, -k * 1.15, k * 0.26, k * 0.32, '#8a5a30'); g.restore();
      break;
    }
    case 'drache': {
      const k = s * 0.5, fl = Math.sin(t * 7 + id);
      for (const seite of [-1, 1]) {   // Flügel: Haut mit Verlauf, Knochen als Linien
        const sp = (seite > 0 ? 1 : 0.8), tx = -k * 0.6, ty = -k * (1.3 + fl * 0.35) * sp, mx = k * 0.2, my = -k * (1.1 + fl * 0.3);
        g.fillStyle = FZ.lin(g, 0, ty, 0, -k * 0.3, [[0, seite > 0 ? '#a8281a' : '#7a1a10'], [1, '#4a0a08']]);
        g.beginPath(); g.moveTo(-k * 0.1, -k * 0.3); g.lineTo(tx, ty); g.quadraticCurveTo(-k * 0.1, ty * 0.75, mx, my); g.quadraticCurveTo(k * 0.25, -k * 0.6, k * 0.4, -k * 0.3); g.fill();
        g.strokeStyle = '#3a0806'; g.lineWidth = Math.max(1, k * 0.04);
        for (const [ex, ey] of [[tx, ty], [mx, my], [(tx + mx) / 2, (ty + my) / 2 - k * 0.05]]) { g.beginPath(); g.moveTo(-k * 0.05, -k * 0.32); g.lineTo(ex, ey); g.stroke(); }
      }
      g.fillStyle = '#b02a1a'; g.beginPath(); g.moveTo(-k * 0.6, 0); g.quadraticCurveTo(-k * 1.4, k * 0.1, -k * 1.5, -k * 0.4 + fl * k * 0.1); g.lineTo(-k * 1.2, -k * 0.1); g.lineTo(-k * 0.5, k * 0.3); g.fill();
      FZ.ell(g, 0, wipp, k * 0.85, k * 0.55, FZ.lin(g, 0, -k * 0.5, 0, k * 0.5, [[0, '#e04a2a'], [1, '#8a1a10']]));
      FZ.ell(g, k * 0.1, k * 0.2 + wipp, k * 0.55, k * 0.25, '#f0c060');
      g.strokeStyle = 'rgba(160,100,30,.6)'; g.lineWidth = 1;   // Bauchschuppen
      for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(k * (0.1 + i * 0.18), k * 0.0 + wipp); g.quadraticCurveTo(k * (0.13 + i * 0.18), k * 0.2 + wipp, k * (0.1 + i * 0.18), k * 0.42 + wipp); g.stroke(); }
      for (let i = 0; i < 4; i++) { g.fillStyle = '#f2ead0'; g.beginPath(); g.moveTo(-k * (0.5 - i * 0.3), -k * 0.48 + wipp); g.lineTo(-k * (0.4 - i * 0.3), -k * 0.7 + wipp); g.lineTo(-k * (0.3 - i * 0.3), -k * 0.5 + wipp); g.fill(); }   // Rückenzacken
      g.fillStyle = '#c03a20'; g.beginPath(); g.moveTo(k * 0.6, -k * 0.2 + wipp); g.lineTo(k * 1.0, -k * 0.75 + wipp); g.lineTo(k * 1.25, -k * 0.55 + wipp); g.lineTo(k * 0.85, k * 0.1 + wipp); g.fill();
      FZ.ell(g, k * 1.25, -k * 0.65 + wipp, k * 0.35, k * 0.25, '#d04028');
      g.fillStyle = '#f2ead0'; g.beginPath(); g.moveTo(k * 1.1, -k * 0.85 + wipp); g.lineTo(k * 1.0, -k * 1.15 + wipp); g.lineTo(k * 1.25, -k * 0.88 + wipp); g.fill();
      FZ.auge(g, k * 1.3, -k * 0.72 + wipp, k * 0.08, true);
      if (Math.sin(t * 2 + id) > 0.7) { g.fillStyle = FZ.rad(g, k * 1.7, -k * 0.6, k * 0.5, [[0, 'rgba(255,240,180,.9)'], [1, 'rgba(255,120,30,0)']]); g.beginPath(); g.arc(k * 1.7, -k * 0.6 + wipp, k * 0.5, 0, Math.PI * 2); g.fill(); }
      break;
    }
    default: g.restore(); return false;
  }
  g.restore();
  return true;
}

// --- 👾 Monsterbuch: beim ersten Auftauchen eine Karte (Nacht steht), später über ☰ nachlesen ---
// Jedes Monster wird auch als Python-Klasse gezeigt (Nutzerwunsch: „als Code der Klasse“) – Vorbereitung auf OOP.
const MONSTER_TIPP = {
  ratte: 'Klein und schnell. Kommt in Scharen, verpufft aber schon beim ersten Treffer.',
  schleim: 'Langsam und zäh. Wenn er verpufft, teilt er sich in zwei Minischleime.',
  minischleim: 'Klein und flink – der Rest eines Schleims.',
  wolf: 'Schnell, aber schwach. Türme, die oft schießen (Pfeilturm), erwischen ihn gut – später bremst ihn der Eisturm.',
  ork: 'Trägt Rüstung: Pfeile machen 2 Schaden weniger. Kanonen, Katapulte und Zauber helfen.',
  geist: 'Pfeile gehen halb durch ihn hindurch. Zauber und Blitze wirken voll.',
  troll: 'Riesig und zäh, Eis wirkt nur halb. Spuckt unterwegs Minischleime aus, die zum Tor rennen.',
  drache: 'Boss! Feuer prallt ab, Rüstung 3. Spuckt Wölfe aus, die direkt zum Tor rennen. Je mehr Leben er verliert, desto müder und langsamer wird er – Türme am ganzen Weg lohnen sich.',
  fuchs: 'Sehr schnell und läuft weit verteilt – ein Erdbeben oder Kettenblitz erwischt meist nur einen. Betäuben hält nur halb so lang. Türme nah am Tor und dein Held helfen.',
  felsling: 'Aus Stein: Katapult nur 40 %, Blitz nur 50 % Schaden. Pfeile, Kanone, Eis und die Zauber deines Helden wirken voll.',
  fledermaus: 'Fliegt geradewegs zur Burg, nicht über den Weg. Katapult, Erdbeben, brennender Boden und die Torwache erreichen sie nicht – außer sie liegt am Boden (jeder Eistreffer holt sie herunter, auch Blitz und Sturmturm). Pfeile, Kanone, Eis, Blitz und dein Held treffen sie immer.',
  greif: 'Großer Flieger mit Federpanzer (Pfeile 1 weniger). Wie die Fledermaus: Katapult und Torwache nur, wenn er am Boden liegt. Wichtig: Ein Turm, der ihn trifft (🏹 Pfeil, 💣 Kanone, 🌩️ Blitz), muss dabei sein – ein 🧊 Eisturm holt ihn zu Boden, damit auch Katapult und Wache helfen. Nur Katapulte reichen nicht.',
};
const klassenName = (art) => art[0].toUpperCase() + art.slice(1);
function monsterCode(art) {
  const g = GEGNER[art], z = [`class ${klassenName(art)}(Monster):`, `    leben = ${g.hp}`, `    tempo = ${g.tempo}`, `    schaden = ${g.schaden}`];
  if (g.ruestung) z.push(`    ruestung = ${g.ruestung}`);
  if (Object.keys(g.res).length) z.push(`    widerstand = {${Object.entries(g.res).map(([k, v]) => `'${k}': ${v}`).join(', ')}}   # in Prozent`);
  if (g.boss) z.push('    boss = True');
  if (g.flink) z.push('    flink = True   # Betäuben hält nur halb');
  if (g.fliegt) z.push('    fliegt = True   # Katapult trifft nur, wenn es am Boden liegt');
  if (g.teilt) z.push('', '    def verpuffen(self):', `        self.teile_dich('${g.teilt}', 2)`);
  const b = BRUT[art];
  if (b) z.push('', `    def alle_${b.alle}_sekunden(self):`, `        self.spucke('${b.art}', ${b.n})`);
  return z.join('\n');
}
function monsterBild(c, art) {
  const g = c.getContext('2d');
  g.fillStyle = '#2a4a2e'; g.fillRect(0, 0, c.width, c.height);
  malGegner(g, art, c.width / 2, c.height * 0.55, Math.min(c.width, c.height) * (GEGNER[art].boss || art === 'troll' ? 0.6 : 0.5), performance.now() / 1000, true, 1);
}
function monsterKarte(art, weiter) {
  const g = GEGNER[art];
  P.gesehen.monster = true;   // steht danach im Heft (ERKL 'monster')
  karte(`<h2>👾 Neues Monster: ${g.name}</h2>
    <div class="monsterkarte"><canvas width="160" height="120" data-monster="${art}"></canvas>
      <div><p>${esc(MONSTER_TIPP[art] || g.tip)}</p>
        <p class="hinweis">❤️ ${g.hp} Leben · 🏃 Tempo ${g.tempo} · 💥 ${g.schaden} Schaden${g.ruestung ? ` · 🛡️ Rüstung ${g.ruestung}` : ''}</p></div></div>
    <details><summary>🐍 So steht es im Code</summary><pre class="mono">${esc(monsterCode(art))}</pre>
      <p class="hinweis">Eine <b>Klasse</b> ist ein Bauplan. Jedes ${esc(g.name)}-Monster in der Nacht ist ein <b>Objekt</b> nach diesem Bauplan – mit eigenen Leben, aber denselben Eigenschaften.</p></details>
    <p class="hinweis">Nachlesen: ☰ → 👾 Monsterbuch</p>`,
  [{ label: 'Weiter kämpfen!', fn: weiter }]);
  for (const c of document.querySelectorAll('[data-monster]')) monsterBild(c, c.dataset.monster);
}
function monsterBuch() {
  const gesehen = Object.keys(GEGNER).filter((a) => (P.monster || []).includes(a));
  karte(`<h2>👾 Monsterbuch</h2><p class="hinweis">${gesehen.length} von ${Object.keys(GEGNER).length} Monstern gesehen. Neue tauchen in späteren Nächten auf.</p>
    <div class="monsterbuch">${Object.keys(GEGNER).map((a) => gesehen.includes(a)
      ? `<div class="mbkarte"><canvas width="120" height="90" data-monster="${a}"></canvas><b>${GEGNER[a].name}</b><span class="hinweis">${esc(MONSTER_TIPP[a] || '')}</span>
          <details><summary>🐍 Code</summary><pre class="mono">${esc(monsterCode(a))}</pre></details></div>`
      : '<div class="mbkarte zu"><span class="sico">❔</span><b>???</b></div>').join('')}</div>`, [{ label: 'Schließen' }]);
  $('#overlay .sheet').classList.add('breit');
  for (const c of document.querySelectorAll('[data-monster]')) monsterBild(c, c.dataset.monster);
}

// --- 🗼 Türme: Steinsockel, je Art ein Aufsatz; Stufe zeigt sich an Fahne (ab 3), Goldrand (ab 5), Krone mit Glanz (6) ---
function malTurm(g, art, stufe, x, y, a, t, schuss = false, wahl = []) {
  // Sockel: runder Steinturm mit Zinnen
  FZ.ell(g, x, y + a * 1.0, a * 1.15, a * 0.32, 'rgba(0,0,0,.35)');
  const steinFarbe = { eis: ['#7aa4c4', '#c8e4f4', '#5a84a4'], blitz: ['#5a4a8a', '#9a88d4', '#3e3070'] }[art] || ['#6e7584', '#b4bccb', '#525868'];
  // Körper rund wirken lassen: Licht von links oben, dunkle Kante rechts; Fundament etwas breiter
  g.fillStyle = FZ.lin(g, x - a, 0, x + a, 0, [[0, steinFarbe[2]], [0.18, steinFarbe[0]], [0.42, steinFarbe[1]], [0.75, steinFarbe[0]], [1, steinFarbe[2]]]);
  g.fillRect(x - a * 0.85, y - a * 0.55, a * 1.7, a * 1.5);
  g.fillStyle = 'rgba(20,24,34,.35)'; g.fillRect(x - a * 0.95, y + a * 0.72, a * 1.9, a * 0.23);   // Fundament
  g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x - a * 0.95, y + a * 0.72, a * 1.9, a * 0.04);
  g.save(); g.beginPath(); g.rect(x - a * 0.85, y - a * 0.55, a * 1.7, a * 1.5); g.clip();   // Fugen nur auf dem Turm
  g.strokeStyle = 'rgba(30,34,46,.35)'; g.lineWidth = 1;
  for (let r = 0; r < 4; r++) for (let c = -1; c < 3; c++) g.strokeRect(x - a * 0.85 + c * a * 0.57 + (r % 2) * a * 0.28, y - a * 0.55 + r * a * 0.375, a * 0.57, a * 0.375);
  g.restore();
  // Rundbogenfenster mit warmem Licht (flackert leicht)
  const fl = 0.75 + 0.25 * Math.sin(t * 7 + x * 0.3);
  g.fillStyle = '#1a1420'; g.beginPath(); g.moveTo(x - a * 0.16, y + a * 0.22); g.lineTo(x - a * 0.16, y - a * 0.12); g.arc(x, y - a * 0.12, a * 0.16, Math.PI, 0); g.lineTo(x + a * 0.16, y + a * 0.22); g.fill();
  g.fillStyle = FZ.rad(g, x, y + a * 0.02, a * 0.26, [[0, `rgba(255,236,170,${fl})`], [0.6, `rgba(255,170,70,${fl * 0.85})`], [1, 'rgba(255,120,40,0)']]);
  g.beginPath(); g.moveTo(x - a * 0.11, y + a * 0.18); g.lineTo(x - a * 0.11, y - a * 0.1); g.arc(x, y - a * 0.1, a * 0.11, Math.PI, 0); g.lineTo(x + a * 0.11, y + a * 0.18); g.fill();
  g.fillStyle = '#2a2030'; g.fillRect(x - a * 0.012, y - a * 0.2, a * 0.024, a * 0.38); g.fillRect(x - a * 0.11, y - a * 0.02, a * 0.22, a * 0.024);   // Fensterkreuz
  // Moos am Fuß
  FZ.ell(g, x - a * 0.6, y + a * 0.7, a * 0.28, a * 0.09, 'rgba(90,150,60,.85)', -0.1);
  FZ.ell(g, x + a * 0.55, y + a * 0.72, a * 0.16, a * 0.06, 'rgba(110,170,70,.75)', 0.2);
  // Wehrgang mit Zinnen: Oberkante hell, Unterseite mit Schatten
  g.fillStyle = steinFarbe[1]; g.fillRect(x - a, y - a * 0.75, a * 2, a * 0.25);
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x - a * 0.85, y - a * 0.5, a * 1.7, a * 0.08);
  for (let i = 0; i < 4; i++) {
    g.fillStyle = steinFarbe[1]; g.fillRect(x - a + i * a * 0.55, y - a * 1.0, a * 0.35, a * 0.28);
    g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(x - a + i * a * 0.55, y - a * 1.0, a * 0.35, a * 0.05);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - a + i * a * 0.55 + a * 0.27, y - a * 1.0, a * 0.08, a * 0.28);
  }
  if (stufe >= 5) { g.strokeStyle = '#e0b030'; g.lineWidth = Math.max(2, a * 0.08); g.strokeRect(x - a, y - a * 0.75, a * 2, a * 0.25); }
  // ab Stufe 4: Wappenschild in der Farbe des Wegs unter dem Wehrgang
  if (stufe >= 4) {
    const wc = wahl.at(-1) === 'b' ? '#3ac8c0' : '#e0b030';
    g.fillStyle = wc; g.strokeStyle = '#3a2a10'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x - a * 0.62, y - a * 0.42); g.lineTo(x - a * 0.38, y - a * 0.42); g.lineTo(x - a * 0.38, y - a * 0.22); g.quadraticCurveTo(x - a * 0.5, y - a * 0.08, x - a * 0.5, y - a * 0.08); g.quadraticCurveTo(x - a * 0.62, y - a * 0.18, x - a * 0.62, y - a * 0.22); g.closePath(); g.fill(); g.stroke();
  }
  // Fahne ab Stufe 3 (Farbe = letzte Wahl: A gold, B türkis)
  if (stufe >= 3) {
    const fx = x + a * 0.75, fy = y - a * 1.0, wehen = Math.sin(t * 4 + x) * a * 0.1;
    g.strokeStyle = '#3a2a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx, fy - a * 1.1); g.stroke();
    g.fillStyle = wahl.at(-1) === 'b' ? '#3ac8c0' : '#e0b030';
    g.beginPath(); g.moveTo(fx, fy - a * 1.1); g.quadraticCurveTo(fx + a * 0.3, fy - a * 1.0 + wehen, fx + a * 0.55, fy - a * 0.95 + wehen); g.lineTo(fx, fy - a * 0.75); g.fill();
  }
  const oy = y - a * 1.05, ruck = schuss ? a * 0.12 : 0;
  switch (art) {
    case 'pfeil': {   // Balliste: Bogen, Sehne, Bolzen – zeigt zu den Gegnern (links)
      g.save(); g.translate(x + ruck, oy); g.rotate(-Math.PI / 2 - 0.35);
      g.fillStyle = '#6a4424'; g.fillRect(-a * 0.12, -a * 0.2, a * 0.24, a * 0.9);
      g.strokeStyle = '#3a2410'; g.lineWidth = Math.max(2, a * 0.14); g.beginPath(); g.arc(0, a * 0.55, a * 0.62, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      g.strokeStyle = '#e8e0c8'; g.lineWidth = 1; g.beginPath(); g.moveTo(-a * 0.52, a * 0.2); g.lineTo(0, schuss ? a * 0.15 : a * 0.45); g.lineTo(a * 0.52, a * 0.2); g.stroke();
      if (!schuss) { g.fillStyle = '#d8d0b0'; g.fillRect(-a * 0.04, -a * 0.25, a * 0.08, a * 0.7); g.fillStyle = '#ddd'; g.beginPath(); g.moveTo(-a * 0.1, -a * 0.25); g.lineTo(0, -a * 0.45); g.lineTo(a * 0.1, -a * 0.25); g.fill(); }
      g.restore();
      break;
    }
    case 'katapult': {   // Holzgestell mit Wurfarm; beim Schuss schnellt der Arm nach vorn
      g.fillStyle = '#6a4424'; g.fillRect(x - a * 0.7, oy - a * 0.1, a * 1.4, a * 0.2);
      g.fillStyle = '#5a3a1a'; g.beginPath(); g.moveTo(x - a * 0.25, oy); g.lineTo(x, oy - a * 0.6); g.lineTo(x + a * 0.25, oy); g.fill();
      g.save(); g.translate(x, oy - a * 0.5); g.rotate(schuss ? -0.3 : 0.9);
      g.fillStyle = '#8a5a30'; g.fillRect(-a * 0.07, -a * 1.0, a * 0.14, a * 1.25);
      g.fillStyle = '#4a3020'; g.beginPath(); g.arc(0, -a * 1.0, a * 0.2, 0, Math.PI); g.fill();
      if (!schuss) FZ.kreis(g, 0, -a * 1.05, a * 0.15, '#8a8070');
      g.restore();
      break;
    }
    case 'kanone': {   // Eisenrohr auf Lafette; Mündungsfeuer beim Schuss
      g.fillStyle = '#5a3a1a'; g.fillRect(x - a * 0.45, oy - a * 0.15, a * 0.9, a * 0.3);
      FZ.kreis(g, x - a * 0.3, oy + a * 0.15, a * 0.18, '#3a2410'); FZ.kreis(g, x + a * 0.3, oy + a * 0.15, a * 0.18, '#3a2410');
      g.save(); g.translate(x + ruck, oy - a * 0.2); g.rotate(Math.PI + 0.25);
      g.fillStyle = FZ.lin(g, 0, -a * 0.2, 0, a * 0.2, [[0, '#5a5f6e'], [0.4, '#a0a6b4'], [1, '#2a2e38']]); g.fillRect(-a * 0.2, -a * 0.2, a * 1.05, a * 0.4);
      g.fillStyle = '#2a2e38'; g.fillRect(a * 0.8, -a * 0.24, a * 0.12, a * 0.48);
      if (schuss) { g.fillStyle = FZ.rad(g, a * 1.1, 0, a * 0.55, [[0, '#fff6c0'], [0.5, '#ffa040'], [1, 'rgba(255,90,20,0)']]); g.beginPath(); g.arc(a * 1.1, 0, a * 0.55, 0, Math.PI * 2); g.fill(); }
      g.restore();
      break;
    }
    case 'eis': {   // schwebender Eiskristall, dreht sich und leuchtet
      const sw = Math.sin(t * 2.5 + x) * a * 0.1;
      g.fillStyle = FZ.rad(g, x, oy - a * 0.5, a * 1.1, [[0, 'rgba(190,240,255,.55)'], [1, 'rgba(190,240,255,0)']]); g.beginPath(); g.arc(x, oy - a * 0.5, a * 1.1, 0, Math.PI * 2); g.fill();
      g.save(); g.translate(x, oy - a * 0.55 + sw); g.scale(Math.cos(t * 1.5 + x) * 0.35 + 0.75, 1);
      g.fillStyle = FZ.lin(g, -a * 0.4, 0, a * 0.4, 0, [[0, '#9fe3ff'], [0.5, '#ffffff'], [1, '#5fb8e8']]);
      g.beginPath(); g.moveTo(0, -a * 0.7); g.lineTo(a * 0.35, -a * 0.1); g.lineTo(0, a * 0.45); g.lineTo(-a * 0.35, -a * 0.1); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 1; g.stroke();
      g.restore();
      break;
    }
    case 'blitz': {   // Kupferspule mit Kugel und knisternden Bögen
      g.fillStyle = '#8a5a2a'; g.fillRect(x - a * 0.12, oy - a * 0.8, a * 0.24, a * 0.8);
      g.strokeStyle = '#d8904a'; g.lineWidth = Math.max(1.5, a * 0.06);
      for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x, oy - a * (0.15 + i * 0.17), a * 0.24, a * 0.06, 0, 0, Math.PI * 2); g.stroke(); }
      const gl = 0.6 + 0.4 * Math.sin(t * 12 + x);
      g.fillStyle = FZ.rad(g, x, oy - a * 1.0, a * 0.7, [[0, `rgba(255,255,255,${gl})`], [0.3, `rgba(190,160,255,${gl})`], [1, 'rgba(140,100,255,0)']]); g.beginPath(); g.arc(x, oy - a * 1.0, a * 0.7, 0, Math.PI * 2); g.fill();
      FZ.kreis(g, x, oy - a * 1.0, a * 0.22, '#e8e0ff');
      g.strokeStyle = 'rgba(230,220,255,.9)'; g.lineWidth = 1.2;
      for (let i = 0; i < 2; i++) {
        const w = t * 7 + i * 3 + x;
        g.beginPath(); g.moveTo(x, oy - a); g.lineTo(x + Math.cos(w) * a * 0.35, oy - a + Math.sin(w * 1.3) * a * 0.3); g.lineTo(x + Math.cos(w + 1) * a * 0.6, oy - a + Math.sin(w) * a * 0.45); g.stroke();
      }
      break;
    }
    case 'wind': {   // 🌪️ Sturmturm: Mast mit vier Windflügeln, die sich drehen (beim Pusten schneller), dazu Windstriche
      g.fillStyle = '#6a4a2a'; g.fillRect(x - a * 0.08, oy - a * 0.95, a * 0.16, a * 0.95);
      g.save(); g.translate(x, oy - a * 0.95); g.rotate(t * (schuss ? 9 : 2.5) + x);
      for (let i = 0; i < 4; i++) {
        g.rotate(Math.PI / 2);
        g.fillStyle = i % 2 ? '#eef8f0' : '#bfe4cc'; g.strokeStyle = '#5a7a66'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(a * 0.3, -a * 0.12, a * 0.8, -a * 0.1); g.lineTo(a * 0.78, a * 0.08); g.quadraticCurveTo(a * 0.3, a * 0.06, 0, 0); g.fill(); g.stroke();
      }
      g.restore();
      FZ.kreis(g, x, oy - a * 0.95, a * 0.12, '#d0a050');
      g.strokeStyle = 'rgba(230, 255, 240, .6)'; g.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const p = (t * 1.2 + i / 3) % 1, wy = oy - a * (0.3 + i * 0.35);
        g.beginPath(); g.moveTo(x - a * (0.4 + p), wy); g.quadraticCurveTo(x - a * (0.7 + p), wy - a * 0.15, x - a * (1.0 + p), wy); g.stroke();
      }
      break;
    }
    default: break;
  }
  // Stufe 6: Krone mit Glanz
  if (stufe >= 6) {
    const gl = 0.5 + 0.3 * Math.sin(t * 3 + x);
    g.fillStyle = FZ.rad(g, x, y - a * 0.9, a * 1.6, [[0, `rgba(255,220,120,${gl * 0.35})`], [1, 'rgba(255,220,120,0)']]); g.beginPath(); g.arc(x, y - a * 0.9, a * 1.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffd84a'; g.strokeStyle = '#8a6200'; g.lineWidth = 1;
    const cy = y + a * 0.62;   // unter dem Fenster
    g.beginPath(); g.moveTo(x - a * 0.35, cy); g.lineTo(x - a * 0.35, cy - a * 0.25); g.lineTo(x - a * 0.18, cy - a * 0.12); g.lineTo(x, cy - a * 0.32); g.lineTo(x + a * 0.18, cy - a * 0.12); g.lineTo(x + a * 0.35, cy - a * 0.25); g.lineTo(x + a * 0.35, cy); g.closePath(); g.fill(); g.stroke();
  }
}

// --- 🧙 Held: Zauberer mit Hut, Bart, wehendem Umhang und Stab; beim Zaubern hebt er den Stab, die Kugel strahlt ---
function malHeld(g, x, y, s, t, zaubert = false, klon = false) {
  const k = s * 0.5, weh = Math.sin(t * 3) * k * 0.08, hub = zaubert ? -k * 0.35 : 0;
  g.save();
  if (klon) { g.globalAlpha = 0.5; g.filter = 'hue-rotate(60deg)'; }
  g.fillStyle = FZ.rad(g, x, y, k * 2.2, [[0, zaubert ? 'rgba(255,220,140,.45)' : 'rgba(160,130,255,.3)'], [1, 'rgba(160,130,255,0)']]); g.beginPath(); g.arc(x, y, k * 2.2, 0, Math.PI * 2); g.fill();
  FZ.ell(g, x, y + k * 0.95, k * 0.7, k * 0.2, 'rgba(0,0,0,.4)');
  // Umhang (hinten, weht): außen dunkel, innen rotes Futter, das an der Kante hervorschaut
  g.fillStyle = '#8a1a3a'; g.beginPath(); g.moveTo(x - k * 0.3, y - k * 0.5); g.quadraticCurveTo(x - k * 1.08 + weh, y + k * 0.2, x - k * 0.82 + weh * 1.6, y + k * 0.98); g.lineTo(x + k * 0.1, y + k * 0.9); g.fill();
  g.fillStyle = FZ.lin(g, x - k, 0, x, 0, [[0, '#3a0e4a'], [1, '#6a2280']]); g.beginPath(); g.moveTo(x - k * 0.3, y - k * 0.5); g.quadraticCurveTo(x - k * 0.98 + weh, y + k * 0.2, x - k * 0.72 + weh * 1.5, y + k * 0.94); g.lineTo(x + k * 0.1, y + k * 0.9); g.fill();
  // Zauberin (PROFIL.figur = 'w'): lange Haare, violette Robe, kein Bart
  const frau = PROFIL.figur === 'w', robe = frau ? ['#5a1a7a', '#a050d8'] : ['#2a2f8a', '#5a62e0'];
  if (frau) { g.fillStyle = '#e8c070'; g.beginPath(); g.ellipse(x + k * 0.05, y - k * 0.35, k * 0.38, k * 0.5, 0, 0, Math.PI * 2); g.fill(); }
  // Robe
  g.fillStyle = FZ.lin(g, x - k * 0.6, 0, x + k * 0.6, 0, [[0, robe[0]], [1, robe[1]]]);
  g.beginPath(); g.moveTo(x - k * 0.6, y + k * 0.95); g.quadraticCurveTo(x - k * 0.7, y, x - k * 0.25, y - k * 0.45); g.lineTo(x + k * 0.25, y - k * 0.45); g.quadraticCurveTo(x + k * 0.7, y + k * 0.1, x + k * 0.55, y + k * 0.95); g.fill();
  // Glanz auf der Robe, Gürtel mit Schnalle, goldene Borte am Saum, kleine Sterne im Stoff
  g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.moveTo(x + k * 0.05, y - k * 0.4); g.quadraticCurveTo(x + k * 0.45, y + k * 0.2, x + k * 0.35, y + k * 0.9); g.lineTo(x + k * 0.2, y + k * 0.9); g.quadraticCurveTo(x + k * 0.28, y + k * 0.2, x + k * 0.05, y - k * 0.4); g.fill();
  g.fillStyle = '#e0b030'; g.fillRect(x - k * 0.45, y + k * 0.2, k * 0.9, k * 0.1);
  FZ.kreis(g, x + k * 0.05, y + k * 0.25, k * 0.07, '#ffe9a0'); FZ.kreis(g, x + k * 0.05, y + k * 0.25, k * 0.035, '#a0522d');
  g.strokeStyle = '#e0b030'; g.lineWidth = Math.max(1.5, k * 0.07); g.beginPath(); g.moveTo(x - k * 0.6, y + k * 0.93); g.quadraticCurveTo(x, y + k * 1.02, x + k * 0.55, y + k * 0.93); g.stroke();
  for (const [sx, sy, r] of [[-0.25, 0.55, 0.06], [0.25, 0.62, 0.05], [-0.05, 0.75, 0.04], [0.3, 0.05, 0.04]]) {
    g.fillStyle = '#ffe27a'; g.beginPath();
    for (let i = 0; i < 10; i++) { const w = (i / 10) * Math.PI * 2 - Math.PI / 2, rr = k * r * (i % 2 ? 0.45 : 1); g.lineTo(x + k * sx + Math.cos(w) * rr, y + k * sy + Math.sin(w) * rr); }
    g.fill();
  }
  // Kopf, Bart, Hut mit Sternen
  FZ.kreis(g, x + k * 0.05, y - k * 0.6, k * 0.26, '#f2c9a0');
  if (frau) { FZ.kreis(g, x + k * 0.2, y - k * 0.5, k * 0.05, '#f0a090'); g.fillStyle = '#e8c070'; g.fillRect(x - k * 0.22, y - k * 0.82, k * 0.55, k * 0.1); }
  else { g.fillStyle = '#ecebf4'; g.beginPath(); g.moveTo(x - k * 0.2, y - k * 0.55); g.quadraticCurveTo(x + k * 0.05, y + k * 0.15, x + k * 0.3, y - k * 0.55); g.fill(); }
  FZ.kreis(g, x + k * 0.15, y - k * 0.65, k * 0.04, '#1a1020');
  g.fillStyle = FZ.lin(g, x, y - k * 1.6, x, y - k * 0.75, frau ? [[0, '#c070f0'], [1, '#5a1a7a']] : [[0, '#6a72f0'], [1, '#2a2f8a']]);
  g.beginPath(); g.moveTo(x - k * 0.5, y - k * 0.75); g.quadraticCurveTo(x - k * 0.05, y - k * 1.0, x + k * 0.15 + weh, y - k * 1.65); g.quadraticCurveTo(x + k * 0.25, y - k * 1.0, x + k * 0.55, y - k * 0.75); g.fill();
  g.fillStyle = robe[0]; g.fillRect(x - k * 0.55, y - k * 0.8, k * 1.1, k * 0.1);
  FZ.kreis(g, x + k * 0.02, y - k * 1.15, k * 0.05, '#ffe27a'); FZ.kreis(g, x + k * 0.2, y - k * 0.95, k * 0.035, '#ffe27a');
  // Stab mit Leuchtkugel (vorne, Richtung Feld = links)
  const sx = x - k * 0.75, sy = y + k * 0.95, ox = x - k * 0.95, oy = y - k * 0.95 + hub;
  g.strokeStyle = '#6a4424'; g.lineWidth = Math.max(2, k * 0.12); g.lineCap = 'round'; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ox, oy); g.stroke();
  FZ.kreis(g, x - k * 0.62, y - k * 0.1 + hub * 0.6, k * 0.13, '#f2c9a0');
  const gl = zaubert ? 1 : 0.65 + 0.2 * Math.sin(t * 5);
  // Stabkopf: gebogene Halterung mit einem Kristall darin, der leuchtet
  g.strokeStyle = '#8a5a30'; g.lineWidth = Math.max(1.5, k * 0.08); g.beginPath(); g.arc(ox, oy + k * 0.05, k * 0.2, Math.PI * 0.15, Math.PI * 1.05); g.stroke();
  g.fillStyle = FZ.rad(g, ox, oy, k * (zaubert ? 1.0 : 0.6), [[0, `rgba(255,255,255,${gl})`], [0.3, `rgba(200,160,255,${gl * 0.8})`], [1, 'rgba(140,90,255,0)']]); g.beginPath(); g.arc(ox, oy, k * (zaubert ? 1.0 : 0.6), 0, Math.PI * 2); g.fill();
  g.save(); g.translate(ox, oy); g.rotate(Math.sin(t * 2) * 0.15);
  g.fillStyle = FZ.lin(g, -k * 0.12, -k * 0.2, k * 0.12, k * 0.2, [[0, '#ffffff'], [0.4, '#d8b8ff'], [1, '#7a4ad8']]);
  g.beginPath(); g.moveTo(0, -k * 0.24); g.lineTo(k * 0.11, -k * 0.04); g.lineTo(0, k * 0.16); g.lineTo(-k * 0.11, -k * 0.04); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.moveTo(0, -k * 0.2); g.lineTo(k * 0.05, -k * 0.05); g.lineTo(0, -k * 0.02); g.fill();
  g.restore();
  // drei Funkelsterne kreisen um den Hut (nicht beim Schattenklon)
  if (!klon) for (let i = 0; i < 3; i++) {
    const w = t * 1.6 + i * 2.094, sx2 = x + Math.cos(w) * k * 0.75, sy2 = y - k * 1.0 + Math.sin(w) * k * 0.22, z = 0.5 + 0.5 * Math.sin(t * 6 + i * 2);
    g.fillStyle = `rgba(255,240,180,${0.4 + 0.6 * z})`; g.beginPath();
    for (let j = 0; j < 8; j++) { const ww = (j / 8) * Math.PI * 2, rr = k * (j % 2 ? 0.03 : 0.1) * (0.6 + z * 0.5); g.lineTo(sx2 + Math.cos(ww) * rr, sy2 + Math.sin(ww) * rr); }
    g.fill();
  }
  g.restore();
}

// --- 🏰 Magierturm des Helden (mitten im Feld): runder Steinturm, violette Zinnen, zwei Banner; oben steht der Held ---
// (x, y) = Platz des Helden oben auf dem Turm; der Turm reicht nach unten bis y + 1,3·k
// Torturm des Helden mitten auf der Mauer, von oben wie die Ecktürme: das Tor führt unter ihm durch, oben steht der Held
function malHeldenturm(g, x, y, k) {
  const r = k * 1.3;
  FZ.ell(g, x + k * 0.14, y + k * 0.16, r * 1.05, r, 'rgba(0,0,0,.4)');
  // violette Banner hängen oben und unten über die Mauer
  for (const s of [-1, 1]) {
    const by = y + s * r * 0.95;
    g.fillStyle = '#5a2088'; g.beginPath(); g.moveTo(x - k * 0.2, by); g.lineTo(x + k * 0.2, by); g.lineTo(x + k * 0.2, by + s * k * 0.55); g.lineTo(x, by + s * k * 0.42); g.lineTo(x - k * 0.2, by + s * k * 0.55); g.fill();
    FZ.kreis(g, x, by + s * k * 0.22, k * 0.07, '#ffd84a');
  }
  // äußerer Ring aus Steinblöcken, jeder etwas anders getönt
  for (let i = 0; i < 16; i++) {
    const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 1) / 16) * Math.PI * 2 - 0.04, v = rausch(i + 300) * 26 - 13;
    g.fillStyle = `rgb(${150 + v},${157 + v},${176 + v})`;
    g.beginPath(); g.arc(x, y, r, a0, a1); g.arc(x, y, r * 0.72, a1, a0, true); g.closePath(); g.fill();
  }
  g.strokeStyle = '#3d4456'; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
  // Zinnen mit hellem Rand
  for (let i = 0; i < 10; i++) {
    const w = ((i + 0.5) / 10) * Math.PI * 2; if (Math.cos(w) < -0.9) continue;   // zur Feldseite liegt der Torbogen
    const cx = x + Math.cos(w) * r * 0.86, cy = y + Math.sin(w) * r * 0.86;
    g.fillStyle = '#d4dae6'; g.fillRect(cx - k * 0.1, cy - k * 0.1, k * 0.2, k * 0.2); g.strokeStyle = '#5d6578'; g.lineWidth = 1; g.strokeRect(cx - k * 0.1, cy - k * 0.1, k * 0.2, k * 0.2);
  }
  // Torbogen zur Feldseite mit Fallgitter: hier laufen die Monster hinein
  g.fillStyle = '#1e140c'; g.beginPath(); g.ellipse(x - r * 0.9, y, k * 0.2, k * 0.4, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#8a92a4'; g.lineWidth = 1.5; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x - r * 0.9 - k * 0.12, y + i * k * 0.15); g.lineTo(x - r * 0.9 + k * 0.12, y + i * k * 0.15); g.stroke(); }
  // Plattform mit goldenem Rand
  g.fillStyle = FZ.rad(g, x - k * 0.2, y - k * 0.2, r * 0.8, [[0, '#7a5aa8'], [0.7, '#4a2e78'], [1, '#2e1a50']]); g.beginPath(); g.arc(x, y, r * 0.72, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#e8b830'; g.lineWidth = 2.5; g.stroke();
}
// leuchtende Teile des Torturms, jedes Bild neu: drehender Runenkreis und vier schwebende Kristalle
function malHeldenturmGlanz(g, x, y, k, t) {
  const r = k * 0.72, p = 0.5 + 0.5 * Math.sin(t * 2.5);
  g.save(); g.translate(x, y); g.rotate(t * 0.4);
  g.strokeStyle = `rgba(200,170,255,${0.5 + 0.3 * p})`; g.lineWidth = 1.5;
  g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
  g.beginPath(); for (let i = 0; i <= 5; i++) { const w = (i * 2 / 5) * Math.PI * 2 - Math.PI / 2; g[i ? 'lineTo' : 'moveTo'](Math.cos(w) * r, Math.sin(w) * r); } g.stroke();   // Stern
  g.restore();
  for (let i = 0; i < 4; i++) {
    const w = (i / 4) * Math.PI * 2 + Math.PI / 4 - t * 0.3, cx = x + Math.cos(w) * k * 0.8, cy = y + Math.sin(w) * k * 0.8 - Math.sin(t * 2 + i) * k * 0.04;
    g.fillStyle = FZ.rad(g, cx, cy, k * 0.22, [[0, `rgba(190,150,255,${0.35 + 0.25 * p})`], [1, 'rgba(190,150,255,0)']]); g.beginPath(); g.arc(cx, cy, k * 0.22, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d8c4ff'; g.beginPath(); g.moveTo(cx, cy - k * 0.11); g.lineTo(cx + k * 0.06, cy); g.lineTo(cx, cy + k * 0.11); g.lineTo(cx - k * 0.06, cy); g.fill();
    g.fillStyle = '#ffffff'; g.fillRect(cx - k * 0.015, cy - k * 0.07, k * 0.03, k * 0.05);
  }
}

// --- 🛡️ Torwache: Helm, Rock, runder Schild, Speer ---
function malSoldat(g, x, y, s, t, hieb = 0, links = false) {
  const k = s * 0.5;
  g.save(); g.translate(x + hieb, y); if (links) g.scale(-1, 1);
  FZ.ell(g, 0, k * 0.8, k * 0.5, k * 0.15, 'rgba(0,0,0,.35)');
  g.fillStyle = '#4a3a2a'; g.fillRect(-k * 0.25, k * 0.35, k * 0.18, k * 0.45); g.fillRect(k * 0.07, k * 0.35, k * 0.18, k * 0.45);
  g.fillStyle = FZ.lin(g, -k * 0.4, 0, k * 0.4, 0, [[0, '#2a4a8a'], [1, '#4a7ad0']]); g.fillRect(-k * 0.38, -k * 0.2, k * 0.76, k * 0.62);
  FZ.kreis(g, 0, -k * 0.42, k * 0.24, '#f2c9a0');
  g.fillStyle = FZ.lin(g, 0, -k * 0.8, 0, -k * 0.4, [[0, '#e0e6f0'], [1, '#7a8090']]); g.beginPath(); g.arc(0, -k * 0.48, k * 0.27, Math.PI, 0); g.fill();
  g.strokeStyle = '#6a4424'; g.lineWidth = Math.max(1.5, k * 0.08); g.beginPath(); g.moveTo(k * 0.45, k * 0.7); g.lineTo(k * 0.45 + hieb * 0.5, -k * 0.9); g.stroke();
  g.fillStyle = '#d8dee8'; g.beginPath(); g.moveTo(k * 0.37 + hieb * 0.5, -k * 0.88); g.lineTo(k * 0.45 + hieb * 0.5, -k * 1.15); g.lineTo(k * 0.53 + hieb * 0.5, -k * 0.88); g.fill();
  g.fillStyle = FZ.rad(g, -k * 0.35, k * 0.05, k * 0.35, [[0, '#e8c050'], [0.6, '#b08020'], [1, '#6a4a10']]); g.beginPath(); g.arc(-k * 0.35, k * 0.08, k * 0.3, 0, Math.PI * 2); g.fill();
  FZ.kreis(g, -k * 0.35, k * 0.08, k * 0.08, '#fff2b0');
  g.restore();
}

// --- 🌲 Hintergrund einmal malen (Gras, Weg, Bäume, Steine, Mauer) und dann nur kopieren ---
// zwei Größen merken: großes Spielfeld und die kleine Vorschau im Turmblatt
let BODEN = { key: '', cv: null }, BODEN_ALT = { key: '', cv: null };
function bodenBild(W, H, k, n, malMauer, wegeFn) {
  const dpr = window.devicePixelRatio || 1, offen = PORTALE.filter((p) => portalOffen(p, n)).map((p) => p.id).join(','), key = `${W}|${H}|${dpr}|${offen}`;
  if (BODEN.key === key) return BODEN.cv;
  if (BODEN_ALT.key === key) { [BODEN, BODEN_ALT] = [BODEN_ALT, BODEN]; return BODEN.cv; }
  BODEN_ALT = BODEN;
  const cv = document.createElement('canvas');
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const px = (v) => v * k + k / 2, zf = (i) => rausch(i);
  // Gras: Grundverlauf, weiche Flecken, Halme, kleine Blüten
  // etwas gedämpft (wie bei Kingdom Rush), damit Figuren und Türme hervorstechen
  g.fillStyle = FZ.rad(g, W * 0.45, H * 0.5, W * 0.8, [[0, '#4a7a3e'], [1, '#2a4a2e']]); g.fillRect(0, 0, W, H);
  for (let i = 0; i < 110; i++) FZ.ell(g, zf(i + 11) * W, zf(i + 511) * H, k * (0.3 + zf(i + 91) * 0.9), k * (0.15 + zf(i + 191) * 0.35), zf(i + 3) > 0.5 ? 'rgba(110,170,80,.16)' : 'rgba(20,60,30,.18)', zf(i) * 3);
  for (let i = 0; i < 900; i++) {
    const x = zf(i + 1000) * MAUER_X * k, y = zf(i + 3000) * H;
    g.strokeStyle = `rgba(${zf(i) > 0.5 ? '150,210,120' : '60,120,60'},${0.25 + zf(i + 9) * 0.3})`; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (zf(i + 5) - 0.5) * 3, y - 3 - zf(i + 7) * 4); g.stroke();
  }
  // Blumen: kleine Fünfblatt-Blüten mit gelbem Kern (verschiedene Farben), dazu Kleeflecken
  const blume = ['#ffe27a', '#ffffff', '#ff9ac0', '#b8a0ff', '#8fd0ff'];
  for (let i = 0; i < 46; i++) {
    const x = zf(i + 4000) * (MAUER_X - 0.4) * k, y = zf(i + 4100) * H, c = blume[i % blume.length], r = 1.3 + zf(i + 4200) * 0.9;
    for (let b = 0; b < 5; b++) { const w = b * 1.2566 + i; FZ.kreis(g, x + Math.cos(w) * r, y + Math.sin(w) * r, r * 0.75, c); }
    FZ.kreis(g, x, y, r * 0.55, '#f0b030');
  }
  for (let i = 0; i < 24; i++) FZ.ell(g, zf(i + 4300) * MAUER_X * k, zf(i + 4400) * H, k * (0.25 + zf(i + 4500) * 0.3), k * 0.12, 'rgba(120,190,90,.22)', zf(i + 4600) * 3);
  wegeFn(g, px);
  // Bäume (Stamm mit Wurzeln, Krone aus mehreren Ballen: dunkel unten, hell oben links, Blattpunkte) und Steine mit Moos
  for (const d of nachtDeko()) {
    const x = px(d.x), y = px(d.y), v = rausch(Math.round(d.x * 31 + d.y * 7));
    if (d.baum) {
      FZ.ell(g, x + k * 0.14, y + k * 0.34, k * 0.5, k * 0.15, 'rgba(0,0,0,.32)');
      g.fillStyle = FZ.lin(g, x - k * 0.08, 0, x + k * 0.08, 0, [[0, '#5a3a22'], [1, '#33200f']]);
      g.beginPath(); g.moveTo(x - k * 0.07, y - k * 0.05); g.lineTo(x - k * 0.09, y + k * 0.3); g.lineTo(x - k * 0.16, y + k * 0.36); g.lineTo(x + k * 0.16, y + k * 0.36); g.lineTo(x + k * 0.09, y + k * 0.3); g.lineTo(x + k * 0.07, y - k * 0.05); g.fill();
      const dk = d.dunkel ? -14 : 0, gr = (dx, dy, r, h) => FZ.kreis(g, x + dx * k, y + dy * k, r * k, `rgb(${30 + h * 0.5 + dk},${78 + h + dk},${46 + h * 0.4 + dk})`);
      gr(0, -0.12, 0.38, 0); gr(-0.2, -0.02, 0.24, 6); gr(0.2, -0.05, 0.25, 4);   // Schattenballen
      gr(-0.08, -0.24, 0.27, 22); gr(0.12, -0.28, 0.22, 26); gr(-0.18, -0.16, 0.18, 30);   // Mitte
      gr(-0.12, -0.34, 0.15, 48); gr(0.04, -0.4, 0.11, 58);   // Licht oben links
      for (let j = 0; j < 7; j++) FZ.kreis(g, x + (rausch(j + v * 100) - 0.5) * k * 0.6, y - k * 0.1 - rausch(j * 3 + v * 50) * k * 0.4, k * 0.025, 'rgba(190,240,150,.45)');
      if (v > 0.6) for (let j = 0; j < 3; j++) FZ.kreis(g, x + (rausch(j + 9 + v) - 0.5) * k * 0.5, y - k * 0.15 - rausch(j + 19) * k * 0.25, k * 0.04, '#e84a3a');   // Äpfel
    } else {
      FZ.ell(g, x + k * 0.05, y + k * 0.1, k * 0.27, k * 0.09, 'rgba(0,0,0,.3)');
      g.fillStyle = FZ.lin(g, 0, y - k * 0.16, 0, y + k * 0.14, [[0, '#c4c8d2'], [0.6, '#8a8f9a'], [1, '#5e636e']]);
      g.beginPath(); g.moveTo(x - k * 0.24, y + k * 0.08); g.lineTo(x - k * 0.2, y - k * 0.08); g.lineTo(x - k * 0.04, y - k * 0.16); g.lineTo(x + k * 0.16, y - k * 0.12); g.lineTo(x + k * 0.25, y + k * 0.02); g.lineTo(x + k * 0.18, y + k * 0.12); g.closePath(); g.fill();
      FZ.ell(g, x - k * 0.08, y - k * 0.08, k * 0.08, k * 0.03, 'rgba(255,255,255,.35)', -0.3);
      if (v > 0.4) FZ.ell(g, x + k * 0.06, y - k * 0.12, k * 0.1, k * 0.04, 'rgba(90,150,60,.85)', 0.2);   // Moos
    }
  }
  // Büsche und Pilze zwischen den Bäumen (feste Lage aus rausch, nie auf dem Weg)
  for (let i = 0; i < 26; i++) {
    const fx = zf(i + 5000) * (MAUER_X - 1), fy = 0.3 + zf(i + 5100) * (NFELD.h - 0.8);
    if (PORTALE.some((p) => wegAbstand(p, fx, fy) < 0.9)) continue;
    const x = px(fx), y = px(fy);
    if (i % 3) {
      FZ.ell(g, x + k * 0.05, y + k * 0.12, k * 0.26, k * 0.07, 'rgba(0,0,0,.25)');
      for (const [dx, dy, r, h] of [[-0.12, 0, 0.14, 0], [0.12, 0, 0.14, 6], [0, -0.08, 0.16, 18], [-0.05, -0.12, 0.08, 40]]) FZ.kreis(g, x + dx * k, y + dy * k, r * k, `rgb(${34 + h * 0.5},${84 + h},${44 + h * 0.4})`);
    } else {
      for (const [dx, h] of [[0, 1], [0.12, 0.7]]) {
        g.fillStyle = '#efe6d0'; g.fillRect(x + dx * k - k * 0.02, y - k * 0.08 * h, k * 0.04, k * 0.1 * h);
        g.fillStyle = '#d8402e'; g.beginPath(); g.arc(x + dx * k, y - k * 0.08 * h, k * 0.07 * h, Math.PI, 0); g.fill();
        FZ.kreis(g, x + dx * k - k * 0.02, y - k * 0.11 * h, k * 0.013, '#fff');
      }
    }
  }
  malMauer(g, k, W, H, 0);
  BODEN = { key, cv };
  return cv;
}
// 🪨 Bauplatz: runde Steinplatte (wie bei Kingdom Rush); auf der Mauer eine Plattform mit Geländer. leer = mit „+“ zum Bauen
function malBauplatz(g, x, y, a, mauer, leer, sel, t, gelaender = false) {
  const r = a * (mauer ? 1.2 : 1.05);
  FZ.ell(g, x, y + a * 0.95, r * 1.02, r * 0.36, 'rgba(0,0,0,.3)');
  g.fillStyle = FZ.lin(g, x - r, 0, x + r, 0, mauer ? [[0, '#6e7688'], [0.5, '#a8b0c2'], [1, '#5e6678']] : [[0, '#7a6a52'], [0.5, '#b8a888'], [1, '#6a5a42']]);
  g.beginPath(); g.ellipse(x, y + a * 0.85, r, r * 0.34, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(30,30,40,.5)'; g.lineWidth = 1.5; g.stroke();
  // Fugen der Platte
  g.strokeStyle = 'rgba(30,30,40,.25)'; g.lineWidth = 1;
  for (let i = 0; i < 6; i++) { const w = (i / 6) * Math.PI * 2; g.beginPath(); g.moveTo(x, y + a * 0.85); g.lineTo(x + Math.cos(w) * r, y + a * 0.85 + Math.sin(w) * r * 0.34); g.stroke(); }
  if (gelaender) {   // Geländer: kleine Zinnen am hinteren Rand (nur oben auf einer Mauer)
    g.fillStyle = '#9aa2b4';
    for (let i = 0; i < 5; i++) { const w = Math.PI + (i + 0.5) * Math.PI / 5; g.fillRect(x + Math.cos(w) * r * 0.95 - a * 0.08, y + a * 0.85 + Math.sin(w) * r * 0.34 - a * 0.22, a * 0.16, a * 0.22); }
  }
  if (sel) { g.strokeStyle = '#ffd84a'; g.lineWidth = 3; g.setLineDash([6, 5]); g.beginPath(); g.ellipse(x, y + a * 0.85, r * 1.1, r * 0.4, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }
  if (leer) {
    const puls = 0.75 + 0.25 * Math.sin(t * 3 + x);
    g.fillStyle = sel ? '#ffd84a' : `rgba(255,255,255,${0.7 * puls})`; g.font = `${Math.round(a * 0.9)}px "Lilita One", sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('+', x, y + a * 0.8);
  }
}
// ✏️ Dunkler Umriss für Figuren und Türme (gut erkennbar auf jedem Untergrund): weicher Schatten ohne Versatz
function mitUmriss(g, fn) {
  g.save(); g.shadowColor = 'rgba(8,10,20,.85)'; g.shadowBlur = 3; fn(); g.restore();
}
// 🔥 Fackeln an der Mauer: flackerndes Licht (jedes Bild neu)
function malFackeln(g, k, H, t) {
  const x = MAUER_X * k - k * 0.05;
  for (const fy of [2.6, 7.4]) {
    const y = fy * k, fl = 0.85 + 0.15 * Math.sin(t * 13 + fy) + 0.05 * Math.sin(t * 31);
    g.fillStyle = FZ.rad(g, x, y, k * 1.6 * fl, [[0, 'rgba(255,180,80,.32)'], [1, 'rgba(255,160,60,0)']]); g.beginPath(); g.arc(x, y, k * 1.6 * fl, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#4a3020'; g.fillRect(x - k * 0.04, y, k * 0.08, k * 0.28);
    g.fillStyle = FZ.rad(g, x, y - k * 0.06, k * 0.2, [[0, '#fff6c0'], [0.5, '#ffb030'], [1, 'rgba(255,80,0,0)']]);
    g.beginPath(); g.ellipse(x, y - k * 0.06, k * 0.11 * fl, k * 0.2 * fl, 0, 0, Math.PI * 2); g.fill();
  }
}
