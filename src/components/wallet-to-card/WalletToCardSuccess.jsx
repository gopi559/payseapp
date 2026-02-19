import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import { IoInformationCircleOutline } from 'react-icons/io5'
import { formatCardNumber } from '../../utils/formatCardNumber'

const WalletToCardSuccess = () => {
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('walletToCardSuccess')
    if (!raw) return
    try {
      setDetails(JSON.parse(raw))
    } catch {
      setDetails(null)
    }
  }, [])

  if (!details) return null

  const {
    txn_id,
    wallet_number,
    card_number,
    card_name,
    txn_amount,
    txn_time,
  } = details

  const txnId = txn_id ?? '—'

  const from = 'Wallet'

  const formattedCardNumber = card_number ? formatCardNumber(card_number) : '—'
  const cardholderName = card_name || '—'

  const amount = txn_amount
    ? `₹${Number(txn_amount).toFixed(2)}`
    : '₹0.00'

  const dateTime = txn_time
    ? new Date(txn_time).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : ''

  const handleDone = () => {
    sessionStorage.removeItem('walletToCardSuccess')
    navigate('/customer')
  }

  const handleViewDetails = () => {
    navigate('/customer/wallet-to-card/details')
  }

  return (
    <PageContainer>
      <div className="min-h-screen flex flex-col items-center px-4 pt-10 pb-28 bg-white max-w-md mx-auto">

        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-gray-900">
          Transaction Successful
        </h1>

        <p className="mt-1 text-sm text-gray-500">{dateTime}</p>

        <div className="mt-6 w-full bg-green-100 rounded-2xl px-5 py-4 space-y-3">

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transaction ID:</span>
            <span className="font-medium text-gray-900">{txnId}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">From:</span>
            <span className="font-medium text-gray-900">{from}</span>
          </div>

          <div className="flex justify-between items-start text-sm">
            <span className="text-gray-600">To:</span>
            <div className="text-right">
              <div className="font-medium text-gray-900 font-mono">{formattedCardNumber}</div>
              {cardholderName && cardholderName !== '—' && (
                <div className="text-xs text-gray-600 mt-0.5">{cardholderName}</div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-green-200">
            <span className="text-lg font-semibold text-gray-800">Amount:</span>
            <span className="text-2xl font-bold text-gray-900">{amount}</span>
          </div>
        </div>

        <div className="mt-6 w-full">
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 border-green-500 text-green-600 font-medium"
          >
            <IoInformationCircleOutline className="w-5 h-5" />
            View more
          </button>
        </div>

        <div className="mt-4 w-full">
          <button
            onClick={handleDone}
            className="w-full py-3 rounded-full bg-green-600 text-white font-medium"
          >
            Done
          </button>
        </div>

      </div>
    </PageContainer>
  )
}

export default WalletToCardSuccess
