import { useState, useEffect, useMemo } from 'react';
import {
  Thermometer, CloudRain, AlertTriangle, TrendingUp, Clock, RefreshCw,
  CheckCircle, XCircle, Menu, X, ChevronRight, Globe, BarChart3,
  Leaf, MapPin, Bell, User, LogOut, Settings, Info, ExternalLink,
  Droplets, Wind, Sun, CloudSnow, Zap, Activity, Calendar, Target,
  Filter, Eye, EyeOff, ArrowRight, Database, Server, Cpu
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ComposedChart, Bar
} from 'recharts';
import {
  RiskHotspot, RiskAlert, VerificationScore, CropProfile, PipelineStatus,
  HealthStatus, ERA5Availability, RegionalSummary, RiskSeverity, WeatherVariable
} from './types';
import * as api from './services/api';

// ============================================================================
// WORLD MAP COMPONENT
// ============================================================================
const WorldMap = () => (
  <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#030712" />
        <stop offset="100%" stopColor="#0a0f1a" />
      </linearGradient>
      <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e3a5f" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(34,211,238,0.05)" strokeWidth="0.5"/>
      </pattern>
    </defs>
    
    {/* Ocean background */}
    <rect width="1000" height="500" fill="url(#oceanGrad)" />
    <rect width="1000" height="500" fill="url(#grid)" />
    
    {/* Grid lines */}
    {[...Array(7)].map((_, i) => (
      <line key={`lat-${i}`} x1="0" y1={i * 71.4 + 35} x2="1000" y2={i * 71.4 + 35} 
            stroke="rgba(34,211,238,0.08)" strokeWidth="0.5" strokeDasharray="4,4"/>
    ))}
    {[...Array(13)].map((_, i) => (
      <line key={`lon-${i}`} x1={i * 83.3} y1="0" x2={i * 83.3} y2="500" 
            stroke="rgba(34,211,238,0.08)" strokeWidth="0.5" strokeDasharray="4,4"/>
    ))}
    
    {/* Equator */}
    <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(34,211,238,0.15)" strokeWidth="1"/>
    
    {/* Simplified continents */}
    <g fill="url(#landGrad)" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" filter="url(#glow)">
      {/* North America */}
      <path d="M 80 80 Q 120 60 180 70 L 220 90 Q 250 100 260 140 L 240 180 Q 200 200 160 190 L 120 160 Q 90 130 80 80 Z" />
      <path d="M 160 190 L 180 220 Q 200 260 180 280 L 140 260 Q 130 230 160 190 Z" />
      {/* South America */}
      <path d="M 200 290 Q 240 280 260 310 L 280 380 Q 260 440 230 460 L 200 440 Q 180 380 200 290 Z" />
      {/* Europe */}
      <path d="M 440 80 Q 480 70 520 80 L 540 120 Q 520 150 480 140 L 450 120 Q 430 100 440 80 Z" />
      {/* Africa */}
      <path d="M 440 180 Q 500 170 540 200 L 560 280 Q 540 360 500 380 L 460 360 Q 420 300 440 180 Z" />
      {/* Asia */}
      <path d="M 540 60 Q 620 50 720 70 L 800 100 Q 850 140 840 180 L 780 200 Q 700 190 640 160 L 580 140 Q 540 110 540 60 Z" />
      <path d="M 700 200 Q 740 210 760 250 L 740 280 Q 700 270 680 240 L 700 200 Z" />
      {/* India */}
      <path d="M 640 200 Q 680 190 700 220 L 690 280 Q 660 310 640 290 L 620 250 Q 620 220 640 200 Z" />
      {/* Australia */}
      <path d="M 780 340 Q 840 320 880 350 L 890 400 Q 860 440 820 430 L 780 400 Q 760 370 780 340 Z" />
      {/* Japan */}
      <path d="M 860 130 Q 880 120 890 140 L 880 170 Q 860 180 850 160 L 860 130 Z" />
    </g>
    
    {/* Atmospheric glow */}
    <ellipse cx="500" cy="250" rx="450" ry="200" fill="none" stroke="rgba(34,211,238,0.03)" strokeWidth="40"/>
  </svg>
);

// ============================================================================
// RISK MARKER COMPONENT
// ============================================================================
interface RiskMarkerProps {
  hotspot: RiskHotspot;
  onClick: (h: RiskHotspot) => void;
  isSelected: boolean;
  showLabels: boolean;
}

const RiskMarker = ({ hotspot, onClick, isSelected, showLabels }: RiskMarkerProps) => {
  // Equirectangular projection
  const x = ((hotspot.lon + 180) / 360) * 1000;
  const y = ((90 - hotspot.lat) / 180) * 500;
  
  const severityColors: Record<RiskSeverity, string> = {
    LOW: '#22d3ee',
    MODERATE: '#fbbf24',
    HIGH: '#fb7185',
    EXTREME: '#ef4444'
  };
  
  const color = severityColors[hotspot.severity];
  const isTemp = hotspot.variable === 't2m';
  const size = isSelected ? 14 : 10;
  
  return (
    <g 
      className="cursor-pointer transition-all duration-300"
      onClick={() => onClick(hotspot)}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {/* Pulse ring */}
      <circle r={size + 8} fill="none" stroke={color} strokeWidth="1" opacity="0.3">
        <animate attributeName="r" values={`${size};${size + 15};${size}`} dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      {/* Main marker */}
      <circle 
        r={size} 
        fill={color} 
        fillOpacity="0.3" 
        stroke={color} 
        strokeWidth="2"
        className={isSelected ? 'animate-pulse' : ''}
      />
      
      {/* Icon */}
      <g transform="translate(-6, -6)" fill={color}>
        {isTemp ? (
          <path d="M6 2v6.5a3 3 0 1 0 4 0V2a2 2 0 1 0-4 0z" strokeWidth="0.5" stroke={color} fill="none"/>
        ) : (
          <path d="M8 2s4 4 4 7a4 4 0 1 1-8 0c0-3 4-7 4-7z" strokeWidth="0.5" stroke={color} fill="none"/>
        )}
      </g>
      
      {/* Label */}
      {(showLabels || isSelected) && (
        <g transform="translate(16, 4)">
          <rect x="-2" y="-12" width="70" height="16" rx="3" fill="rgba(0,0,0,0.8)" stroke={color} strokeWidth="0.5"/>
          <text fontSize="10" fill={color} fontFamily="JetBrains Mono" fontWeight="500">
            {hotspot.value.toFixed(1)}{isTemp ? '°C' : 'mm'}
          </text>
        </g>
      )}
    </g>
  );
};

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'cyan' | 'emerald' | 'amber' | 'rose';
  trend?: { value: number; positive: boolean };
}

