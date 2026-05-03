import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import { fetchRoute, LOCATIONS, randomLocation } from '../services/routingService'
import { fetchWeather } from '../services/weatherService'
import { getTrafficFactor, getTrafficAlert } from '../services/trafficService'
import { calculateETA } from '../utils/etaEngine'
import { createTruckIcon, buildPopupHtml } from '../utils/truckIcons'
import { buildCumulativeDistances, interpolatePosition } from '../utils/distanceUtils'

/* ── Vehicle definitions ──────────────────────────────── */
const DEFS = [
  { id:'VH-001', fromName:'Jakarta Pusat',  toName:'Bekasi',          speed:58, status:'normal',  driver:'Ahmad Fauzi',    plate:'B 1234 XY', cargo:'Electronics', weight:850,  carbon:12.4, fuel:68 },
  { id:'VH-002', fromName:'Bekasi',         toName:'Cikarang',        speed:22, status:'delayed', driver:'Budi Santoso',   plate:'B 5678 AB', cargo:'Fashion',     weight:650,  carbon:24.7, fuel:45 },
  { id:'VH-003', fromName:'Tangerang',      toName:'Jakarta Barat',   speed:41, status:'warning', driver:'Siti Rahayu',    plate:'B 9012 CD', cargo:'FMCG',        weight:1200, carbon:18.2, fuel:72 },
  { id:'VH-004', fromName:'Depok',          toName:'Jakarta Selatan', speed:67, status:'normal',  driver:'Deni Kurniawan', plate:'B 3456 EF', cargo:'Groceries',   weight:450,  carbon:9.8,  fuel:81 },
  { id:'VH-005', fromName:'Jakarta Utara',  toName:'Cakung',          speed:15, status:'delayed', driver:'Rina Wulandari', plate:'B 7890 GH', cargo:'Heavy Equip', weight:2100, carbon:31.5, fuel:33 },
  { id:'VH-006', fromName:'Jakarta Barat',  toName:'Tangerang',       speed:73, status:'normal',  driver:'Wahyu Prasetyo', plate:'B 2345 IJ', cargo:'Pharma',      weight:300,  carbon:8.9,  fuel:90 },
]

const TILE  = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTR  = '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
const ROUTE_W = { color:'#94A3B8', weight:2, opacity:0.35, dashArray:'7 5' }

/**
 * useVehicleMovement
 *
 * This hook owns:
 *  - The Leaflet map (via mapContainerRef — attach to a <div>)
 *  - OSRM route fetching
 *  - Distance-based movement at 100 ms intervals
 *  - Real weather (Open-Meteo, every 5 min)
 *  - Traffic simulation (every 30 s)
 *  - Smart ETA calculation
 *
 * Returns:
 *  mapContainerRef — attach to the map <div>
 *  vehicles        — React state array for the sidebar (updated every 500 ms)
 *  loading         — true while OSRM routes are being fetched
 *  intelAlerts     — string[] for the right intelligence panel
 */
