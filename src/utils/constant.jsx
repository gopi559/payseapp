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




export const BENIFICIARY_LIST = `${MAIN_API_URL}/card/beneficiary/list`;
export const BENIFICIARY_ADD = `${MAIN_API_URL}/card/beneficiary/add`;
export const BENIFICIARY_EDIT = `  ${MAIN_API_URL}/card/beneficiary/edit`;
export const BENIFICIARY_DELETE = `${MAIN_API_URL}/card/beneficiary/remove`;


export const CARD_TXN_LIST = `${MAIN_API_URL}/transaction_web/card/card_txn_list`;



//CHAT BOT DEV URLS

// export const CHATBOT_BASE_URL = "https://aml.innovitegra.in"



//CHAT BOT DC URLS
export const CHATBOT_BASE_URL = "https://api.dc.payseypayment.com/support"

//This is base url-https://api.dc.payseypayment.com/support/chatbot

export const API_CHATBOT_CHAT = `${CHATBOT_BASE_URL}/chatbot/chat`
export const API_CHATBOT_NEW_CHAT = `${CHATBOT_BASE_URL}/chatbot/chat`
export const API_CHATBOT_RETRIEVE_PREVIOUS = `${CHATBOT_BASE_URL}/chatbot/retrieve-previous-chat`
export const API_CHATBOT_PREVIOUS_CHAT = `${CHATBOT_BASE_URL}/chatbot/retrieve-previous-chat`

export const API_CHATBOT_REQUEST_LIVE_AGENT = `${CHATBOT_BASE_URL}/chatbot/request-live-agent`

// WebSocket URLs - use wss:// for secure (HTTPS) or ws:// for non-secure (HTTP)
// Function to get the correct WebSocket URL based on current protocol


export const getWebSocketUrl = (endpoint) => {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'wss:'
  const baseUrl = 'aml.innovitegra.in'
  return `${protocol}//${baseUrl}${endpoint}`
}

export const WS_CHATBOT_CUSTOMER = getWebSocketUrl('/chatbot/ws/customer')
export const WS_CHATBOT_AGENT = getWebSocketUrl('/chatbot/ws/agent')



export const VALIDATE_SENDMONEY_BEN = `${MAIN_API_URL}/transaction_web/customer/validate_sendmoney_ben`;
export const SEND_MONEY = `${MAIN_API_URL}/transaction_web/customer/send_money`;
export const GENERATE_TRANSACTION_OTP = `${MAIN_API_URL}/transaction_web/customer/generate_otp`;
export const VERIFY_TRANSACTION_OTP = `${MAIN_API_URL}/transaction_web/customer/verify_otp`;


export const CREATE_REQUEST_MONEY = `${MAIN_API_URL}/transaction_web/customer/txn_reqmoney`;
export const REQUEST_MONEY_LIST = `${MAIN_API_URL}/transaction_web/customer/reqmoney_list`;
export const PAY_REQUEST_MONEY = `${MAIN_API_URL}/transaction_web/customer/txn_pay_reqmoney`;
export const DECLINE_REQUEST_MONEY = `${MAIN_API_URL}/transaction_web/customer/txn_decline_reqmoney`;
export const REQUEST_MONEY_FETCH = `${MAIN_API_URL}/transaction_web/customer/reqmoney_fetch`;

export const REQUEST_MONEY = CREATE_REQUEST_MONEY;
export const REQ_MONEY_LIST = REQUEST_MONEY_LIST;





export const CARD_NUMBER_VERIFY = `${MAIN_API_URL}/external_card/cardname_inquiry`;
export const WALLET_TO_CARD = `${MAIN_API_URL}/external_card/wallet_to_card_cnp`;



export const EXTERNAL_BIN_LIST = `${MAIN_API_URL}/external_bin/list`;
export const BANK_MASTER_LIST = `${MAIN_API_URL}/bank_master/list`;
export const BENEFICIARY_BANK_LIST =
  'https://api.dc.payseypayment.com/webcust/beneficiary/bank/list?bank_id=0';
export const BENEFICIARY_BANK_ADD = `${MAIN_API_URL}/beneficiary/bank/add`;
export const BENEFICIARY_BANK_DELETE = `${MAIN_API_URL}/beneficiary/bank/delete`;
export const MERCHANT_BENEFICIARY_ADD = `${MAIN_API_URL}/transaction_webmerch/beneficiary/add`;
export const MERCHANT_BENEFICIARY_DELETE = `${MAIN_API_URL}/transaction_webmerch/beneficiary/delete`;

