const API_PREFIX = '/api/scf'

const buildQueryString = (params = {}) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.append(key, value)
  })

  const query = search.toString()
  return query ? `?${query}` : ''
}

const resolvePayload = async (response) => {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch (error) {
    void error
    return text
  }
}

const unwrapResponse = (payload, response) => {
  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'code')) {
    const normalizedCode = typeof payload.code === 'string' ? payload.code.trim() : payload.code
    const isSuccessCode = normalizedCode === 0 || normalizedCode === '0'
    const isSuccessFlag = payload.success === true

    if (!isSuccessCode && !isSuccessFlag) {
      throw new Error(payload.message || 'Request failed')
    }
    return payload.data
  }

  return payload
}

export const apiRequest = async (path, { method = 'GET', params, body, headers } = {}) => {
  const response = await fetch(`${API_PREFIX}${path}${buildQueryString(params)}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })

  const payload = await resolvePayload(response)
  return unwrapResponse(payload, response)
}
