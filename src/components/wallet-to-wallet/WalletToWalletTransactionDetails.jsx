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
import { formatCardNumber } from '../../utils/formatCardNumber'
import walletToWalletService from './walletToWallet.service'

const firstFilled = (...values) => {
  for (const value of values) {
    if (value == null) continue
    const text = String(value).trim()
    if (text && text !== '-' && text.toUpperCase() !== 'N/A') return value
  }
  return null
}

const getPrimaryEntry = (value) => (Array.isArray(value) ? value[0] ?? null : value ?? null)

const formatMaskedCardValue = (value) => {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  if (raw.includes('*') || raw.includes('X')) return raw
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 8) return raw
  return formatCardNumber(digits)
}

const getDisplayName = (entry) =>
  firstFilled(
    entry?.cardholder_name,
    entry?.name_on_card,
    entry?.card_name,
    [entry?.first_name, entry?.middle_name, entry?.last_name].filter(Boolean).join(' ').trim(),
    entry?.customer_name,
    entry?.name
  )

const getDisplayMobile = (entry) =>
  firstFilled(entry?.mobile_number, entry?.mobile_no, entry?.cust_mobile, entry?.reg_mobile, entry?.phone)

const getDisplayAccount = (entry) =>
  firstFilled(entry?.account_number, entry?.acct_number, entry?.wallet_number, entry?.account_no, entry?.user_ref)

