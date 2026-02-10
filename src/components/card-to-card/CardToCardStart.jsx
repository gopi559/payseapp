import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaCreditCard } from 'react-icons/fa'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import AmountInput from '../../Reusable/AmountInput'
import cardToCardService from './cardToCard.service'

const CardToCardStart = () => {
  const navigate = useNavigate()

  const [fromCard, setFromCard] = useState('')
  const [fromCardVerified, setFromCardVerified] = useState(false)
  const [fromCardName, setFromCardName] = useState('')
  const [toCard, setToCard] = useState('')
  const [toCardVerified, setToCardVerified] = useState(false)
  const [toCardName, setToCardName] = useState('')
  const [amount, setAmount] = useState('')
  const [cvv, setCvv] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [error, setError] = useState('')
  const [validatingFrom, setValidatingFrom] = useState(false)
  const [validatingTo, setValidatingTo] = useState(false)
  const verifyFromTimeoutRef = useRef(null)
  const verifyToTimeoutRef = useRef(null)

  const handleVerifyFromCard = async () => {
    const trimmed = fromCard.trim().replace(/\s/g, '')
    if (!trimmed || trimmed.length < 16) {
      return
    }
    if (fromCardVerified || validatingFrom) {
      return
    }
    setError('')
    setValidatingFrom(true)
    try {
      const { data } = await cardToCardService.verifyCard(trimmed)
      setFromCardVerified(true)
      setFromCardName(data?.card_holder_name || 'Card verified')
      setFromCard(trimmed)
    } catch (err) {
      setFromCardVerified(false)
      setFromCardName('')
      const msg = err?.message || 'Card not found or invalid. Please check the card number.'
      setError(msg)
      toast.error(msg)
    } finally {
      setValidatingFrom(false)
    }
  }

  const handleVerifyToCard = async () => {
    const trimmed = toCard.trim().replace(/\s/g, '')
    if (!trimmed || trimmed.length < 16) {
      return
    }
    if (toCardVerified || validatingTo) {
      return
    }
    if (trimmed === fromCard.trim().replace(/\s/g, '')) {
      setError('From card and To card cannot be the same')
      return
    }
    setError('')
    setValidatingTo(true)
    try {
      const { data } = await cardToCardService.verifyCard(trimmed)
      setToCardVerified(true)
      setToCardName(data?.card_holder_name || 'Card verified')
      setToCard(trimmed)
    } catch (err) {
      setToCardVerified(false)
      setToCardName('')
      const msg = err?.message || 'Card not found or invalid. Please check the card number.'
      setError(msg)
      toast.error(msg)
    } finally {
      setValidatingTo(false)
    }
  }

  // Auto-verify when from card number reaches 16 digits
  useEffect(() => {
    const card = fromCard.trim().replace(/\s/g, '')
    if (card.length === 16 && !fromCardVerified && !validatingFrom) {
      if (verifyFromTimeoutRef.current) {
        clearTimeout(verifyFromTimeoutRef.current)
      }
      verifyFromTimeoutRef.current = setTimeout(async () => {
        const cardValue = fromCard.trim().replace(/\s/g, '')
        if (cardValue.length === 16) {
          setError('')
          setValidatingFrom(true)
          try {
            const { data } = await cardToCardService.verifyCard(cardValue)
            setFromCardVerified(true)
            setFromCardName(data?.card_holder_name || 'Card verified')
            setFromCard(cardValue)
          } catch (err) {
            setFromCardVerified(false)
            setFromCardName('')
            const msg = err?.message || 'Card not found or invalid. Please check the card number.'
            setError(msg)
            toast.error(msg)
          } finally {
            setValidatingFrom(false)
          }
        }
      }, 500)
    }
    return () => {
      if (verifyFromTimeoutRef.current) {
        clearTimeout(verifyFromTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCard])

  // Auto-verify when to card number reaches 16 digits
  useEffect(() => {
    const card = toCard.trim().replace(/\s/g, '')
    if (card.length === 16 && !toCardVerified && !validatingTo) {
      if (verifyToTimeoutRef.current) {
        clearTimeout(verifyToTimeoutRef.current)
      }
      verifyToTimeoutRef.current = setTimeout(async () => {
        const cardValue = toCard.trim().replace(/\s/g, '')
        if (cardValue.length === 16) {
          if (cardValue === fromCard.trim().replace(/\s/g, '')) {
            setError('From card and To card cannot be the same')
            return
          }
          setError('')
          setValidatingTo(true)
          try {
            const { data } = await cardToCardService.verifyCard(cardValue)
            setToCardVerified(true)
            setToCardName(data?.card_holder_name || 'Card verified')
            setToCard(cardValue)
          } catch (err) {
            setToCardVerified(false)
            setToCardName('')
            const msg = err?.message || 'Card not found or invalid. Please check the card number.'
            setError(msg)
            toast.error(msg)
          } finally {
            setValidatingTo(false)
          }
        }
      }, 500)
    }
    return () => {
      if (verifyToTimeoutRef.current) {
        clearTimeout(verifyToTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toCard, fromCard])

  const handleContinue = () => {
    const fromCardValue = fromCard.trim().replace(/\s/g, '')
    const toCardValue = toCard.trim().replace(/\s/g, '')
    
    if (!fromCardValue || fromCardValue.length !== 16) {
      setError('Please enter a valid 16-digit from card number')
      return
    }
    if (!fromCardVerified) {
      setError('Please wait for from card verification to complete')
      return
    }
    if (!toCardValue || toCardValue.length !== 16) {
      setError('Please enter a valid 16-digit to card number')
      return
    }
    if (!toCardVerified) {
      setError('Please wait for to card verification to complete')
      return
    }
    if (fromCardValue === toCardValue) {
      setError('From card and To card cannot be the same')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!cvv || cvv.length !== 3) {
      setError('Please enter a valid 3-digit CVV')
      return
    }
    if (!expiryDate || expiryDate.length !== 4 || !/^\d{4}$/.test(expiryDate)) {
      setError('Please enter a valid expiry date (MMYY format, e.g., 1230)')
      return
    }
    
    setError('')
    sessionStorage.setItem(
      'cardToCardData',
      JSON.stringify({
        from_card: fromCardValue,
        from_card_name: fromCardName,
        to_card: toCardValue,
        to_card_name: toCardName,
        txn_amount: amount,
        cvv: cvv,
        expiry_date: expiryDate,
      })
    )
    navigate('/customer/card-to-card/confirm')
  }

  const maskedFromCard = fromCard ? `${fromCard.slice(0, 4)} **** **** ${fromCard.slice(-4)}` : ''
  const maskedToCard = toCard ? `${toCard.slice(0, 4)} **** **** ${toCard.slice(-4)}` : ''

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FaCreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark">Card to Card</h1>
            <p className="text-sm text-gray-500">Transfer money from one card to another</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="space-y-4">
            {/* From Card */}
            <div>
              <Input
                label="From Card Number"
                value={fromCard}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setFromCard(value)
                  if (value.length !== fromCard.length) {
                    setFromCardVerified(false)
                    setFromCardName('')
                    setError('')
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (fromCardVerified) {
                      // Focus on to card
                      document.querySelector('input[placeholder*="To card"]')?.focus()
                    } else if (fromCard.trim().replace(/\s/g, '').length === 16) {
                      handleVerifyFromCard()
                    }
                  }
                }}
                placeholder="e.g. 5522605101177412"
                maxLength={16}
                disabled={fromCardVerified}
                autoComplete="cc-number"
                inputMode="numeric"
              />
              {fromCardVerified && fromCardName && (
                <div className="mt-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm">
                  <span className="text-gray-600">Card Name: </span>
                  <span className="font-medium text-green-700">{fromCardName}</span>
                </div>
              )}
              {validatingFrom && (
                <div className="mt-2 text-sm text-gray-600">
                  Verifying card...
                </div>
              )}
            </div>

            {/* To Card */}
            {fromCardVerified && (
              <div>
                <Input
                  label="To Card Number"
                  value={toCard}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setToCard(value)
                    if (value.length !== toCard.length) {
                      setToCardVerified(false)
                      setToCardName('')
                      setError('')
                    }
                    if (value === fromCard.trim().replace(/\s/g, '')) {
                      setError('From card and To card cannot be the same')
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (toCardVerified) {
                        // Focus on amount
                        document.querySelector('input[placeholder*="Amount"]')?.focus()
                      } else if (toCard.trim().replace(/\s/g, '').length === 16) {
                        handleVerifyToCard()
                      }
                    }
                  }}
                  placeholder="e.g. 5522605101177411"
                  maxLength={16}
                  disabled={toCardVerified}
                  autoComplete="cc-number"
                  inputMode="numeric"
                />
                {toCardVerified && toCardName && (
                  <div className="mt-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm">
                    <span className="text-gray-600">Card Name: </span>
                    <span className="font-medium text-green-700">{toCardName}</span>
                  </div>
                )}
                {validatingTo && (
                  <div className="mt-2 text-sm text-gray-600">
                    Verifying card...
                  </div>
                )}
              </div>
            )}

            {/* Amount and Card Details */}
            {fromCardVerified && toCardVerified && (
              <>
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm space-y-1">
                  <div>
                    <span className="text-gray-500">From Card: </span>
                    <span className="font-medium text-brand-dark font-mono">{maskedFromCard}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">To Card: </span>
                    <span className="font-medium text-brand-dark font-mono">{maskedToCard}</span>
                  </div>
                </div>

                <AmountInput
                  label="Amount"
                  value={amount}
                  onChange={setAmount}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="CVV"
                    value={cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                      setCvv(value)
                    }}
                    placeholder="123"
                    maxLength={3}
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    type="password"
                  />
                  <Input
                    label="Expiry Date (MMYY)"
                    value={expiryDate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setExpiryDate(value)
                    }}
                    placeholder="1230"
                    maxLength={4}
                    inputMode="numeric"
                  />
                </div>

                <div className="pt-2">
                  <Button onClick={handleContinue} fullWidth size="md">
                    Continue
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default CardToCardStart

