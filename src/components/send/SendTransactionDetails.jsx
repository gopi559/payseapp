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

function escapeHtml(str) {
  const s = String(str ?? '')
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

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

const downloadTransactionPdf = (
  details,
  senderName,
  senderMobile,
  senderAccountNumber,
  receiverName,
  receiverMobile,
  receiverAccountNumber,
  labels
) => {
  const win = window.open('', '_blank')
  if (!win) {
    alert(labels.pleaseAllowPopups)
    return
  }

  const transactionRows = [
    { label: labels.transactionId, value: details?.txn_id != null ? String(details.txn_id) : '-' },
    { label: labels.rrn, value: details?.rrn ?? '-' },
    { label: labels.transactionType, value: details?.txn_type ?? labels.walletToWallet },
    { label: labels.description, value: details?.txn_desc ?? details?.txn_short_desc ?? labels.walletToWallet },
    { label: labels.dateTime, value: formatDateTimeValue(details?.txn_time ?? details?.created_at ?? '') },
    { label: labels.amount, value: details?.amount != null ? `${Number(details.amount).toFixed(2)}` : '0.00' },
    { label: labels.channel, value: details?.channel_type ?? 'WEB' },
    { label: labels.status, value: details?.status === 1 ? labels.success : labels.success },
    { label: labels.feeAmount, value: details?.fee_amount != null ? `${Number(details.fee_amount).toFixed(2)}` : '0.00' },
    { label: labels.remarks, value: details?.remarks ?? '-' },
  ]

  const senderRows = [
    { label: labels.name, value: senderName },
    { label: labels.mobileNumber, value: senderMobile || '-' },
    { label: labels.accountNumber, value: senderAccountNumber },
  ]

  const receiverRows = [
    { label: labels.name, value: receiverName },
    { label: labels.mobileNumber, value: receiverMobile || '-' },
    { label: labels.accountNumber, value: receiverAccountNumber || '-' },
  ]

  const formatRows = (rows) =>
    rows
      .map(({ label, value }) => {
        const displayValue = value == null || value === '' ? '-' : String(value)
        return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-weight:500;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;vertical-align:top;">${escapeHtml(displayValue)}</td></tr>`
      })
      .join('')

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(labels.transaction)} ${escapeHtml(String(details?.txn_id ?? ''))}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px; }
        .header img { height: 40px; }
        h1 { font-size: 20px; margin: 0; }
        h2 { font-size: 16px; margin-top: 24px; margin-bottom: 12px; color: #374151; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${escapeHtml(labels.transactionDetails)}</h1>
        <img src="${PAYSEY_LOGO_URL}" />
      </div>

      <table><tbody>${formatRows(transactionRows)}</tbody></table>

      <h2>${escapeHtml(labels.senderDetails)}</h2>
      <table><tbody>${formatRows(senderRows)}</tbody></table>

      <h2>${escapeHtml(labels.receiverDetails)}</h2>
      <table><tbody>${formatRows(receiverRows)}</tbody></table>
    </body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
  win.onafterprint = () => win.close()
}

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
    downloadTransactionPdf(
      details,
      senderName,
      senderMobile,
      senderAccountNumber,
      receiverName,
      receiverMobile,
      receiverAccountNumber,
      {
        pleaseAllowPopups: t('please_allow_popups_to_download_pdf'),
        transaction: t('transaction'),
        transactionId: t('transaction_id'),
        rrn: t('rrn'),
        transactionType: t('transaction_type'),
        description: t('description'),
        dateTime: t('date_time'),
        amount: t('amount'),
        channel: t('channel'),
        status: t('status'),
        success: t('success'),
        feeAmount: t('fee_amount'),
        remarks: t('remarks'),
        mobileNumber: t('mobile_number_label'),
        cardNumber: t('card_number'),
        accountNumber: t('account_number'),
        name: t('name'),
        notAvailable: t('not_available'),
        transactionDetails: t('transaction_details'),
        senderDetails: t('sender_details'),
        receiverDetails: t('receiver_details'),
        walletToWallet: t('wallet_to_wallet'),
      }
    )
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
