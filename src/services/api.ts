// ============================================
// AIWFA API Service v5.1
// Handles all backend communication
// ERA5 delay: ~5-6 days
// ============================================

import type {
  HealthStatus,
  AvailableForecasts,
  HybridForecastResponse,
  RiskAlert,
  RiskHotspot,
  VerificationScore,
  PipelineStatus,
  CropProfile,
  UserPolygon,
  ERA5Availability,
  RegionalSummary,
} from '../types';

// ============ Configuration ============

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ENABLE_MOCK = import.meta.env.VITE_ENABLE_MOCK_DATA !== 'false';

// ERA5 has ~5-6 day delay (confirmed Dec 2024)
const ERA5_DELAY_DAYS = 6;

// ============ Helper Functions ============

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aiwfa_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.warn(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

// ============ Date Utilities ============

export function getERA5LatestDate(): Date {
  const today = new Date();
  const latestDate = new Date(today);
  latestDate.setDate(today.getDate() - ERA5_DELAY_DAYS);
  latestDate.setHours(0, 0, 0, 0);
  return latestDate;
}

export function getERA5Availability(): ERA5Availability {
  const latestDate = getERA5LatestDate();
  
  const startDate = new Date(latestDate);
  startDate.setDate(latestDate.getDate() - 30);
  
  return {
    latest_date: formatDateISO(latestDate),
    delay_days: ERA5_DELAY_DAYS,
    available_from: formatDateISO(startDate),
    available_to: formatDateISO(latestDate),
    is_available: true,
  };
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============ Mock Data Generators ============

function generateMockRiskHotspots(): RiskHotspot[] {
  const now = new Date();
  
  return [
    // === TEMPERATURE RISKS ===
    {
      id: 'heat-de-bavaria',
      lat: 48.14, lon: 11.58,
      region: 'Bavaria', country: 'Germany',
      event_type: 'HEAT', severity: 'HIGH', variable: 't2m',
      value: 38.5, threshold: 35, probability: 78,
      valid_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 3,
      description: 'Extreme heat wave expected. Tmax > 35°C for 3+ consecutive days during critical grain fill stage.',
      crop_impact: 'High risk for winter wheat yield loss. Consider irrigation scheduling.',
    },
    {
      id: 'heat-us-kansas',
      lat: 38.0, lon: -98.0,
      region: 'Kansas', country: 'USA',
      event_type: 'HEAT', severity: 'EXTREME', variable: 't2m',
      value: 42.0, threshold: 35, probability: 88,
      valid_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 5,
      description: 'Dangerous heat dome forming. Tmax > 40°C expected for extended period.',
      crop_impact: 'Critical for corn at tasseling stage. Immediate irrigation required.',
    },
    {
      id: 'heat-fr-beauce',
      lat: 48.1, lon: 1.5,
      region: 'Beauce', country: 'France',
      event_type: 'HEAT', severity: 'MODERATE', variable: 't2m',
      value: 33.2, threshold: 32, probability: 65,
      valid_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 4,
      description: 'Heat stress conditions during grain fill stage. Tmax 32-35°C.',
      crop_impact: 'Monitor wheat fields closely. May affect kernel weight.',
    },
    {
      id: 'frost-ca-quebec',
      lat: 45.5, lon: -73.5,
      region: 'Quebec', country: 'Canada',
      event_type: 'FROST', severity: 'HIGH', variable: 't2m',
      value: -4.5, threshold: 0, probability: 82,
      valid_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 2,
      description: 'Late spring frost risk. Tmin < -4°C expected at ground level.',
      crop_impact: 'High risk for emerging corn. Deploy frost protection if available.',
    },
    {
      id: 'cold-pl-mazovia',
      lat: 52.2, lon: 21.0,
      region: 'Mazovia', country: 'Poland',
      event_type: 'COLD', severity: 'MODERATE', variable: 't2m',
      value: 2.0, threshold: 5, probability: 71,
      valid_time: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 6,
      description: 'Cold spell with Tmin < 5°C for 4+ consecutive days.',
      crop_impact: 'May slow maize emergence. Monitor soil temperature.',
    },
    {
      id: 'heat-au-nsw',
      lat: -33.5, lon: 147.0,
      region: 'New South Wales', country: 'Australia',
      event_type: 'HEAT', severity: 'HIGH', variable: 't2m',
      value: 41.0, threshold: 38, probability: 75,
      valid_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 7,
      description: 'Severe heat wave with Tmax > 40°C.',
      crop_impact: 'Heat stress risk for wheat during flowering.',
    },
    {
      id: 'heat-cn-henan',
      lat: 34.5, lon: 113.5,
      region: 'Henan', country: 'China',
      event_type: 'HEAT', severity: 'MODERATE', variable: 't2m',
      value: 36.0, threshold: 35, probability: 68,
      valid_time: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 8,
      description: 'Heat wave affecting major wheat region.',
      crop_impact: 'Monitor harvest timing to avoid heat damage.',
    },
    // === PRECIPITATION RISKS ===
    {
      id: 'wet-nl-netherlands',
      lat: 52.0, lon: 5.0,
      region: 'Central', country: 'Netherlands',
      event_type: 'WET', severity: 'HIGH', variable: 'tp',
      value: 85, threshold: 50, probability: 72,
      valid_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 3,
      description: 'Heavy persistent rainfall. 85mm expected over 3 days.',
      crop_impact: 'Waterlogging risk. Delay field operations. Check drainage.',
    },
    {
      id: 'wet-uk-east',
      lat: 52.5, lon: 0.5,
      region: 'East Anglia', country: 'UK',
      event_type: 'WET', severity: 'MODERATE', variable: 'tp',
      value: 55, threshold: 40, probability: 65,
      valid_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 4,
      description: 'Extended rainfall period. 55mm over 7 days.',
      crop_impact: 'May delay harvest operations. Monitor soil saturation.',
    },
    {
      id: 'dry-br-saopaulo',
      lat: -23.5, lon: -46.5,
      region: 'São Paulo', country: 'Brazil',
      event_type: 'DRY', severity: 'HIGH', variable: 'tp',
      value: 2, threshold: 20, probability: 79,
      valid_time: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 10,
      description: 'Extended dry spell. <5mm rainfall over 14 days.',
      crop_impact: 'Drought stress imminent for soybean. Irrigation critical.',
    },
    {
      id: 'storm-jp-kanto',
      lat: 35.7, lon: 140.0,
      region: 'Kanto', country: 'Japan',
      event_type: 'STORM', severity: 'EXTREME', variable: 'tp',
      value: 180, threshold: 100, probability: 68,
      valid_time: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 6,
      description: 'Typhoon approach. 150-200mm rainfall expected in 48 hours.',
      crop_impact: 'Severe flood risk. Secure equipment. Prepare drainage.',
    },
    {
      id: 'wet-cn-hubei',
      lat: 30.5, lon: 114.5,
      region: 'Hubei', country: 'China',
      event_type: 'WET', severity: 'MODERATE', variable: 'tp',
      value: 70, threshold: 50, probability: 62,
      valid_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 5,
      description: 'Monsoon rainfall affecting rice paddies.',
      crop_impact: 'Monitor water levels in paddies. Adjust drainage.',
    },
    {
      id: 'dry-za-westcape',
      lat: -33.9, lon: 18.5,
      region: 'Western Cape', country: 'South Africa',
      event_type: 'DRY', severity: 'MODERATE', variable: 'tp',
      value: 5, threshold: 25, probability: 70,
      valid_time: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 12,
      description: 'Below-average rainfall expected for 2 weeks.',
      crop_impact: 'Wheat may require supplemental irrigation.',
    },
    {
      id: 'wet-in-punjab',
      lat: 31.0, lon: 75.5,
      region: 'Punjab', country: 'India',
      event_type: 'WET', severity: 'HIGH', variable: 'tp',
      value: 95, threshold: 60, probability: 74,
      valid_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 4,
      description: 'Heavy monsoon rainfall expected.',
      crop_impact: 'Rice paddies: manage water levels. Wheat harvest: expedite.',
    },
    {
      id: 'dry-ar-baires',
      lat: -34.5, lon: -59.0,
      region: 'Buenos Aires', country: 'Argentina',
      event_type: 'DRY', severity: 'HIGH', variable: 'tp',
      value: 8, threshold: 30, probability: 76,
      valid_time: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      lead_time_days: 9,
      description: 'Dry period extending. Rain deficit accumulating.',
      crop_impact: 'Soybean stress risk increasing. Consider irrigation.',
    },
  ];
}

function generateMockVerificationScores(days: number = 10): VerificationScore[] {
  const era5 = getERA5Availability();
  const latestDate = new Date(era5.latest_date);
  const scores: VerificationScore[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(latestDate);
    date.setDate(latestDate.getDate() - i);
    const dateStr = formatDateISO(date);
    
    const leadTimeFactor = 1 + (i * 0.05);
    const baseRMSE = (1.1 + Math.random() * 0.3) * leadTimeFactor;
    const baseBias = (Math.random() - 0.5) * 0.4;
    
    scores.push({
      date: dateStr,
      model: 'hybrid',
      region: 'Europe',
      temperature: {
        rmse: Number(baseRMSE.toFixed(2)),
        bias: Number(baseBias.toFixed(2)),
        mae: Number((baseRMSE * 0.78).toFixed(2)),
        correlation: Number((0.92 - i * 0.01 + Math.random() * 0.02).toFixed(3)),
      },
      precipitation: {
        rmse: Number((2.5 + Math.random() * 1.0).toFixed(2)),
        csi: Number((0.52 + Math.random() * 0.15).toFixed(2)),
        pod: Number((0.68 + Math.random() * 0.15).toFixed(2)),
        far: Number((0.28 + Math.random() * 0.12).toFixed(2)),
      },
      events: {
        heat: {
          csi: Number((0.55 + Math.random() * 0.12).toFixed(2)),
          pod: Number((0.72 + Math.random() * 0.10).toFixed(2)),
          far: Number((0.22 + Math.random() * 0.08).toFixed(2)),
        },
        cold: {
          csi: Number((0.50 + Math.random() * 0.12).toFixed(2)),
          pod: Number((0.65 + Math.random() * 0.10).toFixed(2)),
          far: Number((0.25 + Math.random() * 0.10).toFixed(2)),
        },
        wet: {
          csi: Number((0.45 + Math.random() * 0.12).toFixed(2)),
          pod: Number((0.60 + Math.random() * 0.12).toFixed(2)),
          far: Number((0.30 + Math.random() * 0.10).toFixed(2)),
        },
      },
      lead_time_hours: 24 * (i + 1),
    });
  }
  
  return scores;
}

function generateMockProfiles(): CropProfile[] {
  return [
    {
      id: 'profile-1',
      user_id: 'user-1',
      polygon_id: 'poly-1',
      name: 'Maize - North Field 2024',
      crop_type: 'maize',
      sowing_date: '2024-04-15',
      expected_harvest_date: '2024-10-01',
      gdd_base_temp: 10,
      gdd_targets: {
        emergence: 100,
        v6: 300,
        tasseling: 700,
        silking: 800,
        grain_fill: 1000,
        maturity: 1400,
      },
      thresholds: {
        heat_max: 35,
        cold_min: 10,
        wet_max: 50,
      },
      current_gdd: 680,
      current_stage: 'V12 (Pre-tasseling)',
      is_active: true,
      notes: 'Watch for European corn borer. Irrigation system operational.',
      created_at: '2024-04-01T00:00:00Z',
    },
    {
      id: 'profile-2',
      user_id: 'user-1',
      name: 'Winter Wheat - South Field',
      crop_type: 'winter_wheat',
      sowing_date: '2024-10-15',
      expected_harvest_date: '2025-07-15',
      gdd_base_temp: 0,
      gdd_targets: {
        emergence: 150,
        tillering: 400,
        stem_elongation: 800,
        heading: 1100,
        flowering: 1250,
        maturity: 1800,
      },
      thresholds: {
        heat_max: 32,
        cold_min: -5,
        wet_max: 70,
      },
      current_gdd: 450,
      current_stage: 'Tillering',
      is_active: true,
      notes: 'Good stand establishment. Monitor for late frost risk.',
      created_at: '2024-10-01T00:00:00Z',
    },
  ];
}

function generateMockRegionalSummaries(): RegionalSummary[] {
  return [
    { region: 'Central Europe', country: 'Multi', t2m_mean: 18.5, t2m_max: 28.2, t2m_min: 11.3, t2m_anomaly: 2.1, tp_total: 45, tp_anomaly: -15, risk_level: 'MODERATE', active_alerts: 3 },
    { region: 'US Midwest', country: 'USA', t2m_mean: 24.2, t2m_max: 36.5, t2m_min: 18.0, t2m_anomaly: 4.5, tp_total: 22, tp_anomaly: -35, risk_level: 'HIGH', active_alerts: 5 },
    { region: 'Indo-Gangetic Plain', country: 'India', t2m_mean: 32.1, t2m_max: 42.0, t2m_min: 26.5, t2m_anomaly: 1.8, tp_total: 85, tp_anomaly: 20, risk_level: 'MODERATE', active_alerts: 2 },
    { region: 'North China Plain', country: 'China', t2m_mean: 26.5, t2m_max: 34.0, t2m_min: 20.5, t2m_anomaly: 1.2, tp_total: 55, tp_anomaly: -8, risk_level: 'LOW', active_alerts: 1 },
  ];
}

// ============ API Functions (exported directly) ============

export async function getHealth(): Promise<HealthStatus> {
  if (ENABLE_MOCK) {
    return {
      status: 'healthy',
      database: 'connected',
      gcs: 'connected',
      ecmwf: 'connected',
      timestamp: new Date().toISOString(),
      version: '5.1.0',
    };
  }
  return fetchAPI<HealthStatus>('/api/health');
}

export async function getPipelineStatus(): Promise<PipelineStatus> {
  if (ENABLE_MOCK) {
    const era5 = getERA5Availability();
    const now = new Date();
    
    let nextFetch: Date;
    const hour = now.getUTCHours();
    if (hour < 8) {
      nextFetch = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8, 0, 0));
    } else if (hour < 20) {
      nextFetch = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 20, 0, 0));
    } else {
      nextFetch = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 8, 0, 0));
    }
    
    const lastFetch = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    
    return {
      last_ifs_fetch: lastFetch.toISOString(),
      last_aifs_fetch: lastFetch.toISOString(),
      next_scheduled_fetch: nextFetch.toISOString(),
      ecmwf_delay_hours: 8,
      era5_delay_days: ERA5_DELAY_DAYS,
      era5_latest_date: era5.latest_date,
      status: 'healthy',
      steps: [
        { name: 'Fetch IFS HRES', status: 'completed', duration_seconds: 180 },
        { name: 'Fetch AIFS Ensemble', status: 'completed', duration_seconds: 240 },
        { name: 'Store in GCS', status: 'completed', duration_seconds: 120 },
        { name: 'Process to Zarr', status: 'completed', duration_seconds: 300 },
        { name: 'Generate risk alerts', status: 'completed', duration_seconds: 90 },
        { name: 'Update verification', status: 'completed', duration_seconds: 150 },
      ],
      data_freshness: 'fresh',
    };
  }
  return fetchAPI<PipelineStatus>('/api/pipeline/status');
}

