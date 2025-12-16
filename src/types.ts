// ============================================
// AIWFA Type Definitions v5.1
// AI Weather Forecasts for Agriculture
// ============================================

// ============ Location & Geography ============

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

// ============ User & Auth ============

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

// ============ Forecast Data ============

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

// ============ Risk & Alerts ============

export type RiskEventType = 'HEAT' | 'COLD' | 'WET' | 'DRY' | 'FROST' | 'STORM';
export type RiskSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
export type AlertStatus = 'active' | 'dismissed' | 'expired' | 'triggered';
export type WeatherVariable = 't2m' | 'tp';

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
  variable: WeatherVariable;
  value: number;
  threshold: number;
  probability: number;
  valid_time: string;
  lead_time_days: number;
  description: string;
  crop_impact?: string;
}

// ============ Verification & ERA5 ============

export interface VerificationScore {
  date: string;
  model: string;
  region?: string;
  t2m_rmse?: number;
  t2m_bias?: number;
  t2m_mae?: number;
  t2m_correlation?: number;
  tp_rmse?: number;
  tp_bias?: number;
  tp_csi?: number;
  tp_pod?: number;
  tp_far?: number;
  heat_event_csi?: number;
  heat_event_pod?: number;
  heat_event_far?: number;
  cold_event_csi?: number;
  wet_event_csi?: number;
  lead_time_hours: number;
}

export interface ERA5Availability {
  latest_date: string;
  delay_days: number;
  available_from: string;
  available_to: string;
  is_available: boolean;
}

// ============ Crop Profiles ============

export type CropType = 'maize' | 'winter_wheat' | 'spring_barley' | 'soybean' | 'rice' | 'winter_cereals';

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
  flowering?: number;
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

// ============ User Polygons (Areas of Concern) ============

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

// ============ Pipeline Status ============

export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  start_time?: string;
  end_time?: string;
  error?: string;
  duration_seconds?: number;
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
  data_freshness: {
    ifs_age_hours: number;
    aifs_age_hours: number;
    era5_age_days: number;
  };
}

// ============ API Health ============

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  database: boolean;
  gcs: boolean;
  ecmwf_connection: boolean;
  timestamp: string;
  version?: string;
  uptime_seconds?: number;
}

// ============ Chart Data ============

export interface ChartDataPoint {
  time: string;
  displayTime: string;
  hybrid?: number;
  ifs?: number;
  aifs?: number;
  upper?: number;
  lower?: number;
  observed?: number;
  anomaly?: number;
}

export interface TimeSeriesData {
  times: string[];
  values: number[];
  uncertainty?: number[];
  unit: string;
}

// ============ Map & Visualization ============

export interface MapLayer {
  id: string;
  name: string;
  type: 'risk' | 'temperature' | 'precipitation' | 'anomaly';
  visible: boolean;
  opacity: number;
}

export interface MapViewport {
  center: Location;
  zoom: number;
  bounds?: BoundingBox;
}

// ============ Global Weather Data ============

export interface GlobalWeatherField {
  variable: WeatherVariable;
  init_time: string;
  valid_time: string;
  data: number[][];
  lat_range: [number, number];
  lon_range: [number, number];
  resolution: number;
  unit: string;
}

export interface RegionalSummary {
  region: string;
  country: string;
  t2m_mean: number;
  t2m_max: number;
  t2m_min: number;
  t2m_anomaly: number;
  tp_total: number;
  tp_anomaly: number;
  risk_level: RiskSeverity;
  active_alerts: number;
}
