import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { IoArrowBack } from 'react-icons/io5'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import cashInService from './cashIn.service'
import THEME_COLORS from '../../theme/colors'

const CashInPage = () => {
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
      setCardName(data?.card_holder_name || 'Card verified')
      setCardNumber(card)
    } catch (err) {
      setCardVerified(false)
      setCardName('')
      const msg = err?.message || 'Card not found or invalid. Please check the card number.'
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
            setCardName(data?.card_holder_name || 'Card verified')
            setCardNumber(cardValue)
          } catch (err) {
            setCardVerified(false)
            setCardName('')
            const msg = err?.message || 'Card not found or invalid. Please check the card number.'
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
  }, [cardNumber, cardVerified, validating])

  const handleContinue = () => {
    const card = cardNumber.trim().replace(/\s/g, '')
    if (!card || card.length !== 16) {
      setError('Please enter a valid 16-digit card number')
      return
    }
    if (!cardVerified) {
      setError('Please wait for card verification to complete')
      return
    }
    if (!cvv || cvv.length !== 3) {
      setError('Please enter CVV2')
      return
    }
    const expiry = expiryDate.trim().replace(/\D/g, '')
    if (expiry.length !== 4) {
      setError('Please enter expiry as MMYY (e.g. 1030)')
      return
    }
    const month = Number(expiry.slice(0, 2))
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      setError('Please enter a valid expiry month (01-12)')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
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
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#1F2937]"
        >
          <IoArrowBack size={18} />
        </button>
        <h1 className="text-3xl font-semibold text-[#111827]">Cash In</h1>
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

        <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }} autoComplete="on" className="space-y-4">
          <section className="bg-white rounded-2xl p-4 shadow-[0_6px_18px_rgba(15,23,42,0.08)] border border-[#E5E7EB] space-y-4">
            <h3 className="text-lg font-semibold text-[#1F2937]">Cash In Funds</h3>
            <p className="text-sm" style={{ color: contentCard.subtitle }}>
              Enter card details. An OTP will be sent to complete the transaction.
            </p>

            <div>
              <Input
                label="Card number"
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
                placeholder="e.g. 2345543212345432"
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
                  <span style={{ color: contentCard.subtitle }}>Card Name: </span>
                  <span className="font-medium" style={{ color: contentCard.title }}>{cardName}</span>
                </div>
              )}
              {validating && (
                <div className="mt-2 text-sm" style={{ color: contentCard.subtitle }}>
                  Verifying card...
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CVV2"
                type="password"
                value={cvv}
                onChange={(e) => {
                  setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
                  setError('')
                }}
                placeholder="e.g. 234"
                maxLength={3}
                autoComplete="cc-csc"
              />
              <Input
                label="Expiry (MMYY)"
                value={expiryDate}
                onChange={(e) => {
                  let digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                  if (digits.length >= 2) {
                    const month = Number(digits.slice(0, 2))
                    if (month > 12) {
                      digits = `12${digits.slice(2)}`
                    } else if (month === 0) {
                      digits = `01${digits.slice(2)}`
                    }
                  }
                  setExpiryDate(digits)
                  setError('')
                }}
                placeholder="e.g. 1030"
                maxLength={4}
                autoComplete="cc-exp"
              />
            </div>
          </section>

          <section className="bg-white rounded-2xl p-4 shadow-[0_6px_18px_rgba(15,23,42,0.08)] border border-[#E5E7EB] space-y-3">
            <h3 className="text-lg font-semibold text-[#1F2937]">Enter Amount</h3>
            <AmountInput label="Amount" value={amount} onChange={setAmount} />
          </section>

          <div className="pt-1">
            <Button type="submit" fullWidth size="md">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </MobileScreenContainer>
  )
}

export default CashInPage
