import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Truck, Leaf, Zap, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const features = [
  { icon: Truck, text: 'Real-time fleet tracking across Java' },
  { icon: BarChart3, text: 'AI-powered delay prediction (97% confidence)' },
  { icon: Leaf, text: 'Carbon emission monitoring & reporting' },
  { icon: Zap, text: 'Hub congestion alerts in < 3 seconds' },
]

export default function Login() {
  const [email, setEmail] = useState('admin@blibli.com')
  const [password, setPassword] = useState('demo1234')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter your credentials')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800)) // simulate auth
    login(email, password)
    toast.success('Welcome back, Arif! 👋')
    navigate('/dashboard')
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    login('admin@blibli.com', '')
    toast.success('Signed in with Google 🎉')
    navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-between w-[52%] bg-slate-950 p-12 relative overflow-hidden"
      >
        {/* Subtle grid bg */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        {/* Blue glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-600 opacity-10 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-eco-green opacity-10 blur-[80px]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-green flex items-center justify-center">
            <Truck size={18} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base">EcoResilient</span>
            <span className="text-slate-400 text-xs block">Logistics AI</span>
          </div>
        </div>

        {/* Center illustration area */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-12">
          {/* Abstract route visualization */}
          <div className="relative w-72 h-72 mx-auto mb-8">
            {/* Animated rings */}
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 rounded-full border border-brand-600/20"
            />
            <motion.div
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-4 rounded-full border border-eco-green/20"
            />

            {/* Central truck */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl gradient-blue flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)]">
                <Truck size={44} className="text-white" />
              </div>
            </div>

            {/* Orbiting nodes */}
            {[
              { angle: 0, icon: '📦', label: 'Bekasi', color: '#16A34A' },
              { angle: 72, icon: '🏭', label: 'Cikarang', color: '#2563EB' },
              { angle: 144, icon: '🌿', label: 'Eco Route', color: '#16A34A' },
              { angle: 216, icon: '⚡', label: 'Live AI', color: '#F59E0B' },
              { angle: 288, icon: '🗺️', label: 'Tangerang', color: '#2563EB' },
            ].map((node, i) => {
              const rad = (node.angle * Math.PI) / 180
              const x = 50 + 40 * Math.cos(rad)
              const y = 50 + 40 * Math.sin(rad)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="absolute"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 backdrop-blur border border-slate-700 flex flex-col items-center justify-center gap-0.5 shadow-lg">
                    <span className="text-lg leading-none">{node.icon}</span>
                    <span className="text-[8px] text-slate-400 leading-none">{node.label}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-white leading-tight"
          >
            Smarter Logistics.<br />
            <span className="text-brand-400">Greener Future.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-400 text-sm mt-3 leading-relaxed max-w-xs"
          >
            Reduce delays by 18%, cut emissions by 16%, and optimize your entire fleet with AI-powered logistics intelligence.
          </motion.p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {features.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon size={13} className="text-brand-400" />
              </div>
              <span className="text-sm text-slate-400">{text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right — Login form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-bg"
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl gradient-green flex items-center justify-center">
              <Truck size={15} className="text-white" />
            </div>
            <span className="font-bold text-base text-content-primary">EcoResilient AI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-content-primary">Welcome back</h2>
            <p className="text-sm text-content-secondary mt-1">Sign in to your logistics dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-9"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label" style={{ marginBottom: 0 }}>Password</label>
                <button type="button" className="text-xs text-brand-600 hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-9 pr-9"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-secondary"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 h-10"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign in <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface-bg px-3 text-xs text-content-muted">or continue with</span>
            </div>
          </div>

          <button
            id="login-google"
            onClick={handleGoogle}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2.5 h-10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-content-muted mt-6">
            By signing in, you agree to EcoResilient's{' '}
            <span className="text-brand-600 cursor-pointer hover:underline">Terms of Service</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
