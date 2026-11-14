'use strict';
// --- Python: Pyodide, Prelude, Fehlertexte auf Deutsch -----------------------------
// Der Code läuft mit sys.settrace, eingeschränkten Builtins und einer Denkgrenze.
// Aktionen rufen _js.act (1 Zug), Fragen _js.sense, print _js.say (beides kostet keinen Zug).
const PRELUDE = String.raw`
import ast, json, sys, traceback, re as _re, difflib as _difflib, keyword as _keyword
import builtins as _b

class _Stop(BaseException):
    pass

_FILE = "<dein code>"

def _line():
    f = sys._getframe(1)
    while f is not None and f.f_code.co_filename != _FILE:
        f = f.f_back
    return f.f_lineno if f is not None else 0

def _tracer(frame, event, arg):
    if event == "line" and frame.f_code.co_filename == _FILE:
        if _js.tick(frame.f_lineno):
            raise _Stop()
    return _tracer

# Die eigenen Variablen (Zahlen, Texte, wahr/falsch) für die Zeitleiste – als JSON-Text
def _vars():
    f = sys._getframe(1)
    while f is not None and f.f_code.co_filename != _FILE:
        f = f.f_back
    if f is None:
        return ""
    v = {k: x for k, x in f.f_locals.items() if not k.startswith("_") and k not in _API and type(x) in (int, float, str, bool)}
    return json.dumps(v) if v else ""

def _act(kind):
    if _js.act(kind, _line(), _vars()) == "stop":
        raise _Stop()

def forward(): _act("forward")
def harvest(): _act("harvest")
def turn_left(): _act("left")
def turn_right(): _act("right")
def water(): _act("water")
def pull(): _act("pull")
def can_harvest(): return bool(_js.sense("can_harvest"))
def can_move(): return bool(_js.sense("can_move"))
def is_weed(): return bool(_js.sense("is_weed"))
def pick_up(): _act("pick")
def place(): _act("place")
def is_hole(): return bool(_js.sense("is_hole"))

_API = dict(forward=forward, harvest=harvest, turn_left=turn_left, turn_right=turn_right, water=water, pull=pull,
            can_harvest=can_harvest, can_move=can_move, is_weed=is_weed, pick_up=pick_up, place=place, is_hole=is_hole)
_CALLABLE_API = tuple(_API)

def _range(*a):
    r = range(*a)
    if len(r) > 10000:
        raise ValueError("range(…) ist zu groß – höchstens 10000 Schritte.")
    return r

def _print(*a, sep=" ", end=""):
    _js.say(sep.join(str(x) for x in a), _line(), _vars())

_SAFE = {k: getattr(_b, k) for k in ("abs", "min", "max", "len", "int", "str", "float", "bool", "round", "list")}
_SAFE["range"] = _range
_SAFE["print"] = _print

# Sprachmittel gehören zu einem Konzept; erlaubt ist nur, was die Aufgabe freigibt.
_KONZEPT = {"For": "for", "While": "while", "Break": "while", "Continue": "while",
            "If": "if", "IfExp": "if", "Compare": "vergleich", "BoolOp": "vergleich", "Not": "vergleich",
            "Assign": "var", "AugAssign": "var", "AnnAssign": "var",
            "FunctionDef": "def", "Return": "def", "Lambda": "def", "Global": "def"}
_KONZEPT_NAME = {"for": "for", "while": "while", "if": "if", "var": "Variablen (=)", "def": "def (eigene Befehle)", "vergleich": "Vergleiche (==, <, and, not …)",
                 "else": "else", "elif": "elif"}
_ERLAUBT = set()
_EXTRA_NAMEN = set()   # Namen, die es nur in bestimmten Aufgaben gibt (🌾 Kornspeicher: vergleiche, tausche …)
def _set_erlaubt(data):
    global _ERLAUBT, _EXTRA_NAMEN
    liste = json.loads(data)
    _ERLAUBT = {x for x in liste if not x.startswith("name:")}
    _EXTRA_NAMEN = {"a"} if "karten" in _ERLAUBT else set()   # Kartenspiel: verdeckte Liste a
    # Namen aus Daten und Hilfscode einer Aufgabe (z. B. abstand, GAMMA, punkte) und die Extras des LK (sorted, sum)
    _EXTRA_NAMEN |= {x[5:] for x in liste if x.startswith("name:")}
    if "def" in _ERLAUBT:
        _EXTRA_NAMEN |= {"sorted", "sum"}
    if "lk" in _ERLAUBT:
        _EXTRA_NAMEN |= {"set", "tuple", "zip", "reversed", "any", "all", "map", "filter", "None", "dict", "enumerate", "isinstance"}
    if "klasse" in _ERLAUBT:
        _EXTRA_NAMEN |= {"super", "isinstance", "hasattr", "None"}
    # 🗄️ LK Daten: Dateien lesen und schreiben wie im Kurs (import csv/json, with open(...)) – die Dateien liegen nur im Speicher
    # 🕊️ LK Sicherheit: Zeichencodes und modulares Potenzieren
    if "krypto" in _ERLAUBT:
        _EXTRA_NAMEN |= {"ord", "chr", "pow", "divmod", "None", "dict", "enumerate"}
    if "dateien" in _ERLAUBT:
        _EXTRA_NAMEN |= {"open", "None", "dict", "isinstance", "enumerate", "sorted", "sum"}

_FERTIG = {"sum": "das Zusammenzählen", "sorted": "das Sortieren", "min": "die Suche nach dem Kleinsten", "max": "die Suche nach dem Größten"}
_FERTIG_METH = {"sort": "das Sortieren", "index": "das Suchen", "count": "das Zählen"}

_FORBIDDEN = {"Import": "import", "ImportFrom": "import", "With": "with", "Try": "try", "Raise": "raise",
              "Delete": "del", "Yield": "yield", "AsyncFunctionDef": "async", "Nonlocal": "nonlocal", "ClassDef": "class",
              "ListComp": "[… for …]", "SetComp": "{… for …}", "DictComp": "{…: … for …}", "GeneratorExp": "(… for …)"}

_SYNTAX_DE = [("inconsistent use of tabs", "Hier sind Tabs und Leerzeichen gemischt. Rück die Zeile mit 4 Leerzeichen ein."),
              ("Maybe you meant '=='", "Zum Vergleichen erwartet Python == (zwei Gleichheitszeichen)."),
              ("cannot assign to", "= speichert etwas. Zum Vergleichen erwartet Python == (zwei Gleichheitszeichen)."),
              ("expected ':'", "Python erwartet am Ende dieser Zeile einen Doppelpunkt :"),
              ("expected an indented block", "Python erwartet nach der Zeile mit Doppelpunkt einen eingerückten Block (4 Leerzeichen)."),
              ("unexpected indent", "Diese Zeile ist eingerückt, aber darüber steht keine Zeile mit Doppelpunkt (for, if, while …). Rück sie so weit nach links wie die Zeile darüber."),
              ("unindent does not match", "Die Einrückung passt zu keiner Zeile darüber. Python erwartet genau so viele Leerzeichen wie bei einer früheren Zeile – meist 0, 4 oder 8."),
              ("was never closed", "Python erwartet hier noch eine schließende Klammer )."), ("unmatched", "Hier ist eine Klammer zu viel."),
              ("does not match opening parenthesis", "Die Klammern passen nicht zusammen: ( wird mit ) geschlossen."),
              ("unterminated string", "Python erwartet am Ende des Textes noch ein Anführungszeichen \"."),
              ("forgot a comma", "Python versteht diese Zeile nicht – fehlt eine Klammer oder ein Komma?"),
              ("Missing parentheses in call to 'print'", "print braucht Klammern: print(ernte)"),
              ("invalid syntax", "Python versteht diese Zeile nicht.")]

def _syntax_de(e):
    msg, text = e.msg or "", (e.text or "").strip()
    first = _re.match(r"[A-Za-zÄÖÜäöüß_]\w*", text)
    first = first.group(0) if first else ""
    if _re.match(r"else\s*if\b|elsif\b", text):
        return "„sonst wenn“ heißt in Python elif: elif bedingung:"
    if first in ("else", "elif") and "invalid syntax" in msg and text.endswith(":"):
        return f"{first} steht genau so weit links wie sein if – direkt nach dem eingerückten if-Block (und elif immer vor else)."
    if first == "for" and "indent" not in msg:
        if _re.match(r"for\s+(in\b|range\b|\w+\s*\()", text):
            return "Nach for fehlt ein Name für die Zählvariable: for i in range(3):"
        if not _re.search(r"\bin\b", text):
            return "Nach dem Namen fehlt das Wort in: for i in range(3):"
    if "indent" not in msg and "tabs" not in msg and first and first not in _keyword.kwlist:
        if first.lower() in _keyword.kwlist:
            return f"Python-Wörter schreibt man klein: {first.lower()} statt {first}"
        if text.endswith(":"):
            close = _difflib.get_close_matches(first, ["for", "while", "if", "elif", "else", "def"], n=1, cutoff=0.6)
            if close:
                return f"Python kennt „{first}“ nicht – meintest du {close[0]}?"
    if msg.startswith("unmatched ')'"):
        m = _re.search(r"\b(" + "|".join(_CALLABLE_API + ("range", "print")) + r")(\w+)\)", text)
        if m:
            return f"Nach {m.group(1)} fehlt die öffnende Klammer ( – so: {m.group(1)}({m.group(2)})"
    return next((de for en, de in _SYNTAX_DE if en in msg), msg)

def _compile(src):
    try:
        tree = ast.parse(src, _FILE)
    except SyntaxError as e:
        return None, None, [e.lineno or 0, _syntax_de(e)]
    for node in ast.walk(tree):
        name = type(node).__name__
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
            name = "Not"
        # class nur in der 🔧 Werkstatt (LK OOP, Sprachmittel "klasse")
        # class nur in der Werkstatt, del (Rücknahme beim Backtracking) nur in der 🐎 Poststation
        if name in ("Import", "ImportFrom") and "dateien" in _ERLAUBT:
            mods = [a.name for a in node.names] if name == "Import" else [node.module or ""]
            if any(m not in ("csv", "json") for m in mods):
                return None, tree, [node.lineno, "Im Spiel gibt es nur import csv und import json."]
            continue
        if name == "With" and "dateien" in _ERLAUBT:
            continue
        # LK: Comprehensions sind Abi-Stoff (Spieltest: [x for x in a] wurde abgelehnt)
        if name in ("ListComp", "SetComp", "DictComp", "GeneratorExp") and "lk" in _ERLAUBT:
            continue
        if name in _FORBIDDEN and not (name == "ClassDef" and "klasse" in _ERLAUBT) and not (name == "Delete" and "del" in _ERLAUBT):
            return None, tree, [getattr(node, "lineno", 0), f"„{_FORBIDDEN[name]}“ gibt es im Spiel nicht."]
        # Vergleiche (x > 0, not can_move()) gehören zu jeder Bedingung – erlaubt, sobald while oder if dran ist (Spieltest Burg 8)
        if name in _KONZEPT and _KONZEPT[name] not in _ERLAUBT and not (_KONZEPT[name] == "vergleich" and _ERLAUBT & {"if", "while"}):
            k = _KONZEPT[name]
            if k in ("for", "while") and "def" in _ERLAUBT:
                return None, tree, [getattr(node, "lineno", 0), f"Hier geht es ohne Schleife ({k}): Löse es rekursiv – die Funktion ruft sich selbst mit einer kleineren Aufgabe auf."]
            return None, tree, [getattr(node, "lineno", 0), f"{_KONZEPT_NAME[k]} lernst du erst auf einem späteren Hof. Heute geht es ohne."]
        # else und elif kommen nicht automatisch mit if – sie haben eigene Kapitel
        if isinstance(node, ast.If) and node.orelse:
            sub = node.orelse[0]
            ist_elif = len(node.orelse) == 1 and isinstance(sub, ast.If) and sub.col_offset == node.col_offset
            k = "elif" if ist_elif else "else"
            if k not in _ERLAUBT:
                return None, tree, [sub.lineno if ist_elif else max(1, sub.lineno - 1), f"{k} lernst du erst auf einem späteren Hof. Heute geht es ohne."]
        if isinstance(node, ast.Attribute) and "methoden" not in _ERLAUBT:
            return None, tree, [node.lineno, "Die Punkt-Schreibweise (etwas.etwas) gibt es im Spiel noch nicht."]
        if isinstance(node, ast.Name) and node.id.startswith("_"):
            return None, tree, [node.lineno, "Namen mit _ am Anfang sind reserviert."]
        # while can_move: / if not is_weed: – ohne Klammern ist die Bedingung immer wahr
        if isinstance(node, (ast.While, ast.If)):
            t = node.test.operand if isinstance(node.test, ast.UnaryOp) and isinstance(node.test.op, ast.Not) else node.test
            if isinstance(t, ast.Name) and t.id in _CALLABLE_API:
                return None, tree, [node.lineno, f"{t.id} ohne Klammern fragt nichts – die Bedingung wäre immer wahr. Schreib {t.id}()"]
        # x == 0 als eigene Zeile vergleicht nur und tut nichts – gemeint war fast immer x = 0
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Compare) and isinstance(node.value.left, ast.Name) \
                and len(node.value.ops) == 1 and isinstance(node.value.ops[0], ast.Eq):
            return None, tree, [node.lineno, f"== vergleicht nur. Zum Speichern nimmt man ein Gleichheitszeichen: {node.value.left.id} = …"]
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Name) and node.value.id in _CALLABLE_API:
            return None, tree, [node.lineno, f"{node.value.id} ohne Klammern tut nichts – schreib {node.value.id}()"]
        # 🧱 Grundlagen selbst schreiben (Nutzerwunsch 2026-11-13): fertige Funktionen, die die Denkarbeit erledigen, gibt es nur,
        # wenn die Aufgabe sie freigibt ("fertig" in der Sprache; Dateien-Aufgaben automatisch). Fester Code (Vorhersagen) gibt "fertig" mit.
        # Dateien-Aufgaben (Staatsarchiv): nur Sortieren ist frei (Lernziel „nach der Zahl sortieren“), sum/max/min weiter selbst
        _dat = "dateien" in _ERLAUBT and isinstance(node, ast.Call) and ((isinstance(node.func, ast.Name) and node.func.id == "sorted") or (isinstance(node.func, ast.Attribute) and node.func.attr == "sort"))
        if "fertig" not in _ERLAUBT and not _dat and isinstance(node, ast.Call):
            f = node.func
            # max(a, b) / min(a, b) mit genau zwei Werten versteckt keine Suche (z. B. Baumhöhe 1 + max(links, rechts))
            zwei = isinstance(f, ast.Name) and f.id in ("min", "max") and len(node.args) == 2 and not node.keywords and not any(isinstance(x, ast.Starred) for x in node.args)
            if isinstance(f, ast.Name) and f.id in _FERTIG and not zwei:
                return None, tree, [node.lineno, f"{f.id}() ist eine fertige Funktion – {_FERTIG[f.id]} schreibst du hier selbst, mit einer Schleife."]
            if isinstance(f, ast.Attribute) and f.attr in _FERTIG_METH:
                return None, tree, [node.lineno, f".{f.attr}() ist eine fertige Methode – {_FERTIG_METH[f.attr]} schreibst du hier selbst, mit einer Schleife."]
        # 🔦 „Ohne bin()“: auch int(text, 2) und f"{n:b}" nicht (Sprache "ohnebin")
        if "ohnebin" in _ERLAUBT:
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in ("int", "format") and len(node.args) + len(node.keywords) >= 2:
                return None, tree, [node.lineno, f"{node.func.id}(…, …) rechnet die Zahl fertig um – hier rechnest du selbst (mit // und %)."]
            if isinstance(node, ast.FormattedValue) and node.format_spec is not None and _re.search(r"[bxXo]", ast.unparse(node.format_spec)):
                return None, tree, [node.lineno, "Das Format :b bzw. :x rechnet die Zahl fertig um – hier rechnest du selbst (mit // und %)."]
        # 🌾 Kornspeicher (Kurs 2.2.1–2.2.5): getauscht wird mit temp – der Tupeltausch a, b = b, a nimmt genau das ab (Spieltest)
        if "nurtemp" in _ERLAUBT and isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Tuple) and isinstance(node.value, ast.Tuple):
            return None, tree, [node.lineno, "Tausche hier mit temp – so wie im Kurs: temp = a[i] · a[i] = a[j] · a[j] = temp"]
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "range" and any(isinstance(a, ast.Constant) and isinstance(a.value, float) for a in node.args):
            return None, tree, [node.lineno, "range() erwartet ganze Zahlen, z. B. range(3)."]
    return compile(tree, _FILE, "exec"), tree, None

# Anweisungen zählen (für ⭐ kurz)
def _count(tree):
    return sum(1 for s in ast.walk(tree) if isinstance(s, ast.stmt))

def _similar(name, pool):
    low = {k.lower(): k for k in pool}
    if name.lower() in low:
        return low[name.lower()]
    c = _difflib.get_close_matches(name.lower(), list(low), n=1, cutoff=0.75)
    return low[c[0]] if c else None

# Unbekannte Namen schon vor dem Start finden – ein Tippfehler soll keinen Tag kosten.
def _unknown(tree):
    names = {n.id for n in ast.walk(tree) if isinstance(n, ast.Name) and not isinstance(n.ctx, ast.Load)}
    names |= {n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)}
    names |= {n.arg for n in ast.walk(tree) if isinstance(n, ast.arg)}   # Parameter: def bubblesort(a)
    names |= {n.name for n in ast.walk(tree) if isinstance(n, ast.ClassDef)}   # class Turm
    names |= {(a.asname or a.name) for n in ast.walk(tree) if isinstance(n, (ast.Import, ast.ImportFrom)) for a in n.names}   # import csv
    known = set(_API) | set(_SAFE) | names | _EXTRA_NAMEN
    called = {id(c.func) for c in ast.walk(tree) if isinstance(c, ast.Call)}
    for n in sorted((n for n in ast.walk(tree) if isinstance(n, ast.Name)), key=lambda n: (n.lineno, n.col_offset)):
        if not isinstance(n.ctx, ast.Load) or n.id in known:
            continue
        s = _similar(n.id, sorted(known))
        if s:
            same = " Groß/klein zählt!" if s.lower() == n.id.lower() else ""
            return [n.lineno, f"Python kennt „{n.id}“ nicht – meintest du {s}{'()' if s in _API else ''}?{same}"]
        if id(n) in called:
            return [n.lineno, f"Python kennt den Befehl „{n.id}()“ nicht. Die Befehle stehen unter dem Code."]
        return [n.lineno, f"Python kennt „{n.id}“ nicht – Tippfehler?"]
    return None

def _check(src):
    code, tree, err = _compile(src)
    if not err:
        err = _unknown(tree)
    return json.dumps({"err": err, "count": _count(tree) if tree is not None else None})

def _type_de(text):
    # OOP: Methode ohne self – Python übergibt das Objekt immer als ersten Wert
    m = _re.search(r"(\w+)\(\) takes (\d+) positional arguments? but (\d+) (?:were|was) given", text)
    if m and int(m.group(3)) == int(m.group(2)) + 1:
        return f"{m.group(1)}() bekommt einen Wert zu viel – fehlt in der Methode der erste Parameter self?"
    m = _re.match(r"(\w+)\(\) takes 0 positional arguments", text)
    if m:
        return f"{m.group(1)}() braucht nichts in den Klammern."
    m = _re.match(r"(\w+)\(\) missing \d+ required positional argument", text)
    if m:
        return f"{m.group(1)}() braucht etwas in den Klammern."
    if "can only concatenate str" in text or ("unsupported operand" in text and "str" in text):
        return 'Text und Zahl kann man nicht mit + verbinden. Schreib zum Beispiel: print("Anzahl:", anzahl)'
    if "object is not callable" in text:
        return "Hier steht () hinter etwas, das kein Befehl ist."
    if "cannot be interpreted as an integer" in text:
        return "range() erwartet eine ganze Zahl."
    # Spieltest: diese kamen noch englisch
    m = _re.match(r"list indices must be integers or slices, not (\w+)", text)
    if m:
        return ("Ein Listenplatz muss eine ganze Zahl sein – hier ist er eine Kommazahl. Teile mit // statt /, oder wandle mit int(…) um."
                if m.group(1) == "float" else f"Ein Listenplatz muss eine ganze Zahl sein, nicht {m.group(1)}.")
    if "string indices must be integers" in text:
        return "Ein Platz in einem Text muss eine ganze Zahl sein."
    m = _re.match(r"unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'", text)
    if m:
        return f"{m.group(2)} {m.group(1)} {m.group(3)} geht nicht – passen die Datentypen? (z. B. None aus einer Funktion ohne return, oder Liste statt Zahl)"
    m = _re.match(r"'(\w+)' object is not subscriptable", text)
    if m:
        return f"Ein Wert vom Typ {m.group(1)} hat keine Plätze […] – ist das wirklich eine Liste bzw. ein Dictionary?" + (" (None: fehlt irgendwo ein return?)" if m.group(1) == "NoneType" else "")
    m = _re.match(r"'(\w+)' object is not iterable", text)
    if m:
        return f"Über einen Wert vom Typ {m.group(1)} kann for nicht laufen – erwartet wird eine Liste, ein Text oder range(…)."
    m = _re.match(r"'<' not supported between instances of '(\w+)' and '(\w+)'|'>' not supported between instances of '(\w+)' and '(\w+)'", text)
    if m:
        a, b = (m.group(1), m.group(2)) if m.group(1) else (m.group(3), m.group(4))
        return f"{a} und {b} kann man nicht der Größe nach vergleichen – erst umwandeln (int(…), float(…))."
    if text.startswith("list.remove(x): x not in list"):
        return "remove: Diesen Wert gibt es in der Liste nicht."
    m = _re.match(r"(.+) is not in list", text)
    if m:
        return f"index: {m.group(1)} steht nicht in der Liste."
    # 🗄️ CSV: Texte, die keine Zahl sind ("N/A", "", "12,5")
    m = _re.match(r"(?:invalid literal for int\(\) with base 10|could not convert string to float): (.*)", text)
    if m:
        w = m.group(1)
        extra = " Im Text steht ein Komma – Python braucht einen Punkt: .replace(\",\", \".\")" if "," in w else " Fehlende oder kaputte Werte vorher aussortieren."
        return f"{w} lässt sich nicht in eine Zahl umwandeln.{extra}"
    return text

_S_QUELLE = [""]   # Quelltext des laufenden Kornspeicher-Programms (für Meldungen, die die Zeile zeigen)

# Variable ohne Wert: Steht die Zuweisung in einem if/for/while, zu dem die Zeile nicht gehört, liegt es fast immer an der
# Einrückung (Spieltest ko4: der Tausch stand neben dem if statt darin → „temp hat noch keinen Wert“ führte in die Irre)
def _name_de(name, line, src):
    allgemein = f"„{name}“ hat hier noch keinen Wert. Leg die Variable vorher an, z. B. {name} = 0"
    try:
        tree = ast.parse(src)
    except Exception:
        return allgemein
    eltern = {}
    for p in ast.walk(tree):
        for c in ast.iter_child_nodes(p):
            eltern[c] = p
    zuw = sorted((n for n in ast.walk(tree) if isinstance(n, ast.Name) and n.id == name and isinstance(n.ctx, ast.Store)), key=lambda n: n.lineno)
    for n in zuw:
        p = eltern.get(n)
        while p is not None and not isinstance(p, (ast.If, ast.While, ast.For, ast.FunctionDef, ast.Module)):
            p = eltern.get(p)
        if isinstance(p, (ast.If, ast.While, ast.For)) and not (p.lineno <= line <= (p.end_lineno or p.lineno)):
            kw = "if" if isinstance(p, ast.If) else "while" if isinstance(p, ast.While) else "for"
            return (f"„{name}“ hat hier noch keinen Wert: Die Variable wird erst in Zeile {n.lineno} gesetzt, und die gehört zum {kw} in Zeile {p.lineno} – "
                    f"Zeile {line} aber nicht. Stimmt die Einrückung? Was zum {kw} gehört, rückt man genauso weit ein wie Zeile {n.lineno}.")
    if zuw and zuw[0].lineno > line:
        return f"„{name}“ bekommt erst in Zeile {zuw[0].lineno} einen Wert – Python arbeitet von oben nach unten. Steht die Zeile an der richtigen Stelle?"
    return allgemein

# Liste zu Ende: den Platz nennen, der wirklich in der Zeile steht (Spieltest: die Meldung sprach von j + 1, im Code stand i + 1)
def _index_de(text, line, src):
    if "pop" in text:
        return "Die Liste ist leer – pop() hat nichts mehr zum Herausnehmen."
    was = "Text" if "string" in text else "Liste"
    stellen = []
    try:
        for n in ast.walk(ast.parse(src)):
            if isinstance(n, ast.Subscript) and getattr(n, "lineno", 0) == line and not isinstance(n.slice, ast.Slice):
                stellen.append((isinstance(n.slice, ast.BinOp), ast.unparse(n.value), ast.unparse(n.slice)))
    except Exception:
        pass
    if stellen:
        stellen.sort(key=lambda s: not s[0])   # verdächtig: ein Platz mit Rechnung (i + 1, j - 1)
        _, liste, platz = stellen[0]
        welche = f"Liegt {platz} schon hinter dem Ende (oder vor dem Anfang)?" if len(stellen) == 1 or stellen[0][0] else f"Welcher Platz in Zeile {line} ist zu groß?"
        return f"Dieser Platz liegt außerhalb der {was} – die Plätze von {liste} gehen von 0 bis len({liste}) − 1. {welche} Prüfe, wie weit deine Schleife läuft."
    return f"Dieser Platz liegt außerhalb der {was} – die Plätze gehen von 0 bis len(…) − 1. Prüfe, wie weit deine Schleife läuft."

# Wessen Attribut fehlte? z. B. „self.head“ in self.head.next (für die None-Meldung)
def _attr_vor(attr, line, src):
    try:
        for n in ast.walk(ast.parse(src)):
            if isinstance(n, ast.Attribute) and n.attr == attr and getattr(n, "lineno", 0) == line:
                return ast.unparse(n.value)
    except Exception:
        pass
    return None

# Unterklasse mit eigenem __init__ ohne super().__init__ → Name der Oberklasse (sonst None)
def _ohne_super(klasse, src):
    try:
        for n in ast.walk(ast.parse(src)):
            if isinstance(n, ast.ClassDef) and n.name == klasse:
                basen = [ast.unparse(b) for b in n.bases if ast.unparse(b) != "object"]
                init = next((f for f in n.body if isinstance(f, ast.FunctionDef) and f.name == "__init__"), None)
                if not basen or init is None:
                    return None
                txt = ast.unparse(init)
                if "super()" in txt or any(f"{b}.__init__" in txt for b in basen):
                    return None
                return basen[0]
    except Exception:
        pass
    return None

def _runtime_de(ex, src):
    line = 0
    src = src or _S_QUELLE[0]
    for fr in traceback.extract_tb(ex.__traceback__):
        if fr.filename == _FILE:
            line = fr.lineno
    if isinstance(ex, NameError):
        name = getattr(ex, "name", None)
        if not name:
            m = _re.search(r"'(\w+)'", str(ex))
            name = m.group(1) if m else "?"
        msg = _name_de(name, line, src)
    elif isinstance(ex, (TypeError, ValueError)):
        msg = _type_de(str(ex))
    elif isinstance(ex, AttributeError):
        m = _re.search(r"'(\w+)' object has no attribute '(\w+)'", str(ex))
        ohne_super = _ohne_super(m.group(1), src) if m else None
        if m and m.group(1) == "NoneType":
            # Didaktik-Prüfung (da2, oc2): „fehlt self.next im Konstruktor?“ führte in die Irre – der Wert davor ist None
            wer = _attr_vor(m.group(2), line, src)
            msg = (f"„{wer or 'Der Wert'}“ ist None – darum gibt es kein .{m.group(2)}. Wurde es vorher gesetzt bzw. erzeugt "
                   f"(z. B. im Konstruktor)? Oder ist die Liste leer bzw. bist du schon am Ende angekommen? Prüfe vorher mit if … is None.")
        elif ohne_super:
            msg = (f"Ein Objekt der Klasse {m.group(1)} hat kein Attribut „{m.group(2)}“: {m.group(1)} erbt von {ohne_super}, "
                   f"ruft im Konstruktor aber nicht super().__init__(…) auf – darum werden die Attribute von {ohne_super} nie angelegt.")
        elif m and m.group(2).startswith("_") and "__" in m.group(2):
            msg = f"Auf das private Attribut kommt man von außen nicht heran – nimm eine Methode (z. B. get_…)."
        elif m:
            msg = f"Ein Objekt der Klasse {m.group(1)} hat kein Attribut und keine Methode „{m.group(2)}“. Tippfehler – oder fehlt self.{m.group(2)} = … im Konstruktor?"
        else:
            msg = str(ex)
    elif isinstance(ex, KeyError):
        k = str(ex.args[0]) if ex.args else "?"
        # CSV mit falschem Trennzeichen: Irgendwo liegt ein Dictionary, dessen Schlüssel die ganze Kopfzeile ist („Name;Zeit;Dorf“)
        tb, kopf = ex.__traceback__, None
        while tb is not None and kopf is None:
            for v in list(tb.tb_frame.f_locals.values()):
                if isinstance(v, dict) and any(isinstance(s, str) and k in s and (";" in s or "," in s) for s in v):
                    kopf = next(s for s in v if isinstance(s, str) and k in s)
                    break
            tb = tb.tb_next
        if kopf is not None:
            msg = f"Den Schlüssel „{k}“ gibt es nicht – die ganze Kopfzeile „{kopf}“ ist ein einziger Schlüssel geworden. Falsches Trennzeichen? csv.DictReader(datei, delimiter=\";\")"
        elif ";" in k or "," in k:
            msg = f"Den Schlüssel „{k}“ gibt es nicht – die ganze Kopfzeile ist ein einziger Schlüssel geworden. Falsches Trennzeichen? csv.DictReader(datei, delimiter=\";\")"
        elif "dateien" in _ERLAUBT:
            msg = f"Den Schlüssel „{k}“ gibt es in diesem Dictionary nicht. Stimmt die Schreibweise der Spalte (Groß/klein)?"
        else:
            # ohne Dateien (z. B. Automat delta[z][c]): kein Spalten-Text (Didaktik-Prüfung gc4)
            kk = ex.args[0] if ex.args else "?"
            msg = f"Den Schlüssel {kk!r} gibt es in diesem Wörterbuch nicht – prüfe vorher mit in, z. B. if {kk!r} in …:"
    elif isinstance(ex, FileNotFoundError):
        msg = str(ex)
    elif isinstance(ex, IndexError):
        msg = _index_de(str(ex), line, src)
    elif isinstance(ex, ZeroDivisionError):
        msg = "Teilen durch 0 geht nicht."
    elif isinstance(ex, RecursionError):
        msg = "Dein Befehl ruft sich selbst zu oft auf."
    else:
        msg = f"{type(ex).__name__}: {ex}"
    return [line, msg]

def _run(src):
    code, tree, err = _compile(src)
    if err:
        return json.dumps(err)
    ns = dict(_API)
    ns["__builtins__"] = _SAFE
    err = None
    sys.settrace(_tracer)
    try:
        exec(code, ns)
    except _Stop:
        pass
    except Exception as ex:
        err = _runtime_de(ex, src)
    finally:
        sys.settrace(None)
    return json.dumps(err)
`;

