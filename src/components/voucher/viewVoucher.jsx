import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import KeyValueDisplay from '../../Reusable/KeyValueDisplay'
import { formatTableDateTime } from '../../utils/formatDate'

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

  if (!row) {
    return (
      <PageContainer>
        <div className="px-4 py-6 bg-gray-50 min-h-full">
          <p className="text-gray-600">No data available</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/customer/voucher')}>
            Back
          </Button>
        </div>
      </PageContainer>
    )
  }

  // Format amount
  const formatAmount = (amount) => {
    if (amount == null) return '—'
    return `₹${Number(amount).toFixed(2)}`
  }

  // Only include the specified keys
  const allowedKeys = Object.keys(LABELS)
  const filteredData = {}
  allowedKeys.forEach((key) => {
    // Try different key formats (PascalCase, lowercase, snake_case)
    const value = row[key] || row[key.toLowerCase()] || row[key.replace(/([A-Z])/g, '_$1').toLowerCase()]
    if (value !== undefined) {
      filteredData[key] = value
    }
  })

  // Formatters for specific fields
  const formatters = {
    CreatedAt: (value) => formatTableDateTime(value),
    Amount: (value) => formatAmount(value),
  }

  return (
    <PageContainer>
      <div className="bg-gray-50 min-h-full px-4 py-6 overflow-x-hidden flex flex-col">
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-800">View Cash Code</h2>
            <div className="flex gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => navigate('/customer/voucher')}>
                Back
              </Button>
            </div>
          </div>
          <div className="border border-gray-200 w-full rounded-lg shadow-sm bg-white p-6 overflow-hidden">
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


