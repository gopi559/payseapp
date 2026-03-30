import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5'

import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import BankCard from '../../Reusable/BankCard'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'
import AddBeneficiaryPopup from '../../Reusable/AddBeneficiaryPopup'

import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'

import cardService from '../cards/PaysePayCards/card.service'
import walletToCardService from './walletToCard.service'
import { BENIFICIARY_LIST } from '../../utils/constant'
import { getCurrentUserId } from '../../services/api'
import fetchWithRefreshToken from '../../services/fetchWithRefreshToken'
import bankIcon from '../../assets/BankIcon.svg'
import { formatCardNumber } from '../../utils/formatCardNumber'

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]

const firstFilled = (...values) => {
  for (const value of values) {
    if (value == null) continue
    const text = String(value).trim()
    if (text && text !== '-' && text.toUpperCase() !== 'N/A') return value
  }
  return null
}

const isMfaNotConfiguredMessage = (message) =>
  /multi\s*factor\s*authentication\s*is\s*not\s*yet\s*configured/i.test(
    String(message || '')
  )

const getExistingOtpExpiryTime = (error) => {
  const directExpiry = error?.data?.expiry_time
  if (directExpiry) return String(directExpiry)

  const message = String(error?.message || '')
  const match = message.match(/expires\s+at:\s*([0-9:\-\s]+)/i)
  return match?.[1]?.trim() || ''
}

const isOtpAlreadyGeneratedMessage = (error) =>
  /otp\s+already\s+generated/i.test(String(error?.message || ''))

const WalletToCardCardList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const walletBalance = useSelector((state) => state.wallet?.balance ?? 0)

  const [sourceCards, setSourceCards] = useState([])
  const [activeSourceIndex, setActiveSourceIndex] = useState(0)
  const [destCards, setDestCards] = useState([])
  const [activeDestIndex, setActiveDestIndex] = useState(null)
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState(null)
  const [isAddNewOpen, setIsAddNewOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const sourceCard = sourceCards[activeSourceIndex]

  // TODO: replace with real mobile from profile/auth state
  const customerMobile = '+93123456789'

  useEffect(() => {
    fetchSourceCard()
    fetchDestinationCards()
  }, [])

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

  const fetchSourceCardBalance = () => {
    setSourceCards((prev) =>
      prev.map((card) => ({
        ...card,
        balance: walletBalance,
      }))
    )
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
        throw new Error(json.message)
      }

      const bankCards = Array.isArray(json.data)
        ? json.data.filter((card) => card?.inst_type === 'Bank')
        : []

      setDestCards(bankCards)
    } catch (e) {
      toast.error(e.message || t('failed_to_load_destination_cards'))
    }
  }

  const handleContinue = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error(t('enter_valid_amount'))
      return
    }

    if (activeDestIndex === null) {
      toast.error(t('please_select_destination_card'))
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
      const expiryTime = getExistingOtpExpiryTime(e)
      const message = isOtpAlreadyGeneratedMessage(e)
        ? t('otp_already_generated_wait_until_expiry', { expiryTime })
        : isMfaNotConfiguredMessage(e?.message)
          ? t('multi_factor_authentication_not_yet_configured')
          : e?.message || t('failed_to_send_otp')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOtp = async () => {
    setLoading(true)
    try {
      const dest = destCards[activeDestIndex]

      const res = await walletToCardService.walletToCard({
        to_card: dest.card_number,
        txn_amount: amount,
        remarks: t('wallet_to_card'),
      })

      const rrn = firstFilled(res?.data?.rrn, res?.rrn)
      let fetchedTxn = null

      if (rrn) {
        try {
          const fetched = await walletToCardService.fetchTransactionByRrn(rrn)
          fetchedTxn = fetched?.data ?? null
        } catch (_) {
          fetchedTxn = null
        }
      }

      sessionStorage.setItem(
        'walletToCardSuccess',
        JSON.stringify({
          ...(fetchedTxn || {}),
          txn_id: res?.data?.txn_id,
          rrn,
          txn_amount: res?.data?.txn_amount,
          wallet_number: res?.data?.wallet_number,
          card_number: res?.data?.card_number,
          channel_type: res?.data?.channel_type || 'WEB',
          txn_time: new Date().toISOString(),
          status: 1,
          txn_type: 'WALLET_TO_CARD',
          txn_desc: t('wallet_to_card'),
          card_name: firstFilled(
            fetchedTxn?.card_name,
            fetchedTxn?.receiver_name,
            dest?.cardholder_name,
            dest?.cardholder_nick_name
          ),
          from: sourceCard?.cardholder_name,
        })
      )

      resetFlow()
      navigate('/customer/wallet-to-card/success')
    } catch (e) {
      const message = isMfaNotConfiguredMessage(e?.message)
        ? t('multi_factor_authentication_not_yet_configured')
        : e?.message || t('transaction_failed')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const resetFlow = () => {
    setStep(null)
    setLoading(false)
  }

  useEffect(() => {
    setSourceCards((prev) =>
      prev.map((card) => ({ ...card, balance: walletBalance }))
    )
    setDestCards((prev) =>
      prev.map((card) =>
        !card.external_inst_name ? { ...card, balance: walletBalance } : card
      )
    )
  }, [walletBalance])

  const dest = destCards[activeDestIndex]
  const getBankName = (card) =>
    card?.external_inst_name?.trim() || card?.inst_short_name?.trim() || t('bank')
  const getCardholderName = (card) =>
    card?.cardholder_name?.trim() || card?.cardholder_nick_name?.trim() || ''

  const footer = (
    <div className="px-4 py-3 border-t border-[#E5E7EB] bg-white">
      <div className="max-w-md mx-auto">
        <Button fullWidth onClick={handleContinue} disabled={!amount || activeDestIndex === null}>
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
              onClick={() => navigate('/customer/wallet-to-card')}
              className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#357219]"
              aria-label={t('go_back')}
            >
              <IoArrowBack size={18} />
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-[#357219] pointer-events-none">
              {t('wallet_to_card')}
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
                      onBalance={activeSourceIndex === index ? () => fetchSourceCardBalance() : undefined}
                    />
                  </div>
                ))}
              </div>
            </>
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
                onClick={() => setActiveDestIndex(index)}
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
        </div>
      </div>

      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        card={sourceCard}
        amount={amount}
        to={
          dest ? (
            <div>
              <p className="text-brand-secondary font-medium font-mono">
                {formatCardNumber(dest.card_number || dest.masked_card)}
              </p>
              {getCardholderName(dest) && (
                <p className="text-brand-secondary text-xs mt-1">{getCardholderName(dest)}</p>
              )}
            </div>
          ) : null
        }
        description={t('withdraw_to_card')}
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
        onSuccess={fetchDestinationCards}
        transactionType="CASH_OUT"
      />
    </MobileScreenContainer>
  )
}

export default WalletToCardCardList
