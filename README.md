# AIWFA Global v5.1

**AI Weather Forecasts for Agriculture** - A real-time agricultural risk monitoring platform powered by AI weather prediction models.

![AIWFA Global](https://img.shields.io/badge/version-5.1.0-cyan)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.3-cyan)

## Overview

AIWFA Global is a web application that provides agricultural stakeholders with AI-powered weather forecasts and risk alerts. The system combines multiple weather models (GraphCast, AIFS Ensemble, IFS HRES) to deliver reliable predictions for agricultural decision-making.

### Key Features

- 🌍 **Global Risk Map** - Interactive visualization of weather risks across agricultural regions
- 🌡️ **Dual Variable Monitoring** - Temperature (t2m) and Precipitation (tp) alerts
- 📊 **Model Verification** - Track forecast accuracy against ERA5 reanalysis
- 🌾 **Crop Profiles** - Personalized GDD tracking and threshold monitoring
- 📍 **Custom Polygons** - Draw areas of interest for targeted alerts
- ⚡ **Real-time Pipeline** - Automated data ingestion from ECMWF

## ERA5 Data Delay

**Important**: ERA5 reanalysis data has a ~6-day delay. When viewing verification metrics:
- Today: December 15, 2024
- Latest ERA5: December 9, 2024
- Verification shows "Last 10 available days" not "yesterday"

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom dark theme
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/aiwfa-frontend.git
cd aiwfa-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | `http://localhost:8000` |
| `VITE_ENABLE_MOCK_DATA` | Use mock data for development | `true` |

### Build for Production

```bash
npm run build
```

Output will be in `./dist` directory.

## Project Structure

```
src/
├── App.tsx           # Main application component
├── main.tsx          # React entry point
├── index.css         # Tailwind + custom styles
├── types.ts          # TypeScript type definitions
└── services/
    └── api.ts        # API service with mock data generators
```

## Components

### Landing Page (Global Map)
- **WorldMap**: SVG-based world map with grid overlay
- **RiskMarker**: Interactive hotspot markers with severity colors
- **StatsCard**: Key metrics display
- **RegionalSummaryCard**: Per-region weather summaries
- **VerificationChart**: ERA5 verification metrics (last 10 days)
- **PipelineCard**: Data pipeline status

### Dashboard (Authenticated)
- **AlertList**: User's active alerts with dismiss
- **CropProfileCard**: Crop GDD tracking and thresholds
- **System Info**: Database, GCS, ECMWF status

## Design System

### Colors
- **Background**: `void` (#0a0f1a), `abyss` (#050810)
- **Severity**: cyan (LOW), amber (MODERATE), rose (HIGH), red (EXTREME)
- **Accents**: emerald (success), cyan (info), amber (warning), rose (danger)

### Typography
- **Display/Body**: Inter
- **Monospace**: JetBrains Mono (metrics, dates, codes)

### Effects
- Glass morphism cards with backdrop blur
- Subtle noise texture overlay
- Glow shadows for interactive elements
- Pulse animations for status indicators

## API Endpoints

The frontend expects these backend endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health status |
| `/api/pipeline/status` | GET | Data pipeline status |
| `/api/forecast/risks/global` | GET | Global risk hotspots |
| `/api/forecast/verification` | GET | ERA5 verification scores |
| `/api/regions/summary` | GET | Regional summaries |
| `/api/alerts` | GET | User alerts |
| `/api/profiles` | GET/POST | Crop profiles |
| `/api/polygons` | GET/POST | User polygons |

## Deployment

### GitHub Pages

The repository includes a GitHub Actions workflow that:
1. Builds the application on push to `main`
2. Deploys to GitHub Pages

Configure these repository variables:
- `VITE_API_URL`: Production API endpoint
- `VITE_ENABLE_MOCK_DATA`: Set to `false` for production

### Manual Deployment

```bash
npm run build
# Upload ./dist to your static hosting
```

## Development

### Mock Data

When `VITE_ENABLE_MOCK_DATA=true`, the app generates realistic mock data:
- 16 global risk hotspots (8 temperature, 8 precipitation)
- 10 days of verification scores
- 2 sample crop profiles
- 4 regional summaries

### Adding New Features

1. Define types in `src/types.ts`
2. Add API functions in `src/services/api.ts`
3. Create components in `src/App.tsx` (or separate files)
4. Style with Tailwind utility classes

## License

© 2025 TUM Chair of Digital Agriculture

## Related Projects

- [AIWFA Backend](https://github.com/your-org/aiwfa-backend) - FastAPI backend
- [WeatherBench 2](https://github.com/google-research/weatherbench2) - Model benchmarking
