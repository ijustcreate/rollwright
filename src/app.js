const app = document.querySelector("#app");

const UNITS_PER_INCH = 16;
const INCHES_PER_FOOT = 12;
const FOOT = UNITS_PER_INCH * INCHES_PER_FOOT;

const STORAGE = {
  users: "rollwright:users:v1",
  session: "rollwright:session:v1",
  currentProject: "rollwright:current-project:v1",
  projectsFor(userId) {
    return `rollwright:projects:${userId}:v1`;
  }
};

const MODES = {
  balanced: {
    label: "Balanced Pro",
    description: "Best default plan for professional residential work. It balances waste, seams, pattern safety, and install clarity.",
    weights: { waste: 30, seam: 30, pattern: 20, install: 15, remnant: 5 }
  },
  waste: {
    label: "Lowest Waste",
    description: "Uses the least material it can. Good for price-sensitive work, but watch the seam warnings before trusting it.",
    weights: { waste: 60, seam: 15, pattern: 10, install: 10, remnant: 5 }
  },
  seams: {
    label: "Cleanest Seams",
    description: "Protects customer-facing rooms and traffic paths, even when it costs a little more material.",
    weights: { waste: 20, seam: 45, pattern: 20, install: 10, remnant: 5 }
  },
  pattern: {
    label: "Pattern First",
    description: "Keeps the pattern grid honest. Best for strong motifs, long repeats, stairs, and premium installs.",
    weights: { waste: 15, seam: 25, pattern: 50, install: 10, remnant: 0 }
  },
  installer: {
    label: "Installer Friendly",
    description: "Groups related cuts, avoids confusing tiny parts, and keeps stairs from turning into a sorting problem.",
    weights: { waste: 20, seam: 25, pattern: 10, install: 40, remnant: 5 }
  },
  remnant: {
    label: "Remnant Smart",
    description: "Preserves useful leftovers for closets, repairs, and future work instead of making mathematical confetti.",
    weights: { waste: 30, seam: 15, pattern: 10, install: 10, remnant: 35 }
  }
};

const KIND_LABELS = {
  room: "Rect room",
  l_room: "L-shaped room",
  hall: "Hall",
  closet: "Closet",
  landing: "Landing",
  stair_run: "Stair run"
};

const PRIORITY_LABELS = {
  hidden: "Hidden",
  low: "Low",
  normal: "Normal",
  high: "High",
  showpiece: "Showpiece"
};

const TRAFFIC_LABELS = {
  low: "Low traffic",
  normal: "Normal traffic",
  main: "Main walk path",
  furniture: "Furniture zone"
};

const COLORS = {
  room: "#4bc5d8",
  l_room: "#76d982",
  hall: "#f2c75f",
  closet: "#9da9b3",
  landing: "#a98bff",
  stair_run: "#f08a4b",
  remnant: "#334047"
};

const state = {
  user: null,
  projects: [],
  currentProjectId: null,
  selectedType: "surface",
  selectedId: null,
  formKind: "room",
  authMode: "login",
  toast: ""
};

init();

function init() {
  seedUsers();
  state.user = getSessionUser();
  if (state.user) {
    loadProjects();
  }
  render();
}

function render() {
  if (!app) return;
  app.innerHTML = state.user ? renderApp() : renderAuth();
  bindEvents();
}

function renderAuth() {
  const creating = state.authMode === "create";
  return `
    <main class="auth-shell">
      <section class="auth-card">
        <div class="auth-preview">
          <h1>Rollwright</h1>
          <p>Pattern-aware flooring takeoff, roll planning, stair logic, and installer-ready cut packets. Built as an editor, not a calculator.</p>
          <div class="badge-row" style="margin-top:18px">
            <span class="badge info">UV roll space</span>
            <span class="badge warn">FieldSense warnings</span>
            <span class="badge good">Local MVP</span>
          </div>
          <div class="auth-visual" aria-hidden="true">
            ${renderAuthVisual()}
          </div>
        </div>
        <form class="auth-form" id="authForm">
          <div>
            <h2>${creating ? "Create local account" : "Sign in"}</h2>
            <p class="auth-note">
              Accounts are stored locally in this browser for now. Use real hosted auth before putting customer jobs on the public internet.
            </p>
          </div>
          <div class="field-stack">
            <div class="field">
              <label for="username">Username</label>
              <input id="username" name="username" autocomplete="username" value="${creating ? "" : "steve"}" required />
            </div>
            ${creating ? `
              <div class="field">
                <label for="displayName">Display name</label>
                <input id="displayName" name="displayName" autocomplete="name" placeholder="Steve" />
              </div>
            ` : ""}
            <div class="field">
              <label for="password">Password</label>
              <input id="password" name="password" type="password" autocomplete="${creating ? "new-password" : "current-password"}" value="${creating ? "" : "rollwright"}" required />
              <span class="hint">${creating ? "Local-only password for this prototype." : "Demo login: steve / rollwright"}</span>
            </div>
          </div>
          <div class="button-row">
            <button class="button primary" type="submit">${icon("login")}${creating ? "Create account" : "Open Rollwright"}</button>
            <button class="button ghost" type="button" data-action="toggle-auth">${creating ? "Use existing account" : "Create account"}</button>
          </div>
          ${state.toast ? `<div class="warning-item warning"><h4>Heads up</h4><p>${escapeHtml(state.toast)}</p></div>` : ""}
        </form>
      </section>
    </main>
  `;
}

function renderAuthVisual() {
  return `
    <svg viewBox="0 0 720 390" role="img" aria-label="Rollwright preview">
      <defs>
        <pattern id="authGrid" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M 34 0 L 0 0 0 34" fill="none" stroke="rgba(113,231,245,.16)" stroke-width="1"/>
        </pattern>
        <linearGradient id="rollGlow" x1="0" x2="1">
          <stop offset="0" stop-color="#71e7f5" stop-opacity=".18"/>
          <stop offset="1" stop-color="#64dd91" stop-opacity=".1"/>
        </linearGradient>
      </defs>
      <rect width="720" height="390" fill="url(#authGrid)"/>
      <rect x="38" y="42" width="230" height="148" rx="6" fill="rgba(75,197,216,.2)" stroke="#71e7f5"/>
      <path d="M318 42 h170 v72 h88 v128 h-258z" fill="rgba(118,217,130,.18)" stroke="#64dd91"/>
      <rect x="42" y="242" width="340" height="70" rx="6" fill="rgba(246,200,95,.17)" stroke="#f6c85f"/>
      <g stroke="#f6c85f" stroke-width="2">
        <path d="M96 116 h120"/>
        <path d="M96 116 l16 -10"/>
        <path d="M96 116 l16 10"/>
        <path d="M394 100 h150"/>
        <path d="M394 100 l16 -10"/>
        <path d="M394 100 l16 10"/>
      </g>
      <rect x="458" y="250" width="206" height="96" rx="6" fill="url(#rollGlow)" stroke="#71e7f5"/>
      <rect x="476" y="267" width="72" height="62" rx="3" fill="rgba(75,197,216,.42)" stroke="#71e7f5"/>
      <rect x="556" y="267" width="88" height="36" rx="3" fill="rgba(246,200,95,.35)" stroke="#f6c85f"/>
      <rect x="556" y="309" width="44" height="20" rx="3" fill="rgba(157,169,179,.3)" stroke="#9da9b3"/>
      <text x="54" y="72" fill="#eef2f4" font-size="14" font-weight="700">Floor topology</text>
      <text x="478" y="238" fill="#eef2f4" font-size="14" font-weight="700">Roll U/V space</text>
      <text x="54" y="338" fill="#f6c85f" font-size="12" font-weight="700">FIELD VERIFY PATTERN PHASE</text>
    </svg>
  `;
}

function renderApp() {
  const project = getCurrentProject();
  const plan = project ? generatePlan(project) : emptyPlan();
  return `
    <div class="app-shell">
      ${renderTopbar(project)}
      ${project ? `
        <main class="workspace">
          ${renderFloorPanel(project, plan)}
          ${renderRollPanel(project, plan)}
          ${renderInspector(project, plan)}
        </main>
      ` : renderNoProject()}
      ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ""}
    </div>
  `;
}

