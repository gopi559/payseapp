import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import { getWithBasicAuth } from '../../services/basicAuth.service.js'
import { getClientRefId } from '../../services/api.jsx'
import authService from '../../Login/auth.service.jsx'
import i18n from '../../i18n'
import {
  BANK_MASTER_LIST,
  BENEFICIARY_BANK_ADD,
  BENEFICIARY_BANK_DELETE,
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

const normalizeLinkedAccount = (item) => ({
  id: item.id || `bank-${Date.now()}`,
  bankId: item.bank_id || null,
  bankName: item.bank_name || item.beneficiary_alias || item.beneficiary_name || i18n.t('bank'),
  accountNumber: String(item.bank_account_number || item.accountNumber || '').trim(),
  accountHolderName: item.beneficiary_name || item.accountHolderName || item.beneficiary_alias || '',
  alias: item.beneficiary_alias || '',
  isDefault: false,
  isCashOutDefault: false,
  raw: item,
})

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

  fetchBankMasterList: async () => {
    const data = await getWithBasicAuth(BANK_MASTER_LIST, {
      status: 1,
      auth_status: 'APPROVED',
      include_deleted: false,
    })

    const payload =
      (Array.isArray(data) && data) ||
      (Array.isArray(data?.data) && data.data) ||
      []

    return { data: payload }
  },

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

  fetchLinkedAccounts: async () => {
    const { data } = await walletToBankTransferService.fetchBankList()
    const normalized = data
      .map(normalizeLinkedAccount)
      .filter((item) => item.accountNumber)

    bankTransferStorage.save(normalized)
    return { data: normalized }
  },

  saveAccount: async (account) => {
    const bankId =
      account?.bankMeta?.bank_id ||
      account?.bankMeta?.id ||
      account?.bankId

    const response = await fetchWithRefreshToken(BENEFICIARY_BANK_ADD, {
      method: 'POST',
      headers: getDeviceHeaders(),
      body: JSON.stringify({
        bank_id: Number(bankId),
        beneficiary_name: String(account.accountHolderName || '').trim(),
        bank_account_number: String(account.accountNumber || '').trim(),
        beneficiary_alias: String(account.bankName || account.accountHolderName || '').trim(),
      }),
    })

    const res = await getJson(response)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || i18n.t('failed_to_save_bank_account'))
    }

    const refreshed = await walletToBankTransferService.fetchLinkedAccounts()
    const saved =
      refreshed.data.find(
        (item) =>
          item.accountNumber === String(account.accountNumber || '').trim() &&
          item.accountHolderName === String(account.accountHolderName || '').trim()
      ) || refreshed.data[0] || null

    return { data: saved, message: res?.message || i18n.t('saved') }
  },

  removeStoredAccount: async (accountId) => {
    const response = await fetchWithRefreshToken(BENEFICIARY_BANK_DELETE, {
      method: 'POST',
      headers: getDeviceHeaders(),
      body: JSON.stringify({
        id: Number(accountId),
      }),
    })

    const res = await getJson(response)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || i18n.t('failed_to_remove_beneficiary'))
    }

    const next = bankTransferStorage.list().filter((item) => item.id !== accountId)
    bankTransferStorage.save(next)
    return { data: next, message: res?.message || i18n.t('beneficiary_removed') }
  },

  submitBankTransferPush: async ({
    pin,
    wallet_no,
    amount,
    currency,
    remarks,
  }) => {
    const payload = {
      pin: String(pin).trim(),
      wallet_no: String(wallet_no).trim(),
      amount: Number(amount),
      currency: String(currency || 'AFN').trim(),
      remarks: String(remarks || i18n.t('web_gb_push_remarks')).trim(),
    }

    const response = await fetchWithRefreshToken(GB_PUSH_CUSTOMER, {
      method: 'POST',
      headers: getDeviceHeaders(),
      body: JSON.stringify(payload),
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
