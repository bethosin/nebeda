import { apiRequest, getItem, getList } from './api'

function normalizeOrderList(data) {
  return {
    ...data,
    orders: getList(data, 'orders'),
  }
}

function normalizeOrderItem(data) {
  return {
    ...data,
    order: getItem(data, 'order'),
  }
}

function createCustomOrder(formData) {
  return apiRequest('/custom-orders', {
    body: formData,
    method: 'POST',
  }).then(normalizeOrderItem)
}

function getAdminCustomOrders(params) {
  return apiRequest('/custom-orders/admin', { params }).then(normalizeOrderList)
}

function getMyCustomOrders() {
  return apiRequest('/custom-orders/my-orders').then(normalizeOrderList)
}

function getMyCustomOrderById(id) {
  return apiRequest(`/custom-orders/my-orders/${id}`).then(normalizeOrderItem)
}

function getAdminCustomOrderById(id) {
  return apiRequest(`/custom-orders/admin/${id}`).then(normalizeOrderItem)
}

function updateCustomOrder(id, data) {
  return apiRequest(`/custom-orders/admin/${id}`, {
    body: data,
    method: 'PUT',
  }).then(normalizeOrderItem)
}

function archiveCustomOrder(id) {
  return apiRequest(`/custom-orders/admin/${id}`, { method: 'DELETE' }).then(normalizeOrderItem)
}

function restoreCustomOrder(id) {
  return apiRequest(`/custom-orders/admin/${id}/restore`, { method: 'PATCH' }).then(
    normalizeOrderItem,
  )
}

export {
  archiveCustomOrder,
  createCustomOrder,
  getAdminCustomOrderById,
  getAdminCustomOrders,
  getMyCustomOrderById,
  getMyCustomOrders,
  restoreCustomOrder,
  updateCustomOrder,
}
