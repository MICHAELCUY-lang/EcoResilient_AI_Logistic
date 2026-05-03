import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useLiveData } from '../../hooks/useLiveData'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/tracking': 'Live Tracking',
  '/prediction': 'AI Prediction Engine',
  '/hubs': 'Hub Monitor',
  '/sustainability': 'Sustainability',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export default function AppLayout({ children }) {
  const location = useLocation()
  useLiveData() // Start live data simulation

  const title = pageTitles[location.pathname] || 'EcoResilient'

  return (
    <div className="flex h-screen bg-surface-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <div key={location.pathname}>
              {children}
            </div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
