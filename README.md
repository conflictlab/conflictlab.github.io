# PaCE Website

Website for PaCE - an intelligence technology company focused on forecasting geopolitical conflict, civil unrest, and political instability using machine learning and dynamic exposure modeling.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for version control)

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site in your browser.

### 3. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `out/` directory.

Fast local build (skip data prebuild):

```bash
# Option A (Mac/Linux):
SKIP_PREBUILD=1 npm run build

# Option B:
npm run build:fast
```

During the build, data steps run automatically:
- Sync latest national forecast CSVs from GitHub and snapshot them
- Generate PRIO‑GRID GeoJSON (`public/data/grid/{period}.geo.json`) from the live grid CSV
- Generate monthly point JSONs (`public/data/grid/{period}-m{1..6}.json`) for fast grid rendering

## 🧾 Command Cheat Sheet

Common one-liners you’ll likely use.

Development

```bash
npm install
npm run dev
```

Build/Export

```bash
npm run build
```

Grid data utilities

```bash
# Build centroids from the PRIO-GRID shapefile (one-time / when shapefile changes)
npm run grid:centroids

# Build polygon GeoJSON from the live grid CSV
npm run grid:build

# Build monthly point JSONs from the polygon GeoJSON (used by the map for speed)
node scripts/geojson-to-month-points.js --period 2025-10
```

Scenario utilities (local testing)

```bash
# Convert sce_dictionary.pkl to JSON (requires Python 3)
node scripts/convert-scenarios-pkl.js --src /path/to/sce_dictionary.pkl --out public/data/scenarios.json
```

Then run the site and click a country on the forecasts page to see the scenario plot.

CI monthly refresh
- The workflow `.github/workflows/update-minmax.yml` downloads `sce_dictionary.pkl` (defaults to `ThomasSchinca/Pace-map-risk@main`) and converts it to `public/data/scenarios.json` each month, then rebuilds `public/data/minmax.json` and `public/data/scenarios.denorm.json`.
- Configure via repository variables: `SCE_REPO` (owner/repo), `SCE_BRANCH` (branch), `SCE_PATH` (path to pickle). Defaults are `ThomasSchinca/Pace-map-risk`, `main`, and `sce_dictionary.pkl`.

- The workflow `.github/workflows/update-matches.yml` downloads the DTW matches pickle monthly and converts it to `public/data/matches.json` for country pages.
  - Configure via repository variables: `MATCHES_REPO` (owner/repo), `MATCHES_BRANCH` (branch), `MATCHES_PATH` (path to pickle in repo). Defaults are `ThomasSchinca/Pace-map-risk`, `main`, and `matches.pkl`.
  - The pickle is expected to map `country_name -> [Series, distance, Series, distance, ...]`. The converter normalizes to
    `country_name -> [{ series: { values: [...], index?: [...] }, distance: <number> }, ...]`.
  - Optional: provide a full historical monthly CSV to enable matched-future overlays by setting:
    - `MATCHES_HIST_REPO` (owner/repo)
    - `MATCHES_HIST_BRANCH` (branch)
    - `MATCHES_HIST_PATH` (path in repo)
    The workflow will download it to `public/data/hist_full.csv`. The UI will prefer this file and fall back to `public/data/hist.csv` if absent.
  - If you already have a long-run monthly CSV named `Conf.csv` (as in Pace-map-risk), you can point `MATCHES_HIST_PATH` to `Conf.csv`. The UI will also look for `public/data/conf.csv` and prefer it when present.

CI automation (GitHub Actions)
- `.github/workflows/sync-forecasts.yml` runs on `main` pushes and monthly schedule:
  - Syncs forecast CSVs, rebuilds centroids, builds GeoJSON, builds monthly points, exports static API
  - Commits generated files under `content/forecasts`, `public/data/csv`, `public/data/grid`, and `public/api`
- `.github/workflows/update-minmax.yml` runs monthly:
  - Downloads `sce_dictionary.pkl`, converts to `public/data/scenarios.json`, computes `public/data/minmax.json`, denormalizes to `public/data/scenarios.denorm.json`

