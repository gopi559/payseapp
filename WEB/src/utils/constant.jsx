export const LOGIN_URL = import.meta.env.VITE_API_URL || "http://localhost:15042";

export const CHECK_MOBILE  = LOGIN_URL + "/login/check-mobile";
export const GENERATE_OTP  = LOGIN_URL + "/login/generate-otp";
export const VERIFY_OTP   = LOGIN_URL + "/login/verify-otp";
