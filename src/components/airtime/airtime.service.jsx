import { getAuthToken, deviceId } from '../../services/api.jsx'
import { AIRTIME_TXN_SEND, AIRTIME_TXN_SEND_OTP } from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const normalizeExpiry = (expiry) =>
  String(expiry).replace('/', '').trim()

const airtimeService = {
  sendOtp: async ({ card_number, txn_amount }) => {
    const body = {
      card_number: String(card_number).trim().replace(/\s/g, ''),
      txn_amount: Number(txn_amount),
    }

    const response = await fetch(AIRTIME_TXN_SEND_OTP, {
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

    const response = await fetch(AIRTIME_TXN_SEND, {
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
      throw new Error(res?.message || 'Airtime transaction failed')
    }

    authService.fetchCustomerBalance().catch(() => {})

    return { data: res?.data ?? res, message: res?.message }
  },
}

export default airtimeService
