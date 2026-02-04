import { getAuthToken, deviceId } from '../../services/api.jsx'
import {
  REQUEST_MONEY,
  PAY_REQUEST_MONEY,
  DECLINE_REQUEST_MONEY,
} from '../../utils/constant.jsx'
import { fetchCustomerBalance } from '../../Login/auth.service.jsx'

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

    fetchCustomerBalance().catch(() => {})

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

    fetchCustomerBalance().catch(() => {})

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

    fetchCustomerBalance().catch(() => {})

    return {
      data: res?.data,
      message: res?.message,
    }
  },
}

export default receiveService
