/** Haversine distance between two {lat, lng} points — returns meters */
export function haversineDistance(a, b) {
  const R = 6371000
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const lat1 = a.lat * Math.PI / 180
  const lat2 = b.lat * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Build cumulative distance array (meters) from route point array */
export function buildCumulativeDistances(points) {
  const out = [0]
  for (let i = 1; i < points.length; i++) {
    out.push(out[i - 1] + haversineDistance(points[i - 1], points[i]))
  }
  return out
}

/**
 * Interpolate {lat, lng, bearing} at a given distance along the route.
 * Uses binary search for O(log n) lookup.
 */
export function interpolatePosition(points, cumDist, targetMeters) {
  const total = cumDist[cumDist.length - 1]
  if (targetMeters <= 0)   return { ...points[0], bearing: 0 }
  if (targetMeters >= total) return { ...points[points.length - 1], bearing: 0 }

  let lo = 0, hi = cumDist.length - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    cumDist[mid] <= targetMeters ? (lo = mid) : (hi = mid)
  }

  const t = (targetMeters - cumDist[lo]) / (cumDist[hi] - cumDist[lo])
  const a = points[lo], b = points[hi]

  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
    bearing: getBearing(a, b),
  }
}

/** Compass bearing (degrees, 0 = North, clockwise) between two points */
export function getBearing(a, b) {
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const lat1 = a.lat * Math.PI / 180
  const lat2 = b.lat * Math.PI / 180
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

/**
 * Format ETA as HH:MM string given remaining distance and current speed.
 * @param {number} remainingMeters
 * @param {number} speedKmh
 */
export function formatETA(remainingMeters, speedKmh) {
  if (speedKmh < 0.5) return '--:--'
  const remainingHours = remainingMeters / 1000 / speedKmh
  const eta = new Date(Date.now() + remainingHours * 3600 * 1000)
  return eta.toTimeString().slice(0, 5)
}
