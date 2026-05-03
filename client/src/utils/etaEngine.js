/**
 * Smart ETA engine.
 * Formula: ETA = (remainingKm / effectiveSpeed) + weatherPenalty + trafficPenalty
 *
 * All factors sourced from the single vehicle engine object —
 * the dashboard display and map movement both read from the same value.
 */

/**
 * @param {number} remainingMeters   — from movementEngine currentDist
 * @param {number} speedKmh          — current engine speed (already traffic-adjusted)
 * @param {number} weatherDelay      — 0..0.35 from weatherService
 * @param {number} trafficMultiplier — 0..1 from trafficService
 * @returns {{ etaString: string, delayMinutes: number, effectiveKmh: number }}
 */
export function calculateETA(remainingMeters, speedKmh, weatherDelay = 0, trafficMultiplier = 1) {
  const safeSpeed = Math.max(speedKmh, 1)

  // Effective speed after traffic multiplier
  const effectiveKmh = safeSpeed * trafficMultiplier

  // Base travel time (seconds)
  const baseSeconds = (remainingMeters / 1000 / effectiveKmh) * 3600

  // Weather adds proportional penalty
  const weatherSeconds = baseSeconds * weatherDelay

  const totalSeconds = baseSeconds + weatherSeconds
  const etaDate = new Date(Date.now() + totalSeconds * 1000)

  // Delay vs free-flow
  const freeFlowSeconds = (remainingMeters / 1000 / safeSpeed) * 3600
  const delayMinutes    = Math.max(0, Math.round((totalSeconds - freeFlowSeconds) / 60))

  return {
    etaString:    etaDate.toTimeString().slice(0, 5),
    delayMinutes,
    effectiveKmh: Math.round(effectiveKmh),
  }
}

/**
 * Format delay as readable string for the UI.
 * e.g. "+8 min delay"
 */
export function formatDelay(delayMinutes) {
  if (delayMinutes <= 0) return null
  return `+${delayMinutes} min delay`
}
