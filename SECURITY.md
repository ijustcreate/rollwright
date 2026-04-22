# Security

Rollwright V1 is a local prototype. Its login system stores accounts and projects in browser `localStorage`; it is not production authentication.

## Do Not Store In The Repo

- Customer plan sets.
- Bids, estimates, invoices, or contact lists.
- Local SQLite databases.
- AI model weights.
- API keys or `.env` files.

## V2 Security Direction

- Local-first desktop storage.
- Explicit user approval before AI-extracted data becomes trusted project data.
- No cloud upload for plan sets by default.
- Model files stored in the user's app data directory.
- Deterministic optimizer remains authoritative for dimensions, seam validity, pattern phase, stair logic, and roll packing.

Report security concerns privately to the project owner.
