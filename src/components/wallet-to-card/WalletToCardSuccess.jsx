import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import SuccessScreen from '../../Reusable/SuccessScreen'
import Button from '../../Reusable/Button'
import { IoInformationCircleOutline } from 'react-icons/io5'

const WalletToCardSuccess = () => {
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)

  useEffect(() => {
    // Clear any stored data
    sessionStorage.removeItem('walletToCardData')
    const raw = sessionStorage.getItem('walletToCardSuccess')
    if (raw) {
      try {
        setDetails(JSON.parse(raw))
      } catch (_) {
        setDetails({})
      }
    }
  }, [])

  const handleDone = () => {
    sessionStorage.removeItem('walletToCardSuccess')
    navigate('/customer/wallet-to-card')
  }

  const handleViewDetails = () => {
    navigate('/customer/wallet-to-card/details')
  }

  const txnId = details?.txn_id != null ? String(details.txn_id) : '—'
  const amount = details?.txn_amount != null ? `₹${Number(details.txn_amount).toFixed(2)}` : '₹0.00'
  const cardName = details?.card_name ?? '—'

  return (
    <PageContainer>
      <SuccessScreen
        icon="✓"
        title="Transaction Successful!"
        message="Money has been sent to the card successfully."
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
            <span className="text-sm text-gray-600">Card Name</span>
            <span className="text-sm font-medium text-brand-dark">{cardName}</span>
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

export default WalletToCardSuccess

