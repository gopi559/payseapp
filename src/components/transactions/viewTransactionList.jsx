import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import KeyValueDisplay from '../../Reusable/KeyValueDisplay'

const LABELS = {
  id: 'ID',
  txn_id: 'Transaction ID',
  rrn: 'RRN',
  txn_type: 'Transaction Type',
  txn_short_desc: 'Short Description',
  txn_desc: 'Description',
  txn_time: 'Transaction Time',
  txn_amount: 'Amount',
  fee_amount: 'Fee Amount',
  channel_type: 'Channel Type',
  device_id: 'Device ID',
  remarks: 'Remarks',
  status: 'Status',
  debit_details: 'Debit Details',
  credit_details: 'Credit Details',
}

const formatPdfValue = (key, value) => {
  if (value == null || value === '') return '—'
  if (key === 'status') return value === 1 ? 'Success' : value === 0 ? 'Failed' : String(value)
  if (typeof value === 'object') return null // handled separately for debit/credit details
  return String(value)
}

const keyToLabel = (k) => k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const formatDetailsArrayForPdf = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return escapeHtml('—')
  const blocks = arr.map((obj, idx) => {
    if (!obj || typeof obj !== 'object') return ''
    const rows = Object.entries(obj)
      .map(([k, v]) => {
        const val = v == null || v === '' ? '—' : String(v)
        return `<tr><td style="padding:4px 8px;color:#6b7280;font-size:12px;">${escapeHtml(keyToLabel(k))}</td><td style="padding:4px 8px;font-weight:500;">${escapeHtml(val)}</td></tr>`
      })
      .join('')
    return `<div style="margin-bottom:10px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;"><table style="width:100%;border-collapse:collapse;font-size:12px;"><tbody>${rows}</tbody></table></div>`
  })
  return blocks.join('')
}

const downloadTransactionPdf = (row) => {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Please allow pop-ups to download PDF.')
    return
  }
  const entries = Object.entries(row).filter(([key]) => Object.prototype.hasOwnProperty.call(LABELS, key))
  const rows = entries
    .map(([key, value]) => {
      const label = LABELS[key] ?? key
      const isDetailsArray =
        (key === 'debit_details' || key === 'credit_details') &&
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => item != null && typeof item === 'object')
      const displayValue = isDetailsArray
        ? formatDetailsArrayForPdf(value)
        : (() => {
            const formatted = formatPdfValue(key, value)
            return formatted !== null ? escapeHtml(formatted) : escapeHtml(JSON.stringify(value, null, 2))
          })()
      const cellContent =
        isDetailsArray ? displayValue : `<span style="white-space:pre-wrap;word-break:break-word;">${displayValue}</span>`
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-weight:500;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;vertical-align:top;">${cellContent}</td></tr>`
    })
    .join('')
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transaction ${escapeHtml(String(row.txn_id ?? row.id ?? ''))}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 20px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <h1>Transaction Details</h1>
      <table><tbody>${rows}</tbody></table>
    </body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
  win.onafterprint = () => win.close()
}

function escapeHtml(str) {
  const s = String(str ?? '')
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const ViewTransactionList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const row = location.state?.row ?? null

  if (!row) {
    return (
      <PageContainer>
        <div className="px-4 py-6 bg-gray-50 min-h-full">
          <p className="text-gray-600">No data available</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/customer/transactions')}>
            Back
          </Button>
        </div>
      </PageContainer>
    )
  }

  const formatters = {
    status: (v) => (v === 1 ? 'Success' : v === 0 ? 'Failed' : String(v ?? '—')),
  }

  return (
    <PageContainer>
      <div className="bg-gray-50 min-h-full px-4 py-6 overflow-x-hidden flex flex-col">
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-800">View Transaction</h2>
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadTransactionPdf(row)}
              >
                Download PDF
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/customer/transactions')}>
                Back
              </Button>
            </div>
          </div>
          <div className="border border-gray-200 w-full rounded-lg shadow-sm bg-white p-6 overflow-hidden">
            <KeyValueDisplay
              data={row}
              labels={LABELS}
              formatters={formatters}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default ViewTransactionList



