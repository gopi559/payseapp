import { getAuthToken, deviceId } from '../../services/api.jsx'
import { PROFILE_IMAGE, PROFILE_IMAGE_UPLOAD, MAIN_API_URL } from '../../utils/constant.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const profileService = {
  fetchImage: async ({ user_id, page = 1, no_of_data = 50, is_temp = 0 }) => {
    const id = Number(user_id)
    if (!id || Number.isNaN(id)) throw new Error('Valid user ID is required')

    const body = {
      page: Number(page),
      no_of_data: Number(no_of_data),
      user_id: id,
      is_temp: Number(is_temp),
    }

    const response = await fetch(PROFILE_IMAGE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
        }),
      },
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || 'Failed to fetch profile image')
    if (!isSuccess(res)) throw new Error(res?.message || 'Failed to fetch profile image')

    // Extract image URL from response
    let imageUrl = res?.data?.image_url ?? res?.data?.image ?? res?.image_url ?? res?.image ?? null
    
    // Convert relative URL to absolute URL if needed
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
      // If it's a relative path, make it absolute
      if (imageUrl.startsWith('/')) {
        imageUrl = `${MAIN_API_URL}${imageUrl}`
      } else {
        imageUrl = `${MAIN_API_URL}/${imageUrl}`
      }
    }

    return {
      data: res?.data ?? res,
      message: res?.message,
      status: res?.status,
      imageUrl,
    }
  },

  uploadImage: async ({ user_id, file, page = 1, no_of_data = 50, is_temp = 0 }) => {
    const id = Number(user_id)
    if (!id || Number.isNaN(id)) throw new Error('Valid user ID is required')

    // API expects JSON body: { page, no_of_data, user_id, is_temp }
    // If file is provided, send as FormData with file + JSON fields
    let body
    let headers = {
      Authorization: `Bearer ${getAuthToken()}`,
      deviceInfo: JSON.stringify({
        device_type: 'WEB',
        device_id: deviceId,
      }),
    }

    if (file) {
      // If file is provided, use FormData (multipart/form-data)
      body = new FormData()
      body.append('user_id', id)
      body.append('page', Number(page))
      body.append('no_of_data', Number(no_of_data))
      body.append('is_temp', Number(is_temp))
      body.append('image', file)
      // Don't set Content-Type header - browser will set it with boundary for FormData
    } else {
      // Otherwise use JSON
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify({
        page: Number(page),
        no_of_data: Number(no_of_data),
        user_id: id,
        is_temp: Number(is_temp),
      })
    }

    const response = await fetch(PROFILE_IMAGE_UPLOAD, {
      method: 'POST',
      headers,
      body,
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || 'Profile image upload failed')
    if (!isSuccess(res)) throw new Error(res?.message || 'Profile image upload failed')

    // API response format: { "api": "/login/profile/image/upload", "code": 1, "message": "...", "status": "Success" }
    // Response doesn't include image URL, so we return success
    // The image URL needs to be fetched separately using fetchImage endpoint
    return {
      data: res?.data ?? res,
      message: res?.message,
      status: res?.status,
    }
  },

  removeImage: async ({ user_id }) => {
    const id = Number(user_id)
    if (!id || Number.isNaN(id)) throw new Error('Valid user ID is required')

    // For now, we'll just clear it from Redux
    // If there's a delete API endpoint, it can be added here
    // For now, removing the image means clearing it from state
    return {
      success: true,
      message: 'Profile image removed successfully',
    }
  },
}

export default profileService

