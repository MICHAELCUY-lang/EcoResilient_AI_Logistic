import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, AlertTriangle, CheckCircle, Leaf, Zap, Clock,
  Filter, ChevronDown, MapPin,
  TrendingUp, TrendingDown, Activity, Radio,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import RoadFollowingMap from '../components/map/RoadFollowingMap'
import { mockAlerts } from '../data/mockAlerts'

/* ─── helpers ─────────────────────────────────────────── */
const STATUS_MAP = {
  normal:  { color: '#16A34A', bg: 'bg-green-50',  border: 'border-green-100', text: 'text-green-700',  dot: 'bg-green-500', label: 'On Track'  },
  warning: { color: '#D97706', bg: 'bg-amber-50',  border: 'border-amber-100', text: 'text-amber-700',  dot: 'bg-amber-500', label: 'Warning'   },
  delayed: { color: '#DC2626', bg: 'bg-red-50',    border: 'border-red-100',   text: 'text-red-700',    dot: 'bg-red-500',   label: 'Delayed'   },
}

const RISK_CFG = {
  high:   { barColor: 'bg-red-500',   textColor: 'text-red-600',   bg: 'bg-red-50'   },
  medium: { barColor: 'bg-amber-500', textColor: 'text-amber-600', bg: 'bg-amber-50' },
  low:    { barColor: 'bg-green-500', textColor: 'text-green-600', bg: 'bg-green-50' },
}

const FILTER_OPTIONS = [
  { id: 'all',     label: 'All Vehicles' },
  { id: 'normal',  label: 'On Track' },
  { id: 'warning', label: 'Warning' },
  { id: 'delayed', label: 'Delayed' },
]

