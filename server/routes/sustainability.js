import express from 'express'
const router = express.Router()

router.get('/', (req, res) => res.json({
  carbonSaved: 18.4,
  fuelSaved: 312,
  ecoRoutePct: 67,
  treesEquivalent: 5,
  totalCarbon: 109,
}))

router.get('/monthly', (req, res) => res.json([
  { month: 'Nov', carbon: 210, saved: 18 },
  { month: 'Dec', carbon: 198, saved: 22 },
  { month: 'Jan', carbon: 185, saved: 31 },
  { month: 'Feb', carbon: 172, saved: 38 },
  { month: 'Mar', carbon: 161, saved: 45 },
  { month: 'Apr', carbon: 148, saved: 52 },
  { month: 'May', carbon: 132, saved: 61 },
]))

export default router
