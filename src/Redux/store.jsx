import { configureStore, createSlice } from '@reduxjs/toolkit'
import merchantReducer from './MerchantSlice.jsx'
import mobileAppReducer from './MobileAppSlice.jsx'
import authTokenReducer from './AuthToken.jsx'
import { loadState, saveState } from './Middleware.jsx'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    token: null,
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
    login: (state, action) => {
      state.isAuthenticated = true
      if (action.payload && typeof action.payload === 'object' && ('user' in action.payload || 'token' in action.payload)) {
        state.user = action.payload.user ?? state.user
        state.token = action.payload.token ?? state.token
      } else {
        state.user = action.payload
      }
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
    },
  },
})

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

export const { setUser, setToken, setAuthenticated, login, logout } = authSlice.actions
export const { setWalletId, setBalance, updateBalance } = walletSlice.actions
export const { addTransaction, setTransactions, clearTransactions } = transactionSlice.actions

// Reference pattern: reducer object + preloadedState filtered to reducer keys only (avoids RTK warnings when old keys exist)
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
