import { getAuthToken, deviceId } from '../../services/api.jsx'
import { CARD_TO_WALLET_SEND_OTP, CARD_TO_WALLET_CNP, CARD_NUMBER_VERIFY } from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const cashInService = {

  verifyCard: async (card_number) => {
    const body = { card_number: String(card_number).trim().replace(/\s/g, '') }
    const response = await fetch(CARD_NUMBER_VERIFY, {
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
      throw new Error(res?.message || 'Failed to verify card')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Card verification failed')
    }
    return {
      data: res?.data,
      message: res?.message,
    }
  },

  sendOtp: async ({ card_number, cvv, expiry_date, txn_amount }) => {
    const body = {
      card_number,
      cvv,
      expiry_date,
      otp: '',
      txn_amount: parseFloat(txn_amount),
    }

    const response = await fetch(CARD_TO_WALLET_SEND_OTP, {
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
    if (!response.ok) throw new Error(res?.message || 'Send OTP failed')
    if (!isSuccess(res)) throw new Error(res?.message || 'Send OTP failed')

    return {
      data: res?.data ?? res,
      message: res?.message,
    }
  },

  confirmCardToWallet: async ({
    card_number,
    txn_amount,
    cvv,
    expiry_date,
    otp,
    rrn,
    stan,
  }) => {
    const body = {
      card_number,
      txn_amount: parseFloat(txn_amount),
      cvv,
      expiry_date,
      otp,
      rrn,
      stan,
    }

    const response = await fetch(CARD_TO_WALLET_CNP, {
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
    if (!response.ok) throw new Error(res?.message || 'Cash in failed')
    if (!isSuccess(res)) throw new Error(res?.message || 'Cash in failed')

    authService.fetchCustomerBalance().catch(() => {})

    return {
      data: res?.data ?? res,
      message: res?.message,
    }
  },
}

export default cashInService
