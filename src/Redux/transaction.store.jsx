import { createSlice } from '@reduxjs/toolkit'

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: {
    transactions: [
      {
        id: '1',
        type: 'send',
        amount: 1000,
        recipient: 'John Doe',
        status: 'completed',
        date: new Date(Date.now() - 86400000).toISOString(),
        description: 'Payment to John Doe',
      },
      {
        id: '2',
        type: 'receive',
        amount: 2500,
        sender: 'Jane Smith',
        status: 'completed',
        date: new Date(Date.now() - 172800000).toISOString(),
        description: 'Received from Jane Smith',
      },
      {
        id: '3',
        type: 'cash_in',
        amount: 5000,
        status: 'completed',
        date: new Date(Date.now() - 259200000).toISOString(),
        description: 'Cash deposit',
      },
    ],
  },
  reducers: {
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload)
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload
    },
    clearTransactionData: (state) => {
      state.transactions = []
    },
  },
})

export const {
  addTransaction,
  setTransactions,
  clearTransactionData,
} = transactionSlice.actions

export default transactionSlice.reducer
