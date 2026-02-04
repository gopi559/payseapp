import { API_CHATBOT_CHAT, API_CHATBOT_RETRIEVE_PREVIOUS } from '../../utils/constant'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const chatbotService = {

  sendChat: async ({ cust_id, message, new_chat = true }) => {
    const response = await fetch(API_CHATBOT_CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cust_id: String(cust_id),
        message: String(message),
        new_chat: Boolean(new_chat),
      }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || 'Chat request failed')
    if (!isSuccess(res)) throw new Error(res?.message || 'Chat request failed')

    return {
      data: res?.data ?? res,
      message: res?.message,
    }
  },

  retrievePreviousChat: async (cust_id) => {
    const id = cust_id != null && cust_id !== '' ? Number(cust_id) : null
    if (id == null || Number.isNaN(id) || id <= 0) {
      throw new Error('Valid customer ID is required')
    }

    const response = await fetch(API_CHATBOT_RETRIEVE_PREVIOUS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ cust_id: id }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || 'Retrieve previous chat failed')
    if (!isSuccess(res)) throw new Error(res?.message || 'Retrieve previous chat failed')

    return {
      data: res?.data ?? res,
      message: res?.message,
    }
  },

}

export { chatbotService }
