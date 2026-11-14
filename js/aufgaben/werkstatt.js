'use strict';
// --- 🔧 Werkstatt: LK Objektorientierung (Burg 23, Lehrplan LB 4/5, OPAL-Kurs LK_INF_LB4_5 „OOP und Softwareentwicklung“) ---
// Code-Stil wie im Kurs: __init__, self, private Attribute mit __, get_/set_, super().__init__, Typangaben erlaubt.
// Kapitel: Klassen und Objekte → Kapselung → Beziehungen (Assoziation, Aggregation, Komposition, Multiplizität) →
// Vererbung und Polymorphie (mit ⚔️ Arena: eigene Turmklassen gegen Monster) → Datenstrukturen als Klassen (Stack, Queue, verkettete Liste).
// Läuft auf dem Kornspeicher-Ablauf (kornspeicher.js) mit warte + werk: Prüfung über Testfunktionen im vorspann,
// die Objekte der Schüler-Klassen erzeugen und Werte zurückgeben (zielArt 'wert').

KAPITEL[50] = { name: 'Klassen und Objekte', ico: '🧱' };
KAPITEL[51] = { name: 'Kapselung', ico: '🔒' };
KAPITEL[52] = { name: 'Beziehungen zwischen Klassen', ico: '🔗' };
KAPITEL[53] = { name: 'Vererbung und Polymorphie', ico: '🧬' };
KAPITEL[54] = { name: 'Datenstrukturen als Klassen', ico: '📚' };
KAPITEL[55] = { name: 'Vom Programm zum Projekt', ico: '🧭' };
BURGEN[23] = { name: 'LK OOP', ico: '🔧', klasse: 'LK', region: 'werkstatt', kapitel: [50, 51, 52, 53, 54, 55],
  text: 'Leistungskurs: Klassen und Objekte, Kapselung mit get/set, Assoziation, Aggregation, Komposition, Vererbung und Polymorphie, Stack, Queue und verkettete Liste als Klassen, vom Programm zum Projekt (Vorgehensmodelle, Projektauftrag, Git im Team).' };
// 📓 Heft (Fallback, falls heft.js für Kapitel 55 noch kein HEFT_MERKE hat)
HEFT_EXTRA[55] = { titel: '🧭 Vom Programm zum Projekt', text: ['Vorgehensmodelle: Wasserfall (Phasen nacheinander, Test am Ende), V-Modell (jede Entwurfsstufe hat ihre Teststufe), Scrum (Sprints, jeder liefert ein nutzbares, getestetes Inkrement).', 'Projektauftrag: Ziel, Muss- und Kann-Anforderungen; User Story „Als … möchte ich …, um …“ mit prüfbaren Akzeptanzkriterien; Code nach MVC getrennt.', 'Git im Team: Issue → Branch → Commits → Pull Request → Review → Merge nach main. Auf main liegt nur geprüfter Code.'] };

const S_OOP = [...S_LK, 'klasse'];
const WERK = (a) => KORN({ warte: true, werk: true, zielArt: 'wert', funktion: null, sprache: S_OOP, ...a });
const WFRAGEN = (a) => WERK({ sortArt: 'fragen', listen: [], ...a });
// Tests: vorspann definiert _t1(), _t2() … (Objekte der Schüler-Klassen erzeugen, Werte zurückgeben)
const tests = (soll) => ({ listen: soll.map(() => []), aufrufFn: (l, k) => `_t${k + 1}()`, soll: (l, k) => soll[k] });

// UML-Klasse (Kurs: Name, Attribute, Methoden; − privat, + öffentlich)
const uml = (name, attr = [], meth = [], ober = '') => `<div class="umlklasse"><div class="umlname">${ober ? `<span class="hinweis">${ober} ◁──</span> ` : ''}${name}</div>
  <div class="umlteil">${attr.map((a) => `<div>${a}</div>`).join('') || '&nbsp;'}</div><div class="umlteil">${meth.map((m) => `<div>${m}</div>`).join('') || '&nbsp;'}</div></div>`;
const objKarte = (name, klasse, attr) => `<div class="objkarte"><div class="objname">${name} : ${klasse}</div>${Object.entries(attr).map(([k, v]) => `<div>${k} = ${v}</div>`).join('')}</div>`;
const werkBild = (html) => () => ({ html: `<div class="werkbild">${html}</div>` });
// 🔒 Der letzte Test prüft [hasattr(obj, "attr"), hasattr(obj, "_Klasse__attr")] – eigene Meldung, wenn das Attribut öffentlich ist
const privatTests = (soll, attr) => ({ ...tests([...soll, [false, true]]),
  pruefWert: (w, k) => (k < soll.length ? (gleichWert(w, soll[k]) ? null : `Ergebnis ${ergebnisText(w)} – richtig wäre ${ergebnisText(soll[k])}.`)
    : gleichWert(w, [false, true]) ? null : `${attr} muss privat sein: Im Diagramm steht „− __${attr}“. Schreib self.__${attr} statt self.${attr} – dann kommt von außen niemand ohne Methode heran.`) });

// Vorgegebene Klassen für spätere Kapitel
const V_TURM_MONSTER = `class Monster:
    def __init__(self, name, leben, tempo=2, gross=False):
        self.name = name
        self.leben = leben
        self.tempo = tempo
        self.gross = gross

class Turm:
    def __init__(self, name, schaden):
        self.name = name
        self.schaden = schaden

    def schiesse(self, monster):
        monster.leben = monster.leben - self.schaden
`;
const V_ARENA = `class Monster:
    def __init__(self, name, leben, gross):
        self.name = name
        self.leben = leben
        self.gross = gross

class Turm:
    def __init__(self, name, schaden):
        self.name = name
        self.schaden = schaden

    def ziel(self, monster_liste):
        for m in monster_liste:
            if m.leben > 0:
                return m
        return None

    def schiesse(self, monster_liste):
        m = self.ziel(monster_liste)
        if m is not None:
            m.leben = m.leben - self.schaden

def arena(tuerme, runden=6):
    monster = [Monster("Ratte", 6, False), Monster("Troll", 30, True), Monster("Ratte", 6, False), Monster("Ork", 18, True)]
    verlauf = [[m.leben for m in monster]]
    for r in range(runden):
        for t in tuerme:
            t.schiesse(monster)
        verlauf.append([max(0, m.leben) for m in monster])
    besiegt = True
    for m in monster:
        if m.leben > 0:
            besiegt = False
    return {"verlauf": verlauf, "besiegt": besiegt, "tuerme": [t.__class__.__name__ for t in tuerme]}

def _t1():
    m1 = Monster("Ratte", 6, False)
    m2 = Monster("Troll", 30, True)
    Blitzturm("Blitz", 2).schiesse([m1, m2])
    return [m1.leben, m2.leben]

def _t2():
    m1 = Monster("Ratte", 6, False)
    m2 = Monster("Troll", 30, True)
    k = Kanone("Kanone", 4)
    k.schiesse([m1, m2])
    m1.leben = 0
    k.schiesse([m1, m2])
    return [m1.leben, m2.leben, isinstance(k, Turm)]

def _t3():
    return arena([Turm("Pfeil", 3), Blitzturm("Blitz", 2), Kanone("Kanone", 4)])
`;

// 📝 oc4: Auftragstext, aus dem das Klassendiagramm entsteht (Transfer: neue Welt statt Burg/Turm)
const WK_BIBLIO = 'In der Burgbibliothek leiht man Bücher aus. Jedes Buch hat einen Titel und eine Signatur. Ein Leser hat einen Namen und darf höchstens drei Bücher gleichzeitig ausleihen. Ein Buch ist immer bei höchstens einem Leser. Die Bibliothek verwaltet beliebig viele Bücher. Schließt die Bibliothek, werden ihre Bücher an eine andere Bibliothek übergeben.';
// 🧭 Kapitel 55: Projektauftrag (nach OPAL LB 4/5, 5.5 Projektauftrag und Themen – Thema Fahrgemeinschaften, gekürzt)
const WK_AUFTRAG = `<div class="werkbild"><p><b>Projektauftrag: Fahrgemeinschaften zum Auswärtsspiel</b></p>
<p><b>Ziel:</b> ein lauffähiges Konsolenprogramm in Python, in Klassen modelliert und nach MVC aufgeteilt, mit Tests, im gemeinsamen Repository entstanden. Gruppe: 3 Personen, Dauer: drei Wochen in Sprints.</p>
<p><b>Auftrag:</b> Das Programm muss Fahrten mit Ziel, Datum und Zahl der Plätze anlegen und Anmeldungen bis zur Platzgrenze annehmen. Die Spritkosten einer Fahrt werden gerecht auf alle Mitfahrenden geteilt. Wenn danach noch Zeit bleibt, kann es Fahrten in einer Textdatei speichern und eine Warteliste führen. Ein- und Ausgabe nur über die Konsole.</p>
<p><b>Funktionen, die im Team vorgeschlagen wurden:</b></p>
<ol><li>Fahrt anlegen</li><li>Anmelden bis zur Platzgrenze</li><li>Kosten gerecht teilen</li><li>Fahrten in einer Datei speichern</li><li>Warteliste für volle Fahrten</li><li>Grafische Oberfläche mit Fenstern</li></ol></div>`;
const WK_VMODELL = `<div class="werkbild"><pre class="dscode mono">A Anforderungsanalyse ─────────────── ? Abnahmetest
 B Systementwurf ─────────────── ? Systemtest
  C Architekturentwurf ────── ? Integrationstest
   D Modulentwurf ─────── ? Modultest
           Implementierung</pre><p class="hinweis">Links die Entwurfsstufen (von oben nach unten), rechts die Teststufen (von unten nach oben).</p></div>`;

