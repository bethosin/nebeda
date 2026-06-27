import { apiRequest, getItem, getList } from './api'

function subscribeNewsletter(data) {
  return apiRequest('/newsletter/subscribe', {
    body: data,
    method: 'POST',
  }).then((response) => ({
    ...response,
    subscriber: getItem(response, 'subscriber'),
  }))
}

function getAdminNewsletterSubscribers(params) {
  return apiRequest('/newsletter/admin', { params }).then((response) => ({
    ...response,
    subscribers: getList(response, 'subscribers'),
  }))
}

function unsubscribeNewsletterSubscriber(id) {
  return apiRequest(`/newsletter/admin/${id}/unsubscribe`, { method: 'PATCH' })
}

function resubscribeNewsletterSubscriber(id) {
  return apiRequest(`/newsletter/admin/${id}/resubscribe`, { method: 'PATCH' })
}

function deleteNewsletterSubscriber(id) {
  return apiRequest(`/newsletter/admin/${id}`, { method: 'DELETE' })
}

export {
  deleteNewsletterSubscriber,
  getAdminNewsletterSubscribers,
  resubscribeNewsletterSubscriber,
  subscribeNewsletter,
  unsubscribeNewsletterSubscriber,
}
