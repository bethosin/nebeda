import { apiRequest, getItem } from './api'

const USER_TOKEN_KEY = 'nebedaUserToken'
const USER_KEY = 'nebedaUser'

function notifyUserAuthChanged() {
  window.dispatchEvent(new Event('nebedaUserAuthChanged'))
}

function storeUserSession(data) {
  if (data.token) localStorage.setItem(USER_TOKEN_KEY, data.token)
  if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  notifyUserAuthChanged()
}

function getStoredUser() {
  const storedUser = localStorage.getItem(USER_KEY)
  return storedUser ? JSON.parse(storedUser) : null
}

function isUserAuthenticated() {
  return Boolean(localStorage.getItem(USER_TOKEN_KEY))
}

function logoutUser() {
  localStorage.removeItem(USER_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  notifyUserAuthChanged()
}

function signupUser(payload) {
  return apiRequest('/users/signup', {
    body: payload,
    method: 'POST',
  }).then((data) => {
    storeUserSession(data)
    return data
  })
}

function loginUser(payload) {
  return apiRequest('/users/login', {
    body: payload,
    method: 'POST',
  }).then((data) => {
    storeUserSession(data)
    return data
  })
}

function verifyEmail(token) {
  return apiRequest('/users/verify-email', {
    body: { token },
    method: 'POST',
  }).then((data) => {
    if (data.user) storeUserSession(data)
    return data
  })
}

function resendVerificationEmail() {
  return apiRequest('/users/resend-verification', { method: 'POST' })
}

function forgotPassword(email) {
  return apiRequest('/users/forgot-password', {
    body: { email },
    method: 'POST',
  })
}

function resetPassword(token, password) {
  return apiRequest('/users/reset-password', {
    body: { token, password },
    method: 'POST',
  })
}
function getCurrentUser() {
  return apiRequest('/users/me').then((data) => {
    const user = getItem(data, 'user')
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      notifyUserAuthChanged()
    }
    return { ...data, user }
  })
}

function getAdminUsers(params) {
  return apiRequest('/users/admin', { params }).then((data) => ({
    ...data,
    users: data?.data || data?.users || [],
  }))
}

function updateAdminUserStatus(id, isActive) {
  return apiRequest(`/users/admin/${id}/status`, {
    body: { isActive },
    method: 'PUT',
  }).then((data) => ({
    ...data,
    user: getItem(data, 'user'),
  }))
}

export {
  forgotPassword,
  getCurrentUser,
  getAdminUsers,
  getStoredUser,
  isUserAuthenticated,
  loginUser,
  logoutUser,
  resendVerificationEmail,
  resetPassword,
  signupUser,
  updateAdminUserStatus,
  verifyEmail,
}
