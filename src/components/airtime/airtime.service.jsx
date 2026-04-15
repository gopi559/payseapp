import { getClientRefId } from '../../services/api.jsx'
import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import { AIRTIME_RECHARGE_API, AIRTIME_TXN_SEND, AIRTIME_TXN_SEND_OTP, FETCH_BY_RRN } from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const normalizeExpiry = (expiry) => String(expiry).replace('/', '').trim()

const airtimeService = {
  sendOtp: async ({ card_number, txn_amount }) => {
    const clientRefId = getClientRefId()
    const body = {
      card_number: String(card_number).trim().replace(/\s/g, ''),
      txn_amount: Number(txn_amount),
    }

    const response = await fetchWithRefreshToken(AIRTIME_TXN_SEND_OTP, {
      method: 'POST',
      headers: {
        client_ref_id: clientRefId,
      },
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    return { data: res?.data ?? res, message: res?.message }
  },

  sendAirtime: async ({
    card_number,
    txn_amount,
    cvv,
    expiry_date,
    otp,
    rrn,
    stan,
    mobile_no,
  }) => {
    const clientRefId = getClientRefId()
    const body = {
      card_number: String(card_number).trim().replace(/\s/g, ''),
      txn_amount: Number(txn_amount),
      cvv: String(cvv).trim(),
      expiry_date: normalizeExpiry(expiry_date),
      otp: String(otp).trim(),
      rrn: String(rrn).trim(),
      stan: String(stan).trim(),
      mobile_no: String(mobile_no).trim(),
    }

    const response = await fetchWithRefreshToken(AIRTIME_TXN_SEND, {
      method: 'POST',
      headers: {
        client_ref_id: clientRefId,
      },
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    authService.fetchCustomerBalance().catch(() => {})

    return { data: res?.data ?? res, message: res?.message }
  },

  rechargeOwnCardAirtime: async ({
    mobile_no,
    txn_amount,
  }) => {
    const body = {
      mobile_no: String(mobile_no).trim(),
      txn_amount: Number(txn_amount),
    }

    const response = await fetchWithRefreshToken(AIRTIME_RECHARGE_API, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
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
      throw new Error(res?.message || '')
    }

    return { data: res?.data ?? null, message: res?.message }
  },
}

export default airtimeService
