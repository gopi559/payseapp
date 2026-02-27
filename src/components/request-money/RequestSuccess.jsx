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

  return (
    <PageContainer>
      <div className="h-screen bg-white flex justify-center">
        <div className="w-full max-w-md px-6 pt-6 flex flex-col">

          <div className="flex justify-end">
            <button
              onClick={() => navigate('/customer/home')}
              className="text-green-600 font-semibold text-sm"
            >
              Help
            </button>
          </div>

          <div className="mt-10 flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <svg
                className="w-14 h-14 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="mt-6 text-2xl font-bold text-black">
              Transaction Request has been
              <br />
              accepted
            </h1>

            <p className="mt-2 text-base text-gray-600">{dateText}</p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="flex justify-between text-base">
              <span className="font-semibold text-black">Transaction ID:</span>
              <span className="font-bold text-black">
                {details?.txn_rrn || details?.req_id || '-'}
              </span>
            </div>

            <div className="flex justify-between text-base">
              <span className="font-semibold text-black">From:</span>
              <span className="font-bold text-black">You</span>
            </div>

            <div className="flex justify-between text-base">
              <span className="font-semibold text-black">To:</span>
              <span className="font-bold text-black">
                {details?.to_name || '-'}
              </span>
            </div>

            <div className="flex justify-between items-end pt-4">
              <span className="text-3xl font-bold text-black">Amount:</span>
              <div className="flex items-center gap-2">
                <img src={AfganCurrency} alt="Currency" className="h-7 w-7" />
                <span className="text-4xl font-extrabold text-black">
                  {Number(details?.amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* <button
            className="mt-12 h-14 rounded-full border-2 border-green-500 text-green-600 font-semibold text-lg flex items-center justify-center gap-2"
          >
            <IoInformationCircleOutline size={22} />
            View more
          </button> */}

          <button
            onClick={() => {
              sessionStorage.removeItem('requestMoneySuccess')
              navigate('/customer/request-money')
            }}
            className="mt-auto mb-6 h-14 rounded-full bg-green-500 text-white font-semibold text-lg"
          >
            Done
          </button>

        </div>
      </div>
    </PageContainer>
  )
}

export default RequestSuccess