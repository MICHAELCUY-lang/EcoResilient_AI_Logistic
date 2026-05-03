// Simulated predictive scoring engine
// Inspired by XGBoost / Logistic Regression feature weighting

const WEATHER_WEIGHTS = {
  clear: 0,
  cloudy: 0.05,
  rainy: 0.22,
  'heavy-rain': 0.40,
  foggy: 0.18,
  storm: 0.55,
}

const TRAFFIC_WEIGHTS = {
  light: 0,
  moderate: 0.12,
  heavy: 0.28,
  'very-heavy': 0.45,
}

const VEHICLE_EFFICIENCY = {
  motorcycle: { baseCarbon: 0.05, speedFactor: 1.3 },
  van: { baseCarbon: 0.14, speedFactor: 1.0 },
  truck: { baseCarbon: 0.22, speedFactor: 0.75 },
  'heavy-truck': { baseCarbon: 0.34, speedFactor: 0.55 },
}

const CITY_DISTANCES = {
  'Jakarta Pusat-Bekasi': 25,
  'Jakarta Pusat-Tangerang': 30,
  'Jakarta Pusat-Depok': 22,
  'Jakarta Pusat-Cikarang': 40,
  'Bekasi-Cikarang': 20,
  'Bekasi-Depok': 35,
  'Tangerang-Jakarta Barat': 18,
  'Tangerang-Depok': 45,
  'Depok-Jakarta Selatan': 15,
  'Jakarta Utara-Cakung': 22,
}

function getDistance(origin, destination) {
  const key1 = `${origin}-${destination}`
  const key2 = `${destination}-${origin}`
  return CITY_DISTANCES[key1] || CITY_DISTANCES[key2] || 28 + Math.random() * 20
}

function getRouteOptions(origin, destination) {
  const routes = [
    `Tol ${origin} - ${destination} via Inner Ring Road`,
    `Jalan Arteri ${origin} - ${destination} (Eco Route)`,
    `${origin} → TOL JORR → ${destination}`,
  ]
  return routes
}

/**
 * Main prediction function
 * Simulates XGBoost feature scoring with weighted inputs
 */
export function predictDelay({ origin, destination, vehicleType, weight, weather, traffic }) {
  const weatherImpact = WEATHER_WEIGHTS[weather] || 0
  const trafficImpact = TRAFFIC_WEIGHTS[traffic] || 0
  const weightImpact = Math.min((Number(weight) / 1000) * 0.08, 0.25)
  const baseRisk = 0.08

  // Logistic-style scoring
  const rawScore = baseRisk + weatherImpact + trafficImpact + weightImpact
  const delayProbability = Math.min(Math.round(rawScore * 100), 97)

  const distance = getDistance(origin, destination)
  const vehicle = VEHICLE_EFFICIENCY[vehicleType] || VEHICLE_EFFICIENCY.van
  const baseSpeed = 50 * vehicle.speedFactor
  const speedPenalty = 1 + (trafficImpact * 1.5) + (weatherImpact * 0.8)
  const effectiveSpeed = baseSpeed / speedPenalty

  const baseDurationHours = distance / effectiveSpeed
  const now = new Date()
  const etaMs = now.getTime() + baseDurationHours * 3600 * 1000
  const eta = new Date(etaMs).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const carbonKg = vehicle.baseCarbon * distance * (1 + weightImpact * 0.5)
  const carbonEstimate = parseFloat(carbonKg.toFixed(1))

  const routes = getRouteOptions(origin, destination)
  const bestRoute = trafficImpact > 0.25 ? routes[1] : routes[0]

  const recommendations = generateRecommendations(delayProbability, weather, traffic, vehicleType, weight)
  const confidence = Math.round(85 + Math.random() * 10)

  // Feature importance (for display)
  const features = [
    { name: 'Traffic Conditions', weight: Math.round(trafficImpact * 100), impact: trafficImpact > 0.25 ? 'high' : trafficImpact > 0.1 ? 'medium' : 'low' },
    { name: 'Weather Impact', weight: Math.round(weatherImpact * 100), impact: weatherImpact > 0.3 ? 'high' : weatherImpact > 0.1 ? 'medium' : 'low' },
    { name: 'Cargo Weight', weight: Math.round(weightImpact * 100), impact: weightImpact > 0.15 ? 'high' : 'low' },
    { name: 'Base Risk', weight: Math.round(baseRisk * 100), impact: 'low' },
  ]

  return {
    delayProbability,
    eta,
    carbonEstimate,
    distance: Math.round(distance),
    bestRoute,
    allRoutes: routes,
    recommendations,
    confidence,
    features,
    riskLevel: delayProbability >= 60 ? 'high' : delayProbability >= 30 ? 'medium' : 'low',
    estimatedDuration: Math.round(baseDurationHours * 60),
  }
}

function generateRecommendations(delayProb, weather, traffic, vehicleType, weight) {
  const recs = []

  if (traffic === 'heavy' || traffic === 'very-heavy') {
    recs.push({ icon: '🛣️', text: 'Switch to Tol JORR for 23% faster route — saves 18 min average' })
  }

  if (weather === 'rainy' || weather === 'heavy-rain') {
    recs.push({ icon: '☔', text: 'Reduce speed 15 km/h below limit for wet road safety compliance' })
  }

  if (delayProb > 50) {
    recs.push({ icon: '📦', text: 'Split shipment across 2 vehicles to reduce hub congestion impact' })
    recs.push({ icon: '⏰', text: 'Reschedule to off-peak hours (05:00–07:00) for 28% delay reduction' })
  }

  if (vehicleType === 'heavy-truck' || Number(weight) > 1000) {
    recs.push({ icon: '🌿', text: 'Use eco-driving mode: coasting + regenerative strategy reduces CO₂ by 12%' })
  }

  if (recs.length === 0) {
    recs.push({ icon: '✅', text: 'Route looks optimal. Maintain current speed and monitoring cadence.' })
    recs.push({ icon: '🌱', text: 'Activate green routing mode to reduce carbon output by 8%' })
  }

  return recs.slice(0, 4)
}