export async function getAvailableForecasts(): Promise<AvailableForecasts> {
  if (ENABLE_MOCK) {
    const today = new Date();
    const forecasts: AvailableForecasts = { ifs: [], aifs: [] };
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDateISO(d).replace(/-/g, '');
      
      forecasts.ifs.push({ date: dateStr, init_times: ['00z', '12z'], max_lead_time: 240 });
      forecasts.aifs.push({ date: dateStr, init_times: ['00z', '12z'], max_lead_time: 360 });
    }
    
    return forecasts;
  }
  return fetchAPI<AvailableForecasts>('/api/forecasts/available');
}

export async function getHybridForecast(
  initDate: string,
  initTime: string,
  lat: number,
  lon: number,
  variable: string = 't2m'
): Promise<HybridForecastResponse> {
  if (ENABLE_MOCK) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const baseTemp = 20 - Math.abs(lat - 45) * 0.4;
    const times: string[] = [];
    const hybrid: number[] = [];
    const ifs: number[] = [];
    const aifs: number[] = [];
    const uncertainty: number[] = [];
    
    const hours = variable === 't2m' ? 240 : 360;
    
    for (let h = 0; h <= hours; h += 6) {
      const t = new Date(now.getTime() + h * 60 * 60 * 1000);
      times.push(t.toISOString());
      
      const dailyCycle = 8 * Math.sin((h % 24) * Math.PI / 12 - Math.PI / 2);
      const trend = 3 * Math.sin(h * Math.PI / (7 * 24));
      const noise = (Math.random() - 0.5) * 2;
      
      const ifsVal = baseTemp + dailyCycle + trend + noise;
      const aifsVal = ifsVal + (Math.random() - 0.5) * 1.5;
      const hybridVal = ifsVal * 0.6 + aifsVal * 0.4;
      const unc = Math.abs(ifsVal - aifsVal) / 2 + 0.5 + (h / 24) * 0.1;
      
      ifs.push(Number(ifsVal.toFixed(1)));
      aifs.push(Number(aifsVal.toFixed(1)));
      hybrid.push(Number(hybridVal.toFixed(1)));
      uncertainty.push(Number(unc.toFixed(1)));
    }
    
    return {
      init_date: initDate,
      init_time: initTime,
      location: { lat, lon },
      variable,
      times,
      hybrid_values: hybrid,
      ifs_values: ifs,
      aifs_values: aifs,
      uncertainty,
      unit: variable === 't2m' ? '°C' : 'mm',
    };
  }
  return fetchAPI<HybridForecastResponse>(
    `/api/forecast/hybrid/${initDate}/${initTime}/location?lat=${lat}&lon=${lon}&variable=${variable}`
  );
}

