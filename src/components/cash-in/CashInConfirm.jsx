import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import ConfirmCard from '../../Reusable/ConfirmCard'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import OtpInput from '../../Reusable/OtpInput'
import cashInService from './cashIn.service'

const CashInConfirm = () => {
  const navigate = useNavigate()
  const [cashInData, setCashInData] = useState(null)
  const [cvv, setCvv] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const data = sessionStorage.getItem('cashInData')
    if (!data) {
      navigate('/customer/cash-in')
      return
    }
    setCashInData(JSON.parse(data))
  }, [navigate])

  const handleConfirm = async () => {
    if (!cashInData?.rrn) {
      setError('Session expired. Please start again from Cash In.')
      return
    }
    if (!cvv || cvv.length < 3) {
      setError('Please enter CVV')
      return
    }
    const expiry = expiryDate.trim().replace(/\D/g, '')
    if (expiry.length !== 4) {
      setError('Please enter expiry as MMYY (e.g. 1030)')
      return
    }
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP received')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await cashInService.confirmCardToWallet({
        card_number: cashInData.card_number,
        txn_amount: cashInData.txn_amount,
        cvv,
        expiry_date: expiry,
        otp,
        rrn: cashInData.rrn,
      })
      sessionStorage.removeItem('cashInData')
      sessionStorage.setItem('cashInSuccess', JSON.stringify(data ?? {}))
      navigate('/customer/cash-in/success')
    } catch (err) {
      const msg = err?.message || 'Cash in failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!cashInData) return null

  const maskedCard = cashInData.card_number
    ? `${cashInData.card_number.slice(0, 4)} **** **** ${cashInData.card_number.slice(-4)}`
    : '—'

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Confirm Cash In</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <ConfirmCard
          items={[
            { label: 'Card', value: maskedCard },
            { label: 'Amount', value: `₹${parseFloat(cashInData.txn_amount).toFixed(2)}` },
          ]}
          total={parseFloat(cashInData.txn_amount)}
        />

        <div className="mt-6 space-y-4">
          <Input
            label="CVV"
            type="password"
            value={cvv}
            onChange={(e) => {
              setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
              setError('')
            }}
            placeholder="e.g. 234"
            maxLength={4}
          />
          <Input
            label="Expiry (MMYY)"
            value={expiryDate}
            onChange={(e) => {
              setExpiryDate(e.target.value.replace(/\D/g, '').slice(0, 4))
              setError('')
            }}
            placeholder="e.g. 1030"
            maxLength={4}
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">OTP</label>
            <OtpInput
              length={4}
              onChange={setOtp}
              disabled={loading}
            />
          </div>
        </div>

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
