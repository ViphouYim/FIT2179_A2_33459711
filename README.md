# Heat, Housing and Health Risk Across Australia — Vega-Lite webpage template

This folder follows a single-page report style with bordered containers inspired by your W9 webpage structure and the annual report reference.

## How to run
Use a local server, not direct file opening:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Files
- `index.html` — single scrollable webpage layout
- `css/styles.css` — report/container styling
- `js/main.js` — embeds every Vega-Lite chart
- `js/specs/*.json` — Vega-Lite specifications
- `data/*.csv` — cleaned chart data
- `data/sa2_2021_simplified.geojson` — simplified SA2 boundary file

## Main join key
`region_code` in CSV joins to `SA2_CODE21` in the map geometry.

## Note
This is a working prototype. You should edit the narrative text, footer metadata, source notes, and annotations before submission.
