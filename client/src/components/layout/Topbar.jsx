import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Sun, Moon, ChevronDown, LogOut, User, Settings, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ title }) {
  const { notifications, markNotificationRead, searchQuery, setSearchQuery } = useAppStore()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AP'

  return (
    <header className="h-14 bg-white border-b border-surface-border flex items-center px-5 gap-4 flex-shrink-0 sticky top-0 z-10">
      {/* Title */}
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-content-primary">{title}</h1>
      </div>

      {/* Search */}
      <div className="relative hidden sm:flex items-center">
        <Search size={14} className="absolute left-3 text-content-muted" />
        <input
          type="text"
          placeholder="Search shipments, vehicles..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-8 pr-4 py-1.5 text-xs rounded-xl border border-surface-border bg-gray-50 
                     text-content-primary placeholder-content-muted focus:outline-none focus:ring-2 
                     focus:ring-brand-600 focus:ring-opacity-20 focus:border-brand-600 focus:bg-white
                     transition-all w-52"
        />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-50 text-content-secondary transition-colors"
        title="Toggle theme"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setShowNotif(v => !v); setShowProfile(false) }}
          className="relative w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-50 text-content-secondary transition-colors"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-eco-red rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotif && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 w-80 card shadow-modal z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                <span className="text-sm font-semibold text-content-primary">Notifications</span>
                <span className="text-xs text-content-muted">{unreadCount} unread</span>
              </div>
              <div className="divide-y divide-surface-border max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${!n.read ? 'bg-brand-50/30' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      n.type === 'danger' ? 'bg-eco-red' : n.type === 'warning' ? 'bg-eco-amber' : 'bg-eco-green'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-content-primary leading-relaxed">{n.text}</p>
                      <span className="text-[10px] text-content-muted">{n.time}</span>
                    </div>
                    {n.read && <Check size={12} className="text-eco-green flex-shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => { setShowProfile(v => !v); setShowNotif(false) }}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg gradient-blue flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">{initials}</span>
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-content-primary leading-tight">{user?.name}</div>
            <div className="text-[10px] text-content-muted leading-tight">{user?.role}</div>
          </div>
          <ChevronDown size={12} className="text-content-muted hidden sm:block" />
        </button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 w-48 card shadow-modal z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-surface-border">
                <div className="text-xs font-semibold text-content-primary">{user?.name}</div>
                <div className="text-[10px] text-content-muted mt-0.5">{user?.email}</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate('/settings'); setShowProfile(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-content-secondary hover:bg-gray-50 transition-colors"
                >
                  <Settings size={13} /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-eco-red hover:bg-eco-red-light transition-colors"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
