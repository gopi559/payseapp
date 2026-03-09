import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiArrowLeft, FiSearch } from 'react-icons/fi'
import { toast } from 'react-toastify'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import requestMoneyService from './requestMoney.service'
import RequestCard from './RequestCard'
import { getCustomerId, sortByAddedOnDesc } from './requestMoney.utils'
import THEME_COLORS from '../../theme/colors'

const MyRequests = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const currentUserId = getCustomerId(user)
  const menuGreen = THEME_COLORS.header.background

  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [requests, setRequests] = useState([])

  const loadRequests = async () => {
    if (!currentUserId) return
    setLoading(true)
    try {
      const { data } = await requestMoneyService.getMyRequests(currentUserId)
      setRequests(sortByAddedOnDesc(data))
    } catch (error) {
      toast.error(error?.message || t('failed_to_load_your_requests'))
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

  return (
    <MobileScreenContainer>
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="relative flex items-center justify-center mb-5">
          <button
            type="button"
            onClick={() => navigate('/customer/request-money')}
            className="absolute left-0"
            style={{ color: menuGreen }}
            aria-label={t('go_back')}
          >
            <FiArrowLeft size={26} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: menuGreen }}>{t('my_requests')}</h1>
        </div>

        <div className="rounded-2xl bg-white/80 h-14 px-4 flex items-center gap-3 shadow-sm">
          <FiSearch size={25} className="text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_by_amount')}
            className="w-full bg-transparent outline-none text-lg text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <div className="mt-5 space-y-4">
          {loading && <p className="text-center text-sm text-gray-500">{t('loading_requests')}</p>}
          {!loading && filteredRequests.length === 0 && (
            <p className="text-center text-sm text-gray-500">{t('no_requests_found')}</p>
          )}

          {filteredRequests.map((item) => (
            <RequestCard key={item.id} item={item} variant="sent" />
          ))}
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default MyRequests