export function useVehicleMovement() {
  const mapContainerRef = useRef(null)
  const mapRef          = useRef(null)
  const enginesRef      = useRef({})   // [id] → engine
  const markersRef      = useRef({})   // [id] → L.Marker
  const polylinesRef    = useRef({})   // [id] → L.Polyline
  const mountedRef      = useRef(true)
  const intervalRef     = useRef(null)
  const weatherRef      = useRef({ label:'Clear', emoji:'☀️', temp:30, wind:8, delay:0 })
  const trafficRef      = useRef({ multiplier:1, level:'smooth', color:'#22C55E', label:'Smooth' })
  const lastWeatherFetch = useRef(0)
  const lastTrafficRefresh = useRef(0)

  const [vehicles,    setVehicles]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [intelAlerts, setIntelAlerts] = useState([])

  /* ── snapshot → React state for sidebar (called every 500ms) ── */
  const snapshot = useCallback(() => {
    const arr = Object.values(enginesRef.current).map(e => ({
      id:          e.id,
      driver:      e.driver,
      plate:       e.plate,
      cargo:       e.cargo,
      weight:      e.weight,
      carbon:      e.carbon,
      fuel:        e.fuel,
      route:       `${e.fromName} → ${e.toName}`,
      speed:       Math.round(e.speed),
      eta:         e.eta,
      status:      e.status,
      weather:     weatherRef.current,
      trafficLabel: trafficRef.current.label,
      delayMinutes: e.delayMinutes ?? 0,
    }))
    setVehicles(arr)
  }, [])

  /* ── reroute when truck reaches destination ─────────────── */
  const reroute = useCallback(async (engine) => {
    engine.paused    = true
    engine.rerouting = true
    await new Promise(r => setTimeout(r, 3000))
    if (!mountedRef.current) return

    const newTo   = randomLocation(engine.toName)
    const newFrom = engine.toName
    const pts     = await fetchRoute(LOCATIONS[newFrom], LOCATIONS[newTo])
    if (!mountedRef.current) return

    const cumDist = buildCumulativeDistances(pts)
    engine.fromName    = newFrom
    engine.toName      = newTo
    engine.routePoints = pts
    engine.cumDist     = cumDist
    engine.totalDist   = cumDist[cumDist.length - 1]
    engine.currentDist = 0
    engine.lastTs      = null
    engine.paused      = false
    engine.rerouting   = false
    engine.done        = false

    // Redraw polyline on map
    const poly = polylinesRef.current[engine.id]
    poly?.setLatLngs(pts.map(p => [p.lat, p.lng]))
  }, [])

  /* ── main movement tick — called every 100 ms ───────────── */
  const tick = useCallback(() => {
    const now = Date.now()

    // Refresh weather every 5 min
    if (now - lastWeatherFetch.current > 5 * 60 * 1000) {
      lastWeatherFetch.current = now
      fetchWeather(-6.2088, 106.8456).then(w => { weatherRef.current = w })
    }

    // Refresh traffic every 30 s
    if (now - lastTrafficRefresh.current > 30 * 1000) {
      lastTrafficRefresh.current = now
      const tf = getTrafficFactor(-6.2088, 106.8456, weatherRef.current.delay)
      trafficRef.current = tf
      // Update polyline colours
      Object.values(enginesRef.current).forEach(e => {
        polylinesRef.current[e.id]?.setStyle({ color: tf.color, opacity: 0.45 })
      })
      // Intel alerts
      setIntelAlerts(getTrafficAlert(weatherRef.current.delay))
    }

    // Move each vehicle
    const ts = performance.now()
    Object.values(enginesRef.current).forEach(e => {
      if (e.paused || !e.routePoints?.length) return

      // ── Distance-based movement ──────────────────────────
      // speed in km/h → metres per 100 ms tick
      const dt      = e.lastTs ? Math.min((ts - e.lastTs) / 1000, 0.15) : 0
      e.lastTs      = ts
      if (dt === 0)  return

      // Apply traffic multiplier to speed
      const effKmh  = e.speed * trafficRef.current.multiplier
      e.currentDist += (effKmh / 3.6) * dt

      // Reached destination?
      if (e.currentDist >= e.totalDist) {
        e.currentDist = e.totalDist
        e.done = true
        if (!e.rerouting) reroute(e)
        return
      }

      // Interpolate position along route
      const pos = interpolatePosition(e.routePoints, e.cumDist, e.currentDist)
      e.lat     = pos.lat
      e.lng     = pos.lng
      e.bearing = pos.bearing

      // ETA
      const etaResult = calculateETA(
        e.totalDist - e.currentDist,
        e.speed,
        weatherRef.current.delay,
        trafficRef.current.multiplier
      )
      e.eta          = etaResult.etaString
      e.delayMinutes = etaResult.delayMinutes

      // Update status based on traffic+weather
      if (etaResult.delayMinutes > 15)      e.status = 'delayed'
      else if (etaResult.delayMinutes > 5)  e.status = 'warning'
      else                                   e.status = e.baseStatus

      // ── Update Leaflet marker ────────────────────────────
      const marker = markersRef.current[e.id]
      if (!marker) return

      marker.setLatLng([e.lat, e.lng])
      marker.setIcon(createTruckIcon(e.status, Math.round(effKmh), Math.round(e.bearing), weatherRef.current.emoji))

      if (marker.isPopupOpen()) {
        marker.setPopupContent(buildPopupHtml({
          ...e,
          speed:       effKmh,
          weather:     weatherRef.current,
          trafficLabel: trafficRef.current.label,
        }))
      }
    })
  }, [reroute])

  /* ── init map + all vehicles ────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true
    if (!mapContainerRef.current) return

    // ── 1. Init Leaflet ──────────────────────────────────────
    const map = L.map(mapContainerRef.current, { center: [-6.22, 106.86], zoom: 11 })
    L.tileLayer(TILE, { attribution: ATTR, maxZoom: 19 }).addTo(map)
    mapRef.current = map

    // Inject popup CSS once
    if (!document.getElementById('vm-css')) {
      const s = document.createElement('style')
      s.id = 'vm-css'
      s.textContent = `
        .vm-popup .leaflet-popup-content-wrapper {
          padding:0!important;border-radius:14px!important;overflow:hidden;
          border:1px solid #E5E7EB!important;box-shadow:0 8px 24px rgba(0,0,0,.09)!important;
        }
        .vm-popup .leaflet-popup-tip  { background:white!important; }
        .vm-popup .leaflet-popup-content { margin:0!important; }
        .leaflet-control-zoom a { border-radius:8px!important; border:1px solid #E5E7EB!important; color:#374151!important; }
      `
      document.head.appendChild(s)
    }

    // ── 2. Fetch initial weather ─────────────────────────────
    fetchWeather(-6.2088, 106.8456).then(w => {
      if (mountedRef.current) weatherRef.current = w
    })

    // ── 3. Fetch all routes + create markers ─────────────────
    Promise.all(
      DEFS.map(async def => {
        const from = LOCATIONS[def.fromName]
        const to   = LOCATIONS[def.toName]
        const pts  = await fetchRoute(from, to)
        return { def, pts }
      })
    ).then(results => {
      if (!mountedRef.current) return

      results.forEach(({ def, pts }) => {
        const cumDist   = buildCumulativeDistances(pts)
        const totalDist = cumDist[cumDist.length - 1]
        const start     = pts[0]

        // Engine state
        const engine = {
          ...def,
          baseStatus: def.status,
          routePoints: pts,
          cumDist,
          totalDist,
          currentDist: 0,
          lat:     start.lat,
          lng:     start.lng,
          bearing: 0,
          eta:     '--:--',
          delayMinutes: 0,
          lastTs:  null,
          paused:  false,
          rerouting: false,
          done:    false,
        }
        enginesRef.current[def.id] = engine

        // Route polyline
        const poly = L.polyline(pts.map(p => [p.lat, p.lng]), ROUTE_W).addTo(map)
        polylinesRef.current[def.id] = poly

        // Marker
        const marker = L.marker([start.lat, start.lng], {
          icon: createTruckIcon(def.status, def.speed, 0, '☀️'),
          zIndexOffset: 100,
        })
          .addTo(map)
          .bindPopup('', { maxWidth: 250, className: 'vm-popup' })
        marker.setPopupContent(buildPopupHtml({ ...engine, weather: weatherRef.current, trafficLabel: 'Smooth' }))
        markersRef.current[def.id] = marker
      })

      setLoading(false)

      // ── 4. Start movement loop ─────────────────────────────
      // 100 ms interval — reliable, no rAF complexity
      intervalRef.current = setInterval(tick, 100)

      // ── 5. UI refresh every 500 ms ─────────────────────────
      const uiTimer = setInterval(snapshot, 500)

      // store uiTimer for cleanup
      enginesRef.current.__uiTimer = uiTimer
    })

    return () => {
      mountedRef.current = false
      clearInterval(intervalRef.current)
      clearInterval(enginesRef.current.__uiTimer)
      map.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])   // run ONCE — no deps needed (all state in refs)

  return { mapContainerRef, vehicles, loading, intelAlerts }
}
