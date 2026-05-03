import { buildCumulativeDistances, interpolatePosition, formatETA } from './distanceUtils'

/**
 * Create a vehicle engine state object.
 * All mutable fields are plain properties — no React state, just a plain object
 * held in a ref so the rAF loop can mutate it without triggering re-renders.
 */
export function createEngine({ id, fromName, toName, speed, status, driver, plate,
  cargo, weight, carbon, fuel }, routePoints) {
  const cumDist = buildCumulativeDistances(routePoints)
  const totalDist = cumDist[cumDist.length - 1]
  const startPt = routePoints[0]

  return {
    // identity
    id, driver, plate, cargo, weight, fromName, toName,
    // route geometry
    routePoints, cumDist, totalDist,
    // movement
    currentDist: 0,
    speed,          // km/h — SINGLE SOURCE OF TRUTH for both map and UI
    baseSpeed: speed,
    // display
    status, carbon, fuel,
    lat: startPt.lat,
    lng: startPt.lng,
    bearing: 0,
    eta: formatETA(totalDist, speed),
    // internal
    lastTs: null,
    paused: false,
    done: false,
  }
}

/**
 * Advance engine by real elapsed time.
 * Formula: distanceMoved = (speed_km_h / 3.6) * dt_seconds
 *
 * @param {object} engine   — mutated in place
 * @param {number} timestamp — from requestAnimationFrame / performance.now()
 * @returns {boolean}        — true if destination reached this tick
 */
export function tickEngine(engine, timestamp) {
  if (engine.paused) return false

  if (engine.lastTs === null) {
    engine.lastTs = timestamp
    return false
  }

  // Cap dt at 100 ms to avoid large jumps after tab switches
  const dt = Math.min((timestamp - engine.lastTs) / 1000, 0.1)
  engine.lastTs = timestamp

  const mps = Math.max(engine.speed, 0.5) / 3.6   // m/s
  engine.currentDist += mps * dt

  if (engine.currentDist >= engine.totalDist) {
    engine.currentDist = engine.totalDist
    engine.done = true

    const lastPt = engine.routePoints[engine.routePoints.length - 1]
    engine.lat = lastPt.lat
    engine.lng = lastPt.lng
    engine.eta = '--:--'
    return true
  }

  const pos = interpolatePosition(engine.routePoints, engine.cumDist, engine.currentDist)
  engine.lat     = pos.lat
  engine.lng     = pos.lng
  engine.bearing = pos.bearing
  engine.eta     = formatETA(engine.totalDist - engine.currentDist, engine.speed)
  return false
}

/**
 * Apply a traffic multiplier to engine speed + status.
 * Called by the traffic simulation every 10 s.
 *
 * @param {object} engine
 * @param {number} multiplier  — 0.2 (jammed) … 1.2 (clear road)
 */
export function applyTraffic(engine, multiplier) {
  engine.speed = Math.round(Math.max(engine.baseSpeed * multiplier, 3))

  if (multiplier >= 0.8)       engine.status = 'normal'
  else if (multiplier >= 0.45) engine.status = 'warning'
  else                         engine.status = 'delayed'
}

/**
 * Reset engine for a new route (called after reaching destination).
 */
export function resetEngine(engine, newFromName, newToName, routePoints) {
  const cumDist  = buildCumulativeDistances(routePoints)
  const totalDist = cumDist[cumDist.length - 1]
  const startPt  = routePoints[0]

  engine.fromName    = newFromName
  engine.toName      = newToName
  engine.routePoints = routePoints
  engine.cumDist     = cumDist
  engine.totalDist   = totalDist
  engine.currentDist = 0
  engine.lat         = startPt.lat
  engine.lng         = startPt.lng
  engine.bearing     = 0
  engine.lastTs      = null
  engine.paused      = false
  engine.done        = false
  engine.eta         = formatETA(totalDist, engine.speed)
}
