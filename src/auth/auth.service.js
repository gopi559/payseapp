import { useAuthStore } from '../store/auth.store'

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
    const { verifyOtp } = useAuthStore.getState()
    return verifyOtp(mobileNumber, otp)
  },
  
  login: async (username, password) => {
    const { login } = useAuthStore.getState()
    return login(username, password)
  },
  
  verifyPasscode: async (passcode) => {
    const { verifyPasscode } = useAuthStore.getState()
    return verifyPasscode(passcode)
  },
  
  setPasscode: async (passcode) => {
    const { setPasscode } = useAuthStore.getState()
    return setPasscode(passcode)
  },
  
  logout: () => {
    const { logout } = useAuthStore.getState()
    logout()
  },
}

