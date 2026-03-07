import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBriefcase, FiMapPin, FiUser } from 'react-icons/fi'
import Button from '../../Reusable/Button'
import PageContainer from '../../Reusable/PageContainer'
import ProfileCard from '../../Reusable/ProfileCard'
import profileService from './profile.service'

const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A'
  const text = String(value).trim()
  return text ? text : 'N/A'
}

const formatDate = (value) => {
  if (!value || value === '0001-01-01T00:00:00Z') return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const DetailGrid = ({ items }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-gray-200 bg-white p-3 transition hover:shadow-sm"
        >
          <p className="text-xs font-medium text-gray-500">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 break-words">
            {formatValue(item.value)}
          </p>
        </div>
      ))}
    </div>
  )
}

const ProfileDetails = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({ kyc: {}, occupation: {}, address: [] })
  const [error, setError] = useState('')

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
        setError(err?.message || 'Unable to load profile details')
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
      { label: 'First Name', value: kyc.UserFName },
      { label: 'Last Name', value: kyc.UserLName },
      { label: 'DOB', value: formatDate(kyc.DOB) },
      { label: 'Email', value: kyc.Email },
      { label: 'Marital Status', value: kyc.MaritalStatus },
      { label: 'Nationality', value: kyc.NationalityName },
      { label: 'Gender', value: kyc.GenderName },
      { label: 'Religion', value: kyc.ReligionName },
      { label: 'Qualification', value: kyc.QualificationName },
      { label: 'Income', value: kyc.AnnualIncomeDesc },
      { label: 'Net Worth', value: kyc.NetWorthDesc },
      { label: 'Place of Birth', value: kyc.PlaceOfBirthName },
      { label: 'Account Purpose', value: kyc.AccountPurposeName },
      { label: 'Emergency Number', value: kyc.EmergencyNumber },
    ]
  }, [profileData.kyc])

  const occupationItems = useMemo(() => {
    const occupation = profileData.occupation || {}
    return [
      { label: 'Occupation Name', value: occupation.occupation_name },
      { label: 'Employer Name', value: occupation.employer_name },
      { label: 'Designation', value: occupation.designation },
      { label: 'Source of Fund', value: occupation.source_of_fund },
      { label: 'Monthly Income', value: occupation.momthly_income },
      { label: 'Office Address', value: occupation.office_full_address },
      { label: 'Place of Posting', value: occupation.place_of_posting },
    ]
  }, [profileData.occupation])

  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl px-4 py-8">

        <div className="mb-8 flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Profile Details</h1>
            <p className="text-sm text-gray-500">
              Personal, occupation and address information
            </p>
          </div>

          <button
            onClick={() => navigate('/customer/profile')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Back
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border bg-white p-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
            <span className="ml-3 text-sm text-gray-600">Loading profile...</span>
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
                <h2 className="text-sm font-semibold text-gray-800">KYC Details</h2>
              </div>
              <DetailGrid items={kycItems} />
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FiBriefcase className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">Occupation Details</h2>
              </div>
              <DetailGrid items={occupationItems} />
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FiMapPin className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">Address Details</h2>
              </div>

              {profileData.address.length === 0 ? (
                <p className="text-sm text-gray-500">No address records found</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {profileData.address.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatValue(addr.address_type_name)}
                        </span>

                        <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          {formatValue(addr.address_proof_type_name)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700">
                        <p>{formatValue(addr.address_line)}</p>
                        <p>
                          {formatValue(addr.city_name)}, {formatValue(addr.state_name)}
                        </p>
                        <p>
                          {formatValue(addr.country_name)} - {formatValue(addr.postal_code)}
                        </p>
                        <p>{formatValue(addr.village_name)}</p>
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