Forecast CSV sync (from GitHub)

Monthly (latest only, public repo — no token):

```bash
npm run csv:sync:github -- --repo ThomasSchinca/Pace-map-risk --dir Historical_Predictions --branch main --latestOnly --saveCsv
```

All periods (one-time backfill):

```bash
npm run csv:sync:github -- --repo ThomasSchinca/Pace-map-risk --dir Historical_Predictions --branch main --saveCsv
```

Optionally use a token to avoid API rate limits:

```bash
npm run csv:sync:github -- --repo ThomasSchinca/Pace-map-risk --dir Historical_Predictions --branch main --latestOnly --saveCsv --token $GITHUB_TOKEN
```

Raw CSV downloads (from the site)

```bash
curl -L http://localhost:3000/api/v1/forecasts/raw/latest -o latest.csv
curl -L http://localhost:3000/api/v1/forecasts/raw/2025-11 -o 2025-11.csv
```

Generated CSV (from JSON snapshot)

```bash
curl -L http://localhost:3000/api/v1/forecasts/csv/latest -o forecasts-latest.csv
curl -L http://localhost:3000/api/v1/forecasts/csv/2025-11 -o forecasts-2025-11.csv
```

Convert a local CSV into a snapshot

```bash
node scripts/csv-to-snapshot.js --csv content/forecasts/2025-12.csv --period 2025-12 \
  --generatedAt 2025-12-01T00:00:00Z --version 1.0 \
  --releaseNote "Calibration v3.3" --releaseNote "Added macro inputs"
```

## 📁 Project Structure

```
pace-website/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── dashboard/         # Dashboard placeholder
│   ├── technology/        # Technology overview
│   ├── use-cases/         # Use cases and client sectors
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── Navigation.tsx     # Main navigation header
│   └── Footer.tsx         # Site footer
├── content/              # Content management (JSON files)
│   ├── company.json      # Company information
│   ├── services.json     # Services and capabilities
│   └── use-cases.json    # Use case data
├── public/               # Static assets
└── README.md             # This file
```

## 🎨 Customization Guide

### Changing Content

All website content is stored in JSON files in the `/content/` directory for easy editing:

#### Company Information (`/content/company.json`)
- Company name, tagline, mission
- Value propositions
- Contact information

#### Services & Products (`/content/services.json`)
- Core capabilities
- Product descriptions
- Features and use cases

#### Use Cases (`/content/use-cases.json`)
- Target sectors
- Client examples
- Use case scenarios

### Adding New Use Cases

1. Edit `/content/use-cases.json`
2. Add a new sector object with:
   ```json
   {
     "name": "New Sector",
     "useCase": "Primary use case description",
     "description": "Detailed description",
     "icon": "IconName"
   }
   ```

### Updating Styles

The site uses Tailwind CSS for styling:
- Global styles: `/app/globals.css`
- Component classes: `.btn-primary`, `.btn-secondary`, `.section-heading`
- Colors: `clairient-blue`, `clairient-light`, `clairient-dark` (brand colors)

### Adding New Pages

1. Create a new directory in `/app/`
2. Add a `page.tsx` file with your React component
3. Update navigation in `/components/Navigation.tsx`

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended)

This repo is configured for static export and automatic deployment to GitHub Pages.

1. Enable GitHub Pages in your repository settings (Pages → Build and deployment → Source: GitHub Actions)
2. Push to `main`. The workflow `.github/workflows/deploy-pages.yml` will:
   - Build the site (including data prebuild steps)
   - Export static files to `out/`
   - Publish to GitHub Pages

Your site will be available at `https://<user>.github.io/<repo>/`.

### Option 2: Vercel

You can deploy to Vercel by connecting the repo in the Vercel dashboard or by adding a custom workflow. This repo is optimized for GitHub Pages by default.

### Option 3: Netlify

