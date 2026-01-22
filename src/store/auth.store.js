import { create } from 'zustand'

// Load initial state from localStorage
const loadState = () => {
  try {
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error loading auth state:', e)
  }
  return {
    isAuthenticated: false,
    user: null,
    isPasscodeSet: false,
  }
}

// Save state to localStorage
const saveState = (state) => {
  try {
    localStorage.setItem('auth-storage', JSON.stringify(state))
  } catch (e) {
    console.error('Error saving auth state:', e)
  }
}

export const useAuthStore = create((set, get) => {
  const initialState = loadState()
  
  return {
    ...initialState,
    
    verifyOtp: (mobileNumber, otp) => {
      // For demo, accept static OTP "111111"
      // In real app, this would verify with backend
      if (otp === '111111') {
        const newState = {
          isAuthenticated: true,
          user: { username: mobileNumber, name: mobileNumber, mobileNumber },
          isPasscodeSet: get().isPasscodeSet,
        }
        set(newState)
        saveState(newState)
        return { success: true }
      }
      return { success: false, error: 'Invalid OTP' }
    },
    
    login: (username, password) => {
      // Static login - password is 111111
      if (password === '111111') {
        const newState = {
          isAuthenticated: true,
          user: { username, name: username },
          isPasscodeSet: get().isPasscodeSet,
        }
        set(newState)
        saveState(newState)
        return { success: true }
      }
      return { success: false, error: 'Invalid credentials' }
    },
    
    setPasscode: (passcode) => {
      const newState = {
        ...get(),
        isPasscodeSet: true,
      }
      set(newState)
      saveState(newState)
      return { success: true }
    },
    
    verifyPasscode: (passcode) => {
      // For demo, accept any 6-digit passcode
      if (passcode && passcode.length === 6) {
        const newState = {
          ...get(),
          isAuthenticated: true,
        }
        set(newState)
        saveState(newState)
        return { success: true }
      }
      return { success: false, error: 'Invalid passcode' }
    },
    
    logout: () => {
      const newState = {
        isAuthenticated: false,
        user: null,
        isPasscodeSet: false,
      }
      set(newState)
      localStorage.removeItem('auth-storage')
    },
  }
})

