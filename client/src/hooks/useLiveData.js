import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

/**
 * useLiveData — drives all simulated real-time updates
 * Runs KPI ticks every 5s, vehicle movement every 3s, alerts every 20s
 */
export function useLiveData() {
  const { tickKPIs, tickVehicles, addRandomAlert } = useAppStore()

  useEffect(() => {
    const kpiInterval = setInterval(tickKPIs, 5000)
    const vehicleInterval = setInterval(tickVehicles, 3000)
    const alertInterval = setInterval(addRandomAlert, 20000)

    return () => {
      clearInterval(kpiInterval)
      clearInterval(vehicleInterval)
      clearInterval(alertInterval)
    }
  }, [tickKPIs, tickVehicles, addRandomAlert])
}
