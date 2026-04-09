import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import { getClientRefId } from '../../services/api.jsx'
import authService from '../../Login/auth.service.jsx'
import {
  BENEFICIARY_BANK_LIST,
  FETCH_BY_RRN,
  GB_BALANCE_CUSTOMER,
  GB_PULL_CUSTOMER,
  GB_PUSH_CUSTOMER,
} from '../../utils/constant.jsx'

const STORAGE_KEY = 'cashInBankTransferAccounts'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status || '').toUpperCase() === 'SUCCESS'

const getJson = async (response) => response.json().catch(() => null)

const getDeviceHeaders = () => ({
  deviceinfo: JSON.stringify({
    device_id: localStorage.getItem('deviceId') || 'webapp',
    device_type: 'WEBAPP',
    ClientRefId: getClientRefId(),
  }),
})

const getMerchantToken = () =>
  localStorage.getItem('merchant_token') ||
  localStorage.getItem('merchantToken') ||
  import.meta.env.VITE_MERCHANT_TOKEN ||
  localStorage.getItem('auth_token') ||
  ''

export const bankTransferStorage = {
  list() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = JSON.parse(raw || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  },

  save(accounts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  },

  upsert(account) {
    const current = this.list()
    const next = current.filter((item) => item.id !== account.id)

    if (account.isDefault) {
      next.forEach((item) => {
        item.isDefault = false
      })
    }

    next.unshift(account)
    this.save(next)
    return next
  },
}

const cashInBankTransferService = {
  getStoredAccounts: () => bankTransferStorage.list(),

  fetchBankList: async () => {
    const merchantToken = String(getMerchantToken() || '').trim()

    if (!merchantToken) {
      throw new Error('Missing merchant token for beneficiary bank list')
    }

    const response = await fetch(BENEFICIARY_BANK_LIST, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${merchantToken}`,
        deviceinfo: JSON.stringify({
          device_id: 'devtest',
          device_type: 'WEBAPP',
          fcm_id: 'dummy',
        }),
      },
    })

    const res = await getJson(response)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Failed to load bank list')
    }

    return { data: Array.isArray(res?.data) ? res.data : [] }
  },

  saveAccount: async (account) => {
    const saved = {
      ...account,
      id: account.id || `bank-${Date.now()}`,
      createdAt: account.createdAt || new Date().toISOString(),
    }

    bankTransferStorage.upsert(saved)
    return { data: saved, message: 'Saved' }
  },

  fetchGbBalance: async ({ pin, wallet_no }) => {
    const response = await fetchWithRefreshToken(GB_BALANCE_CUSTOMER, {
      method: 'POST',
      headers: getDeviceHeaders(),
      body: JSON.stringify({
        pin: String(pin).trim(),
        wallet_no: String(wallet_no).trim(),
      }),
    })

    const res = await getJson(response)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || res?.data?.gb?.respMsg || 'Failed to fetch bank balance')
    }

    return { data: res?.data ?? null, message: res?.message }
  },

  submitBankTransferPull: async ({
    pin,
    wallet_no,
    amount,
    currency,
    remarks,
    auth_data,
  }) => {
    const response = await fetchWithRefreshToken(GB_PULL_CUSTOMER, {
      method: 'POST',
      headers: getDeviceHeaders(),
      body: JSON.stringify({
        pin: String(pin).trim(),
        wallet_no: String(wallet_no).trim(),
        amount: Number(amount),
        currency: String(currency || 'AFN').trim(),
        remarks: String(remarks || 'web gb pull').trim(),
        auth_data: String(auth_data || '').trim(),
      }),
    })

    const res = await getJson(response)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || res?.data?.gb?.respMsg || 'Bank transfer failed')
    }

    authService.fetchCustomerBalance().catch(() => {})

    return { data: res?.data ?? null, message: res?.message }
  },

  submitBankTransferPush: async ({
    pin,
    wallet_no,
    amount,
    currency,
    remarks,
    auth_data,
  }) => {
    const response = await fetchWithRefreshToken(GB_PUSH_CUSTOMER, {
      method: 'POST',
      headers: getDeviceHeaders(),
      body: JSON.stringify({
        pin: String(pin).trim(),
        wallet_no: String(wallet_no).trim(),
        amount: Number(amount),
        currency: String(currency || 'AFN').trim(),
        remarks: String(remarks || 'web gb push').trim(),
        auth_data: String(auth_data || '').trim(),
      }),
    })

    const res = await getJson(response)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || res?.data?.gb?.respMsg || 'Bank transfer failed')
    }

    return { data: res?.data ?? null, message: res?.message }
  },

  fetchTransactionByRrn: async (rrn) => {
    const response = await fetchWithRefreshToken(FETCH_BY_RRN, {
      method: 'POST',
      body: JSON.stringify({
        rrn: String(rrn || '').trim(),
      }),
    })

    const res = await getJson(response)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Failed to fetch transaction details')
    }

    return { data: res?.data ?? null, message: res?.message }
  },
}

export default cashInBankTransferService
