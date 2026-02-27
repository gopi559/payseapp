import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import MobileInput from '../../Reusable/MobileInput'
import Button from '../../Reusable/Button'
import THEME_COLORS from '../../theme/colors'
import requestMoneyService from './requestMoney.service'
import { getCustomerId, normalizeMobile } from './requestMoney.utils'

const RequestStart = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const contentCard = THEME_COLORS.contentCard

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
      toast.error('Please enter a valid mobile number')
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
        toast.error('You cannot request money from yourself')
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
      toast.error(error?.message || 'Validation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-semibold" style={{ color: contentCard.title }}>
          Request Money
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
            Receive Requests
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
            Requested Money
          </button>
        </div>

        <div className="space-y-4">
          <MobileInput
            label="Beneficiary Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="e.g. 998877665"
          />

          <Button
            type="button"
            fullWidth
            onClick={handleContinue}
            disabled={loading}
          >
            {loading ? 'Validating...' : 'Continue'}
          </Button>
        </div>

        <p className="text-sm" style={{ color: contentCard.subtitle }}>
          Enter recipient mobile number and continue.
        </p>
      </div>
    </PageContainer>
  )
}

export default RequestStart
