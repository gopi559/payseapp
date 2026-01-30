const safeJsonParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const isFresh = (ts, maxAgeMs) => typeof ts === 'number' && Date.now() - ts < maxAgeMs

export const getCachedDeviceLocation = (maxAgeMs = 5 * 60 * 1000) => {
  const cached = safeJsonParse(localStorage.getItem('device_location'))
  if (!cached || typeof cached !== 'object') return null
  if (!isFresh(cached.ts, maxAgeMs)) return null
  if (typeof cached.lat !== 'number' || typeof cached.lng !== 'number') return null
  return cached
}

export const cacheCurrentLocation = ({ timeoutMs = 5000, maxAgeMs = 5 * 60 * 1000 } = {}) => {
  const existing = getCachedDeviceLocation(maxAgeMs)
  if (existing) return Promise.resolve(existing)

  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    let done = false

    const finish = (val) => {
      if (done) return
      done = true
      resolve(val)
    }

    const timeout = setTimeout(() => finish(null), timeoutMs)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout)
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          ts: Date.now(),
        }
        try {
          localStorage.setItem('device_location', JSON.stringify(loc))
        } catch {
        }
        finish(loc)
      },
      () => {
        clearTimeout(timeout)
        finish(null)
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 0 }
    )
  })
}

