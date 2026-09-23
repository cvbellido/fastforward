# FastForward Logistics - Operations Dashboard

## Current Scope
An internal operations dashboard for FastForward Logistics leadership. The current build is a single-route Vue/Vuetify dashboard with a custom top shell, KPI cards, charting, regional performance breakdown, and a shipment tracking board.

## Current Data Model
Dashboard metrics live in `my-dashboard/src/data/metrics.json`.

- Source data covers January through December 2026.
- The UI treats October through December as pending and only uses January through September in year-to-date totals and trend visualizations.
- Metrics include:
  - `shipment_volume`
  - `on_time_delivery_rate`
  - `regional_performance`
  - `open_exceptions`

## Implemented UI
- Custom header shell with theme-aware FastForward logo, custom month selector, and dark/light toggle
- Four KPI cards:
  - Shipment Volume
  - On-Time Rate
  - Open Exceptions
  - Best Region
- Monthly Shipment Volume bar chart
- Regional Performance doughnut chart
- On-Time Delivery Trend line chart
- Exceptions Trend line/area chart
- Regional Performance Breakdown table with status chips
- Shipment Tracking section with:
  - custom truck selector with integrated label
  - truck status chip for Active, Standby, and Delay Watch states
  - speed/load/update/progress metrics
  - route timeline
  - stylized route map
  - checkpoint badge tied to selected truck status colors
  - origin/destination/ETA/progress footer rail

## Behavior
- `All Months` shows YTD totals/averages using January through September only.
- Selecting a specific month updates the KPI cards and month-specific metrics.
- Trend charts continue to show the full month axis, with pending months visually marked.
- Dark and light mode are both supported.
- Custom dropdown controls are used instead of stock selects for predictable label, icon, and closed-state text rendering.

## Visual Direction
- Dark mode is the primary presentation mode.
- Light mode uses the same layout with contrast-safe overrides for form fields, charts, tracking surfaces, status chips, and checkpoint badges.
- KPI icon badges and chart accents use a neon-inspired palette:
  - cyan
  - magenta
  - orange
  - green
  - indigo
- In light mode, the brightest neon accents shift to darker brand-adjacent tones where needed to preserve readability and accessibility on white surfaces.

## Tech
- Vue 3 + TypeScript
- Vite
- Vuetify 4
- Vue Router with a single active route
- Chart.js via `vue-chartjs`
- Material Design Icons via `@mdi/font`
