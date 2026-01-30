import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'
import { ROUTES } from '../../config/routes'

const CashOutPage = () => {
  const navigate = useNavigate()
  const balance = useSelector((state) => state.wallet.balance)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  
  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (parseFloat(amount) > balance) {
      setError('Insufficient balance')
      return
    }
    
    sessionStorage.setItem('cashOutData', JSON.stringify({ amount }))
    navigate(ROUTES.CASH_OUT_CONFIRM)
  }
  
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark mb-4 sm:mb-6">
          Cash Out
        </h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            Withdraw money from your wallet
          </p>
          <AmountInput
            value={amount}
            onChange={setAmount}
            maxAmount={balance}
          />
          
          <div className="pt-4">
            <Button onClick={handleContinue} fullWidth size="md">
              Continue
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default CashOutPage


