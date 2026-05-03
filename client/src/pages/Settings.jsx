import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Palette, Shield, Save, Check } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'security', icon: Shield, label: 'Security' },
]

export default function Settings() {
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [notifSettings, setNotifSettings] = useState({
    delays: true,
    highCarbon: true,
    hubCapacity: true,
    weeklyReport: false,
    smsAlerts: false,
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success('Settings saved successfully')
  }

  return (
    <PageWrapper>
      <div className="p-6 max-w-[800px] mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-content-primary">Settings</h2>
          <p className="text-sm text-content-secondary mt-0.5">Manage your account and preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Tab list */}
          <div className="w-44 flex-shrink-0">
            <nav className="space-y-0.5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-content-secondary hover:bg-gray-50 hover:text-content-primary'
                  }`}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {activeTab === 'profile' && (
              <div className="card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-content-primary">Profile Information</h3>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl gradient-blue flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AP</span>
                  </div>
                  <div>
                    <button className="btn-secondary text-xs py-1.5">Change photo</button>
                    <p className="text-[10px] text-content-muted mt-1">JPG, PNG max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <input className="input-field" defaultValue="Logistics Manager" readOnly />
                  </div>
                  <div>
                    <label className="label">Department</label>
                    <input className="input-field" defaultValue="Operations" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? <span className="animate-spin">⟳</span> : <Save size={14} />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-content-primary">Notification Preferences</h3>
                <div className="space-y-3">
                  {Object.entries({
                    delays: 'Delay alerts (threshold: 30+ min)',
                    highCarbon: 'High carbon output warnings',
                    hubCapacity: 'Hub capacity alerts (>85%)',
                    weeklyReport: 'Weekly performance digest',
                    smsAlerts: 'SMS alerts for critical events',
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between py-2.5 border-b border-surface-border last:border-0">
                      <div>
                        <p className="text-sm text-content-primary">{label}</p>
                      </div>
                      <button
                        onClick={() => setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          notifSettings[key] ? 'bg-brand-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          notifSettings[key] ? 'translate-x-4' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save size={14} /> Save Preferences
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-content-primary">Appearance</h3>

                <div>
                  <label className="label">Theme</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      { id: 'light', label: 'Light', desc: 'Clean, bright interface' },
                      { id: 'dark', label: 'Dark', desc: 'Easy on the eyes' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => { if ((t.id === 'dark') !== isDark) toggleTheme() }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          (t.id === 'dark') === isDark
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-surface-border hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-content-primary">{t.label}</span>
                          {(t.id === 'dark') === isDark && <Check size={13} className="text-brand-600" />}
                        </div>
                        <p className="text-xs text-content-secondary">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Dashboard Density</label>
                  <select className="input-field">
                    <option>Comfortable (default)</option>
                    <option>Compact</option>
                    <option>Spacious</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-content-primary">Security Settings</h3>

                <div className="space-y-3">
                  <div>
                    <label className="label">Current Password</label>
                    <input className="input-field" type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="label">New Password</label>
                    <input className="input-field" type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="label">Confirm Password</label>
                    <input className="input-field" type="password" placeholder="••••••••" />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-content-primary">Two-Factor Authentication</p>
                    <p className="text-xs text-content-muted mt-0.5">Add an extra layer of security</p>
                  </div>
                  <button className="btn-secondary text-xs py-1.5">Enable 2FA</button>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Shield size={14} /> Update Security
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
