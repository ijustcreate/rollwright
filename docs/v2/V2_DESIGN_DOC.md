# Rollwright V2 Design Doc

Status: planned product track

Date: 2026-04-22

## Product Position

Rollwright V2 should compete with legacy flooring takeoff programs at minimum capability, then win by adding the layer they do not make obvious:

- floor space: where the material goes
- roll space: where each cut comes from
- pattern space: how repeat, drop match, pile, and phase align
- installer space: whether the plan is actually sane in the field

The competitor UI is strong at CAD-style takeoff, product assignment, pattern fills, and reports. Rollwright must match those table-stakes workflows while making the cut plan, seam risk, pattern phase, stair logic, and installer warnings visible at the same time.

## Target User

The core user is a flooring estimator or installer. They are not buying a calculator; they need an editor that lets them override bad math with field judgment.

## Design Principles

- Build an editor, not a form dump.
- Keep drawing, product assignment, roll optimization, and warnings in one visible workflow.
- Treat every drawn room as a surface with material, direction, pattern, seam, priority, and topology metadata.
- Let AI assist extraction and explanation, but never let AI own final dimensions or cuts.
- Every AI result needs source, confidence, and approval state.
- Every risky optimizer choice needs a plain-English explanation.
- The installer can override the plan, and overrides become constraints.

## Minimum Competitor Parity

Rollwright V2 must support these baseline zones:

- Ribbon command system across the top.
- Product/material library on the left.
- Plan canvas in the middle.
- Inspector/warnings/edge properties on the right.
- Synchronized roll map view.

## Main App Zones

### 1. Ribbon Command System

Tabs:

- Home
- Seams
- Material Space
- Blueprint
- Stairs
- View
- Reports
- AI Review
- Help

Core requirements:

- Command search for actions like `add stair run`, `set pattern repeat`, `optimize roll`, `find CPT-1`, and `export installer packet`.
- Contextual ribbon groups based on selection.
- Beginner/Pro mode toggle.
- Tooltips that explain flooring consequences, not just software names.

### 2. Product And Material Library

The left panel replaces a cramped tree with searchable material cards.

Material card fields:

- material code
- manufacturer
- product type
- style/color
- category
- roll width or unit size
- pattern repeat
- match type and drop offset
- directional pile
- rotation allowed
- dye lot / roll number
- cost fields
- completeness status
- linked source page/spec note

Badges:

- Directional
- Patterned
- Drop Match
- No Rotate
- Stair Review
- Missing Roll Width
- Missing Repeat
- AI Draft
- Approved

Material library requirements:

- Search and filter products.
- Drag product onto a surface.
- Replace product in selected surfaces.
- Show usage totals per product.
- Show critical missing data before optimization.
- Support product dependencies later: pad, tack strip, transition metal, base, adhesive, grout.

### 3. Plan Canvas

The center workspace is CAD-like, but the objects are flooring surfaces, not just drawn lines.

Required tools:

- Select
- Pan
- Rectangle room
- L-shaped room
- Polygon room
- Hallway
- Closet
- Landing
- Stair run
- Runner/border
- Doorway/transition edge
- Forbidden seam zone
- Traffic zone
- Annotation
- Measure
- Fit view
- Zoom area

Surface metadata:

- material
- priority
- room role
- traffic level
- allowed pile directions
- preferred pile direction
- seam rules
- pattern origin
- pattern centerline
- topology connections
- installer notes

Canvas display:

- grid and major grid
- room IDs and names
- material fills
- pattern overlay
- pile arrows
- seam quality colors
- warning markers
- selected-surface cross-highlight into roll space

### 4. Roll / UV Space

V2 keeps Rollwright's differentiator visible: a synchronized roll-space viewport.

Requirements:

- U axis is roll width.
- V axis is roll length.
- Cut islands drawn with cut order, dimensions, pile arrows, and pattern phase.
- Remnants scored as trash, repair, closet, stair, future job, or high value.
- Selecting a floor surface highlights all source cuts.
- Selecting a cut highlights its floor surface.
- Pattern grid overlay follows material repeat and drop match.
- Locked cut placements are visible.

### 5. Pattern Space

Pattern tools become `Material Space`, not just tile fill.

Requirements:

- Pattern origin per surface.
- Pattern direction per surface.
- Pattern phase per cut.
- Standard, half-drop, quarter-drop, custom drop, and random profile states.
- Drop-match simulation across seams.
- Pattern-risk score per seam.
- Pattern mismatch warnings before roll optimization.
- Pattern-centered controls for rooms, halls, stairs, and runners.

