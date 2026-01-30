import { callApi } from '../../services/api.js'
import { CARD_LIST, CARD_FETCH } from '../../utils/constant.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'



const cardService = {



getList: async ({
  page = 1,
  num_data = 20,
  card_status,
  pin_status,
  customer_id,
} = {}) => {
  const body = {
    page,
    num_data,
  }

  if (card_status !== undefined) {
    body.card_status = card_status
  }

  if (pin_status !== undefined) {
    body.pin_status = pin_status
  }

  if (customer_id !== undefined) {
    body.customer_id = customer_id
  }

  const res = await callApi(CARD_LIST, body)

  if (!isSuccess(res)) {
    throw new Error(res?.message || "Failed to fetch card list")
  }

  return {
    data: res?.data ?? [],
    message: res?.message,
    pagination: res?.pagination,
  }
},


getCard: async (card_id) => {
  try {
    const res = await callApi(CARD_FETCH, {
      card_id: Number(card_id),
    })

    if (!isSuccess(res)) {
      throw new Error(res?.message || "Failed to fetch card details")
    }

    return {
      data: res?.data ?? null,
      message: res?.message,
    }
  } catch (error) {
    throw error
  }
},

}

export { cardService }
