import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import { CASHCODE_LIST, CREATE_CASHCODE } from '../../utils/constant.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const voucherService = {
  getCashcodeList: async (params = {}) => {
    const body = {
      page: params.page ?? 1,
      no_of_data: params.no_of_data ?? 10,
    }

    const response = await fetchWithRefreshToken(CASHCODE_LIST, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await response.json()
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    return {
      data: {
        list: Array.isArray(res?.data?.list) ? res.data.list : [],
      },
      message: res?.message,
    }
  },

  createCashcode: async (payload) => {
    const response = await fetchWithRefreshToken(CREATE_CASHCODE, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const res = await response.json()
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    return {
      data: res?.data,
      message: res?.message,
    }
  },
}

export default voucherService
