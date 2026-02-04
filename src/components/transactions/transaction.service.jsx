import { getAuthToken, deviceId } from '../../services/api.jsx'
import { TRANSACTION_LIST, FETCH_BY_RRN, DISPUTE_LIST, SUBMIT_DISPUTE, RAISED_DISPUTE_LIST } from '../../utils/constant.jsx'

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

    const response = await fetch(TRANSACTION_LIST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || 'Failed to load transactions')
    if (!isSuccess(res)) throw new Error(res?.message || 'Failed to load transactions')

    return {
      data: res?.data ?? [],
      message: res?.message,
      pagination: res?.pagination,
    }
  },

  fetchByRrn: async (rrn) => {
    if (!rrn || !String(rrn).trim()) throw new Error('RRN is required')

    const response = await fetch(FETCH_BY_RRN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({ rrn: String(rrn).trim() }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || 'Failed to fetch by RRN')
    if (!isSuccess(res)) throw new Error(res?.message || 'Failed to fetch by RRN')

    return {
      data: res?.data ?? null,
      message: res?.message,
    }
  },

  getDisputeList: async () => {
    const response = await fetch(DISPUTE_LIST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({}),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || 'Failed to load dispute types')
    if (!isSuccess(res)) throw new Error(res?.message || 'Failed to load dispute types')

    return {
      data: res?.data ?? [],
      message: res?.message,
    }
  },

  submitDispute: async ({ transaction_id, dispute_type_id, details }) => {
    const response = await fetch(SUBMIT_DISPUTE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({
        transaction_id: Number(transaction_id),
        dispute_type_id: Number(dispute_type_id),
        details: String(details ?? '').trim(),
      }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || 'Failed to submit dispute')
    if (!isSuccess(res)) throw new Error(res?.message || 'Failed to submit dispute')

    return {
      data: res?.data,
      message: res?.message,
    }
  },

  getRaisedDisputeList: async ({ page = 1, no_of_data = 10 } = {}) => {
    const response = await fetch(RAISED_DISPUTE_LIST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
      },
      body: JSON.stringify({ page, no_of_data }),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok) throw new Error(res?.message || 'Failed to load disputes')
    if (!isSuccess(res)) throw new Error(res?.message || 'Failed to load disputes')

    return {
      data: res?.data ?? [],
      message: res?.message,
      pagination: res?.pagination,
    }
  },

}

export { transactionService }

