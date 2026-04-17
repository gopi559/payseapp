import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoArrowBack, IoInformationCircleOutline } from 'react-icons/io5'
import { HiOutlineCreditCard, HiOutlineUser } from 'react-icons/hi2'
import { FaFingerprint, FaExchangeAlt, FaClock, FaMoneyBillWave, FaDesktop, FaFileInvoice } from 'react-icons/fa'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import Button from '../../Reusable/Button'
import PAYSEY_LOGO_URL from '../../assets/PayseyPaylogoGreen.png'
import AfganCurrency from '../../assets/afgan_currency_green.svg'
import { formatCardNumber } from '../../utils/formatCardNumber'
import { formatPrintDateTime, openTransactionPrintWindow } from '../../utils/transactionPrint'
import billPaymentService from './billPayment.service'

const firstFilled = (...values) => {
  for (const value of values) {
    if (value == null) continue
    const text = String(value).trim()
    if (text && text !== '-' && text.toUpperCase() !== 'N/A') return value
  }
  return null
}

const getResolvedCardholderName = (cardInfo) =>
  firstFilled(
    cardInfo?.card_holder_name,
    cardInfo?.cardholder_name,
    cardInfo?.name_on_card,
    cardInfo?.card_name
  )

const BillPaymentTransactionDetails = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('billPaymentSuccess')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setDetails(parsed)

        const tasks = []
        if (parsed?.rrn) {
          tasks.push(
            billPaymentService.fetchTransactionByRrn(parsed.rrn).then(({ data }) => ({ type: 'txn', data })).catch(() => null)
          )
        }
        if (parsed?.from_card) {
          tasks.push(
            billPaymentService.verifyCard(parsed.from_card).then(({ data }) => ({ type: 'fromCard', data })).catch(() => null)
          )
        }
        if (parsed?.response_card_number || parsed?.card_number) {
          tasks.push(
            billPaymentService.verifyCard(parsed.response_card_number ?? parsed.card_number)
              .then(({ data }) => ({ type: 'responseCard', data }))
              .catch(() => null)
          )
        }

        Promise.all(tasks).then((results) => {
          const txnData = results.find((item) => item?.type === 'txn')?.data
          const fromCardData = results.find((item) => item?.type === 'fromCard')?.data
          const responseCardData = results.find((item) => item?.type === 'responseCard')?.data

          const merged = {
            ...parsed,
            ...(txnData || {}),
            from_card_name:
              getResolvedCardholderName(fromCardData) ||
              txnData?.from_card_name ||
              parsed?.from_card_name,
            response_card_name:
              getResolvedCardholderName(responseCardData) ||
              txnData?.response_card_name ||
              parsed?.response_card_name,
          }

          setDetails(merged)
          sessionStorage.setItem('billPaymentSuccess', JSON.stringify(merged))
        })
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
  const txnTime = details?.txn_time ?? details?.created_at ?? ''
  const txnType = details?.txn_type ?? 'BILL_PAYMENT'
  const txnDesc = details?.txn_desc ?? t('bill_payment')
  const channel = details?.channel_type ?? 'WEB'

  const fromCard = details?.from_card ?? ''
  const maskedFromCard = fromCard ? formatCardNumber(fromCard) : '-'
  const fromCardName = firstFilled(details?.from_card_name, details?.card_name)
  const serviceName = firstFilled(details?.service_name, details?.bill_info?.service_name) ?? t('bill_payment')
  const serviceId = details?.service_id ?? '-'
  const billNumber = firstFilled(details?.bill_number, details?.bill_info?.bill_number, details?.bill_info?.breshna_account_no) ?? '-'
  const customerName = firstFilled(details?.customer_name, details?.bill_info?.customer_name)
  const customerLocation = firstFilled(details?.customer_location, details?.bill_info?.customer_location)
  const billDueDate = firstFilled(details?.bill_due_date, details?.bill_info?.bill_due_date)
  const mobileNo = firstFilled(details?.mobile_no, details?.bill_info?.mobile_no, details?.bill_info?.mobile_number)
  const accountNumber = firstFilled(
    details?.acc_number,
    details?.breshna_account,
    details?.bill_info?.breshna_account_no,
    details?.bill_info?.breshna_account,
    details?.bill_info?.bill_number
  ) ?? '-'
  const responseCardNumber = firstFilled(details?.response_card_number, details?.card_number)
  const maskedResponseCardNumber = responseCardNumber ? formatCardNumber(responseCardNumber) : '-'
  const responseCardName = firstFilled(details?.response_card_name)

  const handleDownloadPdf = () => {
    openTransactionPrintWindow({
      title: `${t('transaction_details')} ${details?.txn_id ?? ''}`,
      pageTitle: t('transaction_details'),
      logoUrl: PAYSEY_LOGO_URL,
      popupMessage: t('please_allow_popups_to_download_pdf'),
      sections: [
        {
          title: t('transaction_details'),
          rows: [
            { label: t('transaction_id'), value: details?.txn_id ?? '-' },
            { label: t('rrn'), value: details?.rrn ?? '-' },
            { label: t('transaction_type'), value: details?.txn_type ?? 'BILL_PAYMENT' },
            { label: t('description'), value: details?.txn_desc ?? t('bill_payment') },
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
            { label: t('card_number'), value: details?.from_card ? formatCardNumber(details.from_card) : '-' },
            { label: t('card_name'), value: details?.from_card_name ?? '-' },
          ],
        },
        {
          title: t('credit_details'),
          rows: [
            { label: t('service'), value: serviceName },
            { label: t('service_id'), value: details?.service_id ?? '-' },
            { label: t('bill_number'), value: billNumber },
            { label: t('name'), value: customerName ?? '-' },
            { label: t('location'), value: customerLocation ?? '-' },
            { label: t('bill_due_date'), value: billDueDate ?? '-' },
            { label: t('mobile_number'), value: mobileNo ?? '-' },
            { label: t('account_number'), value: accountNumber },
            { label: t('card_number'), value: details?.response_card_number ? formatCardNumber(details.response_card_number) : details?.from_card ? formatCardNumber(details.from_card) : '-' },
            { label: t('card_name'), value: details?.response_card_name ?? '-' },
            { label: t('rrn'), value: details?.rrn ?? '-' },
          ],
        },
      ],
    })
  }

  const handleDone = () => {
    sessionStorage.removeItem('billPaymentSuccess')
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
              <span className="text-sm font-medium">{serviceName}</span>
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
              <HiOutlineUser className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('card_name')}</p>
                <p className="text-sm font-medium text-gray-800">{fromCardName ?? '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <FaFileInvoice className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t('receiver_details')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FaFileInvoice className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('bill_number')}</p>
                <p className="text-sm font-medium text-gray-800">{billNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaFileInvoice className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('service')}</p>
                <p className="text-sm font-medium text-gray-800">{serviceName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('service_id')}</p>
                <p className="text-sm font-medium text-gray-800">{serviceId}</p>
              </div>
            </div>

            {customerName && (
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('name')}</p>
                  <p className="text-sm font-medium text-gray-800">{customerName}</p>
                </div>
              </div>
            )}

            {customerLocation && (
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('location')}</p>
                  <p className="text-sm font-medium text-gray-800">{customerLocation}</p>
                </div>
              </div>
            )}

            {billDueDate && (
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('bill_due_date')}</p>
                  <p className="text-sm font-medium text-gray-800">{billDueDate}</p>
                </div>
              </div>
            )}

            {mobileNo && (
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('mobile_number')}</p>
                  <p className="text-sm font-medium text-gray-800">{mobileNo}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('account_number')}</p>
                <p className="text-sm font-medium text-gray-800 font-mono">{accountNumber}</p>
              </div>
            </div>

            {responseCardNumber && (
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('card_number')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{maskedResponseCardNumber}</p>
                </div>
              </div>
            )}

            {responseCardName && (
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('card_name')}</p>
                  <p className="text-sm font-medium text-gray-800">{responseCardName}</p>
                </div>
              </div>
            )}

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

export default BillPaymentTransactionDetails
