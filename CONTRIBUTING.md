# Contributing

Rollwright is currently a private/local prototype. Keep changes small, explicit, and easy to review.

## Development

```powershell
npm run dev
```

Open `http://localhost:4173`.

## Change Rules

- Preserve Version 1 as the current local browser MVP unless a task explicitly targets V1.
- Put Version 2 planning, desktop, AI, and competitor-parity work under `docs/v2` until the desktop scaffold exists.
- Keep deterministic flooring math separate from AI features.
- Do not commit model weights, customer plans, local databases, or generated installer packets.
- Use integer measurement units internally for optimizer decisions.

## Before Opening A PR

- Run `node --check src/app.js`.
- Run `node --check server.mjs`.
- Run `npm run dev` and verify the app responds.
- Update docs when changing product behavior.
