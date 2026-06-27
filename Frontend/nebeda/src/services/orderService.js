import { apiRequest, getItem, getList } from './api'

function normalizeOrderItem(data) {
  return {
    ...data,
    order: getItem(data, 'order'),
  }
}

function normalizeOrderList(data) {
  return {
    ...data,
    orders: getList(data, 'orders'),
  }
}

function createOrder(payload) {
  return apiRequest('/orders', {
    body: payload,
    method: 'POST',
  }).then(normalizeOrderItem)
}

function getMyOrders() {
  return apiRequest('/orders/my-orders').then(normalizeOrderList)
}

function getMyOrderById(id) {
  return apiRequest(`/orders/my-orders/${id}`).then(normalizeOrderItem)
}

function getAdminOrders(params) {
  return apiRequest('/orders/admin', { params }).then(normalizeOrderList)
}

function getAdminOrderById(id) {
  return apiRequest(`/orders/admin/${id}`).then(normalizeOrderItem)
}

function updateAdminOrderStatus(id, payload) {
  return apiRequest(`/orders/admin/${id}/status`, {
    body: payload,
    method: 'PATCH',
  }).then(normalizeOrderItem)
}

function updateAdminPaymentStatus(id, payload) {
  return apiRequest(`/orders/admin/${id}/payment-status`, {
    body: payload,
    method: 'PATCH',
  }).then(normalizeOrderItem)
}

function updateAdminOrder(id, payload) {
  return apiRequest(`/orders/admin/${id}`, {
    body: payload,
    method: 'PUT',
  }).then(normalizeOrderItem)
}

function archiveAdminOrder(id) {
  return apiRequest(`/orders/admin/${id}`, { method: 'DELETE' }).then(normalizeOrderItem)
}

export {
  archiveAdminOrder,
  createOrder,
  getAdminOrderById,
  getAdminOrders,
  getMyOrderById,
  getMyOrders,
  updateAdminOrder,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
}
