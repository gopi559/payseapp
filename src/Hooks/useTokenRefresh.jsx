import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { getAuthToken } from '../services/api'

/**
 * Provides fetchWithTokenRefresh so hooks (useAdd, useEdit, useDelete, useCardRequest)
 * use token from Redux (store.token.token) for every API call.
 * No refresh logic yet – just adds Authorization from getAuthToken().
 */
const useTokenRefresh = () => {
  const token = useSelector((store) => store.token?.token)
  const deviceId = useSelector((store) => store.token?.deviceId)

  const fetchWithTokenRefresh = useCallback(
    async (url, options = {}) => {
      const authToken = getAuthToken()
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      }
      if (authToken) headers.Authorization = `Bearer ${authToken}`
      if (deviceId) headers.DeviceID = deviceId
      return fetch(url, { ...options, headers })
    },
    [deviceId]
  )

  return { fetchWithTokenRefresh, token, deviceId }
}

export default useTokenRefresh
