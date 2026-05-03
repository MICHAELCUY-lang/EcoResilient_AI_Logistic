import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const colorMap = {
  blue: {
    icon: 'bg-brand-50 text-brand-600',
    trend: 'text-brand-600',
  },
  green: {
    icon: 'bg-eco-green-light text-eco-green',
    trend: 'text-eco-green',
  },
  amber: {
    icon: 'bg-eco-amber-light text-eco-amber',
    trend: 'text-eco-amber',
  },
  red: {
    icon: 'bg-eco-red-light text-eco-red',
    trend: 'text-eco-red',
  },
  purple: {
    icon: 'bg-purple-50 text-purple-600',
    trend: 'text-purple-600',
  },
}

export default function KPICard({ title, value, unit, icon: Icon, color = 'blue', trend, trendValue, index = 0 }) {
  const colors = colorMap[color] || colorMap.blue

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="card card-hover p-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-content-secondary uppercase tracking-wide">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.icon}`}>
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="stat-number">
            {value}
            {unit && <span className="text-sm font-normal text-content-secondary ml-1">{unit}</span>}
          </div>
        </div>

        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend === 'up' ? 'text-eco-green' : trend === 'down' ? 'text-eco-red' : 'text-content-muted'
          }`}>
            <TrendIcon size={13} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
