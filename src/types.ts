// ============================================
// AIWFA Type Definitions
// ============================================

// Location & Geography
export interface Location {
  lat: number;
  lon: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

// User & Auth
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'agronomist';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Forecast Data
export interface ForecastPoint {
  time: string;
  value: number;
}

export interface ForecastResponse {
  model: string;
  init_date: string;
  init_time: string;
  location: Location;
  variable: string;
  times: string[];
  values: number[];
  unit: string;
}

export interface HybridForecastResponse {
  init_date: string;
  init_time: string;
  location: Location;
  variable: string;
  times: string[];
  hybrid_values: number[];
  ifs_values: number[];
  aifs_values: number[];
  uncertainty: number[];
  unit: string;
}

export interface AvailableForecasts {
  ifs: ForecastAvailability[];
  aifs: ForecastAvailability[];
}

export interface ForecastAvailability {
  date: string;
  init_times: string[];
  max_lead_time: number;
}

// Risk Alerts
export type RiskEventType = 'HEAT' | 'COLD' | 'WET' | 'DRY' | 'FROST' | 'STORM';
export type RiskSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
export type AlertStatus = 'active' | 'dismissed' | 'expired' | 'triggered';

export interface RiskAlert {
  id: string;
  event_type: RiskEventType;
  severity: RiskSeverity;
  location_name?: string;
  location_lat?: number;
  location_lon?: number;
  forecast_date: string;
  date_start?: string;
  date_end?: string;
  duration_hours?: number;
  confidence?: number;
  probability?: number;
  peak_value?: number;
  action_recommended?: string;
  status: AlertStatus;
  model_source?: string;
  created_at: string;
}

// Global Risk Hotspots (for landing page map)
export interface RiskHotspot {
  id: string;
  lat: number;
  lon: number;
  region: string;
  country: string;
  event_type: RiskEventType;
  severity: RiskSeverity;
  variable: 't2m' | 'tp';
  value: number;
  threshold: number;
  probability: number;
  valid_time: string;
  description: string;
}

// Verification & ERA5
export interface VerificationScore {
  date: string;
  model: string;
  t2m_rmse?: number;
  t2m_bias?: number;
  t2m_mae?: number;
  tp_csi?: number;
  tp_pod?: number;
  tp_far?: number;
  heat_event_csi?: number;
  cold_event_csi?: number;
  wet_event_csi?: number;
  lead_time_hours: number;
}

export interface ERA5Availability {
  latest_date: string;
  delay_days: number;
  available_from: string;
  available_to: string;
}

// Crop Profiles
export type CropType = 'maize' | 'winter_wheat' | 'spring_barley' | 'soybean' | 'rice';

export interface GDDTargets {
  emergence?: number;
  v6?: number;
  tasseling?: number;
  silking?: number;
  grain_fill?: number;
  maturity?: number;
  tillering?: number;
  stem_elongation?: number;
  heading?: number;
  [key: string]: number | undefined;
}

export interface CropThresholds {
  heat_stress: number;
  cold_stress: number;
  frost_damage?: number;
  wet_stress_3day?: number;
  wet_stress_7day?: number;
  dry_stress?: number;
}

export interface CropProfile {
  id: string;
  user_id: string;
  polygon_id?: string;
  name: string;
  crop_type: CropType;
  sowing_date: string;
  expected_harvest_date?: string;
  gdd_base_temp: number;
  gdd_targets: GDDTargets;
  thresholds: CropThresholds;
  current_gdd: number;
  current_stage?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

// User Polygons (Areas of Concern)
export interface UserPolygon {
  id: string;
  user_id: string;
  name: string;
  geometry: GeoJSONPolygon;
  centroid?: Location;
  area_hectares?: number;
  crop_type?: CropType;
  tags?: string[];
  created_at: string;
}

// Pipeline Status
export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  start_time?: string;
  end_time?: string;
  error?: string;
}

export interface PipelineStatus {
  last_ifs_fetch: string;
  last_aifs_fetch: string;
  next_scheduled_fetch: string;
  ecmwf_delay_hours: number;
  era5_delay_days: number;
  era5_latest_date: string;
  status: 'healthy' | 'degraded' | 'error';
  steps: PipelineStep[];
}

// API Health
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  database: boolean;
  gcs: boolean;
  timestamp: string;
  version?: string;
}

// Chart Data
export interface ChartDataPoint {
  time: string;
  displayTime: string;
  hybrid?: number;
  ifs?: number;
  aifs?: number;
  upper?: number;
  lower?: number;
  observed?: number;
}
