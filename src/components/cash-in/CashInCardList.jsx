import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import BankCard from '../../Reusable/BankCard'
import Button from '../../Reusable/Button'
import AmountInput from '../../Reusable/AmountInput'
import AddBeneficiaryPopup from '../../Reusable/AddBeneficiaryPopup'
import { BENIFICIARY_LIST } from '../../utils/constant'
import { getCurrentUserId } from '../../services/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import cashInService from './cashIn.service'

import CvvPopup from '../../Reusable/CvvPopup'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'

import fetchWithRefreshToken from '../../services/fetchWithRefreshToken'

import { generateStan } from '../../utils/generateStan'
import { validateCardBinForTransaction } from '../../services/binValidation.jsx'

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]

const getUserFullName = (user, fallback = '') => {
  const regInfo = user?.reg_info || user
  const userKyc = user?.user_kyc || null

  return (
    [userKyc?.first_name, userKyc?.middle_name, userKyc?.last_name].filter(Boolean).join(' ').trim() ||
    [regInfo?.first_name, regInfo?.middle_name, regInfo?.last_name].filter(Boolean).join(' ').trim() ||
    regInfo?.name ||
    fallback
  )
}

const getCardholderDisplayName = (card, fallback = '') =>
  card?.cardholder_name?.trim() ||
  card?.cardholder_nick_name?.trim() ||
  card?.name_on_card?.trim() ||
  card?.card_name?.trim() ||
  fallback

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

