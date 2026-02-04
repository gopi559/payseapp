import { getAuthToken, deviceId } from '../../services/api.jsx'
import {
  VALIDATE_SENDMONEY_BEN,
  SEND_MONEY,
  GENERATE_TRANSACTION_OTP,
  VERIFY_TRANSACTION_OTP,
} from '../../utils/constant.jsx'
import { fetchCustomerBalance } from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const sendService = {

  validateBeneficiary: async (mobile) => {
    const response = await fetch(VALIDATE_SENDMONEY_BEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({ mobile: String(mobile).trim() }),
    })
    const res = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(res?.message || 'Failed to validate beneficiary')
    }
    if (!isSuccess(res) || !res?.data) {
      throw new Error(res?.message || 'Beneficiary validation failed')
    }
    return {
      data: res.data,
      message: res?.message,
    }
  },

  sendMoneyTransaction: async (receiver_id, amount, remarks = '') => {
    const body = {
      receiver_id: Number(receiver_id),
      amount: Number(amount),
      remarks: String(remarks || '').trim() || undefined,
    }
    const response = await fetch(SEND_MONEY, {
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
      throw new Error(res?.message || 'Send money failed')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Send money failed')
    }
    fetchCustomerBalance().catch(() => {})
    return {
      data: res?.data,
      message: res?.message,
    }
  },

  generateTransactionOtp: async (entity_type = 'MOBILE', entity_id) => {
    const response = await fetch(GENERATE_TRANSACTION_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({
        entity_type: String(entity_type),
        entity_id: String(entity_id).trim(),
      }),
    })
    const res = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(res?.message || 'Generate OTP failed')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Generate OTP failed')
    }
    return {
      data: res?.data ?? null,
      message: res?.message,
    }
  },

  verifyTransactionOtp: async (entity_type, entity_id, otp) => {
    const response = await fetch(VERIFY_TRANSACTION_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({
        entity_type: String(entity_type),
        entity_id: String(entity_id).trim(),
        otp: String(otp).trim(),
      }),
    })
    const res = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(res?.message || 'OTP verification failed')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'OTP verification failed')
    }
    return {
      data: res?.data,
      message: res?.message,
    }
  },
}

export { sendService }
