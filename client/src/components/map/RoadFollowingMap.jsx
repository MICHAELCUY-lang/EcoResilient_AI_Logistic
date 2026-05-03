import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import { useAppStore } from '../../store/useAppStore'
import { fetchRoute, LOCATIONS, randomLocation } from '../../services/routingService'
import { createTruckIcon, buildPopupHtml } from '../../utils/truckIcon'

/* ─── Tile config ──────────────────────────────────────────────────── */
const TILE_URL  = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTR = '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'

/* ─── Initial vehicle definitions ──────────────────────────────────── */
// ms per waypoint — controls how fast each truck moves along its route
const VEHICLE_DEFS = [
  { id: 'VH-001', from: 'Jakarta Pusat',   to: 'Bekasi',          status: 'normal',  msPerPt: 130 },
  { id: 'VH-002', from: 'Bekasi',          to: 'Cikarang',        status: 'delayed', msPerPt: 260 },
  { id: 'VH-003', from: 'Tangerang',       to: 'Jakarta Barat',   status: 'warning', msPerPt: 190 },
  { id: 'VH-004', from: 'Depok',           to: 'Jakarta Selatan', status: 'normal',  msPerPt: 120 },
  { id: 'VH-005', from: 'Jakarta Utara',   to: 'Cakung',          status: 'delayed', msPerPt: 270 },
  { id: 'VH-006', from: 'Jakarta Barat',   to: 'Tangerang',       status: 'normal',  msPerPt: 110 },
]

/* ─── Route polyline style ─────────────────────────────────────────── */
const ROUTE_STYLE = {
  normal:  { color: '#16A34A', weight: 2, opacity: 0.35, dashArray: '6 4' },
  warning: { color: '#D97706', weight: 2, opacity: 0.35, dashArray: '6 4' },
  delayed: { color: '#DC2626', weight: 2, opacity: 0.35, dashArray: '6 4' },
  eco:     { color: '#2563EB', weight: 2, opacity: 0.35, dashArray: '6 4' },
}

/* ─── Helpers ───────────────────────────────────────────────────────── */
function makePopupContent(vRef) {
  const v = vRef.current ?? vRef   // accept both ref-object and plain object
  return buildPopupHtml({
    vehicleId: v.id,
    driver:    v.driver    || '—',
    status:    v.status,
    speed:     v.speed     || '—',
    eta:       v.eta       || '—',
    carbon:    v.carbon    != null ? v.carbon.toFixed(1) : '—',
    fuel:      v.fuel      || '—',
    cargo:     v.cargo     || '—',
    weight:    v.weight    || '—',
    from:      v.fromName  || '—',
    to:        v.toName    || '—',
  })
}

