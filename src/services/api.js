const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getToken() {
  return localStorage.getItem('mw_auth_token')
}

function setToken(token) {
  if (token) localStorage.setItem('mw_auth_token', token)
  else localStorage.removeItem('mw_auth_token')
}

async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {} } = options
  const token = getToken()

  const config = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...headers,
    },
  }
  if (body !== undefined) config.body = JSON.stringify(body)

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  // Handle empty responses (204 No Content, 205 Reset Content)
  if (response.status === 204 || response.status === 205) return null

  const data = await response.json().catch(() => ({ detail: response.statusText }))

  if (!response.ok) {
    // DRF error shapes: { detail }, { non_field_errors: [] }, { field: [] }
    const message =
      data?.detail ||
      data?.non_field_errors?.[0] ||
      Object.values(data || {})?.[0]?.[0] ||
      'Request failed'
    const err = new Error(typeof message === 'string' ? message : JSON.stringify(message))
    err.status = response.status
    err.data = data
    throw err
  }

  return data
}

export const api = {
  get:    (endpoint, opts)       => request(endpoint, { ...opts, method: 'GET' }),
  post:   (endpoint, body, opts) => request(endpoint, { ...opts, method: 'POST', body }),
  put:    (endpoint, body, opts) => request(endpoint, { ...opts, method: 'PUT', body }),
  patch:  (endpoint, body, opts) => request(endpoint, { ...opts, method: 'PATCH', body }),
  delete: (endpoint, opts)       => request(endpoint, { ...opts, method: 'DELETE' }),
  setToken,
  getToken,
}
