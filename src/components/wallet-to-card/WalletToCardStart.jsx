import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { FaCreditCard } from 'react-icons/fa'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import AmountInput from '../../Reusable/AmountInput'
import walletToCardService from './walletToCard.service'

const WalletToCardStart = () => {
  const navigate = useNavigate()
  const balance = useSelector((state) => state.wallet?.balance ?? 0)

  const [cardNumber, setCardNumber] = useState('')
  const [cardVerified, setCardVerified] = useState(false)
  const [cardName, setCardName] = useState('')
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(false)
  const verifyTimeoutRef = useRef(null)

  const handleVerifyCard = async () => {
    const trimmed = cardNumber.trim().replace(/\s/g, '')
    if (!trimmed || trimmed.length < 16) {
      return
    }
    if (cardVerified || validating) {
      return
    }
    setError('')
    setValidating(true)
    try {
      const { data } = await walletToCardService.verifyCard(trimmed)
      setCardVerified(true)
      setCardName(data?.card_holder_name || 'Card verified')
      setCardNumber(trimmed)
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

  // Auto-verify when card number reaches 16 digits
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
            const { data } = await walletToCardService.verifyCard(cardValue)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardNumber])

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
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (balance > 0 && parseFloat(amount) > balance) {
      setError('Insufficient balance')
      return
    }
    setError('')
    sessionStorage.setItem(
      'walletToCardData',
      JSON.stringify({
        card_number: card,
        card_name: cardName,
        txn_amount: amount,
        remarks: remarks || '',
      })
    )
    navigate('/customer/wallet-to-card/confirm')
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
                <div className="mt-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm">
                  <span className="text-gray-600">Card Name: </span>
                  <span className="font-medium text-green-700">{cardName}</span>
                </div>
              )}
              {validating && (
                <div className="mt-2 text-sm text-gray-600">
                  Verifying card...
                </div>
              )}
            </div>

            {cardVerified && (
              <>
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm">
                  <span className="text-gray-500">Card: </span>
                  <span className="font-medium text-brand-dark font-mono">{maskedCard}</span>
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
                  placeholder="e.g. Wallet to card transaction"
                />

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

export default WalletToCardStart



