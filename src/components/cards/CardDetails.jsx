import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import { cardService } from '../cards/card.service'
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
    <span className="text-xs sm:text-sm text-gray-600 shrink-0">{label}</span>
    <span className="text-sm sm:text-base font-medium text-brand-dark text-right break-all">
      {value != null && value !== '' ? String(value) : '—'}
    </span>
  </div>
)

const CardDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const { data } = await cardService.getCard(id)
        if (!cancelled) setCard(data)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load card details')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  if (!id) {
    return (
      <PageContainer>
        <div className="px-4 py-6">
          <p className="text-gray-600">No card selected.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/customer/cards')}>
            Back to Cards
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Card Details</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <p className="text-gray-600">Loading card...</p>
        ) : card && typeof card === 'object' ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h3 className="font-semibold text-brand-dark mb-4">Card info</h3>
            <div className="space-y-0">
              <DetailRow label="Name on card" value={card.name_on_card} />
              <DetailRow label="Card number" value={card.masked_card} />
              <DetailRow
                label="Expiry"
                value={card.expiry_on ? new Date(card.expiry_on).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric', day: '2-digit' }) : null}
              />
              <DetailRow label="Status" value={card.card_status_name} />
              <DetailRow label="Auth status" value={card.auth_status} />
              {card.card_type_nature != null && card.card_type_nature !== '' && (
                <DetailRow label="Card type" value={card.card_type_nature} />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600">No details available for this card.</p>
          </div>
        )}
        <Button
          variant="outline"
          fullWidth
          size="md"
          onClick={() => navigate('/customer/cards')}
          className="mt-4"
        >
          Back to Cards
        </Button>
      </div>
    </PageContainer>
  )
}

export default CardDetails
