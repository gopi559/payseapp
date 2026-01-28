import { createSlice } from '@reduxjs/toolkit'

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
      // Backward compatible: allow login(payload) or login({ user, token })
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
    clearUserData: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
    },
  },
})

export const {
  setUser,
  setToken,
  setAuthenticated,
  login,
  logout,
  clearUserData,
} = authSlice.actions

export default authSlice.reducer
