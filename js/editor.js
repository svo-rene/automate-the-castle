// Code-Editor auf Basis von CodeMirror 6 (Module über die Import-Map in index.html)
import { EditorState, StateField, StateEffect, RangeSet, Compartment, Prec } from '@codemirror/state';
import { EditorView, Decoration, keymap, lineNumbers, drawSelection, GutterMarker, gutterLineClass } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentLess, indentMore, insertNewlineAndIndent } from '@codemirror/commands';
import { indentOnInput, indentUnit, syntaxHighlighting, HighlightStyle, bracketMatching } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion } from '@codemirror/autocomplete';
import { python } from '@codemirror/lang-python';
import { tags as t } from '@lezer/highlight';

const style = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.operatorKeyword], color: '#ff8fd8', fontWeight: '600' },
  { tag: [t.string], color: '#ffe08a' },
  { tag: [t.number, t.bool, t.null], color: '#ffb86b' },
  { tag: [t.comment], color: '#6f80b0', fontStyle: 'italic' },
  { tag: [t.function(t.variableName)], color: '#7cc4ff' },
  { tag: [t.operator, t.punctuation, t.paren], color: '#c3cdf0' },
]);

const theme = EditorView.theme({
  '&': { height: '100%', color: '#e6edff', backgroundColor: 'transparent', fontSize: 'var(--code-size)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: "'JetBrains Mono', ui-monospace, Consolas, monospace", lineHeight: '1.55' },
  '.cm-content': { padding: '10px 0', caretColor: '#ffd84a' },
  '.cm-cursor': { borderLeft: '2px solid #ffd84a' },
  '.cm-gutters': { backgroundColor: '#0b1430', color: '#4f6194', border: 'none' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 6px', minWidth: '28px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: '#2f55a8 !important' },
  '.cm-line-cur': { backgroundColor: 'rgba(255, 216, 74, .16)' },
  '.cm-line-bad': { backgroundColor: 'rgba(255, 90, 90, .25)' },
  '.cm-gutterElement.g-cur': { color: '#0b1226', backgroundColor: '#ffd84a', borderRadius: '4px' },
  '.cm-gutterElement.g-bad': { color: '#ff7b7b' },
  // Einrückung in den Schleifenfarben wie im Block-Editor (SCHLEIFEN_FARBE in tag.js)
  '.cm-ein0': { boxShadow: 'inset 2px 0 0 #f0a03a', backgroundColor: 'rgba(240, 160, 58, .07)' },
  '.cm-ein1': { boxShadow: 'inset 2px 0 0 #b67aff', backgroundColor: 'rgba(182, 122, 255, .07)' },
  '.cm-ein2': { boxShadow: 'inset 2px 0 0 #3fc9a0', backgroundColor: 'rgba(63, 201, 160, .07)' },
  '.cm-tooltip.cm-tooltip-autocomplete': { backgroundColor: '#14214a', border: '1px solid #3a4f8f', borderRadius: '8px' },
  '.cm-tooltip-autocomplete > ul > li': { padding: '3px 10px', fontFamily: "'JetBrains Mono', ui-monospace, Consolas, monospace" },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: '#2f55a8', color: '#fff' },
  '.cm-completionDetail': { color: '#8fa3d8', fontStyle: 'normal', marginLeft: '10px' },
}, { dark: true });

// Je 4 Leerzeichen Einrückung ein farbiger Streifen: so sieht man, was in welcher Schleife steht
const einDeko = [0, 1, 2].map((i) => Decoration.mark({ class: 'cm-ein' + i }));
const einrueckung = (state) => {
  const out = [];
  for (let n = 1; n <= state.doc.lines; n++) {
    const line = state.doc.line(n), tiefe = Math.floor(line.text.match(/^ */)[0].length / 4);
    for (let l = 0; l < tiefe; l++) out.push(einDeko[l % 3].range(line.from + 4 * l, line.from + 4 * l + 4));
  }
  return Decoration.set(out);
};

