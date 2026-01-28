import Store from '../Redux/store.jsx'
import { login, logout } from '../Redux/auth.store.jsx'
import { callApi } from '../services/api.js'
import { CHECK_MOBILE, GENERATE_OTP, VERIFY_OTP } from '../utils/constant.jsx'
import { cacheCurrentLocation } from '../utils/deviceLocation.js'

const isSuccessResponse = (res) => res?.code === 1 || res?.status === 'SUCCESS'

const toErrorMessage = (err) => {
  if (!err) return 'Something went wrong'
  if (typeof err === 'string') return err
  return err?.payload?.message || err?.message || 'Something went wrong'
}

export const authService = {
  sendOtp: async (mobileNumber) => {
    try {
      cacheCurrentLocation({ timeoutMs: 5000 }).catch(() => {})

      const check = await callApi(CHECK_MOBILE, { mobile: mobileNumber , entity:"mobile" })
      if (!isSuccessResponse(check)) {
        return { success: false, error: check?.message || 'Failed to check mobile' }
      }

      const exists = Boolean(check?.data?.exists)
      if (!exists) {
        return { success: false, error: check?.message || 'Customer not found' }
      }

      const otpRes = await callApi(GENERATE_OTP, { mobile: mobileNumber })
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

      const res = await callApi(VERIFY_OTP, { mobile: mobileNumber, otp })
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

