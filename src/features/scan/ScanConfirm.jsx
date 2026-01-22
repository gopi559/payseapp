import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../shared/layout/PageContainer'
import AmountInput from '../../shared/components/AmountInput'
import ConfirmCard from '../../shared/components/ConfirmCard'
import Button from '../../shared/components/Button'
import { ROUTES } from '../../config/routes'
import { useWalletStore } from '../../store/wallet.store'

const ScanConfirm = () => {
  const navigate = useNavigate()
  const { balance } = useWalletStore()
  const [amount, setAmount] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return
    }
    if (parseFloat(amount) > balance) {
      return
    }
    setShowConfirm(true)
  }
  
  const handleConfirm = async () => {
    setLoading(true)
    // Simulate payment
    setTimeout(() => {
      setLoading(false)
      navigate(ROUTES.SEND_SUCCESS)
    }, 1500)
  }
  
  if (showConfirm) {
    return (
      <PageContainer>
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-brand-dark mb-6">Confirm Payment</h1>
          
          <ConfirmCard
            items={[
              { label: 'Merchant', value: 'QR Merchant' },
              { label: 'Amount', value: `₹${parseFloat(amount).toFixed(2)}` },
            ]}
            total={parseFloat(amount)}
          />
          
          <div className="mt-6 space-y-3">
            <Button onClick={handleConfirm} fullWidth disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Payment'}
            </Button>
            <Button
              onClick={() => setShowConfirm(false)}
              variant="outline"
              fullWidth
              disabled={loading}
            >
              Back
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Enter Amount</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 mb-2">Paying to</p>
            <p className="text-lg font-semibold text-brand-dark">QR Merchant</p>
          </div>
        </div>
        
        <AmountInput
          value={amount}
          onChange={setAmount}
          maxAmount={balance}
        />
        
        <Button onClick={handleContinue} fullWidth className="mt-6">
          Continue
        </Button>
      </div>
    </PageContainer>
  )
}

export default ScanConfirm

