import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { HiCreditCard, HiExclamationTriangle } from 'react-icons/hi2'
import PageContainer from '../../../Reusable/PageContainer'
import Button from '../../../Reusable/Button'
import fetchWithRefreshToken from '../../../services/fetchWithRefreshToken'
import { validateCardBinForTransaction } from '../../../services/binValidation.jsx'
import { BENIFICIARY_ADD, CARD_NUMBER_VERIFY } from '../../../utils/constant'
import THEME_COLORS from '../../../theme/colors'

const CardBeneficiaryAdd = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const contentCard = THEME_COLORS.contentCard
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [binStatus, setBinStatus] = useState('idle')
  const [cardholderName, setCardholderName] = useState('')
  const [cardholderStatus, setCardholderStatus] = useState('idle')
  const reqIdRef = useRef(0)
  const cardholderReqIdRef = useRef(0)
  const popupColors = THEME_COLORS.popup
  const expiryDigits = expiryDate.replace(/\D/g, '')
  const formattedCardNumber = useMemo(
    () => cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim(),
    [cardNumber]
  )

  const getExpiryErrorKey = (digits) => {
    if (digits.length !== 4) {
      return 'please_enter_expiry_mmyy'
    }

    const month = Number(digits.slice(0, 2))
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return 'please_enter_valid_expiry_month'
    }

    const year = Number(digits.slice(2, 4))
    const currentYear = new Date().getFullYear() % 100
    if (!Number.isInteger(year) || year < currentYear) {
      return 'please_enter_valid_expiry_year'
    }

    return ''
  }

  const getReadableErrorMessage = (err, fallback) => {
    const message = String(err?.message || '').trim()

    if (!message || message.toLowerCase() === 'failed to fetch') {
      return t('unable_to_connect_try_again')
    }

    if (message.toLowerCase() === 'missing required fields') {
      return t('beneficiary_add_missing_required_fields')
    }

    return message || fallback
  }

  useEffect(() => {
    const currentBin = cardNumber.slice(0, 6)
    if (currentBin.length < 6) {
      reqIdRef.current += 1
      setBinStatus('idle')
      return
    }

    reqIdRef.current += 1
    const myReqId = reqIdRef.current
    setBinStatus('checking')

    validateCardBinForTransaction(currentBin, 'CASH_IN')
      .then((matchedBin) => {
        if (myReqId !== reqIdRef.current) return
        setBinStatus(matchedBin ? 'valid' : 'invalid')
      })
      .catch(() => {
        if (myReqId !== reqIdRef.current) return
        setBinStatus('invalid')
      })
  }, [cardNumber])

  useEffect(() => {
    if (cardNumber.length !== 16) {
      cardholderReqIdRef.current += 1
      setCardholderName('')
      setCardholderStatus('idle')
      return
    }

    cardholderReqIdRef.current += 1
    const myReqId = cardholderReqIdRef.current
    setCardholderStatus('checking')

    fetchWithRefreshToken(CARD_NUMBER_VERIFY, {
      method: 'POST',
      body: JSON.stringify({
        card_number: cardNumber,
      }),
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null)
        if (myReqId !== cardholderReqIdRef.current) return

        const inquiryData = result?.data ?? {}
        if (
          !response.ok ||
          (result?.code !== 1 && result?.success !== true) ||
          (inquiryData?.code != null && Number(inquiryData.code) !== 0)
        ) {
          throw new Error(result?.message || t('cardholder_name_not_found'))
        }

        const resolvedName =
          inquiryData.card_holder_name ||
          inquiryData.cardholder_name ||
          inquiryData.name_on_card ||
          ''

        setCardholderName(String(resolvedName).trim())
        setCardholderStatus(resolvedName ? 'resolved' : 'idle')
      })
      .catch(() => {
        if (myReqId !== cardholderReqIdRef.current) return
        setCardholderName('')
        setCardholderStatus('idle')
      })
  }, [cardNumber, t])

  const validate = () => {
    const e = {}
    if (!cardNumber) e.cardNumber = t('field_is_required', { field: t('card_number') })
    else if (!/^\d{16}$/.test(cardNumber)) e.cardNumber = t('must_be_16_digits')
    else if (binStatus === 'invalid') e.cardNumber = t('card_not_supported')

    if (!cvv) e.cvv = t('please_enter_cvv2')
    else if (cvv.length !== 3) e.cvv = t('please_enter_cvv2')

    const expiryErrorKey = getExpiryErrorKey(expiryDigits)
    if (expiryErrorKey) e.expiryDate = t(expiryErrorKey)

    setErrors(e)
    return Object.keys(e).length === 0
  }

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
    } else {
      setExpiryDate(`${raw.slice(0, 2)}/${raw.slice(2)}`)
    }

    setErrors((prev) => ({ ...prev, expiryDate: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error(t('please_fill_required_fields'))
      return
    }

    setLoading(true)
    try {
      const stan = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
      const response = await fetchWithRefreshToken(BENIFICIARY_ADD, {
        method: 'POST',
        body: JSON.stringify({
          card_number: cardNumber,
          cardholder_name: cardholderName,
          stan,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.code !== 1) {
        throw new Error(getReadableErrorMessage({ message: result?.message }, t('failed_to_add_beneficiary')))
      }
      toast.success(result?.message || t('beneficiary_added'))
      navigate('/customer/other-cards')
    } catch (err) {
      toast.error(getReadableErrorMessage(err, t('failed_to_add_beneficiary')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="min-h-full px-4 py-6 overflow-x-hidden flex flex-col items-center">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: contentCard.iconBackground }}>
              <HiCreditCard className="w-6 h-6" style={{ color: contentCard.iconColor }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: contentCard.title }}>{t('add_card_beneficiary')}</h2>
              <p className="text-sm" style={{ color: contentCard.subtitle }}>{t('add_other_bank_card_as_beneficiary')}</p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => navigate('/customer/other-cards')}>
            {t('back_to_list')}
          </Button>
        </div>

        <div
          className="w-full max-w-[520px] rounded-3xl p-5 shadow-sm overflow-hidden"
          style={{ backgroundColor: popupColors.panelBackground, border: `1px solid ${popupColors.panelBorder}` }}
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <HiExclamationTriangle className="w-6 h-6" style={{ color: popupColors.cvv.icon }} />
              <h3 className="text-lg font-semibold" style={{ color: popupColors.title }}>
                {t('add_new_card')}
              </h3>
            </div>

            <p className="text-sm mb-4" style={{ color: popupColors.subtitle }}>
              {t('add_other_bank_card_as_beneficiary')}
            </p>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  autoFocus
                  value={formattedCardNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                    setCardNumber(v)
                    setCardholderName('')
                    setErrors((prev) => ({ ...prev, cardNumber: null }))
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none"
                  style={{
                    backgroundColor: popupColors.inputBackground,
                    borderColor: errors.cardNumber ? '#dc2626' : popupColors.inputBorder,
                    color: popupColors.title,
                    outline: errors.cardNumber ? '1px solid #dc2626' : 'none',
                  }}
                />
                {errors.cardNumber && <p className="text-red-500 text-xs mt-1 px-1">{errors.cardNumber}</p>}
                {binStatus === 'checking' && <p className="text-xs mt-1 px-1" style={{ color: popupColors.subtitle }}>{t('checking_card_bin')}</p>}
                {binStatus === 'valid' && <p className="text-xs mt-1 px-1 text-[#16A34A]">{t('card_bin_supported')}</p>}
                {binStatus === 'invalid' && !errors.cardNumber && <p className="text-xs mt-1 px-1 text-[#DC2626]">{t('card_not_supported')}</p>}
                {cardholderStatus === 'checking' && <p className="text-xs mt-1 px-1" style={{ color: popupColors.subtitle }}>{t('verifying_cardholder_name')}</p>}
                {cardholderName && <p className="text-xs mt-1 px-1 text-[#16A34A]">{t('cardholder_name_label')}: {cardholderName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => {
                      setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
                      setErrors((prev) => ({ ...prev, cvv: null }))
                    }}
                    placeholder={t('cvv2')}
                    className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none"
                    style={{
                      backgroundColor: popupColors.inputBackground,
                      borderColor: errors.cvv ? '#dc2626' : popupColors.inputBorder,
                      color: popupColors.title,
                      outline: errors.cvv ? '1px solid #dc2626' : 'none',
                    }}
                  />
                  {errors.cvv && <p className="text-red-500 text-xs mt-1 px-1">{errors.cvv}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={expiryDate}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder={t('expiry_mm_yy')}
                    className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none"
                    style={{
                      backgroundColor: popupColors.inputBackground,
                      borderColor: errors.expiryDate ? '#dc2626' : popupColors.inputBorder,
                      color: popupColors.title,
                      outline: errors.expiryDate ? '1px solid #dc2626' : 'none',
                    }}
                  />
                  {errors.expiryDate && <p className="text-red-500 text-xs mt-1 px-1">{errors.expiryDate}</p>}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading} fullWidth>
                {loading ? t('submitting') : t('continue')}
              </Button>

              <button
                type="button"
                className="w-full mt-4 text-sm"
                style={{ color: popupColors.subtitle }}
                onClick={() => navigate('/customer/other-cards')}
                disabled={loading}
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  )
}

export default CardBeneficiaryAdd
