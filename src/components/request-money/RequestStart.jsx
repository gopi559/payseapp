import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import MobileInput from '../../Reusable/MobileInput'
import THEME_COLORS from '../../theme/colors'
import requestMoneyService from './requestMoney.service'
import { getCustomerId, normalizeMobile } from './requestMoney.utils'

const RequestStart = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const contentCard = THEME_COLORS.contentCard
  const menuGreen = THEME_COLORS.header.background
  const menuGreenHover = THEME_COLORS.sidebar.logoutHoverBackground

  const currentUserId = getCustomerId(user)
  const currentUserMobile = normalizeMobile(
    user?.reg_info?.mobile ?? user?.reg_info?.reg_mobile ?? user?.mobile ?? ''
  )

  const [mobile, setMobile] = useState('+93')
  const [loading, setLoading] = useState(false)

  const cleanedMobile = useMemo(() => normalizeMobile(mobile), [mobile])
  const digitCount = useMemo(() => cleanedMobile.replace(/\D/g, '').length, [cleanedMobile])

  const handleContinue = async () => {
    if (digitCount !== 11) {
      toast.error(t('please_enter_valid_mobile_number'))
      return
    }

    setLoading(true)
    try {
      const { data } = await requestMoneyService.validateBeneficiary(cleanedMobile)
      const beneficiaryId = data?.user_id
      const beneficiaryMobile = normalizeMobile(data?.reg_mobile || cleanedMobile)

      if (
        Number(beneficiaryId) === Number(currentUserId) ||
        beneficiaryMobile === currentUserMobile
      ) {
        toast.error(t('cannot_request_money_from_yourself'))
        return
      }

      const beneficiaryName =
        [data?.first_name, data?.middle_name, data?.last_name]
          .filter(Boolean)
          .join(' ')
          .trim() || beneficiaryMobile

      navigate('/customer/request-money/amount', {
        state: {
          beneficiary: {
            user_id: beneficiaryId,
            reg_mobile: beneficiaryMobile,
            name: beneficiaryName,
          },
        },
      })
    } catch (error) {
      toast.error(error?.message || t('validation_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileScreenContainer>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-semibold" style={{ color: contentCard.title }}>
          {t('request_money')}
        </h1>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate('/customer/request-money/received')}
            className="h-10 px-3 rounded-md text-sm font-medium"
            style={{
              backgroundColor: contentCard.background,
              border: `1px solid ${contentCard.border}`,
              color: contentCard.title,
            }}
          >
            {t('receive_requests')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/customer/request-money/my')}
            className="h-10 px-3 rounded-md text-sm font-medium"
            style={{
              backgroundColor: contentCard.background,
              border: `1px solid ${contentCard.border}`,
              color: contentCard.title,
            }}
          >
            {t('requested_money')}
          </button>
        </div>

        <div className="space-y-4">
          <MobileInput
            label={t('beneficiary_mobile_number')}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="e.g. 998877665"
          />

          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            style={{ backgroundColor: menuGreen, color: THEME_COLORS.common.white }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = menuGreenHover
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = menuGreen
            }}
          >
            {loading ? t('validating') : t('continue')}
          </button>
        </div>

        <p className="text-sm" style={{ color: contentCard.subtitle }}>
          {t('enter_recipient_mobile_and_continue')}
        </p>
      </div>
    </MobileScreenContainer>
  )
}

export default RequestStart
