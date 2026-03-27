import Store from '../Redux/store.jsx'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim()

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
    const cryptoApi = globalThis.crypto

    // Guard with typeof check instead of just truthy check
    if (cryptoApi?.randomUUID && typeof cryptoApi.randomUUID === 'function') {
      try {
        id = cryptoApi.randomUUID()
      } catch {
        id = null
      }
    }

    if (!id && cryptoApi?.getRandomValues) {
      try {
        const bytes = cryptoApi.getRandomValues(new Uint8Array(16))
        bytes[6] = (bytes[6] & 0x0f) | 0x40
        bytes[8] = (bytes[8] & 0x3f) | 0x80
        const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
        id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
      } catch {
        id = null
      }
    }

    if (!id) {
      id = `web-${Date.now()}-${Math.random().toString(16).slice(2)}`
    }

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

export const getAuthUser = () => {
  try {
    const state = Store?.getState?.()
    if (state?.auth?.user) return state.auth.user
  } catch {}

  const persisted = safeJsonParse(localStorage.getItem('reduxState'))
  return persisted?.auth?.user ?? null
}

export const getCurrentUserId = () => {
  const user = getAuthUser()
  const id =
    user?.reg_info?.user_id ??
    user?.reg_info?.id ??
    user?.user_id ??
    user?.id ??
    null

  return id != null ? Number(id) : null
}

export const getClientRefId = () => {
  const user = getAuthUser()
  const clientRefId =
    user?.reg_info?.client_ref_id ??
    user?.reg_info?.clientrefid ??
    user?.client_ref_id ??
    import.meta.env.VITE_CLIENT_REF_ID ??
    user?.reg_info?.user_ref ??
    user?.reg_info?.user_id ??
    user?.reg_info?.id ??
    user?.user_id ??
    user?.id ??
    ''

  return String(clientRefId || '').trim()
}

const buildHeaders = ({ extraHeaders } = {}) => {
  const token = getAuthToken()

  const headers = { 'Content-Type': 'application/json' }

  if (token) headers.Authorization = `Bearer ${token}`

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
