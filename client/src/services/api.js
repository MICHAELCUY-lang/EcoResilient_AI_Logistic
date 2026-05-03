import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  res => res.data,
  err => {
    console.warn('[API Error]', err.message)
    // Return null gracefully — frontend uses mock data as fallback
    return null
  }
)

export const shipmentApi = {
  getAll: () => api.get('/shipments'),
  getById: (id) => api.get(`/shipments/${id}`),
  getTrend: () => api.get('/shipments/trend'),
}

export const vehicleApi = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
}

export const hubApi = {
  getAll: () => api.get('/hubs'),
  getById: (id) => api.get(`/hubs/${id}`),
}

export const predictionApi = {
  predict: (data) => api.post('/predictions', data),
}

export const sustainabilityApi = {
  getMetrics: () => api.get('/sustainability'),
  getMonthly: () => api.get('/sustainability/monthly'),
}

export default api
