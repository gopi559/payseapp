import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiCreditCard } from 'react-icons/hi2'
import PageContainer from '../../../Reusable/PageContainer'
import Button from '../../../Reusable/Button'
import { getAuthToken, deviceId } from '../../../services/api'
import { BENIFICIARY_LIST } from '../../../utils/constant'
import OtherCardPreview from './OtherCardPreview'

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

  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
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
          page: 1,
          no_of_data: FETCH_PAGE_SIZE,
          is_temp: 0,
        }),
      })

      const res = await response.json().catch(() => null)
      if (!response.ok || res?.code !== 1) {
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
      <div className="px-4 py-6 bg-gray-50 min-h-screen">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600 py-10">Loading cards...</p>
        ) : (
          <div className="flex flex-col xl:flex-row gap-6">
            {/* LEFT */}
            <div className="flex-1 bg-white rounded-lg shadow-sm p-4 h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <HiCreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Card Beneficiaries
                  </h3>
                </div>
                <input
                  type="search"
                  placeholder="Search card"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm max-w-xs"
                />
              </div>

              <div className="flex-1 overflow-y-auto rounded-lg border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
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
                            isSelected
                              ? 'bg-brand-surfaceLight'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="p-2">
                            <input type="radio" checked={isSelected} readOnly />
                          </td>
                          <td className="p-2 font-mono">{card.masked_card}</td>
                          <td className="p-2">{card.cardholder_name}</td>
                          <td className="p-2">{card.cardholder_nick_name || '—'}</td>
                          <td className="p-2">{card.external_inst_name || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT */}
            <div className="w-full xl:w-[480px] flex flex-col gap-4">
              {selectedCard ? (
                <>
                  <OtherCardPreview card={selectedCard} fullWidth />

<div className="bg-white rounded-xl shadow-md border border-blue-100 px-4 py-3">
                    <MetaRow label="Bank" value={selectedCard.external_inst_name} />
                    <MetaRow label="Card number" value={selectedCard.masked_card} />
                    <MetaRow label="Cardholder" value={selectedCard.cardholder_name} />
                    <MetaRow label="Nickname" value={selectedCard.cardholder_nick_name} />
                    <MetaRow
                      label="Status"
                      value={selectedCard.status === 1 ? 'Active' : 'Inactive'}
                    />
                    <MetaRow label="Created on" value={selectedCard.created_on} />
                    {/* <MetaRow label="Last modified" value={selectedCard.updated_on} /> */}

                    <div className="pt-4 mt-4 border-t flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(`/customer/other-cards/view/${selectedCard.id}`, {
                            state: { row: selectedCard },
                          })
                        }
                      >
                        View
                      </Button>
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
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                  <p className="text-gray-500">Select a card to see preview.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default CardBeneficiaryList
