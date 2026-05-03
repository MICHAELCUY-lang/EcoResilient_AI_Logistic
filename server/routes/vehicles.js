import express from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const router = express.Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const vehicles = JSON.parse(readFileSync(join(__dirname, '../data/vehicles.json')))

router.get('/', (req, res) => res.json(vehicles))
router.get('/:id', (req, res) => {
  const v = vehicles.find(x => x.id === req.params.id)
  v ? res.json(v) : res.status(404).json({ error: 'Not found' })
})

export default router
