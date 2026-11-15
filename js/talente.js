'use strict';
// --- ✨ Talentbaum (Path of Exile „lite“) ----------------------------------------------
// Der Baum gehört dem Helden: XP aus der Nacht machen nur ihn stärker. Burg, Türme, Mauer und Torwache kosten Gold vom Tag.
// Ein Netz um den Helden wie bei Path of Exile (v9): verteilte Gruppen (GRUPPEN, je ein großer Knoten mit drei kleinen),
// verbunden durch Wege (WEGKNOTEN), außen Schlüsseltalente mit Nachteil (SCHLUESSEL). Alles Gelernte wirkt immer.
// Die Zauber selbst bringen die 💎 Steine (steine.js); Kombos (2 Steine) und Dreier-Kombos (3 Steine) kosten nichts
// und werden entdeckt. Alles ist von Anfang an sichtbar. Dazu die Spezialisierungen (eigener kleiner Baum, Punkte aus ⚜️ Prüfungen).
// Der Baum steht nur in Daten (GRUPPEN, RING, SPEZ): größer machen = Einträge ergänzen.

const XP_GEGNER = { ratte: 1, schleim: 2, minischleim: 1, wolf: 2, ork: 4, geist: 3, troll: 10, drache: 60 };
// XP von Level l nach l+1: am Anfang fast jede Welle ein Level, später langsamer.
// Abgestimmt mit js/balance.js: etwa Level = Tag bei gutem Spiel
const xpFuerLevel = (l) => Math.round(20 + 2 * l * l + l * l * l / 20);
const resetPreis = (l) => Math.max(5, Math.round(0.4 * l * l / 5) * 5);

// Die 6 Zauber-Richtungen (Index = Stein in steine.js): Farben und Namen für Steine und Kombos
const THEMEN = [
  { ico: '🔥', name: 'Feuer', farbe: '#ff7a3a' }, { ico: '❄️', name: 'Frost', farbe: '#6fd0ff' }, { ico: '⚡', name: 'Blitz', farbe: '#ffe45a' },
  { ico: '🛡️', name: 'Schutz', farbe: '#6fe0a0' }, { ico: '🏹', name: 'Schütze', farbe: '#e8a860' }, { ico: '🧿', name: 'Schatten', farbe: '#b67aff' },
];

// --- Das Netz (wie bei Path of Exile, v9): ein echtes Geflecht ohne Themen-Seiten. 24 Gruppen liegen verteilt in
// drei Ringen um den Helden: in der Mitte jeder Gruppe ein großer Knoten mit einer besonderen Kraft, um ihn drei kleine,
// die zu ihm passen. Wege aus kleinen Allround-Knoten verbinden die Gruppen kreuz und quer. Die Themen (Zauber, Kontrolle,
// Tempo, Burg, Held, Türme) sind gemischt – überall gibt es etwas, aber man erreicht nie alles. Ganz außen Schlüsseltalente.
// Nichts hängt am gewählten Stein: Alles Gelernte wirkt immer.
const ART = {   // Farbe und kleine Knoten je Thema
  zauber: { farbe: '#ff7a3a', klein: { ico: '✨', name: 'Zauberkraft', text: 'Zauber +8 % Schaden.', mod: { alle_dmg: 0.08 } } },
  kontrolle: { farbe: '#6fd0ff', klein: { ico: '🐢', name: 'Zäher Boden', text: 'Alle Monster 2 % langsamer.', mod: { gegner_tempo: 0.02 } } },
  tempo: { farbe: '#ffe45a', klein: { ico: '⏩', name: 'Schnelle Zauber', text: 'Alle Zauber 4 % schneller bereit.', mod: { cd_alle: 0.04 } } },
  burg: { farbe: '#6fe0a0', klein: { ico: '🧱', name: 'Dicke Mauer', text: 'Die Mauer hat 1 Leben mehr.', mod: { mauer: 1 } } },
  held: { farbe: '#e8a860', klein: { ico: '⚔️', name: 'Kraft', text: 'Held +8 % Schaden.', mod: { held_dmg: 0.08 } } },
  turm: { farbe: '#b0b8e0', klein: { ico: '🗼', name: 'Turmkraft', text: 'Türme +7 % Schaden.', mod: { turm_dmg: 0.07 } } },
};
// Die 24 Gruppen: zuerst die 6 inneren (je Thema eine – jeder Start lohnt sich), dann 12 mittlere, dann 6 äußere (die stärksten).
// klein = eigene kleine Knoten der Gruppe (sonst die des Themas)
const GRUPPEN = [
  { art: 'zauber', ico: '🏀', name: 'Abpraller', text: 'Zauber prallen einmal ab: Feuerball und Eiswelle treffen noch die nächste Gruppe, der Kettenblitz springt 2-mal weiter, Schilde fangen 1 mehr ab.', mod: { zauber_abprall: true } },
  { art: 'kontrolle', ico: '🧊', name: 'Schockfrost', text: 'Der erste Treffer auf jeden Gegner friert ihn kurz ein (0,5 s) – auch von Türmen.', mod: { schockfrost: 0.5 },
    klein: { ico: '⏱️', name: 'Lange Wirkung', text: 'Bremsen und Einfrieren halten 10 % länger.', mod: { brems_dauer: 0.1 } } },
  { art: 'tempo', ico: '⏩', name: 'Schnellzauber', text: 'Alle Zauber 15 % schneller bereit.', mod: { cd_alle: 0.15 } },
  { art: 'burg', ico: '🧱', name: 'Bollwerk', text: 'Die Mauer hat 4 Leben mehr.', mod: { mauer: 4 } },
  { art: 'held', ico: '🪶', name: 'Splitterpfeile', text: 'Trifft der Held, fliegen 2 Splitter auf Gegner dahinter (je 40 % Schaden).', mod: { splitpfeil: 0.4 } },
  { art: 'turm', ico: '🏹', name: 'Pfeilhagel', text: 'Pfeiltürme schießen einen Pfeil mehr.', mod: { turm_pfeile: 1 } },
  // mittlerer Ring
  { art: 'zauber', ico: '🎆', name: 'Funkenregen', text: 'Besiegte Monster zerstieben in Funken: 4 % ihres Lebens als Schaden an bis zu 3 Monstern daneben.', mod: { leiche: 0.04 } },
  { art: 'turm', ico: '🪨', name: 'Steinregen', text: 'Katapulte werfen einen Stein mehr, Kanonen und Katapulte treffen eine größere Fläche.', mod: { turm_steine: 1, turm_flaeche: 0.3 },
    klein: { ico: '⚙️', name: 'Turmtakt', text: 'Türme schießen 4 % schneller.', mod: { turm_tempo: 0.04 } } },
  { art: 'kontrolle', ico: '🌸', name: 'Eisblume', text: 'Verpufft ein gebremster oder gefrorener Gegner, frieren alle um ihn 1 s ein.', mod: { eisblume: 1 } },
  { art: 'held', ico: '🎯', name: 'Erster Schuss', text: 'Der erste Treffer des Helden auf jeden Gegner macht doppelten Schaden.', mod: { erstschlag: 1 },
    klein: { ico: '🔭', name: 'Weitblick', text: 'Held +0,2 Reichweite.', mod: { held_reich: 0.2 } } },
  { art: 'tempo', ico: '🔋', name: 'Aufladen', text: 'Jeder Treffer des Helden lädt alle Zauber 0,1 s schneller auf.', mod: { laden: 0.1 },
    klein: { ico: '💨', name: 'Flinkheit', text: 'Held greift 5 % schneller an.', mod: { held_tempo: 0.05 } } },
  { art: 'burg', ico: '🔔', name: 'Burgglocke', text: 'Alle 15 s läutet die Glocke: Alle Gegner nahe der Burg stehen 1 s still.', mod: { glocke: 1 } },
  { art: 'kontrolle', ico: '✋', name: 'Schattenhand', text: 'Alle 6 s wird der stärkste Gegner 4 s verflucht: Er nimmt 20 % mehr Schaden.', mod: { schattenhand: 4, fluch_dmg: 0.2 },
    klein: { ico: '🎯', name: 'Riesenjagd', text: '+8 % Schaden gegen große Gegner und Anführer.', mod: { boss_dmg: 0.08 } } },
  { art: 'turm', ico: '🗼', name: 'Blitzableiter', text: 'Alle 8 s schießt jeder Turm zusätzlich einen Blitz (10 Schaden).', mod: { ableiter: 10 } },
  { art: 'held', ico: '🌧️', name: 'Pfeilregen', text: 'Alle 10 s regnet es Pfeile auf die größte Gruppe (8 Schaden an alle).', mod: { pfeilregen: 8 } },
  { art: 'burg', ico: '⛈️', name: 'Gewitterschild', text: 'Trifft ein Gegner die Mauer, schlägt ein Blitz in die 3 nächsten Gegner (10 Schaden).', mod: { gewitter: 10 } },
  { art: 'kontrolle', ico: '🕳️', name: 'Schattenloch', text: 'Alle 12 s öffnet sich vor dem Tor ein Loch: Alle Gegner darin stehen 2 s still.', mod: { schattenloch: 2 } },
  { art: 'zauber', ico: '🎇', name: 'Kettenreaktion', text: 'Besiegte Monster zerstieben in Funken (3 % ihres Lebens), und Funkenregen trifft weiter.', mod: { leiche: 0.03, leiche_r: 0.6 } },
  // äußerer Ring
  { art: 'zauber', ico: '🔁', name: 'Echo', text: 'Jeder Zauber wird 1 s später ein zweites Mal gewirkt.', mod: { echo: true } },
  { art: 'turm', ico: '🛠️', name: 'Meisterwerkstatt', text: 'Die 🪄 Fähigkeiten der Türme sind 30 % schneller bereit.', mod: { turm_cd: 0.3 } },
  { art: 'held', ico: '💥', name: 'Wucht', text: 'Jeder 5. Angriff des Helden trifft dreifach.', mod: { held_wucht: 5 } },
  { art: 'burg', ico: '🌈', name: 'Schutzkuppel', text: 'Fällt die Mauer unter die Hälfte, entsteht einmal pro Nacht ein großer Schild (8).', mod: { kuppel: 8 },
    klein: { ico: '🛡️', name: 'Wachstube', text: 'Gefallene Torwachen stehen 10 % schneller auf.', mod: { wache_schnell: 0.1 } } },
  { art: 'tempo', ico: '☁️', name: 'Gewitterwolke', text: 'Alle 10 s schlägt ein Blitz in den Gegner mit dem meisten Leben (25 Schaden).', mod: { wolke: 25 } },
  { art: 'held', ico: '🔭', name: 'Späherblick', text: 'Held und Türme +0,5 Reichweite.', mod: { held_reich: 0.5, turm_reich: 0.5 } },
];
// Wege zwischen den Gruppen: kleine Knoten (reihum), die sich dem eigenen Spiel anpassen (2026-11-13, Nutzerwunsch: „die anderen
// Punkte passten nicht zu meinem Build“) – jeder Punkt hilft, egal ob man mit Türmen, Held oder Zaubern spielt. Ausgewertet in talentWerte/nacht.js.
const WEGKNOTEN = [
  { ico: '💪', name: 'Deine Stärke', text: 'Was in deiner letzten Nacht am meisten Schaden gemacht hat – Türme, Grundangriff des Helden oder Zauber –, macht 6 % mehr.', mod: { staerke: 0.06 } },
  { ico: '🏰', name: 'Lieblingsturm', text: 'Die Turmart, die du am häufigsten gebaut hast, macht 8 % mehr Schaden.', mod: { lieb_turm: 0.08 } },
  { ico: '🎯', name: 'Erzfeind', text: '8 % mehr Schaden gegen die Monsterart, die in dieser Nacht am häufigsten kommt.', mod: { erzfeind: 0.08 } },
];
const STAERKE_NAME = { turm: '🏰 Türme', held: '🧙 Grundangriff', zauber: '🪄 Zauber' };

