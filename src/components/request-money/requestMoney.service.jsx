import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import {
  VALIDATE_SENDMONEY_BEN,
  CREATE_REQUEST_MONEY,
  REQUEST_MONEY_LIST,
  PAY_REQUEST_MONEY,
  DECLINE_REQUEST_MONEY,
} from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const normalizeBeneficiaryData = (data) => {
  if (!data || typeof data !== 'object') return data

  const toUpper = (value) =>
    value == null ? value : String(value).toUpperCase()

  return {
    ...data,
    first_name: toUpper(data.first_name),
    middle_name: toUpper(data.middle_name),
    last_name: toUpper(data.last_name),
  }
}

const postJson = async (url, body) => {
  const response = await fetchWithRefreshToken(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const res = await response.json().catch(() => null)
  if (!response.ok) throw new Error(res?.message || '')
  if (!isSuccess(res)) throw new Error(res?.message || '')
  return res
}

const requestMoneyService = {
  validateBeneficiary: async (mobile) => {
    const res = await postJson(VALIDATE_SENDMONEY_BEN, {
      mobile_number: String(mobile).trim(),
    })

    if (!res?.data) throw new Error('')

    return {
      data: normalizeBeneficiaryData(res.data),
      message: res?.message,
    }
  },

  createRequestMoney: async ({ cust_id, entity_type, amount, remarks = '' }) => {
    const res = await postJson(CREATE_REQUEST_MONEY, {
      cust_id: Number(cust_id),
      entity_type: String(entity_type || '').trim() || undefined,
      amount: Number(amount),
      remarks: String(remarks || '').trim() || undefined,
    })

    authService.fetchCustomerBalance().catch(() => {})

    return {
      data: res?.data,
      message: res?.message,
    }
  },

  getReceivedRequests: async (custId) => {
    const res = await postJson(REQUEST_MONEY_LIST, {
      get_cust_data: true,
      recv_cust_id: Number(custId),
    })

    return {
      data: Array.isArray(res?.data) ? res.data : [],
      message: res?.message,
    }
  },

  getMyRequests: async (custId) => {
    const res = await postJson(REQUEST_MONEY_LIST, {
      get_cust_data: true,
      req_cust_id: Number(custId),
    })

    return {
      data: Array.isArray(res?.data) ? res.data : [],
      message: res?.message,
    }
  },

  payRequestMoney: async ({ money_reqid, amount, remarks = 'Paid' }) => {
    const res = await postJson(PAY_REQUEST_MONEY, {
      money_reqid: Number(money_reqid),
      amount: Number(amount),
      remarks: String(remarks || 'Paid'),
    })

    authService.fetchCustomerBalance().catch(() => {})

    return {
      data: res?.data,
      message: res?.message,
    }
  },

  declineRequestMoney: async ({ money_reqid }) => {
    const res = await postJson(DECLINE_REQUEST_MONEY, {
      money_reqid: Number(money_reqid),
    })

    return {
      data: res?.data,
      message: res?.message,
    }
  },
}

export default requestMoneyService
