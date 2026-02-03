import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { FaCreditCard } from 'react-icons/fa'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import AmountInput from '../../Reusable/AmountInput'
import OtpInput from '../../Reusable/OtpInput'
import { walletToCardService } from './walletToCard.service'
import { sendService } from '../send/send.service'

const WalletToCardPage = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const senderMobile = user?.reg_info?.mobile ?? user?.reg_info?.reg_mobile ?? user?.mobile ?? ''

  const [cardNumber, setCardNumber] = useState('')
  const [cardVerified, setCardVerified] = useState(false)
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  const handleVerifyCard = async () => {
    const trimmed = cardNumber.trim().replace(/\s/g, '')
    if (!trimmed) {
      setError('Please enter card number')
      return
    }
    setError('')
    setValidating(true)
    try {
      await walletToCardService.verifyCard(trimmed)
      setCardVerified(true)
      setCardNumber(trimmed)
    } catch (err) {
      setCardVerified(false)
      const msg = err?.message || 'Card not found or invalid. Please check the card number.'
      setError(msg)
      toast.error(msg)
    } finally {
      setValidating(false)
    }
  }

  const handleSendOtp = async () => {
    if (!senderMobile) {
      setError('Your mobile number is not available. Cannot send OTP.')
      toast.error('Mobile number not available.')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    setLoading(true)
    setError('')
    setOtpError('')
    try {
      await sendService.generateTransactionOtp('MOBILE', senderMobile)
      setOtpSent(true)
      setOtp('')
    } catch (err) {
      const msg = err?.message || 'Failed to send OTP. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!otp || otp.length !== 6 || !senderMobile) {
      setOtpError('Please enter the 6-digit OTP')
      return
    }
    const trimmed = cardNumber.trim().replace(/\s/g, '')
    if (!trimmed) {
      setError('Card number missing')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    setLoading(true)
    setOtpError('')
    setError('')
    try {
      await sendService.verifyTransactionOtp('MOBILE', senderMobile, otp)
      await walletToCardService.walletToCard(trimmed, parseFloat(amount), remarks || '')
      toast.success('Money sent to card successfully')
      setCardNumber('')
      setCardVerified(false)
      setAmount('')
      setRemarks('')
      setOtpSent(false)
      setOtp('')
      setTimeout(() => navigate('/customer/home'), 800)
    } catch (err) {
      const msg = err?.message || 'Invalid OTP or transfer failed. Money was not transferred.'
      setOtpError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const maskedCard = cardNumber ? `${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(-4)}` : ''

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FaCreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark">Wallet to Card</h1>
            <p className="text-sm text-gray-500">Transfer from your wallet to another card</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-5">
            <Input
              label="Card number"
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(e.target.value.replace(/\D/g, ''))
                setCardVerified(false)
                setError('')
              }}
              placeholder="e.g. 2345543212345432"
              disabled={!!cardVerified}
            />

            {!cardVerified ? (
              <Button
                onClick={handleVerifyCard}
                fullWidth
                size="md"
                disabled={validating || !cardNumber.trim().replace(/\s/g, '')}
              >
                {validating ? 'Verifying...' : 'Verify card'}
              </Button>
            ) : (
              <>
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm">
                  <span className="text-gray-500">Card: </span>
                  <span className="font-medium text-brand-dark font-mono">{maskedCard}</span>
                </div>

                <AmountInput
                  label="Amount"
                  value={amount}
                  onChange={setAmount}
                />

                <Input
                  label="Remarks (Optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Wallet to card transaction"
                />

                {!otpSent ? (
                  <div className="pt-2 flex gap-2">
                    <Button onClick={handleSendOtp} fullWidth size="md" disabled={loading}>
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setCardVerified(false)
                        setCardNumber('')
                        setAmount('')
                        setRemarks('')
                        setError('')
                      }}
                    >
                      Change card
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm">
                      OTP sent to <span className="font-medium">{senderMobile}</span>. Enter it below to complete the transfer.
                    </div>
                    <OtpInput
                      length={6}
                      onChange={setOtp}
                      error={otpError}
                      disabled={loading}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleConfirm}
                        fullWidth
                        size="md"
                        disabled={loading || otp.length !== 6}
                      >
                        {loading ? 'Processing...' : 'Confirm'}
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => {
                          setOtpSent(false)
                          setOtp('')
                          setOtpError('')
                        }}
                      >
                        Resend OTP
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default WalletToCardPage

