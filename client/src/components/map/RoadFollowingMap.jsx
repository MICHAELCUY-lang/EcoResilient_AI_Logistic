import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { createTruckIcon, buildPopupHtml } from '../../utils/truckIcon'

const TILE_URL  = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTR = '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'

const ROUTE_STYLE = {
  normal:  { color: '#16A34A', weight: 2, opacity: 0.30, dashArray: '7 5' },
  warning: { color: '#D97706', weight: 2, opacity: 0.30, dashArray: '7 5' },
  delayed: { color: '#DC2626', weight: 2, opacity: 0.30, dashArray: '7 5' },
  eco:     { color: '#2563EB', weight: 2, opacity: 0.30, dashArray: '7 5' },
}

/**
 * RoadFollowingMap
 *
 * Pure display component. All simulation logic lives in useFleetSimulation.
 *
 * Props:
 *   height        — CSS height string
 *   enginesRef    — ref to { [id]: engine } from useFleetSimulation
 *   markerCbsRef  — ref where this component registers updater callbacks
 *   vehicleDefs   — static vehicle definitions (for initial route fetch)
 */
export default function RoadFollowingMap({ height = '100%', enginesRef, markerCbsRef, vehicleDefs }) {
  const mapRef      = useRef(null)
  const instanceRef = useRef(null)
  const mountedRef  = useRef(true)

  /* ── Inject popup CSS once ───────────────────────────────── */
  useEffect(() => {
    if (document.getElementById('rfm2-css')) return
    const s = document.createElement('style')
    s.id = 'rfm2-css'
    s.textContent = `
      .rfm-popup .leaflet-popup-content-wrapper {
        padding:0!important;border-radius:14px!important;overflow:hidden;
        border:1px solid #E5E7EB!important;box-shadow:0 8px 24px rgba(0,0,0,.09)!important;
      }
      .rfm-popup .leaflet-popup-tip  { background:white!important; }
      .rfm-popup .leaflet-popup-content { margin:0!important; }
      .leaflet-control-zoom a {
        border-radius:8px!important;border:1px solid #E5E7EB!important;color:#374151!important;
      }
    `
    document.head.appendChild(s)
  }, [])

  /* ── Init map + markers ──────────────────────────────────── */
  useEffect(() => {
    if (instanceRef.current || !mapRef.current) return
    mountedRef.current = true

    const map = L.map(mapRef.current, { center: [-6.22, 106.86], zoom: 11 })
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map)
    instanceRef.current = map

    // For each vehicle definition, wait for engine to be ready then create marker
    vehicleDefs.forEach(def => {
      // Poll until the engine is populated (routes finish loading)
      const poll = setInterval(() => {
        const engine = enginesRef.current[def.id]
        if (!engine || !mountedRef.current) { clearInterval(poll); return }
        clearInterval(poll)

        // Draw initial route polyline
        const style    = ROUTE_STYLE[def.status] || ROUTE_STYLE.normal
        const polyline = L.polyline(
          engine.routePoints.map(p => [p.lat, p.lng]),
          style
        ).addTo(map)

        // Create marker at route start
        const marker = L.marker([engine.lat, engine.lng], {
          icon:          createTruckIcon(engine.status, Math.round(engine.speed), engine.bearing),
          zIndexOffset:  100,
        })
          .addTo(map)
          .bindPopup('', { maxWidth: 250, className: 'rfm-popup' })

        // Bind initial popup content
        marker.setPopupContent(buildPopupHtml(engine))

        // ── Register the marker updater callback ────────────────
        // The hook's rAF loop calls this every frame — NO React re-renders
        markerCbsRef.current[def.id] = (lat, lng, speed, status, bearing) => {
          marker.setLatLng([lat, lng])
          marker.setIcon(createTruckIcon(status, Math.round(speed), Math.round(bearing)))
          if (marker.isPopupOpen()) {
            marker.setPopupContent(buildPopupHtml(enginesRef.current[def.id]))
          }
        }

        // ── Register polyline updater (called on reroute) ───────
        markerCbsRef.current[`${def.id}_polyline`] = (latlngs) => {
          polyline.setLatLngs(latlngs)
        }
      }, 200)
    })

    return () => {
      mountedRef.current = false
      instanceRef.current?.remove()
      instanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={mapRef} style={{ height, width: '100%' }} />
}
