import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useAppStore } from '../../store/useAppStore'

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const ATTRIBUTION = '© CartoDB © OpenStreetMap'

const STATUS_CFG = {
  normal:  { color: '#22C55E', glow: 'rgba(34,197,94,0.4)',  pulse: false },
  warning: { color: '#F59E0B', glow: 'rgba(245,158,11,0.4)', pulse: false },
  delayed: { color: '#EF4444', glow: 'rgba(239,68,68,0.5)',  pulse: true  },
  eco:     { color: '#38BDF8', glow: 'rgba(56,189,248,0.4)', pulse: false  },
}

const CONGESTION_ZONES = [
  { lat: -6.2088, lng: 106.8456, r: 900,  color: '#EF4444', label: 'Tol Dalam Kota' },
  { lat: -6.2350, lng: 106.9750, r: 700,  color: '#F59E0B', label: 'Bekasi Barat' },
  { lat: -6.2650, lng: 107.0600, r: 600,  color: '#F59E0B', label: 'Cikarang KM 37' },
  { lat: -6.1751, lng: 106.6279, r: 500,  color: '#22C55E', label: 'Tangerang Bypass' },
]

const ROUTES = [
  { points: [[-6.2088,106.8456],[-6.2200,106.9000],[-6.2350,106.9750]], color: '#22C55E' },
  { points: [[-6.2350,106.9750],[-6.2500,107.0200],[-6.2650,107.0600]], color: '#EF4444' },
  { points: [[-6.1751,106.6279],[-6.1900,106.7200],[-6.2088,106.7900]], color: '#F59E0B' },
  { points: [[-6.3025,106.7942],[-6.2700,106.8100],[-6.2300,106.8200]], color: '#22C55E' },
  { points: [[-6.2583,106.7383],[-6.2200,106.7000],[-6.1751,106.6279]], color: '#38BDF8' },
]

