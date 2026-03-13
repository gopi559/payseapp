import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import {
  TRANSACTION_LIST,
  FETCH_BY_RRN,
  DISPUTE_LIST,
  SUBMIT_DISPUTE,
  RAISED_DISPUTE_LIST,
} from '../../utils/constant.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const transactionService = {
  getList: async ({
    page = 1,
    no_of_data = 20,
    success_only = true,
    get_user_details = true,
    start_time,
    end_time,
    beneficiary_id,
  } = {}) => {
    const body = {
      page,
      no_of_data,
      success_only,
      get_user_details,
      ...(start_time && { start_time }),
      ...(end_time && { end_time }),
      ...(beneficiary_id !== undefined && { beneficiary_id }),
    }

    const response = await fetchWithRefreshToken(TRANSACTION_LIST, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || '')
    if (!isSuccess(res)) throw new Error(res?.message || '')

    return {
      data: res?.data ?? [],
      message: res?.message,
      pagination: res?.pagination,
    }
  },

  fetchByRrn: async (rrn) => {
    if (!rrn || !String(rrn).trim()) throw new Error('')

    const response = await fetchWithRefreshToken(FETCH_BY_RRN, {
      method: 'POST',
      body: JSON.stringify({ rrn: String(rrn).trim() }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || '')
    if (!isSuccess(res)) throw new Error(res?.message || '')

    return {
      data: res?.data ?? null,
      message: res?.message,
    }
  },

  getDisputeList: async () => {
    const response = await fetchWithRefreshToken(DISPUTE_LIST, {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || '')
    if (!isSuccess(res)) throw new Error(res?.message || '')

    return {
      data: res?.data ?? [],
      message: res?.message,
    }
  },

  submitDispute: async ({ transaction_id, dispute_type_id, details }) => {
    const response = await fetchWithRefreshToken(SUBMIT_DISPUTE, {
      method: 'POST',
      body: JSON.stringify({
        transaction_id: Number(transaction_id),
        dispute_type_id: Number(dispute_type_id),
        details: String(details ?? '').trim(),
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

  getRaisedDisputeList: async ({ page = 1, no_of_data = 10 } = {}) => {
    const response = await fetchWithRefreshToken(RAISED_DISPUTE_LIST, {
      method: 'POST',
      body: JSON.stringify({ page, no_of_data }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || '')
    if (!isSuccess(res)) throw new Error(res?.message || '')

    return {
      data: res?.data ?? [],
      message: res?.message,
      pagination: res?.pagination,
    }
  },
}

export default transactionService