// ========================
// BANK_MASTER_LIST
// ========================

// URL
// GET http://WEBPROCESSOR_HOST:PORT/bank_master/list?status=1&auth_status=APPROVED&include_deleted=false

// Headers
// Authorization: Basic d2ViYWRtaW46NDk3MEZBQjI5OEUyNzFFNDMwMDEwMjM1RTlDODhFQTVFNDY3REVFRg==

// Body
// N/A (GET API)

// Response
// {
//   "message": "bank master list fetched successfully",
//   "status": "SUCCESS",
//   "code": 1,
//   "data": [
//     {
//       "id": 1,
//       "bank_name": "Sample Bank",
//       "bank_short_code": "SB",
//       "bank_code": "001",
//       "bank_short_name": "SBank",
//       "status": 1,
//       "process_status": 1,
//       "auth_status": "APPROVED",
//       "created_time": "2026-04-09T00:00:00Z",
//       "auth_time": "2026-04-09T00:00:00Z",
//       "created_userid": 1,
//       "auth_userid": 2,
//       "deauth_narration": "",
//       "deleted_by": 0,
//       "is_deleted": 0
//     }
//   ],
//   "api": "/bank_master/list"
// }

// ========================
// BENEFICIARY_BANK_LIST
// ========================

// URL
// GET https://api.dc.payseypayment.com/beneficiary/bank/list?bank_id=0

// Headers
// Authorization: Bearer <MERCHANT_TOKEN>
// Deviceinfo: {"device_id":"devtest","device_type":"WEBAPP","fcm_id":"dummy"}


export const TRANSACTION_LIST = `${MAIN_API_URL}/transaction_web/customer/txn_list`;
export const FETCH_BY_RRN= `${MAIN_API_URL}/transaction_web/customer/fetch_rrn`;


export const DISPUTE_LIST = `${MAIN_API_URL}/transaction_web/dispute/list`
export const SUBMIT_DISPUTE = `${MAIN_API_URL}/transaction_web/create/dispute`


export const RAISED_DISPUTE_LIST = `${MAIN_API_URL}/transaction_web/cust_dispute/list`

export const CASHCODE_LIST = `${MAIN_API_URL}/transaction_web/casecode/list_cashcode`

export const CASH_CODE_DATA = `${MAIN_API_URL}/transaction_web/casecode/fetch_cashcode`

export const CREATE_CASHCODE = `${MAIN_API_URL}/transaction_web/casecode/create_cashcode`

export const CARD_TO_WALLET_SEND_OTP = `${MAIN_API_URL}/external_card/card_to_wallet_cnp/send_otp`;


export const CARD_TO_WALLET_CNP = `${MAIN_API_URL}/external_card/card_to_wallet_cnp`;



export const CARD_TO_CARD_SEND_OTP = `${MAIN_API_URL}/external_card/card_to_card/send_otp`;
export const CARD_TO_CARD_TRANSFER = `${MAIN_API_URL}/external_card/card_to_card`;
export const PROFILE_IMAGE = `${MAIN_API_URL}/login/profile/image`
export const PROFILE_IMAGE_UPLOAD = `${MAIN_API_URL}/login/profile/image/upload`


export const CARD_CHECK_BALANCE = `${MAIN_API_URL}/external_card/balance_inquiry`


export const CARD_REQUEST_TYPE_LIST = `${MAIN_API_URL}/card/card_request_type_list`;
export const CARD_REQUEST = `${MAIN_API_URL}/card/card_req`;






export const VILLAGE_LIST = `${MAIN_API_URL}/village/list`;
export const NATIONALITY_LIST = `${MAIN_API_URL}/nationality/list`;
export const ID_TYPE_LIST = `${MAIN_API_URL}/id_type/list`;
export const PROVINCE_LIST = `${MAIN_API_URL}/province/list`;
export const DISTRICT_LIST = `${MAIN_API_URL}/district/list`;


export const LOGIN_BANNER_LIST = `${MAIN_API_URL}/login/banner/list`;
export const LOGIN_BANNER_IMAGE = `${MAIN_API_URL}/login/banner/image`;


export const AIRTIME_TXN_SEND_OTP = `${MAIN_API_URL}/airtime/txn_send_otp`;
export const AIRTIME_TXN_SEND = `${MAIN_API_URL}/airtime/txn_send`;

export const BILL_PAYMENT_INFO_CP = `${MAIN_API_URL}/web/transaction/onus/breshna/bill-details`;
export const BILL_PAYMENT_CNP = `${MAIN_API_URL}/web/transaction/onus/breshna/bill-payment`;



