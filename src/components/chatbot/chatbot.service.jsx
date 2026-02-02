import { API_CHATBOT_CHAT, API_CHATBOT_RETRIEVE_PREVIOUS } from '../../utils/constant'


export const sendChat = async ({ cust_id, message, new_chat = true }) => {
  const response = await fetch(API_CHATBOT_CHAT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cust_id: String(cust_id),
      message: String(message),
      new_chat: Boolean(new_chat),
    }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'Chat request failed')
  return data
}


export const retrievePreviousChat = async (cust_id) => {
  const id = cust_id != null && cust_id !== '' ? Number(cust_id) : null
  if (id == null || Number.isNaN(id) || id <= 0) {
    throw new Error('Valid customer ID is required')
  }
  const response = await fetch(API_CHATBOT_RETRIEVE_PREVIOUS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ cust_id: id }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'Retrieve previous chat failed')
  return data
}
