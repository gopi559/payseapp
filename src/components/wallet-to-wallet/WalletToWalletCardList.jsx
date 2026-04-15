import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5'

import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import BankCard from '../../Reusable/BankCard'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import AddBeneficiaryPopup from '../../Reusable/AddBeneficiaryPopup'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'
import CvvPopup from '../../Reusable/CvvPopup'

import cardService from '../cards/PaysePayCards/card.service'
import cardToCardService from '../card-to-card/cardToCard.service'
import walletToCardService from '../wallet-to-card/walletToCard.service'
import walletToWalletService from './walletToWallet.service'

import { BENIFICIARY_LIST, CARD_CHECK_BALANCE } from '../../utils/constant'
import { getCurrentUserId } from '../../services/api'
import fetchWithRefreshToken from '../../services/fetchWithRefreshToken'
import { formatCardNumber } from '../../utils/formatCardNumber'
import THEME_COLORS from '../../theme/colors'
import bankIcon from '../../assets/BankIcon.svg'

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]
const normalizeExpiry = (expiry) => String(expiry).replace('/', '').trim()

const getReadableWalletToWalletError = (message, fallback, t) => {
  const normalized = String(message || '').trim().toLowerCase()

  if (!normalized) return fallback
  if (normalized === 'No Data Found') return t('no_data_found')

  return message
}

