import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BsCashCoin } from 'react-icons/bs'
import PageContainer from '../../Reusable/PageContainer'
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
    if (!cvv || cvv.length < 3) {
      setError('Please enter CVV')
      return
    }
    const expiry = expiryDate.trim().replace(/\D/g, '')
    if (expiry.length !== 4) {
      setError('Please enter expiry as MMYY (e.g. 1030)')
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

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: contentCard.iconBackground }}>
            <BsCashCoin className="w-6 h-6" style={{ color: contentCard.iconColor }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold" style={{ color: contentCard.title }}>Cash In</h1>
            <p className="text-sm" style={{ color: contentCard.subtitle }}>Add money to your wallet from your card</p>
          </div>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-md mb-4 text-sm" style={{ border: `1px solid ${THEME_COLORS.status.failedBackground}`, color: THEME_COLORS.status.failedText }}>
            {error}
          </div>
        )}

        <div className="rounded-lg shadow-sm border p-4 sm:p-6" style={{ backgroundColor: contentCard.background, borderColor: contentCard.border }}>
          <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: contentCard.subtitle }}>
            Enter card details. An OTP will be sent to complete the transaction.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }} autoComplete="on">
            <div className="space-y-4">
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
                  <div className="mt-2 rounded-lg px-3 py-2 text-sm" style={{ border: `1px solid ${contentCard.divider}`, backgroundColor: contentCard.accentBackground }}>
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
                  label="CVV"
                  type="password"
                  value={cvv}
                  onChange={(e) => {
                    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                    setError('')
                  }}
                  placeholder="e.g. 234"
                  maxLength={4}
                  autoComplete="cc-csc"
                />
                <Input
                  label="Expiry (MMYY)"
                  value={expiryDate}
                  onChange={(e) => {
                    setExpiryDate(e.target.value.replace(/\D/g, '').slice(0, 4))
                    setError('')
                  }}
                  placeholder="e.g. 1030"
                  maxLength={4}
                  autoComplete="cc-exp"
                />
              </div>
              <AmountInput label="Amount" value={amount} onChange={setAmount} />
            </div>
            <div className="pt-4">
              <Button type="submit" fullWidth size="md">
                Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  )
}

export default CashInPage
