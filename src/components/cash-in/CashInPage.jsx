import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { IoArrowBack } from 'react-icons/io5'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import cashInService from './cashIn.service'
import THEME_COLORS from '../../theme/colors'

const CashInPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [cardNumber, setCardNumber] = useState('')
  const [cvv, setCvv] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [cardVerified, setCardVerified] = useState(false)
  const [cardName, setCardName] = useState('')
  const [validating, setValidating] = useState(false)
  const verifyTimeoutRef = useRef(null)
  const contentCard = THEME_COLORS.contentCard
  const statusColors = THEME_COLORS.status

  const handleVerifyCard = async () => {
    const card = cardNumber.trim().replace(/\s/g, '')
    if (!card || card.length < 16) {
      return
    }
    if (cardVerified || validating) {
      return
    }
    setError('')
    setValidating(true)
    try {
      const { data } = await cashInService.verifyCard(card)
      setCardVerified(true)
      setCardName(data?.card_holder_name || t('card_verified'))
      setCardNumber(card)
    } catch (err) {
      setCardVerified(false)
      setCardName('')
      const msg = err?.message || t('card_not_found_invalid')
      setError(msg)
      toast.error(msg)
    } finally {
      setValidating(false)
    }
  }

  useEffect(() => {
    const card = cardNumber.trim().replace(/\s/g, '')
    if (card.length === 16 && !cardVerified && !validating) {
      if (verifyTimeoutRef.current) {
        clearTimeout(verifyTimeoutRef.current)
      }
      verifyTimeoutRef.current = setTimeout(async () => {
        const cardValue = cardNumber.trim().replace(/\s/g, '')
        if (cardValue.length === 16) {
          setError('')
          setValidating(true)
          try {
            const { data } = await cashInService.verifyCard(cardValue)
            setCardVerified(true)
            setCardName(data?.card_holder_name || t('card_verified'))
            setCardNumber(cardValue)
          } catch (err) {
            setCardVerified(false)
            setCardName('')
            const msg = err?.message || t('card_not_found_invalid')
            setError(msg)
            toast.error(msg)
          } finally {
            setValidating(false)
          }
        }
      }, 500)
    }
    return () => {
      if (verifyTimeoutRef.current) {
        clearTimeout(verifyTimeoutRef.current)
      }
    }
  }, [cardNumber, cardVerified, validating, t])

  const handleContinue = () => {
    const card = cardNumber.trim().replace(/\s/g, '')
    if (!card || card.length !== 16) {
      setError(t('please_enter_valid_16_digit_card_number'))
      return
    }
    if (!cardVerified) {
      setError(t('please_wait_for_card_verification'))
      return
    }
    if (!cvv || cvv.length !== 3) {
      setError(t('please_enter_cvv2'))
      return
    }
    const expiry = expiryDate.trim().replace(/\D/g, '')
    if (expiry.length !== 4) {
      setError(t('please_enter_expiry_mmyy'))
      return
    }
    const month = Number(expiry.slice(0, 2))
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      setError(t('please_enter_valid_expiry_month'))
      return
    }
    const year = Number(expiry.slice(2, 4))
    const currentYear = new Date().getFullYear() % 100
    if (!Number.isInteger(year) || year < currentYear) {
      setError(t('please_enter_valid_expiry_year'))
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError(t('please_enter_valid_amount'))
      return
    }
    setError('')
    sessionStorage.setItem(
      'cashInData',
      JSON.stringify({
        card_number: card,
        cvv,
        expiry_date: expiry,
        txn_amount: amount,
        card_name: cardName,
      })
    )
    navigate('/customer/cash-in/confirm')
  }

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
        <h1 className="text-3xl font-semibold text-[#111827]">{t('cash_in')}</h1>
      </div>
    </div>
  )

  return (
    <MobileScreenContainer header={header}>
      <div className="p-4 space-y-4 bg-[#F5FAF6] min-h-full overflow-x-hidden">
        {error && (
          <div
            className="px-3 py-2 rounded-xl text-sm"
            style={{ border: `1px solid ${statusColors.failedBackground}`, color: statusColors.failedText }}
          >
            {error}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleContinue() }} autoComplete="on" className="space-y-4">
          <section className="bg-white rounded-2xl p-4 shadow-[0_6px_18px_rgba(15,23,42,0.08)] border border-[#E5E7EB] space-y-4">
            <h3 className="text-lg font-semibold text-[#1F2937]">{t('cash_in_funds')}</h3>
            <p className="text-sm" style={{ color: contentCard.subtitle }}>
              {t('enter_card_details_otp')}
            </p>

            <div>
              <Input
                label="card_number"
                value={cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setCardNumber(value)
                  if (value.length !== cardNumber.length) {
                    setCardVerified(false)
                    setCardName('')
                    setError('')
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (cardVerified) {
                      handleContinue()
                    } else if (cardNumber.trim().replace(/\s/g, '').length === 16) {
                      handleVerifyCard()
                    }
                  }
                }}
                placeholder="card_number_placeholder"
                maxLength={16}
                disabled={cardVerified}
                autoComplete="cc-number"
                inputMode="numeric"
              />
              {cardVerified && cardName && (
                <div
                  className="mt-2 rounded-lg px-3 py-2 text-sm"
                  style={{ border: `1px solid ${contentCard.divider}`, backgroundColor: contentCard.accentBackground }}
                >
                  <span style={{ color: contentCard.subtitle }}>{t('card_name_label')}: </span>
                  <span className="font-medium" style={{ color: contentCard.title }}>{cardName}</span>
                </div>
              )}
              {validating && (
                <div className="mt-2 text-sm" style={{ color: contentCard.subtitle }}>
                  {t('verifying_card')}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="cvv2"
                type="password"
                value={cvv}
                onChange={(e) => {
                  setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
                  setError('')
                }}
                placeholder="cvv2_placeholder"
                maxLength={3}
                autoComplete="cc-csc"
              />
              <Input
                label="expiry_mmyy"
                value={expiryDate}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setExpiryDate(digits)
                  setError('')
                }}
                placeholder="expiry_placeholder"
                maxLength={4}
                autoComplete="cc-exp"
              />
            </div>
          </section>

          <section className="bg-white rounded-2xl p-4 shadow-[0_6px_18px_rgba(15,23,42,0.08)] border border-[#E5E7EB] space-y-3">
            <h3 className="text-lg font-semibold text-[#1F2937]">{t('enter_amount')}</h3>
            <AmountInput label={t('amount')} value={amount} onChange={setAmount} />
          </section>

          <div className="pt-1">
            <Button type="submit" fullWidth size="md">
              {t('continue')}
            </Button>
          </div>
        </form>
      </div>
    </MobileScreenContainer>
  )
}

export default CashInPage
