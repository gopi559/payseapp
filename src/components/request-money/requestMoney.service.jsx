import { getAuthToken, deviceId } from '../../services/api.jsx'
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

const postJson = async (url, body, defaultError) => {
  const response = await fetch(url, {
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
  if (!response.ok) throw new Error(res?.message || defaultError)
  if (!isSuccess(res)) throw new Error(res?.message || defaultError)
  return res
}

const requestMoneyService = {
  validateBeneficiary: async (mobile) => {
    const res = await postJson(
      VALIDATE_SENDMONEY_BEN,
      { mobile: String(mobile).trim() },
      'Failed to validate beneficiary'
    )

    if (!res?.data) throw new Error(res?.message || 'Beneficiary not found')

    return {
      data: res.data,
      message: res?.message,
    }
  },

  createRequestMoney: async ({ cust_id, amount, remarks = '' }) => {
    const res = await postJson(
      CREATE_REQUEST_MONEY,
      {
        cust_id: Number(cust_id),
        amount: Number(amount),
        remarks: String(remarks || '').trim() || undefined,
      },
      'Request money failed'
    )

    authService.fetchCustomerBalance().catch(() => {})

    return {
      data: res?.data,
      message: res?.message,
    }
  },

  getReceivedRequests: async (custId) => {
    const res = await postJson(
      REQUEST_MONEY_LIST,
      {
        get_cust_data: true,
        recv_cust_id: Number(custId),
      },
      'Failed to load received requests'
    )

    return {
      data: Array.isArray(res?.data) ? res.data : [],
      message: res?.message,
    }
  },

  getMyRequests: async (custId) => {
    const res = await postJson(
      REQUEST_MONEY_LIST,
      {
        get_cust_data: true,
        req_cust_id: Number(custId),
      },
      'Failed to load your requests'
    )

    return {
      data: Array.isArray(res?.data) ? res.data : [],
      message: res?.message,
    }
  },

  payRequestMoney: async ({ money_reqid, amount, remarks = 'Paid' }) => {
    const res = await postJson(
      PAY_REQUEST_MONEY,
      {
        money_reqid: Number(money_reqid),
        amount: Number(amount),
        remarks: String(remarks || 'Paid'),
      },
      'Pay request failed'
    )

    authService.fetchCustomerBalance().catch(() => {})

    return {
      data: res?.data,
      message: res?.message,
    }
  },

  declineRequestMoney: async ({ money_reqid }) => {
    const res = await postJson(
      DECLINE_REQUEST_MONEY,
      {
        money_reqid: Number(money_reqid),
      },
      'Decline request failed'
    )

    return {
      data: res?.data,
      message: res?.message,
    }
  },
}

export default requestMoneyService
