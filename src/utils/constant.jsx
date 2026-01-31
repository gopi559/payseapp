// In dev use /webcust so Vite proxy avoids CORS; prod or explicit env use full URL
const MAIN_API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/webcust' : 'https://backend.api-innovitegra.in/webcust')


export const CHECK_MOBILE  = MAIN_API_URL + "/login/check-mobile";
export const GENERATE_OTP  = MAIN_API_URL + "/login/generate-otp";
export const VERIFY_OTP   = MAIN_API_URL + "/login/verify-otp";

export const CARD_LIST  = MAIN_API_URL + "/card/list";
export const CARD_FETCH = MAIN_API_URL + "/card/fetch";

export const CUSTOMER_GET_ACTIONS_CARD =MAIN_API_URL + "/card/status/list";

export const UPDATE_CARD_STATUS =MAIN_API_URL + "/card/status/update"; 

export const CUSTOMER_BALANCE = MAIN_API_URL + "/account/cust_bal";


export const CARD_REQUEST_TYPE_LIST = MAIN_API_URL + "/card/card_request_type_list";

export const CARD_REQUEST = MAIN_API_URL + "/card/card_req";



