import { getAuthToken, deviceId } from '../../services/api.jsx'
import { CARD_NUMBER_VERIFY, WALLET_TO_CARD } from '../../utils/constant.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const walletToCardService = {

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

  walletToCard: async (card_number, txn_amount, remarks = '') => {
    const body = {
      card_number: String(card_number).trim().replace(/\s/g, ''),
      txn_amount: Number(txn_amount),
      remarks: String(remarks || '').trim() || undefined,
    }
    const response = await fetch(WALLET_TO_CARD, {
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
      throw new Error(res?.message || 'Wallet to card failed')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Wallet to card failed')
    }
    return {
      data: res?.data,
      message: res?.message,
    }
  },
}

export { walletToCardService }




