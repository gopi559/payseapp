import fetchWithRefreshToken from '../../../services/fetchWithRefreshToken.js'
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
    const body = {
      page,
      num_data,
      card_status,
      pin_status,
      customer_id,
    }

    const response = await fetchWithRefreshToken(CARD_LIST, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || '')
    if (!isSuccess(res)) throw new Error(res?.message || '')

    return {
      data: res?.data ?? [],
      message: res?.message,
      pagination: res?.pagination,
    }
  },

  getCard: async (card_id) => {
    const response = await fetchWithRefreshToken(CARD_FETCH, {
      method: 'POST',
      body: JSON.stringify({ card_id: Number(card_id) }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || '')
    if (!isSuccess(res)) throw new Error(res?.message || '')

    return {
      data: res?.data ?? null,
      message: res?.message,
    }
  },
}

export default cardService
