import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import KeyValueDisplay from '../../Reusable/KeyValueDisplay'
import PAYSEY_LOGO_URL from '../../assets/PayseyPaylogoGreen.png'
import THEME_COLORS from '../../theme/colors'

const formatPdfValue = (key, value, t) => {
  if (value == null || value === '') return '-'
  if (key === 'status') return value === 1 ? t('success') : value === 0 ? t('failed') : String(value)
  if (typeof value === 'object') return null
  return String(value)
}

const keyToLabel = (k) => k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const formatDetailsArrayForPdf = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return escapeHtml('-')

  const blocks = arr.map((obj) => {
    if (!obj || typeof obj !== 'object') return ''

    const rows = Object.entries(obj)
      .map(([k, v]) => {
        const val = v == null || v === '' ? '-' : String(v)
        return `
          <tr>
            <td style="padding:4px 8px;color:#6b7280;font-size:12px;">${escapeHtml(keyToLabel(k))}</td>
            <td style="padding:4px 8px;font-weight:500;">${escapeHtml(val)}</td>
          </tr>`
      })
      .join('')

    return `
      <div style="margin-bottom:10px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;"><tbody>${rows}</tbody></table>
      </div>`
  })

  return blocks.join('')
}

const downloadTransactionPdf = (row, t, labels) => {
  const win = window.open('', '_blank')
  if (!win) {
    alert(t('please_allow_popups_to_download_pdf'))
    return
  }

  const entries = Object.entries(row).filter(([key]) => Object.prototype.hasOwnProperty.call(labels, key))

  const rows = entries
    .map(([key, value]) => {
      const label = labels[key] ?? key
      const isDetailsArray =
        (key === 'debit_details' || key === 'credit_details') &&
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => item != null && typeof item === 'object')

      const displayValue = isDetailsArray
        ? formatDetailsArrayForPdf(value)
        : (() => {
            const formatted = formatPdfValue(key, value, t)
            return formatted !== null ? escapeHtml(formatted) : escapeHtml(JSON.stringify(value, null, 2))
          })()

      const cellContent = isDetailsArray
        ? displayValue
        : `<span style="white-space:pre-wrap;word-break:break-word;">${displayValue}</span>`

      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-weight:500;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;vertical-align:top;">${cellContent}</td>
        </tr>`
    })
    .join('')

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(t('transaction'))} ${escapeHtml(String(row.txn_id ?? row.id ?? ''))}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px; }
        .logo { height: 40px; }
        h1 { font-size: 20px; margin: 0; }
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${escapeHtml(t('transaction_details'))}</h1>
        <img src="${PAYSEY_LOGO_URL}" class="logo" alt="PayseyPay Logo" />
      </div>
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
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;')
}

const ViewTransactionList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const row = location.state?.row ?? null
  const contentCard = THEME_COLORS.contentCard

  const labels = {
    id: t('id'),
    txn_id: t('transaction_id'),
    rrn: t('rrn'),
    txn_type: t('transaction_type'),
    txn_short_desc: t('short_description'),
    txn_desc: t('description'),
    txn_time: t('transaction_time'),
    txn_amount: t('amount'),
    fee_amount: t('fee_amount'),
    channel_type: t('channel_type'),
    device_id: t('device_id'),
    remarks: t('remarks'),
    status: t('status'),
    debit_details: t('debit_details'),
    credit_details: t('credit_details'),
  }

  if (!row) {
    return (
      <PageContainer>
        <div className="px-4 py-6 min-h-full">
          <p style={{ color: contentCard.subtitle }}>{t('no_data_available')}</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/customer/transactions')}>
            {t('back')}
          </Button>
        </div>
      </PageContainer>
    )
  }

  const formatters = {
    status: (v) => (v === 1 ? t('success') : v === 0 ? t('failed') : String(v ?? '-')),
  }

  return (
    <PageContainer>
      <div className="min-h-full px-4 py-6 overflow-x-hidden flex flex-col">
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold" style={{ color: contentCard.title }}>{t('view_transaction')}</h2>
            <div className="flex gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => downloadTransactionPdf(row, t, labels)}>
                {t('download_pdf')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/customer/transactions')}>
                {t('back')}
              </Button>
            </div>
          </div>

          <div
            className="w-full rounded-lg shadow-sm p-6 overflow-hidden"
            style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
          >
            <KeyValueDisplay data={row} labels={labels} formatters={formatters} />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default ViewTransactionList
