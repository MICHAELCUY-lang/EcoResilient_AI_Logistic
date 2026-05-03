export const mockShipments = [
  { id: 'SHP-10234', origin: 'Jakarta Pusat', destination: 'Bekasi', status: 'on-time', weight: 12.5, vehicle: 'VH-001', eta: '14:32', carbon: 2.4 },
  { id: 'SHP-10235', origin: 'Tangerang', destination: 'Depok', status: 'delayed', weight: 45.0, vehicle: 'VH-002', eta: '16:15', carbon: 8.7 },
  { id: 'SHP-10236', origin: 'Bekasi', destination: 'Cikarang', status: 'on-time', weight: 8.2, vehicle: 'VH-003', eta: '13:50', carbon: 1.8 },
  { id: 'SHP-10237', origin: 'Jakarta Barat', destination: 'Tangerang', status: 'warning', weight: 22.0, vehicle: 'VH-004', eta: '15:00', carbon: 4.2 },
  { id: 'SHP-10238', origin: 'Depok', destination: 'Jakarta Selatan', status: 'on-time', weight: 5.5, vehicle: 'VH-006', eta: '13:48', carbon: 1.1 },
  { id: 'SHP-10239', origin: 'Cakung', destination: 'Jakarta Pusat', status: 'delayed', weight: 78.0, vehicle: 'VH-005', eta: '17:00', carbon: 14.6 },
]

export const deliveryTrendData = [
  { date: 'Apr 27', onTime: 312, delayed: 28, total: 340 },
  { date: 'Apr 28', onTime: 298, delayed: 42, total: 340 },
  { date: 'Apr 29', onTime: 345, delayed: 21, total: 366 },
  { date: 'Apr 30', onTime: 389, delayed: 31, total: 420 },
  { date: 'May 1', onTime: 401, delayed: 19, total: 420 },
  { date: 'May 2', onTime: 378, delayed: 44, total: 422 },
  { date: 'May 3', onTime: 423, delayed: 17, total: 440 },
]

export const shipmentStatusData = [
  { name: 'On Time', value: 68, color: '#16A34A' },
  { name: 'Delayed', value: 18, color: '#EF4444' },
  { name: 'Warning', value: 9, color: '#F59E0B' },
  { name: 'In Transit', value: 5, color: '#2563EB' },
]

export const carbonTrendData = [
  { date: 'Apr 27', carbon: 142, target: 130 },
  { date: 'Apr 28', carbon: 138, target: 130 },
  { date: 'Apr 29', carbon: 127, target: 130 },
  { date: 'Apr 30', carbon: 121, target: 130 },
  { date: 'May 1', carbon: 118, target: 130 },
  { date: 'May 2', carbon: 115, target: 130 },
  { date: 'May 3', carbon: 109, target: 130 },
]
