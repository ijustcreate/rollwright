# Rollwright V1 Baseline

Status: working local browser MVP

Date captured: 2026-04-22

## Purpose

Version 1 is the current shareable local web app. It proves the core Rollwright idea: flooring surfaces can be unfolded into roll U/V space and reviewed with practical installer warnings.

V1 is intentionally not a full CAD system and not a production-auth SaaS product.

## How To Run

```powershell
npm run dev
```

Open:

```text
http://localhost:4173
```

Demo account:

```text
steve / rollwright
```

Directly opening `index.html` also works for quick demos, but the local server is the preferred path for sharing on a LAN.

## Current Features

- Local login and account creation.
- Browser `localStorage` persistence.
- Demo project seeded on first login.
- Material profile:
  - roll width
  - available roll length
  - material type
  - directional pile
  - rotation allowed
  - pattern enabled
  - repeat width/length
  - match type
  - drop offset
  - cut margin
  - trim margin
  - phase tolerance
- Surface entry:
  - rectangular room
  - L-shaped room
  - hallway
  - closet
  - landing
  - stair run
- Stair run entry:
  - stair count
  - tread width/depth
  - riser height
  - waterfall/cap-and-band/runner mode
  - stair allowance
  - pile direction
- Packing modes:
  - Balanced Pro
  - Lowest Waste
  - Cleanest Seams
  - Pattern First
  - Installer Friendly
  - Remnant Smart
- SVG floor topology view.
- SVG roll U/V space view.
- Synchronized selection between surfaces and cuts.
- FieldSense warnings.
- Manual override markers:
  - lock seam
  - forbid seam
  - preserve remnant
  - lock cut placement
- Metrics:
  - material used
  - waste percentage
  - usable remnant percentage
  - seam risk
  - pattern risk
  - install difficulty
  - confidence
- JSON import/export.
- Installer packet HTML export.

## Deliberate Limitations

- Login is local-only and not secure for hosted use.
- Projects are stored per browser/device.
- Geometry is simplified to parametric surfaces, not full polygon CAD editing.
- PDF blueprint import is not implemented.
- AI analysis is not implemented.
- Roll packing is deterministic MVP packing, not a full constraint solver.
- Pattern phase visualization exists as a repeat grid, but final pattern matching still requires field verification.
- Export is HTML/JSON, not a polished PDF pipeline.

## Technical Shape

```text
index.html
server.mjs
src/
  app.js
  styles.css
```

V1 has no build step and no runtime dependencies beyond Node for the local static server.

## Preserve V1

Future V2 work should not remove V1 until the desktop/local-AI version can do these minimum things:

- load or create a project
- define materials
- add rooms and stairs
- generate cut islands
- render floor view and roll view
- show FieldSense warnings
- export an installer packet

If V2 becomes a separate app, V1 should remain available as the lightweight browser demo.
