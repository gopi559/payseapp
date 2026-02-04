import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import SuccessScreen from '../../Reusable/SuccessScreen'

const CashInSuccess = () => {
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('cashInSuccess')
    if (raw) {
      try {
        setDetails(JSON.parse(raw))
      } catch (_) {
        setDetails({})
      }
    }
  }, [])

  const handleDone = () => {
    sessionStorage.removeItem('cashInSuccess')
    navigate('/customer/home')
  }

  const amount = details?.txn_amount != null ? `₹${Number(details.txn_amount).toFixed(2)}` : ''
  const rrn = details?.rrn ?? ''
  const txnId = details?.txn_id != null ? String(details.txn_id) : ''
  const txnTime = details?.txn_time ?? ''

  return (
    <PageContainer>
      <SuccessScreen
        icon="✓"
        title="Cash In Successful!"
        message="Money has been added to your wallet successfully."
        onDone={handleDone}
        buttonText="Done"
      />
      {(amount || rrn || txnId || txnTime) && (
        <div className="mt-4 mx-auto max-w-xs rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm space-y-2">
          {amount && <p className="flex justify-between"><span className="text-gray-600">Amount</span><span className="font-medium">{amount}</span></p>}
          {rrn && <p className="flex justify-between"><span className="text-gray-600">RRN</span><span className="font-mono">{rrn}</span></p>}
          {txnId && <p className="flex justify-between"><span className="text-gray-600">Transaction ID</span><span>{txnId}</span></p>}
          {txnTime && <p className="flex justify-between"><span className="text-gray-600">Time</span><span>{txnTime}</span></p>}
        </div>
      )}
    </PageContainer>
  )
}

export default CashInSuccess
