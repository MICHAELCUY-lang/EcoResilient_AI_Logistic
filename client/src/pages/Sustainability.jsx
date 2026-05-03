import { motion } from 'framer-motion'
import {
  Leaf, Fuel, Route, TreePine, TrendingDown, Award
} from 'lucide-react'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'
import { useAppStore } from '../store/useAppStore'
import PageWrapper from '../components/layout/PageWrapper'
import ChartCard from '../components/ui/ChartCard'
import { monthlyCarbonData, fuelEfficiencyData } from '../data/mockAlerts'
import { getSustainabilityMetrics } from '../utils/carbonCalc'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-surface-border rounded-xl px-3.5 py-2.5 shadow-card text-xs">
        <p className="font-semibold text-content-primary mb-1">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-content-secondary">{p.name}:</span>
            <span className="font-semibold text-content-primary">{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const ecoActions = [
  { emoji: '🛣️', title: 'Activate Eco Routing', desc: 'Reroute 8 vehicles to avoid congestion — saves 12 kg CO₂ today', impact: 'High', color: 'eco-green' },
  { emoji: '⏰', title: 'Off-Peak Scheduling', desc: 'Shift 15% of deliveries to 05:00–07:00 window — reduces emissions 18%', impact: 'High', color: 'eco-green' },
  { emoji: '⚡', title: 'Electric Fleet Pilot', desc: 'Replace 2 motorcycles with EV — saves 340 kg CO₂/month', impact: 'Medium', color: 'eco-amber' },
  { emoji: '📦', title: 'Load Consolidation', desc: 'Merge 3 partial loads into 1 truck — fuel reduction 22%', impact: 'Medium', color: 'eco-amber' },
]

export default function Sustainability() {
  const { vehicles } = useAppStore()
  const metrics = getSustainabilityMetrics(vehicles)

  const heroStats = [
    { label: 'CO₂ Saved vs Baseline', value: `${metrics.carbonSaved.toFixed(1)} kg`, icon: Leaf, color: 'gradient-green', textColor: 'text-eco-green' },
    { label: 'Fuel Saved This Month', value: `${metrics.fuelSaved} L`, icon: Fuel, color: 'gradient-blue', textColor: 'text-brand-600' },
    { label: 'Eco Route Adoption', value: `${metrics.ecoRoutePct}%`, icon: Route, color: 'gradient-green', textColor: 'text-eco-green' },
    { label: 'Trees Equivalent', value: `${metrics.treesEquivalent} trees`, icon: TreePine, color: 'gradient-green', textColor: 'text-eco-green' },
  ]

  return (
    <PageWrapper>
      <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl gradient-green flex items-center justify-center flex-shrink-0">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-content-primary">Sustainability Analytics</h2>
            <p className="text-sm text-content-secondary mt-0.5">
              Carbon footprint tracking · Eco-efficiency metrics · Environmental impact reporting
            </p>
          </div>
        </div>

        {/* Impact target badge */}
        <div className="flex items-center gap-3 p-4 bg-eco-green-light rounded-2xl border border-eco-green/20">
          <Award size={18} className="text-eco-green" />
          <div>
            <span className="text-sm font-semibold text-eco-green">2025 Carbon Reduction Target: 16%</span>
            <span className="text-xs text-eco-green/70 ml-2">· On track ✓</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-eco-green">
            <TrendingDown size={14} />
            23% YTD reduction
          </div>
        </div>

        {/* Hero stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {heroStats.map(({ label, value, icon: Icon, color, textColor }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card p-5"
            >
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon size={17} className="text-white" />
              </div>
              <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
              <div className="text-xs text-content-secondary mt-1 leading-tight">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard
            title="Monthly Carbon Reduction"
            subtitle="CO₂ actual vs CO₂ saved (kg) — 7 month trend"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyCarbonData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="carbon" name="Total CO₂" fill="#DBEAFE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saved" name="CO₂ Saved" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Fuel Efficiency Trend"
            subtitle="Fleet efficiency % vs target (last 7 months)"
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={fuelEfficiencyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={80} stroke="#F59E0B" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: 'Target', position: 'insideRight', fontSize: 10, fill: '#F59E0B' }} />
                <Area type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#16A34A" strokeWidth={2} fill="url(#effGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Eco actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <h3 className="text-sm font-semibold text-content-primary mb-4">Recommended Eco Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ecoActions.map((action, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <span className="text-xl flex-shrink-0">{action.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-content-primary">{action.title}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      action.impact === 'High' ? 'bg-eco-green-light text-eco-green' : 'bg-eco-amber-light text-eco-amber'
                    }`}>{action.impact}</span>
                  </div>
                  <p className="text-xs text-content-secondary leading-relaxed">{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
