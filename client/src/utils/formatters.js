export function formatNumber(n, decimals = 0) {
  if (n === undefined || n === null) return '—'
  return Number(n).toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatCarbon(kg) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t CO₂`
  return `${kg.toFixed(1)} kg CO₂`
}

export function formatTime(isoOrTime) {
  if (!isoOrTime) return '—'
  if (isoOrTime.includes('T')) {
    return new Date(isoOrTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }
  return isoOrTime
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatPercent(value, total) {
  if (!total) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'normal':
    case 'on-time':
    case 'active':
      return 'green'
    case 'warning':
    case 'medium':
      return 'amber'
    case 'delayed':
    case 'critical':
    case 'high':
      return 'red'
    case 'info':
    case 'low':
      return 'blue'
    default:
      return 'gray'
  }
}

export function getRiskColor(level) {
  switch (level?.toLowerCase()) {
    case 'high': return { bg: 'bg-eco-red-light', text: 'text-eco-red', dot: 'bg-eco-red' }
    case 'medium': return { bg: 'bg-eco-amber-light', text: 'text-eco-amber', dot: 'bg-eco-amber' }
    case 'low': return { bg: 'bg-eco-green-light', text: 'text-eco-green', dot: 'bg-eco-green' }
    default: return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
  }
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function jitter(value, amount) {
  return value + randomBetween(-amount, amount)
}
