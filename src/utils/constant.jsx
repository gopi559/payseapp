const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend.api-innovitegra.in/webcust'
export const LOGIN_URL = RAW_BASE_URL.replace(/\/$/, '')
export const MAIN_API_URL = LOGIN_URL

export const CHECK_MOBILE  = LOGIN_URL + "/login/check-mobile";
export const GENERATE_OTP  = LOGIN_URL + "/login/generate-otp";
export const VERIFY_OTP   = LOGIN_URL + "/login/verify-otp";

export const CARD_LIST  = LOGIN_URL + "/card/list";
export const CARD_FETCH = LOGIN_URL + "/card/fetch";

export const CUSTOMER_GET_ACTIONS_CARD =
  LOGIN_URL + "/card/status/list";

export const UPDATE_CARD_STATUS =
  MAIN_API_URL + "/card/status/update"; 

export const CUSTOMER_BALANCE = MAIN_API_URL + "/account/cust_bal";