HOEFE.push(
  // --- Kapitel 50: 🧱 Klassen und Objekte (Kurs 4.2–4.5) ---
  WFRAGEN({ id: 'oa1', kapitel: 50, ico: '🧱', titel: 'Bauplan und Ding', lohn: 60, ansicht: 'tabelle', titelAnsicht: 'Klasse und Objekte',
    tabelle: werkBild(`${uml('Monster', ['name: str', 'leben: int'], ['treffer(schaden)', 'ist_besiegt(): bool'])}
      <div class="objreihe">${objKarte('ratte1', 'Monster', { name: '"Flitz"', leben: 4 })}${objKarte('troll', 'Monster', { name: '"Felsfuß"', leben: 80 })}</div>`),
    ziel: 'Klasse, Objekt, Attribut, Methode – was ist was?',
    story: 'Willkommen in der Werkstatt! Hier baust du nicht einzelne Türme, sondern Baupläne. Aus einem Bauplan (Klasse) entstehen beliebig viele Dinge (Objekte) – jedes mit seinen eigenen Werten.',
    merke: { titel: '🧱 Klassen und Objekte', text: 'Eine Klasse ist ein Bauplan: Sie legt Attribute (Eigenschaften) und Methoden (Fähigkeiten) fest. Ein Objekt ist ein konkretes Exemplar mit eigenen Attributwerten. Der Konstruktor __init__ erzeugt das Objekt; self ist das Objekt selbst.', code: 'class Monster:\n    def __init__(self, name, leben):\n        self.name = name\n        self.leben = leben\n\nork = Monster("Grummel", 26)' },
    fragen: [W('Monster (oben im Kasten) ist …', ['eine Klasse', 'ein Objekt', 'ein Attribut', 'eine Methode'], 0),
      W('ratte1 ist …', ['eine Klasse', 'ein Objekt – ein Exemplar der Klasse Monster', 'eine Methode', 'ein Datentyp'], 1),
      W('leben ist …', ['ein Attribut', 'eine Methode', 'eine Klasse', 'ein Konstruktor'], 0),
      W('treffer(schaden) ist …', ['ein Attribut', 'eine Methode', 'ein Objekt', 'eine Variable außerhalb'], 1),
      W('Wozu dient __init__?', ['es löscht ein Objekt', 'der Konstruktor – er setzt beim Erzeugen die Startwerte der Attribute', 'es druckt das Objekt', 'es vergleicht zwei Objekte'], 1),
      W('Was ist self in einer Methode?', ['die Klasse', 'das Objekt selbst – für das die Methode gerade aufgerufen wird', 'eine globale Variable', 'der Rückgabewert'], 1)],
    tipps: ['Eine Klasse beschreibt, ein Objekt ist.'] }),
  WERK({ id: 'oa2', kapitel: 50, sortArt: 'funktion', ico: '🏗️', titel: 'Die erste Klasse', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Bauplan',
    tabelle: werkBild(uml('Turm', ['name: str', 'schaden: int', 'reichweite: int'], ['__init__(name, schaden, reichweite)', 'beschreibung(): str'])),
    ziel: 'Schreib die Klasse Turm nach dem UML-Kasten. beschreibung() gibt z. B. "Blitz: 4 Schaden, Reichweite 5" zurück.',
    vorspann: 'def _t1():\n    t = Turm("Pfeil", 3, 4)\n    return [t.name, t.schaden, t.reichweite]\n\ndef _t2():\n    a = Turm("Kanone", 5, 3)\n    b = Turm("Eis", 1, 4)\n    return [a.schaden, b.schaden]\n\ndef _t3():\n    return Turm("Blitz", 4, 5).beschreibung()\n',
    ...tests([['Pfeil', 3, 4], [5, 1], 'Blitz: 4 Schaden, Reichweite 5']), testName: (k) => ['Attribute', 'Zwei Objekte', 'beschreibung()'][k],
    befehle: [K_B('class Turm:'), K_B('def __init__(self, name, schaden, reichweite):'), K_B('self.name = name'), K_B('def beschreibung(self):'), K_B('return f"{self.name}: …"')],
    tipps: ['Jedes Attribut wird im Konstruktor mit self.… = … gesetzt.', 'Methoden haben immer self als ersten Parameter.', 'return f"{self.name}: {self.schaden} Schaden, Reichweite {self.reichweite}"'],
    loesung: 'class Turm:\n    def __init__(self, name, schaden, reichweite):\n        self.name = name\n        self.schaden = schaden\n        self.reichweite = reichweite\n\n    def beschreibung(self):\n        return f"{self.name}: {self.schaden} Schaden, Reichweite {self.reichweite}"' }),
  WERK({ id: 'oa3', kapitel: 50, sortArt: 'funktion', ico: '👾', titel: 'Monster mit Methoden', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Bauplan',
    tabelle: werkBild(uml('Monster', ['name: str', 'leben: int'], ['__init__(name, leben)', 'treffer(schaden)', 'ist_besiegt(): bool'])),
    ziel: 'treffer(schaden) zieht Leben ab – aber nie unter 0. ist_besiegt() gibt True zurück, wenn kein Leben mehr übrig ist.',
    vorspann: 'def _t1():\n    m = Monster("Ork", 10)\n    m.treffer(4)\n    return m.leben\n\ndef _t2():\n    m = Monster("Ratte", 3)\n    m.treffer(5)\n    return [m.leben, m.ist_besiegt()]\n\ndef _t3():\n    m = Monster("Troll", 20)\n    m.treffer(5)\n    m.treffer(5)\n    return [m.leben, m.ist_besiegt()]\n',
    ...tests([6, [0, true], [10, false]]), testName: (k) => ['Ork, 4 Schaden', 'Ratte, 5 Schaden', 'Troll, zweimal 5'][k],
    befehle: [K_B('class Monster:'), K_B('def treffer(self, schaden):'), K_B('def ist_besiegt(self):')],
    tipps: ['self.leben = self.leben - schaden', 'Danach: Ist self.leben kleiner als 0, setz es auf 0.', 'ist_besiegt: return self.leben == 0'],
    loesung: 'class Monster:\n    def __init__(self, name, leben):\n        self.name = name\n        self.leben = leben\n\n    def treffer(self, schaden):\n        self.leben = self.leben - schaden\n        if self.leben < 0:\n            self.leben = 0\n\n    def ist_besiegt(self):\n        return self.leben == 0' }),
  WERK({ id: 'oa3v', kapitel: 50, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🔮', titel: 'Zwei Namen, ein Monster', lohn: 65,
    ziel: 'Lies den Code und sag voraus, welche Lebenspunkte am Ende herauskommen.',
    listen: [[]], code: 'class Monster:\n    def __init__(self, name, leben):\n        self.name = name\n        self.leben = leben\n\n    def treffer(self, schaden):\n        self.leben = self.leben - schaden\n\ndef versuch():\n    a = Monster("Ork", 10)\n    b = Monster("Ork", 10)\n    c = a\n    c.treffer(4)\n    b.treffer(1)\n    return [a.leben, b.leben, c.leben]',
    fragen: [{ art: 'zahl', text: 'Welchen Wert hat a.leben am Ende?', soll: (l) => l.wert[0] },
      { art: 'zahl', text: 'Welchen Wert hat b.leben?', soll: (l) => l.wert[1] },
      W('Wie viele Monster-Objekte gibt es?', ['1', '2', '3'], 1),
      W('Warum hat a Leben verloren, obwohl nur c getroffen wurde?', ['wegen eines Fehlers in Python', 'c = a macht keine Kopie – a und c verweisen auf dasselbe Objekt', 'weil beide „Ork“ heißen', 'weil b getroffen wurde'], 1)],
    tipps: ['c = a erzeugt kein neues Objekt.', 'Nur Monster(...) erzeugt ein neues Objekt.'] }),

  // --- Kapitel 51: 🔒 Kapselung (Kurs 4.6, 4.7) ---
  WERK({ id: 'ob1', kapitel: 51, sortArt: 'funktion', ico: '💰', titel: 'Die Schatzkammer', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Bauplan',
    tabelle: werkBild(uml('Schatzkammer', ['− __gold: int'], ['+ __init__(gold)', '+ get_gold(): int', '+ einzahlen(betrag)', '+ auszahlen(betrag): bool'])),
    ziel: 'Das Gold ist privat (__gold). einzahlen nimmt nur positive Beträge an; auszahlen gibt True zurück und zahlt aus, wenn genug da ist – sonst False und nichts passiert.',
    story: 'Im Spiel stand das Gold bisher einfach in einer Variable – jeder hätte es auf eine Million setzen können. Meisterin Ada baut eine Schatzkammer, an die man nur über ihre Methoden herankommt.',
    vorspann: 'def _t1():\n    k = Schatzkammer(100)\n    k.einzahlen(50)\n    k.einzahlen(-20)\n    return k.get_gold()\n\ndef _t2():\n    k = Schatzkammer(100)\n    a = k.auszahlen(30)\n    b = k.auszahlen(500)\n    c = k.auszahlen(-5)\n    return [a, b, c, k.get_gold()]\n\ndef _t3():\n    k = Schatzkammer(5)\n    return [hasattr(k, "gold"), hasattr(k, "_Schatzkammer__gold")]\n',
    ...privatTests([150, [true, false, false, 70]], 'gold'), testName: (k) => ['einzahlen', 'auszahlen', '__gold ist privat'][k],
    befehle: [K_B('class Schatzkammer:'), K_B('self.__gold = gold'), K_B('def get_gold(self):'), K_B('def auszahlen(self, betrag):')],
    merke: { titel: '🔒 Kapselung', text: 'Kapselung schützt die Daten eines Objekts: Attribute sind privat (in Python mit __ am Anfang, im UML mit −), von außen kommt man nur über Methoden heran (Getter get_…, Setter set_…). Die Methoden können prüfen, ob ein neuer Wert gültig ist.', code: 'self.__gold = gold\n\ndef get_gold(self):\n    return self.__gold' },
    tipps: ['Im Konstruktor: self.__gold = gold', 'einzahlen: nur wenn betrag > 0.', 'auszahlen: wenn 0 < betrag <= self.__gold, abziehen und True zurückgeben, sonst False.'],
    loesung: 'class Schatzkammer:\n    def __init__(self, gold):\n        self.__gold = gold\n\n    def get_gold(self):\n        return self.__gold\n\n    def einzahlen(self, betrag):\n        if betrag > 0:\n            self.__gold = self.__gold + betrag\n\n    def auszahlen(self, betrag):\n        if 0 < betrag <= self.__gold:\n            self.__gold = self.__gold - betrag\n            return True\n        return False' }),
  WERK({ id: 'ob2', kapitel: 51, sortArt: 'funktion', ico: '⬆️', titel: 'Der Wächter der Ausbaustufe', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Bauplan',
    tabelle: werkBild(uml('Turm', ['− __name: str', '− __stufe: int'], ['+ __init__(name)', '+ get_stufe(): int', '+ set_stufe(stufe: int): bool', '+ ausbauen(): bool'])),
    ziel: 'Ein Turm startet auf Stufe 1. set_stufe nimmt nur 1 bis 6 an (sonst False, nichts ändert sich). ausbauen() erhöht um 1 – aber nie über 6.',
    vorspann: 'def _t1():\n    t = Turm("Pfeil")\n    return [t.get_stufe(), t.set_stufe(4), t.get_stufe()]\n\ndef _t2():\n    t = Turm("Pfeil")\n    return [t.set_stufe(9), t.set_stufe(0), t.get_stufe()]\n\ndef _t3():\n    t = Turm("Pfeil")\n    t.set_stufe(5)\n    return [t.ausbauen(), t.ausbauen(), t.get_stufe()]\n\ndef _t4():\n    t = Turm("Pfeil")\n    return [hasattr(t, "stufe"), hasattr(t, "_Turm__stufe")]\n',
    ...privatTests([[1, true, 4], [false, false, 1], [true, false, 6]], 'stufe'), testName: (k) => ['Stufe setzen', 'ungültige Stufen', 'ausbauen bis 6', '__stufe ist privat'][k],
    befehle: [K_B('def set_stufe(self, stufe: int) -> bool:'), K_B('def ausbauen(self) -> bool:')],
    tipps: ['Der Setter prüft, bevor er speichert.', 'ausbauen kann den Setter benutzen: return self.set_stufe(self.__stufe + 1)'],
    loesung: 'class Turm:\n    def __init__(self, name):\n        self.__name = name\n        self.__stufe = 1\n\n    def get_stufe(self) -> int:\n        return self.__stufe\n\n    def set_stufe(self, stufe: int) -> bool:\n        if 1 <= stufe <= 6:\n            self.__stufe = stufe\n            return True\n        return False\n\n    def ausbauen(self) -> bool:\n        return self.set_stufe(self.__stufe + 1)' }),
  WFRAGEN({ id: 'ob3', kapitel: 51, ico: '📐', titel: 'UML lesen', lohn: 65, ansicht: 'tabelle', titelAnsicht: 'Klassendiagramm',
    tabelle: werkBild(uml('Held', ['− __name: str', '− __level: int', '+ zauber: list[str]'], ['+ __init__(name: str)', '+ get_level(): int', '+ lerne(zauber: str)', '− __xp_berechnen(): int'])),
    ziel: 'Was verrät dieses Klassendiagramm über die Klasse Held?',
    fragen: [W('Was bedeutet das − vor __level?', ['das Attribut ist privat', 'das Attribut ist negativ', 'das Attribut ist eine Methode', 'das Attribut ist unwichtig'], 0),
      W('Von außen darf man …', ['held.__level = 99 schreiben', 'held.get_level() aufrufen', 'held.__xp_berechnen() aufrufen', 'gar nichts'], 1),
      W('Was bedeutet „get_level(): int“?', ['die Methode bekommt eine Zahl', 'die Methode gibt eine ganze Zahl zurück', 'level ist eine Klasse', 'das ist ein Fehler'], 1),
      W('In Python steht die Typangabe so: def get_level(self) -> int:. Was prüft Python dabei selbst?', ['nichts – Typangaben sind Hinweise für Menschen und Werkzeuge', 'ob wirklich ein int zurückkommt', 'ob self ein Held ist', 'ob der Code schnell ist'], 0),
      W('Warum ist __xp_berechnen privat?', ['es ist eine Hilfsmethode der Klasse – von außen soll sie niemand aufrufen', 'private Methoden sind schneller', 'weil es mit x beginnt', 'es ist ein Konstruktor'], 0)],
    tipps: ['− privat, + öffentlich.'] }),

  // --- Kapitel 52: 🔗 Beziehungen (Kurs 4.8, 4.9) ---
  WERK({ id: 'oc1', kapitel: 52, sortArt: 'funktion', ico: '🏰', titel: 'Die Burg hat Türme', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Klassendiagramm',
    tabelle: werkBild(`<div class="umlrel">${uml('Burg', ['name: str', 'tuerme: list[Turm]'], ['bauen(turm: Turm)', 'gesamtschaden(): int', 'anzahl(): int'])}<div class="umlpfeil">◇──────<br><span class="hinweis">1 &nbsp;&nbsp;&nbsp;&nbsp; 0..*</span></div>${uml('Turm', ['name: str', 'schaden: int'], [])}</div>`),
    ziel: 'Eine Burg hat beliebig viele Türme (Aggregation, 0..*). Schreib Burg mit bauen(turm), anzahl() und gesamtschaden() (Summe aller Turm-Schäden). Turm gibt es schon.',
    vorspann: 'class Turm:\n    def __init__(self, name, schaden):\n        self.name = name\n        self.schaden = schaden\n\ndef _t1():\n    b = Burg("Burg 7")\n    return [b.anzahl(), b.gesamtschaden()]\n\ndef _t2():\n    b = Burg("Burg 7")\n    b.bauen(Turm("Pfeil", 3))\n    b.bauen(Turm("Kanone", 5))\n    return [b.anzahl(), b.gesamtschaden()]\n\ndef _t3():\n    a = Burg("A")\n    b = Burg("B")\n    t = Turm("Eis", 2)\n    a.bauen(t)\n    b.bauen(t)\n    t.schaden = 10\n    return [a.gesamtschaden(), b.gesamtschaden()]\n',
    ...tests([[0, 0], [2, 8], [10, 10]]), testName: (k) => ['leere Burg', 'zwei Türme', 'ein Turm in zwei Burgen'][k],
    befehle: [K_B('class Burg:'), K_B('def bauen(self, turm):'), K_B('def gesamtschaden(self):')],
    merke: { titel: '🔗 Beziehungen', text: 'Assoziation: Objekte kennen sich (Attribut, das auf ein anderes Objekt verweist). Aggregation (◇): ein Ganzes hat Teile, die auch ohne es existieren – z. B. eine Burg und ihre Türme. Komposition (◆): Die Teile entstehen und vergehen mit dem Ganzen. Multiplizitäten wie 1, 0..1, 0..* sagen, wie viele Objekte beteiligt sind.', code: 'self.tuerme = []          # 0..* Türme\n\ndef bauen(self, turm):\n    self.tuerme.append(turm)' },
    tipps: ['Im Konstruktor eine leere Liste: self.tuerme = []', 'bauen hängt den Turm an die Liste an.', 'gesamtschaden: Schleife über self.tuerme, Schaden aufsummieren.'],
    loesung: 'class Burg:\n    def __init__(self, name):\n        self.name = name\n        self.tuerme = []\n\n    def bauen(self, turm):\n        self.tuerme.append(turm)\n\n    def anzahl(self):\n        return len(self.tuerme)\n\n    def gesamtschaden(self):\n        summe = 0\n        for t in self.tuerme:\n            summe = summe + t.schaden\n        return summe' }),
  WERK({ id: 'oc2', kapitel: 52, sortArt: 'funktion', ico: '💣', titel: 'Der Turm baut seine Kanone', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Klassendiagramm',
    tabelle: werkBild(`<div class="umlrel">${uml('Turm', ['name: str', 'kanone: Kanone'], ['__init__(name, kaliber)', 'schaden(): int'])}<div class="umlpfeil">◆──────<br><span class="hinweis">1 &nbsp;&nbsp;&nbsp;&nbsp; 1</span></div>${uml('Kanone', ['kaliber: int'], ['schaden(): int'])}</div>`),
    ziel: 'Komposition: Der Turm erzeugt seine Kanone selbst im Konstruktor (self.kanone = Kanone(kaliber)). schaden() des Turms gibt den Schaden seiner Kanone zurück. Kanone gibt es schon.',
    vorspann: 'class Kanone:\n    def __init__(self, kaliber):\n        self.kaliber = kaliber\n\n    def schaden(self):\n        return self.kaliber * 2\n\ndef _t1():\n    t = Turm("Bergfried", 3)\n    return [t.schaden(), t.kanone.kaliber, isinstance(t.kanone, Kanone)]\n\ndef _t2():\n    a = Turm("A", 1)\n    b = Turm("B", 1)\n    return [a.kanone is b.kanone, a.schaden() + b.schaden()]\n',
    ...tests([[6, 3, true], [false, 4]]), testName: (k) => ['Turm mit Kanone', 'jeder Turm hat seine eigene'][k],
    befehle: [K_B('class Turm:'), K_B('def __init__(self, name, kaliber):'), K_B('def schaden(self):')],
    tipps: ['Die Kanone wird im Konstruktor des Turms erzeugt – nicht von außen übergeben.', 'Der Turm gibt die Arbeit an sein Teil weiter: return self.kanone.schaden()'],
    loesung: 'class Turm:\n    def __init__(self, name, kaliber):\n        self.name = name\n        self.kanone = Kanone(kaliber)\n\n    def schaden(self):\n        return self.kanone.schaden()' }),
  WFRAGEN({ id: 'oc3', kapitel: 52, ico: '🔗', titel: 'Raute leer oder voll?', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Klassendiagramm',
    tabelle: werkBild(`<div class="umlrel">${uml('Burg')}<div class="umlpfeil">◇────<br><span class="hinweis">1 &nbsp;&nbsp; 0..*</span></div>${uml('Turm')}<div class="umlpfeil">◆────<br><span class="hinweis">1 &nbsp;&nbsp; 1</span></div>${uml('Kanone')}</div>
      <div class="umlrel">${uml('Held')}<div class="umlpfeil">─────<br><span class="hinweis">1 &nbsp;&nbsp; 0..4</span></div>${uml('Zauber')}</div>`),
    ziel: 'Lies die Beziehungen im Klassendiagramm.',
    fragen: [W('Was bedeutet 0..* zwischen Burg und Turm?', ['eine Burg hat genau einen Turm', 'eine Burg hat beliebig viele Türme, auch keinen', 'ein Turm gehört zu beliebig vielen Burgen', 'höchstens 0 Türme'], 1),
      W('Burg ◇ Turm ist eine Aggregation. Was heißt das?', ['Türme können auch ohne die Burg existieren – man kann sie z. B. versetzen', 'Türme verschwinden zusammen mit der Burg', 'Burg erbt von Turm', 'Turm ist eine Methode der Burg'], 0),
      W('Turm ◆ Kanone ist eine Komposition. Was passiert mit der Kanone, wenn der Turm abgerissen wird?', ['sie bleibt in der Burg', 'sie verschwindet mit dem Turm', 'sie wird zur Burg', 'nichts'], 1),
      W('Wie viele Zauber kann ein Held haben?', ['genau 4', '0 bis 4', 'beliebig viele', 'mindestens 4'], 1),
      W('Wie setzt man „Held kennt 0..4 Zauber“ in Python um?', ['class Held(Zauber):', 'ein Attribut self.zauber = [] – mit höchstens 4 Einträgen', 'def zauber(self):', 'gar nicht'], 1)],
    tipps: ['Leere Raute: Teile leben weiter. Volle Raute: Teile vergehen mit dem Ganzen.'] }),
  WFRAGEN({ id: 'oc4', kapitel: 52, ico: '📝', titel: 'Vom Text zum Diagramm', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Auftrag der Bibliothekarin',
    tabelle: werkBild(`<p class="kfszenario">${WK_BIBLIO}</p><p class="hinweis">Noch gibt es kein Klassendiagramm – das entwirfst du.</p>`),
    ziel: 'Lies den Auftrag und entwirf daraus das Klassendiagramm: Klassen, Attribute, Beziehungen, Multiplizitäten.',
    story: 'Die Burgbibliothek will ihre Ausleihe programmieren lassen. Bevor jemand Code schreibt, braucht Meisterin Ada ein Klassendiagramm – und dafür nur den Text der Bibliothekarin.',
    merke: { titel: '📝 Vom Text zum Klassendiagramm', text: 'Substantive im Auftragstext sind Kandidaten für Klassen, ihre Eigenschaften werden Attribute, Tätigkeiten werden Methoden. Sätze wie „hat“, „verwaltet“ oder „gehört zu“ zeigen Beziehungen, Zahlwörter wie „höchstens drei“ oder „beliebig viele“ die Multiplizitäten. Was nur einen einfachen Wert hat (Titel, Name), ist keine eigene Klasse, sondern ein Attribut.' },
    fragen: [
      { art: 'liste', menge: true, text: 'Welche drei Substantive werden zu Klassen? (Einzahl, mit Leerzeichen getrennt)', soll: () => ['Bibliothek', 'Buch', 'Leser'] },
      W('Titel und Signatur werden …', ['Attribute der Klasse Buch', 'zwei eigene Klassen', 'Methoden der Klasse Buch', 'Attribute der Klasse Leser'], 0),
      W('Welche Multiplizität steht an der Linie Leser — Buch am Ende bei Buch?', ['0..3', '1..3', '3', '0..*'], 0),
      W('Und welche am Ende bei Leser?', ['0..1', '1', '0..*', '1..*'], 0),
      { art: 'wahl', szenario: WK_BIBLIO, text: 'Welche Beziehung besteht zwischen Bibliothek und Buch?', optionen: ['Aggregation (◇)', 'Komposition (◆)', 'Vererbung', 'Assoziation ohne Ganzes'], richtig: 0, woerter: ['übergeben'] },
      W('Wie setzt du „höchstens drei Bücher“ in Python um?', ['eine Liste in Leser, ausleihen prüft ihre Länge', 'Leser erbt von Buch und zählt dabei mit', 'drei Attribute buch1, buch2, buch3 in Buch', 'eine globale Liste aller ausgeliehenen Bücher'], 0)],
    tipps: ['Klassen sind Dinge mit eigenen Eigenschaften und eigenem Verhalten – Titel oder Name sind nur Werte.', 'Lies die Multiplizität immer vom anderen Ende aus: Ein Leser hat 0 bis 3 Bücher – also steht 0..3 bei Buch.', 'Bleiben die Bücher bestehen, wenn die Bibliothek schließt? Dann ist es keine Komposition.'] }),
  // ✏️ Konstruktion (Didaktik-Nachprüfung: oc4 war nur Auswahl) – den eigenen Entwurf als Klassen schreiben
  WERK({ id: 'oc4k', kapitel: 52, sortArt: 'funktion', ico: '✏️', titel: 'Dein Entwurf wird Code', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Auftrag der Bibliothekarin',
    tabelle: werkBild(`<p class="kfszenario">${WK_BIBLIO}</p><p class="hinweis">Ein fertiges Diagramm gibt es nicht – du arbeitest mit deinem Entwurf aus dem letzten Auftrag.</p>`),
    ziel: 'Schreib die drei Klassen aus deinem Entwurf: Buch(titel, signatur) und Leser(name) mit ihren Attributen, Bibliothek() verwaltet ihre Bücher in einer Liste mit aufnehmen(buch), anzahl() und uebergeben(andere): Schließt sie, wandern alle ihre Bücher in die andere Bibliothek.',
    vorspann: 'def _t1():\n    b = Buch("Sternkunde", 7)\n    l = Leser("Ida")\n    return [b.titel, b.signatur, l.name]\n\ndef _t2():\n    a = Bibliothek()\n    x = Buch("Sternkunde", 7)\n    a.aufnehmen(x)\n    a.aufnehmen(Buch("Kräuter", 12))\n    return [a.anzahl(), Bibliothek().anzahl()]\n\ndef _t3():\n    a = Bibliothek()\n    b = Bibliothek()\n    x = Buch("Sternkunde", 7)\n    a.aufnehmen(x)\n    a.aufnehmen(Buch("Kräuter", 12))\n    b.aufnehmen(Buch("Karten", 3))\n    a.uebergeben(b)\n    return [a.anzahl(), b.anzahl(), x.titel]\n',
    ...tests([['Sternkunde', 7, 'Ida'], [2, 0], [0, 3, 'Sternkunde']]), testName: (k) => ['Buch und Leser', 'Bibliothek verwaltet Bücher', 'Bibliothek schließt (Aggregation)'][k],
    befehle: [K_B('class Buch:'), K_B('class Leser:'), K_B('class Bibliothek:'), K_B('def uebergeben(self, andere):')],
    tipps: ['Was nur ein Wert ist (Titel, Signatur, Name), wird ein Attribut im Konstruktor.', 'Jede Bibliothek bekommt im Konstruktor ihre eigene leere Liste – „verwaltet beliebig viele“ = 0..*.', 'uebergeben: Jedes eigene Buch bei der anderen Bibliothek aufnehmen, danach die eigene Liste leeren. Die Bücher selbst bleiben bestehen – das ist die Aggregation.'],
    loesung: 'class Buch:\n    def __init__(self, titel, signatur):\n        self.titel = titel\n        self.signatur = signatur\n\nclass Leser:\n    def __init__(self, name):\n        self.name = name\n\nclass Bibliothek:\n    def __init__(self):\n        self.buecher = []\n\n    def aufnehmen(self, buch):\n        self.buecher.append(buch)\n\n    def anzahl(self):\n        return len(self.buecher)\n\n    def uebergeben(self, andere):\n        for b in self.buecher:\n            andere.aufnehmen(b)\n        self.buecher = []' }),
  WERK({ id: 'oc5', kapitel: 52, sortArt: 'funktion', ico: '📚', titel: 'Die Ausleihe programmieren', lohn: 85, ansicht: 'tabelle', titelAnsicht: 'Klassendiagramm',
    tabelle: werkBild(`<div class="umlrel">${uml('Leser', ['+ name: str', '− __buecher: list[Buch]'], ['+ ausleihen(buch: Buch): bool', '+ zurueckgeben(buch: Buch): bool', '+ anzahl(): int'])}<div class="umlpfeil">──────<br><span class="hinweis">0..1 &nbsp;&nbsp;&nbsp; 0..3</span></div>${uml('Buch', ['+ titel: str', '+ signatur: int', '+ leser: Leser | None'], [])}</div>`),
    ziel: 'Setz das Diagramm um: Leser hat eine private Liste __buecher. ausleihen(buch) klappt nur, wenn der Leser weniger als 3 Bücher hat und das Buch bei niemandem ist (buch.leser ist None) – dann merken beide Seiten die Ausleihe, Rückgabe True; sonst False. zurueckgeben(buch) klappt nur, wenn das Buch bei genau diesem Leser ist. Buch gibt es schon.',
    vorspann: 'class Buch:\n    def __init__(self, titel, signatur):\n        self.titel = titel\n        self.signatur = signatur\n        self.leser = None\n\ndef _t1():\n    l = Leser("Ida")\n    r = []\n    for i in range(4):\n        r.append(l.ausleihen(Buch("Band", i)))\n    return [r, l.anzahl()]\n\ndef _t2():\n    a = Leser("Ida")\n    b = Leser("Bo")\n    x = Buch("Sternkunde", 7)\n    return [a.ausleihen(x), b.ausleihen(x), x.leser is a, b.anzahl()]\n\ndef _t3():\n    a = Leser("Ida")\n    b = Leser("Bo")\n    x = Buch("Sternkunde", 7)\n    a.ausleihen(x)\n    r1 = b.zurueckgeben(x)\n    r2 = a.zurueckgeben(x)\n    return [r1, r2, x.leser is None, b.ausleihen(x), a.anzahl()]\n\ndef _t4():\n    l = Leser("Ida")\n    return [hasattr(l, "buecher"), hasattr(l, "_Leser__buecher")]\n',
    ...privatTests([[[true, true, true, false], 3], [true, false, true, 0], [false, true, true, true, 0]], 'buecher'), testName: (k) => ['höchstens 3 Bücher', 'ein Buch, zwei Leser', 'zurückgeben', '__buecher ist privat'][k],
    befehle: [K_B('class Leser:'), K_B('def ausleihen(self, buch):'), K_B('def zurueckgeben(self, buch):')],
    tipps: ['Im Konstruktor: self.name = name und self.__buecher = []', 'ausleihen: Erst prüfen (len(self.__buecher) >= 3 oder buch.leser is not None → False), dann self.__buecher.append(buch) und buch.leser = self.', 'zurueckgeben: Nur wenn buch.leser is self – dann aus der Liste entfernen (remove) und buch.leser = None.'],
    loesung: 'class Leser:\n    def __init__(self, name):\n        self.name = name\n        self.__buecher = []\n\n    def anzahl(self):\n        return len(self.__buecher)\n\n    def ausleihen(self, buch):\n        if len(self.__buecher) >= 3 or buch.leser is not None:\n            return False\n        self.__buecher.append(buch)\n        buch.leser = self\n        return True\n\n    def zurueckgeben(self, buch):\n        if buch.leser is not self:\n            return False\n        self.__buecher.remove(buch)\n        buch.leser = None\n        return True' }),

  // --- Kapitel 53: 🧬 Vererbung und Polymorphie (Kurs 4.10, 4.11) ---
  WERK({ id: 'od1', kapitel: 53, sortArt: 'funktion', ico: '🧊', titel: 'Der Eisturm erbt', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Klassendiagramm',
    tabelle: werkBild(`<div class="umlrel">${uml('Turm', ['name: str', 'schaden: int'], ['schiesse(monster)'])}<div class="umlpfeil">◁──────</div>${uml('Eisturm', ['kaelte: int'], ['__init__(name, schaden, kaelte)', 'schiesse(monster)'], '')}</div>`),
    ziel: 'Eisturm erbt von Turm. Sein Konstruktor ruft super().__init__ auf und speichert zusätzlich kaelte. schiesse macht erst den normalen Schaden (super().schiesse) und teilt dann das Tempo des Monsters durch kaelte.',
    vorspann: V_TURM_MONSTER + '\ndef _t1():\n    e = Eisturm("Frost", 2, 2)\n    m = Monster("Wolf", 10, 4)\n    e.schiesse(m)\n    return [m.leben, m.tempo]\n\ndef _t2():\n    e = Eisturm("Frost", 2, 4)\n    return [isinstance(e, Turm), e.name, e.schaden, e.kaelte]\n',
    ...tests([[8, 2], [true, 'Frost', 2, 4]]), testName: (k) => ['schiesse', 'geerbte Attribute'][k],
    befehle: [K_B('class Eisturm(Turm):'), K_B('def schiesse(self, monster):'), K_B('super().¦')],
    merke: { titel: '🧬 Vererbung', text: 'Eine Unterklasse erbt alle Attribute und Methoden der Oberklasse („ist ein“: Ein Eisturm ist ein Turm). Sie kann neue hinzufügen und Methoden überschreiben. Mit super() ruft sie den Teil der Oberklasse auf – z. B. super().__init__(…) im Konstruktor.', code: 'class Troll(Monster):\n    def __init__(self, name, leben, keule):\n        super().__init__(name, leben)\n        self.keule = keule' },
    tipps: ['class Eisturm(Turm): – in Klammern steht die Oberklasse.', 'Im Konstruktor zuerst super().__init__(name, schaden), dann self.kaelte = kaelte.', 'schiesse: super().schiesse(monster) und danach monster.tempo = monster.tempo / self.kaelte'],
    loesung: 'class Eisturm(Turm):\n    def __init__(self, name, schaden, kaelte):\n        super().__init__(name, schaden)\n        self.kaelte = kaelte\n\n    def schiesse(self, monster):\n        super().schiesse(monster)\n        monster.tempo = monster.tempo / self.kaelte' }),
  WERK({ id: 'od1v', kapitel: 53, sortArt: 'vorher', funktion: 'versuch', aufruf: 'versuch()', ico: '🔮', titel: 'Wer macht welches Geräusch?', lohn: 70,
    ziel: 'Vier Türme, eine Schleife. Sag voraus, was passiert.',
    listen: [[]], code: 'class Turm:\n    def geraeusch(self):\n        return "klack"\n\nclass Kanone(Turm):\n    def geraeusch(self):\n        return "BUMM"\n\nclass Eisturm(Turm):\n    pass\n\ndef versuch():\n    tuerme = [Turm(), Kanone(), Eisturm(), Kanone()]\n    laut = 0\n    for t in tuerme:\n        print(t.geraeusch())\n        if t.geraeusch() == "BUMM":\n            laut = laut + 1\n    return laut',
    fragen: [W('Was gibt der Eisturm aus?', ['klack', 'BUMM', 'nichts – Eisturm hat keine Methode', 'einen Fehler'], 0),
      { art: 'zahl', text: 'Welchen Wert hat laut am Ende?', soll: (l) => l.wert },
      W('Dieselbe Zeile t.geraeusch() tut je nach Objekt etwas anderes. Wie heißt das?', ['Kapselung', 'Polymorphie', 'Komposition', 'Rekursion'], 1),
      W('Warum „klack“ beim Eisturm?', ['Eisturm erbt geraeusch von Turm – er überschreibt die Methode nicht', 'weil pass „klack“ bedeutet', 'Zufall', 'weil die Liste so sortiert ist'], 0)],
    tipps: ['Hat die Klasse die Methode nicht selbst, sucht Python in der Oberklasse.'] }),
  WERK({ id: 'od2', kapitel: 53, sortArt: 'funktion', ico: '⚔️', titel: 'Die Arena', lohn: 90, malen: () => werkArena(KO?.laeufe?.[2]), titelAnsicht: 'Arena',
    ziel: 'Schreib zwei Unterklassen von Turm: Blitzturm trifft ALLE noch lebenden Monster, Kanone macht bei großen Monstern doppelten Schaden. Dann muss die Arena (ein Pfeilturm, ein Blitzturm, eine Kanone) alle vier Monster in 6 Runden schaffen.',
    story: 'In der Arena testet Meisterin Ada neue Turmklassen. Die Arena kennt nur Turm und ruft für jeden t.schiesse(monster_liste) auf – welcher Turm was tut, entscheidet seine Klasse.',
    vorspann: V_ARENA, listen: [[], [], []], aufrufFn: (l, k) => `_t${k + 1}()`,
    soll: (l, k) => [[4, 28], [0, 22, true]][k], testName: (k) => ['Blitzturm', 'Kanone', 'Arena'][k],
    pruefWert: (w, k) => (k < 2 ? (gleichWert(w, [[4, 28], [0, 22, true]][k]) ? null : `Ergebnis ${ergebnisText(w)} – richtig wäre ${ergebnisText([[4, 28], [0, 22, true]][k])}.`)
      : w?.besiegt ? null : 'Nach 6 Runden leben noch Monster – stimmen Blitzturm und Kanone?'),
    okText: (w, k) => (k < 2 ? `${['Blitzturm', 'Kanone'][k]} ✓` : `Alle Monster nach ${w.verlauf.findIndex((r) => r.every((x) => x === 0))} Runden besiegt ✓`),
    befehle: [K_B('class Blitzturm(Turm):'), K_B('def schiesse(self, monster_liste):'), K_B('class Kanone(Turm):'), K_B('self.ziel(¦)')],
    merke: { titel: '🎭 Polymorphie', text: 'Polymorphie (Vielgestaltigkeit): Derselbe Methodenaufruf (t.schiesse(…)) führt je nach Klasse des Objekts verschiedenen Code aus. Die Arena muss die Turmarten nicht kennen – neue Unterklassen funktionieren ohne Änderung an der Arena.', code: 'for t in tuerme:\n    t.schiesse(monster)   # jede Klasse auf ihre Art' },
    tipps: ['Blitzturm: Schleife über alle Monster, nur die mit leben > 0 treffen.', 'Kanone: m = self.ziel(monster_liste); wenn m nicht None ist: Schaden verdoppeln, wenn m.gross.', 'Vergiss nicht: class Kanone(Turm): – sonst ist es kein Turm.'],
    loesung: 'class Blitzturm(Turm):\n    def schiesse(self, monster_liste):\n        for m in monster_liste:\n            if m.leben > 0:\n                m.leben = m.leben - self.schaden\n\nclass Kanone(Turm):\n    def schiesse(self, monster_liste):\n        m = self.ziel(monster_liste)\n        if m is not None:\n            if m.gross:\n                m.leben = m.leben - 2 * self.schaden\n            else:\n                m.leben = m.leben - self.schaden' }),
  WFRAGEN({ id: 'od3', kapitel: 53, ico: '🧬', titel: 'Ist ein oder hat ein?', lohn: 70,
    ziel: 'Vererbung oder Beziehung? Und was heißt Überschreiben?',
    fragen: [W('„Ein Eisturm ist ein Turm.“ Das spricht für …', ['Vererbung', 'Komposition', 'Assoziation', 'gar keine Beziehung'], 0),
      W('„Ein Turm hat eine Kanone.“ Das spricht für …', ['Vererbung', 'eine Beziehung – hier eine Komposition', 'Polymorphie', 'Kapselung'], 1),
      W('Eine Unterklasse schreibt eine Methode mit demselben Namen wie die Oberklasse neu. Das heißt …', ['Überschreiben', 'Kapseln', 'Instanziieren', 'Aggregieren'], 0),
      W('Wozu super().schiesse(monster) in einer überschriebenen Methode?', ['um auch die Methode der Oberklasse auszuführen', 'um die geerbte Methode der Oberklasse zu löschen', 'um ein neues Objekt zu erzeugen', 'um die Klasse privat zu machen'], 0),
      W('Welche Vererbung ist falsch modelliert?', ['class Eisturm(Turm)', 'class Kanone(Turm)', 'class Burg(Turm) – eine Burg ist kein Turm, sie hat Türme', 'class Troll(Monster)'], 2)],
    tipps: ['„ist ein“ → Vererbung, „hat ein“ → Beziehung.'] }),

  // --- Kapitel 54: 📚 Datenstrukturen als Klassen (Kurs 3.1–3.3) ---
  WERK({ id: 'oe1', kapitel: 54, sortArt: 'funktion', ico: '📚', titel: 'Der Stapel (Stack)', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Bauplan',
    tabelle: werkBild(`${uml('Stapel', ['− __daten: list'], ['+ push(x)', '+ pop()', '+ top()', '+ ist_leer(): bool', '+ groesse(): int'])}<p class="hinweis">LIFO: Was zuletzt hineinkommt, kommt zuerst heraus – wie ein Stapel Kisten. pop() und top() geben bei leerem Stapel None zurück.</p>`),
    ziel: 'Schreib die Klasse Stapel: push legt oben drauf, pop nimmt das oberste weg und gibt es zurück, top zeigt es nur an. Leerer Stapel: pop() und top() geben None zurück.',
    vorspann: 'def _t1():\n    s = Stapel()\n    s.push(1)\n    s.push(2)\n    s.push(3)\n    return [s.pop(), s.pop(), s.groesse()]\n\ndef _t2():\n    s = Stapel()\n    a = s.ist_leer()\n    s.push("Ork")\n    return [a, s.top(), s.ist_leer(), s.groesse()]\n\ndef _t3():\n    s = Stapel()\n    return [s.pop(), s.top()]\n\ndef _t4():\n    s = Stapel()\n    return [hasattr(s, "daten"), hasattr(s, "_Stapel__daten")]\n',
    ...privatTests([[3, 2, 1], [true, 'Ork', false, 1], [null, null]], 'daten'), testName: (k) => ['push, pop', 'top, ist_leer', 'leerer Stapel', '__daten ist privat'][k],
    befehle: [K_B('class Stapel:'), K_B('self.__daten = []'), K_B('def push(self, x):'), K_B('def pop(self):'), K_B('if ¦:')],
    merke: { titel: '📚 Stapel (Stack)', text: 'Ein Stapel arbeitet nach LIFO (last in, first out): push legt oben drauf, pop nimmt das oberste weg. Anwendungen: Rückgängig-Funktion, Aufrufstapel bei Rekursion, Klammerprüfung. Als Klasse gekapselt, kann niemand mitten im Stapel etwas verändern.', code: 'def push(self, x):\n    self.__daten.append(x)\n\ndef pop(self):\n    return self.__daten.pop()' },
    tipps: ['Intern genügt eine Liste; das Ende der Liste ist oben.', 'pop: wenn leer, return None; sonst self.__daten.pop()', 'top: self.__daten[len(self.__daten) - 1]'],
    loesung: 'class Stapel:\n    def __init__(self):\n        self.__daten = []\n\n    def push(self, x):\n        self.__daten.append(x)\n\n    def pop(self):\n        if self.ist_leer():\n            return None\n        return self.__daten.pop()\n\n    def top(self):\n        if self.ist_leer():\n            return None\n        return self.__daten[len(self.__daten) - 1]\n\n    def ist_leer(self):\n        return len(self.__daten) == 0\n\n    def groesse(self):\n        return len(self.__daten)' }),
  WERK({ id: 'oe2', kapitel: 54, sortArt: 'funktion', ico: '🚪', titel: 'Die Schlange am Tor (Queue)', lohn: 75, ansicht: 'tabelle', titelAnsicht: 'Bauplan',
    tabelle: werkBild(`${uml('Schlange', ['− __daten: list'], ['+ hinten_anstellen(x)', '+ vorne_heraus()', '+ ist_leer(): bool', '+ laenge(): int'])}<p class="hinweis">FIFO: Wer zuerst kommt, kommt zuerst dran – wie die Monster vor dem Tor. vorne_heraus() gibt bei leerer Schlange None zurück.</p>`),
    ziel: 'Schreib die Klasse Schlange (Queue): hinten_anstellen(x) stellt hinten an, vorne_heraus() nimmt den vordersten weg und gibt ihn zurück.',
    vorspann: 'def _t1():\n    q = Schlange()\n    q.hinten_anstellen("Ratte")\n    q.hinten_anstellen("Ork")\n    q.hinten_anstellen("Troll")\n    return [q.vorne_heraus(), q.vorne_heraus(), q.laenge()]\n\ndef _t2():\n    q = Schlange()\n    a = q.vorne_heraus()\n    q.hinten_anstellen(1)\n    return [a, q.ist_leer(), q.vorne_heraus(), q.ist_leer()]\n\ndef _t3():\n    q = Schlange()\n    return [hasattr(q, "daten"), hasattr(q, "_Schlange__daten")]\n',
    ...privatTests([['Ratte', 'Ork', 1], [null, false, 1, true]], 'daten'), testName: (k) => ['Reihenfolge', 'leere Schlange', '__daten ist privat'][k],
    befehle: [K_B('class Schlange:'), K_B('def hinten_anstellen(self, x):'), K_B('def vorne_heraus(self):')],
    tipps: ['Hinten anstellen = ans Ende der Liste.', 'Vorne heraus = das Element mit Index 0 entfernen: self.__daten.pop(0)'],
    loesung: 'class Schlange:\n    def __init__(self):\n        self.__daten = []\n\n    def hinten_anstellen(self, x):\n        self.__daten.append(x)\n\n    def vorne_heraus(self):\n        if self.ist_leer():\n            return None\n        return self.__daten.pop(0)\n\n    def ist_leer(self):\n        return len(self.__daten) == 0\n\n    def laenge(self):\n        return len(self.__daten)' }),
  WERK({ id: 'oe3', kapitel: 54, sortArt: 'funktion', ico: '🧾', titel: 'Klammern prüfen', lohn: 80,
    ziel: 'Schreib klammern_ok(text) mit einem Stapel: True, wenn alle Klammern ( [ { richtig geschlossen sind. Die Klasse Stapel gibt es schon (push, pop, ist_leer).',
    vorspann: 'class Stapel:\n    def __init__(self):\n        self.__daten = []\n    def push(self, x):\n        self.__daten.append(x)\n    def pop(self):\n        if len(self.__daten) == 0:\n            return None\n        return self.__daten.pop()\n    def ist_leer(self):\n        return len(self.__daten) == 0\n',
    listen: [[], [], [], [], [], []], aufrufFn: (l, k) => `klammern_ok(${JSON.stringify(KLAMMER_TESTS[k][0])})`, soll: (l, k) => KLAMMER_TESTS[k][1], testName: (k) => `„${KLAMMER_TESTS[k][0]}“`,
    befehle: [K_B('def klammern_ok(text):'), K_B('s = Stapel()'), K_B('for z in text:'), K_B('if ¦:'), K_B('elif ¦:')],
    tipps: ['Öffnende Klammer: auf den Stapel. Schließende: die oberste muss das passende Gegenstück sein.', 'Ist der Stapel leer, wenn eine schließende kommt – falsch.', 'Am Ende muss der Stapel leer sein.'],
    loesung: 'def klammern_ok(text):\n    s = Stapel()\n    paare = {")": "(", "]": "[", "}": "{"}\n    for z in text:\n        if z in "([{":\n            s.push(z)\n        elif z in ")]}":\n            if s.pop() != paare[z]:\n                return False\n    return s.ist_leer()' }),
  WERK({ id: 'oe4', kapitel: 54, sortArt: 'funktion', knobel: true, ico: '⛓️', titel: 'Die verkettete Liste', lohn: 95, ansicht: 'tabelle', titelAnsicht: 'Bauplan',
    tabelle: werkBild(`<div class="umlrel">${uml('Liste', ['− __kopf: Knoten'], ['+ anhaengen(wert)', '+ laenge(): int', '+ als_liste(): list'])}<div class="umlpfeil">───────<br><span class="hinweis">0..1 kopf</span></div>${uml('Knoten', ['wert', 'naechster: Knoten'], [])}</div>
      <p class="hinweis">kopf → [3 | •] → [7 | •] → [9 | None]</p>`),
    ziel: 'Ohne Python-Liste: Jeder Knoten kennt seinen Wert und den nächsten Knoten. Schreib Knoten und Liste mit anhaengen, laenge und als_liste.',
    vorspann: 'def _t1():\n    l = Liste()\n    return [l.laenge(), l.als_liste()]\n\ndef _t2():\n    l = Liste()\n    l.anhaengen(3)\n    l.anhaengen(7)\n    l.anhaengen(9)\n    return [l.laenge(), l.als_liste()]\n',
    ...tests([[0, []], [3, [3, 7, 9]]]), testName: (k) => ['leere Liste', 'drei Knoten'][k],
    befehle: [K_B('class Knoten:'), K_B('self.naechster = None'), K_B('class Liste:'), K_B('while k.naechster is not None:')],
    tipps: ['Knoten: __init__(self, wert) mit self.wert und self.naechster = None.', 'anhaengen: Ist die Liste leer, wird der neue Knoten der Kopf. Sonst bis zum letzten Knoten laufen und dort anhängen.', 'als_liste: vom Kopf aus durchlaufen und die Werte in eine Python-Liste sammeln.'],
    loesung: 'class Knoten:\n    def __init__(self, wert):\n        self.wert = wert\n        self.naechster = None\n\nclass Liste:\n    def __init__(self):\n        self.__kopf = None\n\n    def anhaengen(self, wert):\n        neu = Knoten(wert)\n        if self.__kopf is None:\n            self.__kopf = neu\n            return\n        k = self.__kopf\n        while k.naechster is not None:\n            k = k.naechster\n        k.naechster = neu\n\n    def laenge(self):\n        n = 0\n        k = self.__kopf\n        while k is not None:\n            n = n + 1\n            k = k.naechster\n        return n\n\n    def als_liste(self):\n        aus = []\n        k = self.__kopf\n        while k is not None:\n            aus.append(k.wert)\n            k = k.naechster\n        return aus' }),

  // --- Kapitel 55: 🧭 Vom Programm zum Projekt (Kurs 5.1 Softwarearchitektur, 5.2 Vorgehensmodelle, 5.4 Git im Team, 5.5 Projektauftrag) ---
  WFRAGEN({ id: 'of1', kapitel: 55, ico: '🧭', titel: 'Wasserfall, V oder Scrum?', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Das V-Modell',
    tabelle: () => ({ html: WK_VMODELL }),
    ziel: 'Ein Vorgehensmodell legt fest, in welchen Schritten Software entsteht und wann geprüft wird. Welches passt wann?',
    story: 'Meisterin Ada bekommt einen großen Auftrag: Drei Gesellen sollen gemeinsam ein Programm bauen. „Einfach loslegen“ geht da schief – erst braucht es einen Plan, wie gearbeitet wird.',
    merke: { titel: '🧭 Vorgehensmodelle', text: 'Wasserfall: Anforderungsanalyse → Entwurf → Implementierung → Test → Betrieb, nacheinander; Rücksprünge sind teuer. Das V-Modell ordnet jeder Entwurfsstufe eine Teststufe zu, die genau gegen diesen Entwurf prüft (Modultest ↔ Modulentwurf …). Scrum arbeitet in Sprints, jeder liefert ein getestetes, nutzbares Inkrement; die Anforderungen im Product Backlog dürfen sich ändern.' },
    fragen: [
      { art: 'liste', text: 'Gegen welche Entwurfsstufe prüft jeweils der Modultest, der Integrationstest, der Systemtest und der Abnahmetest? (vier Buchstaben in dieser Reihenfolge)', soll: () => ['D', 'C', 'B', 'A'] },
      W('Wer führt den Abnahmetest durch?', ['der Auftraggeber am fertigen System', 'das Entwicklerteam nach jedem Modul', 'ein Prüfprogramm direkt beim Speichern', 'die Person, die den Code geschrieben hat'], 0),
      W('Steuerung einer Bahnschranke: Die Anforderungen stehen fest, jede Funktion muss nachweislich getestet sein. Welches Modell passt?', ['V-Modell', 'Scrum', 'gar keins', 'einfach losprogrammieren'], 0),
      W('Eine App für die Schach-AG: Die AG weiß noch nicht genau, was sie will, ist aber jede Woche erreichbar. Welches Modell passt?', ['Scrum', 'Wasserfall', 'V-Modell', 'gar keins'], 0),
      W('Bei welchem Modell gibt es schon nach wenigen Wochen eine nutzbare Fassung?', ['Scrum, nach jedem Sprint', 'Wasserfall, nach jeder Phase', 'V-Modell, nach jeder Teststufe', 'bei allen erst ganz am Ende'], 0),
      W('Beim Wasserfall fällt erst im Test auf, dass eine Anforderung fehlt. Warum ist das teuer?', ['Entwurf, Code und Tests danach müssen nachgearbeitet werden', 'Tests dürfen beim Wasserfall nur einmal laufen', 'die Anforderung darf nicht mehr ergänzt werden', 'der Auftraggeber muss neu bezahlt werden'], 0)],
    tipps: ['Im V-Modell liegen sich Entwurfs- und Teststufe auf derselben Höhe gegenüber.', 'Feste Anforderungen und Nachweispflicht → V-Modell. Unklare, wechselnde Anforderungen und ein erreichbarer Kunde → Scrum.'] }),
  WFRAGEN({ id: 'of2', kapitel: 55, ico: '📋', titel: 'Der Projektauftrag', lohn: 70, ansicht: 'tabelle', titelAnsicht: 'Projektauftrag',
    tabelle: () => ({ html: WK_AUFTRAG }),
    ziel: 'Lies den Projektauftrag: Was muss das Programm können, was darf es zusätzlich, was gehört nicht dazu?',
    merke: { titel: '📋 Projektauftrag und Anforderungen', text: 'Ein Projektauftrag nennt Ziel und Rahmen, die Muss-Anforderungen (ohne sie ist das Projekt nicht fertig) und Kann-Anforderungen (Erweiterungen, wenn Zeit bleibt). Anforderungen schreibt man als User Story „Als … möchte ich …, um …“ mit prüfbaren Akzeptanzkriterien. Im Code trennt man nach MVC: Model (Daten und Logik, ohne print und input), View (Ausgabe), Controller (main.py steuert den Ablauf).' },
    fragen: [
      { art: 'liste', menge: true, text: 'Welche der sechs Funktionen sind Muss-Anforderungen? (Nummern mit Leerzeichen)', soll: () => [1, 2, 3] },
      { art: 'liste', menge: true, text: 'Welche sind Kann-Anforderungen (Erweiterungen)?', soll: () => [4, 5] },
      { art: 'zahl', text: 'Welche Nummer widerspricht dem Auftrag?', soll: () => 6 },
      W('Welcher Satz ist eine User Story?', ['Als Fahrer möchte ich freie Plätze anbieten, um Mitfahrer zu finden.', 'Das Programm speichert alle Fahrten in einer Liste.', 'Fahrten anlegen, anzeigen und wieder löschen.', 'Die Klasse Fahrt hat ein Attribut __plaetze.'], 0),
      W('Welches Akzeptanzkriterium kann man prüfen?', ['Bei 4 Plätzen wird die 5. Anmeldung abgelehnt.', 'Die Anmeldung funktioniert zuverlässig.', 'Die Plätze werden sinnvoll verwaltet.', 'Das Programm ist für alle gut bedienbar.'], 0),
      W('In der Model-Klasse Fahrt steht print("Fahrt ist voll"). Was verletzt das?', ['die Trennung nach MVC', 'die Kapselung der Attribute', 'die Typangaben der Methoden', 'die Regeln für Commit-Nachrichten'], 0)],
    tipps: ['„muss“ = Muss-Anforderung, „kann, wenn Zeit bleibt“ = Kann-Anforderung.', 'Ein Akzeptanzkriterium ist prüfbar, wenn man einen Test mit Eingabe und erwartetem Ergebnis daraus machen kann.'] }),
  WFRAGEN({ id: 'of3', kapitel: 55, ico: '🌿', titel: 'Git im Team', lohn: 75,
    ziel: 'Wie kommt eine Änderung sicher in die gemeinsame Fassung main?',
    merke: { titel: '🌿 Git im Team', text: 'Auf main liegt nur geprüfter, lauffähiger Code. Jede Änderung entsteht auf einem eigenen Branch: Issue übernehmen → Branch → Commits → Pull Request → Review durch eine andere Person → Merge nach main. Ändern zwei Branches dieselbe Stelle derselben Datei verschieden, entsteht ein Merge-Konflikt, den ein Mensch lösen muss.' },
    fragen: [
      { art: 'liste', text: 'Bring den Weg einer Änderung in die richtige Reihenfolge: A Merge nach main · B Pull Request · C Branch anlegen · D Review · E Issue übernehmen · F Commits (sechs Buchstaben)', soll: () => ['E', 'C', 'F', 'B', 'D', 'A'] },
      W('Was ist ein Branch?', ['eine eigene Entwicklungslinie, die main nicht verändert', 'eine Kopie des Repositorys auf einem fremden Rechner', 'ein Antrag, Änderungen nach main zu übernehmen', 'eine Liste aller offenen Aufgaben im Projekt'], 0),
      W('Wann entsteht ein Merge-Konflikt?', ['zwei Branches ändern dieselbe Stelle derselben Datei', 'zwei Personen ändern verschiedene Dateien gleichzeitig', 'ein Branch hat mehr Commits als main selbst', 'ein Pull Request wurde noch nicht begutachtet'], 0),
      { art: 'zahl', text: 'Wie viele Vorgänger (Eltern) hat ein Merge-Commit?', soll: () => 2 },
      W('Welche Commit-Nachricht ist gut?', ['#4 Fahrt: letzter Platz macht die Fahrt voll', 'Änderungen von heute Nachmittag', 'fix', 'Mia hat noch was in der Datei gemacht'], 0),
      W('Warum speichert niemand direkt auf main?', ['main soll immer geprüften, lauffähigen Code enthalten', 'auf main darf nur die Lehrkraft speichern', 'Git kann auf main keine Commits speichern', 'main wird nach jedem Sprint gelöscht'], 0)],
    tipps: ['Erst wird die Aufgabe übernommen, dann entsteht der Branch, auf dem man arbeitet.', 'Der Pull Request ist der Antrag – das Review kommt danach, der Merge ganz zum Schluss.'] }),
);
const KLAMMER_TESTS = [['(a[b]{c})', true], ['(]', false], ['((', false], ['', true], ['{[()()]}', true], ['())(', false]];

