import { getAuthToken, deviceId } from '../../services/api.jsx'
import { CASHCODE_LIST, CREATE_CASHCODE } from '../../utils/constant.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const voucherService = {

  getCashcodeList: async (params = {}) => {
    const body = {
      page: params.page ?? 1,
      no_of_data: params.no_of_data ?? 10
    
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
    const res = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(res?.message || 'Failed to load cash codes')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Failed to load cash codes')
    }
    const list = Array.isArray(res?.data?.list) ? res.data.list : []
    return {
      data: { list, page: res?.data?.page ?? 1, no_of_data: res?.data?.no_of_data ?? 10 },
      message: res?.message,
    }
  },

  createCashcode: async (payload) => {
    const body = {
      amount: String(payload.amount ?? '').trim(),
      receiver_name: String(payload.receiver_name ?? '').trim(),
      receiver_mobile: String(payload.receiver_mobile ?? '').trim(),
      receiver_id_type: Number(payload.receiver_id_type) || 1,
      receiver_id_number: String(payload.receiver_id_number ?? '').trim(),
    }
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
      body: JSON.stringify(body),
    })
    const res = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(res?.message || 'Failed to create cash code')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Failed to create cash code')
    }
    return {
      data: {
        cashcode: res?.data?.cashcode ?? '',
        status: res?.data?.status ?? '',
        temp_pin: res?.data?.temp_pin ?? '',
      },
      message: res?.message,
    }
  },
}

export default voucherService
