import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import {
  CASHCODE_LIST,
  CASH_CODE_DATA,
  CREATE_CASHCODE,
} from '../../utils/constant.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

// ✅ helper to normalize + convert to float
const normalizeAmount = (value) => {
  if (value === null || value === undefined) return 0
  return parseFloat(String(value).replace(/,/g, ''))
}

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
    // ✅ ensure amount is float
    const body = {
      ...(payload || {}),
      ...(payload && Object.prototype.hasOwnProperty.call(payload, 'amount')
        ? { amount: normalizeAmount(payload.amount) }
        : {}),
    }

    const response = await fetchWithRefreshToken(CREATE_CASHCODE, {
      method: 'POST',
      body: JSON.stringify(body),
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

  fetchCashcodeData: async (cashcode) => {
    const response = await fetchWithRefreshToken(CASH_CODE_DATA, {
      method: 'POST',
      body: JSON.stringify({
        cashcode: String(cashcode || '').trim(),
      }),
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