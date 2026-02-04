export const CUSTOMER_BALANCE = `${MAIN_API_URL}/account/cust_bal`;
import { getAuthToken, deviceId } from '../../services/api.jsx'
import { CARD_TO_WALLET_SEND_OTP, CARD_TO_WALLET_CNP } from '../../utils/constant.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const cashInService = {

  sendOtp: async ({ card_number, wallet_number, txn_amount }) => {
    const body = {
      card_number: card_number,
      wallet_number: wallet_number,
      txn_amount: txn_amount,
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
    wallet_number,
    txn_amount,
    cvv,
    expiry_date,
    otp,
    rrn,
  }) => {
    const body = {
      card_number: String(card_number).trim().replace(/\s/g, ''),
      wallet_number: String(wallet_number).trim(),
      txn_amount: Number(txn_amount),
      cvv: String(cvv).trim(),
      expiry_date: String(expiry_date).trim(),
      otp: String(otp).trim(),
      rrn: String(rrn).trim(),
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

    return {
      data: res?.data ?? res,
      message: res?.message,
    }
  },
}

export default cashInService