const WalletToWalletCardList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const walletBalance = useSelector((state) => state.wallet?.balance ?? 0)

  const [sourceCards, setSourceCards] = useState([])
  const [activeSourceIndex, setActiveSourceIndex] = useState(0)
  const [destCards, setDestCards] = useState([])
  const [activeDestIndex, setActiveDestIndex] = useState(null)
  const [destinationCard, setDestinationCard] = useState('')
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState(null)
  const [balanceCardIndex, setBalanceCardIndex] = useState(null)
  const [isAddNewOpen, setIsAddNewOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [beneficiaryVerified, setBeneficiaryVerified] = useState(false)
  const [verifyingBeneficiary, setVerifyingBeneficiary] = useState(false)
  const [cardError, setCardError] = useState('')
  const verifyTimeoutRef = useRef(null)
  const contentCard = THEME_COLORS.contentCard

  const sourceCard = sourceCards[activeSourceIndex]
  const destinationCardDigits = destinationCard.replace(/\D/g, '')
  const customerMobile = '+93123456789'

  useEffect(() => {
    fetchSourceCard()
    fetchDestinationCards()
  }, [])

  useEffect(() => {
    if (verifyTimeoutRef.current) {
      clearTimeout(verifyTimeoutRef.current)
    }

    if (activeDestIndex !== null) {
      setVerifyingBeneficiary(false)
      setCardError('')
      return
    }

    if (destinationCardDigits.length !== 16) {
      setBeneficiaryName('')
      setBeneficiaryVerified(false)
      setVerifyingBeneficiary(false)
      setCardError('')
      return
    }

    verifyTimeoutRef.current = setTimeout(async () => {
      setVerifyingBeneficiary(true)
      setBeneficiaryVerified(false)
      setBeneficiaryName('')
      setCardError('')
      try {
        const { data } = await cardToCardService.verifyCard(destinationCardDigits)
        if (data?.inst_type !== 'EMI') {
          throw new Error(t('card_not_found_invalid'))
        }

        const name =
          data?.card_holder_name ||
          data?.cardholder_name ||
          data?.name_on_card ||
          t('card_verified')

        setBeneficiaryName(name)
        setBeneficiaryVerified(true)
      } catch (e) {
        setBeneficiaryName('')
        setBeneficiaryVerified(false)
        const message = e.message || t('card_not_found_invalid')
        setCardError(message)
        toast.error(message)
      } finally {
        setVerifyingBeneficiary(false)
      }
    }, 500)

    return () => {
      if (verifyTimeoutRef.current) {
        clearTimeout(verifyTimeoutRef.current)
      }
    }
  }, [activeDestIndex, destinationCardDigits, t])

  const fetchSourceCard = async () => {
    try {
      const res = await cardService.getList({ card_status: 1 })
      if (!res.data?.length) throw new Error(t('no_wallet_cards_found'))

      const mapped = res.data.map((raw) => ({
        ...raw,
        cardholder_name: raw.name_on_card,
        color_code: raw.color_code || '#0fb36c',
        balance: walletBalance,
      }))

      setSourceCards(mapped)
    } catch (e) {
      toast.error(e.message || t('failed_to_load_wallet_cards'))
    }
  }

  const fetchDestinationCards = async () => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error(t('user'))

      const res = await fetchWithRefreshToken(BENIFICIARY_LIST, {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          is_temp: 0,
          no_of_data: 50,
          page: 1,
          beneficiary_type: 1,
        }),
      })

      const json = await res.json()
      if (!res.ok || json.code !== 1) {
        throw new Error(getReadableWalletToWalletError(json?.message, t('failed_to_load_destination_cards'), t))
      }

      const emiCards = Array.isArray(json.data)
        ? json.data.filter((card) => card?.inst_type === 'EMI')
        : []

      setDestCards(emiCards)
    } catch (e) {
      toast.error(getReadableWalletToWalletError(e?.message, t('failed_to_load_destination_cards'), t))
    }
  }

  const fetchSourceCardBalance = async (cardIndex, securityData) => {
    try {
      const card = sourceCards[cardIndex]
      if (!card) return

      const isInternalCard = !card.external_inst_name
      if (!isInternalCard && !securityData) {
        setBalanceCardIndex(cardIndex)
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
        throw new Error(getReadableWalletToWalletError(json?.message, t('failed_to_fetch_source_card_balance'), t))
      }

      setSourceCards((prev) =>
        prev.map((c, i) =>
          i === cardIndex ? { ...c, balance: json.data.avail_bal } : c
        )
      )
    } catch (e) {
      toast.error(getReadableWalletToWalletError(e?.message, t('failed_to_fetch_source_card_balance'), t))
    }
  }

  const handleBalanceCvvConfirm = async ({ cvv, expiry }) => {
    if (balanceCardIndex === null) return

    setLoading(true)
    try {
      await fetchSourceCardBalance(balanceCardIndex, { cvv, expiry })
      setStep(null)
      setBalanceCardIndex(null)
    } catch (e) {
      toast.error(getReadableWalletToWalletError(e?.message, t('failed_to_fetch_source_card_balance'), t))
    } finally {
      setLoading(false)
    }
  }

  const handleDestinationCardChange = (event) => {
    const onlyDigits = event.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = onlyDigits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
    setActiveDestIndex(null)
    setDestinationCard(formatted)
  }

  const handleDestinationSelect = (card, index) => {
    const rawCardNumber = String(card?.card_number || '')
      .replace(/\D/g, '')
      .slice(0, 16)

    setActiveDestIndex(index)
    setDestinationCard(formatCardNumber(rawCardNumber))
    setBeneficiaryName(
      card?.cardholder_name?.trim() ||
        card?.cardholder_nick_name?.trim() ||
        t('card_verified')
    )
    setBeneficiaryVerified(true)
    setVerifyingBeneficiary(false)
    setCardError('')
  }

  const handleContinue = () => {
    if (!sourceCard?.card_number) {
      toast.error(t('please_select_card'))
      return
    }

    if (!amount || Number(amount) <= 0) {
      toast.error(t('enter_valid_amount'))
      return
    }

    if (activeDestIndex === null && destinationCardDigits.length !== 16) {
      toast.error(t('please_enter_valid_16_digit_card_number'))
      return
    }

    if (activeDestIndex === null && verifyingBeneficiary) {
      toast.error(t('please_wait_for_card_verification'))
      return
    }

    if (activeDestIndex === null && !beneficiaryVerified) {
      toast.error(cardError || t('card_not_found_invalid'))
      return
    }

    setStep('CONFIRM')
  }

  const handleSendOtp = async () => {
    setLoading(true)
    try {
      await walletToCardService.sendOtp({ mobile: customerMobile })
      setStep('OTP')
      toast.success(t('otp_sent'))
    } catch (e) {
      toast.error(getReadableWalletToWalletError(e?.message, t('failed_to_send_otp'), t))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOtp = async () => {
    setLoading(true)
    try {
      const res = await walletToWalletService.walletToWallet({
        from_card: sourceCard?.card_number,
        to_card: destinationCardDigits,
        txn_amount: amount,
      })

      let fetchedTransaction = null
      const transactionRrn = res?.data?.rrn

      if (transactionRrn) {
        try {
          const { data: rrnData } = await walletToWalletService.fetchTransactionByRrn(transactionRrn)
          fetchedTransaction = rrnData
        } catch (fetchError) {
          console.error(fetchError)
        }
      }

      sessionStorage.setItem(
        'walletToWalletSuccess',
        JSON.stringify({
          ...(fetchedTransaction || {}),
          txn_id: res?.data?.txn_id,
          rrn: res?.data?.rrn,
          stan: res?.data?.stan,
          txn_amount: res?.data?.txn_amount,
          wallet_number: res?.data?.wallet_number,
          from_card: sourceCard?.card_number,
          card_number: destinationCardDigits,
          card_name: beneficiaryName,
          channel_type: res?.data?.channel_type || 'WEB',
          txn_time: new Date().toISOString(),
          status: 1,
          txn_type: 'WALLET_TO_WALLET',
          txn_desc: t('wallet_to_wallet'),
          from: sourceCard?.cardholder_name,
        })
      )

      resetFlow()
      navigate('/customer/wallet-to-wallet/success')
    } catch (e) {
      toast.error(getReadableWalletToWalletError(e?.message, t('transaction_failed'), t))
    } finally {
      setLoading(false)
    }
  }

  const resetFlow = () => {
    setStep(null)
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

  useEffect(() => {
    setSourceCards((prev) =>
      prev.map((card) => ({ ...card, balance: walletBalance }))
    )
  }, [walletBalance])

  const getBankName = (card) =>
    card?.external_inst_name?.trim() || card?.inst_short_name?.trim() || t('bank')

  const getCardholderName = (card) =>
    card?.cardholder_name?.trim() || card?.cardholder_nick_name?.trim() || ''

  const footer = (
    <div className="px-4 py-3 border-t border-[#E5E7EB] bg-white">
      <div className="max-w-md mx-auto">
        <Button
          fullWidth
          onClick={handleContinue}
          disabled={
            !amount ||
            (activeDestIndex === null &&
              (destinationCardDigits.length !== 16 ||
                !beneficiaryVerified ||
                verifyingBeneficiary))
          }
        >
          {t('continue')}
        </Button>
      </div>
    </div>
  )

  return (
    <MobileScreenContainer footer={footer}>
      <div className="min-h-full flex flex-col">
        <div className="px-4 py-4 pb-6 max-w-md mx-auto w-full">
          <div className="relative flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={() => navigate('/customer/wallet-to-wallet')}
              className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#357219]"
              aria-label={t('go_back')}
            >
              <IoArrowBack size={18} />
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-[#357219] pointer-events-none">
              {t('wallet_to_wallet')}
            </h1>
          </div>

          {sourceCards.length > 0 && (
            <>
              <div className="text-sm font-medium mb-2">{t('source_wallet')}</div>
              <div
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
                onScroll={(e) => {
                  const c = e.currentTarget
                  setActiveSourceIndex(Math.round(c.scrollLeft / c.offsetWidth))
                }}
              >
                {sourceCards.map((card, index) => (
                  <div
                    key={card.id}
                    className="snap-center shrink-0 w-full"
                    onClick={() => setActiveSourceIndex(index)}
                  >
                    <BankCard
                      card={card}
                      onBalance={activeSourceIndex === index ? () => fetchSourceCardBalance(index) : undefined}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <AmountInput label={t('amount')} value={amount} onChange={setAmount} />

          <div className="grid grid-cols-5 gap-2 mt-3">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(String(quickAmount))}
                className="border rounded-full py-1 text-sm"
              >
                {quickAmount}
              </button>
            ))}
          </div>

          <div className="mt-8 mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">{t('select_destination')}</div>
            <button
              type="button"
              onClick={() => setIsAddNewOpen(true)}
              className="text-sm font-semibold text-[#357219]"
            >
              {t('add_new')}
            </button>
          </div>

          <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1 pb-1">
            {destCards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => handleDestinationSelect(card, index)}
                className={`w-full cursor-pointer rounded-2xl border px-4 py-3 ${
                  activeDestIndex === index
                    ? 'border-[#357219] bg-[#F2FBF6]'
                    : 'border-[#E5E7EB] bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#EEF2EF] flex items-center justify-center shrink-0">
                      <img src={bankIcon} alt={t('bank')} className="w-6 h-6 object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[#111827] truncate">{getBankName(card)}</p>
                      {getCardholderName(card) && (
                        <p className="text-sm text-[#111827] mt-0.5 truncate">
                          {getCardholderName(card)}
                        </p>
                      )}
                      <p className="text-sm text-[#4B5563] mt-0.5">
                        {formatCardNumber(card.card_number || card.masked_card)}
                      </p>
                    </div>
                  </div>

                  {activeDestIndex === index && (
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#E6F4E7] px-3 py-2 text-[#357219] shrink-0">
                      <IoCheckmarkCircle size={18} />
                      <span className="text-sm font-semibold">{t('selected')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {activeDestIndex === null && (
            <div className="mt-8">
              {/* <Input
                label={t('card_number')}
                placeholder={t('card_number_placeholder')}
                value={destinationCard}
                onChange={handleDestinationCardChange}
                inputMode="numeric"
                maxLength={19}
              /> */}
              {beneficiaryVerified && beneficiaryName && (
                <div
                  className="mt-2 rounded-lg px-3 py-2 text-sm"
                  style={{ border: `1px solid ${contentCard.divider}`, backgroundColor: contentCard.accentBackground }}
                >
                  <span style={{ color: contentCard.subtitle }}>{t('beneficiary_name')}: </span>
                  <span className="font-medium" style={{ color: contentCard.title }}>
                    {beneficiaryName}
                  </span>
                </div>
              )}
              {verifyingBeneficiary && (
                <div className="mt-2 text-sm" style={{ color: contentCard.subtitle }}>
                  {t('verifying_card')}
                </div>
              )}
              {cardError && !verifyingBeneficiary && (
                <div className="mt-2 text-sm text-red-600">{cardError}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        card={sourceCard}
        amount={amount}
        showMobile={false}
        to={
          destinationCardDigits ? (
            <div>
              <p className="text-brand-secondary font-medium font-mono">
                {formatCardNumber(destinationCardDigits)}
              </p>
              {beneficiaryName && (
                <p className="text-brand-secondary text-xs mt-1">{beneficiaryName}</p>
              )}
            </div>
          ) : null
        }
        description={t('wallet_to_wallet')}
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

      <CvvPopup
        open={step === 'BALANCE_CVV'}
        loading={loading}
        onClose={handleCvvPopupClose}
        onConfirm={handleBalanceCvvConfirm}
      />

      <AddBeneficiaryPopup
        open={isAddNewOpen}
        onClose={() => setIsAddNewOpen(false)}
        onSuccess={fetchDestinationCards}
        transactionType="WALLET_TO_WALLET"
      />
    </MobileScreenContainer>
  )
}

export default WalletToWalletCardList