export async function getGlobalRiskHotspots(): Promise<RiskHotspot[]> {
  if (ENABLE_MOCK) {
    return generateMockRiskHotspots();
  }
  return fetchAPI<RiskHotspot[]>('/api/risks/global');
}

export async function getRegionalSummaries(): Promise<RegionalSummary[]> {
  if (ENABLE_MOCK) {
    return generateMockRegionalSummaries();
  }
  return fetchAPI<RegionalSummary[]>('/api/risks/regional');
}

export async function getAlerts(status: string = 'active'): Promise<RiskAlert[]> {
  if (ENABLE_MOCK) {
    const hotspots = generateMockRiskHotspots().slice(0, 4);
    return hotspots.map(h => ({
      id: h.id,
      event_type: h.event_type,
      severity: h.severity,
      region: h.region,
      country: h.country,
      lat: h.lat,
      lon: h.lon,
      forecast_date: h.valid_time.split('T')[0] ?? h.valid_time,
      lead_time_days: h.lead_time_days,
      confidence: h.probability / 100,
      action_recommended: h.crop_impact || h.description,
      status: 'active' as const,
      created_at: new Date().toISOString(),
    }));
  }
  return fetchAPI<RiskAlert[]>(`/api/alerts?status=${status}`);
}

export async function dismissAlert(alertId: string): Promise<void> {
  if (ENABLE_MOCK) return;
  return fetchAPI(`/api/alerts/${alertId}/dismiss`, { method: 'POST' });
}