// 🏅 Meisterschaft (wie in Path of Exile): Wer eine Gruppe GANZ lernt (großer Knoten + alle 3 kleinen), wählt dort eine von drei
// Meisterschaften – kostenlos und jederzeit wechselbar (P.meister[gruppe] = Index). Je Thema dieselben drei. Nur im großen Netz.
const MEISTER = {
  zauber: [{ ico: '✨', name: 'Zauberkern', text: 'Zauber +15 % Schaden.', mod: { alle_dmg: 0.15 } },
    { ico: '⏳', name: 'Zauberfluss', text: 'Alle Zauber 10 % schneller bereit.', mod: { cd_alle: 0.1 } },
    { ico: '🎯', name: 'Riesenjagd', text: '+15 % Schaden gegen große Gegner und Anführer.', mod: { boss_dmg: 0.15 } }],
  kontrolle: [{ ico: '🐢', name: 'Sumpfboden', text: 'Alle Monster 6 % langsamer.', mod: { gegner_tempo: 0.06 } },
    { ico: '⏱️', name: 'Lange Kälte', text: 'Bremsen und Einfrieren halten 25 % länger.', mod: { brems_dauer: 0.25 } },
    { ico: '🧿', name: 'Tiefer Fluch', text: 'Verfluchte Gegner nehmen 15 % mehr Schaden.', mod: { fluch_dmg: 0.15 } }],
  tempo: [{ ico: '⏩', name: 'Eilzauber', text: 'Alle Zauber 10 % schneller bereit.', mod: { cd_alle: 0.1 } },
    { ico: '💨', name: 'Flinke Hand', text: 'Der Held greift 15 % schneller an.', mod: { held_tempo: 0.15 } },
    { ico: '⚙️', name: 'Schnelle Mechanik', text: 'Alle Türme schießen 8 % schneller.', mod: { turm_tempo: 0.08 } }],
  burg: [{ ico: '🧱', name: 'Steinmetz', text: 'Die Mauer hat 4 Leben mehr.', mod: { mauer: 4 } },
    { ico: '🛡️', name: 'Morgenschild', text: 'Jede Nacht beginnt mit einem Schild auf der Mauer, der 4 Schaden abfängt.', mod: { schild: 4 } },
    { ico: '🪙', name: 'Kopfgeldjäger', text: 'Das Kopfgeld der Nacht ist 15 % höher.', mod: { kopfgeld: 0.15 } }],
  held: [{ ico: '⚔️', name: 'Heldenkraft', text: 'Grundangriff des Helden +20 % Schaden.', mod: { held_dmg: 0.2 } },
    { ico: '🔭', name: 'Adlerblick', text: 'Der Held hat +0,6 Reichweite.', mod: { held_reich: 0.6 } },
    { ico: '🪶', name: 'Splitter', text: 'Trifft der Held, fliegen Splitter auf 2 Gegner dahinter (20 % Schaden).', mod: { splitpfeil: 0.2 } }],
  turm: [{ ico: '🗼', name: 'Turmbauer', text: 'Alle Türme +12 % Schaden.', mod: { turm_dmg: 0.12 } },
    { ico: '📡', name: 'Hohe Türme', text: 'Alle Türme +0,4 Reichweite.', mod: { turm_reich: 0.4 } },
    { ico: '🛠️', name: 'Werkmeister', text: 'Die 🪄 Fähigkeiten der Türme sind 15 % schneller bereit.', mod: { turm_cd: 0.15 } }],
};
const gruppeKomplett = (gid, gelernt = P.talente) => !NETZ_KLEIN && gelernt.includes(gid) && [0, 1, 2].every((j) => gelernt.includes(`${gid}_${j}`));
const meisterMods = () => Object.entries(P.meister || {}).filter(([g, i]) => TALENTE[g] && gruppeKomplett(g) && MEISTER[TALENTE[g].art]?.[i]).map(([g, i]) => MEISTER[TALENTE[g].art][i].mod);

