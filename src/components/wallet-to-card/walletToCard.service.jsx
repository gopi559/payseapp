import { getAuthToken, deviceId } from '../../services/api.jsx'
import {
  GENERATE_TRANSACTION_OTP,
  VERIFY_TRANSACTION_OTP,
  WALLET_TO_CARD,
} from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const walletToCardService = {
  /* ---------- SEND OTP (MOBILE) ---------- */
  sendOtp: async ({ mobile }) => {
    const response = await fetch(GENERATE_TRANSACTION_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({
        entity_type: 'MOBILE',
        entity_id: mobile,
      }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Failed to send OTP')
    }

    return res
  },

  verifyOtp: async ({ mobile, otp }) => {
    const response = await fetch(VERIFY_TRANSACTION_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({
        entity_type: 'MOBILE',
        entity_id: mobile,
        otp,
      }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'OTP verification failed')
    }

    return res
  },

  /* ---------- WALLET → CARD ---------- */
  walletToCard: async ({ to_card, txn_amount, remarks }) => {
    const response = await fetch(WALLET_TO_CARD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({
        card_number: String(to_card),
        txn_amount: Number(txn_amount),
        remarks,
      }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Wallet to card failed')
    }

    authService.fetchCustomerBalance().catch(() => {})

    return res
  },
}

export default walletToCardService
