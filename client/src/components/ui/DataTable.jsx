import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

export default function DataTable({ columns, data, keyField = 'id', emptyMessage = 'No data available' }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (col) => {
    if (!col.sortable) return
    if (sortKey === col.key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(col.key)
      setSortDir('asc')
    }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map(col => (
              <th
                key={col.key}
                className={`text-left py-3 px-4 text-xs font-semibold text-content-secondary uppercase tracking-wide whitespace-nowrap
                  ${col.sortable ? 'cursor-pointer select-none hover:text-content-primary transition-colors' : ''}`}
                onClick={() => handleSort(col)}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && (
                    <span className="text-content-muted">
                      {sortKey === col.key
                        ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        : <ChevronsUpDown size={12} />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-content-secondary text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <motion.tr
                  key={row[keyField] || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.03 }}
                  className="border-b border-surface-border last:border-0 hover:bg-gray-50/50 transition-colors group"
                >
                  {columns.map(col => (
                    <td key={col.key} className="py-3.5 px-4 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : (
                        <span className="text-content-primary">{row[col.key] ?? '—'}</span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}
