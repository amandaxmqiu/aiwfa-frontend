// AIWFA - AI Weather Forecasts for Agriculture
// Main Application Component

import React, { useState, useEffect } from 'react';
import { Globe, Thermometer, CloudRain, AlertTriangle, TrendingUp, Calendar, Menu, X, User, LogIn, LogOut, Wheat, Sun, Droplets, Wind, CheckCircle, XCircle, RefreshCw, Filter } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Line } from 'recharts';
import { api, getERA5Availability, formatDate } from './services/api';
import type { RiskHotspot, HealthStatus, PipelineStatus, VerificationScore, RiskAlert, CropProfile } from './types';

const SEVERITY_COLORS = {
  LOW: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400' },
  MODERATE: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400' },
  HIGH: { bg: 'bg-rose-500/20', border: 'border-rose-500', text: 'text-rose-400' },
  EXTREME: { bg: 'bg-red-600/30', border: 'border-red-500', text: 'text-red-400' },
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  HEAT: <Sun className="w-4 h-4" />, COLD: <Thermometer className="w-4 h-4" />, FROST: <Thermometer className="w-4 h-4" />,
  WET: <CloudRain className="w-4 h-4" />, DRY: <Droplets className="w-4 h-4" />, STORM: <Wind className="w-4 h-4" />,
};

const WorldMap: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 1000 500" className={className} preserveAspectRatio="xMidYMid meet">
    <defs><linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" /></linearGradient></defs>
    <g fill="url(#landGrad)" stroke="#334155" strokeWidth="0.5">
      <path d="M150,80 L280,80 L300,120 L320,150 L280,200 L220,220 L180,200 L140,180 L120,140 L130,100 Z" />
      <path d="M220,250 L280,240 L300,300 L280,380 L240,420 L200,380 L180,320 L200,280 Z" />
      <path d="M450,100 L520,90 L540,120 L520,160 L480,180 L440,160 L430,130 Z" />
      <path d="M450,200 L520,180 L560,220 L550,320 L500,380 L450,360 L420,300 L430,240 Z" />
      <path d="M540,80 L700,60 L800,100 L820,180 L780,220 L700,200 L620,180 L580,140 L540,120 Z" />
      <path d="M750,320 L830,300 L870,340 L850,400 L780,410 L740,380 L740,340 Z" />
    </g>
    <g stroke="#334155" strokeWidth="0.3" strokeDasharray="4,4" opacity="0.3">
      {[0,100,200,300,400].map(y=><line key={y} x1="0" y1={y+50} x2="1000" y2={y+50}/>)}
      {[0,200,400,600,800].map(x=><line key={x} x1={x+100} y1="0" x2={x+100} y2="500"/>)}
    </g>
  </svg>
);

