import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import { IoInformationCircleOutline } from 'react-icons/io5'
import { formatCardNumber } from '../../utils/formatCardNumber'
import AfganCurrency from '../../assets/afgan_currency_green.svg'
import cashInService from './cashIn.service'

const CashInSuccess = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('cashInSuccess')
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      setDetails(parsed)

      const rrn = parsed?.rrn
      if (!rrn) return

      cashInService.fetchTransactionByRrn(rrn)
        .then(({ data }) => {
          if (!data) return
          const merged = { ...parsed, ...data }
          setDetails(merged)
          sessionStorage.setItem('cashInSuccess', JSON.stringify(merged))
        })
        .catch(() => {})
    } catch {
      setDetails(null)
    }
  }, [])

  const handleViewDetails = () => {
    navigate('/customer/cash-in/details')
  }

  if (!details) return null

  const txnId = details.txn_id ?? '-'
  const formattedFromCardNumber = details.from_card_number ? formatCardNumber(details.from_card_number) : '-'
  const fromCardholderName =
    details.from_card_name ||
    details.card_name ||
    details.display_cardholder_name ||
    '-'
  const amount = details.txn_amount ? Number(details.txn_amount).toFixed(2) : '0.00'
  const dateTime = details.txn_time
    ? new Date(details.txn_time.replace(' ', 'T')).toLocaleString(i18n.language === 'ar' ? 'ar' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '-'

  return (
    <MobileScreenContainer>
      <div className="min-h-screen flex flex-col items-center px-4 pt-10 pb-28 bg-white max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-gray-900">
          {t('transaction_successful')}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {dateTime}
        </p>

        <div className="mt-6 w-full bg-green-100 rounded-2xl px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('transaction_id')}</span>
            <span className="font-medium text-gray-900">
              {txnId}
            </span>
          </div>

          <div className="flex justify-between items-start text-sm">
            <span className="text-gray-600">{t('from')}</span>
            <div className="text-right">
              <div className="font-medium text-gray-900 font-mono">{formattedFromCardNumber}</div>
              {fromCardholderName && fromCardholderName !== '-' && (
                <div className="text-xs text-gray-600 mt-0.5">{fromCardholderName}</div>
              )}
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('to')}</span>
            <span className="font-medium text-gray-900">
              {t('wallet')}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-green-200">
            <span className="text-lg font-semibold text-gray-800">
              {t('amount')}
            </span>

            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <img
                src={AfganCurrency}
                alt="Currency"
                className="h-7 w-7"
              />
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
      </div>
    </MobileScreenContainer>
  )
}

export default CashInSuccess
