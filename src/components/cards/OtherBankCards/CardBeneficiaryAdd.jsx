import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { HiCreditCard } from 'react-icons/hi2'
import PageContainer from '../../../Reusable/PageContainer'
import Button from '../../../Reusable/Button'
import fetchWithRefreshToken from '../../../services/fetchWithRefreshToken'
import { BENIFICIARY_ADD } from '../../../utils/constant'
import THEME_COLORS from '../../../theme/colors'

const CardBeneficiaryAdd = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const contentCard = THEME_COLORS.contentCard
  const [cardNumber, setCardNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    const cardNum = cardNumber.trim().replace(/\s/g, '')
    if (!cardNum) e.cardNumber = t('required')
    else if (!/^\d{16}$/.test(cardNum)) e.cardNumber = t('must_be_16_digits')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error(t('please_fill_required_fields'))
      return
    }

    const cardNum = cardNumber.trim().replace(/\s/g, '')
    setLoading(true)
    try {
      const response = await fetchWithRefreshToken(BENIFICIARY_ADD, {
        method: 'POST',
        body: JSON.stringify({
          card_number: cardNum,
          cardholder_name: '',
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.code !== 1) {
        throw new Error(result?.message || t('failed_to_add_beneficiary'))
      }
      toast.success(result?.message || t('beneficiary_added'))
      navigate('/customer/other-cards')
    } catch (err) {
      toast.error(err?.message || t('failed_to_add_beneficiary'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="min-h-full px-4 py-6 overflow-x-hidden">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: contentCard.iconBackground }}>
              <HiCreditCard className="w-6 h-6" style={{ color: contentCard.iconColor }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: contentCard.title }}>{t('add_card_beneficiary')}</h2>
              <p className="text-sm" style={{ color: contentCard.subtitle }}>{t('add_other_bank_card_as_beneficiary')}</p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => navigate('/customer/other-cards')}>
            {t('back_to_list')}
          </Button>
        </div>

        <div
          className="max-w-2xl p-6 rounded-lg shadow-sm overflow-hidden"
          style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 gap-6 w-full min-w-0">
              <div className="min-w-0">
                <label className="block font-medium mb-1.5 text-gray-700">{t('card_number_16_digits_required_label')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                    setCardNumber(v)
                    if (errors.cardNumber) setErrors({ ...errors, cardNumber: null })
                  }}
                  placeholder={t('card_number_16_digits_placeholder')}
                  className={`w-full border border-gray-300 p-2 rounded outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-gray-800 min-w-0 ${errors.cardNumber ? 'border-red-500' : ''}`}
                />
                {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
              </div>
            </div>
            <div className="flex flex-row mt-7 gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? t('submitting') : t('submit')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/customer/other-cards')}>
                {t('cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  )
}

export default CardBeneficiaryAdd
