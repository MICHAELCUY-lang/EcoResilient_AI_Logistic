import { motion } from 'framer-motion'
import {
  Package, AlertTriangle, CheckCircle, Leaf, Fuel, Warehouse, ExternalLink
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import PageWrapper from '../components/layout/PageWrapper'
import KPICard from '../components/ui/KPICard'
import ChartCard from '../components/ui/ChartCard'
import StatusBadge from '../components/ui/StatusBadge'
import DataTable from '../components/ui/DataTable'
import LiveMap from '../components/map/LiveMap'
import DeliveryTrendChart from '../components/charts/DeliveryTrendChart'
import CarbonTrendChart from '../components/charts/CarbonTrendChart'
import ShipmentDonutChart from '../components/charts/ShipmentDonutChart'
import { getRiskColor, formatNumber } from '../utils/formatters'
import { Link } from 'react-router-dom'

const alertColumns = [
  { key: 'shipmentId', label: 'Shipment ID', sortable: true },
  { key: 'route', label: 'Route' },
  {
    key: 'riskLevel', label: 'Risk Level', sortable: true,
    render: (val) => {
      const c = getRiskColor(val)
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </span>
      )
    }
  },
  { key: 'issue', label: 'Issue', render: (val) => <span className="text-xs text-content-secondary max-w-[280px] truncate block">{val}</span> },
  {
    key: 'time', label: 'Time',
    render: (val) => <span className="text-xs text-content-muted">{val}</span>
  },
]

export default function Dashboard() {
  const { kpis, alerts } = useAppStore()

  const kpiCards = [
    {
      title: 'Total Shipments Today',
      value: formatNumber(kpis.totalShipments),
      icon: Package,
      color: 'blue',
      trend: 'up',
      trendValue: '+12 today',
    },
    {
      title: 'Delayed Orders',
      value: formatNumber(kpis.delayedOrders),
      icon: AlertTriangle,
      color: 'red',
      trend: 'down',
      trendValue: '-3 vs yesterday',
    },
    {
      title: 'On-Time Rate',
      value: `${kpis.onTimeRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'green',
      trend: 'up',
      trendValue: '+0.4%',
    },
    {
      title: 'Carbon Today',
      value: `${kpis.carbonToday.toFixed(0)}`,
      unit: 'kg CO₂',
      icon: Leaf,
      color: 'green',
      trend: 'down',
      trendValue: '-16% vs target',
    },
    {
      title: 'Fuel Efficiency',
      value: `${kpis.fuelEfficiency.toFixed(0)}%`,
      icon: Fuel,
      color: 'blue',
      trend: 'up',
      trendValue: '+8% YTD',
    },
    {
      title: 'Active Hubs',
      value: formatNumber(kpis.activeHubs),
      unit: 'online',
      icon: Warehouse,
      color: 'purple',
    },
  ]

  return (
    <PageWrapper>
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpiCards.map((kpi, i) => (
            <KPICard key={kpi.title} {...kpi} index={i} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Delivery Performance"
            subtitle="On-time vs delayed, last 7 days"
            className="lg:col-span-2"
          >
            <DeliveryTrendChart />
          </ChartCard>

          <ChartCard title="Shipment Status" subtitle="Distribution today">
            <ShipmentDonutChart />
          </ChartCard>
        </div>

        {/* Map + Carbon chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card p-4 xl:col-span-2"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-content-primary">Fleet Map</h3>
                <p className="text-xs text-content-secondary mt-0.5">Jakarta Metro Area · 6 vehicles active</p>
              </div>
              <Link
                to="/tracking"
                className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"
              >
                Full map <ExternalLink size={12} />
              </Link>
            </div>
            <LiveMap height="320px" showHubs compact />
          </motion.div>

          <ChartCard title="Carbon Trend" subtitle="Actual vs daily target (kg CO₂)">
            <CarbonTrendChart />
          </ChartCard>
        </div>

        {/* Risk Alert Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-surface-border">
            <div>
              <h3 className="text-sm font-semibold text-content-primary">Risk Alerts</h3>
              <p className="text-xs text-content-secondary mt-0.5">Active shipment risks — updating live</p>
            </div>
            <StatusBadge label={`${alerts.filter(a => a.riskLevel === 'high').length} High Risk`} color="red" dot />
          </div>
          <DataTable
            columns={alertColumns}
            data={alerts}
            emptyMessage="No active alerts — all systems nominal ✓"
          />
        </motion.div>
      </div>
    </PageWrapper>
  )
}
