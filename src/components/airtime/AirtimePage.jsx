import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
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
import { BENIFICIARY_LIST, CARD_CHECK_BALANCE } from '../../utils/constant'
import { getAuthUser, getCurrentUserId } from '../../services/api'
import fetchWithRefreshToken from '../../services/fetchWithRefreshToken'
import { generateStan } from '../../utils/generateStan'
import { sendService } from '../send/send.service'
import cardService from '../cards/PaysePayCards/card.service'
import { validateCardBinForTransaction } from '../../services/binValidation.jsx'

const QUICK_AMOUNTS = [10, 20, 50, 100, 200]
const normalizeExpiry = (expiry) => String(expiry).replace('/', '').trim()
const isOwnCard = (card) =>
  card?.is_own_card === true ||
  card?.card_source === 'OWN_CARD_LIST' ||
  (!card?.external_inst_name && Boolean(card?.name_on_card || card?.card_type_nature))
const toLocalAirtimeMobileNo = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('93')) {
    return digits.slice(2)
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return digits.slice(1)
  }
  return digits || String(value || '').trim()
}
const resolveCustomerOtpMobileNo = () => {
  const user = getAuthUser()
  const raw =
    user?.reg_info?.reg_mobile ??
    user?.reg_mobile ??
    user?.mobile_no ??
    ''
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('93')) return `+${digits}`
  return `+93${digits.slice(-9)}`
}

const hydrateValidatedCard = async (card, transactionType) => {
  if (!card) return null

  if (!card.external_inst_name) {
    return card
  }

  const cardNumber = card.card_number || card.masked_card || ''
  try {
    const matchedBin = await validateCardBinForTransaction(cardNumber, transactionType)
    return {
      ...card,
      external_inst_name: card.external_inst_name || matchedBin?.external_inst_name,
      inst_short_name: card.inst_short_name || matchedBin?.inst_short_name,
      inst_type: card.inst_type || matchedBin?.inst_type,
      color_code: card.color_code || matchedBin?.color_code || '#0fb36c',
      bank_logo: card.bank_logo || matchedBin?.bank_logo || null,
    }
  } catch (e) {
    return null
  }
}

const AirtimePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const walletBalance = useSelector((state) => state.wallet?.balance ?? 0)

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
  const [balanceCardIndex, setBalanceCardIndex] = useState(null)
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

      const [walletCardsRes, beneficiaryRes] = await Promise.all([
        cardService.getList({ card_status: 1 }),
        fetchWithRefreshToken(BENIFICIARY_LIST, {
          method: 'POST',
          body: JSON.stringify({
            page: 1,
            no_of_data: 50,
            user_id: userId,
            is_temp: 0,
            beneficiary_type: 1,
          }),
        }),
      ])

      const beneficiaryJson = await beneficiaryRes.json().catch(() => null)
      if (!beneficiaryRes.ok || Number(beneficiaryJson?.code) !== 1) {
        throw new Error(beneficiaryJson?.message || t('failed_to_load_cards'))
      }

      const walletCards = (Array.isArray(walletCardsRes?.data) ? walletCardsRes.data : []).map((card) => ({
        ...card,
        is_own_card: true,
        card_source: 'OWN_CARD_LIST',
        cardholder_name: card.name_on_card,
        color_code: card.color_code || '#0fb36c',
        balance: walletBalance,
      }))

      const beneficiaryCards = (
        await Promise.all(
          (Array.isArray(beneficiaryJson?.data) ? beneficiaryJson.data : []).map((card) =>
            hydrateValidatedCard(card, 'AIRTIME')
          )
        )
      ).filter(Boolean).map((card) => ({
        ...card,
        is_own_card: false,
        card_source: 'BENEFICIARY_CARD_LIST',
      }))

      const list = [...walletCards, ...beneficiaryCards]
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

  const fetchCardBalance = async (cardIndex, securityData) => {
    try {
      const card = cards[cardIndex]
      if (!card) return

      const isInternalCard = isOwnCard(card)
      if (!isInternalCard && !securityData) {
        setBalanceCardIndex(cardIndex)
        setStep('BALANCE_CVV')
        return
      }

      if (isInternalCard) {
        setCards((prev) =>
          prev.map((c, i) =>
            i === cardIndex ? { ...c, balance: walletBalance } : c
          )
        )
        return
      }

      const res = await fetchWithRefreshToken(CARD_CHECK_BALANCE, {
        method: 'POST',
        body: JSON.stringify({
          card_number: card.card_number,
          cvv: String(securityData.cvv),
          expiry_date: normalizeExpiry(securityData.expiry),
        }),
      })

      const json = await res.json()
      if (!res.ok || json.code !== 1) {
        throw new Error(json.message)
      }

      setCards((prev) =>
        prev.map((c, i) =>
          i === cardIndex ? { ...c, balance: json.data.avail_bal } : c
        )
      )
    } catch (e) {
      toast.error(e.message || t('failed_to_fetch_balance'))
    }
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
      const card = cards[activeIndex]
      setSelectedCard(card)
      setCvvData(null)
      setStep(isOwnCard(card) ? 'CONFIRM' : 'CVV')
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

  const handleBalanceCvvConfirm = async ({ cvv, expiry }) => {
    if (balanceCardIndex === null) return

    setLoading(true)
    try {
      await fetchCardBalance(balanceCardIndex, { cvv, expiry })
      setStep(null)
      setBalanceCardIndex(null)
    } catch (e) {
      toast.error(e.message || t('failed_to_fetch_balance'))
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!selectedCard) return
    const ownCardSelected = isOwnCard(selectedCard)
    if (!ownCardSelected && !cvvData) return

    setLoading(true)
    try {
      if (ownCardSelected) {
        const otpMobileNo = resolveCustomerOtpMobileNo() || mobileNo
        await sendService.generateTransactionOtp('MOBILE', otpMobileNo)
        setTxnMeta({
          otpEntityType: 'MOBILE',
          otpEntityId: otpMobileNo,
        })
        setStep('OTP')
        toast.success(t('otp_sent'))
        return
      }

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
    const ownCardSelected = isOwnCard(selectedCard)
    if (!selectedCard || (!ownCardSelected && !cvvData)) return
    if (!ownCardSelected && (!txnMeta?.rrn || !txnMeta?.stan)) {
      toast.error(t('session_expired_try_again'))
      resetFlow()
      return
    }
    if (ownCardSelected && (!txnMeta?.otpEntityType || !txnMeta?.otpEntityId)) {
      toast.error(t('session_expired_try_again'))
      resetFlow()
      return
    }

    setLoading(true)
    try {
      const mobileNumber = beneficiary?.reg_mobile || mobileNo
      if (ownCardSelected) {
        await sendService.verifyTransactionOtp(txnMeta.otpEntityType, txnMeta.otpEntityId, otp)
      }

      const { data } = ownCardSelected
        ? await airtimeService.rechargeOwnCardAirtime({
          mobile_no: toLocalAirtimeMobileNo(mobileNumber),
          txn_amount: amount,
        })
        : await airtimeService.sendAirtime({
          card_number: selectedCard.card_number,
          txn_amount: amount,
          cvv: cvvData.cvv,
          expiry_date: cvvData.expiry,
          otp,
          rrn: txnMeta.rrn,
          stan: txnMeta.stan,
          mobile_no: mobileNumber,
        })

      const beneficiaryName = [beneficiary?.first_name, beneficiary?.middle_name, beneficiary?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim()
      const rrn = data?.rrn
      let fetchedTxn = null

      if (rrn) {
        try {
          const fetched = await airtimeService.fetchTransactionByRrn(rrn)
          fetchedTxn = fetched?.data ?? null
        } catch (_) {
          fetchedTxn = null
        }
      }

      sessionStorage.setItem(
        'airtimeSuccess',
        JSON.stringify({
          ...(fetchedTxn || {}),
          txn_id: data?.txn_id ?? fetchedTxn?.txn_id ?? rrn,
          rrn,
          txn_amount: data?.txn_amount ?? data?.amount ?? fetchedTxn?.txn_amount ?? amount,
          txn_time: data?.txn_time || fetchedTxn?.txn_time || new Date().toISOString(),
          channel_type: data?.channel_type || fetchedTxn?.channel_type || 'WEB',
          status: 1,
          fee_amount: data?.fee_amount ?? fetchedTxn?.fee_amount ?? 0,
          remarks: data?.remarks ?? fetchedTxn?.remarks ?? null,
          txn_type: 'AIRTIME',
          txn_desc: t('airtime_purchase'),
          from_card: selectedCard.card_number,
          from_card_name: selectedCard.cardholder_name || selectedCard.card_name || null,
          to_mobile: data?.mobile_no || fetchedTxn?.mobile_no || mobileNumber,
          beneficiary_name: beneficiaryName || null,
          extbiller: data?.extbiller ?? null,
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
    setBalanceCardIndex(null)
    setSelectedCard(null)
    setLoading(false)
  }

  const handleCvvPopupClose = () => {
    if (step === 'BALANCE_CVV') {
      setStep(null)
      setBalanceCardIndex(null)
      return
    }
    resetFlow()
  }

  useEffect(() => {
    setCards((prev) =>
      prev.map((c) =>
        isOwnCard(c) ? { ...c, balance: walletBalance } : c
      )
    )
  }, [walletBalance])

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
                <BankCard
                  card={card}
                  onBalance={activeIndex === index ? () => fetchCardBalance(index) : undefined}
                />
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
        open={step === 'CVV' || step === 'BALANCE_CVV'}
        loading={loading}
        onClose={handleCvvPopupClose}
        onConfirm={step === 'BALANCE_CVV' ? handleBalanceCvvConfirm : handleCvvConfirm}
      />

      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        card={selectedCard}
        amount={amount}
        to={mobileNo}
        description={t('airtime_purchase')}
        showMobile={false}
        loading={loading}
        onSendOtp={handleSendOtp}
        onCancel={resetFlow}
      />

      <OtpPopup
        open={step === 'OTP'}
        loading={loading}
        length={6}
        onConfirm={handleConfirmOtp}
        onCancel={resetFlow}
      />
    </MobileScreenContainer>
  )
}

export default AirtimePage
