import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiCreditCard } from 'react-icons/hi2'
import PageContainer from '../../../Reusable/PageContainer'
import Button from '../../../Reusable/Button'
import { getAuthToken, deviceId, getCurrentUserId } from '../../../services/api'
import { BENIFICIARY_LIST } from '../../../utils/constant'
import OtherCardPreview from './OtherCardPreview'
import THEME_COLORS from '../../../theme/colors'

const NUM_DATA = 20

// SAME grid-style meta row used in PaysePayCards
const MetaRow = ({ label, value }) => (
  <>
    <div className="flex items-center gap-2">
      <span className="font-medium text-gray-500 text-sm">{label}</span>
    </div>
    <span className="font-semibold text-gray-800 text-sm break-words">
      {value ?? '—'}
    </span>
  </>
)

const OtherCardsPage = () => {
  const navigate = useNavigate()
  const contentCard = THEME_COLORS.contentCard

  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cardSearchQuery, setCardSearchQuery] = useState('')

  const loadList = async (pageNum = 1, append = false) => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('User not found')

      pageNum === 1 ? setLoading(true) : setLoadingMore(true)
      setError('')

      const response = await fetch(BENIFICIARY_LIST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
          deviceInfo: JSON.stringify({
            device_type: 'WEB',
            device_id: deviceId,
          }),
        },
        body: JSON.stringify({
          page: pageNum,
          no_of_data: NUM_DATA,
          user_id: userId,
          is_temp: 0,
        }),
      })

      const res = await response.json().catch(() => null)

      if (!response.ok || res?.code !== 1) {
        throw new Error(res?.message || 'Failed to load other cards')
      }

      const list = Array.isArray(res?.data) ? res.data : []

      setCards(append ? (prev) => [...prev, ...list] : list)
      setHasMore(list.length >= NUM_DATA)
      setPage(pageNum)

      if (pageNum === 1 && list.length && !append) {
        setSelectedCard(list[0])
      }
    } catch (err) {
      setError(err?.message || 'Failed to load other cards')
      if (!append) setCards([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadList(1, false)
  }, [])

  const filteredCards = cards.filter((card) => {
    if (!cardSearchQuery.trim()) return true
    const q = cardSearchQuery.toLowerCase()
    return (
      (card.cardholder_name ?? '').toLowerCase().includes(q) ||
      (card.masked_card ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <PageContainer>
      <div className="px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600 text-center py-8">Loading cards...</p>
        ) : cards.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No other bank cards.</p>
        ) : (
          <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 w-full min-w-0">
            {/* LEFT TABLE */}
            <div
              className="flex-1 min-w-0 flex flex-col gap-3 rounded-lg shadow-sm p-3 h-[80vh]"
              style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: contentCard.iconBackground }}>
                    <HiCreditCard className="w-5 h-5" style={{ color: contentCard.iconColor }} />
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: contentCard.title }}>
                    Card Beneficiaries
                  </h3>
                </div>

                <input
                  type="search"
                  placeholder="Search card"
                  value={cardSearchQuery}
                  onChange={(e) => setCardSearchQuery(e.target.value)}
                  className="max-w-xs rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: `1px solid ${contentCard.border}`,
                    backgroundColor: THEME_COLORS.common.white,
                    color: contentCard.title,
                  }}
                />
              </div>

              <div className="flex-1 overflow-hidden rounded-lg">
                <div className="overflow-y-auto h-full">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 border-b" style={{ backgroundColor: contentCard.accentBackground, borderColor: contentCard.border }}>
                      <tr>
                        <th className="p-2 w-10"></th>
                        <th className="p-2">Card</th>
                        <th className="p-2">Cardholder</th>
                        <th className="p-2">Nickname</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCards.map((card) => {
                        const isSelected = selectedCard?.id === card.id
                        return (
                          <tr
                            key={card.id}
                            className={`border-b ${
                              isSelected
                                ? 'bg-brand-surfaceLight'
                                : 'hover:bg-gray-50'
                            }`}
                            style={{ borderColor: contentCard.border }}
                          >
                            <td className="p-2">
                              <input
                                type="radio"
                                checked={isSelected}
                                onChange={() => setSelectedCard(card)}
                              />
                            </td>
                            <td className="p-2 font-mono">{card.masked_card}</td>
                            <td className="p-2">{card.cardholder_name}</td>
                            <td className="p-2">
                              {card.cardholder_nick_name || '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {hasMore && (
                <Button
                  onClick={() => loadList(page + 1, true)}
                  variant="outline"
                  size="sm"
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </Button>
              )}
            </div>

            {/* RIGHT PANEL */}
            <div className="w-full xl:w-[480px] flex-shrink-0 flex flex-col gap-4">
              {selectedCard ? (
                <>
                  <OtherCardPreview card={selectedCard} fullWidth />

                  <div
                    className="rounded-2xl shadow-xl p-4"
                    style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <MetaRow label="Bank" value="Other Bank" />
                      <MetaRow label="Card number" value={selectedCard.masked_card} />
                      <MetaRow label="Cardholder" value={selectedCard.cardholder_name} />
                      <MetaRow label="Nickname" value={selectedCard.cardholder_nick_name} />
                      <MetaRow
                        label="Status"
                        value={selectedCard.status === 1 ? 'Active' : 'Inactive'}
                      />
                    </div>

                    <div className="mt-3 pt-3 border-t flex gap-3">
                      <Button
                        onClick={() =>
                          navigate(`/customer/other-cards/edit/${selectedCard.id}`, {
                            state: { row: selectedCard },
                          })
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        className="bg-red-600 text-white"
                        onClick={() =>
                          navigate(`/customer/other-cards/delete/${selectedCard.id}`, {
                            state: { row: selectedCard },
                          })
                        }
                      >
                        Delete
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => navigate('/customer/other-cards/add')}
                      >
                        Add New
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="rounded-xl shadow-sm p-8 text-center"
                  style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
                >
                  <p style={{ color: contentCard.subtitle }}>
                    Select a card to see preview and actions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default OtherCardsPage
