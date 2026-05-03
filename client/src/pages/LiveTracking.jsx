import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, AlertTriangle, CheckCircle, Leaf, Zap, Clock,
  Filter, ChevronDown, MapPin, TrendingUp, TrendingDown,
  Activity, Radio, Loader, Cpu,
} from 'lucide-react'
import { useVehicleMovement } from '../hooks/useVehicleMovement'
import { useAppStore } from '../store/useAppStore'
import { mockAlerts } from '../data/mockAlerts'

/* ── Status config ──────────────────────────────────────── */
const SM = {
  normal:  { dot:'bg-green-500', bg:'bg-green-50',  border:'border-green-100', text:'text-green-700',  label:'On Track' },
  warning: { dot:'bg-amber-500', bg:'bg-amber-50',  border:'border-amber-100', text:'text-amber-700',  label:'Warning'  },
  delayed: { dot:'bg-red-500',   bg:'bg-red-50',    border:'border-red-100',   text:'text-red-700',    label:'Delayed'  },
}
const RC = {
  high:   { bar:'bg-red-500',   txt:'text-red-600',   bg:'bg-red-50'   },
  medium: { bar:'bg-amber-500', txt:'text-amber-600', bg:'bg-amber-50' },
  low:    { bar:'bg-green-500', txt:'text-green-600', bg:'bg-green-50' },
}
const FILTERS = [
  { id:'all', label:'All' }, { id:'normal', label:'On Track' },
  { id:'warning', label:'Warning' }, { id:'delayed', label:'Delayed' },
]