### 6. Stair Tools

Stairs are a first-class module.

Required stair modes:

- waterfall
- cap-and-band / Hollywood
- runner
- custom

Requirements:

- stair wizard
- tread/riser dimensions
- stair count
- landing links
- side reveals for runners
- pattern centering on runner/tread
- no seam on stair nose by default
- stair worksheet export
- visual unfolding of tread/riser surfaces into cut islands

### 7. Edge / Sides Panel

Every boundary edge should be selectable and typed.

Edge types:

- wall
- doorway
- open transition
- threshold
- stair edge
- landing edge
- closet
- preferred seam
- forbidden seam
- manual

Edge properties:

- seam allowed
- seam preferred
- pile continuity required
- pattern continuity required
- transition product
- installer note
- field verify flag

### 8. Annotation System

Annotations are structured job knowledge, not loose text only.

Annotation types:

- field verify
- cut note
- seam warning
- customer note
- scope question
- product conflict
- installer preference

Annotations attach to:

- project
- plan page
- surface
- edge
- seam
- cut island
- stair step
- roll position

All annotations can flow into exports.

### 9. Warnings And FieldSense

FieldSense remains the product's voice of judgment.

Warning categories:

- material missing data
- seam risk
- pattern risk
- direction risk
- stair risk
- geometry risk
- scope conflict
- AI extraction uncertainty
- install sequence risk

Warning behavior:

- Clicking a warning selects or zooms to the issue.
- Warnings can be dismissed only with a reason.
- Dismissed warnings remain in the project audit trail.
- Hard-block warnings prevent final optimization/export unless explicitly overridden by an authorized user.

## AI Review Features

AI is a draft assistant. It reads, extracts, explains, and asks. It does not finalize dimensions, pricing, roll packing, stair geometry, or cut sizes.

### AI Draft Takeoff Review Mode

Workflow:

1. User imports plan pages or pastes plan text.
2. AI proposes rooms, labels, products, and missing scope.
3. User reviews every AI item.
4. Approved items become trusted project data.
5. Re-analysis preserves user corrections as truth.

### Smart Catalog

AI extracts:

- finish tags like CPT-1, LVT-2, RB-1
- product categories
- manufacturers
- styles and colors
- roll widths
- pattern repeat
- match type
- vendors and contacts
- source page references
- missing critical data

Each draft product has:

- confidence
- source page
- source excerpt or source bounding area
- missing fields
- approval state

### Missing Scope Board

Flags:

- missing roll width
- missing pattern repeat
- unclear stair material
- product mentioned but not specified
- finish tag conflict
- missing transition detail
- missing base/tack/pad/adhesive scope
- room has assigned carpet but no verified material profile

### OCR Search And Heatmap

Requirements:

- Search by text: `CPT-1`, `stairs`, `broadloom`, `base`, `transition`.
- Highlight all matching spots on plan pages.
- Heatmap likely material/scope density.
- Search result links jump to page and location.

### Re-analyze With Memory

Requirements:

- AI can re-run on plan text/pages.
- Human corrections persist and override future AI guesses.
- Conflicts are shown as review cards, not silent changes.

### Background AI Jobs

Requirements:

- Run document analysis while the user keeps working.
- Queue status: waiting, running, needs review, failed, approved.
- Each job records model, prompt version, source documents, and output schema version.

## Exports

V2 export types:

- installer cut packet
- customer quote summary
- roll map
- seam map
- stair worksheet
- material catalog
- missing scope report
- field verification checklist
- JSON project archive

Installer packet must include:

- cut order
- cut dimensions
- pile arrows
- pattern notes
- seam warnings
- stair worksheet
- locked overrides
- field verify list

Customer quote must hide installer clutter and focus on scope, alternates, and confidence.

## Non-Goals For First V2 Milestone

- Full automatic blueprint vectorization.
- Full irregular polygon nesting solver.
- Production cloud collaboration.
- AI-generated final measurements.
- AI-generated final cut plans.
- Public-hosted auth.
- Billing/accounting.

## Product Difference

Legacy tools say: this is the takeoff.

Rollwright V2 should say: this is the takeoff, this is the cut plan, this is the seam risk, this is the pattern phase, this is the stair logic, and this is where the installer needs to review before cutting.
