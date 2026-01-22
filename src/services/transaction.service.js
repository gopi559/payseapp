import { api } from './api'

export const transactionService = {
  getTransactions: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactions: [],
        })
      }, 500)
    })
  },
  
  getTransactionById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transaction: null,
        })
      }, 500)
    })
  },
}

