import Store from '../Redux/store'
import { login, logout } from '../Redux/auth.store'

export const authService = {
  sendOtp: async (mobileNumber) => {
    // Simulate OTP sending
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo, always return success
        // In real app, this would call an API
        resolve({ success: true, message: 'OTP sent successfully' })
      }, 1000)
    })
  },
  
  verifyOtp: async (mobileNumber, otp) => {
    // For demo, accept static OTP "111111"
    if (otp === '111111') {
      // Set user and authenticate directly
      Store.dispatch(login({ username: mobileNumber, name: mobileNumber, mobileNumber }))
      return { success: true }
    }
    return { success: false, error: 'Invalid OTP' }
  },
  
  login: async (username, password) => {
    // Static login - password is 111111
    if (password === '111111') {
      Store.dispatch(login({ username, name: username }))
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  },
  
  logout: () => {
    Store.dispatch(logout())
    localStorage.removeItem('reduxState')
  },
}

