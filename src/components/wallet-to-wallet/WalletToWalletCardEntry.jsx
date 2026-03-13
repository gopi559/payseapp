import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { IoArrowBack } from 'react-icons/io5'

import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import BankCard from '../../Reusable/BankCard'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'
import CvvPopup from '../../Reusable/CvvPopup'

import cardService from '../cards/PaysePayCards/card.service'
import cardToCardService from '../card-to-card/cardToCard.service'
import walletToCardService from '../wallet-to-card/walletToCard.service'
import walletToWalletService from './walletToWallet.service'

import { CARD_CHECK_BALANCE } from '../../utils/constant'
import fetchWithRefreshToken from '../../services/fetchWithRefreshToken'
import { formatCardNumber } from '../../utils/formatCardNumber'
import THEME_COLORS from '../../theme/colors'

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]
const normalizeExpiry = (expiry) => String(expiry).replace('/', '').trim()

const WalletToWalletCardEntry = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const walletBalance = useSelector((state) => state.wallet?.balance ?? 0)

  const [sourceCards, setSourceCards] = useState([])
  const [activeSourceIndex, setActiveSourceIndex] = useState(0)
  const [destinationCard, setDestinationCard] = useState('')
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState(null)
  const [balanceCardIndex, setBalanceCardIndex] = useState(null)
  const [loading, setLoading] = useState(false)
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [beneficiaryVerified, setBeneficiaryVerified] = useState(false)
  const [verifyingBeneficiary, setVerifyingBeneficiary] = useState(false)
  const [cardError, setCardError] = useState('')
  const verifyTimeoutRef = useRef(null)
  const contentCard = THEME_COLORS.contentCard

  const sourceCard = sourceCards[activeSourceIndex]
  const destinationCardDigits = destinationCard.replace(/\D/g, '')

  // TODO: replace with real mobile from profile/auth state
  const customerMobile = '+93123456789'

  useEffect(() => {
    fetchSourceCard()
  }, [])

  useEffect(() => {
    if (verifyTimeoutRef.current) {
      clearTimeout(verifyTimeoutRef.current)
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
  }, [destinationCardDigits, t])

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

  const handleBalanceCvvConfirm = async ({ cvv, expiry }) => {
    if (balanceCardIndex === null) return

    setLoading(true)
    try {
      await fetchSourceCardBalance(balanceCardIndex, { cvv, expiry })
      setStep(null)
      setBalanceCardIndex(null)
    } catch (e) {
      toast.error(e.message || t('failed_to_fetch_source_card_balance'))
    } finally {
      setLoading(false)
    }
  }

  const handleDestinationCardChange = (event) => {
    const onlyDigits = event.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = onlyDigits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
    setDestinationCard(formatted)
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

    if (destinationCardDigits.length !== 16) {
      toast.error(t('please_enter_valid_16_digit_card_number'))
      return
    }

    if (verifyingBeneficiary) {
      toast.error(t('please_wait_for_card_verification'))
      return
    }

    if (!beneficiaryVerified) {
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
      toast.error(e.message || t('failed_to_send_otp'))
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

      sessionStorage.setItem(
        'walletToCardSuccess',
        JSON.stringify({
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
      toast.error(e.message || t('transaction_failed'))
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

  const footer = (
      <div className="px-4 py-3 border-t border-[#E5E7EB] bg-white">
      <div className="max-w-md mx-auto">
        <Button
          fullWidth
          onClick={handleContinue}
          disabled={!amount || destinationCardDigits.length !== 16 || !beneficiaryVerified || verifyingBeneficiary}
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
              onClick={() => navigate('/customer/wallet-to-card')}
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

          <div className="mt-8">
            <Input
              label={t('card_number')}
              placeholder={t('card_number_placeholder')}
              value={destinationCard}
              onChange={handleDestinationCardChange}
              inputMode="numeric"
              maxLength={19}
            />
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
        </div>
      </div>

      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        card={sourceCard}
        amount={amount}
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
    </MobileScreenContainer>
  )
}

export default WalletToWalletCardEntry
