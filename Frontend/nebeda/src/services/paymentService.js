import { apiRequest } from './api'

function createCheckoutSession(orderId) {
  return apiRequest('/payments/create-checkout-session', {
    body: { orderId },
    method: 'POST',
  })
}

function createCustomOrderCheckoutSession(customOrderId) {
  return apiRequest('/payments/create-custom-order-checkout-session', {
    body: { customOrderId },
    method: 'POST',
  })
}

export { createCheckoutSession, createCustomOrderCheckoutSession }
