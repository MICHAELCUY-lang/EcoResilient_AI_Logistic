import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { shipmentStatusData } from '../../data/mockShipments'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0]
    return (
      <div className="bg-white border border-surface-border rounded-xl px-3.5 py-2 shadow-card text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.payload.color }} />
          <span className="font-semibold text-content-primary">{d.name}</span>
        </div>
        <p className="text-content-secondary mt-0.5">{d.value}% of shipments</p>
      </div>
    )
  }
  return null
}

export default function ShipmentDonutChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={shipmentStatusData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          {shipmentStatusData.map((entry, index) => (
            <Cell key={index} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          formatter={(value) => <span style={{ color: '#64748B' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
