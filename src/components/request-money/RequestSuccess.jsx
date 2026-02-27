import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoInformationCircleOutline } from 'react-icons/io5'
import PageContainer from '../../Reusable/PageContainer'
import AfganCurrency from '../../assets/afgan_currency_green.svg'

const RequestSuccess = () => {
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('requestMoneySuccess')
    if (!raw) return
    try {
      setDetails(JSON.parse(raw))
    } catch {
      setDetails(null)
    }
  }, [])

  const dateText = useMemo(() => {
    const source = details?.created_at || new Date().toISOString()
    const d = new Date(source)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }, [details?.created_at])

  if (!details) return null

  const txnId = details?.txn_rrn || details?.req_id || '-'
  const toName = details?.to_name || '-'
  const remarks = details?.remarks || '-'
  const amount = Number(details?.amount || 0).toFixed(2)

  const handleViewMore = () => {
    navigate('/customer/request-money/my')
  }

  const handleDone = () => {
    sessionStorage.removeItem('requestMoneySuccess')
    navigate('/customer/request-money')
  }

  return (
    <PageContainer>
      <div className="min-h-screen flex flex-col items-center px-4 pt-10 pb-28 bg-white max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-gray-900">Request Created</h1>
        <p className="mt-1 text-sm font-medium text-green-600">Money Request</p>
        <p className="mt-1 text-sm text-gray-500">{dateText}</p>

        <div className="mt-6 w-full bg-green-100 rounded-2xl px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transaction ID:</span>
            <span className="font-medium text-gray-900">{txnId}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">From:</span>
            <span className="font-medium text-gray-900">You</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">To:</span>
            <span className="font-medium text-gray-900">{toName}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remarks:</span>
            <span className="font-medium text-gray-900 text-right max-w-[65%] truncate">{remarks}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-green-200">
            <span className="text-lg font-semibold text-gray-800">Amount:</span>
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <img src={AfganCurrency} alt="Currency" className="h-7 w-7" />
              <span>{amount}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 w-full">
          <button
            onClick={handleViewMore}
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

export default RequestSuccess
