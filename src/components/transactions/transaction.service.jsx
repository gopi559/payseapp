import { getAuthToken, deviceId } from '../../services/api.jsx'
import { TRANSACTION_LIST, FETCH_BY_RRN, DISPUTE_LIST, SUBMIT_DISPUTE, RAISED_DISPUTE_LIST } from '../../utils/constant.jsx'

const defaultHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
  deviceInfo: JSON.stringify({
    device_type: 'WEB',
    device_id: deviceId,
  }),
})

// /**
//  * Fetch transaction list (paginated).
//  * @param {Object} params
//  * @param {number} [params.page=1]
//  * @param {number} [params.no_of_data=20]
//  * @param {boolean} [params.get_user_details=true]
//  * @param {boolean} [params.success_only] - optional
//  * @param {string} [params.start_time] - optional e.g. "2026-02-01T00:00:00"
//  * @param {string} [params.end_time] - optional e.g. "2026-02-02T23:59:59"
//  * @param {number} [params.beneficiary_id] - optional
//  * @returns {Promise<{ data: Array, message?: string }>}
//  */
export async function getTransactionList(params = {}) {
  const body = {
    page: params.page ?? 1,
    success_only: params.success_only ?? true,
    no_of_data: params.no_of_data ?? 20,
    get_user_details: params.get_user_details ?? true,
  }
  if (params.start_time) body.start_time = params.start_time
  if (params.end_time) body.end_time = params.end_time
  if (params.beneficiary_id != null) body.beneficiary_id = params.beneficiary_id

  const res = await fetch(TRANSACTION_LIST, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(body),
  })
  const result = await res.json().catch(() => null)
  if (!res.ok) throw new Error(result?.message || 'Failed to load transactions')
  if (result?.code !== 1) throw new Error(result?.message || 'Failed to load transactions')
  return { data: Array.isArray(result?.data) ? result.data : [], message: result?.message }
}

// /**
//  * Fetch a single transaction by RRN.
//  * @param {string} rrn
//  * @returns {Promise<{ data: object | null, message?: string }>}
//  */
export async function fetchByRrn(rrn) {
  if (!rrn || !String(rrn).trim()) throw new Error('RRN is required')
  const res = await fetch(FETCH_BY_RRN, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify({ rrn: String(rrn).trim() }),
  })
  const result = await res.json().catch(() => null)
  if (!res.ok) throw new Error(result?.message || 'Failed to fetch by RRN')
  if (result?.code !== 1) throw new Error(result?.message || 'Failed to fetch by RRN')
  return { data: result?.data ?? null, message: result?.message }
}

/** Fetch dispute types for Raise Dispute dropdown */
export async function getDisputeList() {
  const res = await fetch(DISPUTE_LIST, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify({}),
  })
  const result = await res.json().catch(() => null)
  if (!res.ok) throw new Error(result?.message || 'Failed to load dispute types')
  if (result?.code !== 1) throw new Error(result?.message || 'Failed to load dispute types')
  return { data: Array.isArray(result?.data) ? result.data : [], message: result?.message }
}

/** Submit a dispute. Payload: transaction_id, dispute_type_id, details */
export async function submitDispute(payload) {
  const { transaction_id, dispute_type_id, details } = payload
  const res = await fetch(SUBMIT_DISPUTE, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify({
      transaction_id: Number(transaction_id),
      dispute_type_id: Number(dispute_type_id),
      details: String(details ?? '').trim(),
    }),
  })
  const result = await res.json().catch(() => null)
  if (!res.ok) throw new Error(result?.message || 'Failed to submit dispute')
  if (result?.code !== 1) throw new Error(result?.message || 'Failed to submit dispute')
  return { data: result?.data, message: result?.message }
}

export async function getRaisedDisputeList(params = {}) {
  const body = {
    page: params.page ?? 1,
    no_of_data: params.no_of_data ?? 10,
  }
  const res = await fetch(RAISED_DISPUTE_LIST, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(body),
  })
  const result = await res.json().catch(() => null)
  if (!res.ok) throw new Error(result?.message || 'Failed to load disputes')
  if (result?.code !== 1) throw new Error(result?.message || 'Failed to load disputes')
  return { data: Array.isArray(result?.data) ? result.data : [], message: result?.message }
}

