import { getAuthToken, deviceId } from '../../services/api.jsx'
import {
  CARD_TO_WALLET_SEND_OTP,
  CARD_TO_WALLET_CNP,
  CARD_NUMBER_VERIFY,
  CARD_CHECK_BALANCE,
} from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const normalizeExpiry = (expiry) =>
  String(expiry).replace('/', '').trim() // "10/30" → "1030"

const cashInService = {
  /* ---------------- VERIFY CARD ---------------- */
  verifyCard: async (card_number) => {
    const body = {
      card_number: String(card_number).trim().replace(/\s/g, ''),
    }

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

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Card verification failed')
    }

    return { data: res?.data, message: res?.message }
  },

  /* ---------------- CHECK CARD BALANCE ---------------- */
  checkCardBalance: async ({ card_number }) => {
    const body = {
      card_number: String(card_number).trim(),
    }

    const response = await fetch(CARD_CHECK_BALANCE, {
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

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Balance check failed')
    }

    return { data: res?.data, message: res?.message }
  },

  /* ---------------- SEND OTP ---------------- */
  sendOtp: async ({ card_number, cvv, expiry_date, txn_amount }) => {
    const body = {
      card_number: String(card_number),
      cvv: String(cvv),
      expiry_date: normalizeExpiry(expiry_date), // IMPORTANT
      otp: '',
      txn_amount: Number(txn_amount),
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

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Send OTP failed')
    }

    return { data: res?.data ?? res, message: res?.message }
  },

  /* ---------------- CONFIRM CASH IN ---------------- */
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
      card_number: String(card_number),
      txn_amount: Number(txn_amount),
      cvv: String(cvv),
      expiry_date: normalizeExpiry(expiry_date), // MUST be MMYY
      otp: String(otp),
      rrn: String(rrn),
      stan: String(stan),
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

    if (!response.ok || !isSuccess(res)) {
      console.error('CNP 400 PAYLOAD →', body)
      throw new Error(res?.message || 'Cash in failed')
    }

    authService.fetchCustomerBalance().catch(() => {})

    return { data: res?.data ?? res, message: res?.message }
  },
}

export default cashInService
