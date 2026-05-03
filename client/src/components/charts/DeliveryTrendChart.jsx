import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { deliveryTrendData } from '../../data/mockShipments'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-surface-border rounded-xl px-3.5 py-2.5 shadow-card text-xs">
        <p className="font-semibold text-content-primary mb-1">{label}</p>
        {payload.map(p => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-content-secondary capitalize">{p.name}:</span>
            <span className="font-semibold text-content-primary">{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DeliveryTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={deliveryTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
        <Line
          type="monotone"
          dataKey="onTime"
          name="On Time"
          stroke="#16A34A"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#16A34A' }}
        />
        <Line
          type="monotone"
          dataKey="delayed"
          name="Delayed"
          stroke="#EF4444"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#EF4444' }}
          strokeDasharray="4 2"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
