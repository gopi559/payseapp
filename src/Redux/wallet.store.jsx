import { createSlice } from '@reduxjs/toolkit'

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 50000.00,
    walletId: 'WALLET123456',
  },
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload
    },
    updateBalance: (state, action) => {
      state.balance = Math.max(0, state.balance + action.payload)
    },
    setWalletId: (state, action) => {
      state.walletId = action.payload
    },
    clearWalletData: (state) => {
      state.balance = 0
      state.walletId = ''
    },
  },
})

export const {
  setBalance,
  updateBalance,
  setWalletId,
  clearWalletData,
} = walletSlice.actions

export default walletSlice.reducer
