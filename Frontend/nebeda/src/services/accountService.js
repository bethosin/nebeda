import { apiRequest, getItem, getList } from './api'

function getAccountDashboard() {
  return apiRequest('/users/dashboard').then((data) => ({
    ...data,
    dashboard: data?.data || {},
  }))
}

function getMyOrders() {
  return apiRequest('/orders/my-orders').then((data) => ({
    ...data,
    orders: getList(data, 'orders'),
  }))
}

function getMyOrderById(id) {
  return apiRequest(`/orders/my-orders/${id}`).then((data) => ({
    ...data,
    order: getItem(data, 'order'),
  }))
}

function getMyCustomOrders() {
  return apiRequest('/custom-orders/my-orders').then((data) => ({
    ...data,
    orders: getList(data, 'orders'),
  }))
}

function getMyCustomOrderById(id) {
  return apiRequest(`/custom-orders/my-orders/${id}`).then((data) => ({
    ...data,
    order: getItem(data, 'order'),
  }))
}

function updateProfile(data) {
  return apiRequest('/users/profile', {
    body: data,
    method: 'PUT',
  }).then((response) => ({
    ...response,
    user: getItem(response, 'user'),
  }))
}

function changePassword(data) {
  return apiRequest('/users/change-password', {
    body: data,
    method: 'PUT',
  })
}

export {
  changePassword,
  getAccountDashboard,
  getMyCustomOrderById,
  getMyCustomOrders,
  getMyOrderById,
  getMyOrders,
  updateProfile,
}
