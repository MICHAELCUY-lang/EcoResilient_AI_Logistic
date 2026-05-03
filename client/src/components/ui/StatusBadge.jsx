const colorVariants = {
  green: 'bg-eco-green-light text-eco-green',
  amber: 'bg-eco-amber-light text-eco-amber',
  red: 'bg-eco-red-light text-eco-red',
  blue: 'bg-eco-blue-light text-eco-blue',
  gray: 'bg-gray-100 text-gray-500',
  purple: 'bg-purple-50 text-purple-600',
}

const dotColors = {
  green: 'bg-eco-green',
  amber: 'bg-eco-amber',
  red: 'bg-eco-red',
  blue: 'bg-eco-blue',
  gray: 'bg-gray-400',
  purple: 'bg-purple-500',
}

export default function StatusBadge({ label, color = 'gray', dot = false, size = 'sm' }) {
  const base = colorVariants[color] || colorVariants.gray
  const dotColor = dotColors[color] || dotColors.gray
  const textSize = size === 'xs' ? 'text-xs' : 'text-xs'
  const padding = size === 'xs' ? 'px-2 py-0.5' : 'px-2.5 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${base} ${textSize} ${padding}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />}
      {label}
    </span>
  )
}
