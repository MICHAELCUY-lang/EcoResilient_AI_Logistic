import L from 'leaflet'

const PALETTE = {
  normal:  { body: '#16A34A', stroke: '#15803D' },
  warning: { body: '#D97706', stroke: '#B45309' },
  delayed: { body: '#DC2626', stroke: '#B91C1C' },
  eco:     { body: '#2563EB', stroke: '#1D4ED8' },
}

/**
 * Create a Leaflet divIcon with:
 *  - Bearing-rotated truck SVG
 *  - Live speed badge beneath
 *  - Optional weather emoji overlay
 *
 * @param {'normal'|'warning'|'delayed'|'eco'} status
 * @param {number} speed    — km/h shown in badge
 * @param {number} bearing  — degrees (0=north, clockwise)
 * @param {string} weatherEmoji — e.g. '🌧️' shown top-right
 */
export function createTruckIcon(status = 'normal', speed = 0, bearing = 0, weatherEmoji = '') {
  const { body, stroke } = PALETTE[status] || PALETTE.normal
  const rot = Math.round(bearing)

  const weatherBadge = weatherEmoji
    ? `<text x="34" y="8" font-size="10" text-anchor="middle">${weatherEmoji}</text>`
    : ''

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="42" height="56" viewBox="0 0 42 56">
  <defs>
    <filter id="sh" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="${body}44"/>
    </filter>
  </defs>

  <!-- truck group rotated around icon centre (21, 21) -->
  <g transform="rotate(${rot} 21 21)">
    <circle cx="21" cy="21" r="17" fill="white" stroke="${body}" stroke-width="1.5" filter="url(#sh)"/>
    <!-- cab -->
    <rect x="23.5" y="13.5" width="9"   height="10" rx="1.5" fill="${body}"/>
    <rect x="24"   y="14"   width="6.5" height="5.5" rx="0.5" fill="white" fill-opacity="0.6"/>
    <rect x="32"   y="18"   width="1.5" height="2"   rx="0.4" fill="white" fill-opacity="0.9"/>
    <!-- cargo -->
    <rect x="10" y="15.5" width="14.5" height="8" rx="1.5" fill="${body}"/>
    <line x1="14" y1="15.5" x2="14" y2="23.5" stroke="white" stroke-width="0.5" stroke-opacity="0.35"/>
    <line x1="18" y1="15.5" x2="18" y2="23.5" stroke="white" stroke-width="0.5" stroke-opacity="0.35"/>
    <!-- wheels -->
    <circle cx="14.5" cy="25" r="3" fill="white" stroke="${stroke}" stroke-width="1.5"/>
    <circle cx="14.5" cy="25" r="1.1" fill="${body}"/>
    <circle cx="28"   cy="25" r="3" fill="white" stroke="${stroke}" stroke-width="1.5"/>
    <circle cx="28"   cy="25" r="1.1" fill="${body}"/>
  </g>

  <!-- weather emoji (top-right, always horizontal) -->
  ${weatherBadge}

  <!-- speed badge (bottom, always horizontal) -->
  <rect x="2" y="42" width="38" height="13" rx="6.5" fill="${body}"/>
  <text x="21" y="52.5"
    font-family="Inter,ui-sans-serif,system-ui,sans-serif"
    font-size="8.5" font-weight="700" fill="white" text-anchor="middle">${speed} km/h</text>
</svg>`

  return L.divIcon({
    html: svg,
    className: '',
    iconSize:    [42, 56],
    iconAnchor:  [21, 21],   // anchor at truck circle centre
    popupAnchor: [0, -24],
  })
}

/** Popup HTML showing all vehicle + weather + ETA data */
export function buildPopupHtml(v) {
  const { body } = PALETTE[v.status] || PALETTE.normal
  const statusLabel = { normal: 'On Track', warning: 'Warning', delayed: 'Delayed', eco: 'Eco EV' }[v.status] ?? v.status

  const tile = (lbl, val, color) => `
    <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px;padding:6px 8px;text-align:center">
      <div style="font-weight:700;font-size:13px;color:${color};line-height:1.2">${val}</div>
      <div style="font-size:9px;color:#94A3B8;margin-top:1px;text-transform:uppercase;letter-spacing:.06em">${lbl}</div>
    </div>`

  const delayRow = v.delayMinutes > 0
    ? `<div style="margin-top:6px;padding:5px 8px;background:#FEF3C7;border-radius:6px;font-size:11px;color:#92400E;font-weight:600">
         ⚠️ +${v.delayMinutes} min delay · ${v.weather?.label ?? ''}
       </div>`
    : ''

  return `
<div style="font-family:Inter,system-ui,sans-serif;width:230px;padding:14px;color:#0F172A;font-size:12px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
    <div style="display:flex;align-items:center;gap:7px">
      <span style="width:8px;height:8px;border-radius:50%;background:${body};display:inline-block"></span>
      <strong style="font-size:13px">${v.id}</strong>
    </div>
    <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;
      background:${body}1A;border:1px solid ${body}40;color:${body}">${statusLabel}</span>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
    ${tile('Speed',  `${Math.round(v.speed)} km/h`,       body)}
    ${tile('ETA',    v.eta,                                '#0F172A')}
    ${tile('CO₂',   `${(v.carbon??0).toFixed(1)} kg`,     '#16A34A')}
    ${tile('Fuel',  `${v.fuel??75}%`, (v.fuel??75) > 40 ? '#16A34A' : '#DC2626')}
  </div>

  <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px;padding:8px;margin-bottom:8px;font-size:11px">
    <div style="font-weight:600;color:#374151;margin-bottom:4px">
      ${v.weather?.emoji ?? '☀️'} Weather: ${v.weather?.label ?? 'Clear'}
    </div>
    <div style="color:#6B7280">
      🌡️ ${v.weather?.temp ?? 30}°C &nbsp;·&nbsp; 💨 ${v.weather?.wind ?? 8} km/h wind
    </div>
    <div style="color:#6B7280">🚦 Traffic: ${v.trafficLabel ?? 'Smooth'}</div>
  </div>

  ${delayRow}

  <div style="font-size:11px;color:#64748B;padding-top:8px;border-top:1px solid #F1F5F9;line-height:1.9">
    👤 ${v.driver ?? '—'} &nbsp;·&nbsp; ${v.plate ?? '—'}<br>
    🛣️ ${v.fromName} → ${v.toName}<br>
    📦 ${v.cargo ?? '—'} · ${v.weight ?? '—'} kg
  </div>
</div>`
}
