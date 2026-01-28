import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth.store'
import walletReducer from './wallet.store'
import transactionReducer from './transaction.store'
import { loadState, saveState } from './Middleware'

// Load the persisted state safely
const preloadedState = loadState()

const Store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    transaction: transactionReducer,
  },
  preloadedState: preloadedState || undefined, // Set the preloaded state
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
    },
  }),
})

// Save the state to localStorage whenever it changes
let isSubscribed = false
if (!isSubscribed) {
  Store.subscribe(() => {
    try {
      saveState(Store.getState())
    } catch (error) {
      console.error('Error saving state:', error)
    }
  })
  isSubscribed = true
}

export default Store

