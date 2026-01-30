import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import ConfirmCard from '../../Reusable/ConfirmCard'
import Button from '../../Reusable/Button'
import { ROUTES } from '../../config/routes'
import { updateBalance } from '../../Redux/store'

const CashOutConfirm = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [cashOutData, setCashOutData] = useState(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const data = sessionStorage.getItem('cashOutData')
    if (!data) {
      navigate(ROUTES.CASH_OUT)
      return
    }
    setCashOutData(JSON.parse(data))
  }, [navigate])
  
  const handleConfirm = async () => {
    if (!cashOutData) return
    
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      dispatch(updateBalance(-parseFloat(cashOutData.amount)))
      sessionStorage.removeItem('cashOutData')
      setLoading(false)
      navigate(ROUTES.CASH_OUT_SUCCESS)
    }, 1500)
  }
  
  if (!cashOutData) return null
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Confirm Cash Out</h1>
        
        <ConfirmCard
          items={[
            { label: 'Amount', value: `₹${parseFloat(cashOutData.amount).toFixed(2)}` },
            { label: 'Withdrawal Method', value: 'Bank Transfer' },
          ]}
          total={parseFloat(cashOutData.amount)}
        />
        
        <div className="mt-6 space-y-3">
          <Button onClick={handleConfirm} fullWidth disabled={loading}>
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
          <Button
            onClick={() => navigate(ROUTES.CASH_OUT)}
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

export default CashOutConfirm


