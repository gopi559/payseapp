import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiSearch } from 'react-icons/fi'
import { IoChevronForward } from 'react-icons/io5'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import requestMoneyService from './requestMoney.service'
import { getCustomerId, normalizeMobile } from './requestMoney.utils'

const COUNTRY_CODE = '+93'

const RequestStart = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)

  const currentUserId = getCustomerId(user)
  const currentUserMobile = normalizeMobile(
    user?.reg_info?.mobile ?? user?.reg_info?.reg_mobile ?? user?.mobile ?? ''
  )

  const [mobile, setMobile] = useState(COUNTRY_CODE)
  const [loading, setLoading] = useState(false)

  const cleanedMobile = useMemo(() => normalizeMobile(mobile), [mobile])
  const digitCount = useMemo(() => cleanedMobile.replace(/\D/g, '').length, [cleanedMobile])

  const handleChange = (e) => {
    let value = e.target.value

    if (!value.startsWith(COUNTRY_CODE)) {
      value = COUNTRY_CODE
    }

    const digitsOnly = value.slice(COUNTRY_CODE.length).replace(/\D/g, '')
    const limitedDigits = digitsOnly.slice(0, 9)

    setMobile(COUNTRY_CODE + limitedDigits)
  }

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
      <div className="h-screen bg-[#dff3e8] flex justify-start">
        <div className="w-full max-w-md mx-auto px-5 pt-10">

          <div className="flex justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => navigate('/customer/request-money/received')}
              className="h-10 px-5 rounded-full bg-[#cdeedc] text-[16px] font-semibold"
            >
              Receive Requests
            </button>
            <button
              type="button"
              onClick={() => navigate('/customer/request-money/my')}
              className="h-10 px-5 rounded-full bg-[#cdeedc] text-[16px] font-semibold"
            >
              Requested Money
            </button>
          </div>

          <div className="rounded-2xl border-[3px] border-emerald-500 bg-white/60 h-16 flex items-center px-4 gap-3">
            <FiSearch size={30} className="text-emerald-500" />
            <input
              type="tel"
              value={mobile}
              onChange={handleChange}
              className="flex-1 bg-transparent outline-none text-[20px] text-emerald-600"
            />
            <button
              type="button"
              onClick={handleContinue}
              disabled={loading}
              className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center disabled:opacity-70"
            >
              <IoChevronForward size={22} />
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Enter Recipient Mobile Number And Continue.
          </p>

        </div>
      </div>
    </PageContainer>
  )
}

export default RequestStart