const CashInCardList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const walletBalance = useSelector((state) => state.wallet?.balance ?? 0)
  const user = useSelector((state) => state.auth?.user)

  const [cards, setCards] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [balanceCardIndex, setBalanceCardIndex] = useState(null)
  const [cvvData, setCvvData] = useState(null)
  const [txnMeta, setTxnMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isAddNewOpen, setIsAddNewOpen] = useState(false)
  const customerFullName = getUserFullName(user, t('user'))

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error(t('user'))

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
          (Array.isArray(data.data) ? data.data : []).map((card) =>
            hydrateValidatedCard(card, 'CASH_IN')
          )
        )
      ).filter(Boolean).map((card) => {
        const normalizedCard = {
          ...card,
          display_cardholder_name: getCardholderDisplayName(card, customerFullName),
        }

        return !card.external_inst_name
          ? { ...normalizedCard, balance: walletBalance }
          : normalizedCard
      })
      setCards(list)
    } catch (e) {
      toast.error(e.message || t('failed_to_load_cards'))
    }
  }

  const fetchInternalCardBalance = () => {
    setCards((prev) =>
      prev.map((c) =>
        !c.external_inst_name ? { ...c, balance: walletBalance } : c
      )
    )
  }

  const fetchExternalCardBalance = async (cardIndex, { cvv, expiry }) => {
    const card = cards[cardIndex]
    if (!card) return

    const { data } = await cashInService.checkCardBalance({
      card_number: card.card_number,
      cvv,
      expiry_date: expiry,
    })

    setCards((prev) =>
      prev.map((c, i) =>
        i === cardIndex ? { ...c, balance: data?.avail_bal } : c
      )
    )
  }

  const handleBalanceClick = async (cardIndex) => {
    const card = cards[cardIndex]
    if (!card) return

    const isInternalCard = !card.external_inst_name
    if (isInternalCard) {
      fetchInternalCardBalance()
      return
    }

    setBalanceCardIndex(cardIndex)
    setStep('BALANCE_CVV')
  }

  useEffect(() => {
    setCards((prev) =>
      prev.map((c) =>
        !c.external_inst_name ? { ...c, balance: walletBalance } : c
      )
    )
  }, [walletBalance])

  const handleContinue = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error(t('enter_valid_amount'))
      return
    }

    const activeCard = cards?.[activeIndex]
    if (!cards?.length || !activeCard) {
      toast.error(t('please_select_card'))
      return
    }

    try {
      if (activeCard.external_inst_name) {
        await validateCardBinForTransaction(activeCard.card_number, 'CASH_IN')
      }

      setSelectedCard({
        ...activeCard,
        display_cardholder_name: getCardholderDisplayName(activeCard, customerFullName),
      })
      setStep('CVV')
    } catch (e) {
      toast.error(e.message || t('card_not_supported'))
    }
  }

  const handleTransactionCvvConfirm = ({ cvv, expiry }) => {
    setCvvData({ cvv, expiry })
    setStep('CONFIRM')
  }

  const handleBalanceCvvConfirm = async ({ cvv, expiry }) => {
    if (balanceCardIndex === null) return

    setLoading(true)
    try {
      await fetchExternalCardBalance(balanceCardIndex, { cvv, expiry })
      setStep(null)
      setBalanceCardIndex(null)
    } catch (e) {
      toast.error(e.message || t('failed_to_fetch_balance'))
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!selectedCard || !cvvData) return

    setLoading(true)
    try {
      const stan = generateStan()

      const { data } = await cashInService.sendOtp({
        card_number: selectedCard.card_number,
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

  const handleConfirmOtp = async (otp) => {
    if (!txnMeta?.rrn || !txnMeta?.stan) {
      toast.error(t('session_expired_try_again'))
      resetFlow()
      return
    }

    setLoading(true)
    try {
      const { data } = await cashInService.confirmCardToWallet({
        card_number: selectedCard.card_number,
        txn_amount: amount,
        cvv: cvvData.cvv,
        expiry_date: cvvData.expiry,
        otp,
        rrn: txnMeta.rrn,
        stan: txnMeta.stan,
      })

      let fetchedTransaction = null
      const transactionRrn = data?.rrn ?? txnMeta?.rrn

      if (transactionRrn) {
        try {
          const { data: rrnData } = await cashInService.fetchTransactionByRrn(transactionRrn)
          fetchedTransaction = rrnData
        } catch (fetchError) {
          console.error(fetchError)
        }
      }

      sessionStorage.setItem(
        'cashInSuccess',
        JSON.stringify({
          ...(fetchedTransaction || {}),
          txn_id: data.txn_id,
          rrn: data.rrn,
          txn_amount: data.txn_amount,
          txn_time: data.txn_time,
          txn_type: 'CARD_TO_WALLET',
          txn_desc: t('card_to_wallet'),
          channel_type: 'WEB',
          status: 1,
          from_card_number: selectedCard.card_number,
          from_card_name: getCardholderDisplayName(selectedCard, customerFullName),
          to: t('wallet'),
        })
      )

      resetFlow()
      navigate('/customer/cash-in/success')
    } catch (e) {
      toast.error(e.message || t('something_went_wrong'))
    } finally {
      setLoading(false)
    }
  }

  const resetFlow = () => {
    setStep(null)
    setCvvData(null)
    setTxnMeta(null)
    setBalanceCardIndex(null)
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

  return (
    <MobileScreenContainer>
      <div className="px-4 py-4 max-w-md mx-auto">
        <div className="relative flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate('/customer/cash-in')}
            className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#357219]"
            aria-label={t('go_back')}
          >
            <IoArrowBack size={18} />
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-[#357219] pointer-events-none">
            {t('cash_in_by_card')}
          </h1>
        </div>

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
            <div key={card.id} className="snap-center shrink-0 w-full">
              <BankCard
                card={card}
                onBalance={activeIndex === index ? () => handleBalanceClick(index) : undefined}
              />
            </div>
          ))}
        </div>

        <div className="mt-2 mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsAddNewOpen(true)}
            className="text-sm font-semibold text-[#357219] cursor-pointer no-underline"
          >
            {t('add_new')}
          </button>
        </div>

        <AmountInput label={t('add_amount')} value={amount} onChange={setAmount} />

        <div className="grid grid-cols-5 gap-2 mt-4">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className="border rounded-full py-2 text-sm"
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <Button fullWidth onClick={handleContinue} disabled={!amount || Number(amount) <= 0}>
            {t('continue')}
          </Button>
        </div>
      </div>

      <CvvPopup
        open={step === 'CVV' || step === 'BALANCE_CVV'}
        loading={loading}
        onClose={handleCvvPopupClose}
        onConfirm={step === 'BALANCE_CVV' ? handleBalanceCvvConfirm : handleTransactionCvvConfirm}
      />

      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        card={selectedCard}
        amount={amount}
        fromSubValue=""
        toValue={customerFullName}
        toSubValue=""
        description={t('add_money_to_wallet')}
        showMobile={false}
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

      <AddBeneficiaryPopup
        open={isAddNewOpen}
        onClose={() => setIsAddNewOpen(false)}
        onSuccess={fetchCards}
        transactionType="CASH_IN"
      />
    </MobileScreenContainer>
  )
}

export default CashInCardList
