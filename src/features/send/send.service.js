import { paymentService } from '../../services/payment.service'
import { useWalletStore } from '../../store/wallet.store'
import { useTransactionStore } from '../../store/transaction.store'

export const sendService = {
  sendMoney: async (recipient, amount, description) => {
    const result = await paymentService.sendMoney(recipient, amount, description)
    
    if (result.success) {
      // Update wallet balance
      const { updateBalance } = useWalletStore.getState()
      updateBalance(-parseFloat(amount))
      
      // Add transaction
      const { addTransaction } = useTransactionStore.getState()
      addTransaction({
        id: result.transactionId,
        type: 'send',
        amount: parseFloat(amount),
        recipient,
        status: 'completed',
        date: new Date().toISOString(),
        description: description || `Payment to ${recipient}`,
      })
    }
    
    return result
  },
}

