# GitHub Pages Deployment Guide

This application is fully configured for deployment on **GitHub Pages**.

---

### Option A: Automatic Deployment via GitHub Actions (Recommended)

A GitHub Actions workflow is pre-configured at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages in your repository settings**:
   - Go to your repository on GitHub.
   - Click **Settings** &rarr; **Pages** (under Code and automation in the left sidebar).
   - Under **Build and deployment** &rarr; **Source**, select:
     **`GitHub Actions`**
   - That's it! Every push to `main` (or `master`) will automatically build and publish the app to:
     `https://<your-username>.github.io/<repository-name>/`

---

### Option B: Manual One-Command CLI Deployment

If you prefer deploying directly from your local terminal using the `gh-pages` CLI:

1. **Deploy to `gh-pages` branch**:
   ```bash
   npm run deploy
   ```
   This automatically runs `npm run build` and pushes the production `dist` directory to the `gh-pages` branch on GitHub.

2. **Set source in repository settings**:
   - In **Settings** &rarr; **Pages**, select **Deploy from a branch**.
   - Choose the **`gh-pages`** branch and `/ (root)` folder.
   - Click **Save**.

---

### Changes Applied for GitHub Pages Compatibility:

1. **Relative Asset Paths (`vite.config.ts`)**:
   - Set `base: './'` so all compiled JavaScript, CSS, chunk files, and images load correctly regardless of whether the site is hosted at `https://username.github.io/repo-name/` or a custom root domain `https://example.com/`.

2. **Data Asset Path Resolution (`src/utils/geoUtils.ts`)**:
   - Uses `getDataPath()` to resolve static GeoJSON files (`data/myanmar_active_faults.geojson`, `data/extracted_dmh_quake.geojson`, `data/usgs_myanmar_earthquakes.geojson`) with `import.meta.env.BASE_URL` prefixing.

3. **SPA Fallback Routing (`public/404.html`)**:
   - Handles client-side refreshes without 404 errors on GitHub Pages.

4. **Production Build Verification**:
   - `npm run build` compiles clean production bundles directly into `dist/`.
