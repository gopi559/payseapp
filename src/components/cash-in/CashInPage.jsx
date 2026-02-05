import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { BsCashCoin } from 'react-icons/bs'
import PageContainer from '../../Reusable/PageContainer'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import cashInService from './cashIn.service'

const CashInPage = () => {
  const navigate = useNavigate()
  const [cardNumber, setCardNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async () => {
    const card = cardNumber.trim().replace(/\s/g, '')
    if (!card) {
      setError('Please enter card number')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await cashInService.sendOtp({
        card_number: card,
        txn_amount: amount,
      })
      const rrn = data?.rrn ?? ''
      sessionStorage.setItem(
        'cashInData',
        JSON.stringify({
          card_number: card,
          txn_amount: amount,
          rrn,
        })
      )
      toast.success('OTP sent successfully')
      navigate('/customer/cash-in/confirm')
    } catch (err) {
      const msg = err?.message || 'Failed to send OTP'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <BsCashCoin className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark">Cash In</h1>
            <p className="text-sm text-gray-500">Add money to your wallet from your card</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            Enter card details. An OTP will be sent to complete the transaction.
          </p>
          <div className="space-y-4">
            <Input
              label="Card number"
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(e.target.value.replace(/\D/g, ''))
                setError('')
              }}
              placeholder="e.g. 2345543212345432"
              maxLength={19}
            />
            <AmountInput
              label="Amount"
              value={amount}
              onChange={setAmount}
            />
          </div>
          <div className="pt-4">
            <Button onClick={handleSendOtp} fullWidth size="md" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default CashInPage
