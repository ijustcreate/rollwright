# V2 Data Model Sketch

Use integer measurement units internally.

Recommended:

```ts
type UnitValue = number; // sixteenths of an inch
```

## Project

```ts
type Project = {
  id: string;
  name: string;
  clientName?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  materials: MaterialProfile[];
  surfaces: Surface[];
  edges: SurfaceEdge[];
  annotations: Annotation[];
  overrides: UserOverride[];
  documents: ProjectDocument[];
};
```

## Material

```ts
type MaterialProfile = {
  id: string;
  code: string;
  name: string;
  productType: "broadloom" | "carpet_tile" | "lvt" | "sheet_vinyl" | "tile" | "wood" | "rubber_base" | "misc";
  manufacturer?: string;
  style?: string;
  color?: string;
  rollWidth?: UnitValue;
  rollLength?: UnitValue;
  unitWidth?: UnitValue;
  unitLength?: UnitValue;
  directionalPile: boolean;
  rotationAllowed: boolean;
  pattern?: PatternSpec;
  dyeLot?: string;
  rollNumber?: string;
  approvalState: "manual" | "ai_draft" | "approved" | "rejected";
  sourceRefs: SourceRef[];
};
```

## Surface

```ts
type Surface = {
  id: string;
  name: string;
  kind: "room" | "hall" | "closet" | "landing" | "stair_tread" | "stair_riser" | "stair_run" | "custom";
  role?: "bedroom" | "living" | "hall" | "closet" | "stairs" | "showpiece" | "utility";
  polygon: Point2D[];
  materialId?: string;
  priority: "hidden" | "low" | "normal" | "high" | "showpiece";
  traffic: "low" | "normal" | "main" | "furniture";
  preferredPileDirection?: Direction2D;
  allowedDirections: Direction2D[];
  seamRules: SeamRule[];
  patternOrigin?: Point2D;
  patternCenterline?: Line2D;
  installNotes: string[];
};
```

## Edge

```ts
type SurfaceEdge = {
  id: string;
  surfaceId: string;
  from: Point2D;
  to: Point2D;
  edgeType: "wall" | "doorway" | "open_transition" | "threshold" | "stair_edge" | "landing_edge" | "preferred_seam" | "forbidden_seam" | "manual";
  connectedSurfaceId?: string;
  seamAllowed: boolean;
  seamPreferred: boolean;
  requiresPatternContinuity: boolean;
  requiresPileContinuity: boolean;
  transitionProductId?: string;
  notes: string[];
};
```

## Cut Island And Placement

```ts
type CutIsland = {
  id: string;
  surfaceIds: string[];
  shape: Polygon2D;
  boundingBox: Rect;
  materialId: string;
  requiredPileDirection: Direction2D;
  patternConstraints: PatternConstraint[];
  seamEdges: SeamEdge[];
  canRotate: boolean;
  canMirror: boolean;
  fieldTrimAllowance: UnitValue;
  riskScore: number;
};

type CutPlacement = {
  cutIslandId: string;
  rollId: string;
  u: UnitValue;
  v: UnitValue;
  width: UnitValue;
  length: UnitValue;
  rotation: 0 | 90 | 180 | 270;
  pileDirection: Direction2D;
  patternPhaseU: UnitValue;
  patternPhaseV: UnitValue;
  locked: boolean;
};
```

## AI Extraction

```ts
type AiExtraction = {
  id: string;
  projectId: string;
  kind: "product" | "scope" | "room_label" | "scale" | "warning";
  sourceRef: SourceRef;
  promptVersion: string;
  modelName: string;
  confidence: number;
  rawJson: unknown;
  normalizedValue: unknown;
  reviewState: "draft" | "needs_review" | "approved" | "rejected" | "superseded";
  reviewer?: string;
  reviewedAt?: string;
};
```

## Annotation

```ts
type Annotation = {
  id: string;
  targetType: "project" | "document" | "surface" | "edge" | "seam" | "cut_island" | "stair_step" | "roll_position";
  targetId: string;
  kind: "field_verify" | "cut_note" | "seam_warning" | "customer_note" | "scope_question" | "product_conflict" | "installer_preference";
  text: string;
  severity: "info" | "warning" | "hard_block";
  createdBy: string;
  createdAt: string;
};
```