// --- 🌾 Kornspeicher (LK: Sortieren und Komplexität): Säcke mit Gewichten in einer Liste ---
// Die Werte sind _Wert (int mit gezählten Vergleichen), die Liste ist _Lager (gezählte Schreibzugriffe).
// So zählt das Spiel Vergleiche (V) und Schreibzugriffe (Z), ohne dass im Code etwas extra stehen muss.
// art "karten": Kartenspiel aus Kurs 2.2.1 – die Säcke stehen in der Liste a, aber verdeckt: vergleichen (a[i] > a[j]) und tauschen
// (mit temp) schreiben die Schüler selbst (Nutzerwunsch 2026-11-13: keine fertigen Befehle vergleiche/tausche mehr); print zeigt nur „?“.
// art "funktion": eigene Funktion (z. B. bubblesort(a)) wird auf jeder Testliste aufgerufen.
// art "messen": Funktion auf wachsenden Listen, nur zählen (für das 🔬 Messlabor).
// Ereignisse (für die Wiedergabe) nur bei kleinen Listen: cmp i j, set i v, swap i j – mit Zeilennummer.
const SORT_PY = String.raw`
class _Zuviel(BaseException):
    pass

_S = {"v": 0, "z": 0, "t": 0, "ev": None, "lager": None, "zeilen": 0, "limit": 3000000}

def _pos(o):
    l = _S["lager"]
    if l is None:
        return -1
    for k in range(list.__len__(l)):
        if list.__getitem__(l, k) is o:
            return k
    return -1

def _cmp(a, b):
    _S["v"] += 1
    ev = _S["ev"]
    if ev is not None and len(ev) < 4000:
        ev.append(["cmp", _pos(a), _pos(b), _line()])

# Gegenstück eines Vergleichs als nackte Zahl (int mit float vergleichen bleibt richtig, None/Text bleiben, wie sie sind)
def _roh(o):
    if isinstance(o, int):
        return int(o)
    if isinstance(o, float):
        return float(o)
    return o

class _Wert(int):
    __hash__ = int.__hash__
    def __lt__(s, o): _cmp(s, o); return int(s) < _roh(o)
    def __gt__(s, o): _cmp(s, o); return int(s) > _roh(o)
    def __le__(s, o): _cmp(s, o); return int(s) <= _roh(o)
    def __ge__(s, o): _cmp(s, o); return int(s) >= _roh(o)
    def __eq__(s, o): _cmp(s, o); return int(s) == _roh(o)
    def __ne__(s, o): _cmp(s, o); return int(s) != _roh(o)
    # Didaktik-Prüfung 2026-11-14: int(x), x + 0, abs(x) … lieferten nackte ints → Vergleiche ungezählt.
    # Rechnen mit einem Gewicht ergibt wieder ein gezähltes Gewicht (_Wert bzw. _FWert).
    # if d: / not d / x and y prüft „≠ 0“ – das ist auch ein Vergleich (sonst ginge if a[i] - a[j]: ungezählt)
    def __bool__(s): _cmp(s, 0); return int(s) != 0
    real = property(lambda s: s)
    numerator = property(lambda s: s)
    def conjugate(s): return s

class _FWert(float):
    __hash__ = float.__hash__
    def __lt__(s, o): _cmp(s, o); return float(s) < _roh(o)
    def __gt__(s, o): _cmp(s, o); return float(s) > _roh(o)
    def __le__(s, o): _cmp(s, o); return float(s) <= _roh(o)
    def __ge__(s, o): _cmp(s, o); return float(s) >= _roh(o)
    def __eq__(s, o): _cmp(s, o); return float(s) == _roh(o)
    def __ne__(s, o): _cmp(s, o); return float(s) != _roh(o)
    def __bool__(s): _cmp(s, 0); return float(s) != 0
    real = property(lambda s: s)
    def conjugate(s): return s

def _gezaehlt(x):
    if type(x) is int:
        return _Wert(x)
    if type(x) is float:
        return _FWert(x)
    if type(x) is tuple:
        return tuple(_gezaehlt(y) for y in x)
    return x

def _rechnen(cls, name):
    basis = getattr(cls.__mro__[1], name)
    def f(s, *a):
        return _gezaehlt(basis(s, *a))
    f.__name__ = name
    setattr(cls, name, f)

for _n in ("__add__", "__radd__", "__sub__", "__rsub__", "__mul__", "__rmul__", "__floordiv__", "__rfloordiv__",
           "__truediv__", "__rtruediv__", "__mod__", "__rmod__", "__pow__", "__rpow__", "__divmod__", "__rdivmod__",
           "__neg__", "__pos__", "__abs__", "__round__", "__trunc__", "__floor__", "__ceil__"):
    _rechnen(_Wert, _n)
    _rechnen(_FWert, _n)
for _n in ("__and__", "__rand__", "__or__", "__ror__", "__xor__", "__rxor__", "__lshift__", "__rlshift__", "__rshift__", "__rrshift__", "__invert__"):
    _rechnen(_Wert, _n)

# int(…) und float(…) im Spielercode: aus einem Gewicht wird wieder ein gezähltes Gewicht (sonst wären Vergleiche danach unsichtbar).
# __int__ selbst darf in Python keinen int-Untertyp liefern – darum ersetzen wir den Namen int/float im Namensraum.
class _ZahlTyp(type):
    def __instancecheck__(cls, x): return isinstance(x, cls._echt)
    def __subclasscheck__(cls, c): return issubclass(c, cls._echt)
    def __call__(cls, *a, **k):
        if len(a) == 1 and not k and isinstance(a[0], (_Wert, _FWert)):
            if type(a[0]) is (_Wert if cls._echt is int else _FWert):
                return a[0]   # gleicher Sack bleibt gleicher Sack (Wiedergabe markiert ihn weiter)
            return _Wert(int(a[0])) if cls._echt is int else _FWert(float(a[0]))
        return cls._echt(*a, **k)
class _int(metaclass=_ZahlTyp):
    _echt = int
class _float(metaclass=_ZahlTyp):
    _echt = float
_int.__name__ = "int"; _float.__name__ = "float"

class _Lager(list):
    def __setitem__(s, i, v):
        if type(v) is int:
            v = _Wert(v)
        list.__setitem__(s, i, v)
        if isinstance(i, int):
            _S["z"] += 1
            ev = _S["ev"]
            if ev is not None and len(ev) < 4000:
                ev.append(["set", i % list.__len__(s), int(v), _line()])

# Kurzform eines Werts für den Aufrufstapel: Listen als [1, 2, 3], höchstens 12 Einträge
def _kurz(x):
    if isinstance(x, list):
        t = [str(int(y)) if isinstance(y, int) else "?" for y in list.__iter__(x)]
        return "[" + ", ".join(t[:12]) + (", …" if len(t) > 12 else "") + "]"
    if isinstance(x, bool) or x is None:
        return str(x)
    if isinstance(x, int):
        return str(int(x))
    return "…"

def _tiefe(frame):
    t = 0
    while frame is not None:
        if frame.f_code.co_filename == _FILE and frame.f_code.co_name != "<module>":
            t += 1
        frame = frame.f_back
    return t

def _sort_tracer(frame, event, arg):
    if frame.f_code.co_filename == _FILE:
        if event == "line":
            _S["zeilen"] += 1
            if _S["zeilen"] > _S["limit"]:
                raise _Zuviel()
        elif event in ("call", "return") and frame.f_code.co_name != "<module>":
            ev = _S["ev"]
            if ev is not None and len(ev) < 4000:
                c = frame.f_code
                if event == "call":
                    # die ganze Liste selbst nur als Namen zeigen (sonst stünde sie in jeder Zeile des Stapels)
                    args = ", ".join(n if frame.f_locals.get(n) is _S["lager"] else f"{n}={_kurz(frame.f_locals.get(n))}" for n in c.co_varnames[:c.co_argcount])
                    ev.append(["call", c.co_name, _tiefe(frame), args, frame.f_lineno])
                else:
                    ev.append(["ret", c.co_name, _tiefe(frame), _kurz(arg), frame.f_lineno])
    return _sort_tracer

def _ausfuehren(fn):
    _S["zeilen"] = 0
    sys.settrace(_sort_tracer)
    try:
        return fn(), None
    except _Zuviel as ex:
        zeile = 0
        for fr in traceback.extract_tb(ex.__traceback__):
            if fr.filename == _FILE:
                zeile = fr.lineno
        return None, [zeile, "Dein Programm braucht viel zu viele Schritte – steckt es in einer Endlosschleife?"]
    except RecursionError as ex:
        zeile = 0
        for fr in traceback.extract_tb(ex.__traceback__):
            if fr.filename == _FILE:
                zeile = fr.lineno
                break
        return None, [zeile, "Deine Funktion ruft sich immer wieder selbst auf und hört nie auf – fehlt der Basisfall, oder wird die Aufgabe nicht kleiner?"]
    except Exception as ex:
        return None, _runtime_de(ex, _S_QUELLE[0])
    finally:
        sys.settrace(None)

def _s_print(*x, sep=" ", end=""):
    if len(_S["aus"]) < 200:
        # Kartenspiel: Gewichte bleiben verdeckt (sonst könnte man einfach nachsehen)
        _S["aus"].append(sep.join(("?" if _S.get("verdeckt") else str(y if isinstance(y, _FWert) else int(y))) if isinstance(y, (_Wert, _FWert)) else ("[…]" if _S.get("verdeckt") and isinstance(y, list) else str(y)) for y in x))
_SORT_SAFE = dict(_SAFE)
_SORT_SAFE["print"] = _s_print
_SORT_SAFE["sorted"] = _b.sorted
_SORT_SAFE["sum"] = _b.sum
_SORT_SAFE["int"] = _int
_SORT_SAFE["float"] = _float
# 🔧 Werkstatt (OOP): class braucht __build_class__; dazu super, isinstance, hasattr
for _k in ("__build_class__", "super", "isinstance", "hasattr", "object", "dict", "enumerate", "FileNotFoundError", "ord", "chr", "pow", "divmod",
           "set", "tuple", "zip", "reversed", "any", "all", "map", "filter"):
    _SORT_SAFE[_k] = getattr(_b, _k)

# 🗄️ LK Daten: Dateien nur im Speicher (_S["dateien"] = {pfad: text}); import nur csv und json
import io as _io, csv as _csvmod
class _Schreibdatei(_io.StringIO):
    def __init__(self, pfad, alt):
        super().__init__()
        self._pfad = pfad
        if alt:
            self.write(alt)
    def close(self):
        if not self.closed:
            _S["dateien"][self._pfad] = self.getvalue()
        super().close()
def _open(pfad, modus="r", newline=None, encoding=None, **_):
    d = _S.setdefault("dateien", {})
    if "w" in modus or "a" in modus:
        return _Schreibdatei(pfad, d.get(pfad, "") if "a" in modus else "")
    if pfad not in d:
        raise FileNotFoundError(f"Die Datei „{pfad}“ gibt es nicht. Vorhanden: {', '.join(d) or 'keine'}")
    return _io.StringIO(d[pfad].lstrip("﻿") if encoding == "utf-8-sig" else d[pfad])
def _import(name, *a, **k):
    if name in ("csv", "json"):
        return _csvmod if name == "csv" else json
    raise ImportError("Im Spiel gibt es nur import csv und import json.")
_SORT_SAFE["open"] = _open
_SORT_SAFE["__import__"] = _import

# Ergebnis als einfacher JSON-Wert (Zahl, Text, Liste, Dict) – für Aufgaben, deren Ergebnis keine sortierte Liste ist
def _plain(x, t=0):
    if t > 6:
        return None
    if isinstance(x, bool) or x is None or isinstance(x, str):
        return x
    if isinstance(x, int):
        return int(x)
    if isinstance(x, float):
        x = float(x)   # _FWert → float (sonst zählten die Prüfungen hier als Vergleiche)
        return x if x == x and abs(x) != float("inf") else None
    if isinstance(x, (list, tuple)):
        return [_plain(y, t + 1) for y in list(list.__iter__(x) if isinstance(x, list) else x)[:400]]
    if isinstance(x, dict):
        return {str(k): _plain(v, t + 1) for k, v in list(x.items())[:400]}
    return str(x)

# auftrag: {art, funktion, listen, aufruf, groessen, erzeuge, ereignisse}
def _sort(src, auftrag_json):
    a = json.loads(auftrag_json)
    _S_QUELLE[0] = src
    code, tree, err = _compile(src)
    if err:
        return json.dumps({"err": err})
    ns = {"__name__": "werkstatt"}   # class-Anweisungen brauchen __name__
    ns["__builtins__"] = _SORT_SAFE
    _S["verdeckt"] = a["art"] == "karten"
    # 🔭 Sternwarte: Daten (Monster, Punkte …) und Hilfscode der Aufgabe (z. B. die k-Means-Schleife), nicht im Code der Schüler
    ns.update(a.get("daten") or {})
    _S["ev"] = None; _S["lager"] = None; _S["aus"] = []
    _S["dateien"] = dict(a.get("dateien") or {})
    if a.get("vorspann"):
        try:
            exec(compile(a["vorspann"], "<vorspann>", "exec"), ns)
        except Exception as ex:
            return json.dumps({"err": [0, "Vorspann: " + str(ex)]})
    def start():
        exec(code, ns)
    if a["art"] != "karten":
        _, err = _ausfuehren(start)
        if err:
            return json.dumps({"err": err})
        f = a.get("funktion")
        if f and not callable(ns.get(f)):
            return json.dumps({"err": [1, f"Es fehlt die Funktion {f}. Sie beginnt so: def {f}(a):"]})
    laeufe = []
    for k, liste in enumerate(a["listen"]):
        lager = _Lager(_Wert(x) for x in liste)
        _S.update(v=0, z=0, t=0, lager=lager, ev=[] if a.get("ereignisse", True) else None, aus=[], dateien=dict(a.get("dateien") or {}))
        if a["art"] == "karten":
            ns["a"] = lager   # die verdeckten Säcke
            erg, err = _ausfuehren(start)
        else:
            umgebung = dict(ns); umgebung["a"] = lager; umgebung["n"] = len(liste)
            aufruf = (a.get("aufrufe") or [None] * (k + 1))[k] or a.get("aufruf") or (a["funktion"] + "(a)")
            erg, err = _ausfuehren(lambda: eval(aufruf, umgebung))
        ergebnis = erg if isinstance(erg, list) and a.get("rueckgabe", True) else lager
        try:
            ende = [int(x) for x in list.__iter__(ergebnis)]
        except Exception:
            ende = None
        laeufe.append({"v": _S["v"], "z": _S["z"], "t": _S["t"], "ev": _S["ev"], "ende": ende,
                       "wert": _plain(erg),
                       "err": err, "aus": _S["aus"]})
    _S["lager"] = None; _S["ev"] = None
    return json.dumps({"laeufe": laeufe})
`;

