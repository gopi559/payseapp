import Store from '../Redux/store.jsx'
import { getCachedDeviceLocation } from '../utils/deviceLocation.jsx'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend.api-innovitegra.in'

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url)
// Relative paths (e.g. /login/check-mobile in dev) stay same-origin so Vite proxy works and CORS is avoided
const toUrl = (endpoint) =>
  isAbsoluteUrl(endpoint)
    ? endpoint
    : endpoint.startsWith("/")
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



export const initDeviceContext = () => ({ deviceId, deviceInfo })

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}



// Use token from Redux (selector-style): store.token.token first, then store.auth.token
export const getAuthToken = () => {
  try {
    const state = Store?.getState?.()
    const tokenFromTokenSlice = state?.token?.token
    if (typeof tokenFromTokenSlice === 'string' && tokenFromTokenSlice.length) return tokenFromTokenSlice
    const tokenFromAuthSlice = state?.auth?.token
    if (typeof tokenFromAuthSlice === 'string' && tokenFromAuthSlice.length) return tokenFromAuthSlice
  } catch {}

  const persisted = safeJsonParse(localStorage.getItem('reduxState'))
  const token = persisted?.token?.token ?? persisted?.auth?.token
  return typeof token === 'string' && token.length ? token : null
}



const buildHeaders = ({ extraHeaders } = {}) => {
  const token = getAuthToken()
  //const location = getCachedDeviceLocation()

  const headers = {
    'Content-Type': 'application/json',
    // 'DeviceInfo': deviceId,
    // 'x-app-channel': 'WEB',
    // 'x-app-name': import.meta.env.VITE_APP_NAME || 'MobilWebApp',
    // 'x-device-info': deviceInfo,
  }

  // if (location) {
  //   headers['x-device-location-status'] = 'AVAILABLE'
  //   headers['x-device-lat'] = String(location.lat)
  //   headers['x-device-lng'] = String(location.lng)
  // } else {
  //   headers['x-device-location-status'] = 'UNAVAILABLE'
  // }

  if (token) headers.Authorization = `Bearer ${token}`

  return { ...headers, ...(extraHeaders || {}) }
}



export async function callApi(url, body, options = {}) {
  const resolvedUrl = toUrl(url)
  const method =  'POST'

  const response = await fetch(resolvedUrl, {
    method,
    headers: buildHeaders({ extraHeaders: options.headers }),
    body: body === undefined ? undefined : JSON.stringify(body),


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
  get: (endpoint, options) => callApi(endpoint, undefined, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => callApi(endpoint, data, { ...options, method: 'POST' }),
  put: (endpoint, data, options) => callApi(endpoint, data, { ...options, method: 'PUT' }),
  delete: (endpoint, options) => callApi(endpoint, undefined, { ...options, method: 'DELETE' }),
}

