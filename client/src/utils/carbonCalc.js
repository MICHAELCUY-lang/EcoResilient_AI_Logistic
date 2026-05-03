// Carbon calculation utilities
export const EMISSION_FACTORS = {
  motorcycle: 0.05,   // kg CO2 per km
  van: 0.14,
  truck: 0.22,
  'heavy-truck': 0.34,
  electric: 0.02,
}

export const FUEL_FACTORS = {
  motorcycle: 0.04,   // liters per km
  van: 0.10,
  truck: 0.18,
  'heavy-truck': 0.28,
  electric: 0,
}

export function calculateCarbon(vehicleType, distanceKm, loadFactor = 1) {
  const factor = EMISSION_FACTORS[vehicleType] || EMISSION_FACTORS.van
  return factor * distanceKm * (1 + (loadFactor - 1) * 0.3)
}

export function calculateFuel(vehicleType, distanceKm) {
  const factor = FUEL_FACTORS[vehicleType] || FUEL_FACTORS.van
  return factor * distanceKm
}

export function carbonToTrees(kgCO2) {
  // 1 mature tree absorbs ~22 kg CO2 per year
  return Math.round(kgCO2 / 22)
}

export function getSustainabilityMetrics(vehicles) {
  const totalCarbon = vehicles.reduce((sum, v) => sum + (v.carbon || 0), 0)
  const ecoVehicles = vehicles.filter(v => v.status === 'normal').length
  const ecoRoutePct = Math.round((ecoVehicles / vehicles.length) * 100)
  const fuelSavedLiters = Math.round(totalCarbon * 0.4)
  const treesEquivalent = carbonToTrees(totalCarbon)

  return {
    totalCarbon: parseFloat(totalCarbon.toFixed(1)),
    carbonSaved: parseFloat((totalCarbon * 0.16).toFixed(1)),
    fuelSaved: fuelSavedLiters,
    ecoRoutePct,
    treesEquivalent,
  }
}
