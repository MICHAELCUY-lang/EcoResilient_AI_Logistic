/**
 * Smart traffic congestion simulation for Jakarta Metro.
 * Based on real Jakarta traffic patterns — no paid API needed.
 */

// Congestion factor: 1.0 = free flow, 0.0 = standstill
function baseCongestion() {
  const h   = new Date().getHours()
  const dow = new Date().getDay()  // 0=Sun, 6=Sat
  const isWeekend = dow === 0 || dow === 6

  if (isWeekend) return 0.12          // light traffic on weekends

  if (h >= 7  && h < 9)  return 0.55  // morning peak
  if (h >= 12 && h < 13) return 0.25  // lunch dip
  if (h >= 17 && h < 20) return 0.60  // evening peak — worst in Jakarta
  if (h >= 0  && h < 5)  return 0.05  // night — almost clear
  return 0.18                          // normal hours
}

/**
 * Get traffic speed multiplier for a given location.
 * @param {number} lat
 * @param {number} lng
 * @param {number} weatherDelay  — 0..0.35 from weatherService
 * @returns {{ multiplier: number, level: string, color: string, label: string }}
 */
export function getTrafficFactor(lat, lng, weatherDelay = 0) {
  let cong = baseCongestion()

  // Toll road zones get heavier congestion during peak
  const isInnerJakarta = lat > -6.28 && lat < -6.12 && lng > 106.78 && lng < 106.92
  if (isInnerJakarta) cong += 0.10

  // Rain worsens congestion
  cong += weatherDelay * 0.4

  // Clamp 0..0.85
  cong = Math.min(Math.max(cong, 0), 0.85)

  const multiplier = 1 - cong

  let level, color, label
  if (multiplier >= 0.80) { level = 'smooth';   color = '#22C55E'; label = 'Smooth'   }
  else if (multiplier >= 0.60) { level = 'moderate'; color = '#F59E0B'; label = 'Moderate' }
  else if (multiplier >= 0.40) { level = 'heavy';    color = '#EF4444'; label = 'Heavy'    }
  else                         { level = 'severe';   color = '#7F1D1D'; label = 'Severe'   }

  return { multiplier, level, color, label }
}

/**
 * Get a human-readable traffic status string for the intel panel.
 */
export function getTrafficAlert(weatherDelay = 0) {
  const h    = new Date().getHours()
  const tf   = getTrafficFactor(-6.2088, 106.8456, weatherDelay)
  const msgs = []

  if (h >= 7 && h < 9)   msgs.push('⚠️ Morning peak hour — Tol Jakarta-Cikampek congested')
  if (h >= 17 && h < 20) msgs.push('⚠️ Evening rush — Tol JORR & inner city heavy')
  if (weatherDelay >= 0.15) msgs.push('🌧️ Heavy rain reducing road visibility — ETA +15 min')
  if (tf.level === 'severe') msgs.push('🔴 Severe congestion — automatic reroute recommended')
  if (msgs.length === 0)  msgs.push('✅ Traffic flowing normally across Jakarta Metro')

  return msgs
}