// ✦ Wunder ganz außen zwischen den äußeren Gruppen (Nutzerwunsch: „Neues statt Zahlen, damit es sich lohnt, bis raus zu gehen“):
// jedes schaltet etwas frei, das es sonst nicht gibt. Nur im großen Netz. Wirkung über mod-Schlüssel (steine.js, data.js, nacht.js).
const WUNDER = [
  { ico: '🪄', name: 'Fünfter Zauberplatz', text: 'Dein Held bekommt einen Zauberplatz mehr – egal, welches Level er hat. Mehr Zauber, mehr 🔗 Kombos.', mod: { zauberplatz: 1 } },
  { ico: '☄️', name: 'Meteor', text: 'Neuer Zauber (ohne Zauberplatz): Alle 25 s stürzt ein Meteor auf die größte Gruppe, egal wo auf dem Feld – 14 Schaden, danach brennt der Boden.', mod: { zauber: 'meteor' } },
  { ico: '🌪️', name: 'Sturmturm', text: 'Neue Turmart: Der Sturmturm pustet Monster auf dem Weg ein Stück zurück – sie müssen die Kurven noch einmal laufen.', mod: { turm_wind: true } },
  { ico: '🦉', name: 'Wächtereule', text: 'Eine Eule kreist über der Burg und greift überall auf dem Feld an – auch im Nebel am Portal. Sie wird mit deinem Helden stärker.', mod: { eule: 0.6 } },
  { ico: '🔔', name: 'Riesenglocke', text: 'Neuer Zauber (ohne Zauberplatz): Alle 30 s dröhnt die Riesenglocke – alle Monster stehen 2 s still (Anführer kürzer).', mod: { zauber: 'riesenglocke' } },
  { ico: '🔆', name: 'Leuchtfeuer', text: 'Ein Leuchtfeuer auf dem Torturm vertreibt Nebel: Dein Bauland ist 2 Felder größer.', mod: { bauland_plus: 2 } },
];
// ✧ Funde (2026-11-13, Nutzer: „die Talente waren schnell wieder langweilig – es muss mehr Gutes an verschiedenen Stellen geben“):
// 12 kleine Knoten mit einer eigenen Kraft am mittleren Ring, je einer zwischen zwei mittleren Gruppen, als Abstecher (1 Punkt).
// Kleine Ausgaben von Kräften, die sonst nur Kombos oder Spezialisierungen haben – so findet jeder Weg etwas Neues.
// Ihre Zahlen wachsen mit dem Level des Helden (FUND_JE_LEVEL), damit sie auch spät noch zählen. Nur im großen Netz.
const FUND_JE_LEVEL = 0.05;
const FUNDE = [
  { ico: '🌠', name: 'Sternschnuppen', text: 'Alle 10 s fallen 3 Sternschnuppen auf Monster nahe dem Tor (je 6 Schaden), der Boden glüht.', mod: { stern: 6 }, wachsen: ['stern'] },
  { ico: '🔔', name: 'Glöckchen', text: 'Alle 15 s klingelt ein Glöckchen: Monster nahe der Burg stehen 0,6 s still.', mod: { glocke: 0.6 } },
  { ico: '🕊️', name: 'Feuervogel', text: 'Alle 20 s fliegt ein Feuervogel über die größte Gruppe: 10 Schaden an allen in seiner Reihe, sie brennen und sind verflucht.', mod: { phoenix: 10 }, wachsen: ['phoenix'] },
  { ico: '🌱', name: 'Rankenpfeile', text: 'Jeder Treffer des Helden hält das Monster 0,15 s fest.', mod: { held_stun: 0.15 } },
  { ico: '🔮', name: 'Irrlichter', text: 'Alle 8 s schweben 3 Irrlichter zu Monstern: je 4 Schaden, sie bremsen und verfluchen.', mod: { irrlicht: 4 }, wachsen: ['irrlicht'] },
  { ico: '🛡️', name: 'Morgenschild', text: 'Jede Nacht beginnt mit einem Schild auf der Mauer, der 3 Schaden abfängt.', mod: { schild: 3 }, wachsen: ['schild'] },
  { ico: '🌿', name: 'Dornenranken', text: 'Alle Monster auf dem Feld nehmen 1 Schaden pro Sekunde.', mod: { dornen: 1 }, wachsen: ['dornen'] },
  { ico: '🍂', name: 'Mürbe', text: 'Monster unter 6 % Leben zerfallen sofort (nicht Bosse und Anführer).', mod: { entropie: 0.06 } },
  { ico: '☁️', name: 'Regenwolke', text: 'Alle 10 s schlägt ein Blitz in das Monster mit dem meisten Leben (12 Schaden).', mod: { wolke: 12 }, wachsen: ['wolke'] },
  { ico: '🧪', name: 'Bröckeln', text: 'Jeder Treffer lässt ein Monster 3 s lang bröckeln (1,5 Schaden pro Sekunde).', mod: { gift: 1.5 }, wachsen: ['gift'] },
  { ico: '🗼', name: 'Funkenturm', text: 'Alle 8 s schießt jeder Turm zusätzlich einen kleinen Blitz (5 Schaden).', mod: { ableiter: 5 }, wachsen: ['ableiter'] },
  { ico: '🌸', name: 'Frostblüte', text: 'Verpufft ein gebremstes oder gefrorenes Monster, frieren seine Nachbarn 0,6 s ein.', mod: { eisblume: 0.6 } },
];
// ✦ Kraft-Funde (Nutzerwunsch im selben Spieltest: „wirklich was zu den Spells oder Kombos, besser gegen Bosse, mehr AoE,
// mehr Reichweite für Spells oder Attacken, weniger Kosten für Türme“): 12 weitere Abstecher zwischen innerem und mittlerem Ring.
const KRAFT_FUNDE = [
  { ico: '🎯', name: 'Riesenjäger', text: '+12 % Schaden gegen große Monster, Anführer und Drachen.', mod: { boss_dmg: 0.12 } },
  { ico: '🔭', name: 'Weite Zauber', text: 'Feuerball, Eiswelle und Kettenblitz reichen 1,5 Felder weiter.', mod: { zauber_reich: 1.5 } },
  { ico: '💥', name: 'Große Zauber', text: 'Feuerball, Eiswelle, Meteor und 🔗 Kombo-Ausbruch treffen eine 20 % größere Fläche.', mod: { zauber_flaeche: 0.2 } },
  { ico: '🔗', name: 'Kombo-Kraft', text: '🔗 Kombo-Ausbrüche machen 35 % mehr Schaden.', mod: { kombo_kraft: 0.35 } },
  { ico: '🔋', name: 'Kombo-Leiste', text: 'Die 🔗 Kombo-Leiste lädt 25 % schneller – öfter ein Kombo-Ausbruch.', mod: { kombo_laden: 0.25 } },
  { ico: '🏹', name: 'Weitschuss', text: 'Der Held hat +0,6 Reichweite.', mod: { held_reich: 0.6 } },
  { ico: '🔥', name: 'Glutkern', text: 'Feuerball +20 % Schaden und 10 % größere Fläche.', mod: { fb_dmg: 0.2, fb_flaeche: 0.1 } },
  { ico: '⛓️', name: 'Lange Kette', text: 'Der Kettenblitz springt 2-mal weiter.', mod: { kb_kette: 2 } },
  { ico: '🌊', name: 'Breite Welle', text: 'Die Eiswelle ist 0,4 Felder breiter und bremst 20 % länger.', mod: { fn_radius: 0.4, fn_dauer: 0.2 } },
  { ico: '🪶', name: 'Splitterschuss', text: 'Trifft der Held, fliegen Splitter auf 2 Monster dahinter (15 % Schaden) – Flächenschaden für den Grundangriff.', mod: { splitpfeil: 0.15 } },
  { ico: '🪙', name: 'Baumeisterin', text: 'Türme bauen und ausbauen kostet 10 % weniger.', mod: { turm_rabatt: 0.1 } },
  { ico: '👑', name: 'Königsjagd', text: '+8 % Schaden gegen Anführer und Drachen, alle Zauber 6 % schneller bereit.', mod: { boss_dmg: 0.08, cd_alle: 0.06 } },
];
const fundFaktor = () => 1 + FUND_JE_LEVEL * (heldLevel().level - 1);
// Hat der Held ein Talent mit diesem mod-Schlüssel? (ohne talentWerte – für sockelZahl und baulandR, die talentWerte selbst braucht)
const talentHat = (key) => (P?.talente || []).some((id) => TALENTE[id]?.mod?.[key]);
// 🏰 Lieblingsturm = häufigste Turmart (bei Gleichstand die zuerst gebaute)
function lieblingsturm() {
  const z = {};
  for (const t of Object.values(P.tuerme || {})) z[t.art] = (z[t.art] || 0) + 1;
  return Object.entries(z).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

// 🔗 Kombos: Jedes Paar aus zwei Richtungen hat eine (15 Stück). Sie kosten keinen Punkt: Sobald die Zauber
// beider Richtungen gelernt sind (die inneren Cluster c0–c5), ist die Kombo aktiv. Löst sie in der Nacht zum
// ersten Mal aus, ist sie entdeckt (P.kombos) und steht im 📖 Kombo-Buch.
const KOMBO = [
  { id: 'thermo', paar: [0, 1], ico: '💨', name: 'Thermoschock', text: 'Gebremste oder gefrorene Gegner nehmen 50 % mehr Feuerschaden – auch von der Kanone.', mod: { thermo: 0.5 } },
  { id: 'funken', paar: [0, 2], ico: '🎇', name: 'Funkenflug', text: 'Wo der Kettenblitz einschlägt, glüht kurz der Boden (3 Schaden/s).', mod: { funkenflug: 3 } },
  { id: 'feuerwall', paar: [0, 3], ico: '🏮', name: 'Feuerwall', text: 'Wenn der Schutzzauber wirkt, brennt der Boden vor dem Tor 4 s lang.', mod: { feuerwall: 5 } },
  { id: 'glut', paar: [0, 4], ico: '🌠', name: 'Glutpfeile', text: 'Jeder 4. Treffer des Helden lässt den Boden unter dem Ziel glühen.', mod: { glutpfeile: 4 } },
  { id: 'hoelle', paar: [0, 5], ico: '🟣', name: 'Schattenflamme', text: 'Verfluchte Gegner brennen (2,5 Schaden/s). Feuerball verflucht alle Getroffenen.', mod: { hoelle: 2.5 } },
  { id: 'supra', paar: [1, 2], ico: '🧲', name: 'Supraleiter', text: 'Gebremste Gegner nehmen 40 % mehr Blitzschaden, und Blitze springen weiter.', mod: { supra: 0.4 } },
  { id: 'eispanzer', paar: [1, 3], ico: '💎', name: 'Eispanzer', text: 'Fängt der Schild etwas ab, frieren der Angreifer und alle um ihn 1,2 s ein.', mod: { eispanzer: 1.2 } },
  { id: 'frostpfeile', paar: [1, 4], ico: '🌨️', name: 'Frostpfeile', text: 'Treffer des Helden bremsen 1 s lang.', mod: { frostpfeile: 1 } },
  { id: 'eisfluch', paar: [1, 5], ico: '🌫️', name: 'Eisiger Fluch', text: 'Eiswelle verflucht alle Getroffenen, und der Fluch bremst stärker.', mod: { eisfluch: true } },
  { id: 'gewitter', paar: [2, 3], ico: '⛈️', name: 'Gewitterschild', text: 'Trifft ein Gegner die Mauer, schlägt ein Blitz in die 3 nächsten Gegner (10 Schaden).', mod: { gewitter: 10 } },
  { id: 'blitzpfeile', paar: [2, 4], ico: '🌟', name: 'Blitzpfeile', text: 'Jeder 5. Angriff des Helden springt als Blitz auf 2 weitere Gegner.', mod: { blitzpfeile: 5 } },
  { id: 'schattenblitz', paar: [2, 5], ico: '🌌', name: 'Schattenblitz', text: 'Der Kettenblitz verflucht alle Getroffenen 2 s lang.', mod: { schattenblitz: 2 } },
  { id: 'wachposten', paar: [3, 4], ico: '🗼', name: 'Wachposten', text: 'Solange ein Schild auf der Mauer liegt, greift der Held 30 % schneller an.', mod: { wachposten: 0.3 } },
  { id: 'schattenschild', paar: [3, 5], ico: '🌘', name: 'Schattenschild', text: 'Fängt der Schild etwas ab, werden alle Gegner am Tor 3 s verflucht.', mod: { schattenschild: 3 } },
  { id: 'wegpusten', paar: [4, 5], ico: '🌬️', name: 'Wegpusten', text: 'Treffer des Helden pusten verfluchte Gegner mit weniger als 20 % Leben sofort weg (nicht Bosse).', mod: { hinrichtung: 0.2 } },
];
// 🔗🔗 Dreier-Kombos: jede Dreiergruppe aus Richtungen hat eine (20 Stück). Aktiv, sobald Steine aller drei
// Richtungen im Sockel stecken. Ebenfalls kostenlos und zu entdecken.
const DREIER = [
  { id: 'elementar', paar: [0, 1, 2], ico: '🌈', name: 'Elementarsturm', text: 'Alle 12 s wirkt der Held Feuerball, Eiswelle und Kettenblitz zusätzlich auf einmal.', mod: { elementar: 12 } },
  { id: 'dampf', paar: [0, 1, 3], ico: '♨️', name: 'Dampfwolke', text: 'Der Schutzzauber lässt vor dem Tor 5 s lang heißen Dampf aufsteigen: bremst stark, 4 Schaden pro Sekunde.', mod: { dampf: 4 } },
  { id: 'wechsel', paar: [0, 1, 4], ico: '🌗', name: 'Glut und Reif', text: 'Die Treffer des Helden wechseln sich ab: Feuerpfeil (brennt) und Eispfeil (friert 0,4 s ein).', mod: { wechselpfeile: true } },
  { id: 'irrlicht', paar: [0, 1, 5], ico: '🔮', name: 'Irrlichter', text: 'Alle 8 s schweben 3 Irrlichter zu den Gegnern: je 10 Schaden, sie bremsen und verfluchen.', mod: { irrlicht: 10 } },
  { id: 'stern', paar: [0, 2, 3], ico: '🌠', name: 'Sternschnuppen', text: 'Alle 10 s fallen 3 Sternschnuppen auf die Gegner nahe dem Tor: je 15 Schaden, der Boden glüht.', mod: { stern: 15 } },
  { id: 'donnerpfeil', paar: [0, 2, 4], ico: '🎆', name: 'Feuerwerk', text: 'Jeder 6. Angriff des Helden ist eine Rakete: Explosion (15 Schaden) und Blitze auf 3 weitere Gegner.', mod: { feuerwerk: 6 } },
  { id: 'schattengewitter', paar: [0, 2, 5], ico: '🌩️', name: 'Schattengewitter', text: 'Verpufft ein verfluchter Gegner, schlagen Blitze in 2 Nachbarn (8 Schaden) und der Boden glüht.', mod: { schattengewitter: 8 } },
  { id: 'brandmauer', paar: [0, 3, 4], ico: '🧯', name: 'Brandmauer', text: 'Solange ein Schild auf der Mauer liegt, setzen die Treffer des Helden Gegner in Brand.', mod: { brandmauer: 4 } },
  { id: 'laterne', paar: [0, 3, 5], ico: '🏮', name: 'Laternenwache', text: 'Die Torwache trägt Laternen: Wen sie trifft, der brennt und ist verflucht.', mod: { laterne: 5 } },
  { id: 'phoenix', paar: [0, 4, 5], ico: '🕊️', name: 'Phönix', text: 'Alle 20 s fliegt ein Feuervogel quer übers Feld: 25 Schaden an allen auf seiner Bahn, sie brennen und sind verflucht.', mod: { phoenix: 25 } },
  { id: 'kristall', paar: [1, 2, 3], ico: '🔷', name: 'Kristallmauer', text: 'Fängt der Schild etwas ab, schießt die Mauer Eisblitze auf 4 Gegner: 10 Schaden, 1 s eingefroren.', mod: { kristall: 10 } },
  { id: 'polarstrahl', paar: [1, 2, 4], ico: '🔦', name: 'Polarstrahl', text: 'Jeder 5. Angriff des Helden ist ein Strahl: trifft alle Gegner in einer Linie (10 Schaden) und friert sie ein.', mod: { polarstrahl: 5 } },
  { id: 'polarlicht', paar: [1, 2, 5], ico: '🌌', name: 'Polarlicht', text: 'Alle 15 s leuchtet ein Polarlicht: Alle Gegner stehen 1,5 s still und sind verflucht.', mod: { polarlicht: 15 } },
  { id: 'eisfestung', paar: [1, 3, 4], ico: '🏔️', name: 'Eisfestung', text: 'Solange ein Schild auf der Mauer liegt, frieren die Treffer des Helden 0,5 s ein.', mod: { eisfestung: 0.5 } },
  { id: 'nebel', paar: [1, 3, 5], ico: '🌫️', name: 'Nebelmauer', text: 'Alle 12 s legt sich kalter Nebel vor das Tor: Wer darin ist, schleicht und ist verflucht.', mod: { nebel: 12 } },
  { id: 'mond', paar: [1, 4, 5], ico: '🌙', name: 'Mondpfeile', text: 'Jeder 4. Angriff des Helden ist ein Mondpfeil: friert alle um das Ziel 0,8 s ein und verflucht sie.', mod: { mondpfeil: 4 } },
  { id: 'ableiter', paar: [2, 3, 4], ico: '🗼', name: 'Blitzableiter', text: 'Alle 8 s schießt jeder Turm zusätzlich einen Blitz (10 Schaden).', mod: { ableiter: 10 } },
  { id: 'sturmglocke', paar: [2, 3, 5], ico: '🔔', name: 'Sturmglocke', text: 'Trifft ein Gegner die Mauer, stehen alle Gegner nahe dem Tor 1 s still und sind verflucht.', mod: { sturmglocke: true } },
  { id: 'jagd', paar: [2, 4, 5], ico: '🐺', name: 'Gewitterjagd', text: 'Lässt der Held einen Gegner verpuffen, springt ein Blitz auf 3 weitere (8 Schaden).', mod: { gewitterjagd: 8 } },
  { id: 'schattenwache', paar: [3, 4, 5], ico: '🥷', name: 'Schattenwache', text: 'Die Torwache macht doppelten Schaden, verflucht, wen sie trifft, und steht doppelt so schnell wieder auf.', mod: { schattenwache: true } },
];
const komboById = (id) => KOMBO.find((k) => k.id === id) || DREIER.find((k) => k.id === id);
// Aktive Kombos: Steine beider (bzw. aller drei) Richtungen im Sockel – Element-Stützsteine zählen mit
const kombosAktiv = () => {
  const el = aktiveElemente(), da = (k) => k.paar.every((t) => el.has(t));
  return [...KOMBO.filter(da), ...DREIER.filter(da)];
};

// 👑 Schlüsseltalente ganz außen (je Bereich eins): stark, aber mit Nachteil
const SCHLUESSEL = [
  { ico: '🌀', name: 'Sturmherz', text: 'Alle Zauber 30 % schneller bereit. Nachteil: Der Grundangriff des Helden macht halben Schaden.', mod: { cd_alle: 0.3, held_halb: true } },
  { ico: '🌑', name: 'Ewige Nacht', text: 'Alle Gegner in Reichweite des Helden sind verflucht. Nachteil: Held greift 25 % langsamer an.', mod: { nacht_aura: true, held_tempo: -0.25, fluch_dmg: 0.1 } },
  { ico: '💫', name: 'Schwung', text: 'Jeder besiegte Gegner: Held 2 s lang 80 % schneller. Nachteil: Held –1 Reichweite.', mod: { rausch: 0.8, held_reich: -1 } },
  { ico: '🏯', name: 'Festung', text: 'Die Mauer hat 50 % mehr Leben. Nachteil: Alle Zauber 25 % langsamer bereit.', mod: { mauer_mal: 0.5, cd_alle: -0.25 } },
  { ico: '🧘', name: 'Eremit', text: 'Held macht doppelten Schaden und greift 40 % schneller an. Nachteil: keine Zauber mehr.', mod: { eremit: true } },
  { ico: '👑', name: 'Turmherr', text: 'Türme +40 % Schaden. Nachteil: Der Grundangriff des Helden macht halben Schaden.', mod: { turm_dmg: 0.4, held_halb: true } },
];

// 🌌 Sternenring (2026-11-13, Nutzerwunsch: „für den Leistungskurs das Netz noch größer, starke Sachen mit Vor- und Nachteilen weiter außen“):
// nur im LK (und im ♾️ Endlos-Modus) ein vierter Ring hinter den ✦ Wundern: Erzschlüssel o{i}, je einer hinter Wunder i.
// Sehr stark, aber mit einem Nachteil, der den ganzen Spielstil ändert. Wirkung über mod-Schlüssel (nacht.js, nachtbild.js).
const ERZSCHLUESSEL = [
  { ico: '🎯', name: 'Scharfschützenburg', text: 'Alle Türme +60 % Schaden. Nachteil: Du kannst höchstens 5 Türme haben.', mod: { turm_dmg: 0.6, turm_max: 5 } },
  { ico: '⏳', name: 'Zeitschleife', text: 'Alle Zauber 45 % schneller bereit. Nachteil: Der Held greift nicht mehr selbst an.', mod: { cd_alle: 0.45, held_aus: true } },
  { ico: '❄️', name: 'Ewiger Winter', text: 'Alle Monster 25 % langsamer. Nachteil: Deine Türme schießen 20 % langsamer.', mod: { gegner_tempo: 0.25, turm_tempo: -0.2 } },
  { ico: '🪙', name: 'Goldgier', text: 'Doppeltes Kopfgeld in der Nacht. Nachteil: Die Mauer hat 30 % weniger Leben.', mod: { kopfgeld: 1, mauer_mal: -0.3 } },
  { ico: '🦅', name: 'Luftherrschaft', text: 'Alles macht +60 % Schaden gegen 🦇 Flieger und holt sie bei jedem Treffer kurz zu Boden. Nachteil: −15 % Schaden gegen alle anderen.', mod: { luft: 0.6 } },
  { ico: '🎲', name: 'Glücksritter', text: 'Jeder 10. Treffer macht vierfachen Schaden. Nachteil: alle anderen Treffer −30 % (im Schnitt etwa gleich viel, aber mit großen Glückstreffern).', mod: { gluecks: true } },
];
// 💎 Juwel-Fassungen (wie in PoE): Abstecher im Netz (Knoten j{i}, nur LK/Endlos). Ein eingesetztes Juwel verändert alle
// gelernten Knoten in seinem Umkreis (JUWEL_R Felder, im Netz als Kreis gezeichnet). Juwelen findet man nach gehaltenen Nächten
// (juwelNachNacht), das erste gibt es zur ersten gelernten Fassung. Einsetzen/Tauschen kostenlos (P.juwelIn[fassung] = Juwel-Index).
const JUWEL_R = 2.8;
const JUWELEN = [
  { ico: '🔍', name: 'Linse', text: 'Kleine Knoten und ✧ Funde im Kreis wirken 50 % stärker.', mal: (t) => (t.typ === 'klein' || t.typ === 'fund' ? 1.5 : 1) },
  { ico: '🌗', name: 'Mondstein', text: 'Große Knoten im Kreis wirken 40 % stärker, kleine nur halb.', mal: (t) => (t.typ === 'gross' ? 1.4 : t.typ === 'klein' ? 0.5 : 1) },
  { ico: '🏰', name: 'Turmstein', text: 'Je gelerntem Knoten im Kreis: Türme +3 % Schaden.', je: { turm_dmg: 0.03 } },
  { ico: '✨', name: 'Sternsplitter', text: 'Je gelerntem Knoten im Kreis: Zauber +3 % Schaden.', je: { alle_dmg: 0.03 } },
  { ico: '🧙', name: 'Weisenstein', text: 'Je gelerntem Knoten im Kreis: Grundangriff des Helden +5 %.', je: { held_dmg: 0.05 } },
  { ico: '⏳', name: 'Sanduhrstein', text: 'Je gelerntem Knoten im Kreis: Zauber 1,5 % schneller bereit.', je: { cd_alle: 0.015 } },
];
let NETZ_GROSS = false;   // Sternenring und Juwel-Fassungen da?
// 🎯 Scharfschützenburg: höchstens so viele Türme (0 = keine Grenze); in platzPruefen (nachtbild.js)
const turmMax = () => (P?.talente || []).map((id) => TALENTE[id]?.mod?.turm_max).find(Boolean) || 0;
const juwelImKreis = (j, t) => t.id !== j.id && t.id !== 'mitte' && t.typ !== 'juwel' && Math.hypot(t.x - j.x, t.y - j.y) <= JUWEL_R;
// Juwel einer gelernten Fassung (oder null)
const juwelVon = (fid) => (P.talente.includes(fid) && P.juwelIn?.[fid] !== undefined ? JUWELEN[P.juwelIn[fid]] : null);
// Nach einer gehaltenen Nacht: Juwel-Glück wächst (Anführer mehr); ist es voll, gibt es ein Juwel, das man noch nicht hat
function juwelNachNacht(sieg, chef) {
  if (!NETZ_GROSS || !sieg || !P.talente.some((id) => TALENTE[id]?.typ === 'juwel')) return null;
  P.juwelen ||= [];
  P.juwelGlueck = (P.juwelGlueck || 0) + (chef ? 0.45 : 0.25);
  if (P.juwelGlueck < 1) return null;
  P.juwelGlueck -= 1;
  return juwelGeben();
}
function juwelGeben() {
  P.juwelen ||= [];
  const neu = JUWELEN.map((_, i) => i).filter((i) => !P.juwelen.includes(i));
  if (!neu.length) return null;
  const i = neu[(P.nacht * 7 + P.juwelen.length * 3) % neu.length];
  P.juwelen.push(i);
  return JUWELEN[i];
}

// --- ⚜️ Spezialisierungen: eigener kleiner Baum neben dem Netz, Punkte nur aus Prüfungen ---
// Kern unten, darüber zwei Äste mit je zwei Knoten. Wirkungen über mod-Schlüssel wie im Netz (nacht.js).
const SPEZ = {
  chaos: { ico: '🌀', name: 'Chaos', farbe: '#c070ff', text: 'Gift, Zerfall und Explosionen. Gegner gehen von selbst kaputt.', knoten: {
    k: { ico: '🧪', name: 'Zerfall', text: 'Jeder Treffer lässt Gegner bröckeln: 4 Schaden pro Sekunde, 3 s lang.', mod: { gift: 4 } },
    // Spieltest 2026-11-10: mit 30 % + 30 % machte der Funkenregen 60 % des Schadens – jetzt 10 % + 8 %
    a1: { ico: '🎆', name: 'Funkenregen', text: 'Besiegte Gegner zerstieben in Funken: 10 % ihres Lebens als Schaden an bis zu 3 Gegnern daneben.', mod: { leiche: 0.1 } },
    a2: { ico: '🔗', name: 'Kettenreaktion', text: 'Der Funkenregen ist größer und stärker (+8 %).', mod: { leiche: 0.08, leiche_r: 0.6 } },
    b1: { ico: '🍂', name: 'Entropie', text: 'Gegner unter 15 % Leben zerfallen sofort (nicht Bosse).', mod: { entropie: 0.15 } },
    b2: { ico: '🌀', name: 'Chaosriss', text: 'Alle 10 s verliert der stärkste Gegner ein Drittel seines Lebens.', mod: { riss: true } },
  } },
  licht: { ico: '☀️', name: 'Licht', farbe: '#ffe27a', text: 'Heilen, schützen, blenden. Die Burg hält einfach länger.', knoten: {
    k: { ico: '✨', name: 'Heiliges Licht', text: 'Die Mauer heilt sich: +1 alle 6 s.', mod: { mauer_regen: 6 } },
    a1: { ico: '😵', name: 'Blenden', text: 'Alle 10 s sind alle Gegner nahe der Burg 1,5 s geblendet (stehen still).', mod: { blenden: true } },
    a2: { ico: '🔆', name: 'Strahlender Held', text: 'Der Held macht doppelten Schaden, Geister nehmen dreifachen.', mod: { held_dmg: 1, licht_geist: true } },
    b1: { ico: '🛡️', name: 'Lichtschild', text: 'Die ersten 8 Schaden an der Mauer jede Nacht prallen ab.', mod: { schild: 8 } },
    b2: { ico: '🕊️', name: 'Wiedergeburt', text: 'Einmal pro Nacht: Fällt die Mauer, steht sie mit halber Kraft wieder auf.', mod: { wiedergeburt: true } },
  } },
  natur: { ico: '🌿', name: 'Natur', farbe: '#6fe07a', text: 'Dornen, Ranken und ein uralter Baum, der mitkämpft.', knoten: {
    k: { ico: '🌿', name: 'Dornenweg', text: 'Alle Gegner auf dem Weg nehmen 1,5 Schaden pro Sekunde.', mod: { dornen: 1.5 } },
    a1: { ico: '🪢', name: 'Wurzelgriff', text: 'Alle 5 s hält eine Wurzel den Gegner am Tor 2 s fest.', mod: { wurzel: true } },
    a2: { ico: '🌳', name: 'Uralter Baum', text: 'Ein Baum neben der Burg kämpft mit: 10 Schaden, große Reichweite.', mod: { baum: true } },
    b1: { ico: '🌱', name: 'Rankenpfeile', text: 'Jeder Treffer des Helden hält den Gegner 0,4 s fest.', mod: { held_stun: 0.4 } },
    b2: { ico: '🟫', name: 'Sumpfland', text: 'Alle Gegner 20 % langsamer.', mod: { gegner_tempo: 0.2 } },
  } },
  zeit: { ico: '⏳', name: 'Zeit', farbe: '#7fd8ff', text: 'Langsamer, schneller, nochmal. Wer die Zeit beherrscht, beherrscht die Nacht.', knoten: {
    k: { ico: '🐢', name: 'Zeitlupe', text: 'Alle Gegner 12 % langsamer.', mod: { gegner_tempo: 0.12 } },
    a1: { ico: '⏩', name: 'Beschleunigung', text: 'Alle Zauber 30 % schneller bereit.', mod: { cd_alle: 0.3 } },
    a2: { ico: '🔁', name: 'Echo', text: 'Jeder Zauber wird 1 s später noch einmal gewirkt.', mod: { echo: true } },
    b1: { ico: '⏸️', name: 'Zeitstopp', text: 'Alle 15 s bleiben alle Gegner 1,5 s stehen.', mod: { zeitstopp: true } },
    b2: { ico: '⏪', name: 'Rückspulen', text: 'Alle 20 s werden alle Gegner 1,5 Felder zurückgeworfen.', mod: { rueckspulen: true } },
  } },
};
const SPEZ_KANTEN = [['k', 'a1'], ['a1', 'a2'], ['k', 'b1'], ['b1', 'b2']];
const SPEZ_POS = { k: [0, 1.4], a1: [-1.2, 0.2], a2: [-1.6, -1.1], b1: [1.2, 0.2], b2: [1.6, -1.1] };
const spezKnoten = (id) => { const [s, k] = id.split('_'); return SPEZ[s]?.knoten[k]; };
const spezPunkte = () => Object.keys(P.pruefungen).length - P.spezTal.length;
function spezSperre(k) {
  const id = `${P.spez}_${k}`;
  if (P.spezTal.includes(id)) return 'Schon gelernt.';
  if (k !== 'k' && !SPEZ_KANTEN.some(([a, b]) => b === k && P.spezTal.includes(`${P.spez}_${a}`))) return 'Erst den Knoten davor lernen.';
  if (spezPunkte() < 1) return 'Kein Spezialisierungspunkt frei. Bestehe die nächste ⚜️ Prüfung.';
  return null;
}

// Baum aufbauen: Knoten {id, x, y, ico, name, text, mod, typ, farbe, teilVon}, Nachbarn in nb
// Gruppe i: großer Knoten `n{i}`, kleine `n{i}_0..2` im Dreieck darum. Wege `w{k}`, Schlüsseltalente `k{i}`.
const TALENTE = { mitte: { id: 'mitte', x: 0, y: 0, ico: '🧙', name: 'Dein Held', typ: 'mitte', nb: [] } };
// Lage der Gruppen [Abstand vom Helden, Winkel in Grad, 0 = oben]: innen 6, Mitte 12, außen 6; Schlüssel hinter den äußeren
const RING = { innen: [3.6, 0, 60, 6], mitte: [6.9, 15, 30, 12], aussen: [10.2, 30, 60, 6], schluessel: 12.6, wunder: 11.6, stern: 14.6 };
const SCHLUESSEL_AN = [0, 5, 4, 3, 2, 1];   // Schlüsseltalent hinter der äußeren Gruppe i (Echo → Sturmherz, Werkstatt → Turmherr …)
// klein = kompaktes Netz für Burg 7 (Nutzerwunsch 2026-11-09: weniger Talente, alle großen Kräfte und Schlüsseltalente
// bleiben, man kommt schneller hin und überblickt es besser): je Gruppe nur EIN kleiner Knoten (der zum Helden zeigt),
// keine Wegknoten, enger zusammen. Ids bleiben gleich (n{i}, n{i}_0, k{i}) – weggefallene Knoten geben ihren Punkt zurück.
// Aufgerufen beim Laden (volles Netz) und in main.js nach dem Laden des Spielstands mit der richtigen Burg.
let NETZ_KLEIN = false;
function baueBaum(klein = false, gross = false) {
  NETZ_KLEIN = klein; NETZ_GROSS = gross && !klein;
  for (const id of Object.keys(TALENTE)) if (id !== 'mitte') delete TALENTE[id];
  TALENTE.mitte.nb = [];
  const kante = (a, b) => { if (!TALENTE[a].nb.includes(b)) { TALENTE[a].nb.push(b); TALENTE[b].nb.push(a); } };
  const mass = klein ? 0.72 : 1, kleine = klein ? 1 : 3;
  const polar = (r, grad) => ({ x: Math.sin(grad * Math.PI / 180) * r * mass, y: -Math.cos(grad * Math.PI / 180) * r * mass });
  const knoten = (id, daten, p) => { TALENTE[id] = { ...daten, id, x: p.x, y: p.y, nb: [] }; };
  let wk = 0;
  // Weg von Knoten a nach b; ist er lang, liegen kleine Wegknoten dazwischen (etwa alle 1,8 Felder) – im kleinen Netz keine
  const weg = (a, b) => {
    const A = TALENTE[a], B = TALENTE[b], d = Math.hypot(B.x - A.x, B.y - A.y), n = klein ? 0 : Math.max(0, Math.ceil(d / 1.8) - 1);
    let vor = a;
    for (let i = 1; i <= n; i++) {
      const id = `w${wk}`;
      knoten(id, { ...WEGKNOTEN[wk++ % WEGKNOTEN.length], typ: 'klein' }, { x: A.x + (B.x - A.x) * i / (n + 1), y: A.y + (B.y - A.y) * i / (n + 1) });
      kante(vor, id); vor = id;
    }
    kante(vor, b);
  };
  // Gruppen setzen
  const lagen = [];
  for (const [r, start, schritt, n] of [RING.innen, RING.mitte, RING.aussen]) for (let i = 0; i < n; i++) lagen.push({ r, grad: start + i * schritt });
  GRUPPEN.forEach((g, i) => {
    const { r, grad } = lagen[i], c = polar(r, grad), a = ART[g.art], id = `n${i}`;
    knoten(id, { ...g, typ: 'gross', farbe: a.farbe }, c);
    // drei kleine im Dreieck (im kleinen Netz nur einer), einer zeigt zum Helden
    for (let j = 0; j < kleine; j++) {
      const w = (grad + 180 + j * 120) * Math.PI / 180;
      knoten(`${id}_${j}`, { ...(g.klein || a.klein), typ: 'klein', farbe: a.farbe, teilVon: id }, { x: c.x + Math.sin(w) * 0.9, y: c.y - Math.cos(w) * 0.9 });
      kante(`${id}_${j}`, id);
    }
    if (kleine > 1) for (let j = 0; j < kleine; j++) kante(`${id}_${j}`, `${id}_${(j + 1) % kleine}`);
  });
  // Verbindungen zwischen Gruppen: vom kleinen Knoten der einen, der der anderen am nächsten ist
  // (im kleinen Netz gibt es je Gruppe nur den einen kleinen Knoten: jede große Kraft kostet so genau 2 Punkte)
  const naechster = (i, zu) => (klein ? [`n${i}_0`] : [0, 1, 2].map((j) => `n${i}_${j}`)).sort((p, q) => Math.hypot(TALENTE[p].x - zu.x, TALENTE[p].y - zu.y) - Math.hypot(TALENTE[q].x - zu.x, TALENTE[q].y - zu.y))[0];
  const verbinde = (i, j) => weg(naechster(i, TALENTE[`n${j}`]), naechster(j, TALENTE[`n${i}`]));
  for (let i = 0; i < 6; i++) { weg('mitte', naechster(i, TALENTE.mitte)); verbinde(i, (i + 1) % 6); }   // innen: zum Helden und im Kreis
  for (let i = 0; i < 6; i++) { verbinde(i, 6 + ((2 * i + 11) % 12)); verbinde(i, 6 + 2 * i); }          // innen → die zwei mittleren daneben
  for (let i = 0; i < 12; i++) verbinde(6 + i, 6 + ((i + 1) % 12));                                       // Mitte: im Kreis
  for (let i = 0; i < 6; i++) { verbinde(18 + i, 6 + 2 * i); verbinde(18 + i, 6 + 2 * i + 1); }          // außen → die zwei mittleren davor
  // Schlüsseltalente hinter den äußeren Gruppen
  for (let i = 0; i < 6; i++) {
    knoten(`k${i}`, { ...SCHLUESSEL[SCHLUESSEL_AN[i]], typ: 'key' }, polar(RING.schluessel, RING.aussen[1] + i * RING.aussen[2]));
    weg(klein ? `n${18 + i}` : naechster(18 + i, TALENTE[`k${i}`]), `k${i}`);   // Schlüsseltalent hinter dem großen Knoten
  }
  // ✦ Wunder zwischen je zwei äußeren Gruppen (nur im großen Netz): Wunder i liegt bei Winkel 60·i, die Nachbarn bei ±30°
  if (!klein) for (let i = 0; i < 6; i++) {
    knoten(`x${i}`, { ...WUNDER[i], typ: 'wunder' }, polar(RING.wunder, i * 60));
    weg(naechster(18 + ((i + 5) % 6), TALENTE[`x${i}`]), `x${i}`);
    weg(naechster(18 + i, TALENTE[`x${i}`]), `x${i}`);
  }
  // ✧ Funde als Abstecher vom mittleren Ring (zuletzt angelegt, damit die Ids der Wegknoten alter Spielstände gleich bleiben)
  if (!klein) for (let i = 0; i < 12; i++) {
    const grad = RING.mitte[1] + (i + 0.5) * RING.mitte[2], ziel = polar(RING.mitte[0] - 0.4, grad);
    const an = Object.values(TALENTE).filter((t) => t.id[0] === 'w').sort((p, q) => Math.hypot(p.x - ziel.x, p.y - ziel.y) - Math.hypot(q.x - ziel.x, q.y - ziel.y))[0];
    const r = Math.hypot(an.x, an.y) + 1.05, w = Math.atan2(an.x, -an.y);
    knoten(`f${i}`, { ...FUNDE[i], typ: 'fund' }, { x: Math.sin(w) * r, y: -Math.cos(w) * r });
    kante(an.id, `f${i}`);
  }
  // ✦ Kraft-Funde zwischen innerem und mittlerem Ring: Abstecher seitlich vom Wegknoten, der dem Ziel am nächsten liegt
  if (!klein) for (let i = 0; i < 12; i++) {
    const ziel = polar(5.3, RING.mitte[1] + i * RING.mitte[2] + 15);
    const an = Object.values(TALENTE).filter((t) => t.id[0] === 'w' && Math.hypot(t.x, t.y) < 6.2).sort((p, q) => Math.hypot(p.x - ziel.x, p.y - ziel.y) - Math.hypot(q.x - ziel.x, q.y - ziel.y))[0];
    let dx = ziel.x - an.x, dy = ziel.y - an.y, d = Math.hypot(dx, dy);
    if (d < 0.3) { dx = an.x; dy = an.y; d = Math.hypot(dx, dy); }   // liegt fast drauf: nach außen schieben
    knoten(`v${i}`, { ...KRAFT_FUNDE[i], typ: 'fund', kraft: true }, { x: an.x + dx / d * 0.95, y: an.y + dy / d * 0.95 });
    kante(an.id, `v${i}`);
  }
  if (!NETZ_GROSS) return;
  // 🌌 Sternenring (LK/Endlos): Erzschlüssel o{i} hinter Wunder i (ein Wegknoten dazwischen)
  for (let i = 0; i < 6; i++) {
    knoten(`o${i}`, { ...ERZSCHLUESSEL[i], typ: 'key', erz: true }, polar(RING.stern, i * 60));
    weg(`x${i}`, `o${i}`);
  }
  // 💎 Juwel-Fassungen: zwischen mittlerem und äußerem Ring an der freiesten Stelle um Winkel 60·i, als Abstecher vom nächsten Knoten
  const alle = () => Object.values(TALENTE);
  for (let i = 0; i < 6; i++) {
    let best = null, bd = -1;
    for (let r = 8.2; r <= 9.8; r += 0.2) for (let gr = i * 60 - 14; gr <= i * 60 + 14; gr += 2) {
      const p = polar(r, gr), d = Math.min(...alle().map((t) => Math.hypot(t.x - p.x, t.y - p.y)));
      if (d > bd) { bd = d; best = p; }
    }
    const an = alle().filter((t) => !['key', 'wunder', 'juwel', 'mitte'].includes(t.typ)).sort((p, q) => Math.hypot(p.x - best.x, p.y - best.y) - Math.hypot(q.x - best.x, q.y - best.y))[0];
    knoten(`j${i}`, { ico: '💎', name: 'Juwel-Fassung', text: `Setze ein Juwel ein: Es verändert alle gelernten Knoten im Kreis darum (${String(JUWEL_R).replace('.', ',')} Felder). Juwelen findest du nach gehaltenen Nächten.`, typ: 'juwel' }, best);
    kante(an.id, `j${i}`);
  }
}
baueBaum();

// Lernbare Knoten auf dem kürzesten Weg zu ziel (für „Weg dorthin“ und den Balance-Bot).
// Knoten, die einen noch nicht gelernten Cluster brauchen, werden umgangen – fehlt dem Ziel selbst
// sein Cluster, geht der Weg erst dorthin.
function talentWeg(ziel, gelernt = P.talente) {
  const vor = {}, q = [], hat = (id) => gelernt.includes(id);
  for (const id of gelernt) { vor[id] = null; q.push(id); }
  const t = TALENTE[ziel];
  if (t.braucht && !hat(t.braucht)) {
    const erst = talentWeg(t.braucht, gelernt);
    return erst.length ? erst.concat(talentWeg(ziel, [...gelernt, ...erst])) : [];
  }
  while (q.length) {
    const id = q.shift();
    if (id === ziel) break;
    for (const n of TALENTE[id].nb) {
      // Wahl-Knoten sind Sackgassen: nur betreten, wenn sie selbst das Ziel sind
      if (n in vor || (TALENTE[n].gruppe && n !== ziel) || (TALENTE[n].braucht && !hat(TALENTE[n].braucht))) continue;
      vor[n] = id; q.push(n);
    }
  }
  if (!(ziel in vor)) return [];
  const weg = [];
  for (let x = ziel; x && !hat(x); x = vor[x]) weg.unshift(x);
  return weg;
}

// --- XP und Level ---
function heldLevel(xp = P.xp) {
  let l = 1;
  while (xp >= xpFuerLevel(l)) { xp -= xpFuerLevel(l); l++; }
  return { level: l, rest: xp, noetig: xpFuerLevel(l) };
}
const punkteFrei = () => (heldOffen() ? heldLevel().level - 1 + (P.erbePunkt || 0) - (P.talente.length - 1) : 0);   // vor HELD_AB: noch keine Punkte (XP zählen still mit)

// Summe aus Steinen im Sockel, allen gelernten Talenten (wirken immer) und aktiven Kombos
function talentWerte(liste = [...P.talente, ...P.spezTal]) {
  const T = { zauber: [] };
  // ✧ Funde wachsen mit dem Level
  const fund = (t) => { if (!t?.wachsen) return t?.mod; const f = fundFaktor(), m = { ...t.mod }; for (const k of t.wachsen) m[k] *= f; return m; };
  // 💎 Juwelen: eingesetzte Juwelen in gelernten Fassungen verändern die gelernten Knoten in ihrem Kreis
  const fassungen = NETZ_GROSS ? liste.filter((id) => TALENTE[id]?.typ === 'juwel' && juwelVon(id)).map((id) => [TALENTE[id], juwelVon(id)]) : [];
  const mal = (id, m) => {
    const t = TALENTE[id];
    if (!m || !t || !fassungen.length) return m;
    let f = 1;
    for (const [j, J] of fassungen) if (J.mal && juwelImKreis(j, t)) f *= J.mal(t);
    if (f === 1) return m;
    const n = {};
    for (const [k, v] of Object.entries(m)) n[k] = typeof v === 'number' && k !== 'turm_max' ? v * f : v;
    return n;
  };
  const juwelJe = fassungen.filter(([, J]) => J.je).map(([j, J]) => {
    const n = liste.filter((id) => TALENTE[id] && juwelImKreis(j, TALENTE[id])).length, m = {};
    for (const [k, v] of Object.entries(J.je)) m[k] = v * n;
    return m;
  });
  for (const m0 of [...steinMods(), ...liste.map((id) => mal(id, fund(TALENTE[id])) || spezKnoten(id)?.mod), ...juwelJe, ...meisterMods(), ...kombosAktiv().map((k) => k.mod), ...schatzMods()]) {   // 🏅 Schätze aus den Abzeichen (abzeichen.js)
    const m = m0 || {};
    for (const [k, v] of Object.entries(m)) {
      if (k === 'zauber') T.zauber.push(v);
      else if (typeof v === 'number') T[k] = (T[k] || 0) + v;
      else T[k] = v;
    }
  }
  T.zauber = [...new Set(T.zauber)];   // derselbe Zauber aus Wunder und Schatz zählt einmal
  // 🏀 Abpraller (großer Knoten) wirkt auf jeden Zauber auf seine Weise
  if (T.zauber_abprall) { T.fb_abprall = (T.fb_abprall || 0) + 0.5; T.kb_kette = (T.kb_kette || 0) + 2; T.fn_doppel = true; T.schutz_plus = (T.schutz_plus || 0) + 1; }
  // 💪 Deine Stärke: auf das, was in der letzten Nacht am meisten Schaden gemacht hat (P.staerke, nacht.js staerkeMerken)
  if (T.staerke) { const k = { turm: 'turm_dmg', held: 'held_dmg', zauber: 'alle_dmg' }[P.staerke] || 'turm_dmg'; T[k] = (T[k] || 0) + T.staerke; }
  return T;
}

// Abstand (Schritte) jedes Knotens zum nächsten gelernten Knoten
function talentAbstand() {
  const d = {}, q = [...P.talente];
  for (const id of q) d[id] = 0;
  while (q.length) {
    const id = q.shift();
    for (const n of TALENTE[id].nb) if (d[n] === undefined) { d[n] = d[id] + 1; q.push(n); }
  }
  return d;
}

// Warum kann ein Knoten (nicht) gelernt werden? null = geht
function talentSperre(id) {
  const t = TALENTE[id];
  if (P.talente.includes(id)) return 'Schon gelernt.';
  if (!t.nb.some((n) => P.talente.includes(n))) {
    const s = talentAbstand()[id];
    return s > 1 ? `Noch ${s - 1} Talent${s - 1 === 1 ? '' : 'e'} auf dem Weg dorthin.` : 'Erst einen Nachbarn lernen.';
  }
  if (t.gruppe && P.talente.some((x) => TALENTE[x].gruppe === t.gruppe)) return 'Du hast hier schon die andere Möglichkeit gewählt.';
  if (t.braucht && !P.talente.includes(t.braucht)) return `Braucht zuerst ${TALENTE[t.braucht].ico} ${TALENTE[t.braucht].name}.`;
  // 🎯 Scharfschützenburg: nur, wenn höchstens so viele Türme stehen, wie sie erlaubt
  const tmax = t.mod?.turm_max, zahl = Object.keys(P.tuerme || {}).length;
  if (tmax && zahl > tmax) return `Hier dürfen höchstens ${tmax} Türme stehen – du hast ${zahl}. Verkaufe erst ${zahl - tmax} Turm${zahl - tmax === 1 ? '' : 'e'} (Turm antippen → Verkaufen).`;
  if (punkteFrei() < 1) return 'Kein Talentpunkt frei. Halte Nächte, um Level aufzusteigen.';
  return null;
}

// --- Ansicht: Blatt mit dem Baum ---
let TSEL = 'mitte', RESET_WARTE = false, TTAB = 'netz', SSEL = 'k', SPEZ_WARTE = null;

function talentBlatt(tab = TTAB) {
  TTAB = tab;
  // Beim allerersten Öffnen erst die Erklärkarte zum Talentnetz (kam sonst erst am 2. Abend), danach das Blatt
  if (typeof erklaere === 'function' && erklaere('talente', '', () => talentBlatt(tab))) return;
  karte('<div class="ttabs" id="ttabs"></div><div id="talentBaum"></div><div id="talentInfo"></div>', [{ label: 'Fertig', fn: () => { if (P.phase === 'abend') abendStart(); else if (P.phase === 'nacht' && N) { nachtKnoepfe(); nachtInfo(); } } }]);   // Abzeichen „✨ 1“ und Pausetext neu
  $('#overlay .sheet').classList.add('breit');
  talentRender();
}

function talentRender() {
  const sp = spezPunkte(), np = punkteFrei();
  $('#ttabs').innerHTML = `<button data-tab="steine" class="${TTAB === 'steine' ? 'an' : ''}">🪄 Zauber</button>
    <button data-tab="netz" class="${TTAB === 'netz' ? 'an' : ''}">🌐 Talentnetz${np > 0 ? ` <span class="badge">${np}</span>` : ''}</button>
    <button data-tab="spez" class="${TTAB === 'spez' ? 'an' : ''}">⚜️ Spezialisierung${sp > 0 ? ` <span class="badge">${sp}</span>` : ''}</button>
    <button data-tab="buch" class="${TTAB === 'buch' ? 'an' : ''}">📖 Kombo-Buch <span class="hinweis">${P.kombos.length}/${KOMBO.length + DREIER.length}</span></button>`;
  for (const b of document.querySelectorAll('#ttabs button')) b.onclick = () => { TTAB = b.dataset.tab; talentRender(); };
  if (TTAB === 'spez') spezRender(); else if (TTAB === 'buch') buchRender(); else if (TTAB === 'steine') steinRender(); else netzRender();
}

// --- 📖 Kombo-Buch: 15 Paare und 20 Dreier; entdeckt = in einer Nacht ausgelöst ---
function buchRender() {
  const aktiv = kombosAktiv().map((k) => k.id), da = (liste) => liste.filter((k) => P.kombos.includes(k.id)).length;
  const karte = (k, wie) => {
    const ist = P.kombos.includes(k.id), an = aktiv.includes(k.id);
    return `<div class="kkarte ${ist ? 'da' : ''} ${an ? 'an' : ''}">
      <div class="kpaar">${k.paar.map((t) => THEMEN[t].ico).join(' + ')}${an ? ' <span class="kaktiv">aktiv</span>' : ''}</div>
      ${ist ? `<div class="kname">${k.ico} ${esc(k.name)}</div><div class="ktext">${esc(k.text)}</div>`
        : `<div class="kname">❔ ???</div><div class="ktext">${an ? 'Wirkt schon – löse sie in der Nacht aus!' : `${k.paar.map((t) => THEMEN[t].name).join(' + ')}: ${wie}`}</div>`}</div>`;
  };
  $('#talentBaum').innerHTML = `<div class="tkopf"><h2>📖 Kombo-Buch</h2><span><b>${P.kombos.length} von ${KOMBO.length + DREIER.length}</b> entdeckt</span></div>
    <p class="hinweis">Kombos kosten nichts: Sie wirken von selbst, sobald die richtigen 🪄 Zauber zusammen eingesetzt sind. Entdeckt ist eine Kombo, wenn sie in einer Nacht zum ersten Mal auslöst.</p>
    <h3 class="kabschnitt">🔗 Zweier-Kombos <span class="hinweis">${da(KOMBO)}/${KOMBO.length} · Zauber zweier Richtungen</span></h3>
    <div class="kombobuch">${KOMBO.map((k) => karte(k, 'Zauber beider Richtungen zusammen einsetzen.')).join('')}</div>
    <h3 class="kabschnitt">🔗🔗 Dreier-Kombos <span class="hinweis">${da(DREIER)}/${DREIER.length} · Zauber dreier Richtungen</span></h3>
    <div class="kombobuch">${DREIER.map((k) => karte(k, 'Zauber aller drei Richtungen zusammen einsetzen.')).join('')}</div>`;
  $('#talentInfo').innerHTML = '';
}

function netzRender() {
  // Das ganze Netz ist von Anfang an sichtbar – so kann man seinen Weg planen.
  // Was noch weit weg ist, ist nur etwas blasser.
  const d = talentAbstand(), U = 60;
  const sichtbar = Object.values(TALENTE);
  const xs = sichtbar.map((t) => t.x), ys = sichtbar.map((t) => t.y);
  const x0 = Math.min(...xs) - 1.4, y0 = Math.min(...ys) - 1.4, w = Math.max(...xs) + 1.4 - x0, h = Math.max(...ys) + 1.4 - y0;
  const vis = new Set(sichtbar.map((t) => t.id));
  // Zarte Ringe hinter den Gruppen (innen, Mitte, außen)
  const stuecke = [RING.innen[0], RING.mitte[0], RING.aussen[0]].map((r) => `<circle r="${r * U}" fill="none" stroke="#3a4a80" stroke-opacity=".35" stroke-width="2" stroke-dasharray="4 10"/>`).join('');
  // Weg vom Gelernten zum gewählten Knoten (gestrichelt)
  const weg = TSEL && !P.talente.includes(TSEL) ? talentWeg(TSEL) : [];
  const wegSet = new Set(weg);
  // Große Knoten mit zartem Kreis dahinter
  // 🏅 Meisterschaft: goldener Ring = gewählt, pulsierend = Gruppe fertig, Meisterschaft noch frei
  const cluster = sichtbar.filter((t) => t.typ === 'gross').map((t) => {
    const fertig = gruppeKomplett(t.id), m = fertig && P.meister?.[t.id] !== undefined;
    return `<circle cx="${t.x * U}" cy="${t.y * U}" r="${(fertig ? 1.35 : 0.7) * U}" class="tcluster ${P.talente.includes(t.id) ? 'an' : ''} ${m ? 'meister' : fertig ? 'meisterfrei' : ''}"/>`;
  }).join('');
  // 💎 Kreis jeder Juwel-Fassung (gefüllt, wenn ein Juwel darin steckt); 🌌 Sternenring als zarter Kreis
  const juwelKreise = (NETZ_GROSS ? `<circle r="${RING.stern * U}" fill="none" stroke="#b07aff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="2 8"/>` : '')
    + sichtbar.filter((t) => t.typ === 'juwel').map((t) => `<circle cx="${t.x * U}" cy="${t.y * U}" r="${JUWEL_R * U}" class="jkreis ${juwelVon(t.id) ? 'an' : ''} ${TSEL === t.id ? 'sel' : ''}"/>`).join('');
  let kanten = '';
  for (const t of sichtbar) for (const n of t.nb) {
    if (n < t.id || !vis.has(n)) continue;
    const an = P.talente.includes(t.id) && P.talente.includes(n);
    const plan = (wegSet.has(t.id) || P.talente.includes(t.id)) && (wegSet.has(n) || P.talente.includes(n)) && !an;
    kanten += `<line x1="${t.x * U}" y1="${t.y * U}" x2="${TALENTE[n].x * U}" y2="${TALENTE[n].y * U}" class="tk ${an ? 'an' : ''} ${plan ? 'plan' : ''}"/>`;
  }
  const r = { mitte: 0.5, key: 0.5, wunder: 0.52, fund: 0.36, gross: 0.42, wahl: 0.36, faehig: 0.34, klein: 0.3, juwel: 0.44 };
  const knoten = sichtbar.map((t) => {
    const an = P.talente.includes(t.id), geht = !an && !talentSperre(t.id) && t.id !== 'mitte';
    const fern = !an && d[t.id] > 1 && TSEL !== t.id && !wegSet.has(t.id);
    const farbe = t.farbe ? ` style="--farbe:${t.farbe}"` : '';
    return `<g class="tn ${t.typ} ${t.erz ? 'erz' : ''} ${an ? 'an' : ''} ${geht ? 'geht' : ''} ${fern ? 'fern' : ''} ${wegSet.has(t.id) ? 'plan' : ''} ${TSEL === t.id ? 'sel' : ''}" data-t="${t.id}"${farbe} transform="translate(${t.x * U},${t.y * U})">
      <circle r="${r[t.typ] * U}"/>
      <text style="font-size:${r[t.typ] * U * 0.95}px">${t.typ === 'juwel' ? juwelVon(t.id)?.ico || t.ico : t.ico}</text></g>`;
  }).join('');
  const L = heldLevel();
  $('#talentBaum').innerHTML = `<div class="tkopf"><h2>✨ Talente</h2><span>🧙 Level ${L.level} · ${L.rest}/${L.noetig} XP · <b>${punkteFrei()} Punkt${punkteFrei() === 1 ? '' : 'e'} frei</b></span></div>
    ${steinZeile()}
    <div class="netzrahmen"><svg class="talentsvg ganz" preserveAspectRatio="xMidYMid meet">${stuecke}${juwelKreise}${cluster}${kanten}${knoten}</svg>
      <div class="zoomknoepfe"><button data-z="1.4" title="Näher heran">➕</button><button data-z="0.7" title="Weiter weg">➖</button><button data-z="0" title="Ganzes Netz">🧭</button></div>
      <div id="netzInfo" class="netzinfo"></div></div>`;
  $('#talentInfo').innerHTML = '';   // Info schwebt im Netz, direkt beim angetippten Knoten (Nutzerwunsch: Knopf nah an der Auswahl)
  netzZoom({ x0, y0, w, h, U });
  $('#zuSteinen').onclick = () => { TTAB = 'steine'; talentRender(); };
  // 📱 Nutzerwunsch 2026-11-15: am Handy liegt der Lernen-Knopf weit unten – den gewählten Knoten nochmal antippen = lernen
  for (const g of document.querySelectorAll('#talentBaum [data-t]')) g.onclick = () => {
    if (TZ.gezogen) return;
    const id = g.dataset.t;
    if (TSEL === id && talentLernbar(id)) { talentLernen(id); return; }
    TSEL = id; RESET_WARTE = false; talentRender();
    if (talentLernbar(id) && (P.gesehen.nochmalTippen || 0) < 3) { P.gesehen.nochmalTippen = (P.gesehen.nochmalTippen || 0) + 1; toast('👆 Nochmal antippen = lernen'); }
  };
  talentInfo();
}

// 🔍 Netz zoomen und verschieben: Knöpfe, Mausrad, Ziehen (Maus und Finger). TZ bleibt beim Neuzeichnen erhalten.
let TZ = { s: 1.8, cx: 0, cy: 0, gezogen: false };
function netzZoom({ x0, y0, w, h, U }) {
  const svg = $('#talentBaum svg');
  const setze = () => {
    TZ.s = Math.max(1, Math.min(4, TZ.s));
    const vw = w / TZ.s, vh = h / TZ.s;
    TZ.cx = Math.max(x0 + vw / 2, Math.min(x0 + w - vw / 2, TZ.cx));
    TZ.cy = Math.max(y0 + vh / 2, Math.min(y0 + h - vh / 2, TZ.cy));
    svg.setAttribute('viewBox', `${(TZ.cx - vw / 2) * U} ${(TZ.cy - vh / 2) * U} ${vw * U} ${vh * U}`);
    netzInfoLage();
  };
  setze();
  for (const b of document.querySelectorAll('.zoomknoepfe button')) b.onclick = () => {
    const z = +b.dataset.z;
    if (z) TZ.s *= z; else Object.assign(TZ, { s: 1, cx: 0, cy: 0 });
    setze();
  };
  // Mausrad scrollt das Blatt; Zoomen mit Strg + Mausrad (oder ➕ ➖), damit man die Infokarte darunter erreicht
  svg.onwheel = (ev) => { if (!ev.ctrlKey) return; ev.preventDefault(); TZ.s *= ev.deltaY < 0 ? 1.15 : 1 / 1.15; setze(); };
  let start = null;
  svg.onpointerdown = (ev) => { start = { x: ev.clientX, y: ev.clientY, cx: TZ.cx, cy: TZ.cy }; TZ.gezogen = false; };
  svg.onpointermove = (ev) => {
    if (!start) return;
    const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
    if (!TZ.gezogen && Math.hypot(dx, dy) < 6) return;
    TZ.gezogen = true;
    const k = (w / TZ.s) / svg.clientWidth;   // Einheiten pro Bildschirmpixel (ungefähr)
    TZ.cx = start.cx - dx * k; TZ.cy = start.cy - dy * k;
    setze();
  };
  svg.onpointerup = svg.onpointerleave = () => { start = null; setTimeout(() => { TZ.gezogen = false; }, 0); };
}

// Die schwebende Info liegt oben, wenn der gewählte Knoten in der unteren Hälfte des Netzes ist, sonst unten
function netzInfoLage() {
  const box = $('#netzInfo'), svg = $('#talentBaum svg'), t = TALENTE[TSEL];
  if (!box || !svg || !t) return;
  const r = svg.getBoundingClientRect(), p = svg.createSVGPoint();
  p.x = t.x * 60; p.y = t.y * 60;
  // Ecke gegenüber dem Knoten: oben/unten und links/rechts, damit Knoten und Mitte frei bleiben
  const m = svg.getScreenCTM(), q = m ? p.matrixTransform(m) : null;
  const y = q ? q.y - r.top : r.height / 2, x = q ? q.x - r.left : r.width / 2;
  box.classList.toggle('oben', y > r.height / 2);
  box.classList.toggle('rechts', x < r.width / 2 - 20);
}

function talentInfo() {
  const t = TALENTE[TSEL], box = $('#netzInfo') || $('#talentInfo');
  setTimeout(netzInfoLage, 0);
  if (t.id === 'mitte') {
    const L = heldLevel().level, preis = resetPreis(L), gelernt = P.talente.length - 1 + P.spezTal.length;
    box.innerHTML = figurText(`<h3>🧙 Dein Held</h3><p class="hinweis">Tippe einen Knoten an – hier erscheint, was er kann, und der Knopf zum Lernen.</p>
      <details><summary class="hinweis">❓ Wie funktioniert das Netz?</summary><p class="hinweis">Hier beginnt jeder Weg. Überall im Netz liegen Gruppen: ein großer Knoten mit einer besonderen Kraft und drei kleine, die zu ihm passen. Wege verbinden die Gruppen, ganz außen warten Schlüsseltalente mit Nachteil.${NETZ_KLEIN ? '' : ' Zwischen ihnen liegen ✦ Wunder, die etwas ganz Neues freischalten (neuer Turm, neue Zauber, Eule …). Lernst du eine Gruppe ganz, wählst du dort eine 🏅 Meisterschaft.'} Alles erreichst du nie – plane deinen Weg! Alles Gelernte wirkt immer – egal, welche 🪄 Zauber gerade eingesetzt sind. Ziehen verschiebt das Netz, ➕ ➖ zoomen. Türme, Mauer und Torwache kaufst du mit Gold.${NETZ_KLEIN ? '' : ' Kleine ✧ Funde am Rand der Wege bringen eigene Kräfte: Sternschnuppen, Feuervogel, weite Zauber, Kombo-Kraft, günstigere Türme …'}${NETZ_GROSS ? ' Ganz außen liegt der 🌌 Sternenring mit sechs Erzschlüsseln: sehr stark, aber jeder ändert deinen Spielstil mit einem großen Nachteil – lies ihn genau. 💎 Juwel-Fassungen sind Abstecher: Ein eingesetztes Juwel verstärkt alle gelernten Knoten in seinem Kreis. Juwelen findest du nach gehaltenen Nächten und kannst sie kostenlos tauschen.' : ''}</p></details>
      ${gelernt || P.spez ? `<button class="btn ${RESET_WARTE ? 'warn' : 'leise'}" id="resetBtn" ${P.gold < preis ? 'disabled' : ''}>${RESET_WARTE ? 'Wirklich? Nochmal tippen!' : `🔄 Alles zurücksetzen (${gelernt} Punkte) · ${preis} 🪙`}${fehlt(preis)}</button>
      <p class="hinweis">Setzt auch die Spezialisierung zurück. Der Preis steigt mit deinem Level.</p>` : ''}`);
    const b = $('#resetBtn');
    if (b) b.onclick = () => {
      if (!RESET_WARTE) { RESET_WARTE = true; talentInfo(); return; }
      goldDazu(-preis); P.talente = ['mitte']; P.spezTal = []; P.spez = null; P.meister = {}; RESET_WARTE = false; speichern(); talentRender();
    };
    return;
  }
  const sperre = talentSperre(t.id), an = P.talente.includes(t.id);
  const bereich = t.teilVon ? ` · gehört zu ${TALENTE[t.teilVon].ico} ${TALENTE[t.teilVon].name}` : '';
  const art = { key: t.erz ? '🌌 Erzschlüssel im Sternenring: sehr stark, mit großem Nachteil' : '👑 Schlüsseltalent: stark, aber mit Nachteil', juwel: '💎 Juwel-Fassung', wunder: '✦ Wunder: schaltet etwas Neues frei', fund: t.kraft ? '✧ Fund: macht etwas Bestimmtes stärker' : '✧ Fund: eine eigene kleine Kraft', gross: '⭐ Großer Knoten', klein: '• Kleiner Knoten' }[t.typ] + bereich;
  const weg = an ? [] : talentWeg(t.id);
  const wegText = !an && weg.length > 1 ? `<p class="hinweis">🧭 Weg dorthin: ${weg.length} Punkte (gestrichelt markiert).</p>` : '';
  // 💪 anpassende Knoten: sagen, worauf sie gerade wirken
  const jetzt = t.mod?.staerke ? `<p class="hinweis">Gerade: ${STAERKE_NAME[P.staerke] || STAERKE_NAME.turm}</p>`
    : t.mod?.lieb_turm && lieblingsturm() ? `<p class="hinweis">Gerade: ${TUERME[lieblingsturm()].ico} ${TUERME[lieblingsturm()].name}</p>`
    : t.wachsen ? `<p class="hinweis">📈 Wächst mit deinem Level – gerade ×${String(Math.round(fundFaktor() * 100) / 100).replace('.', ',')}.</p>`
    // ✦ Wunder mit einem Zauber, den es auch als 🏅 Schatz gibt (z. B. ☄️ Meteor): schon gekauft? Dann bringt das Wunder nichts Neues
    : t.mod?.zauber && typeof SCHAETZE !== 'undefined' && Object.keys(SCHAETZE).some((s) => SCHAETZE[s].mod?.zauber === t.mod.zauber && schatzHat(s))
      ? `<p class="hinweis">⚠️ Diesen Zauber hast du schon als 🏅 Schatz – das Wunder bringt ihn nicht ein zweites Mal.</p>` : '';
  // 🏅 Meisterschaft der Gruppe (am großen Knoten und an seinen kleinen)
  const gid = t.typ === 'gross' ? t.id : t.teilVon, mliste = gid && !NETZ_KLEIN && MEISTER[TALENTE[gid].art];
  let meister = '';
  if (mliste) {
    const fertig = gruppeKomplett(gid), gew = P.meister?.[gid];
    meister = `<div class="meisterbox"><h4>🏅 Meisterschaft</h4><p class="hinweis">${fertig ? 'Die ganze Gruppe ist gelernt! Wähle eine Meisterschaft – kostenlos, du kannst jederzeit wechseln.'
      : `Lerne die ganze Gruppe (${TALENTE[gid].ico} und die 3 kleinen Knoten darum), dann wählst du hier eine davon – kostenlos.`}</p>
      <div class="meisterwahl">${mliste.map((m, i) => `<button data-meister="${i}" class="${gew === i && fertig ? 'sel' : ''}" ${fertig ? '' : 'disabled'}><b>${m.ico} ${esc(m.name)}</b><span class="hinweis">${esc(m.text)}</span></button>`).join('')}</div></div>`;
  }
  // 💎 Juwel-Fassung: eigene Juwelen zum Einsetzen (antippen = einsetzen bzw. tauschen, kostenlos; ein Juwel steckt höchstens in einer Fassung)
  let juwel = '';
  if (t.typ === 'juwel') {
    const drin = P.juwelIn?.[t.id], liste = P.juwelen || [];
    const wo = (i) => Object.entries(P.juwelIn || {}).find(([f, x]) => x === i && f !== t.id)?.[0];
    const imKreis = Object.values(TALENTE).filter((o) => juwelImKreis(t, o));
    juwel = `<div class="meisterbox"><h4>💎 Juwelen</h4>
      <p class="hinweis">Im Kreis liegen ${imKreis.length} Knoten, davon ${imKreis.filter((o) => P.talente.includes(o.id)).length} gelernt.${an ? '' : ' Lerne die Fassung, dann kannst du ein Juwel einsetzen.'}</p>
      ${liste.length ? `<div class="meisterwahl">${liste.map((i) => `<button data-juwel="${i}" class="${drin === i ? 'sel' : ''}" ${an ? '' : 'disabled'}><b>${JUWELEN[i].ico} ${esc(JUWELEN[i].name)}${drin === i ? ' · steckt hier' : wo(i) ? ' · steckt woanders' : ''}</b><span class="hinweis">${esc(JUWELEN[i].text)}</span></button>`).join('')}</div>`
        : '<p class="hinweis">Du hast noch kein Juwel. Das erste bekommst du, sobald du eine Fassung lernst – weitere nach gehaltenen Nächten.</p>'}
      ${drin !== undefined && an ? '<button class="btn leise" id="juwelRaus">Juwel herausnehmen</button>' : ''}</div>`;
  }
  box.innerHTML = `<div class="tart">${art}</div><h3>${t.ico} ${esc(t.name)}</h3><p>${esc(t.text)}</p>${jetzt}${wegText}
    ${an ? '<p class="hinweis">✅ Gelernt</p>' : sperre ? (wegText && sperre.startsWith('Noch') ? '' : `<p class="hinweis">${esc(sperre)}</p>`) : '<button class="btn gold" id="lernBtn">Lernen (1 Punkt)</button><span class="hinweis"> oder Knoten nochmal antippen</span>'}${meister}${juwel}`;
  for (const mb of box.querySelectorAll('[data-meister]')) mb.onclick = () => { (P.meister ||= {})[gid] = +mb.dataset.meister; speichern(); talentRender(); };
  for (const jb of box.querySelectorAll('[data-juwel]')) jb.onclick = () => {
    const i = +jb.dataset.juwel;
    P.juwelIn ||= {};
    for (const f of Object.keys(P.juwelIn)) if (P.juwelIn[f] === i) delete P.juwelIn[f];   // aus der alten Fassung nehmen
    P.juwelIn[t.id] = i; speichern(); talentRender();
  };
  const jr = $('#juwelRaus');
  if (jr) jr.onclick = () => { delete P.juwelIn[t.id]; speichern(); talentRender(); };
  const b = $('#lernBtn');
  if (b) b.onclick = () => talentLernen(t.id);
}
// Lernbar = nicht die Mitte, noch nicht gelernt, nichts sperrt (Punkt frei, angrenzend …)
const talentLernbar = (id) => id !== 'mitte' && !!TALENTE[id] && !P.talente.includes(id) && !talentSperre(id);
function talentLernen(id) {
  const t = TALENTE[id];
  P.talente.push(id);
  // 💎 die erste Fassung bringt gleich ein Juwel mit (und setzt es ein)
  let extra = '';
  if (t.typ === 'juwel' && !(P.juwelen || []).length) {
    const J = juwelGeben();
    if (J) { (P.juwelIn ||= {})[id] = JUWELEN.indexOf(J); extra = ` · 💎 Dein erstes Juwel: ${J.ico} ${J.name}!`; }
  }
  speichern();
  talentRender();
  toast(`✨ ${t.ico} ${t.name} gelernt!${extra}`);   // am Handy liegt die Info oft außer Sicht – kurze Bestätigung
}

// --- ⚜️ Spezialisierung ---
function pruefungListe() {
  const L = heldLevel().level;
  if (!burgPruefungen().length) return '<p class="hinweis">⚜️ Prüfungen gibt es ab der Burg 8 – wenn du Verzweigungen (if) kannst.</p>';
  return `<div class="pliste">${burgPruefungen().map((p) => {
    const st = P.pruefungen[p.id] ? '✅ bestanden' : p.bald ? `📘 kommt mit dem Kapitel „${p.bald}“` : L >= p.level ? '🔓 jetzt im ⚜️ Prüfungsturm (Karte)' : `🔒 ab Level ${p.level}`;
    return `<div class="zeile"><span>⚜️ ${esc(p.titel)}</span><span class="hinweis">${st}</span></div>`;
  }).join('')}</div>`;
}

function spezRender() {
  const sp = spezPunkte();
  const kopf = `<div class="tkopf"><h2>⚜️ Spezialisierung</h2><span>Prüfungen: ${Object.keys(P.pruefungen).length}/${burgPruefungen().length} · <b>${sp} Punkt${sp === 1 ? '' : 'e'} frei</b></span></div>`;
  // Noch keine Prüfung bestanden
  if (!P.spez && !Object.keys(P.pruefungen).length) {
    $('#talentBaum').innerHTML = `${kopf}<p>In den ⚜️ Prüfungen beweist du, wie gut du programmierst. Jede bestandene Prüfung bringt einen Spezialisierungspunkt.
      Nach der ersten wählst du deinen Weg: ${Object.values(SPEZ).map((s) => `${s.ico} ${s.name}`).join(', ')}.</p>`;
    $('#talentInfo').innerHTML = pruefungListe();
    return;
  }
  // Prüfung bestanden, aber noch kein Weg gewählt
  if (!P.spez) {
    $('#talentBaum').innerHTML = `${kopf}<p>Wähle deinen Weg. Er gilt, bis du alles zurücksetzt.</p><div class="spezwahl">${Object.entries(SPEZ).map(([id, s]) => `
      <button data-spez="${id}" class="${SPEZ_WARTE === id ? 'sel' : ''}" style="--farbe:${s.farbe}"><span class="sico">${s.ico}</span><b>${s.name}</b>
        <span class="hinweis">${s.text}</span><span class="sknoten">${Object.values(s.knoten).map((k) => `${k.ico} ${k.name}`).join(' · ')}</span>
        ${SPEZ_WARTE === id ? '<span class="p">Nochmal tippen zum Wählen!</span>' : ''}</button>`).join('')}</div>`;
    $('#talentInfo').innerHTML = '';
    for (const b of document.querySelectorAll('[data-spez]')) b.onclick = () => {
      if (SPEZ_WARTE !== b.dataset.spez) { SPEZ_WARTE = b.dataset.spez; spezRender(); return; }
      P.spez = b.dataset.spez; SPEZ_WARTE = null; SSEL = 'k'; speichern(); talentRender();
    };
    return;
  }
  // Kleiner Baum der gewählten Spezialisierung
  const s = SPEZ[P.spez], U = 60, an = (k) => P.spezTal.includes(`${P.spez}_${k}`);
  const kanten = SPEZ_KANTEN.map(([a, b]) => `<line x1="${SPEZ_POS[a][0] * U}" y1="${SPEZ_POS[a][1] * U}" x2="${SPEZ_POS[b][0] * U}" y2="${SPEZ_POS[b][1] * U}" class="tk ${an(a) && an(b) ? 'an' : ''}"/>`).join('');
  const knoten = Object.entries(s.knoten).map(([k, n]) => {
    const [x, y] = SPEZ_POS[k], geht = !an(k) && !spezSperre(k);
    return `<g class="tn spez ${an(k) ? 'an' : ''} ${geht ? 'geht' : ''} ${SSEL === k ? 'sel' : ''}" data-k="${k}" transform="translate(${x * U},${y * U})" style="--farbe:${s.farbe}">
      <circle r="${(k === 'k' ? 0.55 : 0.48) * U}"/><text style="font-size:${0.48 * U}px">${n.ico}</text></g>`;
  }).join('');
  $('#talentBaum').innerHTML = `${kopf}<svg viewBox="${-2.6 * U} ${-2 * U} ${5.2 * U} ${4.2 * U}" class="talentsvg spezsvg">
    <circle r="${2.3 * U}" cx="0" cy="${0.1 * U}" fill="none" stroke="${s.farbe}" stroke-opacity=".25" stroke-width="3"/>
    <text y="${-1.75 * U}" style="font-size:${0.32 * U}px;fill:${s.farbe};font-family:'Lilita One'">${s.ico} ${s.name}</text>${kanten}${knoten}</svg>`;
  for (const g of document.querySelectorAll('#talentBaum [data-k]')) g.onclick = () => { SSEL = g.dataset.k; spezRender(); };
  const n = s.knoten[SSEL], sperre = spezSperre(SSEL);
  $('#talentInfo').innerHTML = `<div class="tart">${s.ico} ${s.name}</div><h3>${n.ico} ${esc(n.name)}</h3><p>${esc(n.text)}</p>
    ${an(SSEL) ? '<p class="hinweis">✅ Gelernt</p>' : sperre ? `<p class="hinweis">${esc(sperre)}</p>` : '<button class="btn gold" id="spezLernBtn">Lernen (1 Spezialisierungspunkt)</button>'}
    <details><summary>⚜️ Prüfungen</summary>${pruefungListe()}</details>`;
  const b = $('#spezLernBtn');
  if (b) b.onclick = () => { P.spezTal.push(`${P.spez}_${SSEL}`); speichern(); talentRender(); };
}
