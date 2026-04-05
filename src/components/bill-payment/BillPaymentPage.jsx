import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { IoArrowBack } from 'react-icons/io5'
import { FaSearch } from 'react-icons/fa'
import { toast } from 'react-toastify'

import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import BankCard from '../../Reusable/BankCard'
import Button from '../../Reusable/Button'
import CvvPopup from '../../Reusable/CvvPopup'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'

import { BENIFICIARY_LIST } from '../../utils/constant'
import { getCurrentUserId, getAuthUser } from '../../services/api'
import fetchWithRefreshToken from '../../services/fetchWithRefreshToken'
import { generateStan } from '../../utils/generateStan'
import billPaymentService from './billPayment.service'
import { getBillServiceName } from './billPayment.constants'
import { CARD_CHECK_BALANCE } from '../../utils/constant'

const firstFilled = (...values) => {
  for (const value of values) {
    if (value == null) continue
    const text = String(value).trim()
    if (text && text !== '-' && text.toUpperCase() !== 'N/A') return value
  }
  return null
}

const getFetchedBillAmount = (billInfo) =>
  firstFilled(
    billInfo?.txn_amount,
    billInfo?.amount,
    billInfo?.bill_amount,
    billInfo?.due_amount,
    billInfo?.total_amount,
    billInfo?.bill_amt
  )

const getBillInfoRows = (billInfo, t) => {
  if (!billInfo) return []

  const rows = [
    { label: t('service'), value: firstFilled(billInfo?.service_name, billInfo?.service, billInfo?.biller_name) },
    { label: t('account_number'), value: firstFilled(billInfo?.acc_number, billInfo?.account_number, billInfo?.account_no) },
    { label: t('mobile_number'), value: firstFilled(billInfo?.mobile_no, billInfo?.mobile_number, billInfo?.customer_mobile) },
    { label: t('name'), value: firstFilled(billInfo?.customer_name, billInfo?.name, billInfo?.consumer_name) },
    { label: t('bill_number'), value: firstFilled(billInfo?.bill_number, billInfo?.bill_no) },
    { label: t('card_number'), value: firstFilled(billInfo?.card_number, billInfo?.masked_card) },
    { label: t('card_name'), value: firstFilled(billInfo?.card_name, billInfo?.card_holder_name, billInfo?.cardholder_name) },
  ]

  return rows.filter((row) => firstFilled(row.value))
}

const getResolvedCardholderName = (cardInfo) =>
  firstFilled(
    cardInfo?.card_holder_name,
    cardInfo?.cardholder_name,
    cardInfo?.name_on_card,
    cardInfo?.card_name
  )

const getFriendlyBillPaymentError = (message, t) => {
  const normalized = String(message || '').trim().toLowerCase()

  if (!normalized) return t('bill_payment_failed')
  if (normalized.includes('txn_amount')) return t('bill_payment_missing_txn_amount')

  return message
}

const generateRrn = () => {
  const d = new Date()
  const part = [
    String(d.getFullYear()).slice(-2),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0'),
  ].join('')
  return part
}
const normalizeExpiry = (expiry) => String(expiry).replace('/', '').trim()

const resolveMobileNo = () => {
  const user = getAuthUser()
  const raw =
    user?.reg_info?.reg_mobile ??
    user?.reg_mobile ??
    user?.mobile_no ??
    ''
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return '+93'
  if (digits.startsWith('93')) return `+${digits}`
  return `+93${digits.slice(-9)}`
}

const BillPaymentPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { serviceId } = useParams()
  const scrollRef = useRef(null)
  const walletBalance = useSelector((state) => state.wallet?.balance ?? 0)

  const [cards, setCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(false)
  const [cardsError, setCardsError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const [amount, setAmount] = useState('')
  const [billNumber, setBillNumber] = useState('')
  const [mobileNo] = useState(resolveMobileNo())

  const [billInfo, setBillInfo] = useState(null)
  const [txnMeta, setTxnMeta] = useState(null)
  const [step, setStep] = useState(null)
  const [balanceCardIndex, setBalanceCardIndex] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [cvvData, setCvvData] = useState(null)
  const [loading, setLoading] = useState(false)

  const serviceName = getBillServiceName(serviceId, t)

  useEffect(() => {
    if (!serviceId) {
      navigate('/customer/bill-payment')
      return
    }
    fetchCards()
  }, [serviceId, navigate, t])

  const fetchCards = async () => {
    setCardsLoading(true)
    setCardsError('')
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
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok || Number(data?.code) !== 1) {
        throw new Error(data?.message || t('failed_to_load_cards'))
      }

      const list = (Array.isArray(data?.data) ? data.data : []).map((card) =>
        !card.external_inst_name ? { ...card, balance: walletBalance } : card
      )
      setCards(list)
      setActiveIndex(0)
      if (!list.length) setCardsError(t('no_beneficiary_cards_found_for_account'))
    } catch (e) {
      const msg = e?.message || t('failed_to_load_cards')
      setCardsError(msg)
      toast.error(msg)
    } finally {
      setCardsLoading(false)
    }
  }

  const validateBase = (silent = false) => {
    if (!cards[activeIndex]) {
      if (!silent) toast.error(t('select_source_card'))
      return false
    }
    if (!billNumber.trim()) {
      if (!silent) toast.error(t('enter_bill_number'))
      return false
    }
    return true
  }

  const fetchCardBalance = async (cardIndex, securityData) => {
    try {
      const card = cards[cardIndex]
      if (!card) return

      const isInternalCard = !card.external_inst_name
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

  const handleFetchBillDetails = async (silent = false) => {
    if (!validateBase(silent)) return

    setLoading(true)
    try {
      const selected = cards[activeIndex]
      const fallbackStan = generateStan()
      const fallbackRrn = generateRrn()

      const { data } = await billPaymentService.fetchBillInfoAndSendOtp({
        card_number: selected.card_number,
        txn_amount: '',
        bill_number: billNumber,
        service_id: serviceId,
        otp: '',
        rrn: '',
        stan: fallbackStan,
        mobile_no: mobileNo,
      })

      let enrichedBillInfo = data ?? {}
      const billCardNumber = firstFilled(data?.card_number, data?.masked_card)
      if (billCardNumber) {
        try {
          const verifiedBillCard = await billPaymentService.verifyCard(billCardNumber)
          enrichedBillInfo = {
            ...enrichedBillInfo,
            card_name: getResolvedCardholderName(verifiedBillCard?.data),
          }
        } catch (_) {}
      }

      setSelectedCard(selected)
      setBillInfo(enrichedBillInfo)
      const fetchedAmount = getFetchedBillAmount(enrichedBillInfo)
      setAmount(fetchedAmount != null ? String(fetchedAmount) : '')
      const resolvedRrn = firstFilled(enrichedBillInfo?.rrn, fallbackRrn)
      const resolvedStan = firstFilled(enrichedBillInfo?.stan, fallbackStan)
      setTxnMeta({
        rrn: String(resolvedRrn ?? fallbackRrn),
        stan: String(resolvedStan ?? fallbackStan),
      })

      toast.success(t('bill_details_fetched_otp_sent'))
    } catch (e) {
      if (!silent) {
        toast.error(getFriendlyBillPaymentError(e?.message, t) || t('failed_to_fetch_bill_details'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (!txnMeta?.rrn || !txnMeta?.stan || !selectedCard) {
      toast.error(t('fetch_bill_details_first'))
      return
    }
    setStep('CONFIRM')
  }

  const handleCvvConfirm = ({ cvv, expiry }) => {
    setCvvData({ cvv, expiry })
    setStep('OTP')
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

  const handleOpenCvv = () => {
    setStep('CVV')
  }

  const handleConfirmOtp = async (otp) => {
    if (!selectedCard || !cvvData || !txnMeta?.rrn || !txnMeta?.stan) {
      toast.error(t('session_expired_try_again'))
      resetFlow()
      return
    }

    setLoading(true)
    try {
      const { data } = await billPaymentService.payBill({
        card_number: selectedCard.card_number,
        txn_amount: String(amount),
        cvv: cvvData.cvv,
        expiry_date: cvvData.expiry,
        otp,
        rrn: txnMeta.rrn,
        service_id: serviceId,
        stan: txnMeta.stan,
        mobile_no: mobileNo,
      })

      const rrn = data?.rrn ?? txnMeta.rrn
      let fetchedTxn = null
      let fromCardName = selectedCard.cardholder_name || selectedCard.card_name || null
      let responseCardName = null

      if (rrn) {
        try {
          const fetched = await billPaymentService.fetchTransactionByRrn(rrn)
          fetchedTxn = fetched?.data ?? null
        } catch (_) {
          fetchedTxn = null
        }
      }

      try {
        const verifiedFromCard = await billPaymentService.verifyCard(selectedCard.card_number)
        fromCardName = getResolvedCardholderName(verifiedFromCard?.data) || fromCardName
      } catch (_) {}

      try {
        const responseCardNumber = data?.card_number ?? fetchedTxn?.card_number
        if (responseCardNumber) {
          const verifiedResponseCard = await billPaymentService.verifyCard(responseCardNumber)
          responseCardName = getResolvedCardholderName(verifiedResponseCard?.data)
        }
      } catch (_) {}

      sessionStorage.setItem(
        'billPaymentSuccess',
        JSON.stringify({
          ...(fetchedTxn || {}),
          txn_id: data?.txn_id,
          rrn,
          txn_amount: String(data?.txn_amount ?? amount ?? ''),
          txn_time: data?.txn_time || new Date().toISOString(),
          channel_type: data?.channel_type || 'WEB',
          status: 1,
          fee_amount: data?.fee_amount ?? 0,
          remarks: data?.remarks ?? null,
          txn_type: 'BILL_PAYMENT',
          txn_desc: t('bill_payment_for_service', { service: serviceName }),
          from_card: selectedCard.card_number,
          from_card_name: fromCardName,
          service_id: String(serviceId),
          service_name: serviceName,
          bill_number: billNumber,
          mobile_no: mobileNo,
          stan: txnMeta.stan,
          acc_number: data?.acc_number ?? null,
          resp_code: data?.resp_code ?? null,
          authcode: data?.authcode ?? null,
          avail_bal: data?.avail_bal ?? null,
          response_card_number: data?.card_number ?? null,
          response_card_name: responseCardName,
          bill_info: billInfo,
        })
      )

      resetFlow()
      navigate('/customer/bill-payment/success')
    } catch (e) {
      toast.error(getFriendlyBillPaymentError(e?.message, t) || t('bill_payment_failed'))
    } finally {
      setLoading(false)
    }
  }

  const resetFlow = () => {
    setStep(null)
    setCvvData(null)
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
    setCards((prev) =>
      prev.map((c) =>
        !c.external_inst_name ? { ...c, balance: walletBalance } : c
      )
    )
  }, [walletBalance])

  const footer = (
    <div className="px-4 py-3 border-t border-[#E5E7EB] bg-white">
      <div className="max-w-md mx-auto">
        <Button fullWidth onClick={handleContinue} disabled={!txnMeta?.rrn || !txnMeta?.stan || loading}>
          {t('continue')}
        </Button>
      </div>
    </div>
  )

  const fetchedBillRows = getBillInfoRows(billInfo, t)

  return (
    <MobileScreenContainer footer={footer}>
      <div className="min-h-full flex flex-col">
        <div className="px-4 py-4 pb-6 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/customer/bill-payment')}
            className="text-green-700 hover:opacity-80 transition-opacity"
          >
            <IoArrowBack className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold">{serviceName}</h1>
        </div>

        <p className="text-sm mb-5 text-gray-500">{t('pay_your_bill_with_your_card')}</p>

        {cardsLoading ? (
          <p className="text-sm text-gray-500 mb-4">{t('loading_cards')}</p>
        ) : cards.length === 0 ? (
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-sm text-gray-600">{cardsError || t('no_cards_available')}</p>
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

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">{t('bill_detail')}</h3>

          <div className="mt-3">
            <label className="text-sm text-gray-700">{t('bill_number')}</label>
            <input
              type="text"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              placeholder={t('enter_bill_number')}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mt-6">
            <Button fullWidth onClick={handleFetchBillDetails} disabled={loading || cards.length === 0}>
              <span className="flex items-center justify-center gap-2">
                <FaSearch className="w-4 h-4" />
                {loading ? t('fetching') : t('fetch_bill_details')}
              </span>
            </Button>
          </div>

          {txnMeta?.rrn && (
            <p className="text-xs text-green-700 mt-3">
              {t('bill_details_fetched_rrn')} <span className="font-mono">{txnMeta.rrn}</span>
            </p>
          )}

          {fetchedBillRows.length > 0 && (
            <div className="mt-4 rounded-xl border border-[#DCEFE2] bg-[#F7FCF8] p-3 space-y-2">
              <p className="text-sm font-semibold text-[#1F2937]">{t('bill_details')}</p>
              {fetchedBillRows.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-[#6B7280]">{row.label}</span>
                  <span className="text-right font-medium text-[#111827] break-all">{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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
        to={
          <div className="space-y-1">
            <p className="font-medium">{serviceName}</p>
            <p className="text-xs">{t('bill')} #{billNumber}</p>
            {fetchedBillRows.slice(0, 5).map((row) => (
              <p key={row.label} className="text-xs">
                <span className="opacity-70">{row.label}:</span> {row.value}
              </p>
            ))}
          </div>
        }
        description={t('bill_payment_for_service', { service: serviceName })}
        loading={loading}
        onSendOtp={handleOpenCvv}
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

export default BillPaymentPage
