'use strict';
// --- 🎓 Codes zwischen Spiel und Lehrkraft (alles offline, ohne Server) -------------------------
// Lehrer-Code (Lehrkraft → Klasse, kurz genug für die Tafel): TYP + Zahl - MMTT - Prüfzeichen, z. B. B8-1112-K7QD.
//   Gilt nur an dem Tag (MMTT), an dem er erstellt wurde, und pro Spielstand einmal.
// Fortschrittscode (Schüler → Lehrkraft, zum Kopieren, z. B. in eine OPAL-Abgabe): ATC1.<Daten>.<Prüfzeichen>
// Die Prüfzeichen sind kein echter Schutz (der Schlüssel steht im Code) – aber ausgedachte Codes klappen nicht.
// Gebraucht von index.html (Spiel) und lehrer.html (Klassenübersicht). Braucht textPruefsumme aus data.js.

const CODE_SALZ = 'burgtor-eulalia-2026';
const CODE_ZEICHEN = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // ohne I, O, 0, 1 – an der Tafel leicht zu verwechseln
function codeZeichen(text, n) {
  const h = textPruefsumme(CODE_SALZ + text, 11) + textPruefsumme(text + CODE_SALZ, 5);
  let s = '';
  for (let i = 0; i < n; i++) s += CODE_ZEICHEN[parseInt(h[i], 36) % 32];
  return s;
}
const zwei = (n) => String(n).padStart(2, '0');
const datumHeute = (d = new Date()) => `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;
const mmttHeute = (d = new Date()) => zwei(d.getMonth() + 1) + zwei(d.getDate());

// Arten der Lehrer-Codes: was die Zahl bedeutet und was der Code im Spiel tut
const LEHRER_CODES = {
  B: { name: '🏰 Burg freischalten', zahl: 'Burg (7, 8, 9)', text: 'Schaltet eine Burg frei (bleibt frei).' },
  K: { name: '🔓 Kapitel freischalten', zahl: 'Kapitel-Nr. in der Burg', text: 'Öffnet ein Kapitel der aktuellen Burg, auch wenn das vorige noch nicht fertig ist.' },
  F: { name: '🎯 Heute nur dieses Kapitel', zahl: 'Kapitel-Nr. in der Burg', text: 'Heute lassen sich nur Höfe dieses Kapitels starten (wer es schon fertig hat, ist frei).' },
  D: { name: '✨ Doppelter Lohn heute', zahl: null, text: 'Heute bringt jede Aufgabe doppelt so viel Gold.' },
  G: { name: '🎁 Gold für alle', zahl: 'Gold (1–5000)', text: 'Einmalig Gold – z. B. als Belohnung für das Klassenziel.' },
  Z: { name: '🏆 Klassenziel', zahl: 'Sterne der Klasse', text: 'Zeigt im Spiel das gemeinsame Ziel der Klasse; jeder Stern zählt mit.' },
  C: { name: '🗝️ Kerker öffnen', zahl: null, text: 'Öffnet den Kerker der aktuellen Burg schon vor dem Ende (Wiederholung, Prüfungsvorbereitung). Bleibt offen.' },
};

function lehrerCodeMachen(typ, zahl, d = new Date()) {
  const kopf = `${typ}${LEHRER_CODES[typ].zahl ? zahl : ''}-${mmttHeute(d)}`;
  return `${kopf}-${codeZeichen(kopf, 4)}`;
}
// liefert { typ, zahl, code } oder { fehler }
function lehrerCodeLesen(eingabe, d = new Date()) {
  // Leerzeichen statt Bindestrich, Kleinbuchstaben: egal
  const code = String(eingabe).toUpperCase().trim().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
  const m = code.match(/^([A-Z])(\d{0,4})-?(\d{4})-?([A-Z0-9]{4})$/);
  if (!m || !LEHRER_CODES[m[1]]) return { fehler: 'Diesen Code kenne ich nicht. Schreib ihn genau so ab wie an der Tafel, z. B. B8-1112-K7QD.' };
  const kopf = `${m[1]}${m[2]}-${m[3]}`;
  const pz = m[4];
  if (codeZeichen(kopf, 4) !== pz) return { fehler: 'Der Code stimmt nicht. Hast du dich vertippt?' };
  if (m[3] !== mmttHeute(d)) return { fehler: 'Dieser Code gilt nur an dem Tag, an dem ihn deine Lehrkraft gemacht hat.' };
  if (LEHRER_CODES[m[1]].zahl && !m[2]) return { fehler: 'Dem Code fehlt die Zahl.' };
  return { typ: m[1], zahl: m[2] ? +m[2] : null, code: `${kopf}-${pz}` };
}

// Fortschrittscode: kompakte Daten (Name, Burg, Tag, Nacht, Level, Prüfungen, gelöste Höfe mit Sternen) als Base64
const b64url = (text) => btoa(String.fromCharCode(...new TextEncoder().encode(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlLesen = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));
function fortschrittMachen(daten) {
  const json = JSON.stringify(daten);
  return `ATC1.${b64url(json)}.${codeZeichen(json, 6)}`;
}
// liefert die Daten oder { fehler }
function fortschrittLesen(code) {
  const m = String(code).trim().match(/^ATC1\.([A-Za-z0-9_-]+)\.([A-Z2-9]{6})$/);
  if (!m) return { fehler: 'kein Fortschrittscode' };
  let json;
  try { json = b64urlLesen(m[1]); JSON.parse(json); } catch { return { fehler: 'beschädigt' }; }
  if (codeZeichen(json, 6) !== m[2]) return { fehler: 'verändert oder unvollständig' };
  return JSON.parse(json);
}
