import { API_CHATBOT_CHAT, API_CHATBOT_RETRIEVE_PREVIOUS, API_CHATBOT_REQUEST_LIVE_AGENT, WS_CHATBOT_CUSTOMER } from '../../utils/constant'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS' || res?.success === true

/**
 * WebSocket manager for customer chat
 */
class CustomerWebSocket {
  constructor() {
    this.ws = null
    this.custId = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.messageHandlers = []
    this.onConnectionChange = null
  }

  connect(custId, onMessage, onConnectionChange) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.custId === custId) {
      return // Already connected
    }

    this.custId = custId
    this.onConnectionChange = onConnectionChange
    this.addMessageHandler(onMessage)
    this._connect()
  }

  _connect() {
    try {
      this.ws = new WebSocket(WS_CHATBOT_CUSTOMER)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        
        // Send authentication as first message
        if (this.custId) {
          this.ws.send(JSON.stringify({ cust_id: Number(this.custId) }))
        }
        
        if (this.onConnectionChange) {
          this.onConnectionChange(true)
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Handle connection confirmation
          if (data.status === 'connected' && data.cust_id) {
            console.log('WebSocket authenticated:', data)
            return
          }
          
          // Handle error messages
          if (data.error) {
            console.error('WebSocket error:', data.error)
            return
          }
          
          // Handle incoming messages from agent
          if (data.message || data.sender === 'agent') {
            this.messageHandlers.forEach(handler => {
              try {
                handler({
                  role: 'assistant',
                  text: data.message || data.text || '',
                  timestamp: data.timestamp || new Date().toISOString(),
                  sender: data.sender || 'agent',
                  cust_id: data.cust_id,
                })
              } catch (err) {
                console.error('Error in message handler:', err)
              }
            })
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnected = false
        if (this.onConnectionChange) {
          this.onConnectionChange(false)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket closed')
        this.isConnected = false
        if (this.onConnectionChange) {
          this.onConnectionChange(false)
        }
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.custId) {
          this.reconnectAttempts++
          setTimeout(() => {
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
            this._connect()
          }, this.reconnectDelay)
        }
      }
    } catch (err) {
      console.error('Failed to create WebSocket:', err)
      this.isConnected = false
      if (this.onConnectionChange) {
        this.onConnectionChange(false)
      }
    }
  }

  sendMessage(sessionId, message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected')
    }
    
    if (!sessionId || !message) {
      throw new Error('session_id and message are required')
    }

    const payload = {
      session_id: sessionId,
      message: message,
    }
    
    this.ws.send(JSON.stringify(payload))
  }

  addMessageHandler(handler) {
    if (typeof handler === 'function') {
      this.messageHandlers.push(handler)
    }
  }

  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.custId = null
    this.messageHandlers = []
    this.reconnectAttempts = 0
    if (this.onConnectionChange) {
      this.onConnectionChange(false)
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws?.readyState,
    }
  }
}

// Singleton instance
const customerWebSocket = new CustomerWebSocket()

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

  /**
   * WebSocket methods for real-time communication with agents
   */
  websocket: {
    connect: (custId, onMessage, onConnectionChange) => {
      return customerWebSocket.connect(custId, onMessage, onConnectionChange)
    },
    
    sendMessage: (sessionId, message) => {
      return customerWebSocket.sendMessage(sessionId, message)
    },
    
    disconnect: () => {
      return customerWebSocket.disconnect()
    },
    
    getConnectionStatus: () => {
      return customerWebSocket.getConnectionStatus()
    },
    
    addMessageHandler: (handler) => {
      return customerWebSocket.addMessageHandler(handler)
    },
    
    removeMessageHandler: (handler) => {
      return customerWebSocket.removeMessageHandler(handler)
    },
  },

}

export default chatbotService
