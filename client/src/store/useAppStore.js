import { create } from 'zustand'
import { initialVehicles } from '../data/mockVehicles'
import { mockHubs } from '../data/mockHubs'
import { mockAlerts } from '../data/mockAlerts'
import { jitter, randomInt } from '../utils/formatters'

export const useAppStore = create((set, get) => ({
  // KPI state
  kpis: {
    totalShipments: 440,
    delayedOrders: 17,
    onTimeRate: 96.1,
    carbonToday: 109,
    fuelEfficiency: 88,
    activeHubs: 6,
  },

  // Vehicles
  vehicles: initialVehicles,

  // Hubs
  hubs: mockHubs,

  // Alerts
  alerts: mockAlerts,

  // Notifications
  notifications: [
    { id: 'N1', text: 'VH-005 fuel critical — 33% remaining', time: '2m ago', type: 'danger', read: false },
    { id: 'N2', text: 'Cikarang Hub at 97% capacity', time: '8m ago', type: 'warning', read: false },
    { id: 'N3', text: 'New SLA target achieved: 96.1%', time: '1h ago', type: 'success', read: true },
  ],

  // Sidebar collapse
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  // Search
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Mark notification read
  markNotificationRead: (id) =>
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    })),

  // Simulate live KPI updates
  tickKPIs: () => set(state => ({
    kpis: {
      totalShipments: state.kpis.totalShipments + randomInt(0, 3),
      delayedOrders: Math.max(0, state.kpis.delayedOrders + randomInt(-1, 2)),
      onTimeRate: Math.min(99.9, Math.max(85, jitter(state.kpis.onTimeRate, 0.3))),
      carbonToday: Math.max(80, jitter(state.kpis.carbonToday, 1.5)),
      fuelEfficiency: Math.min(99, Math.max(70, jitter(state.kpis.fuelEfficiency, 0.5))),
      activeHubs: state.kpis.activeHubs,
    },
  })),

  // Simulate vehicle movement
  tickVehicles: () => set(state => ({
    vehicles: state.vehicles.map(v => ({
      ...v,
      lat: jitter(v.lat, 0.003),
      lng: jitter(v.lng, 0.003),
      speed: Math.max(0, jitter(v.speed, 5)),
      carbon: Math.max(0, jitter(v.carbon, 0.5)),
    })),
  })),

  // Add a random new alert occasionally
  addRandomAlert: () => {
    const templates = [
      { issue: 'Hub Bekasi approaching capacity threshold (89%)', riskLevel: 'medium' },
      { issue: 'New traffic incident on Tol Jakarta-Cikampek KM 22', riskLevel: 'high' },
      { issue: 'Weather advisory: fog expected in Cikarang area', riskLevel: 'medium' },
    ]
    const t = templates[randomInt(0, templates.length - 1)]
    const newAlert = {
      id: `ALT-${Date.now()}`,
      shipmentId: `SHP-${randomInt(10200, 10299)}`,
      route: 'Auto-detected route',
      time: 'just now',
      vehicle: `VH-00${randomInt(1, 6)}`,
      ...t,
    }
    set(state => ({
      alerts: [newAlert, ...state.alerts].slice(0, 10),
    }))
  },
}))
