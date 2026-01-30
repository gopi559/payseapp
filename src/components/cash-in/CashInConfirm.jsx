import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import ConfirmCard from '../../Reusable/ConfirmCard'
import Button from '../../Reusable/Button'
import { updateBalance } from '../../Redux/store'

const CashInConfirm = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [cashInData, setCashInData] = useState(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const data = sessionStorage.getItem('cashInData')
    if (!data) {
      navigate('/customer/cash-in')
      return
    }
    setCashInData(JSON.parse(data))
  }, [navigate])
  
  const handleConfirm = async () => {
    if (!cashInData) return
    
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      dispatch(updateBalance(parseFloat(cashInData.amount)))
      sessionStorage.removeItem('cashInData')
      setLoading(false)
      navigate('/customer/cash-in/success')
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
            onClick={() => navigate('/customer/cash-in')}
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

