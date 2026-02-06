import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import SuccessScreen from '../../Reusable/SuccessScreen'

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

  const amount = details?.amount != null ? `₹${Number(details.amount).toFixed(2)}` : ''
  const beneficiaryName = details?.beneficiary_name ?? ''
  const beneficiaryMobile = details?.beneficiary_mobile ?? ''
  const txnId = details?.txn_id != null ? String(details.txn_id) : ''
  const rrn = details?.rrn ?? ''
  const txnTime = details?.txn_time ?? details?.created_at ?? ''
  const remarks = details?.remarks ?? ''

  return (
    <PageContainer>
      <SuccessScreen
        icon="✓"
        title="Payment Successful!"
        message="Your payment has been processed successfully."
        onDone={handleDone}
        buttonText="Done"
      />
      {(amount || beneficiaryName || beneficiaryMobile || txnId || rrn || txnTime || remarks) && (
        <div className="mt-4 mx-auto max-w-xs rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm space-y-2">
          {amount && <p className="flex justify-between"><span className="text-gray-600">Amount</span><span className="font-medium">{amount}</span></p>}
          {beneficiaryName && <p className="flex justify-between"><span className="text-gray-600">Beneficiary</span><span className="font-medium">{beneficiaryName}</span></p>}
          {beneficiaryMobile && <p className="flex justify-between"><span className="text-gray-600">Mobile</span><span className="font-mono">{beneficiaryMobile}</span></p>}
          {remarks && <p className="flex justify-between"><span className="text-gray-600">Remarks</span><span>{remarks}</span></p>}
          {rrn && <p className="flex justify-between"><span className="text-gray-600">RRN</span><span className="font-mono">{rrn}</span></p>}
          {txnId && <p className="flex justify-between"><span className="text-gray-600">Transaction ID</span><span>{txnId}</span></p>}
          {txnTime && <p className="flex justify-between"><span className="text-gray-600">Time</span><span>{txnTime}</span></p>}
        </div>
      )}
    </PageContainer>
  )
}

export default SendSuccess

