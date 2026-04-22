# Rollwright V2 Roadmap

The goal is to preserve the working V1 browser MVP while building V2 as a desktop/local-AI product line.

## Phase 0: Repo And Product Foundation

Status: in progress

Deliverables:

- V1 baseline docs.
- V2 design doc.
- competitor parity matrix.
- desktop/local-AI architecture.
- GitHub templates.
- clear README entry points.

Exit criteria:

- Repo can be published without model files or private data.
- New contributors understand V1 versus V2.

## Phase 1: V2 Desktop Skeleton

Deliverables:

- Tauri v2 app scaffold.
- React/TypeScript shell.
- SQLite storage.
- app navigation shell:
  - ribbon
  - material library
  - floor canvas
  - roll map
  - inspector
  - AI Review tab
- import/export project archive.

Exit criteria:

- Desktop app opens locally.
- Can create a project and persist it in SQLite.
- Can display the V1 demo surfaces in the V2 shell.

## Phase 2: Local AI Runtime

Deliverables:

- `llama-server` sidecar integration.
- model manager.
- Gemma 4 model registry.
- start/stop/health check.
- local chat panel.
- plan text analyzer.
- schema-validated product extraction.

Exit criteria:

- User can start local AI.
- User can paste plan text and extract draft products.
- User can approve/edit/reject products.
- Approved products persist locally.
- Missing roll width blocks optimization.

## Phase 3: Material Catalog And Missing Scope Board

Deliverables:

- searchable material cards.
- AI Draft/Approved states.
- missing scope board.
- source references.
- finish tag conflict detection.
- product usage totals.

Exit criteria:

- User can build a trusted project catalog from AI draft data and manual edits.
- Every untrusted AI value remains visibly unapproved.

## Phase 4: Competitor-Parity Takeoff Surface

Deliverables:

- ribbon command groups.
- dimension-first room creation.
- polygon room editor.
- quick stairs and quick room.
- material assignment from library.
- pattern fill overlays.
- annotation tools.
- zoom tools and saved views.
- edge/sides panel.

Exit criteria:

- User can perform a basic takeoff without returning to V1.
- User can assign materials and view product-specific plan tabs.

## Phase 5: Rollwright Differentiator

Deliverables:

- robust cut island generator.
- roll map viewport.
- synchronized floor/roll selection.
- multiple packing strategies.
- seam scoring.
- pattern phase scoring.
- stair worksheet.
- useful remnant scoring.
- FieldSense explanation engine.

Exit criteria:

- V2 can match or exceed V1 optimizer behavior.
- User can compare Ranked Plans: Balanced Pro, Lowest Waste, Cleanest Seams, Pattern First, Installer Friendly, Remnant Smart.

## Phase 6: Document Intake

Deliverables:

- PDF import.
- page thumbnails.
- OCR text extraction.
- page classification.
- OCR search.
- heatmap.
- background AI jobs.
- re-analyze with memory.

Exit criteria:

- User can import a plan set.
- AI can identify likely flooring pages and draft catalog/scope items.
- Human corrections survive re-analysis.

## Phase 7: Export Package

Deliverables:

- installer packet PDF/HTML.
- customer quote.
- roll map.
- seam map.
- stair worksheet.
- missing scope report.
- field verification checklist.

Exit criteria:

- An installer can work from the export.
- A customer can receive a cleaner quote without internal installer clutter.

## Backlog

- 3D preview.
- mobile field verification.
- photo capture for completed seams.
- commercial phase planning.
- vendor pricing imports.
- win-rate analytics.
- ITB scoring.
- team collaboration.
- cloud sync as an optional mode.
