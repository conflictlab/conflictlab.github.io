# GEMINI.md: Project Context for `websitePaCE`

This document provides a comprehensive overview of the `websitePaCE` project, designed to serve as a quick-start guide and reference for developers.

## Project Overview

`websitePaCE` is the official website for the **PaCE (Patterns in Conflict Escalation)** research project at Trinity College Dublin. The site serves as a public-facing platform to disseminate the project's findings, including geopolitical conflict forecasts, research publications, and methodology.

The project is a modern, statically-generated web application built with:

*   **Framework:** [Next.js](https://nextjs.org/) (using the App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Mapping:** [Leaflet](https://leafletjs.com/) and [react-leaflet](https://react-leaflet.js.org/) for interactive maps.
*   **Deployment:** Statically exported and configured for deployment via GitHub Pages.

A key feature of the website is its data pipeline. Forecast data (e.g., conflict risk probabilities) is regularly synchronized from an external GitHub repository, processed by scripts in the `/scripts` directory, and stored as JSON snapshots in the `/content/forecasts` directory. These snapshots are then used to render visualizations like the choropleth map on the homepage.

## Building and Running

The project uses `npm` as its package manager.

### Prerequisites

*   Node.js (version 18 or higher)
*   npm (included with Node.js)

### Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The site will be available at [http://localhost:3000](http://localhost:3000).

### Production Build

1.  **Build the static site:**
    ```bash
    npm run build
    ```
    This command triggers a `prebuild` script (`scripts/prebuild.js`) that handles data processing and generates static assets in the `out/` directory, ready for deployment.

2.  **Run linters:**
    ```bash
    npm run lint
    ```

## Development Conventions

*   **Structure:** The project follows the standard Next.js App Router structure. Pages are located in the `app/` directory, and reusable components are in `components/`.
*   **Styling:** Utility-first styling is managed with Tailwind CSS. Global styles are in `app/globals.css`.
*   **Data Management:**
    *   Website content (e.g., text for "About" or "Services" pages) is stored in JSON files within the `content/` directory.
    *   Forecast data is synced from a remote source and transformed into JSON snapshots by scripts in the `scripts/` directory. This keeps the data separate from the application code.
*   **Static Export:** The site is configured with `output: 'export'` in `next.config.js`, making it a fully static application. This is ideal for performance and hosting on platforms like GitHub Pages.

## Key Files and Directories

*   `app/`: Contains the application's pages and root layout.
    *   `app/page.tsx`: The homepage of the website.
    *   `app/layout.tsx`: The root layout, including navigation and footer.
    *   `app/forecasts/page.tsx`: The main page for displaying conflict forecasts.
*   `components/`: Houses reusable React components.
    *   `components/Navigation.tsx`: The main site navigation bar.
    *   `components/CountryChoropleth.tsx`: The interactive world map visualization.
    *   `components/ForecastFanChart.tsx`: A component for displaying forecast data charts.
*   `content/`: Contains data and content for the site.
    *   `content/forecasts/`: Stores the JSON snapshots of forecast data.
    *   `content/services.json`: JSON file with data about services.
*   `lib/`: Core helper functions and utilities.
    *   `lib/forecasts.ts`: Contains functions for reading and processing forecast snapshot data.
*   `public/`: Static assets like images, fonts, and data files (`world.geojson`).
*   `scripts/`: A collection of Node.js scripts for data processing and automation.
    *   `scripts/prebuild.js`: A crucial script that runs before the build to prepare data.
    *   `scripts/sync-forecasts-from-github.js`: Script to download and update forecast data from a remote GitHub repository.
*   `next.config.js`: The Next.js configuration file, set up for static export and GitHub Pages deployment.
*   `package.json`: Defines project dependencies and scripts.
*   `README.md`: The primary documentation with detailed setup and command instructions.
