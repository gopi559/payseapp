import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import BankCard from '../../Reusable/BankCard'
import AmountInput from '../../Reusable/AmountInput'
import MobileInput from '../../Reusable/MobileInput'
import Button from '../../Reusable/Button'
import CvvPopup from '../../Reusable/CvvPopup'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'

import airtimeService from './airtime.service'
import { BENIFICIARY_LIST } from '../../utils/constant'
import { getAuthToken, deviceId, getCurrentUserId } from '../../services/api'
import { generateStan } from '../../utils/generateStan'
import { sendService } from '../send/send.service'

const QUICK_AMOUNTS = [10, 20, 50, 100, 200]

const AirtimePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const [cards, setCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(false)
  const [cardsError, setCardsError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [amount, setAmount] = useState('')
  const [mobileNo, setMobileNo] = useState('+93')
  const [beneficiary, setBeneficiary] = useState(null)
  const [isBeneficiaryValidating, setIsBeneficiaryValidating] = useState(false)
  const [beneficiaryError, setBeneficiaryError] = useState('')

  const [step, setStep] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [cvvData, setCvvData] = useState(null)
  const [txnMeta, setTxnMeta] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCards()
  }, [])

  useEffect(() => {
    const digits = String(mobileNo || '').replace(/\D/g, '')
    if (digits.length !== 11) {
      setBeneficiary(null)
      setBeneficiaryError('')
      setIsBeneficiaryValidating(false)
      return
    }

    let isCancelled = false
    const timer = setTimeout(async () => {
      setIsBeneficiaryValidating(true)
      setBeneficiaryError('')
      try {
        const { data } = await sendService.validateBeneficiary(mobileNo)
        if (isCancelled) return
        setBeneficiary(data)
      } catch (e) {
        if (isCancelled) return
        setBeneficiary(null)
        setBeneficiaryError(e?.message || t('beneficiary_validation_failed'))
      } finally {
        if (!isCancelled) setIsBeneficiaryValidating(false)
      }
    }, 300)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [mobileNo, t])

  const fetchCards = async () => {
    setCardsLoading(true)
    setCardsError('')
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error(t('user_not_found'))

      const res = await fetch(BENIFICIARY_LIST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
          deviceinfo: JSON.stringify({
            device_type: 'WEB',
            device_id: deviceId,
          }),
        },
        body: JSON.stringify({
          page: 1,
          no_of_data: 50,
          user_id: userId,
          is_temp: 0,
        }),
      })

      const data = await res.json()
      if (!res.ok || Number(data?.code) !== 1) {
        throw new Error(data?.message || t('failed_to_load_cards'))
      }

      const list = Array.isArray(data?.data) ? data.data : []
      setCards(list)
      setActiveIndex(0)

      if (!list.length) {
        setCardsError(t('no_beneficiary_cards_found_for_account'))
      }
    } catch (e) {
      const msg = e?.message || t('failed_to_load_cards')
      setCardsError(msg)
      toast.error(msg)
    } finally {
      setCardsLoading(false)
    }
  }

  const validateInput = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error(t('enter_valid_amount'))
      return false
    }

    const normalizedMobile = String(mobileNo || '').trim()
    const digits = normalizedMobile.replace(/\D/g, '')
    if (!normalizedMobile || digits.length !== 11) {
      toast.error(t('please_enter_valid_mobile_number'))
      return false
    }

    if (!cards[activeIndex]) {
      toast.error(t('please_select_card'))
      return false
    }

    return true
  }

  const handleContinue = async () => {
    if (!validateInput()) return

    setLoading(true)
    try {
      const mobileDigits = String(mobileNo || '').replace(/\D/g, '')
      const beneficiaryDigits = String(beneficiary?.reg_mobile || '').replace(/\D/g, '')
      let validated = beneficiary

      if (!validated || beneficiaryDigits !== mobileDigits) {
        const { data } = await sendService.validateBeneficiary(mobileNo)
        validated = data
      }

      setBeneficiary(validated)
      setSelectedCard(cards[activeIndex])
      setStep('CVV')
    } catch (e) {
      setBeneficiary(null)
      toast.error(e.message || t('validation_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleCvvConfirm = ({ cvv, expiry }) => {
    setCvvData({ cvv, expiry })
    setStep('CONFIRM')
  }

  const handleSendOtp = async () => {
    if (!selectedCard) return

    setLoading(true)
    try {
      const fallbackStan = generateStan()
      const { data } = await airtimeService.sendOtp({
        card_number: selectedCard.card_number,
        txn_amount: amount,
      })

      setTxnMeta({
        rrn: data?.rrn,
        stan: data?.stan ?? fallbackStan,
      })

      setStep('OTP')
      toast.success(t('otp_sent'))
    } catch (e) {
      toast.error(e.message || t('failed_to_send_otp'))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOtp = async (otp) => {
    if (!selectedCard || !cvvData) return
    if (!txnMeta?.rrn || !txnMeta?.stan) {
      toast.error(t('session_expired_try_again'))
      resetFlow()
      return
    }

    setLoading(true)
    try {
      const { data } = await airtimeService.sendAirtime({
        card_number: selectedCard.card_number,
        txn_amount: amount,
        cvv: cvvData.cvv,
        expiry_date: cvvData.expiry,
        otp,
        rrn: txnMeta.rrn,
        stan: txnMeta.stan,
        mobile_no: beneficiary?.reg_mobile || mobileNo,
      })

      const beneficiaryName = [beneficiary?.first_name, beneficiary?.middle_name, beneficiary?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim()

      sessionStorage.setItem(
        'airtimeSuccess',
        JSON.stringify({
          txn_id: data?.txn_id,
          rrn: data?.rrn,
          txn_amount: data?.txn_amount ?? amount,
          txn_time: data?.txn_time || new Date().toISOString(),
          channel_type: data?.channel_type || 'WEB',
          status: 1,
          fee_amount: data?.fee_amount ?? 0,
          remarks: data?.remarks ?? null,
          txn_type: 'AIRTIME',
          txn_desc: t('airtime_purchase'),
          from_card: selectedCard.card_number,
          from_card_name: selectedCard.cardholder_name || selectedCard.card_name || null,
          to_mobile: beneficiary?.reg_mobile || mobileNo,
          beneficiary_name: beneficiaryName || null,
        })
      )

      resetFlow()
      navigate('/customer/airtime/success')
    } catch (e) {
      toast.error(e.message || t('transaction_failed'))
    } finally {
      setLoading(false)
    }
  }

  const resetFlow = () => {
    setStep(null)
    setCvvData(null)
    setTxnMeta(null)
    setSelectedCard(null)
    setLoading(false)
  }

  return (
    <MobileScreenContainer>
      <div className="px-4 py-4 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-1">{t('airtime')}</h1>
        <p className="text-sm mb-5 text-gray-500">{t('buy_airtime_with_your_card')}</p>

        {cardsLoading ? (
          <p className="text-sm text-gray-500 mb-4">{t('loading_cards')}</p>
        ) : cards.length === 0 ? (
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-sm text-gray-600">
              {cardsError || t('no_cards_available')}
            </p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            onScroll={() => {
              const c = scrollRef.current
              if (!c) return
              setActiveIndex(Math.round(c.scrollLeft / c.offsetWidth))
            }}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
          >
            {cards.map((card, index) => (
              <div
                key={card.id ?? `${card.card_number}-${index}`}
                className="snap-center shrink-0 w-full"
                onClick={() => setActiveIndex(index)}
              >
                <BankCard card={card} />
              </div>
            ))}
          </div>
        )}

        <AmountInput label={t('amount')} value={amount} onChange={setAmount} />

        <div className="grid grid-cols-5 gap-2 mt-3">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className="border rounded-full py-1 text-sm"
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mt-4">
            <MobileInput
            label={t('mobile_number')}
            value={mobileNo}
            onChange={(e) => {
              setMobileNo(e.target.value)
              setBeneficiary(null)
              setBeneficiaryError('')
            }}
            placeholder={t('mobile_placeholder')}
          />
          {isBeneficiaryValidating && (
            <p className="mt-2 text-xs text-gray-500">{t('validating_beneficiary')}</p>
          )}
          {!isBeneficiaryValidating && beneficiary && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              {t('beneficiary')}: {[beneficiary?.first_name, beneficiary?.middle_name, beneficiary?.last_name]
                .filter(Boolean)
                .join(' ')
                .trim() || beneficiary?.reg_mobile}
            </p>
          )}
          {!isBeneficiaryValidating && beneficiaryError && (
            <p className="mt-2 text-xs text-red-500">{beneficiaryError}</p>
          )}
        </div>

        <div className="mt-6">
          <Button
            fullWidth
            onClick={handleContinue}
            disabled={!amount || Number(amount) <= 0 || !mobileNo || cardsLoading || cards.length === 0}
          >
            {t('continue')}
          </Button>
        </div>
      </div>

      <CvvPopup
        open={step === 'CVV'}
        loading={loading}
        onClose={resetFlow}
        onConfirm={handleCvvConfirm}
      />

      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        card={selectedCard}
        amount={amount}
        to={mobileNo}
        description={t('airtime_purchase')}
        loading={loading}
        onSendOtp={handleSendOtp}
        onCancel={resetFlow}
      />

      <OtpPopup
        open={step === 'OTP'}
        loading={loading}
        onConfirm={handleConfirmOtp}
        onCancel={resetFlow}
      />
    </MobileScreenContainer>
  )
}

export default AirtimePage
