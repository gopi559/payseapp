import { configureStore, createSlice } from '@reduxjs/toolkit'
import merchantReducer from './MerchantSlice.jsx'
import mobileAppReducer from './MobileAppSlice.jsx'
import authTokenReducer from './AuthToken.jsx'
import { loadState, saveState } from './Middleware.jsx'

/* ===================== AUTH SLICE ===================== */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    token: null,
    profileImage: null,
    profileImageId: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    },
    setToken: (state, action) => {
      state.token = action.payload
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload
    },

    setProfileImage: (state, action) => {
      if (state.profileImage && state.profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(state.profileImage)
      }

      state.profileImage = action.payload?.url ?? null
      state.profileImageId = action.payload?.id ?? null
    },

    login: (state, action) => {
      state.isAuthenticated = true

      if (state.profileImage && state.profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(state.profileImage)
      }

      state.profileImage = null
      state.profileImageId = null

      if (
        action.payload &&
        typeof action.payload === 'object' &&
        ('user' in action.payload || 'token' in action.payload)
      ) {
        state.user = action.payload.user ?? null
        state.token = action.payload.token ?? null
      } else {
        state.user = action.payload
      }
    },

    logout: (state) => {
      if (state.profileImage && state.profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(state.profileImage)
      }

      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.profileImage = null
      state.profileImageId = null
    },
  },
})

/* ===================== WALLET SLICE ===================== */
const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,
    walletId: '',
  },
  reducers: {
    setWalletId: (state, action) => {
      state.walletId = action.payload
    },
    setBalance: (state, action) => {
      state.balance = action.payload
    },
    updateBalance: (state, action) => {
      const delta = Number(action.payload) || 0
      state.balance = Number(state.balance || 0) + delta
    },
  },
})

/* ===================== TRANSACTION SLICE ===================== */
const transactionSlice = createSlice({
  name: 'transaction',
  initialState: {
    transactions: [],
  },
  reducers: {
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload)
    },
    setTransactions: (state, action) => {
      state.transactions = Array.isArray(action.payload) ? action.payload : []
    },
    clearTransactions: (state) => {
      state.transactions = []
    },
  },
})

/* ===================== EXPORT ACTIONS ===================== */
export const {
  setUser,
  setToken,
  setAuthenticated,
  setProfileImage,
  login,
  logout,
} = authSlice.actions

export const {
  setWalletId,
  setBalance,
  updateBalance,
} = walletSlice.actions

export const {
  addTransaction,
  setTransactions,
  clearTransactions,
} = transactionSlice.actions

/* ===================== STORE CONFIG ===================== */
const reducer = {
  auth: authSlice.reducer,
  token: authTokenReducer,
  wallet: walletSlice.reducer,
  transaction: transactionSlice.reducer,
  merchant: merchantReducer,
  mobileApp: mobileAppReducer,
}

const loadedState = loadState()

const preloadedState =
  loadedState && typeof loadedState === 'object'
    ? Object.keys(reducer).reduce((acc, key) => {
        if (loadedState[key] !== undefined) acc[key] = loadedState[key]
        return acc
      }, {})
    : undefined

const Store = configureStore({
  reducer,
  preloadedState,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})

Store.subscribe(() => {
  saveState(Store.getState())
})

export default Store
