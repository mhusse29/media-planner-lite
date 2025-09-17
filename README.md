# Media Planner Lite

Media Planner Lite is a Vite-powered React application that helps marketers turn channel assumptions into a shareable media plan. Provide a total budget, choose the platforms you want to invest in, and compare projected impressions, clicks, leads, revenue, and return on ad spend across channels. The app also includes tooling for currency conversion so teams working in different markets can collaborate with confidence.

## Features

- 📊 **Scenario planning** – calculate expected performance for each supported platform based on configurable goals and assumptions.
- 🧮 **Automatic totals** – quickly see blended CTR, CPC, CPM, CAC, and ROAS across your selected mix.
- 💾 **CSV export** – download a ready-to-share media plan that includes platform-level metrics and roll-up totals.
- 🌍 **FX management** – load, persist, and refresh exchange rates with sensible defaults and caching.
- 🎨 **Responsive UI** – built with Tailwind CSS for a clean layout that works on both desktop and mobile screens.

## Getting started

```bash
# install dependencies
npm install

# start the dev server
npm run dev

# run the test suite
npm test
```

Open the local development URL shown in the terminal (usually <http://localhost:5173/>) to interact with the planner.

## Building for production

Generate an optimized production bundle with:

```bash
npm run build
```

You can then preview the production build locally:

```bash
npm run preview
```

## Project structure

- `src/lib` – core business logic for budgeting, forecasting, CSV export, and FX utilities.
- `src/components` – React components for user interaction and results visualization.
- `docs/` – supplementary documentation and design references.

## Tooling

- [Vite](https://vitejs.dev/) for fast development builds.
- [React](https://react.dev/) with TypeScript for type-safe UI development.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [Vitest](https://vitest.dev/) for unit testing.

## Contributing

1. Create a branch for your change.
2. Run the test suite and ensure everything passes.
3. Open a pull request describing the updates and screenshots for significant UI changes.

We welcome issues and contributions that improve the planning experience!
