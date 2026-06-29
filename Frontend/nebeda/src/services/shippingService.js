import { apiRequest } from './api'

function getShippingOptions() {
  return apiRequest('/shipping/options').then((response) => response.data)
}

function getShippingQuote(payload) {
  return apiRequest('/shipping/quote', {
    body: payload,
    method: 'POST',
  }).then((response) => response.data)
}

export { getShippingOptions, getShippingQuote }
