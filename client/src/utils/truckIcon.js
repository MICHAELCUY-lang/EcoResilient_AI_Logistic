import L from 'leaflet'

/**
 * Per-status colour tokens for truck SVG icons.
 */
const PALETTE = {
  normal:  { body: '#16A34A', stroke: '#15803D', glow: 'rgba(22,163,74,0.25)' },
  warning: { body: '#D97706', stroke: '#B45309', glow: 'rgba(217,119,6,0.25)' },
  delayed: { body: '#DC2626', stroke: '#B91C1C', glow: 'rgba(220,38,38,0.3)'  },
  eco:     { body: '#2563EB', stroke: '#1D4ED8', glow: 'rgba(37,99,235,0.25)' },
}

/**
 * Build a Leaflet divIcon containing a clean truck SVG.
 * @param {'normal'|'warning'|'delayed'|'eco'} status
 * @param {boolean} isSelected  — renders a blue ring when true
 */
export function createTruckIcon(status = 'normal', isSelected = false) {
  const { body, stroke, glow } = PALETTE[status] || PALETTE.normal

  const outerRing = isSelected
    ? `<circle cx="19" cy="19" r="17" fill="none" stroke="#2563EB" stroke-width="2" stroke-dasharray="4 2"/>`
    : ''

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
  <defs>
    <filter id="drop-${status}" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="${glow}"/>
    </filter>
  </defs>

  <!-- white background circle -->
  <circle cx="19" cy="19" r="15.5" fill="white" stroke="${body}" stroke-width="1.5"
          filter="url(#drop-${status})"/>
  ${outerRing}

  <!-- truck cab (right side, facing right) -->
  <rect x="21" y="12" width="9"  height="10" rx="1.5" fill="${body}"/>
  <!-- cab window -->
  <rect x="22" y="12.5" width="6" height="5" rx="0.5" fill="white" fill-opacity="0.65"/>
  <!-- headlight -->
  <rect x="29.5" y="16.5" width="1.5" height="2" rx="0.3" fill="white" fill-opacity="0.9"/>

  <!-- cargo body -->
  <rect x="8"  y="14" width="14" height="8" rx="1.5" fill="${body}"/>
  <!-- cargo detail lines -->
  <line x1="12" y1="14" x2="12" y2="22" stroke="white" stroke-width="0.5" stroke-opacity="0.4"/>
  <line x1="16" y1="14" x2="16" y2="22" stroke="white" stroke-width="0.5" stroke-opacity="0.4"/>

  <!-- wheels -->
  <circle cx="12.5" cy="23.5" r="2.8" fill="white" stroke="${stroke}" stroke-width="1.5"/>
  <circle cx="12.5" cy="23.5" r="1.1" fill="${body}"/>
  <circle cx="25.5" cy="23.5" r="2.8" fill="white" stroke="${stroke}" stroke-width="1.5"/>
  <circle cx="25.5" cy="23.5" r="1.1" fill="${body}"/>
</svg>`

  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  })
}

/**
 * Build the HTML content for a Leaflet popup.
 */
export function buildPopupHtml(info) {
  const palette = PALETTE[info.status] || PALETTE.normal
  const statusLabel = {
    normal: 'On Track', warning: 'Warning', delayed: 'Delayed', eco: 'Eco EV',
  }[info.status] || info.status

  return `
<div style="font-family:Inter,system-ui,sans-serif;width:220px;padding:14px;font-size:12px;color:#0F172A">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
    <div style="display:flex;align-items:center;gap:7px">
      <span style="width:8px;height:8px;border-radius:50%;background:${palette.body};display:inline-block;flex-shrink:0"></span>
      <span style="font-weight:700;font-size:13px;letter-spacing:.03em">${info.vehicleId}</span>
    </div>
    <span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;
      background:${palette.body}18;border:1px solid ${palette.body}40;color:${palette.body}">
      ${statusLabel}
    </span>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
    ${tile('Speed',  `${info.speed} km/h`, palette.body)}
    ${tile('ETA',    info.eta,             '#0F172A')}
    ${tile('CO₂',   `${info.carbon} kg`,  '#16A34A')}
    ${tile('Fuel',  `${info.fuel}%`,      info.fuel > 40 ? '#16A34A' : '#DC2626')}
  </div>

  <div style="font-size:11px;color:#64748B;padding-top:8px;border-top:1px solid #F1F5F9">
    👤 ${info.driver}<br/>
    🛣️ ${info.from} → ${info.to}<br/>
    📦 ${info.cargo} · ${info.weight} kg
  </div>
</div>`
}

function tile(label, value, color) {
  return `
    <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px;padding:6px 8px;text-align:center">
      <div style="font-weight:700;font-size:13px;color:${color};line-height:1.2">${value}</div>
      <div style="font-size:9px;color:#94A3B8;margin-top:2px;text-transform:uppercase;letter-spacing:.06em">${label}</div>
    </div>`
}
