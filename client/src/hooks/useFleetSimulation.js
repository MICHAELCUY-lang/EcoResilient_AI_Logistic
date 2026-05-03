import { useEffect, useRef, useState, useCallback } from 'react'
import { createEngine, tickEngine, applyTraffic, resetEngine } from '../utils/movementEngine'
import { fetchRoute, LOCATIONS, randomLocation } from '../services/routingService'

/* ── Vehicle definitions (initial routes + driver info) ───────────── */
export const VEHICLE_DEFS = [
  { id: 'VH-001', fromName: 'Jakarta Pusat',  toName: 'Bekasi',          speed: 58, baseSpeed: 58, status: 'normal',  driver: 'Ahmad Fauzi',    plate: 'B 1234 XY', cargo: 'Electronics', weight: 850,  carbon: 12.4, fuel: 68 },
  { id: 'VH-002', fromName: 'Bekasi',         toName: 'Cikarang',        speed: 22, baseSpeed: 22, status: 'delayed', driver: 'Budi Santoso',   plate: 'B 5678 AB', cargo: 'Fashion',     weight: 650,  carbon: 24.7, fuel: 45 },
  { id: 'VH-003', fromName: 'Tangerang',      toName: 'Jakarta Barat',   speed: 41, baseSpeed: 41, status: 'warning', driver: 'Siti Rahayu',    plate: 'B 9012 CD', cargo: 'FMCG',        weight: 1200, carbon: 18.2, fuel: 72 },
  { id: 'VH-004', fromName: 'Depok',          toName: 'Jakarta Selatan', speed: 67, baseSpeed: 67, status: 'normal',  driver: 'Deni Kurniawan', plate: 'B 3456 EF', cargo: 'Groceries',   weight: 450,  carbon: 9.8,  fuel: 81 },
  { id: 'VH-005', fromName: 'Jakarta Utara',  toName: 'Cakung',          speed: 15, baseSpeed: 15, status: 'delayed', driver: 'Rina Wulandari', plate: 'B 7890 GH', cargo: 'Heavy Equip', weight: 2100, carbon: 31.5, fuel: 33 },
  { id: 'VH-006', fromName: 'Jakarta Barat',  toName: 'Tangerang',       speed: 73, baseSpeed: 73, status: 'normal',  driver: 'Wahyu Prasetyo', plate: 'B 2345 IJ', cargo: 'Pharma',      weight: 300,  carbon: 8.9,  fuel: 90 },
]

/**
 * useFleetSimulation
 *
 * Single source of truth for all vehicle state.
 *
 * - `vehicles`     → React state, refreshed every 500 ms for UI cards
 * - `enginesRef`   → mutable objects updated every rAF tick (60 fps)
 * - `markerCbsRef` → map registers updater callbacks here; hook calls them per tick
 */
export function useFleetSimulation() {
  const [vehicles,  setVehicles]  = useState([])
  const [loading,   setLoading]   = useState(true)

  const enginesRef   = useRef({})   // { [id]: engineObject }
  const markerCbsRef = useRef({})   // { [id]: (lat, lng, speed, status, bearing) => void }
  const rafRef       = useRef(null)
  const mountedRef   = useRef(true)

  /* ── snapshot engines → React state (called every 500 ms) ── */
  const snapshotUI = useCallback(() => {
    const snap = Object.values(enginesRef.current).map(e => ({
      id:      e.id,
      driver:  e.driver,
      plate:   e.plate,
      cargo:   e.cargo,
      weight:  e.weight,
      carbon:  e.carbon,
      fuel:    e.fuel,
      route:   `${e.fromName} → ${e.toName}`,
      speed:   Math.round(e.speed),
      eta:     e.eta,
      status:  e.status,
    }))
    setVehicles(snap)
  }, [])

  /* ── handle destination reached ─────────────────────────── */
  const handleDone = useCallback(async (engine) => {
    engine.paused = true

    await new Promise(r => setTimeout(r, 3000))   // pause at destination
    if (!mountedRef.current) return

    const newTo   = randomLocation(engine.toName)
    const newFrom = engine.toName
    const pts     = await fetchRoute(LOCATIONS[newFrom], LOCATIONS[newTo])
    if (!mountedRef.current) return

    resetEngine(engine, newFrom, newTo, pts)

    // update polyline on map if callback registered
    const cb = markerCbsRef.current[`${engine.id}_polyline`]
    cb?.(pts.map(p => [p.lat, p.lng]))
  }, [])

  /* ── rAF animation loop ──────────────────────────────────── */
  const startLoop = useCallback(() => {
    function tick(ts) {
      if (!mountedRef.current) return

      Object.values(enginesRef.current).forEach(engine => {
        const reached = tickEngine(engine, ts)

        // push position update to Leaflet marker (zero React overhead)
        const cb = markerCbsRef.current[engine.id]
        cb?.(engine.lat, engine.lng, engine.speed, engine.status, engine.bearing)

        if (reached && !engine._rerouting) {
          engine._rerouting = true
          handleDone(engine).finally(() => { engine._rerouting = false })
        }
      })

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [handleDone])

  /* ── bootstrap: fetch all routes in parallel ─────────────── */
  useEffect(() => {
    mountedRef.current = true

    Promise.all(
      VEHICLE_DEFS.map(async def => {
        const from = LOCATIONS[def.fromName]
        const to   = LOCATIONS[def.toName]
        const pts  = await fetchRoute(from, to)
        return { def, pts }
      })
    ).then(results => {
      if (!mountedRef.current) return
      results.forEach(({ def, pts }) => {
        enginesRef.current[def.id] = createEngine(def, pts)
      })
      setLoading(false)
      snapshotUI()
      startLoop()
    })

    return () => {
      mountedRef.current = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [snapshotUI, startLoop])

  /* ── UI refresh every 500 ms ─────────────────────────────── */
  useEffect(() => {
    const id = setInterval(snapshotUI, 500)
    return () => clearInterval(id)
  }, [snapshotUI])

  /* ── Traffic simulation every 10 s ──────────────────────── */
  useEffect(() => {
    const id = setInterval(() => {
      Object.values(enginesRef.current).forEach(engine => {
        if (engine.paused) return
        // multiplier: 0.25 (jammed) → 1.2 (clear road)
        const mult = 0.25 + Math.random() * 0.95
        applyTraffic(engine, mult)
      })
    }, 10000)
    return () => clearInterval(id)
  }, [])

  return { vehicles, loading, enginesRef, markerCbsRef }
}
