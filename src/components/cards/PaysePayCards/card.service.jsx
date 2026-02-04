import { getAuthToken, deviceId } from '../../../services/api.jsx'
import { CARD_LIST, CARD_FETCH } from '../../../utils/constant.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const cardService = {

  getList: async ({
    page = 1,
    num_data = 50,
    card_status,
    pin_status,
    customer_id,
  } = {}) => {
    const body = { page, num_data }
    if (card_status !== undefined) body.card_status = card_status
    if (pin_status !== undefined) body.pin_status = pin_status
    if (customer_id !== undefined) body.customer_id = customer_id

    const response = await fetch(CARD_LIST, {
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
      throw new Error(res?.message || 'Failed to fetch card list')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Failed to fetch card list')
    }
    return {
      data: res?.data ?? [],
      message: res?.message,
      pagination: res?.pagination,
    }
  },

  getCard: async (card_id) => {
    const response = await fetch(CARD_FETCH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
                deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({ card_id: Number(card_id) }),
    })
    const res = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(res?.message || 'Failed to fetch card details')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || 'Failed to fetch card details')
    }
    return {
      data: res?.data ?? null,
      message: res?.message,
    }
  },
}

export default cardService
