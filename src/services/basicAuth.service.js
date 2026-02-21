const basicAuthUser = import.meta.env.VITE_BASIC_AUTH_USER || import.meta.env.VITE_BASIC_AUTH_USERNAME
const basicAuthPass = import.meta.env.VITE_BASIC_AUTH_PASS || import.meta.env.VITE_BASIC_AUTH_PASSWORD
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ''
const inflightRequests = new Map()

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url)
const toUrl = (endpoint) =>
  isAbsoluteUrl(endpoint)
    ? endpoint
    : endpoint.startsWith('/')
      ? `${apiBaseUrl}${endpoint}`
      : `${apiBaseUrl}/${endpoint}`

const getBasicAuthHeader = () => {
  const user = String(basicAuthUser || '').trim()
  const pass = String(basicAuthPass || '')

  if (!user || !pass) {
    throw new Error('Missing Basic Auth credentials in Vite environment variables')
  }

  const credentials = `${user}:${pass}`
  return `Basic ${btoa(credentials)}`
}

const getRequestKey = (url, body) => `${url}::${body === undefined ? '' : JSON.stringify(body)}`

export const fetchWithBasicAuth = async (url, body) => {
  const resolvedUrl = toUrl(url)
  const requestKey = getRequestKey(resolvedUrl, body)

  if (inflightRequests.has(requestKey)) {
    return inflightRequests.get(requestKey)
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getBasicAuthHeader(),
    },
  }

  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const request = (async () => {
    const response = await fetch(resolvedUrl, options)
    const json = await response.json().catch(() => null)

    if (!response.ok || json?.code !== 1) {
      throw new Error(json?.message || 'Request failed')
    }

    return json?.data
  })()

  inflightRequests.set(requestKey, request)

  try {
    return await request
  } finally {
    inflightRequests.delete(requestKey)
  }
}
