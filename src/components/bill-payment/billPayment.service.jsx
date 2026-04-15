import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import {
  BILL_PAYMENT_CNP,
  BILL_PAYMENT_INFO_CP,
  BRESHNA_BILL_DETAILS_API,
  BRESHNA_BILL_PAYMENT_API,
  CARD_NUMBER_VERIFY,
  FETCH_BY_RRN,
} from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const normalizeExpiry = (expiry) => String(expiry).replace('/', '').trim()

const normalizeBreshnaPayload = (payload, requestedAccountNo = '') => {
  const root = payload && typeof payload === 'object' ? payload : {}
  const nested = root?.breshna && typeof root.breshna === 'object' ? root.breshna : {}
  const nestedData = nested?.data && typeof nested.data === 'object' ? nested.data : {}

  return {
    ...root,
    ...nested,
    ...nestedData,
    breshna: { ...nested, ...nestedData },
    rrn: root?.rrn ?? nested?.rrn ?? nestedData?.rrn ?? null,
    breshna_account_no:
      root?.breshna_account_no ??
      nested?.breshna_account_no ??
      nestedData?.brishna_account_no ??
      nestedData?.breshna_account_no ??
      root?.breshna_account ??
      nested?.breshna_account ??
      String(requestedAccountNo).trim(),
    customer_name: nestedData?.customer_name ?? nested?.customer_name ?? root?.customer_name ?? null,
    customer_location: nestedData?.customer_location ?? nested?.customer_location ?? root?.customer_location ?? null,
    amount: nestedData?.amount ?? nested?.amount ?? root?.amount ?? null,
    bill_due_date: nestedData?.bill_due_date ?? nested?.bill_due_date ?? root?.bill_due_date ?? null,
  }
}

const billPaymentService = {
  verifyCard: async (card_number) => {
    const response = await fetchWithRefreshToken(CARD_NUMBER_VERIFY, {
      method: 'POST',
      body: JSON.stringify({
        card_number: String(card_number).trim().replace(/\s/g, ''),
      }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    return { data: res?.data ?? null, message: res?.message }
  },

  fetchBillInfoAndSendOtp: async ({
    card_number,
    txn_amount,
    bill_number,
    service_id,
    mobile_no,
    rrn = '',
    stan = '',
    otp = '',
  }) => {
    const body = {
      card_number: String(card_number).trim().replace(/\s/g, ''),
      txn_amount: String(txn_amount),
      bill_number: String(bill_number).trim(),
      service_id: String(service_id).trim(),
      otp: String(otp).trim(),
      rrn: String(rrn).trim(),
      stan: String(stan).trim(),
      mobile_no: String(mobile_no).trim(),
    }

    const response = await fetchWithRefreshToken(BILL_PAYMENT_INFO_CP, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    return { data: res?.data ?? res, message: res?.message }
  },

  payBill: async ({
    card_number,
    txn_amount,
    cvv,
    expiry_date,
    otp,
    rrn,
    service_id,
    stan,
    mobile_no,
  }) => {
    const body = {
      card_number: String(card_number).trim().replace(/\s/g, ''),
      txn_amount: String(txn_amount),
      cvv: String(cvv).trim(),
      expiry_date: normalizeExpiry(expiry_date),
      otp: String(otp).trim(),
      rrn: String(rrn).trim(),
      service_id: String(service_id).trim(),
      stan: String(stan).trim(),
      mobile_no: String(mobile_no).trim(),
    }

    const response = await fetchWithRefreshToken(BILL_PAYMENT_CNP, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    authService.fetchCustomerBalance().catch(() => {})

    return { data: res?.data ?? res, message: res?.message }
  },

  fetchBreshnaBillDetails: async ({ breshna_account_no }) => {
    const accountNo = String(breshna_account_no).trim()
    const response = await fetchWithRefreshToken(BRESHNA_BILL_DETAILS_API, {
      method: 'POST',
      body: JSON.stringify({
        breshna_account_no: accountNo,
      }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    return {
      data: normalizeBreshnaPayload(res?.data ?? res, accountNo),
      message: res?.message,
    }
  },

  payBreshnaBill: async ({
    breshna_account_no,
    txn_amount,
    rrn = '',
  }) => {
    const body = {
      breshna_account_no: String(breshna_account_no).trim(),
      txn_amount: Number(txn_amount),
    }

    if (String(rrn).trim()) {
      body.rrn = String(rrn).trim()
    }

    const response = await fetchWithRefreshToken(BRESHNA_BILL_PAYMENT_API, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    authService.fetchCustomerBalance().catch(() => {})

    return {
      data: normalizeBreshnaPayload(res?.data ?? res, breshna_account_no),
      message: res?.message,
    }
  },

  fetchTransactionByRrn: async (rrn) => {
    const response = await fetchWithRefreshToken(FETCH_BY_RRN, {
      method: 'POST',
      body: JSON.stringify({
        rrn: String(rrn || '').trim(),
      }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    return { data: res?.data ?? null, message: res?.message }
  },
}

export default billPaymentService