function makeTruckIcon(status) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.normal
  const blink = cfg.pulse
    ? `@keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}#g{animation:blink 1s ease-in-out infinite}`
    : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
    <defs><style>${blink}</style></defs>
    <circle cx="22" cy="22" r="20" fill="${cfg.color}" fill-opacity="0.12" stroke="${cfg.color}" stroke-width="0.5" stroke-opacity="0.3"/>
    <circle cx="22" cy="22" r="13" fill="${cfg.color}" fill-opacity="0.18"/>
    <g id="g">
      <rect x="10" y="17" width="20" height="10" rx="2.5" fill="${cfg.color}"/>
      <rect x="24" y="14" width="8" height="8" rx="1.5" fill="${cfg.color}" fill-opacity="0.85"/>
      <rect x="24.5" y="14.5" width="6" height="4" rx="0.5" fill="#080A0F" fill-opacity="0.5"/>
      <circle cx="15" cy="28" r="3" fill="#080A0F" stroke="${cfg.color}" stroke-width="1.5"/>
      <circle cx="27" cy="28" r="3" fill="#080A0F" stroke="${cfg.color}" stroke-width="1.5"/>
      <circle cx="15" cy="28" r="1.2" fill="${cfg.color}" fill-opacity="0.6"/>
      <circle cx="27" cy="28" r="1.2" fill="${cfg.color}" fill-opacity="0.6"/>
    </g>
    ${cfg.pulse ? `<circle cx="22" cy="22" r="20" fill="none" stroke="${cfg.color}" stroke-width="1" opacity="0.6"><animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/></circle>` : ''}
  </svg>`

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  })
}

function makePopup(v) {
  const cfg = STATUS_CFG[v.status] || STATUS_CFG.normal
  return `
    <div style="font-family:Inter,sans-serif;background:#0F1117;border:1px solid #1E2230;border-radius:12px;padding:14px;min-width:220px;color:#E2E8F0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:8px;height:8px;border-radius:50%;background:${cfg.color};box-shadow:0 0 6px ${cfg.color}"></div>
          <span style="font-weight:700;font-size:13px;letter-spacing:0.05em">${v.id}</span>
        </div>
        <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:${cfg.color}22;color:${cfg.color};text-transform:uppercase;letter-spacing:0.08em">${v.status}</span>
      </div>
      <div style="space-y:4px;font-size:11px;color:#94A3B8;line-height:2">
        <div>👤 <span style="color:#CBD5E1">${v.driver}</span></div>
        <div>🛣️ <span style="color:#CBD5E1">${v.route}</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px">
          <div style="background:#151820;border-radius:8px;padding:6px;text-align:center">
            <div style="font-weight:700;font-size:14px;color:${cfg.color}">${Math.round(v.speed)}</div>
            <div style="font-size:9px;color:#64748B">KM/H</div>
          </div>
          <div style="background:#151820;border-radius:8px;padding:6px;text-align:center">
            <div style="font-weight:700;font-size:14px;color:#E2E8F0">${v.eta}</div>
            <div style="font-size:9px;color:#64748B">ETA</div>
          </div>
          <div style="background:#151820;border-radius:8px;padding:6px;text-align:center">
            <div style="font-weight:700;font-size:14px;color:#22C55E">${v.carbon.toFixed(1)}</div>
            <div style="font-size:9px;color:#64748B">KG CO₂</div>
          </div>
          <div style="background:#151820;border-radius:8px;padding:6px;text-align:center">
            <div style="font-weight:700;font-size:14px;color:#E2E8F0">${v.fuel}%</div>
            <div style="font-size:9px;color:#64748B">FUEL</div>
          </div>
        </div>
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid #1E2230;font-size:10px;color:#64748B">
          📦 ${v.cargo} · ${v.weight} kg
        </div>
      </div>
    </div>`
}

export default function CommandMap({ height = '100%' }) {
  const mapRef        = useRef(null)
  const instanceRef   = useRef(null)
  const markersRef    = useRef({})
  const vehicles      = useAppStore(s => s.vehicles)

  // Inject dark popup CSS once
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'cmd-map-css'
    style.textContent = `
      .cmd-popup .leaflet-popup-content-wrapper {
        background: transparent !important;
        border: none !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
        padding: 0 !important;
        border-radius: 12px !important;
      }
      .cmd-popup .leaflet-popup-tip { background: #0F1117 !important; }
      .cmd-popup .leaflet-popup-content { margin: 0 !important; }
      .leaflet-control-zoom a {
        background: #0F1117 !important;
        color: #94A3B8 !important;
        border-color: #1E2230 !important;
      }
      .leaflet-control-attribution {
        background: rgba(8,10,15,0.7) !important;
        color: #475569 !important;
        font-size: 9px !important;
      }
      .leaflet-control-attribution a { color: #64748B !important; }
    `
    if (!document.getElementById('cmd-map-css')) document.head.appendChild(style)
    return () => { document.getElementById('cmd-map-css')?.remove() }
  }, [])

  // Init map
  useEffect(() => {
    if (instanceRef.current || !mapRef.current) return

    const map = L.map(mapRef.current, {
      center: [-6.2200, 106.8500],
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer(DARK_TILES, { attribution: ATTRIBUTION, maxZoom: 18 }).addTo(map)

    // Glowing route polylines (2 layers each: glow + sharp)
    ROUTES.forEach(route => {
      L.polyline(route.points, { color: route.color, weight: 8, opacity: 0.15 }).addTo(map)
      L.polyline(route.points, { color: route.color, weight: 2.5, opacity: 0.85, dashArray: '8,4' }).addTo(map)
    })

    // Congestion zones
    CONGESTION_ZONES.forEach(zone => {
      L.circle([zone.lat, zone.lng], {
        radius: zone.r,
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.08,
        weight: 1,
        opacity: 0.3,
        dashArray: '4,4',
      }).addTo(map).bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:10px;font-weight:600;color:${zone.color};background:#0F1117;border:1px solid #1E2230;border-radius:6px;padding:4px 8px">${zone.label}</div>`,
        { permanent: false, direction: 'top', className: 'cmd-popup' }
      )
    })

    instanceRef.current = map
  }, [])

  // Update markers when vehicles change
  useEffect(() => {
    const map = instanceRef.current
    if (!map) return

    vehicles.forEach(v => {
      const icon    = makeTruckIcon(v.status)
      const popup   = makePopup(v)

      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setLatLng([v.lat, v.lng])
        markersRef.current[v.id].setIcon(icon)
        markersRef.current[v.id].setPopupContent(popup)
      } else {
        const m = L.marker([v.lat, v.lng], { icon })
          .addTo(map)
          .bindPopup(popup, { maxWidth: 260, className: 'cmd-popup' })
        markersRef.current[v.id] = m
      }
    })
  }, [vehicles])

  useEffect(() => () => {
    instanceRef.current?.remove()
    instanceRef.current = null
  }, [])

  return <div ref={mapRef} style={{ height, width: '100%' }} />
}
