import { getAuthToken, deviceId } from '../../services/api.jsx'
import {
  REQUEST_MONEY,
  PAY_REQUEST_MONEY,
  DECLINE_REQUEST_MONEY,
  REQ_MONEY_LIST,
} from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const receiveService = {

  requestMoney: async (cust_id, amount, remarks = '') => {
    const body = {
      cust_id,
      amount,
      remarks,
    }

    const response = await fetch(REQUEST_MONEY, {
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
    if (!response.ok) throw new Error('Request money failed')
    if (!isSuccess(res)) throw new Error('Request money failed')

    authService.fetchCustomerBalance().catch(() => {})

    return {
      data: res?.data,
      message: res?.message,
    }
  },

  payRequestMoney: async (money_reqid, amount, remarks = '') => {
    const body = {
      money_reqid,
      amount,
      remarks,
    }

    const response = await fetch(PAY_REQUEST_MONEY, {
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
    if (!response.ok) throw new Error('Pay request failed')
    if (!isSuccess(res)) throw new Error('Pay request failed')

    authService.fetchCustomerBalance().catch(() => {})

    return {
      data: res?.data,
      message: res?.message,
    }
  },

  declineRequestMoney: async (cust_id, amount, remarks = '') => {
    const body = {
      cust_id,
      amount,
      remarks,
    }

    const response = await fetch(DECLINE_REQUEST_MONEY, {
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
    if (!response.ok) throw new Error('Decline request failed')
    if (!isSuccess(res)) throw new Error('Decline request failed')

    authService.fetchCustomerBalance().catch(() => {})

    return {
      data: res?.data,
      message: res?.message,
    }
  },

  getReqMoneyList: async ({ get_cust_data = true, recv_cust_id, req_cust_id } = {}) => {
    const body = {
      get_cust_data,
      ...(recv_cust_id !== undefined && { recv_cust_id }),
      ...(req_cust_id !== undefined && { req_cust_id }),
    }

    const response = await fetch(REQ_MONEY_LIST, {
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
    if (!response.ok) throw new Error(res?.message || 'Failed to load request money list')
    if (!isSuccess(res)) throw new Error(res?.message || 'Failed to load request money list')

    return {
      data: res?.data?.list ?? [],
      message: res?.message,
    }
  },
}

export default receiveService
