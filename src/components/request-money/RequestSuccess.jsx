import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoInformationCircleOutline } from 'react-icons/io5'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import AfganCurrency from '../../assets/afgan_currency_green.svg'
import THEME_COLORS from '../../theme/colors'

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
  const menuGreen = THEME_COLORS.header.background
  const menuGreenHover = THEME_COLORS.sidebar.logoutHoverBackground

  const handleViewMore = () => {
    navigate('/customer/request-money/my')
  }

  const handleDone = () => {
    sessionStorage.removeItem('requestMoneySuccess')
    navigate('/customer/request-money')
  }

  return (
    <MobileScreenContainer>
      <div className="min-h-screen flex flex-col items-center px-4 pt-10 pb-28 max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: menuGreen }}>
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
        <p className="mt-1 text-sm font-medium" style={{ color: menuGreen }}>Money Request</p>
        <p className="mt-1 text-sm text-gray-500">{dateText}</p>

        <div className="mt-6 w-full rounded-2xl px-5 py-4 space-y-3" style={{ backgroundColor: THEME_COLORS.contentCard.background }}>
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

          <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: THEME_COLORS.contentCard.border }}>
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
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 font-medium"
            style={{ borderColor: menuGreen, color: menuGreen }}
          >
            <IoInformationCircleOutline className="w-5 h-5" />
            View more
          </button>
        </div>

        <div className="mt-4 w-full">
          <button
            onClick={handleDone}
            className="w-full py-3 rounded-full text-white font-medium"
            style={{ backgroundColor: menuGreen }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = menuGreenHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = menuGreen
            }}
          >
            Done
          </button>
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default RequestSuccess
