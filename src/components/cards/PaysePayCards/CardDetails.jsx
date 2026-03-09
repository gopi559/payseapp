import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../../Reusable/PageContainer'
import Button from '../../../Reusable/Button'
import cardService from './card.service'

const DetailRow = ({ label, value, emptyValue }) => (
  <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
    <span className="text-xs sm:text-sm text-gray-600 shrink-0">{label}</span>
    <span className="text-sm sm:text-base font-medium text-brand-dark text-right break-all">
      {value != null && value !== '' ? String(value) : emptyValue}
    </span>
  </div>
)

const CardDetails = () => {
  const { t, i18n } = useTranslation()
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
        if (!cancelled) setError(err?.message || t('failed_to_load_card_details'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, t])

  if (!id) {
    return (
      <PageContainer>
        <div className="px-4 py-6">
          <p className="text-gray-600">{t('no_card_selected')}</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/customer/cards')}>
            {t('back_to_cards')}
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">{t('card_details')}</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <p className="text-gray-600">{t('loading_card')}</p>
        ) : card && typeof card === 'object' ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h3 className="font-semibold text-brand-dark mb-4">{t('card_info')}</h3>
            <div className="space-y-0">
              <DetailRow label={t('name_on_card')} value={card.name_on_card} emptyValue={t('not_available')} />
              <DetailRow label={t('card_number')} value={card.masked_card} emptyValue={t('not_available')} />
              <DetailRow
                label={t('expiry')}
                value={card.expiry_on ? new Date(card.expiry_on).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-GB', { month: '2-digit', year: 'numeric', day: '2-digit' }) : null}
                emptyValue={t('not_available')}
              />
              <DetailRow label={t('status')} value={card.card_status_name} emptyValue={t('not_available')} />
              <DetailRow label={t('auth_status')} value={card.auth_status} emptyValue={t('not_available')} />
              {card.card_type_nature != null && card.card_type_nature !== '' && (
                <DetailRow label={t('card_type')} value={card.card_type_nature} emptyValue={t('not_available')} />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600">{t('no_card_details_available')}</p>
          </div>
        )}
        <Button
          variant="outline"
          fullWidth
          size="md"
          onClick={() => navigate('/customer/cards')}
          className="mt-4"
        >
          {t('back_to_cards')}
        </Button>
      </div>
    </PageContainer>
  )
}

export default CardDetails
