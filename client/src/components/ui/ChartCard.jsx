import { motion } from 'framer-motion'

export default function ChartCard({ title, subtitle, children, action, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`card p-5 flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-content-primary">{title}</h3>
          {subtitle && <p className="text-xs text-content-secondary mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </motion.div>
  )
}
