import { deviceId } from './api.jsx'

const API_BASE = 'https://backend.api-innovitegra.in/webcust'

export const persistRefreshSession = (payload) => {
  const nextToken =
    payload?.refresh_token ||
    payload?.token ||
    payload?.auth_token ||
    payload?.data?.refresh_token

  if (!nextToken) return null

  localStorage.setItem('auth_token', nextToken)
  localStorage.setItem('refreshToken', nextToken)

  return nextToken
}

const fetchWithRefreshToken = async (url, options = {}) => {
  let token = localStorage.getItem('auth_token')

  const headers = {
    'Content-Type': 'application/json',
    deviceinfo: JSON.stringify({
      device_type: 'WEBAPP',
      device_id: deviceId,
    }),
    authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  }

  const finalUrl = url.startsWith('http') ? url : `${API_BASE}${url}`

  let response = await fetch(finalUrl, {
    ...options,
    headers,
  })

  if (response.status !== 401) return response

  const refreshRes = await fetch(`${API_BASE}/login/refresh_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_token: token,
    }),
  })

  const refreshData = await refreshRes.json()

  if (refreshData?.code !== 1) {
    localStorage.removeItem('auth_token')
    window.location.href = '/'
    throw new Error('Session expired')
  }

  const newToken = persistRefreshSession(refreshData)

  headers.authorization = `Bearer ${newToken}`

  return fetch(finalUrl, {
    ...options,
    headers,
  })
}

export default fetchWithRefreshToken