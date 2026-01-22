import { create } from 'zustand'

export const useTransactionStore = create((set) => ({
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
  
  addTransaction: (transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }))
  },
  
  getTransaction: (id) => {
    const state = useTransactionStore.getState()
    return state.transactions.find((t) => t.id === id)
  },
}))

