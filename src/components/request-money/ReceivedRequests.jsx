import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiArrowLeft, FiSearch } from 'react-icons/fi'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import requestMoneyService from './requestMoney.service'
import RequestCard from './RequestCard'
import { getCustomerId, sortByAddedOnDesc } from './requestMoney.utils'

const ReceivedRequests = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const currentUserId = getCustomerId(user)

  const [loading, setLoading] = useState(false)
  const [actioningId, setActioningId] = useState(null)
  const [search, setSearch] = useState('')
  const [requests, setRequests] = useState([])

const loadRequests = async () => {
  if (!currentUserId) return
  setLoading(true)
  try {
    const { data } = await requestMoneyService.getReceivedRequests(currentUserId)

    setRequests((prev) => {
      const declinedIds = new Set(
        prev.filter(r => r.status === 3).map(r => r.id)
      )

      return sortByAddedOnDesc(
        data.map((req) =>
          declinedIds.has(req.id)
            ? { ...req, status: 3 } 
            : req
        )
      )
    })
  } catch (error) {
    toast.error(error?.message || 'Failed to load received requests')
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    loadRequests()
  }, [currentUserId])

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return requests
    return requests.filter((item) =>
      String(item?.amount ?? '')
        .toLowerCase()
        .includes(query)
    )
  }, [requests, search])

  const handleDecline = async (item) => {
    setActioningId(item.id)
    try {
      await requestMoneyService.declineRequestMoney({
        money_reqid: item.id,
      })

      // UI safety: immediately reflect declined state even if list API lags.
      setRequests((prev) =>
        prev.map((req) => (req.id === item.id ? { ...req, status: 3 } : req))
      )

      toast.success('Request declined')
      await loadRequests()
    } catch (error) {
      toast.error(error?.message || 'Failed to decline request')
    } finally {
      setActioningId(null)
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-md min-h-screen px-4 pt-6 pb-8 bg-[#dff3e8]">
        <div className="relative flex items-center justify-center mb-5">
          <button
            type="button"
            onClick={() => navigate('/customer/request-money')}
            className="absolute left-0 text-emerald-600"
            aria-label="Back"
          >
            <FiArrowLeft size={26} />
          </button>
          <h1 className="text-2xl font-bold text-emerald-700">Received Request</h1>
        </div>

        <div className="rounded-2xl bg-white/80 h-14 px-4 flex items-center gap-3 shadow-sm">
          <FiSearch size={25} className="text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by amount..."
            className="w-full bg-transparent outline-none text-lg text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <div className="mt-5 space-y-4">
          {loading && <p className="text-center text-sm text-gray-500">Loading requests...</p>}
          {!loading && filteredRequests.length === 0 && (
            <p className="text-center text-sm text-gray-500">No received requests found.</p>
          )}

          {filteredRequests.map((item) => (
            <RequestCard
              key={item.id}
              item={item}
              showActions
              loadingAction={actioningId === item.id}
              onDecline={() => handleDecline(item)}
            />
          ))}
        </div>
      </div>
    </PageContainer>
  )
}

export default ReceivedRequests