/* ── Vehicle card ────────────────────────────────────────── */
function VehicleCard({ v, selected, onClick }) {
  const s = SM[v.status] || SM.normal
  const fuelColor = v.fuel > 50 ? 'bg-green-500' : v.fuel > 25 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <motion.button layout onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-gray-100 transition-all duration-150 border-l-2
        ${selected ? 'bg-blue-50 border-l-blue-600' : 'hover:bg-gray-50 border-l-transparent'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
          <span className="text-xs font-bold text-gray-900">{v.id}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500 font-mono text-[10px]">{v.plate}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.border} border ${s.text}`}>
          {s.label}
        </span>
      </div>

      <p className="text-sm font-semibold text-gray-800">{v.driver}</p>
      <p className="text-xs text-gray-500 mt-0.5 truncate mb-2">{v.route}</p>

      <div className="flex items-center gap-2.5 text-xs mb-2.5 flex-wrap">
        <span className="flex items-center gap-1 text-gray-600">
          <Activity size={10} className="text-gray-400" />
          <span className="font-bold text-gray-800">{v.speed}</span> km/h
        </span>
        <span className="text-gray-300">·</span>
        <span className="flex items-center gap-1 text-gray-600">
          <Clock size={10} className="text-gray-400" />
          <span className="font-bold text-gray-800">{v.eta}</span>
        </span>
        <span className="text-gray-300">·</span>
        <span className="flex items-center gap-1">
          <span className="text-sm leading-none">{v.weather?.emoji ?? '☀️'}</span>
          <span className="text-gray-500 text-[10px]">{v.weather?.temp ?? 30}°C</span>
        </span>
      </div>

      {v.delayMinutes > 0 && (
        <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 rounded px-2 py-0.5 mb-2 w-fit">
          +{v.delayMinutes} min delay
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400 w-6">Fuel</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div className={`h-full rounded-full ${fuelColor}`}
            initial={{ width:0 }} animate={{ width:`${v.fuel}%` }}
            transition={{ duration:0.6 }} />
        </div>
        <span className="text-[10px] font-semibold text-gray-500 w-7 text-right">{v.fuel}%</span>
      </div>
    </motion.button>
  )
}

/* ── Alert item ─────────────────────────────────────────── */
function AlertItem({ alert, index }) {
  const r = RC[alert.riskLevel] || RC.low
  return (
    <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-start gap-3 px-4 py-3 border-r border-gray-100 flex-shrink-0"
      style={{ width:300 }}>
      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${r.bar}`} />
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-gray-800">{alert.shipmentId}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${r.bg} ${r.txt}`}>
            {alert.riskLevel?.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{alert.issue}</p>
        <span className="text-[10px] text-gray-400 mt-1 block">{alert.time}</span>
      </div>
    </motion.div>
  )
}

function KPIItem({ icon: Icon, label, value, trend, trendUp, color = 'text-gray-900' }) {
  return (
    <div className="flex items-center gap-3 px-5 border-r border-gray-100 last:border-r-0 flex-shrink-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
        <Icon size={15} className="text-gray-500" />
      </div>
      <div>
        <div className={`text-lg font-bold leading-tight tabular-nums ${color}`}>{value}</div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500">{label}</span>
          {trend && (
            <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
              {trendUp ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}{trend}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────── */
export default function LiveTracking() {
  const { kpis, alerts: liveAlerts } = useAppStore()
  const { mapContainerRef, vehicles, loading, intelAlerts } = useVehicleMovement()

  const [filter,     setFilter]     = useState('all')
  const [selected,   setSelected]   = useState(null)
  const [showFilter, setShowFilter] = useState(false)

  const allAlerts = [...liveAlerts, ...mockAlerts].slice(0, 8)
  const filtered  = filter === 'all' ? vehicles : vehicles.filter(v => v.status === filter)
  const counts    = {
    total:   vehicles.length,
    delayed: vehicles.filter(v => v.status === 'delayed').length,
    warning: vehicles.filter(v => v.status === 'warning').length,
    normal:  vehicles.filter(v => v.status === 'normal').length,
  }
  const curFilter = FILTERS.find(f => f.id === filter)

  return (
    <div className="flex flex-col bg-white" style={{ height:'calc(100vh - 56px)' }}>

      {/* KPI row */}
      <div className="flex-shrink-0 flex items-center h-14 border-b border-gray-100 bg-white overflow-x-auto">
        <div className="flex items-center gap-2 px-5 border-r border-gray-100 h-full flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-gray-700">Live</span>
          <span className="text-xs text-gray-400">· GPS</span>
        </div>
        <div className="flex items-center h-full">
          <KPIItem icon={Truck}         label="Active Fleet"    value={counts.total} />
          <KPIItem icon={AlertTriangle} label="Delayed"         value={counts.delayed}                      color="text-red-600" />
          <KPIItem icon={CheckCircle}   label="On-Time Rate"    value={`${kpis.onTimeRate?.toFixed(1)}%`}   color="text-green-700" trend="+0.4%" trendUp />
          <KPIItem icon={Leaf}          label="CO₂ Today"       value={`${kpis.carbonToday?.toFixed(0)} kg`} />
          <KPIItem icon={Zap}           label="Fuel Efficiency" value={`${kpis.fuelEfficiency?.toFixed(0)}%`} color="text-blue-700" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT — Fleet list */}
        <div className="flex-shrink-0 flex flex-col border-r border-gray-100 bg-white overflow-hidden" style={{ width:284 }}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Fleet</h3>
              <p className="text-xs text-gray-500 mt-0.5">{filtered.length} of {vehicles.length}</p>
            </div>
            <div className="relative">
              <button onClick={() => setShowFilter(v => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <Filter size={11}/>{curFilter?.label}
                <ChevronDown size={10} className={`transition-transform ${showFilter ? 'rotate-180':''}`}/>
              </button>
              <AnimatePresence>
                {showFilter && (
                  <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, y:4 }} transition={{ duration:0.12 }}
                    className="absolute right-0 top-9 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                    {FILTERS.map(f => (
                      <button key={f.id} onClick={() => { setFilter(f.id); setShowFilter(false) }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors
                          ${filter === f.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                        {f.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Status summary */}
          <div className="grid grid-cols-3 border-b border-gray-100 flex-shrink-0">
            {[
              { label:'On Track', count:counts.normal,  color:'text-green-700', bg:'bg-green-50' },
              { label:'Warning',  count:counts.warning, color:'text-amber-700', bg:'bg-amber-50' },
              { label:'Delayed',  count:counts.delayed, color:'text-red-700',   bg:'bg-red-50'   },
            ].map(s => (
              <div key={s.label} className={`flex flex-col items-center py-2.5 ${s.bg} border-r border-gray-100 last:border-r-0`}>
                <span className={`text-base font-bold ${s.color}`}>{s.count}</span>
                <span className={`text-[10px] font-medium ${s.color} opacity-80`}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader size={20} className="text-blue-500 animate-spin"/>
                <p className="text-xs text-gray-500">Fetching road routes…</p>
                <p className="text-[10px] text-gray-400">via OSRM public API</p>
              </div>
            ) : (
              <AnimatePresence>
                {filtered.map(v => (
                  <VehicleCard key={v.id} v={v}
                    selected={selected === v.id}
                    onClick={() => setSelected(s => s === v.id ? null : v.id)} />
                ))}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center py-12 gap-2">
                    <Truck size={28} className="text-gray-200"/>
                    <p className="text-sm text-gray-500">No vehicles</p>
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* CENTER — Map (hook owns the div via mapContainerRef) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Map header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 h-11 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {[['bg-green-500','On Track'],['bg-amber-500','Warning'],['bg-red-500','Delayed']].map(([cls,lbl]) => (
                <div key={lbl} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${cls}`}/>{lbl}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={11} className="text-blue-600"/>
              <span className="font-medium text-gray-700">Jakarta Metro</span>
              <span className="text-gray-400">· OSRM routes · Open-Meteo weather</span>
            </div>
          </div>

          {/* Map div — hook attaches Leaflet here */}
          <div ref={mapContainerRef} className="flex-1 relative overflow-hidden bg-gray-50" />

          {/* Alert timeline */}
          <div className="flex-shrink-0 border-t border-gray-100 bg-white" style={{ height:116 }}>
            <div className="flex items-center justify-between px-5 pt-2.5 pb-1.5">
              <div className="flex items-center gap-2">
                <Radio size={12} className="text-red-500"/>
                <span className="text-xs font-semibold text-gray-700">Risk Alerts</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                  {allAlerts.filter(a => a.riskLevel === 'high').length} High
                </span>
              </div>
              <span className="text-[10px] text-gray-400">Scroll →</span>
            </div>
            <div className="flex overflow-x-auto pb-2 px-4" style={{ scrollbarWidth:'none' }}>
              {allAlerts.map((a, i) => <AlertItem key={a.id||i} alert={a} index={i}/>)}
            </div>
          </div>
        </div>

        {/* RIGHT — Intelligence panel */}
        <div className="flex-shrink-0 flex flex-col border-l border-gray-100 bg-white overflow-hidden" style={{ width:240 }}>
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-blue-600"/>
              <span className="text-xs font-bold text-gray-700 tracking-wide">INTELLIGENCE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {/* Intel alerts from traffic/weather */}
            {intelAlerts.map((msg, i) => (
              <div key={i} className="px-4 py-2.5 border-b border-gray-50 text-xs text-gray-700 leading-relaxed">
                {msg}
              </div>
            ))}

            {/* Weather card */}
            {vehicles[0]?.weather && (
              <div className="mx-3 my-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{vehicles[0].weather.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{vehicles[0].weather.label}</p>
                    <p className="text-[10px] text-gray-500">Jakarta Metro Area</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-gray-600">
                  <span>🌡️ {vehicles[0].weather.temp}°C</span>
                  <span>💨 {vehicles[0].weather.wind} km/h</span>
                  {vehicles[0].weather.delay > 0 && (
                    <span className="col-span-2 text-amber-700 font-semibold">
                      ⚠️ ETA impact: +{Math.round(vehicles[0].weather.delay * 100)}%
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Static eco tips */}
            {[
              { icon:'🌿', msg:'Eco-routing saved 4.2 kg CO₂ today' },
              { icon:'🔋', msg:'VH-006 running at peak fuel efficiency' },
              { icon:'📊', msg:'On-time rate trending +2.1% this week' },
            ].map((tip, i) => (
              <div key={i} className="px-4 py-2.5 border-b border-gray-50 flex items-start gap-2.5">
                <span className="text-sm flex-shrink-0">{tip.icon}</span>
                <p className="text-xs text-gray-600 leading-relaxed">{tip.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
