const barColors = {
  green: 'bg-eco-green',
  amber: 'bg-eco-amber',
  red: 'bg-eco-red',
  blue: 'bg-brand-600',
}

export default function ProgressBar({ value, max = 100, color = 'blue', showLabel = false, size = 'md' }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  const barColor = barColors[color] || barColors.blue
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'

  const autoColor = pct >= 90 ? 'bg-eco-red' : pct >= 70 ? 'bg-eco-amber' : barColor

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-100 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full ${autoColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-content-secondary w-8 text-right">{pct}%</span>
      )}
    </div>
  )
}
