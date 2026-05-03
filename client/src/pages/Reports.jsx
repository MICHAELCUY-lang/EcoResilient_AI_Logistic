import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, FileSpreadsheet, Package, Calendar, Clock, CheckCircle } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import toast from 'react-hot-toast'

const reportTypes = [
  {
    id: 'pdf',
    icon: FileText,
    title: 'Executive PDF Report',
    desc: 'Full logistics performance summary with charts, KPIs, and sustainability metrics',
    size: '2.4 MB',
    color: 'text-eco-red',
    bg: 'bg-eco-red-light',
    btnColor: 'bg-eco-red hover:bg-red-700',
    format: 'PDF',
  },
  {
    id: 'excel',
    icon: FileSpreadsheet,
    title: 'Excel Data Export',
    desc: 'Raw shipment data, vehicle logs, hub metrics — ready for analysis',
    size: '1.8 MB',
    color: 'text-eco-green',
    bg: 'bg-eco-green-light',
    btnColor: 'bg-eco-green hover:bg-green-700',
    format: 'XLSX',
  },
  {
    id: 'shipment',
    icon: Package,
    title: 'Shipment Detail CSV',
    desc: 'All shipments with routes, ETA, status, carbon output, and driver info',
    size: '856 KB',
    color: 'text-brand-600',
    bg: 'bg-eco-blue-light',
    btnColor: 'bg-brand-600 hover:bg-brand-700',
    format: 'CSV',
  },
]

const recentReports = [
  { id: 'R-001', name: 'Monthly Logistics Report — April 2026', type: 'PDF', date: 'May 1, 2026', size: '2.1 MB', status: 'ready' },
  { id: 'R-002', name: 'Carbon Audit Q1 2026', type: 'PDF', date: 'Apr 3, 2026', size: '1.7 MB', status: 'ready' },
  { id: 'R-003', name: 'Fleet Performance — March 2026', type: 'XLSX', date: 'Apr 1, 2026', size: '3.2 MB', status: 'ready' },
  { id: 'R-004', name: 'Shipment Data Export — March 2026', type: 'CSV', date: 'Mar 31, 2026', size: '1.1 MB', status: 'ready' },
  { id: 'R-005', name: 'Hub Capacity Analysis — Q1 2026', type: 'PDF', date: 'Mar 28, 2026', size: '0.9 MB', status: 'ready' },
]

function generateCSV() {
  const rows = [
    ['Shipment ID', 'Origin', 'Destination', 'Status', 'ETA', 'Carbon (kg)'],
    ['SHP-10234', 'Jakarta Pusat', 'Bekasi', 'On Time', '14:32', '2.4'],
    ['SHP-10235', 'Tangerang', 'Depok', 'Delayed', '16:15', '8.7'],
    ['SHP-10236', 'Bekasi', 'Cikarang', 'On Time', '13:50', '1.8'],
  ]
  return rows.map(r => r.join(',')).join('\n')
}

export default function Reports() {
  const [downloading, setDownloading] = useState(null)
  const [dateFrom, setDateFrom] = useState('2026-04-01')
  const [dateTo, setDateTo] = useState('2026-05-03')

  const handleDownload = async (report) => {
    setDownloading(report.id)
    toast.loading(`Generating ${report.format} report...`, { id: 'dl' })
    await new Promise(r => setTimeout(r, 1500))

    if (report.id === 'shipment') {
      const blob = new Blob([generateCSV()], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ecoresilient_shipments.csv'
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // For PDF/Excel, trigger a placeholder text download
      const content = `EcoResilient Logistics AI — ${report.title}\nGenerated: ${new Date().toLocaleString()}\nPeriod: ${dateFrom} to ${dateTo}\n\n[This is a demo export from EcoResilient Logistics AI]\n\nKey Metrics:\n- Total Shipments: 440\n- On-Time Rate: 96.1%\n- Carbon Today: 109 kg CO2\n- Fuel Efficiency: 88%\n- Active Hubs: 6`
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ecoresilient_report.${report.format.toLowerCase()}`
      a.click()
      URL.revokeObjectURL(url)
    }

    toast.success(`${report.format} report downloaded!`, { id: 'dl' })
    setDownloading(null)
  }

  return (
    <PageWrapper>
      <div className="p-6 space-y-6 max-w-[960px] mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-content-primary">Reports</h2>
          <p className="text-sm text-content-secondary mt-0.5">Export logistics data and generate compliance reports</p>
        </div>

        {/* Date range */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 flex flex-wrap items-center gap-4"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-content-secondary">
            <Calendar size={14} />
            Report Period:
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="input-field text-xs py-1.5 w-36"
            />
            <span className="text-xs text-content-muted">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="input-field text-xs py-1.5 w-36"
            />
          </div>
          <button className="btn-secondary text-xs py-1.5">Apply Range</button>
        </motion.div>

        {/* Download cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportTypes.map((report, i) => {
            const Icon = report.icon
            const isLoading = downloading === report.id
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card p-5 flex flex-col gap-4"
              >
                <div className={`w-10 h-10 rounded-2xl ${report.bg} flex items-center justify-center`}>
                  <Icon size={20} className={report.color} />
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-content-primary">{report.title}</h3>
                  <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">{report.desc}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-content-muted">
                  <span>{report.format} · {report.size}</span>
                </div>

                <button
                  id={`download-${report.id}`}
                  onClick={() => handleDownload(report)}
                  disabled={!!downloading}
                  className={`flex items-center justify-center gap-2 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${report.btnColor}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={13} />
                      Download {report.format}
                    </>
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Recent reports */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="px-5 pt-5 pb-3 border-b border-surface-border">
            <h3 className="text-sm font-semibold text-content-primary">Report History</h3>
            <p className="text-xs text-content-secondary mt-0.5">Previously generated reports</p>
          </div>
          <div className="divide-y divide-surface-border">
            {recentReports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  {report.type === 'PDF' ? <FileText size={14} className="text-eco-red" /> :
                   report.type === 'XLSX' ? <FileSpreadsheet size={14} className="text-eco-green" /> :
                   <Package size={14} className="text-brand-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-content-primary truncate">{report.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-content-muted flex items-center gap-1">
                      <Clock size={9} /> {report.date}
                    </span>
                    <span className="text-[10px] text-content-muted">{report.size}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-content-muted">{report.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-eco-green">
                  <CheckCircle size={12} />
                  <span className="hidden sm:inline">Ready</span>
                </div>
                <button className="text-brand-600 hover:text-brand-700 transition-colors">
                  <Download size={15} />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
