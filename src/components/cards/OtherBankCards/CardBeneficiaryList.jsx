import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HiCreditCard } from 'react-icons/hi2'
import PageContainer from '../../../Reusable/PageContainer'
import { getAuthToken, deviceId, getCurrentUserId } from '../../../services/api'
import { BENIFICIARY_LIST, CARD_TXN_LIST } from '../../../utils/constant'
import OtherCardPreview from './OtherCardPreview'
import { formatTableDateTime } from '../../../utils/formatDate'
import THEME_COLORS from '../../../theme/colors'

const FETCH_PAGE_SIZE = 500

const MetaRow = ({ label, value, t }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-[13px] text-gray-500 w-32 shrink-0">{label}</span>
    <span className="text-[13px] font-medium text-gray-800 text-right max-w-[240px] truncate">{value ?? t('not_available')}</span>
  </div>
)

const CardBeneficiaryList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const contentCard = THEME_COLORS.contentCard

  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [cardTransactions, setCardTransactions] = useState([])
  const [txnLoading, setTxnLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const userId = getCurrentUserId()

      const response = await fetch(BENIFICIARY_LIST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
          deviceinfo: JSON.stringify({
            device_type: 'WEB',
            device_id: deviceId,
          }),
        },
        body: JSON.stringify({
          page: 1,
          no_of_data: FETCH_PAGE_SIZE,
          user_id: userId,
          is_temp: 0,
        }),
      })

      const res = await response.json()

      if (!response.ok || Number(res?.code) !== 1) {
        throw new Error(res?.message || t('failed_to_load_beneficiaries'))
      }

      const list = Array.isArray(res?.data) ? res.data : []
      setCards(list)
      if (list.length) setSelectedCard(list[0])
    } catch (err) {
      setError(err?.message || t('failed_to_load_beneficiaries'))
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [t])

  const fetchCardTransactions = async (cardNumber) => {
    try {
      setTxnLoading(true)

      const response = await fetch(CARD_TXN_LIST, {
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
          page: 1,
          no_of_data: 50,
          card_number: cardNumber,
          success_only: true,
          start_time: '',
          end_time: '',
        }),
      })

      const res = await response.json()

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

  const filteredCards = cards.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.masked_card?.toLowerCase().includes(q) ||
      c.cardholder_name?.toLowerCase().includes(q) ||
      c.external_inst_name?.toLowerCase().includes(q)
    )
  })

  return (
    <PageContainer>
      <div className="px-4 py-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        {loading ? (
          <p className="text-center text-gray-600 py-10">{t('loading_cards')}</p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: contentCard.iconBackground }}>
                    <HiCreditCard className="w-5 h-5" style={{ color: contentCard.iconColor }} />
                  </div>

                  <h3 className="text-lg font-semibold" style={{ color: contentCard.title }}>{t('card_beneficiaries')}</h3>
                </div>

                <input
                  type="search"
                  placeholder={t('search_card')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg px-3 py-2 text-sm max-w-xs"
                  style={{ border: `1px solid ${contentCard.border}`, backgroundColor: '#fff', color: contentCard.title }}
                />
              </div>

              <div className="overflow-y-auto max-h-[240px]">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="p-2 w-10"></th>
                      <th className="p-2">{t('card')}</th>
                      <th className="p-2">{t('cardholder')}</th>
                      <th className="p-2">{t('nickname')}</th>
                      <th className="p-2">{t('bank')}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCards.map((card) => {
                      const isSelected = selectedCard?.id === card.id
                      return (
                        <tr key={card.id} onClick={() => setSelectedCard(card)} className={`cursor-pointer border-b ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                          <td className="p-2"><input type="radio" checked={isSelected} readOnly /></td>
                          <td className="p-2 font-mono">{card.masked_card}</td>
                          <td className="p-2">{card.cardholder_name}</td>
                          <td className="p-2">{card.cardholder_nick_name || t('not_available')}</td>
                          <td className="p-2">{card.external_inst_name || t('not_available')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>{selectedCard ? <OtherCardPreview card={selectedCard} fullWidth /> : <p className="text-gray-500">{t('select_card')}</p>}</div>

            <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}>
              <h3 className="text-lg font-semibold mb-3">{t('card_transactions')}</h3>

              {txnLoading ? (
                <p className="text-sm text-gray-500">{t('loading_transactions')}</p>
              ) : cardTransactions.length === 0 ? (
                <p className="text-sm text-gray-500">{t('no_transactions_found')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="p-2">{t('date')}</th>
                        <th className="p-2">{t('amount')}</th>
                        <th className="p-2">{t('merchant')}</th>
                        <th className="p-2">{t('status')}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {cardTransactions.map((txn, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{txn?.txn_time || txn?.created_on || t('not_available')}</td>
                          <td className="p-2">{txn?.txn_amount ?? txn?.amount ?? t('not_available')}</td>
                          <td className="p-2">{txn?.merchant_name || txn?.txn_desc || t('not_available')}</td>
                          <td className="p-2">{txn?.status_name || txn?.status || t('not_available')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}>
              {selectedCard ? (
                <>
                  <MetaRow label={t('bank')} value={selectedCard.external_inst_name} t={t} />
                  <MetaRow label={t('card_number')} value={selectedCard.masked_card} t={t} />
                  <MetaRow label={t('cardholder')} value={selectedCard.cardholder_name} t={t} />
                  <MetaRow label={t('nickname')} value={selectedCard.cardholder_nick_name} t={t} />
                  <MetaRow label={t('status')} value={selectedCard.status === 1 ? t('active') : t('inactive')} t={t} />
                  <MetaRow label={t('created_on')} value={selectedCard.created_on ? formatTableDateTime(selectedCard.created_on) : t('not_available')} t={t} />
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

export default CardBeneficiaryList