const RiskMarker: React.FC<{hotspot:RiskHotspot;onClick:(h:RiskHotspot)=>void;isSelected:boolean}> = ({hotspot,onClick,isSelected}) => {
  const colors = SEVERITY_COLORS[hotspot.severity];
  const x = ((hotspot.lon+180)/360)*100, y = ((90-hotspot.lat)/180)*100;
  return (
    <div className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 hover:z-50" style={{left:`${x}%`,top:`${y}%`}} onClick={()=>onClick(hotspot)}>
      <div className={`absolute inset-0 ${colors.bg} rounded-full animate-ping`} style={{animationDuration:'2s'}}/>
      <div className={`relative w-8 h-8 ${colors.bg} ${colors.border} border-2 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform`}>
        <span className={colors.text}>{hotspot.variable==='t2m'?<Thermometer className="w-4 h-4"/>:<CloudRain className="w-4 h-4"/>}</span>
      </div>
      <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-900/95 backdrop-blur border border-emerald-500/30 rounded-lg p-3 min-w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isSelected?'opacity-100':''}`}>
        <div className="flex items-center gap-2 mb-1"><span className={`px-2 py-0.5 rounded text-xs ${colors.bg} ${colors.text}`}>{hotspot.severity}</span><span className="text-gray-400 text-xs">{hotspot.event_type}</span></div>
        <div className="font-semibold text-white">{hotspot.region}, {hotspot.country}</div>
        <div className="text-gray-400 text-sm">{hotspot.variable==='t2m'?`${hotspot.value}°C`:`${hotspot.value}mm`} • {hotspot.probability}%</div>
      </div>
    </div>
  );
};

const StatsCard: React.FC<{title:string;value:string|number;subtitle?:string;icon:React.ReactNode;color:'neon'|'cyan'|'amber'|'rose'}> = ({title,value,subtitle,icon,color}) => {
  const cls = {neon:'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',cyan:'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',amber:'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',rose:'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400'};
  return (<div className={`glass-card p-4 bg-gradient-to-br ${cls[color]} border`}><div className="flex justify-between items-start mb-2"><span className="text-gray-400 text-xs font-mono uppercase">{title}</span><span className={cls[color].split(' ').pop()}>{icon}</span></div><div className="text-2xl font-bold text-white mb-1">{value}</div>{subtitle&&<div className="text-gray-400 text-xs">{subtitle}</div>}</div>);
};

const AlertList: React.FC<{alerts:RiskAlert[];onDismiss:(id:string)=>void}> = ({alerts,onDismiss}) => {
  if(!alerts.length) return <div className="glass-card p-6 text-center"><CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3"/><p className="text-gray-400">No active alerts</p></div>;
  return (<div className="space-y-3">{alerts.map(a=>{const c=SEVERITY_COLORS[a.severity];return(<div key={a.id} className={`glass-card p-4 ${c.border} border-l-4`}><div className="flex justify-between items-start"><div className="flex items-center gap-2 mb-2"><span className={c.text}>{EVENT_ICONS[a.event_type]}</span><span className={`text-sm font-medium ${c.text}`}>{a.event_type}</span><span className="text-gray-400 text-xs">• {a.location_name}</span></div><button onClick={()=>onDismiss(a.id)} className="text-gray-400 hover:text-white text-xs">Dismiss</button></div><p className="text-gray-300 text-sm">{a.action_recommended}</p><div className="flex gap-4 mt-2 text-xs text-gray-400"><span>Confidence: {a.confidence}%</span><span>Date: {formatDate(a.forecast_date)}</span></div></div>);})}</div>);
};

const VerificationChart: React.FC<{scores:VerificationScore[];era5:{latest_date:string;delay_days:number}}> = ({scores,era5}) => {
  const data = scores.slice(0,10).reverse().map(s=>({date:formatDate(s.date),rmse:s.t2m_rmse,csi:s.heat_event_csi}));
  return (<div className="glass-card p-6"><div className="flex justify-between items-center mb-4"><div><h3 className="text-lg font-semibold text-white">Verification Scores</h3><p className="text-gray-400 text-sm">ERA5 comparison (last 10 days)</p></div><div className="text-right"><div className="text-xs text-gray-400">ERA5 Latest</div><div className="font-mono text-emerald-400">{era5.latest_date}</div><div className="text-xs text-amber-400">~{era5.delay_days} day delay</div></div></div><div className="h-48"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="rmseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#334155"/><XAxis dataKey="date" tick={{fill:'#94a3b8',fontSize:10}}/><YAxis tick={{fill:'#94a3b8',fontSize:10}}/><Tooltip contentStyle={{background:'rgba(17,24,39,0.95)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'8px'}}/><Area type="monotone" dataKey="rmse" stroke="#10b981" fill="url(#rmseGrad)" name="RMSE (°C)"/><Line type="monotone" dataKey="csi" stroke="#f59e0b" strokeWidth={2} dot={{fill:'#f59e0b',r:3}} name="Heat CSI"/></AreaChart></ResponsiveContainer></div><div className="grid grid-cols-3 gap-4 mt-4"><div className="text-center"><div className="text-2xl font-bold text-emerald-400">{scores[0]?.t2m_rmse?.toFixed(2)||'--'}°C</div><div className="text-xs text-gray-400">Avg RMSE</div></div><div className="text-center"><div className="text-2xl font-bold text-cyan-400">{scores[0]?.heat_event_csi?.toFixed(2)||'--'}</div><div className="text-xs text-gray-400">Heat CSI</div></div><div className="text-center"><div className="text-2xl font-bold text-amber-400">{scores[0]?.tp_csi?.toFixed(2)||'--'}</div><div className="text-xs text-gray-400">Precip CSI</div></div></div></div>);
};

const PipelineCard: React.FC<{status:PipelineStatus|null;onRefresh:()=>void}> = ({status,onRefresh}) => {
  if(!status) return null;
  return (<div className="glass-card p-4"><div className="flex justify-between items-center mb-3"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full animate-pulse ${status.status==='healthy'?'bg-emerald-400':'bg-amber-400'}`}/><span className="font-mono text-sm text-white">Pipeline</span></div><button onClick={onRefresh} className="text-gray-400 hover:text-emerald-400"><RefreshCw className="w-4 h-4"/></button></div><div className="space-y-2">{status.steps.slice(0,4).map((s,i)=>(<div key={i} className="flex items-center gap-2 text-xs">{s.status==='completed'?<CheckCircle className="w-3.5 h-3.5 text-emerald-400"/>:<XCircle className="w-3.5 h-3.5 text-rose-400"/>}<span className="text-gray-400">{s.name}</span></div>))}</div><div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400"><div className="flex justify-between"><span>Next fetch:</span><span className="text-emerald-400 font-mono">{new Date(status.next_scheduled_fetch).toLocaleTimeString()}</span></div></div></div>);
};

