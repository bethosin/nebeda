const API_BASE_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '')

if (!API_BASE_URL) {
  throw new Error('VITE_API_URL is required. Add it to Frontend/nebeda/.env.')
}

const isFormData = (body) => body instanceof FormData

function buildUrl(endpoint, params) {
  const url = new URL(`${API_BASE_URL}${endpoint}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }

  return url.toString()
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return null
}

async function apiRequest(endpoint, options = {}) {
  const { body, headers = {}, params, ...rest } = options
  const isCustomerEndpoint =
    endpoint.startsWith('/users') ||
    endpoint === '/orders' ||
    endpoint.startsWith('/orders/my-orders') ||
    endpoint.startsWith('/payments') ||
    endpoint === '/custom-orders' ||
    endpoint.startsWith('/custom-orders/my-orders')
  const isAdminEndpoint = endpoint.includes('/admin') || endpoint.startsWith('/dashboard')
  const token = isCustomerEndpoint && !isAdminEndpoint
    ? localStorage.getItem('nebedaUserToken')
    : localStorage.getItem('nebedaAdminToken')
  const requestHeaders = { ...headers }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  if (body && !isFormData(body)) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  const response = await fetch(buildUrl(endpoint, params), {
    ...rest,
    body: body && !isFormData(body) ? JSON.stringify(body) : body,
    headers: requestHeaders,
  })
  const data = await parseResponse(response)

  if (!response.ok) {
    if (response.status === 401) {
      if (isCustomerEndpoint && !isAdminEndpoint) {
        localStorage.removeItem('nebedaUserToken')
        localStorage.removeItem('nebedaUser')
        window.dispatchEvent(new Event('nebedaUserAuthChanged'))
      } else {
        localStorage.removeItem('nebedaAdminToken')
        localStorage.removeItem('nebedaAdmin')
        localStorage.removeItem('nebedaAdminAuth')
      }
    }

    const error = new Error(data?.message || 'Something went wrong. Please try again.')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

function getList(data, key) {
  return data?.data || data?.[key] || []
}

function getItem(data, key) {
  return data?.data || data?.[key] || null
}

export { API_BASE_URL, apiRequest, getItem, getList }
