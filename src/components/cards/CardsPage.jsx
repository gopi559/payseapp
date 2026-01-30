import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import { formatAmount } from '../../utils/formatAmount'
import { cardService } from '../../services/card.service.jsx'
import { ROUTES } from '../../config/routes'

const NUM_DATA = 20

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
              <div className="space-y-3">
                {cards.map((card) => (
                  <button
                    key={card.id ?? Math.random()}
                    type="button"
                    onClick={() => handleCardClick(card.id)}
                    className="w-full text-left bg-gray-50 hover:bg-brand-surfaceMuted rounded-xl p-4 flex items-center justify-between transition-colors border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="font-medium text-brand-dark">
                          {card.name_on_card ?? `Card ${card.id ?? '—'}`}
                        </p>
                        {card.masked_card && (
                          <p className="text-sm text-gray-600 font-mono">{card.masked_card}</p>
                        )}
                        {card.card_status_name && (
                          <p className="text-xs text-gray-500">{card.card_status_name}</p>
                        )}
                        {card.expiry_on && (
                          <p className="text-xs text-gray-500">
                            Expiry: {new Date(card.expiry_on).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-400">›</span>
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
            </>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default CardsPage
