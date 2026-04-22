const app = document.querySelector("#v2-app");
const UNIT = 16;
const FOOT = 192;
const STORAGE_KEY = "rollwright:v2:project";

const tabs = ["Home", "Seams", "Material Space", "Blueprint", "Stairs", "View", "Reports", "AI Review", "Help"];
const tools = {
  Home: ["Select", "Room", "Hall", "Closet", "Landing", "Stairs", "Assign", "Optimize", "Export"],
  Seams: ["Place", "Move", "Lock", "Forbid", "Traffic", "Natural", "Verify", "Explain", "Audit"],
  "Material Space": ["Origin", "Direction", "Repeat", "Drop", "Center", "Phase", "No Rotate", "Replace", "Preview"],
  Blueprint: ["Import", "Scale", "OCR", "Search", "Heatmap", "Trace", "Review", "Re-run", "Pages"],
  Stairs: ["Wizard", "Waterfall", "Hollywood", "Runner", "Landing", "Center", "Worksheet", "Nose", "Verify"],
  View: ["Fit", "Area", "Zoom In", "Zoom Out", "Warnings", "Mini Map", "Floor", "Roll", "Pattern"],
  Reports: ["Installer", "Quote", "Roll Map", "Seam Map", "Scope", "Catalog", "Checklist", "JSON", "Audit"],
  "AI Review": ["Model", "Analyze", "Catalog", "Scope", "Jobs", "Memory", "Approve", "Reject", "Explain"],
  Help: ["Guide", "Shortcuts", "Support", "Docs", "About", "Checks", "Reset", "V1", "Roadmap"]
};

const state = loadState();

function defaultState() {
  return {
    activeTab: "Home",
    activeRail: "products",
    activeView: "floor-roll",
    activeMaterialId: "mat-cpt1",
    selectedSurfaceId: "surf-living",
    command: "",
    aiEndpoint: "http://127.0.0.1:8088/v1",
    aiStatus: "stopped",
    toast: "",
    materials: [
      {
        id: "mat-cpt1",
        code: "CPT-1",
        name: "Shaw Contract Broadloom",
        type: "Broadloom",
        color: "#4f85c7",
        rollWidth: feet(12),
        repeat: "18 in x 24 in",
        drop: "12 in",
        directional: true,
        rotate: false,
        source: "Manual V2 demo",
        confidence: 1,
        status: "approved",
        missing: []
      },
      {
        id: "mat-lvt2",
        code: "LVT-2",
        name: "Division 9 LVT",
        type: "LVT",
        color: "#be584f",
        rollWidth: null,
        repeat: "24 in tile",
        drop: "",
        directional: false,
        rotate: true,
        source: "AI draft from Finish Schedule",
        confidence: 0.72,
        status: "draft",
        missing: ["unit cost", "transition detail"]
      },
      {
        id: "mat-rb1",
        code: "RB-1",
        name: "Rubber Base",
        type: "Rubber Base",
        color: "#5b9b68",
        rollWidth: null,
        repeat: "",
        drop: "",
        directional: false,
        rotate: true,
        source: "AI draft",
        confidence: 0.64,
        status: "draft",
        missing: ["height", "color"]
      }
    ],
    surfaces: [
      { id: "surf-living", name: "001 Living", role: "showpiece", materialId: "mat-cpt1", x: 70, y: 70, w: 250, h: 170, priority: "showpiece", traffic: "main", seam: "review", type: "room" },
      { id: "surf-hall", name: "002 Hall", role: "hall", materialId: "mat-cpt1", x: 320, y: 142, w: 250, h: 70, priority: "high", traffic: "main", seam: "natural", type: "hall" },
      { id: "surf-bed", name: "003 Bedroom", role: "bedroom", materialId: "mat-cpt1", x: 410, y: 245, w: 170, h: 130, priority: "normal", traffic: "normal", seam: "ok", type: "room" },
      { id: "surf-closet", name: "004 Closet", role: "closet", materialId: "mat-cpt1", x: 585, y: 245, w: 80, h: 92, priority: "low", traffic: "low", seam: "remnant", type: "closet" },
      { id: "surf-lvt", name: "005 Entry", role: "entry", materialId: "mat-lvt2", x: 70, y: 275, w: 210, h: 96, priority: "normal", traffic: "main", seam: "ok", type: "room" },
      { id: "surf-stairs", name: "006 Stairs", role: "stairs", materialId: "mat-cpt1", x: 590, y: 70, w: 72, h: 152, priority: "high", traffic: "main", seam: "blocked", type: "stairs", stairs: 13 }
    ],
    annotations: [
      { id: "ann-1", targetId: "surf-living", type: "field_verify", text: "Pattern seam in showpiece room needs review.", severity: "warning" },
      { id: "ann-2", targetId: "surf-stairs", type: "hard_block", text: "Do not seam on stair nose.", severity: "hard" }
    ],
    aiDrafts: [],
    jobs: [
      { id: "job-1", name: "Plan set scan", status: "needs review", detail: "CPT-1 found, roll width verified, stair material unclear." },
      { id: "job-2", name: "OCR search index", status: "ready", detail: "Search terms indexed for demo pages." }
    ],
    planText: "Finish Schedule A601\nCPT-1 Shaw Contract broadloom carpet, 12 ft roll, pattern repeat 18 in x 24 in, drop match 12 in.\nLVT-2 Division 9 luxury vinyl tile at entry.\nRB-1 rubber base throughout.\nStairs to receive CPT-1, verify install method.\nTransitions at entry and hall to be field verified.",
    memory: [
      "Human correction: CPT-1 roll width is 12 ft.",
      "Human correction: stairs use CPT-1 unless superseded."
    ]
  };
}

