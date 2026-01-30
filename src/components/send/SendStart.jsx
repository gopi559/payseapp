import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import Input from '../../Reusable/Input'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'

const SendStart = () => {
  const navigate = useNavigate()
  const balance = useSelector((state) => state.wallet.balance)
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
    
    navigate('/customer/send/confirm')
  }
  
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark mb-4 sm:mb-6">Send Money</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-5">
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
            
            <div className="pt-2">
              <Button onClick={handleContinue} fullWidth size="md">
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default SendStart


