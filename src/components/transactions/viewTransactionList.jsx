import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import KeyValueDisplay from '../../Reusable/KeyValueDisplay'
import PAYSEY_LOGO_URL from '../../assets/PayseyPaylogoGreen.png'
import THEME_COLORS from '../../theme/colors'
import { openTransactionPrintWindow } from '../../utils/transactionPrint'

const formatPdfValue = (key, value, t) => {
  if (value == null || value === '') return '-'
  if (key === 'status') return value === 1 ? t('success') : value === 0 ? t('failed') : String(value)
  if (typeof value === 'object') return null
  return String(value)
}

const keyToLabel = (k) => k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const formatDetailsArrayForPrintRows = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return []

  return arr.flatMap((obj, index) => {
    if (!obj || typeof obj !== 'object') return []

    const entries = Object.entries(obj).map(([key, value]) => ({
      label: keyToLabel(key),
      value: value == null || value === '' ? '-' : String(value),
    }))

    if (arr.length === 1) return entries

    return [
      { label: `Entry ${index + 1}`, value: '' },
      ...entries,
    ]
  })
}

const downloadTransactionPdf = (row, t, labels) => {
  const summaryRows = Object.entries(row)
    .filter(([key]) => Object.prototype.hasOwnProperty.call(labels, key) && key !== 'debit_details' && key !== 'credit_details')
    .map(([key, value]) => ({
      label: labels[key] ?? key,
      value:
        formatPdfValue(key, value, t) ??
        (value == null ? '-' : JSON.stringify(value, null, 2)),
    }))

  openTransactionPrintWindow({
    title: `${t('transaction')} ${String(row.txn_id ?? row.id ?? '')}`,
    pageTitle: t('transaction_details'),
    logoUrl: PAYSEY_LOGO_URL,
    popupMessage: t('please_allow_popups_to_download_pdf'),
    sections: [
      {
        title: t('transaction_details'),
        rows: summaryRows,
      },
      {
        title: t('debit_details'),
        rows: formatDetailsArrayForPrintRows(row.debit_details),
      },
      {
        title: t('credit_details'),
        rows: formatDetailsArrayForPrintRows(row.credit_details),
      },
    ],
  })
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
