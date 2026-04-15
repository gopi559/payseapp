// src/components/card-to-card/CardToCardCardList.jsx

import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import BankCard from '../../Reusable/BankCard'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'
import AddBeneficiaryPopup from '../../Reusable/AddBeneficiaryPopup'

import CvvPopup from '../../Reusable/CvvPopup'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'

import cardToCardService from './cardToCard.service'
import { BENIFICIARY_LIST } from '../../utils/constant'
import { getCurrentUserId } from '../../services/api'
import fetchWithRefreshToken from '../../services/fetchWithRefreshToken'
import {
  validateCardBinForTransaction,
  validateTransactionCards,
} from '../../services/binValidation.jsx'
import { generateStan } from '../../utils/generateStan'
import { CARD_CHECK_BALANCE } from '../../utils/constant'
import { formatCardNumber } from '../../utils/formatCardNumber'

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]
const normalizeExpiry = (expiry) => String(expiry).replace('/', '').trim()
const CARD_TO_CARD_INST_TYPES = new Set(['Bank', 'EMI'])
const filterCardToCardCards = (cards) =>
  Array.isArray(cards)
    ? cards.filter((card) => CARD_TO_CARD_INST_TYPES.has(String(card?.inst_type || '').trim()))
    : []
const getCardholderName = (card) =>
  card?.cardholder_name?.trim() || card?.cardholder_nick_name?.trim() || 'No Name'

