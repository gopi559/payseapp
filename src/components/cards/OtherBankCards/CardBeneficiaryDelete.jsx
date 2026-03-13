import React, { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { HiExclamationTriangle } from 'react-icons/hi2'
import PageContainer from '../../../Reusable/PageContainer'
import Button from '../../../Reusable/Button'
import fetchWithRefreshToken from '../../../services/fetchWithRefreshToken'
import { BENIFICIARY_DELETE } from '../../../utils/constant'
import { formatTableDateTime } from '../../../utils/formatDate'
import THEME_COLORS from '../../../theme/colors'

const KeyValueRow = ({ label, value, t }) => (
  <div className="grid grid-cols-[minmax(140px,auto)_1fr] gap-4 items-center py-3 border-b border-gray-200 last:border-0 min-w-0">
    <span className="text-sm text-gray-600 shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-800 text-right break-words min-w-0">{value ?? t('not_available')}</span>
  </div>
)

const CardBeneficiaryDelete = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const contentCard = THEME_COLORS.contentCard
  const { id } = useParams()
  const location = useLocation()
  const row = location.state?.row ?? null
  const [loading, setLoading] = useState(false)

  const formatDate = (d) => formatTableDateTime(d)
  const displayData = row
    ? [
        { label: t('masked_card'), value: row.masked_card },
        { label: t('cardholder_name'), value: row.cardholder_name },
        { label: t('nickname'), value: row.cardholder_nick_name || t('not_available') },
        { label: t('added_on'), value: formatDate(row.created_on) },
        { label: t('last_modified'), value: formatDate(row.last_modified_on) },
      ]
    : []

  const handleDelete = async () => {
    if (!id) return
    setLoading(true)
    try {
      const response = await fetchWithRefreshToken(BENIFICIARY_DELETE, {
        method: 'POST',
        body: JSON.stringify({ card_beneficiary_id: Number(id) }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.code !== 1) {
        throw new Error(result?.message || t('failed_to_remove_beneficiary'))
      }
      toast.success(result?.message || t('beneficiary_removed'))
      navigate('/customer/other-cards')
    } catch (err) {
      toast.error(err?.message || t('failed_to_remove_beneficiary'))
    } finally {
      setLoading(false)
    }
  }

  if (!id) {
    return (
      <PageContainer>
        <div className="px-4 py-6 min-h-full">
          <p style={{ color: contentCard.subtitle }}>{t('invalid_beneficiary')}</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/customer/other-cards')}>
            {t('back')}
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="min-h-full px-4 py-6 overflow-x-hidden flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold" style={{ color: contentCard.title }}>{t('remove_card_beneficiary')}</h2>
            <Button type="button" variant="outline" onClick={() => navigate('/customer/other-cards')}>
              {t('back')}
            </Button>
          </div>

          <div
            className="w-full p-6 rounded-lg shadow-sm overflow-hidden"
            style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
          >
            <p className="text-sm mb-4" style={{ color: contentCard.subtitle }}>{t('review_beneficiary_before_removing')}</p>
            {displayData.length > 0 && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 min-w-0">
                {displayData.map(({ label, value }) => (
                  <KeyValueRow key={label} label={label} value={value} t={t} />
                ))}
              </div>
            )}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-red-50 border border-red-100">
              <HiExclamationTriangle className="w-8 h-8 text-red-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium text-gray-800">
                  {t('remove_beneficiary_confirm', { value: row?.masked_card ?? `ID ${id}` })}
                </p>
                {row?.cardholder_name && <p className="text-sm text-gray-600 mt-1">{row.cardholder_name}</p>}
                <p className="text-sm text-gray-500 mt-2">{t('this_action_cannot_be_undone')}</p>
              </div>
            </div>
            <div className="flex flex-row mt-7 gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/customer/other-cards')}>
                {t('cancel')}
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
              >
                {loading ? t('removing') : t('remove')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default CardBeneficiaryDelete
