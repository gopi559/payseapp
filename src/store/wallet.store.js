import { create } from 'zustand'

export const useWalletStore = create((set) => ({
  balance: 50000.00,
  walletId: 'WALLET123456',
  
  updateBalance: (amount) => {
    set((state) => ({
      balance: Math.max(0, state.balance + amount),
    }))
  },
  
  setBalance: (amount) => {
    set({ balance: amount })
  },
}))

