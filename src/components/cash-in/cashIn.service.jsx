import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import {
  CARD_TO_WALLET_SEND_OTP,
  CARD_TO_WALLET_CNP,
  CARD_NUMBER_VERIFY,
  CARD_CHECK_BALANCE,
  FETCH_BY_RRN,
} from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const normalizeExpiry = (expiry) =>
  String(expiry).replace('/', '').trim()

const cashInService = {
  verifyCard: async (card_number) => {
    const response = await fetchWithRefreshToken(CARD_NUMBER_VERIFY, {
      method: 'POST',
      body: JSON.stringify({
        card_number: String(card_number).trim().replace(/\s/g, ''),
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Card verification failed')
    }

    return { data: res?.data, message: res?.message }
  },

  checkCardBalance: async ({ card_number, cvv, expiry_date }) => {
    const response = await fetchWithRefreshToken(CARD_CHECK_BALANCE, {
      method: 'POST',
      body: JSON.stringify({
        card_number: String(card_number).trim(),
        cvv: String(cvv),
        expiry_date: normalizeExpiry(expiry_date),
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Balance check failed')
    }

    return { data: res?.data, message: res?.message }
  },

  sendOtp: async ({ card_number, cvv, expiry_date, txn_amount }) => {
    const response = await fetchWithRefreshToken(CARD_TO_WALLET_SEND_OTP, {
      method: 'POST',
      body: JSON.stringify({
        card_number: String(card_number),
        cvv: String(cvv),
        expiry_date: normalizeExpiry(expiry_date),
        otp: '',
        txn_amount: Number(txn_amount),
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Send OTP failed')
    }

    return { data: res?.data ?? res, message: res?.message }
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
      card_number: String(card_number),
      txn_amount: Number(txn_amount),
      cvv: String(cvv),
      expiry_date: normalizeExpiry(expiry_date),
      otp: String(otp),
      rrn: String(rrn),
      stan: String(stan),
    }

    const response = await fetchWithRefreshToken(CARD_TO_WALLET_CNP, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || !isSuccess(res)) {
      console.error('CNP 400 PAYLOAD ->', body)
      throw new Error(res?.message || 'Cash in failed')
    }

    authService.fetchCustomerBalance().catch(() => {})

    return { data: res?.data ?? res, message: res?.message }
  },

  fetchTransactionByRrn: async (rrn) => {
    const response = await fetchWithRefreshToken(FETCH_BY_RRN, {
      method: 'POST',
      body: JSON.stringify({
        rrn: String(rrn || '').trim(),
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Failed to fetch transaction details')
    }

    return { data: res?.data ?? null, message: res?.message }
  },
}

export default cashInService
