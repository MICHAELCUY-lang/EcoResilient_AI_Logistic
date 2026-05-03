import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, MapPin, Truck, Weight, Cloud, Car, ArrowRight, Loader,
  AlertTriangle, CheckCircle, Leaf, Clock, Route, ChevronRight, Info
} from 'lucide-react'
import { predictDelay } from '../utils/predictionEngine'
import PageWrapper from '../components/layout/PageWrapper'
import StatusBadge from '../components/ui/StatusBadge'
import toast from 'react-hot-toast'

const cities = ['Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara', 'Jakarta Selatan',
  'Bekasi', 'Tangerang', 'Depok', 'Bogor', 'Cikarang', 'Cakung']

const vehicleTypes = [
  { value: 'motorcycle', label: 'Motorcycle', emoji: '🏍️' },
  { value: 'van', label: 'Van / Box', emoji: '🚐' },
  { value: 'truck', label: 'Truck', emoji: '🚛' },
  { value: 'heavy-truck', label: 'Heavy Truck', emoji: '🚚' },
]

const weatherOptions = [
  { value: 'clear', label: 'Clear', emoji: '☀️' },
  { value: 'cloudy', label: 'Cloudy', emoji: '⛅' },
  { value: 'rainy', label: 'Rainy', emoji: '🌧️' },
  { value: 'heavy-rain', label: 'Heavy Rain', emoji: '⛈️' },
  { value: 'foggy', label: 'Foggy', emoji: '🌫️' },
]

const trafficOptions = [
  { value: 'light', label: 'Light', emoji: '🟢' },
  { value: 'moderate', label: 'Moderate', emoji: '🟡' },
  { value: 'heavy', label: 'Heavy', emoji: '🟠' },
  { value: 'very-heavy', label: 'Very Heavy', emoji: '🔴' },
]

function SelectField({ label, id, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} className="input-field bg-white appearance-none">
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map(o => (
          <option key={o.value || o} value={o.value || o}>
            {o.emoji ? `${o.emoji} ${o.label}` : o.label || o}
          </option>
        ))}
      </select>
    </div>
  )
}

