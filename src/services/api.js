const DEFAULT_API_BASE_URL = 'http://localhost:8000/api'
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL)
  .trim()
  .replace(/\/+$/, '')
const SHOULD_SKIP_NGROK_WARNING = /\.ngrok-free\.app(?:\/|$)/.test(BASE_URL)

function getToken() {
  return localStorage.getItem('mw_auth_token')
}

function getTokenScheme() {
  return localStorage.getItem('mw_auth_scheme') || 'Token'
}

function setToken(token, scheme = 'Token') {
  if (token) {
    localStorage.setItem('mw_auth_token', token)
    localStorage.setItem('mw_auth_scheme', scheme)
  } else {
    localStorage.removeItem('mw_auth_token')
    localStorage.removeItem('mw_auth_scheme')
  }
}

function getAuthHeader() {
  const token = getToken()
  if (!token) return {}
  return { Authorization: `${getTokenScheme()} ${token}` }
}

async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {} } = options
  const token = getToken()
  const tokenScheme = getTokenScheme()
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  const config = {
    method,
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `${tokenScheme} ${token}` } : {}),
      ...(SHOULD_SKIP_NGROK_WARNING ? { 'ngrok-skip-browser-warning': 'true' } : {}),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  }
  if (body !== undefined) {
    config.body = isFormData ? body : JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, config)
  } catch (error) {
    throw new Error(
      `Unable to reach ${BASE_URL}${path}. ${error?.message || 'If you are using an ngrok URL, your network may be blocking it or the tunnel may have expired.'}`
    )
  }

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
  getTokenScheme,
  getAuthHeader,
}