function escapeHtml(str) {
  const s = String(str ?? '')
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const downloadTransactionPdf = (
  details,
  senderName,
  senderMobile,
  senderAccountNumber,
  receiverCardNumber,
  receiverCardName,
  receiverWalletNumber,
  labels
) => {
  const win = window.open('', '_blank')
  if (!win) {
    alert(labels.pleaseAllowPopups)
    return
  }

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-'
    try {
      const date = new Date(dateTimeStr)
      return date
        .toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        .replace(',', ' at')
    } catch {
      return dateTimeStr
    }
  }

  const transactionRows = [
    { label: labels.transactionId, value: details?.txn_id ?? '-' },
    { label: labels.rrn, value: details?.rrn ?? '-' },
    { label: labels.transactionType, value: details?.txn_type ?? labels.walletToWallet },
    { label: labels.description, value: details?.txn_desc ?? labels.walletToWallet },
    { label: labels.dateTime, value: formatDateTime(details?.txn_time) },
    { label: labels.amount, value: `${Number(details?.txn_amount ?? 0).toFixed(2)}` },
    { label: labels.channel, value: details?.channel_type ?? 'WEB' },
    { label: labels.status, value: details?.status === 1 ? labels.success : labels.success },
    { label: labels.remarks, value: details?.remarks ?? '-' },
  ]

  const senderRows = [
    { label: labels.name, value: senderName },
    { label: labels.mobileNumber, value: senderMobile },
    { label: labels.accountNumber, value: senderAccountNumber },
  ].filter((row) => firstFilled(row.value))

  const receiverRows = [
    { label: labels.cardNumber, value: receiverCardNumber },
    { label: labels.cardName, value: receiverCardName },
    { label: labels.walletNumber, value: receiverWalletNumber },
  ].filter((row) => firstFilled(row.value))

  const formatRows = (rows) =>
    rows
      .map(
        ({ label, value }) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-weight:500;">
          ${escapeHtml(label)}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;">
          ${escapeHtml(value ?? '-')}
        </td>
      </tr>
    `
      )
      .join('')

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(labels.transactionDetails)} ${escapeHtml(details?.txn_id)}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; }
        .header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          border-bottom:2px solid #e5e7eb;
          padding-bottom:12px;
          margin-bottom:20px;
        }
        img { height:40px; }
        h1 { font-size:20px; margin:0; }
        h2 { font-size:16px; margin-top:24px; color:#374151; }
        table { width:100%; border-collapse:collapse; margin-bottom:24px; }
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

const WalletToWalletTransactionDetails = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const walletId = useSelector((state) => state.wallet?.walletId)
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('walletToWalletSuccess')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setDetails(parsed)

        const rrn = parsed?.rrn
        if (!rrn) return

        walletToWalletService.fetchTransactionByRrn(rrn)
          .then(({ data }) => {
            if (!data) return
            const merged = { ...parsed, ...data }
            setDetails(merged)
            sessionStorage.setItem('walletToWalletSuccess', JSON.stringify(merged))
          })
          .catch(() => {})
      } catch {
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
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return dateTimeStr
    }
  }

  const regInfo = user?.reg_info || user
  const userKyc = user?.user_kyc || null
  const debitDetails = getPrimaryEntry(details?.debit_details)
  const creditDetails = getPrimaryEntry(details?.credit_details)

  const fallbackSenderName = userKyc?.first_name || userKyc?.last_name
    ? [userKyc.first_name, userKyc.middle_name, userKyc.last_name].filter(Boolean).join(' ')
    : regInfo?.first_name || regInfo?.name || t('user')
  const fallbackSenderMobile = regInfo?.mobile ?? regInfo?.reg_mobile ?? user?.mobile ?? ''
  const fallbackSenderAccountNumber = walletId || regInfo?.user_ref || regInfo?.acct_number || null

  const amountValue = firstFilled(details?.txn_amount, details?.amount, details?.txnAmount)
  const amount = amountValue != null ? Number(amountValue).toFixed(2) : '0.00'
  const rrn = details?.rrn ?? ''
  const txnTime = details?.txn_time ?? details?.created_at ?? ''
  const txnType = details?.txn_type ?? 'WALLET_TO_WALLET'
  const txnDesc = details?.txn_desc ?? details?.txn_short_desc ?? t('wallet_to_wallet')
  const channel = details?.channel_type ?? details?.channel ?? 'WEB'

  const senderName = firstFilled(getDisplayName(debitDetails), details?.from, fallbackSenderName)
  const senderMobile = firstFilled(getDisplayMobile(debitDetails), fallbackSenderMobile)
  const senderAccountNumber = firstFilled(getDisplayAccount(debitDetails), fallbackSenderAccountNumber)

  const receiverCardNumber = formatMaskedCardValue(
    firstFilled(details?.card_number, details?.to_card, creditDetails?.masked_card, creditDetails?.card_number, creditDetails?.card_no)
  )
  const receiverCardName = firstFilled(details?.card_name, getDisplayName(creditDetails))
  const receiverWalletNumber = firstFilled(details?.wallet_number, getDisplayAccount(creditDetails))

  const handleDownloadPdf = () => {
    downloadTransactionPdf(
      details,
      senderName,
      senderMobile,
      senderAccountNumber,
      receiverCardNumber,
      receiverCardName,
      receiverWalletNumber,
      {
        pleaseAllowPopups: t('please_allow_popups_to_download_pdf'),
        transactionId: t('transaction_id'),
        rrn: t('rrn'),
        transactionType: t('transaction_type'),
        description: t('description'),
        dateTime: t('date_time'),
        amount: t('amount'),
        channel: t('channel'),
        status: t('status'),
        success: t('success'),
        remarks: t('remarks'),
        cardNumber: t('card_number'),
        cardName: t('card_name'),
        walletNumber: t('wallet_number'),
        mobileNumber: t('mobile_number_label'),
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
    sessionStorage.removeItem('walletToWalletSuccess')
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
              <span className="text-3xl text-brand-secondary">V</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('transaction_completed')}</h2>
            <p className="text-3xl font-bold mb-4">{amount}</p>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">{t('money_sent')}</span>
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
                <p className="text-sm font-medium text-gray-800">{amount}</p>
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

            {senderAccountNumber && (
              <div className="flex items-start gap-3">
                <HiOutlineBuildingOffice className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('account_number')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{senderAccountNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <HiOutlineCreditCard className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t('receiver_details')}</h3>
          </div>

          <div className="space-y-3">
            {receiverCardNumber && (
              <div className="flex items-start gap-3">
                <HiOutlineCreditCard className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('card_number')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{receiverCardNumber}</p>
                </div>
              </div>
            )}

            {receiverCardName && (
              <div className="flex items-start gap-3">
                <HiOutlineUser className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('card_name')}</p>
                  <p className="text-sm font-medium text-gray-800">{receiverCardName}</p>
                </div>
              </div>
            )}

            {receiverWalletNumber && (
              <div className="flex items-start gap-3">
                <HiOutlineBuildingOffice className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('wallet_number')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{receiverWalletNumber}</p>
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

export default WalletToWalletTransactionDetails