function ResultCard({ result }) {
  const riskColor = result.riskLevel === 'high' ? 'red' : result.riskLevel === 'medium' ? 'amber' : 'green'
  const probColor = result.delayProbability >= 60 ? 'text-eco-red' : result.delayProbability >= 30 ? 'text-eco-amber' : 'text-eco-green'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Main result */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-content-primary">Prediction Result</h3>
            <p className="text-xs text-content-secondary">Model confidence: {result.confidence}%</p>
          </div>
          <StatusBadge label={`${result.riskLevel} risk`} color={riskColor} dot />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3.5 text-center">
            <div className={`text-3xl font-bold ${probColor}`}>{result.delayProbability}%</div>
            <div className="text-xs text-content-secondary mt-0.5">Delay Probability</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3.5 text-center">
            <div className="text-3xl font-bold text-content-primary">{result.eta}</div>
            <div className="text-xs text-content-secondary mt-0.5">Estimated Arrival</div>
          </div>
          <div className="bg-eco-green-light rounded-xl p-3.5 text-center">
            <div className="text-2xl font-bold text-eco-green">{result.carbonEstimate} kg</div>
            <div className="text-xs text-eco-green/70 mt-0.5">CO₂ Estimate</div>
          </div>
          <div className="bg-brand-50 rounded-xl p-3.5 text-center">
            <div className="text-2xl font-bold text-brand-600">{result.distance} km</div>
            <div className="text-xs text-brand-600/70 mt-0.5">Route Distance</div>
          </div>
        </div>

        {/* Best route */}
        <div className="flex items-start gap-2.5 p-3 bg-eco-green-light rounded-xl">
          <Route size={15} className="text-eco-green flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-eco-green">Recommended Route</div>
            <div className="text-xs text-eco-green/80 mt-0.5">{result.bestRoute}</div>
          </div>
        </div>
      </div>

      {/* Feature weights */}
      <div className="card p-5">
        <h4 className="text-xs font-semibold text-content-secondary uppercase tracking-wide mb-3">Feature Importance</h4>
        <div className="space-y-2.5">
          {result.features.map(f => (
            <div key={f.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-content-secondary">{f.name}</span>
                <span className={`font-semibold ${
                  f.impact === 'high' ? 'text-eco-red' : f.impact === 'medium' ? 'text-eco-amber' : 'text-content-muted'
                }`}>{f.weight}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    f.impact === 'high' ? 'bg-eco-red' : f.impact === 'medium' ? 'bg-eco-amber' : 'bg-brand-600'
                  }`}
                  style={{ width: `${f.weight}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card p-5">
        <h4 className="text-xs font-semibold text-content-secondary uppercase tracking-wide mb-3">AI Recommendations</h4>
        <div className="space-y-2.5">
          {result.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
              <span className="text-base leading-none flex-shrink-0">{r.icon}</span>
              <p className="text-xs text-content-secondary leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function AIPrediction() {
  const [form, setForm] = useState({
    origin: 'Jakarta Pusat',
    destination: 'Bekasi',
    vehicleType: 'van',
    weight: '850',
    weather: 'clear',
    traffic: 'moderate',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const setField = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }))

  const handlePredict = async (e) => {
    e.preventDefault()
    if (form.origin === form.destination) {
      toast.error('Origin and destination must be different')
      return
    }
    setLoading(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 1200)) // simulate ML inference
    const prediction = predictDelay(form)
    setResult(prediction)
    setLoading(false)
    toast.success('Prediction complete — model confidence 94%')
  }

  return (
    <PageWrapper>
      <div className="p-6 max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl gradient-blue flex items-center justify-center flex-shrink-0">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-content-primary">Delay Prediction Engine</h2>
            <p className="text-sm text-content-secondary mt-0.5">
              Simulated XGBoost/Logistic Regression scoring model — predicts delay probability, ETA, and CO₂ output
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <form onSubmit={handlePredict} className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-content-primary">Shipment Parameters</h3>

              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Origin"
                  id="pred-origin"
                  value={form.origin}
                  onChange={setField('origin')}
                  options={cities.map(c => ({ value: c, label: c }))}
                />
                <SelectField
                  label="Destination"
                  id="pred-dest"
                  value={form.destination}
                  onChange={setField('destination')}
                  options={cities.map(c => ({ value: c, label: c }))}
                />
              </div>

              <SelectField
                label="Vehicle Type"
                id="pred-vehicle"
                value={form.vehicleType}
                onChange={setField('vehicleType')}
                options={vehicleTypes}
              />

              <div>
                <label className="label">Cargo Weight (kg)</label>
                <div className="relative">
                  <Weight size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
                  <input
                    id="pred-weight"
                    type="number"
                    min="1"
                    max="10000"
                    value={form.weight}
                    onChange={e => setField('weight')(e.target.value)}
                    className="input-field pl-9"
                    placeholder="e.g. 850"
                  />
                </div>
              </div>

              <SelectField
                label="Weather Conditions"
                id="pred-weather"
                value={form.weather}
                onChange={setField('weather')}
                options={weatherOptions}
              />

              <SelectField
                label="Traffic Conditions"
                id="pred-traffic"
                value={form.traffic}
                onChange={setField('traffic')}
                options={trafficOptions}
              />

              <button
                id="predict-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={15} className="animate-spin" />
                    Running model inference...
                  </>
                ) : (
                  <>
                    <Brain size={15} />
                    Run Prediction
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Model info */}
            <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-brand-50 rounded-xl">
              <Info size={13} className="text-brand-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-brand-700 leading-relaxed">
                Scoring model uses weighted feature inputs (traffic 45%, weather 30%, load 25%) — inspired by XGBoost gradient boosting for logistics delay classification.
              </p>
            </div>
          </motion.div>

          {/* Result */}
          <div>
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card p-8 flex flex-col items-center justify-center gap-4 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center">
                    <Brain size={22} className="text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-content-primary">Running inference...</p>
                    <p className="text-xs text-content-secondary mt-1">Processing 6 feature weights</p>
                  </div>
                  <div className="w-full max-w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-600 rounded-full animate-pulse w-3/4" />
                  </div>
                </motion.div>
              )}

              {!loading && result && (
                <motion.div key="result">
                  <ResultCard result={result} />
                </motion.div>
              )}

              {!loading && !result && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card p-8 flex flex-col items-center justify-center gap-3 text-center border-dashed"
                  style={{ minHeight: '300px' }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <Brain size={22} className="text-content-muted" />
                  </div>
                  <p className="text-sm font-medium text-content-secondary">Configure parameters and run the model</p>
                  <p className="text-xs text-content-muted">Results will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
