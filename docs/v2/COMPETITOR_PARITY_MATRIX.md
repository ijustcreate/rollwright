# Competitor Parity Matrix

This matrix turns the competitor UI review into Rollwright V2 requirements.

## Summary

| Competitor area | Minimum Rollwright parity | Rollwright advantage |
| --- | --- | --- |
| Ribbon command system | Top command ribbon with grouped tools | Command search, contextual tools, beginner/pro mode |
| Product group | Active product/material selector | Smart material cards with roll width, pattern, direction, warnings |
| Draw group | Room, line, polygon, quick room, quick stairs | Every drawn object becomes an install-aware surface |
| Room group | Edit/split/merge topology | Topology inspector and bad-geometry repair assistant |
| Tile & Patterns | Pattern fills and origins | Material-space phase, repeat, drop match, and roll mapping |
| Borders | Borders and fills | Runner/border wizard with cut impact preview |
| Annotation | Notes and callouts | Structured installer notes and warning-linked annotations |
| Zoom | Fit, area zoom, zoom in/out | Saved views, mini-map, zoom-to-warning |
| Left toolbar | Sidebar mode switching | Labels/tooltips, warning dots, customizable workflow |
| Product panel | Product category tree | Searchable material library with usage totals |
| Canvas | Grid, plan geometry, material fills | Floor/roll split view and live cross-highlighting |
| Floor geometry | Area boundaries and material assignment | Seam quality, pile arrows, priority labels, topology links |
| Sides panel | Edge/side drawer | Explicit edge types and seam/pile/pattern rules |
| Calculation engine | Area/product quantities | Risk-adjusted quantities and confidence |
| Reports | Takeoff reports | Separate customer quote and installer packet |

## Required V2 Feature Groups

### A. Navigation And Ribbon

Parity:

- tabs
- grouped tools
- collapse ribbon
- help entry

V2 improvements:

- command search
- contextual tools
- beginner/pro mode
- installer-language tooltips

### B. Product And Material System

Parity:

- product categories
- active product selector
- product swatches
- material assignment
- pattern product settings

V2 improvements:

- smart material cards
- completeness scoring
- source-backed AI draft products
- manufacturer presets
- product dependencies

### C. Drawing And Room Creation

Parity:

- rectangle room
- polygon room
- quick room
- quick stairs
- delete/edit objects
- fill/area creation

V2 improvements:

- dimension-first input
- smart room roles
- topology detection
- surface metadata while drawing
- install-aware primitives

### D. Pattern Tools

Parity:

- material fill pattern
- pattern start/origin
- replacement
- calculation mode

V2 improvements:

- phase overlay
- drop-match preview
- pattern-risk warnings
- pattern-centered stairs/runners

### E. Stair Tools

Parity:

- quick stairs

V2 improvements:

- stair wizard
- waterfall/cap-and-band/runner logic
- tread/riser unfolding
- no stair-nose seam by default
- stair worksheet export

### F. Roll Optimization

Parity:

- product usage and waste reporting

V2 improvements:

- roll-space viewport
- multiple packing modes
- ranked plan comparisons
- useful remnant scoring
- deterministic optimizer plus FieldSense scoring

### G. Canvas And Viewport

Parity:

- grid canvas
- zoom and pan
- tabs/layers
- material fill display

V2 improvements:

- split floor/roll/pattern review
- mini-map
- saved views
- click-to-warning navigation
- synchronized selection

### H. Sidebar

Parity:

- product/library panel
- product tabs
- stacked/material groups

V2 improvements:

- searchable cards
- full names without truncation
- usage totals
- missing-data badges

### I. Warnings And Installer Intelligence

Parity:

- basic calculations and maybe invalid geometry warnings

V2 improvements:

- FieldSense warnings
- hard blocks
- override reasons
- printable installer notes
- audit trail

### J. Export And Reports

Parity:

- takeoff reports

V2 improvements:

- installer cut packet
- customer quote
- roll map
- seam map
- stair worksheet
- missing scope report
- field checklist

## V2 Acceptance Rule

Rollwright V2 is not competitor-ready until a user can complete this flow:

1. Import or create a project.
2. Add products/materials.
3. Draw or generate rooms and stairs.
4. Assign materials.
5. Review pattern/pile/seam warnings.
6. Generate roll plan.
7. Compare at least two packing modes.
8. Override a seam or cut.
9. Export installer packet and customer quote.
