import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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

const normalizeMobile = (value) => {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('+')) return `+${trimmed.slice(1).replace(/\D/g, '')}`
  return `+${trimmed.replace(/\D/g, '')}`
}

const getCustomerId = (user) =>
  user?.reg_info?.user_id ??
  user?.reg_info?.id ??
  user?.user_id ??
  user?.id ??
  null

const SendStart = () => {
  const { t } = useTranslation()
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
    user?.reg_info?.mobile ?? user?.reg_info?.reg_mobile ?? user?.mobile ?? ''
  const currentUserId = getCustomerId(user)
  const currentUserMobile = normalizeMobile(senderMobile)

  const handleValidate = async () => {
    if (!mobile || mobile === '+93') {
      toast.error(t('enter_beneficiary_mobile_number'))
      return
    }

    setLoading(true)
    try {
      const { data } = await sendService.validateBeneficiary(mobile)
      const beneficiaryId = data?.user_id ?? data?.id ?? null
      const beneficiaryMobile = normalizeMobile(data?.reg_mobile ?? mobile)
      if (
        Number(beneficiaryId) === Number(currentUserId) ||
        beneficiaryMobile === currentUserMobile
      ) {
        setBeneficiary(null)
        toast.error(t('cannot_send_money_to_yourself'))
        return
      }
      setBeneficiary(data)
      toast.success(t('beneficiary_validated'))
    } catch (e) {
      setBeneficiary(null)
      toast.error(e.message || t('validation_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (!beneficiary) {
      toast.error(t('validate_beneficiary_first'))
      return
    }

    if (!amount || Number(amount) <= 0) {
      toast.error(t('enter_valid_amount'))
      return
    }

    const beneficiaryId = beneficiary?.user_id ?? beneficiary?.id ?? null
    const beneficiaryMobile = normalizeMobile(beneficiary?.reg_mobile ?? mobile)
    if (
      Number(beneficiaryId) === Number(currentUserId) ||
      beneficiaryMobile === currentUserMobile
    ) {
      toast.error(t('cannot_send_money_to_yourself'))
      return
    }

    if (balance > 0 && Number(amount) > balance) {
      toast.error(t('insufficient_balance'))
      return
    }

    setStep('CONFIRM')
  }

  const beneficiaryName =
    beneficiary?.displayName ??
    beneficiary?.first_name ??
    beneficiary?.reg_mobile ??
    t('beneficiary')

  const beneficiaryNameUpper = String(beneficiaryName || '').toUpperCase()

  const header = (
    <div className="px-4 pt-4 pb-3 border-b border-[#E9ECEB] bg-[#F5FAF6]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t('go_back')}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#1F2937]"
        >
          <IoArrowBack size={18} />
        </button>
        <h1 className="text-3xl font-semibold text-[#111827]">{t('send')}</h1>
      </div>
    </div>
  )

  return (
    <MobileScreenContainer header={header}>
      <div className="p-4 space-y-4 bg-[#F5FAF6] min-h-full">
        <section className="bg-white rounded-2xl p-4 shadow-[0_6px_18px_rgba(15,23,42,0.08)] space-y-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">{t('send_funds')}</h2>
          <p className="text-sm text-[#4B5563]">{t('send_funds_instructions')}</p>

          <MobileInput
            label={t('mobile_number')}
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value)
              setBeneficiary(null)
            }}
            className="rounded-xl h-12"
          />

          <Button type="button" fullWidth onClick={handleValidate} disabled={loading}>
            {loading ? t('validating') : t('validate_beneficiary')}
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
              {t('beneficiary_name')}: <strong>{beneficiaryNameUpper}</strong>
            </div>

            <AmountInput label={t('amount')} value={amount} onChange={setAmount} />

            <Input
              label={t('remarks_optional')}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <div className="pt-2 flex gap-2">
              <Button type="button" fullWidth onClick={handleContinue}>
                {t('continue')}
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
                {t('back')}
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
        description={t('send_money')}
        loading={loading}
        onSendOtp={async () => {
          setLoading(true)
          try {
            await sendService.generateTransactionOtp('MOBILE', senderMobile)
            toast.success(t('otp_sent'))
            setStep('OTP')
          } catch (e) {
            toast.error(e.message || t('failed_to_send_otp'))
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

            const beneficiaryId = beneficiary?.user_id ?? beneficiary?.id ?? null
            const beneficiaryMobile = normalizeMobile(beneficiary?.reg_mobile ?? mobile)
            if (
              Number(beneficiaryId) === Number(currentUserId) ||
              beneficiaryMobile === currentUserMobile
            ) {
              toast.error(t('cannot_send_money_to_yourself'))
              setStep(null)
              return
            }

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
            toast.error(e.message || t('transaction_failed'))
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