// Vorschläge beim Tippen: Befehle des Hofs und eigene Variablen (Liste kommt aus tag.js: window.editorWoerter)
function vorschlaege(ctx) {
  const w = ctx.matchBefore(/\w+/);
  if (!w || (w.to - w.from < 2 && !ctx.explicit)) return null;
  const vor = ctx.state.doc.lineAt(ctx.pos).text.slice(0, w.from - ctx.state.doc.lineAt(ctx.pos).from);
  if (vor.includes('#') || (vor.split('"').length % 2 === 0)) return null;   // nicht in Kommentaren und Texten
  const liste = window.editorWoerter ? window.editorWoerter(ctx.state.doc.toString()) : [];
  return { from: w.from, options: liste.map((o) => ({ ...o, apply: einsetzen(o.text) })), validFor: /^\w*$/ };
}
// Baustein einsetzen; ¦ = Cursor danach
const einsetzen = (text) => (view, c, from, to) => {
  const at = text.indexOf('¦'), body = text.replace(/¦/g, '');   // mehrere ¦ (Lücken): alle weg, Cursor ans erste
  view.dispatch({ changes: { from, to, insert: body }, selection: { anchor: from + (at < 0 ? body.length : at) }, userEvent: 'input.complete' });
};

// Markierte Zeilen: cur = gerade ausgeführt, bad = Fehler
const setMarks = StateEffect.define();
const marks = StateField.define({
  create: () => ({ cur: 0, bad: 0 }),
  update: (v, tr) => {
    for (const e of tr.effects) if (e.is(setMarks)) v = e.value;
    return tr.docChanged && (v.bad || v.cur) ? { cur: 0, bad: 0 } : v;
  },
});
const lineDeco = { cur: Decoration.line({ class: 'cm-line-cur' }), bad: Decoration.line({ class: 'cm-line-bad' }) };
class Mark extends GutterMarker { constructor(c) { super(); this.elementClass = c; } }
const gutterMark = { cur: new Mark('g-cur'), bad: new Mark('g-bad') };
const markRanges = (state, kinds) => {
  const m = state.field(marks), out = [];
  for (const k of ['bad', 'cur']) {
    if (m[k] >= 1 && m[k] <= state.doc.lines) out.push(kinds[k].range(state.doc.line(m[k]).from));
  }
  return RangeSet.of(out.sort((a, b) => a.from - b.from));
};

// Vergessenen Doppelpunkt nach if/for/while … beim Enter ergänzen
function smartEnter(view) {
  const { state } = view, head = state.selection.main.head, line = state.doc.lineAt(head);
  if (head === line.to && /^\s*(if|elif|else|for|while|def)\b/.test(line.text) && !/:\s*$/.test(line.text)) {
    view.dispatch({ changes: { from: head, insert: ':' }, selection: { anchor: head + 1 }, userEvent: 'input' });
  }
  return insertNewlineAndIndent(view);
}
function tab(view) {
  view.dispatch(view.state.replaceSelection('    '), { scrollIntoView: true, userEvent: 'input' });
  return true;
}

// Nur im Editor scrollen, nie die ganze Seite (kein Springen)
const innerScroll = EditorView.scrollHandler.of((view, range) => {
  const sc = view.scrollDOM, box = sc.getBoundingClientRect();
  if (!box.height) return true;
  const b = view.lineBlockAt(range.head), off = view.documentTop - box.top + sc.scrollTop, m = 8;
  const top = off + b.top, bot = off + b.bottom;
  if (top - m < sc.scrollTop) sc.scrollTop = top - m;
  else if (bot + m > sc.scrollTop + sc.clientHeight) sc.scrollTop = bot + m - sc.clientHeight;
  return true;
});

