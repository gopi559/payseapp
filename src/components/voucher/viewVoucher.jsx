import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import KeyValueDisplay from '../../Reusable/KeyValueDisplay'
import { formatTableDateTime } from '../../utils/formatDate'
import THEME_COLORS from '../../theme/colors'

const LABELS = {
  Cashcode: 'Cash Code',
  Channel: 'Channel',
  Amount: 'Amount',
  ReceiverName: 'Receiver Name',
  ReceiverMobile: 'Receiver Mobile',
  ReceiverIDNumber: 'Receiver ID Number',
  ReceiverFatherName: 'Receiver Father Name',
  ProvinceName: 'Province Name',
  DistrictName: 'District Name',
  VillageName: 'Village Name',
  CreatedAt: 'Created At',
}

const ViewVoucher = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const row = location.state?.row ?? null
  const contentCard = THEME_COLORS.contentCard

  if (!row) {
    return (
      <PageContainer>
        <div className="px-4 py-6 min-h-full">
          <p style={{ color: contentCard.subtitle }}>No data available</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/customer/voucher')}>
            Back
          </Button>
        </div>
      </PageContainer>
    )
  }

  const formatAmount = (amount) => {
    if (amount == null) return '—'
    return `₹${Number(amount).toFixed(2)}`
  }

  const allowedKeys = Object.keys(LABELS)
  const filteredData = {}
  allowedKeys.forEach((key) => {
    const value = row[key] || row[key.toLowerCase()] || row[key.replace(/([A-Z])/g, '_$1').toLowerCase()]
    if (value !== undefined) {
      filteredData[key] = value
    }
  })

  const formatters = {
    CreatedAt: (value) => formatTableDateTime(value),
    Amount: (value) => formatAmount(value),
  }

  return (
    <PageContainer>
      <div className="min-h-full px-4 py-6 overflow-x-hidden flex flex-col">
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold" style={{ color: contentCard.title }}>View Cash Code</h2>
            <div className="flex gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => navigate('/customer/voucher')}>
                Back
              </Button>
            </div>
          </div>
          <div
            className="w-full rounded-lg shadow-sm p-6 overflow-hidden"
            style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
          >
            <KeyValueDisplay
              data={filteredData}
              labels={LABELS}
              formatters={formatters}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default ViewVoucher
