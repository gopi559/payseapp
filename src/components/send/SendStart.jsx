import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import Input from '../../Reusable/Input'
import MobileInput from '../../Reusable/MobileInput'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'
import OtpPopup from '../../Reusable/OtpPopup'
import { sendService } from './send.service'

const SendStart = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const balance = useSelector((state) => state.wallet?.balance ?? 0)
  const currentUserId = user?.reg_info?.id ?? user?.reg_info?.user_id ?? user?.user_id ?? user?.id
  const currentUserMobile = (user?.reg_info?.mobile ?? user?.reg_info?.reg_mobile ?? user?.mobile ?? '').toString().trim()

  const [mobile, setMobile] = useState('+93')
  const [beneficiary, setBeneficiary] = useState(null)
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(false)
  const [showOtpPopup, setShowOtpPopup] = useState(false)
  const senderMobile = user?.reg_info?.mobile ?? user?.reg_info?.reg_mobile ?? user?.mobile ?? ''

  const handleValidate = async () => {
    const trimmed = mobile.trim()
    if (!trimmed || trimmed === '+93') {
      setError('Please enter beneficiary mobile number')
      return
    }
    // Ensure +93 prefix is included
    const finalMobile = trimmed.startsWith('+93') ? trimmed : `+93${trimmed.replace(/^\+?\d+/, '').replace(/\D/g, '')}`
    setError('')
    setValidating(true)
    try {
      const { data } = await sendService.validateBeneficiary(finalMobile)
      const benUserId = data.user_id
      const benMobile = (data.reg_mobile ?? finalMobile).toString().trim()
      if (benUserId != null && benUserId === currentUserId) {
        setBeneficiary(null)
        const msg = 'You cannot send money to yourself. Please enter a different mobile number.'
        setError(msg)
        toast.error(msg)
        return
      }
      if (benMobile && currentUserMobile && benMobile === currentUserMobile) {
        setBeneficiary(null)
        const msg = 'You cannot send money to yourself. Please enter a different mobile number.'
        setError(msg)
        toast.error(msg)
        return
      }
      setBeneficiary({
        user_id: data.user_id,
        reg_mobile: data.reg_mobile ?? finalMobile,
        first_name: data.first_name ?? '',
        middle_name: data.middle_name ?? null,
        last_name: data.last_name ?? '',
      })
    } catch (err) {
      setBeneficiary(null)
      const msg = err?.message || 'Beneficiary not found. Please check the mobile number.'
      setError(msg)
      toast.error(msg)
    } finally {
      setValidating(false)
    }
  }

  const beneficiaryName = beneficiary
    ? [beneficiary.first_name, beneficiary.middle_name, beneficiary.last_name].filter(Boolean).join(' ') || beneficiary.reg_mobile
    : ''

  const handleContinue = () => {
    if (!beneficiary) {
      setError('Please validate beneficiary first')
      return
    }
    if (beneficiary.user_id != null && beneficiary.user_id === currentUserId) {
      setError('You cannot send money to yourself. Please enter a different mobile number.')
      toast.error('You cannot send money to yourself.')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (balance > 0 && parseFloat(amount) > balance) {
      setError('Insufficient balance')
      return
    }
    // Open OTP popup instead of navigating
    setShowOtpPopup(true)
  }

  // Handle sending OTP
  const handleSendOtp = async () => {
    if (!senderMobile) {
      throw new Error('Your mobile number is not available. Cannot send OTP.')
    }
    await sendService.generateTransactionOtp('MOBILE', senderMobile)
  }

  // Handle OTP verification and complete transaction
  const handleVerifyOtp = async (otp) => {
    if (!beneficiary) {
      throw new Error('Beneficiary information is missing')
    }
    if (!senderMobile) {
      throw new Error('Your mobile number is not available.')
    }
    // Verify OTP
    await sendService.verifyTransactionOtp('MOBILE', senderMobile, otp)
    // Complete transaction
    const { data } = await sendService.sendMoneyTransaction(
      beneficiary.user_id,
      parseFloat(amount),
      remarks || ''
    )
    // Store success data
    sessionStorage.setItem('sendSuccess', JSON.stringify({
      ...data,
      beneficiary_name: beneficiaryName,
      beneficiary_mobile: beneficiary.reg_mobile,
      amount,
      remarks: remarks || '',
    }))
  }

  // Handle OTP popup close
  const handleOtpPopupClose = (isSuccess = false) => {
    setShowOtpPopup(false)
    // Navigate to success page only after successful verification
    if (isSuccess) {
      setTimeout(() => {
        navigate('/customer/send/success')
      }, 100)
    }
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark mb-4 sm:mb-6">Send Money</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-5">
            <MobileInput
              label="Beneficiary mobile number"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value)
                setBeneficiary(null)
                setError('')
              }}
              placeholder="e.g. 998877665"
              disabled={!!beneficiary}
            />

            {!beneficiary ? (
              <Button onClick={handleValidate} fullWidth size="md" disabled={validating || !mobile.trim()}>
                {validating ? 'Validating...' : 'Validate beneficiary'}
              </Button>
            ) : (
              <>
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm">
                  <span className="text-gray-500">Beneficiary: </span>
                  <span className="font-medium text-brand-dark">{beneficiaryName}</span>
                </div>

                <AmountInput
                  label="Amount"
                  value={amount}
                  onChange={setAmount}
                  maxAmount={balance > 0 ? balance : undefined}
                />

                <Input
                  label="Remarks (Optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Testing SendMoney via Web"
                />

                <div className="pt-2 flex gap-2">
                  <Button onClick={handleContinue} fullWidth size="md">
                    Continue
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setBeneficiary(null)
                      setMobile('')
                      setAmount('')
                      setRemarks('')
                      setError('')
                    }}
                  >
                    Back
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* OTP Popup */}
      <OtpPopup
        isOpen={showOtpPopup}
        onClose={(isSuccess) => handleOtpPopupClose(isSuccess)}
        onVerify={handleVerifyOtp}
        onSendOtp={handleSendOtp}
        mobileNumber={senderMobile}
        title="Enter OTP to Confirm"
        successMessage="Payment successful!"
      />
    </PageContainer>
  )
}

export default SendStart

