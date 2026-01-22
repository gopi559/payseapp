import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../../shared/layout/PageContainer'
import Input from '../../../shared/components/Input'
import AmountInput from '../../../shared/components/AmountInput'
import Button from '../../../shared/components/Button'
import { ROUTES } from '../../../config/routes'
import { useWalletStore } from '../../../store/wallet.store'

const SendStart = () => {
  const navigate = useNavigate()
  const { balance } = useWalletStore()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  
  const handleContinue = () => {
    if (!recipient.trim()) {
      setError('Please enter recipient name')
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (parseFloat(amount) > balance) {
      setError('Insufficient balance')
      return
    }
    
    // Store in sessionStorage for next page
    sessionStorage.setItem('sendData', JSON.stringify({
      recipient,
      amount,
      description,
    }))
    
    navigate(ROUTES.SEND_CONFIRM)
  }
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Send Money</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-6">
          <Input
            label="Recipient Name"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient name"
            required
          />
          
          <AmountInput
            label="Amount"
            value={amount}
            onChange={setAmount}
            maxAmount={balance}
          />
          
          <Input
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a note"
          />
          
          <Button onClick={handleContinue} fullWidth>
            Continue
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default SendStart

