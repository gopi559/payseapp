import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiCreditCard } from 'react-icons/hi2'
import PageContainer from '../../../Reusable/PageContainer'
import Button from '../../../Reusable/Button'
import { getCurrentUserId } from '../../../services/api'
import fetchWithRefreshToken from '../../../services/fetchWithRefreshToken'
import { BENIFICIARY_LIST, CARD_TXN_LIST } from '../../../utils/constant'
import OtherCardPreview from './OtherCardPreview'
import { formatTableDateTime } from '../../../utils/formatDate'
import THEME_COLORS from '../../../theme/colors'

const FETCH_PAGE_SIZE = 500

const MetaRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-[13px] text-gray-500 w-32 shrink-0">
      {label}
    </span>
    <span className="text-[13px] font-medium text-gray-800 text-right max-w-[240px] truncate">
      {value ?? '—'}
    </span>
  </div>
)

const CardBeneficiaryList = () => {

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

      const response = await fetchWithRefreshToken(BENIFICIARY_LIST, {
        method: 'POST',
        body: JSON.stringify({
          page: 1,
          no_of_data: FETCH_PAGE_SIZE,
          user_id: userId,
          is_temp: 0,
        }),
      })

      const res = await response.json()

      if (!response.ok || Number(res?.code) !== 1) {
        throw new Error(res?.message || 'Failed to load beneficiaries')
      }

      const list = Array.isArray(res?.data) ? res.data : []

      setCards(list)

      if (list.length) setSelectedCard(list[0])

    } catch (err) {
      setError(err?.message || 'Failed to load beneficiaries')
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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

      const res = await response.json()

      if (res?.success || res?.code === 1) {
        setCardTransactions(Array.isArray(res?.data) ? res.data : [])
      } else {
        setCardTransactions([])
      }

    } catch (err) {

      console.error(err)
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600 py-10">Loading cards...</p>
        ) : (

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

  {/* BOX 1 : CARD LIST */}
  <div
    className="rounded-lg shadow-sm p-4"
    style={{
      backgroundColor: contentCard.background,
      border: `1px solid ${contentCard.border}`
    }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: contentCard.iconBackground }}
        >
          <HiCreditCard
            className="w-5 h-5"
            style={{ color: contentCard.iconColor }}
          />
        </div>

        <h3 className="text-lg font-semibold" style={{ color: contentCard.title }}>
          Card Beneficiaries
        </h3>
      </div>

      <input
        type="search"
        placeholder="Search card"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-lg px-3 py-2 text-sm max-w-xs"
        style={{
          border: `1px solid ${contentCard.border}`,
          backgroundColor: "#fff",
          color: contentCard.title
        }}
      />
    </div>

    <div className="overflow-y-auto max-h-[240px]">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="p-2 w-10"></th>
            <th className="p-2">Card</th>
            <th className="p-2">Cardholder</th>
            <th className="p-2">Nickname</th>
            <th className="p-2">Bank</th>
          </tr>
        </thead>

        <tbody>
          {filteredCards.map((card) => {
            const isSelected = selectedCard?.id === card.id

            return (
              <tr
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`cursor-pointer border-b ${
                  isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <td className="p-2">
                  <input type="radio" checked={isSelected} readOnly />
                </td>

                <td className="p-2 font-mono">{card.masked_card}</td>
                <td className="p-2">{card.cardholder_name}</td>
                <td className="p-2">{card.cardholder_nick_name || "—"}</td>
                <td className="p-2">{card.external_inst_name || "—"}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </div>

  {/* BOX 2 : CARD PREVIEW */}
  <div
    
  >
    {selectedCard ? (
      <div className="w-full flex justify-center">
        <OtherCardPreview card={selectedCard} />
      </div>
    ) : (
      <p className="text-gray-500">Select a card</p>
    )}
  </div>

  {/* BOX 3 : TRANSACTIONS */}
  <div
    className="rounded-lg shadow-sm p-4"
    style={{
      backgroundColor: contentCard.background,
      border: `1px solid ${contentCard.border}`
    }}
  >
    <h3 className="text-lg font-semibold mb-3">Card Transactions</h3>

    {txnLoading ? (
      <p className="text-sm text-gray-500">Loading transactions...</p>
    ) : cardTransactions.length === 0 ? (
      <p className="text-sm text-gray-500">No transactions found</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Merchant</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {cardTransactions.map((txn, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">
                  {txn?.txn_time || txn?.created_on || "—"}
                </td>
                <td className="p-2">
                  {txn?.txn_amount ?? txn?.amount ?? "—"}
                </td>
                <td className="p-2">
                  {txn?.merchant_name || txn?.txn_desc || "—"}
                </td>
                <td className="p-2">
                  {txn?.status_name || txn?.status || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>

  {/* BOX 4 : CARD DETAILS */}
  <div
    className="rounded-lg shadow-sm p-4"
    style={{
      backgroundColor: contentCard.background,
      border: `1px solid ${contentCard.border}`
    }}
  >
    {selectedCard ? (
      <>
        <MetaRow label="Bank" value={selectedCard.external_inst_name} />
        <MetaRow label="Card number" value={selectedCard.masked_card} />
        <MetaRow label="Cardholder" value={selectedCard.cardholder_name} />
        <MetaRow label="Nickname" value={selectedCard.cardholder_nick_name} />
        <MetaRow
          label="Status"
          value={selectedCard.status === 1 ? "Active" : "Inactive"}
        />
        <MetaRow
          label="Created on"
          value={
            selectedCard.created_on
              ? formatTableDateTime(selectedCard.created_on)
              : "—"
          }
        />
      </>
    ) : (
      <p className="text-gray-500">No card selected</p>
    )}
  </div>
</div>

        )}

      </div>

    </PageContainer>

  )
}

export default CardBeneficiaryList
