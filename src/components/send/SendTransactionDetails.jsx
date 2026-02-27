import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { IoArrowBack, IoInformationCircleOutline } from 'react-icons/io5'
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineCreditCard,
  HiOutlineBuildingOffice,
} from 'react-icons/hi2'
import { FaFingerprint, FaExchangeAlt, FaClock, FaMoneyBillWave, FaDesktop } from 'react-icons/fa'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import PAYSEY_LOGO_URL from '../../assets/PayseyPaylogoGreen.png'

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

const downloadTransactionPdf = (
  details,
  senderName,
  senderMobile,
  senderAccountNumber,
  receiverName,
  receiverMobile,
  receiverAccountNumber
) => {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Please allow pop-ups to download PDF.')
    return
  }

  const transactionRows = [
    { label: 'Transaction ID', value: details?.txn_id != null ? String(details.txn_id) : '-' },
    { label: 'RRN', value: details?.rrn ?? '-' },
    { label: 'Transaction Type', value: details?.txn_type ?? 'WALLET_TO_WALLET' },
    { label: 'Description', value: details?.txn_desc ?? details?.txn_short_desc ?? 'Wallet To Wallet' },
    { label: 'Date & Time', value: formatDateTimeValue(details?.txn_time ?? details?.created_at ?? '') },
    { label: 'Amount', value: details?.amount != null ? `${Number(details.amount).toFixed(2)}` : '0.00' },
    { label: 'Channel', value: details?.channel_type ?? 'WEB' },
    { label: 'Status', value: details?.status === 1 ? 'Success' : String(details?.status ?? 'SUCCESS') },
    { label: 'Fee Amount', value: details?.fee_amount != null ? `${Number(details.fee_amount).toFixed(2)}` : '0.00' },
    { label: 'Remarks', value: details?.remarks ?? '-' },
  ]

  const senderRows = [
    { label: 'Name', value: senderName },
    { label: 'Mobile Number', value: senderMobile || '-' },
    { label: 'Card Number', value: 'NA' },
    { label: 'Account Number', value: senderAccountNumber },
  ]

  const receiverRows = [
    { label: 'Name', value: receiverName },
    { label: 'Mobile Number', value: receiverMobile || '-' },
    { label: 'Card Number', value: details?.receiver_card_number ?? 'NA' },
    { label: 'Account Number', value: receiverAccountNumber || '-' },
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
      <title>Transaction ${escapeHtml(String(details?.txn_id ?? ''))}</title>
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
        <h1>Transaction Details</h1>
        <img src="${PAYSEY_LOGO_URL}" />
      </div>

      <table><tbody>${formatRows(transactionRows)}</tbody></table>

      <h2>Sender Details</h2>
      <table><tbody>${formatRows(senderRows)}</tbody></table>

      <h2>Receiver Details</h2>
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
      : regInfo?.first_name || regInfo?.name || 'User'
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
  const txnDesc = details?.txn_desc ?? details?.txn_short_desc ?? 'Wallet To Wallet'
  const channel = details?.channel_type ?? 'WEB'

  const receiverName = details?.beneficiary_name ?? details?.beneficiary?.displayName ?? '-'
  const receiverMobile = details?.beneficiary_mobile ?? details?.beneficiary?.reg_mobile ?? '-'
  const receiverAccountNumber =
    details?.receiver_account_number ?? details?.beneficiary?.account_number ?? '-'
  const receiverCardNumber = details?.receiver_card_number ?? 'NA'

  const handleDownloadPdf = () => {
    downloadTransactionPdf(
      details,
      senderName,
      senderMobile,
      senderAccountNumber,
      receiverName,
      receiverMobile,
      receiverAccountNumber
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
    <PageContainer className="bg-white">
      <div className="bg-brand-secondary text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/customer/home')} className="text-white hover:opacity-80 transition-opacity">
          <IoArrowBack className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1">Transaction Details</h1>
        <button className="text-white hover:opacity-80 transition-opacity">
          <IoInformationCircleOutline className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="bg-brand-secondary rounded-2xl p-6 mb-6 text-white">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-2">Transaction Completed</h2>
            {isPayRequestFlow && <p className="text-sm mb-2 font-medium">Paid Request</p>}
            <p className="text-3xl font-bold mb-4">{amount}</p>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">{isPayRequestFlow ? 'Paid Request' : 'Money Sent'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <IoInformationCircleOutline className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Transaction Details</h3>
          </div>

          <div className="space-y-3">
            {rrn && (
              <div className="flex items-start gap-3">
                <FaFingerprint className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">RRN</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{rrn}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FaExchangeAlt className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Transaction Type</p>
                <p className="text-sm font-medium text-gray-800">{txnType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Description</p>
                <p className="text-sm font-medium text-gray-800">{txnDesc}</p>
              </div>
            </div>

            {txnTime && (
              <div className="flex items-start gap-3">
                <FaClock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Date and Time</p>
                  <p className="text-sm font-medium text-gray-800">{formatDateTimeValue(txnTime)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FaMoneyBillWave className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                <p className="text-sm font-medium text-gray-800">{amount}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaDesktop className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Channel</p>
                <p className="text-sm font-medium text-gray-800">{channel}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <HiOutlineUser className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Sender Details</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiOutlineUser className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <p className="text-sm font-medium text-gray-800">{senderName}</p>
              </div>
            </div>

            {senderMobile && (
              <div className="flex items-start gap-3">
                <HiOutlinePhone className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Mobile Number</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{senderMobile}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <HiOutlineCreditCard className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Card Number</p>
                <p className="text-sm font-medium text-gray-800">NA</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HiOutlineBuildingOffice className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Account Number</p>
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
            <h3 className="text-lg font-bold text-gray-800">Receiver Details</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiOutlineUser className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <p className="text-sm font-medium text-gray-800">{receiverName}</p>
              </div>
            </div>

            {receiverMobile && receiverMobile !== '-' && (
              <div className="flex items-start gap-3">
                <HiOutlinePhone className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Mobile Number</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{receiverMobile}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <HiOutlineCreditCard className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Card Number</p>
                <p className="text-sm font-medium text-gray-800">{receiverCardNumber}</p>
              </div>
            </div>

            {receiverAccountNumber && receiverAccountNumber !== '-' && (
              <div className="flex items-start gap-3">
                <HiOutlineBuildingOffice className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Account Number</p>
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
            Download PDF
          </Button>
        </div>

        <div>
          <Button onClick={handleDone} fullWidth size="md">
            Done
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default SendTransactionDetails