export const PERSONAL_INFORMATION_LIST = `${MAIN_API_URL}/personal_informations/list`;
export const PERSONAL_INFORMATION = `${MAIN_API_URL}/personal_informations`;
// export const DOCUMENT_LIST = `${MAIN_API_URL}/personal_documents/list`;

export const DOCUMENT_LIST = `https://backend.api-innovitegra.in/webcust/personal_documents`;


export const WALLET_TO_WALLET = `${MAIN_API_URL}/external_card/wallet_ext_wallet_cnp_703`;
  




export const BRESHNA_BILL_DETAILS_API = `${MAIN_API_URL}/transaction_web/customer/onus/breshna/bill-details`;

export const BRESHNA_BILL_PAYMENT_API = `${MAIN_API_URL}/transaction_web/customer/onus/breshna/bill-payment`;

export const AIRTIME_RECHARGE_API = `${MAIN_API_URL}/transaction_web/customer/onus/airtime/recharge`;




export const GB_BALANCE_CUSTOMER = `${MAIN_API_URL}/transaction_webcust/web/wallet/gb_balance`;
export const GB_PUSH_CUSTOMER = `${MAIN_API_URL}/transaction_webcust/web/wallet/gb_push`;
export const GB_PULL_CUSTOMER = `${MAIN_API_URL}/transaction_webcust/web/wallet/gb_pull`;




 









// ========================
// GB_BALANCE_CUSTOMER
// ========================

// URL
// POST {{MAIN_API_URL_CUSTOMER}}/web/wallet/gb_balance

// Headers
// Content-Type: application/json
// Authorization: Bearer <CUSTOMER_JWT>
// Deviceinfo: {"device_id":"devtest","device_type":"WEBAPP","ClientRefId":1234567}

// Body
// {
//   "pin": "1234",
//   "wallet_no": "93708568993"
// }

// Response
// {
//   "message": "Success",
//   "status": "Success",
//   "code": 1,
//   "data": {
//     "wallet_no": "93708568993",
//     "external_ref_num": "004812982897",
//     "gb": {
//       "externalRefNum": "004812982897",
//       "accountNumber": "I029910000374",
//       "amount": "9412402.33",
//       "ccy": "AFN",
//       "respCode": "0",
//       "respMsg": "Success"
//     }
//   },
//   "api": "/web/wallet/gb_balance"
// }



// ========================
// GB_PUSH_CUSTOMER
// ========================

// URL
// POST {{MAIN_API_URL_CUSTOMER}}/web/wallet/gb_push

// Headers
// Content-Type: application/json
// Authorization: Bearer <CUSTOMER_JWT>
// Deviceinfo: {"device_id":"devtest","device_type":"WEBAPP","ClientRefId":1234567}

// Body
// {
//   "pin": "1234",
//   "wallet_no": "93708568993",
//   "amount": 40.00,
//   "currency": "AFN",
//   "remarks": "web gb push",
//   "auth_data": "<AUTH_DATA>"
// }

// Response
// {
//   "api": "/web/wallet/gb_push",
//   "code": 1,
//   "status": "Success",
//   "message": "Success",
//   "data": {
//     "wallet_no": "93708568993",
//     "external_ref_num": "004812982897",
//     "gb": {
//       "respCode": "0",
//       "respMsg": "Success"
//     },
//     "rrn": "1775634092625"
//   }
// }



// ========================
// GB_PULL_CUSTOMER
// ========================

// URL
// POST {{MAIN_API_URL_CUSTOMER}}/web/wallet/gb_pull

// Headers
// Content-Type: application/json
// Authorization: Bearer <CUSTOMER_JWT>
// Deviceinfo: {"device_id":"devtest","device_type":"WEBAPP","ClientRefId":1234567}

// Body
// {
//   "pin": "1234",
//   "wallet_no": "93708568993",
//   "amount": 40.00,
//   "currency": "AFN",
//   "remarks": "web gb pull",
//   "auth_data": "<AUTH_DATA>"
// }

// Response
// {
//   "message": "Success",
//   "status": "Success",
//   "code": 1,
//   "data": {
//     "rrn": "1775634092625",
//     "wallet_no": "93708568993",
//     "external_ref_num": "004812982897",
//     "amount": 40,
//     "gb": {
//       "respCode": "0",
//       "respMsg": "Success"
//     }
//   },
//   "api": "/web/wallet/gb_pull"
// }
