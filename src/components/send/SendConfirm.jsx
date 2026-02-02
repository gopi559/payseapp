import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import ConfirmCard from '../../Reusable/ConfirmCard'
import Button from '../../Reusable/Button'
import OtpInput from '../../Reusable/OtpInput'
import { sendService } from './send.service'

const SendConfirm = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const senderMobile = user?.reg_info?.mobile ?? user?.reg_info?.reg_mobile ?? user?.mobile ?? ''
  const [sendData, setSendData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  useEffect(() => {
    const data = sessionStorage.getItem('sendData')
    if (!data) {
      navigate('/customer/send')
      return
    }
    setSendData(JSON.parse(data))
  }, [navigate])

  /** Send OTP button: only sends OTP to sender mobile. No transfer yet. */
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
    } catch (err) {
      const msg = err?.message || 'Failed to send OTP. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /** Confirm button: first verify OTP, then call send_money transfer API. */
  const handleConfirmOtp = async () => {
    if (!otp || otp.length !== 6 || !senderMobile) {
      setOtpError('Please enter the 6-digit OTP')
      return
    }
    if (!sendData?.beneficiary) return
    setLoading(true)
    setOtpError('')
    setError('')
    try {
      await sendService.verifyTransactionOtp('MOBILE', senderMobile, otp)
      await sendService.sendMoneyTransaction(
        sendData.beneficiary.user_id,
        parseFloat(sendData.amount),
        sendData.remarks || ''
      )
      sessionStorage.removeItem('sendData')
      toast.success('Payment successful')
      setTimeout(() => {
        navigate('/customer/send/success')
      }, 800)
    } catch (err) {
      const msg = err?.message || 'Invalid or expired OTP. Money was not transferred.'
      setOtpError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!sendData) return null

  const beneficiaryName = sendData.beneficiary?.displayName ?? sendData.beneficiary?.reg_mobile ?? 'Beneficiary'
  const amount = parseFloat(sendData.amount)

  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">
          {otpSent ? 'Enter OTP' : 'Confirm Payment'}
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
                { label: 'Beneficiary', value: beneficiaryName },
                { label: 'Amount', value: `₹${amount.toFixed(2)}` },
                { label: 'Remarks', value: sendData.remarks || 'N/A' },
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
                onClick={() => navigate('/customer/send')}
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
                onClick={() => navigate('/customer/send')}
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

export default SendConfirm

