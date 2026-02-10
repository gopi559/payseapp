import { getAuthToken, deviceId } from '../../services/api.jsx'
import { CARD_TO_CARD_TRANSFER, CARD_NUMBER_VERIFY } from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const cardToCardService = {
  verifyCard: async (card_number) => {
    const body = { card_number: String(card_number).trim().replace(/\s/g, '') }
    const response = await fetch(CARD_NUMBER_VERIFY, {
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

  cardToCard: async (from_card, to_card, txn_amount, cvv, expiry_date, otp) => {
    const body = {
      from_card: String(from_card).trim().replace(/\s/g, ''),
      to_card: String(to_card).trim().replace(/\s/g, ''),
      txn_amount: Number(txn_amount),
      cvv: String(cvv).trim(),
      expiry_date: String(expiry_date).trim(),
      otp: String(otp).trim(),
    }
    const response = await fetch(CARD_TO_CARD_TRANSFER, {
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
      throw new Error(res?.message || 'Card to card transfer failed')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Card to card transfer failed')
    }
    authService.fetchCustomerBalance().catch(() => {})
    return {
      data: res?.data,
      message: res?.message,
    }
  },
}

export default cardToCardService

