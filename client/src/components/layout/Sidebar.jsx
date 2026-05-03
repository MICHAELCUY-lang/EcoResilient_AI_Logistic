import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, MapPin, Brain, Warehouse, Leaf,
  FileText, Settings, ChevronLeft, ChevronRight, Truck, Zap
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tracking', icon: MapPin, label: 'Live Tracking' },
  { to: '/prediction', icon: Brain, label: 'Prediction AI' },
  { to: '/hubs', icon: Warehouse, label: 'Hub Monitor' },
  { to: '/sustainability', icon: Leaf, label: 'Sustainability' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex-shrink-0 bg-white border-r border-surface-border flex flex-col h-screen sticky top-0 overflow-hidden z-20"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-surface-border flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg gradient-green flex items-center justify-center flex-shrink-0">
            <Truck size={14} className="text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-sm text-content-primary whitespace-nowrap overflow-hidden"
              >
                EcoResilient
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${sidebarCollapsed ? 'justify-center' : ''}`
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon size={17} strokeWidth={1.8} className="flex-shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden text-sm"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Live status */}
      {!sidebarCollapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-eco-green-light">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eco-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-eco-green"></span>
            </span>
            <span className="text-xs font-semibold text-eco-green">System Live</span>
          </div>
          <p className="text-[10px] text-eco-green/70 mt-1 leading-tight">6 vehicles tracked · Real-time data</p>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="border-t border-surface-border p-2">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center h-8 rounded-xl hover:bg-gray-50 text-content-secondary transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  )
}
