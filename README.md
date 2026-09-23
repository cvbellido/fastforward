# FastForward Logistics Dashboard

This project is a single-route executive operations dashboard for FastForward Logistics, built with Vue, TypeScript, Vuetify, and Chart.js.

## Current Features

- Theme-aware header with separate light/dark logo assets
- Custom month filter with `All Months` year-to-date mode
- Four KPI summary cards with neon-accent icon badges
- Monthly shipment volume bar chart
- Regional performance doughnut chart
- On-time delivery trend chart
- Exceptions trend chart
- Regional performance breakdown table
- Shipment tracking board with truck selector, status badges, route map, and lane details
- Light-mode accessibility-tuned status chips, checkpoint badge, and chart accents

## Data Behavior

- Source data lives in `src/data/metrics.json`
- The dataset contains all months for 2025
- The UI currently treats October through December as pending in charts and YTD calculations

## Stack

- Vue 3
- TypeScript
- Vite
- Vuetify 4
- Vue Router
- Chart.js + `vue-chartjs`
- Material Design Icons via `@mdi/font`

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Notes

- The dashboard is implemented primarily in `src/views/HomeView.vue`
- Theme configuration lives in `src/main.ts`
- Static logos are served from `public/`
- The header and tracking selectors use custom menu-based dropdown controls for consistent theme styling
- Light mode keeps the dark-mode brand palette, but uses darker accessible accent variants where neon colors would be too low-contrast on white
