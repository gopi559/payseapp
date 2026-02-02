import { getAuthToken, deviceId } from '../../services/api.jsx'
import {
  REQUEST_MONEY,
  PAY_REQUEST_MONEY,
  DECLINE_REQUEST_MONEY,
} from '../../utils/constant.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const receiveService = {

  requestMoney: async (cust_id, amount, remarks = '') => {
    const body = {
      cust_id: Number(cust_id),
      amount: Number(amount),
      remarks: String(remarks || '').trim() || undefined,
    }
    const response = await fetch(REQUEST_MONEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify(body),
    })
    const res = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(res?.message || 'Request money failed')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Request money failed')
    }
    return {
      data: res?.data,
      message: res?.message,
    }
  },

  payRequestMoney: async (money_reqid, amount, remarks = '') => {
    const body = {
      money_reqid: Number(money_reqid),
      amount: Number(amount),
      remarks: String(remarks || '').trim() || undefined,
    }
    const response = await fetch(PAY_REQUEST_MONEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify(body),
    })
    const res = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(res?.message || 'Pay request failed')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Pay request failed')
    }
    return {
      data: res?.data,
      message: res?.message,
    }
  },

  declineRequestMoney: async (cust_id, amount, remarks = '') => {
    const body = {
      cust_id: Number(cust_id),
      amount: Number(amount),
      remarks: String(remarks || '').trim() || undefined,
    }
    const response = await fetch(DECLINE_REQUEST_MONEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify(body),
    })
    const res = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(res?.message || 'Decline request failed')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Decline request failed')
    }
    return {
      data: res?.data,
      message: res?.message,
    }
  },
}

export { receiveService }
