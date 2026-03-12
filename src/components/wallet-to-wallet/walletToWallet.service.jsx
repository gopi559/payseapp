import { getAuthToken, deviceId, getClientRefId } from '../../services/api.jsx'
import { WALLET_TO_WALLET } from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const walletToWalletService = {
  walletToWallet: async ({ from_card, to_card, txn_amount }) => {
    const endpoint = import.meta.env.DEV
      ? '/webcust/external_card/wallet_ext_wallet_cnp_703'
      : WALLET_TO_WALLET

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        Clientrefid: getClientRefId(),
        DeviceInfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
          app_version: '9',
          device_model: 'WEB',
        }),
      },
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
}

export default walletToWalletService
