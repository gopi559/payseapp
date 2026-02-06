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
    // Clear any stored data
    sessionStorage.removeItem('sendData')
    const raw = sessionStorage.getItem('sendSuccess')
    if (raw) {
      try {
        setDetails(JSON.parse(raw))
      } catch (_) {
        setDetails({})
      }
    }
  }, [])

  const handleDone = () => {
    sessionStorage.removeItem('sendSuccess')
    navigate('/customer/home')
  }

  const handleViewDetails = () => {
    navigate('/customer/send/details')
  }

  const txnId = details?.txn_id != null ? String(details.txn_id) : '—'
  const amount = details?.amount != null ? `₹${Number(details.amount).toFixed(2)}` : '₹0.00'
  const beneficiaryName = details?.beneficiary_name ?? details?.beneficiary?.displayName ?? '—'

  return (
    <PageContainer>
      <SuccessScreen
        icon="✓"
        title="Payment Successful!"
        message="Your payment has been processed successfully."
        onDone={handleDone}
        buttonText="Done"
      />
      
      {/* Transaction Details */}
      <div className="mt-6 mx-auto max-w-xs">
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Transaction ID</span>
            <span className="text-sm font-medium text-brand-dark">{txnId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="text-sm font-medium text-brand-dark">{amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Beneficiary Name</span>
            <span className="text-sm font-medium text-brand-dark">{beneficiaryName}</span>
          </div>
        </div>
      </div>

      {/* View Transaction Details Button */}
      <div className="mt-4 mx-auto max-w-xs">
        <Button
          onClick={handleViewDetails}
          variant="outline"
          fullWidth
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