// ⚔️ Arena: eigene Turmklassen gegen vier Monster, Runde für Runde (gezeichnet mit malTurm/malGegner aus figuren.js)
const ARENA_MONSTER = [['ratte', 'Ratte', 6], ['troll', 'Troll', 30], ['ratte', 'Ratte', 6], ['ork', 'Ork', 18]];
const ARENA_TURM = { Turm: 'pfeil', Blitzturm: 'blitz', Kanone: 'kanone' };
function werkArena(lauf, k) {
  const w = lauf?.wert?.verlauf ? lauf.wert : { verlauf: [ARENA_MONSTER.map((m) => m[2])], tuerme: ['Turm', 'Blitzturm', 'Kanone'] };
  let r = 0;
  const zeig = () => {
    const { g, w: bw, h } = sternLeinwand(), t = performance.now() / 1000, a = Math.min(18, h / 13);
    g.fillStyle = '#3f6b34'; g.fillRect(0, h * 0.12, bw, h * 0.88);
    w.tuerme.forEach((name, i) => {
      const y = h * (0.3 + i * 0.27), x = bw * 0.08;
      if (typeof malTurm === 'function') malTurm(g, ARENA_TURM[name] || 'pfeil', 3, x, y, a, t, false, []);
      g.fillStyle = '#fff'; g.font = '700 12px system-ui'; g.textAlign = 'left'; g.fillText(name, x + a * 1.4, y + a * 0.6);
    });
    ARENA_MONSTER.forEach(([art, name, max], j) => {
      const leben = w.verlauf[r][j], x = bw * (0.42 + j * 0.16), y = h * 0.62;
      if (leben > 0 && typeof malGegner === 'function') malGegner(g, art, x, y, art === 'troll' ? a * 1.5 : art === 'ork' ? a * 1.2 : a * 0.8, t, false, j);
      else { g.font = `${a}px system-ui`; g.textAlign = 'center'; g.fillText('💨', x, y); }
      g.fillStyle = '#222'; g.fillRect(x - 22, y - a * 2, 44, 6);
      g.fillStyle = leben > 0 ? '#4fd18b' : '#555'; g.fillRect(x - 22, y - a * 2, 44 * Math.max(0, leben) / max, 6);
      g.fillStyle = '#fff'; g.font = '11px system-ui'; g.textAlign = 'center'; g.fillText(`${name} ${Math.max(0, leben)}`, x, y - a * 2 - 4);
    });
    g.fillStyle = '#ffd84a'; g.font = '700 14px system-ui'; g.textAlign = 'left'; g.fillText(r ? `Runde ${r}` : 'Start', 10, 20);
  };
  zeig();
  if (w.verlauf.length > 1) STERN_ANIM = setInterval(() => {
    if (!$('#kornCanvas') || !H?.malen) { clearInterval(STERN_ANIM); return; }
    if (++r >= w.verlauf.length) { clearInterval(STERN_ANIM); return; }
    zeig();
  }, 800);
}
