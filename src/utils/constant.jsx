const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend.api-innovitegra.in/webcust'
export const LOGIN_URL = RAW_BASE_URL.replace(/\/$/, '')

export const CHECK_MOBILE  = LOGIN_URL + "/login/check_mobile";
export const GENERATE_OTP  = LOGIN_URL + "/login/generate-otp";
export const VERIFY_OTP   = LOGIN_URL + "/login/verify-otp";
