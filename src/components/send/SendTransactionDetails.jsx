import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { IoArrowBack, IoInformationCircleOutline } from 'react-icons/io5'
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineCreditCard,
  HiOutlineBuildingOffice,
} from 'react-icons/hi2'
import { FaFingerprint, FaExchangeAlt, FaClock, FaMoneyBillWave, FaDesktop } from 'react-icons/fa'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import Button from '../../Reusable/Button'
import PAYSEY_LOGO_URL from '../../assets/PayseyPaylogoGreen.png'
import AfganCurrency from '../../assets/afgan_currency_green.svg'
import { formatPrintDateTime, openTransactionPrintWindow } from '../../utils/transactionPrint'

const formatDateTimeValue = (dateTimeStr) => {
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
    return date.toLocaleString('en-US', options).replace(',', ' at')
  } catch {
    return dateTimeStr
  }
}

const getFullName = (person, fallback = '-') =>
  [person?.first_name, person?.middle_name, person?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim() ||
  person?.displayName ||
  person?.name ||
  fallback

const SendTransactionDetails = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const walletId = useSelector((state) => state.wallet?.walletId)
  const [details, setDetails] = useState(null)
  const [isPayRequestFlow, setIsPayRequestFlow] = useState(false)

  useEffect(() => {
    const payRaw = sessionStorage.getItem('payRequestSuccess')
    const sendRaw = sessionStorage.getItem('sendSuccess')
    const raw = payRaw || sendRaw

    if (raw) {
      try {
        setDetails(JSON.parse(raw))
        setIsPayRequestFlow(Boolean(payRaw))
      } catch (_) {
        setDetails({})
        setIsPayRequestFlow(Boolean(payRaw))
      }
    } else {
      navigate('/customer/home')
    }
  }, [navigate])

  if (!details) return null

  const regInfo = user?.reg_info || user
  const userKyc = user?.user_kyc || null
  const senderName =
    userKyc?.first_name || userKyc?.last_name
      ? [userKyc.first_name, userKyc.middle_name, userKyc.last_name].filter(Boolean).join(' ')
      : regInfo?.first_name || regInfo?.name || t('user')
  const senderMobile = regInfo?.mobile ?? regInfo?.reg_mobile ?? user?.mobile ?? ''
  const senderAccountNumber = walletId || regInfo?.user_ref || regInfo?.acct_number || '-'

  const amount = details?.amount != null ? Number(details.amount).toFixed(2) : '0.00'
  const rrn = details?.rrn ?? ''
  const txnTime = details?.txn_time ?? details?.created_at ?? ''
  const txnTypeRaw = details?.txn_type ?? 'WALLET_TO_WALLET'
  const txnType = isPayRequestFlow
    ? 'W2W'
    : txnTypeRaw === 'WALLET_TO_WALLET'
      ? 'W2W'
      : txnTypeRaw
  const txnDesc = details?.txn_desc ?? details?.txn_short_desc ?? t('wallet_to_wallet')
  const channel = details?.channel_type ?? 'WEB'

  const receiverName =
    details?.beneficiary_name ??
    getFullName(details?.beneficiary, details?.beneficiary_mobile ?? '-')
  const receiverMobile = details?.beneficiary_mobile ?? details?.beneficiary?.reg_mobile ?? '-'
  const receiverAccountNumber =
    details?.receiver_account_number ?? details?.beneficiary?.account_number ?? '-'
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
            { label: t('transaction_id'), value: details?.txn_id != null ? String(details.txn_id) : '-' },
            { label: t('rrn'), value: details?.rrn ?? '-' },
            { label: t('transaction_type'), value: details?.txn_type ?? t('wallet_to_wallet') },
            { label: t('description'), value: details?.txn_desc ?? details?.txn_short_desc ?? t('wallet_to_wallet') },
            { label: t('date_time'), value: formatPrintDateTime(details?.txn_time ?? details?.created_at ?? '', 'en-US') },
            { label: t('amount'), value: details?.amount != null ? `${Number(details.amount).toFixed(2)}` : '0.00' },
            { label: t('channel'), value: details?.channel_type ?? 'WEB' },
            { label: t('status'), value: details?.status === 1 ? t('success') : t('success') },
            { label: t('fee_amount'), value: details?.fee_amount != null ? `${Number(details.fee_amount).toFixed(2)}` : '0.00' },
            { label: t('remarks'), value: details?.remarks ?? '-' },
          ],
        },
        {
          title: t('debit_details'),
          rows: [
            { label: t('name'), value: senderName },
            { label: t('mobile_number_label'), value: senderMobile || '-' },
            { label: t('account_number'), value: senderAccountNumber },
          ],
        },
        {
          title: t('credit_details'),
          rows: [
            { label: t('name'), value: receiverName },
            { label: t('mobile_number_label'), value: receiverMobile || '-' },
            { label: t('account_number'), value: receiverAccountNumber || '-' },
          ],
        },
      ],
    })
  }

  const handleDone = () => {
    if (isPayRequestFlow) {
      sessionStorage.removeItem('payRequestSuccess')
      navigate('/customer/request-money/received')
      return
    }

    sessionStorage.removeItem('sendSuccess')
    navigate('/customer/home')
  }

  return (
    <MobileScreenContainer>
      <div className="bg-brand-secondary text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/customer/home')} className="text-white hover:opacity-80 transition-opacity">
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
            <h2 className="text-2xl font-bold mb-2">{t('transaction_completed')}</h2>
            {isPayRequestFlow && <p className="text-sm mb-2 font-medium">{t('paid_request')}</p>}
            <div className="text-3xl font-bold mb-4 flex items-center gap-2">
              <img src={AfganCurrency} alt={t('currency')} className="h-8 w-8 object-contain" />
              <span>{amount}</span>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">{isPayRequestFlow ? t('paid_request') : t('money_sent')}</span>
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
                  <p className="text-sm font-medium text-gray-800">{formatDateTimeValue(txnTime)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FaMoneyBillWave className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('amount')}</p>
                <div className="text-sm font-medium text-gray-800 flex items-center gap-1">
                  <img src={AfganCurrency} alt={t('currency')} className="w-5 h-5 object-contain" />
                  <span>{amount}</span>
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
              <HiOutlineUser className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t('sender_details')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiOutlineUser className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('name')}</p>
                <p className="text-sm font-medium text-gray-800">{senderName}</p>
              </div>
            </div>

            {senderMobile && (
              <div className="flex items-start gap-3">
                <HiOutlinePhone className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('mobile_number_label')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{senderMobile}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <HiOutlineBuildingOffice className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('account_number')}</p>
                <p className="text-sm font-medium text-gray-800 font-mono">{senderAccountNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <HiOutlineUser className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t('receiver_details')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiOutlineUser className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('name')}</p>
                <p className="text-sm font-medium text-gray-800">{receiverName}</p>
              </div>
            </div>

            {receiverMobile && receiverMobile !== '-' && (
              <div className="flex items-start gap-3">
                <HiOutlinePhone className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('mobile_number_label')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{receiverMobile}</p>
                </div>
              </div>
            )}

            {receiverAccountNumber && receiverAccountNumber !== '-' && (
              <div className="flex items-start gap-3">
                <HiOutlineBuildingOffice className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('account_number')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{receiverAccountNumber}</p>
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

export default SendTransactionDetails
