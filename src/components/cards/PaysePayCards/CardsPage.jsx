import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HiCreditCard, HiUserCircle, HiInformationCircle } from 'react-icons/hi2'
import { PiCreditCardLight } from 'react-icons/pi'
import { MdBrowserUpdated } from 'react-icons/md'
import PageContainer from '../../../Reusable/PageContainer'
import Button from '../../../Reusable/Button'
import cardService from './card.service'
import fetchWithRefreshToken from '../../../services/fetchWithRefreshToken'
import { CARD_TXN_LIST, CUSTOMER_GET_ACTIONS_CARD, UPDATE_CARD_STATUS } from '../../../utils/constant'
import ChipIcon from '../../../assets/Chip.svg'
import WifiIcon from '../../../assets/wifi.svg'
import PayseyLogoWhite from '../../../assets/PayseyPaymentLogowhite.png'

const NUM_DATA = 20

const formatExpiry = (iso) => {
  if (!iso) return '--/--'
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`
}

const CardPreview = ({ card, onClick, selectable = true, fullWidth = false, t }) => (
  <button
    type="button"
    onClick={() => selectable && onClick?.(card.id)}
    className={`relative h-[200px] sm:h-[240px] rounded-2xl overflow-hidden shadow-xl text-left transition-transform ${
      fullWidth ? 'w-full' : 'w-full max-w-[320px] sm:max-w-[400px]'
    } ${selectable ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : 'cursor-default'}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-action to-brand-dark" />
    <div className="absolute inset-0 bg-gradient-to-tr from-brand-surface/60 via-transparent to-brand-surfaceLight/40" />
    <svg
      className="absolute top-0 left-0 w-full h-16 sm:h-20 opacity-30 fill-white/15"
      viewBox="0 0 480 80"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path d="M0 40 Q120 0 240 40 T480 40 L480 80 L0 80 Z" />
    </svg>

    <span
      className={`absolute top-3 left-4 text-xs px-3 py-1 rounded-full font-semibold z-20 ${
        ['Block', 'Blocked', 'Lost', 'Stolen', 'Lost/Stolen'].includes(card.card_status_name)
          ? 'bg-red-600 text-white'
          : 'bg-white text-brand-dark'
      }`}
    >
      {card.card_status_name || t('personalized')}
    </span>

    <img
      src={PayseyLogoWhite}
      alt="Paysey"
      className="absolute top-3 right-4 h-6 sm:h-7 z-20"
      draggable={false}
    />

    <img
      src={ChipIcon}
      alt="Chip"
      className="absolute top-12 sm:top-14 lg:top-16 left-4 w-10 sm:w-12 z-20"
      draggable={false}
    />

    <img
      src={WifiIcon}
      alt="Contactless"
      className="absolute top-16 sm:top-18 right-4 w-8 sm:w-9 z-20"
      draggable={false}
    />

    <div className="absolute left-4 right-4 top-28 sm:top-32 text-amber-200 text-base sm:text-lg font-mono tracking-[0.25em] sm:tracking-[0.35em] z-20 truncate">
      {card.masked_card || '**** **** **** ****'}
    </div>

    <div className="absolute left-4 bottom-4 z-20 text-amber-200">
      <p className="text-xs text-amber-300/90">{t('cardholder')}</p>
      <p className="font-semibold text-sm sm:text-base text-amber-200 truncate max-w-[140px] sm:max-w-[180px]">
        {card.name_on_card || t('not_available')}
      </p>
    </div>

    <div className="absolute right-4 bottom-4 z-20 flex flex-col items-end gap-0.5">
      <div className="text-amber-200 text-right">
        <p className="text-xs text-amber-300/90">{t('valid_thru')}</p>
        <p className="font-semibold text-sm sm:text-base text-amber-200">{formatExpiry(card.expiry_on)}</p>
      </div>
    </div>
  </button>
)

const MetaRow = ({ icon: Icon, label, value, t }) => (
  <>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="text-brand-secondary w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
      <span className="font-medium text-gray-500 text-sm">{label}</span>
    </div>
    <span className="font-semibold text-gray-800 break-words text-sm">{value ?? t('not_available')}</span>
  </>
)

const CardsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
  const [cardTransactions, setCardTransactions] = useState([])
  const [txnLoading, setTxnLoading] = useState(false)

  const loadList = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)

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
      setError(err?.message || t('failed_to_load_cards'))
      setCards((prev) => (append ? prev : []))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadList(1, false)
  }, [t])

  useEffect(() => {
    let cancelled = false
    const fetchActions = async () => {
      setLoadingActions(true)
      try {
        const response = await fetchWithRefreshToken(CUSTOMER_GET_ACTIONS_CARD, {
          method: 'POST',
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
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setSelectedCardAction(null)
  }, [selectedCard?.id])

  const fetchCardTransactions = async (cardNumber) => {
    try {
      setTxnLoading(true)

      const response = await fetchWithRefreshToken(CARD_TXN_LIST, {
        method: 'POST',
        body: JSON.stringify({
          page: 1,
          no_of_data: 50,
          card_number: cardNumber,
          success_only: true,
          start_time: '',
          end_time: '',
        }),
      })

      const res = await response.json().catch(() => null)
      if (res?.success || res?.code === 1) {
        setCardTransactions(Array.isArray(res?.data) ? res.data : [])
      } else {
        setCardTransactions([])
      }
    } catch {
      setCardTransactions([])
    } finally {
      setTxnLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedCard) {
      setCardTransactions([])
      return
    }

    const rawCardNumber = String(selectedCard.card_number ?? '').trim()
    const maskedCard = String(selectedCard.masked_card ?? '')
    const cardNumber = rawCardNumber || maskedCard.replace(/\*/g, '').replace(/\s/g, '')

    if (!cardNumber) {
      setCardTransactions([])
      return
    }

    fetchCardTransactions(cardNumber)
  }, [selectedCard])

  const getAvailableActions = (currentStatus) => {
    if (!availableActions?.length) return []
    const status = (currentStatus ?? '').trim()
    if (status === 'Closed' || status === 'Lost/Stolen' || status === 'Lost' || status === 'Stolen') return []
    if (status === 'Block' || status === 'Blocked') {
      return availableActions.filter((a) => ['Active'].includes(a.action_name))
    }
    if (status === 'Active') {
      return availableActions.filter((a) => ['Blocked', 'Block', 'Closed', 'Lost', 'Stolen'].includes(a.action_name))
    }
    return availableActions
  }

  const handleCardStatusUpdate = async () => {
    const cardId = selectedCard?.id
    if (!cardId || selectedCardAction == null) return
    setIsUpdatingStatus(true)
    setError('')
    try {
      const response = await fetchWithRefreshToken(UPDATE_CARD_STATUS, {
        method: 'POST',
        body: JSON.stringify({
          card_id: cardId,
          card_status: selectedCardAction,
        }),
      })

      const res = await response.json().catch(() => null)
      if (!response.ok) throw new Error(res?.message || t('update_failed'))
      if (res?.success !== true && res?.code !== 1) throw new Error(res?.message || t('update_failed'))

      setSelectedCardAction(null)
      await loadList(1, false)
    } catch (err) {
      setError(err?.message || t('failed_to_update_card_status'))
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSelectCard = (card) => {
    setSelectedCard(card)
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600 text-center py-8">{t('loading_cards')}</p>
        ) : cards.length === 0 ? (
          <p className="text-gray-600 text-center py-8">{t('no_cards_yet')}</p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 xl:auto-rows-[minmax(360px,1fr)] gap-6">
            <div className="rounded-lg shadow-sm p-4 bg-white border border-gray-200 h-full min-h-[360px]">
              <div className="flex items-center justify-between mb-3 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-brand-secondary p-2 rounded-lg">
                    <HiCreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{t('card_information')}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="search"
                    placeholder={t('search_card')}
                    value={cardSearchQuery}
                    onChange={handleCardSearchChange}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm max-w-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                  <Button size="sm" onClick={() => navigate('/customer/card-request')}>
                    {t('card_request')}
                  </Button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[260px] rounded-lg border border-gray-100">
                <table className="w-full text-sm text-left">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                    <tr>
                      <th className="p-2 w-10"></th>
                      <th className="p-2">CHN</th>
                      <th className="p-2">{t('name_on_card')}</th>
                      <th className="p-2">{t('cardholder')}</th>
                      <th className="p-2">{t('status')}</th>
                      <th className="p-2">{t('expiry')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCards.map((card) => {
                      const isDisabled = card.card_status_name === 'Closed' || card.card_status_name === 'Lost/Stolen'
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
                          <td className="p-2 font-mono text-gray-800">{card.masked_card ?? t('not_available')}</td>
                          <td className="p-2 text-gray-800">{card.name_on_card ?? t('not_available')}</td>
                          <td className="p-2 text-gray-800">{card.name_on_card ?? t('not_available')}</td>
                          <td className="p-2">
                            <span className={getStatusColorClass(card.card_status_name)}>{card.card_status_name ?? t('not_available')}</span>
                          </td>
                          <td className="p-2 text-gray-800">{card.expiry_on ? formatExpiry(card.expiry_on) : t('not_available')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {hasMore && (
                <div className="mt-3">
                  <Button onClick={handleLoadMore} variant="outline" fullWidth size="sm" disabled={loadingMore}>
                    {loadingMore ? t('loading') : t('load_more')}
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-lg shadow-sm p-4 bg-white border border-gray-200 h-full min-h-[360px] flex items-center justify-center">
              {selectedCard ? (
                <CardPreview card={selectedCard} selectable={false} fullWidth t={t} />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">{t('select_card')}</p>
                </div>
              )}
            </div>

            <div className="rounded-lg shadow-sm p-4 bg-white border border-gray-200 h-full min-h-[360px]">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">{t('card_transactions')}</h3>
              {txnLoading ? (
                <p className="text-sm text-gray-500">{t('loading_transactions')}</p>
              ) : cardTransactions.length === 0 ? (
                <p className="text-sm text-gray-500">{t('no_transactions_found')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                      <tr>
                        <th className="p-2">{t('date')}</th>
                        <th className="p-2">{t('amount')}</th>
                        <th className="p-2">{t('merchant')}</th>
                        <th className="p-2">{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cardTransactions.map((txn, index) => (
                        <tr key={txn?.id ?? txn?.txn_id ?? `${txn?.rrn ?? 'txn'}-${index}`} className="border-b border-gray-100 last:border-0">
                          <td className="p-2 text-gray-800">{txn?.txn_time || txn?.created_on || t('not_available')}</td>
                          <td className="p-2 text-gray-800">{txn?.txn_amount ?? txn?.amount ?? t('not_available')}</td>
                          <td className="p-2 text-gray-800">{txn?.merchant_name || txn?.txn_desc || t('not_available')}</td>
                          <td className="p-2 text-gray-800">{txn?.status_name || txn?.status || t('not_available')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-lg shadow-sm p-4 bg-white border border-gray-200 h-full min-h-[360px]">
              {selectedCard ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
                    <MetaRow icon={HiCreditCard} label={t('card_type')} value={selectedCard.card_status_name || t('card')} t={t} />
                    <MetaRow icon={PiCreditCardLight} label={t('card_number')} value={selectedCard.masked_card} t={t} />
                    <MetaRow icon={HiUserCircle} label={t('name_on_card')} value={selectedCard.name_on_card} t={t} />
                    <MetaRow icon={HiUserCircle} label={t('cardholder')} value={selectedCard.name_on_card} t={t} />
                    <MetaRow icon={HiInformationCircle} label={t('card_status')} value={selectedCard.card_status_name} t={t} />
                    <MetaRow
                      icon={HiInformationCircle}
                      label={t('expiration_date')}
                      value={selectedCard.expiry_on ? formatExpiry(selectedCard.expiry_on) : null}
                      t={t}
                    />
                    <div className="flex items-center gap-2">
                      <MdBrowserUpdated className="text-brand-secondary w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="font-medium text-gray-500">{t('select_action')}</span>
                    </div>
                    <div className="font-semibold text-gray-800">
                      {loadingActions ? (
                        <span className="text-sm text-gray-400">{t('loading_actions')}</span>
                      ) : (
                        <select
                          value={selectedCardAction ?? ''}
                          onChange={(e) => setSelectedCardAction(e.target.value === '' ? null : Number(e.target.value))}
                          disabled={
                            !selectedCard ||
                            selectedCard.card_status_name === 'Closed' ||
                            selectedCard.card_status_name === 'Lost/Stolen'
                          }
                          className="w-full h-8 sm:h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <option value="">{t('select_action')}</option>
                          {getAvailableActions(selectedCard?.card_status_name).map((action) => (
                            <option key={action.id} value={action.id}>
                              {action.action_name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
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
                          {t('updating')}
                        </span>
                      ) : (
                        t('update')
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">{t('no_card_selected')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default CardsPage