const StatsCard = ({ title, value, subtitle, icon, color, trend }: StatsCardProps) => {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400'
  };
  
  return (
    <div className={`glass-card p-4 bg-gradient-to-br ${colorClasses[color]} transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-gray-900/50">{icon}</div>
        {trend && (
          <div className={`flex items-center text-xs ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            <TrendingUp size={12} className={trend.positive ? '' : 'rotate-180'} />
            <span className="ml-1">{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold font-mono">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

// ============================================================================
// ALERT LIST COMPONENT
// ============================================================================
interface AlertListProps {
  alerts: RiskAlert[];
  onDismiss: (id: string) => void;
  compact?: boolean;
}

const AlertList = ({ alerts, onDismiss, compact = false }: AlertListProps) => {
  const severityIcons = {
    FROST: <CloudSnow size={16} />,
    HEAT: <Sun size={16} />,
    COLD: <Thermometer size={16} />,
    WET: <CloudRain size={16} />,
    DRY: <Droplets size={16} />,
    STORM: <Zap size={16} />
  };
  
  const severityColors: Record<RiskSeverity, string> = {
    LOW: 'border-l-cyan-500 bg-cyan-500/5',
    MODERATE: 'border-l-amber-500 bg-amber-500/5',
    HIGH: 'border-l-rose-500 bg-rose-500/5',
    EXTREME: 'border-l-red-500 bg-red-500/5'
  };
  
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <CheckCircle size={32} className="text-emerald-500 mb-2" />
        <p className="text-sm">No active alerts</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {alerts.slice(0, compact ? 5 : undefined).map((alert) => (
        <div 
          key={alert.id}
          className={`glass-card border-l-4 ${severityColors[alert.severity]} p-3 transition-all duration-300 hover:bg-gray-800/50`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded ${
                alert.severity === 'LOW' ? 'bg-cyan-500/20 text-cyan-400' :
                alert.severity === 'MODERATE' ? 'bg-amber-500/20 text-amber-400' :
                alert.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {severityIcons[alert.event_type as keyof typeof severityIcons] || <AlertTriangle size={16} />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">{alert.event_type} Alert</p>
                <p className="text-xs text-gray-400">{alert.region}, {alert.country}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {alert.lead_time_days}d ahead
                  </span>
                  <span className="flex items-center gap-1">
                    <Target size={10} />
                    {(alert.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>
                {!compact && alert.action_recommended && (
                  <p className="text-xs text-amber-400 mt-2 italic">{alert.action_recommended}</p>
                )}
              </div>
            </div>
            <button 
              onClick={() => onDismiss(alert.id)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X size={14} className="text-gray-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// VERIFICATION CHART COMPONENT
// ============================================================================
interface VerificationChartProps {
  scores: VerificationScore[];
  era5: ERA5Availability;
}

const VerificationChart = ({ scores, era5 }: VerificationChartProps) => {
  const chartData = scores.map(s => ({
    date: api.formatDate(s.date),
    rmse: s.temperature.rmse,
    bias: s.temperature.bias,
    csi: s.events.heat.csi * 100,
    pod: s.events.heat.pod * 100
  }));
  
  const avgRmse = (scores.reduce((a, s) => a + s.temperature.rmse, 0) / scores.length).toFixed(2);
  const avgCsi = (scores.reduce((a, s) => a + s.events.heat.csi, 0) / scores.length * 100).toFixed(0);
  const avgPod = (scores.reduce((a, s) => a + s.events.heat.pod, 0) / scores.length * 100).toFixed(0);
  
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-300">Model Verification</h3>
          <p className="text-xs text-gray-500">Last {scores.length} available days vs ERA5</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <Clock size={14} className="text-emerald-400" />
          <div className="text-xs">
            <span className="text-gray-400">{era5.delay_days}-day delay</span>
            <span className="text-emerald-400 ml-2 font-mono">{api.formatDate(era5.latest_date)}</span>
          </div>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,85,99,0.2)" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 10 }} domain={[0, 3]} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 10 }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '8px'
              }}
            />
            <Area yAxisId="left" type="monotone" dataKey="rmse" stroke="#22d3ee" fill="url(#rmseGrad)" name="RMSE (°C)" />
            <Line yAxisId="right" type="monotone" dataKey="csi" stroke="#fbbf24" strokeWidth={2} dot={false} name="Heat CSI (%)" />
            <defs>
              <linearGradient id="rmseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mt-4">
        <div className="text-center p-2 rounded bg-gray-800/50">
          <p className="text-lg font-mono font-bold text-cyan-400">{avgRmse}°C</p>
          <p className="text-xs text-gray-500">Avg RMSE</p>
        </div>
        <div className="text-center p-2 rounded bg-gray-800/50">
          <p className="text-lg font-mono font-bold text-amber-400">{avgCsi}%</p>
          <p className="text-xs text-gray-500">Heat CSI</p>
        </div>
        <div className="text-center p-2 rounded bg-gray-800/50">
          <p className="text-lg font-mono font-bold text-emerald-400">{avgPod}%</p>
          <p className="text-xs text-gray-500">Heat POD</p>
        </div>
        <div className="text-center p-2 rounded bg-gray-800/50">
          <p className="text-lg font-mono font-bold text-rose-400">
            {(scores.reduce((a, s) => a + s.events.heat.far, 0) / scores.length * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500">FAR</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PIPELINE STATUS COMPONENT
// ============================================================================
interface PipelineCardProps {
  status: PipelineStatus | null;
  onRefresh: () => void;
}

const PipelineCard = ({ status, onRefresh }: PipelineCardProps) => {
  if (!status) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }
  
  const isHealthy = status.steps.every(s => s.status !== 'failed');
  
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          <h3 className="text-sm font-medium text-gray-300">Data Pipeline</h3>
        </div>
        <button 
          onClick={onRefresh}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw size={14} className="text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-2">
        {status.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {step.status === 'completed' && <CheckCircle size={12} className="text-emerald-400" />}
            {step.status === 'running' && <RefreshCw size={12} className="text-cyan-400 animate-spin" />}
            {step.status === 'failed' && <XCircle size={12} className="text-rose-400" />}
            {step.status === 'pending' && <Clock size={12} className="text-gray-500" />}
            <span className={step.status === 'failed' ? 'text-rose-400' : 'text-gray-400'}>{step.name}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-800 space-y-1 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Last IFS fetch:</span>
          <span className="font-mono text-gray-400">{api.formatDateTime(status.last_ifs_fetch)}</span>
        </div>
        <div className="flex justify-between">
          <span>ERA5 latest:</span>
          <span className="font-mono text-emerald-400">{api.formatDate(status.era5_latest_date)}</span>
        </div>
        <div className="flex justify-between">
          <span>Data freshness:</span>
          <span className={`font-mono ${status.data_freshness === 'fresh' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {status.data_freshness}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CROP PROFILE CARD COMPONENT
// ============================================================================
interface CropProfileCardProps {
  profile: CropProfile;
  onEdit: (p: CropProfile) => void;
  onDelete: (id: string) => void;
}

const CropProfileCard = ({ profile, onEdit, onDelete }: CropProfileCardProps) => {
  const maturityTarget = profile.gdd_targets.maturity ?? 2500;
  const progress = (profile.current_gdd / maturityTarget) * 100;
  
  return (
    <div className="glass-card p-4 hover:bg-gray-800/50 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Leaf size={18} className="text-emerald-400" />
          </div>
          <div>
            <h4 className="font-medium text-gray-200">{profile.name}</h4>
            <p className="text-xs text-gray-500">{profile.crop_type} • Sown {api.formatDate(profile.sowing_date)}</p>
          </div>
        </div>
        <span className="px-2 py-1 text-xs font-mono rounded bg-cyan-500/20 text-cyan-400">
          {profile.current_stage}
        </span>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">GDD Progress</span>
          <span className="font-mono text-gray-400">{profile.current_gdd} / {profile.gdd_targets.maturity}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <div className="flex-1 text-center p-2 rounded bg-rose-500/10">
          <Sun size={12} className="inline text-rose-400 mb-1" />
          <p className="text-xs font-mono text-rose-400">{profile.thresholds.heat_max}°C</p>
        </div>
        <div className="flex-1 text-center p-2 rounded bg-cyan-500/10">
          <CloudSnow size={12} className="inline text-cyan-400 mb-1" />
          <p className="text-xs font-mono text-cyan-400">{profile.thresholds.cold_min}°C</p>
        </div>
        <div className="flex-1 text-center p-2 rounded bg-amber-500/10">
          <CloudRain size={12} className="inline text-amber-400 mb-1" />
          <p className="text-xs font-mono text-amber-400">{profile.thresholds.wet_max}mm</p>
        </div>
      </div>
      
      {profile.notes && (
        <p className="mt-3 text-xs text-gray-500 line-clamp-2">{profile.notes}</p>
      )}
      
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-800">
        <button 
          onClick={() => onEdit(profile)}
          className="flex-1 text-xs text-center py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(profile.id)}
          className="flex-1 text-xs text-center py-1.5 rounded bg-gray-800 hover:bg-rose-900/30 text-gray-400 hover:text-rose-400 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// HOTSPOT DETAIL PANEL
// ============================================================================
interface HotspotDetailProps {
  hotspot: RiskHotspot;
  onClose: () => void;
}

const HotspotDetail = ({ hotspot, onClose }: HotspotDetailProps) => {
  const isTemp = hotspot.variable === 't2m';
  
  return (
    <div className="glass-card p-4 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isTemp ? 'bg-rose-500/20' : 'bg-cyan-500/20'}`}>
            {isTemp ? <Thermometer className="text-rose-400" /> : <CloudRain className="text-cyan-400" />}
          </div>
          <div>
            <h3 className="font-medium text-gray-200">{hotspot.event_type} Event</h3>
            <p className="text-sm text-gray-400">{hotspot.region}, {hotspot.country}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
          <X size={16} className="text-gray-500" />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded bg-gray-800/50">
          <p className={`text-xl font-mono font-bold ${isTemp ? 'text-rose-400' : 'text-cyan-400'}`}>
            {hotspot.value.toFixed(1)}{isTemp ? '°C' : 'mm'}
          </p>
          <p className="text-xs text-gray-500">Forecast</p>
        </div>
        <div className="text-center p-2 rounded bg-gray-800/50">
          <p className="text-xl font-mono font-bold text-amber-400">{hotspot.lead_time_days}d</p>
          <p className="text-xs text-gray-500">Lead Time</p>
        </div>
        <div className="text-center p-2 rounded bg-gray-800/50">
          <p className="text-xl font-mono font-bold text-emerald-400">{(hotspot.probability * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-500">Probability</p>
        </div>
      </div>
      
      <div className={`p-3 rounded-lg mb-3 ${
        hotspot.severity === 'LOW' ? 'bg-cyan-500/10 border border-cyan-500/30' :
        hotspot.severity === 'MODERATE' ? 'bg-amber-500/10 border border-amber-500/30' :
        hotspot.severity === 'HIGH' ? 'bg-rose-500/10 border border-rose-500/30' :
        'bg-red-500/10 border border-red-500/30'
      }`}>
        <p className="text-sm text-gray-300">{hotspot.description}</p>
      </div>
      
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <p className="text-xs text-amber-400 font-medium mb-1">Crop Impact</p>
        <p className="text-sm text-gray-300">{hotspot.crop_impact}</p>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {hotspot.lat.toFixed(2)}°, {hotspot.lon.toFixed(2)}°
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          Valid {api.formatDate(hotspot.valid_time)}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// REGIONAL SUMMARY CARD
// ============================================================================
interface RegionalSummaryCardProps {
  summary: RegionalSummary;
}

const RegionalSummaryCard = ({ summary }: RegionalSummaryCardProps) => (
  <div className="glass-card p-4 hover:bg-gray-800/50 transition-all">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium text-gray-200">{summary.region}</h4>
      {summary.active_alerts > 0 && (
        <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/20 text-rose-400">
          {summary.active_alerts} alerts
        </span>
      )}
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <div className="p-2 rounded bg-gray-800/50">
        <div className="flex items-center gap-2 mb-1">
          <Thermometer size={12} className="text-rose-400" />
          <span className="text-xs text-gray-500">Temperature</span>
        </div>
        <p className="font-mono text-sm text-gray-300">
          {summary.t2m_mean.toFixed(1)}°C
          <span className="text-xs text-gray-500 ml-1">
            ({summary.t2m_min.toFixed(0)}-{summary.t2m_max.toFixed(0)})
          </span>
        </p>
        {summary.t2m_anomaly !== 0 && (
          <p className={`text-xs ${summary.t2m_anomaly > 0 ? 'text-rose-400' : 'text-cyan-400'}`}>
            {summary.t2m_anomaly > 0 ? '+' : ''}{summary.t2m_anomaly.toFixed(1)}°C anomaly
          </p>
        )}
      </div>
      
      <div className="p-2 rounded bg-gray-800/50">
        <div className="flex items-center gap-2 mb-1">
          <CloudRain size={12} className="text-cyan-400" />
          <span className="text-xs text-gray-500">Precipitation</span>
        </div>
        <p className="font-mono text-sm text-gray-300">
          {summary.tp_total.toFixed(0)}mm
          <span className="text-xs text-gray-500 ml-1">/7d</span>
        </p>
        {summary.tp_anomaly !== 0 && (
          <p className={`text-xs ${summary.tp_anomaly > 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
            {summary.tp_anomaly > 0 ? '+' : ''}{summary.tp_anomaly.toFixed(0)}mm anomaly
          </p>
        )}
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  // State
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [auth, setAuth] = useState(() => localStorage.getItem('auth') === 'true');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Filters
  const [varFilter, setVarFilter] = useState<'all' | WeatherVariable>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | RiskSeverity>('all');
  const [showLabels, setShowLabels] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<RiskHotspot | null>(null);
  
  // Data
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);
  const [risks, setRisks] = useState<RiskHotspot[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [scores, setScores] = useState<VerificationScore[]>([]);
  const [profiles, setProfiles] = useState<CropProfile[]>([]);
  const [regions, setRegions] = useState<RegionalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  const era5 = api.getERA5Availability();
  
  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [healthData, pipelineData, risksData, scoresData, regionsData] = await Promise.all([
          api.getHealth(),
          api.getPipelineStatus(),
          api.getGlobalRiskHotspots(),
          api.getVerificationScores(10),
          api.getRegionalSummaries()
        ]);
        setHealth(healthData);
        setPipeline(pipelineData);
        setRisks(risksData);
        setScores(scoresData);
        setRegions(regionsData);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
      setLoading(false);
    };
    loadData();
  }, []);
  
  // Load user data when authenticated
  useEffect(() => {
    if (auth) {
      api.getAlerts().then(setAlerts).catch(console.error);
      api.getProfiles().then(setProfiles).catch(console.error);
    }
  }, [auth]);
  
  // Filtered hotspots
  const filteredHotspots = useMemo(() => {
    return risks.filter(h => {
      if (varFilter !== 'all' && h.variable !== varFilter) return false;
      if (severityFilter !== 'all' && h.severity !== severityFilter) return false;
      return true;
    });
  }, [risks, varFilter, severityFilter]);
  
  // Stats
  const stats = useMemo(() => ({
    total: filteredHotspots.length,
    temp: filteredHotspots.filter(h => h.variable === 't2m').length,
    precip: filteredHotspots.filter(h => h.variable === 'tp').length,
    high: filteredHotspots.filter(h => h.severity === 'HIGH' || h.severity === 'EXTREME').length,
    avgCsi: scores.length > 0 
      ? (scores.reduce((a, s) => a + s.events.heat.csi, 0) / scores.length * 100).toFixed(0)
      : '—'
  }), [filteredHotspots, scores]);
  
  // Handlers
  const handleLogin = () => {
    localStorage.setItem('auth', 'true');
    setAuth(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auth');
    setAuth(false);
    setAlerts([]);
    setProfiles([]);
  };
  
  const handleDismissAlert = async (id: string) => {
    try {
      await api.dismissAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };
  
  const handleRefreshPipeline = async () => {
    try {
      const data = await api.getPipelineStatus();
      setPipeline(data);
    } catch (err) {
      console.error('Failed to refresh pipeline:', err);
    }
  };
  
  return (
    <div className="min-h-screen bg-void noise-overlay">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-gray-800/50 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                <Globe size={18} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-100">AIWFA</span>
                <span className="text-cyan-400 ml-1">GLOBAL</span>
                <span className="text-xs text-gray-500 ml-2 font-mono">v5.1</span>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setView('landing')}
                className={`text-sm transition-colors ${view === 'landing' ? 'text-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Global Map
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`text-sm transition-colors ${view === 'dashboard' ? 'text-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Dashboard
              </button>
              
              {/* Status indicator */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50">
                <div className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs text-gray-400">{health?.status || 'Loading...'}</span>
              </div>
            </div>
            
            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              {auth ? (
                <>
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <Bell size={18} className="text-gray-400" />
                    {alerts.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-xs flex items-center justify-center">
                        {alerts.length}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <User size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="btn-neon text-sm text-cyan-400"
                >
                  Sign In
                </button>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          
          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800 animate-slide-down">
              <div className="space-y-2">
                <button
                  onClick={() => { setView('landing'); setMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg ${view === 'landing' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-400'}`}
                >
                  Global Map
                </button>
                <button
                  onClick={() => { setView('dashboard'); setMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg ${view === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-400'}`}
                >
                  Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="pt-14">
        {view === 'landing' ? (
          <>
            {/* Hero Map Section */}
            <section className="relative h-[65vh] min-h-[500px]">
              {/* Map background */}
              <div className="absolute inset-0">
                <WorldMap />
              </div>
              
              {/* Risk markers overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
                <g className="pointer-events-auto">
                  {filteredHotspots.map((h) => (
                    <RiskMarker
                      key={h.id}
                      hotspot={h}
                      onClick={setSelectedHotspot}
                      isSelected={selectedHotspot?.id === h.id}
                      showLabels={showLabels}
                    />
                  ))}
                </g>
              </svg>
              
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-void/50 via-transparent to-void/50 pointer-events-none" />
              
              {/* Filter controls */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className="glass-card p-2 flex gap-1">
                  {(['all', 't2m', 'tp'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setVarFilter(v)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                        varFilter === v 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                          : 'text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      {v === 'all' ? `All (${risks.length})` : v === 't2m' ? `Temp (${stats.temp})` : `Precip (${stats.precip})`}
                    </button>
                  ))}
                </div>
                
                <div className="glass-card p-2 flex gap-1">
                  {(['all', 'LOW', 'MODERATE', 'HIGH', 'EXTREME'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSeverityFilter(s)}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        severityFilter === s 
                          ? s === 'LOW' ? 'bg-cyan-500/20 text-cyan-400' :
                            s === 'MODERATE' ? 'bg-amber-500/20 text-amber-400' :
                            s === 'HIGH' ? 'bg-rose-500/20 text-rose-400' :
                            s === 'EXTREME' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-700 text-gray-200'
                          : 'text-gray-500 hover:bg-gray-800'
                      }`}
                    >
                      {s === 'all' ? 'ALL' : s.slice(0, 3)}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className="glass-card p-2 flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showLabels ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{showLabels ? 'Hide' : 'Show'} Labels</span>
                </button>
              </div>
              
              {/* Selected hotspot detail */}
              {selectedHotspot && (
                <div className="absolute top-4 right-4 w-80">
                  <HotspotDetail 
                    hotspot={selectedHotspot} 
                    onClose={() => setSelectedHotspot(null)} 
                  />
                </div>
              )}
              
              {/* Bottom stats bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-void to-transparent pt-16 pb-4">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatsCard
                      title="Active Risk Zones"
                      value={stats.total}
                      subtitle="Global agricultural areas"
                      icon={<AlertTriangle size={18} className="text-rose-400" />}
                      color="rose"
                    />
                    <StatsCard
                      title="High Severity"
                      value={stats.high}
                      subtitle="Requiring attention"
                      icon={<Zap size={18} className="text-amber-400" />}
                      color="amber"
                    />
                    <StatsCard
                      title="Model CSI"
                      value={`${stats.avgCsi}%`}
                      subtitle="10-day average"
                      icon={<Activity size={18} className="text-emerald-400" />}
                      color="emerald"
                    />
                    <StatsCard
                      title="ERA5 Delay"
                      value={`${era5.delay_days} days`}
                      subtitle={`Latest: ${api.formatDate(era5.latest_date)}`}
                      icon={<Clock size={18} className="text-cyan-400" />}
                      color="cyan"
                    />
                  </div>
                </div>
              </div>
            </section>
            
            {/* Regional Summaries */}
            <section className="py-8 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-100">Regional Overview</h2>
                    <p className="text-sm text-gray-500">7-day forecast summary by agricultural region</p>
                  </div>
                  <button className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    <span>View All Regions</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {regions.map(r => (
                    <RegionalSummaryCard key={r.region} summary={r} />
                  ))}
                </div>
              </div>
            </section>
            
            {/* Verification Section */}
            <section className="py-8 px-4 bg-gradient-to-b from-transparent to-abyss/50">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <VerificationChart scores={scores} era5={era5} />
                  </div>
                  <div>
                    <PipelineCard status={pipeline} onRefresh={handleRefreshPipeline} />
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* Dashboard View */
          <div className="max-w-7xl mx-auto px-4 py-8">
            {!auth ? (
              /* Login prompt */
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="glass-card p-8 max-w-md">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                    <User size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-100 mb-2">Sign In Required</h2>
                  <p className="text-gray-400 mb-6">
                    Access your personalized dashboard with crop profiles, custom alerts, and area monitoring.
                  </p>
                  <button 
                    onClick={handleLogin}
                    className="w-full btn-neon text-cyan-400 py-3"
                  >
                    Sign In to Continue
                  </button>
                </div>
              </div>
            ) : (
              /* Authenticated Dashboard */
              <div className="space-y-8">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-100">Your Dashboard</h1>
                    <p className="text-gray-500">Personalized agricultural monitoring</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 glass-card hover:bg-gray-800/50 transition-colors text-sm text-gray-400">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Active Alerts"
                    value={alerts.length}
                    icon={<Bell size={18} className="text-rose-400" />}
                    color="rose"
                  />
                  <StatsCard
                    title="Crop Profiles"
                    value={profiles.length}
                    icon={<Leaf size={18} className="text-emerald-400" />}
                    color="emerald"
                  />
                  <StatsCard
                    title="Monitored Areas"
                    value={0}
                    subtitle="Draw polygons to start"
                    icon={<MapPin size={18} className="text-cyan-400" />}
                    color="cyan"
                  />
                  <StatsCard
                    title="Forecast Days"
                    value={14}
                    subtitle="Lead time available"
                    icon={<Calendar size={18} className="text-amber-400" />}
                    color="amber"
                  />
                </div>
                
                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Alerts Column */}
                  <div className="lg:col-span-1">
                    <div className="glass-card p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-200">Active Alerts</h3>
                        <span className="text-xs text-gray-500">{alerts.length} total</span>
                      </div>
                      <AlertList alerts={alerts} onDismiss={handleDismissAlert} />
                    </div>
                  </div>
                  
                  {/* Crop Profiles Column */}
                  <div className="lg:col-span-2">
                    <div className="glass-card p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-200">Crop Profiles</h3>
                        <button className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                          <span>Add Profile</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                      
                      {profiles.length === 0 ? (
                        <div className="text-center py-12">
                          <Leaf size={48} className="mx-auto text-gray-700 mb-3" />
                          <p className="text-gray-500 mb-4">No crop profiles yet</p>
                          <button className="btn-neon text-sm text-cyan-400">
                            Create Your First Profile
                          </button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {profiles.map(p => (
                            <CropProfileCard
                              key={p.id}
                              profile={p}
                              onEdit={() => {}}
                              onDelete={() => {}}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Verification Row */}
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <VerificationChart scores={scores} era5={era5} />
                  </div>
                  <div>
                    <PipelineCard status={pipeline} onRefresh={handleRefreshPipeline} />
                  </div>
                </div>
                
                {/* System Info */}
                <div className="glass-card p-4">
                  <h3 className="font-medium text-gray-200 mb-4">System Information</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Database size={20} className="text-cyan-400" />
                      <div>
                        <p className="text-sm text-gray-300">Database</p>
                        <p className="text-xs text-gray-500">{health?.database || 'Checking...'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Server size={20} className="text-emerald-400" />
                      <div>
                        <p className="text-sm text-gray-300">GCS Storage</p>
                        <p className="text-xs text-gray-500">{health?.gcs || 'Checking...'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Cpu size={20} className="text-amber-400" />
                      <div>
                        <p className="text-sm text-gray-300">ECMWF Connection</p>
                        <p className="text-xs text-gray-500">{health?.ecmwf || 'Checking...'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 bg-abyss/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                <Globe size={18} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-300">AIWFA</span>
                <span className="text-cyan-400 ml-1">GLOBAL</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">Documentation</a>
              <a href="#" className="hover:text-gray-300 transition-colors">API</a>
              <a href="#" className="hover:text-gray-300 transition-colors">About</a>
            </div>
            
            <p className="text-xs text-gray-600">
              © 2025 TUM Chair of Digital Agriculture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
