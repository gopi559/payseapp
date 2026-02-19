import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { HiCreditCard, HiUserCircle, HiInformationCircle } from 'react-icons/hi2'
import { PiCreditCardLight } from 'react-icons/pi'
import { MdBrowserUpdated } from 'react-icons/md'
import PageContainer from '../../../Reusable/PageContainer'
import Button from '../../../Reusable/Button'
import { formatAmount } from '../../../utils/formatAmount'
import cardService from './card.service'
import { getAuthToken, deviceId } from '../../../services/api'
import { CUSTOMER_GET_ACTIONS_CARD, UPDATE_CARD_STATUS } from '../../../utils/constant'
import ChipIcon from '../../../assets/Chip.svg'
import WifiIcon from '../../../assets/wifi.svg'
import PayseyLogoWhite from '../../../assets/PayseyPaymentLogowhite.png'

const NUM_DATA = 20

const formatExpiry = (iso) => {
  if (!iso) return '--/--'
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`
}

const CardPreview = ({ card, onClick, selectable = true, fullWidth = false }) => (
  <button
    type="button"
    onClick={() => selectable && onClick?.(card.id)}
    className={`relative h-[200px] sm:h-[240px] rounded-2xl overflow-hidden shadow-xl text-left transition-transform ${
      fullWidth ? 'w-full' : 'w-full max-w-[320px] sm:max-w-[400px]'
    } ${selectable ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : 'cursor-default'}`}
  >
    {/* Base gradient – brand only */}
    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-action to-brand-dark" />
    {/* Soft overlay – brand surface */}
    <div className="absolute inset-0 bg-gradient-to-tr from-brand-surface/60 via-transparent to-brand-surfaceLight/40" />
    {/* Wave accent top */}
    <svg
      className="absolute top-0 left-0 w-full h-16 sm:h-20 opacity-30 fill-white/15"
      viewBox="0 0 480 80"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path d="M0 40 Q120 0 240 40 T480 40 L480 80 L0 80 Z" />
    </svg>
    {/* Badge */}
    <span className="absolute top-3 left-4 bg-white text-brand-dark text-xs px-3 py-1 rounded-full font-semibold z-20">
      {card.card_status_name || 'Personalized'}
    </span>
    {/* Logo */}
<img
  src={PayseyLogoWhite}
  alt="Paysey"
  className="absolute top-3 right-4 h-6 sm:h-7 z-20"
  draggable={false}
/>

    
    
    
{/* Chip icon */}
<img
  src={ChipIcon}
  alt="Chip"
  className="absolute top-12 sm:top-14 lg:top-16 left-4 w-10 sm:w-12 z-20"
  draggable={false}
/>

{/* Contactless / Wifi icon */}
<img
  src={WifiIcon}
  alt="Contactless"
  className="absolute top-16 sm:top-18 right-4 w-8 sm:w-9 z-20"
  draggable={false}
/>



    {/* Card number – gold */}
<div className="absolute left-4 right-4 top-28 sm:top-32 text-amber-200 text-base sm:text-lg font-mono tracking-[0.25em] sm:tracking-[0.35em] z-20 truncate">
      {card.masked_card || '**** **** **** ****'}
    </div>
    {/* Cardholder – gold */}
    <div className="absolute left-4 bottom-4 z-20 text-amber-200">
      <p className="text-xs text-amber-300/90">cardholder</p>
      <p className="font-semibold text-sm sm:text-base text-amber-200 truncate max-w-[140px] sm:max-w-[180px]">
        {card.name_on_card || '—'}
      </p>
    </div>
    {/* Valid Thru + expiry – gold */}
    <div className="absolute right-4 bottom-4 z-20 flex flex-col items-end gap-0.5">
      <div className="text-amber-200 text-right">
        <p className="text-xs text-amber-300/90">Valid Thru</p>
        <p className="font-semibold text-sm sm:text-base text-amber-200">{formatExpiry(card.expiry_on)}</p>
      </div>
      {/* <span className="text-amber-200/70 text-xs font-mono">▭</span> */}
    </div>
  </button>
)

const MetaRow = ({ icon: Icon, label, value }) => (
  <>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
      <span className="font-medium text-gray-500 text-sm">{label}</span>
    </div>
    <span className="font-semibold text-gray-800 break-words text-sm">{value ?? '—'}</span>
  </>
)

const CardsPage = () => {
  const navigate = useNavigate()
  const balance = useSelector((state) => state.wallet.balance)
  const walletId = useSelector((state) => state.wallet.walletId)
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [availableActions, setAvailableActions] = useState([])
  const [loadingActions, setLoadingActions] = useState(false)
  const [selectedCardAction, setSelectedCardAction] = useState(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [cardSearchQuery, setCardSearchQuery] = useState('')

  const loadList = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true)
      setError('')
      const { data } = await cardService.getList({ page: pageNum, num_data: NUM_DATA })
      const list = Array.isArray(data) ? data : []
      setCards(append ? (prev) => [...prev, ...list] : list)
      setHasMore(list.length >= NUM_DATA)
      setPage(pageNum)
      if (pageNum === 1 && list.length > 0 && !append) {
        const first = list.find((c) => c.card_status_name === 'Active') || list[0]
        setSelectedCard(first)
      }
    } catch (err) {
      setError(err?.message || 'Failed to load cards')
      setCards((prev) => (append ? prev : []))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadList(1, false)
  }, [])

  useEffect(() => {
    let cancelled = false
    const fetchActions = async () => {
      setLoadingActions(true)
      try {
        const response = await fetch(CUSTOMER_GET_ACTIONS_CARD, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
                    deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
          },
          body: JSON.stringify({}),
        })
        const res = await response.json().catch(() => null)
        const ok = res?.success === true || res?.code === 1
        const list = Array.isArray(res?.data) ? res.data : []
        if (!cancelled && ok && list.length) {
          setAvailableActions(
            list.map((item) => ({
              id: item.id,
              action_name: item.action_name ?? item.card_status ?? String(item.id),
            }))
          )
        } else if (!cancelled) {
          setAvailableActions([])
        }
      } catch {
        if (!cancelled) setAvailableActions([])
      } finally {
        if (!cancelled) setLoadingActions(false)
      }
    }
    fetchActions()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    setSelectedCardAction(null)
  }, [selectedCard?.id])

  const getAvailableActions = (currentStatus) => {
    if (!availableActions?.length) return []
    const status = (currentStatus ?? '').trim()
    if (status === 'Closed' || status === 'Lost/Stolen' || status === 'Lost' || status === 'Stolen') return []
    if (status === 'Block' || status === 'Blocked') {
      return availableActions.filter((a) =>
        ['Active'].includes(a.action_name)
      )
    }
    if (status === 'Active') {
      return availableActions.filter((a) =>
        ['Blocked', 'Block', 'Closed', 'Lost', 'Stolen'].includes(a.action_name)
      )
    }
    return availableActions
  }

  const handleCardStatusUpdate = async () => {
    const cardId = selectedCard?.id
    if (!cardId || selectedCardAction == null) return
    setIsUpdatingStatus(true)
    setError('')
    try {
      const response = await fetch(UPDATE_CARD_STATUS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
              deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
        },
        body: JSON.stringify({
          card_id: cardId,
          card_status: selectedCardAction,
        }),
      })
      const res = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(res?.message || 'Update failed')
      }
      if (res?.success !== true && res?.code !== 1) {
        throw new Error(res?.message || 'Update failed')
      }
      setSelectedCardAction(null)
      await loadList(1, false)
    } catch (err) {
      setError(err?.message || 'Failed to update card status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSelectCard = (card) => {
    setSelectedCard(card)
  }

  const handleViewDetails = () => {
    if (!selectedCard?.id) return
    navigate(`/customer/cards/${selectedCard.id}`)
  }

  const handleLoadMore = () => {
    loadList(page + 1, true)
  }

  const handleCardSearchChange = (e) => setCardSearchQuery(e.target.value ?? '')

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-100 px-2 py-0.5 rounded-full text-xs'
      case 'Closed':
      case 'Lost/Stolen':
      case 'Block':
        return 'text-red-600 bg-red-100 px-2 py-0.5 rounded-full text-xs'
      default:
        return 'text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-xs'
    }
  }

  const filteredCards = cards.filter((card) => {
    if (!cardSearchQuery.trim()) return true
    const q = cardSearchQuery.toLowerCase()
    const name = (card.name_on_card ?? '').toLowerCase()
    const masked = (card.masked_card ?? '').toLowerCase()
    const status = (card.card_status_name ?? '').toLowerCase()
    return name.includes(q) || masked.includes(q) || status.includes(q)
  })

  return (
    <PageContainer>
      <div className="px-4 py-6">
        {/* <h1 className="text-2xl font-bold text-brand-dark mb-6">My Cards</h1> */}

        {/* Wallet summary card: green background, white text, Available Balance + wallet ID */}
        {/* <div className="bg-gradient-to-br from-brand-primary to-brand-action rounded-xl p-6 text-white mb-6 shadow-lg"> */}
          {/* Top section: Available Balance (label + amount) and credit card icon */}
          {/* <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Available Balance</p>
              <p className="text-3xl font-bold">{formatAmount(balance)}</p>
            </div>
            <span className="text-3xl">💳</span>
          </div> */}
          {/* Separator line between balance and wallet ID */}
          {/* <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs opacity-90 mb-1">Wallet ID</p>
            <p className="font-mono text-sm">{walletId || '—'}</p>
          </div>
        </div> */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600 text-center py-8">Loading cards...</p>
        ) : cards.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No cards yet.</p>
        ) : (
          <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 w-full min-w-0">
            {/* Left: Table with Search Bar – only this area scrolls (reference layout) */}
            <div className="flex-1 min-w-0 flex flex-col gap-3 sm:gap-4 bg-white rounded-lg shadow-sm p-2 sm:p-3 lg:p-4 w-full h-[80vh]">
              <div className="flex items-center justify-between p-2 gap-2 sm:gap-4 flex-shrink-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <HiCreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
                    Card information
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center max-w-[200px] sm:max-w-xs">
                    <input
                      type="search"
                      placeholder="Search card"
                      value={cardSearchQuery}
                      onChange={handleCardSearchChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate("/customer/card-request")}
                  >
                    Card Request
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden rounded-lg bg-white shadow-sm flex flex-col">
                <div className="overflow-y-auto flex-1 min-h-0">
                  <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                      <tr>
                        <th className="p-2 w-10"></th>
                        <th className="p-2">CHN</th>
                        <th className="p-2">Name on card</th>
                        <th className="p-2">Cardholder</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCards.map((card) => {
                        const isDisabled =
                          card.card_status_name === 'Closed' || card.card_status_name === 'Lost/Stolen'
                        const isSelected = selectedCard?.id === card.id
                        return (
                          <tr
                            key={card.id ?? Math.random()}
                            className={`border-b border-gray-100 last:border-0 ${
                              isSelected ? 'bg-brand-surfaceLight' : 'hover:bg-gray-50'
                            } ${isDisabled ? 'opacity-60' : ''}`}
                          >
                            <td className="p-2">
                              <input
                                type="radio"
                                name="cardSelection"
                                checked={isSelected}
                                onChange={() => !isDisabled && handleSelectCard(card)}
                                disabled={isDisabled}
                                className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="p-2 font-mono text-gray-800">{card.masked_card ?? '—'}</td>
                            <td className="p-2 text-gray-800">{card.name_on_card ?? '—'}</td>
                            <td className="p-2 text-gray-800">{card.name_on_card ?? '—'}</td>
                            <td className="p-2">
                              <span className={getStatusColorClass(card.card_status_name)}>
                                {card.card_status_name ?? '—'}
                              </span>
                            </td>
                            <td className="p-2 text-gray-800">
                              {card.expiry_on ? formatExpiry(card.expiry_on) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {hasMore && (
                <div className="mt-3 flex-shrink-0">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    fullWidth
                    size="sm"
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load more'}
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Card Preview + Meta Info (reference layout) */}
            <div className="w-full xl:w-[480px] min-h-[500px] flex-shrink-0 flex flex-col gap-4 lg:gap-6">
              {selectedCard ? (
                <>
                  <div className="w-full">
                    <CardPreview card={selectedCard} selectable={false} fullWidth />
                  </div>
                  {/* Card Meta Info (reference: rounded-2xl, border-blue-100, grid) */}
                  <div className="w-full bg-white rounded-2xl shadow-xl border border-blue-100 p-2 sm:p-2 lg:p-4 min-h-0 overflow-visible flex flex-col justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 lg:gap-2 text-sm sm:text-base z-10">
                      <MetaRow icon={HiCreditCard} label="Card type" value={selectedCard.card_status_name || 'Card'} />
                      <MetaRow icon={PiCreditCardLight} label="Card number" value={selectedCard.masked_card} />
                      <MetaRow icon={HiUserCircle} label="Name on card" value={selectedCard.name_on_card} />
                      <MetaRow icon={HiUserCircle} label="Cardholder" value={selectedCard.name_on_card} />
                      <MetaRow icon={HiInformationCircle} label="Card status" value={selectedCard.card_status_name} />
                      <MetaRow
                        icon={HiInformationCircle}
                        label="Expiration date"
                        value={selectedCard.expiry_on ? formatExpiry(selectedCard.expiry_on) : null}
                      />
                      <div className="flex items-center gap-2">
                        <MdBrowserUpdated className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="font-medium text-gray-500">Select Action</span>
                      </div>
                      <div className="font-semibold text-gray-800">
                        {loadingActions ? (
                          <span className="text-sm text-gray-400">Loading actions...</span>
                        ) : (
                          <select
                            value={selectedCardAction ?? ''}
                            onChange={(e) =>
                              setSelectedCardAction(
                                e.target.value === '' ? null : Number(e.target.value)
                              )
                            }
                            disabled={
                              !selectedCard ||
                              selectedCard.card_status_name === 'Closed' ||
                              selectedCard.card_status_name === 'Lost/Stolen'
                            }
                            className="w-full h-8 sm:h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            <option value="">Select action</option>
                            {getAvailableActions(selectedCard?.card_status_name).map((action) => (
                              <option key={action.id} value={action.id}>
                                {action.action_name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-2 pt-2 sm:pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleCardStatusUpdate}
                        disabled={
                          selectedCardAction == null ||
                          isUpdatingStatus ||
                          !selectedCard ||
                          selectedCard.card_status_name === 'Closed' ||
                          selectedCard.card_status_name === 'Lost/Stolen'
                        }
                        className={`w-full px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${
                          selectedCardAction == null ||
                          isUpdatingStatus ||
                          !selectedCard ||
                          selectedCard?.card_status_name === 'Closed' ||
                          selectedCard?.card_status_name === 'Lost/Stolen'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isUpdatingStatus ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Updating...
                          </span>
                        ) : (
                          'Update'
                        )}
                      </button>
                      {/* <Button
                        onClick={handleViewDetails}
                        fullWidth
                        size="sm"
                        variant="outline"
                      >
                        View full details
                      </Button> */}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <p className="text-gray-500">Select a card to see preview and details.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default CardsPage
