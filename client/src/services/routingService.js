/**
 * Routing service using OSRM public API.
 * Falls back to linear interpolation if OSRM is unreachable.
 */

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'
const TIMEOUT_MS = 6000

// Named locations in Jakarta Metro (used as route origins/destinations)
export const LOCATIONS = {
  'Jakarta Pusat':   { lat: -6.2088, lng: 106.8456 },
  'Jakarta Barat':   { lat: -6.1944, lng: 106.7891 },
  'Jakarta Timur':   { lat: -6.2253, lng: 106.9004 },
  'Jakarta Utara':   { lat: -6.1382, lng: 106.8685 },
  'Jakarta Selatan': { lat: -6.2607, lng: 106.8106 },
  'Bekasi':          { lat: -6.2349, lng: 106.9896 },
  'Tangerang':       { lat: -6.1781, lng: 106.6296 },
  'Depok':           { lat: -6.4025, lng: 106.7942 },
  'Cakung':          { lat: -6.1833, lng: 106.9370 },
  'Cikarang':        { lat: -6.2636, lng: 107.1431 },
}

export const LOCATION_KEYS = Object.keys(LOCATIONS)

/**
 * Subsample a points array to roughly `targetCount` evenly-spaced points.
 * Always includes the very first and last point.
 */
function subsample(points, targetCount = 90) {
  if (points.length <= targetCount) return points
  const step = points.length / targetCount
  const result = []
  for (let i = 0; i < points.length; i = Math.round(i + step)) {
    result.push(points[i])
  }
  const last = points[points.length - 1]
  if (result[result.length - 1] !== last) result.push(last)
  return result
}

/**
 * Linearly interpolate `steps` points between two coordinates.
 * Used as a fallback when OSRM is unavailable.
 */
function linearInterpolate(from, to, steps = 90) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    return {
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
    }
  })
}

/**
 * Fetch a real road route from OSRM between two {lat, lng} points.
 * Returns an array of {lat, lng} waypoints along the actual road.
 *
 * NOTE: OSRM uses (lng, lat) order in the URL and GeoJSON responses.
 */
export async function fetchRoute(from, to) {
  const url =
    `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=geojson`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`)

    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error('OSRM: no route returned')
    }

    // GeoJSON LineString coords are [lng, lat] — flip to {lat, lng}
    const raw = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
    return subsample(raw, 90)
  } catch (err) {
    console.warn('[routingService] OSRM fallback:', err.message)
    return linearInterpolate(from, to, 90)
  }
}

/**
 * Pick a random location name, optionally excluding one (e.g. the current destination).
 */
export function randomLocation(exclude = null) {
  const options = LOCATION_KEYS.filter(k => k !== exclude)
  return options[Math.floor(Math.random() * options.length)]
}
