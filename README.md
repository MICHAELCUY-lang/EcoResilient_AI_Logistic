# EcoResilient Logistics AI 🚛🌿

> **Reduce delays, optimize fleet efficiency, and cut carbon emissions using AI-powered logistics intelligence.**

A production-quality, full-stack logistics intelligence dashboard built for a hackathon — designed to feel like software used at a billion-dollar company.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-latest-purple?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

---

## 📸 Screenshots

| Dashboard | Live Tracking | AI Prediction |
|---|---|---|
| KPI cards + Leaflet map + chart | Real-road truck movement + alert feed | XGBoost-inspired scoring engine |

---

## ✨ Features

### 🗺️ Live Fleet Tracking (flagship feature)
- **Real road routing** via [OSRM](https://router.project-osrm.org/) public API
- **Physics-based movement**: `distance = (speed_km_h / 3.6) × dt_seconds` — trucks move at the exact displayed speed
- **Single source of truth**: speed in sidebar cards, popups, and map marker badge all read from the same engine object
- **60fps animation** via `requestAnimationFrame` — zero React re-renders for marker updates
- **Traffic simulation** every 10 s — speed randomly adjusts, status badge updates, ETA recalculates live
- **Auto-rerouting**: when a truck reaches its destination, it pauses 3 s then picks a new destination and fetches a new OSRM route
- Custom **SVG truck icons** — green / amber / red / blue, bearing-rotated, with live speed badge
- **Dashed colored route polylines** per vehicle status

### 📊 Dashboard
- 6 live KPI cards updating every 5 s
- 7-day delivery trend line chart (Recharts)
- Shipment status donut chart
- Carbon trend area chart (actual vs target)
- Fleet map (Leaflet, Jakarta Metro Area)
- Risk alerts table

### 🤖 AI Prediction Engine
- Simulated **XGBoost / Logistic Regression** scoring
- Inputs: origin, destination, vehicle type, cargo weight, weather, traffic
- Outputs: delay probability %, ETA, CO₂ estimate, route distance
- Feature importance bars with weighted formula display

### 🏭 Hub Monitor
- SVG ring charts for critical hub capacity
- Sortable table with capacity progress bars, delay risk badges

### 🌱 Sustainability Analytics
- Monthly CO₂ saved vs actual bar chart
- Fuel efficiency trend line vs target
- Eco-action recommendation cards

### 📄 Reports
- Download PDF, XLSX, CSV (functional browser download)
- Date range picker + report history log

### ⚙️ Settings
- Profile, Notifications, Appearance (dark/light mode), Security tabs

---

## 🏗️ Architecture

```
EcoResilient/
├── client/                         ← React + Vite + Tailwind
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── LiveTracking.jsx    ← uses useFleetSimulation
│       │   ├── AIPrediction.jsx
│       │   ├── HubMonitor.jsx
│       │   ├── Sustainability.jsx
│       │   ├── Reports.jsx
│       │   └── Settings.jsx
│       ├── hooks/
│       │   └── useFleetSimulation.js  ← rAF loop + traffic sim + OSRM routing
│       ├── components/
│       │   ├── layout/             ← Sidebar, Topbar, AppLayout
│       │   ├── map/
│       │   │   └── RoadFollowingMap.jsx  ← Leaflet, reads from hook via callbacks
│       │   ├── ui/                 ← KPICard, ChartCard, DataTable, StatusBadge
│       │   └── charts/             ← Recharts wrappers
│       ├── services/
│       │   └── routingService.js   ← OSRM API + linear fallback
│       ├── utils/
│       │   ├── distanceUtils.js    ← haversine, interpolation, bearing, ETA
│       │   ├── movementEngine.js   ← createEngine / tickEngine / applyTraffic
│       │   ├── truckIcon.js        ← SVG icon factory + popup builder
│       │   └── predictionEngine.js ← AI scoring logic
│       ├── store/
│       │   └── useAppStore.js      ← Zustand global state
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       └── data/                   ← mock JSON data
└── server/                         ← Node.js + Express + Socket.io
    ├── index.js
    └── routes/                     ← shipments, vehicles, hubs, predictions, sustainability
```

---

## ⚡ Speed Synchronization System

The core innovation of the tracking page is the physics-based movement engine:

### Formula
```
speed_km_h → speed_m_s = speed / 3.6
distance per frame = speed_m_s × dt_seconds
```

### Data Flow
```
useFleetSimulation (single source of truth)
    │
    ├─► React state (500ms)  → VehicleCard (speed, ETA, status)
    │
    └─► markerCbsRef (60fps) → Leaflet marker.setLatLng()
                                         marker.setIcon()  ← speed badge
                                         popup content     ← live speed
```

### Traffic Simulation (every 10s)
```js
multiplier = random(0.25, 1.20)
speed      = baseSpeed × multiplier
status:  ≥ 0.80 → 'normal'
         ≥ 0.45 → 'warning'
          < 0.45 → 'delayed'
ETA recalculates automatically from remainingMeters / speed
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ecoresilient-logistics-ai.git
cd ecoresilient-logistics-ai

# Install root dependencies (concurrently)
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### Running the development server

```bash
# From the project root — starts both frontend and backend simultaneously
npm run dev
```

| Service | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend (Express) | http://localhost:3001 |

### Demo credentials
```
Email:    admin@blibli.com
Password: demo1234
```
*(Any credentials will work for demo purposes)*

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| State management | Zustand |
| Animation | Framer Motion |
| Charts | Recharts |
| Map | Leaflet.js (vanilla) |
| Road routing | OSRM public API |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Mock data | JSON files |

---

## 🗺️ Routing Details

The app uses the [OSRM public routing API](https://router.project-osrm.org) to fetch real road coordinates:

```
GET https://router.project-osrm.org/route/v1/driving/{lng},{lat};{lng},{lat}
    ?overview=full&geometries=geojson
```

- Returns GeoJSON LineString with real road waypoints
- Subsampled to ~90 points per route for performance
- Falls back to **linear interpolation** if OSRM is unreachable

### Demo Routes
| Vehicle | Route | Speed |
|---|---|---|
| VH-001 | Jakarta Pusat → Bekasi | 58 km/h |
| VH-002 | Bekasi → Cikarang | 22 km/h (delayed) |
| VH-003 | Tangerang → Jakarta Barat | 41 km/h (warning) |
| VH-004 | Depok → Jakarta Selatan | 67 km/h |
| VH-005 | Jakarta Utara → Cakung | 15 km/h (delayed) |
| VH-006 | Jakarta Barat → Tangerang | 73 km/h |

---

## 📊 Simulated Business Impact

| Metric | Value |
|---|---|
| Delivery delay reduction | 18% |
| Fuel cost savings | 12% |
| SLA on-time improvement | 21% |
| Carbon emission reduction | 16% |
| AI prediction accuracy | 97% confidence |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👥 Team

Built for the **Software Engineering Hackathon 2026**.

> *"Logistics intelligence that moves as fast as your business."*
