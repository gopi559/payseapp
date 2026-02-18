import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import SuccessScreen from '../../Reusable/SuccessScreen'
import Button from '../../Reusable/Button'
import { IoInformationCircleOutline } from 'react-icons/io5'

const SendSuccess = () => {
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('sendSuccess')
    if (!raw) return
    try {
      setDetails(JSON.parse(raw))
    } catch {
      setDetails(null)
    }
  }, [])

  if (!details) return null

  const handleDone = () => {
    sessionStorage.removeItem('sendSuccess')
    navigate('/customer/send')
  }

  const handleViewDetails = () => {
    navigate('/customer/send/details')
  }

  const txnId = details?.txn_id ?? '—'
  const amount = details?.amount
    ? `₹${Number(details.amount).toFixed(2)}`
    : '₹0.00'
  const beneficiaryName = details?.beneficiary_name ?? '—'

  return (
    <PageContainer>
      <SuccessScreen
        icon="✓"
        title="Payment Successful!"
        message="Your payment has been processed successfully."
        onDone={handleDone}
        buttonText="Done"
      />

      <div className="mt-6 mx-auto max-w-xs">
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Transaction ID</span>
            <span className="text-sm font-medium">{txnId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="text-sm font-medium">{amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Beneficiary</span>
            <span className="text-sm font-medium">{beneficiaryName}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 mx-auto max-w-xs">
        <Button
          variant="outline"
          fullWidth
          onClick={handleViewDetails}
          className="border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white"
        >
          <div className="flex items-center justify-center gap-2">
            <IoInformationCircleOutline className="w-5 h-5" />
            <span>View Transaction Details</span>
          </div>
        </Button>
      </div>
    </PageContainer>
  )
}

export default SendSuccess
