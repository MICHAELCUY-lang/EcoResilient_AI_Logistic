import { useState } from 'react'
import { motion } from 'framer-motion'
import { Warehouse, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import PageWrapper from '../components/layout/PageWrapper'
import DataTable from '../components/ui/DataTable'
import StatusBadge from '../components/ui/StatusBadge'
import ProgressBar from '../components/ui/ProgressBar'

const columns = [
  { key: 'name', label: 'Hub Name', sortable: true, render: (val) => <span className="font-medium text-content-primary text-xs">{val}</span> },
  { key: 'city', label: 'City', sortable: true, render: (val) => <span className="text-xs text-content-secondary">{val}</span> },
  {
    key: 'volume', label: 'Volume', sortable: true,
    render: (val, row) => (
      <span className="text-xs">
        <span className="font-semibold text-content-primary">{val.toLocaleString()}</span>
        <span className="text-content-muted"> / {row.capacity.toLocaleString()}</span>
      </span>
    )
  },
  {
    key: 'capacityPct', label: 'Capacity', sortable: true,
    render: (val) => (
      <div className="w-28">
        <ProgressBar value={val} showLabel size="sm" />
      </div>
    )
  },
  {
    key: 'delayRisk', label: 'Delay Risk', sortable: true,
    render: (val) => (
      <StatusBadge
        label={val.charAt(0).toUpperCase() + val.slice(1)}
        color={val === 'high' ? 'red' : val === 'medium' ? 'amber' : 'green'}
        dot
        size="xs"
      />
    )
  },
  {
    key: 'status', label: 'Status',
    render: (val) => (
      <StatusBadge
        label={val.charAt(0).toUpperCase() + val.slice(1)}
        color={val === 'critical' ? 'red' : val === 'warning' ? 'amber' : 'green'}
      />
    )
  },
  {
    key: 'avgProcessTime', label: 'Avg Process', sortable: true,
    render: (val) => <span className="text-xs text-content-secondary">{val} min</span>
  },
]

function HubCard({ hub, index }) {
  const pct = hub.capacityPct
  const color = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#16A34A'
  const circumference = 2 * Math.PI * 30
  const offset = circumference - (pct / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-content-primary leading-tight">{hub.name}</h3>
          <p className="text-xs text-content-secondary mt-0.5">{hub.city}</p>
        </div>
        <StatusBadge
          label={hub.status.charAt(0).toUpperCase() + hub.status.slice(1)}
          color={hub.status === 'critical' ? 'red' : hub.status === 'warning' ? 'amber' : 'green'}
          dot
          size="xs"
        />
      </div>

      {/* Ring chart */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg width="72" height="72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#F1F5F9" strokeWidth="6" />
            <circle
              cx="36" cy="36" r="30" fill="none" stroke={color}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 36 36)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-content-primary">{pct}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-content-muted">Volume</span>
            <span className="font-semibold text-content-primary">{hub.volume.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-content-muted">Inbound</span>
            <span className="font-semibold text-eco-green">+{hub.inbound}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-content-muted">Outbound</span>
            <span className="font-semibold text-brand-600">-{hub.outbound}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-content-muted">Staff</span>
            <span className="font-semibold text-content-primary">{hub.staff}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function HubMonitor() {
  const { hubs } = useAppStore()
  const criticalHubs = hubs.filter(h => h.capacityPct >= 80).slice(0, 3)

  return (
    <PageWrapper>
      <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-content-primary">Hub Monitor</h2>
            <p className="text-sm text-content-secondary mt-0.5">{hubs.length} distribution centers · Real-time capacity tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-eco-red" />
            <span className="text-xs font-semibold text-eco-red">
              {hubs.filter(h => h.status === 'critical').length} Critical
            </span>
          </div>
        </div>

        {/* Critical hubs */}
        <div>
          <h3 className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-3">⚠️ High Priority Hubs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criticalHubs.map((hub, i) => <HubCard key={hub.id} hub={hub} index={i} />)}
          </div>
        </div>

        {/* All hubs table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-surface-border">
            <div>
              <h3 className="text-sm font-semibold text-content-primary">All Hubs</h3>
              <p className="text-xs text-content-secondary mt-0.5">Sortable · Updates every 10 seconds</p>
            </div>
            <button className="btn-secondary flex items-center gap-1.5 text-xs py-1.5">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <DataTable
            columns={columns}
            data={hubs}
            keyField="id"
            emptyMessage="No hubs found"
          />
        </motion.div>
      </div>
    </PageWrapper>
  )
}
