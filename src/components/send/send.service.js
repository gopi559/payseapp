import { paymentService } from '../../services/payment.service'
import Store from '../../Redux/store'
import { updateBalance, addTransaction } from '../../Redux/store.jsx'

export const sendService = {
  sendMoney: async (recipient, amount, description) => {
    const result = await paymentService.sendMoney(recipient, amount, description)
    
    if (result.success) {
      // Update wallet balance
      Store.dispatch(updateBalance(-parseFloat(amount)))
      
      // Add transaction
      Store.dispatch(addTransaction({
        id: result.transactionId,
        type: 'send',
        amount: parseFloat(amount),
        recipient,
        status: 'completed',
        date: new Date().toISOString(),
        description: description || `Payment to ${recipient}`,
      }))
    }
    
    return result
  },
}


