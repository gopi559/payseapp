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