1. Build the project: `npm run build`
2. Drag the `out/` folder to [Netlify Drop](https://app.netlify.com/drop)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:
```
# Add any environment variables here
# NEXT_PUBLIC_API_URL=https://api.pace.com
```

### Custom Domain

To use a custom domain:
1. Add `CNAME` file to `/public/` with your domain
2. Configure DNS settings with your domain provider
3. Update Vercel domain settings (if using Vercel) or add a CNAME for GitHub Pages

## 🔌 Future API Integration

The site is prepared for future API integration:

### Adding API Routes

1. Create `/app/api/` directory
2. Add API route files (e.g., `/app/api/forecasts/route.ts`)

### Dashboard Integration

The dashboard page (`/app/dashboard/page.tsx`) is ready for:
- Real-time data fetching
- Interactive charts
- User authentication
- API endpoints

### Example API Integration

```typescript
// In a component
const [forecasts, setForecasts] = useState([])

useEffect(() => {
  fetch('/api/forecasts')
    .then(res => res.json())
    .then(data => setForecasts(data))
}, [])
```

## 📊 Using Forecast CSVs from GitHub

If your forecasts are stored as CSV files in a GitHub repository (one file per period, named like `YYYY-MM.csv`), you can sync them into `content/forecasts/` as JSON snapshots used by the Forecasts pages.

1) One‑time or ad‑hoc sync

```bash
npm run csv:sync:github -- \\
  --repo your-org/your-repo \\
  --dir path/to/csvs \\
  --branch main \\
  --token $GITHUB_TOKEN      # optional, recommended to avoid rate limits
```

Options:
- `--latestOnly` to fetch only the newest period.
- You can also set env vars instead: `GITHUB_REPO`, `GITHUB_DIR`, `GITHUB_BRANCH`, `GITHUB_TOKEN`.

The script converts matching `*.csv` files (deriving `YYYY-MM` from the filename) into `content/forecasts/YYYY-MM.json` and updates `content/forecasts/latest.json`. The Forecasts pages and API read from these JSON snapshots automatically.

Keep original CSVs (to allow raw downloads):

```bash
npm run csv:sync:github -- --repo your-org/your-repo --dir path/to/csvs --branch main --saveCsv
```

When `--saveCsv` is used, raw files are stored under `content/forecasts/csv/` and you can expose them via:

- `/api/v1/forecasts/raw/latest.csv`
- `/api/v1/forecasts/raw/<YYYY-MM>.csv`

2) Use in CI before build

```bash
npm ci
npm run csv:sync:github -- --repo your-org/your-repo --dir path/to/csvs --branch main --latestOnly --saveCsv --token $GITHUB_TOKEN
npm run build
```

CSV schema is documented at `scripts/csv-to-snapshot.js`.

## 📱 Mobile Optimization

The site is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)

## 🧪 Testing

Run the development server and test:
- Navigation works on all screen sizes
- Forms submit properly (currently shows success message)
- All links are functional
- Images load correctly

## 📈 Performance

The site is optimized for:
- **Core Web Vitals** compliance
- **Fast loading** with Next.js static generation
- **SEO** with proper meta tags
- **Accessibility** with semantic HTML

## 🆘 Troubleshooting

### Common Issues

1. **Build fails**: Check Node.js version (18+)
2. **Styles not loading**: Ensure Tailwind CSS is configured
3. **Images not showing**: Check file paths in `/public/`

### Getting Help

- Check [Next.js documentation](https://nextjs.org/docs)
- Visit [Tailwind CSS docs](https://tailwindcss.com/docs)
- Review [Vercel deployment guide](https://vercel.com/docs)

## 📝 Content Management Tips

### Writing Guidelines
- Keep headlines clear and concise
- Use active voice for better engagement
- Include specific metrics and benefits
- Maintain consistent tone throughout

### SEO Best Practices
- Update page titles and descriptions in layout files
- Add alt text for images
- Use proper heading hierarchy (h1, h2, h3)
- Include relevant keywords naturally

## 🔒 Security Notes

- No sensitive data is stored in the repository
- Contact form is client-side only (replace with backend)
- All external links should be verified
- Regular dependency updates recommended

## 📄 License

This project is proprietary to Luscint. All rights reserved.

---

**Need help?** Contact the development team or refer to the documentation links above.

**Last updated:** July 2025
# pace