window.createEditor = (parent, { doc, onChange }) => {
  const ro = new Compartment();
  let readOnly = false;
  const lock = () => [EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)];
  const extensions = [
    lineNumbers(), history(), drawSelection(), indentOnInput(), bracketMatching(), closeBrackets(),
    indentUnit.of('    '), EditorState.tabSize.of(4),
    python(), syntaxHighlighting(style), theme,
    marks, EditorView.decorations.compute([marks, 'doc'], (s) => markRanges(s, lineDeco)),
    gutterLineClass.compute([marks, 'doc'], (s) => markRanges(s, gutterMark)), innerScroll,
    EditorView.decorations.compute(['doc'], einrueckung),
    autocompletion({ override: [vorschlaege], icons: false, activateOnTyping: true }),
    Prec.high(keymap.of([{ key: 'Tab', run: tab, shift: indentLess }, { key: 'Enter', run: smartEnter }])),
    keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap]),
    EditorView.contentAttributes.of({ autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false' }),
    EditorView.updateListener.of((u) => { if (u.docChanged) onChange(u.state.doc.toString()); }),
  ];
  const make = (d) => EditorState.create({ doc: d, extensions: [extensions, ro.of(lock())] });
  const view = new EditorView({ parent, state: make(doc) });

  return {
    get value() { return view.state.doc.toString(); },
    set value(v) { view.setState(make(v)); },
    setReadOnly(on) {
      if (readOnly === on) return;
      readOnly = on;
      view.dispatch({ effects: ro.reconfigure(lock()) });
    },
    // Baustein als eigene Zeile einfügen: in einer leeren Zeile dort, sonst in einer neuen Zeile darunter
    // (mit derselben Einrückung; nach einer Zeile mit Doppelpunkt eine Stufe tiefer). ¦ = Cursor danach.
    insertLine(text) {
      if (readOnly) return;
      const { state } = view, line = state.doc.lineAt(state.selection.main.head);
      let ind = line.text.match(/^\s*/)[0];
      // else/elif gehören so weit links wie ihr if: das nächste if/elif darüber mit kleinerer Einrückung suchen
      if (/^(else|elif)\b/.test(text)) {
        for (let n = line.number; n >= 1; n--) {
          const t = state.doc.line(n).text, i = t.match(/^\s*/)[0];
          if (/^\s*(if|elif)\b/.test(t) && (i.length < ind.length || n === line.number)) { ind = i; break; }
        }
      }
      let from = line.from, to = line.to, pre = '';
      if (line.text.trim()) {
        from = to = line.to;
        pre = '\n' + ind + (/:\s*$/.test(line.text) && !/^(else|elif)\b/.test(text) ? '    ' : '');
      } else pre = ind;
      const at = text.indexOf('¦'), body = text.replace(/¦/g, '');
      const insert = pre + body;
      view.dispatch({ changes: { from, to, insert }, selection: { anchor: from + pre.length + (at < 0 ? body.length : at) },
        scrollIntoView: true, userEvent: 'input' });
      view.focus();
    },
    setMarks(cur, bad) {
      const m = view.state.field(marks);
      if (m.cur === cur && m.bad === bad) return;
      const effects = [setMarks.of({ cur, bad })], n = cur || bad;
      if (n >= 1 && n <= view.state.doc.lines) effects.push(EditorView.scrollIntoView(view.state.doc.line(n).from, { y: 'nearest' }));
      view.dispatch({ effects });
    },
    focus() { view.focus(); },
    // ⌨️ Tipp-Hilfen (Selbst-Tippen-Höfe am Handy): Zeichen an der Schreibmarke einfügen (¦ = Schreibmarke danach),
    // Zeile ein- bzw. ausrücken – keine fertigen Befehle
    insertText(text) {
      if (readOnly) return;
      const at = text.indexOf('¦'), body = text.replace(/¦/g, ''), from = view.state.selection.main.from;
      view.dispatch(view.state.replaceSelection(body), { userEvent: 'input', scrollIntoView: true });
      if (at >= 0) view.dispatch({ selection: { anchor: from + at } });
      view.focus();
    },
    indent(mehr) {
      if (readOnly) return;
      (mehr ? indentMore : indentLess)(view);
      view.focus();
    },
  };
};
window.dispatchEvent(new Event('editor-bereit'));
