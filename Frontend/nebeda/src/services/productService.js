import { apiRequest, getItem, getList } from './api'

function normalizeProductList(data) {
  return {
    ...data,
    products: getList(data, 'products'),
  }
}

function normalizeProductItem(data) {
  return {
    ...data,
    product: getItem(data, 'product'),
  }
}

function getProducts(params) {
  return apiRequest('/products', { params }).then(normalizeProductList)
}

function getAdminProducts(params) {
  return apiRequest('/products/admin/all', { params }).then(normalizeProductList)
}

function getAdminProductById(id) {
  return apiRequest(`/products/admin/${id}`).then(normalizeProductItem)
}

function createProduct(formData) {
  return apiRequest('/products', {
    body: formData,
    method: 'POST',
  })
}

function updateProduct(id, formData) {
  return apiRequest(`/products/${id}`, {
    body: formData,
    method: 'PUT',
  }).then(normalizeProductItem)
}

function deleteProduct(id) {
  return apiRequest(`/products/${id}`, { method: 'DELETE' })
}

function restoreProduct(id) {
  return apiRequest(`/products/${id}/restore`, { method: 'PATCH' })
}

function permanentlyDeleteProduct(id) {
  return apiRequest(`/products/${id}/permanent`, { method: 'DELETE' })
}

function deleteProductImage(id, publicId) {
  return apiRequest(`/products/${id}/images`, {
    body: { publicId },
    method: 'DELETE',
  }).then(normalizeProductItem)
}

function getProductById(id) {
  return apiRequest(`/products/${id}`).then(normalizeProductItem)
}

function getProductBySlug(slug) {
  return apiRequest(`/products/slug/${slug}`).then(normalizeProductItem)
}

export {
  createProduct,
  deleteProductImage,
  deleteProduct,
  getAdminProductById,
  getAdminProducts,
  getProductById,
  getProductBySlug,
  getProducts,
  permanentlyDeleteProduct,
  restoreProduct,
  updateProduct,
}
