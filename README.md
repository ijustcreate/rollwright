# Rollwright

Rollwright is a pattern-aware flooring takeoff and roll planning project.

The core idea: rooms, halls, closets, landings, treads, and risers are treated as connected flooring surfaces that can be unfolded into roll U/V space, scored for seam quality, pattern phase, pile direction, stair risk, waste, and installer sanity.

## Versions

### Version 1: Local Browser MVP

V1 is the working app in this repo today.

- local login
- browser project persistence
- material profiles
- room, hall, closet, landing, and stair entry
- packing modes
- floor topology view
- roll U/V view
- FieldSense warnings
- manual override markers
- JSON import/export
- installer packet HTML export

Read: [V1 Baseline](docs/v1/V1_BASELINE.md)

Run:

```powershell
npm run dev
```

Open:

```text
http://localhost:4173
```

Demo login:

```text
steve / rollwright
```

Directly opening `index.html` also works for quick demos, but the local server is better for sharing on the same network.

### Version 2: Desktop + Local AI Product Track

V2 is the planned next version. It keeps the useful parts of legacy flooring takeoff software, then adds Rollwright's differentiator:

- floor space
- roll space
- pattern space
- installer-risk space

Planned V2 direction:

- Tauri desktop app
- React/TypeScript UI
- SQLite local storage
- local Gemma model through a bundled llama.cpp server sidecar
- AI draft takeoff review
- smart catalog extraction
- missing scope board
- OCR search and heatmap
- deterministic roll optimizer
- installer-ready exports

Read:

- [V2 Design Doc](docs/v2/V2_DESIGN_DOC.md)
- [V2 Desktop And Local AI Architecture](docs/v2/V2_DESKTOP_AI_ARCHITECTURE.md)
- [Competitor Parity Matrix](docs/v2/COMPETITOR_PARITY_MATRIX.md)
- [V2 Roadmap](docs/v2/V2_ROADMAP.md)
- [AI Guardrails](docs/v2/AI_GUARDRAILS.md)
- [Data Model Sketch](docs/v2/DATA_MODEL_SKETCH.md)
- [V2 Implementation Prompt](docs/v2/V2_IMPLEMENTATION_PROMPT.md)

## Share On Your Local Network

The local server binds to `0.0.0.0`, so another device on the same network can use this machine's local IP address:

```text
http://YOUR_LOCAL_IP:4173
```

If the page does not load from another device, Windows Firewall is usually the first thing to check.

## Important Auth Note

The V1 login system is for local prototype use only. Accounts and projects are stored in browser `localStorage`, so each browser/device has its own data.

Before hosting this publicly, replace local auth/storage with a hosted backend such as Supabase, Firebase, Auth.js with a database, or a custom API.

For V2 desktop, the planned storage path is local SQLite with explicit approval for AI-extracted data.

## GitHub Safety

Do not commit:

- customer plan sets
- bids, invoices, or contacts
- local databases
- `.env` files
- model weights
- generated installer packets

Large AI model files belong in local app data or a release/download flow, not in git.

## Verification

```powershell
node --check src/app.js
node --check server.mjs
npm run dev
```
