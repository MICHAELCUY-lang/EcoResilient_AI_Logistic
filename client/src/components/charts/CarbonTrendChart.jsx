import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { carbonTrendData } from '../../data/mockShipments'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-surface-border rounded-xl px-3.5 py-2.5 shadow-card text-xs">
        <p className="font-semibold text-content-primary mb-1">{label}</p>
        {payload.map(p => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-content-secondary">{p.name}:</span>
            <span className="font-semibold text-content-primary">{p.value} kg</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function CarbonTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={carbonTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16A34A" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="carbon"
          name="CO₂ Actual"
          stroke="#2563EB"
          strokeWidth={2}
          fill="url(#carbonGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#2563EB' }}
        />
        <Area
          type="monotone"
          dataKey="target"
          name="Target"
          stroke="#16A34A"
          strokeWidth={1.5}
          fill="url(#targetGrad)"
          dot={false}
          strokeDasharray="5 3"
          activeDot={{ r: 3, fill: '#16A34A' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
