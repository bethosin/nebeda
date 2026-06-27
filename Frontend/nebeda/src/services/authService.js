import { apiRequest } from './api'

function storeAdminSession(data) {
  localStorage.setItem('nebedaAdminToken', data.token)
  localStorage.setItem('nebedaAdmin', JSON.stringify(data.admin))
  localStorage.setItem('nebedaAdminAuth', 'true')
}

async function loginAdmin(email, password) {
  const data = await apiRequest('/auth/login', {
    body: { email, password },
    method: 'POST',
  })

  storeAdminSession(data)
  return data
}

async function getCurrentAdmin() {
  return apiRequest('/auth/me')
}

function logoutAdmin() {
  localStorage.removeItem('nebedaAdminToken')
  localStorage.removeItem('nebedaAdmin')
  localStorage.removeItem('nebedaAdminAuth')
}

function isAdminAuthenticated() {
  return (
    localStorage.getItem('nebedaAdminAuth') === 'true' &&
    Boolean(localStorage.getItem('nebedaAdminToken'))
  )
}

export { getCurrentAdmin, isAdminAuthenticated, loginAdmin, logoutAdmin }
