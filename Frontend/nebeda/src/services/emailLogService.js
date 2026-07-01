import { apiRequest } from './api'

function getEmailLogs(params = {}) {
  return apiRequest('/email-logs/admin', { params }).then((data) => ({
    ...data,
    logs: data.logs || [],
  }))
}

export { getEmailLogs }
