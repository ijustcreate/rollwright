# V2 App Status

Status: working static prototype plus Tauri scaffold

## Run

```powershell
npm run dev:v2
```

Open:

```text
http://localhost:4173/v2/
```

## Implemented In Prototype

- Ribbon command system.
- Command search.
- Left vertical toolbar.
- Material library with smart badges.
- Active material group.
- CAD-style floor plan canvas.
- Roll U/V viewport.
- Pattern-space view toggle.
- Installer-space warning layer.
- Synchronized surface selection between floor and roll.
- Inspector with material intelligence.
- FieldSense warning cards.
- Missing Scope board.
- AI Review panel.
- Local AI endpoint status check.
- Plan text analyzer with fallback regex extraction.
- Draft product approval into catalog.
- Background AI job queue mock.
- JSON export.
- Installer packet HTML export.

## Implemented As Scaffold

- Tauri v2 config.
- Rust commands for:
  - `start_local_ai`
  - `stop_local_ai`
  - `local_ai_status`
- `llama-server` sidecar configuration path.
- `src-tauri/binaries/.gitkeep` placeholder.

## Not Yet Implemented

- Real Tauri build verification on this machine. Rust/Cargo is not installed here.
- Bundled `llama-server` binary.
- Gemma model download manager.
- SQLite persistence.
- PDF rendering.
- OCR heatmap.
- Vision-based automatic room tracing.
- Full polygon CAD editor.
- Full constraint solver.

## Next Build Step

Install Rust and Tauri prerequisites, then replace the static browser storage prototype with a Tauri-backed project repository and SQLite.
