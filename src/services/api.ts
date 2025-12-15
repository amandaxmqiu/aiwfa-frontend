// ============================================
// AIWFA API Service
// Handles all backend communication
// ============================================

import type {
  HealthStatus,
  AvailableForecasts,
  ForecastResponse,
  HybridForecastResponse,
  RiskAlert,
  RiskHotspot,
  VerificationScore,
  PipelineStatus,
  CropProfile,
  UserPolygon,
  ERA5Availability,
} from '../types';

// ============ Configuration ============

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ENABLE_MOCK = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

// ERA5 has ~5 day delay (as of Dec 2024)
const ERA5_DELAY_DAYS = 5;

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
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

// ============ Date Utilities ============

export function getERA5LatestDate(): string {
  const today = new Date();
  const latestDate = new Date(today);
  latestDate.setDate(today.getDate() - ERA5_DELAY_DAYS);
  return latestDate.toISOString().split('T')[0];
}

export function getERA5Availability(): ERA5Availability {
  const today = new Date();
  const latestDate = new Date(today);
  latestDate.setDate(today.getDate() - ERA5_DELAY_DAYS);
  
  const startDate = new Date(latestDate);
  startDate.setDate(latestDate.getDate() - 30);
  
  return {
    latest_date: latestDate.toISOString().split('T')[0],
    delay_days: ERA5_DELAY_DAYS,
    available_from: startDate.toISOString().split('T')[0],
    available_to: latestDate.toISOString().split('T')[0],
  };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
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

// ============ Mock Data Generators ============

function generateMockRiskHotspots(): RiskHotspot[] {
  const now = new Date();
  
  return [
    // Temperature risks
    {
      id: 'risk-1',
      lat: 48.14,
      lon: 11.58,
      region: 'Bavaria',
      country: 'Germany',
      event_type: 'HEAT',
      severity: 'HIGH',
      variable: 't2m',
      value: 38.5,
      threshold: 35,
      probability: 78,
      valid_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Extreme heat wave expected. Tmax > 35°C for 3+ days.',
    },
    {
      id: 'risk-2',
      lat: 51.5,
      lon: 10.5,
      region: 'Thuringia',
      country: 'Germany',
      event_type: 'HEAT',
      severity: 'MODERATE',
      variable: 't2m',
      value: 33.2,
      threshold: 32,
      probability: 65,
      valid_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Heat stress conditions during grain fill stage.',
    },
    {
      id: 'risk-3',
      lat: 45.5,
      lon: -73.5,
      region: 'Quebec',
      country: 'Canada',
      event_type: 'FROST',
      severity: 'HIGH',
      variable: 't2m',
      value: -3.5,
      threshold: 0,
      probability: 82,
      valid_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Late frost risk for emerging crops.',
    },
    {
      id: 'risk-4',
      lat: 38.0,
      lon: -100.0,
      region: 'Kansas',
      country: 'USA',
      event_type: 'HEAT',
      severity: 'EXTREME',
      variable: 't2m',
      value: 42.0,
      threshold: 35,
      probability: 88,
      valid_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Dangerous heat dome. Irrigation critical.',
    },
    // Precipitation risks
    {
      id: 'risk-5',
      lat: 52.0,
      lon: 5.0,
      region: 'Netherlands',
      country: 'Netherlands',
      event_type: 'WET',
      severity: 'HIGH',
      variable: 'tp',
      value: 85,
      threshold: 50,
      probability: 72,
      valid_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Heavy rainfall expected. 85mm in 3 days.',
    },
    {
      id: 'risk-6',
      lat: 47.5,
      lon: 2.5,
      region: 'Centre-Val de Loire',
      country: 'France',
      event_type: 'WET',
      severity: 'MODERATE',
      variable: 'tp',
      value: 55,
      threshold: 40,
      probability: 58,
      valid_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Persistent rain may delay harvest operations.',
    },
    {
      id: 'risk-7',
      lat: -23.5,
      lon: -46.5,
      region: 'São Paulo',
      country: 'Brazil',
      event_type: 'DRY',
      severity: 'HIGH',
      variable: 'tp',
      value: 2,
      threshold: 20,
      probability: 75,
      valid_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Extended dry spell. Drought stress imminent.',
    },
    {
      id: 'risk-8',
      lat: 35.0,
      lon: 135.0,
      region: 'Kansai',
      country: 'Japan',
      event_type: 'STORM',
      severity: 'EXTREME',
      variable: 'tp',
      value: 150,
      threshold: 100,
      probability: 68,
      valid_time: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Typhoon approach. Extreme precipitation expected.',
    },
    {
      id: 'risk-9',
      lat: 30.0,
      lon: 115.0,
      region: 'Hubei',
      country: 'China',
      event_type: 'WET',
      severity: 'MODERATE',
      variable: 'tp',
      value: 65,
      threshold: 50,
      probability: 62,
      valid_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Monsoon rain affecting rice paddies.',
    },
    {
      id: 'risk-10',
      lat: -33.9,
      lon: 18.5,
      region: 'Western Cape',
      country: 'South Africa',
      event_type: 'DRY',
      severity: 'MODERATE',
      variable: 'tp',
      value: 5,
      threshold: 25,
      probability: 70,
      valid_time: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Below-average rainfall expected.',
    },
  ];
}

function generateMockVerificationScores(days: number = 10): VerificationScore[] {
  const era5Latest = getERA5LatestDate();
  const latestDate = new Date(era5Latest);
  const scores: VerificationScore[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(latestDate);
    date.setDate(latestDate.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const baseRMSE = 1.2 + Math.sin(i * 0.5) * 0.3;
    const baseBias = 0.1 + Math.cos(i * 0.3) * 0.2;
    
    scores.push({
      date: dateStr,
      model: 'hybrid',
      t2m_rmse: Number((baseRMSE + Math.random() * 0.2).toFixed(2)),
      t2m_bias: Number((baseBias + (Math.random() - 0.5) * 0.3).toFixed(2)),
      t2m_mae: Number((baseRMSE * 0.8 + Math.random() * 0.1).toFixed(2)),
      tp_csi: Number((0.55 + Math.random() * 0.15).toFixed(2)),
      tp_pod: Number((0.70 + Math.random() * 0.15).toFixed(2)),
      tp_far: Number((0.25 + Math.random() * 0.10).toFixed(2)),
      heat_event_csi: Number((0.58 + Math.random() * 0.12).toFixed(2)),
      cold_event_csi: Number((0.52 + Math.random() * 0.15).toFixed(2)),
      wet_event_csi: Number((0.48 + Math.random() * 0.12).toFixed(2)),
      lead_time_hours: 24,
    });
  }
  
  return scores;
}

function generateMockForecast(lat: number, lon: number, hours: number = 240): HybridForecastResponse {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const baseTemp = 20 - Math.abs(lat - 45) * 0.4;
  const times: string[] = [];
  const hybrid: number[] = [];
  const ifs: number[] = [];
  const aifs: number[] = [];
  const uncertainty: number[] = [];
  
  for (let h = 0; h <= hours; h += 6) {
    const t = new Date(now.getTime() + h * 60 * 60 * 1000);
    times.push(t.toISOString());
    
    const dailyCycle = 8 * Math.sin((h % 24) * Math.PI / 12 - Math.PI / 2);
    const trend = 3 * Math.sin(h * Math.PI / (7 * 24));
    const noise = (Math.random() - 0.5) * 3;
    
    const ifsVal = baseTemp + dailyCycle + trend + noise;
    const aifsVal = ifsVal + (Math.random() - 0.5) * 2;
    const hybridVal = (ifsVal + aifsVal) / 2;
    
    ifs.push(Number(ifsVal.toFixed(1)));
    aifs.push(Number(aifsVal.toFixed(1)));
    hybrid.push(Number(hybridVal.toFixed(1)));
    uncertainty.push(Number((Math.abs(ifsVal - aifsVal) / 2).toFixed(1)));
  }
  
  return {
    init_date: now.toISOString().split('T')[0].replace(/-/g, ''),
    init_time: '00z',
    location: { lat, lon },
    variable: 't2m',
    times,
    hybrid_values: hybrid,
    ifs_values: ifs,
    aifs_values: aifs,
    uncertainty,
    unit: '°C',
  };
}

function generateMockProfiles(): CropProfile[] {
  return [
    {
      id: 'profile-1',
      user_id: 'user-1',
      polygon_id: 'poly-1',
      name: 'Maize North Field 2024',
      crop_type: 'maize',
      sowing_date: '2024-04-15',
      gdd_base_temp: 10,
      gdd_targets: {
        emergence: 100,
        v6: 300,
        tasseling: 700,
        silking: 800,
        maturity: 1400,
      },
      thresholds: {
        heat_stress: 35,
        cold_stress: 10,
        wet_stress_3day: 50,
      },
      current_gdd: 650,
      current_stage: 'V12 (Pre-tasseling)',
      is_active: true,
      created_at: '2024-04-01T00:00:00Z',
    },
    {
      id: 'profile-2',
      user_id: 'user-1',
      name: 'Winter Wheat South Field',
      crop_type: 'winter_wheat',
      sowing_date: '2024-10-15',
      gdd_base_temp: 0,
      gdd_targets: {
        emergence: 150,
        tillering: 400,
        stem_elongation: 800,
        heading: 1100,
        maturity: 1800,
      },
      thresholds: {
        heat_stress: 32,
        cold_stress: -5,
        frost_damage: -10,
        wet_stress_7day: 70,
      },
      current_gdd: 420,
      current_stage: 'Tillering',
      is_active: true,
      created_at: '2024-10-01T00:00:00Z',
    },
  ];
}

// ============ API Functions ============

export const api = {
  // Health
  async getHealth(): Promise<HealthStatus> {
    if (ENABLE_MOCK) {
      return {
        status: 'healthy',
        database: true,
        gcs: true,
        timestamp: new Date().toISOString(),
        version: '5.0.0',
      };
    }
    return fetchAPI<HealthStatus>('/api/health');
  },

  // Pipeline Status
  async getPipelineStatus(): Promise<PipelineStatus> {
    if (ENABLE_MOCK) {
      const era5 = getERA5Availability();
      const now = new Date();
      
      let nextFetch: Date;
      if (now.getHours() < 8) {
        nextFetch = new Date(now);
        nextFetch.setHours(8, 0, 0, 0);
      } else if (now.getHours() < 20) {
        nextFetch = new Date(now);
        nextFetch.setHours(20, 0, 0, 0);
      } else {
        nextFetch = new Date(now);
        nextFetch.setDate(nextFetch.getDate() + 1);
        nextFetch.setHours(8, 0, 0, 0);
      }
      
      return {
        last_ifs_fetch: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        last_aifs_fetch: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        next_scheduled_fetch: nextFetch.toISOString(),
        ecmwf_delay_hours: 8,
        era5_delay_days: ERA5_DELAY_DAYS,
        era5_latest_date: era5.latest_date,
        status: 'healthy',
        steps: [
          { name: 'Fetch IFS from ECMWF', status: 'completed' },
          { name: 'Fetch AIFS from ECMWF', status: 'completed' },
          { name: 'Store in GCS', status: 'completed' },
          { name: 'Process GRIB files', status: 'completed' },
          { name: 'Generate risk alerts', status: 'completed' },
          { name: 'Update verification (ERA5)', status: 'completed' },
        ],
      };
    }
    return fetchAPI<PipelineStatus>('/api/pipeline/status');
  },

  // Forecasts
  async getAvailableForecasts(): Promise<AvailableForecasts> {
    if (ENABLE_MOCK) {
      const today = new Date();
      const forecasts: AvailableForecasts = { ifs: [], aifs: [] };
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0].replace(/-/g, '');
        
        forecasts.ifs.push({ date: dateStr, init_times: ['00z', '12z'], max_lead_time: 240 });
        forecasts.aifs.push({ date: dateStr, init_times: ['00z', '12z'], max_lead_time: 360 });
      }
      
      return forecasts;
    }
    return fetchAPI<AvailableForecasts>('/api/forecasts/available');
  },

  async getHybridForecast(
    initDate: string,
    initTime: string,
    lat: number,
    lon: number,
    variable: string = 't2m'
  ): Promise<HybridForecastResponse> {
    if (ENABLE_MOCK) {
      return generateMockForecast(lat, lon);
    }
    return fetchAPI<HybridForecastResponse>(
      `/api/forecast/hybrid/${initDate}/${initTime}/location?lat=${lat}&lon=${lon}&variable=${variable}`
    );
  },

  // Global Risk Hotspots (for landing page)
  async getGlobalRiskHotspots(): Promise<RiskHotspot[]> {
    if (ENABLE_MOCK) {
      return generateMockRiskHotspots();
    }
    return fetchAPI<RiskHotspot[]>('/api/risks/global');
  },

  // User Alerts
  async getAlerts(status: string = 'active'): Promise<RiskAlert[]> {
    if (ENABLE_MOCK) {
      const hotspots = generateMockRiskHotspots().slice(0, 3);
      return hotspots.map(h => ({
        id: h.id,
        event_type: h.event_type,
        severity: h.severity,
        location_name: `${h.region}, ${h.country}`,
        location_lat: h.lat,
        location_lon: h.lon,
        forecast_date: h.valid_time.split('T')[0],
        confidence: h.probability,
        action_recommended: h.description,
        status: 'active' as const,
        created_at: new Date().toISOString(),
      }));
    }
    return fetchAPI<RiskAlert[]>(`/api/alerts?status=${status}`);
  },

  async dismissAlert(alertId: string): Promise<void> {
    if (ENABLE_MOCK) return;
    return fetchAPI(`/api/alerts/${alertId}/dismiss`, { method: 'POST' });
  },

  // Verification (with ERA5 delay handling)
  async getVerificationScores(days: number = 10): Promise<VerificationScore[]> {
    if (ENABLE_MOCK) {
      return generateMockVerificationScores(days);
    }
    return fetchAPI<VerificationScore[]>(`/api/verification/scores?days=${days}`);
  },

  // Crop Profiles
  async getProfiles(): Promise<CropProfile[]> {
    if (ENABLE_MOCK) {
      return generateMockProfiles();
    }
    return fetchAPI<CropProfile[]>('/api/profiles');
  },

  async createProfile(profile: Partial<CropProfile>): Promise<CropProfile> {
    if (ENABLE_MOCK) {
      return { ...profile, id: `profile-${Date.now()}`, user_id: 'user-1', created_at: new Date().toISOString() } as CropProfile;
    }
    return fetchAPI<CropProfile>('/api/profiles', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  async deleteProfile(profileId: string): Promise<void> {
    if (ENABLE_MOCK) return;
    return fetchAPI(`/api/profiles/${profileId}`, { method: 'DELETE' });
  },

  // Polygons
  async getPolygons(): Promise<UserPolygon[]> {
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
          created_at: '2024-04-01T00:00:00Z',
        },
      ];
    }
    return fetchAPI<UserPolygon[]>('/api/polygons');
  },

  // Auth
  async login(email: string, password: string): Promise<{ access_token: string }> {
    if (ENABLE_MOCK) {
      localStorage.setItem('aiwfa_token', 'mock-token-12345');
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
  },

  async logout(): Promise<void> {
    localStorage.removeItem('aiwfa_token');
  },

  async register(email: string, password: string, name?: string): Promise<{ access_token: string }> {
    if (ENABLE_MOCK) {
      localStorage.setItem('aiwfa_token', 'mock-token-12345');
      return { access_token: 'mock-token-12345' };
    }
    return fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },
};

export default api;
