import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from './Button'
import { HiExclamationTriangle } from 'react-icons/hi2'
import { BENIFICIARY_ADD, CARD_NUMBER_VERIFY } from '../utils/constant'
import { getAuthToken, deviceId } from '../services/api'
import { validateCardBinForTransaction } from '../services/binValidation.jsx'
import { toast } from 'react-toastify'
import THEME_COLORS from '../theme/colors'
import fetchWithRefreshToken from '../services/fetchWithRefreshToken'

const DEFAULT_TRANSACTION_TYPE = 'CASH_IN'

const AddBeneficiaryPopup = ({
  open,
  onClose,
  onSuccess,
  transactionType = DEFAULT_TRANSACTION_TYPE,
}) => {
  const { t } = useTranslation()
  // ✅ store only digits (no spaces)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)
  const [binStatus, setBinStatus] = useState('idle')
  const [validatedBin, setValidatedBin] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [cardholderStatus, setCardholderStatus] = useState('idle')
  const popupColors = THEME_COLORS.popup

  const reqIdRef = useRef(0)
  const cardholderReqIdRef = useRef(0)
  const validatedTransactionTypeRef = useRef(transactionType)

  // ✅ format for display: 1234 5678 9012 3456
  const formattedCardNumber = useMemo(() => {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }, [cardNumber])

  const isValid = useMemo(() => {
    const hasValidCard = cardNumber.length === 16
    const hasValidBin = binStatus === 'valid'
    return hasValidCard && hasValidBin
  }, [cardNumber, binStatus])

  useEffect(() => {
    if (!open) return

    const currentBin = cardNumber.slice(0, 6)
    if (currentBin.length < 6) {
      setBinStatus('idle')
      setValidatedBin('')
      return
    }

    if (
      validatedBin === currentBin &&
      validatedTransactionTypeRef.current === transactionType
    ) {
      return
    }

    reqIdRef.current += 1
    const myReqId = reqIdRef.current

    setValidatedBin(currentBin)
    validatedTransactionTypeRef.current = transactionType
    setBinStatus('checking')

    let cleared = false
    const t = setTimeout(() => {
      if (cleared) return
      if (myReqId !== reqIdRef.current) return
      setBinStatus('invalid')
      toast.error('BIN check timeout')
    }, 12000)

    const run = async () => {
      try {
        const matchedBin = await validateCardBinForTransaction(currentBin, transactionType)
        if (myReqId !== reqIdRef.current) return

        if (!matchedBin) {
          setBinStatus('invalid')
          toast.error('Entered card BIN is not supported')
          return
        }

        setBinStatus('valid')
      } catch (err) {
        if (myReqId !== reqIdRef.current) return
        setBinStatus('invalid')
        toast.error(err?.message || 'Unable to verify card BIN')
      } finally {
        cleared = true
        clearTimeout(t)
      }
    }

    run()

    return () => {
      cleared = true
      clearTimeout(t)
    }
  }, [cardNumber, open, transactionType, validatedBin])

  useEffect(() => {
    if (!open) return

    if (cardNumber.length !== 16) {
      cardholderReqIdRef.current += 1
      setCardholderName('')
      setCardholderStatus('idle')
      return
    }

    cardholderReqIdRef.current += 1
    const myReqId = cardholderReqIdRef.current
    setCardholderStatus('checking')

    const run = async () => {
      try {
        const response = await fetchWithRefreshToken(CARD_NUMBER_VERIFY, {
          method: 'POST',
          body: JSON.stringify({
            card_number: cardNumber,
          }),
        })

        const result = await response.json().catch(() => null)
        if (myReqId !== cardholderReqIdRef.current) return

        const inquiryData = result?.data ?? {}
        if (
          !response.ok ||
          (result?.code !== 1 && result?.success !== true) ||
          (inquiryData?.code != null && Number(inquiryData.code) !== 0)
        ) {
          throw new Error(result?.message || 'Card name inquiry failed')
        }

        const resolvedName =
          inquiryData.card_holder_name ||
          inquiryData.cardholder_name ||
          inquiryData.name_on_card ||
          ''

        setCardholderName(String(resolvedName).trim())
        setCardholderStatus(resolvedName ? 'resolved' : 'idle')
      } catch (_) {
        if (myReqId !== cardholderReqIdRef.current) return
        setCardholderName('')
        setCardholderStatus('idle')
      }
    }

    run()

    return () => {
      cardholderReqIdRef.current += 1
    }
  }, [cardNumber, open])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = ''
      reqIdRef.current += 1
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setBinStatus('idle')
      setValidatedBin('')
      setCardholderName('')
      setCardholderStatus('idle')
      validatedTransactionTypeRef.current = transactionType
    }
  }, [open])

  if (!open) return null

  const handleExpiryChange = (value) => {
    let raw = value.replace(/\D/g, '').slice(0, 4)
    if (raw.length >= 2) {
      const month = Number(raw.slice(0, 2))
      if (month > 12) {
        raw = `12${raw.slice(2)}`
      } else if (month === 0) {
        raw = `01${raw.slice(2)}`
      }
    }
    if (raw.length <= 2) {
      setExpiryDate(raw)
      return
    }
    setExpiryDate(`${raw.slice(0, 2)}/${raw.slice(2)}`)
  }

  const handleClose = () => {
    if (loading) return
    onClose?.()
  }

  const handleContinue = async () => {
    if (!isValid) return

    setLoading(true)
    try {
      const stan = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')

      const response = await fetch(BENIFICIARY_ADD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
          deviceInfo: JSON.stringify({
            device_type: 'WEB',
            device_id: deviceId,
          }),
        },
        body: JSON.stringify({
          // ✅ send digits-only value
          card_number: cardNumber,
          cardholder_name: cardholderName,
          stan,
        }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || result?.code !== 1) {
        throw new Error(result?.message || 'Failed to add beneficiary')
      }

      toast.success(result?.message || 'Card added successfully')
      handleClose()
      onSuccess?.()
    } catch (err) {
      toast.error(err?.message || 'Failed to add beneficiary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center md:justify-center px-4 md:px-10"
      style={{ backgroundColor: popupColors.backdrop }}
    >
      <div
        className="w-full max-w-[409px] rounded-3xl p-4 ml-1 md:ml-72"
        style={{
          backgroundColor: popupColors.panelBackground,
          border: `1px solid ${popupColors.panelBorder}`,
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <HiExclamationTriangle
            className="w-6 h-6"
            style={{ color: popupColors.cvv.icon }}
          />
          <h2
            className="text-lg font-semibold"
            style={{ color: popupColors.title }}
          >
            {t('add_new_card')}
          </h2>
        </div>

        <p className="text-sm mb-4" style={{ color: popupColors.subtitle }}>
          {t('add_other_bank_card_as_beneficiary')}
        </p>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            inputMode="numeric"
            // ✅ 16 digits + 3 spaces = 19
            maxLength={19}
            autoFocus
            value={formattedCardNumber}
            onChange={(e) => {
              // ✅ keep only digits in state
              const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
              setCardNumber(digits)
            }}
            placeholder="1234 5678 9012 3456"
            className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none"
            style={{
              backgroundColor: popupColors.inputBackground,
              borderColor: popupColors.inputBorder,
              color: popupColors.title,
            }}
          />

          {binStatus === 'checking' && (
            <p className="text-xs px-1" style={{ color: popupColors.subtitle }}>
              {t('checking_card_bin')}
            </p>
          )}

          {binStatus === 'valid' && (
            <p className="text-xs px-1 text-[#16A34A]">{t('card_bin_supported')}</p>
          )}

          {binStatus === 'invalid' && (
            <p className="text-xs px-1 text-[#DC2626]">
              {t('card_not_supported')}
            </p>
          )}

          {cardholderStatus === 'checking' && (
            <p className="text-xs px-1" style={{ color: popupColors.subtitle }}>
              Verifying cardholder name...
            </p>
          )}

          {cardholderName && (
            <p className="text-xs px-1 text-[#16A34A]">
              Cardholder: {cardholderName}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={3}
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
              }
              placeholder="CVV2"
              className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none"
              style={{
                backgroundColor: popupColors.inputBackground,
                borderColor: popupColors.inputBorder,
                color: popupColors.title,
              }}
            />

            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={expiryDate}
              onChange={(e) => handleExpiryChange(e.target.value)}
              placeholder="MM/YY"
              className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none"
              style={{
                backgroundColor: popupColors.inputBackground,
                borderColor: popupColors.inputBorder,
                color: popupColors.title,
              }}
            />
          </div>

        </div>

        <Button fullWidth onClick={handleContinue} disabled={!isValid || loading}>
          {loading ? t('submitting') : t('continue')}
        </Button>

        <button
          className="w-full mt-4 text-sm"
          style={{ color: popupColors.subtitle }}
          onClick={handleClose}
          disabled={loading}
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}

export default AddBeneficiaryPopup
