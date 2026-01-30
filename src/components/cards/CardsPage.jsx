import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import { formatAmount } from '../../utils/formatAmount'
import { cardService } from './card.service'
import { ROUTES } from '../../config/routes'

const NUM_DATA = 20

const formatExpiry = (iso) => {
  if (!iso) return '--/--'
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`
}

const CardPreview = ({ card, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(card.id)}
    className="relative w-full max-w-[320px] sm:max-w-[400px] h-[200px] sm:h-[240px] rounded-2xl overflow-hidden shadow-xl text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
    {/* Chip – brand light/dark */}
    <div className="absolute left-4 top-12 sm:top-14 z-20 flex items-center gap-2">
      <div className="w-9 h-6 sm:w-10 sm:h-7 rounded bg-brand-light flex items-center justify-center shadow-inner border border-brand-dark/40">
        <div className="w-5 h-3 sm:w-6 sm:h-4 border border-brand-dark/60 rounded" />
      </div>
    </div>
    {/* Card number */}
    <div className="absolute left-4 right-4 top-20 sm:top-24 text-brand-light text-base sm:text-lg font-mono tracking-[0.2em] sm:tracking-[0.35em] z-20 truncate">
      {card.masked_card || '**** **** **** ****'}
    </div>
    {/* Cardholder */}
    <div className="absolute left-4 bottom-4 z-20 text-brand-light">
      <p className="text-xs opacity-80">cardholder</p>
      <p className="font-semibold text-sm sm:text-base truncate max-w-[140px] sm:max-w-[180px]">
        {card.name_on_card || '—'}
      </p>
    </div>
    {/* Valid Thru + card icon */}
    <div className="absolute right-4 bottom-4 z-20 flex flex-col items-end gap-0.5">
      <div className="text-brand-light text-right">
        <p className="text-xs opacity-80">Valid Thru</p>
        <p className="font-semibold text-sm sm:text-base">{formatExpiry(card.expiry_on)}</p>
      </div>
      <span className="text-white/70 text-xs font-mono">▭</span>
    </div>
  </button>
)

const CardsPage = () => {
  const navigate = useNavigate()
  const balance = useSelector((state) => state.wallet.balance)
  const walletId = useSelector((state) => state.wallet.walletId)
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadList = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true)
      setError('')
      const { data } = await cardService.getList({ page: pageNum, num_data: NUM_DATA })
      const list = Array.isArray(data) ? data : []
      setCards(append ? (prev) => [...prev, ...list] : list)
      setHasMore(list.length >= NUM_DATA)
      setPage(pageNum)
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

  const handleCardClick = (cardId) => {
    navigate(ROUTES.CARD_DETAILS.replace(':id', String(cardId)))
  }

  const handleLoadMore = () => {
    loadList(page + 1, true)
  }

  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">My Cards</h1>

        <div className="bg-gradient-to-br from-brand-primary to-brand-action rounded-xl p-6 text-white mb-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Wallet Balance</p>
              <p className="text-3xl font-bold">{formatAmount(balance)}</p>
            </div>
            <span className="text-3xl">💳</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs opacity-90 mb-1">Wallet ID</p>
            <p className="font-mono text-sm">{walletId || '—'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-brand-dark mb-4">Cards</h3>
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {cards.map((card) => (
                  <CardPreview
                    key={card.id ?? Math.random()}
                    card={card}
                    onClick={handleCardClick}
                  />
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
            </>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default CardsPage