/* ─── Vehicle row card ─────────────────────────────────── */
function VehicleCard({ v, selected, onClick }) {
  const s = STATUS_MAP[v.status] || STATUS_MAP.normal
  const fuelColor = v.fuel > 50 ? 'bg-green-500' : v.fuel > 25 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <motion.button
      layout
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-gray-100 transition-all duration-150
        ${selected
          ? 'bg-blue-50 border-l-2 border-l-blue-600'
          : 'hover:bg-gray-50 border-l-2 border-l-transparent'
        }`}
    >
      {/* Row 1: ID + status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
          <span className="text-xs font-bold text-gray-900 tracking-wide">{v.id}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500 font-mono">{v.plate}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.border} border ${s.text}`}>
          {s.label}
        </span>
      </div>

      {/* Row 2: Driver + route */}
      <div className="mb-2.5">
        <p className="text-sm font-semibold text-gray-800 leading-tight">{v.driver}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{v.route}</p>
      </div>

      {/* Row 3: Speed / ETA / CO2 */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2.5">
        <span className="flex items-center gap-1">
          <Activity size={10} className="text-gray-400" />
          <span className="font-semibold text-gray-700">{Math.round(v.speed)}</span> km/h
        </span>
        <span className="text-gray-300">·</span>
        <span className="flex items-center gap-1">
          <Clock size={10} className="text-gray-400" />
          ETA <span className="font-semibold text-gray-700">{v.eta}</span>
        </span>
        <span className="text-gray-300">·</span>
        <span className="flex items-center gap-1">
          <Leaf size={10} className="text-green-500" />
          <span className="font-semibold text-gray-700">{v.carbon.toFixed(1)}</span> kg
        </span>
      </div>

      {/* Row 4: Fuel bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400 w-6 flex-shrink-0">Fuel</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${fuelColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${v.fuel}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[10px] font-semibold text-gray-500 w-7 text-right flex-shrink-0">{v.fuel}%</span>
      </div>
    </motion.button>
  )
}

/* ─── Alert row ────────────────────────────────────────── */
function AlertItem({ alert, index }) {
  const risk = RISK_CFG[alert.riskLevel] || RISK_CFG.low
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 px-4 py-3 border-r border-gray-100 flex-shrink-0"
      style={{ width: 300 }}
    >
      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${risk.barColor}`} />
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-gray-800">{alert.shipmentId}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${risk.bg} ${risk.textColor}`}>
            {alert.riskLevel.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{alert.issue}</p>
        <span className="text-[10px] text-gray-400 mt-1 block">{alert.time}</span>
      </div>
    </motion.div>
  )
}

/* ─── KPI card ─────────────────────────────────────────── */
function KPIItem({ icon: Icon, label, value, trend, trendUp, color = 'text-gray-900' }) {
  return (
    <div className="flex items-center gap-3 px-5 border-r border-gray-100 last:border-r-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-gray-500" />
      </div>
      <div>
        <div className={`text-lg font-bold leading-tight tabular-nums ${color}`}>{value}</div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500">{label}</span>
          {trend && (
            <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
              {trendUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ────────────────────────────────────────── */
export default function LiveTracking() {
  const { vehicles, kpis, alerts: liveAlerts } = useAppStore()
  const [filter, setFilter]     = useState('all')
  const [selected, setSelected] = useState(null)
  const [showFilter, setShowFilter] = useState(false)

  const allAlerts = [...liveAlerts, ...mockAlerts].slice(0, 8)

  const filtered = filter === 'all'
    ? vehicles
    : vehicles.filter(v => v.status === filter)

  const counts = {
    total:   vehicles.length,
    delayed: vehicles.filter(v => v.status === 'delayed').length,
    warning: vehicles.filter(v => v.status === 'warning').length,
    normal:  vehicles.filter(v => v.status === 'normal').length,
  }

  const currentFilter = FILTER_OPTIONS.find(f => f.id === filter)

  return (
    <div className="flex flex-col bg-white" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── KPI Row ─────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center h-14 border-b border-gray-100 bg-white">
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-5 border-r border-gray-100 h-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-gray-700">Live</span>
          <span className="text-xs text-gray-400">· 3s</span>
        </div>

        <div className="flex items-center flex-1 h-full overflow-x-auto">
          <KPIItem icon={Truck}         label="Active Vehicles"  value={counts.total}                          />
          <KPIItem icon={AlertTriangle} label="Delayed"          value={counts.delayed} color="text-red-600"   trendUp={false} />
          <KPIItem icon={CheckCircle}   label="On-Time Rate"     value={`${kpis.onTimeRate.toFixed(1)}%`}       color="text-green-700" trend="+0.4%" trendUp />
          <KPIItem icon={Leaf}          label="CO₂ Today"        value={`${kpis.carbonToday.toFixed(0)} kg`}    />
          <KPIItem icon={Zap}           label="Fuel Efficiency"  value={`${kpis.fuelEfficiency.toFixed(0)}%`}   color="text-blue-700" />
        </div>
      </div>

      {/* ── Main body ──────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT — Vehicle list */}
        <div className="flex-shrink-0 flex flex-col border-r border-gray-100 bg-white overflow-hidden"
          style={{ width: 284 }}>

          {/* List header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Fleet</h3>
              <p className="text-xs text-gray-500 mt-0.5">{filtered.length} of {vehicles.length} vehicles</p>
            </div>

            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilter(v => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600
                  px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Filter size={11} />
                {currentFilter.label}
                <ChevronDown size={10} className={`transition-transform ${showFilter ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-9 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden"
                  >
                    {FILTER_OPTIONS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => { setFilter(f.id); setShowFilter(false) }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors
                          ${filter === f.id
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Status summary */}
          <div className="grid grid-cols-3 gap-0 border-b border-gray-100 flex-shrink-0">
            {[
              { label: 'On Track', count: counts.normal,  color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Warning',  count: counts.warning, color: 'text-amber-700', bg: 'bg-amber-50' },
              { label: 'Delayed',  count: counts.delayed, color: 'text-red-700',   bg: 'bg-red-50'   },
            ].map(s => (
              <div key={s.label} className={`flex flex-col items-center py-2.5 ${s.bg} border-r border-gray-100 last:border-r-0`}>
                <span className={`text-base font-bold ${s.color}`}>{s.count}</span>
                <span className={`text-[10px] font-medium ${s.color} opacity-80`}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Vehicle list */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filtered.map(v => (
                <VehicleCard
                  key={v.id}
                  v={v}
                  selected={selected === v.id}
                  onClick={() => setSelected(selected === v.id ? null : v.id)}
                />
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Truck size={28} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-500 font-medium">No vehicles</p>
                <p className="text-xs text-gray-400 mt-1">Try a different filter</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Map */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Map header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 h-11 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                On Track
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Warning
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Delayed
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={11} className="text-blue-600" />
              <span className="font-medium text-gray-700">Jakarta Metro Area</span>
              <span className="text-gray-400">· OpenStreetMap</span>
            </div>
          </div>

          {/* Map itself — trucks follow real OSRM road routes */}
          <div className="flex-1 relative overflow-hidden bg-gray-50">
            <RoadFollowingMap height="100%" />
          </div>

          {/* ── Bottom alert timeline ───────────────────── */}
          <div className="flex-shrink-0 border-t border-gray-100 bg-white" style={{ height: 120 }}>
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <Radio size={12} className="text-red-500" />
                <span className="text-xs font-semibold text-gray-700">Risk Alerts</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                  {allAlerts.filter(a => a.riskLevel === 'high').length} High
                </span>
              </div>
              <span className="text-[10px] text-gray-400">Scroll to see all →</span>
            </div>

            <div className="flex overflow-x-auto pb-3 px-4 gap-0" style={{ scrollbarWidth: 'none' }}>
              {allAlerts.map((alert, i) => (
                <AlertItem key={alert.id || i} alert={alert} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
