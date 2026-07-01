import { apiRequest } from './api'

function getEmailLogs(params = {}) {
  return apiRequest('/email-logs/admin', { params }).then((data) => ({
    ...data,
    logs: data.logs || [],
    templates: data.templates || [],
  }))
}

function retryEmailLog(id) {
  return apiRequest(`/email-logs/admin/${id}/retry`, { method: 'POST' })
}

export { getEmailLogs, retryEmailLog }
