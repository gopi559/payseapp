import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoArrowBack, IoInformationCircleOutline } from 'react-icons/io5'
import { HiOutlineCreditCard } from 'react-icons/hi2'
import { FaFingerprint, FaExchangeAlt, FaClock, FaMoneyBillWave, FaDesktop, FaMobileAlt } from 'react-icons/fa'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import Button from '../../Reusable/Button'
import PAYSEY_LOGO_URL from '../../assets/PayseyPaylogoGreen.png'
import AfganCurrency from '../../assets/afgan_currency_green.svg'
import { formatPrintDateTime, openTransactionPrintWindow } from '../../utils/transactionPrint'
import { getAuthUser } from '../../services/api'

const getUserFullName = () => {
  const user = getAuthUser()
  const firstName = user?.user_kyc?.first_name || ''
  const middleName = user?.user_kyc?.middle_name || user?.user_kyc?.moddle_name || ''
  const lastName = user?.user_kyc?.last_name || ''
  return [firstName, middleName, lastName].filter(Boolean).join(' ').trim()
}

const AirtimeTransactionDetails = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('airtimeSuccess')
    if (raw) {
      try {
        setDetails(JSON.parse(raw))
      } catch (_) {
        setDetails({})
      }
    } else {
      navigate('/customer/home')
    }
  }, [navigate])

  if (!details) return null

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-'
    try {
      const date = new Date(dateTimeStr)
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }
      return date.toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', options).replace(',', ' at')
    } catch {
      return dateTimeStr
    }
  }

  const amount = details?.txn_amount != null ? Number(details.txn_amount).toFixed(2) : '0.00'
  const rrn = details?.rrn ?? ''
  const displayTxnId = details?.rrn ?? details?.txn_id ?? ''
  const txnTime = details?.txn_time ?? details?.created_at ?? ''
  const txnType = details?.txn_type ?? 'AIRTIME'
  const txnDesc = details?.txn_desc ?? details?.txn_short_desc ?? t('airtime_purchase')
  const channel = details?.channel_type ?? 'WEB'

  const fromCard = details?.from_card ?? ''
  const maskedFromCard = fromCard ? `${fromCard.slice(0, 4)} **** **** ${fromCard.slice(-4)}` : '-'
  const fromCardName = details?.from_card_name || getUserFullName() || '-'

  const toMobile = details?.to_mobile ?? '-'
  const beneficiaryName = details?.beneficiary_name ?? '-'

  const handleDownloadPdf = () => {
    openTransactionPrintWindow({
      title: `${t('transaction_details')} ${displayTxnId}`,
      pageTitle: t('transaction_details'),
      logoUrl: PAYSEY_LOGO_URL,
      popupMessage: t('please_allow_popups_to_download_pdf'),
      sections: [
        {
          title: t('transaction_details'),
          rows: [
            { label: t('transaction_id'), value: displayTxnId || '-' },
            { label: t('rrn'), value: details?.rrn ?? '-' },
            { label: t('transaction_type'), value: details?.txn_type ?? 'AIRTIME' },
            { label: t('description'), value: details?.txn_desc ?? t('airtime_purchase') },
            { label: t('date_time'), value: formatPrintDateTime(details?.txn_time, i18n.language === 'ar' ? 'ar-SA' : 'en-US') },
            { label: t('amount'), value: `${Number(details?.txn_amount ?? 0).toFixed(2)}` },
            { label: t('channel'), value: details?.channel_type ?? 'WEB' },
            { label: t('status'), value: details?.status === 1 ? t('success') : t('success') },
            { label: t('fee_amount'), value: `${Number(details?.fee_amount ?? 0).toFixed(2)}` },
            { label: t('remarks'), value: details?.remarks ?? '-' },
          ],
        },
        {
          title: t('debit_details'),
          rows: [
            { label: t('card_number'), value: maskedFromCard },
            { label: t('card_name'), value: fromCardName },
          ],
        },
        {
          title: t('credit_details'),
          rows: [
            { label: t('mobile_number'), value: toMobile },
            { label: t('beneficiary_name'), value: beneficiaryName },
          ],
        },
      ],
    })
  }

  const handleDone = () => {
    sessionStorage.removeItem('airtimeSuccess')
    navigate('/customer/home')
  }

  return (
    <MobileScreenContainer>
      <div className="bg-brand-secondary text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/customer/home')}
          className="text-white hover:opacity-80 transition-opacity"
        >
          <IoArrowBack className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1">{t('transaction_details')}</h1>
        <button className="text-white hover:opacity-80 transition-opacity">
          <IoInformationCircleOutline className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="bg-brand-secondary rounded-2xl p-6 mb-6 text-white">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl text-brand-secondary">&#10003;</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('transaction_completed')}</h2>
            <div className="mb-4 flex items-center gap-2">
              <img src={AfganCurrency} alt={t('currency')} className="h-8 w-8 object-contain" />
              <p className="text-3xl font-bold">{amount}</p>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">{t('airtime_purchase')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <IoInformationCircleOutline className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t('transaction_details')}</h3>
          </div>

          <div className="space-y-3">
            {rrn && (
              <div className="flex items-start gap-3">
                <FaFingerprint className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('rrn')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{rrn}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FaExchangeAlt className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('transaction_type')}</p>
                <p className="text-sm font-medium text-gray-800">{txnType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('description')}</p>
                <p className="text-sm font-medium text-gray-800">{txnDesc}</p>
              </div>
            </div>

            {txnTime && (
              <div className="flex items-start gap-3">
                <FaClock className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('date_time')}</p>
                  <p className="text-sm font-medium text-gray-800">{formatDateTime(txnTime)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FaMoneyBillWave className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('amount')}</p>
                <div className="flex items-center gap-2">
                  <img src={AfganCurrency} alt={t('currency')} className="w-5 h-5 object-contain" />
                  <p className="text-sm font-medium text-gray-800">{amount}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaDesktop className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('channel')}</p>
                <p className="text-sm font-medium text-gray-800">{channel}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <HiOutlineCreditCard className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t('sender_details')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiOutlineCreditCard className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('card_number')}</p>
                <p className="text-sm font-medium text-gray-800 font-mono">{maskedFromCard}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HiOutlineCreditCard className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('card_name')}</p>
                <p className="text-sm font-medium text-gray-800">{fromCardName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <FaMobileAlt className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t('receiver_details')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FaMobileAlt className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('mobile_number')}</p>
                <p className="text-sm font-medium text-gray-800">{toMobile}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('beneficiary_name')}</p>
                <p className="text-sm font-medium text-gray-800">{beneficiaryName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Button
            onClick={handleDownloadPdf}
            variant="outline"
            fullWidth
            className="border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white"
          >
            {t('download_pdf')}
          </Button>
        </div>

        <div>
          <Button onClick={handleDone} fullWidth size="md">
            {t('done')}
          </Button>
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default AirtimeTransactionDetails
