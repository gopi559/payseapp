import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import SuccessScreen from '../../Reusable/SuccessScreen'

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
    navigate('/customer/home')
  }

  const amount = details?.txn_amount != null ? `₹${Number(details.txn_amount).toFixed(2)}` : ''
  const rrn = details?.rrn ?? ''
  const txnId = details?.txn_id != null ? String(details.txn_id) : ''
  const cardNumber = details?.card_number ? `${details.card_number.slice(0, 4)} **** **** ${details.card_number.slice(-4)}` : ''
  const walletNumber = details?.wallet_number ?? ''

  return (
    <PageContainer>
      <SuccessScreen
        icon="✓"
        title="Transaction Successful!"
        message="Money has been sent to the card successfully."
        onDone={handleDone}
        buttonText="Done"
      />
      {(amount || rrn || txnId || cardNumber || walletNumber) && (
        <div className="mt-4 mx-auto max-w-xs rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm space-y-2">
          {amount && <p className="flex justify-between"><span className="text-gray-600">Amount</span><span className="font-medium">{amount}</span></p>}
          {cardNumber && <p className="flex justify-between"><span className="text-gray-600">Card</span><span className="font-mono">{cardNumber}</span></p>}
          {rrn && <p className="flex justify-between"><span className="text-gray-600">RRN</span><span className="font-mono">{rrn}</span></p>}
          {txnId && <p className="flex justify-between"><span className="text-gray-600">Transaction ID</span><span>{txnId}</span></p>}
          {walletNumber && <p className="flex justify-between"><span className="text-gray-600">Wallet Number</span><span className="font-mono">{walletNumber}</span></p>}
        </div>
      )}
    </PageContainer>
  )
}

export default WalletToCardSuccess