const App: React.FC = () => {
  const [view,setView] = useState<'landing'|'dashboard'>('landing');
  const [auth,setAuth] = useState(false);
  const [menuOpen,setMenuOpen] = useState(false);
  const [varFilter,setVarFilter] = useState<'t2m'|'tp'|'all'>('all');
  const [selected,setSelected] = useState<RiskHotspot|null>(null);
  const [health,setHealth] = useState<HealthStatus|null>(null);
  const [pipeline,setPipeline] = useState<PipelineStatus|null>(null);
  const [risks,setRisks] = useState<RiskHotspot[]>([]);
  const [alerts,setAlerts] = useState<RiskAlert[]>([]);
  const [scores,setScores] = useState<VerificationScore[]>([]);
  const [profiles,setProfiles] = useState<CropProfile[]>([]);
  const era5 = getERA5Availability();

  useEffect(()=>{Promise.all([api.getHealth(),api.getPipelineStatus(),api.getGlobalRiskHotspots(),api.getAlerts(),api.getVerificationScores(10)]).then(([h,p,r,a,s])=>{setHealth(h);setPipeline(p);setRisks(r);setAlerts(a);setScores(s);});},[]);
  useEffect(()=>{if(auth)api.getProfiles().then(setProfiles);},[auth]);

  const filtered = varFilter==='all'?risks:risks.filter(r=>r.variable===varFilter);
  const tempCt = risks.filter(r=>r.variable==='t2m').length;
  const precipCt = risks.filter(r=>r.variable==='tp').length;
  const highCt = risks.filter(r=>r.severity==='HIGH'||r.severity==='EXTREME').length;

  return (
    <div className="min-h-screen font-body">
      <div className="noise-overlay"/><div className="gradient-mesh"/>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-0 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon to-cyan flex items-center justify-center"><Globe className="w-6 h-6 text-void"/></div><div><div className="font-display font-bold text-white text-lg">AIWFA</div><div className="text-xs text-gray-400 -mt-1">Global</div></div></div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={()=>setView('landing')} className={`text-sm ${view==='landing'?'text-neon':'text-gray-400 hover:text-white'}`}>Global Map</button>
            <button onClick={()=>setView('dashboard')} className={`text-sm ${view==='dashboard'?'text-neon':'text-gray-400 hover:text-white'}`}>Dashboard</button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-void/50 border border-gray-700"><div className={`w-2 h-2 rounded-full animate-pulse ${health?.status==='healthy'?'bg-emerald-400':'bg-amber-400'}`}/><span className="text-xs font-mono text-gray-400">{health?.status||'...'}</span></div>
          </div>
          <div className="flex items-center gap-3">
            {auth?<button onClick={()=>{setAuth(false);api.logout();}} className="btn-secondary py-2 px-4 text-sm"><LogOut className="w-4 h-4"/></button>:<button onClick={()=>{setAuth(true);setView('dashboard');}} className="btn-primary py-2 px-4 text-sm"><LogIn className="w-4 h-4"/><span className="hidden sm:inline ml-2">Sign In</span></button>}
            <button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden text-gray-400">{menuOpen?<X className="w-6 h-6"/>:<Menu className="w-6 h-6"/>}</button>
          </div>
        </div>
        {menuOpen&&<div className="md:hidden border-t border-gray-700 p-4 space-y-2"><button onClick={()=>{setView('landing');setMenuOpen(false);}} className={`block w-full text-left px-4 py-2 rounded-lg ${view==='landing'?'bg-neon/20 text-neon':'text-gray-400'}`}>Global Map</button><button onClick={()=>{setView('dashboard');setMenuOpen(false);}} className={`block w-full text-left px-4 py-2 rounded-lg ${view==='dashboard'?'bg-neon/20 text-neon':'text-gray-400'}`}>Dashboard</button></div>}
      </nav>

      <main className="pt-16">
        {view==='landing'?(<>
          <section className="relative h-[70vh] min-h-[500px]">
            <div className="absolute inset-0 bg-abyss overflow-hidden"><WorldMap className="w-full h-full opacity-60"/><div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent"/><div className="absolute inset-0">{filtered.map(h=><RiskMarker key={h.id} hotspot={h} onClick={setSelected} isSelected={selected?.id===h.id}/>)}</div></div>
            <div className="absolute top-4 left-4 glass-card p-1 flex gap-1"><button onClick={()=>setVarFilter('all')} className={`px-3 py-1.5 rounded-lg text-sm ${varFilter==='all'?'bg-neon/20 text-neon':'text-gray-400'}`}>All ({risks.length})</button><button onClick={()=>setVarFilter('t2m')} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${varFilter==='t2m'?'bg-rose-500/20 text-rose-400':'text-gray-400'}`}><Thermometer className="w-3.5 h-3.5"/>Temp ({tempCt})</button><button onClick={()=>setVarFilter('tp')} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${varFilter==='tp'?'bg-cyan-500/20 text-cyan-400':'text-gray-400'}`}><CloudRain className="w-3.5 h-3.5"/>Precip ({precipCt})</button></div>
            <div className="absolute top-4 right-4 glass-card p-3"><div className="text-xs text-gray-400 mb-2 font-mono">SEVERITY</div><div className="flex gap-3">{(['LOW','MODERATE','HIGH','EXTREME'] as const).map(s=><div key={s} className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-full ${SEVERITY_COLORS[s].bg} ${SEVERITY_COLORS[s].border} border`}/><span className="text-xs text-gray-400">{s}</span></div>)}</div></div>
            {selected&&<div className="absolute top-20 right-4 w-80 glass-card p-6"><div className="flex justify-between items-start mb-4"><div><span className={`px-2 py-0.5 rounded text-xs ${SEVERITY_COLORS[selected.severity].bg} ${SEVERITY_COLORS[selected.severity].text}`}>{selected.severity}</span><h3 className="text-xl font-bold text-white mt-1">{selected.region}</h3><p className="text-gray-400 text-sm">{selected.country}</p></div><button onClick={()=>setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button></div><div className="grid grid-cols-2 gap-4 mb-4"><div className="bg-void/50 rounded-lg p-3"><div className="text-gray-400 text-xs">Value</div><div className={`text-2xl font-bold ${SEVERITY_COLORS[selected.severity].text}`}>{selected.value}{selected.variable==='t2m'?'°C':'mm'}</div></div><div className="bg-void/50 rounded-lg p-3"><div className="text-gray-400 text-xs">Probability</div><div className="text-2xl font-bold text-white">{selected.probability}%</div></div></div><p className="text-gray-300 text-sm">{selected.description}</p></div>}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-void to-transparent"><div className="max-w-7xl mx-auto"><h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">Global Agricultural <span className="text-gradient">Weather Intelligence</span></h1><p className="text-gray-400 text-lg max-w-2xl">Real-time risk monitoring powered by ECMWF IFS + AIFS ensemble forecasts.</p></div></div>
          </section>
          <section className="py-12 px-4 max-w-7xl mx-auto"><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><StatsCard title="Active Alerts" value={risks.length} subtitle="Worldwide" icon={<AlertTriangle className="w-5 h-5"/>} color="amber"/><StatsCard title="High/Extreme" value={highCt} subtitle="Require attention" icon={<AlertTriangle className="w-5 h-5"/>} color="rose"/><StatsCard title="Forecast Range" value="14 days" subtitle="IFS: 240h • AIFS: 360h" icon={<Calendar className="w-5 h-5"/>} color="cyan"/><StatsCard title="Heat CSI" value={(scores[0]?.heat_event_csi||0.58).toFixed(2)} subtitle="Model skill" icon={<TrendingUp className="w-5 h-5"/>} color="neon"/></div></section>
          <section className="py-12 px-4 max-w-7xl mx-auto"><div className="grid md:grid-cols-2 gap-8"><VerificationChart scores={scores} era5={era5}/><div className="space-y-4"><PipelineCard status={pipeline} onRefresh={()=>api.getPipelineStatus().then(setPipeline)}/><div className="glass-card p-4"><h3 className="font-semibold text-white mb-3">High-Priority Alerts</h3><div className="space-y-2">{risks.filter(r=>r.severity==='HIGH'||r.severity==='EXTREME').slice(0,3).map(r=><div key={r.id} onClick={()=>setSelected(r)} className="flex items-center gap-3 p-2 rounded-lg bg-void/50 hover:bg-gray-800 cursor-pointer"><span className={SEVERITY_COLORS[r.severity].text}>{EVENT_ICONS[r.event_type]}</span><div className="flex-1"><div className="text-sm text-white">{r.region}</div><div className="text-xs text-gray-400">{r.country}</div></div><span className={`text-xs font-mono ${SEVERITY_COLORS[r.severity].text}`}>{r.probability}%</span></div>)}</div></div></div></div></section>
          <section className="py-16 px-4 text-center"><h2 className="text-3xl font-bold text-white mb-4">Get Personalized Crop Alerts</h2><p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">Create custom crop profiles with GDD tracking and receive targeted weather alerts.</p><div className="flex justify-center gap-4"><button onClick={()=>{setAuth(true);setView('dashboard');}} className="btn-primary text-lg px-8 py-3">Get Started Free</button><button className="btn-secondary text-lg px-8 py-3">Learn More</button></div></section>
        </>):(
          <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"><div className="mb-6"><h1 className="text-2xl font-bold text-white">My Dashboard</h1><p className="text-gray-400">Personalized crop monitoring</p></div><div className="grid lg:grid-cols-3 gap-6"><div className="lg:col-span-2 space-y-6"><div className="glass-card p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold text-white">My Alerts</h2><button className="text-sm text-neon flex items-center gap-1"><Filter className="w-4 h-4"/>Filter</button></div><AlertList alerts={alerts} onDismiss={id=>{api.dismissAlert(id);setAlerts(a=>a.filter(x=>x.id!==id));}}/></div><div className="glass-card p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold text-white">Crop Profiles</h2><button className="btn-primary py-2 px-4 text-sm">+ Add Profile</button></div>{profiles.length===0?<div className="text-center py-8"><Wheat className="w-12 h-12 text-gray-500 mx-auto mb-3"/><p className="text-gray-400">No profiles yet</p></div>:<div className="space-y-4">{profiles.map(p=><div key={p.id} className="bg-void/50 rounded-xl p-4 border border-gray-700"><div className="flex justify-between items-start mb-3"><div><h3 className="font-medium text-white">{p.name}</h3><p className="text-gray-400 text-sm capitalize">{p.crop_type.replace('_',' ')}</p></div><span className="px-2 py-1 rounded-full bg-neon/20 text-neon text-xs">{p.current_stage}</span></div><div className="mb-3"><div className="flex justify-between text-xs text-gray-400 mb-1"><span>GDD Progress</span><span>{p.current_gdd} / {Object.values(p.gdd_targets).pop()} GDD</span></div><div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-neon to-cyan rounded-full" style={{width:`${Math.min(100,(p.current_gdd/(Object.values(p.gdd_targets).pop()||1400))*100)}%`}}/></div></div><div className="flex gap-4 text-xs text-gray-400"><span><Sun className="w-3.5 h-3.5 inline text-rose-400"/> Heat: {p.thresholds.heat_stress}°C</span><span><Thermometer className="w-3.5 h-3.5 inline text-cyan-400"/> Cold: {p.thresholds.cold_stress}°C</span></div></div>)}</div>}</div></div><div className="space-y-6"><div className="glass-card p-4"><h3 className="font-semibold text-white mb-3">Model Performance</h3><div className="text-xs text-amber-400 mb-2">ERA5 latest: {era5.latest_date} ({era5.delay_days}-day delay)</div><div className="grid grid-cols-2 gap-3"><div className="bg-void/50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-neon">{scores[0]?.t2m_rmse?.toFixed(2)||'--'}</div><div className="text-xs text-gray-400">RMSE (°C)</div></div><div className="bg-void/50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-cyan">{scores[0]?.heat_event_csi?.toFixed(2)||'--'}</div><div className="text-xs text-gray-400">Heat CSI</div></div></div></div><PipelineCard status={pipeline} onRefresh={()=>api.getPipelineStatus().then(setPipeline)}/></div></div></div>
        )}
      </main>
      <footer className="border-t border-gray-700 py-8 px-4"><div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4"><div className="flex items-center gap-2"><Globe className="w-5 h-5 text-neon"/><span className="font-semibold text-white">AIWFA</span><span className="text-gray-400 text-sm">• AI Weather Forecasts for Agriculture</span></div><div className="text-sm text-gray-400">Data: ECMWF Open Data • TUM Digital Agriculture • v5.0.0</div></div></footer>
    </div>
  );
};

export default App;
