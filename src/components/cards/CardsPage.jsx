import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { HiCreditCard, HiUserCircle, HiInformationCircle } from 'react-icons/hi2'
import { PiCreditCardLight } from 'react-icons/pi'
import { MdBrowserUpdated } from 'react-icons/md'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import { formatAmount } from '../../utils/formatAmount'
import { cardService } from './card.service'
import { ROUTES } from '../../config/routes'
import { callApi } from '../../services/api'
import { CUSTOMER_GET_ACTIONS_CARD, UPDATE_CARD_STATUS } from '../../utils/constant'

const NUM_DATA = 20

const formatExpiry = (iso) => {
  if (!iso) return '--/--'
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`
}

const CardPreview = ({ card, onClick, selectable = true }) => (
  <button
    type="button"
    onClick={() => selectable && onClick?.(card.id)}
    className={`relative w-full max-w-[320px] sm:max-w-[400px] h-[200px] sm:h-[240px] rounded-2xl overflow-hidden shadow-xl text-left transition-transform ${selectable ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : 'cursor-default'}`}
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
    <span className="absolute top-3 right-4 text-white font-bold text-lg tracking-tight z-20">
      Paysey
    </span>
    
    
    
{/* Premium Gold EMV Chip */}
<div className="absolute top-12 sm:top-14 lg:top-16 left-3 sm:left-4 z-20">
  <svg
    viewBox="0 0 200 140"
    className="w-10 h-7 sm:w-12 sm:h-8 lg:w-12 lg:h-8"
  >
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD86A" />
        <stop offset="50%" stopColor="#D4A017" />
        <stop offset="100%" stopColor="#9E7400" />
      </linearGradient>

      <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFF2B0" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
    </defs>

    {/* outer body */}
    <rect x="2" y="2" rx="22" ry="22" width="196" height="136" fill="url(#gold)" />

    {/* top center */}
    <path
      d="M100 8 L132 36 Q100 52 68 36 Z"
      fill="url(#edge)"
    />

    {/* center vertical */}
    <path
      d="M92 36 H108 V104 H92 Z"
      fill="url(#edge)"
    />

    {/* left top */}
    <path
      d="M10 10 H90 Q74 38 54 52 H10 Z"
      fill="url(#edge)"
    />

    {/* right top */}
    <path
      d="M190 10 H110 Q126 38 146 52 H190 Z"
      fill="url(#edge)"
    />

    {/* left bottom */}
    <path
      d="M10 130 H90 Q74 102 54 88 H10 Z"
      fill="url(#edge)"
    />

    {/* right bottom */}
    <path
      d="M190 130 H110 Q126 102 146 88 H190 Z"
      fill="url(#edge)"
    />

    {/* mid left */}
    <rect x="10" y="52" width="70" height="36" rx="6" fill="url(#edge)" />

    {/* mid right */}
    <rect x="120" y="52" width="70" height="36" rx="6" fill="url(#edge)" />
  </svg>
</div>



    {/* Card number – gold */}
    <div className="absolute left-4 right-4 top-20 sm:top-24 text-amber-200 text-base sm:text-lg font-mono tracking-[0.2em] sm:tracking-[0.35em] z-20 truncate">
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
      <span className="text-amber-200/70 text-xs font-mono">▭</span>
    </div>
  </button>
)

const MetaRow = ({ icon: Icon, label, value }) => (
  <>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="text-brand-primary w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
    <span className="text-sm font-semibold text-brand-dark break-all">{value ?? '—'}</span>
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
        const res = await callApi(CUSTOMER_GET_ACTIONS_CARD, {})
        if (!cancelled && res?.success && Array.isArray(res?.data)) {
          setAvailableActions(res.data)
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
    if (currentStatus === 'Closed' || currentStatus === 'Lost/Stolen') return []
    if (currentStatus === 'Block') {
      return availableActions.filter((a) =>
        ['Unblock', 'Lost/Stolen', 'Closed'].includes(a.action_name)
      )
    }
    if (currentStatus === 'Active') {
      return availableActions.filter((a) =>
        ['Block', 'Closed', 'Lost/Stolen'].includes(a.action_name)
      )
    }
    if (currentStatus === 'Unblock') {
      return availableActions.filter((a) =>
        ['Block', 'Closed', 'Lost/Stolen'].includes(a.action_name)
      )
    }
    return []
  }

  const handleCardStatusUpdate = async () => {
    const cardId = selectedCard?.pre_id ?? selectedCard?.id
    if (!cardId || selectedCardAction == null) return
    setIsUpdatingStatus(true)
    setError('')
    try {
      const res = await callApi(UPDATE_CARD_STATUS, {
        pre_id: cardId,
        card_status: selectedCardAction,
      })
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
    if (selectedCard?.id) navigate(ROUTES.CARD_DETAILS.replace(':id', String(selectedCard.id)))
  }

  const handleLoadMore = () => {
    loadList(page + 1, true)
  }

  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">My Cards</h1>

        {/* Wallet summary card: green background, white text, balance + wallet ID */}
        {/* <div className="bg-gradient-to-br from-brand-primary to-brand-action rounded-xl p-6 text-white mb-6 shadow-lg"> */}
          {/* Top section: Wallet Balance (label + amount) and credit card icon */}
          {/* <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Wallet Balance</p>
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
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: card list */}
            <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-brand-dark mb-3">Cards</h3>
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {cards.map((card) => (
                  <button
                    key={card.id ?? Math.random()}
                    type="button"
                    onClick={() => handleSelectCard(card)}
                    className={`w-full text-left rounded-xl p-3 flex items-center gap-3 transition-colors border ${
                      selectedCard?.id === card.id
                        ? 'bg-brand-surfaceLight border-brand-primary shadow-sm'
                        : 'bg-gray-50 border-gray-100 hover:bg-brand-surfaceMuted'
                    }`}
                  >
                    <span className="text-2xl">💳</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-dark truncate">
                        {card.name_on_card ?? `Card ${card.id ?? '—'}`}
                      </p>
                      {card.masked_card && (
                        <p className="text-sm text-gray-600 font-mono truncate">{card.masked_card}</p>
                      )}
                      {card.card_status_name && (
                        <p className="text-xs text-gray-500">{card.card_status_name}</p>
                      )}
                    </div>
                    {selectedCard?.id === card.id && (
                      <span className="text-brand-primary shrink-0">✓</span>
                    )}
                  </button>
                ))}
              </div>
              {hasMore && (
                <div className="mt-4">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    fullWidth
                    size="md"
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load more'}
                  </Button>
                </div>
              )}
            </div>

            {/* Right: selected card preview + meta info */}
            <div className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0 flex flex-col gap-4">
              {selectedCard ? (
                <>
                  <div className="flex flex-col items-center sm:items-start">
                    <CardPreview card={selectedCard} selectable={false} />
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
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
                        {MdBrowserUpdated && (
                          <MdBrowserUpdated className="text-brand-primary w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-500 font-medium">Select Action</span>
                      </div>
                      <div className="font-semibold text-brand-dark">
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
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-brand-dark focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:bg-gray-100 disabled:text-gray-400"
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
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      <Button
                        onClick={handleCardStatusUpdate}
                        fullWidth
                        size="md"
                        disabled={
                          selectedCardAction == null ||
                          isUpdatingStatus ||
                          !selectedCard ||
                          selectedCard.card_status_name === 'Closed' ||
                          selectedCard.card_status_name === 'Lost/Stolen'
                        }
                      >
                        {isUpdatingStatus ? 'Updating...' : 'Update'}
                      </Button>
                      <Button
                        onClick={handleViewDetails}
                        fullWidth
                        size="md"
                        variant="outline"
                      >
                        View full details
                      </Button>
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
