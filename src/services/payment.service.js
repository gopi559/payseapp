import { api } from './api'

export const paymentService = {
  sendMoney: async (recipient, amount, description) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `TXN${Date.now()}`,
          message: 'Payment successful',
        })
      }, 1000)
    })
  },
  
  requestMoney: async (amount, description) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          requestId: `REQ${Date.now()}`,
        })
      }, 1000)
    })
  },
  
  scanAndPay: async (qrData, amount) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `TXN${Date.now()}`,
        })
      }, 1000)
    })
  },
}


