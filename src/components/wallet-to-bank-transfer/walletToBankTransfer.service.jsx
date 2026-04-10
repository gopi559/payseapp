import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import { getClientRefId } from '../../services/api.jsx'
import authService from '../../Login/auth.service.jsx'
import i18n from '../../i18n'
import {
  BENEFICIARY_BANK_LIST,
  FETCH_BY_RRN,
  GB_PUSH_CUSTOMER,
} from '../../utils/constant.jsx'

const STORAGE_KEY = 'walletToBankTransferAccounts'

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

    if (account.isCashOutDefault) {
      next.forEach((item) => {
        item.isCashOutDefault = false
      })
    }

    next.unshift(account)
    this.save(next)
    return next
  },
}

const walletToBankTransferService = {
  getStoredAccounts: () => bankTransferStorage.list(),

  fetchBankList: async () => {
    const merchantToken = String(getMerchantToken() || '').trim()

    if (!merchantToken) {
      throw new Error(i18n.t('missing_merchant_token_for_beneficiary_bank_list'))
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
      throw new Error(res?.message || i18n.t('failed_to_load_bank_list'))
    }

    const payload =
      (Array.isArray(res?.data) && res.data) ||
      (Array.isArray(res?.data?.beneficiaries) && res.data.beneficiaries) ||
      []

    return { data: payload }
  },

  saveAccount: async (account) => {
    const saved = {
      ...account,
      id: account.id || `bank-${Date.now()}`,
      createdAt: account.createdAt || new Date().toISOString(),
    }

    bankTransferStorage.upsert(saved)
    return { data: saved, message: i18n.t('saved') }
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
        remarks: String(remarks || i18n.t('web_gb_push_remarks')).trim(),
        auth_data: String(auth_data || '').trim(),
      }),
    })

    const res = await getJson(response)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || res?.data?.gb?.respMsg || i18n.t('bank_transfer_failed'))
    }

    authService.fetchCustomerBalance().catch(() => {})

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
      throw new Error(res?.message || i18n.t('failed_to_fetch_transaction_details'))
    }

    return { data: res?.data ?? null, message: res?.message }
  },
}

export default walletToBankTransferService
