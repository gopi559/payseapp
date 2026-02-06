import { API_CHATBOT_CHAT, API_CHATBOT_RETRIEVE_PREVIOUS, API_CHATBOT_REQUEST_LIVE_AGENT } from '../../utils/constant'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS' || res?.success === true

const chatbotService = {

  sendChat: async ({ cust_id, message, new_chat = true }) => {
    const response = await fetch(API_CHATBOT_CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cust_id,
        message,
        new_chat,
      }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error('Chat request failed')
    if (!isSuccess(res)) throw new Error('Chat request failed')

    return {
      data: res?.data ?? res,
      message: res?.message,
      response: res?.response,
      session_id: res?.session_id,
    }
  },

  retrievePreviousChat: async (cust_id) => {
    const id = Number(cust_id)
    if (!id || Number.isNaN(id)) throw new Error('Valid customer ID is required')

    const response = await fetch(API_CHATBOT_RETRIEVE_PREVIOUS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ cust_id: id }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error('Retrieve previous chat failed')
    if (!isSuccess(res)) throw new Error('Retrieve previous chat failed')

    return {
      data: res?.data ?? res,
      message: res?.message,
      chat_sessions: res?.chat_sessions,
    }
  },

  requestLiveAgent: async ({ session_id, cust_id, dispute_description }) => {
    const id = Number(cust_id)
    if (!id || Number.isNaN(id)) throw new Error('Valid customer ID is required')
    if (!session_id) throw new Error('Session ID is required')

    const response = await fetch(API_CHATBOT_REQUEST_LIVE_AGENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        session_id,
        cust_id: id,
        dispute_description: dispute_description || '',
      }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error('Request live agent failed')
    if (!isSuccess(res)) throw new Error('Request live agent failed')

    return {
      data: res?.data ?? res,
      success: res?.success,
      queue_id: res?.queue_id,
      dispute_logged: res?.dispute_logged,
      estimated_wait: res?.estimated_wait,
      message: res?.message,
      remark: res?.remark,
    }
  },

}

export default chatbotService