function loadState() {
  try {
    return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return defaultState();
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  app.innerHTML = `
    <div class="app">
      ${renderTopFrame()}
      <main class="workspace">
        ${renderRail()}
        ${renderSidebar()}
        ${renderCanvas()}
        ${renderInspector()}
      </main>
      ${state.toast ? `<div class="toast">${escape(state.toast)}</div>` : ""}
    </div>
  `;
  bind();
}

function renderTopFrame() {
  return `
    <header class="top-frame">
      <div class="title-row">
        <button class="hamburger" data-action="menu" title="Project menu">${icon("menu")}</button>
        <div class="brand"><strong>Rollwright V2</strong><span>Desktop-ready local AI prototype</span></div>
        <input class="command-search" value="${escapeAttr(state.command)}" placeholder="Command search: add stair, set pattern repeat, optimize roll, find CPT-1" data-command />
        <div class="status-strip">
          ${badge("V2", "info")}
          ${badge(state.aiStatus === "running" ? "AI Running" : "AI Local", state.aiStatus === "running" ? "good" : "warn")}
          ${badge(`${warnings().length} Warnings`, warnings().some(w => w.level === "hard") ? "bad" : "warn")}
        </div>
      </div>
      <nav class="ribbon-tabs">
        ${tabs.map(tab => `<button class="tab ${state.activeTab === tab ? "active" : ""}" data-tab="${tab}">${tab}</button>`).join("")}
      </nav>
      <section class="ribbon">
        ${renderRibbonGroups(state.activeTab)}
      </section>
    </header>
  `;
}

function renderRibbonGroups(tab) {
  const list = tools[tab] || tools.Home;
  const chunks = [
    ["Product", list.slice(0, 3)],
    ["Draw", list.slice(3, 6)],
    [tab === "AI Review" ? "AI Workflow" : "Tools", list.slice(6)]
  ];
  return chunks.map(([title, items]) => `
    <div class="group">
      <div class="tool-grid">
        ${items.map(item => `<button class="tool ${item === "Select" ? "active" : ""}" title="${toolTip(item)}" data-tool="${item}">${toolIcon(item)}</button>`).join("")}
      </div>
      <div class="group-title">${title}</div>
    </div>
  `).join("") + renderActiveMaterialGroup();
}

function renderActiveMaterialGroup() {
  const mat = material(state.activeMaterialId);
  return `
    <div class="group" style="min-width:250px">
      <div class="material-top">
        <span class="swatch" style="background:${mat.color}"></span>
        <div style="min-width:0; flex:1">
          <strong>${escape(mat.code)} ${escape(mat.name)}</strong>
          <p class="small">${mat.rollWidth ? `Roll ${format(mat.rollWidth)}` : "No roll width"} | ${mat.repeat || "No repeat"} | ${mat.directional ? "Directional" : "Non-directional"}</p>
        </div>
      </div>
      <div class="group-title">Active Material</div>
    </div>
  `;
}

function renderRail() {
  const items = [
    ["products", "Products", "doc"],
    ["ai", "AI Review", "ai"],
    ["scope", "Scope Board", "warn"],
    ["jobs", "Jobs", "jobs"],
    ["views", "Views", "view"],
    ["reports", "Reports", "report"]
  ];
  return `<aside class="rail">${items.map(([id, label, ico]) => `<button class="${state.activeRail === id ? "active" : ""}" title="${label}" data-rail="${id}">${icon(ico)}</button>`).join("")}</aside>`;
}

function renderSidebar() {
  const title = {
    products: "Material Library",
    ai: "AI Review",
    scope: "Missing Scope",
    jobs: "Background Jobs",
    views: "Saved Views",
    reports: "Reports"
  }[state.activeRail];
  return `
    <aside class="sidebar">
      <div class="panel-head"><h2>${title}</h2>${badge("Local", "info")}</div>
      <div class="panel-body">
        ${renderRailPanel()}
      </div>
    </aside>
  `;
}

function renderRailPanel() {
  if (state.activeRail === "ai") return renderAiPanel();
  if (state.activeRail === "scope") return renderScopePanel();
  if (state.activeRail === "jobs") return renderJobsPanel();
  if (state.activeRail === "views") return renderViewsPanel();
  if (state.activeRail === "reports") return renderReportsPanel();
  return renderProductsPanel();
}

function renderProductsPanel() {
  return `
    <div class="field"><label>Search materials</label><input placeholder="CPT-1, LVT, broadloom, base" data-search /></div>
    <div class="material-list">
      ${state.materials.map(mat => `
        <article class="material ${mat.id === state.activeMaterialId ? "active" : ""}" data-material="${mat.id}">
          <div class="material-top">
            <span class="swatch" style="background:${mat.color}"></span>
            <div style="flex:1">
              <strong>${escape(mat.code)} - ${escape(mat.name)}</strong>
              <p>${escape(mat.type)} | ${mat.rollWidth ? format(mat.rollWidth) : "missing roll width"} | ${escape(mat.repeat || "missing repeat")}</p>
            </div>
            ${badge(mat.status === "approved" ? "Approved" : "AI Draft", mat.status === "approved" ? "good" : "warn")}
          </div>
          <div class="button-row" style="margin-top:8px">
            ${mat.directional ? badge("Directional", "info") : badge("Rotatable", "good")}
            ${mat.drop ? badge("Drop", "warn") : ""}
            ${mat.missing.length ? badge(`${mat.missing.length} Missing`, "bad") : badge("Ready", "good")}
          </div>
          <div class="source">${escape(mat.source)} | confidence ${Math.round(mat.confidence * 100)}%</div>
        </article>
      `).join("")}
    </div>
    <button class="btn primary" data-action="add-draft-material">Add draft material</button>
  `;
}

function renderAiPanel() {
  return `
    <div class="card">
      <h3>Model Manager</h3>
      <p class="small">Runtime: llama.cpp sidecar target. Endpoint: ${escape(state.aiEndpoint)}</p>
      <div class="field"><label>Local endpoint</label><input value="${escapeAttr(state.aiEndpoint)}" data-ai-endpoint /></div>
      <div class="button-row" style="margin-top:8px">
        <button class="btn primary" data-action="test-ai">Test AI</button>
        <button class="btn" data-action="mark-ai-running">Mark running</button>
        <button class="btn" data-action="mark-ai-stopped">Stop</button>
      </div>
    </div>
    <div class="card">
      <h3>Plan Analyzer</h3>
      <div class="field"><label>Plan text / OCR text</label><textarea data-plan-text>${escape(state.planText)}</textarea></div>
      <div class="button-row" style="margin-top:8px">
        <button class="btn primary" data-action="analyze-plan">Analyze</button>
        <button class="btn" data-action="approve-drafts">Approve drafts</button>
      </div>
    </div>
    <div class="card">
      <h3>Draft Extractions</h3>
      <div class="material-list">
        ${state.aiDrafts.length ? state.aiDrafts.map(draft => `
          <article class="material">
            <strong>${escape(draft.code)} - ${escape(draft.name)}</strong>
            <p>${escape(draft.type)} | ${escape(draft.rollWidth || "missing roll width")} | ${escape(draft.repeat || "missing repeat")}</p>
            <div class="source">${escape(draft.source)} | confidence ${Math.round(draft.confidence * 100)}%</div>
          </article>
        `).join("") : `<p class="small">No draft products yet. Paste plan text and run Analyze.</p>`}
      </div>
    </div>
  `;
}

function renderScopePanel() {
  const items = missingScope();
  return `
    <div class="scope-list">
      ${items.map(item => `
        <div class="card">
          <div class="material-top"><h3>${escape(item.title)}</h3>${badge(item.level === "hard" ? "Blocker" : "Review", item.level === "hard" ? "bad" : "warn")}</div>
          <p class="small">${escape(item.detail)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function renderJobsPanel() {
  return `
    <div class="jobs">
      ${state.jobs.map(job => `
        <div class="card">
          <div class="material-top"><h3>${escape(job.name)}</h3>${badge(job.status, job.status === "ready" ? "good" : "warn")}</div>
          <p class="small">${escape(job.detail)}</p>
        </div>
      `).join("")}
      <button class="btn primary" data-action="queue-ai-job">Queue re-analysis</button>
    </div>
  `;
}

function renderViewsPanel() {
  return `
    <div class="card"><h3>Saved Views</h3><p class="small">Whole plan, stairs, roll map, problem seams, pattern phase.</p></div>
    <div class="button-row">
      <button class="btn" data-view="floor-roll">Floor + Roll</button>
      <button class="btn" data-view="pattern">Pattern Space</button>
      <button class="btn" data-view="installer">Installer Space</button>
    </div>
  `;
}

function renderReportsPanel() {
  return `
    <div class="card"><h3>Exports</h3><p class="small">Generate installer packet, customer quote, roll map, seam map, stair worksheet, missing scope report, and JSON archive.</p></div>
    <div class="button-row">
      <button class="btn primary" data-action="export-json">Export JSON</button>
      <button class="btn" data-action="export-packet">Installer packet</button>
    </div>
  `;
}

function renderCanvas() {
  return `
    <section class="canvas-zone">
      <div class="view-tabs">
        ${["floor-roll", "pattern", "installer"].map(view => `<button class="${state.activeView === view ? "active" : ""}" data-view="${view}">${viewLabel(view)}</button>`).join("")}
      </div>
      <div class="canvas-grid">
        <div class="viewport">${renderFloorSvg()}</div>
        <div class="viewport dark">${renderRollSvg()}</div>
      </div>
      <div class="canvas-footer">
        ${badge("Floor Space", "info")}
        ${badge("Roll Space", "info")}
        ${badge("Pattern Space", "warn")}
        ${badge("Installer Space", "good")}
        <span>Select a room or cut to cross-highlight the plan.</span>
      </div>
    </section>
  `;
}

function renderFloorSvg() {
  return `
    <svg viewBox="0 0 760 520" role="img" aria-label="V2 floor plan">
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="rgba(20,20,20,.13)" stroke-width="1"/>
        </pattern>
        <pattern id="hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="18" stroke="rgba(255,255,255,.23)" stroke-width="5"/>
        </pattern>
      </defs>
      <rect width="760" height="520" fill="#f1efe7"/>
      <rect width="760" height="520" fill="url(#grid)"/>
      <path d="M55 55 H680 V392 H55 Z" fill="none" stroke="${"#d94aa7"}" stroke-width="5"/>
      ${state.surfaces.map(surface => surface.type === "stairs" ? stairShape(surface) : roomShape(surface)).join("")}
      ${renderFloorWarnings()}
      <text x="18" y="500" fill="#333" font-size="12">Main | Carpet | LVT | AI Review | Roll Map</text>
    </svg>
  `;
}

function roomShape(surface) {
  const mat = material(surface.materialId);
  const selected = state.selectedSurfaceId === surface.id;
  return `
    <g data-surface="${surface.id}">
      <rect x="${surface.x}" y="${surface.y}" width="${surface.w}" height="${surface.h}" fill="${mat.color}" fill-opacity=".68" stroke="${selected ? "#111" : "#d94aa7"}" stroke-width="${selected ? 4 : 2}" data-surface="${surface.id}"/>
      ${state.activeView === "pattern" ? `<rect x="${surface.x}" y="${surface.y}" width="${surface.w}" height="${surface.h}" fill="url(#hatch)" opacity=".55" data-surface="${surface.id}"/>` : ""}
      <text x="${surface.x + 10}" y="${surface.y + 22}" fill="#111" font-size="13" font-weight="700">${escapeSvg(surface.name)}</text>
      <text x="${surface.x + 10}" y="${surface.y + 40}" fill="#333" font-size="11">${escapeSvg(mat.code)} | ${escapeSvg(surface.role)}</text>
      ${pileArrow(surface.x + 18, surface.y + surface.h - 18, surface.x + Math.min(surface.x + surface.w - 25, surface.x + 104), surface.y + surface.h - 18)}
      ${surface.seam === "review" ? `<line x1="${surface.x + surface.w * .68}" y1="${surface.y + 8}" x2="${surface.x + surface.w * .68}" y2="${surface.y + surface.h - 8}" stroke="#f2c462" stroke-width="3" stroke-dasharray="7 5"/>` : ""}
    </g>
  `;
}

function stairShape(surface) {
  const mat = material(surface.materialId);
  const step = surface.h / surface.stairs;
  return `
    <g data-surface="${surface.id}">
      <rect x="${surface.x}" y="${surface.y}" width="${surface.w}" height="${surface.h}" fill="rgba(0,0,0,.03)" stroke="${state.selectedSurfaceId === surface.id ? "#111" : "#d94aa7"}" stroke-width="3" data-surface="${surface.id}"/>
      ${Array.from({ length: surface.stairs }).map((_, i) => `<rect x="${surface.x + 9}" y="${surface.y + i * step + 2}" width="${surface.w - 18}" height="${Math.max(4, step - 3)}" fill="${mat.color}" opacity=".72" stroke="#333" stroke-width=".7" data-surface="${surface.id}"/>`).join("")}
      <text x="${surface.x - 8}" y="${surface.y + surface.h + 18}" text-anchor="end" fill="#111" font-size="12" font-weight="700">${surface.name}</text>
      ${pileArrow(surface.x + surface.w + 12, surface.y + 12, surface.x + surface.w + 12, surface.y + surface.h - 12)}
    </g>
  `;
}

function renderFloorWarnings() {
  return warnings().map((warning, i) => {
    const surface = state.surfaces.find(s => s.id === warning.targetId) || state.surfaces[i % state.surfaces.length];
    const x = surface.x + surface.w - 18;
    const y = surface.y + 18;
    const color = warning.level === "hard" ? "#ff7373" : "#f2c462";
    return `<circle cx="${x}" cy="${y}" r="10" fill="${color}" stroke="#111" stroke-width="2"><title>${escape(warning.title)}</title></circle>`;
  }).join("");
}

function renderRollSvg() {
  const placements = rollPlan();
  return `
    <svg viewBox="0 0 620 760" role="img" aria-label="V2 roll map">
      <defs>
        <pattern id="rollGrid" width="42" height="42" patternUnits="userSpaceOnUse">
          <path d="M42 0H0V42" fill="none" stroke="rgba(100,220,233,.11)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="620" height="760" fill="#101315"/>
      <rect x="42" y="42" width="536" height="650" fill="rgba(255,255,255,.03)" stroke="#64dce9" stroke-width="2"/>
      <rect x="42" y="42" width="536" height="650" fill="url(#rollGrid)"/>
      <text x="42" y="25" fill="#9aa6ad" font-size="12">Roll U/V space | U = width | V = length | deterministic draft</text>
      ${placements.map(p => `
        <g data-surface="${p.surface.id}">
          <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="4" fill="${material(p.surface.materialId).color}" fill-opacity="${state.selectedSurfaceId === p.surface.id ? ".62" : ".34"}" stroke="${state.selectedSurfaceId === p.surface.id ? "#fff" : material(p.surface.materialId).color}" stroke-width="${state.selectedSurfaceId === p.surface.id ? 3 : 1.5}" data-surface="${p.surface.id}"/>
          <text x="${p.x + 8}" y="${p.y + 20}" fill="#eef2f4" font-size="11" font-weight="700">${escapeSvg(p.surface.name)}</text>
          <text x="${p.x + 8}" y="${p.y + 36}" fill="#9aa6ad" font-size="10">${p.widthLabel} x ${p.lengthLabel}</text>
          <line x1="${p.x + 8}" y1="${p.y + p.h - 14}" x2="${p.x + Math.min(p.w - 8, 70)}" y2="${p.y + p.h - 14}" stroke="#f2c462" stroke-width="2"/>
        </g>
      `).join("")}
      <rect x="400" y="610" width="178" height="82" fill="#334047" fill-opacity=".58" stroke="#9aa6ad" stroke-dasharray="6 5"/>
      <text x="410" y="630" fill="#9aa6ad" font-size="11">USABLE REMNANT</text>
      <text x="42" y="725" fill="#9aa6ad" font-size="12">Pattern and seam validation remain field-verify until material data is approved.</text>
    </svg>
  `;
}

function renderInspector() {
  const surface = state.surfaces.find(s => s.id === state.selectedSurfaceId) || state.surfaces[0];
  const mat = material(surface.materialId);
  return `
    <aside class="inspector">
      <div class="panel-head"><h2>Inspector</h2>${badge(surface.name, "info")}</div>
      <div class="panel-body">
        <div class="metric-grid">
          ${metric("Waste", `${metrics().waste}%`)}
          ${metric("Seam Risk", metrics().seam)}
          ${metric("Pattern", metrics().pattern)}
          ${metric("Install", metrics().install)}
        </div>
        <div class="card">
          <h3>Selected Surface</h3>
          <p class="small">${escape(surface.name)} | ${escape(surface.role)} | ${escape(surface.priority)} priority | ${escape(surface.traffic)} traffic</p>
          <div class="field"><label>Assigned material</label><select data-assign-material>${state.materials.map(m => `<option value="${m.id}" ${m.id === surface.materialId ? "selected" : ""}>${escape(m.code)} - ${escape(m.name)}</option>`).join("")}</select></div>
          <div class="button-row" style="margin-top:8px">
            <button class="btn warn" data-action="lock-seam">Lock seam</button>
            <button class="btn" data-action="forbid-seam">Forbid seam</button>
            <button class="btn" data-action="add-note">Add field note</button>
          </div>
        </div>
        <div class="card">
          <h3>Material Intelligence</h3>
          <p class="small">${escape(mat.code)} | ${mat.rollWidth ? format(mat.rollWidth) : "missing roll width"} | ${escape(mat.repeat || "missing repeat")} | ${mat.directional ? "directional pile" : "rotation allowed"}</p>
          <div class="button-row">
            ${mat.status === "approved" ? badge("Approved", "good") : badge("AI Draft", "warn")}
            ${mat.rotate ? badge("Rotate OK", "good") : badge("No Rotate", "warn")}
            ${mat.missing.length ? badge(`${mat.missing.length} Missing`, "bad") : badge("Complete", "good")}
          </div>
        </div>
        <div class="card">
          <h3>FieldSense</h3>
          <div class="warning-list">
            ${warnings().map(w => `
              <div class="material" data-warning="${w.targetId}">
                <div class="material-top"><strong>${escape(w.title)}</strong>${badge(w.level === "hard" ? "Hard" : "Review", w.level === "hard" ? "bad" : "warn")}</div>
                <p>${escape(w.message)}</p>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="card">
          <h3>Memory</h3>
          ${state.memory.map(item => `<p class="small">${escape(item)}</p>`).join("")}
        </div>
      </div>
    </aside>
  `;
}

function bind() {
  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
    state.activeTab = btn.dataset.tab;
    saveRender();
  }));
  document.querySelectorAll("[data-rail]").forEach(btn => btn.addEventListener("click", () => {
    state.activeRail = btn.dataset.rail;
    if (state.activeRail === "ai") state.activeTab = "AI Review";
    saveRender();
  }));
  document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => {
    state.activeView = btn.dataset.view;
    saveRender();
  }));
  document.querySelectorAll("[data-material]").forEach(node => node.addEventListener("click", () => {
    state.activeMaterialId = node.dataset.material;
    saveRender();
  }));
  document.querySelectorAll("[data-surface]").forEach(node => node.addEventListener("click", () => {
    state.selectedSurfaceId = node.dataset.surface;
    saveRender();
  }));
  document.querySelector("[data-assign-material]")?.addEventListener("change", event => {
    const surface = state.surfaces.find(s => s.id === state.selectedSurfaceId);
    if (surface) surface.materialId = event.target.value;
    saveRender();
  });
  document.querySelector("[data-command]")?.addEventListener("change", event => {
    state.command = event.target.value;
    handleCommand(state.command);
  });
  document.querySelector("[data-ai-endpoint]")?.addEventListener("change", event => {
    state.aiEndpoint = event.target.value;
    saveRender();
  });
  document.querySelector("[data-plan-text]")?.addEventListener("change", event => {
    state.planText = event.target.value;
    save();
  });
  document.querySelectorAll("[data-action]").forEach(btn => btn.addEventListener("click", () => handleAction(btn.dataset.action)));
}

function handleAction(action) {
  if (action === "test-ai") return testAi();
  if (action === "mark-ai-running") {
    state.aiStatus = "running";
    toast("Local AI marked running. Wire this to Tauri start_local_ai when the sidecar lands.");
  }
  if (action === "mark-ai-stopped") {
    state.aiStatus = "stopped";
    toast("Local AI marked stopped.");
  }
  if (action === "analyze-plan") analyzePlanText();
  if (action === "approve-drafts") approveDrafts();
  if (action === "add-draft-material") addDraftMaterial();
  if (action === "queue-ai-job") queueJob();
  if (action === "export-json") exportJson();
  if (action === "export-packet") exportPacket();
  if (action === "lock-seam") {
    addAnnotation("installer_preference", "Installer locked seam decision for selected surface.", "warning");
  }
  if (action === "forbid-seam") {
    addAnnotation("hard_block", "Seam forbidden on selected surface.", "hard");
  }
  if (action === "add-note") {
    addAnnotation("field_verify", "Field verify selected surface before final cut.", "warning");
  }
  saveRender();
}

async function testAi() {
  try {
    const res = await fetch(`${state.aiEndpoint}/models`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.aiStatus = "running";
    toast("Local AI endpoint responded.");
  } catch (error) {
    state.aiStatus = "stopped";
    toast("Local AI did not respond. V2 will use fallback extraction until llama-server is running.");
  }
  saveRender();
}

function analyzePlanText() {
  const text = state.planText;
  const drafts = [];
  const finishTag = /\b([A-Z]{2,4}-\d+)\b/g;
  const tags = [...new Set([...text.matchAll(finishTag)].map(m => m[1]))];
  tags.forEach(tag => {
    const line = text.split(/\r?\n/).find(row => row.includes(tag)) || text;
    const type = /LVT/i.test(line) ? "LVT" : /base/i.test(line) ? "Rubber Base" : /carpet|broadloom|CPT/i.test(line) ? "Broadloom" : "Flooring";
    const roll = line.match(/(\d+(?:\.\d+)?)\s*ft\s*roll/i)?.[1];
    const repeat = line.match(/repeat\s+([^.,\n]+)/i)?.[1] || "";
    drafts.push({
      id: `draft-${Date.now()}-${tag}`,
      code: tag,
      name: line.replace(tag, "").trim().slice(0, 48) || "AI extracted product",
      type,
      rollWidth: roll ? `${roll} ft` : "",
      repeat,
      source: "Plan text analyzer",
      confidence: roll || repeat ? 0.82 : 0.58,
      missing: [roll ? "" : "roll width", repeat ? "" : "pattern repeat"].filter(Boolean)
    });
  });
  state.aiDrafts = drafts;
  state.jobs.unshift({ id: `job-${Date.now()}`, name: "Plan text analysis", status: "needs review", detail: `${drafts.length} draft products extracted.` });
  toast(`${drafts.length} draft products extracted. Review before optimizer trust.`);
}

function approveDrafts() {
  state.aiDrafts.forEach(draft => {
    if (state.materials.some(mat => mat.code === draft.code)) return;
    state.materials.push({
      id: `mat-${draft.code.toLowerCase()}`,
      code: draft.code,
      name: draft.name || "Approved AI product",
      type: draft.type,
      color: draft.type === "LVT" ? "#be584f" : draft.type === "Rubber Base" ? "#5b9b68" : "#4f85c7",
      rollWidth: draft.rollWidth ? feet(Number(draft.rollWidth.match(/\d+(?:\.\d+)?/)?.[0] || 0)) : null,
      repeat: draft.repeat,
      drop: "",
      directional: draft.type === "Broadloom",
      rotate: draft.type !== "Broadloom",
      source: draft.source,
      confidence: draft.confidence,
      status: "approved",
      missing: draft.missing
    });
  });
  state.aiDrafts = [];
  toast("Draft products approved into the material catalog.");
}

function addDraftMaterial() {
  state.materials.push({
    id: `mat-draft-${Date.now()}`,
    code: "NEW-1",
    name: "Draft Material",
    type: "Broadloom",
    color: "#8a74d6",
    rollWidth: null,
    repeat: "",
    drop: "",
    directional: true,
    rotate: false,
    source: "Manual draft",
    confidence: 0.5,
    status: "draft",
    missing: ["roll width", "pattern repeat"]
  });
  toast("Draft material added.");
}

function queueJob() {
  state.jobs.unshift({ id: `job-${Date.now()}`, name: "Re-analyze with memory", status: "waiting", detail: "Queued. Human corrections will be preserved as truth." });
  toast("Background AI job queued.");
}

function addAnnotation(type, text, severity) {
  state.annotations.push({ id: `ann-${Date.now()}`, targetId: state.selectedSurfaceId, type, text, severity });
  toast(text);
}

function handleCommand(command) {
  const q = command.toLowerCase();
  if (q.includes("stair")) {
    state.activeTab = "Stairs";
    state.selectedSurfaceId = "surf-stairs";
    toast("Jumped to stair tools.");
  } else if (q.includes("pattern") || q.includes("repeat")) {
    state.activeTab = "Material Space";
    state.activeView = "pattern";
    toast("Pattern space selected.");
  } else if (q.includes("optimize") || q.includes("roll")) {
    state.activeView = "floor-roll";
    toast("Roll plan regenerated.");
  } else if (q.includes("cpt")) {
    state.activeRail = "products";
    state.activeMaterialId = "mat-cpt1";
    toast("CPT-1 selected.");
  }
  saveRender();
}

function exportJson() {
  download("rollwright-v2-project.json", JSON.stringify(state, null, 2), "application/json");
  toast("V2 project JSON exported.");
}

function exportPacket() {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Rollwright V2 Installer Packet</title><style>body{font-family:Arial,sans-serif;margin:28px;color:#111}table{border-collapse:collapse;width:100%;font-size:12px}td,th{border:1px solid #999;padding:7px;text-align:left}th{background:#eee}</style></head><body><h1>Rollwright V2 Installer Packet</h1><p>Deterministic draft plan. Field verify before cutting.</p><h2>Warnings</h2><ul>${warnings().map(w => `<li><strong>${escape(w.title)}</strong>: ${escape(w.message)}</li>`).join("")}</ul><h2>Cut Plan</h2><table><thead><tr><th>Surface</th><th>Material</th><th>Width</th><th>Length</th><th>Note</th></tr></thead><tbody>${rollPlan().map(p => `<tr><td>${escape(p.surface.name)}</td><td>${escape(material(p.surface.materialId).code)}</td><td>${p.widthLabel}</td><td>${p.lengthLabel}</td><td>Field verify pattern and seams</td></tr>`).join("")}</tbody></table></body></html>`;
  download("rollwright-v2-installer-packet.html", html, "text/html");
  toast("Installer packet exported.");
}

function warnings() {
  const list = [];
  state.materials.forEach(mat => {
    if (mat.status !== "approved") list.push({ level: "warning", title: `${mat.code} unapproved`, message: "AI or draft material cannot feed final optimization until approved.", targetId: state.surfaces.find(s => s.materialId === mat.id)?.id });
    if (mat.type === "Broadloom" && !mat.rollWidth) list.push({ level: "hard", title: `${mat.code} missing roll width`, message: "Missing roll width blocks roll optimization.", targetId: state.surfaces.find(s => s.materialId === mat.id)?.id });
    if (mat.type === "Broadloom" && !mat.repeat) list.push({ level: "warning", title: `${mat.code} missing pattern repeat`, message: "Pattern repeat missing. Use field verify for pattern matching.", targetId: state.surfaces.find(s => s.materialId === mat.id)?.id });
  });
  state.surfaces.forEach(surface => {
    if (surface.priority === "showpiece" && surface.seam === "review") list.push({ level: "warning", title: "Showpiece seam review", message: `${surface.name} has a visible seam candidate in a high-value space.`, targetId: surface.id });
    if (surface.type === "stairs") list.push({ level: "hard", title: "Stair nose seam blocked", message: "No seam on stair nose. Stair sequence requires installer review.", targetId: surface.id });
  });
  state.annotations.forEach(ann => list.push({ level: ann.severity === "hard" ? "hard" : "warning", title: ann.type.replaceAll("_", " "), message: ann.text, targetId: ann.targetId }));
  return list.filter(item => item.targetId);
}

function missingScope() {
  return warnings().map(w => ({ title: w.title, detail: w.message, level: w.level }));
}

function metrics() {
  const hard = warnings().filter(w => w.level === "hard").length;
  const warn = warnings().filter(w => w.level !== "hard").length;
  return {
    waste: 9.8,
    seam: Math.min(100, 22 + warn * 8 + hard * 12),
    pattern: Math.min(100, 18 + state.materials.filter(m => m.type === "Broadloom" && !m.repeat).length * 22),
    install: Math.min(100, 26 + state.surfaces.length * 3 + hard * 10)
  };
}

function rollPlan() {
  let y = 58;
  let x = 58;
  return state.surfaces.map((surface, index) => {
    const w = surface.type === "stairs" ? 92 : Math.min(250, Math.max(92, surface.w * .64));
    const h = surface.type === "stairs" ? 162 : Math.min(150, Math.max(58, surface.h * .55));
    if (x + w > 548) {
      x = 58;
      y += 170;
    }
    const placement = { surface, x, y, w, h, widthLabel: surface.type === "stairs" ? "3'" : `${Math.round(surface.w / 18)}'`, lengthLabel: surface.type === "stairs" ? "13 pcs" : `${Math.round(surface.h / 12)}'` };
    x += w + 14;
    return placement;
  });
}

function material(id) {
  return state.materials.find(mat => mat.id === id) || state.materials[0];
}

function metric(label, value) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function badge(text, kind) {
  return `<span class="badge ${kind || ""}">${escape(String(text))}</span>`;
}

function pileArrow(x1, y1, x2, y2) {
  return `<g stroke="#111" stroke-width="2"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><path d="M${x2} ${y2} l-8 -5"/><path d="M${x2} ${y2} l-8 5"/></g>`;
}

function toolIcon(item) {
  const first = item.slice(0, 1).toUpperCase();
  const map = { Select: "P", Room: "R", Hall: "H", Closet: "C", Landing: "L", Stairs: "S", Optimize: "O", Export: "E" };
  return map[item] || first;
}

function toolTip(item) {
  return `${item}: ${item === "Optimize" ? "regenerate deterministic roll plan" : item === "Stairs" ? "open stair-specific tools" : "Rollwright command"}`;
}

function viewLabel(view) {
  return { "floor-roll": "Floor + Roll", pattern: "Pattern Space", installer: "Installer Space" }[view] || view;
}

function icon(name) {
  const paths = {
    menu: "M4 7h16v2H4V7zm0 4h16v2H4v-2zm0 4h16v2H4v-2z",
    doc: "M6 3h9l4 4v14H6V3zm8 1v4h4",
    ai: "M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z",
    warn: "M12 3l10 18H2L12 3zm-1 6h2v6h-2V9zm0 8h2v2h-2v-2z",
    jobs: "M5 5h14v4H5V5zm0 6h14v4H5v-4zm0 6h14v2H5v-2z",
    view: "M12 5c5 0 9 7 9 7s-4 7-9 7-9-7-9-7 4-7 9-7zm0 4a3 3 0 100 6 3 3 0 000-6z",
    report: "M6 3h12v18H6V3zm3 5h6v2H9V8zm0 4h6v2H9v-2zm0 4h4v2H9v-2z"
  };
  return `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${paths[name] || paths.doc}"/></svg>`;
}

function saveRender() {
  save();
  render();
}

function toast(message) {
  state.toast = message;
  save();
  render();
  setTimeout(() => {
    if (state.toast === message) {
      state.toast = "";
      save();
      render();
    }
  }, 2600);
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function feet(value) {
  return Math.round(Number(value || 0) * FOOT);
}

function format(units) {
  if (!units) return "";
  const ft = Math.floor(units / FOOT);
  const inches = Math.round((units - ft * FOOT) / UNIT);
  return inches ? `${ft}' ${inches}"` : `${ft}'`;
}

function escape(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function escapeAttr(value) { return escape(value); }
function escapeSvg(value) { return escape(value); }

render();
