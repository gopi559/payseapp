import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import {
  FETCH_BY_RRN,
  GENERATE_TRANSACTION_OTP,
  VERIFY_TRANSACTION_OTP,
  WALLET_TO_CARD,
} from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const walletToCardService = {
  sendOtp: async ({ mobile }) => {
    const response = await fetchWithRefreshToken(GENERATE_TRANSACTION_OTP, {
      method: 'POST',
      body: JSON.stringify({
        entity_type: 'MOBILE',
        entity_id: mobile,
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    return res
  },

  verifyOtp: async ({ mobile, otp }) => {
    const response = await fetchWithRefreshToken(VERIFY_TRANSACTION_OTP, {
      method: 'POST',
      body: JSON.stringify({
        entity_type: 'MOBILE',
        entity_id: mobile,
        otp,
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    return res
  },

  walletToCard: async ({ to_card, txn_amount, remarks }) => {
    const response = await fetchWithRefreshToken(WALLET_TO_CARD, {
      method: 'POST',
      body: JSON.stringify({
        card_number: String(to_card),
        txn_amount: Number(txn_amount),
        remarks,
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    authService.fetchCustomerBalance().catch(() => {})

    return res
  },

  fetchTransactionByRrn: async (rrn) => {
    const response = await fetchWithRefreshToken(FETCH_BY_RRN, {
      method: 'POST',
      body: JSON.stringify({ rrn }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    return res
  },
}

export default walletToCardService
