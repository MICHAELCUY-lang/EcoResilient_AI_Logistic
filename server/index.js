import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import shipmentsRouter from './routes/shipments.js'
import vehiclesRouter from './routes/vehicles.js'
import hubsRouter from './routes/hubs.js'
import predictionsRouter from './routes/predictions.js'
import sustainabilityRouter from './routes/sustainability.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
})

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Routes
app.use('/api/shipments', shipmentsRouter)
app.use('/api/vehicles', vehiclesRouter)
app.use('/api/hubs', hubsRouter)
app.use('/api/predictions', predictionsRouter)
app.use('/api/sustainability', sustainabilityRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), service: 'EcoResilient Logistics API' })
})

// Socket.io — real-time vehicle updates
const vehiclesData = JSON.parse((await import('fs')).default.readFileSync(
  new URL('./data/vehicles.json', import.meta.url)
))

function jitter(val, amt) {
  return val + (Math.random() - 0.5) * amt * 2
}

setInterval(() => {
  vehiclesData.forEach(v => {
    v.lat = jitter(v.lat, 0.003)
    v.lng = jitter(v.lng, 0.003)
    v.speed = Math.max(0, jitter(v.speed, 5))
  })
  io.emit('vehicles:update', vehiclesData)
}, 3000)

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  socket.emit('vehicles:update', vehiclesData)
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`))
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`\n✅ EcoResilient API running on http://localhost:${PORT}`)
  console.log(`📡 Socket.io ready`)
})
