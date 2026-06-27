import { apiRequest, getItem, getList } from './api'

function normalizeEnquiryList(data) {
  return {
    ...data,
    enquiries: getList(data, 'enquiries'),
  }
}

function normalizeEnquiryItem(data) {
  return {
    ...data,
    enquiry: getItem(data, 'enquiry'),
  }
}

function createEnquiry(data) {
  return apiRequest('/enquiries', {
    body: data,
    method: 'POST',
  }).then(normalizeEnquiryItem)
}

function getAdminEnquiries(params) {
  return apiRequest('/enquiries/admin', { params }).then(normalizeEnquiryList)
}

function getAdminEnquiryById(id) {
  return apiRequest(`/enquiries/admin/${id}`).then(normalizeEnquiryItem)
}

function updateEnquiry(id, data) {
  return apiRequest(`/enquiries/admin/${id}`, {
    body: data,
    method: 'PUT',
  }).then(normalizeEnquiryItem)
}

function archiveEnquiry(id) {
  return apiRequest(`/enquiries/admin/${id}`, { method: 'DELETE' }).then(normalizeEnquiryItem)
}

function restoreEnquiry(id) {
  return apiRequest(`/enquiries/admin/${id}/restore`, { method: 'PATCH' }).then(
    normalizeEnquiryItem,
  )
}

export {
  archiveEnquiry,
  createEnquiry,
  getAdminEnquiries,
  getAdminEnquiryById,
  restoreEnquiry,
  updateEnquiry,
}