const PY = { bereit: false, fehler: null };

// --- 📜 SQL für das Archiv (Burg 9): SQLite aus vendor/pyodide/sqlite3-1.0.0.zip, erst beim ersten Auftrag geladen ---
// _sql(setup, src, pruef): frische Datenbank aus setup, dann die Anweisungen der Schüler (durch ; getrennt).
// Ergebnis = die letzte Abfrage mit Spalten – oder, wenn pruef gesetzt ist (Daten ändern), die Prüfabfrage danach.
const SQL_PY = `
import sqlite3, json, re

def _sql_de(msg):
    regeln = [
        (r"no such column: (.+)", "Die Spalte „{0}“ gibt es nicht. Schau in der Tabellenübersicht nach den Namen."),
        (r"no such table: (.+)", "Die Tabelle „{0}“ gibt es nicht. Schau in der Tabellenübersicht nach."),
        (r'near "(.+)": syntax error', "Da stimmt die Schreibweise nicht – kurz vor „{0}“."),
        (r"ambiguous column name: (.+)", "Die Spalte „{0}“ gibt es in mehreren Tabellen. Schreib tabelle.{0}, z. B. bauern.{0}."),
        (r"table \\w+ has (\\d+) columns but (\\d+) values were supplied", "Die Tabelle hat {0} Spalten, du gibst aber {1} Werte an."),
    ]
    for muster, text in regeln:
        m = re.search(muster, msg)
        if m:
            return text.format(*m.groups())
    if "incomplete input" in msg:
        return "Die Abfrage ist unvollständig. Fehlt am Ende noch etwas?"
    if "misuse of aggregate" in msg:
        return "COUNT, SUM, AVG, MIN und MAX dürfen nicht im WHERE stehen."
    if "UNIQUE constraint" in msg:
        return "Diese Nummer gibt es schon – jede id darf nur einmal vorkommen."
    if "unrecognized token" in msg:
        return "Ein Zeichen passt hier nicht. Stehen Texte in einfachen Anführungszeichen 'so'?"
    return "SQL-Fehler: " + msg

def _sql(setup, src, pruef):
    con = sqlite3.connect(":memory:")
    con.executescript(setup)
    teile = [t.strip() for t in src.split(";") if t.strip() and not t.strip().startswith("--")]
    if not teile:
        return json.dumps({"fehler": "Schreib zuerst eine Abfrage."})
    cols, rows = [], []
    try:
        for t in teile:
            cur = con.execute(t)
            if cur.description:
                cols = [d[0] for d in cur.description]
                rows = cur.fetchmany(500)
        if pruef:
            cur = con.execute(pruef)
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
    except Exception as ex:
        msg = str(ex)
        m = re.match(r"no such column: (\\w+)$", msg)
        if m:
            # Didaktik-Prüfung: WHERE art = ratte → „Spalte ratte gibt es nicht“ – gemeint war der Text 'ratte'
            spalten = set()
            try:
                for (tab,) in con.execute("SELECT name FROM sqlite_master WHERE type = 'table'").fetchall():
                    spalten |= {r[1].lower() for r in con.execute(f"PRAGMA table_info({tab})").fetchall()}
            except Exception:
                pass
            w = m.group(1)
            vergleich = re.search(r"(=|<>|!=|<|>|\\bLIKE|\\bIN\\s*\\([^)]*?)\\s*" + re.escape(w) + r"\\b", src, re.I)
            if w.lower() not in spalten and vergleich:
                return json.dumps({"fehler": f"Die Spalte „{w}“ gibt es nicht. Meinst du den Text '{w}'? Texte stehen in SQL in einfachen Anführungszeichen, z. B. WHERE spalte = '{w}'."})
        return json.dumps({"fehler": _sql_de(msg)})
    if not cols:
        return json.dumps({"fehler": "Deine Anweisung liefert keine Tabelle. Fang mit SELECT an."})
    return json.dumps({"cols": cols, "rows": rows})
`;
async function sqlBereit() {
  if (PY.sql) return true;
  // Beim Start (gespeicherter Auftrag) lädt Python evtl. noch
  for (let i = 0; !PY.py && !PY.fehler && i < 600; i++) await new Promise((ok) => setTimeout(ok, 200));
  try {
    await PY.py.loadPackage('sqlite3');
    PY.py.runPython(SQL_PY);
    const f = PY.py.globals.get('_sql');
    PY.sql = (setup, src, pruef = '') => JSON.parse(f(setup, src, pruef));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function initPython(js) {
  try {
    const py = await loadPyodide({ indexURL: 'vendor/pyodide/' });
    PY.py = py;
    py.globals.set('_js', js);
    py.runPython(PRELUDE);
    py.runPython(SORT_PY);
    const check = py.globals.get('_check'), run = py.globals.get('_run'), erlaubt = py.globals.get('_set_erlaubt'), sort = py.globals.get('_sort');
    PY.sort = (src, sprache, auftrag) => { erlaubt(JSON.stringify(sprache)); return JSON.parse(sort(src, JSON.stringify(auftrag))); };
    PY.check = (src, sprache) => { erlaubt(JSON.stringify(sprache)); return JSON.parse(check(src)); };
    PY.run = (src, sprache) => { erlaubt(JSON.stringify(sprache)); return JSON.parse(run(src)); };
    PY.bereit = true;
  } catch (e) {
    PY.fehler = String(e);
    console.error(e);
  }
}