function renderTopbar(project) {
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">${icon("roll")}</div>
        <div>
          <h1>Rollwright</h1>
          <span>Pattern-aware roll planning</span>
        </div>
      </div>
      <div class="project-switcher">
        <select class="inline-select" id="projectSelect" aria-label="Project">
          ${state.projects.map((item) => `<option value="${item.id}" ${item.id === state.currentProjectId ? "selected" : ""}>${escapeHtml(item.name)}${item.client ? ` - ${escapeHtml(item.client)}` : ""}</option>`).join("")}
        </select>
        <button class="button tiny" type="button" data-action="new-project" title="Create project">${icon("plus")}New</button>
      </div>
      <div class="top-actions">
        <button class="button tiny" type="button" data-action="import-project">${icon("upload")}Import</button>
        <button class="button tiny" type="button" data-action="export-json" ${project ? "" : "disabled"}>${icon("download")}JSON</button>
        <button class="button tiny" type="button" data-action="share-link">${icon("link")}Copy link</button>
        <span class="user-chip">${icon("user")}${escapeHtml(state.user?.displayName || state.user?.username || "User")}</span>
        <button class="button tiny ghost" type="button" data-action="logout">${icon("logout")}Logout</button>
        <input class="hidden" type="file" id="importProjectFile" accept="application/json,.json" />
      </div>
    </header>
  `;
}

function renderNoProject() {
  return `
    <main class="workspace">
      <section class="panel" style="grid-column: 1 / -1">
        <div class="panel-body">
          <div class="empty-state">
            <div>
              <strong>No project loaded</strong>
              <p>Create a project to start a takeoff.</p>
              <button class="button primary" type="button" data-action="new-project" style="margin-top:12px">${icon("plus")}New project</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderFloorPanel(project, plan) {
  return `
    <section class="panel floor-panel">
      <div class="panel-header">
        <div class="panel-title">
          <h2>Floor Topology</h2>
          <p>Rooms, stairs, traffic, priority, and seam restrictions</p>
        </div>
        <button class="button tiny" type="button" data-action="generate">${icon("refresh")}Generate</button>
      </div>
      <div class="panel-body">
        <div class="canvas-wrap">${renderFloorSvg(project, plan)}</div>
      </div>
      <div class="panel-body scroll-body">
        ${renderProjectSetup(project)}
        ${renderMaterialForm(project)}
        ${renderSurfaceForm(project)}
        ${renderSurfaceList(project, plan)}
      </div>
    </section>
  `;
}

function renderProjectSetup(project) {
  return `
    <section class="section">
      <div class="section-title"><h3>Project</h3><span class="badge info">Local save</span></div>
      <form id="projectForm" class="grid-2">
        <div class="field">
          <label for="projectName">Project name</label>
          <input id="projectName" name="name" value="${escapeAttr(project.name)}" />
        </div>
        <div class="field">
          <label for="projectClient">Client</label>
          <input id="projectClient" name="client" value="${escapeAttr(project.client || "")}" />
        </div>
      </form>
    </section>
  `;
}

function renderMaterialForm(project) {
  const material = project.material;
  return `
    <section class="section">
      <div class="section-title"><h3>Material Profile</h3><span class="badge ${material.patternEnabled ? "warn" : "info"}">${material.patternEnabled ? "Patterned" : "Solid"}</span></div>
      <form id="materialForm" class="field-stack">
        <div class="grid-3">
          ${numberField("rollWidthFt", "Roll width, ft", toFeetNumber(material.rollWidth), "0.25")}
          ${numberField("rollLengthFt", "Available length, ft", toFeetNumber(material.rollLength), "0.25")}
          <div class="field">
            <label for="materialType">Material</label>
            <select id="materialType" name="materialType">
              ${option("broadloom", "Broadloom carpet", material.materialType)}
              ${option("runner", "Runner", material.materialType)}
              ${option("sheet", "Sheet goods", material.materialType)}
            </select>
          </div>
        </div>
        <div class="grid-2">
          ${checkboxField("directionalPile", "Directional pile", material.directionalPile)}
          ${checkboxField("rotationAllowed", "Rotation allowed", material.rotationAllowed)}
        </div>
        <div class="grid-3">
          ${numberField("cutMarginIn", "Cut margin, in", toInchesNumber(material.cutMargin), "0.25")}
          ${numberField("trimMarginIn", "Trim margin, in", toInchesNumber(material.trimMargin), "0.25")}
          <div class="field">
            <label for="matchType">Match type</label>
            <select id="matchType" name="matchType">
              ${option("none", "None", material.matchType)}
              ${option("standard", "Standard", material.matchType)}
              ${option("drop", "Drop match", material.matchType)}
              ${option("half_drop", "Half drop", material.matchType)}
            </select>
          </div>
        </div>
        <div class="grid-3">
          ${checkboxField("patternEnabled", "Pattern enabled", material.patternEnabled)}
          ${numberField("repeatWidthIn", "Repeat width, in", toInchesNumber(material.repeatWidth), "0.25")}
          ${numberField("repeatLengthIn", "Repeat length, in", toInchesNumber(material.repeatLength), "0.25")}
        </div>
        <div class="grid-2">
          ${numberField("dropOffsetIn", "Drop offset, in", toInchesNumber(material.dropOffset), "0.25")}
          ${numberField("phaseToleranceIn", "Phase tolerance, in", toInchesNumber(material.phaseTolerance), "0.0625")}
        </div>
      </form>
    </section>
  `;
}

function renderSurfaceForm(project) {
  const isStair = state.formKind === "stair_run";
  const isL = state.formKind === "l_room";
  return `
    <section class="section">
      <div class="section-title"><h3>Add Surface</h3><span class="badge good">${project.surfaces.length} surfaces</span></div>
      <form id="surfaceForm" class="field-stack">
        <div class="grid-2">
          <div class="field">
            <label for="surfaceKind">Type</label>
            <select id="surfaceKind" name="kind">
              ${Object.entries(KIND_LABELS).map(([value, label]) => option(value, label, state.formKind)).join("")}
            </select>
          </div>
          <div class="field">
            <label for="surfaceName">Name</label>
            <input id="surfaceName" name="name" placeholder="${isStair ? "Main stairs" : "Living room"}" required />
          </div>
        </div>
        ${isStair ? `
          <div class="grid-3">
            ${numberField("stairCount", "Stairs", 13, "1")}
            ${numberField("treadWidthIn", "Tread width, in", 36, "0.25")}
            ${numberField("treadDepthIn", "Tread depth, in", 10, "0.25")}
          </div>
          <div class="grid-3">
            ${numberField("riserHeightIn", "Riser height, in", 7.5, "0.25")}
            ${numberField("stairAllowanceIn", "Stair allowance, in", 3, "0.25")}
            ${numberField("runnerWidthIn", "Runner width, in", 30, "0.25")}
          </div>
          <div class="grid-2">
            <div class="field">
              <label for="installStyle">Install style</label>
              <select id="installStyle" name="installStyle">
                <option value="waterfall">Waterfall</option>
                <option value="cap_and_band">Cap-and-band</option>
                <option value="runner">Runner</option>
              </select>
            </div>
            <div class="field">
              <label for="pileDirection">Pile direction</label>
              <select id="pileDirection" name="pileDirection">
                <option value="down_stairs">Down stairs</option>
                <option value="up_stairs">Up stairs</option>
                <option value="match_room">Match room</option>
              </select>
            </div>
          </div>
        ` : `
          <div class="grid-2">
            ${numberField("widthFt", "Width, ft", state.formKind === "hall" ? 4 : state.formKind === "closet" ? 5 : 12, "0.25")}
            ${numberField("lengthFt", "Length, ft", state.formKind === "hall" ? 18 : state.formKind === "closet" ? 6 : 14, "0.25")}
          </div>
          ${isL ? `
            <div class="grid-2">
              ${numberField("returnWidthFt", "Return width, ft", 6, "0.25")}
              ${numberField("returnLengthFt", "Return length, ft", 8, "0.25")}
            </div>
          ` : ""}
        `}
        <div class="grid-2">
          <div class="field">
            <label for="priority">Priority</label>
            <select id="priority" name="priority">
              ${Object.entries(PRIORITY_LABELS).map(([value, label]) => option(value, label, value === "normal" ? "normal" : "")).join("")}
            </select>
          </div>
          <div class="field">
            <label for="traffic">Traffic</label>
            <select id="traffic" name="traffic">
              ${Object.entries(TRAFFIC_LABELS).map(([value, label]) => option(value, label, value === "normal" ? "normal" : "")).join("")}
            </select>
          </div>
        </div>
        <button class="button primary" type="submit">${icon("plus")}Add surface</button>
      </form>
    </section>
  `;
}

function renderSurfaceList(project, plan) {
  if (!project.surfaces.length) {
    return `
      <section class="section">
        <div class="empty-state">
          <div>
            <strong>No surfaces yet</strong>
            <p>Add rooms, halls, closets, landings, or stairs to generate roll cuts.</p>
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="section">
      <div class="section-title"><h3>Surfaces</h3><span class="badge info">Click to inspect</span></div>
      <div class="surface-list">
        ${project.surfaces.map((surface) => {
          const cuts = plan.islands.filter((island) => island.surfaceId === surface.id);
          const selected = state.selectedType === "surface" && state.selectedId === surface.id;
          const risk = surfaceRiskLabel(surface, cuts, plan);
          return `
            <button class="surface-item ${selected ? "selected" : ""}" type="button" data-surface-id="${surface.id}">
              <span>
                <strong>${escapeHtml(surface.name)}</strong>
                <span>${KIND_LABELS[surface.kind] || surface.kind} - ${surfaceSummary(surface)} - ${cuts.length} cut${cuts.length === 1 ? "" : "s"}</span>
              </span>
              <span class="badge ${risk.className}">${risk.label}</span>
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderRollPanel(project, plan) {
  return `
    <section class="panel roll-panel">
      <div class="panel-header">
        <div class="panel-title">
          <h2>Roll U/V Space</h2>
          <p>U is roll width, V is roll length. Cuts are UV islands.</p>
        </div>
        <select class="inline-select" id="modeSelect" aria-label="Packing mode">
          ${Object.entries(MODES).map(([value, mode]) => option(value, mode.label, project.mode)).join("")}
        </select>
      </div>
      ${renderMetrics(plan)}
      <div class="panel-body scroll-body">
        <div class="canvas-wrap roll-canvas">${renderRollSvg(project, plan)}</div>
        <section class="section">
          <div class="mode-card">
            <div class="section-title"><h3>${MODES[project.mode]?.label || "Balanced Pro"}</h3><span class="badge info">Deterministic</span></div>
            <p>${escapeHtml(plan.explanation)}</p>
            ${renderModeWeights(project.mode)}
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderMetrics(plan) {
  const wasteClass = plan.metrics.wastePct <= 8 ? "risk-low" : plan.metrics.wastePct <= 14 ? "risk-mid" : "risk-high";
  const seamClass = riskClass(plan.metrics.seamRisk);
  const patternClass = riskClass(plan.metrics.patternRisk);
  const installClass = riskClass(plan.metrics.installDifficulty);
  return `
    <div class="metric-grid">
      <div class="metric-card"><span>Material used</span><strong>${formatUnits(plan.metrics.usedLength)}</strong><small>${formatArea(plan.metrics.cutArea)} cut area</small></div>
      <div class="metric-card ${wasteClass}"><span>Waste</span><strong>${plan.metrics.wastePct.toFixed(1)}%</strong><small>${formatArea(plan.metrics.wasteArea)}</small></div>
      <div class="metric-card risk-low"><span>Usable remnant</span><strong>${plan.metrics.usableRemnantPct.toFixed(1)}%</strong><small>${plan.remnants.length} remnant zones</small></div>
      <div class="metric-card ${seamClass}"><span>Seam risk</span><strong>${plan.metrics.seamRisk}</strong><small>0 low, 100 high</small></div>
      <div class="metric-card ${patternClass}"><span>Pattern risk</span><strong>${plan.metrics.patternRisk}</strong><small>${plan.patternEnabled ? "Pattern active" : "Pattern off"}</small></div>
      <div class="metric-card ${installClass}"><span>Install difficulty</span><strong>${plan.metrics.installDifficulty}</strong><small>${plan.metrics.cutCount} cuts</small></div>
    </div>
  `;
}

function renderInspector(project, plan) {
  const selected = getSelected(project, plan);
  const targetedWarnings = selected
    ? plan.warnings.filter((warning) => warning.targetId === selected.id || warning.surfaceId === selected.surfaceId || warning.targetId === selected.surfaceId)
    : [];

  return `
    <aside class="panel inspector">
      <div class="panel-header">
        <div class="panel-title">
          <h2>Inspector</h2>
          <p>${selected ? escapeHtml(selected.name) : "Select a room or cut island"}</p>
        </div>
        <span class="badge ${plan.metrics.confidence >= 78 ? "good" : plan.metrics.confidence >= 58 ? "warn" : "bad"}">${plan.metrics.confidence}% confidence</span>
      </div>
      <div class="panel-body scroll-body">
        ${selected ? renderSelectedInspector(project, plan, selected, targetedWarnings) : renderNoSelection(project, plan)}
        ${renderWarnings(plan.warnings)}
        ${renderExportPanel(project, plan)}
      </div>
    </aside>
  `;
}

function renderNoSelection(project, plan) {
  return `
    <div class="inspector-card">
      <h3>Plan Summary</h3>
      <p class="auth-note">${escapeHtml(plan.explanation)}</p>
      <div class="badge-row" style="margin-top:10px">
        <span class="badge info">${project.surfaces.length} surfaces</span>
        <span class="badge good">${plan.placements.length} placed cuts</span>
        <span class="badge warn">${plan.warnings.filter((item) => item.level === "warning" || item.level === "hard").length} warnings</span>
      </div>
    </div>
  `;
}

function renderSelectedInspector(project, plan, selected, targetedWarnings) {
  if (selected.kind === "cut") {
    const override = project.overrides?.cutLocks?.[selected.id] || {};
    return `
      <div class="inspector-card">
        <h3>Cut Island</h3>
        <div class="fact-list">
          ${fact("Cut", selected.name)}
          ${fact("Surface", selected.surfaceName)}
          ${fact("Size", `${formatUnits(selected.width)} x ${formatUnits(selected.length)}`)}
          ${fact("Roll position", `U ${formatUnits(selected.u)}, V ${formatUnits(selected.v)}`)}
          ${fact("Pattern phase", selected.patternEnabled ? `U ${formatUnits(selected.patternPhaseU)}, V ${formatUnits(selected.patternPhaseV)}` : "Pattern disabled")}
          ${fact("Pile", selected.pileDirection)}
        </div>
        <div class="button-row" style="margin-top:12px">
          <button class="button tiny ${override.locked ? "warn" : ""}" type="button" data-action="toggle-cut-lock" data-cut-id="${selected.id}">${icon("lock")}${override.locked ? "Unlock placement" : "Lock placement"}</button>
          <button class="button tiny ${override.preserve ? "warn" : ""}" type="button" data-action="toggle-cut-preserve" data-cut-id="${selected.id}">${icon("tag")}${override.preserve ? "Unmark remnant" : "Preserve remnant"}</button>
        </div>
      </div>
      ${targetedWarnings.length ? `<div class="inspector-card">${renderWarnings(targetedWarnings, "Selected Warnings")}</div>` : ""}
    `;
  }

  const surface = selected;
  return `
    <div class="inspector-card">
      <h3>Surface</h3>
      <div class="fact-list">
        ${fact("Name", surface.name)}
        ${fact("Type", KIND_LABELS[surface.kind] || surface.kind)}
        ${fact("Size", surfaceSummary(surface))}
        ${fact("Priority", PRIORITY_LABELS[surface.priority] || surface.priority)}
        ${fact("Traffic", TRAFFIC_LABELS[surface.traffic] || surface.traffic)}
        ${fact("Extra margin", formatUnits(surface.extraMargin || 0))}
      </div>
      <div class="button-row" style="margin-top:12px">
        <button class="button tiny ${surface.lockedSeam ? "warn" : ""}" type="button" data-action="toggle-surface-flag" data-flag="lockedSeam" data-surface-id="${surface.id}">${icon("lock")}${surface.lockedSeam ? "Unlock seam" : "Lock seam"}</button>
        <button class="button tiny ${surface.forbidSeam ? "danger" : ""}" type="button" data-action="toggle-surface-flag" data-flag="forbidSeam" data-surface-id="${surface.id}">${icon("ban")}${surface.forbidSeam ? "Allow seam" : "Forbid seam"}</button>
        <button class="button tiny ${surface.preserveRemnant ? "warn" : ""}" type="button" data-action="toggle-surface-flag" data-flag="preserveRemnant" data-surface-id="${surface.id}">${icon("tag")}${surface.preserveRemnant ? "Release remnant" : "Preserve remnant"}</button>
      </div>
      <form class="grid-2" id="surfaceEditForm" data-surface-id="${surface.id}" style="margin-top:12px">
        <div class="field">
          <label for="selectedPriority">Priority</label>
          <select id="selectedPriority" name="priority">
            ${Object.entries(PRIORITY_LABELS).map(([value, label]) => option(value, label, surface.priority)).join("")}
          </select>
        </div>
        <div class="field">
          <label for="selectedExtraMargin">Extra margin, in</label>
          <input id="selectedExtraMargin" name="extraMarginIn" type="number" min="0" step="0.25" value="${toInchesNumber(surface.extraMargin || 0)}" />
        </div>
      </form>
      <div class="button-row" style="margin-top:12px">
        <button class="button tiny danger" type="button" data-action="delete-surface" data-surface-id="${surface.id}">${icon("trash")}Delete surface</button>
      </div>
    </div>
    ${targetedWarnings.length ? `<div class="inspector-card">${renderWarnings(targetedWarnings, "Selected Warnings")}</div>` : ""}
  `;
}

function renderWarnings(warnings, title = "FieldSense") {
  const ordered = warnings.slice().sort((a, b) => warningWeight(b.level) - warningWeight(a.level));
  const shown = ordered.slice(0, title === "FieldSense" ? 8 : 5);
  return `
    <div class="inspector-card">
      <div class="section-title"><h3>${title}</h3><span class="badge ${ordered.some((item) => item.level === "hard") ? "bad" : ordered.some((item) => item.level === "warning") ? "warn" : "good"}">${ordered.length} notes</span></div>
      ${shown.length ? `
        <div class="warning-list">
          ${shown.map((warning) => `
            <div class="warning-item ${warning.level}">
              <h4>${escapeHtml(warning.title)}</h4>
              <p>${escapeHtml(warning.message)}</p>
            </div>
          `).join("")}
        </div>
      ` : `
        <div class="empty-state"><div><strong>No warnings</strong><p>This plan is clean on the current rules. Still field verify before cutting.</p></div></div>
      `}
    </div>
  `;
}

function renderExportPanel(project, plan) {
  return `
    <div class="inspector-card">
      <h3>Exports</h3>
      <div class="button-row">
        <button class="button tiny" type="button" data-action="export-json">${icon("download")}Project JSON</button>
        <button class="button tiny" type="button" data-action="export-packet">${icon("print")}Installer packet</button>
        <button class="button tiny" type="button" data-action="reset-demo">${icon("refresh")}Reload demo</button>
      </div>
      <p class="hint" style="margin-top:10px">
        This local MVP uses browser storage for accounts and projects. Hosted sharing should use a real auth and database layer.
      </p>
    </div>
  `;
}

function renderModeWeights(modeKey) {
  const mode = MODES[modeKey] || MODES.balanced;
  const entries = [
    ["Waste", mode.weights.waste],
    ["Seams", mode.weights.seam],
    ["Pattern", mode.weights.pattern],
    ["Install", mode.weights.install],
    ["Remnant", mode.weights.remnant]
  ];
  return `
    <div class="weight-grid">
      ${entries.map(([label, value]) => `
        <div class="weight">
          <span>${label}</span>
          <div class="bar"><span style="width:${value}%"></span></div>
          <strong>${value}%</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderFloorSvg(project, plan) {
  const layout = layoutSurfaces(project.surfaces);
  const selectedSurfaceId = state.selectedType === "surface"
    ? state.selectedId
    : plan.placements.find((placement) => placement.id === state.selectedId)?.surfaceId;

  if (!project.surfaces.length) {
    return `
      <svg viewBox="0 0 720 420" role="img" aria-label="Empty floor plan">
        <text x="360" y="210" text-anchor="middle" fill="#9aa5ad" font-size="15">Add a room, hall, closet, landing, or stair run.</text>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 720 420" role="img" aria-label="Floor topology">
      <defs>
        <pattern id="floorPattern" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="rgba(246,200,95,.18)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect x="0" y="0" width="720" height="420" fill="rgba(8,10,12,.45)"/>
      ${project.material.patternEnabled ? `<rect x="0" y="0" width="720" height="420" fill="url(#floorPattern)" opacity=".45"/>` : ""}
      ${layout.map((item) => renderSurfaceShape(item, selectedSurfaceId, project, plan)).join("")}
      <text x="18" y="26" class="svg-small">Floor space preview. Click a surface to sync with the roll map.</text>
    </svg>
  `;
}

function renderSurfaceShape(item, selectedSurfaceId, project, plan) {
  const { surface, x, y, w, h } = item;
  const fill = colorForKind(surface.kind);
  const isSelected = selectedSurfaceId === surface.id;
  const cuts = plan.islands.filter((island) => island.surfaceId === surface.id);
  const split = cuts.length > 1;
  const stroke = isSelected ? "#ffffff" : fill;
  const strokeWidth = isSelected ? 3 : 1.5;
  const badges = [
    surface.lockedSeam ? "LOCKED" : "",
    surface.forbidSeam ? "NO SEAM" : "",
    surface.preserveRemnant ? "REMNANT" : "",
    split ? `${cuts.length} CUTS` : ""
  ].filter(Boolean);

  if (surface.kind === "stair_run") {
    const count = Math.min(surface.stairCount || 1, 13);
    const stepH = Math.max(7, (h - 22) / count);
    return `
      <g data-surface-id="${surface.id}">
        <rect class="surface-shape" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="rgba(240,138,75,.16)" stroke="${stroke}" stroke-width="${strokeWidth}" data-surface-id="${surface.id}"/>
        ${Array.from({ length: count }).map((_, index) => `
          <rect class="surface-shape" x="${x + 12}" y="${y + 14 + index * stepH}" width="${w - 24}" height="${Math.max(4, stepH - 2)}" rx="2" fill="${fill}" opacity=".42" stroke="rgba(255,255,255,.2)" data-surface-id="${surface.id}"/>
        `).join("")}
        <text x="${x + 12}" y="${y + h - 10}" class="svg-label">${escapeSvg(surface.name)}</text>
        <text x="${x + w - 12}" y="${y + h - 10}" text-anchor="end" class="svg-small">${surface.stairCount} stairs</text>
        ${renderPileArrow(x + 18, y + 22, x + 18, y + h - 34)}
      </g>
    `;
  }

  const shape = surface.kind === "l_room"
    ? `<path class="surface-shape" d="M${x} ${y} h${w * 0.66} v${h * 0.38} h${w * 0.34} v${h * 0.62} h-${w} z" fill="${fill}" fill-opacity=".28" stroke="${stroke}" stroke-width="${strokeWidth}" data-surface-id="${surface.id}"/>`
    : `<rect class="surface-shape" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" fill-opacity=".24" stroke="${stroke}" stroke-width="${strokeWidth}" data-surface-id="${surface.id}"/>`;

  const seamX = x + Math.min(w - 18, Math.max(18, w * 0.74));
  return `
    <g data-surface-id="${surface.id}">
      ${shape}
      ${split ? `<line x1="${seamX}" y1="${y + 8}" x2="${seamX}" y2="${y + h - 8}" stroke="#f6c85f" stroke-width="2" stroke-dasharray="6 5"/>` : ""}
      ${renderPileArrow(x + 18, y + 22, x + Math.min(x + w - 24, x + 112), y + 22)}
      <text x="${x + 12}" y="${y + 22}" class="svg-label">${escapeSvg(surface.name)}</text>
      <text x="${x + 12}" y="${y + 40}" class="svg-small">${escapeSvg(surfaceSummary(surface))}</text>
      ${badges.map((badge, index) => `<text x="${x + 12}" y="${y + h - 12 - index * 14}" class="svg-small" fill="#f6c85f">${escapeSvg(badge)}</text>`).join("")}
    </g>
  `;
}

function renderRollSvg(project, plan) {
  const material = project.material;
  const rollWidth = material.rollWidth || feet(12);
  const usedLength = Math.max(plan.metrics.usedLength, feet(8));
  const rollX = 40;
  const rollY = 44;
  const rollW = 560;
  const rollH = 650;
  const scaleX = rollW / rollWidth;
  const scaleY = rollH / usedLength;
  const selectedSurfaceId = state.selectedType === "surface" ? state.selectedId : null;
  const selectedCutId = state.selectedType === "cut" ? state.selectedId : null;

  const patternLines = project.material.patternEnabled
    ? renderPatternLines(project.material, rollX, rollY, rollW, rollH, scaleX, scaleY, usedLength)
    : "";

  return `
    <svg viewBox="0 0 640 760" role="img" aria-label="Roll map">
      <defs>
        <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#f6c85f"/>
        </marker>
      </defs>
      <rect x="0" y="0" width="640" height="760" fill="rgba(8,10,12,.5)"/>
      <text x="${rollX}" y="24" class="svg-small">Roll width ${formatUnits(rollWidth)}. V length consumed ${formatUnits(plan.metrics.usedLength)}.</text>
      <rect x="${rollX}" y="${rollY}" width="${rollW}" height="${rollH}" fill="rgba(255,255,255,.025)" stroke="#71e7f5" stroke-width="2"/>
      ${renderRollFootMarks(rollX, rollY, rollW, rollH, rollWidth, usedLength)}
      ${patternLines}
      ${plan.remnants.map((remnant) => {
        const x = rollX + remnant.u * scaleX;
        const y = rollY + remnant.v * scaleY;
        const w = remnant.width * scaleX;
        const h = remnant.length * scaleY;
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${COLORS.remnant}" fill-opacity=".45" stroke="rgba(157,169,179,.35)" stroke-dasharray="5 4"/>`;
      }).join("")}
      ${plan.placements.map((placement) => {
        const x = rollX + placement.u * scaleX;
        const y = rollY + placement.v * scaleY;
        const w = Math.max(2, placement.width * scaleX);
        const h = Math.max(2, placement.length * scaleY);
        const fill = colorForKind(placement.surfaceKind);
        const selected = selectedCutId === placement.id || selectedSurfaceId === placement.surfaceId;
        const lock = project.overrides?.cutLocks?.[placement.id]?.locked;
        return `
          <g data-cut-id="${placement.id}">
            <rect class="cut-shape" x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" fill-opacity="${selected ? ".48" : ".3"}" stroke="${selected ? "#ffffff" : fill}" stroke-width="${selected ? 3 : 1.5}" data-cut-id="${placement.id}"/>
            <line x1="${x + 10}" y1="${y + 16}" x2="${x + Math.min(w - 8, 76)}" y2="${y + 16}" stroke="#f6c85f" stroke-width="2" marker-end="url(#arrowHead)"/>
            <text x="${x + 8}" y="${y + Math.min(h - 8, 34)}" class="svg-label">${escapeSvg(shortLabel(placement.name, 18))}</text>
            <text x="${x + 8}" y="${y + Math.min(h - 8, 49)}" class="svg-small">${escapeSvg(`${formatUnits(placement.width)} x ${formatUnits(placement.length)}`)}</text>
            ${lock ? `<text x="${x + w - 8}" y="${y + 16}" text-anchor="end" class="svg-small" fill="#d5c8ff">LOCKED</text>` : ""}
          </g>
        `;
      }).join("")}
      ${plan.remnants.map((remnant) => {
        const x = rollX + remnant.u * scaleX;
        const y = rollY + remnant.v * scaleY;
        return `<text x="${x + 6}" y="${y + 14}" class="svg-small">${escapeSvg(remnant.suggestedUse.toUpperCase())}</text>`;
      }).join("")}
      <text x="${rollX}" y="726" class="svg-small">Color is surface type. Gold arrows show pile direction. Pattern grid is shown when enabled.</text>
    </svg>
  `;
}

function bindEvents() {
  bindAuthEvents();
  bindAppEvents();
}

function bindAuthEvents() {
  const form = document.querySelector("#authForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const username = String(data.get("username") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const displayName = String(data.get("displayName") || "").trim();
    if (!username || !password) {
      showToast("Username and password are required.");
      return;
    }

    if (state.authMode === "create") {
      createLocalUser(username, password, displayName || username);
    } else {
      signIn(username, password);
    }
  });

  document.querySelector("[data-action='toggle-auth']")?.addEventListener("click", () => {
    state.authMode = state.authMode === "login" ? "create" : "login";
    state.toast = "";
    render();
  });
}

function bindAppEvents() {
  if (!state.user) return;

  document.querySelector("#projectSelect")?.addEventListener("change", (event) => {
    state.currentProjectId = event.target.value;
    localStorage.setItem(STORAGE.currentProject, state.currentProjectId);
    state.selectedId = null;
    render();
  });

  document.querySelector("#modeSelect")?.addEventListener("change", (event) => {
    const project = getCurrentProject();
    if (!project) return;
    project.mode = event.target.value;
    saveProjects();
    showToast(`${MODES[project.mode]?.label || "Mode"} selected.`);
    render();
  });

  document.querySelector("#projectForm")?.addEventListener("change", (event) => {
    const project = getCurrentProject();
    if (!project) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    project.name = String(data.get("name") || "Untitled project").trim() || "Untitled project";
    project.client = String(data.get("client") || "").trim();
    touch(project);
    saveProjects();
    render();
  });

  document.querySelector("#materialForm")?.addEventListener("change", (event) => {
    const project = getCurrentProject();
    if (!project) return;
    const data = new FormData(event.currentTarget);
    project.material = readMaterialForm(data, project.material);
    touch(project);
    saveProjects();
    render();
  });

  document.querySelector("#surfaceKind")?.addEventListener("change", (event) => {
    state.formKind = event.target.value;
    render();
  });

  document.querySelector("#surfaceForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const project = getCurrentProject();
    if (!project) return;
    const data = new FormData(event.currentTarget);
    const surface = readSurfaceForm(data);
    project.surfaces.push(surface);
    state.selectedType = "surface";
    state.selectedId = surface.id;
    touch(project);
    saveProjects();
    showToast(`${surface.name} added.`);
    render();
  });

  document.querySelector("#surfaceEditForm")?.addEventListener("change", (event) => {
    const project = getCurrentProject();
    const surfaceId = event.currentTarget.dataset.surfaceId;
    const surface = project?.surfaces.find((item) => item.id === surfaceId);
    if (!surface) return;
    const data = new FormData(event.currentTarget);
    surface.priority = String(data.get("priority") || surface.priority);
    surface.extraMargin = inches(Number(data.get("extraMarginIn") || 0));
    touch(project);
    saveProjects();
    render();
  });

  document.querySelectorAll("[data-surface-id]").forEach((node) => {
    node.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.surfaceId;
      if (!id) return;
      state.selectedType = "surface";
      state.selectedId = id;
      render();
    });
  });

  document.querySelectorAll("[data-cut-id]").forEach((node) => {
    node.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.cutId;
      if (!id) return;
      state.selectedType = "cut";
      state.selectedId = id;
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", handleAction);
  });
}

function handleAction(event) {
  const button = event.currentTarget;
  const action = button.dataset.action;
  const project = getCurrentProject();

  if (action === "logout") {
    localStorage.removeItem(STORAGE.session);
    state.user = null;
    state.projects = [];
    state.currentProjectId = null;
    state.selectedId = null;
    render();
    return;
  }

  if (action === "new-project") {
    const newProject = createDefaultProject(`${state.user.displayName || "Local"} Project`, "");
    newProject.surfaces = [];
    state.projects.push(newProject);
    state.currentProjectId = newProject.id;
    state.selectedId = null;
    saveProjects();
    localStorage.setItem(STORAGE.currentProject, newProject.id);
    showToast("New project created.");
    render();
    return;
  }

  if (action === "reset-demo") {
    const demo = createDemoProject();
    state.projects.push(demo);
    state.currentProjectId = demo.id;
    saveProjects();
    localStorage.setItem(STORAGE.currentProject, demo.id);
    showToast("Demo project loaded.");
    render();
    return;
  }

  if (action === "generate") {
    showToast("Plan regenerated with the current rules.");
    render();
    return;
  }

  if (action === "share-link") {
    copyShareLink();
    return;
  }

  if (action === "export-json" && project) {
    downloadProjectJson(project);
    return;
  }

  if (action === "export-packet" && project) {
    downloadInstallerPacket(project, generatePlan(project));
    return;
  }

  if (action === "import-project") {
    document.querySelector("#importProjectFile")?.click();
    const input = document.querySelector("#importProjectFile");
    input?.addEventListener("change", importProjectFromFile, { once: true });
    return;
  }

  if (action === "toggle-surface-flag" && project) {
    const surface = project.surfaces.find((item) => item.id === button.dataset.surfaceId);
    const flag = button.dataset.flag;
    if (!surface || !flag) return;
    surface[flag] = !surface[flag];
    touch(project);
    saveProjects();
    render();
    return;
  }

  if (action === "delete-surface" && project) {
    const surfaceId = button.dataset.surfaceId;
    project.surfaces = project.surfaces.filter((item) => item.id !== surfaceId);
    if (state.selectedId === surfaceId) state.selectedId = null;
    touch(project);
    saveProjects();
    showToast("Surface removed.");
    render();
    return;
  }

  if ((action === "toggle-cut-lock" || action === "toggle-cut-preserve") && project) {
    const cutId = button.dataset.cutId;
    if (!cutId) return;
    project.overrides.cutLocks ||= {};
    project.overrides.cutLocks[cutId] ||= {};
    if (action === "toggle-cut-lock") {
      project.overrides.cutLocks[cutId].locked = !project.overrides.cutLocks[cutId].locked;
    } else {
      project.overrides.cutLocks[cutId].preserve = !project.overrides.cutLocks[cutId].preserve;
    }
    touch(project);
    saveProjects();
    render();
  }
}

function readMaterialForm(data, existing) {
  return {
    ...existing,
    rollWidth: feet(Number(data.get("rollWidthFt") || 12)),
    rollLength: feet(Number(data.get("rollLengthFt") || 120)),
    materialType: String(data.get("materialType") || "broadloom"),
    directionalPile: data.has("directionalPile"),
    rotationAllowed: data.has("rotationAllowed"),
    cutMargin: inches(Number(data.get("cutMarginIn") || 2)),
    trimMargin: inches(Number(data.get("trimMarginIn") || 2)),
    patternEnabled: data.has("patternEnabled"),
    repeatWidth: inches(Number(data.get("repeatWidthIn") || 0)),
    repeatLength: inches(Number(data.get("repeatLengthIn") || 0)),
    matchType: String(data.get("matchType") || "none"),
    dropOffset: inches(Number(data.get("dropOffsetIn") || 0)),
    phaseTolerance: inches(Number(data.get("phaseToleranceIn") || 0.25))
  };
}

function readSurfaceForm(data) {
  const kind = String(data.get("kind") || "room");
  const name = String(data.get("name") || KIND_LABELS[kind] || "Surface").trim();
  const base = {
    id: makeId("surface"),
    name,
    kind,
    priority: String(data.get("priority") || "normal"),
    traffic: String(data.get("traffic") || "normal"),
    lockedSeam: false,
    forbidSeam: false,
    preserveRemnant: false,
    extraMargin: 0,
    createdAt: new Date().toISOString()
  };

  if (kind === "stair_run") {
    return {
      ...base,
      stairCount: Math.max(1, Math.round(Number(data.get("stairCount") || 1))),
      treadWidth: inches(Number(data.get("treadWidthIn") || 36)),
      treadDepth: inches(Number(data.get("treadDepthIn") || 10)),
      riserHeight: inches(Number(data.get("riserHeightIn") || 7.5)),
      stairAllowance: inches(Number(data.get("stairAllowanceIn") || 3)),
      runnerWidth: inches(Number(data.get("runnerWidthIn") || 30)),
      installStyle: String(data.get("installStyle") || "waterfall"),
      pileDirection: String(data.get("pileDirection") || "down_stairs")
    };
  }

  return {
    ...base,
    width: feet(Number(data.get("widthFt") || 10)),
    length: feet(Number(data.get("lengthFt") || 10)),
    returnWidth: feet(Number(data.get("returnWidthFt") || 0)),
    returnLength: feet(Number(data.get("returnLengthFt") || 0))
  };
}

function generatePlan(project) {
  const warnings = [];
  const material = normalizeMaterial(project.material);
  const islands = buildCutIslands(project, material, warnings);
  const packed = packIslands(islands, material, project.mode, project, warnings);
  applyFieldSense(project, material, islands, packed, warnings);
  const metrics = calculateMetrics(project, material, islands, packed, warnings);
  return {
    islands,
    placements: packed.placements,
    remnants: packed.remnants,
    warnings,
    metrics,
    patternEnabled: material.patternEnabled,
    explanation: explainPlan(project, metrics, warnings),
    usedLength: metrics.usedLength
  };
}

function emptyPlan() {
  return {
    islands: [],
    placements: [],
    remnants: [],
    warnings: [],
    metrics: {
      usedLength: 0,
      cutArea: 0,
      wasteArea: 0,
      wastePct: 0,
      usableRemnantPct: 0,
      seamRisk: 0,
      patternRisk: 0,
      installDifficulty: 0,
      confidence: 100,
      cutCount: 0
    },
    patternEnabled: false,
    explanation: "No project loaded.",
    usedLength: 0
  };
}

function buildCutIslands(project, material, warnings) {
  const islands = [];
  let order = 0;

  if (material.patternEnabled && (!material.repeatLength || !material.repeatWidth)) {
    warnings.push({
      level: "hard",
      title: "Pattern repeat missing",
      message: "Pattern is enabled, but repeat width or length is zero. The plan can draw cuts, but it cannot verify phase.",
      targetId: "material"
    });
  }

  for (const surface of project.surfaces) {
    const margin = material.cutMargin + material.trimMargin + (surface.extraMargin || 0);

    if (surface.kind === "stair_run") {
      const width = surface.installStyle === "runner" ? surface.runnerWidth : surface.treadWidth;
      const baseLength = surface.treadDepth + surface.riserHeight + surface.stairAllowance;
      const length = patternAdjustedLength(baseLength, material, project.mode);
      if (surface.stairAllowance < inches(2)) {
        warnings.push({
          level: "hard",
          title: "Stair allowance is thin",
          message: `${surface.name} has less than 2 inches of stair allowance. That is a tight place to be brave.`,
          targetId: surface.id
        });
      }
      for (let index = 0; index < surface.stairCount; index += 1) {
        islands.push(makeIsland({
          id: `${surface.id}-step-${index + 1}`,
          surface,
          name: `${surface.name} S-${String(index + 1).padStart(2, "0")}`,
          width: width + margin,
          length,
          order: order++,
          seamCount: 0,
          priorityBoost: 14,
          pileDirection: surface.pileDirection || "down_stairs",
          notes: [`${surface.installStyle.replaceAll("_", " ")} step piece`]
        }));
      }
      continue;
    }

    if (surface.kind === "l_room") {
      const mainWidth = surface.width + margin * 2;
      const mainLength = surface.length + margin * 2;
      const returnWidth = (surface.returnWidth || Math.round(surface.width * 0.42)) + margin * 2;
      const returnLength = (surface.returnLength || Math.round(surface.length * 0.46)) + margin * 2;
      addRectCuts(surface, mainWidth, mainLength, "main", 1, order, islands, material, project, warnings);
      order = islands.length;
      addRectCuts(surface, returnWidth, returnLength, "return", 1, order, islands, material, project, warnings);
      order = islands.length;
      warnings.push({
        level: "warning",
        title: "L-shape needs field layout",
        message: `${surface.name} is treated as two cut islands in this MVP. Field verify the inside corner and seam choice before cutting.`,
        targetId: surface.id
      });
      continue;
    }

    const width = surface.width + margin * 2;
    const length = surface.length + margin * 2;
    order = addRectCuts(surface, width, length, "drop", 1, order, islands, material, project, warnings);
  }

  return islands;
}

function addRectCuts(surface, width, rawLength, label, labelStart, orderStart, islands, material, project, warnings) {
  let order = orderStart;
  let cutWidth = width;
  let cutLength = patternAdjustedLength(rawLength, material, project.mode);
  let rotation = 0;

  const canRotate = material.rotationAllowed && !material.directionalPile && !material.patternEnabled;
  if (cutWidth > material.rollWidth && cutLength <= material.rollWidth && canRotate) {
    [cutWidth, cutLength] = [cutLength, cutWidth];
    rotation = 90;
    warnings.push({
      level: "info",
      title: "Rotation used",
      message: `${surface.name} is rotated in roll space because the material allows it. Verify this if the real carpet shades directionally.`,
      targetId: surface.id
    });
  }

  if (surface.forbidSeam && cutWidth > material.rollWidth) {
    warnings.push({
      level: "hard",
      title: "Forbidden seam conflicts with roll width",
      message: `${surface.name} forbids seams, but the requested width is wider than the roll. This needs a field decision or a wider material.`,
      targetId: surface.id
    });
  }

  if (cutWidth <= material.rollWidth) {
    islands.push(makeIsland({
      id: `${surface.id}-${label}-${labelStart}`,
      surface,
      name: `${surface.name} ${titleCase(label)}`,
      width: cutWidth,
      length: cutLength,
      order: order++,
      seamCount: 0,
      rotation,
      pileDirection: "with_room",
      notes: []
    }));
    return order;
  }

  const seamAllowance = inches(2);
  const dropCount = Math.ceil(cutWidth / material.rollWidth);
  for (let index = 0; index < dropCount; index += 1) {
    const isLast = index === dropCount - 1;
    const rawDropWidth = isLast ? cutWidth - material.rollWidth * (dropCount - 1) + seamAllowance : material.rollWidth;
    const dropWidth = clamp(rawDropWidth, inches(8), material.rollWidth);
    islands.push(makeIsland({
      id: `${surface.id}-${label}-${labelStart + index}`,
      surface,
      name: `${surface.name} ${titleCase(label)} ${index + 1}`,
      width: dropWidth,
      length: cutLength,
      order: order++,
      seamCount: index === 0 ? dropCount - 1 : 0,
      rotation,
      pileDirection: "with_room",
      notes: [`${dropCount} drop layout`]
    }));
    if (isLast && dropWidth < inches(18)) {
      warnings.push({
        level: "warning",
        title: "Tiny filler strip",
        message: `${surface.name} creates a ${formatUnits(dropWidth)} filler. It may save material, but it is not a friendly piece to install or explain.`,
        targetId: surface.id
      });
    }
  }

  warnings.push({
    level: surface.priority === "showpiece" || surface.traffic === "main" ? "warning" : "info",
    title: "Room needs multiple drops",
    message: `${surface.name} is wider than the roll and needs ${dropCount} drops. Check whether the seam lands in a traffic path or visible center line.`,
    targetId: surface.id
  });

  if (material.patternEnabled && material.matchType !== "none") {
    warnings.push({
      level: "warning",
      title: "Pattern seam needs field verify",
      message: `${surface.name} has a split drop with patterned material. The plan snaps length to repeat where it can, but phase still needs field verification.`,
      targetId: surface.id
    });
  }

  return order;
}

function makeIsland({ id, surface, name, width, length, order, seamCount, rotation = 0, priorityBoost = 0, pileDirection = "with_room", notes = [] }) {
  return {
    id,
    surfaceId: surface.id,
    surfaceName: surface.name,
    surfaceKind: surface.kind,
    name,
    width,
    length,
    area: width * length,
    order,
    seamCount,
    rotation,
    pileDirection,
    priority: surface.priority,
    traffic: surface.traffic,
    lockedSeam: surface.lockedSeam,
    preserveRemnant: surface.preserveRemnant,
    priorityBoost,
    notes
  };
}

function packIslands(islands, material, mode, project, warnings) {
  const sorted = sortIslands(islands, mode);
  const placements = [];
  const rows = [];
  let current = createRow(0);

  const closeRow = () => {
    if (!current.items.length) return;
    rows.push(current);
    current = createRow(current.v + current.height);
  };

  for (const island of sorted) {
    if (island.width > material.rollWidth) {
      warnings.push({
        level: "hard",
        title: "Cut exceeds roll width",
        message: `${island.name} is ${formatUnits(island.width)} wide, which exceeds the ${formatUnits(material.rollWidth)} roll.`,
        targetId: island.surfaceId
      });
      continue;
    }

    if (current.items.length && current.u + island.width > material.rollWidth) {
      closeRow();
    }

    if (!current.items.length && material.patternEnabled && mode === "pattern" && material.repeatLength) {
      current.v = ceilTo(current.v, material.repeatLength);
    }

    const placement = {
      ...island,
      kind: "cut",
      u: current.u,
      v: current.v,
      rollId: "R-001",
      locked: Boolean(project.overrides?.cutLocks?.[island.id]?.locked),
      preserve: Boolean(project.overrides?.cutLocks?.[island.id]?.preserve),
      patternEnabled: material.patternEnabled,
      patternPhaseU: material.patternEnabled && material.repeatWidth ? current.u % material.repeatWidth : 0,
      patternPhaseV: material.patternEnabled && material.repeatLength ? current.v % material.repeatLength : 0
    };
    placements.push(placement);
    current.items.push(placement);
    current.u += island.width;
    current.height = Math.max(current.height, island.length);
  }
  closeRow();

  const usedLength = rows.reduce((max, row) => Math.max(max, row.v + row.height), 0);
  if (material.rollLength && usedLength > material.rollLength) {
    warnings.push({
      level: "hard",
      title: "Roll length exceeded",
      message: `The plan consumes ${formatUnits(usedLength)}, which exceeds the available roll length of ${formatUnits(material.rollLength)}.`,
      targetId: "material"
    });
  }

  const remnants = [];
  rows.forEach((row, index) => {
    const remainingWidth = material.rollWidth - row.u;
    if (remainingWidth > inches(8) && row.height > inches(18)) {
      remnants.push(makeRemnant(`rem-row-${index + 1}`, row.u, row.v, remainingWidth, row.height));
    }
  });

  if (material.rollLength && material.rollLength - usedLength > feet(2)) {
    remnants.push(makeRemnant("rem-tail", 0, usedLength, material.rollWidth, material.rollLength - usedLength));
  }

  return { placements, rows, remnants, usedLength };
}

function createRow(v) {
  return { u: 0, v, height: 0, items: [] };
}

function makeRemnant(id, u, v, width, length) {
  const area = width * length;
  let suggestedUse = "trash";
  let usableScore = 8;
  if (width >= feet(6) && length >= feet(8)) {
    suggestedUse = "future_job";
    usableScore = 92;
  } else if (width >= feet(3) && length >= feet(4)) {
    suggestedUse = "closet";
    usableScore = 68;
  } else if (width >= inches(30) && length >= feet(3)) {
    suggestedUse = "repair";
    usableScore = 48;
  } else if (width >= inches(20) && length >= inches(36)) {
    suggestedUse = "stair";
    usableScore = 36;
  }
  return { id, u, v, width, length, area, usableScore, suggestedUse };
}

function sortIslands(islands, mode) {
  const priorityRank = { showpiece: 5, high: 4, normal: 3, low: 2, hidden: 1 };
  const trafficRank = { main: 4, normal: 3, furniture: 2, low: 1 };
  const modeKey = mode || "balanced";
  return islands.slice().sort((a, b) => {
    if (modeKey === "installer") {
      if (a.surfaceKind === "stair_run" && b.surfaceKind !== "stair_run") return -1;
      if (b.surfaceKind === "stair_run" && a.surfaceKind !== "stair_run") return 1;
      return a.order - b.order;
    }
    if (modeKey === "remnant") {
      if (a.surfaceKind === "closet" && b.surfaceKind !== "closet") return 1;
      if (b.surfaceKind === "closet" && a.surfaceKind !== "closet") return -1;
      return b.area - a.area || a.order - b.order;
    }
    if (modeKey === "waste") {
      return b.length - a.length || b.width - a.width || a.order - b.order;
    }
    if (modeKey === "seams" || modeKey === "pattern") {
      const aScore = (priorityRank[a.priority] || 0) * 100 + (trafficRank[a.traffic] || 0) * 20 + a.priorityBoost;
      const bScore = (priorityRank[b.priority] || 0) * 100 + (trafficRank[b.traffic] || 0) * 20 + b.priorityBoost;
      return bScore - aScore || a.order - b.order;
    }
    return b.area - a.area || a.order - b.order;
  });
}

function applyFieldSense(project, material, islands, packed, warnings) {
  const splitBySurface = new Map();
  islands.forEach((island) => {
    splitBySurface.set(island.surfaceId, (splitBySurface.get(island.surfaceId) || 0) + 1);
  });

  for (const surface of project.surfaces) {
    const count = splitBySurface.get(surface.id) || 0;
    if (surface.priority === "showpiece" && count > 1) {
      warnings.push({
        level: "warning",
        title: "Showpiece seam",
        message: `${surface.name} is marked showpiece and has ${count} cuts. Cleanest Seams mode may be the one you show the customer.`,
        targetId: surface.id
      });
    }
    if (surface.traffic === "main" && count > 1) {
      warnings.push({
        level: "warning",
        title: "Traffic path seam",
        message: `${surface.name} has a seam candidate in a main walking path. Technically valid is not the same as invisible after six months.`,
        targetId: surface.id
      });
    }
    if (surface.lockedSeam) {
      warnings.push({
        level: "info",
        title: "User locked seam",
        message: `${surface.name} has a locked seam decision. Re-optimization keeps that installer preference visible.`,
        targetId: surface.id
      });
    }
    if (surface.preserveRemnant) {
      warnings.push({
        level: "info",
        title: "Preserve remnant",
        message: `${surface.name} is marked for remnant preservation. The math will tolerate a little extra material for a useful leftover.`,
        targetId: surface.id
      });
    }
  }

  if (material.directionalPile && material.rotationAllowed) {
    warnings.push({
      level: "warning",
      title: "Rotation allowed with directional pile",
      message: "Rotation is enabled while directional pile is enabled. That can shade differently across an open transition. Verify before cutting.",
      targetId: "material"
    });
  }

  if (material.patternEnabled && material.matchType === "drop" && !material.dropOffset) {
    warnings.push({
      level: "hard",
      title: "Drop match offset missing",
      message: "Drop match is selected, but no drop offset is entered. The optimizer cannot know the next expected phase.",
      targetId: "material"
    });
  }

  const stairCuts = islands.filter((island) => island.surfaceKind === "stair_run");
  if (stairCuts.length > 0 && project.mode === "waste") {
    warnings.push({
      level: "warning",
      title: "Lowest Waste with stairs",
      message: "Lowest Waste can scatter stair pieces. If a crew has to think too hard on stairs, Installer Friendly mode is usually cheaper in real life.",
      targetId: stairCuts[0].surfaceId
    });
  }

  const closet = project.surfaces.find((surface) => surface.kind === "closet");
  const usefulRemnant = packed.remnants.find((remnant) => remnant.suggestedUse === "closet" || remnant.suggestedUse === "future_job");
  if (closet && usefulRemnant) {
    warnings.push({
      level: "good",
      title: "Closet can absorb a remnant",
      message: `${closet.name} is a good place for a less pretty cut or a remnant if the final field layout allows it.`,
      targetId: closet.id
    });
  }
}

function calculateMetrics(project, material, islands, packed, warnings) {
  const cutArea = islands.reduce((total, island) => total + island.area, 0);
  const usedLength = packed.usedLength;
  const consumedArea = material.rollWidth * usedLength;
  const wasteArea = Math.max(0, consumedArea - cutArea);
  const usableRemnantArea = packed.remnants
    .filter((remnant) => remnant.usableScore >= 48)
    .reduce((total, remnant) => total + remnant.area, 0);

  const seamPenalty = warnings.reduce((total, warning) => {
    if (/seam|drop|filler|traffic/i.test(`${warning.title} ${warning.message}`)) {
      return total + warningWeight(warning.level) * 7;
    }
    return total;
  }, 0);

  const patternPenalty = material.patternEnabled
    ? warnings.reduce((total, warning) => /pattern|phase|drop match/i.test(`${warning.title} ${warning.message}`) ? total + warningWeight(warning.level) * 9 : total, 12)
    : 3;

  const stairCount = project.surfaces.filter((surface) => surface.kind === "stair_run").reduce((total, surface) => total + (surface.stairCount || 0), 0);
  const installPenalty = islands.length * 1.3 + stairCount * 0.8 + warnings.filter((warning) => warning.level === "hard").length * 15;
  const wastePct = consumedArea ? (wasteArea / consumedArea) * 100 : 0;
  const usableRemnantPct = consumedArea ? (usableRemnantArea / consumedArea) * 100 : 0;
  const seamRisk = clamp(Math.round(14 + seamPenalty + Math.max(0, wastePct - 12)), 0, 100);
  const patternRisk = clamp(Math.round(patternPenalty), 0, 100);
  const installDifficulty = clamp(Math.round(10 + installPenalty), 0, 100);
  const confidence = clamp(Math.round(100 - (seamRisk * 0.22 + patternRisk * 0.28 + installDifficulty * 0.18 + warnings.filter((warning) => warning.level === "hard").length * 12)), 0, 100);

  return {
    usedLength,
    cutArea,
    wasteArea,
    wastePct,
    usableRemnantPct,
    seamRisk,
    patternRisk,
    installDifficulty,
    confidence,
    cutCount: islands.length
  };
}

function explainPlan(project, metrics, warnings) {
  const mode = MODES[project.mode] || MODES.balanced;
  const hard = warnings.filter((warning) => warning.level === "hard").length;
  const warn = warnings.filter((warning) => warning.level === "warning").length;
  if (!project.surfaces.length) {
    return "Add surfaces to generate a roll plan. The planner will unfold them into roll space and score the tradeoffs.";
  }
  if (hard) {
    return `${mode.label} generated a plan, but ${hard} hard issue${hard === 1 ? "" : "s"} must be fixed before anyone should cut material. The math is useful, not permission.`;
  }
  if (metrics.wastePct <= 9 && metrics.seamRisk < 38 && metrics.patternRisk < 38) {
    return `${mode.label} is giving a clean plan: ${metrics.wastePct.toFixed(1)}% waste, controlled seam risk, and no hard pattern blocks. Still field verify long repeats before cutting.`;
  }
  if (warn) {
    return `${mode.label} found a workable plan with ${metrics.wastePct.toFixed(1)}% waste, but it is carrying ${warn} installer warning${warn === 1 ? "" : "s"}. This is where the person with the knife gets the final vote.`;
  }
  return `${mode.label} generated a deterministic cut plan with ${metrics.wastePct.toFixed(1)}% waste and ${metrics.cutCount} cuts. Review the roll map, then export the installer packet.`;
}

function layoutSurfaces(surfaces) {
  const columns = 2;
  const cellW = 330;
  const cellH = 126;
  return surfaces.map((surface, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = 26 + col * cellW;
    const y = 46 + row * cellH;
    const maxW = 286;
    const maxH = 92;
    let realW = surface.kind === "stair_run" ? surface.treadWidth || inches(36) : surface.width || feet(8);
    let realH = surface.kind === "stair_run" ? (surface.stairCount || 10) * inches(9) : surface.length || feet(8);
    const scale = Math.min(maxW / Math.max(realW, 1), maxH / Math.max(realH, 1));
    return {
      surface,
      x,
      y,
      w: clamp(realW * scale, 70, maxW),
      h: clamp(realH * scale, 58, maxH)
    };
  });
}

function renderPatternLines(material, rollX, rollY, rollW, rollH, scaleX, scaleY, usedLength) {
  const lines = [];
  if (material.repeatWidth) {
    for (let u = material.repeatWidth; u < material.rollWidth; u += material.repeatWidth) {
      const x = rollX + u * scaleX;
      lines.push(`<line x1="${x}" y1="${rollY}" x2="${x}" y2="${rollY + rollH}" stroke="rgba(246,200,95,.22)" stroke-width="1"/>`);
    }
  }
  if (material.repeatLength) {
    for (let v = material.repeatLength; v < usedLength; v += material.repeatLength) {
      const y = rollY + v * scaleY;
      lines.push(`<line x1="${rollX}" y1="${y}" x2="${rollX + rollW}" y2="${y}" stroke="rgba(246,200,95,.20)" stroke-width="1"/>`);
    }
  }
  return lines.join("");
}

function renderRollFootMarks(rollX, rollY, rollW, rollH, rollWidth, usedLength) {
  const marks = [];
  for (let foot = 1; foot < rollWidth / FOOT; foot += 1) {
    const x = rollX + (foot * FOOT / rollWidth) * rollW;
    marks.push(`<line x1="${x}" y1="${rollY}" x2="${x}" y2="${rollY + rollH}" stroke="rgba(255,255,255,.08)" stroke-width="1"/>`);
  }
  const lengthFeet = Math.floor(usedLength / FOOT);
  for (let foot = 1; foot < lengthFeet; foot += 1) {
    const y = rollY + (foot * FOOT / usedLength) * rollH;
    marks.push(`<line x1="${rollX}" y1="${y}" x2="${rollX + rollW}" y2="${y}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`);
  }
  return marks.join("");
}

function renderPileArrow(x1, y1, x2, y2) {
  return `
    <g stroke="#f6c85f" stroke-width="2" fill="none">
      <path d="M${x1} ${y1} L${x2} ${y2}"/>
      <path d="M${x2} ${y2} l-9 -5"/>
      <path d="M${x2} ${y2} l-9 5"/>
    </g>
  `;
}

function getSelected(project, plan) {
  if (!state.selectedId) return null;
  if (state.selectedType === "cut") {
    const placement = plan.placements.find((item) => item.id === state.selectedId);
    return placement || null;
  }
  return project.surfaces.find((surface) => surface.id === state.selectedId) || null;
}

function seedUsers() {
  const users = getUsers();
  if (users.length) return;
  const demo = {
    id: "user-demo",
    username: "steve",
    displayName: "Steve",
    passwordHash: hashPassword("steve", "rollwright"),
    createdAt: new Date().toISOString()
  };
  setUsers([demo]);
}

function getSessionUser() {
  const session = readJson(STORAGE.session, null);
  if (!session?.userId) return null;
  return getUsers().find((user) => user.id === session.userId) || null;
}

function signIn(username, password) {
  const user = getUsers().find((item) => item.username === username);
  if (!user || user.passwordHash !== hashPassword(username, password)) {
    showToast("Login failed. Try steve / rollwright or create a local account.");
    return;
  }
  localStorage.setItem(STORAGE.session, JSON.stringify({ userId: user.id, signedInAt: new Date().toISOString() }));
  state.user = user;
  state.toast = "";
  loadProjects();
  render();
}

function createLocalUser(username, password, displayName) {
  const users = getUsers();
  if (users.some((user) => user.username === username)) {
    showToast("That username already exists in this browser.");
    return;
  }
  const user = {
    id: makeId("user"),
    username,
    displayName,
    passwordHash: hashPassword(username, password),
    createdAt: new Date().toISOString()
  };
  users.push(user);
  setUsers(users);
  localStorage.setItem(STORAGE.session, JSON.stringify({ userId: user.id, signedInAt: new Date().toISOString() }));
  state.user = user;
  state.toast = "";
  loadProjects();
  render();
}

function getUsers() {
  return readJson(STORAGE.users, []);
}

function setUsers(users) {
  localStorage.setItem(STORAGE.users, JSON.stringify(users));
}

function loadProjects() {
  if (!state.user) return;
  let projects = readJson(STORAGE.projectsFor(state.user.id), []);
  if (!projects.length) {
    projects = [createDemoProject()];
    localStorage.setItem(STORAGE.projectsFor(state.user.id), JSON.stringify(projects));
  }
  state.projects = projects;
  const storedProjectId = localStorage.getItem(STORAGE.currentProject);
  state.currentProjectId = projects.some((project) => project.id === storedProjectId) ? storedProjectId : projects[0]?.id;
  localStorage.setItem(STORAGE.currentProject, state.currentProjectId || "");
}

function saveProjects() {
  if (!state.user) return;
  localStorage.setItem(STORAGE.projectsFor(state.user.id), JSON.stringify(state.projects));
}

function getCurrentProject() {
  return state.projects.find((project) => project.id === state.currentProjectId) || state.projects[0] || null;
}

function createDemoProject() {
  const project = createDefaultProject("Smith Residence", "Smith Residence");
  project.material = {
    materialType: "broadloom",
    rollWidth: feet(12),
    rollLength: feet(120),
    directionalPile: true,
    rotationAllowed: false,
    patternEnabled: true,
    repeatWidth: inches(18),
    repeatLength: inches(24),
    matchType: "drop",
    dropOffset: inches(12),
    cutMargin: inches(2),
    trimMargin: inches(2),
    phaseTolerance: inches(0.25)
  };
  project.mode = "balanced";
  project.surfaces = [
    {
      id: makeId("surface"),
      name: "Living Room",
      kind: "room",
      width: feet(15),
      length: feet(18),
      priority: "showpiece",
      traffic: "main",
      lockedSeam: false,
      forbidSeam: false,
      preserveRemnant: false,
      extraMargin: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: makeId("surface"),
      name: "Hall",
      kind: "hall",
      width: feet(4),
      length: feet(22),
      priority: "high",
      traffic: "main",
      lockedSeam: false,
      forbidSeam: false,
      preserveRemnant: false,
      extraMargin: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: makeId("surface"),
      name: "Bedroom",
      kind: "room",
      width: feet(12),
      length: feet(14),
      priority: "normal",
      traffic: "normal",
      lockedSeam: false,
      forbidSeam: false,
      preserveRemnant: false,
      extraMargin: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: makeId("surface"),
      name: "Closet",
      kind: "closet",
      width: feet(5),
      length: feet(6),
      priority: "low",
      traffic: "low",
      lockedSeam: false,
      forbidSeam: false,
      preserveRemnant: true,
      extraMargin: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: makeId("surface"),
      name: "Main Stairs",
      kind: "stair_run",
      stairCount: 13,
      treadWidth: inches(36),
      treadDepth: inches(10),
      riserHeight: inches(7.5),
      stairAllowance: inches(3),
      runnerWidth: inches(30),
      installStyle: "waterfall",
      pileDirection: "down_stairs",
      priority: "high",
      traffic: "main",
      lockedSeam: false,
      forbidSeam: true,
      preserveRemnant: false,
      extraMargin: 0,
      createdAt: new Date().toISOString()
    }
  ];
  return project;
}

function createDefaultProject(name, client) {
  return {
    id: makeId("project"),
    name,
    client,
    mode: "balanced",
    material: {
      materialType: "broadloom",
      rollWidth: feet(12),
      rollLength: feet(100),
      directionalPile: true,
      rotationAllowed: false,
      patternEnabled: false,
      repeatWidth: inches(0),
      repeatLength: inches(0),
      matchType: "none",
      dropOffset: inches(0),
      cutMargin: inches(2),
      trimMargin: inches(2),
      phaseTolerance: inches(0.25)
    },
    surfaces: [],
    overrides: {
      cutLocks: {}
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function normalizeMaterial(material) {
  return {
    ...material,
    rollWidth: material.rollWidth || feet(12),
    rollLength: material.rollLength || feet(100),
    cutMargin: material.cutMargin ?? inches(2),
    trimMargin: material.trimMargin ?? inches(2),
    repeatWidth: material.repeatWidth || 0,
    repeatLength: material.repeatLength || 0,
    phaseTolerance: material.phaseTolerance || inches(0.25)
  };
}

function downloadProjectJson(project) {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "Rollwright local MVP",
    project
  };
  downloadText(`${slug(project.name)}.rollwright.json`, JSON.stringify(payload, null, 2), "application/json");
  showToast("Project JSON exported.");
}

function downloadInstallerPacket(project, plan) {
  const cutRows = plan.placements.map((cut, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(cut.name)}</td>
      <td>${escapeHtml(cut.surfaceName)}</td>
      <td>${formatUnits(cut.width)}</td>
      <td>${formatUnits(cut.length)}</td>
      <td>U ${formatUnits(cut.u)}, V ${formatUnits(cut.v)}</td>
      <td>${cut.patternEnabled ? `U ${formatUnits(cut.patternPhaseU)}, V ${formatUnits(cut.patternPhaseV)}` : "Off"}</td>
      <td>${cut.locked ? "Locked" : cut.preserve ? "Preserve" : "Field verify"}</td>
    </tr>
  `).join("");

  const stairRows = plan.placements.filter((cut) => cut.surfaceKind === "stair_run").map((cut, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(cut.name)}</td>
      <td>${formatUnits(cut.width)}</td>
      <td>${formatUnits(cut.length)}</td>
      <td>${escapeHtml(cut.pileDirection)}</td>
      <td>${cut.patternEnabled ? "Center or match previous. Field verify." : "No pattern profile."}</td>
    </tr>
  `).join("");

  const warningRows = plan.warnings.map((warning) => `
    <li><strong>${escapeHtml(warning.title)}:</strong> ${escapeHtml(warning.message)}</li>
  `).join("");

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(project.name)} Installer Packet</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111; margin: 28px; }
      h1, h2 { margin-bottom: 6px; }
      p { line-height: 1.45; }
      table { border-collapse: collapse; width: 100%; margin: 12px 0 24px; font-size: 12px; }
      th, td { border: 1px solid #999; padding: 7px; text-align: left; vertical-align: top; }
      th { background: #eee; }
      .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 16px 0; }
      .box { border: 1px solid #999; padding: 10px; }
      li { margin-bottom: 8px; }
      @media print { body { margin: 16mm; } }
    </style>
  </head>
  <body>
    <h1>Rollwright Installer Packet</h1>
    <p><strong>${escapeHtml(project.name)}</strong>${project.client ? ` for ${escapeHtml(project.client)}` : ""}</p>
    <p>${escapeHtml(plan.explanation)}</p>
    <div class="meta">
      <div class="box"><strong>Mode</strong><br>${escapeHtml(MODES[project.mode]?.label || project.mode)}</div>
      <div class="box"><strong>Used Length</strong><br>${formatUnits(plan.metrics.usedLength)}</div>
      <div class="box"><strong>Waste</strong><br>${plan.metrics.wastePct.toFixed(1)}%</div>
      <div class="box"><strong>Confidence</strong><br>${plan.metrics.confidence}%</div>
    </div>
    <h2>Cut List</h2>
    <table>
      <thead><tr><th>#</th><th>Piece</th><th>Surface</th><th>Width</th><th>Length</th><th>Roll Position</th><th>Pattern Phase</th><th>Note</th></tr></thead>
      <tbody>${cutRows}</tbody>
    </table>
    <h2>Stair Worksheet</h2>
    <table>
      <thead><tr><th>Step</th><th>Piece</th><th>Width</th><th>Length</th><th>Direction</th><th>Pattern Note</th></tr></thead>
      <tbody>${stairRows || `<tr><td colspan="6">No stair cuts in this project.</td></tr>`}</tbody>
    </table>
    <h2>FieldSense Notes</h2>
    <ul>${warningRows || "<li>No warnings. Field verify before cutting.</li>"}</ul>
  </body>
</html>`;
  downloadText(`${slug(project.name)}-installer-packet.html`, html, "text/html");
  showToast("Installer packet exported as HTML.");
}

function importProjectFromFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      const project = parsed.project || parsed;
      if (!project?.name || !Array.isArray(project.surfaces)) {
        throw new Error("Not a Rollwright project file.");
      }
      project.id = makeId("project");
      project.name = `${project.name} Import`;
      project.overrides ||= { cutLocks: {} };
      touch(project);
      state.projects.push(project);
      state.currentProjectId = project.id;
      saveProjects();
      localStorage.setItem(STORAGE.currentProject, project.id);
      showToast("Project imported.");
      render();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Import failed.");
    }
  });
  reader.readAsText(file);
}

function copyShareLink() {
  const url = window.location.href;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(
      () => showToast("Local link copied. For someone else, use this machine's LAN IP and port 4173."),
      () => showToast(url)
    );
  } else {
    showToast(url);
  }
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  state.toast = message;
  render();
  window.setTimeout(() => {
    if (state.toast === message) {
      state.toast = "";
      render();
    }
  }, 3200);
}

function patternAdjustedLength(length, material, mode) {
  if (!material.patternEnabled || !material.repeatLength) return length;
  if (mode === "waste") return length;
  return ceilTo(length, material.repeatLength);
}

function surfaceRiskLabel(surface, cuts, plan) {
  const hasHard = plan.warnings.some((warning) => warning.targetId === surface.id && warning.level === "hard");
  const hasWarn = plan.warnings.some((warning) => warning.targetId === surface.id && warning.level === "warning");
  if (hasHard) return { label: "Invalid", className: "bad" };
  if (hasWarn) return { label: "Field verify", className: "warn" };
  if (cuts.length > 1) return { label: "Seamed", className: "info" };
  return { label: "Clean", className: "good" };
}

function surfaceSummary(surface) {
  if (surface.kind === "stair_run") {
    return `${surface.stairCount} stairs, ${formatUnits(surface.treadWidth)} wide`;
  }
  const base = `${formatUnits(surface.width)} x ${formatUnits(surface.length)}`;
  if (surface.kind === "l_room") {
    return `${base}, return ${formatUnits(surface.returnWidth)} x ${formatUnits(surface.returnLength)}`;
  }
  return base;
}

function fact(label, value) {
  return `<div class="fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function checkboxField(name, label, checked) {
  return `
    <label class="checkbox-field" for="${name}">
      <input id="${name}" name="${name}" type="checkbox" ${checked ? "checked" : ""} />
      <span>${label}</span>
    </label>
  `;
}

function numberField(name, label, value, step) {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="number" step="${step}" min="0" value="${Number.isFinite(value) ? value : 0}" />
    </div>
  `;
}

function option(value, label, selected) {
  return `<option value="${escapeAttr(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function icon(name) {
  const paths = {
    login: "M10 17l5-5-5-5v3H3v4h7v3zm4 4h5a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-5v2h5v14h-5v2z",
    plus: "M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z",
    roll: "M6 4h9a5 5 0 0 1 0 10H8v6H6V4zm2 2v6h7a3 3 0 0 0 0-6H8zm2 10h9v2h-9v-2z",
    upload: "M12 3l5 5h-3v7h-4V8H7l5-5zm-7 14h14v3H5v-3z",
    download: "M10 3h4v8h3l-5 5-5-5h3V3zm-5 15h14v3H5v-3z",
    link: "M8 12a4 4 0 0 1 4-4h3v2h-3a2 2 0 0 0 0 4h3v2h-3a4 4 0 0 1-4-4zm1 1h6v-2H9v2zm3-5h3a4 4 0 0 1 0 8h-3v-2h3a2 2 0 0 0 0-4h-3V8z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0v1H5v-1z",
    logout: "M5 4h8v2H7v12h6v2H5V4zm10 4l5 4-5 4v-3H9v-2h6V8z",
    refresh: "M5 12a7 7 0 0 1 12-5V4h2v7h-7V9h4a5 5 0 1 0 1 5h2A7 7 0 0 1 5 12z",
    lock: "M7 10V8a5 5 0 0 1 10 0v2h1v10H6V10h1zm2 0h6V8a3 3 0 0 0-6 0v2z",
    ban: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM7.8 9.2l7 7A6 6 0 0 1 7.8 9.2zm8.4 5.6l-7-7a6 6 0 0 1 7 7z",
    tag: "M4 5v6l8 8 7-7-8-7H4zm4 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z",
    trash: "M8 6V4h8v2h4v2H4V6h4zm-1 4h10l-1 10H8L7 10z",
    print: "M7 7V3h10v4H7zm0 10H5v-7h14v7h-2v4H7v-4zm2-1v3h6v-3H9z"
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${paths[name] || paths.roll}"/></svg>`;
}

function warningWeight(level) {
  return level === "hard" ? 5 : level === "warning" ? 3 : level === "good" ? -1 : 1;
}

function riskClass(value) {
  return value < 34 ? "risk-low" : value < 67 ? "risk-mid" : "risk-high";
}

function colorForKind(kind) {
  return COLORS[kind] || COLORS.room;
}

function feet(value) {
  return Math.round(Number(value || 0) * INCHES_PER_FOOT * UNITS_PER_INCH);
}

function inches(value) {
  return Math.round(Number(value || 0) * UNITS_PER_INCH);
}

function toFeetNumber(units) {
  return Number((Number(units || 0) / FOOT).toFixed(3));
}

function toInchesNumber(units) {
  return Number((Number(units || 0) / UNITS_PER_INCH).toFixed(3));
}

function formatUnits(units) {
  const totalSixteenths = Math.round(Number(units || 0));
  const sign = totalSixteenths < 0 ? "-" : "";
  const abs = Math.abs(totalSixteenths);
  const feetPart = Math.floor(abs / FOOT);
  const remaining = abs - feetPart * FOOT;
  const inchesPart = Math.floor(remaining / UNITS_PER_INCH);
  const sixteenths = remaining - inchesPart * UNITS_PER_INCH;
  const inchText = sixteenths ? `${inchesPart} ${fraction(sixteenths)}` : `${inchesPart}`;
  if (feetPart && inchesPart) return `${sign}${feetPart}' ${inchText}"`;
  if (feetPart) return `${sign}${feetPart}'`;
  return `${sign}${inchText}"`;
}

function formatArea(areaUnits) {
  const squareFeet = Number(areaUnits || 0) / (FOOT * FOOT);
  return `${squareFeet.toFixed(1)} sq ft`;
}

function fraction(sixteenths) {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const divisor = gcd(sixteenths, 16);
  return `${sixteenths / divisor}/${16 / divisor}`;
}

function ceilTo(value, increment) {
  if (!increment) return value;
  return Math.ceil(value / increment) * increment;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function titleCase(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function shortLabel(value, maxLength) {
  const text = String(value || "");
  return text.length > maxLength ? `${text.slice(0, Math.max(0, maxLength - 1))}.` : text;
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function touch(project) {
  project.updatedAt = new Date().toISOString();
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function hashPassword(username, password) {
  return cyrb53(`${username.toLowerCase()}::${password}::rollwright-local-v1`).toString(16);
}

function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let index = 0, ch; index < str.length; index += 1) {
    ch = str.charCodeAt(index);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function slug(value) {
  return String(value || "rollwright-project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "rollwright-project";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function escapeSvg(value) {
  return escapeHtml(value);
}
