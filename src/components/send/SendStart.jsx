import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import MobileInput from '../../Reusable/MobileInput'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import AmountInput from '../../Reusable/AmountInput'
import Input from '../../Reusable/Input'
import Button from '../../Reusable/Button'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'
import THEME_COLORS from '../../theme/colors'
import { IoArrowBack } from 'react-icons/io5'
import { sendService } from './send.service'

const SendStart = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const balance = useSelector((state) => state.wallet?.balance ?? 0)
  const [mobile, setMobile] = useState('+93')
  const [beneficiary, setBeneficiary] = useState(null)
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(null)
  const contentCard = THEME_COLORS.contentCard

  const senderMobile =
    user?.reg_info?.mobile ??
    user?.reg_info?.reg_mobile ??
    user?.mobile ??
    ''

  const handleValidate = async () => {
    if (!mobile || mobile === '+93') {
      toast.error('Enter Beneficiary Mobile Number')
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
  const beneficiaryNameUpper = String(beneficiaryName || '').toUpperCase()

  const header = (
    <div className="px-4 pt-4 pb-3 border-b border-[#E9ECEB] bg-[#F5FAF6]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#1F2937]"
        >
          <IoArrowBack size={18} />
        </button>
        <h1 className="text-3xl font-semibold text-[#111827]">Send</h1>
      </div>
    </div>
  )

  return (
    <MobileScreenContainer header={header}>
      <div className="p-4 space-y-4 bg-[#F5FAF6] min-h-full">
        <section className="bg-white rounded-2xl p-4 shadow-[0_6px_18px_rgba(15,23,42,0.08)] space-y-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Send Funds</h2>
          <p className="text-sm text-[#4B5563]">
            To send money, first enter the phone number of the Paysey user you wish to transfer funds.
          </p>

          <MobileInput
            label="Mobile Number"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value)
              setBeneficiary(null)
            }}
            className="rounded-xl h-12"
          />

          <Button type="button" fullWidth onClick={handleValidate} disabled={loading}>
            {loading ? 'Validating...' : 'Validate Beneficiary'}
          </Button>
        </section>

        {beneficiary && (
          <section className="bg-white rounded-2xl p-4 shadow-[0_6px_18px_rgba(15,23,42,0.08)] space-y-3">
            <div
              className="text-sm p-3 rounded-xl"
              style={{
                backgroundColor: contentCard.background,
                border: `1px solid ${contentCard.border}`,
                color: contentCard.subtitle,
              }}
            >
              Beneficiary Name: <strong>{beneficiaryNameUpper}</strong>
            </div>

            <AmountInput label="Amount" value={amount} onChange={setAmount} />

            <Input
              label="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <div className="pt-2 flex gap-2">
              <Button type="button" fullWidth onClick={handleContinue}>
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
          </section>
        )}
      </div>

      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        amount={amount}
        to={beneficiaryName}
        mobile={mobile}
        description="Send Money"
        loading={loading}
        onSendOtp={async () => {
          setLoading(true)
          try {
            await sendService.generateTransactionOtp('MOBILE', senderMobile)
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

      <OtpPopup
        open={step === 'OTP'}
        loading={loading}
        length={6}
        onConfirm={async (otp) => {
          setLoading(true)
          try {
            await sendService.verifyTransactionOtp('MOBILE', senderMobile, otp)

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
    </MobileScreenContainer>
  )
}

export default SendStart
