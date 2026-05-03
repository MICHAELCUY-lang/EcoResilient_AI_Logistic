import express from 'express'
const router = express.Router()

const WEATHER_W = { clear: 0, cloudy: 0.05, rainy: 0.22, 'heavy-rain': 0.40, foggy: 0.18 }
const TRAFFIC_W = { light: 0, moderate: 0.12, heavy: 0.28, 'very-heavy': 0.45 }

router.post('/', (req, res) => {
  const { origin, destination, vehicleType, weight, weather, traffic } = req.body

  const weatherImpact = WEATHER_W[weather] || 0
  const trafficImpact = TRAFFIC_W[traffic] || 0
  const weightImpact = Math.min((Number(weight) / 1000) * 0.08, 0.25)
  const rawScore = 0.08 + weatherImpact + trafficImpact + weightImpact
  const delayProbability = Math.min(Math.round(rawScore * 100), 97)
  const carbonEstimate = parseFloat((0.14 * 28 * (1 + weightImpact * 0.5)).toFixed(1))
  const confidence = Math.round(85 + Math.random() * 10)
  const riskLevel = delayProbability >= 60 ? 'high' : delayProbability >= 30 ? 'medium' : 'low'

  res.json({ delayProbability, carbonEstimate, confidence, riskLevel, origin, destination })
})

export default router
