import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import PageContainer from '../../Reusable/PageContainer'
import MobileInput from '../../Reusable/MobileInput'
import AmountInput from '../../Reusable/AmountInput'
import Input from '../../Reusable/Input'
import Button from '../../Reusable/Button'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'

import { sendService } from './send.service'

const SendStart = () => {
  const navigate = useNavigate()

  const user = useSelector((state) => state.auth?.user)
  const balance = useSelector((state) => state.wallet?.balance ?? 0)

  const senderMobile =
    user?.reg_info?.mobile ??
    user?.reg_info?.reg_mobile ??
    user?.mobile ??
    ''

  const [mobile, setMobile] = useState('+93')
  const [beneficiary, setBeneficiary] = useState(null)
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)

  // null | 'CONFIRM' | 'OTP'
  const [step, setStep] = useState(null)

  /* ---------------- Validate Beneficiary ---------------- */
  const handleValidate = async () => {
    if (!mobile || mobile === '+93') {
      toast.error('Enter beneficiary mobile number')
      return
    }

    setLoading(true)
    try {
      const { data } = await sendService.validateBeneficiary(mobile)
      setBeneficiary(data)
      toast.success('Beneficiary validated')
    } catch (e) {
      setBeneficiary(null)
      toast.error(e.message || 'Validation failed')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- Continue ---------------- */
  const handleContinue = () => {
    if (!beneficiary) return toast.error('Validate beneficiary first')
    if (!amount || Number(amount) <= 0) return toast.error('Enter valid amount')
    if (balance > 0 && Number(amount) > balance) {
      return toast.error('Insufficient balance')
    }

    setStep('CONFIRM')
  }

  const beneficiaryName =
    beneficiary?.displayName ??
    beneficiary?.first_name ??
    beneficiary?.reg_mobile ??
    'Beneficiary'

  return (
    <PageContainer>
      <div className="max-w-md mx-auto px-4 py-6">

        <h1 className="text-xl font-semibold mb-4">Send Money</h1>

        <MobileInput
          label="Beneficiary mobile number"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value)
            setBeneficiary(null)
          }}
        />

        {!beneficiary && (
          <Button
            type="button"
            fullWidth
            onClick={handleValidate}
            disabled={loading}
            className="mt-4"
          >
            {loading ? 'Validating...' : 'Validate Beneficiary'}
          </Button>
        )}

        {beneficiary && (
          <>
            <div className="mt-4 text-sm bg-gray-50 p-3 rounded">
              Beneficiary: <strong>{beneficiaryName}</strong>
            </div>

            <AmountInput
              label="Amount"
              value={amount}
              onChange={setAmount}
            />

            <Input
              label="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <div className="mt-6 flex gap-2">
              <Button
                type="button"
                fullWidth
                onClick={handleContinue}
              >
                Continue
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setBeneficiary(null)
                  setAmount('')
                  setRemarks('')
                }}
              >
                Back
              </Button>
            </div>
          </>
        )}
      </div>

      {/* ---------------- CONFIRM POPUP ---------------- */}
      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        amount={amount}
        to={beneficiaryName}
        description="Send Money"
        loading={loading}
        onSendOtp={async () => {
          setLoading(true)
          try {
            await sendService.generateTransactionOtp(
              'MOBILE',
              senderMobile
            )
            toast.success('OTP sent')
            setStep('OTP')
          } catch (e) {
            toast.error(e.message || 'Failed to send OTP')
          } finally {
            setLoading(false)
          }
        }}
        onCancel={() => setStep(null)}
      />

      {/* ---------------- OTP POPUP ---------------- */}
      <OtpPopup
        open={step === 'OTP'}
        loading={loading}
        onConfirm={async (otp) => {
          setLoading(true)
          try {
            await sendService.verifyTransactionOtp(
              'MOBILE',
              senderMobile,
              otp
            )

            const { data } = await sendService.sendMoneyTransaction(
              beneficiary.user_id,
              amount,
              remarks
            )

            sessionStorage.setItem(
              'sendSuccess',
              JSON.stringify({
                ...data,
                beneficiary_name: beneficiaryName,
                beneficiary_mobile: beneficiary.reg_mobile,
                amount,
                remarks,
              })
            )

            setStep(null)
            navigate('/customer/send/success')
          } catch (e) {
            toast.error(e.message || 'Transaction failed')
          } finally {
            setLoading(false)
          }
        }}
        onCancel={() => setStep(null)}
      />
    </PageContainer>
  )
}

export default SendStart
