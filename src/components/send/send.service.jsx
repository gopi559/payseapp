import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import {
  VALIDATE_SENDMONEY_BEN,
  SEND_MONEY,
  GENERATE_TRANSACTION_OTP,
  VERIFY_TRANSACTION_OTP,
} from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const normalizeBeneficiaryData = (data) => {
  if (!data || typeof data !== 'object') return data

  const toUpper = (value) =>
    value == null ? value : String(value).toUpperCase()

  return {
    ...data,
    first_name: toUpper(data.first_name),
    middle_name: toUpper(data.middle_name),
    last_name: toUpper(data.last_name),
  }
}

const sendService = {
  validateBeneficiary: async (mobile) => {
    const response = await fetchWithRefreshToken(VALIDATE_SENDMONEY_BEN, {
      method: 'POST',
      body: JSON.stringify({
        mobile_number: String(mobile).trim(),
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok) throw new Error(res?.message || '')
    if (!isSuccess(res)) throw new Error(res?.message || '')
    if (!res?.data) throw new Error(res?.message || '')

    return {
      data: normalizeBeneficiaryData(res.data),
      message: res?.message,
    }
  },

  sendMoneyTransaction: async (
    receiver_id,
    amount,
    remarks = '',
    entity_type = ''
  ) => {
    const response = await fetchWithRefreshToken(SEND_MONEY, {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: Number(receiver_id),
        amount: Number(amount),
        remarks: String(remarks || '').trim() || undefined,
        entity_type: String(entity_type || '').trim() || undefined,
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok) throw new Error(res?.message || '')
    if (!isSuccess(res)) throw new Error(res?.message || '')

    authService.fetchCustomerBalance().catch(() => {})

    return {
      data: res?.data,
      message: res?.message,
    }
  },

  generateTransactionOtp: async (entity_type = 'MOBILE', entity_id) => {
    const response = await fetchWithRefreshToken(GENERATE_TRANSACTION_OTP, {
      method: 'POST',
      body: JSON.stringify({
        entity_type: String(entity_type),
        entity_id: String(entity_id).trim(),
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || !isSuccess(res)) {
      const error = new Error(res?.message || '')
      error.data = res?.data ?? null
      throw error
    }

    return {
      data: res?.data ?? null,
      message: res?.message,
    }
  },

  verifyTransactionOtp: async (entity_type, entity_id, otp) => {
    const response = await fetchWithRefreshToken(VERIFY_TRANSACTION_OTP, {
      method: 'POST',
      body: JSON.stringify({
        entity_type: String(entity_type),
        entity_id: String(entity_id).trim(),
        otp: String(otp).trim(),
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok) throw new Error(res?.message || '')
    if (!isSuccess(res)) throw new Error(res?.message || '')

    return {
      data: res?.data,
      message: res?.message,
    }
  },
}

export { sendService }
