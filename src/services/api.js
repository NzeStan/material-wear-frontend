const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {} } = options
  const config = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  }
  if (body) config.body = JSON.stringify(body)

  const response = await fetch(`${BASE_URL}${endpoint}`, config)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || 'API request failed')
  }
  return response.json()
}

export const api = {
  get:    (endpoint, opts)       => request(endpoint, { ...opts, method: 'GET' }),
  post:   (endpoint, body, opts) => request(endpoint, { ...opts, method: 'POST', body }),
  put:    (endpoint, body, opts) => request(endpoint, { ...opts, method: 'PUT', body }),
  patch:  (endpoint, body, opts) => request(endpoint, { ...opts, method: 'PATCH', body }),
  delete: (endpoint, opts)       => request(endpoint, { ...opts, method: 'DELETE' }),
}
