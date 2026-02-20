import Store from '../Redux/store.jsx'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend.api-innovitegra.in'
const BASIC_AUTH_USERNAME = import.meta.env.VITE_BASIC_AUTH_USERNAME || 'webadmin'
const BASIC_AUTH_PASSWORD = import.meta.env.VITE_BASIC_AUTH_PASSWORD || '4970FAB298E271E430010235E9C88EA5E467DEEF'

const INVALID_TOKEN_VALUES = new Set(['', 'null', 'undefined', 'nan'])

let inMemoryToken = null

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url)
const toUrl = (endpoint) =>
  isAbsoluteUrl(endpoint)
    ? endpoint
    : endpoint.startsWith('/')
      ? endpoint
      : `${API_BASE_URL}${endpoint}`

function getDeviceId() {
  let id = localStorage.getItem('deviceId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('deviceId', id)
  }
  return id
}

export const deviceId = getDeviceId()

export const deviceInfo = encodeURIComponent(
  JSON.stringify({
    user_agent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      color_depth: window.screen.colorDepth,
      pixel_depth: window.screen.pixelDepth,
    },
  })
)

export const initDeviceContext = () => ({
  deviceId,
  deviceInfo,
})

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const normalizeToken = (value) => {
  if (typeof value !== 'string') return null

  const raw = value.trim()
  if (!raw) return null

  const lower = raw.toLowerCase()
  if (INVALID_TOKEN_VALUES.has(lower)) return null

  if (lower.startsWith('bearer ')) {
    const stripped = raw.slice(7).trim()
    const strippedLower = stripped.toLowerCase()
    if (!stripped || INVALID_TOKEN_VALUES.has(strippedLower)) return null
    return stripped
  }

  return raw
}

export const clearAuthRuntime = () => {
  inMemoryToken = null
}

export const getAuthToken = () => {
  try {
    const state = Store?.getState?.()
    const tokenFromTokenSlice = normalizeToken(state?.token?.token)
    if (tokenFromTokenSlice) {
      inMemoryToken = tokenFromTokenSlice
      return tokenFromTokenSlice
    }

    const tokenFromAuthSlice = normalizeToken(state?.auth?.token)
    if (tokenFromAuthSlice) {
      inMemoryToken = tokenFromAuthSlice
      return tokenFromAuthSlice
    }
  } catch {}

  const persisted = safeJsonParse(localStorage.getItem('reduxState'))
  const persistedToken = normalizeToken(persisted?.token?.token ?? persisted?.auth?.token)
  if (persistedToken) {
    inMemoryToken = persistedToken
    return persistedToken
  }

  const runtimeToken = normalizeToken(inMemoryToken)
  if (runtimeToken) return runtimeToken

  inMemoryToken = null
  return null
}

const getBasicAuthHeader = () => {
  const username = String(BASIC_AUTH_USERNAME || '').trim()
  const password = String(BASIC_AUTH_PASSWORD || '')
  if (!username || !password) return null
  return `Basic ${btoa(`${username}:${password}`)}`
}

const buildHeaders = ({ extraHeaders } = {}) => {
  const token = getAuthToken()
  const basic = getBasicAuthHeader()

  const headers = { 'Content-Type': 'application/json' }

  if (token) headers.Authorization = `Bearer ${token}`
  else if (basic) headers.Authorization = basic

  return { ...headers, ...(extraHeaders || {}) }
}

export async function callApi(url, body, options = {}) {
  const resolvedUrl = toUrl(url)
  const method = options.method || 'POST'

  const response = await fetch(resolvedUrl, {
    method,
    headers: buildHeaders({ extraHeaders: options.headers }),
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const err = new Error(payload?.message || `Request failed (${response.status})`)
    err.status = response.status
    err.payload = payload
    throw err
  }

  return payload
}

export const api = {
  get: (e, o) => callApi(e, undefined, { ...o, method: 'GET' }),
  post: (e, d, o) => callApi(e, d, { ...o, method: 'POST' }),
  put: (e, d, o) => callApi(e, d, { ...o, method: 'PUT' }),
  delete: (e, o) => callApi(e, undefined, { ...o, method: 'DELETE' }),
}
