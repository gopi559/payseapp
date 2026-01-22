import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../../shared/layout/PageContainer'
import ConfirmCard from '../../../shared/components/ConfirmCard'
import Button from '../../../shared/components/Button'
import { ROUTES } from '../../../config/routes'
import { useWalletStore } from '../../../store/wallet.store'

const CashInConfirm = () => {
  const navigate = useNavigate()
  const { updateBalance } = useWalletStore()
  const [cashInData, setCashInData] = useState(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const data = sessionStorage.getItem('cashInData')
    if (!data) {
      navigate(ROUTES.CASH_IN)
      return
    }
    setCashInData(JSON.parse(data))
  }, [navigate])
  
  const handleConfirm = async () => {
    if (!cashInData) return
    
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      updateBalance(parseFloat(cashInData.amount))
      sessionStorage.removeItem('cashInData')
      setLoading(false)
      navigate(ROUTES.CASH_IN_SUCCESS)
    }, 1500)
  }
  
  if (!cashInData) return null
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Confirm Cash In</h1>
        
        <ConfirmCard
          items={[
            { label: 'Amount', value: `₹${parseFloat(cashInData.amount).toFixed(2)}` },
            { label: 'Payment Method', value: 'Bank Transfer' },
          ]}
          total={parseFloat(cashInData.amount)}
        />
        
        <div className="mt-6 space-y-3">
          <Button onClick={handleConfirm} fullWidth disabled={loading}>
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
          <Button
            onClick={() => navigate(ROUTES.CASH_IN)}
            variant="outline"
            fullWidth
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default CashInConfirm

