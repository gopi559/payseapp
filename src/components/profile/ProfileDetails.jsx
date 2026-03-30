import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiBriefcase, FiMapPin, FiUser } from 'react-icons/fi'
import PageContainer from '../../Reusable/PageContainer'
import profileService from './profile.service'

const formatValue = (value, fallback) => {
  if (value === null || value === undefined) return fallback
  const text = String(value).trim()
  return text ? text : fallback
}

const formatDate = (value, locale, fallback) => {
  if (!value || value === '0001-01-01T00:00:00Z') return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getProfileValueTranslationKey = (value) => {
  if (value === null || value === undefined) return null

  const normalizedValue = String(value).trim().toLowerCase()

  const valueMap = {
    single: 'profile_value_single',
    married: 'profile_value_married',
    afghan: 'profile_value_afghan',
    male: 'profile_value_male',
    female: 'profile_value_female',
    hinduism: 'profile_value_hinduism',
    islam: 'profile_value_islam',
    "bachelor's degree": 'profile_value_bachelors_degree',
    'low annual income': 'profile_value_low_annual_income',
    'low net worth group': 'profile_value_low_net_worth_group',
    kabul: 'profile_value_kabul',
    'personal use': 'profile_value_personal_use',
    'government employee': 'profile_value_government_employee',
    'business income': 'profile_value_business_income',
    'permanent address': 'profile_value_permanent_address',
    official: 'profile_value_official_address',
    'same as ekyc doc': 'profile_value_same_as_ekyc_doc',
  }

  return valueMap[normalizedValue] ?? null
}

const translateProfileValue = (value, t, fallback) => {
  const formattedValue = formatValue(value, fallback)
  if (formattedValue === fallback) return fallback

  const translationKey = getProfileValueTranslationKey(formattedValue)
  return translationKey ? t(translationKey, { defaultValue: formattedValue }) : formattedValue
}

const DetailGrid = ({ items, fallback }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-gray-200 bg-white p-3 transition hover:shadow-sm"
        >
          <p className="text-xs font-medium text-gray-500">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 break-words">
            {formatValue(item.value, fallback)}
          </p>
        </div>
      ))}
    </div>
  )
}

const ProfileDetails = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({ kyc: {}, occupation: {}, address: [] })
  const [error, setError] = useState('')
  const notAvailable = t('not_available')

  useEffect(() => {
    let isMounted = true

    const fetchPersonalDetails = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await profileService.getPersonalInformationList()

        if (!isMounted) return

        setProfileData({
          kyc: data?.kyc ?? {},
          occupation: data?.occupation ?? {},
          address: Array.isArray(data?.address) ? data.address : [],
        })
      } catch (err) {
        if (!isMounted) return
        setError(err?.message || t('profile_unable_to_load_details'))
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPersonalDetails()

    return () => {
      isMounted = false
    }
  }, [])

  const kycItems = useMemo(() => {
    const kyc = profileData.kyc || {}
    return [
      { label: t('profile_first_name'), value: kyc.UserFName },
      { label: t('profile_last_name'), value: kyc.UserLName },
      { label: t('profile_dob'), value: formatDate(kyc.DOB, i18n.language, notAvailable) },
      { label: t('profile_email'), value: kyc.Email },
      { label: t('profile_marital_status'), value: translateProfileValue(kyc.MaritalStatus, t, notAvailable) },
      { label: t('profile_nationality'), value: translateProfileValue(kyc.NationalityName, t, notAvailable) },
      { label: t('profile_gender'), value: translateProfileValue(kyc.GenderName, t, notAvailable) },
      { label: t('profile_religion'), value: translateProfileValue(kyc.ReligionName, t, notAvailable) },
      { label: t('profile_qualification'), value: translateProfileValue(kyc.QualificationName, t, notAvailable) },
      { label: t('profile_income'), value: translateProfileValue(kyc.AnnualIncomeDesc, t, notAvailable) },
      { label: t('profile_net_worth'), value: translateProfileValue(kyc.NetWorthDesc, t, notAvailable) },
      { label: t('profile_place_of_birth'), value: translateProfileValue(kyc.PlaceOfBirthName, t, notAvailable) },
      { label: t('profile_account_purpose'), value: translateProfileValue(kyc.AccountPurposeName, t, notAvailable) },
      { label: t('profile_emergency_number'), value: kyc.EmergencyNumber },
    ]
  }, [i18n.language, notAvailable, profileData.kyc, t])

  const occupationItems = useMemo(() => {
    const occupation = profileData.occupation || {}
    return [
      { label: t('profile_occupation_name'), value: translateProfileValue(occupation.occupation_name, t, notAvailable) },
      { label: t('profile_employer_name'), value: occupation.employer_name },
      { label: t('profile_designation'), value: occupation.designation },
      { label: t('profile_source_of_fund'), value: translateProfileValue(occupation.source_of_fund, t, notAvailable) },
      { label: t('profile_monthly_income'), value: occupation.momthly_income },
      { label: t('profile_office_address'), value: occupation.office_full_address },
      { label: t('profile_place_of_posting'), value: occupation.place_of_posting },
    ]
  }, [profileData.occupation, t])

  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl px-4 py-8">

        <div className="mb-8 flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{t('profile_details')}</h1>
            <p className="text-sm text-gray-500">
              {t('profile_personal_occupation_address_information')}
            </p>
          </div>

          <button
            onClick={() => navigate('/customer/profile')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            {t('back')}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border bg-white p-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
            <span className="ml-3 text-sm text-gray-600">{t('profile_loading')}</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <div className="space-y-6">

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FiUser className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">{t('profile_kyc_details')}</h2>
              </div>
              <DetailGrid items={kycItems} fallback={notAvailable} />
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FiBriefcase className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">
                  {t('profile_occupation_details')}
                </h2>
              </div>
              <DetailGrid items={occupationItems} fallback={notAvailable} />
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FiMapPin className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">
                  {t('profile_address_details')}
                </h2>
              </div>

              {profileData.address.length === 0 ? (
                <p className="text-sm text-gray-500">{t('profile_no_address_records_found')}</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {profileData.address.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          {translateProfileValue(addr.address_type_name, t, notAvailable)}
                        </span>

                        <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          {translateProfileValue(addr.address_proof_type_name, t, notAvailable)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700">
                        <p>{formatValue(addr.address_line, notAvailable)}</p>
                        <p>
                          {formatValue(addr.city_name, notAvailable)},{' '}
                          {formatValue(addr.state_name, notAvailable)}
                        </p>
                        <p>
                          {translateProfileValue(addr.country_name, t, notAvailable)} -{' '}
                          {formatValue(addr.postal_code, notAvailable)}
                        </p>
                        <p>{formatValue(addr.village_name, notAvailable)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default ProfileDetails
