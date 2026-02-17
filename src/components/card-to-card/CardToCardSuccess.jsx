import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import { IoInformationCircleOutline } from 'react-icons/io5'

const CardToCardSuccess = () => {
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('cardToCardSuccess')
    if (!raw) return

    try {
      setDetails(JSON.parse(raw))
    } catch {
      setDetails(null)
    }
  }, [])

  const handleDone = () => {
    sessionStorage.removeItem('cardToCardSuccess')
    navigate('/customer')
  }

  const handleViewDetails = () => {
    navigate('/customer/card-to-card/details')
  }

  if (!details) return null

  const txnId = details.txn_id ?? '—'
  const from = `${details.from_card_name ?? '—'} •••• ${details.from_card?.slice(-4) ?? ''}`
  const to = `Card •••• ${details.to_card?.slice(-4) ?? ''}`

  const amount = details.txn_amount
    ? `₹${Number(details.txn_amount).toFixed(2)}`
    : '₹0.00'

  const dateTime = details.txn_time
    ? new Date(details.txn_time.replace(' ', 'T')).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—'

  return (
    <PageContainer>
      <div className="min-h-screen flex flex-col items-center px-4 pt-10 pb-28 bg-white max-w-md mx-auto">

        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-2xl font-semibold text-gray-900">
          Transaction Successful
        </h1>

        {/* Date & Time */}
        <p className="mt-1 text-sm text-gray-500">
          {dateTime}
        </p>

        {/* Details Card */}
        <div className="mt-6 w-full bg-green-100 rounded-2xl px-5 py-4 space-y-3">

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transaction ID:</span>
            <span className="font-medium text-gray-900">{txnId}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">From:</span>
            <span className="font-medium text-gray-900">{from}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">To:</span>
            <span className="font-medium text-gray-900">{to}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-green-200">
            <span className="text-lg font-semibold text-gray-800">
              Amount:
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {amount}
            </span>
          </div>
        </div>

        {/* View More */}
        <div className="mt-6 w-full">
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 border-green-500 text-green-600 font-medium"
          >
            <IoInformationCircleOutline className="w-5 h-5" />
            View more
          </button>
        </div>

        {/* Done */}
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

export default CardToCardSuccess
