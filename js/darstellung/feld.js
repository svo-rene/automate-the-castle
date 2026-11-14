'use strict';
// --- Darstellung „feld“: ein Acker in der Burg mit dem Bauern ---------------------------
// Kennt genau eine Art Zustand. apply() nutzen Simulation UND Wiedergabe – beide bleiben so gleich.

const RICHTUNG = { O: [1, 0], S: [0, 1], W: [-1, 0], N: [0, -1] };
const DREH_R = { O: 'S', S: 'W', W: 'N', N: 'O' };
const DREH_L = { O: 'N', N: 'W', W: 'S', S: 'O' };

const FELD = {
  // hof (optional): giessen = alle Setzlinge müssen gegossen werden
  start(lage, hof = null) {
    const t = lage.feld.map((z) => z.split(''));
    const zahl = (z) => t.flat().filter((c) => c === z).length;
    // 🧺 lage.korb = so viele Rüben passen in den Korb (w10 „Genau fünf“): mehr ernten = Fehler, Rüben dahinter bleiben stehen
    const korb = lage.korb || 0;
    // 🧱 Ziegel (wie Robot Karol): z = loser Ziegel zum Aufheben, o = Loch im Weg, m = geflickt; lage.ziegel = Ziegel im Korb am Anfang
    return { w: t[0].length, h: t.length, t, x: lage.x, y: lage.y, dir: lage.dir, ernte: 0, rueben: korb ? Math.min(korb, zahl('r')) : zahl('r'), kaputt: 0, unkraut: zahl('u'), gerupft: 0,
      korb, voll: 0, vorhersage: !!hof?.vorhersage,
      // frisch = das Feld, auf dem der Bauer gerade (ohne Schritt dazwischen) geerntet oder gerupft hat: dort noch zu gießen ist ein Fehler
      // (zwei einzelne if statt elif). Jeder forward() – auch gegen den Zaun – beendet den Besuch (Schlangen-Lösungen wie m7 bearbeiten das letzte Feld zweimal).
      frisch: null, nass: 0,
      // 📦 Variablen-Höfe: meldeVar = die gemeldete Zahl muss in einer Variable stehen; varPflicht = {name: wert} muss es geben
      meldeVar: !!hof?.meldeVar, varPflicht: hof?.varPflicht || null,
      giessen: !!hof?.giessen, setzlinge: zahl('s'), gegossen: 0,
      // 🍂 l = Loch unter Laub (is_hole() sieht es nicht – nur der Plan weiß es), k = Laub auf festem Boden (y2 „Der Pflasterplan“)
      ziegel: lage.ziegel || 0, steine: zahl('z'), gesammelt: 0, loecher: zahl('o') + zahl('l'), gelegt: 0, falsch: 0,
      heim: lage.heim ? { x: lage.x, y: lage.y } : null,
      // 📜 codeRegeln (hoefe.js): [{ muss | nicht: RegExp, text }] – z. B. Listen-Höfe: die Zahl muss aus der Liste kommen
      codeRegeln: hof?.codeRegeln || null,
      // Höfe mit while: gegen den Zaun laufen zählt als Fehler – sonst klappt dort auch for i in range(20) (Spieltest)
      zaun: !!hof?.befehle?.some((b) => b === 'while' || b === 'while_'), bumps: 0 };
  },

  // Quelltext des gerade laufenden Programms (für codeRegeln und varPflicht): setzt simuliere (tag.js) vor PY.run.
  quelle: null,
  // Quelltext ohne Kommentare (sonst zählte „# range(3)“ mit)
  quelleOhneKommentar() {
    return typeof FELD.quelle === 'string' ? FELD.quelle.split('\n').map((z) => z.replace(/#.*$/, '')).join('\n') : null;
  },
  codePruefen(st) {
    if (!st.codeRegeln) return null;
    const sim = typeof SIM !== 'undefined' && SIM.st === st ? SIM : null, src = FELD.quelleOhneKommentar();
    if (!sim || src == null) return null;
    for (const r of st.codeRegeln) {
      if (r.muss && !r.muss.test(src)) return r.text;
      if (r.nicht && r.nicht.test(src)) return r.text;
    }
    return null;
  },

  frei(st, x, y) { return x >= 0 && y >= 0 && x < st.w && y < st.h && st.t[y][x] !== '#'; },

  // Ein Ereignis auf den Zustand anwenden. Setzt am Ereignis, was passiert ist (für Protokoll und Wiedergabe).
  apply(st, ev) {
    if (ev.kind === 'forward') {
      const [dx, dy] = RICHTUNG[st.dir], nx = st.x + dx, ny = st.y + dy;
      st.frisch = null;
      if (FELD.frei(st, nx, ny)) { st.x = nx; st.y = ny; ev.bump = false; } else { ev.bump = true; st.bumps++; }
    } else if (ev.kind === 'harvest') {
      const c = st.t[st.y][st.x];
      ev.got = c === 'r'; ev.leer = '.xzomnlk'.includes(c); ev.fail = null;
      if (c === 'r' && st.korb && st.ernte >= st.korb) {
        ev.got = false; st.voll++; ev.fail = `Der Korb ist voll – mehr als ${st.korb} Rüben passen nicht hinein!`;
      } else if (c === 'r') { st.t[st.y][st.x] = '.'; st.ernte++; st.frisch = `${st.x},${st.y}`; }
      if (c === 's' || c === 'g') { st.t[st.y][st.x] = 'x'; st.kaputt++; ev.fail = 'Du hast einen Setzling ausgerissen! 🌱'; }
      if (c === 'u') { ev.unkraut = true; }
    } else if (ev.kind === 'pull') {
      const c = st.t[st.y][st.x];
      ev.got = c === 'u'; ev.leer = c === '.' || c === 'x'; ev.fail = null;
      if (c === 'u') { st.t[st.y][st.x] = '.'; st.gerupft++; st.frisch = `${st.x},${st.y}`; }
      if (c === 'r') { st.t[st.y][st.x] = '.'; st.kaputt++; ev.fail = 'Du hast eine Rübe ausgerupft! Rüben werden geerntet, nicht gerupft.'; }
      if (c === 's' || c === 'g') { st.t[st.y][st.x] = 'x'; st.kaputt++; ev.fail = 'Du hast einen Setzling ausgerupft! 🌱'; }
    } else if (ev.kind === 'water') {
      const c = st.t[st.y][st.x];
      ev.got = c === 's'; ev.fail = null;
      if (c === 's') { st.t[st.y][st.x] = 'g'; st.gegossen++; }
      // Gießen, wo gerade geerntet/gerupft wurde, oder auf Unkraut: zwei einzelne if machen auf einem Feld zwei Dinge –
      // mit if/elif/else passiert auf jedem Feld genau eins (Didaktik-Prüfung: elif war nie nötig)
      else if (c === 'u') { st.nass++; ev.fail = 'Du hast Unkraut gegossen – jetzt wächst es erst recht! Unkraut wird gerupft.'; }
      else if (c === '.' && st.frisch === `${st.x},${st.y}`) {
        st.nass++; ev.fail = 'Hier hast du gerade geerntet oder gerupft – und dann noch gegossen. Auf jedem Feld soll nur EINS passieren: nimm elif bzw. else.';
      }
    } else if (ev.kind === 'pick') {
      const c = st.t[st.y][st.x];
      ev.got = c === 'z'; ev.fail = null;
      if (c === 'z') { st.t[st.y][st.x] = '.'; st.ziegel++; st.gesammelt++; }
    } else if (ev.kind === 'place') {
      const c = st.t[st.y][st.x];
      ev.got = false; ev.fail = null; ev.leer = st.ziegel <= 0;
      if (ev.leer) { /* nichts im Korb – Zug verschenkt */ }
      else if (c === 'o' || c === 'l') { st.t[st.y][st.x] = 'm'; st.ziegel--; st.gelegt++; ev.got = true; }
      else if (c === 'm') { ev.doppelt = true; }
      else {
        // falscher Platz: auf Pflanzen kaputt, sonst (Erde, loser oder schon falscher Ziegel) liegt er im Weg
        const pflanze = 'rsgu'.includes(c);
        st.ziegel--; st.falsch++; if (pflanze) st.kaputt++;
        ev.fail = pflanze ? 'Der Ziegel ist auf eine Pflanze gefallen!' : c === 'k' ? 'Unter diesem Laub ist fester Boden, kein Loch – der Ziegel liegt jetzt im Weg. Schau in den Plan!' : 'Hier ist kein Loch – der Ziegel liegt jetzt im Weg.';
        if (c === 'z') st.steine--;   // der lose Ziegel darunter ist verbaut
        st.t[st.y][st.x] = 'n';
      }
    } else if (ev.kind === 'right') st.dir = DREH_R[st.dir];
    else if (ev.kind === 'left') st.dir = DREH_L[st.dir];
    return ev;
  },

  sense(st, kind) {
    if (kind === 'can_harvest') return st.t[st.y][st.x] === 'r';
    if (kind === 'is_weed') return st.t[st.y][st.x] === 'u';
    if (kind === 'is_hole') return st.t[st.y][st.x] === 'o';
    if (kind === 'can_move') { const [dx, dy] = RICHTUNG[st.dir]; return FELD.frei(st, st.x + dx, st.y + dy); }
    return false;
  },

  // Protokollzeile für ein Ereignis (null = nichts Besonderes)
  meldung(st, ev) {
    if (ev.kind === 'forward' && ev.bump) return [st.zaun ? '💥 Gegen den Zaun! Frag vorher mit can_move().' : '💥 Da ist kein Weg – der Zug ist verschenkt.', 'err'];
    if (ev.kind === 'harvest' && ev.fail) return [ev.fail, 'err'];
    if (ev.kind === 'harvest' && ev.got) return [`🥕 Rübe geerntet (${st.ernte}/${st.rueben})`, 'ok'];
    if (ev.kind === 'harvest' && ev.leer) return ['🤷 Hier wächst nichts – der Zug ist verschenkt.', 'leise'];
    if (ev.kind === 'harvest' && ev.unkraut) return ['🌿 Unkraut kann man nicht ernten – das wird gerupft (pull).', 'leise'];
    if (ev.kind === 'pull' && ev.fail) return [ev.fail, 'err'];
    if (ev.kind === 'pull' && ev.got) return [`🌿 Unkraut gerupft (${st.gerupft}/${st.unkraut})`, 'ok'];
    if (ev.kind === 'pull') return ['🤷 Hier ist kein Unkraut – der Zug ist verschenkt.', 'leise'];
    if (ev.kind === 'water' && ev.fail) return [ev.fail, 'err'];
    if (ev.kind === 'water' && ev.got) return [`💧 Setzling gegossen (${st.gegossen}/${st.setzlinge})`, 'ok'];
    if (ev.kind === 'water') return ['💧 Das Wasser versickert – hier braucht nichts Wasser.', 'leise'];
    if (ev.kind === 'pick' && ev.got) return [`🧱 Ziegel aufgehoben (im Korb: ${st.ziegel})`, 'ok'];
    if (ev.kind === 'pick') return ['🤷 Hier liegt kein Ziegel – der Zug ist verschenkt.', 'leise'];
    if (ev.kind === 'place' && ev.leer) return ['🧺 Dein Korb ist leer – erst einen Ziegel aufheben (pick_up).', 'err'];
    if (ev.kind === 'place' && ev.got) return [`🧱 Loch geflickt (${st.gelegt}/${st.loecher})`, 'ok'];
    if (ev.kind === 'place' && ev.doppelt) return ['🧱 Hier ist schon geflickt – der Zug ist verschenkt.', 'leise'];
    if (ev.kind === 'place' && ev.fail) return [ev.fail, 'err'];
    return null;
  },

  pruefe(st) {
    // 🧱 Gibt es Löcher, zählen die Löcher; sonst müssen alle losen Ziegel eingesammelt werden
    // 🔮 Vorhersage-Höfe: Der feste Code muss den Hof nicht „schaffen“ – Ablenk-Rüben bleiben absichtlich stehen
    if (st.vorhersage && !st.kaputt) return { ok: true, msg: 'So ist der Code gelaufen – vergleiche mit deiner Vorhersage.', anteil: 1 };
    const zSoll = st.loecher || st.steine, zIst = st.loecher ? st.gelegt : st.gesammelt;
    const anteil = (st.ernte + st.gerupft + (st.giessen ? st.gegossen : 0) + zIst) / Math.max(1, st.rueben + st.unkraut + (st.giessen ? st.setzlinge : 0) + zSoll);
    if (st.kaputt) return { ok: false, msg: 'Eine Pflanze wurde ausgerissen.', anteil };
    if (st.voll) return { ok: false, msg: `Der Korb war voll, aber der Bauer wollte weiter ernten. Hör nach ${st.korb} Rüben auf.`, anteil };
    if (st.nass) return { ok: false, msg: 'Falsch gegossen: Auf einem Feld hat der Bauer zwei Dinge gemacht oder Unkraut gegossen. Mit if/elif/else passiert auf jedem Feld genau eins.', anteil };
    if (st.falsch) return { ok: false, msg: `${st.falsch === 1 ? 'Ein Ziegel liegt' : `${st.falsch} Ziegel liegen`} am falschen Platz.`, anteil };
    if (st.loecher && st.gelegt < st.loecher) return { ok: false, msg: st.loecher === 1 ? 'Das Loch ist noch nicht geflickt.' : `${st.gelegt} von ${st.loecher} Löchern geflickt.`, anteil };
    if (!st.loecher && st.gesammelt < st.steine) return { ok: false, msg: `${st.gesammelt} von ${st.steine} Ziegeln eingesammelt.`, anteil };
    if (st.ernte < st.rueben) return { ok: false, msg: `${st.ernte} von ${st.rueben} Rüben geerntet.`, anteil };
    if (st.gerupft < st.unkraut) return { ok: false, msg: `${st.gerupft} von ${st.unkraut} Unkräutern gerupft.`, anteil };
    if (st.giessen && st.gegossen < st.setzlinge) return { ok: false, msg: `${st.gegossen} von ${st.setzlinge} Setzlingen gegossen.`, anteil };
    if (st.heim && (st.x !== st.heim.x || st.y !== st.heim.y)) return { ok: false, msg: 'Alles geerntet – aber der Bauer steht nicht auf seinem Startfeld 🏠.', anteil: 0.8 };
    // einmal ist erlaubt (Schlangen-Lösungen enden mit einer Kurve zu viel); for statt while stößt auf verschieden langen Höfen öfter an
    if (st.zaun && st.bumps > 1) return { ok: false, msg: `Alles erledigt – aber der Bauer ist ${st.bumps}-mal gegen den Zaun gelaufen. Frag mit can_move(), ob der Weg frei ist.`, anteil: 0.85 };
    const v = FELD.variablenPruefen(st) || FELD.codePruefen(st);
    if (v) return { ok: false, msg: v, anteil: 0.7 };
    const teile = [st.rueben && `${st.rueben} 🥕 geerntet`, st.unkraut && `${st.unkraut} 🌿 gerupft`, st.giessen && st.setzlinge && `${st.setzlinge} 🌱 gegossen`,
      st.loecher && `${st.loecher} 🧱 Löcher geflickt`, !st.loecher && st.steine && `${st.steine} 🧱 Ziegel eingesammelt`].filter(Boolean);
    return { ok: true, msg: teile.length ? `Alles erledigt: ${teile.join(', ')}!` : 'Geschafft!', anteil: 1 };
  },

  // 📦 Variablen-Höfe (Didaktik-Prüfung 2026-11-13: v1, v9, s8 … gingen mit print(3)): Jedes Ereignis trägt die Variablen
  // vor dem Schritt (ev.vars, JSON aus python.js _vars). Gelesen wird der Lauf, der gerade geprüft wird (SIM aus tag.js).
  // Rückgabe: Fehlertext oder null
  variablenPruefen(st) {
    if (!st.meldeVar && !st.varPflicht) return null;
    const sim = typeof SIM !== 'undefined' && SIM.st === st ? SIM : null;
    if (!sim) return null;
    const vars = (ev) => { try { return ev?.vars ? JSON.parse(ev.vars) : {}; } catch (e) { return {}; } };
    if (st.meldeVar) {
      const p = sim.ev.filter((e) => e.kind === 'print').pop();
      const zahl = p && (String(p.text).match(/-?\d+(?:\.\d+)?/g) || []).pop();
      let namen = zahl == null ? [] : Object.entries(vars(p)).filter(([, w]) => typeof w === 'number' && w === Number(zahl)).map(([n]) => n);
      // Nur Namen, die wirklich im print stehen (sonst zählte z. B. die Schleifenvariable i, die zufällig denselben Wert hat)
      const zeile = typeof FELD.quelle === 'string' && p ? FELD.quelle.split('\n')[p.line - 1] : null;
      const imPrint = zeile && /\bprint\s*\(/.test(zeile) ? new Set(zeile.slice(zeile.search(/\bprint\s*\(/) + 5).replace(/"[^"]*"|'[^']*'/g, '').match(/[A-Za-z_]\w*/g) || []) : null;
      if (imPrint) namen = namen.filter((n) => imPrint.has(n));
      if (zahl != null && !namen.length) {
        return `Die Zahl ${zahl} hast du fest eingetippt – sie steht in keiner Variable. Zähl mit einer Variable mit (z. B. ernte = ernte + 1) und melde die Variable: print(ernte).`;
      }
      // Nachprüfung 2026-11-14: ernte = 3 · print(ernte) bestand – die Kiste muss beim Zählen wirklich mitgezählt haben (≥ 2 Werte im Lauf)
      const werte = (n) => new Set(sim.ev.map((e) => vars(e)[n]).filter((w) => w !== undefined)).size;
      if (namen.length && !namen.some((n) => werte(n) >= 2)) {
        const n = namen[0];
        return `Die Variable ${n} hatte die ganze Zeit denselben Wert ${zahl} – da hat niemand gezählt, die Zahl ist nur fest hineingeschrieben. Leg die Kiste ganz vorn mit ihrem Startwert an und ändere sie unterwegs bei jedem Schritt, der zählt (z. B. ${n} = ${n} + 1 oder ${n} = ${n} - 1).`;
      }
    }
    const src = FELD.quelleOhneKommentar();
    for (const [name, wert] of Object.entries(st.varPflicht || {})) {
      if (!sim.ev.some((e) => vars(e)[name] === wert)) return `Alles erledigt – aber die Variable ${name} fehlt. Leg sie oben an (${name} = ${wert}) und benutze sie in range(${name}).`;
      // Nachprüfung 2026-11-14: seite = 5 anlegen und dann doch range(5) schreiben bestand – die Schleife muss die Variable benutzen
      if (src != null && !new RegExp(`range\\([^)]*\\b${name}\\b`).test(src)) {
        return `Die Kiste ${name} ist angelegt – aber keine Schleife benutzt sie. Schreib range(${name}) statt range(${wert}): Dann zählt die Schleife mit dem Wert aus der Kiste.`;
      }
    }
    return null;
  },

  // Zeichnen: Burgmauer oben, Wiese, Zaun, Acker, Pflanzen, Bauer.
  // von = vorige Position des Bauern {x, y, dir}, p = Fortschritt 0…1 der Bewegung
  draw(cv, st, von, p = 1) {
    // So groß wie Breite und Fensterhöhe es erlauben (Burgmauer oben + Rand zählen mit)
    const box = cv.parentElement.clientWidth - 16, hoehe = window.innerHeight - 300;
    const k = Math.max(30, Math.min(130, Math.floor(box / (st.w + 1.4)), Math.floor(hoehe / (st.h + 2.3)))), dpr = window.devicePixelRatio || 1;
    const m = Math.round(k * 0.7), top = Math.round(k * 1.6);
    const W = st.w * k + 2 * m, H = top + st.h * k + m;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      // Höhe folgt der Breite; max-width (CSS) verhindert, dass das Bild seinen Kasten aufbläht
      cv.style.width = W + 'px'; cv.style.height = 'auto';
    }
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    zeichneUmgebung(g, W, H, k, m, top, st.w);
    const ox = m, oy = top;
    for (let y = 0; y < st.h; y++) {
      for (let x = 0; x < st.w; x++) zeichneScholle(g, ox + x * k, oy + y * k, k, st.t[y][x], x + y);
    }
    // Heimfeld: Strohmatte mit kleinem Haus (gezeichnet)
    if (st.heim) {
      const hx = ox + st.heim.x * k, hy = oy + st.heim.y * k;
      g.fillStyle = 'rgba(240, 210, 120, .55)'; g.fillRect(hx + k * 0.1, hy + k * 0.1, k * 0.8, k * 0.8);
      g.strokeStyle = '#c99a3a'; g.lineWidth = 2; g.strokeRect(hx + k * 0.1, hy + k * 0.1, k * 0.8, k * 0.8);
      const hx0 = hx + k * 0.12, hy0 = hy + k * 0.14, hs = k * 0.26;
      g.fillStyle = '#f1dfb8'; g.fillRect(hx0, hy0 + hs * 0.45, hs, hs * 0.6);
      g.fillStyle = '#b5452f'; g.beginPath(); g.moveTo(hx0 - hs * 0.15, hy0 + hs * 0.5); g.lineTo(hx0 + hs / 2, hy0); g.lineTo(hx0 + hs * 1.15, hy0 + hs * 0.5); g.fill();
      g.fillStyle = '#7a4a24'; g.fillRect(hx0 + hs * 0.4, hy0 + hs * 0.7, hs * 0.22, hs * 0.35);
    }
    // 🔮 Vorhersage: angetippte Felder (gelb umrandet) und die 🏁 Fahne fürs Endfeld; FELD.geo für die Klick-Umrechnung
    FELD.geo = { W, ox, oy, k, w: st.w, h: st.h };
    if (FELD.marken) {
      for (const key of FELD.marken.felder || []) {
        const [fx, fy] = key.split(',').map(Number), x0 = ox + fx * k, y0 = oy + fy * k;
        g.fillStyle = 'rgba(255, 216, 74, .28)'; g.fillRect(x0 + 2, y0 + 2, k - 4, k - 4);
        g.strokeStyle = '#ffd84a'; g.lineWidth = 3; g.strokeRect(x0 + 3, y0 + 3, k - 6, k - 6);
        g.font = `${Math.round(k * 0.3)}px system-ui`; g.textAlign = 'right'; g.textBaseline = 'top'; g.fillStyle = '#fff'; g.fillText('✔', x0 + k - 5, y0 + 4);
      }
      if (FELD.marken.ende) {
        const [fx, fy] = FELD.marken.ende.split(',').map(Number), x0 = ox + fx * k, y0 = oy + fy * k;
        g.strokeStyle = '#ff7a3a'; g.lineWidth = 3; g.setLineDash([6, 4]); g.strokeRect(x0 + 3, y0 + 3, k - 6, k - 6); g.setLineDash([]);
        g.font = `${Math.round(k * 0.45)}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🏁', x0 + k * 0.72, y0 + k * 0.3);
      }
      g.textBaseline = 'alphabetic';
    }
    // Bauer (gleitet von der vorigen Position, wippt beim Laufen) – gezeichnet statt Emoji
    const a = von || st, rx = a.x + (st.x - a.x) * p, ry = a.y + (st.y - a.y) * p;
    const cx = ox + rx * k + k / 2, cy = oy + ry * k + k / 2;
    const laeuft = von && p < 1 && (von.x !== st.x || von.y !== st.y);
    malBauer(g, cx, cy - (laeuft ? Math.abs(Math.sin(p * Math.PI * 2)) * k * 0.06 : 0), k, st.dir, laeuft ? p : 0);
    // Effekte (Ernte, Wasser, Rupfen, Staub) über allem
    feldEffekteZeichnen(g, ox, oy, k, W, H, m);
    FELD.letzt = { cv, st, von, p };
    // Blickrichtung als gelbes Dreieck
    const [dx, dy] = RICHTUNG[st.dir], r = k * 0.5, s = k * 0.11;
    g.fillStyle = '#ffd84a'; g.strokeStyle = '#6a4a00'; g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(cx + dx * r, cy + dy * r);
    g.lineTo(cx + dx * (r - s * 1.5) - dy * s, cy + dy * (r - s * 1.5) + dx * s);
    g.lineTo(cx + dx * (r - s * 1.5) + dy * s, cy + dy * (r - s * 1.5) - dx * s);
    g.closePath(); g.fill(); g.stroke();
    // Korb mit der Ernte
    g.font = `${Math.round(Math.min(18, Math.max(12, m * 0.55)))}px system-ui`; g.textAlign = 'right';   // gleich groß, egal wie groß der Acker ist
    g.fillStyle = '#fff';
    if (st.rueben) g.fillText(`🧺 ${st.ernte}/${st.rueben}`, W - 8, H - m / 2);
    // 🧱 Ziegel im Korb
    if (st.steine || st.loecher || st.ziegel) { g.textAlign = 'left'; g.fillText(`🧱 ${st.ziegel} im Korb`, 8, H - m / 2); }
  },
};

// 🧑‍🌾 Der Bauer: Strohhut, rotes Hemd, blaue Latzhose, Hacke in Blickrichtung; schaut nach oben = Rücken
function malBauer(g, cx, cy, k, dir, schritt) {
  const [dx, dy] = RICHTUNG[dir], s = k * 0.5, bein = Math.sin(schritt * Math.PI * 4) * s * 0.12, hinten = dir === 'N';
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(cx, cy + s * 0.7, s * 0.55, s * 0.18, 0, 0, Math.PI * 2); g.fill();
  // Hacke (hinter dem Körper, wenn er nach oben schaut)
  const hacke = () => {
    g.strokeStyle = '#8a5a30'; g.lineWidth = Math.max(2, s * 0.1); g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx + dx * s * 0.2, cy + s * 0.3); g.lineTo(cx + dx * s * 0.75 + (dy ? s * 0.45 : 0), cy - s * 0.35 + dy * s * 0.3); g.stroke();
    g.fillStyle = '#9aa2b0'; g.beginPath(); g.arc(cx + dx * s * 0.75 + (dy ? s * 0.45 : 0), cy - s * 0.35 + dy * s * 0.3, s * 0.12, 0, Math.PI * 2); g.fill();
  };
  if (hinten) hacke();
  g.fillStyle = '#4a3a2a'; g.fillRect(cx - s * 0.28, cy + s * 0.25, s * 0.2, s * 0.42 + bein); g.fillRect(cx + s * 0.08, cy + s * 0.25, s * 0.2, s * 0.42 - bein);
  g.fillStyle = '#d04a3a'; g.beginPath(); g.ellipse(cx, cy, s * 0.42, s * 0.4, 0, 0, Math.PI * 2); g.fill();
  const hose = g.createLinearGradient(cx - s * 0.4, 0, cx + s * 0.4, 0); hose.addColorStop(0, '#2a5aa8'); hose.addColorStop(1, '#4a82d8');
  g.fillStyle = hose; g.fillRect(cx - s * 0.36, cy - s * 0.05, s * 0.72, s * 0.42); g.fillRect(cx - s * 0.2, cy - s * 0.3, s * 0.4, s * 0.3);
  g.fillStyle = '#ffd84a'; g.beginPath(); g.arc(cx - s * 0.13, cy - s * 0.22, s * 0.05, 0, Math.PI * 2); g.arc(cx + s * 0.13, cy - s * 0.22, s * 0.05, 0, Math.PI * 2); g.fill();
  // Kopf und Strohhut; Bäuerin (PROFIL.figur = 'w') mit zwei Zöpfen
  const frau = PROFIL.figur === 'w';
  if (frau) for (const sx of [-1, 1]) {
    g.fillStyle = '#a0602a'; g.beginPath(); g.ellipse(cx + sx * s * 0.3, cy - s * 0.35, s * 0.1, s * 0.25, sx * 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d04a3a'; g.beginPath(); g.arc(cx + sx * s * 0.34, cy - s * 0.12, s * 0.06, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#f2c9a0'; g.beginPath(); g.arc(cx, cy - s * 0.55, s * 0.3, 0, Math.PI * 2); g.fill();
  if (frau && !hinten) { g.fillStyle = '#a0602a'; g.beginPath(); g.ellipse(cx, cy - s * 0.7, s * 0.28, s * 0.1, 0, 0, Math.PI * 2); g.fill(); }
  if (frau && hinten) { g.fillStyle = '#a0602a'; g.beginPath(); g.arc(cx, cy - s * 0.55, s * 0.28, 0, Math.PI * 2); g.fill(); }
  if (!hinten) {
    const ax = dx * s * 0.1, ay = dy * s * 0.05;
    g.fillStyle = '#1a1020';
    if (dx) { g.beginPath(); g.arc(cx + dx * s * 0.15, cy - s * 0.57, s * 0.04, 0, Math.PI * 2); g.fill(); }
    else { for (const ex of [-0.1, 0.1]) { g.beginPath(); g.arc(cx + ex * s + ax, cy - s * 0.55 + ay, s * 0.04, 0, Math.PI * 2); g.fill(); } }
    g.fillStyle = '#e89a7a'; g.beginPath(); g.arc(cx + dx * s * 0.25, cy - s * 0.48, s * 0.05, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#e8c860'; g.beginPath(); g.ellipse(cx, cy - s * 0.72, s * 0.58, s * 0.16, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#d8b040'; g.beginPath(); g.ellipse(cx, cy - s * 0.85, s * 0.3, s * 0.2, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#b5452f'; g.fillRect(cx - s * 0.3, cy - s * 0.82, s * 0.6, s * 0.06);
  if (!hinten) hacke();
}

// ✨ Kleine Effekte auf dem Acker (nur Bild): ausgelöst aus der Wiedergabe (feldEffekt in tag.js), Koordinaten in Feldern
let FELD_FX = [], FELD_FX_LAUF = false;
function feldEffekt(ev, st) {
  const t0 = performance.now() / 1000, x = st.x, y = st.y, neu = (o) => FELD_FX.push({ t0, x, y, ...o });
  if (ev.kind === 'harvest' && ev.got) neu({ typ: 'ruebe', dauer: 0.9 });
  else if (ev.kind === 'water') neu({ typ: 'wasser', dauer: 0.8, gut: ev.got });
  else if (ev.kind === 'pull' && ev.got) neu({ typ: 'rupfen', dauer: 0.8 });
  else if (ev.kind === 'pick' && ev.got) neu({ typ: 'hebe', dauer: 0.7 });
  else if (ev.kind === 'place' && ev.got) neu({ typ: 'ziegel', dauer: 0.6 });
  else if (ev.kind === 'forward' && ev.bump) { const [dx, dy] = RICHTUNG[st.dir]; neu({ typ: 'bums', dauer: 0.7, x: x + dx * 0.45, y: y + dy * 0.45 }); }
  else if (ev.kind === 'forward') { const [dx, dy] = RICHTUNG[st.dir]; neu({ typ: 'staub', dauer: 0.5, x: x - dx * 0.4, y: y - dy * 0.4 }); }
  if (ev.fail) neu({ typ: 'fehler', dauer: 1.2 });
  // Läuft keine Wiedergabe mehr, malt eine kleine Schleife weiter, bis die Effekte vorbei sind
  if (!FELD_FX_LAUF) {
    FELD_FX_LAUF = true;
    const schleife = () => {
      if (!FELD_FX.length) { FELD_FX_LAUF = false; return; }
      if (!LAUF && FELD.letzt && document.body.contains(FELD.letzt.cv)) FELD.draw(FELD.letzt.cv, FELD.letzt.st, null, 1);
      else if (!FELD.letzt || !document.body.contains(FELD.letzt.cv)) FELD_FX = [];   // Acker weg: Effekte verwerfen, Schleife endet
      requestAnimationFrame(schleife);
    };
    requestAnimationFrame(schleife);
  }
}
function feldEffekteZeichnen(g, ox, oy, k, W, H, m) {
  const jetzt = performance.now() / 1000;
  FELD_FX = FELD_FX.filter((f) => jetzt - f.t0 < f.dauer);
  for (const f of FELD_FX) {
    const q = (jetzt - f.t0) / f.dauer, cx = ox + f.x * k + k / 2, cy = oy + f.y * k + k / 2;
    g.save(); g.globalAlpha = Math.max(0, 1 - q * q);
    if (f.typ === 'ruebe') {
      // Rübe springt hoch und fliegt zum Korb unten rechts, Funken drumherum
      const zx = W - m * 1.8, zy = H - m / 2, bx = cx + (zx - cx) * q * q, by = cy + (zy - cy) * q * q - Math.sin(q * Math.PI) * k * 0.9;
      g.translate(bx, by); g.rotate(q * 4);
      g.fillStyle = '#f08a24'; g.beginPath(); g.moveTo(-k * 0.1, -k * 0.08); g.lineTo(k * 0.1, -k * 0.08); g.lineTo(0, k * 0.25); g.fill();
      g.fillStyle = '#52b848'; g.beginPath(); g.ellipse(0, -k * 0.14, k * 0.05, k * 0.1, 0, 0, Math.PI * 2); g.fill();
      g.restore(); g.save(); g.globalAlpha = Math.max(0, 1 - q);
      for (let i = 0; i < 6; i++) { const a = i * 1.05 + q * 3, d = k * (0.15 + q * 0.5); g.fillStyle = i % 2 ? '#ffe680' : '#ffffff'; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d - q * k * 0.3, k * 0.035, 0, Math.PI * 2); g.fill(); }
    } else if (f.typ === 'wasser') {
      // Gießkanne kippt, Tropfen fallen, Pfütze breitet sich aus
      for (let i = 0; i < 7; i++) { const dx = (i - 3) * k * 0.07, dy = -k * 0.45 + ((q * 3 + i * 0.13) % 1) * k * 0.55; g.fillStyle = '#7cc8ff'; g.beginPath(); g.ellipse(cx + dx, cy + dy, k * 0.025, k * 0.045, 0, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = f.gut ? 'rgba(124,200,255,.8)' : 'rgba(160,170,190,.6)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy + k * 0.2, k * 0.15 + q * k * 0.25, k * 0.06 + q * k * 0.1, 0, 0, Math.PI * 2); g.stroke();
    } else if (f.typ === 'rupfen') {
      // Blätter und Erdkrümel fliegen weg
      for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.35, d = q * k * 0.7; g.fillStyle = i % 2 ? '#3d7d33' : '#6a4a2a'; g.beginPath(); g.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d + q * q * k * 0.6, k * 0.06, k * 0.03, a + q * 5, 0, Math.PI * 2); g.fill(); }
    } else if (f.typ === 'hebe' || f.typ === 'ziegel') {
      // 🧱 Ziegel fliegt in den Korb (unten links) bzw. fällt von oben ins Loch, Staub am Boden
      const hebe = f.typ === 'hebe', zx = m * 1.2, zy = H - m / 2;
      const bx = hebe ? cx + (zx - cx) * q * q : cx, by = hebe ? cy + (zy - cy) * q * q - Math.sin(q * Math.PI) * k * 0.8 : cy - (1 - Math.min(1, q * 2.2)) * k * 1.2;
      g.fillStyle = '#b8503a'; g.strokeStyle = '#7a2e20'; g.lineWidth = 1.5;
      g.fillRect(bx - k * 0.2, by - k * 0.11, k * 0.4, k * 0.22); g.strokeRect(bx - k * 0.2, by - k * 0.11, k * 0.4, k * 0.22);
      if (!hebe && q > 0.45) for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(200,170,120,.6)'; g.beginPath(); g.arc(cx + (i - 2) * k * 0.14, cy + k * 0.22 - (q - 0.45) * k * 0.3, k * (0.05 + (q - 0.45) * 0.12), 0, Math.PI * 2); g.fill(); }
    } else if (f.typ === 'staub') {
      for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(200,170,120,.55)'; g.beginPath(); g.arc(cx + (i - 1) * k * 0.12, cy + k * 0.3 - q * k * 0.1, k * (0.06 + q * 0.08), 0, Math.PI * 2); g.fill(); }
    } else if (f.typ === 'bums') {
      g.fillStyle = 'rgba(255,80,60,.35)'; g.beginPath(); g.arc(cx, cy, k * (0.2 + q * 0.2), 0, Math.PI * 2); g.fill();
      g.font = `bold ${Math.round(k * 0.45)}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = '#3a0a0a'; g.strokeText('!', cx, cy - q * k * 0.3); g.fillStyle = '#ff5a4a'; g.fillText('!', cx, cy - q * k * 0.3);
    } else if (f.typ === 'fehler') {
      g.strokeStyle = '#ff4a3a'; g.lineWidth = Math.max(3, k * 0.08); g.lineCap = 'round';
      const r = k * 0.25 * (1 + q * 0.3); g.beginPath(); g.moveTo(cx - r, cy - r); g.lineTo(cx + r, cy + r); g.moveTo(cx + r, cy - r); g.lineTo(cx - r, cy + r); g.stroke();
    }
    g.restore();
  }
}

// Kleine feste „Zufallszahl“ je Stelle – damit Gras und Steine bei jedem Bild gleich liegen
const rausch = (i) => { const v = Math.sin(i * 12.9898) * 43758.5453; return v - Math.floor(v); };

function zeichneUmgebung(g, W, H, k, m, top, breite) {
  // Himmel und Burgmauer
  const zinne = k * 0.32, wandUnten = top - k * 0.28;
  g.fillStyle = '#9fd3f5'; g.fillRect(0, 0, W, zinne);
  const wand = g.createLinearGradient(0, zinne, 0, wandUnten);
  wand.addColorStop(0, '#a3abbd'); wand.addColorStop(1, '#7c8599');
  g.fillStyle = wand; g.fillRect(0, zinne, W, wandUnten - zinne);
  g.fillStyle = '#a3abbd';
  for (let x = 0; x < W; x += k * 0.7) g.fillRect(x, 0, k * 0.42, zinne + 1);
  // einzelne Steine, leicht unterschiedlich getönt, oben ein Lichtstreifen
  const stein = k * 0.3;
  for (let y = zinne, r = 0; y < wandUnten; y += stein, r++) {
    for (let x = (r % 2) * -stein, i = 0; x < W; x += stein * 2, i++) {
      const v = rausch(r * 37 + i * 11) * 28 - 14, h = Math.min(stein, wandUnten - y);
      g.fillStyle = `rgb(${155 + v},${163 + v},${181 + v})`; g.fillRect(x + 1, y + 1, stein * 2 - 2, h - 2);
      g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(x + 1, y + 1, stein * 2 - 2, 2);
    }
  }
  // Fahnen an der Mauer
  for (let i = 0; i < Math.max(1, Math.floor(breite / 4)); i++) {
    const fx = (W / (Math.max(1, Math.floor(breite / 4)) + 1)) * (i + 1), fy = zinne + 2;
    g.fillStyle = '#b8402e';
    g.beginPath(); g.moveTo(fx - k * 0.2, fy); g.lineTo(fx + k * 0.2, fy); g.lineTo(fx + k * 0.2, fy + k * 0.6); g.lineTo(fx, fy + k * 0.48); g.lineTo(fx - k * 0.2, fy + k * 0.6); g.fill();
    g.fillStyle = '#ffd84a'; g.beginPath(); g.arc(fx, fy + k * 0.24, k * 0.07, 0, Math.PI * 2); g.fill();
  }
  // Wiese
  const gras = g.createLinearGradient(0, wandUnten, 0, H);
  gras.addColorStop(0, '#4f8f3c'); gras.addColorStop(1, '#5fa548');
  g.fillStyle = gras; g.fillRect(0, wandUnten, W, H - wandUnten);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, wandUnten, W, 4);
  for (let i = 0; i < W / 6; i++) {
    const x = rausch(i) * W, y = wandUnten + 6 + rausch(i + 99) * (H - wandUnten - 8);
    g.fillStyle = i % 9 === 0 ? '#ffe36b' : i % 13 === 0 ? '#fff' : 'rgba(140, 210, 110, .55)';
    g.fillRect(x, y, i % 9 === 0 || i % 13 === 0 ? 3 : 2, i % 9 === 0 || i % 13 === 0 ? 3 : 5);
  }
  // Holzzaun um den Acker
  const fx0 = m - 7, fy0 = top - 7, fw = W - 2 * m + 14, fh = H - top - m + 14;
  g.strokeStyle = '#8a5a2b'; g.lineWidth = 3;
  g.strokeRect(fx0, fy0, fw, fh);
  g.strokeStyle = '#b07a42'; g.lineWidth = 1.5;
  g.strokeRect(fx0 - 3, fy0 - 3, fw + 6, fh + 6);
  g.fillStyle = '#6e4520';
  for (let x = fx0; x <= fx0 + fw + 1; x += k) { g.fillRect(x - 2.5, fy0 - 6, 5, 9); g.fillRect(x - 2.5, fy0 + fh - 3, 5, 9); }
  for (let y = fy0; y <= fy0 + fh + 1; y += k) { g.fillRect(fx0 - 6, y - 2.5, 9, 5); g.fillRect(fx0 + fw - 3, y - 2.5, 9, 5); }
}

function zeichneScholle(g, x, y, k, c, i) {
  if (c === '#') {
    // Zaun im Acker: Gras mit Holzgatter
    g.fillStyle = '#4f8f3c'; g.fillRect(x, y, k, k);
    g.fillStyle = '#7a4c22';
    g.fillRect(x + k * 0.18, y + k * 0.2, k * 0.12, k * 0.65); g.fillRect(x + k * 0.7, y + k * 0.2, k * 0.12, k * 0.65);
    g.fillStyle = '#a8713a';
    g.fillRect(x + k * 0.1, y + k * 0.32, k * 0.8, k * 0.1); g.fillRect(x + k * 0.1, y + k * 0.58, k * 0.8, k * 0.1);
    return;
  }
  g.fillStyle = i % 2 ? '#7a5030' : '#82573a'; g.fillRect(x, y, k, k);
  g.strokeStyle = '#5f3d20'; g.lineWidth = Math.max(1.5, k * 0.05);
  for (const f of [0.3, 0.7]) { g.beginPath(); g.moveTo(x + 3, y + k * f); g.lineTo(x + k - 3, y + k * f); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; g.strokeRect(x + .5, y + .5, k - 1, k - 1);
  const cx = x + k / 2, cy = y + k / 2;
  const blatt = (bx, by, rot, l, farbe) => {
    g.save(); g.translate(bx, by); g.rotate(rot); g.fillStyle = farbe;
    g.beginPath(); g.ellipse(0, -l / 2, l * 0.22, l / 2, 0, 0, Math.PI * 2); g.fill(); g.restore();
  };
  if (c === 'r') {
    // Rübe: Kraut oben, orange Schulter schaut aus der Erde
    for (const [rot, f] of [[-0.55, '#3f9a3a'], [0.55, '#3f9a3a'], [0, '#52b848']]) blatt(cx, cy + k * 0.02, rot, k * 0.42, f);
    g.fillStyle = '#f08a24';
    g.beginPath(); g.ellipse(cx, cy + k * 0.12, k * 0.17, k * 0.11, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)';
    g.beginPath(); g.ellipse(cx - k * 0.06, cy + k * 0.09, k * 0.05, k * 0.03, 0, 0, Math.PI * 2); g.fill();
  } else if (c === 's' || c === 'g') {
    // Setzling: kleiner Stiel, zwei hellgrüne Blättchen; gegossen: nasser Boden und Tropfen
    if (c === 'g') { g.fillStyle = 'rgba(40, 60, 110, .35)'; g.beginPath(); g.ellipse(cx, cy + k * 0.15, k * 0.32, k * 0.14, 0, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = '#4c9a3c'; g.lineWidth = Math.max(2, k * 0.05);
    g.beginPath(); g.moveTo(cx, cy + k * 0.15); g.lineTo(cx, cy - k * 0.05); g.stroke();
    blatt(cx, cy - k * 0.03, -1.0, k * 0.22, '#8ee06a'); blatt(cx, cy - k * 0.03, 1.0, k * 0.22, '#8ee06a');
    if (c === 'g') {
      g.fillStyle = '#7cc8ff';
      for (const [dx, dy] of [[-0.25, -0.2], [0.24, -0.12], [0.18, 0.22]]) { g.beginPath(); g.arc(cx + dx * k, cy + dy * k, k * 0.045, 0, Math.PI * 2); g.fill(); }
    }
  } else if (c === 'u') {
    // Unkraut: dunkle, zackige Blätter
    for (const [rot, l] of [[-1.1, 0.4], [-0.5, 0.46], [0.1, 0.5], [0.7, 0.44], [1.2, 0.38]]) blatt(cx, cy + k * 0.18, rot, k * l, rot % 2 ? '#2f6b2a' : '#3d7d33');
    g.fillStyle = '#c9e04a'; g.beginPath(); g.arc(cx, cy - k * 0.18, k * 0.05, 0, Math.PI * 2); g.fill();
  } else if (c === 'z' || c === 'm' || c === 'n') {
    // 🧱 Ziegel: lose (z, schräg mit Schatten), eingesetzt (m, flach im Weg mit Fugen), falsch abgelegt (n, rotes Kreuz)
    if (c === 'm' || c === 'n') { g.fillStyle = '#9a8a74'; g.fillRect(x + k * 0.08, y + k * 0.08, k * 0.84, k * 0.84); }
    g.save(); g.translate(cx, cy); if (c === 'z') g.rotate(-0.25);
    const bw = k * (c === 'z' ? 0.5 : 0.7), bh = k * (c === 'z' ? 0.28 : 0.36);
    g.fillStyle = 'rgba(0,0,0,.3)'; if (c === 'z') g.fillRect(-bw / 2 + 3, -bh / 2 + 4, bw, bh);
    g.fillStyle = '#b8503a'; g.fillRect(-bw / 2, -bh / 2, bw, bh);
    g.fillStyle = '#d8735a'; g.fillRect(-bw / 2, -bh / 2, bw, bh * 0.25);
    g.strokeStyle = '#7a2e20'; g.lineWidth = 1.5; g.strokeRect(-bw / 2, -bh / 2, bw, bh);
    if (c !== 'z') { g.beginPath(); g.moveTo(0, -bh / 2); g.lineTo(0, bh / 2); g.stroke(); }
    g.restore();
    if (c === 'n') { g.strokeStyle = '#ff4a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + k * 0.2, y + k * 0.2); g.lineTo(x + k * 0.8, y + k * 0.8); g.moveTo(x + k * 0.8, y + k * 0.2); g.lineTo(x + k * 0.2, y + k * 0.8); g.stroke(); }
  } else if (c === 'o') {
    // Loch im Weg: dunkle Grube mit Steinrand, gelbe Markierung „hier fehlt ein Ziegel“
    g.fillStyle = '#9a8a74'; g.fillRect(x + k * 0.08, y + k * 0.08, k * 0.84, k * 0.84);
    g.fillStyle = '#2a1a10'; g.beginPath(); g.ellipse(cx, cy, k * 0.3, k * 0.22, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#ffd84a'; g.lineWidth = 2; g.setLineDash([4, 3]); g.strokeRect(x + k * 0.14, y + k * 0.14, k * 0.72, k * 0.72); g.setLineDash([]);
  } else if (c === 'l' || c === 'k') {
    // 🍂 Laubhaufen auf dem Pflasterweg – darunter ein Loch (l) oder fester Boden (k); beides sieht gleich aus
    g.fillStyle = '#9a8a74'; g.fillRect(x + k * 0.08, y + k * 0.08, k * 0.84, k * 0.84);
    const farben = ['#c9772e', '#e0a33a', '#a8562a', '#d68a2f', '#b8642c'];
    [[-0.2, -0.12, 0.6], [0.16, -0.16, -0.4], [-0.06, 0.1, 1.2], [0.2, 0.12, 0.2], [-0.22, 0.16, -1], [0.02, -0.02, 2.1]]
      .forEach(([dx, dy, rot], j) => blatt(cx + dx * k, cy + dy * k + k * 0.12, rot, k * 0.3, farben[(j + i) % farben.length]));
  } else if (c === 'x') {
    // ausgerissener Setzling
    blatt(cx - k * 0.05, cy + k * 0.1, -1.4, k * 0.25, '#8a6a3a'); blatt(cx + k * 0.05, cy + k * 0.12, 1.3, k * 0.22, '#7a5a2a');
  }
}
