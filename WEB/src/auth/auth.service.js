import Store from '../Redux/store'
import { login, logout } from '../Redux/auth.store'
import { api } from '../services/api'
import { CHECK_MOBILE, GENERATE_OTP, VERIFY_OTP } from '../utils/constant.jsx'
import { cacheCurrentLocation } from '../utils/deviceLocation'

const isSuccessResponse = (res) => res?.code === 1 || res?.status === 'SUCCESS'

const toErrorMessage = (err) => {
  if (!err) return 'Something went wrong'
  if (typeof err === 'string') return err
  return err?.payload?.message || err?.message || 'Something went wrong'
}

export const authService = {
  sendOtp: async (mobileNumber) => {
    try {
      // Best-effort: cache location for subsequent API calls (will prompt on first run if allowed).
      cacheCurrentLocation({ timeoutMs: 5000 }).catch(() => {})

      const check = await api.post(CHECK_MOBILE, { mobile: mobileNumber })
      if (!isSuccessResponse(check)) {
        return { success: false, error: check?.message || 'Failed to check mobile' }
      }

      const exists = Boolean(check?.data?.exists)
      if (!exists) {
        return { success: false, error: check?.message || 'Customer not found' }
      }

      const otpRes = await api.post(GENERATE_OTP, { mobile: mobileNumber })
      if (!isSuccessResponse(otpRes)) {
        return { success: false, error: otpRes?.message || 'Failed to generate OTP' }
      }

      return { success: true, message: otpRes?.message || 'OTP sent successfully', data: otpRes?.data }
    } catch (err) {
      return { success: false, error: toErrorMessage(err) }
    }
  },
  
  verifyOtp: async (mobileNumber, otp) => {
    try {
      cacheCurrentLocation({ timeoutMs: 5000 }).catch(() => {})

      const res = await api.post(VERIFY_OTP, { mobile: mobileNumber, otp })
      if (!isSuccessResponse(res)) {
        return { success: false, error: res?.message || 'OTP verification failed' }
      }

      const token = res?.data?.token || null
      const regInfo = res?.data?.reg_info || null

      Store.dispatch(
        login({
          user: {
            ...regInfo,
            mobile: regInfo?.mobile ?? mobileNumber,
            mfa_id: res?.data?.mfa_id ?? null,
            session_expiry_unit: res?.data?.session_expiry_unit ?? null,
            session_expiry_timeout: res?.data?.session_expiry_timeout ?? null,
            user_inactivity_timeout: res?.data?.user_inactivity_timeout ?? null,
            user_kyc: res?.data?.user_kyc ?? null,
            corp_details: res?.data?.corp_details ?? null,
          },
          token,
        })
      )

      return { success: true, message: res?.message || 'Login successful', data: res?.data }
    } catch (err) {
      return { success: false, error: toErrorMessage(err) }
    }
  },
  
  login: async (username, password) => {
    // Legacy fallback (if still used somewhere)
    if (password === '111111') {
      Store.dispatch(login({ user: { username, name: username }, token: null }))
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  },
  
  logout: () => {
    Store.dispatch(logout())
    localStorage.removeItem('reduxState')
  },
}

