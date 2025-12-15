# AIWFA Frontend - AI Weather Forecasts for Agriculture

A React + TypeScript frontend for agricultural weather forecasting, featuring a global risk map with real-time ECMWF IFS and AIFS data.

## Features

- **Landing Page**: Interactive global map showing temperature and precipitation risk alerts
- **Dashboard**: Personalized crop profiles with GDD tracking (requires sign-in)
- **ERA5 Verification**: Model performance scores with 5-day delay handling
- **Pipeline Status**: Real-time data fetching status

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open http://localhost:3000

## File Structure

```
aiwfa-frontend/
├── index.html                  # Main HTML with font imports
├── package.json               # Dependencies
├── vite.config.ts             # Vite config (set base for GitHub Pages)
├── tailwind.config.js         # Tailwind theme customization
├── postcss.config.js          # PostCSS config ==
├── tsconfig.json              # TypeScript config
├── .env.example               # Environment variables template ==
├── .gitignore
├── public/
│   └── favicon.svg            # App icon
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Pages deployment
└── src/
    ├── main.tsx               # Entry point
    ├── App.tsx                # Main application (~400 lines)
    ├── index.css              # Tailwind + custom styles
    ├── types.ts               # TypeScript interfaces
    └── services/
        └── api.ts             # API client + mock data
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_ENABLE_MOCK_DATA` | Use mock data when API unavailable | `true` |

## ERA5 Delay Handling

ERA5 reanalysis data has approximately 5 days delay. The frontend:
- Shows "last 10 available days" for verification (not "yesterday")
- Displays the ERA5 latest date in the UI
- Shows a warning about the delay

## Deployment to GitHub Pages

1. Update `vite.config.ts`:
   ```typescript
   base: '/your-repo-name/',
   ```

2. Add repository secret:
   - Go to **Settings** → **Secrets** → **Actions**
   - Add `VITE_API_URL` with your backend URL

3. Enable GitHub Pages:
   - Go to **Settings** → **Pages**
   - Select **GitHub Actions** as source

4. Push to `main` branch to trigger deployment

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Void | `#030712` | Main background |
| Abyss | `#0a0f1a` | Secondary background |
| Neon | `#10b981` | Primary accent (emerald) |
| Cyan | `#06b6d4` | Secondary accent |
| Amber | `#f59e0b` | Warnings |
| Rose | `#f43f5e` | Danger/High severity |

## Risk Severity Colors

| Severity | Color | Use Case |
|----------|-------|----------|
| LOW | Cyan | Minimal impact |
| MODERATE | Amber | Monitor closely |
| HIGH | Rose | Action required |
| EXTREME | Red | Urgent action |

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Check API status |
| `GET /api/pipeline/status` | Pipeline + ERA5 info |
| `GET /api/risks/global` | Global risk hotspots |
| `GET /api/alerts` | User alerts |
| `GET /api/verification/scores?days=10` | Verification scores |
| `GET /api/profiles` | User crop profiles |

## License

TUM Digital Agriculture - AIWFA Project
