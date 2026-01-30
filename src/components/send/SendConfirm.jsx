import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import ConfirmCard from '../../Reusable/ConfirmCard'
import Button from '../../Reusable/Button'
import { sendService } from './send.service'

const SendConfirm = () => {
  const navigate = useNavigate()
  const [sendData, setSendData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const data = sessionStorage.getItem('sendData')
    if (!data) {
      navigate('/customer/send')
      return
    }
    setSendData(JSON.parse(data))
  }, [navigate])
  
  const handleConfirm = async () => {
    if (!sendData) return
    
    setLoading(true)
    setError('')
    
    try {
      const result = await sendService.sendMoney(
        sendData.recipient,
        sendData.amount,
        sendData.description
      )
      
      if (result.success) {
        sessionStorage.removeItem('sendData')
        navigate('/customer/send/success')
      } else {
        setError(result.error || 'Transaction failed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  if (!sendData) return null
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Confirm Payment</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <ConfirmCard
          items={[
            { label: 'Recipient', value: sendData.recipient },
            { label: 'Amount', value: `₹${parseFloat(sendData.amount).toFixed(2)}` },
            { label: 'Description', value: sendData.description || 'N/A' },
          ]}
          total={parseFloat(sendData.amount)}
        />
        
        <div className="mt-6 space-y-3">
          <Button onClick={handleConfirm} fullWidth disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Payment'}
          </Button>
          <Button
            onClick={() => navigate('/customer/send')}
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

export default SendConfirm

