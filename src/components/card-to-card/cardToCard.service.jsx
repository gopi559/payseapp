import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import {
  CARD_TO_CARD_TRANSFER,
  CARD_TO_CARD_SEND_OTP,
  CARD_NUMBER_VERIFY,
} from '../../utils/constant.jsx'
import { validateTransactionCards } from '../../services/binValidation.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const cardToCardService = {
  verifyCard: async (card_number) => {
    const body = { card_number: String(card_number).trim().replace(/\s/g, '') }

    const response = await fetchWithRefreshToken(CARD_NUMBER_VERIFY, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(res?.message || '')
    }
    if (!isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    return {
      data: res?.data,
      message: res?.message,
    }
  },

  sendOtp: async ({ from_card, to_card, cvv, expiry_date, txn_amount }) => {
    await validateTransactionCards({
      transactionType: 'CARD_TO_CARD',
      sourceCard: from_card,
      destinationCard: to_card,
    })

    const body = {
      from_card: String(from_card).trim().replace(/\s/g, ''),
      to_card: String(to_card).trim().replace(/\s/g, ''),
      cvv: String(cvv).trim(),
      expiry_date: String(expiry_date).replace('/', '').trim(),
      otp: '',
      txn_amount: parseFloat(txn_amount),
    }

    const response = await fetchWithRefreshToken(CARD_TO_CARD_SEND_OTP, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || '')
    if (!isSuccess(res)) throw new Error(res?.message || '')

    return {
      data: res?.data ?? res,
      message: res?.message,
    }
  },

  confirmCardToCard: async ({
    from_card,
    to_card,
    txn_amount,
    cvv,
    expiry_date,
    otp,
    rrn,
    stan,
  }) => {
    await validateTransactionCards({
      transactionType: 'CARD_TO_CARD',
      sourceCard: from_card,
      destinationCard: to_card,
    })

    const body = {
      from_card: String(from_card).trim().replace(/\s/g, ''),
      to_card: String(to_card).trim().replace(/\s/g, ''),
      txn_amount: parseFloat(txn_amount),
      cvv: String(cvv).trim(),
      expiry_date: String(expiry_date).replace('/', '').trim(),
      otp: String(otp).trim(),
      ...(rrn && { rrn: String(rrn).trim() }),
      ...(stan && { stan: String(stan).trim() }),
    }

    const response = await fetchWithRefreshToken(CARD_TO_CARD_TRANSFER, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || '')
    if (!isSuccess(res)) throw new Error(res?.message || '')

    authService.fetchCustomerBalance().catch(() => {})

    return {
      data: res?.data ?? res,
      message: res?.message,
    }
  },
}

export default cardToCardService
