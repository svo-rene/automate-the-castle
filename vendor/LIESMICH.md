# vendor/ – fremde Bibliotheken für den Offline-Betrieb

Das Spiel lädt nichts von fremden Servern. Alles hier ist unverändert heruntergeladen (2026-11-04):

| Ordner | Was | Version | Quelle | Lizenz |
|---|---|---|---|---|
| `pyodide/` | Python im Browser (nur Kern: `pyodide.js`, `pyodide.asm.js/.wasm`, `python_stdlib.zip`, `pyodide-lock.json`) | 0.26.4 | cdn.jsdelivr.net/pyodide/v0.26.4/full | MPL-2.0 |
| `pyodide/sqlite3-1.0.0.zip` | SQLite für das 📜 Archiv (Burg 9), wird erst beim ersten SQL-Auftrag geladen; SHA256 laut `pyodide-lock.json` geprüft (2026-11-08) | 0.26.4 | cdn.jsdelivr.net/pyodide/v0.26.4/full | MPL-2.0 / SQLite: Public Domain |
| `cm/` | CodeMirror 6 als npm-ESM, je Paket eine Datei; Abhängigkeiten laufen über die Import-Map in `index.html` | siehe Import-Map | cdn.jsdelivr.net/npm | MIT |
| `fonts/` | JetBrains Mono 400/600, Lilita One (nur latin + latin-ext) | – | Google Fonts | OFL-1.1 |

Neue Version: Dateien ersetzen, Dateinamen gleich lassen. Bei CodeMirror darf jedes Paket nur einmal vorkommen.
