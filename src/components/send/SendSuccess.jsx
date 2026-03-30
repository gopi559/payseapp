import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../Reusable/PageContainer'
import { IoInformationCircleOutline } from 'react-icons/io5'
import AfganCurrency from '../../assets/afgan_currency_green.svg'

const getFullName = (person, fallback = '-') =>
  [person?.first_name, person?.middle_name, person?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim() ||
  person?.displayName ||
  person?.name ||
  fallback

const SendSuccess = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)
  const [isPayRequestFlow, setIsPayRequestFlow] = useState(false)

  useEffect(() => {
    const payRaw = sessionStorage.getItem('payRequestSuccess')
    const sendRaw = sessionStorage.getItem('sendSuccess')
    const raw = payRaw || sendRaw
    if (!raw) return

    try {
      setDetails(JSON.parse(raw))
      setIsPayRequestFlow(Boolean(payRaw))
    } catch {
      setDetails(null)
      setIsPayRequestFlow(false)
    }
  }, [])

  if (!details) return null

  const handleDone = () => {
    if (isPayRequestFlow) {
      sessionStorage.removeItem('payRequestSuccess')
      navigate('/customer/request-money/received')
      return
    }

    sessionStorage.removeItem('sendSuccess')
    navigate('/customer/send')
  }

  const handleViewDetails = () => {
    navigate('/customer/send/details')
  }

  const txnId = details?.txn_id ?? '-'
  const from = details?.sender_name ?? t('your_wallet')
  const to =
    details?.beneficiary_name ??
    getFullName(details?.beneficiary, details?.beneficiary_mobile ?? '-')
  const transactionType = isPayRequestFlow
    ? 'W2W'
    : details?.txn_type === 'WALLET_TO_WALLET'
      ? 'W2W'
      : details?.txn_type ?? '-'

  const amount = details?.amount ? Number(details.amount).toFixed(2) : '0.00'
  const dateTime = details?.txn_time
    ? new Date(details.txn_time.replace(' ', 'T')).toLocaleString(i18n.language === 'ar' ? 'ar' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : new Date().toLocaleString(i18n.language === 'ar' ? 'ar' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })

  return (
    <PageContainer>
      <div className="min-h-screen flex flex-col items-center px-4 pt-10 pb-28 bg-white max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-gray-900">{t('payment_successful')}</h1>
        {isPayRequestFlow && <p className="mt-1 text-sm font-medium text-green-600">{t('paid_request')}</p>}

        <p className="mt-1 text-sm text-gray-500">{dateTime}</p>

        <div className="mt-6 w-full bg-green-100 rounded-2xl px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('transaction_id')}</span>
            <span className="font-medium text-gray-900">{txnId}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('from')}</span>
            <span className="font-medium text-gray-900">{from}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('to')}</span>
            <span className="font-medium text-gray-900">{to}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('transaction_type')}</span>
            <span className="font-medium text-gray-900">{transactionType}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-green-200">
            <span className="text-lg font-semibold text-gray-800">{t('amount')}</span>

            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <img src={AfganCurrency} alt={t('currency')} className="h-7 w-7" />
              <span>{amount}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 w-full">
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 border-green-500 text-green-600 font-medium"
          >
            <IoInformationCircleOutline className="w-5 h-5" />
            {t('view_more')}
          </button>
        </div>

        <div className="mt-6 w-full">
          <button
            onClick={handleDone}
            className="w-full py-4 rounded-full bg-green-500 text-white font-semibold text-lg"
          >
            {t('done')}
          </button>
        </div>
      </div>
    </PageContainer>
  )
}

export default SendSuccess
