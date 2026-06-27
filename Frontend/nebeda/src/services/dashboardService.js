import { apiRequest } from './api'

function getDashboardStats() {
  return apiRequest('/dashboard/stats')
}

export { getDashboardStats }
