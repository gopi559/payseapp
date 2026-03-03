import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack, IoInformationCircleOutline } from 'react-icons/io5'
import { HiOutlineCreditCard } from 'react-icons/hi2'
import { FaFingerprint, FaExchangeAlt, FaClock, FaMoneyBillWave, FaDesktop, FaMobileAlt } from 'react-icons/fa'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import Button from '../../Reusable/Button'
import PAYSEY_LOGO_URL from '../../assets/PayseyPaylogoGreen.png'

function escapeHtml(str) {
  const s = String(str ?? '')
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const downloadTransactionPdf = (details) => {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Please allow pop-ups to download PDF.')
    return
  }

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-'
    try {
      const date = new Date(dateTimeStr)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).replace(',', ' at')
    } catch {
      return dateTimeStr
    }
  }

  const maskedFromCard = details?.from_card
    ? `${details.from_card.slice(0, 4)} **** **** ${details.from_card.slice(-4)}`
    : '-'

  const transactionRows = [
    { label: 'Transaction ID', value: details?.txn_id ?? '-' },
    { label: 'RRN', value: details?.rrn ?? '-' },
    { label: 'Transaction Type', value: details?.txn_type ?? 'AIRTIME' },
    { label: 'Description', value: details?.txn_desc ?? 'Airtime purchase' },
    { label: 'Date & Time', value: formatDateTime(details?.txn_time) },
    { label: 'Amount', value: `${Number(details?.txn_amount ?? 0).toFixed(2)}` },
    { label: 'Channel', value: details?.channel_type ?? 'WEB' },
    { label: 'Status', value: details?.status === 1 ? 'Success' : 'SUCCESS' },
    { label: 'Fee Amount', value: `${Number(details?.fee_amount ?? 0).toFixed(2)}` },
    { label: 'Remarks', value: details?.remarks ?? '-' },
  ]

  const fromCardRows = [
    { label: 'Card Number', value: maskedFromCard },
    { label: 'Card Name', value: details?.from_card_name ?? '-' },
  ]

  const toBeneficiaryRows = [
    { label: 'Mobile Number', value: details?.to_mobile ?? '-' },
    { label: 'Beneficiary Name', value: details?.beneficiary_name ?? '-' },
  ]

  const formatRows = (rows) =>
    rows
      .map(
        (r) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-weight:500;">
          ${escapeHtml(r.label)}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;">
          ${escapeHtml(r.value)}
        </td>
      </tr>
    `
      )
      .join('')

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transaction ${escapeHtml(details?.txn_id)}</title>
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
        <h1>Transaction Details</h1>
        <img src="${PAYSEY_LOGO_URL}" />
      </div>

      <table><tbody>${formatRows(transactionRows)}</tbody></table>

      <h2>From Card Details</h2>
      <table><tbody>${formatRows(fromCardRows)}</tbody></table>

      <h2>Beneficiary Details</h2>
      <table><tbody>${formatRows(toBeneficiaryRows)}</tbody></table>
    </body>
    </html>
  `)

  win.document.close()
  win.focus()
  win.print()
  win.onafterprint = () => win.close()
}

const AirtimeTransactionDetails = () => {
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
      return date.toLocaleString('en-US', options).replace(',', ' at')
    } catch {
      return dateTimeStr
    }
  }

  const amount = details?.txn_amount != null ? Number(details.txn_amount).toFixed(2) : '0.00'
  const rrn = details?.rrn ?? ''
  const txnTime = details?.txn_time ?? details?.created_at ?? ''
  const txnType = details?.txn_type ?? 'AIRTIME'
  const txnDesc = details?.txn_desc ?? details?.txn_short_desc ?? 'Airtime purchase'
  const channel = details?.channel_type ?? 'WEB'

  const fromCard = details?.from_card ?? ''
  const maskedFromCard = fromCard ? `${fromCard.slice(0, 4)} **** **** ${fromCard.slice(-4)}` : '-'
  const fromCardName = details?.from_card_name ?? '-'

  const toMobile = details?.to_mobile ?? '-'
  const beneficiaryName = details?.beneficiary_name ?? '-'

  const handleDownloadPdf = () => {
    downloadTransactionPdf(details)
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
        <h1 className="text-lg font-bold flex-1">Transaction Details</h1>
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
            <h2 className="text-2xl font-bold mb-2">Transaction Completed</h2>
            <p className="text-3xl font-bold mb-4">{amount}</p>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">Airtime Purchase</span>
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
                  <p className="text-xs text-gray-500 mb-0.5">Date & Time</p>
                  <p className="text-sm font-medium text-gray-800">{formatDateTime(txnTime)}</p>
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
              <HiOutlineCreditCard className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">From Card Details</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiOutlineCreditCard className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Card Number</p>
                <p className="text-sm font-medium text-gray-800 font-mono">{maskedFromCard}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HiOutlineCreditCard className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Card Name</p>
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
            <h3 className="text-lg font-bold text-gray-800">Beneficiary Details</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FaMobileAlt className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Mobile Number</p>
                <p className="text-sm font-medium text-gray-800">{toMobile}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Beneficiary Name</p>
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
            Download PDF
          </Button>
        </div>

        <div>
          <Button onClick={handleDone} fullWidth size="md">
            Done
          </Button>
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default AirtimeTransactionDetails
