const charts = [
  ["map_hhri",                      "js/specs/01_map_hhri.json"],
  ["weather_event_bar",             "js/specs/02_weather_event_bar.json"],
  ["yearly_line",                   "js/specs/03_yearly_line.json"],
  ["top10_hhri",                    "js/specs/04_top10_hhri.json"],
  ["state_components",              "js/specs/05_state_components_stacked.json"],
  ["scatter_exposure_vulnerability", "js/specs/06_scatter_exposure_vulnerability.json"],
  ["scatter_housing_health",        "js/specs/07_scatter_housing_health.json"],
  ["bubble_older_heat",             "js/specs/08_bubble_older_heat.json"],
  ["boxplot_state",                 "js/specs/09_boxplot_state.json"],
  ["histogram_hhri",                "js/specs/10_histogram_hhri.json"],
  ["heatmap_top_components",        "js/specs/11_heatmap_top_components.json"],
  ["scatter_seifa_hhri",            "js/specs/12_scatter_seifa_hhri.json"]
];

const embedOptions = { actions: false, renderer: "svg" };
const cacheBust = `?v=${Date.now()}`;
const views = {};

// Charts whose stateFilter signal responds to the global dropdown
const STATE_FILTERED = ["map_hhri", "scatter_exposure_vulnerability", "boxplot_state", "scatter_housing_health", "bubble_older_heat"];

// ── Top-10 SA2 data for the planning profile card ──────────────────────────
let top10Lookup = {};  // keyed by region_name

function parseCSVRow(line) {
  const result = [];
  let field = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"')            { inQuote = !inQuote; }
    else if (c === "," && !inQuote) { result.push(field); field = ""; }
    else                      { field += c; }
  }
  result.push(field);
  return result;
}

fetch(`data/top10_hhri.csv${cacheBust}`)
  .then(r => r.text())
  .then(text => {
    const lines = text.trim().split("\n");
    const headers = parseCSVRow(lines[0]);
    lines.slice(1).forEach(line => {
      const vals = parseCSVRow(line);
      const row = {};
      headers.forEach((h, i) => { row[h.trim()] = (vals[i] || "").trim(); });
      if (row.region_name) top10Lookup[row.region_name] = row;
    });
  })
  .catch(err => console.warn("top10_hhri.csv not pre-loaded:", err));

// ── Embed all charts and store views ──────────────────────────────────────
Promise.all(
  charts.map(([id, spec]) =>
    vegaEmbed(`#${id}`, spec + cacheBust, embedOptions)
      .then(result => { views[id] = result.view; })
      .catch(error => {
        console.error(`Could not load ${id}`, error);
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<p class="chart-error">Chart could not load. Check file paths and run through a local server.</p>`;
      })
  )
).then(() => {
  wireStateFilter();
  wireProfileCard();
});

// ── Global state filter ────────────────────────────────────────────────────
function wireStateFilter() {
  const select = document.getElementById("global-state-filter");
  const status = document.getElementById("state-filter-status");
  if (!select) return;

  select.addEventListener("change", function () {
    const state = this.value || null;

    STATE_FILTERED.forEach(id => {
      if (views[id]) {
        try { views[id].signal("stateFilter", state).run(); }
        catch (e) { console.warn(`stateFilter signal not available on ${id}`, e); }
      }
    });

    if (status) {
      status.textContent = state ? `Showing: ${state}` : "All states shown";
    }
  });
}

// ── Planning profile card ──────────────────────────────────────────────────
const DRIVERS = [
  { key: "exposure_index",      label: "Heat exposure",       color: "#c4410c",
    response: "Cooling centres, shade infrastructure, and local heat alert systems" },
  { key: "vulnerability_index", label: "Social vulnerability", color: "#e8883a",
    response: "Community welfare checks and emergency support for vulnerable residents" },
  { key: "housing_index",       label: "Housing pressure",    color: "#d97706",
    response: "Rental cooling support, housing upgrades, and green infrastructure" },
  { key: "health_status_index", label: "Health vulnerability", color: "#8d3f18",
    response: "Targeted health outreach and local emergency health planning" }
];

function wireProfileCard() {
  const heatView = views["heatmap_top_components"];
  if (!heatView) return;

  heatView.addEventListener("click", function (event, item) {
    if (item && item.datum && item.datum.region_name) {
      showProfileCard(item.datum.region_name);
    }
  });
}

function showProfileCard(regionName) {
  const sa2 = top10Lookup[regionName];
  const card = document.getElementById("profile-card");
  if (!card) return;

  if (!sa2) {
    card.innerHTML = `<p class="profile-card-empty">No profile data available for <strong>${regionName}</strong>.</p>`;
    card.classList.remove("hidden");
    return;
  }

  const scored = DRIVERS
    .map(d => ({ ...d, score: parseFloat(sa2[d.key]) || 0 }))
    .sort((a, b) => b.score - a.score);
  const dominant  = scored[0];
  const secondary = scored[1];
  const adaptiveScore = parseFloat(sa2.adaptive_capacity_index) || 0;
  const lowAdaptive   = adaptiveScore < 0.1;

  const scoreRows = DRIVERS.map(d => {
    const score = (parseFloat(sa2[d.key]) || 0);
    const pct   = Math.round(score * 100);
    return `<div class="profile-score-row${d.key === dominant.key ? " profile-dominant" : ""}">
      <span class="profile-score-name">${d.label}</span>
      <div class="profile-score-bar-wrap"><div class="profile-score-bar" style="width:${pct}%;background:${d.color}"></div></div>
      <span class="profile-score-value">${score.toFixed(3)}</span>
    </div>`;
  }).join("");

  card.innerHTML = `
    <div class="profile-card-inner">
      <div class="profile-card-header">
        <div class="profile-card-heading">
          <span class="profile-card-kicker">Planning Profile</span>
          <h3 class="profile-card-title">${regionName}</h3>
          <span class="profile-card-state">${sa2.state_name}</span>
        </div>
        <div class="profile-card-hhri">
          <span class="profile-hhri-num">${(parseFloat(sa2.hhri) || 0).toFixed(3)}</span>
          <span class="profile-hhri-label">HHRI</span>
        </div>
        <button class="profile-card-close" onclick="hideProfileCard()" aria-label="Close profile">&times;</button>
      </div>
      <div class="profile-scores">${scoreRows}</div>
      ${lowAdaptive ? `<p class="profile-adaptive-warn">Adaptive capacity is critically low (${adaptiveScore.toFixed(3)}) &mdash; limited access to support services amplifies all other risks.</p>` : ""}
      <div class="profile-card-response">
        <p class="profile-response-label">Primary driver: <strong>${dominant.label}</strong> &middot; Secondary: ${secondary.label}</p>
        <p class="profile-response-text">${dominant.response}</p>
      </div>
    </div>
  `;
  card.classList.remove("hidden");
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideProfileCard() {
  const card = document.getElementById("profile-card");
  if (card) card.classList.add("hidden");
}

