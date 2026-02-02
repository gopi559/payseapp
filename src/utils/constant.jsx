export const MAIN_API_URL = import.meta.env.VITE_API_BASE_URL 

export const CHECK_MOBILE = `${MAIN_API_URL}/webcust/login/check-mobile`
export const GENERATE_OTP = `${MAIN_API_URL}/webcust/login/generate-otp`
export const VERIFY_OTP = `${MAIN_API_URL}/webcust/login/verify-otp`
export const LOGOUT_API_URL = `${MAIN_API_URL}/webcust/auth/logout`

export const CARD_LIST = `${MAIN_API_URL}/webcust/card/list`
export const CARD_FETCH = `${MAIN_API_URL}/webcust/card/fetch`

export const CUSTOMER_GET_ACTIONS_CARD =`${MAIN_API_URL}/webcust/card/status/list`;

export const UPDATE_CARD_STATUS =`${MAIN_API_URL}/webcust/card/status/update`; 

export const CUSTOMER_BALANCE = `${MAIN_API_URL}/webcust/account/cust_bal`;


export const CARD_REQUEST_TYPE_LIST = `${MAIN_API_URL}/webcust/card/card_request_type_list`;
export const CARD_REQUEST = `${MAIN_API_URL}/webcust/card/card_req`;


export const BENIFICIARY_LIST = `${MAIN_API_URL}/webcust/card/beneficiary/list`;
export const BENIFICIARY_ADD = `${MAIN_API_URL}/webcust/card/beneficiary/add`;
export const BENIFICIARY_EDIT = `${MAIN_API_URL}/webcust/card/beneficiary/edit`;
export const BENIFICIARY_DELETE = `${MAIN_API_URL}/webcust/card/beneficiary/remove`;







// Chatbot: https://aml.innovitegra.in/chatbot/chat (body: cust_id, message, new_chat)
//          https://aml.innovitegra.in/chatbot/Retreive-Previous-chat (body: cust_id)
export const CHATBOT_BASE_URL = 'https://aml.innovitegra.in'
export const API_CHATBOT_CHAT = `${CHATBOT_BASE_URL}/chatbot/chat`
export const API_CHATBOT_RETRIEVE_PREVIOUS = `${CHATBOT_BASE_URL}/chatbot/Retreive-Previous-chat`