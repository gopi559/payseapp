import { deviceId, getAuthToken } from './api.jsx'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').trim()
const INVALID_TOKEN_VALUES = new Set(['', 'null', 'undefined', 'nan'])
const hasJwtSegments = (value) => String(value || '').split('.').length === 3

const normalizeToken = (value) => {
  if (typeof value !== 'string') return null

  const raw = value.trim()
  if (!raw) return null

  const lower = raw.toLowerCase()
  if (INVALID_TOKEN_VALUES.has(lower)) return null

  if (lower.startsWith('bearer ')) {
    const stripped = raw.slice(7).trim()
    return stripped || null
  }

  return raw
}

const getAccessTokenFromPayload = (payload) => {
  const candidates = [
    payload?.token,
    payload?.auth_token,
    payload?.access_token,
    payload?.data?.token,
    payload?.data?.auth_token,
    payload?.data?.access_token,
  ]

  return candidates
    .map(normalizeToken)
    .find((token) => token && hasJwtSegments(token)) ?? null
}

const getRefreshTokenFromPayload = (payload) => {
  const candidates = [
    payload?.refresh_token,
    payload?.data?.refresh_token,
  ]

  return candidates.map(normalizeToken).find(Boolean) ?? null
}

export const persistRefreshSession = (payload) => {
  const accessToken = getAccessTokenFromPayload(payload)
  const refreshToken = getRefreshTokenFromPayload(payload)

  if (!accessToken && !refreshToken) return null

  if (accessToken) {
    localStorage.setItem('auth_token', accessToken)
  }

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken)
  }

  return accessToken
}

const fetchWithRefreshToken = async (url, options = {}) => {
  let token = normalizeToken(localStorage.getItem('auth_token')) || normalizeToken(getAuthToken())

  if (token && hasJwtSegments(token)) {
    localStorage.setItem('auth_token', token)
  } else {
    token = null
    localStorage.removeItem('auth_token')
  }

  const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = {
    deviceinfo: JSON.stringify({
      device_type: 'WEBAPP',
      device_id: deviceId,
    }),
    ...(options.headers || {}),
  }

  if (!isFormDataBody && !Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.authorization = `Bearer ${token}`
  }

  const finalUrl = url.startsWith('http') ? url : `${API_BASE}${url}`

  let response = await fetch(finalUrl, {
    ...options,
    headers,
  })

  if (response.status !== 401) return response

  if (!token || !hasJwtSegments(token)) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refreshToken')
    window.location.href = '/'
    throw new Error('Session expired')
  }

  const refreshRes = await fetch(`${API_BASE}/login/refresh_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_token: token,
      refresh_token: normalizeToken(localStorage.getItem('refreshToken')),
    }),
  })

  const refreshData = await refreshRes.json().catch(() => null)

  if (!refreshRes.ok || refreshData?.code !== 1) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refreshToken')
    window.location.href = '/'
    throw new Error('Session expired')
  }

  const newToken = persistRefreshSession(refreshData)

  if (newToken && hasJwtSegments(newToken)) {
    headers.authorization = `Bearer ${newToken}`
  } else {
    localStorage.removeItem('auth_token')
    delete headers.authorization
  }

  return fetch(finalUrl, {
    ...options,
    headers,
  })
}

export default fetchWithRefreshToken