export async function getVerificationScores(days: number = 10): Promise<VerificationScore[]> {
  if (ENABLE_MOCK) {
    return generateMockVerificationScores(days);
  }
  return fetchAPI<VerificationScore[]>(`/api/verification/scores?days=${days}`);
}

export async function getProfiles(): Promise<CropProfile[]> {
  if (ENABLE_MOCK) {
    return generateMockProfiles();
  }
  return fetchAPI<CropProfile[]>('/api/profiles');
}

export async function createProfile(profile: Partial<CropProfile>): Promise<CropProfile> {
  if (ENABLE_MOCK) {
    return { 
      ...profile, 
      id: `profile-${Date.now()}`, 
      user_id: 'user-1', 
      current_gdd: 0,
      is_active: true,
      created_at: new Date().toISOString() 
    } as CropProfile;
  }
  return fetchAPI<CropProfile>('/api/profiles', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export async function updateProfile(profileId: string, updates: Partial<CropProfile>): Promise<CropProfile> {
  if (ENABLE_MOCK) {
    const profiles = generateMockProfiles();
    const profile = profiles.find(p => p.id === profileId);
    return { ...profile, ...updates } as CropProfile;
  }
  return fetchAPI<CropProfile>(`/api/profiles/${profileId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteProfile(profileId: string): Promise<void> {
  if (ENABLE_MOCK) return;
  return fetchAPI(`/api/profiles/${profileId}`, { method: 'DELETE' });
}

export async function getPolygons(): Promise<UserPolygon[]> {
  if (ENABLE_MOCK) {
    return [
      {
        id: 'poly-1',
        user_id: 'user-1',
        name: 'North Field - Bavaria',
        geometry: {
          type: 'Polygon',
          coordinates: [[[11.5, 48.1], [11.6, 48.1], [11.6, 48.2], [11.5, 48.2], [11.5, 48.1]]],
        },
        centroid: { lat: 48.15, lon: 11.55 },
        area_hectares: 125.5,
        crop_type: 'maize',
        tags: ['irrigated', 'primary'],
        created_at: '2024-04-01T00:00:00Z',
      },
    ];
  }
  return fetchAPI<UserPolygon[]>('/api/polygons');
}

export async function createPolygon(polygon: Partial<UserPolygon>): Promise<UserPolygon> {
  if (ENABLE_MOCK) {
    return {
      ...polygon,
      id: `poly-${Date.now()}`,
      user_id: 'user-1',
      created_at: new Date().toISOString(),
    } as UserPolygon;
  }
  return fetchAPI<UserPolygon>('/api/polygons', {
    method: 'POST',
    body: JSON.stringify(polygon),
  });
}

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  if (ENABLE_MOCK) {
    localStorage.setItem('aiwfa_token', 'mock-token-12345');
    localStorage.setItem('aiwfa_user', JSON.stringify({ email, name: email.split('@')[0] }));
    return { access_token: 'mock-token-12345' };
  }
  
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await fetch(`${API_URL}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });
  
  if (!response.ok) throw new Error('Login failed');
  const data = await response.json();
  localStorage.setItem('aiwfa_token', data.access_token);
  return data;
}

export function logout(): void {
  localStorage.removeItem('aiwfa_token');
  localStorage.removeItem('aiwfa_user');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('aiwfa_token');
}

export async function register(email: string, password: string, name?: string): Promise<{ access_token: string }> {
  if (ENABLE_MOCK) {
    localStorage.setItem('aiwfa_token', 'mock-token-12345');
    localStorage.setItem('aiwfa_user', JSON.stringify({ email, name: name || email.split('@')[0] }));
    return { access_token: 'mock-token-12345' };
  }
  return fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}
