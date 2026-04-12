import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoInformationCircleOutline } from 'react-icons/io5'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import cashInBankTransferService from './cashInBankTransfer.service'
import AfganCurrency from '../../assets/afgan_currency_green.svg'
import Button from '../../Reusable/Button'

const formatDateTime = (value, language) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString(language === 'ar' ? 'ar' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

const maskAccount = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return '-'
  return raw.length <= 4 ? raw : `.... .... .... ${raw.slice(-4)}`
}

const CashInBankTransferSuccess = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('cashInBankTransferSuccess')
      if (!raw) return

      const parsed = JSON.parse(raw)
      setDetails(parsed)

      if (!parsed?.rrn) return

      cashInBankTransferService.fetchTransactionByRrn(parsed.rrn)
        .then(({ data }) => {
          if (!data) return
          const merged = {
            ...parsed,
            ...data,
            rrn: parsed?.rrn || data?.rrn,
            txn_id: parsed?.rrn || parsed?.txn_id || data?.txn_id || data?.rrn,
          }
          setDetails(merged)
          sessionStorage.setItem('cashInBankTransferSuccess', JSON.stringify(merged))
        })
        .catch(() => {})
    } catch {
      setDetails(null)
    }
  }, [])

  if (!details) return null

  const amount = Number(details?.txn_amount ?? details?.amount ?? 0).toFixed(2)

  return (
    <MobileScreenContainer>
      <div className="min-h-screen flex flex-col items-center px-4 pt-10 pb-10 bg-white max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-[#178500] flex items-center justify-center shadow-[0_14px_30px_rgba(23,133,0,0.22)]">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-gray-900">{t('transaction_successful')}</h1>
        <p className="mt-1 text-sm text-gray-500">{formatDateTime(details?.txn_time, i18n.language)}</p>

        <div className="mt-6 w-full rounded-2xl bg-green-100 px-5 py-4">
          <div className="space-y-3">
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-600">{t('transaction_id')}</span>
              <span className="text-right font-medium text-[#111827]">{details?.rrn || details?.txn_id || '-'}</span>
            </div>

            <div className="flex justify-between items-start gap-4 text-sm">
              <span className="text-gray-600">{t('from')}</span>
              <div className="text-right">
                <div className="font-medium text-[#111827]">{details?.from_bank_name || '-'}</div>
                <div className="mt-0.5 text-xs text-gray-600">{maskAccount(details?.from_account_number)}</div>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('to')}</span>
              <span className="font-medium text-[#111827]">{t('wallet')}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-green-200">
              <span className="text-lg font-semibold text-[#111827]">{t('amount')}</span>
              <div className="flex items-center gap-2 text-2xl font-bold text-[#111827]">
                <img src={AfganCurrency} alt={t('currency')} className="h-7 w-7" />
                <span>{amount}</span>
              </div>
            </div>
          </div>
        </div>
{/* 
        <div className="mt-6 w-full">
          <button
            onClick={() => navigate('/customer/cash-in/bank-transfer/details')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 border-[#2F7D12] text-[#2F7D12] font-medium"
          >
            <IoInformationCircleOutline className="w-5 h-5" />
            {t('view_more')}
          </button>
        </div> */}

        <div className="mt-6 w-full">
          <Button
            onClick={() => {
              navigate('/customer/home')
            }}
            fullWidth
          >
            {t('done')}
          </Button>
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default CashInBankTransferSuccess
