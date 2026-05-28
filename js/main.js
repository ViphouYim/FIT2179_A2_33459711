const charts = [
  [
    "map_hhri",
    "js/specs/01_map_hhri.json"
  ],
  [
    "weather_event_bar",
    "js/specs/02_weather_event_bar.json"
  ],
  [
    "yearly_line",
    "js/specs/03_yearly_line.json"
  ],
  [
    "top10_hhri",
    "js/specs/04_top10_hhri.json"
  ],
  [
    "state_components",
    "js/specs/05_state_components_stacked.json"
  ],
  [
    "scatter_exposure_vulnerability",
    "js/specs/06_scatter_exposure_vulnerability.json"
  ],
  [
    "scatter_housing_health",
    "js/specs/07_scatter_housing_health.json"
  ],
  [
    "bubble_older_heat",
    "js/specs/08_bubble_older_heat.json"
  ],
  [
    "boxplot_state",
    "js/specs/09_boxplot_state.json"
  ],
  [
    "histogram_hhri",
    "js/specs/10_histogram_hhri.json"
  ],
  [
    "heatmap_top_components",
    "js/specs/11_heatmap_top_components.json"
  ],
  [
    "scatter_seifa_hhri",
    "js/specs/12_scatter_seifa_hhri.json"
  ]
];

const embedOptions = { actions: false, renderer: 'svg' };
const cacheBust = `?v=${Date.now()}`;
charts.forEach(([id, spec]) => {
  vegaEmbed(`#${id}`, spec + cacheBust, embedOptions).catch(error => {
    console.error(`Could not load ${id}`, error);
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<p class="chart-error">Chart could not load. Check file paths and run through a local server.</p>`;
  });
});
