import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../../shared/layout/PageContainer'
import AmountInput from '../../../shared/components/AmountInput'
import Button from '../../../shared/components/Button'
import { ROUTES } from '../../../config/routes'

const CashInPage = () => {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  
  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    sessionStorage.setItem('cashInData', JSON.stringify({ amount }))
    navigate(ROUTES.CASH_IN_CONFIRM)
  }
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Cash In</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-sm text-gray-600 mb-4">Add money to your wallet</p>
          <AmountInput
            value={amount}
            onChange={setAmount}
          />
        </div>
        
        <Button onClick={handleContinue} fullWidth>
          Continue
        </Button>
      </div>
    </PageContainer>
  )
}

export default CashInPage

