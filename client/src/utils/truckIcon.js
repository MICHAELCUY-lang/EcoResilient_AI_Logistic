import L from 'leaflet'

const PALETTE = {
  normal:  { body: '#16A34A', stroke: '#15803D' },
  warning: { body: '#D97706', stroke: '#B45309' },
  delayed: { body: '#DC2626', stroke: '#B91C1C' },
  eco:     { body: '#2563EB', stroke: '#1D4ED8' },
}

/**
 * Custom truck icon with:
 * - Rotated truck silhouette (bearing angle)
 * - Speed badge beneath the icon
 * @param {'normal'|'warning'|'delayed'|'eco'} status
 * @param {number} speed  — km/h, displayed in badge
 * @param {number} bearing — degrees clockwise from north
 */
export function createTruckIcon(status = 'normal', speed = 0, bearing = 0) {
  const { body, stroke } = PALETTE[status] || PALETTE.normal
  const rot = Math.round(bearing)

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="54" viewBox="0 0 38 54">
  <defs>
    <filter id="sh-${status}" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="${body}44"/>
    </filter>
  </defs>

  <!-- bearing-rotated truck group, pivoting around icon centre (19,19) -->
  <g transform="rotate(${rot} 19 19)">
    <circle cx="19" cy="19" r="15.5" fill="white" stroke="${body}" stroke-width="1.5"
            filter="url(#sh-${status})"/>
    <!-- cab (right = forward) -->
    <rect x="21.5" y="12.5" width="8.5" height="9.5" rx="1.5" fill="${body}"/>
    <rect x="22" y="13" width="6" height="5" rx="0.5" fill="white" fill-opacity="0.6"/>
    <rect x="29.5" y="17" width="1.5" height="2" rx="0.4" fill="white" fill-opacity="0.9"/>
    <!-- cargo body -->
    <rect x="9" y="14.5" width="13.5" height="7.5" rx="1.5" fill="${body}"/>
    <line x1="12.5" y1="14.5" x2="12.5" y2="22" stroke="white" stroke-width="0.5" stroke-opacity="0.35"/>
    <line x1="16"   y1="14.5" x2="16"   y2="22" stroke="white" stroke-width="0.5" stroke-opacity="0.35"/>
    <!-- wheels -->
    <circle cx="13" cy="23.5" r="2.7" fill="white" stroke="${stroke}" stroke-width="1.5"/>
    <circle cx="13" cy="23.5" r="1"   fill="${body}"/>
    <circle cx="26" cy="23.5" r="2.7" fill="white" stroke="${stroke}" stroke-width="1.5"/>
    <circle cx="26" cy="23.5" r="1"   fill="${body}"/>
  </g>

  <!-- speed badge (always horizontal, below icon) -->
  <rect x="2" y="40" width="34" height="13" rx="6" fill="${body}"/>
  <text x="19" y="50.5" text-anchor="middle"
        font-family="Inter,ui-sans-serif,system-ui,sans-serif"
        font-size="8.5" font-weight="700" fill="white">${speed} km/h</text>
</svg>`

  return L.divIcon({
    html: svg,
    className: '',
    iconSize:    [38, 54],
    iconAnchor:  [19, 19],   // anchor at centre of truck circle
    popupAnchor: [0, -22],
  })
}

/**
 * Popup HTML — reads from a live engine object so it always shows current values.
 */
export function buildPopupHtml(e) {
  const { body } = PALETTE[e.status] || PALETTE.normal
  const statusLabel = { normal: 'On Track', warning: 'Warning', delayed: 'Delayed', eco: 'Eco EV' }[e.status] ?? e.status

  const tile = (label, value, color) =>
    `<div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px;padding:6px 8px;text-align:center">
       <div style="font-weight:700;font-size:13px;color:${color}">${value}</div>
       <div style="font-size:9px;color:#94A3B8;margin-top:1px;text-transform:uppercase;letter-spacing:.06em">${label}</div>
     </div>`

  return `
<div style="font-family:Inter,system-ui,sans-serif;width:224px;padding:14px;color:#0F172A;font-size:12px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
    <div style="display:flex;align-items:center;gap:7px">
      <span style="width:8px;height:8px;border-radius:50%;background:${body};flex-shrink:0;display:inline-block"></span>
      <span style="font-weight:700;font-size:13px">${e.id}</span>
    </div>
    <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;
      background:${body}1A;border:1px solid ${body}40;color:${body}">${statusLabel}</span>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
    ${tile('Speed',  `${Math.round(e.speed)} km/h`,                  body)}
    ${tile('ETA',    e.eta,                                           '#0F172A')}
    ${tile('CO₂',   `${(e.carbon ?? 0).toFixed(1)} kg`,              '#16A34A')}
    ${tile('Fuel',  `${e.fuel ?? 0}%`, (e.fuel ?? 50) > 40 ? '#16A34A' : '#DC2626')}
  </div>
  <div style="font-size:11px;color:#64748B;padding-top:8px;border-top:1px solid #F1F5F9;line-height:1.9">
    👤 ${e.driver ?? '—'}<br>
    🛣️ ${e.fromName} → ${e.toName}<br>
    📦 ${e.cargo ?? '—'} · ${e.weight ?? '—'} kg
  </div>
</div>`
}
