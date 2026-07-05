export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, { method = 'GET', body, headers } = {}) {
  const isFormData = body instanceof FormData

  const options = {
    method,
    
    credentials: 'include',
    headers: isFormData ? headers : { 'Content-Type': 'application/json', ...headers },
  }

  if (body !== undefined) {
    options.body = isFormData ? body : JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options)

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Request gagal (${response.status}).`)
  }

  return payload
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}