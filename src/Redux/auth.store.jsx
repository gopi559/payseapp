import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload
    },
    login: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
    },
    clearUserData: (state) => {
      state.isAuthenticated = false
      state.user = null
    },
  },
})

export const {
  setUser,
  setAuthenticated,
  login,
  logout,
  clearUserData,
} = authSlice.actions

export default authSlice.reducer
