import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useAppStore } from '../../store/useAppStore'
import { routePolylines } from '../../data/mockVehicles'

// Custom SVG truck icon by status
function createTruckIcon(status) {
  const colors = {
    normal: '#16A34A',
    warning: '#F59E0B',
    delayed: '#EF4444',
  }
  const color = colors[status] || colors.normal

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="14" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="1.5"/>
    <circle cx="18" cy="18" r="8" fill="${color}"/>
    <text x="18" y="22" text-anchor="middle" font-size="10" fill="white">🚛</text>
  </svg>`

  return L.divIcon({
    html: svg,
    className: 'truck-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

function createHubIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="12" fill="#2563EB" fill-opacity="0.15" stroke="#2563EB" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="6" fill="#2563EB"/>
    <text x="14" y="18" text-anchor="middle" font-size="8" fill="white">H</text>
  </svg>`
  return L.divIcon({ html: svg, className: '', iconSize: [28, 28], iconAnchor: [14, 14] })
}

export default function LiveMap({ height = '360px', showHubs = false, compact = false }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const vehicles = useAppStore(s => s.vehicles)
  const hubs = useAppStore(s => s.hubs)

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return
    if (!mapRef.current) return

    const map = L.map(mapRef.current, {
      center: [-6.2088, 106.8456],
      zoom: compact ? 10 : 11,
      zoomControl: !compact,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map)

    // Add attribution small
    L.control.attribution({ prefix: '© OpenStreetMap' }).addTo(map)

    // Draw route polylines
    routePolylines.forEach(route => {
      L.polyline(route.points, {
        color: route.color,
        weight: 2.5,
        opacity: 0.5,
        dashArray: route.color === '#EF4444' ? '6,4' : null,
      }).addTo(map)
    })

    // Hub markers
    if (showHubs) {
      hubs.forEach(hub => {
        const marker = L.marker([hub.lat, hub.lng], { icon: createHubIcon() })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;padding:8px;min-width:160px">
              <div style="font-weight:700;font-size:13px;color:#0F172A;margin-bottom:4px">${hub.name}</div>
              <div style="color:#64748B;font-size:11px">Capacity: ${hub.capacityPct}%</div>
              <div style="color:#64748B;font-size:11px">Volume: ${hub.volume} shipments</div>
              <div style="color:#64748B;font-size:11px;margin-top:2px">Status: <span style="color:${hub.status === 'critical' ? '#EF4444' : hub.status === 'warning' ? '#F59E0B' : '#16A34A'};font-weight:600">${hub.status.toUpperCase()}</span></div>
            </div>
          `, { maxWidth: 220 })
        markersRef.current[`hub-${hub.id}`] = marker
      })
    }

    mapInstanceRef.current = map
  }, [])

  // Update vehicle markers when vehicles change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    vehicles.forEach(v => {
      const icon = createTruckIcon(v.status)
      const popup = `
        <div style="font-family:Inter,sans-serif;padding:10px;min-width:200px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
            <div style="width:8px;height:8px;border-radius:50%;background:${v.status === 'normal' ? '#16A34A' : v.status === 'warning' ? '#F59E0B' : '#EF4444'}"></div>
            <span style="font-weight:700;font-size:13px;color:#0F172A">${v.id}</span>
          </div>
          <div style="color:#64748B;font-size:11px;margin-bottom:2px">🧑 ${v.driver}</div>
          <div style="color:#64748B;font-size:11px;margin-bottom:2px">🛣️ ${v.route}</div>
          <div style="color:#64748B;font-size:11px;margin-bottom:2px">⏱ ETA: <strong>${v.eta}</strong></div>
          <div style="color:#64748B;font-size:11px;margin-bottom:2px">⚡ ${Math.round(v.speed)} km/h</div>
          <div style="color:#64748B;font-size:11px;margin-bottom:2px">🌿 CO₂: ${v.carbon.toFixed(1)} kg</div>
          <div style="color:#64748B;font-size:11px">⛽ Fuel: ${v.fuel}%</div>
        </div>
      `

      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setLatLng([v.lat, v.lng])
        markersRef.current[v.id].setIcon(icon)
        markersRef.current[v.id].setPopupContent(popup)
      } else {
        const marker = L.marker([v.lat, v.lng], { icon })
          .addTo(map)
          .bindPopup(popup, { maxWidth: 240 })
        markersRef.current[v.id] = marker
      }
    })
  }, [vehicles])

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-2xl overflow-hidden"
    />
  )
}
