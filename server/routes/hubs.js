import express from 'express'
const router = express.Router()

const hubs = [
  { id: 'HUB-001', name: 'Jakarta Pusat Hub', city: 'Jakarta', volume: 1842, capacity: 2000, capacityPct: 92, delayRisk: 'high', status: 'critical' },
  { id: 'HUB-002', name: 'Bekasi Distribution Center', city: 'Bekasi', volume: 1234, capacity: 1800, capacityPct: 69, delayRisk: 'medium', status: 'warning' },
  { id: 'HUB-003', name: 'Tangerang Hub', city: 'Tangerang', volume: 876, capacity: 1500, capacityPct: 58, delayRisk: 'low', status: 'normal' },
  { id: 'HUB-004', name: 'Depok Sorting Center', city: 'Depok', volume: 645, capacity: 1200, capacityPct: 54, delayRisk: 'low', status: 'normal' },
  { id: 'HUB-005', name: 'Cikarang Logistics Park', city: 'Cikarang', volume: 1560, capacity: 1600, capacityPct: 97, delayRisk: 'high', status: 'critical' },
  { id: 'HUB-006', name: 'Cakung East Hub', city: 'Jakarta Timur', volume: 432, capacity: 900, capacityPct: 48, delayRisk: 'low', status: 'normal' },
]

router.get('/', (req, res) => res.json(hubs))
router.get('/:id', (req, res) => {
  const h = hubs.find(x => x.id === req.params.id)
  h ? res.json(h) : res.status(404).json({ error: 'Not found' })
})

export default router
