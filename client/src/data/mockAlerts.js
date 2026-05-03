export const mockAlerts = [
  { id: 'ALT-001', shipmentId: 'SHP-10235', route: 'Tangerang → Depok', riskLevel: 'high', issue: 'Heavy traffic on Tol Serpong, ETA delayed 45 min', time: '2 min ago', vehicle: 'VH-002' },
  { id: 'ALT-002', shipmentId: 'SHP-10239', route: 'Cakung → Jakarta Pusat', riskLevel: 'high', issue: 'Low fuel warning, vehicle carbon output 3x normal', time: '8 min ago', vehicle: 'VH-005' },
  { id: 'ALT-003', shipmentId: 'SHP-10237', route: 'Jakarta Barat → Tangerang', riskLevel: 'medium', issue: 'Hub Tangerang near capacity (97%), reroute suggested', time: '15 min ago', vehicle: 'VH-004' },
  { id: 'ALT-004', shipmentId: 'SHP-10234', route: 'Jakarta Pusat → Bekasi', riskLevel: 'low', issue: 'Minor delay at Jakarta Timur checkpoint', time: '22 min ago', vehicle: 'VH-001' },
  { id: 'ALT-005', shipmentId: 'SHP-10236', route: 'Bekasi → Cikarang', riskLevel: 'low', issue: 'Weather advisory: light rain expected at destination', time: '31 min ago', vehicle: 'VH-003' },
]

export const monthlyCarbonData = [
  { month: 'Nov', carbon: 210, saved: 18 },
  { month: 'Dec', carbon: 198, saved: 22 },
  { month: 'Jan', carbon: 185, saved: 31 },
  { month: 'Feb', carbon: 172, saved: 38 },
  { month: 'Mar', carbon: 161, saved: 45 },
  { month: 'Apr', carbon: 148, saved: 52 },
  { month: 'May', carbon: 132, saved: 61 },
]

export const fuelEfficiencyData = [
  { month: 'Nov', efficiency: 72, target: 80 },
  { month: 'Dec', efficiency: 75, target: 80 },
  { month: 'Jan', efficiency: 78, target: 80 },
  { month: 'Feb', efficiency: 81, target: 80 },
  { month: 'Mar', efficiency: 83, target: 80 },
  { month: 'Apr', efficiency: 86, target: 80 },
  { month: 'May', efficiency: 88, target: 80 },
]
