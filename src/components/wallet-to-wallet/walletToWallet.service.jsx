// src/services/walletToWallet.service.js

import fetchWithRefreshToken from '../../services/fetchWithRefreshToken.js'
import { WALLET_TO_WALLET, FETCH_BY_RRN } from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const walletToWalletService = {
  walletToWallet: async ({ from_card, to_card, txn_amount }) => {
    const response = await fetchWithRefreshToken(WALLET_TO_WALLET, {
      method: 'POST',
      body: JSON.stringify({
        from_card: String(from_card).trim().replace(/\s/g, ''),
        to_card: String(to_card).trim().replace(/\s/g, ''),
        txn_amount: Number(txn_amount),
      }),
    })

    const res = await response.json().catch(() => null)

    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || '')
    }

    authService.fetchCustomerBalance().catch(() => {})

    return res
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

export default walletToWalletService
