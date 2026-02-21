import { getAuthToken, deviceId } from '../../services/api.jsx'
import { CASHCODE_LIST, CREATE_CASHCODE } from '../../utils/constant.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const voucherService = {
  getCashcodeList: async (params = {}) => {
    const body = {
      page: params.page ?? 1,
      no_of_data: params.no_of_data ?? 10,
    }

    const response = await fetch(CASHCODE_LIST, {
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

    const res = await response.json()
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Failed to load cash codes')
    }

    return {
      data: {
        list: Array.isArray(res?.data?.list) ? res.data.list : [],
      },
      message: res?.message,
    }
  },

  createCashcode: async (payload) => {
    const response = await fetch(CREATE_CASHCODE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
        }),
      },
      body: JSON.stringify(payload),
    })

    const res = await response.json()
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Failed to create cash code')
    }

    return {
      data: res?.data,
      message: res?.message,
    }
  },
}

export default voucherService