import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import ConfirmCard from '../../Reusable/ConfirmCard'
import Button from '../../Reusable/Button'
import OtpInput from '../../Reusable/OtpInput'
import cardToCardService from './cardToCard.service'
import { sendService } from '../send/send.service'

const CardToCardConfirm = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const senderMobile = user?.reg_info?.mobile ?? user?.reg_info?.reg_mobile ?? user?.mobile ?? ''
  
  const [cardToCardData, setCardToCardData] = useState(null)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpError, setOtpError] = useState('')

  useEffect(() => {
    const data = sessionStorage.getItem('cardToCardData')
    if (!data) {
      navigate('/customer/card-to-card')
      return
    }
    setCardToCardData(JSON.parse(data))
  }, [navigate])

  /** Send OTP button: sends OTP to sender mobile */
  const handleSendOtp = async () => {
    if (!senderMobile) {
      setError('Your mobile number is not available. Cannot send OTP.')
      return
    }
    setLoading(true)
    setError('')
    setOtpError('')
    try {
      await sendService.generateTransactionOtp('MOBILE', senderMobile)
      setOtpSent(true)
      setOtp('')
      toast.success('OTP sent successfully')
    } catch (err) {
      const msg = err?.message || 'Failed to send OTP. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /** Confirm button: verify OTP and complete transaction */
  const handleConfirmOtp = async () => {
    if (!otp || otp.length !== 6 || !senderMobile) {
      setOtpError('Please enter the 6-digit OTP')
      return
    }
    if (!cardToCardData) {
      setError('Session expired. Please start again.')
      return
    }
    setLoading(true)
    setOtpError('')
    setError('')
    try {
      await sendService.verifyTransactionOtp('MOBILE', senderMobile, otp)
      const { data: transactionData } = await cardToCardService.cardToCard(
        cardToCardData.from_card,
        cardToCardData.to_card,
        parseFloat(cardToCardData.txn_amount),
        cardToCardData.cvv,
        cardToCardData.expiry_date,
        otp
      )
      sessionStorage.removeItem('cardToCardData')
      sessionStorage.setItem('cardToCardSuccess', JSON.stringify({
        ...transactionData,
        from_card: cardToCardData.from_card,
        from_card_name: cardToCardData.from_card_name,
        to_card: cardToCardData.to_card,
        to_card_name: cardToCardData.to_card_name,
        txn_amount: cardToCardData.txn_amount,
        cvv: cardToCardData.cvv,
        expiry_date: cardToCardData.expiry_date,
      }))
      toast.success('Card to card transfer completed successfully')
      setTimeout(() => {
        navigate('/customer/card-to-card/success')
      }, 800)
    } catch (err) {
      const msg = err?.message || 'Invalid or expired OTP. Transaction failed.'
      setOtpError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!cardToCardData) return null

  const maskedFromCard = cardToCardData.from_card
    ? `${cardToCardData.from_card.slice(0, 4)} **** **** ${cardToCardData.from_card.slice(-4)}`
    : '—'
  const maskedToCard = cardToCardData.to_card
    ? `${cardToCardData.to_card.slice(0, 4)} **** **** ${cardToCardData.to_card.slice(-4)}`
    : '—'
  const amount = parseFloat(cardToCardData.txn_amount)

  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">
          {otpSent ? 'Enter OTP' : 'Confirm Transaction'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!otpSent ? (
          <>
            <ConfirmCard
              items={[
                { label: 'From Card', value: maskedFromCard },
                { label: 'From Card Name', value: cardToCardData.from_card_name || 'N/A' },
                { label: 'To Card', value: maskedToCard },
                { label: 'To Card Name', value: cardToCardData.to_card_name || 'N/A' },
                { label: 'Amount', value: `₹${amount.toFixed(2)}` },
              ]}
              total={amount}
            />
            <p className="text-sm text-gray-500 mt-2 mb-4">
              Click Send OTP to receive a code on your mobile. After verifying OTP, the transfer will be completed.
            </p>
            <div className="mt-6 space-y-3">
              <Button onClick={handleSendOtp} fullWidth disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
              <Button
                onClick={() => navigate('/customer/card-to-card')}
                variant="outline"
                fullWidth
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 mb-4">
              <p className="text-sm text-gray-600">
                OTP sent to <span className="font-medium">{senderMobile}</span>. Enter it below, then confirm to complete the transfer.
              </p>
            </div>
            <OtpInput
              length={6}
              onChange={setOtp}
              error={otpError}
              disabled={loading}
            />
            <div className="mt-4 space-y-2">
              <Button onClick={handleConfirmOtp} fullWidth disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : 'Confirm'}
              </Button>
              <Button
                onClick={() => navigate('/customer/card-to-card')}
                variant="outline"
                fullWidth
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  )
}

export default CardToCardConfirm

