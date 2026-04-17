import { deviceId } from '../../services/api.jsx'
import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import { DOCUMENT_LIST, PERSONAL_INFORMATION_LIST, PROFILE_IMAGE, PROFILE_IMAGE_UPLOAD } from '../../utils/constant.jsx'

const extractDocumentArray = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.individual_docs)) return data.individual_docs
  if (Array.isArray(data?.documents)) return data.documents
  if (Array.isArray(data?.document_list)) return data.document_list
  if (Array.isArray(data?.rows)) return data.rows
  if (Array.isArray(data?.result)) return data.result
  if (Array.isArray(data?.list)) return data.list
  return []
}

const profileService = {
  getPersonalInformationList: async () => {
    const response = await fetchWithRefreshToken(PERSONAL_INFORMATION_LIST, {
      method: 'POST',
      headers: {
        deviceInfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({}),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || res?.code !== 1) {
      throw new Error(res?.message || 'Failed to fetch personal information')
    }

    return res?.data ?? {}
  },

  fetchImageById: async ({ image_id }) => {
    const id = Number(image_id)
    if (!id || Number.isNaN(id)) {
      throw new Error('Valid image ID is required')
    }

    const response = await fetchWithRefreshToken(PROFILE_IMAGE, {
      method: 'POST',
      headers: {
        deviceInfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({ image_id: id }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch profile image')
    }

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    return {
      imageId: id,
      imageUrl: blobUrl,
    }
  },

  uploadImage: async ({ user_id, file }) => {
    const id = Number(user_id)
    if (!id || Number.isNaN(id)) {
      throw new Error('Valid user ID is required')
    }

    const body = new FormData()
    body.append('user_id', id)
    body.append('image', file)

    const response = await fetchWithRefreshToken(PROFILE_IMAGE_UPLOAD, {
      method: 'POST',
      headers: {
        deviceInfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
        }),
      },
      body,
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || res?.code !== 1) {
      throw new Error(res?.message || 'Profile image upload failed')
    }

    return {
      imageId: res?.data?.img_id ?? null,
    }
  },

  removeImage: async ({ image_id }) => {
    const id = Number(image_id)
    if (!id || Number.isNaN(id)) {
      throw new Error('Valid image ID is required')
    }

    const response = await fetchWithRefreshToken(PROFILE_IMAGE, {
      method: 'POST',
      headers: {
        deviceInfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({ image_id: id }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || res?.code !== 1) {
      throw new Error(res?.message || 'Failed to remove profile image')
    }

    return { success: true }
  },

  getDocumentList: async (payload = {}) => {
    const resolvedPayload = { ...(payload || {}) }
    const normalizedUserId =
      resolvedPayload.user_id ?? resolvedPayload.userId ?? resolvedPayload.id ?? null

    if (normalizedUserId != null && !resolvedPayload.user_id) {
      resolvedPayload.user_id = normalizedUserId
    }

    const payloadCandidates = [
      resolvedPayload,
      { ...resolvedPayload, user_id: normalizedUserId },
      { ...resolvedPayload, id: normalizedUserId },
      {
        ...resolvedPayload,
        user_ref: resolvedPayload.user_ref ?? resolvedPayload.userRef ?? null,
      },
      {
        ...resolvedPayload,
        mobile: resolvedPayload.mobile ?? resolvedPayload.reg_mobile ?? null,
      },
    ]

    const dedupedPayloads = payloadCandidates
      .map((item) =>
        Object.fromEntries(Object.entries(item).filter(([, value]) => value !== null && value !== undefined && value !== ''))
      )
      .filter((item, index, arr) => arr.findIndex((it) => JSON.stringify(it) === JSON.stringify(item)) === index)

    let hadSuccess = false
    let lastError = null
    for (const body of dedupedPayloads) {
      try {
        const response = await fetchWithRefreshToken(DOCUMENT_LIST, {
          method: 'POST',
          headers: {
            deviceInfo: JSON.stringify({
              device_type: 'WEB',
              device_id: deviceId,
            }),
          },
          body: JSON.stringify(body),
        })

        const json = await response.json().catch(() => null)

        if (!response.ok || json?.code !== 1) {
          lastError = new Error(json?.message || 'Request failed')
          continue
        }

        hadSuccess = true
        const data = json?.data ?? json
        const docs = extractDocumentArray(data)

        if (docs.length > 0) return docs
      } catch (error) {
        lastError = error
      }
    }

    if (!hadSuccess && lastError) {
      throw lastError
    }

    return []
  },
}

export default profileService