const hydrateValidatedCard = async (card, transactionType) => {
  if (!card) return null

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

const CardToCardCardList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const sourceScrollRef = useRef(null)
  const destScrollRef = useRef(null)
  const walletBalance = useSelector((state) => state.wallet?.balance ?? 0)

  const [sourceCards, setSourceCards] = useState([])
  const [activeSourceIndex, setActiveSourceIndex] = useState(0)
  const [destCards, setDestCards] = useState([])
  const [activeDestIndex, setActiveDestIndex] = useState(null)

  const [amount, setAmount] = useState('')

  // null | 'CVV' | 'CONFIRM' | 'OTP'
  const [step, setStep] = useState(null)

  const [selectedCard, setSelectedCard] = useState(null)
  const [balanceContext, setBalanceContext] = useState(null) // { type: 'source'|'dest', cardIndex: number }
  const [cvvData, setCvvData] = useState(null)
  const [txnMeta, setTxnMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isAddNewOpen, setIsAddNewOpen] = useState(false)

  const sourceCard = sourceCards[activeSourceIndex]
  const destCard = destCards[activeDestIndex]

  /* ---------------- FETCH CARDS ---------------- */
  useEffect(() => {
    fetchSourceCards()
    fetchDestinationCards()
  }, [])

  const fetchSourceCards = async () => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error(t('user_not_found'))

      const res = await fetchWithRefreshToken(BENIFICIARY_LIST, {
        method: 'POST',
        body: JSON.stringify({
          page: 1,
          no_of_data: 50,
          user_id: userId,
          is_temp: 0,
          beneficiary_type: 1,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.code !== 1) {
        throw new Error(data.message)
      }

      const list = (
        await Promise.all(
          filterCardToCardCards(data.data).map((card) =>
            hydrateValidatedCard(card, 'CARD_TO_CARD')
          )
        )
      ).filter(Boolean).map((card) =>
        !card.external_inst_name ? { ...card, balance: walletBalance } : card
      )
      setSourceCards(list)
    } catch (e) {
      toast.error(e.message || t('failed_to_load_source_cards'))
    }
  }

  const fetchDestinationCards = async () => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error(t('user_not_found'))

      const res = await fetchWithRefreshToken(BENIFICIARY_LIST, {
        method: 'POST',
        body: JSON.stringify({
          page: 1,
          no_of_data: 50,
          user_id: userId,
          is_temp: 0,
          beneficiary_type: 1,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.code !== 1) {
        throw new Error(data.message)
      }

      const list = (
        await Promise.all(
          filterCardToCardCards(data.data).map((card) =>
            hydrateValidatedCard(card, 'CARD_TO_CARD')
          )
        )
      ).filter(Boolean).map((card) =>
        !card.external_inst_name ? { ...card, balance: walletBalance } : card
      )
      setDestCards(list)
    } catch (e) {
      toast.error(e.message || t('failed_to_load_destination_cards'))
    }
  }

  const fetchSourceCardBalance = async (cardIndex, securityData) => {
    try {
      const card = sourceCards[cardIndex]
      if (!card) return

      const isInternalCard = !card.external_inst_name
      if (!isInternalCard && !securityData) {
        setBalanceContext({ type: 'source', cardIndex })
        setStep('BALANCE_CVV')
        return
      }

      if (isInternalCard) {
        setSourceCards((prev) =>
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

      setSourceCards((prev) =>
        prev.map((c, i) =>
          i === cardIndex ? { ...c, balance: json.data.avail_bal } : c
        )
      )
    } catch (e) {
      toast.error(e.message || t('failed_to_fetch_source_card_balance'))
    }
  }

  const fetchDestCardBalance = async (cardIndex, securityData) => {
    try {
      const card = destCards[cardIndex]
      if (!card) return

      const isInternalCard = !card.external_inst_name
      if (!isInternalCard && !securityData) {
        setBalanceContext({ type: 'dest', cardIndex })
        setStep('BALANCE_CVV')
        return
      }

      if (isInternalCard) {
        setDestCards((prev) =>
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

      setDestCards((prev) =>
        prev.map((c, i) =>
          i === cardIndex ? { ...c, balance: json.data.avail_bal } : c
        )
      )
    } catch (e) {
      toast.error(e.message || t('failed_to_fetch_destination_card_balance'))
    }
  }

  /* ---------------- STEP 1 → CVV ---------------- */
  const handleContinue = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error(t('enter_valid_amount'))
      return
    }

    if (activeDestIndex === null) {
      toast.error(t('please_select_destination_card'))
      return
    }

    const fromCard = sourceCard?.card_number
    const toCard = destCard?.card_number
    if (fromCard === toCard) {
      toast.error(t('from_and_to_card_cannot_be_same'))
      return
    }

    try {
      await validateTransactionCards({
        transactionType: 'CARD_TO_CARD',
        sourceCard: fromCard,
        destinationCard: toCard,
      })
    } catch (e) {
      toast.error(e?.message || t('card_not_supported'))
      return
    }

    setSelectedCard(sourceCard)
    setStep('CVV')
  }

  /* ---------------- STEP 2 → CONFIRM ---------------- */
  const handleCvvConfirm = ({ cvv, expiry }) => {
    setCvvData({ cvv, expiry })
    setStep('CONFIRM')
  }

  const handleBalanceCvvConfirm = async ({ cvv, expiry }) => {
    if (!balanceContext) return

    setLoading(true)
    try {
      if (balanceContext.type === 'source') {
        await fetchSourceCardBalance(balanceContext.cardIndex, { cvv, expiry })
      } else {
        await fetchDestCardBalance(balanceContext.cardIndex, { cvv, expiry })
      }
      setStep(null)
      setBalanceContext(null)
    } catch (e) {
      toast.error(e.message || t('something_went_wrong'))
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- STEP 3 → SEND OTP ---------------- */
  const handleSendOtp = async () => {
    if (!selectedCard || !cvvData) return

    setLoading(true)
    try {
      const stan = generateStan()

      const { data } = await cardToCardService.sendOtp({
        from_card: selectedCard.card_number,
        to_card: destCard.card_number,
        cvv: cvvData.cvv,
        expiry_date: cvvData.expiry,
        txn_amount: amount,
      })

      setTxnMeta({
        rrn: data?.rrn,
        stan: data?.stan ?? stan,
      })

      setStep('OTP')
      toast.success(t('otp_sent'))
    } catch (e) {
      toast.error(e.message || t('failed_to_send_otp'))
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- STEP 4 → CONFIRM OTP ---------------- */
  const handleConfirmOtp = async (otp) => {
    if (!txnMeta?.rrn || !txnMeta?.stan) {
      toast.error(t('session_expired_try_again'))
      resetFlow()
      return
    }

    setLoading(true)
    try {
      const { data } = await cardToCardService.confirmCardToCard({
        from_card: selectedCard.card_number,
        to_card: destCard.card_number,
        txn_amount: amount,
        cvv: cvvData.cvv,
        expiry_date: cvvData.expiry,
        otp,
        rrn: txnMeta.rrn,
        stan: txnMeta.stan,
      })

      sessionStorage.setItem(
        'cardToCardSuccess',
        JSON.stringify({
          // backend
          txn_id: data?.txn_id,
          rrn: data?.rrn,
          txn_amount: data?.txn_amount,
          txn_time: data?.txn_time,

          // frontend context
          txn_type: 'CARD_TO_CARD',
          txn_desc: t('card_to_card_transfer'),
          channel_type: 'WEB',
          status: 1,

          // from
          from_card: selectedCard.card_number,
          from_card_name: getCardholderName(selectedCard),

          // to
          to_card: destCard.card_number,
          to_card_name: getCardholderName(destCard),
        })
      )

      resetFlow()
      navigate('/customer/card-to-card/success')
    } catch (e) {
      toast.error(e.message || t('transaction_failed'))
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- RESET ---------------- */
  const resetFlow = () => {
    setStep(null)
    setCvvData(null)
    setTxnMeta(null)
    setBalanceContext(null)
    setLoading(false)
  }

  const handleCvvPopupClose = () => {
    if (step === 'BALANCE_CVV') {
      setStep(null)
      setBalanceContext(null)
      return
    }
    resetFlow()
  }

  useEffect(() => {
    setSourceCards((prev) =>
      prev.map((c) =>
        !c.external_inst_name ? { ...c, balance: walletBalance } : c
      )
    )
    setDestCards((prev) =>
      prev.map((c) =>
        !c.external_inst_name ? { ...c, balance: walletBalance } : c
      )
    )
  }, [walletBalance])

  return (
    <MobileScreenContainer
      footer={
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <Button
              fullWidth
              onClick={handleContinue}
              disabled={!amount || activeDestIndex === null}
            >
              {t('continue')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="min-h-full flex flex-col">
        <div className="px-4 py-4 pb-6 max-w-md mx-auto w-full">

          {/* Source Card carousel */}
          {sourceCards.length > 0 && (
            <>
              <div className="text-sm font-medium mb-2 text-brand-dark">{t('source_card')}</div>
              <div
                ref={sourceScrollRef}
                onScroll={() => {
                  const c = sourceScrollRef.current
                  if (!c) return
                  setActiveSourceIndex(Math.round(c.scrollLeft / c.offsetWidth))
                }}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
              >
                {sourceCards.map((card, index) => (
                  <div
                    key={card.id}
                    className="snap-center shrink-0 w-full"
                    onClick={() => setActiveSourceIndex(index)}
                  >
                    <BankCard
                      card={card}
                      onBalance={
                        activeSourceIndex === index
                          ? () => fetchSourceCardBalance(index)
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-2 mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setIsAddNewOpen(true)}
              className="text-sm font-semibold text-[#357219] cursor-pointer no-underline"
            >
              {t('add_new')}
            </button>
          </div>

          <AmountInput label={t('amount')} value={amount} onChange={setAmount} />

          <div className="grid grid-cols-5 gap-2 mt-3">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className="border border-brand-surfaceLight text-brand-dark rounded-full py-1 text-sm hover:bg-brand-surfaceMuted transition-colors"
              >
                {a}
              </button>
            ))}
          </div>

          {/* Destination Card carousel */}
          <div className="mt-8 mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-brand-dark">{t('select_destination_card')}</div>
          </div>
          <div
            ref={destScrollRef}
            onScroll={() => {
              const c = destScrollRef.current
              if (!c) return
              setActiveDestIndex(Math.round(c.scrollLeft / c.offsetWidth))
            }}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
          >
            {destCards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => setActiveDestIndex(index)}
                className="snap-center shrink-0 w-full cursor-pointer"
              >
                <BankCard
                  card={card}
                  onBalance={
                    activeDestIndex === index
                      ? () => fetchDestCardBalance(index)
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CVV */}
      <CvvPopup
        open={step === 'CVV' || step === 'BALANCE_CVV'}
        loading={loading}
        onClose={handleCvvPopupClose}
        onConfirm={step === 'BALANCE_CVV' ? handleBalanceCvvConfirm : handleCvvConfirm}
      />

      {/* CONFIRM */}
      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        card={selectedCard}
        amount={amount}
        showMobile={false}
        to={
          destCard ? (
            <div>
              <p className="text-brand-secondary font-medium font-mono">
                {formatCardNumber(destCard.card_number || destCard.masked_card)}
              </p>
              <p className="text-brand-secondary text-xs mt-1">{getCardholderName(destCard)}</p>
            </div>
          ) : null
        }
        description={t('card_to_card_transfer')}
        loading={loading}
        onSendOtp={handleSendOtp}
        onCancel={resetFlow}
      />


      {/* OTP */}
      <OtpPopup
        open={step === 'OTP'}
        loading={loading}
        onConfirm={handleConfirmOtp}
        onCancel={resetFlow}
      />

      <AddBeneficiaryPopup
        open={isAddNewOpen}
        onClose={() => setIsAddNewOpen(false)}
        onSuccess={() => {
          fetchSourceCards()
          fetchDestinationCards()
        }}
        transactionType="CARD_TO_CARD"
      />
    </MobileScreenContainer>
  )
}

export default CardToCardCardList
