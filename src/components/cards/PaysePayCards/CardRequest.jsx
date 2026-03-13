import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { HiCreditCard } from 'react-icons/hi2'
import PageContainer from '../../../Reusable/PageContainer'
import Button from '../../../Reusable/Button'
import fetchWithRefreshToken from '../../../services/fetchWithRefreshToken'
import { CARD_REQUEST_TYPE_LIST, CARD_REQUEST } from '../../../utils/constant'
import cardService from './card.service'

const REFERENCE_CARD_TYPES = [2, 3]

const CardRequest = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [types, setTypes] = useState([])
  const [cards, setCards] = useState([])
  const [requestType, setRequestType] = useState('')
  const [referenceCardId, setReferenceCardId] = useState('')
  const [nameOnCard, setNameOnCard] = useState('')
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingCards, setLoadingCards] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchCardRequestTypes = async () => {
      try {
        const response = await fetchWithRefreshToken(CARD_REQUEST_TYPE_LIST, {
          method: 'POST',
          body: JSON.stringify({}),
        })

        if (!response.ok) throw new Error(t('failed_to_load_card_request_types'))

        const res = await response.json().catch(() => null)
        if (res?.code === 1 && res?.data) setTypes(res.data)
      } catch {
        toast.error(t('failed_to_load_card_request_types'))
      }
    }

    fetchCardRequestTypes()
  }, [t])

  useEffect(() => {
    const fetchCards = async () => {
      setLoadingCards(true)
      try {
        const { data } = await cardService.getList({ page: 1, num_data: 100 })
        setCards(Array.isArray(data) ? data : [])
      } catch {
        setCards([])
      } finally {
        setLoadingCards(false)
      }
    }

    fetchCards()
  }, [])

  const needsReferenceCard = REFERENCE_CARD_TYPES.includes(Number(requestType))

  useEffect(() => {
    if (!needsReferenceCard) setReferenceCardId('')
  }, [needsReferenceCard])

  const validateForm = () => {
    const newErrors = {}

    if (!requestType) newErrors.requestType = t('required')
    if (!nameOnCard) newErrors.nameOnCard = t('required')
    if (needsReferenceCard && !referenceCardId) newErrors.referenceCardId = t('required')

    if (Object.keys(newErrors).length) toast.error(t('please_fill_mandatory_fields'))

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const body = {
        request_type: Number(requestType),
        name_on_card: nameOnCard.trim(),
        remarks,
        reference_card: needsReferenceCard ? Number(referenceCardId) : undefined,
      }

      const response = await fetchWithRefreshToken(CARD_REQUEST, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const res = await response.json().catch(() => null)
      if (!response.ok) throw new Error(t('request_failed'))
      if (res?.code !== 1) throw new Error(t('request_failed'))

      toast.success(t('card_request_processed_successfully'))

      setTimeout(() => navigate('/customer/cards'), 800)
    } catch {
      toast.error(t('request_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="px-4 py-6 w-full flex flex-col gap-4">

        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <HiCreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{t('card_request')}</h2>
            <p className="text-sm text-gray-500">{t('request_new_or_replacement_card')}</p>
          </div>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm p-6">
          <div className="max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('request_type')}</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm ${
                  errors.requestType ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">{t('select_request_type')}</option>
                {types.map((requestTypeItem) => (
                  <option key={requestTypeItem.id} value={requestTypeItem.id}>{requestTypeItem.request_type}</option>
                ))}
              </select>
            </div>

            {needsReferenceCard && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('reference_card')}</label>
                <select
                  value={referenceCardId}
                  onChange={(e) => setReferenceCardId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm"
                  disabled={loadingCards}
                >
                  <option value="">{loadingCards ? t('loading') : t('select_card')}</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.masked_card} - {card.name_on_card}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('name_on_card')}</label>
              <input
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('remarks')}</label>
              <textarea
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? t('submitting') : t('submit')}
            </Button>
            <Button onClick={() => navigate('/customer/cards')}>{t('back')}</Button>
          </div>

        </div>
      </div>
    </PageContainer>
  )
}

export default CardRequest
