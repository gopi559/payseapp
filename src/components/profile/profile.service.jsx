import { getAuthToken, deviceId } from '../../services/api.jsx'
import { PROFILE_IMAGE, PROFILE_IMAGE_UPLOAD } from '../../utils/constant.jsx'

const profileService = {
  fetchImageById: async ({ image_id }) => {
    const id = Number(image_id)
    if (!id || Number.isNaN(id)) {
      throw new Error('Valid image ID is required')
    }

    const response = await fetch(PROFILE_IMAGE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
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

    const response = await fetch(PROFILE_IMAGE_UPLOAD, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
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

    const response = await fetch(PROFILE_IMAGE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
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
}

export default profileService
