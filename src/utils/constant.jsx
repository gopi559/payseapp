export const MAIN_API_URL = import.meta.env.VITE_API_BASE_URL 

export const CHECK_MOBILE = `${MAIN_API_URL}/login/check-mobile`
export const GENERATE_OTP = `${MAIN_API_URL}/login/generate-otp`
export const VERIFY_OTP = `${MAIN_API_URL}/login/verify-otp`
export const LOGOUT_API_URL = `${MAIN_API_URL}/auth/logout`

export const CARD_LIST = `${MAIN_API_URL}/card/list`
export const CARD_FETCH = `${MAIN_API_URL}/card/fetch`

export const CUSTOMER_GET_ACTIONS_CARD =`${MAIN_API_URL}/card/status/list`;

export const UPDATE_CARD_STATUS =`${MAIN_API_URL}/card/status/update`; 

export const CUSTOMER_BALANCE = `${MAIN_API_URL}/account/cust_bal`;


export const CARD_REQUEST_TYPE_LIST = `${MAIN_API_URL}/card/card_request_type_list`;
export const CARD_REQUEST = `${MAIN_API_URL}/card/card_req`;


export const BENIFICIARY_LIST = `${MAIN_API_URL}/card/beneficiary/list`;
export const BENIFICIARY_ADD = `${MAIN_API_URL}/card/beneficiary/add`;
export const BENIFICIARY_EDIT = `  ${MAIN_API_URL}/card/beneficiary/edit`;
export const BENIFICIARY_DELETE = `${MAIN_API_URL}/card/beneficiary/remove`;




export const CHATBOT_BASE_URL = "https://aml.innovitegra.in"

export const API_CHATBOT_CHAT = `${CHATBOT_BASE_URL}/chatbot/chat`
export const API_CHATBOT_NEW_CHAT = `${CHATBOT_BASE_URL}/chatbot/chat`
export const API_CHATBOT_RETRIEVE_PREVIOUS = `${CHATBOT_BASE_URL}/chatbot/retrieve-previous-chat`
export const API_CHATBOT_PREVIOUS_CHAT = `${CHATBOT_BASE_URL}/chatbot/retrieve-previous-chat`

export const API_CHATBOT_REQUEST_LIVE_AGENT = `${CHATBOT_BASE_URL}/chatbot/request-live-agent`

// WebSocket URLs - use wss:// for secure (HTTPS) or ws:// for non-secure (HTTP)
// Function to get the correct WebSocket URL based on current protocol


export const getWebSocketUrl = (endpoint) => {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const baseUrl = 'aml.innovitegra.in'
  return `${protocol}//${baseUrl}${endpoint}`
}

export const WS_CHATBOT_CUSTOMER = getWebSocketUrl('/chatbot/ws/customer')
export const WS_CHATBOT_AGENT = getWebSocketUrl('/chatbot/ws/agent')



export const VALIDATE_SENDMONEY_BEN = `${MAIN_API_URL}/transaction_web/customer/validate_sendmoney_ben`;
export const SEND_MONEY = `${MAIN_API_URL}/transaction_web/customer/send_money`;
export const GENERATE_TRANSACTION_OTP = `${MAIN_API_URL}/transaction_web/customer/generate_otp`;
export const VERIFY_TRANSACTION_OTP = `${MAIN_API_URL}/transaction_web/customer/verify_otp`;


export const REQUEST_MONEY =`${MAIN_API_URL}/transaction_web/customer/txn_reqmoney`;

export const PAY_REQUEST_MONEY =`${MAIN_API_URL}/transaction_web/customer/txn_pay_reqmoney`;
export const DECLINE_REQUEST_MONEY =`${MAIN_API_URL}/transaction_web/customer/txn_decline_reqmoney`;


export const CARD_NUMBER_VERIFY = `${MAIN_API_URL}/external_card/cardname_inquiry`;
export const WALLET_TO_CARD = `${MAIN_API_URL}/external_card/wallet_to_card_cnp`;


export const TRANSACTION_LIST = `${MAIN_API_URL}/transaction_web/customer/txn_list`;
export const FETCH_BY_RRN= `${MAIN_API_URL}/transaction_web/customer/fetch_rrn`;


export const DISPUTE_LIST = `${MAIN_API_URL}/transaction_web/dispute/list`
export const SUBMIT_DISPUTE = `${MAIN_API_URL}/transaction_web/create/dispute`


export const RAISED_DISPUTE_LIST = `${MAIN_API_URL}/transaction_web/cust_dispute/list`

export const CASHCODE_LIST = `${MAIN_API_URL}/transaction_web/casecode/list_cashcode`

export const CREATE_CASHCODE = `${MAIN_API_URL}/transaction_web/casecode/create_cashcode`

export const CARD_TO_WALLET_SEND_OTP = `${MAIN_API_URL}/external_card/card_to_wallet_cnp/send_otp`;


export const CARD_TO_WALLET_CNP = `${MAIN_API_URL}/external_card/card_to_wallet_cnp`;

export const REQ_MONEY_LIST = `${MAIN_API_URL}/transaction_web/customer/reqmoney_list`;


export const CARD_TO_CARD_SEND_OTP = `${MAIN_API_URL}/external_card/card_to_card/send_otp`;
export const CARD_TO_CARD_TRANSFER = `${MAIN_API_URL}/external_card/card_to_card`;
