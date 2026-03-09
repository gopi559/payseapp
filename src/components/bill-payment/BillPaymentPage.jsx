import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoArrowBack } from 'react-icons/io5'
import { FaSearch } from 'react-icons/fa'
import { toast } from 'react-toastify'

import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import BankCard from '../../Reusable/BankCard'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'
import CvvPopup from '../../Reusable/CvvPopup'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'

import { BENIFICIARY_LIST } from '../../utils/constant'
import { getAuthToken, deviceId, getCurrentUserId, getAuthUser } from '../../services/api'
import { generateStan } from '../../utils/generateStan'
import billPaymentService from './billPayment.service'
import { getBillServiceName } from './billPayment.constants'

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

      const data = await res.json().catch(() => null)
      if (!res.ok || Number(data?.code) !== 1) {
        throw new Error(data?.message || t('failed_to_load_cards'))
      }

      const list = Array.isArray(data?.data) ? data.data : []
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
    if (!amount || Number(amount) <= 0) {
      if (!silent) toast.error(t('enter_valid_amount'))
      return false
    }
    return true
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
        txn_amount: String(amount),
        bill_number: billNumber,
        service_id: serviceId,
        otp: '',
        rrn: '',
        stan: fallbackStan,
        mobile_no: mobileNo,
      })

      setSelectedCard(selected)
      setBillInfo(data ?? {})
      setTxnMeta({
        rrn: String(data?.rrn ?? fallbackRrn),
        stan: String(data?.stan ?? fallbackStan),
      })

      toast.success(t('bill_details_fetched_otp_sent'))
    } catch (e) {
      if (!silent) {
        toast.error(e?.message || t('failed_to_fetch_bill_details'))
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
    setStep('CVV')
  }

  const handleCvvConfirm = ({ cvv, expiry }) => {
    setCvvData({ cvv, expiry })
    setStep('CONFIRM')
  }

  const handleOpenOtp = () => {
    setStep('OTP')
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

      sessionStorage.setItem(
        'billPaymentSuccess',
        JSON.stringify({
          txn_id: data?.txn_id,
          rrn: data?.rrn ?? txnMeta.rrn,
          txn_amount: String(data?.txn_amount ?? amount ?? ''),
          txn_time: data?.txn_time || new Date().toISOString(),
          channel_type: data?.channel_type || 'WEB',
          status: 1,
          fee_amount: data?.fee_amount ?? 0,
          remarks: data?.remarks ?? null,
          txn_type: 'BILL_PAYMENT',
          txn_desc: t('bill_payment_for_service', { service: serviceName }),
          from_card: selectedCard.card_number,
          from_card_name: selectedCard.cardholder_name || selectedCard.card_name || null,
          service_id: String(serviceId),
          service_name: serviceName,
          bill_number: billNumber,
          mobile_no: mobileNo,
          stan: txnMeta.stan,
          bill_info: billInfo,
        })
      )

      resetFlow()
      navigate('/customer/bill-payment/success')
    } catch (e) {
      toast.error(e?.message || t('bill_payment_failed'))
    } finally {
      setLoading(false)
    }
  }

  const resetFlow = () => {
    setStep(null)
    setCvvData(null)
    setLoading(false)
  }

  const footer = (
    <div className="px-4 py-3 border-t border-[#E5E7EB] bg-white">
      <div className="max-w-md mx-auto">
        <Button fullWidth onClick={handleContinue} disabled={!txnMeta?.rrn || !txnMeta?.stan || loading}>
          {t('continue')}
        </Button>
      </div>
    </div>
  )

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
                <BankCard card={card} />
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
              onBlur={() => {
                if (!txnMeta?.rrn && !loading) {
                  handleFetchBillDetails(true)
                }
              }}
              placeholder={t('enter_bill_number')}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mt-4">
            <AmountInput label={t('amount')} value={amount} onChange={setAmount} />
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
        </div>
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
        to={`${serviceName} - ${t('bill')} #${billNumber}`}
        description={t('bill_payment_for_service', { service: serviceName })}
        loading={loading}
        onSendOtp={handleOpenOtp}
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
