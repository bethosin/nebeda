import { apiRequest } from './api'

function createCheckoutSession(orderId) {
  return apiRequest('/payments/create-checkout-session', {
    body: { orderId },
    method: 'POST',
  })
}

export { createCheckoutSession }
