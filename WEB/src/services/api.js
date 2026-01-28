// API abstraction layer (adds JWT + device/app metadata to every request)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:15042'

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url)

// Prefer reading JWT from Redux (immediate), fall back to persisted localStorage.
import Store from '../Redux/store'

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const getAuthToken = () => {
  try {
    const tokenFromStore = Store?.getState?.()?.auth?.token
    if (typeof tokenFromStore === 'string' && tokenFromStore.length) return tokenFromStore
  } catch {
    // ignore
  }

  // Preferred: token stored in reduxState.auth.token (persisted in localStorage)
  const persisted = safeJsonParse(localStorage.getItem('reduxState'))
  const token = persisted?.auth?.token
  return typeof token === 'string' && token.length ? token : null
}

const getOrCreateDeviceId = () => {
  const key = 'device_id'
  const existing = localStorage.getItem(key)
  if (existing) return existing

  let id = ''
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    id = crypto.randomUUID()
  } else {
    id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  localStorage.setItem(key, id)
  return id
}

const getDeviceInfo = () => {
  const nav = typeof navigator !== 'undefined' ? navigator : null
  const scr = typeof window !== 'undefined' ? window.screen : null

  return {
    user_agent: nav?.userAgent ?? null,
    platform: nav?.platform ?? null,
    language: nav?.language ?? null,
    languages: nav?.languages ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    screen: scr
      ? { width: scr.width, height: scr.height, color_depth: scr.colorDepth, pixel_depth: scr.pixelDepth }
      : null,
  }
}

const getCachedLocation = () => {
  const cached = safeJsonParse(localStorage.getItem('device_location'))
  // expected shape: { lat, lng, accuracy, ts }
  if (!cached || typeof cached !== 'object') return null
  if (typeof cached.lat !== 'number' || typeof cached.lng !== 'number') return null
  return cached
}

const buildDefaultHeaders = () => {
  const token = getAuthToken()
  const deviceId = getOrCreateDeviceId()
  const deviceInfo = getDeviceInfo()
  const location = getCachedLocation()

  const headers = {
    'Content-Type': 'application/json',

    // "Pass web application + device info on every API"
    'X-App-Channel': 'WEB',
    'X-App-Name': import.meta.env.VITE_APP_NAME || 'MobilWebApp',

    'X-Device-Id': deviceId,
    'X-Device-Info': encodeURIComponent(JSON.stringify(deviceInfo)),
  }

  if (location) {
    headers['X-Device-Location-Status'] = 'AVAILABLE'
    headers['X-Device-Lat'] = String(location.lat)
    headers['X-Device-Lng'] = String(location.lng)
    if (typeof location.accuracy === 'number') headers['X-Device-Accuracy'] = String(location.accuracy)
    if (location.ts) headers['X-Device-Location-Ts'] = String(location.ts)
  } else {
    headers['X-Device-Location-Status'] = 'UNAVAILABLE'
  }

  // IP address: browser cannot reliably know it without an external lookup.
  // Backend should use request source IP; we keep this header empty by default.
  const clientIp = localStorage.getItem('client_ip')
  headers['X-Client-Ip'] = clientIp || 'UNKNOWN'

  if (token) headers.Authorization = `Bearer ${token}`

  return headers
}

const toUrl = (endpoint) => (isAbsoluteUrl(endpoint) ? endpoint : `${API_BASE_URL}${endpoint}`)

const request = async (method, endpoint, data, options = {}) => {
  const url = toUrl(endpoint)
  const headers = { ...buildDefaultHeaders(), ...(options.headers || {}) }

  const response = await fetch(url, {
    method,
    headers,
    body: data === undefined ? undefined : JSON.stringify(data),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Request failed (${response.status})`
    const err = new Error(message)
    err.status = response.status
    err.payload = payload
    throw err
  }

  return payload
}

export const api = {
  get: (endpoint, options) => request('GET', endpoint, undefined, options),
  post: (endpoint, data, options) => request('POST', endpoint, data, options),
  put: (endpoint, data, options) => request('PUT', endpoint, data, options),
  delete: (endpoint, options) => request('DELETE', endpoint, undefined, options),
}

