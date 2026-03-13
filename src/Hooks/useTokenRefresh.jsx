import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import fetchWithRefreshToken from '../services/fetchWithRefreshToken'

const useTokenRefresh = () => {
  const token = useSelector((store) => store.token?.token)
  const deviceId = useSelector((store) => store.token?.deviceId)

  const fetchWithTokenRefresh = useCallback(
    async (url, options = {}) => fetchWithRefreshToken(url, options),
    []
  )

  return { fetchWithTokenRefresh, token, deviceId }
}

export default useTokenRefresh