/* ─── Component ─────────────────────────────────────────────────────── */
export default function RoadFollowingMap({ height = '100%' }) {
  const vehicles     = useAppStore(s => s.vehicles)      // for driver/cargo info
  const mapRef       = useRef(null)
  const instanceRef  = useRef(null)
  const vehiclesRef  = useRef({})   // keyed by vehicleId
  const mountedRef   = useRef(true)

  /* ── CSS injection ───────────────────────────────────────────────── */
  useEffect(() => {
    const id = 'rfm-css'
    if (document.getElementById(id)) return
    const s = document.createElement('style')
    s.id = id
    s.textContent = `
      .rfm-popup .leaflet-popup-content-wrapper {
        padding: 0 !important;
        border-radius: 14px !important;
        border: 1px solid #E5E7EB !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important;
        overflow: hidden;
      }
      .rfm-popup .leaflet-popup-tip { background: white !important; }
      .rfm-popup .leaflet-popup-content { margin: 0 !important; }
      .leaflet-control-zoom a {
        border-radius: 8px !important;
        border: 1px solid #E5E7EB !important;
        color: #374151 !important;
      }
    `
    document.head.appendChild(s)
  }, [])

  /* ── Per-vehicle movement logic ─────────────────────────────────── */
  const startMovement = useCallback((vId) => {
    const state = vehiclesRef.current[vId]
    if (!state || !mountedRef.current) return

    // Clear any existing interval for this vehicle
    if (state.intervalId) clearInterval(state.intervalId)

    const { routePoints, msPerPt } = state
    if (!routePoints || routePoints.length === 0) return

    let idx = 0

    state.intervalId = setInterval(() => {
      if (!mountedRef.current) return

      const st = vehiclesRef.current[vId]
      if (!st) return

      if (idx >= st.routePoints.length) {
        // ── Reached destination ───────────────────────────────────────
        clearInterval(st.intervalId)
        st.intervalId = null

        setTimeout(async () => {
          if (!mountedRef.current) return

          // Pick new random destination (different from current)
          const newToName  = randomLocation(st.toName)
          const newFrom    = LOCATIONS[st.toName]   // start from current destination
          const newTo      = LOCATIONS[newToName]

          st.fromName = st.toName
          st.toName   = newToName

          // Fetch new road route
          const newPoints = await fetchRoute(newFrom, newTo)
          if (!mountedRef.current) return

          st.routePoints = newPoints
          idx = 0

          // Redraw polyline
          if (st.polyline) {
            st.polyline.setLatLngs(newPoints.map(p => [p.lat, p.lng]))
          }

          startMovement(vId)
        }, 3000)

        return
      }

      const pt = st.routePoints[idx]
      if (!pt) { idx++; return }

      // Move marker along road
      st.marker.setLatLng([pt.lat, pt.lng])

      // Update popup content if open
      if (st.marker.isPopupOpen()) {
        st.marker.setPopupContent(makePopupContent(st))
      }

      idx++
    }, msPerPt)

    state.intervalId = state.intervalId   // already set above
  }, [])

  /* ── Initialize map + vehicles ───────────────────────────────────── */
  useEffect(() => {
    if (instanceRef.current || !mapRef.current) return
    mountedRef.current = true

    // Create map
    const map = L.map(mapRef.current, {
      center: [-6.22, 106.86],
      zoom: 11,
      zoomControl: true,
    })
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map)
    instanceRef.current = map

    // For each vehicle: fetch route, create marker + polyline, start animation
    VEHICLE_DEFS.forEach(async (def) => {
      if (!mountedRef.current) return

      const fromCoord = LOCATIONS[def.from]
      const toCoord   = LOCATIONS[def.to]
      if (!fromCoord || !toCoord) return

      // Fetch real road route
      const routePoints = await fetchRoute(fromCoord, toCoord)
      if (!mountedRef.current || !instanceRef.current) return

      // Find matching vehicle from store for driver/cargo info
      const storeVehicle = vehicles.find(v => v.id === def.id) || {}

      // Route polyline (drawn before truck marker so truck renders on top)
      const style   = ROUTE_STYLE[def.status] || ROUTE_STYLE.normal
      const polyline = L.polyline(
        routePoints.map(p => [p.lat, p.lng]),
        style
      ).addTo(map)

      // Truck marker starting at first route point
      const startPt = routePoints[0]
      const marker  = L.marker([startPt.lat, startPt.lng], {
        icon:          createTruckIcon(def.status),
        zIndexOffset:  100,
      })
        .addTo(map)
        .bindPopup('', { maxWidth: 240, className: 'rfm-popup' })

      // Build vehicle state object
      const vState = {
        id:          def.id,
        status:      def.status,
        msPerPt:     def.msPerPt,
        fromName:    def.from,
        toName:      def.to,
        routePoints,
        marker,
        polyline,
        intervalId:  null,
        // from store
        driver:  storeVehicle.driver  || def.id,
        cargo:   storeVehicle.cargo   || '—',
        weight:  storeVehicle.weight  || '—',
        carbon:  storeVehicle.carbon  ?? 0,
        fuel:    storeVehicle.fuel    ?? 75,
        eta:     storeVehicle.eta     || '—',
        speed:   storeVehicle.speed   != null ? Math.round(storeVehicle.speed) : '—',
      }

      // Bind popup with initial content
      marker.setPopupContent(makePopupContent(vState))

      // Store in ref
      vehiclesRef.current[def.id] = vState

      // Start moving
      startMovement(def.id)
    })

    return () => {
      mountedRef.current = false
      // Clear all intervals
      Object.values(vehiclesRef.current).forEach(v => {
        if (v.intervalId) clearInterval(v.intervalId)
      })
      vehiclesRef.current = {}
      instanceRef.current?.remove()
      instanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])   // intentionally run once

  /* ── Sync store data (driver/cargo) without restarting movement ─── */
  useEffect(() => {
    vehicles.forEach(sv => {
      const vState = vehiclesRef.current[sv.id]
      if (!vState) return
      vState.driver  = sv.driver  || vState.driver
      vState.cargo   = sv.cargo   || vState.cargo
      vState.weight  = sv.weight  || vState.weight
      vState.carbon  = sv.carbon  ?? vState.carbon
      vState.fuel    = sv.fuel    ?? vState.fuel
      vState.eta     = sv.eta     || vState.eta
      vState.speed   = sv.speed   != null ? Math.round(sv.speed) : vState.speed
    })
  }, [vehicles])

  return <div ref={mapRef} style={{ height, width: '100%' }} />
}
