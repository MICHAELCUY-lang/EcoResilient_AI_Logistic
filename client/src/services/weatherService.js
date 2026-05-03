/** Open-Meteo API — 100% free, no API key required */

const CACHE = new Map()
const TTL   = 10 * 60 * 1000   // 10-minute cache

const WMO = {
  0:  { label: 'Clear',         emoji: '☀️',  delay: 0    },
  1:  { label: 'Mostly Clear',  emoji: '🌤️',  delay: 0    },
  2:  { label: 'Partly Cloudy', emoji: '⛅',  delay: 0    },
  3:  { label: 'Overcast',      emoji: '☁️',  delay: 0    },
  45: { label: 'Foggy',         emoji: '🌫️',  delay: 0.05 },
  48: { label: 'Icy Fog',       emoji: '🌫️',  delay: 0.08 },
  51: { label: 'Light Drizzle', emoji: '🌦️',  delay: 0.06 },
  53: { label: 'Drizzle',       emoji: '🌦️',  delay: 0.08 },
  61: { label: 'Light Rain',    emoji: '🌧️',  delay: 0.10 },
  63: { label: 'Rain',          emoji: '🌧️',  delay: 0.15 },
  65: { label: 'Heavy Rain',    emoji: '🌧️',  delay: 0.22 },
  80: { label: 'Showers',       emoji: '🌦️',  delay: 0.12 },
  81: { label: 'Heavy Showers', emoji: '⛈️',  delay: 0.20 },
  95: { label: 'Thunderstorm',  emoji: '⛈️',  delay: 0.28 },
  99: { label: 'Severe Storm',  emoji: '🌩️',  delay: 0.35 },
}

const FALLBACK = { label: 'Clear', emoji: '☀️', temp: 30, wind: 8, delay: 0 }

function closestCode(code) {
  const keys = Object.keys(WMO).map(Number).sort((a, b) => a - b)
  let best = keys[0]
  for (const k of keys) { if (k <= code) best = k }
  return best
}

export async function fetchWeather(lat, lng) {
  const key = `${lat.toFixed(1)},${lng.toFixed(1)}`
  const hit  = CACHE.get(key)
  if (hit && Date.now() - hit.ts < TTL) return hit.data

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,windspeed_10m,weathercode` +
      `&timezone=Asia%2FJakarta`

    const res  = await fetch(url, { signal: AbortSignal.timeout(6000) })
    const json = await res.json()
    const cur  = json.current

    const wmo  = WMO[closestCode(cur.weathercode)] ?? WMO[0]
    const data = {
      label: wmo.label,
      emoji: wmo.emoji,
      delay: wmo.delay,
      temp:  Math.round(cur.temperature_2m),
      wind:  Math.round(cur.windspeed_10m),
    }

    CACHE.set(key, { ts: Date.now(), data })
    return data
  } catch {
    return FALLBACK
  }
}
